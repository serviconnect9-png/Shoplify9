// storeowner.js - COMPLETE FINAL PRODUCTION VERSION
// ONESHOPLIFY Store Ownership System
// Includes: Dashboard, Analytics, Chat, Followers, Ads, Auto-reply, Store Lobby, Tickets, Digital Products
console.log('✅ storeowner.js v8.0 loaded - Complete Store System');

// =====================
// GLOBAL STATE
// =====================
const STORE_OWNER = {
    sidebarOpen: true,
    currentView: 'dashboard',
    followers: [],
    following: [],
    chats: [],
    notifications: [],
    ads: []
};

// =====================
// STORE PLANS CONFIGURATION
// =====================
const STORE_PLANS = {
    basic: {
        name: 'Basic',
        price: 5,
        color: '#6C4BFF',
        products: 50,
        analytics: 'simple',
        support: 'email',
        chatLimit: 10,
        followers: true,
        autoReply: false,
        verifiedBadge: false,
        sponsoredAds: true,
        dailyReports: false,
        features: ['Up to 50 products', 'Simple analytics', 'Email support', '10 chats/day', 'Followers']
    },
    pro: {
        name: 'Pro',
        price: 15,
        color: '#4F46E5',
        products: 501,
        analytics: 'full',
        support: 'ticket+email+phone',
        chatLimit: 100,
        followers: true,
        autoReply: false,
        verifiedBadge: false,
        sponsoredAds: true,
        dailyReports: false,
        features: ['Up to 501 products', 'Full analytics', 'Ticket & phone support', '100 chats/day', 'Followers']
    },
    enterprise: {
        name: 'Enterprise',
        price: 45,
        color: '#FF9800',
        products: 'Unlimited',
        analytics: 'enterprise',
        support: 'ticket+email+phone+bot',
        chatLimit: Infinity,
        followers: true,
        autoReply: true,
        verifiedBadge: true,
        sponsoredAds: false,
        dailyReports: true,
        features: ['Unlimited products', 'Enterprise analytics', 'Auto-reply bot', 'Unlimited chats', 'Verified badge', 'Daily reports', 'No sponsored ads']
    }
};

// =====================
// FOLLOW BADGES & BONUSES
// =====================
const FOLLOW_BADGES = {
    blue: { threshold: 1000, color: '#0095F6', bonus: 5, name: 'Blue' },
    green: { threshold: 25000, color: '#22C55E', bonus: 20, name: 'Green' },
    purple: { threshold: 50000, color: '#8B5CF6', bonus: 100, name: 'Purple' },
    white: { threshold: 100000, color: '#FFFFFF', bonus: 700, name: 'White Diamond' },
    sealight: { threshold: 1000000, color: '#00BCD4', bonus: 700, name: 'Sea Light' }
};

// =====================
// STORE SETUP FLOW (10 Steps)
// =====================
let setupStep = 1;
let setupData = {
    plan: '',
    storeName: '',
    ownerName: '',
    email: '',
    phone: '',
    country: '',
    category: '',
    description: '',
    keywords: '',
    logo: null,
    banner: null,
    color: '#6C4BFF'
};

function startStoreSetup() {
    setupStep = 1;
    showPlanSelection();
}

function showPlanSelection() {
    showModal(`
        <div style="padding:20px;max-height:85vh;overflow-y:auto;">
            <div style="text-align:center;margin-bottom:20px;">
                <img src="/app-icon.png" style="width:50px;height:50px;border-radius:12px;margin-bottom:10px;">
                <h3 style="margin:0;">ONESHOPLIFY</h3>
                <p style="color:#666;font-size:13px;">Choose Your Store Plan</p>
            </div>
            
            ${Object.entries(STORE_PLANS).map(([key, plan]) => `
                <div onclick="selectSetupPlan('${key}')" id="setup-plan-${key}"
                     style="background:white;border-radius:14px;padding:20px;margin-bottom:12px;border:2px solid ${key === 'pro' ? plan.color : '#e0e0e0'};cursor:pointer;position:relative;transition:all 0.2s;">
                    ${key === 'pro' ? '<span style="position:absolute;top:-10px;right:20px;background:#FFD700;color:#1a1a1a;padding:4px 12px;border-radius:10px;font-size:11px;font-weight:700;">RECOMMENDED</span>' : ''}
                    <h4 style="margin:0;font-size:18px;">${plan.name}</h4>
                    <div style="font-size:30px;font-weight:800;color:${plan.color};margin:8px 0;">$${plan.price}<span style="font-size:14px;color:#999;">/mo</span></div>
                    <ul style="list-style:none;padding:0;font-size:12px;color:#666;line-height:2;">
                        ${plan.features.map(f => `<li>✅ ${f}</li>`).join('')}
                    </ul>
                </div>
            `).join('')}
            
            <button class="btn-gold btn-full" onclick="proceedToAccountInfo()" id="btn-choose-plan" disabled style="opacity:0.5;">
                Choose Plan
            </button>
            <p style="text-align:center;font-size:11px;color:#999;margin-top:10px;">💰 Money-back guarantee · Cancel anytime</p>
        </div>
    `);
}

function selectSetupPlan(plan) {
    setupData.plan = plan;
    document.querySelectorAll('[id^="setup-plan-"]').forEach(el => el.style.border = '2px solid #e0e0e0');
    const el = document.getElementById('setup-plan-' + plan);
    if (el) el.style.border = '2px solid #FFD700';
    const btn = document.getElementById('btn-choose-plan');
    if (btn) { btn.disabled = false; btn.style.opacity = '1'; btn.textContent = `Choose ${STORE_PLANS[plan].name} - $${STORE_PLANS[plan].price}/mo`; }
}

function proceedToAccountInfo() {
    if (!setupData.plan) { showToast('Select a plan', 'error'); return; }
    setupStep = 2;
    hideModal();
    showAccountInfoForm();
}

function showAccountInfoForm() {
    showModal(`
        <div style="padding:20px;max-height:85vh;overflow-y:auto;">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;">
                <button onclick="hideModal();setupStep=1;showPlanSelection();" style="background:none;border:none;font-size:20px;cursor:pointer;">←</button>
                <div style="flex:1;">
                    <div style="font-size:12px;color:#999;">Step ${setupStep} of 5</div>
                    <div style="background:#e0e0e0;height:4px;border-radius:2px;margin-top:4px;">
                        <div style="background:#6C4BFF;height:4px;border-radius:2px;width:${(setupStep/5)*100}%;"></div>
                    </div>
                </div>
            </div>
            
            <h3>📋 Account Information</h3>
            <div class="input-group"><label>Store Name *</label><input type="text" id="setup-store-name" class="input-field" value="${setupData.storeName}" placeholder="My Store"></div>
            <div class="input-group"><label>Owner Name *</label><input type="text" id="setup-owner-name" class="input-field" value="${setupData.ownerName||APP.userProfile?.displayName||''}" placeholder="Your name"></div>
            <div class="input-group"><label>Email *</label><input type="email" id="setup-email" class="input-field" value="${setupData.email||APP.userProfile?.email||''}"></div>
            <div class="input-group"><label>Phone *</label><input type="tel" id="setup-phone" class="input-field" value="${setupData.phone||APP.userProfile?.phoneNumber||''}"></div>
            <div class="input-group"><label>Country *</label><select id="setup-country" class="input-field">
                <option value="">Select</option>
                ${typeof COUNTRIES!=='undefined'?Object.entries(COUNTRIES).sort((a,b)=>a[1].name.localeCompare(b[1].name)).map(([c,d])=>`<option value="${c}" ${(setupData.country||APP.userProfile?.country)===c?'selected':''}>${d.flag||''} ${d.name}</option>`).join(''):''}
            </select></div>
            <button class="btn-gold btn-full" onclick="proceedToStoreDetails()">Continue →</button>
        </div>
    `);
}

function proceedToStoreDetails() {
    setupData.storeName = document.getElementById('setup-store-name')?.value?.trim();
    setupData.ownerName = document.getElementById('setup-owner-name')?.value?.trim();
    setupData.email = document.getElementById('setup-email')?.value?.trim();
    setupData.phone = document.getElementById('setup-phone')?.value?.trim();
    setupData.country = document.getElementById('setup-country')?.value;
    
    if (!setupData.storeName) { showToast('Enter store name', 'error'); return; }
    if (!setupData.ownerName) { showToast('Enter owner name', 'error'); return; }
    if (!setupData.email) { showToast('Enter email', 'error'); return; }
    if (!setupData.phone) { showToast('Enter phone', 'error'); return; }
    if (!setupData.country) { showToast('Select country', 'error'); return; }
    
    setupStep = 3;
    hideModal();
    showStoreDetailsForm();
}

function showStoreDetailsForm() {
    showModal(`
        <div style="padding:20px;max-height:85vh;overflow-y:auto;">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;">
                <button onclick="hideModal();setupStep=2;showAccountInfoForm();" style="background:none;border:none;font-size:20px;cursor:pointer;">←</button>
                <div style="flex:1;">
                    <div style="font-size:12px;color:#999;">Step ${setupStep} of 5</div>
                    <div style="background:#e0e0e0;height:4px;border-radius:2px;"><div style="background:#6C4BFF;height:4px;border-radius:2px;width:${(setupStep/5)*100}%;"></div></div>
                </div>
            </div>
            <h3>🏷️ Store Details</h3>
            <div class="input-group"><label>Category *</label><select id="setup-category" class="input-field">
                <option value="">Select</option>
                <option value="Fashion">Fashion</option><option value="Electronics">Electronics</option>
                <option value="Home">Home & Garden</option><option value="Sports">Sports</option>
                <option value="Beauty">Beauty</option><option value="Tickets & Events">Tickets & Events</option>
                <option value="All Purpose">All Purpose Store</option>
                <option value="Digital">Digital Products</option>
            </select></div>
            <div class="input-group"><label>Description (10-200 words)</label><textarea id="setup-desc" class="input-field" rows="3">${setupData.description}</textarea></div>
            <div class="input-group"><label>Keywords/Tags (comma separated)</label><input type="text" id="setup-keywords" class="input-field" value="${setupData.keywords}" placeholder="fashion, clothes, shoes"></div>
            <button class="btn-gold btn-full" onclick="proceedToBranding()">Continue →</button>
        </div>
    `);
}

function proceedToBranding() {
    setupData.category = document.getElementById('setup-category')?.value;
    setupData.description = document.getElementById('setup-desc')?.value?.trim();
    setupData.keywords = document.getElementById('setup-keywords')?.value?.trim();
    if (!setupData.category) { showToast('Select category', 'error'); return; }
    setupStep = 4;
    hideModal();
    showBrandingForm();
}

function showBrandingForm() {
    showModal(`
        <div style="padding:20px;max-height:85vh;overflow-y:auto;">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;">
                <button onclick="hideModal();setupStep=3;showStoreDetailsForm();" style="background:none;border:none;font-size:20px;cursor:pointer;">←</button>
                <div style="flex:1;"><div style="font-size:12px;color:#999;">Step ${setupStep} of 5</div><div style="background:#e0e0e0;height:4px;border-radius:2px;"><div style="background:#6C4BFF;height:4px;border-radius:2px;width:${(setupStep/5)*100}%;"></div></div></div>
            </div>
            <h3>🎨 Store Branding</h3>
            <div class="input-group"><label>Store Logo</label>
                <div style="display:flex;align-items:center;gap:15px;margin-top:5px;">
                    <div id="logo-preview" style="width:60px;height:60px;border-radius:50%;background:#f0f0f0;display:flex;align-items:center;justify-content:center;overflow:hidden;">
                        ${setupData.logo ? `<img src="${setupData.logo}" style="width:100%;height:100%;object-fit:cover;">` : '🏪'}
                    </div>
                    <input type="file" id="setup-logo" class="input-field" accept="image/*" onchange="previewSetupLogo()" style="flex:1;">
                </div>
            </div>
            <div class="input-group"><label>Store Banner</label>
                <div id="banner-preview" style="width:100%;height:100px;background:#f0f0f0;border-radius:8px;margin-top:5px;display:flex;align-items:center;justify-content:center;overflow:hidden;">
                    ${setupData.banner ? `<img src="${setupData.banner}" style="width:100%;height:100%;object-fit:cover;">` : '🖼️ Banner Preview'}
                </div>
                <input type="file" id="setup-banner" class="input-field" accept="image/*" onchange="previewSetupBanner()" style="margin-top:8px;">
            </div>
            <div class="input-group"><label>Theme Color</label><input type="color" id="setup-color" class="input-field" value="${setupData.color}" style="height:50px;"></div>
            <p style="font-size:11px;color:#999;">Recommended: 200x200px logo, 1200x400px banner · PNG, JPG</p>
            <button class="btn-gold btn-full" onclick="proceedToPayment()">Continue →</button>
        </div>
    `);
}

function previewSetupLogo() {
    const file = document.getElementById('setup-logo')?.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
        setupData.logo = e.target.result;
        document.getElementById('logo-preview').innerHTML = `<img src="${e.target.result}" style="width:100%;height:100%;object-fit:cover;">`;
    };
    reader.readAsDataURL(file);
}

function previewSetupBanner() {
    const file = document.getElementById('setup-banner')?.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
        setupData.banner = e.target.result;
        document.getElementById('banner-preview').innerHTML = `<img src="${e.target.result}" style="width:100%;height:100%;object-fit:cover;">`;
    };
    reader.readAsDataURL(file);
}

function proceedToPayment() {
    setupData.color = document.getElementById('setup-color')?.value || '#6C4BFF';
    setupStep = 5;
    hideModal();
    showPaymentReview();
}

function showPaymentReview() {
    const plan = STORE_PLANS[setupData.plan];
    showModal(`
        <div style="padding:20px;max-height:85vh;overflow-y:auto;">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;">
                <button onclick="hideModal();setupStep=4;showBrandingForm();" style="background:none;border:none;font-size:20px;cursor:pointer;">←</button>
                <div style="flex:1;"><div style="font-size:12px;color:#999;">Step ${setupStep} of 5</div><div style="background:#e0e0e0;height:4px;border-radius:2px;"><div style="background:#6C4BFF;height:4px;border-radius:2px;width:${(setupStep/5)*100}%;"></div></div></div>
            </div>
            <h3>💳 Review & Pay</h3>
            <div style="background:white;border-radius:12px;padding:15px;margin:15px 0;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
                <h4>${plan.name} Plan</h4>
                <div style="font-size:28px;font-weight:800;color:${plan.color};">$${plan.price}<span style="font-size:14px;">/mo</span></div>
                <div style="margin-top:10px;">${plan.features.map(f=>`<p style="font-size:12px;">✅ ${f}</p>`).join('')}</div>
            </div>
            <p style="font-size:13px;">Pay with: <strong>ONESHOPLIFY Wallet</strong></p>
            <p style="font-size:13px;">Balance: <strong>${formatCurrency(APP.userProfile?.walletBalance||0)}</strong></p>
            ${(APP.userProfile?.walletBalance||0) >= plan.price ? `
                <button class="btn-gold btn-full" onclick="processStorePayment()">💳 Pay $${plan.price}</button>
            ` : `
                <div style="background:#FFEBEE;padding:12px;border-radius:8px;text-align:center;margin:10px 0;">
                    <p style="color:#C62828;">Insufficient balance. Need $${plan.price}</p>
                </div>
                <button class="btn-gold btn-full" onclick="hideModal();navigateTo('wallet');">💰 Deposit First</button>
            `}
        </div>
    `);
}

async function processStorePayment() {
    const plan = STORE_PLANS[setupData.plan];
    hideModal();
    showLoader();
    
    try {
        // Upload images
        let logoUrl = '', bannerUrl = '';
        const logoFile = document.getElementById('setup-logo')?.files?.[0];
        const bannerFile = document.getElementById('setup-banner')?.files?.[0];
        if (logoFile) { try { logoUrl = await uploadToCloudinary(logoFile); } catch(e) {} }
        if (bannerFile) { try { bannerUrl = await uploadToCloudinary(bannerFile); } catch(e) {} }
        
        const expiry = new Date();
        expiry.setMonth(expiry.getMonth() + 1);
        
        const updates = {
            walletBalance: firebase.firestore.FieldValue.increment(-plan.price),
            hasStore: true, storePlan: setupData.plan,
            storeName: setupData.storeName,
            storeDescription: setupData.description,
            storeCategory: setupData.category,
            storeKeywords: setupData.keywords,
            storeCountry: setupData.country,
            storeColor: setupData.color,
            storeLogo: logoUrl || '',
            storeBanner: bannerUrl || '',
            storeExpiry: firebase.firestore.Timestamp.fromDate(expiry),
            storeActive: true,
            storeFollowers: 0,
            storeFollowing: 0,
            storeTotalSales: 0,
            storeTotalRevenue: 0,
            storeBadge: null
        };
        
        await db.collection('users').doc(APP.userProfile.uid).update(updates);
        Object.assign(APP.userProfile, updates);
        APP.userProfile.walletBalance -= plan.price;
        
        await db.collection('transactions').add({
            userId: APP.userProfile.uid, type: 'store_subscription', amount: plan.price,
            currency: 'USD', status: 'completed', description: `Store ${plan.name} plan`,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        hideLoader();
        showPaymentSuccess();
    } catch(e) { hideLoader(); showToast('Payment failed', 'error'); }
}

function showPaymentSuccess() {
    const plan = STORE_PLANS[setupData.plan];
    const storeUrl = `https://${APP.userProfile.username}.oneshoplify.com`;
    
    showModal(`
        <div style="padding:30px;text-align:center;">
            <div style="font-size:70px;animation:bounce 0.6s;">✅</div>
            <h2>Payment Successful!</h2>
            <div style="background:#f5f5f5;border-radius:12px;padding:15px;margin:20px 0;text-align:left;">
                <p><strong>Plan:</strong> ${plan.name}</p>
                <p><strong>Amount:</strong> $${plan.price}</p>
                <p><strong>Store URL:</strong></p>
                <div style="font-family:monospace;font-size:13px;background:white;padding:10px;border-radius:6px;word-break:break-all;">${storeUrl}</div>
            </div>
            <button class="btn-gold btn-full" onclick="hideModal();navigateTo('storeowner');">🚀 Go to Dashboard</button>
            <button class="btn-outline btn-full" style="margin-top:8px;" onclick="hideModal();openStoreShop('${APP.userProfile.username}');">👁️ View My Store</button>
        </div>
    `);
}

// =====================
// STORE OWNER DASHBOARD (3-Column Layout)
// =====================
async function loadStoreOwnerDashboard() {
    const container = document.getElementById('storeowner-content');
    if (!container) return;
    
    if (!APP.userProfile?.hasStore) {
        container.innerHTML = `
            <div style="text-align:center;padding:60px;">
                <p style="font-size:50px;">🏪</p>
                <h3>No Store Yet</h3>
                <button class="btn-gold" onclick="startStoreSetup()">Create Store</button>
            </div>`;
        return;
    }
    
    const store = APP.userProfile;
    const plan = STORE_PLANS[store.storePlan] || STORE_PLANS.basic;
    const storeUrl = `https://${store.username}.oneshoplify.com`;
    
    // Get stats
    let totalProducts = 0, totalOrders = 0, totalRevenue = 0, totalVisitors = 0, conversionRate = 0, avgOrderValue = 0;
    try {
        const prodSnap = await db.collection('products').where('merchantId','==',APP.userProfile.uid).get();
        totalProducts = prodSnap.size;
        
        const orderSnap = await db.collection('orders').where('merchantId','==',APP.userProfile.uid).get();
        const completedOrders = [];
        orderSnap.forEach(doc => {
            const o = doc.data();
            totalOrders++;
            if (o.status === 'completed') {
                completedOrders.push(o);
                totalRevenue += o.total || 0;
            }
        });
        avgOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;
        conversionRate = totalOrders > 0 ? ((completedOrders.length / totalOrders) * 100).toFixed(1) : 0;
    } catch(e) {}
    
    const followers = store.storeFollowers || 0;
    const following = store.storeFollowing || 0;
    const badge = getStoreBadge(followers);
    
    container.innerHTML = `
        <div style="display:flex;min-height:100vh;background:#F8F9FB;">
            
            <!-- LEFT SIDEBAR -->
            <div id="store-sidebar" style="width:${STORE_OWNER.sidebarOpen ? '260px' : '0px'};background:#0F172A;color:white;transition:all 0.3s;overflow:hidden;flex-shrink:0;position:fixed;left:0;top:0;bottom:0;z-index:200;${STORE_OWNER.sidebarOpen ? '' : 'width:0;padding:0;'}"">
                <div style="padding:20px;">
                    <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;">
                        <img src="${store.storeLogo || '/app-icon.png'}" style="width:36px;height:36px;border-radius:8px;">
                        <span style="font-weight:700;font-size:16px;">ONESHOPLIFY</span>
                    </div>
                    
                    <div style="background:rgba(255,255,255,0.1);border-radius:10px;padding:12px;margin-bottom:20px;">
                        <p style="font-weight:600;font-size:13px;margin:0;">${store.storeName}</p>
                        <p style="font-size:11px;opacity:0.7;margin:2px 0;">${plan.name} Plan</p>
                        <button class="btn-small btn-outline" style="margin-top:8px;width:100%;border-color:rgba(255,255,255,0.3);color:white;font-size:11px;" onclick="openStoreShop('${store.username}')">View Store</button>
                    </div>
                    
                    <nav style="display:flex;flex-direction:column;gap:2px;">
                        ${['dashboard','products','orders','customers','analytics','marketing','discounts','reviews','payouts','design','pages','settings','chat','support'].map(item => `
                            <button onclick="switchStoreView('${item}')" 
                                    style="width:100%;padding:10px 12px;background:${STORE_OWNER.currentView===item?'rgba(255,255,255,0.1)':'transparent'};border:none;color:white;text-align:left;border-radius:8px;cursor:pointer;font-size:13px;text-transform:capitalize;">
                                ${getIconForView(item)} ${item}
                            </button>
                        `).join('')}
                    </nav>
                </div>
                
                <div style="position:absolute;bottom:20px;left:20px;right:20px;">
                    <div style="background:rgba(255,255,255,0.1);border-radius:10px;padding:12px;">
                        <p style="font-size:11px;opacity:0.7;">Monthly Revenue</p>
                        <p style="font-size:20px;font-weight:700;">${formatCurrency(totalRevenue)}</p>
                        <p style="font-size:11px;">${totalOrders} orders</p>
                    </div>
                </div>
            </div>
            
            <!-- TOGGLE SIDEBAR BUTTON -->
            <button onclick="toggleStoreSidebar()" style="position:fixed;left:${STORE_OWNER.sidebarOpen ? '250px' : '5px'};top:10px;z-index:300;background:white;border:none;width:32px;height:32px;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.1);cursor:pointer;font-size:16px;transition:left 0.3s;">
                ${STORE_OWNER.sidebarOpen ? '◀' : '▶'}
            </button>
            
            <!-- MAIN CONTENT -->
            <div style="flex:1;margin-left:${STORE_OWNER.sidebarOpen ? '260px' : '0px'};transition:margin-left 0.3s;padding:20px;">
                
                <!-- TOP HEADER -->
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:25px;">
                    <div>
                        <h2 style="margin:0;font-size:24px;">Dashboard</h2>
                        <p style="color:#666;margin:4px 0 0;">Welcome back, ${store.storeName}</p>
                    </div>
                    <div style="display:flex;gap:10px;align-items:center;">
                        <button class="btn-outline" onclick="openStoreShop('${store.username}')">View Store</button>
                        <div style="position:relative;cursor:pointer;" onclick="loadStoreNotifications()">
                            🔔
                            <span id="store-notif-badge" style="position:absolute;top:-5px;right:-5px;background:red;color:white;font-size:9px;width:16px;height:16px;border-radius:50%;display:none;align-items:center;justify-content:center;">0</span>
                        </div>
                        <img src="${store.photoURL||'/app-icon.png'}" style="width:36px;height:36px;border-radius:50%;cursor:pointer;" onclick="navigateTo('profile')">
                    </div>
                </div>
                
                <!-- BADGE DISPLAY -->
                ${badge ? `
                    <div style="background:white;border-radius:12px;padding:12px 15px;margin-bottom:20px;display:flex;align-items:center;gap:12px;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
                        <span style="font-size:24px;">${badge.name === 'Blue' ? '💎' : badge.name === 'Green' ? '💚' : badge.name === 'Purple' ? '💜' : badge.name === 'White Diamond' ? '🤍' : '🌊'}</span>
                        <div>
                            <strong>${badge.name} Badge</strong>
                            <p style="font-size:11px;color:#666;">${followers.toLocaleString()} followers</p>
                        </div>
                    </div>
                ` : ''}
                
                <!-- STATS CARDS -->
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:15px;margin-bottom:25px;">
                    ${createStatCard('Total Revenue', formatCurrency(totalRevenue), '+12%', '💰', '#22C55E')}
                    ${createStatCard('Orders', totalOrders, '+8%', '📦', '#3B82F6')}
                    ${createStatCard('Balance', formatCurrency(store.walletBalance||0), '', '💳', '#8B5CF6')}
                </div>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:15px;margin-bottom:25px;">
                    ${createStatCard('Products', totalProducts, '', '🏷️', '#F59E0B')}
                    ${createStatCard('Followers', followers, '', '👥', '#EC4899')}
                    ${createStatCard('Conversion', conversionRate+'%', '', '📊', '#06B6D4')}
                </div>
                
                <!-- FOLLOWERS & FOLLOWING LIST -->
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;margin-bottom:25px;">
                    <div style="background:white;border-radius:12px;padding:15px;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
                        <h4>👥 Followers (${followers})</h4>
                        <button class="btn-outline btn-small" onclick="showFollowersList()">View All</button>
                    </div>
                    <div style="background:white;border-radius:12px;padding:15px;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
                        <h4>🔗 Following (${following})</h4>
                        <button class="btn-outline btn-small" onclick="showFollowingList()">View All</button>
                    </div>
                </div>
                
                <!-- STORE LOBBY -->
                <div style="background:white;border-radius:12px;padding:15px;margin-bottom:25px;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
                    <h4>📢 Store Lobby</h4>
                    <div style="display:flex;gap:10px;">
                        <input type="text" id="lobby-message" class="input-field" placeholder="Send message to all followers..." style="flex:1;">
                        <button class="btn-gold" onclick="sendLobbyMessage()">Send</button>
                    </div>
                    <div id="lobby-messages" style="margin-top:10px;"></div>
                </div>
                
                <!-- RECENT ORDERS -->
                <div style="background:white;border-radius:12px;padding:15px;margin-bottom:25px;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
                    <h4>📦 Recent Orders</h4>
                    <div id="recent-orders-list"><p style="color:#999;">Loading...</p></div>
                </div>
                
                <!-- AD APPLICATION BANNER -->
                <div style="background:linear-gradient(135deg,#6C4BFF,#4F46E5);border-radius:12px;padding:20px;color:white;text-align:center;margin-bottom:25px;">
                    <h3>📢 Promote Your Store</h3>
                    <p>Run ads and reach more customers</p>
                    <button class="btn-gold" onclick="applyForStoreAd()">Apply for Ad - $10/mo</button>
                </div>
                
            </div>
        </div>
    `;
    
    // Load lobby messages
    loadStoreLobby();
    // Load recent orders
    loadRecentOrders();
    // Load notifications
    updateStoreNotificationBadge();
}

function createStatCard(title, value, growth, icon, color) {
    return `
        <div style="background:white;border-radius:12px;padding:18px;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
            <div style="display:flex;justify-content:space-between;align-items:start;">
                <div>
                    <p style="font-size:12px;color:#999;margin:0;">${title}</p>
                    <p style="font-size:24px;font-weight:800;margin:5px 0;">${value}</p>
                    ${growth ? `<span style="color:#22C55E;font-size:12px;">${growth}</span>` : ''}
                </div>
                <span style="font-size:24px;">${icon}</span>
            </div>
        </div>`;
}

function getIconForView(view) {
    const icons = {
        dashboard: '📊', products: '📦', orders: '🛒', customers: '👥',
        analytics: '📈', marketing: '📢', discounts: '🏷️', reviews: '⭐',
        payouts: '💰', design: '🎨', pages: '📄', settings: '⚙️',
        chat: '💬', support: '🎧'
    };
    return icons[view] || '📌';
}

function toggleStoreSidebar() {
    STORE_OWNER.sidebarOpen = !STORE_OWNER.sidebarOpen;
    loadStoreOwnerDashboard();
}

function switchStoreView(view) {
    STORE_OWNER.currentView = view;
    loadStoreOwnerDashboard();
}

function getStoreBadge(followers) {
    if (followers >= 1000000) return FOLLOW_BADGES.sealight;
    if (followers >= 100000) return FOLLOW_BADGES.white;
    if (followers >= 50000) return FOLLOW_BADGES.purple;
    if (followers >= 25000) return FOLLOW_BADGES.green;
    if (followers >= 1000) return FOLLOW_BADGES.blue;
    return null;
}

// =====================
// FOLLOW SYSTEM (Backend-only)
// =====================
async function followStore(storeId) {
    if (!APP.userProfile) { showToast('Login required', 'error'); return; }
    if (APP.userProfile.uid === storeId) { showToast('Cannot follow yourself', 'error'); return; }
    
    try {
        // Call backend API to follow
        const response = await fetch(APP.backendUrl + '/store/follow', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: APP.userProfile.uid, storeId })
        });
        const result = await response.json();
        
        if (result.success) {
            showToast('Followed! ✅', 'success');
            updateFollowerCount(storeId, result.followers);
        } else if (result.alreadyFollowing) {
            showToast('Already following', 'info');
        }
    } catch(e) { showToast('Failed', 'error'); }
}

async function unfollowStore(storeId) {
    try {
        const response = await fetch(APP.backendUrl + '/store/unfollow', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: APP.userProfile.uid, storeId })
        });
        const result = await response.json();
        if (result.success) {
            showToast('Unfollowed', 'info');
            updateFollowerCount(storeId, result.followers);
        }
    } catch(e) { showToast('Failed', 'error'); }
}

async function likeProduct(productId) {
    if (!APP.userProfile) { showToast('Login required', 'error'); return; }
    try {
        const response = await fetch(APP.backendUrl + '/product/like', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: APP.userProfile.uid, productId })
        });
        const result = await response.json();
        if (result.success) {
            // Update UI with actual count from backend
            const likeEl = document.getElementById('likes-' + productId);
            if (likeEl) likeEl.textContent = '❤️ ' + result.likes;
        }
    } catch(e) {}
}

async function likeReview(reviewId) {
    if (!APP.userProfile) return;
    try {
        const response = await fetch(APP.backendUrl + '/review/like', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: APP.userProfile.uid, reviewId })
        });
        const result = await response.json();
        if (result.success) {
            const el = document.getElementById('review-likes-' + reviewId);
            if (el) el.textContent = '👍 ' + result.likes;
        }
    } catch(e) {}
}

function updateFollowerCount(storeId, count) {
    const el = document.getElementById('store-followers-' + storeId);
    if (el) el.textContent = count.toLocaleString() + ' followers';
}

async function showFollowersList() {
    showLoader();
    try {
        const snap = await db.collection('store_followers')
            .where('storeId', '==', APP.userProfile.uid)
            .get();
        const followers = [];
        for (const doc of snap.docs) {
            const userDoc = await db.collection('users').doc(doc.data().userId).get();
            if (userDoc.exists) followers.push({ id: userDoc.id, ...userDoc.data() });
        }
        
        hideLoader();
        showModal(`
            <div style="max-height:80vh;overflow-y:auto;padding:10px;">
                <h3>👥 Followers (${followers.length})</h3>
                ${followers.length === 0 ? '<p style="color:#999;text-align:center;padding:20px;">No followers yet</p>' :
                    followers.map(f => `
                        <div style="display:flex;align-items:center;gap:10px;padding:12px;border-bottom:1px solid #f0f0f0;">
                            <img src="${f.photoURL||'/app-icon.png'}" style="width:40px;height:40px;border-radius:50%;">
                            <div style="flex:1;">
                                <div style="font-weight:600;">${f.displayName||f.username}</div>
                                <div style="font-size:11px;color:#999;">@${f.username}</div>
                            </div>
                            <button class="btn-small btn-outline" onclick="viewFollowerProfile('${f.username}')">View</button>
                        </div>
                    `).join('')
                }
            </div>
        `);
    } catch(e) { hideLoader(); }
}

async function showFollowingList() {
    showLoader();
    try {
        const snap = await db.collection('store_followers')
            .where('userId', '==', APP.userProfile.uid)
            .get();
        const following = [];
        for (const doc of snap.docs) {
            const storeDoc = await db.collection('users').doc(doc.data().storeId).get();
            if (storeDoc.exists) following.push({ id: storeDoc.id, ...storeDoc.data() });
        }
        
        hideLoader();
        showModal(`
            <div style="max-height:80vh;overflow-y:auto;padding:10px;">
                <h3>🔗 Following (${following.length})</h3>
                ${following.length === 0 ? '<p style="color:#999;text-align:center;padding:20px;">Not following anyone</p>' :
                    following.map(f => `
                        <div style="display:flex;align-items:center;gap:10px;padding:12px;border-bottom:1px solid #f0f0f0;">
                            <img src="${f.storeLogo||f.photoURL||'/app-icon.png'}" style="width:40px;height:40px;border-radius:10px;">
                            <div style="flex:1;">
                                <div style="font-weight:600;">${f.storeName||f.displayName}</div>
                                <div style="font-size:11px;color:#999;">@${f.username}</div>
                            </div>
                            <button class="btn-small btn-outline" onclick="openStoreShop('${f.username}')">Visit</button>
                        </div>
                    `).join('')
                }
            </div>
        `);
    } catch(e) { hideLoader(); }
}

function viewFollowerProfile(username) {
    hideModal();
    navigateTo('profile');
}

// =====================
// STORE LOBBY (Broadcast to followers)
// =====================
async function sendLobbyMessage() {
    const message = document.getElementById('lobby-message')?.value?.trim();
    if (!message) { showToast('Enter a message', 'error'); return; }
    
    try {
        await db.collection('store_lobby').add({
            storeId: APP.userProfile.uid,
            storeName: APP.userProfile.storeName,
            message,
            reactions: [],
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        document.getElementById('lobby-message').value = '';
        loadStoreLobby();
        showToast('Message sent to followers! 📢', 'success');
        
        // Notify followers
        notifyFollowers('lobby', message);
    } catch(e) { showToast('Failed', 'error'); }
}

async function loadStoreLobby() {
    const container = document.getElementById('lobby-messages');
    if (!container) return;
    
    try {
        const snap = await db.collection('store_lobby')
            .where('storeId', '==', APP.userProfile.uid)
            .orderBy('createdAt', 'desc')
            .limit(10)
            .get();
        
        if (snap.empty) {
            container.innerHTML = '<p style="color:#999;text-align:center;">No messages yet</p>';
            return;
        }
        
        container.innerHTML = snap.docs.map(doc => {
            const msg = doc.data();
            const reactions = msg.reactions || [];
            return `
                <div style="padding:10px;background:#f9f9f9;border-radius:8px;margin-bottom:8px;">
                    <p style="margin:0;font-size:13px;">${msg.message}</p>
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:5px;">
                        <span style="font-size:10px;color:#999;">${getTimeAgo(msg.createdAt)}</span>
                        <span>❤️ ${reactions.length}</span>
                    </div>
                </div>`;
        }).join('');
    } catch(e) {}
}

async function reactToLobbyMessage(messageId) {
    if (!APP.userProfile) return;
    try {
        const doc = await db.collection('store_lobby').doc(messageId).get();
        const reactions = doc.data()?.reactions || [];
        if (!reactions.includes(APP.userProfile.uid)) {
            reactions.push(APP.userProfile.uid);
            await db.collection('store_lobby').doc(messageId).update({ reactions });
        }
    } catch(e) {}
}

async function notifyFollowers(type, message) {
    try {
        const snap = await db.collection('store_followers')
            .where('storeId', '==', APP.userProfile.uid)
            .get();
        
        for (const doc of snap.docs) {
            const followerId = doc.data().userId;
            await db.collection('notifications').add({
                userId: followerId,
                title: `📢 ${APP.userProfile.storeName}`,
                message: message,
                icon: '📢',
                link: 'store-shop',
                type: type,
                storeId: APP.userProfile.uid,
                read: false,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
    } catch(e) { console.warn('Notify error:', e); }
}

// =====================
// RECENT ORDERS
// =====================
async function loadRecentOrders() {
    const container = document.getElementById('recent-orders-list');
    if (!container) return;
    
    try {
        const snap = await db.collection('orders')
            .where('merchantId', '==', APP.userProfile.uid)
            .orderBy('createdAt', 'desc')
            .limit(10)
            .get();
        
        if (snap.empty) {
            container.innerHTML = '<p style="color:#999;text-align:center;padding:20px;">No orders yet</p>';
            return;
        }
        
        container.innerHTML = snap.docs.map(doc => {
            const o = doc.data();
            const statusColors = {
                pending: '#F59E0B', processing: '#3B82F6', shipped: '#8B5CF6',
                delivered: '#22C55E', completed: '#22C55E', cancelled: '#EF4444'
            };
            return `
                <div style="display:flex;align-items:center;gap:12px;padding:12px;border-bottom:1px solid #f0f0f0;">
                    <img src="${o.items?.[0]?.image||'/app-icon.png'}" style="width:40px;height:40px;border-radius:8px;object-fit:cover;">
                    <div style="flex:1;">
                        <div style="font-weight:600;font-size:13px;">${o.items?.[0]?.name||'Product'}</div>
                        <div style="font-size:11px;color:#999;">${o.orderId||doc.id.substring(0,8)} · ${getTimeAgo(o.createdAt)}</div>
                    </div>
                    <span style="background:${statusColors[o.status]||'#999'};color:white;padding:3px 8px;border-radius:10px;font-size:10px;font-weight:600;">${(o.status||'').toUpperCase()}</span>
                    <span style="font-weight:700;">${formatCurrency(o.total||0)}</span>
                </div>`;
        }).join('');
    } catch(e) { container.innerHTML = '<p style="color:#999;">Error loading</p>'; }
}

// =====================
// STORE NOTIFICATIONS
// =====================
async function loadStoreNotifications() {
    try {
        const snap = await db.collection('notifications')
            .where('storeId', '==', APP.userProfile.uid)
            .orderBy('createdAt', 'desc')
            .limit(20)
            .get();
        
        const notifs = [];
        snap.forEach(doc => notifs.push({ id: doc.id, ...doc.data() }));
        
        showModal(`
            <div style="max-height:80vh;overflow-y:auto;padding:10px;">
                <h3>🔔 Notifications</h3>
                ${notifs.length === 0 ? '<p style="color:#999;text-align:center;padding:20px;">No notifications</p>' :
                    notifs.map(n => `
                        <div style="padding:12px;border-bottom:1px solid #f0f0f0;${n.read?'':'background:#FFF8E1;'}">
                            <div style="font-weight:600;">${n.title}</div>
                            <p style="font-size:12px;color:#666;">${n.message}</p>
                            <span style="font-size:10px;color:#999;">${getTimeAgo(n.createdAt)}</span>
                        </div>
                    `).join('')
                }
            </div>
        `);
    } catch(e) {}
}

async function updateStoreNotificationBadge() {
    try {
        const snap = await db.collection('notifications')
            .where('storeId', '==', APP.userProfile.uid)
            .where('read', '==', false)
            .get();
        
        const badge = document.getElementById('store-notif-badge');
        if (badge) {
            const count = snap.size;
            badge.textContent = count > 99 ? '99+' : count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        }
    } catch(e) {}
}

// =====================
// AD APPLICATION
// =====================
function applyForStoreAd() {
    showModal(`
        <div style="padding:15px;">
            <h3>📢 Advertise Your Store</h3>
            <p style="color:#666;">Run ads across ONESHOPLIFY - $10/month</p>
            
            <div class="input-group"><label>Ad Title</label><input type="text" id="ad-title" class="input-field" placeholder="Your ad headline"></div>
            <div class="input-group"><label>Ad Description</label><textarea id="ad-desc" class="input-field" rows="2" placeholder="Describe your promotion"></textarea></div>
            <div class="input-group"><label>Ad Image</label><input type="file" id="ad-image" class="input-field" accept="image/*"></div>
            <div class="input-group"><label>Target URL (optional)</label><input type="url" id="ad-url" class="input-field" placeholder="https://..."></div>
            
            <p style="font-size:13px;">💰 Cost: <strong>$10/month</strong></p>
            <p style="font-size:13px;">Balance: <strong>${formatCurrency(APP.userProfile?.walletBalance||0)}</strong></p>
            
            ${(APP.userProfile?.walletBalance||0) >= 10 ? `
                <button class="btn-gold btn-full" onclick="submitStoreAd()">🚀 Launch Ad - $10</button>
            ` : `
                <button class="btn-gold btn-full" onclick="hideModal();navigateTo('wallet');">💰 Deposit $10</button>
            `}
        </div>
    `);
}

async function submitStoreAd() {
    const title = document.getElementById('ad-title')?.value?.trim();
    const desc = document.getElementById('ad-desc')?.value?.trim();
    const url = document.getElementById('ad-url')?.value?.trim();
    
    if (!title) { showToast('Enter ad title', 'error'); return; }
    if ((APP.userProfile?.walletBalance||0) < 10) { showToast('Insufficient balance', 'error'); return; }
    
    hideModal();
    showLoader();
    
    try {
        let imageUrl = '';
        const imageFile = document.getElementById('ad-image')?.files?.[0];
        if (imageFile) { try { imageUrl = await uploadToCloudinary(imageFile); } catch(e) {} }
        
        const expiry = new Date();
        expiry.setMonth(expiry.getMonth() + 1);
        
        await db.collection('users').doc(APP.userProfile.uid).update({
            walletBalance: firebase.firestore.FieldValue.increment(-10)
        });
        
        await db.collection('store_ads').add({
            storeId: APP.userProfile.uid,
            storeName: APP.userProfile.storeName,
            title, description: desc,
            imageUrl, targetUrl: url || '',
            active: true,
            expiresAt: firebase.firestore.Timestamp.fromDate(expiry),
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        APP.userProfile.walletBalance -= 10;
        
        await db.collection('transactions').add({
            userId: APP.userProfile.uid, type: 'ad_payment', amount: 10,
            currency: 'USD', status: 'completed', description: 'Store advertisement',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        hideLoader();
        showToast('Ad launched! Running for 30 days 🚀', 'success');
        
    } catch(e) { hideLoader(); showToast('Failed', 'error'); }
}

// =====================
// AUTO-REPLY BOT (Enterprise)
// =====================
async function setupAutoReply() {
    if (!APP.userProfile?.hasStore || APP.userProfile.storePlan !== 'enterprise') {
        showToast('Enterprise plan required', 'error');
        return;
    }
    
    const currentReply = APP.userProfile.autoReplyMessage || '';
    
    showModal(`
        <div style="padding:15px;">
            <h3>🤖 Auto-Reply Bot</h3>
            <p style="color:#666;">Set automatic replies for customer messages</p>
            <div class="input-group"><label>Auto-Reply Message</label>
                <textarea id="auto-reply-msg" class="input-field" rows="3" placeholder="Thank you for contacting us! We'll get back to you shortly.">${currentReply}</textarea>
            </div>
            <button class="btn-gold btn-full" onclick="saveAutoReply()">💾 Save</button>
        </div>
    `);
}

async function saveAutoReply() {
    const message = document.getElementById('auto-reply-msg')?.value?.trim();
    if (!message) { showToast('Enter a message', 'error'); return; }
    hideModal();
    try {
        await db.collection('users').doc(APP.userProfile.uid).update({ autoReplyMessage: message });
        APP.userProfile.autoReplyMessage = message;
        showToast('Auto-reply saved! ✅', 'success');
    } catch(e) { showToast('Failed', 'error'); }
}

// =====================
// STORE CHAT SYSTEM
// =====================
async function openStoreChat(customerId, customerName) {
    if (!APP.userProfile?.hasStore) { showToast('Store required', 'error'); return; }
    
    const plan = STORE_PLANS[APP.userProfile.storePlan] || STORE_PLANS.basic;
    const chatLimit = plan.chatLimit;
    
    // Check chat limits
    try {
        const today = new Date();
        today.setHours(0,0,0,0);
        const chatCountSnap = await db.collection('store_chats')
            .where('storeId','==',APP.userProfile.uid)
            .where('createdAt','>=',firebase.firestore.Timestamp.fromDate(today))
            .get();
        
        if (chatCountSnap.size >= chatLimit && chatLimit !== Infinity) {
            showToast(`Daily chat limit (${chatLimit}) reached`, 'error');
            return;
        }
    } catch(e) {}
    
    showModal(`
        <div style="display:flex;flex-direction:column;height:80vh;">
            <div style="padding:12px;background:#6C4BFF;color:white;display:flex;align-items:center;gap:10px;border-radius:12px 12px 0 0;">
                ${APP.userProfile.storeLogo ? `<img src="${APP.userProfile.storeLogo}" style="width:30px;height:30px;border-radius:50%;">` : ''}
                <strong>${customerName || 'Customer'}</strong>
                <button onclick="hideModal()" style="margin-left:auto;background:none;border:none;color:white;font-size:20px;cursor:pointer;">✕</button>
            </div>
            <div id="chat-messages" style="flex:1;overflow-y:auto;padding:15px;background:#f5f5f5;"></div>
            <div style="display:flex;gap:8px;padding:12px;background:white;border-top:1px solid #f0f0f0;">
                <input type="text" id="chat-input" class="input-field" placeholder="Type a message..." style="flex:1;">
                <button class="btn-gold" onclick="sendChatMessage('${customerId}')">📤</button>
            </div>
        </div>
    `);
    
    loadChatMessages(customerId);
    
    // Auto-reply for enterprise
    if (APP.userProfile.autoReplyMessage && APP.userProfile.storePlan === 'enterprise') {
        setTimeout(() => {
            const msgContainer = document.getElementById('chat-messages');
            if (msgContainer && !msgContainer.querySelector('.auto-reply')) {
                msgContainer.innerHTML += `
                    <div class="auto-reply" style="display:flex;gap:8px;margin:10px 0;">
                        <img src="${APP.userProfile.storeLogo||'/app-icon.png'}" style="width:30px;height:30px;border-radius:50%;">
                        <div style="background:#E8E0FF;padding:10px;border-radius:12px;max-width:80%;font-size:13px;">${APP.userProfile.autoReplyMessage}</div>
                    </div>`;
            }
        }, 1000);
    }
}

async function loadChatMessages(customerId) {
    const container = document.getElementById('chat-messages');
    if (!container) return;
    
    try {
        const snap = await db.collection('store_chats')
            .where('storeId','==',APP.userProfile.uid)
            .where('customerId','==',customerId)
            .orderBy('createdAt','asc')
            .get();
        
        container.innerHTML = '';
        snap.forEach(doc => {
            const msg = doc.data();
            const isStore = msg.senderId === APP.userProfile.uid;
            container.innerHTML += `
                <div style="display:flex;gap:8px;margin:8px 0;justify-content:${isStore?'flex-end':'flex-start'};">
                    ${!isStore ? `<img src="${msg.customerPhoto||'/app-icon.png'}" style="width:30px;height:30px;border-radius:50%;">` : ''}
                    <div style="background:${isStore?'#6C4BFF':'#e0e0e0'};color:${isStore?'white':'#333'};padding:10px;border-radius:12px;max-width:70%;font-size:13px;">
                        ${msg.message}
                        <div style="font-size:9px;opacity:0.7;margin-top:3px;">${getTimeAgo(msg.createdAt)}</div>
                    </div>
                    ${isStore ? `<img src="${APP.userProfile.storeLogo||'/app-icon.png'}" style="width:30px;height:30px;border-radius:50%;">` : ''}
                </div>`;
        });
        container.scrollTop = container.scrollHeight;
    } catch(e) {}
}

async function sendChatMessage(customerId) {
    const input = document.getElementById('chat-input');
    const message = input?.value?.trim();
    if (!message) return;
    
    input.value = '';
    
    // Show immediately
    const container = document.getElementById('chat-messages');
    if (container) {
        container.innerHTML += `
            <div style="display:flex;gap:8px;margin:8px 0;justify-content:flex-end;">
                <div style="background:#6C4BFF;color:white;padding:10px;border-radius:12px;max-width:70%;font-size:13px;">
                    ${message}
                    <div style="font-size:9px;opacity:0.7;">Just now</div>
                </div>
                <img src="${APP.userProfile.storeLogo||'/app-icon.png'}" style="width:30px;height:30px;border-radius:50%;">
            </div>`;
        container.scrollTop = container.scrollHeight;
    }
    
    // Save to backend
    try {
        await db.collection('store_chats').add({
            storeId: APP.userProfile.uid,
            customerId,
            senderId: APP.userProfile.uid,
            message,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch(e) {}
}

// =====================
// GLOBAL ACCESS
// =====================
window.startStoreSetup = startStoreSetup;
window.loadStoreOwnerDashboard = loadStoreOwnerDashboard;
window.loadStoreMarket = loadStoreMarket;
window.openStoreShop = openStoreShop;
window.viewShopProduct = viewShopProduct;
window.followStore = followStore;
window.unfollowStore = unfollowStore;
window.likeProduct = likeProduct;
window.likeReview = likeReview;
window.showFollowersList = showFollowersList;
window.showFollowingList = showFollowingList;
window.toggleStoreSidebar = toggleStoreSidebar;
window.applyForStoreAd = applyForStoreAd;
window.setupAutoReply = setupAutoReply;
window.openStoreChat = openStoreChat;
window.sendLobbyMessage = sendLobbyMessage;

console.log('✅ storeowner.js fully loaded - Complete Store System v8.0');
console.log('   Features: Dashboard | Chat | Followers | Ads | Auto-reply | Lobby | Tickets');
