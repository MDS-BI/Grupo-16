import { getConfig, setActiveConfig, labelFor } from './module-config.js';
import { loadEntities, addEntity, updateEntity, deleteEntity, searchEntities, loadDocuments, addDocument, updateDocument, deleteDocument, searchDocuments } from './storage.js';
import { formatTargetDate, getTargetDateStatus, isPastTargetDate, STATUS_LABELS, filterByStatus, sortTrackingRecords } from './target-date.js';
import { MASTER_TYPES, MASTER_LABELS, loadMasters, addMaster, updateMaster, deleteMaster, findMaster, searchMasters } from './master-data.js';
import { DOCUMENT_TYPES } from './document-types.js';
import { can, requiredPermission, loadUsers, assignRole, getActiveUser, setActiveUser, ensureDefaultUsers } from './permissions.js';
import { renderLogoMarkup, setActiveModule } from './components/shell.js';
import { masterTypeOptions, documentTypeOptions } from './components/dashboard.js';
import { renderQualityEntityForm, readQualityEntityForm, showQualityEntityErrors, clearQualityEntityErrors } from './components/quality-entity-form.js';
import { renderQualityEntityList } from './components/quality-entity-list.js';
import { renderSearchResults, matchesDateRange, toCsv } from './components/search-bar.js';
import { renderTypedDocumentFields, readTypedDocumentFields, showTypedDocumentErrors, clearTypedDocumentErrors } from './components/document-form.js';
import { statusLabel } from './components/document-list.js';
import { renderRoleAdmin, renderPermissionCatalog, renderUserSwitcher, readRoleAssignments } from './components/role-admin.js';

function qs(id) { return document.getElementById(id); }

function currentActor() {
  if (typeof document !== 'undefined' && document.body && document.body.dataset.userName) return document.body.dataset.userName;
  if (typeof window !== 'undefined' && window.currentUser && window.currentUser.name) return window.currentUser.name;
  return 'inspector';
}

function isReadOnlyUser() {
  const role = (typeof document !== 'undefined' && document.body && document.body.dataset.userRole) ||
    (typeof window !== 'undefined' && window.currentUserRole) || '';
  return ['readonly', 'read-only', 'consulta', 'solo-consulta', 'viewer'].includes(String(role).toLowerCase());
}

function confirmAction(message) {
  const fn = globalThis.confirm || (typeof window !== 'undefined' ? window.confirm : null);
  return typeof fn === 'function' ? fn.call(globalThis, message) : true;
}

function showAuthMessage(message) {
  const box = qs('auth-message');
  if (!box) return;
  box.textContent = message;
  box.hidden = false;
}

function clearAuthMessage() {
  const box = qs('auth-message');
  if (box) {
    box.textContent = '';
    box.hidden = true;
  }
}

function authorize(action, message) {
  const permission = requiredPermission(action);
  if (!permission || can(getActiveUser(), permission)) {
    clearAuthMessage();
    return true;
  }
  showAuthMessage(message || `Acción no autorizada. Se requiere el permiso: ${permission}.`);
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

  const kpiLabels = document.querySelectorAll('.kpi-grid .stat-label');
  const kpiTexts = [
    config.labels?.lots || 'Total de Lotes activos',
    config.labels?.products || 'Total de Productos registrados',
    config.labels?.inspections || 'Inspecciones de Calidad realizadas',
    config.labels?.ncrs || 'NCR y Acciones CAPA abiertas'
  ];
  kpiLabels.forEach((element, index) => {
    if (kpiTexts[index]) element.textContent = kpiTexts[index];
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
  ensureDefaultUsers();
  const users = loadUsers();
  const active = getActiveUser();
  const canManage = can(active, 'manage-permissions');
  const navUsers = qs('nav-users');
  if (navUsers) navUsers.hidden = !canManage;

  const switcher = qs('user-switcher');
  if (switcher) {
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
  renderRoleViews();
}

function renderRoleViews() {
  const users = loadUsers();
  const active = getActiveUser();
  const list = qs('role-admin-list');
  if (list) list.innerHTML = renderRoleAdmin(users, active.id);
  const catalog = qs('permission-catalog');
  if (catalog) catalog.innerHTML = renderPermissionCatalog();
}

function customFieldControl(field) {
  const id = `cf-${field.key}`;
  const required = field.required ? ' *' : '';
  let control;
  if (field.type === 'select' || field.type === 'enum') {
    control = `<select id="${id}" data-key="${field.key}"><option value="">--</option>${(field.options || []).map(option => `<option value="${option}">${option}</option>`).join('')}</select>`;
  } else if (field.type === 'boolean') {
    control = `<input type="checkbox" id="${id}" data-key="${field.key}">`;
  } else if (field.type === 'number' || field.type === 'decimal') {
    control = `<input type="number" step="${field.type === 'decimal' ? 'any' : '1'}" id="${id}" data-key="${field.key}">`;
  } else if (field.type === 'date') {
    control = `<input type="date" id="${id}" data-key="${field.key}">`;
  } else {
    control = `<input type="text" id="${id}" data-key="${field.key}">`;
  }
  return `<div class="field custom-field"><label for="${id}">${field.label}${required}</label>${control}<span id="error-cf-${field.key}" class="error"></span></div>`;
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
  ['view-dashboard', 'view-entities', 'view-documents', 'view-search', 'view-users'].forEach(id => {
    const el = qs(id);
    if (el) el.hidden = (id !== `view-${viewId}`);
  });

  setActiveModule(viewId);

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
  }
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

function classifyOperationalDoc(doc) {
  const text = normalizeText(doc.type, doc.tipo, doc.docType, doc.category, doc.status, doc.estado, doc.notes, doc.series);
  if (text.includes('ncr') || text.includes('no conform')) return 'ncr';
  if (text.includes('capa')) return 'capa';
  if (text.includes('inspe')) return 'inspection';
  return null;
}

function isOpenOperational(doc) {
  const status = normalizeText(doc.status, doc.estado);
  if (!status) return true;
  return !/(cerrad|closed|complet|done|resuelt|cancel)/.test(status);
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

  const opCounts = { inspections: 0, ncrOpen: 0, capaOpen: 0 };
  docs.forEach(d => {
    const kind = classifyOperationalDoc(d);
    if (kind === 'inspection') opCounts.inspections += 1;
    if (kind === 'ncr' && isOpenOperational(d)) opCounts.ncrOpen += 1;
    if (kind === 'capa' && isOpenOperational(d)) opCounts.capaOpen += 1;
  });

  if (qs('stat-areas')) qs('stat-areas').textContent = String(safeCount(counts.areas));
  if (qs('stat-employees')) qs('stat-employees').textContent = String(safeCount(counts.employees));
  if (qs('stat-products')) qs('stat-products').textContent = String(safeCount(counts.products));
  if (qs('stat-lots')) qs('stat-lots').textContent = String(safeCount(counts.lots));

  // New HU3 KPIs
  if (qs('stat-lots-active')) qs('stat-lots-active').textContent = String(safeCount(counts.activeLots));
  if (qs('stat-products-total')) qs('stat-products-total').textContent = String(safeCount(counts.products));
  if (qs('stat-inspections-total')) qs('stat-inspections-total').textContent = String(safeCount(opCounts.inspections));
  if (qs('stat-ncr-capa-open')) qs('stat-ncr-capa-open').textContent = String(safeCount(opCounts.ncrOpen + opCounts.capaOpen));

  const empty = qs('dashboard-empty-state');
  if (empty) empty.hidden = !(entities.length === 0 && docs.length === 0);
  renderTrackingList();
}

function populateEntitySelect() {
  const select = qs('edit-entity');
  if (!select) return;
  const entities = loadEntities();
  select.innerHTML = `<option value="">Seleccione ${labelFor('entity').toLowerCase()}...</option>` +
    entities.map(e => `<option value="${e.id || e.entity_id}">${e.name} — ${e.code}</option>`).join('');
}

function populateDocumentEntitySelect() {
  const select = qs('document-entity');
  if (!select) return;
  const entities = loadEntities();
  select.innerHTML = `<option value="">Seleccione ${labelFor('entity').toLowerCase()}...</option>` +
    entities.map(e => `<option value="${e.entity_id || e.id}">${e.name} — ${e.code}</option>`).join('');
}

function populateDocumentSelect() {
  const select = qs('edit-document');
  if (!select) return;
  const docs = loadDocuments();
  select.innerHTML = `<option value="">Seleccione documento...</option>` +
    docs.map(d => `<option value="${d.id}">Folio: ${d.folio}</option>`).join('');
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
          customText += `, ${cf.label}: ${e[cf.key]}`;
        }
      }
    }
    const status = getTargetDateStatus(e);
    return `<li class="tracking-item status-${status}"><strong>${e.name}</strong> (${e.code})<span class="tracking-status status-badge">${STATUS_LABELS[status]}</span>${e.targetDate ? ` - Fecha objetivo: ${formatTargetDate(e.targetDate)}` : ''}${customText}</li>`;
  }).join('');
}

function renderDocumentsList() {
  const list = qs('documents-list');
  if (!list) return;
  const docs = loadDocuments();
  if (docs.length === 0) {
    list.innerHTML = `<li class="empty-state">No hay documentos registrados.</li>`;
    return;
  }
  list.innerHTML = docs.map(d => {
    const status = getTargetDateStatus(d);
    return `<li class="tracking-item status-${status}">Folio: ${d.folio} - Estado: <span class="status-badge">${statusLabel(d.status)}</span><span class="tracking-status status-badge">${STATUS_LABELS[status]}</span>${d.targetDate ? ` - Fecha objetivo: ${formatTargetDate(d.targetDate)}` : ''}</li>`;
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
    return `<li class="tracking-item status-${status}"><strong>${record.displayName}</strong>${record.displayCode ? ` (${record.displayCode})` : ''}<span class="tracking-status status-badge">${STATUS_LABELS[status]}</span><span class="tracking-detail">${details}</span></li>`;
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
  list.innerHTML = renderQualityEntityList(rows, getConfig().labels || {});
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

function renderTypedFields(type, values = {}) {
  const container = qs('document-typed-fields');
  if (!container) return;
  container.innerHTML = renderTypedDocumentFields(type, values, getConfig());
  clearTypedDocumentErrors(type);
}

function currentDocumentType() {
  const select = qs('document-type-select');
  return select && select.value ? select.value : '';
}

export async function initApp(configResult) {
  if (configResult) {
    setActiveConfig(configResult.config || configResult);
  }
  applyRelabeling();

  // Event listeners for navigation
  ['dashboard', 'entities', 'documents', 'search', 'users'].forEach(mod => {
    const btn = qs(`nav-${mod}`);
    if (btn) {
      btn.onclick = () => {
        if (mod === 'users' && !authorize('manage-users')) return;
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
    qualityMasterForm.onsubmit = (e) => {
      e.preventDefault();
      const type = currentMasterType();
      const id = qs('quality-master-id').value;
      if (!authorize(id ? 'edit-master' : 'create-master')) return;
      const data = readQualityEntityForm(type);
      clearQualityEntityErrors(type);
      try {
        if (id) {
          updateMaster(type, id, data, getActiveUser().name);
        } else {
          addMaster(type, data, getActiveUser().name);
        }
        resetMasterForm();
        renderMasterForm(type);
        renderQualityMasters();
        updateDashboardStats();
      } catch (err) {
        try {
          const errors = JSON.parse(err.message.replace(/^.*?:\s*/, ''));
          showQualityEntityErrors(type, errors);
        } catch {
          showAuthMessage(err.message);
        }
      }
    };
  }

  const qualityMasterList = qs('quality-entities-list');
  if (qualityMasterList) {
    qualityMasterList.onclick = (e) => {
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
        deleteMaster(type, id, getActiveUser().name);
        resetMasterForm();
        renderQualityMasters();
        updateDashboardStats();
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
    ['action-new-lot', 'Lote'],
    ['action-new-product', 'Producto'],
    ['action-new-area', 'Área'],
    ['action-new-employee', 'Empleado']
  ];
  masterActions.forEach(([id, type]) => {
    const btn = qs(id);
    if (btn) btn.onclick = () => openMasterForm(type);
  });

  const opActions = [
    ['action-new-inspection', 'Inspección'],
    ['action-new-ncr', 'NCR'],
    ['action-new-capa', 'CAPA']
  ];
  opActions.forEach(([id, type]) => {
    const btn = qs(id);
    btn && (btn.onclick = () => openOperationalForm(type));
  });

  if (qs('action-manage-catalogs')) qs('action-manage-catalogs').onclick = () => showView('entities');
  if (qs('action-global-search')) qs('action-global-search').onclick = () => { showView('search'); qs('search-input')?.focus(); };

  // Compatibility actions for existing tests
  if (qs('action-new-entity')) qs('action-new-entity').onclick = () => { showView('entities'); resetEntityForm(); qs('name')?.focus(); };
  if (qs('action-new-document')) qs('action-new-document').onclick = () => { showView('documents'); resetDocumentForm(); qs('document-entity')?.focus(); };
  if (qs('action-open-entities')) qs('action-open-entities').onclick = () => showView('entities');
  if (qs('action-find')) qs('action-find').onclick = () => { showView('search'); qs('search-input')?.focus(); };

  // Entity form submission
  if (entityForm) {
    entityForm.onsubmit = (e) => {
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
        if (id) {
          updateEntity(id, data, currentActor());
        } else {
          addEntity(data, currentActor());
        }
        resetEntityForm();
        populateEntitySelect();
        if (id && qs('edit-entity')) qs('edit-entity').value = id;
        renderEntitiesList();
        updateDashboardStats();
      } catch (err) {
        try {
          const errObj = JSON.parse(err.message.replace(/^.*?:\s*/, ''));
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
    deleteEntityBtn.onclick = () => {
      const selectedId = editEntitySelect ? editEntitySelect.value : '';
      if (!selectedId) return;
      if (!authorize('delete-master')) return;
      if (!confirmAction('¿Eliminar entidad?')) return;
      deleteEntity(selectedId);
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
    documentForm.onsubmit = (e) => {
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
      if (!authorize(id ? 'edit-document' : 'create-document')) return;
      if (isPastTargetDate(data.targetDate) && !confirmAction('La fecha objetivo es anterior a hoy. ¿Desea guardarla de todas formas?')) return;

      const config = getConfig();
      (config.customFields || []).filter(f => f.target === 'document').forEach(cf => {
        const input = qs(`cf-${cf.key}`);
        if (input) data[cf.key] = input.type === 'checkbox' ? input.checked : input.value;
      });

      if (docType) {
        data.tipoDoc = docType;
        const typed = readTypedDocumentFields(docType);
        for (const [key, value] of Object.entries(typed)) {
          if (value !== '' || key === 'status') data[key] = value;
        }
      }

      ['document-entity','folio','startDate','endDate','quantity','subtotal','discount','taxAmount','totalAmount','status','document-targetDate','document-actionType','document-responsible'].forEach(k => { const el = qs(`error-${k}`); if (el) el.textContent = ''; });
      (config.customFields || []).filter(f => f.target === 'document').forEach(cf => { const el = qs(`error-cf-${cf.key}`); if (el) el.textContent = ''; });
      if (docType) clearTypedDocumentErrors(docType);

      try {
        if (id) {
          updateDocument(id, data, currentActor());
        } else {
          addDocument(data, currentActor());
        }
        resetDocumentForm();
        populateDocumentSelect();
        if (id && qs('edit-document')) qs('edit-document').value = id;
        renderDocumentsList();
        updateDashboardStats();
      } catch (err) {
        try {
          const errObj = JSON.parse(err.message.replace(/^.*?:\s*/, ''));
          for (const [k, msg] of Object.entries(errObj)) {
            const errEl = qs(`error-document-${k}`) || qs(`error-${k}`) || qs(`error-cf-${k}`) || (k === 'entityId' ? qs('error-document-entity') : null);
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
    deleteDocumentBtn.onclick = () => {
      const selectedId = editDocumentSelect ? editDocumentSelect.value : '';
      if (!selectedId) return;
      if (!authorize('delete-document')) return;
      if (!confirmAction('¿Eliminar documento?')) return;
      deleteDocument(selectedId);
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
