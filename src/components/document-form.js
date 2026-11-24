import { DOCUMENT_TYPE_META, DOMAIN_LABELS, getTypeStatusOptions } from '../document-types.js';

function readable(value) {
  for (const group of Object.values(DOMAIN_LABELS)) {
    if (group[value]) return group[value];
  }
  return value;
}

function statusFieldFor(type) {
  const meta = DOCUMENT_TYPE_META[type];
  if (!meta) return null;
  return meta.fields.find(field => field.key === 'estado' || field.key === 'resultado') || null;
}

export function statusOptionsMarkup(type, currentStatus, config = {}) {
  const lifecycleByType = config.statusLifecycleByType || {};
  const field = statusFieldFor(type);
  let statuses;
  if (lifecycleByType[type] && currentStatus) {
    const transitions = lifecycleByType[type].transitions || {};
    statuses = [currentStatus, ...(transitions[currentStatus] || []).filter(status => status !== currentStatus)];
  } else if (!currentStatus && field && Array.isArray(field.options)) {
    statuses = [...field.options];
  } else {
    statuses = getTypeStatusOptions(type, currentStatus);
  }
  const unique = [...new Set(statuses)];
  return `<option value="">Seleccione...</option>` + unique.map(status =>
    `<option value="${status}" ${status === currentStatus ? 'selected' : ''}>${readable(status)}</option>`
  ).join('');
}

export function renderTypedDocumentFields(type, values = {}, config = {}) {
  const meta = DOCUMENT_TYPE_META[type];
  if (!meta) return '';
  const currentStatus = values.estado || values.resultado || values.status || '';
  const fields = meta.fields.filter(field => field.key !== 'estado' && field.key !== 'resultado');
  const controls = fields.map(field => {
    const id = `td-${field.key}`;
    const value = values[field.key] === undefined || values[field.key] === null ? '' : values[field.key];
    const error = `<span id="td-error-${field.key}" class="error"></span>`;
    let control;
    if (field.type === 'select') {
      control = `<select id="${id}"><option value="">Seleccione...</option>${(field.options || []).map(option =>
        `<option value="${option}" ${String(value) === option ? 'selected' : ''}>${readable(option)}</option>`
      ).join('')}</select>`;
    } else {
      control = `<input type="${field.type}" id="${id}" value="${value}">`;
    }
    return `<div class="field"><label for="${id}">${field.label}${field.required ? ' *' : ''}</label>${control}${error}</div>`;
  });
  controls.push(`<div class="field"><label for="td-status">${type === 'Inspección' ? 'Resultado' : 'Estado'}</label>
    <select id="td-status">${statusOptionsMarkup(type, currentStatus, config)}</select><span id="td-error-status" class="error"></span></div>`);
  return controls.join('');
}

export function readTypedDocumentFields(type, root = document) {
  const meta = DOCUMENT_TYPE_META[type];
  if (!meta) return {};
  const data = {};
  for (const field of meta.fields) {
    if (field.key === 'estado' || field.key === 'resultado') continue;
    const input = root.querySelector(`#td-${field.key}`);
    if (input) data[field.key] = input.value;
  }
  const status = root.querySelector('#td-status');
  if (status) {
    data.status = status.value;
    if (meta.fields.some(field => field.key === 'estado')) data.estado = status.value;
    if (meta.fields.some(field => field.key === 'resultado')) data.resultado = status.value;
  }
  return data;
}

export function showTypedDocumentErrors(type, errors, root = document) {
  const meta = DOCUMENT_TYPE_META[type];
  if (!meta) return;
  for (const field of meta.fields) {
    const element = root.querySelector(`#td-error-${field.key}`);
    if (element) element.textContent = errors[field.key] || '';
  }
  const statusError = root.querySelector('#td-error-status');
  if (statusError) statusError.textContent = errors.status || '';
}

export function clearTypedDocumentErrors(type, root = document) {
  showTypedDocumentErrors(type, {}, root);
}
