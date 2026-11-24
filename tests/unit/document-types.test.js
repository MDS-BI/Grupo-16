import { describe, it, expect } from 'vitest';
import {
  DOCUMENT_TYPES,
  DOCUMENT_TYPE_META,
  DOMAIN_LABELS,
  getDocumentTypeSchema,
  getTypeStatusOptions,
  validateTypedDocument,
  relabelDocumentType
} from '../../src/document-types.js';

const validDocuments = {
  NCR: {
    folio: 'NCR-001',
    origen: 'CLIENTE',
    area_afectada_id: 'area-1',
    detectado_por: 'emp-1',
    fecha_deteccion: '2026-11-20',
    gravedad: 'MENOR',
    descripcion: 'Defecto detectado',
    estado: 'ABIERTA'
  },
  Inspección: {
    tipo: 'RECEPCION',
    area_id: 'area-1',
    producto_id: 'prod-1',
    inspector_id: 'emp-1',
    fecha_inspeccion: '2026-11-20',
    resultado: 'ACEPTADO'
  },
  Auditoría: {
    tipo: 'INTERNA',
    auditor_lider_id: 'emp-1',
    fecha_inicio: '2026-11-20',
    alcance: 'Proceso de producción',
    objetivo: 'Verificar el cumplimiento',
    estado: 'PLANIFICADA'
  },
  CAPA: {
    folio: 'CAPA-001',
    ncr_id: 'ncr-1',
    tipo: 'CORRECTIVA',
    responsable_id: 'emp-1',
    fecha_objetivo: '2026-12-01',
    causa_raiz: 'Falta de capacitación',
    metodologia: '5_WHYS',
    estado: 'ABIERTA',
    prioridad: 'MEDIA'
  },
  Queja: {
    folio: 'Q-001',
    entidad_id: 'ent-1',
    canal: 'TELEFONO',
    fecha_recepcion: '2026-11-20',
    clasificacion: 'GARANTIA',
    descripcion: 'Producto con falla',
    estado: 'RECIBIDA'
  },
  Evaluación: {
    proveedor_id: 'prov-1',
    periodo: '2026-11',
    evaluado_por: 'emp-1',
    calidad: 90,
    entrega: 85,
    precio: '80',
    servicio: 95,
    clasificacion: 'APROBADO'
  }
};

describe('document type metadata', () => {
  it('defines the six document types with one schema each', () => {
    expect(DOCUMENT_TYPES).toEqual(['NCR', 'Inspección', 'Auditoría', 'CAPA', 'Queja', 'Evaluación']);
    expect(Object.keys(DOCUMENT_TYPE_META)).toEqual(DOCUMENT_TYPES);
    for (const type of DOCUMENT_TYPES) {
      const meta = getDocumentTypeSchema(type);
      expect(meta).toBe(DOCUMENT_TYPE_META[type]);
      expect(typeof meta.label).toBe('string');
      expect(Array.isArray(meta.fields)).toBe(true);
      expect(Array.isArray(meta.statuses)).toBe(true);
      expect(meta.transitions).toBeTypeOf('object');
      for (const field of meta.fields) {
        expect(field).toHaveProperty('key');
        expect(field).toHaveProperty('label');
        expect(['text', 'number', 'date', 'select']).toContain(field.type);
        if (field.type === 'select') expect(Array.isArray(field.options)).toBe(true);
      }
    }
  });

  it('exposes the expected labels and statuses per type', () => {
    expect(DOCUMENT_TYPE_META.NCR.label).toBe('No Conformidad');
    expect(DOCUMENT_TYPE_META.NCR.statuses).toEqual(['ABIERTA', 'EN_INVESTIGACION', 'EN_CAPA', 'CERRADA', 'RECHAZADA']);
    expect(DOCUMENT_TYPE_META.Inspección.statuses).toEqual(['REGISTRADA', 'ACEPTADO', 'RECHAZADO', 'CONDICIONADO']);
    expect(DOCUMENT_TYPE_META.Auditoría.statuses).toEqual(['PLANIFICADA', 'EN_PROCESO', 'FINALIZADA', 'CERRADA']);
    expect(DOCUMENT_TYPE_META.CAPA.statuses).toEqual(['ABIERTA', 'EN_EJECUCION', 'EN_VERIFICACION', 'CERRADA_EFECTIVA', 'CERRADA_NO_EFECTIVA']);
    expect(DOCUMENT_TYPE_META.Queja.statuses).toEqual(['RECIBIDA', 'EN_INVESTIGACION', 'RESUELTA', 'CERRADA']);
    expect(DOCUMENT_TYPE_META.Evaluación.statuses).toEqual(['BORRADOR', 'FINALIZADA']);
  });

  it('declares the domain labels for every enum group', () => {
    expect(Object.keys(DOMAIN_LABELS)).toEqual([
      'ncrStatuses',
      'inspectionTypes',
      'inspectionResults',
      'auditTypes',
      'auditStatuses',
      'capaTypes',
      'capaStatuses',
      'quejaCanales',
      'quejaClasificacion',
      'quejaStatuses',
      'evaluacionClasificacion'
    ]);
    expect(DOMAIN_LABELS.ncrStatuses.ABIERTA).toBe('Abierta');
    expect(DOMAIN_LABELS.ncrStatuses.EN_INVESTIGACION).toBe('En investigación');
    expect(DOMAIN_LABELS.ncrStatuses.EN_CAPA).toBe('En CAPA');
    expect(DOMAIN_LABELS.inspectionTypes.RECEPCION).toBe('Recepción');
    expect(DOMAIN_LABELS.inspectionResults.ACEPTADO).toBe('Aceptado');
    expect(DOMAIN_LABELS.auditTypes.PROVEEDOR).toBe('Proveedor');
    expect(DOMAIN_LABELS.auditStatuses.EN_PROCESO).toBe('En proceso');
    expect(DOMAIN_LABELS.capaTypes.CORRECTIVA).toBe('Correctiva');
    expect(DOMAIN_LABELS.capaStatuses.CERRADA_EFECTIVA).toBe('Cerrada efectiva');
    expect(DOMAIN_LABELS.quejaCanales.TELEFONO).toBe('Teléfono');
    expect(DOMAIN_LABELS.quejaClasificacion.GARANTIA).toBe('Garantía');
    expect(DOMAIN_LABELS.quejaStatuses.RESUELTA).toBe('Resuelta');
    expect(DOMAIN_LABELS.evaluacionClasificacion.SUSPENDIDO).toBe('Suspendido');
  });

  it('returns null schemas and unchanged labels for unknown types', () => {
    expect(getDocumentTypeSchema('Desconocido')).toBeNull();
    expect(relabelDocumentType('NCR')).toBe('No Conformidad');
    expect(relabelDocumentType('CAPA')).toBe('CAPA');
    expect(relabelDocumentType('Desconocido')).toBe('Desconocido');
  });
});

describe('status transitions', () => {
  it('returns all statuses when no current status is given', () => {
    for (const type of DOCUMENT_TYPES) {
      expect(getTypeStatusOptions(type)).toEqual(DOCUMENT_TYPE_META[type].statuses);
      expect(getTypeStatusOptions(type, '')).toEqual(DOCUMENT_TYPE_META[type].statuses);
    }
  });

  it('returns the current status followed by its allowed next statuses', () => {
    expect(getTypeStatusOptions('NCR', 'ABIERTA')).toEqual(['ABIERTA', 'EN_INVESTIGACION', 'RECHAZADA']);
    expect(getTypeStatusOptions('NCR', 'EN_INVESTIGACION')).toEqual(['EN_INVESTIGACION', 'EN_CAPA', 'CERRADA', 'RECHAZADA']);
    expect(getTypeStatusOptions('NCR', 'EN_CAPA')).toEqual(['EN_CAPA', 'CERRADA', 'RECHAZADA']);
    expect(getTypeStatusOptions('Inspección', 'REGISTRADA')).toEqual(['REGISTRADA', 'ACEPTADO', 'RECHAZADO', 'CONDICIONADO']);
    expect(getTypeStatusOptions('Auditoría', 'PLANIFICADA')).toEqual(['PLANIFICADA', 'EN_PROCESO']);
    expect(getTypeStatusOptions('CAPA', 'EN_VERIFICACION')).toEqual(['EN_VERIFICACION', 'CERRADA_EFECTIVA']);
    expect(getTypeStatusOptions('Queja', 'EN_INVESTIGACION')).toEqual(['EN_INVESTIGACION', 'RESUELTA']);
    expect(getTypeStatusOptions('Evaluación', 'BORRADOR')).toEqual(['BORRADOR', 'FINALIZADA']);
  });

  it('rejects closing an NCR directly from ABIERTA', () => {
    expect(getTypeStatusOptions('NCR', 'ABIERTA')).not.toContain('CERRADA');
    expect(DOCUMENT_TYPE_META.NCR.transitions.ABIERTA).not.toContain('CERRADA');
    expect(getTypeStatusOptions('NCR', 'CERRADA')).toEqual(['CERRADA']);
    expect(getTypeStatusOptions('Inspección', 'ACEPTADO')).toEqual(['ACEPTADO']);
  });

  it('returns no options for an unknown type', () => {
    expect(getTypeStatusOptions('Desconocido')).toEqual([]);
    expect(getTypeStatusOptions('Desconocido', 'ABIERTA')).toEqual([]);
  });
});

describe('typed document validation', () => {
  it('accepts a valid document of each type', () => {
    for (const type of DOCUMENT_TYPES) {
      const result = validateTypedDocument(type, validDocuments[type]);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual({});
    }
  });

  it('reports missing required fields for every type', () => {
    for (const type of DOCUMENT_TYPES) {
      const result = validateTypedDocument(type, {});
      expect(result.valid).toBe(false);
      const required = DOCUMENT_TYPE_META[type].fields.filter(field => field.required).map(field => field.key);
      expect(Object.keys(result.errors).sort()).toEqual(required.sort());
      for (const message of Object.values(result.errors)) expect(message).toContain('obligatorio');
    }
  });

  it('rejects enum values outside the declared options', () => {
    expect(validateTypedDocument('NCR', { ...validDocuments.NCR, origen: 'OTRO' }).errors.origen).toMatch(/válida/);
    expect(validateTypedDocument('NCR', { ...validDocuments.NCR, estado: 'CERRADA_NO_EFECTIVA' }).errors.estado).toMatch(/válida/);
    expect(validateTypedDocument('Inspección', { ...validDocuments.Inspección, resultado: 'PENDIENTE' }).errors.resultado).toMatch(/válida/);
    expect(validateTypedDocument('Auditoría', { ...validDocuments.Auditoría, tipo: 'EXTERNA' }).errors.tipo).toMatch(/válida/);
    expect(validateTypedDocument('CAPA', { ...validDocuments.CAPA, metodologia: 'OTRA' }).errors.metodologia).toMatch(/válida/);
    expect(validateTypedDocument('CAPA', { ...validDocuments.CAPA, prioridad: 'URGENTE' }).errors.prioridad).toMatch(/válida/);
    expect(validateTypedDocument('Queja', { ...validDocuments.Queja, canal: 'CHAT' }).errors.canal).toMatch(/válida/);
    expect(validateTypedDocument('Evaluación', { ...validDocuments.Evaluación, clasificacion: 'PENDIENTE' }).errors.clasificacion).toMatch(/válida/);
  });

  it('rejects invalid dates and accepts real calendar dates', () => {
    expect(validateTypedDocument('NCR', { ...validDocuments.NCR, fecha_deteccion: '2026-13-45' }).errors.fecha_deteccion).toMatch(/fecha válida/);
    expect(validateTypedDocument('Inspección', { ...validDocuments.Inspección, fecha_inspeccion: '2026-02-30' }).errors.fecha_inspeccion).toMatch(/fecha válida/);
    expect(validateTypedDocument('Auditoría', { ...validDocuments.Auditoría, fecha_fin: '2026/11/20' }).errors.fecha_fin).toMatch(/fecha válida/);
    expect(validateTypedDocument('CAPA', { ...validDocuments.CAPA, fecha_objetivo: '2026-11-31' }).errors.fecha_objetivo).toMatch(/fecha válida/);
    expect(validateTypedDocument('Queja', { ...validDocuments.Queja, fecha_recepcion: '2026-04-31' }).errors.fecha_recepcion).toMatch(/fecha válida/);
    expect(validateTypedDocument('NCR', { ...validDocuments.NCR, fecha_deteccion: '2024-02-29' }).valid).toBe(true);
  });

  it('enforces the 0-100 score range and numeric values in Evaluación', () => {
    expect(validateTypedDocument('Evaluación', { ...validDocuments.Evaluación, calidad: 101 }).errors.calidad).toContain('entre 0 y 100');
    expect(validateTypedDocument('Evaluación', { ...validDocuments.Evaluación, entrega: -1 }).errors.entrega).toContain('entre 0 y 100');
    expect(validateTypedDocument('Evaluación', { ...validDocuments.Evaluación, precio: 'abc' }).errors.precio).toContain('número');
    expect(validateTypedDocument('Evaluación', { ...validDocuments.Evaluación, servicio: 0 }).valid).toBe(true);
    expect(validateTypedDocument('Evaluación', { ...validDocuments.Evaluación, calidad: 100 }).valid).toBe(true);
  });

  it('enforces the YYYY-MM period format', () => {
    expect(validateTypedDocument('Evaluación', { ...validDocuments.Evaluación, periodo: '2026-13' }).errors.periodo).toContain('YYYY-MM');
    expect(validateTypedDocument('Evaluación', { ...validDocuments.Evaluación, periodo: 'noviembre 2026' }).errors.periodo).toContain('YYYY-MM');
    expect(validateTypedDocument('Evaluación', { ...validDocuments.Evaluación, periodo: '2026-01' }).valid).toBe(true);
  });

  it('rejects an unknown document type', () => {
    expect(validateTypedDocument('Desconocido', {})).toEqual({ valid: false, errors: { type: 'Tipo de documento desconocido' } });
  });

  it('declares the CAPA prioridad default', () => {
    const prioridad = DOCUMENT_TYPE_META.CAPA.fields.find(field => field.key === 'prioridad');
    expect(prioridad.default).toBe('MEDIA');
  });
});
