// Profil joueur courant : role choisi, nom, stats de session.
// Persiste dans localStorage cle 'sh-player'.

import rolesData from '../data/roles.json';

const KEY = 'sh-player';

const DEFAULT = {
  nom: 'Commandant',
  roleId: 'ingenieur_vehicule',
  stats: { partiesJouees: 0, meilleursScores: {}, jetons: 0, techs: [] }
};

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT, stats: { ...DEFAULT.stats } };
    const saved = JSON.parse(raw);
    return {
      ...DEFAULT,
      ...saved,
      stats: { ...DEFAULT.stats, ...(saved.stats || {}) }
    };
  } catch {
    return { ...DEFAULT, stats: { ...DEFAULT.stats } };
  }
}

function save(p) {
  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* quota */ }
}

let _player = load();

export const playerStore = {
  get nom()    { return _player.nom; },
  get roleId() { return _player.roleId; },
  get role()   { return rolesData.find(r => r.id === _player.roleId) ?? rolesData[0]; },
  getRoles()   { return rolesData; },

  setNom(nom) {
    _player.nom = nom.trim() || DEFAULT.nom;
    save(_player);
  },
  setRole(roleId) {
    if (rolesData.some(r => r.id === roleId)) {
      _player.roleId = roleId;
      save(_player);
      window.dispatchEvent(new CustomEvent('player-role-change', { detail: { roleId } }));
    }
  },
  enregistrerScore(chapterId, score) {
    const best = _player.stats.meilleursScores[chapterId];
    if (best === undefined || score > best) _player.stats.meilleursScores[chapterId] = score;
    _player.stats.partiesJouees += 1;
    save(_player);
  },
  getMeilleurScore(chapterId) {
    return _player.stats.meilleursScores?.[chapterId] ?? null;
  },
  get jetons() {
    return _player.stats.jetons ?? 0;
  },
  ajouterJetons(n) {
    const gain = Math.max(0, Math.round(n) || 0);
    _player.stats.jetons = (_player.stats.jetons ?? 0) + gain;
    save(_player);
    return _player.stats.jetons;
  },
  possedeTech(id) {
    return (_player.stats.techs || []).includes(id);
  },
  acheterTech(id, prix) {
    if (!id) return { ok: false, reste: this.jetons };
    if (this.possedeTech(id)) return { ok: true, reste: this.jetons, deja: true };
    const cout = Math.max(0, Math.round(prix) || 0);
    const solde = this.jetons;
    if (solde < cout) return { ok: false, reste: solde, cout };
    _player.stats.jetons = solde - cout;
    _player.stats.techs = [...(_player.stats.techs || []), id];
    save(_player);
    return { ok: true, reste: this.jetons, cout };
  }
};

// Bonus du rôle. Un facteur ≥ 1 élargit le plafond.
// Un facteur < 1 réduit le coût de cette ressource (masse × 0,9 pour l'IV).
export function appliquerBonusRole(resources, role) {
  const bonus = role?.bonus;
  const key = bonus?.ressource;
  const facteur = Number(bonus?.facteur);
  if (!key || resources.max[key] == null || !Number.isFinite(facteur) || facteur <= 0) return;
  if (facteur >= 1) resources.max[key] *= facteur;
  else resources.relief[key] = facteur;
  resources.bonusNote = { ressource: key, facteur, sigle: role.sigle };
}

export function annoterBonusRole(resources, role) {
  const bonus = role?.bonus;
  const key = bonus?.ressource;
  const facteur = Number(bonus?.facteur);
  if (!key || !Number.isFinite(facteur)) return;
  resources.bonusNote = { ressource: key, facteur, sigle: role.sigle };
}
