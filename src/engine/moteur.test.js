import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { CmlChecklist } from './cml.js';
import { EpisodeRunner } from './episode.js';
import {
  appliquerMarge,
  evenementAutorise,
  niveauxDirecteur,
  porteOuverte,
  prevaliderCml
} from './difficulte.js';
import { appliquerMode, chapitresOuverts, pressionScore } from './mode-jeu.js';
import { appliquerCoutAtelier, coutNet } from './atelier-cout.js';
import { prixAnticipe } from './jetons.js';
import { playerStore } from './player.js';
import { settingsStore } from './settings-store.js';
import chapitre01 from '../data/chapters/chapitre_01.json';

const CRITERES = [];
for (let niveau = 1; niveau <= 4; niveau += 1) {
  for (let i = 0; i < 5; i += 1) CRITERES.push({ id: `n${niveau}_${i}`, niveau });
}

function checklist() {
  return new CmlChecklist(CRITERES);
}

function verdir(cml, niveau, nombre) {
  for (let i = 0; i < nombre; i += 1) cml.setStatus(`n${niveau}_${i}`, 'vert');
}

function astraPour(cml) {
  return {
    cml,
    lastLine: null,
    say(id, vars) {
      this.lastLine = { id, vars };
    },
    evaluerCritereCml(id, statut) {
      cml.setStatus(id, statut);
    }
  };
}

const CHAPITRE = {
  id: 'test',
  episodes: [
    { id: 'briefing', type: 'briefing', cmlVise: 1 },
    { id: 'atelier', type: 'atelier', cmlVise: 2 },
    { id: 'essais', type: 'essais', cmlRequis: 2 },
    { id: 'lancement', type: 'lancement', cmlRequis: 2 }
  ]
};

function ressources(max = { masse: 10, budget: 10, puissance: 10, duree: 10 }) {
  return {
    max: { ...max },
    used: { masse: 0, budget: 0, puissance: 0, donnees: 0, communications: 0, duree: 0 },
    relief: {}
  };
}

afterEach(() => {
  settingsStore.set('difficulty', 'ingenieur');
  settingsStore.set('gameMode', 'campagne');
  settingsStore.set('randomEvents', true);
});

describe('portes CML', () => {
  it('retient l\'épisode tant que le niveau visé n\'a pas 80 % de verts', () => {
    const cml = checklist();
    const astra = astraPour(cml);
    const runner = new EpisodeRunner(CHAPITRE, { astra, cml });
    expect(runner.next()).toBe(false);
    expect(astra.lastLine).toEqual({ id: 'cml_niveau_manquant', vars: { niveau: 1 } });
    expect(runner.currentEpisode.type).toBe('briefing');
  });

  it('laisse passer quand le niveau visé est vert, puis le bac à sable ignore la porte', () => {
    const cml = checklist();
    const astra = astraPour(cml);
    const runner = new EpisodeRunner(CHAPITRE, { astra, cml });
    verdir(cml, 1, 4);
    expect(runner.next()).toBe(true);
    expect(runner.currentEpisode.type).toBe('atelier');

    settingsStore.set('difficulty', 'bac_sable');
    expect(porteOuverte()).toBe(true);
    expect(runner.next()).toBe(true);
    expect(runner.currentEpisode.type).toBe('essais');
  });

  it('le directeur bloqué au CML 4 peut revenir à l\'atelier', () => {
    settingsStore.set('difficulty', 'directeur');
    const cml = checklist();
    verdir(cml, 2, 4);
    const astra = astraPour(cml);
    const runner = new EpisodeRunner(CHAPITRE, { astra, cml });
    runner.index = 2;
    expect(niveauxDirecteur(runner.currentEpisode, cml)).toBe(4);
    expect(runner.next()).toBe(false);
    expect(runner.retourAtelier()).toBe(true);
    expect(runner.currentEpisode.type).toBe('atelier');
    expect(astra.lastLine.id).toBe('retour_atelier');
  });

  it('forcer ouvre la porte sans valider le CML', () => {
    const cml = checklist();
    const runner = new EpisodeRunner(CHAPITRE, { astra: astraPour(cml), cml });
    expect(runner.next({ forcer: true })).toBe(true);
    expect(cml.isLevelValidated(1)).toBe(false);
  });
});

describe('difficulté', () => {
  it('élargit les plafonds du cadet et prépare les CML 1 et 2', () => {
    settingsStore.set('difficulty', 'cadet');
    const resources = ressources();
    appliquerMarge(resources);
    expect(resources.max.masse).toBeCloseTo(11.5);
    expect(resources.max.duree).toBeCloseTo(11.5);
    expect(resources.margeNote.facteur).toBe(1.15);
    const cml = checklist();
    prevaliderCml(astraPour(cml));
    expect(cml.isLevelValidated(1)).toBe(true);
    expect(cml.isLevelValidated(2)).toBe(true);
    expect(cml.isLevelValidated(3)).toBe(false);
    expect(evenementAutorise()).toBe(false);
  });

  it('laisse l\'ingénieur tel quel et suit le réglage des événements', () => {
    const resources = ressources();
    appliquerMarge(resources);
    expect(resources.max.masse).toBe(10);
    expect(resources.margeNote).toBeUndefined();
    expect(evenementAutorise()).toBe(true);
    settingsStore.set('randomEvents', false);
    expect(evenementAutorise()).toBe(false);
  });

  it('resserre les plafonds du directeur et garde l\'aléa', () => {
    settingsStore.set('difficulty', 'directeur');
    settingsStore.set('randomEvents', false);
    const resources = ressources();
    appliquerMarge(resources);
    expect(resources.max.budget).toBeCloseTo(8.5);
    expect(evenementAutorise()).toBe(true);
  });
});

describe('mode de jeu', () => {
  it('réduit la masse et la durée en défi, sans les fractions bancales', () => {
    settingsStore.set('gameMode', 'defi');
    const resources = ressources({ masse: 12, budget: 5, puissance: 10, duree: 12 });
    appliquerMode(resources);
    expect(resources.max.masse).toBe(9.6);
    expect(resources.max.duree).toBe(8.4);
    expect(resources.max.budget).toBe(5);
    expect(resources.modeNote.label).toBe('Défi');
  });

  it('laisse la campagne classée et ouvre tout en découverte', () => {
    expect(pressionScore()).toBe(true);
    expect(chapitresOuverts()).toBe(false);
    settingsStore.set('gameMode', 'decouverte');
    const resources = ressources();
    appliquerMode(resources);
    expect(resources.max.masse).toBe(10);
    expect(pressionScore()).toBe(false);
    expect(chapitresOuverts()).toBe(true);
    expect(resources.modeNote.label).toBe('Découverte');
  });
});

describe('coût d\'atelier', () => {
  it('remplace le coût déjà imputé au lieu de l\'ajouter', () => {
    const resources = ressources();
    const premiere = { structure: 'chassis_alu' };
    const seconde = { structure: 'chassis_cfrp' };
    let charged = appliquerCoutAtelier(resources, chapitre01, null, premiere, {});
    const masseDepart = resources.used.masse;
    expect(masseDepart).toBeGreaterThan(0);
    charged = appliquerCoutAtelier(resources, chapitre01, charged, seconde, {});
    expect(resources.used.masse).toBeCloseTo(coutNet(resources, chapitre01, seconde, {}).masse);
    expect(resources.used.masse).not.toBeCloseTo(masseDepart * 2);
  });

  it('applique le relief de masse', () => {
    const resources = ressources();
    resources.relief.masse = 0.9;
    const selections = { structure: 'chassis_alu' };
    appliquerCoutAtelier(resources, chapitre01, null, selections, {});
    expect(resources.used.masse).toBeCloseTo(coutNet(resources, chapitre01, selections, {}).masse);
    const sansRelief = coutNet({ relief: {} }, chapitre01, selections, {}).masse;
    expect(resources.used.masse).toBeCloseTo(sansRelief * 0.9);
  });
});

describe('jetons', () => {
  beforeEach(() => {
    const solde = playerStore.jetons;
    if (solde > 0) playerStore.depenserJetons(solde);
  });

  it('fixe le prix d\'un déblocage au numéro du chapitre', () => {
    expect(prixAnticipe('chapitre_01')).toBe(0);
    expect(prixAnticipe('chapitre_02')).toBe(2);
    expect(prixAnticipe('chapitre_05')).toBe(5);
    expect(prixAnticipe(null)).toBe(0);
  });

  it('refuse une dépense au-dessus du solde', () => {
    expect(playerStore.ajouterJetons(2)).toBe(2);
    expect(playerStore.depenserJetons(3)).toBe(false);
    expect(playerStore.jetons).toBe(2);
    expect(playerStore.depenserJetons(2)).toBe(true);
    expect(playerStore.jetons).toBe(0);
  });
});
