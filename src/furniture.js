import * as THREE from 'three';
import { ROOM } from './room.js';

const MAT = {
  tableTop: new THREE.MeshStandardMaterial({ color: 0xd9c4a3, roughness: 0.55, metalness: 0.05 }),
  tableLeg: new THREE.MeshStandardMaterial({ color: 0xc9b48f, roughness: 0.6 }),
  chairSeat: new THREE.MeshStandardMaterial({ color: 0x868c97, roughness: 0.95 }),
  chairFrame: new THREE.MeshStandardMaterial({ color: 0x2a2f3b, roughness: 0.65, metalness: 0.4 }),
  bezel: new THREE.MeshStandardMaterial({ color: 0x0a0a0c, roughness: 0.3, metalness: 0.6 }),
  cameraBody: new THREE.MeshStandardMaterial({ color: 0x1a1c20, roughness: 0.55, metalness: 0.4 }),
};

function makeScreenMaterial({ hue, mode = 'ui' }) {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 288;
  const ctx = canvas.getContext('2d');
  if (mode === 'off') {
    ctx.fillStyle = '#0a0c11';
    ctx.fillRect(0, 0, 512, 288);
  } else if (mode === 'home') {
    // Samsung Flip / Smart Board home screen mock
    const bg = ctx.createLinearGradient(0, 0, 0, 288);
    bg.addColorStop(0, '#dde8f0'); bg.addColorStop(1, '#c0d2dd');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, 512, 288);
    // App grid
    const labels = ['Notas','Web','Cast','Office','Whiteboard','Settings'];
    for (let i = 0; i < 6; i++) {
      const x = 60 + (i % 3) * 140, y = 60 + Math.floor(i / 3) * 110;
      ctx.fillStyle = `hsl(${(hue + i * 35) % 360}, 60%, 55%)`;
      ctx.fillRect(x, y, 100, 80);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(labels[i], x + 10, y + 100);
    }
    ctx.fillStyle = '#11304a';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('Sala de juntas — Facility Mgmt', 24, 28);
  } else {
    // Meeting UI
    const grad = ctx.createLinearGradient(0, 0, 512, 288);
    grad.addColorStop(0, `hsl(${hue}, 70%, 28%)`);
    grad.addColorStop(1, `hsl(${(hue + 35) % 360}, 60%, 16%)`);
    ctx.fillStyle = grad; ctx.fillRect(0, 0, 512, 288);
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('Reunión en curso', 26, 44);
    ctx.font = '14px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText('Facility Management — Abril 2026', 26, 66);
    for (let i = 0; i < 6; i++) {
      const x = 26 + (i % 3) * 156, y = 90 + Math.floor(i / 3) * 90;
      ctx.fillStyle = `hsla(${(hue + i * 30) % 360}, 60%, 50%, 0.85)`;
      ctx.fillRect(x, y, 144, 80);
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(`Participante ${i + 1}`, x + 8, y + 72);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return new THREE.MeshStandardMaterial({
    map: tex, emissive: 0xffffff, emissiveMap: tex,
    emissiveIntensity: mode === 'off' ? 0.0 : 0.95,
    roughness: 0.3, metalness: 0.0,
  });
}

function buildDisplay({ width = 1.85, height = 1.07, label = 'Smart Display 75"', seed = 0, hue = 200, mode = 'ui' }) {
  const g = new THREE.Group();

  // Bezel (slim)
  const bezel = new THREE.Mesh(
    new THREE.BoxGeometry(width + 0.04, height + 0.04, 0.06),
    MAT.bezel
  );
  bezel.castShadow = true;
  g.add(bezel);

  // Screen
  const screenMat = makeScreenMaterial({ hue, mode });
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    screenMat
  );
  screen.position.z = 0.031;
  screen.userData.isScreen = true;
  screen.userData.seed = seed;
  g.add(screen);

  // Brand label (small, on bezel bottom)
  const brandCanvas = document.createElement('canvas');
  brandCanvas.width = 256; brandCanvas.height = 48;
  const bctx = brandCanvas.getContext('2d');
  bctx.fillStyle = '#0a0a0c'; bctx.fillRect(0, 0, 256, 48);
  bctx.fillStyle = '#ffffff';
  bctx.font = 'bold 18px sans-serif';
  bctx.textAlign = 'center';
  bctx.fillText(label, 128, 30);
  const tex = new THREE.CanvasTexture(brandCanvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const labelMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(0.32, 0.06),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true })
  );
  labelMesh.position.set(0, -height / 2 - 0.05, 0.032);
  g.add(labelMesh);

  return g;
}

// Small camera bar mounted ABOVE a display (like Logitech MeetUp / Rally Mini)
function buildCameraBar({ width = 0.42 } = {}) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(width, 0.075, 0.10),
    MAT.cameraBody
  );
  body.castShadow = true;
  g.add(body);
  // Camera lens
  const lens = new THREE.Mesh(
    new THREE.CylinderGeometry(0.022, 0.022, 0.025, 20),
    new THREE.MeshStandardMaterial({ color: 0x000000, metalness: 0.85, roughness: 0.18, emissive: 0x122a3a, emissiveIntensity: 0.5 })
  );
  lens.rotation.x = Math.PI / 2;
  lens.position.set(0, 0, 0.062);
  g.add(lens);
  // Tally LED
  const tally = new THREE.Mesh(
    new THREE.SphereGeometry(0.008, 10, 10),
    new THREE.MeshStandardMaterial({ color: 0x00d166, emissive: 0x00d166, emissiveIntensity: 1.6 })
  );
  tally.position.set(width / 2 - 0.05, 0.02, 0.055);
  g.add(tally);
  // Mounting arm to wall
  const arm = new THREE.Mesh(
    new THREE.BoxGeometry(0.04, 0.16, 0.04),
    MAT.cameraBody
  );
  arm.position.set(0, 0.10, -0.04);
  g.add(arm);
  return g;
}

function buildChair() {
  const g = new THREE.Group();
  // Mesh seat
  const seat = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.06, 0.5),
    MAT.chairSeat
  );
  seat.position.y = 0.48;
  seat.castShadow = true;
  g.add(seat);
  // Mesh back (taller, slight curve via thin box)
  const back = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.62, 0.04),
    MAT.chairSeat
  );
  back.position.set(0, 0.82, -0.22);
  back.castShadow = true;
  g.add(back);
  // Arm rests (small)
  for (const sx of [-1, 1]) {
    const arm = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.06, 0.30),
      MAT.chairFrame
    );
    arm.position.set(sx * 0.27, 0.62, -0.05);
    g.add(arm);
    const armPost = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.18, 0.04),
      MAT.chairFrame
    );
    armPost.position.set(sx * 0.27, 0.55, 0.05);
    g.add(armPost);
  }
  // Center column
  const col = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.03, 0.42, 12),
    MAT.chairFrame
  );
  col.position.y = 0.27;
  g.add(col);
  // 5-leg base
  for (let i = 0; i < 5; i++) {
    const leg = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.025, 0.04),
      MAT.chairFrame
    );
    leg.position.y = 0.06;
    leg.position.x = Math.cos(i / 5 * Math.PI * 2) * 0.16;
    leg.position.z = Math.sin(i / 5 * Math.PI * 2) * 0.16;
    leg.rotation.y = i / 5 * Math.PI * 2;
    g.add(leg);
  }
  return g;
}

// White paper charts taped to a wall (shown in photos)
function buildWallCharts(parent, { wall = 'left', count = 3 } = {}) {
  for (let i = 0; i < count; i++) {
    const chart = new THREE.Group();
    const paper = new THREE.Mesh(
      new THREE.PlaneGeometry(0.7, 0.95),
      new THREE.MeshStandardMaterial({ color: 0xfafafa, roughness: 0.95 })
    );
    chart.add(paper);
    // Sticky-note dots
    for (let k = 0; k < 18; k++) {
      const note = new THREE.Mesh(
        new THREE.PlaneGeometry(0.06, 0.06),
        new THREE.MeshStandardMaterial({
          color: ['#f6e58d', '#7bed9f', '#dff9fb', '#ffbe76'][k % 4],
          roughness: 0.95
        })
      );
      note.position.set(
        -0.30 + (k % 5) * 0.13,
        -0.40 + Math.floor(k / 5) * 0.18,
        0.001
      );
      chart.add(note);
    }
    chart.position.set(
      wall === 'left' ? -ROOM.width / 2 + 0.02 : ROOM.width / 2 - 0.02,
      1.55,
      -1.6 + i * 0.95
    );
    chart.rotation.y = wall === 'left' ? Math.PI / 2 : -Math.PI / 2;
    parent.add(chart);
  }
}

export function addBaseFurniture(parent) {
  // ===== Rectangular table at center (longer to fill 6m room) =====
  const tableW = 4.0, tableD = 1.4, tableH = 0.74;
  const top = new THREE.Mesh(
    new THREE.BoxGeometry(tableW, 0.05, tableD),
    MAT.tableTop
  );
  top.position.y = tableH;
  top.castShadow = true;
  top.receiveShadow = true;
  parent.add(top);

  // Two leg panels
  for (const sx of [-1, 1]) {
    const leg = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, tableH - 0.04, tableD - 0.2),
      MAT.tableLeg
    );
    leg.position.set(sx * (tableW / 2 - 0.5), (tableH - 0.04) / 2, 0);
    leg.castShadow = true;
    parent.add(leg);
  }
  // Cross bar
  const cross = new THREE.Mesh(
    new THREE.BoxGeometry(tableW - 1.0, 0.05, 0.05),
    MAT.tableLeg
  );
  cross.position.y = 0.12;
  parent.add(cross);

  // ===== Chairs (4 + 4 along long sides + 1 + 1 at heads = 10) =====
  const chairOffsets = [];
  const longSpacing = tableW / 4;
  for (let i = 0; i < 4; i++) {
    const x = -tableW / 2 + longSpacing / 2 + i * longSpacing;
    chairOffsets.push({ x, z:  tableD / 2 + 0.50, ry: Math.PI });
    chairOffsets.push({ x, z: -tableD / 2 - 0.50, ry: 0 });
  }
  chairOffsets.push({ x:  tableW / 2 + 0.50, z: 0, ry: -Math.PI / 2 });
  chairOffsets.push({ x: -tableW / 2 - 0.50, z: 0, ry:  Math.PI / 2 });
  for (const c of chairOffsets) {
    const chair = buildChair();
    chair.position.set(c.x, 0, c.z);
    chair.rotation.y = c.ry;
    parent.add(chair);
  }

  // ===== 3 SMART DISPLAYS (75" interactive Samsung Flip / Smart Board style) =====
  // Display 1: BACK wall (long, opposite the glass) — main one, larger
  const d1 = buildDisplay({
    label: 'Samsung Flip Pro 75"', hue: 210, seed: 1.1, mode: 'ui',
    width: 1.95, height: 1.10
  });
  d1.position.set(-0.4, 1.55, -ROOM.depth / 2 + 0.04);
  parent.add(d1);
  const cam1 = buildCameraBar({ width: 0.46 });
  cam1.position.set(-0.4, 2.18, -ROOM.depth / 2 + 0.05);
  parent.add(cam1);

  // Display 2: LEFT short wall — facing right (+X)
  const d2 = buildDisplay({
    label: 'LG CreateBoard 75"', hue: 320, seed: 2.3, mode: 'home',
    width: 1.85, height: 1.05
  });
  d2.position.set(-ROOM.width / 2 + 0.04, 1.55, -0.6);
  d2.rotation.y = Math.PI / 2;
  parent.add(d2);
  const cam2 = buildCameraBar({ width: 0.42 });
  cam2.position.set(-ROOM.width / 2 + 0.05, 2.15, -0.6);
  cam2.rotation.y = Math.PI / 2;
  parent.add(cam2);

  // Display 3: RIGHT short wall — facing left (-X)
  const d3 = buildDisplay({
    label: 'Samsung Flip Pro 75"', hue: 195, seed: 3.5, mode: 'ui',
    width: 1.85, height: 1.05
  });
  d3.position.set(ROOM.width / 2 - 0.04, 1.55, -0.4);
  d3.rotation.y = -Math.PI / 2;
  parent.add(d3);
  const cam3 = buildCameraBar({ width: 0.42 });
  cam3.position.set(ROOM.width / 2 - 0.05, 2.15, -0.4);
  cam3.rotation.y = -Math.PI / 2;
  parent.add(cam3);

  // ===== Wall charts (paper printouts on right wall, like in photos) =====
  buildWallCharts(parent, { wall: 'right', count: 2 });

  // ===== Laptops + cup on table =====
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
    lap.position.x = -1.2 + i * 1.2;
    lap.position.z = 0.1;
    parent.add(lap);
  }
  // Coffee cup
  const cup = new THREE.Mesh(
    new THREE.CylinderGeometry(0.045, 0.04, 0.09, 18),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 })
  );
  cup.position.set(-1.5, tableH + 0.045, -0.4);
  parent.add(cup);
}
