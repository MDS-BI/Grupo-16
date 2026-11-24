export const DOCUMENT_TYPES = ['NCR', 'Inspección', 'Auditoría', 'CAPA', 'Queja', 'Evaluación'];

export const DOMAIN_LABELS = {
  ncrStatuses: {
    ABIERTA: 'Abierta',
    EN_INVESTIGACION: 'En investigación',
    EN_CAPA: 'En CAPA',
    CERRADA: 'Cerrada',
    RECHAZADA: 'Rechazada'
  },
  inspectionTypes: {
    RECEPCION: 'Recepción',
    PROCESO: 'Proceso',
    FINAL: 'Final',
    LIBERACION: 'Liberación'
  },
  inspectionResults: {
    ACEPTADO: 'Aceptado',
    RECHAZADO: 'Rechazado',
    CONDICIONADO: 'Condicionado'
  },
  auditTypes: {
    INTERNA: 'Interna',
    PROVEEDOR: 'Proveedor',
    PROCESO: 'Proceso'
  },
  auditStatuses: {
    PLANIFICADA: 'Planificada',
    EN_PROCESO: 'En proceso',
    FINALIZADA: 'Finalizada',
    CERRADA: 'Cerrada'
  },
  capaTypes: {
    CORRECTIVA: 'Correctiva',
    PREVENTIVA: 'Preventiva'
  },
  capaStatuses: {
    ABIERTA: 'Abierta',
    EN_EJECUCION: 'En ejecución',
    EN_VERIFICACION: 'En verificación',
    CERRADA_EFECTIVA: 'Cerrada efectiva',
    CERRADA_NO_EFECTIVA: 'Cerrada no efectiva'
  },
  quejaCanales: {
    TELEFONO: 'Teléfono',
    CORREO: 'Correo',
    WEB: 'Web',
    PRESENCIAL: 'Presencial'
  },
  quejaClasificacion: {
    GARANTIA: 'Garantía',
    DEVOLUCION: 'Devolución',
    SERVICIO: 'Servicio',
    OTRO: 'Otro'
  },
  quejaStatuses: {
    RECIBIDA: 'Recibida',
    EN_INVESTIGACION: 'En investigación',
    RESUELTA: 'Resuelta',
    CERRADA: 'Cerrada'
  },
  evaluacionClasificacion: {
    APROBADO: 'Aprobado',
    CONDICIONADO: 'Condicionado',
    SUSPENDIDO: 'Suspendido'
  }
};

function sequentialTransitions(statuses) {
  return statuses.reduce((transitions, status, index) => {
    transitions[status] = index < statuses.length - 1 ? [statuses[index + 1]] : [];
    return transitions;
  }, {});
}

const NCR_STATUSES = ['ABIERTA', 'EN_INVESTIGACION', 'EN_CAPA', 'CERRADA', 'RECHAZADA'];
const INSPECTION_STATUSES = ['REGISTRADA', 'ACEPTADO', 'RECHAZADO', 'CONDICIONADO'];
const AUDIT_STATUSES = ['PLANIFICADA', 'EN_PROCESO', 'FINALIZADA', 'CERRADA'];
const CAPA_STATUSES = ['ABIERTA', 'EN_EJECUCION', 'EN_VERIFICACION', 'CERRADA_EFECTIVA', 'CERRADA_NO_EFECTIVA'];
const QUEJA_STATUSES = ['RECIBIDA', 'EN_INVESTIGACION', 'RESUELTA', 'CERRADA'];
const EVALUACION_STATUSES = ['BORRADOR', 'FINALIZADA'];

export const DOCUMENT_TYPE_META = {
  NCR: {
    label: 'No Conformidad',
    fields: [
      { key: 'folio', label: 'Folio', type: 'text', required: true },
      { key: 'origen', label: 'Origen', type: 'select', options: ['CLIENTE', 'PROVEEDOR', 'INTERNO', 'AUDITORIA'], required: true },
      { key: 'area_afectada_id', label: 'Área afectada', type: 'text', required: true },
      { key: 'producto_id', label: 'Producto', type: 'text' },
      { key: 'lote_id', label: 'Lote', type: 'text' },
      { key: 'detectado_por', label: 'Detectado por', type: 'text', required: true },
      { key: 'fecha_deteccion', label: 'Fecha de detección', type: 'date', required: true },
      { key: 'gravedad', label: 'Gravedad', type: 'select', options: ['MENOR', 'MAYOR', 'CRITICA'], required: true },
      { key: 'descripcion', label: 'Descripción', type: 'text', required: true },
      { key: 'estado', label: 'Estado', type: 'select', options: [...NCR_STATUSES], required: true }
    ],
    statuses: [...NCR_STATUSES],
    transitions: {
      ABIERTA: ['EN_INVESTIGACION', 'RECHAZADA'],
      EN_INVESTIGACION: ['EN_CAPA', 'CERRADA', 'RECHAZADA'],
      EN_CAPA: ['CERRADA', 'RECHAZADA'],
      CERRADA: [],
      RECHAZADA: []
    }
  },
  Inspección: {
    label: 'Inspección',
    fields: [
      { key: 'tipo', label: 'Tipo', type: 'select', options: ['RECEPCION', 'PROCESO', 'FINAL', 'LIBERACION'], required: true },
      { key: 'area_id', label: 'Área', type: 'text', required: true },
      { key: 'producto_id', label: 'Producto', type: 'text', required: true },
      { key: 'lote_id', label: 'Lote', type: 'text' },
      { key: 'inspector_id', label: 'Inspector', type: 'text', required: true },
      { key: 'fecha_inspeccion', label: 'Fecha de inspección', type: 'date', required: true },
      { key: 'resultado', label: 'Resultado', type: 'select', options: [...INSPECTION_STATUSES.slice(1)], required: true },
      { key: 'plan_muestreo', label: 'Plan de muestreo', type: 'text' },
      { key: 'observaciones', label: 'Observaciones', type: 'text' }
    ],
    statuses: [...INSPECTION_STATUSES],
    transitions: {
      REGISTRADA: ['ACEPTADO', 'RECHAZADO', 'CONDICIONADO'],
      ACEPTADO: [],
      RECHAZADO: [],
      CONDICIONADO: []
    }
  },
  Auditoría: {
    label: 'Auditoría',
    fields: [
      { key: 'tipo', label: 'Tipo', type: 'select', options: ['INTERNA', 'PROVEEDOR', 'PROCESO'], required: true },
      { key: 'area_id', label: 'Área', type: 'text' },
      { key: 'entidad_auditada_id', label: 'Entidad auditada', type: 'text' },
      { key: 'auditor_lider_id', label: 'Auditor líder', type: 'text', required: true },
      { key: 'fecha_inicio', label: 'Fecha de inicio', type: 'date', required: true },
      { key: 'fecha_fin', label: 'Fecha de fin', type: 'date' },
      { key: 'alcance', label: 'Alcance', type: 'text', required: true },
      { key: 'objetivo', label: 'Objetivo', type: 'text', required: true },
      { key: 'estado', label: 'Estado', type: 'select', options: [...AUDIT_STATUSES] }
    ],
    statuses: [...AUDIT_STATUSES],
    transitions: sequentialTransitions(AUDIT_STATUSES)
  },
  CAPA: {
    label: 'CAPA',
    fields: [
      { key: 'folio', label: 'Folio', type: 'text', required: true },
      { key: 'ncr_id', label: 'NCR', type: 'text', required: true },
      { key: 'tipo', label: 'Tipo', type: 'select', options: ['CORRECTIVA', 'PREVENTIVA'], required: true },
      { key: 'responsable_id', label: 'Responsable', type: 'text', required: true },
      { key: 'fecha_objetivo', label: 'Fecha objetivo', type: 'date', required: true },
      { key: 'causa_raiz', label: 'Causa raíz', type: 'text', required: true },
      { key: 'metodologia', label: 'Metodología', type: 'select', options: ['5_WHYS', 'ISHIKAWA', 'OTRO'], required: true },
      { key: 'estado', label: 'Estado', type: 'select', options: [...CAPA_STATUSES] },
      { key: 'prioridad', label: 'Prioridad', type: 'select', options: ['BAJA', 'MEDIA', 'ALTA'], default: 'MEDIA' }
    ],
    statuses: [...CAPA_STATUSES],
    transitions: sequentialTransitions(CAPA_STATUSES)
  },
  Queja: {
    label: 'Queja',
    fields: [
      { key: 'folio', label: 'Folio', type: 'text', required: true },
      { key: 'entidad_id', label: 'Entidad', type: 'text', required: true },
      { key: 'contacto_nombre', label: 'Nombre de contacto', type: 'text' },
      { key: 'canal', label: 'Canal', type: 'select', options: ['TELEFONO', 'CORREO', 'WEB', 'PRESENCIAL'], required: true },
      { key: 'fecha_recepcion', label: 'Fecha de recepción', type: 'date', required: true },
      { key: 'clasificacion', label: 'Clasificación', type: 'select', options: ['GARANTIA', 'DEVOLUCION', 'SERVICIO', 'OTRO'], required: true },
      { key: 'descripcion', label: 'Descripción', type: 'text', required: true },
      { key: 'ncr_id', label: 'NCR', type: 'text' },
      { key: 'estado', label: 'Estado', type: 'select', options: [...QUEJA_STATUSES] }
    ],
    statuses: [...QUEJA_STATUSES],
    transitions: sequentialTransitions(QUEJA_STATUSES)
  },
  Evaluación: {
    label: 'Evaluación',
    fields: [
      { key: 'proveedor_id', label: 'Proveedor', type: 'text', required: true },
      { key: 'periodo', label: 'Periodo', type: 'text', required: true },
      { key: 'evaluado_por', label: 'Evaluado por', type: 'text', required: true },
      { key: 'calidad', label: 'Calidad', type: 'number', required: true },
      { key: 'entrega', label: 'Entrega', type: 'number', required: true },
      { key: 'precio', label: 'Precio', type: 'number', required: true },
      { key: 'servicio', label: 'Servicio', type: 'number', required: true },
      { key: 'clasificacion', label: 'Clasificación', type: 'select', options: ['APROBADO', 'CONDICIONADO', 'SUSPENDIDO'], required: true },
      { key: 'observaciones', label: 'Observaciones', type: 'text' }
    ],
    statuses: [...EVALUACION_STATUSES],
    transitions: { BORRADOR: ['FINALIZADA'], FINALIZADA: [] }
  }
};

export function getDocumentTypeSchema(type) {
  return Object.prototype.hasOwnProperty.call(DOCUMENT_TYPE_META, type) ? DOCUMENT_TYPE_META[type] : null;
}

export function getTypeStatusOptions(type, currentStatus) {
  const meta = getDocumentTypeSchema(type);
  if (!meta) return [];
  if (currentStatus && Array.isArray(meta.transitions[currentStatus])) {
    return [currentStatus, ...meta.transitions[currentStatus]];
  }
  return [...meta.statuses];
}

function isMissing(value) {
  return value === undefined || value === null || (typeof value === 'string' && value.trim() === '');
}

function isValidDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value));
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function isValidPeriod(value) {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(String(value));
}

function toNumber(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value))) return Number(value);
  return null;
}

export function validateTypedDocument(type, data) {
  const meta = getDocumentTypeSchema(type);
  if (!meta) return { valid: false, errors: { type: 'Tipo de documento desconocido' } };

  const values = data && typeof data === 'object' ? data : {};
  const errors = {};

  for (const field of meta.fields) {
    const value = values[field.key];
    if (isMissing(value)) {
      if (field.required) errors[field.key] = `El campo '${field.label}' es obligatorio`;
      continue;
    }

    if (field.type === 'select' && Array.isArray(field.options) && !field.options.includes(value)) {
      errors[field.key] = `El campo '${field.label}' no es una opción válida`;
      continue;
    }

    if (field.type === 'date' && !isValidDate(value)) {
      errors[field.key] = `El campo '${field.label}' debe ser una fecha válida`;
      continue;
    }

    if (field.type === 'number') {
      const numeric = toNumber(value);
      if (numeric === null) {
        errors[field.key] = `El campo '${field.label}' debe ser un número`;
      } else if (numeric < 0 || numeric > 100) {
        errors[field.key] = `El campo '${field.label}' debe estar entre 0 y 100`;
      }
      continue;
    }

    if (field.key === 'periodo' && !isValidPeriod(value)) {
      errors[field.key] = `El campo '${field.label}' debe tener formato YYYY-MM`;
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function relabelDocumentType(type) {
  const meta = getDocumentTypeSchema(type);
  return meta ? meta.label : type;
}
