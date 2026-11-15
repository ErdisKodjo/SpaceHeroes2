// Chef d'orchestre de la vue 3D (panneau #vue3d).
//
// Phase 1 : fond etoile + Terre (jour/nuit, nuages, atmosphere) + eclairage solaire.
// Phase 3 : sequence de lancement (launch.js), declenchee par l'episode "lancement".
// Phase 4 : HUD orbital (hud.js) + ellipse Kepler + vitesse x1 / x1000.

import * as THREE from 'three';
import './vis.css';
import { createStarfield, createParticlePool } from './particles.js';
import { createEarth } from './earth.js';
import { createLaunchSequence } from './launch.js';
import { createOrbitHud } from './hud.js';
import { createPlayerControls } from './controls.js';
import { gmatPour } from '../engine/gmat.js';
import { settingsStore } from '../engine/settings-store.js';
import { t } from '../i18n.js';
import { distanceEnsemble } from './vues.js';

// Direction du Soleil (monde). Legerement de cote pour montrer le terminateur
// jour/nuit et les lumieres des villes.
const SUN_DIRECTION = new THREE.Vector3(1, 0.25, 0.55).normalize();

export function mountScene(container) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  function ratioPixels() {
    const dpr = window.devicePixelRatio || 1;
    const qualite = settingsStore.get('graphicsQuality') || 'haute';
    if (qualite === 'basse') return 1;
    if (qualite === 'moyenne') return Math.min(dpr, 1.5);
    if (qualite === 'ultra') return Math.min(dpr, 3);
    return Math.min(dpr, 2);
  }
  function echelleDepart() {
    const n = Number(settingsStore.get('defaultTimeScale'));
    return n === 1 || n === 100 || n === 1000 ? n : 1000;
  }
  renderer.setPixelRatio(ratioPixels());
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x02030a, 1);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  // near tres petit : la camera descend a quelques "km" du pas de tir pendant le lancement.
  const camera = new THREE.PerspectiveCamera(48, 1, 0.001, 2000);
  const cameraTarget = new THREE.Vector3(0, 0, 0);
  const CAMERA_BASE = new THREE.Vector3(-0.55, 0.42, 2.85);
  const cameraHome = CAMERA_BASE.clone(); // position de repos (ajustee au redimensionnement)
  camera.position.copy(cameraHome);
  camera.lookAt(cameraTarget);

  // --- Lumieres (utilisees par les materiaux standard : nuages, lanceur, CubeSat) ---
  const sun = new THREE.DirectionalLight(0xfff5e6, 2.2);
  sun.position.copy(SUN_DIRECTION).multiplyScalar(50);
  scene.add(sun);
  scene.add(new THREE.AmbientLight(0x223355, 0.25));

  // --- Contenu ---
  const stars = createStarfield();
  scene.add(stars.object);

  const earth = createEarth({ renderer, sunDirection: SUN_DIRECTION });
  scene.add(earth.object);

  function getHomeView() {
    const m = new THREE.Matrix4().lookAt(cameraHome, cameraTarget, new THREE.Vector3(0, 1, 0));
    return { position: cameraHome.clone(), quaternion: new THREE.Quaternion().setFromRotationMatrix(m) };
  }

  const launch = createLaunchSequence({
    scene,
    camera,
    earth,
    container,
    sunDirection: SUN_DIRECTION,
    getHomeView
  });

  const hud = createOrbitHud(container);
  let hudArmed = false;
  let vueActuelle = null;
  let vuePosee = false;
  let lune = null;
  hud.onTimeScale((scale) => launch.orbit?.setTimeScale(scale));
  hud.onVue((id) => {
    vueActuelle = id;
    vuePosee = false;
  });

  const player = createPlayerControls({
    camera,
    domElement: renderer.domElement,
    isBlocked: () => launch.controlsCamera
  });
  player.onFirstInput(() => document.getElementById('cam-hint')?.classList.add('is-gone'));

  // Pool de particules pour la célébration post-orbite
  const celebPool = createParticlePool({ max: 400, additive: true });
  scene.add(celebPool.object);
  let celebActive = false;

  // --- Dimensionnement : suit la taille reelle du panneau (responsive, mobile). ---
  function resize() {
    const width = container.clientWidth || 320;
    const height = container.clientHeight || 220;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    // Panneau etroit (mobile portrait) : on recule un peu pour garder la Terre entiere.
    const fit = camera.aspect < 1 ? 1 / camera.aspect : 1;
    cameraHome.copy(CAMERA_BASE).multiplyScalar(Math.min(fit, 1.8));
    camera.updateProjectionMatrix();
    const heightPx = height * renderer.getPixelRatio();
    launch.setViewport(heightPx, camera.fov);
    celebPool.setViewport(heightPx, camera.fov);
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  resize();

  // --- Boucle d'animation ---
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) player.controls.autoRotate = false;
  const clock = new THREE.Clock();
  let frameId = 0;
  let running = true;

  function animate() {
    if (!running) return;
    frameId = requestAnimationFrame(animate);
    // delta borne : evite un saut enorme apres un onglet mis en arriere-plan.
    const delta = Math.min(clock.getDelta(), 0.1);
    const elapsed = clock.elapsedTime;

    earth.update(reduceMotion ? delta * 0.2 : delta);
    stars.update(elapsed);
    launch.update(delta);
    if (celebActive) celebPool.update(delta);

    if (launch.launched && launch.orbit) {
      if (!hudArmed) {
        hudArmed = true;
        launch.orbit.setTimeScale(echelleDepart());
        hud.setTimeScale(echelleDepart());
        hud.setLune(launch.profile?.type === 'transfert_lune');
        hud.show();
        player.setCubesat(launch.cubesat?.object, launch.orbit);
        vueActuelle = 'ensemble';
        vuePosee = false;
        hud.setVue('ensemble');
      }
      if (player.prendreSaisie()) {
        vueActuelle = null;
        vuePosee = true;
        hud.setVue(null);
      }
      if (vueActuelle && (vueActuelle === 'satellite' || !vuePosee)) poserVue();
      hud.update(launch.orbit.telemetry());
    }

    player.update(delta);

    renderer.render(scene, camera);
  }
  animate();

  // Pas de rendu quand l'onglet est cache (economie de batterie sur mobile).
  function onVisibility() {
    if (document.hidden) {
      running = false;
      cancelAnimationFrame(frameId);
    } else if (!running) {
      running = true;
      clock.getDelta();
      animate();
    }
  }
  document.addEventListener('visibilitychange', onVisibility);

  function retirerLune() {
    if (!lune) return;
    scene.remove(lune);
    lune.geometry.dispose();
    lune.material.dispose();
    lune = null;
  }

  function assurerLune(orbit, profile) {
    const km = profile?.rayonLuneKm;
    if (profile?.type !== 'transfert_lune' || !(km > 0)) {
      retirerLune();
      return null;
    }
    const rayon = km / (profile.bodyRadiusKm || 6378);
    if (!lune) {
      lune = new THREE.Mesh(
        new THREE.SphereGeometry(1, 32, 24),
        new THREE.MeshStandardMaterial({ color: 0xb7b7c0, roughness: 1, metalness: 0 })
      );
      lune.name = 'lune';
      scene.add(lune);
    }
    lune.scale.setScalar(rayon);
    lune.position.copy(orbit.positionAt(Math.PI));
    return lune;
  }

  function poserVue() {
    const orbit = launch.orbit;
    const sat = launch.cubesat?.object;
    const profile = launch.profile;
    if (!orbit) return;
    const apo = orbit.a * (1 + orbit.e);
    const plafond = Math.max(10, distanceEnsemble(apo, cameraHome.length()) * 1.4);
    if (vueActuelle === 'ensemble') {
      const dist = distanceEnsemble(apo, cameraHome.length());
      const eye = cameraHome.clone().normalize().multiplyScalar(dist);
      player.cadrer(new THREE.Vector3(), eye, { min: 1.22, max: plafond });
      vuePosee = true;
      return;
    }
    if (vueActuelle === 'satellite' && sat) {
      const pos = sat.position.clone();
      const dir = orbit.directionAt(orbit.theta);
      const haut = pos.clone().normalize();
      const eye = pos.clone().addScaledVector(dir, -0.04).addScaledVector(haut, 0.016);
      player.cadrer(pos, eye, { min: 0.008, max: plafond });
      return;
    }
    if (vueActuelle === 'lune') {
      const astre = assurerLune(orbit, profile);
      const centre = astre ? astre.position.clone() : orbit.positionAt(Math.PI);
      const rayon = astre ? astre.scale.x : 1;
      const radial = centre.clone().normalize();
      const cote = new THREE.Vector3(0, 1, 0).cross(radial);
      if (cote.lengthSq() < 1e-6) cote.set(1, 0, 0);
      cote.normalize();
      const eye = centre.clone().addScaledVector(cote, rayon * 4).addScaledVector(radial, -rayon * 2);
      player.cadrer(centre, eye, { min: Math.max(0.05, rayon * 1.3), max: plafond });
      vuePosee = true;
    }
  }

  function showMissionBanner(type) {
    document.getElementById('sh-mission-accomplie')?.remove();
    document.getElementById('cam-hint')?.classList.add('is-gone');
    const banner = document.createElement('div');
    banner.id = 'sh-mission-accomplie';
    banner.setAttribute('role', 'status');
    const ligne = type === 'transfert_lune'
      ? t('Capture à 50 km', 'Capture at 50 km')
      : t('Orbite atteinte', 'Orbit reached');
    banner.innerHTML = `<p>${t('Mission accomplie', 'Mission complete')}</p><span>${ligne}</span>`;
    document.body.appendChild(banner);
    requestAnimationFrame(() => banner.classList.add('is-in'));
    setTimeout(() => {
      banner.classList.add('is-out');
      setTimeout(() => banner.remove(), 600);
    }, 3000);
  }

  // Le moteur d'episodes annonce chaque changement ; la scene choisit sa mise en scene.
  function onEpisodeChange({ detail }) {
    if (detail?.episode?.type === 'lancement') launch.prepare();
  }
  window.addEventListener('episode-change', onEpisodeChange);

  return {
    scene,
    camera,
    renderer,
    earth,
    stars,
    applyQuality() {
      renderer.setPixelRatio(ratioPixels());
      resize();
    },
    /** Pose la trajectoire du chapitre et démonte un lancement précédent. */
    setMission(gmatId) {
      hudArmed = false;
      vueActuelle = null;
      vuePosee = false;
      retirerLune();
      hud.hide();
      hud.setVue(null);
      hud.setLune(false);
      hud.setTimeScale(echelleDepart());
      player.setCubesat(null, null);
      launch.setProfile(gmatPour(gmatId));
    },
    lienOrbital() {
      const p = launch.profile;
      return {
        delayMs: p?.delayMs ?? 0,
        contactMin: p?.contactMin ?? null,
        labelFr: p?.labelFr,
        labelEn: p?.labelEn
      };
    },
    /** Lance la sequence complete ; Promise resolue quand le CubeSat est en orbite. */
    launch: () => launch.launch(),
    get launched() {
      return launch.launched;
    },
    /** Avance la simulation de `seconds` d'un coup (pas fixe 1/60 s) : tests et demos. */
    advance(seconds) {
      const dt = 1 / 60;
      for (let s = 0; s < seconds; s += dt) {
        earth.update(dt);
        launch.update(dt);
      }
    },
    /** Retour visuel d'alerte (utilise par les phases suivantes / ASTRA). */
    flashWarning() {
      earth.flash();
    },
    /** Burst doré + bandeau, au moment où le CubeSat atteint l'orbite. */
    celebrate(detail) {
      showMissionBanner(detail?.type);
      if (reduceMotion) return;
      celebActive = true;
      const origin = new THREE.Vector3(1.08, 0.2, 0);
      launch.cubesat?.object?.getWorldPosition(origin);
      const C_GOLD  = new THREE.Color(0xffd27a);
      const C_WHITE = new THREE.Color(0xffffff);
      const C_CYAN  = new THREE.Color(0x7cf0ff);
      const palettes = [[C_GOLD, C_WHITE], [C_GOLD, C_GOLD], [C_CYAN, C_WHITE]];
      const ePos = new THREE.Vector3();
      const eVel = new THREE.Vector3();
      const eAcc = new THREE.Vector3();
      for (let i = 0; i < 200; i++) {
        ePos.copy(origin).addScaledVector(
          new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(),
          0.01 + Math.random() * 0.02
        );
        const speed = 0.015 + Math.random() * 0.05;
        eVel.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize().multiplyScalar(speed);
        eAcc.copy(origin).normalize().multiplyScalar(-0.01);
        const pal = palettes[Math.floor(Math.random() * palettes.length)];
        celebPool.emit({
          position: ePos, velocity: eVel, acceleration: eAcc,
          life: 1.6 + Math.random() * 1.2,
          size: [0.02 + Math.random() * 0.018, 0.002],
          color: pal, alpha: 1, drag: 0.4
        });
      }
      setTimeout(() => { celebActive = false; }, 3200);
    },
    dispose() {
      running = false;
      retirerLune();
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('episode-change', onEpisodeChange);
      player.dispose();
      launch.dispose();
      hud.dispose();
      celebPool.dispose();
      stars.dispose();
      earth.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    }
  };
}
