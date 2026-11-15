// Répartition des 12 points d'une famille d'atelier.
// AtelierFamily reste le juge. Ici on propose un départ légal
// et l'effet chiffré : légèreté sur la masse, consommation sur la puissance.

import { AtelierFamily } from './atelier.js';
import moteursData from '../data/ateliers/moteurs.json';
import structureData from '../data/ateliers/structure.json';
import energieData from '../data/ateliers/energie.json';
import commsData from '../data/ateliers/communications.json';
import instrumentData from '../data/ateliers/instrument.json';

const DATA = {
  moteurs: moteursData,
  structure: structureData,
  energie: energieData,
  communications: commsData,
  instrument: instrumentData
};

function liste(data) {
  return data?.composants ?? data?.technologies ?? [];
}

export function pieceFamille(famille, id) {
  return liste(DATA[famille]).find((c) => (c.id || c.nom) === id) || null;
}

export function axesFamille(famille) {
  return DATA[famille]?.axes || [];
}

export function plafondAxe(famille, id, axe) {
  const tech = pieceFamille(famille, id);
  const cap = tech?.plafonds?.[axe];
  return Math.min(6, cap ?? 6);
}

export function repartitionDepart(famille, id) {
  const axes = axesFamille(famille);
  const rep = {};
  for (const axe of axes) rep[axe] = 1;
  let reste = 12 - axes.length;
  const ordre = [...axes].sort((a, b) => plafondAxe(famille, id, b) - plafondAxe(famille, id, a));
  let garde = 0;
  while (reste > 0 && garde < 40) {
    garde += 1;
    let pose = false;
    for (const axe of ordre) {
      if (rep[axe] < plafondAxe(famille, id, axe)) {
        rep[axe] += 1;
        reste -= 1;
        pose = true;
        if (reste === 0) break;
      }
    }
    if (!pose) break;
  }
  return rep;
}

export function jugerRepartition(famille, id, repartition) {
  const data = DATA[famille];
  const tech = pieceFamille(famille, id);
  if (!data || !tech) return { valide: false, raison: 'Pièce inconnue.' };
  const family = new AtelierFamily({
    nom: data.nom,
    axes: data.axes,
    technologies: liste(data)
  });
  const verdict = family.validerRepartition(tech.nom, repartition || {});
  if (verdict.valide) return { valide: true };
  if (verdict.raison.includes('total')) {
    return { valide: false, raison: 'Place les 12 points.' };
  }
  if (verdict.raison.includes('plafond')) {
    return { valide: false, raison: 'Un axe dépasse le plafond de cette pièce.' };
  }
  return { valide: false, raison: 'Chaque axe doit rester entre 1 et 6.' };
}

// 3 points sur un axe = neutre.
// Légèreté allège. L'axe masse alourdit. La consommation tire plus de watts.
export function facteursRepartition(famille, repartition = {}) {
  const rep = repartition || {};
  let masse = 1;
  let puissance = 1;
  if (rep.legerete != null) masse *= 1 - (rep.legerete - 3) * 0.08;
  if (rep.masse_axe != null) masse *= 1 + (rep.masse_axe - 3) * 0.08;
  if (rep.consommation != null) puissance *= 1 + (rep.consommation - 3) * 0.1;
  return {
    masse: Math.max(0.55, masse),
    puissance: Math.max(0.55, puissance)
  };
}
