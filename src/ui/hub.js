// QG de Mission — écran d'accueil et hub de navigation.
// S'affiche par-dessus la scène 3D (Terre en fond).
// Flow : Hub → Sélection du rôle → Jeu

import { playerStore } from '../engine/player.js';
import { createRoleSelect } from './role-select.js';
import { createSettings } from './settings.js';
import { icon, medalIcon } from './icons.js';
import { pick, t, tf } from '../i18n.js';

const CHAPTER_ICONS = {
  chapitre_01: 'satellite',
  chapitre_02: 'storm',
  chapitre_03: 'moon_dest',
  chapitre_04: 'mars_dest',
  chapitre_05: 'lagrange'
};

// Chapitres disponibles (à terme chargés dynamiquement).
// Verrouillé = nécessite d'avoir terminé le chapitre précédent.
const CHAPTERS = [
  {
    id: 'chapitre_01',
    num: '01',
    titre: 'Le premier signal',
    titreEn: 'The first signal',
    sousTitre: 'CubeSat · Orbite basse',
    sousTitreEn: 'CubeSat · Low Earth orbit',
    description: 'Lance ton tout premier satellite. ASTRA t\'accompagne pas à pas.',
    descriptionEn: 'Launch your first satellite. ASTRA walks you through it.',
    destination: 'Terre basse',
    destinationEn: 'Low Earth',
    emoji: '🛰️',
    locked: false
  },
  {
    id: 'chapitre_02',
    num: '02',
    titre: 'L\'œil du cyclone',
    titreEn: 'Eye of the storm',
    sousTitre: 'Météo · Héliosynchrone',
    sousTitreEn: 'Weather · Sun-synchronous',
    description: 'Un satellite météorologique en orbite polaire pour surveiller les tempêtes.',
    descriptionEn: 'A weather satellite in polar orbit to watch the storms.',
    destination: 'Orbite polaire',
    destinationEn: 'Polar orbit',
    emoji: '🌪️',
    locked: true
  },
  {
    id: 'chapitre_03',
    num: '03',
    titre: 'Retour sur la Lune',
    titreEn: 'Return to the Moon',
    sousTitre: 'Orbiteur · Lune',
    sousTitreEn: 'Orbiter · Moon',
    description: 'Cartographie la surface lunaire depuis une orbite de 100 km.',
    descriptionEn: 'Map the lunar surface from a 100 km orbit.',
    destination: 'Lune',
    destinationEn: 'Moon',
    emoji: '🌕',
    locked: true
  },
  {
    id: 'chapitre_04',
    num: '04',
    titre: 'Signal de Mars',
    titreEn: 'Signal from Mars',
    sousTitre: 'Sonde · Mars',
    sousTitreEn: 'Probe · Mars',
    description: 'Prochaine fenêtre : début décembre 2026. Ensuite, 26 mois d\'attente.',
    descriptionEn: 'Next window: early December 2026. Then a 26-month wait.',
    destination: 'Mars',
    emoji: '🔴',
    locked: true
  },
  {
    id: 'chapitre_05',
    num: '05',
    titre: 'Le Gardien',
    titreEn: 'The Guardian',
    sousTitre: 'Halo orbit · L1',
    sousTitreEn: 'Halo orbit · L1',
    description: 'Surveille les tempêtes solaires depuis le point de Lagrange L1.',
    descriptionEn: 'Watch solar storms from the Sun-Earth L1 point.',
    destination: 'L1 soleil-Terre',
    destinationEn: 'Sun-Earth L1',
    emoji: '☀️',
    locked: true
  }
];

function buildHTML(savedGame) {
  const role = playerStore.role;
  const nom  = playerStore.nom;

  const cards = CHAPTERS.map((ch, index) => {
    const prevId = index === 0 ? null : CHAPTERS[index - 1].id;
    const locked = index > 0 && playerStore.getMeilleurScore(prevId) === null;
    ch = { ...ch, locked };
    const best  = playerStore.getMeilleurScore(ch.id);
    const medalHtml = best !== null ? medalIcon(best) : '';
    return `
      <button type="button"
        class="sh-hub-card ${ch.locked ? 'is-locked' : ''}"
        data-chapter="${ch.id}"
        ${ch.locked ? 'aria-disabled="true"' : ''}
        title="${ch.locked ? t('Terminez le chapitre précédent pour débloquer', 'Finish the previous chapter to unlock') : pick(ch, 'titre')}">
        <div class="sh-hub-card-num">
          ${ch.locked ? icon('lock', 14) : ch.num}
        </div>
        <div class="sh-hub-card-emoji">
          ${ch.locked ? '' : icon(CHAPTER_ICONS[ch.id] ?? 'satellite', 28, { label: pick(ch, 'titre') })}
        </div>
        <div class="sh-hub-card-titre">${pick(ch, 'titre')}</div>
        <div class="sh-hub-card-sub">${pick(ch, 'sousTitre')}</div>
        <div class="sh-hub-card-dest">${icon('compass', 11)} ${pick(ch, 'destination')}</div>
        <div class="sh-hub-card-desc">${pick(ch, 'description')}</div>
        ${best !== null ? `<div class="sh-hub-card-best">${medalHtml} ${best} ${t('pts', 'pts')}</div>` : ''}
      </button>
    `;
  }).join('');

  return `
    <div class="sh-hub-overlay">
      <div class="sh-hub-panel">

        <!-- EN-TÊTE -->
        <header class="sh-hub-header">
          <div class="sh-hub-logo">
            <span class="sh-hub-kicker">NASA SPACE APPS CHALLENGE</span>
            <span class="sh-hub-brand">SPACE HEROES</span>
          </div>
          <div class="sh-hub-profile">
            <span class="sh-hub-role-badge" style="color:${role.couleur}">
              ${icon('user', 14)} ${role.sigle}
            </span>
            <span class="sh-hub-nom">${nom}</span>
            <button type="button" class="sh-hub-btn-icon" id="sh-hub-settings"
              title="${t('Paramètres', 'Settings')}" aria-label="${t('Ouvrir les paramètres', 'Open settings')}">
              ${icon('settings', 16)}
            </button>
          </div>
        </header>

        <!-- CORPS -->
        <div class="sh-hub-body">

          <!-- Message ASTRA -->
          <div class="sh-hub-astra">
            <div class="sh-hub-astra-dot"></div>
            <p class="sh-hub-astra-text">
              ${tf(
                'Bienvenue, <strong>{nom}</strong>. Choisissez votre prochaine mission. L\'univers attend.',
                'Welcome, <strong>{nom}</strong>. Choose your next mission. The universe is waiting.',
                { nom }
              )}
            </p>
          </div>

          ${savedGame ? `
          <div class="sh-hub-save-banner">
            <span>${icon('save', 14)} ${tf('Partie en cours · sauvegardée il y a {min} min', 'Game in progress · saved {min} min ago', { min: savedGame.ageMin })}</span>
            <button type="button" class="sh-hub-btn-continue" id="sh-hub-continue">
              ${t('CONTINUER', 'CONTINUE')} ${icon('arrowRight', 14)}
            </button>
          </div>
          ` : ''}

          <!-- Cartes chapitres -->
          <div class="sh-hub-cards">
            ${cards}
          </div>

        </div><!-- /.sh-hub-body -->

        <!-- PIED -->
        <footer class="sh-hub-footer">
          <button type="button" class="sh-hub-btn-role" id="sh-hub-change-role">
            ${t('Changer de rôle', 'Change role')}
          </button>
        </footer>

      </div><!-- /.sh-hub-panel -->
    </div><!-- /.sh-hub-overlay -->
  `;
}

export function createHub({ onStartMission, savedGame = null } = {}) {
  const container = document.createElement('div');
  container.id = 'sh-hub-root';
  document.body.appendChild(container);

  function render() {
    container.innerHTML = buildHTML(savedGame);
    bindEvents();
  }

  function bindEvents() {
    // Cartes de chapitre
    container.querySelectorAll('.sh-hub-card:not(.is-locked)').forEach(btn => {
      btn.addEventListener('click', () => {
        const chapterId = btn.dataset.chapter;
        startMission(chapterId, false);
      });
    });

    // Paramètres
    container.querySelector('#sh-hub-settings').addEventListener('click', () => {
      createSettings({ onClose: render, onSaved: render });
    });

    // Continuer une partie sauvegardée
    container.querySelector('#sh-hub-continue')?.addEventListener('click', () => {
      startMission(savedGame.chapterId, true);
    });

    // Changer de rôle
    container.querySelector('#sh-hub-change-role').addEventListener('click', () => {
      createRoleSelect({
        onConfirm: () => render()
      });
    });
  }

  function startMission(chapterId, restore = false) {
    // Montrer l'écran de sélection du rôle, puis lancer la mission
    createRoleSelect({
      onConfirm: ({ roleId, nom }) => {
        container.remove();
        onStartMission?.({ chapterId, roleId, nom, restore });
      }
    });
  }

  render();

  return {
    dispose() { container.remove(); }
  };
}
