import { escapeHtml } from './html.js';

export function renderAuthScreen({ setupRequired = false } = {}) {
  const setupForm = setupRequired ? `
    <form id="setup-form" class="auth-form">
      <h2>Configuración inicial</h2>
      <p class="hint">Solo se realiza una vez. Necesita el código local de instalación que aparece al iniciar el servidor.</p>
      <div class="field"><label for="setup-token">Código de instalación *</label><input type="password" id="setup-token" autocomplete="off" required></div>
      <div class="field"><label for="setup-username">Usuario del Administrador *</label><input type="text" id="setup-username" autocomplete="username" required></div>
      <div class="field"><label for="setup-name">Nombre completo *</label><input type="text" id="setup-name" required></div>
      <div class="field"><label for="setup-password">Contraseña (mínimo 12 caracteres) *</label><input type="password" id="setup-password" autocomplete="new-password" minlength="12" maxlength="128" required></div>
      <button type="submit" id="setup-submit">Crear primer Administrador</button>
    </form>` : '';
  return `<section id="auth-screen" class="auth-screen" aria-labelledby="auth-heading">
    <div class="auth-card">
      <h1 id="auth-heading">Gestión de Calidad</h1>
      <p class="hint">Los datos de la planta simulada solo se muestran después de iniciar sesión.</p>
      <div id="auth-error" class="auth-message" role="alert" hidden></div>
      ${setupForm}
      <form id="login-form" class="auth-form" ${setupRequired ? 'hidden' : ''}>
        <h2>Iniciar sesión</h2>
        <div class="field"><label for="login-username">Usuario *</label><input type="text" id="login-username" autocomplete="username" required></div>
        <div class="field"><label for="login-password">Contraseña *</label><input type="password" id="login-password" autocomplete="current-password" required></div>
        <button type="submit" id="login-submit">Entrar al módulo</button>
      </form>
    </div>
  </section>`;
}

export function showAuthError(screen, message) {
  const error = screen?.querySelector('#auth-error');
  if (!error) return;
  error.textContent = message || 'No se pudo completar la operación.';
  error.hidden = false;
}

export function hideAuthError(screen) {
  const error = screen?.querySelector('#auth-error');
  if (!error) return;
  error.textContent = '';
  error.hidden = true;
}

export function authFields(screen) {
  const value = id => screen?.querySelector(`#${id}`)?.value || '';
  return {
    setupToken: value('setup-token'),
    username: value('setup-username') || value('login-username'),
    name: value('setup-name'),
    password: value('setup-password') || value('login-password')
  };
}

export function authPanel(title, detail) {
  return `<div class="auth-panel"><h2>${escapeHtml(title)}</h2><p>${escapeHtml(detail)}</p></div>`;
}
