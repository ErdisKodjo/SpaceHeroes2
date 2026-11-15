// Planétaire du QG.
// Terre et Mars : éléments képlériens JPL, table 1800–2050, écliptique moyenne
// et équinoxe J2000 (Standish & Williams). La rotation est celle du mémo JPL :
// Rz(−Ω) Rx(−I) Rz(−ω). La Lune part de la nouvelle lune du 8 janvier 2008,4849
// (Espenak, GSFC) et avance du mois sidéral publié, 27,32166 jours.

const J2000 = 2451545.0;

const TABLE = {
  terre: {
    a: [1.00000261, 0.00000562],
    e: [0.01671123, -0.00004392],
    I: [-0.00001531, -0.01294668],
    L: [100.46457166, 35999.37244981],
    p: [102.93768193, 0.32327364],
    N: [0, 0]
  },
  mars: {
    a: [1.52371034, 0.00001847],
    e: [0.09339410, 0.00007882],
    I: [1.84969142, -0.00813131],
    L: [-4.55343205, 19140.30268499],
    p: [-23.94362959, 0.44441088],
    N: [49.55953891, -0.29257343]
  }
};

export const NOUVELLE_LUNE = { annee: 2008, mois: 1, jour: 8.4849 };
export const MOIS_SIDERAL_JOURS = 27.32166;

const DEG = Math.PI / 180;

export function jourJulien(annee, mois, jour) {
  let y = annee;
  let m = mois;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + jour + B - 1524.5;
}

export function siecle(jd) {
  return (jd - J2000) / 36525;
}

function lire(paire, T) {
  return paire[0] + paire[1] * T;
}

function vers180(degres) {
  return ((degres + 180) % 360 + 360) % 360 - 180;
}

export function anomalieExcentrique(Mdeg, e) {
  const eStar = e * (180 / Math.PI);
  let E = Mdeg + eStar * Math.sin(Mdeg * DEG);
  for (let n = 0; n < 15; n += 1) {
    const Er = E * DEG;
    const dM = Mdeg - (E - eStar * Math.sin(Er));
    const dE = dM / (1 - e * Math.cos(Er));
    E += dE;
    if (Math.abs(dE) <= 1e-6) break;
  }
  return E;
}

function elements(corps, T) {
  const ligne = TABLE[corps];
  const I = lire(ligne.I, T);
  const N = lire(ligne.N, T);
  const p = lire(ligne.p, T);
  return {
    a: lire(ligne.a, T),
    e: lire(ligne.e, T),
    I,
    N,
    p,
    L: lire(ligne.L, T),
    omega: p - N
  };
}

function ecliptique(el, Edeg) {
  const E = Edeg * DEG;
  const x = el.a * (Math.cos(E) - el.e);
  const y = el.a * Math.sqrt(1 - el.e * el.e) * Math.sin(E);
  const w = el.omega * DEG;
  const O = el.N * DEG;
  const I = el.I * DEG;
  const cw = Math.cos(w);
  const sw = Math.sin(w);
  const cO = Math.cos(O);
  const sO = Math.sin(O);
  const cI = Math.cos(I);
  const sI = Math.sin(I);
  return {
    x: (cw * cO - sw * sO * cI) * x + (-sw * cO - cw * sO * cI) * y,
    y: (cw * sO + sw * cO * cI) * x + (-sw * sO + cw * cO * cI) * y,
    z: (sw * sI) * x + (cw * sI) * y
  };
}

export function positionEcliptique(corps, jd) {
  const el = elements(corps, siecle(jd));
  const M = vers180(el.L - el.p);
  return ecliptique(el, anomalieExcentrique(M, el.e));
}

export function traceOrbite(corps, jd, pas = 90) {
  const el = elements(corps, siecle(jd));
  const points = [];
  for (let i = 0; i < pas; i += 1) {
    const M = -180 + (360 * i) / pas;
    points.push(ecliptique(el, anomalieExcentrique(M, el.e)));
  }
  return points;
}

export function longitudeLune(jd) {
  const ancre = jourJulien(NOUVELLE_LUNE.annee, NOUVELLE_LUNE.mois, NOUVELLE_LUNE.jour);
  const terre = positionEcliptique('terre', ancre);
  const soleil = Math.atan2(terre.y, terre.x) + Math.PI;
  return soleil + ((jd - ancre) / MOIS_SIDERAL_JOURS) * 2 * Math.PI;
}

export function longitudeTerre(jd) {
  const terre = positionEcliptique('terre', jd);
  return Math.atan2(terre.y, terre.x);
}
