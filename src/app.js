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
  if (qs('action-new-entity-title')) qs('action-new-entity-title').textContent = `Nuevo ${labelFor('entity')}`;
  if (qs('action-new-document-title')) qs('action-new-document-title').textContent = `Nuevo ${labelFor('document')}`;
  if (qs('action-open-entities-title')) qs('action-open-entities-title').textContent = labelFor('entities');
  if (qs('action-find-title')) qs('action-find-title').textContent = 'Buscar registros';

  // Stat labels
  if (qs('stat-entities-label')) qs('stat-entities-label').textContent = labelFor('entities');
  if (qs('stat-documents-label')) qs('stat-documents-label').textContent = labelFor('documents');

  // Entities view
  if (qs('entities-view-heading')) qs('entities-view-heading').textContent = labelFor('entities');
  if (qs('entity-form-heading')) qs('entity-form-heading').textContent = `Agregar / Editar ${labelFor('entity')}`;
  if (qs('edit-entity-heading')) qs('edit-entity-heading').textContent = `Editar o eliminar el ${labelFor('entity').toLowerCase()}`;
  if (qs('delete-entity')) qs('delete-entity').textContent = `Eliminar el ${labelFor('entity').toLowerCase()} seleccionado`;

  // Documents view
  if (qs('documents-view-heading')) qs('documents-view-heading').textContent = labelFor('documents');
  if (qs('document-form-heading')) qs('document-form-heading').textContent = `Agregar / Editar ${labelFor('document')}`;
  if (qs('edit-document-heading')) qs('edit-document-heading').textContent = `Editar o eliminar el ${labelFor('document').toLowerCase()}`;
  if (qs('delete-document')) qs('delete-document').textContent = `Eliminar el ${labelFor('document').toLowerCase()} seleccionado`;

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

function updateDashboardStats() {
  const entities = loadEntities();
  const docs = loadDocuments();
  if (qs('stat-entities')) qs('stat-entities').textContent = entities.length;
  if (qs('stat-documents')) qs('stat-documents').textContent = docs.length;
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
    return `<li><strong>${e.name}</strong> (${e.code})${e.targetDate ? ` - Fecha: ${e.targetDate}` : ''}${customText}</li>`;
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
  list.innerHTML = docs.map(d => `<li>Folio: ${d.folio} - Estado: ${d.status}</li>`).join('');
}

function performSearch() {
  const input = qs('search-input');
  const list = qs('search-results-list');
  const empty = qs('search-empty');
  if (!input || !list) return;

  const results = searchEntities(input.value);
  if (empty) empty.hidden = (results.length > 0);

  const config = getConfig();
  list.innerHTML = results.map(e => {
    let customText = '';
    if (config.customFields) {
      for (const cf of config.customFields) {
        if (cf.target === 'entity' && e[cf.key] !== undefined) {
          customText += `, ${cf.label}: ${e[cf.key]}`;
        }
      }
    }
    return `<li class="entity-item"><strong>${e.name}</strong> (${e.code})${customText}</li>`;
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

  // Dashboard quick actions
  if (qs('action-new-entity')) {
    qs('action-new-entity').onclick = () => {
      showView('entities');
      const form = qs('entity-form');
      if (form) form.reset();
      if (qs('entity-id')) qs('entity-id').value = '';
      if (qs('name')) qs('name').focus();
    };
  }

  if (qs('action-new-document')) {
    qs('action-new-document').onclick = () => {
      showView('documents');
      const form = qs('document-form');
      if (form) form.reset();
      if (qs('document-id')) qs('document-id').value = '';
      if (qs('document-entity')) qs('document-entity').focus();
    };
  }

  if (qs('action-open-entities')) {
    qs('action-open-entities').onclick = () => showView('entities');
  }

  if (qs('action-find')) {
    qs('action-find').onclick = () => {
      showView('search');
      if (qs('search-input')) qs('search-input').focus();
    };
  }

  // Entity form submission
  const entityForm = qs('entity-form');
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
      if (config.customFields) {
        for (const cf of config.customFields) {
          if (cf.target === 'entity') {
            const input = qs(`cf-${cf.key}`);
            if (input) data[cf.key] = input.value;
          }
        }
      }

      // Clear errors
      ['name', 'code', 'email', 'creditLimit', 'targetDate'].forEach(k => {
        const errEl = qs(`error-${k}`);
        if (errEl) errEl.textContent = '';
      });
      if (config.customFields) {
        for (const cf of config.customFields) {
          const errEl = qs(`error-cf-${cf.key}`);
          if (errEl) errEl.textContent = '';
        }
      }

      try {
        if (id) {
          updateEntity(id, data);
        } else {
          addEntity(data);
        }
        entityForm.reset();
        if (qs('entity-id')) qs('entity-id').value = '';
        populateEntitySelect();
        renderEntitiesList();
      } catch (err) {
        try {
          const errObj = JSON.parse(err.message.replace(/^.*?:\s*/, ''));
          for (const [k, msg] of Object.entries(errObj)) {
            const errEl = qs(`error-${k}`) || qs(`error-cf-${k}`);
            if (errEl) errEl.textContent = msg;
          }
        } catch {
          // fallback
          if (err.message.includes('email') && qs('error-email')) {
            qs('error-email').textContent = err.message;
          } else if (err.message.includes('name') && qs('error-name')) {
            qs('error-name').textContent = err.message;
          } else if (err.message.includes('code') && qs('error-code')) {
            qs('error-code').textContent = err.message;
          }
        }
      }
    };
  }

  // Edit entity select change
  const editEntitySelect = qs('edit-entity');
  if (editEntitySelect) {
    editEntitySelect.onchange = () => {
      const selectedId = editEntitySelect.value;
      if (!selectedId) return;
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

      const config = getConfig();
      if (config.customFields) {
        for (const cf of config.customFields) {
          if (cf.target === 'entity') {
            const input = qs(`cf-${cf.key}`);
            if (input) input.value = entity[cf.key] !== undefined ? entity[cf.key] : '';
          }
        }
      }
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
      if (entityForm) entityForm.reset();
      if (qs('entity-id')) qs('entity-id').value = '';
      populateEntitySelect();
      renderEntitiesList();
    };
  }

  // Search input event
  const searchInput = qs('search-input');
  if (searchInput) {
    searchInput.oninput = () => performSearch();
  }

  showView('dashboard');
}

export async function boot() {
  await initApp(getConfig());
}
