// ============ AUTHENTICATION MODULE - FIXED ============

// Wait for Firebase to be fully ready
function getAuth() {
    if (window.auth) {
        return window.auth;
    }
    if (typeof firebase !== 'undefined' && firebase.auth) {
        var a = firebase.auth();
        window.auth = a;
        return a;
    }
    return null;
}

function getDb() {
    if (window.db) {
        return window.db;
    }
    if (typeof firebase !== 'undefined' && firebase.firestore) {
        var d = firebase.firestore();
        window.db = d;
        return d;
    }
    return null;
}

// ============ SIGN IN WITH GOOGLE ============
function signInWithGoogle() {
    console.log('🔑 Sign in button clicked');
    
    var btn = document.querySelector('.btn-google') || document.getElementById('google-signin-btn');
    
    // Show loading on button
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';
    }
    
    // Check if Firebase is loaded
    if (typeof firebase === 'undefined') {
        console.error('❌ Firebase SDK not loaded');
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fab fa-google"></i> Continue with Google';
        }
        alert('App is still loading. Please wait a moment and try again.');
        return;
    }
    
    // Initialize Firebase if not already done
    if (!firebase.apps || firebase.apps.length === 0) {
        try {
            console.log('Initializing Firebase...');
            firebase.initializeApp(FIREBASE_CONFIG);
            console.log('✅ Firebase initialized');
        } catch(e) {
            console.error('Firebase init error:', e);
            
            // Try to get existing app
            if (e.code === 'app/duplicate-app') {
                console.log('Firebase already initialized elsewhere');
            } else {
                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = '<i class="fab fa-google"></i> Continue with Google';
                }
                alert('Failed to initialize. Please refresh the page.');
                return;
            }
        }
    }
    
    var auth = firebase.auth();
    window.auth = auth;
    
    // Create Google provider
    var provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({
        prompt: 'select_account'
    });
    
    console.log('🔄 Opening Google popup...');
    
    // Sign in with popup
    auth.signInWithPopup(provider)
        .then(function(result) {
            console.log('✅ Sign in successful!');
            console.log('User:', result.user.email);
            console.log('Display name:', result.user.displayName);
            
            // Save user data
            saveUserToFirestore(result.user);
            
            // Set app state
            APP_STATE.currentUser = result.user;
            APP_STATE.isAuthenticated = true;
            
            // Reset button
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<i class="fab fa-google"></i> Continue with Google';
            }
            
            // Show success
            if (typeof showToast === 'function') {
                showToast('Welcome, ' + (result.user.displayName || 'User') + '!', 'success');
            }
            
            // Navigate to home
            console.log('🏠 Navigating to home...');
            if (typeof showScreenOnly === 'function') {
                showScreenOnly('home');
            }
            if (typeof loadHomePage === 'function') {
                setTimeout(function() {
                    loadHomePage();
                }, 500);
            }
            
        })
        .catch(function(error) {
            console.error('❌ Sign in error:', error.code);
            console.error('Message:', error.message);
            
            // Reset button
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<i class="fab fa-google"></i> Continue with Google';
            }
            
            // Handle errors
            var message = 'Sign in failed. Please try again.';
            
            if (error.code === 'auth/popup-closed-by-user') {
                message = 'Sign in cancelled';
            } else if (error.code === 'auth/popup-blocked') {
                message = 'Popup blocked! Please allow popups for this site.';
            } else if (error.code === 'auth/cancelled-popup-request') {
                message = 'Sign in cancelled';
            } else if (error.code === 'auth/network-request-failed') {
                message = 'Network error. Check your internet connection.';
            } else if (error.code === 'auth/operation-not-allowed') {
                message = 'Google sign-in is not enabled. Check Firebase Console.';
            } else if (error.code === 'auth/unauthorized-domain') {
                message = 'This domain is not authorized. Add it in Firebase Console.';
            } else if (error.code === 'auth/internal-error') {
                message = 'Authentication service error. Try again.';
            }
            
            if (typeof showToast === 'function') {
                showToast(message, 'error');
            } else {
                alert(message);
            }
        });
}

// ============ SAVE USER TO FIRESTORE ============
function saveUserToFirestore(user) {
    console.log('💾 Saving user to Firestore...');
    
    var db = getDb();
    if (!db) {
        console.error('❌ Firestore not available');
        return;
    }
    
    var userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email.split('@')[0],
        photoURL: user.photoURL || '',
        walletBalance: 0,
        affiliateEarnings: 0,
        pendingEarnings: 0,
        escrowBalance: 0,
        withdrawnBalance: 0,
        membership: 'free',
        role: user.email === ADMIN_EMAIL ? 'admin' : 'customer',
        isMerchant: false,
        isAffiliate: false,
        bankAccounts: [],
        suspensionCount: 0,
        storeTemplate: null,
        storeActive: false,
        username: user.displayName || user.email.split('@')[0],
        theme: 'light',
        textSize: 'medium',
        lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    // Only set createdAt for new users
    db.collection('users').doc(user.uid).get()
        .then(function(doc) {
            if (!doc.exists) {
                userData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            }
            return db.collection('users').doc(user.uid).set(userData, { merge: true });
        })
        .then(function() {
            console.log('✅ User saved to Firestore');
            // Load profile into app state
            return db.collection('users').doc(user.uid).get();
        })
        .then(function(doc) {
            if (doc.exists) {
                APP_STATE.userProfile = doc.data();
                console.log('✅ Profile loaded into state');
            }
        })
        .catch(function(error) {
            console.error('❌ Firestore save error:', error);
            // Don't block the user - they can still use the app
        });
}

// ============ SIGN OUT ============
function signOut() {
    if (!confirm('Are you sure you want to sign out?')) {
        return;
    }
    
    var auth = getAuth();
    if (!auth) {
        console.error('Auth not available');
        return;
    }
    
    auth.signOut()
        .then(function() {
            console.log('✅ Signed out');
            
            // Clear state
            APP_STATE.currentUser = null;
            APP_STATE.userProfile = null;
            APP_STATE.isAuthenticated = false;
            APP_STATE.cart = [];
            
            if (typeof showToast === 'function') {
                showToast('Signed out successfully', 'success');
            }
            
            if (typeof showScreenOnly === 'function') {
                showScreenOnly('onboarding');
            }
        })
        .catch(function(error) {
            console.error('Sign out error:', error);
            if (typeof showToast === 'function') {
                showToast('Error signing out', 'error');
            }
        });
}

// ============ EXPORT FUNCTIONS ============
window.signInWithGoogle = signInWithGoogle;
window.signOut = signOut;
window.getAuth = getAuth;
window.getDb = getDb;

console.log('✅ Auth module ready');