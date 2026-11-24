import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import { addEntity, loadEntities } from '../../src/storage.js';

const html = fs.readFileSync(fileURLToPath(new URL('../../index.html', import.meta.url)), 'utf8');

let dom;

function qs(id) { return document.getElementById(id); }

function isoDaysFromToday(days) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);
  const pad = n => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function setRawValue(id, value) {
  Object.defineProperty(qs(id), 'value', { configurable: true, get: () => value, set: () => {} });
}

function submit(formId) {
  qs(formId).dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true }));
}

beforeEach(() => {
  dom = new JSDOM(html, { url: 'http://localhost/' });
  const w = dom.window;
  globalThis.window = w;
  globalThis.document = w.document;
  globalThis.localStorage = w.localStorage;
  globalThis.alert = vi.fn();
  globalThis.confirm = vi.fn(() => true);
  w.scrollTo = vi.fn();
  w.localStorage.clear();
  document.body.dataset.userRole = 'inspector';
  document.body.dataset.userName = 'Ana';
});

afterEach(() => {
  dom.window.close();
});

async function bootWith() {
  vi.resetModules();
  const { initApp } = await import('../../src/app.js');
  await initApp();
}

describe('HU9 - seguimiento de fecha objetivo', () => {
  it('saves an optional target date with action type and responsible owner', async () => {
    await bootWith();
    qs('nav-entities').click();
    qs('name').value = 'Lote A';
    qs('code').value = 'LOTE-A';
    qs('targetDate').value = isoDaysFromToday(10);
    qs('actionType').value = 'Inspección';
    qs('responsible').value = 'Ana';
    submit('entity-form');

    const saved = loadEntities()[0];
    expect(saved.targetDate).toBe(isoDaysFromToday(10));
    expect(saved.actionType).toBe('Inspección');
    expect(saved.responsible).toBe('Ana');
    expect(saved.changeLog.some(entry => entry.user === 'Ana' && entry.field === 'targetDate')).toBe(true);
  });

  it('saves the record when the target date is left blank', async () => {
    await bootWith();
    qs('nav-entities').click();
    qs('name').value = 'Área A';
    qs('code').value = 'AREA-A';
    submit('entity-form');

    expect(loadEntities().length).toBe(1);
    expect(loadEntities()[0].targetDate).toBe('');
    expect(qs('error-targetDate').textContent).toBe('');
  });

  it('requires a responsible owner when a target date is set', async () => {
    await bootWith();
    qs('nav-entities').click();
    qs('name').value = 'Producto A';
    qs('code').value = 'PROD-A';
    qs('targetDate').value = isoDaysFromToday(10);
    submit('entity-form');

    expect(loadEntities().length).toBe(0);
    expect(qs('error-responsible').textContent).toContain('obligatorio');
  });

  it('shows status colors and sorts overdue records first and undated records last', async () => {
    addEntity({ name: 'Sin fecha', code: 'SIN', responsible: '' });
    addEntity({ name: 'Verde', code: 'VER', targetDate: isoDaysFromToday(8), responsible: 'Ana' });
    addEntity({ name: 'Amarillo', code: 'AMA', targetDate: isoDaysFromToday(0), responsible: 'Ana' });
    addEntity({ name: 'Rojo', code: 'ROJ', targetDate: isoDaysFromToday(-1), responsible: 'Ana' });
    addEntity({ name: 'Hecho', code: 'HEC', targetDate: isoDaysFromToday(-2), responsible: 'Ana', completed: true });
    await bootWith();

    const items = [...qs('tracking-list').querySelectorAll('li')];
    expect(items.map(item => item.textContent.split('(')[0].trim())).toEqual(['Rojo', 'Hecho', 'Amarillo', 'Verde', 'Sin fecha']);
    expect(items[0].className).toContain('status-rojo');
    expect(items[1].className).toContain('status-completada');
    expect(items[2].className).toContain('status-amarillo');
    expect(items[3].className).toContain('status-verde');
    expect(items[4].className).toContain('status-sin-fecha');
  });

  it('filters the tracking list by status', async () => {
    addEntity({ name: 'Verde', code: 'VER', targetDate: isoDaysFromToday(8), responsible: 'Ana' });
    addEntity({ name: 'Rojo', code: 'ROJ', targetDate: isoDaysFromToday(-1), responsible: 'Ana' });
    await bootWith();

    qs('tracking-status').value = 'rojo';
    qs('tracking-status').dispatchEvent(new dom.window.Event('change', { bubbles: true }));
    const items = [...qs('tracking-list').querySelectorAll('li')];
    expect(items.length).toBe(1);
    expect(items[0].textContent).toContain('Rojo');
  });

  it('rejects an invalid date with a clear error', async () => {
    await bootWith();
    qs('nav-entities').click();
    qs('name').value = 'Lote B';
    qs('code').value = 'LOTE-B';
    setRawValue('targetDate', '2026-13-45');
    qs('responsible').value = 'Ana';
    submit('entity-form');

    expect(loadEntities().length).toBe(0);
    expect(qs('error-targetDate').textContent).toContain('inválida');
  });

  it('asks for confirmation before saving a past date and cancels without changes', async () => {
    await bootWith();
    qs('nav-entities').click();
    qs('name').value = 'Lote C';
    qs('code').value = 'LOTE-C';
    qs('targetDate').value = isoDaysFromToday(-1);
    qs('responsible').value = 'Ana';

    globalThis.confirm = vi.fn(() => false);
    submit('entity-form');
    expect(loadEntities().length).toBe(0);
    expect(globalThis.confirm).toHaveBeenCalled();

    globalThis.confirm = vi.fn(() => true);
    submit('entity-form');
    expect(loadEntities().length).toBe(1);
    expect(loadEntities()[0].targetDate).toBe(isoDaysFromToday(-1));
  });

  it('lets read-only users view planning data but not edit it', async () => {
    document.body.dataset.userRole = 'consulta';
    addEntity({ name: 'Lote D', code: 'LOTE-D', targetDate: isoDaysFromToday(10), responsible: 'Ana' });
    await bootWith();

    expect(qs('readonly-notice')).not.toBeNull();
    expect(qs('tracking-list').textContent).toContain('Lote D');

    qs('nav-entities').click();
    expect(qs('targetDate').disabled).toBe(true);
    expect(qs('responsible').disabled).toBe(true);
    expect(qs('save-entity').disabled).toBe(true);
    submit('entity-form');
    expect(loadEntities().length).toBe(1);
  });
});
