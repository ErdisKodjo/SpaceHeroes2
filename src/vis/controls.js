// Camera joueur : OrbitControls (souris / tactile) + WASD / fleches / zoom clavier.
// + Raycasting CubeSat : clic sur le satellite → popup télémétrie (Sprint 5).
// Desactivee pendant la sequence de lancement (la camera est alors "cinema").

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { icon } from '../ui/icons.js';

const KEY_LEFT  = new Set(['KeyA', 'ArrowLeft']);
const KEY_RIGHT = new Set(['KeyD', 'ArrowRight']);
const KEY_UP    = new Set(['KeyW', 'ArrowUp']);
const KEY_DOWN  = new Set(['KeyS', 'ArrowDown']);
const KEY_IN    = new Set(['KeyQ', 'Equal',  'NumpadAdd',      'PageUp']);
const KEY_OUT   = new Set(['KeyE', 'Minus',  'NumpadSubtract', 'PageDown']);

// ─── Popup télémétrie CubeSat ─────────────────────────────────────────────

let _telemetryPopup = null;

function showTelemetry(cubesatObject, orbitObj) {
  if (_telemetryPopup) { _telemetryPopup.remove(); _telemetryPopup = null; }

  const tel = orbitObj?.telemetry?.() ?? null;
  const battery  = tel ? Math.max(0, Math.min(100, 60 + Math.sin(tel.theta ?? 0) * 25)) : 72;
  const signal   = tel ? (-90 + (10 * Math.sin((tel.theta ?? 0) * 1.3))).toFixed(1) : '-88.4';
  const tempC    = tel ? (Math.round(-20 + Math.sin((tel.theta ?? 0) * 0.7) * 60)) : 18;
  const nextMin  = tel ? Math.max(0, Math.round(tel.periodMin - (tel.theta / (2 * Math.PI)) * tel.periodMin)) : 42;

  const pop = document.createElement('div');
  pop.className = 'sh-cubesat-popup';
  pop.innerHTML = `
    <div class="sh-cubesat-popup-header">
      ${icon('satellite', 15)}
      <span>CubeSat 1U — Télémétrie</span>
      <button type="button" class="sh-cubesat-popup-close" aria-label="Fermer">
        ${icon('close', 13)}
      </button>
    </div>
    <ul class="sh-cubesat-popup-rows">
      <li>
        ${icon('battery', 14)}
        <span>Batterie</span>
        <strong class="${battery < 20 ? 'is-crit' : battery < 50 ? 'is-warn' : ''}">${Math.round(battery)} %</strong>
      </li>
      <li>
        ${icon('signal', 14)}
        <span>Signal</span>
        <strong>${signal} dBm</strong>
      </li>
      <li>
        ${icon('thermometer', 14)}
        <span>Température</span>
        <strong class="${Math.abs(tempC) > 70 ? 'is-warn' : ''}">${tempC > 0 ? '+' : ''}${tempC} °C</strong>
      </li>
      <li>
        ${icon('signal', 14)}
        <span>Prochain contact</span>
        <strong>T-${nextMin} min</strong>
      </li>
      ${tel ? `<li>
        ${icon('orbit', 14)}
        <span>Altitude</span>
        <strong>${Math.round(tel.altitudeKm ?? 550)} km</strong>
      </li>` : ''}
    </ul>
  `;

  document.body.appendChild(pop);
  _telemetryPopup = pop;

  pop.querySelector('.sh-cubesat-popup-close').addEventListener('click', () => {
    pop.remove();
    _telemetryPopup = null;
  });

  // Auto-fermeture après 8 s
  setTimeout(() => {
    if (_telemetryPopup === pop) { pop.remove(); _telemetryPopup = null; }
  }, 8000);
}

// ─── Contrôles joueur ─────────────────────────────────────────────────────

export function createPlayerControls({ camera, domElement, isBlocked }) {
  const controls = new OrbitControls(camera, domElement);
  controls.enableDamping  = true;
  controls.dampingFactor  = 0.085;
  controls.enablePan      = false;
  controls.minDistance    = 1.22;
  controls.maxDistance    = 10;
  controls.minPolarAngle  = 0.12;
  controls.maxPolarAngle  = Math.PI - 0.12;
  controls.zoomSpeed      = 0.9;
  controls.rotateSpeed    = 0.55;
  controls.autoRotate     = true;
  controls.autoRotateSpeed = 0.35;
  controls.enabled        = true;

  domElement.style.touchAction = 'none';
  domElement.style.cursor = 'grab';

  const held        = new Set();
  const offset      = new THREE.Vector3();
  const spherical   = new THREE.Spherical();
  const raycaster   = new THREE.Raycaster();
  const pointer     = new THREE.Vector2();

  let onFirstInput  = null;
  let cubesatRef    = null;   // THREE.Object3D du CubeSat (injecté depuis scene.js)
  let orbitRef      = null;   // orbit object (telemetry)
  let pointerMoved  = false;
  let pointerDownAt = null;

  function markInput() {
    controls.autoRotate = false;
    onFirstInput?.();
    onFirstInput = null;
  }

  function onPointerDown(e) {
    if (isBlocked()) return;
    markInput();
    domElement.style.cursor = 'grabbing';
    pointerMoved  = false;
    pointerDownAt = { x: e.clientX, y: e.clientY };
  }

  function onPointerMove(e) {
    if (!pointerDownAt) return;
    const dx = e.clientX - pointerDownAt.x;
    const dy = e.clientY - pointerDownAt.y;
    if (Math.sqrt(dx*dx + dy*dy) > 4) pointerMoved = true;
  }

  function onPointerUp(e) {
    domElement.style.cursor = 'grab';

    // Raycasting seulement si c'était un vrai clic (pas un drag)
    if (!pointerMoved && !isBlocked() && cubesatRef) {
      const rect = domElement.getBoundingClientRect();
      pointer.x  = ((e.clientX - rect.left) / rect.width)  * 2 - 1;
      pointer.y  = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);

      // On teste le groupe CubeSat et tous ses enfants
      const hits = raycaster.intersectObject(cubesatRef, true);
      if (hits.length > 0) {
        showTelemetry(cubesatRef, orbitRef);
      }
    }

    pointerDownAt = null;
    pointerMoved  = false;
  }

  function onKeyDown(event) {
    if (isBlocked()) return;
    const tag = event.target?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    held.add(event.code);
    if (KEY_LEFT.has(event.code)  || KEY_RIGHT.has(event.code) ||
        KEY_UP.has(event.code)    || KEY_DOWN.has(event.code)) {
      event.preventDefault();
      markInput();
    }
    if (KEY_IN.has(event.code) || KEY_OUT.has(event.code)) markInput();
  }

  function onKeyUp(event) { held.delete(event.code); }

  function any(set) {
    for (const code of set) if (held.has(code)) return true;
    return false;
  }

  domElement.addEventListener('pointerdown', onPointerDown);
  domElement.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('keydown',   onKeyDown);
  window.addEventListener('keyup',     onKeyUp);
  domElement.addEventListener('wheel',  markInput, { passive: true });

  return {
    controls,
    onFirstInput(fn) { onFirstInput = fn; },
    /** Injecte la référence au CubeSat une fois qu'il est en orbite. */
    setCubesat(obj, orb) { cubesatRef = obj; orbitRef = orb; },
    update(dt) {
      const blocked = isBlocked();
      controls.enabled = !blocked;
      if (blocked) { held.clear(); return; }

      if (any(KEY_LEFT) || any(KEY_RIGHT) || any(KEY_UP) || any(KEY_DOWN) ||
          any(KEY_IN)   || any(KEY_OUT)) {
        offset.copy(camera.position).sub(controls.target);
        spherical.setFromVector3(offset);
        const turn = 1.05 * dt;
        if (any(KEY_LEFT))  spherical.theta -= turn;
        if (any(KEY_RIGHT)) spherical.theta += turn;
        if (any(KEY_UP))    spherical.phi   -= turn;
        if (any(KEY_DOWN))  spherical.phi   += turn;
        if (any(KEY_IN))    spherical.radius *= 1 - 1.4 * dt;
        if (any(KEY_OUT))   spherical.radius *= 1 + 1.4 * dt;
        spherical.phi = Math.min(controls.maxPolarAngle,
          Math.max(controls.minPolarAngle, spherical.phi));
        spherical.radius = Math.min(controls.maxDistance,
          Math.max(controls.minDistance,  spherical.radius));
        spherical.makeSafe();
        camera.position.copy(controls.target).add(offset.setFromSpherical(spherical));
        camera.lookAt(controls.target);
      }
      controls.update();
    },
    dispose() {
      _telemetryPopup?.remove();
      _telemetryPopup = null;
      controls.dispose();
      domElement.removeEventListener('pointerdown', onPointerDown);
      domElement.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('keydown',   onKeyDown);
      window.removeEventListener('keyup',     onKeyUp);
      domElement.removeEventListener('wheel',  markInput);
    }
  };
}
