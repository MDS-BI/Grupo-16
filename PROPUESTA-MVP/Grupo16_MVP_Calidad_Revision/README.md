# Grupo 16 — MVP de Gestión de Calidad (copia de revisión)

> **Copia funcional independiente y reconstruida para revisión, NO es un clon byte a byte de `main` ni un merge del repositorio original.** Las referencias de origen son `MDS-BI/Grupo-16`, `spec.md`, `tasks.md`, `plan.md`, `feedback.md` (avances del 26/10, 02/11 y 16/11/2026). No se modificó el GitHub del grupo. El objetivo es disponer de una versión ejecutable que corrija los puntos funcionales más visibles del feedback y sirva de base controlada para integrar el trabajo real, sin borrar la historia del repositorio.

**Repositorio de origen:** https://github.com/MDS-BI/Grupo-16

## Ejecutar (Windows / Mac / Linux)

Requisito: Node.js 20 o superior. **No requiere `npm install`, Vite ni conexión a Internet.**

```bash
npm run dev
```

Abrir http://localhost:5173/ .

```bash
npm test
npm run build
```

`npm test` ejecuta pruebas de dominio, integridad referencial, búsquedas, datos simulados, validaciones, ciclos de estado y eliminación en cascada. `npm run build` genera `dist/` para publicar. Para iniciar en otro puerto: `PORT=5174 npm run dev` (PowerShell: `$env:PORT=5174; npm run dev`).

## Funcionalidades incluidas

- Panel con indicadores en tiempo real y accesos rápidos.
- **Datos maestros**: productos, lotes, áreas organizativas, empleados; con atributos propios y relaciones producto/lote, área/empleado.
- **Registros operativos**: inspecciones, no conformidades NCR y acciones CAPA, cada uno con formulario propio y relaciones explícitas.
- Crear, listar, editar, eliminar con confirmación y cascada, validaciones, búsqueda local y control de duplicados.
- Ciclo NCR con transiciones válidas; indicadores de NCR abiertas y CAPA pendientes.
- Consulta global y trazabilidad por lote: producto → lote → inspecciones/NCR → CAPA.
- Botón «Cargar datos DEMO»: genera información ficticia y **solo sobrescribe la base local tras confirmación** si ya había registros.
- Exportar respaldo JSON para presentar evidencia o recuperar datos manualmente.
- Pantalla adaptable a móviles, navegación accesible, etiquetas de Gestión de Calidad.

## Límites y pendientes

- **No incluye backend ni usuarios reales**: los datos persisten en `localStorage` de cada navegador. No es apto para producción ni para control de calidad regulado.
- Los test incluidos son **18 pruebas automatizadas de lógica de dominio**. Hay que validar la interacción completa en navegador por parte del grupo. **No se ejecutaron las pruebas Vitest históricas del repositorio original contra esta reimplementación**: utilizan un HTML y un modelo ERP diferente.
- Para publicar dentro del repositorio del grupo deben comparar cuidadosamente esta copia con la rama principal y reconciliar decisiones en `spec.md`, `tasks.md` y modelo ER. No copiar sin revisión sobre `main`.
- La rama original `modelo_1` diverge de `main`; no se integró para evitar conflictos y pérdida de trabajo.
- Responsables de US2, US3, US4 deben confirmarse con el grupo: no se inventaron nombres.

## Archivos guía

- `feedback.md`: feedback original transcrito de la revisión del repo.
- `docs/AUDITORIA_Y_CAMBIOS.md`: seguimiento uno a uno y evidencia.
- `docs/GUIA_INTEGRACION.md`: incorporación segura al repositorio original.
- `specs/001-erp-base-module/spec.md`: historias consolidadas y pruebas de aceptación.
- `specs/001-erp-base-module/tasks.md`: tareas de esta **copia**, con criterios verificables.
- `specs/001-erp-base-module/plan.md`: plan técnico y decisiones.

## Acerca de los datos

Todos los registros creados por «Cargar datos DEMO» son **simulados**. Los nombres de personal, proveedores y eventos no representan procesos reales ni datos de la empresa. Las pruebas del código también crean datos en memoria, sin enviar nada a un servidor.
