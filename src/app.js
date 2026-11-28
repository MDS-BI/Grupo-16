import { seedDemo } from './demo-data.js';
import { getConfig, setActiveConfig, labelFor } from './module-config.js';
import { loadEntities, addEntity, updateEntity, deleteEntity, searchEntities, loadDocuments, addDocument, updateDocument, deleteDocument, searchDocuments } from './storage.js';
import { formatTargetDate, getTargetDateStatus, isPastTargetDate, STATUS_LABELS, filterByStatus, sortTrackingRecords } from './target-date.js';
import { MASTER_TYPES, MASTER_LABELS, loadMasters, addMaster, updateMaster, deleteMaster, findMaster, searchMasters } from './master-data.js';
import { DOCUMENT_TYPES } from './document-types.js';
import { can, PERMISSIONS, requiredPermission, loadUsers, assignRole, getActiveUser, setActiveUser, ensureDefaultUsers } from './permissions.js';
import { renderLogoMarkup, setActiveModule } from './components/shell.js';
import { masterTypeOptions, documentTypeOptions, dashboardCounts, statDefinitions, quickActionDefinitions } from './components/dashboard.js';
import { renderQualityEntityForm, readQualityEntityForm, showQualityEntityErrors, clearQualityEntityErrors } from './components/quality-entity-form.js';
import { renderQualityEntityList } from './components/quality-entity-list.js';
import { renderSearchResults, matchesDateRange, toCsv } from './components/search-bar.js';
import { renderTypedDocumentFields, readTypedDocumentFields, showTypedDocumentErrors, clearTypedDocumentErrors } from './components/document-form.js';
import { statusLabel } from './components/document-list.js';
import { renderRoleAdmin, renderPermissionCatalog, renderUserSwitcher, readRoleAssignments } from './components/role-admin.js';
import { isRemoteMode, getRemoteSession, getRemoteState, remoteMutation, remoteAssignRole, apiRequest, installRemoteSession } from './remote-session.js';
import { escapeHtml } from './components/html.js';
import { renderChartsMarkup } from './components/quality-charts.js';
import { renderRemoteDocumentFields, readRemoteDocumentFields, renderMeasurementFields, activeParameters, stateRecords } from './components/remote-document-fields.js';
import { renderRemoteUserList, readRemoteUserChanges, renderParameterList, renderOrdersTable, renderOrderDetail, renderRecordDetail, renderAuditList, orderStatuses } from './components/remote-views.js';
import { evaluateMeasurements, filterOrders, ordersCsv } from './quality-parameters.js';

function qs(id) { return document.getElementById(id); }

function currentActor() {
  if (isRemoteMode()) return getRemoteSession()?.user?.name || '';
  if (typeof document !== 'undefined' && document.body && document.body.dataset.userName) return document.body.dataset.userName;
  if (typeof window !== 'undefined' && window.currentUser && window.currentUser.name) return window.currentUser.name;
  return 'inspector';
}

function currentRole() {
  if (isRemoteMode()) return getRemoteSession()?.user?.role || '';
  return (typeof document !== 'undefined' && document.body && document.body.dataset.userRole) ||
    (typeof window !== 'undefined' && window.currentUserRole) || '';
}

function isReadOnlyUser() {
  const role = String(currentRole()).toLowerCase();
  return ['readonly', 'read-only', 'consulta', 'solo-consulta', 'viewer'].includes(role) || (isRemoteMode() && role === 'auditor');
}

function confirmAction(message) {
  const fn = globalThis.confirm || (typeof window !== 'undefined' ? window.confirm : null);
  return typeof fn === 'function' ? fn.call(globalThis, message) : true;
}

function showAuthMessage(message) {
  const box = qs('auth-message');
  if (!box) return;
  box.textContent = message;
  box.classList.remove('success');
  box.hidden = false;
}

function clearAuthMessage() {
  const box = qs('auth-message');
  if (box) {
    box.textContent = '';
    box.hidden = true;
    box.classList.remove('success');
  }
}

function showNotice(message) {
  const box = qs('auth-message');
  if (!box) return;
  box.textContent = message;
  box.classList.add('success');
  box.hidden = false;
}

function confirmation(record, action) {
  const folio = record?.folio ?? record?.number ?? record?.id ?? '';
  const lotId = record?.lote_id || record?.lotId || '';
  const lot = loadMasters('lot').find(row => row.lote_id === lotId)?.numero_lote || lotId;
  const result = record?.resultado || record?.status || '';
  return `${action} · folio: ${folio}${lot ? ` · lote: ${lot}` : ''}${result ? ` · resultado: ${result}` : ''}.`;
}

function authorize(action, message) {
  const permission = requiredPermission(action) || (PERMISSIONS.some(item => item.id === action) ? action : null);
  const actor = isRemoteMode() ? getRemoteSession()?.user : getActiveUser();
  if (!permission || can(actor, permission)) {
    clearAuthMessage();
    return true;
  }
  showAuthMessage(message || `Tu perfil no tiene permisos para esta acción: ${PERMISSIONS.find(p => p.id === permission)?.description.toLowerCase() || "operación restringida"}.`);
  return false;
}

function renderLogo(moduleName) {
  const logoMark = qs('logo-mark');
  if (!logoMark) return;
  logoMark.innerHTML = renderLogoMarkup(moduleName);
}

function applyRelabeling() {
  const config = getConfig();
  
  // Document title & brand
  document.title = config.moduleName;
  if (qs('brand-name')) qs('brand-name').textContent = config.moduleName;

  // Sidebar labels
  if (qs('nav-dashboard-label')) qs('nav-dashboard-label').textContent = 'Panel';
  if (qs('nav-entities-label')) qs('nav-entities-label').textContent = labelFor('entities');
  if (qs('nav-documents-label')) qs('nav-documents-label').textContent = labelFor('documents');
  if (qs('nav-search-label')) qs('nav-search-label').textContent = 'Búsqueda';
  if (qs('nav-users-label')) qs('nav-users-label').textContent = config.labels?.users || 'Usuarios y roles';
  if (qs('nav-parameters-label')) qs('nav-parameters-label').textContent = 'Parámetros';
  if (qs('nav-orders-label')) qs('nav-orders-label').textContent = 'Órdenes';
  if (qs('nav-audit-label')) qs('nav-audit-label').textContent = 'Auditoría';

  // Dashboard headings & actions
  if (qs('dashboard-heading')) qs('dashboard-heading').textContent = config.moduleName;
  const entityLabel = labelFor('entity');
  const isFeminine = (entityLabel === 'Entidad' || entityLabel.endsWith('a'));
  const newPrefix = isFeminine ? 'Nueva' : 'Nuevo';
  const article = isFeminine ? 'la' : 'el';
  const adjective = isFeminine ? 'seleccionada' : 'seleccionado';

  if (qs('action-new-entity-title')) qs('action-new-entity-title').textContent = `${newPrefix} ${entityLabel}`;
  if (qs('action-new-document-title')) qs('action-new-document-title').textContent = `Nuevo ${labelFor('document')}`;
  if (qs('action-open-entities-title')) qs('action-open-entities-title').textContent = labelFor('entities');
  if (qs('action-find-title')) qs('action-find-title').textContent = 'Buscar registros';

  // Stat labels
  if (qs('stat-entities-label')) qs('stat-entities-label').textContent = labelFor('entities');
  if (qs('stat-documents-label')) qs('stat-documents-label').textContent = labelFor('documents');

  // Entities view
  if (qs('entities-view-heading')) qs('entities-view-heading').textContent = labelFor('entities');
  if (qs('entity-form-heading')) qs('entity-form-heading').textContent = `Agregar / Editar ${entityLabel}`;
  if (qs('edit-entity-heading')) qs('edit-entity-heading').textContent = `Editar o eliminar ${article} ${entityLabel.toLowerCase()}`;
  if (qs('delete-entity')) qs('delete-entity').textContent = `Eliminar ${article} ${entityLabel.toLowerCase()} ${adjective}`;
  if (qs('submit-button')) qs('submit-button').textContent = qs('entity-id')?.value ? 'Actualizar' : 'Guardar';

  // Documents view
  if (qs('documents-view-heading')) qs('documents-view-heading').textContent = labelFor('documents');
  if (qs('document-form-heading')) qs('document-form-heading').textContent = `Agregar / Editar ${labelFor('document')}`;
  if (qs('edit-document-heading')) qs('edit-document-heading').textContent = `Editar o eliminar el ${labelFor('document').toLowerCase()}`;
  if (qs('delete-document')) qs('delete-document').textContent = `Eliminar el ${labelFor('document').toLowerCase()} seleccionado`;
  if (qs('document-submit-button')) qs('document-submit-button').textContent = qs('document-id')?.value ? 'Actualizar Documento' : 'Guardar Documento';

  // Search view
  if (qs('search-view-heading')) qs('search-view-heading').textContent = `Buscar ${labelFor('entities')}`;

  // Theme accent color
  if (config.theme && config.theme.accentColor) {
    document.documentElement.style.setProperty('--accent', config.theme.accentColor);
  }

  const kpiDefinitions = statDefinitions(config.labels || {});
  const kpiLabelIds = ['stat-lots-active-label', 'stat-products-total-label', 'stat-inspections-total-label', 'stat-ncr-capa-open-label'];
  kpiDefinitions.forEach((definition, index) => {
    const element = qs(kpiLabelIds[index]);
    if (element) element.textContent = definition.label;
  });

  quickActionDefinitions(config.labels || {}).forEach(([id, label]) => {
    const element = qs(`${id}-label`);
    if (element) element.textContent = label;
  });

  if (qs('users-view-heading')) qs('users-view-heading').textContent = config.labels?.users || 'Usuarios y roles';
  if (qs('quality-master-heading')) qs('quality-master-heading').textContent = config.labels?.areas || 'Datos maestros de calidad';

  const masterSelect = qs('master-type-select');
  if (masterSelect) masterSelect.innerHTML = masterTypeOptions(config.labels || {});
  const documentTypeSelect = qs('document-type-select');
  if (documentTypeSelect) documentTypeSelect.innerHTML = `<option value="">Seleccione...</option>` + documentTypeOptions(config.labels || {});

  renderLogo(config.moduleName);
  renderCustomFieldsForms();
  refreshRoleViews();
}

function refreshRoleViews() {
  const remote = isRemoteMode();
  if (!remote) ensureDefaultUsers();
  const users = remote ? (getRemoteState().users || []) : loadUsers();
  const active = remote ? getRemoteSession()?.user : getActiveUser();
  const canManage = Boolean(active && can(active, 'manage-permissions'));
  const navUsers = qs('nav-users');
  if (navUsers) navUsers.hidden = remote ? false : !canManage;
  for (const [id, visible] of [['nav-parameters', remote], ['nav-orders', remote], ['nav-audit', remote && can(active, 'audit')]]) {
    if (qs(id)) qs(id).hidden = !visible;
  }
  if (qs('action-demo')) qs('action-demo').hidden = !canManage;
  const visibility = {
    'action-new-lot':'create-master-data', 'action-new-product':'create-master-data',
    'action-new-area':'create-master-data', 'action-new-employee':'create-master-data',
    'action-new-entity':'create-master-data', 'action-new-document':'create-operational',
    'action-new-inspection':'register-inspections', 'action-new-ncr':'report-ncr',
    'action-new-capa':'create-operational', 'delete-entity':'delete-master-data',
    'delete-document':'delete-operational',
    'action-manage-catalogs':'read', 'action-global-search':'read'
  };
  for (const [id, permission] of Object.entries(visibility)) {
    if (qs(id)) qs(id).hidden = !can(active, permission);
  }
  for (const group of document.querySelectorAll('.quick-group')) {
    group.hidden = !Array.from(group.querySelectorAll('button')).some(button => !button.hidden);
  }
  const quickSection = qs('quick-actions-heading')?.closest('section');
  if (quickSection) quickSection.hidden = !Array.from(quickSection.querySelectorAll('.quick-group')).some(group => !group.hidden);
  const masterWrite = can(active, 'create-master-data') || can(active, 'edit-master-data');
  const docWrite = ['create-operational','edit-operational','register-inspections','report-ncr'].some(p => can(active,p));
  for (const id of ['entity-form','quality-master-form']) if (qs(id)) qs(id).hidden = !masterWrite;
  if (qs('document-form')) {
    qs('document-form').hidden = !docWrite;
    qs('document-form').closest('.form-container').hidden = !docWrite;
  }
  if (qs('parameter-form')) qs('parameter-form').closest('.form-container').hidden = !can(active, 'manage-records');
  if (qs('edit-entity')) qs('edit-entity').closest('.management-controls').hidden = !can(active,'edit-master-data');
  if (qs('edit-document')) qs('edit-document').closest('.management-controls').hidden = !can(active,'edit-operational');
  if (!remote && !canManage && qs('view-users') && !qs('view-users').hidden) showView('dashboard');
  renderQualityMasters();

  const switcher = qs('user-switcher');
  if (switcher) {
    switcher.replaceChildren();
    if (remote) {
      const identity = document.createElement('span');
      identity.id = 'remote-identity';
      identity.className = 'remote-identity';
      identity.textContent = `${active?.name || ''} — ${active?.role || ''}`;
      const logout = document.createElement('button');
      logout.type = 'button';
      logout.id = 'topbar-logout';
      logout.className = 'btn-secondary';
      logout.textContent = 'Cerrar sesión';
      logout.onclick = logoutRemote;
      switcher.append(identity, logout);
    } else {
      switcher.innerHTML = renderUserSwitcher(users, active.id);
      const select = qs('active-user');
      if (select) {
        select.onchange = () => {
          setActiveUser(select.value);
          clearAuthMessage();
          applyRelabeling();
          renderRoleViews();
        };
      }
    }
  }
  renderRoleViews();
}

function renderRoleViews() {
  const remote = isRemoteMode();
  const users = remote ? (getRemoteState().users || []) : loadUsers();
  const active = remote ? getRemoteSession()?.user : getActiveUser();
  const list = qs(remote ? 'remote-user-list' : 'role-admin-list');
  if (remote && qs('role-admin-list')) qs('role-admin-list').closest('.form-container').hidden = true;
  if (list) {
    list.innerHTML = remote && can(active, 'manage-permissions')
      ? renderRemoteUserList(users, ['Administrador', 'Gestor de Calidad', 'Inspector de Planta', 'Auditor'], active?.id)
      : remote ? '<p class="empty-state">Tu perfil no administra cuentas. Usa «Mi cuenta» para cambiar tu contraseña.</p>' : renderRoleAdmin(users, active.id);
  }
  const catalog = qs('permission-catalog');
  if (catalog) catalog.innerHTML = renderPermissionCatalog();
  const accountSection = qs('remote-account-section');
  if (accountSection) accountSection.hidden = !remote || !can(active, 'manage-permissions');
  const localRoles = qs('save-roles');
  if (localRoles) localRoles.hidden = remote;
  if (remote) {
    const roleSelect = qs('new-user-role');
    if (roleSelect && !roleSelect.options.length) {
      roleSelect.innerHTML = ['Administrador', 'Gestor de Calidad', 'Inspector de Planta', 'Auditor'].map(role => `<option value="${role}">${role}</option>`).join('');
    }
    if (qs('config-module-name')) qs('config-module-name').value = getConfig().moduleName;
  }
}

async function logoutRemote() {
  try {
    await apiRequest('/logout', { method: 'POST', body: {} });
  } catch {
    showNotice('La sesión terminó. Vuelve a entrar para continuar.');
  }
  window.dispatchEvent(new window.CustomEvent('quality:session-ended'));
}

function customFieldControl(field) {
  const id = `cf-${field.key}`;
  const required = field.required ? ' *' : '';
  let control;
  if (field.type === 'select' || field.type === 'enum') {
    control = `<select id="${escapeHtml(id)}" data-key="${escapeHtml(field.key)}"><option value="">--</option>${(field.options || []).map(option => `<option value="${escapeHtml(option)}">${escapeHtml(option)}</option>`).join('')}</select>`;
  } else if (field.type === 'boolean') {
    control = `<input type="checkbox" id="${escapeHtml(id)}" data-key="${escapeHtml(field.key)}">`;
  } else if (field.type === 'number' || field.type === 'decimal') {
    control = `<input type="number" step="${field.type === 'decimal' ? 'any' : '1'}" id="${escapeHtml(id)}" data-key="${escapeHtml(field.key)}">`;
  } else if (field.type === 'date') {
    control = `<input type="date" id="${escapeHtml(id)}" data-key="${escapeHtml(field.key)}">`;
  } else {
    control = `<input type="text" id="${escapeHtml(id)}" data-key="${escapeHtml(field.key)}">`;
  }
  return `<div class="field custom-field"><label for="${escapeHtml(id)}">${escapeHtml(field.label)}${required}</label>${control}<span id="error-cf-${escapeHtml(field.key)}" class="error"></span></div>`;
}

function renderCustomFieldsForms() {
  const config = getConfig();
  const entityContainer = qs('entity-custom-fields-container');
  const entityWrapper = qs('entity-custom-fields');
  if (entityContainer && entityWrapper) {
    const entityFields = (config.customFields || []).filter(f => f.target === 'entity');
    entityWrapper.hidden = entityFields.length === 0;
    entityContainer.innerHTML = entityFields.map(customFieldControl).join('');
  }

  const docContainer = qs('document-custom-fields-container');
  const docWrapper = qs('document-custom-fields');
  if (docContainer && docWrapper) {
    const docFields = (config.customFields || []).filter(f => f.target === 'document');
    docWrapper.hidden = docFields.length === 0;
    docContainer.innerHTML = docFields.map(customFieldControl).join('');
  }
}

function showView(viewId) {
  const current = document.querySelector('.view:not([hidden])')?.id;
  if (isRemoteMode() && current !== `view-${viewId}` && !leaveUnsavedForms()) return false;
  ['view-dashboard', 'view-entities', 'view-documents', 'view-search', 'view-users', 'view-parameters', 'view-orders', 'view-audit'].forEach(id => {
    const el = qs(id);
    if (el) el.hidden = (id !== `view-${viewId}`);
  });

  setActiveModule(viewId);
  if (isRemoteMode()) {
    renderLotContext();
    if (qs('lot-context')) qs('lot-context').hidden = !['entities', 'documents', 'orders'].includes(viewId);
    if (document.querySelector('.content-area')) document.querySelector('.content-area').scrollTop = 0;
  }

  if (viewId === 'dashboard') {
    updateDashboardStats();
  } else if (viewId === 'entities') {
    populateEntitySelect();
    renderEntitiesList();
    renderQualityMasters();
  } else if (viewId === 'documents') {
    populateDocumentEntitySelect();
    populateDocumentSelect();
    renderDocumentsList();
    renderTypedFields(currentDocumentType());
  } else if (viewId === 'search') {
    performSearch();
  } else if (viewId === 'users') {
    renderRoleViews();
  } else if (viewId === 'parameters') {
    renderParameterFormOptions();
    renderParametersList();
  } else if (viewId === 'orders') {
    renderOrderFilterOptions();
    renderOrdersView();
  } else if (viewId === 'audit') {
    renderAuditView();
  }
}

function leaveUnsavedForms() {
  const dirty = [...document.querySelectorAll('.view:not([hidden]) form[data-dirty="true"]')];
  if (!dirty.length) return true;
  if (!confirmAction('Hay cambios sin guardar. ¿Salir y continuar sin guardarlos?')) return false;
  dirty.forEach(form => delete form.dataset.dirty);
  return true;
}

function contextLotId() { return isRemoteMode() ? qs('context-lot')?.value || '' : ''; }

function renderLotContext() {
  const select = qs('context-lot');
  if (!select) return;
  const selected = select.value;
  const products = loadMasters('product');
  select.innerHTML = '<option value="">Todos los lotes</option>' + loadMasters('lot').map(lot => `<option value="${escapeHtml(lot.lote_id)}">${escapeHtml(lot.numero_lote)} — ${escapeHtml(products.find(product => product.producto_id === lot.producto_id)?.descripcion || '')}</option>`).join('');
  select.value = selected;
  if (qs('context-lot-summary')) qs('context-lot-summary').textContent = selected ? `Consultando ${select.selectedOptions[0]?.textContent || ''}. Datos simulados.` : 'Todos los lotes. Datos de una planta simulada.';
}

function normalizeText(...parts) {
  return parts.filter(Boolean).join(' ').toLowerCase();
}

function classifyMasterEntity(entity) {
  const text = normalizeText(entity.name, entity.code, entity.tipoItem, entity.category, entity.type, entity.masterType);
  if (text.includes('area') || text.includes('área')) return 'areas';
  if (text.includes('emple')) return 'employees';
  if (text.includes('product')) return 'products';
  if (text.includes('lote') || text.includes('lot')) return 'lots';
  return null;
}

function isActiveMaster(entity, type) {
  const status = normalizeText(entity.status, entity.estado);
  if (status.includes('inactivo') || status.includes('inactive') || status.includes('cerrado')) return false;
  if (type === 'lots') {
    if (status.includes('activo') || status.includes('active') || status.includes('abierto')) return true;
    return !status; // sin estado explícito: se considera activo
  }
  return true;
}

function safeCount(n) {
  const num = Number(n);
  return Number.isFinite(num) && num >= 0 ? num : 0;
}

function updateDashboardStats() {
  const entities = loadEntities();
  const docs = loadDocuments();

  // Compatibility counters used by existing tests/config
  if (qs('stat-entities')) qs('stat-entities').textContent = String(safeCount(entities.length));
  if (qs('stat-documents')) qs('stat-documents').textContent = String(safeCount(docs.length));

  const counts = { areas: 0, employees: 0, products: 0, lots: 0, activeLots: 0 };
  entities.forEach(e => {
    const key = classifyMasterEntity(e);
    if (key) {
      counts[key] += 1;
      if (isActiveMaster(e, key) && key === 'lots') counts.activeLots += 1;
    }
  });

  MASTER_TYPES.forEach(type => {
    const rows = loadMasters(type);
    if (type === 'area') counts.areas += rows.length;
    if (type === 'employee') counts.employees += rows.length;
    if (type === 'product') counts.products += rows.length;
    if (type === 'lot') {
      counts.lots += rows.length;
      counts.activeLots += rows.filter(record => record.activo !== false).length;
    }
  });

  const masterRows = MASTER_TYPES.flatMap(type => loadMasters(type).map(row => ({ ...row, masterType: type })));
  const kpis = dashboardCounts(masterRows, docs);

  if (qs('stat-areas')) qs('stat-areas').textContent = String(safeCount(counts.areas));
  if (qs('stat-employees')) qs('stat-employees').textContent = String(safeCount(counts.employees));
  if (qs('stat-products')) qs('stat-products').textContent = String(safeCount(counts.products));
  if (qs('stat-lots')) qs('stat-lots').textContent = String(safeCount(counts.lots));

  if (qs('stat-lots-active')) qs('stat-lots-active').textContent = String(safeCount(kpis.activeLots));
  if (qs('stat-products-total')) qs('stat-products-total').textContent = String(safeCount(kpis.products));
  if (qs('stat-inspections-total')) qs('stat-inspections-total').textContent = String(safeCount(kpis.inspections));
  if (qs('stat-ncr-capa-open')) qs('stat-ncr-capa-open').textContent = String(safeCount(kpis.openFindings));

  const empty = qs('dashboard-empty-state');
  if (empty) empty.hidden = !(entities.length === 0 && docs.length === 0 && MASTER_TYPES.every(type => loadMasters(type).length === 0));
  renderTrackingList();
  const charts = qs('quality-charts');
  if (charts) charts.innerHTML = renderChartsMarkup(docs, loadMasters('product'));
}

function populateEntitySelect() {
  const select = qs('edit-entity');
  if (!select) return;
  const entities = loadEntities();
  select.innerHTML = `<option value="">Seleccione ${escapeHtml(labelFor('entity').toLowerCase())}...</option>` +
    entities.map(e => `<option value="${escapeHtml(e.id || e.entity_id)}">${escapeHtml(e.name)} — ${escapeHtml(e.code)}</option>`).join('');
}

function populateDocumentEntitySelect() {
  const select = qs('document-entity');
  if (!select) return;
  const entities = loadEntities();
  select.innerHTML = `<option value="">Seleccione ${escapeHtml(labelFor('entity').toLowerCase())}...</option>` +
    entities.map(e => `<option value="${escapeHtml(e.entity_id || e.id)}">${escapeHtml(e.name)} — ${escapeHtml(e.code)}</option>`).join('');
}

function populateDocumentSelect() {
  const select = qs('edit-document');
  if (!select) return;
  const docs = loadDocuments();
  select.innerHTML = `<option value="">Seleccione documento...</option>` +
    docs.map(d => `<option value="${escapeHtml(d.id)}">Folio: ${escapeHtml(d.folio)}</option>`).join('');
}

function renderEntitiesList() {
  const list = qs('entities-list');
  if (!list) return;
  const entities = loadEntities();
  if (entities.length === 0) {
    list.innerHTML = `<li class="empty-state">No hay ${labelFor('entities').toLowerCase()} registrados.</li>`;
    return;
  }
  const config = getConfig();
  list.innerHTML = entities.map(e => {
    let customText = '';
    if (config.customFields) {
      for (const cf of config.customFields) {
        if (cf.target === 'entity' && e[cf.key] !== undefined) {
          customText += `, ${escapeHtml(cf.label)}: ${escapeHtml(e[cf.key])}`;
        }
      }
    }
    const status = getTargetDateStatus(e);
    return `<li class="tracking-item status-${status}"><strong>${escapeHtml(e.name)}</strong> (${escapeHtml(e.code)})<span class="tracking-status status-badge">${STATUS_LABELS[status]}</span>${e.targetDate ? ` - Fecha objetivo: ${escapeHtml(formatTargetDate(e.targetDate))}` : ''}${customText}</li>`;
  }).join('');
}

function renderDocumentsList() {
  const list = qs('documents-list');
  if (!list) return;
  const all = loadDocuments();
  const lot = contextLotId();
  const belongs = document => document?.lote_id === lot || (document?.ncr_id && all.find(parent => parent.id === document.ncr_id)?.lote_id === lot);
  const docs = lot ? all.filter(belongs) : all;
  if (docs.length === 0) {
    list.innerHTML = `<li class="empty-state">No hay registros operativos. Si tienes permiso, crea una inspección o una no conformidad.</li>`;
    return;
  }
  list.innerHTML = docs.map(d => {
    const status = getTargetDateStatus(d);
    return `<li class="tracking-item status-${status}"><div>${escapeHtml(d.tipoDoc || 'Registro')} · Folio: ${escapeHtml(d.folio)} - Estado: <span class="status-badge">${escapeHtml(statusLabel(d.status))}</span><span class="tracking-status status-badge">${STATUS_LABELS[status]}</span>${d.targetDate ? ` - Fecha objetivo: ${escapeHtml(formatTargetDate(d.targetDate))}` : ''}</div>${isRemoteMode() ? renderRecordDetail(d, getRemoteState()) : ''}</li>`;
  }).join('');
}

function collectSearchResults() {
  const input = qs('search-input');
  const term = input ? input.value : '';
  const typeFilter = qs('search-type-filter') ? qs('search-type-filter').value : '';
  const from = qs('search-date-from') ? qs('search-date-from').value : '';
  const to = qs('search-date-to') ? qs('search-date-to').value : '';
  const results = [];

  if (!typeFilter || MASTER_TYPES.includes(typeFilter)) {
    const masters = searchMasters(term);
    results.push(...masters.filter(row => !typeFilter || row.masterType === typeFilter));
  }
  if (!typeFilter || DOCUMENT_TYPES.includes(typeFilter)) {
    const docs = searchDocuments(term);
    results.push(...docs.filter(doc => !typeFilter || (doc.tipoDoc || doc.documentType) === typeFilter));
  }
  if (!typeFilter) {
    const docs = loadDocuments();
    for (const entity of searchEntities(term)) {
      const related = docs.filter(doc =>
        doc.entityId === entity.entity_id || doc.entityId === entity.id || doc.entity_id === entity.entity_id
      );
      results.push({ ...entity, relatedStatuses: related.map(doc => doc.status || doc.estado || '') });
    }
  }
  return results.filter(record => matchesDateRange(record, from, to));
}

function performSearch() {
  const list = qs('search-results-list');
  const empty = qs('search-empty');
  if (!list) return;

  const results = collectSearchResults();
  const config = getConfig();
  if (empty) empty.hidden = results.length > 0;
  list.innerHTML = results.length
    ? renderSearchResults(results, { ...(config.labels || {}), customFields: config.customFields || [] })
    : '';
}

function exportSearchCsv() {
  const results = collectSearchResults();
  const csv = toCsv(results);
  try {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL ? URL.createObjectURL(blob) : '';
    if (!url) return;
    const link = document.createElement('a');
    link.href = url;
    link.download = 'resultados-busqueda.csv';
    link.click();
    URL.revokeObjectURL(url);
  } catch {
    return;
  }
}

function collectTrackingRecords() {
  const entities = loadEntities().map(e => ({
    ...e,
    displayName: e.name || '',
    displayCode: e.code || '',
    source: 'entity'
  }));
  const docs = loadDocuments().map(d => ({
    ...d,
    displayName: `Folio ${d.folio}`,
    displayCode: d.series || '',
    source: 'document'
  }));
  return [...entities, ...docs];
}

function renderTrackingList() {
  const list = qs('tracking-list');
  if (!list) return;
  const sortBy = qs('tracking-sort') ? qs('tracking-sort').value : 'date';
  const statusFilter = qs('tracking-status') ? qs('tracking-status').value : 'todos';
  const records = filterByStatus(sortTrackingRecords(collectTrackingRecords(), sortBy), statusFilter);
  const empty = qs('tracking-empty');
  if (empty) empty.hidden = records.length > 0;

  list.innerHTML = records.map(record => {
    const status = getTargetDateStatus(record);
    const details = [
      record.targetDate ? `Fecha objetivo: ${formatTargetDate(record.targetDate)}` : 'Sin fecha objetivo',
      record.actionType ? `Acción: ${record.actionType}` : '',
      record.responsible ? `Responsable: ${record.responsible}` : ''
    ].filter(Boolean).join(' · ');
    return `<li class="tracking-item status-${status}"><strong>${escapeHtml(record.displayName)}</strong>${record.displayCode ? ` (${escapeHtml(record.displayCode)})` : ''}<span class="tracking-status status-badge">${STATUS_LABELS[status]}</span><span class="tracking-detail">${escapeHtml(details)}</span></li>`;
  }).join('');
}

function masterFormOptions() {
  return {
    areas: loadMasters('area').map(row => ({
      value: row.area_id,
      label: `${row.codigo || ''} — ${row.nombre || ''}`.trim()
    })),
    employees: loadMasters('employee').map(row => ({
      value: row.empleado_id,
      label: `${row.numero_nomina || ''} — ${row.puesto || ''}`.trim()
    })),
    products: loadMasters('product').map(row => ({
      value: row.producto_id,
      label: `${row.codigo || ''} — ${row.descripcion || ''}`.trim()
    }))
  };
}

function renderMasterForm(type, values = {}) {
  const container = qs('quality-master-fields');
  if (!container) return;
  container.innerHTML = renderQualityEntityForm(type, values, masterFormOptions());
  clearQualityEntityErrors(type);
}

function renderQualityMasters() {
  const list = qs('quality-entities-list');
  if (!list) return;
  const rows = MASTER_TYPES.flatMap(type => loadMasters(type).map(row => ({ ...row, masterType: type })));
  list.innerHTML = renderQualityEntityList(rows, getConfig().labels || {}, {edit:can(getActiveUser(),'edit-master-data'), remove:can(getActiveUser(),'delete-master-data')});
}

function currentMasterType() {
  const select = qs('master-type-select');
  return select && select.value ? select.value : MASTER_TYPES[0];
}

function resetMasterForm() {
  const form = qs('quality-master-form');
  if (form) form.reset();
  if (qs('quality-master-id')) qs('quality-master-id').value = '';
  renderMasterForm(currentMasterType());
  const save = qs('save-quality-master');
  if (save) save.textContent = 'Guardar dato maestro';
}

function hideRemoteLegacyFields() {
  if (!isRemoteMode()) return;
  ['series', 'currency', 'docPaymentTerms', 'subtotal', 'discount', 'taxAmount', 'totalAmount', 'creditLimit', 'paymentTerms', 'taxId', 'startDate', 'endDate', 'quantity', 'notes'].forEach(id => {
    const input = qs(id);
    const wrapper = input?.closest('.field');
    if (input) input.value = '';
    if (wrapper) wrapper.hidden = true;
  });
}

function renderTypedFields(type, values = {}) {
  const container = qs('document-typed-fields');
  if (!container) return;
  if (isRemoteMode() && type) {
    container.innerHTML = renderRemoteDocumentFields(type, values, getRemoteState(), getConfig());
    const form = qs('document-form');
    const typeField = qs('document-type-select')?.closest('.field');
    if (form && typeField) { form.insertBefore(typeField, form.firstChild); form.insertBefore(container, typeField.nextSibling); }
    hideRemoteLegacyFields();
    if (qs('document-custom-fields')) qs('document-custom-fields').hidden = true;
    for (const id of ['document-targetDate', 'document-responsible']) if (qs(id)?.closest('.field')) qs(id).closest('.field').hidden = type === 'CAPA';
    for (const id of ['status', 'document-entity']) if (qs(id)?.closest('.field')) qs(id).closest('.field').hidden = true;
    if (qs('folio')?.closest('.field')) qs('folio').closest('.field').hidden = Boolean(container.querySelector('#td-folio'));
    const productSelect = container.querySelector('#td-producto_id');
    const lotSelect = container.querySelector('#td-lote_id');
    const syncLots = () => {
      if (!lotSelect || !productSelect) return;
      const selected = lotSelect.value;
      const lots = loadMasters('lot').filter(lot => !productSelect.value || lot.producto_id === productSelect.value);
      lotSelect.innerHTML = '<option value="">Seleccione...</option>' + lots.map(lot => `<option value="${escapeHtml(lot.lote_id)}">${escapeHtml(lot.numero_lote)}</option>`).join('');
      lotSelect.value = lots.some(lot => lot.lote_id === selected) ? selected : '';
    };
    syncLots();
    if (values.parameterEvaluation) for (const select of [productSelect, lotSelect]) if (select) select.disabled = true;
    if (productSelect) {
      productSelect.onchange = () => {
        syncLots();
        const measurements = container.querySelector('#measurement-fields');
        if (!measurements) return;
        measurements.innerHTML = `<h3>Lecturas requeridas</h3>${renderMeasurementFields(activeParameters(getRemoteState(), productSelect.value), {})}`;
      };
    }
    clearTypedDocumentErrors(type);
    return;
  }
  container.innerHTML = renderTypedDocumentFields(type, values, getConfig());
  clearTypedDocumentErrors(type);
}

function currentDocumentType() {
  const select = qs('document-type-select');
  return select && select.value ? select.value : '';
}

function renderParameterFormOptions() {
  const select = qs('parameter-product');
  if (!select) return;
  const current = select.value;
  select.innerHTML = `<option value="">Seleccione...</option>` + loadMasters('product').map(product =>
    `<option value="${escapeHtml(product.producto_id)}">${escapeHtml(`${product.codigo || ''} — ${product.descripcion || ''}`.trim())}</option>`).join('');
  select.value = current;
}

function renderParametersList() {
  const container = qs('parameter-list');
  if (!container) return;
  const parameters = isRemoteMode() ? (getRemoteState().parameters || []) : [];
  const actor = isRemoteMode() ? getRemoteSession()?.user : getActiveUser();
  container.innerHTML = renderParameterList(parameters, loadMasters('product'), can(actor, 'manage-records'));
}

function resetParameterForm() {
  const form = qs('parameter-form');
  if (form) form.reset();
  if (qs('parameter-id')) qs('parameter-id').value = '';
  if (qs('parameter-active')) qs('parameter-active').checked = true;
  if (qs('parameter-form-heading')) qs('parameter-form-heading').textContent = 'Nuevo parámetro';
  showParameterErrors({});
}

function showParameterErrors(errors) {
  const keys = { name: 'name', productId: 'productId', unit: 'unit', min: 'min', max: 'max' };
  for (const [field, id] of Object.entries(keys)) {
    const element = qs(`parameter-error-${id}`);
    if (element) element.textContent = errors[field] || '';
  }
}

function currentOrderFilters() {
  return {
    query: qs('order-filter-query')?.value || '',
    productId: qs('order-filter-product')?.value || '',
    lotId: qs('order-filter-lot')?.value || '',
    status: qs('order-filter-status')?.value || '',
    from: qs('order-filter-from')?.value || '',
    to: qs('order-filter-to')?.value || ''
  };
}

function renderOrderFilterOptions() {
  const orders = isRemoteMode() ? (getRemoteState().orders || []) : [];
  const setOptions = (id, pairs) => {
    const select = qs(id);
    if (!select) return;
    const current = select.value;
    select.innerHTML = `<option value="">Todos</option>` + pairs.map(([value, label]) => `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`).join('');
    select.value = current;
  };
  setOptions('order-filter-product', [...new Map(orders.map(order => [order.productId, [order.productId, order.productName]])).values()]);
  setOptions('order-filter-lot', [...new Map(orders.map(order => [order.lotId, [order.lotId, `${order.lotNumber} — ${order.productName}`]])).values()]);
  const status = qs('order-filter-status');
  if (status) {
    const current = status.value;
    status.innerHTML = `<option value="">Todos</option>` + orderStatuses.map(value => `<option value="${value}">${value}</option>`).join('');
    status.value = current;
  }
}

function renderOrdersView() {
  const body = qs('order-table-body');
  if (!body) return;
  const state = isRemoteMode() ? getRemoteState() : {};
  const orders = filterOrders(filterOrders(state.orders || [], { lotId: contextLotId() }), currentOrderFilters());
  body.innerHTML = renderOrdersTable(orders);
  const count = qs('order-count');
  if (count) count.textContent = `${orders.length} ${orders.length === 1 ? 'coincidencia' : 'coincidencias'}`;
  const empty = qs('order-empty');
  if (empty) empty.hidden = orders.length > 0;
  const detail = qs('order-detail');
  if (detail && !detail.dataset.orderId) detail.innerHTML = renderOrderDetail(null);
}

function exportOrdersCsv() {
  const orders = filterOrders(filterOrders(getRemoteState().orders || [], { lotId: contextLotId() }), currentOrderFilters());
  const csv = ordersCsv(orders);
  try {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL ? URL.createObjectURL(blob) : '';
    if (!url) return;
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ordenes-calidad.csv';
    link.click();
    URL.revokeObjectURL(url);
  } catch {
    showAuthMessage('No se pudo preparar la exportación CSV.');
  }
}

function renderAuditView() {
  const container = qs('audit-list');
  if (!container) return;
  const rows = isRemoteMode() && can(getRemoteSession()?.user, 'audit') ? (getRemoteState().audit || []) : [];
  container.innerHTML = renderAuditList(rows);
}

function refreshRemoteViews() {
  document.body.dataset.userName = getRemoteSession()?.user?.name || '';
  document.body.dataset.userRole = getRemoteSession()?.user?.role || '';
  refreshRoleViews();
  updateDashboardStats();
  renderParametersList();
  renderOrderFilterOptions();
  renderOrdersView();
  renderAuditView();
  renderLotContext();
  const detail = qs('order-detail');
  if (detail?.dataset.orderId) {
    const order = (getRemoteState().orders || []).find(row => row.id === detail.dataset.orderId);
    detail.innerHTML = renderOrderDetail(order, stateRecords(getRemoteState(), 'quality-documents'), getRemoteState().audit || []);
  }
}

function measurementParameters(_type, values) {
  const state = getRemoteState();
  const stored = stateRecords(state, 'quality-documents').find(doc => doc.id === values.id);
  return stored?.parameterEvaluation?.results || activeParameters(state, values.producto_id);
}

function showMeasurementErrors(errors) {
  for (const [id, message] of Object.entries(errors || {})) {
    const element = qs(`measurement-error-${id}`);
    if (element) element.textContent = message;
  }
}

function validateRemoteInspection(data, values) {
  if (data.tipoDoc !== 'Inspección') return true;
  const parameters = measurementParameters('Inspección', values);
  try {
    evaluateMeasurements(parameters, data.measurements || {});
    return true;
  } catch (error) {
    showMeasurementErrors(error.fields);
    showAuthMessage(error.message);
    return false;
  }
}

export async function initApp(configResult) {
  if (configResult) {
    setActiveConfig(configResult.config || configResult);
  }
  applyRelabeling();
  if (isRemoteMode()) {
    renderLotContext();
    for (const form of document.querySelectorAll('form')) {
      for (const event of ['input', 'change']) form.addEventListener(event, () => { form.dataset.dirty = 'true'; });
      form.addEventListener('reset', () => { delete form.dataset.dirty; });
    }
    const context = qs('context-lot');
    if (context) context.onchange = () => {
      if (!leaveUnsavedForms()) { context.value = context.dataset.previous || ''; return; }
      context.dataset.previous = context.value;
      renderLotContext(); renderDocumentsList(); renderOrdersView();
    };
  }

  const toggle = qs('sidebar-toggle');
  if (toggle) toggle.onclick = () => {
    const collapsed = document.querySelector('.sidebar').classList.toggle('is-collapsed');
    toggle.setAttribute('aria-expanded', String(!collapsed));
    toggle.setAttribute('aria-label', collapsed ? 'Expandir menú' : 'Comprimir menú');
  };
  if (qs('action-demo')) qs('action-demo').onclick = async () => {
    if (!authorize('manage-users')) return;
    if (!confirmAction('¿Agregar registros ficticios de demostración? No se borrarán datos existentes.')) return;
    try {
      let added;
      if (isRemoteMode()) added = (await remoteMutation('seedDemo', [])).added;
      else { added = seedDemo(); updateDashboardStats(); }
      if (isRemoteMode()) refreshRemoteViews();
      showNotice(added ? `Se agregaron ${added} registros ficticios sin borrar los anteriores.` : 'Los datos ficticios ya estaban cargados; no se duplicaron.');
    } catch (error) { showAuthMessage(error.message); }
  };
  // Event listeners for navigation
  ['dashboard', 'entities', 'documents', 'search', 'parameters', 'orders', 'audit', 'users'].forEach(mod => {
    const btn = qs(`nav-${mod}`);
    if (btn) {
      btn.onclick = () => {
        if (mod === 'users' && !isRemoteMode() && !authorize('manage-users')) return;
        if (mod === 'parameters' && !isRemoteMode()) return;
        if (mod === 'orders' && !isRemoteMode()) return;
        if (mod === 'audit' && !authorize('audit')) return;
        showView(mod);
      };
    }
  });

  const masterTypeSelect = qs('master-type-select');
  if (masterTypeSelect) {
    masterTypeSelect.onchange = () => resetMasterForm();
  }
  renderMasterForm(currentMasterType());

  const qualityMasterForm = qs('quality-master-form');
  if (qualityMasterForm) {
    qualityMasterForm.onsubmit = async (e) => {
      e.preventDefault();
      const type = currentMasterType();
      const id = qs('quality-master-id').value;
      if (!authorize(id ? 'edit-master' : 'create-master')) return;
      const data = readQualityEntityForm(type);
      clearQualityEntityErrors(type);
      try {
        if (isRemoteMode()) {
          await remoteMutation(id ? 'updateMaster' : 'addMaster', id ? [type, id, data, currentActor()] : [type, data, currentActor()]);
          refreshRemoteViews();
        } else if (id) {
          updateMaster(type, id, data, currentActor());
        } else {
          addMaster(type, data, currentActor());
        }
        resetMasterForm();
        renderMasterForm(type);
        renderQualityMasters();
        updateDashboardStats();
        showNotice(id ? 'Dato maestro actualizado conservando sus referencias.' : 'Dato maestro guardado correctamente.');
      } catch (err) {
        try {
          const errors = err.fields || JSON.parse(err.message.replace(/^.*?:\s*/, ''));
          showQualityEntityErrors(type, errors);
        } catch {
          showAuthMessage(err.message);
        }
      }
    };
  }

  const qualityMasterList = qs('quality-entities-list');
  if (qualityMasterList) {
    qualityMasterList.onclick = async (e) => {
      const button = e.target.closest('button[data-id][data-type]');
      if (!button) return;
      const type = button.dataset.type;
      const id = button.dataset.id;
      if (button.classList.contains('btn-edit-master')) {
        if (!authorize('edit-master')) return;
        const record = findMaster(type, id);
        if (!record) return;
        if (masterTypeSelect) masterTypeSelect.value = type;
        renderMasterForm(type, record);
        qs('quality-master-id').value = id;
        const save = qs('save-quality-master');
        if (save) save.textContent = 'Actualizar dato maestro';
      } else if (button.classList.contains('btn-delete-master')) {
        if (!authorize('delete-master')) return;
        if (!confirmAction('¿Eliminar dato maestro?')) return;
        if (isRemoteMode()) {
          try {
            await remoteMutation('deleteMaster', [type, id, currentActor()]);
            refreshRemoteViews();
          } catch (error) {
            showAuthMessage(error.message);
            return;
          }
        } else {
          deleteMaster(type, id, currentActor());
        }
        resetMasterForm();
        renderQualityMasters();
        updateDashboardStats();
        showNotice('Dato maestro eliminado; la trazabilidad de los registros vinculados se conserva.');
      }
    };
  }

  const documentTypeSelect = qs('document-type-select');
  if (documentTypeSelect) {
    documentTypeSelect.onchange = () => {
      const type = documentTypeSelect.value;
      resetDocumentForm();
      documentTypeSelect.value = type;
      renderTypedFields(type);
    };
  }

  const searchTypeFilter = qs('search-type-filter');
  if (searchTypeFilter) {
    searchTypeFilter.innerHTML = `<option value="">Todos</option>` +
      MASTER_TYPES.map(type => `<option value="${type}">${MASTER_LABELS[type]}</option>`).join('') +
      DOCUMENT_TYPES.map(type => `<option value="${type}">${type}</option>`).join('');
    searchTypeFilter.onchange = () => performSearch();
  }
  ['search-date-from', 'search-date-to'].forEach(id => {
    const element = qs(id);
    if (element) element.onchange = () => performSearch();
  });
  if (qs('search-export-csv')) qs('search-export-csv').onclick = () => exportSearchCsv();
  if (qs('search-back-dashboard')) qs('search-back-dashboard').onclick = () => showView('dashboard');

  const saveRoles = qs('save-roles');
  if (saveRoles) {
    saveRoles.onclick = () => {
      if (isRemoteMode()) return;
      if (!authorize('manage-users')) return;
      for (const assignment of readRoleAssignments()) {
        assignRole(assignment.id, assignment.role);
      }
      renderRoleViews();
      showAuthMessage('Asignaciones guardadas correctamente.');
    };
  }

  const entityForm = qs('entity-form');
  const editEntitySelect = qs('edit-entity');
  const documentForm = qs('document-form');
  const editDocumentSelect = qs('edit-document');

  function resetEntityForm() {
    if (entityForm) entityForm.reset();
    if (qs('entity-id')) qs('entity-id').value = '';
    if (qs('submit-button')) qs('submit-button').textContent = 'Guardar';
    ['name','code','email','creditLimit','targetDate','actionType','responsible'].forEach(k => { const el = qs(`error-${k}`); if (el) el.textContent = ''; });
    const config = getConfig();
    (config.customFields || []).filter(f => f.target === 'entity').forEach(cf => { const el = qs(`error-cf-${cf.key}`); if (el) el.textContent = ''; });
  }

  function resetDocumentForm() {
    if (documentForm) documentForm.reset();
    if (qs('document-id')) qs('document-id').value = '';
    if (qs('document-submit-button')) qs('document-submit-button').textContent = 'Guardar Documento';
    ['document-entity','folio','startDate','endDate','quantity','subtotal','discount','taxAmount','totalAmount','status'].forEach(k => { const el = qs(`error-${k}`); if (el) el.textContent = ''; });
    const config = getConfig();
    (config.customFields || []).filter(f => f.target === 'document').forEach(cf => { const el = qs(`error-cf-${cf.key}`); if (el) el.textContent = ''; });
    const typed = qs('document-typed-fields');
    if (typed) typed.innerHTML = '';
    syncStatusControl();
  }

  function syncStatusControl(currentStatus) {
    const input = qs('status');
    if (!input) return;
    const config = getConfig();
    const lifecycle = config.statusLifecycle;
    const existingSelect = qs('status-select');
    if (lifecycle) {
      let select = existingSelect;
      if (!select || select.tagName !== 'SELECT' || select.id !== 'status') {
        // replace input with select
        const sel = document.createElement('select');
        sel.id = 'status';
        sel.className = input.className;
        input.replaceWith(sel);
        select = sel;
      }
      let allowed = lifecycle.statuses;
      if (currentStatus && lifecycle.transitions) {
        const next = lifecycle.transitions[currentStatus] || [];
        allowed = [currentStatus, ...next.filter(s => s !== currentStatus)];
      }
      const placeholder = currentStatus ? '' : `<option value=""></option>`;
      select.innerHTML = placeholder + allowed.map(s => `<option value="${s}" ${s===currentStatus?'selected':''}>${s}</option>`).join('');
    } else {
      if (input.tagName !== 'INPUT') {
        const inp = document.createElement('input');
        inp.type = 'text';
        inp.id = 'status';
        inp.className = input.className;
        inp.value = currentStatus || '';
        input.replaceWith(inp);
      }
    }
  }

  function openMasterForm(masterType) {
    showView('entities');
    const select = qs('master-type-select');
    if (select) {
      select.value = masterType;
      if (select.onchange) select.onchange();
    }
    resetMasterForm();
    const firstField = document.querySelector('#quality-master-fields input, #quality-master-fields select');
    if (firstField) firstField.focus();
  }

  function openOperationalForm(docType) {
    showView('documents');
    resetDocumentForm();
    const select = qs('document-type-select');
    if (select) {
      select.value = docType;
      renderTypedFields(docType);
    }
    const folio = qs('folio') || qs('document-entity');
    if (folio) folio.focus();
  }

  // Dashboard quick actions (new HU3)
  const masterActions = [
    ['action-new-lot', 'lot'],
    ['action-new-product', 'product'],
    ['action-new-area', 'area'],
    ['action-new-employee', 'employee']
  ];
  masterActions.forEach(([id, type]) => {
    const btn = qs(id);
    if (btn) btn.onclick = () => { if (authorize('create-master')) openMasterForm(type); };
  });

  const opActions = [
    ['action-new-inspection', 'Inspección'],
    ['action-new-ncr', 'NCR'],
    ['action-new-capa', 'CAPA']
  ];
  opActions.forEach(([id, type]) => {
    const btn = qs(id);
    btn && (btn.onclick = () => { const permission = type === 'Inspección' ? 'register-inspections' : type === 'NCR' ? 'report-ncr' : 'create-operational'; if (can(getActiveUser(), permission)) openOperationalForm(type); });
  });

  if (qs('action-manage-catalogs')) qs('action-manage-catalogs').onclick = () => { if (can(getActiveUser(), 'read')) showView('entities'); };
  if (qs('action-global-search')) qs('action-global-search').onclick = () => { if (!can(getActiveUser(), 'read')) return; showView('search'); qs('search-input')?.focus(); };

  // Compatibility actions for existing tests
  if (qs('action-new-entity')) qs('action-new-entity').onclick = () => { showView('entities'); resetEntityForm(); qs('name')?.focus(); };
  if (qs('action-new-document')) qs('action-new-document').onclick = () => { showView('documents'); resetDocumentForm(); qs('document-entity')?.focus(); };
  if (qs('action-open-entities')) qs('action-open-entities').onclick = () => showView('entities');
  if (qs('action-find')) qs('action-find').onclick = () => { showView('search'); qs('search-input')?.focus(); };

  // Entity form submission
  if (entityForm) {
    entityForm.onsubmit = async (e) => {
      e.preventDefault();
      const id = qs('entity-id').value;
      const data = {
        name: qs('name').value,
        code: qs('code').value,
        taxId: qs('taxId') ? qs('taxId').value : '',
        email: qs('email') ? qs('email').value : '',
        phone: qs('phone') ? qs('phone').value : '',
        address: qs('address') ? qs('address').value : '',
        creditLimit: qs('creditLimit') ? qs('creditLimit').value : '',
        paymentTerms: qs('paymentTerms') ? qs('paymentTerms').value : '',
        targetDate: qs('targetDate') ? qs('targetDate').value : '',
        actionType: qs('actionType') ? qs('actionType').value : '',
        responsible: qs('responsible') ? qs('responsible').value : '',
        completed: qs('completed') ? qs('completed').checked : false
      };

      if (isReadOnlyUser()) {
        if (qs('error-name')) qs('error-name').textContent = 'El perfil de solo consulta no puede editar registros';
        return;
      }
      if (!authorize(id ? 'edit-master' : 'create-master')) return;
      if (isPastTargetDate(data.targetDate) && !confirmAction('La fecha objetivo es anterior a hoy. ¿Desea guardarla de todas formas?')) return;

      const config = getConfig();
      (config.customFields || []).filter(f => f.target === 'entity').forEach(cf => {
        const input = qs(`cf-${cf.key}`);
        if (input) data[cf.key] = input.type === 'checkbox' ? input.checked : input.value;
      });

      // Clear errors
      ['name','code','email','creditLimit','targetDate','actionType','responsible'].forEach(k => { const errEl = qs(`error-${k}`); if (errEl) errEl.textContent = ''; });
      (config.customFields || []).filter(f => f.target === 'entity').forEach(cf => { const errEl = qs(`error-cf-${cf.key}`); if (errEl) errEl.textContent = ''; });

      try {
        if (isRemoteMode()) {
          await remoteMutation(id ? 'updateEntity' : 'addEntity', id ? [id, data] : [data]);
          refreshRemoteViews();
        } else if (id) {
          updateEntity(id, data, currentActor());
        } else {
          addEntity(data, currentActor());
        }
        resetEntityForm();
        populateEntitySelect();
        if (id && qs('edit-entity')) qs('edit-entity').value = id;
        renderEntitiesList();
        updateDashboardStats();
        showNotice(id ? 'Registro maestro actualizado.' : 'Registro maestro guardado con folio y fecha de creación.');
      } catch (err) {
        try {
          const errObj = err.fields || JSON.parse(err.message.replace(/^.*?:\s*/, ''));
          for (const [k, msg] of Object.entries(errObj)) {
            const errEl = qs(`error-${k}`) || qs(`error-cf-${k}`);
            if (errEl) errEl.textContent = msg;
          }
        } catch {
          if (qs('error-name')) qs('error-name').textContent = err.message;
        }
      }
    };
  }

  // Edit entity select change
  if (editEntitySelect) {
    editEntitySelect.onchange = () => {
      const selectedId = editEntitySelect.value;
      if (!selectedId) { resetEntityForm(); return; }
      const entities = loadEntities();
      const entity = entities.find(e => e.id === selectedId || e.entity_id === selectedId);
      if (!entity) return;

      if (qs('entity-id')) qs('entity-id').value = entity.id || entity.entity_id;
      if (qs('name')) qs('name').value = entity.name || '';
      if (qs('code')) qs('code').value = entity.code || '';
      if (qs('taxId')) qs('taxId').value = entity.taxId || '';
      if (qs('email')) qs('email').value = entity.email || '';
      if (qs('phone')) qs('phone').value = entity.phone || '';
      if (qs('address')) qs('address').value = entity.address || '';
      if (qs('creditLimit')) qs('creditLimit').value = entity.creditLimit !== undefined ? entity.creditLimit : '';
      if (qs('paymentTerms')) qs('paymentTerms').value = entity.paymentTerms || '';
      if (qs('targetDate')) qs('targetDate').value = entity.targetDate || '';
      if (qs('actionType')) qs('actionType').value = entity.actionType || '';
      if (qs('responsible')) qs('responsible').value = entity.responsible || '';
      if (qs('completed')) qs('completed').checked = entity.completed === true || entity.completed === 'true';
      if (qs('submit-button')) qs('submit-button').textContent = 'Actualizar';

      const config = getConfig();
      (config.customFields || []).filter(f => f.target === 'entity').forEach(cf => {
        const input = qs(`cf-${cf.key}`);
        if (!input) return;
        if (input.type === 'checkbox') {
          input.checked = entity[cf.key] === true || entity[cf.key] === 'true';
        } else {
          input.value = entity[cf.key] !== undefined ? entity[cf.key] : '';
        }
      });
    };
  }

  // Delete entity button
  const deleteEntityBtn = qs('delete-entity');
  if (deleteEntityBtn) {
    deleteEntityBtn.onclick = async () => {
      const selectedId = editEntitySelect ? editEntitySelect.value : '';
      if (!selectedId) return;
      if (!authorize('delete-master')) return;
      if (!confirmAction('¿Eliminar entidad?')) return;
      if (isRemoteMode()) {
        try { await remoteMutation('deleteEntity', [selectedId]); refreshRemoteViews(); }
        catch (error) { showAuthMessage(error.message); return; }
      } else {
        deleteEntity(selectedId);
      }
      resetEntityForm();
      populateEntitySelect();
      renderEntitiesList();
      populateDocumentEntitySelect();
      populateDocumentSelect();
      renderDocumentsList();
      updateDashboardStats();
    };
  }

  // Document form submission
  if (documentForm) {
    documentForm.onsubmit = async (e) => {
      e.preventDefault();
      const id = qs('document-id').value;
      const docType = currentDocumentType();
      const data = {
        entityId: qs('document-entity') ? qs('document-entity').value : '',
        series: qs('series') ? qs('series').value : '',
        folio: qs('folio') ? qs('folio').value : '',
        startDate: qs('startDate') ? qs('startDate').value : '',
        endDate: qs('endDate') ? qs('endDate').value : '',
        quantity: qs('quantity') ? qs('quantity').value : '',
        subtotal: qs('subtotal') ? qs('subtotal').value : '',
        discount: qs('discount') ? qs('discount').value : '',
        taxAmount: qs('taxAmount') ? qs('taxAmount').value : '',
        totalAmount: qs('totalAmount') ? qs('totalAmount').value : '',
        currency: qs('currency') ? qs('currency').value : '',
        paymentTerms: qs('docPaymentTerms') ? qs('docPaymentTerms').value : '',
        notes: qs('notes') ? qs('notes').value : '',
        status: qs('status') ? qs('status').value : '',
        targetDate: qs('document-targetDate') ? qs('document-targetDate').value : '',
        actionType: qs('document-actionType') ? qs('document-actionType').value : '',
        responsible: qs('document-responsible') ? qs('document-responsible').value : '',
        completed: qs('document-completed') ? qs('document-completed').checked : false
      };

      if (isReadOnlyUser()) {
        if (qs('error-folio')) qs('error-folio').textContent = 'El perfil de solo consulta no puede editar registros';
        return;
      }
      if (!id && ['Inspección', 'NCR'].includes(docType)) {
        const permission = docType === 'Inspección' ? 'register-inspections' : 'report-ncr';
        if (!can(getActiveUser(), permission) && !authorize('create-document')) return;
      } else if (!authorize(id ? 'edit-document' : 'create-document')) return;
      if (isPastTargetDate(data.targetDate) && !confirmAction('La fecha objetivo es anterior a hoy. ¿Desea guardarla de todas formas?')) return;

      const config = getConfig();
      (config.customFields || []).filter(f => f.target === 'document').forEach(cf => {
        const input = qs(`cf-${cf.key}`);
        if (input) data[cf.key] = input.type === 'checkbox' ? input.checked : input.value;
      });

      if (docType) {
        data.tipoDoc = docType;
        const typedContainer = qs('document-typed-fields');
        const typed = isRemoteMode() && typedContainer ? readRemoteDocumentFields(typedContainer) : readTypedDocumentFields(docType);
        for (const [key, value] of Object.entries(typed)) {
          if (value !== '' || key === 'status' || key === 'measurements') data[key] = value;
        }
        if (isRemoteMode() && docType === 'Inspección' && !validateRemoteInspection(data, { ...data, id })) return;
      }

      ['document-entity','folio','startDate','endDate','quantity','subtotal','discount','taxAmount','totalAmount','status','document-targetDate','document-actionType','document-responsible'].forEach(k => { const el = qs(`error-${k}`); if (el) el.textContent = ''; });
      (config.customFields || []).filter(f => f.target === 'document').forEach(cf => { const el = qs(`error-cf-${cf.key}`); if (el) el.textContent = ''; });
      if (docType) clearTypedDocumentErrors(docType);

      try {
        let saved;
        if (isRemoteMode()) {
          saved = await remoteMutation(id ? 'updateDocument' : 'addDocument', id ? [id, data] : [data]);
          refreshRemoteViews();
        } else if (id) {
          saved = updateDocument(id, data, currentActor());
        } else {
          saved = addDocument(data, currentActor());
        }
        resetDocumentForm();
        populateDocumentSelect();
        if (id && qs('edit-document')) qs('edit-document').value = id;
        renderDocumentsList();
        updateDashboardStats();
        showNotice(confirmation(saved || data, id ? 'Registro actualizado' : 'Registro guardado'));
        if (saved?.parameterEvaluation && !saved.parameterEvaluation.passed) showAuthMessage(`${confirmation(saved, 'Inspección rechazada y guardada')} ${saved.parameterEvaluation.message}`);
      } catch (err) {
        if (isRemoteMode()) showAuthMessage(err.message);
        try {
          const errObj = typeof err.fields === 'object' && err.fields ? err.fields : JSON.parse(err.message.replace(/^.*?:\s*/, ''));
          for (const [k, msg] of Object.entries(errObj)) {
            const errEl = qs(`td-error-${k}`) || qs(`error-document-${k}`) || qs(`error-${k}`) || qs(`error-cf-${k}`) || qs(`measurement-error-${k}`) || (k === 'entityId' ? qs('error-document-entity') : null);
            if (errEl) errEl.textContent = msg;
          }
          if (docType) showTypedDocumentErrors(docType, errObj);
        } catch {
          if (qs('error-folio')) qs('error-folio').textContent = err.message;
        }
      }
    };
  }

  if (editDocumentSelect) {
    editDocumentSelect.onchange = () => {
      const selectedId = editDocumentSelect.value;
      if (!selectedId) { resetDocumentForm(); return; }
      const docs = loadDocuments();
      const doc = docs.find(d => d.id === selectedId);
      if (!doc) return;
      if (qs('document-id')) qs('document-id').value = doc.id;
      if (qs('document-entity')) qs('document-entity').value = doc.entityId || doc.entity_id || '';
      if (qs('series')) qs('series').value = doc.series || '';
      if (qs('folio')) qs('folio').value = doc.folio !== undefined ? doc.folio : '';
      if (qs('startDate')) qs('startDate').value = doc.startDate || '';
      if (qs('endDate')) qs('endDate').value = doc.endDate || '';
      if (qs('quantity')) qs('quantity').value = doc.quantity !== undefined ? doc.quantity : '';
      if (qs('subtotal')) qs('subtotal').value = doc.subtotal !== undefined ? doc.subtotal : '';
      if (qs('discount')) qs('discount').value = doc.discount !== undefined ? doc.discount : '';
      if (qs('taxAmount')) qs('taxAmount').value = doc.taxAmount !== undefined ? doc.taxAmount : '';
      if (qs('totalAmount')) qs('totalAmount').value = doc.totalAmount !== undefined ? doc.totalAmount : '';
      if (qs('currency')) qs('currency').value = doc.currency || '';
      if (qs('docPaymentTerms')) qs('docPaymentTerms').value = doc.paymentTerms || '';
      if (qs('notes')) qs('notes').value = doc.notes || '';
      if (qs('document-targetDate')) qs('document-targetDate').value = doc.targetDate || '';
      if (qs('document-actionType')) qs('document-actionType').value = doc.actionType || '';
      if (qs('document-responsible')) qs('document-responsible').value = doc.responsible || '';
      if (qs('document-completed')) qs('document-completed').checked = doc.completed === true || doc.completed === 'true';
      syncStatusControl(doc.status || '');
      const statusEl = qs('status');
      if (statusEl) statusEl.value = doc.status || '';
      if (qs('document-submit-button')) qs('document-submit-button').textContent = 'Actualizar Documento';

      const config = getConfig();
      (config.customFields || []).filter(f => f.target === 'document').forEach(cf => {
        const input = qs(`cf-${cf.key}`);
        if (!input) return;
        if (input.type === 'checkbox') {
          input.checked = doc[cf.key] === true || doc[cf.key] === 'true';
        } else {
          input.value = doc[cf.key] !== undefined ? doc[cf.key] : '';
        }
      });
      const type = doc.tipoDoc || doc.documentType || '';
      const typeSelect = qs('document-type-select');
      if (typeSelect) typeSelect.value = type;
      if (type) renderTypedFields(type, doc);
    };
  }

  const deleteDocumentBtn = qs('delete-document');
  if (deleteDocumentBtn) {
    deleteDocumentBtn.onclick = async () => {
      const selectedId = editDocumentSelect ? editDocumentSelect.value : '';
      if (!selectedId) return;
      if (!authorize('delete-document')) return;
      if (!confirmAction('¿Eliminar documento?')) return;
      if (isRemoteMode()) {
        try { await remoteMutation('deleteDocument', [selectedId]); refreshRemoteViews(); }
        catch (error) { showAuthMessage(error.message); return; }
      } else {
        deleteDocument(selectedId);
      }
      resetDocumentForm();
      populateDocumentSelect();
      renderDocumentsList();
      updateDashboardStats();
    };
  }

  // Search input event
  const searchInput = qs('search-input');
  if (searchInput) {
    searchInput.oninput = () => performSearch();
  }

  const trackingSort = qs('tracking-sort');
  if (trackingSort) trackingSort.onchange = () => renderTrackingList();
  const trackingStatus = qs('tracking-status');
  if (trackingStatus) trackingStatus.onchange = () => renderTrackingList();

  const parameterForm = qs('parameter-form');
  if (parameterForm) {
    parameterForm.onsubmit = async event => {
      event.preventDefault();
      if (!isRemoteMode() || !authorize('manage-records')) return;
      const data = {
        id: qs('parameter-id').value || undefined,
        name: qs('parameter-name').value,
        productId: qs('parameter-product').value,
        unit: qs('parameter-unit').value,
        min: qs('parameter-min').value,
        max: qs('parameter-max').value,
        active: qs('parameter-active').checked
      };
      try {
        const saved = await remoteMutation('saveParameter', [data]);
        renderParametersList();
        resetParameterForm();
        showNotice(`Parámetro «${saved.name}» guardado en su versión ${saved.version}.`);
      } catch (error) {
        showParameterErrors(error.fields || {});
        showAuthMessage(error.message);
      }
    };
  }
  if (qs('parameter-reset')) qs('parameter-reset').onclick = () => resetParameterForm();
  const parameterList = qs('parameter-list');
  if (parameterList) {
    parameterList.onclick = async event => {
      const button = event.target.closest('button[data-parameter-action]');
      if (!button || !isRemoteMode() || !authorize('manage-records')) return;
      const parameter = (getRemoteState().parameters || []).find(row => row.id === button.dataset.parameterId);
      if (!parameter) return;
      if (button.dataset.parameterAction === 'edit') {
        qs('parameter-id').value = parameter.id;
        qs('parameter-name').value = parameter.name;
        qs('parameter-product').value = parameter.productId;
        qs('parameter-unit').value = parameter.unit;
        qs('parameter-min').value = parameter.min;
        qs('parameter-max').value = parameter.max;
        qs('parameter-active').checked = parameter.active !== false;
        qs('parameter-form-heading').textContent = 'Editar parámetro';
      } else {
        try {
          await remoteMutation('saveParameter', [{ ...parameter, active: parameter.active === false }]);
          renderParametersList();
          showNotice(parameter.active === false ? 'Parámetro activado.' : 'Parámetro desactivado; las inspecciones anteriores conservan sus límites.');
        } catch (error) { showAuthMessage(error.message); }
      }
    };
  }

  ['order-filter-query', 'order-filter-product', 'order-filter-lot', 'order-filter-status', 'order-filter-from', 'order-filter-to'].forEach(id => {
    const element = qs(id);
    if (!element) return;
    element.oninput = () => renderOrdersView();
    element.onchange = () => renderOrdersView();
  });
  if (qs('order-filters-clear')) {
    qs('order-filters-clear').onclick = () => {
      ['order-filter-query', 'order-filter-product', 'order-filter-lot', 'order-filter-status', 'order-filter-from', 'order-filter-to'].forEach(id => { const element = qs(id); if (element) element.value = ''; });
      renderOrdersView();
      showNotice('Filtros limpiados: se muestran todas las órdenes.');
    };
  }
  if (qs('order-export-csv')) qs('order-export-csv').onclick = () => exportOrdersCsv();
  const orderTable = qs('order-table-body');
  if (orderTable) {
    orderTable.onclick = event => {
      const button = event.target.closest('button[data-order-id]');
      if (!button) return;
      const detail = qs('order-detail');
      if (!detail) return;
      detail.dataset.orderId = button.dataset.orderId;
      const order = (getRemoteState().orders || []).find(row => row.id === button.dataset.orderId);
      detail.innerHTML = renderOrderDetail(order, stateRecords(getRemoteState(), 'quality-documents'), getRemoteState().audit || []);
    };
  }

  const createUserForm = qs('create-user-form');
  if (createUserForm) {
    createUserForm.onsubmit = async event => {
      event.preventDefault();
      if (!isRemoteMode() || !authorize('manage-users')) return;
      const body = {
        username: qs('new-user-username').value,
        name: qs('new-user-name').value,
        password: qs('new-user-password').value,
        role: qs('new-user-role').value
      };
      try {
        await apiRequest('/users', { method: 'POST', body });
        createUserForm.reset();
        refreshRoleViews();
        showNotice(`Cuenta «${body.username}» creada con el perfil ${body.role}.`);
      } catch (error) { showAuthMessage(error.message); }
    };
  }
  const remoteUserList = qs('remote-user-list');
  if (remoteUserList) {
    remoteUserList.onclick = async event => {
      const button = event.target.closest('button[data-account-save]');
      if (!button || !authorize('manage-users')) return;
      const change = readRemoteUserChanges(remoteUserList).find(row => row.id === button.dataset.accountSave);
      const original = (getRemoteState().users || []).find(row => row.id === change?.id);
      if (!change || !original) return;
      try {
        if (change.role !== original.role) await remoteAssignRole(change.id, change.role);
        if (change.name !== original.name || change.active !== Boolean(original.active)) {
          await apiRequest(`/users/${encodeURIComponent(change.id)}`, { method: 'PATCH', body: { name: change.name, active: change.active } });
        }
        refreshRoleViews();
        showNotice(`Cuenta de ${change.name} actualizada.`);
      } catch (error) { showAuthMessage(error.message); }
    };
  }
  const configForm = qs('remote-config-form');
  if (configForm) {
    configForm.onsubmit = async event => {
      event.preventDefault();
      if (!isRemoteMode() || !authorize('manage-config')) return;
      try {
        const payload = await apiRequest('/config', { method: 'PUT', body: { moduleName: qs('config-module-name').value } });
        setActiveConfig(payload.config);
        applyRelabeling();
        showNotice('Nombre del módulo actualizado y conservado en el servidor.');
      } catch (error) { showAuthMessage(error.message); }
    };
  }
  const passwordForm = qs('password-form');
  if (passwordForm) {
    passwordForm.onsubmit = async event => {
      event.preventDefault();
      if (!isRemoteMode()) return;
      try {
        const payload = await apiRequest('/password', { method: 'POST', body: {
          currentPassword: qs('current-password').value,
          newPassword: qs('new-password').value
        } });
        installRemoteSession(payload);
        passwordForm.reset();
        refreshRemoteViews();
        showNotice('Contraseña actualizada. Las sesiones anteriores quedaron cerradas.');
      } catch (error) { showAuthMessage(error.message); }
    };
  }
  if (qs('logout-button')) qs('logout-button').onclick = () => logoutRemote();

  if (typeof window !== 'undefined') {
    window.addEventListener('quality:state', () => { if (isRemoteMode()) refreshRemoteViews(); });
    window.addEventListener('quality:alert', event => showAuthMessage(event.detail || 'La inspección fue rechazada; revisa la alerta con el valor, la unidad y el rango.'));
  }

  function applyReadOnlyMode() {
    if (!isReadOnlyUser()) return;
    const content = document.querySelector('.content-area');
    if (content && !qs('readonly-notice')) {
      const notice = document.createElement('div');
      notice.id = 'readonly-notice';
      notice.className = 'readonly-notice';
      notice.textContent = 'Perfil de solo consulta: puede ver la información pero no editarla.';
      content.prepend(notice);
    }
    document.querySelectorAll('#entity-form input, #entity-form select, #entity-form button, #document-form input, #document-form select, #document-form button, #quality-master-form input, #quality-master-form select, #quality-master-form button, #delete-entity, #delete-document, #save-roles, .quick-actions button, .dashboard-top-actions button, #action-new-entity, #action-new-document').forEach(el => {
      el.disabled = true;
    });
  }

  applyReadOnlyMode();
  syncStatusControl();
  showView('dashboard');
}

export async function boot() {
  await initApp(getConfig());
}
