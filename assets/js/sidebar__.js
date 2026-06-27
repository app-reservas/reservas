// ============================================================
//  sidebar.js — Genera el sidebar + topbar admin (equivalente a
//  includes/sidebar_admin.php), y protege la página (requireLogin).
// ============================================================

// Items de navegación del admin, igual a sidebar_admin.php
const NAV_ADMIN = [
  { seccion: 'General', items: [
    { href: 'dashboard.html',     icon: 'ti-dashboard',       label: 'Dashboard' },
    { href: 'reservas.html',      icon: 'ti-calendar-check',  label: 'Reservas', badge: 'pendientes' },
    { href: 'calendario.html',    icon: 'ti-calendar',        label: 'Calendario' },
  ]},
  { seccion: 'Gestión', items: [
    { href: 'negocios.html',      icon: 'ti-building-store',  label: 'Negocios' },
    { href: 'usuarios.html',      icon: 'ti-users',           label: 'Usuarios' },
    { href: 'servicios.html',     icon: 'ti-list-check',      label: 'Servicios' },
    { href: 'profesionales.html', icon: 'ti-user-check',      label: 'Profesionales' },
    { href: 'horarios.html',      icon: 'ti-clock',           label: 'Horarios' },
  ]},
  { seccion: 'Análisis', items: [
    { href: 'reportes.html',       icon: 'ti-chart-bar', label: 'Reportes' },
    { href: 'notificaciones.html', icon: 'ti-bell',      label: 'Notificaciones', badge: 'notificaciones' },
  ]},
  { seccion: 'Sistema', items: [
    { href: 'pagos.html',         icon: 'ti-credit-card', label: 'Pagos / CBU' },
    { href: 'extras.html',        icon: 'ti-settings-2',  label: 'Extras' },
    { href: 'configuracion.html', icon: 'ti-settings',    label: 'Configuración' },
  ]},
];

/**
 * Pinta el layout completo (sidebar + topbar) dentro de <body>,
 * y deja un <div class="page-content" id="page-content"></div> vacío
 * para que cada página agregue su contenido específico.
 *
 * opts: { titulo, subtitulo, nombreUsuario, rolLabel, topbarActionsHTML }
 */
function renderLayoutAdmin(opts = {}) {
  const {
    titulo = 'Panel',
    subtitulo = '',
    nombreUsuario = 'Admin',
    rolLabel = 'Super Administrador',
    topbarActionsHTML = '',
  } = opts;

  const path = window.location.pathname.split('/').pop();

  const seccionesHTML = NAV_ADMIN.map(sec => `
    <div class="sidebar-section">
      <div class="sidebar-section-label">${sec.seccion}</div>
      ${sec.items.map(it => `
        <a href="${it.href}" class="nav-item${path === it.href ? ' active' : ''}" data-badge-key="${it.badge || ''}">
          <i class="ti ${it.icon}"></i><span>${it.label}</span>
          ${it.badge ? `<span class="nav-badge hidden" data-badge="${it.badge}" style="display:none"></span>` : ''}
        </a>
      `).join('')}
    </div>
  `).join('');

  document.body.insertAdjacentHTML('afterbegin', `
    <div class="sidebar-overlay" id="sidebar-overlay"></div>
    <div class="app-layout">
      <aside class="sidebar" id="sidebar-main">
        <div class="sidebar-logo">
          <div class="logo-icon"><i class="ti ti-calendar-event"></i></div>
          <div>
            <div class="logo-text">${SISTEMA_NOMBRE}</div>
            <div class="logo-badge">Super Admin</div>
          </div>
        </div>
        ${seccionesHTML}
        <div class="sidebar-footer">
          <div class="user-info">
            <div class="user-avatar">${iniciales(nombreUsuario)}</div>
            <div><div class="user-name">${limpiar(nombreUsuario)}</div><div class="user-rol">${rolLabel}</div></div>
          </div>
          <a href="#" id="btn-logout" class="nav-item" style="margin-top:4px;color:#ff8787">
            <i class="ti ti-logout"></i><span>Cerrar sesión</span>
          </a>
        </div>
      </aside>

      <main class="main-content">
        <div class="topbar">
          <div style="display:flex;align-items:center;gap:10px">
            <button class="menu-toggle"><i class="ti ti-menu-2"></i></button>
            <div>
              <div class="topbar-title">${titulo}</div>
              <div class="topbar-sub">${subtitulo}</div>
            </div>
          </div>
          <div class="topbar-actions">
            ${topbarActionsHTML}
            <a href="notificaciones.html" class="btn btn-ghost btn-icon" title="Notificaciones"><i class="ti ti-bell"></i></a>
          </div>
        </div>
        <div class="page-content" id="page-content"></div>
      </main>
    </div>
    <div id="toast-container"></div>
  `);

  // Logout
  document.getElementById('btn-logout').addEventListener('click', async (e) => {
    e.preventDefault();
    await auth.signOut();
    location.href = '../index.html';
  });

  // Cargar badges de pendientes/notificaciones en segundo plano
  cargarBadgesSidebar();
}

async function cargarBadgesSidebar() {
  try {
    const hoy = hoyISO();
    const pendSnap = await db.collection('reservas')
      .where('estado', '==', 'pendiente')
      .where('fecha', '>=', hoy)
      .get();
    const elPend = document.querySelector('[data-badge="pendientes"]');
    if (elPend && pendSnap.size > 0) {
      elPend.textContent = pendSnap.size;
      elPend.style.display = '';
    }
  } catch (e) { /* silencioso: no bloquea la página si falla */ }

  try {
    const notifSnap = await db.collection('notificaciones').where('leida', '==', false).get();
    const elNotif = document.querySelector('[data-badge="notificaciones"]');
    if (elNotif && notifSnap.size > 0) {
      elNotif.textContent = notifSnap.size;
      elNotif.style.display = '';
    }
  } catch (e) { /* silencioso */ }
}

/**
 * Protege la página: si no hay sesión o el usuario no tiene el rol
 * requerido, redirige al login. Devuelve los datos del usuario.
 */
function requireLogin(rolRequerido = 'superadmin') {
  return new Promise((resolve) => {
    auth.onAuthStateChanged(async (user) => {
      if (!user) { location.href = '../index.html'; return; }
      const snap = await db.collection('usuarios').doc(user.uid).get();
      if (!snap.exists) { await auth.signOut(); location.href = '../index.html'; return; }
      const datos = snap.data();
      if (datos.activo === false) { await auth.signOut(); location.href = '../index.html'; return; }
      if (rolRequerido && datos.rol !== rolRequerido) {
        // Redirige a su panel correspondiente
        if (datos.rol === 'gerente') location.href = 'negocio-dashboard.html';
        else location.href = '../index.html';
        return;
      }
      resolve({ uid: user.uid, ...datos });
    });
  });
}
