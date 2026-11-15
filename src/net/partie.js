// Lien avec le serveur de table. Les jauges affichées viennent de là.

let socket = null;
let jauges = null;
let monId = null;
let equipiers = [];
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

export function ouvrirTable() {
  if (socket && socket.readyState < 2) return socket;
  jauges = null;
  socket = new WebSocket('ws://127.0.0.1:8787');
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
