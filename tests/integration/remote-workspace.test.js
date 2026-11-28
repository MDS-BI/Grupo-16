import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';

const html = readFileSync(new URL('../../index.html', import.meta.url), 'utf8');
let dom, session, state, main, fetchMock;
const qs = id => document.getElementById(id);
const response = (data, status = 200) => Promise.resolve(new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } }));

beforeEach(async () => {
  vi.resetModules();
  dom = new JSDOM(html, { url: 'http://localhost/' });
  vi.stubGlobal('window', dom.window);
  vi.stubGlobal('document', dom.window.document);
  vi.stubGlobal('localStorage', dom.window.localStorage);
  vi.stubGlobal('confirm', vi.fn(() => true));
  dom.window.scrollTo = vi.fn();
  dom.window.localStorage.setItem('dato-previo-del-grupo', 'conservar');
  const data = {
    'quality-products': [{ producto_id: 'p1', codigo: 'SIM-P1', descripcion: 'Envase simulado' }],
    'quality-lots': [{ lote_id: 'l1', numero_lote: 'SIM-L1', producto_id: 'p1' }, { lote_id: 'l2', numero_lote: 'SIM-L2', producto_id: 'p1' }],
    'quality-areas': [{ area_id: 'a1', codigo: 'SIM-A1', nombre: 'Envasado' }],
    'quality-employees': [{ empleado_id: 'e1', numero_nomina: 'SIM-01', puesto: 'Inspección' }],
    'quality-entities': [], 'quality-documents': [], 'quality-models': [],
    'quality-users': [{ id: 'u1', username: 'inspector', name: 'Inspección simulada', role: 'Inspector de Planta', active: true }]
  };
  state = {
    storage: Object.fromEntries(Object.entries(data).map(([key, value]) => [key, JSON.stringify(value)])),
    parameters: [{ id: 'm1', productId: 'p1', name: 'Peso simulado', unit: 'g', min: 24, max: 26, version: 1, active: true }],
    orders: [1, 2, 3].map(number => ({ id: `o${number}`, number: `SIM-00${number}`, productId: 'p1', productName: 'Envase simulado', lotId: number === 3 ? 'l2' : 'l1', lotNumber: number === 3 ? 'SIM-L2' : 'SIM-L1', quantity: 100, status: number === 1 ? 'RECHAZADA' : 'LIBERADA', dueDate: '2026-11-26', responsible: 'Equipo simulado' })),
    users: data['quality-users'], audit: []
  };
  state.storage['quality-session'] = 'u1';
  const { QUALITY_CONFIG } = await import('../../src/module-config.js');
  session = { authenticated: true, user: data['quality-users'][0], csrf: 'csrf-de-prueba', state, config: QUALITY_CONFIG };
  fetchMock = vi.fn((url, options) => {
    if (url === '/api/session') return response({ authenticated: false, setupRequired: false });
    if (url === '/api/login') return response(session);
    if (url === '/api/actions') {
      const request = JSON.parse(options.body);
      if (request.action === 'addDocument') {
        const data = request.args[0];
        const passed = Number(data.measurements.m1) <= 26 && Number(data.measurements.m1) >= 24;
        const result = { ...data, id: 'i1', resultado: passed ? 'ACEPTADO' : 'RECHAZADO', status: passed ? 'ACEPTADO' : 'RECHAZADO', parameterEvaluation: { passed, message: 'Peso simulado: 28 g; límite permitido 24 a 26 g.', results: [{ ...state.parameters[0], value: Number(data.measurements.m1), passed }] } };
        state.storage['quality-documents'] = JSON.stringify([result]);
        return response({ result, state, alert: passed ? '' : result.parameterEvaluation.message });
      }
    }
    return response({ error: 'Operación no prevista en esta prueba.' }, 404);
  });
  vi.stubGlobal('fetch', fetchMock);
  ({ main } = await import('../../src/main.js'));
});

afterEach(() => { dom.window.close(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

async function login(role = 'Inspector de Planta') {
  session.user.role = role;
  state.storage['quality-users'] = JSON.stringify([{ ...session.user }]);
  await main();
  qs('login-username').value = 'inspector';
  qs('login-password').value = 'contraseña-exclusiva-de-prueba';
  await qs('login-form').onsubmit({ preventDefault: vi.fn() });
}

describe('Interfaz conectada de control de calidad', () => {
  it('abre con login y no permite seleccionar públicamente una identidad', async () => {
    await main();
    expect(document.querySelector('.workspace-shell').hidden).toBe(true);
    expect(qs('login-password').type).toBe('password');
    expect(qs('active-user')).toBeNull();
    expect(qs('login-form').hidden).toBe(false);
  });

  it('usa sesión del servidor y conserva datos previos de localStorage', async () => {
    await login();
    expect(qs('auth-screen')).toBeNull();
    expect(document.querySelector('.workspace-shell').hidden).toBe(false);
    expect(qs('remote-identity').textContent).toContain('Inspector de Planta');
    expect(qs('active-user')).toBeNull();
    expect(localStorage.getItem('dato-previo-del-grupo')).toBe('conservar');
    expect(localStorage.getItem('quality-session')).toBeNull();
  });

  it('abre con todas las órdenes, combina filtros y restaura el total al limpiar', async () => {
    await login();
    qs('nav-orders').click();
    expect(qs('order-table-body').children).toHaveLength(3);
    qs('order-filter-status').value = 'RECHAZADA';
    qs('order-filter-status').onchange();
    expect(qs('order-table-body').children).toHaveLength(1);
    qs('order-filter-query').value = 'no existe';
    qs('order-filter-query').oninput();
    expect(qs('order-table-body').children).toHaveLength(0);
    expect(qs('order-empty').hidden).toBe(false);
    qs('order-filters-clear').click();
    expect(qs('order-table-body').children).toHaveLength(3);
  });

  it('guarda una lectura fuera de tolerancia y mantiene visible su alerta específica', async () => {
    await login();
    qs('action-new-inspection').click();
    qs('folio').value = '99001';
    for (const [field, value] of Object.entries({ tipo: 'FINAL', producto_id: 'p1', lote_id: 'l1', area_id: 'a1', inspector_id: 'e1', fecha_inspeccion: '2026-11-26' })) {
      qs(`td-${field}`).value = value;
      if (field === 'producto_id') qs('td-producto_id').onchange();
    }
    qs('measurement-m1').value = '28';
    await qs('document-form').onsubmit({ preventDefault: vi.fn() });
    const call = fetchMock.mock.calls.find(([url, options]) => url === '/api/actions' && JSON.parse(options.body).action === 'addDocument');
    expect(call).toBeDefined();
    expect(call[1].headers['X-CSRF-Token']).toBe('csrf-de-prueba');
    expect(qs('auth-message').hidden).toBe(false);
    expect(qs('auth-message').textContent).toContain('28 g');
    expect(qs('auth-message').textContent).toContain('24 a 26');
    expect(qs('auth-message').classList.contains('success')).toBe(false);
    expect(qs('documents-list').textContent).toContain('Rechazado');
  });

  it('muestra campos de medición obligatorios y no envía una inspección vacía', async () => {
    await login();
    qs('action-new-inspection').click();
    qs('td-producto_id').value = 'p1';
    qs('td-producto_id').onchange();
    await qs('document-form').onsubmit({ preventDefault: vi.fn() });
    expect(fetchMock.mock.calls.filter(([url]) => url === '/api/actions')).toHaveLength(0);
    expect(qs('measurement-error-m1').textContent.length).toBeGreaterThan(0);
    expect(qs('subtotal').closest('.field').hidden).toBe(true);
    expect(qs('currency').closest('.field').hidden).toBe(true);
    expect(qs('folio').value).toBe('');
    expect(qs('document-form').querySelector('img')).toBeNull();
  });

  it('conserva el contexto del lote y avisa antes de abandonar un formulario con cambios', async () => {
    await login();
    qs('nav-orders').click();
    qs('context-lot').value = 'l2';
    qs('context-lot').onchange();
    expect(qs('order-table-body').children).toHaveLength(1);
    expect(qs('context-lot-summary').textContent).toContain('SIM-L2');
    qs('nav-documents').click();
    qs('folio').value = '99901';
    qs('folio').dispatchEvent(new window.Event('input', { bubbles: true }));
    globalThis.confirm.mockReturnValue(false);
    qs('nav-orders').click();
    expect(qs('view-documents').hidden).toBe(false);
    expect(qs('folio').value).toBe('99901');
    expect(globalThis.confirm).toHaveBeenCalled();
    globalThis.confirm.mockReturnValue(true);
    qs('nav-orders').click();
    expect(qs('view-orders').hidden).toBe(false);
    expect(qs('context-lot').value).toBe('l2');
    expect(qs('order-table-body').children).toHaveLength(1);
  });

  it('conserva selecciones y versión histórica al abrir una inspección existente', async () => {
    const { renderRemoteDocumentFields, readRemoteDocumentFields } = await import('../../src/components/remote-document-fields.js');
    const root = document.createElement('div');
    root.innerHTML = renderRemoteDocumentFields('Inspección', { resultado: 'ACEPTADO', producto_id: 'p1', lote_id: 'l1', inspector_id: 'e1', area_id: 'a1', orderId: 'o1', measurements: { m1: 25 }, parameterEvaluation: { results: [{ ...state.parameters[0], version: 3 }] } }, state);
    expect(root.querySelector('#td-producto_id').value).toBe('p1');
    expect(root.querySelector('#td-orderId').value).toBe('o1');
    expect(root.textContent).toContain('Versión 3');
    const data = readRemoteDocumentFields(root);
    expect(data.status).toBe('ACEPTADO');
    expect(data.measurements).toEqual({ m1: '25' });
    expect(Object.keys(data).some(key => key.startsWith('error-'))).toBe(false);
  });

  it('el Auditor consulta sin formularios de escritura y puede entrar a Mi cuenta', async () => {
    await login('Auditor');
    expect(qs('action-new-inspection').hidden).toBe(true);
    expect(qs('document-form').hidden).toBe(true);
    expect(qs('parameter-form').closest('.form-container').hidden).toBe(true);
    qs('nav-users').click();
    expect(qs('view-users').hidden).toBe(false);
    expect(qs('remote-account-section').hidden).toBe(true);
    expect(qs('password-form')).not.toBeNull();
  });

  it('muestra mediciones y límites históricos en detalles de solo lectura', async () => {
    const { renderRecordDetail, renderOrderDetail } = await import('../../src/components/remote-views.js');
    const record = { id: 'i1', tipoDoc: 'Inspección', folio: 101, producto_id: 'p1', lote_id: 'l1', parameterEvaluation: { results: [{ name: 'Peso simulado', value: 28, min: 24, max: 26, unit: 'g', version: 2, passed: false }] } };
    const root = document.createElement('div');
    root.innerHTML = renderRecordDetail(record, state);
    expect(root.textContent).toContain('Envase simulado');
    expect(root.querySelector('table').textContent).toContain('Fuera del rango');
    expect(root.querySelector('button,input,select')).toBeNull();
    const records = [{ ...record, orderId: 'o1' }, { id: 'n1', tipoDoc: 'NCR', inspectionId: 'i1', folio: 102 }, { id: 'c1', tipoDoc: 'CAPA', ncr_id: 'n1', folio: 103 }, { id: 'n2', tipoDoc: 'NCR', lote_id: 'l1', folio: 999 }];
    const detail = renderOrderDetail(state.orders[0], records);
    expect(detail).toContain('102'); expect(detail).toContain('103');
    expect(detail).not.toContain('999');
  });

  it('un error del servidor conserva el parámetro escrito y muestra ayuda junto al campo', async () => {
    await login('Administrador');
    qs('nav-parameters').click();
    for (const [key, value] of Object.entries({ name: 'Peso ingresado', product: 'p1', unit: 'g', min: '99', max: '1' })) qs(`parameter-${key}`).value = value;
    const previous = fetchMock.getMockImplementation();
    fetchMock.mockImplementation((url, options) => url === '/api/actions' ? response({ error: 'El mínimo no puede superar al máximo.', fields: { min: 'Indica un mínimo menor o igual al máximo.' } }, 422) : previous(url, options));
    await qs('parameter-form').onsubmit({ preventDefault: vi.fn() });
    expect(qs('parameter-name').value).toBe('Peso ingresado');
    expect(qs('parameter-min').value).toBe('99');
    expect(qs('parameter-error-min').textContent).toContain('menor o igual');
    expect(qs('auth-message').textContent).toBe('El mínimo no puede superar al máximo.');
  });
});
