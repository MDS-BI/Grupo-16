# Investigación: Panel de inicio ERP para el Gestor de Calidad (HU3)

## Decisión 1: Definición de "Lotes activos"

**Decisión**: Un lote se cuenta como activo cuando `activo !== false` y su `estado`/`status`, normalizado a minúsculas, no contiene `inactivo` ni `cerrado`. Un campo ausente o con valor desconocido cuenta como activo.

**Justificación**: La especificación original pide "Total de Lotes activos" sin definir el estado; `src/components/dashboard.js:47` ya usa exactamente esa heurística. Formalizarla evita cambiar el significado de un KPI que los usuarios ya ven y permite registrar lotes nuevos sin obligar a completar un campo de estado.

**Alternativas consideradas**:
- Contar todos los lotes: contradice la etiqueta "activos" y oculta bajas de lotes cerrados.
- Exigir un campo `estado` obligatorio: rompe la compatibilidad con registros históricos y añade migración fuera del alcance de la HU3.
- Derivar el estado de la fecha de caducidad: introduce una regla no solicitada y dependiente de formatos de fecha heterogéneos.

## Decisión 2: "Inspecciones realizadas" son totales, no del mes

**Decisión**: El KPI cuenta todas las inspecciones almacenadas, sin filtro temporal ni por estado.

**Justificación**: El escenario de aceptación 2 de la HU3 (`specs/001-erp-base-module/spec.md:58`) indica explícitamente "totales", mientras que la descripción del layout (`spec.md:66`) dice "del mes o totales". El escenario tiene prioridad porque es el criterio verificable; además evita depender de la zona horaria del navegador.

**Alternativas consideradas**:
- Filtrar por mes actual: ambiguo sobre mes natural vs. últimos 30 días y frágil en pruebas con fechas relativas.
- Contar solo inspecciones con resultado ACEPTADO: reduciría el indicador y contradice "realizadas".

## Decisión 3: "NCR/CAPA abiertas" por normalización de estado

**Decisión**: Se cuentan las NCR y CAPA cuyo `status`, convertido a cadena y a minúsculas, no contiene `cerrad`, `rechazad`, `resuelt`, `closed`, `resolved`, `complet`, `done` ni `cancel`. Los estados configurables `ABIERTA`, `EN_INVESTIGACIÓN` y `EN_CAPA` cuentan como abiertos.

**Justificación**: El módulo admite estado libre y ciclo de vida configurado; una comparación exacta contra un único valor dejaría fuera registros legítimos. La normalización por subcadena tolera acentos, mayúsculas y textos como "Cerrada por CAPA".

**Alternativas consideradas**:
- Comparar `status === 'ABIERTA'`: excluye `EN_INVESTIGACIÓN` y `EN_CAPA`, que siguen abiertos.
- Usar la matriz de transiciones: requiere leer la configuración en el panel y acopla el KPI a un módulo opcional.

## Decisión 4: Contadores siempre enteros

**Decisión**: `dashboardCounts` devuelve siempre un objeto con siete claves numéricas; cualquier valor ausente o no numérico se inicializa en `0`. La interfaz renderiza `Number(value) || 0`.

**Justificación**: La HU3 exige `0` cuando no hay datos y prohíbe `null`/`undefined`. Doble protección (función pura + render) cubre datos corruptos en `localStorage` sin lanzar excepciones.

**Alternativas consideradas**:
- Mostrar guion (`—`) cuando no hay datos: incumple el criterio explícito de contador `0`.
- Dejar que la vista formatee valores crudos: acopla la lógica al DOM y dificulta las pruebas unitarias.

## Decisión 5: Permisos en las acciones rápidas

**Decisión**: El panel se muestra a cualquier usuario con permiso `read`; los cuatro botones de creación maestra requieren `create-master-data`, Nueva Inspección requiere `register-inspections`, Nueva NCR requiere `report-ncr`, Nueva CAPA requiere `create-operational`, y los accesos a gestión y búsqueda requieren `read`. Se reutilizan `can()` y `requiredPermission()` de `src/permissions.js`, ya aplicados en `src/app.js:152-162`.

**Justificación**: La HU3 no menciona permisos, pero la HU14/HU15 y `src/permissions.js:44` definen la matriz de roles; mostrar botones que luego fallan sería una experiencia inconsistente (principio III de la constitución). El Auditor conserva KPIs y consulta.

**Alternativas consideradas**:
- Mostrar todos los botones a todos los roles y validar solo al guardar: contradice las mejoras de permisos ya integradas.
- Ocultar el panel completo a roles sin creación: el Auditor perdería los KPIs que necesita para auditar.

## Decisión 6: Responsable de la historia

**Decisión**: Se mantiene `Asignado a: [Pendiente]` en la especificación derivada; no se inventa un nombre.

**Justificación**: `feedback.md:29` y `docs/REVISION_PROPUESTA.md:6` señalan que los responsables de HU3/HU4 están pendientes y que no deben inventarse nombres.

**Alternativas consideradas**:
- Asignar al rol "Gestor de Calidad" como persona: confunde rol con responsable nominal.
- Inventar un nombre: contradice el feedback del equipo.

## Decisión 7: Reutilizar la implementación existente

**Decisión**: Ajustar `src/components/dashboard.js`, `src/app.js`, `index.html` y `src/styles.css` en lugar de crear un módulo nuevo.

**Justificación**: El commit `64ed1f3` ya integró el rediseño de la HU3 y sus ids DOM (`stat-lots-active`, `action-new-lot`, etc.) son usados por pruebas existentes. Rehacer el panel generaría regresiones y trabajo duplicado.

**Alternativas consideradas**:
- Crear `src/components/quality-dashboard.js` paralelo: duplicaría responsabilidades y obligaría a migrar pruebas.
- Reescribir el panel desde cero: alto riesgo para una funcionalidad ya mergeada.

## Decisión 8: Estrategia de pruebas

**Decisión**: Pruebas unitarias puras para `dashboardCounts` y pruebas de integración con jsdom para render, permisos, autofocus y navegación; ejecutar `npx vitest run` antes de marcar tareas completas.

**Justificación**: El principio II de la constitución exige cobertura automática antes de completar; la lógica de conteo es pura y la interfaz ya tiene infraestructura Vitest/jsdom en `tests/integration/`.

**Alternativas consideradas**:
- Solo pruebas manuales en navegador: no verificable en CI y contradice la constitución.
- Pruebas end-to-end con Playwright: añadiría una dependencia no instalada y fuera del alcance.

## Decisión 9: Momento del recálculo de KPIs

**Decisión**: Recalcular los KPIs cada vez que el panel se muestra, leyendo el almacenamiento en ese momento; no suscribirse a eventos de `storage` ni mantener caché entre vistas.

**Justificación**: La HU3 exige que las tarjetas reflejen cambios al volver al panel. Una sola pasada O(n) al entrar es suficiente incluso con 500 registros y evita estado duplicado.

**Alternativas consideradas**:
- Caché invalidada por eventos `storage`: no detecta cambios internos del mismo documento y añade complejidad.
- Observar cada mutación del estado global: acopla el panel a todos los formularios y aumenta re-renderizados.

## Resumen de clarificaciones resueltas

| Ambigüedad original | Resolución |
|---------------------|------------|
| Lotes "activos" sin definir | `activo !== false` y sin `inactivo`/`cerrado` |
| "Del mes o totales" | Totales |
| NCR/CAPA "abiertas" sin definir | Estado normalizado sin `cerrad`/`rechazad`/`resuelt`/`closed`/`resolved`/`complet`/`done`/`cancel` |
| Contadores vacíos | Entero `0`, nunca `null`/`undefined` |
| Permisos no especificados en HU3 | Matriz granular existente de `src/permissions.js` |
| Responsable pendiente | Se conserva `[Pendiente]` |
