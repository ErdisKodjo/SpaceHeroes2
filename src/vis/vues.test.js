import { describe, expect, it } from 'vitest';
import { distanceEnsemble } from './vues.js';
import { gmatPour } from '../engine/gmat.js';

describe('vues de trajectoire', () => {
  it('garde le recul de repos quand l’orbite tient déjà dans l’image', () => {
    expect(distanceEnsemble(1.1, 2.85)).toBeCloseTo(2.85);
  });

  it('recule jusqu’à voir l’apoastre', () => {
    expect(distanceEnsemble(60, 2.85)).toBeCloseTo(129);
  });

  it('place la Lune au rayon lu dans la table, 1 788 km moins 50 km', () => {
    const lune = gmatPour('transfert_lune');
    expect(lune.rayonLuneKm).toBe(1738);
    expect(lune.apoapsisScene).toBeGreaterThan(50);
    expect(gmatPour('orbite_basse').rayonLuneKm).toBeNull();
  });
});
