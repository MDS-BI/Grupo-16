# Inicio rápido — Módulo de Gestión de Calidad

## Configuración

1. Instale las dependencias con `npm install`.
2. Inicie el servidor de desarrollo con `npm run dev`.
3. Abra la URL local de Vite en el navegador.

## Flujo de usuario principal

1. Aterrice en el panel y revise los indicadores de maestros, operativos, NCR abiertas y CAPA pendientes.
2. Use una acción rápida o la barra lateral para abrir **Datos maestros** o **Registros operativos**.
3. Cree, edite o elimine productos, lotes, áreas, empleados, inspecciones, NCR y CAPA.
4. En **Consulta y trazabilidad**, busque por cualquier valor y revise la relación Producto → Lote → Inspección/NCR → CAPA.
5. Cargue datos DEMO o exporte un respaldo JSON desde la barra superior.

## Validación

- Los campos obligatorios muestran errores y bloquean el guardado.
- Los códigos no pueden repetirse dentro del mismo tipo.
- Las relaciones (producto de un lote, lote de una inspección/NCR, NCR de una CAPA) deben existir.
- La caducidad de un lote no puede ser anterior a su fabricación.
- Las transiciones de NCR siguen la matriz ABIERTA → EN_INVESTIGACION → EN_CAPA → CERRADA/RECHAZADA.
- La fecha objetivo de los datos maestros es opcional, pero debe ser una fecha válida.
- Los campos personalizados obligatorios y sus tipos se validan antes de guardar.

## Extender el módulo

Edite `src/module-config.js` para cambiar el nombre del módulo, las etiquetas de navegación, el color de acento, el ciclo de vida o los campos personalizados. No es necesario modificar `src/store.js` ni `src/app.js` para declarar campos adicionales.

## Pruebas

```bash
npx vitest run
npm run build
```
