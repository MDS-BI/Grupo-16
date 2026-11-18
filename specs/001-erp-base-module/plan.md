# Plan de implementación — Gestión de Calidad · Grupo 16 (revisión)

## Objetivo
MVP de gestión de calidad para la planta: datos maestros (Productos, Lotes, Áreas, Empleados) y registros operativos (Inspecciones, NCR, CAPA), con trazabilidad, validación, navegación coherente, datos simulados y pruebas.

## Plataforma
Aplicación web estática JavaScript ES2022, HTML/CSS, Node.js (servidor de desarrollo y pruebas), almacenamiento `localStorage`. Sin dependencias externas. Sin autenticación ni backend; alcance solo demostración académica.

## Arquitectura
- `src/store.js`: modelo, validaciones, integridad, ciclo de estados y operaciones.
- `src/app.js`: renderizado de vistas, formularios, navegación, búsqueda y panel.
- `src/demo-data.js`: datos ficticios con claves y relaciones coherentes.
- `src/module-config.js`: configuración, etiquetas, campos personalizados y ciclo de vida.
- `src/styles.css`: componentes visuales, responsive y accesibilidad de foco.
- `index.html`: punto de entrada, sin scripts legacy.
- `tests/store.test.mjs`, `tests/config.test.mjs`, `tests/app.test.mjs`: suite de dominio, configuración y humo de interfaz.

## Contratos
- CRUD a través de `upsert`, `remove`, `search` y `readDB`/`writeDB`.
- Siete catálogos con códigos únicos por tipo, IDs internos estables y claves foráneas validadas.
- Si una entidad tiene dependientes, eliminar requiere confirmación explícita y cascada.
- NCR sigue transiciones autorizadas, con estado actual visible.
- Datos DEMO solo se cargan mediante acción del usuario; si hay datos, solicita confirmación de reemplazo.

## Criterios de aceptación MVP
1. Crear, editar, eliminar y buscar siete tipos de registros.
2. Prohibir duplicados, relaciones inexistentes y transiciones inválidas.
3. Mostrar contadores consistentes y estados de NCR.
4. Mostrar relaciones por lote.
5. Ejecutar pruebas y generar build.
6. Producir evidencia de acuerdo con feedback 16/11.

## Fuera de alcance por ahora
Gestión empresarial multiusuario, base de datos central, permisos, firma de auditoría, migración del modelo antiguo, informes regulatorios, CI/CD público y cobertura end-to-end de navegador.

**Estado:** implementado en la raíz del repositorio; el módulo genérico Entidad/Documento quedó reemplazado por este MVP de Gestión de Calidad.
