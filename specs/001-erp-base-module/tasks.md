# Tareas: Módulo Base de Software de Planificación de Recursos Empresariales (ERP) - Módulo de Gestión de Calidad

**Entrada**: Documentos de diseño desde `/specs/001-erp-base-module/`
**Prerrequisitos**: plan.md (obligatorio), spec.md (obligatorio para las historias de usuario), research.md, modelo_entidad_relacion_gestion_calidad.md, contracts/

## Formato: `[ID] [P?] [Historia] Descripción`

## Fase 1: Configuración Inicial y Estructura del Proyecto

**Propósito**: Inicializar la estructura del proyecto, configurar herramientas y establecer la base sobre la que dependerán todas las historias del módulo de gestión de calidad.

- [X] T001 Crear la estructura de la aplicación Vite con src/, tests/, y archivos de configuración para el módulo de calidad
- [X] T002 Instalar las dependencias Vite, Vitest y bibliotecas de UI necesarias para el proyecto de gestión de calidad
- [X] T003 [P] Configurar el linting y formateo (ESLint/Prettier) con reglas específicas para módulo de calidad
- [X] T004 [P] Estructurar directorios src/components/, src/storage.js, src/app.js, src/styles.css para módulo de calidad
- [X] T005 [P] Configurar localStorage persistente con clave 'quality-models' para almacenamiento de datos del módulo

---

## Fase 2: Modelo de Datos y Almacenamiento Base

**Propósito**: Implementar el modelo de datos derivado de modelo_entidad_relacion_gestion_calidad.md y los ayudantes de validación que sustentarán todas las historias.

- [X] T006 Crear src/storage.js con ayudantes de CRUD para todas las entidades del modelo: Área Organizativa, Empleado, Producto, Lote
- [X] T007 Implementar persistencia en localStorage para Áreas Organizativas (área_id, código, nombre, módulo, activo)
- [X] T008 Implementar persistencia en localStorage para Empleados (empleado_id, número_nomina, puesto, area_id, estado)
- [X] T009 [P] Implementar persistencia en localStorage para Productos (producto_id, código, descripción, tipo, unidad_medida, critico_calidad)
- [X] T010 [P] Implementar persistencia en localStorage para Lotes (lote_id, producto_id, número_lote, fecha_fabricación, fecha_caducidad)
- [X] T011 Crear validaciones helper para restricciones del modelo (PK, FK, UK, NN, CHECK constraints)
- [X] T012 [P] Implementar gestión de entity_id autogenerado y relaciones FK entre entidades

---

## Fase 3: Historia de Usuario 1 - Crear y organizar datos maestros (Lote, Producto, Área Organizativa, Empleado) (Prioridad: P1) 🎯 MVP

**Objetivo**: Permitir al Inspector de Planta registrar y mantener información confiable de Lotes, Productos, Áreas Organizativas y Empleados, con nombre y código, y localizarlos en la lista para identificar los elementos y responsables vinculados a las inspecciones y el control de calidad.

**Prueba Independiente**: Un Inspector de Planta registra un Lote, Producto, Área Organizativa o Empleado con su nombre y código, confirma que queda guardado y puede localizarlo en la lista con información suficiente para identificarlo.

### Pruebas para la Historia de Usuario 1

- [X] T013 [P] [US1] Añadir pruebas unitarias para validación de datos maestros (nombre y código obligatorios) en tests/unit/storage.test.js
- [X] T014 [P] [US1] Añadir pruebas de integración para crear datos maestros (Lote, Producto, Área Organizativa, Empleado) en tests/integration/create-entity.test.js

### Implementación de la Historia de Usuario 1

- [X] T015 [P] [US1] Crear la interfaz del formulario de datos maestros en src/components/quality-entity-form.js (para los 4 tipos: Lote, Producto, Área Organizativa, Empleado)
- [X] T016 [US1] Conectar el envío del formulario para validar nombre y código obligatorios, crear y persistir un nuevo dato maestro en src/app.js
- [X] T017 [US1] Renderizar la lista de datos maestros con información identificativa suficiente (nombre, código y datos propios del tipo) y mostrar retroalimentación de validación en src/components/quality-entity-list.js
- [X] T018 [US1] Implementar selección del tipo de dato maestro (Lote/Producto/Área Organizativa/Empleado) en el formulario
- [X] T019 [US1] Añadir campos específicos por tipo de dato maestro (número de lote y fechas de fabricación/caducidad para Lote; código, descripción, tipo y unidad de medida para Producto; código, nombre y módulo para Área Organizativa; número de nómina, puesto, área y estado para Empleado)

**Punto de control**: La Historia de Usuario 1 debe estar completamente funcional y ser comprobable de forma independiente. Los 4 tipos de datos maestros (Lote, Producto, Área Organizativa, Empleado) deben ser creables, y el sistema debe impedir guardar cuando falte el nombre o el código e indicar qué dato debe completar.

---

## Fase 4: Historia de Usuario 2 - Editar y Eliminar Entidades (Prioridad: P1)

**Objetivo**: Permitir a los usuarios actualizar o eliminar entidades maestras almacenadas, manteniendo la capacidad de respuesta con conjuntos de datos grandes.

**Prueba Independiente**: Un usuario puede editar una entidad existente o eliminarla, y la lista se actualiza correctamente.

### Pruebas para la Historia de Usuario 2

- [X] T020 [P] [US2] Añadir pruebas unitarias para actualizar y eliminar entidades en tests/unit/storage.test.js
- [X] T021 [P] [US2] Añadir pruebas de integración para editar y eliminar una entidad en tests/integration/edit-delete-entity.test.js

### Implementación de la Historia de Usuario 2

- [X] T022 [P] [US2] Añadir controles de edición y eliminación a la interfaz de la lista de entidades en src/components/quality-entity-list.js
- [X] T023 [US2] Conectar las acciones de edición para poblar el formulario y actualizar los datos persistidos en src/app.js
- [X] T024 [US2] Gestionar las acciones de eliminación y quitar registros del almacenamiento y la interfaz en src/app.js
- [X] T025 [US2] Implementar eliminación en cascada: al eliminar un Área, eliminar sus Empleados; al eliminar un Producto, eliminar sus Lotes
- [X] T026 [P] [US2] Añadir pruebas de integración para eliminación en cascada en tests/integration/cascade-delete.test.js

**Punto de control**: Las Historias de Usuario 1 y 2 deben funcionar de forma independiente. Las operaciones de edit/delete deben respetar las FK relationships del modelo.

---

## Fase 5: Historia de Usuario 3 - Panel de Inicio ERP con KPIs y Acciones Rápidas (Prioridad: P1)

**Objetivo**: Proporcionar la vista principal de Gestión de Calidad con KPIs dinámicos, acciones rápidas separadas para registros maestros y operativos, y accesos directos a gestión de catálogos y búsqueda global.

**Prueba Independiente**: Un usuario abre la ruta raíz, ve 4 tarjetas KPI con conteos reales (0 cuando no hay datos), usa botones de creación maestra u operativa con formularios limpios, abre gestión de catálogos y accede a búsqueda global con autofocus.

### Pruebas para la Historia de Usuario 3

- [X] T027 [P] [US3] Añadir pruebas de integración para las acciones rápidas del panel y las estadísticas en vivo en tests/integration/dashboard.test.js

### Implementación de la Historia de Usuario 3

- [X] T028 [P] [US3] Añadir el marcado del panel refinado (encabezado, KPIs, grupos de acciones rápidas, accesos de gestión/búsqueda) a index.html
- [X] T029 [US3] Conectar las acciones rápidas maestras y operativas y los accesos de gestión/búsqueda para abrir formularios limpios, la vista de catálogos y la búsqueda con autofocus en src/app.js
- [X] T030 [US3] Renderizar y refrescar los KPIs desde el almacenamiento cada vez que se muestra el panel en src/app.js
- [X] T031 [P] [US3] Dar estilo al panel ERP, tarjetas KPI, grupos de acciones rápidas, iconos y botones de acceso en src/styles.css
- [X] T032 [US3] Implementar los 4 KPIs requeridos: lotes activos, productos registrados, inspecciones realizadas y NCR/CAPA abiertas
- [X] T033 [US3] Añadir indicador de estado vacío cuando no hay registros en el almacenamiento

**Punto de control**: La aplicación abre en un panel ERP funcional; los KPIs reflejan conteos reales del almacenamiento, los formularios se abren limpios desde cualquier acción rápida, y los accesos a gestión y búsqueda funcionan en un solo clic con autofocus en búsqueda.

---

## Fase 6: Historia de Usuario 4 - Gestionar Entidades y Documentos en una Pantalla Dedicada (Prioridad: P1)

**Objetivo**: Proporcionar una pantalla dedicada donde pueda añadir, editar y eliminar entidades y sus documentos, para gestionar los datos del módulo en un lugar enfocado.

**Prueba Independiente**: Un usuario puede navegar a la pantalla de gestión mediante la barra lateral o una acción rápida, alternar entre la gestión de entidades y documentos, y volver al panel, añadiendo, editando y eliminando con éxito una entidad y un documento.

### Pruebas para la Historia de Usuario 4

- [X] T034 [P] [US4] Añadir pruebas de integración para la funcionalidad de gestión completa en tests/integration/manage-entities-docs.test.js

### Implementación de la Historia de Usuario 4

- [X] T035 [P] [US4] Añadir navegación de barra lateral con botones Entidades, Documentos, Panel, Buscar en src/components/shell.js
- [X] T036 [US4] Mostrar el contenido de gestión de entidades cuando el usuario activa el botón Entidades en la barra lateral
- [X] T037 [US4] Mostrar el contenido de gestión de documentos cuando el usuario activa el botón Documentos en la barra lateral
- [X] T038 [US4] Añadir funcionalidad de crear, editar y eliminar entidades en la pantalla de gestión
- [X] T039 [US4] Añadir funcionalidad de crear, editar y eliminar documentos asociados a entidades en la pantalla de gestión
- [X] T040 [US4] Implementar eliminación en cascada: al eliminar una entidad, sus documentos asociados también se eliminan
- [X] T041 [P] [US4] Añadir estilos para la barra lateral, regiones de contenido y navegación en src/styles.css

**Punto de control**: Las Historias de Usuario 1-4 deben estar completamente funcionales y ser comprobables de forma independiente. La pantalla de gestión debe consolidar ambos formularios (entidad y documento) en una sola pantalla.

---

## Fase 7: Historia de Usuario 5 - Definir un Perfil de Configuración del Módulo (Prioridad: P1)

**Objetivo**: Introducir `src/module-config.js` para que los desarrolladores puedan adaptar la identidad del módulo de calidad sin editar el código central, con valores predeterminados seguros e informes de error claros.

**Prueba Independiente**: Un desarrollador suministra una configuración de Calidad; la aplicación carga mostrándola. Al quitar el archivo se restauran los valores predeterminados calidad sin errores.

### Pruebas para la Historia de Usuario 5

- [X] T042 [P] [US5] Añadir pruebas unitarias para carga de configuración, retroceso a predeterminados e informes de configuración inválida en tests/unit/module-config.test.js

### Implementación de la Historia de Usuario 5

- [X] T043 [US5] Crear el cargador de configuración con valores predeterminados calidad, validación e informes de error claros en src/module-config.js
- [X] T044 [US5] Cargar la configuración al arrancar y pasarla a todas las vistas en src/main.js y src/app.js
- [X] T045 [US5] Implementar mapeos de terminología: Entidad→NCR/Inspección, Documento→Orden/Informe, etc.
- [X] T046 [US5] Implementar mapeos de campos personalizados que fluyan automáticamente por formularios, validación, persistencia, listas y búsqueda

**Punto de control**: La configuración aún no impulsa nada visible, pero carga de forma fiable y valida limpiamente. Al remover el archivo de configuración, la aplicación retrocede a los valores predeterminados calidad sin errores.

---

## Fase 8: Historia de Usuario 6 - Reetiquetar Pantallas desde la Configuración (Prioridad: P1)

**Objetivo**: Derivar todas las etiquetas visibles para el usuario de la configuración para que los módulos adaptados hablen su idioma de dominio en todo momento.

**Prueba Independiente**: Con mapeos Calidad→Calidad, NCR→Informe de No Conformidad, etc., cada pestaña, botón, etiqueta de formulario, encabezado y mensaje muestra los términos mapeados en las tres pantallas; el comportamiento no cambia.

### Pruebas para la Historia de Usuario 6

- [X] T047 [P] [US6] Añadir pruebas de integración que verifiquen las etiquetas configuradas en las pantallas de bienvenida, gestión y búsqueda en tests/integration/relabeling.test.js

### Implementación de la Historia de Usuario 6

- [X] T048 [US6] Derivar todas las etiquetas visibles para el usuario de la configuración en lugar de texto codificado en index.html, src/app.js y los archivos de componentes
- [X] T049 [US6] Implementar reetiquetado para todos los tipos de NCR (ABIERTA, EN_INVESTIGACION, EN_CAPA, CERRADA, RECHAZADA)
- [X] T050 [US6] Implementar reetiquetado para todos los tipos de inspección (RECEPCION, PROCESO, FINAL, LIBERACION)
- [X] T051 [US6] Implementar reetiquetado para todos los tipos de auditoría (INTERNA, PROVEEDOR, PROCESO)
- [X] T052 [US6] Implementar reetiquetado para tipos de CAPA (CORRECTIVA, PREVENTIVA) y estados
- [X] T053 [P] [US6] Añadir estilos para etiquetas dinámicas que se adapten a diferentes longitudes en src/styles.css

**Punto de control**: Un módulo configurado se presenta completamente bajo su propia terminología. El comportamiento de navegación no cambia independientemente de los mapeos aplicados.

---

## Fase 9: Historia de Usuario 7 - Declarar Campos Personalizados para los Registros (Prioridad: P1)

**Objetivo**: Permitir que los campos personalizados declarados fluyan automáticamente por formularios, validación, persistencia, listas y búsqueda.

**Prueba Independiente**: Declarar un campo numérico obligatorio personalizado en las entidades; se muestra como entrada numérica en el formulario, bloquea el guardado cuando está en blanco, muestra los valores guardados en las listas y coincide en las búsquedas; sin declaraciones la aplicación se comporta como la base sin modificar.

### Pruebas para la Historia de Usuario 7

- [X] T054 [P] [US7] Añadir pruebas unitarias para validación y persistencia de campos personalizados en tests/unit/storage.test.js
- [X] T055 [P] [US7] Añadir pruebas de integración para el renderizado de campos personalizados en formularios, listas y búsqueda en tests/integration/custom-fields.test.js

### Implementación de la Historia de Usuario 7

- [X] T056 [P] [US7] Renderizar dinámicamente los campos personalizados declarados en los formularios de entidad y documento en src/components/quality-entity-form.js y src/components/document-form.js
- [X] T057 [US7] Incluir los campos personalizados en validación, persistencia, listas y búsqueda en src/storage.js y src/app.js
- [X] T058 [US7] Implementar tipos de campo personalizados: número, texto, ENUM, fecha, booleano, DECIMAL
- [X] T059 [US7] Implementar validación obligatoria para campos personalizados declarados como NN
- [X] T060 [US7] Implementar búsquedas que incluyan valores de campos personalizados

**Punto de control**: Los datos específicos del módulo de calidad requieren cero cambios de código de interfaz. Un desarrollador puede añadir un campo "fecha_proximo_audit" a las entidades y aparecerá automáticamente en formularios y listas.

---

## Fase 10: Historia de Usuario 8 - Buscar y encontrar Lotes, Productos, Áreas Organizativas o Empleados rápidamente (Prioridad: P2)

**Objetivo**: Permitir al Inspector de Planta buscar por datos identificativos (nombre, código u otros datos descriptivos) para encontrar el registro correcto al preparar una inspección, manteniendo la capacidad de respuesta con cientos de registros.

**Prueba Independiente**: Un Inspector de Planta puede introducir un término de búsqueda y ver solo los Lotes, Productos, Áreas Organizativas o Empleados coincidentes, con su información identificativa.

### Pruebas para la Historia de Usuario 8

- [X] T061 [P] [US8] Añadir pruebas unitarias para la lógica de filtrado de datos maestros por nombre, código y datos descriptivos en tests/unit/storage.test.js
- [X] T062 [P] [US8] Añadir pruebas de integración para la búsqueda de datos maestros, incluidos los casos sin coincidencias y el rendimiento con 500+ registros, en tests/integration/search-entities.test.js

### Implementación de la Historia de Usuario 8

- [X] T063 [P] [US8] Crear la interfaz de la barra de búsqueda en src/components/search-bar.js
- [X] T064 [US8] Conectar la entrada de búsqueda al filtrado y mostrar la información identificativa de cada resultado en src/app.js
- [X] T065 [US8] Asegurar que los resultados de búsqueda permanezcan sincronizados con las acciones de crear, editar y eliminar datos maestros en src/app.js
- [X] T066 [US8] Implementar filtrado sobre nombre, código y datos descriptivos (descripción, tipo, unidad de medida, módulo, puesto, número de nómina, número de lote, fechas y estado) para los 4 tipos de datos maestros
- [X] T067 [US8] Implementar búsqueda combinada en múltiples campos simultáneamente
- [X] T068 [US8] Manejar búsquedas sin coincidencias indicando que no se encontraron registros y permitir modificar o borrar la búsqueda para intentarlo de nuevo

**Punto de control**: Las historias centrales de datos y la búsqueda deben estar ahora funcionalmente independientes. La búsqueda debe devolver resultados relevantes con rapidez incluso con cientos de registros (FR-032, SC-004) y mostrar un estado vacío claro cuando no haya coincidencias.

---

## Fase 11: Historia de Usuario 9 - Registrar una Fecha Objetivo (Prioridad: P2)

**Objetivo**: Permitir a los usuarios adjuntar una fecha objetivo opcional a una entidad para planificar y ordenar los registros según cuándo vence algo.

**Prueba Independiente**: Un usuario puede fijar una fecha en una entidad y verla mostrada en la lista.

### Pruebas para la Historia de Usuario 9

- [X] T069 [P] [US9] Añadir pruebas unitarias para validación y persistencia de la fecha objetivo en tests/unit/storage.test.js

### Implementación de la Historia de Usuario 9

- [X] T070 [P] [US9] Añadir la entrada de fecha objetivo al formulario de entidad en index.html
- [X] T071 [US9] Incluir targetDate en la lógica de validación, creación, actualización y búsqueda en src/storage.js
- [X] T072 [US9] Conectar targetDate al envío del formulario, poblado de edición y visualización de errores en src/app.js
- [X] T073 [US9] Mostrar la fecha objetivo en la lista de entidades en src/app.js (formateada: dd/mm/yyyy)
- [X] T074 [US9] Implementar validación de que la fecha objetivo sea posterior a la fecha de creación
- [X] T075 [US9] Manejar fecha objetivo nula/opcional: la entidad igualmente se guarda sin fecha si el usuario la deja en blanco

**Punto de control**: La Historia de Usuario 9 debe estar completamente funcional y ser comprobable de forma independiente. Las entidades con fechas objetivo identificables de un vistazo en la lista.

---

## Fase 12: Historia de Usuario 10 - Registrar los Detalles de Documentos de una Entidad (Prioridad: P2)

**Objetivo**: Permitir a los usuarios registrar detalles de documentos para una entidad y mantener la actividad transaccional organizada junto a cada registro de datos maestros, con eliminación en cascada protegiendo la integridad referencial.

**Prueba Independiente**: Un usuario puede añadir un documento a una entidad y ver los detalles del documento mostrados junto a esa entidad; eliminar la entidad elimina sus documentos.

### Pruebas para la Historia de Usuario 10

- [X] T076 [P] [US10] Añadir pruebas unitarias para generación de entity_id y validación de documentos en tests/unit/storage.test.js
- [X] T077 [P] [US10] Añadir pruebas de integración para añadir un documento a una entidad en tests/integration/add-document.test.js
- [X] T078 [P] [US10] Añadir pruebas de integración para edición, eliminación y eliminación en cascada de documentos en tests/integration/manage-document.test.js

### Implementación de la Historia de Usuario 10

- [X] T079 [P] [US10] Crear la interfaz del formulario de documento en src/components/document-form.js (para tipos: NCR, Inspección, Auditoría, CAPA, Queja, Evaluación)
- [X] T080 [P] [US10] Crear la interfaz de la lista de documentos en src/components/document-list.js
- [X] T081 [US10] Conectar las acciones de crear, editar y eliminar documentos para persistirlos en src/app.js
- [X] T082 [US10] Añadir entity_id a la creación de entidades y mostrar los documentos con su entidad en src/app.js
- [X] T083 [US10] Implementar eliminación en cascada: al eliminar una entidad, sus documentos asociados también se eliminan en src/storage.js
- [X] T084 [US10] Implementar tipos de documento con campos específicos: NCR (folio, origen, gravedad), Inspección (tipo, resultado, fecha), etc.

**Punto de control**: Los datos maestros y los documentos transaccionales deben estar completamente vinculados. La eliminación en cascada debe funcionar correctamente para todos los tipos de documento.

---

## Fase 13: Historia de Usuario 11 - Buscar Entidades en una Pantalla Dedicada (Prioridad: P2)

**Objetivo**: Proporcionar la pantalla de búsqueda dedicada accesible desde la pantalla de bienvenida, manteniendo la edición en la pantalla de gestión.

**Prueba Independiente**: Un usuario navega desde la pantalla de bienvenida a la pantalla de búsqueda, busca, ve resultados o un estado vacío, y vuelve a Inicio.

### Implementación de la Historia de Usuario 11

- [X] T085 [P] [US11] Añadir la entrada de búsqueda y la lista de resultados a la vista de búsqueda dedicada en index.html
- [X] T086 [US11] Conectar la entrada de búsqueda al filtrado de resultados y mostrar un estado vacío en la pantalla de búsqueda en src/app.js
- [X] T087 [US11] Añadir navegación al Panel desde la pantalla de búsqueda en index.html
- [X] T088 [US11] Implementar filtros por tipo de entidad y rango de fecha en la pantalla de búsqueda
- [X] T089 [US11] Implementar exportación/volcado de resultados de búsqueda a CSV/local

**Punto de control**: Todas las historias del usuario de negocio deben estar completamente funcionales y ser comprobables de forma independiente. La pantalla de búsqueda debe ser accesible tanto desde la barra lateral como desde la acción rápida de buscar registros del panel.

---

## Fase 14: Historia de Usuario 12 - Configurar el Ciclo de Vida de Estados de Hallazgos/No Conformidades (NCR) (Prioridad: P2)

**Objetivo**: Permitir al administrador del módulo de calidad definir los estados permitidos de los hallazgos/no conformidades y sus transiciones, y aplicarlos en las NCR manteniendo el estado de texto libre cuando no hay configuración.

**Prueba Independiente**: El administrador del módulo de calidad configura un ciclo de vida (p. ej., abierta→en revisión→cerrada, compatible con la matriz del proyecto ABIERTA→EN_INVESTIGACIÓN→EN_CAPA→CERRADA/RECHAZADA); el control de estado de una NCR ofrece solo los estados siguientes válidos, una transición inválida (p. ej., cerrar una NCR sin pasar por revisión) se rechaza con explicación, y el estado de cada NCR es visible de un vistazo en las listas de gestión; sin configuración, el estado permanece como texto libre.

### Pruebas para la Historia de Usuario 12

- [X] T090 [P] [US12] Añadir pruebas unitarias para la aplicación de transiciones de estado en las NCR en tests/unit/storage.test.js (incluye rechazo de transición inválida tipo "cerrar una NCR sin pasar por revisión" con explicación clara)

### Implementación de la Historia de Usuario 12

- [X] T091 [US12] Restringir las opciones de estado de los hallazgos/no conformidades a las transiciones permitidas y aplicarlas al guardar en src/components/document-form.js y src/storage.js
- [X] T092 [US12] Implementar matriz de transiciones permitidas por tipo de documento del dominio de calidad: NCR (ABIERTA→EN_INVESTIGACIÓN→EN_CAPA→CERRADA/RECHAZADA), Inspección (ACEPTADO/RECHAZADO/CONDICIONADO), etc., derivada del ciclo de vida configurado por el administrador del módulo de calidad
- [X] T093 [US12] Aplicar transiciones de estado configuradas en las NCR independientemente de cómo se envíe un cambio (formulario, barra lateral, atajo)
- [X] T094 [US12] Cuando no hay ciclo de vida configurado en el módulo de calidad, el estado del hallazgo permanece como texto libre igual que en el módulo base sin modificar
- [X] T095 [US12] Visualizar el estado actual de cada NCR identificable de un vistazo en listas y detalles de hallazgos/no conformidades

**Punto de control**: La cadena de personalización (HU5→HU6/HU7/HU12) está completa de extremo a extremo. Las transiciones inválidas en las NCR se rechazan con explicación clara que indique las transiciones válidas del ciclo de calidad.

---

## Fase 15: Pulido y Preocupaciones Transversales

**Propósito**: Mejorar la calidad, accesibilidad, fiabilidad y el comportamiento con conjuntos de datos grandes en todas las historias.

- [X] T096 [P] Añadir refinamientos de accesibilidad para etiquetas, foco de teclado y estructura semántica en todos los componentes calidad
- [X] T097 [P] Añadir pulido final de UX para estados vacíos, mensajes de validación y diseño responsivo (móvil/tablet/desktop)
- [X] T098 Verificar que el renderizado de listas y la búsqueda permanecen responsivos y correctos con 500 registros (FR-032, SC-004)
- [X] T099 Ejecutar la suite completa de pruebas y probar manualmente los flujos principales de usuario
- [X] T100 [P] Añadir estilos finales y tema de colores para el módulo calidad en src/styles.css
- [X] T101 Ejecutar la suite completa de pruebas y la compilación de producción para verificar que no hay regresiones

---

## Fase 16: Historia de Usuario 13 - Marco de Espacio de Trabajo del Módulo de Calidad con Marca (Prioridad: P1)

**Objetivo**: Permitir al administrador del módulo de calidad ofrecer a su equipo un marco ERP persistente en cada pantalla: una barra superior con logotipo derivado y nombre del módulo de calidad, más una barra lateral de botones de módulo con terminología del dominio (Áreas auditadas, Hallazgos/no conformidades), resaltado de módulo activo y contracción responsiva.

**Prueba Independiente**: El administrador del módulo de calidad recorre todas las pantallas y en cada una ve la barra superior (logotipo SVG en línea + nombre del módulo configurado) y la barra lateral con botones para Panel, Áreas auditadas, Hallazgos/no conformidades y Buscar con el módulo activo resaltado; navegar entre módulos preserva las áreas y hallazgos almacenados, y la barra lateral se contrae a una columna de iconos en ventanas gráficas estrechas.

### Pruebas para la Historia de Usuario 13

- [X] T102 [P] [US13] Añadir pruebas de integración que afirmen que el marco (logotipo, nombre del módulo de calidad, botones de barra lateral con terminología de calidad, resaltado activo) aparece en todas las pantallas en tests/integration/workspace-shell.test.js

### Implementación de la Historia de Usuario 13

- [X] T103 [P] [US13] Añadir el marcado del marco del espacio de trabajo (barra superior, montaje de logotipo SVG en línea, botones de módulo en barra lateral, región de contenido principal) a index.html
- [X] T104 [P] [US13] Crear src/components/shell.js para renderizar el logotipo monograma SVG a partir del nombre del módulo de calidad, aplicar las etiquetas configuradas a los botones de módulo (Panel, Áreas auditadas, Hallazgos/no conformidades, Buscar), gestionar el resaltado de módulo activo y exponer eventos de navegación
- [X] T105 [P] [US13] Construir la hoja de estilos de tokens de diseño ERP (variables de color, escala de espaciado, tipografía) más estilos de barra superior, barra lateral y tarjetas en src/styles.css
- [X] T106 [US13] Soportar un theme.accentColor opcional en la validación de src/module-config.js y aplicarlo como propiedad personalizada de CSS en src/app.js, con retroceso seguro a los valores integrados cuando esté ausente o sea inválido
- [X] T107 [US13] Contraer la barra lateral a una columna de iconos en ventanas gráficas estrechas, manteniéndola operable y etiquetada de forma accesible, en src/styles.css
- [X] T108 [P] [US13] Actualizar las pruebas de integración existentes para apuntar al marco de barra lateral en lugar de los botones de bienvenida
- [X] T109 [US13] Asegurar que la navegación entre módulos (Panel→Gestión→Búsqueda) preserve las áreas auditadas y hallazgos/no conformidades almacenados en localStorage

**Punto de control**: Todas las pantallas del módulo de calidad se renderizan dentro del marco con marca con navegación por barra lateral funcional y sin pérdida de áreas ni hallazgos. El marco debe ser visible en todas las pantallas y el botón del módulo activo debe estar resaltado visualmente.

---

## Fase 17: Pulido Final y Aspecto ERP

**Propósito**: Unificar el estilo visual en toda la aplicación rediseñada y protegerse contra regresiones.

- [X] T110 [P] Rediseñar formularios, listas, insignias, mensajes de error y estados vacíos según el sistema de tokens de diseño ERP en src/styles.css
- [X] T111 [P] Verificar el orden de foco del teclado y aria-current en los botones de módulo de la barra lateral (pase de accesibilidad del nuevo marco)
- [X] T112 Actualizar documentación interna con las secciones del marco del espacio de trabajo, panel y tematización del módulo calidad
- [X] T113 Ejecutar la suite completa de pruebas y la compilación de producción para verificar que no hay regresiones (FR-032, SC-004, SC-008)
- [X] T114 Ejecutar pruebas de extremo a extremo completas: flujo desde Panel → Gestión → Búsqueda → Panel con datos intactos
- [X] T115 Verificar que el módulo puede adaptarse usando solo el archivo de configuración, con cero modificaciones en archivos fuente centrales (SC-008)

---

## Fase 18: Historia de Usuario 14 - Gestionar Roles y Permisos de Acceso (Prioridad: P1)

**Objetivo**: Permitir al administrador del sistema asignar roles a los usuarios para controlar las funciones que pueden utilizar dentro del módulo de Gestión de Calidad, protegiendo los registros, manteniendo la trazabilidad de las operaciones y limitando el acceso según las responsabilidades de cada usuario.

**Prueba Independiente**: Al utilizar usuarios con los roles Administrador, Gestor de Calidad, Inspector de Planta y Auditor, el sistema permite únicamente las operaciones autorizadas para cada uno: el Administrador gestiona registros, configuraciones y permisos; el Gestor de Calidad gestiona inspecciones, no conformidades y acciones correctivas sin administrar usuarios; el Inspector de Planta registra inspecciones y reporta no conformidades sin eliminar registros; el Auditor solo consulta información y trazabilidad; cualquier acción no autorizada se rechaza con un mensaje explicativo.

### Pruebas para la Historia de Usuario 14

- [X] T116 [P] [US14] Añadir pruebas unitarias del catálogo de permisos y la matriz por rol (Administrador, Gestor de Calidad, Inspector de Planta, Auditor) en tests/unit/permissions.test.js
- [X] T117 [P] [US14] Añadir pruebas de integración de los cinco escenarios de aceptación de HU14 con usuarios de distintos roles en tests/integration/roles-permissions.test.js

### Implementación de la Historia de Usuario 14

- [X] T118 [US14] Definir el catálogo de permisos (gestionar registros, configuraciones y permisos; crear/editar/eliminar datos maestros; crear/editar/eliminar registros operativos; registrar inspecciones y reportar no conformidades; consultar y auditar trazabilidad) y la matriz que los asigna a cada uno de los cuatro roles en src/permissions.js
- [X] T119 [US14] Registrar los roles y sus permisos por defecto en src/module-config.js, validando definiciones inválidas y conservando el retroceso seguro a valores predeterminados de HU5
- [X] T120 [P] [US14] Añadir el marcado de la vista de administración de usuarios y asignación de roles, junto con su botón en la barra lateral, al marco de index.html y src/components/shell.js
- [X] T121 [US14] Implementar la interfaz de administración de usuarios (listado de usuarios, selector de rol y guardado de la asignación) en src/components/role-admin.js y conectarla en src/app.js
- [X] T122 [US14] Ocultar o deshabilitar en el panel, la barra lateral y las vistas de gestión y búsqueda las acciones no autorizadas para el rol activo, en src/app.js y src/styles.css
- [X] T123 [US14] Implementar el guard de autorización central can(user, permission) y aplicarlo a crear, editar y eliminar datos maestros y registros operativos, modificar configuraciones y administrar usuarios en src/app.js y src/storage.js
- [X] T124 [US14] Persistir usuarios, roles asignados y usuario activo en localStorage bajo las claves 'quality-users' y 'quality-session', y revalidar el rol activo al cargar y recargar la aplicación en src/storage.js
- [X] T125 [US14] Rechazar toda operación solicitada sin autorización y mostrar un mensaje explicativo accesible que indique el permiso requerido, conforme al escenario de aceptación 5, en src/app.js
- [X] T126 [P] [US14] Actualizar las pruebas de integración existentes para ejecutarse con un usuario Administrador por defecto y verificar que los nuevos guards no introducen regresiones en HU1-HU13

**Punto de control**: La Historia de Usuario 14 debe ser comprobable de forma independiente con los cuatro roles: cada uno ve y ejecuta únicamente sus operaciones autorizadas, la administración de usuarios queda restringida al Administrador, y toda acción denegada muestra un mensaje explicativo sin modificar los registros almacenados.

---

## Dependencias y Orden de Ejecución

### Dependencias entre Fases

- Fase 1: Sin dependencias
- Fase 2: Depende de completar Fase 1
- Fase 3 (US1): Depende de completar Fase 2
- Fase 4 (US2): Depende de completar implementación de la Historia de Usuario 1
- Fase 5 (US3): Depende de completar Fase 2
- Fase 6 (US4): Depende de completar Historia de Usuario 3 y se beneficia de que los formularios de las Historias de Usuario 1-2 estén disponibles
- Fase 7 (US5): Depende de completar Fase 2; desbloquea HU6, HU7, HU12
- Fase 8 (US6): Depende de completar Historia de Usuario 5
- Fase 9 (US7): Depende de completar Historia de Usuario 5
- Fase 10 (US8): Depende de completar Fase 2 y puede proceder después de la Historia de Usuario 1
- Fase 11 (US9): Depende de completar Fase 2 y puede proceder después de la Historia de Usuario 1
- Fase 12 (US10): Depende de completar implementación de Historia de Usuario 1 y del campo entity_id
- Fase 13 (US11): Depende de Historia de Usuario 8 (lógica de búsqueda) y Historia de Usuario 3 (navegación)
- Fase 14 (US12): Depende de Historia de Usuario 5 (configuración) y Historia de Usuario 10 (documentos)
- Fase 15: Depende de que todas las historias de usuario deseadas estén completas
- Fase 16 (US13): Depende de que las Fases 1-15 estén completas; reestructura la navegación entregada por HU3/HU4 dentro del marco
- Fase 17: Depende de que las Fases 16 y anteriores estén completas
- Fase 18 (US14): Depende de la Fase 2 (almacenamiento), la Fase 7 (configuración) y la Fase 16 (marco de espacio de trabajo para integrar la vista de administración en la barra lateral); T116-T117 pueden ejecutarse en paralelo con la implementación de la fase

### Oportunidades en Paralelo

- T003/T004 pueden ejecutarse en paralelo con las tareas de configuración
- Las pruebas de cada historia pueden crearse en paralelo con las tareas de implementación de la misma historia
- Después de la Fase 7 (perfil de configuración), HU6 (Fase 8) y HU7 (Fase 9) pueden proceder en paralelo
- HU8 (Fase 10) y HU9 (Fase 11) son independientes y pueden proceder en paralelo después de la Historia de Usuario 1
- En la Fase 15, T096-T098 pueden ejecutarse en paralelo antes de las tareas finales T100-T101
- En la Fase 16, T103-T105 y T107 pueden ejecutarse en paralelo; T108 aterriza junto al cambio de enrutamiento T104
- En la Fase 17, T110 y T111 pueden ejecutarse en paralelo antes de la verificación final T112-T115
- En la Fase 18, T116, T117, T120 y T126 pueden ejecutarse en paralelo; T122 aterriza junto al guard central T123 y T119 debe completarse antes de T124


## Fase 19 (US15): Claridad de interfaz

- [ ] T127 [US15] Verificar menú expandible y etiquetas accesibles en escritorio y móvil.
- [ ] T128 [US15] Revisar etiquetas, campos obligatorios y botones en todos los formularios.
- [ ] T129 [US15] Verificar errores de validación y estados vacíos por tipo de registro.
- [ ] T130 [US15] Ejecutar regresión de creación, edición, búsqueda y navegación.

Las tareas se mantienen abiertas hasta validar los escenarios de aceptación.

---

## Revisión del 26/11/2026 — tareas nuevas desde T131

Estas tareas son adicionales a T001-T130. El comando /speckit.tasks se ejecutó en OpenCode; luego se ajustaron sus rutas al contrato implementado de docs/api-local.md, conservando los identificadores. HU9 y HU12 se atienden únicamente dentro de US7 (T186-T190) como consolidación histórica; no se generan tareas [US9] ni [US12] ni se duplican sus reglas. Solo se marcan tras verificación local; T221 requiere revisión humana del equipo.

---

## Fase 20 (US14): Servidor, sesiones y persistencia autorizada (Prioridad: P1)

**Objetivo**: Sustituir la autoridad de localStorage por un servidor Node 24 con SQLite, sesiones verificadas, CSRF, auditoría y una API que derive el actor de la sesión para cada lectura o mutación.

**Prueba independiente**: Una llamada directa sin sesión responde 401, una llamada con Auditor intentando mutar responde 403 sin cambios, y un Administrador autenticado crea una cuenta y vuelve a ver los datos tras recargar la página.

**Depende de**: T001-T130 conservados; es la base técnica de las fases T150-T223.

### Pruebas de la revisión para US14

- [x] T131 [P] [US14] Probar scrypt, sal individual, contraseña incorrecta y longitudes en tests/unit/server-auth.test.js.
- [x] T132 [P] [US14] Probar API sin sesión (401), Auditor (403) y operaciones permitidas en tests/server/service.test.js.
- [x] T144 [P] [US14] Probar CSRF, origen, expiración, revocación, límite de intentos e instalación concurrente en tests/server/service.test.js.
- [x] T147 [P] [US14] Comprobar que sesión y estado no exponen hashes ni código local en tests/server/service.test.js.

### Implementación de la revisión para US14

- [x] T133 [US14] Servir API y aplicación en loopback con server/start.js; bloquear archivos privados y servir dist en producción.
- [x] T134 [US14] Crear esquema SQLite users, sessions, app_data y audit en server/database.js; ignorar .local-data mediante .gitignore.
- [x] T135 [US14] Reutilizar storage.js, master-data.js y document-types.js mediante src/persistence.js y el contexto SQLite de server/service.js.
- [x] T136 [US14] Derivar contraseñas con sal individual y comparar mediante server/auth.js.
- [x] T137 [US14] Implementar cookies HttpOnly/SameSite, expiración absoluta e inactividad, cierre y revocación en server/service.js.
- [x] T138 [US14] Comprobar Origin y CSRF y limitar intentos de acceso en server/service.js.
- [x] T139 [US14] Obtener actor y rol de la sesión persistida y verificar permiso por operación en server/service.js.
- [x] T140 [US14] Implementar /api/setup, /api/login, /api/logout y /api/session en server/service.js; proteger la instalación inicial con código local.
- [x] T141 [US14] Proveer GET /api/state y POST /api/actions en server/service.js para consultas y mutaciones enumeradas; evitar reemplazos arbitrarios de la base.
- [x] T142 [P] [US14] Guardar auditoría con actor, fecha, acción y destino en server/service.js y server/database.js.
- [x] T143 [US14] Restringir /api/users a Administrador y proteger al último Administrador en server/service.js.
- [x] T145 [US14] Retirar el selector público de identidades del flujo real en src/main.js y src/app.js; usar metadatos del servidor y copia en memoria de src/remote-session.js.
- [x] T146 [US14] Esperar respuestas autorizadas de /api/actions antes de refrescar src/app.js, sin usar localStorage como autorización.
- [x] T148 [US14] Añadir start, setup:local, test:api y requisito de Node 24 en package.json.
- [x] T149 [US14] Verificar integración completa con pruebas, lint y build.

**Punto de control**: La autorización real reside en el servidor: sin sesión hay 401, sin permiso hay 403, las mutaciones se registran con actor y fecha, y la interfaz ya no elige identidad ni lee contraseñas de localStorage.

---

## Fase 21 (US3): Indicadores y gráficos del control de calidad (Prioridad: P1)

**Objetivo**: Mostrar totales reales de SQLite, barras por resultado y un Sankey Producto → Resultado → Disposición con flujos conservados, etiquetas y tabla equivalente.

**Prueba independiente**: Con datos simulados identificados, las tarjetas coinciden con la base, los extremos de entrada y salida del Sankey son iguales, y sin registros aparece un estado vacío sin porcentajes inventados.

**Depende de**: T133-T149, especialmente T135, T139 y T141.

### Pruebas de la revisión para US3

- [x] T150 [P] [US3] Probar totales guardados y exclusión de registros que no son inspecciones en tests/unit/quality-charts.test.js y tests/unit/dashboard.test.js.
- [x] T151 [P] [US3] Probar conservación por etapa y por nodo, dirección y anchos del Sankey en tests/unit/quality-charts.test.js.
- [x] T158 [P] [US3] Verificar ausencia de flujos y porcentajes inventados sin datos en tests/unit/quality-charts.test.js.

### Implementación de la revisión para US3

- [x] T152 [US3] Obtener registros autorizados mediante snapshot de server/service.js y agregar sus conteos en src/components/quality-charts.js y dashboard.js.
- [x] T153 [US3] Mantener dashboardCounts y derivar indicadores del estado autorizado en src/app.js; identificar explícitamente la simulación.
- [x] T154 [US3] Crear barras con título, conteos y tabla equivalente en src/components/quality-charts.js.
- [x] T155 [US3] Dibujar Sankey de tres columnas con una escala común y offsets de entrada/salida independientes en src/components/quality-charts.js.
- [x] T156 [US3] Añadir etiquetas, cantidades, leyenda de etapas y tabla equivalente en src/components/quality-charts.js.
- [x] T157 [US3] Actualizar panel y gráficos al hidratar el estado autorizado en src/app.js.

**Punto de control**: El panel es comprobable sin revisar registro por registro: conteos, barras y Sankey coinciden con SQLite y la alternativa tabular permite consultarlos sin depender del color.

---

## Fase 22 (US4): Gestión por lote en el espacio de trabajo (Prioridad: P1)

**Objetivo**: Mantener la navegación entre Datos maestros y Registros de calidad, mostrar siempre el lote seleccionado y filtrar inspecciones y órdenes por su identificador.

**Prueba independiente**: Al elegir un lote por número y producto, las inspecciones y órdenes mostradas pertenecen solo a ese lote; cambiar de sección conserva lo guardado y avisa si hay cambios sin guardar.

**Depende de**: T141, T145-T146 y T157.

### Pruebas de la revisión para US4

- [x] T159 [P] [US4] Probar filtrado por lote, conservación del contexto y aviso por cambios sin guardar en tests/integration/remote-workspace.test.js.

### Implementación de la revisión para US4

- [x] T160 [US4] Añadir selector con número de lote y producto en index.html y src/app.js.
- [x] T161 [US4] Filtrar registros y órdenes por el identificador del contexto en src/app.js sobre el estado autorizado, sin duplicar rutas de consulta.
- [x] T162 [US4] Conservar navegación y lote seleccionado en src/app.js y src/components/shell.js.
- [x] T163 [US4] Avisar antes de cambiar de sección o contexto con un formulario modificado en src/app.js.
- [x] T164 [US4] Verificar permisos de mutación en tests/server/service.test.js y contexto de consulta en tests/integration/remote-workspace.test.js.

**Punto de control**: El contexto de lote es visible, no mezcla lotes y todas sus operaciones pasan por la sesión del servidor.

---

## Fase 23 (US5): Configuración del módulo controlada por el servidor (Prioridad: P1)

**Objetivo**: Administrar nombre del módulo, catálogos y perfiles desde una configuración validada, sin duplicar tolerancias, fechas ni estados de HU7.

**Prueba independiente**: Solo un Administrador autenticado modifica /api/config; un valor inválido se rechaza con explicación y conserva la última configuración válida; un Inspector no puede cambiarla ni por llamada directa.

**Depende de**: T139-T149.

### Pruebas de la revisión para US5

- [x] T165 [P] [US5] Verificar configuración inválida y conservación de la última válida en tests/server/service.test.js.
- [x] T170 [P] [US5] Probar rechazo de cambios de configuración del Inspector en tests/server/service.test.js.

### Implementación de la revisión para US5

- [x] T166 [US5] Restringir PUT /api/config a Administrador en server/service.js; mantener GET autenticado.
- [x] T167 [US5] Persistir configuración y cuentas en server/database.js, reutilizando catálogos tipados; mantener parámetros y fechas en HU7.
- [x] T168 [US5] Validar nombre, etiquetas y tema antes de guardar configuración en server/service.js.
- [x] T169 [US5] Cargar configuración autorizada en /api/session e instalarla desde src/main.js.

**Punto de control**: La configuración general pertenece al Administrador y no contradice ni reemplaza las reglas de medición y estado definidas en US7.

---

## Fase 24 (US6): Registro guiado de inspecciones (Prioridad: P1)

**Objetivo**: Guiar al inspector con etiquetas de calidad, ayuda breve con unidades, selección de registros existentes y avisos junto al campo, sin conceptos financieros ni adornos.

**Prueba independiente**: El inspector elige producto y lote, ve los campos obligatorios antes de guardar, corrige un error sin perder lo escrito y recibe folio, lote y resultado al guardar.

**Depende de**: T146, T160-T163 y T166-T169. La evaluación de mediciones se conecta en T184, dentro de US7, sin duplicar su lógica aquí.

### Pruebas de la revisión para US6

- [x] T171 [P] [US6] Probar formulario conectado, referencias existentes y ayuda de medición en tests/integration/remote-workspace.test.js.
- [x] T177 [P] [US6] Verificar campos financieros ocultos y ausencia de adornos en tests/integration/remote-workspace.test.js y revisión visual local.

### Implementación de la revisión para US6

- [x] T172 [US6] Ordenar producto y lote al inicio de los campos de inspección en src/components/remote-document-fields.js y src/app.js.
- [x] T173 [US6] Ocultar campos de compatibilidad financiera y duplicados en el flujo remoto de src/app.js; conservar módulos históricos.
- [x] T174 [US6] Ofrecer selects de maestros existentes con etiquetas y lotes filtrados por producto en src/components/remote-document-fields.js y src/app.js.
- [x] T175 [US6] Conservar valores y mostrar errores por campo en src/app.js y src/components/remote-document-fields.js.
- [x] T176 [US6] Confirmar folio, lote legible y resultado al guardar en src/app.js.

**Punto de control**: El flujo visible habla solo de calidad, permite elegir maestros por datos conocidos y no pierde información cuando la validación falla.

---

## Fase 25 (US7): Parámetros, mediciones, planificación y transiciones (Prioridad: P1)

**Objetivo**: Definir parámetros por producto con unidad, límites, versión y estado; evaluar lecturas contra la versión vigente; consolidar fechas objetivo y transiciones de NCR/CAPA sin duplicar HU9 ni HU12.

**Prueba independiente**: Una lectura en los extremos se acepta; una fuera de rango se guarda como RECHAZADO con alerta específica; una lectura ausente o inválida impide guardar; cambiar el parámetro después no altera la inspección anterior; una transición inválida no modifica el registro.

**Depende de**: T135, T139, T174-T176 y T166-T169.

### Pruebas de la revisión para US7

- [x] T178 [P] [US7] Probar límites inválidos y extremos en tests/unit/quality-parameters.test.js.
- [x] T179 [P] [US7] Probar lecturas inválidas, faltantes y extremos inclusivos en tests/unit/quality-parameters.test.js y tests/server/service.test.js.
- [x] T180 [P] [US7] Probar alerta y conservación de evidencia en tests/server/service.test.js y tests/integration/remote-workspace.test.js.
- [x] T190 [P] [US7] Comprobar que las transiciones inválidas no cambian la base en tests/server/service.test.js.
- [x] T191 [P] [US7] Comprobar que cambiar un parámetro no reescribe la evidencia histórica en tests/server/service.test.js.

### Implementación de la revisión para US7

- [x] T181 [US7] Guardar y versionar parámetros mediante saveParameter en server/service.js, validando con src/quality-parameters.js.
- [x] T182 [US7] Evaluar todas las lecturas activas y calcular el resultado en server/service.js con src/quality-parameters.js; ignorar resultados forzados por el cliente.
- [x] T183 [US7] Guardar copia de límites, unidad, versión y lectura con cada inspección en server/service.js y SQLite.
- [x] T184 [US7] Mostrar parámetros activos, intervalo y versión en src/components/remote-document-fields.js.
- [x] T185 [US7] Mantener alerta específica de rechazo tras guardar en src/app.js y src/styles.css.
- [x] T186 [US7] Reutilizar planificación e historial de src/storage.js dentro de server/service.js; sincronizar fecha y responsable de CAPA sin duplicar HU9.
- [x] T187 [US7] Mostrar fecha, vencimiento, cumplimiento e historial desde el estado autorizado en src/app.js y src/components/remote-views.js.
- [x] T188 [US7] Reutilizar catálogo único de transiciones de src/document-types.js y validar tanto status como estado en server/service.js.
- [x] T189 [US7] Ofrecer solo transiciones válidas en src/components/remote-document-fields.js y mantener estado sincronizado en el servidor.

**Punto de control**: HU7 es la única definición de parámetros, evidencia de lecturas, fechas objetivo y estados; las referencias históricas a HU9 y HU12 no generan tareas nuevas ni reglas contradictorias.

---

## Fase 26 (US10): Registros propios de inspección, NCR y CAPA (Prioridad: P1)

**Objetivo**: Guardar evidencia concreta de cada inspección, hallazgo y acción correctiva, con relaciones verificables, permisos del servidor y trazabilidad de autor y fecha.

**Prueba independiente**: El Inspector crea inspecciones y NCR; solo Gestor o Administrador edita y gestiona CAPA; el Auditor solo consulta; una referencia inválida o una acción sin permiso deja la base sin cambios.

**Depende de**: T139-T149, T182-T183 y T188-T190.

### Pruebas de la revisión para US10

- [x] T192 [P] [US10] Conservar pruebas de campos propios en tests/unit/document-types.test.js y relaciones en tests/server/service.test.js.
- [x] T193 [P] [US10] Verificar permisos por registro en tests/server/service.test.js.
- [x] T200 [P] [US10] Rechazar referencias inválidas y borrado de documentos de origen en tests/server/service.test.js.

### Implementación de la revisión para US10

- [x] T194 [US10] Guardar Inspección mediante acciones tipadas en server/service.js y mostrar detalle con evidencia en src/components/remote-views.js.
- [x] T195 [US10] Guardar NCR con inspección de origen y relaciones verificadas en server/service.js.
- [x] T196 [US10] Guardar CAPA con NCR, causa, acción propuesta, responsable, fecha, evidencia y estado en server/service.js.
- [x] T197 [US10] Verificar permiso del servidor, preservar referencias y confirmar borrados desde src/app.js.
- [x] T198 [US10] Registrar autor y fecha de mutaciones en server/service.js; mantener historial de planificación de src/storage.js.
- [x] T199 [US10] Conectar formularios y detalles tipados en src/app.js, remote-document-fields.js y remote-views.js.

**Punto de control**: Cada registro tiene datos propios, un vínculo verificable al origen y auditoría; la interfaz no puede eludir los permisos del servidor.

---

## Fase 27 (US11): Consulta de todas las órdenes y trazabilidad (Prioridad: P1)

**Objetivo**: Abrir la consulta con todas las órdenes, combinar filtros, consultar inspecciones y NCR/CAPA vinculadas y exportar CSV sin fórmulas activas.

**Prueba independiente**: La vista abre con el total completo; al combinar texto parcial, producto, lote, estado y rango de fechas muestra solo coincidencias; limpiar filtros restaura la lista; el Auditor no puede mutar.

**Depende de**: T135, T139, T199 y T203 para la trazabilidad.

### Pruebas de la revisión para US11

- [x] T201 [P] [US11] Probar todas las órdenes y filtros combinables en tests/unit/quality-parameters.test.js y tests/integration/remote-workspace.test.js.
- [x] T202 [P] [US11] Probar CSV y neutralización de fórmulas en tests/unit/quality-parameters.test.js.
- [x] T207 [P] [US11] Comprobar consulta y ausencia de escritura del Auditor en tests/server/service.test.js y tests/integration/remote-workspace.test.js.
- [x] T209 [P] [US11] Probar restauración del total al limpiar filtros en tests/integration/remote-workspace.test.js.

### Implementación de la revisión para US11

- [x] T203 [US11] Incluir todas las órdenes en el estado autorizado de server/service.js y abrir la lista completa en src/app.js.
- [x] T204 [US11] Combinar texto, producto, lote, estado y fechas con filterOrders en src/quality-parameters.js y src/app.js.
- [x] T205 [US11] Cargar 24 órdenes y casos relacionados de forma aditiva/idempotente con simulate en server/service.js y seedDemo de src/demo-data.js.
- [x] T206 [US11] Mostrar inspecciones y cadena NCR/CAPA de cada orden en src/components/remote-views.js.
- [x] T208 [US11] Exportar CSV de las órdenes filtradas desde src/app.js y src/quality-parameters.js.

**Punto de control**: La consulta no exige conocer un número de orden, conserva la trazabilidad y mantiene la exportación segura bajo los filtros activos.

---

## Fase 28 (US13): Interfaz sobria y consistente (Prioridad: P1)

**Objetivo**: Conservar el marco de navegación con texto claro y paleta sobria, retirar adornos, mantener gráficos de datos con alternativa tabular y asegurar teclado y pantallas pequeñas.

**Prueba independiente**: En todas las pantallas no hay emojis ni ilustraciones generadas; los gráficos tienen título, unidades y tabla equivalente; la navegación funciona con teclado y la barra lateral sigue operable en ventanas estrechas.

**Depende de**: T153-T157, T145, T197 y T206.

### Pruebas de la revisión para US13

- [x] T210 [P] [US13] Conservar pruebas de navegación en tests/integration/workspace-shell.test.js y verificar teclado y pantalla estrecha en el navegador.
- [x] T215 [P] [US13] Conservar pruebas de confirmación y cancelación de borrados en tests/integration/edit-delete-entity.test.js y manage-document.test.js.
- [x] T216 [P] [US13] Verificar gráficos de datos y escape de etiquetas en tests/unit/quality-charts.test.js.

### Implementación de la revisión para US13

- [x] T211 [US13] Retirar emojis y decoración generada de index.html, src/components/dashboard.js y src/components/shell.js.
- [x] T212 [US13] Añadir títulos, unidades y tablas equivalentes a gráficos en src/components/quality-charts.js.
- [x] T213 [US13] Mantener foco visible y aria-current, con etiquetas legibles en menú reducido en src/styles.css y src/components/shell.js.
- [x] T214 [US13] Confirmar borrados y carga de ejemplos desde src/app.js.

**Punto de control**: La interfaz se reconoce por su navegación y terminología, no por adornos; la información de los gráficos sigue disponible de forma accesible.

---

## Fase 29 (US15): Mensajes accionables y cierre de la revisión (Prioridad: P2)

**Objetivo**: Explicar qué campo está mal, qué valor se espera y qué ocurrió, distinguir un dato mal escrito de una medición fuera de tolerancia y verificar toda la revisión en la copia local.

**Prueba independiente**: Ante un error se muestra el campo y la corrección esperada en español; una medición válida fuera de rango genera alerta de rechazo con evidencia; una operación correcta muestra confirmación breve sin trazas ni códigos internos.

**Depende de**: T175, T185, T218 y todas las fases anteriores.

### Pruebas de la revisión para US15

- [x] T217 [P] [US15] Probar error de lectura vacía y alerta con lectura/rango en tests/integration/remote-workspace.test.js.

### Implementación y verificación de la revisión para US15

- [x] T218 [US15] Mostrar avisos en español por campo en src/app.js y sus componentes, conservando lo escrito tras un error.
- [x] T219 [US15] Distinguir dato inválido sin guardar de lectura fuera de tolerancia guardada como rechazo en src/quality-parameters.js y src/app.js.
- [x] T220 [US15] Confirmar operaciones correctas sin trazas internas en src/app.js.
- [ ] T221 [US15] El equipo debe validar la redacción asistida, mensajes y límites ficticios; registrar su revisión humana en docs/revision-ayudante-2026-11-26.md.
- [x] T222 [US15] Ejecutar la suite completa, lint, build y revisión visual; registrar resultados en docs/revision-ayudante-2026-11-26.md.
- [x] T223 [US15] Auditar tareas nuevas y conservar T001-T130 sin cambios; marcar solo lo demostrado y dejar pendiente la validación humana T221.

**Punto de control**: La revisión queda cerrada solo con pruebas, lint y build ejecutados localmente; ninguna tarea nueva se marca por una referencia de diseño.

---

## Dependencias y ejecución en paralelo de la revisión

### Orden de dependencias

- Fase 20 (US14): sin dependencias nuevas; habilita todas las demás fases.
- Fase 21 (US3): depende de T135, T139 y T141.
- Fase 22 (US4): depende de T141 y T145-T146.
- Fase 23 (US5): depende de T139-T149.
- Fase 24 (US6): depende de T146, T160-T163 y T166-T169; su conexión de mediciones ocurre en T184.
- Fase 25 (US7): depende de T135, T139, T174-T176 y T166-T169; absorbe HU9 y HU12 sin tareas duplicadas.
- Fase 26 (US10): depende de T182-T183 y T188-T190.
- Fase 27 (US11): depende de T139, T199 y T203-T204.
- Fase 28 (US13): depende de T153-T157, T145, T197 y T206.
- Fase 29 (US15): depende de T185, T218 y de la verificación final T222.

### Oportunidades en paralelo

- T131, T132, T144 y T147 pueden ejecutarse en paralelo entre sí.
- T150, T151 y T158 pueden crearse antes de T152-T157.
- T159, T165, T171, T178-T180, T192, T193, T201, T202, T207, T209 y T210 son pruebas independientes dentro de sus fases.
- T142, T152, T161, T166, T181, T186, T188 y T203 pueden avanzar en paralelo después de T135-T139.
- T154 y T155 pueden avanzar en paralelo tras T153; T156 depende de ambas.
- T194, T195 y T196 pueden ejecutarse en paralelo tras T182 y T188; T197-T199 dependen de las tres.
- T204, T205 y T208 pueden ejecutarse en paralelo tras T203.
- T211, T212 y T213 pueden ejecutarse en paralelo tras T153-T157 y T210.
- T218, T219 y T220 pueden avanzar en paralelo tras T185; T221-T223 son secuenciales.

### Criterios independientes por historia

- US3: totales reales, barras y Sankey con flujos conservados, leyenda y tabla equivalente; estado vacío sin porcentajes.
- US4: selector de lote con número y producto, filtros por lote, aviso de cambios sin guardar y navegación conservada.
- US5: configuración modificable solo por Administrador, valores inválidos rechazados y última configuración válida conservada.
- US6: formulario guiado con etiquetas de calidad, maestros existentes, avisos junto al campo y folio/lote/resultado al guardar.
- US7: parámetros validados, extremos aceptados, rechazo con alerta, evidencia de límites y versión, fechas y transiciones consolidadas.
- US10: campos propios y relaciones de inspección, NCR y CAPA con permisos y auditoría del servidor.
- US11: todas las órdenes, filtros combinables, trazabilidad, Auditor de solo lectura y CSV seguro.
- US13: marco sobrio, gráficos accesibles con tabla, teclado, pantallas pequeñas y confirmaciones sensibles.
- US14: 401 sin sesión, 403 sin permiso, CSRF/origen, expiración, revocación, último Administrador protegido y sin secretos en respuestas.
- US15: mensajes accionables en español, distinción entre error de dato y rechazo por tolerancia, confirmaciones breves y revisión del equipo.

### Alcance sugerido para un primer incremento

El MVP de esta revisión es T131-T149 (US14), seguido de T178-T191 (US7) y T192-T200 (US10): sin servidor autorizado, parámetros y registros vinculados, las pantallas posteriores no tendrían evidencia verificable.
