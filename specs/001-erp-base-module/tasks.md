# Tareas: Módulo Base de Software de Planificación de Recursos Empresariales (ERP) - Módulo de Gestión de Calidad

**Entrada**: Documentos de diseño desde `/specs/001-erp-base-module/`
**Prerrequisitos**: plan.md (obligatorio), spec.md (obligatorio para las historias de usuario), research.md, modelo_entidad_relacion_gestion_calidad.md, contracts/

## Formato: `[ID] [P?] [Historia] Descripción`

## Fase 1: Configuración Inicial y Estructura del Proyecto

**Propósito**: Inicializar la estructura del proyecto, configurar herramientas y establecer la base sobre la que dependerán todas las historias del módulo de gestión de calidad.

- [ ] T001 Crear la estructura de la aplicación Vite con src/, tests/, y archivos de configuración para el módulo de calidad
- [ ] T002 Instalar las dependencias Vite, Vitest y bibliotecas de UI necesarias para el proyecto de gestión de calidad
- [ ] T003 [P] Configurar el linting y formateo (ESLint/Prettier) con reglas específicas para módulo de calidad
- [ ] T004 [P] Estructurar directorios src/components/, src/storage.js, src/app.js, src/styles.css para módulo de calidad
- [ ] T005 [P] Configurar localStorage persistente con clave 'quality-models' para almacenamiento de datos del módulo

---

## Fase 2: Modelo de Datos y Almacenamiento Base

**Propósito**: Implementar el modelo de datos derivado de modelo_entidad_relacion_gestion_calidad.md y los ayudantes de validación que sustentarán todas las historias.

- [ ] T006 Crear src/storage.js con ayudantes de CRUD para todas las entidades del modelo: Área Organizativa, Empleado, Producto, Lote
- [ ] T007 Implementar persistencia en localStorage para Áreas Organizativas (área_id, código, nombre, módulo, activo)
- [ ] T008 Implementar persistencia en localStorage para Empleados (empleado_id, número_nomina, puesto, area_id, estado)
- [ ] T009 [P] Implementar persistencia en localStorage para Productos (producto_id, código, descripción, tipo, unidad_medida, critico_calidad)
- [ ] T010 [P] Implementar persistencia en localStorage para Lotes (lote_id, producto_id, número_lote, fecha_fabricación, fecha_caducidad)
- [ ] T011 Crear validaciones helper para restricciones del modelo (PK, FK, UK, NN, CHECK constraints)
- [ ] T012 [P] Implementar gestión de entity_id autogenerado y relaciones FK entre entidades

---

## Fase 3: Historia de Usuario 1 - Crear y organizar datos maestros (Lote, Producto, Área Organizativa, Empleado) (Prioridad: P1) 🎯 MVP

**Objetivo**: Permitir al Inspector de Planta registrar y mantener información confiable de Lotes, Productos, Áreas Organizativas y Empleados, con nombre y código, y localizarlos en la lista para identificar los elementos y responsables vinculados a las inspecciones y el control de calidad.

**Prueba Independiente**: Un Inspector de Planta registra un Lote, Producto, Área Organizativa o Empleado con su nombre y código, confirma que queda guardado y puede localizarlo en la lista con información suficiente para identificarlo.

### Pruebas para la Historia de Usuario 1

- [ ] T013 [P] [US1] Añadir pruebas unitarias para validación de datos maestros (nombre y código obligatorios) en tests/unit/storage.test.js
- [ ] T014 [P] [US1] Añadir pruebas de integración para crear datos maestros (Lote, Producto, Área Organizativa, Empleado) en tests/integration/create-entity.test.js

### Implementación de la Historia de Usuario 1

- [ ] T015 [P] [US1] Crear la interfaz del formulario de datos maestros en src/components/quality-entity-form.js (para los 4 tipos: Lote, Producto, Área Organizativa, Empleado)
- [ ] T016 [US1] Conectar el envío del formulario para validar nombre y código obligatorios, crear y persistir un nuevo dato maestro en src/app.js
- [ ] T017 [US1] Renderizar la lista de datos maestros con información identificativa suficiente (nombre, código y datos propios del tipo) y mostrar retroalimentación de validación en src/components/quality-entity-list.js
- [ ] T018 [US1] Implementar selección del tipo de dato maestro (Lote/Producto/Área Organizativa/Empleado) en el formulario
- [ ] T019 [US1] Añadir campos específicos por tipo de dato maestro (número de lote y fechas de fabricación/caducidad para Lote; código, descripción, tipo y unidad de medida para Producto; código, nombre y módulo para Área Organizativa; número de nómina, puesto, área y estado para Empleado)

**Punto de control**: La Historia de Usuario 1 debe estar completamente funcional y ser comprobable de forma independiente. Los 4 tipos de datos maestros (Lote, Producto, Área Organizativa, Empleado) deben ser creables, y el sistema debe impedir guardar cuando falte el nombre o el código e indicar qué dato debe completar.

---

## Fase 4: Historia de Usuario 2 - Editar y Eliminar Entidades (Prioridad: P1)

**Objetivo**: Permitir a los usuarios actualizar o eliminar entidades maestras almacenadas, manteniendo la capacidad de respuesta con conjuntos de datos grandes.

**Prueba Independiente**: Un usuario puede editar una entidad existente o eliminarla, y la lista se actualiza correctamente.

### Pruebas para la Historia de Usuario 2

- [ ] T020 [P] [US2] Añadir pruebas unitarias para actualizar y eliminar entidades en tests/unit/storage.test.js
- [ ] T021 [P] [US2] Añadir pruebas de integración para editar y eliminar una entidad en tests/integration/edit-delete-entity.test.js

### Implementación de la Historia de Usuario 2

- [ ] T022 [P] [US2] Añadir controles de edición y eliminación a la interfaz de la lista de entidades en src/components/quality-entity-list.js
- [ ] T023 [US2] Conectar las acciones de edición para poblar el formulario y actualizar los datos persistidos en src/app.js
- [ ] T024 [US2] Gestionar las acciones de eliminación y quitar registros del almacenamiento y la interfaz en src/app.js
- [ ] T025 [US2] Implementar eliminación en cascada: al eliminar un Área, eliminar sus Empleados; al eliminar un Producto, eliminar sus Lotes
- [ ] T026 [P] [US2] Añadir pruebas de integración para eliminación en cascada en tests/integration/cascade-delete.test.js

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

- [ ] T034 [P] [US4] Añadir pruebas de integración para la funcionalidad de gestión completa en tests/integration/manage-entities-docs.test.js

### Implementación de la Historia de Usuario 4

- [ ] T035 [P] [US4] Añadir navegación de barra lateral con botones Entidades, Documentos, Panel, Buscar en src/components/shell.js
- [ ] T036 [US4] Mostrar el contenido de gestión de entidades cuando el usuario activa el botón Entidades en la barra lateral
- [ ] T037 [US4] Mostrar el contenido de gestión de documentos cuando el usuario activa el botón Documentos en la barra lateral
- [ ] T038 [US4] Añadir funcionalidad de crear, editar y eliminar entidades en la pantalla de gestión
- [ ] T039 [US4] Añadir funcionalidad de crear, editar y eliminar documentos asociados a entidades en la pantalla de gestión
- [ ] T040 [US4] Implementar eliminación en cascada: al eliminar una entidad, sus documentos asociados también se eliminan
- [ ] T041 [P] [US4] Añadir estilos para la barra lateral, regiones de contenido y navegación en src/styles.css

**Punto de control**: Las Historias de Usuario 1-4 deben estar completamente funcionales y ser comprobables de forma independiente. La pantalla de gestión debe consolidar ambos formularios (entidad y documento) en una sola pantalla.

---

## Fase 7: Historia de Usuario 5 - Definir un Perfil de Configuración del Módulo (Prioridad: P1)

**Objetivo**: Introducir `src/module-config.js` para que los desarrolladores puedan adaptar la identidad del módulo de calidad sin editar el código central, con valores predeterminados seguros e informes de error claros.

**Prueba Independiente**: Un desarrollador suministra una configuración de Calidad; la aplicación carga mostrándola. Al quitar el archivo se restauran los valores predeterminados calidad sin errores.

### Pruebas para la Historia de Usuario 5

- [ ] T042 [P] [US5] Añadir pruebas unitarias para carga de configuración, retroceso a predeterminados e informes de configuración inválida en tests/unit/module-config.test.js

### Implementación de la Historia de Usuario 5

- [ ] T043 [US5] Crear el cargador de configuración con valores predeterminados calidad, validación e informes de error claros en src/module-config.js
- [ ] T044 [US5] Cargar la configuración al arrancar y pasarla a todas las vistas en src/main.js y src/app.js
- [ ] T045 [US5] Implementar mapeos de terminología: Entidad→NCR/Inspección, Documento→Orden/Informe, etc.
- [ ] T046 [US5] Implementar mapeos de campos personalizados que fluyan automáticamente por formularios, validación, persistencia, listas y búsqueda

**Punto de control**: La configuración aún no impulsa nada visible, pero carga de forma fiable y valida limpiamente. Al remover el archivo de configuración, la aplicación retrocede a los valores predeterminados calidad sin errores.

---

## Fase 8: Historia de Usuario 6 - Reetiquetar Pantallas desde la Configuración (Prioridad: P1)

**Objetivo**: Derivar todas las etiquetas visibles para el usuario de la configuración para que los módulos adaptados hablen su idioma de dominio en todo momento.

**Prueba Independiente**: Con mapeos Calidad→Calidad, NCR→Informe de No Conformidad, etc., cada pestaña, botón, etiqueta de formulario, encabezado y mensaje muestra los términos mapeados en las tres pantallas; el comportamiento no cambia.

### Pruebas para la Historia de Usuario 6

- [ ] T047 [P] [US6] Añadir pruebas de integración que verifiquen las etiquetas configuradas en las pantallas de bienvenida, gestión y búsqueda en tests/integration/relabeling.test.js

### Implementación de la Historia de Usuario 6

- [ ] T048 [US6] Derivar todas las etiquetas visibles para el usuario de la configuración en lugar de texto codificado en index.html, src/app.js y los archivos de componentes
- [ ] T049 [US6] Implementar reetiquetado para todos los tipos de NCR (ABIERTA, EN_INVESTIGACION, EN_CAPA, CERRADA, RECHAZADA)
- [ ] T050 [US6] Implementar reetiquetado para todos los tipos de inspección (RECEPCION, PROCESO, FINAL, LIBERACION)
- [ ] T051 [US6] Implementar reetiquetado para todos los tipos de auditoría (INTERNA, PROVEEDOR, PROCESO)
- [ ] T052 [US6] Implementar reetiquetado para tipos de CAPA (CORRECTIVA, PREVENTIVA) y estados
- [ ] T053 [P] [US6] Añadir estilos para etiquetas dinámicas que se adapten a diferentes longitudes en src/styles.css

**Punto de control**: Un módulo configurado se presenta completamente bajo su propia terminología. El comportamiento de navegación no cambia independientemente de los mapeos aplicados.

---

## Fase 9: Historia de Usuario 7 - Declarar Campos Personalizados para los Registros (Prioridad: P1)

**Objetivo**: Permitir que los campos personalizados declarados fluyan automáticamente por formularios, validación, persistencia, listas y búsqueda.

**Prueba Independiente**: Declarar un campo numérico obligatorio personalizado en las entidades; se muestra como entrada numérica en el formulario, bloquea el guardado cuando está en blanco, muestra los valores guardados en las listas y coincide en las búsquedas; sin declaraciones la aplicación se comporta como la base sin modificar.

### Pruebas para la Historia de Usuario 7

- [ ] T054 [P] [US7] Añadir pruebas unitarias para validación y persistencia de campos personalizados en tests/unit/storage.test.js
- [ ] T055 [P] [US7] Añadir pruebas de integración para el renderizado de campos personalizados en formularios, listas y búsqueda en tests/integration/custom-fields.test.js

### Implementación de la Historia de Usuario 7

- [ ] T056 [P] [US7] Renderizar dinámicamente los campos personalizados declarados en los formularios de entidad y documento en src/components/quality-entity-form.js y src/components/document-form.js
- [ ] T057 [US7] Incluir los campos personalizados en validación, persistencia, listas y búsqueda en src/storage.js y src/app.js
- [ ] T058 [US7] Implementar tipos de campo personalizados: número, texto, ENUM, fecha, booleano, DECIMAL
- [ ] T059 [US7] Implementar validación obligatoria para campos personalizados declarados como NN
- [ ] T060 [US7] Implementar búsquedas que incluyan valores de campos personalizados

**Punto de control**: Los datos específicos del módulo de calidad requieren cero cambios de código de interfaz. Un desarrollador puede añadir un campo "fecha_proximo_audit" a las entidades y aparecerá automáticamente en formularios y listas.

---

## Fase 10: Historia de Usuario 8 - Buscar y encontrar Lotes, Productos, Áreas Organizativas o Empleados rápidamente (Prioridad: P2)

**Objetivo**: Permitir al Inspector de Planta buscar por datos identificativos (nombre, código u otros datos descriptivos) para encontrar el registro correcto al preparar una inspección, manteniendo la capacidad de respuesta con cientos de registros.

**Prueba Independiente**: Un Inspector de Planta puede introducir un término de búsqueda y ver solo los Lotes, Productos, Áreas Organizativas o Empleados coincidentes, con su información identificativa.

### Pruebas para la Historia de Usuario 8

- [ ] T061 [P] [US8] Añadir pruebas unitarias para la lógica de filtrado de datos maestros por nombre, código y datos descriptivos en tests/unit/storage.test.js
- [ ] T062 [P] [US8] Añadir pruebas de integración para la búsqueda de datos maestros, incluidos los casos sin coincidencias y el rendimiento con 500+ registros, en tests/integration/search-entities.test.js

### Implementación de la Historia de Usuario 8

- [ ] T063 [P] [US8] Crear la interfaz de la barra de búsqueda en src/components/search-bar.js
- [ ] T064 [US8] Conectar la entrada de búsqueda al filtrado y mostrar la información identificativa de cada resultado en src/app.js
- [ ] T065 [US8] Asegurar que los resultados de búsqueda permanezcan sincronizados con las acciones de crear, editar y eliminar datos maestros en src/app.js
- [ ] T066 [US8] Implementar filtrado sobre nombre, código y datos descriptivos (descripción, tipo, unidad de medida, módulo, puesto, número de nómina, número de lote, fechas y estado) para los 4 tipos de datos maestros
- [ ] T067 [US8] Implementar búsqueda combinada en múltiples campos simultáneamente
- [ ] T068 [US8] Manejar búsquedas sin coincidencias indicando que no se encontraron registros y permitir modificar o borrar la búsqueda para intentarlo de nuevo

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

- [ ] T076 [P] [US10] Añadir pruebas unitarias para generación de entity_id y validación de documentos en tests/unit/storage.test.js
- [ ] T077 [P] [US10] Añadir pruebas de integración para añadir un documento a una entidad en tests/integration/add-document.test.js
- [ ] T078 [P] [US10] Añadir pruebas de integración para edición, eliminación y eliminación en cascada de documentos en tests/integration/manage-document.test.js

### Implementación de la Historia de Usuario 10

- [ ] T079 [P] [US10] Crear la interfaz del formulario de documento en src/components/document-form.js (para tipos: NCR, Inspección, Auditoría, CAPA, Queja, Evaluación)
- [ ] T080 [P] [US10] Crear la interfaz de la lista de documentos en src/components/document-list.js
- [ ] T081 [US10] Conectar las acciones de crear, editar y eliminar documentos para persistirlos en src/app.js
- [ ] T082 [US10] Añadir entity_id a la creación de entidades y mostrar los documentos con su entidad en src/app.js
- [ ] T083 [US10] Implementar eliminación en cascada: al eliminar una entidad, sus documentos asociados también se eliminan en src/storage.js
- [ ] T084 [US10] Implementar tipos de documento con campos específicos: NCR (folio, origen, gravedad), Inspección (tipo, resultado, fecha), etc.

**Punto de control**: Los datos maestros y los documentos transaccionales deben estar completamente vinculados. La eliminación en cascada debe funcionar correctamente para todos los tipos de documento.

---

## Fase 13: Historia de Usuario 11 - Buscar Entidades en una Pantalla Dedicada (Prioridad: P2)

**Objetivo**: Proporcionar la pantalla de búsqueda dedicada accesible desde la pantalla de bienvenida, manteniendo la edición en la pantalla de gestión.

**Prueba Independiente**: Un usuario navega desde la pantalla de bienvenida a la pantalla de búsqueda, busca, ve resultados o un estado vacío, y vuelve a Inicio.

### Implementación de la Historia de Usuario 11

- [ ] T085 [P] [US11] Añadir la entrada de búsqueda y la lista de resultados a la vista de búsqueda dedicada en index.html
- [ ] T086 [US11] Conectar la entrada de búsqueda al filtrado de resultados y mostrar un estado vacío en la pantalla de búsqueda en src/app.js
- [ ] T087 [US11] Añadir navegación al Panel desde la pantalla de búsqueda en index.html
- [ ] T088 [US11] Implementar filtros por tipo de entidad y rango de fecha en la pantalla de búsqueda
- [ ] T089 [US11] Implementar exportación/volcado de resultados de búsqueda a CSV/local

**Punto de control**: Todas las historias del usuario de negocio deben estar completamente funcionales y ser comprobables de forma independiente. La pantalla de búsqueda debe ser accesible tanto desde la barra lateral como desde la acción rápida de buscar registros del panel.

---

## Fase 14: Historia de Usuario 12 - Configurar el Ciclo de Vida de Estados de Hallazgos/No Conformidades (NCR) (Prioridad: P2)

**Objetivo**: Permitir al administrador del módulo de calidad definir los estados permitidos de los hallazgos/no conformidades y sus transiciones, y aplicarlos en las NCR manteniendo el estado de texto libre cuando no hay configuración.

**Prueba Independiente**: El administrador del módulo de calidad configura un ciclo de vida (p. ej., abierta→en revisión→cerrada, compatible con la matriz del proyecto ABIERTA→EN_INVESTIGACIÓN→EN_CAPA→CERRADA/RECHAZADA); el control de estado de una NCR ofrece solo los estados siguientes válidos, una transición inválida (p. ej., cerrar una NCR sin pasar por revisión) se rechaza con explicación, y el estado de cada NCR es visible de un vistazo en las listas de gestión; sin configuración, el estado permanece como texto libre.

### Pruebas para la Historia de Usuario 12

- [ ] T090 [P] [US12] Añadir pruebas unitarias para la aplicación de transiciones de estado en las NCR en tests/unit/storage.test.js (incluye rechazo de transición inválida tipo "cerrar una NCR sin pasar por revisión" con explicación clara)

### Implementación de la Historia de Usuario 12

- [ ] T091 [US12] Restringir las opciones de estado de los hallazgos/no conformidades a las transiciones permitidas y aplicarlas al guardar en src/components/document-form.js y src/storage.js
- [ ] T092 [US12] Implementar matriz de transiciones permitidas por tipo de documento del dominio de calidad: NCR (ABIERTA→EN_INVESTIGACIÓN→EN_CAPA→CERRADA/RECHAZADA), Inspección (ACEPTADO/RECHAZADO/CONDICIONADO), etc., derivada del ciclo de vida configurado por el administrador del módulo de calidad
- [ ] T093 [US12] Aplicar transiciones de estado configuradas en las NCR independientemente de cómo se envíe un cambio (formulario, barra lateral, atajo)
- [ ] T094 [US12] Cuando no hay ciclo de vida configurado en el módulo de calidad, el estado del hallazgo permanece como texto libre igual que en el módulo base sin modificar
- [ ] T095 [US12] Visualizar el estado actual de cada NCR identificable de un vistazo en listas y detalles de hallazgos/no conformidades

**Punto de control**: La cadena de personalización (HU5→HU6/HU7/HU12) está completa de extremo a extremo. Las transiciones inválidas en las NCR se rechazan con explicación clara que indique las transiciones válidas del ciclo de calidad.

---

## Fase 15: Pulido y Preocupaciones Transversales

**Propósito**: Mejorar la calidad, accesibilidad, fiabilidad y el comportamiento con conjuntos de datos grandes en todas las historias.

- [ ] T096 [P] Añadir refinamientos de accesibilidad para etiquetas, foco de teclado y estructura semántica en todos los componentes calidad
- [ ] T097 [P] Añadir pulido final de UX para estados vacíos, mensajes de validación y diseño responsivo (móvil/tablet/desktop)
- [ ] T098 Verificar que el renderizado de listas y la búsqueda permanecen responsivos y correctos con 500 registros (FR-032, SC-004)
- [ ] T099 Ejecutar la suite completa de pruebas y probar manualmente los flujos principales de usuario
- [ ] T100 [P] Añadir estilos finales y tema de colores para el módulo calidad en src/styles.css
- [ ] T101 Ejecutar la suite completa de pruebas y la compilación de producción para verificar que no hay regresiones

---

## Fase 16: Historia de Usuario 13 - Marco de Espacio de Trabajo del Módulo de Calidad con Marca (Prioridad: P1)

**Objetivo**: Permitir al administrador del módulo de calidad ofrecer a su equipo un marco ERP persistente en cada pantalla: una barra superior con logotipo derivado y nombre del módulo de calidad, más una barra lateral de botones de módulo con terminología del dominio (Áreas auditadas, Hallazgos/no conformidades), resaltado de módulo activo y contracción responsiva.

**Prueba Independiente**: El administrador del módulo de calidad recorre todas las pantallas y en cada una ve la barra superior (logotipo SVG en línea + nombre del módulo configurado) y la barra lateral con botones para Panel, Áreas auditadas, Hallazgos/no conformidades y Buscar con el módulo activo resaltado; navegar entre módulos preserva las áreas y hallazgos almacenados, y la barra lateral se contrae a una columna de iconos en ventanas gráficas estrechas.

### Pruebas para la Historia de Usuario 13

- [ ] T102 [P] [US13] Añadir pruebas de integración que afirmen que el marco (logotipo, nombre del módulo de calidad, botones de barra lateral con terminología de calidad, resaltado activo) aparece en todas las pantallas en tests/integration/workspace-shell.test.js

### Implementación de la Historia de Usuario 13

- [ ] T103 [P] [US13] Añadir el marcado del marco del espacio de trabajo (barra superior, montaje de logotipo SVG en línea, botones de módulo en barra lateral, región de contenido principal) a index.html
- [ ] T104 [P] [US13] Crear src/components/shell.js para renderizar el logotipo monograma SVG a partir del nombre del módulo de calidad, aplicar las etiquetas configuradas a los botones de módulo (Panel, Áreas auditadas, Hallazgos/no conformidades, Buscar), gestionar el resaltado de módulo activo y exponer eventos de navegación
- [ ] T105 [P] [US13] Construir la hoja de estilos de tokens de diseño ERP (variables de color, escala de espaciado, tipografía) más estilos de barra superior, barra lateral y tarjetas en src/styles.css
- [ ] T106 [US13] Soportar un theme.accentColor opcional en la validación de src/module-config.js y aplicarlo como propiedad personalizada de CSS en src/app.js, con retroceso seguro a los valores integrados cuando esté ausente o sea inválido
- [ ] T107 [US13] Contraer la barra lateral a una columna de iconos en ventanas gráficas estrechas, manteniéndola operable y etiquetada de forma accesible, en src/styles.css
- [ ] T108 [P] [US13] Actualizar las pruebas de integración existentes para apuntar al marco de barra lateral en lugar de los botones de bienvenida
- [ ] T109 [US13] Asegurar que la navegación entre módulos (Panel→Gestión→Búsqueda) preserve las áreas auditadas y hallazgos/no conformidades almacenados en localStorage

**Punto de control**: Todas las pantallas del módulo de calidad se renderizan dentro del marco con marca con navegación por barra lateral funcional y sin pérdida de áreas ni hallazgos. El marco debe ser visible en todas las pantallas y el botón del módulo activo debe estar resaltado visualmente.

---

## Fase 17: Pulido Final y Aspecto ERP

**Propósito**: Unificar el estilo visual en toda la aplicación rediseñada y protegerse contra regresiones.

- [ ] T110 [P] Rediseñar formularios, listas, insignias, mensajes de error y estados vacíos según el sistema de tokens de diseño ERP en src/styles.css
- [ ] T111 [P] Verificar el orden de foco del teclado y aria-current en los botones de módulo de la barra lateral (pase de accesibilidad del nuevo marco)
- [ ] T112 Actualizar documentación interna con las secciones del marco del espacio de trabajo, panel y tematización del módulo calidad
- [ ] T113 Ejecutar la suite completa de pruebas y la compilación de producción para verificar que no hay regresiones (FR-032, SC-004, SC-008)
- [ ] T114 Ejecutar pruebas de extremo a extremo completas: flujo desde Panel → Gestión → Búsqueda → Panel con datos intactos
- [ ] T115 Verificar que el módulo puede adaptarse usando solo el archivo de configuración, con cero modificaciones en archivos fuente centrales (SC-008)

---

## Fase 18: Historia de Usuario 14 - Gestionar Roles y Permisos de Acceso (Prioridad: P1)

**Objetivo**: Permitir al administrador del sistema asignar roles a los usuarios para controlar las funciones que pueden utilizar dentro del módulo de Gestión de Calidad, protegiendo los registros, manteniendo la trazabilidad de las operaciones y limitando el acceso según las responsabilidades de cada usuario.

**Prueba Independiente**: Al utilizar usuarios con los roles Administrador, Gestor de Calidad, Inspector de Planta y Auditor, el sistema permite únicamente las operaciones autorizadas para cada uno: el Administrador gestiona registros, configuraciones y permisos; el Gestor de Calidad gestiona inspecciones, no conformidades y acciones correctivas sin administrar usuarios; el Inspector de Planta registra inspecciones y reporta no conformidades sin eliminar registros; el Auditor solo consulta información y trazabilidad; cualquier acción no autorizada se rechaza con un mensaje explicativo.

### Pruebas para la Historia de Usuario 14

- [ ] T116 [P] [US14] Añadir pruebas unitarias del catálogo de permisos y la matriz por rol (Administrador, Gestor de Calidad, Inspector de Planta, Auditor) en tests/unit/permissions.test.js
- [ ] T117 [P] [US14] Añadir pruebas de integración de los cinco escenarios de aceptación de HU14 con usuarios de distintos roles en tests/integration/roles-permissions.test.js

### Implementación de la Historia de Usuario 14

- [ ] T118 [US14] Definir el catálogo de permisos (gestionar registros, configuraciones y permisos; crear/editar/eliminar datos maestros; crear/editar/eliminar registros operativos; registrar inspecciones y reportar no conformidades; consultar y auditar trazabilidad) y la matriz que los asigna a cada uno de los cuatro roles en src/permissions.js
- [ ] T119 [US14] Registrar los roles y sus permisos por defecto en src/module-config.js, validando definiciones inválidas y conservando el retroceso seguro a valores predeterminados de HU5
- [ ] T120 [P] [US14] Añadir el marcado de la vista de administración de usuarios y asignación de roles, junto con su botón en la barra lateral, al marco de index.html y src/components/shell.js
- [ ] T121 [US14] Implementar la interfaz de administración de usuarios (listado de usuarios, selector de rol y guardado de la asignación) en src/components/role-admin.js y conectarla en src/app.js
- [ ] T122 [US14] Ocultar o deshabilitar en el panel, la barra lateral y las vistas de gestión y búsqueda las acciones no autorizadas para el rol activo, en src/app.js y src/styles.css
- [ ] T123 [US14] Implementar el guard de autorización central can(user, permission) y aplicarlo a crear, editar y eliminar datos maestros y registros operativos, modificar configuraciones y administrar usuarios en src/app.js y src/storage.js
- [ ] T124 [US14] Persistir usuarios, roles asignados y usuario activo en localStorage bajo las claves 'quality-users' y 'quality-session', y revalidar el rol activo al cargar y recargar la aplicación en src/storage.js
- [ ] T125 [US14] Rechazar toda operación solicitada sin autorización y mostrar un mensaje explicativo accesible que indique el permiso requerido, conforme al escenario de aceptación 5, en src/app.js
- [ ] T126 [P] [US14] Actualizar las pruebas de integración existentes para ejecutarse con un usuario Administrador por defecto y verificar que los nuevos guards no introducen regresiones en HU1-HU13

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
