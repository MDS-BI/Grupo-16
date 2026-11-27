import { escapeHtml } from './html.js';

export const MASTER_SCHEMAS = {
  area: [
    { key: 'codigo', label: 'Código', type: 'text', required: true },
    { key: 'nombre', label: 'Nombre', type: 'text', required: true },
    { key: 'modulo', label: 'Módulo', type: 'select', options: ['VENTAS', 'ADQUISICION_COMPRAS', 'MANUFACTURA_OPERACIONES', 'CONTABILIDAD_FINANZAS', 'RRHH_PLANILLA', 'LOGISTICA_INVENTARIO', 'CRM'], required: true },
    { key: 'activo', label: 'Activo', type: 'checkbox' }
  ],
  employee: [
    { key: 'numero_nomina', label: 'Número de nómina', type: 'text', required: true },
    { key: 'puesto', label: 'Puesto', type: 'text', required: true },
    { key: 'area_id', label: 'Área organizativa', type: 'reference', reference: 'areas', required: true },
    { key: 'jefe_id', label: 'Jefe directo', type: 'reference', reference: 'employees' },
    { key: 'estado', label: 'Estado', type: 'select', options: ['ACTIVO', 'INACTIVO', 'SUSPENDIDO'] },
    { key: 'entity_id', label: 'Entidad vinculada', type: 'text' }
  ],
  product: [
    { key: 'codigo', label: 'Código', type: 'text', required: true },
    { key: 'descripcion', label: 'Descripción', type: 'text', required: true },
    { key: 'tipo', label: 'Tipo', type: 'select', options: ['PRODUCTO', 'MATERIA_PRIMA', 'INSUMO', 'SERVICIO'], required: true },
    { key: 'unidad_medida', label: 'Unidad de medida', type: 'text', required: true },
    { key: 'critico_calidad', label: 'Crítico para calidad', type: 'checkbox' },
    { key: 'activo', label: 'Activo', type: 'checkbox' }
  ],
  lot: [
    { key: 'numero_lote', label: 'Número de lote', type: 'text', required: true },
    { key: 'producto_id', label: 'Producto', type: 'reference', reference: 'products', required: true },
    { key: 'fecha_fabricacion', label: 'Fecha de fabricación', type: 'date', required: true },
    { key: 'fecha_caducidad', label: 'Fecha de caducidad', type: 'date' },
    { key: 'proveedor_id', label: 'Proveedor', type: 'text' },
    { key: 'orden_produccion_id', label: 'Orden de producción', type: 'text' }
  ]
};

function referenceOptions(items, selected) {
  const rows = Array.isArray(items) ? items : [];
  return `<option value="">Seleccione...</option>` + rows.map(item => {
    const value = item.value !== undefined ? item.value : (item.id || item.area_id || item.empleado_id || item.producto_id || item.lote_id || '');
    const text = item.label || item.nombre || item.descripcion || item.numero_nomina || item.numero_lote || value;
    return `<option value="${escapeHtml(value)}" ${String(value) === String(selected) ? 'selected' : ''}>${escapeHtml(text)}</option>`;
  }).join('');
}

function fieldMarkup(field, values, options) {
  const id = `qm-${field.key}`;
  const error = `<span id="qm-error-${field.key}" class="error"></span>`;
  const value = values[field.key];
  let control;
  if (field.type === 'checkbox') {
    const checked = value === true || value === 'true' || value === '1' || (value === undefined && field.key === 'activo');
    control = `<input type="checkbox" id="${id}" ${checked ? 'checked' : ''}>`;
  } else if (field.type === 'select') {
    control = `<select id="${id}"><option value="">Seleccione...</option>${field.options.map(option => `<option value="${escapeHtml(option)}" ${String(value) === option ? 'selected' : ''}>${escapeHtml(option)}</option>`).join('')}</select>`;
  } else if (field.type === 'reference') {
    control = `<select id="${id}">${referenceOptions(options[field.reference], value)}</select>`;
  } else {
    control = `<input type="${field.type}" id="${id}" value="${escapeHtml(value === undefined || value === null ? '' : value)}">`;
  }
  return `<div class="field"><label for="${id}">${escapeHtml(field.label)}${field.required ? ' *' : ''}</label>${control}${error}</div>`;
}

export function renderQualityEntityForm(type, values = {}, options = {}) {
  const fields = MASTER_SCHEMAS[type] || [];
  return fields.map(field => fieldMarkup(field, values, options)).join('');
}

export function readQualityEntityForm(type, root = document) {
  const fields = MASTER_SCHEMAS[type] || [];
  const data = {};
  for (const field of fields) {
    const input = root.querySelector(`#qm-${field.key}`);
    if (!input) continue;
    data[field.key] = field.type === 'checkbox' ? input.checked : input.value;
  }
  return data;
}

export function showQualityEntityErrors(type, errors, root = document) {
  const fields = MASTER_SCHEMAS[type] || [];
  for (const field of fields) {
    const element = root.querySelector(`#qm-error-${field.key}`);
    if (element) element.textContent = errors[field.key] || '';
  }
}

export function clearQualityEntityErrors(type, root = document) {
  showQualityEntityErrors(type, {}, root);
}

export function populateQualityEntityForm(type, record, _options = {}, root = document) {
  const fields = MASTER_SCHEMAS[type] || [];
  for (const field of fields) {
    const input = root.querySelector(`#qm-${field.key}`);
    if (!input) continue;
    const value = record[field.key];
    if (field.type === 'checkbox') input.checked = value === true || value === 'true' || value === '1';
    else input.value = value === undefined || value === null ? '' : value;
  }
  clearQualityEntityErrors(type, root);
}
