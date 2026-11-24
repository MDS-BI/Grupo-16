export const PERMISSIONS = [
  { id: 'manage-records', description: 'Administrar registros de calidad' },
  { id: 'manage-config', description: 'Configurar el módulo' },
  { id: 'manage-permissions', description: 'Administrar usuarios y permisos' },
  { id: 'create-master-data', description: 'Crear datos maestros' },
  { id: 'edit-master-data', description: 'Editar datos maestros' },
  { id: 'delete-master-data', description: 'Eliminar datos maestros' },
  { id: 'create-operational', description: 'Crear registros operativos' },
  { id: 'edit-operational', description: 'Editar registros operativos' },
  { id: 'delete-operational', description: 'Eliminar registros operativos' },
  { id: 'register-inspections', description: 'Registrar inspecciones' },
  { id: 'report-ncr', description: 'Reportar no conformidades' },
  { id: 'read', description: 'Consultar registros' },
  { id: 'audit', description: 'Auditar registros' }
];

export const ROLES = ['Administrador', 'Gestor de Calidad', 'Inspector de Planta', 'Auditor'];

export const ROLE_PERMISSIONS = {
  'Administrador': PERMISSIONS.map(permission => permission.id),
  'Gestor de Calidad': [
    'manage-records',
    'create-master-data',
    'edit-master-data',
    'delete-master-data',
    'create-operational',
    'edit-operational',
    'delete-operational',
    'register-inspections',
    'report-ncr',
    'read',
    'audit'
  ],
  'Inspector de Planta': [
    'create-master-data',
    'edit-master-data',
    'register-inspections',
    'report-ncr',
    'read'
  ],
  'Auditor': ['read', 'audit']
};

const ACTION_PERMISSIONS = {
  'create-master': 'create-master-data',
  'edit-master': 'edit-master-data',
  'delete-master': 'delete-master-data',
  'create-document': 'create-operational',
  'edit-document': 'edit-operational',
  'delete-document': 'delete-operational',
  'manage-config': 'manage-config',
  'manage-users': 'manage-permissions',
  'read': 'read',
  'audit': 'audit'
};

const USERS_KEY = 'quality-users';
const SESSION_KEY = 'quality-session';

const DEFAULT_USERS = [
  { id: 'user-admin', name: 'Admin', role: 'Administrador' },
  { id: 'user-gestor', name: 'Gestor', role: 'Gestor de Calidad' },
  { id: 'user-inspector', name: 'Inspector', role: 'Inspector de Planta' },
  { id: 'user-auditor', name: 'Auditor', role: 'Auditor' }
];

function defaultUsers() {
  return DEFAULT_USERS.map(user => ({ ...user }));
}

function parseUsers(raw) {
  if (raw === null || raw === undefined) {
    return null;
  }
  try {
    const users = JSON.parse(raw);
    return Array.isArray(users) ? users : null;
  } catch {
    return null;
  }
}

export function can(user, permission) {
  const role = typeof user === 'string' ? user : user && user.role;
  if (!ROLES.includes(role)) {
    return false;
  }
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function requiredPermission(action) {
  return Object.prototype.hasOwnProperty.call(ACTION_PERMISSIONS, action) ? ACTION_PERMISSIONS[action] : null;
}

export function loadUsers() {
  const users = parseUsers(localStorage.getItem(USERS_KEY));
  return users === null ? defaultUsers() : users.map(user => ({ ...user }));
}

export function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return users;
}

export function assignRole(userId, role) {
  if (!ROLES.includes(role)) {
    throw new Error(`Rol inválido: ${role}`);
  }
  const users = loadUsers();
  const user = users.find(candidate => candidate.id === userId);
  if (!user) {
    throw new Error('Usuario no encontrado');
  }
  user.role = role;
  saveUsers(users);
  return { ...user };
}

export function getActiveUser() {
  const raw = localStorage.getItem(SESSION_KEY);
  if (raw !== null && raw !== undefined && raw !== '') {
    let id = raw;
    if (raw.startsWith('"')) {
      try {
        id = JSON.parse(raw);
      } catch {
        id = raw;
      }
    }
    const user = loadUsers().find(candidate => candidate.id === id);
    if (user) {
      return user;
    }
  }
  return defaultUsers()[0];
}

export function setActiveUser(userId) {
  const user = loadUsers().find(candidate => candidate.id === userId);
  if (!user) {
    throw new Error('Usuario no encontrado');
  }
  localStorage.setItem(SESSION_KEY, userId);
  return { ...user };
}

export function ensureDefaultUsers() {
  if (localStorage.getItem(USERS_KEY) === null) {
    saveUsers(defaultUsers());
  }
}

export function validateRoleDefinition(role, permissions) {
  const errors = [];
  if (!ROLES.includes(role)) {
    errors.push(`Rol inválido: ${role}`);
  }
  if (!Array.isArray(permissions)) {
    errors.push('permissions debe ser un arreglo');
  } else {
    const knownIds = PERMISSIONS.map(permission => permission.id);
    for (const permission of permissions) {
      if (!knownIds.includes(permission)) {
        errors.push(`Permiso desconocido: ${permission}`);
      }
    }
  }
  return { valid: errors.length === 0, errors };
}
