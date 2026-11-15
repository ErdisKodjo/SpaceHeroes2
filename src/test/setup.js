const memoire = new Map();

globalThis.localStorage = {
  getItem(cle) {
    return memoire.has(cle) ? memoire.get(cle) : null;
  },
  setItem(cle, valeur) {
    memoire.set(cle, String(valeur));
  },
  removeItem(cle) {
    memoire.delete(cle);
  },
  clear() {
    memoire.clear();
  }
};

globalThis.CustomEvent = class CustomEvent {
  constructor(type, init = {}) {
    this.type = type;
    this.detail = init.detail;
  }
};

globalThis.window = {
  dispatchEvent() {},
  addEventListener() {},
  removeEventListener() {}
};
