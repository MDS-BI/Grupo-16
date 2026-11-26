# Feature Specification: Panel de inicio ERP para el Gestor de Calidad (HU3)

**Feature Branch**: `003-gestor-calidad-dashboard`

**Created**: 2026-11-25

**Status**: Draft

**Input**: User description: "Genera el plan para la historia de usuario (3) de los gestores de calidad, cuida que esté todo bien definido y verifica con un plan en el que pueda realizar. HU3: panel de inicio ERP con KPIs y acciones rápidas."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver KPIs confiables en el panel (Priority: P1) 🎯 MVP

Como Gestor de Calidad, quiero aterrizar en un panel estilo ERP con cuatro tarjetas de métricas clave calculadas desde el almacenamiento, para tener conciencia operativa inmediata sin interpretar los registros uno por uno.

**Why this priority**: Es el valor central de la HU3: sin contadores correctos el panel no aporta información accionable y cualquier acción rápida posterior se toma sobre datos poco confiables.

**Independent Test**: Abrir la aplicación en `/` con el almacenamiento vacío y verificar `0` en las cuatro tarjetas; cargar los datos de ejemplo y verificar que cada tarjeta coincide con un recuento calculado desde `localStorage`; crear o eliminar un registro en otra vista, volver al panel y comprobar el nuevo valor.

**Acceptance Scenarios**:

1. **Given** un Gestor de Calidad entra en la ruta raíz (`/`), **When** la aplicación carga, **Then** se renderiza el panel sin errores y los cuatro contadores reflejan la cantidad real de registros almacenados.
2. **Given** no hay registros en el almacenamiento, **When** se muestra el panel, **Then** cada contador muestra el entero `0`, nunca `null`, `undefined`, `NaN` ni una cadena vacía.
3. **Given** el panel está visible, **When** el usuario observa la sección superior, **Then** ve un grid de cuatro tarjetas: Lotes activos, Productos registrados, Inspecciones de Calidad realizadas y No Conformidades (NCR) + Acciones CAPA abiertas.
4. **Given** un Lote con `activo === false` o con estado `inactivo`/`cerrado`, **When** se calcula el KPI de lotes, **Then** ese lote no se cuenta como activo.
5. **Given** Inspecciones de Calidad en cualquier estado, **When** se calcula su KPI, **Then** se cuentan todas las inspecciones almacenadas (totales, no filtradas por mes).
6. **Given** NCR/CAPA con estado `CERRADA`, `RECHAZADA` o `RESUELTA` (sin distinción de mayúsculas), **When** se calcula su KPI, **Then** no se cuentan como abiertas; los estados `ABIERTA`, `EN_INVESTIGACIÓN` y `EN_CAPA` sí se cuentan.
7. **Given** el usuario crea o elimina registros en otra vista, **When** vuelve al panel, **Then** las tarjetas se recalculan desde el almacenamiento y reflejan el cambio.

---

### User Story 2 - Iniciar flujos desde acciones rápidas (Priority: P1)

Como Gestor de Calidad, quiero botones de acción rápida claramente separados por tipo de registro, para iniciar la creación de maestros u operativos en un solo clic sin arrastrar estados de formularios anteriores.

**Why this priority**: Reduce la fricción de las tareas diarias más comunes y convierte al panel en un punto de partida operativo, no solo informativo.

**Independent Test**: Desde el panel, pulsar cada una de las siete acciones rápidas y comprobar que se abre el formulario correspondiente con todos los campos vacíos y sin datos de una edición previa; verificar que los botones aparecen en dos grupos diferenciados.

**Acceptance Scenarios**:

1. **Given** el panel está visible, **When** el usuario observa la sección central, **Then** ve dos grupos diferenciados: creación de registros maestros (Nuevo Lote, Nuevo Producto, Nueva Área, Nuevo Empleado) y creación de registros operativos (Nueva Inspección, Nueva NCR, Nueva Acción CAPA).
2. **Given** un formulario maestro u operativo fue abandonado con datos sin guardar, **When** se activa una acción rápida desde el panel, **Then** el formulario se abre limpio, sin arrastrar estados previos.
3. **Given** un usuario sin permiso `create-master-data`, **When** ve el panel, **Then** no se muestran las cuatro acciones de creación de maestros.
4. **Given** un usuario sin permiso `create-operational`, **When** ve el panel, **Then** no se muestran las tres acciones de creación de operativos.
5. **Given** las etiquetas del módulo están configuradas, **When** se renderizan las acciones rápidas, **Then** sus textos derivan de la configuración y no de texto fijo.

---

### User Story 3 - Acceder a catálogos y búsqueda global (Priority: P2)

Como Gestor de Calidad, quiero accesos directos a la gestión de catálogos y a la búsqueda global desde el panel, para pasar de la visión general a la consulta o administración en un solo clic.

**Why this priority**: Cierra el recorrido del panel: después de ver una métrica, el usuario debe poder llegar al detalle sin navegar por la barra lateral.

**Independent Test**: Pulsar "Gestionar catálogos (Maestros)" y comprobar que se abre la vista de gestión; volver al panel, pulsar "Búsqueda global de registros" y comprobar que el foco del teclado queda dentro del campo de búsqueda.

**Acceptance Scenarios**:

1. **Given** el panel está visible, **When** el usuario pulsa "Gestionar catálogos (Maestros)", **Then** se abre la vista de gestión de Lotes, Productos, Áreas y Empleados.
2. **Given** el panel está visible, **When** el usuario pulsa "Búsqueda global de registros", **Then** se abre la vista de búsqueda con el cursor posicionado automáticamente en el input.
3. **Given** un usuario con permiso `read`, **When** observa la sección inferior del panel, **Then** ve ambos accesos aunque no tenga permisos de creación.
4. **Given** el usuario navega a gestión o búsqueda y pulsa el botón Panel, **When** vuelve al panel, **Then** los KPIs muestran los valores vigentes y el marco mantiene el módulo activo resaltado.

---

### Edge Cases

- ¿Qué ocurre si `localStorage` contiene registros sin `estado`, con `estado` en otro idioma o con valores no string? Se normaliza a cadena en minúsculas; un valor desconocido no se considera cerrado y cuenta como abierto/activo según corresponda.
- ¿Qué ocurre si una clave de almacenamiento no existe o contiene JSON inválido? Se trata como lista vacía sin lanzar errores y los KPIs muestran `0`.
- ¿Qué ocurre si hay 500 o más registros? El recálculo de KPIs y la navegación desde el panel siguen siendo correctos y responden sin bloquear la interfaz.
- ¿Qué ocurre si el usuario abre directamente gestión o búsqueda (enlace profundo o recarga) sin pasar por el panel? La navegación al panel sigue funcionando y los KPIs se calculan al mostrarlo.
- ¿Qué ocurre si el usuario pulsa "atrás" del navegador desde gestión o búsqueda? Vuelve al panel con contadores actualizados y sin perder registros.
- ¿Qué ocurre si el color de acento o las etiquetas configuradas son inválidos? Se conserva el tema integrado y las etiquetas predeterminadas sin romper el panel.
- ¿Qué ocurre con un usuario Auditor (solo `read` y `audit`)? Ve KPIs y accesos de consulta, pero no botones de creación.
- ¿Qué ocurre si dos acciones rápidas se activan seguidas? Cada una abre su formulario limpio; no se comparten estados entre formularios.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE mostrar el panel de inicio como vista inicial en la ruta raíz (`/`).
- **FR-002**: El panel DEBE mostrar exactamente cuatro tarjetas KPI: Lotes activos, Productos registrados, Inspecciones de Calidad realizadas y NCR/CAPA abiertas.
- **FR-003**: Los KPIs DEBEN calcularse desde el estado/almacenamiento cada vez que el panel se muestra, devolviendo siempre un entero (`0` cuando no hay datos, nunca `null`, `undefined` ni `NaN`).
- **FR-004**: "Lote activo" DEBE significar `activo !== false` y que `estado`/`status`, normalizado a minúsculas, no contenga `inactivo` ni `cerrado`.
- **FR-005**: "Inspecciones realizadas" DEBE contar todas las inspecciones almacenadas, sin filtro por mes ni por estado.
- **FR-006**: "NCR/CAPA abiertas" DEBE contar los registros NCR y CAPA cuyo `status`, normalizado a minúsculas, no contenga `cerrad`, `rechazad`, `resuelt`, `closed`, `resolved`, `complet`, `done` ni `cancel`.
- **FR-007**: El panel DEBE presentar los botones de acción rápida en dos grupos separados: maestros (Lote, Producto, Área, Empleado) y operativos (Inspección, NCR, CAPA).
- **FR-008**: Activar cualquier acción rápida de creación DEBE abrir el formulario correspondiente completamente limpio, sin estados previos.
- **FR-009**: El panel DEBE ofrecer un botón "Gestionar catálogos (Maestros)" que abra la vista de gestión de datos maestros.
- **FR-010**: El panel DEBE ofrecer un botón "Búsqueda global de registros" que abra la vista de búsqueda con autofocus en el input de búsqueda.
- **FR-011**: La visibilidad de los botones de creación DEBE respetar los permisos del perfil activo: `create-master-data` para los cuatro botones maestros, `register-inspections` para Nueva Inspección, `report-ncr` para Nueva NCR y `create-operational` para Nueva CAPA; los accesos de gestión y búsqueda DEBEN estar disponibles para perfiles con `read`.
- **FR-012**: El panel DEBE mostrar un estado vacío claro cuando no haya registros, sin sustituir los contadores `0` por mensajes.
- **FR-013**: Todas las etiquetas visibles del panel, incluidos KPIs y botones, DEBEN derivar de la configuración del módulo con valores predeterminados seguros.
- **FR-014**: El panel DEBE ser accesible por teclado, con foco visible y `aria-current="page"` en el módulo activo de la barra lateral, y DEBE Adaptarse a ventanas estrechas.
- **FR-015**: Esta funcionalidad NO DEBE crear nuevas claves de `localStorage` ni modificar los registros existentes; el panel es una vista de solo lectura.
- **FR-016**: El sistema DEBE contar con pruebas automatizadas unitarias y de integración que cubran los cálculos de KPIs, el estado vacío, el autofocus, los permisos y la navegación de ida y vuelta al panel.

### Key Entities *(include if feature involves data)*

- **KpiSnapshot**: Vista de solo lectura con cuatro contadores enteros (`activeLots`, `products`, `inspections`, `openFindings`) derivados de los registros almacenados; no se persiste.
- **QuickActionDefinition**: Definición de un botón del panel con identificador DOM, etiqueta configurada, icono, permiso requerido y destino (formulario maestro, formulario operativo, gestión o búsqueda).
- **DashboardState**: Estado de la vista compuesto por `KpiSnapshot`, lista de acciones rápidas visibles y bandera de estado vacío; se recalcula al entrar al panel.
- **Registros maestros y operativos existentes**: Lote, Producto, Área, Empleado, Inspección, NCR y CAPA, leídos desde `localStorage` sin mutación.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100% de los KPIs coinciden con un recuento independiente de los registros de `localStorage`, incluido cuando el almacenamiento está vacío (`0`).
- **SC-002**: Un Gestor de Calidad puede abrir cualquier formulario o la búsqueda desde el panel en menos de un segundo y sin pasos intermedios.
- **SC-003**: El foco queda dentro del input de búsqueda en el 100% de las activaciones del acceso "Búsqueda global".
- **SC-004**: Ningún perfil ve botones de creación para los que no tiene permiso; los cuatro perfiles ven los KPIs correctos.
- **SC-005**: No se producen regresiones en crear, editar, eliminar ni buscar registros tras usar el panel.
- **SC-006**: Con al menos 500 registros, el panel se muestra con los contadores correctos sin pérdida de funcionalidad.
- **SC-007**: Todas las pruebas unitarias y de integración de la funcionalidad pasan y la compilación de producción termina sin errores.

## Assumptions

- La persistencia sigue siendo `localStorage` del navegador; no se añade backend ni autenticación real.
- El selector de usuarios simula los cuatro perfiles definidos en `src/permissions.js`.
- El panel es una vista de solo lectura: no introduce nuevas entidades persistentes.
- Los registros operativos pueden tener estado como texto libre o como estado de ciclo de vida configurado; ambos se normalizan para el recuento de abiertos.
- Las etiquetas y el color de acento se toman de `src/module-config.js` con retroceso a valores predeterminados.
- La implementación existente de la HU3 en `main` se reutiliza y ajusta; no se reconstruye desde cero.
