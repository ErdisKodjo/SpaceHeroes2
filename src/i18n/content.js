// Traductions du contenu affiché (chapitres, composants, rôles, CML).
// Le français des fichiers de données reste la source. L'anglais est ici.

import { t } from '../i18n.js';

const CHAPTERS = {
  chapitre_01: { titre: 'The first signal', sousTitre: 'CubeSat' },
  chapitre_02: { titre: 'Eye of the storm', sousTitre: 'Weather' },
  chapitre_03: { titre: 'Return to the Moon', sousTitre: 'Orbiter' },
  chapitre_04: { titre: 'Signal from Mars', sousTitre: 'Probe' },
  chapitre_05: { titre: 'The Guardian', sousTitre: 'L1 point' },
  chapitre_06: { titre: 'Both poles', sousTitre: 'Polar' },
  chapitre_07: { titre: 'One revolution a day', sousTitre: 'High orbit' },
  chapitre_08: { titre: 'The fixed point', sousTitre: 'Geostationary' }
};

const EP_TITLE = {
  briefing: 'Briefing',
  atelier: 'Workshop',
  essais: 'Tests',
  lancement: 'Launch',
  operations: 'Operations',
  bilan: 'Debrief'
};

const EP_TEXT = {
  'chapitre_01.briefing': 'Set the scientific objective, what makes the mission unique, the launch window, the budget class and a first sketch. ASTRA scores CML 1.',
  'chapitre_01.atelier': 'Design the spacecraft across five families — propulsion, structure, power, communications, instrument — within 4 kg.',
  'chapitre_01.essais': 'Three trials: vibration, thermal insulation and electrical compatibility.',
  'chapitre_01.lancement': 'The CubeSat rideshares to low Earth orbit. Start the countdown.',
  'chapitre_01.operations': 'Fly the mission: first radio contact, deployment, then live resource management.',
  'chapitre_01.bilan': 'Mission report: score, medal, resources and three decisions. You can export it as a PDF.',
  'chapitre_02.briefing': 'Set the local solar time of the passes and the instrument that must see through or above the clouds.',
  'chapitre_02.atelier': 'Pick a stable structure, enough power for the imager, and a data rate that empties memory before the next pass.',
  'chapitre_02.essais': 'Polar-launch vibration, fast thermal cycles, electrical compatibility of the imager.',
  'chapitre_02.lancement': 'Injection into an orbit inclined about 98 degrees, at 700 km.',
  'chapitre_02.operations': 'Radio contact, open the instrument over the lit area, downlink the scenes.',
  'chapitre_02.bilan': 'Mission report, score, medal and ASTRA\'s read.',
  'chapitre_03.briefing': 'Choose the science question: relief, ice at the poles, or the gravity field. Transfer and radio delay follow from it.',
  'chapitre_03.atelier': 'Plan transfer propellant, a link that tolerates the delay, and a mapping instrument.',
  'chapitre_03.essais': 'The transfer engine, vacuum thermal control and the electrical chain must hold before injection.',
  'chapitre_03.lancement': 'Parking orbit, then the burn toward the Moon. Perilune at 50 km, then a 0.87 km/s burn: this is a capture.',
  'chapitre_03.operations': 'Commands leave three seconds early. On arrival, the 0.87 km/s burn captures the orbiter at 50 km altitude.',
  'chapitre_03.bilan': 'Mission report, score, medal and ASTRA\'s read.',
  'chapitre_04.briefing': 'The launch window is the first choice. Everything else, power and endurance, must last until arrival.',
  'chapitre_04.atelier': 'Compare solar arrays and an RTG. At several astronomical units the Sun is no longer enough, unlike near Earth.',
  'chapitre_04.essais': 'A cruise of several months does not forgive a fault left on the ground.',
  'chapitre_04.lancement': 'Injection onto the interplanetary trajectory. After the December 2026 window, the next one is 26 months away.',
  'chapitre_04.operations': 'You are no longer live. Each command is a sequence, and the reply takes about forty minutes.',
  'chapitre_04.bilan': 'Mission report, score, medal and ASTRA\'s read.',
  'chapitre_05.briefing': 'Define what the Guardian must see before Earth does: plasma, magnetic field, or an image of the solar disc.',
  'chapitre_05.atelier': 'Outside the magnetosphere, shielding, power and alert data rate matter more than mass alone.',
  'chapitre_05.essais': 'Radiation, thermal and electrical integrity: the halo is not repaired on the ground.',
  'chapitre_05.lancement': 'Insertion toward L1, then the halo. Four corrections a year: an operational hypothesis, not a propagation.',
  'chapitre_05.operations': 'Hold the halo and send the alert for as long as the link to Earth holds.',
  'chapitre_05.bilan': 'Mission report, score, medal and ASTRA\'s read.',
  'chapitre_06.briefing': 'Choose what the polar pass must measure: ice thickness, surface temperature, or both. Solar time is not held.',
  'chapitre_06.atelier': 'Plan an instrument that sees the ice, enough power for polar eclipses, and a link that fits a pass of about 8 minutes.',
  'chapitre_06.essais': 'Launch vibration, thermal cycles of a 94.5-minute orbit, electrical compatibility of the altimeter.',
  'chapitre_06.lancement': 'Injection at 500 km, 90 degrees inclination. One revolution lasts 94.5 minutes.',
  'chapitre_06.operations': 'Svalbard sees about 15 passes a day, 8 minutes on average. The other stations see far fewer.',
  'chapitre_06.bilan': 'Mission report, score, medal and ASTRA\'s read.',
  'chapitre_07.briefing': 'The orbit completes one revolution in 1,436 minutes, half a second longer than the equator. Choose what the long visibility is for: relay, weather, or alert.',
  'chapitre_07.atelier': 'Plan a link that holds for hours, not minutes, and power that crosses the eclipses of a one-day orbit.',
  'chapitre_07.essais': 'Vibration, thermal cycles of a slow orbit, electrical compatibility of the transmitter.',
  'chapitre_07.lancement': 'Injection at 35,786 km, 28 degrees inclination. The satellite draws a figure-eight in the sky. It does not stay over one point.',
  'chapitre_07.operations': 'For this departure state, Canberra has the longest contact. Kourou and Goldstone stay at zero.',
  'chapitre_07.bilan': 'Mission report, score, medal and ASTRA\'s read.',
  'chapitre_08.briefing': 'The orbit completes one revolution in 1,436 minutes. Choose what the fixed point is for: relay, weather, or alert. The departure longitude decides which station sees it.',
  'chapitre_08.atelier': 'Plan a link that does not drop, and power that crosses the eclipse of a one-day orbit.',
  'chapitre_08.essais': 'Vibration, thermal cycles of a one-day orbit, electrical compatibility of the transmitter.',
  'chapitre_08.lancement': 'Injection at 35,786 km. The satellite settles over one region. It does not draw the figure-eight of the inclined orbit.',
  'chapitre_08.operations': 'For this departure state, Canberra holds the satellite for 1,440 minutes. The other four stations in the game stay at zero.',
  'chapitre_08.bilan': 'Mission report, score, medal and ASTRA\'s read.'
};

const EVENTS = {
  chapitre_01: 'The launch window slips by 2 weeks.',
  chapitre_02: 'Persistent cloud hides the priority area. An extra pass is required.',
  chapitre_03: 'A mid-course correction is required. It spends part of the duration margin.',
  chapitre_04: 'The launch window tightens. The team loses four months of calendar margin.',
  chapitre_05: 'A gravitational perturbation shifts the halo. An early correction reduces the duration margin.',
  chapitre_06: 'The planned pass falls below the 5-degree mask. The next one costs a week of margin.',
  chapitre_07: 'The slot was booked at Kourou. This orbital plane does not pass there. Changing station costs a week of margin.',
  chapitre_08: 'The slot was booked at Svalbard. For this departure longitude, only Canberra sees the satellite. Changing station costs the planned week.'
};

const COMP_NOM = {
  chimique: 'Chemical thruster',
  cryogenique: 'Cryogenic thruster',
  ionique: 'Ion thruster',
  chassis_alu: '6061 aluminium bus',
  chassis_alLi: 'Al-Li bus',
  chassis_titane: 'Titanium bus',
  chassis_cfrp: 'CFRP carbon bus',
  mli: 'MLI thermal blanket',
  blindage_rad: 'Radiation shielding',
  panneaux_gaas_1u: 'GaAs solar arrays 1U',
  panneaux_si_2u: 'Si solar arrays 2U',
  batterie_liion: 'Li-ion battery 20 Wh',
  rtg: 'RTG generator',
  antenne_uhf: 'UHF patch antenna',
  antenne_xband: 'X-band antenna',
  laser_optique: 'Optical laser link',
  capteur_temp: 'Temperature sensor',
  camera_5mp: '5 MP visible camera',
  spectrometre_uv: 'UV spectrometer',
  magnetometre: 'Magnetometer',
  radar_altimetre: 'Radar altimeter'
};

const COMP_DESC = {
  chimique: 'Immediate thrust. The right pick for a CubeSat that must reach its orbit quickly.',
  cryogenique: 'More efficient than chemical. Very cold propellants complicate storage.',
  ionique: 'Very thrifty with propellant. The spiral to the target takes months and a lot of electricity.',
  chassis_alu: 'Standard CubeSat bus, easy to machine. 1U end face, 100 × 100 mm, 0.0100 m².',
  chassis_alLi: 'Aluminium-lithium alloy, about 20% lighter than standard aluminium. 1.5U side face, 100 × 170.2 mm, 0.01702 m².',
  chassis_titane: 'Exceptional strength, light, expensive. 2U side face, 100 × 227.0 mm, 0.0227 m².',
  chassis_cfrp: 'The lightest, but fragile to impacts and costly. 3U side face, 100 × 340.5 mm, 0.03405 m². At 1.33 kg, 200 km on day 114.8.',
  mli: 'Multi-layer blanket, essential in the space environment.',
  blindage_rad: 'Protects electronics from the Van Allen belts. SPENVIS models that radiation.',
  panneaux_gaas_1u: 'Gallium-arsenide cells, high efficiency (28%).',
  panneaux_si_2u: 'Silicon, cheaper but heavier.',
  batterie_liion: 'Standard storage, rechargeable in eclipse.',
  rtg: '5 W continuous, independent of the Sun. Suited to Jupiter or L1.',
  antenne_uhf: 'Low rate but reliable, omnidirectional.',
  antenne_xband: 'High rate, needs precise pointing.',
  laser_optique: '1 Gbps, immune to radio interference. Needs precise tracking.',
  capteur_temp: 'Simple and reliable. Measures internal and external temperature.',
  camera_5mp: '5-megapixel colour images of Earth\'s surface.',
  spectrometre_uv: 'Reads atmospheric composition by UV spectroscopy.',
  magnetometre: 'Measures Earth\'s magnetic field.',
  radar_altimetre: 'Measures surface altitude to the centimetre.'
};

const FAMILIES = {
  moteurs: 'Propulsion',
  structure: 'Structure',
  energie: 'Power',
  communications: 'Communications',
  instrument: 'Instrument'
};

const ROLES = {
  directeur: {
    nom: 'Mission director',
    description: 'You arbitrate budgets and strategic priorities. You can impose a veto and release emergency reserves.',
    competence: 'Super-veto (2 tokens) · Emergency budget reserve'
  },
  ingenieur_vehicule: {
    nom: 'Vehicle engineer',
    description: 'You own mass, structure and propulsion. You compute delta-v and optimise every gram.',
    competence: 'Mass/Δv optimisation · Orbital transfer calculator'
  },
  ingenieur_systemes: {
    nom: 'Flight-systems engineer',
    description: 'You run power, thermal and communications. You reboot subsystems after a fault.',
    competence: 'Power routing · Antenna pointing · System reboot (30 s)'
  },
  responsable_science: {
    nom: 'Science lead',
    description: 'You maximise science value. You trigger instruments at the right time and prioritise data.',
    competence: 'Instrument triggering · Data compression · Orbit-correction request'
  }
};

const CML_FR = {
  cml1_objectif: 'Objectif scientifique formulé en une phrase',
  cml1_unique: 'Ce qui rend la mission unique est identifié',
  cml1_fenetre: 'Fenêtre de lancement approximative choisie',
  cml1_classe_budget: 'Classe de budget visée',
  cml1_croquis: 'Premier croquis du vaisseau',
  cml2_exigences: 'Besoins scientifiques détaillés en exigences de premier niveau',
  cml2_ordres_grandeur: 'Masse, puissance et budget estimés en ordre de grandeur',
  cml2_risques: 'Risques majeurs identifiés',
  cml2_lanceur: 'Au moins un lanceur candidat listé',
  cml2_technologies: 'Technologies nécessaires identifiées',
  cml3_comparaison: 'Au moins 2 architectures comparées',
  cml3_effet_options: 'Effet de chaque option sur science, coût et risque documenté',
  cml3_marges: 'Marges techniques estimées pour chaque option',
  cml3_sensibilite: 'Sensibilité du design aux principaux risques évaluée',
  cml3_option_retenue: 'Option retenue justifiée face aux autres',
  cml4_equipements: 'Liste d\'équipements complète',
  cml4_cout: 'Coût estimé avec marge de réserve',
  cml4_marges_validees: 'Marges techniques validées',
  cml4_verification: 'Plan de vérification (essais) défini',
  cml4_risques_classes: 'Risques classés avec piste de réduction'
};

const CML_EN = {
  cml1_objectif: 'Scientific objective stated in one sentence',
  cml1_unique: 'What makes the mission unique is identified',
  cml1_fenetre: 'Approximate launch window chosen',
  cml1_classe_budget: 'Target budget class',
  cml1_croquis: 'First sketch of the spacecraft',
  cml2_exigences: 'Science needs broken into top-level requirements',
  cml2_ordres_grandeur: 'Mass, power and budget estimated to an order of magnitude',
  cml2_risques: 'Major risks identified',
  cml2_lanceur: 'At least one candidate launcher listed',
  cml2_technologies: 'Required technologies identified',
  cml3_comparaison: 'At least two architectures compared',
  cml3_effet_options: 'Effect of each option on science, cost and risk documented',
  cml3_marges: 'Technical margins estimated for each option',
  cml3_sensibilite: 'Design sensitivity to the main risks assessed',
  cml3_option_retenue: 'Chosen option justified against the others',
  cml4_equipements: 'Equipment list complete',
  cml4_cout: 'Cost estimated with a reserve margin',
  cml4_marges_validees: 'Technical margins validated',
  cml4_verification: 'Verification plan (tests) defined',
  cml4_risques_classes: 'Risks ranked with a mitigation path'
};

const TALK = {
  cml1_objectif: {
    question: 'Which precise science question will this mission answer? (one sentence)',
    rouge: 'Too vague. Name the target, the method and the instrument.',
    jaune: 'Right direction, but the region or the resolution is missing.',
    vert: 'Clear, measurable, tied to the instrument. Criterion validated.'
  },
  cml1_unique: {
    question: 'How is this mission different from what already exists?',
    rouge: 'No difference identified. Look at existing NASA missions.',
    jaune: 'Partial difference. Argue more clearly against existing missions.',
    vert: 'Uniqueness clearly identified and written down.'
  },
  cml1_fenetre: {
    question: 'What is the approximate launch window?',
    rouge: 'No window defined. Check the orbital constraints.',
    jaune: 'Approximate window. Tighten it with the GMAT figures.',
    vert: 'Launch window defined and consistent with the target orbit.'
  },
  cml1_classe_budget: {
    question: 'Which budget class does this mission sit in?',
    rouge: 'Budget class undefined. Start from the total mass.',
    jaune: 'Class identified, but without a figure to back it.',
    vert: 'Budget class defined with a consistent order of magnitude.'
  },
  cml1_croquis: {
    question: 'Do you have a first sketch of the spacecraft, even a rough one?',
    rouge: 'No sketch. Picture the mission before moving on.',
    jaune: 'Very rough sketch. Add at least the main subsystems.',
    vert: 'Sketch present, with the component families identified.'
  },
  cml2_exigences: {
    question: 'Are the science needs translated into top-level requirements?',
    rouge: 'No requirements. Start from the science objective and break it down.',
    jaune: 'Partial requirements. Measurable success criteria are missing.',
    vert: 'Top-level requirements defined and traceable to the objective.'
  },
  cml2_ordres_grandeur: {
    question: 'Have you estimated mass, power and budget to an order of magnitude?',
    rouge: 'No estimate. Start with mass — it is the first bottleneck.',
    jaune: 'One or two estimates are missing. Finish them before leaving the workshop.',
    vert: 'Mass, power and budget estimated with acceptable consistency.'
  },
  cml2_risques: {
    question: 'Have the major risks of this mission been identified?',
    rouge: 'No risk listed. Space is hostile — anticipate.',
    jaune: 'A few risks identified, but not sized.',
    vert: 'Major risks listed with their possible impact.'
  },
  cml2_lanceur: {
    question: 'Have you listed at least one candidate launcher?',
    rouge: 'No launcher. Check mass and volume against the target orbit.',
    jaune: 'Launcher identified, but compatibility is not checked.',
    vert: 'Candidate launcher compatible with mass and orbit. Validated.'
  },
  cml2_technologies: {
    question: 'Have the necessary technologies been identified?',
    rouge: 'Technologies not listed. Go back over each family in the workshop.',
    jaune: 'Technologies only partly identified.',
    vert: 'Required technologies identified, availability checked.'
  },
  cml3_comparaison: {
    question: 'Have you compared at least two different architectures in the workshop?',
    rouge: 'Only one configuration tried. A single option is a bet, not a choice.',
    jaune: 'Two configurations tried, but no written comparison.',
    vert: 'Two architectures compared and documented.'
  },
  cml3_effet_options: {
    question: 'Is the effect of each option on science, cost and risk written down?',
    rouge: 'Nothing written. Without a comparison, the choice cannot be judged.',
    jaune: 'Partial effect written. At least one axis is missing: science, cost or risk.',
    vert: 'Impact of each option documented on all three axes.'
  },
  cml3_marges: {
    question: 'Are technical margins estimated for each option?',
    rouge: 'No margin. Without margin, the first surprise ends the mission.',
    jaune: 'Margins estimated for one option only.',
    vert: 'Technical margins estimated for each option compared.'
  },
  cml3_sensibilite: {
    question: 'Has the design\'s sensitivity to the main risks been assessed?',
    rouge: 'Sensitivity not assessed.',
    jaune: 'Partial assessment. Cover at least mass and power.',
    vert: 'Sensitivity to the major risks assessed and written down.'
  },
  cml3_option_retenue: {
    question: 'Is the chosen option justified against the others?',
    rouge: 'No justification. Argue the choice.',
    jaune: 'Partial justification. Add the trades you accepted.',
    vert: 'Chosen option justified, with the trades written explicitly.'
  },
  cml4_equipements: {
    question: 'Is the equipment list complete?',
    rouge: 'List incomplete. Check that every subsystem is covered.',
    jaune: 'List nearly complete. A few components still need confirming.',
    vert: 'Equipment list complete and consistent with the budget.'
  },
  cml4_cout: {
    question: 'Is the cost estimated with a reserve margin?',
    rouge: 'No reserve. NASA practice keeps at least 20% in reserve.',
    jaune: 'Reserve too thin (under 10%). Increase the margin.',
    vert: 'Cost estimated with a reserve of at least 20%.'
  },
  cml4_marges_validees: {
    question: 'Are the technical margins validated against the chosen threshold?',
    rouge: 'Margins not validated.',
    jaune: 'Margins validated on some axes only.',
    vert: 'Technical margins validated on every critical axis.'
  },
  cml4_verification: {
    question: 'Is the verification plan (the tests) defined?',
    rouge: 'No test plan. Without verification, launch is not justified.',
    jaune: 'Partial plan. Define at least vibration and thermal tests.',
    vert: 'Verification plan complete, with the three types of tests.'
  },
  cml4_risques_classes: {
    question: 'Are the risks ranked, with a way to reduce each one?',
    rouge: 'Risks not ranked.',
    jaune: 'Partial ranking, with no mitigation path.',
    vert: 'Risks ranked by probability and impact, each with a mitigation path.'
  }
};

const ALT = {
  chassis_alu: 'A CFRP bus would have lightened the satellite by about 150 g, for a higher budget and a longer checkout.',
  chassis_alLi: 'Standard aluminium would have cost less, with a slightly higher mass.',
  chassis_titane: 'Carbon would have cut the mass further. Titanium remains the strength-versus-mass compromise.',
  chassis_cfrp: '6061 aluminium would have been cheaper and simpler to machine, with a tighter mass margin.',
  mli: 'MLI protects against heat, not radiation. Shielding becomes necessary once you leave the magnetosphere.',
  blindage_rad: 'Without the shield, mass would have dropped, but the electronics would have aged faster outside the magnetosphere.',
  panneaux_gaas_1u: 'GaAs arrays are enough near Earth. An RTG would have guaranteed steady watts far from the Sun, for 0.5 kg and a much higher cost.',
  panneaux_si_2u: 'Silicon produces more watts here, but it is heavier. GaAs would have held a tight mass cap better.',
  batterie_liion: 'The battery produces nothing: without a generator, eclipse empties the reserves in a few orbits.',
  rtg: 'The RTG is steady and heavy. Near the Sun, GaAs arrays would have supplied the power for a fraction of the mass.',
  antenne_uhf: 'UHF is light and tolerant, but the rate tops out. X-band would have returned the images without aggressive compression.',
  antenne_xband: 'X-band needs more power and pointing. UHF would have been more forgiving for a first contact.',
  laser_optique: 'The laser offers a huge rate if pointing is very fine. X-band would have handled cloud cover at the ground station better.',
  capteur_temp: 'The sensor answers a simple question. A spectrometer would have opened a composition question, for much more mass and power.',
  camera_5mp: 'The camera documents a scene. A spectrometer would have measured composition, not only an image.',
  spectrometre_uv: 'The spectrometer is precise and hungry. A camera would have delivered a result sooner, with less power.',
  magnetometre: 'The magnetometer sees the field. A thermal sensor would have said nothing about the plasma around the satellite.',
  radar_altimetre: 'The radar sees through clouds and measures relief, at a cost of 8 W. A camera would have stayed blind under cloud.',
  chimique: 'Chemical thrust is immediate. An ion engine would have saved propellant, but the spiral would have taken months.',
  cryogenique: 'Cryogenic is efficient, and very cold propellants complicate storage. A storable chemical system would have been simpler to operate.',
  ionique: 'Ion traces a slow spiral. Chemical thrust would have shortened the transit, carrying much more propellant.'
};

const DECISIONS = {
  chapitre_01: {
    titre: 'Imposed orbit',
    choix: 'Rideshare CubeSat, low Earth orbit',
    consequence: 'Mass stays capped at 4 kg and the orbit is the primary passenger\'s.'
  },
  chapitre_02: {
    titre: 'Solar time',
    choix: 'Sun-synchronous orbit, pass near 10:30',
    consequence: 'Two images of the same region can be compared, because the sunlight is the same.'
  },
  chapitre_03: {
    titre: 'Transfer',
    choix: 'Transfer to the Moon, 3-second radio delay',
    consequence: 'Commands must leave before the probe has already moved.'
  },
  chapitre_04: {
    titre: 'Window',
    choix: 'Departure in the December 2026 window',
    consequence: 'Miss the injection and you wait for the next useful opposition.'
  },
  chapitre_05: {
    titre: 'Halo',
    choix: 'Halo orbit around L1',
    consequence: 'The equilibrium point does not hold the satellite: corrections are part of the mission.'
  },
  chapitre_06: {
    titre: 'Poles',
    choix: '90-degree orbit, 500 km, contact through Svalbard',
    consequence: 'Both poles are overflown. Solar time is not the same from one pass to the next.'
  },
  chapitre_07: {
    titre: 'High',
    choix: '35,786 km, 28 degrees, contact through Canberra',
    consequence: 'For this departure plane, Canberra sees the longest. Kourou and Goldstone see nothing.'
  },
  chapitre_08: {
    titre: 'Fixed',
    choix: '35,786 km, 0.01 degree inclination, continuous contact through Canberra',
    consequence: 'For this departure longitude, Canberra sees the satellite without a break. The other four stations in the game do not see it.'
  }
};

const BADGES = {
  econome: { nom: 'Mass keeper', texte: 'Mass used under 60% of the limit.' },
  scientifique: { nom: 'Rigorous scientist', texte: 'CML level 4 validated.' },
  polaire: { nom: 'Polar-orbit lead', texte: 'Sun-synchronous orbit, budget held.' },
  banc: { nom: 'Test bench', texte: 'Test reliability of at least 80%.' },
  contact: { nom: 'Contact made', texte: 'Operations run with a score of at least 75.' },
  signal: { nom: 'First signal', texte: 'First mission carried through to the debrief.' }
};

export function chapterText(chapter, key) {
  if (!chapter) return '';
  return t(chapter[key], CHAPTERS[chapter.id]?.[key]);
}

export function episodeText(chapterId, episode, key) {
  if (!episode) return '';
  if (key === 'titre') return t(episode.titre, EP_TITLE[episode.id]);
  if (key === 'bouton') return t(episode.bouton || '', episode.bouton ? 'Launch!' : '');
  if (key === 'texte') return t(episode.texte, EP_TEXT[`${chapterId}.${episode.id}`]);
  return episode[key] ?? '';
}

export function eventText(chapter) {
  const fr = chapter?.evenementAleatoire?.texte || '';
  return t(fr, EVENTS[chapter?.id]);
}

export function compName(id, fr) {
  return t(fr, COMP_NOM[id]);
}

export function compDesc(id, fr) {
  return t(fr, COMP_DESC[id]);
}

export function familyLabel(key, fr) {
  return t(fr, FAMILIES[key]);
}

export function unlockLabel(deblocage) {
  const raw = String(deblocage || '');
  const n = raw.match(/\d+/);
  if (!n) return t('Disponible dès le départ', 'Available from the start');
  return t(`Disponible au chapitre ${n[0]}`, `Unlocks in chapter ${n[0]}`);
}

export function roleText(role, key) {
  if (!role) return '';
  return t(role[key], ROLES[role.id]?.[key]);
}

export function cmlCriterion(id, fr) {
  return t(CML_FR[id] || fr, CML_EN[id]);
}

export function cmlTalk(id, part, fr) {
  return t(fr, TALK[id]?.[part]);
}

export function altThen(id, fr) {
  return t(fr, ALT[id]);
}

export function decisionCopy(chapterId, field, fr) {
  return t(fr, DECISIONS[chapterId]?.[field]);
}

export function badgeCopy(id, field, fr) {
  return t(fr, BADGES[id]?.[field]);
}

const MISSIONS = {
  'genesat-1': '3U CubeSat in low Earth orbit, the first NASA satellite built entirely around an onboard biology experiment.',
  phonesat: 'CubeSats built around a consumer phone, to show that a very simple platform can transmit from orbit.',
  nodes: 'Two CubeSats that demonstrated an autonomous radio network in low Earth orbit.',
  dellingr: 'Goddard 6U CubeSat, designed to make small platforms more reliable.',
  terra: 'Flagship Earth-observing spacecraft in Sun-synchronous orbit, crossing the equator at a stable solar time.',
  aqua: 'Water-cycle satellite on an afternoon orbit, complementary to Terra.',
  'suomi-npp': 'Bridge between research and operational weather, with an imager that rebuilds cloud cover.',
  'landsat-9': 'Optical imager in Sun-synchronous orbit, to compare landscapes from year to year under the same light.',
  lro: 'Lunar mapping orbiter, about a hundred kilometres up, still in service.',
  grail: 'Two probes in formation that mapped the Moon\'s gravity field.',
  ladee: 'Study of the lunar exosphere and dust, on a low orbit that ended in a planned impact.',
  'lunar-flashlight': 'Small satellite sent to look for ice in polar craters that never see the Sun.',
  mro: 'Mars reconnaissance orbiter and radio relay for surface craft, built for a long mission around Mars.',
  odyssey: 'The senior orbiter still active around Mars, a mapper and communications relay.',
  maven: 'Studies how the Martian atmosphere escapes. The conversation with Earth is counted in minutes, not seconds.',
  marco: 'Two CubeSats that relayed InSight\'s landing, proof a small platform can serve all the way to Mars.',
  soho: 'Solar observatory in a halo orbit around L1, upstream of Earth.',
  ace: 'Measures the solar wind from L1 and gives Earth about an hour of warning before storms.',
  dscovr: 'Solar-wind sentinel at L1, and a camera that returns the sunlit disc of Earth.',
  wind: 'Studies solar-wind plasma. Its workplace is the neighbourhood of L1.',
  'icesat-2': 'Measures ice from about 500 km, at 92 degrees inclination. Close to this chapter\'s 90-degree orbit, and not the same one.',
  qzss: 'Inclined geosynchronous orbit, built to linger over Japan. The inclination is not this chapter\'s 28 degrees.',
  'goes-16': 'Geostationary weather satellite over the Americas. The longitude is not this chapter\'s, where only Canberra keeps the satellite in view.'
};

export function missionBlurb(id, fr) {
  return t(fr, MISSIONS[id]);
}
