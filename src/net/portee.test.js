import { describe, expect, it } from 'vitest';
import { classerAdresse, trierAdresses } from './portee.js';

describe('classerAdresse', () => {
  it('sépare le réseau local, une adresse joignable, et le partage opérateur', () => {
    expect(classerAdresse('192.168.1.20')).toBe('locale');
    expect(classerAdresse('10.0.0.8')).toBe('locale');
    expect(classerAdresse('172.18.240.1')).toBe('locale');
    expect(classerAdresse('203.0.113.9')).toBe('partagee');
    expect(classerAdresse('100.79.189.22')).toBe('inexploitable');
    expect(classerAdresse('169.254.1.1')).toBe('inexploitable');
  });

  it('ne met une adresse de partage opérateur dans aucune liste utile', () => {
    expect(trierAdresses(['192.168.1.20', '100.79.189.22', '203.0.113.9'])).toEqual({
      locales: ['192.168.1.20'],
      partagees: ['203.0.113.9']
    });
  });
});
