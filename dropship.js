// dropship.js - COMPLETE FINAL VERSION (All Plans, Store Auth, Customer Dashboard, Import, Winning Products, Influencer Contracts, Settings, Preview, Installation Animation)
console.log('✅ dropship.js loaded - ONESHOPLIFY Dropship System');
console.log('   Version: 7.0 Enterprise');

// =====================
// DROPSHIP PLANS CONFIGURATION
// =====================
const DROPSHIP_PLANS = {
    starter: {
        name: 'Starter',
        price: 5,
        color: '#4CAF50',
        icon: '🚀',
        requiresAuth: true,
        introAnimation: false,
        contracts: 5,
        verification: false,
        bonus: false,
        features: [
            'Store creation (yourstore.oneshoplify.com)',
            'Import unlimited products',
            'Access winning products',
            'Influencer marketplace access',
            'Partial analytics',
            'Up to 5 influencer contracts/month',
            'Store customization',
            'Customer support'
        ]
    },
    professional: {
        name: 'Professional',
        price: 10,
        color: '#2196F3',
        icon: '📈',
        requiresAuth: false,
        introAnimation: true,
        contracts: 30,
        verification: { minPurchases: 10 },
        bonus: false,
        features: [
            'Public store access (no login required)',
            '3-second logo intro animation',
            'Full analytics (visitors, sales, revenue, conversion)',
            '30 influencer contracts/month',
            'Verification after 10 purchases',
            'Coupons & discounts',
            'Advanced themes',
            'Reviews system',
            'Collections',
            'SEO optimization'
        ]
    },
    enterprise: {
        name: 'Enterprise Verified',
        price: 45,
        color: '#FF9800',
        icon: '👑',
        requiresAuth: false,
        introAnimation: true,
        contracts: Infinity,
        verification: true,
        bonus: true,
        features: [
            'Automatic verification badge',
            'Enterprise analytics (heatmaps, retention, forecasting)',
            'Unlimited influencer contracts',
            'Priority influencer matching',
            'Monthly bonus program (admin approval)',
            'Instant trending alerts',
            'Priority support',
            'Featured stores',
            'Premium themes',
            'Multiple admin accounts',
            'Faster withdrawals',
            'Advanced coupons',
            'VIP merchant group',
            'Early access features',
            'AI store assistant',
            'Abandoned cart recovery',
            'Email campaigns',
            'Store backups',
            'Recovery system',
            'Priority dispute handling'
        ]
    }
};

// =====================
// DROPSHIP DASHBOARD
// =====================
async function loadDropshipDashboard() {
    console.log('📦 Loading dropship dashboard...');
    
    const container = document.getElementById('dropship-content');
    if (!container) {
        console.error('❌ dropship-content container not found');
        return;
    }
    
    container.innerHTML = '<div style="text-align:center;padding:60px;"><div class="loader-spinner" style="margin:0 auto 15px;"></div><p>Loading dashboard...</p></div>';
    
    if (!APP.userProfile) {
        container.innerHTML = '<p style="text-align:center;padding:60px;">Please login to access the dropship dashboard.</p>';
        return;
    }
    
    const currentPlan = APP.userProfile.dropshipPlan || 'none';
    const isSubscribed = APP.userProfile.isDropshipper && currentPlan !== 'none';
    const planDetails = DROPSHIP_PLANS[currentPlan] || null;
    
    if (isSubscribed && planDetails) {
        renderActiveDashboard(container, currentPlan, planDetails);
    } else {
        renderPlansView(container);
    }
}

function renderActiveDashboard(container, currentPlan, planDetails) {
    const storeName = APP.userProfile.storeName || (APP.userProfile.username || 'My') + '\'s Store';
    const storeColor = APP.userProfile.storeColor || '#667eea';
    const username = APP.userProfile.username || 'user';
    const storeUrl = `https://${username}.oneshoplify.com`;
    const isVerified = APP.userProfile.dropshipVerified || planDetails.verification === true;
    const totalSales = APP.userProfile.dropshipTotalSales || 0;
    const isLight = isColorLight(storeColor);
    const textColor = isLight ? '#1a1a1a' : '#ffffff';
    const subColor = isLight ? '#444' : 'rgba(255,255,255,0.8)';
    
    container.innerHTML = `
        <div style="padding:15px;padding-bottom:30px;">
            
            <!-- Store Header Card -->
            <div style="text-align:center;padding:25px 20px;background:linear-gradient(135deg,${storeColor},#764ba2);border-radius:16px;color:${textColor};margin-bottom:15px;box-shadow:0 4px 16px rgba(0,0,0,0.15);">
                ${APP.userProfile.storeLogo ? `<img src="${APP.userProfile.storeLogo}" style="width:60px;height:60px;border-radius:50%;border:3px solid ${textColor};margin-bottom:10px;box-shadow:0 2px 8px rgba(0,0,0,0.2);" onerror="this.style.display='none'">` : ''}
                <h2 style="margin:0;font-size:22px;color:${textColor};">${storeName}</h2>
                ${isVerified ? '<span style="background:#20D5EC;color:white;padding:4px 14px;border-radius:15px;font-size:12px;margin-top:8px;display:inline-block;font-weight:600;">✓ Verified Store</span>' : ''}
                <p style="opacity:0.85;margin:6px 0 0;font-size:14px;color:${subColor};">${planDetails.icon} ${planDetails.name} Plan</p>
            </div>
            
            <!-- Verification Progress -->
            ${!isVerified && planDetails.verification && planDetails.verification.minPurchases ? `
                <div style="background:#FFF8E1;padding:14px;border-radius:10px;margin-bottom:15px;text-align:center;border:1px solid #FFE082;">
                    <p style="font-size:13px;font-weight:600;margin-bottom:6px;">🔒 Verification Progress</p>
                    <p style="font-size:12px;color:#666;margin-bottom:8px;">${totalSales}/${planDetails.verification.minPurchases} purchases needed for verification</p>
                    <div style="background:#e0e0e0;height:8px;border-radius:4px;overflow:hidden;">
                        <div style="background:linear-gradient(90deg,#FFD700,#FFA000);height:8px;border-radius:4px;width:${Math.min(100,(totalSales/planDetails.verification.minPurchases)*100)}%;"></div>
                    </div>
                    ${totalSales >= planDetails.verification.minPurchases ? '<p style="color:#4CAF50;margin-top:6px;font-weight:600;">✅ Eligible for verification!</p>' : ''}
                </div>
            ` : ''}
            
            <!-- Enterprise Bonus Banner -->
            ${planDetails.bonus ? `
                <div style="background:#E8F5E9;padding:14px;border-radius:10px;margin-bottom:15px;text-align:center;border:1px solid #4CAF50;">
                    <p style="font-weight:600;color:#2E7D32;margin:0;">🎁 Enterprise Bonus Program Active</p>
                    <p style="font-size:12px;color:#666;margin:4px 0 0;">Monthly bonus available (requires admin approval)</p>
                </div>
            ` : ''}
            
            <!-- Quick Stats -->
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:15px;">
                <div class="stat-card" style="padding:14px;text-align:center;background:white;border-radius:10px;box-shadow:0 2px 6px rgba(0,0,0,0.04);">
                    <div class="stat-value" id="ds-product-count" style="font-size:22px;font-weight:800;color:#667eea;">-</div>
                    <div class="stat-label" style="font-size:10px;color:#999;">Products</div>
                </div>
                <div class="stat-card" style="padding:14px;text-align:center;background:white;border-radius:10px;box-shadow:0 2px 6px rgba(0,0,0,0.04);">
                    <div class="stat-value" style="font-size:22px;font-weight:800;color:#4CAF50;">${totalSales}</div>
                    <div class="stat-label" style="font-size:10px;color:#999;">Sales</div>
                </div>
                <div class="stat-card" style="padding:14px;text-align:center;background:white;border-radius:10px;box-shadow:0 2px 6px rgba(0,0,0,0.04);">
                    <div class="stat-value" id="ds-total-profit" style="font-size:22px;font-weight:800;color:#FF9800;">$0</div>
                    <div class="stat-label" style="font-size:10px;color:#999;">Profit</div>
                </div>
            </div>
            
            <!-- Main Actions -->
            <div style="display:flex;gap:8px;margin-bottom:8px;">
                <button class="btn-gold" style="flex:1;padding:13px;font-weight:700;font-size:14px;" onclick="navigateTo('dropship-store')">🏪 My Store</button>
                <button class="btn-outline" style="flex:1;padding:13px;font-weight:600;font-size:14px;" onclick="previewStore()">👁️ Preview</button>
            </div>
            
            <button class="btn-outline btn-full" style="margin-bottom:8px;padding:12px;font-size:13px;" onclick="importProductFromMarketplace()">➕ Import from Marketplace</button>
            
            <div style="display:flex;gap:8px;margin-bottom:8px;">
                <button class="btn-outline" style="flex:1;padding:12px;font-size:13px;" onclick="navigateTo('advertisers')">🤝 Influencers (${planDetails.contracts === Infinity ? '∞' : planDetails.contracts})</button>
                <button class="btn-outline" style="flex:1;padding:12px;font-size:13px;" onclick="loadWinningProducts()">🏆 Winning</button>
            </div>
            
            <button class="btn-outline btn-full" style="margin-bottom:8px;padding:12px;font-size:13px;" onclick="dropshipStoreSettings()">⚙️ Store Settings</button>
            <button class="btn-outline btn-full" style="margin-bottom:8px;padding:12px;font-size:13px;" onclick="navigateTo('analytics')">📊 ${planDetails.name === 'Enterprise Verified' ? 'Enterprise ' : ''}Analytics</button>
            
            <!-- Store URL Card -->
            <div style="background:white;padding:15px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);margin-bottom:10px;">
                <p style="font-weight:600;font-size:13px;margin-bottom:6px;">🔗 Your Store URL:</p>
                <div style="font-family:monospace;font-size:11px;word-break:break-all;background:#f5f5f5;padding:10px;border-radius:6px;margin-bottom:8px;">${storeUrl}</div>
                <p style="font-size:11px;color:#999;">Also: ${APP.baseUrl}/store/${username}</p>
                <button class="copy-btn" onclick="copyToClipboard('${storeUrl}');showToast('Store link copied!','success');">📋 Copy Link</button>
            </div>
            
            <!-- Plan Status -->
            <div style="background:#E8F5E9;padding:14px;border-radius:10px;text-align:center;">
                <p style="font-size:13px;margin-bottom:6px;">✅ Active: <strong>${planDetails.name.toUpperCase()}</strong> - $${planDetails.price}/mo</p>
                ${currentPlan !== 'enterprise' ? `<button class="btn-small btn-outline" onclick="upgradeDropshipPlan()">⬆️ Upgrade Plan</button>` : ''}
            </div>
            
        </div>`;
    
    loadDropshipStatsQuick();
}

function renderPlansView(container) {
    container.innerHTML = `
        <div style="padding:15px;padding-bottom:30px;">
            <h3 style="margin-bottom:5px;">💰 Choose Your Dropship Plan</h3>
            <p style="color:#666;margin-bottom:20px;font-size:14px;">Create your store on ONESHOPLIFY and start earning!</p>
            
            <!-- Starter Plan -->
            <div style="background:white;border-radius:14px;padding:20px;margin-bottom:12px;box-shadow:0 2px 10px rgba(0,0,0,0.06);border-left:4px solid #4CAF50;">
                <div style="display:flex;justify-content:space-between;align-items:start;">
                    <div>
                        <h4 style="margin:0;font-size:17px;">🚀 Starter</h4>
                        <div style="font-size:28px;font-weight:800;color:#4CAF50;margin:6px 0;">$5<span style="font-size:14px;color:#999;">/month</span></div>
                    </div>
                </div>
                <ul style="list-style:none;padding:0;font-size:12px;color:#666;line-height:2.2;margin:10px 0;">
                    <li>✅ Store: yourstore.oneshoplify.com</li>
                    <li>✅ Import unlimited products</li>
                    <li>✅ Winning products access</li>
                    <li>✅ Influencer marketplace</li>
                    <li>✅ 5 contracts/month</li>
                    <li>⚠️ Customers must authenticate</li>
                </ul>
                <button class="btn-outline btn-full" style="padding:12px;font-weight:600;" onclick="subscribeDropshipPlan('starter',5)">Subscribe - $5/mo</button>
            </div>
            
            <!-- Professional Plan -->
            <div style="background:white;border-radius:14px;padding:20px;margin-bottom:12px;box-shadow:0 2px 10px rgba(0,0,0,0.06);border-left:4px solid #2196F3;">
                <div style="display:flex;justify-content:space-between;align-items:start;">
                    <div>
                        <h4 style="margin:0;font-size:17px;">📈 Professional</h4>
                        <div style="font-size:28px;font-weight:800;color:#2196F3;margin:6px 0;">$10<span style="font-size:14px;color:#999;">/month</span></div>
                    </div>
                    <span style="background:#E3F2FD;color:#1565C0;padding:4px 10px;border-radius:10px;font-size:11px;font-weight:600;">POPULAR</span>
                </div>
                <ul style="list-style:none;padding:0;font-size:12px;color:#666;line-height:2.2;margin:10px 0;">
                    <li>✅ Public store (no login required)</li>
                    <li>✅ 3-second intro animation</li>
                    <li>✅ Full analytics dashboard</li>
                    <li>✅ 30 influencer contracts/month</li>
                    <li>✅ Store verification (10 purchases)</li>
                    <li>✅ Coupons & discount codes</li>
                    <li>✅ Advanced themes & reviews</li>
                </ul>
                <button class="btn-outline btn-full" style="padding:12px;font-weight:600;" onclick="subscribeDropshipPlan('professional',10)">Subscribe - $10/mo</button>
            </div>
            
            <!-- Enterprise Plan -->
            <div style="background:white;border-radius:14px;padding:20px;margin-bottom:12px;box-shadow:0 2px 10px rgba(0,0,0,0.06);border-left:4px solid #FF9800;position:relative;">
                <span style="position:absolute;top:12px;right:12px;background:#FFD700;color:#1a1a1a;padding:4px 12px;border-radius:10px;font-size:10px;font-weight:700;">BEST VALUE</span>
                <div style="display:flex;justify-content:space-between;align-items:start;">
                    <div>
                        <h4 style="margin:0;font-size:17px;">👑 Enterprise Verified</h4>
                        <div style="font-size:28px;font-weight:800;color:#FF9800;margin:6px 0;">$45<span style="font-size:14px;color:#999;">/month</span></div>
                    </div>
                </div>
                <ul style="list-style:none;padding:0;font-size:12px;color:#666;line-height:2.2;margin:10px 0;">
                    <li>✅ Auto-verified badge on store</li>
                    <li>✅ Enterprise analytics suite</li>
                    <li>✅ Unlimited influencer contracts</li>
                    <li>✅ Monthly bonus program</li>
                    <li>✅ Priority support 24/7</li>
                    <li>✅ AI store assistant</li>
                    <li>✅ All premium features included</li>
                </ul>
                <button class="btn-gold btn-full" style="padding:14px;font-weight:700;font-size:15px;" onclick="subscribeDropshipPlan('enterprise',45)">Subscribe - $45/mo</button>
            </div>
            
            <p style="text-align:center;margin-top:15px;font-size:11px;color:#999;">All plans auto-renew monthly. Cancel anytime.</p>
        </div>`;
}

// =====================
// QUICK STATS
// =====================
async function loadDropshipStatsQuick() {
    try {
        const snap = await db.collection('dropship_products')
            .where('dropshipperId', '==', APP.userProfile.uid)
            .where('status', '==', 'active')
            .get();
        
        const products = [];
        snap.forEach(doc => products.push(doc.data()));
        const totalProfit = products.reduce((sum, p) => sum + ((p.price || 0) - (p.minPrice || 0)), 0);
        
        const countEl = document.getElementById('ds-product-count');
        const profitEl = document.getElementById('ds-total-profit');
        
        if (countEl) countEl.textContent = products.length;
        if (profitEl) profitEl.textContent = formatCurrency(totalProfit);
    } catch (e) {
        console.warn('Stats error:', e);
    }
}

// =====================
// SUBSCRIBE TO PLAN
// =====================
async function subscribeDropshipPlan(plan, price) {
    if (!APP.userProfile) {
        showToast('Please login first', 'error');
        return;
    }
    
    if ((APP.userProfile.walletBalance || 0) < price) {
        showToast(`Insufficient balance. Need $${price}. Please deposit.`, 'error');
        navigateTo('wallet');
        return;
    }
    
    showLoader();
    
    try {
        const userId = APP.userProfile.uid;
        const thirtyDays = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        
        await db.collection('users').doc(userId).update({
            walletBalance: firebase.firestore.FieldValue.increment(-price),
            dropshipPlan: plan,
            isDropshipper: true,
            dropshipPlanExpiry: firebase.firestore.Timestamp.fromDate(thirtyDays),
            dropshipVerified: plan === 'enterprise' ? true : APP.userProfile.dropshipVerified || false,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        APP.userProfile.walletBalance -= price;
        APP.userProfile.dropshipPlan = plan;
        APP.userProfile.isDropshipper = true;
        APP.userProfile.dropshipPlanExpiry = thirtyDays;
        if (plan === 'enterprise') {
            APP.userProfile.dropshipVerified = true;
        }
        
        await db.collection('transactions').add({
            userId: userId,
            type: 'subscription',
            amount: price,
            currency: 'USD',
            status: 'completed',
            description: `Dropship ${plan} plan - 30 days`,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        if (typeof createNotification === 'function') {
            await createNotification(userId, 'Dropship Activated! 📦',
                `Your ${DROPSHIP_PLANS[plan].name} plan is active! Start building your store.`,
                '📦', 'dropship');
        }
        
        hideLoader();
        showToast(`Subscribed to ${DROPSHIP_PLANS[plan].name}! 🎉`, 'success');
        loadDropshipDashboard();
        
    } catch (error) {
        hideLoader();
        console.error('Subscribe error:', error);
        showToast('Payment failed. Please try again.', 'error');
    }
}

// =====================
// UPGRADE PLAN
// =====================
function upgradeDropshipPlan() {
    const current = APP.userProfile?.dropshipPlan || 'starter';
    const plans = Object.entries(DROPSHIP_PLANS).filter(([key]) => key !== current);
    
    showModal(`
        <div style="padding:10px;">
            <h3>⬆️ Upgrade Your Plan</h3>
            <p style="color:#666;margin:10px 0;">Current: <strong>${DROPSHIP_PLANS[current]?.name?.toUpperCase() || current.toUpperCase()}</strong></p>
            ${plans.map(([key, plan]) => `
                <div style="background:white;border-radius:12px;padding:15px;margin:10px 0;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid ${plan.color};">
                    <h4>${plan.icon} ${plan.name}</h4>
                    <div style="font-size:24px;font-weight:800;color:${plan.color};margin:5px 0;">$${plan.price}<span style="font-size:14px;color:#999;">/mo</span></div>
                    <button class="btn-gold btn-full" style="margin-top:8px;" onclick="subscribeDropshipPlan('${key}',${plan.price});hideModal();">
                        Upgrade to ${plan.name}
                    </button>
                </div>
            `).join('')}
            <button class="btn-outline btn-full" style="margin-top:8px;" onclick="hideModal()">Cancel</button>
        </div>
    `);
}

// =====================
// STORE SETTINGS
// =====================
function dropshipStoreSettings() {
    const storeName = APP.userProfile?.storeName || '';
    const storeBio = APP.userProfile?.storeBio || '';
    const storeColor = APP.userProfile?.storeColor || '#667eea';
    
    showModal(`
        <div style="padding:10px;max-height:70vh;overflow-y:auto;">
            <h3>⚙️ Store Settings</h3>
            
            <div class="input-group" style="margin-top:15px;">
                <label>Store Name</label>
                <input type="text" id="settings-store-name" class="input-field" value="${storeName}" placeholder="My Store">
            </div>
            
            <div class="input-group" style="margin-top:10px;">
                <label>Store Bio</label>
                <textarea id="settings-store-bio" class="input-field" rows="2" placeholder="Welcome to my store!">${storeBio}</textarea>
            </div>
            
            <div class="input-group" style="margin-top:10px;">
                <label>Theme Color</label>
                <input type="color" id="settings-store-color" class="input-field" value="${storeColor}" style="height:50px;padding:5px;">
                <small style="color:#666;">Light colors will use dark text automatically</small>
            </div>
            
            <div class="input-group" style="margin-top:10px;">
                <label>Store Logo (Upload Image)</label>
                ${APP.userProfile.storeLogo ? `<img src="${APP.userProfile.storeLogo}" style="width:60px;height:60px;border-radius:50%;margin:5px 0;display:block;object-fit:cover;">` : ''}
                <input type="file" id="settings-logo-upload" class="input-field" accept="image/*">
            </div>
            
            <div class="input-group" style="margin-top:10px;">
                <label>Store Banner (Upload Image)</label>
                ${APP.userProfile.storeBanner ? `<img src="${APP.userProfile.storeBanner}" style="width:100%;height:60px;object-fit:cover;border-radius:8px;margin:5px 0;display:block;">` : ''}
                <input type="file" id="settings-banner-upload" class="input-field" accept="image/*">
            </div>
            
            <div style="background:#f5f5f5;padding:12px;border-radius:8px;margin-top:15px;">
                <p style="font-weight:600;font-size:13px;">Your Store URL:</p>
                <p style="font-family:monospace;font-size:12px;word-break:break-all;">https://${APP.userProfile.username}.oneshoplify.com</p>
                <p style="font-size:11px;color:#999;">Also: ${APP.baseUrl}/store/${APP.userProfile.username}</p>
            </div>
            
            <button class="btn-gold btn-full" style="margin-top:15px;" onclick="saveStoreSettingsQuick()">💾 Save Settings</button>
        </div>
    `);
}

async function saveStoreSettingsQuick() {
    const name = document.getElementById('settings-store-name')?.value?.trim();
    const bio = document.getElementById('settings-store-bio')?.value?.trim();
    const color = document.getElementById('settings-store-color')?.value;
    
    if (!name) { showToast('Please enter a store name', 'error'); return; }
    
    hideModal();
    showLoader();
    
    try {
        const updates = { storeName: name, storeBio: bio, storeColor: color };
        
        const logoFile = document.getElementById('settings-logo-upload')?.files?.[0];
        if (logoFile) {
            try { updates.storeLogo = await uploadToCloudinary(logoFile); } catch (e) {}
        }
        
        const bannerFile = document.getElementById('settings-banner-upload')?.files?.[0];
        if (bannerFile) {
            try { updates.storeBanner = await uploadToCloudinary(bannerFile); } catch (e) {}
        }
        
        await db.collection('users').doc(APP.userProfile.uid).update(updates);
        Object.assign(APP.userProfile, updates);
        
        hideLoader();
        showToast('Store settings saved! ✅', 'success');
        loadDropshipDashboard();
        
    } catch (e) {
        hideLoader();
        showToast('Failed to save settings', 'error');
    }
}

// =====================
// IMPORT FROM MARKETPLACE
// =====================
function importProductFromMarketplace() {
    showLoader();
    
    db.collection('products').where('status', '==', 'active').get()
        .then(snapshot => {
            const products = [];
            snapshot.forEach(doc => {
                products.push({ id: doc.id, ...doc.data() });
            });
            
            hideLoader();
            
            showModal(`
                <div style="padding:10px;max-height:80vh;overflow-y:auto;">
                    <h3>➕ Import from Marketplace</h3>
                    <p style="color:#666;font-size:12px;margin-bottom:10px;">Select products to import to your store</p>
                    <div class="products-grid-full">
                        ${products.slice(0, 40).map(p => {
                            const img = (p.images && p.images[0]) || '/app-icon.png';
                            return `
                                <div class="product-card">
                                    <img src="${img}" class="product-card-image" onerror="this.src='/app-icon.png'" style="height:140px;">
                                    <div class="product-card-info">
                                        <div class="product-card-name">${p.name}</div>
                                        <div class="product-card-price">${formatCurrency(p.price)}</div>
                                        <div style="font-size:10px;color:#999;">📦 ${p.totalSales||0} sales</div>
                                        <button class="btn-gold btn-small" style="width:100%;margin-top:6px;font-size:11px;padding:8px;" 
                                                onclick="installProductWithAnimation('${p.id}')">📦 Import</button>
                                    </div>
                                </div>`;
                        }).join('')}
                    </div>
                </div>
            `);
        })
        .catch(e => { hideLoader(); showToast('Error loading marketplace', 'error'); });
}

// =====================
// INSTALL PRODUCT WITH DYNAMIC CIRCLE ANIMATION
// =====================
function installProductWithAnimation(productId) {
    hideModal();
    
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:9999;';
    overlay.innerHTML = `
        <div style="position:relative;width:140px;height:140px;">
            <svg width="140" height="140">
                <circle cx="70" cy="70" r="60" fill="none" stroke="#333" stroke-width="6"/>
                <circle id="import-circle" cx="70" cy="70" r="60" fill="none" 
                        stroke="#FFD700" stroke-width="6" stroke-linecap="round"
                        stroke-dasharray="377" stroke-dashoffset="377"
                        transform="rotate(-90 70 70)"
                        style="transition: stroke-dashoffset 0.08s linear;"/>
            </svg>
            <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;">
                <div id="import-percent" style="font-size:28px;font-weight:800;color:#FFD700;">0%</div>
            </div>
        </div>
        <p style="color:white;margin-top:18px;font-weight:600;font-size:15px;">Importing Product...</p>
    `;
    document.body.appendChild(overlay);
    
    let percent = 0;
    const circle = overlay.querySelector('#import-circle');
    const percentText = overlay.querySelector('#import-percent');
    const circumference = 377;
    
    const interval = setInterval(async () => {
        percent += 1;
        percentText.textContent = percent + '%';
        circle.style.strokeDashoffset = circumference - (percent / 100) * circumference;
        
        if (percent >= 100) {
            clearInterval(interval);
            await completeImport(productId, overlay);
        }
    }, 80);
}

async function completeImport(productId, overlay) {
    try {
        const doc = await db.collection('products').doc(productId).get();
        if (!doc.exists) { document.body.removeChild(overlay); showToast('Product not found', 'error'); return; }
        
        const p = doc.data();
        const sellingPrice = (p.price * 1.25).toFixed(2);
        
        await db.collection('dropship_products').add({
            dropshipperId: APP.userProfile.uid,
            originalProductId: productId,
            name: p.name,
            price: parseFloat(sellingPrice),
            minPrice: p.price,
            images: p.images || [],
            colors: p.colors || [],
            sizes: p.sizes || [],
            description: p.description || '',
            videoUrl: p.videoUrl || '',
            stock: p.stock || 0,
            totalSales: p.totalSales || 0,
            avgRating: p.avgRating || 0,
            reviewCount: p.reviewCount || 0,
            status: 'active',
            storeLink: `${APP.baseUrl}/store/${APP.userProfile.username}/${productId}`,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        overlay.innerHTML = `
            <div style="text-align:center;color:white;max-width:320px;">
                <div style="font-size:60px;">✅</div>
                <h3 style="color:#FFD700;margin:10px 0;">Product Imported!</h3>
                <p style="font-size:15px;">${p.name}</p>
                <p style="font-size:13px;color:#ccc;">Selling Price: ${formatCurrency(sellingPrice)}</p>
                <p style="font-size:12px;color:#4CAF50;">Your Profit: ${formatCurrency(sellingPrice - p.price)}</p>
                <button onclick="customizeImportedProduct('${productId}')" 
                        style="width:100%;padding:14px;background:#FFD700;color:#1a1a1a;border:none;border-radius:10px;font-weight:700;font-size:15px;margin-top:15px;cursor:pointer;">
                    ⚙️ Customize Price & Discount
                </button>
                <button onclick="document.body.removeChild(this.parentElement.parentElement);loadDropshipDashboard();" 
                        style="width:100%;padding:12px;background:transparent;color:white;border:2px solid white;border-radius:10px;margin-top:8px;cursor:pointer;font-weight:600;">
                    Go to Dashboard
                </button>
            </div>`;
        
    } catch (e) {
        document.body.removeChild(overlay);
        console.error('Import error:', e);
        showToast('Failed to import product', 'error');
    }
}

function customizeImportedProduct(productId) {
    showModal(`
        <div style="padding:10px;">
            <h3>⚙️ Customize Product</h3>
            <p style="color:#666;font-size:13px;margin-bottom:15px;">Set your selling price and optional discount code</p>
            <div class="input-group"><label>Your Selling Price (USD)</label><input type="number" id="custom-price" class="input-field" step="0.01" min="0.01" placeholder="Enter price"></div>
            <div class="input-group" style="margin-top:10px;"><label>Discount Code (optional)</label><input type="text" id="custom-code" class="input-field" placeholder="SAVE20"></div>
            <div class="input-group" style="margin-top:10px;"><label>Discount Value</label><div style="display:flex;gap:8px;"><input type="number" id="custom-value" class="input-field" placeholder="20" min="1" style="flex:2;"><select id="custom-type" class="input-field" style="flex:1;"><option value="percentage">%</option><option value="fixed">$</option></select></div></div>
            <p style="font-size:11px;color:#f44;margin-top:8px;">⚠️ Discount is at your loss - the app does not pay any discount</p>
            <button class="btn-gold btn-full" style="margin-top:15px;" onclick="saveCustomization('${productId}')">💾 Publish to Store</button>
        </div>
    `);
}

async function saveCustomization(productId) {
    const price = parseFloat(document.getElementById('custom-price')?.value) || 0;
    const code = document.getElementById('custom-code')?.value?.trim()?.toUpperCase();
    const value = parseFloat(document.getElementById('custom-value')?.value) || 0;
    const type = document.getElementById('custom-type')?.value;
    if (!price) { showToast('Enter selling price', 'error'); return; }
    hideModal(); showLoader();
    try {
        const snap = await db.collection('dropship_products')
            .where('originalProductId','==',productId).where('dropshipperId','==',APP.userProfile.uid).limit(1).get();
        if (!snap.empty) {
            const updates = { price };
            if (code && value) updates.discountCode = { code, value, type, active: true };
            await snap.docs[0].ref.update(updates);
        }
        hideLoader(); showToast('Published! ✅','success'); loadDropshipDashboard();
    } catch(e) { hideLoader(); showToast('Failed','error'); }
}

// =====================
// PREVIEW STORE
// =====================
async function previewStore() {
    const storeName = APP.userProfile?.storeName || 'My Store';
    const storeColor = APP.userProfile?.storeColor || '#667eea';
    const isLight = isColorLight(storeColor);
    const textColor = isLight ? '#1a1a1a' : '#ffffff';
    showLoader();
    try {
        const snap = await db.collection('dropship_products').where('dropshipperId','==',APP.userProfile.uid).where('status','==','active').get();
        const products = []; snap.forEach(doc => products.push({id:doc.id,...doc.data()}));
        hideLoader();
        showModal(`
            <div style="padding:10px;max-height:85vh;overflow-y:auto;">
                <div style="background:#1a1a2e;color:white;padding:8px;text-align:center;border-radius:16px 16px 0 0;font-size:12px;">📱 Customer Preview</div>
                <div style="border:2px solid #1a1a2e;border-top:none;border-radius:0 0 16px 16px;overflow:hidden;">
                    <div style="background:linear-gradient(135deg,${storeColor},#764ba2);padding:20px;text-align:center;color:${textColor};"><h2>${storeName}</h2><p>${products.length} Products</p></div>
                    <div style="display:flex;gap:8px;padding:10px;background:white;border-bottom:1px solid #f0f0f0;"><button class="btn-gold" style="flex:1;font-size:12px;padding:10px;">🛒 Cart</button><button class="btn-outline" style="flex:1;font-size:12px;padding:10px;">📦 Orders</button></div>
                    <div style="padding:10px;background:#f5f5f5;min-height:200px;">
                        ${products.length===0?'<p style="text-align:center;padding:40px;color:#999;">No products yet</p>':`
                            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                                ${products.map(p=>`<div style="background:white;border-radius:10px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);"><img src="${p.images?.[0]||'/app-icon.png'}" style="width:100%;height:120px;object-fit:cover;"><div style="padding:8px;"><div style="font-weight:600;font-size:12px;">${p.name}</div><div style="font-weight:700;color:#B8860B;">${formatCurrency(p.price)}</div></div></div>`).join('')}
                            </div>`}
                    </div>
                </div>
                <button class="btn-gold btn-full" style="margin-top:10px;" onclick="hideModal()">Close</button>
            </div>`);
    } catch(e) { hideLoader(); }
}

// =====================
// WINNING PRODUCTS
// =====================
async function loadWinningProducts() {
    if (!APP.userProfile.winningProductsAccess) {
        if (APP.userProfile.winningProductsExpiry) {
            const expiry = APP.userProfile.winningProductsExpiry.toDate();
            if (expiry < new Date()) {
                showModal(`<div style="padding:15px;text-align:center;"><h3>🏆 Winning Products</h3><p style="color:#666;margin:15px 0;">Access expired. Renew for $1/month.</p>${(APP.userProfile.walletBalance||0)>=1?`<button class="btn-gold btn-full" onclick="subscribeWinningProducts()">💳 Pay $1 - Renew</button>`:`<button class="btn-gold btn-full" onclick="hideModal();navigateTo('wallet');">💰 Deposit First</button>`}<button class="btn-outline btn-full" style="margin-top:8px;" onclick="hideModal()">Cancel</button></div>`);
                return;
            }
        } else {
            showModal(`<div style="padding:15px;text-align:center;"><h3>🏆 Winning Products</h3><p style="color:#666;margin:15px 0;">Access trending products with 30-300 sales. Only $1/month.</p>${(APP.userProfile.walletBalance||0)>=1?`<button class="btn-gold btn-full" onclick="subscribeWinningProducts()">💳 Pay $1 - Get Access</button>`:`<button class="btn-gold btn-full" onclick="hideModal();navigateTo('wallet');">💰 Deposit First</button>`}<button class="btn-outline btn-full" style="margin-top:8px;" onclick="hideModal()">Cancel</button></div>`);
            return;
        }
    }
    
    showLoader();
    try {
        const snap = await db.collection('products').where('status','==','active').get();
        const products = [];
        snap.forEach(doc => { const p = doc.data(); if (p.totalSales >= 30 && p.totalSales <= 300) products.push({ id: doc.id, ...p }); });
        products.sort((a,b) => (b.totalSales||0) - (a.totalSales||0));
        hideLoader();
        showModal(`
            <div style="padding:10px;max-height:80vh;overflow-y:auto;">
                <h3>🏆 Winning Products</h3><p style="color:#666;font-size:12px;">30-300 sales</p>
                ${products.length===0?'<p style="text-align:center;padding:30px;">No products found</p>':products.slice(0,25).map(p=>{
                    const img=(p.images&&p.images[0])||'/app-icon.png';
                    return`<div style="background:white;border-radius:12px;padding:12px;margin-bottom:10px;box-shadow:0 2px 6px rgba(0,0,0,0.05);display:flex;gap:12px;align-items:center;"><img src="${img}" style="width:55px;height:55px;border-radius:8px;object-fit:cover;" onerror="this.src='/app-icon.png'"><div style="flex:1;"><div style="font-weight:600;font-size:13px;">${p.name}</div><div style="font-size:12px;color:#666;">${formatCurrency(p.price)} | 📦 ${p.totalSales||0} sales</div><div style="font-size:11px;color:var(--green);">⭐ ${p.avgRating?.toFixed(1)||'0.0'}</div></div><button class="btn-gold btn-small" onclick="installProductWithAnimation('${p.id}')" style="padding:8px 14px;">📦 Import</button></div>`}).join('')}
            </div>`);
    } catch(e) { hideLoader(); showToast('Error','error'); }
}

async function subscribeWinningProducts() {
    if ((APP.userProfile.walletBalance||0) < 1) { showToast('Need $1','error'); return; }
    hideModal(); showLoader();
    try {
        const d = new Date(Date.now()+30*24*60*60*1000);
        await db.collection('users').doc(APP.userProfile.uid).update({walletBalance:firebase.firestore.FieldValue.increment(-1),winningProductsAccess:true,winningProductsExpiry:firebase.firestore.Timestamp.fromDate(d)});
        APP.userProfile.walletBalance -= 1; APP.userProfile.winningProductsAccess = true; APP.userProfile.winningProductsExpiry = d;
        await db.collection('transactions').add({userId:APP.userProfile.uid,type:'subscription',amount:1,currency:'USD',status:'completed',description:'Winning Products access',createdAt:firebase.firestore.FieldValue.serverTimestamp()});
        hideLoader(); showToast('Access granted! 🏆','success'); loadWinningProducts();
    } catch(e) { hideLoader(); showToast('Failed','error'); }
}

// =====================
// INFLUENCER CONTRACT
// =====================
async function requestInfluencerContract(influencerId, influencerName) {
    if (!APP.userProfile?.isDropshipper) { showToast('Only dropshippers','error'); return; }
    const snap = await db.collection('dropship_products').where('dropshipperId','==',APP.userProfile.uid).where('status','==','active').get();
    const products = []; snap.forEach(doc => products.push({id:doc.id,...doc.data()}));
    if (products.length===0) { showToast('Import products first','error'); return; }
    showModal(`
        <div style="padding:10px;max-height:75vh;overflow-y:auto;"><h3>📋 Contract with ${influencerName}</h3>
        <div class="input-group"><label>Product</label><select id="contract-product" class="input-field">${products.map(p=>`<option value="${p.id}">${p.name} - ${formatCurrency(p.price)}</option>`).join('')}</select></div>
        <div class="input-group"><label>Commission (%)</label><input type="number" id="contract-commission" class="input-field" value="10" min="1" max="50"></div>
        <div class="input-group"><label>Quantity</label><input type="number" id="contract-quantity" class="input-field" value="50" min="1"></div>
        <div class="input-group"><label>Duration (Days - min 20)</label><input type="number" id="contract-duration" class="input-field" value="30" min="20"></div>
        <button class="btn-gold btn-full" onclick="signAndSendContract('${influencerId}','${influencerName.replace(/'/g,"\\'")}')">✍️ Sign & Send</button></div>`);
}

async function signAndSendContract(influencerId, influencerName) {
    const productId = document.getElementById('contract-product')?.value;
    const commission = parseInt(document.getElementById('contract-commission')?.value)||10;
    const quantity = parseInt(document.getElementById('contract-quantity')?.value)||50;
    const duration = parseInt(document.getElementById('contract-duration')?.value)||30;
    if (!productId) { showToast('Select product','error'); return; }
    if (duration<20) { showToast('Min 20 days','error'); return; }
    hideModal(); showLoader();
    try {
        const productDoc = await db.collection('dropship_products').doc(productId).get();
        const product = productDoc.data();
        await db.collection('influencer_contracts').add({dropshipperId:APP.userProfile.uid,dropshipperName:APP.userProfile.displayName||APP.userProfile.username,influencerId,influencerName,productId,productName:product?.name||'Product',productPrice:product?.price||0,commission,quantity,duration,status:'pending',sales:0,remaining:quantity,totalEarnings:0,createdAt:firebase.firestore.FieldValue.serverTimestamp(),expiresAt:new Date(Date.now()+duration*24*60*60*1000)});
        if (typeof createNotification==='function') await createNotification(influencerId,'📋 New Contract!',`${APP.userProfile.displayName||APP.userProfile.username} sent you a contract for "${product?.name||'a product'}" at ${commission}% commission.`,'📋','notifications');
        hideLoader(); showToast('Contract sent! ✅','success');
    } catch(e) { hideLoader(); showToast('Failed','error'); }
}

// =====================
// PUBLIC STORE WITH CUSTOMER DASHBOARD
// =====================
async function loadPublicDropshipStore(username) {
    console.log('🏪 Loading store:', username);
    
    const container = document.getElementById('dropship-store-content');
    if (!container) return;
    
    container.innerHTML = '<div style="text-align:center;padding:60px;"><div class="loader-spinner" style="margin:0 auto 15px;"></div><p>Loading store...</p></div>';
    
    try {
        const userSnap = await db.collection('users').where('username','==',username).limit(1).get();
        if (userSnap.empty) { container.innerHTML = '<p style="text-align:center;padding:60px;">Store not found</p>'; return; }
        
        const dropshipper = userSnap.docs[0].data();
        const dropshipperId = userSnap.docs[0].id;
        const plan = dropshipper.dropshipPlan || 'starter';
        const planDetails = DROPSHIP_PLANS[plan] || DROPSHIP_PLANS.starter;
        const requiresAuth = planDetails.requiresAuth;
        
        const storeName = dropshipper.storeName || username + '\'s Store';
        const storeColor = dropshipper.storeColor || '#667eea';
        const storeBio = dropshipper.storeBio || 'Welcome!';
        const isVerified = dropshipper.dropshipVerified || planDetails.verification === true;
        const isLight = isColorLight(storeColor);
        const textColor = isLight ? '#1a1a1a' : '#ffffff';
        const subColor = isLight ? '#333' : 'rgba(255,255,255,0.8)';
        
        const snap = await db.collection('dropship_products')
            .where('dropshipperId','==',dropshipperId)
            .where('status','==','active')
            .get();
        
        const products = [];
        snap.forEach(doc => products.push({id:doc.id,...doc.data()}));
        
        const cart = JSON.parse(sessionStorage.getItem('shoplify_cart')||'[]');
        const cartCount = cart.reduce((sum,item)=>sum+(item.quantity||1),0);
        
        // Intro Animation for Professional/Enterprise plans
        if (planDetails.introAnimation && !sessionStorage.getItem('store_intro_' + username)) {
            sessionStorage.setItem('store_intro_' + username, 'true');
            showStoreIntroAnimation(storeName, storeColor, () => {
                renderStoreUI(container, dropshipper, products, storeName, storeColor, storeBio, isVerified, requiresAuth, cartCount, textColor, subColor, username, dropshipperId);
            });
        } else {
            renderStoreUI(container, dropshipper, products, storeName, storeColor, storeBio, isVerified, requiresAuth, cartCount, textColor, subColor, username, dropshipperId);
        }
        
    } catch(e) {
        console.error('Store error:', e);
        container.innerHTML = '<p style="text-align:center;padding:60px;">Error loading store</p>';
    }
}

function showStoreIntroAnimation(storeName, storeColor, callback) {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:white;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:9999;animation:fadeIn 0.3s;';
    overlay.innerHTML = `
        <div style="text-align:center;">
            <div style="width:80px;height:80px;background:linear-gradient(135deg,${storeColor},#764ba2);border-radius:20px;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;font-size:40px;animation:scaleIn 0.5s;">🛍️</div>
            <h2 style="color:#333;font-size:24px;animation:slideUp 0.5s;">${storeName}</h2>
            <p style="color:#999;animation:fadeIn 1s;">Welcome to our store!</p>
        </div>
    `;
    document.body.appendChild(overlay);
    
    setTimeout(() => {
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.5s';
        setTimeout(() => {
            if (document.body.contains(overlay)) document.body.removeChild(overlay);
            if (callback) callback();
        }, 500);
    }, 3000);
}

function renderStoreUI(container, dropshipper, products, storeName, storeColor, storeBio, isVerified, requiresAuth, cartCount, textColor, subColor, username, dropshipperId) {
    container.innerHTML = `
        <div style="background:#f5f5f5;min-height:100vh;">
            
            <!-- Top Navigation -->
            <div style="position:sticky;top:0;z-index:100;background:white;padding:10px 15px;display:flex;align-items:center;gap:12px;border-bottom:1px solid #f0f0f0;box-shadow:0 1px 3px rgba(0,0,0,0.04);">
                <button onclick="window.history.back()" style="background:none;border:none;font-size:20px;cursor:pointer;">←</button>
                <div style="flex:1;font-weight:700;font-size:16px;">${storeName}</div>
                <button onclick="navigateTo('checkout')" style="background:none;border:none;font-size:20px;cursor:pointer;position:relative;">
                    🛒
                    ${cartCount > 0 ? `<span style="position:absolute;top:-3px;right:-3px;background:#FF4444;color:white;font-size:10px;min-width:18px;height:18px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;">${cartCount}</span>` : ''}
                </button>
                <button onclick="openCustomerDashboard('${username}')" style="background:none;border:none;font-size:20px;cursor:pointer;" title="My Account">👤</button>
            </div>
            
            <!-- Store Banner -->
            ${dropshipper.storeBanner ? `<img src="${dropshipper.storeBanner}" style="width:100%;height:140px;object-fit:cover;" onerror="this.style.display='none'">` : ''}
            
            <!-- Store Header -->
            <div style="background:linear-gradient(135deg,${storeColor},#764ba2);padding:22px 20px;text-align:center;color:${textColor};">
                ${dropshipper.storeLogo ? `<img src="${dropshipper.storeLogo}" style="width:55px;height:55px;border-radius:50%;border:2px solid ${textColor};margin-bottom:8px;" onerror="this.style.display='none'">` : ''}
                <h2 style="margin:0;font-size:20px;color:${textColor};">${storeName}</h2>
                ${isVerified ? '<span style="background:#20D5EC;color:white;padding:3px 10px;border-radius:10px;font-size:10px;margin-top:6px;display:inline-block;font-weight:600;">✓ Verified Store</span>' : ''}
                <p style="font-size:13px;margin:6px 0 0;color:${subColor};">${storeBio}</p>
                <p style="font-size:11px;margin:4px 0 0;color:${subColor};">${products.length} Products</p>
            </div>
            
            ${requiresAuth && !APP.userProfile ? `
                <!-- Authentication Required -->
                <div style="padding:20px;text-align:center;background:#FFF8E1;margin:15px;border-radius:12px;border:1px solid #FFE082;">
                    <p style="font-weight:600;margin-bottom:10px;">🔐 Sign in to Browse</p>
                    <p style="font-size:13px;color:#666;margin-bottom:15px;">This store requires authentication to view products.</p>
                    <button class="btn-google" onclick="signInWithGoogle()" style="width:100%;padding:12px;">
                        <span class="google-icon"></span> Continue with Google
                    </button>
                </div>
            ` : `
                <!-- Products Grid -->
                <div style="padding:12px;">
                    ${products.length === 0 ? '<p style="text-align:center;padding:40px;color:#999;">No products available yet</p>' : `
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                            ${products.map(p => {
                                const img = p.images?.[0] || '/app-icon.png';
                                const discount = p.discountCode ? `<span style="background:#FF4444;color:white;padding:2px 6px;border-radius:8px;font-size:9px;">-${p.discountCode.value}${p.discountCode.type==='percentage'?'%':'$'}</span>` : '';
                                const hasVariants = (p.colors?.length > 0) || (p.sizes?.length > 0);
                                
                                return `
                                    <div style="background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 6px rgba(0,0,0,0.04);cursor:pointer;" 
                                         onclick="viewPremiumStoreProduct('${p.id}','${p.name.replace(/'/g,"\\'")}','${p.price}','${p.minPrice}','${img}','${p.originalProductId}','${dropshipperId}')">
                                        <div style="position:relative;">
                                            <img src="${img}" style="width:100%;height:150px;object-fit:cover;" onerror="this.src='/app-icon.png'" loading="lazy">
                                            ${discount ? `<span style="position:absolute;top:6px;left:6px;">${discount}</span>` : ''}
                                            ${hasVariants ? '<span style="position:absolute;top:6px;right:6px;background:rgba(0,0,0,0.5);color:white;padding:2px 6px;border-radius:8px;font-size:9px;">🎨 Options</span>' : ''}
                                        </div>
                                        <div style="padding:10px;">
                                            <div style="font-weight:600;font-size:12px;margin-bottom:3px;">${p.name}</div>
                                            <div style="font-weight:700;font-size:15px;color:#B8860B;">${formatCurrency(p.price)}</div>
                                            ${p.stock > 0 ? `<div style="font-size:10px;color:#4CAF50;">${p.stock} in stock</div>` : ''}
                                        </div>
                                    </div>`;
                            }).join('')}
                        </div>
                    `}
                </div>
            `}
            
            <!-- Footer -->
            <div style="text-align:center;padding:20px;">
                <p style="font-size:10px;color:#999;">Powered by ONESHOPLIFY</p>
                <p style="font-size:9px;color:#ccc;">${username}.oneshoplify.com</p>
            </div>
        </div>`;
}

// =====================
// CUSTOMER DASHBOARD (Inside Store)
// =====================
function openCustomerDashboard(storeUsername) {
    if (!APP.userProfile) {
        showToast('Please sign in to access your account', 'info');
        signInWithGoogle();
        return;
    }
    
    showModal(`
        <div style="max-height:85vh;overflow-y:auto;padding:0;">
            <!-- Header -->
            <div style="background:linear-gradient(135deg,#667eea,#764ba2);padding:20px;text-align:center;color:white;">
                <img src="${APP.userProfile.photoURL || '/app-icon.png'}" style="width:50px;height:50px;border-radius:50%;border:2px solid white;margin-bottom:8px;" onerror="this.src='/app-icon.png'">
                <h3 style="margin:0;">${APP.userProfile.displayName || APP.userProfile.username}</h3>
                <p style="opacity:0.8;font-size:13px;">Customer Account</p>
            </div>
            
            <div style="padding:15px;">
                
                <!-- Wallet Card -->
                <div style="background:linear-gradient(135deg,#FFD700,#FFA000);padding:18px;border-radius:12px;margin-bottom:15px;text-align:center;color:#1a1a1a;">
                    <p style="font-size:11px;opacity:0.8;margin:0;">Wallet Balance</p>
                    <p style="font-size:30px;font-weight:800;margin:5px 0;">${formatCurrency(APP.userProfile.walletBalance || 0)}</p>
                    <div style="display:flex;gap:8px;margin-top:10px;">
                        <button class="btn-outline" style="flex:1;padding:10px;border-color:rgba(0,0,0,0.3);color:#1a1a1a;font-weight:600;font-size:12px;" onclick="hideModal();navigateTo('wallet');">💰 Deposit</button>
                        <button class="btn-outline" style="flex:1;padding:10px;border-color:rgba(0,0,0,0.3);color:#1a1a1a;font-weight:600;font-size:12px;" onclick="hideModal();navigateTo('wallet');">💸 Withdraw</button>
                    </div>
                </div>
                
                <!-- Menu Items -->
                <div style="display:flex;flex-direction:column;gap:5px;">
                    <button class="menu-item" onclick="hideModal();navigateTo('orders');">
                        <span style="font-size:20px;">📦</span> My Orders
                        <span style="margin-left:auto;color:#ccc;">›</span>
                    </button>
                    <button class="menu-item" onclick="hideModal();navigateTo('transactions');">
                        <span style="font-size:20px;">💳</span> Purchase History
                        <span style="margin-left:auto;color:#ccc;">›</span>
                    </button>
                    <button class="menu-item" onclick="hideModal();navigateTo('notifications');">
                        <span style="font-size:20px;">🔔</span> Notifications
                        <span style="margin-left:auto;color:#ccc;">›</span>
                    </button>
                    <button class="menu-item" onclick="hideModal();navigateTo('customerservice');">
                        <span style="font-size:20px;">🎧</span> Customer Service
                        <span style="margin-left:auto;color:#ccc;">›</span>
                    </button>
                    <button class="menu-item" onclick="hideModal();navigateTo('settings');">
                        <span style="font-size:20px;">⚙️</span> Settings
                        <span style="margin-left:auto;color:#ccc;">›</span>
                    </button>
                </div>
                
                <!-- Store Info -->
                <div style="background:#f5f5f5;padding:12px;border-radius:8px;margin-top:15px;text-align:center;">
                    <p style="font-size:11px;color:#999;">You are shopping at</p>
                    <p style="font-weight:600;font-size:13px;">${storeUsername}.oneshoplify.com</p>
                </div>
            </div>
        </div>
    `);
}

// =====================
// PREMIUM PRODUCT DETAIL (Size/Color/Quantity Selection)
// =====================
async function viewPremiumStoreProduct(dropshipProductId, name, price, minPrice, image, originalProductId, dropshipperId) {
    showLoader();
    
    try {
        const dropshipDoc = await db.collection('dropship_products').doc(dropshipProductId).get();
        const dp = dropshipDoc.exists ? dropshipDoc.data() : {};
        
        const productDoc = await db.collection('products').doc(originalProductId).get();
        const product = productDoc.exists ? productDoc.data() : {};
        
        const reviewsSnap = await db.collection('reviews').where('productId','==',originalProductId).get();
        const reviews = [];
        reviewsSnap.forEach(d => reviews.push(d.data()));
        reviews.sort((a,b) => (b.createdAt?.toDate?.()||0) - (a.createdAt?.toDate?.()||0));
        
        hideLoader();
        
        window._storeProductSelection = {
            dropshipProductId, name, price: parseFloat(price), minPrice: parseFloat(minPrice),
            image, originalProductId, dropshipperId,
            selectedColor: null, selectedSize: null, quantity: 1
        };
        
        showModal(`
            <div style="max-height:85vh;overflow-y:auto;padding:0;">
                <div style="position:relative;">
                    <img src="${image}" style="width:100%;height:300px;object-fit:cover;" onerror="this.src='/app-icon.png'">
                    <button onclick="hideModal()" style="position:absolute;top:10px;left:10px;width:30px;height:30px;background:rgba(0,0,0,0.5);color:white;border:none;border-radius:50%;font-size:16px;cursor:pointer;">✕</button>
                </div>
                
                <div style="padding:20px;">
                    <h2 style="font-size:20px;margin-bottom:5px;">${name}</h2>
                    <div style="font-size:26px;font-weight:800;color:#1a1a1a;margin-bottom:5px;">${formatCurrency(price)}</div>
                    
                    ${dp.discountCode ? `
                        <div style="background:#FFF8E1;padding:10px;border-radius:8px;margin:10px 0;text-align:center;">
                            <span style="font-weight:600;">🎫 Use code: ${dp.discountCode.code}</span>
                            <span style="color:#f44;"> (-${dp.discountCode.value}${dp.discountCode.type==='percentage'?'%':'$'})</span>
                        </div>
                    ` : ''}
                    
                    <div style="margin:10px 0;font-size:13px;color:#666;">
                        <span>📦 ${dp.totalSales||product.totalSales||0} sold</span>
                        <span style="margin-left:15px;">⭐ ${dp.avgRating?.toFixed(1)||product.avgRating?.toFixed(1)||'0.0'} (${dp.reviewCount||product.reviewCount||0})</span>
                        ${dp.stock > 0 ? `<span style="margin-left:15px;">📋 ${dp.stock} in stock</span>` : ''}
                    </div>
                    
                    <!-- Color Selection -->
                    ${(dp.colors?.length > 0 || product.colors?.length > 0) ? `
                        <div style="margin:15px 0;">
                            <h4>🎨 Color: <span id="store-selected-color" style="color:#666;">Select</span></h4>
                            <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:8px;">
                                ${(dp.colors || product.colors || []).map(color => `
                                    <div onclick="selectStoreColor('${color}')" id="store-color-${color}"
                                         style="width:40px;height:40px;border-radius:50%;background:${color.toLowerCase()};border:3px solid #ddd;cursor:pointer;transition:0.2s;" title="${color}"></div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    <!-- Size Selection -->
                    ${(dp.sizes?.length > 0 || product.sizes?.length > 0) ? `
                        <div style="margin:15px 0;">
                            <h4>📏 Size: <span id="store-selected-size" style="color:#666;">Select</span></h4>
                            <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px;">
                                ${(dp.sizes || product.sizes || []).map(size => `
                                    <button onclick="selectStoreSize('${size}')" id="store-size-${size}"
                                            style="padding:10px 16px;border:2px solid #e0e0e0;border-radius:8px;background:white;cursor:pointer;font-weight:600;transition:0.2s;">${size}</button>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    <!-- Quantity -->
                    <div style="margin:15px 0;">
                        <h4>🔢 Quantity</h4>
                        <div style="display:flex;align-items:center;gap:15px;margin-top:8px;">
                            <button onclick="changeStoreQuantity(-1)" style="width:36px;height:36px;border:2px solid #e0e0e0;border-radius:50%;background:white;font-size:20px;cursor:pointer;">−</button>
                            <span id="store-quantity" style="font-size:20px;font-weight:700;min-width:30px;text-align:center;">1</span>
                            <button onclick="changeStoreQuantity(1)" style="width:36px;height:36px;border:2px solid #e0e0e0;border-radius:50%;background:white;font-size:20px;cursor:pointer;">+</button>
                        </div>
                    </div>
                    
                    <!-- Description -->
                    ${(dp.description || product.description) ? `
                        <div style="margin:15px 0;">
                            <h4>📝 Description</h4>
                            <p style="color:#666;line-height:1.6;font-size:14px;">${dp.description || product.description}</p>
                        </div>
                    ` : ''}
                    
                    <!-- Add to Cart -->
                    <button onclick="addStoreProductWithVariants();hideModal();" 
                            style="width:100%;padding:16px;background:linear-gradient(135deg,#FFD700,#FFA000);color:#1a1a1a;border:none;border-radius:12px;font-size:16px;font-weight:700;cursor:pointer;margin-top:15px;">
                        🛒 Add to Cart - ${formatCurrency(price)}
                    </button>
                    
                    <!-- Reviews -->
                    ${reviews.length > 0 ? `
                        <div style="margin-top:20px;">
                            <h4>📝 Reviews (${reviews.length})</h4>
                            ${reviews.slice(0,8).map(r => `
                                <div style="padding:10px;background:#fafafa;border-radius:8px;margin-bottom:6px;">
                                    <div style="display:flex;justify-content:space-between;">
                                        <strong style="font-size:13px;">${r.userName||'Customer'}</strong>
                                        <span style="color:#FFD700;">${'★'.repeat(r.rating||5)}</span>
                                    </div>
                                    <p style="font-size:12px;color:#666;margin-top:4px;">${r.comment||''}</p>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `);
        
    } catch(e) {
        hideLoader();
        showToast('Error loading product details', 'error');
    }
}

function selectStoreColor(color) {
    if (!window._storeProductSelection) return;
    window._storeProductSelection.selectedColor = color;
    document.querySelectorAll('[id^="store-color-"]').forEach(el => el.style.border = '3px solid #ddd');
    const el = document.getElementById('store-color-' + color);
    if (el) el.style.border = '3px solid #FFD700';
    const label = document.getElementById('store-selected-color');
    if (label) label.textContent = color;
}

function selectStoreSize(size) {
    if (!window._storeProductSelection) return;
    window._storeProductSelection.selectedSize = size;
    document.querySelectorAll('[id^="store-size-"]').forEach(el => { el.style.border = '2px solid #e0e0e0'; el.style.background = 'white'; });
    const el = document.getElementById('store-size-' + size);
    if (el) { el.style.border = '2px solid #FFD700'; el.style.background = '#FFFDE7'; }
    const label = document.getElementById('store-selected-size');
    if (label) label.textContent = size;
}

function changeStoreQuantity(delta) {
    if (!window._storeProductSelection) return;
    window._storeProductSelection.quantity = Math.max(1, Math.min(window._storeProductSelection.quantity + delta, 99));
    const display = document.getElementById('store-quantity');
    if (display) display.textContent = window._storeProductSelection.quantity;
}

function addStoreProductWithVariants() {
    const sel = window._storeProductSelection;
    if (!sel) return;
    
    let cart = JSON.parse(sessionStorage.getItem('shoplify_cart') || '[]');
    
    cart.push({
        productId: sel.originalProductId,
        dropshipProductId: sel.dropshipProductId,
        dropshipperId: sel.dropshipperId,
        name: sel.name,
        price: sel.price,
        minPrice: sel.minPrice,
        image: sel.image,
        color: sel.selectedColor,
        size: sel.selectedSize,
        quantity: sel.quantity,
        merchantId: sel.dropshipperId,
        isDropship: true,
        isDigital: false,
        discountCode: null,
        freeShipping: false
    });
    
    sessionStorage.setItem('shoplify_cart', JSON.stringify(cart));
    if (typeof updateCartBadge === 'function') updateCartBadge();
    showToast('Added to cart! 🛒', 'success');
}

// =====================
// HELPER
// =====================
function isColorLight(hex) {
    if (!hex) return false;
    const c = hex.replace('#', '');
    const r = parseInt(c.substring(0,2), 16);
    const g = parseInt(c.substring(2,4), 16);
    const b = parseInt(c.substring(4,6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 150;
}

// =====================
// GLOBAL ACCESS
// =====================
window.loadDropshipDashboard = loadDropshipDashboard;
window.DROPSHIP_PLANS = DROPSHIP_PLANS;
window.subscribeDropshipPlan = subscribeDropshipPlan;
window.upgradeDropshipPlan = upgradeDropshipPlan;
window.dropshipStoreSettings = dropshipStoreSettings;
window.importProductFromMarketplace = importProductFromMarketplace;
window.installProductWithAnimation = installProductWithAnimation;
window.customizeImportedProduct = customizeImportedProduct;
window.previewStore = previewStore;
window.loadWinningProducts = loadWinningProducts;
window.subscribeWinningProducts = subscribeWinningProducts;
window.requestInfluencerContract = requestInfluencerContract;
window.loadPublicDropshipStore = loadPublicDropshipStore;
window.openCustomerDashboard = openCustomerDashboard;
window.viewPremiumStoreProduct = viewPremiumStoreProduct;
window.selectStoreColor = selectStoreColor;
window.selectStoreSize = selectStoreSize;
window.changeStoreQuantity = changeStoreQuantity;
window.addStoreProductWithVariants = addStoreProductWithVariants;

console.log('✅ All dropship functions globally accessible');
console.log('   Plans: Starter ($5) | Professional ($10) | Enterprise ($45)');
console.log('   Features: Dashboard | Plans | Import | Store | Customer Dashboard | Influencers | Winning Products');
