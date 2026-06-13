// profile.js - COMPLETE PREMIUM VERSION (All Features, Customer Service, Influencer Application, Wallet Access)

// =====================
// PROFILE SCREEN
// =====================
async function loadProfileScreen() {
    if (!APP.userProfile) return;
    
    const container = document.getElementById('profile-content');
    if (!container) return;
    
    const badges = [];
    if (APP.userProfile.isVerifiedAffiliate || APP.userProfile.isVerifiedMerchant) badges.push('<span class="verified-badge" title="Verified">✓</span>');
    if (APP.userProfile.isAppVerified) badges.push('<span class="app-verified-badge" title="App Verified">✓</span>');
    if (APP.userProfile.isAmbassador) badges.push('<span class="ambassador-badge" title="Ambassador">👑</span>');
    
    const username = APP.userProfile?.username || '';
    const userId = APP.userProfile?.uid || '';
    const isCustomer = APP.userProfile?.accountType === 'customer';
    
    // Build subscription status section
    let subscriptionHTML = '';
    
    // AFFILIATE STATUS
    if (APP.userProfile.isAffiliate) {
        const expiry = APP.userProfile.affiliateSubscriptionExpiry;
        if (expiry) {
            const expiryDate = expiry.toDate ? expiry.toDate() : new Date(expiry);
            const now = new Date();
            const daysLeft = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
            
            if (daysLeft <= 3 && daysLeft > 0) {
                subscriptionHTML += `
                    <div style="background:#FFF3E0;padding:12px;border-radius:8px;margin:10px 0;border-left:4px solid #FF9800;">
                        <div style="display:flex;justify-content:space-between;align-items:center;">
                            <div>
                                <strong>📢 Affiliate Active</strong>
                                <p style="font-size:12px;color:#E65100;margin-top:3px;">⏰ Expires in <strong>${daysLeft} day${daysLeft > 1 ? 's' : ''}</strong></p>
                            </div>
                            <button class="btn-small btn-gold" onclick="renewAffiliateSubscription()">Renew $${APP.affiliatePrice}</button>
                        </div>
                    </div>`;
            } else if (daysLeft <= 0) {
                subscriptionHTML += `
                    <div style="background:#FFEBEE;padding:12px;border-radius:8px;margin:10px 0;border-left:4px solid #F44336;">
                        <div style="display:flex;justify-content:space-between;align-items:center;">
                            <div><strong>📢 Affiliate Expired</strong><p style="font-size:12px;color:#C62828;">Expired</p></div>
                            <button class="btn-small btn-gold" onclick="renewAffiliateSubscription()">Renew $${APP.affiliatePrice}</button>
                        </div>
                    </div>`;
            } else {
                subscriptionHTML += `<div style="background:#E8F5E9;padding:10px 15px;border-radius:8px;margin:5px 0;font-size:13px;display:flex;justify-content:space-between;"><span>📢 <strong>Affiliate</strong> - ${daysLeft} days</span>${daysLeft<=10?`<button class="btn-small btn-outline" onclick="renewAffiliateSubscription()">Renew</button>`:''}</div>`;
            }
        }
    } else {
        subscriptionHTML += `<button class="menu-item" onclick="applyForAffiliate()"><span class="menu-icon">📢</span> Become an Affiliate<span style="margin-left:auto;color:var(--gold-dark);">$${APP.affiliatePrice}/mo</span><span class="menu-arrow">›</span></button>`;
    }
    
    // MERCHANT STATUS
    if (APP.userProfile.isMerchant) {
        subscriptionHTML += `<div style="background:#E8F5E9;padding:10px 15px;border-radius:8px;margin:5px 0;font-size:13px;">🏪 <strong>Merchant Active</strong> - ${APP.userProfile.merchantSubscription==='lifetime'?'Lifetime':'Active'}</div>`;
    } else {
        subscriptionHTML += `<button class="menu-item" onclick="applyForMerchant()"><span class="menu-icon">🏪</span> Become a Merchant<span style="margin-left:auto;color:var(--gold-dark);">$${APP.merchantPrice} lifetime</span><span class="menu-arrow">›</span></button>`;
    }
    
    // DROPSHIP STATUS
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
                            <div><strong>📦 ${planName.toUpperCase()}</strong><p style="font-size:12px;color:#E65100;">⏰ ${daysLeft} day${daysLeft>1?'s':''} left</p></div>
                            <button class="btn-small btn-gold" onclick="renewDropshipPlan()">Renew</button>
                        </div>
                    </div>`;
            } else if (daysLeft <= 0) {
                subscriptionHTML += `
                    <div style="background:#FFEBEE;padding:12px;border-radius:8px;margin:10px 0;border-left:4px solid #F44336;">
                        <div><strong>📦 Dropship Expired</strong></div>
                        <button class="btn-small btn-gold" onclick="renewDropshipPlan()">Renew</button>
                    </div>`;
            } else {
                subscriptionHTML += `<div style="background:#E8F5E9;padding:10px 15px;border-radius:8px;margin:5px 0;font-size:13px;display:flex;justify-content:space-between;"><span>📦 <strong>${planName.toUpperCase()}</strong> - ${daysLeft} days</span><div>${daysLeft<=10?`<button class="btn-small btn-outline" onclick="renewDropshipPlan()">Renew</button>`:''}<button class="btn-small btn-outline" onclick="upgradeDropshipPlan()" style="margin-left:5px;">Upgrade</button></div></div>`;
            }
        }
    } else {
        subscriptionHTML += `<button class="menu-item" onclick="applyForDropship()"><span class="menu-icon">📦</span> Become a Dropshipper<span style="margin-left:auto;color:var(--gold-dark);">From $${APP.dropshipStarter}/mo</span><span class="menu-arrow">›</span></button>`;
    }
    
    // INFLUENCER STATUS
    if (APP.userProfile.influencerStatus === 'approved') {
        subscriptionHTML += `<div style="background:#E8F5E9;padding:10px 15px;border-radius:8px;margin:5px 0;font-size:13px;">🤝 <strong>Influencer Active</strong>${APP.userProfile.influencerVerified?' ✓ Verified':''}</div>`;
    } else if (APP.userProfile.influencerStatus === 'pending') {
        subscriptionHTML += `<div style="background:#FFF8E1;padding:10px 15px;border-radius:8px;margin:5px 0;font-size:13px;">🤝 <strong>Influencer Application Pending</strong></div>`;
    } else if (APP.userProfile.influencerStatus === 'suspended') {
        subscriptionHTML += `<div style="background:#FFEBEE;padding:10px 15px;border-radius:8px;margin:5px 0;font-size:13px;">🤝 <strong>Influencer Suspended</strong></div>`;
    } else if (!APP.userProfile.influencerStatus || APP.userProfile.influencerStatus === 'none') {
        subscriptionHTML += `<button class="menu-item" onclick="applyForInfluencer()"><span class="menu-icon">🤝</span> Apply as Influencer<span class="menu-arrow">›</span></button>`;
    }
    
    container.innerHTML = `
        <div class="profile-header-card">
            <div style="position:relative;display:inline-block;cursor:pointer;" onclick="document.getElementById('profile-pic-upload').click()">
                <img src="${APP.userProfile.photoURL || APP.currentUser?.photoURL || '/app-icon.png'}" 
                     alt="Profile" class="profile-avatar" id="profile-avatar-img"
                     onerror="this.src='/app-icon.png'">
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
            <button class="menu-item" onclick="navigateTo('settings')">
                <span class="menu-icon">⚙️</span> Settings
                <span class="menu-arrow">›</span>
            </button>
            
            <button class="menu-item" onclick="navigateTo('orders')">
                <span class="menu-icon">📦</span> My Orders
                <span class="menu-arrow">›</span>
            </button>
            
            <button class="menu-item" onclick="navigateTo('wallet')">
                <span class="menu-icon">💰</span> Wallet
                <span class="menu-arrow">›</span>
            </button>
            
            <button class="menu-item" onclick="navigateTo('customerservice')">
                <span class="menu-icon">🎧</span> Customer Service
                <span class="menu-arrow">›</span>
            </button>
            
            ${APP.userProfile.isAffiliate ? `
                <button class="menu-item" onclick="navigateTo('affiliate')">
                    <span class="menu-icon">📢</span> Affiliate Dashboard
                    <span class="menu-arrow">›</span>
                </button>
            ` : ''}
            
            ${APP.userProfile.isMerchant ? `
                <button class="menu-item" onclick="navigateTo('merchant')">
                    <span class="menu-icon">🏪</span> Merchant Dashboard
                    <span class="menu-arrow">›</span>
                </button>
            ` : ''}
            
            ${APP.userProfile.isDropshipper ? `
                <button class="menu-item" onclick="navigateTo('dropship')">
                    <span class="menu-icon">📦</span> Dropship Dashboard
                    <span class="menu-arrow">›</span>
                </button>
            ` : ''}
            
            ${APP.userProfile.influencerStatus === 'approved' ? `
                <button class="menu-item" onclick="navigateTo('influencer-dashboard')">
                    <span class="menu-icon">📊</span> Influencer Dashboard
                    <span class="menu-arrow">›</span>
                </button>
            ` : ''}
            
            ${!isCustomer ? `
                <button class="menu-item" onclick="navigateTo('leaderboard')">
                    <span class="menu-icon">🏆</span> Leaderboard
                    <span class="menu-arrow">›</span>
                </button>
                <button class="menu-item" onclick="navigateTo('hall-of-fame')">
                    <span class="menu-icon">🌟</span> Hall of Fame
                    <span class="menu-arrow">›</span>
                </button>
            ` : ''}
            
            <div style="background:#f5f5f5;padding:12px;border-radius:8px;margin:10px 0;">
                <small style="color:#666;">Shoplify Wallet Username:</small>
                <div style="font-size:20px;font-weight:700;color:var(--gold-dark);">@${username}</div>
                <small style="color:#999;font-size:11px;">Share this to receive transfers</small>
            </div>
            
            <div style="background:#f5f5f5;padding:12px;border-radius:8px;margin:10px 0;">
                <small style="color:#666;">Your User ID:</small>
                <div class="user-id-display">${userId}</div>
                <small style="color:#999;font-size:11px;">Use for Shoplify Wallet login</small>
            </div>
            
            <button class="menu-item" style="color:var(--red);" onclick="confirmLogout()">
                <span class="menu-icon">🚪</span> Logout
                <span class="menu-arrow">›</span>
            </button>
        </div>
    `;
}

// =====================
// INFLUENCER APPLICATION
// =====================
async function applyForInfluencer() {
    if (APP.userProfile?.influencerStatus === 'pending') {
        showToast('Your application is under review', 'info');
        return;
    }
    if (APP.userProfile?.influencerStatus === 'approved') {
        showToast('You are already an approved influencer', 'info');
        return;
    }
    if (APP.userProfile?.influencerStatus === 'rejected') {
        showToast('Your application was rejected. You cannot reapply.', 'error');
        return;
    }
    if (APP.userProfile?.influencerStatus === 'suspended') {
        showToast('Your influencer account is suspended.', 'error');
        return;
    }
    
    // Show terms and payment
    showModal(`
        <div style="padding:10px;max-height:70vh;overflow-y:auto;">
            <h3>🤝 Apply as Influencer</h3>
            
            <div style="background:#f5f5f5;padding:15px;border-radius:8px;margin:15px 0;font-size:13px;line-height:1.8;">
                <p><strong>Influencer Terms:</strong></p>
                <p>1. Your display name must match your social media accounts</p>
                <p>2. Must not contact affiliates or dropshippers without permission</p>
                <p>3. Must deliver promotions as requested</p>
                <p>4. Your credit score is visible to dropshippers</p>
                <p>5. 3 reports from dropshippers = 2-week suspension</p>
                <p>6. 2 suspensions = permanent ban</p>
                <p>7. You earn 5% commission on every sale through dropshipper campaigns</p>
                <p>8. Verified influencers earn $1 per sale from Shoplify sponsored products</p>
                <p>9. Application fee: $1/month (non-refundable)</p>
                <p>10. Verification takes 2-3 business days</p>
            </div>
            
            <label style="display:flex;align-items:center;gap:8px;cursor:pointer;margin-bottom:15px;">
                <input type="checkbox" id="agree-influencer-terms" style="width:18px;height:18px;">
                <span style="font-size:14px;">I agree to the terms and conditions</span>
            </label>
            
            <p style="font-size:13px;color:#666;margin-bottom:15px;">
                Application Fee: <strong>$${APP.advertiserPrice}/month</strong><br>
                Your Balance: <strong>${formatCurrency(APP.userProfile?.walletBalance || 0)}</strong>
            </p>
            
            ${(APP.userProfile?.walletBalance || 0) >= APP.advertiserPrice ? `
                <button class="btn-gold btn-full" onclick="proceedToInfluencerApplication()">💳 Pay $${APP.advertiserPrice} & Apply</button>
            ` : `
                <div style="background:#FFEBEE;padding:12px;border-radius:8px;margin-bottom:10px;">
                    <p style="color:#C62828;font-size:13px;">⚠️ Insufficient balance. You need $${APP.advertiserPrice}.</p>
                </div>
                <button class="btn-gold btn-full" onclick="hideModal();navigateTo('wallet');">💰 Deposit First</button>
            `}
            
            <button class="btn-outline btn-full" style="margin-top:8px;" onclick="hideModal()">Cancel</button>
        </div>
    `);
}

function proceedToInfluencerApplication() {
    if (!document.getElementById('agree-influencer-terms')?.checked) {
        showToast('Please agree to the terms', 'error');
        return;
    }
    hideModal();
    navigateTo('influencer-apply');
}

// =====================
// INFLUENCER APPLICATION FORM
// =====================
function loadInfluencerApplication() {
    const container = document.getElementById('influencer-apply-content');
    if (!container) return;
    
    // Check status
    if (APP.userProfile?.influencerStatus === 'approved') {
        container.innerHTML = `<div style="text-align:center;padding:40px;"><p style="font-size:50px;">✅</p><h3>Approved!</h3></div>`;
        return;
    }
    if (APP.userProfile?.influencerStatus === 'rejected') {
        container.innerHTML = `<div style="text-align:center;padding:40px;"><p style="font-size:50px;">❌</p><h3>Rejected</h3><p style="color:#666;">Cannot reapply</p></div>`;
        return;
    }
    
    const savedData = APP.userProfile?.influencerDraft || {};
    
    container.innerHTML = `
        <div style="padding:20px;">
            <h3>🤝 Influencer Application</h3>
            <p style="color:#666;margin-bottom:15px;">Fill in your details</p>
            
            <div class="input-group"><label>Full Name (must match social media)</label><input type="text" id="inf-name" class="input-field" value="${savedData.name || APP.userProfile.displayName || ''}"></div>
            <div class="input-group"><label>Niche/Category</label><input type="text" id="inf-niche" class="input-field" value="${savedData.niche || ''}" placeholder="e.g. Fashion, Tech, Beauty"></div>
            <div class="input-group"><label>Bio</label><textarea id="inf-bio" class="input-field" rows="3">${savedData.bio || ''}</textarea></div>
            <div class="input-group"><label>Phone for WhatsApp Contact</label><input type="tel" id="inf-phone" class="input-field" value="${savedData.phone || APP.userProfile.phoneNumber || ''}"></div>
            
            <div class="input-group"><label>Select Social Media Platforms</label>
                <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:8px;">
                    ${APP.socialPlatforms.map(p => `
                        <div onclick="toggleInfluencerPlatform('${p.id}')" id="inf-platform-${p.id}"
                             style="padding:12px 16px;border:2px solid ${savedData.platforms?.includes(p.id)?'#FFD700':'#e0e0e0'};border-radius:12px;cursor:pointer;text-align:center;background:${savedData.platforms?.includes(p.id)?'#FFFDE7':'white'};min-width:80px;">
                            <div style="font-size:28px;">${p.icon}</div>
                            <div style="font-size:11px;font-weight:600;">${p.name}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="input-group"><label>Upload Screenshot of Social Media Profile</label><input type="file" id="inf-screenshot" class="input-field" accept="image/*" onchange="previewInfluencerScreenshot()"><div id="inf-screenshot-preview" style="margin-top:8px;">${savedData.screenshotUrl?`<img src="${savedData.screenshotUrl}" style="width:100%;max-height:200px;object-fit:cover;border-radius:8px;">`:''}</div></div>
            
            <button class="btn-gold btn-full" onclick="submitInfluencerApplication()">Submit Application</button>
            <button class="btn-outline btn-full" style="margin-top:8px;" onclick="saveInfluencerDraft()">💾 Save Draft</button>
        </div>
    `;
    
    window._influencerPlatforms = savedData.platforms || [];
}

function toggleInfluencerPlatform(platformId) {
    if (!window._influencerPlatforms) window._influencerPlatforms = [];
    const index = window._influencerPlatforms.indexOf(platformId);
    if (index >= 0) { window._influencerPlatforms.splice(index, 1); }
    else { window._influencerPlatforms.push(platformId); }
    
    const el = document.getElementById('inf-platform-' + platformId);
    if (el) {
        const isSelected = window._influencerPlatforms.includes(platformId);
        el.style.borderColor = isSelected ? '#FFD700' : '#e0e0e0';
        el.style.background = isSelected ? '#FFFDE7' : 'white';
    }
}

function previewInfluencerScreenshot() {
    const file = document.getElementById('inf-screenshot')?.files?.[0];
    const container = document.getElementById('inf-screenshot-preview');
    if (!container || !file) return;
    window._influencerScreenshot = file;
    const reader = new FileReader();
    reader.onload = e => { container.innerHTML = `<img src="${e.target.result}" style="width:100%;max-height:200px;object-fit:cover;border-radius:8px;">`; };
    reader.readAsDataURL(file);
}

async function submitInfluencerApplication() {
    const name = document.getElementById('inf-name')?.value?.trim();
    const niche = document.getElementById('inf-niche')?.value?.trim();
    const bio = document.getElementById('inf-bio')?.value?.trim();
    const phone = document.getElementById('inf-phone')?.value?.trim();
    const platforms = window._influencerPlatforms || [];
    
    if (!name) { showToast('Enter your full name', 'error'); return; }
    if (!phone) { showToast('Enter phone number', 'error'); return; }
    if (platforms.length === 0) { showToast('Select at least one platform', 'error'); return; }
    if ((APP.userProfile?.walletBalance || 0) < APP.advertiserPrice) { showToast('Insufficient balance', 'error'); navigateTo('wallet'); return; }
    
    showLoader();
    try {
        let screenshotUrl = APP.userProfile?.influencerDraft?.screenshotUrl || '';
        if (window._influencerScreenshot) { screenshotUrl = await uploadToCloudinary(window._influencerScreenshot); }
        
        await db.collection('users').doc(APP.userProfile.uid).update({
            walletBalance: firebase.firestore.FieldValue.increment(-APP.advertiserPrice),
            influencerStatus: 'pending',
            influencerName: name, influencerNiche: niche, influencerBio: bio,
            influencerPhone: phone, influencerPlatforms: platforms,
            influencerScreenshot: screenshotUrl,
            influencerReports: 0, influencerSuspensions: 0,
            influencerAppliedAt: firebase.firestore.FieldValue.serverTimestamp(),
            influencerDraft: null
        });
        
        APP.userProfile.walletBalance -= APP.advertiserPrice;
        APP.userProfile.influencerStatus = 'pending';
        
        await db.collection('transactions').add({
            userId: APP.userProfile.uid, type: 'subscription', amount: APP.advertiserPrice,
            currency: 'USD', status: 'completed', description: 'Influencer application',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        if (typeof createNotification === 'function') {
            await createNotification('admin', 'New Influencer Application', `${name} applied as influencer.`, '🤝', 'customerservice');
        }
        
        hideLoader();
        showToast('Application submitted! Review takes 2-3 days. ✅', 'success');
        navigateTo('profile');
    } catch (e) { hideLoader(); showToast('Failed', 'error'); }
}

async function saveInfluencerDraft() {
    const name = document.getElementById('inf-name')?.value?.trim();
    const niche = document.getElementById('inf-niche')?.value?.trim();
    const bio = document.getElementById('inf-bio')?.value?.trim();
    const phone = document.getElementById('inf-phone')?.value?.trim();
    const platforms = window._influencerPlatforms || [];
    try {
        await db.collection('users').doc(APP.userProfile.uid).update({
            influencerDraft: { name, niche, bio, phone, platforms }
        });
        showToast('Draft saved! ✅', 'success');
    } catch (e) { showToast('Failed', 'error'); }
}

// =====================
// SUBSCRIPTION FUNCTIONS
// =====================
function applyForAffiliate() {
    showModal(`
        <div style="padding:10px;"><h3>📢 Become an Affiliate</h3>
        <p style="color:#666;margin:15px 0;">Earn 4-5% commission on every sale!</p>
        <div style="background:#FFF8E1;padding:15px;border-radius:8px;margin-bottom:15px;">
            <p><strong>$${APP.affiliatePrice}/month</strong></p>
            <p style="font-size:13px;">• Promote products • Earn commissions</p>
        </div>
        <p>Balance: <strong>${formatCurrency(APP.userProfile?.walletBalance||0)}</strong></p>
        ${(APP.userProfile?.walletBalance||0)>=APP.affiliatePrice?`<button class="btn-gold btn-full" onclick="payAffiliateSubscription()">Pay $${APP.affiliatePrice}</button>`:`<p style="color:#f44;">Insufficient balance</p><button class="btn-gold btn-full" onclick="hideModal();navigateTo('wallet');">Deposit</button>`}
        <button class="btn-outline btn-full" style="margin-top:8px;" onclick="hideModal()">Cancel</button></div>`);
}

function applyForMerchant() {
    showModal(`
        <div style="padding:10px;"><h3>🏪 Become a Merchant</h3>
        <p style="color:#666;margin:15px 0;">Create your store and sell worldwide!</p>
        <div style="background:#FFF8E1;padding:15px;border-radius:8px;margin-bottom:15px;">
            <p><strong>$${APP.merchantPrice} Lifetime</strong></p>
            <p style="font-size:13px;">• Online store • Unlimited products</p>
        </div>
        <p>Balance: <strong>${formatCurrency(APP.userProfile?.walletBalance||0)}</strong></p>
        ${(APP.userProfile?.walletBalance||0)>=APP.merchantPrice?`<button class="btn-gold btn-full" onclick="payMerchantSubscription()">Pay $${APP.merchantPrice}</button>`:`<p style="color:#f44;">Insufficient balance</p><button class="btn-gold btn-full" onclick="hideModal();navigateTo('wallet');">Deposit</button>`}
        <button class="btn-outline btn-full" style="margin-top:8px;" onclick="hideModal()">Cancel</button></div>`);
}

function applyForDropship() {
    const plans = [{name:'Starter',price:APP.dropshipStarter,color:'#4CAF50'},{name:'Growth',price:APP.dropshipGrowth,color:'#2196F3'},{name:'Professional',price:APP.dropshipPro,color:'#9C27B0'},{name:'Elite',price:APP.dropshipElite,color:'#FF9800'}];
    showModal(`
        <div style="padding:10px;max-height:70vh;overflow-y:auto;"><h3>📦 Choose Plan</h3>
        <p>Balance: <strong>${formatCurrency(APP.userProfile?.walletBalance||0)}</strong></p>
        ${plans.map(p=>`<div class="plan-card" style="border-left:4px solid ${p.color};margin:10px 0;"><h4>${p.name}</h4><div class="plan-price">$${p.price}/mo</div>${(APP.userProfile?.walletBalance||0)>=p.price?`<button class="btn-gold btn-full" onclick="payDropshipSubscription('${p.name.toLowerCase()}',${p.price})">Select</button>`:`<button class="btn-outline btn-full" disabled>Need $${p.price}</button>`}</div>`).join('')}
        <button class="btn-outline btn-full" onclick="hideModal()">Cancel</button></div>`);
}

async function payAffiliateSubscription() {
    hideModal();
    if((APP.userProfile?.walletBalance||0)<APP.affiliatePrice){showToast('Insufficient balance','error');navigateTo('wallet');return;}
    showLoader();
    try {
        const d=new Date(Date.now()+30*24*60*60*1000);
        await db.collection('users').doc(APP.userProfile.uid).update({walletBalance:firebase.firestore.FieldValue.increment(-APP.affiliatePrice),isAffiliate:true,affiliateSubscription:true,affiliateSubscriptionExpiry:firebase.firestore.Timestamp.fromDate(d)});
        APP.userProfile.walletBalance-=APP.affiliatePrice;APP.userProfile.isAffiliate=true;APP.userProfile.affiliateSubscription=true;
        await db.collection('transactions').add({userId:APP.userProfile.uid,type:'subscription',amount:APP.affiliatePrice,currency:'USD',status:'completed',createdAt:firebase.firestore.FieldValue.serverTimestamp()});
        hideLoader();showToast('Affiliate activated! 🎉','success');navigateTo('affiliate');
    }catch(e){hideLoader();showToast('Failed','error');}
}

async function payMerchantSubscription() {
    hideModal();
    if((APP.userProfile?.walletBalance||0)<APP.merchantPrice){showToast('Insufficient balance','error');navigateTo('wallet');return;}
    showLoader();
    try {
        await db.collection('users').doc(APP.userProfile.uid).update({walletBalance:firebase.firestore.FieldValue.increment(-APP.merchantPrice),isMerchant:true,merchantSubscription:'lifetime',storeActive:true,storeName:`${APP.userProfile.username}'s Store`});
        APP.userProfile.walletBalance-=APP.merchantPrice;APP.userProfile.isMerchant=true;
        await db.collection('transactions').add({userId:APP.userProfile.uid,type:'subscription',amount:APP.merchantPrice,currency:'USD',status:'completed',createdAt:firebase.firestore.FieldValue.serverTimestamp()});
        hideLoader();showToast('Merchant activated! 🏪','success');navigateTo('merchant');
    }catch(e){hideLoader();showToast('Failed','error');}
}

async function payDropshipSubscription(plan,price) {
    hideModal();
    if((APP.userProfile?.walletBalance||0)<price){showToast('Insufficient balance','error');navigateTo('wallet');return;}
    showLoader();
    try {
        const d=new Date(Date.now()+30*24*60*60*1000);
        await db.collection('users').doc(APP.userProfile.uid).update({walletBalance:firebase.firestore.FieldValue.increment(-price),dropshipPlan:plan,isDropshipper:true,dropshipPlanExpiry:firebase.firestore.Timestamp.fromDate(d)});
        APP.userProfile.walletBalance-=price;APP.userProfile.dropshipPlan=plan;APP.userProfile.isDropshipper=true;
        await db.collection('transactions').add({userId:APP.userProfile.uid,type:'subscription',amount:price,currency:'USD',status:'completed',createdAt:firebase.firestore.FieldValue.serverTimestamp()});
        hideLoader();showToast(`Subscribed to ${plan}! 🎉`,'success');navigateTo('dropship');
    }catch(e){hideLoader();showToast('Failed','error');}
}

async function renewAffiliateSubscription() {
    if((APP.userProfile?.walletBalance||0)<APP.affiliatePrice){showToast('Insufficient balance','error');navigateTo('wallet');return;}
    showLoader();
    try {
        const d=new Date(Date.now()+30*24*60*60*1000);
        await db.collection('users').doc(APP.userProfile.uid).update({walletBalance:firebase.firestore.FieldValue.increment(-APP.affiliatePrice),affiliateSubscriptionExpiry:firebase.firestore.Timestamp.fromDate(d)});
        APP.userProfile.walletBalance-=APP.affiliatePrice;
        hideLoader();showToast('Renewed! 🎉','success');loadProfileScreen();
    }catch(e){hideLoader();showToast('Failed','error');}
}

async function renewDropshipPlan() {
    const prices={starter:APP.dropshipStarter,growth:APP.dropshipGrowth,pro:APP.dropshipPro,elite:APP.dropshipElite};
    const price=prices[APP.userProfile?.dropshipPlan]||APP.dropshipStarter;
    if((APP.userProfile?.walletBalance||0)<price){showToast('Insufficient balance','error');navigateTo('wallet');return;}
    showLoader();
    try {
        const d=new Date(Date.now()+30*24*60*60*1000);
        await db.collection('users').doc(APP.userProfile.uid).update({walletBalance:firebase.firestore.FieldValue.increment(-price),dropshipPlanExpiry:firebase.firestore.Timestamp.fromDate(d)});
        APP.userProfile.walletBalance-=price;
        hideLoader();showToast('Renewed! 🎉','success');loadProfileScreen();
    }catch(e){hideLoader();showToast('Failed','error');}
}

function upgradeDropshipPlan(){navigateTo('dropship');}

// =====================
// PROFILE PICTURE UPLOAD
// =====================
async function uploadProfilePicture(event) {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 5*1024*1024) { showToast('Max 5MB', 'error'); return; }
    showLoader();
    try {
        const url = await uploadToCloudinary(file);
        await db.collection('users').doc(APP.userProfile.uid).update({ photoURL: url });
        APP.userProfile.photoURL = url;
        document.getElementById('profile-avatar-img').src = url;
        const hdr = document.getElementById('header-avatar'); if (hdr) hdr.src = url;
        hideLoader(); showToast('Updated! 📷', 'success');
    } catch (e) { hideLoader(); showToast('Failed', 'error'); }
}

// =====================
// SETTINGS SCREEN
// =====================
async function loadSettingsScreen() {
    const container = document.getElementById('settings-content');
    if (!container || !APP.userProfile) return;
    
    const countryOptions = typeof COUNTRIES !== 'undefined' ? 
        Object.entries(COUNTRIES).sort((a,b) => a[1].name.localeCompare(b[1].name))
            .map(([code, data]) => `<option value="${code}" ${APP.userProfile.country===code?'selected':''}>${data.flag||''} ${data.name}</option>`).join('') : '';
    
    container.innerHTML = `
        <div style="padding:20px;">
            <h3>👤 Account</h3>
            <div class="input-group"><label>Username</label><input type="text" id="settings-username" class="input-field" value="${APP.userProfile.username||''}"></div>
            <div class="input-group"><label>Display Name</label><input type="text" id="settings-displayname" class="input-field" value="${APP.userProfile.displayName||''}"></div>
            <div class="input-group"><label>Phone</label><div class="phone-input-wrapper"><span class="country-code-display" id="settings-country-code">${COUNTRIES?.[APP.userProfile.country]?.code||'+1'}</span><input type="tel" id="settings-phone" class="input-field phone-input" value="${(APP.userProfile.phoneNumber||'').replace(COUNTRIES?.[APP.userProfile.country]?.code||'+1','')}"></div></div>
            <div class="input-group"><label>Country</label><select id="settings-country" class="input-field" onchange="updateSettingsCountryCode()">${countryOptions}</select></div>
            <div class="input-group"><label>New Password</label><input type="password" id="settings-password" class="input-field" placeholder="Leave blank"></div>
            <button class="btn-gold btn-full" style="margin-top:15px;" onclick="saveSettings()">💾 Save</button>
            
            <h3 style="margin-top:25px;">🎨 Appearance</h3>
            <div class="setting-item"><span>Theme</span><div><button class="theme-btn ${APP.userProfile.theme==='light'?'active':''}" onclick="setThemeSetting('light')">☀️</button><button class="theme-btn ${APP.userProfile.theme==='dark'?'active':''}" onclick="setThemeSetting('dark')">🌙</button></div></div>
            
            <h3 style="margin-top:25px;">ℹ️ About</h3>
            <p style="color:#666;">ONESHOPLIFY Enterprise v${APP.version}</p>
        </div>`;
}

function updateSettingsCountryCode() {
    const c = document.getElementById('settings-country')?.value;
    const d = document.getElementById('settings-country-code');
    if (d && c && COUNTRIES?.[c]) d.textContent = COUNTRIES[c].code || '+1';
}

async function saveSettings() {
    const username = document.getElementById('settings-username')?.value?.trim()?.toLowerCase();
    const displayName = document.getElementById('settings-displayname')?.value?.trim();
    const phone = document.getElementById('settings-phone')?.value?.trim();
    const country = document.getElementById('settings-country')?.value;
    const password = document.getElementById('settings-password')?.value;
    if (username && !/^[a-z0-9]{3,30}$/.test(username)) { showToast('Invalid username', 'error'); return; }
    showLoader();
    try {
        const updates = { updatedAt: firebase.firestore.FieldValue.serverTimestamp() };
        if (username) updates.username = username;
        if (displayName) updates.displayName = displayName;
        if (country && COUNTRIES?.[country]) { updates.country = country; updates.countryFlag = COUNTRIES[country].flag; updates.currency = COUNTRIES[country].currency || 'USD'; }
        if (phone) updates.phoneNumber = (COUNTRIES?.[country||APP.userProfile.country]?.code||'+1') + phone;
        if (password && password.length >= 6) updates.password = password;
        await db.collection('users').doc(APP.userProfile.uid).update(updates);
        Object.assign(APP.userProfile, updates);
        hideLoader(); showToast('Saved! ✅', 'success');
    } catch (e) { hideLoader(); showToast('Failed', 'error'); }
}

function setThemeSetting(theme) {
    APP.userProfile.theme = theme;
    document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.theme-btn').forEach(b => { if (b.textContent.includes(theme==='light'?'☀️':'🌙')) b.classList.add('active'); });
    document.body.classList.toggle('dark-theme', theme === 'dark');
    db.collection('users').doc(APP.userProfile.uid).update({ theme }).catch(() => {});
}

function confirmLogout() {
    showModal(`<h3>Logout</h3><p>Are you sure?</p><div style="display:flex;gap:10px;margin-top:15px;"><button class="btn-outline" style="flex:1;" onclick="hideModal()">Cancel</button><button class="btn-danger" style="flex:1;" onclick="performLogout()">Logout</button></div>`);
}

function performLogout() { hideModal(); logout(); }

console.log('✅ profile.js loaded - ONESHOPLIFY Premium Profile Ready');
