import { escapeHtml } from './html.js';
import { ORDER_STATUSES } from '../quality-parameters.js';
import { DOCUMENT_TYPE_META } from '../document-types.js';
import { stateRecords } from './remote-document-fields.js';

export function renderRecordDetail(record, state) {
  const references = {
    producto_id: ['quality-products', 'producto_id', 'descripcion'],
    lote_id: ['quality-lots', 'lote_id', 'numero_lote'],
    area_id: ['quality-areas', 'area_id', 'nombre'],
    area_afectada_id: ['quality-areas', 'area_id', 'nombre'],
    inspector_id: ['quality-employees', 'empleado_id', 'numero_nomina'],
    detectado_por: ['quality-employees', 'empleado_id', 'numero_nomina'],
    responsable_id: ['quality-employees', 'empleado_id', 'numero_nomina']
  };
  const fields = (DOCUMENT_TYPE_META[record.tipoDoc]?.fields || []).filter(field => record[field.key] !== undefined && record[field.key] !== '');
  const rows = fields.map(field => {
    const ref = references[field.key];
    let value = record[field.key];
    if (ref) value = stateRecords(state, ref[0]).find(row => row[ref[1]] === value)?.[ref[2]] || 'Referencia no disponible';
    if (field.key === 'ncr_id') value = `Folio ${stateRecords(state, 'quality-documents').find(row => row.id === value)?.folio || 'sin referencia'}`;
    return `<dt>${escapeHtml(field.label)}</dt><dd>${escapeHtml(value)}</dd>`;
  }).join('');
  const extra = [['actionDescription', 'Acción acordada'], ['evidence', 'Evidencia'], ['responsible', 'Responsable de seguimiento']].filter(([key]) => record[key]).map(([key, label]) => `<dt>${label}</dt><dd>${escapeHtml(record[key])}</dd>`).join('');
  const results = record.parameterEvaluation?.results || [];
  const readings = results.length ? `<div class="table-scroll"><table class="data-table"><caption>Mediciones guardadas con los límites aplicados</caption><thead><tr><th>Parámetro</th><th>Lectura</th><th>Unidad</th><th>Mínimo</th><th>Máximo</th><th>Versión</th><th>Evaluación</th></tr></thead><tbody>${results.map(reading => `<tr><td>${escapeHtml(reading.name)}</td><td>${escapeHtml(reading.value)}</td><td>${escapeHtml(reading.unit)}</td><td>${escapeHtml(reading.min)}</td><td>${escapeHtml(reading.max)}</td><td>${escapeHtml(reading.version)}</td><td>${reading.passed ? 'Dentro del rango' : 'Fuera del rango'}</td></tr>`).join('')}</tbody></table></div>` : record.tipoDoc === 'Inspección' ? '<p class="hint">Registro previo de demostración: no contiene lecturas de parámetros.</p>' : '';
  return `<details class="record-detail"><summary>Ver detalle del folio ${escapeHtml(record.folio)}</summary><dl>${rows}${extra}</dl>${readings}</details>`;
}

export function renderRemoteUserList(users = [], roles = [], currentUserId = '') {
  if (!users.length) return '<p class="empty-state">Todavía no hay cuentas creadas.</p>';
  return `<ul class="account-list">${users.map(user => `<li class="entity-item" data-user-id="${escapeHtml(user.id)}">
    <strong>${escapeHtml(user.name)}</strong> <span class="hint">${escapeHtml(user.username)}</span>
    <label for="account-role-${escapeHtml(user.id)}">Perfil</label>
    <select id="account-role-${escapeHtml(user.id)}" data-account-role="${escapeHtml(user.id)}">
      ${roles.map(role => `<option value="${escapeHtml(role)}" ${role === user.role ? 'selected' : ''}>${escapeHtml(role)}</option>`).join('')}
    </select>
    <label for="account-active-${escapeHtml(user.id)}">Activa</label>
    <input type="checkbox" id="account-active-${escapeHtml(user.id)}" data-account-active="${escapeHtml(user.id)}" ${user.active ? 'checked' : ''}>
    ${user.id === currentUserId ? '<span class="badge">Sesión activa</span>' : ''}
    <button type="button" class="btn-secondary" data-account-save="${escapeHtml(user.id)}">Guardar cuenta</button>
  </li>`).join('')}</ul>`;
}

export function readRemoteUserChanges(root) {
  const byId = selector => Object.fromEntries([...root.querySelectorAll(selector)].map(element => [element.dataset[selector.includes('role') ? 'accountRole' : 'accountActive'], element]));
  const roles = byId('[data-account-role]');
  const actives = byId('[data-account-active]');
  return [...root.querySelectorAll('[data-account-save]')].map(button => {
    const id = button.dataset.accountSave;
    const roleInput = roles[id];
    return {
      id,
      role: roleInput?.value || '',
      name: roleInput?.closest('li')?.querySelector('strong')?.textContent || '',
      active: actives[id]?.checked !== false
    };
  });
}

export function renderParameterList(parameters = [], products = [], canEdit = false) {
  if (!parameters.length) return '<p class="empty-state">No hay parámetros definidos. Defina uno para poder inspeccionar el producto.</p>';
  const productName = id => products.find(product => product.producto_id === id)?.descripcion || id || '';
  return `<table class="data-table"><caption>Parámetros registrados</caption><thead><tr><th>Nombre</th><th>Producto</th><th>Unidad</th><th>Mínimo</th><th>Máximo</th><th>Versión</th><th>Estado</th>${canEdit ? '<th>Acciones</th>' : ''}</tr></thead><tbody>
    ${parameters.map(parameter => `<tr><td>${escapeHtml(parameter.name)}</td><td>${escapeHtml(productName(parameter.productId))}</td><td>${escapeHtml(parameter.unit)}</td><td>${escapeHtml(parameter.min)}</td><td>${escapeHtml(parameter.max)}</td><td>${escapeHtml(parameter.version || 1)}</td><td>${parameter.active === false ? 'Inactivo' : 'Activo'}</td>${canEdit ? `<td><button type="button" class="btn-secondary" data-parameter-action="edit" data-parameter-id="${escapeHtml(parameter.id)}">Editar</button> <button type="button" class="btn-secondary" data-parameter-action="toggle" data-parameter-id="${escapeHtml(parameter.id)}">${parameter.active === false ? 'Activar' : 'Desactivar'}</button></td>` : ''}</tr>`).join('')}
  </tbody></table>`;
}

export function renderOrdersTable(orders = []) {
  if (!orders.length) return '';
  return orders.map(order => `<tr>
    <td>${escapeHtml(order.number)}</td><td>${escapeHtml(order.productName)}</td><td>${escapeHtml(order.lotNumber)}</td>
    <td>${escapeHtml(order.quantity)}</td><td>${escapeHtml(order.responsible)}</td><td>${escapeHtml(order.dueDate)}</td>
    <td>${escapeHtml(order.status)}</td><td><button type="button" class="btn-secondary" data-order-id="${escapeHtml(order.id)}">Ver detalle</button></td>
  </tr>`).join('');
}

export function renderOrderDetail(order, documents = [], audit = []) {
  if (!order) return '<p class="hint">Seleccione una orden para ver sus inspecciones y NCR/CAPA vinculadas.</p>';
  const related = documents.filter(doc => doc.orderId === order.id);
  const relatedIds = new Set(related.map(doc => doc.id));
  const ncrs = documents.filter(doc => doc.tipoDoc === 'NCR' && (doc.orderId === order.id || relatedIds.has(doc.inspectionId)));
  const ncrIds = new Set(ncrs.map(doc => doc.id));
  const findings = [...ncrs, ...documents.filter(doc => doc.tipoDoc === 'CAPA' && (doc.orderId === order.id || ncrIds.has(doc.ncr_id)))];
  const inspectionRows = related.length ? related.map(doc => `<li>Folio ${escapeHtml(doc.folio)} · ${escapeHtml(doc.tipoDoc)} · Resultado: ${escapeHtml(doc.resultado || doc.status || 'sin resultado')}</li>`).join('') : '<li class="empty-state">No hay inspecciones vinculadas a esta orden.</li>';
  const findingRows = findings.length ? findings.map(doc => `<li>${escapeHtml(doc.tipoDoc)} · Folio ${escapeHtml(doc.folio || '')} · ${escapeHtml(doc.estado || doc.status || '')}</li>`).join('') : '<li class="empty-state">No hay NCR/CAPA vinculadas.</li>';
  const history = audit.filter(entry => String(entry.target || '').includes(order.id)).slice(0, 10);
  const historyRows = history.length ? history.map(entry => `<li>${escapeHtml(entry.at)} · ${escapeHtml(entry.actor)} · ${escapeHtml(entry.action)}</li>`).join('') : '<li class="empty-state">Sin movimientos registrados para esta orden.</li>';
  return `<h3>Orden ${escapeHtml(order.number)}</h3>
    <p class="hint">Producto: ${escapeHtml(order.productName)} · Lote: ${escapeHtml(order.lotNumber)} · Estado: ${escapeHtml(order.status)}</p>
    <h4>Inspecciones</h4><ul>${inspectionRows}</ul><h4>NCR y CAPA</h4><ul>${findingRows}</ul><h4>Movimientos</h4><ul>${historyRows}</ul>`;
}

export function renderAuditList(rows = []) {
  if (!rows.length) return '<p class="empty-state">No hay movimientos registrados para consultar.</p>';
  return `<table class="data-table"><caption>Movimientos registrados</caption><thead><tr><th>Fecha</th><th>Autor</th><th>Acción</th><th>Registro</th></tr></thead><tbody>${rows.map(row => `<tr><td>${escapeHtml(row.at)}</td><td>${escapeHtml(row.actor)}</td><td>${escapeHtml(row.action)}</td><td>${escapeHtml(row.target)}</td></tr>`).join('')}</tbody></table>`;
}

export const orderStatuses = ORDER_STATUSES;
