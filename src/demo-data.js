import { addMaster, loadMasters } from './master-data.js';
import { addEntity, addDocument, loadEntities, loadDocuments } from './storage.js';
import { can, getActiveUser } from './permissions.js';

// Optional, additive, idempotent demonstration data. Restore affected keys if validation fails.
export function seedDemo() {
  if (!can(getActiveUser(), 'manage-permissions')) throw new Error('Solo un administrador puede cargar ejemplos.');
  const keys = ['quality-areas','quality-employees','quality-products','quality-lots','quality-entities','quality-documents','quality-models'];
  const snapshot = keys.map(key => [key, localStorage.getItem(key)]);
  const count = () => ['area','employee','product','lot'].reduce((n,t)=>n+loadMasters(t).length,0)+loadEntities().length+loadDocuments().length;
  const before = count();
  const actor = 'Demostración';
  const date = offset => { const d = new Date(); d.setDate(d.getDate()+offset); return d.toISOString().slice(0,10); };
  const master = (type, key, data) => loadMasters(type).find(row => row[key] === data[key]) || addMaster(type,data,actor);
  try {
    const area = master('area','codigo',{codigo:'DEMO-QA',nombre:'[DEMO] Control de calidad',modulo:'MANUFACTURA_OPERACIONES'});
    const employee = master('employee','numero_nomina',{numero_nomina:'DEMO-01',puesto:'[DEMO] Inspector',area_id:area.area_id});
    const product = master('product','codigo',{codigo:'DEMO-P01',descripcion:'[DEMO] Envase industrial',tipo:'PRODUCTO',unidad_medida:'unidad',critico_calidad:true});
    const lot = master('lot','numero_lote',{numero_lote:'DEMO-L01',producto_id:product.producto_id,fecha_fabricacion:date(-10),fecha_caducidad:date(90)});
    const entity = loadEntities().find(row => row.code === 'DEMO-REF01') || addEntity({name:'[DEMO] Envase industrial',code:'DEMO-REF01',tipoItem:'Producto'},actor);
    const doc = (type,folio,data) => loadDocuments().find(row => row.series === 'DEMO' && row.folio === folio) || addDocument({entityId:entity.id,series:'DEMO',folio,tipoDoc:type,...data},actor);
    doc('Inspección',91001,{tipo:'FINAL',area_id:area.area_id,producto_id:product.producto_id,lote_id:lot.lote_id,inspector_id:employee.empleado_id,fecha_inspeccion:date(-2),resultado:'ACEPTADO',status:'ACEPTADO',targetDate:date(7),responsible:'Inspector demo',actionType:'Inspección'});
    const ncr = doc('NCR',91002,{origen:'INTERNO',area_afectada_id:area.area_id,producto_id:product.producto_id,lote_id:lot.lote_id,detectado_por:employee.empleado_id,fecha_deteccion:date(-3),gravedad:'MAYOR',descripcion:'[DEMO] Variación dimensional',estado:'ABIERTA',status:'ABIERTA',targetDate:date(-1),responsible:'Gestor demo',actionType:'Reinspección'});
    doc('CAPA',91003,{ncr_id:ncr.id,tipo:'CORRECTIVA',responsable_id:employee.empleado_id,fecha_objetivo:date(2),causa_raiz:'[DEMO] Ajuste de equipo',metodologia:'5_WHYS',estado:'ABIERTA',status:'ABIERTA',targetDate:date(2),responsible:'Gestor demo',actionType:'Calibración'});
    for (let i=2;i<=4;i++) {
      const p = master('product','codigo',{codigo:`DEMO-P0${i}`,descripcion:`[DEMO] ${['','', 'Tapa industrial','Etiqueta de seguridad','Caja de embalaje'][i]}`,tipo:'PRODUCTO',unidad_medida:'unidad',critico_calidad:true});
      const l = master('lot','numero_lote',{numero_lote:`DEMO-L0${i}`,producto_id:p.producto_id,fecha_fabricacion:date(-5),fecha_caducidad:date(90)});
      doc('Inspección',91010+i,{tipo:'FINAL',area_id:area.area_id,producto_id:p.producto_id,lote_id:l.lote_id,inspector_id:employee.empleado_id,fecha_inspeccion:date(-2),resultado:'ACEPTADO',status:'ACEPTADO',targetDate:date(i===2?0:14),responsible:'Inspector demo',actionType:'Inspección',completed:i===4});
    }
    doc('NCR',91020,{origen:'INTERNO',area_afectada_id:area.area_id,producto_id:product.producto_id,lote_id:lot.lote_id,detectado_por:employee.empleado_id,fecha_deteccion:date(-2),gravedad:'MENOR',descripcion:'[DEMO] Etiquetado incompleto',estado:'ABIERTA',status:'ABIERTA',targetDate:date(10),responsible:'Gestor demo',actionType:'Reinspección'});
    return count()-before;
  } catch (error) {
    for (const [key,value] of snapshot) { if(value===null) localStorage.removeItem(key); else localStorage.setItem(key,value); }
    throw error;
  }
}
