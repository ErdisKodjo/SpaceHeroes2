// Le serveur ne lit pas la voix. Il désigne seulement le navigateur destinataire.

export function destinataire(sieges, de, pour) {
  if (typeof pour !== 'string' || !pour || pour === de) return null;
  for (const [socket, id] of sieges) {
    if (id === pour) return socket;
  }
  return null;
}

export function chargeValide(charge) {
  if (!charge || typeof charge !== 'object') return false;
  if (charge.kind === 'offre' || charge.kind === 'reponse') {
    return typeof charge.sdp === 'string' && charge.sdp.length > 0 && charge.sdp.length < 60000;
  }
  if (charge.kind === 'glace') return Boolean(charge.candidate) && typeof charge.candidate === 'object';
  return false;
}
