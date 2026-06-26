// ============================================================
//  app.js v2 — JS Global. FIX: iconos, móvil, menú
// ============================================================

// ── TOAST ──────────────────────────────────────────────────
const Toast = {
  init() {
    if (!document.getElementById('toast-container')) {
      const c = document.createElement('div');
      c.id = 'toast-container';
      document.body.appendChild(c);
    }
  },
  show(msg, tipo = 'info', dur = 3500) {
    this.init();
    const cont = document.getElementById('toast-container');
    const iconos = { success:'ti-circle-check', error:'ti-alert-circle', info:'ti-info-circle', warning:'ti-alert-triangle' };
    const cols   = { success:'#69db7c', error:'#ff8787', info:'#748ffc', warning:'#ffd43b' };
    const t = document.createElement('div');
    t.className = `toast toast-${tipo}`;
    t.innerHTML = `
      <i class="ti ${iconos[tipo]||'ti-info-circle'}" style="color:${cols[tipo]||'#748ffc'};font-size:20px;flex-shrink:0"></i>
      <span style="flex:1;color:var(--text-primary)">${msg}</span>
      <button onclick="this.parentElement.remove()" style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:16px;padding:0;line-height:1">✕</button>`;
    cont.appendChild(t);
    setTimeout(() => { t.style.transition='opacity 0.4s'; t.style.opacity='0'; }, dur);
    setTimeout(() => t.remove(), dur + 450);
  },
  success: (m) => Toast.show(m,'success'),
  error:   (m) => Toast.show(m,'error'),
  info:    (m) => Toast.show(m,'info'),
  warning: (m) => Toast.show(m,'warning'),
};

// ── MODAL ──────────────────────────────────────────────────
const Modal = {
  open(id)  { document.getElementById(id)?.classList.add('open'); },
  close(id) { document.getElementById(id)?.classList.remove('open'); },
  closeAll(){ document.querySelectorAll('.modal-overlay.open').forEach(m=>m.classList.remove('open')); }
};
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) Modal.closeAll();
});
document.addEventListener('keydown', e => { if (e.key==='Escape') Modal.closeAll(); });

// ── AJAX ───────────────────────────────────────────────────
const Ajax = {
  async post(url, datos={}) {
    try {
      const fd = new FormData();
      Object.entries(datos).forEach(([k,v]) => fd.append(k,v));
      const r = await fetch(url, {method:'POST', body:fd});
      return await r.json();
    } catch(e) { return {ok:false, msg:'Error de conexión'}; }
  },
  async get(url) {
    try { const r = await fetch(url); return await r.json(); }
    catch(e) { return {ok:false, msg:'Error de conexión'}; }
  }
};

// ── CONFIRM ────────────────────────────────────────────────
function confirmar(msg, onSi) {
  const id = 'cm-' + Date.now();
  const el = document.createElement('div');
  el.className = 'modal-overlay';
  el.id = id;
  el.innerHTML = `<div class="modal" style="max-width:380px">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
      <div style="width:44px;height:44px;background:rgba(224,49,49,0.18);border-radius:10px;display:flex;align-items:center;justify-content:center">
        <i class="ti ti-alert-triangle" style="color:#ff8787;font-size:22px"></i>
      </div>
      <div>
        <div style="font-size:15px;font-weight:700;color:var(--text-primary)">Confirmar acción</div>
        <div style="font-size:13px;color:var(--text-muted);margin-top:2px">${msg}</div>
      </div>
    </div>
    <div style="display:flex;gap:10px;justify-content:flex-end">
      <button class="btn btn-ghost btn-sm" onclick="document.getElementById('${id}').remove()">Cancelar</button>
      <button class="btn btn-danger btn-sm" id="${id}-si">Sí, continuar</button>
    </div>
  </div>`;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('open'));
  document.getElementById(`${id}-si`).onclick = () => { el.remove(); onSi && onSi(); };
}

// ── ELIMINAR CRUD ──────────────────────────────────────────
async function eliminarRegistro(url, id, nombre, onOk) {
  confirmar(`¿Eliminar "${nombre}"? No se puede deshacer.`, async () => {
    const res = await Ajax.post(url, {id, accion:'eliminar'});
    if (res.ok) { Toast.success(res.msg||'Eliminado correctamente'); onOk&&onOk(); }
    else Toast.error(res.msg||'Error al eliminar');
  });
}

// ── COPIAR LINK ─────────────────────────────────────────────
function copiarLink() {
  const link = typeof LINK_PUBLICO !== 'undefined' ? LINK_PUBLICO : '';
  if (!link) { Toast.error('Link no disponible'); return; }
  navigator.clipboard.writeText(link).then(
    () => Toast.success('¡Link copiado! Pegalo en WhatsApp 🚀'),
    () => {
      // fallback para móviles
      const ta = document.createElement('textarea');
      ta.value = link; document.body.appendChild(ta);
      ta.select(); document.execCommand('copy');
      document.body.removeChild(ta);
      Toast.success('¡Link copiado!');
    }
  );
}

// ── COUNTER ANIMATION ──────────────────────────────────────
function animarContador(el, fin, pre='', suf='', dur=1000) {
  const step = Math.max(1, fin/dur*16);
  let actual = 0;
  const t = setInterval(() => {
    actual = Math.min(actual+step, fin);
    el.textContent = pre + Math.round(actual).toLocaleString('es-AR') + suf;
    if (actual >= fin) clearInterval(t);
  }, 16);
}

// ── SIDEBAR MÓVIL ──────────────────────────────────────────
function initSidebarMovil() {
  const toggle = document.querySelector('.menu-toggle');
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.sidebar-overlay');
  if (!toggle || !sidebar) return;
  toggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay && overlay.classList.toggle('open');
  });
  overlay && overlay.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
  });
}

// ── MARCAR NAV ACTIVO ──────────────────────────────────────
function marcarNavActivo() {
  const path = window.location.pathname;
  const file = path.split('/').pop();
  document.querySelectorAll('.nav-item[href]').forEach(item => {
    const href = item.getAttribute('href')||'';
    const hfile = href.split('/').pop().split('?')[0];
    if (hfile && file === hfile) item.classList.add('active');
  });
}

// ── INIT ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  Toast.init();
  marcarNavActivo();
  initSidebarMovil();

  // Animar KPI counters
  document.querySelectorAll('[data-counter]').forEach(el => {
    animarContador(el, parseFloat(el.dataset.counter)||0, el.dataset.prefix||'', el.dataset.suffix||'');
  });

  // Flash message desde PHP
  const flash = document.getElementById('flash-msg');
  if (flash) {
    Toast[flash.dataset.tipo||'info'](flash.dataset.msg||'');
    flash.remove();
  }
});
