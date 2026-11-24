import { MASTER_LABELS } from '../master-data.js';

export function renderSearchResults(results, labels = {}) {
  if (!results.length) {
    return `<li class="empty-state">No se encontraron registros.</li>`;
  }
  return results.map(record => {
    const type = record.masterType || 'entity';
    const name = record.nombre || record.descripcion || record.puesto || record.numero_lote || record.name || '';
    const code = record.codigo || record.numero_nomina || record.numero_lote || record.code || '';
    const statuses = record.relatedStatuses || (record.status ? [record.status] : []);
    const badges = statuses.filter(Boolean).map(status => `<span class="status-badge">${status}</span>`).join(' ');
    const custom = (labels.customFields || [])
      .filter(field => record[field.key] !== undefined && record[field.key] !== '')
      .map(field => `${field.label}: ${record[field.key]}`)
      .join(', ');
    return `<li class="entity-item"><strong>${name}</strong> (${code}) <span class="badge">${labels[type] || MASTER_LABELS[type] || type}</span>${badges}${custom ? ` ${custom}` : ''}</li>`;
  }).join('');
}

export function renderSearchFilters(fields) {
  return Object.entries(fields).map(([id, label]) => `<label for="${id}">${label}</label>`).join('');
}

export function matchesDateRange(record, from, to) {
  const value = record.targetDate || record.fecha_fabricacion || record.fecha_deteccion || record.createdAt || '';
  const date = String(value).slice(0, 10);
  if (from && date < from) return false;
  if (to && date > to) return false;
  return true;
}

export function toCsv(rows) {
  const headers = ['tipo', 'nombre', 'codigo', 'estado', 'fecha'];
  const escape = value => `"${String(value === undefined || value === null ? '' : value).replace(/"/g, '""')}"`;
  const lines = rows.map(row => [
    row.masterType || row.tipoDoc || 'registro',
    row.nombre || row.descripcion || row.puesto || row.numero_lote || row.name || '',
    row.codigo || row.numero_nomina || row.numero_lote || row.code || row.folio || '',
    row.status || row.estado || '',
    row.targetDate || row.fecha_fabricacion || ''
  ].map(escape).join(','));
  return [headers.join(','), ...lines].join('\n');
}
