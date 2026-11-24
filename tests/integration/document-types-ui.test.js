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

function fillNcr() {
  set('document-type-select', 'NCR');
  set('td-folio', '1001');
  set('td-origen', 'INTERNO');
  set('td-area_afectada_id', 'A-01');
  set('td-detectado_por', 'Inspector');
  set('td-fecha_deteccion', '2026-01-10');
  set('td-gravedad', 'MENOR');
  set('td-descripcion', 'Hallazgo detectado en recepción');
  set('td-status', 'ABIERTA');
}

describe('Tipos de documento operativos en la interfaz', () => {
  it('guarda una NCR con campos tipados y estado relabelado', async () => {
    await bootQuality();
    const { addEntity } = await import('../../src/storage.js');
    const entity = addEntity({ name: 'Proveedor Demo', code: 'P-001', tipoItem: 'Producto' });

    qs('nav-documents').click();
    fillNcr();
    set('document-entity', entity.entity_id);
    qs('document-form').dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true }));

    const { loadDocuments } = await import('../../src/storage.js');
    const docs = loadDocuments();
    expect(docs).toHaveLength(1);
    expect(docs[0].tipoDoc).toBe('NCR');
    expect(docs[0].origen).toBe('INTERNO');
    expect(docs[0].status).toBe('ABIERTA');
    expect(qs('documents-list').textContent).toContain('Abierta');
  });

  it('muestra errores de campos obligatorios tipados', async () => {
    await bootQuality();
    const { addEntity } = await import('../../src/storage.js');
    const entity = addEntity({ name: 'Proveedor Demo', code: 'P-001', tipoItem: 'Producto' });

    qs('nav-documents').click();
    set('document-type-select', 'NCR');
    set('document-entity', entity.entity_id);
    set('td-folio', '1002');
    qs('document-form').dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true }));

    expect(qs('td-error-origen').textContent).toContain('obligatorio');
    const { loadDocuments } = await import('../../src/storage.js');
    expect(loadDocuments()).toHaveLength(0);
  });

  it('limita las opciones de estado según el ciclo del tipo de documento', async () => {
    await bootQuality();
    const { addEntity, addDocument } = await import('../../src/storage.js');
    const entity = addEntity({ name: 'Proveedor Demo', code: 'P-001', tipoItem: 'Producto' });
    const doc = addDocument({
      entityId: entity.entity_id,
      folio: 1003,
      status: 'ABIERTA',
      tipoDoc: 'NCR',
      origen: 'INTERNO',
      area_afectada_id: 'A-01',
      detectado_por: 'Inspector',
      fecha_deteccion: '2026-01-10',
      gravedad: 'MENOR',
      descripcion: 'Hallazgo inicial',
      estado: 'ABIERTA'
    });

    qs('nav-documents').click();
    set('edit-document', doc.id);
    const options = [...qs('td-status').options].map(option => option.value);
    expect(options).toContain('EN_INVESTIGACION');
    expect(options).not.toContain('CERRADA');
    expect(qs('td-status').value).toBe('ABIERTA');
  });
});
