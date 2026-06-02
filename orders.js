// ============ Orders Module ============

async function loadOrders() {
    if (!requireAuth()) return;
    
    const container = document.getElementById('orders-content');
    if (!container) return;
    
    container.innerHTML = '<p style="text-align:center; color:#999; padding:40px;">Loading orders...</p>';
    
    try {
        const snapshot = await db.collection('orders')
            .where('userId', '==', APP_STATE.currentUser.uid)
            .orderBy('createdAt', 'desc')
            .limit(30)
            .get();
        
        if (snapshot.empty) {
            container.innerHTML = `
                <div style="text-align:center; padding:60px 20px;">
                    <i class="fas fa-box-open" style="font-size:60px; color:#ddd; display:block; margin-bottom:16px;"></i>
                    <h3>No Orders Yet</h3>
                    <p style="color:#999;">Start shopping to see your orders here</p>
                    <button class="btn-gold mt-20" onclick="navigateTo('marketplace')">Browse Products</button>
                </div>`;
            return;
        }
        
        container.innerHTML = snapshot.docs.map(doc => {
            const order = doc.data();
            return renderOrderCard(doc.id, order);
        }).join('');
        
    } catch (error) {
        console.error('Load orders error:', error);
        container.innerHTML = '<p style="text-align:center; color:#999; padding:40px;">Error loading orders</p>';
    }
}

function renderOrderCard(orderId, order) {
    const statusInfo = getStatusInfo(order.status);
    const items = order.items || [];
    
    return `
        <div class="order-card" style="background:white; border-radius:12px; padding:16px; margin-bottom:12px; 
                    box-shadow:0 2px 8px rgba(0,0,0,0.05);">
            <!-- Order Header -->
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                <div>
                    <p style="font-size:11px; color:#999;">Order #${orderId.slice(-10).toUpperCase()}</p>
                    <p style="font-size:12px; color:#666;">${formatDate(order.createdAt)}</p>
                </div>
                <span style="background:${statusInfo.bg}; color:${statusInfo.color}; 
                             padding:4px 12px; border-radius:12px; font-size:11px; font-weight:600;">
                    ${statusInfo.icon} ${statusInfo.label}
                </span>
            </div>
            
            <!-- Order Items -->
            ${items.map(item => `
                <div style="display:flex; gap:10px; align-items:center; padding:8px 0; border-top:1px solid #f5f5f5;">
                    <img src="${item.image || 'app-icon.png'}" 
                         style="width:50px; height:50px; border-radius:8px; object-fit:cover;">
                    <div style="flex:1;">
                        <p style="font-weight:600; font-size:13px;">${item.name}</p>
                        <p style="font-size:11px; color:#999;">
                            ${item.color || ''} ${item.size || ''} × ${item.quantity}
                        </p>
                    </div>
                    <p style="font-weight:700; color:#FFD700; font-size:14px;">${formatCurrency(item.total)}</p>
                </div>
            `).join('')}
            
            <!-- Shipping Info -->
            ${order.shipping ? `
                <div style="background:#f9f9f9; border-radius:8px; padding:10px; margin:8px 0; font-size:12px;">
                    <p style="font-weight:600; margin-bottom:4px;">📦 Shipping To:</p>
                    <p style="color:#666;">${order.shipping.name}</p>
                    <p style="color:#666;">${order.shipping.address}, ${order.shipping.city}</p>
                    <p style="color:#666;">${order.shipping.state}, ${order.shipping.country} ${order.shipping.postal}</p>
                </div>
            ` : ''}
            
            <!-- Tracking -->
            ${order.trackingNumber ? `
                <p style="font-size:12px; color:#33B5E5; margin:4px 0;">
                    📮 Tracking: ${order.trackingNumber}
                </p>
            ` : ''}
            
            <!-- Total -->
            <div style="display:flex; justify-content:space-between; padding:8px 0; border-top:2px solid #FFD700; margin-top:8px;">
                <span style="font-weight:600;">Total</span>
                <span style="font-weight:700; color:#FFD700; font-size:16px;">${formatCurrency(order.total)}</span>
            </div>
            
            <!-- Actions -->
            <div style="display:flex; gap:8px; margin-top:12px; flex-wrap:wrap;">
                ${order.status === 'delivered' ? `
                    <button class="btn-gold" onclick="confirmDelivery('${orderId}')" style="flex:1;">
                        ✅ Confirm Delivery
                    </button>
                ` : ''}
                ${order.status === 'completed' ? `
                    <p style="color:#00C851; font-size:13px; flex:1; text-align:center;">✅ Order Completed</p>
                ` : ''}
                ${['processing', 'shipped', 'out_for_delivery', 'delivered'].includes(order.status) ? `
                    <button class="btn-outline" style="flex:1; color:#FF4444; border-color:#FF4444;"
                            onclick="openDispute('${orderId}')">
                        🚨 Report Problem
                    </button>
                ` : ''}
                ${order.disputed ? `
                    <p style="color:#FF4444; font-size:12px; width:100%; text-align:center;">
                        Dispute filed - Under review
                    </p>
                ` : ''}
            </div>
        </div>
    `;
}

function getStatusInfo(status) {
    const statuses = {
        'processing': { bg: '#FFF3E0', color: '#E65100', icon: '⏳', label: 'Processing' },
        'shipped': { bg: '#E3F2FD', color: '#1565C0', icon: '📦', label: 'Shipped' },
        'out_for_delivery': { bg: '#F3E5F5', color: '#7B1FA2', icon: '🚚', label: 'Out for Delivery' },
        'delivered': { bg: '#E8F5E9', color: '#2E7D32', icon: '📬', label: 'Delivered' },
        'completed': { bg: '#E8F5E9', color: '#1B5E20', icon: '✅', label: 'Completed' },
        'disputed': { bg: '#FFEBEE', color: '#C62828', icon: '🚨', label: 'Disputed' },
        'cancelled': { bg: '#F5F5F5', color: '#999', icon: '❌', label: 'Cancelled' }
    };
    return statuses[status] || { bg: '#F5F5F5', color: '#999', icon: '📋', label: status };
}

async function confirmDelivery(orderId) {
    const confirmed = confirm('Confirm that you have received this order? This will release payment to the merchant.');
    if (!confirmed) return;
    
    showLoader();
    
    try {
        const order = await getFromFirestore('orders', orderId);
        if (!order) {
            hideLoader();
            showToast('Order not found', 'error');
            return;
        }
        
        // Update order status
        await saveToFirestore('orders', orderId, {
            status: 'completed',
            deliveryConfirmed: true,
            deliveryConfirmedAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Release escrow to merchant
        const merchant = await getFromFirestore('users', order.merchantId);
        if (merchant) {
            await saveToFirestore('users', order.merchantId, {
                walletBalance: (merchant.walletBalance || 0) + order.escrowAmount
            });
        }
        
        // Update user escrow balance
        const profile = await refreshUserProfile();
        await saveToFirestore('users', APP_STATE.currentUser.uid, {
            escrowBalance: Math.max(0, (profile.escrowBalance || 0) - order.escrowAmount)
        });
        
        // Release affiliate commissions
        await releaseAffiliateCommissions(order);
        
        // Record transaction for merchant
        await saveToFirestore('transactions', generateId('rel'), {
            userId: order.merchantId,
            type: 'escrow_release',
            amount: order.escrowAmount,
            reference: orderId,
            status: 'completed',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Notify merchant
        await sendNotification(order.merchantId, 'Payment Released!',
            `Payment of ${formatCurrency(order.escrowAmount)} released for order #${orderId.slice(-8)}`, '💰');
        
        hideLoader();
        showToast('✅ Delivery confirmed! Payment released.', 'success');
        loadOrders();
        
    } catch (error) {
        hideLoader();
        console.error('Delivery confirmation error:', error);
        showToast('Error confirming delivery', 'error');
    }
}

async function releaseAffiliateCommissions(order) {
    if (!order.items) return;
    
    for (const item of order.items) {
        try {
            const affiliateSnapshot = await db.collection('affiliate_products')
                .where('productId', '==', item.productId)
                .where('status', '==', 'active')
                .limit(1)
                .get();
            
            if (!affiliateSnapshot.empty) {
                const affiliateDoc = affiliateSnapshot.docs[0];
                const affiliateData = affiliateDoc.data();
                const commissionAmount = calculateCommission(item.total, affiliateData.commissionPercentage);
                
                // Move from pending to confirmed earnings
                const affiliate = await getFromFirestore('users', affiliateData.affiliateId);
                if (affiliate) {
                    await saveToFirestore('users', affiliateData.affiliateId, {
                        pendingEarnings: Math.max(0, (affiliate.pendingEarnings || 0) - commissionAmount),
                        affiliateEarnings: (affiliate.affiliateEarnings || 0) + commissionAmount,
                        walletBalance: (affiliate.walletBalance || 0) + commissionAmount
                    });
                    
                    await sendNotification(affiliateData.affiliateId, 'Commission Earned!',
                        `You earned ${formatCurrency(commissionAmount)} from ${item.name}`, '💰');
                }
            }
        } catch (error) {
            console.error('Release commission error:', error);
        }
    }
}