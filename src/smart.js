import * as THREE from 'three';
import { ROOM } from './room.js';

export const SMART_ADDONS = [
  {
    tag: 'Video bar',
    name: 'Logitech Rally Bar',
    purpose: 'Encuadre IA RightSight, micrófonos beamforming hasta 4.5 m, certificado Teams/Zoom.',
    priceUsd: 3500,
  },
  {
    tag: 'Audio',
    name: 'Shure MXA920 (techo)',
    purpose: 'Array de micrófonos de techo con Dante/AES67 para salas grandes.',
    priceUsd: 4200,
  },
  {
    tag: 'Pizarrón',
    name: 'Neat Board 65"',
    purpose: 'Pantalla táctil con cámara 4K (113°), 8 micros, altavoces estéreo. Sin PC adicional.',
    priceUsd: 6500,
  },
  {
    tag: 'Wearable',
    name: 'Plaud NotePin',
    purpose: 'Grabadora IA portátil con transcripción y resumen automático.',
    priceUsd: 169,
  },
  {
    tag: 'Red',
    name: 'Access Point WiFi 6',
    purpose: 'WiFi 6 con VLAN dedicada para videoconferencia (≥10 Mbps por sala).',
    priceUsd: 450,
  },
  {
    tag: 'Iluminación',
    name: 'Anillo LED de cortesía',
    purpose: 'Luz indirecta cálida que mejora el rendimiento de la cámara IA.',
    priceUsd: 280,
  },
];

export function addSmartAddons(parent) {
  // ===== Logitech Rally Bar (under center display, on wall) =====
  const bar = new THREE.Group();
  const barBody = new THREE.Mesh(
    new THREE.BoxGeometry(1.0, 0.12, 0.12),
    new THREE.MeshStandardMaterial({ color: 0x1a1c20, roughness: 0.55, metalness: 0.4 })
  );
  // Camera lens (cylinder)
  const lens = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.04, 0.04, 24),
    new THREE.MeshStandardMaterial({ color: 0x000000, metalness: 0.8, roughness: 0.2, emissive: 0x223344, emissiveIntensity: 0.5 })
  );
  lens.rotation.x = Math.PI / 2;
  lens.position.set(0, 0, 0.075);
  // Tally LED
  const tally = new THREE.Mesh(
    new THREE.SphereGeometry(0.012, 12, 12),
    new THREE.MeshStandardMaterial({ color: 0xff3344, emissive: 0xff3344, emissiveIntensity: 1.5 })
  );
  tally.position.set(0.07, 0.04, 0.07);
  bar.add(barBody, lens, tally);
  bar.position.set(0, 0.95, -ROOM.depth / 2 + 0.07);
  parent.add(bar);

  // ===== Shure MXA920 ceiling microphone (square tile) =====
  const micGroup = new THREE.Group();
  const micPanel = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 0.04, 0.6),
    new THREE.MeshStandardMaterial({ color: 0xeef2f7, roughness: 0.7 })
  );
  micPanel.position.y = ROOM.height - 0.025;
  // Hole pattern (small dark dots)
  for (let i = -2; i <= 2; i++) {
    for (let j = -2; j <= 2; j++) {
      const dot = new THREE.Mesh(
        new THREE.CircleGeometry(0.018, 12),
        new THREE.MeshStandardMaterial({ color: 0x222831 })
      );
      dot.rotation.x = Math.PI / 2;
      dot.position.set(i * 0.1, ROOM.height - 0.044, j * 0.1);
      micGroup.add(dot);
    }
  }
  micGroup.add(micPanel);
  parent.add(micGroup);

  // ===== Neat Board 65" smart whiteboard (front wall, off-center) =====
  const neat = new THREE.Group();
  const neatBezel = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 0.95, 0.06),
    new THREE.MeshStandardMaterial({ color: 0x111317, roughness: 0.35, metalness: 0.5 })
  );
  const neatScreenCanvas = document.createElement('canvas');
  neatScreenCanvas.width = 512; neatScreenCanvas.height = 320;
  const nctx = neatScreenCanvas.getContext('2d');
  const ng = nctx.createLinearGradient(0, 0, 512, 320);
  ng.addColorStop(0, '#0a4d68'); ng.addColorStop(1, '#05445e');
  nctx.fillStyle = ng; nctx.fillRect(0, 0, 512, 320);
  nctx.strokeStyle = 'rgba(255,255,255,0.7)';
  nctx.lineWidth = 4;
  nctx.beginPath(); nctx.moveTo(40, 240); nctx.bezierCurveTo(120, 180, 260, 280, 470, 200); nctx.stroke();
  nctx.fillStyle = '#fff';
  nctx.font = 'bold 26px sans-serif';
  nctx.fillText('Neat Board · Pizarrón', 40, 60);
  nctx.font = '16px sans-serif';
  nctx.fillText('Sketch en vivo · transcripción IA', 40, 88);
  const neatTex = new THREE.CanvasTexture(neatScreenCanvas);
  neatTex.colorSpace = THREE.SRGBColorSpace;
  const neatScreen = new THREE.Mesh(
    new THREE.PlaneGeometry(1.42, 0.86),
    new THREE.MeshStandardMaterial({ map: neatTex, emissive: 0xffffff, emissiveMap: neatTex, emissiveIntensity: 0.95 })
  );
  neatScreen.position.z = 0.031;
  neatScreen.userData.isScreen = true;
  neatScreen.userData.seed = 4.7;
  neat.add(neatBezel, neatScreen);
  neat.position.set(2.8, 1.55, ROOM.depth / 2 - 0.05);
  neat.rotation.y = Math.PI;
  parent.add(neat);

  // ===== Plaud NotePin on table =====
  const pin = new THREE.Group();
  const pinBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.025, 0.025, 0.06, 16),
    new THREE.MeshStandardMaterial({ color: 0xc0c4cc, metalness: 0.8, roughness: 0.25 })
  );
  pinBody.rotation.x = Math.PI / 2;
  const pinLed = new THREE.Mesh(
    new THREE.SphereGeometry(0.006, 10, 10),
    new THREE.MeshStandardMaterial({ color: 0x4cc9f0, emissive: 0x4cc9f0, emissiveIntensity: 2 })
  );
  pinLed.position.set(0, 0, 0.032);
  pin.add(pinBody, pinLed);
  pin.position.set(0, 0.78, 0);
  parent.add(pin);

  // ===== WiFi 6 access point on ceiling =====
  const ap = new THREE.Group();
  const apDisk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.18, 0.04, 24),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 })
  );
  apDisk.position.y = ROOM.height - 0.02;
  const apLed = new THREE.Mesh(
    new THREE.SphereGeometry(0.012, 12, 12),
    new THREE.MeshStandardMaterial({ color: 0x4cc9f0, emissive: 0x4cc9f0, emissiveIntensity: 2 })
  );
  apLed.position.set(0, ROOM.height - 0.04, 0);
  ap.position.set(-2.2, 0, 1.5);
  ap.add(apDisk, apLed);
  parent.add(ap);

  // ===== LED ring around table (on floor) =====
  const ringGeo = new THREE.RingGeometry(2.2, 2.35, 64);
  const ringMat = new THREE.MeshStandardMaterial({
    color: 0x4cc9f0,
    emissive: 0x4cc9f0,
    emissiveIntensity: 1.4,
    side: THREE.DoubleSide,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.012;
  ring.userData.isLedRing = true;
  parent.add(ring);

  // Soft glow point lights from ring
  const glow1 = new THREE.PointLight(0x4cc9f0, 0.35, 5, 2);
  glow1.position.set(0, 0.4, 0);
  parent.add(glow1);
}
