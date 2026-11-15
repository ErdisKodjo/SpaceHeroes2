// Point d'entrée principal — Space Heroes
// Flow : Hub QG → Sélection du rôle → Mission

import dialoguesData from './data/astra/dialogues.json';
import cmlCriteria from './data/cml/checklist.json';
import { getChapitre } from './data/catalogue.js';

import { ResourceManager } from './engine/resources.js';
import { CmlChecklist } from './engine/cml.js';
import { AstraEngine } from './engine/astra.js';
import { EpisodeRunner } from './engine/episode.js';
import { evaluerMission } from './engine/bilan.js';
import { playerStore, appliquerBonusRole, annoterBonusRole } from './engine/player.js';
import { sauvegarder, charger, restaurerResources, restaurerCml, ageSauvegarde, effacer } from './engine/save.js';
import { appliquerCoutAtelier, coutNet } from './engine/atelier-cout.js';
import { appliquerPhase } from './engine/cml-preuves.js';

import { renderDashboard } from './ui/dashboard.js';
import { renderAstra } from './ui/astra-widget.js';
import { renderEpisode } from './ui/episode-view.js';
import { mountScene } from './vis/scene.js';
import { createGameAudio } from './audio/sfx.js';
import { createHub } from './ui/hub.js';
import { applyDocumentSettings } from './ui/settings.js';
import { createSplash } from './ui/splash.js';
import { tutorialStep, dismissTutorial } from './ui/tooltip.js';
import { t } from './i18n.js';

// Applique les réglages visuels (taille police, daltonien, contrastes…) dès le démarrage.
applyDocumentSettings();

// Éléments du jeu (cachés pendant le hub).
const appEl      = document.getElementById('app');
const dashboardEl = document.getElementById('dashboard');
const episodeEl  = document.getElementById('episode');
const astraEl    = document.getElementById('astra');
const vue3dEl    = document.getElementById('vue3d');

// Déclaré avant le splash : le mode démo saute l'écran de chargement.
const demo = new URLSearchParams(location.search).get('demo');

// Le splash s'abonne avant la scène, sinon les textures déjà en cache
// peuvent finir de charger avant que l'écouteur existe.
if (!demo) {
  const splash = createSplash();
  let texCount = 0;
  window.addEventListener('texture-loaded', () => { splash.onProgress(++texCount); });
}

// La scène 3D tourne toujours en fond (Terre + étoiles) — même pendant le hub.
const vue3d = mountScene(vue3dEl);
const audio = createGameAudio();

// Bouton son
const audioBtn = document.getElementById('btn-audio');
function paintAudioButton() {
  audioBtn.textContent = audio.muted ? t('MUET', 'MUTE') : t('SON', 'SOUND');
  audioBtn.title = audio.muted ? t('Activer le son', 'Turn sound on') : t('Couper le son', 'Mute');
  audioBtn.setAttribute('aria-pressed', String(!audio.muted));
  audioBtn.classList.toggle('is-muted', audio.muted);
}
function applyChrome() {
  const hint = document.getElementById('cam-hint');
  if (hint) hint.textContent = t('Glisser · WASD · molette pour explorer', 'Drag · WASD · scroll to explore');
  paintAudioButton();
}
paintAudioButton();
applyChrome();
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
window.addEventListener('settings-change', () => {
  applyDocumentSettings();
  applyChrome();
});

// Célébration 3D quand le CubeSat atteint l'orbite.
// L'astuce « explorer la vue » attend la fin du bandeau, pour ne pas le couvrir.
window.addEventListener('orbite-atteinte', () => {
  vue3d.celebrate?.();
  dismissTutorial();
  setTimeout(() => tutorialStep('orbite'), 3200);
});

// ─── HUB QG ───────────────────────────────────────────────────────────────

// Masquer les overlays du jeu pendant le hub.
function hideGameUI() {
  appEl.classList.add('is-hub');
  document.getElementById('cam-hint')?.classList.add('is-gone');
}

function showGameUI() {
  appEl.classList.remove('is-hub');
}

let hubApi = null;
let missionCleanup = () => {};

function openHub() {
  missionCleanup();
  missionCleanup = () => {};
  document.getElementById('sh-bilan-root')?.remove();
  document.body.classList.remove('is-bilan');
  hubApi?.dispose();
  hideGameUI();
  const save = charger();
  hubApi = createHub({
    onStartMission: startMission,
    savedGame: save ? { chapterId: save.chapterId, ageMin: ageSauvegarde() } : null
  });
}

if (demo) {
  // Mode démonstration : saute directement à la mission.
  startMission({ chapterId: 'chapitre_01' });
} else {
  openHub();
}

// ─── MISSION ──────────────────────────────────────────────────────────────

function startMission({ chapterId, restore = false }) {
  missionCleanup();
  hubApi?.dispose();
  hubApi = null;
  document.getElementById('sh-bilan-root')?.remove();
  document.body.classList.remove('is-bilan');
  showGameUI();

  const chapterData = getChapitre(chapterId) || getChapitre('chapitre_01');
  chapterId = chapterData.id;
  vue3d.setMission(chapterData.gmat || 'orbite_basse');

  const resources = new ResourceManager(chapterData.contraintes);
  const cml       = new CmlChecklist(cmlCriteria);
  const astra     = new AstraEngine(dialoguesData, cml);

  // Restaurer depuis sauvegarde si demandé
  let savedSelections = {};
  let savedRepartitions = {};
  let savedFiabilite  = null;
  let savedScoreOps   = null;
  let startIndex      = 0;
  let atelierApplique = false;
  let aCompare        = false;
  let chargedCost     = null;

  if (restore) {
    const save = charger();
    if (save && save.chapterId === chapterId) {
      restaurerResources(resources, save.resources);
      restaurerCml(cml, save.cml);
      savedSelections = save.selections ?? {};
      savedRepartitions = save.repartitions ?? {};
      savedFiabilite  = save.fiabilite  ?? null;
      savedScoreOps   = save.scoreOps   ?? null;
      startIndex      = save.episodeIndex ?? 0;
      atelierApplique = Boolean(save.atelierApplique);
      aCompare        = Boolean(save.aCompare);
      const roleSauve = playerStore.getRoles().find((r) => r.id === save.roleId);
      if (roleSauve) {
        const facteur = Number(roleSauve.bonus?.facteur);
        const cle = roleSauve.bonus?.ressource;
        if (cle && facteur > 0 && facteur < 1) resources.relief[cle] = facteur;
        annoterBonusRole(resources, roleSauve);
      }
      if (atelierApplique) chargedCost = coutNet(resources, chapterData, savedSelections, savedRepartitions);
    }
  }
  if (!resources.bonusNote) appliquerBonusRole(resources, playerStore.role);

  const runner = new EpisodeRunner(chapterData, {
    resources,
    astra,
    cml,
    onChange: render
  });

  // Avancer jusqu'à l'épisode sauvegardé
  if (startIndex > 0) {
    for (let i = 0; i < startIndex && !runner.isFinished; i++) runner.next();
  }

  let busy = false;
  let lastEpisodeId = null;

  // Auto-save après chaque changement d'épisode
  function autoSave() {
    if (demo) return;
    sauvegarder({
      chapterId,
      episodeIndex: runner.index,
      resources,
      cml,
      selections: savedSelections,
      repartitions: savedRepartitions,
      fiabilite:  savedFiabilite,
      scoreOps:   savedScoreOps,
      atelierApplique,
      aCompare,
      roleId: playerStore.roleId
    });
  }

  let rapport = null;
  function ensureRapport() {
    if (rapport) return rapport;
    rapport = evaluerMission({
      chapter: chapterData,
      resources,
      cml,
      selections: savedSelections,
      fiabilite: savedFiabilite,
      scoreOps: savedScoreOps
    });
    if (!demo) {
      playerStore.enregistrerScore(chapterData.id, rapport.score);
      playerStore.ajouterJetons(rapport.jetons);
      effacer();
    }
    return rapport;
  }

  function render() {
    const episode = runner.currentEpisode || null;
    appEl.classList.toggle('is-busy',      busy);
    appEl.classList.toggle('is-cinematic', busy && episode?.type === 'lancement');

    renderDashboard(dashboardEl, resources, { chapter: chapterData });
    renderAstra(astraEl, astra.lastLine);
    renderEpisode(episodeEl, runner, {
      onNext: handleNext,
      busy,
      resources,
      astra,
      cml,
      bilan: episode?.type === 'bilan' ? ensureRapport() : null,
      onRejouer: () => startMission({ chapterId, restore: false }),
      onSuivante: (nextId) => startMission({ chapterId: nextId, restore: false }),
      onQuitter: openHub,
      preuves: contextePreuve,
      lien: vue3d.lienOrbital(),
      selections: savedSelections,
      repartitions: savedRepartitions
    });

    if (episode?.id !== lastEpisodeId) {
      lastEpisodeId = episode?.id ?? null;
      window.dispatchEvent(new CustomEvent('episode-change', {
        detail: { episode, index: runner.index }
      }));
      if (episode?.type !== 'bilan') autoSave();
      // Tutoriel contextuel
      if (episode?.type === 'briefing') tutorialStep('immediate');
      else if (episode?.type === 'atelier') tutorialStep('atelier');
      else if (episode?.type === 'lancement') tutorialStep('lancement');
    }
  }

  function contextePreuve() {
    return {
      chapter: chapterData,
      resources,
      selections: savedSelections,
      fiabilite: savedFiabilite,
      aCompare
    };
  }

  const onRessources = () => {
    renderDashboard(dashboardEl, resources, { chapter: chapterData });
  };

  const onAtelier = ({ detail }) => {
    savedSelections = detail?.selections ?? {};
    savedRepartitions = detail?.repartitions ?? {};
    aCompare = Boolean(detail?.aCompare);
    chargedCost = appliquerCoutAtelier(resources, chapterData, chargedCost, savedSelections, savedRepartitions);
    atelierApplique = true;
    appliquerPhase(astra, 'atelier', contextePreuve());
    autoSave();
    onRessources();
  };
  const onEssais = ({ detail }) => {
    savedFiabilite = detail?.fiabilite ?? null;
    appliquerPhase(astra, 'essais', contextePreuve());
    autoSave();
  };
  const onOperations = ({ detail }) => {
    savedScoreOps = detail?.scoreOps ?? null;
    autoSave();
  };
  window.addEventListener('atelier-valide', onAtelier);
  window.addEventListener('essais-termines', onEssais);
  window.addEventListener('operations-terminees', onOperations);
  window.addEventListener('ressources-change', onRessources);
  missionCleanup = () => {
    window.removeEventListener('atelier-valide', onAtelier);
    window.removeEventListener('essais-termines', onEssais);
    window.removeEventListener('operations-terminees', onOperations);
    window.removeEventListener('ressources-change', onRessources);
  };

  async function handleNext() {
    if (busy) return;

    if (runner.currentEpisode?.type === 'lancement') {
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
      appliquerPhase(astra, 'briefing', contextePreuve());
    }

    runner.next();
  }

  astra.say('accueil');
  runner.start();
  render();

  // Mode démo : saute au lancement, ou directement au bilan.
  if (demo === 'bilan') {
    resources.consume('masse', 2.1);
    resources.consume('budget', 2.4);
    resources.consume('puissance', 4);
    resources.consume('donnees', 2);
    resources.consume('communications', 1.5);
    resources.consume('duree', 6);
    savedSelections = {
      moteurs: 'chimique',
      structure: 'chassis_cfrp',
      energie: 'panneaux_gaas_1u',
      communications: 'antenne_uhf',
      instrument: 'capteur_temp'
    };
    savedFiabilite = 82;
    savedScoreOps = 75;
    while (!runner.isFinished && runner.currentEpisode?.type !== 'bilan') runner.next();
  } else if (demo === 'lancement') {
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
