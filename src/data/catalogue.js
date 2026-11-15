import chapitre01 from './chapters/chapitre_01.json';
import chapitre02 from './chapters/chapitre_02.json';
import chapitre03 from './chapters/chapitre_03.json';
import chapitre04 from './chapters/chapitre_04.json';
import chapitre05 from './chapters/chapitre_05.json';
import chapitre06 from './chapters/chapitre_06.json';
import chapitre07 from './chapters/chapitre_07.json';
import chapitre08 from './chapters/chapitre_08.json';

const CHAPITRES = {
  chapitre_01: chapitre01,
  chapitre_02: chapitre02,
  chapitre_03: chapitre03,
  chapitre_04: chapitre04,
  chapitre_05: chapitre05,
  chapitre_06: chapitre06,
  chapitre_07: chapitre07,
  chapitre_08: chapitre08
};

export const ORDRE_CHAPITRES = Object.keys(CHAPITRES);

export function getChapitre(id) {
  return CHAPITRES[id] ?? null;
}

export function chapitreSuivant(id) {
  const i = ORDRE_CHAPITRES.indexOf(id);
  if (i < 0 || i >= ORDRE_CHAPITRES.length - 1) return null;
  return ORDRE_CHAPITRES[i + 1];
}
