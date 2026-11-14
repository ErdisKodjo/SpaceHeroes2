// Chef d'orchestre de la vue 3D (panneau #vue3d).
//
// Phase 1 : fond etoile + Terre (jour/nuit, nuages, atmosphere) + eclairage solaire.
// Phase 3 : sequence de lancement (launch.js), declenchee par l'episode "lancement".
// Les phases suivantes brancheront ici cubesat.js (atelier), orbit.js (HUD), controls.js
// et hud.js ; main.js ne connait que mountScene() et l'evenement 'episode-change'.

import * as THREE from 'three';
import './vis.css';
import { createStarfield } from './particles.js';
import { createEarth } from './earth.js';
import { createLaunchSequence } from './launch.js';

// Direction du Soleil (monde). Legerement de cote pour montrer le terminateur
// jour/nuit et les lumieres des villes.
const SUN_DIRECTION = new THREE.Vector3(1, 0.25, 0.55).normalize();

export function mountScene(container) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x02030a, 1);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  // near tres petit : la camera descend a quelques "km" du pas de tir pendant le lancement.
  const camera = new THREE.PerspectiveCamera(40, 1, 0.001, 2000);
  const cameraTarget = new THREE.Vector3(0, 0, 0);
  const CAMERA_BASE = new THREE.Vector3(-0.6, 0.55, 3.4);
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

  // --- Dimensionnement : suit la taille reelle du panneau (responsive, mobile). ---
  function resize() {
    const width = container.clientWidth || 320;
    const height = container.clientHeight || 220;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    // Panneau etroit (mobile portrait) : on recule un peu pour garder la Terre entiere.
    const fit = camera.aspect < 1 ? 1 / camera.aspect : 1;
    cameraHome.copy(CAMERA_BASE).multiplyScalar(Math.min(fit, 1.8));
    if (!launch.controlsCamera) camera.position.copy(cameraHome);
    camera.updateProjectionMatrix();
    launch.setViewport(height * renderer.getPixelRatio(), camera.fov);
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  resize();

  // --- Boucle d'animation ---
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
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

    if (!launch.controlsCamera) {
      // Respiration lente de la camera : la scene n'est jamais figee.
      camera.position.copy(cameraHome);
      if (!reduceMotion) {
        camera.position.x += Math.sin(elapsed * 0.11) * 0.08;
        camera.position.y += Math.sin(elapsed * 0.07) * 0.05;
      }
      camera.lookAt(cameraTarget);
    }

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
    dispose() {
      running = false;
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('episode-change', onEpisodeChange);
      launch.dispose();
      stars.dispose();
      earth.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    }
  };
}
