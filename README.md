# ReservasApp — Firebase + GitHub Pages + Cloudinary

Sistema de reservas/turnos online multi-negocio.

---

## Stack
- **Firebase Auth** — login/registro
- **Firestore** — base de datos en tiempo real
- **GitHub Pages** — hosting gratuito
- **Cloudinary** — imágenes (logos, fotos de profesionales, comprobantes)

---

## Setup paso a paso

### 1. Crear proyecto Firebase
1. Ir a https://console.firebase.google.com
2. Crear nuevo proyecto
3. Activar **Authentication** → Email/Password
4. Crear **Firestore Database** (modo producción)
5. En Configuración del proyecto → copiar los datos del SDK web

### 2. Configurar firebase-config.js
Abrir `assets/js/firebase-config.js` y reemplazar los valores:
```js
const FIREBASE_CONFIG = {
  apiKey:            "...",
  authDomain:        "...",
  projectId:         "...",
  ...
};
const CLOUDINARY_CLOUD  = "tu_cloud_name";
const CLOUDINARY_PRESET = "reservas";
```

### 3. Crear cuenta superadmin
- Abrir `setup/index.html` en el browser
- Completar nombre, email y contraseña
- Copiar el UID generado a `SUPERADMIN_UID` en `firebase-config.js`
- **Eliminar o proteger la carpeta `setup/` después**

### 4. Reglas de Firestore
En Firebase Console → Firestore → Reglas, pegar:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Usuarios: cada uno lee/edita el suyo; superadmin lee todo
    match /usuarios/{uid} {
      allow read, write: if request.auth.uid == uid;
      allow read: if get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.rol == 'superadmin';
    }

    // Negocios: lectura pública (para la página de reservas); escritura solo superadmin
    match /negocios/{negocioId} {
      allow read: if true;
      allow write: if get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.rol == 'superadmin';

      // Sub-colecciones del negocio
      match /{subCol}/{docId} {
        allow read: if true;
        allow write: if request.auth != null && (
          get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.rol == 'superadmin' ||
          get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.negocio_id == negocioId
        );
      }
    }
  }
}
```

### 5. Cloudinary
1. Ir a https://cloudinary.com → crear cuenta gratuita
2. Copiar el **Cloud Name** → ponerlo en `CLOUDINARY_CLOUD`
3. En Settings → Upload → Add upload preset:
   - Nombre: `reservas`
   - Signing mode: **Unsigned**
   - Folder: `reservas`

### 6. Deploy en GitHub Pages
```bash
git init
git add .
git commit -m "init"
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git push -u origin main
```
En GitHub → Settings → Pages → Source: `main` branch → `/` (root)

---

## Estructura del proyecto

```
/
├── index.html              ← Login
├── setup/index.html        ← Crear superadmin (borrar después)
├── admin/
│   ├── index.html          ← Panel superadmin (negocios + usuarios)
│   └── negocio.html        ← Panel gerente (servicios, profesionales, reservas)
├── public/
│   └── [slug]/index.html   ← Página pública de reservas (cliente)
│   └── reserva.html        ← Página de reserva genérica con ?negocio=slug
└── assets/
    ├── css/main.css
    └── js/firebase-config.js
```

## Estructura Firestore

```
negocios/{negocioId}
  .nombre, .slug, .logo, .color_primario, .activo, ...
  configuracion/config     ← doc único
  servicios/{id}           ← nombre, duracion_min, precio, color...
  profesionales/{id}       ← nombre, especialidad, horarios...
  horarios/{profesionalId} ← dia_semana, hora_inicio, hora_fin
  bloqueos/{id}            ← fecha_inicio, fecha_fin, profesional_id
  reservas/{id}            ← cliente, servicio, profesional, fecha, hora...
  medios_pago/config       ← doc único

usuarios/{uid}
  .nombre, .email, .rol (superadmin|gerente), .negocio_id, .activo
```

---

## Módulos a construir (en orden)
- [x] Login / Registro
- [x] Panel superadmin — Negocios
- [x] Panel superadmin — Usuarios
- [ ] Panel gerente — Servicios
- [ ] Panel gerente — Profesionales + Horarios
- [ ] Panel gerente — Reservas (agenda/lista)
- [ ] Página pública de reservas (cliente)
- [ ] Bloqueos de agenda
- [ ] Comprobantes de pago
- [ ] Notificaciones
