import * as THREE from 'three';

export const ROOM = {
  width: 6.0,    // X axis - "largo" (back/front walls span this)
  depth: 5.0,    // Z axis - "ancho" (side walls span this)
  height: 3.0,
  // Glass wall is the FRONT (Z = +depth/2). Door sits at +X extreme of that wall.
  doorWidth: 0.95,
  doorHeight: 2.10,
};

export function buildRoom() {
  const g = new THREE.Group();
  g.name = 'room';

  // ===== Floor: dark gray carpet =====
  const carpet = new THREE.Mesh(
    new THREE.PlaneGeometry(ROOM.width, ROOM.depth),
    new THREE.MeshStandardMaterial({ color: 0x4a5260, roughness: 0.95 })
  );
  carpet.rotation.x = -Math.PI / 2;
  carpet.receiveShadow = true;
  g.add(carpet);

  // Floor strip near door (lighter wood)
  const woodStrip = new THREE.Mesh(
    new THREE.PlaneGeometry(1.4, ROOM.depth),
    new THREE.MeshStandardMaterial({ color: 0xb89a78, roughness: 0.85 })
  );
  woodStrip.rotation.x = -Math.PI / 2;
  woodStrip.position.set(ROOM.width / 2 - 0.7, 0.005, 0);
  g.add(woodStrip);

  // ===== Ceiling: drop tile pattern =====
  const ceil = new THREE.Mesh(
    new THREE.PlaneGeometry(ROOM.width, ROOM.depth),
    new THREE.MeshStandardMaterial({ color: 0xeef0f3, roughness: 0.9 })
  );
  ceil.rotation.x = Math.PI / 2;
  ceil.position.y = ROOM.height;
  g.add(ceil);

  // Ceiling tile grid lines (subtle)
  const lineMat = new THREE.LineBasicMaterial({ color: 0xc9cdd4, transparent: true, opacity: 0.6 });
  const tileSize = 0.6;
  for (let x = -ROOM.width / 2; x <= ROOM.width / 2 + 0.001; x += tileSize) {
    const pts = [
      new THREE.Vector3(x, ROOM.height - 0.001, -ROOM.depth / 2),
      new THREE.Vector3(x, ROOM.height - 0.001,  ROOM.depth / 2),
    ];
    g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat));
  }
  for (let z = -ROOM.depth / 2; z <= ROOM.depth / 2 + 0.001; z += tileSize) {
    const pts = [
      new THREE.Vector3(-ROOM.width / 2, ROOM.height - 0.001, z),
      new THREE.Vector3( ROOM.width / 2, ROOM.height - 0.001, z),
    ];
    g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat));
  }

  // ===== Walls (white) =====
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0xeef1f5, roughness: 0.92, side: THREE.DoubleSide,
  });

  // Back wall (Z = -depth/2) — main display wall
  const back = new THREE.Mesh(
    new THREE.PlaneGeometry(ROOM.width, ROOM.height), wallMat
  );
  back.position.set(0, ROOM.height / 2, -ROOM.depth / 2);
  back.receiveShadow = true;
  g.add(back);

  // Left wall (X = -width/2) — has paper charts (we'll add panels in furniture)
  const left = new THREE.Mesh(
    new THREE.PlaneGeometry(ROOM.depth, ROOM.height), wallMat
  );
  left.rotation.y = Math.PI / 2;
  left.position.set(-ROOM.width / 2, ROOM.height / 2, 0);
  left.receiveShadow = true;
  g.add(left);

  // Right wall (X = +width/2)
  const right = new THREE.Mesh(
    new THREE.PlaneGeometry(ROOM.depth, ROOM.height), wallMat
  );
  right.rotation.y = -Math.PI / 2;
  right.position.set(ROOM.width / 2, ROOM.height / 2, 0);
  right.receiveShadow = true;
  g.add(right);

  // ===== FRONT WALL: glass with door at +X end =====
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xc9dde6,
    roughness: 0.05,
    metalness: 0.0,
    transmission: 0.85,
    thickness: 0.05,
    transparent: true,
    opacity: 0.35,
    side: THREE.DoubleSide,
  });

  // Door is on +X end. Glass occupies the rest.
  const doorX = ROOM.width / 2 - ROOM.doorWidth / 2 - 0.05; // door slot at +X end
  const glassEndX = doorX - ROOM.doorWidth / 2 - 0.04;     // glass ends here
  const glassWidth = (ROOM.width / 2) + glassEndX;          // from -W/2 to glassEndX

  // Big glass panel
  const glass = new THREE.Mesh(
    new THREE.PlaneGeometry(glassWidth, ROOM.height),
    glassMat
  );
  glass.position.set(-ROOM.width / 2 + glassWidth / 2, ROOM.height / 2, ROOM.depth / 2);
  g.add(glass);

  // Glass mullions (vertical aluminum bars every ~1.2 m)
  const mullionMat = new THREE.MeshStandardMaterial({ color: 0x2a2e36, metalness: 0.6, roughness: 0.4 });
  const mullionStep = 1.2;
  for (let mx = -ROOM.width / 2 + mullionStep; mx < glassEndX; mx += mullionStep) {
    const m = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, ROOM.height, 0.05),
      mullionMat
    );
    m.position.set(mx, ROOM.height / 2, ROOM.depth / 2);
    g.add(m);
  }
  // Top & bottom rails of glass
  const railTop = new THREE.Mesh(
    new THREE.BoxGeometry(glassWidth, 0.06, 0.05),
    mullionMat
  );
  railTop.position.set(-ROOM.width / 2 + glassWidth / 2, ROOM.height - 0.03, ROOM.depth / 2);
  g.add(railTop);
  const railBot = railTop.clone();
  railBot.position.y = 0.03;
  g.add(railBot);

  // Wall segment ABOVE the door (transom)
  const transomH = ROOM.height - ROOM.doorHeight;
  const transom = new THREE.Mesh(
    new THREE.PlaneGeometry(ROOM.doorWidth + 0.1, transomH),
    wallMat
  );
  transom.position.set(doorX, ROOM.doorHeight + transomH / 2, ROOM.depth / 2);
  transom.rotation.y = Math.PI;
  g.add(transom);

  // Wall segment to the right of door (between door and corner)
  const sidePadW = ROOM.width / 2 - (doorX + ROOM.doorWidth / 2);
  if (sidePadW > 0.01) {
    const sidePad = new THREE.Mesh(
      new THREE.PlaneGeometry(sidePadW, ROOM.height),
      wallMat
    );
    sidePad.position.set(doorX + ROOM.doorWidth / 2 + sidePadW / 2, ROOM.height / 2, ROOM.depth / 2);
    sidePad.rotation.y = Math.PI;
    g.add(sidePad);
  }

  // ===== DOOR (wood) =====
  const door = new THREE.Mesh(
    new THREE.BoxGeometry(ROOM.doorWidth, ROOM.doorHeight, 0.045),
    new THREE.MeshStandardMaterial({ color: 0x6b4a2b, roughness: 0.6 })
  );
  door.position.set(doorX, ROOM.doorHeight / 2, ROOM.depth / 2 - 0.005);
  g.add(door);
  // Door handle
  const handle = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.025, 0.04),
    new THREE.MeshStandardMaterial({ color: 0xb0b3b8, metalness: 0.85, roughness: 0.25 })
  );
  handle.position.set(doorX - ROOM.doorWidth / 2 + 0.12, 1.05, ROOM.depth / 2 - 0.03);
  g.add(handle);
  // Door frame
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x4d3320, roughness: 0.7 });
  const frameTop = new THREE.Mesh(
    new THREE.BoxGeometry(ROOM.doorWidth + 0.1, 0.05, 0.07),
    frameMat
  );
  frameTop.position.set(doorX, ROOM.doorHeight + 0.025, ROOM.depth / 2);
  g.add(frameTop);

  // ===== CEILING: long rectangular LED tubes =====
  const tubeMat = new THREE.MeshStandardMaterial({
    color: 0xffffff, emissive: 0xfff5e6, emissiveIntensity: 1.4
  });
  // 3 tubes running along X (long axis), evenly spaced in Z
  const tubeZ = [-ROOM.depth / 2 + 1.0, 0, ROOM.depth / 2 - 1.0];
  for (const z of tubeZ) {
    const tube = new THREE.Mesh(
      new THREE.BoxGeometry(ROOM.width - 1.0, 0.08, 0.18),
      tubeMat
    );
    tube.position.set(0, ROOM.height - 0.05, z);
    g.add(tube);
    // soft area-ish light
    const pl = new THREE.PointLight(0xfff0d8, 0.55, 8, 1.6);
    pl.position.set(0, ROOM.height - 0.15, z);
    g.add(pl);
  }

  // ===== 2 CEILING SPEAKERS (white round, recessed look) =====
  const spkMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.7 });
  const spkRimMat = new THREE.MeshStandardMaterial({ color: 0xb8bcc4, metalness: 0.3, roughness: 0.5 });
  const speakerPositions = [
    [-ROOM.width / 4, -ROOM.depth / 4],
    [ ROOM.width / 4,  ROOM.depth / 4],
  ];
  for (const [sx, sz] of speakerPositions) {
    const spk = new THREE.Group();
    const ring = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, 0.04, 28),
      spkRimMat
    );
    ring.position.set(0, ROOM.height - 0.02, 0);
    const cone = new THREE.Mesh(
      new THREE.CylinderGeometry(0.13, 0.13, 0.02, 28),
      spkMat
    );
    cone.position.set(0, ROOM.height - 0.035, 0);
    // Tiny mesh dots
    for (let r = 0.03; r <= 0.10; r += 0.035) {
      const dotRing = new THREE.Mesh(
        new THREE.RingGeometry(r - 0.003, r, 24),
        new THREE.MeshStandardMaterial({ color: 0x9aa0a8, side: THREE.DoubleSide })
      );
      dotRing.rotation.x = -Math.PI / 2;
      dotRing.position.set(0, ROOM.height - 0.043, 0);
      spk.add(dotRing);
    }
    spk.add(ring, cone);
    spk.position.set(sx, 0, sz);
    spk.userData.isSpeaker = true;
    g.add(spk);
  }

  // ===== Light switch on left wall near door corner =====
  const swPlate = new THREE.Mesh(
    new THREE.BoxGeometry(0.02, 0.14, 0.10),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 })
  );
  swPlate.position.set(-ROOM.width / 2 + 0.01, 1.25, ROOM.depth / 2 - 0.6);
  g.add(swPlate);

  return g;
}
