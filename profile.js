// profile.js - COMPLETE FINAL VERSION (Clear Store Setup Button with Image)
// ONESHOPLIFY Enterprise - Profile, Settings, Store Ownership, Dropship, Influencer
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
        badges.push('<span class="verified-badge" title="Verified Merchant">✓</span>');
    }
    if (APP.userProfile.isAppVerified) {
        badges.push('<span class="app-verified-badge" title="App Verified">✓</span>');
    }
    if (APP.userProfile.isAmbassador) {
        badges.push('<span class="ambassador-badge" title="Ambassador">👑</span>');
    }
    if (APP.userProfile.dropshipVerified) {
        badges.push('<span class="verified-badge" title="Verified Dropshipper" style="background:#20D5EC;">✓</span>');
    }
    
    const username = APP.userProfile?.username || '';
    const userId = APP.userProfile?.uid || '';
    const isCustomer = APP.userProfile?.accountType === 'customer';
    
    // Build subscription status HTML
    let subscriptionHTML = '';
    
    // =====================
    // STORE OWNERSHIP - BIG BANNER
    // =====================
    if (APP.userProfile.hasStore) {
        const storeExpiry = APP.userProfile.storeExpiry;
        let storeStatusHTML = '';
        
        if (storeExpiry) {
            const expiryDate = storeExpiry.toDate ? storeExpiry.toDate() : new Date(storeExpiry.seconds * 1000);
            const now = new Date();
            const daysLeft = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
            
            if (daysLeft <= 5 && daysLeft > 0) {
                storeStatusHTML = `
                    <div style="background:#FFF3E0;padding:14px;border-radius:12px;margin:10px 0;border:1px solid #FFE082;">
                        <div style="display:flex;justify-content:space-between;align-items:center;">
                            <div>
                                <strong style="font-size:15px;">🏪 ${APP.userProfile.storeName || 'My Store'}</strong>
                                <p style="font-size:12px;color:#E65100;margin-top:3px;">⏰ Expires in <strong>${daysLeft} day${daysLeft > 1 ? 's' : ''}</strong></p>
                            </div>
                            <button class="btn-small btn-gold" onclick="renewStoreSubscription()">Renew</button>
                        </div>
                    </div>`;
            } else if (daysLeft <= 0) {
                storeStatusHTML = `
                    <div style="background:#FFEBEE;padding:14px;border-radius:12px;margin:10px 0;border:1px solid #FFCDD2;">
                        <div style="display:flex;justify-content:space-between;align-items:center;">
                            <div>
                                <strong style="font-size:15px;">🏪 Store Expired</strong>
                                <p style="font-size:12px;color:#C62828;margin-top:3px;">Renew to keep your store active</p>
                            </div>
                            <button class="btn-small btn-gold" onclick="renewStoreSubscription()">Renew Now</button>
                        </div>
                    </div>`;
            } else {
                storeStatusHTML = `
                    <div style="background:#E8F5E9;padding:12px 15px;border-radius:12px;margin:5px 0;font-size:13px;display:flex;justify-content:space-between;align-items:center;border:1px solid #C8E6C9;">
                        <span>🏪 <strong>${APP.userProfile.storeName || 'Store Active'}</strong> · ${daysLeft} days left</span>
                        ${daysLeft <= 15 ? `<button class="btn-small btn-outline" onclick="renewStoreSubscription()">Renew</button>` : ''}
                    </div>`;
            }
        } else {
            storeStatusHTML = `
                <div style="background:#E8F5E9;padding:12px 15px;border-radius:12px;margin:5px 0;font-size:13px;border:1px solid #C8E6C9;">
                    🏪 <strong>${APP.userProfile.storeName || 'Store Active'}</strong>
                </div>`;
        }
        
        subscriptionHTML += storeStatusHTML;
        
        // Store Dashboard Button with icon
        subscriptionHTML += `
            <button class="menu-item" onclick="openStoreDashboard()" style="background:linear-gradient(135deg,#FFF8E1,#FFFDE7);border:2px solid #FFD700;">
                <span class="menu-icon" style="font-size:28px;">🏪</span>
                <div style="flex:1;text-align:left;">
                    <div style="font-weight:700;font-size:15px;">Store Dashboard</div>
                    <div style="font-size:11px;color:#666;">Manage products, orders & settings</div>
                </div>
                <span class="menu-arrow">›</span>
            </button>`;
            
    } else if (APP.userProfile.isMerchant) {
        // Legacy merchant
        subscriptionHTML += `
            <div style="background:#E8F5E9;padding:12px 15px;border-radius:12px;margin:5px 0;font-size:13px;border:1px solid #C8E6C9;">
                🏪 <strong>Merchant Active</strong> - ${APP.userProfile.merchantSubscription === 'lifetime' ? 'Lifetime' : 'Active'}
            </div>
            <button class="menu-item" onclick="navigateTo('merchant')" style="background:linear-gradient(135deg,#FFF8E1,#FFFDE7);border:2px solid #FFD700;">
                <span class="menu-icon" style="font-size:28px;">📊</span>
                <div style="flex:1;text-align:left;">
                    <div style="font-weight:700;font-size:15px;">Merchant Dashboard</div>
                    <div style="font-size:11px;color:#666;">Manage your store & products</div>
                </div>
                <span class="menu-arrow">›</span>
            </button>`;
    } else {
        // NO STORE - Show big attractive "Own a Store" banner
        subscriptionHTML += `
            <div onclick="showStorePlans()" style="cursor:pointer;background:linear-gradient(135deg,#667eea,#764ba2);padding:20px;border-radius:14px;margin:10px 0;color:white;position:relative;overflow:hidden;box-shadow:0 4px 16px rgba(102,126,234,0.3);">
                <div style="position:absolute;top:-20px;right:-20px;font-size:80px;opacity:0.15;">🏪</div>
                <div style="position:relative;z-index:1;">
                    <div style="font-size:32px;margin-bottom:8px;">🏪</div>
                    <h3 style="margin:0 0 5px;font-size:18px;">Own Your Store</h3>
                    <p style="opacity:0.9;font-size:13px;margin:0 0 12px;">Create your own store on ONESHOPLIFY</p>
                    <div style="display:inline-block;background:white;color:#667eea;padding:8px 18px;border-radius:20px;font-weight:700;font-size:13px;">
                        Get Started from $5/mo →
                    </div>
                    <div style="display:flex;gap:15px;margin-top:12px;font-size:11px;opacity:0.8;">
                        <span>✅ Your own link</span>
                        <span>✅ Add products</span>
                        <span>✅ Sell tickets</span>
                    </div>
                </div>
            </div>`;
    }
    
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
                    <div style="background:#FFF3E0;padding:12px;border-radius:10px;margin:8px 0;border-left:4px solid #FF9800;">
                        <div style="display:flex;justify-content:space-between;align-items:center;">
                            <div><strong>📦 ${planName.toUpperCase()} Dropship</strong><p style="font-size:11px;color:#E65100;">⏰ ${daysLeft} day${daysLeft>1?'s':''} left</p></div>
                            <button class="btn-small btn-gold" onclick="renewDropshipSubscription()">Renew</button>
                        </div>
                    </div>`;
            } else if (daysLeft <= 0) {
                subscriptionHTML += `
                    <div style="background:#FFEBEE;padding:12px;border-radius:10px;margin:8px 0;border-left:4px solid #F44336;">
                        <div style="display:flex;justify-content:space-between;align-items:center;">
                            <div><strong>📦 Dropship Expired</strong></div>
                            <button class="btn-small btn-gold" onclick="renewDropshipSubscription()">Renew</button>
                        </div>
                    </div>`;
            } else {
                subscriptionHTML += `
                    <div style="background:#E8F5E9;padding:10px 15px;border-radius:10px;margin:5px 0;font-size:13px;display:flex;justify-content:space-between;align-items:center;">
                        <span>📦 <strong>${planName.toUpperCase()}</strong> · ${daysLeft}d</span>
                        <div>
                            ${daysLeft <= 10 ? `<button class="btn-small btn-outline" onclick="renewDropshipSubscription()">Renew</button>` : ''}
                            <button class="btn-small btn-outline" onclick="navigateTo('dropship')" style="margin-left:5px;">Upgrade</button>
                        </div>
                    </div>`;
            }
        }
    } else {
        subscriptionHTML += `
            <button class="menu-item" onclick="showDropshipPlans()">
                <span class="menu-icon">📦</span> Become a Dropshipper
                <span style="margin-left:auto;color:var(--gold-dark);">From $5/mo</span>
                <span class="menu-arrow">›</span>
            </button>`;
    }
    
    // =====================
    // INFLUENCER STATUS
    // =====================
    if (APP.userProfile.influencerStatus === 'approved') {
        subscriptionHTML += `
            <div style="background:#E8F5E9;padding:10px 15px;border-radius:10px;margin:5px 0;font-size:13px;">
                🤝 <strong>Influencer Active</strong>${APP.userProfile.influencerVerified ? ' ✓ Verified' : ''}
            </div>`;
    } else if (APP.userProfile.influencerStatus === 'pending') {
        subscriptionHTML += `<div style="background:#FFF8E1;padding:10px 15px;border-radius:10px;margin:5px 0;font-size:13px;">🤝 <strong>Application Pending</strong></div>`;
    } else if (APP.userProfile.influencerStatus === 'suspended') {
        subscriptionHTML += `<div style="background:#FFEBEE;padding:10px 15px;border-radius:10px;margin:5px 0;font-size:13px;">🤝 <strong>Suspended</strong></div>`;
    } else if (APP.userProfile.influencerStatus === 'rejected') {
        subscriptionHTML += `<div style="background:#FFEBEE;padding:10px 15px;border-radius:10px;margin:5px 0;font-size:13px;">🤝 <strong>Rejected</strong></div>`;
    } else {
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
            
            ${APP.userProfile.hasStore ? `
                <button class="menu-item" onclick="openStoreDashboard()" style="background:linear-gradient(135deg,#FFF8E1,#FFFDE7);border:2px solid #FFD700;">
                    <span class="menu-icon" style="font-size:28px;">🏪</span>
                    <div style="flex:1;text-align:left;">
                        <div style="font-weight:700;">Store Dashboard</div>
                        <div style="font-size:11px;color:#666;">Manage your store</div>
                    </div>
                    <span class="menu-arrow">›</span>
                </button>
            ` : ''}
            
            ${APP.userProfile.isMerchant && !APP.userProfile.hasStore ? `
                <button class="menu-item" onclick="navigateTo('merchant')">
                    <span class="menu-icon">📊</span> Merchant Dashboard
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
                <small style="color:#999;font-size:11px;">Share this to receive funds</small>
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
// STORE PLANS - SHOWS WHEN CLICKED
// =====================
function showStorePlans() {
    const plans = [
        { name: 'Monthly', price: 5, period: 'month', color: '#667eea', icon: '📅', popular: false },
        { name: '3 Months', price: 13.50, period: 'quarter', color: '#2196F3', icon: '📆', savings: 1.50, popular: true },
        { name: '6 Months', price: 24, period: 'biannual', color: '#9C27B0', icon: '📊', savings: 6, popular: false },
        { name: 'Annual', price: 45, period: 'annual', color: '#FF9800', icon: '👑', savings: 15, popular: false }
    ];
    
    showModal(`
        <div style="padding:15px;max-height:80vh;overflow-y:auto;">
            <div style="text-align:center;margin-bottom:20px;">
                <div style="font-size:50px;margin-bottom:10px;">🏪</div>
                <h3 style="margin:0;">Own Your Store on ONESHOPLIFY</h3>
                <p style="color:#666;margin:8px 0;font-size:14px;">Create your store, add products, sell tickets & grow!</p>
            </div>
            
            <p style="font-size:13px;color:#666;margin-bottom:15px;text-align:center;">
                💰 Your Balance: <strong>${formatCurrency(APP.userProfile?.walletBalance || 0)}</strong>
            </p>
            
            ${plans.map(plan => `
                <div style="background:white;border-radius:14px;padding:20px;margin-bottom:12px;box-shadow:0 2px 10px rgba(0,0,0,0.06);border:2px solid ${plan.popular ? plan.color : '#e0e0e0'};position:relative;${plan.popular ? 'border-width:2px;' : ''}">
                    ${plan.popular ? '<span style="position:absolute;top:-10px;right:20px;background:#FFD700;color:#1a1a1a;padding:4px 14px;border-radius:12px;font-size:11px;font-weight:700;">BEST VALUE</span>' : ''}
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <h4 style="margin:0;font-size:17px;">${plan.icon} ${plan.name}</h4>
                        ${plan.savings > 0 ? `<span style="background:#E8F5E9;color:#2E7D32;padding:3px 10px;border-radius:10px;font-size:11px;font-weight:600;">Save $${plan.savings}</span>` : ''}
                    </div>
                    <div style="font-size:32px;font-weight:800;color:${plan.color};margin:10px 0;">$${plan.price}</div>
                    <p style="font-size:12px;color:#666;margin:0;">per ${plan.period}</p>
                    
                    <div style="background:#f9f9f9;padding:12px;border-radius:8px;margin:12px 0;">
                        <p style="font-size:12px;font-weight:600;margin:0 0 8px;">What you get:</p>
                        <ul style="list-style:none;padding:0;font-size:12px;color:#666;line-height:2;margin:0;">
                            <li>✅ Store: yourname.oneshoplify.com</li>
                            <li>✅ Add unlimited products</li>
                            <li>✅ Sell tickets & events</li>
                            <li>✅ Product sponsorship ($10/mo)</li>
                            <li>✅ Discount codes</li>
                            <li>✅ Store customization</li>
                            <li>✅ Customer support</li>
                        </ul>
                    </div>
                    
                    ${(APP.userProfile?.walletBalance || 0) >= plan.price ? `
                        <button class="btn-gold btn-full" style="padding:14px;font-size:15px;font-weight:700;" onclick="subscribeToStore('${plan.name.toLowerCase()}', ${plan.price}, '${plan.period}')">
                            🚀 Start ${plan.name} Plan - $${plan.price}
                        </button>
                    ` : `
                        <div style="background:#FFF3E0;padding:10px;border-radius:8px;text-align:center;margin-bottom:8px;">
                            <p style="color:#E65100;font-size:12px;margin:0;">Need $${plan.price} · You have ${formatCurrency(APP.userProfile?.walletBalance || 0)}</p>
                        </div>
                        <button class="btn-outline btn-full" onclick="hideModal();navigateTo('wallet');">💰 Deposit Funds</button>
                    `}
                </div>
            `).join('')}
        </div>
    `);
}

// =====================
// SUBSCRIBE TO STORE
// =====================
async function subscribeToStore(planName, price, period) {
    hideModal();
    
    if ((APP.userProfile?.walletBalance || 0) < price) {
        showToast(`Insufficient balance. Need $${price}.`, 'error');
        navigateTo('wallet');
        return;
    }
    
    showLoader();
    
    try {
        const userId = APP.userProfile.uid;
        const expiryDate = new Date();
        
        if (period === 'month') expiryDate.setMonth(expiryDate.getMonth() + 1);
        else if (period === 'quarter') expiryDate.setMonth(expiryDate.getMonth() + 3);
        else if (period === 'biannual') expiryDate.setMonth(expiryDate.getMonth() + 6);
        else if (period === 'annual') expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        
        await db.collection('users').doc(userId).update({
            walletBalance: firebase.firestore.FieldValue.increment(-price),
            hasStore: true,
            storePlan: planName,
            storeExpiry: firebase.firestore.Timestamp.fromDate(expiryDate),
            storeActive: true,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        APP.userProfile.walletBalance -= price;
        APP.userProfile.hasStore = true;
        APP.userProfile.storePlan = planName;
        APP.userProfile.storeExpiry = { seconds: Math.floor(expiryDate.getTime() / 1000) };
        APP.userProfile.storeActive = true;
        
        await db.collection('transactions').add({
            userId: userId,
            type: 'store_subscription',
            amount: price,
            currency: 'USD',
            status: 'completed',
            description: `Store ${planName} plan`,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        hideLoader();
        showToast('Store subscription active! 🎉 Set up your store now.', 'success');
        
        // Show store setup form
        setTimeout(() => {
            startStoreSetup();
        }, 500);
        
    } catch (error) {
        hideLoader();
        console.error('Store subscription error:', error);
        showToast('Payment failed. Please try again.', 'error');
    }
}

// =====================
// STORE SETUP FORM
// =====================
function startStoreSetup() {
    showModal(`
        <div style="padding:15px;max-height:80vh;overflow-y:auto;">
            <div style="text-align:center;margin-bottom:15px;">
                <div style="font-size:40px;">🏪</div>
                <h3>Set Up Your Store</h3>
                <p style="color:#666;">Fill in your store details below</p>
            </div>
            
            <div class="input-group" style="margin-top:15px;">
                <label>Store Name *</label>
                <input type="text" id="setup-store-name" class="input-field" placeholder="My Awesome Store" value="${APP.userProfile.storeName || ''}">
            </div>
            
            <div class="input-group" style="margin-top:10px;">
                <label>Store Description</label>
                <textarea id="setup-store-desc" class="input-field" rows="3" placeholder="Describe what your store sells...">${APP.userProfile.storeDescription || ''}</textarea>
                <small style="color:#999;" id="word-count">0 words</small>
            </div>
            
            <div class="input-group" style="margin-top:10px;">
                <label>Store Category *</label>
                <select id="setup-store-category" class="input-field">
                    <option value="">Select Category</option>
                    <option value="Fashion">👗 Fashion</option>
                    <option value="Electronics">🔌 Electronics</option>
                    <option value="Home & Garden">🏠 Home & Garden</option>
                    <option value="Sports">⚽ Sports</option>
                    <option value="Beauty">💄 Beauty</option>
                    <option value="Toys">🧸 Toys</option>
                    <option value="Food & Drinks">🍔 Food & Drinks</option>
                    <option value="Tickets & Events">🎫 Tickets & Events</option>
                    <option value="All Purpose Store">🛍️ All Purpose Store</option>
                    <option value="Digital Products">💻 Digital Products</option>
                    <option value="Services">🔧 Services</option>
                </select>
            </div>
            
            <div class="input-group" style="margin-top:10px;">
                <label>Store Country *</label>
                <select id="setup-store-country" class="input-field">
                    <option value="">Select Country</option>
                    ${typeof COUNTRIES !== 'undefined' ? Object.entries(COUNTRIES).sort((a,b) => a[1].name.localeCompare(b[1].name)).map(([code, data]) => `<option value="${code}" ${APP.userProfile.country === code ? 'selected' : ''}>${data.flag||''} ${data.name}</option>`).join('') : ''}
                </select>
            </div>
            
            <div class="input-group" style="margin-top:10px;">
                <label>Industrial UID (from ONESHOPLIFY Wallet)</label>
                <input type="text" id="setup-industrial-uid" class="input-field" placeholder="Enter UID or skip for now" value="${APP.userProfile.industrialUid || ''}">
                <small style="color:#999;">Optional - Get from Wallet → Profile → Store & Gateway</small>
            </div>
            
            <div class="input-group" style="margin-top:10px;">
                <label>Store Logo</label>
                <input type="file" id="setup-store-logo" class="input-field" accept="image/*">
            </div>
            
            <div class="input-group" style="margin-top:10px;">
                <label>Store Banner</label>
                <input type="file" id="setup-store-banner" class="input-field" accept="image/*">
            </div>
            
            <div class="input-group" style="margin-top:10px;">
                <label>Theme Color</label>
                <input type="color" id="setup-store-color" class="input-field" value="${APP.userProfile.storeColor || '#667eea'}" style="height:50px;padding:5px;">
            </div>
            
            <label style="display:flex;align-items:start;gap:8px;margin-top:15px;cursor:pointer;">
                <input type="checkbox" id="setup-fulfill" style="width:18px;height:18px;margin-top:3px;">
                <span style="font-size:13px;">I confirm I will fulfill all orders placed through my store</span>
            </label>
            
            <label style="display:flex;align-items:start;gap:8px;margin-top:8px;cursor:pointer;">
                <input type="checkbox" id="setup-terms" style="width:18px;height:18px;margin-top:3px;">
                <span style="font-size:13px;">I agree to ONESHOPLIFY Store Terms & Conditions</span>
            </label>
            
            <button class="btn-gold btn-full" style="margin-top:15px;padding:14px;font-size:16px;" onclick="completeStoreSetup()">
                🚀 Launch My Store
            </button>
        </div>
    `);
    
    // Word counter
    setTimeout(() => {
        const descEl = document.getElementById('setup-store-desc');
        if (descEl) {
            const words = descEl.value.trim().split(/\s+/).filter(w => w.length > 0);
            const countEl = document.getElementById('word-count');
            if (countEl) countEl.textContent = words.length + ' words';
            
            descEl.addEventListener('input', function() {
                const w = this.value.trim().split(/\s+/).filter(x => x.length > 0);
                if (countEl) countEl.textContent = w.length + ' words';
            });
        }
    }, 300);
}

async function completeStoreSetup() {
    const name = document.getElementById('setup-store-name')?.value?.trim();
    const desc = document.getElementById('setup-store-desc')?.value?.trim();
    const category = document.getElementById('setup-store-category')?.value;
    const country = document.getElementById('setup-store-country')?.value;
    const industrialUid = document.getElementById('setup-industrial-uid')?.value?.trim();
    const color = document.getElementById('setup-store-color')?.value;
    const fulfill = document.getElementById('setup-fulfill')?.checked;
    const terms = document.getElementById('setup-terms')?.checked;
    
    if (!name) { showToast('Enter store name', 'error'); return; }
    if (!category) { showToast('Select category', 'error'); return; }
    if (!country) { showToast('Select country', 'error'); return; }
    if (!fulfill) { showToast('Confirm order fulfillment', 'error'); return; }
    if (!terms) { showToast('Agree to terms', 'error'); return; }
    
    hideModal();
    showLoader();
    
    try {
        let logoUrl = APP.userProfile.storeLogo || '';
        let bannerUrl = APP.userProfile.storeBanner || '';
        
        const logoFile = document.getElementById('setup-store-logo')?.files?.[0];
        const bannerFile = document.getElementById('setup-store-banner')?.files?.[0];
        
        if (logoFile) { try { logoUrl = await uploadToCloudinary(logoFile); } catch(e) {} }
        if (bannerFile) { try { bannerUrl = await uploadToCloudinary(bannerFile); } catch(e) {} }
        
        const updates = {
            storeName: name,
            storeDescription: desc,
            storeCategory: category,
            storeCountry: country,
            industrialUid: industrialUid,
            storeLogo: logoUrl,
            storeBanner: bannerUrl,
            storeColor: color,
            storeActive: true,
            hasStore: true,
            isMerchant: true,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection('users').doc(APP.userProfile.uid).update(updates);
        Object.assign(APP.userProfile, updates);
        
        hideLoader();
        
        const storeUrl = `https://${APP.userProfile.username}.oneshoplify.com`;
        showToast(`🎉 Store created! ${storeUrl}`, 'success');
        loadProfileScreen();
        
    } catch (e) {
        hideLoader();
        console.error('Store setup error:', e);
        showToast('Failed to create store', 'error');
    }
}

// =====================
// OPEN STORE DASHBOARD
// =====================
function openStoreDashboard() {
    if (typeof loadStoreOwnerDashboard === 'function') {
        navigateTo('merchant');
        setTimeout(() => loadStoreOwnerDashboard(), 300);
    } else {
        navigateTo('merchant');
    }
}

// =====================
// RENEW STORE
// =====================
function renewStoreSubscription() {
    showStorePlans();
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
        <div style="padding:10px;max-height:70vh;overflow-y:auto;">
            <div style="text-align:center;margin-bottom:15px;">
                <div style="font-size:40px;">📦</div>
                <h3>Become a Dropshipper</h3>
                <p style="color:#666;">Resell products without inventory</p>
            </div>
            <p style="font-size:13px;">Balance: <strong>${formatCurrency(APP.userProfile?.walletBalance || 0)}</strong></p>
            ${plans.map(plan => `
                <div style="background:white;border-radius:12px;padding:18px;margin:10px 0;box-shadow:0 2px 6px rgba(0,0,0,0.04);border-left:4px solid ${plan.color};">
                    <h4>${plan.icon} ${plan.name}</h4>
                    <div class="plan-price">$${plan.price}<span style="font-size:14px;">/mo</span></div>
                    ${(APP.userProfile?.walletBalance || 0) >= plan.price ? `
                        <button class="btn-gold btn-full" onclick="payDropshipSubscription('${plan.name.toLowerCase()}',${plan.price})">Select - $${plan.price}/mo</button>
                    ` : `<button class="btn-outline btn-full" disabled>Need $${plan.price}</button>`}
                </div>
            `).join('')}
            ${(APP.userProfile?.walletBalance || 0) < 5 ? `<button class="btn-gold btn-full" onclick="hideModal();navigateTo('wallet');">💰 Deposit</button>` : ''}
            <button class="btn-outline btn-full" style="margin-top:8px;" onclick="hideModal()">Cancel</button>
        </div>
    `);
}

async function payDropshipSubscription(plan, price) {
    hideModal();
    if ((APP.userProfile?.walletBalance || 0) < price) { showToast('Insufficient balance', 'error'); navigateTo('wallet'); return; }
    showLoader();
    try {
        const d = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        await db.collection('users').doc(APP.userProfile.uid).update({
            walletBalance: firebase.firestore.FieldValue.increment(-price),
            dropshipPlan: plan, isDropshipper: true,
            dropshipPlanExpiry: firebase.firestore.Timestamp.fromDate(d),
            dropshipVerified: plan === 'enterprise'
        });
        APP.userProfile.walletBalance -= price;
        APP.userProfile.dropshipPlan = plan;
        APP.userProfile.isDropshipper = true;
        if (plan === 'enterprise') APP.userProfile.dropshipVerified = true;
        await db.collection('transactions').add({
            userId: APP.userProfile.uid, type: 'subscription', amount: price,
            currency: 'USD', status: 'completed', createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        hideLoader(); showToast(`Subscribed! 🎉`, 'success'); navigateTo('dropship');
    } catch (e) { hideLoader(); showToast('Failed', 'error'); }
}

async function renewDropshipSubscription() {
    const prices = { starter: 5, professional: 10, enterprise: 45 };
    const plan = APP.userProfile?.dropshipPlan || 'starter';
    const price = prices[plan] || 5;
    if ((APP.userProfile?.walletBalance || 0) < price) { showToast('Insufficient balance', 'error'); navigateTo('wallet'); return; }
    showLoader();
    try {
        const d = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        await db.collection('users').doc(APP.userProfile.uid).update({
            walletBalance: firebase.firestore.FieldValue.increment(-price),
            dropshipPlanExpiry: firebase.firestore.Timestamp.fromDate(d)
        });
        APP.userProfile.walletBalance -= price;
        hideLoader(); showToast('Renewed! 🎉', 'success'); loadProfileScreen();
    } catch (e) { hideLoader(); showToast('Failed', 'error'); }
}

// =====================
// INFLUENCER APPLICATION
// =====================
function showInfluencerApplication() {
    if (APP.userProfile?.influencerStatus === 'pending') { showToast('Under review', 'info'); return; }
    if (APP.userProfile?.influencerStatus === 'approved') { showToast('Already approved', 'info'); return; }
    if (APP.userProfile?.influencerStatus === 'rejected') { showToast('Rejected', 'error'); return; }
    if (APP.userProfile?.influencerStatus === 'suspended') { showToast('Suspended', 'error'); return; }
    
    showModal(`
        <div style="padding:10px;">
            <div style="text-align:center;margin-bottom:10px;"><div style="font-size:40px;">🤝</div><h3>Apply as Influencer</h3></div>
            <div style="background:#f5f5f5;padding:15px;border-radius:8px;margin:10px 0;font-size:12px;line-height:1.8;">
                <p><strong>Terms:</strong></p><p>1. Name must match social media</p><p>2. 3 reports = suspension</p><p>3. 2 suspensions = ban</p><p>4. 5% commission</p><p>5. Fee: $1/month</p>
            </div>
            <label style="display:flex;align-items:center;gap:8px;cursor:pointer;margin:10px 0;"><input type="checkbox" id="agree-influencer-terms" style="width:18px;height:18px;"><span style="font-size:13px;">I agree</span></label>
            ${(APP.userProfile?.walletBalance||0)>=APP.advertiserPrice?`<button class="btn-gold btn-full" onclick="proceedToInfluencerApplication()">💳 Pay $${APP.advertiserPrice} & Apply</button>`:`<div style="background:#FFEBEE;padding:10px;border-radius:8px;margin:8px 0;"><p style="color:#C62828;font-size:12px;">Need $${APP.advertiserPrice}</p></div><button class="btn-gold btn-full" onclick="hideModal();navigateTo('wallet');">💰 Deposit</button>`}
            <button class="btn-outline btn-full" style="margin-top:8px;" onclick="hideModal()">Cancel</button>
        </div>
    `);
}

function proceedToInfluencerApplication() {
    if (!document.getElementById('agree-influencer-terms')?.checked) { showToast('Agree to terms', 'error'); return; }
    hideModal(); navigateTo('influencer-apply');
}

// =====================
// INFLUENCER APPLICATION FORM
// =====================
function loadInfluencerApplication() {
    const container = document.getElementById('influencer-apply-content');
    if (!container) return;
    
    if (APP.userProfile?.influencerStatus === 'approved') {
        container.innerHTML = `<div style="text-align:center;padding:40px;"><p style="font-size:50px;">✅</p><h3>Approved!</h3></div>`;
        return;
    }
    if (APP.userProfile?.influencerStatus === 'rejected') {
        container.innerHTML = `<div style="text-align:center;padding:40px;"><p style="font-size:50px;">❌</p><h3>Rejected</h3></div>`;
        return;
    }
    
    const savedData = APP.userProfile?.influencerDraft || {};
    
    container.innerHTML = `
        <div style="padding:20px;">
            <h3>🤝 Influencer Application</h3>
            <div class="input-group"><label>Full Name</label><input type="text" id="inf-name" class="input-field" value="${savedData.name || APP.userProfile.displayName || ''}"></div>
            <div class="input-group"><label>Niche</label><input type="text" id="inf-niche" class="input-field" value="${savedData.niche || ''}"></div>
            <div class="input-group"><label>Bio</label><textarea id="inf-bio" class="input-field" rows="3">${savedData.bio || ''}</textarea></div>
            <div class="input-group"><label>Phone (WhatsApp)</label><input type="tel" id="inf-phone" class="input-field" value="${savedData.phone || APP.userProfile.phoneNumber || ''}"></div>
            
            <div class="input-group"><label>Social Platforms</label>
                <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:8px;">
                    ${APP.socialPlatforms.map(p => `
                        <div onclick="toggleInfluencerPlatform('${p.id}')" id="inf-platform-${p.id}"
                             style="padding:15px 12px;border:2px solid ${savedData.platforms?.includes(p.id)?'#FFD700':'#e0e0e0'};border-radius:12px;cursor:pointer;text-align:center;background:${savedData.platforms?.includes(p.id)?'#FFFDE7':'white'};min-width:85px;">
                            <div style="width:36px;height:36px;display:flex;align-items:center;justify-content:center;margin:0 auto;color:${p.color};">${p.icon}</div>
                            <div style="font-size:11px;font-weight:600;margin-top:6px;">${p.name}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="input-group"><label>Screenshot</label><input type="file" id="inf-screenshot" class="input-field" accept="image/*" onchange="previewInfluencerScreenshot()"><div id="inf-screenshot-preview" style="margin-top:8px;">${savedData.screenshotUrl?`<img src="${savedData.screenshotUrl}" style="width:100%;max-height:200px;border-radius:8px;">`:''}</div></div>
            
            <button class="btn-gold btn-full" onclick="submitInfluencerApplication()">Submit</button>
            <button class="btn-outline btn-full" style="margin-top:8px;" onclick="saveInfluencerDraft()">💾 Save Draft</button>
        </div>
    `;
    window._influencerPlatforms = savedData.platforms || [];
}

function toggleInfluencerPlatform(id) {
    if (!window._influencerPlatforms) window._influencerPlatforms = [];
    const idx = window._influencerPlatforms.indexOf(id);
    if (idx >= 0) window._influencerPlatforms.splice(idx, 1);
    else window._influencerPlatforms.push(id);
    const el = document.getElementById('inf-platform-' + id);
    if (el) { const s = window._influencerPlatforms.includes(id); el.style.borderColor = s?'#FFD700':'#e0e0e0'; el.style.background = s?'#FFFDE7':'white'; }
}

function previewInfluencerScreenshot() {
    const f = document.getElementById('inf-screenshot')?.files?.[0];
    const c = document.getElementById('inf-screenshot-preview');
    if (!c || !f) return;
    window._influencerScreenshot = f;
    const r = new FileReader();
    r.onload = e => { c.innerHTML = `<img src="${e.target.result}" style="width:100%;max-height:200px;border-radius:8px;">`; };
    r.readAsDataURL(f);
}

async function submitInfluencerApplication() {
    const name = document.getElementById('inf-name')?.value?.trim();
    const niche = document.getElementById('inf-niche')?.value?.trim();
    const bio = document.getElementById('inf-bio')?.value?.trim();
    const phone = document.getElementById('inf-phone')?.value?.trim();
    const platforms = window._influencerPlatforms || [];
    if (!name) { showToast('Enter name', 'error'); return; }
    if (!phone) { showToast('Enter phone', 'error'); return; }
    if (platforms.length === 0) { showToast('Select platform', 'error'); return; }
    if ((APP.userProfile?.walletBalance||0) < APP.advertiserPrice) { showToast('Insufficient balance', 'error'); navigateTo('wallet'); return; }
    showLoader();
    try {
        let ss = APP.userProfile?.influencerDraft?.screenshotUrl || '';
        if (window._influencerScreenshot) ss = await uploadToCloudinary(window._influencerScreenshot);
        await db.collection('users').doc(APP.userProfile.uid).update({
            walletBalance: firebase.firestore.FieldValue.increment(-APP.advertiserPrice),
            influencerStatus: 'pending', influencerName: name, influencerNiche: niche,
            influencerBio: bio, influencerPhone: phone, influencerPlatforms: platforms,
            influencerScreenshot: ss, influencerReports: 0, influencerSuspensions: 0,
            influencerVerified: false, influencerAppliedAt: firebase.firestore.FieldValue.serverTimestamp(), influencerDraft: null
        });
        APP.userProfile.walletBalance -= APP.advertiserPrice;
        APP.userProfile.influencerStatus = 'pending';
        await db.collection('transactions').add({ userId: APP.userProfile.uid, type: 'subscription', amount: APP.advertiserPrice, currency: 'USD', status: 'completed', createdAt: firebase.firestore.FieldValue.serverTimestamp() });
        if (typeof createNotification === 'function') await createNotification('admin', 'New Influencer', `${name} applied.`, '🤝', 'customerservice');
        hideLoader(); showToast('Submitted! ✅', 'success'); navigateTo('profile');
    } catch (e) { hideLoader(); showToast('Failed', 'error'); }
}

async function saveInfluencerDraft() {
    const name = document.getElementById('inf-name')?.value?.trim();
    const niche = document.getElementById('inf-niche')?.value?.trim();
    const bio = document.getElementById('inf-bio')?.value?.trim();
    const phone = document.getElementById('inf-phone')?.value?.trim();
    const platforms = window._influencerPlatforms || [];
    try { await db.collection('users').doc(APP.userProfile.uid).update({ influencerDraft: { name, niche, bio, phone, platforms } }); showToast('Draft saved! ✅', 'success'); }
    catch (e) { showToast('Failed', 'error'); }
}

// =====================
// PROFILE PICTURE
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
        hideLoader(); showToast('Updated! 📷', 'success');
    } catch (e) { hideLoader(); showToast('Failed', 'error'); }
}

// =====================
// SETTINGS
// =====================
async function loadSettingsScreen() {
    const c = document.getElementById('settings-content');
    if (!c || !APP.userProfile) return;
    const co = typeof COUNTRIES !== 'undefined' ? Object.entries(COUNTRIES).sort((a,b) => a[1].name.localeCompare(b[1].name)).map(([code, data]) => `<option value="${code}" ${APP.userProfile.country===code?'selected':''}>${data.flag||''} ${data.name}</option>`).join('') : '';
    c.innerHTML = `
        <div style="padding:20px;">
            <h3>👤 Account</h3>
            <div class="input-group"><label>Username</label><input type="text" id="settings-username" class="input-field" value="${APP.userProfile.username||''}"></div>
            <div class="input-group"><label>Display Name</label><input type="text" id="settings-displayname" class="input-field" value="${APP.userProfile.displayName||''}"></div>
            <div class="input-group"><label>Email</label><input type="email" id="settings-email" class="input-field" value="${APP.userProfile.email||''}"></div>
            <div class="input-group"><label>Phone</label><div class="phone-input-wrapper"><span class="country-code-display" id="settings-country-code">${COUNTRIES?.[APP.userProfile.country]?.code||'+1'}</span><input type="tel" id="settings-phone" class="input-field phone-input" value="${(APP.userProfile.phoneNumber||'').replace(COUNTRIES?.[APP.userProfile.country]?.code||'+1','')}"></div></div>
            <div class="input-group"><label>Country</label><select id="settings-country" class="input-field" onchange="updateSettingsCountryCode()">${co}</select></div>
            <div class="input-group"><label>New Password</label><input type="password" id="settings-password" class="input-field" placeholder="Leave blank"></div>
            <button class="btn-gold btn-full" style="margin-top:15px;" onclick="saveSettings()">💾 Save</button>
            <h3 style="margin-top:25px;">🎨 Appearance</h3>
            <div class="setting-item"><span>Theme</span><div><button class="theme-btn ${APP.userProfile.theme==='light'?'active':''}" onclick="setThemeSetting('light')">☀️</button><button class="theme-btn ${APP.userProfile.theme==='dark'?'active':''}" onclick="setThemeSetting('dark')">🌙</button></div></div>
            <div class="setting-item"><span>Text Size</span><div class="text-size-controls"><button class="theme-btn ${APP.userProfile.textSize==='small'?'active':''}" onclick="setTextSizeSetting('small')">S</button><button class="theme-btn ${APP.userProfile.textSize==='medium'?'active':''}" onclick="setTextSizeSetting('medium')">M</button><button class="theme-btn ${APP.userProfile.textSize==='large'?'active':''}" onclick="setTextSizeSetting('large')">L</button></div></div>
            <h3 style="margin-top:25px;">✅ Verification</h3>
            ${APP.userProfile.isAppVerified?'<div style="background:#E8F5E9;padding:15px;border-radius:8px;text-align:center;"><p style="font-size:30px;">✅</p><p>App Verified</p></div>':APP.userProfile.appVerificationApplied?'<div style="background:#FFF8E1;padding:15px;border-radius:8px;text-align:center;"><p>⏳ In progress...</p></div>':`<p style="color:#666;">Requirements: ${APP.verifyMinSales} sales, ${APP.verifyMinReferrals} referrals, $${APP.verifyMinEarnings} earned</p><div class="input-group"><label>Full Name</label><input type="text" id="verify-name" class="input-field"></div><div class="input-group"><label>Date of Birth</label><input type="date" id="verify-dob" class="input-field"></div><button class="btn-outline btn-full" style="margin-top:15px;" onclick="applyForVerification()">Apply</button>`}
            <h3 style="margin-top:25px;">ℹ️ About</h3><p style="color:#666;">ONESHOPLIFY Enterprise v${APP.version}</p><p style="color:#666;">Powered by Rev</p>
        </div>`;
}

function updateSettingsCountryCode() { const c = document.getElementById('settings-country')?.value; const d = document.getElementById('settings-country-code'); if (d && c && COUNTRIES?.[c]) d.textContent = COUNTRIES[c].code || '+1'; }

async function saveSettings() {
    const u = document.getElementById('settings-username')?.value?.trim()?.toLowerCase();
    const dn = document.getElementById('settings-displayname')?.value?.trim();
    const e = document.getElementById('settings-email')?.value?.trim();
    const p = document.getElementById('settings-phone')?.value?.trim();
    const c = document.getElementById('settings-country')?.value;
    const pw = document.getElementById('settings-password')?.value;
    if (u && !/^[a-z0-9]{3,30}$/.test(u)) { showToast('Invalid username','error'); return; }
    if (u && u !== APP.userProfile.username) { try { const ch = await db.collection('users').where('username','==',u).limit(1).get(); if (!ch.empty) { showToast('Username taken','error'); return; } } catch (ex) { showToast('Could not verify','error'); return; } }
    showLoader();
    try {
        const up = { updatedAt: firebase.firestore.FieldValue.serverTimestamp() };
        if (u) up.username = u; if (dn) up.displayName = dn; if (e) up.email = e;
        if (c && COUNTRIES?.[c]) { up.country = c; up.countryFlag = COUNTRIES[c].flag||''; up.currency = COUNTRIES[c].currency||'USD'; }
        if (p) up.phoneNumber = (COUNTRIES?.[c||APP.userProfile.country]?.code||'+1') + p;
        if (pw && pw.length >= 6) up.password = pw;
        await db.collection('users').doc(APP.userProfile.uid).update(up);
        Object.assign(APP.userProfile, up);
        hideLoader(); showToast('Saved! ✅','success');
    } catch (ex) { hideLoader(); showToast('Failed','error'); }
}

function setThemeSetting(t) {
    APP.userProfile.theme = t;
    document.querySelectorAll('.theme-btn').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.theme-btn').forEach(b=>{if(b.textContent.includes(t==='light'?'☀️':'🌙'))b.classList.add('active');});
    document.body.classList.toggle('dark-theme',t==='dark');
    db.collection('users').doc(APP.userProfile.uid).update({theme:t}).catch(()=>{});
}

function setTextSizeSetting(s) {
    APP.userProfile.textSize = s;
    document.querySelectorAll('.text-size-controls .theme-btn').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.text-size-controls .theme-btn').forEach(b=>{if(b.textContent===s.toUpperCase().substring(0,1))b.classList.add('active');});
    document.body.style.fontSize = {small:'14px',medium:'16px',large:'18px'}[s];
    db.collection('users').doc(APP.userProfile.uid).update({textSize:s}).catch(()=>{});
}

async function applyForVerification() {
    const n = document.getElementById('verify-name')?.value?.trim();
    const d = document.getElementById('verify-dob')?.value;
    if (!n||!d){showToast('Fill all','error');return;}
    const s = APP.userProfile.totalSales||0, r = APP.userProfile.totalReferrals||0, e = (APP.userProfile.affiliateEarnings||0)+(APP.userProfile.totalRevenue||0);
    if (s<APP.verifyMinSales){showToast(`Need ${APP.verifyMinSales} sales`,'error');return;}
    if (r<APP.verifyMinReferrals){showToast(`Need ${APP.verifyMinReferrals} referrals`,'error');return;}
    if (e<APP.verifyMinEarnings){showToast(`Need $${APP.verifyMinEarnings}`,'error');return;}
    try {
        await db.collection('verification_requests').add({userId:APP.userProfile.uid,name:n,dob:d,sales:s,referrals:r,earnings:e,status:'pending',createdAt:firebase.firestore.FieldValue.serverTimestamp()});
        await db.collection('users').doc(APP.userProfile.uid).update({appVerificationApplied:true});
        APP.userProfile.appVerificationApplied = true;
        showToast('Submitted! ✅','success'); loadSettingsScreen();
    } catch(ex){showToast('Failed','error');}
}

function confirmLogout() {
    showModal(`<h3>Logout</h3><p>Are you sure?</p><div style="display:flex;gap:10px;margin-top:20px;"><button class="btn-outline" style="flex:1;" onclick="hideModal()">Cancel</button><button class="btn-danger" style="flex:1;" onclick="performLogout()">Logout</button></div>`);
}

function performLogout() { hideModal(); logout(); }

console.log('✅ profile.js fully loaded - ONESHOPLIFY Profile System Ready');
