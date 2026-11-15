// QG de Mission — écran d'accueil et hub de navigation.
// S'affiche par-dessus la scène 3D (Terre en fond).
// Flow : Hub → Sélection du rôle → Jeu

import { playerStore } from '../engine/player.js';
import { chapitresOuverts } from '../engine/mode-jeu.js';
import { createRoleSelect } from './role-select.js';
import { createTableLobby } from './table-lobby.js';
import { createSettings } from './settings.js';
import { icon, medalIcon } from './icons.js';
import { pick, t, tf } from '../i18n.js';

const CHAPTER_ICONS = {
  chapitre_01: 'satellite',
  chapitre_02: 'storm',
  chapitre_03: 'moon_dest',
  chapitre_04: 'mars_dest',
  chapitre_05: 'lagrange',
  chapitre_06: 'orbit',
  chapitre_07: 'orbit',
  chapitre_08: 'orbit'
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
    description: 'Approche à 66 400 km de la Lune. Pas une capture.',
    descriptionEn: 'Approach within 66,400 km of the Moon. Not a capture.',
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
    description: 'Halo autour de L1. Quatre corrections par an : une hypothèse, pas une mesure.',
    descriptionEn: 'Halo about L1. Four corrections a year: a hypothesis, not a measurement.',
    destination: 'L1 soleil-Terre',
    destinationEn: 'Sun-Earth L1',
    emoji: '☀️',
    locked: true
  },
  {
    id: 'chapitre_06',
    num: '06',
    titre: 'Les deux pôles',
    titreEn: 'Both poles',
    sousTitre: 'Orbite polaire',
    sousTitreEn: 'Polar orbit',
    description: '500 km, inclinaison 90°. Un tour en 94,5 min. Svalbard voit environ 15 passages par jour.',
    descriptionEn: '500 km, 90° inclination. One revolution in 94.5 min. Svalbard sees about 15 passes a day.',
    destination: 'Pôles',
    destinationEn: 'The poles',
    emoji: '🧊',
    locked: true
  },
  {
    id: 'chapitre_07',
    num: '07',
    titre: 'Un tour par jour',
    titreEn: 'One revolution a day',
    sousTitre: 'Orbite haute',
    sousTitreEn: 'High orbit',
    description: '35 786 km, inclinaison 28°. Un tour en 1 436 min. Pour ce départ, Canberra voit 790 min. Kourou et Goldstone, rien.',
    descriptionEn: '35,786 km, 28° inclination. One revolution in 1,436 min. For this departure, Canberra sees 790 min. Kourou and Goldstone see none.',
    destination: 'Orbite haute',
    destinationEn: 'High orbit',
    emoji: '📡',
    locked: true
  },
  {
    id: 'chapitre_08',
    num: '08',
    titre: 'Le point fixe',
    titreEn: 'The fixed point',
    sousTitre: 'Géostationnaire',
    sousTitreEn: 'Geostationary',
    description: '35 786 km, inclinaison 0,01°. Un tour en 1 436 min. Pour ce départ, Canberra seul, 1 440 min sans coupure.',
    descriptionEn: '35,786 km, 0.01° inclination. One revolution in 1,436 min. For this departure, Canberra alone, 1,440 min without a break.',
    destination: 'Géostationnaire',
    destinationEn: 'Geostationary',
    emoji: '🌐',
    locked: true
  }
];

function etatChapitre(ch, index) {
  const prevId = index === 0 ? null : CHAPTERS[index - 1].id;
  const locked = !chapitresOuverts() && index > 0 && playerStore.getMeilleurScore(prevId) === null;
  return { ...ch, locked, best: playerStore.getMeilleurScore(ch.id) };
}

const LIEUX_TERRE = {
  chapitre_01: ['Basse', 'Low'],
  chapitre_02: ['Héliosynchrone', 'Sun-synchronous'],
  chapitre_06: ['Pôles', 'Poles'],
  chapitre_07: ['Haute', 'High'],
  chapitre_08: ['GEO', 'GEO']
};

function boutonLieu(ch, lieu) {
  const nom = Array.isArray(lieu) ? t(lieu[0], lieu[1]) : lieu;
  const titre = ch.locked
    ? t('Terminez le chapitre précédent pour débloquer', 'Finish the previous chapter to unlock')
    : pick(ch, 'titre');
  return `
    <button type="button"
      class="sh-hub-lieu ${ch.locked ? 'is-locked' : ''}"
      data-chapter="${ch.id}"
      ${ch.locked ? 'disabled' : ''}
      title="${esc(titre)}">
      <span class="sh-hub-lieu-nom">${esc(nom)}</span>
      <span class="sh-hub-lieu-ch">${ch.locked ? '' : ch.num}</span>
    </button>
  `;
}

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function buildCarte(etats) {
  const parId = new Map(etats.map((ch) => [ch.id, ch]));
  const terre = ['chapitre_01', 'chapitre_02', 'chapitre_06', 'chapitre_07', 'chapitre_08']
    .map((id) => boutonLieu(parId.get(id), LIEUX_TERRE[id]))
    .join('');
  return `
    <section class="sh-hub-carte" aria-label="${t('Carte du système solaire', 'Solar system map')}">
      <p class="sh-hub-carte-note">${t('Schéma, pas à l\'échelle. Un lieu ouvert lance le chapitre.', 'Schematic, not to scale. An open place starts the chapter.')}</p>
      <div class="sh-hub-carte-ligne">
        <span class="sh-hub-astre is-soleil">${t('Soleil', 'Sun')}</span>
        <span class="sh-hub-carte-trait"></span>
        ${boutonLieu(parId.get('chapitre_05'), t('L1', 'L1'))}
        <span class="sh-hub-carte-trait"></span>
        <div class="sh-hub-terre">
          <span class="sh-hub-astre is-terre">${t('Terre', 'Earth')}</span>
          <div class="sh-hub-terre-lieux">${terre}</div>
        </div>
        <span class="sh-hub-carte-trait"></span>
        ${boutonLieu(parId.get('chapitre_03'), t('Lune', 'Moon'))}
        <span class="sh-hub-carte-trait"></span>
        ${boutonLieu(parId.get('chapitre_04'), t('Mars', 'Mars'))}
      </div>
    </section>
  `;
}

function buildHTML(savedGame) {
  const role = playerStore.role;
  const nom  = playerStore.nom;
  const etats = CHAPTERS.map(etatChapitre);

  const cards = etats.map((ch) => {
    const medalHtml = ch.best !== null ? medalIcon(ch.best) : '';
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
        ${ch.best !== null ? `<div class="sh-hub-card-best">${medalHtml} ${ch.best} ${t('pts', 'pts')}</div>` : ''}
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

          ${buildCarte(etats)}

          <!-- Cartes chapitres -->
          <div class="sh-hub-cards">
            ${cards}
          </div>

        </div><!-- /.sh-hub-body -->

        <!-- PIED -->
        <footer class="sh-hub-footer">
          <button type="button" class="sh-hub-btn-role" id="sh-hub-table">
            ${t('Partie à 4', 'Party of 4')}
          </button>
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
    container.querySelectorAll('.sh-hub-card:not(.is-locked), .sh-hub-lieu:not(.is-locked)').forEach(btn => {
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

    container.querySelector('#sh-hub-table').addEventListener('click', () => {
      createTableLobby({
        chapters: CHAPTERS.map(etatChapitre),
        onDepart: ({ chapterId }) => {
          container.remove();
          onStartMission?.({ chapterId, restore: false, table: true });
        }
      });
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
