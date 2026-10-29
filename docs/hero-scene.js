(() => {
  "use strict";

  const canvas = document.querySelector("#hero-canvas");
  const host = document.querySelector("#hero-scene");
  const motion = document.querySelector("#scene-motion");
  const turn = document.querySelector("#scene-turn");
  if (!canvas || !host || !window.THREE) return;
  const T = window.THREE;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  let renderer;
  try {
    renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "low-power" });
  } catch {
    canvas.dataset.scene = "webgl-unavailable";
    motion.disabled = true;
    turn.disabled = true;
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setClearColor(0x050505, 1);
  renderer.outputEncoding = T.sRGBEncoding;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = .72;
  const scene = new T.Scene();
  const camera = new T.OrthographicCamera(-5, 5, 2.85, -2.85, .1, 40);
  camera.position.set(0, 0, 10);
  camera.lookAt(0, 0, 0);

  // Six original studio panels give the metal broad reflections without image assets.
  const studio = Array.from({ length: 6 }, (_, face) => {
    const image = document.createElement("canvas");
    image.width = image.height = 256;
    const ctx = image.getContext("2d");
    ctx.fillStyle = face === 2 ? "#18191c" : "#050506";
    ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = face === 0 || face === 4 ? "#6f7278" : "#1b1c20";
    ctx.fillRect(26, 12, 34, 225);
    ctx.fillStyle = face === 0 || face === 2 ? "#56585e" : "#141519";
    ctx.fillRect(174, 28, 17, 191);
    ctx.fillStyle = "#101114";
    ctx.fillRect(94, 168, 65, 80);
    return image;
  });
  const environment = new T.CubeTexture(studio);
  environment.encoding = T.sRGBEncoding;
  environment.needsUpdate = true;
  scene.environment = environment;
  scene.add(new T.AmbientLight(0xffffff, .12));
  const key = new T.DirectionalLight(0xe8eef5, 1.4);
  key.position.set(-3, 5, 6);
  scene.add(key);
  const edgeLight = new T.DirectionalLight(0xffffff, 1.1);
  edgeLight.position.set(4, 2, -3);
  scene.add(edgeLight);
  const fill = new T.DirectionalLight(0x909aab, .12);
  fill.position.set(-4, -3, 2);
  scene.add(fill);

  const sculpture = new T.Group();
  scene.add(sculpture);
  const metal = new T.MeshPhysicalMaterial({ color: 0x989ba1, metalness: .99, roughness: .36, envMapIntensity: .8, clearcoat: .08, clearcoatRoughness: .3 });
  const graphite = new T.MeshPhysicalMaterial({ color: 0x090a0c, metalness: .99, roughness: .23, envMapIntensity: .45, clearcoat: .05 });
  const innerMetal = new T.MeshStandardMaterial({ color: 0x272a30, metalness: .99, roughness: .32, envMapIntensity: .65 });

  const grain = document.createElement("canvas");
  grain.width = grain.height = 256;
  const grainContext = grain.getContext("2d");
  const grainPixels = grainContext.createImageData(256, 256);
  for (let pixel = 0; pixel < 256 * 256; pixel += 1) {
    const noise = Math.sin(pixel * 127.1 + 31.7) * 43758.5453;
    const value = 165 + Math.floor((noise - Math.floor(noise)) * 85);
    const offset = pixel * 4;
    grainPixels.data[offset] = grainPixels.data[offset + 1] = grainPixels.data[offset + 2] = value;
    grainPixels.data[offset + 3] = 255;
  }
  grainContext.putImageData(grainPixels, 0, 0);
  const grainTexture = new T.CanvasTexture(grain);
  grainTexture.wrapS = grainTexture.wrapT = T.RepeatWrapping;
  grainTexture.repeat.set(2, 2);
  [metal, graphite, innerMetal].forEach(material => {
    material.map = grainTexture;
    material.bumpMap = grainTexture;
    material.bumpScale = .004;
    material.needsUpdate = true;
  });

  function tileGeometry(size) {
    const h = size / 2 - .025;
    const shape = new T.Shape();
    shape.moveTo(-h, -h); shape.lineTo(h, -h); shape.lineTo(h, h); shape.lineTo(-h, h); shape.closePath();
    const geometry = new T.ExtrudeGeometry(shape, { depth: .13, bevelEnabled: true, bevelSize: .025, bevelThickness: .025, bevelSegments: 3, steps: 1, curveSegments: 1 });
    geometry.translate(0, 0, -.065);
    geometry.computeVertexNormals();
    return geometry;
  }
  const tile = tileGeometry(.755);
  const darkCore = new T.Mesh(new T.BoxGeometry(2.3, 2.3, 2.3), graphite);
  sculpture.add(darkCore);
  const faces = [
    { p: [0, 0, 1.19], r: [0, 0, 0] },
    { p: [0, 0, -1.19], r: [0, Math.PI, 0] },
    { p: [1.19, 0, 0], r: [0, Math.PI / 2, 0] },
    { p: [-1.19, 0, 0], r: [0, -Math.PI / 2, 0] },
    { p: [0, 1.19, 0], r: [-Math.PI / 2, 0, 0] },
    { p: [0, -1.19, 0], r: [Math.PI / 2, 0, 0] }
  ];
  faces.forEach((face, index) => {
    const side = new T.Group();
    side.position.set(...face.p);
    side.rotation.set(...face.r);
    for (let row = -1; row <= 1; row += 1) {
      for (let col = -1; col <= 1; col += 1) {
        const polished = (row === -1 && col === 1) || (index % 2 === 0 && row === 0 && col === -1);
        const material = polished ? metal : (row + col + index + 4) % 3 === 0 ? innerMetal : graphite;
        const panel = new T.Mesh(tile, material);
        panel.position.set(col * .8, row * .8, 0);
        side.add(panel);
      }
    }
    sculpture.add(side);
  });

  let paused = reduced.matches;
  let visible = true;
  let previous = 0;
  let frameId = 0;
  let phase = 0;
  let targetX = 0;
  let targetY = 0;
  let offsetY = 0;
  let dragging = false;
  let lastPointerX = 0;
  sculpture.rotation.set(.38, -.58, .14);

  function fit() {
    const width = host.clientWidth;
    const height = host.clientHeight;
    const aspect = width / Math.max(height, 1);
    const worldHeight = 5.7;
    camera.left = -worldHeight * aspect / 2;
    camera.right = worldHeight * aspect / 2;
    camera.top = worldHeight / 2;
    camera.bottom = -worldHeight / 2;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    if (width <= 800) {
      const compact = width <= 560 && window.innerHeight <= 740;
      const desired = compact ? 150 : width <= 560 ? 218 : 265;
      const centerY = compact ? 80 : width <= 560 ? 117 : 140;
      sculpture.scale.setScalar(desired / (3.85 * height / worldHeight));
      sculpture.position.set(0, (height / 2 - centerY) * worldHeight / height, 0);
    } else {
      sculpture.scale.setScalar(.8);
      sculpture.position.set(worldHeight * aspect * .235, .06, 0);
    }
    render();
  }
  function render() {
    renderer.render(scene, camera);
    canvas.dataset.scene = "ready";
    canvas.dataset.rotation = sculpture.rotation.y.toFixed(3);
  }
  function updateButton() {
    motion.setAttribute("aria-pressed", String(paused));
    motion.setAttribute("aria-label", paused ? "Resume sculpture" : "Pause sculpture");
    motion.title = paused ? "Resume sculpture" : "Pause sculpture";
    motion.innerHTML = paused ? '<i data-lucide="play" aria-hidden="true"></i>' : '<i data-lucide="pause" aria-hidden="true"></i>';
    window.lucide?.createIcons();
  }
  function animate(time) {
    frameId = 0;
    const delta = Math.min((time - previous) / 1000 || 0, .06);
    previous = time;
    if (!paused && visible && !document.hidden) {
      phase += delta;
      sculpture.rotation.x += ((.38 + targetY * .12) - sculpture.rotation.x) * .025;
      sculpture.rotation.y = -.58 + offsetY + phase * .075 + targetX * .12;
      sculpture.rotation.z = .14 + Math.sin(phase * .35) * .035;
      render();
      frameId = requestAnimationFrame(animate);
    }
  }
  function resumeLoop() {
    if (!paused && visible && !document.hidden && !frameId) {
      previous = performance.now();
      frameId = requestAnimationFrame(animate);
    }
  }
  motion.addEventListener("click", () => {
    paused = !paused;
    if (paused) { cancelAnimationFrame(frameId); frameId = 0; }
    updateButton();
    resumeLoop();
  });
  turn.addEventListener("click", () => {
    offsetY += Math.PI / 6;
    sculpture.rotation.y += Math.PI / 6;
    render();
  });
  canvas.addEventListener("pointerdown", event => {
    if (event.pointerType === "touch") return;
    dragging = true;
    lastPointerX = event.clientX;
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener("pointermove", event => {
    if (event.pointerType === "touch") return;
    const rect = canvas.getBoundingClientRect();
    targetX = (event.clientX - rect.left) / rect.width - .5;
    targetY = (event.clientY - rect.top) / rect.height - .5;
    if (dragging) {
      const change = (event.clientX - lastPointerX) * .007;
      offsetY += change;
      sculpture.rotation.y += change;
      lastPointerX = event.clientX;
      render();
    }
  });
  canvas.addEventListener("pointerup", () => { dragging = false; });
  canvas.addEventListener("pointercancel", () => { dragging = false; });
  canvas.addEventListener("pointerleave", () => { targetX = targetY = 0; });
  canvas.addEventListener("webglcontextlost", event => {
    event.preventDefault();
    paused = true;
    cancelAnimationFrame(frameId);
    frameId = 0;
    canvas.dataset.scene = "context-lost";
    updateButton();
  });
  document.addEventListener("visibilitychange", resumeLoop);
  reduced.addEventListener("change", () => {
    paused = reduced.matches;
    if (paused) { cancelAnimationFrame(frameId); frameId = 0; }
    updateButton();
    resumeLoop();
  });
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (!visible) { cancelAnimationFrame(frameId); frameId = 0; }
    resumeLoop();
  }, { threshold: .01 }).observe(host);
  new ResizeObserver(fit).observe(host);
  updateButton();
  fit();
  resumeLoop();
})();
