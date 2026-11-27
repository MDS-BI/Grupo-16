import { describe, expect, it } from 'vitest';
import { validateParameter, evaluateMeasurements, filterOrders, ordersCsv, isCalendarDate } from '../../src/quality-parameters.js';

const parameter = { id: 'peso', name: 'Peso', productId: 'p1', unit: 'g', min: 24, max: 26, version: 1 };

describe('HU7 - límites y evidencia', () => {
  it.each([24, 25, 26])('acepta la lectura %s dentro del intervalo inclusivo', value => {
    expect(evaluateMeasurements([parameter], { peso: value }).passed).toBe(true);
  });
  it.each([23.9, 26.1])('rechaza la lectura %s conservando límites, unidad y versión', value => {
    const evaluation = evaluateMeasurements([parameter], { peso: value });
    expect(evaluation.passed).toBe(false);
    expect(evaluation.results[0]).toMatchObject({ value, min: 24, max: 26, unit: 'g', version: 1 });
    expect(evaluation.message).toContain(String(value));
  });
  it.each(['', null, undefined, Infinity, 'abc', true])('no convierte %s en una medición válida', value => {
    expect(() => evaluateMeasurements([parameter], { peso: value })).toThrow();
  });
  it('no acepta una inspección sin parámetros activos', () => {
    expect(() => evaluateMeasurements([], {})).toThrow(/parámetro/);
  });
  it.each([{ min: '', max: 2 }, { min: 3, max: 2 }, { min: 0, max: Infinity }])('valida límites %j', limits => {
    expect(() => validateParameter({ ...parameter, ...limits })).toThrow();
  });
  it('rechaza fechas imposibles en lugar de normalizarlas silenciosamente', () => {
    expect(isCalendarDate('2026-02-30')).toBe(false);
    expect(isCalendarDate('2026-02-28')).toBe(true);
  });
});

describe('HU11 - consulta de órdenes', () => {
  const orders = [
    { number: 'OC-1', productId: 'p1', productName: 'Envase', lotId: 'l1', lotNumber: 'L-1', responsible: 'Ana', dueDate: '2026-11-10', status: 'PENDIENTE' },
    { number: 'OC-2', productId: 'p1', productName: 'Envase', lotId: 'l2', lotNumber: 'L-2', responsible: 'Luis', dueDate: '2026-11-20', status: 'LIBERADA' },
    { number: 'OC-3', productId: 'p2', productName: 'Tapa', lotId: 'l3', lotNumber: 'L-3', responsible: 'Ana', dueDate: '2026-11-30', status: 'RECHAZADA' }
  ];
  it('abre mostrando todas las órdenes', () => expect(filterOrders(orders)).toEqual(orders));
  it('combina filtros parciales, producto, lote, estado y rango inclusivo', () => {
    expect(filterOrders(orders, { query: 'enva', productId: 'p1', lotId: 'l2', status: 'LIBERADA', from: '2026-11-20', to: '2026-11-20' })).toEqual([orders[1]]);
  });
  it('limpiar filtros restaura la lista completa', () => expect(filterOrders(orders, { query: '', status: '' })).toHaveLength(3));
  it('exporta CSV escapado y neutraliza fórmulas de planilla', () => {
    const csv = ordersCsv([{ ...orders[0], number: '=1+1', responsible: 'Ana, "QA"' }]);
    expect(csv).toContain("'=1+1");
    expect(csv).toContain('"Ana, ""QA"""');
  });
});
