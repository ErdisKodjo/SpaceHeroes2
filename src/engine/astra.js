// Moteur de dialogue d'ASTRA.
// Lit des repliques depuis data/astra/dialogues.json.
// Porte aussi le role d'evaluatrice independante du CML :
// c'est ASTRA, jamais le joueur, qui fait passer un critere CML au vert.

import { settingsStore } from './settings-store.js';

function localize(entry, vars) {
  const useEn = settingsStore.get('language') === 'en' && entry.texteEn;
  let texte = useEn ? entry.texteEn : entry.texte;
  if (vars) {
    for (const [key, value] of Object.entries(vars)) {
      texte = texte.replaceAll(`{${key}}`, String(value ?? ''));
    }
  }
  return { texte, categorie: entry.categorie };
}

export class AstraEngine {
  constructor(dialogues, cmlChecklist) {
    this.dialogues = dialogues; // { id: { texte, texteEn, categorie } }
    this.cml = cmlChecklist;
    this.lastLine = null;
  }

  say(dialogueId, vars) {
    const entry = this.dialogues[dialogueId];
    if (!entry) {
      console.warn(`Replique ASTRA manquante : ${dialogueId}`);
      this.lastLine = { texte: '…', categorie: 'info' };
      return this.lastLine;
    }
    this.lastLine = localize(entry, vars);
    window.dispatchEvent(new CustomEvent('astra-message', { detail: this.lastLine }));
    return this.lastLine;
  }

  sayCustom(texte, categorie = 'info') {
    this.lastLine = { texte, categorie };
    window.dispatchEvent(new CustomEvent('astra-message', { detail: this.lastLine }));
    return this.lastLine;
  }

  // Pioche une replique au hasard dans une categorie (succes, alerte, echec, atelier...)
  sayRandomFrom(categorie) {
    const candidates = Object.values(this.dialogues).filter((d) => d.categorie === categorie);
    if (candidates.length === 0) return this.say(null);
    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    this.lastLine = localize(pick);
    window.dispatchEvent(new CustomEvent('astra-message', { detail: this.lastLine }));
    return this.lastLine;
  }

  // Evaluation independante d'un critere CML.
  // `preuve` est une fonction fournie par l'episode qui dit si le critere est rempli.
  evaluerCritereCml(criterionId, preuve) {
    const rempli = typeof preuve === 'function' ? preuve() : Boolean(preuve);
    this.cml.setStatus(criterionId, rempli ? 'vert' : 'rouge');
    return rempli;
  }
}
