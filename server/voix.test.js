import { describe, expect, it } from 'vitest';
import { chargeValide, destinataire } from './voix.js';

describe('signalisation voix', () => {
  it('adresse le message à l\'autre joueur, pas à l\'émetteur', () => {
    const ada = { nom: 'ada' };
    const bo = { nom: 'bo' };
    const sieges = new Map([[ada, 'j1'], [bo, 'j2']]);
    expect(destinataire(sieges, 'j1', 'j2')).toBe(bo);
    expect(destinataire(sieges, 'j1', 'j1')).toBe(null);
    expect(destinataire(sieges, 'j1', 'j9')).toBe(null);
  });

  it('accepte une offre et un candidat, refuse le reste', () => {
    expect(chargeValide({ kind: 'offre', sdp: 'v=0' })).toBe(true);
    expect(chargeValide({ kind: 'glace', candidate: { candidate: 'a' } })).toBe(true);
    expect(chargeValide({ kind: 'offre', sdp: '' })).toBe(false);
    expect(chargeValide({ kind: 'audio' })).toBe(false);
  });
});
