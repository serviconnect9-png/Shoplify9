// ============ Disputes Module ============

async function openDispute(orderId) {
    if (!requireAuth()) return;
    
    const order = await getFromFirestore('orders', orderId);
    if (!order) {
        showToast('Order not found', 'error');
        return;
    }
    
    const modalContent = `
        <h3 style="margin-bottom:16px;">🚨 Report Problem</h3>
        <p style="color:#666; margin-bottom:12px; font-size:13px;">
            Order #${orderId.slice(-10).toUpperCase()} - ${formatCurrency(order.total)}
        </p>
        
        <div class="form-group">
            <label>Issue Type</label>
            <select id="dispute-type">
                <option value="not_received">Item Not Received</option>
                <option value="wrong_item">Wrong Item Received</option>
                <option value="damaged">Damaged Item</option>
                <option value="incomplete">Incomplete Order</option>
                <option value="other">Other</option>
            </select>
        </div>
        
        <div class="form-group">
            <label>Describe the Problem</label>
            <textarea id="dispute-description" rows="4" placeholder="Please describe what happened..."></textarea>
        </div>
        
        <div class="form-group">
            <label>Upload Evidence (optional)</label>
            <input type="file" id="dispute-evidence" accept="image/*" multiple>
            <p style="font-size:10px; color:#999;">Photos help us resolve disputes faster</p>
            <div id="dispute-previews" style="display:flex; flex-wrap:wrap; gap:8px; margin-top:8px;"></div>
        </div>
        
        <div style="display:flex; gap:10px; margin-top:16px;">
            <button class="btn-outline" style="flex:1; color:#333; border-color:#ccc;" onclick="closeModal()">Cancel</button>
            <button class="btn-danger" style="flex:1;" onclick="submitDispute('${orderId}')">Submit Report</button>
        </div>
    `;
    openModal(modalContent);
    
    // Setup evidence preview
    document.getElementById('dispute-evidence')?.addEventListener('change', function(e) {
        const previews = document.getElementById('dispute-previews');
        if (!previews) return;
        previews.innerHTML = '';
        Array.from(e.target.files).slice(0, 5).forEach(file => {
            const reader = new FileReader();
            reader.onload = (ev) => {
                previews.innerHTML += `
                    <img src="${ev.target.result}" style="width:70px; height:70px; object-fit:cover; border-radius:8px;">`;
            };
            reader.readAsDataURL(file);
        });
    });
}

async function submitDispute(orderId) {
    const type = document.getElementById('dispute-type')?.value;
    const description = document.getElementById('dispute-description')?.value?.trim();
    const evidenceFiles = document.getElementById('dispute-evidence')?.files || [];
    
    if (!description) {
        showToast('Please describe the problem', 'error');
        return;
    }
    
    closeModal();
    showLoader();
    
    try {
        // Upload evidence
        const evidenceUrls = [];
        for (let i = 0; i < Math.min(evidenceFiles.length, 5); i++) {
            const url = await uploadToCloudinary(evidenceFiles[i], 'image');
            evidenceUrls.push(url);
        }
        
        const disputeId = generateId('dsp');
        
        await saveToFirestore('disputes', disputeId, {
            orderId,
            userId: APP_STATE.currentUser.uid,
            userEmail: APP_STATE.currentUser.email,
            type,
            description,
            evidence: evidenceUrls,
            status: 'open',
            resolution: '',
            resolvedBy: '',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Update order status
        await saveToFirestore('orders', orderId, {
            disputed: true,
            disputeId,
            status: 'disputed',
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Notify admin
        await sendNotification(ADMIN_EMAIL, 'New Dispute Filed',
            `Dispute for order #${orderId.slice(-8)}: ${type}`, '🚨');
        
        hideLoader();
        showToast('✅ Dispute filed. Admin will review.', 'success');
        loadOrders();
        
    } catch (error) {
        hideLoader();
        console.error('Dispute error:', error);
        showToast('Error filing dispute', 'error');
    }
}