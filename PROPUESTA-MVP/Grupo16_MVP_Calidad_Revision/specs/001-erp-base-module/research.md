# Decisiones técnicas y justificación

- Almacenamiento local elegido para simplificar la demostración sin servicio externo. Limitación: no sincroniza computadores.
- IDs estables por tipo y referencias explícitas para trazabilidad; campos obligatorios y validación por operación.
- Una única fuente de datos para panel, filtros, lista y auditoría evita inconsistencias de recuentos.
- Eliminación confirmada en cascada para demostrar integridad sin registros huérfanos.
- Datos DEMO identificables, reponibles y exportables. Se evita sembrar datos silenciosamente.
- Rediseño visual adaptado a Gestión de Calidad; no es sistema de producción.
- Pruebas con Node integrado, sin instalar dependencias, para que cualquier integrante reproduzca resultados.
