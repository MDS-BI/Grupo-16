# Contrato del servidor local

El servidor usa el mismo origen que la página. El actor se obtiene de una cookie de sesión HttpOnly; las operaciones con cambios requieren `Origin` válido y `X-CSRF-Token`. El verificador de la sesión se almacena derivado en SQLite. Ni los roles enviados por el navegador ni sus datos de localStorage conceden acceso.

| Ruta | Uso |
| --- | --- |
| `GET /api/session` | Indica si se necesita instalación o devuelve sesión autenticada, configuración y estado autorizado. |
| `POST /api/setup` | Primer Administrador con código local, usuario, nombre y contraseña. No vuelve a abrirse después de instalar. |
| `POST /api/login`, `POST /api/logout` | Abrir/cerrar sesión; el inicio no acepta un rol elegido por el visitante. |
| `POST /api/password` | Cambiar la contraseña propia comprobando la actual y revocando sesiones anteriores. |
| `GET /api/state` | Copia autorizada de maestros, documentos, parámetros, órdenes y auditoría; sin hashes ni secretos. |
| `POST /api/actions` | Operaciones de dominio enumeradas con `action` y `args`. No permite ejecutar funciones arbitrarias. |
| `POST /api/users`, `PATCH /api/users/:id` | Crear cuenta, asignar perfil y activar/desactivar; solo Administrador. |
| `GET /api/config`, `PUT /api/config` | Consultar configuración y modificar sus etiquetas/identidad con permiso de Administrador. |

Las acciones disponibles son las funciones de dominio existentes `addEntity`, `updateEntity`, `deleteEntity`, `addMaster`, `updateMaster`, `deleteMaster`, `addDocument`, `updateDocument`, `deleteDocument`, más `saveParameter`, `saveOrder` y `seedDemo`. El servidor verifica permisos y relaciones antes de confirmar la transacción. Los parámetros y órdenes se consultan desde el estado autorizado, en lugar de duplicar un controlador por cada tabla.

Una lectura faltante o inválida devuelve 422 sin registros parciales. Una lectura válida fuera de tolerancia se guarda como rechazo y devuelve `alert` con su explicación. Las inspecciones conservan `parameterEvaluation.results` con nombre, límites, unidad y versión usados. Un cambio posterior de configuración no reescribe esa evidencia.

El modo local de los módulos de dominio se conserva para regresión de pruebas. El punto de entrada de la página siempre exige la API autenticada y nunca usa ese modo como alternativa cuando falla el servidor.
