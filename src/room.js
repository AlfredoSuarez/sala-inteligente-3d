import * as THREE from 'three';

export const ROOM = {
  width: 9,    // X axis (rectangular - longer side)
  depth: 6,    // Z axis
  height: 3.0,
};

export function buildRoom() {
  const g = new THREE.Group();
  g.name = 'room';

  // Floor (light wood)
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0xc8b292,
    roughness: 0.85,
    metalness: 0.0,
  });
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(ROOM.width, ROOM.depth),
    floorMat
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  g.add(floor);

  // Carpet under table
  const carpet = new THREE.Mesh(
    new THREE.PlaneGeometry(ROOM.width * 0.55, ROOM.depth * 0.55),
    new THREE.MeshStandardMaterial({ color: 0x2b3548, roughness: 0.95 })
  );
  carpet.rotation.x = -Math.PI / 2;
  carpet.position.y = 0.005;
  carpet.receiveShadow = true;
  g.add(carpet);

  // Ceiling
  const ceil = new THREE.Mesh(
    new THREE.PlaneGeometry(ROOM.width, ROOM.depth),
    new THREE.MeshStandardMaterial({ color: 0xeef2f7, roughness: 0.9 })
  );
  ceil.rotation.x = Math.PI / 2;
  ceil.position.y = ROOM.height;
  g.add(ceil);

  // Walls
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0xeaf0f7,
    roughness: 0.9,
    side: THREE.DoubleSide,
  });
  const accentWallMat = new THREE.MeshStandardMaterial({
    color: 0x3a4a66,
    roughness: 0.85,
  });

  // Back wall (Z = -depth/2)
  const back = new THREE.Mesh(
    new THREE.PlaneGeometry(ROOM.width, ROOM.height),
    accentWallMat
  );
  back.position.set(0, ROOM.height / 2, -ROOM.depth / 2);
  back.receiveShadow = true;
  g.add(back);

  // Front wall (Z = +depth/2) - kept partially open visually with darker tone
  const front = new THREE.Mesh(
    new THREE.PlaneGeometry(ROOM.width, ROOM.height),
    wallMat
  );
  front.rotation.y = Math.PI;
  front.position.set(0, ROOM.height / 2, ROOM.depth / 2);
  front.receiveShadow = true;
  g.add(front);

  // Left wall
  const left = new THREE.Mesh(
    new THREE.PlaneGeometry(ROOM.depth, ROOM.height),
    wallMat
  );
  left.rotation.y = Math.PI / 2;
  left.position.set(-ROOM.width / 2, ROOM.height / 2, 0);
  left.receiveShadow = true;
  g.add(left);

  // Right wall
  const right = new THREE.Mesh(
    new THREE.PlaneGeometry(ROOM.depth, ROOM.height),
    wallMat
  );
  right.rotation.y = -Math.PI / 2;
  right.position.set(ROOM.width / 2, ROOM.height / 2, 0);
  right.receiveShadow = true;
  g.add(right);

  // Recessed ceiling lights (4)
  const lampGeo = new THREE.CircleGeometry(0.2, 24);
  const lampMat = new THREE.MeshStandardMaterial({
    color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 1.4
  });
  const positions = [
    [-2.2, ROOM.height - 0.01,  1.5],
    [ 2.2, ROOM.height - 0.01,  1.5],
    [-2.2, ROOM.height - 0.01, -1.5],
    [ 2.2, ROOM.height - 0.01, -1.5],
  ];
  for (const p of positions) {
    const lamp = new THREE.Mesh(lampGeo, lampMat);
    lamp.rotation.x = Math.PI / 2;
    lamp.position.set(...p);
    g.add(lamp);
    const pl = new THREE.PointLight(0xfff5e0, 0.45, 6, 1.6);
    pl.position.set(p[0], p[1] - 0.05, p[2]);
    g.add(pl);
  }

  return g;
}
