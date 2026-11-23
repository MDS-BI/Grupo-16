import { getConfig, setActiveConfig, labelFor, normalizeConfig } from './module-config.js';
import { loadEntities, addEntity, updateEntity, deleteEntity, searchEntities, loadDocuments, addDocument, updateDocument, deleteDocument } from './storage.js';

function qs(id) { return document.getElementById(id); }

function renderLogo(moduleName) {
  const logoMark = qs('logo-mark');
  if (!logoMark) return;
  const words = moduleName.trim().split(/\s+/);
  let initials = words.map(w => w[0]).join('').toUpperCase().slice(0, 2);
  if (!initials) initials = 'MB';

  logoMark.innerHTML = `
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="6" fill="var(--accent, #2563eb)"/>
      <text x="16" y="21" fill="#ffffff" font-size="14" font-weight="bold" text-anchor="middle">${initials}</text>
    </svg>
  `;
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

  renderLogo(config.moduleName);
  renderCustomFieldsForms();
}

function renderCustomFieldsForms() {
  const config = getConfig();
  const entityContainer = qs('entity-custom-fields-container');
  const entityWrapper = qs('entity-custom-fields');
  if (entityContainer && entityWrapper) {
    const entityFields = config.customFields.filter(f => f.target === 'entity');
    if (entityFields.length > 0) {
      entityWrapper.hidden = false;
      entityContainer.innerHTML = entityFields.map(f => {
        if (f.type === 'select') {
          return `
            <div class="field custom-field">
              <label for="cf-${f.key}">${f.label}${f.required ? ' *' : ''}</label>
              <select id="cf-${f.key}" data-key="${f.key}">
                <option value="">--</option>
                ${f.options.map(o => `<option value="${o}">${o}</option>`).join('')}
              </select>
              <span id="error-cf-${f.key}" class="error"></span>
            </div>
          `;
        } else {
          return `
            <div class="field custom-field">
              <label for="cf-${f.key}">${f.label}${f.required ? ' *' : ''}</label>
              <input type="${f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'}" id="cf-${f.key}" data-key="${f.key}">
              <span id="error-cf-${f.key}" class="error"></span>
            </div>
          `;
        }
      }).join('');
    } else {
      entityWrapper.hidden = true;
      entityContainer.innerHTML = '';
    }
  }

  const docContainer = qs('document-custom-fields-container');
  const docWrapper = qs('document-custom-fields');
  if (docContainer && docWrapper) {
    const docFields = config.customFields.filter(f => f.target === 'document');
    if (docFields.length > 0) {
      docWrapper.hidden = false;
      docContainer.innerHTML = docFields.map(f => {
        if (f.type === 'select') {
          return `
            <div class="field custom-field">
              <label for="cf-${f.key}">${f.label}${f.required ? ' *' : ''}</label>
              <select id="cf-${f.key}" data-key="${f.key}">
                <option value="">--</option>
                ${f.options.map(o => `<option value="${o}">${o}</option>`).join('')}
              </select>
              <span id="error-cf-${f.key}" class="error"></span>
            </div>
          `;
        } else {
          return `
            <div class="field custom-field">
              <label for="cf-${f.key}">${f.label}${f.required ? ' *' : ''}</label>
              <input type="${f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'}" id="cf-${f.key}" data-key="${f.key}">
              <span id="error-cf-${f.key}" class="error"></span>
            </div>
          `;
        }
      }).join('');
    } else {
      docWrapper.hidden = true;
      docContainer.innerHTML = '';
    }
  }
}

function showView(viewId) {
  ['view-dashboard', 'view-entities', 'view-documents', 'view-search'].forEach(id => {
    const el = qs(id);
    if (el) el.hidden = (id !== `view-${viewId}`);
  });

  ['nav-dashboard', 'nav-entities', 'nav-documents', 'nav-search'].forEach(id => {
    const btn = qs(id);
    if (btn) {
      if (btn.dataset.module === viewId) {
        btn.setAttribute('aria-current', 'page');
      } else {
        btn.removeAttribute('aria-current');
      }
    }
  });

  if (viewId === 'dashboard') {
    updateDashboardStats();
  } else if (viewId === 'entities') {
    populateEntitySelect();
    renderEntitiesList();
  } else if (viewId === 'documents') {
    populateDocumentEntitySelect();
    populateDocumentSelect();
    renderDocumentsList();
  } else if (viewId === 'search') {
    performSearch();
  }
}

function formatTargetDate(value) {
  if (!value) return '';
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return value;
  return `${match[3]}/${match[2]}/${match[1]}`;
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
    return `<li><strong>${e.name}</strong> (${e.code})${e.targetDate ? ` - Fecha objetivo: ${formatTargetDate(e.targetDate)}` : ''}${customText}</li>`;
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
  list.innerHTML = docs.map(d => `<li>Folio: ${d.folio} - Estado: <span class="status-badge">${d.status || ''}</span></li>`).join('');
}

function performSearch() {
  const input = qs('search-input');
  const list = qs('search-results-list');
  const empty = qs('search-empty');
  if (!input || !list) return;

  const results = searchEntities(input.value);
  if (empty) empty.hidden = (results.length > 0);

  const config = getConfig();
  const docs = loadDocuments();
  list.innerHTML = results.map(e => {
    let customText = '';
    if (config.customFields) {
      for (const cf of config.customFields) {
        if (cf.target === 'entity' && e[cf.key] !== undefined) {
          customText += `, ${cf.label}: ${e[cf.key]}`;
        }
      }
    }
    const entityDocs = docs.filter(d => d.entity_id === e.entity_id || d.entityId === e.entity_id);
    const docText = entityDocs.length ? ` ${entityDocs.map(d => `<span class="status-badge">${d.status || ''}</span>`).join(' ')}` : '';
    return `<li class="entity-item"><strong>${e.name}</strong> (${e.code})${e.targetDate ? ` - Fecha objetivo: ${formatTargetDate(e.targetDate)}` : ''}${customText}${docText}</li>`;
  }).join('');
}

export async function initApp(configResult) {
  if (configResult) {
    setActiveConfig(configResult.config || configResult);
  }
  applyRelabeling();

  // Event listeners for navigation
  ['dashboard', 'entities', 'documents', 'search'].forEach(mod => {
    const btn = qs(`nav-${mod}`);
    if (btn) {
      btn.onclick = () => showView(mod);
    }
  });

  const entityForm = qs('entity-form');
  const editEntitySelect = qs('edit-entity');
  const documentForm = qs('document-form');
  const editDocumentSelect = qs('edit-document');

  function resetEntityForm() {
    if (entityForm) entityForm.reset();
    if (qs('entity-id')) qs('entity-id').value = '';
    if (qs('submit-button')) qs('submit-button').textContent = 'Guardar';
    ['name','code','email','creditLimit','targetDate'].forEach(k => { const el = qs(`error-${k}`); if (el) el.textContent = ''; });
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
      select.innerHTML = `<option value=""></option>` + allowed.map(s => `<option value="${s}" ${s===currentStatus?'selected':''}>${s}</option>`).join('');
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
    resetEntityForm();
    const typeInput = qs('tipoItem') || qs('master-type') || qs('category');
    if (typeInput) typeInput.value = masterType;
    const name = qs('name');
    if (name) name.focus();
  }

  function openOperationalForm(docType) {
    showView('documents');
    resetDocumentForm();
    const typeField = qs('tipoDoc') || qs('document-type') || qs('docType');
    const statusField = qs('status');
    if (typeField) typeField.value = docType;
    if (statusField && !statusField.value) statusField.value = docType === 'NCR' ? 'ABIERTA' : (docType === 'CAPA' ? 'ABIERTA' : 'REGISTRADA');
    if (qs('document-entity')) qs('document-entity').focus();
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
        targetDate: qs('targetDate') ? qs('targetDate').value : ''
      };

      const config = getConfig();
      (config.customFields || []).filter(f => f.target === 'entity').forEach(cf => {
        const input = qs(`cf-${cf.key}`);
        if (input) data[cf.key] = input.value;
      });

      // Clear errors
      ['name','code','email','creditLimit','targetDate'].forEach(k => { const errEl = qs(`error-${k}`); if (errEl) errEl.textContent = ''; });
      (config.customFields || []).filter(f => f.target === 'entity').forEach(cf => { const errEl = qs(`error-cf-${cf.key}`); if (errEl) errEl.textContent = ''; });

      try {
        if (id) {
          updateEntity(id, data);
        } else {
          addEntity(data);
        }
        resetEntityForm();
        populateEntitySelect();
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
      if (qs('submit-button')) qs('submit-button').textContent = 'Actualizar';

      const config = getConfig();
      (config.customFields || []).filter(f => f.target === 'entity').forEach(cf => {
        const input = qs(`cf-${cf.key}`);
        if (input) input.value = entity[cf.key] !== undefined ? entity[cf.key] : '';
      });
    };
  }

  // Delete entity button
  const deleteEntityBtn = qs('delete-entity');
  if (deleteEntityBtn) {
    deleteEntityBtn.onclick = () => {
      const selectedId = editEntitySelect ? editEntitySelect.value : '';
      if (!selectedId) return;
      if (window.confirm && !window.confirm('¿Eliminar entidad?')) return;
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
        status: qs('status') ? qs('status').value : ''
      };

      const config = getConfig();
      (config.customFields || []).filter(f => f.target === 'document').forEach(cf => {
        const input = qs(`cf-${cf.key}`);
        if (input) data[cf.key] = input.value;
      });

      ['document-entity','folio','startDate','endDate','quantity','subtotal','discount','taxAmount','totalAmount','status'].forEach(k => { const el = qs(`error-${k}`); if (el) el.textContent = ''; });
      (config.customFields || []).filter(f => f.target === 'document').forEach(cf => { const el = qs(`error-cf-${cf.key}`); if (el) el.textContent = ''; });

      try {
        if (id) {
          updateDocument(id, data);
        } else {
          addDocument(data);
        }
        resetDocumentForm();
        populateDocumentSelect();
        renderDocumentsList();
        updateDashboardStats();
      } catch (err) {
        try {
          const errObj = JSON.parse(err.message.replace(/^.*?:\s*/, ''));
          for (const [k, msg] of Object.entries(errObj)) {
            const errEl = qs(`error-${k}`) || qs(`error-cf-${k}`) || (k === 'entityId' ? qs('error-document-entity') : null);
            if (errEl) errEl.textContent = msg;
          }
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
      syncStatusControl(doc.status || '');
      const statusEl = qs('status');
      if (statusEl) statusEl.value = doc.status || '';
      if (qs('document-submit-button')) qs('document-submit-button').textContent = 'Actualizar Documento';

      const config = getConfig();
      (config.customFields || []).filter(f => f.target === 'document').forEach(cf => {
        const input = qs(`cf-${cf.key}`);
        if (input) input.value = doc[cf.key] !== undefined ? doc[cf.key] : '';
      });
    };
  }

  const deleteDocumentBtn = qs('delete-document');
  if (deleteDocumentBtn) {
    deleteDocumentBtn.onclick = () => {
      const selectedId = editDocumentSelect ? editDocumentSelect.value : '';
      if (!selectedId) return;
      if (window.confirm && !window.confirm('¿Eliminar documento?')) return;
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

  syncStatusControl();
  showView('dashboard');
}

export async function boot() {
  await initApp(getConfig());
}
