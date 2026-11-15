// Bouton du micro de la table. La voix d'ASTRA n'emprunte pas ce canal.

import { t } from '../i18n.js';
import { fermerMicro, ouvrirMicro, suivreVoix } from '../net/voix.js';

let barreCourante = null;

export function monterVoix(parent = document.body) {
  if (barreCourante) return barreCourante;
  const barre = document.createElement('div');
  barre.className = 'sh-voix-barre';
  parent.appendChild(barre);

  function dessiner(etat) {
    const relies = etat.relies?.length
      ? etat.relies.join(', ')
      : t('aucun joueur relié', 'no player connected');
    const detail = etat.erreur === 'refuse'
      ? t('Le micro n\'est pas autorisé.', 'The microphone is not allowed.')
      : etat.micro
        ? t(`Micro ouvert · ${relies}`, `Microphone open · ${relies}`)
        : t('Micro fermé.', 'Microphone closed.');
    barre.innerHTML = `
      <button type="button" id="sh-voix-micro">${etat.micro ? t('Couper le micro', 'Mute the microphone') : t('Ouvrir le micro', 'Open the microphone')}</button>
      <span>${detail}</span>
    `;
    barre.querySelector('#sh-voix-micro').addEventListener('click', () => {
      if (etat.micro) fermerMicro();
      else ouvrirMicro();
    });
  }

  const oublier = suivreVoix(dessiner);
  barreCourante = {
    dispose() {
      oublier();
      barre.remove();
      barreCourante = null;
    }
  };
  return barreCourante;
}
