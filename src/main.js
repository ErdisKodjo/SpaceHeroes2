// Point d'entrée principal — Space Heroes
// Flow : Hub QG → Sélection du rôle → Mission

import chapitre01 from './data/chapters/chapitre_01.json';
import dialoguesData from './data/astra/dialogues.json';
import cmlCriteria from './data/cml/checklist.json';

import { ResourceManager } from './engine/resources.js';
import { CmlChecklist } from './engine/cml.js';
import { AstraEngine } from './engine/astra.js';
import { EpisodeRunner } from './engine/episode.js';
import { computeScore, genererRapport } from './engine/score.js';
import { settingsStore } from './engine/settings-store.js';
import { playerStore } from './engine/player.js';

import { renderDashboard } from './ui/dashboard.js';
import { renderAstra } from './ui/astra-widget.js';
import { renderEpisode } from './ui/episode-view.js';
import { mountScene } from './vis/scene.js';
import { createGameAudio } from './audio/sfx.js';
import { createHub } from './ui/hub.js';
import { applyDocumentSettings } from './ui/settings.js';

// Applique les réglages visuels (taille police, daltonien, contrastes…) dès le démarrage.
applyDocumentSettings();

// Éléments du jeu (cachés pendant le hub).
const appEl      = document.getElementById('app');
const dashboardEl = document.getElementById('dashboard');
const episodeEl  = document.getElementById('episode');
const astraEl    = document.getElementById('astra');
const vue3dEl    = document.getElementById('vue3d');

// La scène 3D tourne toujours en fond (Terre + étoiles) — même pendant le hub.
const vue3d = mountScene(vue3dEl);
const audio = createGameAudio();

// Bouton son
const audioBtn = document.getElementById('btn-audio');
function paintAudioButton() {
  audioBtn.textContent = audio.muted ? 'MUET' : 'SON';
  audioBtn.setAttribute('aria-pressed', String(!audio.muted));
  audioBtn.classList.toggle('is-muted', audio.muted);
}
paintAudioButton();
audioBtn.addEventListener('click', () => {
  audio.unlock();
  audio.toggle();
  paintAudioButton();
});

const unlockAudio = () => audio.unlock();
window.addEventListener('pointerdown', unlockAudio, { once: true });
window.addEventListener('keydown',     unlockAudio, { once: true });

// Réaction audio + visuelle aux répliques ASTRA.
window.addEventListener('astra-message', ({ detail }) => {
  if (detail?.texte) audio.radio(detail.texte);
  if (detail?.categorie === 'alerte' || detail?.categorie === 'echec') vue3d.flashWarning();
});

// Réaction audio aux annonces de la séquence de lancement.
window.addEventListener('vis-announcer', ({ detail }) => {
  const text = detail?.text || '';
  const tick = text.match(/^T-(\d+)$/);
  if (tick) audio.countdown(Number(tick[1]));
  else if (detail?.variant === 'is-liftoff') audio.liftoff();
  else if (detail?.variant === 'is-success') audio.success();
});

// Réapplique les réglages visuels à chaque changement dans les Paramètres.
window.addEventListener('settings-change', () => applyDocumentSettings());

// ─── HUB QG ───────────────────────────────────────────────────────────────

// Masquer les overlays du jeu pendant le hub.
function hideGameUI() {
  appEl.classList.add('is-hub');
  document.getElementById('cam-hint')?.classList.add('is-gone');
}

function showGameUI() {
  appEl.classList.remove('is-hub');
}

// Afficher le hub au démarrage (sauf si mode démo).
const demo = new URLSearchParams(location.search).get('demo');

if (demo) {
  // Mode démonstration : saute directement à la mission.
  startMission({ chapterId: 'chapitre_01' });
} else {
  hideGameUI();
  createHub({ onStartMission: startMission });
}

// ─── MISSION ──────────────────────────────────────────────────────────────

function startMission({ chapterId }) {
  showGameUI();

  // Pour l'instant seul le chapitre 1 est disponible.
  const chapterData = chapitre01;

  const resources = new ResourceManager(chapterData.contraintes);
  const cml       = new CmlChecklist(cmlCriteria);
  const astra     = new AstraEngine(dialoguesData, cml);

  const runner = new EpisodeRunner(chapterData, {
    resources,
    astra,
    cml,
    onChange: render
  });

  let busy = false;
  let lastEpisodeId = null;

  function render() {
    const episode = runner.currentEpisode || null;
    appEl.classList.toggle('is-busy',      busy);
    appEl.classList.toggle('is-cinematic', busy && episode?.type === 'lancement');

    renderDashboard(dashboardEl, resources, { chapter: chapterData });
    renderAstra(astraEl, astra.lastLine);
    renderEpisode(episodeEl, runner, { onNext: handleNext, busy, resources, astra, cml });

    if (episode?.id !== lastEpisodeId) {
      lastEpisodeId = episode?.id ?? null;
      window.dispatchEvent(new CustomEvent('episode-change', {
        detail: { episode, index: runner.index }
      }));
    }
  }

  async function handleNext() {
    if (busy) return;

    if (runner.currentEpisode?.type === 'lancement') {
      runner.declencherEvenement();
      if (!vue3d.launched) {
        busy = true;
        render();
        try {
          await vue3d.launch();
        } finally {
          busy = false;
        }
      }
    }

    if (runner.currentEpisode?.id === 'briefing') {
      astra.evaluerCritereCml('cml1_objectif',      () => Boolean(chapterData.mission));
      astra.evaluerCritereCml('cml1_classe_budget', () => Boolean(chapterData.contraintes.budget));
    }

    runner.next();

    if (runner.isFinished) {
      const score = computeScore({
        objectifsReussis:      1,
        valeurScientifique:    0.6,
        efficaciteRessources:  1 - resources.ratio('budget'),
        qualiteDecisions:      0.7,
        delaisRespectes:       1
      });
      const rapport = genererRapport({
        chapterId:            chapterData.id,
        score,
        resourcesSnapshot:    resources.snapshot(),
        decisionsCles:        ['Choix du lanceur en covoiturage', 'Instrument unique pour tenir la masse'],
        missionsReellesProches: ['CubeSat éducatif en orbite basse']
      });
      playerStore.enregistrerScore(chapterData.id, score);
      console.log('Rapport post-mission', rapport);
      // TODO Sprint 4 : afficher l'écran Bilan (bilan-view.js)
    }
  }

  astra.say('accueil');
  runner.start();
  render();

  // Mode démo : saute directement au lancement.
  if (demo === 'lancement') {
    while (!runner.isFinished && runner.currentEpisode.type !== 'lancement') runner.next();
    const seek = Number(new URLSearchParams(location.search).get('t'));
    if (seek > 0) {
      vue3d.advance(4);
      handleNext();
      vue3d.advance(seek);
    } else {
      setTimeout(handleNext, 4000);
    }
  }
}

// ─── PWA ──────────────────────────────────────────────────────────────────

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js').catch(() => {});
}
