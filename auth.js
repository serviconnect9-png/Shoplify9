// auth.js - ABSOLUTE MINIMUM VERSION THAT WORKS

// Wait for everything to load
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔐 Auth.js loaded and ready');
});

// =====================
// GOOGLE SIGN IN
// =====================
async function signInWithGoogle() {
    console.log('🔑 Google sign-in called');
    try {
        showLoader();
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        const result = await auth.signInWithPopup(provider);
        const user = result.user;
        
        console.log('✅ Google user:', user.uid);
        
        // Check if user exists
        const userDoc = await db.collection('users').doc(user.uid).get();
        
        if (!userDoc.exists) {
            // New user
            APP.currentUser = user;
            hideLoader();
            // Show account type screen
            document.getElementById('screen-auth').classList.add('hidden');
            document.getElementById('screen-account-type').classList.remove('hidden');
            window.location.hash = 'account-type';
            showToast('Welcome! Choose your account type.', 'info');
        } else {
            // Existing user
            const userData = userDoc.data();
            APP.currentUser = user;
            APP.userProfile = userData;
            APP.userProfile.uid = user.uid;
            
            localStorage.setItem('shoplify_auth', 'true');
            localStorage.setItem('shoplify_uid', user.uid);
            
            hideLoader();
            document.getElementById('screen-auth').classList.add('hidden');
            document.getElementById('screen-home').classList.remove('hidden');
            window.location.hash = 'home';
            showToast('Welcome back! 👋', 'success');
        }
    } catch (error) {
        hideLoader();
        console.error('Google error:', error);
        if (error.code !== 'auth/popup-closed-by-user') {
            showToast('Sign-in failed', 'error');
        }
    }
}

// =====================
// USERNAME/PASSWORD LOGIN
// =====================
async function signInWithCredentials() {
    console.log('🔑 Login called');
    
    const usernameInput = document.getElementById('auth-username');
    const passwordInput = document.getElementById('auth-password');
    
    if (!usernameInput || !passwordInput) {
        showToast('Form not ready', 'error');
        return;
    }
    
    const username = usernameInput.value.trim().toLowerCase();
    const password = passwordInput.value;
    
    if (!username || !password) {
        showToast('Enter username and password', 'error');
        return;
    }
    
    showLoader();
    
    try {
        const snapshot = await db.collection('users')
            .where('username', '==', username)
            .limit(1)
            .get();
        
        if (snapshot.empty) {
            hideLoader();
            showToast('Account not found', 'error');
            return;
        }
        
        const doc = snapshot.docs[0];
        const user = doc.data();
        
        if (user.password !== password) {
            hideLoader();
            showToast('Invalid password', 'error');
            return;
        }
        
        // SUCCESS
        APP.currentUser = { uid: doc.id, email: user.email };
        APP.userProfile = user;
        APP.userProfile.uid = doc.id;
        
        localStorage.setItem('shoplify_auth', 'true');
        localStorage.setItem('shoplify_uid', doc.id);
        
        usernameInput.value = '';
        passwordInput.value = '';
        
        hideLoader();
        document.getElementById('screen-auth').classList.add('hidden');
        document.getElementById('screen-home').classList.remove('hidden');
        window.location.hash = 'home';
        showToast(`Welcome, ${user.displayName || username}!`, 'success');
        
    } catch (error) {
        hideLoader();
        console.error('Login error:', error);
        showToast('Login failed', 'error');
    }
}

// =====================
// SELECT ACCOUNT TYPE
// =====================
function selectAccountType(type) {
    console.log('📝 Type selected:', type);
    APP.selectedAccountType = type;
    
    // Highlight
    document.querySelectorAll('.account-type-card').forEach(c => c.classList.remove('selected'));
    const cards = document.querySelectorAll('.account-type-card');
    cards.forEach(card => {
        if (card.textContent.toLowerCase().includes(type)) card.classList.add('selected');
    });
    
    setTimeout(function() {
        if (type === 'customer') {
            // Customer - go directly to setup
            document.getElementById('screen-account-type').classList.add('hidden');
            document.getElementById('screen-setup-credentials').classList.remove('hidden');
            window.location.hash = 'setup-credentials';
            setTimeout(populateCountryDropdown, 300);
        } else {
            // Affiliate/Merchant - Google auth first
            signInWithGoogleForSetup(type);
        }
    }, 400);
}

async function signInWithGoogleForSetup(type) {
    console.log('🔑 Google setup for:', type);
    try {
        showLoader();
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        const result = await auth.signInWithPopup(provider);
        
        APP.currentUser = result.user;
        APP.selectedAccountType = type;
        
        hideLoader();
        document.getElementById('screen-account-type').classList.add('hidden');
        document.getElementById('screen-setup-credentials').classList.remove('hidden');
        window.location.hash = 'setup-credentials';
        setTimeout(populateCountryDropdown, 500);
    } catch (error) {
        hideLoader();
        if (error.code !== 'auth/popup-closed-by-user') {
            showToast('Auth failed', 'error');
        }
    }
}

// =====================
// COMPLETE SETUP
// =====================
async function completeSetup() {
    const username = document.getElementById('setup-username')?.value?.trim()?.toLowerCase();
    const password = document.getElementById('setup-password')?.value;
    const country = document.getElementById('setup-country')?.value;
    const phone = document.getElementById('setup-phone')?.value?.trim();
    const accountType = APP.selectedAccountType || 'customer';
    
    if (!username || !/^[a-z0-9]{3,30}$/.test(username)) {
        showToast('Username: 3-30 lowercase letters/numbers', 'error');
        return;
    }
    if (!password || password.length < 6) {
        showToast('Password: at least 6 characters', 'error');
        return;
    }
    if (!country) {
        showToast('Select your country', 'error');
        return;
    }
    if (!phone) {
        showToast('Phone number required', 'error');
        return;
    }
    
    const userId = APP.currentUser?.uid || ('user_' + Date.now());
    
    showLoader();
    
    try {
        // Check username
        const check = await db.collection('users').where('username', '==', username).limit(1).get();
        if (!check.empty) {
            hideLoader();
            showToast('Username taken', 'error');
            return;
        }
        
        const cData = COUNTRIES[country] || {};
        
        const userData = {
            uid: userId,
            email: APP.currentUser?.email || `${username}@shoplify.user`,
            displayName: APP.currentUser?.displayName || username,
            photoURL: APP.currentUser?.photoURL || '',
            username, password,
            phoneNumber: (cData.code || '+1') + phone,
            country, countryFlag: cData.flag || '🌍',
            currency: cData.currency || 'USD',
            accountType,
            walletBalance: 0, affiliateEarnings: 0, pendingEarnings: 0, escrowBalance: 0,
            isMerchant: false, isAffiliate: false, isDropshipper: false,
            merchantSubscription: false, affiliateSubscription: false,
            totalSales: 0, totalRevenue: 0, totalReferrals: 0,
            referralCode: 'ref_' + username + '_' + Date.now().toString(36),
            theme: 'light', textSize: 'medium',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection('users').doc(userId).set(userData);
        
        APP.currentUser = { uid: userId, email: userData.email };
        APP.userProfile = userData;
        
        localStorage.setItem('shoplify_auth', 'true');
        localStorage.setItem('shoplify_uid', userId);
        
        hideLoader();
        document.getElementById('screen-setup-credentials').classList.add('hidden');
        document.getElementById('screen-home').classList.remove('hidden');
        window.location.hash = 'home';
        showToast('Account created! 🚀', 'success');
        
    } catch (error) {
        hideLoader();
        console.error('Setup error:', error);
        showToast('Failed. Try again.', 'error');
    }
}

function populateCountryDropdown() {
    const select = document.getElementById('setup-country');
    if (!select || select.options.length > 1) return;
    select.innerHTML = '<option value="">Select Country</option>';
    if (typeof COUNTRIES !== 'undefined') {
        Object.entries(COUNTRIES).sort((a,b) => a[1].name.localeCompare(b[1].name))
            .forEach(([code, data]) => {
                const opt = document.createElement('option');
                opt.value = code;
                opt.textContent = `${data.flag || ''} ${data.name}`;
                select.appendChild(opt);
            });
    }
}

function updateCountryCode() {
    const country = document.getElementById('setup-country')?.value;
    const display = document.getElementById('country-code-display');
    if (display && country && COUNTRIES?.[country]) {
        display.textContent = COUNTRIES[country].code || '+1';
    }
}

function isLoggedIn() {
    return localStorage.getItem('shoplify_auth') === 'true';
}

function logout() {
    localStorage.removeItem('shoplify_auth');
    localStorage.removeItem('shoplify_uid');
    sessionStorage.clear();
    auth.signOut().catch(function(){});
    APP.currentUser = null;
    APP.userProfile = null;
    document.querySelectorAll('.screen').forEach(function(s) { s.classList.add('hidden'); });
    document.getElementById('screen-auth').classList.remove('hidden');
    window.location.hash = 'auth';
}

console.log('✅ auth.js loaded');
