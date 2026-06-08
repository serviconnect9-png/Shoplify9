// auth.js - COMPLETELY FIXED REGISTRATION FLOW
let authInProgress = false;

function initializeAuth() {
    // Auto-restore session
    const savedUserId = localStorage.getItem('shoplify_uid');
    if (localStorage.getItem('shoplify_auth') === 'true' && savedUserId) {
        db.collection('users').doc(savedUserId).get()
            .then(doc => {
                if (doc.exists && !doc.data().isSuspended) {
                    APP.currentUser = { uid: savedUserId };
                    APP.userProfile = doc.data();
                    APP.userProfile.uid = savedUserId;
                }
            }).catch(() => {});
    }
    
    auth.onAuthStateChanged(user => {
        if (user) console.log('Firebase Auth active:', user.uid);
    });
}

// CUSTOMER SIGNUP - No Google required
async function signupCustomer() {
    APP.selectedAccountType = 'customer';
    navigateTo('setup-credentials');
    setTimeout(populateCountryDropdown, 300);
}

// AFFILIATE/MERCHANT SIGNUP - Requires Google Auth first
async function signupWithGoogle(accountType) {
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
        setTimeout(populateCountryDropdown, 300);
        
    } catch (error) {
        hideLoader();
        if (error.code === 'auth/popup-closed-by-user') {
            showToast('Sign-in cancelled', 'warning');
        } else if (error.code === 'auth/network-request-failed') {
            showToast('Network error. Check your connection.', 'error');
        } else {
            showToast('Authentication failed. Try again.', 'error');
        }
    }
    authInProgress = false;
}

function selectAccountType(type) {
    document.querySelectorAll('.account-type-card').forEach(c => c.classList.remove('selected'));
    const cards = document.querySelectorAll('.account-type-card');
    cards.forEach(card => {
        if (card.textContent.toLowerCase().includes(type)) card.classList.add('selected');
    });
    
    setTimeout(() => {
        if (type === 'customer') {
            signupCustomer();
        } else {
            signupWithGoogle(type);
        }
    }, 400);
}

// LOGIN - Works for all account types
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
            showToast('Account not found', 'error');
            resetBtn(btn);
            authInProgress = false;
            return;
        }
        
        const doc = snapshot.docs[0];
        const user = doc.data();
        
        if (user.password !== password) {
            showToast('Invalid password', 'error');
            resetBtn(btn);
            authInProgress = false;
            return;
        }
        
        if (user.isSuspended) {
            showToast('Account suspended', 'error');
            resetBtn(btn);
            authInProgress = false;
            return;
        }
        
        // SUCCESS
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
        
    } catch (error) {
        console.error('Login error:', error);
        showToast('Login failed. Check connection.', 'error');
        resetBtn(btn);
    }
    authInProgress = false;
}

function resetBtn(btn) {
    if (btn) { btn.disabled = false; btn.textContent = 'Sign In'; }
}

// GOOGLE LOGIN
async function signInWithGoogle() {
    if (authInProgress) return;
    authInProgress = true;
    
    try {
        showLoader();
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        const result = await auth.signInWithPopup(provider);
        
        const userDoc = await db.collection('users').doc(result.user.uid).get();
        
        if (!userDoc.exists) {
            APP.currentUser = result.user;
            hideLoader();
            navigateTo('account-type');
            return;
        }
        
        const user = userDoc.data();
        if (user.isSuspended) {
            await auth.signOut();
            hideLoader();
            showToast('Account suspended', 'error');
            authInProgress = false;
            return;
        }
        
        APP.currentUser = result.user;
        APP.userProfile = user;
        APP.userProfile.uid = result.user.uid;
        
        localStorage.setItem('shoplify_auth', 'true');
        localStorage.setItem('shoplify_uid', result.user.uid);
        
        hideLoader();
        navigateTo('home');
        showToast(`Welcome back!`, 'success');
        
    } catch (error) {
        hideLoader();
        if (error.code !== 'auth/popup-closed-by-user') {
            showToast('Sign-in failed', 'error');
        }
    }
    authInProgress = false;
}

// COMPLETE SETUP
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
        // Check username availability
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
            walletBalance: 0,
            affiliateEarnings: 0,
            pendingEarnings: 0,
            escrowBalance: 0,
            withdrawnBalance: 0,
            isMerchant: false,
            isAffiliate: false,
            isAmbassador: false,
            isDropshipper: false,
            isVerifiedMerchant: false,
            isVerifiedAffiliate: false,
            isAppVerified: false,
            merchantSubscription: false,
            affiliateSubscription: false,
            dropshipPlan: 'none',
            bankAccounts: [],
            suspensionCount: 0,
            isSuspended: false,
            isFlagged: false,
            storeActive: false,
            storeName: '',
            storeTemplate: 'classic',
            totalSales: 0,
            totalRevenue: 0,
            totalReferrals: 0,
            referralCode: 'ref_' + username + '_' + Date.now().toString(36),
            referredBy: sessionStorage.getItem('referralCode') || '',
            loyaltyPoints: 0,
            vipMember: false,
            theme: 'light',
            textSize: 'medium',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastLogin: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection('users').doc(userId).set(userData);
        
        APP.currentUser = { uid: userId, email: userData.email };
        APP.userProfile = userData;
        
        localStorage.setItem('shoplify_auth', 'true');
        localStorage.setItem('shoplify_uid', userId);
        
        // Welcome notification
        createNotification(userId, 'Welcome! 🎉', 'Your account is ready!', '🎉', 'home').catch(() => {});
        
        hideLoader();
        
        // Handle post-setup
        if (accountType === 'customer') {
            navigateTo('home');
            showToast('Account created! Start shopping.', 'success');
        } else if (accountType === 'affiliate') {
            navigateTo('home');
            showToast('Account created! Subscribe to start earning.', 'success');
            setTimeout(showAffiliateSubscriptionPrompt, 1500);
        } else if (accountType === 'merchant') {
            navigateTo('home');
            showToast('Account created! Subscribe to start selling.', 'success');
            setTimeout(showMerchantSubscriptionPrompt, 1500);
        }
        
    } catch (error) {
        hideLoader();
        console.error('Setup error:', error);
        showToast('Failed to create account. Try again.', 'error');
    }
}

function showAffiliateSubscriptionPrompt() {
    showModal(`
        <div style="padding:10px;">
            <h3>📢 Activate Affiliate Access</h3>
            <p style="color:#666;margin:15px 0;">Earn 4-5% commission on every sale!</p>
            <div style="background:#FFF8E1;padding:15px;border-radius:8px;margin-bottom:15px;">
                <p><strong>$${APP.affiliatePrice}/month</strong></p>
                <p style="font-size:13px;">• Promote products • Earn commissions • Analytics dashboard</p>
            </div>
            <button class="btn-gold btn-full" onclick="paySubscription('affiliate')">Pay $${APP.affiliatePrice} - Activate</button>
            <button class="btn-outline btn-full" style="margin-top:8px;" onclick="hideModal()">Later</button>
        </div>
    `);
}

function showMerchantSubscriptionPrompt() {
    showModal(`
        <div style="padding:10px;">
            <h3>🏪 Activate Merchant Access</h3>
            <p style="color:#666;margin:15px 0;">Create your store and sell worldwide!</p>
            <div style="background:#FFF8E1;padding:15px;border-radius:8px;margin-bottom:15px;">
                <p><strong>$${APP.merchantPrice} Lifetime</strong></p>
                <p style="font-size:13px;">• Online store • Unlimited products • Escrow protection</p>
            </div>
            <button class="btn-gold btn-full" onclick="paySubscription('merchant')">Pay $${APP.merchantPrice} - Activate</button>
            <button class="btn-outline btn-full" style="margin-top:8px;" onclick="hideModal()">Later</button>
        </div>
    `);
}

async function paySubscription(type) {
    hideModal();
    
    const price = type === 'affiliate' ? APP.affiliatePrice : APP.merchantPrice;
    const balance = APP.userProfile?.walletBalance || 0;
    
    if (balance < price) {
        showToast(`Insufficient balance. Deposit $${price} first.`, 'error');
        navigateTo('wallet');
        return;
    }
    
    showLoader();
    
    try {
        const userId = APP.userProfile.uid;
        const updates = {
            walletBalance: firebase.firestore.FieldValue.increment(-price)
        };
        
        if (type === 'affiliate') {
            updates.isAffiliate = true;
            updates.affiliateSubscription = true;
            updates.affiliateSubscriptionExpiry = firebase.firestore.Timestamp.fromDate(
                new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            );
        } else {
            updates.isMerchant = true;
            updates.merchantSubscription = 'lifetime';
            updates.storeActive = true;
            updates.storeName = `${APP.userProfile.username}'s Store`;
        }
        
        await db.collection('users').doc(userId).update(updates);
        
        APP.userProfile.walletBalance -= price;
        if (type === 'affiliate') {
            APP.userProfile.isAffiliate = true;
            APP.userProfile.affiliateSubscription = true;
        } else {
            APP.userProfile.isMerchant = true;
            APP.userProfile.merchantSubscription = 'lifetime';
            APP.userProfile.storeActive = true;
        }
        
        await db.collection('transactions').add({
            userId, type: 'subscription', amount: price, currency: 'USD',
            status: 'completed', description: `${type} subscription`,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        hideLoader();
        showToast(`${type === 'affiliate' ? 'Affiliate' : 'Merchant'} activated! 🎉`, 'success');
        
        if (type === 'affiliate') navigateTo('affiliate');
        else navigateTo('merchant');
        
    } catch (error) {
        hideLoader();
        showToast('Payment failed. Try again.', 'error');
    }
}

function populateCountryDropdown() {
    const select = document.getElementById('setup-country');
    if (!select || select.options.length > 1) return;
    
    select.innerHTML = '<option value="">Select Country</option>';
    
    if (typeof COUNTRIES !== 'undefined') {
        Object.entries(COUNTRIES)
            .sort((a, b) => a[1].name.localeCompare(b[1].name))
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