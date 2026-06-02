// ============ Orders Module ============

async function loadOrders() {
    if (!requireAuth()) return;
    const container = document.getElementById('orders-content');
    if (!container) return;
    container.innerHTML = '<p style="text-align:center;color:#999;padding:40px;">Loading...</p>';
    
    try {
        const snap = await db.collection('orders').where('userId','==',APP_STATE.currentUser.uid).orderBy('createdAt','desc').limit(30).get();
        if (snap.empty) { container.innerHTML = '<div style="text-align:center;padding:60px;"><i class="fas fa-box-open" style="font-size:60px;color:#ddd;"></i><h3>No Orders</h3><button class="btn-gold mt-20" onclick="navigateTo(\'marketplace\')">Shop Now</button></div>'; return; }
        
        container.innerHTML = snap.docs.map(doc => renderOrderCard(doc.id, doc.data())).join('');
    } catch (e) { container.innerHTML = '<p style="text-align:center;color:#999;">Error</p>'; }
}

function renderOrderCard(orderId, order) {
    const si = getStatusInfo(order.status);
    const items = order.items || [];
    return `<div style="background:white;border-radius:12px;padding:16px;margin-bottom:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
        <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
            <div><p style="font-size:11px;color:#999;">#${orderId.slice(-10).toUpperCase()}</p><p style="font-size:12px;color:#666;">${formatDate(order.createdAt)}</p></div>
            <span style="background:${si.bg};color:${si.color};padding:4px 12px;border-radius:12px;font-size:11px;font-weight:600;">${si.icon} ${si.label}</span>
        </div>
        ${items.map(item => `
            <div style="display:flex;gap:10px;align-items:center;padding:8px 0;border-top:1px solid #f5f5f5;">
                <img src="${item.image||'app-icon.png'}" style="width:50px;height:50px;border-radius:8px;object-fit:cover;">
                <div style="flex:1;"><p style="font-weight:600;">${item.name}</p><p style="font-size:11px;color:#999;">${item.color||''} ${item.size||''} ×${item.quantity}</p></div>
                <p style="font-weight:700;color:#FFD700;">${formatCurrency(item.total)}</p>
            </div>
        `).join('')}
        ${order.shipping ? `<div style="background:#f9f9f9;border-radius:8px;padding:10px;margin:8px 0;font-size:12px;"><p style="font-weight:600;">📦 ${order.shipping.name}</p><p style="color:#666;">${order.shipping.address}, ${order.shipping.city}</p></div>` : ''}
        ${order.trackingNumber ? `<p style="font-size:12px;color:#33B5E5;">📮 ${order.trackingNumber}</p>` : ''}
        <div style="display:flex;justify-content:space-between;padding:8px 0;border-top:2px solid #FFD700;margin-top:8px;"><span style="font-weight:600;">Total</span><span style="font-weight:700;color:#FFD700;">${formatCurrency(order.total)}</span></div>
        <div style="display:flex;gap:8px;margin-top:12px;">
            ${order.status==='delivered' ? `<button class="btn-gold" onclick="confirmDelivery('${orderId}')" style="flex:1;">✅ Confirm Delivery</button>` : ''}
            ${order.status==='completed' ? '<p style="color:#00C851;flex:1;text-align:center;">✅ Completed</p>' : ''}
            ${['processing','shipped','out_for_delivery','delivered'].includes(order.status) ? `<button class="btn-outline" style="flex:1;color:#FF4444;border-color:#FF4444;" onclick="openDispute('${orderId}')">🚨 Report</button>` : ''}
            ${order.disputed ? '<p style="color:#FF4444;font-size:12px;">Under review</p>' : ''}
        </div>
    </div>`;
}

function getStatusInfo(status) {
    const s = {
        'processing': { bg: '#FFF3E0', color: '#E65100', icon: '⏳', label: 'Processing' },
        'shipped': { bg: '#E3F2FD', color: '#1565C0', icon: '📦', label: 'Shipped' },
        'out_for_delivery': { bg: '#F3E5F5', color: '#7B1FA2', icon: '🚚', label: 'Out for Delivery' },
        'delivered': { bg: '#E8F5E9', color: '#2E7D32', icon: '📬', label: 'Delivered' },
        'completed': { bg: '#E8F5E9', color: '#1B5E20', icon: '✅', label: 'Completed' },
        'disputed': { bg: '#FFEBEE', color: '#C62828', icon: '🚨', label: 'Disputed' },
        'cancelled': { bg: '#F5F5F5', color: '#999', icon: '❌', label: 'Cancelled' }
    };
    return s[status] || { bg: '#F5F5F5', color: '#999', icon: '📋', label: status };
}

async function confirmDelivery(orderId) {
    if (!confirm('Confirm delivery? Payment will be released.')) return;
    showLoader();
    try {
        const order = await getFromFirestore('orders', orderId);
        if (!order) { hideLoader(); showToast('Not found','error'); return; }
        
        await saveToFirestore('orders', orderId, { status: 'completed', deliveryConfirmed: true, deliveryConfirmedAt: firebase.firestore.FieldValue.serverTimestamp() });
        
        const merchant = await getFromFirestore('users', order.merchantId);
        if (merchant) await saveToFirestore('users', order.merchantId, { walletBalance: (merchant.walletBalance||0)+order.escrowAmount });
        
        const profile = await refreshUserProfile();
        await saveToFirestore('users', APP_STATE.currentUser.uid, { escrowBalance: Math.max(0,(profile.escrowBalance||0)-order.escrowAmount) });
        
        // Release commissions
        if (order.items) {
            for (const item of order.items) {
                const affSnap = await db.collection('affiliate_products').where('productId','==',item.productId).where('status','==','active').limit(1).get();
                if (!affSnap.empty) {
                    const ad = affSnap.docs[0].data();
                    const comm = calculateCommission(item.total, ad.commissionPercentage);
                    const aff = await getFromFirestore('users', ad.affiliateId);
                    if (aff) await saveToFirestore('users', ad.affiliateId, { pendingEarnings: Math.max(0,(aff.pendingEarnings||0)-comm), affiliateEarnings: (aff.affiliateEarnings||0)+comm, walletBalance: (aff.walletBalance||0)+comm });
                }
            }
        }
        
        await saveToFirestore('transactions', generateId('rel'), { userId: order.merchantId, type: 'escrow_release', amount: order.escrowAmount, reference: orderId, status: 'completed', createdAt: firebase.firestore.FieldValue.serverTimestamp() });
        hideLoader();
        showToast('✅ Delivery confirmed!','success');
        loadOrders();
    } catch (e) { hideLoader(); showToast('Error','error'); }
}

window.confirmDelivery = confirmDelivery;
console.log('✅ Orders module ready');