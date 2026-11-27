import { MASTER_TYPES, MASTER_LABELS } from '../master-data.js';
import { DOCUMENT_TYPES } from '../document-types.js';
import { escapeHtml } from './html.js';

export function statDefinitions(labels) {
  return [
    { id: 'stat-lots-active', label: labels.lots || 'Lotes activos' },
    { id: 'stat-products-total', label: labels.products || 'Productos registrados' },
    { id: 'stat-inspections-total', label: labels.inspections || 'Inspecciones realizadas' },
    { id: 'stat-ncr-capa-open', label: labels.ncrs || 'NCR/CAPA abiertas' }
  ];
}

export function renderStatCard(id, label, value) {
  return `<article class="stat-card"><span id="${escapeHtml(id)}" class="stat-value">${Number(value) || 0}</span><span class="stat-label">${escapeHtml(label)}</span></article>`;
}

export function renderQuickAction(id, label, icon = '') {
  const knownIcon = Object.values(ACTION_ICONS).includes(icon) ? icon : '';
  return `<button id="${escapeHtml(id)}" class="action-card" type="button">${knownIcon ? '<span class="action-icon" aria-hidden="true">' + knownIcon + '</span>' : ''}<span>${escapeHtml(label)}</span></button>`;
}

// Iconos SVG uniformes del sistema (trazo heredado, sin emojis).
const svgIcon = (paths) => `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths}</svg>`;

export const ACTION_ICONS = {
  lot: svgIcon('<path d="M12 3.2 20.5 8 12 12.8 3.5 8Z"/><path d="M3.5 8v8.2L12 20.8v-8"/><path d="M20.5 8v8.2L12 20.8"/>'),
  product: svgIcon('<path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82Z"/><circle cx="7" cy="7" r="1.25"/>'),
  area: svgIcon('<rect x="4" y="2.8" width="16" height="18.4" rx="1.6"/><path d="M8 7h2M14 7h2M8 11h2M14 11h2M8 15h2M14 15h2"/><path d="M10 21.2v-3.2h4v3.2"/>'),
  employee: svgIcon('<circle cx="12" cy="8" r="3.6"/><path d="M4.8 20.2a7.2 7.2 0 0 1 14.4 0"/>'),
  inspection: svgIcon('<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2.2" width="8" height="4" rx="1.4"/><path d="m9.5 13.6 1.9 1.9 3.6-3.6"/>'),
  ncr: svgIcon('<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/><path d="M12 9v4.5"/><path d="M12 17.2h.01"/>'),
  capa: svgIcon('<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>')
};

export function quickActionDefinitions(labels) {
  return [
    ['action-new-lot', `Nuevo ${labels.lot || 'Lote'}`, ACTION_ICONS.lot],
    ['action-new-product', `Nuevo ${labels.product || 'Producto'}`, ACTION_ICONS.product],
    ['action-new-area', `Nueva ${labels.area || 'Área auditada'}`, ACTION_ICONS.area],
    ['action-new-employee', `Nuevo ${labels.employee || 'Empleado'}`, ACTION_ICONS.employee],
    ['action-new-inspection', `Nueva ${labels.inspection || 'Inspección'}`, ACTION_ICONS.inspection],
    ['action-new-ncr', `Nueva ${labels.ncr || 'No Conformidad'}`, ACTION_ICONS.ncr],
    ['action-new-capa', `Nueva ${labels.capa || 'CAPA'}`, ACTION_ICONS.capa]
  ];
}

export function emptyState(message) {
  return `<li class="empty-state">${escapeHtml(message)}</li>`;
}

export function dashboardCounts(entities, documents) {
  const counts = { areas: 0, employees: 0, products: 0, lots: 0, activeLots: 0, inspections: 0, openFindings: 0 };
  const masterKeys = ['masterType', 'tipoItem', 'name', 'code', 'nombre', 'descripcion'];
  const byText = (record, keys, terms) => keys.some(key => terms.some(term => String(record[key] || '').toLowerCase().includes(term)));

  for (const entity of entities) {
    if (byText(entity, masterKeys, ['area', 'área'])) counts.areas += 1;
    if (byText(entity, masterKeys, ['emple'])) counts.employees += 1;
    if (byText(entity, masterKeys, ['product'])) counts.products += 1;
    if (byText(entity, masterKeys, ['lote', 'lot'])) {
      counts.lots += 1;
      const state = String(entity.activo === false ? 'inactivo' : entity.estado || entity.status || '').toLowerCase();
      if (!/(inactivo|inactive|cerrado)/.test(state)) counts.activeLots += 1;
    }
  }

  for (const doc of documents) {
    const kind = byText(doc, ['tipoDoc', 'type', 'docType', 'status'], ['inspe'])
      ? 'inspection'
      : (byText(doc, ['tipoDoc', 'type', 'docType', 'status'], ['ncr', 'capa', 'no conform']) ? 'finding' : null);
    if (kind === 'inspection') counts.inspections += 1;
    if (kind === 'finding' && !/(cerrad|rechazad|resuelt|closed|resolved|complet|done|cancel)/.test(String(doc.status || doc.estado || '').toLowerCase())) counts.openFindings += 1;
  }
  return counts;
}

export function masterTypeOptions(labels) {
  return MASTER_TYPES.map(type => `<option value="${escapeHtml(type)}">${escapeHtml(labels[type] || MASTER_LABELS[type])}</option>`).join('');
}

export function documentTypeOptions(labels) {
  return DOCUMENT_TYPES.map(type => `<option value="${escapeHtml(type)}">${escapeHtml(labels[type.toLowerCase()] || type)}</option>`).join('');
}
