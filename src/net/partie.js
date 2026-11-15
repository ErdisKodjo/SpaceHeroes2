// Lien avec le serveur de table. Les jauges affichées viennent de là.

let socket = null;
let jauges = null;
let monId = null;
let equipiers = [];
let serveurForce = null;
const ecouteurs = new Set();

function diffuser(message) {
  if (message.jauges) jauges = message.jauges;
  if (message.type === 'toi') monId = message.id;
  if (message.etat?.joueurs) equipiers = message.etat.joueurs;
  for (const fn of ecouteurs) fn(message);
}

export function jaugesCourantes() {
  return jauges;
}

export function moiTable() {
  return monId;
}

export function equipiersTable() {
  return equipiers;
}

export function definirServeur(valeur) {
  const propre = String(valeur ?? '').trim().replace(/\/.*$/, '');
  if (!propre) {
    serveurForce = null;
    return null;
  }
  if (!/^[A-Za-z0-9.-]+(?::\d{1,5})?$/.test(propre)) return null;
  serveurForce = propre.includes(':') ? propre : `${propre}:8787`;
  return serveurForce;
}

export function adresseTable(lieu = globalThis.location) {
  const scheme = lieu?.protocol === 'https:' ? 'wss' : 'ws';
  if (serveurForce) return `${scheme}://${serveurForce}`;
  const demande = lieu?.search ? new URLSearchParams(lieu.search).get('serveur') : null;
  if (demande) {
    const propre = String(demande).trim().replace(/\/.*$/, '');
    if (/^[A-Za-z0-9.-]+(?::\d{1,5})?$/.test(propre)) {
      return `${scheme}://${propre.includes(':') ? propre : `${propre}:8787`}`;
    }
  }
  const hotePage = lieu?.hostname || '127.0.0.1';
  return `${scheme}://${hotePage}:8787`;
}

export function ouvrirTable() {
  if (socket && socket.readyState < 2) return socket;
  jauges = null;
  socket = new WebSocket(adresseTable());
  socket.addEventListener('message', (event) => {
    try {
      diffuser(JSON.parse(event.data));
    } catch {
      // message illisible
    }
  });
  return socket;
}

export function envoyerTable(message) {
  if (socket?.readyState === 1) socket.send(JSON.stringify(message));
}

export function suivreTable(fn) {
  ecouteurs.add(fn);
  return () => ecouteurs.delete(fn);
}

export function couperTable() {
  socket?.close();
  socket = null;
  jauges = null;
  monId = null;
  equipiers = [];
  ecouteurs.clear();
}
