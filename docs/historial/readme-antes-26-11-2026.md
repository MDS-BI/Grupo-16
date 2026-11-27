# Gestión de Calidad — Grupo 16

MVP ERP de calidad con Vite y JavaScript. Incluye catálogos de áreas, empleados, productos y lotes; registros operativos tipados, búsqueda, seguimiento de fechas y cuatro perfiles de acceso. La persistencia es local al navegador y el selector de usuarios simula roles: no es autenticación segura.

## Ejecutar la copia

Usar Node.js 24.15 o superior dentro de la rama 24 (compatible con las dependencias actuales).

```bash
npm ci
npm run dev -- --port 5180 --strictPort
```

Abrir http://localhost:5180 para aislar el almacenamiento del proyecto habitual. En el panel, como administrador, pulsar **Cargar datos de ejemplo**. No se borran registros existentes.

```bash
npx vitest run
npm run build
node --test tests/demo-smoke.mjs
```

La sección siguiente conserva la documentación histórica de la base ERP y sus campos de compatibilidad; no todos corresponden a la interfaz de calidad actual.

# ERP Software Base Module (Vite + Vanilla JS)

Minimal single-page app serving as an Enterprise Resource Planning (ERP) software base module. It provides the common foundation for building custom ERP modules: master data management (Entities) and linked transactional documents (Documents) with create/edit/delete/search, validation, and browser localStorage persistence — using Vite and vanilla HTML, CSS, and JavaScript.

The user interface is fully in **Spanish** (default terms: Entidad / Documento; module name: Módulo Base ERP), including labels, validation messages, empty states, and dialogs.

Entities carry standard ERP master-data fields (name, code, tax ID, email, phone, address, category, target date, credit limit, payment terms). Documents use series + folio numbering and carry a monetary breakdown (subtotal, discount, tax, total), currency, payment terms, notes, quantity, dates, and status.

The app presents itself as a coherent ERP workspace:

- **Workspace shell** — every screen lives inside a branded chrome: a top bar with a logo (an SVG monogram derived from the module name) and module name, plus a persistent sidebar of module buttons (Panel, Entidades, Documentos, Búsqueda). The active module is highlighted (`aria-current="page"`), and the sidebar collapses to an icon rail on narrow viewports.
- **Home dashboard** — the entry screen offers quick-action buttons for key ERP tasks (new entity, new document, open management areas, find records) and live statistic cards showing record counts.
- **Design tokens** — styling is driven by CSS custom properties in `src/styles.css`, so branding changes apply globally.

## Setup

Install dependencies and run the dev server:

```bash
npm install
npm run dev
```

Open http://localhost:5173 (or the URL Vite prints).

## Tests

Run the full test suite (unit + integration) with:

```bash
npm test
```

Or a one-off run without watch mode:

```bash
npx vitest run
```

## Building Custom Modules

Custom ERP modules built on this base define:

- What an **Entity** represents (e.g., customer, product, asset) plus domain-specific fields.
- What a **Document** represents (e.g., order, invoice, contract).
- Module-specific labels and validation rules.

The base module handles identity generation, timestamps, referential integrity between entities and documents, cascade deletion, navigation, and search. See `specs/001-erp-base-module/` for the full specification.

## Tailoring via Configuration

All tailoring lives in one place: the `userConfig` object at the top of `src/module-config.js`. Developers edit this single export; no core code changes are required. Available knobs:

- `moduleName` — display name shown in the top bar, dashboard, and document title; also derives the logo monogram.
- `labels` — rename Entity/Document terms across every screen, including sidebar buttons, quick actions, forms, and messages. Spanish articles and agreements (el/la, seleccionado/a) are derived from the first word of each configured term.
- `customFields` — declare extra fields per record type with `target` (`entity` or `document`), `key`, `label`, `type` (`text`, `number`, `decimal`, `boolean`, `date`, `select`, or `enum`), optional `required`, and `options` for `select`/`enum`. Keys must not collide with base field names (see `specs/001-erp-base-module/data-model.md`). Values persist alongside records and appear in search results.
- `statusLifecycle` — restrict document statuses to a configured list of `statuses` with permitted `transitions` between them. Without it, status stays a free-form field.
- `statusLifecycleByType` — define an independent lifecycle per operational document type (`NCR`, `Inspección`, `Auditoría`, `CAPA`, `Queja`, `Evaluación`). The status control only offers valid next transitions for the current record.
- `theme.accentColor` — a hex color (e.g., `"#0f62fe"`) applied across the shell as highlights and primary controls. Invalid values fall back to the default.

If the configuration is invalid (unknown types, bad keys, transitions referencing unknown statuses, non-hex accent colors), the app shows the problems in a banner and falls back to defaults instead of breaking.

## Calidad: espacio de trabajo, panel y tematización

- **Marco del espacio de trabajo**: `src/components/shell.js` genera el monograma SVG del módulo aplica las etiquetas configuradas a los botones de la barra lateral y resalta el módulo activo con `aria-current="page"`. La vista de administración de usuarios y roles se añade solo para perfiles con `manage-permissions`.
- **Panel de inicio**: cuatro KPIs en vivo (lotes activos, productos registrados, inspecciones realizadas y hallazgos NCR/CAPA abiertos), acciones rápidas separadas para datos maestros y registros operativos, y accesos a catálogos y búsqueda global.
- **Datos maestros y documentos tipados**: el módulo persiste Áreas, Empleados, Productos y Lotes en claves propias y gestiona NCR, Inspecciones, Auditorías, CAPA, Quejas y Evaluaciones con campos y transiciones específicas por tipo.
- **Tematización**: `theme.accentColor` se aplica como propiedad CSS `--accent`; los tokens de color, espaciado y tipografía viven en `src/styles.css`. Si el valor es inválido se conserva el tema integrado.
- **Roles y permisos**: `src/permissions.js` define el catálogo y la matriz de Administrador, Gestor de Calidad, Inspector de Planta y Auditor. Los usuarios y la sesión activa se guardan en `quality-users` y `quality-session`.

## Notes

- Data is persisted in `localStorage`: `quality-entities`, `quality-documents`, `quality-areas`, `quality-employees`, `quality-products`, `quality-lots`, `quality-users`, `quality-session`, plus the `quality-models` index.
- Deleting an entity also deletes its documents; deleting an Area removes its Employees and deleting a Product removes its Lots (cascade).
- Linting/formatting: `npm run lint`, `npm run lint:fix`, `npm run format`, and `npm run format:check`.
- This project intentionally uses vanilla HTML, CSS, and JavaScript for simplicity.
