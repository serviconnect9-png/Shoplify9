// ============ Settings Module ============

async function loadSettings() {
    if (!requireAuth()) return;
    
    const profile = await refreshUserProfile();
    const container = document.getElementById('settings-content');
    if (!container) return;
    
    container.innerHTML = `
        <h3 style="margin-bottom:20px;">⚙️ Settings</h3>
        
        <!-- Username -->
        <div class="settings-section">
            <h4 class="settings-section-title">Profile</h4>
            <div class="settings-item" onclick="changeUsername()">
                <span class="settings-item-label">Username</span>
                <span class="settings-item-value">${profile.username || profile.displayName} <i class="fas fa-chevron-right" style="font-size:10px; color:#ccc;"></i></span>
            </div>
        </div>
        
        <!-- Theme -->
        <div class="settings-section">
            <h4 class="settings-section-title">Appearance</h4>
            <div class="settings-item">
                <span class="settings-item-label">Theme</span>
                <select id="setting-theme" onchange="changeTheme(this.value)" style="padding:8px; border-radius:8px; border:1px solid #ddd;">
                    <option value="light" ${profile.theme === 'light' ? 'selected' : ''}>Light</option>
                    <option value="dark" ${profile.theme === 'dark' ? 'selected' : ''}>Dark</option>
                    <option value="gold" ${profile.theme === 'gold' ? 'selected' : ''}>Gold</option>
                </select>
            </div>
            <div class="settings-item">
                <span class="settings-item-label">Text Size</span>
                <select id="setting-text-size" onchange="changeTextSize(this.value)" style="padding:8px; border-radius:8px; border:1px solid #ddd;">
                    <option value="small" ${profile.textSize === 'small' ? 'selected' : ''}>Small</option>
                    <option value="medium" ${profile.textSize === 'medium' ? 'selected' : ''}>Medium</option>
                    <option value="large" ${profile.textSize === 'large' ? 'selected' : ''}>Large</option>
                </select>
            </div>
        </div>
        
        <!-- Notifications -->
        <div class="settings-section">
            <h4 class="settings-section-title">Notifications</h4>
            <div class="settings-item">
                <span class="settings-item-label">Push Notifications</span>
                <label class="toggle-switch">
                    <input type="checkbox" ${profile.notifications !== false ? 'checked' : ''} 
                           onchange="toggleNotifications(this.checked)">
                    <span class="toggle-slider"></span>
                </label>
            </div>
        </div>
        
        <!-- About -->
        <div class="settings-section">
            <h4 class="settings-section-title">About</h4>
            <div class="settings-item">
                <span class="settings-item-label">Version</span>
                <span class="settings-item-value">${PLATFORM_CONFIG.appVersion}</span>
            </div>
            <div class="settings-item" onclick="showAboutInfo()">
                <span class="settings-item-label">About ServiConnect</span>
                <span class="settings-item-value"><i class="fas fa-chevron-right" style="font-size:10px; color:#ccc;"></i></span>
            </div>
        </div>
        
        <!-- Account -->
        <div class="settings-section">
            <h4 class="settings-section-title">Account</h4>
            <div class="settings-item" onclick="signOut()" style="color:#FF4444;">
                <span class="settings-item-label" style="color:#FF4444;">Sign Out</span>
                <i class="fas fa-sign-out-alt" style="color:#FF4444;"></i>
            </div>
        </div>
    `;
}

async function changeUsername() {
    const currentUsername = APP_STATE.userProfile?.username || '';
    
    const modalContent = `
        <h3 style="margin-bottom:16px;">Change Username</h3>
        <div class="form-group">
            <label>New Username</label>
            <input type="text" id="new-username" value="${currentUsername}" placeholder="Enter username" maxlength="30">
        </div>
        <p style="font-size:11px; color:#999; margin:8px 0;">3-30 characters, letters and numbers only</p>
        <div style="display:flex; gap:10px; margin-top:12px;">
            <button class="btn-outline" style="flex:1; color:#333; border-color:#ccc;" onclick="closeModal()">Cancel</button>
            <button class="btn-gold" style="flex:1;" onclick="saveUsername()">Save</button>
        </div>
    `;
    openModal(modalContent);
}

async function saveUsername() {
    const newUsername = document.getElementById('new-username')?.value?.trim();
    
    if (!newUsername || newUsername.length < 3) {
        showToast('Username must be at least 3 characters', 'error');
        return;
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(newUsername)) {
        showToast('Only letters, numbers and underscores allowed', 'error');
        return;
    }
    
    await updateUserProfile({ username: newUsername });
    closeModal();
    showToast('Username updated!', 'success');
    loadSettings();
}

async function changeTheme(theme) {
    await updateUserProfile({ theme });
    applyTheme(theme);
    showToast('Theme updated', 'success');
}

function applyTheme(theme) {
    const root = document.documentElement;
    
    switch (theme) {
        case 'dark':
            root.style.setProperty('--white', '#1A1A1A');
            root.style.setProperty('--light-gray', '#2A2A2A');
            root.style.setProperty('--text-primary', '#FFFFFF');
            root.style.setProperty('--text-secondary', '#CCCCCC');
            document.body.style.background = '#1A1A1A';
            break;
        case 'gold':
            root.style.setProperty('--gold', '#FFD700');
            root.style.setProperty('--white', '#FFFDF5');
            document.body.style.background = '#FFFDF5';
            break;
        default: // light
            root.style.setProperty('--white', '#FFFFFF');
            root.style.setProperty('--light-gray', '#F5F5F5');
            root.style.setProperty('--text-primary', '#1A1A1A');
            root.style.setProperty('--text-secondary', '#666666');
            document.body.style.background = '#FFFFFF';
    }
}

async function changeTextSize(size) {
    await updateUserProfile({ textSize: size });
    
    const sizes = {
        'small': '14px',
        'medium': '16px',
        'large': '18px'
    };
    
    document.documentElement.style.fontSize = sizes[size] || '16px';
    showToast('Text size updated', 'success');
}

async function toggleNotifications(enabled) {
    await updateUserProfile({ notifications: enabled });
    showToast(enabled ? 'Notifications enabled' : 'Notifications disabled', 'success');
}

function showAboutInfo() {
    const modalContent = `
        <div style="text-align:center;">
            <img src="assets/app-icon.png" width="80" height="80" style="border-radius:18px; margin-bottom:16px;">
            <h3>ServiConnect</h3>
            <p style="color:#666;">Global Affiliate Marketplace</p>
            <p style="font-size:13px; color:#999; margin:8px 0;">Version ${PLATFORM_CONFIG.appVersion}</p>
            
            <div style="background:#f9f9f9; border-radius:12px; padding:16px; margin:16px 0; text-align:left;">
                <p style="font-size:13px;">🏪 Marketplace for merchants</p>
                <p style="font-size:13px;">🔗 Affiliate marketing platform</p>
                <p style="font-size:13px;">💰 Wallet & withdrawal system</p>
                <p style="font-size:13px;">🛡️ Escrow protection</p>
                <p style="font-size:13px;">🌍 180+ countries supported</p>
            </div>
            
            <p style="font-size:11px; color:#ccc;">© 2024 ServiConnect. All rights reserved.</p>
            
            <button class="btn-gold mt-10" onclick="closeModal()" style="width:100%;">Close</button>
        </div>
    `;
    openModal(modalContent);
}

// Apply saved settings on load
(function applySavedSettings() {
    const theme = APP_STATE.userProfile?.theme || 'light';
    const textSize = APP_STATE.userProfile?.textSize || 'medium';
    
    if (theme !== 'light') applyTheme(theme);
    
    const sizes = { 'small': '14px', 'medium': '16px', 'large': '18px' };
    if (textSize !== 'medium') {
        document.documentElement.style.fontSize = sizes[textSize] || '16px';
    }
})();