import { computeSegmentStatus, SEGMENTS } from '../engine/segments.js';

const LABELS = {
  budget: 'Budget',
  masse: 'Masse',
  puissance: 'Puissance',
  donnees: 'Donnees',
  communications: 'Comm.',
  duree: 'Duree'
};

export function renderDashboard(container, resourceManager) {
  const jauges = resourceManager
    .snapshot()
    .map(
      (r) => `
      <div class="jauge ${r.status}">
        <div class="label">${LABELS[r.key] ?? r.key}</div>
        <div class="valeur">${r.used}/${r.max}</div>
      </div>`
    )
    .join('');

  const segmentStatus = computeSegmentStatus(resourceManager);
  const segments = SEGMENTS.map(
    (s) => `<span class="segment-pastille ${segmentStatus[s]}">${s}</span>`
  ).join('');

  container.innerHTML = `
    <div id="dashboard">${jauges}</div>
    <div id="segments">${segments}</div>
  `;
}
