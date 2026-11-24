# Feature Specification: Seguimiento de Fecha Objetivo (HU9)

**Feature Branch**: `002-target-date-status`

**Created**: 2026-11-24

**Status**: Draft

**Input**: User description: "actualiza la historia de usuario 9: como inspector de planta, quiero asignar una fecha objetivo opcinal a un lote, producto, area organizativa o empleado, con tipo de accion ( inspeccion, reinspeccion, calibracion, auditoria o capacitacion) y responsable. la fecha muestra un estado con color: verde si faltan mas de 7 dias, amarillo si faltan 7 o menos, rojos si esta vencida y completada cuando se marca como realizada. la lista se puede ordenar por fecha (vencidas primero, sin fecha al final) y filtrar por estado. si la fecha queda en blanco, el registro se guarda igual. mostrar error si la fecha es invalida y pedir confirmacion si es anterior a hoy. los usuarios de solo cosulta pueden ver la fecha pero no ediarla. los cambios quedan registrados con usuario, fecha y hora."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Asignar fecha objetivo, acción y responsable (Priority: P1)

Como inspector de planta, quiero asignar una fecha objetivo opcional, un tipo de acción y un responsable a un lote, producto, área organizativa o empleado, para planificar el seguimiento de calidad de cada registro.

**Why this priority**: Es la capacidad central de HU9; sin ella no existe planificación ni información de seguimiento que mostrar.

**Independent Test**: Se puede probar creando o editando un registro de cada tipo, guardando una vez con fecha y otra vez sin fecha, y verificando que ambas operaciones terminan correctamente.

**Acceptance Scenarios**:

1. **Given** un inspector edita un lote, producto, área organizativa o empleado, **When** introduce una fecha objetivo válida, selecciona un tipo de acción de la lista permitida y elige un responsable, **Then** el registro se guarda con esa planificación visible.
2. **Given** un inspector edita un registro, **When** deja la fecha objetivo en blanco, **Then** el registro se guarda igual y no se muestra ningún error de validación por la fecha.
3. **Given** un inspector introduce una fecha objetivo, **When** no selecciona responsable, **Then** el guardado se bloquea y se muestra un mensaje que indica que el responsable es obligatorio cuando hay fecha.

---

### User Story 2 - Ver estado por color y marcar como realizada (Priority: P1)

Como inspector de planta, quiero que la fecha objetivo muestre un estado visual inmediato, para identificar rápidamente qué registrados requieren atención y cuáles ya están cerrados.

**Why this priority**: Convierte la fecha en información accionable: el equipo puede priorizar vencimientos y reconocer trabajos terminados sin interpretar fechas manualmente.

**Independent Test**: Se puede probar con registros que tengan fechas relativas a hoy (más de 7 días, 7 días, hoy, ayer) y marcando uno como realizado, verificando el estado mostrado en cada caso.

**Acceptance Scenarios**:

1. **Given** registros sin marcar como realizados, **When** faltan más de 7 días para la fecha objetivo, **Then** el estado se muestra en verde.
2. **Given** registros sin marcar como realizados, **When** faltan 7 días o menos, incluido el día de hoy, **Then** el estado se muestra en amarillo.
3. **Given** un registro con fecha anterior a hoy, **When** se visualiza, **Then** el estado se muestra en rojo como vencido.
4. **Given** un registro pendiente, **When** se marca como realizada, **Then** el estado se muestra como completada y deja de presentarse como alerta de vencimiento o proximidad.
5. **Given** un registro sin fecha objetivo, **When** se visualiza, **Then** se muestra sin estado de alerta de fecha.

---

### User Story 3 - Ordenar y filtrar la lista de seguimiento (Priority: P2)

Como inspector de planta, quiero ordenar la lista por fecha y filtrarla por estado, para encontrar primero los trabajos vencidos y revisar rápidamente un subconjunto concreto.

**Why this priority**: Reduce el tiempo de búsqueda en operación diaria y evita que los vencimientos queden ocultos entre registros sin fecha.

**Independent Test**: Se puede probar con una lista mixta de registros vencidos, próximos, completados y sin fecha, aplicando orden y filtros por estado.

**Acceptance Scenarios**:

1. **Given** una lista con registros vencidos, con fecha futura y sin fecha, **When** se ordena por fecha objetivo, **Then** los vencidos aparecen primero, los restantes con fecha aparecen después en orden de fecha y los registros sin fecha aparecen al final.
2. **Given** registros con estados verde, amarillo, rojo, completada y sin fecha, **When** se aplica un filtro por estado, **Then** solo se muestran los registros cuyo estado coincide.
3. **Given** un filtro activo, **When** se elimina el filtro, **Then** se restaura la lista completa manteniendo el orden seleccionado.

---

### User Story 4 - Validar fechas y confirmar fechas pasadas (Priority: P2)

Como inspector de planta, quiero que el sistema detecte fechas inválidas y me pida confirmación cuando la fecha es anterior a hoy, para evitar errores de captura sin impedir registraciones históricas legítimas.

**Why this priority**: Protege la calidad del dato sin bloquear casos válidos de reprocesamiento o carga de información pasada.

**Independent Test**: Se puede probar intentando guardar una fecha con formato inválido, una fecha pasada confirmada y una fecha pasada cancelada.

**Acceptance Scenarios**:

1. **Given** un inspector introduce una fecha objetivo con formato inválido, **When** intenta guardar, **Then** no se guarda el cambio y se muestra un error claro indicando que la fecha es inválida.
2. **Given** un inspector introduce una fecha objetivo anterior a hoy, **When** intenta guardar, **Then** se solicita confirmación antes de aplicar el cambio.
3. **Given** una fecha anterior a hoy, **When** el inspector confirma, **Then** el cambio se guarda y el estado correspondiente se muestra como vencido.
4. **Given** una fecha anterior a hoy, **When** el inspector cancela la confirmación, **Then** el registro permanece sin cambios.

---

### User Story 5 - Consultar sin editar y conservar trazabilidad (Priority: P2)

Como usuario de solo consulta, quiero ver la fecha objetivo, el tipo de acción, el responsable y el estado sin poder modificarlos, y como inspector quiero que cada cambio quede registrado, para mantener la información visible y auditable.

**Why this priority**: La separación de permisos evita cambios no autorizados y la trazabilidad permite explicar quién modificó la planificación y cuándo.

**Independent Test**: Se puede probar con un usuario de solo consulta intentando editar estos campos y con un inspector realizando cambios, revisando el historial resultante.

**Acceptance Scenarios**:

1. **Given** un usuario de solo consulta visualiza un registro, **When** intenta editar la fecha, el tipo de acción, el responsable o el estado de realización, **Then** la edición no se permite.
2. **Given** un usuario de solo consulta visualiza un registro, **When** observa su planificación, **Then** puede ver la fecha objetivo, el tipo de acción, el responsable y el estado.
3. **Given** un inspector cambia la fecha, el tipo de acción, el responsable o marca una acción como realizada, **When** se consulta el historial del registro, **Then** cada cambio aparece con el usuario que lo realizó, la fecha y la hora.

---

### Edge Cases

- Una fecha exactamente a 7 días de hoy se considera amarillo; una fecha a 8 días se considera verde.
- Una fecha igual a hoy se considera amarillo; solo una fecha anterior a hoy se considera vencida.
- Un registro marcado como completada conserva su fecha, tipo de acción y responsable, pero su estado visible es completada.
- Un registro sin fecha objetivo se guarda y se muestra sin alerta de fecha, y se ubica al final al ordenar.
- Una fecha inválida no guarda el cambio y mantiene el valor anterior del registro.
- Una fecha pasada cancelada en la confirmación no genera ningún cambio en el historial.
- Un usuario de solo consulta no puede marcar una acción como realizada.
- Si se cambian varios campos de planificación en una sola operación, cada campo modificado queda reflejado en el historial con el mismo usuario, fecha y hora de la operación.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE permitir asignar una fecha objetivo opcional a lotes, productos, áreas organizativas y empleados.
- **FR-002**: El sistema DEBE permitir asociar a esa fecha un tipo de acción de la lista: inspección, reinspección, calibración, auditoría o capacitación.
- **FR-003**: El sistema DEBE permitir asignar un responsable a la acción planificada.
- **FR-004**: El sistema DEBE guardar el registro cuando la fecha objetivo quede en blanco.
- **FR-005**: El sistema DEBE exigir responsable cuando se haya introducido una fecha objetivo.
- **FR-006**: El sistema DEBE mostrar un error comprensible cuando la fecha introducida sea inválida y NO DEBE guardar el cambio.
- **FR-007**: El sistema DEBE pedir confirmación antes de guardar una fecha objetivo anterior a hoy.
- **FR-008**: Si el usuario cancela la confirmación de una fecha pasada, el sistema NO DEBE modificar el registro ni su historial.
- **FR-009**: El sistema DEBE mostrar verde cuando falten más de 7 días, amarillo cuando falten 7 días o menos y rojo cuando la fecha sea anterior a hoy.
- **FR-010**: El sistema DEBE mostrar el estado completada cuando la acción se marque como realizada, manteniendo visible su fecha, tipo de acción y responsable.
- **FR-011**: El sistema DEBE permitir ordenar la lista por fecha objetivo colocando primero las fechas vencidas y al final los registros sin fecha.
- **FR-012**: El sistema DEBE permitir filtrar la lista por estado, incluyendo verde, amarillo, rojo, completada y sin fecha.
- **FR-013**: Los usuarios de solo consulta DEBEN poder ver la fecha objetivo, el tipo de acción, el responsable y el estado, pero NO DEBEN poder editarlos ni marcar la acción como realizada.
- **FR-014**: El sistema DEBE registrar cada cambio de fecha, tipo de acción, responsable o estado de realización con el usuario que lo realizó, la fecha y la hora.
- **FR-015**: El sistema DEBE mostrar mensajes claros y coherentes para errores de validación, confirmaciones y cambios guardados.

### Key Entities *(include if feature involves data)*

- **Registro planificable**: lote, producto, área organizativa o empleado existente al que se le asocia la planificación de seguimiento.
- **Planificación de seguimiento**: fecha objetivo opcional, tipo de acción, responsable y estado de realización de un registro.
- **Estado de fecha**: resultado visible derivado de la fecha objetivo y del estado de realización: verde, amarillo, rojo, completada o sin fecha.
- **Historial de cambios**: registro de cada modificación de planificación con usuario, fecha, hora y campos afectados.
- **Usuario con rol**: persona que consulta o edita, con distinción entre inspector y usuario de solo consulta.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100% de los registros probados se guarda correctamente cuando la fecha objetivo se deja en blanco.
- **SC-002**: El 100% de los casos límite de fecha (8 días, 7 días, hoy, ayer y completada) muestra el estado esperado.
- **SC-003**: En el 100% de las pruebas de ordenación, los registros vencidos aparecen antes que los no vencidos y los registros sin fecha aparecen al final.
- **SC-004**: En el 100% de las pruebas de filtrado, la lista resultante contiene únicamente registros del estado seleccionado.
- **SC-005**: El 100% de las fechas inválidas se rechaza con un mensaje comprensible y sin guardar cambios.
- **SC-006**: El 100% de las fechas anteriores a hoy requiere confirmación, y cancelarla deja el registro intacto.
- **SC-007**: Los usuarios de solo consulta tienen 0 modificaciones permitidas sobre fecha, tipo de acción, responsable o realización, manteniendo acceso de lectura al 100% de esos campos.
- **SC-008**: El 100% de las modificaciones aceptadas aparece en el historial con usuario, fecha y hora.
- **SC-009**: El 95% de los inspectores que participen en una prueba de usabilidad completa la asignación de fecha, acción y responsable en menos de 2 minutos.

## Assumptions

- "Vencida" significa que la fecha objetivo es anterior a hoy; una fecha igual a hoy se considera amarillo por estar a 0 días.
- El estado completada prevalece sobre los colores de proximidad o vencimiento, pero la fecha objetivo sigue siendo visible.
- El tipo de acción y el responsable son obligatorios cuando se introduce una fecha objetivo; si la fecha queda en blanco, el registro se guarda igual.
- Al ordenar por fecha, los registros vencidos y los no vencidos se ordenan de la fecha más antigua a la más reciente dentro de su grupo, y los registros sin fecha se colocan al final.
- Los usuarios de solo consulta pueden ver todos los campos de planificación, pero no pueden editarlos ni marcar la acción como realizada.
- La identidad del usuario que realiza el cambio ya existe en el producto y se reutiliza para el historial.
- La fecha y hora registradas en el historial corresponden al momento en que se guarda el cambio.
- Las notificaciones automáticas y los recordatorios quedan fuera del alcance de esta historia de usuario.
