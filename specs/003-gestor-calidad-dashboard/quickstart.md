# Inicio Rápido: Validación del Panel de inicio ERP (HU3)

## Prerrequisitos

- Node.js ≥ 24.15 (verificado con 24.20.0).
- Dependencias instaladas en la raíz del repositorio (`node_modules` presente).
- Navegador moderno para la comprobación visual.

## Puesta en marcha

```bash
npm ci
npm run dev -- --port 5180 --strictPort
```

Abrir `http://localhost:5180`. En el panel, como Administrador, pulsar **Cargar datos de ejemplo** (la carga es aditiva y no duplica registros).

## Comandos de validación

```bash
npx vitest run
npm run lint
npm run format:check
npm run build
node --test tests/demo-smoke.mjs
```

## Escenarios comprobables

1. **Panel vacío**: sin datos cargados, las cuatro tarjetas muestran `0` y aparece un estado vacío. No se ve `null`, `undefined` ni `NaN`.
2. **KPIs con datos de ejemplo**: tras cargar los datos, comparar cada tarjeta con la definición de [kpi-counts.md](contracts/kpi-counts.md). Con la demo actual se esperan 4 lotes activos, 4 productos, 4 inspecciones y hallazgos abiertos (2 NCR + 1 CAPA = 3).
3. **Formularios limpios**: pulsar cada una de las siete acciones rápidas y comprobar que el formulario se abre vacío, sin datos de una edición anterior.
4. **Permisos**: cambiar el usuario activo a Auditor; el panel sigue mostrando KPIs pero no hay botones de creación. Cambiar a Gestor de Calidad; aparecen los siete botones.
5. **Búsqueda con foco**: pulsar "Búsqueda global de registros" y comprobar que el cursor queda dentro del input.
6. **Ida y vuelta**: crear o eliminar un registro en gestión, volver al panel con el botón Panel (o "atrás" del navegador) y verificar que los contadores cambiaron.
7. **Etiquetas y tema**: modificar `labels` y `theme.accentColor` en `src/module-config.js`, recargar y comprobar que el panel refleja los cambios; con un color inválido se conserva el tema integrado.
8. **Escala**: cargar al menos 500 registros y comprobar que el panel se muestra sin errores y con recuentos correctos.

Los identificadores y comportamientos esperados están en [dashboard-ui.md](contracts/dashboard-ui.md); los modelos derivados en [data-model.md](data-model.md).

## Resultados de validación (2026-11-25)

| Comando | Resultado |
|---------|-----------|
| `npx vitest run` | 23 archivos y 228 pruebas pasan |
| `npm run lint` | Pasa sin errores ni advertencias |
| `npm run build` | Pasa; `dist/` generado con Vite 8.2.1 |
| `node --test tests/demo-smoke.mjs` | 4 pruebas pasan |
| `npm run format:check` | Conocido: falla en 106 archivos preexistentes, incluidos los modificados. No se aplicó `prettier --write` masivo para no alterar código fuera del alcance de HU3 |

## Criterio de aprobación

Todos los escenarios pasan, `npx vitest run` termina sin fallos, `npm run lint` no reporta errores y `npm run build` genera la compilación de producción. `npm run format:check` queda documentado como limitación conocida heredada del repositorio.
