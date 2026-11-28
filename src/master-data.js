import { getStorage } from './persistence.js';
import { saveModelIndex } from './storage.js';

export const MASTER_TYPES = ['area', 'employee', 'product', 'lot'];

export const MASTER_LABELS = {
  area: 'Área Organizativa',
  employee: 'Empleado',
  product: 'Producto',
  lot: 'Lote'
};

const STORAGE_KEYS = {
  area: 'quality-areas',
  employee: 'quality-employees',
  product: 'quality-products',
  lot: 'quality-lots'
};

const ID_FIELDS = {
  area: 'area_id',
  employee: 'empleado_id',
  product: 'producto_id',
  lot: 'lote_id'
};

const ID_PREFIXES = {
  area: 'area_',
  employee: 'emp_',
  product: 'prod_',
  lot: 'lote_'
};

const ALIASES = {
  area: { codigo: ['code'], nombre: ['name'] },
  employee: { numero_nomina: ['code'], puesto: ['name'] },
  product: { codigo: ['code'], descripcion: ['name'] },
  lot: { numero_lote: ['code', 'name'] }
};

const SEARCH_FIELDS = {
  area: ['codigo', 'nombre', 'modulo'],
  employee: ['numero_nomina', 'puesto', 'area_id', 'jefe_id', 'estado', 'entity_id'],
  product: ['codigo', 'descripcion', 'tipo', 'unidad_medida'],
  lot: ['numero_lote', 'producto_id', 'fecha_fabricacion', 'fecha_caducidad', 'proveedor_id', 'orden_produccion_id']
};

const MODULOS = ['VENTAS', 'ADQUISICION_COMPRAS', 'MANUFACTURA_OPERACIONES', 'CONTABILIDAD_FINANZAS', 'RRHH_PLANILLA', 'LOGISTICA_INVENTARIO', 'CRM'];
const ESTADOS_EMPLEADO = ['ACTIVO', 'INACTIVO', 'SUSPENDIDO'];
const TIPOS_PRODUCTO = ['PRODUCTO', 'MATERIA_PRIMA', 'INSUMO', 'SERVICIO'];


function hasValue(value) {
  return value !== undefined && value !== null && String(value).trim() !== '';
}

function textValue(value) {
  return hasValue(value) ? String(value).trim() : '';
}

function readMasters(type) {
  const raw = getStorage().getItem(STORAGE_KEYS[type]);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeMasters(type, rows) {
  getStorage().setItem(STORAGE_KEYS[type], JSON.stringify(rows));
  saveModelIndex();
}

function normalizeInput(type, data) {
  const source = data && typeof data === 'object' ? data : {};
  const input = {};
  for (const [field, aliases] of Object.entries(ALIASES[type] || {})) {
    if (Object.prototype.hasOwnProperty.call(source, field)) {
      input[field] = textValue(source[field]);
      continue;
    }
    for (const alias of aliases || []) {
      if (hasValue(source[alias])) {
        input[field] = textValue(source[alias]);
        break;
      }
    }
  }
  const passthrough = [
    'modulo', 'activo', 'area_id', 'jefe_id', 'estado', 'entity_id',
    'tipo', 'unidad_medida', 'critico_calidad', 'fecha_fabricacion',
    'fecha_caducidad', 'proveedor_id', 'orden_produccion_id',
    'createdAt', 'updatedAt', ...Object.values(ID_FIELDS), 'id'
  ];
  for (const key of passthrough) {
    if (source[key] !== undefined) input[key] = source[key];
  }
  return input;
}

function toBoolean(value, fallback) {
  if (!hasValue(value)) return fallback;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  return ['true', '1', 'si', 'sí', 'yes'].includes(String(value).trim().toLowerCase());
}

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function addRequiredError(errors, field, value, label) {
  if (!hasValue(value)) errors[field] = `${label} es obligatorio`;
}

function addEnumError(errors, field, value, allowed, label) {
  const normalized = textValue(value);
  if (normalized && !allowed.includes(normalized)) {
    errors[field] = `${label} no es válido`;
  }
}

function addUniqueError(errors, type, input, field, label) {
  const value = textValue(input[field]);
  if (!value) return;
  const ownId = textValue(input[ID_FIELDS[type]]);
  const duplicated = readMasters(type).some(row =>
    textValue(row[field]) === value && textValue(row[ID_FIELDS[type]]) !== ownId
  );
  if (duplicated) errors[field] = `${label} ya está registrado`;
}

function validateNormalized(type, input) {
  const errors = {};

  if (type === 'area') {
    addRequiredError(errors, 'codigo', input.codigo, 'El código');
    addRequiredError(errors, 'nombre', input.nombre, 'El nombre');
    addRequiredError(errors, 'modulo', input.modulo, 'El módulo');
    addUniqueError(errors, type, input, 'codigo', 'El código');
    addEnumError(errors, 'modulo', input.modulo, MODULOS, 'El módulo');
  }

  if (type === 'employee') {
    addRequiredError(errors, 'numero_nomina', input.numero_nomina, 'El número de nómina');
    addRequiredError(errors, 'puesto', input.puesto, 'El puesto');
    addRequiredError(errors, 'area_id', input.area_id, 'El área');
    addUniqueError(errors, type, input, 'numero_nomina', 'El número de nómina');
    addEnumError(errors, 'estado', input.estado || 'ACTIVO', ESTADOS_EMPLEADO, 'El estado');
    if (hasValue(input.area_id) && !findMaster('area', input.area_id)) {
      errors.area_id = 'El área seleccionada no existe';
    }
    if (hasValue(input.jefe_id)) {
      const jefe = findMaster('employee', input.jefe_id);
      if (!jefe) {
        errors.jefe_id = 'El jefe seleccionado no existe';
      } else if (textValue(input[ID_FIELDS.employee]) === textValue(input.jefe_id)) {
        errors.jefe_id = 'El jefe no puede ser el propio empleado';
      }
    }
  }

  if (type === 'product') {
    addRequiredError(errors, 'codigo', input.codigo, 'El código');
    addRequiredError(errors, 'descripcion', input.descripcion, 'La descripción');
    addRequiredError(errors, 'tipo', input.tipo, 'El tipo');
    addRequiredError(errors, 'unidad_medida', input.unidad_medida, 'La unidad de medida');
    addUniqueError(errors, type, input, 'codigo', 'El código');
    addEnumError(errors, 'tipo', input.tipo, TIPOS_PRODUCTO, 'El tipo');
  }

  if (type === 'lot') {
    addRequiredError(errors, 'producto_id', input.producto_id, 'El producto');
    addRequiredError(errors, 'numero_lote', input.numero_lote, 'El número de lote');
    addRequiredError(errors, 'fecha_fabricacion', input.fecha_fabricacion, 'La fecha de fabricación');
    addUniqueError(errors, type, input, 'numero_lote', 'El número de lote');
    if (hasValue(input.producto_id) && !findMaster('product', input.producto_id)) {
      errors.producto_id = 'El producto seleccionado no existe';
    }
    const fabricacion = textValue(input.fecha_fabricacion);
    if (hasValue(fabricacion) && !isValidDate(fabricacion)) {
      errors.fecha_fabricacion = 'La fecha de fabricación debe ser válida (YYYY-MM-DD)';
    }
    const caducidad = textValue(input.fecha_caducidad);
    if (caducidad && !isValidDate(caducidad)) {
      errors.fecha_caducidad = 'La fecha de caducidad debe ser válida (YYYY-MM-DD)';
    } else if (caducidad && isValidDate(fabricacion) && caducidad < fabricacion) {
      errors.fecha_caducidad = 'La fecha de caducidad debe ser mayor o igual a la fecha de fabricación';
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

function canonicalFields(type, input) {
  if (type === 'area') {
    return {
      codigo: textValue(input.codigo),
      nombre: textValue(input.nombre),
      modulo: textValue(input.modulo),
      activo: toBoolean(input.activo, true)
    };
  }
  if (type === 'employee') {
    return {
      numero_nomina: textValue(input.numero_nomina),
      puesto: textValue(input.puesto),
      area_id: textValue(input.area_id),
      jefe_id: textValue(input.jefe_id),
      estado: textValue(input.estado) || 'ACTIVO',
      entity_id: textValue(input.entity_id)
    };
  }
  if (type === 'product') {
    return {
      codigo: textValue(input.codigo),
      descripcion: textValue(input.descripcion),
      tipo: textValue(input.tipo),
      unidad_medida: textValue(input.unidad_medida),
      critico_calidad: toBoolean(input.critico_calidad, false),
      activo: toBoolean(input.activo, true)
    };
  }
  return {
    producto_id: textValue(input.producto_id),
    numero_lote: textValue(input.numero_lote),
    fecha_fabricacion: textValue(input.fecha_fabricacion),
    fecha_caducidad: textValue(input.fecha_caducidad),
    proveedor_id: textValue(input.proveedor_id),
    orden_produccion_id: textValue(input.orden_produccion_id)
  };
}

function generateId(type) {
  return ID_PREFIXES[type] + Math.random().toString(36).slice(2, 11);
}

function buildRecord(type, input, id, actor, existing) {
  const now = new Date().toISOString();
  const user = textValue(actor) || 'sistema';
  return {
    [ID_FIELDS[type]]: id,
    ...canonicalFields(type, input),
    createdAt: existing ? existing.createdAt : now,
    updatedAt: now,
    createdBy: existing ? existing.createdBy || user : user,
    updatedBy: user
  };
}

export function clearMasters() {
  for (const key of Object.values(STORAGE_KEYS)) {
    getStorage().removeItem(key);
  }
  getStorage().removeItem('quality-models');
}

export function loadMasters(type) {
  if (!MASTER_TYPES.includes(type)) return [];
  return readMasters(type);
}

export function validateMaster(type, data) {
  if (!MASTER_TYPES.includes(type)) {
    return { valid: false, errors: { tipo: 'Tipo de maestro no válido' } };
  }
  return validateNormalized(type, normalizeInput(type, data));
}

export function addMaster(type, data, actor) {
  const validation = validateMaster(type, data);
  if (!validation.valid) {
    throw new Error('Validación fallida: ' + JSON.stringify(validation.errors));
  }
  const rows = readMasters(type);
  const record = buildRecord(type, normalizeInput(type, data), generateId(type), actor, null);
  rows.push(record);
  writeMasters(type, rows);
  return record;
}

export function updateMaster(type, id, data, actor) {
  const existing = findMaster(type, id);
  if (!existing) throw new Error('Registro no encontrado');

  const input = normalizeInput(type, data);
  const merged = { ...existing, ...input };
  merged[ID_FIELDS[type]] = existing[ID_FIELDS[type]];
  merged.createdAt = existing.createdAt;

  const validation = validateMaster(type, merged);
  if (!validation.valid) {
    throw new Error('Validación fallida: ' + JSON.stringify(validation.errors));
  }

  const record = buildRecord(type, merged, existing[ID_FIELDS[type]], actor, existing);
  const rows = readMasters(type);
  const index = rows.findIndex(row => textValue(row[ID_FIELDS[type]]) === textValue(existing[ID_FIELDS[type]]));
  rows[index] = record;
  writeMasters(type, rows);
  return record;
}

export function deleteMaster(type, id, _actor) {
  if (!MASTER_TYPES.includes(type)) return;
  const rows = readMasters(type);
  const remaining = rows.filter(row =>
    textValue(row[ID_FIELDS[type]]) !== textValue(id) && textValue(row.id) !== textValue(id)
  );
  if (remaining.length === rows.length) return;
  writeMasters(type, remaining);

  if (type === 'area') {
    const employees = readMasters('employee').filter(employee =>
      employee.area_id !== id && employee.area_id !== textValue(id)
    );
    writeMasters('employee', employees);
  }
  if (type === 'product') {
    const lots = readMasters('lot').filter(lot =>
      lot.producto_id !== id && lot.producto_id !== textValue(id)
    );
    writeMasters('lot', lots);
  }
}

export function findMaster(type, id) {
  if (!MASTER_TYPES.includes(type)) return null;
  const key = textValue(id);
  if (!key) return null;
  return readMasters(type).find(row =>
    textValue(row[ID_FIELDS[type]]) === key || textValue(row.id) === key
  ) || null;
}

export function searchMasters(query) {
  const term = textValue(query).toLowerCase();
  const results = [];
  for (const type of MASTER_TYPES) {
    for (const record of readMasters(type)) {
      const matches = !term || SEARCH_FIELDS[type].some(field =>
        textValue(record[field]).toLowerCase().includes(term)
      );
      if (matches) results.push({ ...record, masterType: type });
    }
  }
  return results;
}
