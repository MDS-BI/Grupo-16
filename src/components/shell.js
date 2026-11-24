export function logoInitials(moduleName) {
  const words = String(moduleName || '').trim().split(/\s+/).filter(Boolean);
  const initials = words.map(word => word[0]).join('').toUpperCase().slice(0, 2);
  return initials || 'MB';
}

export function renderLogoMarkup(moduleName) {
  const initials = logoInitials(moduleName);
  return `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${initials}">
    <rect width="32" height="32" rx="6" fill="var(--accent, #2563eb)"/>
    <text x="16" y="21" fill="#ffffff" font-size="14" font-weight="bold" text-anchor="middle">${initials}</text>
  </svg>`;
}

export function navDefinitions(labels) {
  return [
    { id: 'nav-dashboard', label: 'Panel', module: 'dashboard' },
    { id: 'nav-entities', label: labels.areas || 'Áreas auditadas', module: 'entities' },
    { id: 'nav-documents', label: labels.ncrs || 'Hallazgos / No conformidades', module: 'documents' },
    { id: 'nav-search', label: 'Buscar', module: 'search' },
    { id: 'nav-users', label: labels.users || 'Usuarios y roles', module: 'users' }
  ];
}

export function applyShell(config, canManageUsers) {
  if (typeof document === 'undefined') return;
  document.title = config.moduleName || 'Módulo';
  const brand = document.getElementById('brand-name');
  if (brand) brand.textContent = config.moduleName || 'Módulo';
  const logo = document.getElementById('logo-mark');
  if (logo) logo.innerHTML = renderLogoMarkup(config.moduleName);
  for (const nav of navDefinitions(config.labels || {})) {
    const label = document.getElementById(`${nav.id}-label`);
    if (label) label.textContent = nav.label;
    const button = document.getElementById(nav.id);
    if (button) button.hidden = nav.module === 'users' && !canManageUsers;
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
