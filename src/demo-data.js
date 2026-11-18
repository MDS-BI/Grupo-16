import { emptyDB, upsert } from './store.js';

export function createDemo() {
  const db = emptyDB();
  const add = (type, record) => upsert(db, type, record).id;

  const areaProduccion = add('area', { codigo: 'AR-01', nombre: 'Producción', responsable: 'Equipo Turno A', ubicacion: 'Planta principal' });
  const areaCalidad = add('area', { codigo: 'AR-02', nombre: 'Control de calidad', responsable: 'Equipo de laboratorio', ubicacion: 'Laboratorio' });

  add('empleado', { codigo: 'EMP-010', nombre: 'Daniela Rojas', puesto: 'Inspectora', areaId: areaCalidad });
  add('empleado', { codigo: 'EMP-011', nombre: 'Cristóbal Díaz', puesto: 'Supervisor', areaId: areaProduccion });

  const producto1 = add('producto', { codigo: 'PRD-001', descripcion: 'Válvula industrial', tipo: 'Mecánico', unidad: 'unidad', critico: 'Sí', fechaObjetivo: '2027-01-15', origen: 'Proveedor DEMO A' });
  const producto2 = add('producto', { codigo: 'PRD-002', descripcion: 'Sensor de presión', tipo: 'Electrónico', unidad: 'unidad', critico: 'Sí', fechaObjetivo: '2027-02-20', origen: 'Proveedor DEMO B' });

  const lote1 = add('lote', { codigo: 'LOT-2026-101', productoId: producto1, fabricacion: '2026-10-15', caducidad: '2028-10-15', proveedor: 'Proveedor DEMO A', parametrosLote: 'Temperatura 20 °C; humedad 45%', fechaProcesoSugerida: '2026-12-15' });
  const lote2 = add('lote', { codigo: 'LOT-2026-102', productoId: producto2, fabricacion: '2026-11-02', caducidad: '2028-11-02', proveedor: 'Proveedor DEMO B', parametrosLote: 'Calibración previa', fechaProcesoSugerida: '2026-12-20' });

  add('inspeccion', { codigo: 'INS-001', loteId: lote1, fecha: '2026-11-10', inspector: 'Daniela Rojas', resultado: 'Aprobado', observaciones: 'Muestra conforme; datos simulados', metricasFallas: 0, dictamen: 'Aprobación' });
  add('inspeccion', { codigo: 'INS-002', loteId: lote2, fecha: '2026-11-12', inspector: 'Daniela Rojas', resultado: 'Observado', observaciones: 'Desviación de tolerancia; datos simulados', metricasFallas: 3, dictamen: 'Retrabajo' });

  const ncr1 = add('ncr', { codigo: 'NCR-001', loteId: lote2, fecha: '2026-11-12', severidad: 'Alta', descripcion: 'Medición fuera de tolerancia (DEMO)', estado: 'ABIERTA', impacto: 'Alto', reincidente: 'No' });
  add('ncr', { codigo: 'NCR-002', loteId: lote1, fecha: '2026-11-13', severidad: 'Baja', descripcion: 'Etiqueta ilegible (DEMO)', estado: 'ABIERTA', impacto: 'Bajo', reincidente: 'No' });

  add('capa', { codigo: 'CAPA-001', ncrId: ncr1, responsable: 'Cristóbal Díaz', fecha: '2026-12-01', accion: 'Calibrar estación y verificar lote', estado: 'ABIERTA', costoEstimado: 1500.5 });

  return db;
}
