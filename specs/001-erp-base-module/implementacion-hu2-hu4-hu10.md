# Incremento HU2, HU4 y HU10

Responsable: Joaquín Quilodrán. Rol del sistema: **Analista de Calidad**. Equipo: incremental. Fecha: 2026-11-03.

Desarrollo asistido por IA con Codex, siguiendo los archivos de especificación y tareas de SpecKit del grupo.

## Funcionalidad

- **HU2:** editar maestros conservando su identidad y vínculos; validar antes de guardar; confirmar o cancelar eliminaciones. Eliminar un Área elimina sus Empleados, y eliminar un Producto elimina sus Lotes. En ambos casos se eliminan también los registros operativos de los maestros afectados y se conservan los de otros maestros.
- **HU4:** alternar entre la gestión de maestros y la de registros operativos, mantener el maestro seleccionado y mostrar únicamente sus registros. La pantalla explica cuándo no hay maestros disponibles. La navegación conserva los datos guardados.
- **HU10:** crear, consultar, editar y eliminar registros vinculados a un maestro existente. Inspección incluye tipo, resultado y cantidades; NCR incluye folio, origen, gravedad y hallazgo; CAPA incluye tipo de acción, descripción, responsable y fecha compromiso. Las opciones Auditoría, Queja y Evaluación usan por ahora los campos comunes de documento. Un registro existente conserva su maestro de origen.

El rol identifica al profesional descrito por las historias. El MVP es de frontend y no implementa inicio de sesión ni permisos por cargo.

## Base utilizada y alcance

La rama `main` de partida (`210a994`) tenía specs y pruebas, pero no `index.html` ni `src/`: fueron retirados en el commit `a0062c0`. Se recuperaron esos archivos de la versión previa del mismo repositorio (`501e9c6`) para disponer de una base ejecutable. No se incorporó una aplicación distinta ni se crearon ramas.

Sobre esa base, los cambios de este incremento están en almacenamiento, gestión, formularios, lista de registros y los nuevos `quality-records.js` y `components/quality-fields.js`. El perfil `userConfig`, panel, búsqueda y marco visual recuperados se mantienen como dependencias de la plantilla. En `module-config.js` solo se reservan los nuevos nombres de campos para evitar colisiones con campos personalizados. Las otras diez historias y sus tareas no se modifican ni se marcan como realizadas.

La aplicación conserva por eso el nombre y etiquetas genéricos de la plantilla hasta integrar la configuración a cargo del equipo de modificaciones. El diseño de panel y la creación específica de datos maestros pueden evolucionar con HU1 y HU3. Este incremento aporta los campos mínimos de tipo y relación necesarios para editar y eliminar maestros respetando HU2; no sustituye los compromisos de esos compañeros.

## Datos y compatibilidad

Se conservan las claves de localStorage `erp_base_module:entities` y `erp_base_module:documents`. Los registros anteriores sin tipo siguen siendo utilizables.

| Registro | Campos añadidos | Relación o validación |
| --- | --- | --- |
| Maestro | `entityType`: AREA, EMPLEADO, PRODUCTO o LOTE | Opcional para compatibilidad con registros base |
| Empleado | `areaId` | `entity_id` de un maestro AREA existente |
| Lote | `productId` | `entity_id` de un maestro PRODUCTO existente |
| Operativo | `recordType` | INSPECCION, NCR, CAPA, AUDITORIA, QUEJA o EVALUACION |
| Inspección | `inspectionType`, `inspectionResult`, `inspectedQuantity`, `rejectedQuantity` | Tipo y resultado obligatorios; cantidades enteras no negativas; rechazadas no supera inspeccionadas |
| NCR | `origin`, `severity`, `finding` | Obligatorios al elegir NCR |
| CAPA | `actionType`, `actionDescription`, `responsible`, `dueDate` | Obligatorios; fecha compromiso válida y no anterior al inicio |

`entity_id` es la referencia estable de cada registro operativo y no se cambia al editar el maestro. El frontend traduce las relaciones Área/Empleado y Producto/Lote del MER a referencias de objetos en localStorage; no introduce un backend SQL.

Las definiciones de campos personalizados y el ciclo de vida se siguen leyendo de la configuración existente. La edición respeta esas validaciones. Los valores de hallazgos y otros textos se muestran como texto y no se ejecutan como HTML.

## Cómo ejecutar y demostrar

Desde la raíz del repositorio, con Node.js y npm instalados:

```powershell
npm ci
npm run dev
```

Abrir la dirección local indicada por Vite. Usar datos de prueba:

1. En Entidades, registrar un Producto con nombre y código. Registrar después un Lote, seleccionando ese Producto.
2. Seleccionar el Lote en el control de edición, cambiar su nombre y guardar. Comprobar que sigue siendo el mismo registro.
3. Abrir Documentos. Elegir el Lote, seleccionar Inspección de calidad, completar tipo, resultado, folio y fechas, y guardar. También pueden registrarse NCR y CAPA con sus campos obligatorios.
4. Ver los registros del maestro y usar Editar para recuperar sus detalles. Cambiar a otro maestro y comprobar que sus registros no se mezclan.
5. Volver al Panel, regresar y recargar la página. Los registros guardados deben conservarse.
6. En datos de prueba, cancelar una eliminación y comprobar que no cambia nada. Confirmar la eliminación del Producto para comprobar la cascada sobre sus Lotes y registros operativos.

## Verificación

```powershell
npm test -- --run
npm run build
```

La plantilla recuperada pasó sus 111 pruebas originales. Este incremento añade 22 pruebas de dominio e integración, en `tests/unit/quality-records.test.js` y `tests/integration/quality-management.test.js`. Se verifican identidad estable, validación, cascadas, aislamiento por maestro, cancelación, conservación de campos personalizados y colecciones de 500 maestros. La suite completa tiene 133 pruebas.

Las tareas T020–T026, T034–T041 y T076–T084 corresponden a este incremento. Las tareas de otros integrantes permanecen pendientes según el estado previo del documento; recuperar dependencias de la plantilla no acredita su trabajo como terminado.

## Compartir el avance

Guardar los archivos en VS Code o usar una IA no publica el avance. El registro compartido se realiza mediante un commit en el repositorio GitHub del grupo; esto es independiente de cualquier entrega en Canvas o comunicación a profesores.

Para que quede evidencia atribuida a Joaquín, revisar el diff, configurar Git con su identidad de autor, crear un commit descriptivo y publicarlo con su cuenta de GitHub en el repositorio del grupo. Antes del push se deben incorporar los cambios recientes del grupo y resolver cualquier conflicto conservando ambos aportes. El mensaje sugerido es `Implementar HU2, HU4 y HU10 - Analista de Calidad`.

Si la cuenta no tiene permiso de escritura, un responsable del repositorio debe concederle acceso o se debe usar el mecanismo de pull request que acuerde el grupo. Los compañeros verán el commit en GitHub y podrán descargarlo actualizando su copia. El historial, las historias asignadas, las tareas y las pruebas constituyen evidencia del aporte; la evaluación corresponde al profesor.
