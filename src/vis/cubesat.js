// CubeSat 1U (version Phase 3 : modele de base + deploiement des panneaux).
// La Phase 2 ajoutera addComponent(type) pour construire le satellite piece par piece
// depuis l'Atelier ; l'API ci-dessous restera compatible.
//
// Repere local : +Y = vers l'exterieur de l'orbite (zenith), +Z = sens du deplacement.

import * as THREE from 'three';

function glowTexture() {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.25, 'rgba(160,240,255,0.85)');
  g.addColorStop(1, 'rgba(124,240,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

export function createCubeSat({ size = 0.005 } = {}) {
  const group = new THREE.Group();
  group.name = 'cubesat';

  const cells = new THREE.MeshStandardMaterial({ color: 0x1c2f78, roughness: 0.35, metalness: 0.4 });
  const alu = new THREE.MeshStandardMaterial({ color: 0xc9ccd2, roughness: 0.35, metalness: 0.9 });
  const gold = new THREE.MeshStandardMaterial({ color: 0xd4a640, roughness: 0.3, metalness: 1 });

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.94, 0.94, 0.94), cells);
  body.userData.famille = 'structure';
  group.add(body);
  for (const [x, z] of [[-0.47, -0.47], [0.47, -0.47], [-0.47, 0.47], [0.47, 0.47]]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.06, 0.1), alu);
    rail.position.set(x, 0, z);
    rail.userData.famille = 'structure';
    group.add(rail);
  }
  const top = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.04, 0.6), gold);
  top.position.y = 0.49;
  top.userData.famille = 'instrument';
  group.add(top);

  const tuyere = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.28, 8), gold);
  tuyere.position.y = -0.64;
  tuyere.rotation.x = Math.PI;
  tuyere.userData.famille = 'moteurs';
  group.add(tuyere);

  // Panneaux solaires : charnieres sur les faces +X / -X, replies contre le corps au depart.
  const panels = [];
  for (const side of [1, -1]) {
    const hinge = new THREE.Group();
    hinge.position.set(0.5 * side, 0, 0);
    const panel = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.03, 0.9), cells);
    panel.position.x = 0.85 * side;
    panel.userData.famille = 'energie';
    hinge.add(panel);
    hinge.userData.side = side;
    group.add(hinge);
    panels.push(hinge);
  }

  // Antenne (fouet) qui se deroule. Une zone invisible plus large rend le fouet cliquable.
  const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1, 6), alu);
  antenna.geometry.translate(0, 0.5, 0);
  antenna.position.set(0.2, 0.5, 0.2);
  antenna.scale.y = 0.001;
  antenna.userData.famille = 'communications';
  group.add(antenna);
  const zoneAntenne = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.12, 1, 6),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  zoneAntenne.geometry.translate(0, 0.5, 0);
  zoneAntenne.position.copy(antenna.position);
  zoneAntenne.scale.y = 0.001;
  zoneAntenne.userData.famille = 'communications';
  group.add(zoneAntenne);

  // Balise lumineuse : garde le satellite visible de loin (taille fixe en pixels).
  const markerGeo = new THREE.BufferGeometry();
  markerGeo.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0], 3));
  const markerMat = new THREE.PointsMaterial({
    size: 18,
    sizeAttenuation: false,
    map: glowTexture(),
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    color: 0x9ff4ff
  });
  const marker = new THREE.Points(markerGeo, markerMat);
  marker.renderOrder = 5;
  marker.raycast = () => {};
  group.add(marker);

  group.scale.setScalar(size);

  let deploy = 0;
  let deploying = false;
  let time = 0;

  function applyDeploy() {
    const e = 1 - Math.pow(1 - deploy, 3);
    for (const h of panels) h.rotation.z = (1 - e) * (Math.PI / 2) * h.userData.side;
    antenna.scale.y = Math.max(0.001, Math.min(1, deploy * 1.4 - 0.4) * 1.6);
    zoneAntenne.scale.y = antenna.scale.y;
  }
  applyDeploy();

  return {
    object: group,
    deploy() {
      deploying = true;
    },
    update(dt) {
      time += dt;
      if (deploying && deploy < 1) {
        deploy = Math.min(1, deploy + dt / 2.5);
        applyDeploy();
      }
      markerMat.size = 14 + 5 * Math.sin(time * 3.2);
    },
    dispose() {
      group.traverse((o) => {
        o.geometry?.dispose();
        o.material?.map?.dispose();
        o.material?.dispose();
      });
    }
  };
}
