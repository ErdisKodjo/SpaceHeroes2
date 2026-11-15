// Sauvegarde automatique de la progression (localStorage, clé 'sh-save').
// Capture un snapshot complet de l'état de jeu et le restaure au rechargement.

const KEY = 'sh-save';

// ─── Sérialisation ────────────────────────────────────────────────────────

export function sauvegarder({
  chapterId, episodeIndex, resources, cml, selections, repartitions, fiabilite, scoreOps,
  atelierApplique = false, aCompare = false, roleId = null
}) {
  const data = {
    v: 2,
    ts: Date.now(),
    chapterId,
    episodeIndex,
    resources: serializeResources(resources),
    cml:       serializeCml(cml),
    selections: selections ?? {},
    repartitions: repartitions ?? {},
    fiabilite:  fiabilite  ?? null,
    scoreOps:   scoreOps   ?? null,
    atelierApplique: Boolean(atelierApplique),
    aCompare: Boolean(aCompare),
    roleId
  };
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // quota localStorage dépassé — pas bloquant
  }
}

function serializeResources(resources) {
  if (!resources) return null;
  const snap = {};
  for (const { key, used, max } of resources.snapshot()) {
    snap[key] = { used, max };
  }
  return snap;
}

function serializeCml(cml) {
  if (!cml) return null;
  const statuts = {};
  cml.snapshot().forEach(niveau => {
    niveau.criteres.forEach(c => {
      statuts[c.id] = c.statut;
    });
  });
  return statuts;
}

// ─── Désérialisation ──────────────────────────────────────────────────────

export function charger() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data?.v) return null; // format inconnu
    return data;
  } catch {
    return null;
  }
}

export function effacer() {
  localStorage.removeItem(KEY);
}

// Restaure les ressources depuis une sauvegarde dans un ResourceManager existant.
export function restaurerResources(resourceManager, savedResources) {
  if (!savedResources) return;
  for (const [key, { used, max }] of Object.entries(savedResources)) {
    if (resourceManager.max[key] !== undefined) {
      resourceManager.max[key]  = max;
      resourceManager.used[key] = used;
    }
  }
}

// Restaure les statuts CML depuis une sauvegarde dans un CmlChecklist existant.
export function restaurerCml(cmlChecklist, savedCml) {
  if (!savedCml) return;
  for (const [criterionId, statut] of Object.entries(savedCml)) {
    try {
      cmlChecklist.setStatus(criterionId, statut);
    } catch {
      // critère inconnu dans cette version — on ignore
    }
  }
}

// ─── Utilitaire : âge de la sauvegarde ───────────────────────────────────

export function ageSauvegarde() {
  const save = charger();
  if (!save) return null;
  return Math.round((Date.now() - save.ts) / 1000 / 60); // en minutes
}
