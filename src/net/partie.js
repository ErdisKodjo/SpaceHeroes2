// Lien avec le serveur de table. Les jauges affichées viennent de là.

let socket = null;
let jauges = null;
const ecouteurs = new Set();

function diffuser(message) {
  if (message.jauges) jauges = message.jauges;
  for (const fn of ecouteurs) fn(message);
}

export function jaugesCourantes() {
  return jauges;
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
  ecouteurs.clear();
}
