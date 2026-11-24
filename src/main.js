import { loadModuleConfig, setActiveConfig, QUALITY_CONFIG } from './module-config.js';
import { initApp } from './app.js';

export async function main() {
  setActiveConfig(QUALITY_CONFIG);
  const configResult = await loadModuleConfig();
  await initApp(configResult);
}

if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    main();
  });
}
