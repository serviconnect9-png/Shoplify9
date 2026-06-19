// profile.js - COMPLETE FINAL UNCOMPRESSED VERSION
// ONESHOPLIFY Enterprise - Profile, Settings, Subscriptions, Influencer Application, Store Ownership
// Real SVG Social Media Icons

console.log('✅ profile.js loaded');

// =====================
// LOAD PROFILE SCREEN
// =====================
async function loadProfileScreen() {
    if (!APP.userProfile) { return; }
    
    const container = document.getElementById('profile-content');
    if (!container) { return; }
    
    const badges = [];
    if (APP.userProfile.isVerifiedMerchant) { badges.push('<span class="verified-badge" title="Verified">✓</span>'); }
    if (APP.userProfile.isAppVerified) { badges.push('<span class="app-verified-badge" title="App Verified">✓</span>'); }
    if (APP.userProfile.isAmbassador) { badges.push('<span class="ambassador-badge" title="Ambassador">👑</span>'); }
    
    const username = APP.userProfile?.username || '';
    const userId = APP.userProfile?.uid || '';
    const isCustomer = APP.userProfile?.accountType === 'customer';
    
    let subscriptionHTML = '';
    
    // =====================
    // DROPSHIP STATUS
    // =====================
    if (APP.userProfile.isDropshipper) {
        const expiry = APP.userProfile.dropshipPlanExpiry;
        if (expiry) {
            const expiryDate = expiry.toDate ? expiry.toDate() : new Date(expiry);
            const now = new Date();
            const daysLeft = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
            const planName = APP.userProfile.dropshipPlan || 'starter';
            
            if (daysLeft <= 3 && daysLeft > 0) {
                subscriptionHTML += `
                    <div style="background:#FFF3E0;padding:12px;border-radius:8px;margin:10px 0;border-left:4px solid #FF9800;">
                        <div style="display:flex;justify-content:space-between;align-items:center;">
                            <div><strong>📦 ${planName.toUpperCase()} Plan</strong><p style="font-size:12px;color:#E65100;margin-top:3px;">⏰ Expires in <strong>${daysLeft} day${daysLeft > 1 ? 's' : ''}</strong></p></div>
                            <button class="btn-small btn-gold" onclick="renewDropshipPlan()">Renew</button>
                        </div>
                    </div>`;
            } else if (daysLeft <= 0) {
                subscriptionHTML += `
                    <div style="background:#FFEBEE;padding:12px;border-radius:8px;margin:10px 0;border-left:4px solid #F44336;">
                        <div style="display:flex;justify-content:space-between;align-items:center;">
                            <div><strong>📦 Dropship Expired</strong><p style="font-size:12px;color:#C62828;margin-top:3px;">Your plan has expired</p></div>
                            <button class="btn-small btn-gold" onclick="renewDropshipPlan()">Renew</button>
                        </div>
                    </div>`;
            } else {
                subscriptionHTML += `
                    <div style="background:#E8F5E9;padding:10px 15px;border-radius:8px;margin:5px 0;font-size:13px;display:flex;justify-content:space-between;align-items:center;">
                        <span>📦 <strong>${planName.toUpperCase()} Plan</strong> - ${daysLeft} days remaining</span>
                        <div>${daysLeft <= 10 ? `<button class="btn-small btn-outline" onclick="renewDropshipPlan()">Renew</button>` : ''}<button class="btn-small btn-outline" onclick="upgradeDropshipPlan()" style="margin-left:5px;">Upgrade</button></div>
                    </div>`;
            }
        }
    } else {
        subscriptionHTML += `
            <button class="menu-item" onclick="applyForDropship()">
                <span class="menu-icon">📦</span> Become a Dropshipper
                <span style="margin-left:auto;color:var(--gold-dark);">From $${APP.dropshipStarter}/mo</span>
                <span class="menu-arrow">›</span>
            </button>`;
    }
    
    // =====================
    // MERCHANT STATUS
    // =====================
    if (APP.userProfile.isMerchant) {
        subscriptionHTML += `
            <div style="background:#E8F5E9;padding:10px 15px;border-radius:8px;margin:5px 0;font-size:13px;">
                🏪 <strong>Merchant Active</strong> - ${APP.userProfile.merchantSubscription === 'lifetime' ? 'Lifetime Access' : 'Active'}
            </div>`;
    } else {
        subscriptionHTML += `
            <button class="menu-item" onclick="applyForMerchant()">
                <span class="menu-icon">🏪</span> Become a Merchant
                <span style="margin-left:auto;color:var(--gold-dark);">$${APP.merchantPrice} lifetime</span>
                <span class="menu-arrow">›</span>
            </button>`;
    }
    
    // =====================
    // STORE OWNER STATUS (NEW)
    // =====================
    if (APP.userProfile.isStoreOwner) {
        const expiry = APP.userProfile.storeOwnerExpiry;
        if (expiry) {
            const expiryDate = expiry.toDate ? expiry.toDate() : new Date(expiry);
            const now = new Date();
            const daysLeft = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
            
            if (daysLeft <= 3 && daysLeft > 0) {
                subscriptionHTML += `
                    <div style="background:#FFF3E0;padding:12px;border-radius:8px;margin:10px 0;border-left:4px solid #FF9800;">
                        <div style="display:flex;justify-content:space-between;align-items:center;">
                            <div><strong>🏬 Store Owner</strong><p style="font-size:12px;color:#E65100;">⏰ Expires in <strong>${daysLeft} day${daysLeft>1?'s':''}</strong></p></div>
                            <button class="btn-small btn-gold" onclick="renewStoreOwner()">Renew</button>
                        </div>
                    </div>`;
            } else if (daysLeft <= 0) {
                subscriptionHTML += `
                    <div style="background:#FFEBEE;padding:12px;border-radius:8px;margin:10px 0;border-left:4px solid #F44336;">
                        <div><strong>🏬 Store Expired</strong></div>
                        <button class="btn-small btn-gold" onclick="renewStoreOwner()">Renew</button>
                    </div>`;
            } else {
                subscriptionHTML += `
                    <div style="background:#E8F5E9;padding:10px 15px;border-radius:8px;margin:5px 0;font-size:13px;display:flex;justify-content:space-between;">
                        <span>🏬 <strong>Store Owner Active</strong> - ${daysLeft} days</span>
                        ${daysLeft<=10?`<button class="btn-small btn-outline" onclick="renewStoreOwner()">Renew</button>`:''}
                    </div>`;
            }
        }
    } else {
        subscriptionHTML += `
            <button class="menu-item" onclick="applyForStoreOwner()">
                <span class="menu-icon">🏬</span> Own a Store
                <span style="margin-left:auto;color:var(--gold-dark);">$5/mo</span>
                <span class="menu-arrow">›</span>
            </button>`;
    }
    
    // =====================
    // INFLUENCER STATUS
    // =====================
    if (APP.userProfile.influencerStatus === 'approved') {
        subscriptionHTML += `
            <div style="background:#E8F5E9;padding:10px 15px;border-radius:8px;margin:5px 0;font-size:13px;">
                🤝 <strong>Influencer Active</strong>${APP.userProfile.influencerVerified ? ' ✓ Verified' : ''}
            </div>`;
    } else if (APP.userProfile.influencerStatus === 'pending') {
        subscriptionHTML += `
            <div style="background:#FFF8E1;padding:10px 15px;border-radius:8px;margin:5px 0;font-size:13px;">
                🤝 <strong>Influencer Application Pending</strong>
            </div>`;
    } else if (APP.userProfile.influencerStatus === 'suspended') {
        subscriptionHTML += `
            <div style="background:#FFEBEE;padding:10px 15px;border-radius:8px;margin:5px 0;font-size:13px;">
                🤝 <strong>Influencer Suspended</strong>
            </div>`;
    } else if (APP.userProfile.influencerStatus === 'rejected') {
        subscriptionHTML += `
            <div style="background:#FFEBEE;padding:10px 15px;border-radius:8px;margin:5px 0;font-size:13px;">
                🤝 <strong>Influencer Rejected</strong>
            </div>`;
    } else {
        subscriptionHTML += `
            <button class="menu-item" onclick="applyForInfluencer()">
                <span class="menu-icon">🤝</span> Apply as Influencer
                <span class="menu-arrow">›</span>
            </button>`;
    }
    
    // =====================
    // RENDER PROFILE
    // =====================
    container.innerHTML = `
        <div class="profile-header-card">
            <div style="position:relative;display:inline-block;cursor:pointer;" onclick="document.getElementById('profile-pic-upload').click()">
                <img src="${APP.userProfile.photoURL || APP.currentUser?.photoURL || '/app-icon.png'}" alt="Profile" class="profile-avatar" id="profile-avatar-img" onerror="this.src='/app-icon.png'">
                <div style="position:absolute;bottom:5px;right:5px;background:var(--gold);width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;">📷</div>
            </div>
            <input type="file" id="profile-pic-upload" accept="image/*" style="display:none;" onchange="uploadProfilePicture(event)">
            <h2 class="profile-name">${APP.userProfile.displayName || username}</h2>
            <p class="profile-username">@${username}</p>
            <div class="profile-badges">${badges.join(' ')}</div>
            <p style="margin-top:8px;">${APP.userProfile.countryFlag || '🌍'} ${APP.userProfile.country || ''}</p>
            <p style="font-size:13px;color:#666;">${APP.userProfile.accountType || 'Customer'} | ${APP.userProfile.currency || 'USD'}</p>
        </div>
        <div style="padding:0 15px;">${subscriptionHTML}</div>
        <div class="profile-menu">
            <button class="menu-item" onclick="navigateTo('settings')"><span class="menu-icon">⚙️</span> Settings<span class="menu-arrow">›</span></button>
            <button class="menu-item" onclick="navigateTo('orders')"><span class="menu-icon">📦</span> My Orders<span class="menu-arrow">›</span></button>
            <button class="menu-item" onclick="navigateTo('wallet')"><span class="menu-icon">💰</span> Wallet<span class="menu-arrow">›</span></button>
            <button class="menu-item" onclick="navigateTo('customerservice')"><span class="menu-icon">🎧</span> Customer Service<span class="menu-arrow">›</span></button>
            ${APP.userProfile.isMerchant ? `<button class="menu-item" onclick="navigateTo('merchant')"><span class="menu-icon">🏪</span> Merchant Dashboard<span class="menu-arrow">›</span></button>` : ''}
            ${APP.userProfile.isDropshipper ? `<button class="menu-item" onclick="navigateTo('dropship')"><span class="menu-icon">📦</span> Dropship Dashboard<span class="menu-arrow">›</span></button>` : ''}
            ${APP.userProfile.isStoreOwner ? `<button class="menu-item" onclick="navigateTo('store-owner')"><span class="menu-icon">🏬</span> My Store<span class="menu-arrow">›</span></button>` : ''}
            ${APP.userProfile.influencerStatus === 'approved' ? `<button class="menu-item" onclick="navigateTo('influencer-dashboard')"><span class="menu-icon">📊</span> Influencer Dashboard<span class="menu-arrow">›</span></button>` : ''}
            ${!isCustomer ? `<button class="menu-item" onclick="navigateTo('leaderboard')"><span class="menu-icon">🏆</span> Leaderboard<span class="menu-arrow">›</span></button><button class="menu-item" onclick="navigateTo('hall-of-fame')"><span class="menu-icon">🌟</span> Hall of Fame<span class="menu-arrow">›</span></button>` : ''}
            <div style="background:#f5f5f5;padding:12px;border-radius:8px;margin:10px 0;"><small style="color:#666;">Shoplify Wallet Username:</small><div style="font-size:20px;font-weight:700;color:var(--gold-dark);">@${username}</div></div>
            <div style="background:#f5f5f5;padding:12px;border-radius:8px;margin:10px 0;"><small style="color:#666;">Your User ID:</small><div class="user-id-display">${userId}</div></div>
            <button class="menu-item" style="color:var(--red);" onclick="confirmLogout()"><span class="menu-icon">🚪</span> Logout<span class="menu-arrow">›</span></button>
        </div>`;
}

// =====================
// STORE OWNER APPLICATION
// =====================
function applyForStoreOwner() {
    showModal(`
        <div style="padding:10px;max-height:70vh;overflow-y:auto;">
            <h3>🏬 Own a Store</h3>
            <p style="color:#666;margin:10px 0;">Create your own store on ONESHOPLIFY. Sell products, tickets, and events.</p>
            <p style="font-size:13px;color:#666;">💰 <strong>$5/month</strong> - Multiple months available</p>
            <div style="background:#FFF8E1;padding:15px;border-radius:8px;margin:15px 0;">
                <p style="font-weight:600;">Store Features:</p>
                <p style="font-size:12px;">✅ Store link: store.oneshoplify.com</p>
                <p style="font-size:12px;">✅ Add your own products</p>
                <p style="font-size:12px;">✅ Ticket & Event sales</p>
                <p style="font-size:12px;">✅ Discount codes</p>
                <p style="font-size:12px;">✅ Product sponsorship ($10/mo per product)</p>
                <p style="font-size:12px;">✅ Shipping rate settings</p>
                <p style="font-size:12px;">✅ Contract with influencers</p>
            </div>
            <button class="btn-gold btn-full" onclick="startStoreOwnerSetup()">🏬 Create My Store</button>
            <button class="btn-outline btn-full" style="margin-top:8px;" onclick="hideModal()">Cancel</button>
        </div>`);
}

function startStoreOwnerSetup() { hideModal(); navigateTo('store-owner-setup'); }

// =====================
// STORE OWNER SETUP
// =====================
function loadStoreOwnerSetup() {
    const container = document.getElementById('store-owner-setup-content');
    if (!container) return;
    
    container.innerHTML = `
        <div style="padding:20px;">
            <h3>🏬 Store Setup</h3>
            <p style="color:#666;margin-bottom:20px;">Fill in your store details</p>
            
            <div class="input-group"><label>Store Type *</label>
                <select id="store-type" class="input-field"><option value="">Select type...</option><option value="individual">Individual Store</option><option value="organization">Organization Store</option></select>
            </div>
            <div class="input-group"><label>Store Name *</label><input type="text" id="store-name" class="input-field" placeholder="My Store"></div>
            <div class="input-group"><label>Description (100 words max)</label><textarea id="store-description" class="input-field" rows="3" maxlength="500"></textarea></div>
            <div class="input-group"><label>Store Category *</label>
                <select id="store-category" class="input-field"><option value="">Select...</option><option value="fashion">Fashion</option><option value="electronics">Electronics</option><option value="food">Food & Drinks</option><option value="tickets">Tickets & Events</option><option value="beauty">Beauty</option><option value="sports">Sports</option><option value="home">Home & Garden</option><option value="all_purpose">All Purpose Store</option></select>
            </div>
            <div class="input-group"><label>Store Country *</label>
                <select id="store-country" class="input-field">${typeof COUNTRIES!=='undefined'?Object.entries(COUNTRIES).sort((a,b)=>a[1].name.localeCompare(b[1].name)).map(([c,d])=>`<option value="${c}" ${APP.userProfile?.country===c?'selected':''}>${d.flag||''} ${d.name}</option>`).join(''):''}</select>
            </div>
            <div class="input-group"><label>Shipping Countries</label>
                <div id="shipping-countries-checkboxes" style="max-height:200px;overflow-y:auto;background:white;border:1px solid #e0e0e0;border-radius:8px;padding:10px;">
                    ${typeof COUNTRIES!=='undefined'?Object.entries(COUNTRIES).sort((a,b)=>a[1].name.localeCompare(b[1].name)).slice(0,30).map(([c,d])=>`<label style="display:flex;align-items:center;gap:8px;padding:5px 0;cursor:pointer;"><input type="checkbox" class="shipping-country-cb" value="${c}"><span>${d.flag||''} ${d.name}</span></label>`).join(''):''}
                </div>
            </div>
            <div class="input-group"><label>Product Range</label>
                <select id="product-range" class="input-field"><option value="1-10">1-10 Products</option><option value="10-50">10-50 Products</option><option value="50-100">50-100 Products</option><option value="100-500">100-500 Products</option></select>
            </div>
            <div class="input-group"><label>Industrial UID (from Shoplify Wallet)</label><input type="text" id="industrial-uid" class="input-field" placeholder="Generate from Wallet > Profile > Store & Gateway"><small style="color:#999;">Skip if you don't have one yet</small></div>
            <div class="input-group"><label>Store Logo (Upload)</label><input type="file" id="store-logo-upload" class="input-field" accept="image/*"></div>
            <div class="input-group"><label>Store Banner (Upload)</label><input type="file" id="store-banner-upload" class="input-field" accept="image/*"></div>
            
            <label style="display:flex;align-items:center;gap:8px;margin:15px 0;cursor:pointer;"><input type="checkbox" id="agree-fulfill" style="width:18px;height:18px;"><span style="font-size:13px;">I confirm I will fulfill all orders</span></label>
            <label style="display:flex;align-items:center;gap:8px;margin:15px 0;cursor:pointer;"><input type="checkbox" id="agree-terms" style="width:18px;height:18px;"><span style="font-size:13px;">I agree to Store Terms & Conditions</span></label>
            
            <div class="input-group"><label>Subscription Duration</label>
                <select id="store-subscription-months" class="input-field"><option value="1">1 Month - $5</option><option value="3">3 Months - $14</option><option value="6">6 Months - $27</option><option value="12">12 Months - $50</option></select>
            </div>
            <button class="btn-gold btn-full" onclick="completeStoreOwnerSetup()">💳 Pay & Create Store</button>
        </div>`;
}

async function completeStoreOwnerSetup() {
    const storeType = document.getElementById('store-type')?.value;
    const storeName = document.getElementById('store-name')?.value?.trim();
    const description = document.getElementById('store-description')?.value?.trim();
    const category = document.getElementById('store-category')?.value;
    const country = document.getElementById('store-country')?.value;
    const productRange = document.getElementById('product-range')?.value;
    const industrialUid = document.getElementById('industrial-uid')?.value?.trim();
    const months = parseInt(document.getElementById('store-subscription-months')?.value) || 1;
    
    if (!storeType || !storeName || !category || !country) { showToast('Fill all required fields','error'); return; }
    if (!document.getElementById('agree-fulfill')?.checked || !document.getElementById('agree-terms')?.checked) { showToast('Agree to terms','error'); return; }
    
    const prices = {1:5, 3:14, 6:27, 12:50};
    const price = prices[months] || 5;
    
    if ((APP.userProfile.walletBalance||0) < price) { showToast(`Need $${price}`,'error'); navigateTo('wallet'); return; }
    
    const shippingCountries = [];
    document.querySelectorAll('.shipping-country-cb:checked').forEach(cb => shippingCountries.push(cb.value));
    
    showLoader();
    try {
        const userId = APP.userProfile.uid;
        const expiryDate = new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000);
        const username = APP.userProfile.username;
        
        let logoUrl = '', bannerUrl = '';
        const logoFile = document.getElementById('store-logo-upload')?.files?.[0];
        const bannerFile = document.getElementById('store-banner-upload')?.files?.[0];
        if (logoFile) { try { logoUrl = await uploadToCloudinary(logoFile); } catch(e) {} }
        if (bannerFile) { try { bannerUrl = await uploadToCloudinary(bannerFile); } catch(e) {} }
        
        await db.collection('stores').doc(userId).set({
            ownerId: userId, ownerUsername: username, storeType, storeName, description, category, country,
            shippingCountries, productRange, industrialUid, logo: logoUrl, banner: bannerUrl,
            storeUrl: `https://${username}.oneshoplify.com`, status: 'active',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(), expiresAt: expiryDate
        });
        
        await db.collection('users').doc(userId).update({
            walletBalance: firebase.firestore.FieldValue.increment(-price),
            isStoreOwner: true, storeOwnerExpiry: firebase.firestore.Timestamp.fromDate(expiryDate),
            storeName, storeUrl: `https://${username}.oneshoplify.com`
        });
        
        APP.userProfile.walletBalance -= price;
        APP.userProfile.isStoreOwner = true;
        APP.userProfile.storeOwnerExpiry = expiryDate;
        APP.userProfile.storeName = storeName;
        
        await db.collection('transactions').add({userId,type:'subscription',amount:price,currency:'USD',status:'completed',description:`Store Owner - ${months} month(s)`,createdAt:firebase.firestore.FieldValue.serverTimestamp()});
        
        hideLoader();
        showToast(`Store created! 🏬 ${username}.oneshoplify.com`,'success');
        navigateTo('profile');
    } catch(e) { hideLoader(); showToast('Failed','error'); }
}

async function renewStoreOwner() {
    showModal(`
        <div style="padding:10px;">
            <h3>🏬 Renew Store</h3>
            <p style="color:#666;">Select duration</p>
            <div class="input-group"><label>Months</label>
                <select id="renew-months" class="input-field"><option value="1">1 Month - $5</option><option value="3">3 Months - $14</option><option value="6">6 Months - $27</option><option value="12">12 Months - $50</option></select>
            </div>
            <button class="btn-gold btn-full" onclick="processStoreRenewal()">💳 Renew</button>
        </div>`);
}

async function processStoreRenewal() {
    const months = parseInt(document.getElementById('renew-months')?.value) || 1;
    const prices = {1:5, 3:14, 6:27, 12:50};
    const price = prices[months] || 5;
    
    if ((APP.userProfile.walletBalance||0) < price) { showToast(`Need $${price}`,'error'); return; }
    
    hideModal(); showLoader();
    try {
        const currentExpiry = APP.userProfile.storeOwnerExpiry?.toDate?.() || new Date();
        const newExpiry = new Date(Math.max(currentExpiry.getTime(), Date.now()) + months * 30 * 24 * 60 * 60 * 1000);
        
        await db.collection('users').doc(APP.userProfile.uid).update({
            walletBalance: firebase.firestore.FieldValue.increment(-price),
            storeOwnerExpiry: firebase.firestore.Timestamp.fromDate(newExpiry)
        });
        await db.collection('stores').doc(APP.userProfile.uid).update({expiresAt: newExpiry});
        
        APP.userProfile.walletBalance -= price;
        APP.userProfile.storeOwnerExpiry = newExpiry;
        
        await db.collection('transactions').add({userId:APP.userProfile.uid,type:'subscription',amount:price,currency:'USD',status:'completed',description:`Store renewal - ${months} month(s)`,createdAt:firebase.firestore.FieldValue.serverTimestamp()});
        
        hideLoader(); showToast('Store renewed! ✅','success'); loadProfileScreen();
    } catch(e) { hideLoader(); showToast('Failed','error'); }
}

// =====================
// INFLUENCER APPLICATION (from previous version)
// =====================
async function applyForInfluencer() {
    if (APP.userProfile?.influencerStatus === 'pending') { showToast('Application under review','info'); return; }
    if (APP.userProfile?.influencerStatus === 'approved') { showToast('Already approved','info'); return; }
    if (APP.userProfile?.influencerStatus === 'rejected') { showToast('Rejected. Cannot reapply.','error'); return; }
    if (APP.userProfile?.influencerStatus === 'suspended') { showToast('Account suspended.','error'); return; }
    
    showModal(`
        <div style="padding:10px;max-height:70vh;overflow-y:auto;">
            <h3>🤝 Apply as Influencer</h3>
            <div style="background:#f5f5f5;padding:15px;border-radius:8px;margin:15px 0;font-size:13px;line-height:1.8;">
                <p><strong>Terms:</strong></p><p>1. Name must match social media</p><p>2. 3 reports = 2-week suspension</p><p>3. 2 suspensions = ban</p><p>4. Earn 5% commission</p><p>5. Fee: $1/month</p>
            </div>
            <label style="display:flex;align-items:center;gap:8px;cursor:pointer;margin-bottom:15px;"><input type="checkbox" id="agree-influencer-terms" style="width:18px;height:18px;"><span>I agree</span></label>
            ${(APP.userProfile?.walletBalance||0)>=APP.advertiserPrice?`<button class="btn-gold btn-full" onclick="proceedToInfluencerApplication()">💳 Pay $${APP.advertiserPrice} & Apply</button>`:`<div style="background:#FFEBEE;padding:12px;border-radius:8px;"><p style="color:#C62828;">Need $${APP.advertiserPrice}</p></div><button class="btn-gold btn-full" onclick="hideModal();navigateTo('wallet');">💰 Deposit</button>`}
            <button class="btn-outline btn-full" style="margin-top:8px;" onclick="hideModal()">Cancel</button>
        </div>`);
}

function proceedToInfluencerApplication() { if(!document.getElementById('agree-influencer-terms')?.checked){showToast('Agree to terms','error');return;} hideModal(); navigateTo('influencer-apply'); }

// =====================
// SUBSCRIPTION FUNCTIONS
// =====================
function applyForDropship() {
    const plans = [{name:'Starter',price:APP.dropshipStarter,color:'#4CAF50'},{name:'Growth',price:APP.dropshipGrowth,color:'#2196F3'},{name:'Professional',price:APP.dropshipPro,color:'#9C27B0'},{name:'Elite',price:APP.dropshipElite,color:'#FF9800'}];
    showModal(`<div style="padding:10px;max-height:70vh;overflow-y:auto;"><h3>📦 Choose Plan</h3><p>Balance: ${formatCurrency(APP.userProfile?.walletBalance||0)}</p>${plans.map(p=>`<div class="plan-card" style="border-left:4px solid ${p.color};margin:10px 0;"><h4>${p.name}</h4><div class="plan-price">$${p.price}/mo</div>${(APP.userProfile?.walletBalance||0)>=p.price?`<button class="btn-gold btn-full" onclick="payDropshipSubscription('${p.name.toLowerCase()}',${p.price})">Select</button>`:`<button class="btn-outline btn-full" disabled>Need $${p.price}</button>`}</div>`).join('')}<button class="btn-outline btn-full" onclick="hideModal()">Cancel</button></div>`);
}

function applyForMerchant() {
    showModal(`<div style="padding:10px;"><h3>🏪 Become a Merchant</h3><div style="background:#FFF8E1;padding:15px;border-radius:8px;"><p><strong>$${APP.merchantPrice} Lifetime</strong></p></div><p>Balance: ${formatCurrency(APP.userProfile?.walletBalance||0)}</p>${(APP.userProfile?.walletBalance||0)>=APP.merchantPrice?`<button class="btn-gold btn-full" onclick="payMerchantSubscription()">Pay $${APP.merchantPrice}</button>`:`<button class="btn-gold btn-full" onclick="hideModal();navigateTo('wallet');">💰 Deposit</button>`}<button class="btn-outline btn-full" style="margin-top:8px;" onclick="hideModal()">Cancel</button></div>`);
}

async function payDropshipSubscription(plan, price) {
    hideModal(); if((APP.userProfile?.walletBalance||0)<price){showToast('Insufficient balance','error');navigateTo('wallet');return;}
    showLoader();
    try{const d=new Date(Date.now()+30*24*60*60*1000);await db.collection('users').doc(APP.userProfile.uid).update({walletBalance:firebase.firestore.FieldValue.increment(-price),dropshipPlan:plan,isDropshipper:true,dropshipPlanExpiry:firebase.firestore.Timestamp.fromDate(d)});APP.userProfile.walletBalance-=price;APP.userProfile.dropshipPlan=plan;APP.userProfile.isDropshipper=true;await db.collection('transactions').add({userId:APP.userProfile.uid,type:'subscription',amount:price,currency:'USD',status:'completed',createdAt:firebase.firestore.FieldValue.serverTimestamp()});hideLoader();showToast(`Subscribed! 🎉`,'success');navigateTo('dropship');}catch(e){hideLoader();showToast('Failed','error');}
}

async function payMerchantSubscription() {
    hideModal(); if((APP.userProfile?.walletBalance||0)<APP.merchantPrice){showToast('Insufficient balance','error');navigateTo('wallet');return;}
    showLoader();
    try{await db.collection('users').doc(APP.userProfile.uid).update({walletBalance:firebase.firestore.FieldValue.increment(-APP.merchantPrice),isMerchant:true,merchantSubscription:'lifetime',storeActive:true,storeName:`${APP.userProfile.username}'s Store`});APP.userProfile.walletBalance-=APP.merchantPrice;APP.userProfile.isMerchant=true;await db.collection('transactions').add({userId:APP.userProfile.uid,type:'subscription',amount:APP.merchantPrice,currency:'USD',status:'completed',createdAt:firebase.firestore.FieldValue.serverTimestamp()});hideLoader();showToast('Merchant activated! 🏪','success');navigateTo('merchant');}catch(e){hideLoader();showToast('Failed','error');}
}

async function renewDropshipPlan() {
    const prices={starter:APP.dropshipStarter,growth:APP.dropshipGrowth,pro:APP.dropshipPro,elite:APP.dropshipElite};const price=prices[APP.userProfile?.dropshipPlan]||APP.dropshipStarter;
    if((APP.userProfile?.walletBalance||0)<price){showToast('Insufficient balance','error');navigateTo('wallet');return;}
    showLoader();
    try{const d=new Date(Date.now()+30*24*60*60*1000);await db.collection('users').doc(APP.userProfile.uid).update({walletBalance:firebase.firestore.FieldValue.increment(-price),dropshipPlanExpiry:firebase.firestore.Timestamp.fromDate(d)});APP.userProfile.walletBalance-=price;hideLoader();showToast('Renewed! 🎉','success');loadProfileScreen();}catch(e){hideLoader();showToast('Failed','error');}
}

function upgradeDropshipPlan(){navigateTo('dropship');}

// =====================
// PROFILE PICTURE UPLOAD
// =====================
async function uploadProfilePicture(event) {
    const file=event.target.files[0];if(!file)return;if(file.size>5*1024*1024){showToast('Max 5MB','error');return;}
    showLoader();
    try{const url=await uploadToCloudinary(file);await db.collection('users').doc(APP.userProfile.uid).update({photoURL:url});APP.userProfile.photoURL=url;document.getElementById('profile-avatar-img').src=url;const hdr=document.getElementById('header-avatar');if(hdr)hdr.src=url;hideLoader();showToast('Updated!','success');}catch(e){hideLoader();showToast('Failed','error');}
}

// =====================
// SETTINGS
// =====================
async function loadSettingsScreen() {
    const container=document.getElementById('settings-content');if(!container||!APP.userProfile)return;
    const countryOptions=typeof COUNTRIES!=='undefined'?Object.entries(COUNTRIES).sort((a,b)=>a[1].name.localeCompare(b[1].name)).map(([c,d])=>`<option value="${c}" ${APP.userProfile.country===c?'selected':''}>${d.flag||''} ${d.name}</option>`).join(''):'';
    container.innerHTML=`<div style="padding:20px;"><h3>👤 Account</h3><div class="input-group"><label>Username</label><input type="text" id="settings-username" class="input-field" value="${APP.userProfile.username||''}"></div><div class="input-group"><label>Display Name</label><input type="text" id="settings-displayname" class="input-field" value="${APP.userProfile.displayName||''}"></div><div class="input-group"><label>Phone</label><div class="phone-input-wrapper"><span class="country-code-display" id="settings-country-code">${COUNTRIES?.[APP.userProfile.country]?.code||'+1'}</span><input type="tel" id="settings-phone" class="input-field phone-input" value="${(APP.userProfile.phoneNumber||'').replace(COUNTRIES?.[APP.userProfile.country]?.code||'+1','')}"></div></div><div class="input-group"><label>Country</label><select id="settings-country" class="input-field" onchange="updateSettingsCountryCode()">${countryOptions}</select></div><div class="input-group"><label>New Password</label><input type="password" id="settings-password" class="input-field" placeholder="Leave blank"></div><button class="btn-gold btn-full" style="margin-top:15px;" onclick="saveSettings()">💾 Save</button><h3 style="margin-top:25px;">🎨 Appearance</h3><div class="setting-item"><span>Theme</span><div><button class="theme-btn ${APP.userProfile.theme==='light'?'active':''}" onclick="setThemeSetting('light')">☀️</button><button class="theme-btn ${APP.userProfile.theme==='dark'?'active':''}" onclick="setThemeSetting('dark')">🌙</button></div></div><h3 style="margin-top:25px;">ℹ️ About</h3><p style="color:#666;">ONESHOPLIFY Enterprise v${APP.version}</p></div>`;
}

function updateSettingsCountryCode(){const c=document.getElementById('settings-country')?.value;const d=document.getElementById('settings-country-code');if(d&&c&&COUNTRIES?.[c])d.textContent=COUNTRIES[c].code||'+1';}

async function saveSettings(){
    const username=document.getElementById('settings-username')?.value?.trim()?.toLowerCase();const displayName=document.getElementById('settings-displayname')?.value?.trim();const phone=document.getElementById('settings-phone')?.value?.trim();const country=document.getElementById('settings-country')?.value;const password=document.getElementById('settings-password')?.value;
    if(username&&!/^[a-z0-9]{3,30}$/.test(username)){showToast('Invalid username','error');return;}
    showLoader();
    try{const updates={updatedAt:firebase.firestore.FieldValue.serverTimestamp()};if(username)updates.username=username;if(displayName)updates.displayName=displayName;if(country&&COUNTRIES?.[country]){updates.country=country;updates.countryFlag=COUNTRIES[country].flag;updates.currency=COUNTRIES[country].currency||'USD';}if(phone)updates.phoneNumber=(COUNTRIES?.[country||APP.userProfile.country]?.code||'+1')+phone;if(password&&password.length>=6)updates.password=password;await db.collection('users').doc(APP.userProfile.uid).update(updates);Object.assign(APP.userProfile,updates);hideLoader();showToast('Saved!✅','success');}catch(e){hideLoader();showToast('Failed','error');}
}

function setThemeSetting(theme){APP.userProfile.theme=theme;document.querySelectorAll('.theme-btn').forEach(b=>b.classList.remove('active'));document.querySelectorAll('.theme-btn').forEach(b=>{if(b.textContent.includes(theme==='light'?'☀️':'🌙'))b.classList.add('active');});document.body.classList.toggle('dark-theme',theme==='dark');db.collection('users').doc(APP.userProfile.uid).update({theme}).catch(()=>{});}

function confirmLogout(){showModal(`<h3>Logout</h3><p>Are you sure?</p><div style="display:flex;gap:10px;margin-top:15px;"><button class="btn-outline" style="flex:1;" onclick="hideModal()">Cancel</button><button class="btn-danger" style="flex:1;" onclick="performLogout()">Logout</button></div>`);}
function performLogout(){hideModal();logout();}

// Global access
window.applyForStoreOwner = applyForStoreOwner;
window.startStoreOwnerSetup = startStoreOwnerSetup;
window.loadStoreOwnerSetup = loadStoreOwnerSetup;
window.completeStoreOwnerSetup = completeStoreOwnerSetup;
window.renewStoreOwner = renewStoreOwner;

console.log('✅ profile.js fully loaded with Store Ownership');
