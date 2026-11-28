# Control de Calidad — Grupo 16

Aplicación académica de una planta simulada. Conserva los maestros y registros tipados del grupo y añade cuentas con contraseña, base SQLite, parámetros de medición, órdenes con filtros y gráficos de resultados. Todos los ejemplos y límites son ficticios y ajustables.

## Abrir en este computador

Requiere Node.js 24.15 o superior dentro de la rama 24, además de npm. Desde esta carpeta en VS Code:

```sh
npm ci
npm run dev
```

Abrir [la aplicación local](http://127.0.0.1:5180). Los cambios de código aparecen al recargar. Para cambiar el puerto, definir PORT antes de iniciar el servidor.

Al preparar la instalación se crean cuentas ficticias. Los usuarios y sus contraseñas aleatorias quedan en el archivo privado `.local-data/cuentas-locales.txt`; se abre localmente y no se sube al repositorio. Cada copia nueva debe prepararse como se indica a continuación. Los perfiles son Administrador, Gestor de Calidad, Inspector de Planta y Auditor. El Auditor consulta; no modifica registros. La cuenta del usuario del computador o de GitHub no es una cuenta de esta aplicación.

## Instalar otra copia

Con el servidor en ejecución, abrir otra terminal en esta carpeta y ejecutar `npm run setup:local` para crear cuatro cuentas ficticias con contraseñas nuevas y cargar ejemplos. Se realiza una sola vez; no cambia cuentas existentes. También puede crearse únicamente el primer Administrador desde la pantalla inicial usando el código privado de `.local-data/codigo-instalacion.txt`. Después, solo un Administrador autenticado crea cuentas.

Desde el panel del Administrador, **Cargar datos de ejemplo** agrega la simulación de forma idempotente: cuatro productos y lotes, 24 órdenes, mediciones aceptadas/rechazadas y casos NCR/CAPA relacionados. No borra registros ni duplica una simulación ya cargada.

## Uso de calidad

- **Parámetros:** el Gestor o Administrador define producto, nombre, unidad y límites. Cada cambio incrementa la versión. Inspector y Auditor consultan.
- **Inspección:** elegir producto y lote, completar área/inspector/fecha y las lecturas requeridas. Una lectura fuera del intervalo se guarda como rechazo con una alerta concreta. Una lectura vacía o inválida impide guardar.
- **Registros:** desplegar **Ver detalle** para consultar datos y mediciones con los límites y versión aplicados. Las inspecciones anteriores conservan su evidencia.
- **Lote de trabajo:** mantener el contexto al pasar entre maestros, registros y órdenes. La página avisa antes de salir con cambios del formulario sin guardar.
- **Órdenes:** inicialmente aparecen todas. Combinar texto, producto, lote, estado y fechas; limpiar para volver al total del contexto. La exportación CSV respeta esos filtros.
- **Panel:** barras y Sankey con conteos de inspecciones y tablas equivalentes. Una inspección cuenta una vez; los anchos no representan unidades fabricadas.

## Verificar y ejecutar la compilación

```sh
npm test -- --run
npm run lint
npm run build
npm start
```

`npm run test:api` ejecuta solo pruebas del servidor con bases temporales. `npm start` sirve la compilación y la API; no abrir dist/index.html directamente. SQLite queda en `.local-data/quality.sqlite`, fuera de los archivos públicos e ignorado por Git. Las credenciales, la base y el código de instalación no deben incluirse como código del proyecto.

Este prototipo se inicia en loopback. Para un despliegue compartido necesita un servidor Node y un origen HTTPS configurado mediante PUBLIC_ORIGIN. GitHub Pages por sí solo no ejecuta la API. Esta revisión no publica ni entrega el proyecto.

## Historias, tareas y OpenCode

La especificación vigente es `specs/001-erp-base-module/spec.md`. HU7 reúne las reglas antes separadas en HU9 y HU12; sus números se conservan como referencias. HU4 tiene responsable funcional Coordinación de Calidad y HU5 Administración de Calidad. El grupo debe validar la redacción asistida antes de usarla como documento final.

La skill está en `.opencode/skills/control-calidad-g16/SKILL.md`. Aporta instrucciones y contexto, no reentrena el modelo. Se ejecutó `/speckit.tasks` en OpenCode tras la revisión y se añadieron T131–T223 sin cambiar las tareas históricas. Las rutas de las nuevas tareas se ajustaron al contrato real: `/api/state` para consultas y `/api/actions` para operaciones autorizadas, reutilizando los módulos del grupo.

Ver `docs/revision-ayudante-2026-11-26.md`, `docs/api-local.md` y `docs/referencias-erp.md`. Las versiones anteriores de los documentos se conservan en `docs/historial/`.

## Git y colaboración

Guardar un archivo en VS Code modifica esta copia local. Git registra versiones y GitHub comparte las versiones subidas; instalar Git no sincroniza automáticamente. La propuesta de esta revisión se comparte mediante una rama y un Pull Request al repositorio del grupo. Cada integrante puede descargar esa rama para revisarla; incorporarla a main requiere permiso del grupo. No constituye una entrega en Canvas ni al profesor.
