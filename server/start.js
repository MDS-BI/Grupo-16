import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createQualityService } from './service.js';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const production = process.argv.includes('--production');
const port = Number(process.env.PORT || 5180);
const host = process.env.HOST || '127.0.0.1';
const publicOrigin = process.env.PUBLIC_ORIGIN || '';
if (!['127.0.0.1', 'localhost', '::1'].includes(host) && !publicOrigin.startsWith('https://')) {
  throw new Error('Para escuchar fuera del computador local, configura PUBLIC_ORIGIN con una dirección HTTPS.');
}
const dataDir = resolve(process.env.QUALITY_DATA_DIR || resolve(root, '.local-data'));
const service = createQualityService({ dataDir, secureCookies: publicOrigin.startsWith('https://'), publicOrigin });
const vite = production ? null : await (await import('vite')).createServer({
  root,
  server: { middlewareMode: true, fs: { deny: ['**/.local-data/**', '**/.git/**', '**/.env*', '**/*.sqlite*', '**/codigo-instalacion.txt'] } },
  appType: 'spa'
});
const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json' };
const server = http.createServer(async (req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'same-origin');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' ws: wss:; object-src 'none'; base-uri 'none'; frame-ancestors 'none'");
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (/(?:^|\/)\.(?:local-data|git)(?:\/|$)|(?:^|\/)\.env|\.sqlite(?:-|$)|codigo-instalacion/.test(pathname)) {
      res.writeHead(404); res.end('No disponible.'); return;
    }
    if (await service.handle(req, res)) return;
    if (vite) { vite.middlewares(req, res); return; }
    if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); res.end(); return; }
    const dist = resolve(root, 'dist');
    let path = resolve(dist, `.${pathname}`);
    if (!path.startsWith(dist + sep) && path !== dist) { res.writeHead(404); res.end(); return; }
    try { if (!(await stat(path)).isFile()) path = resolve(dist, 'index.html'); }
    catch { if (extname(path)) { res.writeHead(404); res.end(); return; } path = resolve(dist, 'index.html'); }
    const bytes = await readFile(path);
    res.writeHead(200, { 'Content-Type': `${types[extname(path)] || 'application/octet-stream'}; charset=utf-8` });
    res.end(req.method === 'HEAD' ? undefined : bytes);
  } catch { if (!res.headersSent) res.writeHead(500); res.end('No se pudo abrir el recurso.'); }
});
server.listen(port, host, () => {
  console.log(`Gestión de Calidad: http://${host}:${port}`);
  console.log(`Base de datos privada: ${dataDir}`);
  if (service.bootstrapPath && !service.db.prepare('SELECT id FROM users LIMIT 1').get()) console.log(`Primer acceso: utiliza el código local de ${service.bootstrapPath}`);
});
async function shutdown() {
  server.close(async () => { if (vite) await vite.close(); service.close(); process.exit(0); });
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
