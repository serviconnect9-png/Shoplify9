// ============ Affiliate Module ============

async function loadAffiliateDashboard() {
    if (!requireAuth()) return;
    const profile = await refreshUserProfile();
    const container = document.getElementById('affiliate-content');
    if (!container) return;
    
    if (!profile.isAffiliate || profile.affiliateSubscription !== 'active') {
        container.innerHTML = `
            <div style="text-align:center;padding:20px;">
                <img src="app-icon.png" width="80" height="80" style="border-radius:18px;margin-bottom:16px;">
                <div class="subscription-banner">
                    <i class="fas fa-link" style="font-size:48px;margin-bottom:12px;display:block;"></i>
                    <h3>Become an Affiliate</h3>
                    <p>Earn commissions by promoting products globally.</p>
                    <p style="font-weight:700;font-size:20px;margin:12px 0;">$3/month</p>
                    <button class="btn-gold" onclick="subscribeToAffiliate()" style="width:100%;">Subscribe Now</button>
                </div>
                <div style="background:white;border-radius:12px;padding:20px;margin-top:16px;text-align:left;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
                    <h4>Benefits:</h4>
                    <p>📱 Share unique product links</p>
                    <p>💰 Earn commission on every sale</p>
                    <p>📊 Real-time performance tracking</p>
                    <p>🌍 Promote to 180+ countries</p>
                    <p>💵 Commission paid to wallet</p>
                </div>
            </div>`;
        return;
    }
    
    const suspension = await checkSuspensionStatus(APP_STATE.currentUser.uid);
    
    const affSnapshot = await db.collection('affiliate_products')
        .where('affiliateId', '==', APP_STATE.currentUser.uid)
        .where('status', '==', 'active')
        .get();
    
    const affProducts = affSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const totalClicks = affProducts.reduce((s, p) => s + (p.clicks || 0), 0);
    const totalConversions = affProducts.reduce((s, p) => s + (p.conversions || 0), 0);
    
    container.innerHTML = `
        ${suspension.isBanned ? '<div style="background:#FFEBEE;padding:16px;border-radius:12px;margin-bottom:16px;text-align:center;"><i class="fas fa-ban" style="font-size:40px;color:#FF4444;"></i><h3 style="color:#C62828;">Account Suspended</h3><p>You have been suspended ${suspension.suspensionCount} times.</p></div>' : ''}
        
        <div class="affiliate-stats">
            <div class="affiliate-stat-card"><p style="font-size:24px;font-weight:800;color:#FFD700;">${formatCurrency(profile.affiliateEarnings || 0)}</p><p style="font-size:11px;color:#999;">Total Earnings</p></div>
            <div class="affiliate-stat-card"><p style="font-size:24px;font-weight:800;color:#FFBB33;">${formatCurrency(profile.pendingEarnings || 0)}</p><p style="font-size:11px;color:#999;">Pending</p></div>
            <div class="affiliate-stat-card"><p style="font-size:24px;font-weight:800;color:#00C851;">${formatCurrency((profile.affiliateEarnings||0)-(profile.pendingEarnings||0))}</p><p style="font-size:11px;color:#999;">Withdrawable</p></div>
        </div>
        
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:20px;">
            <div style="background:white;padding:12px;border-radius:12px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.05);"><p style="font-size:20px;font-weight:700;">${formatNumber(totalClicks)}</p><p style="font-size:11px;color:#999;">Clicks</p></div>
            <div style="background:white;padding:12px;border-radius:12px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.05);"><p style="font-size:20px;font-weight:700;">${formatNumber(totalConversions)}</p><p style="font-size:11px;color:#999;">Sales</p></div>
            <div style="background:white;padding:12px;border-radius:12px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.05);"><p style="font-size:20px;font-weight:700;">${totalClicks>0?((totalConversions/totalClicks)*100).toFixed(1):'0'}%</p><p style="font-size:11px;color:#999;">Rate</p></div>
        </div>
        
        <button class="btn-gold mb-20" onclick="accessAffiliateProducts()" style="width:100%;" ${suspension.isBanned?'disabled':''}><i class="fas fa-search"></i> Access Products</button>
        
        <div class="section"><h3 class="section-title">My Products (${affProducts.length})</h3>
            <div id="affiliate-products-list">
                ${affProducts.length>0 ? affProducts.map(p => `
                    <div class="affiliate-product-card" style="position:relative;">
                        <img src="${p.productImage || 'app-icon.png'}" style="width:70px;height:70px;border-radius:10px;object-fit:cover;">
                        <div style="flex:1;">
                            <p style="font-weight:600;font-size:14px;">${p.productName}</p>
                            <p style="font-size:12px;color:#00C851;">${formatCurrency(p.productPrice)} | +${p.commissionPercentage}%</p>
                            <p onclick="copyToClipboard('${p.affiliateLink}')" style="cursor:pointer;color:#33B5E5;font-size:11px;">📋 ${truncateText(p.affiliateLink,35)}</p>
                            <div style="display:flex;gap:12px;font-size:11px;color:#999;margin-top:4px;">
                                <span>👁 ${p.clicks||0}</span><span>✅ ${p.conversions||0}</span><span>💰 ${formatCurrency(p.totalCommission||0)}</span>
                            </div>
                            ${p.campaignEndDate ? `<p style="font-size:10px;color:#FF4444;">Ends: ${formatDate(p.campaignEndDate)}</p>` : ''}
                        </div>
                        <button style="position:absolute;top:8px;right:8px;background:none;border:none;color:#FF4444;cursor:pointer;" onclick="event.stopPropagation();removeAffiliateProduct('${p.id}')"><i class="fas fa-times"></i></button>
                    </div>
                `).join('') : '<p style="text-align:center;color:#999;padding:40px;">No products installed. Click "Access Products" to start!</p>'}
            </div>
        </div>
    `;
}

async function subscribeToAffiliate() {
    if (!requireAuth()) return;
    showLoader();
    try {
        const txRef = generateId('aff');
        FlutterwaveCheckout({
            public_key: FLUTTERWAVE_PUBLIC_KEY,
            tx_ref: txRef,
            amount: PLATFORM_CONFIG.affiliateSubscriptionPrice,
            currency: 'USD',
            payment_options: 'card',
            customer: { email: APP_STATE.currentUser.email, name: APP_STATE.userProfile?.displayName || 'User' },
            customizations: { title: 'Shoplify Affiliate', description: 'Monthly Subscription', logo: 'app-icon.png' },
            callback: async function(response) {
                if (response.status === 'successful') {
                    await updateUserProfile({ isAffiliate: true, affiliateSubscription: 'active', affiliateSince: firebase.firestore.FieldValue.serverTimestamp(), membership: APP_STATE.userProfile?.isMerchant ? 'both' : 'affiliate' });
                    await saveToFirestore('transactions', txRef, { userId: APP_STATE.currentUser.uid, type: 'affiliate_subscription', amount: PLATFORM_CONFIG.affiliateSubscriptionPrice, reference: txRef, status: 'completed', createdAt: firebase.firestore.FieldValue.serverTimestamp() });
                    hideLoader();
                    showToast('🎉 Welcome to Affiliate Program!', 'success');
                    loadAffiliateDashboard();
                }
            },
            onclose: function() { hideLoader(); showToast('Cancelled', 'warning'); }
        });
    } catch (e) { hideLoader(); showToast('Error', 'error'); }
}

async function accessAffiliateProducts() {
    const suspension = await checkSuspensionStatus(APP_STATE.currentUser.uid);
    if (suspension.isBanned) { showToast('❌ Account suspended', 'error'); return; }
    navigateTo('marketplace');
}

async function startProductInstallation(productId) {
    if (!requireAuth()) return;
    const suspension = await checkSuspensionStatus(APP_STATE.currentUser.uid);
    if (suspension.isBanned) { showToast('❌ Cannot install - Account suspended', 'error'); goBack(); return; }
    
    const container = document.getElementById('affiliate-install-content');
    if (!container) return;
    
    const product = await getFromFirestore('products', productId);
    if (!product) { showToast('Product not found', 'error'); goBack(); return; }
    
    container.innerHTML = `
        <div style="text-align:center;padding:40px 20px;">
            <img src="app-icon.png" width="100" height="100" style="border-radius:20px;animation:loaderPulse 1.5s ease-in-out infinite;">
            <h3 style="margin:20px 0 10px;">Installing Product</h3>
            <p style="color:#666;">${product.name}</p>
            <div style="width:100%;height:6px;background:#eee;border-radius:3px;margin:20px 0;overflow:hidden;"><div id="install-fill" style="height:100%;background:#FFD700;border-radius:3px;width:0%;transition:width 0.1s;"></div></div>
            <p id="install-status" style="color:#999;">Analyzing device...</p>
            <p id="install-percent" style="font-size:24px;font-weight:700;color:#FFD700;">0%</p>
        </div>`;
    
    const stages = [
        { p: 10, t: 'Checking compatibility...', d: 500 },
        { p: 25, t: 'Verifying account...', d: 800 },
        { p: 45, t: 'Generating affiliate link...', d: 1000 },
        { p: 65, t: 'Setting up tracking...', d: 800 },
        { p: 80, t: 'Installing product media...', d: 700 },
        { p: 95, t: 'Finalizing...', d: 700 },
        { p: 100, t: 'Complete!', d: 500 }
    ];
    
    const fill = document.getElementById('install-fill');
    const status = document.getElementById('install-status');
    const percent = document.getElementById('install-percent');
    
    for (const s of stages) {
        await new Promise(r => setTimeout(r, s.d));
        if (fill) fill.style.width = s.p + '%';
        if (status) status.textContent = s.t;
        if (percent) percent.textContent = s.p + '%';
    }
    
    setTimeout(async () => {
        const existing = await db.collection('affiliate_products').where('affiliateId','==',APP_STATE.currentUser.uid).where('productId','==',productId).where('status','==','active').get();
        if (!existing.empty) {
            container.innerHTML = `<div style="text-align:center;padding:40px;"><i class="fas fa-check-circle" style="font-size:60px;color:#FFD700;"></i><h3>Already Installed!</h3><button class="btn-gold mt-20" onclick="navigateTo('affiliate')">Go to Dashboard</button></div>`;
            return;
        }
        
        const link = generateAffiliateLink(APP_STATE.currentUser.uid, productId);
        const installId = generateId('inst');
        await saveToFirestore('affiliate_products', installId, {
            affiliateId: APP_STATE.currentUser.uid, productId, productName: product.name,
            productImage: product.images?.[0]||'', productPrice: product.price,
            commissionPercentage: product.commissionPercentage||0, affiliateLink: link,
            status: 'active', clicks: 0, conversions: 0, totalCommission: 0,
            stock: product.stock||0, installedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        await saveToFirestore('products', productId, { totalAffiliates: firebase.firestore.FieldValue.increment(1) });
        
        container.innerHTML = `
            <div style="text-align:center;padding:40px;">
                <img src="app-icon.png" width="80" height="80" style="border-radius:18px;margin-bottom:16px;">
                <i class="fas fa-check-circle" style="font-size:60px;color:#00C851;"></i>
                <h3>Product Installed!</h3>
                <p style="color:#666;">${product.name}</p>
                <div style="background:#f5f5f5;border-radius:12px;padding:16px;margin:16px 0;word-break:break-all;">
                    <p style="font-size:12px;color:#999;">Your Affiliate Link:</p>
                    <p style="color:#33B5E5;font-weight:600;">${link}</p>
                    <button class="btn-small-gold mt-10" onclick="copyToClipboard('${link}')"><i class="fas fa-copy"></i> Copy</button>
                </div>
                <div style="display:flex;gap:10px;"><button class="btn-gold" onclick="navigateTo('affiliate')" style="flex:1;">Dashboard</button><button class="btn-gold" onclick="navigateTo('marketplace')" style="flex:1;">Install More</button></div>
            </div>`;
    }, 500);
}

async function removeAffiliateProduct(installId) {
    if (!confirm('Remove this product?')) return;
    await saveToFirestore('affiliate_products', installId, { status: 'inactive' });
    showToast('Removed', 'success');
    loadAffiliateDashboard();
}

async function trackAffiliateClick(affiliateId, productId) {
    if (!affiliateId || !productId) return;
    try {
        const snap = await db.collection('affiliate_products').where('affiliateId','==',affiliateId).where('productId','==',productId).where('status','==','active').limit(1).get();
        if (!snap.empty) {
            await db.collection('affiliate_products').doc(snap.docs[0].id).update({ clicks: firebase.firestore.FieldValue.increment(1) });
            await saveToFirestore('affiliate_clicks', generateId('clk'), { affiliateId, productId, timestamp: firebase.firestore.FieldValue.serverTimestamp() });
        }
    } catch (e) {}
}

(function checkAffRoute() {
    const match = window.location.pathname.match(/\/r\/([^\/]+)\/([^\/]+)/);
    if (match) { trackAffiliateClick(match[1], match[2]); sessionStorage.setItem('deep_link_product', match[2]); }
})();

window.subscribeToAffiliate = subscribeToAffiliate;
window.accessAffiliateProducts = accessAffiliateProducts;
window.startProductInstallation = startProductInstallation;
window.removeAffiliateProduct = removeAffiliateProduct;

console.log('✅ Affiliate module ready');