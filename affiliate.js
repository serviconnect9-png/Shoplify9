// ============ Affiliate Module ============

async function loadAffiliateDashboard() {
    if (!requireAuth()) return;
    
    const profile = await refreshUserProfile();
    const container = document.getElementById('affiliate-content');
    if (!container) return;
    
    // Check subscription
    if (!profile.isAffiliate || profile.affiliateSubscription !== 'active') {
        container.innerHTML = renderAffiliateSubscriptionPrompt();
        return;
    }
    
    // Check suspension
    const suspension = await checkSuspensionStatus(APP_STATE.currentUser.uid);
    
    // Load affiliate products
    const affiliateSnapshot = await db.collection('affiliate_products')
        .where('affiliateId', '==', APP_STATE.currentUser.uid)
        .where('status', '==', 'active')
        .get();
    
    const affiliateProducts = affiliateSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Calculate totals
    const totalClicks = affiliateProducts.reduce((sum, p) => sum + (p.clicks || 0), 0);
    const totalConversions = affiliateProducts.reduce((sum, p) => sum + (p.conversions || 0), 0);
    
    container.innerHTML = `
        ${suspension.isBanned ? `
            <div style="background:#FFEBEE; padding:16px; border-radius:12px; margin-bottom:16px; text-align:center;">
                <i class="fas fa-ban" style="font-size:40px; color:#FF4444; display:block; margin-bottom:8px;"></i>
                <h3 style="color:#C62828;">Account Suspended</h3>
                <p style="color:#666; font-size:13px;">You have been suspended ${suspension.suspensionCount} times and can no longer install products.</p>
            </div>
        ` : ''}
        
        <!-- Stats -->
        <div class="affiliate-stats">
            <div class="affiliate-stat-card">
                <p style="font-size:24px; font-weight:800; color:#FFD700;">${formatCurrency(profile.affiliateEarnings || 0)}</p>
                <p style="font-size:11px; color:#999;">Total Earnings</p>
            </div>
            <div class="affiliate-stat-card">
                <p style="font-size:24px; font-weight:800; color:#FFBB33;">${formatCurrency(profile.pendingEarnings || 0)}</p>
                <p style="font-size:11px; color:#999;">Pending</p>
            </div>
            <div class="affiliate-stat-card">
                <p style="font-size:24px; font-weight:800; color:#00C851;">${formatCurrency((profile.affiliateEarnings || 0) - (profile.pendingEarnings || 0))}</p>
                <p style="font-size:11px; color:#999;">Withdrawable</p>
            </div>
        </div>
        
        <!-- Performance Stats -->
        <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-bottom:20px;">
            <div style="background:white; padding:12px; border-radius:12px; text-align:center; box-shadow:0 2px 8px rgba(0,0,0,0.05);">
                <p style="font-size:20px; font-weight:700;">${formatNumber(totalClicks)}</p>
                <p style="font-size:11px; color:#999;">Total Clicks</p>
            </div>
            <div style="background:white; padding:12px; border-radius:12px; text-align:center; box-shadow:0 2px 8px rgba(0,0,0,0.05);">
                <p style="font-size:20px; font-weight:700;">${formatNumber(totalConversions)}</p>
                <p style="font-size:11px; color:#999;">Conversions</p>
            </div>
            <div style="background:white; padding:12px; border-radius:12px; text-align:center; box-shadow:0 2px 8px rgba(0,0,0,0.05);">
                <p style="font-size:20px; font-weight:700;">${totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(1) : '0'}%</p>
                <p style="font-size:11px; color:#999;">Conv. Rate</p>
            </div>
        </div>
        
        <!-- Access Products Button -->
        <button class="btn-gold mb-20" onclick="accessAffiliateProducts()" style="width:100%;" 
                ${suspension.isBanned ? 'disabled' : ''}>
            <i class="fas fa-search"></i> Access Products
        </button>
        
        <!-- My Affiliate Products -->
        <div class="section">
            <h3 class="section-title">My Products (${affiliateProducts.length})</h3>
            <div id="affiliate-products-list">
                ${affiliateProducts.length > 0 ? affiliateProducts.map(p => renderAffiliateProductCard(p)).join('') : `
                    <div style="text-align:center; padding:40px; color:#999;">
                        <i class="fas fa-link" style="font-size:48px; display:block; margin-bottom:12px;"></i>
                        <p>No products installed yet</p>
                        <p style="font-size:12px;">Click "Access Products" to start</p>
                    </div>
                `}
            </div>
        </div>
    `;
}

function renderAffiliateSubscriptionPrompt() {
    return `
        <div style="text-align:center; padding:20px;">
            <img src="app-icon.png" width="80" height="80" style="border-radius:18px; margin-bottom:16px;">
            <div class="subscription-banner">
                <i class="fas fa-link" style="font-size:48px; margin-bottom:12px; display:block;"></i>
                <h3>Become an Affiliate</h3>
                <p>Earn commissions by promoting products globally.</p>
                <p style="font-weight:700; font-size:20px; margin:12px 0;">$3/month</p>
                <button class="btn-gold" onclick="subscribeToAffiliate()" style="width:100%;">
                    Subscribe Now
                </button>
            </div>
            
            <div style="background:white; border-radius:12px; padding:20px; margin-top:16px; text-align:left; box-shadow:0 2px 8px rgba(0,0,0,0.05);">
                <h4 style="margin-bottom:12px;">Affiliate Benefits:</h4>
                <p>📱 Share unique product links</p>
                <p>💰 Earn commission on every sale</p>
                <p>📊 Real-time performance tracking</p>
                <p>🌍 Promote to 180+ countries</p>
                <p>🔗 Generate unlimited affiliate links</p>
                <p>💵 Weekly commission payouts</p>
            </div>
        </div>
    `;
}

function renderAffiliateProductCard(product) {
    return `
        <div class="affiliate-product-card" style="position:relative;">
            <img src="${product.productImage || 'app-icon.png'}" alt="${product.productName}" 
                 class="affiliate-product-image" style="width:70px; height:70px; border-radius:10px; object-fit:cover;">
            <div class="affiliate-product-info" style="flex:1;">
                <p style="font-weight:600; font-size:14px;">${product.productName}</p>
                <p style="font-size:12px; color:#00C851;">Price: ${formatCurrency(product.productPrice)} | +${product.commissionPercentage}%</p>
                <p class="affiliate-link" onclick="copyToClipboard('${product.affiliateLink}')" style="cursor:pointer; color:#33B5E5; font-size:11px;">
                    📋 ${truncateText(product.affiliateLink, 35)}
                </p>
                <div style="display:flex; gap:12px; font-size:11px; color:#999; margin-top:4px;">
                    <span>👁 ${product.clicks || 0}</span>
                    <span>✅ ${product.conversions || 0}</span>
                    <span>💰 ${formatCurrency(product.totalCommission || 0)}</span>
                    <span>📦 Stock: ${product.stock || 0}</span>
                </div>
                ${product.campaignEndDate ? `
                    <p style="font-size:10px; color:#FF4444;">Ends: ${formatDate(product.campaignEndDate)}</p>
                ` : ''}
                <p style="font-size:10px; color:#999;">👥 ${product.totalAffiliates || 1} affiliates</p>
            </div>
            <button style="position:absolute; top:8px; right:8px; background:none; border:none; color:#FF4444; cursor:pointer;"
                    onclick="event.stopPropagation(); removeAffiliateProduct('${product.id}')">
                <i class="fas fa-times"></i>
            </button>
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
            customer: {
                email: APP_STATE.currentUser.email,
                name: APP_STATE.userProfile?.displayName || 'User'
            },
            customizations: {
                title: 'ServiConnect Affiliate',
                description: 'Monthly Affiliate Subscription',
                logo: 'app-icon.png'
            },
            callback: async function(response) {
                if (response.status === 'successful') {
                    await updateUserProfile({
                        isAffiliate: true,
                        affiliateSubscription: 'active',
                        affiliateSince: firebase.firestore.FieldValue.serverTimestamp(),
                        membership: APP_STATE.userProfile?.isMerchant ? 'both' : 'affiliate'
                    });
                    
                    await saveToFirestore('transactions', txRef, {
                        userId: APP_STATE.currentUser.uid,
                        type: 'affiliate_subscription',
                        amount: PLATFORM_CONFIG.affiliateSubscriptionPrice,
                        reference: txRef,
                        status: 'completed',
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    
                    hideLoader();
                    showToast('🎉 Welcome to Affiliate Program!', 'success');
                    loadAffiliateDashboard();
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

async function accessAffiliateProducts() {
    if (!requireAuth()) return;
    
    const suspension = await checkSuspensionStatus(APP_STATE.currentUser.uid);
    if (suspension.isBanned) {
        showToast('❌ Cannot install products - Account suspended', 'error');
        return;
    }
    
    navigateTo('marketplace');
    showToast('Browse products and click to install them', 'info');
}

async function startProductInstallation(productId) {
    if (!requireAuth()) return;
    
    // Check suspension
    const suspension = await checkSuspensionStatus(APP_STATE.currentUser.uid);
    if (suspension.isBanned) {
        showToast('❌ Cannot install - Account suspended after 3 violations', 'error');
        goBack();
        return;
    }
    
    const container = document.getElementById('affiliate-install-content');
    if (!container) return;
    
    const product = await getFromFirestore('products', productId);
    if (!product) {
        showToast('Product not found', 'error');
        goBack();
        return;
    }
    
    // Device analysis simulation
    container.innerHTML = `
        <div class="install-loader" style="text-align:center; padding:40px 20px;">
            <img src="app-icon.png" width="100" height="100" style="border-radius:20px; animation: loaderPulse 1.5s ease-in-out infinite;">
            <h3 style="margin:20px 0 10px;">Installing Product</h3>
            <p style="color:#666; font-size:14px;">${product.name}</p>
            
            <div class="install-progress-bar" style="width:100%; height:6px; background:#eee; border-radius:3px; margin:20px 0; overflow:hidden;">
                <div class="install-progress-fill" style="height:100%; background:#FFD700; border-radius:3px; width:0%; transition: width 0.1s;"></div>
            </div>
            
            <p class="install-status" style="color:#999; font-size:13px;">Analyzing device...</p>
            <p class="install-percent" style="font-size:24px; font-weight:700; color:#FFD700;">0%</p>
        </div>
    `;
    
    // Simulate 5-second installation with stages
    const stages = [
        { percent: 10, text: 'Checking device compatibility...', delay: 500 },
        { percent: 25, text: 'Verifying account standing...', delay: 800 },
        { percent: 45, text: 'Generating affiliate link...', delay: 1000 },
        { percent: 65, text: 'Setting up tracking...', delay: 800 },
        { percent: 80, text: 'Installing product media...', delay: 700 },
        { percent: 95, text: 'Finalizing installation...', delay: 700 },
        { percent: 100, text: 'Installation complete!', delay: 500 }
    ];
    
    const fillBar = container.querySelector('.install-progress-fill');
    const statusText = container.querySelector('.install-status');
    const percentText = container.querySelector('.install-percent');
    
    for (const stage of stages) {
        await new Promise(resolve => setTimeout(resolve, stage.delay));
        if (fillBar) fillBar.style.width = stage.percent + '%';
        if (statusText) statusText.textContent = stage.text;
        if (percentText) percentText.textContent = stage.percent + '%';
    }
    
    // Complete installation
    setTimeout(async () => {
        await completeProductInstallation(product, productId, container);
    }, 500);
}

async function completeProductInstallation(product, productId, container) {
    try {
        // Check if already installed
        const existing = await db.collection('affiliate_products')
            .where('affiliateId', '==', APP_STATE.currentUser.uid)
            .where('productId', '==', productId)
            .where('status', '==', 'active')
            .get();
        
        if (!existing.empty) {
            container.innerHTML = `
                <div style="text-align:center; padding:40px;">
                    <i class="fas fa-check-circle" style="font-size:60px; color:#FFD700;"></i>
                    <h3>Already Installed!</h3>
                    <p style="color:#666;">This product is already in your affiliate dashboard.</p>
                    <button class="btn-gold mt-20" onclick="navigateTo('affiliate')">Go to Dashboard</button>
                </div>`;
            return;
        }
        
        // Generate affiliate link
        const affiliateLink = generateAffiliateLink(APP_STATE.currentUser.uid, productId);
        
        // Save to affiliate_products collection
        const installId = generateId('inst');
        await saveToFirestore('affiliate_products', installId, {
            affiliateId: APP_STATE.currentUser.uid,
            productId: productId,
            productName: product.name,
            productImage: product.images?.[0] || '',
            productPrice: product.price,
            commissionPercentage: product.commissionPercentage || 0,
            affiliateLink: affiliateLink,
            status: 'active',
            clicks: 0,
            conversions: 0,
            totalCommission: 0,
            stock: product.stock || 0,
            totalAffiliates: (product.totalAffiliates || 0) + 1,
            installedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Update product's total affiliates count
        await saveToFirestore('products', productId, {
            totalAffiliates: firebase.firestore.FieldValue.increment(1)
        });
        
        container.innerHTML = `
            <div style="text-align:center; padding:40px;">
                <img src="app-icon.png" width="80" height="80" style="border-radius:18px; margin-bottom:16px;">
                <i class="fas fa-check-circle" style="font-size:60px; color:#00C851; display:block; margin-bottom:12px;"></i>
                <h3>Product Installed!</h3>
                <p style="color:#666; margin:8px 0;">${product.name}</p>
                
                <div style="background:#f5f5f5; border-radius:12px; padding:16px; margin:16px 0; word-break:break-all;">
                    <p style="font-size:12px; color:#999; margin-bottom:4px;">Your Affiliate Link:</p>
                    <p style="font-size:13px; color:#33B5E5; font-weight:600;">${affiliateLink}</p>
                    <button class="btn-small-gold mt-10" onclick="copyToClipboard('${affiliateLink}')">
                        <i class="fas fa-copy"></i> Copy Link
                    </button>
                </div>
                
                <div style="display:flex; gap:10px; margin-top:16px;">
                    <button class="btn-gold" onclick="navigateTo('affiliate')" style="flex:1;">
                        View Dashboard
                    </button>
                    <button class="btn-gold" onclick="navigateTo('marketplace')" style="flex:1;">
                        Install More
                    </button>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Installation error:', error);
        container.innerHTML = `
            <div style="text-align:center; padding:40px;">
                <i class="fas fa-times-circle" style="font-size:60px; color:#FF4444;"></i>
                <h3>Installation Failed</h3>
                <p style="color:#666;">Please try again later.</p>
                <button class="btn-gold mt-20" onclick="goBack()">Go Back</button>
            </div>`;
    }
}

async function removeAffiliateProduct(installId) {
    const confirmed = confirm('Remove this product from your affiliate list?');
    if (!confirmed) return;
    
    try {
        await saveToFirestore('affiliate_products', installId, { status: 'inactive' });
        showToast('Product removed', 'success');
        loadAffiliateDashboard();
    } catch (error) {
        console.error('Remove error:', error);
        showToast('Error removing product', 'error');
    }
}

// ============ Track Affiliate Click ============
async function trackAffiliateClick(affiliateId, productId) {
    if (!affiliateId || !productId) return;
    
    try {
        // Find affiliate product record
        const snapshot = await db.collection('affiliate_products')
            .where('affiliateId', '==', affiliateId)
            .where('productId', '==', productId)
            .where('status', '==', 'active')
            .limit(1)
            .get();
        
        if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            await db.collection('affiliate_products').doc(doc.id).update({
                clicks: firebase.firestore.FieldValue.increment(1)
            });
            
            // Record click event
            await saveToFirestore('affiliate_clicks', generateId('clk'), {
                affiliateId,
                productId,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                userAgent: navigator.userAgent,
                referrer: document.referrer || 'direct'
            });
        }
    } catch (error) {
        console.error('Track click error:', error);
    }
}

// Check for affiliate tracking on page load
(function checkAffiliateRoute() {
    const path = window.location.pathname;
    const match = path.match(/\/r\/([^\/]+)\/([^\/]+)/);
    if (match) {
        const [, affiliateId, productId] = match;
        trackAffiliateClick(affiliateId, productId);
        // Redirect to product page
        navigateTo('product-detail', productId);
    }
})();