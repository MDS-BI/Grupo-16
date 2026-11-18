# Cómo integrar sin perder el trabajo de los compañeros

1. No reemplazar `main` directamente ni pegar la copia encima de la carpeta compartida.
2. En GitHub Desktop: **Fetch origin → Branch → New branch** desde la última `main` (por ejemplo `revision-calidad-mvp`).
3. Mantener respaldo: descargar ZIP del repositorio original y guardar capturas del historial.
4. Comparar esta copia con el repositorio: `src/` (interfaz y almacenamiento), `index.html`, `specs/`, `tests/`; conservar documentación y commits genuinos del grupo. No forzar merge de `modelo_1`.
5. Integrar por etapas: primero documentación/terminología, después modelo, después interfaz, después pruebas.
6. Ejecutar tanto `npm test` de esta copia como pruebas de la rama destino; las pruebas Vitest de la versión anterior no son equivalentes a las nuevas pruebas de dominio.
7. Presentar un pull request de revisión con descripción de cambios, riesgos, capturas y pruebas; solicitar aprobación a los integrantes responsables.
8. Hacer merge solo cuando el equipo confirme que las historias y el feedback quedaron cubiertos en la **versión integrada real**.

## Qué mostrar en la presentación

- Pantalla inicial con indicadores (datos DEMO cargados).
- Producto → lote → inspección/NCR → CAPA en «Consulta y trazabilidad».
- Crear un nuevo registro y ver cómo cambia el contador.
- Demostrar una NCR y una transición permitida; luego una transición inválida.
- Mostrar los casos de prueba automatizados y `npm run build`.
- Explicar honestamente las diferencias con el código original y los pendientes de integración.

## Nota de compatibilidad

Esta copia reconstruida funciona con un esquema `grupo16:gestion-calidad:v1`; no migra automáticamente los registros antiguos `quality-entities`/`quality-documents` porque la estructura del dominio es diferente. Se requiere migración explícita para conservar datos anteriores.
