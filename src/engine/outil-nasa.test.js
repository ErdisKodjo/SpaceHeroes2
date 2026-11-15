import { describe, expect, it } from 'vitest';
import { outilNasa } from './bilan.js';

describe('outils cités au bilan', () => {
  it('nomme le logiciel de débris pour l’orbite basse', () => {
    expect(outilNasa('leo_cubesat')).toContain('Debris Assessment Software');
    expect(outilNasa('leo_cubesat')).toContain('200 km');
  });

  it('renvoie le Trajectory Browser vers les planètes, et garde GMAT pour la Lune', () => {
    expect(outilNasa('mars')).toContain('Trajectory Browser');
    expect(outilNasa('lune')).toContain('GMAT');
    expect(outilNasa('lune')).toContain('Trajectory Browser');
  });

  it('laisse les autres profils sans outil inventé', () => {
    expect(outilNasa('geo')).toBe('');
    expect(outilNasa('l1')).toBe('');
    expect(outilNasa('polaire')).toBe('');
  });
});
