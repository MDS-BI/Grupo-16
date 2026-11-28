import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { openDatabase } from './database.js';
import { insertAccount, passwordHash, publicUser, safeEqual, secret, hashToken, validateAccount, verifyPassword } from './auth.js';
import { setStorageProvider } from '../src/persistence.js';
import { getConfig, setActiveConfig, normalizeConfig, QUALITY_CONFIG } from '../src/module-config.js';
import { can, ROLES } from '../src/permissions.js';
import * as records from '../src/storage.js';
import * as masters from '../src/master-data.js';
import { seedDemo } from '../src/demo-data.js';
import { DOCUMENT_TYPE_META } from '../src/document-types.js';
import { evaluateMeasurements, validateParameter, ORDER_STATUSES, isCalendarDate, QualityValidationError } from '../src/quality-parameters.js';

const context = new AsyncLocalStorage();
setStorageProvider(() => context.getStore());
const keys = ['quality-areas', 'quality-employees', 'quality-products', 'quality-lots', 'quality-entities', 'quality-documents', 'quality-models', 'quality-parameters', 'quality-orders'];
const idFields = { area: 'area_id', employee: 'empleado_id', product: 'producto_id', lot: 'lote_id' };
const cookieName = 'g16-session';
const fail = (status, message) => Object.assign(new Error(message), { status });
const currentTime = () => Date.now();

export function createQualityService({ dataDir, databasePath, setupToken, now = currentTime, sessionMilliseconds = 8 * 60 * 60 * 1000, secureCookies = false, publicOrigin = '' } = {}) {
  const store = openDatabase(databasePath || join(dataDir || '.local-data', 'quality.sqlite'));
  const db = store.db;
  const bootstrapPath = dataDir ? join(dataDir, 'codigo-instalacion.txt') : null;
  let bootstrap = setupToken;
  if (!bootstrap && bootstrapPath && existsSync(bootstrapPath)) bootstrap = readFileSync(bootstrapPath, 'utf8').trim();
  if (!bootstrap) bootstrap = secret();
  if (bootstrapPath && !setupToken && !db.prepare('SELECT id FROM users LIMIT 1').get()) {
    writeFileSync(bootstrapPath, bootstrap, { mode: 0o600 });
  }
  let setupBusy = false;
  const attempts = new Map();
  const users = () => db.prepare('SELECT * FROM users ORDER BY username').all().map(publicUser);
  const readArray = key => { try { const value = JSON.parse(store.getItem(key) || '[]'); return Array.isArray(value) ? value : []; } catch { return []; } };
  const saveArray = (key, value) => store.setItem(key, JSON.stringify(value));
  const runtimeConfig = () => {
    try { return normalizeConfig(JSON.parse(store.getItem('quality-config') || 'null') || QUALITY_CONFIG).config; }
    catch { return QUALITY_CONFIG; }
  };
  const requirePermission = (actor, permission) => {
    const persisted = actor && publicUser(db.prepare('SELECT * FROM users WHERE id=?').get(actor.id));
    if (!persisted?.active || !can(persisted, permission)) throw fail(403, 'Tu cuenta no tiene permiso para realizar esta operación.');
  };
  const audit = (actor, action, target = '') => db.prepare('INSERT INTO audit(at,actor_id,actor_name,action,target) VALUES (?,?,?,?,?)')
    .run(new Date(now()).toISOString(), actor.id, actor.name, action, String(target).slice(0, 200));

  function domain(actor, fn) {
    const storage = {
      getItem(key) {
        if (key === 'quality-users') return JSON.stringify(users());
        if (key === 'quality-session') return actor.id;
        return store.getItem(key);
      },
      setItem(key, value) {
        if (!keys.includes(key)) throw fail(403, 'No se permite modificar esta clave desde una operación de registros.');
        store.setItem(key, value);
      },
      removeItem(key) {
        if (!keys.includes(key)) throw fail(403, 'No se permite eliminar esta clave.');
        store.removeItem(key);
      }
    };
    const previous = getConfig();
    try {
      setActiveConfig(runtimeConfig());
      return context.run(storage, fn);
    } finally { setActiveConfig(previous); }
  }

  function snapshot(actor) {
    requirePermission(actor, 'read');
    const storage = Object.fromEntries(keys.map(key => [key, store.getItem(key) || '[]']));
    storage['quality-users'] = JSON.stringify(can(actor, 'manage-permissions') ? users() : [actor]);
    storage['quality-session'] = actor.id;
    const auditRows = can(actor, 'audit') ? db.prepare('SELECT id,at,actor_name AS actor,action,target FROM audit ORDER BY id DESC LIMIT 500').all() : [];
    return { storage, parameters: readArray('quality-parameters'), orders: readArray('quality-orders'), audit: auditRows, users: can(actor, 'manage-permissions') ? users() : [actor] };
  }

  function referenced(id, excludeKey) {
    const contains = value => value === id || (value && typeof value === 'object' && Object.values(value).some(contains));
    return keys.filter(key => key !== excludeKey && key !== 'quality-models').some(key => readArray(key).some(contains));
  }

  function inspect(data, existing) {
    if ((data.tipoDoc || existing?.tipoDoc) !== 'Inspección') return null;
    const productId = data.producto_id || existing?.producto_id;
    const parameters = existing?.parameterEvaluation?.results || readArray('quality-parameters').filter(parameter => parameter.productId === productId && parameter.active);
    if (existing?.parameterEvaluation && data.measurements === undefined) return existing.parameterEvaluation;
    const evaluation = evaluateMeasurements(parameters, data.measurements);
    data.resultado = evaluation.passed ? 'ACEPTADO' : 'RECHAZADO';
    data.status = data.resultado;
    return evaluation;
  }

  function checkDocumentReferences(data) {
    const mapping = { area_id: 'area', area_afectada_id: 'area', producto_id: 'product', lote_id: 'lot', inspector_id: 'employee', detectado_por: 'employee', responsable_id: 'employee', auditor_lider_id: 'employee' };
    for (const [field, type] of Object.entries(mapping)) {
      if (data[field] && !masters.findMaster(type, data[field])) throw new QualityValidationError('Selecciona un registro existente.', { [field]: 'No existe el registro seleccionado.' });
    }
    if (data.producto_id && data.lote_id && masters.findMaster('lot', data.lote_id)?.producto_id !== data.producto_id) throw new QualityValidationError('El lote no pertenece al producto seleccionado.');
    if (data.ncr_id && !records.loadDocuments().some(record => record.id === data.ncr_id && record.tipoDoc === 'NCR')) throw new QualityValidationError('Selecciona una no conformidad existente.');
    if (data.inspectionId && !records.loadDocuments().some(record => record.id === data.inspectionId && record.tipoDoc === 'Inspección' && (!data.lote_id || record.lote_id === data.lote_id))) throw new QualityValidationError('Selecciona una inspección del mismo lote.');
    if (data.orderId) {
      const order = readArray('quality-orders').find(row => row.id === data.orderId);
      if (!order || (data.producto_id && order.productId !== data.producto_id) || (data.lote_id && order.lotId !== data.lote_id)) throw new QualityValidationError('La orden no corresponde al producto y lote de la inspección.');
    }
  }

  function writeInspectionDetails(record, data, evaluation) {
    const all = records.loadDocuments();
    const index = all.findIndex(row => row.id === record.id);
    const typed = Object.fromEntries((DOCUMENT_TYPE_META[data.tipoDoc]?.fields || []).filter(field => field.key !== 'folio' && data[field.key] !== undefined).map(field => [field.key, data[field.key]]));
    all[index] = { ...all[index], ...typed, ...(evaluation ? { parameterEvaluation: evaluation, measurements: Object.fromEntries(evaluation.results.map(result => [result.id, result.value])) } : {}),
      ...Object.fromEntries(['orderId', 'inspectionId', 'actionDescription', 'evidence', 'disposition'].filter(key => data[key] !== undefined).map(key => [key, data[key]])) };
    store.setItem('quality-documents', JSON.stringify(all));
    return all[index];
  }

  function saveParameter(actor, data) {
    requirePermission(actor, 'manage-records');
    const normalized = validateParameter(data);
    if (!masters.findMaster('product', normalized.productId)) throw new QualityValidationError('Selecciona un producto existente.');
    const all = readArray('quality-parameters');
    const previous = data.id ? all.find(row => row.id === data.id) : null;
    if (data.id && !previous) throw fail(404, 'Parámetro no encontrado.');
    const record = { ...normalized, id: data.id || randomUUID(), version: (previous?.version || 0) + 1, simulated: Boolean(data.simulated), updatedAt: new Date(now()).toISOString(), updatedBy: actor.name };
    if (previous) all[all.indexOf(previous)] = record; else all.push(record);
    saveArray('quality-parameters', all);
    return record;
  }

  function saveOrder(actor, data) {
    requirePermission(actor, 'manage-records');
    const product = masters.findMaster('product', data.productId);
    const lot = masters.findMaster('lot', data.lotId);
    if (!product || !lot || lot.producto_id !== data.productId) throw new QualityValidationError('Selecciona un producto y un lote relacionado.');
    if (typeof data.number !== 'string' || !data.number.trim() || typeof data.responsible !== 'string' || !data.responsible.trim()) throw new QualityValidationError('Indica número de orden y responsable.');
    if (!Number.isInteger(Number(data.quantity)) || Number(data.quantity) <= 0 || !isCalendarDate(data.dueDate) || !ORDER_STATUSES.includes(data.status)) throw new QualityValidationError('Revisa cantidad, fecha objetivo y estado de la orden.');
    const all = readArray('quality-orders');
    if (all.some(order => order.number.toLowerCase() === data.number.trim().toLowerCase() && order.id !== data.id)) throw new QualityValidationError('Ya existe una orden con ese número.');
    const existing = data.id ? all.find(order => order.id === data.id) : null;
    if (data.id && !existing) throw fail(404, 'Orden no encontrada.');
    if (data.status === 'LIBERADA' && !records.loadDocuments().some(doc => doc.orderId === data.id && doc.tipoDoc === 'Inspección' && doc.resultado === 'ACEPTADO')) throw new QualityValidationError('Para liberar la orden registra primero una inspección aceptada.');
    const record = { id: data.id || randomUUID(), number: data.number.trim(), productId: data.productId, lotId: data.lotId, productName: product.descripcion, lotNumber: lot.numero_lote, quantity: Number(data.quantity), responsible: data.responsible.trim(), dueDate: data.dueDate, status: data.status, simulated: Boolean(data.simulated), createdAt: existing?.createdAt || new Date(now()).toISOString(), updatedAt: new Date(now()).toISOString() };
    if (existing) all[all.indexOf(existing)] = record; else all.push(record);
    saveArray('quality-orders', all);
    return record;
  }

  function simulate(actor) {
    requirePermission(actor, 'manage-permissions');
    const before = keys.reduce((sum, key) => sum + readArray(key).length, 0);
    seedDemo();
    const products = masters.loadMasters('product').filter(product => product.codigo.startsWith('DEMO-'));
    const lots = masters.loadMasters('lot');
    const area = masters.loadMasters('area')[0];
    const employee = masters.loadMasters('employee')[0];
    const entity = records.loadEntities().find(row => row.code === 'DEMO-REF01');
    for (const [productIndex, product] of products.entries()) {
      const lot = lots.find(row => row.producto_id === product.producto_id);
      if (!lot) continue;
      const parameterName = ['Peso del envase', 'Diámetro de tapa', 'Ancho de etiqueta', 'Largo de caja'][productIndex % 4];
      let parameter = readArray('quality-parameters').find(row => row.productId === product.producto_id && row.name === parameterName);
      if (!parameter) parameter = saveParameter(actor, { name: parameterName, productId: product.producto_id, unit: productIndex ? 'mm' : 'g', min: 24, max: 26, simulated: true });
      for (let i = 0; i < 6; i++) {
        const number = `SIM-${productIndex + 1}-${String(i + 1).padStart(3, '0')}`;
        let order = readArray('quality-orders').find(row => row.number === number);
        if (!order) order = saveOrder(actor, { number, productId: product.producto_id, lotId: lot.lote_id, quantity: 100 + i * 20, responsible: 'Equipo de Calidad simulado', dueDate: new Date(now() + (i - 2) * 86400000).toISOString().slice(0, 10), status: 'EN_INSPECCION', simulated: true });
        const folio = 93000 + productIndex * 10 + i;
        if (records.loadDocuments().some(doc => doc.series === 'SIM' && doc.folio === folio)) continue;
        const value = i % 3 === 0 ? 28 : 25;
        const data = { entityId: entity.id, series: 'SIM', folio, tipoDoc: 'Inspección', tipo: 'FINAL', area_id: area.area_id, producto_id: product.producto_id, lote_id: lot.lote_id, inspector_id: employee.empleado_id, fecha_inspeccion: new Date(now() - i * 86400000).toISOString().slice(0, 10), measurements: { [parameter.id]: value }, orderId: order.id, observaciones: 'Dato ficticio para validar filtros y gráficos.' };
        const evaluation = inspect(data);
        const record = records.addDocument(data, actor.name);
        const disposition = evaluation.passed ? 'LIBERADA' : (i % 2 ? 'DESCARTE' : 'RETRABAJO');
        const saved = writeInspectionDetails(record, data, evaluation);
        saved.disposition = disposition;
        const latest = records.loadDocuments(); latest[latest.findIndex(doc => doc.id === saved.id)] = saved;
        saveArray('quality-documents', latest);
        const orders = readArray('quality-orders'); const current = orders.find(row => row.id === order.id);
        current.status = evaluation.passed ? 'LIBERADA' : i % 2 ? 'RECHAZADA' : 'RETRABAJO';
        saveArray('quality-orders', orders);
      }
      const rejected = records.loadDocuments().find(doc => doc.series === 'SIM' && doc.producto_id === product.producto_id && doc.resultado === 'RECHAZADO');
      if (rejected) {
        const ncrFolio = 94000 + productIndex;
        let ncr = records.loadDocuments().find(doc => doc.series === 'SIM' && doc.tipoDoc === 'NCR' && doc.folio === ncrFolio);
        if (!ncr) {
          const data = { entityId: entity.id, series: 'SIM', tipoDoc: 'NCR', folio: ncrFolio, origen: 'INTERNO', area_afectada_id: area.area_id, producto_id: product.producto_id, lote_id: lot.lote_id, detectado_por: employee.empleado_id, fecha_deteccion: rejected.fecha_inspeccion, gravedad: 'MENOR', descripcion: `${parameterName} fuera de tolerancia en una lectura simulada.`, status: 'ABIERTA', estado: 'ABIERTA', inspectionId: rejected.id };
          ncr = writeInspectionDetails(records.addDocument(data, actor.name), data, null);
        }
        const capaFolio = 94010 + productIndex;
        if (!records.loadDocuments().some(doc => doc.series === 'SIM' && doc.tipoDoc === 'CAPA' && doc.folio === capaFolio)) {
          const date = new Date(now() + 3 * 86400000).toISOString().slice(0, 10);
          const data = { entityId: entity.id, series: 'SIM', tipoDoc: 'CAPA', folio: capaFolio, ncr_id: ncr.id, tipo: 'CORRECTIVA', responsable_id: employee.empleado_id, fecha_objetivo: date, causa_raiz: 'Ajuste de máquina desviado durante el turno simulado.', metodologia: '5_WHYS', estado: 'ABIERTA', status: 'ABIERTA', actionDescription: 'Revisar el ajuste del equipo y repetir cinco mediciones del lote antes de proponer su liberación.', evidence: 'La verificación de eficacia está pendiente en este caso ficticio.', targetDate: date, responsible: employee.numero_nomina, actionType: 'Reinspección' };
          writeInspectionDetails(records.addDocument(data, actor.name), data, null);
        }
      }
    }
    return { added: keys.reduce((sum, key) => sum + readArray(key).length, 0) - before };
  }

  function mutate(actor, action, args = []) {
    if (!Array.isArray(args) || args.length > 4) throw new QualityValidationError('Argumentos no válidos.');
    const payload = args.find(value => value && typeof value === 'object' && !Array.isArray(value));
    if (payload && JSON.stringify(payload).length > 50000) throw fail(413, 'La operación es demasiado grande.');
    return store.transaction(() => domain(actor, () => {
      let result;
      let alert = '';
      const permissionMap = { addEntity: 'create-master-data', updateEntity: 'edit-master-data', deleteEntity: 'delete-master-data', addMaster: 'create-master-data', updateMaster: 'edit-master-data', deleteMaster: 'delete-master-data' };
      if (Object.hasOwn(permissionMap, action)) requirePermission(actor, permissionMap[action]);
      switch (action) {
        case 'addEntity': result = records.addEntity(args[0], actor.name); break;
        case 'updateEntity': result = records.updateEntity(args[0], args[1], actor.name); break;
        case 'deleteEntity':
          if (referenced(args[0], 'quality-entities')) throw fail(409, 'El registro tiene documentos u órdenes asociados y no puede eliminarse.');
          result = records.deleteEntity(args[0]); break;
        case 'addMaster': result = masters.addMaster(args[0], args[1], actor.name); break;
        case 'updateMaster': result = masters.updateMaster(args[0], args[1], args[2], actor.name); break;
        case 'deleteMaster': {
          const key = { area: 'quality-areas', employee: 'quality-employees', product: 'quality-products', lot: 'quality-lots' }[args[0]];
          if (referenced(args[1], key)) throw fail(409, 'Este maestro está vinculado a otros registros. Conserva su trazabilidad.');
          result = masters.deleteMaster(args[0], args[1], actor.name); break;
        }
        case 'addDocument': case 'updateDocument': {
          const existing = action === 'updateDocument' ? records.loadDocuments().find(row => row.id === args[0]) : null;
          if (action === 'updateDocument' && !existing) throw fail(404, 'Registro no encontrado.');
          const incoming = action === 'addDocument' ? args[0] : args[1];
          const data = { ...(existing || {}), ...incoming };
          const type = data.tipoDoc || data.documentType;
          if (!['Inspección', 'NCR', 'CAPA', 'Auditoría', 'Queja', 'Evaluación'].includes(type)) throw new QualityValidationError('Selecciona un tipo de registro válido.');
          const permission = action === 'updateDocument' ? 'edit-operational' : type === 'Inspección' ? 'register-inspections' : type === 'NCR' ? 'report-ncr' : 'create-operational';
          requirePermission(actor, permission);
          if (action === 'updateDocument' && type !== existing.tipoDoc) throw new QualityValidationError('No se puede cambiar el tipo de un registro existente.');
          if (existing?.parameterEvaluation && (data.producto_id !== existing.producto_id || data.lote_id !== existing.lote_id)) throw new QualityValidationError('La inspección ya tiene mediciones. Registra una nueva inspección para otro producto o lote.');
          const meta = DOCUMENT_TYPE_META[type];
          if (meta.fields.some(field => field.key === 'estado')) {
            if (incoming.status && incoming.estado && incoming.status !== incoming.estado) throw new QualityValidationError('El estado del registro no coincide con el estado de la operación.');
            data.status = incoming.status || incoming.estado || existing?.status || meta.statuses[0];
            data.estado = data.status;
            if (!existing && data.status !== meta.statuses[0]) throw new QualityValidationError(`Un registro nuevo comienza en ${meta.statuses[0]}.`);
          }
          checkDocumentReferences(data);
          if (type === 'CAPA') {
            data.targetDate = data.fecha_objetivo;
            data.responsible = masters.findMaster('employee', data.responsable_id)?.numero_nomina || '';
          }
          if (type === 'CAPA' && (typeof data.actionDescription !== 'string' || !data.actionDescription.trim())) throw new QualityValidationError('Describe la acción correctiva o preventiva acordada.', { actionDescription: 'La acción propuesta es obligatoria.' });
          if (!data.entityId) {
            const parent = data.ncr_id && records.loadDocuments().find(record => record.id === data.ncr_id);
            if (parent) data.entityId = parent.entityId;
            else {
              const referenceId = data.lote_id || data.producto_id || data.area_id || data.area_afectada_id;
              const master = data.lote_id ? masters.findMaster('lot', data.lote_id) : data.producto_id ? masters.findMaster('product', data.producto_id) : masters.findMaster('area', referenceId);
              if (!master) throw new QualityValidationError('Selecciona el lote, producto o área del registro.');
              const code = `REF-${referenceId}`;
              const reference = records.loadEntities().find(record => record.code === code) || records.addEntity({ code, name: master.numero_lote || master.descripcion || master.nombre, tipoItem: data.lote_id ? 'Lote' : data.producto_id ? 'Producto' : 'Área' }, actor.name);
              data.entityId = reference.id;
            }
          }
          if (!existing?.parameterEvaluation) delete data.parameterEvaluation;
          const evaluation = inspect(data, existing);
          result = action === 'addDocument' ? records.addDocument(data, actor.name) : records.updateDocument(args[0], data, actor.name);
          result = writeInspectionDetails(result, data, evaluation);
          if (evaluation && !evaluation.passed) alert = `Inspección rechazada. ${evaluation.message}`;
          break;
        }
        case 'deleteDocument':
          requirePermission(actor, 'delete-operational');
          if (referenced(args[0], 'quality-documents') || records.loadDocuments().some(doc => doc.ncr_id === args[0] || doc.inspectionId === args[0])) throw fail(409, 'Este registro tiene referencias y no puede eliminarse.');
          result = records.deleteDocument(args[0]); break;
        case 'saveParameter': result = saveParameter(actor, args[0]); break;
        case 'saveOrder': result = saveOrder(actor, args[0]); break;
        case 'seedDemo': result = simulate(actor); break;
        default: throw fail(404, 'Operación no disponible.');
      }
      audit(actor, action, result?.id || result?.[idFields[args[0]]] || args[0]?.number || '');
      return { result, alert, state: snapshot(actor) };
    }));
  }

  function session(req) {
    const cookie = String(req.headers.cookie || '').split(';').map(part => part.trim()).find(part => part.startsWith(`${cookieName}=`));
    const token = cookie?.slice(cookieName.length + 1) || '';
    if (!/^[a-f0-9]{64}$/.test(token)) return null;
    const row = db.prepare('SELECT sessions.*, users.username,users.name,users.role,users.active FROM sessions JOIN users ON users.id=sessions.user_id WHERE token_hash=?').get(hashToken(token));
    if (!row || !row.active || !ROLES.includes(row.role) || row.expires_at <= now() || row.last_seen + 30 * 60 * 1000 <= now()) return null;
    db.prepare('UPDATE sessions SET last_seen=? WHERE token_hash=?').run(now(), row.token_hash);
    return { row, user: publicUser({ ...row, id: row.user_id }) };
  }

  function rateLimit(req, suffix) {
    const key = `${req.socket.remoteAddress}:${suffix}`;
    const entry = attempts.get(key);
    if (!entry || entry.until <= now()) {
      if (attempts.size > 1000) for (const [candidate, value] of attempts) if (value.until <= now()) attempts.delete(candidate);
      attempts.set(key, { count: 1, until: now() + 60000 }); return;
    }
    entry.count++;
    if (entry.count > 8) throw fail(429, 'Demasiados intentos. Espera un minuto y vuelve a intentarlo.');
  }

  function issueSession(user, res) {
    const token = secret(), csrf = secret();
    db.prepare('DELETE FROM sessions WHERE expires_at<=?').run(now());
    db.prepare('INSERT INTO sessions(token_hash,user_id,csrf,created_at,expires_at,last_seen) VALUES (?,?,?,?,?,?)')
      .run(hashToken(token), user.id, csrf, now(), now() + sessionMilliseconds, now());
    res.setHeader('Set-Cookie', `${cookieName}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${Math.floor(sessionMilliseconds / 1000)}${secureCookies ? '; Secure' : ''}`);
    return { authenticated: true, user, csrf, state: snapshot(user), config: runtimeConfig() };
  }

  async function body(req) {
    if (!String(req.headers['content-type'] || '').startsWith('application/json')) throw fail(415, 'Envía los datos en formato JSON.');
    const chunks = []; let length = 0;
    for await (const chunk of req) { length += chunk.length; if (length > 65536) throw fail(413, 'La solicitud supera el tamaño permitido.'); chunks.push(chunk); }
    try { const value = JSON.parse(Buffer.concat(chunks).toString() || '{}'); if (!value || Array.isArray(value) || typeof value !== 'object') throw new Error(); return value; }
    catch { throw fail(400, 'La solicitud contiene datos inválidos.'); }
  }

  async function handle(req, res) {
    const path = new URL(req.url, 'http://localhost').pathname;
    if (!path.startsWith('/api/')) return false;
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    const send = (status, data) => { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(data)); };
    try {
      const host = String(req.headers.host || '');
      const origin = publicOrigin || `http://${host}`;
      if (!publicOrigin && !/^(127\.0\.0\.1|localhost|\[::1\])(:\d+)?$/.test(host)) throw fail(403, 'Host no permitido.');
      if (req.method === 'GET' && path === '/api/session') {
        const active = session(req);
        if (!active) { send(200, { authenticated: false, setupRequired: !db.prepare('SELECT id FROM users LIMIT 1').get() }); return true; }
        send(200, { authenticated: true, user: active.user, csrf: active.row.csrf, state: snapshot(active.user), config: runtimeConfig() }); return true;
      }
      const active = session(req);
      if (req.method !== 'GET') {
        if (req.headers.origin !== origin) throw fail(403, 'Origen de la solicitud no permitido.');
      }
      if (req.method === 'POST' && path === '/api/setup') {
        rateLimit(req, 'setup');
        if (db.prepare('SELECT id FROM users LIMIT 1').get() || setupBusy) throw fail(409, 'La instalación inicial ya está completada o en curso.');
        const data = await body(req);
        if (!safeEqual(data.setupToken, bootstrap)) throw fail(403, 'El código de instalación no es válido.');
        if (db.prepare('SELECT id FROM users LIMIT 1').get() || setupBusy) throw fail(409, 'La instalación inicial ya está completada o en curso.');
        setupBusy = true;
        try {
          const user = await insertAccount(db, { ...data, role: 'Administrador' });
          bootstrap = ''; if (bootstrapPath) writeFileSync(bootstrapPath, 'Instalación completada.\n', { mode: 0o600 });
          audit(user, 'Configuración inicial', user.username); send(201, issueSession(user, res));
        } finally { setupBusy = false; }
        return true;
      }
      if (req.method === 'POST' && path === '/api/login') {
        rateLimit(req, 'login'); const data = await body(req);
        const row = typeof data.username === 'string' ? db.prepare('SELECT * FROM users WHERE username=? COLLATE NOCASE').get(data.username) : null;
        const valid = await verifyPassword(data.password, row || { salt: 'invalid-account-fixed-salt', password_hash: '0'.repeat(128) });
        if (!row?.active || !valid || !ROLES.includes(row.role)) throw fail(401, 'Usuario o contraseña incorrectos.');
        const latest = db.prepare('SELECT * FROM users WHERE id=?').get(row.id);
        if (!latest?.active || !safeEqual(latest.password_hash, row.password_hash) || !ROLES.includes(latest.role)) throw fail(401, 'Usuario o contraseña incorrectos.');
        const user = publicUser(latest); audit(user, 'Inicio de sesión', user.username); send(200, issueSession(user, res)); return true;
      }
      if (!active) throw fail(401, 'Inicia sesión para acceder al módulo.');
      if (req.method === 'GET' && path === '/api/state') { send(200, { state: snapshot(active.user) }); return true; }
      if (req.method === 'GET' && path === '/api/config') { send(200, { config: runtimeConfig() }); return true; }
      if (req.method !== 'GET' && !safeEqual(req.headers['x-csrf-token'], active.row.csrf)) throw fail(403, 'La sesión de la operación no es válida. Recarga e inténtalo de nuevo.');
      if (req.method === 'POST' && path === '/api/logout') {
        db.prepare('DELETE FROM sessions WHERE token_hash=?').run(active.row.token_hash);
        res.setHeader('Set-Cookie', `${cookieName}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${secureCookies ? '; Secure' : ''}`);
        send(200, { authenticated: false }); return true;
      }
      if (req.method === 'POST' && path === '/api/actions') {
        const data = await body(req); const current = session(req); if (!current) throw fail(401, 'La sesión ya no está activa.');
        send(200, mutate(current.user, data.action, data.args)); return true;
      }
      if (req.method === 'PUT' && path === '/api/config') {
        requirePermission(active.user, 'manage-config'); const data = await body(req);
        const current = session(req); if (!current) throw fail(401, 'La sesión ya no está activa.');
        requirePermission(current.user, 'manage-config');
        if (typeof data.moduleName !== 'string' || !data.moduleName.trim() || data.moduleName.length > 100) throw new QualityValidationError('Indica un nombre de módulo válido.');
        if (data.labels && (typeof data.labels !== 'object' || Array.isArray(data.labels) || Object.values(data.labels).some(label => typeof label !== 'string' || !label.trim() || label.length > 100))) throw new QualityValidationError('Revisa las etiquetas de la configuración.');
        const result = normalizeConfig({ ...runtimeConfig(), moduleName: data.moduleName, ...(data.labels ? { labels: data.labels } : {}), ...(data.theme ? { theme: data.theme } : {}) });
        if (result.errors.length) throw new QualityValidationError(result.errors.join(' '));
        store.transaction(() => { store.setItem('quality-config', JSON.stringify(result.config)); audit(active.user, 'Actualizar configuración', result.config.moduleName); });
        send(200, { config: result.config }); return true;
      }
      if (req.method === 'POST' && path === '/api/users') {
        requirePermission(active.user, 'manage-permissions'); const data = await body(req);
        const user = await insertAccount(db, data, { authorize: () => {
          const current = session(req); if (!current) throw fail(401, 'La sesión ya no está activa.');
          requirePermission(current.user, 'manage-permissions');
        } }); audit(active.user, 'Crear cuenta', user.username);
        send(201, { user, state: snapshot(active.user) }); return true;
      }
      if (req.method === 'PATCH' && path.startsWith('/api/users/')) {
        requirePermission(active.user, 'manage-permissions'); const data = await body(req); const id = decodeURIComponent(path.slice('/api/users/'.length));
        const current = session(req); if (!current) throw fail(401, 'La sesión ya no está activa.');
        requirePermission(current.user, 'manage-permissions');
        const target = db.prepare('SELECT * FROM users WHERE id=?').get(id); if (!target) throw fail(404, 'Cuenta no encontrada.');
        const role = data.role ?? target.role; const name = data.name ?? target.name;
        validateAccount({ username: target.username, name, role });
        const enabled = data.active === undefined ? target.active : data.active === true ? 1 : 0;
        const admins = db.prepare("SELECT COUNT(*) AS count FROM users WHERE role='Administrador' AND active=1").get().count;
        if (target.role === 'Administrador' && target.active && (role !== 'Administrador' || !enabled) && admins <= 1) throw fail(409, 'No puedes desactivar ni quitar el perfil al último Administrador.');
        store.transaction(() => {
          db.prepare('UPDATE users SET name=?,role=?,active=? WHERE id=?').run(name.trim(), role, enabled, id);
          if (target.role !== role || !enabled) db.prepare('DELETE FROM sessions WHERE user_id=?').run(id);
          audit(active.user, 'Actualizar cuenta', target.username);
        });
        send(200, { user: publicUser(db.prepare('SELECT * FROM users WHERE id=?').get(id)), state: snapshot(active.user) }); return true;
      }
      if (req.method === 'POST' && path === '/api/password') {
        const data = await body(req); const row = db.prepare('SELECT * FROM users WHERE id=?').get(active.user.id);
        if (!await verifyPassword(data.currentPassword, row)) throw fail(401, 'La contraseña actual no es correcta.');
        const changed = await passwordHash(data.newPassword);
        const current = session(req);
        if (!current || !safeEqual(db.prepare('SELECT password_hash FROM users WHERE id=?').get(row.id)?.password_hash, row.password_hash)) throw fail(401, 'La sesión ya no está activa. Inicia sesión de nuevo.');
        store.transaction(() => { db.prepare('UPDATE users SET salt=?,password_hash=? WHERE id=?').run(changed.salt, changed.hash, row.id); db.prepare('DELETE FROM sessions WHERE user_id=?').run(row.id); audit(active.user, 'Cambiar contraseña', row.username); });
        send(200, issueSession(active.user, res)); return true;
      }
      throw fail(404, 'Ruta no disponible.');
    } catch (error) {
      let status = error.status || 500;
      let message = error.message;
      let fields = error.fields;
      if (!error.status && /^Transición de estado inválida/.test(message)) {
        status = 422; message = 'No se permite ese cambio de estado. Selecciona una transición válida del registro.';
      }
      if (!error.status && /^Validaci[oó]n/.test(message)) {
        status = 422; try { fields = JSON.parse(message.slice(message.indexOf('{'))); } catch { fields = {}; }
        message = 'Revisa los campos indicados antes de guardar.';
      }
      if (status === 500) { console.error('Error del servicio de calidad:', error.message); message = 'No se pudo completar la operación. Los datos no se modificaron.'; }
      send(status, { error: message, ...(fields ? { fields } : {}) }); return true;
    }
  }

  return { handle, close: () => store.close(), snapshot, mutate, db, bootstrapPath };
}
