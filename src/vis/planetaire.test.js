import { describe, expect, it } from 'vitest';
import {
  anomalieExcentrique,
  jourJulien,
  longitudeLune,
  longitudeTerre,
  positionEcliptique,
  MOIS_SIDERAL_JOURS,
  NOUVELLE_LUNE
} from './planetaire.js';

function deg(rad) {
  let d = (rad * 180) / Math.PI;
  d = ((d % 360) + 360) % 360;
  return d;
}

describe('planétaire képlérien', () => {
  it('situe J2000 au 1 janvier 2000, midi', () => {
    expect(jourJulien(2000, 1, 1.5)).toBe(2451545);
  });

  it('place la Terre près de sa longitude moyenne au 1 janvier 2000', () => {
    const terre = positionEcliptique('terre', 2451545);
    const rayon = Math.hypot(terre.x, terre.y, terre.z);
    expect(rayon).toBeGreaterThan(0.98);
    expect(rayon).toBeLessThan(1.02);
    expect(deg(longitudeTerre(2451545))).toBeGreaterThan(98);
    expect(deg(longitudeTerre(2451545))).toBeLessThan(103);
  });

  it('garde Mars entre périhélie et aphélie au même instant', () => {
    const mars = positionEcliptique('mars', 2451545);
    const rayon = Math.hypot(mars.x, mars.y, mars.z);
    expect(rayon).toBeGreaterThan(1.38);
    expect(rayon).toBeLessThan(1.67);
  });

  it('aligne la Lune sur le Soleil à la nouvelle lune du 8 janvier 2008', () => {
    const jd = jourJulien(NOUVELLE_LUNE.annee, NOUVELLE_LUNE.mois, NOUVELLE_LUNE.jour);
    const soleil = deg(longitudeTerre(jd) + Math.PI);
    const lune = deg(longitudeLune(jd));
    const ecart = Math.abs(((lune - soleil + 540) % 360) - 180);
    expect(ecart).toBeLessThan(1e-6);
    const plusTard = deg(longitudeLune(jd + MOIS_SIDERAL_JOURS));
    expect(Math.abs(((plusTard - lune + 540) % 360) - 180)).toBeLessThan(1e-6);
  });

  it('résout l’anomalie nulle sans la décaler', () => {
    expect(anomalieExcentrique(0, 0.0933941)).toBeCloseTo(0, 6);
  });
});
