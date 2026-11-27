# Plan de revisión — Control de Calidad

**Fecha:** 26/11/2026. **Base:** main 1ed152d y spec.md revisado.

## Arquitectura

Conservar Vite, JavaScript, HTML/CSS y los módulos tipados del equipo. Añadir servidor HTTP Node 24 con SQLite integrado (node:sqlite), contraseñas derivadas con scrypt, cookies HttpOnly/SameSite y tokens CSRF. El servidor obtiene el usuario de la sesión y ejecuta las operaciones existentes dentro de un contexto de persistencia SQLite. No confiar en roles enviados por el navegador.

Crear un adaptador de persistencia compartido para reutilizar storage.js, master-data.js y demo-data.js sin reescribir sus validaciones. En el navegador autenticado se hidrata una copia en memoria con el estado recibido de la API. Las mutaciones de la interfaz esperan la respuesta autorizada antes de refrescar. El adaptador local se conserva para las pruebas de dominio; no es una ruta de autorización de la aplicación desplegada.

## Incrementos

1. Actualizar historias y skill de dominio; regenerar solo tareas de la revisión desde T131, conservando tareas históricas.
2. Añadir SQLite, instalación inicial protegida, inicio/cierre de sesión y administración de cuentas sin usuarios de contraseña pública.
3. Integrar los formularios existentes con API; preservar maestros, documentos tipados, fechas e historial.
4. Añadir parámetros de HU7, evaluación de lecturas y órdenes con filtros de HU11.
5. Ampliar simulación aditiva; crear barras y Sankey con tablas equivalentes; retirar adornos.
6. Ejecutar pruebas nuevas y antiguas, lint, build y comprobación visual; marcar solo tareas demostradas.

## Datos

SQLite guarda cuentas y hashes, sesiones con verificador derivado, las claves de datos del modelo existente y auditoría. Directorio privado .local-data ignorado por Git y fuera de los archivos servidos. Las reglas guardan versión y cada inspección conserva una copia de límites/lecturas. Las órdenes referencian producto y lote. Referencias inválidas impiden guardar.

## Verificación

Probar 401 sin sesión, 403 con Auditor, CSRF/origen, expiración y revocación, límites inclusivos, valores fuera de rango, preservación de datos tras errores, idempotencia de simulación, filtros combinados y conservación de flujos del Sankey. No usar cuentas reales ni publicar información del usuario.

## Responsables

HU4: Coordinación de Calidad. HU5: Administración de Calidad. Son responsables funcionales escogidos por el usuario, no nuevos integrantes del grupo. Los demás nombres se conservan como referencia del trabajo previo.
