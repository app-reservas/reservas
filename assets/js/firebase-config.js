// ============================================================
//  REEMPLAZÁ ESTOS VALORES CON LOS DE TU PROYECTO FIREBASE
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

// Cloudinary
const CLOUDINARY_CLOUD  = "mbjufe1a";   // ej: ddfukywf8
const CLOUDINARY_PRESET = "reservas";         // upload preset sin firmar

// UID del superadmin (lo copiás de Firebase Auth después de crear la cuenta)
const SUPERADMIN_UID = "Zrd9dbBwwMd7f3YHykSxOYPH0X93";

// ============================================================
firebase.initializeApp(FIREBASE_CONFIG);
const db   = firebase.firestore();
const auth = firebase.auth();
