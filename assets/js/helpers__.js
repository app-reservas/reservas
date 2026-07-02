// ============================================================
//  helpers.js — Equivalente JS de las funciones PHP de config.php
// ============================================================

function limpiar(valor) {
  if (valor === null || valor === undefined) return '';
  const div = document.createElement('div');
  div.textContent = String(valor);
  return div.innerHTML;
}

function generarCodigo(largo = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let out = '';
  for (let i = 0; i < largo; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

function formatearPrecio(precio) {
  const n = Number(precio || 0);
  return '$' + n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// fecha esperada en formato 'YYYY-MM-DD'
function formatearFecha(fecha) {
  if (!fecha) return '';
  const [y, m, d] = fecha.split('-');
  return `${d}/${m}/${y}`;
}

// hora esperada en formato 'HH:MM' o 'HH:MM:SS'
function formatearHora(hora) {
  if (!hora) return '';
  return hora.substring(0, 5);
}

function diasSemana() {
  return ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
}

function colorEstado(estado) {
  const colores = {
    pendiente: '#F59F00',
    pendiente_pago: '#1098AD',
    confirmada: '#2F9E44',
    completada: '#1971C2',
    cancelada: '#E03131',
    no_asistio: '#862E9C',
  };
  return colores[estado] || '#868E96';
}

function etiquetaEstado(estado) {
  const etiquetas = {
    pendiente: 'Pendiente',
    pendiente_pago: 'Pago pendiente',
    confirmada: 'Confirmada',
    completada: 'Completada',
    cancelada: 'Cancelada',
    no_asistio: 'No asistió',
  };
  return etiquetas[estado] || estado;
}

function iconoEstado(estado) {
  const iconos = {
    pendiente: 'ti-clock',
    pendiente_pago: 'ti-receipt',
    confirmada: 'ti-check',
    completada: 'ti-circle-check',
    cancelada: 'ti-x',
    no_asistio: 'ti-user-off',
  };
  return iconos[estado] || 'ti-help';
}

// Fecha de hoy en formato YYYY-MM-DD (zona horaria local)
function hoyISO() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

// Lunes de la semana actual en formato YYYY-MM-DD
function inicioSemanaISO() {
  const d = new Date();
  const day = d.getDay(); // 0=domingo
  const diff = day === 0 ? -6 : 1 - day; // retrocede hasta el lunes
  const lunes = new Date(d);
  lunes.setDate(d.getDate() + diff);
  const m = String(lunes.getMonth() + 1).padStart(2, '0');
  const dd = String(lunes.getDate()).padStart(2, '0');
  return `${lunes.getFullYear()}-${m}-${dd}`;
}

function iniciales(nombre) {
  if (!nombre) return '?';
  return nombre.trim().split(/\s+/).slice(0, 2).map(p => p[0].toUpperCase()).join('');
}
