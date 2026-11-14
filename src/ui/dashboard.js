import { computeSegmentStatus, SEGMENTS } from '../engine/segments.js';

const LABELS = {
  budget: 'Budget',
  masse: 'Masse',
  puissance: 'Puissance',
  donnees: 'Données',
  communications: 'Comms',
  duree: 'Durée'
};

const UNITS = {
  masse: 'kg',
  duree: 'sem'
};

export function renderDashboard(container, resourceManager, { chapter } = {}) {
  const jauges = resourceManager
    .snapshot()
    .map((r) => {
      const remaining = Math.max(0, r.remaining);
      const pct = r.max > 0 ? Math.max(0, Math.min(100, (remaining / r.max) * 100)) : 0;
      const unit = UNITS[r.key] ? ` ${UNITS[r.key]}` : '';
      return `
      <div class="hud-bar ${r.status}">
        <div class="hud-bar-meta">
          <span>${LABELS[r.key] ?? r.key}</span>
          <span>${remaining}${unit}</span>
        </div>
        <div class="hud-bar-track"><div class="hud-bar-fill" style="width:${pct}%"></div></div>
      </div>`;
    })
    .join('');

  const segmentStatus = computeSegmentStatus(resourceManager);
  const segments = SEGMENTS.map(
    (s) => `<span class="segment-pastille ${segmentStatus[s]}">${s}</span>`
  ).join('');

  const titre = chapter?.titre ?? 'Space Heroes';
  const code = (chapter?.id || 'ch').replace('chapitre_', 'CH.');

  container.innerHTML = `
    <div class="hud-brand">
      <div class="hud-brand-kicker">Space Heroes</div>
      <div class="hud-brand-title">${titre}</div>
      <div class="hud-brand-sub">${code} · ${chapter?.sousTitre ?? 'Mission'}</div>
    </div>
    <div class="hud-bars">${jauges}</div>
    <div class="hud-segments">${segments}</div>
  `;
}
