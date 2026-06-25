// profile.js - COMPLETE FINAL VERSION (With Store Ownership, Plans, Subscriptions, Influencer)
// ONESHOPLIFY Enterprise - All Features Working

console.log('✅ profile.js loaded');

// =====================
// LOAD PROFILE SCREEN
// =====================
async function loadProfileScreen() {
    if (!APP.userProfile) {
        return;
    }
    
    const container = document.getElementById('profile-content');
    if (!container) {
        return;
    }
    
    const badges = [];
    if (APP.userProfile.isVerifiedMerchant) {
        badges.push('<span class="verified-badge" title="Verified">✓</span>');
    }
    if (APP.userProfile.isAppVerified) {
        badges.push('<span class="app-verified-badge" title="App Verified">✓</span>');
    }
    if (APP.userProfile.isAmbassador) {
        badges.push('<span class="ambassador-badge" title="Ambassador">👑</span>');
    }
    if (APP.userProfile.storeBadge) {
        badges.push(`<span style="background:${APP.userProfile.storeBadgeColor || '#2196F3'};color:white;padding:2px 8px;border-radius:10px;font-size:10px;" title="Store Badge">✓</span>`);
    }
    
    const username = APP.userProfile?.username || '';
    const userId = APP.userProfile?.uid || '';
    const isCustomer = APP.userProfile?.accountType === 'customer';
    
    // Build subscription status HTML
    let subscriptionHTML = '';
    
    // =====================
    // STORE OWNERSHIP STATUS
    // =====================
    if (APP.userProfile.hasStore) {
        const storePlan = APP.userProfile.storePlan || 'basic';
        const storeName = APP.userProfile.storeName || 'My Store';
        const storeUrl = APP.userProfile.storeUrl || '';
        
        subscriptionHTML += `
            <div style="background:#E8F5E9;padding:12px;border-radius:8px;margin:5px 0;font-size:13px;display:flex;justify-content:space-between;align-items:center;">
                <div>
                    <span>🏪 <strong>Store Active</strong></span>
                    <p style="font-size:11px;color:#666;margin-top:2px;">${storeName} - ${storePlan.toUpperCase()} Plan</p>
                </div>
                <button class="btn-small btn-outline" onclick="navigateTo('store-dashboard')">Dashboard</button>
            </div>
            <button class="menu-item" onclick="navigateTo('store-dashboard')">
                <span class="menu-icon">📊</span> Store Dashboard
                <span class="menu-arrow">›</span>
            </button>
            <button class="menu-item" onclick="navigateTo('store-customization')">
                <span class="menu-icon">🎨</span> Store Customization
                <span class="menu-arrow">›</span>
            </button>`;
    } else {
        subscriptionHTML += `
            <button class="menu-item" onclick="startStoreCreation()">
                <span class="menu-icon">🏪</span> Own a Store
                <span style="margin-left:auto;color:var(--gold-dark);">Create Now</span>
                <span class="menu-arrow">›</span>
            </button>`;
    }
    
    // =====================
    // DROPSHIP STATUS
    // =====================
    if (APP.userProfile.isDropshipper) {
        const expiry = APP.userProfile.dropshipPlanExpiry;
        if (expiry) {
            const expiryDate = expiry.toDate ? expiry.toDate() : new Date(expiry);
            const now = new Date();
            const daysLeft = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
            const planName = APP.userProfile.dropshipPlan || 'starter';
            
            if (daysLeft <= 3 && daysLeft > 0) {
                subscriptionHTML += `
                    <div style="background:#FFF3E0;padding:12px;border-radius:8px;margin:10px 0;border-left:4px solid #FF9800;">
                        <div style="display:flex;justify-content:space-between;align-items:center;">
                            <div>
                                <strong>📦 ${planName.toUpperCase()} Plan</strong>
                                <p style="font-size:12px;color:#E65100;margin-top:3px;">
                                    ⏰ Expires in <strong>${daysLeft} day${daysLeft > 1 ? 's' : ''}</strong>
                                </p>
                            </div>
                            <button class="btn-small btn-gold" onclick="renewDropshipPlan()">Renew</button>
                        </div>
                    </div>`;
            } else if (daysLeft <= 0) {
                subscriptionHTML += `
                    <div style="background:#FFEBEE;padding:12px;border-radius:8px;margin:10px 0;border-left:4px solid #F44336;">
                        <div style="display:flex;justify-content:space-between;align-items:center;">
                            <div>
                                <strong>📦 Dropship Expired</strong>
                                <p style="font-size:12px;color:#C62828;margin-top:3px;">Your plan has expired</p>
                            </div>
                            <button class="btn-small btn-gold" onclick="renewDropshipPlan()">Renew</button>
                        </div>
                    </div>`;
            } else {
                subscriptionHTML += `
                    <div style="background:#E8F5E9;padding:10px 15px;border-radius:8px;margin:5px 0;font-size:13px;display:flex;justify-content:space-between;align-items:center;">
                        <span>📦 <strong>${planName.toUpperCase()} Plan</strong> - ${daysLeft} days</span>
                        <div>
                            ${daysLeft <= 10 ? `<button class="btn-small btn-outline" onclick="renewDropshipPlan()">Renew</button>` : ''}
                            <button class="btn-small btn-outline" onclick="upgradeDropshipPlan()" style="margin-left:5px;">Upgrade</button>
                        </div>
                    </div>`;
            }
        }
    } else {
        subscriptionHTML += `
            <button class="menu-item" onclick="applyForDropship()">
                <span class="menu-icon">📦</span> Become a Dropshipper
                <span style="margin-left:auto;color:var(--gold-dark);">From $5/mo</span>
                <span class="menu-arrow">›</span>
            </button>`;
    }
    
    // =====================
    // MERCHANT STATUS
    // =====================
    if (APP.userProfile.isMerchant) {
        subscriptionHTML += `
            <div style="background:#E8F5E9;padding:10px 15px;border-radius:8px;margin:5px 0;font-size:13px;">
                🏪 <strong>Merchant Active</strong> - ${APP.userProfile.merchantSubscription === 'lifetime' ? 'Lifetime Access' : 'Active'}
            </div>`;
    } else {
        subscriptionHTML += `
            <button class="menu-item" onclick="applyForMerchant()">
                <span class="menu-icon">🏪</span> Become a Merchant
                <span style="margin-left:auto;color:var(--gold-dark);">$${APP.merchantPrice} lifetime</span>
                <span class="menu-arrow">›</span>
            </button>`;
    }
    
    // =====================
    // INFLUENCER STATUS
    // =====================
    if (APP.userProfile.influencerStatus === 'approved') {
        subscriptionHTML += `
            <div style="background:#E8F5E9;padding:10px 15px;border-radius:8px;margin:5px 0;font-size:13px;">
                🤝 <strong>Influencer Active</strong>${APP.userProfile.influencerVerified ? ' ✓ Verified' : ''}
            </div>`;
    } else if (APP.userProfile.influencerStatus === 'pending') {
        subscriptionHTML += `
            <div style="background:#FFF8E1;padding:10px 15px;border-radius:8px;margin:5px 0;font-size:13px;">
                🤝 <strong>Influencer Application Pending</strong>
            </div>`;
    } else if (APP.userProfile.influencerStatus === 'suspended') {
        subscriptionHTML += `
            <div style="background:#FFEBEE;padding:10px 15px;border-radius:8px;margin:5px 0;font-size:13px;">
                🤝 <strong>Influencer Suspended</strong>
            </div>`;
    } else if (APP.userProfile.influencerStatus === 'rejected') {
        subscriptionHTML += `
            <div style="background:#FFEBEE;padding:10px 15px;border-radius:8px;margin:5px 0;font-size:13px;">
                🤝 <strong>Influencer Rejected</strong>
            </div>`;
    } else {
        subscriptionHTML += `
            <button class="menu-item" onclick="applyForInfluencer()">
                <span class="menu-icon">🤝</span> Apply as Influencer
                <span class="menu-arrow">›</span>
            </button>`;
    }
    
    // =====================
    // RENDER PROFILE
    // =====================
    container.innerHTML = `
        <div class="profile-header-card">
            <div style="position:relative;display:inline-block;cursor:pointer;" onclick="document.getElementById('profile-pic-upload').click()">
                <img src="${APP.userProfile.photoURL || APP.currentUser?.photoURL || '/app-icon.png'}" 
                     alt="Profile" 
                     class="profile-avatar" 
                     id="profile-avatar-img"
                     onerror="this.src='/app-icon.png'">
                <div style="position:absolute;bottom:5px;right:5px;background:var(--gold);width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;">📷</div>
            </div>
            <input type="file" id="profile-pic-upload" accept="image/*" style="display:none;" onchange="uploadProfilePicture(event)">
            <h2 class="profile-name">${APP.userProfile.displayName || username}</h2>
            <p class="profile-username">@${username}</p>
            <div class="profile-badges">${badges.join(' ')}</div>
            <p style="margin-top:8px;">${APP.userProfile.countryFlag || '🌍'} ${APP.userProfile.country || ''}</p>
            <p style="font-size:13px;color:#666;">${APP.userProfile.accountType || 'Customer'} | ${APP.userProfile.currency || 'USD'}</p>
        </div>
        
        <div style="padding:0 15px;">${subscriptionHTML}</div>
        
        <div class="profile-menu">
            <button class="menu-item" onclick="navigateTo('settings')">
                <span class="menu-icon">⚙️</span> Settings
                <span class="menu-arrow">›</span>
            </button>
            
            <button class="menu-item" onclick="navigateTo('orders')">
                <span class="menu-icon">📦</span> My Orders
                <span class="menu-arrow">›</span>
            </button>
            
            <button class="menu-item" onclick="navigateTo('wallet')">
                <span class="menu-icon">💰</span> Wallet
                <span class="menu-arrow">›</span>
            </button>
            
            <button class="menu-item" onclick="navigateTo('customerservice')">
                <span class="menu-icon">🎧</span> Customer Service
                <span class="menu-arrow">›</span>
            </button>
            
            ${APP.userProfile.hasStore ? `
                <button class="menu-item" onclick="navigateTo('store-dashboard')">
                    <span class="menu-icon">📊</span> Store Dashboard
                    <span class="menu-arrow">›</span>
                </button>
            ` : ''}
            
            ${APP.userProfile.isMerchant ? `
                <button class="menu-item" onclick="navigateTo('merchant')">
                    <span class="menu-icon">🏪</span> Merchant Dashboard
                    <span class="menu-arrow">›</span>
                </button>
            ` : ''}
            
            ${APP.userProfile.isDropshipper ? `
                <button class="menu-item" onclick="navigateTo('dropship')">
                    <span class="menu-icon">📦</span> Dropship Dashboard
                    <span class="menu-arrow">›</span>
                </button>
            ` : ''}
            
            ${APP.userProfile.influencerStatus === 'approved' ? `
                <button class="menu-item" onclick="navigateTo('influencer-dashboard')">
                    <span class="menu-icon">📊</span> Influencer Dashboard
                    <span class="menu-arrow">›</span>
                </button>
            ` : ''}
            
            ${!isCustomer ? `
                <button class="menu-item" onclick="navigateTo('leaderboard')">
                    <span class="menu-icon">🏆</span> Leaderboard
                    <span class="menu-arrow">›</span>
                </button>
                <button class="menu-item" onclick="navigateTo('hall-of-fame')">
                    <span class="menu-icon">🌟</span> Hall of Fame
                    <span class="menu-arrow">›</span>
                </button>
            ` : ''}
            
            <div style="background:#f5f5f5;padding:12px;border-radius:8px;margin:10px 0;">
                <small style="color:#666;">Shoplify Wallet Username (for transfers):</small>
                <div style="font-size:20px;font-weight:700;color:var(--gold-dark);">@${username}</div>
                <small style="color:#999;font-size:11px;">Share this to receive funds from other users</small>
            </div>
            
            <div style="background:#f5f5f5;padding:12px;border-radius:8px;margin:10px 0;">
                <small style="color:#666;">Your User ID:</small>
                <div class="user-id-display">${userId}</div>
                <small style="color:#999;font-size:11px;">Use for Shoplify Wallet login for withdrawals</small>
            </div>
            
            <button class="menu-item" style="color:var(--red);" onclick="confirmLogout()">
                <span class="menu-icon">🚪</span> Logout
                <span class="menu-arrow">›</span>
            </button>
        </div>
    `;
}

// =====================
// STORE CREATION FUNCTIONS
// =====================
function startStoreCreation() {
    console.log('🏪 Starting store creation...');
    
    // Check if user is logged in
    if (!APP.userProfile) {
        showToast('Please login first', 'error');
        navigateTo('auth');
        return;
    }
    
    // Check if user already has a store
    if (APP.userProfile.hasStore) {
        showToast('You already have a store! Go to Store Dashboard.', 'info');
        navigateTo('store-dashboard');
        return;
    }
    
    // Call the store creation flow from storeowner.js
    if (typeof window.startStoreCreationFlow === 'function') {
        window.startStoreCreationFlow();
    } else if (typeof startStoreCreationFlow === 'function') {
        startStoreCreationFlow();
    } else {
        // Fallback: Show store creation directly
        showStoreCreationStep1();
    }
}

// =====================
// DROPSHIP APPLICATION
// =====================
function applyForDropship() {
    const plans = [
        { name: 'Starter', price: APP.dropshipStarter || 5, color: '#4CAF50' },
        { name: 'Professional', price: APP.dropshipGrowth || 15, color: '#2196F3' },
        { name: 'Enterprise', price: APP.dropshipElite || 50, color: '#FF9800' }
    ];
    
    showModal(`
        <div style="padding:10px;max-height:70vh;overflow-y:auto;">
            <h3>📦 Choose Dropship Plan</h3>
            <p style="color:#666;margin-bottom:15px;">Resell products without inventory</p>
            <p style="font-size:13px;color:#666;">Balance: <strong>${formatCurrency(APP.userProfile?.walletBalance || 0)}</strong></p>
            ${plans.map(plan => `
                <div class="plan-card" style="border-left:4px solid ${plan.color};margin:10px 0;">
                    <h4>${plan.name}</h4>
                    <div class="plan-price">$${plan.price}<span style="font-size:14px;">/mo</span></div>
                    ${(APP.userProfile?.walletBalance || 0) >= plan.price ? 
                        `<button class="btn-gold btn-full" onclick="subscribeDropshipPlan('${plan.name.toLowerCase()}',${plan.price})">Select</button>` :
                        `<button class="btn-outline btn-full" disabled>Need $${plan.price}</button>`
                    }
                </div>
            `).join('')}
            <button class="btn-outline btn-full" onclick="hideModal()">Cancel</button>
        </div>
    `);
}

function applyForMerchant() {
    showModal(`
        <div style="padding:10px;">
            <h3>🏪 Become a Merchant</h3>
            <p style="color:#666;margin:15px 0;">Create your store and sell worldwide!</p>
            <div style="background:#FFF8E1;padding:15px;border-radius:8px;margin-bottom:15px;">
                <p><strong>$${APP.merchantPrice} Lifetime</strong></p>
                <p style="font-size:13px;">• Online store • Unlimited products • Escrow protection</p>
            </div>
            <p>Balance: <strong>${formatCurrency(APP.userProfile?.walletBalance || 0)}</strong></p>
            ${(APP.userProfile?.walletBalance || 0) >= APP.merchantPrice ? 
                `<button class="btn-gold btn-full" onclick="payMerchantSubscription()">Pay $${APP.merchantPrice}</button>` :
                `<p style="color:#f44;">Insufficient balance</p><button class="btn-gold btn-full" onclick="hideModal();navigateTo('wallet');">Deposit</button>`
            }
            <button class="btn-outline btn-full" style="margin-top:8px;" onclick="hideModal()">Cancel</button>
        </div>
    `);
}

// =====================
// INFLUENCER APPLICATION
// =====================
async function applyForInfluencer() {
    if (APP.userProfile?.influencerStatus === 'pending') {
        showToast('Your application is under review', 'info');
        return;
    }
    if (APP.userProfile?.influencerStatus === 'approved') {
        showToast('You are already an approved influencer', 'info');
        return;
    }
    if (APP.userProfile?.influencerStatus === 'rejected') {
        showToast('Your application was rejected. You cannot reapply.', 'error');
        return;
    }
    if (APP.userProfile?.influencerStatus === 'suspended') {
        showToast('Your influencer account is suspended.', 'error');
        return;
    }
    
    showModal(`
        <div style="padding:10px;max-height:70vh;overflow-y:auto;">
            <h3>🤝 Apply as Influencer</h3>
            <div style="background:#f5f5f5;padding:15px;border-radius:8px;margin:15px 0;font-size:13px;line-height:1.8;">
                <p><strong>Terms:</strong></p>
                <p>1. Name must match social media</p>
                <p>2. 3 reports = 2-week suspension</p>
                <p>3. 2 suspensions = permanent ban</p>
                <p>4. Earn 5% commission on campaigns</p>
                <p>5. Verified influencers earn $1/sale</p>
                <p>6. Fee: $1/month</p>
            </div>
            <label style="display:flex;align-items:center;gap:8px;cursor:pointer;margin-bottom:15px;">
                <input type="checkbox" id="agree-influencer-terms" style="width:18px;height:18px;">
                <span style="font-size:14px;">I agree to the terms</span>
            </label>
            ${(APP.userProfile?.walletBalance || 0) >= APP.advertiserPrice ? 
                `<button class="btn-gold btn-full" onclick="proceedToInfluencerApplication()">💳 Pay $${APP.advertiserPrice} & Apply</button>` :
                `<div style="background:#FFEBEE;padding:12px;border-radius:8px;margin-bottom:10px;"><p style="color:#C62828;">Need $${APP.advertiserPrice}</p></div><button class="btn-gold btn-full" onclick="hideModal();navigateTo('wallet');">💰 Deposit</button>`
            }
            <button class="btn-outline btn-full" style="margin-top:8px;" onclick="hideModal()">Cancel</button>
        </div>
    `);
}

function proceedToInfluencerApplication() {
    if (!document.getElementById('agree-influencer-terms')?.checked) {
        showToast('Please agree to the terms', 'error');
        return;
    }
    hideModal();
    navigateTo('influencer-apply');
}

// =====================
// SUBSCRIPTION PAYMENTS
// =====================
async function subscribeDropshipPlan(plan, price) {
    hideModal();
    if ((APP.userProfile?.walletBalance || 0) < price) {
        showToast('Insufficient balance', 'error');
        navigateTo('wallet');
        return;
    }
    showLoader();
    try {
        const d = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        await db.collection('users').doc(APP.userProfile.uid).update({
            walletBalance: firebase.firestore.FieldValue.increment(-price),
            dropshipPlan: plan,
            isDropshipper: true,
            dropshipPlanExpiry: firebase.firestore.Timestamp.fromDate(d)
        });
        APP.userProfile.walletBalance -= price;
        APP.userProfile.dropshipPlan = plan;
        APP.userProfile.isDropshipper = true;
        await db.collection('transactions').add({
            userId: APP.userProfile.uid,
            type: 'subscription',
            amount: price,
            currency: 'USD',
            status: 'completed',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        hideLoader();
        showToast(`Subscribed! 🎉`, 'success');
        navigateTo('dropship');
    } catch (e) {
        hideLoader();
        showToast('Failed', 'error');
    }
}

async function payMerchantSubscription() {
    hideModal();
    if ((APP.userProfile?.walletBalance || 0) < APP.merchantPrice) {
        showToast('Insufficient balance', 'error');
        navigateTo('wallet');
        return;
    }
    showLoader();
    try {
        await db.collection('users').doc(APP.userProfile.uid).update({
            walletBalance: firebase.firestore.FieldValue.increment(-APP.merchantPrice),
            isMerchant: true,
            merchantSubscription: 'lifetime',
            storeActive: true,
            storeName: `${APP.userProfile.username}'s Store`
        });
        APP.userProfile.walletBalance -= APP.merchantPrice;
        APP.userProfile.isMerchant = true;
        await db.collection('transactions').add({
            userId: APP.userProfile.uid,
            type: 'subscription',
            amount: APP.merchantPrice,
            currency: 'USD',
            status: 'completed',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        hideLoader();
        showToast('Merchant activated! 🏪', 'success');
        navigateTo('merchant');
    } catch (e) {
        hideLoader();
        showToast('Failed', 'error');
    }
}

async function renewDropshipPlan() {
    const prices = {
        starter: APP.dropshipStarter || 5,
        growth: APP.dropshipGrowth || 15,
        pro: APP.dropshipPro || 30,
        elite: APP.dropshipElite || 50
    };
    const plan = APP.userProfile?.dropshipPlan || 'starter';
    const price = prices[plan] || 5;
    
    if ((APP.userProfile?.walletBalance || 0) < price) {
        showToast('Insufficient balance', 'error');
        navigateTo('wallet');
        return;
    }
    showLoader();
    try {
        const d = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        await db.collection('users').doc(APP.userProfile.uid).update({
            walletBalance: firebase.firestore.FieldValue.increment(-price),
            dropshipPlanExpiry: firebase.firestore.Timestamp.fromDate(d)
        });
        APP.userProfile.walletBalance -= price;
        hideLoader();
        showToast('Renewed! 🎉', 'success');
        loadProfileScreen();
    } catch (e) {
        hideLoader();
        showToast('Failed', 'error');
    }
}

function upgradeDropshipPlan() {
    navigateTo('dropship');
}

// =====================
// PROFILE PICTURE UPLOAD
// =====================
async function uploadProfilePicture(event) {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
        showToast('Max 5MB', 'error');
        return;
    }
    showLoader();
    try {
        const url = await uploadToCloudinary(file);
        await db.collection('users').doc(APP.userProfile.uid).update({ photoURL: url });
        APP.userProfile.photoURL = url;
        document.getElementById('profile-avatar-img').src = url;
        const hdr = document.getElementById('header-avatar');
        if (hdr) hdr.src = url;
        hideLoader();
        showToast('Updated! 📷', 'success');
    } catch (e) {
        hideLoader();
        showToast('Failed', 'error');
    }
}

// =====================
// SETTINGS SCREEN
// =====================
async function loadSettingsScreen() {
    const container = document.getElementById('settings-content');
    if (!container || !APP.userProfile) return;
    
    const countryOptions = typeof COUNTRIES !== 'undefined' ? 
        Object.entries(COUNTRIES).sort((a, b) => a[1].name.localeCompare(b[1].name))
            .map(([code, data]) => `<option value="${code}" ${APP.userProfile.country === code ? 'selected' : ''}>${data.flag || ''} ${data.name}</option>`).join('') : '';
    
    container.innerHTML = `
        <div style="padding:20px;">
            <h3>👤 Account Information</h3>
            
            <div class="input-group" style="margin-top:15px;">
                <label>Username</label>
                <input type="text" id="settings-username" class="input-field" value="${APP.userProfile.username || ''}" placeholder="Username">
                <small style="color:#999;">3-30 characters, lowercase letters/numbers only</small>
            </div>
            
            <div class="input-group" style="margin-top:15px;">
                <label>Display Name</label>
                <input type="text" id="settings-displayname" class="input-field" value="${APP.userProfile.displayName || ''}" placeholder="Display name">
            </div>
            
            <div class="input-group" style="margin-top:15px;">
                <label>Email</label>
                <input type="email" id="settings-email" class="input-field" value="${APP.userProfile.email || ''}" placeholder="Email">
            </div>
            
            <div class="input-group" style="margin-top:15px;">
                <label>Phone Number</label>
                <div class="phone-input-wrapper">
                    <span class="country-code-display" id="settings-country-code">${COUNTRIES?.[APP.userProfile.country]?.code || '+1'}</span>
                    <input type="tel" id="settings-phone" class="input-field phone-input" 
                           value="${(APP.userProfile.phoneNumber || '').replace(COUNTRIES?.[APP.userProfile.country]?.code || '+1', '')}" 
                           placeholder="Phone number">
                </div>
                <small style="color:#f44;">Required for deposits</small>
            </div>
            
            <div class="input-group" style="margin-top:15px;">
                <label>Country</label>
                <select id="settings-country" class="input-field" onchange="updateSettingsCountryCode()">
                    <option value="">Select Country</option>
                    ${countryOptions}
                </select>
            </div>
            
            <div class="input-group" style="margin-top:15px;">
                <label>New Password (leave blank to keep current)</label>
                <input type="password" id="settings-password" class="input-field" placeholder="New password (min 6 characters)">
            </div>
            
            <button class="btn-gold btn-full" style="margin-top:20px;" onclick="saveSettings()">
                💾 Save Changes
            </button>
            
            <div class="settings-section" style="margin-top:25px;">
                <h3>🎨 Appearance</h3>
                <div class="setting-item">
                    <span>Theme</span>
                    <div class="theme-toggle">
                        <button class="theme-btn ${APP.userProfile.theme === 'light' ? 'active' : ''}" 
                                onclick="setThemeSetting('light')">☀️ Light</button>
                        <button class="theme-btn ${APP.userProfile.theme === 'dark' ? 'active' : ''}" 
                                onclick="setThemeSetting('dark')">🌙 Dark</button>
                    </div>
                </div>
                <div class="setting-item">
                    <span>Text Size</span>
                    <div class="text-size-controls">
                        <button class="theme-btn ${APP.userProfile.textSize === 'small' ? 'active' : ''}" 
                                onclick="setTextSizeSetting('small')">S</button>
                        <button class="theme-btn ${APP.userProfile.textSize === 'medium' ? 'active' : ''}" 
                                onclick="setTextSizeSetting('medium')">M</button>
                        <button class="theme-btn ${APP.userProfile.textSize === 'large' ? 'active' : ''}" 
                                onclick="setTextSizeSetting('large')">L</button>
                    </div>
                </div>
            </div>
            
            <div class="settings-section" style="margin-top:25px;">
                <h3>✅ Verification</h3>
                ${APP.userProfile.isAppVerified ? `
                    <div style="background:#E8F5E9;padding:15px;border-radius:8px;text-align:center;">
                        <p style="font-size:30px;">✅</p>
                        <p style="font-weight:600;">You are App Verified</p>
                    </div>
                ` : APP.userProfile.appVerificationApplied ? `
                    <div style="background:#FFF8E1;padding:15px;border-radius:8px;text-align:center;">
                        <p>⏳ Verification in progress...</p>
                    </div>
                ` : `
                    <p style="color:#666;margin-bottom:15px;">
                        Requirements: ${APP.verifyMinSales} sales, ${APP.verifyMinReferrals} referrals, $${APP.verifyMinEarnings} earned
                    </p>
                    <div class="input-group" style="margin-top:10px;">
                        <label>Full Legal Name</label>
                        <input type="text" id="verify-name" class="input-field" placeholder="Enter your full name">
                    </div>
                    <div class="input-group" style="margin-top:10px;">
                        <label>Date of Birth</label>
                        <input type="date" id="verify-dob" class="input-field">
                    </div>
                    <button class="btn-outline btn-full" style="margin-top:15px;" onclick="applyForVerification()">
                        Apply for Verification
                    </button>
                `}
            </div>
            
            <div class="settings-section" style="margin-top:25px;">
                <h3>ℹ️ About</h3>
                <p style="color:#666;">ONESHOPLIFY Enterprise v${APP.version}</p>
                <p style="color:#666;">Powered by Rev</p>
                <p style="color:#666;font-size:13px;">All transactions protected by escrow</p>
            </div>
        </div>
    `;
}

function updateSettingsCountryCode() {
    const country = document.getElementById('settings-country')?.value;
    const display = document.getElementById('settings-country-code');
    if (display && country && COUNTRIES?.[country]) {
        display.textContent = COUNTRIES[country].code || '+1';
    }
}

async function saveSettings() {
    const username = document.getElementById('settings-username')?.value?.trim()?.toLowerCase();
    const displayName = document.getElementById('settings-displayname')?.value?.trim();
    const email = document.getElementById('settings-email')?.value?.trim();
    const phone = document.getElementById('settings-phone')?.value?.trim();
    const country = document.getElementById('settings-country')?.value;
    const password = document.getElementById('settings-password')?.value;
    
    if (username && !/^[a-z0-9]{3,30}$/.test(username)) {
        showToast('Username: 3-30 lowercase letters/numbers only', 'error');
        return;
    }
    
    if (username && username !== APP.userProfile.username) {
        try {
            const check = await db.collection('users').where('username', '==', username).limit(1).get();
            if (!check.empty) {
                showToast('Username already taken', 'error');
                return;
            }
        } catch (error) {
            showToast('Could not verify username', 'error');
            return;
        }
    }
    
    showLoader();
    
    try {
        const updates = { updatedAt: firebase.firestore.FieldValue.serverTimestamp() };
        
        if (username) updates.username = username;
        if (displayName) updates.displayName = displayName;
        if (email) updates.email = email;
        if (country && COUNTRIES?.[country]) {
            updates.country = country;
            updates.countryFlag = COUNTRIES[country].flag || '';
            updates.currency = COUNTRIES[country].currency || 'USD';
            updates.exchangeRate = APP.exchangeRates[(COUNTRIES[country].currency || 'usd').toLowerCase()] || 1;
        }
        if (phone) {
            const code = COUNTRIES?.[country || APP.userProfile.country]?.code || '+1';
            updates.phoneNumber = code + phone;
        }
        if (password && password.length >= 6) {
            updates.password = password;
        }
        
        await db.collection('users').doc(APP.userProfile.uid).update(updates);
        Object.assign(APP.userProfile, updates);
        
        hideLoader();
        showToast('Settings saved! ✅', 'success');
        
    } catch (error) {
        hideLoader();
        console.error('Settings error:', error);
        showToast('Failed to save settings', 'error');
    }
}

function setThemeSetting(theme) {
    APP.userProfile.theme = theme;
    document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.theme-btn').forEach(b => {
        if (b.textContent.includes(theme === 'light' ? 'Light' : 'Dark')) b.classList.add('active');
    });
    document.body.classList.toggle('dark-theme', theme === 'dark');
    db.collection('users').doc(APP.userProfile.uid).update({ theme }).catch(() => {});
}

function setTextSizeSetting(size) {
    APP.userProfile.textSize = size;
    document.querySelectorAll('.text-size-controls .theme-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.text-size-controls .theme-btn').forEach(b => {
        if (b.textContent === size.toUpperCase().substring(0, 1)) b.classList.add('active');
    });
    const sizes = { small: '14px', medium: '16px', large: '18px' };
    document.body.style.fontSize = sizes[size];
    db.collection('users').doc(APP.userProfile.uid).update({ textSize: size }).catch(() => {});
}

async function applyForVerification() {
    const name = document.getElementById('verify-name')?.value?.trim();
    const dob = document.getElementById('verify-dob')?.value;
    
    if (!name || !dob) {
        showToast('Please fill in all fields', 'error');
        return;
    }
    
    const sales = APP.userProfile.totalSales || 0;
    const referrals = APP.userProfile.totalReferrals || 0;
    const earnings = (APP.userProfile.affiliateEarnings || 0) + (APP.userProfile.totalRevenue || 0);
    
    if (sales < APP.verifyMinSales) {
        showToast(`You need ${APP.verifyMinSales} sales (you have ${sales})`, 'error');
        return;
    }
    if (referrals < APP.verifyMinReferrals) {
        showToast(`You need ${APP.verifyMinReferrals} referrals (you have ${referrals})`, 'error');
        return;
    }
    if (earnings < APP.verifyMinEarnings) {
        showToast(`You need $${APP.verifyMinEarnings} earned (you have $${earnings.toFixed(2)})`, 'error');
        return;
    }
    
    try {
        await db.collection('verification_requests').add({
            userId: APP.userProfile.uid,
            name: name,
            dob: dob,
            sales: sales,
            referrals: referrals,
            earnings: earnings,
            status: 'pending',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        await db.collection('users').doc(APP.userProfile.uid).update({
            appVerificationApplied: true
        });
        
        APP.userProfile.appVerificationApplied = true;
        showToast('Verification application submitted! ✅', 'success');
        loadSettingsScreen();
        
    } catch (error) {
        console.error('Verification error:', error);
        showToast('Failed to submit application', 'error');
    }
}

// =====================
// LOGOUT
// =====================
function confirmLogout() {
    showModal(`
        <h3>Logout</h3>
        <p>Are you sure you want to logout?</p>
        <div style="display:flex;gap:10px;margin-top:20px;">
            <button class="btn-outline" style="flex:1;" onclick="hideModal()">Cancel</button>
            <button class="btn-danger" style="flex:1;" onclick="performLogout()">Logout</button>
        </div>
    `);
}

function performLogout() {
    hideModal();
    logout();
}

console.log('✅ profile.js fully loaded - ONESHOPLIFY Profile System Ready');
