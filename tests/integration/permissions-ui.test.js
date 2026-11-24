import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const html = fs.readFileSync(fileURLToPath(new URL('../../index.html', import.meta.url)), 'utf8');

let dom;

function qs(id) { return document.getElementById(id); }

beforeEach(async () => {
  dom = new JSDOM(html, { url: 'http://localhost/' });
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.localStorage = dom.window.localStorage;
  globalThis.alert = vi.fn();
  globalThis.confirm = vi.fn(() => true);
  dom.window.scrollTo = vi.fn();
  dom.window.localStorage.clear();
});

afterEach(() => {
  dom.window.close();
});

async function boot() {
  vi.resetModules();
  const { normalizeConfig } = await import('../../src/module-config.js');
  const { initApp } = await import('../../src/app.js');
  await initApp(normalizeConfig(undefined));
}

function setActiveUser(id) {
  const select = qs('active-user');
  select.value = id;
  select.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
}

describe('Usuarios, roles y permisos en la interfaz', () => {
  it('oculta la administración de roles a un perfil sin permiso', async () => {
    await boot();
    expect(qs('nav-users').hidden).toBe(false);

    setActiveUser('user-auditor');
    expect(qs('nav-users').hidden).toBe(true);

    qs('nav-users').click();
    expect(qs('view-users').hidden).toBe(true);
    expect(qs('auth-message').textContent).toContain('Tu perfil no tiene permisos');
  });

  it('guarda asignaciones de roles y aplica el nuevo permiso', async () => {
    await boot();
    qs('nav-users').click();
    const roleSelect = qs('role-user-inspector');
    roleSelect.value = 'Gestor de Calidad';
    qs('save-roles').click();

    const { loadUsers } = await import('../../src/permissions.js');
    expect(loadUsers().find(user => user.id === 'user-inspector').role).toBe('Gestor de Calidad');

    setActiveUser('user-inspector');
    expect(qs('nav-users').hidden).toBe(true);
    qs('nav-users').click();
    expect(qs('auth-message').textContent).toContain('Tu perfil no tiene permisos');
  });
});
