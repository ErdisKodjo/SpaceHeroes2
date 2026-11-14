// Moteur des 6 ressources (Document de conception, §3.1).
// Ne connaît aucun chapitre : il reçoit des valeurs initiales et applique les règles d'interaction.

export const RESOURCE_KEYS = [
  'budget',
  'masse',
  'puissance',
  'donnees',
  'communications',
  'duree'
];

export class ResourceManager {
  constructor(initial = {}) {
    this.max = {};
    this.used = {};
    for (const key of RESOURCE_KEYS) {
      this.max[key] = initial[key] ?? 0;
      this.used[key] = 0;
    }
  }

  consume(key, amount) {
    if (!RESOURCE_KEYS.includes(key)) {
      throw new Error(`Ressource inconnue : ${key}`);
    }
    this.used[key] += amount;
    return this.remaining(key);
  }

  remaining(key) {
    return this.max[key] - this.used[key];
  }

  ratio(key) {
    if (this.max[key] === 0) return 0;
    return this.used[key] / this.max[key];
  }

  // vert < 80% utilisé, orange < 100%, rouge >= 100% (seuils d'équilibrage à ajuster en test)
  status(key) {
    const r = this.ratio(key);
    if (r >= 1) return 'rouge';
    if (r >= 0.8) return 'orange';
    return 'vert';
  }

  isOverLimit(key) {
    return this.used[key] > this.max[key];
  }

  snapshot() {
    return RESOURCE_KEYS.map((key) => ({
      key,
      max: this.max[key],
      used: this.used[key],
      remaining: this.remaining(key),
      status: this.status(key)
    }));
  }
}
