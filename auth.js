// auth.js - COMPLETE FINAL VERSION (Saves state before auth, restores after login)
console.log('✅ auth.js loaded');

let authInProgress = false;

// =====================
// INITIALIZE AUTH
// =====================
function initializeAuth() {
    console.log('🔐 Auth initialized');
    const savedUserId = localStorage.getItem('shoplify_uid');
    if (localStorage.getItem('shoplify_auth') === 'true' && savedUserId) {
        db.collection('users').doc(savedUserId).get().then(doc => {
            if (doc.exists && !doc.data().isSuspended) {
                APP.currentUser = { uid: savedUserId };
                APP.userProfile = doc.data();
                APP.userProfile.uid = savedUserId;
                console.log('✅ Session restored for:', APP.userProfile.username);
            }
        }).catch(() => {});
    }
}

// =====================
// GOOGLE SIGN IN
// =====================
async function signInWithGoogle() {
    if (authInProgress) return;
    authInProgress = true;
    console.log('🔑 Google sign-in started');
    
    try {
        showLoader();
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        const result = await auth.signInWithPopup(provider);
        const user = result.user;
        
        console.log('✅ Google user:', user.uid);
        
        const userDoc = await db.collection('users').doc(user.uid).get();
        
        if (!userDoc.exists) {
            // NEW USER - Save pending screen if any
            APP.currentUser = user;
            hideLoader();
            navigateTo('account-type');
            showToast('Welcome! Choose your account type.', 'info');
        } else {
            // EXISTING USER - Login success
            const userData = userDoc.data();
            
            if (userData.isSuspended) {
                await auth.signOut();
                hideLoader();
                showToast('Account suspended. Contact support.', 'error');
                authInProgress = false;
                return;
            }
            
            APP.currentUser = user;
            APP.userProfile = userData;
            APP.userProfile.uid = user.uid;
            
            localStorage.setItem('shoplify_auth', 'true');
            localStorage.setItem('shoplify_uid', user.uid);
            
            // Update last login
            db.collection('users').doc(user.uid).update({
                lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
                loginRestrictedUntil: null,
                suspensionCount: 0
            }).catch(() => {});
            
            hideLoader();
            
            // CHECK PENDING SCREEN - Return user to where they were
            const pendingScreen = sessionStorage.getItem('pending_screen');
            if (pendingScreen) {
                console.log('🔙 Returning to pending screen:', pendingScreen);
                const pendingData = sessionStorage.getItem('pending_data');
                sessionStorage.removeItem('pending_screen');
                sessionStorage.removeItem('pending_data');
                
                if (pendingData) {
                    navigateTo(pendingScreen, JSON.parse(pendingData));
                } else {
                    navigateTo(pendingScreen);
                }
            } else {
                navigateTo('home');
            }
            
            showToast(`Welcome back, ${userData.displayName || 'User'}! 👋`, 'success');
        }
    } catch (error) {
        hideLoader();
        console.error('Google error:', error);
        if (error.code !== 'auth/popup-closed-by-user') {
            showToast('Sign-in failed. Please try again.', 'error');
        }
    }
    
    authInProgress = false;
}

// =====================
// USERNAME/PASSWORD LOGIN
// =====================
async function signInWithCredentials() {
    if (authInProgress) return;
    
    const usernameInput = document.getElementById('auth-username');
    const passwordInput = document.getElementById('auth-password');
    
    if (!usernameInput || !passwordInput) {
        showToast('Form not ready. Refresh the page.', 'error');
        return;
    }
    
    const username = usernameInput.value.trim().toLowerCase();
    const password = passwordInput.value;
    
    if (!username) {
        showToast('Please enter your username', 'error');
        usernameInput.focus();
        return;
    }
    
    if (!password) {
        showToast('Please enter your password', 'error');
        passwordInput.focus();
        return;
    }
    
    authInProgress = true;
    console.log('🔍 Looking up user:', username);
    
    const loginBtn = document.querySelector('.auth-form .btn-gold');
    const originalText = loginBtn ? loginBtn.textContent : 'Sign In';
    if (loginBtn) {
        loginBtn.disabled = true;
        loginBtn.textContent = 'Signing in...';
        loginBtn.style.opacity = '0.7';
    }
    
    try {
        const snapshot = await db.collection('users')
            .where('username', '==', username)
            .limit(1)
            .get();
        
        if (snapshot.empty) {
            showToast('No account found with that username. Create one first.', 'error');
            resetLoginButton(loginBtn, originalText);
            authInProgress = false;
            return;
        }
        
        const userDoc = snapshot.docs[0];
        const userData = userDoc.data();
        const userId = userDoc.id;
        
        console.log('✅ User found:', userId);
        
        // Verify password
        if (userData.password !== password) {
            await handleFailedLogin(userId, userData);
            resetLoginButton(loginBtn, originalText);
            authInProgress = false;
            return;
        }
        
        // Check suspension
        if (userData.isSuspended) {
            showToast('Account suspended. Contact support.', 'error');
            resetLoginButton(loginBtn, originalText);
            authInProgress = false;
            return;
        }
        
        // Check login restrictions
        if (userData.loginRestrictedUntil) {
            let restrictionTime;
            try {
                if (userData.loginRestrictedUntil.toDate) {
                    restrictionTime = userData.loginRestrictedUntil.toDate();
                } else if (userData.loginRestrictedUntil instanceof Date) {
                    restrictionTime = userData.loginRestrictedUntil;
                } else {
                    restrictionTime = new Date(userData.loginRestrictedUntil);
                }
                
                if (restrictionTime > new Date()) {
                    const minutesLeft = Math.ceil((restrictionTime - new Date()) / 60000);
                    if (minutesLeft > 60) {
                        showToast(`Account restricted. Try again in ${Math.ceil(minutesLeft/60)} hours.`, 'error');
                    } else {
                        showToast(`Account restricted. Try again in ${minutesLeft} minutes.`, 'error');
                    }
                    resetLoginButton(loginBtn, originalText);
                    authInProgress = false;
                    return;
                }
            } catch (e) {
                console.warn('Restriction parse error:', e);
            }
        }
        
        // 🎉 LOGIN SUCCESSFUL
        console.log('✅ Login successful for:', username);
        
        // Set current user
        APP.currentUser = {
            uid: userId,
            email: userData.email || `${username}@shoplify.user`,
            displayName: userData.displayName || username,
            photoURL: userData.photoURL || ''
        };
        APP.userProfile = userData;
        APP.userProfile.uid = userId;
        
        // Save session
        localStorage.setItem('shoplify_auth', 'true');
        localStorage.setItem('shoplify_uid', userId);
        
        // Clear form
        usernameInput.value = '';
        passwordInput.value = '';
        
        // Reset button
        resetLoginButton(loginBtn, originalText);
        
        // Update last login
        db.collection('users').doc(userId).update({
            lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
            loginRestrictedUntil: firebase.firestore.FieldValue.delete(),
            suspensionCount: 0
        }).catch(err => console.warn('Update login time failed:', err));
        
        // CHECK PENDING SCREEN - Return user to where they were before auth
        const pendingScreen = sessionStorage.getItem('pending_screen');
        if (pendingScreen) {
            console.log('🔙 Returning to pending screen:', pendingScreen);
            const pendingData = sessionStorage.getItem('pending_data');
            sessionStorage.removeItem('pending_screen');
            sessionStorage.removeItem('pending_data');
            
            if (pendingData) {
                navigateTo(pendingScreen, JSON.parse(pendingData));
            } else {
                navigateTo(pendingScreen);
            }
        } else {
            navigateTo('home');
        }
        
        showToast(`Welcome back, ${userData.displayName || username}! 👋`, 'success');
        
        // Load notifications
        setTimeout(() => {
            if (typeof updateNotificationBadge === 'function') {
                updateNotificationBadge().catch(() => {});
            }
        }, 1500);
        
    } catch (error) {
        console.error('❌ Login error:', error);
        
        if (error.code === 'unavailable' || error.code === 'resource-exhausted') {
            showToast('Service temporarily busy. Please try again.', 'warning');
        } else if (error.code === 'permission-denied') {
            showToast('Access denied. Check Firestore security rules.', 'error');
        } else if (error.message && error.message.includes('network')) {
            showToast('Network error. Check your connection.', 'error');
        } else {
            showToast('Login failed. Please try again.', 'error');
        }
        
        resetLoginButton(loginBtn, originalText);
    }
    
    authInProgress = false;
}

function resetLoginButton(btn, originalText) {
    if (btn) {
        btn.disabled = false;
        btn.textContent = originalText || 'Sign In';
        btn.style.opacity = '1';
    }
}

// =====================
// FAILED LOGIN HANDLER
// =====================
async function handleFailedLogin(userId, userData) {
    const suspensionCount = (userData.suspensionCount || 0) + 1;
    const updates = { suspensionCount };
    
    console.log('❌ Failed login attempt #' + suspensionCount);
    
    if (suspensionCount >= 10) {
        updates.loginRestrictedUntil = firebase.firestore.Timestamp.fromDate(
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        );
        showToast('🔒 Account locked for 1 week due to multiple failed attempts.', 'error');
    } else if (suspensionCount >= 5) {
        updates.loginRestrictedUntil = firebase.firestore.Timestamp.fromDate(
            new Date(Date.now() + 60 * 60 * 1000)
        );
        showToast('🔒 Too many attempts. Account locked for 1 hour.', 'error');
    } else {
        const remaining = 5 - suspensionCount;
        showToast(`❌ Invalid password. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`, 'error');
    }
    
    await db.collection('users').doc(userId).update(updates).catch(err => {
        console.warn('Failed to update login attempts:', err);
    });
}

// =====================
// ACCOUNT TYPE SELECTION
// =====================
function selectAccountType(type) {
    console.log('📝 Account type selected:', type);
    APP.selectedAccountType = type;
    
    // Highlight selected card
    document.querySelectorAll('.account-type-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    const cards = document.querySelectorAll('.account-type-card');
    cards.forEach(card => {
        const cardText = card.textContent.toLowerCase();
        if (cardText.includes(type)) {
            card.classList.add('selected');
        }
    });
    
    setTimeout(() => {
        if (type === 'customer') {
            // Customer can register directly without Google
            console.log('👤 Customer registration - direct setup');
            navigateTo('setup-credentials');
            setTimeout(populateCountryDropdown, 300);
        } else {
            // Affiliate/Merchant need Google auth first
            console.log('🔑 Affiliate/Merchant - Google auth required');
            signInWithGoogleForSetup(type);
        }
    }, 400);
}

// =====================
// GOOGLE SIGN-IN FOR SETUP
// =====================
async function signInWithGoogleForSetup(accountType) {
    if (authInProgress) {
        console.log('⚠️ Auth already in progress');
        return;
    }
    
    authInProgress = true;
    console.log('🔑 Google sign-in for', accountType, 'setup...');
    
    try {
        showLoader();
        
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        const result = await auth.signInWithPopup(provider);
        const user = result.user;
        
        console.log('✅ Google auth successful for setup:', user.uid);
        
        APP.currentUser = user;
        APP.selectedAccountType = accountType;
        
        hideLoader();
        navigateTo('setup-credentials');
        
        // Populate country dropdown after navigation
        setTimeout(populateCountryDropdown, 500);
        
    } catch (error) {
        hideLoader();
        console.error('❌ Google auth for setup error:', error);
        
        if (error.code === 'auth/popup-closed-by-user') {
            showToast('Sign-in cancelled. Please try again.', 'warning');
        } else if (error.code === 'auth/network-request-failed') {
            showToast('Network error. Check your internet connection.', 'error');
        } else {
            showToast('Authentication failed. Please try again.', 'error');
        }
    }
    
    authInProgress = false;
}

// =====================
// COMPLETE SETUP (Create Account)
// =====================
async function completeSetup() {
    const usernameInput = document.getElementById('setup-username');
    const passwordInput = document.getElementById('setup-password');
    const countrySelect = document.getElementById('setup-country');
    const phoneInput = document.getElementById('setup-phone');
    
    if (!usernameInput || !passwordInput || !countrySelect || !phoneInput) {
        showToast('Form not ready. Please refresh.', 'error');
        return;
    }
    
    const username = usernameInput.value.trim().toLowerCase();
    const password = passwordInput.value;
    const country = countrySelect.value;
    const phone = phoneInput.value.trim();
    const accountType = APP.selectedAccountType || 'customer';
    
    // Validate username
    if (!validateUsername(username)) {
        showToast('Username: 3-30 characters, lowercase letters/numbers only', 'error');
        usernameInput.focus();
        return;
    }
    
    // Validate password
    if (!validatePassword(password)) {
        showToast('Password must be at least 6 characters', 'error');
        passwordInput.focus();
        return;
    }
    
    // Validate country
    if (!country) {
        showToast('Please select your country', 'error');
        countrySelect.focus();
        return;
    }
    
    // Validate phone
    if (!phone) {
        showToast('Phone number is required for deposits', 'error');
        phoneInput.focus();
        return;
    }
    
    const userId = APP.currentUser?.uid || generateId();
    
    showLoader();
    console.log('📝 Creating account for:', username, 'Type:', accountType);
    
    try {
        // Check username availability
        const existingCheck = await db.collection('users')
            .where('username', '==', username)
            .limit(1)
            .get();
        
        if (!existingCheck.empty) {
            hideLoader();
            showToast('Username already taken. Please choose another.', 'error');
            usernameInput.focus();
            return;
        }
        
        const countryData = COUNTRIES[country] || {};
        const currency = countryData.currency || 'USD';
        const countryCode = countryData.code || '+1';
        const flag = countryData.flag || '🌍';
        
        const userData = {
            uid: userId,
            email: APP.currentUser?.email || `${username}@shoplify.user`,
            displayName: APP.currentUser?.displayName || username,
            photoURL: APP.currentUser?.photoURL || '',
            username: username,
            password: password,
            phoneNumber: countryCode + phone,
            country: country,
            countryFlag: flag,
            currency: currency,
            exchangeRate: APP.exchangeRates[currency.toLowerCase()] || 1,
            accountType: accountType,
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
            advertiserSubscription: false,
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
            loginRestrictedUntil: null,
            appVerificationApplied: false,
            theme: 'light',
            textSize: 'medium',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastLogin: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // Save to Firestore
        await db.collection('users').doc(userId).set(userData);
        console.log('✅ User document created:', userId);
        
        // Set current user
        APP.currentUser = { uid: userId, email: userData.email };
        APP.userProfile = userData;
        
        // Save session
        localStorage.setItem('shoplify_auth', 'true');
        localStorage.setItem('shoplify_uid', userId);
        
        // Process referral if applicable
        if (userData.referredBy) {
            processReferralBonus(userData.referredBy, userId).catch(() => {});
        }
        
        // Send welcome notification
        if (typeof createNotification === 'function') {
            createNotification(userId,
                'Welcome to ONESHOPLIFY! 🎉',
                `Your ${accountType} account is ready!`,
                '🎉',
                'home'
            ).catch(() => {});
        }
        
        hideLoader();
        
        // Handle post-setup based on account type
        if (accountType === 'affiliate') {
            navigateTo('home');
            showToast('Account created! Activate your affiliate subscription to start earning.', 'success');
            setTimeout(() => {
                if (typeof showAffiliateSubscriptionPrompt === 'function') {
                    showAffiliateSubscriptionPrompt();
                }
            }, 1500);
        } else if (accountType === 'merchant') {
            navigateTo('home');
            showToast('Account created! Activate your merchant subscription to start selling.', 'success');
            setTimeout(() => {
                if (typeof showMerchantSubscriptionPrompt === 'function') {
                    showMerchantSubscriptionPrompt();
                }
            }, 1500);
        } else {
            // Check if there's a pending screen to return to
            const pendingScreen = sessionStorage.getItem('pending_screen');
            if (pendingScreen) {
                const pendingData = sessionStorage.getItem('pending_data');
                sessionStorage.removeItem('pending_screen');
                sessionStorage.removeItem('pending_data');
                if (pendingData) {
                    navigateTo(pendingScreen, JSON.parse(pendingData));
                } else {
                    navigateTo(pendingScreen);
                }
            } else {
                navigateTo('home');
            }
            showToast('Account created successfully! 🚀', 'success');
        }
        
    } catch (error) {
        hideLoader();
        console.error('❌ Setup error:', error);
        
        if (error.code === 'permission-denied') {
            showToast('Permission denied. Check Firestore rules.', 'error');
        } else if (error.code === 'unavailable') {
            showToast('Service temporarily unavailable. Please try again.', 'warning');
        } else {
            showToast('Failed to create account. Please try again.', 'error');
        }
    }
}

// =====================
// REFERRAL BONUS
// =====================
async function processReferralBonus(referralCode, newUserId) {
    try {
        const snapshot = await db.collection('users')
            .where('referralCode', '==', referralCode)
            .limit(1)
            .get();
        
        if (!snapshot.empty) {
            const referrerDoc = snapshot.docs[0];
            const referrerData = referrerDoc.data();
            
            await db.collection('users').doc(referrerDoc.id).update({
                totalReferrals: firebase.firestore.FieldValue.increment(1),
                walletBalance: firebase.firestore.FieldValue.increment(APP.referralBonus)
            });
            
            await db.collection('transactions').add({
                userId: referrerDoc.id,
                type: 'referral_bonus',
                amount: APP.referralBonus,
                currency: 'USD',
                status: 'completed',
                description: 'Referral bonus for new user',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            if (typeof createNotification === 'function') {
                await createNotification(referrerDoc.id,
                    'Referral Bonus! 🎁',
                    `You earned $${APP.referralBonus} for a new referral!`,
                    '💰',
                    'wallet'
                );
            }
        }
    } catch (error) {
        console.warn('Referral processing error:', error);
    }
}

// =====================
// SUBSCRIPTION PROMPTS
// =====================
function showAffiliateSubscriptionPrompt() {
    showModal(`
        <div style="padding:10px;">
            <h3>📢 Activate Affiliate Access</h3>
            <p style="color:#666;margin:15px 0;">Earn 4-5% commission on every sale!</p>
            <div style="background:#FFF8E1;padding:15px;border-radius:8px;margin-bottom:15px;">
                <p><strong>💰 Affiliate Plan:</strong> $${APP.affiliatePrice}/month</p>
                <p style="font-size:13px;">• Promote any product</p>
                <p style="font-size:13px;">• Earn 4-5% commission</p>
                <p style="font-size:13px;">• Real-time analytics</p>
            </div>
            <button class="btn-gold btn-full" onclick="payAffiliateSubscription()">💳 Pay $${APP.affiliatePrice} - Activate</button>
            <button class="btn-outline btn-full" style="margin-top:8px;" onclick="hideModal()">Maybe Later</button>
        </div>
    `);
}

function showMerchantSubscriptionPrompt() {
    showModal(`
        <div style="padding:10px;">
            <h3>🏪 Activate Merchant Access</h3>
            <p style="color:#666;margin:15px 0;">Create your store and sell worldwide!</p>
            <div style="background:#FFF8E1;padding:15px;border-radius:8px;margin-bottom:15px;">
                <p><strong>🏪 Merchant Plan:</strong> $${APP.merchantPrice} Lifetime</p>
                <p style="font-size:13px;">• Create your store</p>
                <p style="font-size:13px;">• Upload unlimited products</p>
                <p style="font-size:13px;">• Escrow protection</p>
            </div>
            <button class="btn-gold btn-full" onclick="payMerchantSubscription()">💳 Pay $${APP.merchantPrice} - Activate</button>
            <button class="btn-outline btn-full" style="margin-top:8px;" onclick="hideModal()">Maybe Later</button>
        </div>
    `);
}

async function payAffiliateSubscription() {
    hideModal();
    if ((APP.userProfile?.walletBalance || 0) < APP.affiliatePrice) {
        showToast(`Insufficient balance. Need $${APP.affiliatePrice}.`, 'error');
        navigateTo('wallet');
        return;
    }
    showLoader();
    try {
        const userId = APP.userProfile?.uid || APP.currentUser?.uid;
        const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        await db.collection('users').doc(userId).update({
            walletBalance: firebase.firestore.FieldValue.increment(-APP.affiliatePrice),
            isAffiliate: true, affiliateSubscription: true,
            affiliateSubscriptionExpiry: firebase.firestore.Timestamp.fromDate(thirtyDaysFromNow)
        });
        APP.userProfile.walletBalance -= APP.affiliatePrice;
        APP.userProfile.isAffiliate = true;
        APP.userProfile.affiliateSubscription = true;
        APP.userProfile.affiliateSubscriptionExpiry = thirtyDaysFromNow;
        await db.collection('transactions').add({
            userId, type: 'subscription', amount: APP.affiliatePrice,
            currency: 'USD', status: 'completed',
            description: 'Affiliate subscription - 30 days',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        if (typeof createNotification === 'function') {
            await createNotification(userId, 'Affiliate Activated! 🎉',
                'Start promoting products and earning commissions!', '📢', 'affiliate');
        }
        hideLoader();
        showToast('Affiliate access activated! 🎉', 'success');
        navigateTo('affiliate');
    } catch (error) {
        hideLoader();
        showToast('Payment failed. Try again.', 'error');
    }
}

async function payMerchantSubscription() {
    hideModal();
    if ((APP.userProfile?.walletBalance || 0) < APP.merchantPrice) {
        showToast(`Insufficient balance. Need $${APP.merchantPrice}.`, 'error');
        navigateTo('wallet');
        return;
    }
    showLoader();
    try {
        const userId = APP.userProfile?.uid || APP.currentUser?.uid;
        await db.collection('users').doc(userId).update({
            walletBalance: firebase.firestore.FieldValue.increment(-APP.merchantPrice),
            isMerchant: true, merchantSubscription: 'lifetime',
            storeActive: true, storeName: `${APP.userProfile.username}'s Store`
        });
        APP.userProfile.walletBalance -= APP.merchantPrice;
        APP.userProfile.isMerchant = true;
        APP.userProfile.merchantSubscription = 'lifetime';
        APP.userProfile.storeActive = true;
        await db.collection('transactions').add({
            userId, type: 'subscription', amount: APP.merchantPrice,
            currency: 'USD', status: 'completed',
            description: 'Merchant subscription - Lifetime',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        if (typeof createNotification === 'function') {
            await createNotification(userId, 'Store Activated! 🏪',
                'Start adding products to your store!', '🏪', 'merchant');
        }
        hideLoader();
        showToast('Merchant access activated! 🏪', 'success');
        navigateTo('merchant');
    } catch (error) {
        hideLoader();
        showToast('Payment failed. Try again.', 'error');
    }
}

// =====================
// COUNTRY DROPDOWN
// =====================
function populateCountryDropdown() {
    const select = document.getElementById('setup-country');
    if (!select || select.options.length > 1) return;
    
    console.log('🌍 Populating country dropdown...');
    
    select.innerHTML = '<option value="">Select Country</option>';
    
    if (typeof COUNTRIES !== 'undefined') {
        const sorted = Object.entries(COUNTRIES).sort((a, b) => 
            a[1].name.localeCompare(b[1].name)
        );
        
        sorted.forEach(([code, data]) => {
            const option = document.createElement('option');
            option.value = code;
            option.textContent = `${data.flag || ''} ${data.name}`;
            select.appendChild(option);
        });
        
        console.log('✅ Countries loaded:', sorted.length);
    }
}

function updateCountryCode() {
    const country = document.getElementById('setup-country')?.value;
    const display = document.getElementById('country-code-display');
    
    if (display && country && COUNTRIES && COUNTRIES[country]) {
        display.textContent = COUNTRIES[country].code || '+1';
    }
}

// =====================
// UTILITY FUNCTIONS
// =====================
function validateUsername(username) {
    return /^[a-z0-9]{3,30}$/.test(username);
}

function validatePassword(password) {
    return password && password.length >= 6;
}

function isLoggedIn() {
    return localStorage.getItem('shoplify_auth') === 'true' && 
           (APP.currentUser || APP.userProfile);
}

function logout() {
    console.log('🚪 Logging out...');
    localStorage.removeItem('shoplify_auth');
    localStorage.removeItem('shoplify_uid');
    sessionStorage.clear();
    
    if (auth.currentUser) {
        auth.signOut().catch(() => {});
    }
    
    APP.currentUser = null;
    APP.userProfile = null;
    
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    const authScreen = document.getElementById('screen-auth');
    if (authScreen) authScreen.classList.remove('hidden');
    
    window.location.hash = 'auth';
    currentScreen = 'auth';
    
    console.log('✅ Logged out');
}

console.log('✅ auth.js fully loaded - ONESHOPLIFY Auth System Ready');
