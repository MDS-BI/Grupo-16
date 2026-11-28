import { escapeHtml } from './html.js';

const RESULT_LABELS = { ACEPTADO: 'Aceptado', RECHAZADO: 'Rechazado', CONDICIONADO: 'Condicionado' };
const DISPOSITIONS = ['LIBERADA', 'RETRABAJO', 'DESCARTE', 'Pendiente de dictamen'];
const PALETTE = ['#1f6f78', '#356c9b', '#5b6f9c', '#6f6b91', '#47796b', '#85704f'];

export function inspectionDocuments(documents = []) {
  return documents.filter(doc => doc && (doc.tipoDoc === 'Inspección' || doc.documentType === 'Inspección'));
}

export function resultOf(document) {
  const value = String(document.resultado || document.status || '').toUpperCase();
  return Object.hasOwn(RESULT_LABELS, value) ? value : 'SIN RESULTADO';
}

export function dispositionOf(document) {
  const value = String(document.disposition || '').toUpperCase();
  if (DISPOSITIONS.slice(0, 3).includes(value)) return value;
  return resultOf(document) === 'ACEPTADO' ? 'LIBERADA' : 'Pendiente de dictamen';
}

export function productLabel(document, products = []) {
  const id = document.producto_id || document.productId || '';
  const product = products.find(row => (row.producto_id || row.id) === id);
  return String(product?.descripcion || product?.nombre || document.productName || id || 'Producto no identificado');
}

export function aggregateResults(documents = []) {
  const counts = { ACEPTADO: 0, RECHAZADO: 0, CONDICIONADO: 0, 'SIN RESULTADO': 0 };
  for (const document of inspectionDocuments(documents)) counts[resultOf(document)] += 1;
  return Object.entries(counts).map(([result, count]) => ({ result, label: RESULT_LABELS[result] || result, count }));
}

export function buildSankey(documents = [], products = []) {
  const inspections = inspectionDocuments(documents);
  const firstStage = new Map();
  const secondStage = new Map();
  for (const document of inspections) {
    const product = productLabel(document, products);
    const result = resultOf(document);
    const disposition = dispositionOf(document);
    const firstKey = `${product}\u0000${result}`;
    const secondKey = `${result}\u0000${disposition}`;
    firstStage.set(firstKey, (firstStage.get(firstKey) || 0) + 1);
    secondStage.set(secondKey, (secondStage.get(secondKey) || 0) + 1);
  }
  const toFlows = (map, stage) => [...map.entries()].map(([key, count]) => {
    const [from, to] = key.split('\u0000');
    return { stage, from, to, count };
  });
  const flows = [...toFlows(firstStage, 'producto-resultado'), ...toFlows(secondStage, 'resultado-disposicion')];
  const totals = new Map();
  for (const flow of flows) {
    totals.set(flow.from, (totals.get(flow.from) || 0) + flow.count);
    totals.set(flow.to, (totals.get(flow.to) || 0) + flow.count);
  }
  const stageTotals = stage => flows.filter(flow => flow.stage === stage).reduce((sum, flow) => sum + flow.count, 0);
  const balanced = stageTotals('producto-resultado') === stageTotals('resultado-disposicion') && stageTotals('producto-resultado') === inspections.length;
  return { total: inspections.length, flows, totals: Object.fromEntries(totals), balanced };
}

function svgText(x, y, content, anchor = 'start') {
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="11" fill="#18304a">${escapeHtml(content)}</text>`;
}

export function renderBarsSvg(rows) {
  const width = 640;
  const height = 240;
  const left = 24;
  const bottom = 200;
  const max = Math.max(1, ...rows.map(row => row.count));
  const slot = rows.length ? (width - left * 2) / rows.length : 0;
  const barWidth = Math.min(96, Math.max(24, slot * 0.6));
  const bars = rows.map((row, index) => {
    const barHeight = row.count === 0 ? 0 : Math.max(3, Math.round(row.count / max * 150));
    const x = left + slot * index + (slot - barWidth) / 2;
    return `<rect x="${x.toFixed(1)}" y="${bottom - barHeight}" width="${barWidth.toFixed(1)}" height="${barHeight}" fill="${PALETTE[index % PALETTE.length]}"></rect>` +
      svgText(x + barWidth / 2, bottom - barHeight - 6, String(row.count), 'middle') +
      svgText(x + barWidth / 2, bottom + 16, row.label, 'middle');
  }).join('');
  return `<svg class="chart-svg" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="bars-chart-title"><title id="bars-chart-title">Inspecciones por resultado</title>${bars}</svg>`;
}

// One shared scale and independent incoming/outgoing offsets preserve flow widths.
export function layoutSankey(graph) {
  const stages = ['producto-resultado', 'resultado-disposicion'];
  const first = graph.flows.filter(flow => flow.stage === stages[0]);
  const second = graph.flows.filter(flow => flow.stage === stages[1]);
  const names = [
    [...new Set(first.map(flow => flow.from))],
    [...new Set(first.map(flow => flow.to))],
    [...new Set(second.map(flow => flow.to))]
  ];
  const maxNodes = Math.max(1, ...names.map(column => column.length));
  const height = Math.max(360, 90 + maxNodes * 60);
  const top = 56, bottom = 24, gap = 26;
  const scale = graph.total ? (height - top - bottom - gap * (maxNodes - 1)) / graph.total : 0;
  const xs = [20, 490, 960];
  const nodes = names.map((column, index) => {
    const source = index === 2 ? second : first;
    const key = index === 0 ? 'from' : 'to';
    const counts = column.map(name => source.filter(flow => flow[key] === name).reduce((sum, flow) => sum + flow.count, 0));
    const occupied = counts.reduce((sum, count) => sum + count * scale, 0) + gap * Math.max(0, column.length - 1);
    let y = top + (height - top - bottom - occupied) / 2;
    return column.map((name, position) => {
      const node = { name, column: index, x: xs[index], y, width: 14, height: counts[position] * scale, count: counts[position], incoming: 0, outgoing: 0 };
      y += node.height + gap;
      return node;
    });
  });
  const links = graph.flows.map(flow => {
    const index = stages.indexOf(flow.stage);
    const source = nodes[index].find(node => node.name === flow.from);
    const target = nodes[index + 1].find(node => node.name === flow.to);
    const thickness = flow.count * scale;
    const link = { ...flow, x0: source.x + source.width, x1: target.x, y0: source.y + source.outgoing + thickness / 2, y1: target.y + target.incoming + thickness / 2, thickness };
    source.outgoing += thickness;
    target.incoming += thickness;
    return link;
  });
  return { nodes, links, width: 1000, height, scale };
}

export function renderSankeySvg(graph) {
  if (!graph.flows.length) return '';
  const layout = layoutSankey(graph);
  const paths = layout.links.map(link => {
    const middle = (link.x0 + link.x1) / 2;
    const result = link.stage === 'producto-resultado' ? link.to : link.from;
    const color = result === 'ACEPTADO' ? '#287b73' : result === 'RECHAZADO' ? '#a65a49' : '#69778b';
    const d = ['M', link.x0, link.y0, 'C', middle, link.y0, middle, link.y1, link.x1, link.y1].join(' ');
    return '<path d="' + d + '" fill="none" stroke="' + color + '" stroke-opacity="0.42" stroke-width="' + link.thickness + '"><title>' + escapeHtml(link.from + ' a ' + link.to + ': ' + link.count + ' inspecciones') + '</title></path>';
  }).join('');
  const nodes = layout.nodes.flatMap(column => column.map(node => {
    const anchor = node.column === 0 ? 'start' : node.column === 1 ? 'middle' : 'end';
    const x = node.column === 2 ? node.x + node.width : node.x;
    const label = node.name.length > 39 ? node.name.slice(0, 37) + '…' : node.name;
    return '<rect x="' + node.x + '" y="' + node.y + '" width="' + node.width + '" height="' + node.height + '" fill="#29485e"><title>' + escapeHtml(node.name) + '</title></rect>' + svgText(x, node.y - 7, label + ' (' + node.count + ')', anchor);
  })).join('');
  const headings = ['Producto', 'Resultado', 'Disposición'].map((name, index) => svgText([20, 490, 974][index], 18, name, index === 0 ? 'start' : index === 1 ? 'middle' : 'end')).join('');
  return '<svg class="chart-svg sankey" viewBox="0 0 ' + layout.width + ' ' + layout.height + '" role="img" aria-labelledby="sankey-chart-title"><title id="sankey-chart-title">Flujo de inspecciones: producto, resultado y disposición. Unidad: inspecciones.</title>' + headings + paths + nodes + '</svg>';
}

export function renderChartsMarkup(documents = [], products = []) {
  const bars = aggregateResults(documents);
  const graph = buildSankey(documents, products);
  if (!graph.total) {
    return '<p class="empty-state">No hay inspecciones registradas. No se muestran porcentajes ni flujos estimados.</p>';
  }
  const barsTable = `<table class="data-table"><caption>Inspecciones por resultado</caption><thead><tr><th>Resultado</th><th>Inspecciones</th></tr></thead><tbody>${bars.map(row => `<tr><td>${escapeHtml(row.label)}</td><td>${row.count}</td></tr>`).join('')}</tbody></table>`;
  const flows = graph.flows.map(flow => `<tr><td>${escapeHtml(flow.stage === 'producto-resultado' ? 'Producto a resultado' : 'Resultado a disposición')}</td><td>${escapeHtml(flow.from)}</td><td>${escapeHtml(flow.to)}</td><td>${flow.count}</td></tr>`).join('');
  const flowsTable = `<table class="data-table"><caption>Flujos de inspecciones</caption><thead><tr><th>Etapa</th><th>Origen</th><th>Destino</th><th>Inspecciones</th></tr></thead><tbody>${flows}</tbody></table>`;
  const balance = graph.balanced ? `Total conservado: ${graph.total} inspecciones.` : 'Los totales no coinciden; revisa los registros.';
  return `<div class="chart-card"><h3>Inspecciones por resultado</h3>${renderBarsSvg(bars)}${barsTable}</div>
    <div class="chart-card"><h3>Producto, resultado y disposición</h3>${renderSankeySvg(graph)}<p class="hint">${escapeHtml(balance)}</p>${flowsTable}</div>`;
}
