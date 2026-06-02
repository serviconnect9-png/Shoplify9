// ============ Store Setup Module ============

async function loadStoreSetup() {
    if (!requireAuth()) return;
    
    const isMerchant = await checkSubscription('merchant');
    if (!isMerchant) {
        showToast('Subscribe as merchant first', 'warning');
        navigateTo('profile');
        return;
    }
    
    const container = document.getElementById('store-setup-content');
    if (!container) return;
    
    const profile = await refreshUserProfile();
    
    container.innerHTML = `
        <h3 style="margin-bottom:8px;">🏪 Store Setup</h3>
        <p style="color:#666; margin-bottom:20px;">Choose a beautiful template for your store</p>
        
        <!-- Template Selection -->
        <div class="store-template-grid">
            ${STORE_TEMPLATES.map(template => `
                <div class="store-template-card ${profile.storeTemplate === template.id ? 'selected' : ''}" 
                     onclick="selectTemplate('${template.id}', this)"
                     style="border:2px solid ${profile.storeTemplate === template.id ? '#FFD700' : '#ddd'}; 
                            border-radius:12px; overflow:hidden; cursor:pointer; transition:all 0.3s;">
                    <div style="background:${template.color}; padding:40px 20px; text-align:center; 
                                aspect-ratio:4/3; display:flex; align-items:center; justify-content:center;">
                        <span style="font-size:48px;">${template.icon}</span>
                    </div>
                    <div style="padding:12px; text-align:center;">
                        <p style="font-weight:600;">${template.name}</p>
                        <p style="font-size:11px; color:#999;">${template.description}</p>
                    </div>
                </div>
            `).join('')}
        </div>
        
        <!-- Store Name -->
        <div class="form-group" style="margin-top:20px;">
            <label>Store Display Name</label>
            <input type="text" id="store-name" value="${profile.storeName || profile.displayName + "'s Store' || 'My Store'}" 
                   placeholder="Enter store name">
        </div>
        
        <!-- Current Selection -->
        ${profile.storeTemplate ? `
            <div style="background:#E8F5E9; padding:12px; border-radius:10px; margin-top:16px; text-align:center;">
                <p style="color:#2E7D32;">✅ Template selected: <strong>${STORE_TEMPLATES.find(t => t.id === profile.storeTemplate)?.name || profile.storeTemplate}</strong></p>
                ${profile.storeActive ? '<p style="font-size:12px; color:#666;">Your store is active and visible</p>' : ''}
            </div>
        ` : ''}
        
        <button class="btn-gold mt-20" onclick="saveStoreSetup()" style="width:100%;">
            ${profile.storeActive ? 'Update Store' : 'Launch Store'}
        </button>
        
        ${profile.storeActive ? `
            <button class="btn-gold mt-10" onclick="navigateTo('merchant')" style="width:100%; background:#333;">
                Go to Dashboard
            </button>
        ` : ''}
    `;
}

let selectedTemplateId = null;

function selectTemplate(templateId, element) {
    // Update visual selection
    document.querySelectorAll('.store-template-card').forEach(card => {
        card.style.border = '2px solid #ddd';
    });
    element.style.border = '2px solid #FFD700';
    element.style.boxShadow = '0 0 0 3px rgba(255,215,0,0.2)';
    
    selectedTemplateId = templateId;
}

async function saveStoreSetup() {
    if (!requireAuth()) return;
    
    const profile = await refreshUserProfile();
    const templateId = selectedTemplateId || profile.storeTemplate;
    
    if (!templateId) {
        showToast('Please select a template', 'warning');
        return;
    }
    
    const storeName = document.getElementById('store-name')?.value?.trim() || 
                      (profile.displayName || 'User') + "'s Store";
    
    showLoader();
    
    try {
        await updateUserProfile({
            storeTemplate: templateId,
            storeName: storeName,
            storeActive: true
        });
        
        await saveToFirestore('stores', APP_STATE.currentUser.uid, {
            userId: APP_STATE.currentUser.uid,
            templateId: templateId,
            storeName: storeName,
            isActive: true,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        hideLoader();
        showToast('✅ Store launched successfully!', 'success');
        navigateTo('merchant');
        
    } catch (error) {
        hideLoader();
        console.error('Store setup error:', error);
        showToast('Error setting up store', 'error');
    }
}