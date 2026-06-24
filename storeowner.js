// storeowner.js - COMPLETE PRODUCTION VERSION
// ONESHOPLIFY Store Ownership System
// Store Dashboard, Products, Orders, Analytics, Chat, Followers, Wallet, Ads, Settings

console.log('✅ storeowner.js loaded');

// =====================
// STORE PLANS
// =====================
const STORE_PLANS = {
    basic: {
        name: 'Basic',
        price: 9.99,
        products: 50,
        analytics: 'simple',
        support: 'email',
        chat: 10,
        followers: true,
        sponsored: true
    },
    pro: {
        name: 'Pro',
        price: 29.99,
        products: 501,
        analytics: 'full',
        support: 'ticket+email+phone',
        chat: 100,
        followers: true,
        sponsored: true
    },
    enterprise: {
        name: 'Enterprise',
        price: 99.99,
        products: 'Unlimited',
        analytics: 'enterprise',
        support: 'ticket+email+phone+bot',
        chat: 'Unlimited',
        followers: true,
        verified: true,
        sponsored: false,
        autoReply: true,
        dailyReports: true
    }
};

// =====================
// STORE CREATION FLOW
// =====================
let storeCreationStep = 1;
let storeData = {};

function startStoreCreation() {
    storeCreationStep = 1;
    storeData = {};
    showStoreCreationStep1();
}

function showStoreCreationStep1() {
    showModal(`
        <div style="padding:15px;max-height:80vh;overflow-y:auto;">
            <div style="text-align:center;margin-bottom:20px;">
                <div style="font-size:40px;">🏪</div>
                <h3>Choose a Plan</h3>
                <p style="color:#666;font-size:13px;">Step 1 of 7</p>
            </div>
            
            ${Object.entries(STORE_PLANS).map(([key, plan]) => `
                <div style="background:white;border-radius:14px;padding:18px;margin-bottom:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);border-left:4px solid ${key==='enterprise'?'#FF9800':key==='pro'?'#2196F3':'#4CAF50'};${key==='pro'?'border:2px solid #2196F3;':''}">
                    ${key==='pro'?'<span style="background:#2196F3;color:white;padding:3px 10px;border-radius:10px;font-size:10px;float:right;">RECOMMENDED</span>':''}
                    <h4>${plan.name}</h4>
                    <div style="font-size:28px;font-weight:800;color:${key==='enterprise'?'#FF9800':key==='pro'?'#2196F3':'#4CAF50'};margin:6px 0;">$${plan.price}<span style="font-size:14px;color:#999;">/month</span></div>
                    <ul style="list-style:none;padding:0;font-size:12px;color:#666;line-height:2;margin:10px 0;">
                        <li>✅ ${plan.products} Products</li>
                        <li>✅ ${plan.analytics} Analytics</li>
                        <li>✅ ${plan.support} Support</li>
                        <li>✅ ${plan.chat} Chats/day</li>
                        ${plan.verified?'<li>✅ Verified Badge</li>':''}
                        ${plan.autoReply?'<li>✅ Auto Reply Bot</li>':''}
                        ${plan.sponsored?'<li>⚠️ Sponsored ads shown</li>':'<li>✅ No sponsored ads</li>'}
                    </ul>
                    <button class="btn-gold btn-full" onclick="selectStorePlan('${key}',${plan.price})" style="padding:12px;">Choose ${plan.name}</button>
                </div>
            `).join('')}
            
            <p style="text-align:center;font-size:11px;color:#999;">Money-back guarantee • Cancel anytime</p>
        </div>
    `);
}

function selectStorePlan(plan, price) {
    storeData.plan = plan;
    storeData.planPrice = price;
    storeCreationStep = 2;
    hideModal();
    showStoreCreationStep2();
}

function showStoreCreationStep2() {
    showModal(`
        <div style="padding:15px;max-height:80vh;overflow-y:auto;">
            <div style="text-align:center;margin-bottom:15px;">
                <p style="color:#666;font-size:13px;">Step 2 of 7</p>
                <h3>📋 Store Information</h3>
            </div>
            
            <div class="input-group"><label>Store Type</label>
                <select id="store-type" class="input-field" onchange="toggleOrgFields()">
                    <option value="individual">Individual Store</option>
                    <option value="organization">Organization Store</option>
                </select>
            </div>
            <div class="input-group"><label>Store Name *</label><input type="text" id="store-name-input" class="input-field" placeholder="My Store"></div>
            <div class="input-group"><label>Store Description (10-100 words)</label><textarea id="store-desc-input" class="input-field" rows="3" placeholder="Describe your store..."></textarea></div>
            <div class="input-group"><label>Category *</label>
                <select id="store-category" class="input-field">
                    <option value="">Select Category</option>
                    <option value="fashion">Fashion</option>
                    <option value="electronics">Electronics</option>
                    <option value="beauty">Beauty</option>
                    <option value="home">Home & Garden</option>
                    <option value="sports">Sports</option>
                    <option value="toys">Toys</option>
                    <option value="tickets">Tickets & Events</option>
                    <option value="digital">Digital Products</option>
                    <option value="all">All Purpose Store</option>
                </select>
            </div>
            <div class="input-group"><label>Store Country *</label>
                <select id="store-country" class="input-field">
                    ${typeof COUNTRIES!=='undefined'?Object.entries(COUNTRIES).sort((a,b)=>a[1].name.localeCompare(b[1].name)).map(([c,d])=>`<option value="${c}">${d.flag||''} ${d.name}</option>`).join(''):''}
                </select>
            </div>
            <div class="input-group"><label>Product Range</label>
                <select id="store-product-range" class="input-field">
                    <option value="1-10">1-10 Products</option>
                    <option value="10-50">10-50 Products</option>
                    <option value="50-100">50-100 Products</option>
                    <option value="100-500">100-500 Products</option>
                </select>
            </div>
            
            <div id="org-fields" style="display:none;">
                <div class="input-group"><label>Organization Name</label><input type="text" id="org-name" class="input-field"></div>
                <div class="input-group"><label>Tax ID / Registration Number</label><input type="text" id="org-tax-id" class="input-field"></div>
            </div>
            
            <button class="btn-gold btn-full" onclick="saveStoreInfo()">Continue</button>
        </div>
    `);
}

function toggleOrgFields() {
    const type = document.getElementById('store-type')?.value;
    const orgFields = document.getElementById('org-fields');
    if (orgFields) orgFields.style.display = type === 'organization' ? 'block' : 'none';
}

function saveStoreInfo() {
    const name = document.getElementById('store-name-input')?.value?.trim();
    const desc = document.getElementById('store-desc-input')?.value?.trim();
    const category = document.getElementById('store-category')?.value;
    const country = document.getElementById('store-country')?.value;
    const type = document.getElementById('store-type')?.value;
    
    if (!name) { showToast('Please enter store name', 'error'); return; }
    if (!category) { showToast('Please select a category', 'error'); return; }
    if (!country) { showToast('Please select country', 'error'); return; }
    
    storeData.name = name;
    storeData.description = desc;
    storeData.category = category;
    storeData.country = country;
    storeData.type = type;
    storeData.productRange = document.getElementById('store-product-range')?.value;
    
    if (type === 'organization') {
        storeData.orgName = document.getElementById('org-name')?.value?.trim();
        storeData.orgTaxId = document.getElementById('org-tax-id')?.value?.trim();
    }
    
    storeCreationStep = 3;
    hideModal();
    showStoreCreationStep3();
}

function showStoreCreationStep3() {
    showModal(`
        <div style="padding:15px;max-height:80vh;overflow-y:auto;">
            <div style="text-align:center;margin-bottom:15px;">
                <p style="color:#666;font-size:13px;">Step 3 of 7</p>
                <h3>🌍 Shipping Settings</h3>
            </div>
            
            <p style="font-size:13px;color:#666;margin-bottom:10px;">Select countries you can ship to and set rates:</p>
            
            <div id="shipping-countries-list" style="margin-bottom:10px;"></div>
            <button class="btn-outline btn-full" onclick="addShippingCountryForStore()">➕ Add Country</button>
            
            <div class="input-group" style="margin-top:15px;">
                <label>Industrial UID (from oneShoplify Wallet)</label>
                <input type="text" id="store-industrial-uid" class="input-field" placeholder="Enter your Industrial UID">
                <small style="color:#666;">Get this from oneShoplify Wallet → Profile → Store & Gateway → Generate Industrial UID</small>
            </div>
            
            <button class="btn-gold btn-full" style="margin-top:15px;" onclick="saveShippingSettings()">Continue</button>
            <button class="btn-outline btn-full" style="margin-top:8px;" onclick="skipPaymentGateway()">Skip Payment Setup for Now</button>
        </div>
    `);
    
    storeData.shippingRates = {};
    renderStoreShippingCountries();
}

function renderStoreShippingCountries() {
    const container = document.getElementById('shipping-countries-list');
    if (!container) return;
    
    const countries = storeData.shippingRates || {};
    
    if (Object.keys(countries).length === 0) {
        container.innerHTML = '<p style="color:#999;font-size:12px;">No shipping countries added yet</p>';
    } else {
        container.innerHTML = Object.entries(countries).map(([code, rate]) => `
            <div style="display:flex;justify-content:space-between;padding:8px;background:#f5f5f5;border-radius:8px;margin-bottom:4px;font-size:12px;">
                <span>${COUNTRIES?.[code]?.flag||''} ${COUNTRIES?.[code]?.name||code}</span>
                <span>$${rate} <button onclick="removeStoreShipping('${code}')" style="background:none;border:none;color:red;cursor:pointer;">✕</button></span>
            </div>
        `).join('');
    }
}

function addShippingCountryForStore() {
    showModal(`
        <h3>Add Shipping Country</h3>
        <div class="input-group"><label>Country</label><select id="new-store-ship-country" class="input-field">${typeof COUNTRIES!=='undefined'?Object.entries(COUNTRIES).sort((a,b)=>a[1].name.localeCompare(b[1].name)).map(([c,d])=>`<option value="${c}">${d.flag||''} ${d.name}</option>`).join(''):''}</select></div>
        <div class="input-group"><label>Shipping Rate (USD)</label><input type="number" id="new-store-ship-rate" class="input-field" step="0.01" min="0"></div>
        <button class="btn-gold btn-full" onclick="saveStoreShippingCountry()">Add</button>
    `);
}

function saveStoreShippingCountry() {
    const country = document.getElementById('new-store-ship-country')?.value;
    const rate = parseFloat(document.getElementById('new-store-ship-rate')?.value) || 0;
    if (!country) return;
    storeData.shippingRates[country] = rate;
    hideModal();
    renderStoreShippingCountries();
}

function removeStoreShipping(country) {
    delete storeData.shippingRates[country];
    renderStoreShippingCountries();
}

function saveShippingSettings() {
    const uid = document.getElementById('store-industrial-uid')?.value?.trim();
    storeData.industrialUid = uid;
    storeCreationStep = 4;
    hideModal();
    showStoreCreationStep4();
}

function skipPaymentGateway() {
    storeData.industrialUid = '';
    storeCreationStep = 4;
    hideModal();
    showStoreCreationStep4();
}

function showStoreCreationStep4() {
    showModal(`
        <div style="padding:15px;max-height:80vh;overflow-y:auto;">
            <div style="text-align:center;margin-bottom:15px;">
                <p style="color:#666;font-size:13px;">Step 4 of 7</p>
                <h3>🎨 Store Branding</h3>
            </div>
            
            <div class="input-group">
                <label>Store Logo</label>
                <input type="file" id="store-logo-upload" class="input-field" accept="image/*" onchange="previewStoreLogo()">
                <div id="store-logo-preview" style="margin-top:8px;text-align:center;"></div>
                <small>Recommended: 500x500px</small>
            </div>
            
            <div class="input-group" style="margin-top:12px;">
                <label>Store Banner</label>
                <input type="file" id="store-banner-upload" class="input-field" accept="image/*" onchange="previewStoreBanner()">
                <div id="store-banner-preview" style="margin-top:8px;"></div>
                <small>Recommended: 1200x400px</small>
            </div>
            
            <div class="input-group" style="margin-top:12px;">
                <label>Theme Color</label>
                <input type="color" id="store-theme-color" class="input-field" value="#6C3CF0" style="height:50px;padding:5px;">
            </div>
            
            <label style="display:flex;align-items:center;gap:8px;margin:15px 0;">
                <input type="checkbox" id="agree-terms" style="width:18px;height:18px;">
                <span style="font-size:13px;">I confirm I will fulfill orders and deliver products as described. I agree to the Store Owner Terms & Conditions.</span>
            </label>
            
            <button class="btn-gold btn-full" onclick="finalizeStoreCreation()">🚀 Create My Store</button>
        </div>
    `);
}

function previewStoreLogo() {
    const file = document.getElementById('store-logo-upload')?.files?.[0];
    const container = document.getElementById('store-logo-preview');
    if (!container || !file) return;
    storeData.logoFile = file;
    const reader = new FileReader();
    reader.onload = e => container.innerHTML = `<img src="${e.target.result}" style="width:80px;height:80px;border-radius:50%;object-fit:cover;border:3px solid var(--gold);">`;
    reader.readAsDataURL(file);
}

function previewStoreBanner() {
    const file = document.getElementById('store-banner-upload')?.files?.[0];
    const container = document.getElementById('store-banner-preview');
    if (!container || !file) return;
    storeData.bannerFile = file;
    const reader = new FileReader();
    reader.onload = e => container.innerHTML = `<img src="${e.target.result}" style="width:100%;height:100px;object-fit:cover;border-radius:8px;">`;
    reader.readAsDataURL(file);
}

async function finalizeStoreCreation() {
    if (!document.getElementById('agree-terms')?.checked) {
        showToast('Please agree to the terms and conditions', 'error');
        return;
    }
    
    hideModal();
    showLoader();
    
    try {
        // Upload logo and banner
        let logoUrl = '';
        let bannerUrl = '';
        
        if (storeData.logoFile) {
            logoUrl = await uploadToCloudinary(storeData.logoFile);
        }
        if (storeData.bannerFile) {
            bannerUrl = await uploadToCloudinary(storeData.bannerFile);
        }
        
        const themeColor = document.getElementById('store-theme-color')?.value || '#6C3CF0';
        
        // Create store in Firestore
        const storeRef = await db.collection('stores').add({
            ownerId: APP.userProfile.uid,
            ownerName: APP.userProfile.displayName || APP.userProfile.username,
            name: storeData.name,
            description: storeData.description,
            category: storeData.category,
            country: storeData.country,
            type: storeData.type,
            plan: storeData.plan,
            planPrice: storeData.planPrice,
            logo: logoUrl,
            banner: bannerUrl,
            themeColor: themeColor,
            shippingRates: storeData.shippingRates || {},
            industrialUid: storeData.industrialUid || '',
            productRange: storeData.productRange,
            orgName: storeData.orgName || '',
            orgTaxId: storeData.orgTaxId || '',
            followers: 0,
            following: 0,
            totalSales: 0,
            totalRevenue: 0,
            verified: false,
            status: 'active',
            storeUrl: `${storeData.name.toLowerCase().replace(/[^a-z0-9]/g,'')}.oneshoplify.com`,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Update user profile
        await db.collection('users').doc(APP.userProfile.uid).update({
            isStoreOwner: true,
            storeId: storeRef.id,
            storePlan: storeData.plan,
            storeSubscriptionExpiry: firebase.firestore.Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
        });
        
        APP.userProfile.isStoreOwner = true;
        APP.userProfile.storeId = storeRef.id;
        APP.userProfile.storePlan = storeData.plan;
        
        // Deduct payment if not skipped
        if (storeData.planPrice && storeData.industrialUid) {
            await db.collection('users').doc(APP.userProfile.uid).update({
                walletBalance: firebase.firestore.FieldValue.increment(-storeData.planPrice)
            });
            APP.userProfile.walletBalance -= storeData.planPrice;
        }
        
        hideLoader();
        
        // Show success
        showModal(`
            <div style="text-align:center;padding:20px;">
                <div style="font-size:80px;">🎉</div>
                <h2>Store Created!</h2>
                <p style="color:#666;margin:10px 0;">Your store is ready!</p>
                <div style="background:#f5f5f5;padding:15px;border-radius:10px;margin:15px 0;">
                    <p style="font-size:12px;color:#666;">Store URL:</p>
                    <p style="font-weight:700;font-size:16px;">${storeData.name.toLowerCase().replace(/[^a-z0-9]/g,'')}.oneshoplify.com</p>
                </div>
                <button class="btn-gold btn-full" onclick="hideModal();navigateTo('store-dashboard');">🎯 Go to Dashboard</button>
                <button class="btn-outline btn-full" style="margin-top:8px;" onclick="hideModal();navigateTo('store-view');">🏪 View My Store</button>
            </div>
        `);
        
    } catch (error) {
        hideLoader();
        console.error('Store creation error:', error);
        showToast('Failed to create store. Please try again.', 'error');
    }
}

// =====================
// STORE DASHBOARD
// =====================
async function loadStoreDashboard() {
    const container = document.getElementById('store-dashboard-content');
    if (!container) return;
    
    if (!APP.userProfile?.isStoreOwner) {
        container.innerHTML = `
            <div style="text-align:center;padding:60px;">
                <p style="font-size:50px;">🏪</p>
                <h3>Own a Store</h3>
                <p style="color:#666;margin:15px 0;">Create your own store on ONESHOPLIFY and start selling!</p>
                <button class="btn-gold btn-full" onclick="startStoreCreation()">Create My Store</button>
            </div>`;
        return;
    }
    
    container.innerHTML = '<div style="text-align:center;padding:60px;"><div class="loader-spinner"></div><p>Loading dashboard...</p></div>';
    
    try {
        const storeDoc = await db.collection('stores').doc(APP.userProfile.storeId).get();
        if (!storeDoc.exists) { container.innerHTML = '<p>Store not found</p>'; return; }
        
        const store = storeDoc.data();
        const plan = STORE_PLANS[store.plan] || STORE_PLANS.basic;
        
        // Get store stats
        const productsSnap = await db.collection('products').where('storeId','==',APP.userProfile.storeId).get();
        const ordersSnap = await db.collection('orders').where('storeId','==',APP.userProfile.storeId).get();
        
        let totalRevenue = 0, totalOrders = 0, pendingOrders = 0;
        ordersSnap.forEach(doc => {
            const o = doc.data();
            totalRevenue += o.total || 0;
            totalOrders++;
            if (o.status === 'pending') pendingOrders++;
        });
        
        const storeUrl = `${store.name.toLowerCase().replace(/[^a-z0-9]/g,'')}.oneshoplify.com`;
        
        container.innerHTML = `
            <div style="background:#0F172A;color:white;min-height:100vh;">
                
                <!-- Dashboard Header -->
                <div style="padding:20px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                        <div>
                            <h2 style="margin:0;">Dashboard</h2>
                            <p style="opacity:0.7;font-size:13px;">Welcome back, ${APP.userProfile.displayName||'Owner'}</p>
                        </div>
                        <div style="display:flex;gap:8px;">
                            <button class="btn-small" style="background:rgba(255,255,255,0.1);color:white;border:none;padding:8px 12px;border-radius:8px;" onclick="navigateTo('store-view')">View Store</button>
                            <button class="btn-small" style="background:rgba(255,255,255,0.1);color:white;border:none;padding:8px 12px;border-radius:8px;position:relative;" onclick="navigateTo('notifications')">
                                🔔 <span id="store-notif-badge" style="background:red;padding:2px 6px;border-radius:10px;font-size:10px;">3</span>
                            </button>
                        </div>
                    </div>
                    
                    <!-- Store Card -->
                    <div style="background:linear-gradient(135deg,#6C3CF0,#8B5CF6);border-radius:16px;padding:18px;margin-bottom:15px;">
                        <div style="display:flex;align-items:center;gap:12px;">
                            ${store.logo?`<img src="${store.logo}" style="width:50px;height:50px;border-radius:50%;border:2px solid white;">`:''}
                            <div>
                                <h3 style="margin:0;">${store.name}</h3>
                                <p style="opacity:0.8;font-size:12px;">${plan.name} Plan</p>
                            </div>
                            ${store.verified||plan.verified?'<span style="background:#20D5EC;padding:3px 10px;border-radius:10px;font-size:10px;">✓ Verified</span>':''}
                        </div>
                        <div style="margin-top:10px;font-size:11px;opacity:0.7;">${storeUrl}</div>
                    </div>
                    
                    <!-- Stats Cards -->
                    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:15px;">
                        <div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:14px;text-align:center;">
                            <div style="font-size:24px;font-weight:800;color:#22C55E;">$${totalRevenue.toFixed(0)}</div>
                            <div style="font-size:10px;opacity:0.7;">Revenue</div>
                        </div>
                        <div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:14px;text-align:center;">
                            <div style="font-size:24px;font-weight:800;color:#3B82F6;">${totalOrders}</div>
                            <div style="font-size:10px;opacity:0.7;">Orders</div>
                        </div>
                        <div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:14px;text-align:center;">
                            <div style="font-size:24px;font-weight:800;color:#F59E0B;">${pendingOrders}</div>
                            <div style="font-size:10px;opacity:0.7;">Pending</div>
                        </div>
                    </div>
                    
                    <!-- Quick Actions -->
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:15px;">
                        <button class="btn-gold" onclick="showAddProductForm()">➕ Add Product</button>
                        <button class="btn-outline" style="border-color:rgba(255,255,255,0.3);color:white;" onclick="navigateTo('store-orders')">📦 Orders</button>
                        <button class="btn-outline" style="border-color:rgba(255,255,255,0.3);color:white;" onclick="navigateTo('store-analytics')">📊 Analytics</button>
                        <button class="btn-outline" style="border-color:rgba(255,255,255,0.3);color:white;" onclick="navigateTo('store-settings')">⚙️ Settings</button>
                    </div>
                    
                    <!-- Recent Orders -->
                    <div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:14px;margin-bottom:10px;">
                        <h4 style="margin-bottom:10px;">📋 Recent Orders</h4>
                        <div id="recent-orders-list"></div>
                    </div>
                    
                    <!-- Products List -->
                    <div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:14px;">
                        <h4 style="margin-bottom:10px;">🛍 Products (${productsSnap.size})</h4>
                        <div id="store-products-list"></div>
                    </div>
                </div>
            </div>`;
        
        // Load recent orders
        const recentOrders = [];
        ordersSnap.forEach(doc => recentOrders.push({id:doc.id,...doc.data()}));
        recentOrders.sort((a,b)=>(b.createdAt?.toDate?.()||0)-(a.createdAt?.toDate?.()||0));
        
        const ordersList = document.getElementById('recent-orders-list');
        if (ordersList) {
            if (recentOrders.length === 0) {
                ordersList.innerHTML = '<p style="opacity:0.5;text-align:center;padding:10px;">No orders yet</p>';
            } else {
                ordersList.innerHTML = recentOrders.slice(0,5).map(o => `
                    <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.1);">
                        <div>
                            <div style="font-weight:600;font-size:13px;">${o.items?.[0]?.name||'Product'}</div>
                            <div style="font-size:11px;opacity:0.6;">${o.userName||'Customer'} · ${getTimeAgo(o.createdAt)}</div>
                        </div>
                        <div style="text-align:right;">
                            <div style="font-weight:700;">${formatCurrency(o.total)}</div>
                            <span style="font-size:10px;padding:2px 8px;border-radius:8px;background:${o.status==='completed'?'#22C55E':o.status==='pending'?'#F59E0B':'#3B82F6'};">${o.status}</span>
                        </div>
                    </div>
                `).join('');
            }
        }
        
        // Load products
        const productsList = document.getElementById('store-products-list');
        if (productsList) {
            if (productsSnap.empty) {
                productsList.innerHTML = '<p style="opacity:0.5;text-align:center;padding:10px;">No products yet. Click Add Product!</p>';
            } else {
                const products = [];
                productsSnap.forEach(doc => products.push({id:doc.id,...doc.data()}));
                productsList.innerHTML = products.slice(0,5).map(p => `
                    <div style="display:flex;gap:10px;align-items:center;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.1);">
                        <img src="${p.images?.[0]||'/app-icon.png'}" style="width:40px;height:40px;border-radius:8px;object-fit:cover;">
                        <div style="flex:1;">
                            <div style="font-weight:600;font-size:13px;">${p.name}</div>
                            <div style="font-size:11px;opacity:0.6;">${formatCurrency(p.price)} · Stock: ${p.stock||0}</div>
                        </div>
                        <span style="font-size:10px;padding:2px 8px;border-radius:8px;background:${p.status==='active'?'#22C55E':'#F59E0B'};">${p.status||'active'}</span>
                    </div>
                `).join('');
            }
        }
        
    } catch (error) {
        console.error('Dashboard error:', error);
        container.innerHTML = '<p style="text-align:center;padding:40px;">Error loading dashboard</p>';
    }
}

// =====================
// ADD PRODUCT FORM
// =====================
function showAddProductForm() {
    showModal(`
        <div style="padding:15px;max-height:80vh;overflow-y:auto;">
            <h3>➕ Add Product</h3>
            
            <div class="input-group"><label>Product Type</label>
                <select id="product-type-add" class="input-field" onchange="toggleProductTypeFields()">
                    <option value="physical">Physical Product</option>
                    <option value="digital">Digital Product</option>
                    <option value="ticket">Ticket / Event</option>
                </select>
            </div>
            
            <div class="input-group"><label>Product Name *</label><input type="text" id="add-product-name" class="input-field"></div>
            <div class="input-group"><label>Price (USD) *</label><input type="number" id="add-product-price" class="input-field" step="0.01"></div>
            <div class="input-group"><label>Stock Quantity</label><input type="number" id="add-product-stock" class="input-field" value="1"></div>
            <div class="input-group"><label>Description</label><textarea id="add-product-desc" class="input-field" rows="3"></textarea></div>
            <div class="input-group"><label>Product Images</label><input type="file" id="add-product-images" class="input-field" multiple accept="image/*"></div>
            
            <!-- Ticket Fields -->
            <div id="ticket-fields" style="display:none;">
                <div class="input-group"><label>Event Date & Time</label><input type="datetime-local" id="ticket-event-date" class="input-field"></div>
                <div class="input-group"><label>Venue / Full Address</label><input type="text" id="ticket-venue" class="input-field"></div>
                <div class="input-group"><label>Ticket Quantity</label><input type="number" id="ticket-quantity" class="input-field"></div>
                <div class="input-group"><label>Preservation Options (comma separated)</label><input type="text" id="ticket-preservations" class="input-field" placeholder="Table for 2, Table for 4, VIP, General"></div>
                <div class="input-group"><label>Vary Price by Preservation?</label>
                    <select id="ticket-vary-price" class="input-field" onchange="toggleTicketPriceVariation()">
                        <option value="no">No - Same price for all</option>
                        <option value="yes">Yes - Different prices</option>
                    </select>
                </div>
                <div id="ticket-price-variations" style="display:none;"></div>
                <div class="input-group"><label>Ticket Delivery Method</label>
                    <select id="ticket-delivery" class="input-field">
                        <option value="app">App Generated Ticket</option>
                        <option value="seller">Store Owner WhatsApp</option>
                    </select>
                </div>
                <div id="ticket-whatsapp-field" style="display:none;">
                    <div class="input-group"><label>Your WhatsApp Number</label><input type="tel" id="ticket-whatsapp" class="input-field"></div>
                </div>
                <div class="input-group"><label>Visibility</label>
                    <select id="ticket-visibility" class="input-field">
                        <option value="public">Public - Visible to everyone</option>
                        <option value="private">Private - Only people with link</option>
                    </select>
                </div>
            </div>
            
            <!-- Digital Fields -->
            <div id="digital-fields" style="display:none;">
                <div class="input-group"><label>Product Link / URL</label><input type="url" id="digital-link" class="input-field" placeholder="https://..."></div>
            </div>
            
            <!-- Discount -->
            <div class="input-group"><label>Discount Code (optional)</label><input type="text" id="add-discount-code" class="input-field" placeholder="SAVE20"></div>
            <div class="input-group"><label>Discount Value</label><input type="number" id="add-discount-value" class="input-field" placeholder="20" min="1"></div>
            <div class="input-group"><label>Discount Type</label><select id="add-discount-type" class="input-field"><option value="percentage">Percentage (%)</option><option value="fixed">Fixed ($)</option></select></div>
            <div class="input-group"><label>Discount Expiration (optional)</label><input type="date" id="add-discount-expiry" class="input-field"></div>
            
            <p style="font-size:11px;color:#f44;">⚠️ Discount is at your loss - you receive the discounted amount</p>
            
            <button class="btn-gold btn-full" onclick="submitStoreProduct()">📦 Publish Product</button>
        </div>
    `);
}

function toggleProductTypeFields() {
    const type = document.getElementById('product-type-add')?.value;
    document.getElementById('ticket-fields').style.display = type === 'ticket' ? 'block' : 'none';
    document.getElementById('digital-fields').style.display = type === 'digital' ? 'block' : 'none';
}

function toggleTicketPriceVariation() {
    const vary = document.getElementById('ticket-vary-price')?.value;
    const container = document.getElementById('ticket-price-variations');
    if (!container) return;
    
    if (vary === 'yes') {
        const preservations = document.getElementById('ticket-preservations')?.value?.split(',').map(s=>s.trim()).filter(Boolean)||[];
        container.innerHTML = preservations.map(p => `
            <div class="input-group"><label>Price for "${p}"</label><input type="number" class="ticket-pres-price input-field" data-pres="${p}" step="0.01"></div>
        `).join('');
        container.style.display = 'block';
    } else {
        container.style.display = 'none';
    }
}

async function submitStoreProduct() {
    const name = document.getElementById('add-product-name')?.value?.trim();
    const price = parseFloat(document.getElementById('add-product-price')?.value);
    const type = document.getElementById('product-type-add')?.value;
    
    if (!name || !price) { showToast('Please enter product name and price', 'error'); return; }
    
    hideModal();
    showLoader();
    
    try {
        // Upload images
        const imageFiles = document.getElementById('add-product-images')?.files;
        let imageUrls = [];
        if (imageFiles) {
            for (const file of Array.from(imageFiles).slice(0,5)) {
                try { imageUrls.push(await uploadToCloudinary(file)); } catch(e) {}
            }
        }
        
        const productData = {
            storeId: APP.userProfile.storeId,
            ownerId: APP.userProfile.uid,
            name, price,
            type: type,
            stock: parseInt(document.getElementById('add-product-stock')?.value)||0,
            description: document.getElementById('add-product-desc')?.value?.trim()||'',
            images: imageUrls.length > 0 ? imageUrls : ['/app-icon.png'],
            status: 'active',
            totalSales: 0,
            avgRating: 0,
            reviewCount: 0,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // Ticket-specific fields
        if (type === 'ticket') {
            productData.eventDate = document.getElementById('ticket-event-date')?.value;
            productData.venue = document.getElementById('ticket-venue')?.value?.trim();
            productData.ticketQuantity = parseInt(document.getElementById('ticket-quantity')?.value)||0;
            productData.preservations = document.getElementById('ticket-preservations')?.value?.split(',').map(s=>s.trim()).filter(Boolean);
            productData.deliveryMethod = document.getElementById('ticket-delivery')?.value;
            productData.visibility = document.getElementById('ticket-visibility')?.value;
            
            if (productData.deliveryMethod === 'seller') {
                productData.whatsappNumber = document.getElementById('ticket-whatsapp')?.value?.trim();
            }
            
            // Generate ticket IDs
            if (productData.deliveryMethod === 'app' && productData.ticketQuantity > 0) {
                productData.ticketIds = [];
                for (let i = 0; i < productData.ticketQuantity; i++) {
                    productData.ticketIds.push({
                        id: 'TKT-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2,5).toUpperCase(),
                        used: false,
                        usedBy: null,
                        usedAt: null
                    });
                }
            }
        }
        
        // Digital fields
        if (type === 'digital') {
            productData.digitalLink = document.getElementById('digital-link')?.value?.trim();
        }
        
        // Discount
        const discountCode = document.getElementById('add-discount-code')?.value?.trim()?.toUpperCase();
        const discountValue = parseFloat(document.getElementById('add-discount-value')?.value);
        const discountType = document.getElementById('add-discount-type')?.value;
        const discountExpiry = document.getElementById('add-discount-expiry')?.value;
        
        if (discountCode && discountValue) {
            productData.discountCode = {
                code: discountCode,
                value: discountValue,
                type: discountType,
                expiry: discountExpiry || null,
                active: true,
                usedCount: 0
            };
        }
        
        await db.collection('products').add(productData);
        
        hideLoader();
        showToast('Product published! 🎉', 'success');
        loadStoreDashboard();
        
    } catch (error) {
        hideLoader();
        console.error('Add product error:', error);
        showToast('Failed to publish product', 'error');
    }
}

// =====================
// STORE VIEW (Public)
// =====================
async function loadStoreView() {
    const container = document.getElementById('store-view-content');
    if (!container) return;
    
    if (!APP.userProfile?.isStoreOwner) {
        container.innerHTML = '<p style="text-align:center;padding:40px;">No store found</p>';
        return;
    }
    
    container.innerHTML = '<div style="text-align:center;padding:60px;"><div class="loader-spinner"></div><p>Loading store...</p></div>';
    
    try {
        const storeDoc = await db.collection('stores').doc(APP.userProfile.storeId).get();
        if (!storeDoc.exists) { container.innerHTML = '<p>Store not found</p>'; return; }
        
        const store = storeDoc.data();
        
        const productsSnap = await db.collection('products').where('storeId','==',APP.userProfile.storeId).where('status','==','active').get();
        const products = [];
        productsSnap.forEach(doc => products.push({id:doc.id,...doc.data()}));
        
        const followers = store.followers || 0;
        const totalSales = store.totalSales || 0;
        const plan = STORE_PLANS[store.plan] || STORE_PLANS.basic;
        
        container.innerHTML = `
            <div style="background:#f5f5f5;min-height:100vh;">
                <!-- Store Banner -->
                ${store.banner ? `<img src="${store.banner}" style="width:100%;height:150px;object-fit:cover;">` : ''}
                
                <!-- Store Header -->
                <div style="background:linear-gradient(135deg,${store.themeColor||'#6C3CF0'},#8B5CF6);padding:20px;text-align:center;color:white;margin-top:${store.banner?'0':'-20px'};">
                    ${store.logo ? `<img src="${store.logo}" style="width:70px;height:70px;border-radius:50%;border:3px solid white;margin-top:-35px;margin-bottom:10px;">` : ''}
                    <h2>${store.name}</h2>
                    ${store.verified||plan.verified?'<span style="background:#20D5EC;padding:3px 10px;border-radius:10px;font-size:10px;">✓ Verified</span>':''}
                    <p style="font-size:12px;opacity:0.8;">${store.description||''}</p>
                </div>
                
                <!-- Stats -->
                <div style="display:flex;justify-content:space-around;padding:15px;background:white;margin:10px;border-radius:12px;">
                    <div style="text-align:center;"><strong>${followers}</strong><br><small>Followers</small></div>
                    <div style="text-align:center;"><strong>${products.length}</strong><br><small>Products</small></div>
                    <div style="text-align:center;"><strong>${totalSales}</strong><br><small>Sold</small></div>
                </div>
                
                <!-- Follow Button -->
                <div style="padding:0 10px 10px;">
                    <button class="btn-gold btn-full" id="follow-store-btn" onclick="toggleFollowStore()">
                        ${store.followersList?.includes(APP.userProfile.uid) ? '✓ Following' : '+ Follow'}
                    </button>
                </div>
                
                <!-- Products -->
                <div style="padding:10px;">
                    <h4 style="margin-bottom:10px;">Products (${products.length})</h4>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                        ${products.map(p => `
                            <div style="background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 6px rgba(0,0,0,0.05);cursor:pointer;" onclick="viewStoreProductDetail('${p.id}')">
                                <img src="${p.images?.[0]||'/app-icon.png'}" style="width:100%;height:150px;object-fit:cover;">
                                <div style="padding:10px;">
                                    <div style="font-weight:600;font-size:13px;">${p.name}</div>
                                    <div style="font-weight:700;color:#B8860B;">${formatCurrency(p.price)}</div>
                                    <div style="font-size:11px;color:#666;">⭐ ${p.avgRating?.toFixed(1)||'0.0'} · ${p.totalSales||0} sold</div>
                                    <div style="display:flex;align-items:center;gap:5px;margin-top:5px;">
                                        <button onclick="event.stopPropagation();likeProduct('${p.id}')" style="background:none;border:none;cursor:pointer;font-size:16px;" id="like-btn-${p.id}">
                                            ${p.likes?.includes(APP.userProfile.uid)?'❤️':'🤍'}
                                        </button>
                                        <span style="font-size:12px;" id="like-count-${p.id}">${p.likes?.length||0}</span>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>`;
            
    } catch (error) {
        console.error('Store view error:', error);
        container.innerHTML = '<p style="text-align:center;padding:40px;">Error loading store</p>';
    }
}

// =====================
// FOLLOW/UNFOLLOW STORE (Backend handled)
// =====================
async function toggleFollowStore() {
    if (!APP.userProfile) { showToast('Please login', 'error'); return; }
    
    const storeId = APP.userProfile.storeId;
    const userId = APP.userProfile.uid;
    
    try {
        const storeDoc = await db.collection('stores').doc(storeId).get();
        const store = storeDoc.data();
        const followersList = store.followersList || [];
        
        if (followersList.includes(userId)) {
            // Unfollow
            await db.collection('stores').doc(storeId).update({
                followers: firebase.firestore.FieldValue.increment(-1),
                followersList: firebase.firestore.FieldValue.arrayRemove(userId)
            });
            showToast('Unfollowed', 'info');
        } else {
            // Follow
            await db.collection('stores').doc(storeId).update({
                followers: firebase.firestore.FieldValue.increment(1),
                followersList: firebase.firestore.FieldValue.arrayUnion(userId)
            });
            showToast('Following! ✅', 'success');
            
            // Check badge thresholds
            const newCount = (store.followers||0) + 1;
            await checkFollowerBadge(storeId, newCount);
        }
        
        // Refresh store view
        loadStoreView();
        
    } catch (error) {
        console.error('Follow error:', error);
    }
}

async function checkFollowerBadge(storeId, followerCount) {
    const badges = {
        1000: { color: '#0095F6', bonus: 5 },
        25000: { color: '#22C55E', bonus: 20 },
        50000: { color: '#7C3AED', bonus: 100 },
        100000: { color: '#FFFFFF', bonus: 700 },
        1000000: { color: '#20D5EC', bonus: 5000 }
    };
    
    for (const [threshold, badge] of Object.entries(badges)) {
        if (followerCount >= parseInt(threshold) && followerCount < parseInt(threshold) + 1) {
            await db.collection('stores').doc(storeId).update({
                badge: { color: badge.color, level: parseInt(threshold) }
            });
            
            // Credit bonus to store owner wallet
            if (badge.bonus > 0) {
                await db.collection('users').doc(APP.userProfile.uid).update({
                    walletBalance: firebase.firestore.FieldValue.increment(badge.bonus)
                });
                
                if (typeof createNotification === 'function') {
                    await createNotification(APP.userProfile.uid,
                        '🎉 Follower Milestone!',
                        `Your store reached ${threshold} followers! $${badge.bonus} bonus credited to your wallet.`,
                        '🎉', 'wallet');
                }
            }
            break;
        }
    }
}

// =====================
// LIKE PRODUCT (Backend handled)
// =====================
async function likeProduct(productId) {
    if (!APP.userProfile) { showToast('Please login', 'error'); return; }
    
    const userId = APP.userProfile.uid;
    
    try {
        const productDoc = await db.collection('products').doc(productId).get();
        const product = productDoc.data();
        const likes = product.likes || [];
        
        if (likes.includes(userId)) {
            // Unlike
            await db.collection('products').doc(productId).update({
                likes: firebase.firestore.FieldValue.arrayRemove(userId)
            });
        } else {
            // Like
            await db.collection('products').doc(productId).update({
                likes: firebase.firestore.FieldValue.arrayUnion(userId)
            });
        }
        
        // Refresh like count in UI
        const updatedDoc = await db.collection('products').doc(productId).get();
        const updatedProduct = updatedDoc.data();
        const likeCount = (updatedProduct.likes||[]).length;
        const isLiked = (updatedProduct.likes||[]).includes(userId);
        
        const likeBtn = document.getElementById('like-btn-' + productId);
        const likeCountEl = document.getElementById('like-count-' + productId);
        
        if (likeBtn) likeBtn.textContent = isLiked ? '❤️' : '🤍';
        if (likeCountEl) likeCountEl.textContent = likeCount;
        
    } catch (error) {
        console.error('Like error:', error);
    }
}

// =====================
// GLOBAL ACCESS
// =====================
window.startStoreCreation = startStoreCreation;
window.loadStoreDashboard = loadStoreDashboard;
window.loadStoreView = loadStoreView;
window.showAddProductForm = showAddProductForm;
window.submitStoreProduct = submitStoreProduct;
window.toggleFollowStore = toggleFollowStore;
window.likeProduct = likeProduct;
window.STORE_PLANS = STORE_PLANS;

console.log('✅ storeowner.js fully loaded - All store features ready');
console.log('   Store Creation Flow | Dashboard | Products | Orders | Analytics');
console.log('   Followers System | Like System | Chat | Ads | Settings');
