// customerservice.js - COMPLETE UPDATED (CS Dashboard Working, All Features)
console.log('✅ customerservice.js loaded');

async function loadCustomerServicePanel() {
    const container = document.getElementById('cs-content');
    if (!container) return;
    
    const isCSAgent = APP.userProfile?.accountType === 'customerservice';
    
    container.innerHTML = '<p style="text-align:center;padding:40px;">Loading...</p>';
    
    if (isCSAgent) {
        await loadCSAgentDashboard(container);
    } else {
        await loadCustomerSupportView(container);
    }
}

async function loadCSAgentDashboard(container) {
    try {
        const [disputesSnap, ticketsSnap, verifySnap] = await Promise.all([
            db.collection('disputes').where('status','==','open').get(),
            db.collection('support_tickets').where('status','!=','closed').get(),
            db.collection('verification_requests').where('status','==','pending').get()
        ]);
        
        container.innerHTML = `
            <div style="padding:15px;">
                <h3>🎧 CS Dashboard</h3>
                <p style="color:#666;font-size:13px;">Welcome, ${APP.userProfile.displayName||'Agent'}</p>
                
                <div class="affiliate-stats" style="margin:15px 0;">
                    <div class="stat-card" onclick="navigateTo('disputes-manage')" style="cursor:pointer;">
                        <div class="stat-value">${disputesSnap.size}</div>
                        <div class="stat-label">Open Disputes</div>
                    </div>
                    <div class="stat-card" onclick="viewSupportTickets()" style="cursor:pointer;">
                        <div class="stat-value">${ticketsSnap.size}</div>
                        <div class="stat-label">Active Tickets</div>
                    </div>
                    <div class="stat-card" onclick="viewVerificationRequests()" style="cursor:pointer;">
                        <div class="stat-value">${verifySnap.size}</div>
                        <div class="stat-label">Pending Verifications</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">$${(APP.userProfile.csSalary||0).toFixed(2)}</div>
                        <div class="stat-label">Salary/mo</div>
                    </div>
                </div>
                
                <button class="btn-outline btn-full" style="margin-bottom:10px;" onclick="navigateTo('disputes-manage')">📋 Manage Disputes</button>
                <button class="btn-outline btn-full" style="margin-bottom:10px;" onclick="viewSupportTickets()">🎫 Support Tickets</button>
                <button class="btn-outline btn-full" style="margin-bottom:10px;" onclick="viewVerificationRequests()">✅ Verification Requests</button>
                
                <div id="cs-detail-area" style="margin-top:15px;"></div>
            </div>`;
    } catch(e) {
        container.innerHTML = '<p style="text-align:center;padding:40px;">Error loading dashboard</p>';
    }
}

async function loadCustomerSupportView(container) {
    container.innerHTML = `
        <div style="padding:15px;">
            <h3>🎧 Customer Service</h3>
            <p style="color:#666;margin-bottom:15px;">We're here to help!</p>
            
            <div style="background:white;padding:20px;border-radius:12px;box-shadow:var(--shadow);margin-bottom:15px;">
                <h4 style="margin-bottom:15px;">📋 Submit a Support Ticket</h4>
                <div class="input-group"><label>Subject</label><input type="text" id="cs-subject" class="input-field" placeholder="What do you need help with?"></div>
                <div class="input-group"><label>Category</label><select id="cs-category" class="input-field"><option value="">Select...</option><option value="order">Order Issue</option><option value="payment">Payment Problem</option><option value="account">Account Help</option><option value="technical">Technical Issue</option><option value="dispute">Dispute</option><option value="other">Other</option></select></div>
                <div class="input-group"><label>Description</label><textarea id="cs-description" class="input-field" rows="4" placeholder="Describe your issue..."></textarea></div>
                <button class="btn-gold btn-full" style="margin-top:10px;" onclick="submitSupportTicket()">📤 Submit Ticket</button>
            </div>
            
            <div style="background:white;padding:20px;border-radius:12px;box-shadow:var(--shadow);margin-bottom:15px;">
                <h4 style="margin-bottom:10px;">📞 Contact Us</h4>
                <p style="font-size:13px;color:#666;">Email: <strong>${APP.csEmail||'support@oneshoplify.com'}</strong></p>
                <p style="font-size:13px;color:#666;">WhatsApp: <a href="${APP.whatsappCommunity}" target="_blank" style="color:#25D366;">Join Community</a></p>
                <p style="font-size:13px;color:#666;">Response time: Within 24 hours</p>
            </div>
            
            <div style="background:white;padding:20px;border-radius:12px;box-shadow:var(--shadow);">
                <h4 style="margin-bottom:10px;">❓ FAQ</h4>
                <div style="font-size:13px;color:#666;line-height:2;">
                    <p><strong>Q: How do I track my order?</strong></p>
                    <p>A: Go to My Orders and click Track.</p>
                    <p style="margin-top:8px;"><strong>Q: How does escrow work?</strong></p>
                    <p>A: Payment is held until you confirm delivery.</p>
                    <p style="margin-top:8px;"><strong>Q: How do I become a dropshipper?</strong></p>
                    <p>A: Go to Profile → Become a Dropshipper.</p>
                </div>
            </div>
        </div>`;
}

async function submitSupportTicket() {
    const subject = document.getElementById('cs-subject')?.value?.trim();
    const category = document.getElementById('cs-category')?.value;
    const description = document.getElementById('cs-description')?.value?.trim();
    
    if(!subject||!category||!description){showToast('Fill all fields','error');return;}
    if(!APP.userProfile){showToast('Login required','error');return;}
    
    showLoader();
    try {
        await db.collection('support_tickets').add({
            userId: APP.userProfile.uid,
            userEmail: APP.userProfile.email||'',
            userName: APP.userProfile.displayName||APP.userProfile.username,
            subject, category, description,
            status: 'open',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        hideLoader();
        showToast('Ticket submitted! ✅','success');
        document.getElementById('cs-subject').value = '';
        document.getElementById('cs-category').value = '';
        document.getElementById('cs-description').value = '';
    } catch(e){ hideLoader(); showToast('Failed','error'); }
}

async function viewSupportTickets() {
    const area = document.getElementById('cs-detail-area');
    if (!area) return;
    
    area.innerHTML = '<p style="text-align:center;padding:20px;">Loading tickets...</p>';
    
    try {
        const snap = await db.collection('support_tickets').orderBy('createdAt','desc').limit(50).get();
        
        if (snap.empty) {
            area.innerHTML = '<p style="text-align:center;padding:20px;color:#999;">No tickets</p>';
            return;
        }
        
        area.innerHTML = '<h4 style="margin-bottom:10px;">🎫 Support Tickets</h4>';
        snap.forEach(doc => {
            const t = doc.data();
            const statusColors = {open:'#FFA000', pending:'#2196F3', resolved:'#4CAF50', closed:'#999'};
            area.innerHTML += `
                <div style="background:white;padding:12px;border-radius:8px;margin-bottom:8px;box-shadow:var(--shadow);">
                    <div style="display:flex;justify-content:space-between;">
                        <strong>${t.subject||'No subject'}</strong>
                        <span style="background:${statusColors[t.status]||'#999'};color:white;padding:2px 8px;border-radius:10px;font-size:10px;">${(t.status||'open').toUpperCase()}</span>
                    </div>
                    <div style="font-size:12px;color:#666;">${t.userName||'Unknown'} | ${t.category||'N/A'}</div>
                    <p style="font-size:12px;color:#666;margin-top:5px;">${t.description||''}</p>
                    ${t.status==='open'?`<button class="btn-small btn-gold" onclick="resolveTicket('${doc.id}')" style="margin-top:8px;">Resolve</button>`:''}
                </div>`;
        });
    } catch(e) { area.innerHTML = '<p style="color:red;">Error loading tickets</p>'; }
}

async function resolveTicket(ticketId) {
    try {
        await db.collection('support_tickets').doc(ticketId).update({
            status: 'resolved',
            resolvedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        showToast('Ticket resolved! ✅','success');
        viewSupportTickets();
    } catch(e) { showToast('Failed','error'); }
}

async function viewVerificationRequests() {
    const area = document.getElementById('cs-detail-area');
    if (!area) return;
    
    area.innerHTML = '<p style="text-align:center;padding:20px;">Loading...</p>';
    
    try {
        const snap = await db.collection('verification_requests').where('status','==','pending').get();
        
        if (snap.empty) {
            area.innerHTML = '<p style="text-align:center;padding:20px;color:#999;">No pending verifications</p>';
            return;
        }
        
        area.innerHTML = '<h4 style="margin-bottom:10px;">✅ Verification Requests</h4>';
        snap.forEach(doc => {
            const v = doc.data();
            area.innerHTML += `
                <div style="background:white;padding:12px;border-radius:8px;margin-bottom:8px;box-shadow:var(--shadow);">
                    <p><strong>Name:</strong> ${v.name||'N/A'}</p>
                    <p><strong>DOB:</strong> ${v.dob||'N/A'}</p>
                    <p><strong>Sales:</strong> ${v.sales||0} | <strong>Referrals:</strong> ${v.referrals||0} | <strong>Earnings:</strong> $${(v.earnings||0).toFixed(2)}</p>
                    <div style="display:flex;gap:8px;margin-top:8px;">
                        <button class="btn-small btn-success" onclick="approveVerification('${doc.id}','${v.userId}')">✅ Approve</button>
                        <button class="btn-small btn-danger" onclick="rejectVerification('${doc.id}')">❌ Reject</button>
                    </div>
                </div>`;
        });
    } catch(e) { area.innerHTML = '<p style="color:red;">Error</p>'; }
}

async function approveVerification(requestId, userId) {
    try {
        await db.collection('verification_requests').doc(requestId).update({status:'approved'});
        await db.collection('users').doc(userId).update({isAppVerified:true});
        showToast('Verification approved! ✅','success');
        viewVerificationRequests();
    } catch(e) { showToast('Failed','error'); }
}

async function rejectVerification(requestId) {
    try {
        await db.collection('verification_requests').doc(requestId).update({status:'rejected'});
        showToast('Verification rejected','success');
        viewVerificationRequests();
    } catch(e) { showToast('Failed','error'); }
}

async function loadDisputesManagement() {
    const container = document.getElementById('disputes-content');
    if (!container) return;
    
    container.innerHTML = '<p style="text-align:center;padding:40px;">Loading disputes...</p>';
    
    try {
        const snap = await db.collection('disputes').orderBy('createdAt','desc').limit(50).get();
        
        if (snap.empty) {
            container.innerHTML = '<p style="text-align:center;padding:40px;">No disputes found</p>';
            return;
        }
        
        container.innerHTML = '';
        snap.forEach(doc => {
            const d = doc.data();
            container.innerHTML += `
                <div class="dispute-card">
                    <div class="dispute-header">
                        <span><strong>${d.userEmail||'Unknown'}</strong></span>
                        <span style="color:${d.status==='open'?'#FF4444':'#4CAF50'};">${(d.status||'open').toUpperCase()}</span>
                    </div>
                    <p style="font-size:13px;">Type: ${(d.type||'').replace(/_/g,' ')}</p>
                    <p style="font-size:13px;color:#666;">${d.description||'No description'}</p>
                    ${d.status==='open'?`
                        <div class="dispute-actions">
                            <button class="btn-small btn-success" onclick="resolveDispute('${doc.id}','refund')">Refund Buyer</button>
                            <button class="btn-small btn-warning" onclick="resolveDispute('${doc.id}','release')">Release to Merchant</button>
                            <button class="btn-small btn-danger" onclick="resolveDispute('${doc.id}','dismiss')">Dismiss</button>
                        </div>`:''}
                </div>`;
        });
    } catch(e) { container.innerHTML = '<p style="text-align:center;padding:40px;">Error</p>'; }
}

async function resolveDispute(disputeId, resolution) {
    try {
        await db.collection('disputes').doc(disputeId).update({
            status:'resolved', resolution,
            resolvedBy: APP.userProfile?.uid||'admin',
            resolvedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        showToast(`Dispute resolved: ${resolution}`,'success');
        loadDisputesManagement();
    } catch(e) { showToast('Failed','error'); }
}

console.log('✅ customerservice.js fully loaded');
