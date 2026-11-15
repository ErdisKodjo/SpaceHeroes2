// Portée d'une adresse IPv4. Une adresse de partage d'opérateur n'est pas joignable depuis ailleurs.

export function classerAdresse(ip) {
  const morceaux = String(ip).split('.');
  if (morceaux.length !== 4) return 'inexploitable';
  const nombres = morceaux.map((m) => Number(m));
  if (nombres.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return 'inexploitable';
  const [a, b] = nombres;
  if (a === 10 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168)) return 'locale';
  if (a === 127 || (a === 169 && b === 254) || (a === 100 && b >= 64 && b <= 127) || a >= 224) {
    return 'inexploitable';
  }
  return 'partagee';
}

export function trierAdresses(liste) {
  const locales = [];
  const partagees = [];
  for (const ip of liste || []) {
    const portee = classerAdresse(ip);
    if (portee === 'locale') locales.push(ip);
    if (portee === 'partagee') partagees.push(ip);
  }
  return { locales, partagees };
}
