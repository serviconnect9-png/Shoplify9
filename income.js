// income.js - COMPLETE UPDATED FILE (Affiliate, Merchant, Analytics, Leaderboard, Hall of Fame, Top Earners)

// =====================
// AFFILIATE DASHBOARD
// =====================
async function loadAffiliateDashboard() {
    if (!APP.userProfile?.isAffiliate) {
        showToast('Subscribe to access affiliate dashboard', 'error');
        navigateTo('profile');
        return;
    }
    
    // Check subscription expiry
    if (APP.userProfile.affiliateSubscriptionExpiry) {
        const expiry = APP.userProfile.affiliateSubscriptionExpiry.toDate();
        if (expiry < new Date()) {
            showToast('Your affiliate subscription has expired. Please renew.', 'error');
            navigateTo('profile');
            return;
        }
    }
    
    const container = document.getElementById('affiliate-content');
    if (!container) return;
    
    container.innerHTML = '<p style="text-align:center;padding:40px;">Loading dashboard...</p>';
    
    try {
        const installedSnapshot = await db.collection('affiliate_products')
            .where('affiliateId', '==', APP.userProfile.uid)
            .get();
        
        let totalClicks = 0;
        let totalConversions = 0;
        let totalCommission = 0;
        const products = [];
        
        installedSnapshot.forEach(doc => {
            const data = doc.data();
            totalClicks += data.clicks || 0;
            totalConversions += data.conversions || 0;
            totalCommission += data.totalCommission || 0;
            products.push({ id: doc.id, ...data });
        });
        
        const conversionRate = totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(1) : '0.0';
        
        container.innerHTML = `
            <div style="padding:15px;">
                <div class="affiliate-stats">
                    <div class="stat-card">
                        <div class="stat-value">${totalClicks.toLocaleString()}</div>
                        <div class="stat-label">Total Clicks</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${totalConversions}</div>
                        <div class="stat-label">Conversions</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${conversionRate}%</div>
                        <div class="stat-label">Conversion Rate</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${formatCurrency(totalCommission)}</div>
                        <div class="stat-label">Total Earned</div>
                    </div>
                </div>
                
                <div class="affiliate-link-box" style="margin-top:15px;">
                    <h4>🔗 Your Affiliate Link</h4>
                    <div class="affiliate-link-display">${APP.baseUrl}/r/${APP.userProfile.uid}</div>
                    <button class="copy-btn" onclick="copyToClipboard('${APP.baseUrl}/r/${APP.userProfile.uid}')">📋 Copy Link</button>
                </div>
                
                <div style="display:flex;gap:10px;margin:15px 0;">
                    <button class="btn-gold" style="flex:1;" onclick="navigateTo('affiliate-install')">📢 Install Products</button>
                    <button class="btn-outline" style="flex:1;" onclick="navigateTo('advertisers')">🤝 Advertisers</button>
                </div>
                
                <button class="btn-outline btn-full" style="margin-bottom:15px;" onclick="navigateTo('analytics')">
                    📊 View Full Analytics
                </button>
                
                <h4>📦 Installed Products (${products.length})</h4>
                <div id="installed-products-list">
                    ${products.length === 0 ? '<p style="color:#999;padding:20px;text-align:center;">No products installed yet. Go to Install Products to get started!</p>' : ''}
                </div>
            </div>
        `;
        
        if (products.length > 0) {
            const listContainer = document.getElementById('installed-products-list');
            products.forEach(product => {
                listContainer.innerHTML += `
                    <div style="display:flex;gap:12px;padding:12px;background:white;border-radius:12px;box-shadow:var(--shadow);margin-bottom:10px;align-items:center;">
                        <img src="${product.productImage || 'app-icon.png'}" style="width:55px;height:55px;object-fit:cover;border-radius:8px;" onerror="this.src='app-icon.png'">
                        <div style="flex:1;">
                            <div style="font-weight:600;font-size:14px;">${product.productName}</div>
                            <div style="font-size:12px;color:#666;">
                                👆 ${product.clicks || 0} clicks | 💰 ${formatCurrency(product.totalCommission || 0)} earned
                            </div>
                            <div style="font-size:11px;color:#999;">Commission: ${product.commissionPercentage || APP.affiliateCommissionMin}%</div>
                        </div>
                        <button class="copy-btn" onclick="copyToClipboard('${product.affiliateLink}');showToast('Link copied!', 'success');">📋</button>
                    </div>`;
            });
        }
        
    } catch (error) {
        console.error('Affiliate dashboard error:', error);
        container.innerHTML = '<p style="text-align:center;padding:40px;">Error loading. <button class="btn-outline" onclick="loadAffiliateDashboard()">Retry</button></p>';
    }
}

// =====================
// ADVERTISERS
// =====================
async function loadAdvertisers() {
    const container = document.getElementById('advertisers-list');
    if (!container) return;
    
    container.innerHTML = '<p style="text-align:center;padding:40px;">Loading advertisers...</p>';
    
    try {
        const snapshot = await db.collection('advertisers')
            .where('status', '==', 'active')
            .get();
        
        if (snapshot.empty) {
            container.innerHTML = '<p style="text-align:center;padding:40px;">No advertisers available yet</p>';
            return;
        }
        
        const advertisers = [];
        snapshot.forEach(doc => advertisers.push({ id: doc.id, ...doc.data() }));
        advertisers.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        
        container.innerHTML = '';
        advertisers.forEach(ad => {
            container.innerHTML += `
                <div style="padding:15px;background:white;border-radius:12px;box-shadow:var(--shadow);margin-bottom:12px;">
                    <div style="display:flex;gap:12px;align-items:center;margin-bottom:10px;">
                        <img src="${ad.photoURL || 'app-icon.png'}" style="width:50px;height:50px;border-radius:50%;" onerror="this.src='app-icon.png'">
                        <div>
                            <div style="font-weight:600;">${ad.name || 'Advertiser'}</div>
                            <div style="color:#666;font-size:13px;">⭐ ${ad.rating || '0'} | ${ad.platform || 'Social Media'}</div>
                        </div>
                    </div>
                    <p style="font-size:14px;color:#666;">${ad.description || 'No description available'}</p>
                    ${ad.whatsappLink ? `
                        <a href="${ad.whatsappLink}" target="_blank" style="display:inline-block;margin-top:10px;padding:8px 16px;background:#25D366;color:white;border-radius:8px;text-decoration:none;font-weight:600;">
                            💬 Contact on WhatsApp
                        </a>
                    ` : ''}
                </div>`;
        });
    } catch (error) {
        console.error('Advertisers error:', error);
        container.innerHTML = '<p style="text-align:center;padding:40px;">Unable to load advertisers</p>';
    }
}

// =====================
// AFFILIATE INSTALL (with loading animation)
// =====================
async function loadAffiliateInstall() {
    const container = document.getElementById('install-products');
    if (!container) return;
    
    container.innerHTML = '<p style="text-align:center;padding:40px;">Loading products...</p>';
    
    try {
        const snapshot = await db.collection('products')
            .where('status', '==', 'active')
            .get();
        
        if (snapshot.empty) {
            container.innerHTML = '<p style="text-align:center;padding:40px;">No products available</p>';
            return;
        }
        
        const products = [];
        snapshot.forEach(doc => products.push({ id: doc.id, ...doc.data() }));
        products.sort((a, b) => (b.totalAffiliates || 0) - (a.totalAffiliates || 0));
        
        container.innerHTML = '<div class="products-grid-full">';
        products.slice(0, 30).forEach(product => {
            const imageUrl = (product.images && product.images.length > 0) ? product.images[0] : 'app-icon.png';
            container.innerHTML += `
                <div class="product-card">
                    <img src="${imageUrl}" class="product-card-image" onerror="this.src='app-icon.png'">
                    <div class="product-card-info">
                        <div class="product-card-name">${product.name}</div>
                        <div class="product-card-price">${formatCurrency(product.price)}</div>
                        <div style="font-size:11px;color:#666;">Commission: ${product.commissionPercentage || APP.affiliateCommissionMin}%</div>
                        <button class="btn-gold" style="width:100%;margin-top:8px;font-size:13px;padding:8px;" 
                                onclick="installWithAnimation('${product.id}')">📢 Install</button>
                    </div>
                </div>`;
        });
        container.innerHTML += '</div>';
    } catch (error) {
        console.error('Install products error:', error);
        container.innerHTML = '<p style="text-align:center;padding:40px;">Error loading products</p>';
    }
}

function installWithAnimation(productId) {
    const userId = APP.userProfile?.uid;
    
    // Create loading overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0; left: 0;
        width: 100%; height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 9999;
    `;
    
    overlay.innerHTML = `
        <div style="position:relative;width:150px;height:150px;">
            <svg width="150" height="150">
                <circle cx="75" cy="75" r="65" fill="none" stroke="#333" stroke-width="8"/>
                <circle id="install-progress-circle" cx="75" cy="75" r="65" fill="none" 
                        stroke="#FFD700" stroke-width="8" stroke-linecap="round"
                        stroke-dasharray="408" stroke-dashoffset="408"
                        transform="rotate(-90 75 75)"
                        style="transition: stroke-dashoffset 0.1s;"/>
            </svg>
            <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;">
                <div id="install-percent" style="font-size:32px;font-weight:800;color:#FFD700;">0%</div>
            </div>
        </div>
        <p style="color:white;margin-top:20px;font-weight:600;">Installing Product...</p>
    `;
    
    document.body.appendChild(overlay);
    
    // Animate for 10 seconds
    let percent = 0;
    const circle = overlay.querySelector('#install-progress-circle');
    const percentText = overlay.querySelector('#install-percent');
    const circumference = 408; // 2 * PI * 65
    
    const interval = setInterval(() => {
        percent += 1;
        percentText.textContent = percent + '%';
        
        const offset = circumference - (percent / 100) * circumference;
        circle.style.strokeDashoffset = offset;
        
        if (percent >= 100) {
            clearInterval(interval);
            completeInstallation(productId, userId, overlay);
        }
    }, 100); // 100ms * 100 = 10 seconds
}

async function completeInstallation(productId, userId, overlay) {
    try {
        const productDoc = await db.collection('products').doc(productId).get();
        if (!productDoc.exists) {
            document.body.removeChild(overlay);
            showToast('Product not found', 'error');
            return;
        }
        
        const product = productDoc.data();
        const affiliateLink = `${APP.baseUrl}/r/${userId}/${productId}`;
        
        await db.collection('affiliate_products').add({
            affiliateId: userId,
            productId: productId,
            productName: product.name,
            productImage: (product.images && product.images.length > 0) ? product.images[0] : '',
            productPrice: product.price,
            commissionPercentage: product.commissionPercentage || APP.affiliateCommissionMin,
            affiliateLink: affiliateLink,
            status: 'active',
            clicks: 0,
            conversions: 0,
            totalCommission: 0,
            installedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        await db.collection('products').doc(productId).update({
            totalAffiliates: firebase.firestore.FieldValue.increment(1)
        });
        
        // Update overlay with success
        overlay.innerHTML = `
            <div style="text-align:center;color:white;">
                <div style="font-size:60px;">✅</div>
                <h2 style="color:#FFD700;margin:15px 0;">Product Installed!</h2>
                <p style="margin-bottom:20px;">${product.name}</p>
                
                <div style="background:#333;padding:15px;border-radius:8px;margin-bottom:20px;max-width:300px;word-break:break-all;">
                    <small style="color:#999;">Your Affiliate Link:</small>
                    <p style="font-size:13px;color:#FFD700;">${affiliateLink}</p>
                </div>
                
                <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
                    <button onclick="copyToClipboard('${affiliateLink}');showToast('Link copied!', 'success');" 
                            style="padding:12px 20px;background:#FFD700;color:#1a1a1a;border:none;border-radius:8px;font-weight:700;cursor:pointer;">
                        📋 Copy Link
                    </button>
                    <button onclick="shareViaWhatsApp('${affiliateLink}', '${product.name}')" 
                            style="padding:12px 20px;background:#25D366;color:white;border:none;border-radius:8px;font-weight:700;cursor:pointer;">
                        💬 WhatsApp
                    </button>
                    <button onclick="shareViaTelegram('${affiliateLink}', '${product.name}')" 
                            style="padding:12px 20px;background:#0088cc;color:white;border:none;border-radius:8px;font-weight:700;cursor:pointer;">
                        ✈️ Telegram
                    </button>
                </div>
                
                <button onclick="document.body.removeChild(this.parentElement.parentElement);navigateTo('affiliate');" 
                        style="margin-top:20px;padding:12px 30px;background:transparent;color:white;border:2px solid white;border-radius:8px;cursor:pointer;font-weight:600;">
                    Go to Dashboard
                </button>
            </div>
        `;
        
        setTimeout(() => {
            if (document.body.contains(overlay)) {
                document.body.removeChild(overlay);
                navigateTo('affiliate');
            }
        }, 5000);
        
    } catch (error) {
        document.body.removeChild(overlay);
        console.error('Install error:', error);
        showToast('Failed to install product', 'error');
    }
}

function shareViaWhatsApp(link, productName) {
    const text = encodeURIComponent(`🔥 Check out this product on Shoplify!\n\n${productName}\n${link}\n\nEarn commissions by promoting products! 💰`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
}

function shareViaTelegram(link, productName) {
    const text = encodeURIComponent(`🔥 Check out this product on Shoplify!\n\n${productName}\n${link}`);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${text}`, '_blank');
}

// =====================
// MERCHANT DASHBOARD
// =====================
async function loadMerchantDashboard() {
    if (!APP.userProfile?.isMerchant) {
        showToast('Subscribe to access merchant dashboard', 'error');
        navigateTo('profile');
        return;
    }
    
    const container = document.getElementById('merchant-content');
    if (!container) return;
    
    container.innerHTML = '<p style="text-align:center;padding:40px;">Loading dashboard...</p>';
    
    try {
        const allProductsSnap = await db.collection('products').get();
        const myProducts = [];
        allProductsSnap.forEach(doc => {
            const p = doc.data();
            if (p.merchantId === APP.userProfile.uid) {
                myProducts.push({ id: doc.id, ...p });
            }
        });
        
        const allOrdersSnap = await db.collection('orders').get();
        let totalRevenue = 0, totalOrders = 0, pendingOrders = 0;
        
        allOrdersSnap.forEach(doc => {
            const order = doc.data();
            if (order.merchantId === APP.userProfile.uid) {
                totalRevenue += order.total || 0;
                totalOrders++;
                if (order.status === 'processing') pendingOrders++;
            }
        });
        
        container.innerHTML = `
            <div style="padding:15px;">
                <div style="text-align:center;padding:20px;background:white;border-radius:12px;margin-bottom:15px;box-shadow:var(--shadow);">
                    <div style="width:100%;height:80px;background:linear-gradient(135deg, #FFD700, #FFA000);border-radius:12px;display:flex;align-items:center;justify-content:center;color:white;font-size:22px;font-weight:700;">
                        ${APP.userProfile.storeName || 'Your Store'}
                    </div>
                    <h3 style="margin-top:12px;">${APP.userProfile.storeName || 'Unnamed Store'}</h3>
                    <p style="color:#666;font-size:13px;">Template: ${APP.userProfile.storeTemplate || 'Classic'} | ${APP.userProfile.countryFlag || ''} ${APP.userProfile.country || ''}</p>
                    <button class="btn-outline" style="margin-top:10px;" onclick="navigateTo('store-setup')">⚙️ Store Settings</button>
                </div>
                
                <div class="affiliate-stats">
                    <div class="stat-card"><div class="stat-value">${myProducts.length}</div><div class="stat-label">Products</div></div>
                    <div class="stat-card"><div class="stat-value">${totalOrders}</div><div class="stat-label">Total Orders</div></div>
                    <div class="stat-card"><div class="stat-value">${pendingOrders}</div><div class="stat-label">Pending</div></div>
                    <div class="stat-card"><div class="stat-value">${formatCurrency(totalRevenue)}</div><div class="stat-label">Revenue</div></div>
                </div>
                
                <div style="display:flex;gap:10px;margin:15px 0;">
                    <button class="btn-gold" style="flex:1;" onclick="navigateTo('add-product')">➕ Add Product</button>
                    <button class="btn-outline" style="flex:1;" onclick="navigateTo('analytics')">📊 Analytics</button>
                </div>
                
                <h4>📦 My Products (${myProducts.length})</h4>
                <div id="merchant-products-list">
                    ${myProducts.length === 0 ? '<p style="color:#999;padding:20px;text-align:center;">No products yet. Click Add Product to start selling!</p>' : ''}
                </div>
            </div>
        `;
        
        if (myProducts.length > 0) {
            const listContainer = document.getElementById('merchant-products-list');
            myProducts.forEach(product => {
                const healthColor = (product.totalSales || 0) > 50 ? 'health-good' : 
                                    (product.totalSales || 0) > 10 ? 'health-warning' : 'health-poor';
                const imageUrl = (product.images && product.images.length > 0) ? product.images[0] : 'app-icon.png';
                
                listContainer.innerHTML += `
                    <div class="merchant-product-item" style="margin-bottom:8px;">
                        <img src="${imageUrl}" alt="${product.name}" onerror="this.src='app-icon.png'">
                        <div style="flex:1;">
                            <div style="font-weight:600;">${product.name}</div>
                            <div style="font-size:13px;color:#666;">${formatCurrency(product.price)} | Stock: ${product.stock || 0}</div>
                            <div style="font-size:12px;">
                                <span class="product-health ${healthColor}"></span> 
                                ${product.totalSales || 0} sales | 
                                ${product.sponsored ? '⭐ Sponsored' : ''}
                                ${product.discountCode ? ' | 🎫 Discount' : ''}
                            </div>
                        </div>
                        <div style="display:flex;flex-direction:column;gap:5px;">
                            <button class="btn-small btn-outline" onclick="toggleProductStatus('${product.id}', '${product.status || 'active'}')">
                                ${product.status === 'active' ? 'Disable' : 'Enable'}
                            </button>
                            ${(product.totalSales || 0) >= APP.sponsorMinSales ? `
                                <button class="btn-small btn-gold" onclick="sponsorProduct('${product.id}')">⭐ Sponsor</button>
                            ` : ''}
                        </div>
                    </div>`;
            });
        }
        
    } catch (error) {
        console.error('Merchant dashboard error:', error);
        container.innerHTML = '<p style="text-align:center;padding:40px;">Error loading. <button class="btn-outline" onclick="loadMerchantDashboard()">Retry</button></p>';
    }
}

async function toggleProductStatus(productId, currentStatus) {
    const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
    try {
        await db.collection('products').doc(productId).update({ status: newStatus });
        showToast(`Product ${newStatus === 'active' ? 'enabled' : 'disabled'}`, 'success');
        loadMerchantDashboard();
    } catch (error) {
        showToast('Failed to update product', 'error');
    }
}

function sponsorProduct(productId) {
    if ((APP.userProfile.walletBalance || 0) < APP.sponsorshipFee) {
        showToast(`You need $${APP.sponsorshipFee} to sponsor. Please deposit.`, 'error');
        navigateTo('wallet');
        return;
    }
    
    showModal(`
        <h3>⭐ Sponsor Product</h3>
        <p style="color:#666;margin:15px 0;">Cost: <strong>$${APP.sponsorshipFee}/month</strong></p>
        <p style="font-size:14px;color:#666;">Benefits: Homepage placement, ambassador promotion, increased visibility</p>
        <button class="btn-gold btn-full" onclick="confirmSponsorship('${productId}')">Sponsor Now - $${APP.sponsorshipFee}</button>
    `);
}

async function confirmSponsorship(productId) {
    hideModal();
    try {
        await db.collection('users').doc(APP.userProfile.uid).update({
            walletBalance: firebase.firestore.FieldValue.increment(-APP.sponsorshipFee)
        });
        
        await db.collection('products').doc(productId).update({
            sponsored: true,
            sponsoredUntil: firebase.firestore.Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
        });
        
        APP.userProfile.walletBalance -= APP.sponsorshipFee;
        
        await db.collection('transactions').add({
            userId: APP.userProfile.uid, type: 'sponsorship', amount: APP.sponsorshipFee,
            currency: 'USD', status: 'completed',
            description: 'Product sponsorship - 30 days',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        showToast('Product sponsored! ⭐', 'success');
        loadMerchantDashboard();
    } catch (error) {
        showToast('Sponsorship failed', 'error');
    }
}

// =====================
// ANALYTICS SYSTEM (Chart.js)
// =====================
let analyticsChart = null;
let countryChart = null;
let productChart = null;
let profitChart = null;
let currentAnalyticsRange = 'week';

function loadChartJS() {
    return new Promise((resolve) => {
        if (typeof Chart !== 'undefined') { resolve(); return; }
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
        script.onload = () => { console.log('✅ Chart.js loaded'); resolve(); };
        script.onerror = () => { console.warn('Chart.js CDN failed'); resolve(); };
        document.head.appendChild(script);
    });
}

async function loadAnalytics() {
    const container = document.getElementById('analytics-content');
    if (!container) return;
    
    if (!APP.userProfile) {
        container.innerHTML = '<p style="text-align:center;padding:40px;">Please login to view analytics</p>';
        return;
    }
    
    container.innerHTML = '<p style="text-align:center;padding:40px;">Loading analytics...</p>';
    
    await loadChartJS();
    
    container.innerHTML = `
        <div style="padding:15px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;">
                <h3>📊 Analytics</h3>
                <select id="analytics-range" onchange="switchAnalyticsRange()" 
                        style="padding:8px 12px;border:2px solid #e0e0e0;border-radius:8px;font-weight:600;">
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="year">This Year</option>
                </select>
            </div>
            
            <div class="affiliate-stats" id="analytics-summary">
                <div class="stat-card"><div class="stat-value" id="stat-revenue">$0</div><div class="stat-label">Revenue</div></div>
                <div class="stat-card"><div class="stat-value" id="stat-orders">0</div><div class="stat-label">Orders</div></div>
                <div class="stat-card"><div class="stat-value" id="stat-commission">$0</div><div class="stat-label">Commissions</div></div>
                <div class="stat-card"><div class="stat-value" id="stat-clicks">0</div><div class="stat-label">Clicks</div></div>
            </div>
            
            <div style="background:white;border-radius:12px;padding:15px;margin-bottom:15px;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
                <h4 style="margin-bottom:10px;">📈 Performance Overview</h4>
                <div style="position:relative;height:250px;"><canvas id="analyticsChart"></canvas></div>
            </div>
            
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:15px;">
                <div style="background:white;border-radius:12px;padding:15px;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
                    <h4 style="margin-bottom:10px;font-size:14px;">🌍 By Country</h4>
                    <div style="position:relative;height:200px;"><canvas id="countryChart"></canvas></div>
                </div>
                <div style="background:white;border-radius:12px;padding:15px;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
                    <h4 style="margin-bottom:10px;font-size:14px;">📦 Products</h4>
                    <div style="position:relative;height:200px;"><canvas id="productChart"></canvas></div>
                </div>
            </div>
            
            <div style="background:white;border-radius:12px;padding:15px;margin-bottom:15px;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
                <h4 style="margin-bottom:10px;">💰 Profit Margin %</h4>
                <div style="position:relative;height:200px;"><canvas id="profitChart"></canvas></div>
            </div>
            
            <div style="background:#1a1a2e;color:white;padding:15px;border-radius:12px;margin-bottom:15px;">
                <h3 style="margin-bottom:10px;">🧠 AI Insights</h3>
                <p id="insightText" style="line-height:1.6;">Analyzing your data...</p>
            </div>
        </div>
    `;
    
    setTimeout(() => {
        initializeCharts();
        generateAnalyticsFromUserData(APP.userProfile.uid);
    }, 600);
}

function initializeCharts() {
    [analyticsChart, countryChart, productChart, profitChart].forEach(chart => {
        if (chart) chart.destroy();
    });
    
    const ctx1 = document.getElementById('analyticsChart');
    const ctx2 = document.getElementById('countryChart');
    const ctx3 = document.getElementById('productChart');
    const ctx4 = document.getElementById('profitChart');
    
    if (ctx1 && typeof Chart !== 'undefined') {
        analyticsChart = new Chart(ctx1, {
            type: 'line',
            data: {
                labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
                datasets: [
                    { label: 'Revenue', data: [0,0,0,0,0,0,0], borderColor: '#FFD700', tension: 0.3, borderWidth: 2 },
                    { label: 'Orders', data: [0,0,0,0,0,0,0], borderColor: '#00C851', tension: 0.3, borderWidth: 2 },
                    { label: 'Commissions', data: [0,0,0,0,0,0,0], borderColor: '#33B5E5', tension: 0.3, borderWidth: 2 }
                ]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
        });
    }
    
    if (ctx2 && typeof Chart !== 'undefined') {
        countryChart = new Chart(ctx2, {
            type: 'doughnut',
            data: { labels: ['No data'], datasets: [{ data: [1], backgroundColor: ['#FFD700','#00C851','#33B5E5','#FF8800','#7C3AED','#FF4444','#FFBB33'] }] },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }
    
    if (ctx3 && typeof Chart !== 'undefined') {
        productChart = new Chart(ctx3, {
            type: 'bar',
            data: { labels: ['No data'], datasets: [{ label: 'Sales', data: [0], backgroundColor: ['#FFD700','#00C851','#33B5E5','#FF8800','#7C3AED'] }] },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }
    
    if (ctx4 && typeof Chart !== 'undefined') {
        profitChart = new Chart(ctx4, {
            type: 'line',
            data: { labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], datasets: [{ label: 'Margin %', data: [0,0,0,0,0,0,0], borderColor: '#00C851', backgroundColor: 'rgba(0,200,81,0.1)', tension: 0.3, fill: true, borderWidth: 2 }] },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }
}

function updateAllCharts(data) {
    if (!data || typeof Chart === 'undefined') return;
    
    if (analyticsChart) {
        analyticsChart.data.labels = data.labels || [];
        analyticsChart.data.datasets[0].data = data.revenue || [];
        analyticsChart.data.datasets[1].data = data.orders || [];
        analyticsChart.data.datasets[2].data = data.commissions || [];
        analyticsChart.update();
    }
    
    if (countryChart && data.countryRevenue && Object.keys(data.countryRevenue).length > 0) {
        countryChart.data.labels = Object.keys(data.countryRevenue);
        countryChart.data.datasets[0].data = Object.values(data.countryRevenue);
        countryChart.update();
    }
    
    if (productChart && data.productSales && Object.keys(data.productSales).length > 0) {
        productChart.data.labels = Object.keys(data.productSales);
        productChart.data.datasets[0].data = Object.values(data.productSales);
        productChart.update();
    }
    
    if (profitChart) {
        profitChart.data.labels = data.labels || [];
        profitChart.data.datasets[0].data = data.profitMargin || [];
        profitChart.update();
    }
}

function updateSummaryStats(data) {
    if (!data) return;
    
    const totalRevenue = (data.revenue || []).reduce((a, b) => a + b, 0);
    const totalOrders = (data.orders || []).reduce((a, b) => a + b, 0);
    const totalCommission = (data.commissions || []).reduce((a, b) => a + b, 0);
    const totalClicks = (data.clicks || []).reduce((a, b) => a + b, 0);
    
    document.getElementById('stat-revenue') && (document.getElementById('stat-revenue').textContent = formatCurrency(totalRevenue));
    document.getElementById('stat-orders') && (document.getElementById('stat-orders').textContent = totalOrders);
    document.getElementById('stat-commission') && (document.getElementById('stat-commission').textContent = formatCurrency(totalCommission));
    document.getElementById('stat-clicks') && (document.getElementById('stat-clicks').textContent = totalClicks.toLocaleString());
}

function updateAIInsights(data) {
    const insightEl = document.getElementById('insightText');
    if (!insightEl || !data) return;
    
    const revenue = data.revenue || [];
    const orders = data.orders || [];
    const clicks = data.clicks || [];
    const margin = data.profitMargin || [];
    
    if (revenue.length < 2 || revenue.every(v => v === 0)) {
        insightEl.textContent = '📊 Start making sales to see AI-powered insights! Your analytics will appear here automatically as you generate revenue.';
        return;
    }
    
    const last = revenue.length - 1;
    const insights = [];
    
    if (revenue[last] < revenue[last - 1] && revenue[last - 1] > 0) {
        const drop = ((revenue[last - 1] - revenue[last]) / revenue[last - 1] * 100).toFixed(1);
        insights.push(`📉 Revenue dropped ${drop}% compared to previous period. Consider promoting more products.`);
    } else if (revenue[last] > revenue[last - 1] && revenue[last - 1] > 0) {
        const growth = ((revenue[last] - revenue[last - 1]) / revenue[last - 1] * 100).toFixed(1);
        insights.push(`📈 Revenue grew ${growth}% - your strategy is working! Keep promoting.`);
    }
    
    if (clicks[last] >= clicks[last - 1] && orders[last] < orders[last - 1] && clicks[last] > 0) {
        insights.push('⚠️ Conversion rate dropped - you have traffic but fewer sales. Check product pricing and availability.');
    }
    
    if (orders[last] < orders[last - 1] && orders[last - 1] > 0) {
        insights.push('📦 Orders decreased - review your product catalog and marketing strategy.');
    }
    
    if (margin.length >= 2 && margin[last] < margin[last - 1]) {
        insights.push('💸 Profit margin is declining - review costs and consider adjusting prices.');
    }
    
    if (clicks[last] < clicks[last - 1] && clicks[last - 1] > 0) {
        insights.push('🔗 Traffic dropped - promote more products to increase clicks and visibility.');
    }
    
    if (revenue.length > 0) {
        const maxRev = Math.max(...revenue);
        const bestDay = data.labels ? data.labels[revenue.indexOf(maxRev)] : 'recently';
        if (maxRev > 0) insights.push(`🏆 Best performing period: ${bestDay} (${formatCurrency(maxRev)} in revenue).`);
    }
    
    if (insights.length === 0) insights.push('✅ Your performance is stable with no major issues detected. Continue your current strategy.');
    
    insightEl.textContent = insights.join(' ');
}

async function generateAnalyticsFromUserData(userId) {
    try {
        const ordersSnapshot = await db.collection('orders').where('userId', '==', userId).get();
        const clicksSnapshot = await db.collection('affiliate_products').where('affiliateId', '==', userId).get();
        
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const revenue = [0,0,0,0,0,0,0];
        const orders = [0,0,0,0,0,0,0];
        const commissions = [0,0,0,0,0,0,0];
        const clicks = [0,0,0,0,0,0,0];
        const profitMargin = [0,0,0,0,0,0,0];
        const countryRevenue = {};
        const productSales = {};
        
        ordersSnapshot.forEach(doc => {
            const order = doc.data();
            const date = order.createdAt?.toDate?.() || order.createdAt || new Date();
            const dayIndex = (date.getDay() + 6) % 7;
            
            revenue[dayIndex] += order.total || 0;
            orders[dayIndex] += 1;
            commissions[dayIndex] += (order.total || 0) * 0.05;
            profitMargin[dayIndex] = revenue[dayIndex] > 0 ? Math.round((commissions[dayIndex] / revenue[dayIndex]) * 100) : 0;
            
            const country = order.shipping?.country || 'Unknown';
            countryRevenue[country] = (countryRevenue[country] || 0) + (order.total || 0);
            
            const productName = order.items?.[0]?.name || 'Unknown';
            productSales[productName] = (productSales[productName] || 0) + 1;
        });
        
        let totalClicks = 0;
        clicksSnapshot.forEach(doc => { totalClicks += doc.data().clicks || 0; });
        const avgClicks = Math.max(1, Math.floor(totalClicks / 7));
        clicks.fill(avgClicks);
        
        const analyticsData = {
            labels: days, revenue, orders, commissions, clicks,
            countryRevenue: Object.keys(countryRevenue).length > 0 ? countryRevenue : { 'No data yet': 1 },
            productSales: Object.keys(productSales).length > 0 ? productSales : { 'No sales yet': 1 },
            profitMargin,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        updateAllCharts(analyticsData);
        updateSummaryStats(analyticsData);
        updateAIInsights(analyticsData);
        
    } catch (error) {
        console.error('Generate analytics error:', error);
        const insightEl = document.getElementById('insightText');
        if (insightEl) insightEl.textContent = 'Start making sales to see analytics! Your data will appear here automatically.';
    }
}

function switchAnalyticsRange() {
    const select = document.getElementById('analytics-range');
    if (select) {
        currentAnalyticsRange = select.value;
        initializeCharts();
        if (APP.userProfile?.uid) generateAnalyticsFromUserData(APP.userProfile.uid);
    }
}

// =====================
// LEADERBOARD (with clickable earners)
// =====================
async function loadLeaderboard() {
    const container = document.getElementById('leaderboard-content');
    if (!container) return;
    
    container.innerHTML = '<p style="text-align:center;padding:40px;">Loading leaderboard...</p>';
    
    try {
        const snapshot = await db.collection('users').get();
        const allUsers = [];
        snapshot.forEach(doc => allUsers.push({ id: doc.id, ...doc.data() }));
        
        const affiliates = allUsers.filter(u => u.isAffiliate).sort((a,b) => (b.affiliateEarnings||0)-(a.affiliateEarnings||0)).slice(0,20);
        const merchants = allUsers.filter(u => u.isMerchant).sort((a,b) => (b.totalRevenue||0)-(a.totalRevenue||0)).slice(0,20);
        const dropshippers = allUsers.filter(u => u.isDropshipper).sort((a,b) => (b.totalRevenue||0)-(a.totalRevenue||0)).slice(0,20);
        
        container.innerHTML = `
            <div style="padding:15px;">
                <h3 style="margin-bottom:15px;">🏆 Top Affiliates</h3>
                ${affiliates.length === 0 ? '<p style="color:#999;">No affiliates yet</p>' : affiliates.map((u,i) => {
                    const m = ['🥇','🥈','🥉'];
                    return `<div class="earner-card" style="margin-bottom:6px;cursor:pointer;" onclick="showEarnerDetails('${u.username || u.uid}', '${u.displayName || u.username}', '${u.totalSales || 0}', '${u.affiliateEarnings || 0}', '${u.totalRevenue || 0}', 'affiliate', '${i+1}', ${u.isAppVerified || false}, ${u.isAmbassador || false})">
                        <span style="font-size:22px;">${m[i]||'⭐'}</span>
                        <span><strong>${u.displayName||u.username}</strong>${u.isAppVerified?' <span style="color:#20D5EC;">✓</span>':''}${u.isAmbassador?' 👑':''}</span>
                        <span style="margin-left:auto;font-weight:600;">${formatCurrency(u.affiliateEarnings||0)}</span>
                    </div>`;
                }).join('')}
            </div>
            <div style="padding:15px;">
                <h3 style="margin-bottom:15px;">🏪 Top Merchants</h3>
                ${merchants.length === 0 ? '<p style="color:#999;">No merchants yet</p>' : merchants.map((u,i) => {
                    const m = ['🥇','🥈','🥉'];
                    return `<div class="earner-card" style="margin-bottom:6px;cursor:pointer;" onclick="showEarnerDetails('${u.username || u.uid}', '${u.displayName || u.username}', '${u.totalSales || 0}', '${u.affiliateEarnings || 0}', '${u.totalRevenue || 0}', 'merchant', '${i+1}', ${u.isAppVerified || false}, ${u.isAmbassador || false})">
                        <span style="font-size:22px;">${m[i]||'⭐'}</span>
                        <span><strong>${u.displayName||u.username}</strong>${u.isAppVerified?' <span style="color:#20D5EC;">✓</span>':''}</span>
                        <span style="margin-left:auto;font-weight:600;">${formatCurrency(u.totalRevenue||0)}</span>
                    </div>`;
                }).join('')}
            </div>
            <div style="padding:15px;">
                <h3 style="margin-bottom:15px;">📦 Top Dropshippers</h3>
                ${dropshippers.length === 0 ? '<p style="color:#999;">No dropshippers yet</p>' : dropshippers.map((u,i) => {
                    const m = ['🥇','🥈','🥉'];
                    return `<div class="earner-card" style="margin-bottom:6px;cursor:pointer;" onclick="showEarnerDetails('${u.username || u.uid}', '${u.displayName || u.username}', '${u.totalSales || 0}', '${u.affiliateEarnings || 0}', '${u.totalRevenue || 0}', 'dropshipper', '${i+1}', ${u.isAppVerified || false}, ${u.isAmbassador || false})">
                        <span style="font-size:22px;">${m[i]||'⭐'}</span>
                        <span><strong>${u.displayName||u.username}</strong>${u.isAppVerified?' <span style="color:#20D5EC;">✓</span>':''}</span>
                        <span style="margin-left:auto;font-weight:600;">${formatCurrency(u.totalRevenue||0)}</span>
                    </div>`;
                }).join('')}
            </div>`;
        
    } catch (error) {
        console.error('Leaderboard error:', error);
        container.innerHTML = '<p style="text-align:center;padding:40px;">Unable to load. <button class="btn-outline" onclick="loadLeaderboard()">Retry</button></p>';
    }
}

function showEarnerDetails(username, displayName, totalSales, affiliateEarnings, totalRevenue, type, rank, isVerified, isAmbassador) {
    showModal(`
        <div style="text-align:center;padding:10px;">
            <div style="font-size:60px;margin-bottom:10px;">
                ${rank == 1 ? '👑' : rank == 2 ? '🥈' : rank == 3 ? '🥉' : '⭐'}
            </div>
            <h2>${displayName}</h2>
            <p style="color:#666;">@${username}</p>
            <p style="color:#666;">Type: ${type.toUpperCase()}</p>
            <p style="color:#666;">Rank: #${rank}</p>
            ${isVerified ? '<span style="background:#20D5EC;color:white;padding:4px 12px;border-radius:12px;font-size:12px;">✓ App Verified</span>' : ''}
            ${isAmbassador ? '<span style="background:#B87333;color:white;padding:4px 12px;border-radius:12px;font-size:12px;margin-left:5px;">👑 Ambassador</span>' : ''}
            
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:20px 0;">
                <div class="stat-card"><div class="stat-value">${totalSales}</div><div class="stat-label">Total Sales</div></div>
                <div class="stat-card"><div class="stat-value">${formatCurrency(affiliateEarnings)}</div><div class="stat-label">Affiliate Earnings</div></div>
                <div class="stat-card"><div class="stat-value">${formatCurrency(totalRevenue)}</div><div class="stat-label">Total Revenue</div></div>
                <div class="stat-card"><div class="stat-value">#${rank}</div><div class="stat-label">Rank</div></div>
            </div>
            
            <button class="btn-gold btn-full" onclick="hideModal()">Close</button>
        </div>
    `);
}

// =====================
// HALL OF FAME
// =====================
async function loadHallOfFame() {
    const container = document.getElementById('hall-fame-content');
    if (!container) return;
    
    container.innerHTML = '<p style="text-align:center;padding:40px;">Loading Hall of Fame...</p>';
    
    try {
        const snapshot = await db.collection('users').get();
        const allUsers = [];
        snapshot.forEach(doc => allUsers.push(doc.data()));
        
        const topUsers = allUsers.sort((a,b) => (b.totalSales||0)-(a.totalSales||0)).slice(0,30);
        
        if (topUsers.length === 0) {
            container.innerHTML = '<div style="text-align:center;padding:60px;"><p style="font-size:50px;">🌟</p><h3>Hall of Fame</h3><p>Top performers will appear here</p></div>';
            return;
        }
        
        container.innerHTML = '<h3 style="padding:15px;">🌟 Hall of Fame</h3>';
        topUsers.forEach((u,i) => {
            const b = [];
            if (u.isAppVerified) b.push('<span style="background:#20D5EC;color:white;padding:2px 6px;border-radius:10px;font-size:10px;">✓</span>');
            if (u.isAmbassador) b.push('👑');
            
            container.innerHTML += `
                <div style="display:flex;align-items:center;gap:12px;padding:15px;border-bottom:1px solid #f0f0f0;">
                    <span style="font-size:28px;min-width:40px;">${i===0?'👑':i===1?'🥈':i===2?'🥉':'#'+(i+1)}</span>
                    <img src="${u.photoURL||'app-icon.png'}" style="width:40px;height:40px;border-radius:50%;" onerror="this.src='app-icon.png'">
                    <div style="flex:1;"><div style="font-weight:600;">${u.displayName||u.username}</div><div style="font-size:12px;color:#666;">${u.totalSales||0} sales | ${formatCurrency(u.totalRevenue||0)}</div></div>
                    <div>${b.join(' ')}</div>
                </div>`;
        });
        
    } catch (error) {
        console.error('Hall of Fame error:', error);
        container.innerHTML = '<p style="text-align:center;padding:40px;">Unable to load</p>';
    }
}

// =====================
// TOP EARNERS FOR HOME PAGE
// =====================
async function loadTopEarners() {
    const container = document.getElementById('top-earners');
    if (!container) return;
    
    try {
        const snapshot = await db.collection('users').get();
        const all = [];
        snapshot.forEach(doc => all.push(doc.data()));
        
        const topAff = all.filter(u => u.isAffiliate).sort((a,b)=>(b.affiliateEarnings||0)-(a.affiliateEarnings||0)).slice(0,3);
        const topDrop = all.filter(u => u.isDropshipper).sort((a,b)=>(b.totalRevenue||0)-(a.totalRevenue||0)).slice(0,3);
        
        container.innerHTML = '<h4 style="padding:0 0 8px;">🏆 Top Affiliates Today</h4>';
        if (topAff.length === 0) container.innerHTML += '<p style="color:#999;">No affiliates yet</p>';
        else topAff.forEach((u,i) => {
            const m = ['👑','🥈','🥉'];
            container.innerHTML += `<div class="earner-card"><span>${m[i]}</span><span><strong>${u.displayName||u.username}</strong></span><span style="margin-left:auto;">${formatCurrency(u.affiliateEarnings||0)}</span></div>`;
        });
        
        container.innerHTML += '<h4 style="padding:12px 0 8px;">📦 Top Dropshippers Today</h4>';
        if (topDrop.length === 0) container.innerHTML += '<p style="color:#999;">No dropshippers yet</p>';
        else topDrop.forEach((u,i) => {
            const m = ['👑','🥈','🥉'];
            container.innerHTML += `<div class="earner-card"><span>${m[i]}</span><span><strong>${u.displayName||u.username}</strong></span><span style="margin-left:auto;">${formatCurrency(u.totalRevenue||0)}</span></div>`;
        });
        
    } catch (error) {
        console.error('Top earners error:', error);
    }
}

// =====================
// STORE SETUP
// =====================
function loadStoreSetup() {
    const container = document.getElementById('store-setup-content');
    if (!container) return;
    
    const templates = [
        { id: 'classic', name: 'Classic', icon: '🏪', color: '#FFD700' },
        { id: 'modern', name: 'Modern', icon: '🏢', color: '#2196F3' },
        { id: 'premium', name: 'Premium', icon: '✨', color: '#9C27B0' },
        { id: 'minimal', name: 'Minimal', icon: '🎯', color: '#607D8B' }
    ];
    
    container.innerHTML = `
        <div style="padding:20px;">
            <h3>⚙️ Store Setup</h3>
            
            <div class="input-group" style="margin-top:15px;">
                <label>Store Name</label>
                <input type="text" id="store-name" class="input-field" value="${APP.userProfile.storeName || ''}" placeholder="My Store">
            </div>
            
            <h4 style="margin-top:20px;">Choose Template</h4>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:10px;">
                ${templates.map(t => `
                    <div class="plan-card ${APP.userProfile.storeTemplate === t.id ? 'active' : ''}" 
                         onclick="selectTemplate('${t.id}')" style="text-align:center;cursor:pointer;">
                        <div style="font-size:40px;">${t.icon}</div>
                        <div style="font-weight:600;">${t.name}</div>
                        <div style="width:20px;height:4px;background:${t.color};margin:8px auto;border-radius:2px;"></div>
                    </div>
                `).join('')}
            </div>
            
            <h4 style="margin-top:20px;">🌍 Shipping Countries</h4>
            <div id="shipping-countries-list" style="margin-top:10px;"></div>
            <button class="btn-outline btn-full" onclick="addShippingCountry()">➕ Add Country</button>
            
            <h4 style="margin-top:20px;">🎫 Shipping Codes</h4>
            <div id="shipping-codes-list" style="margin-top:10px;">
                ${(APP.userProfile.shippingCodes || []).map((code, i) => `
                    <div style="padding:10px;background:#f5f5f5;border-radius:8px;margin-bottom:8px;font-size:13px;">
                        <strong>${code.code}</strong> - ${code.value}${code.type === 'percentage' ? '%' : '$'} off
                        ${code.used ? '<span style="color:red;"> (Used)</span>' : '<span style="color:green;"> (Active)</span>'}
                    </div>
                `).join('')}
            </div>
            <button class="btn-outline btn-full" onclick="createShippingCode()">🎫 Create Shipping Code</button>
            
            <button class="btn-gold btn-full" style="margin-top:20px;" onclick="saveStoreSetup()">💾 Save Store</button>
        </div>
    `;
    
    loadShippingCountries();
}

function loadShippingCountries() {
    const container = document.getElementById('shipping-countries-list');
    if (!container) return;
    
    const countries = APP.userProfile?.shippingRates || {};
    const countryList = Object.entries(countries);
    
    if (countryList.length === 0) {
        container.innerHTML = '<p style="color:#999;font-size:13px;">No shipping countries added yet</p>';
    } else {
        container.innerHTML = countryList.map(([country, rate]) => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:#f5f5f5;border-radius:8px;margin-bottom:6px;font-size:13px;">
                <span>${COUNTRIES?.[country]?.flag || ''} ${COUNTRIES?.[country]?.name || country}</span>
                <span>$${rate} <button onclick="removeShippingCountry('${country}')" style="background:none;border:none;color:red;cursor:pointer;margin-left:10px;">✕</button></span>
            </div>
        `).join('');
    }
}

function addShippingCountry() {
    showModal(`
        <h3>🌍 Add Shipping Country</h3>
        <div class="input-group">
            <label>Country</label>
            <select id="new-shipping-country" class="input-field">
                ${typeof COUNTRIES !== 'undefined' ? Object.entries(COUNTRIES).sort((a,b) => a[1].name.localeCompare(b[1].name)).map(([code, data]) => `
                    <option value="${code}">${data.flag || ''} ${data.name}</option>
                `).join('') : ''}
            </select>
        </div>
        <div class="input-group">
            <label>Shipping Rate (USD)</label>
            <input type="number" id="new-shipping-rate" class="input-field" placeholder="0.00" step="0.01" min="0">
        </div>
        <button class="btn-gold btn-full" onclick="saveShippingCountry()">Add Country</button>
    `);
}

async function saveShippingCountry() {
    const country = document.getElementById('new-shipping-country')?.value;
    const rate = parseFloat(document.getElementById('new-shipping-rate')?.value) || 0;
    
    if (!country) return;
    
    const shippingRates = APP.userProfile?.shippingRates || {};
    shippingRates[country] = rate;
    
    try {
        await db.collection('users').doc(APP.userProfile.uid).update({ shippingRates });
        APP.userProfile.shippingRates = shippingRates;
        hideModal();
        loadShippingCountries();
        showToast('Shipping country added!', 'success');
    } catch (error) {
        showToast('Failed to save', 'error');
    }
}

async function removeShippingCountry(country) {
    const shippingRates = APP.userProfile?.shippingRates || {};
    delete shippingRates[country];
    
    try {
        await db.collection('users').doc(APP.userProfile.uid).update({ shippingRates });
        APP.userProfile.shippingRates = shippingRates;
        loadShippingCountries();
        showToast('Country removed', 'success');
    } catch (error) {
        showToast('Failed to remove', 'error');
    }
}

function createShippingCode() {
    showModal(`
        <h3>🎫 Create Shipping Code</h3>
        <div class="input-group">
            <label>Code</label>
            <input type="text" id="new-shipping-code" class="input-field" placeholder="FREESHIP">
        </div>
        <div class="input-group">
            <label>Discount Value</label>
            <input type="number" id="new-shipping-value" class="input-field" placeholder="20" min="1">
        </div>
        <div class="input-group">
            <label>Type</label>
            <select id="new-shipping-type" class="input-field">
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ($)</option>
            </select>
        </div>
        <button class="btn-gold btn-full" onclick="saveShippingCode()">Create Code</button>
    `);
}

async function saveShippingCode() {
    const code = document.getElementById('new-shipping-code')?.value?.trim()?.toUpperCase();
    const value = parseFloat(document.getElementById('new-shipping-value')?.value) || 0;
    const type = document.getElementById('new-shipping-type')?.value;
    
    if (!code || !value) {
        showToast('Please fill all fields', 'error');
        return;
    }
    
    const shippingCodes = APP.userProfile?.shippingCodes || [];
    shippingCodes.push({ code, value, type, used: false, createdAt: new Date().toISOString() });
    
    try {
        await db.collection('users').doc(APP.userProfile.uid).update({ shippingCodes });
        APP.userProfile.shippingCodes = shippingCodes;
        hideModal();
        loadStoreSetup();
        showToast('Shipping code created!', 'success');
    } catch (error) {
        showToast('Failed to create code', 'error');
    }
}

function selectTemplate(templateId) {
    document.querySelectorAll('.plan-card').forEach(c => c.classList.remove('active'));
    event.target.closest('.plan-card').classList.add('active');
    APP._selectedTemplate = templateId;
}

async function saveStoreSetup() {
    const storeName = document.getElementById('store-name')?.value?.trim();
    const template = APP._selectedTemplate || APP.userProfile.storeTemplate || 'classic';
    
    if (!storeName) {
        showToast('Please enter a store name', 'error');
        return;
    }
    
    try {
        await db.collection('users').doc(APP.userProfile.uid).update({
            storeName, storeTemplate: template, storeActive: true
        });
        
        APP.userProfile.storeName = storeName;
        APP.userProfile.storeTemplate = template;
        APP.userProfile.storeActive = true;
        
        showToast('Store saved!', 'success');
        navigateTo('merchant');
    } catch (error) {
        showToast('Failed to save store', 'error');
    }
}

// =====================
// ADD PRODUCT FORM
// =====================
async function loadAddProductForm() {
    const container = document.getElementById('add-product-form');
    if (!container) return;
    
    container.innerHTML = `
        <div style="padding:20px;">
            <div class="input-group"><label>Product Name *</label><input type="text" id="product-name" class="input-field" placeholder="Enter product name"></div>
            <div class="input-group"><label>Price (USD) *</label><input type="number" id="product-price" class="input-field" placeholder="0.00" step="0.01" min="0.01"></div>
            <div class="input-group"><label>Category *</label><select id="product-category" class="input-field">${APP.categories.filter(c => c !== 'All').map(c => `<option value="${c}">${c}</option>`).join('')}</select></div>
            <div class="input-group"><label>Stock Quantity</label><input type="number" id="product-stock" class="input-field" placeholder="0" min="0"></div>
            <div class="input-group"><label>Commission (%)</label><input type="number" id="product-commission" class="input-field" value="4" min="1" max="100"></div>
            <div class="input-group"><label>Colors (comma separated)</label><input type="text" id="product-colors" class="input-field" placeholder="Black, White, Red"></div>
            <div class="input-group"><label>Sizes (comma separated)</label><input type="text" id="product-sizes" class="input-field" placeholder="S, M, L, XL"></div>
            <div class="input-group"><label>Description</label><textarea id="product-description" class="input-field" rows="4" placeholder="Describe your product..."></textarea></div>
            <div class="input-group"><label><input type="checkbox" id="product-digital" onchange="toggleDigitalFields()"> Digital Product</label></div>
            <div class="input-group hidden" id="digital-link-group"><label>Digital Link/URL</label><input type="url" id="product-digital-link" class="input-field" placeholder="https://..."></div>
            <div class="input-group"><label>Images (up to 5)</label><input type="file" id="product-images" class="input-field" multiple accept="image/*" onchange="previewProductImages()"><div id="image-preview-container" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;"></div></div>
            <div class="input-group"><label>Video URL (optional)</label><input type="url" id="product-video" class="input-field" placeholder="https://..."></div>
            <div class="input-group"><label>Discount Code (optional)</label><div style="display:flex;gap:8px;"><input type="text" id="discount-code" class="input-field" placeholder="SAVE20" style="flex:1;"><input type="number" id="discount-value" class="input-field" placeholder="20" style="flex:1;" min="1"><select id="discount-type" class="input-field" style="flex:1;"><option value="percentage">%</option><option value="fixed">$</option></select></div></div>
            <div class="input-group"><label><input type="checkbox" id="product-free-shipping"> Free Shipping</label></div>
            <button class="btn-gold btn-full" onclick="submitProduct()">📦 Publish Product</button>
        </div>
    `;
}

function toggleDigitalFields() {
    const digitalGroup = document.getElementById('digital-link-group');
    const isDigital = document.getElementById('product-digital')?.checked;
    if (digitalGroup) digitalGroup.classList.toggle('hidden', !isDigital);
    const stockField = document.getElementById('product-stock');
    if (stockField) { stockField.value = isDigital ? '999999' : ''; stockField.disabled = isDigital; }
}

function previewProductImages() {
    const files = document.getElementById('product-images')?.files;
    const container = document.getElementById('image-preview-container');
    if (!container) return;
    container.innerHTML = '';
    if (files) Array.from(files).slice(0,5).forEach(file => { const r = new FileReader(); r.onload = e => container.innerHTML += `<img src="${e.target.result}" style="width:70px;height:70px;object-fit:cover;border-radius:8px;">`; r.readAsDataURL(file); });
}

async function submitProduct() {
    const name = document.getElementById('product-name')?.value?.trim();
    const price = parseFloat(document.getElementById('product-price')?.value);
    const category = document.getElementById('product-category')?.value;
    const isDigital = document.getElementById('product-digital')?.checked;
    
    if (!name || !price || !category) { showToast('Fill required fields', 'error'); return; }
    
    showLoader();
    try {
        const imageFiles = document.getElementById('product-images')?.files;
        let imageUrls = [];
        if (imageFiles?.length) for (const file of Array.from(imageFiles).slice(0,5)) { try { imageUrls.push(await uploadToCloudinary(file)); } catch(e) {} }
        
        const productData = {
            name, price, category,
            stock: isDigital ? 999999 : (parseInt(document.getElementById('product-stock')?.value) || 0),
            commissionPercentage: parseInt(document.getElementById('product-commission')?.value) || APP.affiliateCommissionMin,
            colors: document.getElementById('product-colors')?.value?.split(',').map(c=>c.trim()).filter(Boolean) || [],
            sizes: document.getElementById('product-sizes')?.value?.split(',').map(s=>s.trim()).filter(Boolean) || [],
            description: document.getElementById('product-description')?.value?.trim() || '',
            images: imageUrls.length > 0 ? imageUrls : ['app-icon.png'],
            videoUrl: document.getElementById('product-video')?.value?.trim() || '',
            isDigital,
            digitalLink: isDigital ? (document.getElementById('product-digital-link')?.value?.trim() || '') : '',
            freeShipping: document.getElementById('product-free-shipping')?.checked || false,
            merchantId: APP.userProfile.uid,
            merchantName: APP.userProfile.displayName || APP.userProfile.username,
            merchantVerified: APP.userProfile.isVerifiedMerchant || false,
            merchantAppVerified: APP.userProfile.isAppVerified || false,
            status: 'active', sponsored: false,
            totalSales: 0, avgRating: 0, reviewCount: 0, totalAffiliates: 0, reservedStock: 0,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        const dc = document.getElementById('discount-code')?.value?.trim();
        const dv = parseFloat(document.getElementById('discount-value')?.value);
        if (dc && dv) {
            productData.discountCode = { code: dc.toUpperCase(), value: dv, type: document.getElementById('discount-type')?.value };
            await db.collection('discount_codes').add({ code: dc.toUpperCase(), type: document.getElementById('discount-type')?.value, value: dv, productId: null, merchantId: APP.userProfile.uid, active: true, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
        }
        
        await db.collection('products').add(productData);
        hideLoader();
        showToast('Product published! 🎉', 'success');
        navigateTo('merchant');
    } catch (error) {
        hideLoader();
        console.error('Product submit error:', error);
        showToast('Failed to publish', 'error');
    }
}