export function renderAstra(container, line) {
  const texte = line?.texte ?? 'Canal ouvert. En attente de directive.';
  container.innerHTML = `
    <div class="astra-rail">
      <div class="astra-cercle" aria-hidden="true"></div>
      <span>LIVE</span>
    </div>
    <div class="astra-copy">
      <div class="astra-name">ASTRA // COMMS</div>
      <div class="astra-bulle">${texte}</div>
    </div>
  `;
}
