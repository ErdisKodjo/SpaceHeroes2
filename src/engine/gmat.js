// Normalise une table GMAT (src/data/gmat) en profil d'orbite unique.
// La 3D, les opérations et le bilan lisent ce profil, pas un fichier en dur.

import orbiteBasse from '../data/gmat/orbite_basse.json';
import orbiteHaute from '../data/gmat/orbite_haute.json';
import orbitePolaire from '../data/gmat/orbite_polaire.json';
import orbiteHelio from '../data/gmat/orbite_heliosynchrone.json';
import orbiteGeo from '../data/gmat/orbite_geostationnaire.json';
import transfertLune from '../data/gmat/transfert_lune.json';
import orbiteMars from '../data/gmat/orbite_mars.json';
import pointLagrange from '../data/gmat/point_lagrange.json';

const TABLES = {
  orbite_basse: orbiteBasse,
  orbite_haute: orbiteHaute,
  orbite_polaire: orbitePolaire,
  orbite_heliosynchrone: orbiteHelio,
  orbite_geostationnaire: orbiteGeo,
  transfert_lune: transfertLune,
  orbite_mars: orbiteMars,
  point_lagrange: pointLagrange
};

const EARTH_R = 6378;
const EARTH_MU = 398600;
const C_KMS = 299792;

const LABELS = {
  orbite_basse: ['Orbite basse terrestre', 'Low Earth orbit'],
  orbite_polaire: ['Orbite polaire', 'Polar orbit'],
  orbite_heliosynchrone: ['Orbite héliosynchrone', 'Sun-synchronous orbit'],
  orbite_geostationnaire: ['Orbite géostationnaire', 'Geostationary orbit'],
  orbite_haute: ['Orbite haute inclinée', 'Inclined high orbit']
};

function muDepuisPeriode(aKm, periodMin) {
  const t = periodMin * 60;
  return (4 * Math.PI * Math.PI * aKm * aKm * aKm) / (t * t);
}

function milliers(n, sep) {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, sep);
}

function virgule(n) {
  return String(n).replace('.', ',');
}

function lumiereMs(distanceKm) {
  return (2 * distanceKm / C_KMS) * 1000;
}

function profil(fields) {
  const body = fields.bodyRadiusKm;
  const alt = fields.altitudeKm;
  const e = fields.eccentricity || 0;
  const aKm = fields.sceneA * body;
  return {
    ...fields,
    eccentricity: e,
    sceneA: fields.sceneA,
    periodMin: fields.periodMin,
    periodS: fields.periodMin * 60,
    circularSpeedKms: Math.sqrt(fields.mu / (body + alt)),
    periapsisScene: fields.sceneA * (1 - e),
    apoapsisScene: fields.sceneA * (1 + e),
    aKm
  };
}

export function resolveGmat(table) {
  const p = table?.parametres || {};
  const r = table?.resultats || {};
  const type = table?.type || 'orbite_basse';

  if (type === 'transfert_lune') {
    const body = p.rayonTerreKm || EARTH_R;
    const mu = p.muTerre || EARTH_MU;
    const alt = p.altitudeParkingKm || 300;
    const rp = body + alt;
    const ra = p.distanceLuneKm || rp;
    const aKm = (rp + ra) / 2;
    const e = (ra - rp) / (ra + rp);
    const jours = r.dureeTransfertJours || 5;
    const periodMin = jours * 2 * 24 * 60;
    const approche = Number(r.approcheMinKm);
    const plusPres = Number.isFinite(approche)
      ? ` · plus près ${milliers(approche, ' ')} km · pas une capture`
      : '';
    const closest = Number.isFinite(approche)
      ? ` · closest ${milliers(approche, ',')} km · not a capture`
      : '';
    const dv = Number(r.deltaVInjectionKmS);
    const injection = Number.isFinite(dv) ? ` · injection ${virgule(dv)} km/s` : '';
    const injectionEn = Number.isFinite(dv) ? ` · injection ${dv} km/s` : '';
    return profil({
      type,
      labelFr: 'Transfert Terre-Lune',
      labelEn: 'Earth–Moon transfer',
      captionFr: `Parking ${alt} km · Lune en ${jours} j${injection}${plusPres}`,
      captionEn: `Parking orbit ${alt} km · Moon in ${jours} d${injectionEn}${closest}`,
      altitudeKm: alt,
      bodyRadiusKm: body,
      mu,
      eccentricity: e,
      inclinationDeg: p.inclinaisonDeg,
      periodMin,
      sceneA: aKm / body,
      delayMs: (r.delaiRadioAllerRetourSecondes || 0) * 1000,
      contactMin: r.dureeContactMoyenneMinutes ?? null
    });
  }

  if (type === 'point_lagrange_l1' || type === 'point_lagrange') {
    const body = EARTH_R;
    const dist = p.distanceTerreKm || 1_500_000;
    const jours = r.periodeHaloJours || 178;
    const periodMin = jours * 24 * 60;
    const aKm = dist;
    const millions = Math.round((dist / 1e6) * 10) / 10;
    const corrections = Number(r.correctionsParAn);
    const hypothese = Number.isFinite(corrections)
      ? ` · ${corrections} corrections/an, hypothèse`
      : '';
    const hypothesis = Number.isFinite(corrections)
      ? ` · ${corrections} corrections/year, hypothesis`
      : '';
    return profil({
      type,
      labelFr: 'Halo autour de L1',
      labelEn: 'Halo about L1',
      captionFr: `L1 · ${millions} million km · halo ${jours} j${hypothese}`,
      captionEn: `L1 · ${millions} million km · halo ${jours} d${hypothesis}`,
      altitudeKm: dist - body,
      bodyRadiusKm: body,
      mu: muDepuisPeriode(aKm, periodMin),
      eccentricity: 0,
      inclinationDeg: p.inclinaisonDeg,
      periodMin,
      sceneA: aKm / body,
      delayMs: (r.delaiRadioSecondes || 0) * 1000,
      contactMin: r.dureeContactMoyenneMinutes ?? null
    });
  }

  if (type === 'orbite_mars') {
    const body = p.rayonMarsKm || 3396;
    const mu = p.muMars || 42828;
    const alt = p.altitudeKm || 300;
    const periodMin = r.periodeMinutes;
    const fenetre = r.departHohmann === 'debut decembre 2026'
      ? ' · départ début décembre 2026'
      : '';
    const windowEn = r.departHohmann === 'debut decembre 2026'
      ? ' · departure early December 2026'
      : '';
    return profil({
      type,
      labelFr: 'Orbite basse martienne',
      labelEn: 'Low Mars orbit',
      captionFr: `Altitude ${alt} km · un tour en ${periodMin} min${fenetre}`,
      captionEn: `Altitude ${alt} km · one revolution in ${periodMin} min${windowEn}`,
      altitudeKm: alt,
      bodyRadiusKm: body,
      mu,
      eccentricity: p.excentricite || 0,
      inclinationDeg: p.inclinaisonDeg,
      periodMin,
      sceneA: (body + alt) / body,
      delayMs: (r.delaiRadioMinutes || 0) * 60 * 1000,
      contactMin: r.dureeContactMoyenneMinutes ?? null
    });
  }

  const body = p.rayonTerreKm || EARTH_R;
  const mu = p.muTerre || EARTH_MU;
  const alt = p.altitudeKm || 550;
  const periodMin = r.periodeMinutes;
  const [labelFr, labelEn] = LABELS[type] || LABELS.orbite_basse;
  return profil({
    type,
    labelFr,
    labelEn,
    captionFr: `Altitude ${alt} km · un tour en ${periodMin} min`,
    captionEn: `Altitude ${alt} km · one revolution in ${periodMin} min`,
    altitudeKm: alt,
    bodyRadiusKm: body,
    mu,
    eccentricity: p.excentricite || 0,
    inclinationDeg: p.inclinaisonDeg,
    periodMin,
    sceneA: (body + alt) / body,
    delayMs: lumiereMs(alt),
    contactMin: r.dureeContactMoyenneMinutes ?? null
  });
}

export function gmatPour(id) {
  return resolveGmat(TABLES[id] || TABLES.orbite_basse);
}

export function tableGmat(id) {
  return TABLES[id] || null;
}
