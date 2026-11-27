import { setStorageProvider } from './persistence.js';

let remote = false;
let session = null;
let currentState = { parameters: [], orders: [], audit: [], users: [] };
const cache = new Map();
const memoryStorage = {
  getItem: key => cache.has(key) ? cache.get(key) : null,
  setItem: (key, value) => cache.set(key, String(value)),
  removeItem: key => cache.delete(key)
};

export const isRemoteMode = () => remote;
export const getRemoteSession = () => session;
export const getRemoteState = () => currentState;

export function hydrateRemoteState(state) {
  currentState = state || { parameters: [], orders: [], audit: [], users: [] };
  cache.clear();
  for (const [key, value] of Object.entries(state?.storage || {})) cache.set(key, String(value));
  if (typeof window !== 'undefined') window.dispatchEvent(new window.CustomEvent('quality:state', { detail: currentState }));
}

export function installRemoteSession(payload) {
  remote = true;
  session = payload.authenticated ? { user: payload.user, csrf: payload.csrf, config: payload.config } : null;
  setStorageProvider(() => memoryStorage);
  hydrateRemoteState(payload.state);
}

export async function apiRequest(path, { method = 'GET', body } = {}) {
  const response = await fetch(`/api${path}`, {
    method, credentials: 'same-origin',
    headers: { ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}), ...(method !== 'GET' && session ? { 'X-CSRF-Token': session.csrf } : {}) },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {})
  });
  const payload = await response.json();
  if (!response.ok) {
    if (response.status === 401 && session && path !== '/password') {
      session = null; hydrateRemoteState(null);
      if (typeof window !== 'undefined') window.dispatchEvent(new window.CustomEvent('quality:session-ended'));
    }
    const message = payload.error || 'Revisa los campos indicados antes de guardar.';
    const error = new Error(message); error.status = response.status; error.fields = payload.fields; throw error;
  }
  if (payload.state) hydrateRemoteState(payload.state);
  return payload;
}

export async function remoteMutation(action, args = []) {
  const payload = await apiRequest('/actions', { method: 'POST', body: { action, args } });
  if (payload.alert && typeof window !== 'undefined') window.dispatchEvent(new window.CustomEvent('quality:alert', { detail: payload.alert }));
  return payload.result;
}

export async function remoteAssignRole(id, role) {
  return apiRequest(`/users/${encodeURIComponent(id)}`, { method: 'PATCH', body: { role } });
}

export function clearRemoteSession() {
  session = null;
  hydrateRemoteState(null);
}

export async function refreshRemoteState() {
  const payload = await apiRequest('/state');
  return payload.state;
}
