// Compétence propre au rôle, en plus du facteur de ressource.
// Une seule par rôle, lue au moment de l'aléa ou de la transmission.

export function competencePour(roleId) {
  if (roleId === 'directeur') return { veto: true, prixVeto: 2 };
  if (roleId === 'ingenieur_vehicule') return { calcul: true };
  if (roleId === 'ingenieur_systemes') return { reboot: true };
  if (roleId === 'responsable_science') return { compression: true };
  return {};
}
