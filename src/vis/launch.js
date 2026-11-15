// Sequence de lancement (Phase 3).
//
//  prepare()  : la camera plonge vers le pas de tir, le lanceur attend (degazage).
//  launch()   : compte a rebours T-10 -> decollage -> separation du 1er etage ->
//               deploiement du CubeSat sur son orbite -> retour en vue large.
//               Renvoie une Promise resolue a la fin de la sequence.
//
// Echelle : rayon terrestre = 1. Le lanceur est volontairement surdimensionne (sinon
// invisible) ; l'altitude d'orbite, elle, est reelle (lue dans data/gmat/).
// Le temps est accelere (orbite affichee en 40 s au lieu de 95,6 min).

import * as THREE from 'three';
import { createRocket, createLaunchPad } from './rocket.js';
import { createCubeSat } from './cubesat.js';
import { createOrbit } from './orbit.js';
import { createParticlePool } from './particles.js';
import orbitData from '../data/gmat/orbite_basse.json';
import { t } from '../i18n.js';

const { altitudeKm: ALT_KM, rayonTerreKm: R_KM, muTerre: MU, excentricite: ECC = 0 } = orbitData.parametres;
const ORBIT_RADIUS = 1 + ALT_KM / R_KM;
const ORBIT_SPEED_KMS = Math.sqrt(MU / (R_KM + ALT_KM));
const ORBIT_PERIOD_MIN = orbitData.resultats.periodeMinutes;
const ORBIT_PERIOD_S = ORBIT_PERIOD_MIN * 60;
const ORBIT_DISPLAY_PERIOD = 40; // secondes a l'ecran pour un tour pendant le lancement
const LAUNCH_TIME_SCALE = ORBIT_PERIOD_S / ORBIT_DISPLAY_PERIOD;
const OMEGA = (Math.PI * 2) / ORBIT_DISPLAY_PERIOD;

const ROCKET_HEIGHT = 0.03;
const PAD_LIFT = 0.0012;

// Chronologie (secondes depuis le clic "Lancer").
const T_IGNITION = 9.3;
const T_LIFTOFF = 10;
const ASCENT = 14;
const T_DEPLOY = T_LIFTOFF + ASCENT;
const T_FLYOUT = T_DEPLOY + 4;
const FLYOUT_DURATION = 6;
const T_END = T_FLYOUT + FLYOUT_DURATION;
const STAGE_SEP_U = 0.5;
const STAGE2_IGNITION_U = 0.54;
// Angle parcouru pendant l'ascension, choisi pour que la vitesse finale egale la vitesse orbitale.
const PHI = (OMEGA * ASCENT) / 3;

const easeInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const smooth01 = (x) => x * x * (3 - 2 * x);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const rand = (a, b) => a + Math.random() * (b - a);
const fmt = (x, d = 1) => x.toFixed(d).replace('.', ',');

// ---------------------------------------------------------------------------
// Surimpression (compte a rebours, legendes, telemetrie).

function createOverlay(container) {
  const root = document.createElement('div');
  root.className = 'vis-overlay';
  root.innerHTML = `
    <div class="vis-caption">
      <div class="vis-caption-title"></div>
      <div class="vis-caption-sub"></div>
    </div>
    <div class="vis-count" aria-live="assertive"></div>
    <div class="vis-telemetry"></div>
  `;
  container.appendChild(root);
  const title = root.querySelector('.vis-caption-title');
  const sub = root.querySelector('.vis-caption-sub');
  const count = root.querySelector('.vis-count');
  const telemetry = root.querySelector('.vis-telemetry');
  let lastCount = '';

  return {
    show() {
      root.classList.add('is-visible');
    },
    hide() {
      root.classList.remove('is-visible');
    },
    caption(t, s = '') {
      title.textContent = t;
      sub.textContent = s;
    },
    count(text, variant = '') {
      if (text === lastCount) return;
      lastCount = text;
      count.textContent = text;
      count.className = `vis-count ${variant}`;
      void count.offsetWidth; // relance l'animation CSS
      if (text) count.classList.add('is-pop');
      window.dispatchEvent(new CustomEvent('vis-announcer', { detail: { text, variant } }));
    },
    telemetry(html) {
      telemetry.innerHTML = html;
    },
    dispose() {
      root.remove();
    }
  };
}

// ---------------------------------------------------------------------------
// Deplacement de camera "cinema" : trajectoire spherique (jamais sous la surface)
// + interpolation de l'orientation par quaternion (aucune singularite).

function createCameraMove(camera, toPos, toQuat, duration) {
  const fromPos = camera.position.clone();
  const fromQuat = camera.quaternion.clone();
  const fromDir = fromPos.clone().normalize();
  const toDir = toPos.clone().normalize();
  const r0 = Math.log(fromPos.length());
  const r1 = Math.log(toPos.length());
  const arc = new THREE.Quaternion().setFromUnitVectors(fromDir, toDir);
  const q = new THREE.Quaternion();
  let t = 0;

  return {
    get done() {
      return t >= duration;
    },
    update(dt) {
      t = Math.min(duration, t + dt);
      const e = easeInOut(t / duration);
      q.identity().slerp(arc, e);
      camera.position.copy(fromDir).applyQuaternion(q).multiplyScalar(Math.exp(r0 + (r1 - r0) * e));
      camera.quaternion.slerpQuaternions(fromQuat, toQuat, e);
    }
  };
}

function lookQuaternion(eye, target, up) {
  const m = new THREE.Matrix4().lookAt(eye, target, up);
  return new THREE.Quaternion().setFromRotationMatrix(m);
}

// ---------------------------------------------------------------------------

export function createLaunchSequence({ scene, camera, earth, container, sunDirection, getHomeView }) {
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const overlay = createOverlay(container);

  const smoke = createParticlePool({ max: 4500, additive: false });
  const fire = createParticlePool({ max: 2000, additive: true });
  scene.add(smoke.object, fire.object);

  // Repere de lancement (monde) : S = verticale du pas de tir, T = direction de tir,
  // N = normale au plan d'orbite, B = cote ou se place la camera.
  const S = new THREE.Vector3();
  const T = new THREE.Vector3();
  const N = new THREE.Vector3();
  const B = new THREE.Vector3();

  let pad = null;
  let rocket = null;
  let cubesat = null;
  let orbit = null;
  let lowerDebris = null;
  let upperTheta = 0;

  let prepared = false;
  let launching = false;
  let launched = false;
  let controlsCamera = false;
  let cameraMove = null;
  let t = 0;
  let cueIndex = 0;
  let resolveLaunch = null;
  const emitCarry = new Map();

  // Temporaires reutilises (pas d'allocation par frame).
  const P = new THREE.Vector3();
  const dir = new THREE.Vector3();
  const vTmp = new THREE.Vector3();
  const vTmp2 = new THREE.Vector3();
  const target = new THREE.Vector3();
  const xAxis = new THREE.Vector3();
  const basis = new THREE.Matrix4();
  const shake = new THREE.Vector3();

  const C_SMOKE = new THREE.Color(0xf4f4f2);
  const C_SMOKE_END = new THREE.Color(0x9a9ca3);
  const C_SMOKE_HOT = new THREE.Color(0xffc48a);
  const C_SPARK = new THREE.Color(0xffe2a8);
  const C_SPARK_END = new THREE.Color(0xff4a10);
  const C_BLUE = new THREE.Color(0xbfe0ff);
  const C_BLUE_END = new THREE.Color(0x3050ff);
  const C_FLASH = new THREE.Color(0xffffff);

  // --- Trajectoire d'ascension : montee verticale puis basculement vers l'horizontale. ---
  function radiusAt(u) {
    return 1 + PAD_LIFT + (ORBIT_RADIUS - 1 - PAD_LIFT) * smooth01(u);
  }
  function trajectory(u, outP) {
    const phi = PHI * u * u * u;
    return outP.copy(S).multiplyScalar(Math.cos(phi)).addScaledVector(T, Math.sin(phi)).multiplyScalar(radiusAt(u));
  }
  function velocity(u, out) {
    const e = 1e-3;
    trajectory(Math.min(1, u + e), out);
    trajectory(Math.max(0, u - e), vTmp2);
    return out.sub(vTmp2).divideScalar((Math.min(1, u + e) - Math.max(0, u - e)) * ASCENT);
  }

  function orientAlong(object, position, forward) {
    xAxis.crossVectors(forward, N).normalize();
    basis.makeBasis(xAxis, forward, vTmp.crossVectors(xAxis, forward).normalize());
    object.quaternion.setFromRotationMatrix(basis);
    object.position.copy(position);
  }

  function computeFrame() {
    const home = getHomeView().position.clone().normalize();
    S.copy(home).addScaledVector(sunDirection, 0.7).normalize();
    T.set(0, 1, 0).cross(S).normalize();
    N.crossVectors(S, T).normalize();
    B.copy(N);
    if (B.dot(sunDirection) < 0) B.negate(); // camera du cote eclaire
  }

  function padCameraPose() {
    const mid = S.clone().multiplyScalar(1 + PAD_LIFT + ROCKET_HEIGHT / 2);
    const eye = S.clone().multiplyScalar(1 + PAD_LIFT + ROCKET_HEIGHT / 2 - 0.0022).addScaledVector(B, 0.075);
    return { eye, quat: lookQuaternion(eye, mid, S) };
  }

  // --- Camera de poursuite (meme formule au sol et en vol => pas de saut). ---
  const chaseDist = (u) => 0.075 + 0.28 * Math.pow(u, 1.5);
  const chaseLift = (u) => -0.0022 + 0.025 * u;
  const chaseBack = (u) => 0.06 * u;
  function chase(focus, forward, u) {
    const radial = vTmp.copy(focus).normalize();
    camera.position
      .copy(focus)
      .addScaledVector(B, chaseDist(u))
      .addScaledVector(radial, chaseLift(u))
      .addScaledVector(forward, -chaseBack(u));
    camera.up.copy(radial);
    camera.lookAt(target.copy(focus).addScaledVector(forward, 0.01 * u));
  }

  // --- Emission de particules a debit constant (independant du framerate). ---
  function emitRate(key, rate, dt, fn) {
    const n = (emitCarry.get(key) || 0) + rate * dt;
    const whole = Math.floor(n);
    emitCarry.set(key, n - whole);
    for (let i = 0; i < whole; i++) fn();
  }

  const ePos = new THREE.Vector3();
  const eVel = new THREE.Vector3();
  const eAcc = new THREE.Vector3();
  const emitOpts = { position: ePos, velocity: eVel, acceleration: eAcc, life: 1, size: [0, 0], color: [C_SMOKE, C_SMOKE_END], alpha: 1, drag: 0 };

  function randomTangent(out) {
    const a = Math.random() * Math.PI * 2;
    return out.copy(T).multiplyScalar(Math.cos(a)).addScaledVector(N, Math.sin(a));
  }

  function emitVent() {
    // Degazage d'oxygene liquide le long du corps de la fusee.
    ePos.copy(S).multiplyScalar(1 + PAD_LIFT + ROCKET_HEIGHT * rand(0.3, 0.6)).addScaledVector(randomTangent(eVel), ROCKET_HEIGHT * 0.06);
    eVel.multiplyScalar(rand(0.001, 0.003)).addScaledVector(S, -0.0006);
    eAcc.copy(S).multiplyScalar(-0.0002);
    Object.assign(emitOpts, { life: rand(1.2, 2.2), size: [0.001, 0.004], color: [C_SMOKE, C_SMOKE], alpha: 0.35, drag: 1.5 });
    smoke.emit(emitOpts);
  }

  function emitGroundSmoke(strength) {
    // Nuage au sol chasse lateralement par le jet.
    ePos.copy(S).multiplyScalar(1 + PAD_LIFT * 1.5);
    randomTangent(eVel).multiplyScalar(rand(0.008, 0.03) * strength).addScaledVector(S, rand(0, 0.003));
    eAcc.copy(S).multiplyScalar(0.0012);
    Object.assign(emitOpts, {
      life: rand(3.5, 7),
      size: [0.003, rand(0.012, 0.022)],
      color: [Math.random() < 0.3 ? C_SMOKE_HOT : C_SMOKE, C_SMOKE_END],
      alpha: 0.6,
      drag: 1.1
    });
    smoke.emit(emitOpts);
  }

  function nozzlePosition(out) {
    return out.copy(rocket.group.position).addScaledVector(dir, rocket.nozzleY * ROCKET_HEIGHT);
  }

  function emitTrail(altitude) {
    // Trainee de fumee : epaisse en basse atmosphere, absente dans le vide.
    nozzlePosition(ePos).addScaledVector(dir, -ROCKET_HEIGHT * rand(0.1, 0.4));
    eVel.set(rand(-1, 1), rand(-1, 1), rand(-1, 1)).multiplyScalar(0.0015).addScaledVector(dir, -0.004);
    eAcc.copy(ePos).normalize().multiplyScalar(0.0004);
    const thin = clamp01(1 - altitude / 0.045);
    Object.assign(emitOpts, {
      life: rand(3, 6),
      size: [0.0018, 0.008 + 0.012 * (1 - thin)],
      color: [C_SMOKE, C_SMOKE_END],
      alpha: 0.55 * thin,
      drag: 0.6
    });
    smoke.emit(emitOpts);
  }

  function emitSparks(stage2) {
    nozzlePosition(ePos);
    eVel.set(rand(-1, 1), rand(-1, 1), rand(-1, 1)).multiplyScalar(0.004).addScaledVector(dir, -rand(0.03, 0.07));
    eAcc.set(0, 0, 0);
    const s = stage2 ? 0.5 : 1;
    Object.assign(emitOpts, {
      life: rand(0.12, 0.3),
      size: [0.0028 * s, 0.0006],
      color: stage2 ? [C_BLUE, C_BLUE_END] : [C_SPARK, C_SPARK_END],
      alpha: 0.9,
      drag: 0.5
    });
    fire.emit(emitOpts);
  }

  function burst(position, count, speed, color) {
    for (let i = 0; i < count; i++) {
      ePos.copy(position);
      eVel.set(rand(-1, 1), rand(-1, 1), rand(-1, 1)).normalize().multiplyScalar(rand(0.2, 1) * speed);
      eAcc.set(0, 0, 0);
      Object.assign(emitOpts, { life: rand(0.4, 1.1), size: [0.0016, 0.0003], color: [C_FLASH, color], alpha: 1, drag: 1.5 });
      fire.emit(emitOpts);
    }
  }

  // --- Moments cles (declenches une seule fois, dans l'ordre). ---
  const cues = [
    { at: 0, run: () => overlay.caption(t('Séquence de lancement', 'Launch sequence'), t('Tous les systèmes sont au vert', 'All systems are green')) },
    { at: 5, run: () => overlay.caption(t('T-5 · Mise en pression', 'T-5 · Pressurisation'), t('Les réservoirs passent en pression de vol', 'Tanks reach flight pressure')) },
    { at: T_IGNITION, run: () => overlay.caption(t('Allumage', 'Ignition'), t('Les moteurs montent en poussée', 'Engines come up to thrust')) },
    {
      at: T_LIFTOFF,
      run: () => {
        overlay.count('DÉCOLLAGE !', 'is-liftoff');
        overlay.caption(t('Décollage', 'Liftoff'), t('Le lanceur quitte le pas de tir', 'The launcher leaves the pad'));
      }
    },
    { at: T_LIFTOFF + 2.5, run: () => overlay.count('') },
    {
      at: T_LIFTOFF + ASCENT * STAGE_SEP_U,
      run: () => {
        overlay.caption(t('Séparation du 1er étage', 'First-stage separation'), t('Le 1er étage vide retombe, le 2e étage prend le relais', 'The empty first stage falls away, the second stage takes over'));
        const debris = rocket.separateLower();
        scene.attach(debris.object);
        velocity(STAGE_SEP_U, vTmp);
        lowerDebris = { ...debris, vel: vTmp.clone().multiplyScalar(0.8), age: 0, spin: new THREE.Vector3(rand(-1, 1), 0, rand(-1, 1)).normalize() };
        nozzlePosition(P);
        burst(P, 60, 0.02, C_SPARK_END);
      }
    },
    {
      at: T_DEPLOY,
      run: () => {
        overlay.caption(t('Déploiement du CubeSat', 'CubeSat deployment'), t('La coiffe s\'ouvre, ton satellite est libéré', 'The fairing opens, your satellite is released'));
        rocket.jettisonFairing();
        const p0 = trajectory(1, new THREE.Vector3()).normalize();
        const t0 = velocity(1, new THREE.Vector3()).normalize();
        orbit = createOrbit({
          a: ORBIT_RADIUS,
          e: ECC,
          p0,
          t0,
          period: ORBIT_PERIOD_S,
          earthRadiusKm: R_KM,
          muKm3s2: MU,
          timeScale: LAUNCH_TIME_SCALE
        });
        scene.add(orbit.object);
        cubesat = createCubeSat();
        scene.add(cubesat.object);
        // Le CubeSat sort par le nez de la coiffe.
        orbit.attach(cubesat.object, ROCKET_HEIGHT / ORBIT_RADIUS);
        cubesat.deploy();
        upperTheta = 0;
        burst(cubesat.object.position, 50, 0.01, C_BLUE_END);
      }
    },
    {
      at: T_DEPLOY + 1.6,
      run: () => {
        overlay.count('ORBITE ATTEINTE', 'is-success');
        overlay.caption(t('Orbite basse terrestre', 'Low Earth orbit'), t(`Altitude ${ALT_KM} km · un tour en ${fmt(ORBIT_PERIOD_MIN)} min`, `Altitude ${ALT_KM} km · one revolution in ${fmt(ORBIT_PERIOD_MIN)} min`));
        window.dispatchEvent(new CustomEvent('orbite-atteinte', { detail: { altitudeKm: ALT_KM } }));
      }
    },
    {
      at: T_FLYOUT,
      run: () => {
        const home = getHomeView();
        cameraMove = createCameraMove(camera, home.position, home.quaternion, FLYOUT_DURATION);
      }
    }
  ];

  function telemetry(u) {
    const altKm = (radiusAt(u) - 1 - PAD_LIFT) * R_KM;
    velocity(u, vTmp);
    const speed = (vTmp.length() / (OMEGA * ORBIT_RADIUS)) * ORBIT_SPEED_KMS;
    const met = Math.max(0, t - T_LIFTOFF);
    overlay.telemetry(`
      <span><b>T+</b> ${String(Math.floor(met)).padStart(2, '0')} s</span>
      <span><b>ALT</b> ${fmt(Math.max(0, altKm), 0)} km</span>
      <span><b>VIT</b> ${fmt(speed, 2)} km/s</span>
    `);
  }

  // ---------------------------------------------------------------------------

  function build() {
    computeFrame();

    pad = createLaunchPad({ scale: ROCKET_HEIGHT });
    earth.mesh.updateWorldMatrix(true, false);
    const local = earth.mesh.worldToLocal(S.clone());
    pad.object.position.copy(local);
    pad.object.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), local.clone().normalize());
    earth.mesh.add(pad.object);

    rocket = createRocket({ height: ROCKET_HEIGHT });
    scene.add(rocket.group);
    dir.copy(S);
    orientAlong(rocket.group, trajectory(0, P), S);
  }

  function prepare() {
    if (prepared) return;
    prepared = true;
    build();
    earth.setSpinEnabled(false);
    earth.setCloudFade(0);
    container.classList.add('vue3d--cinema');
    overlay.caption(t('Pas de tir', 'Launch pad'), t('Le lanceur est en position. Vérifie tout, puis lance !', 'The launcher is in place. Check everything, then launch!'));
    overlay.count('');
    overlay.telemetry('');
    overlay.show();
    const { eye, quat } = padCameraPose();
    cameraMove = createCameraMove(camera, eye, quat, reduceMotion ? 0.01 : 3.5);
    controlsCamera = true;
  }

  function launch() {
    if (launched || launching) return Promise.resolve();
    prepare();
    launching = true;
    t = 0;
    cueIndex = 0;
    return new Promise((resolve) => {
      resolveLaunch = resolve;
    });
  }

  function finish() {
    launching = false;
    launched = true;
    controlsCamera = false;
    camera.up.set(0, 1, 0);
    earth.setSpinEnabled(true);
    earth.setCloudFade(1);
    container.classList.remove('vue3d--cinema');
    overlay.hide();
    if (rocket) {
      scene.remove(rocket.group);
      rocket.dispose();
      rocket = null;
    }
    resolveLaunch?.();
    resolveLaunch = null;
  }

  function updateLaunch(dt) {
    t += dt;
    while (cueIndex < cues.length && t >= cues[cueIndex].at) cues[cueIndex++].run();

    // Compte a rebours.
    if (t < T_LIFTOFF) overlay.count(`T-${Math.ceil(T_LIFTOFF - t)}`);

    // Avant decollage : degazage puis allumage.
    if (t < T_LIFTOFF) {
      emitRate('vent', t > 5 ? 40 : 15, dt, emitVent);
      const ign = clamp01((t - T_IGNITION) / (T_LIFTOFF - T_IGNITION));
      rocket.setThrottle({ stage1: ign * 0.85, time: t });
      if (ign > 0) {
        emitRate('ground', 260 * ign, dt, () => emitGroundSmoke(ign));
        emitRate('spark', 250 * ign, dt, () => emitSparks(false));
      }
      shake.setScalar(0);
      if (!reduceMotion && ign > 0) shake.set(rand(-1, 1), rand(-1, 1), rand(-1, 1)).multiplyScalar(0.0004 * ign);
      if (!cameraMove) {
        const { eye, quat } = padCameraPose();
        camera.position.copy(eye).add(shake);
        camera.quaternion.copy(quat);
      }
      return;
    }

    // Ascension.
    if (t < T_DEPLOY) {
      const u = clamp01((t - T_LIFTOFF) / ASCENT);
      trajectory(u, P);
      velocity(Math.max(u, 0.002), dir).normalize();
      if (u < 0.002) dir.copy(S);
      orientAlong(rocket.group, P, dir);

      const altitude = P.length() - 1;
      const stage1 = u < STAGE_SEP_U ? 1 : 0;
      const stage2 = u >= STAGE2_IGNITION_U ? clamp01((u - STAGE2_IGNITION_U) * 20) : 0;
      rocket.setThrottle({ stage1, stage2, time: t, plume: 1 + altitude * 30 });

      if (altitude < 0.012) emitRate('ground', 300 * (1 - altitude / 0.012), dt, () => emitGroundSmoke(1));
      if (stage1 && altitude < 0.05) emitRate('trail', 260, dt, () => emitTrail(altitude));
      if (stage1 || stage2) emitRate('spark', stage1 ? 260 : 120, dt, () => emitSparks(!stage1));

      telemetry(u);

      const focus = vTmp2.copy(P).addScaledVector(dir, ROCKET_HEIGHT / 2);
      chase(focus, dir, u);
      if (!reduceMotion) {
        const k = Math.max(0, 1 - (t - T_LIFTOFF) / 5);
        camera.position.add(shake.set(rand(-1, 1), rand(-1, 1), rand(-1, 1)).multiplyScalar(0.0009 * k));
      }
      return;
    }

    // Deploiement puis retour en vue large.
    if (rocket) {
      upperTheta += OMEGA * 0.955 * dt;
      orbit.positionAt(upperTheta, P).multiplyScalar(1 - (t - T_DEPLOY) * 0.0006);
      orbit.directionAt(upperTheta, dir);
      orientAlong(rocket.group, P, dir);
      rocket.setThrottle({ stage1: 0, stage2: 0, time: t });
      rocket.setOpacity(clamp01(1 - (t - T_DEPLOY - 2.5) / 2.5));
    }
    if (!cameraMove && rocket) {
      // Cadre progressivement le CubeSat qui s'eloigne du 2e etage.
      const k = smooth01(clamp01((t - T_DEPLOY) / 2.5));
      const focus = vTmp2.copy(P).addScaledVector(dir, ROCKET_HEIGHT / 2).lerp(cubesat.object.position, k);
      orbit.directionAt(orbit.theta, dir);
      chase(focus, dir, 1);
    }
    if (t >= T_END) finish();
  }

  function updateDebris(dt) {
    if (!lowerDebris) return;
    const d = lowerDebris;
    d.age += dt;
    // Chute balistique (gravite exageree) + culbute lente.
    d.vel.addScaledVector(vTmp.copy(d.object.position).normalize(), -0.02 * dt);
    d.object.position.addScaledVector(d.vel, dt);
    d.object.rotateOnAxis(d.spin, dt * 0.8);
    d.setOpacity(clamp01(1 - (d.age - 1) / 3));
    if (d.age > 4.2) {
      scene.remove(d.object);
      d.object.traverse((o) => {
        o.geometry?.dispose();
        o.material?.dispose();
      });
      lowerDebris = null;
    }
  }

  return {
    get controlsCamera() {
      return controlsCamera;
    },
    get launched() {
      return launched;
    },
    get orbit() {
      return orbit;
    },
    get cubesat() {
      return cubesat;
    },
    prepare,
    launch,
    update(dt) {
      if (cameraMove) {
        cameraMove.update(dt);
        if (cameraMove.done) cameraMove = null;
      }
      if (launching) updateLaunch(dt);
      else if (prepared && !launched) emitRate('vent', 12, dt, emitVent);
      updateDebris(dt);
      smoke.update(dt);
      fire.update(dt);
      orbit?.update(dt);
      cubesat?.update(dt);
    },
    setViewport(heightPx, fovDeg) {
      smoke.setViewport(heightPx, fovDeg);
      fire.setViewport(heightPx, fovDeg);
    },
    dispose() {
      overlay.dispose();
      smoke.dispose();
      fire.dispose();
      rocket?.dispose();
      pad?.dispose();
      orbit?.dispose();
      cubesat?.dispose();
    }
  };
}
