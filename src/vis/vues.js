// Cadre une trajectoire déjà calculée. Le facteur 2,15 est celui du plan large
// en fin de lancement : la vue d'ensemble reprend le même recul.

export const MARGE_ENSEMBLE = 2.15;

export function distanceEnsemble(apoapsisScene, homeLength) {
  const apo = Number(apoapsisScene) > 0 ? apoapsisScene : 1;
  const home = Number(homeLength) > 0 ? homeLength : 1;
  return Math.max(home, apo * MARGE_ENSEMBLE);
}
