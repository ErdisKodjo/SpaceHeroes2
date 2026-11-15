// Maillage audio de la table. Le serveur ne reçoit que la signalisation.

import { envoyerTable } from './partie.js';

const GLACE = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

const pcs = new Map();
const noms = new Map();
let monId = null;
let flux = null;
let erreur = '';
const ecouteurs = new Set();

function publier() {
  const relies = [...pcs.entries()]
    .filter(([, pc]) => pc.connectionState === 'connected')
    .map(([id]) => noms.get(id) || id);
  const etat = { micro: Boolean(flux), relies, erreur };
  for (const fn of ecouteurs) fn(etat);
}

function signaler(pour, charge) {
  envoyerTable({ type: 'voix', pour, charge });
}

function creerPaire(id) {
  if (pcs.has(id) || id === monId) return;
  const pc = new RTCPeerConnection(GLACE);
  pcs.set(id, pc);
  const polite = monId > id;
  let makingOffer = false;
  let ignoreOffer = false;

  pc.onnegotiationneeded = async () => {
    try {
      makingOffer = true;
      await pc.setLocalDescription();
      signaler(id, { kind: 'offre', sdp: pc.localDescription.sdp });
    } catch (err) {
      erreur = err?.message || 'offre';
    } finally {
      makingOffer = false;
      publier();
    }
  };
  pc.onicecandidate = (event) => {
    if (event.candidate) signaler(id, { kind: 'glace', candidate: event.candidate.toJSON() });
  };
  pc.onconnectionstatechange = () => publier();
  pc.ontrack = (event) => {
    let audio = document.getElementById(`sh-voix-${id}`);
    if (!audio) {
      audio = document.createElement('audio');
      audio.id = `sh-voix-${id}`;
      audio.autoplay = true;
      document.body.appendChild(audio);
    }
    audio.srcObject = event.streams[0];
    audio.play?.().catch(() => {});
  };

  if (flux) {
    for (const piste of flux.getAudioTracks()) pc.addTrack(piste, flux);
  }

  pc._recevoir = async (charge) => {
    if (charge.kind === 'glace' && charge.candidate) {
      try { await pc.addIceCandidate(charge.candidate); } catch { /* candidat tardif */ }
      return;
    }
    if (charge.kind !== 'offre' && charge.kind !== 'reponse') return;
    const description = { type: charge.kind === 'offre' ? 'offer' : 'answer', sdp: charge.sdp };
    const collision = description.type === 'offer' && (makingOffer || pc.signalingState !== 'stable');
    ignoreOffer = !polite && collision;
    if (ignoreOffer) return;
    await pc.setRemoteDescription(description);
    if (description.type === 'offer') {
      await pc.setLocalDescription();
      signaler(id, { kind: 'reponse', sdp: pc.localDescription.sdp });
    }
  };
}

function fermerPaire(id) {
  pcs.get(id)?.close();
  pcs.delete(id);
  document.getElementById(`sh-voix-${id}`)?.remove();
}

export function suivreVoix(fn) {
  ecouteurs.add(fn);
  fn({ micro: Boolean(flux), relies: [], erreur });
  return () => ecouteurs.delete(fn);
}

export function mettrePaires(id, joueurs = []) {
  monId = id || monId;
  if (!monId || typeof RTCPeerConnection === 'undefined') return;
  for (const joueur of joueurs) noms.set(joueur.id, joueur.nom);
  const autres = joueurs.map((joueur) => joueur.id).filter((autre) => autre !== monId);
  for (const idPaire of [...pcs.keys()]) {
    if (!autres.includes(idPaire)) fermerPaire(idPaire);
  }
  for (const autre of autres) creerPaire(autre);
  publier();
}

export async function recevoirVoix(message) {
  const pc = pcs.get(message.de);
  if (!pc || !message.charge) return;
  try {
    await pc._recevoir(message.charge);
  } catch (err) {
    erreur = err?.message || 'signal';
    publier();
  }
}

export async function ouvrirMicro() {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    erreur = 'micro';
    publier();
    return false;
  }
  try {
    flux = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    erreur = '';
    for (const pc of pcs.values()) {
      for (const piste of flux.getAudioTracks()) {
        const deja = pc.getSenders().some((sender) => sender.track === piste);
        if (!deja) pc.addTrack(piste, flux);
      }
    }
    publier();
    return true;
  } catch {
    erreur = 'refuse';
    publier();
    return false;
  }
}

export function fermerMicro() {
  for (const piste of flux?.getTracks?.() || []) piste.stop();
  for (const pc of pcs.values()) {
    for (const sender of pc.getSenders()) {
      if (sender.track) pc.removeTrack(sender);
    }
  }
  flux = null;
  publier();
}

export function couperVoix() {
  fermerMicro();
  for (const id of [...pcs.keys()]) fermerPaire(id);
  noms.clear();
  monId = null;
  erreur = '';
  publier();
}

export function etatVoix() {
  return { micro: Boolean(flux), erreur };
}
