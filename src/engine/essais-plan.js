// Réglage du banc d'essais à partir de l'atelier et du chapitre.
// La fiabilité qui en sort est celle que le CML et le bilan lisent déjà.

const VIBRATIONS = {
  chassis_titane: {
    bas: 22, haut: 78, impulsion: 18, chute: 14,
    noteFr: 'Le titane est léger et tenu. La zone verte est large.',
    noteEn: 'Titanium is light and strong. The green band is wide.'
  },
  chassis_alLi: {
    bas: 28, haut: 72, impulsion: 20, chute: 16,
    noteFr: 'L\'alliage Al-Li allège le châssis sans le fragiliser.',
    noteEn: 'The Al-Li alloy lightens the bus without making it fragile.'
  },
  chassis_alu: {
    bas: 42, haut: 58, impulsion: 14, chute: 20,
    noteFr: 'L\'aluminium 6061 est le plus lourd. La zone verte se resserre.',
    noteEn: '6061 aluminium is the heaviest. The green band tightens.'
  },
  chassis_cfrp: {
    bas: 40, haut: 60, impulsion: 16, chute: 22,
    noteFr: 'Le carbone est léger, et fragile aux chocs. La zone verte se resserre.',
    noteEn: 'Carbon is light, and brittle under shock. The green band tightens.'
  }
};

const SANS_CHASSIS = {
  bas: 45, haut: 55, impulsion: 12, chute: 24,
  noteFr: 'Aucun châssis porteur n\'est monté. La zone verte est étroite.',
  noteEn: 'No load-bearing bus is fitted. The green band is narrow.'
};

export function reglageVibrations(structureId, repartition) {
  const base = { ...(VIBRATIONS[structureId] || SANS_CHASSIS) };
  const resistance = repartition?.resistance ?? 3;
  const delta = (resistance - 3) * 3;
  base.bas = Math.max(8, base.bas - delta);
  base.haut = Math.min(92, base.haut + delta);
  if (base.haut - base.bas < 8) {
    const mid = (base.bas + base.haut) / 2;
    base.bas = mid - 4;
    base.haut = mid + 4;
  }
  return base;
}

// Orbite basse, météo et Lune : le vide thermique domine.
// Mars et L1 : le rayonnement domine.
export function besoinIsolation(profil) {
  if (profil === 'mars' || profil === 'l1') return 'blindage_rad';
  return 'mli';
}

export function optionsThermiques(profil, structureId) {
  const besoin = besoinIsolation(profil);
  const monteAutre = (structureId === 'mli' || structureId === 'blindage_rad') && structureId !== besoin;
  const options = [
    {
      id: 'mli',
      label: 'Couverture MLI multi-couches',
      labelEn: 'Multi-layer MLI blanket',
      correct: besoin === 'mli' && !monteAutre,
      explication: besoin === 'mli'
        ? (monteAutre
          ? 'Le MLI est le bon choix pour cette orbite, mais le blindage monté à l\'atelier ne protège pas du thermique.'
          : 'Correct. Près de la Terre, le MLI tient les cycles de −120 °C à +120 °C.')
        : 'Le MLI tient le thermique, pas le rayonnement de cette trajectoire.',
      explicationEn: besoin === 'mli'
        ? (monteAutre
          ? 'MLI is the right choice for this orbit, but the shielding fitted in the workshop does not cover the thermal load.'
          : 'Correct. Near Earth, MLI holds the cycles from −120 °C to +120 °C.')
        : 'MLI handles heat, not the radiation on this trajectory.'
    },
    {
      id: 'blindage_rad',
      label: 'Blindage anti-radiations',
      labelEn: 'Radiation shielding',
      correct: besoin === 'blindage_rad' && !monteAutre,
      explication: besoin === 'blindage_rad'
        ? (monteAutre
          ? 'Le blindage est nécessaire ici, mais le MLI monté à l\'atelier ne couvre pas le rayonnement.'
          : 'Correct. Loin de la magnétosphère, le blindage protège l\'électronique.')
        : 'Le blindage ne remplace pas l\'isolation thermique en orbite terrestre.',
      explicationEn: besoin === 'blindage_rad'
        ? (monteAutre
          ? 'Shielding is required here, but the MLI fitted in the workshop does not cover the radiation.'
          : 'Correct. Outside the magnetosphere, shielding protects the electronics.')
        : 'Shielding does not replace thermal insulation in Earth orbit.'
    },
    {
      id: 'mousse',
      label: 'Mousse polyuréthane',
      labelEn: 'Polyurethane foam',
      correct: false,
      explication: 'Le polyuréthane dégazze dans le vide et se dégrade sous les UV.',
      explicationEn: 'Polyurethane outgasses in vacuum and breaks down under UV.'
    }
  ];
  return { besoin, monteAutre, options };
}

export function resultatElectrique(choixCorrect, resources) {
  const depasse = Boolean(resources?.isOverLimit?.('puissance'));
  return {
    depasse,
    succes: Boolean(choixCorrect) && !depasse
  };
}
