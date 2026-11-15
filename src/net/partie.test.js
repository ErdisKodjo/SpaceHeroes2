import { describe, expect, it } from 'vitest';
import { adresseTable, definirServeur } from './partie.js';

describe('adresseTable', () => {
  it('suit le nom de la page', () => {
    expect(adresseTable({ hostname: '192.168.1.20', protocol: 'http:', search: '' }))
      .toBe('ws://192.168.1.20:8787');
  });

  it('prend le serveur demandé dans l\'adresse', () => {
    expect(adresseTable({ hostname: '127.0.0.1', protocol: 'https:', search: '?serveur=table.exemple:9000' }))
      .toBe('wss://table.exemple:9000');
  });

  it('ignore un serveur illisible', () => {
    expect(adresseTable({ hostname: '10.0.0.4', protocol: 'http:', search: '?serveur=http://mauvais' }))
      .toBe('ws://10.0.0.4:8787');
  });

  it('retient un serveur déjà joignable', () => {
    expect(definirServeur('table.exemple')).toBe('table.exemple:8787');
    expect(adresseTable({ hostname: '127.0.0.1', protocol: 'http:', search: '' }))
      .toBe('ws://table.exemple:8787');
    definirServeur('');
  });
});
