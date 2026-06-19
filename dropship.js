// dropship.js - COMPLETE FINAL VERSION (All Features: Plans, Store, Contracts, Influencers, Customization, Winning Products)
console.log('✅ dropship.js loaded - ONESHOPLIFY Dropship System v8.0');

// =====================
// DROPSHIP PLANS CONFIGURATION
// =====================
const DROPSHIP_PLANS = {
    starter: {
        name: 'Starter', price: 5, color: '#4CAF50', icon: '🚀',
        requiresAuth: true, introAnimation: false, contracts: 5, verification: false, bonus: false,
        features: ['Store creation', 'Import unlimited products', 'Winning products access', 'Influencer marketplace', '5 contracts/month', 'Store customization', 'Customer support']
    },
    professional: {
        name: 'Professional', price: 10, color: '#2196F3', icon: '📈',
        requiresAuth: false, introAnimation: true, contracts: 30, verification: { minPurchases: 10 }, bonus: false,
        features: ['Public store access', '3-second intro animation', 'Full analytics', '30 contracts/month', 'Verification after 10 purchases', 'Coupons & discounts', 'Advanced themes', 'Reviews system', 'Collections', 'SEO optimization']
    },
    enterprise: {
        name: 'Enterprise Verified', price: 45, color: '#FF9800', icon: '👑',
        requiresAuth: false, introAnimation: true, contracts: Infinity, verification: true, bonus: true,
        features: ['Auto-verified badge', 'Enterprise analytics', 'Unlimited contracts', 'Priority influencer matching', 'Monthly bonus program', 'Instant trending alerts', 'Priority support', 'Featured stores', 'Premium themes', 'Multiple admin accounts', 'Faster withdrawals', 'Advanced coupons', 'VIP merchant group', 'Early access features', 'AI store assistant', 'Abandoned cart recovery', 'Email campaigns', 'Store backups', 'Recovery system', 'Priority dispute handling']
    }
};

// =====================
// DROPSHIP DASHBOARD
// =====================
async function loadDropshipDashboard() {
    console.log('📦 Loading dropship dashboard...');
    
    const container = document.getElementById('dropship-content');
    if (!container) { console.error('❌ dropship-content not found'); return; }
    
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
    const storeUrl = `${APP.baseUrl}/store/${username}`;
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
                    <p style="font-size:12px;color:#666;margin-bottom:8px;">${totalSales}/${planDetails.verification.minPurchases} purchases needed</p>
                    <div style="background:#e0e0e0;height:8px;border-radius:4px;overflow:hidden;">
                        <div style="background:linear-gradient(90deg,#FFD700,#FFA000);height:8px;border-radius:4px;width:${Math.min(100,(totalSales/planDetails.verification.minPurchases)*100)}%;"></div>
                    </div>
                </div>
            ` : ''}
            
            <!-- Enterprise Bonus -->
            ${planDetails.bonus ? `
                <div style="background:#E8F5E9;padding:14px;border-radius:10px;margin-bottom:15px;text-align:center;border:1px solid #4CAF50;">
                    <p style="font-weight:600;color:#2E7D32;margin:0;">🎁 Enterprise Bonus Program Active</p>
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
            <button class="btn-outline btn-full" style="margin-bottom:8px;padding:12px;font-size:13px;" onclick="navigateTo('analytics')">📊 Analytics</button>
            
            <!-- Store URL Card -->
            <div style="background:white;padding:15px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);margin-bottom:10px;">
                <p style="font-weight:600;font-size:13px;margin-bottom:6px;">🔗 Your Store URL:</p>
                <div style="font-family:monospace;font-size:11px;word-break:break-all;background:#f5f5f5;padding:10px;border-radius:6px;margin-bottom:8px;">${storeUrl}</div>
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
                <h4>🚀 Starter</h4>
                <div style="font-size:28px;font-weight:800;color:#4CAF50;margin:6px 0;">$5<span style="font-size:14px;color:#999;">/month</span></div>
                <ul style="list-style:none;padding:0;font-size:12px;color:#666;line-height:2.2;margin:10px 0;">
                    <li>✅ Store: yourstore.oneshoplify.com</li>
                    <li>✅ Import unlimited products</li>
                    <li>✅ Winning products access</li>
                    <li>✅ 5 contracts/month</li>
                    <li>⚠️ Customers must authenticate</li>
                </ul>
                <button class="btn-outline btn-full" style="padding:12px;font-weight:600;" onclick="subscribeDropshipPlan('starter',5)">Subscribe - $5/mo</button>
            </div>
            
            <!-- Professional Plan -->
            <div style="background:white;border-radius:14px;padding:20px;margin-bottom:12px;box-shadow:0 2px 10px rgba(0,0,0,0.06);border-left:4px solid #2196F3;">
                <span style="background:#E3F2FD;color:#1565C0;padding:4px 10px;border-radius:10px;font-size:11px;font-weight:600;float:right;">POPULAR</span>
                <h4>📈 Professional</h4>
                <div style="font-size:28px;font-weight:800;color:#2196F3;margin:6px 0;">$10<span style="font-size:14px;color:#999;">/month</span></div>
                <ul style="list-style:none;padding:0;font-size:12px;color:#666;line-height:2.2;margin:10px 0;">
                    <li>✅ Public store (no login required)</li>
                    <li>✅ 3-second intro animation</li>
                    <li>✅ Full analytics</li>
                    <li>✅ 30 contracts/month</li>
                    <li>✅ Verification (10 purchases)</li>
                    <li>✅ Coupons & themes</li>
                </ul>
                <button class="btn-outline btn-full" style="padding:12px;font-weight:600;" onclick="subscribeDropshipPlan('professional',10)">Subscribe - $10/mo</button>
            </div>
            
            <!-- Enterprise Plan -->
            <div style="background:white;border-radius:14px;padding:20px;margin-bottom:12px;box-shadow:0 2px 10px rgba(0,0,0,0.06);border-left:4px solid #FF9800;position:relative;">
                <span style="position:absolute;top:12px;right:12px;background:#FFD700;color:#1a1a1a;padding:4px 12px;border-radius:10px;font-size:10px;font-weight:700;">BEST VALUE</span>
                <h4>👑 Enterprise Verified</h4>
                <div style="font-size:28px;font-weight:800;color:#FF9800;margin:6px 0;">$45<span style="font-size:14px;color:#999;">/month</span></div>
                <ul style="list-style:none;padding:0;font-size:12px;color:#666;line-height:2.2;margin:10px 0;">
                    <li>✅ Auto-verified badge</li>
                    <li>✅ Enterprise analytics</li>
                    <li>✅ Unlimited contracts</li>
                    <li>✅ Monthly bonus program</li>
                    <li>✅ Priority support 24/7</li>
                    <li>✅ AI store assistant</li>
                    <li>✅ All premium features</li>
                </ul>
                <button class="btn-gold btn-full" style="padding:14px;font-weight:700;font-size:15px;" onclick="subscribeDropshipPlan('enterprise',45)">Subscribe - $45/mo</button>
            </div>
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
        document.getElementById('ds-product-count') && (document.getElementById('ds-product-count').textContent = products.length);
        document.getElementById('ds-total-profit') && (document.getElementById('ds-total-profit').textContent = formatCurrency(totalProfit));
    } catch (e) { console.warn('Stats error:', e); }
}

// =====================
// SUBSCRIBE TO PLAN
// =====================
async function subscribeDropshipPlan(plan, price) {
    if (!APP.userProfile) { showToast('Please login first', 'error'); return; }
    if ((APP.userProfile.walletBalance || 0) < price) { showToast(`Need $${price}. Please deposit.`, 'error'); navigateTo('wallet'); return; }
    showLoader();
    try {
        const userId = APP.userProfile.uid;
        const thirtyDays = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        await db.collection('users').doc(userId).update({
            walletBalance: firebase.firestore.FieldValue.increment(-price),
            dropshipPlan: plan, isDropshipper: true,
            dropshipPlanExpiry: firebase.firestore.Timestamp.fromDate(thirtyDays),
            dropshipVerified: plan === 'enterprise' ? true : APP.userProfile.dropshipVerified || false,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        APP.userProfile.walletBalance -= price;
        APP.userProfile.dropshipPlan = plan;
        APP.userProfile.isDropshipper = true;
        APP.userProfile.dropshipPlanExpiry = thirtyDays;
        if (plan === 'enterprise') APP.userProfile.dropshipVerified = true;
        await db.collection('transactions').add({ userId, type: 'subscription', amount: price, currency: 'USD', status: 'completed', description: `Dropship ${plan} plan`, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
        if (typeof createNotification === 'function') await createNotification(userId, 'Dropship Activated! 📦', `Your ${DROPSHIP_PLANS[plan].name} plan is active!`, '📦', 'dropship');
        hideLoader(); showToast(`Subscribed to ${DROPSHIP_PLANS[plan].name}! 🎉`, 'success'); loadDropshipDashboard();
    } catch (error) { hideLoader(); showToast('Payment failed', 'error'); }
}

// =====================
// UPGRADE PLAN
// =====================
function upgradeDropshipPlan() {
    const current = APP.userProfile?.dropshipPlan || 'starter';
    const plans = Object.entries(DROPSHIP_PLANS).filter(([key]) => key !== current);
    showModal(`
        <div style="padding:10px;"><h3>⬆️ Upgrade Plan</h3><p style="color:#666;">Current: ${DROPSHIP_PLANS[current]?.name?.toUpperCase()||current.toUpperCase()}</p>
        ${plans.map(([key, plan]) => `
            <div style="background:white;border-radius:12px;padding:15px;margin:10px 0;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid ${plan.color};">
                <h4>${plan.icon} ${plan.name}</h4><div style="font-size:24px;font-weight:800;color:${plan.color};">$${plan.price}<span style="font-size:14px;color:#999;">/mo</span></div>
                <button class="btn-gold btn-full" style="margin-top:8px;" onclick="subscribeDropshipPlan('${key}',${plan.price});hideModal();">Upgrade to ${plan.name}</button>
            </div>`).join('')}
        <button class="btn-outline btn-full" style="margin-top:8px;" onclick="hideModal()">Cancel</button></div>`);
}

// =====================
// STORE SETTINGS
// =====================
function dropshipStoreSettings() {
    const storeName = APP.userProfile?.storeName || '';
    const storeBio = APP.userProfile?.storeBio || '';
    const storeColor = APP.userProfile?.storeColor || '#667eea';
    showModal(`
        <div style="padding:10px;max-height:70vh;overflow-y:auto;"><h3>⚙️ Store Settings</h3>
        <div class="input-group" style="margin-top:15px;"><label>Store Name</label><input type="text" id="settings-store-name" class="input-field" value="${storeName}"></div>
        <div class="input-group"><label>Store Bio</label><textarea id="settings-store-bio" class="input-field" rows="2">${storeBio}</textarea></div>
        <div class="input-group"><label>Theme Color</label><input type="color" id="settings-store-color" class="input-field" value="${storeColor}" style="height:50px;"></div>
        <div class="input-group"><label>Logo (Upload)</label>${APP.userProfile.storeLogo?`<img src="${APP.userProfile.storeLogo}" style="width:60px;height:60px;border-radius:50%;margin:5px 0;">`:''}<input type="file" id="settings-logo-upload" class="input-field" accept="image/*"></div>
        <div class="input-group"><label>Banner (Upload)</label>${APP.userProfile.storeBanner?`<img src="${APP.userProfile.storeBanner}" style="width:100%;height:60px;object-fit:cover;border-radius:8px;margin:5px 0;">`:''}<input type="file" id="settings-banner-upload" class="input-field" accept="image/*"></div>
        <button class="btn-gold btn-full" style="margin-top:15px;" onclick="saveStoreSettingsQuick()">💾 Save</button></div>`);
}

async function saveStoreSettingsQuick() {
    const name = document.getElementById('settings-store-name')?.value?.trim();
    const bio = document.getElementById('settings-store-bio')?.value?.trim();
    const color = document.getElementById('settings-store-color')?.value;
    if (!name) { showToast('Enter store name', 'error'); return; }
    hideModal(); showLoader();
    try {
        const updates = { storeName: name, storeBio: bio, storeColor: color };
        const logo = document.getElementById('settings-logo-upload')?.files?.[0];
        if (logo) { try { updates.storeLogo = await uploadToCloudinary(logo); } catch(e) {} }
        const banner = document.getElementById('settings-banner-upload')?.files?.[0];
        if (banner) { try { updates.storeBanner = await uploadToCloudinary(banner); } catch(e) {} }
        await db.collection('users').doc(APP.userProfile.uid).update(updates);
        Object.assign(APP.userProfile, updates);
        hideLoader(); showToast('Saved! ✅', 'success'); loadDropshipDashboard();
    } catch(e) { hideLoader(); showToast('Failed', 'error'); }
}

// =====================
// IMPORT FROM MARKETPLACE
// =====================
function importProductFromMarketplace() {
    showLoader();
    db.collection('products').where('status','==','active').get().then(snapshot => {
        const products = []; snapshot.forEach(doc => products.push({id:doc.id,...doc.data()}));
        hideLoader();
        showModal(`<div style="padding:10px;max-height:80vh;overflow-y:auto;"><h3>➕ Import from Marketplace</h3><p style="color:#666;font-size:12px;">Select products to import</p><div class="products-grid-full">${products.slice(0,40).map(p=>{const img=(p.images&&p.images[0])||'/app-icon.png';return`<div class="product-card"><img src="${img}" class="product-card-image" onerror="this.src='/app-icon.png'" style="height:140px;"><div class="product-card-info"><div class="product-card-name">${p.name}</div><div class="product-card-price">${formatCurrency(p.price)}</div><button class="btn-gold btn-small" style="width:100%;margin-top:6px;font-size:11px;padding:8px;" onclick="installProductWithAnimation('${p.id}')">📦 Import</button></div></div>`}).join('')}</div></div>`);
    }).catch(e=>{hideLoader();showToast('Error','error');});
}

// =====================
// INSTALL WITH ANIMATION
// =====================
function installProductWithAnimation(productId) {
    hideModal();
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:9999;';
    overlay.innerHTML = `<div style="position:relative;width:140px;height:140px;"><svg width="140" height="140"><circle cx="70" cy="70" r="60" fill="none" stroke="#333" stroke-width="6"/><circle id="import-circle" cx="70" cy="70" r="60" fill="none" stroke="#FFD700" stroke-width="6" stroke-linecap="round" stroke-dasharray="377" stroke-dashoffset="377" transform="rotate(-90 70 70)" style="transition:0.08s linear;"/></svg><div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);"><div id="import-percent" style="font-size:28px;font-weight:800;color:#FFD700;">0%</div></div></div><p style="color:white;margin-top:18px;font-weight:600;">Importing...</p>`;
    document.body.appendChild(overlay);
    let pct=0; const circle=overlay.querySelector('#import-circle'); const txt=overlay.querySelector('#import-percent'); const circ=377;
    const interval=setInterval(async()=>{pct++;txt.textContent=pct+'%';circle.style.strokeDashoffset=circ-(pct/100)*circ;if(pct>=100){clearInterval(interval);await completeImport(productId,overlay);}},80);
}

async function completeImport(productId, overlay) {
    try {
        const doc = await db.collection('products').doc(productId).get();
        if (!doc.exists) { document.body.removeChild(overlay); showToast('Not found','error'); return; }
        const p = doc.data(); const sp = (p.price*1.25).toFixed(2);
        await db.collection('dropship_products').add({dropshipperId:APP.userProfile.uid,originalProductId:productId,name:p.name,price:parseFloat(sp),minPrice:p.price,images:p.images||[],colors:p.colors||[],sizes:p.sizes||[],description:p.description||'',videoUrl:p.videoUrl||'',stock:p.stock||0,totalSales:p.totalSales||0,avgRating:p.avgRating||0,reviewCount:p.reviewCount||0,status:'active',storeLink:`${APP.baseUrl}/store/${APP.userProfile.username}/${productId}`,createdAt:firebase.firestore.FieldValue.serverTimestamp()});
        overlay.innerHTML = `<div style="text-align:center;color:white;max-width:320px;"><div style="font-size:60px;">✅</div><h3 style="color:#FFD700;">Imported!</h3><p>${p.name}</p><p style="color:#ccc;">Selling: ${formatCurrency(sp)}</p><p style="color:#4CAF50;">Profit: ${formatCurrency(sp-p.price)}</p><button onclick="customizeImportedProduct('${productId}')" style="width:100%;padding:14px;background:#FFD700;color:#1a1a1a;border:none;border-radius:10px;font-weight:700;margin-top:15px;cursor:pointer;">⚙️ Customize</button><button onclick="document.body.removeChild(this.parentElement.parentElement);loadDropshipDashboard();" style="width:100%;padding:12px;background:transparent;color:white;border:2px solid white;border-radius:10px;margin-top:8px;cursor:pointer;">Go to Dashboard</button></div>`;
    } catch(e) { document.body.removeChild(overlay); showToast('Failed','error'); }
}

function customizeImportedProduct(productId) {
    showModal(`<div style="padding:10px;"><h3>⚙️ Customize</h3><div class="input-group"><label>Selling Price (USD)</label><input type="number" id="custom-price" class="input-field" step="0.01" min="0.01"></div><div class="input-group"><label>Discount Code</label><input type="text" id="custom-code" class="input-field" placeholder="SAVE20"></div><div class="input-group"><label>Value</label><div style="display:flex;gap:8px;"><input type="number" id="custom-value" class="input-field" placeholder="20" style="flex:2;"><select id="custom-type" class="input-field" style="flex:1;"><option value="percentage">%</option><option value="fixed">$</option></select></div></div><p style="font-size:11px;color:#f44;">⚠️ Discount at your loss</p><button class="btn-gold btn-full" style="margin-top:15px;" onclick="saveCustomization('${productId}')">💾 Publish</button></div>`);
}

async function saveCustomization(productId) {
    const price=parseFloat(document.getElementById('custom-price')?.value)||0;
    const code=document.getElementById('custom-code')?.value?.trim()?.toUpperCase();
    const value=parseFloat(document.getElementById('custom-value')?.value)||0;
    const type=document.getElementById('custom-type')?.value;
    if(!price){showToast('Enter price','error');return;}
    hideModal();showLoader();
    try{const snap=await db.collection('dropship_products').where('originalProductId','==',productId).where('dropshipperId','==',APP.userProfile.uid).limit(1).get();if(!snap.empty){const u={price};if(code&&value)u.discountCode={code,value,type,active:true};await snap.docs[0].ref.update(u);}hideLoader();showToast('Published!✅','success');loadDropshipDashboard();}catch(e){hideLoader();showToast('Failed','error');}
}

// =====================
// CUSTOMIZE PRODUCT PRICE (From Store)
// =====================
function customizeProductPrice(productId) {
    db.collection('dropship_products').doc(productId).get().then(doc=>{
        if(!doc.exists){showToast('Not found','error');return;}
        const p=doc.data();
        showModal(`<div style="padding:10px;"><h3>⚙️ Customize</h3><p>${p.name}</p><p style="color:#f44;">Min: ${formatCurrency(p.minPrice)}</p><div class="input-group"><label>Your Price</label><input type="number" id="customize-price" class="input-field" value="${p.price}" step="0.01" min="${p.minPrice}"></div><div class="input-group"><label>Discount Code</label><input type="text" id="customize-code" class="input-field" value="${p.discountCode?.code||''}"></div><div class="input-group"><label>Value</label><div style="display:flex;gap:8px;"><input type="number" id="customize-value" class="input-field" value="${p.discountCode?.value||''}" style="flex:2;"><select id="customize-type" class="input-field" style="flex:1;"><option value="percentage" ${p.discountCode?.type==='percentage'?'selected':''}>%</option><option value="fixed" ${p.discountCode?.type==='fixed'?'selected':''}>$</option></select></div></div><p style="font-size:11px;color:#f44;">⚠️ Discount at your loss</p><button class="btn-gold btn-full" onclick="saveCustomizedPrice('${productId}')">💾 Save</button></div>`);
    });
}

async function saveCustomizedPrice(productId) {
    const price=parseFloat(document.getElementById('customize-price')?.value);
    const code=document.getElementById('customize-code')?.value?.trim()?.toUpperCase();
    const value=parseFloat(document.getElementById('customize-value')?.value)||0;
    const type=document.getElementById('customize-type')?.value;
    if(!price||isNaN(price)){showToast('Enter valid price','error');return;}
    hideModal();showLoader();
    try{const u={price};if(code&&value)u.discountCode={code,value,type,active:true};else u.discountCode=null;await db.collection('dropship_products').doc(productId).update(u);hideLoader();showToast('Updated!✅','success');if(typeof loadDropshipStore==='function')loadDropshipStore();}catch(e){hideLoader();showToast('Failed','error');}
}

// =====================
// PREVIEW STORE
// =====================
async function previewStore() {
    const sn=APP.userProfile?.storeName||'My Store';
    const sc=APP.userProfile?.storeColor||'#667eea';
    const isLight=isColorLight(sc);const tc=isLight?'#1a1a1a':'#ffffff';
    showLoader();
    try{const snap=await db.collection('dropship_products').where('dropshipperId','==',APP.userProfile.uid).where('status','==','active').get();const p=[];snap.forEach(d=>p.push({id:d.id,...d.data()}));hideLoader();
    showModal(`<div style="padding:10px;max-height:85vh;overflow-y:auto;"><div style="background:#1a1a2e;color:white;padding:8px;text-align:center;border-radius:16px 16px 0 0;font-size:12px;">📱 Customer Preview</div><div style="border:2px solid #1a1a2e;border-top:none;border-radius:0 0 16px 16px;overflow:hidden;"><div style="background:linear-gradient(135deg,${sc},#764ba2);padding:20px;text-align:center;color:${tc};"><h2>${sn}</h2><p>${p.length} Products</p></div><div style="display:flex;gap:8px;padding:10px;background:white;"><button class="btn-gold" style="flex:1;font-size:12px;">🛒 Cart</button><button class="btn-outline" style="flex:1;font-size:12px;">📦 Orders</button></div><div style="padding:10px;background:#f5f5f5;">${p.length===0?'<p style="text-align:center;padding:20px;">No products</p>':`<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">${p.map(pr=>`<div style="background:white;border-radius:8px;overflow:hidden;"><img src="${pr.images?.[0]||'/app-icon.png'}" style="width:100%;height:120px;object-fit:cover;"><div style="padding:8px;"><div style="font-weight:600;font-size:12px;">${pr.name}</div><div style="font-weight:700;">${formatCurrency(pr.price)}</div></div></div>`).join('')}</div>`}</div></div><button class="btn-gold btn-full" style="margin-top:10px;" onclick="hideModal()">Close</button></div>`);}catch(e){hideLoader();}
}

// =====================
// WINNING PRODUCTS
// =====================
async function loadWinningProducts() {
    if(!APP.userProfile.winningProductsAccess){
        if(APP.userProfile.winningProductsExpiry&&APP.userProfile.winningProductsExpiry.toDate()<new Date()){showModal(`<div style="padding:15px;text-align:center;"><h3>🏆 Winning Products</h3><p>Expired. $1/mo</p>${(APP.userProfile.walletBalance||0)>=1?`<button class="btn-gold btn-full" onclick="subscribeWinningProducts()">💳 Pay $1</button>`:`<button class="btn-gold btn-full" onclick="hideModal();navigateTo('wallet');">💰 Deposit</button>`}</div>`);return;}
        showModal(`<div style="padding:15px;text-align:center;"><h3>🏆 Winning Products</h3><p>Trending products. $1/mo</p>${(APP.userProfile.walletBalance||0)>=1?`<button class="btn-gold btn-full" onclick="subscribeWinningProducts()">💳 Pay $1</button>`:`<button class="btn-gold btn-full" onclick="hideModal();navigateTo('wallet');">💰 Deposit</button>`}</div>`);return;
    }
    showLoader();
    try{const snap=await db.collection('products').where('status','==','active').get();const p=[];snap.forEach(d=>{const pd=d.data();if(pd.totalSales>=30&&pd.totalSales<=300)p.push({id:d.id,...pd});});p.sort((a,b)=>(b.totalSales||0)-(a.totalSales||0));hideLoader();
    showModal(`<div style="padding:10px;max-height:80vh;overflow-y:auto;"><h3>🏆 Winning</h3>${p.length===0?'<p style="text-align:center;padding:30px;">None</p>':p.slice(0,25).map(pr=>{const img=(pr.images&&pr.images[0])||'/app-icon.png';return`<div style="background:white;border-radius:12px;padding:12px;margin-bottom:10px;display:flex;gap:12px;align-items:center;"><img src="${img}" style="width:55px;height:55px;border-radius:8px;"><div style="flex:1;"><div style="font-weight:600;">${pr.name}</div><div style="font-size:12px;color:#666;">${formatCurrency(pr.price)} | 📦${pr.totalSales||0}</div></div><button class="btn-gold btn-small" onclick="installProductWithAnimation('${pr.id}')">📦 Import</button></div>`}).join('')}</div>`);}catch(e){hideLoader();showToast('Error','error');}
}

async function subscribeWinningProducts() {
    if((APP.userProfile.walletBalance||0)<1){showToast('Need $1','error');return;}
    hideModal();showLoader();
    try{const d=new Date(Date.now()+30*24*60*60*1000);await db.collection('users').doc(APP.userProfile.uid).update({walletBalance:firebase.firestore.FieldValue.increment(-1),winningProductsAccess:true,winningProductsExpiry:firebase.firestore.Timestamp.fromDate(d)});APP.userProfile.walletBalance-=1;APP.userProfile.winningProductsAccess=true;await db.collection('transactions').add({userId:APP.userProfile.uid,type:'subscription',amount:1,currency:'USD',status:'completed',createdAt:firebase.firestore.FieldValue.serverTimestamp()});hideLoader();showToast('Access granted!🏆','success');loadWinningProducts();}catch(e){hideLoader();showToast('Failed','error');}
}

// =====================
// INFLUENCER CONTRACTS
// =====================

// PRODUCT CONTRACT (Per Product)
async function requestInfluencerContract(influencerId, influencerName) {
    if(!APP.userProfile?.isDropshipper){showToast('Only dropshippers','error');return;}
    const snap=await db.collection('dropship_products').where('dropshipperId','==',APP.userProfile.uid).where('status','==','active').get();
    const p=[];snap.forEach(d=>p.push({id:d.id,...d.data()}));
    if(p.length===0){showToast('Import products first','error');return;}
    showModal(`<div style="padding:10px;max-height:75vh;overflow-y:auto;"><h3>📋 Product Contract</h3><p>Influencer: ${influencerName}</p><p style="font-size:12px;color:#666;">Influencer promotes this specific product</p><div class="input-group"><label>Product</label><select id="contract-product" class="input-field">${p.map(pr=>`<option value="${pr.id}">${pr.name} - ${formatCurrency(pr.price)}</option>`).join('')}</select></div><div class="input-group"><label>Commission (%)</label><input type="number" id="contract-commission" class="input-field" value="10" min="1" max="50"></div><div class="input-group"><label>Quantity</label><input type="number" id="contract-quantity" class="input-field" value="50" min="1"></div><div class="input-group"><label>Duration (Days)</label><input type="number" id="contract-duration" class="input-field" value="30" min="20"></div><button class="btn-gold btn-full" onclick="signProductContract('${influencerId}','${influencerName.replace(/'/g,"\\'")}')">✍️ Sign & Debit</button></div>`);
}

async function signProductContract(influencerId, influencerName) {
    const productId=document.getElementById('contract-product')?.value;
    const commission=parseInt(document.getElementById('contract-commission')?.value)||10;
    const quantity=parseInt(document.getElementById('contract-quantity')?.value)||50;
    const duration=parseInt(document.getElementById('contract-duration')?.value)||30;
    if(!productId){showToast('Select product','error');return;}
    if(duration<20){showToast('Min 20 days','error');return;}
    hideModal();showLoader();
    try{
        const pd=await db.collection('dropship_products').doc(productId).get();
        const product=pd.data();
        const totalValue=product.price*quantity;
        const totalCommission=totalValue*(commission/100);
        if((APP.userProfile.walletBalance||0)<totalCommission){hideLoader();showToast(`Need $${totalCommission.toFixed(2)} in balance`,'error');return;}
        
        // DEBIT dropshipper
        await db.collection('users').doc(APP.userProfile.uid).update({walletBalance:firebase.firestore.FieldValue.increment(-totalCommission),escrowBalance:firebase.firestore.FieldValue.increment(totalCommission)});
        APP.userProfile.walletBalance-=totalCommission;
        
        const ref=await db.collection('influencer_contracts').add({
            dropshipperId:APP.userProfile.uid,dropshipperName:APP.userProfile.displayName||APP.userProfile.username,
            influencerId,influencerName,productId,productName:product?.name||'Product',
            productPrice:product?.price||0,productLink:`${APP.baseUrl}/store/${APP.userProfile.username}/${product?.originalProductId||productId}`,
            contractType:'product',commission,quantity,duration,totalCommission,commissionPerUnit:totalCommission/quantity,
            status:'active',sales:0,remaining:quantity,totalEarnings:0,
            createdAt:firebase.firestore.FieldValue.serverTimestamp(),expiresAt:new Date(Date.now()+duration*24*60*60*1000)
        });
        
        await db.collection('transactions').add({userId:APP.userProfile.uid,type:'contract_escrow',amount:totalCommission,currency:'USD',status:'escrow',reference:ref.id,createdAt:firebase.firestore.FieldValue.serverTimestamp()});
        if(typeof createNotification==='function')await createNotification(influencerId,'📋 Product Contract!',`${APP.userProfile.displayName||APP.userProfile.username} contracted you for "${product?.name||'a product'}" at ${commission}%. Link: ${APP.baseUrl}/store/${APP.userProfile.username}/${product?.originalProductId||productId}`,'📋','notifications');
        hideLoader();showToast(`Contract active! $${totalCommission.toFixed(2)} in escrow.✅`,'success');
    }catch(e){hideLoader();showToast('Failed','error');}
}

// LONG-TERM STORE CONTRACT (20-6000 days, 20% weekly earnings)
async function requestLongTermContract(influencerId, influencerName) {
    if(!APP.userProfile?.isDropshipper){showToast('Only dropshippers','error');return;}
    showModal(`<div style="padding:10px;"><h3>📋 Long-Term Store Contract</h3><p>Influencer: ${influencerName}</p><p style="font-size:12px;color:#666;">Influencer promotes your ENTIRE store. 20% of weekly earnings sent to influencer.</p><div class="input-group"><label>Duration (Days - min 20, max 6000)</label><input type="number" id="ltc-duration" class="input-field" value="365" min="20" max="6000"></div><div class="input-group"><label>Weekly Earnings Share (%)</label><input type="number" id="ltc-share" class="input-field" value="20" min="1" max="50"></div><div style="background:#FFF8E1;padding:12px;border-radius:8px;margin-top:10px;"><p style="font-size:12px;">📋 Terms:</p><p style="font-size:11px;color:#666;">• ${influencerName} promotes your store link</p><p style="font-size:11px;color:#666;">• Every week, ${document.getElementById('ltc-share')?.value||20}% of your profit is sent to influencer</p><p style="font-size:11px;color:#666;">• Contract runs for the set duration</p></div><button class="btn-gold btn-full" style="margin-top:15px;" onclick="signLongTermContract('${influencerId}','${influencerName.replace(/'/g,"\\'")}')">✍️ Sign Long-Term Contract</button></div>`);
}

async function signLongTermContract(influencerId, influencerName) {
    const duration=parseInt(document.getElementById('ltc-duration')?.value)||365;
    const share=parseInt(document.getElementById('ltc-share')?.value)||20;
    if(duration<20||duration>6000){showToast('Duration: 20-6000 days','error');return;}
    if(share<1||share>50){showToast('Share: 1-50%','error');return;}
    hideModal();showLoader();
    try{
        const ref=await db.collection('influencer_contracts').add({
            dropshipperId:APP.userProfile.uid,dropshipperName:APP.userProfile.displayName||APP.userProfile.username,
            influencerId,influencerName,storeLink:`${APP.baseUrl}/store/${APP.userProfile.username}`,
            contractType:'longterm',duration,weeklyShare:share,
            status:'active',totalEarnings:0,weeklyEarnings:0,
            createdAt:firebase.firestore.FieldValue.serverTimestamp(),expiresAt:new Date(Date.now()+duration*24*60*60*1000)
        });
        if(typeof createNotification==='function')await createNotification(influencerId,'📋 Long-Term Contract!',`${APP.userProfile.displayName||APP.userProfile.username} signed you for a ${duration}-day store promotion at ${share}% weekly earnings! Link: ${APP.baseUrl}/store/${APP.userProfile.username}`,'📋','notifications');
        hideLoader();showToast(`Long-term contract signed! ${duration} days at ${share}% weekly.✅`,'success');
    }catch(e){hideLoader();showToast('Failed','error');}
}

// Release influencer commission on sale (for product contracts)
async function releaseInfluencerCommission(orderData) {
    try{
        const cs=await db.collection('influencer_contracts').where('productId','==',orderData.productId).where('status','==','active').where('contractType','==','product').get();
        if(cs.empty)return;
        for(const cd of cs.docs){
            const c=cd.data();
            if(c.remaining<=0){await cd.ref.update({status:'completed',completedAt:firebase.firestore.FieldValue.serverTimestamp()});continue;}
            const sc=c.commissionPerUnit||(c.productPrice*(c.commission/100));
            await db.collection('users').doc(c.dropshipperId).update({escrowBalance:firebase.firestore.FieldValue.increment(-sc)});
            await db.collection('users').doc(c.influencerId).update({walletBalance:firebase.firestore.FieldValue.increment(sc),influencerEarnings:firebase.firestore.FieldValue.increment(sc)});
            const ns=(c.sales||0)+1;const nr=c.quantity-ns;const ne=(c.totalEarnings||0)+sc;
            await cd.ref.update({sales:ns,remaining:nr,totalEarnings:ne,status:nr<=0?'completed':'active'});
            await createNotification(c.influencerId,'💰 Commission!',`${formatCurrency(sc)} from ${c.dropshipperName}. ${nr} units left.`,'💰','wallet');
            await db.collection('transactions').add({userId:c.influencerId,type:'influencer_commission',amount:sc,currency:'USD',status:'completed',reference:cd.id,createdAt:firebase.firestore.FieldValue.serverTimestamp()});
        }
    }catch(e){console.error('Commission error:',e);}
}

// =====================
// PUBLIC STORE (Standalone)
// =====================
async function loadPublicDropshipStore(username) {
    console.log('🏪 Loading store:',username);
    const container=document.getElementById('dropship-store-content');
    if(!container)return;
    container.innerHTML='<div style="text-align:center;padding:60px;"><div class="loader-spinner"></div><p>Loading store...</p></div>';
    try{
        const us=await db.collection('users').where('username','==',username).limit(1).get();
        if(us.empty){container.innerHTML='<p style="text-align:center;padding:60px;">Store not found</p>';return;}
        const d=us.docs[0].data();const did=us.docs[0].id;
        const sn=d.storeName||username+'\'s Store';const sc=d.storeColor||'#667eea';
        const isLight=isColorLight(sc);const tc=isLight?'#1a1a1a':'#ffffff';
        const snap=await db.collection('dropship_products').where('dropshipperId','==',did).where('status','==','active').get();
        const p=[];snap.forEach(doc=>p.push({id:doc.id,...doc.data()}));
        const cart=JSON.parse(sessionStorage.getItem('shoplify_cart')||'[]');const cc=cart.reduce((s,i)=>s+(i.quantity||1),0);
        
        container.innerHTML=`
            <style>#app>*:not(#screen-dropship-store){display:none!important;}.bottom-nav,.home-header,.live-feed{display:none!important;}body{background:#f5f5f5;}#app{max-width:100%;}</style>
            <div style="min-height:100vh;background:#f5f5f5;">
                <div style="background:white;padding:12px 15px;display:flex;align-items:center;gap:10px;border-bottom:1px solid #f0f0f0;position:sticky;top:0;z-index:100;">
                    <div style="font-weight:700;font-size:17px;flex:1;">${sn}</div>
                    <button onclick="navigateTo('checkout')" style="background:none;border:none;font-size:20px;cursor:pointer;position:relative;">🛒${cc>0?`<span style="position:absolute;top:-3px;right:-3px;background:#FF4444;color:white;font-size:10px;min-width:18px;height:18px;border-radius:50%;display:flex;align-items:center;justify-content:center;">${cc}</span>`:''}</button>
                    <button onclick="${APP.userProfile?'navigateTo(\'profile\')':'signInWithGoogle()'}" style="background:none;border:none;font-size:20px;cursor:pointer;">👤</button>
                </div>
                ${d.storeBanner?`<img src="${d.storeBanner}" style="width:100%;height:150px;object-fit:cover;">`:''}
                <div style="background:linear-gradient(135deg,${sc},#764ba2);padding:20px;text-align:center;color:${tc};">
                    ${d.storeLogo?`<img src="${d.storeLogo}" style="width:50px;height:50px;border-radius:50%;border:2px solid ${tc};margin-bottom:8px;">`:''}
                    <h2 style="margin:0;font-size:20px;">${sn}</h2>${d.dropshipVerified?'<span style="background:#20D5EC;color:white;padding:3px 10px;border-radius:10px;font-size:10px;">✓ Verified</span>':''}
                </div>
                <div style="padding:12px;">${p.length===0?'<p style="text-align:center;padding:40px;">No products</p>':`<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">${p.map(pr=>{const img=pr.images?.[0]||'/app-icon.png';return`<div style="background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 6px rgba(0,0,0,0.04);"><img src="${img}" style="width:100%;height:150px;object-fit:cover;" onerror="this.src='/app-icon.png'"><div style="padding:10px;"><div style="font-weight:600;font-size:12px;">${pr.name}</div><div style="font-weight:700;color:#B8860B;">${formatCurrency(pr.price)}</div><button class="btn-gold" style="width:100%;margin-top:6px;font-size:11px;padding:8px;" onclick="addToCartFromStore('${pr.id}','${pr.name.replace(/'/g,"\\'")}','${pr.price}','${(pr.images&&pr.images[0])||'/app-icon.png'}','${did}')">🛒 Add to Cart</button></div></div>`}).join('')}</div>`}</div>
                <div style="text-align:center;padding:20px;"><p style="font-size:10px;color:#999;">Powered by ONESHOPLIFY</p></div>
            </div>`;
    }catch(e){container.innerHTML='<p style="text-align:center;padding:60px;">Error</p>';}
}

function addToCartFromStore(id,name,price,image,merchantId){
    let cart=JSON.parse(sessionStorage.getItem('shoplify_cart')||'[]');
    cart.push({productId:id,name,price:parseFloat(price),image,merchantId,quantity:1,isDropship:true});
    sessionStorage.setItem('shoplify_cart',JSON.stringify(cart));
    if(typeof updateCartBadge==='function')updateCartBadge();
    showToast('Added to cart!🛒','success');
}

// =====================
// PREMIUM PRODUCT DETAIL
// =====================
async function viewPremiumStoreProduct(dropshipProductId,name,price,minPrice,image,originalProductId,dropshipperId){
    showLoader();
    try{
        const dd=await db.collection('dropship_products').doc(dropshipProductId).get();const dp=dd.exists?dd.data():{};
        const pd=await db.collection('products').doc(originalProductId).get();const product=pd.exists?pd.data():{};
        const rs=await db.collection('reviews').where('productId','==',originalProductId).get();const reviews=[];rs.forEach(d=>reviews.push(d.data()));reviews.sort((a,b)=>(b.createdAt?.toDate?.()||0)-(a.createdAt?.toDate?.()||0));
        hideLoader();
        window._storeProductSelection={dropshipProductId,name,price:parseFloat(price),minPrice:parseFloat(minPrice),image,originalProductId,dropshipperId,selectedColor:null,selectedSize:null,quantity:1};
        showModal(`<div style="max-height:85vh;overflow-y:auto;padding:0;"><div style="position:relative;"><img src="${image}" style="width:100%;height:300px;object-fit:cover;"><button onclick="hideModal()" style="position:absolute;top:10px;left:10px;width:30px;height:30px;background:rgba(0,0,0,0.5);color:white;border:none;border-radius:50%;">✕</button></div><div style="padding:20px;"><h2>${name}</h2><div style="font-size:26px;font-weight:800;">${formatCurrency(price)}</div>${dp.discountCode?`<div style="background:#FFF8E1;padding:10px;border-radius:8px;margin:10px 0;">🎫 ${dp.discountCode.code} (-${dp.discountCode.value}${dp.discountCode.type==='percentage'?'%':'$'})</div>`:''}${(dp.colors?.length||product.colors?.length)?`<div style="margin:15px 0;"><h4>🎨 Color: <span id="store-selected-color">Select</span></h4><div style="display:flex;gap:10px;flex-wrap:wrap;">${(dp.colors||product.colors||[]).map(c=>`<div onclick="selectStoreColor('${c}')" id="store-color-${c}" style="width:40px;height:40px;border-radius:50%;background:${c.toLowerCase()};border:3px solid #ddd;cursor:pointer;"></div>`).join('')}</div></div>`:''}${(dp.sizes?.length||product.sizes?.length)?`<div style="margin:15px 0;"><h4>📏 Size: <span id="store-selected-size">Select</span></h4><div style="display:flex;gap:8px;flex-wrap:wrap;">${(dp.sizes||product.sizes||[]).map(s=>`<button onclick="selectStoreSize('${s}')" id="store-size-${s}" style="padding:10px 16px;border:2px solid #e0e0e0;border-radius:8px;background:white;cursor:pointer;">${s}</button>`).join('')}</div></div>`:''}<div style="margin:15px 0;"><h4>🔢 Quantity</h4><div style="display:flex;align-items:center;gap:15px;"><button onclick="changeStoreQuantity(-1)" style="width:36px;height:36px;border:2px solid #e0e0e0;border-radius:50%;">−</button><span id="store-quantity">1</span><button onclick="changeStoreQuantity(1)" style="width:36px;height:36px;border:2px solid #e0e0e0;border-radius:50%;">+</button></div></div>${(dp.description||product.description)?`<p style="color:#666;">${dp.description||product.description}</p>`:''}<button onclick="addStoreProductWithVariants();hideModal();" style="width:100%;padding:16px;background:linear-gradient(135deg,#FFD700,#FFA000);color:#1a1a1a;border:none;border-radius:12px;font-size:16px;font-weight:700;margin-top:15px;">🛒 Add to Cart - ${formatCurrency(price)}</button>${reviews.length>0?`<div style="margin-top:20px;"><h4>📝 Reviews</h4>${reviews.slice(0,8).map(r=>`<div style="padding:10px;background:#fafafa;border-radius:8px;margin-bottom:6px;"><div style="display:flex;justify-content:space-between;"><strong>${r.userName||'Customer'}</strong><span>${'★'.repeat(r.rating||5)}</span></div><p style="font-size:12px;color:#666;">${r.comment||''}</p></div>`).join('')}</div>`:''}</div></div>`);
    }catch(e){hideLoader();showToast('Error','error');}
}

function selectStoreColor(c){window._storeProductSelection.selectedColor=c;document.querySelectorAll('[id^="store-color-"]').forEach(e=>e.style.border='3px solid #ddd');const el=document.getElementById('store-color-'+c);if(el)el.style.border='3px solid #FFD700';const lbl=document.getElementById('store-selected-color');if(lbl)lbl.textContent=c;}
function selectStoreSize(s){window._storeProductSelection.selectedSize=s;document.querySelectorAll('[id^="store-size-"]').forEach(e=>{e.style.border='2px solid #e0e0e0';e.style.background='white';});const el=document.getElementById('store-size-'+s);if(el){el.style.border='2px solid #FFD700';el.style.background='#FFFDE7';}const lbl=document.getElementById('store-selected-size');if(lbl)lbl.textContent=s;}
function changeStoreQuantity(d){const sel=window._storeProductSelection;if(!sel)return;sel.quantity=Math.max(1,Math.min(sel.quantity+d,99));const disp=document.getElementById('store-quantity');if(disp)disp.textContent=sel.quantity;}
function addStoreProductWithVariants(){const sel=window._storeProductSelection;if(!sel)return;let cart=JSON.parse(sessionStorage.getItem('shoplify_cart')||'[]');cart.push({productId:sel.originalProductId,dropshipProductId:sel.dropshipProductId,dropshipperId:sel.dropshipperId,name:sel.name,price:sel.price,minPrice:sel.minPrice,image:sel.image,color:sel.selectedColor,size:sel.selectedSize,quantity:sel.quantity,merchantId:sel.dropshipperId,isDropship:true,isDigital:false,discountCode:null,freeShipping:false});sessionStorage.setItem('shoplify_cart',JSON.stringify(cart));if(typeof updateCartBadge==='function')updateCartBadge();showToast('Added to cart!🛒','success');}

// =====================
// HELPER
// =====================
function isColorLight(hex){if(!hex)return false;const c=hex.replace('#','');const r=parseInt(c.substring(0,2),16),g=parseInt(c.substring(2,4),16),b=parseInt(c.substring(4,6),16);return(r*299+g*587+b*114)/1000>150;}

// =====================
// GLOBAL ACCESS
// =====================
window.loadDropshipDashboard=loadDropshipDashboard;
window.DROPSHIP_PLANS=DROPSHIP_PLANS;
window.subscribeDropshipPlan=subscribeDropshipPlan;
window.upgradeDropshipPlan=upgradeDropshipPlan;
window.dropshipStoreSettings=dropshipStoreSettings;
window.importProductFromMarketplace=importProductFromMarketplace;
window.installProductWithAnimation=installProductWithAnimation;
window.customizeImportedProduct=customizeImportedProduct;
window.customizeProductPrice=customizeProductPrice;
window.previewStore=previewStore;
window.loadWinningProducts=loadWinningProducts;
window.subscribeWinningProducts=subscribeWinningProducts;
window.requestInfluencerContract=requestInfluencerContract;
window.requestLongTermContract=requestLongTermContract;
window.signProductContract=signProductContract;
window.signLongTermContract=signLongTermContract;
window.releaseInfluencerCommission=releaseInfluencerCommission;
window.loadPublicDropshipStore=loadPublicDropshipStore;
window.viewPremiumStoreProduct=viewPremiumStoreProduct;
window.selectStoreColor=selectStoreColor;
window.selectStoreSize=selectStoreSize;
window.changeStoreQuantity=changeStoreQuantity;
window.addStoreProductWithVariants=addStoreProductWithVariants;
window.addToCartFromStore=addToCartFromStore;

console.log('✅ All dropship functions globally accessible');
console.log('   Plans | Import | Customize | Contracts (Product + Long-Term) | Store | Winning');
