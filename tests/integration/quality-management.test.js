import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { addEntity, addDocument, loadEntities, loadDocuments } from '../../src/storage.js';
import { setActiveConfig } from '../../src/module-config.js';

const html = fs.readFileSync(fileURLToPath(new URL('../../index.html', import.meta.url)), 'utf8');
let dom;
const qs = id => document.getElementById(id);
const change = (id, value) => { qs(id).value = value; qs(id).dispatchEvent(new dom.window.Event('change', {bubbles: true})); };
const submit = id => qs(id).dispatchEvent(new dom.window.Event('submit', {bubbles: true, cancelable: true}));
const master = (name, extra = {}) => addEntity({name, code: name, ...extra});
const record = (entity, extra = {}) => addDocument({entityId: entity.entity_id, folio: 1, startDate: '2026-11-03', endDate: '2026-11-04', ...extra});

beforeEach(async () => {
  dom = new JSDOM(html, {url: 'http://localhost/'});
  Object.assign(globalThis, {window: dom.window, document: dom.window.document, localStorage: dom.window.localStorage, confirm: vi.fn(() => true), alert: vi.fn()});
  dom.window.scrollTo = vi.fn();
  setActiveConfig(null);
  vi.resetModules();
  const {boot} = await import('../../src/app.js');
  await boot();
});
afterEach(() => dom.window.close());

describe('Analista de Calidad · HU2 / HU4 / HU10', () => {
  it('filtra los registros y el selector de edición por el maestro elegido', () => {
    const first = master('Lote A');
    const other = master('Lote B');
    const firstDoc = record(first, {folio: 101});
    record(other, {folio: 202});
    qs('nav-entities').click();
    change('edit-entity', first.id);
    qs('nav-documents').click();
    expect(qs('document-master-context').textContent).toContain('Lote A');
    expect([...qs('linked-documents-list').querySelectorAll('strong')].map(node => node.textContent)).toEqual(['101']);
    expect([...qs('edit-document').options].map(option => option.value)).toEqual(['', firstDoc.id]);
    change('document-entity', other.entity_id);
    expect([...qs('linked-documents-list').querySelectorAll('strong')].map(node => node.textContent)).toEqual(['202']);
  });

  it('crea una NCR con detalles, la muestra como texto y la recupera para editar', () => {
    const entity = master('Lote 16');
    qs('nav-documents').click();
    change('document-entity', entity.entity_id);
    change('quality-recordType', 'NCR');
    qs('quality-origin').value = 'Producción';
    qs('quality-severity').value = 'ALTA';
    qs('quality-finding').value = '<img src=x onerror=alert(1)>';
    qs('folio').value = '16';
    qs('startDate').value = '2026-11-03';
    qs('endDate').value = '2026-11-04';
    submit('document-form');
    expect(loadDocuments()[0]).toMatchObject({entity_id: entity.entity_id, recordType: 'NCR', origin: 'Producción', severity: 'ALTA'});
    expect(qs('linked-documents-list').textContent).toContain('<img src=x onerror=alert(1)>');
    expect(qs('linked-documents-list').querySelector('img')).toBeNull();
    qs('linked-documents-list').querySelector('button').click();
    expect(qs('quality-origin').value).toBe('Producción');
    expect(qs('document-entity').disabled).toBe(true);
  });

  it('una nueva operación después de editar utiliza el maestro elegido, sin vínculos antiguos', () => {
    const first = master('A');
    const other = master('B');
    const doc = record(first);
    qs('nav-documents').click();
    change('edit-document', doc.id);
    qs('document-cancel-edit').click();
    change('document-entity', other.entity_id);
    qs('folio').value = '2';
    qs('startDate').value = '2026-11-03';
    qs('endDate').value = '2026-11-04';
    submit('document-form');
    expect(loadDocuments()[1].entity_id).toBe(other.entity_id);
  });

  it('explica que se necesita un maestro e impide guardar sin él', () => {
    qs('nav-documents').click();
    expect(qs('documents-no-entities').hidden).toBe(false);
    expect(qs('document-submit-button').disabled).toBe(true);
    qs('folio').value = '1';
    qs('startDate').value = '2026-11-03';
    qs('endDate').value = '2026-11-04';
    submit('document-form');
    expect(loadDocuments()).toEqual([]);
    expect(qs('error-document-entity').textContent).not.toBe('');
  });

  it('conserva maestros y documentos al cancelar una eliminación', () => {
    const entity = master('A');
    const doc = record(entity);
    qs('nav-entities').click();
    change('edit-entity', entity.id);
    globalThis.confirm.mockReturnValue(false);
    qs('delete-entity').click();
    expect(globalThis.confirm).toHaveBeenCalledOnce();
    expect(loadEntities()).toEqual([entity]);
    expect(loadDocuments()).toEqual([doc]);
  });

  it('muestra validaciones del tipo de inspección sin alterar registros previos', () => {
    master('A');
    qs('nav-documents').click();
    change('quality-recordType', 'INSPECCION');
    qs('folio').value = '1';
    qs('startDate').value = '2026-11-03';
    qs('endDate').value = '2026-11-04';
    submit('document-form');
    expect(qs('error-quality-inspectionResult').textContent).toContain('obligatorio');
    expect(loadDocuments()).toEqual([]);
  });

  it('conserva los datos guardados y la navegación activa al volver al panel', () => {
    const entity = master('Lote A');
    const doc = record(entity);
    qs('nav-documents').click();
    expect(qs('view-entities').hidden).toBe(true);
    expect(qs('nav-documents').getAttribute('aria-current')).toBe('page');
    qs('nav-dashboard').click();
    qs('nav-documents').click();
    expect(loadEntities()).toEqual([entity]);
    expect(loadDocuments()).toEqual([doc]);
    expect(qs('linked-documents-list').children).toHaveLength(1);
  });
});
