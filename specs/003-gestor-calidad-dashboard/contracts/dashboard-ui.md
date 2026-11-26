# Contrato de Interfaz de Usuario del Panel (HU3)

## Alcance

Define el contrato observable del panel de inicio en `index.html` y `src/components/dashboard.js`: identificadores DOM, estructura, accesibilidad, permisos y navegación. Es un contrato de aplicación web (no una API HTTP).

## Estructura observable

| Elemento | Identificador / selector | Requisito |
|----------|--------------------------|-----------|
| Tarjeta KPI Lotes activos | `#stat-lots-active` | Contador entero, `0` cuando no hay datos |
| Tarjeta KPI Productos | `#stat-products-total` | Contador entero, `0` cuando no hay datos |
| Tarjeta KPI Inspecciones | `#stat-inspections-total` | Contador entero, `0` cuando no hay datos |
| Tarjeta KPI NCR/CAPA abiertas | `#stat-ncr-capa-open` | Contador entero, `0` cuando no hay datos |
| Acción Nuevo Lote | `#action-new-lot` | Botón `type="button"`, visible solo con `create-master-data` |
| Acción Nuevo Producto | `#action-new-product` | Igual que `#action-new-lot` |
| Acción Nueva Área | `#action-new-area` | Igual que `#action-new-lot` |
| Acción Nuevo Empleado | `#action-new-employee` | Igual que `#action-new-lot` |
| Acción Nueva Inspección | `#action-new-inspection` | Botón `type="button"`, visible solo con `register-inspections` |
| Acción Nueva NCR | `#action-new-ncr` | Visible solo con `report-ncr` |
| Acción Nueva CAPA | `#action-new-capa` | Visible solo con `create-operational` |
| Gestionar catálogos | `#action-manage-catalogs` | Botón visible con `read`, abre gestión de maestros |
| Búsqueda global | `#action-global-search` | Botón visible con `read`, abre búsqueda con autofocus |
| Estado vacío | `.empty-state` | Texto claro cuando no hay registros; no sustituye los contadores |
| Módulo activo | `[aria-current="page"]` | Barra lateral marca "Panel" cuando esta vista está visible |

## Comportamiento

1. **Carga**: al entrar en `/`, los cuatro contadores se renderizan desde `localStorage` antes de cualquier interacción.
2. **Recálculo**: al volver al panel desde gestión, búsqueda o historial del navegador, los contadores se recalculan.
3. **Formularios limpios**: cada acción `action-new-*` abre su formulario con valores iniciales vacíos; no se reutiliza el estado de una edición anterior.
4. **Autofocus**: activar `#action-global-search` coloca el foco del teclado en `#search-input`.
5. **Permisos**: los botones de creación se ocultan del DOM cuando el perfil activo no tiene el permiso correspondiente (`create-master-data`, `register-inspections`, `report-ncr` o `create-operational`), usando `can(user, permission)`; no basta con deshabilitarlos visualmente.
6. **Etiquetas**: texto de KPIs y botones derivado de `labels` en `src/module-config.js`, con predeterminados en español.
7. **Accesibilidad**: botones nativos, foco visible, iconos con `aria-hidden="true"`, contraste acorde al tema y adaptación a viewport estrecho según `src/styles.css`.
8. **Inmutabilidad**: el panel no modifica registros ni claves de almacenamiento.

## Contrato de error

- Si una clave de almacenamiento falta o contiene JSON inválido, el panel muestra `0` y un estado vacío, sin errores en consola ni vista rota.
- Si el perfil activo no es reconocido, se aplica el comportamiento de `can()`: sin permisos de creación, con acceso de solo lectura a KPIs y búsqueda.

## Verificación

Los escenarios ejecutables están en [quickstart.md](../quickstart.md); las reglas de conteo que alimentan esta interfaz están en [kpi-counts.md](kpi-counts.md).
