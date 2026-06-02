// ============ Profile Module ============

async function loadProfilePage() {
    if (!requireAuth()) return;
    
    const profile = await refreshUserProfile();
    const container = document.getElementById('profile-content');
    if (!container) return;
    
    container.innerHTML = `
        <!-- Profile Header Card -->
        <div class="profile-header-card" style="background:linear-gradient(135deg, #FFD700, #E6C200); 
                    border-radius:16px; padding:24px; text-align:center; color:white; margin-bottom:20px;">
            <img src="${profile.photoURL || APP_STATE.currentUser?.photoURL || 'app-icon.png'}" 
                 alt="Profile" class="profile-avatar-large" 
                 style="width:80px; height:80px; border-radius:50%; object-fit:cover; border:4px solid white; margin-bottom:12px;"
                 onclick="uploadProfileImage()">
            <h3 style="font-size:20px; font-weight:700;">${profile.displayName || profile.username || 'User'}</h3>
            <p style="font-size:13px; opacity:0.9;">${profile.email || APP_STATE.currentUser?.email}</p>
            <p style="font-size:14px; font-weight:600; margin-top:4px;">${formatCurrency(profile.walletBalance || 0)}</p>
            <span style="display:inline-block; background:rgba(255,255,255,0.3); padding:4px 12px; 
                         border-radius:12px; font-size:11px; margin-top:8px; text-transform:capitalize;">
                ${profile.membership || 'free'} Member
            </span>
        </div>
        
        <!-- Store Purchase Card (if not merchant) -->
        ${!profile.isMerchant ? `
            <div style="background:white; border-radius:12px; padding:16px; margin-bottom:16px; 
                        box-shadow:0 2px 8px rgba(0,0,0,0.05); text-align:center;">
                <i class="fas fa-store" style="font-size:32px; color:#FFD700;"></i>
                <h4 style="margin:8px 0;">Start Selling</h4>
                <p style="font-size:12px; color:#666;">Create your store for just $2/month</p>
                <button class="btn-gold mt-10" onclick="subscribeToMerchant()">Create Store</button>
            </div>
        ` : profile.storeActive ? `
            <div style="background:white; border-radius:12px; padding:16px; margin-bottom:16px; 
                        box-shadow:0 2px 8px rgba(0,0,0,0.05); text-align:center;">
                <i class="fas fa-store-alt" style="font-size:32px; color:#00C851;"></i>
                <h4 style="margin:8px 0;">Your Store is Active</h4>
                <button class="btn-gold mt-10" onclick="navigateTo('merchant')">Manage Store</button>
            </div>
        ` : ''}
        
        <!-- WhatsApp Community Card -->
        <div class="whatsapp-card" style="background:#25D366; border-radius:16px; padding:24px; 
                    text-align:center; color:white; margin-bottom:16px;">
            <i class="fab fa-whatsapp" style="font-size:48px; margin-bottom:12px; display:block;"></i>
            <h3>Join Our WhatsApp Community</h3>
            <p style="font-size:13px; opacity:0.9; margin:8px 0;">
                Get updates on new products, affiliate campaigns, announcements and support.
            </p>
            <a href="${WHATSAPP_COMMUNITY_LINK}" target="_blank" 
               style="display:inline-block; background:white; color:#25D366; padding:12px 24px; 
                      border-radius:12px; text-decoration:none; font-weight:700; margin-top:8px;">
                <i class="fab fa-whatsapp"></i> Join Now
            </a>
        </div>
        
        <!-- Menu Items -->
        <div class="profile-menu" style="background:white; border-radius:12px; overflow:hidden; 
                    box-shadow:0 2px 8px rgba(0,0,0,0.05);">
            <div class="profile-menu-item" onclick="navigateTo('profile')">
                <i class="fas fa-user"></i> My Profile
            </div>
            <div class="profile-menu-item" onclick="navigateTo('orders')">
                <i class="fas fa-box"></i> Orders
            </div>
            <div class="profile-menu-item" onclick="navigateTo('wallet')">
                <i class="fas fa-wallet"></i> Wallet
            </div>
            <div class="profile-menu-item" onclick="navigateTo('transactions')">
                <i class="fas fa-history"></i> Withdrawals
            </div>
            <div class="profile-menu-item" onclick="navigateTo('affiliate')">
                <i class="fas fa-link"></i> Affiliates
            </div>
            <div class="profile-menu-item" onclick="navigateTo('settings')">
                <i class="fas fa-cog"></i> Settings
            </div>
            <div class="profile-menu-item" onclick="openSupport()">
                <i class="fas fa-headset"></i> Support
            </div>
            <div class="profile-menu-item" style="color:#FF4444;" onclick="signOut()">
                <i class="fas fa-sign-out-alt" style="color:#FF4444;"></i> Logout
            </div>
        </div>
        
        <p style="text-align:center; font-size:11px; color:#ccc; margin-top:20px;">
            ServiConnect v${PLATFORM_CONFIG.appVersion}
        </p>
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
            showToast('Profile image updated!', 'success');
            loadProfilePage();
        } catch (error) {
            hideLoader();
            showToast('Upload failed', 'error');
        }
    };
    input.click();
}

function openSupport() {
    const modalContent = `
        <h3 style="margin-bottom:16px;">📞 Support</h3>
        <p style="color:#666; margin-bottom:16px;">Need help? Contact us through any of these channels:</p>
        
        <a href="mailto:${ADMIN_EMAIL}" style="display:block; padding:14px; background:#f9f9f9; 
                   border-radius:10px; margin-bottom:8px; text-decoration:none; color:#333;">
            <i class="fas fa-envelope" style="color:#FFD700; margin-right:8px;"></i>
            Email: ${ADMIN_EMAIL}
        </a>
        
        <a href="${WHATSAPP_COMMUNITY_LINK}" target="_blank" 
           style="display:block; padding:14px; background:#f9f9f9; border-radius:10px; 
                  margin-bottom:8px; text-decoration:none; color:#333;">
            <i class="fab fa-whatsapp" style="color:#25D366; margin-right:8px;"></i>
            WhatsApp Community
        </a>
        
        <p style="font-size:11px; color:#999; text-align:center; margin-top:12px;">
            Response time: Within 24 hours
        </p>
        
        <button class="btn-gold mt-10" onclick="closeModal()" style="width:100%;">Close</button>
    `;
    openModal(modalContent);
}