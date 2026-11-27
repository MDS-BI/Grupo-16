import { randomBytes, randomUUID, scrypt, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';
import { ROLES } from '../src/permissions.js';

const derive = promisify(scrypt);
export const secret = () => randomBytes(32).toString('hex');
export const hashToken = token => createHash('sha256').update(String(token)).digest('hex');
const passwordOptions = { N: 32768, r: 8, p: 3, maxmem: 64 * 1024 * 1024 };

export function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const first = Buffer.from(a), second = Buffer.from(b);
  return first.length === second.length && timingSafeEqual(first, second);
}

export function publicUser(row) {
  return row ? { id: row.id, username: row.username, name: row.name, role: row.role, active: Boolean(row.active) } : null;
}

export async function passwordHash(password, salt = secret()) {
  if (typeof password !== 'string' || password.length < 12 || password.length > 128) {
    const error = new Error('La contraseña debe tener entre 12 y 128 caracteres.'); error.status = 422; throw error;
  }
  const result = await derive(password, salt, 64, passwordOptions);
  return { salt, hash: result.toString('hex') };
}

export async function verifyPassword(password, row) {
  if (!row || typeof password !== 'string' || password.length > 128) return false;
  const result = await derive(password, row.salt, 64, passwordOptions);
  return safeEqual(result.toString('hex'), row.password_hash);
}

export function validateAccount(data) {
  if (typeof data.username !== 'string' || !/^[a-z0-9][a-z0-9._-]{2,39}$/i.test(data.username)) {
    const error = new Error('El usuario debe tener de 3 a 40 letras, números, puntos, guiones o guiones bajos.'); error.status = 422; throw error;
  }
  if (typeof data.name !== 'string' || !data.name.trim() || data.name.length > 80 || !ROLES.includes(data.role)) {
    const error = new Error('Indica un nombre y un perfil válido.'); error.status = 422; throw error;
  }
}

export async function insertAccount(db, data, { authorize } = {}) {
  validateAccount(data);
  const password = await passwordHash(data.password);
  // Password derivation yields to other requests. Recheck authorization before
  // committing the account, since its creator's session may have been revoked.
  if (authorize) authorize();
  const id = randomUUID();
  try {
    db.prepare('INSERT INTO users(id,username,name,role,salt,password_hash,created_at) VALUES (?,?,?,?,?,?,?)')
      .run(id, data.username.toLowerCase(), data.name.trim(), data.role, password.salt, password.hash, new Date().toISOString());
  } catch (error) {
    if (String(error.message).includes('UNIQUE')) { const conflict = new Error('Ese nombre de usuario ya está registrado.'); conflict.status = 409; throw conflict; }
    throw error;
  }
  return publicUser(db.prepare('SELECT * FROM users WHERE id=?').get(id));
}
