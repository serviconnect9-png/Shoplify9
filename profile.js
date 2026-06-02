// ============ Profile Module ============

async function loadProfilePage() {
    if (!requireAuth()) return;
    const profile = await refreshUserProfile();
    const container = document.getElementById('profile-content');
    if (!container) return;
    const country = APP_STATE.userCountry || { flag: '🇺🇸', name: 'United States' };
    
    container.innerHTML = `
        <div style="background:linear-gradient(135deg,#FFD700,#E6C200);border-radius:16px;padding:24px;text-align:center;color:white;margin-bottom:20px;">
            <img src="${profile.photoURL||APP_STATE.currentUser?.photoURL||'app-icon.png'}" style="width:80px;height:80px;border-radius:50%;object-fit:cover;border:4px solid white;margin-bottom:12px;" onclick="uploadProfileImage()">
            <h3>${profile.displayName||profile.username||'User'}</h3>
            <p style="font-size:13px;">${profile.email} ${country.flag}</p>
            <p style="font-size:14px;font-weight:600;">${formatCurrency(profile.walletBalance||0)}</p>
            <span style="display:inline-block;background:rgba(255,255,255,0.3);padding:4px 12px;border-radius:12px;font-size:11px;text-transform:capitalize;">${profile.membership||'free'} Member</span>
        </div>
        
        ${!profile.isMerchant ? `
            <div style="background:white;border-radius:12px;padding:16px;margin-bottom:16px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
                <i class="fas fa-store" style="font-size:32px;color:#FFD700;"></i>
                <h4>Start Selling</h4>
                <p style="font-size:12px;color:#666;">$2/month</p>
                <button class="btn-gold mt-10" onclick="subscribeToMerchant()">Create Store</button>
            </div>
        ` : profile.storeActive ? `
            <div style="background:white;border-radius:12px;padding:16px;margin-bottom:16px;text-align:center;">
                <i class="fas fa-store-alt" style="font-size:32px;color:#00C851;"></i>
                <h4>Store Active</h4>
                <button class="btn-gold mt-10" onclick="navigateTo('merchant')">Manage Store</button>
            </div>
        ` : ''}
        
        <div style="background:#25D366;border-radius:16px;padding:24px;text-align:center;color:white;margin-bottom:16px;">
            <i class="fab fa-whatsapp" style="font-size:48px;margin-bottom:12px;display:block;"></i>
            <h3>Join Our WhatsApp Community</h3>
            <p style="font-size:13px;">Get updates on new products, campaigns, and support.</p>
            <a href="${WHATSAPP_COMMUNITY_LINK}" target="_blank" style="display:inline-block;background:white;color:#25D366;padding:12px 24px;border-radius:12px;text-decoration:none;font-weight:700;margin-top:8px;"><i class="fab fa-whatsapp"></i> Join Now</a>
        </div>
        
        <div style="background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
            <div class="profile-menu-item" onclick="navigateTo('orders')"><i class="fas fa-box"></i> Orders</div>
            <div class="profile-menu-item" onclick="navigateTo('wallet')"><i class="fas fa-wallet"></i> Wallet</div>
            <div class="profile-menu-item" onclick="navigateTo('affiliate')"><i class="fas fa-link"></i> Affiliates</div>
            <div class="profile-menu-item" onclick="navigateTo('merchant')"><i class="fas fa-store"></i> Merchant</div>
            <div class="profile-menu-item" onclick="navigateTo('settings')"><i class="fas fa-cog"></i> Settings</div>
            <div class="profile-menu-item" onclick="openSupport()"><i class="fas fa-headset"></i> Support</div>
            <div class="profile-menu-item" style="color:#FF4444;" onclick="signOut()"><i class="fas fa-sign-out-alt" style="color:#FF4444;"></i> Logout</div>
        </div>
        <p style="text-align:center;font-size:11px;color:#ccc;margin-top:20px;">Shoplify v${PLATFORM_CONFIG.appVersion} · Powered by Rev</p>
    `;
}

async function uploadProfileImage() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async function(e) {
        const file = e.target.files[0];
        if (!file) return;
        showLoader();
        try {
            const url = await uploadToCloudinary(file, 'image');
            await updateUserProfile({ photoURL: url });
            updateAllAvatars(url);
            hideLoader();
            showToast('Updated!','success');
            loadProfilePage();
        } catch (e) { hideLoader(); showToast('Error','error'); }
    };
    input.click();
}

function openSupport() {
    openModal(`
        <h3>📞 Support</h3>
        <a href="mailto:${ADMIN_EMAIL}" style="display:block;padding:14px;background:#f9f9f9;border-radius:10px;margin-bottom:8px;text-decoration:none;color:#333;"><i class="fas fa-envelope" style="color:#FFD700;"></i> ${ADMIN_EMAIL}</a>
        <a href="${WHATSAPP_COMMUNITY_LINK}" target="_blank" style="display:block;padding:14px;background:#f9f9f9;border-radius:10px;text-decoration:none;color:#333;"><i class="fab fa-whatsapp" style="color:#25D366;"></i> WhatsApp</a>
        <button class="btn-gold mt-10" onclick="closeModal()" style="width:100%;">Close</button>
    `);
}

window.uploadProfileImage = uploadProfileImage;
window.openSupport = openSupport;
console.log('✅ Profile module ready');