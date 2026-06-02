// ============ Authentication Module - FIXED ============

// Google Auth Provider
let googleProvider;

function initAuthProvider() {
    googleProvider = new firebase.auth.GoogleAuthProvider();
    googleProvider.setCustomParameters({
        prompt: 'select_account'
    });
    console.log('✅ Google Auth Provider initialized');
}

// Initialize provider
initAuthProvider();

// ============ Sign In with Google ============
async function signInWithGoogle() {
    console.log('🔑 Sign in button clicked');
    
    // Show loading immediately
    const btn = document.querySelector('.btn-google');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';
    }
    
    try {
        // Check if Firebase auth is ready
        if (!auth) {
            console.error('❌ Firebase Auth not initialized');
            showToast('Authentication service not ready. Please wait.', 'error');
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<i class="fab fa-google"></i> Continue with Google';
            }
            return;
        }
        
        console.log('🔄 Attempting Google sign in...');
        
        // Use signInWithPopup
        const result = await auth.signInWithPopup(googleProvider);
        const user = result.user;
        
        console.log('✅ Google sign in successful:', user.email);
        
        // Process user profile
        await processUserProfile(user);
        
        // Reset button
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fab fa-google"></i> Continue with Google';
        }
        
    } catch (error) {
        console.error('❌ Sign in error:', error.code, error.message);
        
        // Reset button
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fab fa-google"></i> Continue with Google';
        }
        
        // Handle specific errors
        switch (error.code) {
            case 'auth/popup-closed-by-user':
                showToast('Sign in cancelled', 'warning');
                break;
            case 'auth/popup-blocked':
                showToast('Popup blocked! Please allow popups for this site.', 'error');
                // Try redirect method as fallback
                try {
                    await auth.signInWithRedirect(googleProvider);
                } catch (redirectError) {
                    console.error('Redirect sign in also failed:', redirectError);
                }
                break;
            case 'auth/cancelled-popup-request':
                showToast('Sign in cancelled', 'warning');
                break;
            case 'auth/network-request-failed':
                showToast('Network error. Check your internet connection.', 'error');
                break;
            case 'auth/operation-not-allowed':
                showToast('Google sign in is not enabled. Contact admin.', 'error');
                break;
            case 'auth/internal-error':
                showToast('Authentication service error. Please try again.', 'error');
                break;
            case 'auth/unauthorized-domain':
                showToast('This domain is not authorized for sign in.', 'error');
                break;
            default:
                showToast('Sign in failed: ' + (error.message || 'Unknown error'), 'error');
        }
    }
}

// ============ Process User Profile After Sign In ============
async function processUserProfile(user) {
    showLoader();
    
    try {
        // Check if user exists in Firestore
        let userProfile = await getFromFirestore('users', user.uid);
        
        if (!userProfile) {
            console.log('📝 Creating new user profile...');
            
            // Create new user profile
            userProfile = {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || user.email.split('@')[0],
                photoURL: user.photoURL || '',
                phoneNumber: user.phoneNumber || '',
                walletBalance: 0,
                affiliateEarnings: 0,
                pendingEarnings: 0,
                escrowBalance: 0,
                withdrawnBalance: 0,
                membership: 'free',
                role: isAdmin(user.email) ? 'admin' : 'customer',
                isMerchant: false,
                isAffiliate: false,
                merchantSubscription: null,
                affiliateSubscription: null,
                bankAccounts: [],
                suspensionCount: 0,
                isSuspended: false,
                storeTemplate: null,
                storeActive: false,
                username: user.displayName || user.email.split('@')[0],
                theme: 'light',
                textSize: 'medium',
                language: 'en',
                notifications: true,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            await saveToFirestore('users', user.uid, userProfile);
            console.log('✅ New user profile created');
        } else {
            // Update last login
            await saveToFirestore('users', user.uid, {
                lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
                photoURL: user.photoURL || userProfile.photoURL,
                displayName: user.displayName || userProfile.displayName
            }).catch(err => console.warn('Update last login failed:', err));
            
            console.log('✅ Existing user profile loaded');
        }
        
        // Set app state
        APP_STATE.currentUser = user;
        APP_STATE.userProfile = userProfile;
        APP_STATE.isAuthenticated = true;
        
        // Update avatars
        updateAllAvatars(user.photoURL || userProfile.photoURL);
        
        hideLoader();
        
        // Show welcome message
        const username = userProfile.username || userProfile.displayName || user.displayName || 'User';
        showToast(`Welcome, ${username}! 🎉`, 'success');
        
        // Navigate based on role
        if (isAdmin(user.email)) {
            console.log('🔑 Admin access granted');
            navigateTo('admin');
        } else {
            console.log('🏠 Navigating to home');
            navigateTo('home');
            // Load home data after a short delay
            setTimeout(() => {
                if (typeof loadHomePage === 'function') {
                    loadHomePage();
                }
            }, 500);
        }
        
    } catch (error) {
        hideLoader();
        console.error('❌ Profile processing error:', error);
        showToast('Error loading profile. Please try again.', 'error');
        
        // Still allow access even if profile fails
        APP_STATE.currentUser = user;
        APP_STATE.isAuthenticated = true;
        navigateTo('home');
    }
}

// ============ Sign Out ============
async function signOut() {
    console.log('👋 Signing out...');
    
    // Show confirmation
    const confirmed = confirm('Are you sure you want to sign out?');
    if (!confirmed) return;
    
    showLoader();
    
    try {
        // Save cart before signing out
        if (APP_STATE.cart && APP_STATE.cart.length > 0) {
            localStorage.setItem('serviconnect_cart', JSON.stringify(APP_STATE.cart));
        }
        
        await auth.signOut();
        
        // Clear app state
        APP_STATE.currentUser = null;
        APP_STATE.userProfile = null;
        APP_STATE.isAuthenticated = false;
        APP_STATE.cart = [];
        APP_STATE.selectedProduct = null;
        APP_STATE.navigationHistory = [];
        
        hideLoader();
        console.log('✅ Signed out successfully');
        showToast('Signed out successfully', 'success');
        
        // Navigate to onboarding
        navigateTo('onboarding');
        
    } catch (error) {
        hideLoader();
        console.error('❌ Sign out error:', error);
        showToast('Error signing out', 'error');
    }
}

// ============ Auth State Observer ============
auth.onAuthStateChanged(async (user) => {
    console.log('🔐 Auth state changed:', user ? user.email : 'No user');
    
    if (user) {
        // User is signed in
        APP_STATE.currentUser = user;
        APP_STATE.isAuthenticated = true;
        
        // Get profile if not already loaded
        if (!APP_STATE.userProfile || APP_STATE.userProfile.uid !== user.uid) {
            const profile = await getFromFirestore('users', user.uid);
            if (profile) {
                APP_STATE.userProfile = profile;
                updateAllAvatars(user.photoURL || profile.photoURL);
            }
        }
        
        // If on auth or onboarding screen, redirect
        const currentScreen = APP_STATE.currentScreen;
        if (currentScreen === 'onboarding' || currentScreen === 'auth' || !currentScreen) {
            if (isAdmin(user.email)) {
                navigateTo('admin');
            } else {
                navigateTo('home');
                setTimeout(() => {
                    if (typeof loadHomePage === 'function') loadHomePage();
                }, 300);
            }
        }
        
    } else {
        // User is signed out
        APP_STATE.currentUser = null;
        APP_STATE.userProfile = null;
        APP_STATE.isAuthenticated = false;
        
        // Don't redirect if already on auth or onboarding
        const currentScreen = APP_STATE.currentScreen;
        if (currentScreen && currentScreen !== 'onboarding' && currentScreen !== 'auth') {
            navigateTo('onboarding');
        }
    }
});

// ============ Update All Avatar Images ============
function updateAllAvatars(photoURL) {
    const defaultAvatar = 'app-icon.png';
    const avatars = document.querySelectorAll('#header-avatar, .profile-avatar-large, .avatar-small');
    
    avatars.forEach(avatar => {
        if (photoURL && photoURL !== '') {
            avatar.src = photoURL;
            avatar.onerror = function() {
                this.src = defaultAvatar;
            };
        } else {
            avatar.src = defaultAvatar;
        }
    });
}

// ============ Check Auth for Protected Routes ============
function requireAuth() {
    if (!APP_STATE.isAuthenticated || !APP_STATE.currentUser) {
        console.warn('⚠️ Auth required but user not authenticated');
        showToast('Please sign in to continue', 'warning');
        navigateTo('auth');
        return false;
    }
    return true;
}

// ============ Refresh User Profile ============
async function refreshUserProfile() {
    if (!APP_STATE.currentUser) return null;
    
    try {
        const profile = await getFromFirestore('users', APP_STATE.currentUser.uid);
        if (profile) {
            APP_STATE.userProfile = profile;
        }
        return profile;
    } catch (error) {
        console.error('Refresh profile error:', error);
        return APP_STATE.userProfile;
    }
}

// ============ Update User Profile ============
async function updateUserProfile(updates) {
    if (!APP_STATE.currentUser) return false;
    
    try {
        await saveToFirestore('users', APP_STATE.currentUser.uid, updates);
        APP_STATE.userProfile = { ...APP_STATE.userProfile, ...updates };
        return true;
    } catch (error) {
        console.error('Update profile error:', error);
        return false;
    }
}

// ============ Check Subscription Status ============
async function checkSubscription(type) {
    const profile = await refreshUserProfile();
    if (!profile) return false;
    
    if (type === 'merchant') {
        return profile.isMerchant && profile.merchantSubscription === 'active';
    }
    if (type === 'affiliate') {
        return profile.isAffiliate && profile.affiliateSubscription === 'active';
    }
    return false;
}

// ============ Make signInWithGoogle globally accessible ============
window.signInWithGoogle = signInWithGoogle;
window.signOut = signOut;

console.log('✅ Auth module loaded and ready');
