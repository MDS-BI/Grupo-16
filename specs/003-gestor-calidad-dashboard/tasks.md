# Tasks: Panel de inicio ERP para el Gestor de Calidad (HU3)

**Input**: Design documents from `/specs/003-gestor-calidad-dashboard/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, quickstart.md

**Tests**: Incluidas porque FR-016 de `spec.md` exige pruebas unitarias y de integración.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verificar la base existente; no se añaden dependencias ni carpetas nuevas.

- [X] T001 Verificar la estructura Vite existente, `package.json` y los patrones de `.gitignore` para Node en la raíz del repositorio
- [X] T002 [P] Confirmar que los ids DOM y permisos de `contracts/dashboard-ui.md` coinciden con `index.html` y `src/app.js`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Unificar el cálculo de KPIs en una función pura antes de cablear la interfaz.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T003 [P] Añadir pruebas unitarias de `dashboardCounts` (vacío, enteros, lotes activos, inspecciones, NCR/CAPA abiertas, pureza) en `tests/unit/dashboard.test.js`
- [X] T004 Extender `dashboardCounts` en `src/components/dashboard.js` para contar `inspections` y `openFindings` con estados normalizados, sin mutar entradas ni devolver valores no numéricos

**Checkpoint**: El contrato `contracts/kpi-counts.md` está cubierto por pruebas y la función pura está lista para consumirse desde la vista.

---

## Phase 3: User Story 1 - Ver KPIs confiables en el panel (Priority: P1) 🎯 MVP

**Goal**: Cuatro tarjetas con contadores reales, `0` cuando no hay datos y actualización al volver al panel.

**Independent Test**: Abrir `/` vacío → cuatro `0`; cargar datos de ejemplo → contadores coinciden con `contracts/kpi-counts.md`; crear/eliminar en otra vista y volver → contadores actualizados.

### Tests for User Story 1

- [X] T005 [P] [US1] Añadir pruebas de integración para el estado vacío y el recálculo de `#stat-*` en `tests/integration/dashboard.test.js`

### Implementation for User Story 1

- [X] T006 [P] [US1] Añadir ids a las etiquetas de las cuatro tarjetas KPI en `index.html`
- [X] T007 [US1] Usar `dashboardCounts` con filas maestras etiquetadas (`masterType`) en `updateDashboardStats` de `src/app.js` para actualizar `#stat-lots-active`, `#stat-products-total`, `#stat-inspections-total` y `#stat-ncr-capa-open`
- [X] T008 [US1] Aplicar las etiquetas configuradas con `statDefinitions` en `src/app.js`

**Checkpoint**: Los cuatro KPIs son correctos, están etiquetados desde la configuración y se recalculan al entrar al panel.

---

## Phase 4: User Story 2 - Iniciar flujos desde acciones rápidas (Priority: P1)

**Goal**: Siete acciones rápidas en dos grupos, con formularios limpios y permisos granulares.

**Independent Test**: Pulsar cada `action-new-*` desde el panel y verificar formulario vacío; cambiar a Auditor y verificar que no aparecen botones de creación.

### Tests for User Story 2

- [X] T009 [P] [US2] Añadir pruebas de integración para formularios limpios y visibilidad por permiso de las siete acciones en `tests/integration/dashboard.test.js`

### Implementation for User Story 2

- [X] T010 [P] [US2] Añadir ids a las etiquetas de los botones y `aria-hidden="true"` a los iconos en `index.html`
- [X] T011 [US2] Aplicar etiquetas configuradas con `quickActionDefinitions` y conservar el reinicio de formularios en `src/app.js`

**Checkpoint**: Las acciones rápidas funcionan de forma independiente, respetan permisos y usan la terminología configurada.

---

## Phase 5: User Story 3 - Acceder a catálogos y búsqueda global (Priority: P2)

**Goal**: Accesos directos a gestión y búsqueda, con foco automático y retorno al panel con KPIs vigentes.

**Independent Test**: Pulsar `#action-manage-catalogs` → vista de gestión; volver al panel y pulsar `#action-global-search` → foco en `#search-input`.

### Tests for User Story 3

- [X] T012 [P] [US3] Añadir pruebas de integración de navegación, autofocus y retorno al panel en `tests/integration/dashboard.test.js`

### Implementation for User Story 3

- [X] T013 [US3] Verificar y reforzar el cableado de `#action-manage-catalogs` y `#action-global-search` con foco en `#search-input` en `src/app.js`
- [X] T014 [US3] Garantizar que ambos accesos permanezcan visibles para perfiles con `read` en `refreshRoleViews` de `src/app.js`

**Checkpoint**: La navegación desde el panel funciona en los cuatro perfiles y los KPIs se actualizan al regresar.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verificación completa y documentación del resultado.

- [X] T015 [P] Ejecutar `npx vitest run` y corregir cualquier fallo en `tests/unit/` y `tests/integration/`
- [X] T016 Ejecutar `npm run lint`, `npm run format:check`, `npm run build` y `node --test tests/demo-smoke.mjs` desde la raíz del repositorio
- [X] T017 Registrar los resultados de validación en `specs/003-gestor-calidad-dashboard/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sin dependencias
- **Foundational (Phase 2)**: Depende de Phase 1; bloquea todas las historias
- **User Stories (Phase 3-5)**: Dependen de Phase 2; se ejecutan en orden de prioridad
- **Polish (Phase 6)**: Depende de las tres historias

### User Story Dependencies

- **US1 (P1)**: Sin dependencias entre historias; usa la función de Phase 2
- **US2 (P1)**: Independiente de US1; comparte `index.html` con US1 (secuencial por archivo)
- **US3 (P2)**: Independiente de US1/US2; comparte `src/app.js` (secuencial por archivo)

### Within Each User Story

- Pruebas primero, luego implementación
- Un mismo archivo (`src/app.js`, `index.html`, `tests/integration/dashboard.test.js`) se edita secuencialmente

### Parallel Opportunities

- T002 y T003 pueden ejecutarse en paralelo
- T005 y T006 pueden ejecutarse en paralelo
- T009 y T010 pueden ejecutarse en paralelo
- T012 puede ejecutarse en paralelo con revisiones de documentación

---

## Implementation Strategy

### MVP First (User Story 1)

1. Completar Phase 1 y Phase 2
2. Completar Phase 3 (US1) y validar los KPIs de forma independiente
3. Continuar con US2 y US3

### Incremental Delivery

1. Setup + Foundational → contrato de KPIs probado
2. US1 → panel con métricas correctas (MVP)
3. US2 → acciones rápidas con permisos
4. US3 → navegación y búsqueda con foco
5. Polish → validación completa

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- No se crean nuevas claves de `localStorage` ni dependencias
- Cada tarea completada se marca `[X]` antes de pasar a la siguiente
