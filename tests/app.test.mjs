// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';

beforeAll(async () => {
  const html = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8');
  const body = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1] ?? '';
  document.body.innerHTML = body.replace(/<script[\s\S]*?<\/script>/gi, '');
  localStorage.clear();
  window.scrollTo = () => {};
  await import('../src/app.js');
});

describe('aplicación de calidad', () => {
  it('renderiza el marco, panel y métricas iniciales', () => {
    expect(document.title).toBe('Gestión de Calidad');
    expect(document.querySelector('.brand strong').textContent).toBe('Gestión de Calidad');
    expect(document.getElementById('metric-maestros').textContent).toBe('0');
    expect(document.getElementById('metric-operativos').textContent).toBe('0');
    expect(document.querySelectorAll('[data-page]')).toHaveLength(4);
  });

  it('ofrece los siete catálogos en los selectores', () => {
    const master = [...document.querySelectorAll('#master-type option')].map(o => o.value);
    const operations = [...document.querySelectorAll('#operation-type option')].map(o => o.value);
    expect(master).toEqual(['producto', 'lote', 'area', 'empleado']);
    expect(operations).toEqual(['inspeccion', 'ncr', 'capa']);
  });

  it('navega a datos maestros y muestra su estado vacío', () => {
    document.querySelector('[data-page="maestros"]').click();
    expect(document.getElementById('page-maestros').hidden).toBe(false);
    expect(document.getElementById('current-page').textContent).toBe('Datos maestros');
    expect(document.getElementById('master-table').textContent).toMatch(/Aún no hay registros/);
  });
});
