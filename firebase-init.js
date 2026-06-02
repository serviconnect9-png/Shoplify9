// ============ Firebase Initialization ============
let firebaseApp;
let auth;
let db;
let storage;

function initializeFirebase() {
    try {
        firebaseApp = firebase.initializeApp(FIREBASE_CONFIG);
        auth = firebase.auth();
        db = firebase.firestore();
        storage = firebase.storage();
        
        db.enablePersistence({ synchronizeTabs: true })
            .then(() => console.log('✅ Firestore persistence enabled'))
            .catch((err) => {
                if (err.code === 'failed-precondition') {
                    console.warn('⚠️ Multiple tabs open, persistence disabled');
                } else if (err.code === 'unimplemented') {
                    console.warn('⚠️ Browser does not support persistence');
                }
            });
        
        db.settings({ cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED, merge: true });
        
        console.log('✅ Firebase initialized successfully');
        return true;
    } catch (error) {
        console.error('❌ Firebase initialization error:', error);
        return false;
    }
}

initializeFirebase();