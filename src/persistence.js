// A configurable storage boundary keeps the team's domain modules reusable.
// The server supplies a request-scoped SQLite adapter; authenticated browsers
// use an in-memory snapshot, and domain tests can retain their local adapter.
let provider = null;
const fallback = new Map();
const memory = {
  getItem: key => fallback.has(key) ? fallback.get(key) : null,
  setItem: (key, value) => fallback.set(key, String(value)),
  removeItem: key => fallback.delete(key)
};

export function setStorageProvider(next) { provider = next; }
export function getStorage() { return provider?.() || globalThis.localStorage || memory; }
