import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import {
  MASTER_TYPES,
  MASTER_LABELS,
  clearMasters,
  loadMasters,
  validateMaster,
  addMaster,
  updateMaster,
  deleteMaster,
  findMaster,
  searchMasters
} from '../../src/master-data.js';

const dom = new JSDOM('', { url: 'http://localhost/' });

beforeEach(() => {
  globalThis.localStorage = dom.window.localStorage;
  localStorage.clear();
  clearMasters();
});

function seedArea(overrides = {}) {
  return addMaster('area', { codigo: 'AR-1', nombre: 'Ventas', modulo: 'VENTAS', ...overrides });
}

function seedProduct(overrides = {}) {
  return addMaster('product', { codigo: 'PR-1', descripcion: 'Tornillo', tipo: 'PRODUCTO', unidad_medida: 'PZA', ...overrides });
}

describe('master data constants and storage', () => {
  it('expone los tipos y etiquetas esperados', () => {
    expect(MASTER_TYPES).toEqual(['area', 'employee', 'product', 'lot']);
    expect(MASTER_LABELS).toEqual({
      area: 'Área Organizativa',
      employee: 'Empleado',
      product: 'Producto',
      lot: 'Lote'
    });
  });

  it('devuelve un arreglo vacío para tipos inválidos', () => {
    expect(loadMasters('otro')).toEqual([]);
    expect(findMaster('otro', 'x')).toBeNull();
  });
});

describe('creación de maestros', () => {
  it('crea los cuatro tipos con campos canónicos', () => {
    const area = seedArea();
    const employee = addMaster('employee', {
      numero_nomina: 'NOM-1',
      puesto: 'Analista',
      area_id: area.area_id
    });
    const product = seedProduct();
    const lot = addMaster('lot', {
      producto_id: product.producto_id,
      numero_lote: 'LOTE-1',
      fecha_fabricacion: '2026-01-10'
    });

    expect(area.area_id).toMatch(/^area_/);
    expect(employee.empleado_id).toMatch(/^emp_/);
    expect(product.producto_id).toMatch(/^prod_/);
    expect(lot.lote_id).toMatch(/^lote_/);

    expect(area.activo).toBe(true);
    expect(employee.estado).toBe('ACTIVO');
    expect(product.critico_calidad).toBe(false);
    expect(product.activo).toBe(true);
    expect(lot.fecha_caducidad).toBe('');

    expect(loadMasters('area')).toHaveLength(1);
    expect(loadMasters('employee')).toHaveLength(1);
    expect(loadMasters('product')).toHaveLength(1);
    expect(loadMasters('lot')).toHaveLength(1);
    expect(findMaster('employee', employee.empleado_id).puesto).toBe('Analista');
  });

  it('crea los cuatro tipos con los alias genéricos name y code', () => {
    const area = addMaster('area', { code: 'AR-A', name: 'Compras', modulo: 'ADQUISICION_COMPRAS' });
    const employee = addMaster('employee', { code: 'NOM-A', name: 'Comprador', area_id: area.area_id });
    const product = addMaster('product', { code: 'PR-A', name: 'Tuerca', tipo: 'INSUMO', unidad_medida: 'PZA' });
    const lot = addMaster('lot', {
      code: 'LOTE-A',
      name: 'LOTE-A',
      producto_id: product.producto_id,
      fecha_fabricacion: '2026-02-01'
    });

    expect(area.codigo).toBe('AR-A');
    expect(area.nombre).toBe('Compras');
    expect(employee.numero_nomina).toBe('NOM-A');
    expect(employee.puesto).toBe('Comprador');
    expect(product.codigo).toBe('PR-A');
    expect(product.descripcion).toBe('Tuerca');
    expect(lot.numero_lote).toBe('LOTE-A');
  });
});

describe('validación de maestros', () => {
  it('rechaza campos obligatorios con claves canónicas y mensajes en español', () => {
    expect(validateMaster('area', {}).errors).toMatchObject({
      codigo: expect.stringContaining('obligatorio'),
      nombre: expect.stringContaining('obligatorio'),
      modulo: expect.stringContaining('obligatorio')
    });
    expect(validateMaster('employee', {}).errors).toMatchObject({
      numero_nomina: expect.stringContaining('obligatorio'),
      puesto: expect.stringContaining('obligatorio'),
      area_id: expect.stringContaining('obligatorio')
    });
    expect(validateMaster('product', {}).errors).toMatchObject({
      codigo: expect.stringContaining('obligatorio'),
      descripcion: expect.stringContaining('obligatorio'),
      tipo: expect.stringContaining('obligatorio'),
      unidad_medida: expect.stringContaining('obligatorio')
    });
    expect(validateMaster('lot', {}).errors).toMatchObject({
      producto_id: expect.stringContaining('obligatorio'),
      numero_lote: expect.stringContaining('obligatorio'),
      fecha_fabricacion: expect.stringContaining('obligatorio')
    });

    expect(() => addMaster('area', { nombre: '   ', modulo: 'VENTAS' }))
      .toThrow(/^Validación fallida: /);
  });

  it('rechaza códigos únicos duplicados por tipo', () => {
    seedArea();
    const employeeArea = seedArea({ codigo: 'AR-2', nombre: 'Calidad' });
    addMaster('employee', { numero_nomina: 'NOM-1', puesto: 'Inspector', area_id: employeeArea.area_id });
    seedProduct();
    addMaster('lot', { producto_id: loadMasters('product')[0].producto_id, numero_lote: 'LOTE-1', fecha_fabricacion: '2026-01-10' });

    expect(validateMaster('area', { codigo: 'AR-1', nombre: 'Otra', modulo: 'CRM' }).errors.codigo).toContain('registrado');
    expect(validateMaster('employee', { numero_nomina: 'NOM-1', puesto: 'Otro', area_id: employeeArea.area_id }).errors.numero_nomina).toBeDefined();
    expect(validateMaster('product', { codigo: 'PR-1', descripcion: 'Otro', tipo: 'SERVICIO', unidad_medida: 'PZA' }).errors.codigo).toBeDefined();
    expect(validateMaster('lot', { producto_id: loadMasters('product')[0].producto_id, numero_lote: 'LOTE-1', fecha_fabricacion: '2026-01-10' }).errors.numero_lote).toBeDefined();

    expect(() => addMaster('area', { codigo: 'AR-1', nombre: 'Duplicada', modulo: 'CRM' })).toThrow(/Validación fallida/);
  });

  it('excluye el propio registro al validar duplicados en actualizaciones', () => {
    const area = seedArea();
    expect(validateMaster('area', { area_id: area.area_id, codigo: 'AR-1', nombre: 'Ventas', modulo: 'VENTAS' }).valid).toBe(true);

    const otra = seedArea({ codigo: 'AR-2', nombre: 'Calidad' });
    expect(() => updateMaster('area', otra.area_id, { codigo: 'AR-1' })).toThrow(/Validación fallida/);
    expect(findMaster('area', otra.area_id).codigo).toBe('AR-2');
  });

  it('rechaza FK inexistentes', () => {
    expect(validateMaster('employee', { numero_nomina: 'NOM-1', puesto: 'Analista', area_id: 'area_inexistente' }).errors.area_id).toBeDefined();
    const area = seedArea();
    expect(validateMaster('employee', { numero_nomina: 'NOM-1', puesto: 'Analista', area_id: area.area_id, jefe_id: 'emp_inexistente' }).errors.jefe_id).toBeDefined();
    expect(validateMaster('lot', { producto_id: 'prod_inexistente', numero_lote: 'LOTE-1', fecha_fabricacion: '2026-01-10' }).errors.producto_id).toBeDefined();

    expect(() => addMaster('employee', { numero_nomina: 'NOM-1', puesto: 'Analista', area_id: 'area_inexistente' })).toThrow(/Validación fallida/);
  });

  it('rechaza valores ENUM inválidos', () => {
    expect(validateMaster('area', { codigo: 'AR-1', nombre: 'Ventas', modulo: 'MODULO_FALSO' }).errors.modulo).toContain('válido');
    const area = seedArea();
    expect(validateMaster('employee', { numero_nomina: 'NOM-1', puesto: 'Analista', area_id: area.area_id, estado: 'DESCONOCIDO' }).errors.estado).toContain('válido');
    expect(validateMaster('product', { codigo: 'PR-1', descripcion: 'Tornillo', tipo: 'OTRO', unidad_medida: 'PZA' }).errors.tipo).toContain('válido');

    expect(() => addMaster('product', { codigo: 'PR-1', descripcion: 'Tornillo', tipo: 'OTRO', unidad_medida: 'PZA' })).toThrow(/Validación fallida/);
  });

  it('valida fechas válidas y coherentes', () => {
    const product = seedProduct();
    expect(validateMaster('lot', { producto_id: product.producto_id, numero_lote: 'L-1', fecha_fabricacion: '2026-13-45' }).errors.fecha_fabricacion).toContain('válida');
    expect(validateMaster('lot', {
      producto_id: product.producto_id,
      numero_lote: 'L-2',
      fecha_fabricacion: '2026-05-10',
      fecha_caducidad: '2026-05-09'
    }).errors.fecha_caducidad).toContain('mayor o igual');
    expect(validateMaster('lot', {
      producto_id: product.producto_id,
      numero_lote: 'L-3',
      fecha_fabricacion: '2026-05-10',
      fecha_caducidad: '2026-05-10'
    }).valid).toBe(true);
  });
});

describe('actualización y borrado', () => {
  it('actualiza preservando el id y createdAt', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    const area = seedArea();
    const employee = addMaster('employee', { numero_nomina: 'NOM-1', puesto: 'Analista', area_id: area.area_id });
    const product = seedProduct();
    const lot = addMaster('lot', { producto_id: product.producto_id, numero_lote: 'L-1', fecha_fabricacion: '2026-01-01' });

    vi.setSystemTime(new Date('2026-02-01T00:00:00.000Z'));
    const updatedArea = updateMaster('area', area.area_id, { name: 'Ventas Norte' }, 'Ana');
    const updatedEmployee = updateMaster('employee', employee.empleado_id, { puesto: 'Auditor' }, 'Ana');
    const updatedProduct = updateMaster('product', product.producto_id, { name: 'Tornillo nacional' }, 'Ana');
    const updatedLot = updateMaster('lot', lot.lote_id, { code: 'L-2' }, 'Ana');

    expect(updatedArea.area_id).toBe(area.area_id);
    expect(updatedEmployee.empleado_id).toBe(employee.empleado_id);
    expect(updatedProduct.producto_id).toBe(product.producto_id);
    expect(updatedLot.lote_id).toBe(lot.lote_id);

    for (const [before, after] of [[area, updatedArea], [employee, updatedEmployee], [product, updatedProduct], [lot, updatedLot]]) {
      expect(after.createdAt).toBe(before.createdAt);
      expect(after.updatedAt).not.toBe(before.createdAt);
    }
    expect(updatedArea.nombre).toBe('Ventas Norte');
    expect(updatedEmployee.puesto).toBe('Auditor');
    expect(updatedProduct.descripcion).toBe('Tornillo nacional');
    expect(updatedLot.numero_lote).toBe('L-2');
    expect(updatedArea.updatedBy).toBe('Ana');
    vi.useRealTimers();
  });

  it('lanza error al actualizar un registro inexistente', () => {
    expect(() => updateMaster('area', 'area_inexistente', { nombre: 'X' })).toThrow('Registro no encontrado');
  });

  it('borra en cascada empleados al borrar un área y lotes al borrar un producto', () => {
    const area = seedArea();
    const otraArea = seedArea({ codigo: 'AR-2', nombre: 'Calidad' });
    const product = seedProduct();
    const otroProduct = seedProduct({ codigo: 'PR-2', descripcion: 'Tuerca' });

    addMaster('employee', { numero_nomina: 'NOM-1', puesto: 'Analista', area_id: area.area_id });
    addMaster('employee', { numero_nomina: 'NOM-2', puesto: 'Inspector', area_id: otraArea.area_id });
    addMaster('lot', { producto_id: product.producto_id, numero_lote: 'L-1', fecha_fabricacion: '2026-01-01' });
    addMaster('lot', { producto_id: otroProduct.producto_id, numero_lote: 'L-2', fecha_fabricacion: '2026-01-01' });

    deleteMaster('area', area.area_id);
    deleteMaster('product', product.producto_id);

    expect(loadMasters('employee').map(e => e.numero_nomina)).toEqual(['NOM-2']);
    expect(loadMasters('lot').map(l => l.numero_lote)).toEqual(['L-2']);
    expect(loadMasters('area')).toHaveLength(1);
    expect(loadMasters('product')).toHaveLength(1);
  });

  it('no lanza al borrar registros inexistentes', () => {
    for (const type of MASTER_TYPES) {
      expect(() => deleteMaster(type, 'no_existe', 'Ana')).not.toThrow();
    }
    for (const type of MASTER_TYPES) {
      expect(loadMasters(type)).toEqual([]);
    }
  });
});

describe('búsqueda y limpieza', () => {
  it('busca en los cuatro tipos por nombre, código y campos descriptivos', () => {
    const area = seedArea({ codigo: 'AR-VENTAS', nombre: 'Ventas Norte', modulo: 'VENTAS' });
    const employee = addMaster('employee', { numero_nomina: 'NOM-77', puesto: 'Analista de Calidad', area_id: area.area_id });
    const product = seedProduct({ codigo: 'PROD-88', descripcion: 'Tornillo bronceado', tipo: 'MATERIA_PRIMA' });
    const lot = addMaster('lot', { producto_id: product.producto_id, numero_lote: 'LOTE-99', fecha_fabricacion: '2026-03-01' });

    expect(searchMasters('ventas')[0]).toMatchObject({ area_id: area.area_id, masterType: 'area' });
    expect(searchMasters('NOM-77')[0]).toMatchObject({ empleado_id: employee.empleado_id, masterType: 'employee' });
    expect(searchMasters('analista')[0]).toMatchObject({ empleado_id: employee.empleado_id, masterType: 'employee' });
    expect(searchMasters('bronceado')[0]).toMatchObject({ producto_id: product.producto_id, masterType: 'product' });
    expect(searchMasters('LOTE-99')[0]).toMatchObject({ lote_id: lot.lote_id, masterType: 'lot' });
    expect(searchMasters('no-existe-xyz')).toEqual([]);
    expect(searchMasters('   ').map(r => r.masterType)).toEqual(['area', 'employee', 'product', 'lot']);
  });

  it('clearMasters elimina las cuatro claves de almacenamiento', () => {
    const area = seedArea();
    const employee = addMaster('employee', { numero_nomina: 'NOM-1', puesto: 'Analista', area_id: area.area_id });
    const product = seedProduct();
    addMaster('lot', { producto_id: product.producto_id, numero_lote: 'L-1', fecha_fabricacion: '2026-01-01' });

    const keys = ['quality-areas', 'quality-employees', 'quality-products', 'quality-lots'];
    for (const key of keys) expect(localStorage.getItem(key)).not.toBeNull();

    clearMasters();

    for (const key of keys) expect(localStorage.getItem(key)).toBeNull();
    expect(searchMasters('')).toEqual([]);
    expect(findMaster('employee', employee.empleado_id)).toBeNull();
  });
});
