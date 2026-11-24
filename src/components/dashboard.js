import { MASTER_TYPES, MASTER_LABELS } from '../master-data.js';
import { DOCUMENT_TYPES } from '../document-types.js';

export function statDefinitions(labels) {
  return [
    { id: 'stat-lots-active', label: labels.lots || 'Lotes activos' },
    { id: 'stat-products-total', label: labels.products || 'Productos registrados' },
    { id: 'stat-inspections-total', label: labels.inspections || 'Inspecciones realizadas' },
    { id: 'stat-ncr-capa-open', label: labels.ncrs || 'NCR/CAPA abiertas' }
  ];
}

export function renderStatCard(id, label, value) {
  return `<article class="stat-card"><span id="${id}" class="stat-value">${Number(value) || 0}</span><span class="stat-label">${label}</span></article>`;
}

export function renderQuickAction(id, label, icon) {
  return `<button id="${id}" class="action-card" type="button"><span class="action-icon" aria-hidden="true">${icon}</span><span>${label}</span></button>`;
}

export function quickActionDefinitions(labels) {
  return [
    ['action-new-lot', `Nuevo ${labels.lot || 'Lote'}`, '📦'],
    ['action-new-product', `Nuevo ${labels.product || 'Producto'}`, '🏷️'],
    ['action-new-area', `Nueva ${labels.area || 'Área auditada'}`, '🏢'],
    ['action-new-employee', `Nuevo ${labels.employee || 'Empleado'}`, '👤'],
    ['action-new-inspection', `Nueva ${labels.inspection || 'Inspección'}`, '🔍'],
    ['action-new-ncr', `Nueva ${labels.ncr || 'No Conformidad'}`, '⚠️'],
    ['action-new-capa', `Nueva ${labels.capa || 'CAPA'}`, '🛠️']
  ];
}

export function emptyState(message) {
  return `<li class="empty-state">${message}</li>`;
}

export function dashboardCounts(entities, documents) {
  const counts = { areas: 0, employees: 0, products: 0, lots: 0, activeLots: 0, inspections: 0, openFindings: 0 };
  const byText = (record, keys, terms) => keys.some(key => terms.some(term => String(record[key] || '').toLowerCase().includes(term)));

  for (const entity of entities) {
    if (byText(entity, ['masterType', 'tipoItem', 'name', 'code'], ['area', 'área'])) counts.areas += 1;
    if (byText(entity, ['masterType', 'tipoItem', 'name', 'code'], ['emple'])) counts.employees += 1;
    if (byText(entity, ['masterType', 'tipoItem', 'name', 'code'], ['product'])) counts.products += 1;
    if (byText(entity, ['masterType', 'tipoItem', 'name', 'code'], ['lote', 'lot'])) {
      counts.lots += 1;
      const active = !/(inactivo|inactive|cerrado)/.test(String(entity.activo === false ? 'inactivo' : entity.estado || entity.status || '').toLowerCase());
      if (active) counts.activeLots += 1;
    }
  }

  for (const doc of documents) {
    const kind = byText(doc, ['tipoDoc', 'type', 'docType', 'status'], ['inspe'])
      ? 'inspection'
      : (byText(doc, ['tipoDoc', 'type', 'docType', 'status'], ['ncr', 'capa', 'no conform']) ? 'finding' : null);
    if (kind === 'inspection') counts.inspections += 1;
    if (kind === 'finding' && !/(cerrad|closed|resuelt)/.test(String(doc.status || '').toLowerCase())) counts.openFindings += 1;
  }
  return counts;
}

export function masterTypeOptions(labels) {
  return MASTER_TYPES.map(type => `<option value="${type}">${labels[type] || MASTER_LABELS[type]}</option>`).join('');
}

export function documentTypeOptions(labels) {
  return DOCUMENT_TYPES.map(type => `<option value="${type}">${labels[type.toLowerCase()] || type}</option>`).join('');
}
