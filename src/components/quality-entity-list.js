import { MASTER_LABELS } from '../master-data.js';

function displayName(record) {
  return record.nombre || record.descripcion || record.puesto || record.numero_lote || record.name || '';
}

function displayCode(record) {
  return record.codigo || record.numero_nomina || record.numero_lote || record.code || '';
}

function details(record) {
  if (record.modulo) return `Módulo: ${record.modulo}`;
  if (record.area_id) return `Área: ${record.area_id}`;
  if (record.tipo) return `Tipo: ${record.tipo} · Unidad: ${record.unidad_medida || ''}`;
  if (record.producto_id) return `Producto: ${record.producto_id} · Fabricación: ${record.fecha_fabricacion || ''}`;
  return '';
}

export function renderQualityEntityList(records, labels = {}) {
  if (!records.length) {
    return `<li class="empty-state">No hay datos maestros registrados.</li>`;
  }
  return records.map(record => {
    const type = record.masterType;
    const id = record[type === 'area' ? 'area_id' : type === 'employee' ? 'empleado_id' : type === 'product' ? 'producto_id' : 'lote_id'];
    return `<li class="entity-item" data-master-id="${id}" data-master-type="${type}">
      <strong>${displayName(record)}</strong> (${displayCode(record)})
      <span class="badge">${labels[type] || MASTER_LABELS[type] || type}</span>
      <span class="tracking-detail">${details(record)}</span>
      <span class="list-actions">
        <button type="button" class="btn-edit-master" data-id="${id}" data-type="${type}">Editar</button>
        <button type="button" class="btn-delete-master" data-id="${id}" data-type="${type}">Eliminar</button>
      </span>
    </li>`;
  }).join('');
}
