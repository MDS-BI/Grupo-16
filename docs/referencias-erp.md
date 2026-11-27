# Ejemplos consultados para el módulo de calidad

Consulta: 26/11/2026. Estas referencias sirven para justificar el diseño; no implican que el proyecto sea una copia ni una implementación completa de esos ERP.

| Ejemplo oficial | Qué se tomó como referencia | Aplicación en G16 |
| --- | --- | --- |
| [Odoo: puntos de control de calidad](https://www.odoo.com/documentation/19.0/applications/inventory_and_mrp/quality/quality_management/quality_control_points.html) | Separar la definición de controles de su ejecución sobre un producto u operación. | Catálogo de parámetros por producto y registro de inspecciones por lote. |
| [ERPNext: inspección de calidad](https://docs.frappe.io/erpnext/quality-inspection) | Definir criterios mínimo/máximo y comparar lecturas numéricas con ellos. | Intervalos inclusivos, resultado calculado y alerta cuando una medición queda fuera del rango. |

Los valores de ejemplo de G16 son ficticios y ajustables por el equipo; no se presentan como tolerancias oficiales de Odoo, ERPNext ni de una norma industrial.

## Referencias técnicas

- [Node: SQLite](https://nodejs.org/docs/latest-v24.x/api/sqlite.html): persistencia del servidor con el módulo integrado disponible en Node 24.
- [Node: criptografía](https://nodejs.org/docs/latest-v24.x/api/crypto.html): derivación de contraseñas con sal y generación de secretos aleatorios.
- [OWASP: gestión de sesiones](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html): cookies HttpOnly/SameSite, expiración, revocación y protección de solicitudes. El servidor local funciona en loopback; una publicación externa requiere HTTPS.
- [OpenCode: skills](https://opencode.ai/docs/skills/): instrucciones reutilizables en `.opencode/skills/`; aportan contexto al agente, sin reentrenar el modelo.
