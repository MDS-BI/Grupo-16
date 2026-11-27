import { DOMAIN_LABELS } from '../document-types.js';
import { escapeHtml } from './html.js';

export function statusLabel(status) {
  if (!status) return '';
  for (const group of Object.values(DOMAIN_LABELS)) {
    if (group[status]) return group[status];
  }
  return status;
}

function typedSummary(doc) {
  const values = [];
  if (doc.origen) values.push(`Origen: ${doc.origen}`);
  if (doc.gravedad) values.push(`Gravedad: ${doc.gravedad}`);
  if (doc.tipo && doc.tipo !== doc.tipoDoc) values.push(`Tipo: ${doc.tipo}`);
  if (doc.resultado) values.push(`Resultado: ${statusLabel(doc.resultado)}`);
  if (doc.clasificacion) values.push(`Clasificación: ${doc.clasificacion}`);
  return values.map(escapeHtml).join(' · ');
}

export function renderDocumentList(documents) {
  if (!documents.length) return `<li class="empty-state">No hay registros operativos.</li>`;
  return documents.map(doc => `<li class="tracking-item" data-document-id="${escapeHtml(doc.id)}">
    <strong>${escapeHtml(doc.tipoDoc || 'Documento')} ${escapeHtml(doc.folio || '')}</strong>
    <span class="status-badge">${escapeHtml(statusLabel(doc.status))}</span>
    <span class="tracking-detail">${typedSummary(doc)}</span>
    ${doc.targetDate ? `<span class="tracking-detail">Fecha objetivo: ${escapeHtml(doc.targetDate)}</span>` : ''}
  </li>`).join('');
}
