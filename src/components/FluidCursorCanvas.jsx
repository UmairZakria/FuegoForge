"use client";

import { useEffect, useRef } from "react";

// Real-Time 2D Water-Surface Wave & Chromatic Refraction Shader (Lusion-Inspired)
// Dragging the cursor disturbs a physical 2D liquid surface, creating smooth organic wakes
// and delicate translucent soap-film/water refraction caustics strictly in the background.
export default function FluidCursorCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isCoarsePointer || prefersReducedMotion) return;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: true,
      antialias: true,
      depth: false,
      stencil: false,
      powerPreference: "high-performance",
    });

    if (!gl) return;

    const vertSrc = `
      attribute vec2 a_pos;
      varying vec2 v_uv;
      void main() {
        v_uv = a_pos * 0.5 + 0.5;
        gl_Position = vec4(a_pos, 0.0, 1.0);
      }
    `;

    // Renders translucent liquid-glass refraction & thin chromatic caustics from the wave heightfield
    const fragSrc = `
      precision highp float;
      varying vec2 v_uv;

      uniform sampler2D u_waveTex;
      uniform vec2 u_texel;

      // 9-tap Gaussian kernel for silky-smooth liquid normals with zero grid stepping
      float sampleHeight(vec2 uv) {
        vec2 tx = vec2(u_texel.x, 0.0);
        vec2 ty = vec2(0.0, u_texel.y);
        float c  = texture2D(u_waveTex, uv).r * 4.0;
        float n  = (texture2D(u_waveTex, uv + tx).r + texture2D(u_waveTex, uv - tx).r +
                    texture2D(u_waveTex, uv + ty).r + texture2D(u_waveTex, uv - ty).r) * 2.0;
        float d  = (texture2D(u_waveTex, uv + tx + ty).r + texture2D(u_waveTex, uv - tx + ty).r +
                    texture2D(u_waveTex, uv + tx - ty).r + texture2D(u_waveTex, uv - tx - ty).r);
        return (c + n + d) / 16.0;
      }

      void main() {
        // Flip Y so texture matches screen coordinates
        vec2 uv = vec2(v_uv.x, 1.0 - v_uv.y);

        // Compute smooth surface slope (water normal)
        vec2 stepX = vec2(u_texel.x * 1.0, 0.0);
        vec2 stepY = vec2(0.0, u_texel.y * 1.0);

        float hL = sampleHeight(uv - stepX);
        float hR = sampleHeight(uv + stepX);
        float hD = sampleHeight(uv - stepY);
        float hU = sampleHeight(uv + stepY);

        vec2 grad = vec2(hR - hL, hU - hD);
        float slope = length(grad);

        // Undisturbed water stays 100% transparent
        if (slope < 0.008) {
          gl_FragColor = vec4(0.0);
          return;
        }

        vec2 dir = grad / (slope + 0.0001);
        vec3 normal = normalize(vec3(-grad * 8.5, 1.0));

        // Chromatic dispersion: sample wave slope slightly offset for R vs B channels
        float disp = 1.4;
        float slopeR = length(vec2(
          sampleHeight(uv + dir * u_texel * disp + stepX) - sampleHeight(uv + dir * u_texel * disp - stepX),
          sampleHeight(uv + dir * u_texel * disp + stepY) - sampleHeight(uv + dir * u_texel * disp - stepY)
        ));
        float slopeB = length(vec2(
          sampleHeight(uv - dir * u_texel * disp + stepX) - sampleHeight(uv - dir * u_texel * disp - stepX),
          sampleHeight(uv - dir * u_texel * disp + stepY) - sampleHeight(uv - dir * u_texel * disp - stepY)
        ));

        // Razor-thin liquid crest highlight + subtle soap-film chromatic split
        float crest = smoothstep(0.008, 0.085, slope);
        float warmEdge = clamp((slopeR - slopeB) * 10.0, 0.0, 1.0);
        float coolEdge = clamp((slopeB - slopeR) * 10.0, 0.0, 1.0);

        // Directional studio light catching the water ripples
        vec3 lightDir = normalize(vec3(0.42, -0.65, 0.62));
        float spec = pow(max(dot(normal, lightDir), 0.0), 18.0) * smoothstep(0.01, 0.06, slope);

        // Subtle shadow trough on opposite side of wave
        vec3 shadowLight = normalize(vec3(-0.42, 0.65, 0.62));
        float trough = pow(max(dot(normal, shadowLight), 0.0), 10.0) * smoothstep(0.012, 0.07, slope) * 0.22;

        vec3 warmTint = vec3(0.96, 0.72, 0.56); // delicate champagne-peach refraction
        vec3 coolTint = vec3(0.70, 0.80, 0.98); // delicate ice-blue refraction
        vec3 whiteSpec = vec3(1.0, 0.99, 0.97);
        vec3 shadowCol = vec3(0.62, 0.58, 0.64);

        vec3 color =
          warmTint * warmEdge * 0.95 +
          coolTint * coolEdge * 0.95 +
          whiteSpec * (spec * 1.1 + crest * 0.32);

        float alpha = clamp(crest * 0.36 + (warmEdge + coolEdge) * 0.24 + spec * 0.52 + trough, 0.0, 0.58);
        vec3 finalColor = mix(shadowCol, color, clamp(crest * 1.3 + spec, 0.0, 1.0));

        gl_FragColor = vec4(finalColor * alpha, alpha);
      }
    `;

    const compile = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        gl.deleteShader(s);
        return null;
      }
      return s;
    };

    const vs = compile(gl.VERTEX_SHADER, vertSrc);
    const fs = compile(gl.FRAGMENT_SHADER, fragSrc);
    if (!vs || !fs) return;

    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const posLoc = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const texelLoc = gl.getUniformLocation(prog, "u_texel");

    // 2D Isotropic Physical Water Simulation Grid
    const SIM_W = 200;
    const SIM_H = 120;
    const SIZE = SIM_W * SIM_H;
    let prev = new Float32Array(SIZE);
    let curr = new Float32Array(SIZE);
    let next = new Float32Array(SIZE);
    const texBytes = new Uint8Array(SIZE * 4);

    // Initialize neutral flat water (128 = 0.0 height)
    for (let i = 0; i < SIZE; i++) {
      const o = i * 4;
      texBytes[o] = 128;
      texBytes[o + 1] = 128;
      texBytes[o + 2] = 128;
      texBytes[o + 3] = 255;
    }

    const waveTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, waveTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      SIM_W,
      SIM_H,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      texBytes
    );

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.95);
      canvas.width = Math.max(1, Math.floor(window.innerWidth * dpr));
      canvas.height = Math.max(1, Math.floor(window.innerHeight * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();

    // Inject continuous smooth Gaussian water disturbance along a drag segment
    const disturbSegment = (x0, y0, x1, y1, strength) => {
      const dx = x1 - x0;
      const dy = y1 - y0;
      const dist = Math.hypot(dx, dy);
      const steps = Math.max(1, Math.min(20, Math.ceil(dist * 1.5)));
      const radius = 2.8;

      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const cx = x0 + dx * t;
        const cy = y0 + dy * t;
        const minX = Math.max(2, Math.floor(cx - radius));
        const maxX = Math.min(SIM_W - 3, Math.ceil(cx + radius));
        const minY = Math.max(2, Math.floor(cy - radius));
        const maxY = Math.min(SIM_H - 3, Math.ceil(cy + radius));

        for (let y = minY; y <= maxY; y++) {
          for (let x = minX; x <= maxX; x++) {
            const d2 = (x - cx) * (x - cx) + (y - cy) * (y - cy);
            if (d2 < radius * radius) {
              const falloff = Math.exp(-d2 / (radius * radius * 0.38));
              const idx = y * SIM_W + x;
              curr[idx] = Math.max(-1.0, Math.min(1.0, curr[idx] + strength * falloff));
            }
          }
        }
      }
    };

    let targetGx = -1;
    let targetGy = -1;
    let ptrGx = -1;
    let ptrGy = -1;
    let rafId = 0;
    let running = false;
    const DAMPING = 0.932;

    const stepAndRender = () => {
      // Smooth spring-interpolated pointer glide through water
      if (targetGx >= 0 && ptrGx >= 0) {
        const nextPtrX = ptrGx + (targetGx - ptrGx) * 0.34;
        const nextPtrY = ptrGy + (targetGy - ptrGy) * 0.34;
        const glideSpeed = Math.hypot(nextPtrX - ptrGx, nextPtrY - ptrGy);
        if (glideSpeed > 0.28) {
          const strength = Math.min(0.2, 0.035 + glideSpeed * 0.014);
          disturbSegment(ptrGx, ptrGy, nextPtrX, nextPtrY, strength);
        }
        ptrGx = nextPtrX;
        ptrGy = nextPtrY;
      }

      let maxEnergy = 0;

      // Isotropic 8-neighbor 2D damped wave equation (perfectly round, organic liquid waves)
      for (let y = 1; y < SIM_H - 1; y++) {
        const row = y * SIM_W;
        for (let x = 1; x < SIM_W - 1; x++) {
          const i = row + x;
          const cardinals = curr[i - 1] + curr[i + 1] + curr[i - SIM_W] + curr[i + SIM_W];
          const diagonals =
            curr[i - SIM_W - 1] + curr[i - SIM_W + 1] + curr[i + SIM_W - 1] + curr[i + SIM_W + 1];
          const avg = cardinals * 0.2 + diagonals * 0.05;
          const val = (avg * 2.0 - prev[i]) * DAMPING;

          next[i] = val;
          const absV = val < 0 ? -val : val;
          if (absV > maxEnergy) maxEnergy = absV;

          // Pack [-1, 1] into [0, 255]
          const byte = Math.max(0, Math.min(255, Math.round((val * 0.5 + 0.5) * 255)));
          const o = i * 4;
          texBytes[o] = byte;
        }
      }

      // Swap buffers
      const tmp = prev;
      prev = curr;
      curr = next;
      next = tmp;

      gl.bindTexture(gl.TEXTURE_2D, waveTex);
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, SIM_W, SIM_H, gl.RGBA, gl.UNSIGNED_BYTE, texBytes);

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(texelLoc, 1.0 / SIM_W, 1.0 / SIM_H);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      const pointerStillMoving =
        targetGx >= 0 && Math.hypot(targetGx - ptrGx, targetGy - ptrGy) > 0.15;

      if (maxEnergy > 0.0022 || pointerStillMoving) {
        rafId = window.requestAnimationFrame(stepAndRender);
      } else {
        prev.fill(0);
        curr.fill(0);
        next.fill(0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        running = false;
        rafId = 0;
      }
    };

    const onMouseMove = (e) => {
      const gx = (e.clientX / window.innerWidth) * (SIM_W - 1);
      const gy = (e.clientY / window.innerHeight) * (SIM_H - 1);

      if (ptrGx < 0) {
        ptrGx = gx;
        ptrGy = gy;
      }

      targetGx = gx;
      targetGy = gy;

      if (!running && Math.hypot(targetGx - ptrGx, targetGy - ptrGy) > 0.35) {
        running = true;
        rafId = window.requestAnimationFrame(stepAndRender);
      }
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("resize", resize, { passive: true });

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 z-0 pointer-events-none w-full h-full"
    />
  );
}
