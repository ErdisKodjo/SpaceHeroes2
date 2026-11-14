// Checklist CML enrichie (voir Addendum_CML_Checklist_Space_Heroes.md).
// 20 criteres (5 par niveau 1-4), chacun cote rouge/jaune/vert.
// Un niveau est valide quand >= 80% de ses criteres sont verts (regle NASA reelle).
// Important : seule ASTRA (engine/astra.js) doit pouvoir faire passer un critere au vert -
// jamais une auto-evaluation directe par le joueur (mise en garde de la ressource source).

const GREEN_THRESHOLD = 0.8;

export class CmlChecklist {
  constructor(criteriaData) {
    // criteriaData : tableau issu de data/cml/checklist.json
    this.criteria = criteriaData;
    this.status = new Map(); // id -> 'rouge' | 'jaune' | 'vert'
    for (const c of criteriaData) {
      this.status.set(c.id, 'rouge');
    }
  }

  setStatus(criterionId, value) {
    if (!['rouge', 'jaune', 'vert'].includes(value)) {
      throw new Error(`Statut invalide : ${value}`);
    }
    if (!this.status.has(criterionId)) {
      throw new Error(`Critere inconnu : ${criterionId}`);
    }
    this.status.set(criterionId, value);
  }

  criteriaForLevel(level) {
    return this.criteria.filter((c) => c.niveau === level);
  }

  greenRatio(level) {
    const items = this.criteriaForLevel(level);
    if (items.length === 0) return 0;
    const green = items.filter((c) => this.status.get(c.id) === 'vert').length;
    return green / items.length;
  }

  isLevelValidated(level) {
    return this.greenRatio(level) >= GREEN_THRESHOLD;
  }

  // Le niveau courant est le plus haut niveau valide, +1 cran si tout est vert jusque la.
  currentLevel() {
    let level = 0;
    for (let l = 1; l <= 4; l++) {
      if (this.isLevelValidated(l)) level = l;
      else break;
    }
    return level;
  }

  snapshot() {
    return [1, 2, 3, 4].map((level) => ({
      level,
      criteres: this.criteriaForLevel(level).map((c) => ({
        id: c.id,
        texte: c.texte,
        statut: this.status.get(c.id)
      })),
      ratioVert: this.greenRatio(level),
      valide: this.isLevelValidated(level)
    }));
  }
}
