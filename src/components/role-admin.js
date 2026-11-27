import { PERMISSIONS, ROLES } from '../permissions.js';
import { escapeHtml } from './html.js';

export function renderRoleAdmin(users, activeUserId) {
  if (!users.length) return `<p class="empty-state">No hay usuarios registrados.</p>`;
  return users.map(user => `<li class="entity-item" data-user-id="${escapeHtml(user.id)}">
    <strong>${escapeHtml(user.name)}</strong>
    <label for="role-${escapeHtml(user.id)}">Rol</label>
    <select id="role-${escapeHtml(user.id)}" data-user-role="${escapeHtml(user.id)}">
      ${ROLES.map(role => `<option value="${escapeHtml(role)}" ${role === user.role ? 'selected' : ''}>${escapeHtml(role)}</option>`).join('')}
    </select>
    ${user.id === activeUserId ? '<span class="badge">Sesión activa</span>' : ''}
  </li>`).join('');
}

export function renderPermissionCatalog() {
  return PERMISSIONS.map(permission => `<li>${permission.description} <code>${permission.id}</code></li>`).join('');
}

export function renderUserSwitcher(users, activeUserId) {
  return `<label for="active-user">Usuario activo</label>
    <select id="active-user">${users.map(user =>
      `<option value="${escapeHtml(user.id)}" ${user.id === activeUserId ? 'selected' : ''}>${escapeHtml(user.name)} — ${escapeHtml(user.role)}</option>`
    ).join('')}</select>`;
}

export function readRoleAssignments(root = document) {
  return [...root.querySelectorAll('[data-user-role]')].map(select => ({
    id: select.dataset.userRole,
    role: select.value
  }));
}
