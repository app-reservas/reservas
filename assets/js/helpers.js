// ============================================================
//  helpers.js — Equivalente JS de las funciones PHP de config.php
// ============================================================

function limpiar(valor) {
  if (valor === null || valor === undefined) return '';
  const div = document.createElement('div');
  div.textContent = String(valor);
  return div.innerHTML;
}

// Escapa un texto para poder insertarlo de forma segura DENTRO de un
// onclick="funcion('texto')" (comillas simples). Sin esto, un apóstrofe
// o un salto de línea escrito por el usuario (nombre, descripción, etc.)
// corta el string de JavaScript y el botón queda roto sin ningún error visible.
// Tildes, @, #, *, y en general cualquier otro carácter NO necesitan escaparse.
function escJS(valor) {
  if (valor === null || valor === undefined) return '';
  return String(valor)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\r?\n/g, ' ');
}

function generarCodigo(largo = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let out = '';
  for (let i = 0; i < largo; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

function formatearPrecio(precio, simbolo = '$', decimales = 2) {
  const n = Number(precio || 0);
  return simbolo + n.toLocaleString('es-AR', { minimumFractionDigits: decimales, maximumFractionDigits: decimales });
}

// ============================================================
//  MONEDAS — sistema multi-moneda (superadmin crea, gerente elige)
// ============================================================

// Fallback para negocios que todavía no configuraron ninguna moneda
// (así los datos viejos siguen mostrándose en pesos, sin romper nada).
const MONEDA_POR_DEFECTO = { codigo: 'ARS', nombre: 'Peso Argentino', simbolo: '$', decimales: 2 };

// Resuelve las monedas habilitadas de un negocio contra el catálogo global.
// negocio.monedas_habilitadas = ['ARS','USD'] (máx 2), negocio.moneda_default = 'ARS'
// monedasCatalogo = array de docs de la colección 'monedas' ({codigo,nombre,simbolo,decimales,activa})
function monedasDelNegocio(negocio, monedasCatalogo) {
  const habilitadas = (negocio && negocio.monedas_habilitadas) || [];
  if (!habilitadas.length) return [{ ...MONEDA_POR_DEFECTO, principal: true }];
  const catalogoMap = {};
  (monedasCatalogo || []).forEach(m => catalogoMap[m.codigo] = m);
  const principal = negocio.moneda_default || habilitadas[0];
  return habilitadas.map(cod => {
    const m = catalogoMap[cod] || { codigo: cod, nombre: cod, simbolo: '$', decimales: 2 };
    return { codigo: m.codigo, nombre: m.nombre, simbolo: m.simbolo, decimales: m.decimales ?? 2, principal: cod === principal };
  });
}

// Genera los inputs de precio (1 o 2, según las monedas del negocio).
// valores = { COD: monto } ya cargado (al editar). Se leen con leerCamposPrecio().
function htmlCamposPrecio(monedas, valores = {}) {
  return (monedas || []).map(m => `
    <div class="form-group" style="margin-bottom:0">
      <label class="form-label">Precio (${limpiar(m.simbolo)} ${limpiar(m.codigo)})${m.principal && monedas.length > 1 ? ' <span style="color:var(--text-muted);font-weight:400">· principal</span>' : ''}</label>
      <input type="number" class="form-control precio-input" data-moneda="${m.codigo}"
             placeholder="0.00" min="0" step="0.01" value="${valores[m.codigo] ?? ''}">
    </div>`).join('');
}

// Lee los inputs generados por htmlCamposPrecio dentro de un contenedor.
function leerCamposPrecio(contenedorId) {
  const cont = document.getElementById(contenedorId);
  const precios = {};
  if (!cont) return precios;
  cont.querySelectorAll('.precio-input').forEach(inp => {
    precios[inp.dataset.moneda] = parseFloat(inp.value) || 0;
  });
  return precios;
}

// Da el string formateado de un servicio con TODAS sus monedas habilitadas
// (ej: "$1.500,00 / U$S 12,00"). Compatible con servicios viejos que solo
// tienen el campo `precio` (número plano, se asume que es de la moneda principal).
function formatearPreciosServicio(servicio, negocio, monedasCatalogo) {
  const monedas = monedasDelNegocio(negocio, monedasCatalogo);
  const precios = (servicio && servicio.precios) ||
    (servicio && servicio.precio != null ? { [monedas[0].codigo]: servicio.precio } : {});
  return monedas.map(m => formatearPrecio(precios[m.codigo] || 0, m.simbolo, m.decimales)).join(' <span style="color:var(--text-muted)">/</span> ');
}

// Suma una lista de items agrupando por moneda (no se pueden sumar pesos + dólares en un solo número).
// items = array de objetos; montoFn(item) devuelve el número; monedaFn(item) devuelve el código ('ARS','USD',...).
// Devuelve { ARS: 1500, USD: 12 }
function agruparPorMoneda(items, montoFn, monedaFn) {
  const totales = {};
  (items || []).forEach(item => {
    const cod = monedaFn(item) || 'ARS';
    const monto = Number(montoFn(item)) || 0;
    totales[cod] = (totales[cod] || 0) + monto;
  });
  return totales;
}

// Formatea un objeto de totales por moneda ({ARS:1500, USD:12}) como texto separado por " · ",
// resolviendo el símbolo real contra el catálogo global de monedas.
function formatearTotalesPorMoneda(totales, monedasCatalogo, opts = {}) {
  const catalogoMap = {};
  (monedasCatalogo || []).forEach(m => catalogoMap[m.codigo] = m);
  const entradas = Object.entries(totales || {}).filter(([, monto]) => opts.incluirCero || monto !== 0);
  if (!entradas.length) return formatearPrecio(0);
  return entradas.map(([cod, monto]) => {
    const m = catalogoMap[cod] || { simbolo: '$', decimales: 2 };
    return formatearPrecio(monto, m.simbolo, m.decimales ?? 2);
  }).join(' <span style="color:var(--text-muted)">·</span> ');
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
