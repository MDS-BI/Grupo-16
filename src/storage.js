import { getConfig } from './module-config.js';

export function clearAll() {
  localStorage.removeItem('quality-entities');
  localStorage.removeItem('quality-documents');
  localStorage.removeItem('quality-models');
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

  if (data.targetDate && data.targetDate.trim()) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(data.targetDate) || isNaN(Date.parse(data.targetDate))) {
      errors.targetDate = 'Fecha objetivo inválida';
    }
  }

  // Custom fields validation
  const config = getConfig();
  if (config.customFields) {
    for (const cf of config.customFields) {
      if (cf.target === 'entity') {
        const val = data[cf.key];
        if (cf.required && (val === undefined || val === '' || val === null)) {
          errors[cf.key] = `El campo '${cf.label || cf.key}' es obligatorio`;
        } else if (val !== undefined && val !== '' && val !== null) {
          if (cf.type === 'number') {
            if (isNaN(Number(val))) {
              errors[cf.key] = `El campo '${cf.label || cf.key}' debe ser un número`;
            }
          } else if (cf.type === 'select') {
            if (!cf.options.includes(val)) {
              errors[cf.key] = `El valor debe ser uno de: ${cf.options.join(', ')}`;
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

export function addEntity(data) {
  const validation = validateEntity(data);
  if (!validation.valid) {
    throw new Error('Validación de entidad fallida: ' + JSON.stringify(validation.errors));
  }
  const entities = loadEntities();
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
    createdAt: new Date().toISOString()
  };

  // Add custom fields if declared
  const config = getConfig();
  if (config.customFields) {
    for (const cf of config.customFields) {
      if (cf.target === 'entity' && data[cf.key] !== undefined) {
        newEntity[cf.key] = cf.type === 'number' ? Number(data[cf.key]) : data[cf.key];
      }
    }
  }

  entities.push(newEntity);
  saveEntities(entities);
  return newEntity;
}

export function updateEntity(id, data) {
  const entities = loadEntities();
  const index = entities.findIndex(e => e.id === id || e.entity_id === id);
  if (index === -1) throw new Error('Entidad no encontrada');

  const existing = entities[index];
  const merged = { ...existing, ...data };
  const validation = validateEntity(merged);
  if (!validation.valid) {
    throw new Error('Validación de entidad fallida: ' + JSON.stringify(validation.errors));
  }

  existing.name = data.name !== undefined ? data.name.trim() : existing.name;
  existing.code = data.code !== undefined ? data.code.trim() : existing.code;
  if (data.taxId !== undefined) existing.taxId = data.taxId;
  if (data.email !== undefined) existing.email = data.email;
  if (data.phone !== undefined) existing.phone = data.phone;
  if (data.address !== undefined) existing.address = data.address;
  if (data.creditLimit !== undefined) existing.creditLimit = data.creditLimit !== '' ? Number(data.creditLimit) : 0;
  if (data.paymentTerms !== undefined) existing.paymentTerms = data.paymentTerms;
  if (data.targetDate !== undefined) existing.targetDate = data.targetDate;
  existing.updatedAt = new Date().toISOString();

  const config = getConfig();
  if (config.customFields) {
    for (const cf of config.customFields) {
      if (cf.target === 'entity' && data[cf.key] !== undefined) {
        existing[cf.key] = cf.type === 'number' ? Number(data[cf.key]) : data[cf.key];
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
      errors.endDate = 'La fecha final no puede ser anterior a la inicial';
    }
  }

  const config = getConfig();
  // Status lifecycle validation
  if (config.statusLifecycle) {
    const { statuses } = config.statusLifecycle;
    if (data.status && !statuses.includes(data.status)) {
      errors.status = `El estado debe ser uno de: ${statuses.join(', ')}`;
    }
  }

  // Custom fields validation for documents
  if (config.customFields) {
    for (const cf of config.customFields) {
      if (cf.target === 'document') {
        const val = data[cf.key];
        if (cf.required && (val === undefined || val === '' || val === null)) {
          errors[cf.key] = `El campo '${cf.label || cf.key}' es obligatorio`;
        } else if (val !== undefined && val !== '' && val !== null) {
          if (cf.type === 'select') {
            if (!cf.options.includes(val)) {
              errors[cf.key] = `El valor debe ser uno de: ${cf.options.join(', ')}`;
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

export function addDocument(data) {
  const validation = validateDocument(data);
  if (!validation.valid) {
    throw new Error('Validación de documento fallida: ' + JSON.stringify(validation.errors));
  }

  const docs = loadDocuments();
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
    status: data.status || (getConfig().statusLifecycle ? getConfig().statusLifecycle.statuses[0] : 'pendiente'),
    paymentTerms: data.paymentTerms || '',
    notes: data.notes || '',
    createdAt: new Date().toISOString()
  };

  const config = getConfig();
  if (config.customFields) {
    for (const cf of config.customFields) {
      if (cf.target === 'document' && data[cf.key] !== undefined) {
        newDoc[cf.key] = data[cf.key];
      }
    }
  }

  docs.push(newDoc);
  saveDocuments(docs);
  return newDoc;
}

export function updateDocument(id, data) {
  const docs = loadDocuments();
  const index = docs.findIndex(d => d.id === id);
  if (index === -1) throw new Error('Documento no encontrado');

  const existing = docs[index];

  const config = getConfig();
  if (config.statusLifecycle && data.status && data.status !== existing.status) {
    const { statuses, transitions } = config.statusLifecycle;
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

  if (data.entityId !== undefined) existing.entityId = data.entityId;
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
  existing.updatedAt = new Date().toISOString();

  if (config.customFields) {
    for (const cf of config.customFields) {
      if (cf.target === 'document' && data[cf.key] !== undefined) {
        existing[cf.key] = data[cf.key];
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
