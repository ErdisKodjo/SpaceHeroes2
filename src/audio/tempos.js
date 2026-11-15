// Tempos et motifs MIDI pour Space Heroes
// Fichier externe pour configuration facile des musiques de jeu

const STEPS = 32;

// Motifs de rythme (0 = silence, 1 = activation)
// Kick, Clap, Hi-hat sont des tableaux de 32 pas (32nd notes)

// --- MOTEURS DE RYTHME ---

const kickHub = [
  1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0,
  1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0
];

const clapHub = [
  0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0
];

const hatHub = [
  0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0,
  0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0
];

const kickBriefing = Array(STEPS).fill(0); // Pas de batterie
const clapBriefing = Array(STEPS).fill(0);
const hatBriefing = Array(STEPS).fill(0);

const kickAtelier = [
  1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0,
  1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0
];

const clapAtelier = [
  0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0
];

const hatAtelier = [
  1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1,
  1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0
];

const kickEssais = [
  1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0,
  1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0
];

const clapEssais = [
  0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1,
  0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1
];

const hatEssais = [
  0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1,
  0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1
];

const kickLancement = [
  1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0,
  1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0
];

const clapLancement = [
  0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0
];

const hatLancement = [
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1
];

const kickOperations = [
  1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0,
  1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0
];

const clapOperations = [
  0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0
];

const hatOperations = [
  0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0,
  0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0
];

const kickBilan = [
  1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
];

const clapBilan = [
  0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0
];

const hatBilan = Array(STEPS).fill(0);

// --- BASES (MIDI notes) ---

const bassHub = [43, 0, 0, 43, 0, 0, 0, 0, 38, 0, 0, 38, 0, 0, 0, 0, 40, 0, 0, 40, 0, 0, 0, 0, 36, 0, 0, 36, 0, 0, 0, 0];
const leadHub = [67, 0, 71, 0, 74, 0, 0, 76, 0, 74, 0, 71, 0, 0, 67, 0, 69, 0, 72, 0, 76, 0, 0, 74, 0, 72, 0, 69, 0, 0, 67, 0];

const bassBriefing = [43, 43, 43, 43, 38, 38, 38, 38, 40, 40, 40, 40, 36, 36, 36, 36];
const leadBriefing = [67, 71, 74, 79, 66, 69, 74, 78, 64, 67, 71, 76, 60, 64, 67, 72];

const bassAtelier = [45, 0, 45, 0, 0, 45, 0, 0, 41, 0, 41, 0, 0, 43, 0, 0, 40, 0, 40, 0, 0, 40, 0, 0, 38, 0, 38, 0, 36, 0, 0, 0];
const leadAtelier = [69, 0, 72, 0, 76, 0, 74, 0, 72, 0, 0, 69, 0, 72, 0, 0, 68, 0, 71, 0, 75, 0, 72, 0, 68, 0, 0, 64, 0, 68, 0, 0];

const bassEssais = [40, 0, 40, 0, 40, 0, 0, 0, 40, 0, 43, 0, 40, 0, 0, 0, 38, 0, 38, 0, 38, 0, 0, 0, 36, 0, 36, 0, 35, 0, 0, 0];
const leadEssais = [64, 0, 67, 0, 70, 0, 67, 0, 64, 0, 0, 63, 0, 0, 60, 0, 63, 0, 67, 0, 63, 0, 0, 60, 0, 58, 0, 0, 60, 0, 0, 0];

const bassLancement = [36, 0, 36, 0, 36, 0, 43, 0, 36, 0, 36, 0, 38, 0, 36, 0, 41, 0, 43, 0, 43, 0, 41, 0, 43, 0, 36, 0, 0, 0, 0, 0];
const leadLancement = [72, 0, 76, 0, 79, 0, 84, 0, 79, 0, 76, 0, 74, 0, 72, 0, 79, 0, 84, 0, 88, 0, 84, 0, 79, 0, 76, 0, 74, 0, 72, 0];

const bassOperations = [41, 0, 0, 0, 41, 0, 0, 0, 36, 0, 0, 0, 36, 0, 0, 0, 43, 0, 0, 0, 43, 0, 0, 0, 38, 0, 0, 0, 38, 0, 0, 0];
const leadOperations = [65, 0, 0, 69, 0, 0, 72, 0, 0, 69, 0, 0, 65, 0, 0, 0, 67, 0, 0, 71, 0, 0, 74, 0, 0, 71, 0, 0, 67, 0, 0, 0];

const bassBilan = [43, 43, 38, 38, 40, 40, 36, 36];
const leadBilan = [67, 71, 74, 79, 66, 69, 74, 78];

// --- CONFIGURATION DE CHAQUE SCENE ---

export const TEMPOS = {
  hub: {
    bpm: 102,
    level: 0.55,
    mood: 'motivation_calme',
    kick: kickHub,
    clap: clapHub,
    hat: hatHub,
    bass: bassHub,
    lead: leadHub,
    description: 'Menu, navigations — motivation calme',
    transitionFrom: ['bilan'],
    transitionTo: ['briefing', 'atelier', 'essais', 'lancement', 'operations', 'bilan']
  },

  briefing: {
    bpm: 76,
    level: 0.55,
    mood: 'concentration_emerveillee',
    kick: kickBriefing,
    clap: clapBriefing,
    hat: hatBriefing,
    bass: holdPattern(bassBriefing, 2),
    lead: holdPattern(leadBriefing, 2),
    description: 'Briefing — concentration émerveillée, nappes, pas de batterie',
    transitionFrom: ['hub', 'bilan'],
    transitionTo: ['atelier', 'essais']
  },

  atelier: {
    bpm: 112,
    level: 0.90,
    mood: 'creativite_precise',
    kick: kickAtelier,
    clap: clapAtelier,
    hat: hatAtelier,
    bass: bassAtelier,
    lead: leadAtelier,
    description: 'Atelier — créativité précise, conception du vaisseau',
    transitionFrom: ['briefing'],
    transitionTo: ['essais', 'lancement']
  },

  essais: {
    bpm: 124,
    level: 0.85,
    mood: 'tension_controlee',
    kick: kickEssais,
    clap: clapEssais,
    hat: hatEssais,
    bass: bassEssais,
    lead: leadEssais,
    description: 'Essais — tension contrôlée, tests techniques',
    transitionFrom: ['atelier'],
    transitionTo: ['lancement']
  },

  lancement: {
    bpm: 128,
    level: 1.05,
    mood: 'adrenaline_maximale',
    kick: kickLancement,
    clap: clapLancement,
    hat: hatLancement,
    bass: bassLancement,
    lead: leadLancement,
    description: 'Lancement — adrénaline maximale, compte à rebours puis décollage',
    transitionFrom: ['essais'],
    transitionTo: ['operations']
  },

  operations: {
    bpm: 96,
    level: 0.75,
    mood: 'concentration_spatiale',
    kick: kickOperations,
    clap: clapOperations,
    hat: hatOperations,
    bass: bassOperations,
    lead: leadOperations,
    description: 'Opérations — concentration spatiale, navigation',
    transitionFrom: ['lancement'],
    transitionTo: ['bilan']
  },

  bilan: {
    bpm: 88,
    level: 0.70,
    mood: 'satification_reflechie',
    kick: kickBilan,
    clap: clapBilan,
    hat: hatBilan,
    bass: holdPattern(bassBilan, 4),
    lead: holdPattern(leadBilan, 4),
    description: 'Bilan — satisfaction réfléchie, score et médaille',
    transitionFrom: ['operations'],
    transitionTo: ['hub', 'briefing']
  }
};

// --- UTILITAIRES ---

function midiToFreq(note) {
  return 440 * Math.pow(2, (note - 69) / 12);
}

// Génère un motif de 32 pas à partir d'un tableau répété ou étendu
function expandPattern(pattern, steps = STEPS) {
  if (Array.isArray(pattern)) {
    if (pattern.length === steps) return pattern;
    if (pattern.length < steps) {
      // Répétition
      const repeated = [];
      while (repeated.length < steps) {
        repeated.push(...pattern);
      }
      return repeated.slice(0, steps);
    }
    return pattern.slice(0, steps);
  }
  return Array(steps).fill(pattern);
}

// Convertit une base (4 notes) en motif 32 pas
function holdPattern(notes, each = 4) {
  const out = Array(STEPS).fill(0);
  notes.forEach((note, index) => {
    const at = index * each;
    if (at < STEPS) out[at] = note;
  });
  return out;
}

export function getSceneConfig(sceneName) {
  return TEMPOS[sceneName] || TEMPOS.hub;
}

export function getSceneNames() {
  return Object.keys(TEMPOS);
}

// Récupère un motif avec conversion MIDI en fréquence si demandé
export function getPattern(sceneName, type, freq = false) {
  const scene = TEMPOS[sceneName];
  if (!scene) return null;
  
  let pattern = scene[type];
  if (!pattern) return null;
  
  if (freq && type !== 'kick' && type !== 'clap' && type !== 'hat') {
    // Convertit les notes MIDI en fréquences
    return pattern.map(note => note === 0 ? 0 : midiToFreq(note));
  }
  
  return pattern;
}

// Renvoie la prochaine scènce logique selon le contexte
export function getNextScene(current, context) {
  const scene = TEMPOS[current];
  if (!scene) return 'hub';
  
  if (context === 'briefing_done') return 'atelier';
  if (context === 'atelier_done') return 'essais';
  if (context === 'essais_done') return 'lancement';
  if (context === 'lancement_done') return 'operations';
  if (context === 'operations_done') return 'bilan';
  if (context === 'bilan_done') return 'hub';
  
  return scene.transitionTo?.[0] || 'hub';
}
