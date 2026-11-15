// Terre + nuages + atmosphere (Phase 1).
//
// Textures : public/textures/ (derivees de NASA Blue Marble / Black Marble, via les
// exemples Three.js). Si une texture manque, une couleur de repli est utilisee : la scene
// reste lisible meme hors-ligne au premier lancement.
//
// Rendu :
//  - shader jour/nuit : le cote eclaire montre la texture de jour, le cote nuit les
//    lumieres des villes, avec une transition douce au terminateur ;
//  - reflet speculaire du Soleil limite aux oceans (carte speculaire) ;
//  - couche de nuages semi-transparente qui tourne un peu plus vite que le sol ;
//  - halo atmospherique (effet de Fresnel) plus lumineux cote jour.

import * as THREE from 'three';

const TEXTURE_DIR = `${import.meta.env.BASE_URL}textures/`;

const EARTH_VERTEX = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vPosW;

  void main() {
    vUv = uv;
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vec4 posW = modelMatrix * vec4(position, 1.0);
    vPosW = posW.xyz;
    gl_Position = projectionMatrix * viewMatrix * posW;
  }
`;

const EARTH_FRAGMENT = /* glsl */ `
  uniform sampler2D uDayMap;
  uniform sampler2D uNightMap;
  uniform sampler2D uSpecMap;
  uniform vec3 uSunDir;
  uniform float uFlash;      // reserve aux alertes visuelles (Phase 5)
  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vPosW;

  void main() {
    vec3 n = normalize(vNormalW);
    vec3 viewDir = normalize(cameraPosition - vPosW);
    float sunDot = dot(n, uSunDir);

    // Melange jour/nuit avec une transition douce autour du terminateur.
    float dayMix = smoothstep(-0.12, 0.22, sunDot);

    vec3 day = texture2D(uDayMap, vUv).rgb;
    day *= 0.08 + 1.05 * max(sunDot, 0.0);

    vec3 night = texture2D(uNightMap, vUv).rgb;
    night = pow(night, vec3(1.4)) * vec3(1.0, 0.78, 0.48) * 2.2;

    vec3 color = mix(night, day, dayMix);

    // Reflet du Soleil sur les oceans.
    float ocean = texture2D(uSpecMap, vUv).r;
    vec3 halfDir = normalize(uSunDir + viewDir);
    float spec = pow(max(dot(n, halfDir), 0.0), 48.0) * ocean;
    color += vec3(1.0, 0.92, 0.75) * spec * 0.9 * dayMix;

    // Diffusion atmospherique sur le bord du disque (cote jour).
    float rim = pow(1.0 - max(dot(n, viewDir), 0.0), 3.0);
    color += vec3(0.3, 0.6, 1.0) * rim * (0.15 + 0.85 * dayMix) * 0.8;

    color = mix(color, vec3(1.0, 0.2, 0.15), uFlash * 0.35);

    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const ATMO_VERTEX = /* glsl */ `
  varying vec3 vNormalW;
  varying vec3 vPosW;

  void main() {
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vec4 posW = modelMatrix * vec4(position, 1.0);
    vPosW = posW.xyz;
    gl_Position = projectionMatrix * viewMatrix * posW;
  }
`;

const ATMO_FRAGMENT = /* glsl */ `
  uniform vec3 uSunDir;
  uniform vec3 uColor;
  varying vec3 vNormalW;
  varying vec3 vPosW;

  void main() {
    vec3 n = normalize(vNormalW);
    vec3 viewDir = normalize(cameraPosition - vPosW);
    float d = dot(n, viewDir);
    float lit = smoothstep(-0.35, 0.5, dot(n, uSunDir));

    // Vu de l'espace (face arriere) : d vaut ~0 au bord exterieur du halo et
    // ~-0.4 juste au-dessus du limbe terrestre -> halo maximal contre la Terre.
    float fresnel = pow(clamp(-d / 0.42, 0.0, 1.0), 3.0);
    float outside = fresnel * (0.12 + 0.88 * lit);

    // Vu de l'interieur (camera au sol / en montee) : ciel bleu, plus clair vers
    // l'horizon, qui s'assombrit avec l'altitude -> on "sort" de l'atmosphere.
    float camR = length(cameraPosition);
    float horizon = pow(clamp(1.0 + d, 0.0, 1.0), 1.5);
    float density = 1.0 - smoothstep(1.0, 1.085, camR);
    float inside = (0.35 + 0.65 * horizon) * lit * density;

    float intensity = mix(inside, outside, smoothstep(1.075, 1.095, camR));
    gl_FragColor = vec4(uColor * intensity * 1.6, intensity);
    #include <colorspace_fragment>
  }
`;

function solidTexture(hex) {
  const c = new THREE.Color(hex);
  const data = new Uint8Array([c.r * 255, c.g * 255, c.b * 255, 255]);
  const tex = new THREE.DataTexture(data, 1, 1);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function loadInto(loader, file, { srgb, anisotropy }, onReady) {
  loader.load(
    `${TEXTURE_DIR}${file}`,
    (tex) => {
      if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = anisotropy;
      onReady(tex);
      window.dispatchEvent(new CustomEvent('texture-loaded', { detail: { file } }));
    },
    undefined,
    () => {
      console.warn(`[vis] Texture introuvable : ${file} (couleur de repli utilisee)`);
      window.dispatchEvent(new CustomEvent('texture-loaded', { detail: { file, failed: true } }));
    }
  );
}

export const EARTH_RADIUS = 1;
// Inclinaison de l'axe terrestre (obliquite) : 23,44 degres.
const AXIAL_TILT = THREE.MathUtils.degToRad(23.44);

export function createEarth({ renderer, sunDirection }) {
  const anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const loader = new THREE.TextureLoader();
  const sunDir = sunDirection.clone().normalize();

  // Groupe incline : la rotation propre se fait autour de l'axe local Y.
  const group = new THREE.Group();
  group.rotation.z = AXIAL_TILT;

  const segments = 96;
  const sphere = new THREE.SphereGeometry(EARTH_RADIUS, segments, segments);

  // --- Sol (jour/nuit) ---
  const earthUniforms = {
    uDayMap: { value: solidTexture(0x1d4f8f) },
    uNightMap: { value: solidTexture(0x000000) },
    uSpecMap: { value: solidTexture(0x000000) },
    uSunDir: { value: sunDir },
    uFlash: { value: 0 }
  };
  const earthMaterial = new THREE.ShaderMaterial({
    vertexShader: EARTH_VERTEX,
    fragmentShader: EARTH_FRAGMENT,
    uniforms: earthUniforms
  });
  const earthMesh = new THREE.Mesh(sphere, earthMaterial);
  earthMesh.name = 'terre';
  group.add(earthMesh);

  loadInto(loader, 'earth_atmos_2048.jpg', { srgb: true, anisotropy }, (t) => (earthUniforms.uDayMap.value = t));
  loadInto(loader, 'earth_lights_2048.png', { srgb: true, anisotropy }, (t) => (earthUniforms.uNightMap.value = t));
  loadInto(loader, 'earth_specular_2048.jpg', { srgb: false, anisotropy }, (t) => (earthUniforms.uSpecMap.value = t));

  // --- Nuages ---
  const cloudMaterial = new THREE.MeshLambertMaterial({
    color: 0xd8dde6,
    transparent: true,
    opacity: 0,
    depthWrite: false
  });
  const clouds = new THREE.Mesh(new THREE.SphereGeometry(EARTH_RADIUS * 1.012, segments, segments), cloudMaterial);
  clouds.name = 'nuages';
  group.add(clouds);

  let cloudBase = 0; // opacite une fois la texture chargee
  let cloudFade = 1; // facteur courant (0 = nuages caches, ex. vue du pas de tir)
  let cloudFadeTarget = 1;
  loadInto(loader, 'earth_clouds_1024.png', { srgb: false, anisotropy }, (t) => {
    cloudMaterial.alphaMap = t;
    cloudBase = 0.7;
    cloudMaterial.needsUpdate = true;
  });
  let spinEnabled = true;

  // --- Atmosphere (halo) --- hors du groupe incline : elle est symetrique.
  const atmoMaterial = new THREE.ShaderMaterial({
    vertexShader: ATMO_VERTEX,
    fragmentShader: ATMO_FRAGMENT,
    uniforms: {
      uSunDir: { value: sunDir },
      uColor: { value: new THREE.Color(0x4da6ff) }
    },
    side: THREE.BackSide,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });
  const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(EARTH_RADIUS * 1.09, 64, 64), atmoMaterial);
  atmosphere.name = 'atmosphere';

  const root = new THREE.Group();
  root.name = 'systeme-terre';
  root.add(group, atmosphere);

  // Vitesse de rotation "spectacle" (pas en temps reel : 1 tour ~ 4 min).
  const SPIN = (Math.PI * 2) / 240;

  return {
    object: root,
    mesh: earthMesh,
    update(delta) {
      if (spinEnabled) {
        earthMesh.rotation.y += SPIN * delta;
        clouds.rotation.y += SPIN * 1.25 * delta;
      }
      cloudFade += (cloudFadeTarget - cloudFade) * Math.min(1, delta * 1.5);
      cloudMaterial.opacity = cloudBase * cloudFade;
      clouds.visible = cloudMaterial.opacity > 0.005;
      // Retour progressif apres un flash d'alerte.
      earthUniforms.uFlash.value = Math.max(0, earthUniforms.uFlash.value - delta * 1.5);
    },
    /** Teinte rouge breve sur la Terre (sera branchee sur les alertes ASTRA en Phase 5). */
    flash() {
      earthUniforms.uFlash.value = 1;
    },
    /** Fige la rotation (ex. pendant le lancement : le pas de tir doit rester cadre). */
    setSpinEnabled(enabled) {
      spinEnabled = enabled;
    },
    /** Estompe (0) ou retablit (1) les nuages en douceur. */
    setCloudFade(value) {
      cloudFadeTarget = value;
    },
    setSunDirection(dir) {
      sunDir.copy(dir).normalize();
    },
    dispose() {
      root.traverse((o) => {
        o.geometry?.dispose();
        o.material?.dispose();
      });
      Object.values(earthUniforms).forEach((u) => u.value?.isTexture && u.value.dispose());
      cloudMaterial.alphaMap?.dispose();
    }
  };
}
