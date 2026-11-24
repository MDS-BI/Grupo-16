import { describe, it, expect } from 'vitest';
import {
  ACTION_TYPES,
  isValidTargetDate,
  validateTargetDate,
  daysUntilTargetDate,
  getTargetDateStatus,
  compareByTargetDate,
  sortTrackingRecords,
  filterByStatus,
  formatTargetDate
} from '../../src/target-date.js';

const today = new Date(2026, 10, 24);

describe('target date utilities', () => {
  it('defines the five allowed action types', () => {
    expect(ACTION_TYPES).toEqual(['Inspección', 'Reinspección', 'Calibración', 'Auditoría', 'Capacitación']);
  });

  it('validates the ISO date format and rejects impossible dates', () => {
    expect(isValidTargetDate('2026-12-10')).toBe(true);
    expect(isValidTargetDate('2026-13-45')).toBe(false);
    expect(isValidTargetDate('')).toBe(false);
    expect(validateTargetDate('2026-13-45')).toContain('inválida');
    expect(validateTargetDate('')).toBeNull();
  });

  it('counts days relative to today without timezone drift', () => {
    expect(daysUntilTargetDate('2026-12-02', today)).toBe(8);
    expect(daysUntilTargetDate('2026-12-01', today)).toBe(7);
    expect(daysUntilTargetDate('2026-11-24', today)).toBe(0);
    expect(daysUntilTargetDate('2026-11-23', today)).toBe(-1);
    expect(daysUntilTargetDate('2026-13-45', today)).toBeNull();
  });

  it('maps boundaries to green, yellow, red, completed and no date', () => {
    expect(getTargetDateStatus({ targetDate: '2026-12-02' }, today)).toBe('verde');
    expect(getTargetDateStatus({ targetDate: '2026-12-01' }, today)).toBe('amarillo');
    expect(getTargetDateStatus({ targetDate: '2026-11-24' }, today)).toBe('amarillo');
    expect(getTargetDateStatus({ targetDate: '2026-11-23' }, today)).toBe('rojo');
    expect(getTargetDateStatus({ targetDate: '2026-11-23', completed: true }, today)).toBe('completada');
    expect(getTargetDateStatus({ targetDate: '' }, today)).toBe('sin-fecha');
  });

  it('sorts overdue records first and records without a date last', () => {
    const records = [
      { name: 'Sin fecha', targetDate: '' },
      { name: 'Verde', targetDate: '2026-12-10' },
      { name: 'Rojo', targetDate: '2026-11-20' },
      { name: 'Amarillo', targetDate: '2026-11-30' }
    ];
    const sorted = sortTrackingRecords(records, 'date', today);
    expect(sorted.map(r => r.name)).toEqual(['Rojo', 'Amarillo', 'Verde', 'Sin fecha']);
    expect(records[0].name).toBe('Sin fecha');
  });

  it('filters records by derived status', () => {
    const records = [
      { name: 'A', targetDate: '2026-12-10' },
      { name: 'B', targetDate: '2026-11-23' },
      { name: 'C', targetDate: '' }
    ];
    expect(filterByStatus(records, 'rojo', today).map(r => r.name)).toEqual(['B']);
    expect(filterByStatus(records, 'sin-fecha', today).map(r => r.name)).toEqual(['C']);
    expect(filterByStatus(records, 'todos', today).length).toBe(3);
  });

  it('formats dates for display', () => {
    expect(formatTargetDate('2026-12-10')).toBe('10/12/2026');
    expect(formatTargetDate('')).toBe('');
  });

  it('compares two dated records by date', () => {
    expect(compareByTargetDate({ targetDate: '2026-11-30' }, { targetDate: '2026-12-10' }, today)).toBeLessThan(0);
  });
});
