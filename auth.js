// auth.js - COMPLETELY FIXED VERSION
let authInProgress = false;

// =====================
// INITIALIZE
// =====================
function initializeAuth() {
    console.log('🔐 Auth system ready');
    
    const savedSession = localStorage.getItem('shoplify_auth');
    const savedUserId = localStorage.getItem('shoplify_uid');
    
    if (savedSession === 'true' && savedUserId) {
        db.collection('users').doc(savedUserId).get().then(doc => {
            if (doc.exists && !doc.data().isSuspended) {
                APP.currentUser = { uid: savedUserId };
                APP.userProfile = doc.data();
                APP.userProfile.uid = savedUserId;
                console.log('✅ Session restored');
            }
        }).catch(() => {});
    }
    
    auth.onAuthStateChanged(user => {
        if (user) console.log('Firebase Auth:', user.uid);
    });
}

// =====================
// GOOGLE SIGN IN
// =====================
async function signInWithGoogle() {
    if (authInProgress) return;
    authInProgress = true;
    
    try {
        showLoader();
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        const result = await auth.signInWithPopup(provider);
        const user = result.user;
        
        console.log('✅ Google sign-in:', user.uid);
        
        const userDoc = await db.collection('users').doc(user.uid).get();
        
        if (!userDoc.exists) {
            // NEW USER - go to account type
            APP.currentUser = user;
            hideLoader();
            navigateTo('account-type');
            showToast('Welcome! Choose your account type.', 'info');
        } else {
            // EXISTING USER - login
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
            
            await db.collection('users').doc(user.uid).update({
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            }).catch(() => {});
            
            hideLoader();
            navigateTo('home');
            showToast(`Welcome back! 👋`, 'success');
        }
    } catch (error) {
        hideLoader();
        console.error('Google sign-in error:', error);
        if (error.code === 'auth/popup-closed-by-user') {
            // User closed popup - silent
        } else {
            showToast('Sign-in failed. Try again.', 'error');
        }
    }
    
    authInProgress = false;
}

// =====================
// USERNAME/PASSWORD LOGIN
// =====================
async function signInWithCredentials() {
    if (authInProgress) return;
    
    const username = document.getElementById('auth-username')?.value?.trim()?.toLowerCase();
    const password = document.getElementById('auth-password')?.value;
    
    if (!username || !password) {
        showToast('Enter username and password', 'error');
        return;
    }
    
    authInProgress = true;
    const btn = document.querySelector('.auth-form .btn-gold');
    if (btn) { btn.disabled = true; btn.textContent = 'Signing in...'; }
    
    try {
        const snapshot = await db.collection('users')
            .where('username', '==', username)
            .limit(1)
            .get();
        
        if (snapshot.empty) {
            showToast('Account not found. Create one first.', 'error');
            if (btn) { btn.disabled = false; btn.textContent = 'Sign In'; }
            authInProgress = false;
            return;
        }
        
        const doc = snapshot.docs[0];
        const user = doc.data();
        
        if (user.password !== password) {
            showToast('Invalid password', 'error');
            if (btn) { btn.disabled = false; btn.textContent = 'Sign In'; }
            authInProgress = false;
            return;
        }
        
        if (user.isSuspended) {
            showToast('Account suspended', 'error');
            if (btn) { btn.disabled = false; btn.textContent = 'Sign In'; }
            authInProgress = false;
            return;
        }
        
        // SUCCESS
        APP.currentUser = { uid: doc.id, email: user.email };
        APP.userProfile = user;
        APP.userProfile.uid = doc.id;
        
        localStorage.setItem('shoplify_auth', 'true');
        localStorage.setItem('shoplify_uid', doc.id);
        
        if (btn) { btn.disabled = false; btn.textContent = 'Sign In'; }
        
        document.getElementById('auth-username').value = '';
        document.getElementById('auth-password').value = '';
        
        navigateTo('home');
        showToast(`Welcome, ${user.displayName || username}!`, 'success');
        
    } catch (error) {
        console.error('Login error:', error);
        showToast('Login failed. Try again.', 'error');
        if (btn) { btn.disabled = false; btn.textContent = 'Sign In'; }
    }
    
    authInProgress = false;
}

// =====================
// SELECT ACCOUNT TYPE
// =====================
function selectAccountType(type) {
    console.log('📝 Selected:', type);
    APP.selectedAccountType = type;
    
    // Highlight card
    document.querySelectorAll('.account-type-card').forEach(c => c.classList.remove('selected'));
    const cards = document.querySelectorAll('.account-type-card');
    cards.forEach(card => {
        if (card.textContent.toLowerCase().includes(type)) {
            card.classList.add('selected');
        }
    });
    
    setTimeout(() => {
        if (type === 'customer') {
            // Customer: direct setup, no Google required
            if (!APP.currentUser) {
                // Need to auth first
                signInWithGoogleForSetup('customer');
            } else {
                navigateTo('setup-credentials');
                setTimeout(populateCountryDropdown, 300);
            }
        } else {
            // Affiliate/Merchant: Google auth required
            signInWithGoogleForSetup(type);
        }
    }, 400);
}

async function signInWithGoogleForSetup(accountType) {
    if (authInProgress) return;
    authInProgress = true;
    
    try {
        showLoader();
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        const result = await auth.signInWithPopup(provider);
        
        APP.currentUser = result.user;
        APP.selectedAccountType = accountType;
        
        hideLoader();
        navigateTo('setup-credentials');
        setTimeout(populateCountryDropdown, 500);
        
    } catch (error) {
        hideLoader();
        if (error.code === 'auth/popup-closed-by-user') {
            showToast('Sign-in cancelled', 'warning');
        } else {
            showToast('Authentication failed', 'error');
        }
    }
    
    authInProgress = false;
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
        showToast('Phone number required for deposits', 'error');
        return;
    }
    
    const userId = APP.currentUser?.uid || generateId();
    
    showLoader();
    
    try {
        // Check username
        const check = await db.collection('users').where('username', '==', username).limit(1).get();
        if (!check.empty) {
            hideLoader();
            showToast('Username taken. Choose another.', 'error');
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
            exchangeRate: APP.exchangeRates[(cData.currency || 'usd').toLowerCase()] || 1,
            accountType,
            walletBalance: 0, affiliateEarnings: 0, pendingEarnings: 0, escrowBalance: 0, withdrawnBalance: 0,
            isMerchant: false, isAffiliate: false, isAmbassador: false, isDropshipper: false,
            isVerifiedMerchant: false, isVerifiedAffiliate: false, isAppVerified: false,
            merchantSubscription: false, affiliateSubscription: false, advertiserSubscription: false,
            dropshipPlan: 'none', bankAccounts: [],
            suspensionCount: 0, isSuspended: false, isFlagged: false,
            storeActive: false, storeName: '', storeTemplate: 'classic',
            totalSales: 0, totalRevenue: 0, totalReferrals: 0,
            referralCode: 'ref_' + username + '_' + Date.now().toString(36),
            referredBy: sessionStorage.getItem('referralCode') || '',
            loyaltyPoints: 0, vipMember: false,
            theme: 'light', textSize: 'medium',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastLogin: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection('users').doc(userId).set(userData);
        
        APP.currentUser = { uid: userId, email: userData.email };
        APP.userProfile = userData;
        
        localStorage.setItem('shoplify_auth', 'true');
        localStorage.setItem('shoplify_uid', userId);
        
        // Welcome notification
        if (typeof createNotification === 'function') {
            createNotification(userId, 'Welcome! 🎉', 'Your account is ready!', '🎉', 'home').catch(() => {});
        }
        
        hideLoader();
        
        if (accountType === 'affiliate') {
            navigateTo('home');
            showToast('Account created! Subscribe to earn commissions.', 'success');
            setTimeout(() => {
                if (typeof showAffiliateSubscriptionPrompt === 'function') showAffiliateSubscriptionPrompt();
            }, 1500);
        } else if (accountType === 'merchant') {
            navigateTo('home');
            showToast('Account created! Subscribe to start selling.', 'success');
            setTimeout(() => {
                if (typeof showMerchantSubscriptionPrompt === 'function') showMerchantSubscriptionPrompt();
            }, 1500);
        } else {
            navigateTo('home');
            showToast('Account created! 🚀', 'success');
        }
        
    } catch (error) {
        hideLoader();
        console.error('Setup error:', error);
        showToast('Failed to create account. Try again.', 'error');
    }
}

function showAffiliateSubscriptionPrompt() {
    showModal(`
        <div style="padding:10px;"><h3>📢 Activate Affiliate</h3>
        <p style="color:#666;margin:15px 0;">Earn 4-5% commission!</p>
        <div style="background:#FFF8E1;padding:15px;border-radius:8px;margin-bottom:15px;">
            <p><strong>$${APP.affiliatePrice}/month</strong></p>
            <p style="font-size:13px;">• Promote products • Earn commissions</p>
        </div>
        <button class="btn-gold btn-full" onclick="payAffiliateSubscription()">Pay $${APP.affiliatePrice}</button>
        <button class="btn-outline btn-full" style="margin-top:8px;" onclick="hideModal()">Later</button></div>`);
}

function showMerchantSubscriptionPrompt() {
    showModal(`
        <div style="padding:10px;"><h3>🏪 Activate Merchant</h3>
        <p style="color:#666;margin:15px 0;">Create your store!</p>
        <div style="background:#FFF8E1;padding:15px;border-radius:8px;margin-bottom:15px;">
            <p><strong>$${APP.merchantPrice} Lifetime</strong></p>
            <p style="font-size:13px;">• Online store • Unlimited products</p>
        </div>
        <button class="btn-gold btn-full" onclick="payMerchantSubscription()">Pay $${APP.merchantPrice}</button>
        <button class="btn-outline btn-full" style="margin-top:8px;" onclick="hideModal()">Later</button></div>`);
}

async function payAffiliateSubscription() {
    hideModal();
    if ((APP.userProfile?.walletBalance || 0) < APP.affiliatePrice) {
        showToast(`Need $${APP.affiliatePrice}. Deposit first.`, 'error');
        navigateTo('wallet'); return;
    }
    showLoader();
    try {
        const userId = APP.userProfile.uid;
        const d = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        await db.collection('users').doc(userId).update({
            walletBalance: firebase.firestore.FieldValue.increment(-APP.affiliatePrice),
            isAffiliate: true, affiliateSubscription: true,
            affiliateSubscriptionExpiry: firebase.firestore.Timestamp.fromDate(d)
        });
        APP.userProfile.walletBalance -= APP.affiliatePrice;
        APP.userProfile.isAffiliate = true;
        APP.userProfile.affiliateSubscription = true;
        await db.collection('transactions').add({
            userId, type: 'subscription', amount: APP.affiliatePrice,
            currency: 'USD', status: 'completed', description: 'Affiliate subscription',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        hideLoader(); showToast('Affiliate activated! 🎉', 'success'); navigateTo('affiliate');
    } catch (e) { hideLoader(); showToast('Failed', 'error'); }
}

async function payMerchantSubscription() {
    hideModal();
    if ((APP.userProfile?.walletBalance || 0) < APP.merchantPrice) {
        showToast(`Need $${APP.merchantPrice}. Deposit first.`, 'error');
        navigateTo('wallet'); return;
    }
    showLoader();
    try {
        const userId = APP.userProfile.uid;
        await db.collection('users').doc(userId).update({
            walletBalance: firebase.firestore.FieldValue.increment(-APP.merchantPrice),
            isMerchant: true, merchantSubscription: 'lifetime',
            storeActive: true, storeName: `${APP.userProfile.username}'s Store`
        });
        APP.userProfile.walletBalance -= APP.merchantPrice;
        APP.userProfile.isMerchant = true;
        APP.userProfile.merchantSubscription = 'lifetime';
        await db.collection('transactions').add({
            userId, type: 'subscription', amount: APP.merchantPrice,
            currency: 'USD', status: 'completed', description: 'Merchant subscription',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        hideLoader(); showToast('Merchant activated! 🏪', 'success'); navigateTo('merchant');
    } catch (e) { hideLoader(); showToast('Failed', 'error'); }
}

function populateCountryDropdown() {
    const select = document.getElementById('setup-country');
    if (!select || select.options.length > 1) return;
    select.innerHTML = '<option value="">Select Country</option>';
    if (typeof COUNTRIES !== 'undefined') {
        Object.entries(COUNTRIES).sort((a, b) => a[1].name.localeCompare(b[1].name))
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
    return localStorage.getItem('shoplify_auth') === 'true' && APP.userProfile;
}

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

console.log('✅ auth.js loaded');
