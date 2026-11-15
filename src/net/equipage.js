let courant = null;

export function definirEquipage(etat) {
  courant = etat?.prete ? etat : null;
}

export function equipageCourant() {
  return courant;
}
