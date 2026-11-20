"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const VERTEX_SHADER = /* glsl */ `
  uniform sampler2D uDepthMap;
  uniform vec2 uMouse;
  uniform float uHover;
  uniform float uImageAspect;
  uniform float uContainerAspect;
  uniform float uVertexDepth;

  varying vec2 vUv;

  vec2 getCoverUv(vec2 uv, float imgAspect, float contAspect) {
    vec2 s = vec2(1.0);
    if (contAspect > imgAspect) {
      s.y = imgAspect / contAspect;
    } else {
      s.x = contAspect / imgAspect;
    }
    return (uv - 0.5) * s + 0.5;
  }

  void main() {
    vUv = uv;
    vec2 coverUv = getCoverUv(uv, uImageAspect, uContainerAspect);
    float depth = texture2D(uDepthMap, coverUv).r;

    vec3 pos = position;

    // Very subtle, cohesive 3D vertex relief so straight edges never warp
    pos.z += (depth - 0.5) * uVertexDepth * uHover;

    // Minimal edge-safe overscale to prevent border reveal during 3D perspective shift
    float overscale = 1.0 + uHover * 0.04;
    pos.xy *= overscale;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  uniform sampler2D uImage;
  uniform sampler2D uDepthMap;
  uniform vec2 uMouse;
  uniform float uHover;
  uniform float uImageAspect;
  uniform float uContainerAspect;
  uniform float uDisplacementStrength;

  varying vec2 vUv;

  vec2 getCoverUv(vec2 uv, float imgAspect, float contAspect) {
    vec2 s = vec2(1.0);
    if (contAspect > imgAspect) {
      s.y = imgAspect / contAspect;
    } else {
      s.x = contAspect / imgAspect;
    }
    return (uv - 0.5) * s + 0.5;
  }

  void main() {
    vec2 baseUv = getCoverUv(vUv, uImageAspect, uContainerAspect);

    // Clean, tight optical parallax: foreground subject moves cohesively, background recedes gently
    float depth1 = texture2D(uDepthMap, baseUv).r;
    vec2 parallaxVec = uMouse * uDisplacementStrength * uHover;

    vec2 midUv = clamp(baseUv - parallaxVec * (depth1 - 0.5), 0.001, 0.999);
    float depth2 = texture2D(uDepthMap, midUv).r;
    float refinedDepth = mix(depth1, depth2, 0.5);

    vec2 displacedUv = clamp(baseUv - parallaxVec * (refinedDepth - 0.5), 0.001, 0.999);
    vec4 color = texture2D(uImage, displacedUv);

    // Subtle soft studio light sweep tied to cursor angle (no noisy pixel-level embossing)
    float lightSweep = smoothstep(1.3, 0.0, length((vUv - 0.5) * 2.0 - uMouse * 0.75));
    vec3 lit = color.rgb + vec3(1.0, 0.98, 0.95) * (lightSweep * 0.032 * uHover);

    gl_FragColor = vec4(lit, color.a);
    #include <colorspace_fragment>
  }
`;

/**
 * Resolves a CORS-safe URL for WebGL texture upload.
 * Same-origin images load directly; external hosts without ACAO (like i.etsystatic.com)
 * route through wsrv.nl which serves CORS-enabled WebP cached on Cloudflare.
 */
function getCorsSafeImageUrl(src) {
  if (!src) return "";
  if (src.startsWith("/") || src.startsWith("data:") || src.startsWith("blob:")) {
    return src;
  }
  try {
    const parsed = new URL(src);
    if (typeof window !== "undefined" && parsed.origin === window.location.origin) {
      return src;
    }
    // Use medium-high resolution (1588px) for crisp WebGL upload without 3MB stalls
    const optimized = src.replace("/il_fullxfull.", "/il_1588xN.");
    return `https://wsrv.nl/?url=${encodeURIComponent(optimized)}&output=webp&q=90`;
  } catch {
    return src;
  }
}

/**
 * Generates a smooth, multi-cue photographic depth map from any product image:
 * 1. Foreground vs. border/studio backdrop color separation
 * 2. Local edge/detail sharpness (macro focus vs. bokeh)
 * 3. Specular/luminance relief on metallic & gemstone highlights
 * 4. Soft radial studio focus falloff + multi-pass separable smoothing
 */
function synthesizeDepthTexture(image) {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(image, 0, 0, size, size);

  const { data } = ctx.getImageData(0, 0, size, size);
  const count = size * size;

  // Estimate average backdrop color from the outer border ring
  let bgR = 0;
  let bgG = 0;
  let bgB = 0;
  let bgSamples = 0;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (x < 10 || x >= size - 10 || y < 10 || y >= size - 10) {
        const p = (y * size + x) * 4;
        bgR += data[p] / 255;
        bgG += data[p + 1] / 255;
        bgB += data[p + 2] / 255;
        bgSamples++;
      }
    }
  }

  bgR /= bgSamples || 1;
  bgG /= bgSamples || 1;
  bgB /= bgSamples || 1;

  const rawDepth = new Float32Array(count);

  for (let y = 0; y < size; y++) {
    const ny = (y / (size - 1)) * 2 - 1;
    for (let x = 0; x < size; x++) {
      const nx = (x / (size - 1)) * 2 - 1;
      const idx = y * size + x;
      const p = idx * 4;

      const r = data[p] / 255;
      const g = data[p + 1] / 255;
      const b = data[p + 2] / 255;

      // 1. Broad subject-vs-backdrop color separation (keeps entire jewelry piece cohesive)
      const dr = r - bgR;
      const dg = g - bgG;
      const db = b - bgB;
      const colorDist = Math.min(Math.sqrt(dr * dr + dg * dg + db * db) * 1.45, 1.0);

      // 2. Smooth studio center volume + subtle tabletop perspective plane (bottom slightly closer)
      const distSq = nx * nx + ny * ny;
      const radial = Math.max(0, 1.0 - distSq * 0.48);
      const groundPlane = (ny + 1.0) * 0.5; // 0 at top, 1 at bottom

      rawDepth[idx] = colorDist * 0.45 + radial * 0.43 + groundPlane * 0.12;
    }
  }

  // Heavy multi-pass separable smoothing so the foreground object moves as one solid volume
  // with zero pixel-level rippling or warping
  const temp = new Float32Array(count);
  const blurPass = (srcBuf, dstBuf, radius) => {
    const inv = 1 / (radius * 2 + 1);
    // Horizontal
    for (let y = 0; y < size; y++) {
      const row = y * size;
      let sum = 0;
      for (let k = -radius; k <= radius; k++) {
        sum += srcBuf[row + Math.min(Math.max(k, 0), size - 1)];
      }
      for (let x = 0; x < size; x++) {
        temp[row + x] = sum * inv;
        const addIdx = Math.min(x + radius + 1, size - 1);
        const remIdx = Math.max(x - radius, 0);
        sum += srcBuf[row + addIdx] - srcBuf[row + remIdx];
      }
    }
    // Vertical
    for (let x = 0; x < size; x++) {
      let sum = 0;
      for (let k = -radius; k <= radius; k++) {
        sum += temp[Math.min(Math.max(k, 0), size - 1) * size + x];
      }
      for (let y = 0; y < size; y++) {
        dstBuf[y * size + x] = sum * inv;
        const addIdx = Math.min(y + radius + 1, size - 1);
        const remIdx = Math.max(y - radius, 0);
        sum += temp[addIdx * size + x] - temp[remIdx * size + x];
      }
    }
  };

  const smoothA = new Float32Array(count);
  blurPass(rawDepth, smoothA, 18);
  blurPass(smoothA, rawDepth, 14);
  blurPass(rawDepth, smoothA, 10);
  rawDepth.set(smoothA);

  // Normalize contrast range to [0.05, 0.98] for consistent parallax depth across all products
  let minV = 1;
  let maxV = 0;
  for (let i = 0; i < count; i++) {
    if (rawDepth[i] < minV) minV = rawDepth[i];
    if (rawDepth[i] > maxV) maxV = rawDepth[i];
  }
  const span = Math.max(maxV - minV, 0.001);

  const outBytes = new Uint8Array(count * 4);
  for (let i = 0; i < count; i++) {
    const norm = Math.min(Math.max((rawDepth[i] - minV) / span, 0), 1);
    const v = Math.round((0.04 + norm * 0.94) * 255);
    const p = i * 4;
    outBytes[p] = v;
    outBytes[p + 1] = v;
    outBytes[p + 2] = v;
    outBytes[p + 3] = 255;
  }

  const depthTexture = new THREE.DataTexture(outBytes, size, size, THREE.RGBAFormat);
  depthTexture.minFilter = THREE.LinearFilter;
  depthTexture.magFilter = THREE.LinearFilter;
  depthTexture.wrapS = THREE.ClampToEdgeWrapping;
  depthTexture.wrapT = THREE.ClampToEdgeWrapping;
  depthTexture.flipY = true;
  depthTexture.needsUpdate = true;
  return depthTexture;
}

function loadImageCrossOrigin(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = url;
  });
}

export default function DepthHoverImage({
  src,
  alt = "",
  depthMapSrc = "",
  className = "w-full h-full object-cover",
  displacementStrength = 0.011,
  vertexDepth = 0.045,
  tiltStrength = 0.048,
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const cacheRef = useRef(new Map());
  const glStateRef = useRef(null);
  const [loadedSrc, setLoadedSrc] = useState("");
  const webglReady = Boolean(src) && loadedSrc === src;

  // Initialize Three.js scene once on hover-capable desktop devices
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas || typeof window === "undefined") return;

    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!canHover || reducedMotion) return;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch {
      // Graceful fallback to native <img> if WebGL is unavailable
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 10);
    camera.position.z = 3.06;

    const geometry = new THREE.PlaneGeometry(2, 2, 48, 48);

    const uniforms = {
      uImage: { value: null },
      uDepthMap: { value: null },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uHover: { value: 0 },
      uImageAspect: { value: 1 },
      uContainerAspect: { value: 1 },
      uDisplacementStrength: { value: displacementStrength },
      uVertexDepth: { value: vertexDepth },
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      transparent: false,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const state = {
      renderer,
      scene,
      camera,
      mesh,
      geometry,
      material,
      uniforms,
      targetMouse: { x: 0, y: 0 },
      currentMouse: { x: 0, y: 0 },
      targetHover: 0,
      currentHover: 0,
      rafId: null,
      lastTime: 0,
      hasTexture: false,
      disposed: false,
    };

    const updateSize = () => {
      if (state.disposed) return;
      const rect = container.getBoundingClientRect();
      const width = Math.max(1, Math.round(rect.width));
      const height = Math.max(1, Math.round(rect.height));
      const aspect = width / height;

      renderer.setSize(width, height, false);
      camera.aspect = aspect;

      // Exact frustum fit at z = 0 so the plane fills the container edge-to-edge
      const vFovRad = THREE.MathUtils.degToRad(camera.fov);
      const visibleHeight = 2 * Math.tan(vFovRad / 2) * camera.position.z;
      const visibleWidth = visibleHeight * aspect;
      mesh.scale.set(visibleWidth / 2, visibleHeight / 2, 1);

      camera.updateProjectionMatrix();
      uniforms.uContainerAspect.value = aspect;

      if (state.hasTexture) {
        renderer.render(scene, camera);
      }
    };

    const renderFrame = (now) => {
      if (state.disposed) return;
      state.rafId = null;

      const dt = state.lastTime ? Math.min((now - state.lastTime) / 1000, 0.05) : 0.016;
      state.lastTime = now;

      // Framerate-independent Lusion-style smooth damping
      const ease = 1 - Math.exp(-dt * 7.5);
      const hoverEase = 1 - Math.exp(-dt * 6.0);

      state.currentMouse.x += (state.targetMouse.x - state.currentMouse.x) * ease;
      state.currentMouse.y += (state.targetMouse.y - state.currentMouse.y) * ease;
      state.currentHover += (state.targetHover - state.currentHover) * hoverEase;

      uniforms.uMouse.value.set(state.currentMouse.x, state.currentMouse.y);
      uniforms.uHover.value = state.currentHover;

      // Subtle 3D camera parallax orbit + gentle object perspective tilt
      const mx = state.currentMouse.x * state.currentHover;
      const my = state.currentMouse.y * state.currentHover;
      camera.position.x = mx * 0.11;
      camera.position.y = my * 0.11;
      camera.lookAt(0, 0, 0);
      mesh.rotation.y = mx * tiltStrength;
      mesh.rotation.x = -my * tiltStrength;

      if (state.hasTexture) {
        renderer.render(scene, camera);
      }

      const settled =
        Math.abs(state.targetMouse.x - state.currentMouse.x) < 0.0006 &&
        Math.abs(state.targetMouse.y - state.currentMouse.y) < 0.0006 &&
        Math.abs(state.targetHover - state.currentHover) < 0.0006;

      if (!settled) {
        state.rafId = window.requestAnimationFrame(renderFrame);
      } else {
        // Snap cleanly to resting values and stop the loop until next interaction
        state.currentMouse.x = state.targetMouse.x;
        state.currentMouse.y = state.targetMouse.y;
        state.currentHover = state.targetHover;
        uniforms.uMouse.value.set(state.currentMouse.x, state.currentMouse.y);
        uniforms.uHover.value = state.currentHover;
        const mx = state.currentMouse.x * state.currentHover;
        const my = state.currentMouse.y * state.currentHover;
        camera.position.set(mx * 0.11, my * 0.11, 3.06);
        camera.lookAt(0, 0, 0);
        mesh.rotation.set(-my * tiltStrength, mx * tiltStrength, 0);
        if (state.hasTexture) {
          renderer.render(scene, camera);
        }
        state.lastTime = 0;
      }
    };

    const wakeLoop = () => {
      if (state.disposed || state.rafId !== null) return;
      state.lastTime = performance.now();
      state.rafId = window.requestAnimationFrame(renderFrame);
    };

    state.wakeLoop = wakeLoop;
    state.updateSize = updateSize;
    glStateRef.current = state;

    const handlePointerEnter = (e) => {
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      state.targetMouse.x = Math.max(-1, Math.min(1, nx));
      state.targetMouse.y = Math.max(-1, Math.min(1, ny));
      state.targetHover = 1;
      wakeLoop();
    };

    const handlePointerMove = (e) => {
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      state.targetMouse.x = Math.max(-1, Math.min(1, nx));
      state.targetMouse.y = Math.max(-1, Math.min(1, ny));
      state.targetHover = 1;
      wakeLoop();
    };

    const handlePointerLeave = () => {
      state.targetMouse.x = 0;
      state.targetMouse.y = 0;
      state.targetHover = 0;
      wakeLoop();
    };

    container.addEventListener("pointerenter", handlePointerEnter, { passive: true });
    container.addEventListener("pointermove", handlePointerMove, { passive: true });
    container.addEventListener("pointerleave", handlePointerLeave, { passive: true });

    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(container);
    updateSize();

    const cache = cacheRef.current;

    return () => {
      state.disposed = true;
      if (state.rafId !== null) {
        window.cancelAnimationFrame(state.rafId);
      }
      container.removeEventListener("pointerenter", handlePointerEnter);
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerleave", handlePointerLeave);
      resizeObserver.disconnect();

      cache.forEach((entry) => {
        entry.colorTexture?.dispose();
        entry.depthTexture?.dispose();
      });
      cache.clear();

      geometry.dispose();
      material.dispose();
      renderer.dispose();
      glStateRef.current = null;
    };
  }, [displacementStrength, vertexDepth, tiltStrength]);

  // Load or retrieve cached color + depth textures whenever `src` or `depthMapSrc` changes
  useEffect(() => {
    const state = glStateRef.current;
    if (!state || !src) return;

    let cancelled = false;
    const cacheKey = `${src}|${depthMapSrc}`;
    const cached = cacheRef.current.get(cacheKey);

    const applyTextures = ({ colorTexture, depthTexture, aspect }) => {
      if (cancelled || state.disposed) return;
      state.uniforms.uImage.value = colorTexture;
      state.uniforms.uDepthMap.value = depthTexture;
      state.uniforms.uImageAspect.value = aspect;
      state.hasTexture = true;
      state.renderer.render(state.scene, state.camera);
      setLoadedSrc(src);
    };

    if (cached) {
      Promise.resolve().then(() => applyTextures(cached));
      return () => {
        cancelled = true;
      };
    }

    const corsUrl = getCorsSafeImageUrl(src);

    (async () => {
      try {
        const img = await loadImageCrossOrigin(corsUrl);
        if (cancelled || state.disposed) return;

        const colorTexture = new THREE.Texture(img);
        colorTexture.colorSpace = THREE.SRGBColorSpace;
        colorTexture.minFilter = THREE.LinearFilter;
        colorTexture.magFilter = THREE.LinearFilter;
        colorTexture.generateMipmaps = false;
        colorTexture.needsUpdate = true;

        let depthTexture;
        if (depthMapSrc) {
          const depthImg = await loadImageCrossOrigin(getCorsSafeImageUrl(depthMapSrc));
          if (cancelled || state.disposed) {
            colorTexture.dispose();
            return;
          }
          depthTexture = new THREE.Texture(depthImg);
          depthTexture.minFilter = THREE.LinearFilter;
          depthTexture.magFilter = THREE.LinearFilter;
          depthTexture.generateMipmaps = false;
          depthTexture.needsUpdate = true;
        } else {
          depthTexture = synthesizeDepthTexture(img);
        }

        const aspect = (img.naturalWidth || 1) / (img.naturalHeight || 1);
        const entry = { colorTexture, depthTexture, aspect };
        cacheRef.current.set(cacheKey, entry);
        applyTextures(entry);
      } catch {
        // Silent graceful fallback: native <img> stays visible
        if (!cancelled) {
          setLoadedSrc("");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [src, depthMapSrc]);

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden">
      {/* Native <img> always present for instant SSR, SEO, mobile, and WebGL fallback */}
      <img
        src={src}
        alt={alt}
        className={`${className} transition-opacity duration-300 ${
          webglReady ? "opacity-0" : "opacity-100"
        }`}
      />

      {/* Interactive Three.js 3D depth-displaced canvas (desktop hover-capable only) */}
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
