// Ecran de sélection du rôle — affiché avant chaque mission.
// Permet aussi de saisir un nom de joueur.

import { playerStore } from '../engine/player.js';

export function createRoleSelect({ onConfirm } = {}) {
  const roles = playerStore.getRoles();

  const overlay = document.createElement('div');
  overlay.id = 'sh-role-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Sélection du rôle');
  document.body.appendChild(overlay);

  let selectedId = playerStore.roleId;

  function render() {
    overlay.innerHTML = `
      <div class="sh-role-panel">
        <div class="sh-role-header">
          <div class="sh-role-kicker">NASA SPACE HEROES</div>
          <h1 class="sh-role-title">Choisissez votre rôle</h1>
          <p class="sh-role-sub">En solo, ASTRA assure les trois autres postes.</p>
        </div>

        <div class="sh-role-name-row">
          <label class="sh-role-name-label" for="sh-player-name">Nom du commandant</label>
          <input id="sh-player-name" class="sh-role-name-input" type="text"
            maxlength="24" placeholder="Commandant…"
            value="${playerStore.nom}">
        </div>

        <div class="sh-role-cards">
          ${roles.map(r => `
            <button type="button"
              class="sh-role-card ${r.id === selectedId ? 'is-selected' : ''}"
              data-role="${r.id}"
              style="--role-color: ${r.couleur}"
              aria-pressed="${r.id === selectedId}">
              <div class="sh-role-card-emoji">${r.emoji}</div>
              <div class="sh-role-card-sigle">${r.sigle}</div>
              <div class="sh-role-card-nom">${r.nom}</div>
              <div class="sh-role-card-desc">${r.description}</div>
              <div class="sh-role-card-bonus">
                <span class="sh-role-card-comp">${r.competence}</span>
              </div>
            </button>
          `).join('')}
        </div>

        <div class="sh-role-footer">
          <button type="button" class="sh-role-confirm" id="sh-role-confirm">
            CONFIRMER ET LANCER LA MISSION →
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
