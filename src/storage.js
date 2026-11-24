import { getConfig } from './module-config.js';
import { ACTION_TYPES, normalizeCompleted, validateTargetDate } from './target-date.js';
import { DOCUMENT_TYPE_META, validateTypedDocument } from './document-types.js';

const MODEL_INDEX_KEY = 'quality-models';

const MODEL_KEYS = [
  'quality-entities',
  'quality-documents',
  'quality-areas',
  'quality-employees',
  'quality-products',
  'quality-lots',
  'quality-users',
  'quality-session'
];

export function saveModelIndex() {
  const index = {
    version: 1,
    keys: MODEL_KEYS,
    updatedAt: new Date().toISOString()
  };
  localStorage.setItem(MODEL_INDEX_KEY, JSON.stringify(index));
}

export function clearAll() {
  for (const key of MODEL_KEYS) {
    localStorage.removeItem(key);
  }
  localStorage.removeItem(MODEL_INDEX_KEY);
}

export function loadEntities() {
  const raw = localStorage.getItem('quality-entities');
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveEntities(entities) {
  localStorage.setItem('quality-entities', JSON.stringify(entities));
  saveModelIndex();
}

export function loadDocuments() {
  const raw = localStorage.getItem('quality-documents');
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveDocuments(docs) {
  localStorage.setItem('quality-documents', JSON.stringify(docs));
  saveModelIndex();
}

function generateId() {
  return 'ent_' + Math.random().toString(36).substr(2, 9);
}

function generateDocId() {
  return 'doc_' + Math.random().toString(36).substr(2, 9);
}

function generateEntityId() {
  return 'E-' + Math.floor(100000 + Math.random() * 900000);
}

function normalizeCustomValue(cf, value) {
  if (value === undefined) return value;
  if (cf.type === 'number' || cf.type === 'decimal') return value === '' ? '' : Number(value);
  if (cf.type === 'boolean') return value === true || value === 'true' || value === '1' || value === 1;
  return value;
}

function lifecycleForDocument(data, config) {
  const type = data && (data.tipoDoc || data.documentType);
  const byType = config.statusLifecycleByType && type ? config.statusLifecycleByType[type] : null;
  return byType || config.statusLifecycle;
}

function currentActor(actor) {
  return actor || 'sistema';
}

function auditEntry(field, from, to, user, now) {
  const at = now.toISOString();
  return {
    field,
    from: from === undefined || from === null ? '' : String(from),
    to: to === undefined || to === null ? '' : String(to),
    user: user || 'sistema',
    date: at.slice(0, 10),
    time: at.slice(11, 19),
    at
  };
}

function planningValues(record) {
  return {
    targetDate: (record && record.targetDate) || '',
    actionType: (record && record.actionType) || '',
    responsible: (record && record.responsible) || '',
    completed: normalizeCompleted(record && record.completed)
  };
}

function initialPlanningLog(data, user, now) {
  const values = planningValues(data);
  return Object.keys(values)
    .filter(key => values[key] !== '' && values[key] !== false)
    .map(key => auditEntry(key, '', values[key], user, now));
}

function planningChanges(before, after, user, now) {
  return Object.keys(after)
    .filter(key => String(before[key]) !== String(after[key]))
    .map(key => auditEntry(key, before[key], after[key], user, now));
}

function validatePlanning(data, errors) {
  const dateError = validateTargetDate(data.targetDate);
  if (dateError) {
    errors.targetDate = dateError;
  } else if (data.targetDate && String(data.targetDate).trim() && (!data.responsible || !String(data.responsible).trim())) {
    errors.responsible = 'El responsable es obligatorio cuando hay fecha objetivo';
  }
  if (data.actionType && !ACTION_TYPES.includes(data.actionType)) {
    errors.actionType = `El tipo de acción debe ser uno de: ${ACTION_TYPES.join(', ')}`;
  }
}

export function validateEntity(data) {
  const errors = {};
  if (!data.name || !String(data.name).trim()) {
    errors.name = 'El nombre es obligatorio';
  }
  if (!data.code || !String(data.code).trim()) {
    errors.code = 'El código es obligatorio';
  }

  if (data.email && data.email.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.email = 'Correo electrónico inválido';
    }
  }

  if (data.creditLimit !== undefined && data.creditLimit !== '' && data.creditLimit !== null) {
    const num = Number(data.creditLimit);
    if (isNaN(num) || num < 0) {
      errors.creditLimit = 'El límite de crédito debe ser un número no negativo';
    }
  }

  validatePlanning(data, errors);

  // Custom fields validation
  const config = getConfig();
  if (config.customFields) {
    for (const cf of config.customFields) {
      if (cf.target === 'entity') {
        const val = data[cf.key];
        if (cf.required && (val === undefined || val === '' || val === null)) {
          errors[cf.key] = `El campo '${cf.label || cf.key}' es obligatorio`;
        } else if (val !== undefined && val !== '' && val !== null) {
          if (cf.type === 'number' || cf.type === 'decimal') {
            if (isNaN(Number(val))) {
              errors[cf.key] = `El campo '${cf.label || cf.key}' debe ser un número`;
            }
          } else if (cf.type === 'select' || cf.type === 'enum') {
            if (!cf.options.includes(val)) {
              errors[cf.key] = `El valor debe ser uno de: ${cf.options.join(', ')}`;
            }
          } else if (cf.type === 'boolean') {
            if (![true, false, 'true', 'false', '1', '0', 1, 0].includes(val)) {
              errors[cf.key] = `El campo '${cf.label || cf.key}' debe ser booleano`;
            }
          }
        }
      }
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

export function addEntity(data, actor) {
  const validation = validateEntity(data);
  if (!validation.valid) {
    throw new Error('Validación de entidad fallida: ' + JSON.stringify(validation.errors));
  }
  const entities = loadEntities();
  const now = new Date();
  const user = currentActor(actor || data.changedBy);
  const newEntity = {
    id: generateId(),
    entity_id: generateEntityId(),
    name: data.name.trim(),
    code: data.code.trim(),
    taxId: data.taxId || '',
    email: data.email || '',
    phone: data.phone || '',
    address: data.address || '',
    creditLimit: data.creditLimit !== undefined && data.creditLimit !== '' ? Number(data.creditLimit) : 0,
    paymentTerms: data.paymentTerms || '',
    targetDate: data.targetDate || '',
    actionType: data.actionType || '',
    responsible: data.responsible || '',
    completed: normalizeCompleted(data.completed),
    changeLog: initialPlanningLog(data, user, now),
    createdAt: now.toISOString()
  };

  // Add custom fields if declared
  const config = getConfig();
  if (config.customFields) {
    for (const cf of config.customFields) {
      if (cf.target === 'entity' && data[cf.key] !== undefined) {
        newEntity[cf.key] = normalizeCustomValue(cf, data[cf.key]);
      }
    }
  }

  entities.push(newEntity);
  saveEntities(entities);
  return newEntity;
}

export function updateEntity(id, data, actor) {
  const entities = loadEntities();
  const index = entities.findIndex(e => e.id === id || e.entity_id === id);
  if (index === -1) throw new Error('Entidad no encontrada');

  const existing = entities[index];
  const before = planningValues(existing);
  const merged = { ...existing, ...data };
  const validation = validateEntity(merged);
  if (!validation.valid) {
    throw new Error('Validación de entidad fallida: ' + JSON.stringify(validation.errors));
  }

  const now = new Date();
  const user = currentActor(actor || data.changedBy);
  const after = {
    targetDate: data.targetDate !== undefined ? data.targetDate : before.targetDate,
    actionType: data.actionType !== undefined ? data.actionType : before.actionType,
    responsible: data.responsible !== undefined ? data.responsible : before.responsible,
    completed: data.completed !== undefined ? normalizeCompleted(data.completed) : before.completed
  };
  const changes = planningChanges(before, after, user, now);

  existing.name = data.name !== undefined ? data.name.trim() : existing.name;
  existing.code = data.code !== undefined ? data.code.trim() : existing.code;
  if (data.taxId !== undefined) existing.taxId = data.taxId;
  if (data.email !== undefined) existing.email = data.email;
  if (data.phone !== undefined) existing.phone = data.phone;
  if (data.address !== undefined) existing.address = data.address;
  if (data.creditLimit !== undefined) existing.creditLimit = data.creditLimit !== '' ? Number(data.creditLimit) : 0;
  if (data.paymentTerms !== undefined) existing.paymentTerms = data.paymentTerms;
  existing.targetDate = after.targetDate;
  existing.actionType = after.actionType;
  existing.responsible = after.responsible;
  existing.completed = after.completed;
  if (changes.length) existing.changeLog = [...(existing.changeLog || []), ...changes];
  existing.updatedAt = now.toISOString();

  const config = getConfig();
  if (config.customFields) {
    for (const cf of config.customFields) {
      if (cf.target === 'entity' && data[cf.key] !== undefined) {
        existing[cf.key] = normalizeCustomValue(cf, data[cf.key]);
      }
    }
  }

  saveEntities(entities);
  return existing;
}

export function deleteDocumentsForEntity(entityId) {
  const docs = loadDocuments();
  const filtered = docs.filter(d => d.entityId !== entityId && d.entity_id !== entityId);
  saveDocuments(filtered);
}

export function deleteEntity(id) {
  const entities = loadEntities();
  const entity = entities.find(e => e.id === id || e.entity_id === id);
  if (!entity) return;

  deleteDocumentsForEntity(entity.entity_id);
  deleteDocumentsForEntity(entity.id);

  const filtered = entities.filter(e => e.id !== id && e.entity_id !== id);
  saveEntities(filtered);
}

export function searchEntities(query) {
  if (!query || !query.trim()) return loadEntities();
  const q = query.toLowerCase().trim();
  const entities = loadEntities();
  const config = getConfig();

  return entities.filter(e => {
    const matchBase = (
      (e.name && e.name.toLowerCase().includes(q)) ||
      (e.code && e.code.toLowerCase().includes(q)) ||
      (e.taxId && e.taxId.toLowerCase().includes(q)) ||
      (e.email && e.email.toLowerCase().includes(q)) ||
      (e.phone && e.phone.toLowerCase().includes(q)) ||
      (e.address && e.address.toLowerCase().includes(q)) ||
      (e.targetDate && e.targetDate.includes(q))
    );
    if (matchBase) return true;

    // Search custom fields
    if (config.customFields) {
      for (const cf of config.customFields) {
        if (cf.target === 'entity' && e[cf.key] !== undefined && e[cf.key] !== null) {
          if (String(e[cf.key]).toLowerCase().includes(q)) return true;
        }
      }
    }
    return false;
  });
}

export function searchDocuments(query) {
  if (!query || !query.trim()) return loadDocuments();
  const q = query.toLowerCase().trim();
  const config = getConfig();
  return loadDocuments().filter(doc => {
    const base = [doc.series, doc.folio, doc.status, doc.notes, doc.tipoDoc, doc.documentType, doc.entityId, doc.entity_id, doc.targetDate]
      .some(value => value !== undefined && value !== null && String(value).toLowerCase().includes(q));
    if (base) return true;
    return (config.customFields || []).some(cf => {
      const value = doc[cf.key];
      return value !== undefined && value !== null && String(value).toLowerCase().includes(q);
    });
  });
}

export function validateDocument(data) {
  const errors = {};
  if (!data.entityId) {
    errors.entityId = 'La entidad asociada es obligatoria';
  } else {
    const entities = loadEntities();
    const found = entities.some(e => e.id === data.entityId || e.entity_id === data.entityId);
    if (!found) {
      errors.entityId = 'Entidad no encontrada';
    }
  }

  if (data.folio === undefined || data.folio === '') {
    errors.folio = 'El folio es obligatorio';
  } else {
    const f = Number(data.folio);
    if (isNaN(f) || f <= 0 || !Number.isInteger(f)) {
      errors.folio = 'El folio debe ser un entero positivo';
    }
  }

  if (data.quantity !== undefined && data.quantity !== '') {
    const q = Number(data.quantity);
    if (isNaN(q) || q <= 0 || !Number.isInteger(q)) {
      errors.quantity = 'La cantidad debe ser un entero positivo';
    }
  }

  if (data.subtotal !== undefined && data.subtotal !== '' && Number(data.subtotal) < 0) {
    errors.subtotal = 'El subtotal no puede ser negativo';
  }
  if (data.discount !== undefined && data.discount !== '' && Number(data.discount) < 0) {
    errors.discount = 'El descuento no puede ser negativo';
  }
  if (data.taxAmount !== undefined && data.taxAmount !== '' && Number(data.taxAmount) < 0) {
    errors.taxAmount = 'El impuesto no puede ser negativo';
  }
  if (data.totalAmount !== undefined && data.totalAmount !== '' && Number(data.totalAmount) < 0) {
    errors.totalAmount = 'El total no puede ser negativo';
  }

  if (data.subtotal !== undefined && data.discount !== undefined && data.subtotal !== '' && data.discount !== '') {
    if (Number(data.discount) > Number(data.subtotal)) {
      errors.discount = 'El descuento no puede superar el subtotal';
    }
  }

  if (data.startDate && data.endDate) {
    if (new Date(data.startDate) > new Date(data.endDate)) {
      errors.endDate = 'La fecha final debe ser igual o posterior a la fecha inicial';
    }
  }

  validatePlanning(data, errors);

  const config = getConfig();
  const lifecycle = lifecycleForDocument(data, config);
  if (lifecycle) {
    const { statuses } = lifecycle;
    if (data.status && !statuses.includes(data.status)) {
      errors.status = `El estado debe ser uno de: ${statuses.join(', ')}`;
    }
  }

  const documentType = data.tipoDoc || data.documentType;
  if (documentType && Object.prototype.hasOwnProperty.call(DOCUMENT_TYPE_META, documentType)) {
    const typed = validateTypedDocument(documentType, data);
    Object.assign(errors, typed.errors);
  }

  // Custom fields validation for documents
  if (config.customFields) {
    for (const cf of config.customFields) {
      if (cf.target === 'document') {
        const val = data[cf.key];
        if (cf.required && (val === undefined || val === '' || val === null)) {
          errors[cf.key] = `El campo '${cf.label || cf.key}' es obligatorio`;
        } else if (val !== undefined && val !== '' && val !== null) {
          if (cf.type === 'select' || cf.type === 'enum') {
            if (!cf.options.includes(val)) {
              errors[cf.key] = `El valor debe ser uno de: ${cf.options.join(', ')}`;
            }
          } else if (cf.type === 'number' || cf.type === 'decimal') {
            if (isNaN(Number(val))) {
              errors[cf.key] = `El campo '${cf.label || cf.key}' debe ser un número`;
            }
          } else if (cf.type === 'boolean') {
            if (![true, false, 'true', 'false', '1', '0', 1, 0].includes(val)) {
              errors[cf.key] = `El campo '${cf.label || cf.key}' debe ser booleano`;
            }
          }
        }
      }
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

export function addDocument(data, actor) {
  const validation = validateDocument(data);
  if (!validation.valid) {
    throw new Error('Validación de documento fallida: ' + JSON.stringify(validation.errors));
  }

  const docs = loadDocuments();
  const now = new Date();
  const user = currentActor(actor || data.changedBy);
  const newDoc = {
    id: generateDocId(),
    entityId: data.entityId,
    entity_id: data.entityId,
    series: data.series || '',
    folio: Number(data.folio),
    startDate: data.startDate || '',
    endDate: data.endDate || '',
    quantity: data.quantity !== undefined && data.quantity !== '' ? Number(data.quantity) : 1,
    subtotal: data.subtotal !== undefined && data.subtotal !== '' ? Number(data.subtotal) : 0,
    discount: data.discount !== undefined && data.discount !== '' ? Number(data.discount) : 0,
    taxAmount: data.taxAmount !== undefined && data.taxAmount !== '' ? Number(data.taxAmount) : 0,
    totalAmount: data.totalAmount !== undefined && data.totalAmount !== '' ? Number(data.totalAmount) : 0,
    currency: data.currency || 'MXN',
    status: data.status || (() => {
      const lifecycle = lifecycleForDocument(data, getConfig());
      return lifecycle && lifecycle.statuses.length ? lifecycle.statuses[0] : 'pendiente';
    })(),
    paymentTerms: data.paymentTerms || '',
    notes: data.notes || '',
    targetDate: data.targetDate || '',
    actionType: data.actionType || '',
    responsible: data.responsible || '',
    completed: normalizeCompleted(data.completed),
    changeLog: initialPlanningLog(data, user, now),
    createdAt: now.toISOString(),
    tipoDoc: data.tipoDoc || data.documentType || ''
  };

  const documentType = data.tipoDoc || data.documentType;
  if (documentType && DOCUMENT_TYPE_META[documentType]) {
    for (const field of DOCUMENT_TYPE_META[documentType].fields) {
      if (field.key === 'folio' || data[field.key] === undefined) continue;
      newDoc[field.key] = data[field.key];
    }
  }

  const config = getConfig();
  if (config.customFields) {
    for (const cf of config.customFields) {
      if (cf.target === 'document' && data[cf.key] !== undefined) {
        newDoc[cf.key] = normalizeCustomValue(cf, data[cf.key]);
      }
    }
  }

  docs.push(newDoc);
  saveDocuments(docs);
  return newDoc;
}

export function updateDocument(id, data, actor) {
  const docs = loadDocuments();
  const index = docs.findIndex(d => d.id === id);
  if (index === -1) throw new Error('Documento no encontrado');

  const existing = docs[index];
  const before = planningValues(existing);

  const config = getConfig();
  const lifecycle = lifecycleForDocument({ ...existing, ...data }, config);
  if (lifecycle && data.status && data.status !== existing.status) {
    const { statuses, transitions } = lifecycle;
    if (!statuses.includes(data.status)) {
      throw new Error(`Transición de estado inválida: estado desconocido '${data.status}'`);
    }
    const allowed = transitions[existing.status] || [];
    if (!allowed.includes(data.status)) {
      throw new Error(`Transición de estado inválida de '${existing.status}' a '${data.status}'`);
    }
  }

  const merged = { ...existing, ...data };
  const validation = validateDocument(merged);
  if (!validation.valid) {
    throw new Error('Validación de documento fallida: ' + JSON.stringify(validation.errors));
  }

  const now = new Date();
  const user = currentActor(actor || data.changedBy);
  const after = {
    targetDate: data.targetDate !== undefined ? data.targetDate : before.targetDate,
    actionType: data.actionType !== undefined ? data.actionType : before.actionType,
    responsible: data.responsible !== undefined ? data.responsible : before.responsible,
    completed: data.completed !== undefined ? normalizeCompleted(data.completed) : before.completed
  };
  const changes = planningChanges(before, after, user, now);

  if (data.entityId !== undefined) { existing.entityId = data.entityId; existing.entity_id = data.entityId; }
  if (data.series !== undefined) existing.series = data.series;
  if (data.folio !== undefined) existing.folio = Number(data.folio);
  if (data.startDate !== undefined) existing.startDate = data.startDate;
  if (data.endDate !== undefined) existing.endDate = data.endDate;
  if (data.quantity !== undefined) existing.quantity = Number(data.quantity);
  if (data.subtotal !== undefined) existing.subtotal = Number(data.subtotal);
  if (data.discount !== undefined) existing.discount = Number(data.discount);
  if (data.taxAmount !== undefined) existing.taxAmount = Number(data.taxAmount);
  if (data.totalAmount !== undefined) existing.totalAmount = Number(data.totalAmount);
  if (data.currency !== undefined) existing.currency = data.currency;
  if (data.status !== undefined) existing.status = data.status;
  if (data.paymentTerms !== undefined) existing.paymentTerms = data.paymentTerms;
  if (data.notes !== undefined) existing.notes = data.notes;
  existing.targetDate = after.targetDate;
  existing.actionType = after.actionType;
  existing.responsible = after.responsible;
  existing.completed = after.completed;
  if (changes.length) existing.changeLog = [...(existing.changeLog || []), ...changes];
  existing.updatedAt = now.toISOString();

  if (config.customFields) {
    for (const cf of config.customFields) {
      if (cf.target === 'document' && data[cf.key] !== undefined) {
        existing[cf.key] = normalizeCustomValue(cf, data[cf.key]);
      }
    }
  }

  saveDocuments(docs);
  return existing;
}

export function deleteDocument(id) {
  const docs = loadDocuments();
  const filtered = docs.filter(d => d.id !== id);
  saveDocuments(filtered);
}
