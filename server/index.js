// Processus multijoueur. Il tourne à part de Vite : le navigateur ne charge pas ce fichier.
// Une table, quatre postes. Les jauges et le veto de la partie lancée vivent ici.

import http from 'node:http';
import { WebSocketServer } from 'ws';
import { creerTable } from './table.js';
import { contraintesChapitre, creerJauges } from './jauges.js';
import { chargeValide, destinataire } from './voix.js';

const port = Number(process.env.PORT) || 8787;
const table = creerTable();
let jauges = null;

const server = http.createServer((req, res) => {
  if (req.url === '/sante') {
    const etat = table.etat();
    res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      service: 'space-heroes',
      transport: 'websocket',
      joueurs: etat.joueurs.length,
      prete: etat.prete,
      reserveVeto: jauges ? jauges.etat().reserveVeto : null
    }));
    return;
  }
  res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
  res.end('introuvable');
});

const wss = new WebSocketServer({ server });
const sieges = new Map();

function envoyer(socket, message) {
  if (socket.readyState === 1) socket.send(JSON.stringify(message));
}

function diffuserJauges(extra = {}) {
  const etat = jauges.etat();
  for (const client of wss.clients) envoyer(client, { type: 'jauges', jauges: etat, ...extra });
}

function roleDe(id) {
  return table.etat().joueurs.find((j) => j.id === id)?.roleId || null;
}

function diffuser() {
  const etat = table.etat();
  for (const client of wss.clients) envoyer(client, { type: 'etat', etat });
}

wss.on('connection', (socket) => {
  socket.on('message', (raw) => {
    const taille = Buffer.byteLength(raw);
    if (taille > 65536) return;
    let message;
    try {
      message = JSON.parse(String(raw));
    } catch {
      return;
    }
    if (message.type !== 'voix' && taille > 2048) return;
    const id = sieges.get(socket);
    if (message.type === 'rejoindre' && !id) {
      const res = table.rejoindre(message.nom);
      if (!res.ok) {
        envoyer(socket, { type: 'refus', raison: res.raison });
        return;
      }
      sieges.set(socket, res.joueur.id);
      envoyer(socket, { type: 'toi', id: res.joueur.id });
      diffuser();
      return;
    }
    if (!id) return;
    if (message.type === 'prendre') {
      const res = table.prendre(id, message.roleId);
      if (!res.ok) envoyer(socket, { type: 'refus', raison: res.raison });
      diffuser();
      return;
    }
    if (message.type === 'liberer') {
      table.liberer(id);
      diffuser();
      return;
    }
    if (message.type === 'voix') {
      if (!chargeValide(message.charge)) return;
      const cible = destinataire(sieges, id, message.pour);
      if (cible) envoyer(cible, { type: 'voix', de: id, charge: message.charge });
      return;
    }
    if (message.type === 'lancer') {
      const res = table.lancer(id, message.chapterId);
      if (!res.ok) {
        envoyer(socket, { type: 'refus', raison: res.raison });
        return;
      }
      jauges = creerJauges(contraintesChapitre(res.chapterId));
      const depart = { type: 'depart', chapterId: res.chapterId, etat: res.etat, jauges: jauges.etat() };
      for (const client of wss.clients) envoyer(client, depart);
      return;
    }
    if (!jauges) return;
    if (message.type === 'depense') {
      const res = jauges.depense(message.key, message.amount);
      if (!res.ok) envoyer(socket, { type: 'refus', raison: res.raison });
      else diffuserJauges();
      return;
    }
    if (message.type === 'usage') {
      const res = jauges.usage(message.used);
      if (!res.ok) envoyer(socket, { type: 'refus', raison: res.raison });
      else diffuserJauges();
      return;
    }
    if (message.type === 'plafond') {
      const res = jauges.plafond(message.key, message.delta);
      if (!res.ok) envoyer(socket, { type: 'refus', raison: res.raison });
      else diffuserJauges();
      return;
    }
    if (message.type === 'veto') {
      const res = jauges.veto(roleDe(id));
      if (!res.ok) envoyer(socket, { type: 'refus', raison: res.raison });
      else diffuserJauges({ type: 'veto', ok: true });
      return;
    }
    if (message.type === 'score') {
      const joueur = table.etat().joueurs.find((j) => j.id === id);
      if (!joueur) return;
      jauges.noterScore({
        id,
        nom: joueur.nom,
        roleId: joueur.roleId,
        score: message.score,
        medaille: message.medaille || 'aucune'
      });
      diffuserJauges();
    }
  });

  socket.on('close', () => {
    const id = sieges.get(socket);
    if (!id) return;
    sieges.delete(socket);
    table.quitter(id);
    diffuser();
  });
});

server.listen(port, '127.0.0.1', () => {
  console.log(`serveur multijoueur ws://127.0.0.1:${port}`);
});
