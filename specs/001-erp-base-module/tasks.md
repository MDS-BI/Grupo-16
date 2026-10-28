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

## Fase 3: Historia de Usuario 1 - Crear y Organizar Entidades (Prioridad: P1) 🎯 MVP

**Objetivo**: Permitir a los usuarios añadir las entidades maestras del modelo de calidad y verlas en la lista.

**Prueba Independiente**: Un usuario puede abrir la aplicación, enviar un formulario de entidad (área, empleado, producto, lote) y ver la nueva entidad aparecer.

### Pruebas para la Historia de Usuario 1

- [ ] T013 [P] [US1] Añadir pruebas unitarias para validación de entidades en tests/unit/storage.test.js
- [ ] T014 [P] [US1] Añadir pruebas de integración para crear entidades en tests/integration/create-entity.test.js

### Implementación de la Historia de Usuario 1

- [ ] T015 [P] [US1] Crear la interfaz del formulario de entidad en src/components/quality-entity-form.js (para los 4 tipos: área, empleado, producto, lote)
- [ ] T016 [US1] Conectar el envío del formulario para crear y persistir una nueva entidad en src/app.js
- [ ] T017 [US1] Renderizar la lista de entidades y mostrar retroalimentación de validación en src/components/quality-entity-list.js
- [ ] T018 [US1] Implementar selección de tipo de entidad (área/empleado/producto/lote) en el formulario
- [ ] T019 [US1] Añadir campos específicos por tipo de entidad en el formulario (módulo ENUM para áreas, ENUM puesto para empleados, etc.)

**Punto de control**: La Historia de Usuario 1 debe estar completamente funcional y ser comprobable de forma independiente. Todas las 4 tipos de entidad (área, empleado, producto, lote) deben ser creables.

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

## Fase 5: Historia de Usuario 3 - Panel de Inicio con Acciones Rápidas y Estadísticas (Prioridad: P1)

**Objetivo**: Proporcionar la pantalla de punto de entrada con un panel estilo ERP con botones de acción rápida claramente etiquetados y totales de registros en un vistazo.

**Prueba Independiente**: Un usuario abre la aplicación, ve un panel con múltiples botones de acción rápida y estadísticas de registros, inicia una nueva entidad o documento con un solo clic.

### Pruebas para la Historia de Usuario 3

- [ ] T027 [P] [US3] Añadir pruebas de integración para las acciones rápidas del panel y las estadísticas en vivo en tests/integration/dashboard.test.js

### Implementación de la Historia de Usuario 3

- [ ] T028 [P] [US3] Añadir el marcado del panel (encabezado, cuadrícula de acciones rápidas, tarjetas de estadísticas) a index.html
- [ ] T029 [US3] Conectar los botones de acción rápida para abrir la gestión de entidades, la gestión de documentos (formularios limpiados) y la búsqueda (entrada enfocada) en src/app.js
- [ ] T030 [US3] Renderizar y refrescar los recuentos de entidades desde el almacenamiento cada vez que se muestra el panel en src/components/dashboard.js
- [ ] T031 [P] [US3] Dar estilo al encabezado del panel, las tarjetas de acción rápida y los mosaicos de estadísticas en src/styles.css
- [ ] T032 [US3] Implementar estadísticas para las 4 entidades principales (áreas, empleados, productos, lotes) mostradas en el panel
- [ ] T033 [US3] Añadir indicador de estado vacío cuando no hay registros en el almacenamiento

**Punto de control**: La aplicación abre en un panel funcional; cada tarea ERP clave (nueva entidad, nuevo documento, gestión de entidades, buscar registros) está a un clic. Las estadísticas deben reflejar conteos en tiempo real.

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

## Fase 10: Historia de Usuario 8 - Buscar y Encontrar Entidades Rápidamente (Prioridad: P2)

**Objetivo**: Permitir a los usuarios buscar y filtrar entidades rápidamente, manteniendo la capacidad de respuesta con conjuntos de datos grandes.

**Prueba Independiente**: Un usuario puede introducir un término de búsqueda y ver solo las entidades coincidentes.

### Pruebas para la Historia de Usuario 8

- [ ] T061 [P] [US8] Añadir pruebas unitarias para la lógica de filtrado de búsqueda en tests/unit/storage.test.js
- [ ] T062 [P] [US8] Añadir pruebas de integración para el comportamiento de búsqueda en tests/integration/search-entities.test.js

### Implementación de la Historia de Usuario 8

- [ ] T063 [P] [US8] Crear la interfaz de la barra de búsqueda en src/components/search-bar.js
- [ ] T064 [US8] Conectar la entrada de búsqueda al filtrado y al comportamiento de estado vacío en src/app.js
- [ ] T065 [US8] Asegurar que los resultados de búsqueda permanezcan sincronizados con las acciones de crear, editar y eliminar en src/app.js
- [ ] T066 [US8] Implementar filtrado sobre: nombre, código, descripción, tipo, módulo, estado, fecha para las 4 entidades principales
- [ ] T067 [US8] Implementar búsqueda combinada en múltiples campos simultáneamente
- [ ] T068 [US8] Manejar búsquedas sin coincidencias con estado vacío claro y permitir volver a intentarlo

**Punto de control**: Las historias centrales de datos y la búsqueda deben estar ahora funcionalmente independientes. La búsqueda debe ser rápida incluso con 500+ registros (FR-032, SC-004).

---

## Fase 11: Historia de Usuario 9 - Registrar una Fecha Objetivo (Prioridad: P2)

**Objetivo**: Permitir a los usuarios adjuntar una fecha objetivo opcional a una entidad para planificar y ordenar los registros según cuándo vence algo.

**Prueba Independiente**: Un usuario puede fijar una fecha en una entidad y verla mostrada en la lista.

### Pruebas para la Historia de Usuario 9

- [ ] T069 [P] [US9] Añadir pruebas unitarias para validación y persistencia de la fecha objetivo en tests/unit/storage.test.js

### Implementación de la Historia de Usuario 9

- [ ] T070 [P] [US9] Añadir la entrada de fecha objetivo al formulario de entidad en index.html
- [ ] T071 [US9] Incluir targetDate en la lógica de validación, creación, actualización y búsqueda en src/storage.js
- [ ] T072 [US9] Conectar targetDate al envío del formulario, poblado de edición y visualización de errores en src/app.js
- [ ] T073 [US9] Mostrar la fecha objetivo en la lista de entidades en src/app.js (formateada: dd/mm/yyyy)
- [ ] T074 [US9] Implementar validación de que la fecha objetivo sea posterior a la fecha de creación
- [ ] T075 [US9] Manejar fecha objetivo nula/opcional: la entidad igualmente se guarda sin fecha si el usuario la deja en blanco

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

## Fase 14: Historia de Usuario 12 - Configurar el Ciclo de Vida de Estados de Documentos (Prioridad: P2)

**Objetivo**: Aplicar los estados y transiciones configurados en los documentos manteniendo el estado de texto libre cuando no hay configuración.

**Prueba Independiente**: Con estados configurados (ABIERTA→EN_INVESTIGACIÓN→EN_CAPA→CERRADA/RECHAZADA), solo se ofrecen los estados siguientes válidos, los inválidos se rechazan con explicaciones, y el estado es visible de un vistazo; sin configuración, el estado permanece como texto libre.

### Pruebas para la Historia de Usuario 12

- [ ] T090 [P] [US12] Añadir pruebas unitarias para la aplicación de transiciones de estado en tests/unit/storage.test.js

### Implementación de la Historia de Usuario 12

- [ ] T091 [US12] Restringir las opciones de estado de documento a las transiciones permitidas y aplicarlas al guardar en src/components/document-form.js y src/storage.js
- [ ] T092 [US12] Implementar matriz de transiciones permitidas por tipo de documento: NCR (ABIERTE→INVESTIGACIÓN→EN_CAPA→CERRADA/RECHAZADA), Inspección (ACEPTADO/RECHAZADO/CONDICIONADO), etc.
- [ ] T093 [US12] Aplicar transiciones de estado configuradas en los documentos independientemente de cómo se envíe un cambio (formulario, barra lateral, atajo)
- [ ] T094 [US12] Cuando no hay ciclo de vida configurado, el estado permanece como texto libre igual que en el módulo base sin modificar
- [ ] T095 [US12] Visualizar el estado actual identificable de un vistazo en listas y detalles de documentos

**Punto de control**: La cadena de personalización (HU5→HU6/HU7/HU12) está completa de extremo a extremo. Las transiciones inválidas se rechazan con explicación clara.

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

## Fase 16: Historia de Usuario 13 - Marco de Espacio de Trabajo ERP con Marca (Prioridad: P1)

**Objetivo**: Envolver cada pantalla en un marco ERP persistente: una barra superior con logotipo derivado y nombre del módulo, más una barra lateral de botones de módulo con resaltado de módulo activo y contracción responsiva.

**Prueba Independiente**: En cada pantalla la barra superior y la barra lateral son visibles, el módulo activo está resaltado, la navegación entre módulos preserva los datos, y la barra lateral se contrae a una columna de iconos en ventanas gráficas estrechas.

### Pruebas para la Historia de Usuario 13

- [ ] T102 [P] [US13] Añadir pruebas de integración que afirmen que el marco (logotipo, nombre del módulo, botones de barra lateral, resaltado activo) aparece en todas las pantallas en tests/integration/workspace-shell.test.js

### Implementación de la Historia de Usuario 13

- [ ] T103 [P] [US13] Añadir el marcado del marco del espacio de trabajo (barra superior, montaje de logotipo SVG en línea, botones de módulo en barra lateral, región de contenido principal) a index.html
- [ ] T104 [P] [US13] Crear src/components/shell.js para renderizar el logotipo monograma SVG a partir del nombre del módulo, aplicar las etiquetas configuradas a los botones de módulo, gestionar el resaltado de módulo activo y exponer eventos de navegación
- [ ] T105 [P] [US13] Construir la hoja de estilos de tokens de diseño ERP (variables de color, escala de espaciado, tipografía) más estilos de barra superior, barra lateral y tarjetas en src/styles.css
- [ ] T106 [US13] Soportar un theme.accentColor opcional en la validación de src/module-config.js y aplicarlo como propiedad personalizada de CSS en src/app.js
- [ ] T107 [US13] Contraer la barra lateral a una columna de iconos en ventanas gráficas estrechas en src/styles.css
- [ ] T108 [P] [US13] Actualizar las pruebas de integración existentes para apuntar al marco de barra lateral en lugar de los botones de bienvenida
- [ ] T109 [US13] Asegurar que la navegación entre módulos (Panel→Gestión→Búsqueda) preserve los datos almacenados en localStorage

**Punto de control**: Todas las pantallas se renderizan dentro del marco con marca con navegación por barra lateral funcional y sin pérdida de datos. El marco debe ser visible en todas las pantallas y el botón del módulo activo debe estar resaltado visualmente.

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

### Oportunidades en Paralelo

- T003/T004 pueden ejecutarse en paralelo con las tareas de configuración
- Las pruebas de cada historia pueden crearse en paralelo con las tareas de implementación de la misma historia
- Después de la Fase 7 (perfil de configuración), HU6 (Fase 8) y HU7 (Fase 9) pueden proceder en paralelo
- HU8 (Fase 10) y HU9 (Fase 11) son independientes y pueden proceder en paralelo después de la Historia de Usuario 1
- En la Fase 15, T096-T098 pueden ejecutarse en paralelo antes de las tareas finales T100-T101
- En la Fase 16, T103-T105 y T107 pueden ejecutarse en paralelo; T108 aterriza junto al cambio de enrutamiento T104
- En la Fase 17, T110 y T111 pueden ejecutarse en paralelo antes de la verificación final T112-T115