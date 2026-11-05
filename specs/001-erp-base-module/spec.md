# Especificación de la Funcionalidad: Módulo Base de Software de Planificación de Recursos Empresariales (ERP) - Gestión de Calidad

**Rama de la funcionalidad**: 001-erp-base-module  
**Creada**: 2026-07-08  
**Estado**: Borrador  
**Entrada**: Descripción del usuario: "Construir un módulo base de software de planificación de recursos empresariales (ERP) que pueda extenderse en módulos ERP personalizados. Debe proporcionar gestión de datos maestros (Lote, Producto, Área Organizativa, Empleado) y registros operativos (Inspección de Calidad, No Conformidad NCR, Acción CAPA) vinculados con capacidades de crear/editar/eliminar/buscar."

## Propósito

Este proyecto sirve como módulo base reutilizable para construir módulos ERP personalizados de Gestión de Calidad. Establece los patrones comunes que todo módulo ERP necesita: gestionar registros de datos maestros (**Lote, Producto, Área Organizativa o Empleado**) y sus **Registros Operativos** (**Inspección de Calidad, No Conformidad NCR o Acción CAPA**) asociados, con navegación, validación, persistencia y búsqueda ya implementadas, de modo que los módulos personalizados solo necesiten definir sus campos y reglas específicos del dominio.

## Escenarios de Usuario y Pruebas *(obligatorio)*

### Historia de Usuario 1 - Crear y organizar datos maestros (Lote, Producto, Área Organizativa, Empleado) (Prioridad: P1)
Como Inspector de Planta, quiero registrar y mantener información confiable de Lotes, Productos, Áreas Organizativas y Empleados, para identificar correctamente los elementos y responsables relacionados con las inspecciones y el control de calidad.

**Por qué esta prioridad**: Este es el valor central del producto porque, sin registrar los Lotes, Productos, Áreas Organizativas o Empleados, el resto de la experiencia no puede aportar valor.

**Prueba Independiente**: El inspector de planta registra un lote, producto, área organizativa o empleado con su nombre y código, confirma que queda guardado y puede localizarlo para identificar los elementos o responsables vinculados a una actividad de inspección o control de calidad.

**Escenarios de Aceptación**:

1. **Dado** que el Inspector de Planta está en la sección de datos maestros, **cuando** registra un Lote, Producto, Área Organizativa o Empleado con nombre y código, **entonces** el sistema guarda el registro y lo muestra en la lista con información suficiente para identificarlo.
2. **Dado** que el Inspector de Planta está creando un registro maestro, **cuando** deja vacío el nombre o el código obligatorio, **entonces** el sistema impide guardarlo e indica qué dato debe completar.

Asignado a: [José Mondaca]

---

### Historia de Usuario 2 - Editar y eliminar datos maestros (Lote, Producto, Área Organizativa, Empleado) (Prioridad: P1)
Como Gestor de Calidad, quiero actualizar o eliminar registros de Lote, Producto, Área Organizativa o Empleado cuando cambien los datos maestros para que los registros se mantengan precisos.

**Por qué esta prioridad**: Mantener los Lotes, Productos, Áreas Organizativas y Empleados actualizados es esencial para la confianza en la herramienta y para soportar las operaciones diarias de control de calidad.

**Prueba Independiente**: Un Gestor de Calidad puede seleccionar un Lote, Producto, Área Organizativa o Empleado existente, cambiar su información o eliminarlo, y la lista refleja el cambio.

**Escenarios de Aceptación**:

1. **Dado** un registro maestro de Lote, Producto, Área Organizativa o Empleado que ya existe en la lista, **cuando** el Gestor de Calidad edita sus detalles, **entonces** la información actualizada se guarda y se muestra en la lista.
2. **Dado** un registro de Lote, Producto, Área Organizativa o Empleado que ya no es relevante, **cuando** el Gestor de Calidad lo elimina, **entonces** desaparece de la lista y deja de aparecer en los resultados de búsqueda.
3. **Dados** cientos de Lotes, Productos, Áreas Organizativas o Empleados almacenados, **cuando** el Gestor de Calidad edita o elimina uno, **entonces** la lista se actualiza correctamente y sigue siendo ágil.

Asignado a: [Inserta aquí el Nombre y Apellido]

---

### Historia de Usuario 3 - Panel de inicio con acciones rápidas y estadísticas de registros operativos (Prioridad: P1)

Como Gestor de Calidad, quiero aterrizar en un panel estilo ERP con botones de acción rápida claramente etiquetados para las tareas clave y totales de registros de un vistazo al abrir la aplicación, para poder empezar a trabajar de inmediato.

**Por qué esta prioridad**: El panel es el punto de entrada de la aplicación. Nada más puede alcanzarse sin él, y las acciones rápidas son la ruta más rápida hacia cada flujo de trabajo central de Gestión de Calidad.

**Prueba Independiente**: Un Gestor de Calidad abre la aplicación, ve un panel con múltiples botones de acción rápida y estadísticas de registros, inicia un nuevo Lote/Producto/Área/Empleado o un nuevo registro operativo (Inspección de Calidad, No Conformidad NCR o Acción CAPA) con un solo clic y ve estadísticas que reflejan los datos almacenados.

**Escenarios de Aceptación**:

1. **Dado** que el Gestor de Calidad abre la aplicación, **cuando** la aplicación carga, **entonces** se muestra el panel de inicio con al menos cuatro botones de acción rápida claramente etiquetados que cubren las tareas ERP clave: crear un nuevo registro maestro (Lote, Producto, Área Organizativa o Empleado), crear una nueva Inspección de Calidad, No Conformidad (NCR) o Acción CAPA, abrir la gestión de Lotes/Productos/Áreas/Empleados y buscar registros.
2. **Dado** que se muestra el panel, **cuando** el Gestor de Calidad activa la acción de nuevo registro maestro (Lote, Producto, Área Organizativa o Empleado), **entonces** la aplicación abre el área de gestión correspondiente con un formulario vacío listo para introducir datos.
3. **Dado** que se muestra el panel, **cuando** el Gestor de Calidad activa la acción de nueva Inspección de Calidad, No Conformidad (NCR) o Acción CAPA, **entonces** la aplicación abre el área de gestión de registros operativos con un formulario vacío listo para introducir datos.
4. **Dado** que se muestra el panel, **cuando** el Gestor de Calidad activa la acción de buscar registros, **entonces** la aplicación abre la pantalla de búsqueda con el campo de búsqueda enfocado.
5. **Dados** datos maestros (Lote, Producto, Área Organizativa, Empleado) y registros operativos (Inspección de Calidad, No Conformidad NCR, Acción CAPA) almacenados, **cuando** el Gestor de Calidad ve el panel, **entonces** las tarjetas de estadísticas muestran el recuento actual de datos maestros y registros operativos.
6. **Dado** que el Gestor de Calidad crea o elimina registros en otra parte de la aplicación, **cuando** vuelve al panel, **entonces** las estadísticas reflejan el cambio.

Asignado a: [Inserta aquí el Nombre y Apellido]

---

### Historia de Usuario 4 - Gestionar datos maestros y registros operativos en una pantalla dedicada (Prioridad: P1)

Como Gestor de Calidad, quiero una pantalla dedicada donde pueda añadir, editar y eliminar datos maestros (Lote, Producto, Área Organizativa o Empleado) y sus registros operativos (Inspección de Calidad, No Conformidad NCR o Acción CAPA), para poder gestionar los datos del módulo en un lugar enfocado.

**Por qué esta prioridad**: Esto preserva el valor central de las capacidades de gestión del módulo, presentado como una única pantalla de gestión accesible desde la barra lateral y las acciones rápidas del panel.

**Prueba Independiente**: Un Gestor de Calidad puede navegar a la pantalla de gestión mediante la barra lateral o una acción rápida, alternar entre la gestión de datos maestros (Lote, Producto, Área Organizativa, Empleado) y registros operativos (Inspección de Calidad, NCR, CAPA), y volver al panel, añadiendo, editando y eliminando con éxito un registro maestro y un registro operativo.

**Escenarios de Aceptación**:

1. **Dado** que el Gestor de Calidad está en la pantalla de gestión, **cuando** mira la navegación, **entonces** la barra lateral del espacio de trabajo ofrece botones de módulo para Datos Maestros (Lote/Producto/Área/Empleado), Registros Operativos (Inspección/NCR/CAPA) y Panel con el módulo activo resaltado.
2. **Dada** la barra lateral visible, **cuando** el Gestor de Calidad activa el botón de Datos Maestros (Lote/Producto/Área/Empleado), **entonces** se muestra el contenido de gestión de datos maestros.
3. **Dada** la barra lateral visible, **cuando** el Gestor de Calidad activa el botón de Registros Operativos (Inspección/NCR/CAPA), **entonces** se muestra el contenido de gestión de registros operativos.
4. **Dado** que el Gestor de Calidad está en la pantalla de gestión, **cuando** mira la pantalla, **entonces** la lista de datos maestros no se muestra.
5. **Dado** que el Gestor de Calidad está en la pantalla de gestión, **cuando** crea un nuevo registro maestro (Lote, Producto, Área Organizativa o Empleado), **entonces** el registro se guarda.
6. **Dado** un registro maestro (Lote, Producto, Área Organizativa o Empleado) existente, **cuando** el Gestor de Calidad edita sus detalles, **entonces** la información actualizada se guarda.
7. **Dado** un registro maestro (Lote, Producto, Área Organizativa o Empleado) que ya no es relevante, **cuando** el Gestor de Calidad lo elimina, **entonces** se elimina junto con sus registros operativos (Inspecciones de Calidad, No Conformidades NCR, Acciones CAPA) asociados.
8. **Dado** un registro maestro (Lote, Producto, Área Organizativa o Empleado) existente, **cuando** el Gestor de Calidad añade, edita o elimina una Inspección de Calidad, No Conformidad (NCR) o Acción CAPA, **entonces** los cambios del registro operativo se guardan y quedan asociados a ese registro maestro.
9. **Dado** que el Gestor de Calidad está en la pantalla de gestión, **cuando** activa el botón Panel en la barra lateral, **entonces** vuelve al panel de inicio.

Asignado a: [Inserta aquí el Nombre y Apellido]

---

### Historia de Usuario 5 - Definir un perfil de configuración del módulo (Prioridad: P1)

Como Gestor de Calidad, quiero declarar un único archivo de configuración que defina la identidad, terminología, campos personalizados y reglas de mi módulo, para adaptar el módulo base en un módulo específico de Gestión de Calidad sin modificar su código central.

**Por qué esta prioridad**: La adaptación mediante configuración es lo que convierte este proyecto de una aplicación fija en una base reutilizable. Sin ella, cada módulo personalizado requeriría editar archivos fuente centrales, lo que frustra el propósito de la plantilla; todas las historias de personalización posteriores dependen de que este mecanismo exista primero.

**Prueba Independiente**: Un Gestor de Calidad proporciona un archivo de configuración que define un perfil de Gestión de Calidad (nombre del módulo, mapeos Datos Maestros→Lote/Producto/Área/Empleado, campos personalizados, ciclo de vida), y la aplicación se presenta plenamente como un módulo de Gestión de Calidad; al quitar el archivo se restauran los valores predeterminados de la base sin errores.

**Escenarios de Aceptación**:

1. **Dado** que un archivo de configuración define el nombre del módulo, **cuando** la aplicación carga, **entonces** el panel de inicio y el marco del espacio de trabajo muestran el nombre configurado.
2. **Dada** una configuración completa (nombre, mapeos de términos, campos personalizados, ciclo de vida), **cuando** la aplicación carga, **entonces** el módulo se presenta plenamente bajo la identidad configurada sin que se vean términos del módulo base genérico en ningún sitio.
3. **Dado** que no se proporciona configuración, **cuando** la aplicación carga, **entonces** la aplicación retrocede a los valores predeterminados integrados de datos maestros (Lote, Producto, Área Organizativa, Empleado) y registros operativos (Inspección de Calidad, NCR, CAPA) sin errores.
4. **Dada** una configuración con valores inválidos o conflictivos, **cuando** la aplicación carga, **entonces** el sistema informa del problema con claridad en lugar de fallar silenciosamente.

Asignado a: [Josefa Guzmán]

---

### Historia de Usuario 6 - Reetiquetar pantallas desde la configuración (Prioridad: P1)

Como Gestor de Calidad, quiero que todas las etiquetas visibles para el usuario deriven de la configuración, para que un módulo adaptado hable su idioma de dominio de Gestión de Calidad de forma consistente en todo momento.

**Por qué esta prioridad**: Los usuarios confían en un módulo que dice consistentemente "Lote" y "No Conformidad (NCR)" en lugar de dejar filtrarse una "Entidad" genérica por media interfaz; la terminología inconsistente hace que los módulos adaptados parezcan rotos. Esta historia depende del perfil de configuración (Historia de Usuario 5).

**Prueba Independiente**: Un Gestor de Calidad mapea Datos Maestros→Lote/Producto/Área/Empleado y Registros Operativos→Inspección de Calidad/NCR/Acción CAPA en la configuración, y cada pestaña, botón, etiqueta de formulario, encabezado y mensaje en las tres pantallas usa los términos mapeados.

**Escenarios de Aceptación**:

1. **Dados** mapeos de términos definidos en la configuración, **cuando** cualquier pantalla carga, **entonces** pestañas, botones, etiquetas de formulario, encabezados y mensajes de estado vacío muestran los términos configurados.
2. **Dado** que las etiquetas han sido remapeadas, **cuando** el Inspector de Planta navega entre pantallas, **entonces** el comportamiento de navegación no cambia.
3. **Dado** que no se proporcionan mapeos, **cuando** cualquier pantalla carga, **entonces** se muestran los términos predeterminados de datos maestros (Lote, Producto, Área Organizativa, Empleado) y registros operativos (Inspección de Calidad, NCR, CAPA).

Asignado a: [Josefa Guzmán]

---

### Historia de Usuario 7 - Declarar campos personalizados de gobernanza, trazabilidad y control de calidad empresarial (Prioridad: P1)

Como Gestor de Calidad, quiero declarar campos adicionales de gobernanza de datos para Lotes, Productos, Áreas Organizativas o Empleados y para Inspecciones de Calidad, No Conformidades (NCR) o Acciones CAPA en la configuración, para que el módulo capture atributos de trazabilidad, origen, temporalidad, métricas cuantitativas de fallas, severidad y disposición final de forma consistente en formularios, listas, validación y búsqueda, sin escribir código de interfaz.

**Por qué esta prioridad**: Los módulos de Gestión de Calidad existen porque sus registros deben sostener auditorías y decisiones directivas, no solo almacenar datos. La gobernanza de datos exige atributos de trazabilidad del lote y su origen, métricas objetivas de fallas y un dictamen final auditable; si estos campos se añaden a mano en cada formulario, la adaptación es propensa a errores, pierde control y no escala. Esta historia depende del perfil de configuración (Historia de Usuario 5).

**Prueba Independiente**: Un Gestor de Calidad declara campos personalizados de trazabilidad para Lotes/Productos (parámetros de lote, origen/proveedor y temporalidad del proceso) y de control para Inspecciones/NCR (métricas cuantitativas de fallas, impacto/severidad y dictamen final), incluyendo al menos uno obligatorio y numérico; los campos se muestran con el tipo de entrada correspondiente, los obligatorios incompletos bloquean el guardado con una alerta de validación comprensible, y los valores guardados quedan visibles y consultables en listas y búsquedas.

**Escenarios de Aceptación**:

1. **Dados** campos personalizados de trazabilidad y gobernanza de origen declarados para Lotes o Productos (por ejemplo, parámetros de lote, origen/proveedor y temporalidad del proceso), **cuando** el Gestor de Calidad crea o edita un Lote o Producto, **entonces** el sistema muestra esos campos en el formulario con el tipo de entrada declarado (texto, número, fecha o selección) y los guarda como parte del registro maestro.
2. **Dados** campos personalizados de control de calidad declarados para Inspecciones de Calidad o NCR (por ejemplo, métricas cuantitativas de fallas, clasificación de impacto/severidad operativa y dictamen o disposición final: aprobación, retrabajo o descarte), **cuando** el Gestor de Calidad crea o edita una Inspección o NCR, **entonces** el sistema muestra esos campos en el formulario con el tipo de entrada declarado y los guarda asociados al registro operativo.
3. **Dado** que un campo personalizado está declarado como obligatorio y el usuario lo deja incompleto, **cuando** intenta guardar un registro maestro u operativo, **entonces** el sistema bloquea el guardado y despliega una alerta de validación comprensible que identifica el campo y el valor requerido, conforme a FR-026 y FR-027.
4. **Dados** campos personalizados con valores guardados, **cuando** el Gestor de Calidad consulta las listas o las vistas de detalle, **entonces** los valores de trazabilidad, origen, temporalidad, métricas de fallas, severidad y dictamen se muestran de forma legible conforme a FR-028.
5. **Dados** campos personalizados declarados y poblados, **cuando** el Gestor de Calidad busca usando un término que coincide con un valor de campo personalizado, **entonces** el sistema devuelve los registros coincidentes y permite consultar esos valores en los resultados, conforme a FR-028.
6. **Dado** que no hay campos personalizados declarados, **cuando** la aplicación se ejecuta, **entonces** el comportamiento es idéntico al del módulo base sin modificar.

Asignado a: [Joaquin Quiñones - Gestor de Calidad]

---

### Historia de Usuario 8 - Buscar y encontrar Lotes, Productos, Áreas Organizativas o Empleados rápidamente (Prioridad: P2)
Como Inspector de Planta, quiero buscar lotes, productos, áreas organizativas y empleados por sus datos identificativos, para encontrar el registro correcto al preparar una inspección y consultar los elementos y responsables relacionados con el control de calidad.

**Por qué esta prioridad**: La recuperación rápida mejora la utilidad cuando el conjunto de datos de calidad crece más allá de un pequeño número de entradas.

**Prueba Independiente**: Un Inspector de Planta puede introducir un término de búsqueda y ver solo los Lotes, Productos, Áreas Organizativas o Empleados coincidentes.

**Escenarios de Aceptación**:

1. **Dado** que el Inspector de Planta necesita localizar un lote, producto, área organizativa o empleado para preparar una inspección, **cuando** busca por nombre, código u otro dato descriptivo, **entonces** el sistema muestra los registros que coinciden y su información identificativa para que pueda reconocer el correcto.
2. **Dado** que el Inspector de Planta busca un registro y no hay coincidencias, **cuando** se muestran los resultados, **entonces** el sistema indica que no encontró registros y permite modificar o borrar la búsqueda para intentarlo de nuevo.
3. **Dado** que hay cientos de lotes, productos, áreas organizativas o empleados registrados, **cuando** el Inspector de Planta realiza una búsqueda por un dato identificativo, **entonces** los resultados relevantes aparecen con rapidez para no interrumpir su trabajo.

Asignado a: [José Mondaca]

---

### Historia de Usuario 9 - Registrar una fecha objetivo (Prioridad: P2)
Como Inspector de Planta, quiero adjuntar una fecha objetivo opcional a un Lote, Producto, Área Organizativa o Empleado para planificar y ordenar los registros según cuándo vence una inspección o acción.

**Por qué esta prioridad**: La planificación consciente de fechas mejora el valor central cuando el conjunto de datos crece, pero no es necesaria para la gestión básica.

**Prueba Independiente**: Un Inspector de Planta puede fijar una fecha en un Lote, Producto, Área Organizativa o Empleado y verla mostrada en la lista.

**Escenarios de Aceptación**:

1. **Dado** que un Inspector de Planta está creando o editando un Lote, Producto, Área Organizativa o Empleado, **cuando** introduce una fecha objetivo, **entonces** la fecha se guarda y se muestra en la lista.
2. **Dado** un Lote, Producto, Área Organizativa o Empleado con fecha fijada, **cuando** el Inspector de Planta ve la lista, **entonces** los registros maestros con fechas pueden identificarse de un vistazo.
3. **Dado** que un Inspector de Planta deja la fecha en blanco, **cuando** guarda el registro maestro, **entonces** este igualmente se guarda sin fecha (campo opcional).

Asignado a: [Andrea Vergara]

---

### Historia de Usuario 10 - Registrar los detalles de registros operativos (Inspección de Calidad, No Conformidad NCR, Acción CAPA) de un registro maestro (Prioridad: P2)
Como Inspector de Planta, quiero registrar detalles de Inspección de Calidad, No Conformidad (NCR) o Acción CAPA para un Lote, Producto, Área Organizativa o Empleado, para mantener la actividad de control de calidad organizada junto a cada registro de datos maestros.

**Por qué esta prioridad**: Los registros operativos aportan valor operativo práctico una vez que los Lotes, Productos, Áreas Organizativas y Empleados están gestionados, pero no son necesarios para la gestión central.

**Prueba Independiente**: Un Inspector de Planta puede añadir una Inspección de Calidad, No Conformidad (NCR) o Acción CAPA a un Lote, Producto, Área Organizativa o Empleado y ver los detalles del registro operativo mostrados junto a ese registro maestro.

**Escenarios de Aceptación**:

1. **Dado** un Lote, Producto, Área Organizativa o Empleado en la lista, **cuando** el Inspector de Planta añade una Inspección de Calidad, No Conformidad (NCR) o Acción CAPA con detalles, **entonces** el registro operativo se guarda y queda asociado a ese registro maestro.
2. **Dado** un registro operativo (Inspección de Calidad, NCR, CAPA) existente para un Lote, Producto, Área Organizativa o Empleado, **cuando** el Inspector de Planta selecciona ese registro maestro en la pantalla de gestión, **entonces** los detalles del registro operativo se muestran en la vista de gestión correspondiente.
3. **Dado** un Lote, Producto, Área Organizativa o Empleado eliminado, **cuando** se confirma la eliminación, **entonces** sus registros operativos (Inspecciones de Calidad, NCR, Acciones CAPA) asociados también se eliminan.
4. **Dado** que un Inspector de Planta está creando una Inspección de Calidad, No Conformidad (NCR) o Acción CAPA, **cuando** deja la información obligatoria en blanco, **entonces** el sistema impide guardar y explica qué se necesita.

Asignado a: [Joaquin Quilodran]

---

### Historia de Usuario 11 - Estación dedicada de consulta, auditoría y trazabilidad integral para el Gestor de Calidad (Prioridad: P2)

Como Gestor de Calidad, quiero una pantalla dedicada de consulta, auditoría y trazabilidad integral, separada del flujo transaccional de registro, para localizar ágilmente los registros maestros por identificadores clave y por los campos personalizados definidos en la Historia de Usuario 7, revisar su información en tablas de resumen legibles y auditar su estado sin interferir con la creación o edición de registros.

**Por qué esta prioridad**: La supervisión directiva y la auditoría requieren una vista de consulta independiente del flujo de captura, donde el Gestor de Calidad pueda rastrear lotes, productos, áreas y empleados por sus datos clave y por atributos de gobernanza (parámetros de lote, origen/proveedor y temporalidad del proceso). Una pantalla separada mantiene enfocada la experiencia transaccional y evita mezclar la auditoría con la edición; aunque no es necesaria para la gestión básica, aporta valor cuando el volumen y las exigencias de trazabilidad crecen.

**Prueba Independiente**: Un Gestor de Calidad puede abrir la pantalla de consulta desde la barra lateral o una acción rápida, buscar por un identificador clave o por un valor de campo personalizado declarado en la Historia de Usuario 7, ver únicamente los registros maestros coincidentes en tablas de resumen legibles y obtener un estado vacío claro cuando no hay coincidencias.

**Escenarios de Aceptación**:

1. **Dado** que el Gestor de Calidad está en la pantalla dedicada de consulta, **cuando** introduce un identificador clave (por ejemplo, nombre, código, número de lote o número de nómina), **entonces** el sistema muestra únicamente los registros maestros coincidentes en tablas de resumen legibles, conforme a FR-019 y FR-020.
2. **Dados** los campos personalizados declarados en la Historia de Usuario 7 y poblados en los registros maestros, **cuando** el Gestor de Calidad realiza una consulta por un valor de campo personalizado (por ejemplo, parámetros de lote, origen/proveedor o temporalidad del proceso), **entonces** el sistema devuelve los registros maestros coincidentes y muestra esos valores de forma legible en las tablas de resumen, conforme a FR-028.
3. **Dada** una consulta sin coincidencias, **cuando** el Gestor de Calidad la envía, **entonces** el sistema muestra un estado vacío claro que explica que no hay resultados y permite modificar o borrar la consulta para intentarlo de nuevo.
4. **Dados** al menos 500 registros maestros almacenados, **cuando** el Gestor de Calidad consulta desde la pantalla dedicada, **entonces** los resultados aparecen con prontitud y las tablas de resumen mantienen legibilidad y orden, conforme a FR-032.
5. **Dado** que el Gestor de Calidad está en la pantalla dedicada de consulta, **cuando** revisa los resultados, **entonces** puede auditar y rastrear la información de los registros maestros sin habilitar la edición transaccional, que permanece en la pantalla de gestión.
6. **Dado** que el Gestor de Calidad está en la pantalla dedicada de consulta, **cuando** activa el botón Panel en la barra lateral, **entonces** vuelve al panel de inicio.

Asignado a: [Joaquin Quiñones - Gestor de Calidad]

---

### Historia de Usuario 12 - Configurar el ciclo de vida de estados de registros operativos (Inspección de Calidad, NCR, CAPA) (Prioridad: P2)

Como Gestor de Calidad, quiero definir los estados permitidos de las Inspecciones de Calidad, No Conformidades (NCR) o Acciones CAPA y las transiciones permitidas, para que los registros operativos sigan el ciclo de vida de Gestión de Calidad en lugar de aceptar texto de estado arbitrario.

**Por qué esta prioridad**: Los procesos de calidad reales necesitan ciclos de vida controlados (p. ej., Registrada → En Análisis → Cerrada), pero el estado de texto libre sigue siendo aceptable para extensiones simples, así que esto mejora la base sin ser necesario para la adaptación básica. Esta historia depende del perfil de configuración (Historia de Usuario 5).

**Prueba Independiente**: Un Gestor de Calidad configura un ciclo de vida Registrada → En Análisis → Cerrada; el control de estado ofrece solo estados siguientes válidos, las transiciones inválidas se rechazan con una explicación, y el estado es visible de un vistazo en las listas.

**Escenarios de Aceptación**:

1. **Dado** un ciclo de vida configurado, **cuando** el Inspector de Planta edita el estado de una Inspección de Calidad, No Conformidad (NCR) o Acción CAPA, **entonces** solo se ofrecen los estados alcanzables mediante transiciones permitidas.
2. **Dado** que se intenta una transición inválida por cualquier vía, **cuando** se envía, **entonces** el sistema la rechaza con una explicación clara.
3. **Dado** un ciclo de vida configurado, **cuando** el Inspector de Planta ve listas o detalles de registros operativos, **entonces** el estado actual es identificable de un vistazo.
4. **Dado** que no hay ciclo de vida configurado, **cuando** se editan Inspecciones de Calidad, NCRs o Acciones CAPA, **entonces** el estado permanece como texto libre igual que en el módulo base sin modificar.

Asignado a: [Martina Cuevas]

---

### Historia de Usuario 13 - Marco de espacio de trabajo ERP con marca (Prioridad: P1)

Como Gestor de Calidad, quiero un espacio de trabajo estilo ERP consistente, con una barra superior con marca y una barra lateral de módulos presentes en cada pantalla, para que la aplicación se sienta como un sistema de Gestión de Calidad empresarial coherente en lugar de páginas sueltas.

**Por qué esta prioridad**: El marco aporta la marca y la navegación de todas las demás pantallas; construirlo como envoltorio evita tocar cada historia por separado y da al módulo su identidad ERP de Calidad. Depende del perfil de configuración (Historia de Usuario 5) para el nombre del módulo y la terminología, y reestructura la navegación antes proporcionada por los botones de bienvenida y las pestañas de gestión (Historias de Usuario 3 y 4).

**Prueba Independiente**: En cada pantalla, una barra superior muestra un logotipo derivado del nombre del módulo de Gestión de Calidad junto al nombre del módulo, una barra lateral ofrece botones de módulo para Panel, Datos Maestros (Lote/Producto/Área/Empleado), Registros Operativos (Inspección/NCR/CAPA) y Buscar con el módulo activo resaltado visualmente, y navegar entre módulos nunca pierde datos.

**Escenarios de Aceptación**:

1. **Dada** cualquier pantalla mostrada, **cuando** el Gestor de Calidad mira la página, **entonces** es visible una barra superior que contiene un logotipo SVG en línea derivado del nombre del módulo y el nombre del módulo configurado.
2. **Dada** cualquier pantalla mostrada, **cuando** el Gestor de Calidad mira la barra lateral, **entonces** se muestran botones de módulo para Panel, Datos Maestros (Lote, Producto, Área Organizativa, Empleado), Registros Operativos (Inspección de Calidad, NCR, CAPA) y Buscar usando la terminología configurada.
3. **Dado** que el Gestor de Calidad está en cualquier pantalla, **cuando** mira la barra lateral, **entonces** el botón del módulo activo está resaltado visualmente.
4. **Dado** que la ventana gráfica es estrecha, **cuando** se usa la aplicación en una pantalla pequeña, **entonces** la barra lateral se contrae a una columna de iconos manteniéndose utilizable y etiquetada de forma accesible.
5. **Dada** una configuración que define un color de acento, **cuando** cualquier pantalla carga, **entonces** el marco lo usa consistentemente para resaltados y controles principales; sin valor configurado o con un valor inválido, se usan los valores predeterminados integrados sin errores.
6. **Dado** que el Gestor de Calidad navega entre módulos mediante la barra lateral, **cuando** inspecciona sus datos después, **entonces** todos los Lotes, Productos, Áreas Organizativas, Empleados e Inspecciones de Calidad, NCRs y Acciones CAPA almacenados permanecen intactos.

Asignado a: [Martina Cuevas]

---

### Casos Límite

- ¿Qué ocurre cuando un Inspector de Planta intenta guardar un Lote, Producto, Área Organizativa o Empleado sin nombre o código obligatorio?
- ¿Cómo gestiona el sistema una búsqueda que no devuelve coincidencias?
- ¿Qué ocurre si un Inspector de Planta intenta editar o eliminar un Lote, Producto, Área Organizativa o Empleado que ya no existe?
- ¿Qué ocurre cuando un Inspector de Planta introduce una fecha objetivo que no es una fecha de calendario válida?
- ¿Qué ocurre con las Inspecciones de Calidad, No Conformidades (NCR) y Acciones CAPA de un Lote, Producto, Área Organizativa o Empleado cuando este se elimina?
- ¿Qué ocurre cuando un Inspector de Planta introduce una fecha final anterior a la fecha inicial en una Inspección de Calidad, NCR o Acción CAPA?
- ¿Qué ocurre cuando la configuración declara un campo personalizado cuya clave choca con un nombre de campo base?
- ¿Qué ocurre cuando la configuración referencia un tipo de campo desconocido o una definición de transición de ciclo de vida inválida?
- ¿Qué ocurre cuando los registros almacenados contienen valores de campos personalizados que ya no están declarados en la configuración?
- ¿Qué ocurre cuando un Gestor de Calidad abre la aplicación directamente en la pantalla de gestión o búsqueda (p. ej., vía enlace profundo o recarga del navegador) sin pasar por el panel de inicio?
- ¿Qué ocurre cuando un Gestor de Calidad pulsa el botón atrás del navegador estando en la pantalla de gestión o búsqueda?
- ¿Qué ocurre si un Gestor de Calidad navega fuera de la pantalla de gestión mientras un formulario aún tiene cambios sin guardar?
- ¿Permanecen intactos los Lotes, Productos, Áreas Organizativas, Empleados y las Inspecciones de Calidad, NCRs o Acciones CAPA al navegar entre el panel, la gestión y la búsqueda?
- ¿Qué ocurre cuando el panel se abre con cero registros maestros (Lote/Producto/Área/Empleado) o cero registros operativos (Inspección/NCR/CAPA) (valores estadísticos)?
- ¿Qué ocurre cuando el color de acento configurado no es un valor de color válido?
- ¿Cómo mantiene la barra lateral contraída las etiquetas de módulo accesibles en ventanas gráficas estrechas?

## Requisitos *(obligatorio)*

### Requisitos Funcionales

- **FR-001**: El sistema DEBE permitir a los usuarios crear un registro maestro (Lote, Producto, Área Organizativa o Empleado) con al menos un nombre y un código.
- **FR-002**: El sistema DEBE permitir a los usuarios editar los detalles de un registro maestro (Lote, Producto, Área Organizativa o Empleado) existente.
- **FR-003**: El sistema DEBE permitir a los usuarios eliminar un registro maestro (Lote, Producto, Área Organizativa o Empleado) existente.
- **FR-004**: El sistema DEBE permitir a los usuarios buscar registros maestros (Lote, Producto, Área Organizativa o Empleado) por nombre, código, categoría u otras palabras clave descriptivas.
- **FR-005**: El sistema DEBE mostrar una lista clara de Lotes, Productos, Áreas Organizativas y Empleados e indicar cuándo ningún resultado coincide con una búsqueda.
- **FR-006**: El sistema DEBE presentar retroalimentación clara cuando falta información obligatoria o no se puede completar una acción.
- **FR-007**: El sistema DEBE mantener los datos maestros (Lote, Producto, Área Organizativa, Empleado) consistentes tras operaciones de creación, edición y eliminación.
- **FR-008**: El sistema DEBE permitir a los usuarios añadir, editar y eliminar detalles de registros operativos (Inspección de Calidad, No Conformidad NCR, Acción CAPA) de un Lote, Producto, Área Organizativa o Empleado.
- **FR-009**: El sistema DEBE asociar cada registro operativo (Inspección de Calidad, NCR, CAPA) exactamente a un Lote, Producto, Área Organizativa o Empleado y eliminar los registros operativos asociados cuando el registro maestro se elimina.
- **FR-010**: El sistema DEBE mostrar un panel de inicio como vista inicial, con botones de acción rápida claramente etiquetados para las tareas ERP de Gestión de Calidad clave.
- **FR-011**: El sistema DEBE envolver cada pantalla en un marco de espacio de trabajo persistente compuesto por una barra superior con marca y una barra lateral de navegación de módulos.
- **FR-012**: La barra lateral DEBE proporcionar botones de módulo para Panel, Datos Maestros (Lote/Producto/Área/Empleado), Registros Operativos (Inspección/NCR/CAPA) y Buscar, etiquetados desde la configuración del módulo.
- **FR-013**: El botón de módulo de Datos Maestros DEBE mostrar el contenido de gestión de Lotes, Productos, Áreas Organizativas y Empleados.
- **FR-014**: El botón de módulo de Registros Operativos DEBE mostrar el contenido de gestión de Inspecciones de Calidad, No Conformidades (NCR) y Acciones CAPA en la pantalla de gestión.
- **FR-015**: El botón de módulo Panel DEBE devolver al usuario al panel de inicio.
- **FR-016**: La pantalla de gestión NO DEBE mostrar la lista de Lotes, Productos, Áreas Organizativas o Empleados.
- **FR-017**: La pantalla de gestión DEBE proporcionar la funcionalidad de crear, editar y eliminar datos maestros (Lote, Producto, Área Organizativa, Empleado).
- **FR-018**: La pantalla de gestión DEBE proporcionar la funcionalidad de crear, editar y eliminar registros operativos (Inspección de Calidad, No Conformidad NCR, Acción CAPA).
- **FR-019**: El sistema DEBE navegar a una pantalla de búsqueda dedicada cuando se selecciona el botón Buscar en la barra lateral.
- **FR-020**: La pantalla de búsqueda DEBE permitir buscar Lotes, Productos, Áreas Organizativas o Empleados por nombre, código, categoría, descripción, fecha objetivo y por los valores de los campos personalizados declarados en la configuración (conforme a FR-028).
- **FR-021**: La pantalla de búsqueda DEBE ser accesible tanto desde la barra lateral como desde la acción rápida de buscar registros del panel.
- **FR-022**: El sistema DEBE mantener los datos maestros (Lote, Producto, Área Organizativa, Empleado) y registros operativos (Inspección de Calidad, NCR, CAPA) intactos y consistentes durante la navegación entre pantallas.
- **FR-023**: El sistema DEBE cargar la configuración del módulo al arrancar y aplicarla en todas las pantallas.
- **FR-024**: El sistema DEBE retroceder a los valores predeterminados integrados (terminología Lote/Producto/Área/Empleado e Inspección/NCR/CAPA, sin campos personalizados, sin ciclo de vida) cuando no se proporciona configuración.
- **FR-025**: El sistema DEBE informar claramente de una configuración inválida o conflictiva en lugar de fallar silenciosamente.
- **FR-026**: El sistema DEBE mostrar los campos personalizados declarados en los formularios de creación/edición con tipos de entrada que coincidan con sus tipos declarados.
- **FR-027**: El sistema DEBE validar los valores de campos personalizados, incluidos los obligatorios, antes de guardar, usando la misma experiencia de retroalimentación que la validación base.
- **FR-028**: El sistema DEBE incluir los valores de campos personalizados en los resultados de búsqueda y mostrarlos en listas y vistas de detalle.
- **FR-029**: El sistema DEBE derivar todas las etiquetas visibles para el usuario de la configuración del módulo en lugar de texto fijo en el código.
- **FR-030**: El sistema DEBE aplicar las transiciones de estado configuradas en las Inspecciones de Calidad, No Conformidades (NCR) y Acciones CAPA independientemente de cómo se envíe un cambio.
- **FR-031**: El sistema DEBE mantener el estado del registro operativo (Inspección/NCR/CAPA) como texto libre cuando no hay ciclo de vida configurado.
- **FR-032**: El sistema DEBE mantener el renderizado de listas y la búsqueda ágiles y correctos para conjuntos de datos de al menos 500 registros de Lotes, Productos, Áreas Organizativas o Empleados.
- **FR-033**: El panel DEBE ofrecer al menos cuatro botones de acción rápida: nuevo Lote/Producto/Área/Empleado, nueva Inspección/NCR/CAPA, abrir gestión de datos maestros y buscar registros.
- **FR-034**: Activar la acción rápida de nuevo registro maestro (Lote/Producto/Área/Empleado) o nuevo registro operativo (Inspección/NCR/CAPA) DEBE abrir el área de gestión correspondiente con un formulario vacío listo para introducir datos.
- **FR-035**: El panel DEBE mostrar tarjetas de estadísticas con el número de Lotes, Productos, Áreas Organizativas o Empleados y registros operativos (Inspecciones de Calidad, NCR, CAPA) almacenados, actualizadas cada vez que se muestra el panel.
- **FR-036**: La barra superior DEBE mostrar un logotipo derivado del nombre del módulo junto con el nombre del módulo configurado en cada pantalla.
- **FR-037**: La barra lateral DEBE resaltar visualmente el módulo activo en cada pantalla.
- **FR-038**: La configuración PUEDE definir un color de acento; el sistema DEBE aplicarlo consistentemente en todo el marco y retroceder de forma segura a los valores integrados cuando esté ausente o sea inválido.
- **FR-039**: En ventanas gráficas estrechas, la barra lateral DEBE contraerse a una columna de iconos manteniéndose operable.

### Requisitos de Extensibilidad *(obligaciones del módulo base)*

Los módulos personalizados construidos sobre esta base DEBEN poder:

- **XR-001**: Extender los Lotes, Productos, Áreas Organizativas, Empleados e Inspecciones de Calidad, NCRs y Acciones CAPA con campos adicionales específicos del dominio de calidad sin cambiar la estructura de almacenamiento base.
- **XR-002**: Reetiquetar pantallas, pestañas, formularios y listas con terminología específica del módulo de Gestión de Calidad sin alterar el comportamiento de navegación.
- **XR-003**: Añadir reglas de validación específicas del módulo de calidad junto a las reglas de validación base.
- **XR-004**: Apoyarse en el módulo base para generación de identidad, marcas de tiempo, integridad referencial entre datos maestros (Lote, Producto, Área, Empleado) y registros operativos (Inspección, NCR, CAPA), y eliminación en cascada.
- **XR-005**: Remarcar el espacio de trabajo —nombre del módulo, logotipo derivado y color de acento— únicamente mediante configuración.

### Entidades Clave *(incluir si la funcionalidad implica datos)*

- **Lote, Producto, Área Organizativa o Empleado (Datos Maestros)**: Un registro de datos maestros gestionado por el módulo de Gestión de Calidad, que incluye su nombre, código de negocio, detalles descriptivos, categoría de clasificación, una fecha objetivo opcional y un entity_id autogenerado. Las entidades maestras incluyen: Área Organizativa (identificador único, código, nombre, módulo), Empleado (identificador único, número de nómina, puesto, área, estado), Producto (identificador único, código, descripción, tipo, unidad de medida), y Lote (identificador único, número de lote, fechas de fabricación/caducidad).
- **Inspección de Calidad, No Conformidad (NCR) o Acción CAPA (Registros Operativos)**: Detalles transaccionales adjuntos a un Lote, Producto, Área Organizativa o Empleado, vinculados por el entity_id correspondiente. Los registros operativos transaccionales incluyen: No Conformidad (NCR - folio, origen, gravedad, estado), Inspección de Calidad (tipo, resultado, fecha), Auditoría (tipo, alcance, objetivo, estado), Hallazgo de Auditoría (tipo, clasificación), Acción CAPA (tipo, causa raíz, metodología, prioridad), Queja de Cliente (clasificación, canal, estado), Evaluación de Proveedor (calidades de calidad, entrega, precio, clasificación), Costo No Calidad (tipo, concepto, monto), Capacitación Calidad (tema, duración, estado), y Movimiento No Conforme (tipo, origen/destino, cantidad).
- **ModuleConfig**: El objeto de adaptación cargado al arrancar que define el nombre del módulo, las etiquetas de terminología, las definiciones de campos personalizados y el ciclo de vida de estados de registros operativos. Consulte modelo_entidad_relacion_gestion_calidad.md para su forma completa.

## Criterios de Éxito *(obligatorio)*

### Resultados Medibles

- **SC-001**: Los usuarios pueden crear un nuevo Lote, Producto, Área Organizativa o Empleado y verlo en la lista en menos de 2 minutos.
- **SC-002**: Los usuarios pueden encontrar un Lote, Producto, Área Organizativa o Empleado existente mediante la búsqueda en menos de 10 segundos tras introducir un término relevante.
- **SC-003**: Al menos el 90% de los usuarios de prueba pueden completar tareas de crear, editar, eliminar y buscar sin ayuda.
- **SC-004**: El sistema sigue siendo utilizable para un conjunto de datos de al menos 500 registros de datos maestros sin pérdida de funcionalidad central.
- **SC-005**: Un usuario puede alcanzar las pantallas de gestión y búsqueda desde el panel o la barra lateral en menos de 10 segundos en el primer uso.
- **SC-006**: Toda la funcionalidad existente de gestión de Lotes/Productos/Áreas/Empleados y registros operativos (Inspección/NCR/CAPA) sigue operativa tras el rediseño del marco ERP y el panel (sin regresiones).
- **SC-007**: Los usuarios pueden navegar entre las pantallas de panel, gestión y búsqueda sin perder ningún Lote, Producto, Área Organizativa, Empleado ni registro operativo almacenado.
- **SC-008**: Un desarrollador puede producir un módulo adaptado usando solo el archivo de configuración, con cero modificaciones en archivos fuente centrales.
- **SC-009**: Cada pantalla presenta el mismo marco con marca, y los usuarios pueden identificar en qué módulo están de un vistazo.
- **SC-010**: Las estadísticas de registros mostradas en el panel siempre coinciden con el número de Lotes, Productos, Áreas Organizativas, Empleados y registros operativos almacenados.

## Suposiciones

- El módulo base gestiona datos para un único espacio de trabajo en lugar de una base de datos multiinquilino compartida.
- La adaptación a un módulo específico de Gestión de Calidad se realiza mediante un archivo de configuración del módulo en lugar de editando archivos fuente centrales.
- Cada registro maestro (Lote, Producto, Área Organizativa, Empleado) incluye información básica suficiente para identificación y seguimiento; los módulos personalizados aportan los campos específicos del dominio.
- La versión inicial se centra en la gestión central de datos maestros y registros operativos en lugar de capacidades ERP avanzadas como flujos de aprobación, períodos de contabilización o informes.
- La búsqueda se realiza sobre los Lotes, Productos, Áreas Organizativas o Empleados almacenados, incluidos los valores de los campos personalizados de gobernanza y trazabilidad declarados en la configuración (Historia de Usuario 7).
- La pantalla de gestión consolida los formularios de añadir/editar Lote, Producto, Área Organizativa o Empleado y añadir/editar Inspección de Calidad, NCR o Acción CAPA en una sola pantalla de gestión.
- La navegación entre áreas ocurre mediante una barra lateral persistente; la pantalla de gestión aloja ambos paneles de gestión y no muestra la lista de datos maestros.
- El logotipo se genera como un monograma SVG en línea derivado del nombre del módulo; no se requieren recursos de imagen externos.
- Se puede configurar un color de acento opcional para la marca; el resto de la paleta base permanece fija.
- Solo se muestra una pantalla a la vez; no hay diseño lado a lado del contenido de gestión y búsqueda.
- La navegación entre pantallas se maneja dentro de la aplicación (p. ej., cambio de vistas), y el botón atrás del navegador debe comportarse de forma predecible.
- Los datos siguen persistiéndose en el localStorage del navegador y no se ven afectados por la navegación entre pantallas.
- La pantalla de búsqueda es una estación de consulta, auditoría y trazabilidad enfocada en encontrar y ver Lotes, Productos, Áreas Organizativas o Empleados, incluidos sus campos personalizados; la edición permanece en la pantalla de gestión y fuera del flujo transaccional de consulta.
- El contenido del usuario introducido por el usuario (nombres, descripciones, notas de Inspecciones/NCR/CAPA) DEBE sanitizarse antes de renderizarse en el DOM para prevenir ataques de inyección de scripts (XSS). El módulo base DEBE escapar HTML y atributos de eventos al mostrar datos de localStorage.
