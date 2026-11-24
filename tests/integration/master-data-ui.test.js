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

function submit(id) {
  qs(id).dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true }));
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

async function bootWith(config) {
  vi.resetModules();
  const { normalizeConfig } = await import('../../src/module-config.js');
  const { initApp } = await import('../../src/app.js');
  await initApp(normalizeConfig(config));
}

describe('Datos maestros de calidad en la interfaz', () => {
  it('crea un área y la muestra en la lista', async () => {
    await bootWith(undefined);
    qs('nav-entities').click();
    set('master-type-select', 'area');
    set('qm-codigo', 'A-01');
    set('qm-nombre', 'Área de Calidad');
    set('qm-modulo', 'VENTAS');
    submit('quality-master-form');

    const { loadMasters } = await import('../../src/master-data.js');
    expect(loadMasters('area')).toHaveLength(1);
    expect(loadMasters('area')[0].nombre).toBe('Área de Calidad');
    expect(qs('quality-entities-list').textContent).toContain('Área de Calidad');
  });

  it('elimina un producto en cascada con sus lotes', async () => {
    await bootWith(undefined);
    const { addMaster, loadMasters } = await import('../../src/master-data.js');
    const product = addMaster('product', {
      codigo: 'P-1', descripcion: 'Producto Uno', tipo: 'PRODUCTO', unidad_medida: 'pieza'
    }, 'Admin');

    qs('nav-entities').click();
    set('master-type-select', 'lot');
    set('qm-numero_lote', 'L-1');
    set('qm-producto_id', product.producto_id);
    set('qm-fecha_fabricacion', '2026-01-01');
    submit('quality-master-form');
    expect(loadMasters('lot')).toHaveLength(1);

    const deleteButton = qs('quality-entities-list').querySelector('.btn-delete-master[data-type="product"]');
    deleteButton.click();
    expect(loadMasters('product')).toHaveLength(0);
    expect(loadMasters('lot')).toHaveLength(0);
  });

  it('bloquea la creación de maestros para un perfil sin permiso', async () => {
    await bootWith(undefined);
    set('active-user', 'user-auditor');
    qs('nav-entities').click();
    set('master-type-select', 'area');
    set('qm-codigo', 'A-02');
    set('qm-nombre', 'Área bloqueada');
    set('qm-modulo', 'VENTAS');
    submit('quality-master-form');

    const { loadMasters } = await import('../../src/master-data.js');
    expect(loadMasters('area')).toHaveLength(0);
    expect(qs('auth-message').hidden).toBe(false);
    expect(qs('auth-message').textContent).toContain('Tu perfil no tiene permisos');
  });
});
