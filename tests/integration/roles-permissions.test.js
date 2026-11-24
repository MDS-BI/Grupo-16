import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const html = fs.readFileSync(fileURLToPath(new URL('../../index.html', import.meta.url)), 'utf8');

let dom;

function qs(id) { return document.getElementById(id); }

function set(id, value) {
  const element = qs(id);
  element.value = value;
  element.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
}

function setActiveUser(id) {
  set('active-user', id);
}

async function createArea(codigo) {
  qs('nav-entities').click();
  set('master-type-select', 'area');
  set('qm-codigo', codigo);
  set('qm-nombre', `Área ${codigo}`);
  set('qm-modulo', 'VENTAS');
  qs('quality-master-form').dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true }));
}

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

describe('Roles y permisos de acceso - escenarios de aceptación', () => {
  it('el Administrador gestiona registros, configuración y permisos', async () => {
    await boot();
    expect(qs('nav-users').hidden).toBe(false);
    await createArea('ADM-1');
    const { loadMasters } = await import('../../src/master-data.js');
    expect(loadMasters('area')).toHaveLength(1);
    qs('nav-users').click();
    expect(qs('view-users').hidden).toBe(false);
  });

  it('el Gestor de Calidad gestiona registros sin administrar usuarios', async () => {
    await boot();
    setActiveUser('user-gestor');
    expect(qs('nav-users').hidden).toBe(true);
    await createArea('GES-1');
    const { loadMasters } = await import('../../src/master-data.js');
    expect(loadMasters('area')).toHaveLength(1);
    qs('nav-users').click();
    expect(qs('auth-message').textContent).toContain('administrar usuarios y permisos');
    expect(qs('view-users').hidden).toBe(true);
  });

  it('el Inspector de Planta crea registros pero no elimina datos maestros', async () => {
    await boot();
    setActiveUser('user-inspector');
    await createArea('INS-1');
    const list = qs('quality-entities-list');
    const { loadMasters } = await import('../../src/master-data.js');
    const before = loadMasters('area');
    expect(before).toHaveLength(1);
    expect(list.querySelector('.btn-delete-master')).toBeNull();
    // Simula una acción manipulada en el DOM para verificar el bloqueo real.
    const button = document.createElement('button');
    button.className = 'btn-delete-master';
    button.dataset.type = 'area';
    button.dataset.id = before[0].area_id;
    list.appendChild(button);
    button.click();
    expect(qs('auth-message').textContent).toContain('eliminar datos maestros');
    expect(loadMasters('area')).toEqual(before);
  });

  it('el Auditor solo consulta y no puede crear registros', async () => {
    await boot();
    setActiveUser('user-auditor');
    expect(qs('action-new-lot').hidden).toBe(true);
    await createArea('AUD-1');
    expect(qs('auth-message').textContent).toContain('crear datos maestros');
    const { loadMasters } = await import('../../src/master-data.js');
    expect(loadMasters('area')).toHaveLength(0);
  });

  it('muestra un mensaje accesible y no modifica el almacenamiento ante una acción denegada', async () => {
    await boot();
    setActiveUser('user-auditor');
    await createArea('DEN-1');
    expect(qs('auth-message').hidden).toBe(false);
    expect(qs('auth-message').getAttribute('role')).toBe('alert');
    expect(qs('auth-message').textContent).toContain('Tu perfil no tiene permisos');
    const { loadMasters } = await import('../../src/master-data.js');
    expect(loadMasters('area')).toHaveLength(0);
  });
});
