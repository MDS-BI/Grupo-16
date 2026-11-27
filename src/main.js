import { loadModuleConfig, setActiveConfig, QUALITY_CONFIG, normalizeConfig } from './module-config.js';
import { initApp } from './app.js';
import { apiRequest, installRemoteSession, clearRemoteSession } from './remote-session.js';
import { renderAuthScreen, showAuthError, hideAuthError, authFields } from './components/auth-screen.js';

let appStarted = false;

function shell() {
  return typeof document === 'undefined' ? null : document.querySelector('.workspace-shell');
}

function showShell(visible) {
  const element = shell();
  if (element) element.hidden = !visible;
}

function removeAuthScreen() {
  document.getElementById('auth-screen')?.remove();
}

function paintAuth(setupRequired, message = '') {
  showShell(false);
  let screen = document.getElementById('auth-screen');
  if (!screen || Boolean(screen.querySelector('#setup-form')) !== Boolean(setupRequired)) {
    removeAuthScreen();
    document.body.insertAdjacentHTML('afterbegin', renderAuthScreen({ setupRequired }));
    screen = document.getElementById('auth-screen');
  }
  if (message) showAuthError(screen, message);
  else hideAuthError(screen);
  bindAuthForms(screen, setupRequired);
}

function bindAuthForms(screen, setupRequired) {
  const submit = async (form, path, body, event) => {
    event.preventDefault();
    hideAuthError(screen);
    const button = form.querySelector('button[type="submit"]');
    if (button) button.disabled = true;
    try {
      const payload = await apiRequest(path, { method: 'POST', body });
      await enterApp(payload);
    } catch (error) {
      showAuthError(screen, error.message || 'No se pudo completar la operación.');
    } finally {
      if (button && button.isConnected) button.disabled = false;
    }
  };
  const login = screen.querySelector('#login-form');
  if (login) {
    login.onsubmit = event => {
      event.preventDefault();
      const fields = authFields(screen);
      if (!fields.username || !fields.password) {
        showAuthError(screen, 'Indica tu usuario y contraseña para entrar.');
        return;
      }
      return submit(login, '/login', { username: fields.username, password: fields.password }, event);
    };
  }
  if (setupRequired) {
    const setup = screen.querySelector('#setup-form');
    if (setup) {
      setup.onsubmit = event => {
        event.preventDefault();
        const fields = authFields(screen);
        if (!fields.setupToken || !fields.username || !fields.name || !fields.password) {
          showAuthError(screen, 'Completa el código de instalación, el usuario, el nombre y la contraseña.');
          return;
        }
        return submit(setup, '/setup', {
          setupToken: fields.setupToken,
          username: fields.username,
          name: fields.name,
          password: fields.password
        }, event);
      };
    }
  }
}

async function enterApp(payload) {
  if (appStarted) {
    window.location.reload();
    return;
  }
  installRemoteSession(payload);
  const config = normalizeConfig(payload.config || QUALITY_CONFIG).config;
  setActiveConfig(config);
  document.body.dataset.userName = payload.user?.name || '';
  document.body.dataset.userRole = payload.user?.role || '';
  removeAuthScreen();
  showShell(true);
  if (!appStarted) {
    appStarted = true;
    await initApp(await loadModuleConfig());
  }
}

export async function main() {
  if (typeof window === 'undefined') return;
  window.addEventListener('quality:session-ended', () => {
    clearRemoteSession();
    paintAuth(false, 'La sesión terminó. Vuelve a entrar para consultar los datos.');
  });
  try {
    const payload = await apiRequest('/session');
    if (payload.authenticated) await enterApp(payload);
    else paintAuth(Boolean(payload.setupRequired));
  } catch (error) {
    paintAuth(false, `No se pudo conectar con el servidor de calidad. ${error.message || ''}`.trim());
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => { main(); });
}
