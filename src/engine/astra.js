// Moteur de dialogue d'ASTRA (Document de conception, §2).
// Lit des repliques depuis des donnees (data/astra/dialogues.json), ne contient aucun texte en dur.
// Porte aussi le role d'evaluatrice independante du CML (Addendum CML, §3) :
// c'est ASTRA, jamais le joueur, qui fait passer un critere CML au vert.

export class AstraEngine {
  constructor(dialogues, cmlChecklist) {
    this.dialogues = dialogues; // { id: { texte, categorie } }
    this.cml = cmlChecklist;
    this.lastLine = null;
  }

  say(dialogueId) {
    const entry = this.dialogues[dialogueId];
    if (!entry) {
      console.warn(`Replique ASTRA manquante : ${dialogueId}`);
      this.lastLine = { texte: '…', categorie: 'info' };
      return this.lastLine;
    }
    this.lastLine = entry;
    return entry;
  }

  // Pioche une replique au hasard dans une categorie (succes, alerte, echec, atelier...)
  sayRandomFrom(categorie) {
    const candidates = Object.values(this.dialogues).filter((d) => d.categorie === categorie);
    if (candidates.length === 0) return this.say(null);
    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    this.lastLine = pick;
    return pick;
  }

  // Evaluation independante d'un critere CML.
  // `preuve` est une fonction fournie par l'episode qui dit si le critere est rempli
  // (ex: verifier que l'objectif scientifique a bien ete saisi) - ASTRA ne fait jamais
  // confiance a une simple declaration du joueur.
  evaluerCritereCml(criterionId, preuve) {
    const rempli = typeof preuve === 'function' ? preuve() : Boolean(preuve);
    this.cml.setStatus(criterionId, rempli ? 'vert' : 'rouge');
    return rempli;
  }
}
