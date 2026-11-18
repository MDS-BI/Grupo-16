# Auditoría de los feedbacks y evidencia — Grupo 16

**Corte:** 17/11/2026. **Alcance:** inspección de la rama original `main` mediante GitHub y construcción de una **copia funcional independiente**. La revisión no modifica `main`. El resultado no afirma que el repositorio original haya quedado corregido.

## Hallazgos observados en `main` del grupo

1. `index.html` importaba directamente `./src/app.js` y no el arranque de `src/main.js`; `QUALITY_CONFIG` existía pero `activeConfig` empezaba nulo. La pantalla mostraba «Módulo Base ERP».
2. `index.html` y el modelo conservaban RFC, límite de crédito, pagos, facturas y genéricos «Entidades/Documentos» en un proyecto que especificaba Gestión de Calidad.
3. `plan.md` describía un proyecto genérico de ventas y archivos `src/components/*` que no aparecían en la estructura consultada.
4. `tasks.md` contenía **115 tareas sin marcar** (115 `[ ]`, cero `[x]`) pese a que parte del trabajo existía.
5. `spec.md` aún presentaba **3 entradas de asignación pendiente** (HU2/3/4).
6. US11: «Estación dedicada de consulta, auditoría y trazabilidad» en especificación, pero «Buscar Entidades en una Pantalla Dedicada» en tareas.
7. En el código original existían siete categorías nominales en `QUALITY_CONFIG`, pero una implementación de dos entidades genéricas, por lo que no representaba plenamente relaciones producto-lote, inspección-NCR-CAPA.
8. Otras inconsistencias: el README original remitía a `erp_base_module:entities`, mientras que `src/storage.js` guardaba `quality-entities`; las pruebas históricas reclamaban IDs faltantes. La captura de la ejecución local mostraba 21 pruebas fallidas; esta cifra NO se atribuye a una ejecución nueva.
9. **Ramas:** `feature/configuracion-modulo` estaba atrás de `main`; `prueba_1_16` también; `modelo_1` divergía (4 commits ahead, 6 behind en la revisión). No se hizo merge.

## Respuesta por punto del feedback

| Punto | En la copia de revisión | Evidencia / límites |
|---|---|---|
| Historias con roles y criterios | **Hecho en copia** | `specs/.../spec.md`, 13 HU consolidadas |
| Asignación de todos los miembros | **Pendiente de decisión del equipo** | HU2/3/4 «responsable por confirmar»: nunca inventar personas |
| Crear tareas desde historias | **Hecho en copia** | `tasks.md`, tareas vinculadas a HU |
| Evitar inconsistencia US11 | **Hecho en copia** | US11 consulta y auditoría, mismo concepto en spec/tasks/plan |
| Estructura Spec Kit | **Hecho en copia** | `specs/.../` con spec, plan, tasks, research, quickstart, checklists, contracts |
| Corregir formulario genérico US1 | **Hecho en copia** | Siete catálogos y formularios por tipo. Sin RFC ni crédito |
| Estado NCR visible US12 | **Hecho en copia** | Tabla operativa muestra estado, validación de transiciones en `store.js` |
| Navegación según dominio US13 | **Hecho en copia** | Datos maestros, Registros operativos, Consulta y trazabilidad |
| Agregar datos simulados | **Hecho en copia** | `src/demo-data.js`, botón explícito «Cargar datos DEMO» |
| Mejorar interfaz y estilos | **Hecho en copia** | `src/styles.css` con dashboard, tarjetas, tablas, modal y diseño responsive |
| Integrar versión funcional | **Hecho para esta copia** | SPA autocontenida ejecutable con `npm run dev` |
| Registrar modificaciones e incrementos | **Documentado** | Esta auditoría; falta que el grupo traslade commits reales a su repo |
| Actualizar estado de tareas | **Hecho en tareas de copia** | Marcadas solo las verificables por código o test; no se alteró `tasks.md` original |
| Pruebas | **18 pruebas de dominio pasan** | `npm test` (Node test runner), sin Vitest; validación UI manual pendiente |
| Build | **Pasa** | `npm run build`, salida `dist/` |
| Integración de ramas históricas | **Pendiente** | No se hizo merge de `modelo_1`; requiere decisión grupal |

## Cambios funcionales implementados en la copia

- Panel con 4 KPIs y actividad; catálogos separados con CRUD y relaciones, validación de códigos y referencias; eliminación cascada con confirmación; inspecciones/NCR/CAPA y ciclo de vida; búsqueda global y trazabilidad por lote; datos DEMO; exportación JSON.
- Reemplazo de terminología genérica, interfaz responsive y etiquetas accesibles.
- Documentación alineada y plan de integración seguro.

## Riesgos y pendientes genuinos

1. Acordar que esta reimplementación reproduce **los criterios de evaluación exactos** de las 13 HU; algunas capacidades avanzadas de la especificación original (500 registros, auditorías enriquecidas, tipos de campos dinámicos universales) siguen siendo trabajo futuro.
2. Validación de usabilidad y pruebas UI end-to-end reales en navegadores distintos.
3. Confirmar asignaciones HU2/3/4 y tareas individuales; el profesor debe poder ver commits por integrante.
4. Revisar y resolver `modelo_1` y cualquier cambio de compañeros antes de integrar.
5. Si se decide sustituir el frontend original, reconciliar o retirar conscientemente las pruebas Vitest antiguas y sus contratos. No declarar que pasaron sin ejecutarlas.
6. Decidir cómo conservar identidad de módulos configurable conforme HU5/6; esta copia está dedicada a **Gestión de Calidad**, por lo que no valida el cambio de dominio a Ventas.

**Conclusión:** hay una versión de demostración presentable y verificable como copia aislada. **El repositorio compartido todavía requiere una integración revisada por el equipo.**
