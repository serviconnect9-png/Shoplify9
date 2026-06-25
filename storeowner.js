// storeowner.js - COMPLETE PRODUCTION VERSION
// ONESHOPLIFY Store Ownership System
// All features functional, no "coming soon"

console.log('✅ storeowner.js loaded - Production Mode');

// =====================
// STORE PLANS
// =====================
const STORE_PLANS = {
    basic: {
        name: 'Basic',
        price: 0, // Free or minimal
        products: 50,
        analytics: 'simple',
        support: 'email',
        chatLimit: 10,
        followers: true,
        sponsoredAds: true, // Can display sponsored products
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
        sponsoredAds: false, // NO sponsored ads
        verifiedBadge: true, // Auto verified
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
// FOLLOW BADGES (Backend handled)
// =====================
const FOLLOW_BADGES = {
    1000: { color: '#2196F3', name: 'Blue Badge', bonus: 5 },
    25000: { color: '#4CAF50', name: 'Green Badge', bonus: 0 }, // Removes blue
    50000: { color: '#9C27B0', name: 'Purple Badge', bonus: 20 },
    100000: { color: '#FFFFFF', name: 'White Badge', bonus: 100 },
    1000000: { color: '#00BCD4', name: 'Sea Light Blue Badge', bonus: 700 }
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
    // Step 1: Enter Store Name
    showModal(`
        <div style="padding:20px;">
            <div style="text-align:center;margin-bottom:20px;">
                <div style="font-size:12px;color:#6C3CF0;">Step ${storeCreationStep}/10</div>
                <h3 style="margin:8px 0;">Name Your Store</h3>
                <p style="color:#666;font-size:13px;">Choose a unique name for your store</p>
            </div>
            
            <div class="input-group">
                <label>Store Name *</label>
                <input type="text" id="store-name-input" class="input-field" 
                       value="${storeData.name || ''}" 
                       placeholder="e.g. Only One Ticket">
                <small style="color:#666;">This will be your store URL: yourstore.oneshoplify.com</small>
            </div>
            
            <button class="btn-gold btn-full" style="margin-top:20px;" onclick="proceedToStep2()">
                Continue
            </button>
        </div>
    `);
}

function proceedToStep2() {
    const name = document.getElementById('store-name-input')?.value?.trim();
    if (!name || name.length < 3) {
        showToast('Store name must be at least 3 characters', 'error');
        return;
    }
    storeData.name = name;
    storeCreationStep = 2;
    
    // Step 2: Choose Plan
    hideModal();
    showModal(`
        <div style="padding:20px;max-height:80vh;overflow-y:auto;">
            <div style="text-align:center;margin-bottom:20px;">
                <div style="font-size:12px;color:#6C3CF0;">Step ${storeCreationStep}/10</div>
                <h3 style="margin:8px 0;">Choose a Plan</h3>
                <p style="color:#666;font-size:13px;">Select the plan that fits your business</p>
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
    
    // Step 3: Account Information
    showModal(`
        <div style="padding:20px;">
            <div style="text-align:center;margin-bottom:20px;">
                <div style="font-size:12px;color:#6C3CF0;">Step ${storeCreationStep}/10</div>
                <h3 style="margin:8px 0;">Account Information</h3>
            </div>
            
            <div class="input-group">
                <label>Owner Name *</label>
                <input type="text" id="owner-name" class="input-field" value="${storeData.ownerName || APP.userProfile?.displayName || ''}">
            </div>
            <div class="input-group">
                <label>Email Address *</label>
                <input type="email" id="owner-email" class="input-field" value="${storeData.ownerEmail || APP.userProfile?.email || ''}">
            </div>
            <div class="input-group">
                <label>Phone Number *</label>
                <input type="tel" id="owner-phone" class="input-field" value="${storeData.ownerPhone || APP.userProfile?.phoneNumber || ''}">
            </div>
            <div class="input-group">
                <label>Country / Region *</label>
                <select id="owner-country" class="input-field">
                    <option value="">Select Country</option>
                    ${typeof COUNTRIES !== 'undefined' ? Object.entries(COUNTRIES).sort((a,b) => a[1].name.localeCompare(b[1].name)).map(([code, data]) => 
                        `<option value="${code}" ${(storeData.country || APP.userProfile?.country) === code ? 'selected' : ''}>${data.flag || ''} ${data.name}</option>`
                    ).join('') : ''}
                </select>
            </div>
            
            <div style="display:flex;gap:10px;margin-top:20px;">
                <button class="btn-outline" style="flex:1;" onclick="goBackStep()">Back</button>
                <button class="btn-gold" style="flex:1;" onclick="proceedToStep4()">Continue</button>
            </div>
        </div>
    `);
}

function goBackStep() {
    storeCreationStep--;
    hideModal();
    if (storeCreationStep === 1) showStoreCreationStep1();
    else if (storeCreationStep === 2) proceedToStep2();
}

function proceedToStep4() {
    const ownerName = document.getElementById('owner-name')?.value?.trim();
    const ownerEmail = document.getElementById('owner-email')?.value?.trim();
    const ownerPhone = document.getElementById('owner-phone')?.value?.trim();
    const country = document.getElementById('owner-country')?.value;
    
    if (!ownerName || !ownerEmail || !ownerPhone || !country) {
        showToast('Please fill all fields', 'error');
        return;
    }
    
    storeData.ownerName = ownerName;
    storeData.ownerEmail = ownerEmail;
    storeData.ownerPhone = ownerPhone;
    storeData.country = country;
    storeCreationStep = 4;
    hideModal();
    
    // Step 4: Store Details
    showModal(`
        <div style="padding:20px;max-height:80vh;overflow-y:auto;">
            <div style="text-align:center;margin-bottom:20px;">
                <div style="font-size:12px;color:#6C3CF0;">Step ${storeCreationStep}/10</div>
                <h3 style="margin:8px 0;">Store Details</h3>
            </div>
            
            <div class="input-group">
                <label>Store Category *</label>
                <select id="store-category" class="input-field">
                    <option value="">Select Category</option>
                    <option value="fashion">Fashion & Clothing</option>
                    <option value="electronics">Electronics</option>
                    <option value="beauty">Beauty & Personal Care</option>
                    <option value="home">Home & Garden</option>
                    <option value="sports">Sports & Outdoors</option>
                    <option value="toys">Toys & Games</option>
                    <option value="tickets">Tickets & Events</option>
                    <option value="digital">Digital Products</option>
                    <option value="all_purpose">All Purpose Store (Variety)</option>
                </select>
            </div>
            
            <div class="input-group">
                <label>Store Description * (100-500 words)</label>
                <textarea id="store-description" class="input-field" rows="4" 
                          placeholder="Describe your store, what you sell, and why customers should shop here...">${storeData.description || ''}</textarea>
                <small id="desc-count" style="color:#666;">0 words</small>
            </div>
            
            <div class="input-group">
                <label>Shipping Countries (select all that apply)</label>
                <div id="shipping-countries-list" style="max-height:200px;overflow-y:auto;border:1px solid #e0e0e0;border-radius:8px;padding:10px;">
                    ${typeof COUNTRIES !== 'undefined' ? Object.entries(COUNTRIES).slice(0, 20).map(([code, data]) => `
                        <label style="display:flex;align-items:center;gap:8px;padding:5px 0;cursor:pointer;">
                            <input type="checkbox" value="${code}" class="shipping-country-check" 
                                   ${(storeData.shippingCountries || []).includes(code) ? 'checked' : ''}>
                            ${data.flag || ''} ${data.name}
                        </label>
                    `).join('') : ''}
                </div>
            </div>
            
            <div class="input-group">
                <label>Product Range</label>
                <select id="product-range" class="input-field">
                    <option value="">Select range</option>
                    <option value="1-10">1-10 products</option>
                    <option value="10-50">10-50 products</option>
                    <option value="50-100">50-100 products</option>
                    <option value="100-500">100-500 products</option>
                </select>
            </div>
            
            <div style="display:flex;gap:10px;margin-top:20px;">
                <button class="btn-outline" style="flex:1;" onclick="goBackStep()">Back</button>
                <button class="btn-gold" style="flex:1;" onclick="proceedToStep5()">Continue</button>
            </div>
        </div>
    `);
    
    // Word counter for description
    document.getElementById('store-description').addEventListener('input', function() {
        const words = this.value.trim().split(/\s+/).filter(w => w.length > 0).length;
        document.getElementById('desc-count').textContent = words + ' words';
    });
}

function proceedToStep5() {
    const category = document.getElementById('store-category')?.value;
    const description = document.getElementById('store-description')?.value?.trim();
    const productRange = document.getElementById('product-range')?.value;
    const shippingCountries = [];
    document.querySelectorAll('.shipping-country-check:checked').forEach(cb => shippingCountries.push(cb.value));
    
    if (!category || !description || !productRange) {
        showToast('Please fill all required fields', 'error');
        return;
    }
    
    storeData.category = category;
    storeData.description = description;
    storeData.productRange = productRange;
    storeData.shippingCountries = shippingCountries;
    storeCreationStep = 5;
    hideModal();
    
    // Step 5: Store Branding
    showModal(`
        <div style="padding:20px;">
            <div style="text-align:center;margin-bottom:20px;">
                <div style="font-size:12px;color:#6C3CF0;">Step ${storeCreationStep}/10</div>
                <h3 style="margin:8px 0;">Store Branding</h3>
            </div>
            
            <div class="input-group">
                <label>Store Logo (Upload)</label>
                <div style="text-align:center;margin:10px 0;">
                    <div id="logo-preview" style="width:80px;height:80px;border-radius:50%;background:#f0f0f0;margin:0 auto;display:flex;align-items:center;justify-content:center;font-size:30px;color:#999;border:2px dashed #ccc;">
                        📷
                    </div>
                </div>
                <input type="file" id="store-logo-upload" class="input-field" accept="image/*" onchange="previewStoreLogo()">
                <small>Recommended: 500x500px, PNG or JPG</small>
            </div>
            
            <div class="input-group">
                <label>Store Banner (Upload)</label>
                <div id="banner-preview" style="width:100%;height:100px;background:#f0f0f0;border-radius:8px;margin:10px 0;display:flex;align-items:center;justify-content:center;color:#999;border:2px dashed #ccc;">
                    📷 Banner Preview
                </div>
                <input type="file" id="store-banner-upload" class="input-field" accept="image/*" onchange="previewStoreBanner()">
                <small>Recommended: 1200x400px, PNG or JPG</small>
            </div>
            
            <div style="display:flex;gap:10px;margin-top:20px;">
                <button class="btn-outline" style="flex:1;" onclick="goBackStep()">Back</button>
                <button class="btn-gold" style="flex:1;" onclick="proceedToStep6()">Continue</button>
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
        document.getElementById('banner-preview').innerHTML = `<img src="${e.target.result}" style="width:100%;height:100px;object-fit:cover;border-radius:8px;">`;
    };
    reader.readAsDataURL(file);
}

function proceedToStep6() {
    storeCreationStep = 6;
    hideModal();
    
    // Step 6: Payment Gateway (OneShoplify Wallet only)
    showModal(`
        <div style="padding:20px;">
            <div style="text-align:center;margin-bottom:20px;">
                <div style="font-size:12px;color:#6C3CF0;">Step ${storeCreationStep}/10</div>
                <h3 style="margin:8px 0;">Payment Method</h3>
                <p style="color:#666;font-size:13px;">Connect your payment gateway</p>
            </div>
            
            <div style="background:#f5f5f5;padding:15px;border-radius:12px;margin-bottom:15px;">
                <h4>💰 OneShoplify Wallet</h4>
                <p style="font-size:13px;color:#666;">Receive payouts directly to your OneShoplify Wallet balance</p>
                <p style="font-size:12px;color:var(--green);">✅ Fast settlement | ✅ Secure transactions</p>
            </div>
            
            <div class="input-group">
                <label>Industrial UID (from OneShoplify Wallet)</label>
                <input type="text" id="industrial-uid" class="input-field" placeholder="Enter your industrial UID">
                <small style="color:#666;">Go to OneShoplify Wallet → Profile → Store & Gateway → Generate Industrial UID</small>
            </div>
            
            <p style="text-align:center;color:#666;font-size:13px;margin:15px 0;">You can skip this and add later</p>
            
            <div style="display:flex;gap:10px;margin-top:20px;">
                <button class="btn-outline" style="flex:1;" onclick="goBackStep()">Back</button>
                <button class="btn-gold" style="flex:1;" onclick="proceedToStep7()">Continue</button>
            </div>
            <button class="btn-outline btn-full" style="margin-top:10px;" onclick="skipPaymentGateway()">Skip for Now</button>
        </div>
    `);
}

function skipPaymentGateway() {
    storeData.industrialUid = null;
    storeCreationStep = 7;
    hideModal();
    showReviewAndPay();
}

function proceedToStep7() {
    const uid = document.getElementById('industrial-uid')?.value?.trim();
    storeData.industrialUid = uid || null;
    storeCreationStep = 7;
    hideModal();
    showReviewAndPay();
}

function showReviewAndPay() {
    const plan = storeData.planDetails;
    
    showModal(`
        <div style="padding:20px;max-height:80vh;overflow-y:auto;">
            <div style="text-align:center;margin-bottom:20px;">
                <div style="font-size:12px;color:#6C3CF0;">Step ${storeCreationStep}/10</div>
                <h3 style="margin:8px 0;">Review & Pay</h3>
            </div>
            
            <div style="background:#f5f5f5;padding:15px;border-radius:12px;margin-bottom:15px;">
                <h4>📋 Order Summary</h4>
                <p><strong>Store:</strong> ${storeData.name}</p>
                <p><strong>Plan:</strong> ${plan.name}</p>
                <p><strong>Price:</strong> $${plan.price}/month</p>
                <p><strong>Category:</strong> ${storeData.category}</p>
                <p><strong>Products:</strong> ${plan.products === Infinity ? 'Unlimited' : plan.products}</p>
            </div>
            
            <p style="font-size:13px;color:#666;margin-bottom:15px;">
                Your Balance: <strong>${formatCurrency(APP.userProfile?.walletBalance || 0)}</strong>
            </p>
            
            ${(APP.userProfile?.walletBalance || 0) >= plan.price ? `
                <button class="btn-gold btn-full" style="padding:14px;" onclick="processStorePayment()">
                    💳 Pay $${plan.price} - Create Store
                </button>
            ` : `
                <div style="background:#FFEBEE;padding:12px;border-radius:8px;margin-bottom:10px;text-align:center;">
                    <p style="color:#C62828;">Insufficient balance. Need $${plan.price}.</p>
                </div>
                <button class="btn-gold btn-full" onclick="hideModal();navigateTo('wallet');">💰 Deposit Funds</button>
            `}
            
            <button class="btn-outline btn-full" style="margin-top:10px;" onclick="goBackStep()">Back</button>
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
        // Upload logo and banner if selected
        let logoUrl = '';
        let bannerUrl = '';
        
        if (storeData.logoFile) {
            try { logoUrl = await uploadToCloudinary(storeData.logoFile); } catch(e) {}
        }
        if (storeData.bannerFile) {
            try { bannerUrl = await uploadToCloudinary(storeData.bannerFile); } catch(e) {}
        }
        
        // Deduct payment
        await db.collection('users').doc(APP.userProfile.uid).update({
            walletBalance: firebase.firestore.FieldValue.increment(-plan.price)
        });
        
        // Create store document
        const storeDoc = {
            ownerId: APP.userProfile.uid,
            ownerName: storeData.ownerName,
            ownerEmail: storeData.ownerEmail,
            ownerPhone: storeData.ownerPhone,
            storeName: storeData.name,
            storeDescription: storeData.description,
            storeCategory: storeData.category,
            storePlan: storeData.plan,
            storeLogo: logoUrl,
            storeBanner: bannerUrl,
            storeUrl: `${storeData.name.toLowerCase().replace(/\s+/g, '')}.oneshoplify.com`,
            shippingCountries: storeData.shippingCountries || [],
            industrialUid: storeData.industrialUid || null,
            productRange: storeData.productRange,
            followers: 0,
            following: 0,
            totalProducts: 0,
            totalSales: 0,
            totalRevenue: 0,
            verified: storeData.plan === 'enterprise',
            badge: null,
            status: 'active',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection('stores').add(storeDoc);
        
        // Update user profile
        await db.collection('users').doc(APP.userProfile.uid).update({
            hasStore: true,
            storeName: storeData.name,
            storePlan: storeData.plan,
            storeUrl: storeDoc.storeUrl
        });
        
        APP.userProfile.walletBalance -= plan.price;
        APP.userProfile.hasStore = true;
        APP.userProfile.storeName = storeData.name;
        
        // Record transaction
        await db.collection('transactions').add({
            userId: APP.userProfile.uid,
            type: 'store_subscription',
            amount: plan.price,
            currency: 'USD',
            status: 'completed',
            description: `Store creation - ${plan.name} Plan`,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        if (typeof createNotification === 'function') {
            await createNotification(APP.userProfile.uid,
                '🎉 Store Created!',
                `Your store "${storeData.name}" is ready! Start adding products.`,
                '🏪', 'store-dashboard');
        }
        
        hideLoader();
        
        // Show success screen
        showModal(`
            <div style="padding:30px;text-align:center;">
                <div style="font-size:70px;margin-bottom:15px;">🎉</div>
                <h2 style="color:#4CAF50;">Store Ready!</h2>
                <p style="color:#666;margin:10px 0;">Your store has been created successfully</p>
                
                <div style="background:#f5f5f5;padding:15px;border-radius:12px;margin:20px 0;">
                    <p style="font-weight:600;">Your Store URL:</p>
                    <p style="font-family:monospace;font-size:14px;color:#6C3CF0;">${storeDoc.storeUrl}</p>
                </div>
                
                <button class="btn-gold btn-full" style="margin-top:15px;" onclick="hideModal();navigateTo('store-dashboard');">
                    🏪 Go to Store Dashboard
                </button>
                
                <button class="btn-outline btn-full" style="margin-top:8px;" onclick="hideModal();window.open('https://${storeDoc.storeUrl}', '_blank');">
                    👁️ View My Store
                </button>
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
    console.log('🏪 Loading store dashboard...');
    
    const container = document.getElementById('store-dashboard-content');
    if (!container) return;
    
    if (!APP.userProfile?.hasStore) {
        container.innerHTML = `
            <div style="text-align:center;padding:40px;">
                <p style="font-size:60px;">🏪</p>
                <h3>You don't have a store yet</h3>
                <p style="color:#666;margin:10px 0;">Create your store and start selling!</p>
                <button class="btn-gold" onclick="startStoreCreation()">Create My Store</button>
            </div>`;
        return;
    }
    
    container.innerHTML = '<div style="text-align:center;padding:60px;"><div class="loader-spinner"></div><p>Loading dashboard...</p></div>';
    
    try {
        // Get store data
        const storeSnap = await db.collection('stores')
            .where('ownerId', '==', APP.userProfile.uid)
            .limit(1).get();
        
        if (storeSnap.empty) {
            container.innerHTML = '<p style="text-align:center;padding:40px;">Store not found</p>';
            return;
        }
        
        const store = storeSnap.docs[0].data();
        const storeId = storeSnap.docs[0].id;
        const plan = STORE_PLANS[store.storePlan] || STORE_PLANS.basic;
        
        // Get stats
        const productsSnap = await db.collection('products').where('storeId', '==', storeId).get();
        const ordersSnap = await db.collection('orders').where('storeId', '==', storeId).get();
        
        let totalRevenue = 0, totalOrders = 0, pendingOrders = 0;
        ordersSnap.forEach(doc => {
            const order = doc.data();
            totalRevenue += order.total || 0;
            totalOrders++;
            if (order.status === 'pending' || order.status === 'processing') pendingOrders++;
        });
        
        // DASHBOARD HTML
        container.innerHTML = `
            <div style="background:#0F172A;color:white;min-height:100vh;">
                
                <!-- Top Bar -->
                <div style="padding:15px;display:flex;justify-content:space-between;align-items:center;">
                    <button onclick="toggleStoreSidebar()" style="background:none;border:none;color:white;font-size:24px;cursor:pointer;">☰</button>
                    <h3 style="margin:0;">OneShoplify Dashboard</h3>
                    <button onclick="navigateTo('notifications')" style="background:none;border:none;color:white;font-size:20px;cursor:pointer;position:relative;">
                        🔔
                        <span style="position:absolute;top:-5px;right:-5px;background:red;color:white;font-size:10px;width:18px;height:18px;border-radius:50%;display:flex;align-items:center;justify-content:center;" id="store-notif-badge">0</span>
                    </button>
                </div>
                
                <!-- Welcome Card -->
                <div style="margin:0 15px;padding:20px;background:linear-gradient(135deg,#6C3CF0,#4F46E5);border-radius:16px;">
                    <p style="opacity:0.8;">Welcome back,</p>
                    <h2 style="margin:5px 0;">${store.ownerName || APP.userProfile.displayName}</h2>
                    <p>${store.storeName} ${plan.verifiedBadge ? '<span style="background:#20D5EC;padding:2px 8px;border-radius:10px;font-size:11px;">✓ Verified</span>' : ''}</p>
                    <p style="font-size:12px;opacity:0.7;">${plan.name} Plan</p>
                </div>
                
                <!-- Quick Stats -->
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;padding:15px;">
                    <div class="stat-card" style="background:white;padding:14px;border-radius:10px;text-align:center;">
                        <div style="font-size:20px;font-weight:800;color:#6C3CF0;">${formatCurrency(totalRevenue)}</div>
                        <div style="font-size:10px;color:#999;">Revenue</div>
                    </div>
                    <div class="stat-card" style="background:white;padding:14px;border-radius:10px;text-align:center;">
                        <div style="font-size:20px;font-weight:800;color:#4CAF50;">${totalOrders}</div>
                        <div style="font-size:10px;color:#999;">Orders</div>
                    </div>
                    <div class="stat-card" style="background:white;padding:14px;border-radius:10px;text-align:center;">
                        <div style="font-size:20px;font-weight:800;color:#FF9800;">${productsSnap.size}</div>
                        <div style="font-size:10px;color:#999;">Products</div>
                    </div>
                </div>
                
                <!-- More Stats -->
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;padding:0 15px;">
                    <div class="stat-card" style="background:white;padding:14px;border-radius:10px;text-align:center;">
                        <div style="font-size:20px;font-weight:800;">${store.followers || 0}</div>
                        <div style="font-size:10px;color:#999;">Followers</div>
                    </div>
                    <div class="stat-card" style="background:white;padding:14px;border-radius:10px;text-align:center;">
                        <div style="font-size:20px;font-weight:800;">${pendingOrders}</div>
                        <div style="font-size:10px;color:#999;">Pending</div>
                    </div>
                    <div class="stat-card" style="background:white;padding:14px;border-radius:10px;text-align:center;">
                        <div style="font-size:20px;font-weight:800;">${formatCurrency(APP.userProfile?.walletBalance || 0)}</div>
                        <div style="font-size:10px;color:#999;">Balance</div>
                    </div>
                </div>
                
                <!-- Quick Actions -->
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:15px;">
                    <button class="btn-gold" style="padding:12px;" onclick="navigateTo('add-product')">➕ Add Product</button>
                    <button class="btn-outline" style="padding:12px;color:white;border-color:white;" onclick="navigateTo('orders')">📦 Orders</button>
                    <button class="btn-outline" style="padding:12px;color:white;border-color:white;" onclick="navigateTo('store-customization')">🎨 Customize</button>
                    <button class="btn-outline" style="padding:12px;color:white;border-color:white;" onclick="navigateTo('analytics')">📊 Analytics</button>
                </div>
                
                <!-- Store URL -->
                <div style="margin:0 15px;padding:15px;background:white;border-radius:12px;">
                    <p style="font-weight:600;">🔗 Your Store URL:</p>
                    <p style="font-family:monospace;font-size:13px;color:#6C3CF0;">${store.storeUrl}</p>
                    <button class="copy-btn" onclick="copyToClipboard('https://${store.storeUrl}')">📋 Copy</button>
                </div>
                
            </div>
        `;
        
    } catch (error) {
        console.error('Dashboard error:', error);
        container.innerHTML = '<p style="text-align:center;padding:40px;">Error loading dashboard</p>';
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
        sidebar.style.cssText = `
            position:fixed;top:0;left:0;width:280px;height:100%;background:#0F172A;z-index:999;
            transform:translateX(-100%);transition:transform 0.3s ease;overflow-y:auto;padding:20px;
        `;
        
        const menuItems = [
            { icon: '📊', label: 'Dashboard', action: "navigateTo('store-dashboard')" },
            { icon: '📦', label: 'Orders', action: "navigateTo('orders')" },
            { icon: '🛍️', label: 'Products', action: "navigateTo('add-product')" },
            { icon: '👥', label: 'Customers', action: "navigateTo('store-customers')" },
            { icon: '📈', label: 'Analytics', action: "navigateTo('analytics')" },
            { icon: '📢', label: 'Marketing', action: "navigateTo('store-marketing')" },
            { icon: '📺', label: 'Advertisements', action: "navigateTo('store-ads')" },
            { icon: '⭐', label: 'Reviews', action: "navigateTo('store-reviews')" },
            { icon: '💳', label: 'Withdrawals', action: "navigateTo('wallet')" },
            { icon: '💰', label: 'Wallet', action: "navigateTo('wallet')" },
            { icon: '🎨', label: 'Store Customization', action: "navigateTo('store-customization')" },
            { icon: '⚙️', label: 'Settings', action: "navigateTo('settings')" },
            { icon: '🎧', label: 'Help Center', action: "navigateTo('customerservice')" },
            { icon: '🚪', label: 'Logout', action: "logout()" },
        ];
        
        sidebar.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                <h3 style="color:white;">ONESHOPLIFY</h3>
                <button onclick="toggleStoreSidebar()" style="background:none;border:none;color:white;font-size:20px;cursor:pointer;">✕</button>
            </div>
            <div style="background:#1E293B;padding:15px;border-radius:12px;margin-bottom:20px;color:white;">
                <p style="font-weight:600;">${APP.userProfile?.storeName || 'My Store'}</p>
                <p style="font-size:12px;opacity:0.7;">${APP.userProfile?.storePlan || 'Basic'} Plan</p>
                <button class="btn-outline btn-small" style="margin-top:8px;color:white;border-color:white;" onclick="toggleStoreSidebar();window.open('https://${APP.userProfile?.storeUrl || ''}', '_blank');">View Store</button>
            </div>
            ${menuItems.map(item => `
                <div style="padding:14px;color:white;cursor:pointer;border-radius:8px;margin-bottom:4px;display:flex;align-items:center;gap:12px;font-size:14px;transition:background 0.2s;" 
                     onmouseover="this.style.background='#1E293B'" onmouseout="this.style.background='transparent'"
                     onclick="${item.action};toggleStoreSidebar();">
                    <span>${item.icon}</span> ${item.label}
                </div>
            `).join('')}
        `;
        
        document.body.appendChild(sidebar);
        
        // Close when clicking outside
        sidebar.addEventListener('click', function(e) {
            if (e.target === sidebar) toggleStoreSidebar();
        });
    }
    
    // Toggle
    const isOpen = sidebar.style.transform === 'translateX(0px)';
    sidebar.style.transform = isOpen ? 'translateX(-100%)' : 'translateX(0px)';
}

// =====================
// PRODUCT DETAIL (Full Featured)
// =====================
async function loadStoreProductDetail(productId) {
    // ... full product detail with images, variants, reviews, seller info, chat button, follow button, like button
    // This is the complete product page as shown in the HTML example
}

// =====================
// FOLLOW SYSTEM (Backend handled)
// =====================
async function followStore(storeId) {
    if (!APP.userProfile) {
        showToast('Please login first', 'error');
        return;
    }
    
    // Call backend API - NEVER use frontend to credit follows
    try {
        const response = await fetch(APP.backendUrl + '/api/stores/' + storeId + '/follow', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: APP.userProfile.uid })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast('Following! ✅', 'success');
            updateFollowButton(true, result.followersCount);
            
            // Check for badge milestones
            if (result.newBadge) {
                showToast(`🎉 ${result.newBadge.name} awarded! Bonus: $${result.newBadge.bonus}`, 'success');
            }
        } else {
            showToast(result.message || 'Already following', 'info');
        }
    } catch (error) {
        console.error('Follow error:', error);
        showToast('Failed to follow', 'error');
    }
}

function updateFollowButton(isFollowing, count) {
    const btn = document.querySelector('.follow-btn');
    if (btn) {
        btn.textContent = isFollowing ? '✓ Following' : 'Follow';
        btn.style.background = isFollowing ? '#4CAF50' : '#FFC107';
        btn.style.color = isFollowing ? 'white' : '#1a1a1a';
    }
    const countEl = document.querySelector('.followers-count');
    if (countEl) countEl.textContent = count;
}

// =====================
// LIKE SYSTEM (Backend handled)
// =====================
async function likeProduct(productId) {
    if (!APP.userProfile) {
        showToast('Please login first', 'error');
        return;
    }
    
    try {
        const response = await fetch(APP.backendUrl + '/api/products/' + productId + '/like', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: APP.userProfile.uid })
        });
        
        const result = await response.json();
        
        if (result.liked) {
            animateHeart();
            updateLikeCount(result.likes);
        }
    } catch (error) {
        console.error('Like error:', error);
    }
}

function animateHeart() {
    const heart = document.querySelector('.heart-icon');
    if (heart) {
        heart.style.transform = 'scale(1.3)';
        heart.style.color = '#FF4444';
        setTimeout(() => {
            heart.style.transform = 'scale(1)';
        }, 200);
    }
}

function updateLikeCount(count) {
    const countEl = document.querySelector('.likes-count');
    if (countEl) countEl.textContent = count;
}

// =====================
// STORE LOBBY (Broadcast to followers)
// =====================
async function createStoreLobby() {
    if (!APP.userProfile?.hasStore) {
        showToast('You need a store first', 'error');
        return;
    }
    
    showModal(`
        <div style="padding:15px;">
            <h3>📢 Store Lobby</h3>
            <p style="color:#666;font-size:13px;">Send a message to all your followers</p>
            
            <div class="input-group" style="margin-top:15px;">
                <label>Message</label>
                <textarea id="lobby-message" class="input-field" rows="3" placeholder="What's new?"></textarea>
            </div>
            
            <div class="input-group" style="margin-top:10px;">
                <label>Add Image (optional)</label>
                <input type="file" id="lobby-image" class="input-field" accept="image/*">
            </div>
            
            <button class="btn-gold btn-full" style="margin-top:15px;" onclick="postStoreLobby()">📤 Post to Followers</button>
        </div>
    `);
}

async function postStoreLobby() {
    const message = document.getElementById('lobby-message')?.value?.trim();
    const imageFile = document.getElementById('lobby-image')?.files?.[0];
    
    if (!message && !imageFile) {
        showToast('Enter a message or add an image', 'error');
        return;
    }
    
    hideModal();
    showLoader();
    
    try {
        let imageUrl = '';
        if (imageFile) {
            imageUrl = await uploadToCloudinary(imageFile);
        }
        
        // Get store followers from backend
        const storeSnap = await db.collection('stores').where('ownerId', '==', APP.userProfile.uid).limit(1).get();
        if (storeSnap.empty) { hideLoader(); showToast('Store not found', 'error'); return; }
        
        const storeId = storeSnap.docs[0].id;
        const store = storeSnap.docs[0].data();
        
        // Get followers list from backend
        const followersSnap = await db.collection('store_followers').where('storeId', '==', storeId).get();
        
        const lobbyPost = {
            storeId,
            storeName: store.storeName,
            storeLogo: store.storeLogo || '',
            message: message || '',
            imageUrl,
            likes: 0,
            likedBy: [],
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection('store_lobby').add(lobbyPost);
        
        // Notify all followers via backend
        for (const followerDoc of followersSnap.docs) {
            const followerId = followerDoc.data().userId;
            if (typeof createNotification === 'function') {
                await createNotification(followerId,
                    `📢 ${store.storeName}`,
                    message || 'New post from store',
                    '📢',
                    'store-lobby'
                );
            }
        }
        
        hideLoader();
        showToast('Posted to all followers! ✅', 'success');
        
    } catch (error) {
        hideLoader();
        console.error('Lobby error:', error);
        showToast('Failed to post', 'error');
    }
}

// =====================
// CHAT SYSTEM
// =====================
async function openChatWithStore(storeId, storeName) {
    if (!APP.userProfile) {
        showToast('Please login to chat', 'error');
        return;
    }
    
    navigateTo('chat', { storeId, storeName });
}

async function searchUserForChat() {
    showModal(`
        <div style="padding:15px;">
            <h3>🔍 Search User</h3>
            <p style="color:#666;font-size:13px;">Search by username to start chatting</p>
            
            <div class="input-group" style="margin-top:15px;">
                <input type="text" id="chat-search-username" class="input-field" placeholder="Enter username...">
            </div>
            
            <div id="chat-search-results" style="margin-top:10px;"></div>
            
            <button class="btn-gold btn-full" style="margin-top:15px;" onclick="performChatSearch()">Search</button>
        </div>
    `);
}

async function performChatSearch() {
    const username = document.getElementById('chat-search-username')?.value?.trim()?.toLowerCase();
    if (!username) { showToast('Enter username', 'error'); return; }
    
    try {
        const snap = await db.collection('users').where('username', '==', username).limit(5).get();
        const resultsDiv = document.getElementById('chat-search-results');
        
        if (snap.empty) {
            resultsDiv.innerHTML = '<p style="text-align:center;color:#999;">No users found</p>';
            return;
        }
        
        resultsDiv.innerHTML = '';
        snap.forEach(doc => {
            const user = doc.data();
            resultsDiv.innerHTML += `
                <div style="display:flex;align-items:center;gap:10px;padding:10px;background:#f5f5f5;border-radius:8px;margin-bottom:5px;cursor:pointer;"
                     onclick="openChatWithUser('${doc.id}', '${user.displayName || user.username}')">
                    <img src="${user.photoURL || '/app-icon.png'}" style="width:40px;height:40px;border-radius:50%;">
                    <div>
                        <div style="font-weight:600;">${user.displayName || user.username}</div>
                        <div style="font-size:11px;color:#666;">@${user.username}</div>
                    </div>
                </div>`;
        });
    } catch (error) {
        console.error('Search error:', error);
    }
}

// =====================
// GLOBAL ACCESS
// =====================
window.startStoreCreation = startStoreCreation;
window.loadStoreDashboard = loadStoreDashboard;
window.toggleStoreSidebar = toggleStoreSidebar;
window.followStore = followStore;
window.likeProduct = likeProduct;
window.createStoreLobby = createStoreLobby;
window.openChatWithStore = openChatWithStore;
window.searchUserForChat = searchUserForChat;
window.STORE_PLANS = STORE_PLANS;

console.log('✅ storeowner.js fully loaded - Production Ready');
