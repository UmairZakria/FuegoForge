"use client";

import { useEffect, useRef, useState } from "react";

const SIM_W = 128;
const SIM_H = 128;
const DAMPING = 0.935;

// Module-level image cache so re-hovering any editorial image is instant
const imageCache = new Map();

function getCorsSafeUrl(src) {
  if (!src) return "";
  if (src.startsWith("/") || src.startsWith("data:") || src.startsWith("blob:")) {
    return src;
  }
  try {
    const parsed = new URL(src);
    if (typeof window !== "undefined" && parsed.origin === window.location.origin) {
      return src;
    }
    // Unsplash natively supports CORS with crossOrigin="anonymous"
    if (parsed.hostname.includes("unsplash.com")) {
      return src;
    }
    const optimized = src.replace("/il_fullxfull.", "/il_1080xN.");
    return `https://wsrv.nl/?url=${encodeURIComponent(optimized)}&output=webp&q=90`;
  } catch {
    return src;
  }
}

function loadCorsImage(url) {
  if (imageCache.has(url)) {
    return Promise.resolve(imageCache.get(url));
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.decoding = "async";
    img.onload = () => {
      imageCache.set(url, img);
      resolve(img);
    };
    img.onerror = (err) => reject(err);
    img.src = url;
  });
}

const VERT_SRC = `
  attribute vec2 a_pos;
  varying vec2 v_uv;
  void main() {
    v_uv = a_pos * 0.5 + 0.5;
    gl_Position = vec4(a_pos, 0.0, 1.0);
  }
`;

const FRAG_SRC = `
  precision highp float;
  varying vec2 v_uv;

  uniform sampler2D u_image;
  uniform sampler2D u_waveTex;
  uniform vec2 u_texel;
  uniform float u_imgAspect;
  uniform float u_contAspect;
  uniform float u_strength;
  uniform vec2 u_objPos;

  vec2 getCoverUv(vec2 uv, float imgAspect, float contAspect, vec2 objPos) {
    vec2 s = vec2(1.0);
    if (contAspect > imgAspect) {
      s.y = imgAspect / contAspect;
    } else {
      s.x = contAspect / imgAspect;
    }
    return uv * s + (1.0 - s) * objPos;
  }

  // 9-tap Gaussian kernel for silky-smooth liquid normals (matches FluidCursorCanvas)
  float sampleHeight(vec2 uv) {
    vec2 tx = vec2(u_texel.x, 0.0);
    vec2 ty = vec2(0.0, u_texel.y);
    float c = texture2D(u_waveTex, uv).r * 4.0;
    float n = (texture2D(u_waveTex, uv + tx).r + texture2D(u_waveTex, uv - tx).r +
               texture2D(u_waveTex, uv + ty).r + texture2D(u_waveTex, uv - ty).r) * 2.0;
    float d = (texture2D(u_waveTex, uv + tx + ty).r + texture2D(u_waveTex, uv - tx + ty).r +
               texture2D(u_waveTex, uv + tx - ty).r + texture2D(u_waveTex, uv - tx - ty).r);
    return (c + n + d) / 16.0;
  }

  void main() {
    // Screen-space UV (top-left origin)
    vec2 uv = vec2(v_uv.x, 1.0 - v_uv.y);

    vec2 stepX = vec2(u_texel.x, 0.0);
    vec2 stepY = vec2(0.0, u_texel.y);

    float hL = sampleHeight(uv - stepX);
    float hR = sampleHeight(uv + stepX);
    float hD = sampleHeight(uv - stepY);
    float hU = sampleHeight(uv + stepY);

    vec2 grad = vec2(hR - hL, hU - hD);
    float slope = length(grad);

    vec2 baseUv = getCoverUv(uv, u_imgAspect, u_contAspect, u_objPos);

    // Subtle Lusion-style liquid refraction + chromatic RGB dispersion along wave crests
    vec2 refractOffset = grad * u_strength;
    vec2 uvR = clamp(baseUv + refractOffset * 1.22, 0.001, 0.999);
    vec2 uvG = clamp(baseUv + refractOffset, 0.001, 0.999);
    vec2 uvB = clamp(baseUv + refractOffset * 0.78, 0.001, 0.999);

    float r = texture2D(u_image, uvR).r;
    vec4 texG = texture2D(u_image, uvG);
    float b = texture2D(u_image, uvB).b;
    vec3 color = vec3(r, texG.g, b);

    // Delicate liquid-glass specular sheen catching the wave crests (masked by image alpha)
    vec3 normal = normalize(vec3(-grad * 7.0, 1.0));
    vec3 lightDir = normalize(vec3(0.42, -0.62, 0.66));
    float spec = pow(max(dot(normal, lightDir), 0.0), 22.0) * smoothstep(0.008, 0.065, slope);

    vec3 finalColor = color + vec3(1.0, 0.98, 0.96) * (spec * 0.22 * texG.a);
    gl_FragColor = vec4(finalColor, texG.a);
  }
`;

/**
 * Reusable Lusion-style liquid hover refraction for editorial images.
 * Lazily activates a WebGL wave simulation only while hovered & settling,
 * then releases GPU resources cleanly when still.
 */
export default function FluidHoverImage({
  src,
  alt = "",
  className = "w-full h-full object-cover",
  imgClassName = "",
  strength = 0.28,
  loading = "lazy",
  objectPosition = [0.5, 0.5],
  trackWindowPointer = false,
  imgProps = {},
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const simRef = useRef(null);
  const [active, setActive] = useState(false);
  const [canvasVisible, setCanvasVisible] = useState(false);
  const objX = objectPosition[0] ?? 0.5;
  const objY = objectPosition[1] ?? 0.5;

  // Optional window-level pointer tracking for background images behind foreground content (e.g., Hero)
  useEffect(() => {
    if (!trackWindowPointer || typeof window === "undefined") return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let inside = false;

    const handleWinMove = (e) => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const inBounds =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      if (inBounds) {
        if (!inside) {
          inside = true;
          setActive(true);
          simRef.current?.onEnter(e.clientX, e.clientY);
        } else {
          simRef.current?.onMove(e.clientX, e.clientY);
        }
      } else if (inside) {
        inside = false;
        simRef.current?.onLeave();
      }
    };

    const handleWinLeave = () => {
      if (inside) {
        inside = false;
        simRef.current?.onLeave();
      }
    };

    window.addEventListener("pointermove", handleWinMove, { passive: true });
    document.addEventListener("mouseleave", handleWinLeave, { passive: true });

    return () => {
      window.removeEventListener("pointermove", handleWinMove);
      document.removeEventListener("mouseleave", handleWinLeave);
    };
  }, [trackWindowPointer]);

  // Start WebGL wave simulation on hover, tear down cleanly once ripples settle
  useEffect(() => {
    if (!active) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: false,
      antialias: true,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: true,
      powerPreference: "high-performance",
    });
    if (!gl) return;
    gl.clearColor(0, 0, 0, 0);

    const compile = (type, source) => {
      const sh = gl.createShader(type);
      gl.shaderSource(sh, source);
      gl.compileShader(sh);
      return sh;
    };

    const vs = compile(gl.VERTEX_SHADER, VERT_SRC);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG_SRC);
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );
    const posLoc = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    // Wave heightfield texture (TEXTURE0)
    const waveTex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, waveTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // Editorial photo texture (TEXTURE1)
    const imgTex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, imgTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const uWaveLoc = gl.getUniformLocation(prog, "u_waveTex");
    const uImgLoc = gl.getUniformLocation(prog, "u_image");
    const uTexelLoc = gl.getUniformLocation(prog, "u_texel");
    const uImgAspectLoc = gl.getUniformLocation(prog, "u_imgAspect");
    const uContAspectLoc = gl.getUniformLocation(prog, "u_contAspect");
    const uStrengthLoc = gl.getUniformLocation(prog, "u_strength");
    const uObjPosLoc = gl.getUniformLocation(prog, "u_objPos");

    gl.uniform1i(uWaveLoc, 0);
    gl.uniform1i(uImgLoc, 1);
    gl.uniform2f(uTexelLoc, 1.0 / SIM_W, 1.0 / SIM_H);
    gl.uniform1f(uStrengthLoc, strength);
    gl.uniform2f(uObjPosLoc, objX, objY);

    // Double-buffered 2D water-surface wave simulation
    let prev = new Float32Array(SIM_W * SIM_H);
    let curr = new Float32Array(SIM_W * SIM_H);
    let next = new Float32Array(SIM_W * SIM_H);
    const pixels = new Uint8Array(SIM_W * SIM_H * 4);

    let imgLoaded = false;
    let isHovered = true;
    let disposed = false;
    let rafId = null;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(rect.width * dpr));
      const h = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, w, h);
      gl.uniform1f(uContAspectLoc, rect.width / Math.max(rect.height, 1));
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const addDisturbance = (gx, gy, radius, amount) => {
      const rCeil = Math.ceil(radius);
      const rSq = radius * radius;
      const minX = Math.max(2, Math.floor(gx - rCeil));
      const maxX = Math.min(SIM_W - 3, Math.ceil(gx + rCeil));
      const minY = Math.max(2, Math.floor(gy - rCeil));
      const maxY = Math.min(SIM_H - 3, Math.ceil(gy + rCeil));

      for (let y = minY; y <= maxY; y++) {
        const dy = y - gy;
        const row = y * SIM_W;
        for (let x = minX; x <= maxX; x++) {
          const dx = x - gx;
          const d2 = dx * dx + dy * dy;
          if (d2 < rSq) {
            const t = 1 - d2 / rSq;
            curr[row + x] = Math.max(-1.0, Math.min(1.0, curr[row + x] + amount * t * t * t));
          }
        }
      }
    };

    let lastGx = -1;
    let lastGy = -1;

    const wake = () => {
      if (disposed || rafId !== null) return;
      rafId = window.requestAnimationFrame(tick);
    };

    const onMove = (clientX, clientY) => {
      const rect = container.getBoundingClientRect();
      const nx = (clientX - rect.left) / Math.max(rect.width, 1);
      const ny = (clientY - rect.top) / Math.max(rect.height, 1);
      if (nx < 0 || nx > 1 || ny < 0 || ny > 1) return;

      const gx = nx * (SIM_W - 1);
      const gy = ny * (SIM_H - 1);

      if (lastGx >= 0) {
        const dx = gx - lastGx;
        const dy = gy - lastGy;
        const dist = Math.hypot(dx, dy);
        if (dist > 0.35) {
          const steps = Math.min(Math.ceil(dist / 1.4), 10);
          const force = Math.min(dist * 0.032, 0.28);
          for (let i = 1; i <= steps; i++) {
            const f = i / steps;
            addDisturbance(lastGx + dx * f, lastGy + dy * f, 4.2, force);
          }
          wake();
        }
      } else {
        addDisturbance(gx, gy, 5.0, 0.16);
        wake();
      }
      lastGx = gx;
      lastGy = gy;
    };

    const onLeave = () => {
      isHovered = false;
      lastGx = -1;
      lastGy = -1;
    };

    const onEnter = (clientX, clientY) => {
      isHovered = true;
      lastGx = -1;
      lastGy = -1;
      onMove(clientX, clientY);
    };

    simRef.current = { onMove, onLeave, onEnter };

    const tick = () => {
      if (disposed) return;
      rafId = null;

      let maxEnergy = 0;

      // Isotropic 8-neighbor 2D physical water wave equation
      for (let y = 1; y < SIM_H - 1; y++) {
        const row = y * SIM_W;
        const up = row - SIM_W;
        const dn = row + SIM_W;
        for (let x = 1; x < SIM_W - 1; x++) {
          const idx = row + x;
          const cardinal = curr[idx - 1] + curr[idx + 1] + curr[up + x] + curr[dn + x];
          const diagonal =
            curr[up + x - 1] + curr[up + x + 1] + curr[dn + x - 1] + curr[dn + x + 1];
          const avg = cardinal * 0.2 + diagonal * 0.05;
          let val = (avg * 2.0 - prev[idx]) * DAMPING;
          if (val > -0.0005 && val < 0.0005) val = 0;
          next[idx] = val;
          const absV = val < 0 ? -val : val;
          if (absV > maxEnergy) maxEnergy = absV;
        }
      }

      const tmp = prev;
      prev = curr;
      curr = next;
      next = tmp;

      if (imgLoaded) {
        for (let i = 0; i < curr.length; i++) {
          const v = Math.max(0, Math.min(255, Math.round((curr[i] * 0.5 + 0.5) * 255)));
          const p = i * 4;
          pixels[p] = v;
          pixels[p + 1] = v;
          pixels[p + 2] = v;
          pixels[p + 3] = 255;
        }

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, waveTex);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          SIM_W,
          SIM_H,
          0,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          pixels
        );

        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }

      if (maxEnergy > 0.0018 || isHovered) {
        rafId = window.requestAnimationFrame(tick);
      } else {
        // Waves completely settled and pointer left -> release WebGL context cleanly
        setCanvasVisible(false);
        setActive(false);
      }
    };

    // Load CORS-safe image into TEXTURE1
    const corsUrl = getCorsSafeUrl(src);
    loadCorsImage(corsUrl)
      .then((img) => {
        if (disposed) return;
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, imgTex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.uniform1f(
          uImgAspectLoc,
          (img.naturalWidth || 1) / Math.max(img.naturalHeight || 1, 1)
        );
        imgLoaded = true;

        // Paint the very first neutral WebGL frame synchronously BEFORE showing the canvas
        for (let i = 0; i < curr.length; i++) {
          const v = Math.max(0, Math.min(255, Math.round((curr[i] * 0.5 + 0.5) * 255)));
          const p = i * 4;
          pixels[p] = v;
          pixels[p + 1] = v;
          pixels[p + 2] = v;
          pixels[p + 3] = 255;
        }
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, waveTex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, SIM_W, SIM_H, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        setCanvasVisible(true);
        wake();
      })
      .catch(() => {
        if (!disposed) {
          setCanvasVisible(false);
          setActive(false);
        }
      });

    return () => {
      disposed = true;
      simRef.current = null;
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      ro.disconnect();
      gl.deleteTexture(waveTex);
      gl.deleteTexture(imgTex);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [active, src, strength, objX, objY]);

  const handlePointerEnter = (e) => {
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    if (!active) {
      setActive(true);
    } else {
      simRef.current?.onEnter(e.clientX, e.clientY);
    }
  };

  const handlePointerMove = (e) => {
    simRef.current?.onMove(e.clientX, e.clientY);
  };

  const handlePointerLeave = () => {
    simRef.current?.onLeave();
  };

  return (
    <div
      ref={containerRef}
      onPointerEnter={trackWindowPointer ? undefined : handlePointerEnter}
      onPointerMove={trackWindowPointer ? undefined : handlePointerMove}
      onPointerLeave={trackWindowPointer ? undefined : handlePointerLeave}
      className={`relative overflow-hidden ${className}`}
    >
      <img
        src={src}
        alt={alt}
        loading={loading}
        decoding="async"
        className={`w-full h-full object-cover object-center ${imgClassName}`}
        {...imgProps}
      />
      {active && (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className={`absolute inset-0 w-full h-full block pointer-events-none transition-opacity duration-200 ${
            canvasVisible ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
    </div>
  );
}

