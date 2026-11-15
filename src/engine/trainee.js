// Perte de demi-grand axe en orbite basse, lue sur les faces propagées.
// À 84 jours pour les 12 semaines. À 120 jours pour la tenue longue.
// Entre les masses mesurées, interpolation. En dehors, prolongation en 1/masse.
// Une face absente de la table ne reçoit pas de chiffre.

import vieLeo from '../data/gmat/vie_leo.json';

const FACES = (vieLeo.faces || []).map((face) => ({
  surfaceM2: face.surfaceM2,
  points: [...(face.points || [])].sort((a, b) => a.masseKg - b.masseKg)
}));

const SURFACE_REF = FACES[0]?.surfaceM2 || 0.01;
const MARGE_SMA_KM = vieLeo.parametres?.margeSmaKm || 350;

function faceDe(surfaceM2) {
  return FACES.find((face) => Math.abs(face.surfaceM2 - surfaceM2) < 1e-8) || null;
}

function lire(points, cle, masseKg) {
  if (!points?.length || !(masseKg > 0)) return null;
  const valeur = (point) => (Number.isFinite(point[cle]) ? point[cle] : null);
  const exact = points.find((point) => Math.abs(point.masseKg - masseKg) < 1e-6);
  if (exact) return valeur(exact);
  const bas = points[0];
  const haut = points[points.length - 1];
  if (masseKg < bas.masseKg) {
    const v = valeur(bas);
    return v == null ? null : v * bas.masseKg / masseKg;
  }
  if (masseKg > haut.masseKg) {
    const v = valeur(haut);
    return v == null ? null : v * haut.masseKg / masseKg;
  }
  for (let i = 1; i < points.length; i += 1) {
    const a = points[i - 1];
    const b = points[i];
    if (masseKg > b.masseKg) continue;
    const va = valeur(a);
    const vb = valeur(b);
    if (va == null || vb == null) return null;
    const t = (masseKg - a.masseKg) / (b.masseKg - a.masseKg);
    return va + t * (vb - va);
  }
  return null;
}

export function masseDansTable(masseKg, surfaceM2 = SURFACE_REF) {
  const face = faceDe(surfaceM2);
  if (!face || !(masseKg > 0)) return false;
  const bas = face.points[0];
  const haut = face.points[face.points.length - 1];
  return masseKg >= bas.masseKg && masseKg <= haut.masseKg;
}

export function perteSmaKm(masseKg, surfaceM2 = SURFACE_REF) {
  const face = faceDe(surfaceM2);
  if (!face) return null;
  return lire(face.points, 'perte84Km', masseKg);
}

export function perte120Km(masseKg, surfaceM2 = SURFACE_REF) {
  const face = faceDe(surfaceM2);
  if (!face) return null;
  return lire(face.points, 'perte120Km', masseKg);
}

export function arret200Jours(masseKg, surfaceM2 = SURFACE_REF) {
  const face = faceDe(surfaceM2);
  if (!face || !(masseKg > 0)) return null;
  const point = face.points.find((p) => Math.abs(p.masseKg - masseKg) < 1e-6);
  return Number.isFinite(point?.arret200Jours) ? point.arret200Jours : null;
}

export function semainesTrainee(masseKg, surfaceM2 = SURFACE_REF, semainesMission = 12) {
  const perte = perteSmaKm(masseKg, surfaceM2);
  if (perte == null || !(semainesMission > 0)) return 0;
  // La perte lue est celle des 84 jours, soit 12 semaines.
  const semaines = semainesMission * (perte / MARGE_SMA_KM);
  return Math.round(semaines * 100) / 100;
}
