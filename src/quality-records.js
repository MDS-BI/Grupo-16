// HU2 / HU10: reglas de los registros de calidad, sin modificar userConfig.
export const ENTITY_TYPES = { AREA: 'Área organizativa', EMPLEADO: 'Empleado', PRODUCTO: 'Producto', LOTE: 'Lote' };
export const DOCUMENT_TYPES = { INSPECCION: 'Inspección de calidad', NCR: 'No conformidad (NCR)', CAPA: 'Acción CAPA', AUDITORIA: 'Auditoría', QUEJA: 'Queja', EVALUACION: 'Evaluación' };
export const QUALITY_FIELDS = {
  INSPECCION: [
    { key: 'inspectionType', label: 'Tipo de inspección', options: ['RECEPCION', 'PROCESO', 'FINAL'], required: true },
    { key: 'inspectionResult', label: 'Resultado', options: ['ACEPTADO', 'RECHAZADO', 'CONDICIONADO'], required: true },
    { key: 'inspectedQuantity', label: 'Unidades inspeccionadas', type: 'number' },
    { key: 'rejectedQuantity', label: 'Unidades rechazadas', type: 'number' }
  ],
  NCR: [
    { key: 'origin', label: 'Origen del hallazgo', required: true },
    { key: 'severity', label: 'Gravedad', options: ['BAJA', 'MEDIA', 'ALTA', 'CRITICA'], required: true },
    { key: 'finding', label: 'Descripción del hallazgo', required: true }
  ],
  CAPA: [
    { key: 'actionType', label: 'Tipo de acción', options: ['CORRECTIVA', 'PREVENTIVA'], required: true },
    { key: 'actionDescription', label: 'Acción a realizar', required: true },
    { key: 'responsible', label: 'Responsable de ejecución', required: true },
    { key: 'dueDate', label: 'Fecha compromiso', type: 'date', required: true }
  ]
};

const text = value => String(value ?? '').trim();
const empty = value => value === undefined || value === null || text(value) === '';
const own = (object, key) => Object.hasOwn(object, key);
export const qualityFieldsFor = type => own(QUALITY_FIELDS, type) ? QUALITY_FIELDS[type] : [];

export function entityQualityValues(data){
  return {
    entityType: text(data.entityType) || undefined,
    areaId: data.entityType === 'EMPLEADO' ? text(data.areaId) : undefined,
    productId: data.entityType === 'LOTE' ? text(data.productId) : undefined
  };
}

export function entityQualityErrors(data, entities){
  const errors = {};
  if(data.entityType && !own(ENTITY_TYPES, data.entityType)) errors.entityType = 'Selecciona un tipo de dato maestro válido';
  const relation = data.entityType === 'EMPLEADO' ? ['areaId', 'AREA', 'Área organizativa'] : data.entityType === 'LOTE' ? ['productId', 'PRODUCTO', 'Producto'] : null;
  if(relation){
    const [key, type, label] = relation;
    if(!entities.some(e => e.id !== data.id && e.entity_id === data[key] && e.entityType === type)) errors[key] = `${label}: selecciona un registro existente`;
  }
  return errors;
}

export function documentQualityValues(data){
  const result = { recordType: text(data.recordType) || undefined };
  // Limpiar campos de un tipo anterior al cambiar, sin borrar los campos configurados.
  for(const field of Object.values(QUALITY_FIELDS).flat()) result[field.key] = undefined;
  for(const field of qualityFieldsFor(data.recordType)){
    if(!empty(data[field.key])) result[field.key] = field.type === 'number' ? Number(data[field.key]) : text(data[field.key]);
  }
  return result;
}

export function documentQualityErrors(data, isValidDate){
  const errors = {};
  if(data.recordType && !own(DOCUMENT_TYPES, data.recordType)) errors.recordType = 'Selecciona un tipo de registro válido';
  for(const field of qualityFieldsFor(data.recordType)){
    const value = data[field.key];
    if(empty(value)){
      if(field.required) errors[field.key] = `${field.label} es obligatorio`;
      continue;
    }
    if(field.options && !field.options.includes(value)) errors[field.key] = `${field.label}: selecciona una opción válida`;
    if(field.type === 'number' && (!Number.isInteger(Number(value)) || Number(value) < 0)) errors[field.key] = `${field.label} debe ser un entero no negativo`;
    if(field.type === 'date' && !isValidDate(value)) errors[field.key] = `${field.label} debe ser una fecha válida`;
  }
  if(data.recordType === 'INSPECCION'){
    if(!empty(data.rejectedQuantity) && empty(data.inspectedQuantity)) errors.inspectedQuantity = 'Indica las unidades inspeccionadas para registrar rechazos';
    if(Number(data.rejectedQuantity) > Number(data.inspectedQuantity)) errors.rejectedQuantity = 'Las unidades rechazadas no pueden superar las inspeccionadas';
  }
  if(data.recordType === 'CAPA' && !errors.dueDate && data.dueDate < data.startDate) errors.dueDate = 'La fecha compromiso debe ser igual o posterior al inicio';
  return errors;
}

export function cascadeEntities(entities, id){
  const root = entities.find(e => e.id === id);
  const ids = new Set(root ? [root.entity_id] : []);
  // Relaciones dirigidas: Área -> Empleado, Producto -> Lote.
  for(const entity of entities){
    if((root?.entityType === 'AREA' && entity.entityType === 'EMPLEADO' && entity.areaId === root.entity_id)
      || (root?.entityType === 'PRODUCTO' && entity.entityType === 'LOTE' && entity.productId === root.entity_id)) ids.add(entity.entity_id);
  }
  return entities.filter(e => ids.has(e.entity_id));
}
