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

// Items de navegación del gerente, igual a includes/sidebar_gerente.php
// (rutas relativas a gerente/, sin Negocios ni Usuarios — son exclusivos del superadmin)
const NAV_GERENTE = [
  { seccion: 'General', items: [
    { href: 'dashboard.html',  icon: 'ti-dashboard',      label: 'Dashboard' },
    { href: 'reservas.html',   icon: 'ti-calendar-check', label: 'Reservas', badge: 'pendientes' },
    { href: 'calendario.html', icon: 'ti-calendar',       label: 'Calendario' },
  ]},
  { seccion: 'Mi negocio', items: [
    { href: 'servicios.html',     icon: 'ti-list-check', label: 'Servicios' },
    { href: 'profesionales.html', icon: 'ti-user-check', label: 'Profesionales' },
    { href: 'horarios.html',      icon: 'ti-clock',      label: 'Horarios' },
  ]},
  { seccion: 'Análisis', items: [
    { href: 'reportes.html',       icon: 'ti-chart-bar', label: 'Reportes' },
    { href: 'notificaciones.html', icon: 'ti-bell',      label: 'Notificaciones', badge: 'notificaciones' },
  ]},
  { seccion: 'Sistema', items: [
    { href: 'pagos.html',          icon: 'ti-credit-card',    label: 'Pagos / CBU' },
    { href: 'devoluciones.html',   icon: 'ti-receipt-refund', label: 'Devoluciones' },
    { href: 'extras.html',         icon: 'ti-settings-2',     label: 'Extras' },
    { href: 'configuracion.html',  icon: 'ti-settings',       label: 'Configuración' },
  ]},
];

/**
 * Pinta el layout completo (sidebar + topbar) dentro de <body>,
 * y deja un <div class="page-content" id="page-content"></div> vacío
 * para que cada página agregue su contenido específico.
 *
 * opts: { titulo, subtitulo, nombreUsuario, rolLabel, topbarActionsHTML,
 *         rol, negocio: { nombre, color_primario, logo } }
 */
function renderLayoutAdmin(opts = {}) {
  const {
    titulo = 'Panel',
    subtitulo = '',
    nombreUsuario = 'Admin',
    rolLabel = 'Super Administrador',
    topbarActionsHTML = '',
    rol = 'superadmin',
    negocio = null,
  } = opts;

  const esGerente = rol === 'gerente';
  const nav = esGerente ? NAV_GERENTE : NAV_ADMIN;
  const colorNeg = (esGerente && negocio?.color_primario) ? negocio.color_primario : null;

  const path = window.location.pathname.split('/').pop();

  const seccionesHTML = nav.map(sec => `
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

  // Overrides de color de marca cuando es el panel del gerente (igual a sidebar_gerente.php)
  let styleOverride = '';
  if (colorNeg) {
    styleOverride = `<style>:root{--indigo-600:${colorNeg};--indigo-500:${colorNeg}cc;--indigo-400:${colorNeg}99;}</style>`;
  }
  if (styleOverride) document.head.insertAdjacentHTML('beforeend', styleOverride);

  const logoIconHTML = (esGerente && negocio?.logo)
    ? `<div class="logo-icon" style="background:transparent;padding:0;overflow:hidden;width:36px;height:36px"><img src="${negocio.logo}" alt="Logo" style="width:36px;height:36px;object-fit:contain;border-radius:6px"></div>`
    : `<div class="logo-icon"${colorNeg ? ` style="background:${colorNeg}"` : ''}><i class="ti ${esGerente ? 'ti-building-store' : 'ti-calendar-event'}"></i></div>`;

  const logoTextHTML = esGerente && negocio?.nombre ? limpiar(negocio.nombre) : SISTEMA_NOMBRE;
  const logoBadgeHTML = esGerente ? 'Panel Gerente' : 'Super Admin';

  const linkPublicoHTML = (esGerente && negocio?.slug)
    ? `<button onclick="copiarLinkPublicoNegocio()" class="nav-item" style="background:none;border:none;width:100%;text-align:left;cursor:pointer"><i class="ti ti-brand-whatsapp" style="color:#25d366"></i><span>Copiar link</span></button>`
    : '';

  document.body.insertAdjacentHTML('afterbegin', `
    <div class="sidebar-overlay" id="sidebar-overlay"></div>
    <div class="app-layout">
      <aside class="sidebar" id="sidebar-main">
        <div class="sidebar-logo">
          ${logoIconHTML}
          <div>
            <div class="logo-text">${logoTextHTML}</div>
            <div class="logo-badge">${logoBadgeHTML}</div>
          </div>
        </div>
        ${seccionesHTML}
        ${linkPublicoHTML ? `<div class="sidebar-section">${linkPublicoHTML}</div>` : ''}
        <div class="sidebar-footer">
          <div class="user-info">
            <div class="user-avatar"${colorNeg ? ` style="background:${colorNeg}33;color:${colorNeg}"` : ''}>${iniciales(nombreUsuario)}</div>
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
            ${esGerente ? `<button onclick="copiarLinkPublicoNegocio()" class="btn btn-ghost btn-icon" title="Copiar link de reservas"><i class="ti ti-brand-whatsapp" style="color:#25d366"></i></button>` : ''}
            <a href="notificaciones.html" class="btn btn-ghost btn-icon" title="Notificaciones"><i class="ti ti-bell"></i></a>
          </div>
        </div>
        <div class="page-content" id="page-content"></div>
      </main>
    </div>
    <div id="toast-container"></div>
  `);

  // Logout (ruta relativa: ../index.html funciona igual desde admin/ o gerente/)
  document.getElementById('btn-logout').addEventListener('click', async (e) => {
    e.preventDefault();
    await auth.signOut();
    location.href = '../index.html';
  });

  // Cargar badges de pendientes/notificaciones en segundo plano
  cargarBadgesSidebar(esGerente ? negocio?.id : null);
}

// Copia el link público de reservas del negocio (solo aplica al panel gerente)
function copiarLinkPublicoNegocio() {
  if (!window.LINK_PUBLICO_NEGOCIO) { Toast.warning('Todavía no se cargó el link del negocio.'); return; }
  navigator.clipboard.writeText(window.LINK_PUBLICO_NEGOCIO).then(
    () => Toast.success('¡Link copiado! Pegalo en WhatsApp para que tus clientes reserven.'),
    () => Toast.error('No se pudo copiar el link.')
  );
}

async function cargarBadgesSidebar(negocioId = null) {
  try {
    const hoy = hoyISO();
    // Traemos solo por estado (query simple, sin índice compuesto) y filtramos
    // fecha + negocio en el cliente — mismo fix que ya aplicamos en reservas/calendario.
    const pendSnap = await db.collection('reservas').where('estado', '==', 'pendiente').get();
    let cantidad = 0;
    pendSnap.forEach(d => {
      const r = d.data();
      if (r.fecha >= hoy && (!negocioId || r.negocio_id === negocioId)) cantidad++;
    });
    const elPend = document.querySelector('[data-badge="pendientes"]');
    if (elPend && cantidad > 0) {
      elPend.textContent = cantidad;
      elPend.style.display = '';
    }
  } catch (e) { /* silencioso: no bloquea la página si falla */ }

  try {
    const notifSnap = await db.collection('notificaciones').where('leida', '==', false).get();
    let cantidad = 0;
    notifSnap.forEach(d => {
      const n = d.data();
      if (!negocioId || n.negocio_id === negocioId) cantidad++;
    });
    const elNotif = document.querySelector('[data-badge="notificaciones"]');
    if (elNotif && cantidad > 0) {
      elNotif.textContent = cantidad;
      elNotif.style.display = '';
    }
  } catch (e) { /* silencioso */ }
}

/**
 * Protege la página: si no hay sesión o el usuario no tiene el rol
 * requerido, redirige al login. Devuelve los datos del usuario.
 * Si rolRequerido es 'gerente', además trae los datos de su negocio
 * (necesarios para pintar el sidebar con su color/nombre/logo) y los
 * deja en datos.negocio, además de exponer window.LINK_PUBLICO_NEGOCIO.
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
        if (datos.rol === 'gerente') location.href = '../gerente/dashboard.html';
        else if (datos.rol === 'superadmin') location.href = '../admin/dashboard.html';
        else location.href = '../index.html';
        return;
      }

      if (rolRequerido === 'gerente') {
        if (!datos.negocio_id) {
          await auth.signOut();
          location.href = '../index.html';
          return;
        }
        const negSnap = await db.collection('negocios').doc(datos.negocio_id).get();
        if (!negSnap.exists || negSnap.data().activo === false) {
          await auth.signOut();
          location.href = '../index.html';
          return;
        }
        const negocio = { id: negSnap.id, ...negSnap.data() };
        window.LINK_PUBLICO_NEGOCIO = new URL(`../public/reserva.html?negocio=${encodeURIComponent(negocio.slug || '')}`, window.location.href).href;
        resolve({ uid: user.uid, ...datos, negocio });
        return;
      }

      resolve({ uid: user.uid, ...datos });
    });
  });
}
