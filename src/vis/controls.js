// Camera joueur : OrbitControls (souris / tactile) + WASD / fleches / zoom clavier.
// + Raycasting CubeSat : clic sur le satellite → popup télémétrie (Sprint 5).
// Desactivee pendant la sequence de lancement (la camera est alors "cinema").

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { icon } from '../ui/icons.js';
import { t } from '../i18n.js';
import { compDesc, compName } from '../i18n/content.js';
import { trouverPiece } from '../engine/atelier-cout.js';

const KEY_LEFT  = new Set(['KeyA', 'ArrowLeft']);
const KEY_RIGHT = new Set(['KeyD', 'ArrowRight']);
const KEY_UP    = new Set(['KeyW', 'ArrowUp']);
const KEY_DOWN  = new Set(['KeyS', 'ArrowDown']);
const KEY_IN    = new Set(['KeyQ', 'Equal',  'NumpadAdd',      'PageUp']);
const KEY_OUT   = new Set(['KeyE', 'Minus',  'NumpadSubtract', 'PageDown']);

// ─── Popup télémétrie CubeSat ─────────────────────────────────────────────

let _telemetryPopup = null;

const FAMILLES = {
  moteurs: ['Moteur', 'Propulsion'],
  structure: ['Structure', 'Structure'],
  energie: ['Énergie', 'Power'],
  communications: ['Communications', 'Communications'],
  instrument: ['Instrument', 'Instrument']
};

let lireMontage = () => ({});

export function bindMontage(lire) {
  lireMontage = typeof lire === 'function' ? lire : () => ({});
}

function familleDuHit(object) {
  let courant = object;
  while (courant) {
    if (FAMILLES[courant.userData?.famille]) return courant.userData.famille;
    courant = courant.parent;
  }
  return null;
}

function showTelemetry(famille, orbitObj) {
  if (_telemetryPopup) { _telemetryPopup.remove(); _telemetryPopup = null; }

  const id = lireMontage()?.[famille] || null;
  const piece = id ? trouverPiece(id) : null;
  const nom = piece
    ? compName(id, piece.nom)
    : t('Pas encore montée', 'Not fitted yet');
  const desc = piece
    ? compDesc(id, piece.description || '')
    : t('Cette face n\'a pas reçu de pièce à l\'atelier.', 'This face has no part from the workshop.');
  const titre = t(FAMILLES[famille][0], FAMILLES[famille][1]);
  const tel = orbitObj?.telemetry?.() ?? null;
  const altitude = tel ? Math.round(tel.altitudeKm ?? 0) : null;

  const pop = document.createElement('div');
  pop.className = 'sh-cubesat-popup';
  pop.innerHTML = `
    <div class="sh-cubesat-popup-header">
      ${icon('satellite', 15)}
      <span>${titre}</span>
      <button type="button" class="sh-cubesat-popup-close" aria-label="${t('Fermer', 'Close')}">
        ${icon('close', 13)}
      </button>
    </div>
    <p class="sh-cubesat-popup-nom">${nom}</p>
    <p class="sh-cubesat-popup-desc">${desc}</p>
    ${altitude == null ? '' : `<p class="sh-cubesat-popup-alt">${t('Altitude', 'Altitude')} ${altitude} km</p>`}
  `;

  document.body.appendChild(pop);
  _telemetryPopup = pop;

  pop.querySelector('.sh-cubesat-popup-close').addEventListener('click', () => {
    pop.remove();
    _telemetryPopup = null;
  });
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

  let onFirstInput  = null;
  let cubesatRef    = null;
  let orbitRef      = null;
  let pointerMoved  = false;
  let pointerDownAt = null;
  const raycaster   = new THREE.Raycaster();
  const ndc         = new THREE.Vector2();

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

  function familleParDecalage(dx, dy) {
    const longueur = Math.hypot(dx, dy);
    if (longueur < 10) return 'structure';
    const origine = new THREE.Vector3();
    cubesatRef.getWorldPosition(origine);
    const versEcran = (monde) => {
      const p = monde.project(camera);
      return { x: p.x * 0.5 + 0.5, y: -p.y * 0.5 + 0.5 };
    };
    const o = versEcran(origine.clone());
    const axeX = new THREE.Vector3(1, 0, 0).transformDirection(cubesatRef.matrixWorld);
    const axeY = new THREE.Vector3(0, 1, 0).transformDirection(cubesatRef.matrixWorld);
    const x = versEcran(origine.clone().add(axeX));
    const y = versEcran(origine.clone().add(axeY));
    const ux = { x: x.x - o.x, y: x.y - o.y };
    const uy = { x: y.x - o.x, y: y.y - o.y };
    const ax = Math.hypot(ux.x, ux.y) || 1;
    const ay = Math.hypot(uy.x, uy.y) || 1;
    const cosX = (ux.x * dx + ux.y * dy) / (ax * longueur);
    const cosY = (uy.x * dx + uy.y * dy) / (ay * longueur);
    if (Math.abs(cosX) >= Math.abs(cosY)) return 'energie';
    if (cosY > 0 && Math.abs(cosX) > 0.45) return 'communications';
    return cosY >= 0 ? 'instrument' : 'moteurs';
  }

  function onPointerUp(e) {
    domElement.style.cursor = 'grab';
    const down = pointerDownAt;
    const moved = pointerMoved;
    pointerDownAt = null;
    pointerMoved = false;

    if (!down || moved || isBlocked() || !cubesatRef) return;
    const rect = domElement.getBoundingClientRect();
    ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(ndc, camera);
    let famille = null;
    for (const hit of raycaster.intersectObject(cubesatRef, true)) {
      famille = familleDuHit(hit.object);
      if (famille) break;
    }
    if (!famille) {
      const origine = new THREE.Vector3();
      cubesatRef.getWorldPosition(origine);
      const projete = origine.clone().project(camera);
      if (projete.z > 1) return;
      const sx = (projete.x * 0.5 + 0.5) * rect.width;
      const sy = (-projete.y * 0.5 + 0.5) * rect.height;
      const dx = (e.clientX - rect.left) - sx;
      const dy = (e.clientY - rect.top) - sy;
      if (Math.hypot(dx, dy) > 36) return;
      famille = familleParDecalage(dx, dy);
    }
    showTelemetry(famille, orbitRef);
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
