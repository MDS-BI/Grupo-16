import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

export function openDatabase(path) {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec(`PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY, username TEXT NOT NULL COLLATE NOCASE UNIQUE,
      name TEXT NOT NULL, role TEXT NOT NULL, salt TEXT NOT NULL,
      password_hash TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id),
      csrf TEXT NOT NULL, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL,
      last_seen INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS app_data (key TEXT PRIMARY KEY, value TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS audit (
      id INTEGER PRIMARY KEY AUTOINCREMENT, at TEXT NOT NULL, actor_id TEXT NOT NULL,
      actor_name TEXT NOT NULL, action TEXT NOT NULL, target TEXT NOT NULL
    );`);
  const read = db.prepare('SELECT value FROM app_data WHERE key = ?');
  const write = db.prepare('INSERT INTO app_data(key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value');
  const remove = db.prepare('DELETE FROM app_data WHERE key = ?');
  return {
    db,
    getItem: key => read.get(key)?.value ?? null,
    setItem: (key, value) => { write.run(key, String(value)); },
    removeItem: key => { remove.run(key); },
    transaction(fn) {
      db.exec('BEGIN IMMEDIATE');
      try { const result = fn(); db.exec('COMMIT'); return result; }
      catch (error) { db.exec('ROLLBACK'); throw error; }
    },
    close: () => db.close()
  };
}
