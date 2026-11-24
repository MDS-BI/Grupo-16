import { describe, it, expect, beforeEach } from 'vitest';
import {
  PERMISSIONS,
  ROLES,
  ROLE_PERMISSIONS,
  can,
  requiredPermission,
  loadUsers,
  saveUsers,
  assignRole,
  getActiveUser,
  setActiveUser,
  ensureDefaultUsers,
  validateRoleDefinition
} from '../../src/permissions.js';

const store = new Map();
if (!globalThis.localStorage) {
  globalThis.localStorage = {
    getItem: key => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: key => store.delete(key),
    clear: () => store.clear()
  };
}

beforeEach(() => {
  localStorage.removeItem('quality-users');
  localStorage.removeItem('quality-session');
});

const allPermissionIds = [
  'manage-records',
  'manage-config',
  'manage-permissions',
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
];

const defaultUsers = [
  { id: 'user-admin', name: 'Admin', role: 'Administrador' },
  { id: 'user-gestor', name: 'Gestor', role: 'Gestor de Calidad' },
  { id: 'user-inspector', name: 'Inspector', role: 'Inspector de Planta' },
  { id: 'user-auditor', name: 'Auditor', role: 'Auditor' }
];

describe('catálogo y matriz de permisos', () => {
  it('define los 13 permisos con descripción', () => {
    expect(PERMISSIONS.map(permission => permission.id)).toEqual(allPermissionIds);
    for (const permission of PERMISSIONS) {
      expect(typeof permission.description).toBe('string');
      expect(permission.description.length).toBeGreaterThan(0);
    }
  });

  it('define los cuatro roles', () => {
    expect(ROLES).toEqual(['Administrador', 'Gestor de Calidad', 'Inspector de Planta', 'Auditor']);
  });

  it('asigna todos los permisos al Administrador', () => {
    expect(Object.keys(ROLE_PERMISSIONS)).toEqual(ROLES);
    expect(ROLE_PERMISSIONS['Administrador']).toEqual(allPermissionIds);
  });

  it('asigna al Gestor la administración de registros sin administrar usuarios ni configuración', () => {
    expect(ROLE_PERMISSIONS['Gestor de Calidad']).toEqual([
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
    ]);
  });

  it('asigna al Inspector creación y edición sin eliminación ni auditoría', () => {
    expect(ROLE_PERMISSIONS['Inspector de Planta']).toEqual([
      'create-master-data',
      'edit-master-data',
      'register-inspections',
      'report-ncr',
      'read'
    ]);
  });

  it('asigna al Auditor solo consulta y auditoría', () => {
    expect(ROLE_PERMISSIONS['Auditor']).toEqual(['read', 'audit']);
  });

  it('no incluye permisos desconocidos en la matriz', () => {
    for (const permissions of Object.values(ROLE_PERMISSIONS)) {
      for (const permission of permissions) {
        expect(allPermissionIds).toContain(permission);
      }
    }
  });
});

describe('guard central can()', () => {
  it('Administrador puede todo, como rol o como usuario', () => {
    for (const permission of allPermissionIds) {
      expect(can('Administrador', permission)).toBe(true);
      expect(can({ role: 'Administrador' }, permission)).toBe(true);
    }
  });

  it('Gestor no administra usuarios ni configuración', () => {
    expect(can('Gestor de Calidad', 'manage-permissions')).toBe(false);
    expect(can({ role: 'Gestor de Calidad' }, requiredPermission('manage-users'))).toBe(false);
    expect(can('Gestor de Calidad', 'manage-config')).toBe(false);
    expect(can('Gestor de Calidad', requiredPermission('create-master'))).toBe(true);
    expect(can('Gestor de Calidad', 'audit')).toBe(true);
  });

  it('Inspector no elimina registros', () => {
    expect(can('Inspector de Planta', 'delete-master-data')).toBe(false);
    expect(can('Inspector de Planta', 'delete-operational')).toBe(false);
    expect(can('Inspector de Planta', requiredPermission('delete-document'))).toBe(false);
    expect(can('Inspector de Planta', 'manage-records')).toBe(false);
    expect(can('Inspector de Planta', 'audit')).toBe(false);
    expect(can('Inspector de Planta', 'create-master-data')).toBe(true);
    expect(can('Inspector de Planta', 'register-inspections')).toBe(true);
  });

  it('Auditor solo consulta y audita', () => {
    expect(can('Auditor', 'read')).toBe(true);
    expect(can('Auditor', requiredPermission('audit'))).toBe(true);
    for (const permission of allPermissionIds.filter(id => !['read', 'audit'].includes(id))) {
      expect(can('Auditor', permission)).toBe(false);
    }
  });

  it('devuelve false para roles y acciones no autorizados', () => {
    expect(can('Usuario Fantasma', 'read')).toBe(false);
    expect(can(null, 'read')).toBe(false);
    expect(can({}, 'read')).toBe(false);
    expect(can('Administrador')).toBe(false);
    expect(can('Auditor', 'delete-master-data')).toBe(false);
  });
});

describe('requiredPermission()', () => {
  it('mapea las acciones conocidas a su permiso', () => {
    const actions = {
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
    for (const [action, permission] of Object.entries(actions)) {
      expect(requiredPermission(action)).toBe(permission);
      expect(allPermissionIds).toContain(permission);
    }
  });

  it('devuelve null para acciones desconocidas', () => {
    expect(requiredPermission('export')).toBeNull();
    expect(requiredPermission('')).toBeNull();
    expect(requiredPermission()).toBeNull();
  });
});

describe('persistencia de usuarios y sesión', () => {
  it('loadUsers devuelve los usuarios por defecto sin persistirlos', () => {
    expect(loadUsers()).toEqual(defaultUsers);
    expect(localStorage.getItem('quality-users')).toBeNull();
  });

  it('saveUsers persiste la lista de usuarios', () => {
    saveUsers(defaultUsers);
    expect(JSON.parse(localStorage.getItem('quality-users'))).toEqual(defaultUsers);
    expect(loadUsers()).toEqual(defaultUsers);
  });

  it('ensureDefaultUsers persiste cuatro usuarios por defecto', () => {
    ensureDefaultUsers();
    expect(loadUsers()).toEqual(defaultUsers);
    expect(loadUsers().length).toBe(4);
    expect(JSON.parse(localStorage.getItem('quality-users'))).toEqual(defaultUsers);
  });

  it('ensureDefaultUsers no sobrescribe usuarios existentes', () => {
    const users = [{ id: 'user-admin', name: 'Otro Admin', role: 'Administrador' }];
    saveUsers(users);
    ensureDefaultUsers();
    expect(loadUsers()).toEqual(users);
  });

  it('assignRole actualiza y persiste el rol de un usuario', () => {
    ensureDefaultUsers();
    const updated = assignRole('user-inspector', 'Auditor');
    expect(updated).toEqual({ id: 'user-inspector', name: 'Inspector', role: 'Auditor' });
    expect(loadUsers().find(user => user.id === 'user-inspector').role).toBe('Auditor');
    expect(JSON.parse(localStorage.getItem('quality-users')).find(user => user.id === 'user-inspector').role).toBe('Auditor');
  });

  it('assignRole rechaza roles inválidos y deja la lista intacta', () => {
    ensureDefaultUsers();
    expect(() => assignRole('user-inspector', 'Observador')).toThrow(Error);
    expect(loadUsers()).toEqual(defaultUsers);
  });

  it('setActiveUser persiste la sesión y devuelve el usuario', () => {
    ensureDefaultUsers();
    const user = setActiveUser('user-gestor');
    expect(user).toEqual({ id: 'user-gestor', name: 'Gestor', role: 'Gestor de Calidad' });
    expect(localStorage.getItem('quality-session')).toBe('user-gestor');
  });

  it('setActiveUser rechaza usuarios inexistentes sin cambiar la sesión', () => {
    expect(() => setActiveUser('user-no-existe')).toThrow('Usuario no encontrado');
    expect(localStorage.getItem('quality-session')).toBeNull();
    setActiveUser('user-admin');
    expect(() => setActiveUser('user-no-existe')).toThrow('Usuario no encontrado');
    expect(localStorage.getItem('quality-session')).toBe('user-admin');
  });

  it('getActiveUser devuelve Admin sin sesión o con una sesión inválida', () => {
    expect(getActiveUser()).toEqual(defaultUsers[0]);
    localStorage.setItem('quality-session', 'user-no-existe');
    expect(getActiveUser()).toEqual(defaultUsers[0]);
  });

  it('getActiveUser recupera la sesión persistida en una nueva llamada', () => {
    ensureDefaultUsers();
    setActiveUser('user-auditor');
    expect(getActiveUser()).toEqual(defaultUsers[3]);
    expect(getActiveUser().role).toBe('Auditor');
  });
});

describe('validateRoleDefinition()', () => {
  it('acepta un rol válido con permisos conocidos', () => {
    expect(validateRoleDefinition('Administrador', allPermissionIds)).toEqual({ valid: true, errors: [] });
    expect(validateRoleDefinition('Auditor', ['read', 'audit']).valid).toBe(true);
  });

  it('rechaza roles desconocidos', () => {
    const result = validateRoleDefinition('Observador', ['read']);
    expect(result.valid).toBe(false);
    expect(result.errors.some(error => error.includes('Observador'))).toBe(true);
  });

  it('rechaza permisos que no son un arreglo', () => {
    const result = validateRoleDefinition('Auditor', 'read');
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('rechaza permisos que no están en el catálogo', () => {
    const result = validateRoleDefinition('Gestor de Calidad', ['read', 'manage-users', 'borrar-todo']);
    expect(result.valid).toBe(false);
    expect(result.errors.some(error => error.includes('manage-users'))).toBe(true);
    expect(result.errors.some(error => error.includes('borrar-todo'))).toBe(true);
  });
});
