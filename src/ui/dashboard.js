import { computeSegmentStatus, SEGMENTS } from '../engine/segments.js';
import { t } from '../i18n.js';
import { chapterText } from '../i18n/content.js';

const LABELS = {
  budget: ['Budget', 'Budget'],
  masse: ['Masse', 'Mass'],
  puissance: ['Puissance', 'Power'],
  donnees: ['Données', 'Data'],
  communications: ['Comms', 'Comms'],
  duree: ['Durée', 'Duration']
};

const UNITS = {
  masse: 'kg',
  duree: ['sem', 'wk']
};

export function renderDashboard(container, resourceManager, { chapter } = {}) {
  const jauges = resourceManager
    .snapshot()
    .map((r) => {
      const remaining = Math.max(0, r.remaining);
      const pct = r.max > 0 ? Math.max(0, Math.min(100, (remaining / r.max) * 100)) : 0;
      const unitRaw = UNITS[r.key];
      const unit = Array.isArray(unitRaw) ? ` ${t(unitRaw[0], unitRaw[1])}` : (unitRaw ? ` ${unitRaw}` : '');
      return `
      <div class="hud-bar ${r.status}">
        <div class="hud-bar-meta">
          <span>${LABELS[r.key] ? t(LABELS[r.key][0], LABELS[r.key][1]) : r.key}</span>
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

  const titre = chapter ? chapterText(chapter, 'titre') : 'Space Heroes';
  const code = (chapter?.id || 'ch').replace('chapitre_', 'CH.');
  const bonus = resourceManager.bonusNote;
  const bonusLine = bonus
    ? ` · ${bonus.sigle} ${t(LABELS[bonus.ressource]?.[0] || bonus.ressource, LABELS[bonus.ressource]?.[1] || bonus.ressource)} ×${bonus.facteur.toFixed(2)}`
    : '';
  const marge = resourceManager.margeNote;
  const margeLine = marge
    ? ` · ${t(marge.label, marge.labelEn)} ×${marge.facteur.toFixed(2)}`
    : '';
  const mode = resourceManager.modeNote;
  const modeLine = mode
    ? ` · ${t(mode.label, mode.labelEn)}`
    : '';

  container.innerHTML = `
    <div class="hud-brand">
      <div class="hud-brand-kicker">Space Heroes</div>
      <div class="hud-brand-title">${titre}</div>
      <div class="hud-brand-sub">${code} · ${chapter ? chapterText(chapter, 'sousTitre') : t('Mission', 'Mission')}${bonusLine}${margeLine}${modeLine}</div>
    </div>
    <div class="hud-bars">${jauges}</div>
    <div class="hud-segments">${segments}</div>
  `;
}
