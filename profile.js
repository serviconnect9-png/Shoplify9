// profile.js - FIXED (Store Ownership vs Merchant vs Dropship - All Separate)
console.log('✅ profile.js loaded');

async function loadProfileScreen() {
    if (!APP.userProfile) return;
    
    const container = document.getElementById('profile-content');
    if (!container) return;
    
    const badges = [];
    if (APP.userProfile.isVerifiedMerchant) badges.push('<span class="verified-badge">✓</span>');
    if (APP.userProfile.isAppVerified) badges.push('<span class="app-verified-badge">✓</span>');
    if (APP.userProfile.dropshipVerified) badges.push('<span class="verified-badge" style="background:#20D5EC;">✓</span>');
    
    const username = APP.userProfile?.username || '';
    const userId = APP.userProfile?.uid || '';
    const isCustomer = APP.userProfile?.accountType === 'customer';
    
    let subscriptionHTML = '';
    
    // =====================
    // 1. STORE OWNERSHIP (NEW - Independent Store)
    // =====================
    if (APP.userProfile.hasStore) {
        // User OWNS a store
        const storeExpiry = APP.userProfile.storeExpiry;
        const storeName = APP.userProfile.storeName || 'My Store';
        const storeUrl = `https://${username}.oneshoplify.com`;
        
        if (storeExpiry) {
            const expiryDate = storeExpiry.toDate ? storeExpiry.toDate() : new Date(storeExpiry.seconds * 1000);
            const daysLeft = Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24));
            
            if (daysLeft <= 5 && daysLeft > 0) {
                subscriptionHTML += `
                    <div style="background:#FFF3E0;padding:14px;border-radius:12px;margin:8px 0;border-left:4px solid #FF9800;">
                        <div style="display:flex;justify-content:space-between;align-items:center;">
                            <div><strong>🏪 ${storeName}</strong><p style="font-size:11px;color:#E65100;">⏰ ${daysLeft}d left</p></div>
                            <button class="btn-small btn-gold" onclick="showStorePlans()">Renew</button>
                        </div>
                    </div>`;
            } else if (daysLeft <= 0) {
                subscriptionHTML += `
                    <div style="background:#FFEBEE;padding:14px;border-radius:12px;margin:8px 0;border-left:4px solid #F44336;">
                        <div style="display:flex;justify-content:space-between;align-items:center;">
                            <div><strong>🏪 Store Expired</strong></div>
                            <button class="btn-small btn-gold" onclick="showStorePlans()">Renew</button>
                        </div>
                    </div>`;
            } else {
                subscriptionHTML += `
                    <div style="background:#E8F5E9;padding:12px;border-radius:10px;margin:5px 0;font-size:13px;">
                        🏪 <strong>${storeName}</strong> · ${daysLeft}d · ${storeUrl}
                    </div>`;
            }
        }
        
        // Store Management Button
        subscriptionHTML += `
            <button class="menu-item" onclick="openMyStore()" style="background:linear-gradient(135deg,#FFF8E1,#FFFDE7);border:2px solid #FFD700;">
                <span class="menu-icon" style="font-size:28px;">🏪</span>
                <div style="flex:1;text-align:left;">
                    <div style="font-weight:700;">Manage My Store</div>
                    <div style="font-size:11px;color:#666;">Add products, view orders, settings</div>
                </div>
                <span class="menu-arrow">›</span>
            </button>`;
            
    } else {
        // NO STORE - Show "Create Your Store" banner
        subscriptionHTML += `
            <div onclick="showStorePlans()" style="cursor:pointer;background:linear-gradient(135deg,#667eea,#764ba2);padding:20px;border-radius:14px;margin:10px 0;color:white;position:relative;overflow:hidden;box-shadow:0 4px 16px rgba(102,126,234,0.3);">
                <div style="position:absolute;top:-20px;right:-20px;font-size:80px;opacity:0.1;">🏪</div>
                <div style="position:relative;z-index:1;">
                    <h3 style="margin:0 0 5px;font-size:18px;">🏪 Create Your Own Store</h3>
                    <p style="opacity:0.9;font-size:13px;margin:0 0 12px;">Sell your products, tickets & events independently</p>
                    <div style="display:inline-block;background:white;color:#667eea;padding:8px 18px;border-radius:20px;font-weight:700;font-size:13px;">
                        Get Started from $5/mo →
                    </div>
                </div>
            </div>`;
    }
    
    // =====================
    // 2. MERCHANT (Marketplace Seller - DIFFERENT)
    // =====================
    if (APP.userProfile.isMerchant) {
        subscriptionHTML += `
            <div style="background:#E8F5E9;padding:10px;border-radius:8px;margin:5px 0;font-size:13px;">
                🛍️ <strong>Marketplace Seller</strong> - ${APP.userProfile.merchantSubscription==='lifetime'?'Lifetime':'Active'}
            </div>
            <button class="menu-item" onclick="navigateTo('merchant')">
                <span class="menu-icon">📊</span> Seller Dashboard
                <span class="menu-arrow">›</span>
            </button>`;
    } else {
        subscriptionHTML += `
            <button class="menu-item" onclick="applyForMerchant()">
                <span class="menu-icon">🛍️</span> Sell on Marketplace
                <span style="margin-left:auto;color:var(--gold-dark);">$${APP.merchantPrice} lifetime</span>
                <span class="menu-arrow">›</span>
            </button>`;
    }
    
    // =====================
    // 3. DROPSHIP (Reseller - DIFFERENT)
    // =====================
    if (APP.userProfile.isDropshipper) {
        const planName = APP.userProfile.dropshipPlan || 'starter';
        const expiry = APP.userProfile.dropshipPlanExpiry;
        let daysLeft = 30;
        if (expiry) {
            const ed = expiry.toDate ? expiry.toDate() : new Date(expiry);
            daysLeft = Math.ceil((ed - new Date()) / (1000 * 60 * 60 * 24));
        }
        
        subscriptionHTML += `
            <div style="background:#E8F5E9;padding:10px;border-radius:8px;margin:5px 0;font-size:13px;">
                📦 <strong>Dropship ${planName.toUpperCase()}</strong> · ${daysLeft}d
            </div>
            <button class="menu-item" onclick="navigateTo('dropship')">
                <span class="menu-icon">📦</span> Dropship Dashboard
                <span class="menu-arrow">›</span>
            </button>`;
    } else {
        subscriptionHTML += `
            <button class="menu-item" onclick="showDropshipPlans()">
                <span class="menu-icon">📦</span> Become a Dropshipper
                <span style="margin-left:auto;color:var(--gold-dark);">From $5/mo</span>
                <span class="menu-arrow">›</span>
            </button>`;
    }
    
    // =====================
    // 4. INFLUENCER
    // =====================
    if (APP.userProfile.influencerStatus === 'approved') {
        subscriptionHTML += `<div style="background:#E8F5E9;padding:10px;border-radius:8px;margin:5px 0;font-size:13px;">🤝 <strong>Influencer Active</strong></div>`;
    } else if (!APP.userProfile.influencerStatus || APP.userProfile.influencerStatus === 'none') {
        subscriptionHTML += `
            <button class="menu-item" onclick="showInfluencerApplication()">
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
                <img src="${APP.userProfile.photoURL || APP.currentUser?.photoURL || '/app-icon.png'}" 
                     alt="Profile" class="profile-avatar" id="profile-avatar-img" onerror="this.src='/app-icon.png'">
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
            
            <div style="background:#f5f5f5;padding:12px;border-radius:8px;margin:10px 0;">
                <small style="color:#666;">Shoplify Wallet Username:</small>
                <div style="font-size:20px;font-weight:700;color:var(--gold-dark);">@${username}</div>
            </div>
            
            <div style="background:#f5f5f5;padding:12px;border-radius:8px;margin:10px 0;">
                <small style="color:#666;">Your User ID:</small>
                <div class="user-id-display">${userId}</div>
            </div>
            
            <button class="menu-item" style="color:var(--red);" onclick="confirmLogout()"><span class="menu-icon">🚪</span> Logout<span class="menu-arrow">›</span></button>
        </div>
    `;
}

// =====================
// STORE OWNERSHIP FUNCTIONS
// =====================

function showStorePlans() {
    const plans = [
        { name: 'Monthly', price: 5, period: 'month', color: '#667eea', savings: 0 },
        { name: '3 Months', price: 13.50, period: 'quarter', color: '#2196F3', savings: 1.50 },
        { name: '6 Months', price: 24, period: 'biannual', color: '#9C27B0', savings: 6 },
        { name: 'Annual', price: 45, period: 'annual', color: '#FF9800', savings: 15 }
    ];
    
    showModal(`
        <div style="padding:15px;max-height:80vh;overflow-y:auto;">
            <div style="text-align:center;margin-bottom:20px;">
                <div style="font-size:50px;">🏪</div>
                <h3>Create Your Own Store</h3>
                <p style="color:#666;">Sell your products independently on ONESHOPLIFY</p>
                <p style="font-size:13px;">Balance: <strong>${formatCurrency(APP.userProfile?.walletBalance || 0)}</strong></p>
            </div>
            
            ${plans.map(plan => `
                <div style="background:white;border-radius:14px;padding:20px;margin-bottom:12px;box-shadow:0 2px 10px rgba(0,0,0,0.06);border-left:4px solid ${plan.color};">
                    <h4>${plan.name}</h4>
                    <div style="font-size:30px;font-weight:800;color:${plan.color};">$${plan.price}</div>
                    ${plan.savings > 0 ? `<p style="color:#4CAF50;font-size:12px;">Save $${plan.savings}</p>` : ''}
                    <ul style="list-style:none;padding:0;font-size:12px;color:#666;line-height:2;">
                        <li>✅ Your own store link</li>
                        <li>✅ Add your own products</li>
                        <li>✅ Sell tickets & events</li>
                        <li>✅ Product sponsorship</li>
                        <li>✅ Discount codes</li>
                    </ul>
                    ${(APP.userProfile?.walletBalance||0) >= plan.price ? `
                        <button class="btn-gold btn-full" onclick="payForStore('${plan.name.toLowerCase()}',${plan.price},'${plan.period}')">🚀 Start ${plan.name} - $${plan.price}</button>
                    ` : `
                        <button class="btn-outline btn-full" onclick="hideModal();navigateTo('wallet');">💰 Need $${plan.price} - Deposit</button>
                    `}
                </div>
            `).join('')}
        </div>
    `);
}

async function payForStore(planName, price, period) {
    hideModal();
    if ((APP.userProfile?.walletBalance||0) < price) { showToast('Insufficient balance','error'); navigateTo('wallet'); return; }
    showLoader();
    try {
        const expiry = new Date();
        if (period === 'month') expiry.setMonth(expiry.getMonth()+1);
        else if (period === 'quarter') expiry.setMonth(expiry.getMonth()+3);
        else if (period === 'biannual') expiry.setMonth(expiry.getMonth()+6);
        else expiry.setFullYear(expiry.getFullYear()+1);
        
        await db.collection('users').doc(APP.userProfile.uid).update({
            walletBalance: firebase.firestore.FieldValue.increment(-price),
            hasStore: true, storePlan: planName,
            storeExpiry: firebase.firestore.Timestamp.fromDate(expiry),
            storeActive: true
        });
        APP.userProfile.walletBalance -= price;
        APP.userProfile.hasStore = true;
        APP.userProfile.storePlan = planName;
        APP.userProfile.storeExpiry = { seconds: Math.floor(expiry.getTime()/1000) };
        
        await db.collection('transactions').add({
            userId: APP.userProfile.uid, type: 'store_subscription', amount: price,
            currency: 'USD', status: 'completed', createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        hideLoader();
        showToast('Store activated! Set up your store now. 🎉','success');
        
        // Show setup form
        setTimeout(() => startStoreSetup(), 500);
        
    } catch(e) { hideLoader(); showToast('Failed','error'); }
}

function startStoreSetup() {
    showModal(`
        <div style="padding:15px;max-height:80vh;overflow-y:auto;">
            <h3>🏪 Set Up Your Store</h3>
            <div class="input-group"><label>Store Name *</label><input type="text" id="ss-name" class="input-field" value="${APP.userProfile.storeName||''}" placeholder="My Store"></div>
            <div class="input-group"><label>Description</label><textarea id="ss-desc" class="input-field" rows="2">${APP.userProfile.storeDescription||''}</textarea></div>
            <div class="input-group"><label>Category</label><select id="ss-category" class="input-field">
                <option value="">Select</option>
                <option value="Fashion">Fashion</option><option value="Electronics">Electronics</option>
                <option value="Home">Home & Garden</option><option value="Sports">Sports</option>
                <option value="Beauty">Beauty</option><option value="Tickets & Events">Tickets & Events</option>
                <option value="All Purpose">All Purpose Store</option>
            </select></div>
            <div class="input-group"><label>Country</label><select id="ss-country" class="input-field">
                <option value="">Select</option>
                ${typeof COUNTRIES!=='undefined'?Object.entries(COUNTRIES).sort((a,b)=>a[1].name.localeCompare(b[1].name)).map(([c,d])=>`<option value="${c}" ${APP.userProfile.country===c?'selected':''}>${d.flag||''} ${d.name}</option>`).join(''):''}
            </select></div>
            <div class="input-group"><label>Logo</label><input type="file" id="ss-logo" class="input-field" accept="image/*"></div>
            <div class="input-group"><label>Banner</label><input type="file" id="ss-banner" class="input-field" accept="image/*"></div>
            <div class="input-group"><label>Theme Color</label><input type="color" id="ss-color" class="input-field" value="${APP.userProfile.storeColor||'#667eea'}" style="height:50px;"></div>
            <label style="display:flex;gap:8px;margin:10px 0;"><input type="checkbox" id="ss-fulfill"> I will fulfill all orders</label>
            <label style="display:flex;gap:8px;margin:10px 0;"><input type="checkbox" id="ss-terms"> I agree to Store Terms</label>
            <button class="btn-gold btn-full" onclick="completeStoreSetup()">🚀 Launch My Store</button>
        </div>
    `);
}

async function completeStoreSetup() {
    const name = document.getElementById('ss-name')?.value?.trim();
    const desc = document.getElementById('ss-desc')?.value?.trim();
    const category = document.getElementById('ss-category')?.value;
    const country = document.getElementById('ss-country')?.value;
    const color = document.getElementById('ss-color')?.value;
    const fulfill = document.getElementById('ss-fulfill')?.checked;
    const terms = document.getElementById('ss-terms')?.checked;
    
    if (!name) { showToast('Enter store name','error'); return; }
    if (!category) { showToast('Select category','error'); return; }
    if (!country) { showToast('Select country','error'); return; }
    if (!fulfill) { showToast('Confirm fulfillment','error'); return; }
    if (!terms) { showToast('Agree to terms','error'); return; }
    
    hideModal(); showLoader();
    try {
        let logo = APP.userProfile.storeLogo || '', banner = APP.userProfile.storeBanner || '';
        const lf = document.getElementById('ss-logo')?.files?.[0];
        const bf = document.getElementById('ss-banner')?.files?.[0];
        if (lf) { try { logo = await uploadToCloudinary(lf); } catch(e) {} }
        if (bf) { try { banner = await uploadToCloudinary(bf); } catch(e) {} }
        
        await db.collection('users').doc(APP.userProfile.uid).update({
            storeName: name, storeDescription: desc, storeCategory: category,
            storeCountry: country, storeColor: color, storeLogo: logo, storeBanner: banner,
            storeActive: true, hasStore: true
        });
        Object.assign(APP.userProfile, { storeName: name, storeDescription: desc, storeCategory: category, storeCountry: country, storeColor: color, storeLogo: logo, storeBanner: banner, storeActive: true, hasStore: true });
        
        hideLoader();
        showToast(`Store created! 🎉 ${APP.userProfile.username}.oneshoplify.com`,'success');
        loadProfileScreen();
    } catch(e) { hideLoader(); showToast('Failed','error'); }
}

function openMyStore() {
    // Open store management - this is DIFFERENT from merchant dashboard
    if (typeof loadStoreOwnerDashboard === 'function') {
        // Navigate to a dedicated store owner view
        const storeOwnerScreen = document.getElementById('screen-storeowner');
        if (!storeOwnerScreen) {
            // Use merchant screen as fallback but with store owner functions
            navigateTo('merchant');
            setTimeout(() => {
                if (typeof loadStoreOwnerDashboard === 'function') {
                    loadStoreOwnerDashboard();
                }
            }, 300);
        } else {
            navigateTo('storeowner');
        }
    } else {
        navigateTo('merchant');
    }
}

// =====================
// DROPSHIP PLANS
// =====================
function showDropshipPlans() {
    const plans = [
        { name: 'Starter', price: 5, color: '#4CAF50', icon: '🚀' },
        { name: 'Professional', price: 10, color: '#2196F3', icon: '📈' },
        { name: 'Enterprise', price: 45, color: '#FF9800', icon: '👑' }
    ];
    
    showModal(`
        <div style="padding:10px;">
            <h3>📦 Become a Dropshipper</h3>
            <p style="color:#666;">Resell products without inventory</p>
            <p>Balance: <strong>${formatCurrency(APP.userProfile?.walletBalance||0)}</strong></p>
            ${plans.map(p => `
                <div style="background:white;border-radius:12px;padding:15px;margin:10px 0;border-left:4px solid ${p.color};">
                    <h4>${p.icon} ${p.name}</h4>
                    <div style="font-size:24px;font-weight:800;">$${p.price}/mo</div>
                    ${(APP.userProfile?.walletBalance||0)>=p.price?`<button class="btn-gold btn-full" onclick="payDropship('${p.name.toLowerCase()}',${p.price})">Select</button>`:`<button class="btn-outline btn-full" disabled>Need $${p.price}</button>`}
                </div>
            `).join('')}
            <button class="btn-outline btn-full" onclick="hideModal()">Cancel</button>
        </div>
    `);
}

async function payDropship(plan, price) {
    hideModal();
    if ((APP.userProfile?.walletBalance||0)<price){showToast('Insufficient balance','error');navigateTo('wallet');return;}
    showLoader();
    try {
        const d = new Date(Date.now()+30*24*60*60*1000);
        await db.collection('users').doc(APP.userProfile.uid).update({
            walletBalance: firebase.firestore.FieldValue.increment(-price),
            dropshipPlan: plan, isDropshipper: true,
            dropshipPlanExpiry: firebase.firestore.Timestamp.fromDate(d)
        });
        APP.userProfile.walletBalance -= price;
        APP.userProfile.dropshipPlan = plan;
        APP.userProfile.isDropshipper = true;
        hideLoader(); showToast('Dropship activated! 🎉','success'); navigateTo('dropship');
    } catch(e) { hideLoader(); showToast('Failed','error'); }
}

// =====================
// MERCHANT (Marketplace Seller)
// =====================
function applyForMerchant() {
    showModal(`
        <div style="padding:10px;">
            <h3>🛍️ Sell on Marketplace</h3>
            <p style="color:#666;">List products on ONESHOPLIFY marketplace</p>
            <p><strong>$${APP.merchantPrice} Lifetime</strong></p>
            <p>Balance: <strong>${formatCurrency(APP.userProfile?.walletBalance||0)}</strong></p>
            ${(APP.userProfile?.walletBalance||0)>=APP.merchantPrice?`<button class="btn-gold btn-full" onclick="payMerchant()">Pay $${APP.merchantPrice}</button>`:`<button class="btn-gold btn-full" onclick="hideModal();navigateTo('wallet');">Deposit</button>`}
            <button class="btn-outline btn-full" style="margin-top:8px;" onclick="hideModal()">Cancel</button>
        </div>
    `);
}

async function payMerchant() {
    hideModal();
    if ((APP.userProfile?.walletBalance||0)<APP.merchantPrice){showToast('Insufficient balance','error');navigateTo('wallet');return;}
    showLoader();
    try {
        await db.collection('users').doc(APP.userProfile.uid).update({
            walletBalance: firebase.firestore.FieldValue.increment(-APP.merchantPrice),
            isMerchant: true, merchantSubscription: 'lifetime', storeActive: true
        });
        APP.userProfile.walletBalance -= APP.merchantPrice;
        APP.userProfile.isMerchant = true;
        hideLoader(); showToast('Merchant activated! 🛍️','success'); navigateTo('merchant');
    } catch(e) { hideLoader(); showToast('Failed','error'); }
}

// =====================
// INFLUENCER
// =====================
function showInfluencerApplication() {
    if (APP.userProfile?.influencerStatus==='pending'){showToast('Under review','info');return;}
    if (APP.userProfile?.influencerStatus==='approved'){showToast('Already approved','info');return;}
    if (APP.userProfile?.influencerStatus==='rejected'){showToast('Rejected','error');return;}
    
    showModal(`
        <div style="padding:10px;">
            <h3>🤝 Apply as Influencer</h3>
            <div style="background:#f5f5f5;padding:12px;border-radius:8px;margin:10px 0;font-size:12px;">
                <p>Earn 5% commission · $1/month fee</p>
            </div>
            <label style="display:flex;gap:8px;margin:10px 0;"><input type="checkbox" id="agree-inf"> I agree to terms</label>
            ${(APP.userProfile?.walletBalance||0)>=APP.advertiserPrice?`<button class="btn-gold btn-full" onclick="proceedToInfluencerApplication()">Pay $${APP.advertiserPrice} & Apply</button>`:`<button class="btn-gold btn-full" onclick="hideModal();navigateTo('wallet');">Deposit</button>`}
        </div>
    `);
}

function proceedToInfluencerApplication() {
    if (!document.getElementById('agree-inf')?.checked) { showToast('Agree to terms','error'); return; }
    hideModal(); navigateTo('influencer-apply');
}

// =====================
// SHARED UTILITY FUNCTIONS
// =====================
async function uploadProfilePicture(event) {
    const file = event.target.files[0];
    if (!file || file.size > 5*1024*1024) { showToast(file?'Max 5MB':'No file','error'); return; }
    showLoader();
    try {
        const url = await uploadToCloudinary(file);
        await db.collection('users').doc(APP.userProfile.uid).update({ photoURL: url });
        APP.userProfile.photoURL = url;
        document.getElementById('profile-avatar-img').src = url;
        const h = document.getElementById('header-avatar'); if (h) h.src = url;
        hideLoader(); showToast('Updated!','success');
    } catch(e) { hideLoader(); showToast('Failed','error'); }
}

async function loadSettingsScreen() {
    const c = document.getElementById('settings-content');
    if (!c || !APP.userProfile) return;
    const co = typeof COUNTRIES !== 'undefined' ? Object.entries(COUNTRIES).sort((a,b) => a[1].name.localeCompare(b[1].name)).map(([code, data]) => `<option value="${code}" ${APP.userProfile.country===code?'selected':''}>${data.flag||''} ${data.name}</option>`).join('') : '';
    c.innerHTML = `
        <div style="padding:20px;">
            <h3>👤 Account</h3>
            <div class="input-group"><label>Username</label><input type="text" id="settings-username" class="input-field" value="${APP.userProfile.username||''}"></div>
            <div class="input-group"><label>Display Name</label><input type="text" id="settings-displayname" class="input-field" value="${APP.userProfile.displayName||''}"></div>
            <div class="input-group"><label>Phone</label><div class="phone-input-wrapper"><span class="country-code-display" id="settings-country-code">${COUNTRIES?.[APP.userProfile.country]?.code||'+1'}</span><input type="tel" id="settings-phone" class="input-field phone-input" value="${(APP.userProfile.phoneNumber||'').replace(COUNTRIES?.[APP.userProfile.country]?.code||'+1','')}"></div></div>
            <div class="input-group"><label>Country</label><select id="settings-country" class="input-field" onchange="updateSettingsCountryCode()">${co}</select></div>
            <div class="input-group"><label>New Password</label><input type="password" id="settings-password" class="input-field" placeholder="Leave blank"></div>
            <button class="btn-gold btn-full" style="margin-top:15px;" onclick="saveSettings()">💾 Save</button>
            <h3 style="margin-top:25px;">🎨 Theme</h3>
            <div style="display:flex;gap:8px;"><button class="theme-btn ${APP.userProfile.theme==='light'?'active':''}" onclick="setThemeSetting('light')">☀️ Light</button><button class="theme-btn ${APP.userProfile.theme==='dark'?'active':''}" onclick="setThemeSetting('dark')">🌙 Dark</button></div>
            <h3 style="margin-top:25px;">ℹ️ About</h3><p style="color:#666;">ONESHOPLIFY v${APP.version}</p>
        </div>`;
}

function updateSettingsCountryCode() { const c = document.getElementById('settings-country')?.value; const d = document.getElementById('settings-country-code'); if (d && c && COUNTRIES?.[c]) d.textContent = COUNTRIES[c].code || '+1'; }

async function saveSettings() {
    const u = document.getElementById('settings-username')?.value?.trim()?.toLowerCase();
    const dn = document.getElementById('settings-displayname')?.value?.trim();
    const p = document.getElementById('settings-phone')?.value?.trim();
    const c = document.getElementById('settings-country')?.value;
    const pw = document.getElementById('settings-password')?.value;
    if (u && !/^[a-z0-9]{3,30}$/.test(u)) { showToast('Invalid username','error'); return; }
    showLoader();
    try {
        const up = { updatedAt: firebase.firestore.FieldValue.serverTimestamp() };
        if (u) up.username = u; if (dn) up.displayName = dn;
        if (c && COUNTRIES?.[c]) { up.country = c; up.countryFlag = COUNTRIES[c].flag||''; up.currency = COUNTRIES[c].currency||'USD'; }
        if (p) up.phoneNumber = (COUNTRIES?.[c||APP.userProfile.country]?.code||'+1') + p;
        if (pw && pw.length >= 6) up.password = pw;
        await db.collection('users').doc(APP.userProfile.uid).update(up);
        Object.assign(APP.userProfile, up);
        hideLoader(); showToast('Saved!','success');
    } catch(e) { hideLoader(); showToast('Failed','error'); }
}

function setThemeSetting(t) {
    APP.userProfile.theme = t;
    document.querySelectorAll('.theme-btn').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.theme-btn').forEach(b=>{if(b.textContent.includes(t==='light'?'Light':'Dark'))b.classList.add('active');});
    document.body.classList.toggle('dark-theme',t==='dark');
    db.collection('users').doc(APP.userProfile.uid).update({theme:t}).catch(()=>{});
}

function confirmLogout() {
    showModal(`<h3>Logout</h3><p>Are you sure?</p><div style="display:flex;gap:10px;margin-top:15px;"><button class="btn-outline" style="flex:1;" onclick="hideModal()">Cancel</button><button class="btn-danger" style="flex:1;" onclick="performLogout()">Logout</button></div>`);
}

function performLogout() { hideModal(); logout(); }

console.log('✅ profile.js loaded - Store Ownership vs Merchant vs Dropship all separate');
