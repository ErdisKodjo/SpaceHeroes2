// Orbite circulaire (version minimale, utilisee a la fin du lancement).
// La Phase 4 l'enrichira : ellipse, HUD (altitude, vitesse, periode), vitesse x1 / x1000.
//
// L'orbite est definie par son rayon et par deux vecteurs unitaires orthogonaux :
//   p0 = direction de la position a theta = 0, t0 = direction du mouvement a theta = 0.
// Position : (p0 cos theta + t0 sin theta) * rayon.

import * as THREE from 'three';

export function createOrbit({ radius, p0, t0, period }) {
  const P0 = p0.clone().normalize();
  const T0 = t0.clone().normalize();
  const normal = new THREE.Vector3().crossVectors(P0, T0).normalize();
  const omega = (Math.PI * 2) / period;

  const SEGMENTS = 256;
  const pts = [];
  for (let i = 0; i < SEGMENTS; i++) {
    const a = (i / SEGMENTS) * Math.PI * 2;
    pts.push(P0.clone().multiplyScalar(Math.cos(a)).addScaledVector(T0, Math.sin(a)).multiplyScalar(radius));
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(pts);
  const material = new THREE.LineDashedMaterial({
    color: 0x7cf0ff,
    dashSize: 0.025,
    gapSize: 0.018,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });
  const ring = new THREE.LineLoop(geometry, material);
  ring.computeLineDistances();
  ring.name = 'orbite';

  const attached = [];
  let theta = 0;
  let ringTarget = 0.6;

  const tmpPos = new THREE.Vector3();
  const tmpDir = new THREE.Vector3();
  const tmpX = new THREE.Vector3();
  const basis = new THREE.Matrix4();

  function positionAt(a, out = new THREE.Vector3()) {
    return out.copy(P0).multiplyScalar(Math.cos(a)).addScaledVector(T0, Math.sin(a)).multiplyScalar(radius);
  }
  function directionAt(a, out = new THREE.Vector3()) {
    return out.copy(P0).multiplyScalar(-Math.sin(a)).addScaledVector(T0, Math.cos(a));
  }

  function place(item) {
    const a = theta + item.offset;
    positionAt(a, tmpPos);
    directionAt(a, tmpDir);
    item.object.position.copy(tmpPos);
    // +Y = zenith, +Z = sens du mouvement.
    const up = tmpPos.clone().normalize();
    tmpX.crossVectors(up, tmpDir).normalize();
    basis.makeBasis(tmpX, up, tmpDir);
    item.object.quaternion.setFromRotationMatrix(basis);
  }

  return {
    object: ring,
    radius,
    normal,
    omega,
    get theta() {
      return theta;
    },
    positionAt,
    directionAt,
    /** Accroche un objet a l'orbite, avec un decalage angulaire (radians) facultatif. */
    attach(object, offset = 0) {
      const item = { object, offset };
      attached.push(item);
      place(item);
    },
    setRingVisible(visible) {
      ringTarget = visible ? 0.6 : 0;
    },
    update(dt) {
      theta += omega * dt;
      for (const item of attached) place(item);
      material.opacity += (ringTarget - material.opacity) * Math.min(1, dt * 1.2);
    },
    dispose() {
      geometry.dispose();
      material.dispose();
    }
  };
}
