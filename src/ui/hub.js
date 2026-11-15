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
import { settingsStore } from '../engine/settings-store.js';
import {
  jourJulien,
  longitudeLune,
  positionEcliptique,
  traceOrbite
} from '../vis/planetaire.js';

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
    description: 'Périlune à 50 km. Capture de 0,87 km/s.',
    descriptionEn: 'Perilune at 50 km. Capture burn 0.87 km/s.',
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

const MOIS = [
  ['janvier', 'January'], ['février', 'February'], ['mars', 'March'],
  ['avril', 'April'], ['mai', 'May'], ['juin', 'June'],
  ['juillet', 'July'], ['août', 'August'], ['septembre', 'September'],
  ['octobre', 'October'], ['novembre', 'November'], ['décembre', 'December']
];

const ECHELLE = 62;
const VUE = { x: -200, y: -155, w: 400, h: 310 };

function versJour(date) {
  return jourJulien(
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate() + (date.getUTCHours() + date.getUTCMinutes() / 60) / 24
  );
}

function libelleDate(date) {
  const mois = MOIS[date.getUTCMonth()];
  return t(
    `${date.getUTCDate()} ${mois[0]} ${date.getUTCFullYear()}`,
    `${mois[1]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`
  );
}

function ecran(au) {
  return { x: au.x * ECHELLE, y: -au.y * ECHELLE };
}

function trace(points) {
  return points.map((p) => {
    const e = ecran(p);
    return `${e.x.toFixed(2)},${e.y.toFixed(2)}`;
  }).join(' ');
}

function schemaLigne(etats) {
  const parId = new Map(etats.map((ch) => [ch.id, ch]));
  const terre = ['chapitre_01', 'chapitre_02', 'chapitre_06', 'chapitre_07', 'chapitre_08']
    .map((id) => boutonLieu(parId.get(id), LIEUX_TERRE[id]))
    .join('');
  return `
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
  `;
}

function schemaPlanetaire(etats) {
  const parId = new Map(etats.map((ch) => [ch.id, ch]));
  const terre = ['chapitre_01', 'chapitre_02', 'chapitre_06', 'chapitre_07', 'chapitre_08']
    .map((id) => boutonLieu(parId.get(id), LIEUX_TERRE[id]))
    .join('');
  const mobile = (id, nom) => boutonLieu(parId.get(id), nom)
    .replace('sh-hub-lieu ', 'sh-hub-lieu sh-hub-lieu-vol ');
  return `
    <p class="sh-hub-carte-note">${t(
      'Terre et Mars suivent les éléments JPL 1800–2050. La Lune part de la nouvelle lune du 8 janvier 2008 et avance d\'un mois sidéral. Lune et L1 sont écartés : à cette échelle ils seraient sur la Terre. Un lieu ouvert lance le chapitre.',
      'Earth and Mars follow the JPL elements for 1800–2050. The Moon starts at the 8 January 2008 new moon and advances by one sidereal month. The Moon and L1 are pulled out: at this scale they would sit on the Earth. An open place starts the chapter.'
    )}</p>
    <div class="sh-hub-planetaire" id="sh-planetaire">
      <svg viewBox="${VUE.x} ${VUE.y} ${VUE.w} ${VUE.h}" aria-hidden="true">
        <polyline id="sh-orbite-terre" class="sh-orbite is-terre"></polyline>
        <polyline id="sh-orbite-mars" class="sh-orbite is-mars"></polyline>
        <circle class="sh-corps is-soleil" cx="0" cy="0" r="5"></circle>
        <circle id="sh-corps-terre" class="sh-corps is-terre" r="3.4"></circle>
        <circle id="sh-corps-lune" class="sh-corps is-lune" r="1.7"></circle>
        <circle id="sh-corps-mars" class="sh-corps is-mars" r="2.6"></circle>
      </svg>
      ${mobile('chapitre_05', t('L1', 'L1'))}
      ${mobile('chapitre_03', t('Lune', 'Moon'))}
      ${mobile('chapitre_04', t('Mars', 'Mars'))}
    </div>
    <p class="sh-hub-planetaire-date" id="sh-planetaire-date"></p>
    <div class="sh-hub-terre">
      <span class="sh-hub-astre is-terre">${t('Autour de la Terre', 'Around Earth')}</span>
      <div class="sh-hub-terre-lieux">${terre}</div>
    </div>
  `;
}

function buildCarte(etats, planetaire) {
  return `
    <section class="sh-hub-carte" aria-label="${t('Carte du système solaire', 'Solar system map')}">
      <div class="sh-hub-carte-barre">
        <button type="button" class="sh-hub-vue-carte" id="sh-hub-vue-carte" aria-pressed="${planetaire ? 'true' : 'false'}">
          ${planetaire ? t('Schéma', 'Schematic') : t('Planétaire', 'Orrery')}
        </button>
      </div>
      ${planetaire ? schemaPlanetaire(etats) : schemaLigne(etats)}
    </section>
  `;
}

function buildHTML(savedGame, planetaire) {
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

          ${buildCarte(etats, planetaire)}

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
  let battement = 0;
  let instant = new Date();
  let planetaire = false;

  function arreterPlanetaire() {
    if (battement) clearInterval(battement);
    battement = 0;
  }

  function poserPlanetaire() {
    const scene = container.querySelector('#sh-planetaire');
    if (!scene) return;
    const jd = versJour(instant);
    const terre = ecran(positionEcliptique('terre', jd));
    const mars = ecran(positionEcliptique('mars', jd));
    const lon = longitudeLune(jd);
    const lune = {
      x: terre.x + Math.cos(lon) * 18,
      y: terre.y - Math.sin(lon) * 18
    };
    const versSoleil = Math.hypot(terre.x, terre.y) || 1;
    const l1 = {
      x: terre.x - (terre.x / versSoleil) * 22,
      y: terre.y - (terre.y / versSoleil) * 22
    };
    const orbiteTerre = container.querySelector('#sh-orbite-terre');
    const orbiteMars = container.querySelector('#sh-orbite-mars');
    if (orbiteTerre) orbiteTerre.setAttribute('points', trace(traceOrbite('terre', jd)));
    if (orbiteMars) orbiteMars.setAttribute('points', trace(traceOrbite('mars', jd)));
    const corps = {
      chapitre_03: lune,
      chapitre_04: mars,
      chapitre_05: l1
    };
    scene.querySelectorAll('.sh-hub-lieu-vol').forEach((btn) => {
      const p = corps[btn.dataset.chapter];
      if (!p) return;
      btn.style.left = `${((p.x - VUE.x) / VUE.w) * 100}%`;
      btn.style.top = `${((p.y - VUE.y) / VUE.h) * 100}%`;
    });
    const point = (id, p) => {
      const el = container.querySelector(id);
      if (!el) return;
      el.setAttribute('cx', p.x.toFixed(2));
      el.setAttribute('cy', p.y.toFixed(2));
    };
    point('#sh-corps-terre', terre);
    point('#sh-corps-lune', lune);
    point('#sh-corps-mars', mars);
    const date = container.querySelector('#sh-planetaire-date');
    if (date) {
      date.textContent = settingsStore.get('reduceMotion')
        ? libelleDate(instant)
        : t(
          `${libelleDate(instant)} · un jour toutes les 0,8 s`,
          `${libelleDate(instant)} · one day every 0.8 s`
        );
    }
  }

  function lancerPlanetaire() {
    if (!planetaire) return;
    poserPlanetaire();
    if (!settingsStore.get('reduceMotion')) {
      battement = setInterval(() => {
        instant = new Date(instant.getTime() + 86400000);
        poserPlanetaire();
      }, 800);
    }
  }

  function render() {
    arreterPlanetaire();
    instant = new Date();
    container.innerHTML = buildHTML(savedGame, planetaire);
    bindEvents();
    lancerPlanetaire();
  }

  function bindEvents() {
    container.querySelector('#sh-hub-vue-carte').addEventListener('click', () => {
      planetaire = !planetaire;
      render();
    });

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
    dispose() {
      arreterPlanetaire();
      container.remove();
    }
  };
}
