// auth.js - WORKING VERSION
console.log('✅ auth.js loaded');

let authInProgress = false;

function initializeAuth() {
    console.log('🔐 Auth initialized');
    const savedUserId = localStorage.getItem('shoplify_uid');
    if (localStorage.getItem('shoplify_auth') === 'true' && savedUserId) {
        db.collection('users').doc(savedUserId).get().then(doc => {
            if (doc.exists && !doc.data().isSuspended) {
                APP.currentUser = { uid: savedUserId };
                APP.userProfile = doc.data();
                APP.userProfile.uid = savedUserId;
            }
        }).catch(() => {});
    }
}

async function signInWithGoogle() {
    if (authInProgress) return;
    authInProgress = true;
    
    try {
        showLoader();
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        const result = await auth.signInWithPopup(provider);
        const user = result.user;
        
        const userDoc = await db.collection('users').doc(user.uid).get();
        
        if (!userDoc.exists) {
            APP.currentUser = user;
            hideLoader();
            navigateTo('account-type');
            showToast('Welcome! Choose your account type.', 'info');
        } else {
            const userData = userDoc.data();
            if (userData.isSuspended) {
                await auth.signOut();
                hideLoader();
                showToast('Account suspended.', 'error');
                authInProgress = false;
                return;
            }
            APP.currentUser = user;
            APP.userProfile = userData;
            APP.userProfile.uid = user.uid;
            localStorage.setItem('shoplify_auth', 'true');
            localStorage.setItem('shoplify_uid', user.uid);
            hideLoader();
            navigateTo('home');
            showToast('Welcome back! 👋', 'success');
        }
    } catch (error) {
        hideLoader();
        if (error.code !== 'auth/popup-closed-by-user') showToast('Sign-in failed', 'error');
    }
    authInProgress = false;
}

async function signInWithCredentials() {
    if (authInProgress) return;
    
    const username = document.getElementById('auth-username')?.value?.trim()?.toLowerCase();
    const password = document.getElementById('auth-password')?.value;
    
    if (!username || !password) { showToast('Enter username and password', 'error'); return; }
    
    authInProgress = true;
    const btn = document.querySelector('.auth-form .btn-gold');
    if (btn) { btn.disabled = true; btn.textContent = 'Signing in...'; }
    
    try {
        const snapshot = await db.collection('users').where('username', '==', username).limit(1).get();
        if (snapshot.empty) { showToast('Account not found', 'error'); resetBtn(btn); authInProgress = false; return; }
        
        const doc = snapshot.docs[0];
        const user = doc.data();
        if (user.password !== password) { showToast('Invalid password', 'error'); resetBtn(btn); authInProgress = false; return; }
        if (user.isSuspended) { showToast('Account suspended', 'error'); resetBtn(btn); authInProgress = false; return; }
        
        APP.currentUser = { uid: doc.id, email: user.email };
        APP.userProfile = user;
        APP.userProfile.uid = doc.id;
        localStorage.setItem('shoplify_auth', 'true');
        localStorage.setItem('shoplify_uid', doc.id);
        
        resetBtn(btn);
        document.getElementById('auth-username').value = '';
        document.getElementById('auth-password').value = '';
        navigateTo('home');
        showToast(`Welcome, ${user.displayName || username}!`, 'success');
    } catch (error) { showToast('Login failed', 'error'); resetBtn(btn); }
    authInProgress = false;
}

function resetBtn(btn) { if (btn) { btn.disabled = false; btn.textContent = 'Sign In'; } }

function selectAccountType(type) {
    APP.selectedAccountType = type;
    document.querySelectorAll('.account-type-card').forEach(c => c.classList.remove('selected'));
    const cards = document.querySelectorAll('.account-type-card');
    cards.forEach(card => { if (card.textContent.toLowerCase().includes(type)) card.classList.add('selected'); });
    
    setTimeout(() => {
        if (type === 'customer') {
            navigateTo('setup-credentials');
            setTimeout(populateCountryDropdown, 300);
        } else {
            signInWithGoogleForSetup(type);
        }
    }, 400);
}

async function signInWithGoogleForSetup(type) {
    try {
        showLoader();
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        const result = await auth.signInWithPopup(provider);
        APP.currentUser = result.user;
        APP.selectedAccountType = type;
        hideLoader();
        navigateTo('setup-credentials');
        setTimeout(populateCountryDropdown, 500);
    } catch (error) { hideLoader(); if (error.code !== 'auth/popup-closed-by-user') showToast('Auth failed', 'error'); }
}

async function completeSetup() {
    const username = document.getElementById('setup-username')?.value?.trim()?.toLowerCase();
    const password = document.getElementById('setup-password')?.value;
    const country = document.getElementById('setup-country')?.value;
    const phone = document.getElementById('setup-phone')?.value?.trim();
    const accountType = APP.selectedAccountType || 'customer';
    
    if (!username || !/^[a-z0-9]{3,30}$/.test(username)) { showToast('Username: 3-30 lowercase letters/numbers', 'error'); return; }
    if (!password || password.length < 6) { showToast('Password: 6+ characters', 'error'); return; }
    if (!country) { showToast('Select country', 'error'); return; }
    if (!phone) { showToast('Phone required', 'error'); return; }
    
    const userId = APP.currentUser?.uid || generateId();
    showLoader();
    
    try {
        const check = await db.collection('users').where('username', '==', username).limit(1).get();
        if (!check.empty) { hideLoader(); showToast('Username taken', 'error'); return; }
        
        const cData = COUNTRIES[country] || {};
        const userData = {
            uid: userId, email: APP.currentUser?.email || `${username}@shoplify.user`,
            displayName: APP.currentUser?.displayName || username,
            photoURL: APP.currentUser?.photoURL || '',
            username, password,
            phoneNumber: (cData.code || '+1') + phone,
            country, countryFlag: cData.flag || '🌍',
            currency: cData.currency || 'USD',
            accountType, walletBalance: 0, affiliateEarnings: 0, pendingEarnings: 0, escrowBalance: 0,
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
        navigateTo('home');
        showToast('Account created! 🚀', 'success');
    } catch (error) { hideLoader(); showToast('Failed', 'error'); }
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
    if (display && country && COUNTRIES?.[country]) display.textContent = COUNTRIES[country].code || '+1';
}

function isLoggedIn() { return localStorage.getItem('shoplify_auth') === 'true'; }

function logout() {
    localStorage.removeItem('shoplify_auth');
    localStorage.removeItem('shoplify_uid');
    sessionStorage.clear();
    auth.signOut().catch(() => {});
    APP.currentUser = null;
    APP.userProfile = null;
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById('screen-auth').classList.remove('hidden');
    window.location.hash = 'auth';
}
