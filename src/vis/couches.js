// Couches traversees au decollage. Les bornes 12, 50, 80 et 100 km sont les
// limites rondes usuelles (troposphere, stratosphere, mesosphere, ligne de
// Karman). Ce ne sont pas des sorties GMAT. L'altitude affichee du chapitre
// reste celle de la table.

export const COUCHES = [
  {
    jusqua: 12,
    id: 'troposphere',
    couleur: 0x8ec8e8,
    fr: 'Troposphère',
    en: 'Troposphere',
    detailFr: 'Du sol à 12 km',
    detailEn: 'From the ground to 12 km'
  },
  {
    jusqua: 50,
    id: 'stratosphere',
    couleur: 0x4f86c6,
    fr: 'Stratosphère',
    en: 'Stratosphere',
    detailFr: 'De 12 à 50 km',
    detailEn: 'From 12 to 50 km'
  },
  {
    jusqua: 80,
    id: 'mesosphere',
    couleur: 0x314e86,
    fr: 'Mésosphère',
    en: 'Mesosphere',
    detailFr: 'De 50 à 80 km',
    detailEn: 'From 50 to 80 km'
  },
  {
    jusqua: 100,
    id: 'thermosphere',
    couleur: 0xb7c7dc,
    fr: 'Thermosphère',
    en: 'Thermosphere',
    detailFr: 'La ligne de Kármán est à 100 km',
    detailEn: 'The Kármán line is at 100 km'
  },
  {
    jusqua: Infinity,
    id: 'karman',
    couleur: 0xe8eef6,
    fr: 'Au-delà de la ligne de Kármán',
    en: 'Above the Kármán line',
    detailFr: 'L\'atmosphère ne porte plus le vol',
    detailEn: 'The atmosphere no longer supports flight'
  }
];

export function coucheA(altKm) {
  const alt = Number.isFinite(altKm) ? Math.max(0, altKm) : 0;
  return COUCHES.find((c) => alt < c.jusqua) || COUCHES[COUCHES.length - 1];
}

// Rayon de scene ou le HUD lit `km`, sur la montee deja calculee du chapitre.
export function rayonCouche(km, { altitudeKm, climb, padLift }) {
  const plafond = altitudeKm > 0 ? altitudeKm : 1;
  const frac = Math.min(1, Math.max(0, km / plafond));
  return 1 + padLift + climb * frac;
}
