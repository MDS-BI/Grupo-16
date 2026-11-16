Feedback Avance (26/10/26)

- no hay ningun avance en el repositorio

Proximos pasos:
 
- rectificar puntos anteriores 
- trabajar en los specs (historias de usuario, US) para definir tareas
- dividirse las US y tareas para una siguiente iteracion (avances cada semana)
- ejecutar una version integrada de prueba

Feedback Avance 02 (2/11/26)

- Se insiste en el manejo de los specs (revisar video). Cada carpeta debe tener toda la estructura base (y editar sobre ella).
- no se observan historias de usuario por miembro del grupo
- hay archivos de estructura del proyecto en la raiz del repositorio
- Evitar trabajar con modelos de IA fuera de speckit en local, porque crean ramas nuevas y se pierde la integridad del proyecto

Proximos pasos:

- rectificar puntos anteriores y crear tareas a partir de los specs
- hacer primera implmentacion, registar modificaciones/incremental y volver al spec
- dividir el grupo entre modificaciones (ajustes previos) e incremental (nueva funcionalidad)
- integrar nueva version en 2 semanas

Feedback Avance 03 (16/11/26)

- Cambios en la especificación:
  - spec.md y tasks.md se reorientaron a Gestión de Calidad: historias con roles (Inspector de Planta, Gestor de Calidad), campos "Asignado a" y tareas reescritas (US1, US8, US12, US13). Es más claro, pero quedan "Asignado a: [Inserta aquí el Nombre y Apellido]" en US2, US3 y US4.
  - Incoherencia: las fases de US2, US3, US4, US9–US11 de tasks.md siguen con "entidades/documentos" genéricos y US11 difiere entre archivos (consulta/auditoría vs. búsqueda).
- Consistencia sitio–especificación:
  - T015–T019 (US1) están sin marcar: index.html y src/app.js usan una entidad genérica (RFC, crédito, condiciones de pago), sin tipos Lote/Producto/Área/Empleado.
  - T043, T048 y T056–T060 están sin marcar y están implementadas en src/module-config.js y src/app.js; el estado de T042 no es verificable (tests/unit/storage.test.js no incluido).
  - T091–T095 (US12): src/storage.js valida transiciones, pero el estado de cada NCR no se muestra en la lista (src/app.js, renderDocumentsList) y los tests apuntan a ids ausentes en index.html (submit-button, series).
  - T103–T107 (US13) implementados (index.html, src/styles.css) y sin marcar; el menú usa "Entidades/Documentos", no "Áreas auditadas/Hallazgos".
- hacer mejoras de funcionalidad e interfaz de usuario, incluir data simulada para probar campos, incluir mejoras de estilo, transicion, navegacion, etcetera.

Presentacion de MVP final en 2 semanas.
