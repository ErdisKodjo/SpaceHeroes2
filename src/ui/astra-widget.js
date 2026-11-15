import { t } from '../i18n.js';

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

export function renderAstra(container, line) {
  const texte = line?.texte ?? t('Canal ouvert. En attente de directive.', 'Channel open. Standing by.');
  container.innerHTML = `
    <div class="astra-rail">
      <div class="astra-cercle" aria-hidden="true"></div>
      <span>${t('DIRECT', 'LIVE')}</span>
    </div>
    <div class="astra-copy">
      <div class="astra-name">ASTRA // COMMS</div>
      <div class="astra-bulle">${esc(texte)}</div>
    </div>
  `;
}
