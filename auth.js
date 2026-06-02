// ============ Authentication Module ============

const googleProvider = new firebase.auth.GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// ============ Sign In with Google (ONLY auth method) ============
async function signInWithGoogle() {
    try {
        showLoader();
        
        const result = await auth.signInWithPopup(googleProvider);
        const user = result.user;
        
        // Check/Create user profile in Firestore
        let userProfile = await getFromFirestore('users', user.uid);
        
        if (!userProfile) {
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
        } else {
            // Update last login
            await saveToFirestore('users', user.uid, {
                lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
                photoURL: user.photoURL || userProfile.photoURL,
                displayName: user.displayName || userProfile.displayName
            });
        }
        
        // Set app state
        APP_STATE.currentUser = user;
        APP_STATE.userProfile = userProfile;
        APP_STATE.isAuthenticated = true;
        
        // Update header avatar everywhere
        updateAllAvatars(user.photoURL);
        
        hideLoader();
        showToast(`Welcome, ${userProfile.username || user.displayName}!`, 'success');
        
        // Navigate based on role
        if (isAdmin(user.email)) {
            navigateTo('admin');
        } else {
            navigateTo('home');
            loadHomePage();
        }
        
    } catch (error) {
        hideLoader();
        console.error('Google Sign-In Error:', error.code, error.message);
        
        switch (error.code) {
            case 'auth/popup-closed-by-user':
                showToast('Sign in cancelled', 'warning');
                break;
            case 'auth/popup-blocked':
                showToast('Please allow popups for this site', 'error');
                break;
            case 'auth/cancelled-popup-request':
                showToast('Sign in cancelled', 'warning');
                break;
            case 'auth/network-request-failed':
                showToast('Network error. Check your connection', 'error');
                break;
            case 'auth/account-exists-with-different-credential':
                showToast('Account exists with different sign-in method', 'error');
                break;
            default:
                showToast('Sign in failed. Please try again', 'error');
        }
    }
}

// ============ Sign Out ============
async function signOut() {
    try {
        showLoader();
        await auth.signOut();
        
        // Clear app state
        APP_STATE.currentUser = null;
        APP_STATE.userProfile = null;
        APP_STATE.isAuthenticated = false;
        APP_STATE.cart = [];
        APP_STATE.selectedProduct = null;
        APP_STATE.navigationHistory = [];
        
        hideLoader();
        showToast('Signed out successfully', 'success');
        navigateTo('onboarding');
        
    } catch (error) {
        hideLoader();
        console.error('Sign Out Error:', error);
        showToast('Error signing out', 'error');
    }
}

// ============ Auth State Observer ============
auth.onAuthStateChanged(async (user) => {
    if (user) {
        APP_STATE.currentUser = user;
        APP_STATE.isAuthenticated = true;
        
        const userProfile = await getFromFirestore('users', user.uid);
        APP_STATE.userProfile = userProfile;
        
        updateAllAvatars(user.photoURL);
        
        // If on onboarding or auth screen, redirect
        if (APP_STATE.currentScreen === 'onboarding' || APP_STATE.currentScreen === 'auth') {
            if (isAdmin(user.email)) {
                navigateTo('admin');
            } else {
                navigateTo('home');
                loadHomePage();
            }
        }
    } else {
        APP_STATE.currentUser = null;
        APP_STATE.userProfile = null;
        APP_STATE.isAuthenticated = false;
    }
});

// ============ Update All Avatar Images ============
function updateAllAvatars(photoURL) {
    const avatars = document.querySelectorAll('#header-avatar, .profile-avatar-large');
    const defaultAvatar = 'app-icon.png';
    
    avatars.forEach(avatar => {
        if (photoURL) {
            avatar.src = photoURL;
            avatar.onerror = () => { avatar.src = defaultAvatar; };
        } else {
            avatar.src = defaultAvatar;
        }
    });
}

// ============ Check Auth for Protected Routes ============
function requireAuth() {
    if (!APP_STATE.isAuthenticated || !APP_STATE.currentUser) {
        showToast('Please sign in to continue', 'warning');
        navigateTo('auth');
        return false;
    }
    return true;
}

// ============ Refresh User Profile ============
async function refreshUserProfile() {
    if (!APP_STATE.currentUser) return null;
    const profile = await getFromFirestore('users', APP_STATE.currentUser.uid);
    if (profile) {
        APP_STATE.userProfile = profile;
    }
    return profile;
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