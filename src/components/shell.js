export function renderLogoMarkup() {
  return '';
}

export function navDefinitions(labels) {
  return [
    { id: 'nav-dashboard', label: 'Panel', module: 'dashboard' },
    { id: 'nav-entities', label: labels.areas || 'Áreas auditadas', module: 'entities' },
    { id: 'nav-documents', label: labels.ncrs || 'Hallazgos / No conformidades', module: 'documents' },
    { id: 'nav-search', label: 'Buscar', module: 'search' },
    { id: 'nav-users', label: labels.users || 'Usuarios y roles', module: 'users' },
    { id: 'nav-parameters', label: 'Parámetros', module: 'parameters' },
    { id: 'nav-orders', label: 'Órdenes', module: 'orders' },
    { id: 'nav-audit', label: 'Auditoría', module: 'audit' }
  ];
}

export function applyShell(config, canManageUsers) {
  if (typeof document === 'undefined') return;
  document.title = config.moduleName || 'Módulo';
  const brand = document.getElementById('brand-name');
  if (brand) brand.textContent = config.moduleName || 'Módulo';
  const logo = document.getElementById('logo-mark');
  if (logo) logo.textContent = '';
  for (const nav of navDefinitions(config.labels || {})) {
    const label = document.getElementById(`${nav.id}-label`);
    if (label) label.textContent = nav.label;
    const button = document.getElementById(nav.id);
    if (button && nav.module === 'users') button.hidden = !canManageUsers;
  }
}

export function setActiveModule(active) {
  if (typeof document === 'undefined') return;
  document.querySelectorAll('.nav-module, #nav-users').forEach(button => {
    if (button.dataset.module === active) {
      button.setAttribute('aria-current', 'page');
    } else {
      button.removeAttribute('aria-current');
    }
  });
}
