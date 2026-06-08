// customerservice.js - Customer Service Panel
async function loadCustomerServicePanel() {
    if (!['customerservice', 'admin'].includes(APP.userProfile?.accountType)) {
        showToast('Access denied', 'error');
        navigateTo('home');
        return;
    }
    
    const container = document.getElementById('cs-content');
    if (!container) return;
    
    try {
        const openDisputes = await db.collection('disputes')
            .where('status', '==', 'open')
            .get();
        
        const pendingVerifications = await db.collection('verification_requests')
            .where('status', '==', 'pending')
            .get();
        
        container.innerHTML = `
            <div class="cs-stats">
                <div class="stat-card">
                    <div class="stat-value">${openDisputes.size}</div>
                    <div class="stat-label">Open Disputes</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${pendingVerifications.size}</div>
                    <div class="stat-label">Pending Verifications</div>
                </div>
            </div>
            
            <button class="btn-outline btn-full" onclick="navigateTo('disputes-manage')">
                📋 Manage Disputes
            </button>
            
            <h4 style="margin-top:20px;">Quick Actions</h4>
            <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:10px;">
                <button class="btn-small btn-warning" onclick="flagMerchant()">🚩 Flag Merchant</button>
                <button class="btn-small btn-danger" onclick="requestBan()">⛔ Request Ban</button>
                <button class="btn-small btn-success" onclick="approveVerification()">✅ Approve Verification</button>
            </div>
        `;
    } catch (error) {
        console.error('CS panel error:', error);
    }
}

async function loadDisputesManagement() {
    const container = document.getElementById('disputes-content');
    if (!container) return;
    
    try {
        const snapshot = await db.collection('disputes')
            .orderBy('createdAt', 'desc')
            .limit(50)
            .get();
        
        if (snapshot.empty) {
            container.innerHTML = '<p style="text-align:center;padding:40px;">No disputes found</p>';
            return;
        }
        
        container.innerHTML = '';
        snapshot.forEach(doc => {
            const dispute = { id: doc.id, ...doc.data() };
            container.innerHTML += `
                <div class="dispute-card">
                    <div class="dispute-header">
                        <span><strong>${dispute.userEmail || 'Unknown'}</strong></span>
                        <span style="color:${dispute.status === 'open' ? 'var(--red)' : 'var(--green)'};">
                            ${dispute.status.toUpperCase()}
                        </span>
                    </div>
                    <p style="font-size:14px;">Type: ${dispute.type.replace('_', ' ')}</p>
                    <p style="font-size:14px;color:#666;">${dispute.description || 'No description'}</p>
                    <div class="dispute-actions">
                        <button class="btn-small btn-success" onclick="resolveDispute('${dispute.id}', 'refund')">Refund Buyer</button>
                        <button class="btn-small btn-warning" onclick="resolveDispute('${dispute.id}', 'release')">Release to Merchant</button>
                        <button class="btn-small btn-danger" onclick="resolveDispute('${dispute.id}', 'dismiss')">Dismiss</button>
                    </div>
                </div>`;
        });
    } catch (error) {
        console.error('Disputes error:', error);
    }
}

async function resolveDispute(disputeId, resolution) {
    try {
        await db.collection('disputes').doc(disputeId).update({
            status: 'resolved',
            resolution: resolution,
            resolvedBy: APP.currentUser.uid,
            resolvedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        showToast(`Dispute resolved: ${resolution}`, 'success');
        loadDisputesManagement();
    } catch (error) {
        showToast('Failed to resolve dispute', 'error');
    }
}