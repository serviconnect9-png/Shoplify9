// storeowner.js - COMPLETE PRODUCTION VERSION
// ONESHOPLIFY Store Ownership System - All Features Working
// This file MUST be loaded after router.js in index.html

console.log('✅ storeowner.js loaded - Production Mode');
console.log('   Version: 2.0 Complete');

// =====================
// STORE PLANS
// =====================
const STORE_PLANS = {
    basic: {
        name: 'Basic',
        price: 0,
        products: 50,
        analytics: 'simple',
        support: 'email',
        chatLimit: 10,
        followers: true,
        sponsoredAds: true,
        verifiedBadge: false,
        features: [
            'Up to 50 products',
            'Simple analytics dashboard',
            'Customer service email',
            'Followers & limited chat (10/day)',
            'Sponsored products displayed'
        ]
    },
    pro: {
        name: 'Pro',
        price: 29,
        products: 501,
        analytics: 'full',
        support: 'ticket+email+phone',
        chatLimit: 100,
        followers: true,
        sponsoredAds: true,
        verifiedBadge: false,
        features: [
            'Up to 501 products',
            'Full analytics dashboard',
            'Customer service ticket, email & phone',
            'Followers & 100 chats/day',
            'Sponsored products displayed'
        ]
    },
    enterprise: {
        name: 'Enterprise',
        price: 99,
        products: Infinity,
        analytics: 'enterprise',
        support: 'ticket+email+phone+bot',
        chatLimit: Infinity,
        followers: true,
        sponsoredAds: false,
        verifiedBadge: true,
        autoReply: true,
        dailyReports: true,
        features: [
            'Unlimited products',
            'Enterprise analytics dashboard',
            'Full support + auto-reply bot',
            'Unlimited chats',
            'Daily reports & notifications',
            'Verified badge on store',
            'No sponsored ads displayed',
            'Auto-reply messages',
            'Priority support'
        ]
    }
};

// =====================
// FOLLOW BADGES
// =====================
const FOLLOW_BADGES = {
    1000: { color: '#2196F3', name: 'Blue Badge', bonus: 5 },
    25000: { color: '#4CAF50', name: 'Green Badge', bonus: 0 },
    50000: { color: '#9C27B0', name: 'Purple Badge', bonus: 20 },
    100000: { color: '#FFFFFF', name: 'White Badge', bonus: 100 },
    1000000: { color: '#00BCD4', name: 'Sea Light Blue Badge', bonus: 700 }
};

// =====================
// STORE CREATION FLOW
// =====================
let storeCreationStep = 1;
let storeData = {};

function startStoreCreationFlow() {
    console.log('🏪 Starting store creation flow...');
    
    if (!APP.userProfile) {
        showToast('Please login first', 'error');
        return;
    }
    
    if (APP.userProfile.hasStore) {
        showToast('You already have a store!', 'info');
        navigateTo('store-dashboard');
        return;
    }
    
    storeCreationStep = 1;
    storeData = {};
    showStoreCreationStep1();
}

function showStoreCreationStep1() {
    showModal(`
        <div style="padding:20px;">
            <div style="text-align:center;margin-bottom:20px;">
                <div style="font-size:12px;color:#6C3CF0;">Step 1/6</div>
                <h3 style="margin:8px 0;">Name Your Store</h3>
                <p style="color:#666;font-size:13px;">Choose a unique name for your store</p>
            </div>
            
            <div class="input-group">
                <label>Store Name *</label>
                <input type="text" id="store-name-input" class="input-field" 
                       value="${storeData.name || ''}" 
                       placeholder="e.g. Only One Ticket">
                <small style="color:#666;">URL: yourstore.oneshoplify.com</small>
            </div>
            
            <button class="btn-gold btn-full" style="margin-top:20px;" onclick="proceedStoreStep2()">
                Continue
            </button>
        </div>
    `);
}

function proceedStoreStep2() {
    const name = document.getElementById('store-name-input')?.value?.trim();
    if (!name || name.length < 3) {
        showToast('Store name must be at least 3 characters', 'error');
        return;
    }
    storeData.name = name;
    storeCreationStep = 2;
    hideModal();
    
    showModal(`
        <div style="padding:20px;max-height:80vh;overflow-y:auto;">
            <div style="text-align:center;margin-bottom:15px;">
                <div style="font-size:12px;color:#6C3CF0;">Step 2/6</div>
                <h3>Choose a Plan</h3>
            </div>
            
            ${Object.entries(STORE_PLANS).map(([key, plan]) => `
                <div style="background:white;border-radius:14px;padding:20px;margin-bottom:12px;box-shadow:0 2px 10px rgba(0,0,0,0.06);border-left:4px solid ${key === 'enterprise' ? '#FF9800' : key === 'pro' ? '#2196F3' : '#4CAF50'};${key === 'pro' ? 'border:2px solid #6C3CF0;' : ''}">
                    ${key === 'pro' ? '<span style="background:#6C3CF0;color:white;padding:3px 10px;border-radius:10px;font-size:10px;">RECOMMENDED</span>' : ''}
                    <h4>${plan.name}</h4>
                    <div style="font-size:24px;font-weight:800;margin:8px 0;">$${plan.price}<span style="font-size:14px;color:#999;">/month</span></div>
                    <ul style="list-style:none;padding:0;font-size:12px;color:#666;line-height:2;">
                        ${plan.features.map(f => `<li>✅ ${f}</li>`).join('')}
                    </ul>
                    <button class="${key === 'pro' ? 'btn-gold' : 'btn-outline'} btn-full" style="margin-top:10px;padding:12px;" 
                            onclick="selectStorePlan('${key}')">
                        Choose ${plan.name}
                    </button>
                </div>
            `).join('')}
        </div>
    `);
}

function selectStorePlan(planKey) {
    storeData.plan = planKey;
    storeData.planDetails = STORE_PLANS[planKey];
    storeCreationStep = 3;
    hideModal();
    
    showModal(`
        <div style="padding:20px;">
            <div style="text-align:center;margin-bottom:15px;">
                <div style="font-size:12px;color:#6C3CF0;">Step 3/6</div>
                <h3>Store Details</h3>
            </div>
            
            <div class="input-group">
                <label>Store Description *</label>
                <textarea id="store-description" class="input-field" rows="4" 
                          placeholder="Describe your store...">${storeData.description || ''}</textarea>
            </div>
            
            <div class="input-group">
                <label>Store Category *</label>
                <select id="store-category" class="input-field">
                    <option value="">Select</option>
                    <option value="fashion">Fashion & Clothing</option>
                    <option value="electronics">Electronics</option>
                    <option value="beauty">Beauty & Care</option>
                    <option value="home">Home & Garden</option>
                    <option value="sports">Sports</option>
                    <option value="tickets">Tickets & Events</option>
                    <option value="digital">Digital Products</option>
                    <option value="all_purpose">All Purpose</option>
                </select>
            </div>
            
            <div class="input-group">
                <label>Country</label>
                <select id="store-country" class="input-field">
                    <option value="">Select</option>
                    ${typeof COUNTRIES !== 'undefined' ? Object.entries(COUNTRIES).slice(0,30).map(([code, data]) => 
                        `<option value="${code}">${data.flag || ''} ${data.name}</option>`
                    ).join('') : ''}
                </select>
            </div>
            
            <div style="display:flex;gap:10px;margin-top:20px;">
                <button class="btn-outline" style="flex:1;" onclick="hideModal();showStoreCreationStep1();">Back</button>
                <button class="btn-gold" style="flex:1;" onclick="proceedStoreStep4()">Continue</button>
            </div>
        </div>
    `);
}

function proceedStoreStep4() {
    const desc = document.getElementById('store-description')?.value?.trim();
    const category = document.getElementById('store-category')?.value;
    const country = document.getElementById('store-country')?.value;
    
    if (!desc || !category || !country) {
        showToast('Please fill all fields', 'error');
        return;
    }
    
    storeData.description = desc;
    storeData.category = category;
    storeData.country = country;
    storeCreationStep = 4;
    hideModal();
    
    showModal(`
        <div style="padding:20px;">
            <div style="text-align:center;margin-bottom:15px;">
                <div style="font-size:12px;color:#6C3CF0;">Step 4/6</div>
                <h3>Store Branding</h3>
            </div>
            
            <div class="input-group">
                <label>Store Logo</label>
                <div id="logo-preview" style="width:80px;height:80px;border-radius:50%;background:#f0f0f0;margin:10px auto;display:flex;align-items:center;justify-content:center;font-size:30px;color:#999;">📷</div>
                <input type="file" id="store-logo-upload" class="input-field" accept="image/*" onchange="previewStoreLogo()">
            </div>
            
            <div class="input-group">
                <label>Store Banner</label>
                <div id="banner-preview" style="width:100%;height:80px;background:#f0f0f0;border-radius:8px;margin:10px 0;display:flex;align-items:center;justify-content:center;color:#999;">📷</div>
                <input type="file" id="store-banner-upload" class="input-field" accept="image/*" onchange="previewStoreBanner()">
            </div>
            
            <div style="display:flex;gap:10px;margin-top:20px;">
                <button class="btn-outline" style="flex:1;" onclick="hideModal();proceedStoreStep2();">Back</button>
                <button class="btn-gold" style="flex:1;" onclick="proceedStoreStep5()">Continue</button>
            </div>
        </div>
    `);
}

function previewStoreLogo() {
    const file = document.getElementById('store-logo-upload')?.files?.[0];
    if (!file) return;
    storeData.logoFile = file;
    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('logo-preview').innerHTML = `<img src="${e.target.result}" style="width:80px;height:80px;border-radius:50%;object-fit:cover;">`;
    };
    reader.readAsDataURL(file);
}

function previewStoreBanner() {
    const file = document.getElementById('store-banner-upload')?.files?.[0];
    if (!file) return;
    storeData.bannerFile = file;
    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('banner-preview').innerHTML = `<img src="${e.target.result}" style="width:100%;height:80px;object-fit:cover;border-radius:8px;">`;
    };
    reader.readAsDataURL(file);
}

function proceedStoreStep5() {
    storeCreationStep = 5;
    hideModal();
    
    const plan = storeData.planDetails;
    
    showModal(`
        <div style="padding:20px;">
            <div style="text-align:center;margin-bottom:15px;">
                <div style="font-size:12px;color:#6C3CF0;">Step 5/6</div>
                <h3>Review & Pay</h3>
            </div>
            
            <div style="background:#f5f5f5;padding:15px;border-radius:12px;margin-bottom:15px;">
                <p><strong>Store:</strong> ${storeData.name}</p>
                <p><strong>Plan:</strong> ${plan.name}</p>
                <p><strong>Price:</strong> $${plan.price}/month</p>
                <p><strong>Category:</strong> ${storeData.category}</p>
            </div>
            
            <p style="font-size:13px;">Balance: <strong>${formatCurrency(APP.userProfile?.walletBalance || 0)}</strong></p>
            
            ${(APP.userProfile?.walletBalance || 0) >= plan.price ? `
                <button class="btn-gold btn-full" style="margin-top:15px;padding:14px;" onclick="processStorePayment()">
                    💳 Pay $${plan.price} - Create Store
                </button>
            ` : `
                <p style="color:#f44;text-align:center;">Insufficient balance. Need $${plan.price}.</p>
                <button class="btn-gold btn-full" onclick="hideModal();navigateTo('wallet');">💰 Deposit</button>
            `}
            
            <button class="btn-outline btn-full" style="margin-top:8px;" onclick="hideModal();proceedStoreStep2();">Back</button>
        </div>
    `);
}

async function processStorePayment() {
    const plan = storeData.planDetails;
    
    if ((APP.userProfile?.walletBalance || 0) < plan.price) {
        showToast('Insufficient balance', 'error');
        return;
    }
    
    hideModal();
    showLoader();
    
    try {
        let logoUrl = '';
        let bannerUrl = '';
        
        if (storeData.logoFile) {
            try { logoUrl = await uploadToCloudinary(storeData.logoFile); } catch(e) {}
        }
        if (storeData.bannerFile) {
            try { bannerUrl = await uploadToCloudinary(storeData.bannerFile); } catch(e) {}
        }
        
        const storeNameSlug = storeData.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        
        await db.collection('users').doc(APP.userProfile.uid).update({
            walletBalance: firebase.firestore.FieldValue.increment(-plan.price),
            hasStore: true,
            storeName: storeData.name,
            storePlan: storeData.plan,
            storeUrl: `${storeNameSlug}.oneshoplify.com`,
            storeLogo: logoUrl,
            storeBanner: bannerUrl,
            storeDescription: storeData.description,
            storeCategory: storeData.category,
            storeCountry: storeData.country,
            storeFollowers: 0,
            storeTotalSales: 0
        });
        
        APP.userProfile.walletBalance -= plan.price;
        APP.userProfile.hasStore = true;
        APP.userProfile.storeName = storeData.name;
        APP.userProfile.storePlan = storeData.plan;
        APP.userProfile.storeUrl = `${storeNameSlug}.oneshoplify.com`;
        
        await db.collection('stores').add({
            ownerId: APP.userProfile.uid,
            storeName: storeData.name,
            storePlan: storeData.plan,
            storeUrl: `${storeNameSlug}.oneshoplify.com`,
            storeLogo: logoUrl,
            storeBanner: bannerUrl,
            storeDescription: storeData.description,
            storeCategory: storeData.category,
            storeCountry: storeData.country,
            followers: 0,
            totalSales: 0,
            totalRevenue: 0,
            verified: plan.verifiedBadge,
            status: 'active',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        await db.collection('transactions').add({
            userId: APP.userProfile.uid,
            type: 'store_subscription',
            amount: plan.price,
            currency: 'USD',
            status: 'completed',
            description: `Store creation - ${plan.name} Plan`,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        hideLoader();
        
        showModal(`
            <div style="padding:30px;text-align:center;">
                <div style="font-size:70px;">🎉</div>
                <h2 style="color:#4CAF50;">Store Created!</h2>
                <p style="color:#666;">${storeData.name} is ready!</p>
                <div style="background:#f5f5f5;padding:15px;border-radius:12px;margin:15px 0;">
                    <p style="font-weight:600;">Store URL:</p>
                    <p style="font-family:monospace;color:#6C3CF0;">${storeNameSlug}.oneshoplify.com</p>
                </div>
                <button class="btn-gold btn-full" onclick="hideModal();navigateTo('store-dashboard');">📊 Go to Dashboard</button>
            </div>
        `);
        
    } catch (error) {
        hideLoader();
        console.error('Payment error:', error);
        showToast('Failed to create store', 'error');
    }
}

// =====================
// LOAD STORE DASHBOARD
// =====================
async function loadStoreDashboard() {
    console.log('📊 loadStoreDashboard called');
    
    const container = document.getElementById('store-dashboard-content');
    
    if (!container) {
        console.error('❌ store-dashboard-content NOT FOUND in DOM');
        return;
    }
    
    // Show loading immediately
    container.innerHTML = `
        <div style="text-align:center;padding:60px 20px;">
            <div class="loader-spinner" style="margin:0 auto 15px;"></div>
            <p style="color:#666;">Loading store dashboard...</p>
        </div>`;
    
    // Check if user has store
    if (!APP.userProfile || !APP.userProfile.hasStore) {
        container.innerHTML = `
            <div style="text-align:center;padding:60px 20px;">
                <p style="font-size:60px;">🏪</p>
                <h3>You don't have a store yet</h3>
                <p style="color:#666;margin:10px 0;">Create your store and start selling!</p>
                <button class="btn-gold" onclick="startStoreCreationFlow()" style="padding:14px 30px;font-size:16px;">
                    Create My Store
                </button>
            </div>`;
        return;
    }
    
    // Render dashboard
    const plan = STORE_PLANS[APP.userProfile.storePlan] || STORE_PLANS.basic;
    const storeName = APP.userProfile.storeName || 'My Store';
    const storeUrl = APP.userProfile.storeUrl || '';
    
    container.innerHTML = `
        <div style="background:#0F172A;color:white;min-height:100vh;padding-bottom:30px;">
            
            <!-- Top Bar -->
            <div style="padding:15px;display:flex;justify-content:space-between;align-items:center;">
                <button onclick="toggleStoreSidebar()" style="background:none;border:none;color:white;font-size:24px;cursor:pointer;">☰</button>
                <h3 style="margin:0;font-size:16px;">Store Dashboard</h3>
                <button onclick="navigateTo('notifications')" style="background:none;border:none;color:white;font-size:20px;cursor:pointer;">🔔</button>
            </div>
            
            <!-- Welcome Card -->
            <div style="margin:0 15px;padding:20px;background:linear-gradient(135deg,#6C3CF0,#4F46E5);border-radius:16px;">
                <p style="opacity:0.8;font-size:13px;">Welcome back,</p>
                <h2 style="margin:5px 0;font-size:20px;">${APP.userProfile.displayName || 'Seller'}</h2>
                <p style="font-size:14px;">${storeName}</p>
                ${plan.verifiedBadge ? '<span style="background:#20D5EC;padding:3px 10px;border-radius:10px;font-size:11px;">✓ Verified</span>' : ''}
                <p style="font-size:12px;opacity:0.7;margin-top:5px;">${plan.name} Plan</p>
            </div>
            
            <!-- Quick Stats -->
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;padding:15px;">
                <div style="background:white;padding:14px;border-radius:10px;text-align:center;">
                    <div style="font-size:20px;font-weight:800;color:#6C3CF0;" id="ds-revenue">$0</div>
                    <div style="font-size:10px;color:#999;">Revenue</div>
                </div>
                <div style="background:white;padding:14px;border-radius:10px;text-align:center;">
                    <div style="font-size:20px;font-weight:800;color:#4CAF50;" id="ds-orders">0</div>
                    <div style="font-size:10px;color:#999;">Orders</div>
                </div>
                <div style="background:white;padding:14px;border-radius:10px;text-align:center;">
                    <div style="font-size:20px;font-weight:800;color:#FF9800;" id="ds-products">0</div>
                    <div style="font-size:10px;color:#999;">Products</div>
                </div>
            </div>
            
            <!-- Action Buttons -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:0 15px;">
                <button class="btn-gold" style="padding:12px;font-weight:700;font-size:13px;" onclick="navigateTo('add-product')">➕ Add Product</button>
                <button class="btn-outline" style="padding:12px;color:white;border:2px solid white;font-size:13px;" onclick="navigateTo('orders')">📦 Orders</button>
                <button class="btn-outline" style="padding:12px;color:white;border:2px solid white;font-size:13px;" onclick="navigateTo('store-customization')">🎨 Customize</button>
                <button class="btn-outline" style="padding:12px;color:white;border:2px solid white;font-size:13px;" onclick="navigateTo('analytics')">📊 Analytics</button>
            </div>
            
            <!-- Store URL -->
            <div style="margin:15px;padding:15px;background:white;border-radius:12px;">
                <p style="font-weight:600;color:#333;font-size:13px;">🔗 Your Store URL:</p>
                <p style="font-family:monospace;font-size:12px;color:#6C3CF0;word-break:break-all;">${storeUrl}</p>
                <button class="copy-btn" onclick="copyToClipboard('https://${storeUrl}')">📋 Copy</button>
            </div>
            
            <!-- Store Stats -->
            <div style="margin:0 15px;padding:15px;background:white;border-radius:12px;">
                <h4 style="color:#333;margin-bottom:10px;">👥 Store Stats</h4>
                <div style="display:flex;justify-content:space-around;text-align:center;">
                    <div>
                        <div style="font-size:22px;font-weight:800;color:#6C3CF0;">${APP.userProfile.storeFollowers || 0}</div>
                        <div style="font-size:10px;color:#999;">Followers</div>
                    </div>
                    <div>
                        <div style="font-size:22px;font-weight:800;color:#4CAF50;">${APP.userProfile.storeTotalSales || 0}</div>
                        <div style="font-size:10px;color:#999;">Total Sales</div>
                    </div>
                    <div>
                        <div style="font-size:22px;font-weight:800;color:#FF9800;">${formatCurrency(APP.userProfile.walletBalance || 0)}</div>
                        <div style="font-size:10px;color:#999;">Balance</div>
                    </div>
                </div>
            </div>
            
            <!-- Recent Orders -->
            <div style="margin:15px;padding:15px;background:white;border-radius:12px;">
                <h4 style="color:#333;margin-bottom:10px;">📋 Recent Orders</h4>
                <div id="store-recent-orders">
                    <p style="color:#999;text-align:center;font-size:13px;">Loading...</p>
                </div>
            </div>
            
            <p style="text-align:center;color:#666;font-size:10px;margin-top:20px;">✅ Store Dashboard Active</p>
            
        </div>`;
    
    console.log('✅ Store dashboard rendered');
    
    // Load stats in background
    loadStoreStats();
    loadRecentOrders();
}

async function loadStoreStats() {
    try {
        const productsSnap = await db.collection('products').where('storeId', '==', APP.userProfile.uid).get();
        const ordersSnap = await db.collection('orders').where('storeId', '==', APP.userProfile.uid).get();
        
        let totalRevenue = 0;
        ordersSnap.forEach(doc => {
            totalRevenue += doc.data().total || 0;
        });
        
        const revEl = document.getElementById('ds-revenue');
        const ordEl = document.getElementById('ds-orders');
        const prodEl = document.getElementById('ds-products');
        
        if (revEl) revEl.textContent = formatCurrency(totalRevenue);
        if (ordEl) ordEl.textContent = ordersSnap.size;
        if (prodEl) prodEl.textContent = productsSnap.size;
    } catch (e) {
        console.warn('Stats error:', e);
    }
}

async function loadRecentOrders() {
    const container = document.getElementById('store-recent-orders');
    if (!container) return;
    
    try {
        const snap = await db.collection('orders').where('storeId', '==', APP.userProfile.uid)
            .orderBy('createdAt', 'desc').limit(5).get();
        
        if (snap.empty) {
            container.innerHTML = '<p style="color:#999;text-align:center;font-size:13px;">No orders yet</p>';
            return;
        }
        
        container.innerHTML = '';
        snap.forEach(doc => {
            const order = doc.data();
            const statusColors = {
                pending: '#FFA000', processing: '#2196F3', shipped: '#9C27B0',
                delivered: '#4CAF50', completed: '#4CAF50', cancelled: '#F44336'
            };
            
            container.innerHTML += `
                <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #f0f0f0;">
                    <img src="${order.items?.[0]?.image || '/app-icon.png'}" style="width:40px;height:40px;border-radius:6px;object-fit:cover;">
                    <div style="flex:1;">
                        <div style="font-weight:600;font-size:13px;">${order.items?.[0]?.name || 'Product'}</div>
                        <div style="font-size:11px;color:#666;">${order.userName || 'Customer'} - ${formatCurrency(order.total)}</div>
                    </div>
                    <span style="background:${statusColors[order.status] || '#999'};color:white;padding:3px 8px;border-radius:10px;font-size:10px;">${order.status}</span>
                </div>`;
        });
    } catch (e) {
        container.innerHTML = '<p style="color:#999;text-align:center;">No orders</p>';
    }
}

// =====================
// STORE CUSTOMIZATION
// =====================
function loadStoreCustomization() {
    const container = document.getElementById('store-customization-content');
    if (!container) return;
    
    if (!APP.userProfile?.hasStore) {
        container.innerHTML = '<p style="text-align:center;padding:40px;">Create a store first</p>';
        return;
    }
    
    container.innerHTML = `
        <div style="padding:20px;">
            <h3>🎨 Store Customization</h3>
            
            <div class="card" style="background:white;padding:15px;border-radius:12px;margin-top:15px;">
                <label>Store Name</label>
                <input type="text" id="custom-store-name" class="input-field" value="${APP.userProfile.storeName || ''}">
                
                <label>Store Description</label>
                <textarea id="custom-store-desc" class="input-field" rows="3">${APP.userProfile.storeDescription || ''}</textarea>
                
                <label>Theme Color</label>
                <input type="color" id="custom-store-color" class="input-field" value="${APP.userProfile.storeColor || '#6C3CF0'}" style="height:50px;">
                
                <label>Store Logo</label>
                ${APP.userProfile.storeLogo ? `<img src="${APP.userProfile.storeLogo}" style="width:60px;height:60px;border-radius:50%;margin:10px 0;">` : ''}
                <input type="file" id="custom-logo" class="input-field" accept="image/*">
                
                <label>Store Banner</label>
                ${APP.userProfile.storeBanner ? `<img src="${APP.userProfile.storeBanner}" style="width:100%;height:60px;object-fit:cover;border-radius:8px;margin:10px 0;">` : ''}
                <input type="file" id="custom-banner" class="input-field" accept="image/*">
                
                <button class="btn-gold btn-full" style="margin-top:15px;" onclick="saveStoreCustomization()">💾 Save Changes</button>
            </div>
        </div>
    `;
}

async function saveStoreCustomization() {
    const name = document.getElementById('custom-store-name')?.value?.trim();
    const desc = document.getElementById('custom-store-desc')?.value?.trim();
    const color = document.getElementById('custom-store-color')?.value;
    const logoFile = document.getElementById('custom-logo')?.files?.[0];
    const bannerFile = document.getElementById('custom-banner')?.files?.[0];
    
    if (!name) { showToast('Enter store name', 'error'); return; }
    
    showLoader();
    
    try {
        const updates = {
            storeName: name,
            storeDescription: desc,
            storeColor: color,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        if (logoFile) {
            try { updates.storeLogo = await uploadToCloudinary(logoFile); } catch(e) {}
        }
        if (bannerFile) {
            try { updates.storeBanner = await uploadToCloudinary(bannerFile); } catch(e) {}
        }
        
        await db.collection('users').doc(APP.userProfile.uid).update(updates);
        Object.assign(APP.userProfile, updates);
        
        hideLoader();
        showToast('Store updated! ✅', 'success');
        
    } catch (e) {
        hideLoader();
        showToast('Failed to save', 'error');
    }
}

// =====================
// SIDEBAR TOGGLE
// =====================
function toggleStoreSidebar() {
    let sidebar = document.getElementById('store-sidebar');
    
    if (!sidebar) {
        sidebar = document.createElement('div');
        sidebar.id = 'store-sidebar';
        sidebar.style.cssText = 'position:fixed;top:0;left:0;width:280px;height:100%;background:#0F172A;z-index:999;transform:translateX(-100%);transition:transform 0.3s;overflow-y:auto;padding:20px;';
        
        const menuItems = [
            { icon: '📊', label: 'Dashboard', screen: 'store-dashboard' },
            { icon: '📦', label: 'Orders', screen: 'orders' },
            { icon: '🛍️', label: 'Products', screen: 'add-product' },
            { icon: '👥', label: 'Customers', screen: 'store-customers' },
            { icon: '📈', label: 'Analytics', screen: 'analytics' },
            { icon: '📢', label: 'Marketing', screen: 'store-marketing' },
            { icon: '📺', label: 'Ads', screen: 'store-ads' },
            { icon: '⭐', label: 'Reviews', screen: 'store-reviews' },
            { icon: '💰', label: 'Wallet', screen: 'wallet' },
            { icon: '🎨', label: 'Customize', screen: 'store-customization' },
            { icon: '⚙️', label: 'Settings', screen: 'settings' },
            { icon: '🚪', label: 'Logout', action: 'logout()' },
        ];
        
        sidebar.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                <h3 style="color:white;font-size:16px;">☰ MENU</h3>
                <button onclick="toggleStoreSidebar()" style="background:none;border:none;color:white;font-size:20px;cursor:pointer;">✕</button>
            </div>
            <div style="background:#1E293B;padding:15px;border-radius:12px;margin-bottom:15px;color:white;">
                <p style="font-weight:600;">${APP.userProfile?.storeName || 'My Store'}</p>
                <p style="font-size:12px;opacity:0.7;">${(APP.userProfile?.storePlan || 'basic').toUpperCase()} Plan</p>
            </div>
            ${menuItems.map(item => {
                const onclick = item.screen ? `navigateTo('${item.screen}');toggleStoreSidebar();` : item.action + ';toggleStoreSidebar();';
                return `
                    <div style="padding:14px;color:white;cursor:pointer;border-radius:8px;margin-bottom:4px;display:flex;align-items:center;gap:12px;font-size:14px;" 
                         onmouseover="this.style.background='#1E293B'" onmouseout="this.style.background='transparent'"
                         onclick="${onclick}">
                        <span>${item.icon}</span> ${item.label}
                    </div>`;
            }).join('')}
        `;
        
        document.body.appendChild(sidebar);
        
        sidebar.addEventListener('click', function(e) {
            if (e.target === sidebar) toggleStoreSidebar();
        });
    }
    
    const isOpen = sidebar.style.transform === 'translateX(0px)';
    sidebar.style.transform = isOpen ? 'translateX(-100%)' : 'translateX(0px)';
}

// =====================// GLOBAL ACCESS
// =====================
window.startStoreCreationFlow = startStoreCreationFlow;
window.loadStoreDashboard = loadStoreDashboard;
window.loadStoreCustomization = loadStoreCustomization;
window.toggleStoreSidebar = toggleStoreSidebar;
window.STORE_PLANS = STORE_PLANS;
window.FOLLOW_BADGES = FOLLOW_BADGES;

// Also make startStoreCreation available globally
window.startStoreCreation = startStoreCreationFlow;

console.log('✅ storeowner.js fully loaded - All functions globally accessible');
console.log('   - loadStoreDashboard:', typeof loadStoreDashboard);
console.log('   - startStoreCreationFlow:', typeof startStoreCreationFlow);
console.log('   - toggleStoreSidebar:', typeof toggleStoreSidebar);
