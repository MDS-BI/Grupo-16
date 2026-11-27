# Revisión de los consejos del ayudante

Base: `main` del grupo, commit `1ed152d`. El avance local anterior se conservó en un respaldo y en el stash de Git antes de actualizar. No se publica ni se entrega desde este procedimiento.

| Punto | Cambio implementado y evidencia |
| --- | --- |
| 1 | Datos ficticios aditivos en la base de datos, con productos, lotes, órdenes, lecturas, NCR y CAPA relacionadas. |
| 2 | Retirar emojis e imágenes decorativas; conservar los iconos funcionales de Martina y los gráficos de datos con etiquetas. |
| 3 | Historias concretas y revisables, con ejemplos de la planta simulada. Son un borrador asistido que el grupo debe validar. |
| 4 y 17 | Cuenta y contraseña, sesión del servidor y permisos en cada operación; retirar selección pública de identidades. |
| 5 y 8 | Barras de resultados y Sankey de inspecciones, con totales conservados y tabla accesible. |
| 6 | Skill `control-calidad-g16` en el repositorio local de OpenCode. |
| 7 | HU4: Coordinación de Calidad como responsable funcional, según autorización del usuario. |
| 9, 13 y 16 | HU7 reúne mediciones, tolerancias, fechas y estados. HU9 y HU12 conservan referencias históricas a esa consolidación. |
| 10 | Comparación con documentación oficial de Odoo y ERPNext en `referencias-erp.md`. |
| 11 | HU5: Administración de Calidad como responsable funcional; no se inventa un integrante académico. |
| 12 | HU6 se reemplaza por un flujo guiado de registro de inspección y mensajes concretos. |
| 14 | HU10 distingue datos y relaciones de Inspección, NCR y CAPA. |
| 15 | HU11 abre con todas las órdenes y permite combinar filtros. |
| 18 | Ejecutar `/speckit.tasks` después de editar la especificación, conservando las tareas históricas y agregando desde T131. |

## Verificación local terminada

- Suite completa: **287 pruebas aprobadas en 28 archivos**, ejecutadas con `npm test -- --run`. Conserva la regresión de los módulos del grupo. Las expectativas de logo decorativo y cantidad fija de botones se actualizaron por los cambios solicitados de presentación y navegación.
- Pruebas adicionales históricas: **4/4** con `node --test tests/demo-smoke.mjs`.
- `npm run lint` y `npm run build`: correctos.
- `npm audit`: cero vulnerabilidades reportadas después de aplicar los parches compatibles, sin `--force`.
- Skill de OpenCode validada con `quick_validate.py`: `Skill is valid!`. Se utilizó OpenCode 1.19.5 con la skill del proyecto y se ejecutó el comando `/speckit.tasks` después de revisar las historias. Las tareas técnicas generadas se ajustaron al contrato real de `docs/api-local.md`; no se crearon rutas ficticias para hacer coincidir una propuesta.
- Compilación servida con Node en un entorno temporal local: HTML y dos recursos compilados correctos; consulta de datos sin sesión devuelve 401; cinco rutas privadas de base, cuentas, entorno, Git e instalación devuelven 404.
- Navegador: ingreso como Inspector, registro ficticio 99026 rechazado con **28 g frente a 24–26 g**, salida y nuevo ingreso como Auditor, consulta del detalle histórico sin controles de escritura, acceso como Administrador y carga aditiva de casos NCR/CAPA.
- Órdenes: 24 al abrir; filtro RECHAZADA devuelve 4; limpiar restaura 24. El contexto DEMO-L01 devuelve 6 órdenes. Se verificó navegación por teclado y pantalla de 390 px sin desbordamiento horizontal del documento; las tablas conservan desplazamiento propio. El tamaño de prueba se restauró.
- Capturas locales en la carpeta outputs: `revision-calidad-26.jpg`, `revision-sankey-26.jpg` y `revision-rechazo-26.jpg`.

## Estado de la copia

La base local contiene **4 cuentas ficticias, 4 productos, 4 lotes, 24 órdenes, 4 parámetros, 29 inspecciones, 6 NCR y 5 CAPA**. Incluye el caso de comprobación del folio 99026. Los límites son ejemplos simulados y editables. Los registros anteriores de demostración se conservan; su detalle indica cuando no incluyen lecturas de parámetros.

Las credenciales recién generadas están únicamente en el archivo privado ignorado `.local-data/cuentas-locales.txt`; la API no devuelve contraseñas ni hashes. Instalar Git no comparte estos cambios automáticamente.

VS Code se abrió con la carpeta de la copia probada. La copia anterior se conserva sin sobrescribir. El código, la base y el servidor de la vista local corresponden a la misma carpeta de trabajo.

T001–T130 se conservaron sin cambios. De las 93 tareas nuevas, **92 verificadas y marcadas; T221 pendiente de validación humana del grupo**. No se afirma que las historias estén redactadas sin asistencia ni que el grupo ya haya aprobado el borrador. HU4 y HU5 tienen responsables funcionales, según la elección autorizada por el usuario.

El historial previo se respaldó antes de actualizar. La validación inicial se realizó sin publicar cambios. La aplicación funciona con Node y SQLite; una futura instalación compartida necesita servidor y HTTPS, no solo alojamiento estático.

## Comprobación del aporte de Martina

Al consultar nuevamente el repositorio del grupo se encontró `dbc6333ec5242d3e193b47b5dd73686060a579c1`, de `martinacuevasb`, con el título **Reemplazar emojis por iconos**. Modifica `index.html`, `src/components/dashboard.js` y `src/styles.css`, los mismos tres archivos que muestra la foto compartida por el usuario. Llegó después de la base inicial `1ed152d` usada para esta revisión.

Se respaldó la revisión local, se avanzó el historial hasta ese aporte y se recuperaron los cambios propios. La integración conserva sus trece iconos en el HTML, las siete definiciones de acciones y sus estilos, junto con las funciones de esta revisión y el escape de etiquetas. No quedaron archivos en conflicto ni cambios preparados para un commit.

Después de integrar: **287/287 pruebas aprobadas**, lint correcto y compilación correcta.

## Compartir con el grupo

El usuario autorizó compartir esta revisión en el repositorio del grupo. La cuenta `joaco1505` puede consultar `MDS-BI/Grupo-16`, pero no escribir directamente en su rama principal. El aporte se presenta mediante la rama `revision-calidad-26-11` de su fork y un Pull Request al repositorio del grupo. Incorporarlo a `main` requiere una cuenta con permisos del grupo. La base SQLite, las contraseñas, los códigos de instalación y los respaldos privados quedan fuera del aporte. No se realizan entregas en Canvas ni al profesor ni se envían mensajes externos.
