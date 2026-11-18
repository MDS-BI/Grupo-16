import { describe, it, expect } from 'vitest';
import { emptyDB, upsert, validate, remove, dependencies, search, stats, STATUS, TRANSITIONS } from '../src/store.js';
import { createDemo } from '../src/demo-data.js';

const product = (db, code = 'PR-1') => upsert(db, 'producto', { codigo: code, descripcion: 'Producto de prueba' });
const lot = (db, p, code = 'LOT-1') => upsert(db, 'lote', { codigo: code, productoId: p.id, fabricacion: '2026-01-01', caducidad: '2028-01-01' });

describe('calidad store', () => {
  it('inicia vacío con siete catálogos', () => {
    const db = emptyDB();
    expect(Object.keys(db)).toHaveLength(8);
    expect(db.producto).toEqual([]);
    expect(db.capa).toEqual([]);
  });

  it('genera códigos internos únicos', () => {
    const db = emptyDB();
    const a = product(db);
    const b = product(db, 'PR-2');
    expect(a.id).not.toBe(b.id);
    expect(a.id).toMatch(/^producto-\d{4}$/);
  });

  it('impide códigos duplicados por tipo', () => {
    const db = emptyDB();
    product(db);
    expect(() => product(db)).toThrow(/código ya existe/i);
  });

  it('permite mismo código entre tipos diferentes', () => {
    const db = emptyDB();
    product(db);
    upsert(db, 'area', { codigo: 'PR-1', nombre: 'Área' });
    expect(db.area).toHaveLength(1);
  });

  it('requiere campos obligatorios', () => {
    const db = emptyDB();
    expect(validate(db, 'producto', { codigo: '' }).codigo).toBeTruthy();
    expect(validate(db, 'producto', { codigo: 'X' }).descripcion).toBeTruthy();
  });

  it('impide lote sin producto válido', () => {
    const db = emptyDB();
    expect(() => upsert(db, 'lote', { codigo: 'LOT', productoId: 'none' })).toThrow(/producto válido/i);
  });

  it('impide caducidad anterior a fabricación', () => {
    const db = emptyDB();
    const p = product(db);
    expect(() => upsert(db, 'lote', { codigo: 'LOT', productoId: p.id, fabricacion: '2027-01-01', caducidad: '2026-01-01' })).toThrow(/caducidad/i);
  });

  it('guarda relaciones e inspecciones', () => {
    const db = emptyDB();
    const p = product(db);
    const l = lot(db, p);
    upsert(db, 'inspeccion', { codigo: 'INS', loteId: l.id, resultado: 'Aprobado' });
    expect(db.inspeccion).toHaveLength(1);
    expect(db.inspeccion[0].loteId).toBe(l.id);
  });

  it('NCR inicia abierta', () => {
    const db = emptyDB();
    const p = product(db);
    const l = lot(db, p);
    const n = upsert(db, 'ncr', { codigo: 'NCR', loteId: l.id, descripcion: 'Hallazgo', severidad: 'Alta' });
    expect(n.estado).toBe('ABIERTA');
  });

  it('NCR no puede cerrar saltándose el ciclo de vida', () => {
    const db = emptyDB();
    const p = product(db);
    const l = lot(db, p);
    const n = upsert(db, 'ncr', { codigo: 'NCR', loteId: l.id, descripcion: 'Hallazgo', severidad: 'Alta' });
    expect(() => upsert(db, 'ncr', { estado: 'CERRADA' }, n.id)).toThrow(/transición no permitida/i);
    expect(db.ncr[0].estado).toBe('ABIERTA');
  });

  it('NCR permite transición válida', () => {
    const db = emptyDB();
    const p = product(db);
    const l = lot(db, p);
    const n = upsert(db, 'ncr', { codigo: 'NCR', loteId: l.id, descripcion: 'Hallazgo', severidad: 'Alta' });
    upsert(db, 'ncr', { estado: 'EN_INVESTIGACION' }, n.id);
    expect(db.ncr[0].estado).toBe('EN_INVESTIGACION');
  });

  it('cascada elimina dependientes', () => {
    const db = emptyDB();
    const p = product(db);
    const l = lot(db, p);
    const n = upsert(db, 'ncr', { codigo: 'NCR', loteId: l.id, descripcion: 'Hallazgo', severidad: 'Alta' });
    upsert(db, 'capa', { codigo: 'C-1', ncrId: n.id, accion: 'Revisar', responsable: 'Equipo' });
    expect(dependencies(db, 'producto', p.id)).toHaveLength(1);
    remove(db, 'producto', p.id, 'cascade');
    expect(stats(db).maestros).toBe(0);
    expect(stats(db).operativos).toBe(0);
  });

  it('sin cascada bloquea eliminación de registro vinculado', () => {
    const db = emptyDB();
    const p = product(db);
    lot(db, p);
    expect(() => remove(db, 'producto', p.id)).toThrow(/registros relacionados/i);
  });

  it('edita un producto sin perder ID', () => {
    const db = emptyDB();
    const p = product(db);
    const x = upsert(db, 'producto', { descripcion: 'Actualizado' }, p.id);
    expect(x.id).toBe(p.id);
    expect(x.descripcion).toBe('Actualizado');
  });

  it('busca en todos los catálogos', () => {
    const db = emptyDB();
    product(db, 'PR-ABC');
    expect(search(db, 'abc')).toHaveLength(1);
    expect(search(db, 'abc')[0]._tipo).toBe('producto');
  });

  it('demo contiene siete tipos y vínculos válidos', () => {
    const db = createDemo();
    expect(Object.keys(db)).toHaveLength(8);
    expect(db.producto).toHaveLength(2);
    expect(db.lote).toHaveLength(2);
    expect(db.ncr).toHaveLength(2);
    expect(db.capa).toHaveLength(1);
    for (const lote of db.lote) expect(db.producto.some(p => p.id === lote.productoId)).toBe(true);
    for (const ncr of db.ncr) expect(db.lote.some(l => l.id === ncr.loteId)).toBe(true);
  });

  it('estadísticas coherentes con demo', () => {
    const x = stats(createDemo());
    expect(x.maestros).toBe(8);
    expect(x.operativos).toBe(5);
    expect(x.ncrAbiertas).toBe(2);
    expect(x.capaPendientes).toBe(1);
  });

  it('estados tienen transiciones definidas', () => {
    for (const x of STATUS) expect(Array.isArray(TRANSITIONS[x])).toBe(true);
  });

  it('CAPA exige NCR, acción y responsable', () => {
    const db = emptyDB();
    expect(validate(db, 'capa', { codigo: 'C-1' }).ncrId).toBeTruthy();
    expect(validate(db, 'capa', { codigo: 'C-1' }).accion).toBeTruthy();
    expect(validate(db, 'capa', { codigo: 'C-1' }).responsable).toBeTruthy();
  });
});
