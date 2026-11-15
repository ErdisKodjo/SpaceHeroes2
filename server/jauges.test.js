import { describe, expect, it } from 'vitest';
import { contraintesChapitre, creerJauges } from './jauges.js';

describe('jauges de la table', () => {
  it('part des contraintes du chapitre et refuse une jauge inconnue', () => {
    const jauges = creerJauges(contraintesChapitre('chapitre_01'));
    expect(jauges.etat().max.masse).toBe(4);
    expect(jauges.etat().reserveVeto).toBe(2);
    expect(jauges.depense('inconnu', 1).raison).toBe('jauge');
    expect(jauges.depense('masse', 1.5).etat.used.masse).toBe(1.5);
  });

  it('n\'accorde le veto qu\'au directeur, une fois, sans toucher la durée', () => {
    const jauges = creerJauges({ duree: 12 });
    expect(jauges.veto('ingenieur_vehicule').raison).toBe('role');
    const avant = jauges.etat().used.duree;
    const ok = jauges.veto('directeur');
    expect(ok.etat.reserveVeto).toBe(0);
    expect(ok.etat.vetoUtilise).toBe(true);
    expect(ok.etat.used.duree).toBe(avant);
    expect(jauges.veto('directeur').raison).toBe('reserve');
  });

  it('retient le score de chaque poste et le moment où une jauge se tend', () => {
    const jauges = creerJauges({ masse: 4, duree: 12 });
    jauges.depense('masse', 3.3);
    jauges.depense('masse', 0.1);
    expect(jauges.etat().moments.filter((m) => m.cle === 'masse').map((m) => m.niveau)).toEqual(['orange']);
    jauges.depense('masse', 1);
    expect(jauges.etat().moments.filter((m) => m.cle === 'masse').map((m) => m.niveau)).toEqual(['orange', 'rouge']);
    jauges.veto('directeur');
    expect(jauges.etat().moments.some((m) => m.type === 'veto')).toBe(true);
    jauges.noterScore({ id: 'j1', nom: 'Ada', roleId: 'directeur', score: 91, medaille: 'or' });
    jauges.noterScore({ id: 'j1', nom: 'Ada', roleId: 'directeur', score: 88, medaille: 'or' });
    expect(jauges.etat().rapports).toEqual([
      { id: 'j1', nom: 'Ada', roleId: 'directeur', score: 88, medaille: 'or' }
    ]);
  });
});
