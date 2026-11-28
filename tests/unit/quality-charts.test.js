import { describe, it, expect } from 'vitest';
import { aggregateResults, buildSankey, layoutSankey, renderChartsMarkup } from '../../src/components/quality-charts.js';

function inspections() {
  return Array.from({ length: 19 }, (_, index) => ({ tipoDoc: 'Inspección', producto_id: index % 4, resultado: index % 3 ? 'ACEPTADO' : 'RECHAZADO', disposition: index % 3 ? 'LIBERADA' : index % 2 ? 'DESCARTE' : 'RETRABAJO' }));
}

describe('HU3 - gráficos de inspecciones', () => {
  it('cuenta cada inspección una vez sin incluir NCR ni cantidades producidas', () => {
    const records = [...inspections(), { tipoDoc: 'NCR', status: 'ABIERTA' }];
    records[0].quantity = 10000;
    expect(aggregateResults(records).reduce((sum, row) => sum + row.count, 0)).toBe(19);
    const graph = buildSankey(records);
    expect(graph.total).toBe(19);
    for (const stage of ['producto-resultado', 'resultado-disposicion']) expect(graph.flows.filter(flow => flow.stage === stage).reduce((sum, flow) => sum + flow.count, 0)).toBe(19);
  });

  it('conserva los anchos de entrada y salida de cada nodo, con enlaces hacia la siguiente columna', () => {
    const layout = layoutSankey(buildSankey(inspections()));
    for (const column of layout.nodes) {
      expect(column.reduce((sum, node) => sum + node.count, 0)).toBe(19);
      for (const node of column) {
        expect(node.height).toBeCloseTo(node.count * layout.scale);
        if (node.column > 0) expect(node.incoming).toBeCloseTo(node.height);
        if (node.column < 2) expect(node.outgoing).toBeCloseTo(node.height);
        expect(node.y).toBeGreaterThan(20);
        expect(node.y + node.height).toBeLessThan(layout.height);
      }
    }
    for (const link of layout.links) {
      expect(link.x0).toBeLessThan(link.x1);
      expect(link.thickness).toBeCloseTo(link.count * layout.scale);
      expect(Number.isFinite(link.y0) && Number.isFinite(link.y1)).toBe(true);
    }
  });

  it('incluye resultados heredados desconocidos sin perder flujos', () => {
    const graph = buildSankey([{ tipoDoc: 'Inspección', status: 'REGISTRADA' }]);
    expect(graph.balanced).toBe(true);
    expect(layoutSankey(graph).nodes[1][0].name).toBe('SIN RESULTADO');
    expect(graph.flows[1].to).toBe('Pendiente de dictamen');
  });

  it('ofrece tablas equivalentes y escapa las etiquetas de productos', () => {
    const markup = renderChartsMarkup([{ tipoDoc: 'Inspección', resultado: 'ACEPTADO', productName: '<img src=x onerror=alert(1)>' }]);
    expect(markup.match(/<table/g)).toHaveLength(2);
    expect(markup).toContain('&lt;img');
    expect(markup).not.toContain('<img');
    expect(markup).toContain('1 inspecciones');
  });

  it('no inventa porcentajes ni dibuja flujos cuando no hay datos', () => {
    const markup = renderChartsMarkup([]);
    expect(markup).not.toContain('<svg');
    expect(markup).not.toMatch(/\d+%/);
  });
});
