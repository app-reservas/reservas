// ============================================================
//  REEMPLAZÁ ESTOS VALORES CON LOS DE TU PROYECTO FIREBASE
// ============================================================
const FIREBASE_CONFIG = {
  apiKey:            "875354211575755",
  authDomain:        "ReservasSystem.firebaseapp.com",
  projectId:         "981704236291",
  storageBucket:     "TU_PROJECT.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId:             "reservassystem"
  
  //apiKey:            "TU_API_KEY",
  //authDomain:        "TU_PROJECT.firebaseapp.com",
  //projectId:         "TU_PROJECT_ID",
  //storageBucket:     "TU_PROJECT.appspot.com",
  //messagingSenderId: "TU_SENDER_ID",
  //appId:             "TU_APP_ID"
};

// Cloudinary
const CLOUDINARY_CLOUD  = "mbjufe1a";   // ej: ddfukywf8
//const CLOUDINARY_CLOUD  = "TU_CLOUD_NAME";   // ej: ddfukywf8
const CLOUDINARY_PRESET = "reservas";         // upload preset sin firmar

// UID del superadmin (lo copiás de Firebase Auth después de crear la cuenta)
const SUPERADMIN_UID = "TU_UID_SUPERADMIN";

// ============================================================
firebase.initializeApp(FIREBASE_CONFIG);
const db   = firebase.firestore();
const auth = firebase.auth();
