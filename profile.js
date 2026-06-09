// profile.js - COMPLETE FINAL VERSION (All subscription applications functional)

async function loadProfileScreen() {
    if (!APP.userProfile) return;
    
    const container = document.getElementById('profile-content');
    if (!container) return;
    
    const badges = [];
    if (APP.userProfile.isVerifiedAffiliate || APP.userProfile.isVerifiedMerchant) badges.push('<span class="verified-badge" title="Verified">✓</span>');
    if (APP.userProfile.isAppVerified) badges.push('<span class="app-verified-badge" title="App Verified">✓</span>');
    if (APP.userProfile.isAmbassador) badges.push('<span class="ambassador-badge" title="Ambassador">👑</span>');
    
    const username = APP.userProfile?.username || '';
    const userId = APP.userProfile?.uid || '';
    const isCustomer = APP.userProfile?.accountType === 'customer';
    
    // Build subscription status section
    let subscriptionHTML = '';
    
    // AFFILIATE STATUS
    if (APP.userProfile.isAffiliate) {
        const expiry = APP.userProfile.affiliateSubscriptionExpiry;
        if (expiry) {
            const expiryDate = expiry.toDate ? expiry.toDate() : new Date(expiry);
            const now = new Date();
            const daysLeft = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
            
            if (daysLeft <= 3 && daysLeft > 0) {
                subscriptionHTML += `
                    <div style="background:#FFF3E0;padding:12px;border-radius:8px;margin:10px 0;border-left:4px solid #FF9800;">
                        <div style="display:flex;justify-content:space-between;align-items:center;">
                            <div>
                                <strong>📢 Affiliate Active</strong>
                                <p style="font-size:12px;color:#E65100;margin-top:3px;">
                                    ⏰ Expires in <strong>${daysLeft} day${daysLeft > 1 ? 's' : ''}</strong>
                                </p>
                            </div>
                            <button class="btn-small btn-gold" onclick="renewAffiliateSubscription()">Renew $${APP.affiliatePrice}</button>
                        </div>
                    </div>`;
            } else if (daysLeft <= 0) {
                subscriptionHTML += `
                    <div style="background:#FFEBEE;padding:12px;border-radius:8px;margin:10px 0;border-left:4px solid #F44336;">
                        <div style="display:flex;justify-content:space-between;align-items:center;">
                            <div>
                                <strong>📢 Affiliate Expired</strong>
                                <p style="font-size:12px;color:#C62828;margin-top:3px;">Your subscription has expired</p>
                            </div>
                            <button class="btn-small btn-gold" onclick="renewAffiliateSubscription()">Renew $${APP.affiliatePrice}</button>
                        </div>
                    </div>`;
            } else {
                subscriptionHTML += `
                    <div style="background:#E8F5E9;padding:10px 15px;border-radius:8px;margin:5px 0;font-size:13px;display:flex;justify-content:space-between;align-items:center;">
                        <span>📢 <strong>Affiliate Active</strong> - ${daysLeft} days remaining</span>
                        ${daysLeft <= 10 ? `<button class="btn-small btn-outline" onclick="renewAffiliateSubscription()">Renew</button>` : ''}
                    </div>`;
            }
        }
    } else if (APP.userProfile.affiliateSubscription === false) {
        // Was subscribed before but expired
        subscriptionHTML += `
            <button class="menu-item" onclick="applyForAffiliate()">
                <span class="menu-icon">📢</span> Renew Affiliate Access
                <span style="margin-left:auto;color:var(--gold-dark);">$${APP.affiliatePrice}/mo</span>
                <span class="menu-arrow">›</span>
            </button>`;
    } else {
        // Never subscribed
        subscriptionHTML += `
            <button class="menu-item" onclick="applyForAffiliate()">
                <span class="menu-icon">📢</span> Become an Affiliate
                <span style="margin-left:auto;color:var(--gold-dark);">$${APP.affiliatePrice}/mo</span>
                <span class="menu-arrow">›</span>
            </button>`;
    }
    
    // MERCHANT STATUS
    if (APP.userProfile.isMerchant) {
        subscriptionHTML += `
            <div style="background:#E8F5E9;padding:10px 15px;border-radius:8px;margin:5px 0;font-size:13px;">
                🏪 <strong>Merchant Active</strong> - ${APP.userProfile.merchantSubscription === 'lifetime' ? 'Lifetime Access' : 'Active'}
            </div>`;
    } else if (APP.userProfile.merchantSubscription === false) {
        subscriptionHTML += `
            <button class="menu-item" onclick="applyForMerchant()">
                <span class="menu-icon">🏪</span> Renew Merchant Access
                <span style="margin-left:auto;color:var(--gold-dark);">$${APP.merchantPrice} lifetime</span>
                <span class="menu-arrow">›</span>
            </button>`;
    } else {
        subscriptionHTML += `
            <button class="menu-item" onclick="applyForMerchant()">
                <span class="menu-icon">🏪</span> Become a Merchant
                <span style="margin-left:auto;color:var(--gold-dark);">$${APP.merchantPrice} lifetime</span>
                <span class="menu-arrow">›</span>
            </button>`;
    }
    
    // DROPSHIP STATUS
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
                        <span>📦 <strong>${planName.toUpperCase()} Plan</strong> - ${daysLeft} days remaining</span>
                        <div>
                            ${daysLeft <= 10 ? `<button class="btn-small btn-outline" onclick="renewDropshipPlan()">Renew</button>` : ''}
                            <button class="btn-small btn-outline" onclick="upgradeDropshipPlan()" style="margin-left:5px;">Upgrade</button>
                        </div>
                    </div>`;
            }
        }
    } else if (APP.userProfile.dropshipPlan && APP.userProfile.dropshipPlan !== 'none') {
        subscriptionHTML += `
            <button class="menu-item" onclick="applyForDropship()">
                <span class="menu-icon">📦</span> Renew Dropship Plan
                <span style="margin-left:auto;color:var(--gold-dark);">From $${APP.dropshipStarter}/mo</span>
                <span class="menu-arrow">›</span>
            </button>`;
    } else {
        subscriptionHTML += `
            <button class="menu-item" onclick="applyForDropship()">
                <span class="menu-icon">📦</span> Become a Dropshipper
                <span style="margin-left:auto;color:var(--gold-dark);">From $${APP.dropshipStarter}/mo</span>
                <span class="menu-arrow">›</span>
            </button>`;
    }
    
    // ADVERTISER/INFLUENCER STATUS
    if (APP.userProfile.advertiserSubscription) {
        subscriptionHTML += `
            <div style="background:#E8F5E9;padding:10px 15px;border-radius:8px;margin:5px 0;font-size:13px;">
                🤝 <strong>Influencer Access Active</strong>
            </div>`;
    } else {
        subscriptionHTML += `
            <button class="menu-item" onclick="applyForAdvertiser()">
                <span class="menu-icon">🤝</span> Become an Influencer
                <span style="margin-left:auto;color:var(--gold-dark);">$${APP.advertiserPrice}/mo</span>
                <span class="menu-arrow">›</span>
            </button>`;
    }
    
    container.innerHTML = `
        <div class="profile-header-card">
            <div style="position:relative;display:inline-block;cursor:pointer;" onclick="document.getElementById('profile-pic-upload').click()">
                <img src="${APP.userProfile.photoURL || APP.currentUser?.photoURL || 'app-icon.png'}" 
                     alt="Profile" class="profile-avatar" id="profile-avatar-img"
                     onerror="this.src='app-icon.png'">
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
            
            ${APP.userProfile.isAffiliate ? `
                <button class="menu-item" onclick="navigateTo('affiliate')">
                    <span class="menu-icon">📢</span> Affiliate Dashboard
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
            
            ${APP.userProfile.advertiserSubscription ? `
                <button class="menu-item" onclick="navigateTo('advertisers')">
                    <span class="menu-icon">🤝</span> Influencers
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
                <small style="color:#666;">Shoplify Wallet Username:</small>
                <div style="font-size:20px;font-weight:700;color:var(--gold-dark);">@${username}</div>
                <small style="color:#999;font-size:11px;">Share this to receive transfers</small>
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
// APPLY FOR AFFILIATE
// =====================
function applyForAffiliate() {
    showModal(`
        <div style="padding:10px;">
            <h3>📢 Become an Affiliate</h3>
            <p style="color:#666;margin:15px 0;">
                Earn 4-5% commission on every sale you generate by promoting products!
            </p>
            
            <div style="background:#FFF8E1;padding:15px;border-radius:8px;margin-bottom:15px;">
                <p><strong>💰 Affiliate Plan:</strong> $${APP.affiliatePrice}/month</p>
                <p style="font-size:13px;">✅ Promote any product on Shoplify</p>
                <p style="font-size:13px;">✅ Earn 4-5% commission per sale</p>
                <p style="font-size:13px;">✅ Real-time analytics dashboard</p>
                <p style="font-size:13px;">✅ Access to influencer marketplace</p>
                <p style="font-size:13px;">✅ Unique affiliate links for tracking</p>
            </div>
            
            <p style="font-size:13px;color:#666;margin-bottom:15px;">
                Your wallet balance: <strong>${formatCurrency(APP.userProfile?.walletBalance || 0)}</strong>
            </p>
            
            ${(APP.userProfile?.walletBalance || 0) >= APP.affiliatePrice ? `
                <button class="btn-gold btn-full" onclick="payAffiliateSubscription()">
                    💳 Pay $${APP.affiliatePrice} - Activate Now
                </button>
            ` : `
                <div style="background:#FFEBEE;padding:12px;border-radius:8px;margin-bottom:10px;">
                    <p style="color:#C62828;font-size:13px;">⚠️ Insufficient balance. You need $${APP.affiliatePrice}.</p>
                </div>
                <button class="btn-gold btn-full" onclick="hideModal();navigateTo('wallet');">
                    💰 Deposit Funds First
                </button>
            `}
            
            <button class="btn-outline btn-full" style="margin-top:8px;" onclick="hideModal()">Cancel</button>
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
            isAffiliate: true,
            affiliateSubscription: true,
            affiliateSubscriptionExpiry: firebase.firestore.Timestamp.fromDate(thirtyDaysFromNow),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        APP.userProfile.walletBalance -= APP.affiliatePrice;
        APP.userProfile.isAffiliate = true;
        APP.userProfile.affiliateSubscription = true;
        APP.userProfile.affiliateSubscriptionExpiry = thirtyDaysFromNow;
        
        await db.collection('transactions').add({
            userId: userId,
            type: 'subscription',
            amount: APP.affiliatePrice,
            currency: 'USD',
            status: 'completed',
            description: 'Affiliate subscription - 30 days',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        await createNotification(userId,
            'Affiliate Activated! 🎉',
            'Your affiliate subscription is active! Start promoting products and earning commissions.',
            '📢',
            'affiliate'
        );
        
        hideLoader();
        showToast('Affiliate access activated! 🎉', 'success');
        loadProfileScreen();
        
    } catch (error) {
        hideLoader();
        console.error('Affiliate payment error:', error);
        showToast('Payment failed. Please try again.', 'error');
    }
}

async function renewAffiliateSubscription() {
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
            affiliateSubscriptionExpiry: firebase.firestore.Timestamp.fromDate(thirtyDaysFromNow),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        APP.userProfile.walletBalance -= APP.affiliatePrice;
        APP.userProfile.affiliateSubscriptionExpiry = thirtyDaysFromNow;
        
        await db.collection('transactions').add({
            userId: userId,
            type: 'subscription',
            amount: APP.affiliatePrice,
            currency: 'USD',
            status: 'completed',
            description: 'Affiliate subscription renewal - 30 days',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        await createNotification(userId,
            'Subscription Renewed! ✅',
            'Your affiliate subscription has been renewed for 30 days.',
            '📢',
            'affiliate'
        );
        
        hideLoader();
        showToast('Affiliate subscription renewed! 🎉', 'success');
        loadProfileScreen();
        
    } catch (error) {
        hideLoader();
        console.error('Renewal error:', error);
        showToast('Renewal failed. Try again.', 'error');
    }
}

// =====================
// APPLY FOR MERCHANT
// =====================
function applyForMerchant() {
    showModal(`
        <div style="padding:10px;">
            <h3>🏪 Become a Merchant</h3>
            <p style="color:#666;margin:15px 0;">
                Create your own online store and sell products to customers worldwide!
            </p>
            
            <div style="background:#FFF8E1;padding:15px;border-radius:8px;margin-bottom:15px;">
                <p><strong>🏪 Merchant Plan:</strong> $${APP.merchantPrice} (Lifetime Access)</p>
                <p style="font-size:13px;">✅ Create your online store</p>
                <p style="font-size:13px;">✅ Upload unlimited products</p>
                <p style="font-size:13px;">✅ Accept payments via escrow</p>
                <p style="font-size:13px;">✅ Choose from 4 store templates</p>
                <p style="font-size:13px;">✅ One-time payment, lifetime access!</p>
            </div>
            
            <p style="font-size:13px;color:#666;margin-bottom:15px;">
                Your wallet balance: <strong>${formatCurrency(APP.userProfile?.walletBalance || 0)}</strong>
            </p>
            
            ${(APP.userProfile?.walletBalance || 0) >= APP.merchantPrice ? `
                <button class="btn-gold btn-full" onclick="payMerchantSubscription()">
                    💳 Pay $${APP.merchantPrice} - Activate Now
                </button>
            ` : `
                <div style="background:#FFEBEE;padding:12px;border-radius:8px;margin-bottom:10px;">
                    <p style="color:#C62828;font-size:13px;">⚠️ Insufficient balance. You need $${APP.merchantPrice}.</p>
                </div>
                <button class="btn-gold btn-full" onclick="hideModal();navigateTo('wallet');">
                    💰 Deposit Funds First
                </button>
            `}
            
            <button class="btn-outline btn-full" style="margin-top:8px;" onclick="hideModal()">Cancel</button>
        </div>
    `);
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
            isMerchant: true,
            merchantSubscription: 'lifetime',
            storeActive: true,
            storeName: `${APP.userProfile.username}'s Store`,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        APP.userProfile.walletBalance -= APP.merchantPrice;
        APP.userProfile.isMerchant = true;
        APP.userProfile.merchantSubscription = 'lifetime';
        APP.userProfile.storeActive = true;
        APP.userProfile.storeName = `${APP.userProfile.username}'s Store`;
        
        await db.collection('transactions').add({
            userId: userId,
            type: 'subscription',
            amount: APP.merchantPrice,
            currency: 'USD',
            status: 'completed',
            description: 'Merchant subscription - Lifetime',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        await createNotification(userId,
            'Store Activated! 🏪',
            'Your merchant store is ready! Start adding products to sell.',
            '🏪',
            'merchant'
        );
        
        hideLoader();
        showToast('Merchant access activated! 🏪', 'success');
        loadProfileScreen();
        
    } catch (error) {
        hideLoader();
        console.error('Merchant payment error:', error);
        showToast('Payment failed. Please try again.', 'error');
    }
}

// =====================
// APPLY FOR DROPSHIP
// =====================
function applyForDropship() {
    const plans = [
        { name: 'Starter', price: APP.dropshipStarter, products: 20, stores: 1, color: '#4CAF50' },
        { name: 'Growth', price: APP.dropshipGrowth, products: 100, stores: 1, color: '#2196F3' },
        { name: 'Professional', price: APP.dropshipPro, products: 500, stores: 3, color: '#9C27B0' },
        { name: 'Elite', price: APP.dropshipElite, products: 'Unlimited', stores: 'Unlimited', color: '#FF9800' }
    ];
    
    showModal(`
        <div style="padding:10px;max-height:70vh;overflow-y:auto;">
            <h3>📦 Choose Dropship Plan</h3>
            <p style="color:#666;margin:10px 0;">Resell products without holding inventory</p>
            
            <p style="font-size:13px;color:#666;margin-bottom:10px;">
                Your wallet balance: <strong>${formatCurrency(APP.userProfile?.walletBalance || 0)}</strong>
            </p>
            
            ${plans.map(plan => `
                <div class="plan-card" style="border-left:4px solid ${plan.color};margin-bottom:10px;">
                    <h4>${plan.name}</h4>
                    <div class="plan-price">$${plan.price}<span style="font-size:14px;">/mo</span></div>
                    <ul class="plan-features">
                        <li>📦 ${plan.products} Products</li>
                        <li>🏪 ${plan.stores} Store${plan.stores !== 1 ? 's' : ''}</li>
                        <li>💰 Set your own profit margins</li>
                        <li>🔄 Auto order forwarding</li>
                    </ul>
                    ${(APP.userProfile?.walletBalance || 0) >= plan.price ? `
                        <button class="btn-gold btn-full" onclick="payDropshipSubscription('${plan.name.toLowerCase()}', ${plan.price})">
                            Select ${plan.name} - $${plan.price}/mo
                        </button>
                    ` : `
                        <button class="btn-outline btn-full" disabled style="opacity:0.5;">
                            Need $${plan.price} (Balance: ${formatCurrency(APP.userProfile?.walletBalance || 0)})
                        </button>
                    `}
                </div>
            `).join('')}
            
            ${(APP.userProfile?.walletBalance || 0) < APP.dropshipStarter ? `
                <button class="btn-gold btn-full" onclick="hideModal();navigateTo('wallet');">
                    💰 Deposit Funds First
                </button>
            ` : ''}
            
            <button class="btn-outline btn-full" style="margin-top:8px;" onclick="hideModal()">Cancel</button>
        </div>
    `);
}

async function payDropshipSubscription(plan, price) {
    hideModal();
    
    if ((APP.userProfile?.walletBalance || 0) < price) {
        showToast(`Insufficient balance. Need $${price}.`, 'error');
        navigateTo('wallet');
        return;
    }
    
    showLoader();
    
    try {
        const userId = APP.userProfile?.uid || APP.currentUser?.uid;
        const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        
        await db.collection('users').doc(userId).update({
            walletBalance: firebase.firestore.FieldValue.increment(-price),
            dropshipPlan: plan,
            isDropshipper: true,
            dropshipPlanExpiry: firebase.firestore.Timestamp.fromDate(thirtyDaysFromNow),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        APP.userProfile.walletBalance -= price;
        APP.userProfile.dropshipPlan = plan;
        APP.userProfile.isDropshipper = true;
        APP.userProfile.dropshipPlanExpiry = thirtyDaysFromNow;
        
        await db.collection('transactions').add({
            userId: userId,
            type: 'subscription',
            amount: price,
            currency: 'USD',
            status: 'completed',
            description: `Dropship ${plan} plan - 30 days`,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        await createNotification(userId,
            'Dropship Activated! 📦',
            `Your ${plan} dropship plan is active! Start importing products.`,
            '📦',
            'dropship'
        );
        
        hideLoader();
        showToast(`${plan} plan activated! 🎉`, 'success');
        loadProfileScreen();
        
    } catch (error) {
        hideLoader();
        console.error('Dropship payment error:', error);
        showToast('Payment failed. Try again.', 'error');
    }
}

async function renewDropshipPlan() {
    const plan = APP.userProfile?.dropshipPlan || 'starter';
    const prices = {
        starter: APP.dropshipStarter,
        growth: APP.dropshipGrowth,
        pro: APP.dropshipPro,
        elite: APP.dropshipElite
    };
    const price = prices[plan] || APP.dropshipStarter;
    
    if ((APP.userProfile?.walletBalance || 0) < price) {
        showToast(`Insufficient balance. Need $${price}.`, 'error');
        navigateTo('wallet');
        return;
    }
    
    showLoader();
    
    try {
        const userId = APP.userProfile?.uid || APP.currentUser?.uid;
        const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        
        await db.collection('users').doc(userId).update({
            walletBalance: firebase.firestore.FieldValue.increment(-price),
            dropshipPlanExpiry: firebase.firestore.Timestamp.fromDate(thirtyDaysFromNow),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        APP.userProfile.walletBalance -= price;
        APP.userProfile.dropshipPlanExpiry = thirtyDaysFromNow;
        
        await db.collection('transactions').add({
            userId: userId,
            type: 'subscription',
            amount: price,
            currency: 'USD',
            status: 'completed',
            description: `Dropship ${plan} renewal - 30 days`,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        hideLoader();
        showToast(`${plan} plan renewed! 🎉`, 'success');
        loadProfileScreen();
        
    } catch (error) {
        hideLoader();
        showToast('Renewal failed.', 'error');
    }
}

function upgradeDropshipPlan() {
    navigateTo('dropship');
}

// =====================
// APPLY FOR ADVERTISER / INFLUENCER
// =====================
function applyForAdvertiser() {
    showModal(`
        <div style="padding:10px;">
            <h3>🤝 Become an Influencer</h3>
            <p style="color:#666;margin:15px 0;">
                Get listed in the influencer marketplace and connect with affiliates for promotion opportunities!
            </p>
            
            <div style="background:#FFF8E1;padding:15px;border-radius:8px;margin-bottom:15px;">
                <p><strong>🤝 Influencer Plan:</strong> $${APP.advertiserPrice}/month</p>
                <p style="font-size:13px;">✅ Get listed in influencer marketplace</p>
                <p style="font-size:13px;">✅ Connect with affiliates for promotions</p>
                <p style="font-size:13px;">✅ Showcase your social media handles</p>
                <p style="font-size:13px;">✅ Receive promotion requests</p>
            </div>
            
            <p style="font-size:13px;color:#666;margin-bottom:15px;">
                Your wallet balance: <strong>${formatCurrency(APP.userProfile?.walletBalance || 0)}</strong>
            </p>
            
            ${(APP.userProfile?.walletBalance || 0) >= APP.advertiserPrice ? `
                <button class="btn-gold btn-full" onclick="payAdvertiserSubscription()">
                    💳 Pay $${APP.advertiserPrice} - Activate Now
                </button>
            ` : `
                <div style="background:#FFEBEE;padding:12px;border-radius:8px;margin-bottom:10px;">
                    <p style="color:#C62828;font-size:13px;">⚠️ Insufficient balance. You need $${APP.advertiserPrice}.</p>
                </div>
                <button class="btn-gold btn-full" onclick="hideModal();navigateTo('wallet');">
                    💰 Deposit Funds First
                </button>
            `}
            
            <button class="btn-outline btn-full" style="margin-top:8px;" onclick="hideModal()">Cancel</button>
        </div>
    `);
}

async function payAdvertiserSubscription() {
    hideModal();
    
    if ((APP.userProfile?.walletBalance || 0) < APP.advertiserPrice) {
        showToast(`Insufficient balance. Need $${APP.advertiserPrice}.`, 'error');
        navigateTo('wallet');
        return;
    }
    
    showLoader();
    
    try {
        const userId = APP.userProfile?.uid || APP.currentUser?.uid;
        const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        
        await db.collection('users').doc(userId).update({
            walletBalance: firebase.firestore.FieldValue.increment(-APP.advertiserPrice),
            advertiserSubscription: true,
            advertiserSubscriptionExpiry: firebase.firestore.Timestamp.fromDate(thirtyDaysFromNow),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        APP.userProfile.walletBalance -= APP.advertiserPrice;
        APP.userProfile.advertiserSubscription = true;
        APP.userProfile.advertiserSubscriptionExpiry = thirtyDaysFromNow;
        
        await db.collection('transactions').add({
            userId: userId,
            type: 'subscription',
            amount: APP.advertiserPrice,
            currency: 'USD',
            status: 'completed',
            description: 'Influencer subscription - 30 days',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Add to advertisers collection
        await db.collection('advertisers').add({
            userId: userId,
            name: APP.userProfile.displayName || APP.userProfile.username,
            photoURL: APP.userProfile.photoURL || '',
            rating: 0,
            platform: 'Shoplify',
            handle: '@' + APP.userProfile.username,
            whatsappLink: '',
            description: 'Influencer on Shoplify',
            status: 'active',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        await createNotification(userId,
            'Influencer Access Activated! 🤝',
            'You are now listed in the influencer marketplace! Update your profile in settings.',
            '🤝',
            'advertisers'
        );
        
        hideLoader();
        showToast('Influencer access activated! 🤝', 'success');
        loadProfileScreen();
        navigateTo('advertisers');
        
    } catch (error) {
        hideLoader();
        console.error('Advertiser payment error:', error);
        showToast('Payment failed. Try again.', 'error');
    }
}

// =====================
// PROFILE PICTURE UPLOAD
// =====================
async function uploadProfilePicture(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
        showToast('Image too large. Max 5MB.', 'error');
        return;
    }
    
    showLoader();
    
    try {
        const imageUrl = await uploadToCloudinary(file);
        
        await db.collection('users').doc(APP.userProfile.uid).update({
            photoURL: imageUrl,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        APP.userProfile.photoURL = imageUrl;
        
        const avatarImg = document.getElementById('profile-avatar-img');
        if (avatarImg) avatarImg.src = imageUrl;
        
        const headerAvatar = document.getElementById('header-avatar');
        if (headerAvatar) headerAvatar.src = imageUrl;
        
        hideLoader();
        showToast('Profile picture updated! 📷', 'success');
        
    } catch (error) {
        hideLoader();
        console.error('Upload error:', error);
        showToast('Failed to upload image. Try again.', 'error');
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
                <small style="color:#999;">3-30 lowercase letters/numbers</small>
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
            
            ${APP.userProfile.advertiserSubscription ? `
                <div class="settings-section" style="margin-top:25px;">
                    <h3>🤝 Influencer Profile</h3>
                    <div class="input-group" style="margin-top:10px;">
                        <label>Platform</label>
                        <input type="text" id="advertiser-platform" class="input-field" value="${APP.userProfile.advertiserPlatform || 'Shoplify'}" placeholder="e.g. Instagram, TikTok">
                    </div>
                    <div class="input-group" style="margin-top:10px;">
                        <label>Handle</label>
                        <input type="text" id="advertiser-handle" class="input-field" value="${APP.userProfile.advertiserHandle || '@' + APP.userProfile.username}" placeholder="@yourhandle">
                    </div>
                    <div class="input-group" style="margin-top:10px;">
                        <label>WhatsApp Link</label>
                        <input type="url" id="advertiser-whatsapp" class="input-field" value="${APP.userProfile.advertiserWhatsapp || ''}" placeholder="https://wa.me/...">
                    </div>
                    <div class="input-group" style="margin-top:10px;">
                        <label>Description</label>
                        <textarea id="advertiser-description" class="input-field" rows="2">${APP.userProfile.advertiserDescription || 'Influencer on Shoplify'}</textarea>
                    </div>
                    <button class="btn-gold btn-full" style="margin-top:15px;" onclick="saveAdvertiserProfile()">💾 Save Influencer Profile</button>
                </div>
            ` : ''}
            
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
                    <button class="btn-outline btn-full" style="margin-top:15px;" onclick="applyForVerification()">Apply for Verification</button>
                `}
            </div>
            
            <div class="settings-section" style="margin-top:25px;">
                <h3>ℹ️ About</h3>
                <p style="color:#666;">Shoplify Enterprise v${APP.version}</p>
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

async function saveAdvertiserProfile() {
    const platform = document.getElementById('advertiser-platform')?.value?.trim();
    const handle = document.getElementById('advertiser-handle')?.value?.trim();
    const whatsapp = document.getElementById('advertiser-whatsapp')?.value?.trim();
    const description = document.getElementById('advertiser-description')?.value?.trim();
    
    showLoader();
    
    try {
        const updates = {
            advertiserPlatform: platform,
            advertiserHandle: handle,
            advertiserWhatsapp: whatsapp,
            advertiserDescription: description,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection('users').doc(APP.userProfile.uid).update(updates);
        Object.assign(APP.userProfile, updates);
        
        // Update advertisers collection
        const snap = await db.collection('advertisers').where('userId', '==', APP.userProfile.uid).limit(1).get();
        if (!snap.empty) {
            await snap.docs[0].ref.update({
                platform: platform || 'Shoplify',
                handle: handle || '@' + APP.userProfile.username,
                whatsappLink: whatsapp || '',
                description: description || 'Influencer on Shoplify',
                photoURL: APP.userProfile.photoURL || '',
                name: APP.userProfile.displayName || APP.userProfile.username
            });
        }
        
        hideLoader();
        showToast('Influencer profile saved! ✅', 'success');
        
    } catch (error) {
        hideLoader();
        console.error('Save advertiser error:', error);
        showToast('Failed to save', 'error');
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
    
    if (!name || !dob) { showToast('Please fill in all fields', 'error'); return; }
    
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
            name, dob, sales, referrals, earnings,
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
        showToast('Failed to submit. Try again.', 'error');
    }
}

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
