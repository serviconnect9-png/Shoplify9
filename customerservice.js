// customerservice.js - COMPLETE WORKING VERSION
console.log('✅ customerservice.js loaded');

async function loadCustomerServicePanel() {
    const container = document.getElementById('cs-content');
    if (!container) {
        console.error('❌ cs-content container not found');
        return;
    }
    
    container.innerHTML = '<p style="text-align:center;padding:40px;">Loading customer service...</p>';
    
    try {
        // Get open disputes count
        const disputesSnap = await db.collection('disputes').where('status', '==', 'open').get();
        const openDisputes = disputesSnap.size;
        
        // Get pending verifications
        const verifySnap = await db.collection('verification_requests').where('status', '==', 'pending').get();
        const pendingVerifications = verifySnap.size;
        
        container.innerHTML = `
            <div style="padding:15px;">
                <h3>🎧 Customer Service</h3>
                <p style="color:#666;margin-bottom:15px;">We're here to help you</p>
                
                <div class="affiliate-stats" style="margin-bottom:20px;">
                    <div class="stat-card">
                        <div class="stat-value">${openDisputes}</div>
                        <div class="stat-label">Open Disputes</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${pendingVerifications}</div>
                        <div class="stat-label">Pending Verifications</div>
                    </div>
                </div>
                
                <div style="background:white;padding:20px;border-radius:12px;box-shadow:var(--shadow);margin-bottom:15px;">
                    <h4 style="margin-bottom:10px;">📋 Submit a Support Ticket</h4>
                    <div class="input-group">
                        <label>Subject</label>
                        <input type="text" id="cs-subject" class="input-field" placeholder="What do you need help with?">
                    </div>
                    <div class="input-group" style="margin-top:10px;">
                        <label>Category</label>
                        <select id="cs-category" class="input-field">
                            <option value="">Select category...</option>
                            <option value="order">Order Issue</option>
                            <option value="payment">Payment Problem</option>
                            <option value="account">Account Help</option>
                            <option value="technical">Technical Issue</option>
                            <option value="dispute">Dispute</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div class="input-group" style="margin-top:10px;">
                        <label>Description</label>
                        <textarea id="cs-description" class="input-field" rows="4" placeholder="Describe your issue in detail..."></textarea>
                    </div>
                    <button class="btn-gold btn-full" style="margin-top:15px;" onclick="submitSupportTicket()">📤 Submit Ticket</button>
                </div>
                
                <div style="background:white;padding:20px;border-radius:12px;box-shadow:var(--shadow);margin-bottom:15px;">
                    <h4 style="margin-bottom:10px;">📞 Contact Us</h4>
                    <p style="font-size:13px;color:#666;">Email: <strong>${APP.csEmail || 'support@oneshoplify.com'}</strong></p>
                    <p style="font-size:13px;color:#666;">WhatsApp Community: <a href="${APP.whatsappCommunity}" target="_blank" style="color:#25D366;">Join Community</a></p>
                    <p style="font-size:13px;color:#666;">Response time: Within 24 hours</p>
                </div>
                
                <div style="background:white;padding:20px;border-radius:12px;box-shadow:var(--shadow);">
                    <h4 style="margin-bottom:10px;">❓ Frequently Asked Questions</h4>
                    <div style="font-size:13px;color:#666;line-height:2;">
                        <p><strong>Q: How do I track my order?</strong></p>
                        <p>A: Go to My Orders and click "Track" on your order.</p>
                        <p style="margin-top:10px;"><strong>Q: How do I deposit funds?</strong></p>
                        <p>A: Go to Wallet and click "Deposit" to add funds via Flutterwave.</p>
                        <p style="margin-top:10px;"><strong>Q: How does escrow work?</strong></p>
                        <p>A: Payment is held securely until you confirm delivery of your order.</p>
                        <p style="margin-top:10px;"><strong>Q: How do I become a dropshipper?</strong></p>
                        <p>A: Go to Profile and click "Become a Dropshipper" to choose a plan.</p>
                        <p style="margin-top:10px;"><strong>Q: How do I open a dispute?</strong></p>
                        <p>A: Go to your order and click "Open Dispute" if there's an issue.</p>
                    </div>
                </div>
            </div>
        `;
        
        console.log('✅ Customer service loaded');
        
    } catch (error) {
        console.error('❌ CS error:', error);
        container.innerHTML = '<p style="text-align:center;padding:40px;">Error loading customer service</p>';
    }
}

async function submitSupportTicket() {
    const subject = document.getElementById('cs-subject')?.value?.trim();
    const category = document.getElementById('cs-category')?.value;
    const description = document.getElementById('cs-description')?.value?.trim();
    
    if (!subject) { showToast('Please enter a subject', 'error'); return; }
    if (!category) { showToast('Please select a category', 'error'); return; }
    if (!description) { showToast('Please describe your issue', 'error'); return; }
    
    if (!APP.userProfile) {
        showToast('Please login first', 'error');
        return;
    }
    
    showLoader();
    
    try {
        await db.collection('support_tickets').add({
            userId: APP.userProfile.uid,
            userEmail: APP.userProfile.email || '',
            userName: APP.userProfile.displayName || APP.userProfile.username,
            subject,
            category,
            description,
            status: 'open',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        hideLoader();
        showToast('Support ticket submitted! We will respond within 24 hours. ✅', 'success');
        
        // Clear form
        document.getElementById('cs-subject').value = '';
        document.getElementById('cs-category').value = '';
        document.getElementById('cs-description').value = '';
        
    } catch (error) {
        hideLoader();
        console.error('Ticket error:', error);
        showToast('Failed to submit ticket', 'error');
    }
}

async function loadDisputesManagement() {
    const container = document.getElementById('disputes-content');
    if (!container) return;
    
    container.innerHTML = '<p style="text-align:center;padding:40px;">Loading disputes...</p>';
    
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
            const statusColor = dispute.status === 'open' ? '#FF4444' : dispute.status === 'resolved' ? '#4CAF50' : '#FFA000';
            
            container.innerHTML += `
                <div class="dispute-card" style="margin-bottom:10px;">
                    <div class="dispute-header">
                        <span><strong>${dispute.userEmail || 'Unknown'}</strong></span>
                        <span style="color:${statusColor};font-weight:600;">${(dispute.status || 'open').toUpperCase()}</span>
                    </div>
                    <p style="font-size:14px;margin-top:5px;">Type: ${(dispute.type || '').replace(/_/g, ' ')}</p>
                    <p style="font-size:14px;color:#666;">${dispute.description || 'No description'}</p>
                    ${dispute.status === 'open' ? `
                        <div class="dispute-actions" style="margin-top:10px;">
                            <button class="btn-small btn-success" onclick="resolveDispute('${dispute.id}', 'refund')">Refund Buyer</button>
                            <button class="btn-small btn-warning" onclick="resolveDispute('${dispute.id}', 'release')">Release to Merchant</button>
                            <button class="btn-small btn-danger" onclick="resolveDispute('${dispute.id}', 'dismiss')">Dismiss</button>
                        </div>
                    ` : ''}
                    <div style="font-size:11px;color:#999;margin-top:5px;">${getTimeAgo(dispute.createdAt)}</div>
                </div>`;
        });
        
    } catch (error) {
        console.error('Disputes error:', error);
        container.innerHTML = '<p style="text-align:center;padding:40px;">Error loading disputes</p>';
    }
}

async function resolveDispute(disputeId, resolution) {
    showLoader();
    try {
        await db.collection('disputes').doc(disputeId).update({
            status: 'resolved',
            resolution: resolution,
            resolvedBy: APP.userProfile?.uid || 'admin',
            resolvedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        hideLoader();
        showToast(`Dispute resolved: ${resolution}`, 'success');
        loadDisputesManagement();
        
    } catch (error) {
        hideLoader();
        showToast('Failed to resolve dispute', 'error');
    }
}
