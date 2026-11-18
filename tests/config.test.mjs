import { describe, it, expect } from 'vitest';
import { normalizeConfig, DEFAULT_CONFIG } from '../src/module-config.js';
import { emptyDB, configureStore, upsert, validate, TYPES, STATUS, TRANSITIONS } from '../src/store.js';

describe('configuración del módulo', () => {
  it('usa los valores predeterminados sin configuración', () => {
    const { config, errors } = normalizeConfig(null);
    expect(errors).toEqual([]);
    expect(config.moduleName).toBe(DEFAULT_CONFIG.moduleName);
    expect(config.customFields).toHaveLength(DEFAULT_CONFIG.customFields.length);
  });

  it('reporta un color de acento inválido y conserva el predeterminado', () => {
    const { config, errors } = normalizeConfig({ theme: { accentColor: 'azul' } });
    expect(errors.join(' ')).toMatch(/accentColor/);
    expect(config.theme.accentColor).toBe(DEFAULT_CONFIG.theme.accentColor);
  });

  it('reporta targets y tipos de campo desconocidos', () => {
    const { errors } = normalizeConfig({
      customFields: [
        { target: 'inexistente', key: 'x', label: 'X', type: 'text' },
        { target: 'producto', key: 'y', label: 'Y', type: 'magic' }
      ]
    });
    expect(errors).toHaveLength(2);
  });

  it('declara campos personalizados y valida obligatorios y tipos', () => {
    configureStore({
      customFields: [
        { target: 'producto', key: 'origen', label: 'Origen', type: 'text' },
        { target: 'producto', key: 'peso', label: 'Peso', type: 'decimal', required: true },
        { target: 'producto', key: 'revisado', label: 'Revisado', type: 'boolean' },
        { target: 'producto', key: 'fechaRevision', label: 'Fecha revisión', type: 'date' }
      ]
    });
    const db = emptyDB();
    expect(TYPES.producto.fields.some(([key]) => key === 'peso')).toBe(true);
    const errors = validate(db, 'producto', { codigo: 'P-1', descripcion: 'Producto', peso: '', revisado: 'Tal vez', fechaRevision: '2026/01/01' });
    expect(errors.peso).toMatch(/obligatorio/);
    expect(errors.revisado).toMatch(/Sí o No/);
    expect(errors.fechaRevision).toMatch(/fecha válida/);
    expect(() => upsert(db, 'producto', { codigo: 'P-2', descripcion: 'Producto', peso: -1 })).toThrow(/decimal no negativo/);
  });

  it('valida la fecha objetivo opcional de los datos maestros', () => {
    const db = emptyDB();
    expect(validate(db, 'area', { codigo: 'A-1', nombre: 'Área', fechaObjetivo: '2026-13-40' }).fechaObjetivo).toBeTruthy();
    expect(validate(db, 'area', { codigo: 'A-1', nombre: 'Área', fechaObjetivo: '2026-12-31' }).fechaObjetivo).toBeUndefined();
  });

  it('aplica el ciclo de vida configurado a las NCR', () => {
    configureStore({
      statusLifecycle: {
        statuses: ['REGISTRADA', 'EN_ANALISIS', 'CERRADA'],
        transitions: { REGISTRADA: ['EN_ANALISIS'], EN_ANALISIS: ['CERRADA'], CERRADA: [] }
      }
    });
    expect(STATUS).toEqual(['REGISTRADA', 'EN_ANALISIS', 'CERRADA']);
    expect(TRANSITIONS.REGISTRADA).toEqual(['EN_ANALISIS']);
  });
});
