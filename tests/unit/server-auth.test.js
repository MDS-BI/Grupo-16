import { describe, expect, it } from 'vitest';
import { passwordHash, verifyPassword, safeEqual } from '../../server/auth.js';

describe('Contraseñas de cuentas de calidad', () => {
  it('usa una sal nueva para la misma contraseña y verifica sin almacenar el texto original', async () => {
    const first = await passwordHash('Solo-para-pruebas-2026');
    const second = await passwordHash('Solo-para-pruebas-2026');
    expect(first.salt).not.toBe(second.salt);
    expect(first.hash).not.toBe(second.hash);
    expect(await verifyPassword('Solo-para-pruebas-2026', { salt: first.salt, password_hash: first.hash })).toBe(true);
    expect(await verifyPassword('Contraseña-incorrecta', { salt: first.salt, password_hash: first.hash })).toBe(false);
    expect(safeEqual(undefined, first.hash)).toBe(false);
    expect(safeEqual('más corto', first.hash)).toBe(false);
  });

  it('rechaza contraseñas vacías, demasiado cortas y de más de 128 caracteres', async () => {
    for (const value of ['', 'admin', 'x'.repeat(129), null]) await expect(passwordHash(value)).rejects.toMatchObject({ status: 422 });
  });
});
