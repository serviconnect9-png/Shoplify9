// dropship.js - COMPLETE FINAL VERSION (All Features, Fully Visible, Premium Store, Import, Winning Products, Influencer Contracts)
console.log('✅ dropship.js loaded successfully');
console.log('   Version: 6.0 Premium');

// =====================
// DROPSHIP DASHBOARD
// =====================
async function loadDropshipDashboard() {
    console.log('📦 Loading dropship dashboard...');
    
    const container = document.getElementById('dropship-content');
    if (!container) {
        console.error('❌ dropship-content container not found in DOM');
        return;
    }
    
    // Show loading immediately
    container.innerHTML = `
        <div style="text-align:center;padding:60px 20px;">
            <div class="loader-spinner" style="margin:0 auto 15px;"></div>
            <p style="color:#666;">Loading dropship dashboard...</p>
        </div>`;
    
    if (!APP.userProfile) {
        container.innerHTML = '<p style="text-align:center;padding:60px;">Please login to access the dropship dashboard.</p>';
        return;
    }
    
    const currentPlan = APP.userProfile.dropshipPlan || 'none';
    const isSubscribed = APP.userProfile.isDropshipper && currentPlan !== 'none';
    const isVerified = APP.userProfile.dropshipVerified || false;
    const totalSales = APP.userProfile.dropshipTotalSales || 0;
    const username = APP.userProfile.username || 'user';
    
    // Build store URL
    const hostname = window.location.hostname;
    let storeUrl = '';
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        storeUrl = `${APP.baseUrl}/store/${username}`;
    } else {
        const domainParts = hostname.split('.');
        if (domainParts.length >= 3) {
            storeUrl = `https://${username}.${domainParts.slice(1).join('.')}`;
        } else {
            storeUrl = `${APP.baseUrl}/store/${username}`;
        }
    }
    
    if (isSubscribed) {
        // =====================
        // ACTIVE SUBSCRIPTION DASHBOARD
        // =====================
        const storeName = APP.userProfile.storeName || username + '\'s Store';
        const storeColor = APP.userProfile.storeColor || '#667eea';
        const isLight = isColorLight(storeColor);
        const textColor = isLight ? '#1a1a1a' : '#ffffff';
        
        container.innerHTML = `
            <div style="padding:15px;padding-bottom:30px;">
                
                <!-- Store Header Card -->
                <div style="text-align:center;padding:25px 20px;background:linear-gradient(135deg,${storeColor},#764ba2);border-radius:16px;color:${textColor};margin-bottom:15px;box-shadow:0 4px 16px rgba(0,0,0,0.15);">
                    ${APP.userProfile.storeLogo ? `<img src="${APP.userProfile.storeLogo}" style="width:60px;height:60px;border-radius:50%;border:3px solid ${textColor};margin-bottom:10px;box-shadow:0 2px 8px rgba(0,0,0,0.2);" onerror="this.style.display='none'">` : ''}
                    <h2 style="margin:0;font-size:22px;color:${textColor};">${storeName}</h2>
                    ${isVerified ? '<span style="background:#20D5EC;color:white;padding:4px 14px;border-radius:15px;font-size:12px;margin-top:8px;display:inline-block;font-weight:600;">✓ Verified Store</span>' : ''}
                    <p style="opacity:0.85;margin:6px 0 0;font-size:14px;color:${isLight?'#333':'rgba(255,255,255,0.85)'};">${currentPlan.toUpperCase()} Plan</p>
                </div>
                
                <!-- Verification Progress -->
                ${!isVerified ? `
                    <div style="background:#FFF8E1;padding:14px;border-radius:10px;margin-bottom:15px;text-align:center;border:1px solid #FFE082;">
                        <p style="font-size:13px;font-weight:600;margin-bottom:6px;">🔒 Verification Progress</p>
                        <p style="font-size:12px;color:#666;margin-bottom:8px;">${totalSales}/200 successful sales needed</p>
                        <div style="background:#e0e0e0;height:8px;border-radius:4px;overflow:hidden;">
                            <div style="background:linear-gradient(90deg,#FFD700,#FFA000);height:8px;border-radius:4px;width:${Math.min(100,(totalSales/200)*100)}%;"></div>
                        </div>
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
                
                <button class="btn-outline btn-full" style="margin-bottom:8px;padding:12px;font-size:13px;" onclick="importProductFromMarketplace()">➕ Import from Marketplace</button>
                
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
                    <p style="font-size:11px;color:#999;">Also: ${APP.baseUrl}/store/${username}</p>
                    <button class="copy-btn" onclick="copyToClipboard('${storeUrl}');showToast('Store link copied!','success');">📋 Copy Link</button>
                </div>
                
                <!-- Plan Status -->
                <div style="background:#E8F5E9;padding:14px;border-radius:10px;text-align:center;">
                    <p style="font-size:13px;margin-bottom:6px;">✅ Active: <strong>${currentPlan.toUpperCase()}</strong></p>
                    <button class="btn-small btn-outline" onclick="upgradeDropshipPlan()">⬆️ Upgrade Plan</button>
                </div>
                
            </div>`;
        
        // Load stats
        loadDropshipStatsQuick();
        
    } else {
        // =====================
        // PLANS VIEW
        // =====================
        const plans = [
            { name: 'Starter', price: APP.dropshipStarter || 5, color: '#4CAF50', icon: '🚀', products: 20, stores: 1 },
            { name: 'Growth', price: APP.dropshipGrowth || 15, color: '#2196F3', icon: '📈', products: 100, stores: 1 },
            { name: 'Professional', price: APP.dropshipPro || 30, color: '#9C27B0', icon: '💼', products: 500, stores: 3 },
            { name: 'Elite', price: APP.dropshipElite || 50, color: '#FF9800', icon: '👑', products: 'Unlimited', stores: 'Unlimited' }
        ];
        
        container.innerHTML = `
            <div style="padding:15px;padding-bottom:30px;">
                <h3 style="margin-bottom:5px;">💰 Choose Your Dropship Plan</h3>
                <p style="color:#666;margin-bottom:20px;font-size:14px;">Resell products without inventory. Import from marketplace, set your prices, and earn profits!</p>
                
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
                            <li>✅ Import from marketplace</li>
                            <li>✅ Set your profit margins</li>
                            <li>✅ Auto order forwarding to merchant</li>
                            <li>✅ Hire influencers</li>
                        </ul>
                        <button class="btn-outline btn-full" style="padding:12px;font-weight:600;" onclick="subscribeDropshipPlan('${plan.name.toLowerCase()}',${plan.price})">
                            Subscribe - $${plan.price}/mo
                        </button>
                    </div>
                `).join('')}
                
                <p style="text-align:center;margin-top:10px;font-size:11px;color:#999;">
                    All plans include 30-day billing cycle. Cancel anytime.
                </p>
            </div>`;
    }
    
    console.log('✅ Dropship dashboard rendered successfully');
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
                `Your ${plan} plan is active! Start importing products from the marketplace.`, '📦', 'dropship');
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
                <label>Store Logo (Upload)</label>
                ${APP.userProfile.storeLogo ? `<img src="${APP.userProfile.storeLogo}" style="width:60px;height:60px;border-radius:50%;margin:5px 0;display:block;object-fit:cover;">` : ''}
                <input type="file" id="settings-logo-upload" class="input-field" accept="image/*">
            </div>
            
            <div class="input-group" style="margin-top:10px;">
                <label>Store Banner (Upload)</label>
                ${APP.userProfile.storeBanner ? `<img src="${APP.userProfile.storeBanner}" style="width:100%;height:60px;object-fit:cover;border-radius:8px;margin:5px 0;display:block;">` : ''}
                <input type="file" id="settings-banner-upload" class="input-field" accept="image/*">
            </div>
            
            <div style="background:#f5f5f5;padding:12px;border-radius:8px;margin-top:15px;">
                <p style="font-weight:600;font-size:13px;">Your Store URL:</p>
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
                    <p style="color:#666;font-size:12px;margin-bottom:10px;">Select products to import to your dropship store</p>
                    <div class="products-grid-full">
                        ${products.slice(0, 40).map(p => {
                            const img = (p.images && p.images[0]) || '/app-icon.png';
                            return `
                                <div class="product-card" style="cursor:default;">
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
            <p style="font-size:11px;color:#f44;margin-top:8px;">⚠️ Discount is at your loss</p>
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
        <div class="input-group"><label>Commission per Sale (%)</label><input type="number" id="contract-commission" class="input-field" value="10" min="1" max="50"></div>
        <div class="input-group"><label>Quantity Limit</label><input type="number" id="contract-quantity" class="input-field" value="50" min="1"></div>
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
// PUBLIC STORE
// =====================
async function loadPublicDropshipStore(username) {
    console.log('🏪 Loading public store:', username);
    const container = document.getElementById('dropship-store-content');
    if (!container) return;
    container.innerHTML = '<div style="text-align:center;padding:60px;"><div class="loader-spinner" style="margin:0 auto 15px;"></div><p>Loading store...</p></div>';
    try {
        const userSnap = await db.collection('users').where('username','==',username).limit(1).get();
        if (userSnap.empty) { container.innerHTML = '<p style="text-align:center;padding:60px;">Store not found</p>'; return; }
        const dropshipper = userSnap.docs[0].data();
        const dropshipperId = userSnap.docs[0].id;
        const storeName = dropshipper.storeName || username+'\'s Store';
        const storeColor = dropshipper.storeColor || '#667eea';
        const storeBio = dropshipper.storeBio || 'Welcome!';
        const isVerified = dropshipper.dropshipVerified || dropshipper.isAppVerified || false;
        const isLight = isColorLight(storeColor);
        const textColor = isLight?'#1a1a1a':'#ffffff';
        const snap = await db.collection('dropship_products').where('dropshipperId','==',dropshipperId).where('status','==','active').get();
        const products = []; snap.forEach(doc => products.push({id:doc.id,...doc.data()}));
        const cart = JSON.parse(sessionStorage.getItem('shoplify_cart')||'[]');
        const cartCount = cart.reduce((sum,item)=>sum+(item.quantity||1),0);
        
        container.innerHTML = `
            <div style="background:#f5f5f5;min-height:100vh;">
                <div style="position:sticky;top:0;z-index:100;background:white;padding:10px 15px;display:flex;align-items:center;gap:12px;border-bottom:1px solid #f0f0f0;">
                    <button onclick="window.history.back()" style="background:none;border:none;font-size:20px;cursor:pointer;">←</button>
                    <div style="flex:1;font-weight:700;font-size:16px;">${storeName}</div>
                    <button onclick="navigateTo('checkout')" style="background:none;border:none;font-size:20px;cursor:pointer;position:relative;">🛒${cartCount>0?`<span style="position:absolute;top:-3px;right:-3px;background:#FF4444;color:white;font-size:10px;min-width:18px;height:18px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;">${cartCount}</span>`:''}</button>
                </div>
                <div style="background:linear-gradient(135deg,${storeColor},#764ba2);padding:22px 20px;text-align:center;color:${textColor};">
                    ${dropshipper.storeLogo?`<img src="${dropshipper.storeLogo}" style="width:55px;height:55px;border-radius:50%;border:2px solid ${textColor};margin-bottom:8px;">`:''}
                    <h2 style="margin:0;font-size:20px;">${storeName}</h2>
                    ${isVerified?'<span style="background:#20D5EC;color:white;padding:3px 10px;border-radius:10px;font-size:10px;margin-top:6px;display:inline-block;">✓ Verified</span>':''}
                    <p style="font-size:13px;margin:6px 0 0;color:${isLight?'#333':'rgba(255,255,255,0.8)'};">${storeBio}</p>
                </div>
                <div style="padding:12px;">
                    ${products.length===0?'<p style="text-align:center;padding:40px;">No products yet</p>':`
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                            ${products.map(p=>{
                                const img=p.images?.[0]||'/app-icon.png';
                                const discount=p.discountCode?`<span style="background:#FF4444;color:white;padding:2px 6px;border-radius:8px;font-size:9px;">-${p.discountCode.value}${p.discountCode.type==='percentage'?'%':'$'}</span>`:'';
                                const hasVariants=(p.colors?.length>0)||(p.sizes?.length>0);
                                return`<div style="background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 6px rgba(0,0,0,0.04);cursor:pointer;" onclick="viewPremiumStoreProduct('${p.id}','${p.name.replace(/'/g,"\\'")}','${p.price}','${p.minPrice}','${img}','${p.originalProductId}','${dropshipperId}')"><div style="position:relative;"><img src="${img}" style="width:100%;height:150px;object-fit:cover;" onerror="this.src='/app-icon.png'">${discount?`<span style="position:absolute;top:6px;left:6px;">${discount}</span>`:''}${hasVariants?'<span style="position:absolute;top:6px;right:6px;background:rgba(0,0,0,0.5);color:white;padding:2px 6px;border-radius:8px;font-size:9px;">🎨</span>':''}</div><div style="padding:10px;"><div style="font-weight:600;font-size:12px;">${p.name}</div><div style="font-weight:700;font-size:15px;color:#B8860B;">${formatCurrency(p.price)}</div></div></div>`}).join('')}
                        </div>`}
                </div>
                <div style="text-align:center;padding:20px;"><p style="font-size:10px;color:#999;">Powered by ONESHOPLIFY</p></div>
            </div>`;
    } catch(e) { container.innerHTML = '<p style="text-align:center;padding:40px;">Error loading store</p>'; }
}

// =====================
// PREMIUM PRODUCT DETAIL (Size/Color Selection)
// =====================
async function viewPremiumStoreProduct(dropshipProductId, name, price, minPrice, image, originalProductId, dropshipperId) {
    showLoader();
    try {
        const dropshipDoc = await db.collection('dropship_products').doc(dropshipProductId).get();
        const dp = dropshipDoc.exists ? dropshipDoc.data() : {};
        const productDoc = await db.collection('products').doc(originalProductId).get();
        const product = productDoc.exists ? productDoc.data() : {};
        const reviewsSnap = await db.collection('reviews').where('productId','==',originalProductId).get();
        const reviews = []; reviewsSnap.forEach(d=>reviews.push(d.data()));
        reviews.sort((a,b)=>(b.createdAt?.toDate?.()||0)-(a.createdAt?.toDate?.()||0));
        hideLoader();
        
        window._storeProductSelection = { dropshipProductId, name, price:parseFloat(price), minPrice:parseFloat(minPrice), image, originalProductId, dropshipperId, selectedColor:null, selectedSize:null, quantity:1 };
        
        showModal(`
            <div style="max-height:85vh;overflow-y:auto;padding:0;">
                <div style="position:relative;"><img src="${image}" style="width:100%;height:300px;object-fit:cover;" onerror="this.src='/app-icon.png'"><button onclick="hideModal()" style="position:absolute;top:10px;left:10px;width:30px;height:30px;background:rgba(0,0,0,0.5);color:white;border:none;border-radius:50%;font-size:16px;cursor:pointer;">✕</button></div>
                <div style="padding:20px;">
                    <h2 style="font-size:20px;">${name}</h2>
                    <div style="font-size:26px;font-weight:800;">${formatCurrency(price)}</div>
                    ${dp.discountCode?`<div style="background:#FFF8E1;padding:10px;border-radius:8px;margin:10px 0;text-align:center;"><span style="font-weight:600;">🎫 Use code: ${dp.discountCode.code}</span> <span style="color:#f44;">(-${dp.discountCode.value}${dp.discountCode.type==='percentage'?'%':'$'})</span></div>`:''}
                    <div style="margin:10px 0;font-size:13px;color:#666;"><span>📦 ${dp.totalSales||product.totalSales||0} sold</span><span style="margin-left:15px;">⭐ ${dp.avgRating?.toFixed(1)||product.avgRating?.toFixed(1)||'0.0'} (${dp.reviewCount||product.reviewCount||0})</span></div>
                    
                    ${(dp.colors?.length>0||product.colors?.length>0)?`<div style="margin:15px 0;"><h4>🎨 Color: <span id="store-selected-color" style="color:#666;">Select</span></h4><div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:8px;">${(dp.colors||product.colors||[]).map(c=>`<div onclick="selectStoreColor('${c}')" id="store-color-${c}" style="width:40px;height:40px;border-radius:50%;background:${c.toLowerCase()};border:3px solid #ddd;cursor:pointer;" title="${c}"></div>`).join('')}</div></div>`:''}
                    
                    ${(dp.sizes?.length>0||product.sizes?.length>0)?`<div style="margin:15px 0;"><h4>📏 Size: <span id="store-selected-size" style="color:#666;">Select</span></h4><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px;">${(dp.sizes||product.sizes||[]).map(s=>`<button onclick="selectStoreSize('${s}')" id="store-size-${s}" style="padding:10px 16px;border:2px solid #e0e0e0;border-radius:8px;background:white;cursor:pointer;font-weight:600;">${s}</button>`).join('')}</div></div>`:''}
                    
                    <div style="margin:15px 0;"><h4>🔢 Quantity</h4><div style="display:flex;align-items:center;gap:15px;margin-top:8px;"><button onclick="changeStoreQuantity(-1)" style="width:36px;height:36px;border:2px solid #e0e0e0;border-radius:50%;background:white;font-size:20px;cursor:pointer;">−</button><span id="store-quantity" style="font-size:20px;font-weight:700;">1</span><button onclick="changeStoreQuantity(1)" style="width:36px;height:36px;border:2px solid #e0e0e0;border-radius:50%;background:white;font-size:20px;cursor:pointer;">+</button></div></div>
                    
                    ${(dp.description||product.description)?`<div style="margin:15px 0;"><h4>📝 Description</h4><p style="color:#666;line-height:1.6;">${dp.description||product.description}</p></div>`:''}
                    
                    <button onclick="addStoreProductWithVariants();hideModal();" style="width:100%;padding:16px;background:linear-gradient(135deg,#FFD700,#FFA000);color:#1a1a1a;border:none;border-radius:12px;font-size:16px;font-weight:700;cursor:pointer;margin-top:15px;">🛒 Add to Cart - ${formatCurrency(price)}</button>
                    
                    ${reviews.length>0?`<div style="margin-top:20px;"><h4>📝 Reviews (${reviews.length})</h4>${reviews.slice(0,8).map(r=>`<div style="padding:10px;background:#fafafa;border-radius:8px;margin-bottom:6px;"><div style="display:flex;justify-content:space-between;"><strong style="font-size:13px;">${r.userName||'Customer'}</strong><span style="color:#FFD700;">${'★'.repeat(r.rating||5)}</span></div><p style="font-size:12px;color:#666;">${r.comment||''}</p></div>`).join('')}</div>`:''}
                </div>
            </div>`);
    } catch(e) { hideLoader(); showToast('Error','error'); }
}

function selectStoreColor(color) {
    window._storeProductSelection.selectedColor = color;
    document.querySelectorAll('[id^="store-color-"]').forEach(el=>el.style.border='3px solid #ddd');
    const el = document.getElementById('store-color-'+color); if(el) el.style.border='3px solid #FFD700';
    const label = document.getElementById('store-selected-color'); if(label) label.textContent = color;
}
function selectStoreSize(size) {
    window._storeProductSelection.selectedSize = size;
    document.querySelectorAll('[id^="store-size-"]').forEach(el=>{el.style.border='2px solid #e0e0e0';el.style.background='white';});
    const el = document.getElementById('store-size-'+size); if(el) { el.style.border='2px solid #FFD700'; el.style.background='#FFFDE7'; }
    const label = document.getElementById('store-selected-size'); if(label) label.textContent = size;
}
function changeStoreQuantity(delta) {
    const sel = window._storeProductSelection; if(!sel) return;
    sel.quantity = Math.max(1, Math.min(sel.quantity+delta, 99));
    const display = document.getElementById('store-quantity'); if(display) display.textContent = sel.quantity;
}
function addStoreProductWithVariants() {
    const sel = window._storeProductSelection; if(!sel) return;
    let cart = JSON.parse(sessionStorage.getItem('shoplify_cart')||'[]');
    cart.push({productId:sel.originalProductId,dropshipProductId:sel.dropshipProductId,dropshipperId:sel.dropshipperId,name:sel.name,price:sel.price,minPrice:sel.minPrice,image:sel.image,color:sel.selectedColor,size:sel.selectedSize,quantity:sel.quantity,merchantId:sel.dropshipperId,isDropship:true,isDigital:false,discountCode:null,freeShipping:false});
    sessionStorage.setItem('shoplify_cart',JSON.stringify(cart));
    if(typeof updateCartBadge==='function') updateCartBadge();
    showToast('Added to cart! 🛒','success');
}

// =====================
// HELPER
// =====================
function isColorLight(hex) {
    if(!hex) return false;
    const c = hex.replace('#','');
    const r=parseInt(c.substring(0,2),16),g=parseInt(c.substring(2,4),16),b=parseInt(c.substring(4,6),16);
    return (r*299+g*587+b*114)/1000 > 150;
}

// Global access
window.loadDropshipDashboard = loadDropshipDashboard;
window.subscribeDropshipPlan = subscribeDropshipPlan;
window.upgradeDropshipPlan = upgradeDropshipPlan;
window.dropshipStoreSettings = dropshipStoreSettings;
window.importProductFromMarketplace = importProductFromMarketplace;
window.installProductWithAnimation = installProductWithAnimation;
window.customizeImportedProduct = customizeImportedProduct;
window.previewStore = previewStore;
window.loadWinningProducts = loadWinningProducts;
window.requestInfluencerContract = requestInfluencerContract;
window.loadPublicDropshipStore = loadPublicDropshipStore;
window.viewPremiumStoreProduct = viewPremiumStoreProduct;
window.selectStoreColor = selectStoreColor;
window.selectStoreSize = selectStoreSize;
window.changeStoreQuantity = changeStoreQuantity;
window.addStoreProductWithVariants = addStoreProductWithVariants;

console.log('✅ All dropship functions globally accessible');
console.log('   Dashboard | Plans | Import | Winning | Contracts | Store | Preview');
