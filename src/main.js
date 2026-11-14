import chapitre01 from './data/chapters/chapitre_01.json';
import dialoguesData from './data/astra/dialogues.json';
import cmlCriteria from './data/cml/checklist.json';

import { ResourceManager } from './engine/resources.js';
import { CmlChecklist } from './engine/cml.js';
import { AstraEngine } from './engine/astra.js';
import { EpisodeRunner } from './engine/episode.js';
import { computeScore, genererRapport } from './engine/score.js';

import { renderDashboard } from './ui/dashboard.js';
import { renderAstra } from './ui/astra-widget.js';
import { renderEpisode } from './ui/episode-view.js';
import { mountPlaceholderScene } from './vis/scene.js';

const dashboardEl = document.getElementById('dashboard');
const episodeEl = document.getElementById('episode');
const astraEl = document.getElementById('astra');
const vue3dEl = document.getElementById('vue3d');

// --- Assemblage du moteur (identique quel que soit le chapitre charge) ---
const resources = new ResourceManager(chapitre01.contraintes);
const cml = new CmlChecklist(cmlCriteria);
const astra = new AstraEngine(dialoguesData, cml);

const runner = new EpisodeRunner(chapitre01, {
  resources,
  astra,
  cml,
  onChange: render
});

function render() {
  renderDashboard(dashboardEl, resources);
  renderAstra(astraEl, astra.lastLine);
  renderEpisode(episodeEl, runner, { onNext: handleNext });
}

function handleNext() {
  // Declenche l'evenement aleatoire du chapitre au moment de l'episode "lancement".
  if (runner.currentEpisode?.id === 'lancement') {
    runner.declencherEvenement();
  }

  // Exemple d'evaluation CML par ASTRA (evaluateur independant, pas d'auto-evaluation) :
  // au Briefing, on verifie qu'un objectif a bien ete defini (ici : toujours vrai, le
  // chapitre en fournit un). A affiner quand le Briefing deviendra interactif.
  if (runner.currentEpisode?.id === 'briefing') {
    astra.evaluerCritereCml('cml1_objectif', () => Boolean(chapitre01.mission));
    astra.evaluerCritereCml('cml1_classe_budget', () => Boolean(chapitre01.contraintes.budget));
  }

  runner.next();

  if (runner.isFinished) {
    const rapport = genererRapport({
      chapterId: chapitre01.id,
      score: computeScore({
        objectifsReussis: 1,
        valeurScientifique: 0.6,
        efficaciteRessources: 1 - resources.ratio('budget'),
        qualiteDecisions: 0.7,
        delaisRespectes: 1
      }),
      resourcesSnapshot: resources.snapshot(),
      decisionsCles: ['Choix du lanceur en covoiturage', 'Instrument unique pour tenir la masse'],
      missionsReellesProches: ['CubeSat educatif en orbite basse (exemple a affiner avec de vraies missions NASA)']
    });
    console.log('Rapport post-mission', rapport);
  }
}

astra.say('accueil');
runner.start();
render();
mountPlaceholderScene(vue3dEl);

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js').catch(() => {
    // Hors-ligne non critique pour le prototype ; a surveiller si l'enregistrement echoue.
  });
}
