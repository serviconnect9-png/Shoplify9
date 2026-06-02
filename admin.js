// ============ Admin Module ============

async function loadAdminPanel() {
    if (!requireAuth()) return;
    if (!isAdmin(APP_STATE.currentUser?.email)) { showToast('Access denied','error'); navigateTo('home'); return; }
    
    const container = document.getElementById('admin-content');
    if (!container) return;
    container.innerHTML = '<p style="text-align:center;padding:40px;">Loading...</p>';
    
    try {
        const totalUsers = (await db.collection('users').get()).size;
        const totalProducts = (await db.collection('products').get()).size;
        const totalOrders = (await db.collection('orders').get()).size;
        const openDisputes = (await db.collection('disputes').where('status','==','open').get()).size;
        const pendingWDs = (await db.collection('withdrawals').where('status','==','pending').get()).size;
        
        container.innerHTML = `
            <h3>🔐 Admin Panel</h3>
            <p style="color:#666;">${APP_STATE.currentUser.email}</p>
            <div class="admin-stats-grid">
                <div class="admin-stat-card" onclick="loadAdminUsers()"><p style="font-size:28px;font-weight:800;color:#FFD700;">${totalUsers}</p><p>Users</p></div>
                <div class="admin-stat-card" onclick="loadAdminProducts()"><p style="font-size:28px;font-weight:800;color:#33B5E5;">${totalProducts}</p><p>Products</p></div>
                <div class="admin-stat-card"><p style="font-size:28px;font-weight:800;color:#00C851;">${totalOrders}</p><p>Orders</p></div>
                <div class="admin-stat-card" onclick="loadAdminDisputes()"><p style="font-size:28px;font-weight:800;color:#FF4444;">${openDisputes}</p><p>Disputes</p></div>
                <div class="admin-stat-card" onclick="loadAdminWithdrawals()"><p style="font-size:28px;font-weight:800;color:#FFBB33;">${pendingWDs}</p><p>Withdrawals</p></div>
            </div>
            <div style="display:flex;flex-direction:column;gap:8px;margin-top:20px;">
                <button class="btn-gold" onclick="loadAdminDisputes()">🚨 Review Disputes (${openDisputes})</button>
                <button class="btn-gold" onclick="loadAdminWithdrawals()">💰 Review Withdrawals (${pendingWDs})</button>
                <button class="btn-gold" onclick="loadAdminProducts()">📦 Manage Products</button>
                <button class="btn-gold" onclick="loadAdminUsers()">👥 Manage Users</button>
            </div>
            <div id="admin-detail-content" style="margin-top:20px;"></div>
        `;
    } catch (e) { container.innerHTML = '<p style="color:#FF4444;">Error</p>'; }
}

async function loadAdminDisputes() {
    const dc = document.getElementById('admin-detail-content');
    if (!dc) return;
    dc.innerHTML = '<p>Loading...</p>';
    const snap = await db.collection('disputes').where('status','==','open').orderBy('createdAt','desc').get();
    if (snap.empty) { dc.innerHTML = '<p style="text-align:center;">No open disputes</p>'; return; }
    dc.innerHTML = `<h4>🚨 Open Disputes</h4>` + snap.docs.map(doc => {
        const d = doc.data();
        return `<div style="background:white;padding:14px;border-radius:10px;margin-bottom:10px;">
            <p style="font-weight:600;">#${d.orderId?.slice(-8)}</p><p style="color:#FF4444;">${d.type}</p><p>${d.description}</p>
            ${d.evidence?.map(u=>`<img src="${u}" style="width:60px;height:60px;border-radius:6px;margin:4px;">`).join('')||''}
            <div style="display:flex;gap:8px;margin-top:8px;">
                <button class="btn-small-gold" onclick="resolveDispute('${doc.id}','refund')">Refund</button>
                <button class="btn-small-gold" onclick="resolveDispute('${doc.id}','merchant')">Release</button>
                <button class="btn-small-gold" onclick="resolveDispute('${doc.id}','partial')">Partial</button>
            </div>
        </div>`;
    }).join('');
}

async function resolveDispute(disputeId, resolution) {
    try {
        const dispute = await getFromFirestore('disputes', disputeId);
        if (!dispute) return;
        const order = await getFromFirestore('orders', dispute.orderId);
        if (!order) return;
        
        if (resolution === 'refund') {
            const buyer = await getFromFirestore('users', order.userId);
            if (buyer) await saveToFirestore('users', order.userId, { walletBalance: (buyer.walletBalance||0)+order.escrowAmount, escrowBalance: Math.max(0,(buyer.escrowBalance||0)-order.escrowAmount) });
            await sendNotification(order.userId, 'Dispute Resolved', 'Full refund issued.', '💰');
        } else if (resolution === 'merchant') {
            const merchant = await getFromFirestore('users', order.merchantId);
            if (merchant) await saveToFirestore('users', order.merchantId, { walletBalance: (merchant.walletBalance||0)+order.escrowAmount });
            const buyer = await getFromFirestore('users', order.userId);
            if (buyer) await saveToFirestore('users', order.userId, { escrowBalance: Math.max(0,(buyer.escrowBalance||0)-order.escrowAmount) });
        }
        
        await saveToFirestore('disputes', disputeId, { status: 'resolved', resolution, resolvedBy: APP_STATE.currentUser.email, resolvedAt: firebase.firestore.FieldValue.serverTimestamp() });
        await saveToFirestore('orders', dispute.orderId, { status: resolution==='refund'?'cancelled':'completed' });
        showToast('Resolved!','success');
        loadAdminDisputes();
    } catch (e) { showToast('Error','error'); }
}

async function loadAdminWithdrawals() {
    const dc = document.getElementById('admin-detail-content');
    if (!dc) return;
    dc.innerHTML = '<p>Loading...</p>';
    const snap = await db.collection('withdrawals').where('status','==','pending').orderBy('createdAt','desc').get();
    if (snap.empty) { dc.innerHTML = '<p style="text-align:center;">No pending withdrawals</p>'; return; }
    dc.innerHTML = `<h4>💰 Pending Withdrawals</h4>` + snap.docs.map(doc => {
        const w = doc.data();
        return `<div style="background:white;padding:14px;border-radius:10px;margin-bottom:10px;">
            <p><strong>${formatCurrency(w.amount)}</strong> - ${w.userEmail}</p>
            <p style="font-size:12px;">${w.bankAccount?.bankName} - ****${w.bankAccount?.accountNumber?.slice(-4)}</p>
            <div style="display:flex;gap:8px;margin-top:8px;">
                <button class="btn-small-gold" onclick="approveWithdrawal('${doc.id}','${w.userId}',${w.amount})">✅ Approve</button>
                <button class="btn-small-gold" style="background:#FF4444;" onclick="rejectWithdrawal('${doc.id}')">❌ Reject</button>
            </div>
        </div>`;
    }).join('');
}

async function approveWithdrawal(wId, userId, amount) {
    await saveToFirestore('withdrawals', wId, { status: 'approved', approvedBy: APP_STATE.currentUser.email, approvedAt: firebase.firestore.FieldValue.serverTimestamp() });
    await sendNotification(userId, 'Withdrawal Approved', `${formatCurrency(amount)} approved.`, '✅');
    showToast('Approved','success');
    loadAdminWithdrawals();
}

async function rejectWithdrawal(wId) {
    const w = await getFromFirestore('withdrawals', wId);
    if (w) {
        const user = await getFromFirestore('users', w.userId);
        if (user) await saveToFirestore('users', w.userId, { walletBalance: (user.walletBalance||0)+w.amount, withdrawnBalance: Math.max(0,(user.withdrawnBalance||0)-w.amount) });
    }
    await saveToFirestore('withdrawals', wId, { status: 'rejected', rejectedBy: APP_STATE.currentUser.email, rejectedAt: firebase.firestore.FieldValue.serverTimestamp() });
    showToast('Rejected','success');
    loadAdminWithdrawals();
}

async function loadAdminProducts() {
    const dc = document.getElementById('admin-detail-content');
    if (!dc) return;
    const snap = await db.collection('products').orderBy('createdAt','desc').limit(30).get();
    dc.innerHTML = `<h4>📦 Products</h4>` + snap.docs.map(doc => {
        const p = doc.data();
        return `<div style="display:flex;gap:10px;background:white;padding:10px;border-radius:10px;margin-bottom:8px;align-items:center;">
            <img src="${p.images?.[0]||'app-icon.png'}" style="width:50px;height:50px;border-radius:8px;">
            <div style="flex:1;"><p style="font-weight:600;">${p.name}</p><p style="font-size:11px;">${p.merchantName} | ${formatCurrency(p.price)}</p></div>
            <button class="btn-small-gold" onclick="toggleProductAdmin('${doc.id}','${p.status}')">${p.status==='active'?'Disable':'Enable'}</button>
        </div>`;
    }).join('');
}

async function toggleProductAdmin(pid, status) {
    await saveToFirestore('products', pid, { status: status==='active'?'disabled':'active' });
    showToast('Updated','success');
    loadAdminProducts();
}

async function loadAdminUsers() {
    const dc = document.getElementById('admin-detail-content');
    if (!dc) return;
    const snap = await db.collection('users').limit(30).get();
    dc.innerHTML = `<h4>👥 Users</h4>` + snap.docs.map(doc => {
        const u = doc.data();
        return `<div style="background:white;padding:12px;border-radius:10px;margin-bottom:8px;">
            <div style="display:flex;justify-content:space-between;"><p style="font-weight:600;">${u.displayName||u.email}</p><span style="font-size:10px;padding:2px 8px;border-radius:8px;">${u.role}</span></div>
            <p style="font-size:11px;">${u.email} | ${formatCurrency(u.walletBalance)} | 🇧🇯 Susp: ${u.suspensionCount||0}</p>
        </div>`;
    }).join('');
}

window.resolveDispute = resolveDispute;
window.approveWithdrawal = approveWithdrawal;
window.rejectWithdrawal = rejectWithdrawal;
window.toggleProductAdmin = toggleProductAdmin;
window.loadAdminDisputes = loadAdminDisputes;
window.loadAdminWithdrawals = loadAdminWithdrawals;
window.loadAdminProducts = loadAdminProducts;
window.loadAdminUsers = loadAdminUsers;
console.log('✅ Admin module ready');