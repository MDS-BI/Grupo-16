import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import http from 'node:http';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createQualityService } from '../../server/service.js';

const password = 'Prueba-local-2026-segura';
const setupToken = 'codigo-exclusivo-del-entorno-de-pruebas';

async function fixture(options = {}) {
  const directory = mkdtempSync(join(tmpdir(), 'g16-test-'));
  const service = createQualityService({ dataDir: directory, setupToken, ...options });
  const server = http.createServer((request, response) => service.handle(request, response));
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  function client() {
    let cookie = '', csrf = '';
    return {
      get cookie() { return cookie; },
      get csrf() { return csrf; },
      async request(path, { method = 'GET', body, headers = {} } = {}) {
        const response = await fetch(origin + '/api' + path, {
          method,
          headers: { Origin: origin, ...(cookie ? { Cookie: cookie } : {}), ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}), ...(csrf ? { 'X-CSRF-Token': csrf } : {}), ...headers },
          ...(body !== undefined ? { body: JSON.stringify(body) } : {})
        });
        const setCookie = response.headers.get('set-cookie');
        if (setCookie) cookie = setCookie.split(';')[0];
        const data = await response.json();
        if (data.csrf) csrf = data.csrf;
        return { status: response.status, data, headers: response.headers };
      },
      action(action, args = []) { return this.request('/actions', { method: 'POST', body: { action, args } }); }
    };
  }
  return {
    service, directory, origin, client,
    async close() { await new Promise(resolve => server.close(resolve)); service.close(); rmSync(directory, { recursive: true, force: true }); }
  };
}

let app, admin, inspector, auditor, gestor, initial, product, lot, area, employee, parameter;

beforeAll(async () => {
  app = await fixture();
  admin = app.client();
  const setup = await admin.request('/setup', { method: 'POST', body: { setupToken, username: 'admin', name: 'Administrador de prueba', password } });
  expect(setup.status).toBe(201);
  for (const [username, role] of [['inspector', 'Inspector de Planta'], ['auditor', 'Auditor'], ['gestor', 'Gestor de Calidad']]) {
    const result = await admin.request('/users', { method: 'POST', body: { username, name: username, role, password } });
    expect(result.status).toBe(201);
  }
  inspector = app.client(); auditor = app.client(); gestor = app.client();
  for (const [client, username] of [[inspector, 'inspector'], [auditor, 'auditor'], [gestor, 'gestor']]) {
    expect((await client.request('/login', { method: 'POST', body: { username, password } })).status).toBe(200);
  }
  const seeded = await admin.action('seedDemo');
  expect(seeded.status).toBe(200);
  initial = seeded.data.state;
  product = JSON.parse(initial.storage['quality-products'])[0];
  lot = JSON.parse(initial.storage['quality-lots']).find(row => row.producto_id === product.producto_id);
  area = JSON.parse(initial.storage['quality-areas'])[0];
  employee = JSON.parse(initial.storage['quality-employees'])[0];
  parameter = initial.parameters.find(row => row.productId === product.producto_id);
}, 30000);

afterAll(async () => { if (app) await app.close(); });

function inspection(folio, value = 25) {
  return { tipoDoc: 'Inspección', folio, tipo: 'FINAL', producto_id: product.producto_id, lote_id: lot.lote_id, area_id: area.area_id, inspector_id: employee.empleado_id, fecha_inspeccion: '2026-11-26', measurements: { [parameter.id]: value } };
}

describe('HU14 - acceso y autorización reales del servidor', () => {
  it('rechaza lectura y mutación sin sesión y no expone cuentas de selección pública', async () => {
    const visitor = app.client();
    expect((await visitor.request('/state')).status).toBe(401);
    expect((await visitor.action('deleteDocument', ['cualquiera'])).status).toBe(401);
    const session = await visitor.request('/session');
    expect(session.data).toEqual({ authenticated: false, setupRequired: false });
    expect(JSON.stringify(session.data)).not.toContain(setupToken);
  });

  it('usa cookies HttpOnly/SameSite y guarda hashes, no contraseñas ni verificadores de sesión crudos', async () => {
    const rows = app.service.db.prepare('SELECT * FROM users').all();
    expect(rows.every(row => row.password_hash !== password && row.salt && row.password_hash.length === 128)).toBe(true);
    const session = app.service.db.prepare('SELECT * FROM sessions WHERE user_id=?').get(rows.find(row => row.username === 'admin').id);
    expect(session.token_hash).not.toBe(admin.cookie.split('=')[1]);
    const result = await admin.request('/session');
    expect(JSON.stringify(result.data)).not.toContain('password_hash');
    expect(JSON.stringify(result.data)).not.toContain('token_hash');
  });

  it('no admite elegir el rol ni el actor desde la petición de un auditor', async () => {
    const before = (await admin.request('/state')).data.state.storage;
    const denied = await auditor.action('addEntity', [{ name: 'No autorizado', code: 'X', tipoItem: 'Producto', role: 'Administrador' }, { role: 'Administrador' }]);
    expect(denied.status).toBe(403);
    expect((await admin.request('/state')).data.state.storage).toEqual(before);
  });

  it('rechaza solicitudes cruzadas o sin token CSRF', async () => {
    expect((await admin.request('/actions', { method: 'POST', body: { action: 'seedDemo', args: [] }, headers: { Origin: 'https://otro-sitio.example' } })).status).toBe(403);
    expect((await admin.request('/actions', { method: 'POST', body: { action: 'seedDemo', args: [] }, headers: { 'X-CSRF-Token': '' } })).status).toBe(403);
  });

  it('protege la administración de usuarios y al último administrador', async () => {
    expect((await gestor.request('/users', { method: 'POST', body: { username: 'intruso', name: 'X', password, role: 'Administrador' } })).status).toBe(403);
    const user = (await admin.request('/session')).data.user;
    expect((await admin.request(`/users/${user.id}`, { method: 'PATCH', body: { role: 'Auditor' } })).status).toBe(409);
    expect((await admin.request(`/users/${user.id}`, { method: 'PATCH', body: { active: false } })).status).toBe(409);
  });

  it('revoca una sesión cuando el administrador cambia su perfil y conserva los datos', async () => {
    const target = initial.users.find(user => user.username === 'gestor');
    expect((await admin.request(`/users/${target.id}`, { method: 'PATCH', body: { role: 'Auditor' } })).status).toBe(200);
    expect((await gestor.action('deleteMaster', ['product', product.producto_id])).status).toBe(401);
    expect((await admin.request('/state')).data.state.orders.length).toBeGreaterThan(0);
  });

  it('solo el administrador cambia configuración y un error conserva la última válida', async () => {
    expect((await inspector.request('/config', { method: 'PUT', body: { moduleName: 'No permitido' } })).status).toBe(403);
    expect((await admin.request('/config', { method: 'PUT', body: { moduleName: 'Calidad G16' } })).status).toBe(200);
    expect((await admin.request('/config', { method: 'PUT', body: { moduleName: '' } })).status).toBe(422);
    expect((await admin.request('/config')).data.config.moduleName).toBe('Calidad G16');
  });
});

describe('HU7, HU10 y HU11 - reglas, evidencia y simulación', () => {
  it('carga una simulación relacionada de forma aditiva e idempotente', async () => {
    const response = await admin.action('seedDemo');
    expect(response.status).toBe(200);
    expect(response.data.result.added).toBe(0);
    expect(response.data.state.orders).toHaveLength(24);
    expect(response.data.state.parameters).toHaveLength(4);
    const documents = JSON.parse(response.data.state.storage['quality-documents']);
    expect(documents.filter(doc => doc.series === 'SIM' && doc.tipoDoc === 'NCR')).toHaveLength(4);
    expect(documents.filter(doc => doc.series === 'SIM' && doc.tipoDoc === 'CAPA')).toHaveLength(4);
    for (const capa of documents.filter(doc => doc.series === 'SIM' && doc.tipoDoc === 'CAPA')) {
      const ncr = documents.find(doc => doc.id === capa.ncr_id);
      expect(documents.find(doc => doc.id === ncr.inspectionId)?.resultado).toBe('RECHAZADO');
      expect(capa.targetDate).toBe(capa.fecha_objetivo);
    }
    for (const order of response.data.state.orders) expect(order.simulated).toBe(true);
    expect((await auditor.action('seedDemo')).status).toBe(403);
  });

  it('calcula rechazo aunque el inspector envíe un resultado aceptado y conserva la medición', async () => {
    const response = await inspector.action('addDocument', [{ ...inspection(95001, 28), resultado: 'ACEPTADO', status: 'ACEPTADO', parameterEvaluation: { passed: true } }]);
    expect(response.status).toBe(200);
    expect(response.data.result.resultado).toBe('RECHAZADO');
    expect(response.data.result.parameterEvaluation.passed).toBe(false);
    expect(response.data.result.parameterEvaluation.results[0]).toMatchObject({ value: 28, min: 24, max: 26, version: 1 });
    expect(response.data.alert).toContain('28');
    expect(response.data.alert).toContain(parameter.unit);
  });

  it('rechaza mediciones faltantes y referencias inválidas sin dejar registros parciales', async () => {
    const before = (await admin.request('/state')).data.state.storage;
    expect((await inspector.action('addDocument', [{ ...inspection(95002), measurements: {} }])).status).toBe(422);
    expect((await inspector.action('addDocument', [{ ...inspection(95003), lote_id: 'lote-inexistente' }])).status).toBe(422);
    expect((await admin.request('/state')).data.state.storage).toEqual(before);
  });

  it('no permite borrar un maestro referenciado ni modificar registros como Auditor', async () => {
    const before = (await admin.request('/state')).data.state.storage;
    expect((await admin.action('deleteMaster', ['product', product.producto_id])).status).toBe(409);
    expect((await auditor.action('updateMaster', ['product', product.producto_id, { descripcion: 'Cambio' }])).status).toBe(403);
    expect((await admin.request('/state')).data.state.storage).toEqual(before);
  });

  it('conserva la inspección de origen de una NCR y no reasigna mediciones a otro producto', async () => {
    const created = await inspector.action('addDocument', [inspection(95008)]);
    expect(created.status).toBe(200);
    const ncr = await inspector.action('addDocument', [{ tipoDoc: 'NCR', folio: 95009, origen: 'INTERNO', area_afectada_id: area.area_id, producto_id: product.producto_id, lote_id: lot.lote_id, detectado_por: employee.empleado_id, fecha_deteccion: '2026-11-26', gravedad: 'MENOR', descripcion: 'Hallazgo simulado vinculado a inspección', inspectionId: created.data.result.id }]);
    expect(ncr.status).toBe(200);
    const before = (await admin.request('/state')).data.state.storage;
    expect((await admin.action('deleteDocument', [created.data.result.id])).status).toBe(409);
    const otherProduct = JSON.parse(initial.storage['quality-products']).find(row => row.producto_id !== product.producto_id);
    expect((await admin.action('updateDocument', [created.data.result.id, { producto_id: otherProduct.producto_id }])).status).toBe(422);
    expect((await admin.request('/state')).data.state.storage).toEqual(before);
  });

  it('el Inspector no crea CAPA ni elimina documentos aunque invoque la API directamente', async () => {
    const before = (await admin.request('/state')).data.state.storage;
    expect((await inspector.action('addDocument', [{ tipoDoc: 'CAPA', folio: 96001 }])).status).toBe(403);
    expect((await inspector.action('deleteDocument', ['registro-cualquiera'])).status).toBe(403);
    expect((await admin.request('/state')).data.state.storage).toEqual(before);
  });

  it('cambiar un límite no reescribe la evidencia de inspecciones anteriores', async () => {
    const state = (await admin.request('/state')).data.state;
    const previous = JSON.parse(state.storage['quality-documents']).find(doc => doc.folio === 95001);
    const updated = await admin.action('saveParameter', [{ ...parameter, max: 30 }]);
    expect(updated.status).toBe(200);
    expect(updated.data.result.version).toBe(2);
    const stored = JSON.parse(updated.data.state.storage['quality-documents']).find(doc => doc.id === previous.id);
    expect(stored.parameterEvaluation).toEqual(previous.parameterEvaluation);
    expect(stored.resultado).toBe('RECHAZADO');
  });

  it('no admite parámetros inválidos ni permite a un Inspector editarlos', async () => {
    const before = (await admin.request('/state')).data.state.parameters;
    expect((await admin.action('saveParameter', [{ ...parameter, min: 99, max: 1 }])).status).toBe(422);
    expect((await inspector.action('saveParameter', [{ ...parameter, max: 99 }])).status).toBe(403);
    expect((await admin.request('/state')).data.state.parameters).toEqual(before);
  });

  it('valida transiciones también si se intenta eludir status mediante estado', async () => {
    const state = (await admin.request('/state')).data.state;
    const ncr = JSON.parse(state.storage['quality-documents']).find(doc => doc.tipoDoc === 'NCR' && doc.status === 'ABIERTA');
    const denied = await admin.action('updateDocument', [ncr.id, { estado: 'CERRADA' }]);
    expect(denied.status).toBe(422);
    expect((await admin.request('/state')).data.state.storage).toEqual(state.storage);
    const allowed = await admin.action('updateDocument', [ncr.id, { estado: 'EN_INVESTIGACION' }]);
    expect(allowed.status).toBe(200);
    expect(allowed.data.result).toMatchObject({ status: 'EN_INVESTIGACION', estado: 'EN_INVESTIGACION' });
  });

  it('el Auditor consulta órdenes y trazabilidad sin recibir secretos de cuentas', async () => {
    const state = (await auditor.request('/state')).data.state;
    expect(state.orders.length).toBe(24);
    expect(state.audit.length).toBeGreaterThan(0);
    expect(state.users).toHaveLength(1);
    expect(JSON.stringify(state)).not.toContain('password_hash');
  });
});

describe('instalación, cierre, caducidad y persistencia', () => {
  it('solo permite una configuración inicial aun cuando llegan dos solicitudes juntas', async () => {
    const isolated = await fixture();
    try {
      const first = isolated.client(), second = isolated.client();
      const responses = await Promise.all([first, second].map((client, index) => client.request('/setup', {
        method: 'POST', body: { setupToken, username: `admin${index}`, name: 'Admin', password }
      })));
      expect(responses.map(response => response.status).sort()).toEqual([201, 409]);
      expect(isolated.service.db.prepare('SELECT COUNT(*) AS count FROM users').get().count).toBe(1);
    } finally { await isolated.close(); }
  });

  it('limita intentos repetidos de acceso con un aviso y no crea sesiones inválidas', async () => {
    const isolated = await fixture();
    try {
      const client = isolated.client();
      const statuses = [];
      for (let i = 0; i < 9; i++) statuses.push((await client.request('/login', { method: 'POST', body: { username: 'inexistente', password } })).status);
      expect(statuses.slice(0, 8).every(status => status === 401)).toBe(true);
      expect(statuses[8]).toBe(429);
      expect(isolated.service.db.prepare('SELECT COUNT(*) AS count FROM sessions').get().count).toBe(0);
    } finally { await isolated.close(); }
  });

  it('el primer Administrador requiere código local y la sesión vence en el servidor', async () => {
    let clock = 100000;
    const isolated = await fixture({ now: () => clock, sessionMilliseconds: 1000 });
    try {
      const client = isolated.client();
      expect((await client.request('/setup', { method: 'POST', body: { setupToken: 'incorrecto', username: 'admin', name: 'Admin', password } })).status).toBe(403);
      const created = await client.request('/setup', { method: 'POST', body: { setupToken, username: 'admin', name: 'Admin', password } });
      expect(created.status).toBe(201);
      expect(created.headers.get('set-cookie')).toContain('HttpOnly');
      expect(created.headers.get('set-cookie')).toContain('SameSite=Strict');
      clock += 1001;
      expect((await client.request('/state')).status).toBe(401);
    } finally { await isolated.close(); }
  });

  it('cerrar sesión invalida la cookie anterior y la base no usa contraseñas públicas', async () => {
    const isolated = await fixture();
    try {
      const client = isolated.client();
      expect((await client.request('/setup', { method: 'POST', body: { setupToken, username: 'admin', name: 'Admin', password } })).status).toBe(201);
      expect((await client.request('/logout', { method: 'POST', body: {} })).status).toBe(200);
      expect((await client.request('/state')).status).toBe(401);
      expect((await client.request('/login', { method: 'POST', body: { username: 'admin', password: 'admin' } })).status).toBe(401);
      expect((await client.request('/login', { method: 'POST', body: { username: 'admin', password } })).status).toBe(200);
    } finally { await isolated.close(); }
  });

  it('los datos sobreviven al cerrar y volver a abrir SQLite', async () => {
    const directory = mkdtempSync(join(tmpdir(), 'g16-persist-'));
    let service = createQualityService({ dataDir: directory, setupToken });
    try {
      service.db.prepare('INSERT INTO app_data(key,value) VALUES (?,?)').run('quality-orders', '[{"id":"persistida"}]');
      service.close(); service = createQualityService({ dataDir: directory, setupToken });
      expect(service.db.prepare('SELECT value FROM app_data WHERE key=?').get('quality-orders').value).toContain('persistida');
    } finally { service.close(); rmSync(directory, { recursive: true, force: true }); }
  });
});
