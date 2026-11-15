// Prix d'un déblocage anticipé. Un jeton de bilan achète l'accès
// à une pièce encore réservée à un chapitre ultérieur.
// Chapitre 2 → 2 jetons, chapitre 5 → 5 jetons.

export function prixAnticipe(deblocage) {
  const n = parseInt(String(deblocage || '').replace(/\D/g, ''), 10);
  if (!n || n <= 1) return 0;
  return n;
}
