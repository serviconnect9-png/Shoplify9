// ============ Admin Panel Module ============

async function loadAdminPanel() {
    if (!requireAuth()) return;
    if (!isAdmin(APP_STATE.currentUser?.email)) {
        showToast('Access denied', 'error');
        navigateTo('home');
        return;
    }
    
    const container = document.getElementById('admin-content');
    if (!container) return;
    
    container.innerHTML = '<p style="text-align:center; padding:40px;">Loading admin panel...</p>';
    
    try {
        // Get counts
        const [usersSnapshot, productsSnapshot, ordersSnapshot, disputesSnapshot, withdrawalsSnapshot] = 
            await Promise.all([
                db.collection('users').limit(1).get(),
                db.collection('products').limit(1).get(),
                db.collection('orders').limit(1).get(),
                db.collection('disputes').where('status', '==', 'open').limit(1).get(),
                db.collection('withdrawals').where('status', '==', 'pending').limit(1).get()
            ]);
        
        // Get actual counts
        const totalUsers = (await db.collection('users').get()).size;
        const totalProducts = (await db.collection('products').get()).size;
        const totalOrders = (await db.collection('orders').get()).size;
        const openDisputes = (await db.collection('disputes').where('status', '==', 'open').get()).size;
        const pendingWithdrawals = (await db.collection('withdrawals').where('status', '==', 'pending').get()).size;
        
        container.innerHTML = `
            <h3 style="margin-bottom:16px;">🔐 Admin Panel</h3>
            <p style="color:#666; margin-bottom:16px;">Welcome, ${APP_STATE.currentUser.email}</p>
            
            <!-- Stats -->
            <div class="admin-stats-grid">
                <div class="admin-stat-card" onclick="loadAdminUsers()">
                    <p style="font-size:28px; font-weight:800; color:#FFD700;">${totalUsers}</p>
                    <p style="font-size:12px;">Users</p>
                </div>
                <div class="admin-stat-card" onclick="loadAdminProducts()">
                    <p style="font-size:28px; font-weight:800; color:#33B5E5;">${totalProducts}</p>
                    <p style="font-size:12px;">Products</p>
                </div>
                <div class="admin-stat-card">
                    <p style="font-size:28px; font-weight:800; color:#00C851;">${totalOrders}</p>
                    <p style="font-size:12px;">Orders</p>
                </div>
                <div class="admin-stat-card" onclick="loadAdminDisputes()" style="border-left-color:#FF4444;">
                    <p style="font-size:28px; font-weight:800; color:#FF4444;">${openDisputes}</p>
                    <p style="font-size:12px;">Open Disputes</p>
                </div>
                <div class="admin-stat-card" onclick="loadAdminWithdrawals()">
                    <p style="font-size:28px; font-weight:800; color:#FFBB33;">${pendingWithdrawals}</p>
                    <p style="font-size:12px;">Pending Withdrawals</p>
                </div>
            </div>
            
            <!-- Quick Actions -->
            <div style="display:flex; flex-direction:column; gap:8px; margin-top:20px;">
                <button class="btn-gold" onclick="loadAdminDisputes()">
                    🚨 Review Disputes (${openDisputes})
                </button>
                <button class="btn-gold" onclick="loadAdminWithdrawals()">
                    💰 Review Withdrawals (${pendingWithdrawals})
                </button>
                <button class="btn-gold" onclick="loadAdminProducts()">
                    📦 Manage Products
                </button>
                <button class="btn-gold" onclick="loadAdminUsers()">
                    👥 Manage Users
                </button>
            </div>
            
            <div id="admin-detail-content" style="margin-top:20px;"></div>
        `;
        
    } catch (error) {
        console.error('Admin load error:', error);
        container.innerHTML = '<p style="text-align:center;color:#FF4444;">Error loading admin panel</p>';
    }
}

async function loadAdminDisputes() {
    const detailContainer = document.getElementById('admin-detail-content');
    if (!detailContainer) return;
    
    detailContainer.innerHTML = '<p style="text-align:center;color:#999;">Loading disputes...</p>';
    
    try {
        const snapshot = await db.collection('disputes')
            .where('status', '==', 'open')
            .orderBy('createdAt', 'desc')
            .get();
        
        if (snapshot.empty) {
            detailContainer.innerHTML = '<p style="text-align:center;color:#999;padding:20px;">No open disputes</p>';
            return;
        }
        
        detailContainer.innerHTML = `
            <h4 style="margin-bottom:12px;">🚨 Open Disputes (${snapshot.size})</h4>
            ${snapshot.docs.map(doc => {
                const d = doc.data();
                return `
                    <div style="background:white; padding:14px; border-radius:10px; margin-bottom:10px; 
                                box-shadow:0 2px 8px rgba(0,0,0,0.05);">
                        <p style="font-weight:600;">Order #${d.orderId?.slice(-8)}</p>
                        <p style="font-size:12px; color:#FF4444;">Type: ${d.type}</p>
                        <p style="font-size:13px; color:#666;">${d.description}</p>
                        ${d.evidence?.length ? d.evidence.map(url => 
                            `<img src="${url}" style="width:60px; height:60px; border-radius:6px; margin:4px;">`
                        ).join('') : ''}
                        <div style="display:flex; gap:8px; margin-top:8px;">
                            <button class="btn-small-gold" onclick="resolveDispute('${doc.id}', 'refund')">
                                Refund Buyer
                            </button>
                            <button class="btn-small-gold" onclick="resolveDispute('${doc.id}', 'merchant')">
                                Release to Merchant
                            </button>
                            <button class="btn-small-gold" onclick="resolveDispute('${doc.id}', 'partial')">
                                Partial Refund
                            </button>
                        </div>
                    </div>
                `;
            }).join('')}
        `;
    } catch (error) {
        detailContainer.innerHTML = '<p style="color:#FF4444;">Error loading disputes</p>';
    }
}

async function resolveDispute(disputeId, resolution) {
    try {
        const dispute = await getFromFirestore('disputes', disputeId);
        if (!dispute) return;
        
        const order = await getFromFirestore('orders', dispute.orderId);
        if (!order) return;
        
        if (resolution === 'refund') {
            // Refund buyer
            const buyer = await getFromFirestore('users', order.userId);
            if (buyer) {
                await saveToFirestore('users', order.userId, {
                    walletBalance: (buyer.walletBalance || 0) + order.escrowAmount,
                    escrowBalance: Math.max(0, (buyer.escrowBalance || 0) - order.escrowAmount)
                });
            }
            await sendNotification(order.userId, 'Dispute Resolved',
                `Your dispute for order #${dispute.orderId.slice(-8)} has been resolved. Full refund issued.`, '💰');
        } else if (resolution === 'merchant') {
            // Release to merchant
            const merchant = await getFromFirestore('users', order.merchantId);
            if (merchant) {
                await saveToFirestore('users', order.merchantId, {
                    walletBalance: (merchant.walletBalance || 0) + order.escrowAmount
                });
            }
            // Update buyer escrow
            const buyer = await getFromFirestore('users', order.userId);
            if (buyer) {
                await saveToFirestore('users', order.userId, {
                    escrowBalance: Math.max(0, (buyer.escrowBalance || 0) - order.escrowAmount)
                });
            }
            await sendNotification(order.userId, 'Dispute Resolved',
                `Dispute resolved in favor of merchant for order #${dispute.orderId.slice(-8)}.`, '📋');
        }
        
        // Update dispute
        await saveToFirestore('disputes', disputeId, {
            status: 'resolved',
            resolution,
            resolvedBy: APP_STATE.currentUser.email,
            resolvedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Update order
        await saveToFirestore('orders', dispute.orderId, {
            status: resolution === 'refund' ? 'cancelled' : 'completed',
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        showToast('Dispute resolved!', 'success');
        loadAdminDisputes();
    } catch (error) {
        console.error('Resolve error:', error);
        showToast('Error resolving dispute', 'error');
    }
}

async function loadAdminWithdrawals() {
    const detailContainer = document.getElementById('admin-detail-content');
    if (!detailContainer) return;
    
    try {
        const snapshot = await db.collection('withdrawals')
            .where('status', '==', 'pending')
            .orderBy('createdAt', 'desc')
            .get();
        
        if (snapshot.empty) {
            detailContainer.innerHTML = '<p style="text-align:center;color:#999;padding:20px;">No pending withdrawals</p>';
            return;
        }
        
        detailContainer.innerHTML = `
            <h4 style="margin-bottom:12px;">💰 Pending Withdrawals</h4>
            ${snapshot.docs.map(doc => {
                const w = doc.data();
                return `
                    <div style="background:white; padding:14px; border-radius:10px; margin-bottom:10px; 
                                box-shadow:0 2px 8px rgba(0,0,0,0.05);">
                        <p><strong>${formatCurrency(w.amount)}</strong> - ${w.userEmail}</p>
                        <p style="font-size:12px; color:#666;">Bank: ${w.bankAccount?.bankName} - ****${w.bankAccount?.accountNumber?.slice(-4)}</p>
                        <p style="font-size:11px; color:#999;">${formatDate(w.createdAt)}</p>
                        <div style="display:flex; gap:8px; margin-top:8px;">
                            <button class="btn-small-gold" onclick="approveWithdrawal('${doc.id}', '${w.userId}', ${w.amount})">
                                ✅ Approve
                            </button>
                            <button class="btn-small-gold" style="background:#FF4444;" 
                                    onclick="rejectWithdrawal('${doc.id}')">
                                ❌ Reject
                            </button>
                        </div>
                    </div>
                `;
            }).join('')}
        `;
    } catch (error) {
        detailContainer.innerHTML = '<p style="color:#FF4444;">Error loading withdrawals</p>';
    }
}

async function approveWithdrawal(withdrawalId, userId, amount) {
    try {
        await saveToFirestore('withdrawals', withdrawalId, {
            status: 'approved',
            approvedBy: APP_STATE.currentUser.email,
            approvedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        await sendNotification(userId, 'Withdrawal Approved',
            `Your withdrawal of ${formatCurrency(amount)} has been approved.`, '✅');
        
        showToast('Withdrawal approved', 'success');
        loadAdminWithdrawals();
    } catch (error) {
        showToast('Error approving', 'error');
    }
}

async function rejectWithdrawal(withdrawalId) {
    try {
        const withdrawal = await getFromFirestore('withdrawals', withdrawalId);
        if (withdrawal) {
            // Refund to user wallet
            const user = await getFromFirestore('users', withdrawal.userId);
            if (user) {
                await saveToFirestore('users', withdrawal.userId, {
                    walletBalance: (user.walletBalance || 0) + withdrawal.amount,
                    withdrawnBalance: Math.max(0, (user.withdrawnBalance || 0) - withdrawal.amount)
                });
            }
        }
        
        await saveToFirestore('withdrawals', withdrawalId, {
            status: 'rejected',
            rejectedBy: APP_STATE.currentUser.email,
            rejectedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        showToast('Withdrawal rejected', 'success');
        loadAdminWithdrawals();
    } catch (error) {
        showToast('Error rejecting', 'error');
    }
}

async function loadAdminProducts() {
    const detailContainer = document.getElementById('admin-detail-content');
    if (!detailContainer) return;
    
    try {
        const snapshot = await db.collection('products').orderBy('createdAt', 'desc').limit(30).get();
        
        detailContainer.innerHTML = `
            <h4 style="margin-bottom:12px;">📦 Products</h4>
            ${snapshot.docs.map(doc => {
                const p = doc.data();
                return `
                    <div style="display:flex; gap:10px; background:white; padding:10px; border-radius:10px; 
                                margin-bottom:8px; align-items:center; box-shadow:0 1px 4px rgba(0,0,0,0.05);">
                        <img src="${p.images?.[0] || 'app-icon.png'}" style="width:50px; height:50px; border-radius:8px;">
                        <div style="flex:1;">
                            <p style="font-weight:600; font-size:13px;">${p.name}</p>
                            <p style="font-size:11px; color:#666;">${p.merchantName} | ${formatCurrency(p.price)}</p>
                        </div>
                        <button class="btn-small-gold" onclick="toggleProductAdmin('${doc.id}', '${p.status}')">
                            ${p.status === 'active' ? 'Disable' : 'Enable'}
                        </button>
                    </div>
                `;
            }).join('')}
        `;
    } catch (error) {
        detailContainer.innerHTML = '<p style="color:#FF4444;">Error loading products</p>';
    }
}

async function toggleProductAdmin(productId, currentStatus) {
    const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
    await saveToFirestore('products', productId, { status: newStatus });
    showToast(`Product ${newStatus}`, 'success');
    loadAdminProducts();
}

async function loadAdminUsers() {
    const detailContainer = document.getElementById('admin-detail-content');
    if (!detailContainer) return;
    
    try {
        const snapshot = await db.collection('users').limit(30).get();
        
        detailContainer.innerHTML = `
            <h4 style="margin-bottom:12px;">👥 Users</h4>
            ${snapshot.docs.map(doc => {
                const u = doc.data();
                return `
                    <div style="background:white; padding:12px; border-radius:10px; margin-bottom:8px; 
                                box-shadow:0 1px 4px rgba(0,0,0,0.05);">
                        <div style="display:flex; justify-content:space-between;">
                            <p style="font-weight:600;">${u.displayName || u.email}</p>
                            <span style="font-size:10px; padding:2px 8px; border-radius:8px; 
                                         background:${u.role === 'admin' ? '#FFF3E0' : '#E8F5E9'};">
                                ${u.role}
                            </span>
                        </div>
                        <p style="font-size:11px; color:#666;">${u.email}</p>
                        <p style="font-size:11px;">Balance: ${formatCurrency(u.walletBalance)} | Suspensions: ${u.suspensionCount || 0}</p>
                    </div>
                `;
            }).join('')}
        `;
    } catch (error) {
        detailContainer.innerHTML = '<p style="color:#FF4444;">Error loading users</p>';
    }
}