// ============ Settings Module ============

async function loadSettings() {
    if (!requireAuth()) return;
    const profile = await refreshUserProfile();
    const container = document.getElementById('settings-content');
    if (!container) return;
    
    container.innerHTML = `
        <h3>⚙️ Settings</h3>
        <div class="settings-section"><h4>Profile</h4>
            <div class="settings-item" onclick="changeUsername()"><span>Username</span><span>${profile.username||profile.displayName} <i class="fas fa-chevron-right" style="font-size:10px;"></i></span></div>
        </div>
        <div class="settings-section"><h4>Appearance</h4>
            <div class="settings-item"><span>Theme</span><select id="setting-theme" onchange="changeTheme(this.value)"><option value="light" ${profile.theme==='light'?'selected':''}>Light</option><option value="dark" ${profile.theme==='dark'?'selected':''}>Dark</option></select></div>
            <div class="settings-item"><span>Text Size</span><select id="setting-text-size" onchange="changeTextSize(this.value)"><option value="small" ${profile.textSize==='small'?'selected':''}>Small</option><option value="medium" ${profile.textSize==='medium'?'selected':''}>Medium</option><option value="large" ${profile.textSize==='large'?'selected':''}>Large</option></select></div>
        </div>
        <div class="settings-section"><h4>Notifications</h4>
            <div class="settings-item"><span>Push Notifications</span><label class="toggle-switch"><input type="checkbox" ${profile.notifications!==false?'checked':''} onchange="toggleNotifications(this.checked)"><span class="toggle-slider"></span></label></div>
        </div>
        <div class="settings-section"><h4>About</h4>
            <div class="settings-item"><span>Version</span><span>${PLATFORM_CONFIG.appVersion}</span></div>
            <div class="settings-item" onclick="showAbout()"><span>About Shoplify</span><i class="fas fa-chevron-right" style="font-size:10px;"></i></div>
        </div>
        <div class="settings-section"><h4>Account</h4>
            <div class="settings-item" onclick="signOut()" style="color:#FF4444;"><span style="color:#FF4444;">Sign Out</span><i class="fas fa-sign-out-alt" style="color:#FF4444;"></i></div>
        </div>
    `;
}

async function changeUsername() {
    openModal(`
        <h3>Change Username</h3>
        <div class="form-group"><input type="text" id="new-username" value="${APP_STATE.userProfile?.username||''}" maxlength="30"></div>
        <div style="display:flex;gap:10px;margin-top:12px;"><button class="btn-outline" style="flex:1;" onclick="closeModal()">Cancel</button><button class="btn-gold" style="flex:1;" onclick="saveUsername()">Save</button></div>
    `);
}

async function saveUsername() {
    const name = document.getElementById('new-username')?.value?.trim();
    if (!name||name.length<3) { showToast('Min 3 characters','error'); return; }
    await updateUserProfile({ username: name });
    closeModal();
    showToast('Updated!','success');
    loadSettings();
}

async function changeTheme(theme) {
    await updateUserProfile({ theme });
    document.documentElement.style.setProperty('--white', theme==='dark'?'#1A1A1A':'#FFFFFF');
    document.documentElement.style.setProperty('--text-primary', theme==='dark'?'#FFFFFF':'#1A1A1A');
    document.body.style.background = theme==='dark'?'#1A1A1A':'#FFFFFF';
    showToast('Theme updated','success');
}

async function changeTextSize(size) {
    await updateUserProfile({ textSize: size });
    document.documentElement.style.fontSize = { small:'14px', medium:'16px', large:'18px' }[size]||'16px';
    showToast('Text size updated','success');
}

async function toggleNotifications(on) {
    await updateUserProfile({ notifications: on });
    showToast(on?'On':'Off','success');
}

function showAbout() {
    openModal(`<div style="text-align:center;"><img src="app-icon.png" width="80" height="80" style="border-radius:18px;"><h3>Shoplify</h3><p>Global Affiliate Marketplace</p><p style="font-size:13px;">v${PLATFORM_CONFIG.appVersion}</p><p style="font-size:12px;color:#666;">180+ Countries · Escrow Protection · Affiliate Marketing</p><p style="font-size:11px;">Powered by Rev</p><button class="btn-gold mt-10" onclick="closeModal()" style="width:100%;">Close</button></div>`);
}

window.changeUsername = changeUsername;
window.saveUsername = saveUsername;
window.changeTheme = changeTheme;
window.changeTextSize = changeTextSize;
window.toggleNotifications = toggleNotifications;
window.showAbout = showAbout;
console.log('✅ Settings module ready');