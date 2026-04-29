import * as THREE from 'three';
import { ROOM } from './room.js';

const MAT = {
  tableTop: new THREE.MeshStandardMaterial({ color: 0xf2eee6, roughness: 0.4, metalness: 0.05 }),
  tableLeg: new THREE.MeshStandardMaterial({ color: 0x2c2f36, roughness: 0.6, metalness: 0.4 }),
  chairSeat: new THREE.MeshStandardMaterial({ color: 0x1d2330, roughness: 0.85 }),
  chairFrame: new THREE.MeshStandardMaterial({ color: 0x2a2f3b, roughness: 0.7, metalness: 0.5 }),
  bezel: new THREE.MeshStandardMaterial({ color: 0x0a0a0c, roughness: 0.3, metalness: 0.6 }),
};

function makeScreenMaterial(hue, seed) {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 288;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 512, 288);
  grad.addColorStop(0, `hsl(${hue}, 80%, 30%)`);
  grad.addColorStop(1, `hsl(${(hue + 40) % 360}, 70%, 18%)`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 288);
  // Mock UI
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.font = 'bold 28px sans-serif';
  ctx.fillText('Reunión en curso', 28, 50);
  ctx.font = '16px sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.fillText('Facility Management — Abril 2026', 28, 78);
  // Tiles
  for (let i = 0; i < 6; i++) {
    const x = 28 + (i % 3) * 152;
    const y = 110 + Math.floor(i / 3) * 88;
    ctx.fillStyle = `hsla(${(hue + i * 30) % 360}, 60%, 50%, 0.85)`;
    ctx.fillRect(x, y, 140, 78);
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(`Participante ${i + 1}`, x + 10, y + 70);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return new THREE.MeshStandardMaterial({
    map: tex,
    emissive: 0xffffff,
    emissiveMap: tex,
    emissiveIntensity: 1.05,
    roughness: 0.3,
    metalness: 0.0,
  });
}

function buildDisplay({ width = 1.6, height = 0.92, label = 'Samsung', seed = 0, hue = 200 }) {
  const g = new THREE.Group();
  // Bezel
  const bezel = new THREE.Mesh(
    new THREE.BoxGeometry(width + 0.05, height + 0.05, 0.05),
    MAT.bezel
  );
  bezel.castShadow = true;
  g.add(bezel);
  // Screen
  const screenMat = makeScreenMaterial(hue, seed);
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    screenMat
  );
  screen.position.z = 0.026;
  screen.userData.isScreen = true;
  screen.userData.seed = seed;
  g.add(screen);

  // Brand label
  const brandCanvas = document.createElement('canvas');
  brandCanvas.width = 256; brandCanvas.height = 64;
  const bctx = brandCanvas.getContext('2d');
  bctx.fillStyle = '#0a0a0c'; bctx.fillRect(0, 0, 256, 64);
  bctx.fillStyle = '#ffffff';
  bctx.font = 'bold 22px sans-serif';
  bctx.textAlign = 'center';
  bctx.fillText(label, 128, 40);
  const tex = new THREE.CanvasTexture(brandCanvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const labelMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(0.32, 0.08),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true })
  );
  labelMesh.position.set(0, -height / 2 - 0.06, 0.027);
  g.add(labelMesh);

  return g;
}

function buildChair() {
  const g = new THREE.Group();
  // Seat
  const seat = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.06, 0.5),
    MAT.chairSeat
  );
  seat.position.y = 0.48;
  seat.castShadow = true;
  g.add(seat);
  // Back
  const back = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.55, 0.05),
    MAT.chairSeat
  );
  back.position.set(0, 0.78, -0.22);
  back.castShadow = true;
  g.add(back);
  // Center column
  const col = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.03, 0.42, 12),
    MAT.chairFrame
  );
  col.position.y = 0.27;
  g.add(col);
  // Base star (5 legs)
  for (let i = 0; i < 5; i++) {
    const leg = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.025, 0.04),
      MAT.chairFrame
    );
    leg.position.y = 0.06;
    leg.position.x = Math.cos(i / 5 * Math.PI * 2) * 0.14;
    leg.position.z = Math.sin(i / 5 * Math.PI * 2) * 0.14;
    leg.rotation.y = i / 5 * Math.PI * 2;
    g.add(leg);
  }
  return g;
}

export function addBaseFurniture(parent) {
  // ===== Rectangular table at center =====
  const tableW = 3.6, tableD = 1.4, tableH = 0.74;
  const top = new THREE.Mesh(
    new THREE.BoxGeometry(tableW, 0.06, tableD),
    MAT.tableTop
  );
  top.position.y = tableH;
  top.castShadow = true;
  top.receiveShadow = true;
  parent.add(top);

  // 2 trapezoidal leg panels
  for (const sx of [-1, 1]) {
    const leg = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, tableH - 0.04, tableD - 0.2),
      MAT.tableLeg
    );
    leg.position.set(sx * (tableW / 2 - 0.4), (tableH - 0.04) / 2, 0);
    leg.castShadow = true;
    parent.add(leg);
  }
  // Cross bar
  const cross = new THREE.Mesh(
    new THREE.BoxGeometry(tableW - 0.8, 0.05, 0.05),
    MAT.tableLeg
  );
  cross.position.y = 0.12;
  parent.add(cross);

  // ===== Chairs around table (3 + 3, plus 1 + 1 ends) =====
  const chairOffsets = [];
  const longSpacing = tableW / 3;
  for (let i = 0; i < 3; i++) {
    const x = -tableW / 2 + longSpacing / 2 + i * longSpacing;
    chairOffsets.push({ x, z:  tableD / 2 + 0.45, ry: Math.PI });
    chairOffsets.push({ x, z: -tableD / 2 - 0.45, ry: 0 });
  }
  chairOffsets.push({ x:  tableW / 2 + 0.45, z: 0, ry: -Math.PI / 2 });
  chairOffsets.push({ x: -tableW / 2 - 0.45, z: 0, ry:  Math.PI / 2 });
  for (const c of chairOffsets) {
    const chair = buildChair();
    chair.position.set(c.x, 0, c.z);
    chair.rotation.y = c.ry;
    parent.add(chair);
  }

  // ===== 3 Smart Displays on 3 walls =====
  // Display 1: Samsung — back wall (Z = -depth/2), centered
  const d1 = buildDisplay({ label: 'Samsung Smart TV (Android)', hue: 210, seed: 1.1 });
  d1.position.set(0, 1.55, -ROOM.depth / 2 + 0.05);
  parent.add(d1);

  // Display 2: LG — left wall, oriented to face right (+X)
  const d2 = buildDisplay({ label: 'LG webOS (Android-like)', hue: 320, seed: 2.3, width: 1.4, height: 0.8 });
  d2.position.set(-ROOM.width / 2 + 0.05, 1.55, 0);
  d2.rotation.y = Math.PI / 2;
  parent.add(d2);

  // Display 3: Samsung — right wall, oriented to face left (-X)
  const d3 = buildDisplay({ label: 'Samsung Smart TV (Android)', hue: 160, seed: 3.5, width: 1.4, height: 0.8 });
  d3.position.set(ROOM.width / 2 - 0.05, 1.55, 0);
  d3.rotation.y = -Math.PI / 2;
  parent.add(d3);

  // Laptops on table (3)
  for (let i = 0; i < 3; i++) {
    const lap = new THREE.Group();
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.02, 0.22),
      new THREE.MeshStandardMaterial({ color: 0x999da3, metalness: 0.7, roughness: 0.35 })
    );
    base.position.y = tableH + 0.04;
    const lid = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.21, 0.015),
      new THREE.MeshStandardMaterial({ color: 0x2a2f3b, metalness: 0.5, roughness: 0.4 })
    );
    lid.position.set(0, tableH + 0.155, -0.10);
    lid.rotation.x = -Math.PI / 8;
    lap.add(base, lid);
    lap.position.x = -1.0 + i * 1.0;
    lap.position.z = 0.1;
    parent.add(lap);
  }
}
