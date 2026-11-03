# Especificación de la Funcionalidad: Módulo Base de Software de Planificación de Recursos Empresariales (ERP)

**Rama de la funcionalidad**: 001-erp-base-module  
**Creada**: 2026-07-08  
**Estado**: Borrador  
**Entrada**: Descripción del usuario: "Construir un módulo base de software de planificación de recursos empresariales (ERP) que pueda extenderse en módulos ERP personalizados. Debe proporcionar gestión de datos maestros (entidades) y documentos transaccionales vinculados con capacidades de crear/editar/eliminar/buscar."

## Propósito

Este proyecto sirve como módulo base reutilizable para construir módulos ERP personalizados. Establece los patrones comunes que todo módulo ERP necesita: gestionar registros de datos maestros (**Entidades**) y sus **Documentos** transaccionales asociados, con navegación, validación, persistencia y búsqueda ya implementadas, de modo que los módulos personalizados solo necesiten definir sus campos y reglas específicos del dominio.

## Escenarios de Usuario y Pruebas *(obligatorio)*

### Historia de Usuario 1 - Crear y organizar entidades (Prioridad: P1)
Como usuario de negocio, quiero crear entradas de entidad con detalles claros para poder construir y mantener los datos maestros del módulo.

**Por qué esta prioridad**: Este es el valor central del producto porque, sin crear entidades, el resto de la experiencia no puede aportar valor.

**Prueba Independiente**: Un usuario puede abrir el módulo, añadir una nueva entidad y verla aparecer en la lista.

**Escenarios de Aceptación**:

1. **Dado** que un usuario está viendo la lista de entidades, **cuando** crea una nueva entidad con un nombre y un código, **entonces** la nueva entidad se guarda y aparece en la lista.
2. **Dado** que un usuario está creando una entidad, **cuando** deja la información obligatoria en blanco, **entonces** el sistema impide guardar y explica qué se necesita.

---

### Historia de Usuario 2 - Editar y eliminar entidades (Prioridad: P1)
Como usuario de negocio, quiero actualizar o eliminar entidades cuando cambien los datos maestros para que los registros se mantengan precisos.

**Por qué esta prioridad**: Mantener los registros actualizados es esencial para la confianza en la herramienta y para soportar las operaciones comerciales diarias.

**Prueba Independiente**: Un usuario puede seleccionar una entidad existente, cambiar su información o eliminarla, y la lista refleja el cambio.

**Escenarios de Aceptación**:

1. **Dada** una entidad que ya existe en la lista, **cuando** el usuario edita sus detalles, **entonces** la información actualizada se guarda y se muestra en la lista.
2. **Dada** una entidad que ya no es relevante, **cuando** el usuario la elimina, **entonces** desaparece de la lista y deja de aparecer en los resultados de búsqueda.
3. **Dadas** cientos de entidades almacenadas, **cuando** el usuario edita o elimina una, **entonces** la lista se actualiza correctamente y sigue siendo ágil.

---

### Historia de Usuario 3 - Panel de inicio del auditor interno con acciones rápidas y estado de cumplimiento (Prioridad: P1)

Como auditor interno del equipo de Control de Gestión, quiero aterrizar en un panel de inicio que me muestre el estado de cumplimiento de las áreas auditadas y me dé acceso de un clic a mis tareas de auditoría, para priorizar mi trabajo por vencimiento, registrar hallazgos sin fricción y evidenciar el seguimiento oportuno de cada área.

**Por qué esta prioridad**: El auditor no necesita “empezar a usar el ERP”: necesita saber qué áreas requieren atención hoy. El panel es su bandeja de entrada operativa. Si no expone vencimientos y acciones clave, el auditor pierde tiempo navegando y puede dejar vencer controles sin evidencia de seguimiento.

**Prueba Independiente**: Un auditor interno abre la aplicación y, sin navegar, identifica cuántas áreas están vencidas o próximas a vencer y cuántos hallazgos existen; con un solo clic puede registrar un área, registrar un hallazgo, abrir la gestión o buscar un registro.

**Escenarios de Aceptación**:

1. **Dado** que el auditor interno abre la aplicación, **cuando** se carga la vista inicial, **entonces** ve un panel con al menos cuatro acciones rápidas etiquetadas en lenguaje de auditoría: registrar/actualizar área auditada, registrar hallazgo o no conformidad, gestionar áreas y hallazgos, y buscar área, hallazgo o evidencia.
2. **Dado** que se muestra el panel, **cuando** el auditor activa la acción de registrar/actualizar área auditada, **entonces** se abre la gestión de áreas con un formulario vacío y listo para registrar nombre, código, categoría y fecha de vencimiento del área.
3. **Dado** que se muestra el panel, **cuando** el auditor activa la acción de registrar hallazgo o no conformidad, **entonces** se abre la gestión de hallazgos con un formulario vacío, solicitando el área asociada y sin permitir guardar hasta completar los campos obligatorios.
4. **Dado** que se muestra el panel, **cuando** el auditor activa la acción de gestionar áreas y hallazgos, **entonces** se abre la pantalla de gestión con los paneles de áreas y de hallazgos disponibles.
5. **Dado** que se muestra el panel, **cuando** el auditor activa la acción de buscar, **entonces** se abre la pantalla de búsqueda con el campo enfocado y puede buscar por nombre, código, categoría o fecha de vencimiento del área, así como por detalles del hallazgo.
6. **Dadas** áreas y hallazgos almacenados, **cuando** el auditor ve el panel, **entonces** las tarjetas de estado de cumplimiento muestran el total de áreas auditadas, áreas vigentes, áreas próximas a vencer, áreas vencidas, áreas sin fecha de vencimiento y total de hallazgos/no conformidades registrados.
7. **Dado** que el auditor crea, edita o elimina un área o un hallazgo en la gestión, **cuando** vuelve al panel, **entonces** los indicadores reflejan el cambio en la siguiente visualización, sin recargar manualmente la aplicación.
8. **Dado** que existen áreas vencidas o próximas a vencer, **cuando** el auditor ve el panel, **entonces** se muestran en una sección de alertas ordenadas por criticidad —primero vencidas, luego próximas a vencer— con nombre/código y fecha, y las vencidas se distinguen visualmente.
9. **Dado** que no hay áreas ni hallazgos registrados, **cuando** el auditor abre el panel, **entonces** ve los indicadores en cero y un mensaje que lo invita a registrar la primera área, sin ocultar las acciones rápidas.
10. **Dado** que un área no tiene fecha de vencimiento, **cuando** el auditor ve el panel, **entonces** se contabiliza como “sin plazo definido” y se muestra como pendiente de completar, sin bloquear el registro del área.

---

### Historia de Usuario 4 - Gestionar entidades y documentos en una pantalla dedicada (Prioridad: P1)

Como usuario de negocio, quiero una pantalla dedicada donde pueda añadir, editar y eliminar entidades y sus documentos, para poder gestionar los datos del módulo en un lugar enfocado.

**Por qué esta prioridad**: Esto preserva el valor central de las capacidades de gestión del módulo, presentado como una única pantalla de gestión accesible desde la barra lateral y las acciones rápidas del panel.

**Prueba Independiente**: Un usuario puede navegar a la pantalla de gestión mediante la barra lateral o una acción rápida, alternar entre la gestión de entidades y documentos, y volver al panel, añadiendo, editando y eliminando con éxito una entidad y un documento.

**Escenarios de Aceptación**:

1. **Dado** que el usuario está en la pantalla de gestión, **cuando** mira la navegación, **entonces** la barra lateral del espacio de trabajo ofrece botones de módulo para Entidades, Documentos y Panel con el módulo activo resaltado.
2. **Dada** la barra lateral visible, **cuando** el usuario activa el botón Entidades, **entonces** se muestra el contenido de gestión de entidades.
3. **Dada** la barra lateral visible, **cuando** el usuario activa el botón Documentos, **entonces** se muestra el contenido de gestión de documentos.
4. **Dado** que el usuario está en la pantalla de gestión, **cuando** mira la pantalla, **entonces** la lista de entidades no se muestra.
5. **Dado** que el usuario está en la pantalla de gestión, **cuando** crea una nueva entidad, **entonces** la entidad se guarda.
6. **Dada** una entidad existente, **cuando** el usuario edita sus detalles, **entonces** la información actualizada se guarda.
7. **Dada** una entidad que ya no es relevante, **cuando** el usuario la elimina, **entonces** se elimina junto con sus documentos.
8. **Dada** una entidad existente, **cuando** el usuario añade, edita o elimina un documento, **entonces** los cambios del documento se guardan y quedan asociados a esa entidad.
9. **Dado** que el usuario está en la pantalla de gestión, **cuando** activa el botón Panel en la barra lateral, **entonces** vuelve al panel de inicio.

---

### Historia de Usuario 5 - Definir un perfil de configuración del módulo (Prioridad: P1)

Como desarrollador de módulos, quiero declarar un único archivo de configuración que defina la identidad, terminología, campos personalizados y reglas de mi módulo, para adaptar el módulo base en un módulo específico sin modificar su código central.

**Por qué esta prioridad**: La adaptación mediante configuración es lo que convierte este proyecto de una aplicación fija en una base reutilizable. Sin ella, cada módulo personalizado requeriría editar archivos fuente centrales, lo que frustra el propósito de la plantilla; todas las historias de personalización posteriores dependen de que este mecanismo exista primero.

**Prueba Independiente**: Un desarrollador proporciona un archivo de configuración que define un perfil de Ventas (nombre del módulo, mapeos Entidad→Cliente, campos personalizados, ciclo de vida), y la aplicación se presenta plenamente como un módulo de Ventas; al quitar el archivo se restauran los valores predeterminados de la base sin errores.

**Escenarios de Aceptación**:

1. **Dado** que un archivo de configuración define el nombre del módulo, **cuando** la aplicación carga, **entonces** el panel de inicio y el marco del espacio de trabajo muestran el nombre configurado.
2. **Dada** una configuración completa (nombre, mapeos de términos, campos personalizados, ciclo de vida), **cuando** la aplicación carga, **entonces** el módulo se presenta plenamente bajo la identidad configurada sin que se vean términos del módulo base en ningún sitio.
3. **Dado** que no se proporciona configuración, **cuando** la aplicación carga, **entonces** la aplicación retrocede a los valores predeterminados integrados Entidad/Documento sin errores.
4. **Dada** una configuración con valores inválidos o conflictivos, **cuando** la aplicación carga, **entonces** el sistema informa del problema con claridad en lugar de fallar silenciosamente.

---

### Historia de Usuario 6 - Reetiquetar pantallas desde la configuración (Prioridad: P1)

Como desarrollador de módulos, quiero que todas las etiquetas visibles para el usuario deriven de la configuración, para que un módulo adaptado hable su idioma de dominio de forma consistente en todo momento.

**Por qué esta prioridad**: Los usuarios confían en un módulo que dice consistentemente "Cliente" y "Pedido de Venta" en lugar de dejar filtrarse una "Entidad" genérica por media interfaz; la terminología inconsistente hace que los módulos adaptados parezcan rotos. Esta historia depende del perfil de configuración (Historia de Usuario 5).

**Prueba Independiente**: Un desarrollador mapea Entidad→Cliente y Documento→Pedido de Venta en la configuración, y cada pestaña, botón, etiqueta de formulario, encabezado y mensaje en las tres pantallas usa los términos mapeados.

**Escenarios de Aceptación**:

1. **Dados** mapeos de términos definidos en la configuración, **cuando** cualquier pantalla carga, **entonces** pestañas, botones, etiquetas de formulario, encabezados y mensajes de estado vacío muestran los términos configurados.
2. **Dado** que las etiquetas han sido remapeadas, **cuando** el usuario navega entre pantallas, **entonces** el comportamiento de navegación no cambia.
3. **Dado** que no se proporcionan mapeos, **cuando** cualquier pantalla carga, **entonces** se muestran los términos predeterminados Entidad/Documento.

---

### Historia de Usuario 7 - Declarar campos personalizados para los registros (Prioridad: P1)

Como desarrollador de módulos, quiero declarar campos adicionales para entidades y documentos en la configuración, para que aparezcan automáticamente en formularios, listas, validación y búsqueda sin escribir código de interfaz.

**Por qué esta prioridad**: Los módulos personalizados existen porque sus registros contienen datos específicos del dominio (el límite de crédito de un cliente, la fecha de vencimiento de una factura). Si añadir campos requiere editar formularios y validación a mano, la adaptación es propensa a errores y no escala. Esta historia depende del perfil de configuración (Historia de Usuario 5).

**Prueba Independiente**: Un desarrollador declara un campo numérico obligatorio personalizado en las entidades; se muestra como entrada numérica en el formulario, bloquea el guardado cuando está en blanco, muestra los valores guardados en las listas y coincide en las búsquedas.

**Escenarios de Aceptación**:

1. **Dado** un campo personalizado de entidad de tipo número declarado como obligatorio, **cuando** el usuario crea o edita una entidad, **entonces** el campo se muestra como entrada numérica y un valor en blanco impide guardar con una explicación clara.
2. **Dado** un campo personalizado con un valor guardado, **cuando** el usuario ve la lista o la vista de detalle, **entonces** el valor se muestra.
3. **Dados** campos personalizados declarados, **cuando** el usuario busca usando un término que coincide con un valor de campo personalizado, **entonces** se devuelven los registros coincidentes.
4. **Dado** que no hay campos personalizados declarados, **cuando** la aplicación se ejecuta, **entonces** el comportamiento es idéntico al del módulo base sin modificar.

---

### Historia de Usuario 8 - Buscar y encontrar entidades rápidamente (Prioridad: P2)
Como usuario de negocio, quiero buscar mis entidades por detalles clave para encontrar rápidamente el registro que necesito.

**Por qué esta prioridad**: La recuperación rápida mejora la utilidad cuando el conjunto de datos crece más allá de un pequeño número de entradas.

**Prueba Independiente**: Un usuario puede introducir un término de búsqueda y ver solo las entidades coincidentes.

**Escenarios de Aceptación**:

1. **Dadas** múltiples entidades almacenadas, **cuando** el usuario busca con un término coincidente, **entonces** solo se muestran las entidades coincidentes.
2. **Dada** una búsqueda sin coincidencias, **cuando** el usuario envía la búsqueda, **entonces** el sistema muestra un estado vacío claro y permite volver a intentarlo.
3. **Dadas** cientos de entidades almacenadas, **cuando** el usuario busca, **entonces** los resultados coincidentes aparecen con prontitud sin retraso perceptible.

---

### Historia de Usuario 9 - Registrar la fecha de vencimiento de cada área (Prioridad: P2)

Como auditor interno, quiero asignar y actualizar una fecha de vencimiento a cada área, para controlar los plazos de cumplimiento, priorizar las áreas próximas a vencer y evidenciar el cumplimiento oportuno de cada área.

**Por qué esta prioridad**: El seguimiento de vencimientos por área convierte los registros en un control real de cumplimiento y permite detectar retrasos de forma agregada, pero no es necesario para la gestión básica de entidades.

**Prueba Independiente**: Un auditor interno puede fijar la fecha de vencimiento de un área y verla mostrada en la lista, identificando a simple vista si el área está vigente, próxima a vencer o vencida.

**Escenarios de Aceptación**:

1. **Dado** que un auditor interno está creando o editando un área, **cuando** introduce o modifica su fecha de vencimiento, **entonces** la fecha se guarda asociada a esa área y se muestra en la lista.
2. **Dada** un área con fecha de vencimiento asignada, **cuando** el auditor interno consulta la lista, **entonces** puede identificar de un vistazo el área, su fecha de vencimiento y si está vigente, próxima a vencer o vencida.
3. **Dado** que un auditor interno deja la fecha de vencimiento en blanco, **cuando** guarda el área, **entonces** el área se guarda sin fecha (campo opcional) y se indica que no tiene plazo definido.
4. **Dado** que se introduce una fecha de vencimiento anterior a la fecha actual, **cuando** el auditor interno guarda el área, **entonces** el sistema la acepta como vencida y la resalta para su seguimiento, sin impedir el registro.
5. **Dado** que se introduce una fecha de vencimiento que no es una fecha de calendario válida, **cuando** el auditor interno intenta guardar, **entonces** el sistema impide el guardado y explica que la fecha de vencimiento no es válida.
6. **Dado** que un auditor interno modifica la fecha de vencimiento de un área existente, **cuando** guarda el cambio, **entonces** la nueva fecha reemplaza a la anterior y se refleja de inmediato en la lista.

---

### Historia de Usuario 10 - Registrar los detalles de documentos de una entidad (Prioridad: P2)
Como usuario de negocio, quiero registrar detalles de documentos para una entidad, para mantener la actividad transaccional organizada junto a cada registro de datos maestros.

**Por qué esta prioridad**: Los documentos aportan valor operativo práctico una vez que las entidades están gestionadas, pero no son necesarios para la gestión central.

**Prueba Independiente**: Un usuario puede añadir un documento a una entidad y ver los detalles del documento mostrados junto a esa entidad.

**Escenarios de Aceptación**:

1. **Dada** una entidad en la lista, **cuando** el usuario añade un documento con detalles, **entonces** el documento se guarda y queda asociado a esa entidad.
2. **Dado** un documento existente para una entidad, **cuando** el usuario selecciona esa entidad en la pantalla de gestión, **entonces** los detalles del documento se muestran en la vista de gestión de documentos.
3. **Dada** una entidad eliminada, **cuando** se confirma la eliminación, **entonces** sus documentos asociados también se eliminan.
4. **Dado** que un usuario está creando un documento, **cuando** deja la información obligatoria del documento en blanco, **entonces** el sistema impide guardar y explica qué se necesita.

---

### Historia de Usuario 11 - Buscar entidades en una pantalla dedicada (Prioridad: P2)

Como usuario de negocio, quiero una pantalla de búsqueda dedicada para encontrar rápidamente entidades sin que los formularios de edición saturen la vista.

**Por qué esta prioridad**: La recuperación rápida es valiosa cuando el conjunto de datos crece, y una pantalla separada mantiene enfocada la experiencia de gestión, pero la búsqueda no es necesaria para la gestión básica.

**Prueba Independiente**: Un usuario puede abrir la pantalla de búsqueda desde la barra lateral o una acción rápida, introducir un término de búsqueda y ver solo las entidades coincidentes.

**Escenarios de Aceptación**:

1. **Dado** que el usuario está en la pantalla de búsqueda, **cuando** introduce un término coincidente, **entonces** solo se muestran las entidades coincidentes.
2. **Dada** una búsqueda sin coincidencias, **cuando** el usuario envía la búsqueda, **entonces** se muestra un estado vacío claro y puede volver a intentarlo.
3. **Dadas** cientos de entidades almacenadas, **cuando** el usuario busca desde la pantalla de búsqueda, **entonces** los resultados aparecen con prontitud sin retraso perceptible.
4. **Dado** que el usuario está en la pantalla de búsqueda, **cuando** activa el botón Panel en la barra lateral, **entonces** vuelve al panel de inicio.

---

### Historia de Usuario 12 - Configurar el ciclo de vida de estados de documentos (Prioridad: P2)

Como desarrollador de módulos, quiero definir los estados permitidos de los documentos y las transiciones permitidas, para que los documentos sigan el ciclo de vida del dominio en lugar de aceptar texto de estado arbitrario.

**Por qué esta prioridad**: Los módulos reales necesitan ciclos de vida controlados (p. ej., cotización → pedido → facturado), pero el estado de texto libre sigue siendo aceptable para extensiones simples, así que esto mejora la base sin ser necesario para la adaptación básica. Esta historia depende del perfil de configuración (Historia de Usuario 5).

**Prueba Independiente**: Un desarrollador configura un ciclo de vida cotización→pedido→facturado; el control de estado ofrece solo estados siguientes válidos, las transiciones inválidas se rechazan con una explicación, y el estado es visible de un vistazo en las listas.

**Escenarios de Aceptación**:

1. **Dado** un ciclo de vida configurado, **cuando** el usuario edita el estado de un documento, **entonces** solo se ofrecen los estados alcanzables mediante transiciones permitidas.
2. **Dado** que se intenta una transición inválida por cualquier vía, **cuando** se envía, **entonces** el sistema la rechaza con una explicación clara.
3. **Dado** un ciclo de vida configurado, **cuando** el usuario ve listas o detalles de documentos, **entonces** el estado actual es identificable de un vistazo.
4. **Dado** que no hay ciclo de vida configurado, **cuando** se editan documentos, **entonces** el estado permanece como texto libre igual que en el módulo base sin modificar.

---

### Historia de Usuario 13 - Marco de espacio de trabajo ERP con marca (Prioridad: P1)

Como usuario de negocio, quiero un espacio de trabajo estilo ERP consistente, con una barra superior con marca y una barra lateral de módulos presentes en cada pantalla, para que la aplicación se sienta como un sistema empresarial coherente en lugar de páginas sueltas.

**Por qué esta prioridad**: El marco aporta la marca y la navegación de todas las demás pantallas; construirlo como envoltorio evita tocar cada historia por separado y da al módulo su identidad ERP. Depende del perfil de configuración (Historia de Usuario 5) para el nombre del módulo y la terminología, y reestructura la navegación antes proporcionada por los botones de bienvenida y las pestañas de gestión (Historias de Usuario 3 y 4).

**Prueba Independiente**: En cada pantalla, una barra superior muestra un logotipo derivado del nombre del módulo junto al nombre del módulo, una barra lateral ofrece botones de módulo para Panel, Entidades, Documentos y Buscar con el módulo activo resaltado visualmente, y navegar entre módulos nunca pierde datos.

**Escenarios de Aceptación**:

1. **Dada** cualquier pantalla mostrada, **cuando** el usuario mira la página, **entonces** es visible una barra superior que contiene un logotipo SVG en línea derivado del nombre del módulo y el nombre del módulo configurado.
2. **Dada** cualquier pantalla mostrada, **cuando** el usuario mira la barra lateral, **entonces** se muestran botones de módulo para Panel, Entidades, Documentos y Buscar usando la terminología configurada.
3. **Dado** que el usuario está en cualquier pantalla, **cuando** mira la barra lateral, **entonces** el botón del módulo activo está resaltado visualmente.
4. **Dado** que la ventana gráfica es estrecha, **cuando** se usa la aplicación en una pantalla pequeña, **entonces** la barra lateral se contrae a una columna de iconos manteniéndose utilizable y etiquetada de forma accesible.
5. **Dada** una configuración que define un color de acento, **cuando** cualquier pantalla carga, **entonces** el marco lo usa consistentemente para resaltados y controles principales; sin valor configurado o con un valor inválido, se usan los valores predeterminados integrados sin errores.
6. **Dado** que el usuario navega entre módulos mediante la barra lateral, **cuando** inspecciona sus datos después, **entonces** todas las entidades y documentos almacenados permanecen intactos.

---

### Casos Límite

- ¿Qué ocurre cuando un usuario intenta guardar una entidad sin nombre o código obligatorio?
- ¿Cómo gestiona el sistema una búsqueda que no devuelve coincidencias?
- ¿Qué ocurre si un usuario intenta editar o eliminar una entidad que ya no existe?
- ¿Qué ocurre cuando un auditor interno introduce una fecha de vencimiento de área que no es una fecha de calendario válida?
- ¿Qué ocurre cuando un área tiene una fecha de vencimiento anterior a la fecha actual?
- ¿Qué ocurre con los documentos de una entidad cuando esta se elimina?
- ¿Qué ocurre cuando un usuario introduce una fecha final anterior a la fecha inicial en un documento?
- ¿Qué ocurre cuando la configuración declara un campo personalizado cuya clave choca con un nombre de campo base?
- ¿Qué ocurre cuando la configuración referencia un tipo de campo desconocido o una definición de transición de ciclo de vida inválida?
- ¿Qué ocurre cuando los registros almacenados contienen valores de campos personalizados que ya no están declarados en la configuración?
- ¿Qué ocurre cuando un usuario abre la aplicación directamente en la pantalla de gestión o búsqueda (p. ej., vía enlace profundo o recarga del navegador) sin pasar por el panel de inicio?
- ¿Qué ocurre cuando un usuario pulsa el botón atrás del navegador estando en la pantalla de gestión o búsqueda?
- ¿Qué ocurre si un usuario navega fuera de la pantalla de gestión mientras un formulario aún tiene cambios sin guardar?
- ¿Permanecen intactas las entidades y los documentos al navegar entre el panel, la gestión y la búsqueda?
- ¿Qué ocurre cuando el panel se abre con cero áreas auditadas o cero hallazgos (valores estadísticos)?
- ¿Qué ocurre cuando un área no tiene fecha de vencimiento y aparece en el panel como “sin plazo definido”?
- ¿Qué ocurre cuando todas las áreas están vencidas o no existe ninguna próxima a vencer?
- ¿Qué ocurre cuando el color de acento configurado no es un valor de color válido?
- ¿Cómo mantiene la barra lateral contraída las etiquetas de módulo accesibles en ventanas gráficas estrechas?

## Requisitos *(obligatorio)*

### Requisitos Funcionales

- **FR-001**: El sistema DEBE permitir a los usuarios crear un registro de entidad con al menos un nombre y un código.
- **FR-002**: El sistema DEBE permitir a los usuarios editar los detalles de un registro de entidad existente.
- **FR-003**: El sistema DEBE permitir a los usuarios eliminar un registro de entidad existente.
- **FR-004**: El sistema DEBE permitir a los usuarios buscar registros de entidad por nombre, código, categoría u otras palabras clave descriptivas.
- **FR-005**: El sistema DEBE mostrar una lista clara de entidades e indicar cuándo ningún resultado coincide con una búsqueda.
- **FR-006**: El sistema DEBE presentar retroalimentación clara cuando falta información obligatoria o no se puede completar una acción.
- **FR-007**: El sistema DEBE mantener los datos de entidad consistentes tras operaciones de creación, edición y eliminación.
- **FR-008**: El sistema DEBE permitir a los usuarios añadir, editar y eliminar detalles de documentos de una entidad.
- **FR-009**: El sistema DEBE asociar cada documento exactamente a una entidad y eliminar los documentos asociados cuando la entidad se elimina.
- **FR-010**: El sistema DEBE mostrar un panel de inicio como vista inicial, con botones de acción rápida claramente etiquetados para las tareas clave del auditor interno.
- **FR-011**: El sistema DEBE envolver cada pantalla en un marco de espacio de trabajo persistente compuesto por una barra superior con marca y una barra lateral de navegación de módulos.
- **FR-012**: La barra lateral DEBE proporcionar botones de módulo para Panel, Entidades, Documentos y Buscar, etiquetados desde la configuración del módulo.
- **FR-013**: El botón de módulo Entidades DEBE mostrar el contenido de gestión de entidades.
- **FR-014**: El botón de módulo Documentos DEBE mostrar el contenido de gestión de documentos en la pantalla de gestión.
- **FR-015**: El botón de módulo Panel DEBE devolver al usuario al panel de inicio.
- **FR-016**: La pantalla de gestión NO DEBE mostrar la lista de entidades.
- **FR-017**: La pantalla de gestión DEBE proporcionar la funcionalidad de crear, editar y eliminar entidades.
- **FR-018**: La pantalla de gestión DEBE proporcionar la funcionalidad de crear, editar y eliminar documentos.
- **FR-019**: El sistema DEBE navegar a una pantalla de búsqueda dedicada cuando se selecciona el botón Buscar en la barra lateral.
- **FR-020**: La pantalla de búsqueda DEBE permitir buscar entidades por nombre, código, categoría, descripción o fecha de vencimiento del área.
- **FR-021**: La pantalla de búsqueda DEBE ser accesible tanto desde la barra lateral como desde la acción rápida de buscar registros del panel.
- **FR-022**: El sistema DEBE mantener los datos de entidades y documentos intactos y consistentes durante la navegación entre pantallas.
- **FR-023**: El sistema DEBE cargar la configuración del módulo al arrancar y aplicarla en todas las pantallas.
- **FR-024**: El sistema DEBE retroceder a los valores predeterminados integrados (terminología Entidad/Documento, sin campos personalizados, sin ciclo de vida) cuando no se proporciona configuración.
- **FR-025**: El sistema DEBE informar claramente de una configuración inválida o conflictiva en lugar de fallar silenciosamente.
- **FR-026**: El sistema DEBE mostrar los campos personalizados declarados en los formularios de creación/edición con tipos de entrada que coincidan con sus tipos declarados.
- **FR-027**: El sistema DEBE validar los valores de campos personalizados, incluidos los obligatorios, antes de guardar, usando la misma experiencia de retroalimentación que la validación base.
- **FR-028**: El sistema DEBE incluir los valores de campos personalizados en los resultados de búsqueda y mostrarlos en listas y vistas de detalle.
- **FR-029**: El sistema DEBE derivar todas las etiquetas visibles para el usuario de la configuración del módulo en lugar de texto fijo en el código.
- **FR-030**: El sistema DEBE aplicar las transiciones de estado configuradas en los documentos independientemente de cómo se envíe un cambio.
- **FR-031**: El sistema DEBE mantener el estado del documento como texto libre cuando no hay ciclo de vida configurado.
- **FR-032**: El sistema DEBE mantener el renderizado de listas y la búsqueda ágiles y correctos para conjuntos de datos de al menos 500 registros de entidad.
- **FR-033**: El panel DEBE ofrecer al menos cuatro botones de acción rápida: registrar/actualizar área auditada, registrar hallazgo o no conformidad, gestionar áreas y hallazgos, y buscar área, hallazgo o evidencia.
- **FR-034**: Activar la acción rápida de registrar área o hallazgo DEBE abrir el área de gestión correspondiente con un formulario vacío listo para introducir datos.
- **FR-035**: El panel DEBE mostrar tarjetas de estado de cumplimiento con el número de áreas auditadas, áreas vigentes, próximas a vencer, vencidas, sin fecha de vencimiento y hallazgos registrados, actualizadas cada vez que se muestra el panel.
- **FR-036**: La barra superior DEBE mostrar un logotipo derivado del nombre del módulo junto con el nombre del módulo configurado en cada pantalla.
- **FR-037**: La barra lateral DEBE resaltar visualmente el módulo activo en cada pantalla.
- **FR-038**: La configuración PUEDE definir un color de acento; el sistema DEBE aplicarlo consistentemente en todo el marco y retroceder de forma segura a los valores integrados cuando esté ausente o sea inválido.
- **FR-039**: En ventanas gráficas estrechas, la barra lateral DEBE contraerse a una columna de iconos manteniéndose operable.
- **FR-040**: El sistema DEBE permitir asignar y actualizar una fecha de vencimiento opcional a cada área.
- **FR-041**: El sistema DEBE validar que la fecha de vencimiento del área sea una fecha de calendario válida cuando esté presente, impidiendo guardar valores inválidos.
- **FR-042**: El sistema DEBE mostrar la fecha de vencimiento del área en las listas e indicar si está vigente, próxima a vencer o vencida.
- **FR-043**: El sistema DEBE aceptar fechas de vencimiento anteriores a la fecha actual como áreas vencidas y resaltarlas para su seguimiento, sin impedir el registro.
- **FR-044**: El panel DEBE clasificar las áreas como vigentes, próximas a vencer, vencidas o sin plazo definido usando un umbral configurable de 30 días para “próxima a vencer”.
- **FR-045**: El panel DEBE mostrar una sección de alertas con las áreas vencidas y próximas a vencer, ordenadas por criticidad (vencidas primero) e incluyendo al menos nombre/código y fecha de vencimiento.
- **FR-046**: El panel DEBE mostrar los indicadores en cero y un mensaje de invitación a registrar la primera área cuando no existan áreas ni hallazgos, sin ocultar las acciones rápidas.
- **FR-047**: El panel NO DEBE permitir la edición de registros; las acciones de creación, edición y eliminación DEBEN permanecer en la pantalla de gestión.

### Requisitos de Extensibilidad *(obligaciones del módulo base)*

Los módulos personalizados construidos sobre esta base DEBEN poder:

- **XR-001**: Extender los registros de entidad y documento con campos adicionales específicos del dominio sin cambiar la estructura de almacenamiento base.
- **XR-002**: Reetiquetar pantallas, pestañas, formularios y listas con terminología específica del módulo sin alterar el comportamiento de navegación.
- **XR-003**: Añadir reglas de validación específicas del módulo junto a las reglas de validación base.
- **XR-004**: Apoyarse en el módulo base para generación de identidad, marcas de tiempo, integridad referencial entre entidades y documentos, y eliminación en cascada.
- **XR-005**: Remarcar el espacio de trabajo —nombre del módulo, logotipo derivado y color de acento— únicamente mediante configuración.

### Entidades Clave *(incluir si la funcionalidad implica datos)*

- **Entidad**: Un registro de datos maestros gestionado por el módulo, que incluye su nombre, código de negocio, detalles descriptivos, categoría de clasificación, una fecha de vencimiento opcional (campo `targetDate`, que en el módulo de control de gestión representa el vencimiento de un área) y un entity_id autogenerado. Los módulos personalizados definen qué representa una Entidad en el mundo real (p. ej., cliente, producto, activo, área).
- **Documento**: Detalles transaccionales adjuntos a una entidad, vinculados a ella por el entity_id de la entidad. Los módulos personalizados definen qué representa un Documento (p. ej., pedido, factura, contrato).
- **ModuleConfig**: El objeto de adaptación cargado al arrancar que define el nombre del módulo, las etiquetas de terminología, las definiciones de campos personalizados y el ciclo de vida de estados de documentos. Consulte data-model.md para su forma completa.

## Criterios de Éxito *(obligatorio)*

### Resultados Medibles

- **SC-001**: Los usuarios pueden crear una nueva entidad y verla en la lista en menos de 2 minutos.
- **SC-002**: Los usuarios pueden encontrar una entidad existente mediante la búsqueda en menos de 10 segundos tras introducir un término relevante.
- **SC-003**: Al menos el 90% de los usuarios de prueba pueden completar tareas de crear, editar, eliminar y buscar sin ayuda.
- **SC-004**: El sistema sigue siendo utilizable para un conjunto de datos de al menos 500 registros de entidad sin pérdida de funcionalidad central.
- **SC-005**: Un usuario puede alcanzar las pantallas de gestión y búsqueda desde el panel o la barra lateral en menos de 10 segundos en el primer uso.
- **SC-006**: Toda la funcionalidad existente de gestión de entidades y documentos sigue operativa tras el rediseño del marco ERP y el panel (sin regresiones).
- **SC-007**: Los usuarios pueden navegar entre las pantallas de panel, gestión y búsqueda sin perder ninguna entidad ni documento almacenado.
- **SC-008**: Un desarrollador puede producir un módulo adaptado usando solo el archivo de configuración, con cero modificaciones en archivos fuente centrales.
- **SC-009**: Cada pantalla presenta el mismo marco con marca, y los usuarios pueden identificar en qué módulo están de un vistazo.
- **SC-010**: Los indicadores de cumplimiento mostrados en el panel siempre coinciden con las áreas y hallazgos almacenados.
- **SC-011**: El auditor interno identifica las áreas vencidas o próximas a vencer en menos de 10 segundos desde que abre la aplicación.
- **SC-012**: Al menos el 90% de los auditores internos inicia una tarea clave desde el panel con un solo clic.
- **SC-013**: Las alertas de vencimiento del panel se mantienen correctas y utilizables con al menos 500 áreas registradas.

## Suposiciones

- El módulo base gestiona datos para un único espacio de trabajo en lugar de una base de datos multiinquilino compartida.
- La adaptación a un módulo específico se realiza mediante un archivo de configuración del módulo en lugar de editando archivos fuente centrales.
- El módulo de Control de Gestión se configura con la terminología Área auditada (Entidad) y Hallazgo/no conformidad (Documento).
- El umbral para clasificar un área como próxima a vencer es de 30 días y es configurable.
- El panel de inicio es de solo consulta y navegación; la creación, edición y eliminación de áreas y hallazgos permanece en la pantalla de gestión.
- Cada entidad incluye información básica suficiente para identificación y seguimiento; los módulos personalizados aportan los campos específicos del dominio.
- La versión inicial se centra en la gestión central de datos maestros y documentos en lugar de capacidades ERP avanzadas como flujos de aprobación, períodos de contabilización o informes.
- La búsqueda se realiza sobre los registros de entidad almacenados.
- La pantalla de gestión consolida los formularios de añadir/editar entidad y añadir/editar documento en una sola pantalla de gestión.
- La navegación entre áreas ocurre mediante una barra lateral persistente; la pantalla de gestión aloja ambos paneles de gestión y no muestra la lista de entidades.
- El logotipo se genera como un monograma SVG en línea derivado del nombre del módulo; no se requieren recursos de imagen externos.
- Se puede configurar un color de acento opcional para la marca; el resto de la paleta base permanece fija.
- Solo se muestra una pantalla a la vez; no hay diseño lado a lado del contenido de gestión y búsqueda.
- La navegación entre pantallas se maneja dentro de la aplicación (p. ej., cambio de vistas), y el botón atrás del navegador debe comportarse de forma predecible.
- Los datos siguen persistiéndose en el localStorage del navegador y no se ven afectados por la navegación entre pantallas.
- La pantalla de búsqueda se centra en encontrar y ver entidades; la edición permanece en la pantalla de gestión.
- El contenido del usuario introducido por el usuario (nombres, descripciones, notas de documentos) DEBE sanitizarse antes de renderizarse en el DOM para prevenir ataques de inyección de scripts (XSS). El módulo base DEBE escapar HTML y atributos de eventos al mostrar datos de localStorage.

