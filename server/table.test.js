import { describe, expect, it } from 'vitest';
import { creerTable } from './table.js';

const ROLES = ['directeur', 'ingenieur_vehicule', 'ingenieur_systemes', 'responsable_science'];

describe('table à 4', () => {
  it('donne un poste distinct à chaque joueur et refuse le cinquième', () => {
    const table = creerTable();
    const ids = ['Ada', 'Bo', 'Clea', 'Dan'].map((nom) => table.rejoindre(nom).joueur.id);
    expect(table.rejoindre('Eve').raison).toBe('complet');
    ids.forEach((id, i) => expect(table.prendre(id, ROLES[i]).ok).toBe(true));
    expect(table.prendre(ids[1], 'directeur').raison).toBe('pris');
    expect(table.etat().prete).toBe(true);
    expect(table.etat().joueurs.map((j) => j.roleId)).toEqual(ROLES);
  });

  it('libère le poste quand le joueur part, et seul l\'hôte lance', () => {
    const table = creerTable();
    const hote = table.rejoindre('Ada').joueur.id;
    const autre = table.rejoindre('Bo').joueur.id;
    table.prendre(hote, 'directeur');
    expect(table.lancer(hote, 'chapitre_01').raison).toBe('incomplete');
    table.prendre(autre, 'ingenieur_vehicule');
    const trois = table.rejoindre('Clea').joueur.id;
    const quatre = table.rejoindre('Dan').joueur.id;
    table.prendre(trois, 'ingenieur_systemes');
    table.prendre(quatre, 'responsable_science');
    expect(table.lancer(autre, 'chapitre_01').raison).toBe('hote');
    expect(table.lancer(hote, 'chapitre_09').raison).toBe('chapitre');
    expect(table.lancer(hote, 'chapitre_01').chapterId).toBe('chapitre_01');
    table.quitter(autre);
    expect(table.etat().prete).toBe(false);
    expect(table.etat().hote).toBe(hote);
    expect(table.prendre(hote, 'ingenieur_vehicule').ok).toBe(true);
  });
});
