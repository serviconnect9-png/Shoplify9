// ============ Store Setup Module ============

async function loadStoreSetup() {
    if (!requireAuth()) return;
    const isM = await checkSubscription('merchant');
    if (!isM) { showToast('Subscribe first','warning'); navigateTo('profile'); return; }
    
    const profile = await refreshUserProfile();
    const container = document.getElementById('store-setup-content');
    if (!container) return;
    
    container.innerHTML = `
        <h3>🏪 Store Setup</h3>
        <p style="color:#666;">Choose a template for your store</p>
        <div class="store-template-grid">
            ${STORE_TEMPLATES.map(t => `
                <div class="store-template-card" onclick="selectTemplate('${t.id}',this)" style="border:2px solid ${profile.storeTemplate===t.id?'#FFD700':'#ddd'};border-radius:12px;overflow:hidden;cursor:pointer;">
                    <div style="background:${t.color};padding:40px 20px;text-align:center;aspect-ratio:4/3;display:flex;align-items:center;justify-content:center;"><span style="font-size:48px;">${t.icon}</span></div>
                    <div style="padding:12px;text-align:center;"><p style="font-weight:600;">${t.name}</p><p style="font-size:11px;color:#999;">${t.description}</p></div>
                </div>
            `).join('')}
        </div>
        <div class="form-group" style="margin-top:20px;"><label>Store Name</label><input type="text" id="store-name" value="${profile.storeName||(profile.displayName||'My')+' Store'}"></div>
        ${profile.storeTemplate ? '<div style="background:#E8F5E9;padding:12px;border-radius:10px;margin-top:16px;text-align:center;"><p style="color:#2E7D32;">✅ Template: '+STORE_TEMPLATES.find(t=>t.id===profile.storeTemplate)?.name+'</p></div>' : ''}
        <button class="btn-gold mt-20" onclick="saveStoreSetup()" style="width:100%;">${profile.storeActive?'Update Store':'Launch Store'}</button>
        ${profile.storeActive ? '<button class="btn-gold mt-10" onclick="navigateTo(\'merchant\')" style="width:100%;background:#333;">Dashboard</button>' : ''}
    `;
}

let selectedTemplate = null;
function selectTemplate(id, el) {
    document.querySelectorAll('.store-template-card').forEach(c => { c.style.border = '2px solid #ddd'; c.style.boxShadow = 'none'; });
    el.style.border = '2px solid #FFD700';
    el.style.boxShadow = '0 0 0 3px rgba(255,215,0,0.2)';
    selectedTemplate = id;
}

async function saveStoreSetup() {
    if (!requireAuth()) return;
    const profile = await refreshUserProfile();
    const templateId = selectedTemplate || profile.storeTemplate;
    if (!templateId) { showToast('Select a template','warning'); return; }
    const storeName = document.getElementById('store-name')?.value?.trim() || (profile.displayName||'My')+' Store';
    showLoader();
    try {
        await updateUserProfile({ storeTemplate: templateId, storeName, storeActive: true });
        await saveToFirestore('stores', APP_STATE.currentUser.uid, { userId: APP_STATE.currentUser.uid, templateId, storeName, isActive: true, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
        hideLoader();
        showToast('✅ Store launched!','success');
        navigateTo('merchant');
    } catch (e) { hideLoader(); showToast('Error','error'); }
}

window.selectTemplate = selectTemplate;
window.saveStoreSetup = saveStoreSetup;
console.log('✅ Store setup module ready');