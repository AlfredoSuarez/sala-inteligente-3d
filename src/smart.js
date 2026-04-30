import * as THREE from 'three';
import { ROOM } from './room.js';

export const SMART_ADDONS = [
  {
    tag: 'Video bar IA',
    name: 'Logitech Rally Bar (sobre mesa)',
    purpose: 'Encuadre IA RightSight, beamforming hasta 4.5 m. Reemplaza/complementa las cámaras existentes.',
    priceUsd: 3500,
  },
  {
    tag: 'Audio',
    name: 'Shure MXA920 (techo)',
    purpose: 'Array de micrófonos de techo Dante/AES67 para captura uniforme.',
    priceUsd: 4200,
  },
  {
    tag: 'Wearable',
    name: 'Plaud NotePin × 2',
    purpose: 'Grabadora IA portátil con transcripción y resumen automático para reuniones híbridas.',
    priceUsd: 338,
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
  {
    tag: 'Sensor',
    name: 'Sensor de ocupación + ambiente',
    purpose: 'Mide ocupación, CO2 y temperatura. Feed a IWMS para analítica de uso.',
    priceUsd: 220,
  },
];

export function addSmartAddons(parent) {
  // ===== Logitech Rally Bar — on the table, facing the back (main) display =====
  const bar = new THREE.Group();
  const barBody = new THREE.Mesh(
    new THREE.BoxGeometry(0.85, 0.10, 0.10),
    new THREE.MeshStandardMaterial({ color: 0x1a1c20, roughness: 0.55, metalness: 0.4 })
  );
  // Camera lens
  const lens = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.035, 0.035, 24),
    new THREE.MeshStandardMaterial({ color: 0x000000, metalness: 0.85, roughness: 0.18, emissive: 0x122a3a, emissiveIntensity: 0.5 })
  );
  lens.rotation.x = Math.PI / 2;
  lens.position.set(0, 0, 0.06);
  // Tally LED
  const tally = new THREE.Mesh(
    new THREE.SphereGeometry(0.012, 12, 12),
    new THREE.MeshStandardMaterial({ color: 0xff3344, emissive: 0xff3344, emissiveIntensity: 1.5 })
  );
  tally.position.set(0.07, 0.04, 0.06);
  // Mic grille (subtle)
  for (let i = -3; i <= 3; i++) {
    const dot = new THREE.Mesh(
      new THREE.CircleGeometry(0.008, 10),
      new THREE.MeshStandardMaterial({ color: 0x0a0a0c })
    );
    dot.position.set(i * 0.06, -0.03, 0.052);
    bar.add(dot);
  }
  bar.add(barBody, lens, tally);
  bar.position.set(0.6, 0.79, -0.45);
  parent.add(bar);

  // ===== Shure MXA920 ceiling mic (square white panel, centered above table) =====
  const micGroup = new THREE.Group();
  const micPanel = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 0.04, 0.6),
    new THREE.MeshStandardMaterial({ color: 0xeef2f7, roughness: 0.7 })
  );
  micPanel.position.y = ROOM.height - 0.025;
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
  // Center it above the table
  micGroup.position.set(0, 0, 0);
  parent.add(micGroup);

  // ===== Plaud NotePin × 2 on the table =====
  for (const px of [-0.8, 1.2]) {
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
    pin.position.set(px, 0.78, -0.1);
    parent.add(pin);
  }

  // ===== WiFi 6 access point (ceiling) =====
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
  ap.position.set(-1.8, 0, 1.2);
  ap.add(apDisk, apLed);
  parent.add(ap);

  // ===== LED ring around table (on floor) =====
  const ringGeo = new THREE.RingGeometry(2.45, 2.6, 64);
  const ringMat = new THREE.MeshStandardMaterial({
    color: 0x4cc9f0, emissive: 0x4cc9f0, emissiveIntensity: 1.2,
    side: THREE.DoubleSide,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.012;
  ring.userData.isLedRing = true;
  parent.add(ring);

  const glow = new THREE.PointLight(0x4cc9f0, 0.35, 5, 2);
  glow.position.set(0, 0.4, 0);
  parent.add(glow);

  // ===== Occupancy / environment sensor (small on left wall near door) =====
  const sensor = new THREE.Group();
  const sensorBody = new THREE.Mesh(
    new THREE.BoxGeometry(0.10, 0.10, 0.025),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7 })
  );
  const sensorLed = new THREE.Mesh(
    new THREE.SphereGeometry(0.006, 10, 10),
    new THREE.MeshStandardMaterial({ color: 0x00d166, emissive: 0x00d166, emissiveIntensity: 1.6 })
  );
  sensorLed.position.set(0.03, -0.03, 0.014);
  sensor.add(sensorBody, sensorLed);
  sensor.position.set(-ROOM.width / 2 + 0.02, 1.95, ROOM.depth / 2 - 0.6);
  sensor.rotation.y = Math.PI / 2;
  parent.add(sensor);
}
