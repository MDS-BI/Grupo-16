import { ENTITY_TYPES, DOCUMENT_TYPES, qualityFieldsFor } from '../quality-records.js';
import { loadEntities } from '../storage.js';

const qs = id => document.getElementById(id);
const optionNode = (label, value) => {
  const option = document.createElement('option');
  option.textContent = label;
  option.value = value;
  return option;
};

function renderField(container, field, value){
  const wrap = document.createElement('div');
  const label = document.createElement('label');
  label.htmlFor = `quality-${field.key}`;
  label.textContent = `${field.label}${field.required ? ' *' : ''}`;
  const input = document.createElement(field.options ? 'select' : 'input');
  input.id = label.htmlFor;
  input.name = field.key;
  input.required = !!field.required;
  if(field.options){
    input.add(optionNode('-- Selecciona --', ''));
    for(const option of field.options){
      const item = typeof option === 'string' ? { value: option, label: option } : option;
      input.add(optionNode(item.label, item.value));
    }
  }else{
    input.type = field.type || 'text';
    if(input.type === 'number'){ input.min = '0'; input.step = '1'; }
  }
  input.value = value ?? '';
  input.setAttribute('aria-describedby', `error-quality-${field.key}`);
  const error = document.createElement('div');
  error.id = `error-quality-${field.key}`;
  error.className = 'error';
  error.setAttribute('aria-live', 'polite');
  wrap.append(label, input, error);
  container.append(wrap);
}

export function renderEntityQuality(data = {}){
  const container = qs('entity-quality-fields');
  container.replaceChildren();
  renderField(container, { key: 'entityType', label: 'Tipo de dato maestro', options: Object.entries(ENTITY_TYPES).map(([value, label]) => ({value, label})) }, data.entityType);
  const relation = data.entityType === 'EMPLEADO' ? ['areaId','AREA','Área organizativa'] : data.entityType === 'LOTE' ? ['productId','PRODUCTO','Producto'] : null;
  if(relation){
    const [key, type, label] = relation;
    renderField(container, { key, label, required: true, options: loadEntities().filter(e => e.entityType === type).map(e => ({value: e.entity_id, label: `${e.name} · ${e.code}`})) }, data[key]);
  }
  qs('quality-entityType').addEventListener('change', () => renderEntityQuality({entityType: qs('quality-entityType').value}));
}

export function renderDocumentQuality(data = {}){
  const container = qs('document-quality-fields');
  container.replaceChildren();
  renderField(container, { key: 'recordType', label: 'Tipo de registro operativo', options: Object.entries(DOCUMENT_TYPES).map(([value, label]) => ({value, label})) }, data.recordType);
  for(const field of qualityFieldsFor(data.recordType)) renderField(container, field, data[field.key]);
  qs('quality-recordType').addEventListener('change', () => renderDocumentQuality({recordType: qs('quality-recordType').value}));
}

export function collectQualityFields(target){
  const container = qs(`${target}-quality-fields`);
  const values = Object.fromEntries([...container.querySelectorAll('input, select')].map(input => [input.name, input.value]));
  if(target === 'entity') return { areaId: '', productId: '', ...values };
  return values;
}

export function showQualityErrors(target, errors = {}){
  qs(`${target}-quality-fields`).querySelectorAll('input, select').forEach(input => {
    const error = errors[input.name] || '';
    qs(`error-quality-${input.name}`).textContent = error;
    input.setAttribute('aria-invalid', String(!!error));
  });
}
