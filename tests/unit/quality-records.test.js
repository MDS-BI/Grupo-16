import { beforeEach, describe, expect, it } from 'vitest';
import { setActiveConfig } from '../../src/module-config.js';
import { addEntity, updateEntity, deleteEntity, loadEntities, addDocument, updateDocument, loadDocuments, validateDocument } from '../../src/storage.js';

const store = new Map();
globalThis.localStorage = {
  getItem: key => store.get(key) ?? null,
  setItem: (key, value) => store.set(key, String(value)),
  removeItem: key => store.delete(key)
};
beforeEach(() => { store.clear(); setActiveConfig(null); });
const master = (type = 'PRODUCTO', extra = {}) => addEntity({name: 'Registro', code: 'Q-1', entityType: type, ...extra});
const record = (entity, extra = {}) => addDocument({entityId: entity.entity_id, folio: 1, startDate: '2026-11-03', endDate: '2026-11-04', ...extra});

describe('HU2 · datos maestros de calidad', () => {
  it('conserva identidad, fecha de creación y registros vinculados al corregir un lote', () => {
    const product = master();
    const lot = master('LOTE', {name: 'Lote 16', code: 'L-16', productId: product.entity_id});
    const inspection = record(lot);
    const changed = updateEntity(lot.id, {name: 'Lote corregido', entity_id: 'otro', createdAt: 'otro'});
    expect(changed).toMatchObject({id: lot.id, entity_id: lot.entity_id, createdAt: lot.createdAt, name: 'Lote corregido', productId: product.entity_id});
    expect(loadDocuments()).toEqual([inspection]);
  });

  it('rechaza una edición inválida y conserva la última versión guardada', () => {
    const product = master();
    expect(() => updateEntity(product.id, {name: ''})).toThrow(/obligatorio/);
    expect(loadEntities()).toEqual([product]);
  });

  it.each([['AREA', 'EMPLEADO', 'areaId'], ['PRODUCTO', 'LOTE', 'productId']])('elimina %s, sus %s y sus registros operativos sin afectar otros maestros', (parentType, childType, field) => {
    const parent = master(parentType);
    const child = master(childType, {[field]: parent.entity_id});
    const other = master();
    record(parent);
    record(child);
    const retained = record(other);
    deleteEntity(parent.id);
    expect(loadEntities()).toEqual([other]);
    expect(loadDocuments()).toEqual([retained]);
  });

  it('impide referencias a áreas o productos inexistentes o de tipo incorrecto', () => {
    const product = master();
    expect(() => master('LOTE', {productId: 'no-existe'})).toThrow(/Producto/);
    expect(() => master('EMPLEADO', {areaId: product.entity_id})).toThrow(/Área/);
    expect(loadEntities()).toEqual([product]);
  });

  it('no permite convertir un producto con lotes en otro tipo de maestro', () => {
    const product = master();
    master('LOTE', {productId: product.entity_id});
    expect(() => updateEntity(product.id, {entityType: 'AREA'})).toThrow(/dependientes/);
    expect(loadEntities()[0].entityType).toBe('PRODUCTO');
  });

  it('no permite convertir un producto en un lote dependiente de sí mismo', () => {
    const product = master();
    expect(() => updateEntity(product.id, {entityType: 'LOTE', productId: product.entity_id})).toThrow(/Producto/);
    expect(loadEntities()).toEqual([product]);
  });

  it('edita y elimina en una colección de 500 registros sin perder los demás', () => {
    const records = Array.from({length: 500}, (_, index) => master('PRODUCTO', {code: `P-${index}`}));
    updateEntity(records[250].id, {name: 'Producto corregido'});
    deleteEntity(records[499].id);
    expect(loadEntities()).toHaveLength(499);
    expect(loadEntities()[250]).toMatchObject({id: records[250].id, name: 'Producto corregido'});
    expect(loadEntities().slice(0, 250)).toEqual(records.slice(0, 250));
  });
});

describe('HU10 · inspecciones, NCR y CAPA', () => {
  it('guarda resultado, tipo y cantidades de una inspección y conserva el maestro al editar', () => {
    const product = master();
    const inspection = record(product, {recordType: 'INSPECCION', inspectionType: 'FINAL', inspectionResult: 'RECHAZADO', inspectedQuantity: '20', rejectedQuantity: '2'});
    const changed = updateDocument(inspection.id, {inspectionResult: 'CONDICIONADO'});
    expect(changed).toMatchObject({id: inspection.id, entity_id: product.entity_id, recordType: 'INSPECCION', inspectedQuantity: 20, rejectedQuantity: 2, inspectionResult: 'CONDICIONADO'});
  });

  it('rechaza una inspección con más rechazos que unidades revisadas', () => {
    const product = master();
    expect(() => record(product, {recordType: 'INSPECCION', inspectionType: 'FINAL', inspectionResult: 'RECHAZADO', inspectedQuantity: 2, rejectedQuantity: 3})).toThrow(/superar/);
    expect(loadDocuments()).toEqual([]);
  });

  it('exige origen, gravedad y hallazgo para una NCR', () => {
    const product = master();
    expect(() => record(product, {recordType: 'NCR'})).toThrow(/obligatorio/);
    const ncr = record(product, {recordType: 'NCR', origin: 'Línea 2', severity: 'ALTA', finding: 'Sello incompleto'});
    expect(loadDocuments()[0]).toEqual(ncr);
  });

  it('valida responsable y fecha compromiso de una CAPA', () => {
    const product = master();
    const values = {recordType: 'CAPA', actionType: 'CORRECTIVA', actionDescription: 'Ajustar selladora', responsible: 'Mantenimiento', dueDate: '2026-11-02'};
    expect(() => record(product, values)).toThrow(/fecha compromiso/i);
    expect(record(product, {...values, dueDate: '2026-11-05'})).toMatchObject({responsible: 'Mantenimiento', dueDate: '2026-11-05'});
  });

  it('no reasigna silenciosamente un registro operativo al editarlo', () => {
    const first = master();
    const other = master();
    const doc = record(first);
    expect(() => updateDocument(doc.id, {entityId: other.entity_id})).toThrow(/origen/);
    expect(loadDocuments()).toEqual([doc]);
  });

  it('limpia los campos del tipo anterior y mantiene los campos personalizados configurados', () => {
    setActiveConfig({customFields: [{target: 'document', key: 'turno', label: 'Turno', type: 'text', required: true}]});
    const product = master();
    const doc = record(product, {recordType: 'NCR', origin: 'Proceso', severity: 'ALTA', finding: 'Falla', turno: 'Noche'});
    const changed = updateDocument(doc.id, {recordType: 'INSPECCION', inspectionType: 'FINAL', inspectionResult: 'ACEPTADO'});
    expect(changed.turno).toBe('Noche');
    expect(changed.origin).toBeUndefined();
    expect(changed.finding).toBeUndefined();
    expect(() => updateDocument(doc.id, {turno: ''})).toThrow(/Turno/);
  });

  it('no admite tipos desconocidos ni valores numéricos no finitos', () => {
    const product = master();
    const base = {entityId: product.entity_id, folio: 1, startDate: '2026-11-03', endDate: '2026-11-04'};
    expect(validateDocument({...base, recordType: 'constructor'}).valid).toBe(false);
    expect(validateDocument({...base, recordType: 'INSPECCION', inspectionType: 'FINAL', inspectionResult: 'ACEPTADO', inspectedQuantity: Infinity}).valid).toBe(false);
  });
});
