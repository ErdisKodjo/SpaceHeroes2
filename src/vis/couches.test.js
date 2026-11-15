import { describe, expect, it } from 'vitest';
import { coucheA, rayonCouche } from './couches.js';

describe('couches de lancement', () => {
  it('nomme la couche selon l’altitude affichée', () => {
    expect(coucheA(0).id).toBe('troposphere');
    expect(coucheA(11.9).id).toBe('troposphere');
    expect(coucheA(12).id).toBe('stratosphere');
    expect(coucheA(50).id).toBe('mesosphere');
    expect(coucheA(80).id).toBe('thermosphere');
    expect(coucheA(100).id).toBe('karman');
    expect(coucheA(550).fr).toContain('Kármán');
  });

  it('place la couche là où le HUD lit cette altitude', () => {
    const bas = rayonCouche(0, { altitudeKm: 550, climb: 0.04, padLift: 0.0012 });
    const karman = rayonCouche(100, { altitudeKm: 550, climb: 0.04, padLift: 0.0012 });
    const orbite = rayonCouche(550, { altitudeKm: 550, climb: 0.04, padLift: 0.0012 });
    expect(bas).toBeCloseTo(1.0012, 6);
    expect(karman).toBeGreaterThan(bas);
    expect(karman).toBeLessThan(orbite);
    expect(orbite).toBeCloseTo(1.0412, 6);
  });
});
