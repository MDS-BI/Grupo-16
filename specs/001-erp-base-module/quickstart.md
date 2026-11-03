# Inicio Rápido: Módulo Base de Software de Planificación de Recursos Empresariales (ERP)

## Configuración

1. Instale las dependencias con `npm install`.
2. Inicie el servidor de desarrollo con `npm run dev`.
3. Abra la URL local de Vite en un navegador.

## Flujo de Usuario Principal

1. Aterrice en el panel de inicio del auditor interno y use una acción rápida (registrar área auditada, registrar hallazgo o no conformidad, gestionar áreas y hallazgos o buscar).
2. Cree un área auditada usando el formulario, incluida su fecha de vencimiento.
3. Registre un hallazgo o no conformidad asociado al área.
4. Busque un área o hallazgo usando la pantalla de búsqueda.
5. Edite o elimine un área o hallazgo desde el área de gestión.
6. Cambie entre módulos usando la barra lateral; actualice la página para confirmar que las áreas y hallazgos persisten en el almacenamiento local y que el marco con marca (logotipo, nombre del módulo) permanece consistente.

## Validación

- Verifique que los campos obligatorios muestran errores de validación.
- Verifique que un documento exige folio entero positivo y que el descuento no puede superar el subtotal.
- Verifique que un correo electrónico con formato inválido se rechaza con una explicación.
- Verifique que los resultados de búsqueda se actualizan a medida que el usuario escribe.
- Verifique que la lista permanece consistente tras las acciones de edición y eliminación.
- Verifique que los indicadores de cumplimiento del panel coinciden con las áreas y hallazgos almacenados.
- Verifique que las áreas vencidas y próximas a vencer aparecen en la sección de alertas ordenadas por criticidad.
- Verifique que un área sin fecha de vencimiento se muestra como “sin plazo definido”.

## Extender el Módulo Base

Los módulos ERP personalizados adaptan la base mediante un único archivo de configuración (`src/module-config.js`) en lugar de editar el código central:

1. Establezca el nombre del módulo y los mapeos de términos (p. ej., Entidad → Cliente, Documento → Pedido de Venta); cada pantalla se reetiqueta, incluida la barra lateral y el logotipo.
2. Declare campos personalizados por tipo de registro (texto, número, fecha, selección) — aparecen automáticamente en formularios, listas, validación y búsqueda.
3. Defina el ciclo de vida de estados de documentos y las transiciones permitidas (p. ej., cotización → pedido → facturado).
4. Opcionalmente establezca `theme.accentColor` para remarcar los resaltados y controles principales de todo el espacio de trabajo.
5. Añada reglas de validación específicas del módulo junto a las reglas base donde sea necesario.

La generación de identidad, marcas de tiempo, integridad referencial entre entidades y documentos, eliminación en cascada, navegación y búsqueda siguen siendo gestionadas por el módulo base. Sin archivo de configuración, la aplicación se ejecuta con el comportamiento predeterminado Entidad/Documento. Consulte `specs/001-erp-base-module/` para la especificación completa.
