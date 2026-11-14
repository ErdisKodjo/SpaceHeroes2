export function renderAstra(container, line) {
  const texte = line?.texte ?? '…';
  container.innerHTML = `
    <div class="astra-cercle" aria-hidden="true"></div>
    <div class="astra-bulle">${texte}</div>
  `;
}
