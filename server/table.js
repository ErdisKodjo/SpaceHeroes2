// Table d'une partie à 4. Un poste par joueur. Aucun siège n'est tenu par ASTRA.

export const ROLES_TABLE = [
  'directeur',
  'ingenieur_vehicule',
  'ingenieur_systemes',
  'responsable_science'
];

const CHAPITRE = /^chapitre_0[1-8]$/;

function nomCourt(nom) {
  const texte = String(nom || '').trim().slice(0, 24);
  return texte || 'Commandant';
}

export function creerTable() {
  const joueurs = new Map();
  let suivant = 1;

  function etat() {
    const liste = [...joueurs.values()].map((j) => ({ ...j }));
    const prete = ROLES_TABLE.every((role) => liste.some((j) => j.roleId === role));
    return {
      places: 4,
      joueurs: liste,
      prete,
      hote: joueurs.keys().next().value || null
    };
  }

  return {
    etat,
    rejoindre(nom) {
      if (joueurs.size >= 4) return { ok: false, raison: 'complet' };
      const id = `j${suivant}`;
      suivant += 1;
      const joueur = { id, nom: nomCourt(nom), roleId: null };
      joueurs.set(id, joueur);
      return { ok: true, joueur: { ...joueur }, etat: etat() };
    },
    prendre(id, roleId) {
      const joueur = joueurs.get(id);
      if (!joueur) return { ok: false, raison: 'inconnu' };
      if (!ROLES_TABLE.includes(roleId)) return { ok: false, raison: 'role' };
      for (const autre of joueurs.values()) {
        if (autre.id !== id && autre.roleId === roleId) return { ok: false, raison: 'pris' };
      }
      joueur.roleId = roleId;
      return { ok: true, etat: etat() };
    },
    liberer(id) {
      const joueur = joueurs.get(id);
      if (!joueur) return { ok: false, raison: 'inconnu' };
      joueur.roleId = null;
      return { ok: true, etat: etat() };
    },
    quitter(id) {
      joueurs.delete(id);
      return { ok: true, etat: etat() };
    },
    lancer(id, chapterId) {
      const courant = etat();
      if (id !== courant.hote) return { ok: false, raison: 'hote' };
      if (!courant.prete) return { ok: false, raison: 'incomplete' };
      if (!CHAPITRE.test(chapterId || '')) return { ok: false, raison: 'chapitre' };
      return { ok: true, chapterId, etat: courant };
    }
  };
}
