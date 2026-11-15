// Orbite de Kepler (ellipse) : le CubeSat avance selon l'anomalie moyenne,
// l'altitude et la vitesse varient entre periapsis et apoapsis.
// timeScale : 1 = temps reel (periode ~95,6 min), 1000 = un tour en quelques secondes.

import * as THREE from 'three';

function solveKepler(M, e) {
  let E = M;
  for (let i = 0; i < 10; i++) {
    const dE = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    E -= dE;
    if (Math.abs(dE) < 1e-10) break;
  }
  return E;
}

export function createOrbit({
  a,
  e = 0,
  p0,
  t0,
  period,
  earthRadiusKm = 6378,
  muKm3s2 = 398600,
  timeScale = 1
}) {
  const ecc = Math.min(0.95, Math.max(0, e));
  const P0 = p0.clone().normalize();
  const T0 = t0.clone().normalize();
  const normal = new THREE.Vector3().crossVectors(P0, T0).normalize();
  const n = (Math.PI * 2) / period;
  const bOverA = Math.sqrt(1 - ecc * ecc);
  const aKm = a * earthRadiusKm;

  const tmpPos = new THREE.Vector3();
  const tmpDir = new THREE.Vector3();
  const tmpX = new THREE.Vector3();
  const basis = new THREE.Matrix4();

  function positionAtMean(M, out = new THREE.Vector3()) {
    const E = solveKepler(M, ecc);
    const x = a * (Math.cos(E) - ecc);
    const y = a * bOverA * Math.sin(E);
    return out.copy(P0).multiplyScalar(x).addScaledVector(T0, y);
  }

  function directionAtMean(M, out = new THREE.Vector3()) {
    const E = solveKepler(M, ecc);
    const denom = 1 - ecc * Math.cos(E);
    const vx = -Math.sin(E) / denom;
    const vy = (bOverA * Math.cos(E)) / denom;
    return out.copy(P0).multiplyScalar(vx).addScaledVector(T0, vy).normalize();
  }

  const SEGMENTS = 256;
  const pts = [];
  const tmp = new THREE.Vector3();
  for (let i = 0; i < SEGMENTS; i++) {
    const M = (i / SEGMENTS) * Math.PI * 2;
    pts.push(positionAtMean(M, tmp).clone());
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
  let meanAnomaly = 0;
  let scale = timeScale;
  let ringTarget = 0.6;

  function place(item) {
    const M = meanAnomaly + item.offset;
    positionAtMean(M, tmpPos);
    directionAtMean(M, tmpDir);
    item.object.position.copy(tmpPos);
    const up = tmpPos.clone().normalize();
    tmpX.crossVectors(up, tmpDir).normalize();
    basis.makeBasis(tmpX, up, tmpDir);
    item.object.quaternion.setFromRotationMatrix(basis);
  }

  function telemetry() {
    const E = solveKepler(meanAnomaly, ecc);
    const rScene = a * (1 - ecc * Math.cos(E));
    const rKm = rScene * earthRadiusKm;
    const speedKms = Math.sqrt(Math.max(0, muKm3s2 * (2 / rKm - 1 / aKm)));
    return {
      altitudeKm: rKm - earthRadiusKm,
      speedKms,
      periodMin: period / 60,
      periapsisKm: aKm * (1 - ecc) - earthRadiusKm,
      apoapsisKm: aKm * (1 + ecc) - earthRadiusKm,
      eccentricity: ecc,
      timeScale: scale,
      phase: meanAnomaly
    };
  }

  return {
    object: ring,
    radius: a,
    a,
    e: ecc,
    normal,
    get theta() {
      return meanAnomaly;
    },
    get timeScale() {
      return scale;
    },
    positionAt: positionAtMean,
    directionAt: directionAtMean,
    telemetry,
    setTimeScale(value) {
      scale = value;
    },
    attach(object, offset = 0) {
      const item = { object, offset };
      attached.push(item);
      place(item);
    },
    setRingVisible(visible) {
      ringTarget = visible ? 0.6 : 0;
    },
    update(dt) {
      meanAnomaly += n * dt * scale;
      if (meanAnomaly > Math.PI * 4) meanAnomaly %= Math.PI * 2;
      for (const item of attached) place(item);
      material.opacity += (ringTarget - material.opacity) * Math.min(1, dt * 1.2);
    },
    dispose() {
      geometry.dispose();
      material.dispose();
    }
  };
}
