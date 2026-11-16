import { loadModuleConfig } from './module-config.js';
import { initApp } from './app.js';

export async function main() {
  const configResult = await loadModuleConfig();
  await initApp(configResult);
}

if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    main();
  });
}
