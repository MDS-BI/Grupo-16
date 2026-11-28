---
name: control-calidad-g16
description: Implementar y revisar historias, parámetros, inspecciones, órdenes y acceso del módulo Control de Calidad G16 conservando los módulos tipados y sus pruebas.
---

Lee `specs/001-erp-base-module/spec.md` y `specs/001-erp-base-module/plan.md`, relativos a la raíz del proyecto, antes de proponer tareas. La revisión del 26/11/2026 consolida HU9 y HU12 en HU7, manteniendo sus números como referencias históricas.

- El caso es una planta simulada. Las tolerancias son ejemplos ajustables: no atribuyas certificaciones, normas cumplidas ni datos de una empresa real.
- Reutiliza los maestros y documentos tipados existentes. Identifica producto, lote, inspector y relaciones mediante sus identificadores; no generes registros huérfanos para llenar gráficos.
- HU7 reúne límites, unidad, versión, mediciones, fechas objetivo y transiciones. Una lectura fuera de rango se registra como rechazo con una alerta específica; una lectura inválida o ausente impide guardar. Conserva el límite aplicado como evidencia histórica.
- Las cuentas y autorizaciones pertenecen al servidor. Un selector de rol, contraseña en localStorage o botón oculto no satisface HU14. La API obtiene el actor de una sesión válida y verifica cada mutación.
- El Sankey usa conteos de inspecciones y conserva sus flujos. Incluye etiquetas y tabla equivalente. No uses ilustraciones generadas ni emojis decorativos.
- Mantén tareas históricas y añade las nuevas desde T131. Marca una tarea solo cuando exista código y verificación. Una referencia de ERP es una fuente de diseño, no prueba de implementación.
- Trabaja en la copia local actual. La skill no autoriza commits, push, nuevas ramas, mensajes ni entregas. Usa las instrucciones expresas del usuario para esas acciones.

Referencias del proyecto: `docs/referencias-erp.md` y `docs/revision-ayudante-2026-11-26.md`. Carga solo la referencia que necesites. Esta skill aporta contexto e instrucciones; no reentrena el modelo.
