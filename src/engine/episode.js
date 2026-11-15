// Moteur generique d'episode/chapitre (Document de conception, §5.1).
// Ne connait aucun chapitre precis : il lit la structure depuis un fichier JSON de data/chapters/.

export class EpisodeRunner {
  constructor(chapterData, { resources, astra, cml, onChange } = {}) {
    this.chapter = chapterData;
    this.resources = resources;
    this.astra = astra;
    this.cml = cml;
    this.onChange = onChange || (() => {});
    this.index = 0;
    this.log = [];
  }

  get currentEpisode() {
    return this.chapter.episodes[this.index];
  }

  get isFinished() {
    return this.index >= this.chapter.episodes.length;
  }

  start() {
    this._enterEpisode();
  }

  _enterEpisode() {
    const episode = this.currentEpisode;
    if (!episode) return;
    if (episode.astra) this.astra.say(episode.astra);
    // Si l'episode exige un niveau CML pour etre accessible, on le signale (pas de blocage dur pour le prototype).
    if (episode.cmlRequis && !this.cml.isLevelValidated(episode.cmlRequis)) {
      this.astra.say('cml_niveau_manquant', { niveau: episode.cmlRequis });
    }
    this.onChange(this.snapshot());
  }

  // Declenche l'evenement aleatoire du chapitre, s'il y en a un et qu'il n'a pas deja eu lieu.
  declencherEvenement() {
    const evt = this.chapter.evenementAleatoire;
    if (!evt || this._evenementJoue) return null;
    this._evenementJoue = true;
    if (evt.effet) {
      for (const [cle, delta] of Object.entries(evt.effet)) {
        if (this.resources && this.resources.max[cle] !== undefined) {
          this.resources.max[cle] += delta;
        }
      }
    }
    this.log.push({ type: 'evenement', id: evt.id, texte: evt.texte });
    this.onChange(this.snapshot());
    return evt;
  }

  next() {
    this.log.push({ type: 'episode_termine', id: this.currentEpisode?.id });
    this.index += 1;
    if (!this.isFinished) this._enterEpisode();
    else this.onChange(this.snapshot());
  }

  snapshot() {
    return {
      chapitreId: this.chapter.id,
      episodeIndex: this.index,
      episode: this.currentEpisode,
      termine: this.isFinished,
      astraLine: this.astra.lastLine,
      log: this.log
    };
  }
}
