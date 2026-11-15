// Adresses IPv4 à donner aux autres machines. L'interface interne ne sert pas.

import os from 'node:os';

export function adressesIpv4(cartes = os.networkInterfaces()) {
  const vues = [];
  for (const liste of Object.values(cartes || {})) {
    for (const carte of liste || []) {
      const v4 = carte.family === 'IPv4' || carte.family === 4;
      if (!v4 || carte.internal) continue;
      if (!vues.includes(carte.address)) vues.push(carte.address);
    }
  }
  return vues;
}
