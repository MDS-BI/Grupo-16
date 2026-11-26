import { describe, it, expect } from 'vitest';
import { dashboardCounts } from '../../src/components/dashboard.js';

describe('dashboardCounts - HU3 KPI contract', () => {
  it('returns seven non-negative integer counters for empty lists', () => {
    const counts = dashboardCounts([], []);
    expect(counts).toEqual({
      areas: 0,
      employees: 0,
      products: 0,
      lots: 0,
      activeLots: 0,
      inspections: 0,
      openFindings: 0
    });
    Object.values(counts).forEach(value => {
      expect(Number.isInteger(value)).toBe(true);
      expect(value).toBeGreaterThanOrEqual(0);
    });
  });

  it('classifies master rows and quality entities without double counting', () => {
    const entities = [
      { masterType: 'lot', name: 'Lote A', code: 'L-1' },
      { tipoItem: 'Producto', name: 'Producto A', code: 'P-1' },
      { masterType: 'area', nombre: 'Área A' },
      { masterType: 'employee', nombre: 'Empleado A' }
    ];
    const counts = dashboardCounts(entities, []);
    expect(counts.lots).toBe(1);
    expect(counts.products).toBe(1);
    expect(counts.areas).toBe(1);
    expect(counts.employees).toBe(1);
    expect(counts.activeLots).toBe(1);
  });

  it('excludes inactive and closed lots from activeLots', () => {
    const entities = [
      { masterType: 'lot', activo: false },
      { masterType: 'lot', estado: 'Cerrado' },
      { masterType: 'lot', status: 'inactivo' },
      { masterType: 'lot', estado: 'En curso' }
    ];
    const counts = dashboardCounts(entities, []);
    expect(counts.lots).toBe(4);
    expect(counts.activeLots).toBe(1);
  });

  it('counts all inspections regardless of status', () => {
    const documents = [
      { tipoDoc: 'Inspección', status: 'ACEPTADO' },
      { tipoDoc: 'Inspección', status: 'RECHAZADO' },
      { tipoDoc: 'Inspección' }
    ];
    expect(dashboardCounts([], documents).inspections).toBe(3);
  });

  it('counts only open NCR and CAPA records', () => {
    const documents = [
      { tipoDoc: 'NCR', status: 'ABIERTA' },
      { tipoDoc: 'NCR', status: 'EN_INVESTIGACIÓN' },
      { tipoDoc: 'CAPA', status: 'EN_CAPA' },
      { tipoDoc: 'NCR', status: 'CERRADA' },
      { tipoDoc: 'NCR', status: 'RECHAZADA' },
      { tipoDoc: 'CAPA', status: 'Completada' },
      { tipoDoc: 'NCR' }
    ];
    expect(dashboardCounts([], documents).openFindings).toBe(4);
  });

  it('is pure and stable across repeated calls', () => {
    const entities = [{ masterType: 'lot', name: 'Lote A' }];
    const documents = [{ docType: 'NCR', status: 'ABIERTA' }];
    const snapshot = JSON.stringify({ entities, documents });
    const first = dashboardCounts(entities, documents);
    const second = dashboardCounts(entities, documents);
    expect(second).toEqual(first);
    expect(JSON.stringify({ entities, documents })).toBe(snapshot);
  });

  it('keeps counters valid when fields have unexpected types', () => {
    const entities = [{ masterType: 'lot', activo: null, estado: 123 }];
    const documents = [{ docType: 'NCR', status: null }];
    const counts = dashboardCounts(entities, documents);
    expect(counts.activeLots).toBe(1);
    expect(counts.openFindings).toBe(1);
    Object.values(counts).forEach(value => expect(Number.isFinite(value)).toBe(true));
  });
});
