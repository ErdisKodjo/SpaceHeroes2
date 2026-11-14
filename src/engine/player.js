// Profil joueur courant : role choisi, nom, stats de session.
// Persiste dans localStorage cle 'sh-player'.

import rolesData from '../data/roles.json';

const KEY = 'sh-player';

const DEFAULT = {
  nom: 'Commandant',
  roleId: 'ingenieur_vehicule',
  stats: { partiesJouees: 0, meilleursScores: {}, jetons: 0 }
};

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULT, ...JSON.parse(raw) } : { ...DEFAULT };
  } catch {
    return { ...DEFAULT };
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
    return _player.stats.meilleursScores[chapterId] ?? null;
  },
  get jetons() {
    return _player.stats.jetons ?? 0;
  },
  ajouterJetons(n) {
    const gain = Math.max(0, Math.round(n) || 0);
    _player.stats.jetons = (_player.stats.jetons ?? 0) + gain;
    save(_player);
    return _player.stats.jetons;
  }
};
