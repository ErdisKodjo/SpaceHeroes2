// QG de Mission — écran d'accueil et hub de navigation.
// S'affiche par-dessus la scène 3D (Terre en fond).
// Flow : Hub → Sélection du rôle → Jeu

import { playerStore } from '../engine/player.js';
import { createRoleSelect } from './role-select.js';
import { createSettings } from './settings.js';

// Chapitres disponibles (à terme chargés dynamiquement).
// Verrouillé = nécessite d'avoir terminé le chapitre précédent.
const CHAPTERS = [
  {
    id: 'chapitre_01',
    num: '01',
    titre: 'Le premier signal',
    sousTitre: 'CubeSat · Orbite basse',
    description: 'Lance ton tout premier satellite. ASTRA t\'accompagne pas à pas.',
    destination: 'Terre basse',
    emoji: '🛰️',
    locked: false
  },
  {
    id: 'chapitre_02',
    num: '02',
    titre: 'L\'œil du cyclone',
    sousTitre: 'Météo · Héliosynchrone',
    description: 'Un satellite météorologique en orbite polaire pour surveiller les tempêtes.',
    destination: 'Orbite polaire',
    emoji: '🌪️',
    locked: true
  },
  {
    id: 'chapitre_03',
    num: '03',
    titre: 'Retour sur la Lune',
    sousTitre: 'Orbiteur · Lune',
    description: 'Cartographie la surface lunaire depuis une orbite de 100 km.',
    destination: 'Lune',
    emoji: '🌕',
    locked: true
  },
  {
    id: 'chapitre_04',
    num: '04',
    titre: 'Signal de Mars',
    sousTitre: 'Sonde · Mars',
    description: 'Une fenêtre de lancement tous les 26 mois. Ne la rate pas.',
    destination: 'Mars',
    emoji: '🔴',
    locked: true
  },
  {
    id: 'chapitre_05',
    num: '05',
    titre: 'Le Gardien',
    sousTitre: 'Halo orbit · L1',
    description: 'Surveille les tempêtes solaires depuis le point de Lagrange L1.',
    destination: 'L1 soleil-Terre',
    emoji: '☀️',
    locked: true
  }
];

function buildHTML() {
  const role = playerStore.role;
  const nom  = playerStore.nom;

  const cards = CHAPTERS.map(ch => {
    const best  = playerStore.getMeilleurScore(ch.id);
    const medal = best >= 85 ? '🥇' : best >= 70 ? '🥈' : best >= 50 ? '🥉' : '';
    return `
      <button type="button"
        class="sh-hub-card ${ch.locked ? 'is-locked' : ''}"
        data-chapter="${ch.id}"
        ${ch.locked ? 'aria-disabled="true"' : ''}
        title="${ch.locked ? 'Terminez le chapitre précédent pour débloquer' : ch.titre}">
        <div class="sh-hub-card-num">${ch.locked ? '🔒' : ch.num}</div>
        <div class="sh-hub-card-emoji">${ch.locked ? '' : ch.emoji}</div>
        <div class="sh-hub-card-titre">${ch.titre}</div>
        <div class="sh-hub-card-sub">${ch.sousTitre}</div>
        <div class="sh-hub-card-dest">${ch.destination}</div>
        ${best !== null ? `<div class="sh-hub-card-best">${medal} ${best} pts</div>` : ''}
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
              ${role.emoji} ${role.sigle}
            </span>
            <span class="sh-hub-nom">${nom}</span>
            <button type="button" class="sh-hub-btn-icon" id="sh-hub-settings"
              title="Paramètres" aria-label="Ouvrir les paramètres">⚙️</button>
          </div>
        </header>

        <!-- CORPS -->
        <div class="sh-hub-body">

          <!-- Message ASTRA -->
          <div class="sh-hub-astra">
            <div class="sh-hub-astra-dot"></div>
            <p class="sh-hub-astra-text">
              Bienvenue, <strong>${nom}</strong>. Choisissez votre prochaine mission.
              L'univers attend.
            </p>
          </div>

          <!-- Cartes chapitres -->
          <div class="sh-hub-cards">
            ${cards}
          </div>

        </div><!-- /.sh-hub-body -->

        <!-- PIED -->
        <footer class="sh-hub-footer">
          <button type="button" class="sh-hub-btn-role" id="sh-hub-change-role">
            Changer de rôle
          </button>
        </footer>

      </div><!-- /.sh-hub-panel -->
    </div><!-- /.sh-hub-overlay -->
  `;
}

export function createHub({ onStartMission } = {}) {
  const container = document.createElement('div');
  container.id = 'sh-hub-root';
  document.body.appendChild(container);

  function render() {
    container.innerHTML = buildHTML();
    bindEvents();
  }

  function bindEvents() {
    // Cartes de chapitre
    container.querySelectorAll('.sh-hub-card:not(.is-locked)').forEach(btn => {
      btn.addEventListener('click', () => {
        const chapterId = btn.dataset.chapter;
        startMission(chapterId);
      });
    });

    // Paramètres
    container.querySelector('#sh-hub-settings').addEventListener('click', () => {
      createSettings({ onClose: render });
    });

    // Changer de rôle
    container.querySelector('#sh-hub-change-role').addEventListener('click', () => {
      createRoleSelect({
        onConfirm: () => render()
      });
    });
  }

  function startMission(chapterId) {
    // Montrer l'écran de sélection du rôle, puis lancer la mission
    createRoleSelect({
      onConfirm: ({ roleId, nom }) => {
        container.remove();
        onStartMission?.({ chapterId, roleId, nom });
      }
    });
  }

  render();

  return {
    dispose() { container.remove(); }
  };
}
