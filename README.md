# Grupo 16 — MVP de Gestión de Calidad

Aplicación web estática (Vite + JavaScript) para el módulo de Gestión de Calidad del proyecto ERP. Gestiona siete catálogos con trazabilidad:

- **Datos maestros**: Productos, Lotes, Áreas organizativas, Empleados.
- **Registros operativos**: Inspecciones, No conformidades (NCR), Acciones CAPA.

Incluye validación de campos obligatorios, códigos únicos por tipo, integridad referencial, eliminación en cascada con confirmación, ciclo de vida de NCR, búsqueda global, trazabilidad Producto → Lote → Inspección/NCR → CAPA, datos DEMO, exportación JSON y persistencia en `localStorage`.

## Ejecutar

```bash
npm install
npm run dev
```

Abrir la URL que imprime Vite (por defecto http://localhost:5173).

## Pruebas y compilación

```bash
npm test          # Vigila cambios
npx vitest run    # Ejecución única
npm run build     # Genera dist/
```

La suite cubre el dominio (19 pruebas), la configuración y campos personalizados (6) y un smoke test del DOM (3).

## Configuración

`src/module-config.js` define el nombre del módulo, etiquetas de navegación, color de acento, ciclo de vida y campos personalizados. Los tipos de campo admitidos son `text`, `number`, `decimal`, `date`, `select` y `boolean`. Sin configuración se usan los valores integrados de Gestión de Calidad.

## Datos

Todos los datos son simulados y permanecen solo en el navegador. No hay backend, autenticación ni uso productivo.
