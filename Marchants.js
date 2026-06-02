// ============ Merchant Dashboard Module ============

async function loadMerchantDashboard() {
    if (!requireAuth()) return;
    
    const isMerchant = await checkSubscription('merchant');
    const container = document.getElementById('merchant-content');
    if (!container) return;
    
    if (!isMerchant) {
        container.innerHTML = `
            <div style="text-align:center; padding:40px 20px;">
                <img src="app-icon.png" width="80" height="80" style="border-radius:18px; margin-bottom:16px;">
                <div class="subscription-banner">
                    <i class="fas fa-store" style="font-size:48px; margin-bottom:12px; display:block;"></i>
                    <h3>Become a Merchant</h3>
                    <p>Sell products to a global audience.</p>
                    <p style="font-weight:700; font-size:20px; margin:12px 0;">$2/month</p>
                    <button class="btn-gold" onclick="subscribeToMerchant()" style="width:100%;">
                        Subscribe Now
                    </button>
                </div>
            </div>`;
        return;
    }
    
    // Check store setup
    const profile = await refreshUserProfile();
    
    if (!profile.storeActive) {
        container.innerHTML = `
            <div style="text-align:center; padding:40px 20px;">
                <i class="fas fa-store" style="font-size:48px; color:#FFD700; display:block; margin-bottom:12px;"></i>
                <h3>Set Up Your Store</h3>
                <p style="color:#666;">Choose a template and start selling!</p>
                <button class="btn-gold mt-20" onclick="navigateTo('store-setup')">Set Up Store</button>
            </div>`;
        return;
    }
    
    // Load merchant products
    const productsSnapshot = await db.collection('products')
        .where('merchantId', '==', APP_STATE.currentUser.uid)
        .orderBy('createdAt', 'desc')
        .get();
    
    const products = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const activeProducts = products.filter(p => p.status === 'active');
    const totalRevenue = products.reduce((sum, p) => sum + (p.totalSales || 0) * p.price, 0);
    
    // Load orders for this merchant
    const ordersSnapshot = await db.collection('orders')
        .where('merchantId', '==', APP_STATE.currentUser.uid)
        .orderBy('createdAt', 'desc')
        .limit(20)
        .get();
    
    const orders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const pendingOrders = orders.filter(o => ['processing', 'shipped'].includes(o.status));
    
    container.innerHTML = `
        <!-- Stats -->
        <div style="display:grid; grid-template-columns:repeat(2,1fr); gap:10px; margin-bottom:20px;">
            <div class="admin-stat-card">
                <p style="font-size:28px; font-weight:800; color:#FFD700;">${activeProducts.length}</p>
                <p style="font-size:12px; color:#999;">Active Products</p>
            </div>
            <div class="admin-stat-card">
                <p style="font-size:28px; font-weight:800; color:#00C851;">${formatCurrency(totalRevenue)}</p>
                <p style="font-size:12px; color:#999;">Total Revenue</p>
            </div>
            <div class="admin-stat-card">
                <p style="font-size:28px; font-weight:800; color:#FFBB33;">${pendingOrders.length}</p>
                <p style="font-size:12px; color:#999;">Pending Orders</p>
            </div>
            <div class="admin-stat-card">
                <p style="font-size:28px; font-weight:800; color:#33B5E5;">${orders.length}</p>
                <p style="font-size:12px; color:#999;">Total Orders</p>
            </div>
        </div>
        
        <!-- Quick Actions -->
        <div style="display:flex; gap:10px; margin-bottom:20px;">
            <button class="btn-gold" onclick="navigateTo('add-product')" style="flex:1;">
                <i class="fas fa-plus"></i> Add Product
            </button>
            <button class="btn-gold" onclick="navigateTo('store-setup')" style="flex:1;">
                <i class="fas fa-pen"></i> Edit Store
            </button>
        </div>
        
        <!-- My Products -->
        <div class="section">
            <h3 class="section-title">My Products (${products.length})</h3>
            <div id="merchant-products-list">
                ${products.length > 0 ? products.map(p => `
                    <div style="display:flex; gap:12px; background:white; padding:12px; border-radius:12px; 
                                margin-bottom:10px; box-shadow:0 2px 8px rgba(0,0,0,0.05); align-items:center;">
                        <img src="${p.images?.[0] || 'app-icon.png'}" 
                             style="width:60px; height:60px; border-radius:10px; object-fit:cover;">
                        <div style="flex:1;">
                            <p style="font-weight:600; font-size:14px;">${p.name}</p>
                            <p style="font-size:12px; color:#FFD700; font-weight:600;">${formatCurrency(p.price)}</p>
                            <p style="font-size:11px; color:#999;">Stock: ${p.stock || 0} | Sales: ${p.totalSales || 0}</p>
                            <span style="font-size:10px; padding:2px 8px; border-radius:8px; 
                                         background:${p.status === 'active' ? '#E8F5E9' : '#FFEBEE'}; 
                                         color:${p.status === 'active' ? '#2E7D32' : '#C62828'};">
                                ${p.status}
                            </span>
                        </div>
                        <div style="display:flex; flex-direction:column; gap:4px;">
                            <button class="btn-small-gold" onclick="toggleProductStatus('${p.id}', '${p.status}')">
                                ${p.status === 'active' ? 'Disable' : 'Enable'}
                            </button>
                            <button class="btn-text" style="color:#FF4444; font-size:11px;" 
                                    onclick="deleteProduct('${p.id}')">Delete</button>
                        </div>
                    </div>
                `).join('') : '<p style="text-align:center;color:#999;padding:20px;">No products yet</p>'}
            </div>
        </div>
        
        <!-- Recent Orders -->
        <div class="section">
            <h3 class="section-title">Recent Orders</h3>
            <div id="merchant-orders-list">
                ${orders.length > 0 ? orders.slice(0, 10).map(o => `
                    <div style="background:white; padding:12px; border-radius:10px; margin-bottom:8px; 
                                box-shadow:0 1px 4px rgba(0,0,0,0.05);">
                        <div style="display:flex; justify-content:space-between;">
                            <p style="font-weight:600; font-size:13px;">Order #${o.id.slice(-8)}</p>
                            <span class="status-${o.status}" style="font-size:10px; padding:2px 8px; border-radius:8px;">
                                ${o.status}
                            </span>
                        </div>
                        <p style="font-size:12px; color:#666;">${o.productName} x${o.quantity}</p>
                        <p style="font-size:13px; font-weight:600; color:#FFD700;">${formatCurrency(o.total)}</p>
                        <p style="font-size:11px; color:#999;">${timeAgo(o.createdAt)}</p>
                    </div>
                `).join('') : '<p style="text-align:center;color:#999;padding:20px;">No orders yet</p>'}
            </div>
        </div>
    `;
}

async function subscribeToMerchant() {
    if (!requireAuth()) return;
    showLoader();
    
    try {
        const txRef = generateId('mer');
        
        FlutterwaveCheckout({
            public_key: FLUTTERWAVE_PUBLIC_KEY,
            tx_ref: txRef,
            amount: PLATFORM_CONFIG.merchantSubscriptionPrice,
            currency: 'USD',
            payment_options: 'card',
            customer: {
                email: APP_STATE.currentUser.email,
                name: APP_STATE.userProfile?.displayName || 'User'
            },
            customizations: {
                title: 'ServiConnect Merchant',
                description: 'Monthly Merchant Subscription',
                logo: 'app-icon.png'
            },
            callback: async function(response) {
                if (response.status === 'successful') {
                    await updateUserProfile({
                        isMerchant: true,
                        merchantSubscription: 'active',
                        merchantSince: firebase.firestore.FieldValue.serverTimestamp(),
                        membership: APP_STATE.userProfile?.isAffiliate ? 'both' : 'merchant'
                    });
                    
                    await saveToFirestore('transactions', txRef, {
                        userId: APP_STATE.currentUser.uid,
                        type: 'merchant_subscription',
                        amount: PLATFORM_CONFIG.merchantSubscriptionPrice,
                        reference: txRef,
                        status: 'completed',
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    
                    hideLoader();
                    showToast('🎉 Welcome to Merchant Program!', 'success');
                    navigateTo('store-setup');
                }
            },
            onclose: function() {
                hideLoader();
                showToast('Payment cancelled', 'warning');
            }
        });
    } catch (error) {
        hideLoader();
        console.error('Subscription error:', error);
        showToast('Subscription failed', 'error');
    }
}

async function toggleProductStatus(productId, currentStatus) {
    const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
    await saveToFirestore('products', productId, { status: newStatus });
    showToast(`Product ${newStatus}`, 'success');
    loadMerchantDashboard();
}

async function deleteProduct(productId) {
    const confirmed = confirm('Delete this product permanently?');
    if (!confirmed) return;
    
    await deleteFromFirestore('products', productId);
    showToast('Product deleted', 'success');
    loadMerchantDashboard();
}