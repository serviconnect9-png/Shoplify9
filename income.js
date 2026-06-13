// income.js - COMPLETE PREMIUM VERSION (Affiliate, Merchant, Dropship, Influencer Dashboard, Leaderboard, Hall of Fame, Analytics, Advertisers, Install, Store Setup, Add Product)

// =====================
// AFFILIATE DASHBOARD
// =====================
async function loadAffiliateDashboard() {
    console.log('📢 Loading affiliate dashboard...');
    
    if (!APP.userProfile?.isAffiliate) {
        showToast('You need an active affiliate subscription', 'error');
        navigateTo('profile');
        return;
    }
    
    const container = document.getElementById('affiliate-content');
    if (!container) { console.error('❌ affiliate-content not found'); return; }
    
    container.innerHTML = '<p style="text-align:center;padding:40px;">Loading dashboard...</p>';
    
    try {
        const installedSnapshot = await db.collection('affiliate_products')
            .where('affiliateId', '==', APP.userProfile.uid).get();
        
        let totalClicks = 0, totalConversions = 0, totalCommission = 0;
        const products = [];
        
        installedSnapshot.forEach(doc => {
            const data = doc.data();
            totalClicks += data.clicks || 0;
            totalConversions += data.conversions || 0;
            totalCommission += data.totalCommission || 0;
            products.push({ id: doc.id, ...data });
        });
        
        const conversionRate = totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(1) : '0.0';
        
        // Get pending commissions from orders
        const ordersSnap = await db.collection('orders').where('items.affiliateId', '==', APP.userProfile.uid).get();
        let pendingCommission = 0;
        ordersSnap.forEach(doc => {
            const order = doc.data();
            if (order.status !== 'completed' && order.status !== 'cancelled') {
                order.items.forEach(item => {
                    if (item.affiliateId === APP.userProfile.uid) {
                        pendingCommission += (item.price || 0) * (item.commissionPercentage || APP.affiliateCommissionMin) / 100;
                    }
                });
            }
        });
        
        container.innerHTML = `
            <div style="padding:15px;">
                <div class="affiliate-stats">
                    <div class="stat-card"><div class="stat-value">${totalClicks.toLocaleString()}</div><div class="stat-label">Total Clicks</div></div>
                    <div class="stat-card"><div class="stat-value">${totalConversions}</div><div class="stat-label">Conversions</div></div>
                    <div class="stat-card"><div class="stat-value">${conversionRate}%</div><div class="stat-label">Rate</div></div>
                    <div class="stat-card"><div class="stat-value">${formatCurrency(totalCommission)}</div><div class="stat-label">Earned</div></div>
                    <div class="stat-card"><div class="stat-value">${formatCurrency(pendingCommission)}</div><div class="stat-label">Pending</div></div>
                    <div class="stat-card"><div class="stat-value">${formatCurrency(APP.userProfile.pendingEarnings||0)}</div><div class="stat-label">Wallet Pending</div></div>
                </div>
                
                <div class="affiliate-link-box" style="margin-top:15px;">
                    <h4>🔗 Your Affiliate Link</h4>
                    <div class="affiliate-link-display">${APP.baseUrl}/r/${APP.userProfile.uid}</div>
                    <button class="copy-btn" onclick="copyToClipboard('${APP.baseUrl}/r/${APP.userProfile.uid}')">📋 Copy</button>
                </div>
                
                <div style="display:flex;gap:10px;margin:15px 0;">
                    <button class="btn-gold" style="flex:1;" onclick="navigateTo('affiliate-install')">📢 Install Products</button>
                    <button class="btn-outline" style="flex:1;" onclick="navigateTo('advertisers')">🤝 Influencers</button>
                </div>
                
                <button class="btn-outline btn-full" style="margin-bottom:15px;" onclick="navigateTo('analytics')">📊 Analytics</button>
                
                <h4>📦 Installed Products (${products.length})</h4>
                <div id="installed-products-list">
                    ${products.length === 0 ? '<p style="color:#999;padding:20px;text-align:center;">No products installed yet</p>' : ''}
                </div>
            </div>`;
        
        if (products.length > 0) {
            const listContainer = document.getElementById('installed-products-list');
            products.forEach(product => {
                const isDropshipProduct = product.isDropshipProduct || false;
                listContainer.innerHTML += `
                    <div style="display:flex;gap:12px;padding:12px;background:${isDropshipProduct?'#E8F5E9':'white'};border-radius:12px;box-shadow:var(--shadow);margin-bottom:10px;align-items:center;${isDropshipProduct?'border-left:4px solid #4CAF50;':''}">
                        <img src="${product.productImage||'/app-icon.png'}" style="width:55px;height:55px;object-fit:cover;border-radius:8px;" onerror="this.src='/app-icon.png'">
                        <div style="flex:1;">
                            <div style="font-weight:600;font-size:14px;">${product.productName} ${isDropshipProduct?'<span style="color:#4CAF50;font-size:10px;">(Dropship)</span>':''}</div>
                            <div style="font-size:12px;color:#666;">👆 ${product.clicks||0} clicks | 💰 ${formatCurrency(product.totalCommission||0)} earned</div>
                            <div style="font-size:11px;color:#999;">Commission: ${product.commissionPercentage||APP.affiliateCommissionMin}%</div>
                        </div>
                        <button class="copy-btn" onclick="copyToClipboard('${product.affiliateLink}');showToast('Link copied!','success');">📋</button>
                    </div>`;
            });
        }
        
    } catch (error) {
        console.error('❌ Affiliate error:', error);
        container.innerHTML = '<p style="text-align:center;padding:40px;">Error loading. <button class="btn-outline" onclick="loadAffiliateDashboard()">Retry</button></p>';
    }
}

// =====================
// INFLUENCER DASHBOARD
// =====================
async function loadInfluencerDashboard() {
    console.log('📊 Loading influencer dashboard...');
    
    const container = document.getElementById('influencer-dashboard-content');
    if (!container) return;
    
    if (!APP.userProfile || APP.userProfile.influencerStatus !== 'approved') {
        container.innerHTML = '<p style="text-align:center;padding:40px;">Access denied</p>';
        return;
    }
    
    const isVerified = APP.userProfile.influencerVerified || false;
    const reports = APP.userProfile.influencerReports || 0;
    const suspensions = APP.userProfile.influencerSuspensions || 0;
    
    container.innerHTML = '<p style="text-align:center;padding:40px;">Loading dashboard...</p>';
    
    try {
        // Get influencer campaigns
        const campaignsSnap = await db.collection('influencer_campaigns')
            .where('influencerId', '==', APP.userProfile.uid)
            .get();
        
        let totalCampaigns = 0, activeCampaigns = 0, totalSales = 0, totalEarnings = 0, pendingEarnings = 0;
        const campaigns = [];
        
        campaignsSnap.forEach(doc => {
            const c = doc.data();
            totalCampaigns++;
            if (c.status === 'active') activeCampaigns++;
            totalSales += c.sales || 0;
            totalEarnings += c.earnings || 0;
            pendingEarnings += c.pendingEarnings || 0;
            campaigns.push({ id: doc.id, ...c });
        });
        
        campaigns.sort((a, b) => (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0));
        
        container.innerHTML = `
            <div style="padding:15px;">
                <div style="text-align:center;padding:20px;background:linear-gradient(135deg,#667eea,#764ba2);border-radius:12px;color:white;margin-bottom:15px;">
                    <h2>📊 Influencer Dashboard</h2>
                    <p style="opacity:0.9;">${isVerified ? '✓ Verified Influencer' : 'Unverified Influencer'}</p>
                    ${suspensions > 0 ? `<p style="color:#FFD700;">⚠️ ${suspensions} suspension${suspensions>1?'s':''} (${2-suspensions} remaining before ban)</p>` : ''}
                </div>
                
                <div class="affiliate-stats">
                    <div class="stat-card"><div class="stat-value">${totalCampaigns}</div><div class="stat-label">Campaigns</div></div>
                    <div class="stat-card"><div class="stat-value">${activeCampaigns}</div><div class="stat-label">Active</div></div>
                    <div class="stat-card"><div class="stat-value">${totalSales}</div><div class="stat-label">Sales</div></div>
                    <div class="stat-card"><div class="stat-value">${formatCurrency(totalEarnings)}</div><div class="stat-label">Earned</div></div>
                    <div class="stat-card"><div class="stat-value">${formatCurrency(pendingEarnings)}</div><div class="stat-label">Pending</div></div>
                    <div class="stat-card"><div class="stat-value">${reports}/3</div><div class="stat-label">Reports</div></div>
                </div>
                
                ${!isVerified ? `
                    <div style="background:#FFF8E1;padding:15px;border-radius:8px;margin:15px 0;">
                        <h4>🔒 Verification Required</h4>
                        <p style="font-size:13px;color:#666;">Requirements: ${APP.influencerVerification?.minCampaigns||50} campaigns, ${APP.influencerVerification?.minSales||100} sales, ${APP.influencerVerification?.minDaysActive||30} days active, no fraud reports</p>
                        <p style="font-size:12px;color:#666;">Progress: ${totalCampaigns}/${APP.influencerVerification?.minCampaigns||50} campaigns | ${totalSales}/${APP.influencerVerification?.minSales||100} sales</p>
                    </div>
                ` : ''}
                
                <h4>Your Campaigns</h4>
                <div id="influencer-campaigns-list">
                    ${campaigns.length === 0 ? '<p style="color:#999;text-align:center;padding:20px;">No campaigns yet</p>' : ''}
                </div>
                
                <div style="background:white;padding:15px;border-radius:12px;margin-top:15px;box-shadow:var(--shadow);">
                    <h4>📋 Your Profile</h4>
                    <p style="font-size:13px;">Name: <strong>${APP.userProfile.influencerName||APP.userProfile.displayName}</strong></p>
                    <p style="font-size:13px;">Niche: <strong>${APP.userProfile.influencerNiche||'Not set'}</strong></p>
                    <p style="font-size:13px;">Platforms: <strong>${(APP.userProfile.influencerPlatforms||[]).join(', ')}</strong></p>
                    <p style="font-size:13px;">Contact: <strong>${APP.userProfile.influencerPhone||'Not set'}</strong></p>
                    <p style="font-size:13px;">Status: <strong>${isVerified?'Verified ✅':'Unverified ⏳'}</strong></p>
                    <p style="font-size:13px;">Reports: <strong>${reports}/3</strong> | Suspensions: <strong>${suspensions}/2</strong></p>
                </div>
            </div>`;
        
        if (campaigns.length > 0) {
            const listEl = document.getElementById('influencer-campaigns-list');
            campaigns.forEach(c => {
                const statusColors = { active: '#4CAF50', completed: '#2196F3', cancelled: '#F44336' };
                listEl.innerHTML += `
                    <div style="padding:12px;background:white;border-radius:12px;box-shadow:var(--shadow);margin-bottom:8px;">
                        <div style="display:flex;justify-content:space-between;align-items:center;">
                            <strong>${c.productName||'Campaign'}</strong>
                            <span style="background:${statusColors[c.status]||'#999'};color:white;padding:2px 10px;border-radius:10px;font-size:11px;">${(c.status||'').toUpperCase()}</span>
                        </div>
                        <div style="font-size:12px;color:#666;margin-top:5px;">
                            Budget: ${formatCurrency(c.budget||0)} | Sales: ${c.sales||0} | Earnings: ${formatCurrency(c.earnings||0)}
                        </div>
                        <div style="font-size:11px;color:#999;">${getTimeAgo(c.createdAt)}</div>
                    </div>`;
            });
        }
        
    } catch (error) {
        console.error('❌ Influencer dashboard error:', error);
        container.innerHTML = '<p style="text-align:center;padding:40px;">Error loading</p>';
    }
}

// =====================
// ADVERTISERS / INFLUENCER MARKETPLACE
// =====================
async function loadAdvertisers() {
    console.log('🤝 Loading influencers marketplace...');
    
    const container = document.getElementById('advertisers-list');
    if (!container) { console.error('❌ advertisers-list not found'); return; }
    
    container.innerHTML = '<p style="text-align:center;padding:40px;">Loading influencers...</p>';
    
    try {
        const snapshot = await db.collection('users')
            .where('influencerStatus', '==', 'approved')
            .get();
        
        if (snapshot.empty) {
            container.innerHTML = '<p style="text-align:center;padding:40px;">No verified influencers available yet</p>';
            return;
        }
        
        const influencers = [];
        snapshot.forEach(doc => { const data = doc.data(); influencers.push({ id: doc.id, ...data }); });
        
        container.innerHTML = '';
        influencers.forEach(inf => {
            const platforms = (inf.influencerPlatforms || []).map(p => {
                const platform = APP.socialPlatforms?.find(sp => sp.id === p);
                return platform ? `<span style="font-size:20px;margin-right:5px;" title="${platform.name}">${platform.icon}</span>` : '';
            }).join('');
            
            const reports = inf.influencerReports || 0;
            const isVerified = inf.influencerVerified || false;
            
            container.innerHTML += `
                <div style="padding:15px;background:white;border-radius:12px;box-shadow:var(--shadow);margin-bottom:12px;">
                    <div style="display:flex;gap:12px;align-items:center;margin-bottom:10px;">
                        <img src="${inf.photoURL||'/app-icon.png'}" style="width:50px;height:50px;border-radius:50%;" onerror="this.src='/app-icon.png'">
                        <div style="flex:1;">
                            <div style="font-weight:600;">${inf.influencerName||inf.displayName||inf.username}</div>
                            <div style="font-size:12px;color:#666;">Niche: ${inf.influencerNiche||'General'}</div>
                            <div style="font-size:12px;margin-top:3px;">${platforms}</div>
                            <div style="font-size:11px;color:#666;">Reports: ${reports}/3 | ${inf.influencerSuspensions||0} suspensions</div>
                        </div>
                        ${isVerified ? '<span style="color:#20D5EC;font-size:18px;">✓</span>' : ''}
                    </div>
                    
                    <p style="font-size:13px;color:#666;">${inf.influencerBio||'No bio'}</p>
                    
                    <div style="display:flex;gap:8px;margin-top:10px;">
                        ${inf.influencerPhone ? `
                            <a href="https://wa.me/${inf.influencerPhone.replace(/\+/g,'')}?text=Hi! I found you on ONESHOPLIFY and would like to discuss a promotion opportunity." 
                               target="_blank" 
                               style="flex:1;text-align:center;padding:10px;background:#25D366;color:white;border-radius:8px;text-decoration:none;font-weight:600;font-size:13px;">
                                💬 Contact
                            </a>
                        ` : ''}
                        
                        ${APP.userProfile?.isDropshipper ? `
                            <button onclick="hireInfluencer('${inf.uid}','${inf.influencerName||inf.displayName}')" 
                                    style="flex:1;padding:10px;background:#FFD700;color:#1a1a1a;border:none;border-radius:8px;font-weight:600;font-size:13px;cursor:pointer;">
                                🤝 Hire
                            </button>
                        ` : ''}
                        
                        ${APP.userProfile?.isDropshipper ? `
                            <button onclick="reportInfluencer('${inf.uid}','${inf.influencerName||inf.displayName}')" 
                                    style="padding:10px;background:#FF4444;color:white;border:none;border-radius:8px;font-size:13px;cursor:pointer;">
                                🚩 Report
                            </button>
                        ` : ''}
                    </div>
                </div>`;
        });
        
    } catch (error) {
        console.error('❌ Advertisers error:', error);
        container.innerHTML = '<p style="text-align:center;padding:40px;">Unable to load</p>';
    }
}

// =====================
// HIRE INFLUENCER (For Dropshippers)
// =====================
async function hireInfluencer(influencerId, influencerName) {
    if (!APP.userProfile?.isDropshipper) { showToast('Only dropshippers can hire', 'error'); return; }
    
    // Get dropshipper's products
    const productsSnap = await db.collection('dropship_products')
        .where('dropshipperId', '==', APP.userProfile.uid)
        .where('status', '==', 'active')
        .get();
    
    const products = [];
    productsSnap.forEach(doc => products.push({ id: doc.id, ...doc.data() }));
    
    if (products.length === 0) { showToast('Import products first', 'error'); return; }
    
    showModal(`
        <div style="padding:10px;max-height:70vh;overflow-y:auto;">
            <h3>🤝 Hire ${influencerName}</h3>
            
            <div class="input-group"><label>Select Product</label>
                <select id="hire-product" class="input-field">
                    ${products.map(p => `<option value="${p.originalProductId}">${p.name} - ${formatCurrency(p.price)}</option>`).join('')}
                </select>
            </div>
            
            <div class="input-group"><label>Campaign Budget (USD)</label>
                <input type="number" id="hire-budget" class="input-field" placeholder="Min: $${APP.campaignMinBudget||20}" min="${APP.campaignMinBudget||20}">
            </div>
            
            <div class="input-group"><label>Duration (Days)</label>
                <input type="number" id="hire-duration" class="input-field" placeholder="7" min="1" max="${APP.campaignMaxDuration||30}" value="7">
            </div>
            
            <div style="background:#f5f5f5;padding:12px;border-radius:8px;margin:10px 0;">
                <p style="font-size:13px;">💡 Influencer earns 5% commission on each sale</p>
                <p style="font-size:12px;color:#666;">Your balance: ${formatCurrency(APP.userProfile.walletBalance||0)}</p>
            </div>
            
            <button class="btn-gold btn-full" onclick="confirmHireInfluencer('${influencerId}','${influencerName}')">✅ Hire & Pay</button>
        </div>
    `);
}

async function confirmHireInfluencer(influencerId, influencerName) {
    const productId = document.getElementById('hire-product')?.value;
    const budget = parseFloat(document.getElementById('hire-budget')?.value) || 0;
    const duration = parseInt(document.getElementById('hire-duration')?.value) || 7;
    
    if (!productId) { showToast('Select a product', 'error'); return; }
    if (budget < (APP.campaignMinBudget||20)) { showToast(`Minimum budget: $${APP.campaignMinBudget||20}`, 'error'); return; }
    if ((APP.userProfile?.walletBalance||0) < budget) { showToast('Insufficient balance', 'error'); navigateTo('wallet'); return; }
    
    hideModal(); showLoader();
    
    try {
        // Deduct budget from dropshipper
        await db.collection('users').doc(APP.userProfile.uid).update({
            walletBalance: firebase.firestore.FieldValue.increment(-budget)
        });
        APP.userProfile.walletBalance -= budget;
        
        // Get product details
        const productDoc = await db.collection('products').doc(productId).get();
        const product = productDoc.data();
        
        // Create campaign
        await db.collection('influencer_campaigns').add({
            dropshipperId: APP.userProfile.uid,
            dropshipperName: APP.userProfile.displayName || APP.userProfile.username,
            influencerId, influencerName,
            productId, productName: product?.name || 'Product',
            productPrice: product?.price || 0,
            budget, duration, commission: 5,
            status: 'active',
            sales: 0, earnings: 0, pendingEarnings: 0,
            startedAt: firebase.firestore.FieldValue.serverTimestamp(),
            endsAt: new Date(Date.now() + duration * 24 * 60 * 60 * 1000),
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Record transaction
        await db.collection('transactions').add({
            userId: APP.userProfile.uid, type: 'campaign', amount: budget,
            currency: 'USD', status: 'completed',
            description: `Hired ${influencerName} for ${product?.name||'product'}`,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Notify influencer
        if (typeof createNotification === 'function') {
            await createNotification(influencerId, '🤝 New Campaign!',
                `${APP.userProfile.displayName||APP.userProfile.username} hired you for "${product?.name||'a product'}" - Budget: ${formatCurrency(budget)}`,
                '🤝', 'influencer-dashboard');
        }
        
        hideLoader();
        showToast(`Campaign created! ${influencerName} hired. ✅`, 'success');
        
    } catch (e) { hideLoader(); showToast('Failed', 'error'); }
}

// =====================
// REPORT INFLUENCER
// =====================
async function reportInfluencer(influencerId, influencerName) {
    showModal(`
        <div style="padding:10px;">
            <h3>🚩 Report ${influencerName}</h3>
            <p style="color:#f44;font-size:13px;">⚠️ 3 reports = 2-week suspension. 2 suspensions = ban.</p>
            <div class="input-group"><label>Reason</label>
                <select id="report-reason" class="input-field">
                    <option value="">Select...</option>
                    <option value="no_delivery">Did not deliver promotion</option>
                    <option value="fraud">Fraudulent activity</option>
                    <option value="misconduct">Misconduct</option>
                    <option value="other">Other</option>
                </select>
            </div>
            <div class="input-group"><label>Details</label><textarea id="report-details" class="input-field" rows="2"></textarea></div>
            <button class="btn-danger btn-full" onclick="submitInfluencerReport('${influencerId}')">Submit Report</button>
        </div>
    `);
}

async function submitInfluencerReport(influencerId) {
    const reason = document.getElementById('report-reason')?.value;
    const details = document.getElementById('report-details')?.value?.trim();
    if (!reason) { showToast('Select reason', 'error'); return; }
    hideModal(); showLoader();
    
    try {
        // Get current report count
        const influencerDoc = await db.collection('users').doc(influencerId).get();
        const influencer = influencerDoc.data();
        const currentReports = (influencer.influencerReports || 0) + 1;
        const currentSuspensions = influencer.influencerSuspensions || 0;
        
        const updates = { influencerReports: currentReports };
        
        // Check for suspension
        if (currentReports >= 3) {
            updates.influencerStatus = 'suspended';
            updates.influencerSuspensions = currentSuspensions + 1;
            updates.influencerSuspendedAt = firebase.firestore.FieldValue.serverTimestamp();
            updates.influencerSuspendedUntil = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
            
            // Check for ban
            if (currentSuspensions + 1 >= 2) {
                updates.influencerStatus = 'banned';
                updates.influencerBannedAt = firebase.firestore.FieldValue.serverTimestamp();
            }
        }
        
        await db.collection('users').doc(influencerId).update(updates);
        
        // Record report
        await db.collection('influencer_reports').add({
            influencerId, reportedBy: APP.userProfile.uid,
            reason, details,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Notify influencer
        if (typeof createNotification === 'function') {
            await createNotification(influencerId, '🚩 Report Received',
                `You received a report. ${currentReports}/3 reports. ${currentReports>=3?'You are now suspended for 2 weeks.':''}`,
                '🚩', 'influencer-dashboard');
        }
        
        hideLoader();
        showToast('Report submitted ✅', 'success');
        
    } catch (e) { hideLoader(); showToast('Failed', 'error'); }
}

// =====================
// AFFILIATE INSTALL
// =====================
async function loadAffiliateInstall() {
    const container = document.getElementById('install-products');
    if (!container) return;
    
    container.innerHTML = '<p style="text-align:center;padding:40px;">Loading products...</p>';
    
    try {
        const snapshot = await db.collection('products').where('status','==','active').get();
        if (snapshot.empty) { container.innerHTML = '<p style="text-align:center;padding:40px;">No products</p>'; return; }
        
        const products = [];
        snapshot.forEach(doc => products.push({ id: doc.id, ...doc.data() }));
        products.sort((a,b) => (b.totalAffiliates||0) - (a.totalAffiliates||0));
        
        container.innerHTML = '<div class="products-grid-full">';
        products.slice(0,30).forEach(product => {
            const img = (product.images&&product.images[0])||'/app-icon.png';
            container.innerHTML += `
                <div class="product-card">
                    <img src="${img}" class="product-card-image" onerror="this.src='/app-icon.png'">
                    <div class="product-card-info">
                        <div class="product-card-name">${product.name}</div>
                        <div class="product-card-price">${formatCurrency(product.price)}</div>
                        <div style="font-size:11px;color:#666;">Commission: ${product.commissionPercentage||APP.affiliateCommissionMin}%</div>
                        <button class="btn-gold" style="width:100%;margin-top:8px;font-size:13px;padding:8px;" onclick="installWithAnimation('${product.id}')">📢 Install</button>
                    </div>
                </div>`;
        });
        container.innerHTML += '</div>';
    } catch(e) { container.innerHTML = '<p style="text-align:center;padding:40px;">Error</p>'; }
}

function installWithAnimation(productId) {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:9999;';
    overlay.innerHTML = `<div style="position:relative;width:150px;height:150px;"><svg width="150" height="150"><circle cx="75" cy="75" r="65" fill="none" stroke="#333" stroke-width="8"/><circle id="install-progress-circle" cx="75" cy="75" r="65" fill="none" stroke="#FFD700" stroke-width="8" stroke-linecap="round" stroke-dasharray="408" stroke-dashoffset="408" transform="rotate(-90 75 75)" style="transition:stroke-dashoffset 0.1s;"/></svg><div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;"><div id="install-percent" style="font-size:32px;font-weight:800;color:#FFD700;">0%</div></div></div><p style="color:white;margin-top:20px;font-weight:600;">Installing...</p>`;
    document.body.appendChild(overlay);
    
    let percent = 0;
    const circle = overlay.querySelector('#install-progress-circle');
    const percentText = overlay.querySelector('#install-percent');
    const circumference = 408;
    
    const interval = setInterval(async () => {
        percent += 1;
        percentText.textContent = percent + '%';
        circle.style.strokeDashoffset = circumference - (percent/100)*circumference;
        if (percent >= 100) {
            clearInterval(interval);
            await completeInstallation(productId, APP.userProfile.uid, overlay);
        }
    }, 100);
}

async function completeInstallation(productId, userId, overlay) {
    try {
        const productDoc = await db.collection('products').doc(productId).get();
        if (!productDoc.exists) { document.body.removeChild(overlay); showToast('Not found','error'); return; }
        const product = productDoc.data();
        const link = `${APP.baseUrl}/r/${userId}/${productId}`;
        
        await db.collection('affiliate_products').add({
            affiliateId:userId,productId,productName:product.name,
            productImage:(product.images&&product.images[0])||'',productPrice:product.price,
            commissionPercentage:product.commissionPercentage||APP.affiliateCommissionMin,
            affiliateLink:link,status:'active',clicks:0,conversions:0,totalCommission:0,
            installedAt:firebase.firestore.FieldValue.serverTimestamp()
        });
        
        await db.collection('products').doc(productId).update({totalAffiliates:firebase.firestore.FieldValue.increment(1)});
        
        overlay.innerHTML = `<div style="text-align:center;color:white;"><div style="font-size:60px;">✅</div><h2 style="color:#FFD700;margin:15px 0;">Installed!</h2><p>${product.name}</p><div style="background:#333;padding:15px;border-radius:8px;margin:20px 0;max-width:300px;word-break:break-all;"><small style="color:#999;">Link:</small><p style="font-size:13px;color:#FFD700;">${link}</p></div><div style="display:flex;gap:10px;justify-content:center;"><button onclick="copyToClipboard('${link}');showToast('Copied!','success');" style="padding:12px 20px;background:#FFD700;color:#1a1a1a;border:none;border-radius:8px;font-weight:700;cursor:pointer;">📋 Copy</button><button onclick="window.open('https://wa.me/?text='+encodeURIComponent('🔥 ${product.name}\\n${link}'))" style="padding:12px 20px;background:#25D366;color:white;border:none;border-radius:8px;font-weight:700;cursor:pointer;">💬 WhatsApp</button></div><button onclick="document.body.removeChild(this.parentElement.parentElement);navigateTo('affiliate');" style="margin-top:20px;padding:12px 30px;background:transparent;color:white;border:2px solid white;border-radius:8px;cursor:pointer;font-weight:600;">Go to Dashboard</button></div>`;
        
        setTimeout(() => { if(document.body.contains(overlay)){document.body.removeChild(overlay);navigateTo('affiliate');} }, 5000);
    } catch(e) { document.body.removeChild(overlay); showToast('Failed','error'); }
}

// =====================
// MERCHANT DASHBOARD
// =====================
async function loadMerchantDashboard() {
    if (!APP.userProfile?.isMerchant) { showToast('Need merchant subscription','error'); navigateTo('profile'); return; }
    const container = document.getElementById('merchant-content');
    if (!container) return;
    
    container.innerHTML = '<p style="text-align:center;padding:40px;">Loading...</p>';
    
    try {
        const allProducts = await db.collection('products').get();
        const myProducts = [];
        allProducts.forEach(doc => { const p = doc.data(); if(p.merchantId===APP.userProfile.uid) myProducts.push({id:doc.id,...p}); });
        
        const allOrders = await db.collection('orders').get();
        let totalRevenue=0, totalOrders=0, pendingOrders=0;
        allOrders.forEach(doc => { const o=doc.data(); if(o.merchantId===APP.userProfile.uid){ totalRevenue+=o.total||0; totalOrders++; if(o.status==='pending'||o.status==='processing') pendingOrders++; } });
        
        container.innerHTML = `
            <div style="padding:15px;">
                <div style="text-align:center;padding:20px;background:white;border-radius:12px;margin-bottom:15px;box-shadow:var(--shadow);">
                    <div style="width:100%;height:80px;background:linear-gradient(135deg,#FFD700,#FFA000);border-radius:12px;display:flex;align-items:center;justify-content:center;color:white;font-size:22px;font-weight:700;">${APP.userProfile.storeName||'Your Store'}</div>
                    <h3 style="margin-top:12px;">${APP.userProfile.storeName||'Unnamed Store'}</h3>
                    <p style="color:#666;font-size:13px;">${APP.userProfile.storeTemplate||'Classic'} | ${APP.userProfile.countryFlag||''} ${APP.userProfile.country||''}</p>
                    <button class="btn-outline" style="margin-top:10px;" onclick="navigateTo('store-setup')">⚙️ Settings</button>
                </div>
                <div class="affiliate-stats">
                    <div class="stat-card"><div class="stat-value">${myProducts.length}</div><div class="stat-label">Products</div></div>
                    <div class="stat-card"><div class="stat-value">${totalOrders}</div><div class="stat-label">Orders</div></div>
                    <div class="stat-card"><div class="stat-value">${pendingOrders}</div><div class="stat-label">Pending</div></div>
                    <div class="stat-card"><div class="stat-value">${formatCurrency(totalRevenue)}</div><div class="stat-label">Revenue</div></div>
                </div>
                <div style="display:flex;gap:10px;margin:15px 0;">
                    <button class="btn-gold" style="flex:1;" onclick="navigateTo('add-product')">➕ Add</button>
                    <button class="btn-outline" style="flex:1;" onclick="navigateTo('analytics')">📊 Analytics</button>
                </div>
                <h4>My Products (${myProducts.length})</h4>
                <div id="merchant-products-list">${myProducts.length===0?'<p style="color:#999;padding:20px;text-align:center;">No products</p>':''}</div>
            </div>`;
        
        if(myProducts.length>0){
            const list=document.getElementById('merchant-products-list');
            myProducts.forEach(p=>{
                const health=(p.totalSales||0)>50?'health-good':(p.totalSales||0)>10?'health-warning':'health-poor';
                const img=(p.images&&p.images[0])||'/app-icon.png';
                list.innerHTML+=`<div class="merchant-product-item" style="margin-bottom:8px;"><img src="${img}" onerror="this.src='/app-icon.png'"><div style="flex:1;"><div style="font-weight:600;">${p.name}</div><div style="font-size:13px;color:#666;">${formatCurrency(p.price)} | Stock:${p.stock||0}</div><div style="font-size:12px;"><span class="product-health ${health}"></span> ${p.totalSales||0} sales ${p.sponsored?'⭐':''}</div></div><div style="display:flex;flex-direction:column;gap:5px;"><button class="btn-small btn-outline" onclick="toggleProductStatus('${p.id}','${p.status||'active'}')">${p.status==='active'?'Disable':'Enable'}</button>${(p.totalSales||0)>=APP.sponsorMinSales?`<button class="btn-small btn-gold" onclick="sponsorProduct('${p.id}')">⭐ Sponsor</button>`:''}</div></div>`;
            });
        }
    } catch(e) { container.innerHTML = '<p style="text-align:center;padding:40px;">Error</p>'; }
}

async function toggleProductStatus(productId, currentStatus) {
    const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
    try { await db.collection('products').doc(productId).update({status:newStatus}); showToast(`Product ${newStatus==='active'?'enabled':'disabled'}`,'success'); loadMerchantDashboard(); }
    catch(e) { showToast('Failed','error'); }
}

function sponsorProduct(productId) {
    if((APP.userProfile.walletBalance||0)<APP.sponsorshipFee){showToast(`Need $${APP.sponsorshipFee}`,'error');navigateTo('wallet');return;}
    showModal(`<h3>⭐ Sponsor</h3><p>Cost: $${APP.sponsorshipFee}/mo</p><button class="btn-gold btn-full" onclick="confirmSponsorship('${productId}')">Sponsor - $${APP.sponsorshipFee}</button>`);
}

async function confirmSponsorship(productId) {
    hideModal();
    try {
        await db.collection('users').doc(APP.userProfile.uid).update({walletBalance:firebase.firestore.FieldValue.increment(-APP.sponsorshipFee)});
        await db.collection('products').doc(productId).update({sponsored:true,sponsoredUntil:firebase.firestore.Timestamp.fromDate(new Date(Date.now()+30*24*60*60*1000))});
        APP.userProfile.walletBalance-=APP.sponsorshipFee;
        await db.collection('transactions').add({userId:APP.userProfile.uid,type:'sponsorship',amount:APP.sponsorshipFee,currency:'USD',status:'completed',createdAt:firebase.firestore.FieldValue.serverTimestamp()});
        showToast('Sponsored! ⭐','success');loadMerchantDashboard();
    } catch(e) { showToast('Failed','error'); }
}

// =====================
// ANALYTICS
// =====================
let analyticsChart=null,currentAnalyticsRange='week';

function loadChartJS(){return new Promise(r=>{if(typeof Chart!=='undefined'){r();return;}const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';s.onload=()=>{r();};s.onerror=()=>{r();};document.head.appendChild(s);});}

async function loadAnalytics(){
    const c=document.getElementById('analytics-content');if(!c)return;
    if(!APP.userProfile){c.innerHTML='<p style="text-align:center;padding:40px;">Login required</p>';return;}
    c.innerHTML='<p style="text-align:center;padding:40px;">Loading...</p>';
    await loadChartJS();
    c.innerHTML=`<div style="padding:15px;"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;"><h3>📊 Analytics</h3><select id="analytics-range" onchange="switchAnalyticsRange()" style="padding:8px 12px;border:2px solid #e0e0e0;border-radius:8px;"><option value="week">Week</option><option value="month">Month</option></select></div><div class="affiliate-stats"><div class="stat-card"><div class="stat-value" id="stat-revenue">$0</div><div class="stat-label">Revenue</div></div><div class="stat-card"><div class="stat-value" id="stat-orders">0</div><div class="stat-label">Orders</div></div></div><div style="background:white;border-radius:12px;padding:15px;margin-bottom:15px;"><h4>📈 Performance</h4><div style="position:relative;height:250px;"><canvas id="analyticsChart"></canvas></div></div><div style="background:#1a1a2e;color:white;padding:15px;border-radius:12px;"><h4>🧠 Insights</h4><p id="insightText">Analyzing...</p></div></div>`;
    setTimeout(()=>{initializeCharts();generateAnalyticsFromUserData(APP.userProfile.uid);},600);
}

function initializeCharts(){if(analyticsChart)analyticsChart.destroy();const ctx=document.getElementById('analyticsChart');if(ctx&&typeof Chart!=='undefined'){analyticsChart=new Chart(ctx,{type:'line',data:{labels:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],datasets:[{label:'Revenue',data:[0,0,0,0,0,0,0],borderColor:'#FFD700',tension:0.3,borderWidth:2},{label:'Orders',data:[0,0,0,0,0,0,0],borderColor:'#00C851',tension:0.3,borderWidth:2}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom'}}}});}}

function updateAllCharts(data){if(!data||typeof Chart==='undefined')return;if(analyticsChart){analyticsChart.data.labels=data.labels||[];analyticsChart.data.datasets[0].data=data.revenue||[];analyticsChart.data.datasets[1].data=data.orders||[];analyticsChart.update();}}

function updateSummaryStats(data){if(!data)return;const tr=(data.revenue||[]).reduce((a,b)=>a+b,0);const to=(data.orders||[]).reduce((a,b)=>a+b,0);document.getElementById('stat-revenue')&&(document.getElementById('stat-revenue').textContent=formatCurrency(tr));document.getElementById('stat-orders')&&(document.getElementById('stat-orders').textContent=to);}

function updateAIInsights(data){const el=document.getElementById('insightText');if(!el||!data)return;const r=data.revenue||[];if(r.length<2||r.every(v=>v===0)){el.textContent='📊 Start selling!';return;}const last=r.length-1;const insights=[];if(r[last]>r[last-1]&&r[last-1]>0){insights.push(`📈 Revenue grew ${((r[last]-r[last-1])/r[last-1]*100).toFixed(1)}%!`);}if(insights.length===0)insights.push('✅ Stable performance.');el.textContent=insights.join(' ');}

async function generateAnalyticsFromUserData(userId){try{const os=await db.collection('orders').where('userId','==',userId).get();const days=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];const r=[0,0,0,0,0,0,0],o=[0,0,0,0,0,0,0];os.forEach(doc=>{const order=doc.data();const date=order.createdAt?.toDate?.()||order.createdAt||new Date();const di=(date.getDay()+6)%7;r[di]+=order.total||0;o[di]+=1;});updateAllCharts({labels:days,revenue:r,orders:o});updateSummaryStats({revenue:r,orders:o});updateAIInsights({revenue:r});}catch(e){document.getElementById('insightText')&&(document.getElementById('insightText').textContent='Start selling!');}}

function switchAnalyticsRange(){const s=document.getElementById('analytics-range');if(s){currentAnalyticsRange=s.value;initializeCharts();if(APP.userProfile?.uid)generateAnalyticsFromUserData(APP.userProfile.uid);}}

// =====================
// LEADERBOARD
// =====================
async function loadLeaderboard(){
    const c=document.getElementById('leaderboard-content');if(!c)return;
    c.innerHTML='<p style="text-align:center;padding:40px;">Loading...</p>';
    try{
        const snap=await db.collection('users').get();const all=[];snap.forEach(d=>all.push(d.data()));
        const aff=all.filter(u=>u.isAffiliate).sort((a,b)=>(b.affiliateEarnings||0)-(a.affiliateEarnings||0)).slice(0,20);
        const mer=all.filter(u=>u.isMerchant).sort((a,b)=>(b.totalRevenue||0)-(a.totalRevenue||0)).slice(0,20);
        const drp=all.filter(u=>u.isDropshipper).sort((a,b)=>(b.totalRevenue||0)-(a.totalRevenue||0)).slice(0,20);
        c.innerHTML=`<div style="padding:15px;"><h3>🏆 Top Affiliates</h3>${aff.length===0?'<p style="color:#999;">None</p>':aff.map((u,i)=>{const m=['🥇','🥈','🥉'];return`<div class="earner-card" style="margin-bottom:6px;cursor:pointer;" onclick="showEarnerDetails('${u.username}','${u.displayName||u.username}','${u.totalSales||0}','${u.affiliateEarnings||0}','${u.totalRevenue||0}','affiliate','${i+1}',${u.isAppVerified||false},${u.isAmbassador||false})"><span style="font-size:22px;">${m[i]||'⭐'}</span><span><strong>${u.displayName||u.username}</strong></span><span style="margin-left:auto;">${formatCurrency(u.affiliateEarnings||0)}</span></div>`}).join('')}</div><div style="padding:15px;"><h3>🏪 Top Merchants</h3>${mer.length===0?'<p style="color:#999;">None</p>':mer.map((u,i)=>{const m=['🥇','🥈','🥉'];return`<div class="earner-card" style="margin-bottom:6px;cursor:pointer;" onclick="showEarnerDetails('${u.username}','${u.displayName||u.username}','${u.totalSales||0}','${u.affiliateEarnings||0}','${u.totalRevenue||0}','merchant','${i+1}',${u.isAppVerified||false},${u.isAmbassador||false})"><span style="font-size:22px;">${m[i]||'⭐'}</span><span><strong>${u.displayName||u.username}</strong></span><span style="margin-left:auto;">${formatCurrency(u.totalRevenue||0)}</span></div>`}).join('')}</div><div style="padding:15px;"><h3>📦 Top Dropshippers</h3>${drp.length===0?'<p style="color:#999;">None</p>':drp.map((u,i)=>{const m=['🥇','🥈','🥉'];return`<div class="earner-card" style="margin-bottom:6px;cursor:pointer;" onclick="showEarnerDetails('${u.username}','${u.displayName||u.username}','${u.totalSales||0}','${u.affiliateEarnings||0}','${u.totalRevenue||0}','dropshipper','${i+1}',${u.isAppVerified||false},${u.isAmbassador||false})"><span style="font-size:22px;">${m[i]||'⭐'}</span><span><strong>${u.displayName||u.username}</strong></span><span style="margin-left:auto;">${formatCurrency(u.totalRevenue||0)}</span></div>`}).join('')}</div>`;
    }catch(e){c.innerHTML='<p style="text-align:center;padding:40px;">Error</p>';}
}

function showEarnerDetails(username,displayName,totalSales,affiliateEarnings,totalRevenue,type,rank,isVerified,isAmbassador){
    showModal(`<div style="text-align:center;padding:10px;"><div style="font-size:60px;margin-bottom:10px;">${rank==1?'👑':rank==2?'🥈':rank==3?'🥉':'⭐'}</div><h2>${displayName}</h2><p>@${username}</p><p>${type.toUpperCase()} | #${rank}</p>${isVerified?'<span style="background:#20D5EC;color:white;padding:4px 12px;border-radius:12px;font-size:12px;">✓ Verified</span>':''}<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:20px 0;"><div class="stat-card"><div class="stat-value">${totalSales}</div><div class="stat-label">Sales</div></div><div class="stat-card"><div class="stat-value">${formatCurrency(affiliateEarnings)}</div><div class="stat-label">Earnings</div></div><div class="stat-card"><div class="stat-value">${formatCurrency(totalRevenue)}</div><div class="stat-label">Revenue</div></div><div class="stat-card"><div class="stat-value">#${rank}</div><div class="stat-label">Rank</div></div></div><button class="btn-gold btn-full" onclick="hideModal()">Close</button></div>`);
}

// =====================
// HALL OF FAME
// =====================
async function loadHallOfFame(){
    const c=document.getElementById('hall-fame-content');if(!c)return;
    c.innerHTML='<p style="text-align:center;padding:40px;">Loading...</p>';
    try{
        const snap=await db.collection('users').get();const all=[];snap.forEach(d=>all.push(d.data()));
        const top=all.sort((a,b)=>(b.totalSales||0)-(a.totalSales||0)).slice(0,30);
        if(top.length===0){c.innerHTML='<div style="text-align:center;padding:60px;"><p style="font-size:50px;">🌟</p><h3>Hall of Fame</h3></div>';return;}
        c.innerHTML='<h3 style="padding:15px;">🌟 Hall of Fame</h3>';
        top.forEach((u,i)=>{const b=[];if(u.isAppVerified)b.push('✓');if(u.isAmbassador)b.push('👑');c.innerHTML+=`<div style="display:flex;align-items:center;gap:12px;padding:15px;border-bottom:1px solid #f0f0f0;"><span style="font-size:28px;min-width:40px;">${i===0?'👑':i===1?'🥈':i===2?'🥉':'#'+(i+1)}</span><img src="${u.photoURL||'/app-icon.png'}" style="width:40px;height:40px;border-radius:50%;" onerror="this.src='/app-icon.png'"><div style="flex:1;"><div style="font-weight:600;">${u.displayName||u.username}</div><div style="font-size:12px;color:#666;">${u.totalSales||0} sales | ${formatCurrency(u.totalRevenue||0)}</div></div><div>${b.join(' ')}</div></div>`;});
    }catch(e){c.innerHTML='<p style="text-align:center;padding:40px;">Error</p>';}
}

// =====================
// TOP EARNERS
// =====================
async function loadTopEarners(){
    const c=document.getElementById('top-earners');if(!c)return;
    if(!APP.userProfile?.isAffiliate&&!APP.userProfile?.isMerchant&&!APP.userProfile?.isDropshipper){c.innerHTML='';return;}
    try{
        const snap=await db.collection('users').get();const all=[];snap.forEach(d=>all.push(d.data()));
        const top=all.filter(u=>u.isAffiliate).sort((a,b)=>(b.affiliateEarnings||0)-(a.affiliateEarnings||0)).slice(0,3);
        c.innerHTML='<h4>🏆 Top Affiliates</h4>';
        if(top.length===0)c.innerHTML+='<p style="color:#999;">None</p>';
        else top.forEach((u,i)=>{const m=['👑','🥈','🥉'];c.innerHTML+=`<div class="earner-card"><span>${m[i]}</span><span><strong>${u.displayName||u.username}</strong></span><span style="margin-left:auto;">${formatCurrency(u.affiliateEarnings||0)}</span></div>`;});
    }catch(e){}
}

// =====================
// STORE SETUP
// =====================
function loadStoreSetup(){
    const c=document.getElementById('store-setup-content');if(!c)return;
    const templates=[{id:'classic',name:'Classic',icon:'🏪',color:'#FFD700'},{id:'modern',name:'Modern',icon:'🏢',color:'#2196F3'},{id:'premium',name:'Premium',icon:'✨',color:'#9C27B0'},{id:'minimal',name:'Minimal',icon:'🎯',color:'#607D8B'}];
    const shippingRates=APP.userProfile?.shippingRates||{};
    const shippingCodes=APP.userProfile?.shippingCodes||[];
    const discountCodes=APP.userProfile?.discountCodes||[];
    c.innerHTML=`<div style="padding:20px;"><h3>⚙️ Store Setup</h3><div class="input-group"><label>Store Name</label><input type="text" id="store-name" class="input-field" value="${APP.userProfile.storeName||''}"></div><h4 style="margin-top:20px;">Template</h4><div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:10px;">${templates.map(t=>`<div class="plan-card ${APP.userProfile.storeTemplate===t.id?'active':''}" onclick="selectTemplate('${t.id}')" style="text-align:center;cursor:pointer;"><div style="font-size:40px;">${t.icon}</div><div style="font-weight:600;">${t.name}</div></div>`).join('')}</div><h4 style="margin-top:20px;">🌍 Shipping</h4><div id="shipping-list">${Object.keys(shippingRates).length===0?'<p style="color:#999;">None</p>':Object.entries(shippingRates).map(([c,r])=>`<div style="display:flex;justify-content:space-between;padding:8px;background:#f5f5f5;border-radius:8px;margin-bottom:4px;"><span>${COUNTRIES?.[c]?.flag||''} ${COUNTRIES?.[c]?.name||c}</span><span>$${r} <button onclick="removeShippingCountry('${c}')" style="background:none;border:none;color:red;cursor:pointer;">✕</button></span></div>`).join('')}</div><button class="btn-outline btn-full" onclick="addShippingCountry()">➕ Add</button><h4 style="margin-top:20px;">🎫 Codes</h4><div>${shippingCodes.map(c=>`<div style="padding:8px;background:${c.used?'#FFEBEE':'#E8F5E9'};border-radius:8px;margin-bottom:4px;"><strong>${c.code}</strong> - ${c.value}${c.type==='percentage'?'%':'$'} ${c.used?'(Used)':'(Active)'}</div>`).join('')}${discountCodes.map(c=>`<div style="padding:8px;background:${c.used?'#FFEBEE':'#E8F5E9'};border-radius:8px;margin-bottom:4px;"><strong>${c.code}</strong> - ${c.value}${c.type==='percentage'?'%':'$'} | Used:${c.usedCount||0}${c.maxUses?'/'+c.maxUses:''}</div>`).join('')}</div><button class="btn-outline btn-full" onclick="createShippingCode()">🎫 Create Code</button><button class="btn-gold btn-full" style="margin-top:20px;" onclick="saveStoreSetup()">💾 Save</button></div>`;
}

function selectTemplate(id){document.querySelectorAll('.plan-card').forEach(c=>c.classList.remove('active'));event.target.closest('.plan-card').classList.add('active');APP._selectedTemplate=id;}
function addShippingCountry(){showModal(`<h3>🌍 Add</h3><div class="input-group"><label>Country</label><select id="new-shipping-country" class="input-field">${typeof COUNTRIES!=='undefined'?Object.entries(COUNTRIES).sort((a,b)=>a[1].name.localeCompare(b[1].name)).map(([c,d])=>`<option value="${c}">${d.flag||''} ${d.name}</option>`).join(''):''}</select></div><div class="input-group"><label>Rate (USD)</label><input type="number" id="new-shipping-rate" class="input-field" step="0.01" min="0"></div><button class="btn-gold btn-full" onclick="saveShippingCountry()">Add</button>`);}
async function saveShippingCountry(){const c=document.getElementById('new-shipping-country')?.value;const r=parseFloat(document.getElementById('new-shipping-rate')?.value)||0;if(!c)return;const rates=APP.userProfile?.shippingRates||{};rates[c]=r;await db.collection('users').doc(APP.userProfile.uid).update({shippingRates:rates});APP.userProfile.shippingRates=rates;hideModal();loadStoreSetup();showToast('Added!','success');}
async function removeShippingCountry(c){const rates=APP.userProfile?.shippingRates||{};delete rates[c];await db.collection('users').doc(APP.userProfile.uid).update({shippingRates:rates});APP.userProfile.shippingRates=rates;loadStoreSetup();}
function createShippingCode(){showModal(`<h3>🎫 Create Code</h3><div class="input-group"><label>Code</label><input type="text" id="new-shipping-code" class="input-field" placeholder="FREESHIP"></div><div class="input-group"><label>Value</label><input type="number" id="new-shipping-value" class="input-field" min="1"></div><div class="input-group"><label>Type</label><select id="new-shipping-type" class="input-field"><option value="percentage">%</option><option value="fixed">$</option></select></div><button class="btn-gold btn-full" onclick="saveShippingCode()">Create</button>`);}
async function saveShippingCode(){const code=document.getElementById('new-shipping-code')?.value?.trim()?.toUpperCase();const value=parseFloat(document.getElementById('new-shipping-value')?.value)||0;const type=document.getElementById('new-shipping-type')?.value;if(!code||!value){showToast('Fill fields','error');return;}const codes=APP.userProfile?.shippingCodes||[];codes.push({code,value,type,used:false});await db.collection('users').doc(APP.userProfile.uid).update({shippingCodes:codes});APP.userProfile.shippingCodes=codes;hideModal();loadStoreSetup();showToast('Created!','success');}
async function saveStoreSetup(){const storeName=document.getElementById('store-name')?.value?.trim();const template=APP._selectedTemplate||APP.userProfile.storeTemplate||'classic';if(!storeName){showToast('Enter name','error');return;}await db.collection('users').doc(APP.userProfile.uid).update({storeName,storeTemplate:template,storeActive:true});APP.userProfile.storeName=storeName;APP.userProfile.storeTemplate=template;showToast('Saved!','success');navigateTo('merchant');}

// =====================
// ADD PRODUCT
// =====================
async function loadAddProductForm(){
    const c=document.getElementById('add-product-form');if(!c)return;
    c.innerHTML=`<div style="padding:20px;"><div class="input-group"><label>Name *</label><input type="text" id="product-name" class="input-field"></div><div class="input-group"><label>Price *</label><input type="number" id="product-price" class="input-field" step="0.01" min="0.01"></div><div class="input-group"><label>Category *</label><select id="product-category" class="input-field">${APP.categories.filter(c=>c!=='All').map(c=>`<option value="${c}">${c}</option>`).join('')}</select></div><div class="input-group"><label>Stock</label><input type="number" id="product-stock" class="input-field" min="0"></div><div class="input-group"><label>Commission (%)</label><input type="number" id="product-commission" class="input-field" value="4" min="1" max="100"></div><div class="input-group"><label>Colors</label><input type="text" id="product-colors" class="input-field" placeholder="Black,White"></div><div class="input-group"><label>Sizes</label><input type="text" id="product-sizes" class="input-field" placeholder="S,M,L"></div><div class="input-group"><label>Description</label><textarea id="product-description" class="input-field" rows="4"></textarea></div><div class="input-group"><label><input type="checkbox" id="product-digital" onchange="toggleDigitalFields()"> Digital</label></div><div class="input-group hidden" id="digital-link-group"><label>Link</label><input type="url" id="product-digital-link" class="input-field"></div><div class="input-group"><label>Images (5)</label><input type="file" id="product-images" class="input-field" multiple accept="image/*" onchange="previewProductImages()"><div id="image-preview-container" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;"></div></div><div class="input-group"><label>Discount Code</label><div style="display:flex;gap:8px;"><input type="text" id="discount-code" class="input-field" placeholder="SAVE20" style="flex:1;"><input type="number" id="discount-value" class="input-field" placeholder="20" style="flex:1;" min="1"><select id="discount-type" class="input-field" style="flex:1;"><option value="percentage">%</option><option value="fixed">$</option></select></div></div><div class="input-group"><label>Max Uses</label><input type="number" id="discount-max-uses" class="input-field" placeholder="Unlimited" min="1"></div><div class="input-group"><label><input type="checkbox" id="product-free-shipping"> Free Shipping</label></div><button class="btn-gold btn-full" onclick="submitProduct()">📦 Publish</button></div>`;
}

function toggleDigitalFields(){const dg=document.getElementById('digital-link-group');const isDigital=document.getElementById('product-digital')?.checked;if(dg)dg.classList.toggle('hidden',!isDigital);const sf=document.getElementById('product-stock');if(sf){sf.value=isDigital?'999999':'';sf.disabled=isDigital;}}
function previewProductImages(){const files=document.getElementById('product-images')?.files;const c=document.getElementById('image-preview-container');if(!c)return;c.innerHTML='';if(files)Array.from(files).slice(0,5).forEach(file=>{const r=new FileReader();r.onload=e=>c.innerHTML+=`<img src="${e.target.result}" style="width:70px;height:70px;object-fit:cover;border-radius:8px;">`;r.readAsDataURL(file);});}

async function submitProduct(){
    const name=document.getElementById('product-name')?.value?.trim();
    const price=parseFloat(document.getElementById('product-price')?.value);
    const category=document.getElementById('product-category')?.value;
    const isDigital=document.getElementById('product-digital')?.checked;
    if(!name||!price||!category){showToast('Fill required','error');return;}
    showLoader();
    try{
        const imageFiles=document.getElementById('product-images')?.files;let imageUrls=[];
        if(imageFiles?.length)for(const file of Array.from(imageFiles).slice(0,5)){try{imageUrls.push(await uploadToCloudinary(file));}catch(e){}}
        const productData={
            name,price,category,
            stock:isDigital?999999:(parseInt(document.getElementById('product-stock')?.value)||0),
            commissionPercentage:parseInt(document.getElementById('product-commission')?.value)||APP.affiliateCommissionMin,
            colors:document.getElementById('product-colors')?.value?.split(',').map(c=>c.trim()).filter(Boolean)||[],
            sizes:document.getElementById('product-sizes')?.value?.split(',').map(s=>s.trim()).filter(Boolean)||[],
            description:document.getElementById('product-description')?.value?.trim()||'',
            images:imageUrls.length>0?imageUrls:['/app-icon.png'],
            isDigital,digitalLink:isDigital?(document.getElementById('product-digital-link')?.value?.trim()||''):'',
            freeShipping:document.getElementById('product-free-shipping')?.checked||false,
            merchantId:APP.userProfile.uid,merchantName:APP.userProfile.displayName||APP.userProfile.username,
            status:'active',sponsored:false,totalSales:0,avgRating:0,reviewCount:0,totalAffiliates:0,
            createdAt:firebase.firestore.FieldValue.serverTimestamp()
        };
        const dc=document.getElementById('discount-code')?.value?.trim();
        const dv=parseFloat(document.getElementById('discount-value')?.value);
        const maxUses=parseInt(document.getElementById('discount-max-uses')?.value)||null;
        if(dc&&dv){
            productData.discountCode={code:dc.toUpperCase(),value:dv,type:document.getElementById('discount-type')?.value,maxUses,usedCount:0,active:true};
            await db.collection('discount_codes').add({code:dc.toUpperCase(),type:document.getElementById('discount-type')?.value,value:dv,maxUses,usedCount:0,merchantId:APP.userProfile.uid,active:true,createdAt:firebase.firestore.FieldValue.serverTimestamp()});
            const codes=APP.userProfile?.discountCodes||[];codes.push({code:dc.toUpperCase(),value:dv,type:document.getElementById('discount-type')?.value,maxUses,usedCount:0,used:false});
            await db.collection('users').doc(APP.userProfile.uid).update({discountCodes:codes});
        }
        await db.collection('products').add(productData);
        hideLoader();showToast('Published! 🎉','success');navigateTo('merchant');
    }catch(e){hideLoader();showToast('Failed','error');}
}

console.log('✅ income.js fully loaded - ONESHOPLIFY Premium Ready');
