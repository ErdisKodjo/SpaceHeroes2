// Ecran de sélection du rôle — affiché avant chaque mission.

import { playerStore } from '../engine/player.js';
import { icon } from './icons.js';
import { t } from '../i18n.js';
import { roleText } from '../i18n/content.js';

const ROLE_ICONS = {
  directeur:          'director',
  ingenieur_vehicule: 'engineer',
  ingenieur_systemes: 'systems',
  responsable_science:'science'
};

export function createRoleSelect({ onConfirm } = {}) {
  const roles = playerStore.getRoles();

  const overlay = document.createElement('div');
  overlay.id = 'sh-role-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', t('Sélection du rôle', 'Role selection'));
  document.body.appendChild(overlay);

  let selectedId = playerStore.roleId;

  function render() {
    overlay.innerHTML = `
      <div class="sh-role-panel">
        <div class="sh-role-header">
          <div class="sh-role-kicker">NASA SPACE HEROES</div>
          <h1 class="sh-role-title">${t('Choisissez votre rôle', 'Choose your role')}</h1>
          <p class="sh-role-sub">${t('En solo, ASTRA assure les trois autres postes.', 'Solo, ASTRA covers the other three seats.')}</p>
        </div>

        <div class="sh-role-name-row">
          <label class="sh-role-name-label" for="sh-player-name">${t('Nom du commandant', 'Commander name')}</label>
          <input id="sh-player-name" class="sh-role-name-input" type="text"
            maxlength="24" placeholder="${t('Commandant…', 'Commander…')}"
            value="${playerStore.nom}">
        </div>

        <div class="sh-role-cards">
          ${roles.map(r => `
            <button type="button"
              class="sh-role-card ${r.id === selectedId ? 'is-selected' : ''}"
              data-role="${r.id}"
              style="--role-color: ${r.couleur}"
              aria-pressed="${r.id === selectedId}">
              <div class="sh-role-card-emoji">
                ${icon(ROLE_ICONS[r.id] ?? 'user', 32, { cls: 'sh-role-card-icon' })}
              </div>
              <div class="sh-role-card-sigle">${r.sigle}</div>
              <div class="sh-role-card-nom">${roleText(r, 'nom')}</div>
              <div class="sh-role-card-desc">${roleText(r, 'description')}</div>
              <div class="sh-role-card-bonus">
                <span class="sh-role-card-comp">${roleText(r, 'competence')}</span>
              </div>
            </button>
          `).join('')}
        </div>

        <div class="sh-role-footer">
          <button type="button" class="sh-role-confirm" id="sh-role-confirm">
            ${t('CONFIRMER ET LANCER LA MISSION', 'CONFIRM AND START THE MISSION')}
            ${icon('arrowRight', 16)}
          </button>
        </div>
      </div>
    `;
    bindEvents();
  }

  function bindEvents() {
    // Cartes de rôle
    overlay.querySelectorAll('.sh-role-card').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedId = btn.dataset.role;
        overlay.querySelectorAll('.sh-role-card').forEach(b => {
          b.classList.toggle('is-selected', b.dataset.role === selectedId);
          b.setAttribute('aria-pressed', b.dataset.role === selectedId);
        });
      });
    });

    // Bouton confirmer
    overlay.querySelector('#sh-role-confirm').addEventListener('click', () => {
      const nameInput = overlay.querySelector('#sh-player-name');
      playerStore.setNom(nameInput.value);
      playerStore.setRole(selectedId);
      overlay.remove();
      onConfirm?.({ roleId: selectedId, nom: playerStore.nom });
    });

    // Entrée clavier sur le nom
    overlay.querySelector('#sh-player-name').addEventListener('keydown', e => {
      if (e.key === 'Enter') overlay.querySelector('#sh-role-confirm').click();
    });
  }

  render();
  // Focus sur le nom par défaut
  setTimeout(() => overlay.querySelector('#sh-player-name')?.focus(), 50);

  return {
    dispose() { overlay.remove(); }
  };
}
