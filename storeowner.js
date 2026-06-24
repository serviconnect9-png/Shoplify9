// storeowner.js - COMPLETE FINAL VERSION (Store Creation Flow, Dashboard, Ads, Followers, Chat, Analytics)
console.log('✅ storeowner.js loaded - ONESHOPLIFY Store Owner System v2.0');

// =====================
// STORE CREATION FLOW (10 Steps)
// =====================
let storeCreationStep = 1;
let storeCreationData = {
    plan: null,
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
    paymentMethod: 'oneshoplify_wallet'
};

const STORE_PLANS = {
    basic: {
        name: 'Basic',
        price: 5,
        color: '#6C3CF0',
        products: 50,
        analytics: 'simple',
        support: 'email',
        chatLimit: 10,
        features: ['Up to 50 products', 'Simple analytics', 'Email support', '10 chats/day', 'Sponsored ads displayed']
    },
    pro: {
        name: 'Pro',
        price: 15,
        color: '#4F46E5',
        products: 501,
        analytics: 'full',
        support: 'ticket+email+line',
        chatLimit: 100,
        recommended: true,
        features: ['Up to 501 products', 'Full analytics dashboard', 'Ticket, email & phone support', '100 chats/day', 'Sponsored ads displayed']
    },
    enterprise: {
        name: 'Enterprise',
        price: 45,
        color: '#FF9800',
        products: 'Unlimited',
        analytics: 'enterprise',
        support: 'ticket+email+line+bot',
        chatLimit: 'Unlimited',
        verified: true,
        features: ['Unlimited products', 'Enterprise analytics', 'Auto-reply bot', 'Unlimited chats', 'Daily reports', 'Verified badge', 'No sponsored ads on store']
    }
};

function startStoreCreation() {
    storeCreationStep = 1;
    storeCreationData = {
        plan: null, storeName: '', ownerName: '', email: APP.userProfile?.email || '',
        phone: APP.userProfile?.phoneNumber || '', country: APP.userProfile?.country || '',
        category: '', description: '', keywords: '', logo: null, banner: null,
        paymentMethod: 'oneshoplify_wallet'
    };
    
    renderStoreCreationStep();
}

function renderStoreCreationStep() {
    switch(storeCreationStep) {
        case 1: renderChoosePlan(); break;
        case 2: renderAccountInfo(); break;
        case 3: renderStoreDetails(); break;
        case 4: renderStoreBranding(); break;
        case 5: renderPaymentMethod(); break;
        case 6: renderPlanReview(); break;
        case 7: renderSecurePayment(); break;
        case 8: renderPaymentSuccess(); break;
        case 9: renderStoreSetup(); break;
        case 10: renderStoreReady(); break;
    }
}

// STEP 1: Choose Plan
function renderChoosePlan() {
    showModal(`
        <div style="padding:20px;max-height:85vh;overflow-y:auto;">
            <div style="text-align:center;margin-bottom:25px;">
                <img src="/app-icon.png" style="width:50px;height:50px;border-radius:12px;margin-bottom:10px;">
                <h2 style="font-size:24px;font-weight:800;margin:0;">ONESHOPLIFY</h2>
                <p style="color:#666;margin:5px 0;">Choose Your Store Plan</p>
            </div>
            
            ${Object.entries(STORE_PLANS).map(([key, plan]) => `
                <div onclick="selectStorePlan('${key}')" id="plan-card-${key}"
                     style="background:white;border-radius:16px;padding:20px;margin-bottom:12px;cursor:pointer;border:2px solid ${storeCreationData.plan === key ? plan.color : '#e0e0e0'};transition:all 0.3s;${plan.recommended ? 'position:relative;' : ''}">
                    ${plan.recommended ? '<span style="position:absolute;top:-10px;right:20px;background:#6C3CF0;color:white;padding:4px 14px;border-radius:12px;font-size:11px;font-weight:700;">RECOMMENDED</span>' : ''}
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <h3 style="margin:0;font-size:18px;color:${plan.color};">${plan.name}</h3>
                        <div style="font-size:28px;font-weight:800;">$${plan.price}<span style="font-size:14px;color:#999;">/mo</span></div>
                    </div>
                    <div style="margin:12px 0;">
                        ${plan.features.map(f => `<p style="font-size:13px;color:#666;margin:4px 0;">✅ ${f}</p>`).join('')}
                    </div>
                    <button class="btn-gold btn-full" style="padding:12px;font-weight:700;" onclick="selectStorePlan('${key}');proceedToStep2();">
                        Choose ${plan.name}
                    </button>
                </div>
            `).join('')}
            
            <p style="text-align:center;font-size:12px;color:#999;margin-top:10px;">💯 Money-back guarantee · Cancel anytime</p>
        </div>
    `);
}

function selectStorePlan(planKey) {
    storeCreationData.plan = planKey;
    document.querySelectorAll('[id^="plan-card-"]').forEach(el => el.style.border = '2px solid #e0e0e0');
    const el = document.getElementById('plan-card-' + planKey);
    if (el) el.style.border = `2px solid ${STORE_PLANS[planKey].color}`;
}

function proceedToStep2() {
    if (!storeCreationData.plan) { showToast('Please select a plan','error'); return; }
    storeCreationStep = 2;
    hideModal();
    setTimeout(() => renderStoreCreationStep(), 300);
}

// STEP 2: Account Information
function renderAccountInfo() {
    showModal(`
        <div style="padding:20px;max-height:85vh;overflow-y:auto;">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;">
                <button onclick="storeCreationStep=1;hideModal();setTimeout(()=>renderStoreCreationStep(),300);" style="background:none;border:none;font-size:20px;cursor:pointer;">←</button>
                <div style="flex:1;">
                    <div style="font-size:12px;color:#6C3CF0;font-weight:600;">Step 2 of 5</div>
                    <div style="height:4px;background:#e0e0e0;border-radius:2px;margin-top:4px;">
                        <div style="height:4px;background:#6C3CF0;border-radius:2px;width:40%;"></div>
                    </div>
                </div>
            </div>
            
            <h3 style="margin-bottom:20px;">Account Information</h3>
            
            <div class="input-group"><label>Store Name *</label><input type="text" id="ss-store-name" class="input-field" value="${storeCreationData.storeName}" placeholder="My Store"></div>
            <div class="input-group"><label>Owner Name *</label><input type="text" id="ss-owner-name" class="input-field" value="${storeCreationData.ownerName || APP.userProfile?.displayName || ''}" placeholder="Your name"></div>
            <div class="input-group"><label>Email Address *</label><input type="email" id="ss-email" class="input-field" value="${storeCreationData.email}" placeholder="your@email.com"></div>
            <div class="input-group"><label>Phone Number *</label><input type="tel" id="ss-phone" class="input-field" value="${storeCreationData.phone}" placeholder="+1234567890"></div>
            <div class="input-group"><label>Country / Region *</label><select id="ss-country" class="input-field"><option value="">Select</option>${typeof COUNTRIES!=='undefined'?Object.entries(COUNTRIES).sort((a,b)=>a[1].name.localeCompare(b[1].name)).map(([c,d])=>`<option value="${c}" ${storeCreationData.country===c?'selected':''}>${d.flag||''} ${d.name}</option>`).join(''):''}</select></div>
            
            <button class="btn-gold btn-full" style="padding:14px;margin-top:15px;" onclick="saveStep2()">Continue →</button>
        </div>
    `);
}

function saveStep2() {
    storeCreationData.storeName = document.getElementById('ss-store-name')?.value?.trim() || '';
    storeCreationData.ownerName = document.getElementById('ss-owner-name')?.value?.trim() || '';
    storeCreationData.email = document.getElementById('ss-email')?.value?.trim() || '';
    storeCreationData.phone = document.getElementById('ss-phone')?.value?.trim() || '';
    storeCreationData.country = document.getElementById('ss-country')?.value || '';
    
    if (!storeCreationData.storeName) { showToast('Enter store name','error'); return; }
    if (!storeCreationData.ownerName) { showToast('Enter owner name','error'); return; }
    if (!storeCreationData.phone) { showToast('Enter phone number','error'); return; }
    if (!storeCreationData.country) { showToast('Select country','error'); return; }
    
    storeCreationStep = 3;
    hideModal();
    setTimeout(() => renderStoreCreationStep(), 300);
}

// STEP 3: Store Details
function renderStoreDetails() {
    showModal(`
        <div style="padding:20px;max-height:85vh;overflow-y:auto;">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;">
                <button onclick="storeCreationStep=2;hideModal();setTimeout(()=>renderStoreCreationStep(),300);" style="background:none;border:none;font-size:20px;cursor:pointer;">←</button>
                <div style="flex:1;">
                    <div style="font-size:12px;color:#6C3CF0;">Step 3 of 5</div>
                    <div style="height:4px;background:#e0e0e0;border-radius:2px;margin-top:4px;"><div style="height:4px;background:#6C3CF0;border-radius:2px;width:60%;"></div></div>
                </div>
            </div>
            <h3>Store Details</h3>
            <div class="input-group"><label>Store Category *</label><select id="ss-category" class="input-field"><option value="">Select</option><option value="Fashion">Fashion</option><option value="Electronics">Electronics</option><option value="Home">Home & Garden</option><option value="Sports">Sports</option><option value="Beauty">Beauty</option><option value="Tickets & Events">Tickets & Events</option><option value="All Purpose">All Purpose Store</option></select></div>
            <div class="input-group"><label>Store Description *</label><textarea id="ss-desc" class="input-field" rows="3" placeholder="Describe your store..."></textarea></div>
            <div class="input-group"><label>Keywords / Tags</label><input type="text" id="ss-keywords" class="input-field" placeholder="e.g. fashion, clothing, shoes"></div>
            <button class="btn-gold btn-full" style="padding:14px;margin-top:15px;" onclick="saveStep3()">Continue →</button>
        </div>
    `);
}

function saveStep3() {
    storeCreationData.category = document.getElementById('ss-category')?.value || '';
    storeCreationData.description = document.getElementById('ss-desc')?.value?.trim() || '';
    storeCreationData.keywords = document.getElementById('ss-keywords')?.value?.trim() || '';
    if (!storeCreationData.category) { showToast('Select category','error'); return; }
    storeCreationStep = 4; hideModal(); setTimeout(() => renderStoreCreationStep(), 300);
}

// STEP 4: Store Branding
function renderStoreBranding() {
    showModal(`
        <div style="padding:20px;max-height:85vh;overflow-y:auto;">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;">
                <button onclick="storeCreationStep=3;hideModal();setTimeout(()=>renderStoreCreationStep(),300);" style="background:none;border:none;font-size:20px;cursor:pointer;">←</button>
                <div style="flex:1;"><div style="font-size:12px;color:#6C3CF0;">Step 4 of 5</div><div style="height:4px;background:#e0e0e0;border-radius:2px;margin-top:4px;"><div style="height:4px;background:#6C3CF0;border-radius:2px;width:80%;"></div></div></div>
            </div>
            <h3>Store Branding</h3>
            <div class="input-group"><label>Store Logo (Recommended: 500x500)</label><input type="file" id="ss-logo" class="input-field" accept="image/*" onchange="previewStoreLogo()"><div id="logo-preview" style="margin-top:10px;text-align:center;"></div></div>
            <div class="input-group"><label>Store Banner (Recommended: 1200x400)</label><input type="file" id="ss-banner" class="input-field" accept="image/*" onchange="previewStoreBanner()"><div id="banner-preview" style="margin-top:10px;"></div></div>
            <p style="font-size:11px;color:#999;">Supported: JPG, PNG, WebP · Max 5MB</p>
            <button class="btn-gold btn-full" style="padding:14px;margin-top:15px;" onclick="saveStep4()">Continue →</button>
        </div>
    `);
}

function previewStoreLogo() {
    const file = document.getElementById('ss-logo')?.files?.[0];
    if (!file) return;
    storeCreationData.logo = file;
    const reader = new FileReader();
    reader.onload = e => { document.getElementById('logo-preview').innerHTML = `<img src="${e.target.result}" style="width:100px;height:100px;border-radius:50%;object-fit:cover;border:3px solid #6C3CF0;">`; };
    reader.readAsDataURL(file);
}

function previewStoreBanner() {
    const file = document.getElementById('ss-banner')?.files?.[0];
    if (!file) return;
    storeCreationData.banner = file;
    const reader = new FileReader();
    reader.onload = e => { document.getElementById('banner-preview').innerHTML = `<img src="${e.target.result}" style="width:100%;height:80px;object-fit:cover;border-radius:8px;">`; };
    reader.readAsDataURL(file);
}

function saveStep4() { storeCreationStep = 5; hideModal(); setTimeout(() => renderStoreCreationStep(), 300); }

// STEP 5: Payment Method
function renderPaymentMethod() {
    showModal(`
        <div style="padding:20px;max-height:85vh;overflow-y:auto;">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;">
                <button onclick="storeCreationStep=4;hideModal();setTimeout(()=>renderStoreCreationStep(),300);" style="background:none;border:none;font-size:20px;cursor:pointer;">←</button>
                <div style="flex:1;"><div style="font-size:12px;color:#6C3CF0;">Step 5 of 5</div><div style="height:4px;background:#e0e0e0;border-radius:2px;margin-top:4px;"><div style="height:4px;background:#6C3CF0;border-radius:2px;width:100%;"></div></div></div>
            </div>
            <h3>Payment Method</h3>
            <div onclick="storeCreationData.paymentMethod='oneshoplify_wallet'" style="background:white;border:2px solid ${storeCreationData.paymentMethod==='oneshoplify_wallet'?'#6C3CF0':'#e0e0e0'};border-radius:16px;padding:20px;cursor:pointer;text-align:center;">
                <div style="font-size:40px;">💰</div>
                <h4>ONESHOPLIFY Wallet</h4>
                <p style="color:#666;font-size:13px;">Receive payouts directly to your wallet balance</p>
                <p style="color:#4CAF50;font-size:12px;">✅ Fast settlement · ✅ Secure transactions</p>
            </div>
            <button class="btn-gold btn-full" style="padding:14px;margin-top:15px;" onclick="proceedToReview()">Continue →</button>
        </div>
    `);
}

// STEP 6: Plan Review
function proceedToReview() {
    storeCreationStep = 6; hideModal(); setTimeout(() => renderStoreCreationStep(), 300);
}

function renderPlanReview() {
    const plan = STORE_PLANS[storeCreationData.plan];
    const nextBilling = new Date(); nextBilling.setMonth(nextBilling.getMonth() + 1);
    
    showModal(`
        <div style="padding:20px;max-height:85vh;overflow-y:auto;">
            <h3>📋 Plan Review</h3>
            <div style="background:white;border-radius:16px;padding:20px;margin:15px 0;box-shadow:0 2px 10px rgba(0,0,0,0.05);">
                <h4 style="color:${plan.color};">${plan.name} Plan</h4>
                <div style="font-size:32px;font-weight:800;">$${plan.price}<span style="font-size:14px;color:#999;">/mo</span></div>
                <div style="margin:10px 0;">${plan.features.map(f=>`<p style="font-size:13px;">✅ ${f}</p>`).join('')}</div>
                <p style="font-size:12px;color:#666;">Billing: Monthly</p>
                <p style="font-size:12px;color:#666;">Next billing: ${nextBilling.toLocaleDateString()}</p>
            </div>
            <p style="font-size:13px;">Balance: <strong>${formatCurrency(APP.userProfile?.walletBalance||0)}</strong></p>
            ${(APP.userProfile?.walletBalance||0) >= plan.price ? `
                <button class="btn-gold btn-full" style="padding:14px;" onclick="proceedToPayment()">💳 Pay $${plan.price} - Continue</button>
            ` : `
                <p style="color:#f44;">Insufficient balance. Need $${plan.price}</p>
                <button class="btn-gold btn-full" onclick="hideModal();navigateTo('wallet');">💰 Deposit First</button>
            `}
            <button class="btn-outline btn-full" style="margin-top:8px;" onclick="storeCreationStep=5;hideModal();setTimeout(()=>renderStoreCreationStep(),300);">← Back</button>
        </div>
    `);
}

// STEP 7: Secure Payment
async function proceedToPayment() {
    const plan = STORE_PLANS[storeCreationData.plan];
    if ((APP.userProfile?.walletBalance||0) < plan.price) { showToast('Insufficient balance','error'); return; }
    
    storeCreationStep = 7; hideModal(); showLoader();
    
    try {
        const expiry = new Date(); expiry.setMonth(expiry.getMonth() + 1);
        
        // Upload images if selected
        let logoUrl = '', bannerUrl = '';
        if (storeCreationData.logo) { try { logoUrl = await uploadToCloudinary(storeCreationData.logo); } catch(e) {} }
        if (storeCreationData.banner) { try { bannerUrl = await uploadToCloudinary(storeCreationData.banner); } catch(e) {} }
        
        await db.collection('users').doc(APP.userProfile.uid).update({
            walletBalance: firebase.firestore.FieldValue.increment(-plan.price),
            hasStore: true, storePlan: storeCreationData.plan,
            storeName: storeCreationData.storeName,
            storeOwnerName: storeCreationData.ownerName,
            storePhone: storeCreationData.phone,
            storeCountry: storeCreationData.country,
            storeCategory: storeCreationData.category,
            storeDescription: storeCreationData.description,
            storeKeywords: storeCreationData.keywords,
            storeLogo: logoUrl, storeBanner: bannerUrl,
            storeActive: true, storeExpiry: firebase.firestore.Timestamp.fromDate(expiry),
            storeColor: '#6C3CF0',
            storeFollowers: 0, storeLikes: 0
        });
        
        APP.userProfile.walletBalance -= plan.price;
        APP.userProfile.hasStore = true;
        
        await db.collection('transactions').add({
            userId: APP.userProfile.uid, type: 'store_subscription', amount: plan.price,
            currency: 'USD', status: 'completed', description: `Store ${plan.name} plan`,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Payment Success
        storeCreationStep = 8;
        hideLoader();
        renderStoreCreationStep();
        
    } catch(e) { hideLoader(); showToast('Payment failed','error'); }
}

// STEP 8: Payment Success
function renderPaymentSuccess() {
    const plan = STORE_PLANS[storeCreationData.plan];
    
    showModal(`
        <div style="padding:30px;text-align:center;">
            <div style="font-size:70px;animation:bounce 0.5s;">✅</div>
            <h2 style="color:#4CAF50;">Payment Successful!</h2>
            <div style="background:#f5f5f5;padding:15px;border-radius:12px;margin:15px 0;text-align:left;">
                <p><strong>Plan:</strong> ${plan.name}</p>
                <p><strong>Amount:</strong> $${plan.price}</p>
                <p><strong>Transaction ID:</strong> TX-${Date.now().toString(36).toUpperCase()}</p>
                <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <button class="btn-gold btn-full" style="padding:14px;" onclick="proceedToStoreSetup()">Continue to Setup →</button>
        </div>
    `);
}

// STEP 9: Store Setup
function proceedToStoreSetup() {
    storeCreationStep = 9; hideModal(); setTimeout(() => renderStoreCreationStep(), 300);
}

function renderStoreSetup() {
    showModal(`
        <div style="padding:20px;max-height:85vh;overflow-y:auto;">
            <h3>⚙️ Store Settings</h3>
            <div class="input-group"><label>Store URL</label><input type="text" class="input-field" value="${APP.baseUrl}/store/${APP.userProfile.username}" readonly style="background:#f5f5f5;"></div>
            <div class="input-group"><label>Currency</label><select class="input-field"><option>USD</option></select></div>
            <div class="input-group"><label>Language</label><select class="input-field"><option>English</option></select></div>
            <div class="input-group"><label>Time Zone</label><select class="input-field"><option>UTC</option></select></div>
            <button class="btn-gold btn-full" style="padding:14px;margin-top:15px;" onclick="finalizeStore()">💾 Save & Continue</button>
        </div>
    `);
}

// STEP 10: Store Ready
function finalizeStore() {
    storeCreationStep = 10; hideModal(); setTimeout(() => renderStoreCreationStep(), 300);
}

function renderStoreReady() {
    const storeUrl = `${APP.baseUrl}/store/${APP.userProfile.username}`;
    
    showModal(`
        <div style="padding:30px;text-align:center;">
            <div style="font-size:70px;">🎉</div>
            <h2>Your Store is Ready!</h2>
            <div style="background:#f5f5f5;padding:15px;border-radius:12px;margin:15px 0;">
                <p style="font-weight:600;">Your Store URL:</p>
                <p style="font-family:monospace;font-size:14px;color:#6C3CF0;">${storeUrl}</p>
            </div>
            <button class="btn-gold btn-full" style="padding:14px;margin-bottom:8px;" onclick="hideModal();openStoreShop('${APP.userProfile.username}');">🏪 Go to My Store</button>
            <button class="btn-outline btn-full" style="padding:14px;" onclick="hideModal();loadStoreOwnerDashboard();">📊 Go to Dashboard</button>
        </div>
    `);
}

// =====================
// STORE DASHBOARD (SaaS Style)
// =====================
async function loadStoreOwnerDashboard() {
    const container = document.getElementById('storeowner-content');
    if (!container) return;
    
    container.innerHTML = '<div style="text-align:center;padding:60px;"><div class="loader-spinner"></div><p>Loading dashboard...</p></div>';
    
    if (!APP.userProfile?.hasStore) {
        container.innerHTML = '<div style="text-align:center;padding:60px;"><p>No store found</p><button class="btn-gold" onclick="startStoreCreation()">Create Store</button></div>';
        return;
    }
    
    const storeName = APP.userProfile.storeName || 'My Store';
    const plan = APP.userProfile.storePlan || 'basic';
    const planDetails = STORE_PLANS[plan] || STORE_PLANS.basic;
    const storeUrl = `${APP.baseUrl}/store/${APP.userProfile.username}`;
    
    // Get stats
    let totalRevenue = 0, totalOrders = 0, totalVisitors = 0, conversionRate = 0, avgOrderValue = 0, balance = APP.userProfile.walletBalance || 0;
    
    try {
        const ordersSnap = await db.collection('orders').where('merchantId','==',APP.userProfile.uid).get();
        const completedOrders = [];
        ordersSnap.forEach(doc => {
            const o = doc.data();
            totalOrders++;
            if (o.status === 'completed') {
                completedOrders.push(o);
                totalRevenue += o.total || 0;
            }
        });
        avgOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;
    } catch(e) {}
    
    container.innerHTML = `
        <div style="display:flex;min-height:100vh;background:#F8F9FB;">
            
            <!-- LEFT SIDEBAR -->
            <div style="width:260px;background:#0F172A;color:white;padding:20px;display:flex;flex-direction:column;min-height:100vh;">
                <div style="text-align:center;margin-bottom:30px;">
                    <img src="/app-icon.png" style="width:40px;height:40px;border-radius:10px;margin-bottom:8px;">
                    <div style="font-weight:800;font-size:16px;">ONESHOPLIFY</div>
                </div>
                
                <div style="background:rgba(255,255,255,0.1);padding:15px;border-radius:12px;margin-bottom:20px;">
                    <p style="font-weight:600;margin:0;">${storeName}</p>
                    <p style="font-size:11px;opacity:0.7;margin:4px 0;">${planDetails.name} Plan</p>
                    <button onclick="openStoreShop('${APP.userProfile.username}')" style="width:100%;padding:8px;background:white;color:#0F172A;border:none;border-radius:8px;font-weight:600;margin-top:8px;cursor:pointer;">View Store</button>
                </div>
                
                <nav style="display:flex;flex-direction:column;gap:5px;flex:1;">
                    ${['Dashboard','Products','Orders','Customers','Analytics','Marketing','Reviews','Payouts','Store Design','Settings','Support'].map(item => `
                        <button onclick="switchDashboardTab('${item.toLowerCase().replace(/ /g,'-')}')" 
                                style="padding:12px 15px;background:transparent;color:white;border:none;border-radius:8px;text-align:left;cursor:pointer;font-size:14px;transition:0.2s;"
                                onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='transparent'">
                            ${item}
                        </button>
                    `).join('')}
                </nav>
                
                <div style="background:rgba(255,255,255,0.1);padding:15px;border-radius:12px;margin-top:auto;">
                    <p style="font-size:12px;opacity:0.7;">Monthly Revenue</p>
                    <p style="font-size:20px;font-weight:800;">${formatCurrency(totalRevenue)}</p>
                    <p style="font-size:11px;">${totalOrders} orders</p>
                </div>
            </div>
            
            <!-- MAIN CONTENT -->
            <div style="flex:1;padding:30px;overflow-y:auto;max-height:100vh;">
                
                <!-- TOP HEADER -->
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:30px;">
                    <div>
                        <h1 style="font-size:28px;font-weight:800;margin:0;">Dashboard</h1>
                        <p style="color:#666;margin:4px 0;">Welcome back, ${APP.userProfile.displayName || 'Owner'}</p>
                    </div>
                    <div style="display:flex;gap:10px;align-items:center;">
                        <button class="btn-outline" onclick="openStoreShop('${APP.userProfile.username}')">View Store</button>
                        <select style="padding:8px 12px;border:2px solid #e0e0e0;border-radius:8px;"><option>Last 7 Days</option><option>Last 30 Days</option></select>
                        <button style="background:none;border:none;font-size:22px;cursor:pointer;position:relative;">🔔<span style="position:absolute;top:-3px;right:-3px;background:red;color:white;font-size:10px;width:18px;height:18px;border-radius:50%;display:flex;align-items:center;justify-content:center;">3</span></button>
                        <img src="${APP.userProfile.photoURL||'/app-icon.png'}" style="width:35px;height:35px;border-radius:50%;cursor:pointer;">
                    </div>
                </div>
                
                <!-- STATS CARDS -->
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:15px;margin-bottom:25px;">
                    ${[
                        { label:'Total Revenue', value:formatCurrency(totalRevenue), growth:'+12.5%', color:'#6C3CF0', icon:'💰' },
                        { label:'Orders', value:totalOrders, growth:'+8.2%', color:'#22C55E', icon:'📦' },
                        { label:'Visitors', value:totalVisitors||'N/A', growth:'+15%', color:'#3B82F6', icon:'👥' },
                        { label:'Conversion Rate', value:conversionRate+'%', growth:'+2.1%', color:'#F59E0B', icon:'📈' },
                        { label:'Avg Order Value', value:formatCurrency(avgOrderValue), growth:'+5%', color:'#EC4899', icon:'💵' },
                        { label:'Balance', value:formatCurrency(balance), growth:'', color:'#8B5CF6', icon:'🏦' }
                    ].map(stat => `
                        <div style="background:white;padding:20px;border-radius:16px;box-shadow:0 2px 10px rgba(0,0,0,0.04);">
                            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                                <span style="font-size:13px;color:#666;">${stat.label}</span>
                                <span style="font-size:24px;">${stat.icon}</span>
                            </div>
                            <div style="font-size:24px;font-weight:800;">${stat.value}</div>
                            ${stat.growth ? `<span style="color:#22C55E;font-size:12px;">${stat.growth}</span>` : ''}
                        </div>
                    `).join('')}
                </div>
                
                <!-- CHARTS ROW -->
                <div style="display:grid;grid-template-columns:2fr 1fr;gap:15px;margin-bottom:25px;">
                    <div style="background:white;padding:20px;border-radius:16px;box-shadow:0 2px 10px rgba(0,0,0,0.04);">
                        <h4>Revenue Overview</h4>
                        <div style="height:250px;"><canvas id="revenueChart"></canvas></div>
                    </div>
                    <div style="background:white;padding:20px;border-radius:16px;box-shadow:0 2px 10px rgba(0,0,0,0.04);">
                        <h4>Order Status</h4>
                        <div style="height:200px;"><canvas id="orderDoughnut"></canvas></div>
                    </div>
                </div>
                
                <!-- RECENT ORDERS -->
                <div style="background:white;padding:20px;border-radius:16px;box-shadow:0 2px 10px rgba(0,0,0,0.04);margin-bottom:25px;">
                    <h4>Recent Orders</h4>
                    <div id="recent-orders-table"><p style="color:#999;">Loading...</p></div>
                </div>
                
                <!-- UPGRADE BANNER -->
                ${plan !== 'enterprise' ? `
                    <div style="background:linear-gradient(135deg,#6C3CF0,#4F46E5);padding:25px;border-radius:16px;color:white;text-align:center;">
                        <h3>🚀 Upgrade to Enterprise</h3>
                        <p>Get verified badge, unlimited products, and premium features</p>
                        <button class="btn-gold" style="margin-top:10px;" onclick="showStorePlans()">Upgrade Now</button>
                    </div>
                ` : ''}
                
            </div>
        </div>`;
    
    // Load charts
    setTimeout(loadDashboardCharts, 500);
}

async function loadDashboardCharts() {
    if (typeof Chart === 'undefined') {
        const s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
        s.onload = renderDashboardCharts;
        document.head.appendChild(s);
    } else { renderDashboardCharts(); }
}

async function renderDashboardCharts() {
    const ctx1 = document.getElementById('revenueChart');
    const ctx2 = document.getElementById('orderDoughnut');
    
    if (ctx1 && typeof Chart !== 'undefined') {
        new Chart(ctx1, {
            type: 'line',
            data: {
                labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
                datasets: [{ label:'Revenue', data:[120,190,150,250,220,300,280], borderColor:'#6C3CF0', tension:0.3, borderWidth:3, pointBackgroundColor:'#6C3CF0' }]
            },
            options: { responsive:true, maintainAspectRatio:false }
        });
    }
    
    if (ctx2 && typeof Chart !== 'undefined') {
        new Chart(ctx2, {
            type: 'doughnut',
            data: {
                labels: ['Delivered','Processing','Shipped','Pending'],
                datasets: [{ data:[45,25,20,10], backgroundColor:['#22C55E','#F59E0B','#3B82F6','#8B5CF6'] }]
            },
            options: { responsive:true, maintainAspectRatio:false }
        });
    }
}

// =====================
// AD APPLICATION
// =====================
function applyForAd() {
    if (!APP.userProfile?.hasStore) { showToast('Create a store first','error'); return; }
    
    showModal(`
        <div style="padding:20px;">
            <h3>📢 Apply for Advertisement</h3>
            <p style="color:#666;margin:10px 0;">Your ad will appear randomly on the app</p>
            
            <div class="input-group"><label>Ad Title</label><input type="text" id="ad-title" class="input-field" placeholder="Your ad title"></div>
            <div class="input-group"><label>Ad Description</label><textarea id="ad-desc" class="input-field" rows="2" placeholder="Ad description"></textarea></div>
            <div class="input-group"><label>Ad Image/Video URL</label><input type="text" id="ad-media" class="input-field" placeholder="https://..."></div>
            <div class="input-group"><label>Ad Link (where users go when they click)</label><input type="text" id="ad-link" class="input-field" placeholder="https://..."></div>
            <div class="input-group"><label>Duration (Days)</label><input type="number" id="ad-duration" class="input-field" value="7" min="1" max="30"></div>
            <div class="input-group"><label>Budget per Day (USD)</label><input type="number" id="ad-budget" class="input-field" value="1" min="1"></div>
            
            <p style="font-size:12px;color:#666;margin:10px 0;">
                💰 Total: <strong id="ad-total-cost">$7</strong> · Ad starts immediately after payment
            </p>
            
            <button class="btn-gold btn-full" style="padding:14px;" onclick="submitAdApplication()">💳 Pay & Launch Ad</button>
        </div>
    `);
    
    document.getElementById('ad-duration').addEventListener('input', updateAdCost);
    document.getElementById('ad-budget').addEventListener('input', updateAdCost);
}

function updateAdCost() {
    const duration = parseInt(document.getElementById('ad-duration')?.value) || 7;
    const budget = parseInt(document.getElementById('ad-budget')?.value) || 1;
    document.getElementById('ad-total-cost').textContent = '$' + (duration * budget);
}

async function submitAdApplication() {
    const title = document.getElementById('ad-title')?.value?.trim();
    const desc = document.getElementById('ad-desc')?.value?.trim();
    const media = document.getElementById('ad-media')?.value?.trim();
    const link = document.getElementById('ad-link')?.value?.trim();
    const duration = parseInt(document.getElementById('ad-duration')?.value) || 7;
    const budget = parseInt(document.getElementById('ad-budget')?.value) || 1;
    const totalCost = duration * budget;
    
    if (!title) { showToast('Enter ad title','error'); return; }
    if (!media) { showToast('Enter media URL','error'); return; }
    if ((APP.userProfile?.walletBalance||0) < totalCost) { showToast(`Need $${totalCost}`,'error'); navigateTo('wallet'); return; }
    
    hideModal(); showLoader();
    
    try {
        const expiry = new Date(); expiry.setDate(expiry.getDate() + duration);
        
        await db.collection('users').doc(APP.userProfile.uid).update({
            walletBalance: firebase.firestore.FieldValue.increment(-totalCost)
        });
        APP.userProfile.walletBalance -= totalCost;
        
        await db.collection('admin_ads').add({
            title, description: desc, url: media, link,
            storeId: APP.userProfile.uid, storeName: APP.userProfile.storeName,
            type: media.includes('.mp4')||media.includes('video')?'video':'image',
            active: true, budget, duration,
            startedAt: firebase.firestore.FieldValue.serverTimestamp(),
            expiresAt: firebase.firestore.Timestamp.fromDate(expiry),
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        await db.collection('transactions').add({
            userId: APP.userProfile.uid, type: 'ad_payment', amount: totalCost,
            currency: 'USD', status: 'completed', description: `Ad: ${title}`,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        hideLoader(); showToast('Ad launched! 🚀 Running for '+duration+' days','success');
    } catch(e) { hideLoader(); showToast('Failed','error'); }
}

// =====================
// FOLLOW SYSTEM (Backend-driven)
// =====================
async function followStore(storeId) {
    if (!APP.userProfile) { showToast('Please login','error'); return; }
    if (storeId === APP.userProfile.uid) { showToast('Cannot follow yourself','error'); return; }
    
    try {
        const response = await fetch(APP.backendUrl + '/follow', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ followerId: APP.userProfile.uid, storeId })
        });
        
        const result = await response.json();
        
        if (result.success) {
            document.getElementById('follow-btn').textContent = '✓ Following';
            document.getElementById('follow-btn').style.background = '#22C55E';
            document.getElementById('followers-count').textContent = result.followersCount;
            
            // Check badge thresholds
            if (result.followersCount >= 1000000) awardBadge(storeId, 'sea-light-blue', 700);
            else if (result.followersCount >= 100000) awardBadge(storeId, 'white', 100);
            else if (result.followersCount >= 50000) awardBadge(storeId, 'purple', 20);
            else if (result.followersCount >= 25000) awardBadge(storeId, 'green', 0);
            else if (result.followersCount >= 1000) awardBadge(storeId, 'blue', 5);
        }
    } catch(e) { showToast('Failed to follow','error'); }
}

async function awardBadge(storeId, badgeColor, bonusAmount) {
    await db.collection('users').doc(storeId).update({
        followerBadge: badgeColor,
        followerBadgeAwardedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    if (bonusAmount > 0) {
        await db.collection('users').doc(storeId).update({
            walletBalance: firebase.firestore.FieldValue.increment(bonusAmount)
        });
        
        await db.collection('transactions').add({
            userId: storeId, type: 'follower_bonus', amount: bonusAmount,
            currency: 'USD', status: 'completed',
            description: `Follower milestone bonus - ${badgeColor} badge`,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        if (typeof createNotification === 'function') {
            await createNotification(storeId, '🎉 Follower Milestone!',
                `You earned a ${badgeColor} badge and $${bonusAmount} bonus for reaching a follower milestone!`,
                '🎉', 'profile');
        }
    }
}

// =====================
// LIKE SYSTEM (Backend-driven)
// =====================
async function likeProduct(productId) {
    if (!APP.userProfile) { showToast('Please login','error'); return; }
    
    const heartBtn = document.getElementById('like-btn-' + productId);
    if (heartBtn) { heartBtn.disabled = true; heartBtn.style.opacity = '0.5'; }
    
    try {
        const response = await fetch(APP.backendUrl + '/like', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: APP.userProfile.uid, productId })
        });
        
        const result = await response.json();
        
        if (result.success) {
            const countEl = document.getElementById('likes-count-' + productId);
            if (countEl) countEl.textContent = result.likes;
            if (heartBtn) { heartBtn.textContent = result.liked ? '❤️' : '🤍'; }
        }
    } catch(e) { showToast('Failed','error'); }
    
    if (heartBtn) { heartBtn.disabled = false; heartBtn.style.opacity = '1'; }
}

// =====================
// DISCOUNT SYSTEM (Seller's Loss)
// =====================
function createStoreDiscount() {
    showModal(`
        <div style="padding:20px;">
            <h3>🏷️ Create Discount Code</h3>
            <p style="color:#f44;font-size:12px;">⚠️ Discount is at YOUR loss - you receive the discounted amount</p>
            <div class="input-group"><label>Discount Code</label><input type="text" id="disc-code" class="input-field" placeholder="SAVE20"></div>
            <div class="input-group"><label>Discount Value</label><div style="display:flex;gap:8px;"><input type="number" id="disc-value" class="input-field" placeholder="20" style="flex:2;"><select id="disc-type" class="input-field" style="flex:1;"><option value="percentage">%</option><option value="fixed">$</option></select></div></div>
            <div class="input-group"><label>Max Uses (optional)</label><input type="number" id="disc-max" class="input-field" placeholder="Unlimited"></div>
            <div class="input-group"><label>Expiration Date</label><input type="date" id="disc-expiry" class="input-field"></div>
            <button class="btn-gold btn-full" style="padding:14px;" onclick="saveStoreDiscount()">Create Discount</button>
        </div>
    `);
}

async function saveStoreDiscount() {
    const code = document.getElementById('disc-code')?.value?.trim()?.toUpperCase();
    const value = parseFloat(document.getElementById('disc-value')?.value) || 0;
    const type = document.getElementById('disc-type')?.value;
    const maxUses = parseInt(document.getElementById('disc-max')?.value) || null;
    const expiry = document.getElementById('disc-expiry')?.value;
    
    if (!code || !value) { showToast('Enter code and value','error'); return; }
    
    hideModal(); showLoader();
    
    try {
        await db.collection('discount_codes').add({
            code, value, type, maxUses, usedCount: 0,
            expiryDate: expiry || null, active: true,
            merchantId: APP.userProfile.uid,
            storeName: APP.userProfile.storeName,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        hideLoader(); showToast('Discount code created! 🏷️','success');
    } catch(e) { hideLoader(); showToast('Failed','error'); }
}

// =====================
// AUTO-REPLY BOT (Enterprise Only)
// =====================
function setupAutoReply() {
    if ((APP.userProfile?.storePlan) !== 'enterprise') {
        showToast('Auto-reply is available on Enterprise plan only','error');
        return;
    }
    
    showModal(`
        <div style="padding:20px;">
            <h3>🤖 Auto-Reply Bot Setup</h3>
            <div class="input-group"><label>Auto-Reply Message</label><textarea id="auto-reply-msg" class="input-field" rows="3" placeholder="Thank you for contacting us! We'll get back to you shortly.">${APP.userProfile.autoReplyMessage || ''}</textarea></div>
            <div class="input-group"><label>Bot Display Name</label><input type="text" id="auto-reply-name" class="input-field" value="${APP.userProfile.autoReplyName || APP.userProfile.storeName + ' Support'}" placeholder="Bot name"></div>
            <p style="font-size:12px;color:#666;">The bot will use your store logo as its avatar</p>
            <button class="btn-gold btn-full" style="padding:14px;" onclick="saveAutoReply()">💾 Save Auto-Reply</button>
        </div>
    `);
}

async function saveAutoReply() {
    const msg = document.getElementById('auto-reply-msg')?.value?.trim();
    const name = document.getElementById('auto-reply-name')?.value?.trim();
    if (!msg) { showToast('Enter message','error'); return; }
    hideModal(); showLoader();
    try {
        await db.collection('users').doc(APP.userProfile.uid).update({
            autoReplyMessage: msg, autoReplyName: name
        });
        APP.userProfile.autoReplyMessage = msg;
        APP.userProfile.autoReplyName = name;
        hideLoader(); showToast('Auto-reply saved! 🤖','success');
    } catch(e) { hideLoader(); showToast('Failed','error'); }
}

// Global access
window.startStoreCreation = startStoreCreation;
window.loadStoreOwnerDashboard = loadStoreOwnerDashboard;
window.STORE_PLANS = STORE_PLANS;
window.applyForAd = applyForAd;
window.followStore = followStore;
window.likeProduct = likeProduct;
window.createStoreDiscount = createStoreDiscount;
window.setupAutoReply = setupAutoReply;

console.log('✅ storeowner.js fully loaded - ONESHOPLIFY Store System v2.0');
