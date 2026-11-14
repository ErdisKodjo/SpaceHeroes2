export function renderEpisode(container, episodeRunner, { onNext } = {}) {
  const episode = episodeRunner.currentEpisode;

  if (episodeRunner.isFinished) {
    container.innerHTML = `
      <h2>Chapitre termine</h2>
      <p>Voir le Bilan dans le rapport post-mission.</p>
    `;
    return;
  }

  container.innerHTML = `
    <h2>${episode.titre}</h2>
    <p>${episode.texte}</p>
    <button id="btn-continuer">Continuer</button>
  `;

  container.querySelector('#btn-continuer').addEventListener('click', () => {
    if (onNext) onNext();
  });
}
