// ============ Merchant Module ============

async function loadMerchantDashboard() {
    if (!requireAuth()) return;
    const isM = await checkSubscription('merchant');
    const container = document.getElementById('merchant-content');
    if (!container) return;
    
    if (!isM) {
        container.innerHTML = `
            <div style="text-align:center;padding:40px 20px;">
                <img src="app-icon.png" width="80" height="80" style="border-radius:18px;">
                <div class="subscription-banner">
                    <i class="fas fa-store" style="font-size:48px;display:block;margin-bottom:12px;"></i>
                    <h3>Become a Merchant</h3>
                    <p>Sell products globally.</p>
                    <p style="font-weight:700;font-size:20px;">$2/month</p>
                    <button class="btn-gold" onclick="subscribeToMerchant()" style="width:100%;">Subscribe Now</button>
                </div>
            </div>`;
        return;
    }
    
    const profile = await refreshUserProfile();
    if (!profile.storeActive) {
        container.innerHTML = `
            <div style="text-align:center;padding:40px;">
                <i class="fas fa-store" style="font-size:48px;color:#FFD700;"></i>
                <h3>Set Up Your Store</h3>
                <p style="color:#666;">Choose a template and start selling!</p>
                <button class="btn-gold mt-20" onclick="navigateTo('store-setup')">Set Up Store</button>
            </div>`;
        return;
    }
    
    const prodSnap = await db.collection('products').where('merchantId','==',APP_STATE.currentUser.uid).orderBy('createdAt','desc').get();
    const products = prodSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const activeProducts = products.filter(p => p.status === 'active');
    const totalRevenue = products.reduce((s, p) => s + (p.totalSales||0) * p.price, 0);
    
    const orderSnap = await db.collection('orders').where('merchantId','==',APP_STATE.currentUser.uid).orderBy('createdAt','desc').limit(20).get();
    const orders = orderSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    container.innerHTML = `
        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:20px;">
            <div class="admin-stat-card"><p style="font-size:28px;font-weight:800;color:#FFD700;">${activeProducts.length}</p><p style="font-size:12px;">Active Products</p></div>
            <div class="admin-stat-card"><p style="font-size:28px;font-weight:800;color:#00C851;">${formatCurrency(totalRevenue)}</p><p style="font-size:12px;">Revenue</p></div>
            <div class="admin-stat-card"><p style="font-size:28px;font-weight:800;color:#FFBB33;">${orders.filter(o=>['processing','shipped'].includes(o.status)).length}</p><p style="font-size:12px;">Pending Orders</p></div>
            <div class="admin-stat-card"><p style="font-size:28px;font-weight:800;color:#33B5E5;">${orders.length}</p><p style="font-size:12px;">Total Orders</p></div>
        </div>
        <div style="display:flex;gap:10px;margin-bottom:20px;">
            <button class="btn-gold" onclick="navigateTo('add-product')" style="flex:1;"><i class="fas fa-plus"></i> Add Product</button>
            <button class="btn-gold" onclick="navigateTo('store-setup')" style="flex:1;"><i class="fas fa-pen"></i> Edit Store</button>
        </div>
        <div class="section"><h3 class="section-title">My Products</h3>
            ${products.map(p => `
                <div style="display:flex;gap:10px;background:white;padding:10px;border-radius:10px;margin-bottom:8px;align-items:center;box-shadow:0 1px 4px rgba(0,0,0,0.05);">
                    <img src="${p.images?.[0]||'app-icon.png'}" style="width:50px;height:50px;border-radius:8px;object-fit:cover;">
                    <div style="flex:1;"><p style="font-weight:600;">${p.name}</p><p style="font-size:12px;color:#FFD700;">${formatCurrency(p.price)}</p><span style="font-size:10px;padding:2px 8px;border-radius:8px;background:${p.status==='active'?'#E8F5E9':'#FFEBEE'};color:${p.status==='active'?'#2E7D32':'#C62828'};">${p.status}</span></div>
                    <button class="btn-small-gold" onclick="toggleProductStatus('${p.id}','${p.status}')">${p.status==='active'?'Disable':'Enable'}</button>
                </div>
            `).join('') || '<p style="text-align:center;color:#999;">No products</p>'}
        </div>
        <div class="section"><h3 class="section-title">Recent Orders</h3>
            ${orders.slice(0,10).map(o => `
                <div style="background:white;padding:12px;border-radius:10px;margin-bottom:8px;">
                    <div style="display:flex;justify-content:space-between;"><p style="font-weight:600;">Order #${o.id.slice(-8)}</p><span style="font-size:10px;padding:2px 8px;border-radius:8px;background:#FFF3E0;">${o.status}</span></div>
                    <p style="font-size:12px;color:#666;">${o.items?.[0]?.name||'Product'} x${o.items?.[0]?.quantity||1}</p>
                    <p style="font-weight:600;color:#FFD700;">${formatCurrency(o.total)}</p>
                </div>
            `).join('') || '<p style="text-align:center;color:#999;">No orders</p>'}
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
            customer: { email: APP_STATE.currentUser.email, name: APP_STATE.userProfile?.displayName || 'User' },
            customizations: { title: 'Shoplify Merchant', description: 'Monthly Subscription', logo: 'app-icon.png' },
            callback: async function(response) {
                if (response.status === 'successful') {
                    await updateUserProfile({ isMerchant: true, merchantSubscription: 'active', merchantSince: firebase.firestore.FieldValue.serverTimestamp(), membership: APP_STATE.userProfile?.isAffiliate ? 'both' : 'merchant' });
                    await saveToFirestore('transactions', txRef, { userId: APP_STATE.currentUser.uid, type: 'merchant_subscription', amount: PLATFORM_CONFIG.merchantSubscriptionPrice, reference: txRef, status: 'completed', createdAt: firebase.firestore.FieldValue.serverTimestamp() });
                    hideLoader();
                    showToast('🎉 Welcome! Set up your store.', 'success');
                    navigateTo('store-setup');
                }
            },
            onclose: function() { hideLoader(); showToast('Cancelled', 'warning'); }
        });
    } catch (e) { hideLoader(); showToast('Error', 'error'); }
}

async function toggleProductStatus(productId, status) {
    await saveToFirestore('products', productId, { status: status === 'active' ? 'disabled' : 'active' });
    showToast('Updated', 'success');
    loadMerchantDashboard();
}

window.subscribeToMerchant = subscribeToMerchant;
window.toggleProductStatus = toggleProductStatus;

console.log('✅ Merchant module ready');