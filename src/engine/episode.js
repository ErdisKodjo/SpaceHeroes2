// Moteur generique d'episode/chapitre (Document de conception, §5.1).
// Ne connait aucun chapitre precis : il lit la structure depuis un fichier JSON de data/chapters/.

import { niveauxDirecteur, porteOuverte } from './difficulte.js';

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
    this.onChange(this.snapshot());
  }

  // Le niveau demandé par l'épisode en cours, puis celui exigé par le suivant.
  niveauBloquant() {
    if (porteOuverte()) return 0;
    const cur = this.currentEpisode;
    const prochain = this.chapter.episodes[this.index + 1];
    if (cur?.cmlVise && !this.cml.isLevelValidated(cur.cmlVise)) return cur.cmlVise;
    if (prochain?.cmlRequis && !this.cml.isLevelValidated(prochain.cmlRequis)) return prochain.cmlRequis;
    return niveauxDirecteur(cur, this.cml);
  }

  // Declenche l'evenement aleatoire du chapitre, s'il y en a un et qu'il n'a pas deja eu lieu.
  declencherEvenement() {
    const evt = this.chapter.evenementAleatoire;
    if (!evt || this._evenementJoue) return null;
    this._evenementJoue = true;
    if (evt.effet && this.resources) {
      for (const [cle, delta] of Object.entries(evt.effet)) {
        if (this.resources.max[cle] === undefined) continue;
        if (delta < 0) this.resources.consume(cle, -delta);
        else if (delta > 0) this.resources.max[cle] += delta;
      }
    }
    this.log.push({ type: 'evenement', id: evt.id, texte: evt.texte });
    this.onChange(this.snapshot());
    return evt;
  }

  next({ forcer = false } = {}) {
    const niveau = forcer ? 0 : this.niveauBloquant();
    if (niveau) {
      this.astra.say('cml_niveau_manquant', { niveau });
      return false;
    }
    this.log.push({ type: 'episode_termine', id: this.currentEpisode?.id });
    this.index += 1;
    if (!this.isFinished) this._enterEpisode();
    else this.onChange(this.snapshot());
    return true;
  }

  // Le CML 4 ferme la sortie des essais. On revient à l'atelier pour revoir la conception.
  retourAtelier() {
    if (this.currentEpisode?.type !== 'essais') return false;
    const index = this.chapter.episodes.findIndex((ep) => ep.type === 'atelier');
    if (index < 0) return false;
    this.index = index;
    this._enterEpisode();
    this.astra?.say('retour_atelier');
    return true;
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
