// dropship.js - COMPLETE PREMIUM VERSION (All Features: Dashboard, Plans, Store, Preview, Settings, Winning Products, Influencer Contracts, Dynamic Installation Circle)

console.log('✅ dropship.js loaded successfully');

// =====================
// DROPSHIP DASHBOARD
// =====================
async function loadDropshipDashboard() {
    console.log('📦 Loading dropship dashboard...');
    
    const container = document.getElementById('dropship-content');
    if (!container) { console.error('❌ dropship-content not found'); return; }
    
    container.innerHTML = '<p style="text-align:center;padding:40px;">Loading dashboard...</p>';
    
    if (!APP.userProfile) {
        container.innerHTML = '<p style="text-align:center;padding:40px;">Please login to access the dropship dashboard.</p>';
        return;
    }
    
    const currentPlan = APP.userProfile.dropshipPlan || 'none';
    const isSubscribed = APP.userProfile.isDropshipper && currentPlan !== 'none';
    const isVerified = APP.userProfile.dropshipVerified || false;
    const totalSales = APP.userProfile.dropshipTotalSales || 0;
    
    if (isSubscribed) {
        const storeName = APP.userProfile.storeName || (APP.userProfile.username || 'My') + '\'s Store';
        const storeColor = APP.userProfile.storeColor || '#667eea';
        const storeUrl = APP.baseUrl + '/store/' + (APP.userProfile.username || 'user');
        const isLight = isColorLight(storeColor);
        const textColor = isLight ? '#1a1a1a' : '#ffffff';
        
        container.innerHTML = `
            <div style="padding:15px;">
                <!-- Store Header with Verification Badge -->
                <div style="text-align:center;padding:25px 20px;background:linear-gradient(135deg,${storeColor},#764ba2);border-radius:16px;color:${textColor};margin-bottom:15px;box-shadow:0 4px 16px rgba(0,0,0,0.12);">
                    ${APP.userProfile.storeLogo ? `<img src="${APP.userProfile.storeLogo}" style="width:60px;height:60px;border-radius:50%;border:3px solid ${textColor};margin-bottom:10px;box-shadow:0 2px 8px rgba(0,0,0,0.2);" onerror="this.style.display='none'">` : ''}
                    <h2 style="margin:0;font-size:22px;color:${textColor};">${storeName}</h2>
                    ${isVerified ? '<span style="background:#20D5EC;color:white;padding:4px 14px;border-radius:15px;font-size:12px;margin-top:8px;display:inline-block;font-weight:600;">✓ Verified Store</span>' : ''}
                    <p style="opacity:0.85;margin:6px 0 0;font-size:14px;color:${isLight?'#333':'rgba(255,255,255,0.85)'};">${currentPlan.toUpperCase()} Plan Active</p>
                </div>
                
                <!-- Verification Progress Bar -->
                ${!isVerified ? `
                    <div style="background:#FFF8E1;padding:14px;border-radius:10px;margin-bottom:15px;text-align:center;border:1px solid #FFE082;">
                        <p style="font-size:13px;font-weight:600;margin-bottom:6px;">🔒 Verification Progress</p>
                        <p style="font-size:12px;color:#666;margin-bottom:8px;">${totalSales}/200 successful sales needed for verification</p>
                        <div style="background:#e0e0e0;height:8px;border-radius:4px;overflow:hidden;">
                            <div style="background:linear-gradient(90deg,#FFD700,#FFA000);height:8px;border-radius:4px;width:${Math.min(100,(totalSales/200)*100)}%;transition:width 0.5s;"></div>
                        </div>
                        ${totalSales >= 200 ? '<p style="color:#4CAF50;margin-top:6px;font-weight:600;">✅ Eligible for verification! Contact support.</p>' : ''}
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
                
                <!-- Main Action Buttons -->
                <div style="display:flex;gap:8px;margin-bottom:8px;">
                    <button class="btn-gold" style="flex:1;padding:13px;font-weight:700;font-size:14px;" onclick="navigateTo('dropship-store')">🏪 My Store</button>
                    <button class="btn-outline" style="flex:1;padding:13px;font-weight:600;font-size:14px;" onclick="previewStore()">👁️ Preview</button>
                </div>
                
                <div style="display:flex;gap:8px;margin-bottom:8px;">
                    <button class="btn-outline" style="flex:1;padding:12px;font-size:13px;" onclick="navigateTo('advertisers')">🤝 Influencers</button>
                    <button class="btn-outline" style="flex:1;padding:12px;font-size:13px;" onclick="loadWinningProducts()">🏆 Winning</button>
                </div>
                
                <button class="btn-outline btn-full" style="margin-bottom:8px;padding:12px;font-size:13px;" onclick="dropshipStoreSettings()">⚙️ Store Settings</button>
                <button class="btn-outline btn-full" style="margin-bottom:8px;padding:12px;font-size:13px;" onclick="navigateTo('analytics')">📊 Analytics & Charts</button>
                
                <!-- Store URL Card -->
                <div style="background:white;padding:15px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);margin-bottom:10px;">
                    <p style="font-weight:600;font-size:13px;margin-bottom:6px;">🔗 Your Store URL:</p>
                    <div style="font-family:monospace;font-size:11px;word-break:break-all;background:#f5f5f5;padding:10px;border-radius:6px;margin-bottom:8px;">${storeUrl}</div>
                    <button class="copy-btn" onclick="copyToClipboard('${storeUrl}');showToast('Store link copied!','success');">📋 Copy Store Link</button>
                </div>
                
                <!-- Plan Status -->
                <div style="background:#E8F5E9;padding:14px;border-radius:10px;text-align:center;">
                    <p style="font-size:13px;margin-bottom:6px;">✅ Active Plan: <strong>${currentPlan.toUpperCase()}</strong></p>
                    <button class="btn-small btn-outline" onclick="upgradeDropshipPlan()">⬆️ Upgrade Plan</button>
                </div>
            </div>`;
        
        // Load stats in background
        loadDropshipStatsQuick();
        
    } else {
        // =====================
        // PLANS VIEW - For new users
        // =====================
        const plans = [
            { name: 'Starter', price: APP.dropshipStarter || 5, color: '#4CAF50', products: 20, stores: 1, icon: '🚀' },
            { name: 'Growth', price: APP.dropshipGrowth || 15, color: '#2196F3', products: 100, stores: 1, icon: '📈' },
            { name: 'Professional', price: APP.dropshipPro || 30, color: '#9C27B0', products: 500, stores: 3, icon: '💼' },
            { name: 'Elite', price: APP.dropshipElite || 50, color: '#FF9800', products: 'Unlimited', stores: 'Unlimited', icon: '👑' }
        ];
        
        container.innerHTML = `
            <div style="padding:15px;">
                <h3 style="margin-bottom:5px;">💰 Choose Your Dropship Plan</h3>
                <p style="color:#666;margin-bottom:20px;font-size:14px;">Resell products without holding inventory. Set your own prices and earn profits!</p>
                
                ${plans.map(plan => `
                    <div style="background:white;border-radius:14px;padding:20px;margin-bottom:12px;box-shadow:0 2px 10px rgba(0,0,0,0.06);border-left:4px solid ${plan.color};">
                        <div style="display:flex;justify-content:space-between;align-items:start;">
                            <div>
                                <h4 style="margin:0;font-size:17px;">${plan.icon} ${plan.name}</h4>
                                <div style="font-size:28px;font-weight:800;color:${plan.color};margin:6px 0;">$${plan.price}<span style="font-size:14px;color:#999;">/month</span></div>
                            </div>
                        </div>
                        <ul style="list-style:none;padding:0;font-size:13px;color:#666;line-height:2;margin:10px 0;">
                            <li>✅ ${plan.products} Products</li>
                            <li>✅ ${plan.stores} Store${plan.stores !== 1 ? 's' : ''}</li>
                            <li>✅ Set your own profit margins</li>
                            <li>✅ Auto order forwarding</li>
                        </ul>
                        <button class="btn-outline btn-full" style="padding:12px;font-weight:600;" onclick="subscribeDropshipPlan('${plan.name.toLowerCase()}',${plan.price})">
                            Subscribe - $${plan.price}/mo
                        </button>
                    </div>
                `).join('')}
            </div>`;
    }
    
    console.log('✅ Dropship dashboard rendered');
}

// =====================
// QUICK STATS LOADER
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
    if (!APP.userProfile) { showToast('Please login first', 'error'); return; }
    
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
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        APP.userProfile.walletBalance -= price;
        APP.userProfile.dropshipPlan = plan;
        APP.userProfile.isDropshipper = true;
        APP.userProfile.dropshipPlanExpiry = thirtyDays;
        
        await db.collection('transactions').add({
            userId, type: 'subscription', amount: price,
            currency: 'USD', status: 'completed',
            description: `Dropship ${plan} plan - 30 days`,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        if (typeof createNotification === 'function') {
            await createNotification(userId, 'Dropship Activated! 📦',
                `Your ${plan} plan is active! Start importing products.`, '📦', 'dropship');
        }
        
        hideLoader();
        showToast(`Subscribed to ${plan}! 🎉`, 'success');
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
    const plans = [
        { name: 'Starter', price: APP.dropshipStarter || 5, color: '#4CAF50', icon: '🚀' },
        { name: 'Growth', price: APP.dropshipGrowth || 15, color: '#2196F3', icon: '📈' },
        { name: 'Professional', price: APP.dropshipPro || 30, color: '#9C27B0', icon: '💼' },
        { name: 'Elite', price: APP.dropshipElite || 50, color: '#FF9800', icon: '👑' }
    ];
    
    const current = APP.userProfile?.dropshipPlan || 'starter';
    
    showModal(`
        <div style="padding:10px;">
            <h3>⬆️ Upgrade Your Plan</h3>
            <p style="color:#666;margin:10px 0;">Current: <strong>${current.toUpperCase()}</strong></p>
            ${plans.filter(p => p.name.toLowerCase() !== current).map(plan => `
                <div style="background:white;border-radius:12px;padding:15px;margin:10px 0;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid ${plan.color};">
                    <h4>${plan.icon} ${plan.name}</h4>
                    <div style="font-size:24px;font-weight:800;color:${plan.color};margin:5px 0;">$${plan.price}<span style="font-size:14px;color:#999;">/mo</span></div>
                    <button class="btn-gold btn-full" style="margin-top:8px;" onclick="subscribeDropshipPlan('${plan.name.toLowerCase()}',${plan.price});hideModal();">
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
                <p style="font-weight:600;font-size:13px;">Store URL:</p>
                <p style="font-family:monospace;font-size:12px;word-break:break-all;">${APP.baseUrl}/store/${APP.userProfile.username}</p>
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
// STORE PREVIEW (Customer View)
// =====================
async function previewStore() {
    const storeName = APP.userProfile?.storeName || 'My Store';
    const storeColor = APP.userProfile?.storeColor || '#667eea';
    const isLight = isColorLight(storeColor);
    const textColor = isLight ? '#1a1a1a' : '#ffffff';
    
    showLoader();
    
    try {
        const snap = await db.collection('dropship_products')
            .where('dropshipperId', '==', APP.userProfile.uid)
            .where('status', '==', 'active')
            .get();
        
        const products = [];
        snap.forEach(doc => products.push({ id: doc.id, ...doc.data() }));
        
        hideLoader();
        
        showModal(`
            <div style="padding:10px;max-height:85vh;overflow-y:auto;">
                <!-- Preview Header -->
                <div style="background:#1a1a2e;color:white;padding:8px 15px;border-radius:16px 16px 0 0;text-align:center;font-size:12px;font-weight:600;">
                    📱 Customer Preview - How They See Your Store
                </div>
                
                <div style="border:2px solid #1a1a2e;border-top:none;border-radius:0 0 16px 16px;overflow:hidden;">
                    <!-- Store Banner -->
                    ${APP.userProfile.storeBanner ? `<img src="${APP.userProfile.storeBanner}" style="width:100%;height:120px;object-fit:cover;" onerror="this.style.display='none'">` : ''}
                    
                    <!-- Store Header -->
                    <div style="background:linear-gradient(135deg,${storeColor},#764ba2);padding:20px;text-align:center;color:${textColor};">
                        ${APP.userProfile.storeLogo ? `<img src="${APP.userProfile.storeLogo}" style="width:50px;height:50px;border-radius:50%;border:2px solid ${textColor};margin-bottom:8px;">` : ''}
                        <h2 style="margin:0;font-size:18px;color:${textColor};">${storeName}</h2>
                        <p style="font-size:12px;opacity:0.8;color:${isLight?'#333':'rgba(255,255,255,0.8)'};">${products.length} Products</p>
                    </div>
                    
                    <!-- Cart & Orders Bar -->
                    <div style="display:flex;gap:8px;padding:10px;background:white;border-bottom:1px solid #f0f0f0;">
                        <button class="btn-gold" style="flex:1;font-size:12px;padding:10px;">🛒 Cart (0)</button>
                        <button class="btn-outline" style="flex:1;font-size:12px;padding:10px;">📦 Orders</button>
                    </div>
                    
                    <!-- Products Grid -->
                    <div style="padding:10px;background:#f5f5f5;min-height:200px;">
                        ${products.length === 0 ? `
                            <div style="text-align:center;padding:40px;color:#999;">
                                <p style="font-size:40px;">📦</p><p>No products yet</p>
                            </div>
                        ` : `
                            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                                ${products.map(p => {
                                    const img = p.images?.[0] || '/app-icon.png';
                                    return `
                                        <div style="background:white;border-radius:10px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
                                            <img src="${img}" style="width:100%;height:130px;object-fit:cover;" onerror="this.src='/app-icon.png'">
                                            <div style="padding:8px;">
                                                <div style="font-weight:600;font-size:12px;margin-bottom:3px;">${p.name}</div>
                                                <div style="font-weight:700;font-size:14px;color:#B8860B;">${formatCurrency(p.price)}</div>
                                                <button style="width:100%;padding:7px;background:#FFD700;color:#1a1a1a;border:none;border-radius:6px;font-size:11px;font-weight:700;margin-top:5px;">🛒 Add to Cart</button>
                                            </div>
                                        </div>`;
                                }).join('')}
                            </div>
                        `}
                    </div>
                    
                    <!-- Footer -->
                    <div style="background:white;padding:12px;text-align:center;border-top:1px solid #f0f0f0;">
                        <p style="font-size:10px;color:#999;">Powered by ONESHOPLIFY</p>
                    </div>
                </div>
                
                <button class="btn-gold btn-full" style="margin-top:10px;" onclick="hideModal()">Close Preview</button>
            </div>
        `);
        
    } catch (e) {
        hideLoader();
        showToast('Error loading preview', 'error');
    }
}

// =====================
// WINNING PRODUCTS
// =====================
async function loadWinningProducts() {
    // Check subscription access
    if (!APP.userProfile.winningProductsAccess) {
        if (APP.userProfile.winningProductsExpiry) {
            const expiry = APP.userProfile.winningProductsExpiry.toDate();
            if (expiry < new Date()) {
                // Expired - show renewal prompt
                showModal(`
                    <div style="padding:15px;text-align:center;">
                        <h3>🏆 Winning Products</h3>
                        <p style="color:#666;margin:15px 0;">Your access has expired. Renew for $1/month.</p>
                        <p style="font-size:13px;">Balance: <strong>${formatCurrency(APP.userProfile.walletBalance||0)}</strong></p>
                        ${(APP.userProfile.walletBalance||0) >= 1 ? 
                            `<button class="btn-gold btn-full" onclick="subscribeWinningProducts()">💳 Pay $1 - Renew</button>` :
                            `<button class="btn-gold btn-full" onclick="hideModal();navigateTo('wallet');">💰 Deposit First</button>`
                        }
                        <button class="btn-outline btn-full" style="margin-top:8px;" onclick="hideModal()">Cancel</button>
                    </div>
                `);
                return;
            }
        } else {
            // Never subscribed
            showModal(`
                <div style="padding:15px;text-align:center;">
                    <h3>🏆 Winning Products</h3>
                    <p style="color:#666;margin:15px 0;">Access trending products with 30-200 sales.</p>
                    <p style="font-size:13px;color:#666;">Only $1/month</p>
                    <p style="font-size:13px;">Balance: <strong>${formatCurrency(APP.userProfile.walletBalance||0)}</strong></p>
                    ${(APP.userProfile.walletBalance||0) >= 1 ? 
                        `<button class="btn-gold btn-full" onclick="subscribeWinningProducts()">💳 Pay $1 - Get Access</button>` :
                        `<button class="btn-gold btn-full" onclick="hideModal();navigateTo('wallet');">💰 Deposit First</button>`
                    }
                    <button class="btn-outline btn-full" style="margin-top:8px;" onclick="hideModal()">Cancel</button>
                </div>
            `);
            return;
        }
    }
    
    // Has access - show winning products
    showLoader();
    
    try {
        const snap = await db.collection('products')
            .where('status', '==', 'active')
            .get();
        
        const products = [];
        snap.forEach(doc => {
            const p = doc.data();
            if (p.totalSales >= 30 && p.totalSales <= 300) {
                products.push({ id: doc.id, ...p });
            }
        });
        
        products.sort((a, b) => (b.totalSales || 0) - (a.totalSales || 0));
        
        hideLoader();
        
        showModal(`
            <div style="padding:10px;max-height:80vh;overflow-y:auto;">
                <h3>🏆 Winning Products</h3>
                <p style="color:#666;font-size:12px;margin-bottom:10px;">🔥 Trending: 30-300 sales</p>
                
                ${products.length === 0 ? '<p style="text-align:center;padding:30px;color:#999;">No winning products found</p>' : 
                    products.slice(0, 25).map(p => {
                        const img = (p.images && p.images[0]) || '/app-icon.png';
                        return `
                            <div style="background:white;border-radius:12px;padding:12px;margin-bottom:10px;box-shadow:0 2px 6px rgba(0,0,0,0.05);display:flex;gap:12px;align-items:center;">
                                <img src="${img}" style="width:55px;height:55px;border-radius:8px;object-fit:cover;" onerror="this.src='/app-icon.png'">
                                <div style="flex:1;">
                                    <div style="font-weight:600;font-size:13px;">${p.name}</div>
                                    <div style="font-size:12px;color:#666;">${formatCurrency(p.price)} | 📦 ${p.totalSales||0} sales</div>
                                    <div style="font-size:11px;color:var(--green);">⭐ ${p.avgRating?.toFixed(1)||'0.0'} (${p.reviewCount||0})</div>
                                </div>
                                <button class="btn-gold btn-small" onclick="installWinningProduct('${p.id}')" style="padding:8px 14px;font-size:12px;">📦 Install</button>
                            </div>`;
                    }).join('')
                }
            </div>
        `);
        
    } catch (e) {
        hideLoader();
        showToast('Error loading products', 'error');
    }
}

async function subscribeWinningProducts() {
    if ((APP.userProfile.walletBalance || 0) < 1) {
        showToast('Insufficient balance. Need $1.', 'error');
        return;
    }
    
    hideModal();
    showLoader();
    
    try {
        const thirtyDays = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        await db.collection('users').doc(APP.userProfile.uid).update({
            walletBalance: firebase.firestore.FieldValue.increment(-1),
            winningProductsAccess: true,
            winningProductsExpiry: firebase.firestore.Timestamp.fromDate(thirtyDays)
        });
        
        APP.userProfile.walletBalance -= 1;
        APP.userProfile.winningProductsAccess = true;
        APP.userProfile.winningProductsExpiry = thirtyDays;
        
        await db.collection('transactions').add({
            userId: APP.userProfile.uid,
            type: 'subscription',
            amount: 1,
            currency: 'USD',
            status: 'completed',
            description: 'Winning Products access - 30 days',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        hideLoader();
        showToast('Access granted! 🏆', 'success');
        loadWinningProducts();
        
    } catch (e) {
        hideLoader();
        showToast('Payment failed', 'error');
    }
}

// =====================
// INSTALL WINNING PRODUCT (Dynamic Circle Animation)
// =====================
function installWinningProduct(productId) {
    hideModal();
    
    // Create loading overlay with dynamic circle
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:9999;';
    overlay.innerHTML = `
        <div style="position:relative;width:140px;height:140px;">
            <svg width="140" height="140">
                <circle cx="70" cy="70" r="60" fill="none" stroke="#333" stroke-width="6"/>
                <circle id="install-circle" cx="70" cy="70" r="60" fill="none" 
                        stroke="#FFD700" stroke-width="6" stroke-linecap="round"
                        stroke-dasharray="377" stroke-dashoffset="377"
                        transform="rotate(-90 70 70)"
                        style="transition: stroke-dashoffset 0.08s linear;"/>
            </svg>
            <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;">
                <div id="install-percent" style="font-size:28px;font-weight:800;color:#FFD700;">0%</div>
            </div>
        </div>
        <p style="color:white;margin-top:18px;font-weight:600;font-size:15px;">Installing Product...</p>
    `;
    
    document.body.appendChild(overlay);
    
    let percent = 0;
    const circle = overlay.querySelector('#install-circle');
    const percentText = overlay.querySelector('#install-percent');
    const circumference = 377; // 2 * PI * 60
    
    const interval = setInterval(async () => {
        percent += 1;
        percentText.textContent = percent + '%';
        
        const offset = circumference - (percent / 100) * circumference;
        circle.style.strokeDashoffset = offset;
        
        if (percent >= 100) {
            clearInterval(interval);
            await completeWinningInstall(productId, overlay);
        }
    }, 80); // 80ms * 100 = 8 seconds total
}

async function completeWinningInstall(productId, overlay) {
    try {
        const doc = await db.collection('products').doc(productId).get();
        if (!doc.exists) {
            document.body.removeChild(overlay);
            showToast('Product not found', 'error');
            return;
        }
        
        const p = doc.data();
        const sellingPrice = (p.price * 1.25).toFixed(2); // 25% markup
        
        // Add to dropship products
        await db.collection('dropship_products').add({
            dropshipperId: APP.userProfile.uid,
            originalProductId: productId,
            name: p.name,
            price: parseFloat(sellingPrice),
            minPrice: p.price,
            images: p.images || [],
            status: 'active',
            storeLink: `${APP.baseUrl}/store/${APP.userProfile.username}/${productId}`,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Update overlay with success and customize button
        overlay.innerHTML = `
            <div style="text-align:center;color:white;max-width:320px;">
                <div style="font-size:60px;margin-bottom:10px;">✅</div>
                <h3 style="color:#FFD700;margin:10px 0;">Product Installed!</h3>
                <p style="font-size:15px;margin-bottom:5px;">${p.name}</p>
                <p style="font-size:13px;color:#ccc;">Selling Price: ${formatCurrency(sellingPrice)}</p>
                <p style="font-size:12px;color:#4CAF50;">Profit: ${formatCurrency(sellingPrice - p.price)}</p>
                
                <button onclick="customizeWinningProduct('${productId}')" 
                        style="width:100%;padding:14px;background:#FFD700;color:#1a1a1a;border:none;border-radius:10px;font-weight:700;font-size:15px;margin-top:15px;cursor:pointer;">
                    ⚙️ Customize & Set Discount
                </button>
                
                <button onclick="document.body.removeChild(this.parentElement.parentElement);loadDropshipDashboard();" 
                        style="width:100%;padding:12px;background:transparent;color:white;border:2px solid white;border-radius:10px;margin-top:8px;cursor:pointer;font-weight:600;">
                    Go to Dashboard
                </button>
            </div>
        `;
        
    } catch (e) {
        document.body.removeChild(overlay);
        console.error('Install error:', e);
        showToast('Failed to install product', 'error');
    }
}

// =====================
// CUSTOMIZE WINNING PRODUCT
// =====================
function customizeWinningProduct(productId) {
    showModal(`
        <div style="padding:10px;">
            <h3>⚙️ Customize Product</h3>
            <p style="color:#666;font-size:13px;margin-bottom:15px;">Set your price and optional discount</p>
            
            <div class="input-group">
                <label>Your Selling Price (USD)</label>
                <input type="number" id="custom-price" class="input-field" step="0.01" min="0.01" placeholder="Enter price">
            </div>
            
            <div class="input-group" style="margin-top:10px;">
                <label>Discount Code (optional)</label>
                <input type="text" id="custom-discount-code" class="input-field" placeholder="e.g. SAVE20">
            </div>
            
            <div class="input-group" style="margin-top:10px;">
                <label>Discount Value</label>
                <div style="display:flex;gap:8px;">
                    <input type="number" id="custom-discount-value" class="input-field" placeholder="20" min="1" style="flex:2;">
                    <select id="custom-discount-type" class="input-field" style="flex:1;">
                        <option value="percentage">%</option>
                        <option value="fixed">$</option>
                    </select>
                </div>
            </div>
            
            <p style="font-size:11px;color:#f44;margin-top:8px;">⚠️ Discount is at your loss - the app does not pay any discount amount</p>
            
            <button class="btn-gold btn-full" style="margin-top:15px;" onclick="saveCustomization('${productId}')">💾 Publish to Store</button>
        </div>
    `);
}

async function saveCustomization(productId) {
    const price = parseFloat(document.getElementById('custom-price')?.value) || 0;
    const code = document.getElementById('custom-discount-code')?.value?.trim()?.toUpperCase();
    const value = parseFloat(document.getElementById('custom-discount-value')?.value) || 0;
    const type = document.getElementById('custom-discount-type')?.value;
    
    if (!price) { showToast('Please enter a selling price', 'error'); return; }
    
    hideModal();
    showLoader();
    
    try {
        const snap = await db.collection('dropship_products')
            .where('originalProductId', '==', productId)
            .where('dropshipperId', '==', APP.userProfile.uid)
            .limit(1)
            .get();
        
        if (!snap.empty) {
            const updates = { price };
            if (code && value) {
                updates.discountCode = { code, value, type, active: true };
            }
            await snap.docs[0].ref.update(updates);
        }
        
        hideLoader();
        showToast('Product published to store! ✅', 'success');
        loadDropshipDashboard();
        
    } catch (e) {
        hideLoader();
        showToast('Failed to save', 'error');
    }
}

// =====================
// INFLUENCER CONTRACT SYSTEM
// =====================
async function requestInfluencerContract(influencerId, influencerName) {
    if (!APP.userProfile?.isDropshipper) {
        showToast('Only dropshippers can create contracts', 'error');
        return;
    }
    
    // Get dropshipper's products
    const productsSnap = await db.collection('dropship_products')
        .where('dropshipperId', '==', APP.userProfile.uid)
        .where('status', '==', 'active')
        .get();
    
    const products = [];
    productsSnap.forEach(doc => products.push({ id: doc.id, ...doc.data() }));
    
    if (products.length === 0) {
        showToast('You need products first. Import from marketplace.', 'error');
        return;
    }
    
    showModal(`
        <div style="padding:10px;max-height:75vh;overflow-y:auto;">
            <h3>📋 Influencer Contract</h3>
            <p style="color:#666;font-size:13px;">Create a contract for <strong>${influencerName}</strong></p>
            
            <div class="input-group" style="margin-top:15px;">
                <label>Select Product</label>
                <select id="contract-product" class="input-field">
                    ${products.map(p => `<option value="${p.id}">${p.name} - ${formatCurrency(p.price)}</option>`).join('')}
                </select>
            </div>
            
            <div class="input-group" style="margin-top:12px;">
                <label>Commission per Sale (%)</label>
                <input type="number" id="contract-commission" class="input-field" value="10" min="1" max="50" placeholder="10">
                <small style="color:#666;">Percentage influencer earns per successful sale</small>
            </div>
            
            <div class="input-group" style="margin-top:12px;">
                <label>Quantity Limit</label>
                <input type="number" id="contract-quantity" class="input-field" value="50" min="1" placeholder="50">
                <small style="color:#666;">Maximum units for this contract</small>
            </div>
            
            <div class="input-group" style="margin-top:12px;">
                <label>Duration (Days - Minimum 20)</label>
                <input type="number" id="contract-duration" class="input-field" value="30" min="20" max="90" placeholder="30">
            </div>
            
            <div style="background:#FFF8E1;padding:12px;border-radius:8px;margin-top:15px;font-size:12px;">
                <p style="font-weight:600;">📋 Contract Terms:</p>
                <p style="color:#666;">• Influencer receives commission only on successful deliveries</p>
                <p style="color:#666;">• Contract expires after the set duration</p>
                <p style="color:#666;">• You can cancel anytime before influencer accepts</p>
            </div>
            
            <button class="btn-gold btn-full" style="margin-top:15px;" onclick="signAndSendContract('${influencerId}','${influencerName.replace(/'/g,"\\'")}')">
                ✍️ Sign & Send Contract
            </button>
        </div>
    `);
}

async function signAndSendContract(influencerId, influencerName) {
    const productId = document.getElementById('contract-product')?.value;
    const commission = parseInt(document.getElementById('contract-commission')?.value) || 10;
    const quantity = parseInt(document.getElementById('contract-quantity')?.value) || 50;
    const duration = parseInt(document.getElementById('contract-duration')?.value) || 30;
    
    if (!productId) { showToast('Please select a product', 'error'); return; }
    if (duration < 20) { showToast('Minimum duration is 20 days', 'error'); return; }
    if (commission < 1 || commission > 50) { showToast('Commission must be 1-50%', 'error'); return; }
    
    hideModal();
    showLoader();
    
    try {
        const productDoc = await db.collection('dropship_products').doc(productId).get();
        const product = productDoc.data();
        
        const contractData = {
            dropshipperId: APP.userProfile.uid,
            dropshipperName: APP.userProfile.displayName || APP.userProfile.username,
            influencerId: influencerId,
            influencerName: influencerName,
            productId: productId,
            productName: product?.name || 'Product',
            productPrice: product?.price || 0,
            commission: commission,
            quantity: quantity,
            duration: duration,
            status: 'pending',
            sales: 0,
            remaining: quantity,
            totalEarnings: 0,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            expiresAt: new Date(Date.now() + duration * 24 * 60 * 60 * 1000)
        };
        
        await db.collection('influencer_contracts').add(contractData);
        
        // Notify influencer
        if (typeof createNotification === 'function') {
            await createNotification(influencerId,
                '📋 New Contract Offer!',
                `${APP.userProfile.displayName || APP.userProfile.username} sent you a contract for "${product?.name || 'a product'}" at ${commission}% commission. ${quantity} units, ${duration} days.`,
                '📋',
                'notifications'
            );
        }
        
        hideLoader();
        showToast('Contract sent successfully! ✅', 'success');
        
    } catch (e) {
        hideLoader();
        console.error('Contract error:', e);
        showToast('Failed to send contract', 'error');
    }
}

// =====================
// PUBLIC DROPSHIP STORE (For Visitors)
// =====================
async function loadPublicDropshipStore(username) {
    console.log('🏪 Loading public store for:', username);
    
    const container = document.getElementById('dropship-store-content');
    if (!container) return;
    
    container.innerHTML = '<p style="text-align:center;padding:40px;">Loading store...</p>';
    
    try {
        const userSnap = await db.collection('users').where('username', '==', username).limit(1).get();
        if (userSnap.empty) {
            container.innerHTML = '<p style="text-align:center;padding:40px;">Store not found</p>';
            return;
        }
        
        const dropshipper = userSnap.docs[0].data();
        const dropshipperId = userSnap.docs[0].id;
        
        const storeName = dropshipper.storeName || username + '\'s Store';
        const storeColor = dropshipper.storeColor || '#667eea';
        const storeBio = dropshipper.storeBio || 'Welcome to my store!';
        const storeLogo = dropshipper.storeLogo || '';
        const storeBanner = dropshipper.storeBanner || '';
        const isVerified = dropshipper.dropshipVerified || dropshipper.isAppVerified || false;
        
        const isLight = isColorLight(storeColor);
        const textColor = isLight ? '#1a1a1a' : '#ffffff';
        const subColor = isLight ? '#333' : 'rgba(255,255,255,0.8)';
        
        const snap = await db.collection('dropship_products')
            .where('dropshipperId', '==', dropshipperId)
            .where('status', '==', 'active')
            .get();
        
        const products = [];
        snap.forEach(doc => products.push({ id: doc.id, ...doc.data() }));
        
        const cart = JSON.parse(sessionStorage.getItem('shoplify_cart') || '[]');
        const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        
        container.innerHTML = `
            <div style="background:#f5f5f5;min-height:100vh;">
                <!-- Top Navigation Bar -->
                <div style="position:sticky;top:0;z-index:100;background:white;padding:10px 15px;display:flex;align-items:center;gap:12px;border-bottom:1px solid #f0f0f0;box-shadow:0 1px 3px rgba(0,0,0,0.04);">
                    <button onclick="window.history.back()" style="background:none;border:none;font-size:20px;cursor:pointer;padding:5px;">←</button>
                    <div style="flex:1;font-weight:700;font-size:16px;">${storeName}</div>
                    <button onclick="navigateTo('checkout')" style="background:none;border:none;font-size:20px;cursor:pointer;position:relative;padding:5px;">
                        🛒
                        ${cartCount > 0 ? `<span style="position:absolute;top:-3px;right:-3px;background:#FF4444;color:white;font-size:10px;min-width:18px;height:18px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;">${cartCount}</span>` : ''}
                    </button>
                    ${APP.userProfile ? `<button onclick="navigateTo('orders')" style="background:none;border:none;font-size:20px;cursor:pointer;padding:5px;">📦</button>` : ''}
                </div>
                
                <!-- Store Banner -->
                ${storeBanner ? `<img src="${storeBanner}" style="width:100%;height:140px;object-fit:cover;" onerror="this.style.display='none'">` : ''}
                
                <!-- Store Header -->
                <div style="background:linear-gradient(135deg,${storeColor},#764ba2);padding:22px 20px;text-align:center;color:${textColor};">
                    ${storeLogo ? `<img src="${storeLogo}" style="width:55px;height:55px;border-radius:50%;border:2px solid ${textColor};margin-bottom:8px;" onerror="this.style.display='none'">` : ''}
                    <h2 style="margin:0;font-size:20px;color:${textColor};">${storeName}</h2>
                    ${isVerified ? '<span style="background:#20D5EC;color:white;padding:3px 10px;border-radius:10px;font-size:10px;margin-top:6px;display:inline-block;font-weight:600;">✓ Verified Store</span>' : ''}
                    <p style="font-size:13px;margin:6px 0 0;color:${subColor};">${storeBio}</p>
                    <p style="font-size:11px;margin:4px 0 0;color:${subColor};">${products.length} Products</p>
                </div>
                
                <!-- Products Grid -->
                <div style="padding:12px;">
                    ${products.length === 0 ? `
                        <div style="text-align:center;padding:40px;background:white;border-radius:14px;">
                            <p style="font-size:45px;">📦</p>
                            <p style="color:#999;">No products available yet</p>
                        </div>
                    ` : `
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                            ${products.map(p => {
                                const img = p.images?.[0] || '/app-icon.png';
                                const discount = p.discountCode ? 
                                    `<span style="background:#FF4444;color:white;padding:2px 6px;border-radius:10px;font-size:9px;font-weight:600;">-${p.discountCode.value}${p.discountCode.type==='percentage'?'%':'$'}</span>` : '';
                                
                                return `
                                    <div style="background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 6px rgba(0,0,0,0.04);cursor:pointer;" 
                                         onclick="viewStoreProductDetail('${p.id}','${p.name.replace(/'/g,"\\'")}','${p.price}','${p.minPrice}','${img}','${p.originalProductId}','${dropshipperId}')">
                                        <div style="position:relative;">
                                            <img src="${img}" style="width:100%;height:150px;object-fit:cover;" onerror="this.src='/app-icon.png'" loading="lazy">
                                            ${discount ? `<span style="position:absolute;top:6px;left:6px;">${discount}</span>` : ''}
                                            <button onclick="event.stopPropagation();addStoreProductToCart('${p.id}','${p.name.replace(/'/g,"\\'")}','${p.price}','${p.minPrice}','${img}','${p.originalProductId}','${dropshipperId}')" 
                                                    style="position:absolute;bottom:6px;right:6px;width:32px;height:32px;background:#FFD700;border:none;border-radius:50%;font-size:16px;cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,0.2);display:flex;align-items:center;justify-content:center;">
                                                🛒
                                            </button>
                                        </div>
                                        <div style="padding:10px;">
                                            <div style="font-weight:600;font-size:12px;margin-bottom:3px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${p.name}</div>
                                            <div style="font-weight:700;font-size:15px;color:#B8860B;">${formatCurrency(p.price)}</div>
                                        </div>
                                    </div>`;
                            }).join('')}
                        </div>
                    `}
                </div>
                
                <!-- Footer -->
                <div style="text-align:center;padding:20px;">
                    <p style="font-size:10px;color:#999;">Powered by ONESHOPLIFY</p>
                </div>
            </div>`;
        
    } catch (e) {
        console.error('Public store error:', e);
        container.innerHTML = '<p style="text-align:center;padding:40px;">Error loading store</p>';
    }
}

// =====================
// VIEW PRODUCT DETAIL (Store Modal)
// =====================
async function viewStoreProductDetail(dropshipProductId, name, price, minPrice, image, originalProductId, dropshipperId) {
    showLoader();
    try {
        const productDoc = await db.collection('products').doc(originalProductId).get();
        const product = productDoc.exists ? productDoc.data() : null;
        
        const reviewsSnap = await db.collection('reviews').where('productId', '==', originalProductId).get();
        const reviews = [];
        reviewsSnap.forEach(d => reviews.push(d.data()));
        reviews.sort((a, b) => (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0));
        
        hideLoader();
        
        showModal(`
            <div style="max-height:85vh;overflow-y:auto;padding:0;">
                <div style="position:relative;">
                    <img src="${image}" style="width:100%;height:300px;object-fit:cover;" onerror="this.src='/app-icon.png'">
                    <button onclick="hideModal()" style="position:absolute;top:10px;left:10px;width:30px;height:30px;background:rgba(0,0,0,0.5);color:white;border:none;border-radius:50%;font-size:16px;cursor:pointer;">✕</button>
                </div>
                <div style="padding:20px;">
                    <h2 style="font-size:20px;">${name}</h2>
                    <div style="font-size:24px;font-weight:800;">${formatCurrency(price)}</div>
                    
                    ${product ? `
                        <div style="margin:10px 0;font-size:13px;color:#666;">
                            <span>📦 ${product.totalSales||0} sold</span>
                            <span style="margin-left:15px;">⭐ ${product.avgRating?.toFixed(1)||'0.0'} (${product.reviewCount||0})</span>
                        </div>
                        ${product.colors?.length ? `<p style="margin:8px 0;"><strong>Colors:</strong> ${product.colors.join(', ')}</p>` : ''}
                        ${product.sizes?.length ? `<p style="margin:8px 0;"><strong>Sizes:</strong> ${product.sizes.join(', ')}</p>` : ''}
                        <p style="color:#666;line-height:1.6;margin:10px 0;">${product.description||'No description'}</p>
                    ` : ''}
                    
                    <button class="btn-gold btn-full" style="margin-top:15px;padding:14px;" 
                            onclick="addStoreProductToCart('${dropshipProductId}','${name.replace(/'/g,"\\'")}','${price}','${minPrice}','${image}','${originalProductId}','${dropshipperId}');hideModal();">
                        🛒 Add to Cart - ${formatCurrency(price)}
                    </button>
                    
                    ${reviews.length > 0 ? `
                        <h4 style="margin-top:20px;">📝 Reviews (${reviews.length})</h4>
                        ${reviews.slice(0,8).map(r => `
                            <div style="padding:10px;background:#fafafa;border-radius:8px;margin-bottom:6px;">
                                <div style="display:flex;justify-content:space-between;">
                                    <strong style="font-size:13px;">${r.userName||'Customer'}</strong>
                                    <span style="color:#FFD700;">${'★'.repeat(r.rating||5)}</span>
                                </div>
                                <p style="font-size:12px;color:#666;margin-top:4px;">${r.comment||''}</p>
                            </div>
                        `).join('')}
                    ` : ''}
                </div>
            </div>
        `);
    } catch (e) { hideLoader(); showToast('Error','error'); }
}

// =====================
// ADD TO CART FROM STORE
// =====================
function addStoreProductToCart(productId, name, price, minPrice, image, originalProductId, dropshipperId) {
    let cart = JSON.parse(sessionStorage.getItem('shoplify_cart') || '[]');
    
    const existingIndex = cart.findIndex(item => item.dropshipProductId === productId);
    
    if (existingIndex >= 0) {
        cart[existingIndex].quantity += 1;
    } else {
        cart.push({
            productId: originalProductId,
            dropshipProductId: productId,
            dropshipperId: dropshipperId,
            name, price: parseFloat(price), minPrice: parseFloat(minPrice),
            image, color: null, size: null, quantity: 1,
            merchantId: dropshipperId,
            isDropship: true, isDigital: false,
            discountCode: null, freeShipping: false
        });
    }
    
    sessionStorage.setItem('shoplify_cart', JSON.stringify(cart));
    if (typeof updateCartBadge === 'function') updateCartBadge();
    showToast('Added to cart! 🛒', 'success');
}

// =====================
// HELPER FUNCTIONS
// =====================
function isColorLight(hex) {
    if (!hex) return false;
    const c = hex.replace('#', '');
    const r = parseInt(c.substring(0,2), 16);
    const g = parseInt(c.substring(2,4), 16);
    const b = parseInt(c.substring(4,6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 150;
}

// Make all functions globally accessible
window.loadDropshipDashboard = loadDropshipDashboard;
window.subscribeDropship = subscribeDropshipPlan;
window.loadWinningProducts = loadWinningProducts;
window.installWinningProduct = installWinningProduct;
window.customizeWinningProduct = customizeWinningProduct;
window.previewStore = previewStore;
window.dropshipStoreSettings = dropshipStoreSettings;
window.requestInfluencerContract = requestInfluencerContract;
window.loadPublicDropshipStore = loadPublicDropshipStore;
window.viewStoreProductDetail = viewStoreProductDetail;
window.addStoreProductToCart = addStoreProductToCart;
window.upgradeDropshipPlan = upgradeDropshipPlan;

console.log('✅ All dropship functions globally accessible');
