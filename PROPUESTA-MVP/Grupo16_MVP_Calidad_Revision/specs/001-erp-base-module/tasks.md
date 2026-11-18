# Tareas consolidadas — Grupo 16 (copia de revisión)

**Convención:** `[x]` = se verifica en el código de **esta copia** o mediante sus 18 pruebas; `[ ]` = pendiente. Los números R01–R45 identifican tareas de este MVP reconstruido y **no sustituyen** los IDs T001–T115 del repositorio original. Se preserva la trazabilidad a HU.

## Fase A: especificación y organización
- [x] R01 [US1–US13] Redactar historias orientadas a Gestión de Calidad con actores y aceptación en `spec.md`.
- [x] R02 [US11] Unificar significado de auditoría/trazabilidad en spec, plan y tareas.
- [x] R03 [GLOBAL] Mantener estructura Spec Kit en `specs/001-erp-base-module/`.
- [x] R04 [GLOBAL] Crear auditoría documental cruzada con feedback 26/10, 02/11, 16/11.
- [ ] R05 [US2,US3,US4] Confirmar responsables con el grupo; registrar autores reales en el repositorio.
- [ ] R06 [GLOBAL] Verificar trazabilidad individual de tareas en commits/PR del repositorio compartido.

## Fase B: dominio y persistencia
- [x] R07 [US1] Crear cuatro catálogos maestros con atributos propios.
- [x] R08 [US1] Implementar creación y validación de maestro con código único.
- [x] R09 [US2] Actualizar y eliminar con protección referencial.
- [x] R10 [US2] Confirmar eliminación en cascada y actualizar la pantalla.
- [x] R11 [US9] Validar consistencia de fechas de lotes.
- [x] R12 [US10] Añadir inspecciones, NCR, CAPA con relaciones.
- [x] R13 [US10] Rechazar referencias inválidas.
- [x] R14 [US12] Reglas de ciclo de vida y transiciones para NCR.
- [x] R15 [US12] Exponer estado de NCR en los listados.
- [x] R16 [GLOBAL] Persistir en localStorage bajo esquema versionado.
- [ ] R17 [GLOBAL] Hacer migración formal del almacenamiento ERP histórico a este modelo.

## Fase C: experiencia de usuario
- [x] R18 [US3] Panel con indicadores derivados de datos reales.
- [x] R19 [US3] Accesos rápidos y actividad reciente.
- [x] R20 [US4] Pantallas de gestión y modales de edición.
- [x] R21 [US8] Filtros parciales de maestros.
- [x] R22 [US11] Búsqueda transversal y trazabilidad por lote.
- [x] R23 [US13] Menú persistente y marcado de vista activa.
- [x] R24 [US13] Interfaz responsive, etiquetas accesibles y foco visible.
- [x] R25 [US6] Reemplazar nombres genéricos en vistas de Gestión de Calidad.
- [ ] R26 [US5] Permitir escoger perfil desde un archivo externo, sin modificar código central.
- [ ] R27 [US6] Permitir configurar cualquier etiqueta y recuperar defaults al eliminar el perfil.
- [ ] R28 [US7] Renderizar completamente campos personalizados declarados por perfil en formularios, validación, listas y búsqueda.
- [ ] R29 [US11] Añadir informes de auditoría avanzados con historial inmutable.

## Fase D: demostración y calidad
- [x] R30 [GLOBAL] Crear lote coherente de datos de prueba 100% ficticios.
- [x] R31 [GLOBAL] Añadir botón para cargar DEMO con confirmación de sobrescritura.
- [x] R32 [GLOBAL] Añadir exportación JSON de respaldo.
- [x] R33 [GLOBAL] Ejecutar 18 pruebas automatizadas de dominio sin errores.
- [x] R34 [GLOBAL] Generar carpeta `dist/` con build estático.
- [ ] R35 [GLOBAL] Probar interacción completa en Chrome, Edge y móvil con evidencia.
- [ ] R36 [GLOBAL] Ejecutar benchmark con 500 registros.
- [ ] R37 [GLOBAL] Vincular el conjunto de pruebas Vitest histórico al nuevo dominio o retirarlo tras revisión técnica.
- [ ] R38 [GLOBAL] Revisar protección contra XSS, límites de almacenamiento y políticas de acceso antes de producción.

## Fase E: integración y entrega grupal
- [x] R39 [GLOBAL] Documentar hallazgos, riesgos y guía de integración.
- [ ] R40 [GLOBAL] Comparar todos los cambios con `main` del repositorio original.
- [ ] R41 [GLOBAL] Evaluar commits divergentes de `modelo_1` sin forzar la integración.
- [ ] R42 [GLOBAL] Integrar a rama propuesta y abrir PR de revisión grupal.
- [ ] R43 [GLOBAL] Verificar la versión conjunta con pruebas de punta a punta.
- [ ] R44 [GLOBAL] Registrar evidencia y responsables para exposición del profesor.
- [ ] R45 [GLOBAL] Validar entrega con los criterios completos de la pauta académica.

**Nota:** No marcar retroactivamente las 115 tareas históricas como completas solo porque esta copia implementa funcionalidad similar. Comparar uno por uno antes de hacer cambios en el repositorio del grupo.
