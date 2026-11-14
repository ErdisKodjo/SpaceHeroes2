// Rendu de l'épisode courant.
// Pour les types 'atelier', 'essais' : délègue aux vues dédiées (montées sur #sh-episode-body).
// Pour tous les autres : affiche le texte + bouton Continuer.

import { createAtelierView }    from './atelier-view.js';
import { createCmlView }         from './cml-view.js';
import { createEssaisView }      from './essais-view.js';
import { createOperationsView }  from './operations-view.js';
import { createBilanView }       from './bilan-view.js';

// Vue active montée (atelier, essais, bilan) — on la détruit quand l'épisode change.
let _activeView = null;
let _lastEpisodeId = null;

function clearActiveView() {
  _activeView?.dispose?.();
  _activeView = null;
}

export function renderEpisode(container, episodeRunner, {
  onNext, busy = false, resources, astra, cml,
  bilan = null, onRejouer, onSuivante, onQuitter
} = {}) {
  if (episodeRunner.isFinished) {
    clearActiveView();
    _lastEpisodeId = null;
    container.innerHTML = `
      <div class="plaque-kicker">Mission close</div>
      <h2>Chapitre terminé</h2>
      <p>Le rapport post-mission a été généré.</p>
    `;
    return;
  }

  const episode = episodeRunner.currentEpisode;
  const n       = String(episodeRunner.index + 1).padStart(2, '0');
  const total   = String(episodeRunner.chapter.episodes.length).padStart(2, '0');

  // Si l'épisode a changé, détruire la vue précédente
  if (episode.id !== _lastEpisodeId) {
    clearActiveView();
    _lastEpisodeId = episode.id;
  }

  // ── Atelier ──────────────────────────────────────────────────────────────
  if (episode.type === 'atelier') {
    container.innerHTML = `
      <div class="plaque-kicker">Épisode ${n} / ${total} · Atelier</div>
      <div id="sh-episode-body"></div>
    `;
    if (!_activeView) {
      _activeView = createAtelierView(
        container.querySelector('#sh-episode-body'),
        {
          resources,
          astra,
          chapterId: episodeRunner.chapter.id,
          onValider: ({ selections }) => {
            window.dispatchEvent(new CustomEvent('atelier-valide', { detail: { selections } }));
            onNext?.();
          }
        }
      );
    }
    return;
  }

  // ── Briefing — validation CML 1 ──────────────────────────────────────────
  if (episode.type === 'briefing') {
    const niv1 = cml?.snapshot()?.[0];
    const pct  = niv1 ? Math.round(niv1.ratioVert * 100) : 0;
    const label = busy ? 'Séquence en cours…' : (episode.bouton || 'Continuer →');

    container.innerHTML = `
      <div class="plaque-kicker">Épisode ${n} / ${total} · Briefing</div>
      <h2>${episode.titre}</h2>
      <p>${episode.texte}</p>
      <div id="sh-episode-body"></div>
      <button id="btn-continuer" class="cta" ${busy ? 'disabled' : ''}>${label}</button>
    `;

    // Afficher la grille CML niveau 1 en mode compact
    if (cml && !_activeView) {
      _activeView = createCmlView(
        container.querySelector('#sh-episode-body'),
        { cml, astra, onNiveauValide: () => {} }
      );
    }

    container.querySelector('#btn-continuer')
      .addEventListener('click', () => { if (!busy) onNext?.(); });
    return;
  }

  // ── Essais ───────────────────────────────────────────────────────────────
  if (episode.type === 'essais') {
    container.innerHTML = `
      <div class="plaque-kicker">Épisode ${n} / ${total} · Essais</div>
      <div id="sh-episode-body"></div>
    `;
    if (!_activeView) {
      _activeView = createEssaisView(
        container.querySelector('#sh-episode-body'),
        {
          astra,
          onValider: ({ fiabilite }) => {
            window.dispatchEvent(new CustomEvent('essais-termines', { detail: { fiabilite } }));
            onNext?.();
          }
        }
      );
    }
    return;
  }

  // ── Opérations ───────────────────────────────────────────────────────────
  if (episode.type === 'operations') {
    container.innerHTML = `
      <div class="plaque-kicker">Épisode ${n} / ${total} · Opérations</div>
      <div id="sh-episode-body"></div>
    `;
    if (!_activeView) {
      _activeView = createOperationsView(
        container.querySelector('#sh-episode-body'),
        {
          resources,
          astra,
          onValider: ({ scoreOps }) => {
            window.dispatchEvent(new CustomEvent('operations-terminees', { detail: { scoreOps } }));
            onNext?.();
          }
        }
      );
    }
    return;
  }

  // ── Bilan ────────────────────────────────────────────────────────────
  if (episode.type === 'bilan' && bilan) {
    container.innerHTML = `
      <div class="plaque-kicker">Épisode ${n} / ${total} · Bilan</div>
      <h2>${episode.titre}</h2>
      <p>Le rapport de mission est affiché.</p>
    `;
    if (!_activeView) {
      const ligne = bilan.astraKey ? astra?.say(bilan.astraKey) : null;
      _activeView = createBilanView({
        rapport: bilan,
        astraTexte: ligne?.texte || astra?.lastLine?.texte || '',
        onRejouer,
        onSuivante,
        onQuitter
      });
    }
    return;
  }

  // ── Tous les autres épisodes (lancement…) ─────────────
  clearActiveView();
  const label = busy ? 'Séquence en cours…' : (episode.bouton || 'Continuer →');

  container.innerHTML = `
    <div class="plaque-kicker">Épisode ${n} / ${total} · ${episode.type}</div>
    <h2>${episode.titre}</h2>
    <p>${episode.texte}</p>
    <button id="btn-continuer" class="cta" ${busy ? 'disabled' : ''}>${label}</button>
  `;

  container.querySelector('#btn-continuer')
    .addEventListener('click', () => { if (!busy) onNext?.(); });
}
