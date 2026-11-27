export class QualityValidationError extends Error {
  constructor(message, fields = {}) { super(message); this.fields = fields; this.status = 422; }
}

export function validateParameter(data) {
  const errors = {};
  for (const key of ['name', 'productId', 'unit']) {
    if (typeof data[key] !== 'string' || !data[key].trim()) errors[key] = 'Este dato es obligatorio.';
  }
  for (const key of ['min', 'max']) {
    if (data[key] === '' || data[key] === null || data[key] === undefined || !Number.isFinite(Number(data[key]))) {
      errors[key] = 'Introduce un límite numérico válido.';
    }
  }
  if (!errors.min && !errors.max && Number(data.min) > Number(data.max)) errors.max = 'El máximo debe ser mayor o igual al mínimo.';
  if (Object.keys(errors).length) throw new QualityValidationError('Revisa los límites del parámetro.', errors);
  return { name: data.name.trim(), productId: data.productId, unit: data.unit.trim(), min: Number(data.min), max: Number(data.max), active: data.active !== false };
}

export function evaluateMeasurements(parameters, measurements = {}) {
  if (!parameters.length) throw new QualityValidationError('Define al menos un parámetro activo para este producto antes de inspeccionarlo.');
  const errors = {};
  const results = parameters.map(parameter => {
    const raw = measurements[parameter.id];
    if ((typeof raw !== 'string' && typeof raw !== 'number') || String(raw).trim() === '' || !Number.isFinite(Number(raw))) {
      errors[parameter.id] = `Introduce una lectura numérica para ${parameter.name} (${parameter.unit}).`;
    }
    const value = Number(raw);
    return { ...parameter, value, passed: Number.isFinite(value) && value >= parameter.min && value <= parameter.max };
  });
  if (Object.keys(errors).length) throw new QualityValidationError('Faltan mediciones o hay valores inválidos.', errors);
  const deviations = results.filter(result => !result.passed);
  return {
    passed: deviations.length === 0,
    results,
    deviations,
    message: deviations.length ? deviations.map(result => `${result.name}: ${result.value} ${result.unit}; se esperaba entre ${result.min} y ${result.max} ${result.unit}.`).join(' ') : 'Todas las mediciones están dentro de los límites.'
  };
}

export const ORDER_STATUSES = ['PENDIENTE', 'EN_INSPECCION', 'LIBERADA', 'RECHAZADA', 'RETRABAJO'];

export function isCalendarDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}

export function filterOrders(orders, filters = {}) {
  const q = String(filters.query || '').toLocaleLowerCase('es').trim();
  return orders.filter(order =>
    (!q || [order.number, order.productName, order.lotNumber, order.responsible].some(value => String(value || '').toLocaleLowerCase('es').includes(q))) &&
    (!filters.productId || order.productId === filters.productId) &&
    (!filters.lotId || order.lotId === filters.lotId) &&
    (!filters.status || order.status === filters.status) &&
    (!filters.from || order.dueDate >= filters.from) &&
    (!filters.to || order.dueDate <= filters.to)
  );
}

export function ordersCsv(orders) {
  const cell = value => {
    let text = String(value ?? '');
    if (/^[\s]*[=+\-@\t\r]/.test(text)) text = `'${text}`;
    return `"${text.replaceAll('"', '""')}"`;
  };
  return [['Orden', 'Producto', 'Lote', 'Cantidad', 'Responsable', 'Fecha objetivo', 'Estado'],
    ...orders.map(order => [order.number, order.productName, order.lotNumber, order.quantity, order.responsible, order.dueDate, order.status])]
    .map(row => row.map(cell).join(',')).join('\r\n');
}
