// Plan d'opérations lu depuis le chapitre.
// La station utile, l'ordre de déploiement et l'aléa ne sont pas les mêmes
// en orbite basse, en transfert ou au point L1.

export const STATIONS = [
  { id: 'kourou', nom: 'Kourou (ESA)', lat: 5.2, lon: -52.8 },
  { id: 'svalbard', nom: 'Svalbard (KSAT)', lat: 78.2, lon: 15.4 },
  { id: 'madrid', nom: 'Madrid (DSN)', lat: 40.4, lon: -4.2 },
  { id: 'goldstone', nom: 'Goldstone (DSN)', lat: 35.4, lon: -116.9 },
  { id: 'canberra', nom: 'Canberra (DSN)', lat: -35.4, lon: 149.0 }
];

const STATION_CORRECTE = {
  leo_cubesat: 'kourou',
  meteo_sso: 'svalbard',
  lune: 'goldstone',
  mars: 'canberra',
  l1: 'madrid',
  polaire: 'svalbard',
  haute: 'canberra',
  geo: 'canberra'
};

const SEQUENCE_PROCHE = [
  { id: 'comm', label: 'Antenne comm', labelEn: 'Comm antenna', iconName: 'antenna' },
  { id: 'energie', label: 'Panneaux solaires', labelEn: 'Solar arrays', iconName: 'solar' },
  { id: 'instrument', label: 'Instrument science', labelEn: 'Science instrument', iconName: 'microscope' }
];

const SEQUENCE_LOINTAIN = [
  { id: 'propulsion', label: 'Propulsion', labelEn: 'Propulsion', iconName: 'rocket' },
  { id: 'pointage', label: 'Pointage', labelEn: 'Pointing', iconName: 'compass' },
  { id: 'instrument', label: 'Instrument science', labelEn: 'Science instrument', iconName: 'microscope' }
];

const OPTIONS = {
  fenetre_decalee: [
    {
      label: 'Recaler le calendrier et garder les essais',
      labelEn: 'Shift the calendar and keep the tests',
      correct: true,
      explication: 'Le report de deux semaines est accepté. La marge de durée encaisse le décalage.',
      explicationEn: 'The two-week slip is accepted. The duration margin absorbs it.'
    },
    {
      label: 'Tenir l\'ancienne date et sauter des essais',
      labelEn: 'Hold the old date and skip tests',
      correct: false,
      explication: 'La date ne se tient pas, et les essais sautés coûtent encore de la marge.',
      explicationEn: 'The date will not hold, and the skipped tests cost still more margin.'
    },
    {
      label: 'Ignorer le message du pas de tir',
      labelEn: 'Ignore the pad message',
      correct: false,
      explication: 'La fenêtre est déjà fermée. L\'équipe perd le créneau et du temps de reprise.',
      explicationEn: 'The window is already closed. The team loses the slot and the recovery time.'
    }
  ],
  couverture_nuageuse: [
    {
      label: 'Programmer un passage supplémentaire',
      labelEn: 'Schedule an extra pass',
      correct: true,
      explication: 'Un passage de plus coûte une semaine, et la scène est exploitable.',
      explicationEn: 'One more pass costs a week, and the scene is usable.'
    },
    {
      label: 'Transmettre la scène sous les nuages',
      labelEn: 'Downlink the cloudy scene',
      correct: false,
      explication: 'Le produit nuageux ne répond pas à la question. Il faudra repasser quand même.',
      explicationEn: 'A cloudy product does not answer the question. You still have to pass again.'
    },
    {
      label: 'Changer l\'inclinaison pour éviter la zone',
      labelEn: 'Change inclination to avoid the area',
      correct: false,
      explication: 'Changer d\'inclinaison casse l\'heure solaire. Le coût dépasse un simple passage.',
      explicationEn: 'Changing inclination breaks the solar time. The cost exceeds a single pass.'
    }
  ],
  passage_rate: [
    {
      label: 'Attendre le passage suivant de Svalbard',
      labelEn: 'Wait for the next Svalbard pass',
      correct: true,
      explication: 'Le passage raté coûte la semaine prévue. Le suivant dure encore environ 8 minutes.',
      explicationEn: 'The missed pass costs the planned week. The next one still lasts about 8 minutes.'
    },
    {
      label: 'Forcer un contact bas vers Kourou',
      labelEn: 'Force a low pass over Kourou',
      correct: false,
      explication: 'Kourou voit peu de passages, et sous le masque le contact ne tient pas.',
      explicationEn: 'Kourou sees few passes, and below the mask the contact does not hold.'
    },
    {
      label: 'Sauter la mesure de ce jour',
      labelEn: 'Skip this day\'s measurement',
      correct: false,
      explication: 'La glace du jour n\'est pas enregistrée. Il faudra quand même un passage.',
      explicationEn: 'That day\'s ice is not recorded. A pass is still required.'
    }
  ],
  station_aveugle: [
    {
      label: 'Basculer le contact vers Canberra',
      labelEn: 'Move the contact to Canberra',
      correct: true,
      explication: 'Pour cet état de départ, Canberra tient 790 minutes. La semaine prévue couvre le changement.',
      explicationEn: 'For this departure state, Canberra holds 790 minutes. The planned week covers the change.'
    },
    {
      label: 'Garder Kourou',
      labelEn: 'Keep Kourou',
      correct: false,
      explication: 'Kourou ne voit pas ce plan. Le créneau reste vide.',
      explicationEn: 'Kourou does not see this plane. The slot stays empty.'
    },
    {
      label: 'Attendre Goldstone',
      labelEn: 'Wait for Goldstone',
      correct: false,
      explication: 'Goldstone non plus ne voit pas ce plan. Ce n\'est pas vrai de toute orbite haute.',
      explicationEn: 'Goldstone does not see this plane either. That is not true of every high orbit.'
    }
  ],
  longitude_autre: [
    {
      label: 'Basculer le contact vers Canberra',
      labelEn: 'Move the contact to Canberra',
      correct: true,
      explication: 'Pour cette longitude de départ, Canberra tient 1 440 minutes, sans coupure. La semaine prévue couvre le changement.',
      explicationEn: 'For this departure longitude, Canberra holds 1,440 minutes, without a break. The planned week covers the change.'
    },
    {
      label: 'Garder Svalbard',
      labelEn: 'Keep Svalbard',
      correct: false,
      explication: 'Svalbard ne voit pas cette longitude. Le créneau reste vide.',
      explicationEn: 'Svalbard does not see this longitude. The slot stays empty.'
    },
    {
      label: 'Attendre Madrid',
      labelEn: 'Wait for Madrid',
      correct: false,
      explication: 'Madrid ne voit pas cette longitude non plus. Une autre longitude géostationnaire changerait la station.',
      explicationEn: 'Madrid does not see this longitude either. Another geostationary longitude would change the station.'
    }
  ],
  correction_trajectoire: [
    {
      label: 'Exécuter la correction maintenant',
      labelEn: 'Burn the correction now',
      correct: true,
      explication: 'La correction de milieu de transfert consomme la marge prévue, et la Lune reste visée.',
      explicationEn: 'The mid-course burn spends the planned margin, and the Moon stays the target.'
    },
    {
      label: 'Attendre la sphère d\'influence lunaire',
      labelEn: 'Wait for the lunar sphere of influence',
      correct: false,
      explication: 'Trop tard : l\'erreur grossit pendant les trois secondes de délai, et au-delà.',
      explicationEn: 'Too late: the error grows through the three-second delay, and beyond.'
    },
    {
      label: 'Annuler le freinage d\'arrivée',
      labelEn: 'Cancel the arrival burn',
      correct: false,
      explication: 'Sans freinage, l\'orbiteur ne se capture pas. La mission de cartographie est perdue.',
      explicationEn: 'Without the braking burn the orbiter is not captured. The mapping mission is lost.'
    }
  ],
  fenetre_etroite: [
    {
      label: 'Partir dans la fenêtre actuelle',
      labelEn: 'Depart in the current window',
      correct: true,
      explication: 'La fenêtre se resserre, mais partir maintenant évite d\'attendre la prochaine opposition.',
      explicationEn: 'The window is tightening, but leaving now avoids waiting for the next opposition.'
    },
    {
      label: 'Attendre la prochaine opposition',
      labelEn: 'Wait for the next opposition',
      correct: false,
      explication: 'Vingt-six mois de plus. La marge calendaire ne les contient pas.',
      explicationEn: 'Twenty-six more months. The calendar margin cannot hold them.'
    },
    {
      label: 'Allonger le transit pour économiser les ergols',
      labelEn: 'Stretch the cruise to save propellant',
      correct: false,
      explication: 'Un transit plus long rate la fenêtre d\'insertion. Le délai radio ne rattrape pas ça.',
      explicationEn: 'A longer cruise misses the insertion window. The radio delay cannot recover that.'
    }
  ],
  perturbation_halo: [
    {
      label: 'Correction anticipée sur le halo',
      labelEn: 'Early halo correction',
      correct: true,
      explication: 'La correction part avant que le halo ne dérive. Une semaine de marge y passe.',
      explicationEn: 'The burn goes before the halo drifts. One week of margin pays for it.'
    },
    {
      label: 'Attendre que le point se referme',
      labelEn: 'Wait for the point to close again',
      correct: false,
      explication: 'L1 ne retient pas le satellite. Attendre éloigne encore la trajectoire.',
      explicationEn: 'L1 does not hold the spacecraft. Waiting pulls the trajectory farther out.'
    },
    {
      label: 'Couper la propulsion pour économiser',
      labelEn: 'Cut propulsion to save propellant',
      correct: false,
      explication: 'Sans poussée, le halo se défait. L\'alerte solaire s\'interrompt.',
      explicationEn: 'Without thrust the halo comes apart. The solar alert stops.'
    }
  ]
};

const LOINTAINS = new Set(['lune', 'mars', 'l1']);

export function planOperations(chapter) {
  const profil = chapter?.profil || 'leo_cubesat';
  const lointain = LOINTAINS.has(profil);
  const brut = chapter?.evenementAleatoire || null;
  return {
    profil,
    lointain,
    stationCorrecte: STATION_CORRECTE[profil] || 'kourou',
    stations: STATIONS,
    sequence: lointain ? SEQUENCE_LOINTAIN : SEQUENCE_PROCHE,
    evenement: brut
      ? {
        id: brut.id,
        texte: brut.texte,
        effet: brut.effet || {},
        iconName: lointain ? 'rocket' : 'warning',
        options: OPTIONS[brut.id] || []
      }
      : null
  };
}

export function appliquerEffet(resources, effet, { supplement = 0 } = {}) {
  if (!resources) return;
  if (effet) {
    for (const [cle, delta] of Object.entries(effet)) {
      if (resources.max[cle] === undefined) continue;
      if (delta < 0) resources.consume(cle, -delta);
      else if (delta > 0) {
        if (resources.canal) resources.canal.plafond(cle, delta);
        else resources.max[cle] += delta;
      }
    }
  }
  if (supplement > 0) resources.consume('duree', supplement);
}
