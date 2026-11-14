// Les 4 segments d'une mission (Document de conception, §3.9 - source NASA "Design and Develop Science Missions").
// Chaque segment est colore a partir de l'etat des ressources qu'il surveille.

export const SEGMENTS = ['lancement', 'spatial', 'sol', 'utilisateurs'];

// Table de correspondance : quelles ressources chaque segment surveille.
// Simplifiee pour le prototype ; affinee au fil des chapitres.
const SEGMENT_WATCH = {
  lancement: ['masse', 'budget', 'duree'],
  spatial: ['masse', 'puissance', 'donnees'],
  sol: ['communications', 'donnees', 'budget'],
  utilisateurs: ['donnees']
};

// Ordre de gravite pour prendre le pire statut parmi les ressources surveillees.
const SEVERITY = { vert: 0, orange: 1, rouge: 2 };

export function computeSegmentStatus(resourceManager) {
  const result = {};
  for (const segment of SEGMENTS) {
    const watched = SEGMENT_WATCH[segment];
    let worst = 'vert';
    for (const key of watched) {
      const status = resourceManager.status(key);
      if (SEVERITY[status] > SEVERITY[worst]) worst = status;
    }
    result[segment] = worst;
  }
  return result;
}
