# Modelo Entidad-Relación - Gestión de Calidad

## Símbolos
- PK = Primary Key (Clave Primaria)
- FK = Foreign Key (Clave Foránea)
- UK = Unique Key (Clave Única)
- NN = Not Null (Obligatorio)
- NULL = Opcional

## Entidades Maestras

### AREA_ORGANIZATIVA
| Atributo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| area_id | VARCHAR(36) | PK, NN | Identificador único de área |
| codigo | VARCHAR(20) | UK, NN | Código único del área |
| nombre | VARCHAR(100) | NN | Nombre del área (Ventas, Compras, etc.) |
| modulo | ENUM('VENTAS','ADQUISICION_COMPRAS','MANUFACTURA_OPERACIONES','CONTABILIDAD_FINANZAS','RRHH_PLANILLA','LOGISTICA_INVENTARIO','CRM') | NN | Módulo al que pertenece |
| activo | BOOLEAN | NN, DEFAULT TRUE | Estado del área |
| createdAt | TIMESTAMP | NN | Fecha de creación |
| updatedAt | TIMESTAMP | NN | Fecha de actualización |

### EMPLEADO
| Atributo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| empleado_id | VARCHAR(36) | PK, NN | Identificador único del empleado |
| entity_id | VARCHAR(36) | FK -> ENTITY(entity_id), NULL | Vinculación con maestro de entidades (opcional) |
| numero_nomina | VARCHAR(20) | UK, NN | Número de nómina único |
| puesto | VARCHAR(100) | NN | Puesto o cargo |
| area_id | VARCHAR(36) | FK -> AREA_ORGANIZATIVA(area_id), NN | Área organizativa |
| jefe_id | VARCHAR(36) | FK -> EMPLEADO(empleado_id), NULL | Jefe directo |
| estado | ENUM('ACTIVO','INACTIVO','SUSPENDIDO') | NN, DEFAULT 'ACTIVO' | Estado del empleado |
| createdAt | TIMESTAMP | NN | Fecha de creación |
| updatedAt | TIMESTAMP | NN | Fecha de actualización |

### PRODUCTO
| Atributo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| producto_id | VARCHAR(36) | PK, NN | Identificador único del producto |
| codigo | VARCHAR(50) | UK, NN | Código único del producto |
| descripcion | VARCHAR(255) | NN | Descripción del producto |
| tipo | ENUM('PRODUCTO','MATERIA_PRIMA','INSUMO','SERVICIO') | NN | Tipo de producto |
| unidad_medida | VARCHAR(10) | NN | Unidad de medida (PZA, KG, LT, etc.) |
| critico_calidad | BOOLEAN | NN, DEFAULT FALSE | Indica si es crítico para calidad |
| activo | BOOLEAN | NN, DEFAULT TRUE | Estado del producto |
| createdAt | TIMESTAMP | NN | Fecha de creación |
| updatedAt | TIMESTAMP | NN | Fecha de actualización |

### LOTE
| Atributo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| lote_id | VARCHAR(36) | PK, NN | Identificador único del lote |
| producto_id | VARCHAR(36) | FK -> PRODUCTO(producto_id), NN | Producto al que pertenece |
| numero_lote | VARCHAR(50) | UK, NN | Número de lote único |
| fecha_fabricacion | DATE | NN | Fecha de fabricación |
| fecha_caducidad | DATE | NULL | Fecha de caducidad (si aplica) |
| proveedor_id | VARCHAR(36) | FK -> ENTITY(entity_id), NULL | Proveedor del lote (opcional) |
| orden_produccion_id | VARCHAR(36) | NULL | Vinculación a orden de producción |
| createdAt | TIMESTAMP | NN | Fecha de creación |
| updatedAt | TIMESTAMP | NN | Fecha de actualización |

## Entidades Operativas de Calidad

### NO_CONFORMIDAD
| Atributo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| ncr_id | VARCHAR(36) | PK, NN | Identificador único de la NCR |
| folio | VARCHAR(20) | UK, NN | Folio consecutivo único |
| origen | ENUM('CLIENTE','PROVEEDOR','INTERNO','AUDITORIA') | NN | Origen de la no conformidad |
| area_afectada_id | VARCHAR(36) | FK -> AREA_ORGANIZATIVA(area_id), NN | Área afectada |
| entidad_id | VARCHAR(36) | FK -> ENTITY(entity_id), NULL | Cliente o proveedor asociado |
| documento_origen_id | VARCHAR(36) | FK -> DOCUMENT(id), NULL | Documento origen (Orden, Factura, etc.) |
| producto_id | VARCHAR(36) | FK -> PRODUCTO(producto_id), NULL | Productoa afectado |
| lote_id | VARCHAR(36) | FK -> LOTE(lote_id), NULL | Lote afectado |
| detectado_por | VARCHAR(36) | FK -> EMPLEADO(empleado_id), NN | Colaborador que detectó la NCR |
| fecha_deteccion | DATE | NN | Fecha de detección |
| gravedad | ENUM('MENOR','MAYOR','CRITICA') | NN | Gravedad de la NCR |
| estado | ENUM('ABIERTA','EN_INVESTIGACION','EN_CAPA','CERRADA','RECHAZADA') | NN, DEFAULT 'ABIERTA' | Estado de la NCR |
| descripcion | TEXT | NN | Descripción detallada |
| ubicacion | VARCHAR(100) | NULL | Ubicación donde se detectó |
| cantidad_afectada | DECIMAL(12,2) | NULL, CHECK(cantidad_afectada > 0) | Cantidad afectada |
| createdAt | TIMESTAMP | NN | Fecha de creación |
| updatedAt | TIMESTAMP | NN | Fecha de actualización |
| createdBy | VARCHAR(36) | FK -> EMPLEADO(empleado_id), NN | Usuario que creó |
| updatedBy | VARCHAR(36) | FK -> EMPLEADO(empleado_id), NN | Usuario que modificó |

### INSPECCION_CALIDAD
| Atributo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| inspeccion_id | VARCHAR(36) | PK, NN | Identificador único de inspección |
| folio | VARCHAR(20) | UK, NN | Folio consecutivo único |
| tipo | ENUM('RECEPCION','PROCESO','FINAL','LIBERACION') | NN | Tipo de inspección |
| area_id | VARCHAR(36) | FK -> AREA_ORGANIZATIVA(area_id), NN | Área responsable |
| producto_id | VARCHAR(36) | FK -> PRODUCTO(producto_id), NN | Producto a inspeccionar |
| lote_id | VARCHAR(36) | FK -> LOTE(lote_id), NULL | Lote a inspeccionar |
| orden_compra_id | VARCHAR(36) | FK -> DOCUMENT(id), NULL | Orden de compra vinculada |
| orden_produccion_id | VARCHAR(36) | NULL | Orden de producción vinculado (si existe) |
| inspector_id | VARCHAR(36) | FK -> EMPLEADO(empleado_id), NN | Inspector responsable |
| fecha_inspeccion | DATE | NN | Fecha de inspección |
| resultado | ENUM('ACEPTADO','RECHAZADO','CONDICIONADO') | NN | Resultado de inspección |
| plan_muestreo | VARCHAR(50) | NULL | Plan de muestreo utilizado |
| observaciones | TEXT | NULL | Observaciones generales |
| createdAt | TIMESTAMP | NN | Fecha de creación |
| updatedAt | TIMESTAMP | NN | Fecha de actualización |

### INSPECCION_DETALLE
| Atributo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| detalle_id | VARCHAR(36) | PK, NN | Identificador único de detalle |
| inspeccion_id | VARCHAR(36) | FK -> INSPECCION_CALIDAD(inspeccion_id), NN, ON DELETE CASCADE | Inspección padre |
| criterio | VARCHAR(255) | NN | Criterio de inspección |
| metodo_inspeccion | VARCHAR(100) | NN | Método utilizado |
| valor_esperado | VARCHAR(100) | NN | Valor esperado |
| valor_obtenido | VARCHAR(100) NULL | NN? Or NULL - Valor obtenido & conforme | Valor obtenido |
| unidad | VARCHAR(10) | NULL | Unidad de medida |
| conforme | BOOLEAN | NN | ¿Cumple con el criterio? | 

### AUDITORIA
| Atributo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| auditoria_id | VARCHAR(36) | PK, NN | Identificador único de auditoría |
| folio | VARCHAR(20) | UK, NN | Folio consecutivo |
| tipo | ENUM('INTERNA','PROVEEDOR','PROCESO') | NN | Tipo de auditoría |
| entidad_auditada_id | VARCHAR(36) | FK -> ENTITY(entity_id), NULL | Entidad auditada (si es a proveedor) |
| area_id | VARCHAR(36) | FK -> AREA_ORGANIZATIVA(area_id), NULL | Area auditada (si es interna) |
| auditor_lider_id | VARCHAR(36) | FK -> EMPLEADO(empleado_id), NN | Auditor líder |
| fecha_inicio | DATE | NN | Fecha inicio de auditoría |
| fecha_fin | DATE | NULL | Fecha fin de auditoría |
| alcance | TEXT | NN | Alcance de auditoría |
| objetivo | TEXT | NN | Objetivo de auditoría |
| estado | ENUM('PLANIFICADA','EN_PROCESO','FINALIZADA','CERRADA') | NN, DEFAULT 'PLANIFICADA' | Estado of auditoría | 
| createdAt | TIMESTAMP | NN | Fecha de creación |
| updatedAt | TIMESTAMP | NN | Fecha de actualización |

### HALLAZGO_AUDITORIA
| Atributo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| hallazgo_id | VARCHAR(36) | PK, NN | Identificador único del hallazgo |
| auditoria_id | VARCHAR(36) | FK -> AUDITORIA(auditoria_id), NN, ON DELETE CASCADE | Auditoría padre |
| ncr_id | VARCHAR(36) | FK -> NO_CONFORMIDAD(ncr_id), NULL | NCR vinculada si se escaló |
| tipo | ENUM('CONFORMIDAD','OBSERVACION','NO_CONFORMIDAD') | NN | Tipo de hallazgo |
| criterio_referencia | TEXT | NN | Criterio de referencia utilizado |
| descripcion | TEXT | NN | Descripción del hallazgo |
| evidencia_requerida | TEXT | NULL | Evidencia requerida para seguimiento |
| clasificacion | ENUM('MENOR','MAYOR','CRITICA') | NULL | Clasificación según gravedad |
## Entidades de Seguimiento y Cierre

### ACCION_CAPA
| Atributo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| capa_id | VARCHAR(36) | PK, NN | Identificador único CAPA |
| folio | VARCHAR(20) | UK, NN | Folio consecutivo |
| ncr_id | VARCHAR(36) | FK -> NO_CONFORMIDAD(ncr_id), NN, ON DELETE RESTRICT | NCR origen |
| tipo | ENUM('CORRECTIVA','PREVENTIVA') | NN | Tipo de acción |
| responsable_id | VARCHAR(36) | FK -> EMPLEADO(empleado_id), NN | Responsable general del CAPA |
| fecha_aprobacion | DATE | NULL | Fecha de aprobación |
| fecha_objetivo | DATE | NN | Fecha objetivo de cierre |
| fecha_cierre_propuesta | DATE | NULL | Fecha propuesta for cierre |
| causa_raiz | TEXT | NN | Análisis de causa raíz |
| metodologia | ENUM('5_WHYS','ISHIKAWA','OTRO') | NN | Metodología utilizada |
| estado | ENUM('ABIERTA','EN_EJECUCION','EN_VERIFICACION','CERRADA_EFECTIVA','CERRADA_NO_EFECTIVA') | NN, DEFAULT 'ABIERTA' | Estado del CAPA |
| prioridad | ENUM('BAJA','MEDIA','ALTA') | NN, DEFAULT 'MEDIA' | Prioridad del CAPA |
| createdAt | TIMESTAMP | NN | Fecha de creación |
| updatedAt | TIMESTAMP | NN | Fecha de actualización |

### ACCION_DETALLE
| Atributo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| accion_id | VARCHAR(36) | PK, NN | Identificador unique acción detalle |
| capa_id | VARCHAR(36) | FK -> ACCION_CAPA(capa_id), NN, ON DELETE CASCADE | CAPA padre |
| descripcion | TEXT | NN | Descripción de la acción a ejecutar |
| responsable_id | VARCHAR(36) | FK -> EMPLEADO(empleado_id), NN | Responsable de ejecutar la acción |
| fecha_objetivo | DATE | NN | Fecha objetivo de ejecución |
| fecha_real | DATE | NULL | Fecha real de ejecución |
| estado | ENUM('PENDIENTE','EN_PROCESO','COMPLETADA','VENCIDA') | NN, DEFAULT 'PENDIENTE' | Estado de la acción |
| evidencia_url | VARCHAR(255) | NULL | URL de evidencia / documento |
| comentarios | TEXT | NULL | Comentarios de seguimiento |
## VERIFICACION_EFICACIA
| Atributo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| verificacion_id | VARCHAR(36) | PK, NN | Identificador de verificación |
| capa_id | VARCHAR(36) | FK -> ACCION_CAPA(capa_id), NN, ON DELETE CASCADE | CAPA a verificar |
| verificado_por | VARCHAR(36) | FK -> EMPLEADO(empleado_id), NN | Colaborador que verifica eficacia |
| fecha_verificacion | DATE | NN | Fecha de verificación |
| criterio_eficacia | TEXT | NN | Criterio usado para verificar eficacia |
| resultado | ENUM('EFICAZ','NO_EFICAZ') | NN | Resultado de verificación |
| observaciones | TEXT | NN | Observaciones de verificación |
| nueva_ncr | BOOLEAN | NN, DEFAULT FALSE | ¿Genera nueva NCR? |
| ncr_id_generado | VARCHAR(36) | FK -> NO_CONFORMIDAD(ncr_id), NULL | Nueva NCR generada (si aplica) | 
| createdAt | TIMESTAMP | NN | Fecha de creación |
| updatedAt | TIMESTAMP | NN | Fecha de actualización |

## Entidades de Gestión Transversal

### QUEJA_CLIENTE
| Atributo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| queja_id | VARCHAR(36) | PK, NN | Identificador de queja |
| folio | VARCHAR(20) | UK, NN | Folio consecutivo |
| entidad_id | VARCHAR(36) | FK -> ENTITY(entity_id), NN | Cliente que presenta la queja |
| documento_venta_id | VARCHAR(36) | FK -> DOCUMENT(id), NULL | Documento de venta relacionado (Pedido/Factura) |
| contacto_nombre | VARCHAR(100) | NULL | Nombre de contacto que reportó |
| canal | ENUM('TELEFONO','CORREO','WEB','PRESENCIAL') | NN | Canal de recepción |
| fecha_recepcion | DATE | NN | Fecha de recepción |
| clasificacion | ENUM('GARANTIA','DEVOLUCION','SERVICIO','OTRO') | NN | Clasificación de queja |
| estado | ENUM('RECIBIDA','EN_INVESTIGACION','RESUELTA','CERRADA') | NN, DEFAULT 'RECIBIDA' | Estado de queja |
| descripcion | TEXT | NN | Descripción de queja |
| ncr_id | VARCHAR(36) | FK -> NO_CONFORMIDAD(ncr_id), NULL | NCR vinculada (si se escaló) | 
| createdAt | TIMESTAMP | NN | Fecha de création |
| updatedAt | TIMESTAMP | NN | Fecha de actualización |

### EVALUACION_PROVEEDOR
| Atributo | Tipo | Restricciones | Descripción |
|---|---|---|---|
        g caracteres. contenido parcial. ادامه en...

### EVALUACION_PROVEEDOR
| Atributo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| evaluacion_id | VARCHAR(36) | PK, NN | Identificador de evaluación |
| proveedor_id | VARCHAR(36) | FK -> ENTITY(entity_id), NN | Proveedor evaluado |
| periodo | VARCHAR(10) | NN | Periodo de evaluación (YYYY-MM) |
| evaluado_por | VARCHAR(36) | FK -> EMPLEADO(empleado_id), NN | Colaborador que evalúa |
| calidad | DECIMAL(5,2) | NN, CHECK(calidad BETWEEN 0 AND 100) | Calificación en calidad |
| entrega | DECIMAL(5,2) | NN, CHECK(entrega BETWEEN 0 AND 100) | Calificación en entrega |
| precio | DECIMAL(5,2) | NN, CHECK(precio BETWEEN 0 AND 100) | Calificación en precio |
| servicio | DECIMAL(5,2) | NN, CHECK(servicio BETWEEN 0 AND 100) | Calificación en servicio |
| puntaje_total | DECIMAL(5,2) | NN | Puntaje total calculado |
| clasificacion | ENUM('APROBADO','CONDICIONADO','SUSPENDIDO') | NN | Clasificación del proveedor |
| ncr_asociadas | INT | NN, DEFAULT 0 | Número de NCR asociadas al periodo |
| observaciones | TEXT | NULL | Observaciones de evaluación |
| createdAt | TIMESTAMP | NN | Fecha de creación |
| updatedAt | TIMESTAMP | NN | Fecha de actualización |

### COSTO_NO_CALIDAD
| Atributo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| costo_id | VARCHAR(36) | PK, NN | Identificador de costo |
| ncr_id | VARCHAR(36) | FK -> NO_CONFORMIDAD(ncr_id), NN, ON DELETE RESTRICT | NCR asociada |
| tipo_costo | ENUM('INTERNA','EXTERNA','PREVENCION','EVALUACION') | NN | Clasificación del costo |
| concepto | VARCHAR(255) | NN | Concepto del costo |
| monto | DECIMAL(12,2) | NN, CHECK(monto >= 0) | Monto del costo |
| moneda | VARCHAR(3) | NN, DEFAULT 'MXN' | Código de moneda (ISO 4217) |
| fecha_registro | DATE | NN | Fecha de registro |
| registrado_por | VARCHAR(36) | FK -> EMPLEADO(empleado_id), NN | Colaborador que registra |
| documento_contable_id | VARCHAR(36) | FK -> DOCUMENT(id), NULL | Documento contable vinculado |
| createdAt | TIMESTAMP | NN | Fecha de creación |
| updatedAt | TIMESTAMP | NN | Fecha de actualización |

### CAPACITACION_CALIDAD
| Atributo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| capacitacion_id | VARCHAR(36) | PK, NN | Identificador de capacitación |
| capa_id | VARCHAR(36) | FK -> ACCION_CAPA(capa_id), NULL | CAPA vinculado (opcional) |
| ncr_id | VARCHAR(36) | FK -> NO_CONFORMIDAD(ncr_id), NULL | NCR vinculado (opcional) |
| area_id | VARCHAR(36) | FK -> AREA_ORGANIZATIVA(area_id), NN | Área a capacitar |
| tema | VARCHAR(255) | NN | Tema de capacitación |
| impartido_por | VARCHAR(100) | NN | Instructor / Responsable de impartición |
| fecha_programada | DATE | NN | Fecha programada |
| fecha_realizada | DATE | NULL | Fecha realizada |
| duracion_horas | DECIMAL(4,2) | NN, CHECK(duracion_horas > 0) | Duración en horas |
| estado | ENUM('PROGRAMADA','REALIZADA','CANCELADA') | NN, DEFAULT 'PROGRAMADA' | Estado de capacitación |
| empleados_participantes | JSON | NULL | Lista de empleados participantes |
| createdAt | TIMESTAMP | NN | Fecha de creación |
| updatedAt | TIMESTAMP | NN | Fecha de actualización |

### MOVIMIENTO_NO_CONFORME
| Atributo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| movimiento_id | VARCHAR(36) | PK, NN | Identificador de movimiento |
| lote_id | VARCHAR(36) | FK -> LOTE(lote_id), NN | Lote en movimiento |
| ncr_id | VARCHAR(36) | FK -> NO_CONFORMIDAD(ncr_id), NN | NCR asociada |
| tipo | ENUM('RETENCION','CUARENTENA','DEVOLUCION','REWORK','SCRAP') | NN | Tipo de movimiento |
| almacen_origen | VARCHAR(50) | NULL | Almacén origen |
| almacen_destino | VARCHAR(50) | NULL | Almacén destino |
| cantidad | DECIMAL(12,2) | NN, CHECK(cantidad > 0) | Cantidad movida |
| autorizado_por | VARCHAR(36) | FK -> EMPLEADO(empleado_id), NN | Autorizado por |
| fecha_movimiento | DATE | NN | Fecha de movimiento |
| documento_logistica_id | VARCHAR(36) | FK -> DOCUMENT(id), NULL | Documento logístico vinculado |
| createdAt | TIMESTAMP | NN | Fecha de creación |
| updatedAt | TIMESTAMP | NN | Fecha de actualización |

## Relaciones (Cardinalidad)

| Relación | Cardinalidad | Descripción |
|---|---|---|
| ENTITY - NO_CONFORMIDAD | 1:N | Un cliente/proveedor puede tener múltiples NCR |
| ENTITY - QUEJA_CLIENTE | 1:N | Un cliente puede generar múltiples quejas |
| ENTITY - EVALUACION_PROVEEDOR | 1:N | Un proveedor tiene histórico de evaluaciones |
| ENTITY - EMPLEADO | 1:0..1 | Posible vinculación entre entidad y empleado |
| ENTITY - AUDITORIA | 1:N | Una entidad puede ser auditada múltiples veces |
| DOCUMENT - NO_CONFORMIDAD | 1:N | Un documento puede originar múltiples NCR |
| DOCUMENT - QUEJA_CLIENTE | 1:N | Un documento de venta puede estar relacionado a quejas |
| DOCUMENT - COSTO_NO_CALIDAD | 1:N | Un documento contable puede vincular costos |
| DOCUMENT - MOVIMIENTO_NO_CONFORME | 1:N | Un documento logístico puede vincular movimientos |
| DOCUMENT - INSPECCION_CALIDAD | 1:N | Una orden de compra puede tener inspecciones |
| AREA_ORGANIZATIVA - EMPLEADO | 1:N | Un área tiene múltiples empleados |
| AREA_ORGANIZATIVA - NO_CONFORMIDAD | 1:N | Un área puede tener múltiples NCR |
| AREA_ORGANIZATIVA - INSPECCION_CALIDAD | 1:N | Un área responsable de inspecciones |
| AREA_ORGANIZATIVA - AUDITORIA | 1:N | Un área puede ser auditada |
| AREA_ORGANIZATIVA - CAPACITACION_CALIDAD | 1:N | Un área recibe capacitaciones |
| EMPLEADO - EMPLEADO | 1:N (Jerárquico) | Un empleado puede tener múltiples subordinados |
| EMPLEADO - NO_CONFORMIDAD | 1:N | Empleado que detecta NCR |
| EMPLEADO - INSPECCION_CALIDAD | 1:N | Inspector responsable |
| EMPLEADO - AUDITORIA | 1:N | Auditor líder |
| EMPLEADO - ACCION_CAPA | 1:N | Responsable general de CAPA |
| EMPLEADO - ACCION_DETALLE | 1:N | Responsable de acción individual |
| EMPLEADO - VERIFICACION_EFICACIA | 1:N | Verificador de eficacia |
| EMPLEADO - EVALUACION_PROVEEDOR | 1:N | Evaluador de proveedor |
| EMPLEADO - COSTO_NO_CALIDAD | 1:N | Registrador of cost |
| EMPLEADO - MOVIMIENTO_NO_CONFORME | 1:N | Autorizador of movimiento |
| PRODUCTO - LOTE | 1:N | Un producto tiene múltiples lotes |
| PRODUCTO - NO_CONFORMIDAD | 1:N | Un producto puede tener múltiples NCR |
| PRODUCTO - INSPECCION_CALIDAD | 1:N | Un producto puede be inspeccionado múltiples veces |
| LOTE - NO_CONFORMIDAD | 1:N | Un lote puede tener múltiples NCR |
| LOTE - INSPECCION_CALIDAD | 1:N | A un lote le pueden aplicar inspecciones |
| LOTE - MOVIMIENTO_NO_CONFORME | 1:N | Un lote puede tener múltiples movimientos no conformes |
| NO_CONFORMIDAD - ACCION_CAPA | 1:N | Una NCR puede derivar múltiples CAPA |
| NO_CONFORMIDAD - COSTO_NO_CALIDAD | 1:N | Una NCR puede tener múltiples costos |
| NO_CONFORMIDAD - QUEJACLIENTE | 1:0..1 | Una queja puede estar vinculada a una NCR |
| NO_CONFORMIDAD - HALLAZGO_AUDITORIA | 1:0..1 | Un hallazgo puede escalar a una NCR |
| NO_CONFORMIDAD - CAPACITACION_CALIDAD | 1:N | Una NCR puede derivar capacitaciones |
| NO_CONFORMIDAD - MOVIMIENTO_NO_CONFORME | 1:N | Una NCR puede generar movimientos no conformes |
| INSPECCION_CALIDAD - INSPECCION_DETALLE | 1:N | Una inspección tiene múltiples detalles |
| AUDITORIA - HALLAZGO_AUDITORIA | 1:N | Una auditoría tiene múltiples hallazgos |
| ACCION_CAPA - ACCION_DETALLE | 1:N | Un CAPA tiene múltiples acciones |
| ACCION_CAPA - VERIFICACION_EFICACIA | 1:1 | Un CAPA requiere verificación de eficacia |
| VERIFICACION_EFICACIA - NO_CONFORMIDAD | 1:0..1 | La verificación puede generar una nueva NCR |
