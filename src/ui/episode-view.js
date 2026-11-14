export function renderEpisode(container, episodeRunner, { onNext, busy = false } = {}) {
  const episode = episodeRunner.currentEpisode;

  if (episodeRunner.isFinished) {
    container.innerHTML = `
      <h2>Chapitre termine</h2>
      <p>Voir le Bilan dans le rapport post-mission.</p>
    `;
    return;
  }

  // Libelle du bouton fourni par les donnees du chapitre (ex. "Lancer !"), sinon "Continuer".
  const label = busy ? 'En cours…' : episode.bouton || 'Continuer';

  container.innerHTML = `
    <h2>${episode.titre}</h2>
    <p>${episode.texte}</p>
    <button id="btn-continuer" ${busy ? 'disabled' : ''}>${label}</button>
  `;

  container.querySelector('#btn-continuer').addEventListener('click', () => {
    if (onNext) onNext();
  });
}
