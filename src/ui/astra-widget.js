import { settingsStore } from '../engine/settings-store.js';
import { t } from '../i18n.js';

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

export function renderAstra(container, line) {
  const texte = line?.texte ?? t('Canal ouvert. En attente de directive.', 'Channel open. Standing by.');
  const voix = settingsStore.get('voiceEnabled') !== false;
  const sousTitres = settingsStore.get('subtitles') !== false;
  const montrer = sousTitres || !voix;
  container.innerHTML = `
    <div class="astra-rail">
      <div class="astra-cercle" aria-hidden="true"></div>
      <span>${t('DIRECT', 'LIVE')}</span>
    </div>
    <div class="astra-copy">
      <div class="astra-name">ASTRA // COMMS</div>
      <div class="astra-bulle"${montrer ? '' : ' hidden'}>${montrer ? esc(texte) : ''}</div>
    </div>
  `;
}
