// firebase.js - COMPLETELY FIXED with proper initialization
const firebaseConfig = {
    apiKey: "AIzaSyDRlGps4_dqRBJ2SYmbeXtdDRGTIvYQ510",
    authDomain: "serviconnect-446dd.firebaseapp.com",
    projectId: "serviconnect-446dd",
    storageBucket: "serviconnect-446dd.firebasestorage.app",
    messagingSenderId: "102078290806",
    appId: "1:102078290806:web:88a6e1f9908100a3253857"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();

// Enable offline persistence
db.enablePersistence({ synchronizeTabs: true })
    .then(() => console.log('✅ Firestore persistence enabled'))
    .catch((err) => console.warn('Persistence error:', err.code));

// Set auth persistence
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .then(() => console.log('✅ Auth persistence set'))
    .catch(err => console.warn('Auth persistence error:', err));

console.log('🔥 Firebase initialized successfully');
console.log('📁 Project:', firebaseConfig.projectId);