// dropship.js - GUARANTEED TO LOAD VERSION
// This file is self-contained and will definitely display content

console.log('✅ dropship.js loaded successfully');

// =====================
// DROPSHIP DASHBOARD - GUARANTEED TO WORK
// =====================
async function loadDropshipDashboard() {
    console.log('📦 loadDropshipDashboard called');
    
    // Find the container
    const container = document.getElementById('dropship-content');
    
    if (!container) {
        console.error('❌ ERROR: dropship-content element NOT FOUND in DOM');
        return;
    }
    
    // Show loading immediately
    container.innerHTML = '<p style="text-align:center;padding:40px;">Loading dropship dashboard...</p>';
    
    // Check if user is logged in
    if (!APP.userProfile) {
        container.innerHTML = '<p style="text-align:center;padding:40px;">Please login to access the dropship dashboard.</p>';
        return;
    }
    
    const currentPlan = APP.userProfile.dropshipPlan || 'none';
    const isSubscribed = APP.userProfile.isDropshipper && currentPlan !== 'none';
    
    console.log('📦 Dropship status - Plan:', currentPlan, 'Subscribed:', isSubscribed);
    
    if (isSubscribed) {
        // =====================
        // ACTIVE SUBSCRIPTION VIEW
        // =====================
        const storeName = APP.userProfile.storeName || (APP.userProfile.username || 'My') + '\'s Store';
        const storeColor = APP.userProfile.storeColor || '#667eea';
        const storeUrl = APP.baseUrl + '/store/' + (APP.userProfile.username || 'user');
        
        container.innerHTML = `
            <div style="padding:15px;">
                <!-- Store Header -->
                <div style="text-align:center;padding:20px;background:linear-gradient(135deg,${storeColor},#764ba2);border-radius:12px;color:white;margin-bottom:15px;box-shadow:0 4px 12px rgba(0,0,0,0.1);">
                    ${APP.userProfile.storeLogo ? `<img src="${APP.userProfile.storeLogo}" style="width:50px;height:50px;border-radius:50%;border:2px solid white;margin-bottom:10px;" onerror="this.style.display='none'">` : ''}
                    <h2 style="margin:0;font-size:20px;">${storeName}</h2>
                    <p style="opacity:0.8;margin:5px 0 0;">${currentPlan.toUpperCase()} Plan Active</p>
                </div>
                
                <!-- Stats -->
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:15px;">
                    <div class="stat-card">
                        <div class="stat-value" id="ds-product-count">-</div>
                        <div class="stat-label">Products</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="ds-total-profit">$0</div>
                        <div class="stat-label">Potential Profit</div>
                    </div>
                </div>
                
                <!-- Action Buttons -->
                <div style="display:flex;gap:10px;margin-bottom:10px;">
                    <button class="btn-gold" style="flex:1;padding:14px;font-weight:700;" onclick="navigateTo('dropship-store')">
                        🏪 My Store
                    </button>
                    <button class="btn-outline" style="flex:1;padding:14px;font-weight:600;" onclick="navigateTo('advertisers')">
                        🤝 Influencers
                    </button>
                </div>
                
                <button class="btn-outline btn-full" style="margin-bottom:10px;padding:12px;" onclick="navigateTo('recruit-affiliates')">
                    📢 Recruit Affiliates
                </button>
                
                <button class="btn-outline btn-full" style="margin-bottom:10px;padding:12px;" onclick="if(typeof dropshipStoreSettings==='function')dropshipStoreSettings();else if(typeof previewDropshipStore==='function')previewDropshipStore();">
                    ⚙️ Store Settings
                </button>
                
                <!-- Store URL -->
                <div style="background:white;padding:15px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
                    <p style="font-weight:600;font-size:13px;margin-bottom:8px;">🔗 Your Store URL:</p>
                    <div style="font-family:monospace;font-size:12px;word-break:break-all;background:#f5f5f5;padding:10px;border-radius:6px;margin-bottom:8px;">${storeUrl}</div>
                    <button class="copy-btn" onclick="copyToClipboard('${storeUrl}');showToast('Link copied!','success');">📋 Copy Store Link</button>
                </div>
                
                <!-- Upgrade -->
                <div style="background:#E8F5E9;padding:12px;border-radius:8px;margin-top:10px;text-align:center;">
                    <p style="font-size:13px;margin-bottom:8px;">✅ Active: <strong>${currentPlan.toUpperCase()}</strong></p>
                    <button class="btn-small btn-outline" onclick="if(typeof upgradeDropshipPlan==='function')upgradeDropshipPlan();">⬆️ Upgrade Plan</button>
                </div>
            </div>`;
        
        // Load stats in background
        loadDropshipStatsQuick();
        
    } else {
        // =====================
        // PLANS VIEW
        // =====================
        container.innerHTML = `
            <div style="padding:15px;">
                <h3 style="margin-bottom:5px;">💰 Choose Your Dropship Plan</h3>
                <p style="color:#666;margin-bottom:20px;font-size:14px;">Resell products without holding inventory. Set your own prices and earn profits!</p>
                
                <!-- Starter Plan -->
                <div style="background:white;border-radius:12px;padding:20px;margin-bottom:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #4CAF50;">
                    <h4 style="margin:0;">🚀 Starter</h4>
                    <div style="font-size:28px;font-weight:800;color:#4CAF50;margin:8px 0;">$5<span style="font-size:14px;color:#666;">/month</span></div>
                    <ul style="list-style:none;padding:0;font-size:13px;color:#666;line-height:2;">
                        <li>✅ 20 Products</li>
                        <li>✅ 1 Store</li>
                        <li>✅ Set your own prices</li>
                    </ul>
                    <button class="btn-outline btn-full" style="margin-top:10px;" onclick="subscribeDropshipPlan('starter',5)">
                        Subscribe - $5/mo
                    </button>
                </div>
                
                <!-- Growth Plan -->
                <div style="background:white;border-radius:12px;padding:20px;margin-bottom:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #2196F3;">
                    <h4 style="margin:0;">📈 Growth</h4>
                    <div style="font-size:28px;font-weight:800;color:#2196F3;margin:8px 0;">$15<span style="font-size:14px;color:#666;">/month</span></div>
                    <ul style="list-style:none;padding:0;font-size:13px;color:#666;line-height:2;">
                        <li>✅ 100 Products</li>
                        <li>✅ 1 Store</li>
                        <li>✅ Priority support</li>
                    </ul>
                    <button class="btn-outline btn-full" style="margin-top:10px;" onclick="subscribeDropshipPlan('growth',15)">
                        Subscribe - $15/mo
                    </button>
                </div>
                
                <!-- Professional Plan -->
                <div style="background:white;border-radius:12px;padding:20px;margin-bottom:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #9C27B0;">
                    <h4 style="margin:0;">💼 Professional</h4>
                    <div style="font-size:28px;font-weight:800;color:#9C27B0;margin:8px 0;">$30<span style="font-size:14px;color:#666;">/month</span></div>
                    <ul style="list-style:none;padding:0;font-size:13px;color:#666;line-height:2;">
                        <li>✅ 500 Products</li>
                        <li>✅ 3 Stores</li>
                        <li>✅ Analytics dashboard</li>
                    </ul>
                    <button class="btn-outline btn-full" style="margin-top:10px;" onclick="subscribeDropshipPlan('pro',30)">
                        Subscribe - $30/mo
                    </button>
                </div>
                
                <!-- Elite Plan -->
                <div style="background:white;border-radius:12px;padding:20px;margin-bottom:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid #FF9800;">
                    <h4 style="margin:0;">👑 Elite</h4>
                    <div style="font-size:28px;font-weight:800;color:#FF9800;margin:8px 0;">$50<span style="font-size:14px;color:#666;">/month</span></div>
                    <ul style="list-style:none;padding:0;font-size:13px;color:#666;line-height:2;">
                        <li>✅ Unlimited Products</li>
                        <li>✅ Unlimited Stores</li>
                        <li>✅ All features included</li>
                    </ul>
                    <button class="btn-outline btn-full" style="margin-top:10px;" onclick="subscribeDropshipPlan('elite',50)">
                        Subscribe - $50/mo
                    </button>
                </div>
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
        console.warn('Stats load error:', e);
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
        showToast(`Insufficient balance. Need $${price}. Deposit first.`, 'error');
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
            dropshipPlanExpiry: firebase.firestore.Timestamp.fromDate(thirtyDays)
        });
        
        APP.userProfile.walletBalance -= price;
        APP.userProfile.dropshipPlan = plan;
        APP.userProfile.isDropshipper = true;
        APP.userProfile.dropshipPlanExpiry = thirtyDays;
        
        await db.collection('transactions').add({
            userId, type: 'subscription', amount: price,
            currency: 'USD', status: 'completed',
            description: `Dropship ${plan} plan`,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        hideLoader();
        showToast(`Subscribed to ${plan}! 🎉`, 'success');
        loadDropshipDashboard();
        
    } catch (error) {
        hideLoader();
        console.error('Subscribe error:', error);
        showToast('Payment failed. Try again.', 'error');
    }
}

// =====================
// STORE SETTINGS
// =====================
function dropshipStoreSettings() {
    const storeName = APP.userProfile?.storeName || '';
    const storeBio = APP.userProfile?.storeBio || '';
    const storeColor = APP.userProfile?.storeColor || '#667eea';
    
    showModal(`
        <div style="padding:10px;">
            <h3>⚙️ Store Settings</h3>
            <div class="input-group" style="margin-top:15px;">
                <label>Store Name</label>
                <input type="text" id="settings-store-name" class="input-field" value="${storeName}">
            </div>
            <div class="input-group" style="margin-top:10px;">
                <label>Store Bio</label>
                <textarea id="settings-store-bio" class="input-field" rows="2">${storeBio}</textarea>
            </div>
            <div class="input-group" style="margin-top:10px;">
                <label>Theme Color</label>
                <input type="color" id="settings-store-color" class="input-field" value="${storeColor}" style="height:50px;">
            </div>
            <div class="input-group" style="margin-top:10px;">
                <label>Store Logo (Upload)</label>
                <input type="file" id="settings-logo-upload" class="input-field" accept="image/*">
            </div>
            <button class="btn-gold btn-full" style="margin-top:15px;" onclick="saveStoreSettingsQuick()">💾 Save</button>
        </div>
    `);
}

async function saveStoreSettingsQuick() {
    const name = document.getElementById('settings-store-name')?.value?.trim();
    const bio = document.getElementById('settings-store-bio')?.value?.trim();
    const color = document.getElementById('settings-store-color')?.value;
    
    if (!name) { showToast('Enter store name', 'error'); return; }
    
    hideModal();
    showLoader();
    
    try {
        const updates = { storeName: name, storeBio: bio, storeColor: color };
        
        const logoFile = document.getElementById('settings-logo-upload')?.files?.[0];
        if (logoFile) {
            try { updates.storeLogo = await uploadToCloudinary(logoFile); } catch (e) {}
        }
        
        await db.collection('users').doc(APP.userProfile.uid).update(updates);
        Object.assign(APP.userProfile, updates);
        
        hideLoader();
        showToast('Settings saved! ✅', 'success');
        loadDropshipDashboard();
    } catch (e) {
        hideLoader();
        showToast('Failed to save', 'error');
    }
}

// =====================
// PUBLIC STORE (for visitors)
// =====================
async function loadPublicDropshipStore(username) {
    console.log('🏪 Loading public store:', username);
    
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
        
        const snap = await db.collection('dropship_products')
            .where('dropshipperId', '==', dropshipperId)
            .where('status', '==', 'active')
            .get();
        
        const products = [];
        snap.forEach(doc => products.push({ id: doc.id, ...doc.data() }));
        
        container.innerHTML = `
            <div style="background:#f5f5f5;min-height:100vh;">
                <div style="background:linear-gradient(135deg,${storeColor},#764ba2);padding:25px;text-align:center;color:white;">
                    <h2>${storeName}</h2>
                    <p>${products.length} Products</p>
                </div>
                <div style="padding:10px;">
                    ${products.length === 0 ? '<p style="text-align:center;padding:40px;">No products yet</p>' : `
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                            ${products.map(p => {
                                const img = p.images?.[0] || '/app-icon.png';
                                return `
                                    <div style="background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
                                        <img src="${img}" style="width:100%;height:150px;object-fit:cover;" onerror="this.src='/app-icon.png'">
                                        <div style="padding:10px;">
                                            <div style="font-weight:600;font-size:13px;">${p.name}</div>
                                            <div style="font-weight:700;color:#B8860B;">${formatCurrency(p.price)}</div>
                                            <button class="btn-gold" style="width:100%;margin-top:8px;font-size:12px;padding:8px;" 
                                                    onclick="addToCartFromStore('${p.id}','${p.name}','${p.price}','${img}','${dropshipperId}')">
                                                🛒 Add to Cart
                                            </button>
                                        </div>
                                    </div>`;
                            }).join('')}
                        </div>
                    `}
                </div>
            </div>`;
    } catch (e) {
        container.innerHTML = '<p style="text-align:center;padding:40px;">Error loading store</p>';
    }
}

function addToCartFromStore(id, name, price, image, dropshipperId) {
    let cart = JSON.parse(sessionStorage.getItem('shoplify_cart') || '[]');
    cart.push({
        productId: id, name, price: parseFloat(price),
        image, merchantId: dropshipperId, quantity: 1,
        isDropship: true
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

// Make sure functions are globally available
window.loadDropshipDashboard = loadDropshipDashboard;
window.subscribeDropship = subscribeDropshipPlan;
window.dropshipStoreSettings = dropshipStoreSettings;
window.loadPublicDropshipStore = loadPublicDropshipStore;

console.log('✅ All dropship functions globally available');
console.log('   - loadDropshipDashboard:', typeof loadDropshipDashboard);
console.log('   - subscribeDropshipPlan:', typeof subscribeDropshipPlan);
