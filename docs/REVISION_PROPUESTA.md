# Revisión de la copia

Se recuperó la paleta azul petróleo y verde de la propuesta anterior, adaptándola al HTML actual sin sustituir la aplicación. Se agregó menú plegable, iconos, diseño adaptable, datos de demostración opcionales y correcciones puntuales de permisos de creación de inspecciones/NCR, estados vacíos y errores de estado. Se conservan los identificadores existentes.

## Feedback y pendientes
- HU2, HU3, HU4 y HU15: responsables pendientes; no se inventaron nombres.
- HU15: se añadieron tareas de verificación sin marcarlas completas.
- Los registros tipados y los estados existen; subsisten campos ERP históricos y asociación obligatoria a entidad genérica. Requieren migración acordada con el grupo.
- Los roles son simulados en localStorage; no existe autenticación real.
- Se mantienen las tareas previas marcadas por el grupo; no equivalen a certificación de cumplimiento.
- Falta validar navegación, formularios, búsqueda, transiciones y permisos completos en navegador; no se pudo instalar dependencias en el entorno (caché incompleta y versión de Node inferior a la requerida por jsdom). No se verificó compilación Vite ni suite Vitest.
- Pruebas independientes de Node: carga demo, idempotencia, preservación, restricción de auditor y matriz básica de roles. Ver tests/demo-smoke.mjs.
- El diseño es una adaptación de la propuesta anterior, no una reproducción exacta. No se realizó revisión visual en navegador.

## Integración
Probar en puerto 5180, actualizar main y comprobar el patch antes de aplicar. No copiar dist ni node_modules. No se modificó GitHub.

## Segunda revisión (24-11-2026)
- Acciones rápidas, formularios y acciones de lista visibles según permisos; se conservan las comprobaciones al guardar.
- Mensajes de autorización en español; corrección de clasificación KPI por tipo de documento y selección de tipo maestro en acciones rápidas.
- Demostración ampliada a cuatro lotes, cuatro productos maestros, cuatro inspecciones, dos NCR y una CAPA; carga aditiva sin duplicados y mensaje según resultado.
- Verificación local: cuatro pruebas Node aprobadas; Vitest, build y navegador pendientes por falta de dependencias en el entorno. Roles simulados localmente, no autenticación de producción.
