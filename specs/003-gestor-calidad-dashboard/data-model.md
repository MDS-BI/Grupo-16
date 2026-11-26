# Modelo de Datos: Panel de inicio ERP para el Gestor de Calidad (HU3)

## Principio

La HU3 no introduce entidades persistentes. Todos los modelos de esta sección son **vistas de solo lectura** derivadas de los registros ya almacenados en `localStorage`. No se crean ni modifican claves de almacenamiento.

## KpiSnapshot

Vista con los cuatro contadores exigidos por la HU3 más dos apoyos internos para el estado vacío.

| Campo | Tipo | Origen | Regla de cálculo |
|-------|------|--------|------------------|
| `activeLots` | `number` (entero ≥ 0) | `quality-lots` | `activo !== false` y `estado`/`status` en minúsculas sin `inactivo` ni `cerrado` |
| `products` | `number` (entero ≥ 0) | `quality-products` | Todos los productos registrados |
| `inspections` | `number` (entero ≥ 0) | `quality-documents` | Documentos de tipo Inspección, sin filtro temporal ni de estado |
| `openFindings` | `number` (entero ≥ 0) | `quality-documents` | NCR y CAPA con `status` normalizado sin `cerrad`, `rechazad`, `resuelt`, `closed`, `resolved`, `complet`, `done`, `cancel` |
| `lots` | `number` (entero ≥ 0) | `quality-lots` | Apoyo: total de lotes, usado para detectar estado vacío |
| `areas` | `number` (entero ≥ 0) | `quality-areas` | Apoyo: total de áreas |
| `employees` | `number` (entero ≥ 0) | `quality-employees` | Apoyo: total de empleados |

**Validación**: todos los campos se inicializan en `0`; valores `null`, `undefined`, `NaN` o cadenas no numéricas nunca se exponen a la vista. `dashboardCounts` es pura: no muta las listas de entrada.

**Relaciones**: `KpiSnapshot` se calcula a partir de `MasterRecord[]` y `OperationalRecord[]`; no tiene identificador ni ciclo de vida.

## QuickActionDefinition

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `string` | Identificador DOM estable (p. ej., `action-new-lot`, `action-new-ncr`) |
| `label` | `string` | Texto visible derivado de `module-config.js` con valor predeterminado seguro |
| `icon` | `string` | Glifo decorativo con `aria-hidden="true"` |
| `group` | `'master' \| 'operational' \| 'navigation'` | Grupo visual al que pertenece |
| `permission` | `string` | Permiso requerido: `create-master-data`, `register-inspections`, `report-ncr`, `create-operational` o `read` |
| `target` | `'form:master' \| 'form:operational' \| 'manage' \| 'search'` | Destino de la navegación |

**Validación**: `permission` debe existir en `PERMISSIONS` de `src/permissions.js`; `target` debe mapear a una vista existente. Si falta la configuración de etiquetas se usa el texto predeterminado en español.

## DashboardState

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `kpis` | `KpiSnapshot` | Recuentos vigentes al mostrar el panel |
| `actions` | `QuickActionDefinition[]` | Acciones filtradas por los permisos del usuario activo |
| `isEmpty` | `boolean` | `true` cuando todas las colecciones maestras y operativas están vacías |

**Transiciones de estado**: no hay ciclo de vida persistente. `DashboardState` se reconstruye en cada visita al panel; al crear o eliminar registros en otra vista, el estado anterior se descarta.

## Entidades existentes utilizadas (solo lectura)

- **MasterRecord**: Lote, Producto, Área Organizativa o Empleado. Campos relevantes para el panel: `masterType`/`tipoItem`, `name`, `code`, `activo`, `estado`/`status`.
- **OperationalRecord**: Inspección, NCR o CAPA. Campos relevantes: `tipoDoc`/`type`/`docType`, `status`, `fecha`/`date`.

La clasificación por texto se normaliza a minúsculas y tolera acentos parciales (`área` vs `area`, `ncr` vs `no conform`). Un registro no clasificado no afecta ningún contador.

## Reglas de integridad

1. Los contadores nunca son negativos ni fraccionarios.
2. `openFindings ≤` número total de NCR y CAPA; `activeLots ≤ lots`.
3. El panel no escribe en `localStorage`: crear o eliminar registros sigue siendo responsabilidad exclusiva de los formularios y la vista de gestión.
4. La visibilidad de acciones respeta la matriz de `src/permissions.js`; el estado `isEmpty` no oculta los contadores `0`.
