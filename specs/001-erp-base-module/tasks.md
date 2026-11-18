# Tareas: Módulo de Gestión de Calidad (001-erp-base-module)

**Entrada**: `spec.md`, `plan.md`, `data-model.md`, `contracts/`, `research.md`, `quickstart.md`.
**Estado**: implementación MVP completada en la raíz del repositorio.

> Las fases históricas T001–T130 describían primero un módulo genérico Entidad/Documento y luego una convergencia. Fueron superadas por la integración del MVP de Gestión de Calidad; este archivo registra el trabajo entregado y verificable.

## Fase 1: Configuración y estructura

- [X] T001 Estructura Vite con `src/`, `tests/`, `index.html`, `package.json` y scripts `dev`, `build`, `test`
- [X] T002 Dependencias Vite, Vitest y jsdom instaladas y versionadas en `package.json`
- [X] T003 `.gitignore` con `node_modules/`, `dist/`, `build/`, `coverage/`, `.env*`, logs y artefactos del sistema
- [X] T004 Módulos separados: `src/store.js`, `src/app.js`, `src/demo-data.js`, `src/module-config.js`, `src/styles.css`
- [X] T005 Configuración de Vitest limitada a `tests/**` y aislada de `PROPUESTA-MVP/**`

## Fase 2: Dominio y almacenamiento

- [X] T006 Modelo `emptyDB()` con los siete catálogos y esquema versionado en `localStorage` (`grupo16:gestion-calidad:v1`)
- [X] T007 IDs internos estables (`tipo-0001`) y marcas `createdAt`/`updatedAt`
- [X] T008 Códigos únicos por tipo y permitidos entre tipos distintos
- [X] T009 Validación de campos obligatorios por catálogo con mensajes en español
- [X] T010 Validación de claves foráneas: lote→producto, empleado→área, inspección/NCR→lote, CAPA→NCR
- [X] T011 Validación de fechas de fabricación/caducidad en lotes
- [X] T012 Estado inicial y transiciones autorizadas de NCR (ABIERTA, EN_INVESTIGACION, EN_CAPA, CERRADA, RECHAZADA)
- [X] T013 Estados permitidos de CAPA
- [X] T014 Eliminación bloqueada con dependientes y cascada recursiva confirmada
- [X] T015 Búsqueda insensible a mayúsculas en todos los campos y catálogos
- [X] T016 Estadísticas: maestros, operativos, NCR abiertas, inspecciones y CAPA pendientes
- [X] T017 Fecha objetivo opcional y validada en los cuatro datos maestros
- [X] T018 Campos personalizados declarativos con tipos `text`, `number`, `decimal`, `date`, `select` y `boolean`, obligatoriedad y validación

## Fase 3: Datos simulados

- [X] T019 `createDemo()` con siete tipos, claves válidas y relaciones coherentes
- [X] T020 Acción “Cargar datos DEMO” con confirmación cuando existen datos
- [X] T021 Exportación de respaldo JSON

## Fase 4: Interfaz de usuario

- [X] T022 Marco persistente con barra superior, marca, nombre del módulo y barra lateral de cuatro vistas
- [X] T023 Panel con indicadores, actividad reciente y accesos rápidos
- [X] T024 Datos maestros: alta, edición, eliminación, selector de tipo, filtro y tabla
- [X] T025 Registros operativos: alta, edición, eliminación, selector de tipo, filtro y tabla
- [X] T026 Formularios con tipos de entrada adecuados y errores por campo
- [X] T027 NCR: solo estados alcanzables al editar y estado visible en listas
- [X] T028 Búsqueda global, estados vacíos y trazabilidad por lote
- [X] T029 Diálogos accesibles, foco, confirmaciones y avisos tipo toast
- [X] T030 Diseño responsive para escritorio, tablet y móvil

## Fase 5: Configuración

- [X] T031 `loadModuleConfig()` con valores predeterminados de Gestión de Calidad y configuración opcional
- [X] T032 Validación de configuración con reporte de errores y retroceso seguro (acento, targets, tipos, ciclo de vida)
- [X] T033 Nombre del módulo, etiquetas de navegación y color de acento aplicados desde la configuración
- [X] T034 Campos personalizados visibles en formularios, listas y búsqueda
- [X] T035 Renderizado de datos de usuario con `textContent` para evitar inyección HTML

## Fase 6: Pruebas y verificación

- [X] T036 19 pruebas de dominio: catálogos, IDs, duplicados, obligatorios, FK, fechas, NCR, CAPA, cascada, búsqueda, estadísticas y DEMO
- [X] T037 6 pruebas de configuración: valores predeterminados, errores, tipos de campo, obligatorios, fecha objetivo y ciclo de vida
- [X] T038 3 pruebas de humo DOM: marco, métricas, catálogos y navegación
- [X] T039 `npx vitest run` sin fallos (28 pruebas)
- [X] T040 `npm run build` sin errores y con salida en `dist/`

## Fase 7: Documentación y cierre

- [X] T041 `README.md` y `specs/001-erp-base-module/quickstart.md` actualizados al MVP de calidad
- [X] T042 `plan.md` actualizado con la arquitectura final y estado de integración
- [X] T043 Modelo ER y diagrama restaurados en `specs/001-erp-base-module/modelo_entidad_relacion_gestion_calidad.md` y `diagrama_ER_Gestion_Calidad.md`
- [X] T044 Eliminación del módulo genérico Entidad/Documento y de su suite obsoleta de la raíz
