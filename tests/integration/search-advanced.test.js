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

function search(term) {
  qs('search-input').value = term;
  qs('search-input').dispatchEvent(new dom.window.Event('input', { bubbles: true }));
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

async function bootQuality() {
  vi.resetModules();
  const { QUALITY_CONFIG } = await import('../../src/module-config.js');
  const { initApp } = await import('../../src/app.js');
  await initApp(QUALITY_CONFIG);
}

describe('Búsqueda avanzada y exportación', () => {
  it('filtra resultados por tipo de dato maestro y por rango de fechas', async () => {
    await bootQuality();
    const { addMaster } = await import('../../src/master-data.js');
    addMaster('area', { codigo: 'A-01', nombre: 'Área Sigma', modulo: 'VENTAS' }, 'Admin');
    addMaster('product', { codigo: 'P-01', descripcion: 'Producto Sigma', tipo: 'PRODUCTO', unidad_medida: 'pieza' }, 'Admin');

    qs('nav-search').click();
    search('Sigma');
    expect(qs('search-results-list').querySelectorAll('.entity-item')).toHaveLength(2);

    set('search-type-filter', 'area');
    expect(qs('search-results-list').querySelectorAll('.entity-item')).toHaveLength(1);
    expect(qs('search-results-list').textContent).toContain('Área Sigma');

    set('search-date-from', '2099-01-01');
    expect(qs('search-results-list').children).toHaveLength(0);
    expect(qs('search-empty').hidden).toBe(false);
  });

  it('genera CSV de los resultados y permite volver al panel', async () => {
    await bootQuality();
    const { addMaster } = await import('../../src/master-data.js');
    addMaster('area', { codigo: 'A-02', nombre: 'Área CSV', modulo: 'VENTAS' }, 'Admin');

    qs('nav-search').click();
    search('CSV');
    const { toCsv } = await import('../../src/components/search-bar.js');
    const csv = toCsv([{ masterType: 'area', nombre: 'Área CSV', codigo: 'A-02', status: '', createdAt: '2026-01-01' }]);
    expect(csv).toContain('tipo,nombre,codigo,estado,fecha');
    expect(csv).toContain('Área CSV');

    expect(() => qs('search-export-csv').click()).not.toThrow();
    qs('search-back-dashboard').click();
    expect(qs('view-dashboard').hidden).toBe(false);
  });
});
