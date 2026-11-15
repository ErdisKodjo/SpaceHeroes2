// Perte de demi-grand axe en orbite basse, lue sur la table GMAT.
// Entre les masses mesurées, interpolation. En dehors, la trainée suit 1/masse.

import vieLeo from '../data/gmat/vie_leo.json';

const POINTS = [...(vieLeo.points || [])].sort((a, b) => a.masseKg - b.masseKg);

export function perteSmaKm(masseKg) {
  if (!(masseKg > 0) || POINTS.length === 0) return null;
  const bas = POINTS[0];
  const haut = POINTS[POINTS.length - 1];
  if (masseKg <= bas.masseKg) return bas.perteSmaKm * bas.masseKg / masseKg;
  if (masseKg >= haut.masseKg) return haut.perteSmaKm * haut.masseKg / masseKg;
  for (let i = 1; i < POINTS.length; i += 1) {
    const a = POINTS[i - 1];
    const b = POINTS[i];
    if (masseKg <= b.masseKg) {
      const t = (masseKg - a.masseKg) / (b.masseKg - a.masseKg);
      return a.perteSmaKm + t * (b.perteSmaKm - a.perteSmaKm);
    }
  }
  return haut.perteSmaKm;
}
