import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.{js,mjs}'],
    exclude: ['node_modules/**', 'dist/**', 'PROPUESTA-MVP/**'],
    fileParallelism: false
  }
});
