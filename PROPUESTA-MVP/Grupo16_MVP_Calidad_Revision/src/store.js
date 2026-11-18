export const TYPES = {
  producto: { label:'Producto', plural:'Productos', fields:[['codigo','Código'],['descripcion','Descripción'],['tipo','Tipo'],['unidad','Unidad de medida'],['critico','Crítico para calidad']] },
  lote: { label:'Lote', plural:'Lotes', fields:[['codigo','Número de lote'],['productoId','Producto asociado'],['fabricacion','Fecha de fabricación'],['caducidad','Fecha de caducidad'],['proveedor','Proveedor']] },
  area: { label:'Área organizativa', plural:'Áreas', fields:[['codigo','Código'],['nombre','Nombre'],['responsable','Responsable'],['ubicacion','Ubicación']] },
  empleado: { label:'Empleado', plural:'Empleados', fields:[['codigo','N° de nómina'],['nombre','Nombre'],['puesto','Puesto'],['areaId','Área asociada']] },
  inspeccion: { label:'Inspección', plural:'Inspecciones', fields:[['codigo','Código'],['loteId','Lote'],['fecha','Fecha'],['inspector','Inspector'],['resultado','Resultado'],['observaciones','Observaciones']] },
  ncr: { label:'No conformidad', plural:'No conformidades', fields:[['codigo','Código'],['loteId','Lote'],['fecha','Fecha'],['severidad','Severidad'],['descripcion','Hallazgo'],['estado','Estado']] },
  capa: { label:'Acción CAPA', plural:'Acciones CAPA', fields:[['codigo','Código'],['ncrId','NCR vinculada'],['responsable','Responsable'],['fecha','Fecha objetivo'],['accion','Acción'],['estado','Estado']] }
};
export const MASTER = ['producto','lote','area','empleado'];
export const OPS=['inspeccion','ncr','capa'];
export const STATUS = ['ABIERTA','EN_INVESTIGACION','EN_CAPA','CERRADA','RECHAZADA'];
export const TRANSITIONS = {ABIERTA:['EN_INVESTIGACION','RECHAZADA'],EN_INVESTIGACION:['EN_CAPA','CERRADA','RECHAZADA'],EN_CAPA:['CERRADA','RECHAZADA'],CERRADA:[],RECHAZADA:[]};
export const STORAGE_KEY='grupo16:gestion-calidad:v1';
export function emptyDB(){return {schema:1,producto:[],lote:[],area:[],empleado:[],inspeccion:[],ncr:[],capa:[]};}
export function validType(type){return Object.prototype.hasOwnProperty.call(TYPES,type);}
export function readDB(storage=globalThis.localStorage){if(!storage)return emptyDB();try{const raw=JSON.parse(storage.getItem(STORAGE_KEY));if(!raw || raw.schema!==1)return emptyDB();const clean=emptyDB();for(const t of Object.keys(TYPES))clean[t]=Array.isArray(raw[t])?raw[t]:[];return clean;}catch{return emptyDB();}}
export function writeDB(db,storage=globalThis.localStorage){storage?.setItem(STORAGE_KEY,JSON.stringify(db));return db;}
export function nextId(db,type){let n=1;const all=new Set(db[type].map(r=>r.id));while(all.has(`${type}-${String(n).padStart(4,'0')}`))n++;return `${type}-${String(n).padStart(4,'0')}`;}
function cleanValue(v){return typeof v==='string'?v.trim():v;}
export function validate(db,type,item,currentId=null){
  if(!validType(type))throw Error('Tipo de registro no reconocido');
  const e={};
  const req=(field,label)=>{if(!String(item[field]??'').trim())e[field]=`${label} es obligatorio`};
  req('codigo','El código');
  if(type==='producto')req('descripcion','La descripción');
  if(type==='area'||type==='empleado')req('nombre','El nombre');
  if(type==='lote')req('productoId','El producto');
  if(type==='empleado')req('areaId','El área');
  if(type==='inspeccion'||type==='ncr')req('loteId','El lote');
  if(type==='inspeccion')req('resultado','El resultado');
  if(type==='ncr'){req('descripcion','El hallazgo');req('severidad','La severidad');}
  if(type==='capa'){req('ncrId','La NCR');req('accion','La acción');req('responsable','El responsable');}
  if(db[type].some(r=>r.codigo?.toLowerCase()===String(item.codigo||'').toLowerCase()&&r.id!==currentId))e.codigo='El código ya existe para este tipo';
  const fk={lote:['productoId','producto'],empleado:['areaId','area'],inspeccion:['loteId','lote'],ncr:['loteId','lote'],capa:['ncrId','ncr']}[type];
  if(fk&&item[fk[0]]&&!db[fk[1]].some(r=>r.id===item[fk[0]]))e[fk[0]]=`Seleccione un ${TYPES[fk[1]].label.toLowerCase()} válido`;
  if(type==='lote'&&item.fabricacion&&item.caducidad&&item.fabricacion>item.caducidad)e.caducidad='La caducidad no puede ser anterior a la fabricación';
  if(type==='ncr'&&item.estado&&!STATUS.includes(item.estado))e.estado='Estado no permitido';
  if(type==='ncr'&&currentId){const prev=db.ncr.find(r=>r.id===currentId);if(prev&&prev.estado!==item.estado&&!TRANSITIONS[prev.estado]?.includes(item.estado))e.estado=`Transición no permitida desde ${prev.estado}`;}
  if(type==='capa'&&item.estado&&!['ABIERTA','EN_PROCESO','CERRADA'].includes(item.estado))e.estado='Estado CAPA no permitido';
  return e;
}
export function upsert(db,type,data,id=null){
  if(!validType(type))throw Error('Tipo inválido');
  const existing=id?db[type].find(r=>r.id===id):null;
  if(id&&!existing)throw Error('Registro no encontrado');
  const item={...(existing||{}),...Object.fromEntries(Object.entries(data).map(([k,v])=>[k,cleanValue(v)]))};
  if(type==='ncr'&&!item.estado)item.estado='ABIERTA';
  if(type==='capa'&&!item.estado)item.estado='ABIERTA';
  const errors=validate(db,type,item,id);if(Object.keys(errors).length) {const err=new Error(Object.values(errors).join('. '));err.fields=errors;throw err;}
  const now=new Date().toISOString();
  if(existing){Object.assign(existing,item,{updatedAt:now});return existing;}
  const created={...item,id:nextId(db,type),createdAt:now,updatedAt:now};db[type].push(created);return created;
}
export function dependencies(db,type,id){
  if(type==='producto')return db.lote.filter(r=>r.productoId===id).map(r=>['lote',r.id]);
  if(type==='area')return db.empleado.filter(r=>r.areaId===id).map(r=>['empleado',r.id]);
  if(type==='lote')return [...db.inspeccion.filter(r=>r.loteId===id).map(r=>['inspeccion',r.id]),...db.ncr.filter(r=>r.loteId===id).map(r=>['ncr',r.id])];
  if(type==='ncr')return db.capa.filter(r=>r.ncrId===id).map(r=>['capa',r.id]);
  return [];
}
export function remove(db,type,id,mode='block'){
 if(!validType(type))throw Error('Tipo inválido');
 if(!db[type].some(r=>r.id===id))throw Error('Registro no encontrado');
 const deps=dependencies(db,type,id);
 if(deps.length&&mode!=='cascade')throw Error(`No se puede eliminar: ${deps.length} registros relacionados. Use eliminación en cascada confirmada.`);
 for(const [child,childId] of deps)remove(db,child,childId,'cascade');
 db[type]=db[type].filter(r=>r.id!==id);
}
export function search(db,query,types=Object.keys(TYPES)){const q=String(query||'').trim().toLocaleLowerCase('es');return types.flatMap(type=>db[type].filter(item=>!q||Object.values(item).some(v=>String(v).toLocaleLowerCase('es').includes(q))).map(item=>({...item,_tipo:type})));}
export function stats(db){return {maestros:MASTER.reduce((n,t)=>n+db[t].length,0),operativos:OPS.reduce((n,t)=>n+db[t].length,0),ncrAbiertas:db.ncr.filter(r=>!['CERRADA','RECHAZADA'].includes(r.estado)).length,inspecciones:db.inspeccion.length,capaPendientes:db.capa.filter(r=>r.estado!=='CERRADA').length};}
