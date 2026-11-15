// Tutoriel guidé — 4 étapes contextuelles (Sprint 5).
// Désactivable via Paramètres → Mode de jeu → Tutoriel.
// Chaque étape est un tooltip ancré sur un élément DOM existant.
// Stocké dans localStorage 'sh-tutorial' pour ne pas réafficher.

import { settingsStore } from '../engine/settings-store.js';
import { icon } from './icons.js';
import { t } from '../i18n.js';

const KEY = 'sh-tutorial-done';

const ETAPES = [
  {
    id: 'jauges',
    ancre: '#dashboard',
    position: 'bottom',
    titre: 'Tes 6 ressources',
    titreEn: 'Your 6 resources',
    texte: 'Budget, masse, puissance, données, communications, durée. Chaque décision dans l\'Atelier les modifie. Dépasser une jauge coûte des points au bilan.',
    texteEn: 'Budget, mass, power, data, communications, duration. Each workshop choice changes them. Exceeding a gauge costs points on the debrief.',
    trigger: 'immediate'   // affiché dès l'entrée en jeu
  },
  {
    id: 'atelier',
    ancre: '#episode',
    position: 'left',
    titre: 'L\'Atelier',
    titreEn: 'The workshop',
    texte: 'Choisis un composant par famille. Le CubeSat 3D en fond se construit à mesure. Surveille la masse totale avant de valider.',
    texteEn: 'Pick one component per family. The 3D CubeSat builds up as you choose. Watch total mass before you validate.',
    trigger: 'atelier'     // épisode atelier
  },
  {
    id: 'lancement',
    ancre: '#episode',
    position: 'left',
    titre: 'Avant de lancer',
    titreEn: 'Before launch',
    texte: 'Si le CML demandé n\'est pas à 80 % de vert, ASTRA le signale. Le compte à rebours reste disponible, et le bilan en tiendra compte.',
    texteEn: 'If the required CML is not 80% green, ASTRA says so. The countdown stays available, and the debrief will count it.',
    trigger: 'lancement'   // épisode lancement
  },
  {
    id: 'orbite',
    ancre: '#vue3d',
    position: 'top',
    titre: 'Explorer la vue 3D',
    titreEn: 'Explore the 3D view',
    texte: 'Clique et glisse pour faire pivoter la Terre. Molette ou Q/E pour zoomer. Clique sur le CubeSat pour voir sa télémétrie.',
    texteEn: 'Click and drag to turn the Earth. Scroll or Q/E to zoom. Click the CubeSat to read its telemetry.',
    trigger: 'orbite'      // après orbite atteinte
  }
];

function etapeDone(id) {
  try {
    const done = JSON.parse(localStorage.getItem(KEY) || '[]');
    return done.includes(id);
  } catch { return false; }
}

function markDone(id) {
  try {
    const done = JSON.parse(localStorage.getItem(KEY) || '[]');
    if (!done.includes(id)) done.push(id);
    localStorage.setItem(KEY, JSON.stringify(done));
  } catch { /* quota */ }
}

function resetAll() {
  localStorage.removeItem(KEY);
}

let _activeTooltip = null;

function showTooltip(etape) {
  if (_activeTooltip) {
    clearTimeout(_activeTooltip._timer);
    _activeTooltip.remove();
    _activeTooltip = null;
  }
  if (!settingsStore.get('tutorial')) return;
  if (etapeDone(etape.id)) return;

  const ancre = document.querySelector(etape.ancre);
  if (!ancre) return;

  const tip = document.createElement('div');
  tip.className = `sh-tooltip sh-tooltip--${etape.position}`;
  tip.setAttribute('role', 'tooltip');
  tip.innerHTML = `
    <div class="sh-tooltip-inner">
      <div class="sh-tooltip-header">
        <span class="sh-tooltip-titre">${t(etape.titre, etape.titreEn)}</span>
        <button type="button" class="sh-tooltip-close" aria-label="${t('Fermer', 'Close')}">
          ${icon('close', 14)}
        </button>
      </div>
      <p class="sh-tooltip-texte">${t(etape.texte, etape.texteEn)}</p>
      <div class="sh-tooltip-footer">
        <span class="sh-tooltip-step">${icon('info', 13)} ${t('Astuce', 'Tip')}</span>
        <button type="button" class="sh-tooltip-ok">
          ${t('Compris', 'Got it')} ${icon('check', 14)}
        </button>
      </div>
    </div>
    <div class="sh-tooltip-arrow" aria-hidden="true"></div>
  `;

  document.body.appendChild(tip);
  _activeTooltip = tip;

  // Positionnement relatif à l'ancre
  function place() {
    const ar = ancre.getBoundingClientRect();
    const tr = tip.getBoundingClientRect();
    const gap = 10;
    let top, left;

    if (etape.position === 'bottom') {
      top  = ar.bottom + gap;
      left = ar.left + ar.width / 2 - tr.width / 2;
    } else if (etape.position === 'top') {
      top  = ar.top - tr.height - gap;
      left = ar.left + ar.width / 2 - tr.width / 2;
    } else { // left
      top  = ar.top + ar.height / 2 - tr.height / 2;
      left = ar.left - tr.width - gap;
    }

    // Éviter les débordements
    left = Math.max(8, Math.min(left, window.innerWidth - tr.width - 8));
    top  = Math.max(8, Math.min(top,  window.innerHeight - tr.height - 8));

    tip.style.left = `${left}px`;
    tip.style.top  = `${top}px`;
  }

  // Attendre un frame pour que le tooltip soit rendu et ait une taille
  requestAnimationFrame(() => {
    requestAnimationFrame(place);
  });

  function close() {
    clearTimeout(tip._timer);
    markDone(etape.id);
    if (_activeTooltip !== tip) return;
    tip.classList.add('is-out');
    setTimeout(() => {
      tip.remove();
      if (_activeTooltip === tip) _activeTooltip = null;
    }, 300);
  }

  tip.querySelector('.sh-tooltip-close').addEventListener('click', close);
  tip.querySelector('.sh-tooltip-ok').addEventListener('click', close);

  // Fermeture automatique après 12 s
  tip._timer = setTimeout(close, 12000);
}

/** Retire l'astuce affichée, sans la marquer comme lue. */
export function dismissTutorial() {
  if (!_activeTooltip) return;
  clearTimeout(_activeTooltip._timer);
  _activeTooltip.remove();
  _activeTooltip = null;
}

/** Appelé depuis main.js à chaque changement d'épisode et à l'événement orbite-atteinte. */
export function tutorialStep(trigger) {
  const etape = ETAPES.find(e => e.trigger === trigger);
  if (etape) showTooltip(etape);
}

export function resetTutorial() { resetAll(); }
