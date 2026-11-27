import { DOCUMENT_TYPE_META, DOMAIN_LABELS, getTypeStatusOptions } from '../document-types.js';
import { escapeHtml } from './html.js';

export function stateRecords(state, key) {
  const raw = state?.storage?.[key];
  if (Array.isArray(raw)) return raw;
  try { const value = JSON.parse(raw || '[]'); return Array.isArray(value) ? value : []; }
  catch { return []; }
}

function readable(value) {
  for (const group of Object.values(DOMAIN_LABELS)) if (group[value]) return group[value];
  return value;
}

function option(value, label, selected) {
  return `<option value="${escapeHtml(value)}" ${String(value) === String(selected ?? '') ? 'selected' : ''}>${escapeHtml(label)}</option>`;
}

function selectOptions(rows, labelFor, valueFor, selected) {
  return option('', 'Seleccione...', selected) + rows.map(row => option(valueFor(row), labelFor(row), selected)).join('');
}

function references(type, state, values) {
  const products = stateRecords(state, 'quality-products');
  const lots = stateRecords(state, 'quality-lots');
  const areas = stateRecords(state, 'quality-areas');
  const employees = stateRecords(state, 'quality-employees');
  const inspections = stateRecords(state, 'quality-documents').filter(doc => doc.tipoDoc === 'Inspección');
  const ncrs = stateRecords(state, 'quality-documents').filter(doc => doc.tipoDoc === 'NCR');
  const productLabel = row => `${row.codigo || ''} — ${row.descripcion || ''}`.trim();
  const lotLabel = row => {
    const product = products.find(item => item.producto_id === row.producto_id);
    return `${row.numero_lote || ''} — ${product?.descripcion || ''}`.trim();
  };
  return {
    producto_id: selectOptions(products, productLabel, row => row.producto_id, values.producto_id),
    lote_id: selectOptions(lots, lotLabel, row => row.lote_id, values.lote_id),
    area_id: selectOptions(areas, row => `${row.codigo || ''} — ${row.nombre || ''}`.trim(), row => row.area_id, values.area_id),
    area_afectada_id: selectOptions(areas, row => `${row.codigo || ''} — ${row.nombre || ''}`.trim(), row => row.area_id, values.area_afectada_id),
    inspector_id: selectOptions(employees, row => `${row.numero_nomina || ''} — ${row.puesto || ''}`.trim(), row => row.empleado_id, values.inspector_id),
    detectado_por: selectOptions(employees, row => `${row.numero_nomina || ''} — ${row.puesto || ''}`.trim(), row => row.empleado_id, values.detectado_por),
    responsable_id: selectOptions(employees, row => `${row.numero_nomina || ''} — ${row.puesto || ''}`.trim(), row => row.empleado_id, values.responsable_id),
    auditor_lider_id: selectOptions(employees, row => `${row.numero_nomina || ''} — ${row.puesto || ''}`.trim(), row => row.empleado_id, values.auditor_lider_id),
    ncr_id: selectOptions(ncrs, row => `Folio ${row.folio || ''}`, row => row.id, values.ncr_id),
    entidad_id: selectOptions(stateRecords(state, 'quality-entities'), row => `${row.name || ''} (${row.code || ''})`, row => row.id, values.entidad_id),
    entidad_auditada_id: selectOptions(stateRecords(state, 'quality-entities'), row => `${row.name || ''} (${row.code || ''})`, row => row.id, values.entidad_auditada_id),
    proveedor_id: selectOptions(stateRecords(state, 'quality-entities'), row => `${row.name || ''} (${row.code || ''})`, row => row.entity_id, values.proveedor_id),
    inspectionId: selectOptions(inspections, row => `Folio ${row.folio || ''} — ${lotLabel(lots.find(lot => lot.lote_id === row.lote_id) || {})}`, row => row.id, values.inspectionId),
    orderId: selectOptions(state?.orders || [], row => `${row.number || ''} — ${row.productName || ''}`, row => row.id, values.orderId)
  };
}

export function renderMeasurementFields(parameters = [], measurements = {}) {
  if (!parameters.length) return '<p class="empty-state">No hay parámetros activos para este producto. Un Gestor debe definirlos antes de inspeccionar.</p>';
  return parameters.map(parameter => {
    const id = `measurement-${parameter.id}`;
    const value = measurements[parameter.id] ?? '';
    return `<div class="field measurement-field"><label for="${escapeHtml(id)}">${escapeHtml(parameter.name)} (${escapeHtml(parameter.unit)})</label>
      <input type="number" step="any" id="${escapeHtml(id)}" data-parameter-id="${escapeHtml(parameter.id)}" data-min="${escapeHtml(parameter.min)}" data-max="${escapeHtml(parameter.max)}" data-unit="${escapeHtml(parameter.unit)}" value="${escapeHtml(value)}">
      <span class="hint">Límite permitido: ${escapeHtml(parameter.min)} a ${escapeHtml(parameter.max)} ${escapeHtml(parameter.unit)}. Versión ${escapeHtml(parameter.version || 1)}.</span>
      <span id="measurement-error-${escapeHtml(parameter.id)}" class="error"></span></div>`;
  }).join('');
}

export function activeParameters(state, productId) {
  return (state?.parameters || []).filter(parameter => parameter.active !== false && parameter.productId === productId);
}

export function renderRemoteDocumentFields(type, values = {}, state = {}, _config = {}) {
  const meta = DOCUMENT_TYPE_META[type];
  if (!meta) return '';
  const refs = references(type, state, values);
  const currentStatus = values.estado || values.resultado || values.status || meta.statuses[0];
  const priority = ['producto_id', 'lote_id', 'tipo', 'area_id', 'inspector_id', 'fecha_inspeccion'];
  const ordered = type === 'Inspección' ? [...meta.fields].sort((a, b) => (priority.includes(a.key) ? priority.indexOf(a.key) : 99) - (priority.includes(b.key) ? priority.indexOf(b.key) : 99)) : meta.fields;
  const fields = ordered.map(field => {
    if (field.key === 'estado' || field.key === 'resultado') return '';
    const id = `td-${field.key}`;
    const value = values[field.key] ?? '';
    const error = `<span id="td-error-${escapeHtml(field.key)}" class="error"></span>`;
    let control;
    if (refs[field.key]) {
      control = `<select id="${escapeHtml(id)}">${refs[field.key]}</select>`;
    } else if (field.type === 'select') {
      control = `<select id="${escapeHtml(id)}">${option('', 'Seleccione...', value)}${(field.options || []).map(item => option(item, readable(item), value)).join('')}</select>`;
    } else {
      control = `<input type="${escapeHtml(field.type)}" id="${escapeHtml(id)}" value="${escapeHtml(value)}">`;
    }
    return `<div class="field"><label for="${escapeHtml(id)}">${escapeHtml(field.label)}${field.required ? ' *' : ''}</label>${control}${error}</div>`;
  });
  const statusControl = type === 'Inspección'
    ? `<input type="hidden" id="td-status" value="${escapeHtml(currentStatus || 'ACEPTADO')}"><p class="hint">El resultado se calcula al guardar con los límites vigentes.</p><span id="td-error-status" class="error"></span>`
    : `<div class="field"><label for="td-status">${meta.fields.some(field => field.key === 'resultado') ? 'Resultado' : 'Estado'}</label><select id="td-status">${getTypeStatusOptions(type, currentStatus).map(status => option(status, readable(status), currentStatus)).join('')}</select><span id="td-error-status" class="error"></span></div>`;
  const extra = [];
  if (type === 'Inspección') {
    const parameters = values.parameterEvaluation?.results || activeParameters(state, values.producto_id);
    extra.push(`<div class="field"><label for="td-orderId">Orden de calidad</label><select id="td-orderId">${refs.orderId}</select></div>`);
    extra.push(`<div id="measurement-fields" class="measurement-grid"><h3>Lecturas requeridas</h3>${renderMeasurementFields(parameters, values.measurements || {})}</div>`);
  }
  if (type === 'NCR') {
    extra.push(`<div class="field"><label for="td-inspectionId">Inspección de origen</label><select id="td-inspectionId">${refs.inspectionId}</select></div>`);
  }
  if (type === 'CAPA') {
    extra.push(`<div class="field"><label for="td-actionDescription">Acción acordada *</label><input type="text" id="td-actionDescription" value="${escapeHtml(values.actionDescription || '')}"><span id="td-error-actionDescription" class="error"></span></div>`);
    extra.push(`<div class="field"><label for="td-evidence">Evidencia</label><input type="text" id="td-evidence" value="${escapeHtml(values.evidence || '')}"></div>`);
  }
  return fields.join('') + statusControl + extra.join('');
}

export function readRemoteDocumentFields(root) {
  const data = {};
  for (const input of root.querySelectorAll('input[id^="td-"],select[id^="td-"],textarea[id^="td-"]')) {
    if (input.disabled) continue;
    data[input.id.slice(3)] = input.value;
  }
  for (const input of root.querySelectorAll('[data-parameter-id]')) {
    data.measurements = data.measurements || {};
    data.measurements[input.dataset.parameterId] = input.value;
  }
  return data;
}

export function refreshInspectionMeasurements(root, state, measurements = {}) {
  const container = root.querySelector('#measurement-fields');
  if (!container) return;
  const productId = root.querySelector('#td-producto_id')?.value || '';
  const existing = state?.parameters?.find(parameter => parameter.productId === productId && parameter.id === measurements.parameterId);
  const parameters = existing?.parameterEvaluation?.results || activeParameters(state, productId);
  const heading = container.querySelector('h3');
  container.innerHTML = heading ? `${heading.outerHTML}${renderMeasurementFields(parameters, measurements.values || {})}` : renderMeasurementFields(parameters, measurements.values || {});
}
