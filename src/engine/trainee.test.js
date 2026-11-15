import { describe, expect, it } from 'vitest';
import { arret200Jours, masseDansTable, perte120Km, perteSmaKm, semainesTrainee } from './trainee.js';
import { coutNet } from './atelier-cout.js';
import chapitre01 from '../data/chapters/chapitre_01.json';

describe('traînée', () => {
  it('relit les pertes à 84 jours sur les quatre faces', () => {
    expect(perteSmaKm(1.33, 0.01)).toBeCloseTo(43.1);
    expect(perteSmaKm(4, 0.01)).toBeCloseTo(22);
    expect(perteSmaKm(1.33, 0.01702)).toBeCloseTo(65.5);
    expect(perteSmaKm(1.33, 0.0227)).toBeCloseTo(85.5);
    expect(perteSmaKm(1.33, 0.03405)).toBeCloseTo(137.6);
    expect(perteSmaKm(2.22, 0.01702)).toBeCloseTo(37.3);
    expect(perteSmaKm(2.22, 0.0227)).toBeCloseTo(44);
    expect(perteSmaKm(2.22, 0.03405)).toBeCloseTo(72.3);
  });

  it('garde les 120 jours, et laisse vide la ligne arrêtée à 200 km', () => {
    expect(perte120Km(1.33, 0.01)).toBeCloseTo(52.3);
    expect(perte120Km(4, 0.01)).toBeCloseTo(23.4);
    expect(perte120Km(1.33, 0.0227)).toBeCloseTo(121.7);
    expect(perte120Km(1.33, 0.03405)).toBeNull();
    expect(perte120Km(1.8, 0.03405)).toBeNull();
    expect(perte120Km(2.22, 0.03405)).toBeCloseTo(116.5);
  });

  it('dit le jour d’arrêt seulement sur le point propagé', () => {
    expect(arret200Jours(1.33, 0.03405)).toBeCloseTo(114.8305515255815);
    expect(arret200Jours(1.5, 0.03405)).toBeNull();
    expect(arret200Jours(1.33, 0.01)).toBeNull();
  });

  it('n’invente pas une face qui n’a pas été propagée', () => {
    expect(perteSmaKm(2.66, 0.02)).toBeNull();
    expect(semainesTrainee(2.66, 0.02, 12)).toBe(0);
  });

  it('interpole entre deux masses et prolonge en 1/masse au-delà', () => {
    expect(perteSmaKm((1.33 + 2.22) / 2, 0.01)).toBeCloseTo(30.85);
    expect(perteSmaKm(0.665, 0.01)).toBeCloseTo(86.2);
    expect(masseDansTable(1.33, 0.01)).toBe(true);
    expect(masseDansTable(0.665, 0.01)).toBe(false);
  });

  it('retire plus de semaines au satellite le plus léger, à face égale', () => {
    const leger = semainesTrainee(1.33, 0.01, 12);
    const lourd = semainesTrainee(4, 0.01, 12);
    expect(leger).toBeCloseTo(1.48);
    expect(lourd).toBeCloseTo(0.75);
    expect(leger).toBeGreaterThan(lourd);
    expect(semainesTrainee(1.33, 0.03405, 12)).toBeCloseTo(4.72);
  });

  it('impute la face du châssis à la durée du chapitre 1', () => {
    const alu = coutNet({ relief: {} }, chapitre01, { structure: 'chassis_alu' }, {});
    const cfrp = coutNet({ relief: {} }, chapitre01, { structure: 'chassis_cfrp' }, {});
    expect(alu.duree).toBeGreaterThan(0);
    expect(cfrp.duree).toBeGreaterThan(alu.duree);
  });
});
