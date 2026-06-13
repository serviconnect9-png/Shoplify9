// profile.js - COMPLETE UNCOMPRESSED FINAL VERSION
// ONESHOPLIFY Enterprise - Profile, Settings, Subscriptions, Influencer Application
console.log('✅ profile.js loaded');

// =====================
// LOAD PROFILE SCREEN
// =====================
async function loadProfileScreen() {
    if (!APP.userProfile) {
        return;
    }
    
    const container = document.getElementById('profile-content');
    if (!container) {
        return;
    }
    
    const badges = [];
    if (APP.userProfile.isVerifiedMerchant) {
        badges.push('<span class="verified-badge" title="Verified">✓</span>');
    }
    if (APP.userProfile.isAppVerified) {
        badges.push('<span class="app-verified-badge" title="App Verified">✓</span>');
    }
    if (APP.userProfile.isAmbassador) {
        badges.push('<span class="ambassador-badge" title="Ambassador">👑</span>');
    }
    
    const username = APP.userProfile?.username || '';
    const userId = APP.userProfile?.uid || '';
    const isCustomer = APP.userProfile?.accountType === 'customer';
    
    // Build subscription status HTML
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
                            <div>
                                <strong>📦 ${planName.toUpperCase()} Plan</strong>
                                <p style="font-size:12px;color:#E65100;margin-top:3px;">
                                    ⏰ Expires in <strong>${daysLeft} day${daysLeft > 1 ? 's' : ''}</strong>
                                </p>
                            </div>
                            <button class="btn-small btn-gold" onclick="renewDropshipPlan()">Renew</button>
                        </div>
                    </div>`;
            } else if (daysLeft <= 0) {
                subscriptionHTML += `
                    <div style="background:#FFEBEE;padding:12px;border-radius:8px;margin:10px 0;border-left:4px solid #F44336;">
                        <div style="display:flex;justify-content:space-between;align-items:center;">
                            <div>
                                <strong>📦 Dropship Expired</strong>
                                <p style="font-size:12px;color:#C62828;margin-top:3px;">Your plan has expired</p>
                            </div>
                            <button class="btn-small btn-gold" onclick="renewDropshipPlan()">Renew</button>
                        </div>
                    </div>`;
            } else {
                subscriptionHTML += `
                    <div style="background:#E8F5E9;padding:10px 15px;border-radius:8px;margin:5px 0;font-size:13px;display:flex;justify-content:space-between;align-items:center;">
                        <span>📦 <strong>${planName.toUpperCase()} Plan</strong> - ${daysLeft} days remaining</span>
                        <div>
                            ${daysLeft <= 10 ? `<button class="btn-small btn-outline" onclick="renewDropshipPlan()">Renew</button>` : ''}
                            <button class="btn-small btn-outline" onclick="upgradeDropshipPlan()" style="margin-left:5px;">Upgrade</button>
                        </div>
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
                <img src="${APP.userProfile.photoURL || APP.currentUser?.photoURL || '/app-icon.png'}" 
                     alt="Profile" 
                     class="profile-avatar" 
                     id="profile-avatar-img"
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
                <small style="color:#666;">Shoplify Wallet Username (for transfers):</small>
                <div style="font-size:20px;font-weight:700;color:var(--gold-dark);">@${username}</div>
                <small style="color:#999;font-size:11px;">Share this to receive funds from other users</small>
            </div>
            
            <div style="background:#f5f5f5;padding:12px;border-radius:8px;margin:10px 0;">
                <small style="color:#666;">Your User ID:</small>
                <div class="user-id-display">${userId}</div>
                <small style="color:#999;font-size:11px;">Use for Shoplify Wallet login for withdrawals</small>
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
        showToast('Your application is currently under review', 'info');
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
        showToast('Your influencer account is currently suspended.', 'error');
        return;
    }
    
    showModal(`
        <div style="padding:10px;max-height:70vh;overflow-y:auto;">
            <h3>🤝 Apply as Influencer</h3>
            
            <div style="background:#f5f5f5;padding:15px;border-radius:8px;margin:15px 0;font-size:13px;line-height:1.8;">
                <p><strong>Influencer Terms & Conditions:</strong></p>
                <p>1. Your display name must match your social media accounts</p>
                <p>2. Must not contact dropshippers or merchants without permission</p>
                <p>3. Must deliver promotions as requested by campaign owners</p>
                <p>4. Your credit score is visible to dropshippers</p>
                <p>5. 3 reports from dropshippers = 2-week suspension</p>
                <p>6. 2 suspensions = permanent ban from the platform</p>
                <p>7. You earn 5% commission on every sale through dropshipper campaigns</p>
                <p>8. Verified influencers earn $1 per sale from Shoplify sponsored products</p>
                <p>9. Application fee: $1/month (non-refundable)</p>
                <p>10. Verification takes 2-3 business days after application</p>
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
                <button class="btn-gold btn-full" onclick="proceedToInfluencerApplication()">
                    💳 Pay $${APP.advertiserPrice} & Apply Now
                </button>
            ` : `
                <div style="background:#FFEBEE;padding:12px;border-radius:8px;margin-bottom:10px;">
                    <p style="color:#C62828;font-size:13px;">⚠️ Insufficient balance. You need $${APP.advertiserPrice}.</p>
                </div>
                <button class="btn-gold btn-full" onclick="hideModal();navigateTo('wallet');">
                    💰 Deposit Funds First
                </button>
            `}
            
            <button class="btn-outline btn-full" style="margin-top:8px;" onclick="hideModal()">Cancel</button>
        </div>
    `);
}

function proceedToInfluencerApplication() {
    if (!document.getElementById('agree-influencer-terms')?.checked) {
        showToast('Please agree to the terms and conditions', 'error');
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
    
    if (APP.userProfile?.influencerStatus === 'approved') {
        container.innerHTML = `<div style="text-align:center;padding:40px;"><p style="font-size:50px;">✅</p><h3>Application Approved!</h3><p style="color:#666;">You are now an influencer.</p></div>`;
        return;
    }
    if (APP.userProfile?.influencerStatus === 'rejected') {
        container.innerHTML = `<div style="text-align:center;padding:40px;"><p style="font-size:50px;">❌</p><h3>Application Rejected</h3><p style="color:#666;">You cannot reapply.</p></div>`;
        return;
    }
    if (APP.userProfile?.influencerStatus === 'pending') {
        container.innerHTML = `<div style="text-align:center;padding:40px;"><p style="font-size:50px;">⏳</p><h3>Application In Progress</h3><p style="color:#666;">Verification takes 2-3 days.</p></div>`;
        return;
    }
    
    const savedData = APP.userProfile?.influencerDraft || {};
    
    container.innerHTML = `
        <div style="padding:20px;">
            <h3>🤝 Influencer Application</h3>
            <p style="color:#666;margin-bottom:15px;">Fill in your details for verification</p>
            
            <div class="input-group" style="margin-top:15px;">
                <label>Full Name (must match social media accounts)</label>
                <input type="text" id="inf-name" class="input-field" value="${savedData.name || APP.userProfile.displayName || ''}" placeholder="Your full name">
            </div>
            
            <div class="input-group" style="margin-top:15px;">
                <label>Niche / Category</label>
                <input type="text" id="inf-niche" class="input-field" value="${savedData.niche || ''}" placeholder="e.g. Fashion, Tech, Beauty, Gaming">
            </div>
            
            <div class="input-group" style="margin-top:15px;">
                <label>Bio</label>
                <textarea id="inf-bio" class="input-field" rows="3" placeholder="Tell us about yourself...">${savedData.bio || ''}</textarea>
            </div>
            
            <div class="input-group" style="margin-top:15px;">
                <label>Phone Number for WhatsApp Contact</label>
                <input type="tel" id="inf-phone" class="input-field" value="${savedData.phone || APP.userProfile.phoneNumber || ''}" placeholder="+1234567890">
            </div>
            
            <div class="input-group" style="margin-top:15px;">
                <label>Select Social Media Platforms</label>
                <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:8px;">
                    ${APP.socialPlatforms.map(p => `
                        <div onclick="toggleInfluencerPlatform('${p.id}')" 
                             id="inf-platform-${p.id}"
                             style="padding:12px 16px;border:2px solid ${savedData.platforms?.includes(p.id) ? '#FFD700' : '#e0e0e0'};border-radius:12px;cursor:pointer;text-align:center;background:${savedData.platforms?.includes(p.id) ? '#FFFDE7' : 'white'};min-width:80px;transition:all 0.2s;">
                            <div style="font-size:28px;">${p.icon}</div>
                            <div style="font-size:11px;font-weight:600;margin-top:4px;">${p.name}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="input-group" style="margin-top:15px;">
                <label>Upload Screenshot of Your Social Media Profile</label>
                <input type="file" id="inf-screenshot" class="input-field" accept="image/*" onchange="previewInfluencerScreenshot()">
                <div id="inf-screenshot-preview" style="margin-top:8px;">
                    ${savedData.screenshotUrl ? `<img src="${savedData.screenshotUrl}" style="width:100%;max-height:200px;object-fit:cover;border-radius:8px;">` : ''}
                </div>
            </div>
            
            <button class="btn-gold btn-full" style="margin-top:20px;" onclick="submitInfluencerApplication()">
                📤 Submit Application
            </button>
            
            <button class="btn-outline btn-full" style="margin-top:8px;" onclick="saveInfluencerDraft()">
                💾 Save Draft
            </button>
        </div>
    `;
    
    window._influencerPlatforms = savedData.platforms || [];
}

function toggleInfluencerPlatform(platformId) {
    if (!window._influencerPlatforms) {
        window._influencerPlatforms = [];
    }
    
    const index = window._influencerPlatforms.indexOf(platformId);
    if (index >= 0) {
        window._influencerPlatforms.splice(index, 1);
    } else {
        window._influencerPlatforms.push(platformId);
    }
    
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
    reader.onload = function(e) {
        container.innerHTML = `<img src="${e.target.result}" style="width:100%;max-height:200px;object-fit:cover;border-radius:8px;">`;
    };
    reader.readAsDataURL(file);
}

async function submitInfluencerApplication() {
    const name = document.getElementById('inf-name')?.value?.trim();
    const niche = document.getElementById('inf-niche')?.value?.trim();
    const bio = document.getElementById('inf-bio')?.value?.trim();
    const phone = document.getElementById('inf-phone')?.value?.trim();
    const platforms = window._influencerPlatforms || [];
    
    if (!name) {
        showToast('Please enter your full name', 'error');
        return;
    }
    if (!phone) {
        showToast('Please enter your phone number', 'error');
        return;
    }
    if (platforms.length === 0) {
        showToast('Please select at least one social media platform', 'error');
        return;
    }
    if ((APP.userProfile?.walletBalance || 0) < APP.advertiserPrice) {
        showToast('Insufficient balance. Please deposit funds.', 'error');
        navigateTo('wallet');
        return;
    }
    
    showLoader();
    
    try {
        let screenshotUrl = APP.userProfile?.influencerDraft?.screenshotUrl || '';
        if (window._influencerScreenshot) {
            screenshotUrl = await uploadToCloudinary(window._influencerScreenshot);
        }
        
        await db.collection('users').doc(APP.userProfile.uid).update({
            walletBalance: firebase.firestore.FieldValue.increment(-APP.advertiserPrice),
            influencerStatus: 'pending',
            influencerName: name,
            influencerNiche: niche,
            influencerBio: bio,
            influencerPhone: phone,
            influencerPlatforms: platforms,
            influencerScreenshot: screenshotUrl,
            influencerReports: 0,
            influencerSuspensions: 0,
            influencerVerified: false,
            influencerAppliedAt: firebase.firestore.FieldValue.serverTimestamp(),
            influencerDraft: null
        });
        
        APP.userProfile.walletBalance -= APP.advertiserPrice;
        APP.userProfile.influencerStatus = 'pending';
        APP.userProfile.influencerName = name;
        APP.userProfile.influencerPhone = phone;
        APP.userProfile.influencerPlatforms = platforms;
        
        await db.collection('transactions').add({
            userId: APP.userProfile.uid,
            type: 'subscription',
            amount: APP.advertiserPrice,
            currency: 'USD',
            status: 'completed',
            description: 'Influencer application fee',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        if (typeof createNotification === 'function') {
            await createNotification('admin', 'New Influencer Application', `${name} applied as an influencer.`, '🤝', 'customerservice');
        }
        
        hideLoader();
        showToast('Application submitted successfully! ✅ Verification takes 2-3 days.', 'success');
        navigateTo('profile');
        
    } catch (error) {
        hideLoader();
        console.error('Influencer application error:', error);
        showToast('Failed to submit application. Please try again.', 'error');
    }
}

async function saveInfluencerDraft() {
    const name = document.getElementById('inf-name')?.value?.trim();
    const niche = document.getElementById('inf-niche')?.value?.trim();
    const bio = document.getElementById('inf-bio')?.value?.trim();
    const phone = document.getElementById('inf-phone')?.value?.trim();
    const platforms = window._influencerPlatforms || [];
    
    try {
        await db.collection('users').doc(APP.userProfile.uid).update({
            influencerDraft: {
                name: name,
                niche: niche,
                bio: bio,
                phone: phone,
                platforms: platforms
            }
        });
        showToast('Draft saved! ✅ You can continue later.', 'success');
    } catch (error) {
        console.error('Save draft error:', error);
        showToast('Failed to save draft', 'error');
    }
}

// =====================
// SUBSCRIPTION FUNCTIONS
// =====================
function applyForDropship() {
    const plans = [
        { name: 'Starter', price: APP.dropshipStarter, color: '#4CAF50' },
        { name: 'Growth', price: APP.dropshipGrowth, color: '#2196F3' },
        { name: 'Professional', price: APP.dropshipPro, color: '#9C27B0' },
        { name: 'Elite', price: APP.dropshipElite, color: '#FF9800' }
    ];
    
    showModal(`
        <div style="padding:10px;max-height:70vh;overflow-y:auto;">
            <h3>📦 Choose Your Dropship Plan</h3>
            <p style="color:#666;margin-bottom:15px;">Resell products without holding inventory</p>
            <p style="font-size:13px;color:#666;margin-bottom:15px;">
                Your Balance: <strong>${formatCurrency(APP.userProfile?.walletBalance || 0)}</strong>
            </p>
            ${plans.map(plan => `
                <div class="plan-card" style="border-left:4px solid ${plan.color};margin:10px 0;">
                    <h4>${plan.name}</h4>
                    <div class="plan-price">$${plan.price}<span style="font-size:14px;">/month</span></div>
                    ${(APP.userProfile?.walletBalance || 0) >= plan.price ? `
                        <button class="btn-gold btn-full" onclick="payDropshipSubscription('${plan.name.toLowerCase()}', ${plan.price})">
                            Select ${plan.name} - $${plan.price}/mo
                        </button>
                    ` : `
                        <button class="btn-outline btn-full" disabled style="opacity:0.5;">
                            Need $${plan.price} (Balance: ${formatCurrency(APP.userProfile?.walletBalance || 0)})
                        </button>
                    `}
                </div>
            `).join('')}
            ${(APP.userProfile?.walletBalance || 0) < APP.dropshipStarter ? `
                <button class="btn-gold btn-full" onclick="hideModal();navigateTo('wallet');">
                    💰 Deposit Funds First
                </button>
            ` : ''}
            <button class="btn-outline btn-full" style="margin-top:8px;" onclick="hideModal()">Cancel</button>
        </div>
    `);
}

function applyForMerchant() {
    showModal(`
        <div style="padding:10px;">
            <h3>🏪 Become a Merchant</h3>
            <p style="color:#666;margin:15px 0;">Create your own online store and sell products worldwide!</p>
            <div style="background:#FFF8E1;padding:15px;border-radius:8px;margin-bottom:15px;">
                <p><strong>🏪 Merchant Plan:</strong> $${APP.merchantPrice} (Lifetime Access)</p>
                <p style="font-size:13px;">✅ Create your online store</p>
                <p style="font-size:13px;">✅ Upload unlimited products</p>
                <p style="font-size:13px;">✅ Accept payments via escrow</p>
                <p style="font-size:13px;">✅ One-time payment, lifetime access!</p>
            </div>
            <p style="font-size:13px;color:#666;margin-bottom:15px;">
                Your Balance: <strong>${formatCurrency(APP.userProfile?.walletBalance || 0)}</strong>
            </p>
            ${(APP.userProfile?.walletBalance || 0) >= APP.merchantPrice ? `
                <button class="btn-gold btn-full" onclick="payMerchantSubscription()">
                    💳 Pay $${APP.merchantPrice} - Activate Now
                </button>
            ` : `
                <div style="background:#FFEBEE;padding:12px;border-radius:8px;margin-bottom:10px;">
                    <p style="color:#C62828;font-size:13px;">⚠️ Insufficient balance. You need $${APP.merchantPrice}.</p>
                </div>
                <button class="btn-gold btn-full" onclick="hideModal();navigateTo('wallet');">
                    💰 Deposit Funds First
                </button>
            `}
            <button class="btn-outline btn-full" style="margin-top:8px;" onclick="hideModal()">Cancel</button>
        </div>
    `);
}

async function payDropshipSubscription(plan, price) {
    hideModal();
    
    if ((APP.userProfile?.walletBalance || 0) < price) {
        showToast(`Insufficient balance. Need $${price}.`, 'error');
        navigateTo('wallet');
        return;
    }
    
    showLoader();
    
    try {
        const userId = APP.userProfile.uid;
        const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        
        await db.collection('users').doc(userId).update({
            walletBalance: firebase.firestore.FieldValue.increment(-price),
            dropshipPlan: plan,
            isDropshipper: true,
            dropshipPlanExpiry: firebase.firestore.Timestamp.fromDate(thirtyDaysFromNow),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        APP.userProfile.walletBalance -= price;
        APP.userProfile.dropshipPlan = plan;
        APP.userProfile.isDropshipper = true;
        APP.userProfile.dropshipPlanExpiry = thirtyDaysFromNow;
        
        await db.collection('transactions').add({
            userId: userId,
            type: 'subscription',
            amount: price,
            currency: 'USD',
            status: 'completed',
            description: `Dropship ${plan} plan - 30 days`,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        if (typeof createNotification === 'function') {
            await createNotification(userId, 'Dropship Activated! 📦', `Your ${plan} plan is active! Start importing products.`, '📦', 'dropship');
        }
        
        hideLoader();
        showToast(`Subscribed to ${plan} plan! 🎉`, 'success');
        navigateTo('dropship');
        
    } catch (error) {
        hideLoader();
        console.error('Dropship payment error:', error);
        showToast('Payment failed. Please try again.', 'error');
    }
}

async function payMerchantSubscription() {
    hideModal();
    
    if ((APP.userProfile?.walletBalance || 0) < APP.merchantPrice) {
        showToast(`Insufficient balance. Need $${APP.merchantPrice}.`, 'error');
        navigateTo('wallet');
        return;
    }
    
    showLoader();
    
    try {
        const userId = APP.userProfile.uid;
        
        await db.collection('users').doc(userId).update({
            walletBalance: firebase.firestore.FieldValue.increment(-APP.merchantPrice),
            isMerchant: true,
            merchantSubscription: 'lifetime',
            storeActive: true,
            storeName: `${APP.userProfile.username}'s Store`,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        APP.userProfile.walletBalance -= APP.merchantPrice;
        APP.userProfile.isMerchant = true;
        APP.userProfile.merchantSubscription = 'lifetime';
        APP.userProfile.storeActive = true;
        APP.userProfile.storeName = `${APP.userProfile.username}'s Store`;
        
        await db.collection('transactions').add({
            userId: userId,
            type: 'subscription',
            amount: APP.merchantPrice,
            currency: 'USD',
            status: 'completed',
            description: 'Merchant subscription - Lifetime',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        if (typeof createNotification === 'function') {
            await createNotification(userId, 'Store Activated! 🏪', 'Start adding products to your store!', '🏪', 'merchant');
        }
        
        hideLoader();
        showToast('Merchant access activated! 🏪', 'success');
        navigateTo('merchant');
        
    } catch (error) {
        hideLoader();
        console.error('Merchant payment error:', error);
        showToast('Payment failed. Please try again.', 'error');
    }
}

async function renewDropshipPlan() {
    const prices = {
        starter: APP.dropshipStarter,
        growth: APP.dropshipGrowth,
        pro: APP.dropshipPro,
        elite: APP.dropshipElite
    };
    const plan = APP.userProfile?.dropshipPlan || 'starter';
    const price = prices[plan] || APP.dropshipStarter;
    
    if ((APP.userProfile?.walletBalance || 0) < price) {
        showToast(`Insufficient balance. Need $${price}.`, 'error');
        navigateTo('wallet');
        return;
    }
    
    showLoader();
    
    try {
        const userId = APP.userProfile.uid;
        const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        
        await db.collection('users').doc(userId).update({
            walletBalance: firebase.firestore.FieldValue.increment(-price),
            dropshipPlanExpiry: firebase.firestore.Timestamp.fromDate(thirtyDaysFromNow),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        APP.userProfile.walletBalance -= price;
        APP.userProfile.dropshipPlanExpiry = thirtyDaysFromNow;
        
        await db.collection('transactions').add({
            userId: userId,
            type: 'subscription',
            amount: price,
            currency: 'USD',
            status: 'completed',
            description: `Dropship ${plan} renewal - 30 days`,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        hideLoader();
        showToast(`${plan} plan renewed! 🎉`, 'success');
        loadProfileScreen();
        
    } catch (error) {
        hideLoader();
        console.error('Renewal error:', error);
        showToast('Renewal failed. Please try again.', 'error');
    }
}

function upgradeDropshipPlan() {
    navigateTo('dropship');
}

// =====================
// PROFILE PICTURE UPLOAD
// =====================
async function uploadProfilePicture(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
        showToast('Image too large. Maximum 5MB.', 'error');
        return;
    }
    
    showLoader();
    
    try {
        const imageUrl = await uploadToCloudinary(file);
        
        await db.collection('users').doc(APP.userProfile.uid).update({
            photoURL: imageUrl,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        APP.userProfile.photoURL = imageUrl;
        
        const avatarImg = document.getElementById('profile-avatar-img');
        if (avatarImg) avatarImg.src = imageUrl;
        
        const headerAvatar = document.getElementById('header-avatar');
        if (headerAvatar) headerAvatar.src = imageUrl;
        
        hideLoader();
        showToast('Profile picture updated! 📷', 'success');
        
    } catch (error) {
        hideLoader();
        console.error('Upload error:', error);
        showToast('Failed to upload image. Please try again.', 'error');
    }
}

// =====================
// SETTINGS SCREEN
// =====================
async function loadSettingsScreen() {
    const container = document.getElementById('settings-content');
    if (!container || !APP.userProfile) return;
    
    const countryOptions = typeof COUNTRIES !== 'undefined' ? 
        Object.entries(COUNTRIES).sort((a, b) => a[1].name.localeCompare(b[1].name))
            .map(([code, data]) => `<option value="${code}" ${APP.userProfile.country === code ? 'selected' : ''}>${data.flag || ''} ${data.name}</option>`).join('') : '';
    
    container.innerHTML = `
        <div style="padding:20px;">
            <h3>👤 Account Information</h3>
            
            <div class="input-group" style="margin-top:15px;">
                <label>Username</label>
                <input type="text" id="settings-username" class="input-field" value="${APP.userProfile.username || ''}" placeholder="Username">
                <small style="color:#999;">3-30 characters, lowercase letters/numbers only</small>
            </div>
            
            <div class="input-group" style="margin-top:15px;">
                <label>Display Name</label>
                <input type="text" id="settings-displayname" class="input-field" value="${APP.userProfile.displayName || ''}" placeholder="Display name">
            </div>
            
            <div class="input-group" style="margin-top:15px;">
                <label>Email</label>
                <input type="email" id="settings-email" class="input-field" value="${APP.userProfile.email || ''}" placeholder="Email">
            </div>
            
            <div class="input-group" style="margin-top:15px;">
                <label>Phone Number</label>
                <div class="phone-input-wrapper">
                    <span class="country-code-display" id="settings-country-code">${COUNTRIES?.[APP.userProfile.country]?.code || '+1'}</span>
                    <input type="tel" id="settings-phone" class="input-field phone-input" 
                           value="${(APP.userProfile.phoneNumber || '').replace(COUNTRIES?.[APP.userProfile.country]?.code || '+1', '')}" 
                           placeholder="Phone number">
                </div>
                <small style="color:#f44;">Required for deposits</small>
            </div>
            
            <div class="input-group" style="margin-top:15px;">
                <label>Country</label>
                <select id="settings-country" class="input-field" onchange="updateSettingsCountryCode()">
                    <option value="">Select Country</option>
                    ${countryOptions}
                </select>
            </div>
            
            <div class="input-group" style="margin-top:15px;">
                <label>New Password (leave blank to keep current)</label>
                <input type="password" id="settings-password" class="input-field" placeholder="New password (min 6 characters)">
            </div>
            
            <button class="btn-gold btn-full" style="margin-top:20px;" onclick="saveSettings()">
                💾 Save Changes
            </button>
            
            <div class="settings-section" style="margin-top:25px;">
                <h3>🎨 Appearance</h3>
                <div class="setting-item">
                    <span>Theme</span>
                    <div class="theme-toggle">
                        <button class="theme-btn ${APP.userProfile.theme === 'light' ? 'active' : ''}" 
                                onclick="setThemeSetting('light')">☀️ Light</button>
                        <button class="theme-btn ${APP.userProfile.theme === 'dark' ? 'active' : ''}" 
                                onclick="setThemeSetting('dark')">🌙 Dark</button>
                    </div>
                </div>
                <div class="setting-item">
                    <span>Text Size</span>
                    <div class="text-size-controls">
                        <button class="theme-btn ${APP.userProfile.textSize === 'small' ? 'active' : ''}" 
                                onclick="setTextSizeSetting('small')">S</button>
                        <button class="theme-btn ${APP.userProfile.textSize === 'medium' ? 'active' : ''}" 
                                onclick="setTextSizeSetting('medium')">M</button>
                        <button class="theme-btn ${APP.userProfile.textSize === 'large' ? 'active' : ''}" 
                                onclick="setTextSizeSetting('large')">L</button>
                    </div>
                </div>
            </div>
            
            <div class="settings-section" style="margin-top:25px;">
                <h3>✅ Verification</h3>
                ${APP.userProfile.isAppVerified ? `
                    <div style="background:#E8F5E9;padding:15px;border-radius:8px;text-align:center;">
                        <p style="font-size:30px;">✅</p>
                        <p style="font-weight:600;">You are App Verified</p>
                    </div>
                ` : APP.userProfile.appVerificationApplied ? `
                    <div style="background:#FFF8E1;padding:15px;border-radius:8px;text-align:center;">
                        <p>⏳ Verification in progress...</p>
                        <p style="font-size:12px;color:#666;">Our team is reviewing your application</p>
                    </div>
                ` : `
                    <p style="color:#666;margin-bottom:15px;">
                        Requirements: ${APP.verifyMinSales} sales, ${APP.verifyMinReferrals} referrals, 
                        $${APP.verifyMinEarnings} earned
                    </p>
                    <div class="input-group" style="margin-top:10px;">
                        <label>Full Legal Name</label>
                        <input type="text" id="verify-name" class="input-field" placeholder="Enter your full name">
                    </div>
                    <div class="input-group" style="margin-top:10px;">
                        <label>Date of Birth</label>
                        <input type="date" id="verify-dob" class="input-field">
                    </div>
                    <button class="btn-outline btn-full" style="margin-top:15px;" onclick="applyForVerification()">
                        Apply for Verification
                    </button>
                `}
            </div>
            
            <div class="settings-section" style="margin-top:25px;">
                <h3>ℹ️ About</h3>
                <p style="color:#666;">ONESHOPLIFY Enterprise v${APP.version}</p>
                <p style="color:#666;">Powered by Rev</p>
                <p style="color:#666;font-size:13px;">All transactions protected by escrow</p>
            </div>
        </div>
    `;
}

function updateSettingsCountryCode() {
    const country = document.getElementById('settings-country')?.value;
    const display = document.getElementById('settings-country-code');
    if (display && country && COUNTRIES?.[country]) {
        display.textContent = COUNTRIES[country].code || '+1';
    }
}

async function saveSettings() {
    const username = document.getElementById('settings-username')?.value?.trim()?.toLowerCase();
    const displayName = document.getElementById('settings-displayname')?.value?.trim();
    const email = document.getElementById('settings-email')?.value?.trim();
    const phone = document.getElementById('settings-phone')?.value?.trim();
    const country = document.getElementById('settings-country')?.value;
    const password = document.getElementById('settings-password')?.value;
    
    if (username && !/^[a-z0-9]{3,30}$/.test(username)) {
        showToast('Username: 3-30 characters, lowercase letters/numbers only', 'error');
        return;
    }
    
    if (username && username !== APP.userProfile.username) {
        try {
            const check = await db.collection('users').where('username', '==', username).limit(1).get();
            if (!check.empty) {
                showToast('Username already taken', 'error');
                return;
            }
        } catch (error) {
            showToast('Could not verify username availability', 'error');
            return;
        }
    }
    
    showLoader();
    
    try {
        const updates = { updatedAt: firebase.firestore.FieldValue.serverTimestamp() };
        
        if (username) updates.username = username;
        if (displayName) updates.displayName = displayName;
        if (email) updates.email = email;
        if (country && COUNTRIES?.[country]) {
            updates.country = country;
            updates.countryFlag = COUNTRIES[country].flag || '';
            updates.currency = COUNTRIES[country].currency || 'USD';
            updates.exchangeRate = APP.exchangeRates[(COUNTRIES[country].currency || 'usd').toLowerCase()] || 1;
        }
        if (phone) {
            const code = COUNTRIES?.[country || APP.userProfile.country]?.code || '+1';
            updates.phoneNumber = code + phone;
        }
        if (password && password.length >= 6) {
            updates.password = password;
        }
        
        await db.collection('users').doc(APP.userProfile.uid).update(updates);
        Object.assign(APP.userProfile, updates);
        
        hideLoader();
        showToast('Settings saved successfully! ✅', 'success');
        
    } catch (error) {
        hideLoader();
        console.error('Settings save error:', error);
        showToast('Failed to save settings. Please try again.', 'error');
    }
}

function setThemeSetting(theme) {
    APP.userProfile.theme = theme;
    
    document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.theme-btn').forEach(b => {
        if (b.textContent.includes(theme === 'light' ? 'Light' : 'Dark')) {
            b.classList.add('active');
        }
    });
    
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
    
    db.collection('users').doc(APP.userProfile.uid).update({ theme }).catch(() => {});
}

function setTextSizeSetting(size) {
    APP.userProfile.textSize = size;
    
    document.querySelectorAll('.text-size-controls .theme-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.text-size-controls .theme-btn').forEach(b => {
        if (b.textContent === size.toUpperCase().substring(0, 1)) {
            b.classList.add('active');
        }
    });
    
    const sizes = { small: '14px', medium: '16px', large: '18px' };
    document.body.style.fontSize = sizes[size];
    
    db.collection('users').doc(APP.userProfile.uid).update({ textSize: size }).catch(() => {});
}

async function applyForVerification() {
    const name = document.getElementById('verify-name')?.value?.trim();
    const dob = document.getElementById('verify-dob')?.value;
    
    if (!name || !dob) {
        showToast('Please fill in all fields', 'error');
        return;
    }
    
    const sales = APP.userProfile.totalSales || 0;
    const referrals = APP.userProfile.totalReferrals || 0;
    const earnings = (APP.userProfile.affiliateEarnings || 0) + (APP.userProfile.totalRevenue || 0);
    
    if (sales < APP.verifyMinSales) {
        showToast(`You need ${APP.verifyMinSales} sales (you have ${sales})`, 'error');
        return;
    }
    if (referrals < APP.verifyMinReferrals) {
        showToast(`You need ${APP.verifyMinReferrals} referrals (you have ${referrals})`, 'error');
        return;
    }
    if (earnings < APP.verifyMinEarnings) {
        showToast(`You need $${APP.verifyMinEarnings} earned (you have $${earnings.toFixed(2)})`, 'error');
        return;
    }
    
    try {
        await db.collection('verification_requests').add({
            userId: APP.userProfile.uid,
            name: name,
            dob: dob,
            sales: sales,
            referrals: referrals,
            earnings: earnings,
            status: 'pending',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        await db.collection('users').doc(APP.userProfile.uid).update({
            appVerificationApplied: true
        });
        
        APP.userProfile.appVerificationApplied = true;
        showToast('Verification application submitted! ✅', 'success');
        loadSettingsScreen();
        
    } catch (error) {
        console.error('Verification error:', error);
        showToast('Failed to submit application. Please try again.', 'error');
    }
}

// =====================
// LOGOUT
// =====================
function confirmLogout() {
    showModal(`
        <h3>Logout</h3>
        <p>Are you sure you want to logout?</p>
        <div style="display:flex;gap:10px;margin-top:20px;">
            <button class="btn-outline" style="flex:1;" onclick="hideModal()">Cancel</button>
            <button class="btn-danger" style="flex:1;" onclick="performLogout()">Logout</button>
        </div>
    `);
}

function performLogout() {
    hideModal();
    logout();
}

console.log('✅ profile.js fully loaded - ONESHOPLIFY Profile System Ready');
