# Gestión de Calidad — especificación revisada

**Revisión:** 26/11/2026. **Estado:** borrador asistido para validación del grupo.

## Caso de trabajo

Una planta simulada fabrica envases, tapas y piezas. El equipo registra productos y lotes, define mediciones de control, inspecciona, identifica no conformidades y sigue acciones correctivas. Todos los nombres y límites de ejemplo son ficticios. Los roles funcionales no atribuyen autoría académica a personas inventadas.

Esta revisión incorpora los 18 puntos del ayudante. Conserva la numeración histórica: HU9 y HU12 se consolidan en HU7; no se eliminan datos ni se duplican tareas de esas reglas. La versión anterior queda en `docs/historial/spec-antes-26-11-2026.md`.

## Historias y criterios de aceptación

### Historia de Usuario 1 - Registrar productos, lotes, áreas y empleados (Prioridad: P1)

**Perfil:** Inspector de Planta.

Al recibir un lote necesito identificar qué producto se fabricó, en qué área y quién realizará la inspección. Quiero registrar esos datos antes de medirlo para no atribuir un resultado a otro lote.

**Criterios de aceptación:**

1. El producto se registra con código único, descripción y unidad de medida; el lote exige número único, producto existente y fecha de fabricación. Un empleado debe pertenecer a un área existente.
2. Si falta un dato obligatorio, se informa el campo y no se guarda un registro incompleto. Un código o número de lote duplicado se rechaza.
3. Al volver a entrar con una cuenta autorizada, los datos permanecen en la base de datos del servidor.

**Responsable:** José Mondaca.

---

### Historia de Usuario 2 - Corregir datos maestros conservando sus referencias (Prioridad: P1)

**Perfil:** Gestor de Calidad.

Si un código o una descripción se ingresó mal, necesito corregir el registro existente. No quiero crear un segundo lote ni perder las inspecciones vinculadas al primero.

**Criterios de aceptación:**

1. La edición conserva el identificador y los vínculos del registro; se valida la unicidad del código antes de confirmar.
2. Eliminar exige permiso y confirmación. Un maestro referenciado por inspecciones, órdenes o parámetros no se elimina: se informa la dependencia para preservar trazabilidad.
3. Una operación denegada o inválida deja la base de datos sin cambios y muestra una explicación.

**Responsable:** Joaquín Quilodrán.

---

### Historia de Usuario 3 - Revisar indicadores y gráficos del control de calidad (Prioridad: P1)

**Perfil:** Gestor de Calidad.

Al comenzar el turno quiero ver cuántas órdenes están pendientes, qué inspecciones fueron rechazadas y qué acciones siguen abiertas. Necesito gráficos que permitan reconocer los productos con más problemas sin revisar registro por registro.

**Criterios de aceptación:**

1. El panel obtiene los totales de los datos guardados: lotes, inspecciones, rechazos y NCR/CAPA abiertas. Las tarjetas y gráficos se actualizan después de guardar.
2. Se presentan barras de inspecciones por resultado y un gráfico Sankey Producto → Resultado de inspección → Disposición. El ancho de cada flujo representa el número de inspecciones, no unidades producidas.
3. Los totales de entrada y salida del Sankey coinciden; incluye leyenda, cantidades y tabla equivalente para consultar sin depender del color.
4. Sin registros se muestra un estado vacío y ningún porcentaje inventado. Los datos simulados se identifican expresamente.

**Responsable:** Andrea Vergara.

---

### Historia de Usuario 4 - Organizar la gestión de maestros y registros por lote (Prioridad: P1)

**Perfil:** Coordinador de Calidad (perfil Gestor de Calidad).

Quiero pasar de un lote a sus inspecciones, no conformidades y acciones correctivas desde la misma área de trabajo. Necesito saber siempre qué lote estoy consultando antes de agregar o corregir un registro.

**Criterios de aceptación:**

1. Las secciones Datos maestros y Registros de calidad mantienen la navegación existente y muestran el registro seleccionado.
2. El selector de lote muestra número y producto. Las inspecciones y órdenes del contexto se filtran por ese identificador, sin mezclar lotes.
3. Cambiar de sección conserva lo ya guardado; los cambios del formulario sin guardar se avisan antes de salir. Crear, editar y eliminar respetan HU14.

**Responsable:** Coordinación de Calidad — responsable funcional.

---

### Historia de Usuario 5 - Administrar la configuración del módulo de calidad (Prioridad: P1)

**Perfil:** Administrador de Calidad (perfil Administrador).

Necesito mantener el nombre del módulo, sus catálogos y los perfiles de acceso desde un lugar controlado. Un inspector no debe cambiar estas definiciones mientras registra una inspección.

**Criterios de aceptación:**

1. Solo el Administrador puede modificar la configuración general y las cuentas; la autorización se comprueba en el servidor.
2. Los valores inválidos se rechazan con explicación y se conserva la última configuración válida.
3. Las tolerancias de medición, fechas de seguimiento y estados de calidad se definen en HU7; no se duplican en esta historia.

**Responsable:** Administración de Calidad — responsable funcional.

---

### Historia de Usuario 6 - Guiar al inspector al registrar una inspección (Prioridad: P1)

**Perfil:** Inspector de Planta.

Quiero elegir primero el producto y el lote y después completar solo los campos de la inspección que estoy realizando. Necesito entender qué se solicita sin ver conceptos de ventas, pagos ni nombres internos del programa.

**Criterios de aceptación:**

1. El formulario usa etiquetas de calidad y ayuda breve con unidades. Los campos obligatorios se distinguen antes de guardar.
2. Los campos de producto, lote, área e inspector ofrecen registros existentes; no obligan a memorizar identificadores.
3. Se muestran las mediciones aplicables al producto y sus límites de HU7. Un error conserva los datos escritos y sitúa el aviso junto al campo.
4. Al guardar se informa el folio, lote y resultado. No aparecen emojis, ilustraciones generadas ni campos financieros en el flujo visible de calidad.

**Responsable:** Josefa Guzmán.

---

### Historia de Usuario 7 - Definir parámetros y evaluar las mediciones de calidad (Prioridad: P1)

**Perfil:** Gestor de Calidad.

Quiero definir qué se mide en cada producto, con unidad, mínimo y máximo. Cuando el inspector registre una lectura, necesito que el sistema la compare con los límites guardados y advierta exactamente qué medida quedó fuera de rango.

**Criterios de aceptación:**

1. Cada parámetro tiene nombre, producto, unidad, mínimo, máximo, versión y estado activo. Se rechazan límites vacíos, no numéricos, infinitos o con mínimo mayor que máximo.
2. Una inspección exige las lecturas de todos los parámetros activos del producto. Los extremos del intervalo se aceptan. Una medición faltante o inválida no se guarda.
3. Si una lectura queda fuera del rango, la inspección se guarda como RECHAZADO y muestra parámetro, lectura, unidad e intervalo esperado. No permite que el cliente fuerce ACEPTADO.
4. Se conserva una copia de los límites y su versión junto a las lecturas para que un cambio posterior no altere inspecciones anteriores.
5. La planificación exige fecha de calendario válida y responsable cuando hay fecha objetivo. Se muestran vencimientos sin duplicar esta regla en HU9.
6. Las transiciones de NCR/CAPA se validan en el servidor; una transición no permitida no modifica el registro. Esta regla sustituye HU12.
7. Los ejemplos son simulados para este trabajo y se pueden ajustar desde la gestión; no representan tolerancias certificadas de una empresa real.

**Responsable:** Joaquín Quiñones — Gestor de Calidad.

---

### Historia de Usuario 8 - Localizar maestros por datos conocidos (Prioridad: P2)

**Perfil:** Inspector de Planta.

Necesito encontrar un lote aunque solo recuerde parte del número o la descripción del producto. Quiero buscar por esos datos y ver una lista que permita distinguir registros parecidos.

**Criterios de aceptación:**

1. La búsqueda ignora mayúsculas/minúsculas y admite número de lote, código, descripción y área.
2. Cada resultado muestra tipo, código o número, producto relacionado y fecha. Si no coincide ningún registro, se informa sin borrar el filtro.
3. La búsqueda es de consulta y no habilita edición a perfiles sin permisos.

**Responsable:** José Mondaca.

---

### Historia de Usuario 9 - Fecha objetivo y seguimiento — consolidada en HU7 (Prioridad: P2)

**Perfil:** Gestor de Calidad.

La validación de fechas, responsable y seguimiento de vencimientos se mantiene en HU7 para tener una sola definición de parámetros y reglas.

**Criterios de aceptación:**

1. No se genera una segunda tarea para la misma validación. Se conservan targetDate, responsible, completed y el historial de cambios existentes.
2. Las consultas siguen mostrando fecha, responsable, vencimiento y estado de cumplimiento, usando las reglas de HU7.

**Responsable:** Andrea Vergara — participación conservada en la consolidación.

---

### Historia de Usuario 10 - Registrar inspecciones, NCR y acciones CAPA con sus datos propios (Prioridad: P1)

**Perfil:** Inspector de Planta / Gestor de Calidad.

Quiero dejar evidencia de lo que ocurrió con un lote: las mediciones de la inspección, el hallazgo detectado y la acción que se acordó. Cada registro debe tener datos concretos y un vínculo que permita volver al origen.

**Criterios de aceptación:**

1. Una inspección guarda folio, producto, lote, área, inspector, fecha, lecturas y resultado calculado según HU7.
2. Una NCR guarda folio, inspección de origen cuando corresponda, lote, fecha, persona que detecta, descripción del defecto, gravedad y estado.
3. Una CAPA guarda la NCR de origen, tipo correctiva/preventiva, causa raíz, acción propuesta, responsable, fecha objetivo, evidencia y estado.
4. El Inspector crea inspecciones y reporta NCR; solo Gestor/Administrador editan o eliminan registros y gestionan CAPA. Una eliminación exige confirmación y respeta las referencias.
5. El servidor valida tipos, asociaciones y permisos aunque se intente enviar la operación fuera del formulario; registra autor y fecha de cada cambio.

**Responsable:** Joaquín Quilodrán.

---

### Historia de Usuario 11 - Consultar todas las órdenes y filtrar su trazabilidad (Prioridad: P1)

**Perfil:** Gestor de Calidad / Auditor.

Al abrir la consulta quiero ver todas las órdenes disponibles, con producto, lote, responsable, fecha y estado. Después quiero reducir la lista por filtros, sin tener que conocer de antemano el número de una orden.

**Criterios de aceptación:**

1. La vista abre con todas las órdenes y muestra total de coincidencias. Cada fila incluye número, producto, lote, cantidad, responsable, fecha objetivo y estado.
2. Permite combinar texto parcial, producto, lote, estado y rango de fechas; limpiar filtros devuelve la lista completa.
3. Desde una orden se consultan sus inspecciones y NCR/CAPA vinculadas. El Auditor tiene acceso de solo lectura.
4. Se ofrecen órdenes simuladas con estados y fechas distintos; la carga es aditiva e idempotente. La exportación CSV respeta los filtros y neutraliza fórmulas de hoja de cálculo.

**Responsable:** Joaquín Quiñones — Gestor de Calidad.

---

### Historia de Usuario 12 - Estados de registros operativos — consolidada en HU7 (Prioridad: P2)

**Perfil:** Gestor de Calidad.

Los estados y sus transiciones se definen y validan junto con los parámetros en HU7. Esta entrada conserva el número histórico para no romper referencias del equipo.

**Criterios de aceptación:**

1. No se mantiene un segundo catálogo de estados contradictorio. Las pantallas consumen las transiciones comunes descritas en HU7.
2. Se preservan los estados y registros anteriores; los cambios futuros dejan trazabilidad en lugar de sobrescribir la evidencia.

**Responsable:** Martina Cuevas — participación conservada en la consolidación.

---

### Historia de Usuario 13 - Mantener una interfaz sobria y consistente (Prioridad: P1)

**Perfil:** Coordinador de Calidad.

Quiero reconocer la sección y las acciones disponibles sin adornos que distraigan del control del proceso. Necesito una página legible para revisar datos durante el turno o una presentación del trabajo.

**Criterios de aceptación:**

1. Se conserva el marco de navegación, con textos claros y una paleta sobria. Se retiran emojis, imágenes generadas y símbolos decorativos de tarjetas y botones.
2. Los gráficos de datos son parte del análisis; no se reemplazan por ilustraciones. Tienen títulos, unidades y una alternativa tabular.
3. Las vistas funcionan con teclado y en pantallas pequeñas; los botones de acciones sensibles indican su propósito y piden confirmación.

**Responsable:** Martina Cuevas.

---

### Historia de Usuario 14 - Entrar con cuenta y contraseña y aplicar permisos reales (Prioridad: P1)

**Perfil:** Administrador del sistema.

Quiero crear cuentas para el equipo y asignarles un perfil. Una persona que abra la dirección de la página debe iniciar sesión antes de ver datos, y no debe poder elegir Administrador ni borrar registros por su cuenta.

**Criterios de aceptación:**

1. No hay selector público de identidades ni registro abierto. El primer Administrador se configura con un código local de instalación; después solo un Administrador autenticado puede crear cuentas.
2. Las contraseñas no se guardan en texto: se derivan con sal individual. Las sesiones se verifican en el servidor, expiran y se revocan al cerrar sesión, desactivar una cuenta o cambiar su rol.
3. El servidor obtiene el rol de la cuenta guardada, nunca del cuerpo de la petición ni de localStorage. Sin sesión responde 401; sin permiso 403, sin alterar los datos.
4. Administrador administra cuentas y configuración; Gestor gestiona calidad; Inspector registra inspecciones/NCR sin borrar; Auditor solo consulta. Se protege al último Administrador activo.
5. Se limita el intento repetido de acceso, se protegen las mutaciones contra solicitudes cruzadas y no se exponen contraseñas, sesiones ni códigos de instalación en la respuesta de datos.
6. La prueba debe incluir llamadas directas a la API sin sesión y con Auditor: ocultar botones por sí solo no acredita esta historia.

**Responsable:** Josefa Guzmán (historia), José Mondaca (tareas), Joaquín Quilodrán (implementación).

---

### Historia de Usuario 15 - Mostrar mensajes que indiquen qué hacer después (Prioridad: P2)

**Perfil:** Usuario del módulo.

Si no puedo guardar un dato necesito saber cuál está mal y cómo corregirlo. Cuando una operación termina quiero ver una confirmación breve, sin textos genéricos ni códigos internos.

**Criterios de aceptación:**

1. Los mensajes identifican el campo, el valor esperado y el resultado de la operación en español; no muestran trazas del servidor.
2. Se distingue un dato mal escrito de una medición válida que incumple tolerancia. La segunda genera una alerta de rechazo y conserva evidencia.
3. El grupo revisa este borrador con los ejemplos simulados y confirma responsables y términos antes de la entrega; no se atribuye esta revisión asistida a una redacción sin IA.

**Responsable:** Equipo de Control de Calidad.

---

## Requisitos transversales

- FR-001: persistir datos y relaciones en SQLite del servidor; el navegador conserva solo una copia de consulta en memoria, nunca autoridad de permisos.
- FR-002: proteger toda operación de lectura/mutación con sesión y permisos del servidor; aplicar validación de datos también en el servidor.
- FR-003: no borrar maestros referenciados; registrar actor, fecha y acción en un historial consultable por Gestor, Auditor y Administrador.
- FR-004: las simulaciones se cargan solo por un Administrador, sin borrar ni duplicar registros anteriores.
- FR-005: las mediciones se evalúan contra la versión de parámetros aplicable; un rechazo conserva las lecturas y explica cada desviación.
- FR-006: proporcionar gráficos basados en conteos reales y una tabla equivalente accesible; no inventar porcentajes.
- FR-007: conservar formularios tipados y funciones del equipo; las API de compatibilidad en memoria no sustituyen la autorización del servidor.
- FR-008: pruebas automatizadas de acceso, reglas, relaciones, simulación, filtros y conservación de flujos; ejecutar test, lint y build antes de cerrar la revisión.

## Alcance y decisiones

La aplicación deja de ser únicamente estática: las cuentas y SQLite requieren ejecutar el servidor Node. La ejecución local usa loopback; una publicación compartida requiere servidor, HTTPS y copia de seguridad, no solo GitHub Pages. Ninguna publicación ni entrega forma parte de este cambio. Las referencias a otros ERP se documentan como ejemplos de diseño, no como funciones ya implementadas.
