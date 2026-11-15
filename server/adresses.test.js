import { describe, expect, it } from 'vitest';
import { adressesIpv4 } from './adresses.js';

describe('adressesIpv4', () => {
  it('garde les IPv4 externes et écarte le reste', () => {
    const vues = adressesIpv4({
      loopback: [{ family: 'IPv4', internal: true, address: '127.0.0.1' }],
      wifi: [
        { family: 'IPv6', internal: false, address: 'fe80::1' },
        { family: 'IPv4', internal: false, address: '192.168.1.20' }
      ],
      autre: [{ family: 4, internal: false, address: '10.0.0.8' }]
    });
    expect(vues).toEqual(['192.168.1.20', '10.0.0.8']);
  });
});
