// storeowner.js - COMPLETE NEW FILE (Store Ownership, Ticket System, Product Management)
console.log('✅ storeowner.js loaded - ONESHOPLIFY Store Ownership System');

// =====================
// STORE PLANS CONFIGURATION
// =====================
const STORE_PLANS = {
    monthly: { name: 'Monthly', price: 5, period: 'month', savings: 0 },
    quarterly: { name: '3 Months', price: 13.50, period: 'quarter', savings: 1.50 },
    biannual: { name: '6 Months', price: 24, period: 'biannual', savings: 6 },
    annual: { name: 'Annual', price: 45, period: 'annual', savings: 15 }
};

// =====================
// STORE TYPES
// =====================
const STORE_TYPES = [
    { id: 'individual', name: 'Individual Store', icon: '🏪', desc: 'Personal store for your products' },
    { id: 'organization', name: 'Organization Store', icon: '🏢', desc: 'Business or company store' }
];

// =====================
// STORE CATEGORIES
// =====================
const STORE_CATEGORIES = [
    'Fashion', 'Electronics', 'Home & Garden', 'Sports', 'Beauty',
    'Toys', 'Books', 'Food & Drinks', 'Health', 'Automotive',
    'Jewelry', 'Art', 'Music', 'Pet Supplies', 'Office',
    'Baby', 'Travel', 'Fitness', 'Gaming', 'Tickets & Events',
    'All Purpose Store', 'Digital Products', 'Services'
];

// =====================
// PRODUCT RANGES
// =====================
const PRODUCT_RANGES = [
    { value: '1-10', label: '1 - 10 Products' },
    { value: '10-50', label: '10 - 50 Products' },
    { value: '50-100', label: '50 - 100 Products' },
    { value: '100-500', label: '100 - 500 Products' }
];

// =====================
// TICKET PRESERVATIONS
// =====================
const TICKET_PRESERVATIONS = [
    { id: 'general', name: 'General Admission' },
    { id: 'vip', name: 'VIP' },
    { id: 'table_2', name: 'Table for 2' },
    { id: 'table_4', name: 'Table for 4' },
    { id: 'table_5', name: 'Table for 5' },
    { id: 'table_10', name: 'Table for 10' },
    { id: 'early_bird', name: 'Early Bird' },
    { id: 'premium', name: 'Premium' }
];

// =====================
// TICKET DELIVERY METHODS
// =====================
const TICKET_DELIVERY = [
    { id: 'app', name: 'App Generated (Auto)', desc: 'App generates ticket IDs automatically' },
    { id: 'owner', name: 'Store Owner (Manual)', desc: 'You send tickets via WhatsApp' }
];

// =====================
// TICKET VISIBILITY
// =====================
const TICKET_VISIBILITY = [
    { id: 'public', name: 'Public', desc: 'Visible to everyone in your store' },
    { id: 'link_only', name: 'Link Only', desc: 'Only people with the link can see it' }
];

// =====================
// LOAD STORE OWNER DASHBOARD
// =====================
async function loadStoreOwnerDashboard() {
    console.log('🏪 Loading store owner dashboard...');
    
    const container = document.getElementById('storeowner-content');
    if (!container) {
        // Try to find in merchant content or create a new section
        const altContainer = document.getElementById('merchant-content');
        if (altContainer) {
            renderStoreOwnerInMerchant(altContainer);
            return;
        }
        console.error('❌ No container found for store owner');
        return;
    }
    
    container.innerHTML = '<div style="text-align:center;padding:60px;"><div class="loader-spinner"></div><p>Loading store dashboard...</p></div>';
    
    if (!APP.userProfile) {
        container.innerHTML = '<p style="text-align:center;padding:60px;">Please login to access your store.</p>';
        return;
    }
    
    const hasStore = APP.userProfile.hasStore || APP.userProfile.isMerchant;
    
    if (hasStore) {
        renderActiveStoreDashboard(container);
    } else {
        renderStoreSetupOptions(container);
    }
}

function renderStoreOwnerInMerchant(container) {
    const hasStore = APP.userProfile.hasStore || APP.userProfile.isMerchant;
    
    if (hasStore) {
        renderActiveStoreDashboard(container);
    } else {
        container.innerHTML = `
            <div style="padding:15px;">
                <div style="text-align:center;padding:30px 20px;background:linear-gradient(135deg,#667eea,#764ba2);border-radius:16px;color:white;margin-bottom:15px;">
                    <h2>🏪 Own Your Store</h2>
                    <p style="opacity:0.9;">Create your own store on ONESHOPLIFY</p>
                </div>
                <button class="btn-gold btn-full" onclick="startStoreSetup()">🚀 Create My Store</button>
            </div>`;
    }
}

function renderActiveStoreDashboard(container) {
    const storeName = APP.userProfile.storeName || 'My Store';
    const storeUrl = `https://${APP.userProfile.username}.oneshoplify.com`;
    const storeColor = APP.userProfile.storeColor || '#667eea';
    const isVerified = APP.userProfile.isAppVerified || false;
    const totalProducts = APP.userProfile.totalProducts || 0;
    const totalSales = APP.userProfile.totalSales || 0;
    const isLight = isColorLight(storeColor);
    const textColor = isLight ? '#1a1a1a' : '#ffffff';
    
    container.innerHTML = `
        <div style="padding:15px;padding-bottom:30px;">
            
            <!-- Store Header -->
            <div style="text-align:center;padding:25px 20px;background:linear-gradient(135deg,${storeColor},#764ba2);border-radius:16px;color:${textColor};margin-bottom:15px;box-shadow:0 4px 16px rgba(0,0,0,0.15);">
                ${APP.userProfile.storeLogo ? `<img src="${APP.userProfile.storeLogo}" style="width:60px;height:60px;border-radius:50%;border:3px solid ${textColor};margin-bottom:10px;">` : ''}
                <h2 style="margin:0;font-size:22px;">${storeName}</h2>
                ${isVerified ? '<span style="background:#20D5EC;color:white;padding:4px 14px;border-radius:15px;font-size:12px;margin-top:8px;display:inline-block;">✓ Verified</span>' : ''}
                <p style="opacity:0.85;margin:6px 0 0;font-size:14px;">${APP.userProfile.storeCategory || 'Store'}</p>
            </div>
            
            <!-- Quick Stats -->
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:15px;">
                <div class="stat-card" style="padding:14px;text-align:center;background:white;border-radius:10px;">
                    <div class="stat-value" style="font-size:22px;font-weight:800;color:#667eea;">${totalProducts}</div>
                    <div class="stat-label" style="font-size:10px;color:#999;">Products</div>
                </div>
                <div class="stat-card" style="padding:14px;text-align:center;background:white;border-radius:10px;">
                    <div class="stat-value" style="font-size:22px;font-weight:800;color:#4CAF50;">${totalSales}</div>
                    <div class="stat-label" style="font-size:10px;color:#999;">Sales</div>
                </div>
                <div class="stat-card" style="padding:14px;text-align:center;background:white;border-radius:10px;">
                    <div class="stat-value" style="font-size:22px;font-weight:800;color:#FF9800;" id="store-revenue">$0</div>
                    <div class="stat-label" style="font-size:10px;color:#999;">Revenue</div>
                </div>
            </div>
            
            <!-- Main Actions -->
            <button class="btn-gold btn-full" style="margin-bottom:8px;padding:13px;font-weight:700;" onclick="navigateTo('add-product')">➕ Add Product</button>
            <button class="btn-outline btn-full" style="margin-bottom:8px;padding:12px;" onclick="addTicketProduct()">🎫 Add Ticket/Event</button>
            <button class="btn-outline btn-full" style="margin-bottom:8px;padding:12px;" onclick="viewMyStore()">👁️ View My Store</button>
            <button class="btn-outline btn-full" style="margin-bottom:8px;padding:12px;" onclick="navigateTo('orders')">📦 Orders</button>
            <button class="btn-outline btn-full" style="margin-bottom:8px;padding:12px;" onclick="storeSettings()">⚙️ Store Settings</button>
            <button class="btn-outline btn-full" style="margin-bottom:8px;padding:12px;" onclick="navigateTo('analytics')">📊 Analytics</button>
            
            <!-- Store URL -->
            <div style="background:white;padding:15px;border-radius:12px;margin:10px 0;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
                <p style="font-weight:600;font-size:13px;">🔗 Your Store URL:</p>
                <div style="font-family:monospace;font-size:12px;background:#f5f5f5;padding:10px;border-radius:6px;margin:8px 0;">${storeUrl}</div>
                <button class="copy-btn" onclick="copyToClipboard('${storeUrl}');showToast('Link copied!','success');">📋 Copy</button>
            </div>
            
            <!-- Sponsorship -->
            <div style="background:#FFF8E1;padding:14px;border-radius:10px;text-align:center;border:1px solid #FFE082;margin-bottom:10px;">
                <p style="font-weight:600;">⭐ Sponsor Your Products</p>
                <p style="font-size:12px;color:#666;">$10/month per product - Get featured on the homepage!</p>
                <button class="btn-small btn-outline" onclick="sponsorStoreProduct()">Promote Product</button>
            </div>
            
            <!-- Store Plan -->
            <div style="background:#E8F5E9;padding:14px;border-radius:10px;text-align:center;">
                <p style="font-size:13px;">✅ Store Active - ${APP.userProfile.storePlan || 'Monthly'} Plan</p>
                ${APP.userProfile.storeExpiry ? `<p style="font-size:11px;color:#666;">Expires: ${new Date(APP.userProfile.storeExpiry.seconds*1000).toLocaleDateString()}</p>` : ''}
                <button class="btn-small btn-outline" onclick="renewStorePlan()">Renew / Upgrade</button>
            </div>
        </div>`;
}

// =====================
// STORE SETUP FLOW
// =====================
function startStoreSetup() {
    showModal(`
        <div style="padding:15px;max-height:75vh;overflow-y:auto;">
            <h3>🏪 Create Your Store</h3>
            <p style="color:#666;margin:10px 0;">Set up your own store on ONESHOPLIFY</p>
            
            <!-- Store Type -->
            <div class="input-group" style="margin-top:15px;">
                <label>Store Type</label>
                <div style="display:flex;gap:10px;margin-top:5px;">
                    ${STORE_TYPES.map(t => `
                        <div onclick="selectStoreType('${t.id}')" id="store-type-${t.id}"
                             style="flex:1;padding:15px;border:2px solid #e0e0e0;border-radius:12px;cursor:pointer;text-align:center;transition:0.2s;">
                            <div style="font-size:30px;">${t.icon}</div>
                            <div style="font-weight:600;font-size:13px;">${t.name}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <!-- Store Name -->
            <div class="input-group" style="margin-top:15px;">
                <label>Store Name</label>
                <input type="text" id="setup-store-name" class="input-field" placeholder="My Store Name">
            </div>
            
            <!-- Description -->
            <div class="input-group" style="margin-top:10px;">
                <label>Store Description (10-100 words)</label>
                <textarea id="setup-store-desc" class="input-field" rows="3" placeholder="Describe your store..."></textarea>
                <small style="color:#999;" id="word-count">0 words</small>
            </div>
            
            <!-- Category -->
            <div class="input-group" style="margin-top:10px;">
                <label>Store Category</label>
                <select id="setup-store-category" class="input-field">
                    <option value="">Select Category</option>
                    ${STORE_CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('')}
                </select>
            </div>
            
            <!-- Country -->
            <div class="input-group" style="margin-top:10px;">
                <label>Store Country</label>
                <select id="setup-store-country" class="input-field">
                    <option value="">Select Country</option>
                    ${typeof COUNTRIES !== 'undefined' ? Object.entries(COUNTRIES).sort((a,b) => a[1].name.localeCompare(b[1].name)).map(([code, data]) => `<option value="${code}">${data.flag||''} ${data.name}</option>`).join('') : ''}
                </select>
            </div>
            
            <!-- Shipping Countries -->
            <div class="input-group" style="margin-top:10px;">
                <label>Ship To Countries (Select all that apply)</label>
                <div id="shipping-countries-setup" style="max-height:150px;overflow-y:auto;border:2px solid #e0e0e0;border-radius:8px;padding:10px;">
                    ${typeof COUNTRIES !== 'undefined' ? Object.entries(COUNTRIES).sort((a,b) => a[1].name.localeCompare(b[1].name)).slice(0,20).map(([code, data]) => `
                        <label style="display:flex;align-items:center;gap:8px;padding:5px 0;cursor:pointer;font-size:13px;">
                            <input type="checkbox" class="shipping-country-check" value="${code}" style="width:16px;height:16px;">
                            ${data.flag||''} ${data.name}
                        </label>
                    `).join('') : ''}
                </div>
            </div>
            
            <!-- Payment Gateway -->
            <div class="input-group" style="margin-top:10px;">
                <label>Payment Gateway (ONESHOPLIFY Wallet)</label>
                <div style="background:#f5f5f5;padding:12px;border-radius:8px;">
                    <p style="font-size:13px;">✅ ONESHOPLIFY Wallet - Connected automatically</p>
                    <p style="font-size:11px;color:#666;">Customers pay with their wallet balance</p>
                </div>
            </div>
            
            <!-- Industrial UID -->
            <div class="input-group" style="margin-top:10px;">
                <label>Industrial UID (from ONESHOPLIFY Wallet)</label>
                <input type="text" id="setup-industrial-uid" class="input-field" placeholder="Enter your industrial UID">
                <small style="color:#999;">Get this from ONESHOPLIFY Wallet → Profile → Store & Gateway → Generate Industrial UID</small>
            </div>
            
            <!-- Store Logo -->
            <div class="input-group" style="margin-top:10px;">
                <label>Store Logo (Upload)</label>
                <input type="file" id="setup-store-logo" class="input-field" accept="image/*">
            </div>
            
            <!-- Store Banner -->
            <div class="input-group" style="margin-top:10px;">
                <label>Store Banner (Upload)</label>
                <input type="file" id="setup-store-banner" class="input-field" accept="image/*">
            </div>
            
            <!-- Product Range -->
            <div class="input-group" style="margin-top:10px;">
                <label>Expected Product Range</label>
                <select id="setup-product-range" class="input-field">
                    <option value="">Select Range</option>
                    ${PRODUCT_RANGES.map(r => `<option value="${r.value}">${r.label}</option>`).join('')}
                </select>
            </div>
            
            <!-- Order Fulfillment Confirmation -->
            <label style="display:flex;align-items:start;gap:8px;margin-top:15px;cursor:pointer;">
                <input type="checkbox" id="setup-fulfill" style="width:18px;height:18px;margin-top:3px;">
                <span style="font-size:13px;">I confirm that I will fulfill all orders placed through my store</span>
            </label>
            
            <!-- Terms -->
            <label style="display:flex;align-items:start;gap:8px;margin-top:8px;cursor:pointer;">
                <input type="checkbox" id="setup-terms" style="width:18px;height:18px;margin-top:3px;">
                <span style="font-size:13px;">I agree to ONESHOPLIFY Store Terms & Conditions</span>
            </label>
            
            <!-- Plan Selection -->
            <div class="input-group" style="margin-top:15px;">
                <label>Select Plan</label>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:5px;">
                    ${Object.entries(STORE_PLANS).map(([key, plan]) => `
                        <div onclick="selectStorePlan('${key}')" id="store-plan-${key}"
                             style="padding:12px;border:2px solid #e0e0e0;border-radius:10px;cursor:pointer;text-align:center;transition:0.2s;">
                            <div style="font-weight:700;font-size:14px;">${plan.name}</div>
                            <div style="font-size:20px;font-weight:800;color:#B8860B;">$${plan.price}</div>
                            ${plan.savings > 0 ? `<div style="font-size:10px;color:#4CAF50;">Save $${plan.savings}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <button class="btn-gold btn-full" style="margin-top:15px;" onclick="completeStoreSetup()">🚀 Create Store & Pay</button>
        </div>
    `);
    
    // Word count for description
    document.getElementById('setup-store-desc').addEventListener('input', function() {
        const words = this.value.trim().split(/\s+/).filter(w => w.length > 0);
        document.getElementById('word-count').textContent = words.length + ' words';
    });
    
    window._storeSetup = { type: 'individual', plan: 'monthly', shippingCountries: [] };
}

function selectStoreType(type) {
    window._storeSetup.type = type;
    document.querySelectorAll('[id^="store-type-"]').forEach(el => el.style.border = '2px solid #e0e0e0');
    const el = document.getElementById('store-type-' + type);
    if (el) { el.style.border = '2px solid #FFD700'; el.style.background = '#FFFDE7'; }
}

function selectStorePlan(plan) {
    window._storeSetup.plan = plan;
    document.querySelectorAll('[id^="store-plan-"]').forEach(el => { el.style.border = '2px solid #e0e0e0'; el.style.background = 'white'; });
    const el = document.getElementById('store-plan-' + plan);
    if (el) { el.style.border = '2px solid #FFD700'; el.style.background = '#FFFDE7'; }
}

async function completeStoreSetup() {
    const name = document.getElementById('setup-store-name')?.value?.trim();
    const desc = document.getElementById('setup-store-desc')?.value?.trim();
    const category = document.getElementById('setup-store-category')?.value;
    const country = document.getElementById('setup-store-country')?.value;
    const industrialUid = document.getElementById('setup-industrial-uid')?.value?.trim();
    const productRange = document.getElementById('setup-product-range')?.value;
    const fulfill = document.getElementById('setup-fulfill')?.checked;
    const terms = document.getElementById('setup-terms')?.checked;
    const storeType = window._storeSetup?.type || 'individual';
    const plan = window._storeSetup?.plan || 'monthly';
    const planPrice = STORE_PLANS[plan]?.price || 5;
    
    if (!name) { showToast('Enter store name', 'error'); return; }
    if (!desc || desc.split(/\s+/).length < 10) { showToast('Description must be at least 10 words', 'error'); return; }
    if (!category) { showToast('Select category', 'error'); return; }
    if (!country) { showToast('Select country', 'error'); return; }
    if (!fulfill) { showToast('Confirm order fulfillment', 'error'); return; }
    if (!terms) { showToast('Agree to terms', 'error'); return; }
    if ((APP.userProfile.walletBalance || 0) < planPrice) { showToast(`Need $${planPrice} for ${STORE_PLANS[plan].name} plan`, 'error'); navigateTo('wallet'); return; }
    
    // Get selected shipping countries
    const shippingCountries = [];
    document.querySelectorAll('.shipping-country-check:checked').forEach(cb => shippingCountries.push(cb.value));
    
    hideModal();
    showLoader();
    
    try {
        // Upload logo and banner
        let logoUrl = '', bannerUrl = '';
        const logoFile = document.getElementById('setup-store-logo')?.files?.[0];
        const bannerFile = document.getElementById('setup-store-banner')?.files?.[0];
        if (logoFile) { try { logoUrl = await uploadToCloudinary(logoFile); } catch(e) {} }
        if (bannerFile) { try { bannerUrl = await uploadToCloudinary(bannerFile); } catch(e) {} }
        
        const expiryDate = new Date();
        if (plan === 'monthly') expiryDate.setMonth(expiryDate.getMonth() + 1);
        else if (plan === 'quarterly') expiryDate.setMonth(expiryDate.getMonth() + 3);
        else if (plan === 'biannual') expiryDate.setMonth(expiryDate.getMonth() + 6);
        else if (plan === 'annual') expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        
        const updates = {
            walletBalance: firebase.firestore.FieldValue.increment(-planPrice),
            hasStore: true,
            isMerchant: true,
            storeName: name,
            storeDescription: desc,
            storeCategory: category,
            storeCountry: country,
            storeType: storeType,
            storePlan: plan,
            storeExpiry: firebase.firestore.Timestamp.fromDate(expiryDate),
            industrialUid: industrialUid,
            productRange: productRange,
            shippingCountries: shippingCountries,
            storeLogo: logoUrl || APP.userProfile.storeLogo || '',
            storeBanner: bannerUrl || APP.userProfile.storeBanner || '',
            storeActive: true,
            storeTemplate: 'modern',
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection('users').doc(APP.userProfile.uid).update(updates);
        Object.assign(APP.userProfile, updates);
        APP.userProfile.walletBalance -= planPrice;
        
        await db.collection('transactions').add({
            userId: APP.userProfile.uid,
            type: 'store_subscription',
            amount: planPrice,
            currency: 'USD',
            status: 'completed',
            description: `Store ${STORE_PLANS[plan].name} plan`,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        hideLoader();
        showToast(`Store created! 🎉 Your link: ${APP.userProfile.username}.oneshoplify.com`, 'success');
        
        if (typeof loadStoreOwnerDashboard === 'function') {
            loadStoreOwnerDashboard();
        }
        
    } catch(e) {
        hideLoader();
        console.error('Store setup error:', e);
        showToast('Failed to create store', 'error');
    }
}

// =====================
// TICKET/EVENT PRODUCT
// =====================
function addTicketProduct() {
    showModal(`
        <div style="padding:15px;max-height:80vh;overflow-y:auto;">
            <h3>🎫 Add Ticket / Event Product</h3>
            <p style="color:#666;font-size:13px;">Create a ticket for your event</p>
            
            <!-- Event Name -->
            <div class="input-group" style="margin-top:15px;">
                <label>Event Name *</label>
                <input type="text" id="ticket-event-name" class="input-field" placeholder="e.g. Summer Music Festival">
            </div>
            
            <!-- Event Description -->
            <div class="input-group" style="margin-top:10px;">
                <label>Event Description</label>
                <textarea id="ticket-event-desc" class="input-field" rows="3" placeholder="Describe your event..."></textarea>
            </div>
            
            <!-- Date & Time -->
            <div style="display:flex;gap:10px;margin-top:10px;">
                <div class="input-group" style="flex:1;">
                    <label>Event Date *</label>
                    <input type="date" id="ticket-event-date" class="input-field">
                </div>
                <div class="input-group" style="flex:1;">
                    <label>Event Time *</label>
                    <input type="time" id="ticket-event-time" class="input-field">
                </div>
            </div>
            
            <!-- Country & Address -->
            <div class="input-group" style="margin-top:10px;">
                <label>Country *</label>
                <select id="ticket-country" class="input-field">
                    <option value="">Select Country</option>
                    ${typeof COUNTRIES !== 'undefined' ? Object.entries(COUNTRIES).sort((a,b) => a[1].name.localeCompare(b[1].name)).map(([code, data]) => `<option value="${code}">${data.flag||''} ${data.name}</option>`).join('') : ''}
                </select>
            </div>
            
            <div class="input-group" style="margin-top:10px;">
                <label>Full Venue Address *</label>
                <input type="text" id="ticket-address" class="input-field" placeholder="Venue address">
            </div>
            
            <!-- Ticket Quantity -->
            <div class="input-group" style="margin-top:10px;">
                <label>Total Ticket Quantity *</label>
                <input type="number" id="ticket-quantity" class="input-field" placeholder="e.g. 500" min="1">
            </div>
            
            <!-- Visibility -->
            <div class="input-group" style="margin-top:10px;">
                <label>Visibility</label>
                <div style="display:flex;gap:10px;margin-top:5px;">
                    ${TICKET_VISIBILITY.map(v => `
                        <div onclick="selectTicketVisibility('${v.id}')" id="ticket-vis-${v.id}"
                             style="flex:1;padding:12px;border:2px solid #e0e0e0;border-radius:10px;cursor:pointer;text-align:center;">
                            <div style="font-weight:600;">${v.name}</div>
                            <div style="font-size:11px;color:#666;">${v.desc}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <!-- Preservation Types -->
            <div class="input-group" style="margin-top:10px;">
                <label>Preservation Types</label>
                <div id="ticket-preservations" style="display:flex;flex-wrap:wrap;gap:8px;margin-top:5px;">
                    ${TICKET_PRESERVATIONS.map(p => `
                        <div onclick="toggleTicketPreservation('${p.id}')" id="ticket-pres-${p.id}"
                             style="padding:8px 14px;border:2px solid #e0e0e0;border-radius:20px;cursor:pointer;font-size:12px;font-weight:500;">
                            ${p.name}
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <!-- Price by Preservation -->
            <div class="input-group" style="margin-top:10px;">
                <label>
                    <input type="checkbox" id="ticket-vary-price" onchange="toggleTicketPriceVariation()">
                    Vary price by preservation type
                </label>
            </div>
            <div id="ticket-price-variations" style="display:none;"></div>
            
            <!-- Default Price (if not varied) -->
            <div class="input-group" style="margin-top:10px;" id="ticket-default-price-group">
                <label>Ticket Price (USD) *</label>
                <input type="number" id="ticket-price" class="input-field" placeholder="0.00" step="0.01" min="0.01">
            </div>
            
            <!-- Ticket Image -->
            <div class="input-group" style="margin-top:10px;">
                <label>Ticket Image (Upload)</label>
                <input type="file" id="ticket-image" class="input-field" accept="image/*">
            </div>
            
            <!-- Expiration Date -->
            <div class="input-group" style="margin-top:10px;">
                <label>Ticket Expiration Date</label>
                <input type="date" id="ticket-expiry" class="input-field">
            </div>
            
            <!-- Delivery Method -->
            <div class="input-group" style="margin-top:10px;">
                <label>Ticket Delivery Method</label>
                <div style="display:flex;gap:10px;margin-top:5px;">
                    ${TICKET_DELIVERY.map(d => `
                        <div onclick="selectTicketDelivery('${d.id}')" id="ticket-del-${d.id}"
                             style="flex:1;padding:12px;border:2px solid #e0e0e0;border-radius:10px;cursor:pointer;text-align:center;">
                            <div style="font-weight:600;">${d.name}</div>
                            <div style="font-size:11px;color:#666;">${d.desc}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <!-- WhatsApp Number (if owner delivery) -->
            <div class="input-group" style="margin-top:10px;display:none;" id="ticket-whatsapp-group">
                <label>Your WhatsApp Number</label>
                <input type="tel" id="ticket-whatsapp" class="input-field" placeholder="+1234567890">
            </div>
            
            <button class="btn-gold btn-full" style="margin-top:15px;" onclick="createTicketProduct()">🎫 Create Ticket</button>
        </div>
    `);
    
    window._ticketSetup = {
        visibility: 'public',
        delivery: 'app',
        preservations: [],
        varyPrice: false
    };
}

function selectTicketVisibility(id) {
    window._ticketSetup.visibility = id;
    document.querySelectorAll('[id^="ticket-vis-"]').forEach(el => el.style.border = '2px solid #e0e0e0');
    const el = document.getElementById('ticket-vis-' + id);
    if (el) el.style.border = '2px solid #FFD700';
}

function toggleTicketPreservation(id) {
    const idx = window._ticketSetup.preservations.indexOf(id);
    if (idx >= 0) {
        window._ticketSetup.preservations.splice(idx, 1);
    } else {
        window._ticketSetup.preservations.push(id);
    }
    const el = document.getElementById('ticket-pres-' + id);
    if (el) {
        const selected = window._ticketSetup.preservations.includes(id);
        el.style.border = selected ? '2px solid #FFD700' : '2px solid #e0e0e0';
        el.style.background = selected ? '#FFFDE7' : 'white';
    }
}

function toggleTicketPriceVariation() {
    const vary = document.getElementById('ticket-vary-price')?.checked;
    window._ticketSetup.varyPrice = vary;
    
    document.getElementById('ticket-default-price-group').style.display = vary ? 'none' : '';
    const variationsDiv = document.getElementById('ticket-price-variations');
    
    if (vary) {
        variationsDiv.style.display = 'block';
        variationsDiv.innerHTML = window._ticketSetup.preservations.map(p => {
            const pres = TICKET_PRESERVATIONS.find(tp => tp.id === p);
            return `
                <div class="input-group" style="margin-top:8px;">
                    <label>${pres?.name || p} Price (USD)</label>
                    <input type="number" id="ticket-price-${p}" class="input-field" placeholder="0.00" step="0.01" min="0.01">
                </div>`;
        }).join('');
    } else {
        variationsDiv.style.display = 'none';
    }
}

function selectTicketDelivery(id) {
    window._ticketSetup.delivery = id;
    document.querySelectorAll('[id^="ticket-del-"]').forEach(el => el.style.border = '2px solid #e0e0e0');
    const el = document.getElementById('ticket-del-' + id);
    if (el) el.style.border = '2px solid #FFD700';
    document.getElementById('ticket-whatsapp-group').style.display = id === 'owner' ? '' : 'none';
}

async function createTicketProduct() {
    const name = document.getElementById('ticket-event-name')?.value?.trim();
    const desc = document.getElementById('ticket-event-desc')?.value?.trim();
    const date = document.getElementById('ticket-event-date')?.value;
    const time = document.getElementById('ticket-event-time')?.value;
    const country = document.getElementById('ticket-country')?.value;
    const address = document.getElementById('ticket-address')?.value?.trim();
    const quantity = parseInt(document.getElementById('ticket-quantity')?.value) || 0;
    const visibility = window._ticketSetup?.visibility || 'public';
    const delivery = window._ticketSetup?.delivery || 'app';
    const preservations = window._ticketSetup?.preservations || [];
    const varyPrice = window._ticketSetup?.varyPrice || false;
    const expiryDate = document.getElementById('ticket-expiry')?.value;
    const whatsapp = document.getElementById('ticket-whatsapp')?.value?.trim();
    
    if (!name) { showToast('Enter event name', 'error'); return; }
    if (!date) { showToast('Select event date', 'error'); return; }
    if (!time) { showToast('Select event time', 'error'); return; }
    if (!country) { showToast('Select country', 'error'); return; }
    if (!address) { showToast('Enter venue address', 'error'); return; }
    if (quantity < 1) { showToast('Enter ticket quantity', 'error'); return; }
    
    hideModal();
    showLoader();
    
    try {
        const imageFile = document.getElementById('ticket-image')?.files?.[0];
        let imageUrl = '';
        if (imageFile) { try { imageUrl = await uploadToCloudinary(imageFile); } catch(e) {} }
        
        // Generate ticket IDs
        const ticketIds = [];
        for (let i = 0; i < quantity; i++) {
            ticketIds.push('TKT-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase());
        }
        
        const productData = {
            name: name,
            description: desc,
            price: varyPrice ? 0 : (parseFloat(document.getElementById('ticket-price')?.value) || 0),
            category: 'Tickets & Events',
            isTicket: true,
            ticketData: {
                eventDate: date,
                eventTime: time,
                country: country,
                address: address,
                venue: address,
                totalQuantity: quantity,
                remainingQuantity: quantity,
                ticketIds: ticketIds,
                usedTicketIds: [],
                visibility: visibility,
                deliveryMethod: delivery,
                preservations: preservations,
                varyPrice: varyPrice,
                prices: {},
                whatsappNumber: whatsapp || '',
                expiryDate: expiryDate || date,
                expired: false
            },
            images: imageUrl ? [imageUrl] : ['/app-icon.png'],
            stock: quantity,
            merchantId: APP.userProfile.uid,
            merchantName: APP.userProfile.storeName || APP.userProfile.displayName,
            status: visibility === 'link_only' ? 'hidden' : 'active',
            sponsored: false,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // Set prices for each preservation if varying
        if (varyPrice) {
            preservations.forEach(p => {
                const priceInput = document.getElementById('ticket-price-' + p);
                if (priceInput) {
                    productData.ticketData.prices[p] = parseFloat(priceInput.value) || 0;
                }
            });
        }
        
        const docRef = await db.collection('products').add(productData);
        
        // Generate ticket images for each ticket ID
        await generateTicketImages(docRef.id, ticketIds, productData);
        
        hideLoader();
        showToast(`Ticket created! ${quantity} tickets generated. ✅`, 'success');
        
        if (typeof loadStoreOwnerDashboard === 'function') {
            loadStoreOwnerDashboard();
        }
        
    } catch(e) {
        hideLoader();
        console.error('Ticket creation error:', e);
        showToast('Failed to create ticket', 'error');
    }
}

async function generateTicketImages(productId, ticketIds, productData) {
    // This function would generate ticket images server-side
    // For now, we store the ticket data for retrieval
    const ticketImages = ticketIds.map(ticketId => ({
        ticketId: ticketId,
        productId: productId,
        eventName: productData.name,
        eventDate: productData.ticketData.eventDate,
        eventTime: productData.ticketData.eventTime,
        venue: productData.ticketData.address,
        country: productData.ticketData.country,
        expiryDate: productData.ticketData.expiryDate,
        used: false,
        usedBy: null,
        usedAt: null,
        imageUrl: productData.images?.[0] || ''
    }));
    
    // Store in ticket collection
    for (const ticket of ticketImages) {
        await db.collection('tickets').add(ticket);
    }
    
    console.log(`✅ ${ticketIds.length} tickets generated for product ${productId}`);
}

// =====================
// SPONSOR STORE PRODUCT
// =====================
async function sponsonStoreProduct() {
    const snap = await db.collection('products')
        .where('merchantId', '==', APP.userProfile.uid)
        .where('status', '==', 'active')
        .get();
    
    const products = [];
    snap.forEach(doc => products.push({ id: doc.id, ...doc.data() }));
    
    if (products.length === 0) { showToast('Add products first', 'error'); return; }
    
    showModal(`
        <div style="padding:10px;max-height:70vh;overflow-y:auto;">
            <h3>⭐ Sponsor Product</h3>
            <p style="color:#666;font-size:12px;">$10/month per product - Appears on homepage</p>
            ${products.map(p => `
                <div style="display:flex;gap:10px;padding:12px;background:white;border-radius:10px;margin:8px 0;box-shadow:0 2px 6px rgba(0,0,0,0.04);align-items:center;">
                    <img src="${p.images?.[0] || '/app-icon.png'}" style="width:45px;height:45px;border-radius:8px;object-fit:cover;">
                    <div style="flex:1;">
                        <div style="font-weight:600;font-size:13px;">${p.name}</div>
                        <div style="font-size:11px;color:#666;">${formatCurrency(p.price)}</div>
                    </div>
                    <button class="btn-small btn-gold" onclick="confirmSponsorship('${p.id}')">Sponsor - $10</button>
                </div>
            `).join('')}
        </div>
    `);
}

async function confirmSponsorship(productId) {
    if ((APP.userProfile.walletBalance || 0) < 10) {
        showToast('Need $10 to sponsor', 'error');
        navigateTo('wallet');
        return;
    }
    
    hideModal();
    showLoader();
    
    try {
        await db.collection('users').doc(APP.userProfile.uid).update({
            walletBalance: firebase.firestore.FieldValue.increment(-10)
        });
        
        await db.collection('products').doc(productId).update({
            sponsored: true,
            sponsoredUntil: firebase.firestore.Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
        });
        
        APP.userProfile.walletBalance -= 10;
        
        await db.collection('transactions').add({
            userId: APP.userProfile.uid,
            type: 'sponsorship',
            amount: 10,
            currency: 'USD',
            status: 'completed',
            description: 'Product sponsorship - 30 days',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        hideLoader();
        showToast('Product sponsored! ⭐', 'success');
    } catch(e) { hideLoader(); showToast('Failed', 'error'); }
}

// =====================
// STORE SETTINGS
// =====================
function storeSettings() {
    showModal(`
        <div style="padding:10px;max-height:70vh;overflow-y:auto;">
            <h3>⚙️ Store Settings</h3>
            <div class="input-group"><label>Store Name</label><input type="text" id="settings-store-name" class="input-field" value="${APP.userProfile.storeName || ''}"></div>
            <div class="input-group"><label>Description</label><textarea id="settings-store-desc" class="input-field" rows="2">${APP.userProfile.storeDescription || ''}</textarea></div>
            <div class="input-group"><label>Theme Color</label><input type="color" id="settings-store-color" class="input-field" value="${APP.userProfile.storeColor || '#667eea'}" style="height:50px;"></div>
            <div class="input-group"><label>Logo (Upload)</label><input type="file" id="settings-logo-upload" class="input-field" accept="image/*"></div>
            <div class="input-group"><label>Banner (Upload)</label><input type="file" id="settings-banner-upload" class="input-field" accept="image/*"></div>
            <button class="btn-gold btn-full" style="margin-top:15px;" onclick="saveStoreSettings()">💾 Save</button>
        </div>
    `);
}

async function saveStoreSettings() {
    const name = document.getElementById('settings-store-name')?.value?.trim();
    const desc = document.getElementById('settings-store-desc')?.value?.trim();
    const color = document.getElementById('settings-store-color')?.value;
    if (!name) { showToast('Enter store name', 'error'); return; }
    hideModal(); showLoader();
    try {
        const updates = { storeName: name, storeDescription: desc, storeColor: color };
        const logoFile = document.getElementById('settings-logo-upload')?.files?.[0];
        const bannerFile = document.getElementById('settings-banner-upload')?.files?.[0];
        if (logoFile) { try { updates.storeLogo = await uploadToCloudinary(logoFile); } catch(e) {} }
        if (bannerFile) { try { updates.storeBanner = await uploadToCloudinary(bannerFile); } catch(e) {} }
        await db.collection('users').doc(APP.userProfile.uid).update(updates);
        Object.assign(APP.userProfile, updates);
        hideLoader(); showToast('Saved! ✅', 'success');
    } catch(e) { hideLoader(); showToast('Failed', 'error'); }
}

// =====================
// HELPER
// =====================
function isColorLight(hex) {
    if (!hex) return false;
    const c = hex.replace('#', '');
    const r = parseInt(c.substring(0,2), 16), g = parseInt(c.substring(2,4), 16), b = parseInt(c.substring(4,6), 16);
    return (r*299 + g*587 + b*114)/1000 > 150;
}

function renewStorePlan() {
    showModal(`
        <div style="padding:10px;"><h3>🔄 Renew Store Plan</h3>
        ${Object.entries(STORE_PLANS).map(([key, plan]) => `
            <div style="padding:15px;border-left:4px solid #667eea;margin:10px 0;background:white;border-radius:8px;">
                <h4>${plan.name}</h4>
                <div style="font-size:24px;font-weight:800;">$${plan.price}</div>
                ${plan.savings > 0 ? `<p style="color:#4CAF50;">Save $${plan.savings}</p>` : ''}
                <button class="btn-gold btn-full" onclick="payStoreRenewal('${key}',${plan.price})">Select</button>
            </div>
        `).join('')}</div>`);
}

async function payStoreRenewal(plan, price) {
    if ((APP.userProfile.walletBalance||0) < price) { showToast('Insufficient balance','error'); navigateTo('wallet'); return; }
    hideModal(); showLoader();
    try {
        const expiryDate = new Date();
        if (plan === 'monthly') expiryDate.setMonth(expiryDate.getMonth() + 1);
        else if (plan === 'quarterly') expiryDate.setMonth(expiryDate.getMonth() + 3);
        else if (plan === 'biannual') expiryDate.setMonth(expiryDate.getMonth() + 6);
        else expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        
        await db.collection('users').doc(APP.userProfile.uid).update({
            walletBalance: firebase.firestore.FieldValue.increment(-price),
            storePlan: plan,
            storeExpiry: firebase.firestore.Timestamp.fromDate(expiryDate)
        });
        APP.userProfile.walletBalance -= price;
        APP.userProfile.storePlan = plan;
        APP.userProfile.storeExpiry = { seconds: Math.floor(expiryDate.getTime()/1000) };
        hideLoader(); showToast('Store renewed! ✅','success');
    } catch(e) { hideLoader(); showToast('Failed','error'); }
}

async function viewMyStore() {
    const storeUrl = `https://${APP.userProfile.username}.oneshoplify.com`;
    window.open(storeUrl, '_blank');
}

// Global access
window.loadStoreOwnerDashboard = loadStoreOwnerDashboard;
window.startStoreSetup = startStoreSetup;
window.addTicketProduct = addTicketProduct;
window.sponsonStoreProduct = sponsonStoreProduct;
window.STORE_CATEGORIES = STORE_CATEGORIES;
window.TICKET_PRESERVATIONS = TICKET_PRESERVATIONS;

console.log('✅ storeowner.js fully loaded');
