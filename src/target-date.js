export const ACTION_TYPES = ['Inspección', 'Reinspección', 'Calibración', 'Auditoría', 'Capacitación'];

export const TRACKING_STATUSES = ['verde', 'amarillo', 'rojo', 'completada', 'sin-fecha'];

export const STATUS_LABELS = {
  verde: 'Verde',
  amarillo: 'Amarillo',
  rojo: 'Rojo',
  completada: 'Completada',
  'sin-fecha': 'Sin fecha'
};

function toUTCDate(value) {
  if (value === undefined || value === null || String(value).trim() === '') return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value));
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const utc = Date.UTC(year, month - 1, day);
  const check = new Date(utc);
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) {
    return null;
  }
  return utc;
}

export function isValidTargetDate(value) {
  return toUTCDate(value) !== null;
}

export function validateTargetDate(value) {
  if (value === undefined || value === null || String(value).trim() === '') return null;
  return isValidTargetDate(value) ? null : 'Fecha objetivo inválida';
}

export function daysUntilTargetDate(value, today = new Date()) {
  const target = toUTCDate(value);
  if (target === null) return null;
  const base = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((target - base) / 86400000);
}

export function isPastTargetDate(value, today = new Date()) {
  const days = daysUntilTargetDate(value, today);
  return days !== null && days < 0;
}

export function normalizeCompleted(value) {
  return value === true || value === 1 || value === '1' || String(value).toLowerCase() === 'true';
}

export function getTargetDateStatus(record, today = new Date()) {
  if (!record) return 'sin-fecha';
  if (normalizeCompleted(record.completed)) return 'completada';
  const days = daysUntilTargetDate(record.targetDate, today);
  if (days === null) return 'sin-fecha';
  if (days < 0) return 'rojo';
  if (days <= 7) return 'amarillo';
  return 'verde';
}

export function formatTargetDate(value) {
  const parsed = toUTCDate(value);
  if (parsed === null) return value || '';
  const date = new Date(parsed);
  const pad = n => String(n).padStart(2, '0');
  return `${pad(date.getUTCDate())}/${pad(date.getUTCMonth() + 1)}/${date.getUTCFullYear()}`;
}

export function compareByTargetDate(a, b, today = new Date()) {
  const dateA = toUTCDate(a && a.targetDate);
  const dateB = toUTCDate(b && b.targetDate);
  if (dateA === null && dateB === null) return 0;
  if (dateA === null) return 1;
  if (dateB === null) return -1;

  const statusA = getTargetDateStatus(a, today);
  const statusB = getTargetDateStatus(b, today);
  const overdueA = statusA === 'rojo' ? 0 : 1;
  const overdueB = statusB === 'rojo' ? 0 : 1;
  if (overdueA !== overdueB) return overdueA - overdueB;
  return dateA - dateB;
}

export function sortTrackingRecords(records, sortBy = 'date', today = new Date()) {
  const copy = Array.isArray(records) ? [...records] : [];
  if (sortBy === 'name') {
    return copy.sort((a, b) => String((a && (a.displayName || a.name)) || '').localeCompare(String((b && (b.displayName || b.name)) || '')));
  }
  return copy.sort((a, b) => compareByTargetDate(a, b, today));
}

export function filterByStatus(records, status, today = new Date()) {
  if (!status || status === 'todos') return Array.isArray(records) ? [...records] : [];
  return (records || []).filter(record => getTargetDateStatus(record, today) === status);
}
