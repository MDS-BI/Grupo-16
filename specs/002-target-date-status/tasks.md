# Tasks: Seguimiento de Fecha Objetivo (HU9)

**Input**: Design documents from `/specs/002-target-date-status/`

**Prerequisites**: `spec.md`, `checklists/requirements.md`

**Tests**: Incluidas porque la constitución del proyecto exige cobertura automática de comportamiento visible.

## Phase 1: Foundational

**Purpose**: Utilidades puras y campos base compartidos por entidades y documentos.

- [X] T001 Crear utilidades de fecha/estado en `src/target-date.js`: Validación, días restantes, colores, ordenación y filtrado.
- [X] T002 Ampliar `src/module-config.js` con los campos base de planificación para entidades y documentos.

## Phase 2: User Story 1 - Asignar fecha objetivo, acción y responsable (Priority: P1)

**Goal**: Guardar la planificación opcional sin impedir registros sin fecha.

**Independent Test**: Crear/editar un registro con fecha, tipo de acción y responsable; repetir sin fecha.

- [X] T003 [US1] Añadir campos de planificación al formulario de entidades en `index.html`.
- [X] T004 [US1] Añadir campos de planificación al formulario de documentos en `index.html`.
- [X] T005 [US1] Persistir y validar planificación en `src/storage.js` para entidades y documentos.
- [X] T006 [US1] Conectar los formularios de `src/app.js` con los nuevos campos y mensajes de error.

## Phase 3: User Story 2 - Ver estado por color y marcar como realizada (Priority: P1)

**Goal**: Mostrar verde/amarillo/rojo/completada de forma inmediata.

**Independent Test**: Preparar fechas relativas a hoy y marcar un registro como realizado.

- [X] T007 [US2] Renderizar insignias de estado en listas de entidades y documentos en `src/app.js`.
- [X] T008 [US2] Dar estilo a los estados de fecha en `src/styles.css`.

## Phase 4: User Story 3 - Ordenar y filtrar la lista (Priority: P2)

**Goal**: Priorizar vencidos y permitir filtrar por estado.

**Independent Test**: Ordenar una lista mixta y aplicar cada filtro de estado.

- [X] T009 [US3] Añadir sección de seguimiento con controles de orden y filtro en `index.html`.
- [X] T010 [US3] Renderizar la lista de seguimiento ordenada y filtrada en `src/app.js`.

## Phase 5: User Stories 4 y 5 - Validación, permisos e historial (Priority: P2)

**Goal**: Evitar fechas inválidas, confirmar fechas pasadas, proteger edición y auditar cambios.

**Independent Test**: Intentar guardar una fecha inválida y una pasada; verificar modo solo consulta e historial.

- [X] T011 [US4] Confirmar fechas anteriores a hoy antes de guardar en `src/app.js`.
- [X] T012 [US5] Bloquear edición para usuarios de solo consulta en `src/app.js`.
- [X] T013 [US5] Registrar cada cambio de planificación con usuario, fecha y hora en `src/storage.js`.

## Phase 6: Verification

- [X] T014 [P] Añadir pruebas unitarias de utilidades en `tests/unit/target-date.test.js`.
- [X] T015 [P] Añadir pruebas de integración de HU9 en `tests/integration/target-date.test.js`.
- [X] T016 Actualizar pruebas de almacenamiento afectadas por el cambio de regla de fechas pasadas en `tests/unit/storage.test.js`.
- [X] T017 Ejecutar suite completa y `npm run build`.
