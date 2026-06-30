// ============================================================
//  firebase-config.js — Conexión a Firebase (ReservasSystem)
// ============================================================
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBYlofFf061OYrnFcK1j3jfckDwzg_Twjo",
  authDomain: "reservassystem.firebaseapp.com",
  projectId: "reservassystem",
  storageBucket: "reservassystem.firebasestorage.app",
  messagingSenderId: "981704236291",
  appId: "1:981704236291:web:23375d1e26b65d7e769d36",
  measurementId: "G-807T947TZQ"
};

// Cloudinary (para subir logos, avatares, comprobantes, etc.)
const CLOUDINARY_CLOUD  = "mbjufe1a";
const CLOUDINARY_PRESET = "reservas";

// UID del superadmin
const SUPERADMIN_UID = "Zrd9dbBwwMd7f3YHykSxOYPH0X93";

// Nombre del sistema (equivalente a SISTEMA_NOMBRE de PHP)
const SISTEMA_NOMBRE = "ReservaSystem";

// ============================================================
firebase.initializeApp(FIREBASE_CONFIG);
const db   = firebase.firestore();
const auth = firebase.auth();
