import { PERMISSIONS, ROLES } from '../permissions.js';

export function renderRoleAdmin(users, activeUserId) {
  if (!users.length) return `<p class="empty-state">No hay usuarios registrados.</p>`;
  return users.map(user => `<li class="entity-item" data-user-id="${user.id}">
    <strong>${user.name}</strong>
    <label for="role-${user.id}">Rol</label>
    <select id="role-${user.id}" data-user-role="${user.id}">
      ${ROLES.map(role => `<option value="${role}" ${role === user.role ? 'selected' : ''}>${role}</option>`).join('')}
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
      `<option value="${user.id}" ${user.id === activeUserId ? 'selected' : ''}>${user.name} — ${user.role}</option>`
    ).join('')}</select>`;
}

export function readRoleAssignments(root = document) {
  return [...root.querySelectorAll('[data-user-role]')].map(select => ({
    id: select.dataset.userRole,
    role: select.value
  }));
}
