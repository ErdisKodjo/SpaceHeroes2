// Coût d'une sélection d'atelier, recalé sur les plafonds du chapitre.
// Les masses du catalogue sont celles d'un CubeSat 1U. Un chapitre dont le
// plafond est plus haut agrandit les pièces dans le même rapport, de sorte
// qu'une sélection médiane consomme environ 72 % de chaque plafond.

import { facteursRepartition } from './repartition.js';
import moteursData from '../data/ateliers/moteurs.json';
import structureData from '../data/ateliers/structure.json';
import energieData from '../data/ateliers/energie.json';
import commsData from '../data/ateliers/communications.json';
import instrumentData from '../data/ateliers/instrument.json';

const CATALOGUE = [moteursData, structureData, energieData, commsData, instrumentData];

const CIBLE = 0.72;

const DEBIT_MBPS = {
  antenne_uhf: 0.0096,
  antenne_xband: 100,
  laser_optique: 1000
};

const PART_DONNEES = {
  capteur_temp: 0.2,
  camera_5mp: 0.45,
  magnetometre: 0.3,
  spectrometre_uv: 0.75,
  radar_altimetre: 0.7
};

function liste(data) {
  return data.composants ?? data.technologies ?? [];
}

function mediane(values) {
  const nums = values.filter((n) => Number.isFinite(n));
  if (nums.length === 0) return 0;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

let referenceCache = null;

function reference() {
  if (referenceCache) return referenceCache;
  let masse = 0;
  let cout = 0;
  let puissance = 0;
  for (const data of CATALOGUE) {
    const items = liste(data);
    masse += mediane(items.map((c) => c.masse || 0));
    cout += mediane(items.map((c) => c.coutK || 0));
    const watts = items.map((c) => c.puissanceW || 0).filter((w) => w > 0);
    puissance += watts.length ? mediane(watts) : 0;
  }
  referenceCache = { masse, cout, puissance };
  return referenceCache;
}

export function echelle(chapter) {
  const ref = reference();
  const c = chapter?.contraintes || {};
  return {
    masse: ref.masse > 0 ? (CIBLE * (c.masse || 0)) / ref.masse : 1,
    coutK: ref.cout > 0 ? (CIBLE * (c.budget || 0) * 100) / ref.cout : 1,
    puissanceW: ref.puissance > 0 ? (CIBLE * (c.puissance || 0) * 10) / ref.puissance : 1
  };
}

export function trouverPiece(id) {
  if (!id) return null;
  for (const data of CATALOGUE) {
    const hit = liste(data).find((c) => (c.id || c.nom) === id);
    if (hit) return { ...hit, id: hit.id || hit.nom, famille: data.nom };
  }
  return null;
}

export function pieceEffective(chapter, comp) {
  if (!comp) return { masse: 0, coutK: 0, puissanceW: 0 };
  const s = echelle(chapter);
  return {
    masse: (comp.masse || 0) * s.masse,
    coutK: (comp.coutK || 0) * s.coutK,
    puissanceW: (comp.puissanceW || 0) * s.puissanceW
  };
}

function partLien(id) {
  const mbps = DEBIT_MBPS[id];
  if (!mbps) return 0;
  const t = (Math.log10(mbps) + 2) / 5;
  return 0.12 + 0.63 * Math.min(1, Math.max(0, t));
}

// Coût brut, avant le bonus de rôle. Unités du ResourceManager
// (budget = k€ / 100, puissance = W / 10).
export function coutSelections(chapter, selections = {}, repartitions = {}) {
  const c = chapter?.contraintes || {};
  const out = {
    masse: 0,
    budget: 0,
    puissance: 0,
    donnees: 0,
    communications: 0,
    duree: 0
  };
  for (const [famille, id] of Object.entries(selections)) {
    if (typeof id !== 'string') continue;
    const comp = trouverPiece(id);
    if (!comp) continue;
    const eff = pieceEffective(chapter, comp);
    const facteur = facteursRepartition(famille, repartitions[famille]);
    out.masse += eff.masse * facteur.masse;
    out.budget += eff.coutK / 100;
    out.puissance += (eff.puissanceW / 10) * facteur.puissance;
  }
  const lien = partLien(selections.communications);
  if (lien) out.communications += lien * (c.communications || 0);
  const partDonnees = PART_DONNEES[selections.instrument] || 0;
  if (partDonnees) out.donnees += partDonnees * (c.donnees || 0);
  return out;
}

const CLES = ['masse', 'budget', 'puissance', 'donnees', 'communications', 'duree'];

export function coutNet(resources, chapter, selections, repartitions) {
  const brut = coutSelections(chapter, selections, repartitions);
  const net = {};
  for (const key of CLES) {
    const relief = resources?.relief?.[key] ?? 1;
    net[key] = (brut[key] || 0) * relief;
  }
  return net;
}

// Remplace le coût déjà imputé par celui de la nouvelle sélection.
export function appliquerCoutAtelier(resources, chapter, charged, selections, repartitions) {
  const net = coutNet(resources, chapter, selections, repartitions);
  for (const key of CLES) {
    const prev = charged?.[key] || 0;
    resources.used[key] = Math.max(0, (resources.used[key] || 0) - prev + net[key]);
  }
  resources.canal?.usage({ ...resources.used });
  return net;
}
