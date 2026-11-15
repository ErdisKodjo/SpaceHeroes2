// Évaluation de fin de mission (Sprint 4).
// Transforme l'état réel de la partie — ressources, CML, atelier, essais, opérations —
// en score, décisions, contre-factuels et comparaison avec une mission NASA.

import { computeScore, medaille, genererRapport } from './score.js';
import { RESOURCE_KEYS } from './resources.js';
import { chapitreSuivant } from '../data/catalogue.js';
import missionsReelles from '../data/missions_reelles.json';
import { t } from '../i18n.js';
import {
  altThen, badgeCopy, chapterText, compDesc, compName, decisionCopy, eventText
} from '../i18n/content.js';

import moteursData from '../data/ateliers/moteurs.json';
import structureData from '../data/ateliers/structure.json';
import energieData from '../data/ateliers/energie.json';
import commsData from '../data/ateliers/communications.json';
import instrumentData from '../data/ateliers/instrument.json';

import orbiteBasse from '../data/gmat/orbite_basse.json';
import orbiteHaute from '../data/gmat/orbite_haute.json';
import orbitePolaire from '../data/gmat/orbite_polaire.json';
import orbiteHelio from '../data/gmat/orbite_heliosynchrone.json';
import orbiteGeo from '../data/gmat/orbite_geostationnaire.json';
import transfertLune from '../data/gmat/transfert_lune.json';
import orbiteMars from '../data/gmat/orbite_mars.json';
import pointLagrange from '../data/gmat/point_lagrange.json';

const GMAT = {
  orbite_basse: orbiteBasse,
  orbite_haute: orbiteHaute,
  orbite_polaire: orbitePolaire,
  orbite_heliosynchrone: orbiteHelio,
  orbite_geostationnaire: orbiteGeo,
  transfert_lune: transfertLune,
  orbite_mars: orbiteMars,
  point_lagrange: pointLagrange
};

const CATALOGUE = [moteursData, structureData, energieData, commsData, instrumentData];

const NOMS_COURTS = {
  chimique: 'Moteur chimique',
  cryogenique: 'Moteur cryogénique',
  ionique: 'Moteur ionique'
};

const SCIENCE = {
  capteur_temp: 0.45,
  camera_5mp: 0.7,
  magnetometre: 0.72,
  spectrometre_uv: 0.92,
  radar_altimetre: 0.88
};

// Ce qui se serait passé avec l'autre option de la même famille.
const CONTREFACTURES = {
  chassis_alu: { autreId: 'chassis_cfrp', texte: 'Un châssis CFRP aurait allégé le satellite d\'environ 150 g, pour un budget plus élevé et une mise au point plus longue.' },
  chassis_alLi: { autreId: 'chassis_alu', texte: 'L\'aluminium standard aurait coûté moins cher, avec une masse un peu plus élevée.' },
  chassis_titane: { autreId: 'chassis_cfrp', texte: 'Le carbone aurait encore réduit la masse. Le titane reste le compromis tenue mécanique et masse.' },
  chassis_cfrp: { autreId: 'chassis_alu', texte: 'L\'aluminium 6061 aurait été moins cher et plus simple à usiner, avec une marge de masse plus juste.' },
  mli: { autreId: 'blindage_rad', texte: 'Le MLI protège du thermique, pas des radiations. Un blindage devient nécessaire dès qu\'on quitte la magnétosphère.' },
  blindage_rad: { autreId: 'mli', texte: 'Sans le blindage, la masse aurait baissé, mais l\'électronique aurait vieilli plus vite hors de la magnétosphère.' },
  panneaux_gaas_1u: { autreId: 'rtg', texte: 'Les panneaux GaAs suffisent près de la Terre. Un RTG aurait garanti des watts constants loin du Soleil, pour 0,5 kg et un coût bien supérieur.' },
  panneaux_si_2u: { autreId: 'panneaux_gaas_1u', texte: 'Le silicium produit plus de watts ici, mais il est plus lourd. Le GaAs aurait mieux tenu une contrainte de masse serrée.' },
  batterie_liion: { autreId: 'panneaux_gaas_1u', texte: 'La batterie ne produit rien : sans générateur, l\'éclipse vide les réserves en quelques orbites.' },
  rtg: { autreId: 'panneaux_gaas_1u', texte: 'Le RTG est constant et lourd. Près du Soleil, des panneaux GaAs auraient fourni la puissance pour une fraction de la masse.' },
  antenne_uhf: { autreId: 'antenne_xband', texte: 'L\'UHF est légère et tolérante, mais le débit plafonne. La bande X aurait renvoyé les images sans compression agressive.' },
  antenne_xband: { autreId: 'antenne_uhf', texte: 'La bande X demande plus de puissance et de pointage. L\'UHF aurait été plus indulgente pour un premier contact.' },
  laser_optique: { autreId: 'antenne_xband', texte: 'Le laser offre un débit énorme si le pointage est très fin. La bande X aurait mieux supporté une couverture nuageuse au sol.' },
  capteur_temp: { autreId: 'spectrometre_uv', texte: 'Le capteur répond à une question simple. Un spectromètre aurait ouvert une question de composition, pour beaucoup plus de masse et de puissance.' },
  camera_5mp: { autreId: 'spectrometre_uv', texte: 'La caméra documente une scène. Un spectromètre aurait mesuré une composition, pas seulement une image.' },
  spectrometre_uv: { autreId: 'camera_5mp', texte: 'Le spectromètre est précis et gourmand. Une caméra aurait livré un résultat plus tôt, avec moins de puissance.' },
  magnetometre: { autreId: 'capteur_temp', texte: 'Le magnétomètre voit le champ. Un capteur thermique n\'aurait rien dit du plasma autour du satellite.' },
  radar_altimetre: { autreId: 'camera_5mp', texte: 'Le radar perce les nuages et mesure un relief, au prix de 8 W. Une caméra serait restée aveugle sous la couverture nuageuse.' },
  chimique: { autreId: 'ionique', texte: 'Le chimique donne une poussée immédiate. Un moteur ionique aurait économisé les ergols, mais la spirale aurait pris des mois.' },
  cryogenique: { autreId: 'chimique', texte: 'Le cryogénique est efficace, et les ergols très froids compliquent le stockage. Un chimique stockable aurait été plus simple à opérer.' },
  ionique: { autreId: 'chimique', texte: 'L\'ionique trace une spirale lente. Un chimique aurait raccourci le transit, en emportant beaucoup plus d\'ergols.' }
};

const FAMILLES_PRIORITAIRES = ['instrument', 'energie', 'communications', 'structure', 'moteurs'];

const LIBELLES_FAMILLES = {
  instrument: 'Instrument',
  energie: 'Énergie',
  communications: 'Communications',
  structure: 'Structure',
  moteurs: 'Moteur'
};

const LIBELLES_RESSOURCES = {
  budget: 'Budget',
  masse: 'Masse',
  puissance: 'Puissance',
  donnees: 'Données',
  communications: 'Liaisons',
  duree: 'Durée'
};

const RES_EN = {
  budget: 'Budget',
  masse: 'Mass',
  puissance: 'Power',
  donnees: 'Data',
  communications: 'Links',
  duree: 'Duration'
};

const FAM_EN = {
  instrument: 'Instrument',
  energie: 'Power',
  communications: 'Communications',
  structure: 'Structure',
  moteurs: 'Propulsion'
};

function resourceLabel(key) {
  return t(LIBELLES_RESSOURCES[key] || key, RES_EN[key] || key);
}

function familleLabel(key) {
  return t(LIBELLES_FAMILLES[key] || key, FAM_EN[key] || key);
}

function compDescLocalized(comp) {
  const fr = comp.description || 'Ce choix fixe une partie des marges de la mission.';
  return compDesc(comp.id, fr);
}

const DECISIONS_CHAPITRE = {
  chapitre_01: {
    titre: 'Orbite imposée',
    choix: 'CubeSat en covoiturage, orbite basse',
    consequence: 'La masse reste plafonnée à 4 kg et l\'orbite est celle du passager principal.'
  },
  chapitre_02: {
    titre: 'Heure solaire',
    choix: 'Orbite héliosynchrone, passage vers 10 h 30',
    consequence: 'Deux images de la même région se comparent, parce que la lumière du Soleil est la même.'
  },
  chapitre_03: {
    titre: 'Transfert',
    choix: 'Transfert vers la Lune, délai radio de 3 secondes',
    consequence: 'Les commandes doivent partir avant que la sonde n\'ait déjà bougé.'
  },
  chapitre_04: {
    titre: 'Fenêtre',
    choix: 'Départ dans la fenêtre des 26 mois',
    consequence: 'Rater l\'injection, c\'est attendre la prochaine opposition utile.'
  },
  chapitre_05: {
    titre: 'Halo',
    choix: 'Orbite en halo autour de L1',
    consequence: 'Le point d\'équilibre ne retient pas le satellite : les corrections font partie de la mission.'
  }
};

function clamp01(n) {
  if (Number.isNaN(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

function listeComposants(data) {
  return data.composants ?? data.technologies ?? [];
}

function trouverComposant(id) {
  if (!id) return null;
  for (const data of CATALOGUE) {
    const hit = listeComposants(data).find((c) => (c.id || c.nom) === id);
    if (hit) return { ...hit, id: hit.id || hit.nom, famille: data.nom };
  }
  return null;
}

function nomComposant(comp) {
  if (!comp) return t('Aucun choix', 'No choice');
  return compName(comp.id, NOMS_COURTS[comp.id] || comp.nom);
}

function ligneGmat(chapter) {
  const table = GMAT[chapter.gmat];
  if (!table) return null;
  const r = table.resultats || {};
  if (r.periodeMinutes) return t(`Période ${r.periodeMinutes} min`, `Period ${r.periodeMinutes} min`);
  if (r.dureeTransfertJours) return t(`Transfert ${r.dureeTransfertJours} jours`, `Transfer ${r.dureeTransfertJours} days`);
  if (r.periodeHaloJours) return t(`Halo ${r.periodeHaloJours} jours`, `Halo ${r.periodeHaloJours} days`);
  return null;
}

function efficacite(resources) {
  const ratios = RESOURCE_KEYS.map((key) => {
    const max = resources.max[key];
    if (!max) return 0;
    return resources.used[key] / max;
  });
  const depassements = ratios.filter((r) => r > 1).length;
  const moyen = ratios.reduce((a, r) => a + Math.min(r, 1), 0) / ratios.length;
  // Autour de 65 % d'usage : la mission dépense ses marges sans les brûler.
  const cible = 1 - Math.min(1, Math.abs(moyen - 0.65) / 0.65);
  return clamp01(cible - depassements * 0.25);
}

function valeurScientifique(selections, cml) {
  const instrument = selections?.instrument;
  const base = SCIENCE[instrument] ?? 0.4;
  const niveau = cml ? cml.currentLevel() / 4 : 0;
  return clamp01(base * 0.75 + niveau * 0.25);
}

function qualite(fiabilite, cml) {
  const essais = fiabilite == null ? 0.5 : clamp01(fiabilite / 100);
  const niveaux = [1, 2, 3, 4].map((n) => (cml ? cml.greenRatio(n) : 0));
  const cmlMoyen = niveaux.reduce((a, r) => a + r, 0) / niveaux.length;
  return clamp01(essais * 0.6 + cmlMoyen * 0.4);
}

function decisionsDepuis(selections) {
  const lignes = [];
  for (const famille of FAMILLES_PRIORITAIRES) {
    const comp = trouverComposant(selections?.[famille]);
    if (!comp) continue;
    const alt = CONTREFACTURES[comp.id];
    const autre = alt ? trouverComposant(alt.autreId) : null;
    lignes.push({
      titre: familleLabel(famille),
      choix: nomComposant(comp),
      consequence: compDescLocalized(comp),
      siTuAvaisChoisi: autre ? nomComposant(autre) : null,
      alors: alt ? altThen(comp.id, alt.texte) : null
    });
  }
  return lignes;
}

function completerDecisions(lignes, chapter) {
  const secours = DECISIONS_CHAPITRE[chapter.id];
  const out = [...lignes];
  if (secours && out.length < 3) {
    out.push({
      titre: decisionCopy(chapter.id, 'titre', secours.titre),
      choix: decisionCopy(chapter.id, 'choix', secours.choix),
      consequence: decisionCopy(chapter.id, 'consequence', secours.consequence),
      siTuAvaisChoisi: null,
      alors: chapter.evenementAleatoire
        ? t(
          `L'imprévu du chapitre (« ${eventText(chapter)} ») aurait pesé de la même façon, quelle que soit la pièce choisie à l'atelier.`,
          `The chapter surprise (“${eventText(chapter)}”) would have weighed the same way, whichever part was chosen in the workshop.`
        )
        : null
    });
  }
  while (out.length < 3) {
    out.push({
      titre: t('Marge', 'Margin'),
      choix: t('Poursuite avec les marges restantes', 'Continue with the remaining margins'),
      consequence: t(
        'Sans choix d\'atelier enregistré, le bilan s\'appuie sur les ressources et les opérations.',
        'With no workshop choice saved, the debrief rests on resources and operations.'
      ),
      siTuAvaisChoisi: null,
      alors: null
    });
  }
  return out.slice(0, 3);
}

function badgesPour({ chapter, resources, cml, fiabilite, scoreOps }) {
  const masse = resources.max.masse ? resources.used.masse / resources.max.masse : 0;
  const budget = resources.ratio('budget');
  const polaire = chapter.profil === 'meteo_sso';
  return [
    {
      id: 'econome',
      nom: badgeCopy('econome', 'nom', 'Économe spatial'),
      obtenu: masse > 0 && masse < 0.6,
      texte: badgeCopy('econome', 'texte', 'Masse utilisée sous 60 % de la limite.')
    },
    {
      id: 'scientifique',
      nom: badgeCopy('scientifique', 'nom', 'Scientifique rigoureux'),
      obtenu: Boolean(cml?.isLevelValidated(4)),
      texte: badgeCopy('scientifique', 'texte', 'Niveau CML 4 validé.')
    },
    {
      id: 'polaire',
      nom: badgeCopy('polaire', 'nom', 'Maître de l\'orbite polaire'),
      obtenu: polaire && budget < 0.85 && budget >= 0,
      texte: badgeCopy('polaire', 'texte', 'Orbite héliosynchrone, budget tenu.')
    },
    {
      id: 'banc',
      nom: badgeCopy('banc', 'nom', 'Banc d\'essai'),
      obtenu: (fiabilite ?? 0) >= 80,
      texte: badgeCopy('banc', 'texte', 'Fiabilité des essais d\'au moins 80 %.')
    },
    {
      id: 'contact',
      nom: badgeCopy('contact', 'nom', 'Contact établi'),
      obtenu: (scoreOps ?? 0) >= 75,
      texte: badgeCopy('contact', 'texte', 'Opérations menées avec un score d\'au moins 75.')
    },
    {
      id: 'signal',
      nom: badgeCopy('signal', 'nom', 'Premier signal'),
      obtenu: chapter.id === 'chapitre_01',
      texte: badgeCopy('signal', 'texte', 'Première mission menée jusqu\'au bilan.')
    }
  ];
}

function jetonsPour(score) {
  if (score >= 85) return 4;
  if (score >= 70) return 3;
  if (score >= 50) return 2;
  return 1;
}

function astraPour(medal) {
  if (medal === 'or') return 'bilan_or';
  if (medal === 'argent') return 'bilan_argent';
  if (medal === 'bronze') return 'bilan_bronze';
  return 'bilan_aucun';
}

function missionNasa(chapter, score) {
  const profil = chapter.profil || 'leo_cubesat';
  const liste = missionsReelles.filter((m) => m.profil === profil);
  const reference = liste.find((m) => m.reference) || liste[0] || null;
  const proches = liste.filter((m) => m !== reference).slice(0, 2);
  return {
    reference,
    proches,
    equivalence: score,
    phrase: reference
      ? t(
        `Ton score équivaut à ${score} % de la mission ${reference.nom}.`,
        `Your score matches ${score}% of the ${reference.nom} mission.`
      )
      : t('Aucune mission de référence pour ce profil.', 'No reference mission for this profile.')
  };
}

function partsAffichees(ratios, score) {
  const poids = [
    [t('Objectifs', 'Objectives'), 35],
    [t('Science', 'Science'), 20],
    [t('Ressources', 'Resources'), 20],
    [t('Décisions', 'Decisions'), 15],
    [t('Délais', 'Schedule'), 10]
  ];
  const pts = ratios.map((ratio, i) => Math.round(ratio * poids[i][1]));
  const drift = score - pts.reduce((a, b) => a + b, 0);
  pts[0] += drift;
  return poids.map(([label, max], i) => ({ label, points: pts[i], max }));
}

export function evaluerMission({
  chapter,
  resources,
  cml,
  selections = {},
  fiabilite = null,
  scoreOps = null
}) {
  const objectifsReussis = scoreOps == null ? 0.55 : clamp01(scoreOps / 100);
  const valeur = valeurScientifique(selections, cml);
  const ressources = efficacite(resources);
  const decisionsQ = qualite(fiabilite, cml);
  const delaisRespectes = resources.remaining('duree') >= 0 ? 1 : 0.35;

  const ratios = [objectifsReussis, valeur, ressources, decisionsQ, delaisRespectes];
  const score = computeScore({
    objectifsReussis,
    valeurScientifique: valeur,
    efficaciteRessources: ressources,
    qualiteDecisions: decisionsQ,
    delaisRespectes
  });
  const medal = medaille(score);
  const decisions = completerDecisions(decisionsDepuis(selections), chapter);
  const nasa = missionNasa(chapter, score);

  const rapport = genererRapport({
    chapterId: chapter.id,
    score,
    resourcesSnapshot: resources.snapshot(),
    decisionsCles: decisions.map((d) => d.choix),
    missionsReellesProches: [nasa.reference, ...nasa.proches].filter(Boolean).map((m) => m.nom)
  });

  return {
    ...rapport,
    medaille: medal,
    titre: chapterText(chapter, 'titre'),
    profil: chapter.profil,
    gmatLigne: ligneGmat(chapter),
    parts: partsAffichees(ratios, score),
    ressources: resources.snapshot().map((r) => ({
      ...r,
      label: resourceLabel(r.key)
    })),
    decisions,
    nasa,
    badges: badgesPour({ chapter, resources, cml, fiabilite, scoreOps }),
    jetons: jetonsPour(score),
    astraKey: astraPour(medal),
    chapitreSuivant: chapitreSuivant(chapter.id),
    fiabilite,
    scoreOps
  };
}
