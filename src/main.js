import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { buildRoom, ROOM } from './room.js';
import { addBaseFurniture } from './furniture.js';
import { addSmartAddons, SMART_ADDONS } from './smart.js';

const canvas = document.getElementById('stage');
const conceptImg = document.getElementById('concept-img');
const hudMode = document.getElementById('hud-mode');
const addonsList = document.getElementById('addons-list');
const costBlock = document.getElementById('cost-block');

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x060912);
scene.fog = new THREE.Fog(0x060912, 18, 36);

const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 200);
camera.position.set(8.5, 6.2, 9.5);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 4;
controls.maxDistance = 22;
controls.maxPolarAngle = Math.PI * 0.49;
controls.target.set(0, 1.1, 0);

// Lighting
const hemi = new THREE.HemisphereLight(0xeaf2ff, 0x1a1f2e, 0.55);
scene.add(hemi);

const key = new THREE.DirectionalLight(0xffffff, 1.2);
key.position.set(6, 10, 6);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.left = -8;
key.shadow.camera.right = 8;
key.shadow.camera.top = 8;
key.shadow.camera.bottom = -8;
key.shadow.bias = -0.0003;
scene.add(key);

const fill = new THREE.DirectionalLight(0x9ec5ff, 0.35);
fill.position.set(-6, 4, -2);
scene.add(fill);

// Build the room shell
const roomGroup = buildRoom();
scene.add(roomGroup);

// Layer groups so we can show/hide
const baseLayer = new THREE.Group();
addBaseFurniture(baseLayer);
scene.add(baseLayer);

const smartLayer = new THREE.Group();
addSmartAddons(smartLayer);
scene.add(smartLayer);

// State
let mode = 'before';
function setMode(next) {
  mode = next;
  document.querySelectorAll('.modes button').forEach(b => b.classList.toggle('active', b.dataset.mode === next));
  if (next === 'concept') {
    conceptImg.hidden = false;
    canvas.style.visibility = 'hidden';
    hudMode.innerHTML = 'Modo: <strong>Render IA conceptual (DALL·E 3)</strong>';
  } else {
    conceptImg.hidden = true;
    canvas.style.visibility = 'visible';
    hudMode.innerHTML = `Modo: <strong>${next === 'before' ? 'Sala convencional' : 'Sala inteligente'}</strong>`;
  }
  smartLayer.visible = next === 'after';
  renderAddonsPanel(next);
  renderCostPanel(next);
}

document.querySelectorAll('.modes button').forEach(btn => {
  btn.addEventListener('click', () => setMode(btn.dataset.mode));
});

function renderAddonsPanel(currentMode) {
  addonsList.innerHTML = '';
  if (currentMode !== 'after') {
    const li = document.createElement('li');
    li.className = 'empty';
    li.textContent = currentMode === 'concept'
      ? 'Vista de imagen generada por IA. Cambia a "Sala inteligente" para ver el render 3D.'
      : '3 pantallas Android (Samsung / LG) + mesa + sillas. Sin aditamentos inteligentes.';
    addonsList.appendChild(li);
    return;
  }
  for (const a of SMART_ADDONS) {
    const li = document.createElement('li');
    li.innerHTML = `<span class="pill">${a.tag}</span><strong>${a.name}</strong><br/><span style="color:var(--muted);font-size:12px">${a.purpose}</span>`;
    addonsList.appendChild(li);
  }
}

function renderCostPanel(currentMode) {
  if (currentMode !== 'after') {
    costBlock.innerHTML = `
      <div class="row"><span>Hardware existente</span><span>—</span></div>
      <div class="row total"><span>Costo de IA</span><span>$0 USD</span></div>
      <div style="font-size:12px;color:var(--muted);margin-top:6px">Punto de partida: 3 pantallas Android, mesa rectangular y sillas.</div>
    `;
    return;
  }
  let total = 0;
  let rows = '';
  for (const a of SMART_ADDONS) {
    if (a.priceUsd) {
      total += a.priceUsd;
      rows += `<div class="row"><span>${a.name}</span><span>$${a.priceUsd.toLocaleString()}</span></div>`;
    }
  }
  rows += `<div class="row"><span>Software IA (1er año, 8 usuarios)</span><span>$960</span></div>`;
  total += 960;
  costBlock.innerHTML = rows + `<div class="row total"><span>Estimado total</span><span>$${total.toLocaleString()} USD</span></div>`;
}

// Resize
function resize() {
  const wrap = canvas.parentElement;
  const w = wrap.clientWidth;
  const h = wrap.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(canvas.parentElement);
resize();

// Animation loop
const clock = new THREE.Clock();
function tick() {
  const t = clock.getElapsedTime();
  controls.update();
  // Subtle screen flicker on the displays
  scene.traverse(obj => {
    if (obj.userData.isScreen) {
      const m = obj.material;
      if (m && m.emissiveIntensity !== undefined) {
        m.emissiveIntensity = 1.05 + Math.sin(t * 1.4 + obj.userData.seed) * 0.08;
      }
    }
    if (obj.userData.isLedRing) {
      obj.material.emissiveIntensity = 1.4 + Math.sin(t * 2.0) * 0.25;
    }
  });
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
tick();

// Init
setMode('before');

// Expose for debugging
window.__scene = { scene, camera, ROOM };
