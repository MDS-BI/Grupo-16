# Plan de Implementación: Panel de inicio ERP para el Gestor de Calidad (HU3)

**Rama**: `003-gestor-calidad-dashboard` | **Fecha**: 2026-11-25 | **Especificación**: [spec.md](spec.md)

**Entrada**: Especificación de la funcionalidad desde `/specs/003-gestor-calidad-dashboard/spec.md`

## Resumen

Refinar y verificar el panel de inicio de la HU3 para el Gestor de Calidad: cuatro KPIs calculados desde `localStorage` con reglas de conteo explícitas, acciones rápidas separadas en maestros y operativos con formularios limpios, y accesos directos a gestión de catálogos y búsqueda global con autofocus. El panel es una vista de solo lectura construida sobre el código existente (`src/components/dashboard.js`, `src/app.js`, `src/styles.css`), sin nuevas claves de persistencia ni backend. Las reglas ambiguas de la especificación original ("lotes activos", "del mes o totales", "NCR/CAPA abiertas") quedan definidas en `research.md` y `data-model.md`, y se validan con pruebas unitarias y de integración.

## Contexto Técnico

**Lenguaje/Versión**: JavaScript ES2022 (módulos ESM), HTML5, CSS3; Node.js 24.20.0 disponible (README exige ≥24.15)

**Dependencias Principales**: Vite 8.2.1, Vitest 4.1.10, jsdom 30.0.1, ESLint 9.39.5, Prettier 3.10.1; sin framework de interfaz

**Almacenamiento**: `localStorage` del navegador (`quality-lots`, `quality-products`, `quality-areas`, `quality-employees`, `quality-documents`, `quality-users`, `quality-session`); el panel solo lee

**Pruebas**: Vitest para pruebas unitarias (`tests/unit/`) y de integración DOM con jsdom (`tests/integration/`); `node --test` para `tests/demo-smoke.mjs`

**Plataforma Objetivo**: Navegadores modernos de escritorio y móviles (Vite SPA)

**Tipo de Proyecto**: Aplicación web de una sola página (frontend únicamente)

**Objetivos de Rendimiento**: Recálculo de KPIs y navegación correctos con al menos 500 registros; sin re-renderizados innecesarios al entrar al panel

**Restricciones**: Sin backend, sin autenticación real (roles simulados), huella mínima de dependencias, persistencia local, terminación y colores derivados de `src/module-config.js`; la HU3 ya está implementada en `main`, por lo que se ajusta el código existente en incrementos pequeños

**Escala/Alcance**: Una vista (panel) con 4 KPIs, 7 acciones rápidas y 2 accesos de navegación, para 4 perfiles de usuario

## Verificación de la Constitución

*COMPROBACIÓN: Debe pasar antes de la investigación de la Fase 0. Reverificar tras el diseño de la Fase 1.*

- **I. Calidad y mantenibilidad**: La lógica de conteo se concentra en una función pura (`dashboardCounts`) en `src/components/dashboard.js`; la renderización y la navegación permanecen en límites separados, con nombres y formatos coherentes con el código existente. Sin abstracciones nuevas que no resuelvan una necesidad.
- **II. Prueba primero y verificación**: Se escriben pruebas unitarias para los conteos y pruebas de integración para el panel, permisos, autofocus y navegación antes de ajustar la implementación; ninguna tarea se marca completa sin ejecutar `npx vitest run`.
- **III. Consistencia de experiencia de usuario**: Las etiquetas vienen de la configuración, se conservan los estados vacíos y los mensajes en español, `aria-current="page"` señala el módulo activo y el diseño adaptable se mantiene desde `src/styles.css`.
- **IV. Rendimiento y fiabilidad**: Los KPIs se calculan en una sola pasada sobre las listas cargadas, se recalculan solo al mostrar el panel y no escriben en almacenamiento; el costo es lineal con el número de registros (O(n)).
- **Estándares de calidad y flujo de desarrollo**: `npm run lint`, `npm run format:check` y `npm run build` se ejecutan como comprobaciones; los cambios se documentan en este plan y en los contratos; la verificación se registra en `quickstart.md`.

No hay violaciones de la constitución que requieran justificación.

## Estructura del Proyecto

### Documentación (esta funcionalidad)

```text
specs/003-gestor-calidad-dashboard/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── dashboard-ui.md
│   └── kpi-counts.md
└── tasks.md             # generado por /speckit.tasks, no por /speckit.plan
```

### Código Fuente (raíz del repositorio)

```text
index.html                          # marcado del panel: KPIs, grupos de acciones y accesos
src/
├── app.js                          # cableado de acciones rápidas, navegación y recálculo al mostrar panel
├── components/
│   └── dashboard.js                # definiciones de KPIs/acciones, dashboardCounts y renderizado
├── module-config.js                # etiquetas y color de acento (sin cambios de estructura)
├── permissions.js                  # can() / requiredPermission() para gating de botones
└── styles.css                      # grid de KPIs, grupos de acciones, responsive y estados vacíos
tests/
├── unit/
│   └── dashboard.test.js           # pureza y reglas de dashboardCounts
├── integration/
│   └── dashboard.test.js           # render, autofocus, permisos y navegación
└── demo-smoke.mjs                  # comprobación independiente de datos de ejemplo
```

**Decisión de Estructura**: Se mantiene el proyecto Vite único con JavaScript vanilla y persistencia en `localStorage`. No se crean carpetas ni dependencias nuevas: el panel ya existe en `src/components/dashboard.js` y se ajusta in situ. La lógica de negocio de los conteos se aísla como función pura para poder probarla sin DOM; la interfaz y el cableado siguen en `dashboard.js` y `app.js` respectivamente. Los contratos de UI y de conteos se documentan en `contracts/` para que las pruebas de integración y unitarias tengan una referencia estable.

## Seguimiento de Complejidad

Este plan no introdujo violaciones de la constitución.
