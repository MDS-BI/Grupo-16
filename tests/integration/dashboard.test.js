import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import { normalizeConfig } from '../../src/module-config.js';
import { addEntity, addDocument, loadEntities } from '../../src/storage.js';
import { addMaster } from '../../src/master-data.js';
import { seedDemo } from '../../src/demo-data.js';

const html = fs.readFileSync(fileURLToPath(new URL('../../index.html', import.meta.url)), 'utf8');

let dom;

function qs(id){ return document.getElementById(id); }

const salesConfig = {
  moduleName: 'Ventas',
  labels: { entity: 'Cliente', entities: 'Clientes', document: 'Pedido de Venta', documents: 'Pedidos de Venta' }
};

beforeEach(async () => {
  dom = new JSDOM(html, { url: 'http://localhost/' });
  const w = dom.window;
  globalThis.window = w;
  globalThis.document = w.document;
  globalThis.localStorage = w.localStorage;
  globalThis.alert = vi.fn();
  globalThis.confirm = vi.fn(() => true);
  w.scrollTo = vi.fn();
  w.localStorage.clear();
});

afterEach(() => {
  dom.window.close();
});

async function bootWith(configOverride){
  vi.resetModules();
  const { initApp } = await import('../../src/app.js');
  await initApp(normalizeConfig(configOverride));
}

describe('User Story 3 - home dashboard with quick actions and record stats', () => {
  it('opens on the dashboard with all other views hidden', async () => {
    await bootWith(undefined);
    expect(qs('view-dashboard').hidden).toBe(false);
    expect(qs('view-entities').hidden).toBe(true);
    expect(qs('view-documents').hidden).toBe(true);
    expect(qs('view-search').hidden).toBe(true);
  });

  it('shows at least four quick-action buttons covering key ERP tasks', async () => {
    await bootWith(undefined);
    expect(qs('action-new-entity-title').textContent).toBe('Nueva Entidad');
    expect(qs('action-new-document-title').textContent).toBe('Nuevo Documento');
    expect(qs('action-open-entities-title').textContent).toBe('Entidades');
    expect(qs('action-find-title').textContent).toBe('Buscar registros');
  });

  it('uses configured terminology on quick actions and stat cards', async () => {
    await bootWith(salesConfig);
    expect(qs('action-new-entity-title').textContent).toBe('Nuevo Cliente');
    expect(qs('action-new-document-title').textContent).toBe('Nuevo Pedido de Venta');
    expect(qs('stat-entities-label').textContent).toBe('Clientes');
    expect(qs('stat-documents-label').textContent).toBe('Pedidos de Venta');
  });

  it('shows live statistics that match stored records', async () => {
    await bootWith(undefined);
    expect(qs('stat-entities').textContent).toBe('0');
    expect(qs('stat-documents').textContent).toBe('0');

    const entity = addEntity({ name: 'Acme', code: 'AC-001' });
    addEntity({ name: 'Globex', code: 'GL-002' });
    addDocument({ entityId: entity.entity_id, folio: 1001, startDate: '2026-08-01', endDate: '2026-08-05' });

    qs('nav-dashboard').click();
    expect(qs('stat-entities').textContent).toBe('2');
    expect(qs('stat-documents').textContent).toBe('1');
  });

  it('refreshes statistics after creating records elsewhere in the app', async () => {
    await bootWith(undefined);
    qs('nav-entities').click();
    qs('name').value = 'Acme';
    qs('code').value = 'AC-001';
    qs('entity-form').dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true }));
    expect(loadEntities().length).toBe(1);

    qs('nav-dashboard').click();
    expect(qs('stat-entities').textContent).toBe('1');
  });

  it('opens the entity management area with a cleared form via the new-entity action', async () => {
    await bootWith(undefined);
    qs('name').value = 'Stale draft';
    qs('nav-dashboard').click();

    qs('action-new-entity').click();
    expect(qs('view-entities').hidden).toBe(false);
    expect(qs('view-dashboard').hidden).toBe(true);
    expect(qs('entity-id').value).toBe('');
    expect(qs('name').value).toBe('');
    expect(document.activeElement).toBe(qs('name'));
  });

  it('opens the document management area via the new-document action', async () => {
    await bootWith(undefined);
    qs('action-new-document').click();
    expect(qs('view-documents').hidden).toBe(false);
    expect(qs('document-id').value).toBe('');
    expect(document.activeElement).toBe(qs('document-entity'));
  });

  it('opens the search screen with a focused search field via the find action', async () => {
    await bootWith(undefined);
    qs('action-find').click();
    expect(qs('view-search').hidden).toBe(false);
    expect(document.activeElement).toBe(qs('search-input'));
  });
});

describe('HU3 - KPIs del panel con reglas definidas', () => {
  it('muestra 0 en las cuatro tarjetas cuando no hay registros', async () => {
    await bootWith(undefined);
    expect(qs('stat-lots-active').textContent).toBe('0');
    expect(qs('stat-products-total').textContent).toBe('0');
    expect(qs('stat-inspections-total').textContent).toBe('0');
    expect(qs('stat-ncr-capa-open').textContent).toBe('0');
    expect(qs('dashboard-empty-state').hidden).toBe(false);
  });

  it('muestra los recuentos reales tras cargar los datos de ejemplo', async () => {
    await bootWith(undefined);
    seedDemo();
    qs('nav-dashboard').click();
    expect(qs('stat-lots-active').textContent).toBe('4');
    expect(qs('stat-products-total').textContent).toBe('4');
    expect(qs('stat-inspections-total').textContent).toBe('4');
    expect(qs('stat-ncr-capa-open').textContent).toBe('3');
  });

  it('recalcula los KPIs al volver al panel tras crear un maestro', async () => {
    await bootWith(undefined);
    qs('nav-entities').click();
    addMaster('product', { codigo: 'EXTRA-1', descripcion: 'Producto extra', tipo: 'PRODUCTO', unidad_medida: 'unidad' });
    qs('nav-dashboard').click();
    expect(qs('stat-products-total').textContent).toBe('1');
    expect(qs('stat-lots-active').textContent).toBe('0');
  });

  it('aplica las etiquetas configuradas a las tarjetas KPI', async () => {
    await bootWith({ labels: { lots: 'Lotes QA', products: 'Catálogo', inspections: 'Chequeos', ncrs: 'Hallazgos abiertos' } });
    expect(qs('stat-lots-active-label').textContent).toBe('Lotes QA');
    expect(qs('stat-products-total-label').textContent).toBe('Catálogo');
    expect(qs('stat-inspections-total-label').textContent).toBe('Chequeos');
    expect(qs('stat-ncr-capa-open-label').textContent).toBe('Hallazgos abiertos');
  });
});

describe('HU3 - acciones rápidas del panel', () => {
  const masterActions = [
    ['action-new-lot', 'lot', 'quality-master-id'],
    ['action-new-product', 'product', 'quality-master-id'],
    ['action-new-area', 'area', 'quality-master-id'],
    ['action-new-employee', 'employee', 'quality-master-id']
  ];
  const operationalActions = [
    ['action-new-inspection', 'Inspección', 'document-id'],
    ['action-new-ncr', 'NCR', 'document-id'],
    ['action-new-capa', 'CAPA', 'document-id']
  ];

  it('abre siete acciones en dos grupos diferenciados', async () => {
    await bootWith(undefined);
    const groups = document.querySelectorAll('.quick-group');
    expect(groups.length).toBe(2);
    expect(groups[0].querySelectorAll('button').length).toBe(4);
    expect(groups[1].querySelectorAll('button').length).toBe(3);
    for (const [id] of [...masterActions, ...operationalActions]) {
      expect(qs(id)).not.toBeNull();
    }
  });

  it('abre formularios limpios desde cada acción rápida', async () => {
    await bootWith(undefined);
    for (const [id, , formId] of [...masterActions, ...operationalActions]) {
      qs('nav-dashboard').click();
      qs(id).click();
      expect(qs('view-dashboard').hidden).toBe(true);
      expect(qs(formId).value).toBe('');
    }
  });

  it('oculta los botones de creación según el perfil activo', async () => {
    await bootWith(undefined);
    const switcher = qs('active-user');
    switcher.value = 'user-auditor';
    switcher.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
    for (const [id] of [...masterActions, ...operationalActions]) {
      expect(qs(id).hidden).toBe(true);
    }
    switcher.value = 'user-inspector';
    switcher.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
    expect(qs('action-new-lot').hidden).toBe(false);
    expect(qs('action-new-inspection').hidden).toBe(false);
    expect(qs('action-new-ncr').hidden).toBe(false);
    expect(qs('action-new-capa').hidden).toBe(true);
  });

  it('aplica etiquetas configuradas a los botones de acción rápida', async () => {
    await bootWith({ labels: { lot: 'Lote QA', product: 'Ítem', area: 'Zona', employee: 'Persona', inspection: 'Chequeo', ncr: 'Desviación', capa: 'Mejora' } });
    expect(qs('action-new-lot-label').textContent).toBe('Nuevo Lote QA');
    expect(qs('action-new-product-label').textContent).toBe('Nuevo Ítem');
    expect(qs('action-new-area-label').textContent).toBe('Nueva Zona');
    expect(qs('action-new-employee-label').textContent).toBe('Nuevo Persona');
    expect(qs('action-new-inspection-label').textContent).toBe('Nueva Chequeo');
    expect(qs('action-new-ncr-label').textContent).toBe('Nueva Desviación');
    expect(qs('action-new-capa-label').textContent).toBe('Nueva Mejora');
  });
});

describe('HU3 - accesos a catálogos y búsqueda global', () => {
  it('navega a gestión de catálogos y vuelve al panel', async () => {
    await bootWith(undefined);
    qs('action-manage-catalogs').click();
    expect(qs('view-dashboard').hidden).toBe(true);
    expect(qs('view-entities').hidden).toBe(false);
    qs('nav-dashboard').click();
    expect(qs('view-dashboard').hidden).toBe(false);
    expect(qs('view-entities').hidden).toBe(true);
  });

  it('abre la búsqueda global con foco automático', async () => {
    await bootWith(undefined);
    qs('action-global-search').click();
    expect(qs('view-search').hidden).toBe(false);
    expect(document.activeElement.id).toBe('search-input');
  });

  it('actualiza los KPIs al regresar al panel', async () => {
    await bootWith(undefined);
    qs('action-global-search').click();
    const product = addMaster('product', { codigo: 'P-NAV-01', descripcion: 'Producto navegación', tipo: 'PRODUCTO', unidad_medida: 'UN', activo: true }, 'user-manager');
    addMaster('lot', { numero_lote: 'L-NAV-01', producto_id: product.producto_id, fecha_fabricacion: '2026-01-01', activo: true }, 'user-manager');
    qs('nav-dashboard').click();
    expect(qs('stat-lots-active').textContent).toBe('1');
  });

  it('mantiene ambos accesos visibles para el perfil Auditor', async () => {
    await bootWith(undefined);
    const switcher = qs('active-user');
    switcher.value = 'user-auditor';
    switcher.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
    expect(qs('action-manage-catalogs').hidden).toBe(false);
    expect(qs('action-global-search').hidden).toBe(false);
  });
});
