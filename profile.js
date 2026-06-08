// profile.js - COMPLETE FINAL VERSION (Customer: no leaderboard/hall of fame/affiliate/merchant)

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
    const isCustomer = !APP.userProfile?.isAffiliate && !APP.userProfile?.isMerchant && !APP.userProfile?.isDropshipper;
    
    // Subscription info only for paid accounts
    let subHTML = '';
    if (!isCustomer) {
        if (APP.userProfile.isAffiliate) {
            const expiry = APP.userProfile.affiliateSubscriptionExpiry;
            if (expiry) {
                const d = expiry.toDate?.() || expiry;
                const daysLeft = Math.ceil((d - new Date()) / (1000*60*60*24));
                subHTML += daysLeft <= 3 ? 
                    `<div style="background:#FFF3E0;padding:12px;border-radius:8px;margin:10px 0;border-left:4px solid #FF9800;"><div style="display:flex;justify-content:space-between;"><div><strong>📢 Affiliate</strong><p style="font-size:12px;color:#E65100;">⏰ ${daysLeft} day${daysLeft>1?'s':''} left</p></div><button class="btn-small btn-gold" onclick="renewAffiliateSubscription()">Renew $${APP.affiliatePrice}</button></div></div>` :
                    `<div style="background:#E8F5E9;padding:10px;border-radius:8px;margin:5px 0;font-size:13px;">📢 Affiliate Active - ${daysLeft} days</div>`;
            }
        }
        if (APP.userProfile.isMerchant) {
            subHTML += `<div style="background:#E8F5E9;padding:10px;border-radius:8px;margin:5px 0;font-size:13px;">🏪 Merchant Active - ${APP.userProfile.merchantSubscription==='lifetime'?'Lifetime':'Active'}</div>`;
        }
        if (APP.userProfile.isDropshipper) {
            const expiry = APP.userProfile.dropshipPlanExpiry;
            if (expiry) {
                const d = expiry.toDate?.() || expiry;
                const daysLeft = Math.ceil((d - new Date()) / (1000*60*60*24));
                subHTML += daysLeft <= 3 ?
                    `<div style="background:#FFF3E0;padding:12px;border-radius:8px;margin:10px 0;border-left:4px solid #FF9800;"><div style="display:flex;justify-content:space-between;"><div><strong>📦 ${APP.userProfile.dropshipPlan}</strong><p style="font-size:12px;color:#E65100;">⏰ ${daysLeft} day${daysLeft>1?'s':''} left</p></div><button class="btn-small btn-gold" onclick="renewDropshipPlan()">Renew</button></div></div>` :
                    `<div style="background:#E8F5E9;padding:10px;border-radius:8px;margin:5px 0;font-size:13px;">📦 ${APP.userProfile.dropshipPlan} - ${daysLeft} days <button class="btn-small btn-outline" onclick="navigateTo('dropship')">Upgrade</button></div>`;
            }
        }
    }
    
    container.innerHTML = `
        <div class="profile-header-card">
            <div style="position:relative;display:inline-block;cursor:pointer;" onclick="document.getElementById('profile-pic-upload').click()">
                <img src="${APP.userProfile.photoURL || APP.currentUser?.photoURL || 'app-icon.png'}" class="profile-avatar" id="profile-avatar-img" onerror="this.src='app-icon.png'">
                <div style="position:absolute;bottom:5px;right:5px;background:var(--gold);width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;">📷</div>
            </div>
            <input type="file" id="profile-pic-upload" accept="image/*" style="display:none;" onchange="uploadProfilePicture(event)">
            <h2 class="profile-name">${APP.userProfile.displayName || username}</h2>
            <p class="profile-username">@${username}</p>
            <div class="profile-badges">${badges.join(' ')}</div>
            <p style="margin-top:8px;">${APP.userProfile.countryFlag || '🌍'} ${APP.userProfile.country || ''}</p>
            <p style="font-size:13px;color:#666;">${APP.userProfile.accountType || 'Customer'} | ${APP.userProfile.currency || 'USD'}</p>
        </div>
        
        ${subHTML}
        
        <div class="profile-menu">
            <button class="menu-item" onclick="navigateTo('settings')"><span class="menu-icon">⚙️</span> Settings<span class="menu-arrow">›</span></button>
            <button class="menu-item" onclick="navigateTo('orders')"><span class="menu-icon">📦</span> My Orders<span class="menu-arrow">›</span></button>
            <button class="menu-item" onclick="navigateTo('wallet')"><span class="menu-icon">💰</span> Wallet<span class="menu-arrow">›</span></button>
            
            ${!isCustomer ? `
                ${APP.userProfile.isAffiliate ? `<button class="menu-item" onclick="navigateTo('affiliate')"><span class="menu-icon">📢</span> Affiliate Dashboard<span class="menu-arrow">›</span></button>` : ''}
                ${APP.userProfile.isMerchant ? `<button class="menu-item" onclick="navigateTo('merchant')"><span class="menu-icon">🏪</span> Merchant Dashboard<span class="menu-arrow">›</span></button>` : ''}
                ${APP.userProfile.isDropshipper ? `<button class="menu-item" onclick="navigateTo('dropship')"><span class="menu-icon">📦</span> Dropship Dashboard<span class="menu-arrow">›</span></button>` : ''}
                <button class="menu-item" onclick="navigateTo('leaderboard')"><span class="menu-icon">🏆</span> Leaderboard<span class="menu-arrow">›</span></button>
                <button class="menu-item" onclick="navigateTo('hall-of-fame')"><span class="menu-icon">🌟</span> Hall of Fame<span class="menu-arrow">›</span></button>
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
            
            <button class="menu-item" style="color:var(--red);" onclick="confirmLogout()"><span class="menu-icon">🚪</span> Logout<span class="menu-arrow">›</span></button>
        </div>
    `;
}

async function uploadProfilePicture(event) {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 5*1024*1024) { showToast('Max 5MB','error'); return; }
    showLoader();
    try {
        const url = await uploadToCloudinary(file);
        await db.collection('users').doc(APP.userProfile.uid).update({photoURL: url});
        APP.userProfile.photoURL = url;
        document.getElementById('profile-avatar-img').src = url;
        const hdr = document.getElementById('header-avatar'); if(hdr) hdr.src = url;
        hideLoader(); showToast('Updated! 📷','success');
    } catch(e) { hideLoader(); showToast('Failed','error'); }
}

function confirmLogout() {
    showModal(`<h3>Logout</h3><p>Are you sure?</p><div style="display:flex;gap:10px;margin-top:15px;"><button class="btn-outline" style="flex:1;" onclick="hideModal()">Cancel</button><button class="btn-danger" style="flex:1;" onclick="performLogout()">Logout</button></div>`);
}

function performLogout() { hideModal(); logout(); }

async function renewAffiliateSubscription() {
    if((APP.userProfile?.walletBalance||0)<APP.affiliatePrice){showToast(`Need $${APP.affiliatePrice}`,'error');navigateTo('wallet');return;}
    showLoader();
    try {
        const d = new Date(Date.now()+30*24*60*60*1000);
        await db.collection('users').doc(APP.userProfile.uid).update({walletBalance:firebase.firestore.FieldValue.increment(-APP.affiliatePrice),affiliateSubscriptionExpiry:firebase.firestore.Timestamp.fromDate(d)});
        APP.userProfile.walletBalance -= APP.affiliatePrice;
        APP.userProfile.affiliateSubscriptionExpiry = d;
        hideLoader(); showToast('Renewed! 🎉','success'); loadProfileScreen();
    } catch(e){hideLoader();showToast('Failed','error');}
}

async function renewDropshipPlan() {
    const prices = {starter:APP.dropshipStarter,growth:APP.dropshipGrowth,pro:APP.dropshipPro,elite:APP.dropshipElite};
    const price = prices[APP.userProfile?.dropshipPlan]||APP.dropshipStarter;
    if((APP.userProfile?.walletBalance||0)<price){showToast(`Need $${price}`,'error');navigateTo('wallet');return;}
    showLoader();
    try {
        const d = new Date(Date.now()+30*24*60*60*1000);
        await db.collection('users').doc(APP.userProfile.uid).update({walletBalance:firebase.firestore.FieldValue.increment(-price),dropshipPlanExpiry:firebase.firestore.Timestamp.fromDate(d)});
        APP.userProfile.walletBalance -= price;
        APP.userProfile.dropshipPlanExpiry = d;
        hideLoader(); showToast('Renewed! 🎉','success'); loadProfileScreen();
    } catch(e){hideLoader();showToast('Failed','error');}
}

// Settings screen
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
            <p style="color:#666;">Shoplify Enterprise v${APP.version}</p>
        </div>`;
}

function updateSettingsCountryCode() {
    const c = document.getElementById('settings-country')?.value;
    const d = document.getElementById('settings-country-code');
    if(d&&c&&COUNTRIES?.[c]) d.textContent = COUNTRIES[c].code||'+1';
}

async function saveSettings() {
    const username = document.getElementById('settings-username')?.value?.trim()?.toLowerCase();
    const displayName = document.getElementById('settings-displayname')?.value?.trim();
    const phone = document.getElementById('settings-phone')?.value?.trim();
    const country = document.getElementById('settings-country')?.value;
    const password = document.getElementById('settings-password')?.value;
    
    if(username&&!/^[a-z0-9]{3,30}$/.test(username)){showToast('Invalid username','error');return;}
    
    showLoader();
    try {
        const updates = {updatedAt:firebase.firestore.FieldValue.serverTimestamp()};
        if(username) updates.username = username;
        if(displayName) updates.displayName = displayName;
        if(country&&COUNTRIES?.[country]){updates.country=country;updates.countryFlag=COUNTRIES[country].flag;updates.currency=COUNTRIES[country].currency||'USD';}
        if(phone) updates.phoneNumber = (COUNTRIES?.[country||APP.userProfile.country]?.code||'+1')+phone;
        if(password&&password.length>=6) updates.password = password;
        await db.collection('users').doc(APP.userProfile.uid).update(updates);
        Object.assign(APP.userProfile, updates);
        hideLoader(); showToast('Saved! ✅','success');
    } catch(e){hideLoader();showToast('Failed','error');}
}

function setThemeSetting(theme) {
    APP.userProfile.theme = theme;
    document.querySelectorAll('.theme-btn').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.theme-btn').forEach(b=>{if(b.textContent.includes(theme==='light'?'☀️':'🌙'))b.classList.add('active');});
    document.body.classList.toggle('dark-theme',theme==='dark');
    db.collection('users').doc(APP.userProfile.uid).update({theme}).catch(()=>{});
}