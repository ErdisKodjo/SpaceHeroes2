// Scene Three.js minimale pour le panneau "Vue 3D" de l'ecran de mission (§3.12).
// Point de depart seulement : la Piste 5 (plan 24h) doit la remplacer par une vraie
// orbite/trajectoire en reutilisant le code de mission-viz-main/OntologyDrivenOrrery
// (OrbitalPropagator.js, TrackballControls.js), sans repartir de zero.

import * as THREE from 'three';

export function mountPlaceholderScene(container) {
  const width = container.clientWidth || 320;
  const height = container.clientHeight || 220;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
  camera.position.z = 5;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  container.appendChild(renderer.domElement);

  // Placeholder : une sphere (le vaisseau / le corps celeste) en wireframe.
  const geometry = new THREE.SphereGeometry(1.2, 16, 16);
  const material = new THREE.MeshBasicMaterial({ color: 0x7cf0ff, wireframe: true });
  const sphere = new THREE.Mesh(geometry, material);
  scene.add(sphere);

  function animate() {
    requestAnimationFrame(animate);
    sphere.rotation.y += 0.01;
    renderer.render(scene, camera);
  }
  animate();

  return { scene, camera, renderer };
}
