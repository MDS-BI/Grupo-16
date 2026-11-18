import {emptyDB,upsert} from './store.js';
export function createDemo(){
 const db=emptyDB(); const add=(t,o)=>upsert(db,t,o).id;
 const areaA=add('area',{codigo:'AR-01',nombre:'Producción',responsable:'Equipo Turno A',ubicacion:'Planta principal'});
 const areaB=add('area',{codigo:'AR-02',nombre:'Control de calidad',responsable:'Equipo de laboratorio',ubicacion:'Laboratorio'});
 add('empleado',{codigo:'EMP-010',nombre:'Daniela Rojas',puesto:'Inspectora',areaId:areaB});
 add('empleado',{codigo:'EMP-011',nombre:'Cristóbal Díaz',puesto:'Supervisor',areaId:areaA});
 const prod1=add('producto',{codigo:'PRD-001',descripcion:'Válvula industrial',tipo:'Mecánico',unidad:'unidad',critico:'Sí'});
 const prod2=add('producto',{codigo:'PRD-002',descripcion:'Sensor de presión',tipo:'Electrónico',unidad:'unidad',critico:'Sí'});
 const lote1=add('lote',{codigo:'LOT-2026-101',productoId:prod1,fabricacion:'2026-10-15',caducidad:'2028-10-15',proveedor:'Proveedor DEMO A'});
 const lote2=add('lote',{codigo:'LOT-2026-102',productoId:prod2,fabricacion:'2026-11-02',caducidad:'2028-11-02',proveedor:'Proveedor DEMO B'});
 add('inspeccion',{codigo:'INS-001',loteId:lote1,fecha:'2026-11-10',inspector:'Daniela Rojas',resultado:'Aprobado',observaciones:'Muestra conforme; datos simulados'});
 add('inspeccion',{codigo:'INS-002',loteId:lote2,fecha:'2026-11-12',inspector:'Daniela Rojas',resultado:'Observado',observaciones:'Desviación de tolerancia; datos simulados'});
 const ncr1=add('ncr',{codigo:'NCR-001',loteId:lote2,fecha:'2026-11-12',severidad:'Alta',descripcion:'Medición fuera de tolerancia (DEMO)',estado:'ABIERTA'});
 add('ncr',{codigo:'NCR-002',loteId:lote1,fecha:'2026-11-13',severidad:'Baja',descripcion:'Etiqueta ilegible (DEMO)',estado:'ABIERTA'});
 add('capa',{codigo:'CAPA-001',ncrId:ncr1,responsable:'Cristóbal Díaz',fecha:'2026-12-01',accion:'Calibrar estación y verificar lote',estado:'ABIERTA'});
 return db;
}
