// Lanceur procedural a 2 etages (Phase 3).
// Modele construit en unites "hauteur de fusee = 1", puis mis a l'echelle par `height`.
// Origine = bas de la tuyere du 1er etage, axe +Y = axe de la fusee.

import * as THREE from 'three';

const FLAME_VERTEX = /* glsl */ `
  varying vec2 vUv;
  varying float vFacing;

  void main() {
    vUv = uv;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vec3 n = normalize(normalMatrix * normal);
    // Bords du cone adoucis : opacite liee a l'angle de vue.
    vFacing = abs(dot(n, normalize(-mv.xyz)));
    gl_Position = projectionMatrix * mv;
  }
`;

const FLAME_FRAGMENT = /* glsl */ `
  uniform float uTime;
  uniform float uThrottle;
  uniform vec3 uHot;
  uniform vec3 uCool;
  uniform float uIntensity;
  varying vec2 vUv;
  varying float vFacing;

  void main() {
    float s = vUv.y; // 0 = sortie de tuyere, 1 = pointe de la flamme
    float flicker = 0.82 + 0.18 * sin(uTime * 41.0 + vUv.x * 31.4) * sin(uTime * 23.0 - s * 12.0);
    // Diamants de choc : bandes lumineuses regulieres pres de la tuyere.
    float diamonds = 1.0 + 0.35 * smoothstep(0.6, 0.0, s) * pow(abs(sin(s * 28.0 - uTime * 6.0)), 6.0);
    vec3 col = mix(uHot, uCool, smoothstep(0.05, 0.75, s));
    float a = pow(1.0 - s, 1.6) * pow(vFacing, 1.4) * uThrottle * flicker * diamonds;
    gl_FragColor = vec4(col * a * uIntensity, a);
  }
`;

function createFlame({ radius, length, hot, cool, intensity }) {
  const geometry = new THREE.ConeGeometry(1, 1, 32, 6, true);
  geometry.rotateX(Math.PI); // pointe vers le bas
  geometry.translate(0, -0.5, 0); // base (tuyere) en y = 0
  const uniforms = {
    uTime: { value: 0 },
    uThrottle: { value: 0 },
    uHot: { value: new THREE.Color(hot) },
    uCool: { value: new THREE.Color(cool) },
    uIntensity: { value: intensity }
  };
  const material = new THREE.ShaderMaterial({
    vertexShader: FLAME_VERTEX,
    fragmentShader: FLAME_FRAGMENT,
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.renderOrder = 4;
  mesh.visible = false;
  return { mesh, uniforms, radius, length };
}

function mat(color, { roughness = 0.5, metalness = 0.1 } = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

function cylinder(rTop, rBottom, h, material, y, open = false) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBottom, h, 32, 1, open), material);
  m.position.y = y;
  return m;
}

export function createRocket({ height = 0.03 } = {}) {
  const group = new THREE.Group();
  group.name = 'lanceur';
  const lower = new THREE.Group();
  const upper = new THREE.Group();
  group.add(lower, upper);

  const R = 0.055;
  const white = mat(0xf1f3f6, { roughness: 0.45 });
  const black = mat(0x16181d, { roughness: 0.6 });
  const metal = mat(0x8a8f99, { roughness: 0.3, metalness: 0.85 });
  // Materiaux propres au 1er etage (il s'estompe seul apres la separation).
  const whiteLow = white.clone();
  const blackLow = black.clone();
  const metalLow = metal.clone();

  // --- 1er etage ---
  lower.add(cylinder(0.028, 0.05, 0.07, metalLow, 0.035, true)); // tuyere
  lower.add(cylinder(R, 0.04, 0.03, blackLow, 0.085)); // jupe moteur
  lower.add(cylinder(R, R, 0.52, whiteLow, 0.36)); // reservoirs
  lower.add(cylinder(R * 1.01, R * 1.01, 0.05, blackLow, 0.27)); // bande de roulis
  lower.add(cylinder(R, R, 0.04, blackLow, 0.64)); // inter-etage
  for (let k = 0; k < 4; k++) {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.12, 0.05), blackLow);
    const a = (k * Math.PI) / 2 + Math.PI / 4;
    fin.position.set(Math.cos(a) * (R + 0.022), 0.15, Math.sin(a) * (R + 0.022));
    fin.rotation.y = -a + Math.PI / 2;
    lower.add(fin);
  }

  // --- 2e etage + coiffe ---
  upper.add(cylinder(0.012, 0.022, 0.03, metal, 0.645, true)); // petite tuyere (cachee avant separation)
  upper.add(cylinder(R, R, 0.19, white, 0.755));
  upper.add(cylinder(R * 1.01, R * 1.01, 0.012, black, 0.66));
  const fairingPoints = [];
  const Rf = R * 1.06;
  for (let i = 0; i <= 20; i++) {
    const s = i / 20;
    fairingPoints.push(new THREE.Vector2(Rf * Math.pow(Math.cos((s * Math.PI) / 2), 0.75), 0.85 + s * 0.15));
  }
  fairingPoints.unshift(new THREE.Vector2(R, 0.85));
  const fairing = new THREE.Mesh(new THREE.LatheGeometry(fairingPoints, 32), white);
  upper.add(fairing);

  // --- Flammes ---
  const flame1 = createFlame({ radius: 0.05, length: 0.5, hot: 0xfff2d6, cool: 0xff6a1a, intensity: 2.2 });
  const core1 = createFlame({ radius: 0.022, length: 0.22, hot: 0xffffff, cool: 0xffd38a, intensity: 2.5 });
  lower.add(flame1.mesh, core1.mesh);
  const flame2 = createFlame({ radius: 0.022, length: 0.3, hot: 0xd9ecff, cool: 0x6a8cff, intensity: 2.0 });
  flame2.mesh.position.y = 0.63;
  upper.add(flame2.mesh);

  // Lueur des moteurs sur la fusee et le pas de tir.
  const light = new THREE.PointLight(0xff8a3d, 0, 0, 2);
  light.position.y = -0.08;
  group.add(light);

  group.scale.setScalar(height);

  function setFlame(f, throttle, time, plume) {
    f.mesh.visible = throttle > 0.001;
    f.uniforms.uThrottle.value = throttle;
    f.uniforms.uTime.value = time;
    const wobble = 1 + 0.06 * Math.sin(time * 37) + 0.04 * Math.sin(time * 71);
    // Dans le vide, le panache s'elargit (plume > 1).
    const r = f.radius * (0.7 + 0.3 * throttle) * plume;
    f.mesh.scale.set(r, f.length * (0.55 + 0.45 * throttle) * wobble * Math.sqrt(plume), r);
  }

  let lowerAttached = true;

  return {
    group,
    height,
    /** Position (dans le repere fusee, unites "hauteur = 1") de la tuyere active. */
    get nozzleY() {
      return lowerAttached ? 0 : 0.63;
    },
    setThrottle({ stage1 = 0, stage2 = 0, time = 0, plume = 1 }) {
      setFlame(flame1, stage1, time, plume);
      setFlame(core1, stage1, time + 1.7, plume);
      setFlame(flame2, stage2, time, plume);
      const t = Math.max(stage1, stage2 * 0.5);
      light.position.y = lowerAttached ? -0.08 : 0.55;
      light.intensity = t * 0.004 * (0.85 + 0.15 * Math.sin(time * 53));
    },
    /** Detache le 1er etage : le renvoie pour que la sequence l'anime (chute + fondu). */
    separateLower() {
      lowerAttached = false;
      setFlame(flame1, 0, 0, 1);
      setFlame(core1, 0, 0, 1);
      for (const m of [whiteLow, blackLow, metalLow]) m.transparent = true;
      return {
        object: lower,
        setOpacity(o) {
          for (const m of [whiteLow, blackLow, metalLow]) m.opacity = o;
        }
      };
    },
    jettisonFairing() {
      fairing.visible = false;
    },
    setOpacity(o) {
      for (const m of [white, black, metal]) {
        m.transparent = o < 1;
        m.opacity = o;
      }
    },
    dispose() {
      group.traverse((o) => {
        o.geometry?.dispose();
        o.material?.dispose();
      });
      lower.traverse((o) => {
        o.geometry?.dispose();
        o.material?.dispose();
      });
    }
  };
}

function boite(w, h, d, material, x, y, z) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z);
  return mesh;
}

/** Centre de lancement : aire, carneau, tour, mats, blockhaus, reservoirs.
 *  Repere local : +Y = verticale du lieu. Le lanceur reste au centre. */
export function createLaunchPad({ scale = 0.03 } = {}) {
  const group = new THREE.Group();
  group.name = 'pas-de-tir';
  const concrete = mat(0x6d7078, { roughness: 0.9 });
  const apronMat = mat(0x5c616a, { roughness: 0.95 });
  const steel = mat(0xb83a2e, { roughness: 0.6, metalness: 0.4 });
  const dark = mat(0x1c1e22, { roughness: 0.8 });
  const white = mat(0xe7e4dc, { roughness: 0.4, metalness: 0.2 });
  const glass = mat(0x9fd6e8, { roughness: 0.15, metalness: 0.1 });
  const caution = mat(0xd7a441, { roughness: 0.5 });

  const apron = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.4, 0.045, 48), apronMat);
  apron.position.y = -0.02;
  group.add(apron);
  const slab = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.46, 0.08, 40), concrete);
  group.add(slab);
  const mark = new THREE.Mesh(new THREE.RingGeometry(0.16, 0.19, 32), caution);
  mark.rotation.x = -Math.PI / 2;
  mark.position.y = 0.041;
  group.add(mark);

  // Carneau : le jet part sous la table et sort par le deflecteur.
  const trench = boite(0.16, 0.05, 0.72, dark, 0, 0.02, 0.34);
  group.add(trench);
  const deflector = boite(0.2, 0.08, 0.1, steel, 0, 0.02, 0.68);
  deflector.rotation.x = -0.45;
  group.add(deflector);
  for (const z of [0.22, 0.4, 0.58]) {
    group.add(boite(0.18, 0.012, 0.02, steel, 0, 0.048, z));
  }

  // Pieds de retenue autour du lanceur.
  for (let k = 0; k < 4; k++) {
    const a = (k * Math.PI) / 2 + Math.PI / 4;
    group.add(boite(0.03, 0.07, 0.03, caution, Math.cos(a) * 0.1, 0.075, Math.sin(a) * 0.1));
  }

  // Tour ombilicale en treillis.
  const tower = new THREE.Group();
  tower.position.set(-0.17, 0.04, 0);
  const H = 0.95;
  for (const [x, z] of [[-0.035, -0.035], [0.035, -0.035], [-0.035, 0.035], [0.035, 0.035]]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.01, H, 0.01), steel);
    leg.position.set(x, H / 2, z);
    tower.add(leg);
  }
  for (let y = 0.08; y < H; y += 0.08) {
    const ring = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.006, 0.08), steel);
    ring.position.y = y;
    tower.add(ring);
  }
  for (const y of [0.45, 0.8]) {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.012, 0.02), steel);
    arm.position.set(0.09, y, 0);
    tower.add(arm);
  }
  group.add(tower);

  // Mats parafoudre aux quatre coins de l'aire.
  for (const [x, z] of [[0.85, 0.85], [0.85, -0.85], [-0.85, 0.85], [-0.85, -0.85]]) {
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.018, 1.15, 8), steel);
    mast.position.set(x, 0.58, z);
    group.add(mast);
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), caution);
    lamp.position.set(x, 1.16, z);
    group.add(lamp);
  }

  // Blockhaus, a l'ecart du carneau.
  group.add(boite(0.46, 0.22, 0.28, concrete, 0.78, 0.14, -0.15));
  group.add(boite(0.28, 0.06, 0.02, glass, 0.78, 0.18, -0.01));
  group.add(boite(0.5, 0.04, 0.32, dark, 0.78, 0.27, -0.15));

  // Reservoirs et route d'acces.
  for (const [x, z] of [[-0.72, -0.55], [-0.72, -0.78]]) {
    const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.34, 16), white);
    tank.rotation.z = Math.PI / 2;
    tank.position.set(x, 0.12, z);
    group.add(tank);
  }
  group.add(boite(1.1, 0.012, 0.16, dark, 0.2, 0.012, -0.95));

  group.scale.setScalar(scale);

  return {
    object: group,
    dispose() {
      group.traverse((o) => {
        o.geometry?.dispose();
        o.material?.dispose();
      });
    }
  };
}
