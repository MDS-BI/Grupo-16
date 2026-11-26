# Contrato de Cálculo de KPIs (HU3)

## Firma

```text
dashboardCounts(entities: Array, documents: Array) -> {
  areas: number, employees: number, products: number, lots: number,
  activeLots: number, inspections: number, openFindings: number
}
```

Implementado como exportación pura de `src/components/dashboard.js`. No accede a `localStorage`, no muta los argumentos y no depende del DOM. `entities` acepta registros maestros con `masterType` explícito; `app.js` construye esa lista únicamente con `MASTER_TYPES.flatMap(type => loadMasters(type).map(row => ({ ...row, masterType: type })))` para no contar dos veces las filas heredadas de `quality-entities`.

## Clasificación

- **Maestros**: se reconoce `Área` por `masterType`/`tipoItem`/`name`/`code`/`nombre`/`descripcion` que contenga `area` o `área`; `Empleado` por `emple`; `Producto` por `product`; `Lote` por `lote` o `lot`.
- **Operativos**: `Inspección` por `tipoDoc`/`type`/`docType`/`status` que contenga `inspe`; hallazgo (NCR/CAPA) por `ncr`, `capa` o `no conform`.
- La comparación es insensible a mayúsculas. Los valores no string se convierten con `String(valor || '')`.

## Reglas de conteo

| Contador | Regla |
|----------|-------|
| `areas`, `employees`, `products`, `lots` | Un incremento por registro clasificado en cada categoría |
| `activeLots` | Incremento por lote con `activo !== false` y `estado`/`status` sin `inactivo`, `inactive` ni `cerrado` |
| `inspections` | Un incremento por documento clasificado como inspección, sin filtro de fecha ni estado |
| `openFindings` | Incremento por NCR/CAPA con `status` sin `cerrad`, `rechazad`, `resuelt`, `closed`, `resolved`, `complet`, `done` ni `cancel` |

## Invariantes

1. Todos los valores son enteros ≥ 0.
2. Con listas vacías, el resultado es `{ areas: 0, employees: 0, products: 0, lots: 0, activeLots: 0, inspections: 0, openFindings: 0 }`.
3. `0 ≤ activeLots ≤ lots` y `0 ≤ openFindings ≤` total de hallazgos.
4. Llamar dos veces con las mismas listas produce el mismo resultado y no altera las listas.
5. Un `status` ausente, `null` o desconocido cuenta como abierto; un lote sin estado cuenta como activo.

## Ejemplos

| Entrada | Resultado relevante |
|---------|---------------------|
| Sin registros | Todos los contadores en `0` |
| 2 lotes, uno con `activo: false` | `lots: 2`, `activeLots: 1` |
| 3 inspecciones con estados distintos | `inspections: 3` |
| 1 NCR `ABIERTA`, 1 CAPA `CERRADA` | `openFindings: 1` |
| 1 NCR con `status: null` | `openFindings: 1` |

## Consumidores

- `src/app.js`: usa `activeLots`, `products`, `inspections` y `openFindings` para actualizar `#stat-*`.
- `tests/unit/dashboard.test.js`: verifica reglas e invariantes.
- `tests/integration/dashboard.test.js`: verifica que los valores del contrato llegan al DOM.
