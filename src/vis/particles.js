// Champ d'etoiles procedural (Phase 1).
// 5 000 etoiles sur une coquille lointaine, dont une partie concentree le long d'une
// bande inclinee (evocation de la Voie lactee). Scintillement calcule dans le shader :
// aucun cout CPU par frame, seul l'uniform uTime change.

import * as THREE from 'three';

const VERTEX = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  attribute vec3 aColor;
  uniform float uTime;
  uniform float uPixelRatio;
  varying vec3 vColor;
  varying float vTwinkle;

  void main() {
    // Chaque etoile scintille a sa propre vitesse/phase.
    float speed = 0.6 + fract(aPhase * 7.13) * 2.4;
    vTwinkle = 0.65 + 0.35 * sin(uTime * speed + aPhase * 6.2831);
    vColor = aColor;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPixelRatio * (0.8 + 0.2 * vTwinkle);
  }
`;

const FRAGMENT = /* glsl */ `
  varying vec3 vColor;
  varying float vTwinkle;

  void main() {
    // Disque doux : coeur brillant + halo qui s'estompe.
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float core = smoothstep(0.5, 0.0, d);
    float alpha = pow(core, 2.2) * vTwinkle;
    gl_FragColor = vec4(vColor * (0.6 + 0.6 * core), alpha);
  }
`;

// Couleurs inspirees des types spectraux (O/B bleutees -> K/M orangees).
const PALETTE = [
  new THREE.Color(0x9bb0ff),
  new THREE.Color(0xcad7ff),
  new THREE.Color(0xffffff),
  new THREE.Color(0xfff4ea),
  new THREE.Color(0xffd2a1),
  new THREE.Color(0xffb46b)
];
const PALETTE_WEIGHTS = [0.08, 0.17, 0.35, 0.22, 0.12, 0.06];

function pickColor(rand) {
  let acc = 0;
  for (let i = 0; i < PALETTE.length; i++) {
    acc += PALETTE_WEIGHTS[i];
    if (rand <= acc) return PALETTE[i];
  }
  return PALETTE[2];
}

export function createStarfield({ count = 5000, radius = 400, milkyWayShare = 0.35 } = {}) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const phases = new Float32Array(count);

  // Plan de la bande galactique, incline par rapport a l'equateur de la scene.
  const bandNormal = new THREE.Vector3(0.35, 1, 0.25).normalize();
  const v = new THREE.Vector3();

  for (let i = 0; i < count; i++) {
    // Direction uniforme sur la sphere.
    v.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1);
    if (v.lengthSq() < 1e-6) v.set(1, 0, 0);
    v.normalize();

    // Une partie des etoiles est "aplatie" vers la bande galactique.
    if (Math.random() < milkyWayShare) {
      const h = v.dot(bandNormal);
      const spread = (Math.random() + Math.random() + Math.random() - 1.5) * 0.12;
      v.addScaledVector(bandNormal, -h + spread).normalize();
    }

    const r = radius * (0.85 + Math.random() * 0.15);
    positions[i * 3] = v.x * r;
    positions[i * 3 + 1] = v.y * r;
    positions[i * 3 + 2] = v.z * r;

    const c = pickColor(Math.random());
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;

    // Distribution de magnitudes : beaucoup de petites etoiles, quelques brillantes.
    sizes[i] = 1.0 + Math.pow(Math.random(), 6) * 4.5;
    phases[i] = Math.random();
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));

  const material = new THREE.ShaderMaterial({
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 2) }
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;

  return {
    object: points,
    update(elapsed) {
      material.uniforms.uTime.value = elapsed;
      // Derive tres lente du ciel pour donner de la vie au fond.
      points.rotation.y = elapsed * 0.004;
    },
    setPixelRatio(ratio) {
      material.uniforms.uPixelRatio.value = ratio;
    },
    dispose() {
      geometry.dispose();
      material.dispose();
    }
  };
}

// ---------------------------------------------------------------------------
// Reservoir de particules generique (Phase 3 : fumee, flammes, etincelles).
// Pool fixe recycle en anneau : aucune allocation pendant l'animation.
// Taille des points en unites monde (attenuation avec la distance a la camera).

const POOL_VERTEX = /* glsl */ `
  attribute float aSize;
  attribute float aAlpha;
  attribute vec3 aColor;
  uniform float uScale;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vColor = aColor;
    vAlpha = aAlpha;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aAlpha > 0.0 ? aSize * uScale / max(-mv.z, 0.0005) : 0.0;
  }
`;

const POOL_FRAGMENT = /* glsl */ `
  uniform float uAdditive;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.0, d);
    a = mix(a * a, a, uAdditive) * vAlpha;
    gl_FragColor = vec4(vColor * mix(1.0, a, uAdditive), a);
  }
`;

export function createParticlePool({ max = 3000, additive = false } = {}) {
  const position = new Float32Array(max * 3);
  const color = new Float32Array(max * 3);
  const alpha = new Float32Array(max);
  const size = new Float32Array(max);

  const vel = new Float32Array(max * 3);
  const acc = new Float32Array(max * 3);
  const life = new Float32Array(max);
  const maxLife = new Float32Array(max);
  const size0 = new Float32Array(max);
  const size1 = new Float32Array(max);
  const color0 = new Float32Array(max * 3);
  const color1 = new Float32Array(max * 3);
  const alpha0 = new Float32Array(max);
  const drag = new Float32Array(max);
  let cursor = 0;
  let alive = 0;

  const geometry = new THREE.BufferGeometry();
  const attr = (arr, n) => new THREE.BufferAttribute(arr, n).setUsage(THREE.DynamicDrawUsage);
  const posAttr = attr(position, 3);
  const colAttr = attr(color, 3);
  const alphaAttr = attr(alpha, 1);
  const sizeAttr = attr(size, 1);
  geometry.setAttribute('position', posAttr);
  geometry.setAttribute('aColor', colAttr);
  geometry.setAttribute('aAlpha', alphaAttr);
  geometry.setAttribute('aSize', sizeAttr);

  const material = new THREE.ShaderMaterial({
    vertexShader: POOL_VERTEX,
    fragmentShader: POOL_FRAGMENT,
    uniforms: {
      uScale: { value: 500 },
      uAdditive: { value: additive ? 1 : 0 }
    },
    transparent: true,
    depthWrite: false,
    blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending
  });

  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  points.renderOrder = additive ? 3 : 2;

  return {
    object: points,

    /**
     * Emet une particule. `o` : { position, velocity, acceleration?, life, size:[debut,fin],
     * color:[Color debut, Color fin], alpha, drag? } (vecteurs THREE.Vector3).
     */
    emit(o) {
      const i = cursor;
      cursor = (cursor + 1) % max;
      const i3 = i * 3;
      position[i3] = o.position.x;
      position[i3 + 1] = o.position.y;
      position[i3 + 2] = o.position.z;
      vel[i3] = o.velocity.x;
      vel[i3 + 1] = o.velocity.y;
      vel[i3 + 2] = o.velocity.z;
      const a = o.acceleration;
      acc[i3] = a ? a.x : 0;
      acc[i3 + 1] = a ? a.y : 0;
      acc[i3 + 2] = a ? a.z : 0;
      life[i] = maxLife[i] = o.life;
      size0[i] = o.size[0];
      size1[i] = o.size[1];
      color0[i3] = o.color[0].r;
      color0[i3 + 1] = o.color[0].g;
      color0[i3 + 2] = o.color[0].b;
      color1[i3] = o.color[1].r;
      color1[i3 + 1] = o.color[1].g;
      color1[i3 + 2] = o.color[1].b;
      alpha0[i] = o.alpha;
      drag[i] = o.drag || 0;
      alive = Math.max(alive, i + 1);
    },

    update(dt) {

      for (let i = 0; i < alive; i++) {
        if (life[i] <= 0) continue;
        life[i] -= dt;
        if (life[i] <= 0) {
          alpha[i] = 0;
          continue;
        }

        const i3 = i * 3;
        const k = 1 - life[i] / maxLife[i]; // 0 -> 1 au cours de la vie
        const damp = Math.max(0, 1 - drag[i] * dt);
        for (let c = 0; c < 3; c++) {
          vel[i3 + c] = (vel[i3 + c] + acc[i3 + c] * dt) * damp;
          position[i3 + c] += vel[i3 + c] * dt;
          color[i3 + c] = color0[i3 + c] + (color1[i3 + c] - color0[i3 + c]) * k;
        }
        size[i] = size0[i] + (size1[i] - size0[i]) * Math.sqrt(k);
        // Apparition rapide, disparition progressive.
        alpha[i] = alpha0[i] * Math.min(1, k * 12) * (1 - k);
      }
      posAttr.needsUpdate = true;
      colAttr.needsUpdate = true;
      alphaAttr.needsUpdate = true;
      sizeAttr.needsUpdate = true;
    },

    /** A appeler au redimensionnement : hauteur du canvas en pixels physiques + fov camera. */
    setViewport(heightPx, fovDeg) {
      material.uniforms.uScale.value = heightPx / (2 * Math.tan(THREE.MathUtils.degToRad(fovDeg) / 2));
    },

    dispose() {
      geometry.dispose();
      material.dispose();
    }
  };
}
