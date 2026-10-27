# Modelo de Datos - Módulo Base ERP

## 1. Diagrama Entidad-Relación

```mermaid
erDiagram
    MODULO {
        varchar(36) modulo_id PK
        varchar(30) codigo UK "NOT NULL"
        varchar(100) nombre "NOT NULL"
        varchar(255) descripcion
        boolean activo "NOT NULL DEFAULT TRUE"
        timestamp createdAt "NOT NULL"
        timestamp updatedAt "NOT NULL"
    }

    ENTIDAD {
        varchar(36) entidad_id PK
        varchar(36) modulo_id FK "NOT NULL"
        varchar(50) codigo UK "NOT NULL"
        varchar(100) nombre "NOT NULL"
        varchar(255) descripcion
        boolean configurable_tabs "NOT NULL DEFAULT FALSE"
        boolean configurable_fields "NOT NULL DEFAULT FALSE"
        boolean permite_documentos "NOT NULL DEFAULT TRUE"
        boolean activo "NOT NULL DEFAULT TRUE"
        timestamp createdAt "NOT NULL"
        timestamp updatedAt "NOT NULL"
    }

    ENTITY {
        varchar(36) id PK
        varchar(36) entity_id UK "NOT NULL"
        varchar(150) name "NOT NULL"
        varchar(50) code UK
        varchar(50) taxId
        varchar(100) email
        varchar(20) phone
        varchar(255) address
        varchar(50) category
        text description
        date targetDate
        decimal(15,2) creditLimit
        varchar(50) paymentTerms
        timestamp createdAt "NOT NULL"
        timestamp updatedAt "NOT NULL"
    }

    DOCUMENT {
        varchar(36) id PK
        varchar(36) entity_id FK "NOT NULL"
        varchar(10) series
        integer folio
        date startDate
        date endDate
        decimal(15,2) quantity
        decimal(15,2) subtotal
        decimal(15,2) discount
        decimal(15,2) taxAmount
        decimal(15,2) totalAmount
        varchar(3) currency
        varchar(50) paymentTerms
        text notes
        varchar(20) status
        timestamp createdAt "NOT NULL"
        timestamp updatedAt "NOT NULL"
    }

    PESTANA {
        varchar(36) pestana_id PK
        varchar(36) entidad_id FK "NOT NULL"
        varchar(50) codigo "NOT NULL"
        varchar(100) nombre "NOT NULL"
        integer orden "NOT NULL"
        boolean visible "NOT NULL DEFAULT TRUE"
        boolean editable "NOT NULL DEFAULT TRUE"
        boolean obligatorio "NOT NULL DEFAULT FALSE"
        timestamp createdAt "NOT NULL"
        timestamp updatedAt "NOT NULL"
    }

    CAMPO_PERSONALIZADO {
        varchar(36) campo_id PK
        varchar(36) entidad_id FK "NOT NULL"
        varchar(36) pestana_id FK
        varchar(50) codigo UK "NOT NULL"
        varchar(100) etiqueta "NOT NULL"
        varchar(30) tipo "NOT NULL"
        json opciones_json
        boolean requerido "NOT NULL DEFAULT FALSE"
        boolean visible "NOT NULL DEFAULT TRUE"
        integer orden "NOT NULL"
        json configuracion_json
        timestamp createdAt "NOT NULL"
        timestamp updatedAt "NOT NULL"
    }

    VALOR_CAMPO_PERSONALIZADO {
        varchar(36) valor_id PK
        varchar(36) campo_id FK "NOT NULL"
        varchar(36) entity_id FK "NOT NULL"
        text valor_texto
        decimal(15,4) valor_numero
        boolean valor_booleano
        date valor_fecha
        json valor_json
        timestamp createdAt "NOT NULL"
        timestamp updatedAt "NOT NULL"
    }

    DOCUMENTO_ADJUNTO {
        varchar(36) documento_adjunto_id PK
        varchar(36) entity_id FK
        varchar(36) document_id FK
        varchar(255) nombre_archivo "NOT NULL"
        varchar(100) tipo_mime "NOT NULL"
        varchar(512) ruta_archivo "NOT NULL"
        bigint tamanio_bytes
        text descripcion
        varchar(36) subido_por
        timestamp createdAt "NOT NULL"
        timestamp updatedAt "NOT NULL"
    }

    HISTORIAL_CAMBIOS {
        varchar(36) historial_id PK
        varchar(36) entity_id FK "NOT NULL"
        varchar(36) usuario_id
        varchar(50) accion "NOT NULL"
        varchar(100) campo_afectado
        text valor_anterior
        text valor_nuevo
        varchar(45) ip_origen
        timestamp createdAt "NOT NULL"
    }

    CONFIGURACION_SISTEMA {
        varchar(36) config_id PK
        varchar(100) clave UK "NOT NULL"
        text valor
        varchar(20) tipo
        varchar(255) descripcion
        boolean editable "NOT NULL DEFAULT TRUE"
        timestamp createdAt "NOT NULL"
        timestamp updatedAt "NOT NULL"
    }

    MODULO ||--o{ ENTIDAD : "contiene"
    ENTIDAD ||--o{ PESTANA : "tiene"
    ENTIDAD ||--o{ CAMPO_PERSONALIZADO : "define"
    PESTANA ||--o{ CAMPO_PERSONALIZADO : "agrupa"
    ENTITY ||--o{ DOCUMENT : "tiene"
    ENTITY ||--o{ VALOR_CAMPO_PERSONALIZADO : "posee"
    CAMPO_PERSONALIZADO ||--o{ VALOR_CAMPO_PERSONALIZADO : "tiene_valor"
    ENTITY ||--o{ DOCUMENTO_ADJUNTO : "adjunta"
    DOCUMENT ||--o{ DOCUMENTO_ADJUNTO : "adjunta"
    ENTITY ||--o{ HISTORIAL_CAMBIOS : "audita"
```

## 2. Diccionario de datos

### MODULO
Catálogo de módulos del sistema (base para agrupar entidades configurables).

### ENTIDAD
Entidades configurables por módulo. Define qué entidades soportan pestañas, campos personalizados y documentos.

### ENTITY
Maestro de entidades (clientes/proveedores/otros) utilizado como base para el ERP.

### DOCUMENT
Documentos transaccionales asociados a una `ENTITY`.

### PESTANA
Pestañas configurables para una `ENTIDAD`, organizadas por orden.

### CAMPO_PERSONALIZADO
Campos personalizados definidos para una `ENTIDAD` (pueden pertenecer a una `PESTAÑA`). Soporta tipos (texto, número, fecha, booleano, lista, JSON).

### VALOR_CAMPO_PERSONALIZADO
Valores almacenados para campos personalizados por instancia de `ENTITY`. Resuelve la relación N:M entre campos y entidades.

### DOCUMENTO_ADJUNTO
Archivos adjuntos asociados a `ENTITY` o `DOCUMENT`. Almacena metadatos (nombre, tipo MIME, ruta, tamaño).

### HISTORIAL_CAMBIOS
Bitácora de auditoría para rastrear cambios en `ENTITY` (acción, campo afectado, valores anterior/nuevo, IP).

### CONFIGURACION_SISTEMA
Parámetros globales del sistema (clave-valor), con control de editabilidad.

## 3. Cardinalidad y resolución N:M

| Relación | Cardinalidad | Resolución |
|---|---|---|
| MODULO - ENTIDAD | 1:N | Directa vía `ENTIDAD.modulo_id` (FK) |
| ENTIDAD - PESTANA | 1:N | Directa vía `PESTANA.entidad_id` (FK) |
| ENTIDAD - CAMPO_PERSONALIZADO | 1:N | Directa vía `CAMPO_PERSONALIZADO.entidad_id` (FK) |
| PESTANA - CAMPO_PERSONALIZADO | 1:N (opcional) | Directa vía `CAMPO_PERSONALIZADO.pestana_id` (FK, NULL) |
| ENTITY - DOCUMENT | 1:N | Directa vía `DOCUMENT.entity_id` (FK) |
| ENTITY - VALOR_CAMPO_PERSONALIZADO | 1:N | Tabla intermedia lógica: `VALOR_CAMPO_PERSONALIZADO` vincula `ENTITY` y `CAMPO_PERSONALIZADO` |
| CAMPO_PERSONALIZADO - VALOR_CAMPO_PERSONALIZADO | 1:N | Directa vía `VALOR_CAMPO_PERSONALIZADO.campo_id` (FK) |
| ENTITY - DOCUMENTO_ADJUNTO | 1:N | Directa vía `DOCUMENTO_ADJUNTO.entity_id` (FK, NULL) |
| DOCUMENT - DOCUMENTO_ADJUNTO | 1:N | Directa vía `DOCUMENTO_ADJUNTO.document_id` (FK, NULL) |
| ENTITY - HISTORIAL_CAMBIOS | 1:N | Directa vía `HISTORIAL_CAMBIOS.entity_id` (FK) |

**N:M resueltas:** `ENTITY` ↔ `CAMPO_PERSONALIZADO` se resuelve con `VALOR_CAMPO_PERSONALIZADO` (clave primaria propia + FK compuestas lógicas).

## 4. Normalización a 3FN

- **1FN:** Todos los atributos son atómicos. Los valores de listas se almacenan en `opciones_json` o se normalizarían en tablas futuras; los valores de campos personalizados se atomizan en `VALOR_CAMPO_PERSONALIZADO`.
- **2FN:** No existen claves compuestas como PK primaria, todas las entidades tienen clave sustituta (`*_id` UUID/varchar). Todos los atributos no clave dependen completamente de la PK.
- **3FN:** Sin dependencias transitivas. Datos maestros (`MODULO`, `ENTIDAD`, `CONFIGURACION_SISTEMA`) separados. `PESTANA` depende de `ENTIDAD`, `CAMPO_PERSONALIZADO` de `ENTIDAD`/`PESTANA`, valores dependen de `CAMPO_PERSONALIZADO` y `ENTITY`. Auditoría separada en `HISTORIAL_CAMBIOS`.

## 5. Reglas de integridad
- Claves primarias con UUID (`VARCHAR(36)`) o identificadores únicos.
- Claves foráneas con integridad referencial.
- Unicidad en `codigo`, `entity_id`, `clave` según aplique.
- Validaciones con `CHECK` recomendadas (ej. `folio > 0`, `tamanio_bytes >= 0`).
- Campos de auditoría `createdAt`/`updatedAt` en entidades transaccionales/configurables.
