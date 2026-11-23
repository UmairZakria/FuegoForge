"use client";

import { useEffect, useRef, useState } from "react";

const SIM_W = 128;
const SIM_H = 128;
const DAMPING = 0.935;

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

  uniform sampler2D u_texA;
  uniform sampler2D u_texB;
  uniform sampler2D u_waveTex;
  uniform vec2 u_texel;
  uniform float u_aspectA;
  uniform float u_aspectB;
  uniform float u_contAspect;
  uniform float u_strength;
  uniform vec2 u_objPos;
  uniform float u_progress; // 0.0 = texA, 1.0 = texB
  uniform float u_gridRows; // number of big square rows

  vec2 getCoverUv(vec2 uv, float imgAspect, float contAspect, vec2 objPos) {
    vec2 s = vec2(1.0);
    if (contAspect > imgAspect) {
      s.y = imgAspect / contAspect;
    } else {
      s.x = contAspect / imgAspect;
    }
    return uv * s + (1.0 - s) * objPos;
  }

  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  // 9-tap Gaussian kernel for silky-smooth liquid normals
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
    vec2 uv = vec2(v_uv.x, 1.0 - v_uv.y);

    // Liquid surface slope
    vec2 stepX = vec2(u_texel.x, 0.0);
    vec2 stepY = vec2(0.0, u_texel.y);
    float hL = sampleHeight(uv - stepX);
    float hR = sampleHeight(uv + stepX);
    float hD = sampleHeight(uv - stepY);
    float hU = sampleHeight(uv + stepY);

    vec2 grad = vec2(hR - hL, hU - hD);
    float slope = length(grad);
    vec2 refractOffset = grad * u_strength;

    // Big square pixel grid (true 1:1 squares regardless of screen aspect ratio)
    vec2 gridSize = vec2(max(1.0, floor(u_gridRows * u_contAspect + 0.5)), u_gridRows);
    vec2 cellId = floor(uv * gridSize);
    vec2 cellCenterUv = (cellId + 0.5) / gridSize;

    // Organic diagonal sweep + per-square stagger
    float sweep = (cellId.x / gridSize.x) * 0.42 + (cellId.y / gridSize.y) * 0.22;
    float jitter = hash21(cellId) * 0.36;
    float delay = (sweep + jitter) * 0.56;

    // Local cell transition progress [0 -> 1]
    float localT = clamp((u_progress - delay) / 0.44, 0.0, 1.0);

    // Peak big-square pixelation right as each square flips
    float blockIntensity = sin(localT * 3.14159265);
    vec2 sampleUv = mix(uv, cellCenterUv, smoothstep(0.08, 0.65, blockIntensity));

    // Crisp square swap between Image A and Image B
    float swapMix = smoothstep(0.45, 0.55, localT);

    // Sample Image A directly
    vec2 baseUvA = getCoverUv(sampleUv, u_aspectA, u_contAspect, u_objPos);
    vec4 gSampleA = texture2D(u_texA, clamp(baseUvA + refractOffset, 0.001, 0.999));
    vec4 colA = vec4(
      texture2D(u_texA, clamp(baseUvA + refractOffset * 1.22, 0.001, 0.999)).r,
      gSampleA.g,
      texture2D(u_texA, clamp(baseUvA + refractOffset * 0.78, 0.001, 0.999)).b,
      gSampleA.a
    );

    // Sample Image B directly
    vec2 baseUvB = getCoverUv(sampleUv, u_aspectB, u_contAspect, u_objPos);
    vec4 gSampleB = texture2D(u_texB, clamp(baseUvB + refractOffset, 0.001, 0.999));
    vec4 colB = vec4(
      texture2D(u_texB, clamp(baseUvB + refractOffset * 1.22, 0.001, 0.999)).r,
      gSampleB.g,
      texture2D(u_texB, clamp(baseUvB + refractOffset * 0.78, 0.001, 0.999)).b,
      gSampleB.a
    );

    vec3 rgb = mix(colA.rgb, colB.rgb, swapMix);
    float alpha = mix(colA.a, colB.a, swapMix);

    // Subtle crisp edge glint on actively flipping big squares
    vec2 cellFract = fract(uv * gridSize);
    float border =
      step(0.94, max(cellFract.x, cellFract.y)) + step(min(cellFract.x, cellFract.y), 0.06);
    float activeEdge = clamp(border, 0.0, 1.0) * blockIntensity * 0.1 * alpha;

    // Delicate liquid-glass specular sheen on hover ripples
    vec3 normal = normalize(vec3(-grad * 7.0, 1.0));
    vec3 lightDir = normalize(vec3(0.42, -0.62, 0.66));
    float spec = pow(max(dot(normal, lightDir), 0.0), 22.0) * smoothstep(0.008, 0.065, slope);

    vec3 finalColor = rgb + vec3(1.0, 0.98, 0.96) * (spec * 0.22 * alpha + activeEdge);
    gl_FragColor = vec4(finalColor, alpha);
  }
`;

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

export default function HeroFluidSlideshow({
  images = ["/hero-editorial.webp", "/hero2_transparent.webp"],
  alt = "Fuego Forge Editorial Campaign Portrait",
  intervalMs = 5500,
  transitionMs = 1350,
  gridRows = 9,
  strength = 0.26,
  objectPosition = [0, 0.5],
  className = "w-full h-full",
  imgClassName = "",
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [webglReady, setWebglReady] = useState(false);
  const [fallbackIdx, setFallbackIdx] = useState(0);

  const objX = objectPosition[0] ?? 0;
  const objY = objectPosition[1] ?? 0.5;
  const src0 = images[0] || "";
  const src1 = images[1] || src0;

  // Fallback crossfade timer for mobile / reduced-motion / non-WebGL devices
  useEffect(() => {
    if (webglReady || images.length < 2) return;
    if (typeof window !== "undefined") {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    }
    const id = window.setInterval(() => {
      setFallbackIdx((prev) => (prev + 1) % images.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [webglReady, images.length, intervalMs]);

  // Desktop WebGL: Big Square Pixel Slideshow + Live Liquid Hover Refraction
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas || typeof window === "undefined") return;

    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      loadImage(src0)
        .then((img) => (img.decode ? img.decode().catch(() => {}) : undefined))
        .finally(() => {
          window.__ffHeroReady = true;
          window.dispatchEvent(new CustomEvent("ff:hero-ready"));
        });
      return;
    }

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
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        gl.deleteShader(sh);
        return null;
      }
      return sh;
    };

    const vs = compile(gl.VERTEX_SHADER, VERT_SRC);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG_SRC);
    if (!vs || !fs) return;

    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      gl.deleteProgram(prog);
      return;
    }
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

    const createTex = (unit) => {
      const t = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      return t;
    };

    const waveTex = createTex(0);
    const texA = createTex(1);
    const texB = createTex(2);

    const uWaveLoc = gl.getUniformLocation(prog, "u_waveTex");
    const uTexALoc = gl.getUniformLocation(prog, "u_texA");
    const uTexBLoc = gl.getUniformLocation(prog, "u_texB");
    const uTexelLoc = gl.getUniformLocation(prog, "u_texel");
    const uAspectALoc = gl.getUniformLocation(prog, "u_aspectA");
    const uAspectBLoc = gl.getUniformLocation(prog, "u_aspectB");
    const uContAspectLoc = gl.getUniformLocation(prog, "u_contAspect");
    const uStrengthLoc = gl.getUniformLocation(prog, "u_strength");
    const uObjPosLoc = gl.getUniformLocation(prog, "u_objPos");
    const uProgressLoc = gl.getUniformLocation(prog, "u_progress");
    const uGridRowsLoc = gl.getUniformLocation(prog, "u_gridRows");

    gl.uniform1i(uWaveLoc, 0);
    gl.uniform1i(uTexALoc, 1);
    gl.uniform1i(uTexBLoc, 2);
    gl.uniform2f(uTexelLoc, 1.0 / SIM_W, 1.0 / SIM_H);
    gl.uniform1f(uStrengthLoc, strength);
    gl.uniform2f(uObjPosLoc, objX, objY);
    gl.uniform1f(uGridRowsLoc, gridRows);
    gl.uniform1f(uProgressLoc, 0.0);

    let prev = new Float32Array(SIM_W * SIM_H);
    let curr = new Float32Array(SIM_W * SIM_H);
    let next = new Float32Array(SIM_W * SIM_H);
    const pixels = new Uint8Array(SIM_W * SIM_H * 4);
    for (let i = 0; i < SIM_W * SIM_H; i++) {
      const p = i * 4;
      pixels[p] = 128;
      pixels[p + 1] = 128;
      pixels[p + 2] = 128;
      pixels[p + 3] = 255;
    }

    let disposed = false;
    let ready = false;
    let rafId = null;

    // Transition state: cycles 0 -> 1 (image0 -> image1), then 1 -> 0 (image1 -> image0)
    let progress = 0;
    let targetProgress = 0;
    let transStart = 0;
    let transFrom = 0;
    let isTransitioning = false;

    const drawScene = () => {
      if (!ready || disposed) return;
      gl.uniform1f(uProgressLoc, progress);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, waveTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, SIM_W, SIM_H, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    const resize = () => {
      if (disposed) return;
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
      drawScene();
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

    const wake = () => {
      if (disposed || rafId !== null) return;
      rafId = window.requestAnimationFrame(tick);
    };

    const tick = (now) => {
      if (disposed) return;
      rafId = null;

      // 1. Advance big-square-pixel transition
      if (isTransitioning) {
        const rawT = Math.min((now - transStart) / transitionMs, 1.0);
        // Smooth cubic ease-in-out
        const eased = rawT < 0.5 ? 4 * rawT * rawT * rawT : 1 - Math.pow(-2 * rawT + 2, 3) / 2;
        progress = transFrom + (targetProgress - transFrom) * eased;
        if (rawT >= 1.0) {
          progress = targetProgress;
          isTransitioning = false;
        }
      }

      // 2. Step 2D physical water wave simulation
      let maxEnergy = 0;
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

      for (let i = 0; i < curr.length; i++) {
        const v = Math.max(0, Math.min(255, Math.round((curr[i] * 0.5 + 0.5) * 255)));
        const p = i * 4;
        pixels[p] = v;
        pixels[p + 1] = v;
        pixels[p + 2] = v;
        pixels[p + 3] = 255;
      }

      drawScene();

      if (maxEnergy > 0.0018 || isTransitioning) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    // Window-level pointer tracking so foreground Hero text never blocks ripples
    let lastGx = -1;
    let lastGy = -1;

    const handleWinMove = (e) => {
      const rect = container.getBoundingClientRect();
      if (
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom
      ) {
        lastGx = -1;
        lastGy = -1;
        return;
      }

      const nx = (e.clientX - rect.left) / Math.max(rect.width, 1);
      const ny = (e.clientY - rect.top) / Math.max(rect.height, 1);
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
      }
      lastGx = gx;
      lastGy = gy;
    };

    if (canHover) {
      window.addEventListener("pointermove", handleWinMove, { passive: true });
    }

    let intervalId = null;

    // Load & paint primary hero image immediately so preloader can reveal without waiting on slide 2
    loadImage(src0)
      .then((imgA) => {
        if (disposed) return;

        const aspectA = (imgA.naturalWidth || 1) / Math.max(imgA.naturalHeight || 1, 1);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, texA);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imgA);
        gl.uniform1f(uAspectALoc, aspectA);

        // Bind imgA to texB temporarily so shader is always valid before slide 2 arrives
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, texB);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imgA);
        gl.uniform1f(uAspectBLoc, aspectA);

        ready = true;
        resize();
        drawScene();
        setWebglReady(true);
        window.requestAnimationFrame(() => {
          drawScene();
          window.__ffHeroReady = true;
          window.dispatchEvent(new CustomEvent("ff:hero-ready"));
        });

        // Load second hero slide in background for the square-pixel slideshow
        if (src0 !== src1) {
          loadImage(src1)
            .then((imgB) => {
              if (disposed) return;
              gl.activeTexture(gl.TEXTURE2);
              gl.bindTexture(gl.TEXTURE_2D, texB);
              gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imgB);
              gl.uniform1f(
                uAspectBLoc,
                (imgB.naturalWidth || 1) / Math.max(imgB.naturalHeight || 1, 1)
              );

              intervalId = window.setInterval(() => {
                if (document.hidden) return;
                transFrom = progress;
                targetProgress = targetProgress < 0.5 ? 1.0 : 0.0;
                transStart = performance.now();
                isTransitioning = true;
                wake();
              }, intervalMs);
            })
            .catch(() => {});
        }
      })
      .catch(() => {
        // Silent fallback to native <img>
        window.__ffHeroReady = true;
        window.dispatchEvent(new CustomEvent("ff:hero-ready"));
      });

    return () => {
      disposed = true;
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      if (intervalId !== null) window.clearInterval(intervalId);
      if (canHover) {
        window.removeEventListener("pointermove", handleWinMove);
      }
      ro.disconnect();
      gl.deleteTexture(waveTex);
      gl.deleteTexture(texA);
      gl.deleteTexture(texB);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [src0, src1, intervalMs, transitionMs, gridRows, strength, objX, objY]);

  return (
    <div ref={containerRef} data-hero-img="true" className={`relative overflow-hidden ${className}`}>
      {/* Native <img> fallback (SSR, reduced-motion, or non-WebGL) with smooth crossfade */}
      {images.map((imgSrc, idx) => (
        <img
          key={imgSrc}
          src={imgSrc}
          alt={alt}
          loading={idx === 0 ? "eager" : "lazy"}
          decoding="async"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            webglReady ? "opacity-0" : fallbackIdx === idx ? "opacity-100" : "opacity-0"
          } ${imgClassName}`}
        />
      ))}

      {/* WebGL Big-Square-Pixel Slideshow + Liquid Hover Refraction Canvas */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={`absolute inset-0 w-full h-full block pointer-events-none transition-opacity duration-300 ${
          webglReady ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}

