export function renderEpisode(container, episodeRunner, { onNext, busy = false } = {}) {
  if (episodeRunner.isFinished) {
    container.innerHTML = `
      <div class="plaque-kicker">Mission close</div>
      <h2>Chapitre terminé</h2>
      <p>Rapport post-mission généré. Analyse ASTRA disponible dans la console.</p>
    `;
    return;
  }

  const episode = episodeRunner.currentEpisode;
  const n = String(episodeRunner.index + 1).padStart(2, '0');
  const total = String(episodeRunner.chapter.episodes.length).padStart(2, '0');
  const label = busy ? 'Séquence en cours…' : episode.bouton || 'Continuer';

  container.innerHTML = `
    <div class="plaque-kicker">Épisode ${n} / ${total} · ${episode.type}</div>
    <h2>${episode.titre}</h2>
    <p>${episode.texte}</p>
    <button id="btn-continuer" class="cta" ${busy ? 'disabled' : ''}>${label}</button>
  `;

  container.querySelector('#btn-continuer').addEventListener('click', () => {
    if (onNext) onNext();
  });
}
