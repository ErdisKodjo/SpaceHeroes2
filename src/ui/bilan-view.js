// Écran Bilan post-mission (Sprint 4).
// Overlay plein écran par-dessus la scène 3D : score animé, médaille,
// radar des 6 ressources, décisions, mission NASA, badges.

import { settingsStore } from '../engine/settings-store.js';
import { icon, medalIcon } from './icons.js';

const MEDAILLES = {
  or:     { label: 'Médaille d\'or',    classe: 'is-or' },
  argent: { label: 'Médaille d\'argent', classe: 'is-argent' },
  bronze: { label: 'Médaille de bronze', classe: 'is-bronze' },
  null:   { label: 'Sans médaille',     classe: 'is-aucune' }
};

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function radarSvg(ressources) {
  const cx = 110;
  const cy = 110;
  const rayon = 78;
  const n = ressources.length || 6;
  const point = (i, scale) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    return [
      cx + Math.cos(angle) * rayon * scale,
      cy + Math.sin(angle) * rayon * scale
    ];
  };
  const grille = [0.33, 0.66, 1].map((scale) => {
    const pts = ressources.map((_, i) => point(i, scale).join(',')).join(' ');
    return `<polygon class="sh-bilan-radar-grille" points="${pts}" />`;
  }).join('');
  const axes = ressources.map((_, i) => {
    const [x, y] = point(i, 1);
    return `<line class="sh-bilan-radar-axe" x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" />`;
  }).join('');
  const data = ressources.map((r, i) => {
    const ratio = r.max > 0 ? Math.min(1, Math.max(0, r.used / r.max)) : 0;
    return point(i, ratio).join(',');
  }).join(' ');
  const labels = ressources.map((r, i) => {
    const [x, y] = point(i, 1.28);
    return `<text class="sh-bilan-radar-label" x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle">${esc(r.label)}</text>`;
  }).join('');
  return `
    <svg class="sh-bilan-radar" viewBox="0 0 220 220" role="img" aria-label="Consommation des six ressources">
      ${grille}
      ${axes}
      <polygon class="sh-bilan-radar-data" points="${data}" />
      ${labels}
    </svg>
  `;
}

export function createBilanView({ rapport, astraTexte, onRejouer, onSuivante, onQuitter } = {}) {
  const root = document.createElement('div');
  root.id = 'sh-bilan-root';
  document.body.appendChild(root);
  document.body.classList.add('is-bilan');

  const medal = MEDAILLES[rapport.medaille] || MEDAILLES.null;
  const medalHtml = medalIcon(rapport.score);
  const suivants = rapport.chapitreSuivant;
  const labelSuivant = suivants ? 'Mission suivante' : 'Retour au QG';
  const badges = rapport.badges.map((b) => `
    <li class="sh-bilan-badge ${b.obtenu ? 'is-on' : 'is-off'}">
      ${icon(b.obtenu ? 'badge' : 'lock', 16, { cls: 'sh-bilan-badge-icon' })}
      <div>
        <span class="sh-bilan-badge-nom">${esc(b.nom)}</span>
        <span class="sh-bilan-badge-texte">${esc(b.texte)}</span>
      </div>
    </li>
  `).join('');

  const parts = rapport.parts.map((p) => `
    <div class="sh-bilan-part">
      <div class="sh-bilan-part-label"><span>${esc(p.label)}</span><span>${p.points}/${p.max}</span></div>
      <div class="sh-bilan-part-track"><div class="sh-bilan-part-fill" style="width:${Math.max(0, Math.min(100, (p.points / p.max) * 100))}%"></div></div>
    </div>
  `).join('');

  const decisions = rapport.decisions.map((d) => `
    <article class="sh-bilan-decision">
      <h3>${esc(d.titre)}</h3>
      <p class="sh-bilan-decision-choix">${esc(d.choix)}</p>
      <p>${esc(d.consequence)}</p>
      ${d.siTuAvaisChoisi ? `<p class="sh-bilan-alt"><strong>Si tu avais choisi ${esc(d.siTuAvaisChoisi)}.</strong> ${esc(d.alors || '')}</p>` : ''}
    </article>
  `).join('');

  const ref = rapport.nasa.reference;
  const proches = (rapport.nasa.proches || []).map((m) => `<li>${esc(m.nom)} · ${esc(m.annee)}</li>`).join('');

  root.innerHTML = `
    <div class="sh-bilan-overlay">
      <div class="sh-bilan-panel">
        <header class="sh-bilan-header">
          <p class="sh-bilan-kicker">Bilan de mission${rapport.gmatLigne ? ` · ${esc(rapport.gmatLigne)}` : ''}</p>
          <h2>${esc(rapport.titre)}</h2>
          <span class="sh-bilan-medal ${medal.classe}">
            ${medalHtml} ${esc(medal.label)}
          </span>
        </header>

        <div class="sh-bilan-score-block">
          <div class="sh-bilan-score" aria-live="polite">
            <span id="sh-bilan-compteur">0</span>
            <small>/ 100</small>
          </div>
          <div class="sh-bilan-parts">${parts}</div>
        </div>

        <section class="sh-bilan-grid">
          <div>
            <h3 class="sh-bilan-section">Ressources consommées</h3>
            ${radarSvg(rapport.ressources)}
            <ul class="sh-bilan-ressources">
              ${rapport.ressources.map((r) => `
                <li class="is-${esc(r.status)}">
                  <span>${esc(r.label)}</span>
                  <span>${Number(r.used.toFixed(1))} / ${r.max}</span>
                </li>
              `).join('')}
            </ul>
          </div>
          <div>
            <h3 class="sh-bilan-section">Trois décisions</h3>
            ${decisions}
          </div>
        </section>

        <section class="sh-bilan-nasa">
          <h3 class="sh-bilan-section">Dans la vraie vie</h3>
          <p class="sh-bilan-equivalence">${esc(rapport.nasa.phrase)}</p>
          ${ref ? `<p>${esc(ref.agence)} · ${esc(ref.annee)}. ${esc(ref.resume)}</p>` : ''}
          ${proches ? `<ul class="sh-bilan-proches">${proches}</ul>` : ''}
        </section>

        <section>
          <h3 class="sh-bilan-section">Badges · ${rapport.jetons} jeton${rapport.jetons > 1 ? 's' : ''} d'atelier</h3>
          <ul class="sh-bilan-badges">${badges}</ul>
        </section>

        <blockquote class="sh-bilan-astra">${esc(astraTexte || '')}</blockquote>

        <div class="sh-bilan-actions">
          <button type="button" id="sh-bilan-rejouer">Rejouer</button>
          <button type="button" id="sh-bilan-suivant">${esc(labelSuivant)}</button>
          <button type="button" class="is-quiet" id="sh-bilan-qg">QG de mission</button>
        </div>
      </div>
    </div>
  `;

  const reduce = settingsStore.get('reduceMotion')
    || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const compteur = root.querySelector('#sh-bilan-compteur');
  let raf = 0;
  if (reduce) {
    compteur.textContent = String(rapport.score);
  } else {
    const debut = performance.now();
    const duree = 1200;
    const tick = (now) => {
      const t = Math.min(1, (now - debut) / duree);
      const eased = 1 - (1 - t) ** 3;
      compteur.textContent = String(Math.round(rapport.score * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  }

  root.querySelector('#sh-bilan-rejouer').addEventListener('click', () => onRejouer?.());
  root.querySelector('#sh-bilan-suivant').addEventListener('click', () => {
    if (suivants) onSuivante?.(suivants);
    else onQuitter?.();
  });
  root.querySelector('#sh-bilan-qg').addEventListener('click', () => onQuitter?.());

  return {
    dispose() {
      cancelAnimationFrame(raf);
      document.body.classList.remove('is-bilan');
      root.remove();
    }
  };
}
