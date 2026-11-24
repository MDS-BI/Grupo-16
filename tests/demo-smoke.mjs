import {test} from 'node:test';
import assert from 'node:assert/strict';
import {setActiveConfig,QUALITY_CONFIG} from '../src/module-config.js';
import {seedDemo} from '../src/demo-data.js';
import {loadDocuments,addEntity,loadEntities} from '../src/storage.js';
import {loadMasters} from '../src/master-data.js';
import {can,setActiveUser} from '../src/permissions.js';
const m=new Map(); globalThis.localStorage={getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)};
setActiveConfig(QUALITY_CONFIG);
test('demo adds valid records, preserves existing data and is idempotent',()=>{addEntity({name:'Original',code:'ORIGINAL',tipoItem:'Producto'});assert.ok(seedDemo()>0);assert.equal(seedDemo(),0);assert.equal(loadDocuments().length,7);assert.equal(loadMasters('lot').length,4);assert.equal(loadEntities().length,2);assert.equal(loadEntities()[0].code,'ORIGINAL');});
test('auditor cannot seed data',()=>{setActiveUser('user-auditor');assert.throws(seedDemo);assert.equal(loadDocuments().length,7);});
test('role matrix distinguishes inspection and audit permissions',()=>{assert.equal(can('Inspector de Planta','register-inspections'),true);assert.equal(can('Auditor','create-master-data'),false);assert.equal(can('Gestor de Calidad','manage-permissions'),false);assert.equal(can('Administrador','manage-permissions'),true);});

test('master list hides forbidden actions but preserves records', async()=>{
 const {renderQualityEntityList}=await import('../src/components/quality-entity-list.js');
 const rows=[{masterType:'product',producto_id:'p1',descripcion:'Producto visible'}];
 const auditor=renderQualityEntityList(rows,{}, {edit:false,remove:false});
 assert.match(auditor,/Producto visible/); assert.doesNotMatch(auditor,/btn-edit-master|btn-delete-master/);
 const inspector=renderQualityEntityList(rows,{}, {edit:true,remove:false});
 assert.match(inspector,/btn-edit-master/); assert.doesNotMatch(inspector,/btn-delete-master/);
});
