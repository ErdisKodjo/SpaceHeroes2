// Tutoriel guidé — 4 étapes contextuelles (Sprint 5).
// Désactivable via Paramètres → Mode de jeu → Tutoriel.
// Chaque étape est un tooltip ancré sur un élément DOM existant.
// Stocké dans localStorage 'sh-tutorial' pour ne pas réafficher.

import { settingsStore } from '../engine/settings-store.js';
import { icon } from './icons.js';

const KEY = 'sh-tutorial-done';

const ETAPES = [
  {
    id: 'jauges',
    ancre: '#dashboard',
    position: 'bottom',
    titre: 'Tes 6 ressources',
    texte: 'Budget, masse, puissance, données, communications, durée. Chaque décision dans l\'Atelier les modifie en temps réel. Dépasser une jauge coûte des points.',
    trigger: 'immediate'   // affiché dès l'entrée en jeu
  },
  {
    id: 'atelier',
    ancre: '#episode',
    position: 'left',
    titre: 'L\'Atelier',
    texte: 'Choisis un composant par famille. Le CubeSat 3D en fond se construit à mesure que tu sélectionnes. Surveille la masse totale avant de valider.',
    trigger: 'atelier'     // épisode atelier
  },
  {
    id: 'lancement',
    ancre: '#episode',
    position: 'left',
    titre: 'Avant de lancer',
    texte: 'ASTRA vérifiera les critères CML avant d\'autoriser le compte à rebours. Si une marge est trop serrée, elle t\'arrêtera.',
    trigger: 'lancement'   // épisode lancement
  },
  {
    id: 'orbite',
    ancre: '#vue3d',
    position: 'top',
    titre: 'Explorer la vue 3D',
    texte: 'Clique et glisse pour faire pivoter la Terre. Molette ou Q/E pour zoomer. Clique sur le CubeSat pour voir sa télémétrie en temps réel.',
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
  if (_activeTooltip) _activeTooltip.remove();
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
        <span class="sh-tooltip-titre">${etape.titre}</span>
        <button type="button" class="sh-tooltip-close" aria-label="Fermer">
          ${icon('close', 14)}
        </button>
      </div>
      <p class="sh-tooltip-texte">${etape.texte}</p>
      <div class="sh-tooltip-footer">
        <span class="sh-tooltip-step">${icon('info', 13)} Astuce</span>
        <button type="button" class="sh-tooltip-ok">
          Compris ${icon('check', 14)}
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
    markDone(etape.id);
    tip.classList.add('is-out');
    setTimeout(() => { tip.remove(); _activeTooltip = null; }, 300);
  }

  tip.querySelector('.sh-tooltip-close').addEventListener('click', close);
  tip.querySelector('.sh-tooltip-ok').addEventListener('click', close);

  // Fermeture automatique après 12 s
  const autoClose = setTimeout(close, 12000);
  tip.querySelector('.sh-tooltip-close').addEventListener('click', () => clearTimeout(autoClose), { once: true });
}

/** Appelé depuis main.js à chaque changement d'épisode et à l'événement orbite-atteinte. */
export function tutorialStep(trigger) {
  const etape = ETAPES.find(e => e.trigger === trigger);
  if (etape) showTooltip(etape);
}

export function resetTutorial() { resetAll(); }
