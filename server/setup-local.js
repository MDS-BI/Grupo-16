// Explicit local-only initialization. Passwords are freshly generated for each
// installation and written only to the ignored private data directory.
import { randomBytes } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

if (process.env.PUBLIC_ORIGIN) throw new Error('La preparación de cuentas simuladas solo se usa en el computador local.');
const origin = `http://127.0.0.1:${Number(process.env.PORT || 5180)}`;
const directory = resolve(process.env.QUALITY_DATA_DIR || '.local-data');
let cookie = '', csrf = '';
async function request(path, body) {
  const response = await fetch(`${origin}/api${path}`, {
    method: body ? 'POST' : 'GET',
    headers: { Origin: origin, ...(body ? { 'Content-Type': 'application/json' } : {}), ...(cookie ? { Cookie: cookie } : {}), ...(csrf ? { 'X-CSRF-Token': csrf } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {})
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || 'No se pudo completar la instalación local.');
  if (response.headers.get('set-cookie')) cookie = response.headers.get('set-cookie').split(';')[0];
  if (payload.csrf) csrf = payload.csrf;
  return payload;
}
if (!(await request('/session')).setupRequired) {
  console.log('La instalación ya tiene cuentas. No se cambió ninguna contraseña ni registro.');
} else {
  const accounts = [
    ['admin.calidad', 'Administración de Calidad', 'Administrador'],
    ['gestor.calidad', 'Coordinación de Calidad', 'Gestor de Calidad'],
    ['inspector.planta', 'Inspección de Planta', 'Inspector de Planta'],
    ['auditor.calidad', 'Auditoría de Calidad', 'Auditor']
  ].map(([username, name, role]) => ({ username, name, role, password: randomBytes(24).toString('base64url') }));
  const setupToken = (await readFile(resolve(directory, 'codigo-instalacion.txt'), 'utf8')).trim();
  await request('/setup', { ...accounts[0], setupToken });
  // Persist credentials as each account is created, so an interrupted setup
  // never leaves the only administrator without a recoverable first password.
  const privatePath = resolve(directory, 'cuentas-locales.txt');
  const saved = [];
  const persist = async account => {
    saved.push(account);
    await writeFile(privatePath, 'CUENTAS LOCALES DEL PROYECTO G16\nArchivo privado: no subir a GitHub ni compartir como código.\nContraseñas aleatorias, exclusivas de esta instalación.\n\n' + saved.map(row => `${row.name} (${row.role})\nUsuario: ${row.username}\nContraseña: ${row.password}\n`).join('\n'), { mode: 0o600 });
  };
  await persist(accounts[0]);
  for (const account of accounts.slice(1)) { await request('/users', account); await persist(account); }
  const demo = await request('/actions', { action: 'seedDemo', args: [] });
  await request('/logout', {});
  console.log(`Cuentas creadas y ${demo.result.added} registros ficticios cargados. Credenciales privadas en: ${privatePath}`);
}
