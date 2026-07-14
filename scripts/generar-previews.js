// ============================================================
//  generar-previews.js
//  Genera un archivo public/p-<slug>.html por cada negocio en
//  Firestore, con las etiquetas og:image / og:title para que
//  WhatsApp (y Facebook/Twitter) muestren el logo del negocio
//  al compartir el link. Cada archivo redirige automáticamente
//  a la página real de reservar.
//
//  Se ejecuta solo (vía GitHub Actions), no hace falta correrlo
//  a mano. Ver .github/workflows/generar-previews.yml
// ============================================================

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Credenciales del service account (se pasan como secret de GitHub,
// nunca se suben al repo en texto plano)
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// URL base donde vive la página real de reservar (GitHub Pages)
const BASE_URL = 'https://app-reservas.github.io/reservas/public/reserva.html';

// Carpeta donde se van a crear los archivitos p-<slug>.html
const OUTPUT_DIR = path.join(__dirname, '..', 'public');

function escapeHTML(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function optimizarLogoCloudinary(url) {
  // Si es una URL de Cloudinary, insertamos una transformación para
  // servirla ya redimensionada (1200x630, ideal para redes) y liviana.
  // Evita que WhatsApp/Facebook descarten la imagen por ser muy pesada.
  const marcador = '/upload/';
  const i = url.indexOf(marcador);
  if (i === -1) return url; // no es de Cloudinary, se deja tal cual
  const antes = url.slice(0, i + marcador.length);
  const despues = url.slice(i + marcador.length);
  return `${antes}w_1200,h_630,c_pad,b_white,q_auto,f_auto/${despues}`;
}

function plantillaHTML({ nombre, descripcion, logo, destino }) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>${escapeHTML(nombre)}</title>
<meta property="og:title" content="${escapeHTML(nombre)}">
<meta property="og:description" content="${escapeHTML(descripcion)}">
<meta property="og:image" content="${escapeHTML(logo)}">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
<meta http-equiv="refresh" content="0; url=${escapeHTML(destino)}">
</head>
<body>Redirigiendo…</body>
</html>
`;
}

async function main() {
  console.log('Leyendo negocios desde Firestore...');
  const snap = await db.collection('negocios').get();

  if (snap.empty) {
    console.log('No hay negocios registrados. No se generó nada.');
    return;
  }

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  let generados = 0;
  let saltados = 0;

  snap.forEach((doc) => {
    const n = doc.data();
    const slug = (n.slug || '').trim();
    const logo = (n.logo_url || '').trim();

    if (!slug || !logo) {
      console.log(`- Saltado (${doc.id}): falta slug o logo_url`);
      saltados++;
      return;
    }

    const archivo = path.join(OUTPUT_DIR, `p-${slug}.html`);
    const html = plantillaHTML({
      nombre: n.nombre || slug,
      descripcion: n.descripcion || 'Reservá tu turno online.',
      logo: optimizarLogoCloudinary(logo),
      destino: `${BASE_URL}?negocio=${encodeURIComponent(slug)}`,
    });

    fs.writeFileSync(archivo, html, 'utf8');
    console.log(`✓ Generado: public/p-${slug}.html`);
    generados++;
  });

  console.log(`\nListo. ${generados} archivo(s) generado(s), ${saltados} salteado(s).`);
}

main().catch((err) => {
  console.error('Error generando previews:', err);
  process.exit(1);
});
