import { DOCUMENT_TYPE_META, DOMAIN_LABELS } from './document-types.js';
import { ROLES, validateRoleDefinition } from './permissions.js';

export const BASE_FIELDS = {
  entity: ['id', 'entity_id', 'name', 'code', 'taxId', 'email', 'phone', 'address', 'creditLimit', 'paymentTerms', 'targetDate', 'actionType', 'responsible', 'completed', 'changeLog', 'createdAt', 'updatedAt'],
  document: ['id', 'entityId', 'series', 'folio', 'startDate', 'endDate', 'quantity', 'subtotal', 'discount', 'taxAmount', 'totalAmount', 'currency', 'status', 'paymentTerms', 'notes', 'targetDate', 'actionType', 'responsible', 'completed', 'changeLog', 'createdAt', 'updatedAt']
};

export const FIELD_TYPES = ['text', 'number', 'date', 'select', 'boolean', 'decimal', 'enum'];

export const DEFAULT_CONFIG = {
  moduleName: 'Módulo Base ERP',
  labels: {
    entity: 'Entidad',
    entities: 'Entidades',
    document: 'Documento',
    documents: 'Documentos'
  },
  customFields: [],
  statusLifecycle: null,
  statusLifecycleByType: null,
  domainLabels: {},
  roles: null,
  theme: {
    accentColor: '#2563eb'
  }
};

export const QUALITY_CONFIG = {
  moduleName: 'Gestión de Calidad',
  labels: {
    entity: 'Producto / Lote',
    entities: 'Productos y Lotes',
    document: 'Inspección / NCR',
    documents: 'Inspecciones y NCRs',
    area: 'Área auditada',
    areas: 'Áreas auditadas',
    employee: 'Empleado',
    employees: 'Empleados',
    product: 'Producto',
    products: 'Productos',
    lot: 'Lote',
    lots: 'Lotes',
    ncr: 'No Conformidad',
    ncrs: 'Hallazgos / No conformidades',
    inspection: 'Inspección',
    inspections: 'Inspecciones',
    audit: 'Auditoría',
    audits: 'Auditorías',
    capa: 'CAPA',
    capas: 'Acciones correctivas',
    users: 'Usuarios y roles',
    roles: 'Roles'
  },
  customFields: [
    { target: 'entity', key: 'tipoItem', label: 'Tipo', type: 'enum', options: ['Producto', 'Lote', 'Área', 'Empleado'], required: true },
    { target: 'document', key: 'tipoDoc', label: 'Tipo de Registro', type: 'enum', options: Object.keys(DOCUMENT_TYPE_META), required: true }
  ],
  statusLifecycle: {
    statuses: ['ABIERTA', 'EN_INVESTIGACION', 'EN_CAPA', 'CERRADA', 'RECHAZADA'],
    transitions: {
      ABIERTA: ['EN_INVESTIGACION', 'RECHAZADA'],
      EN_INVESTIGACION: ['EN_CAPA', 'CERRADA', 'RECHAZADA'],
      EN_CAPA: ['CERRADA', 'RECHAZADA'],
      CERRADA: [],
      RECHAZADA: []
    }
  },
  statusLifecycleByType: Object.fromEntries(
    Object.entries(DOCUMENT_TYPE_META).map(([type, meta]) => [type, { statuses: meta.statuses, transitions: meta.transitions }])
  ),
  domainLabels: DOMAIN_LABELS,
  roles: ROLES.map(role => ({ role, permissions: [] })),
  theme: { accentColor: '#2563eb' }
};

let activeConfig = null;

export function normalizeConfig(userConfig) {
  const errors = [];
  if (!userConfig) {
    return { config: { ...DEFAULT_CONFIG }, errors };
  }

  const config = {
    moduleName: typeof userConfig.moduleName === 'string' && userConfig.moduleName.trim() ? userConfig.moduleName.trim() : DEFAULT_CONFIG.moduleName,
    labels: {
      ...DEFAULT_CONFIG.labels,
      ...(userConfig.labels || {})
    },
    customFields: [],
    statusLifecycle: userConfig.statusLifecycle === null ? null : (userConfig.statusLifecycle ? { ...userConfig.statusLifecycle } : null),
    statusLifecycleByType: userConfig.statusLifecycleByType && typeof userConfig.statusLifecycleByType === 'object'
      ? { ...userConfig.statusLifecycleByType }
      : null,
    domainLabels: userConfig.domainLabels && typeof userConfig.domainLabels === 'object'
      ? { ...userConfig.domainLabels }
      : {},
    roles: Array.isArray(userConfig.roles) ? userConfig.roles.map(role => ({ ...role })) : null,
    theme: {
      accentColor: DEFAULT_CONFIG.theme.accentColor
    }
  };

  if ('moduleName' in userConfig && (typeof userConfig.moduleName !== 'string' || !userConfig.moduleName.trim())) {
    errors.push('moduleName inválido: debe ser una cadena no vacía');
  }

  // Validate theme
  if (userConfig.theme !== undefined) {
    if (typeof userConfig.theme !== 'object' || userConfig.theme === null || Array.isArray(userConfig.theme)) {
      errors.push('theme inválido: debe ser un objeto');
    } else if (userConfig.theme.accentColor !== undefined) {
      const hexRegex = /^#([0-9a-fA-F]{3}){1,2}$/;
      if (typeof userConfig.theme.accentColor !== 'string' || !hexRegex.test(userConfig.theme.accentColor)) {
        errors.push('theme.accentColor inválido: debe ser un color hexadecimal válido');
      } else {
        config.theme.accentColor = userConfig.theme.accentColor;
      }
    }
  }

  // Validate customFields
  if (userConfig.customFields) {
    if (!Array.isArray(userConfig.customFields)) {
      errors.push('customFields debe ser un arreglo');
    } else {
      const seenKeys = { entity: new Set(), document: new Set() };
      for (const cf of userConfig.customFields) {
        if (!cf || typeof cf !== 'object') {
          errors.push('Campo personalizado inválido');
          continue;
        }
        if (!['entity', 'document'].includes(cf.target)) {
          errors.push(`Target desconocido para campo personalizado: ${cf.target}`);
          continue;
        }
        if (!cf.key || typeof cf.key !== 'string') {
          errors.push('Clave de campo personalizado requerida');
          continue;
        }
        if (BASE_FIELDS[cf.target].includes(cf.key)) {
          errors.push(`La clave '${cf.key}' choca con un campo base`);
          continue;
        }
        if (seenKeys[cf.target].has(cf.key)) {
          errors.push(`La clave '${cf.key}' está declarada más de una vez`);
          continue;
        }
        seenKeys[cf.target].add(cf.key);

        if (!FIELD_TYPES.includes(cf.type)) {
          errors.push(`Tipo de campo personalizado desconocido (type): ${cf.type}`);
          continue;
        }
        if (cf.type === 'select' || cf.type === 'enum') {
          if (!Array.isArray(cf.options) || cf.options.length === 0) {
            errors.push(`El campo ${cf.type} '${cf.key}' requiere opciones (options)`);
            continue;
          }
        }
        config.customFields.push({ ...cf });
      }
    }
  }

  // Validate statusLifecycle
  if (config.statusLifecycle) {
    const { statuses, transitions } = config.statusLifecycle;
    if (!Array.isArray(statuses)) {
      errors.push('statusLifecycle.statuses debe ser un arreglo');
    } else if (!transitions || typeof transitions !== 'object') {
      errors.push('statusLifecycle.transitions debe ser un objeto');
    } else {
      const statusSet = new Set(statuses);
      for (const s of statuses) {
        const allowed = transitions[s];
        if (allowed) {
          if (!Array.isArray(allowed)) {
            errors.push(`Transitions para '${s}' debe ser un arreglo`);
          } else {
            for (const next of allowed) {
              if (!statusSet.has(next)) {
                errors.push(`Transición inválida: estado desconocido '${next}'`);
              }
            }
          }
        }
      }
    }
  }

  if (config.roles) {
    for (const definition of config.roles) {
      const validation = validateRoleDefinition(definition && definition.role, definition && definition.permissions);
      if (!validation.valid) {
        errors.push(`Definición de rol inválida: ${validation.errors.join('; ')}`);
      }
    }
  }

  if (config.statusLifecycleByType) {
    for (const [type, lifecycle] of Object.entries(config.statusLifecycleByType)) {
      if (!lifecycle || !Array.isArray(lifecycle.statuses) || !lifecycle.transitions || typeof lifecycle.transitions !== 'object') {
        errors.push(`Ciclo de vida inválido para '${type}'`);
        continue;
      }
      const known = new Set(lifecycle.statuses);
      for (const [status, next] of Object.entries(lifecycle.transitions)) {
        if (!Array.isArray(next) || next.some(candidate => !known.has(candidate))) {
          errors.push(`Transiciones inválidas para '${type}.${status}'`);
        }
      }
    }
  }

  return { config, errors };
}

export async function loadModuleConfig() {
  return normalizeConfig(activeConfig);
}

export function setActiveConfig(cfg) {
  activeConfig = cfg;
}

export function getConfig() {
  const { config } = normalizeConfig(activeConfig);
  return config;
}

export function labelFor(key) {
  const cfg = getConfig();
  if (cfg.labels && cfg.labels[key]) {
    return cfg.labels[key];
  }
  return DEFAULT_CONFIG.labels[key] || key;
}
