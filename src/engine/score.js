// Score de mission et rapport post-mission (Document de conception, §3.6).

export function computeScore({ objectifsReussis, valeurScientifique, efficaciteRessources, qualiteDecisions, delaisRespectes }) {
  // Chaque entree est un ratio 0-1 ; ponderation fixee par le document de conception.
  const score =
    objectifsReussis * 35 +
    valeurScientifique * 20 +
    efficaciteRessources * 20 +
    qualiteDecisions * 15 +
    delaisRespectes * 10;
  return Math.round(score);
}

export function medaille(score) {
  if (score >= 85) return 'or';
  if (score >= 70) return 'argent';
  if (score >= 50) return 'bronze';
  return null;
}

export function genererRapport({ chapterId, score, resourcesSnapshot, decisionsCles = [], missionsReellesProches = [] }) {
  return {
    chapterId,
    score,
    medaille: medaille(score),
    consommationRessources: resourcesSnapshot,
    decisionsCles,
    missionsReellesProches,
    genereLe: new Date().toISOString()
  };
}
