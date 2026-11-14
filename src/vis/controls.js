// Camera joueur : OrbitControls (souris / tactile) + WASD / fleches / zoom clavier.
// Desactivee pendant la sequence de lancement (la camera est alors "cinema").

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const KEY_LEFT = new Set(['KeyA', 'ArrowLeft']);
const KEY_RIGHT = new Set(['KeyD', 'ArrowRight']);
const KEY_UP = new Set(['KeyW', 'ArrowUp']);
const KEY_DOWN = new Set(['KeyS', 'ArrowDown']);
const KEY_IN = new Set(['KeyQ', 'Equal', 'NumpadAdd', 'PageUp']);
const KEY_OUT = new Set(['KeyE', 'Minus', 'NumpadSubtract', 'PageDown']);

export function createPlayerControls({ camera, domElement, isBlocked }) {
  const controls = new OrbitControls(camera, domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.085;
  controls.enablePan = false;
  controls.minDistance = 1.22;
  controls.maxDistance = 10;
  controls.minPolarAngle = 0.12;
  controls.maxPolarAngle = Math.PI - 0.12;
  controls.zoomSpeed = 0.9;
  controls.rotateSpeed = 0.55;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.35;
  controls.enabled = true;

  domElement.style.touchAction = 'none';
  domElement.style.cursor = 'grab';

  const held = new Set();
  const offset = new THREE.Vector3();
  const spherical = new THREE.Spherical();
  let onFirstInput = null;

  function markInput() {
    controls.autoRotate = false;
    onFirstInput?.();
    onFirstInput = null;
  }

  function onPointerDown() {
    if (isBlocked()) return;
    markInput();
    domElement.style.cursor = 'grabbing';
  }
  function onPointerUp() {
    domElement.style.cursor = 'grab';
  }

  function onKeyDown(event) {
    if (isBlocked()) return;
    const tag = event.target?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    held.add(event.code);
    if (KEY_LEFT.has(event.code) || KEY_RIGHT.has(event.code) || KEY_UP.has(event.code) || KEY_DOWN.has(event.code)) {
      event.preventDefault();
      markInput();
    }
    if (KEY_IN.has(event.code) || KEY_OUT.has(event.code)) markInput();
  }
  function onKeyUp(event) {
    held.delete(event.code);
  }

  function any(set) {
    for (const code of set) if (held.has(code)) return true;
    return false;
  }

  domElement.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  domElement.addEventListener('wheel', markInput, { passive: true });

  return {
    controls,
    onFirstInput(fn) {
      onFirstInput = fn;
    },
    update(dt) {
      const blocked = isBlocked();
      controls.enabled = !blocked;
      if (blocked) {
        held.clear();
        return;
      }

      if (any(KEY_LEFT) || any(KEY_RIGHT) || any(KEY_UP) || any(KEY_DOWN) || any(KEY_IN) || any(KEY_OUT)) {
        offset.copy(camera.position).sub(controls.target);
        spherical.setFromVector3(offset);
        const turn = 1.05 * dt;
        if (any(KEY_LEFT)) spherical.theta -= turn;
        if (any(KEY_RIGHT)) spherical.theta += turn;
        if (any(KEY_UP)) spherical.phi -= turn;
        if (any(KEY_DOWN)) spherical.phi += turn;
        if (any(KEY_IN)) spherical.radius *= 1 - 1.4 * dt;
        if (any(KEY_OUT)) spherical.radius *= 1 + 1.4 * dt;
        spherical.phi = Math.min(controls.maxPolarAngle, Math.max(controls.minPolarAngle, spherical.phi));
        spherical.radius = Math.min(controls.maxDistance, Math.max(controls.minDistance, spherical.radius));
        spherical.makeSafe();
        camera.position.copy(controls.target).add(offset.setFromSpherical(spherical));
        camera.lookAt(controls.target);
      }
      controls.update();
    },
    dispose() {
      controls.dispose();
      domElement.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      domElement.removeEventListener('wheel', markInput);
    }
  };
}
