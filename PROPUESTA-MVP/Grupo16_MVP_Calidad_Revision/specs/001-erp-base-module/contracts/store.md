# Contrato de almacenamiento

`emptyDB()` crea siete catálogos; `readDB(storage)` carga esquema local válido; `writeDB(db, storage)` lo guarda; `upsert(db,type,data,id?)` valida y crea/actualiza; `remove(db,type,id,mode?)` bloquea borrado con dependencias salvo `mode='cascade'`; `search(db,query,types?)` busca texto; `stats(db)` calcula indicadores. Módulo: `src/store.js`.

Referencia: producto ← lote ← inspección/NCR ← CAPA; área ← empleado. `validate` comprueba código único por tipo, campos obligatorios, claves foráneas, fechas y estados. Versión de almacenamiento: `grupo16:gestion-calidad:v1`.
