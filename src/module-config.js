export const DEFAULT_CONFIG = {
  moduleName: 'Gestión de Calidad',
  labels: {
    panel: 'Panel general',
    masters: 'Datos maestros',
    operations: 'Registros operativos',
    audit: 'Consulta y trazabilidad'
  },
  theme: { accentColor: '#167b74' },
  customFields: [
    { target: 'producto', key: 'origen', label: 'Origen / proveedor', type: 'text' },
    { target: 'lote', key: 'parametrosLote', label: 'Parámetros de lote', type: 'text' },
    { target: 'lote', key: 'fechaProcesoSugerida', label: 'Temporalidad del proceso', type: 'date' },
    { target: 'inspeccion', key: 'metricasFallas', label: 'Métricas de fallas', type: 'number' },
    { target: 'inspeccion', key: 'dictamen', label: 'Dictamen final', type: 'select', options: ['Aprobación', 'Retrabajo', 'Descarte'], required: true },
    { target: 'ncr', key: 'impacto', label: 'Impacto operativo', type: 'select', options: ['Bajo', 'Medio', 'Alto'], required: true },
    { target: 'ncr', key: 'reincidente', label: '¿Es reincidente?', type: 'boolean' },
    { target: 'capa', key: 'costoEstimado', label: 'Costo estimado', type: 'decimal' }
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
  }
};

const FIELD_TYPES = ['text', 'number', 'decimal', 'date', 'select', 'boolean'];
const MASTER_TYPES = ['producto', 'lote', 'area', 'empleado'];
const OPERATION_TYPES = ['inspeccion', 'ncr', 'capa'];

export function normalizeConfig(userConfig) {
  const errors = [];
  if (!userConfig || typeof userConfig !== 'object') {
    return { config: structuredClone(DEFAULT_CONFIG), errors };
  }

  const config = structuredClone(DEFAULT_CONFIG);
  if (typeof userConfig.moduleName === 'string' && userConfig.moduleName.trim()) {
    config.moduleName = userConfig.moduleName.trim();
  } else if ('moduleName' in userConfig) {
    errors.push('moduleName inválido: debe ser una cadena no vacía');
  }

  for (const key of Object.keys(DEFAULT_CONFIG.labels)) {
    if (typeof userConfig.labels?.[key] === 'string' && userConfig.labels[key].trim()) {
      config.labels[key] = userConfig.labels[key].trim();
    }
  }

  if (userConfig.theme?.accentColor !== undefined) {
    if (/^#([0-9a-fA-F]{3}){1,2}$/.test(userConfig.theme.accentColor)) {
      config.theme.accentColor = userConfig.theme.accentColor;
    } else {
      errors.push('theme.accentColor inválido: debe ser un color hexadecimal');
    }
  }

  if (userConfig.customFields !== undefined) {
    if (!Array.isArray(userConfig.customFields)) {
      errors.push('customFields debe ser un arreglo');
    } else {
      const seen = new Set();
      config.customFields = [];
      for (const cf of userConfig.customFields) {
        const type = cf?.target;
        if (![...MASTER_TYPES, ...OPERATION_TYPES].includes(type)) {
          errors.push(`Campo personalizado con target desconocido: ${type}`);
          continue;
        }
        if (!cf.key || typeof cf.key !== 'string') {
          errors.push('Campo personalizado sin clave válida');
          continue;
        }
        const identity = `${type}:${cf.key}`;
        if (seen.has(identity)) {
          errors.push(`Campo personalizado duplicado: ${identity}`);
          continue;
        }
        seen.add(identity);
        if (!FIELD_TYPES.includes(cf.type)) {
          errors.push(`Tipo de campo desconocido para '${cf.key}': ${cf.type}`);
          continue;
        }
        if (cf.type === 'select' && (!Array.isArray(cf.options) || cf.options.length === 0)) {
          errors.push(`El campo select '${cf.key}' requiere opciones`);
          continue;
        }
        config.customFields.push({ ...cf });
      }
    }
  }

  if (userConfig.statusLifecycle !== undefined) {
    const lifecycle = userConfig.statusLifecycle;
    if (lifecycle === null) {
      config.statusLifecycle = null;
    } else if (!Array.isArray(lifecycle?.statuses) || typeof lifecycle.transitions !== 'object') {
      errors.push('statusLifecycle inválido: requiere statuses y transitions');
    } else {
      const statuses = new Set(lifecycle.statuses);
      for (const [from, targets] of Object.entries(lifecycle.transitions)) {
        if (!statuses.has(from) || !Array.isArray(targets)) {
          errors.push(`Transición inválida configurada desde '${from}'`);
          continue;
        }
        for (const target of targets) {
          if (!statuses.has(target)) errors.push(`Transición inválida: estado desconocido '${target}'`);
        }
      }
      config.statusLifecycle = lifecycle;
    }
  }

  return { config, errors };
}

let activeConfig = null;

export function setActiveConfig(config) {
  activeConfig = config;
}

export function getConfig() {
  return normalizeConfig(activeConfig ?? DEFAULT_CONFIG).config;
}

export function loadModuleConfig(userConfig = globalThis.QUALITY_CONFIG ?? DEFAULT_CONFIG) {
  const result = normalizeConfig(userConfig);
  setActiveConfig(result.config);
  return result;
}
