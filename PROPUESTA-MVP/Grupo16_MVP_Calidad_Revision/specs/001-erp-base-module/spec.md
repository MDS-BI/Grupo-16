# Especificación consolidada — Gestión de Calidad del Grupo 16

**Estado:** revisión funcional del MVP, 17/11/2026. **Fuente:** historias US1–US13 del repositorio original `MDS-BI/Grupo-16`, reordenadas para que `spec`, `plan` y `tasks` usen el mismo vocabulario. Las asignaciones no verificadas se mantienen sin inventar integrantes.

## Actores y vocabulario
- **Inspector de Planta**: registra datos e inspecciones, detecta desviaciones.
- **Gestor de Calidad**: administra maestros, NCR, CAPA, reglas, informes y auditorías.
- **Maestros**: Producto, Lote, Área Organizativa, Empleado.
- **Operativos**: Inspección de Calidad, No Conformidad (NCR), Acción CAPA.

## US1 — Registrar datos maestros (P1)
**Como** Inspector de Planta, **quiero** crear productos, lotes, áreas y empleados con sus campos propios **para** identificar elementos y responsables de calidad.
**Aceptación:** A1: crear cualquier tipo y verlo en lista; A2: bloquear obligatorios vacíos; A3: guardar correctamente producto asociado a lote y área asociada a empleado; A4: códigos únicos por tipo.
**Asignación:** consta trabajo adaptado en repositorio original; confirmar responsable del flujo completo.

## US2 — Editar y eliminar datos maestros (P1)
**Como** Gestor de Calidad, **quiero** editar y retirar maestros **para** mantener información confiable.
**Aceptación:** A1: seleccionar/editar/guardar registro; A2: confirmar borrado; A3: no dejar relaciones huérfanas al eliminar producto, lote o área; A4: lista y métricas actualizadas.
**Asignación:** **por confirmar con el grupo** (asignación pendiente en fuente).

## US3 — Panel y estadísticas (P1)
**Como** Gestor de Calidad, **quiero** un panel con acceso rápido e indicadores **para** iniciar tareas y detectar casos pendientes.
**Aceptación:** A1: acceso a Maestros, Operativos, Consulta; A2: indicadores reales de registros; A3: recuentos cambian al crear/eliminar; A4: estado vacío útil.
**Asignación:** **por confirmar con el grupo**.

## US4 — Gestión de maestros y registros operativos (P1)
**Como** Gestor de Calidad, **quiero** pantallas dedicadas para administrar cada tipo de registro **para** trabajar sin confundir datos maestros y operativos.
**Aceptación:** A1: navegación estable; A2: CRUD en maestros y operativos; A3: asociación correcta a maestro; A4: eliminación y actualización reflejadas en listas.
**Asignación:** **por confirmar con el grupo**.

## US5 — Perfil de configuración de módulo (P1)
**Como** Gestor de Calidad, **quiero** declarar identidad y reglas de Gestión de Calidad **para** adaptar una base de ERP sin reescribir su núcleo.
**Aceptación:** A1: identidad y términos de calidad visibles; A2: personalización de ciclo de vida y campos con validación; A3: ante configuración inválida, mensaje claro y recuperación; A4: posibilidad de quitar un perfil sin romper la aplicación.
**Asignación:** figura asignación nominal de Josefa Guzmán en el repositorio original.
**Situación de esta copia:** identidad y reglas de calidad integradas, pero **no** mecanismo completamente genérico de múltiples perfiles sin tocar el código (pendiente).

## US6 — Terminología consistente (P1)
**Como** Gestor de Calidad, **quiero** etiquetas con nombres del dominio **para** evitar «Entidad», «Documento», «Ventas» en la interfaz final.
**Aceptación:** A1: panel, menú, formularios y vacíos usan Maestro, Lote, NCR, CAPA, etc.; A2: navegación no cambia su comportamiento; A3: fallback cuando falta una etiqueta configurada.
**Asignación:** figura asignación nominal de Josefa Guzmán en el repositorio original.
**Situación:** nomenclatura de calidad consistente; fallback multi-perfil pendiente.

## US7 — Campos adicionales de gobernanza y trazabilidad (P1)
**Como** Gestor de Calidad, **quiero** registrar atributos adicionales para inspección y trazabilidad **para** respaldar decisiones auditables.
**Aceptación:** A1: campos de proveedor, fechas, severidad y resultado; A2: obligatorios bloquean guardado; A3: visibles en lista/búsqueda; A4: definición dinámica sin editar el formulario.
**Situación:** A1–A3 parciales; A4 pendiente como función genérica.

## US8 — Buscar maestros (P2)
**Como** Inspector de Planta, **quiero** filtrar maestros por código y otros atributos **para** encontrarlos rápidamente.
**Aceptación:** A1: búsqueda por texto parcial; A2: estado vacío; A3: al crear o eliminar resultados se actualizan.

## US9 — Registrar fechas objetivo y temporalidad (P2)
**Como** Inspector de Planta, **quiero** asociar fechas de fabricación/caducidad y seguimiento **para** evitar confusiones temporales.
**Aceptación:** A1: fechas editables; A2: impedir caducidad anterior a fabricación; A3: fecha visible en detalles; A4: manejo explícito de fechas opcionales.

## US10 — Registros operativos relacionados (P2)
**Como** Inspector de Planta, **quiero** registrar inspecciones, NCR y CAPA asociados a lotes y hallazgos **para** mantener trazabilidad.
**Aceptación:** A1: crear, editar, consultar y eliminar; A2: relación obligatoria y existente; A3: rechazar campos requeridos vacíos; A4: reflejar en listado y auditoría.

## US11 — Consulta, auditoría y trazabilidad integral (P2)
**Como** Gestor de Calidad, **quiero** consultar y rastrear producto→lote→inspección/NCR→CAPA **para** identificar origen y tratamiento de hallazgos.
**Aceptación:** A1: pantalla dedicada; A2: búsqueda transversal; A3: cadenas de relaciones verificables; A4: no inventar documentos asociados.
**Aclaración:** Esta US11 es **auditoría/trazabilidad**, no mera pantalla de «buscar entidades».

## US12 — Estados de inspecciones, NCR y CAPA (P2)
**Como** Gestor de Calidad, **quiero** controlar estados y transiciones permitidas **para** prevenir cierres sin seguimiento.
**Aceptación:** A1: estado visible en lista; A2: NCR empieza ABIERTA; A3: permitir solo transiciones definidas; A4: mostrar error para una transición inválida; A5: CAPA con seguimiento.
**Situación:** ciclo de NCR verificado en pruebas; flujo de aprobación formal fuera del alcance académico.

## US13 — Marco de trabajo con marca (P1)
**Como** Gestor de Calidad, **quiero** navegación y marca de Gestión de Calidad en todas las pantallas **para** trabajar en un módulo coherente.
**Aceptación:** A1: marca y menú persistente; A2: módulo activo destacado; A3: estilos adaptables a escritorio/móvil; A4: Panel↔Maestros↔Operativos↔Consulta sin perder datos.

## Requisitos transversales
- Datos ficticios claramente identificados y no confundibles con registros reales.
- Persistencia local con versión de esquema y errores claros al validar.
- Accesibilidad básica: botones semánticos, etiquetas, enfoque del teclado y confirmación de borrado.
- Evidencia de pruebas y documentación, sin afirmar que una prueba ejecutada en otra rama acredita esta copia.

## Pendientes declarados para llegar a especificación completa
- Perfil completamente configurable y fallback multitemático (US5/6).
- Campos personalizados dinámicos genéricos en todas las vistas (US7).
- Reporte/auditoría avanzada por roles y control de 500 registros (US11 y no funcionales).
- Confirmación formal de asignaciones US2/3/4, integración con ramas históricas y pruebas end-to-end de navegador.
