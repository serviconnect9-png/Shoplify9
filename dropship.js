// dropship.js - COMPLETE FINAL VERSION (Hide plans after paid, Auto text color, Direct upload, Influencers)

async function loadDropshipDashboard() {
    const container = document.getElementById('dropship-content');
    if (!container || !APP.userProfile) return;
    
    const currentPlan = APP.userProfile.dropshipPlan || 'none';
    const isSubscribed = APP.userProfile.isDropshipper && currentPlan !== 'none';
    
    if (isSubscribed) {
        // SHOW DASHBOARD - No plan details
        const storeName = APP.userProfile?.storeName || APP.userProfile?.username+'\'s Store';
        const storeColor = APP.userProfile?.storeColor || '#667eea';
        const storeUrl = `${APP.baseUrl}/store/${APP.userProfile.username}`;
        
        container.innerHTML = `
            <div style="padding:15px;">
                <div style="text-align:center;padding:20px;background:linear-gradient(135deg,${storeColor},${storeColor}dd);border-radius:12px;color:white;margin-bottom:15px;">
                    <h2>${storeName}</h2>
                    <p style="opacity:0.8;">${currentPlan.toUpperCase()} Plan</p>
                </div>
                
                <div style="display:flex;gap:10px;margin-bottom:15px;">
                    <button class="btn-gold" style="flex:1;" onclick="navigateTo('dropship-store')">🏪 My Store</button>
                    <button class="btn-outline" style="flex:1;" onclick="previewDropshipStore()">👁️ Preview</button>
                </div>
                
                <button class="btn-outline btn-full" style="margin-bottom:10px;" onclick="dropshipStoreSettings()">⚙️ Store Settings</button>
                
                ${APP.userProfile.isDropshipper ? `
                    <button class="btn-outline btn-full" style="margin-bottom:10px;" onclick="navigateTo('advertisers')">
                        🤝 Influencers Marketplace - $${APP.advertiserPrice}/mo
                    </button>
                ` : ''}
                
                <div style="background:white;padding:15px;border-radius:12px;margin-top:10px;">
                    <p><strong>Store URL:</strong></p>
                    <div style="font-family:monospace;font-size:13px;word-break:break-all;">${storeUrl}</div>
                    <button class="copy-btn" onclick="copyToClipboard('${storeUrl}')">📋 Copy</button>
                </div>
                
                <div style="background:#E8F5E9;padding:12px;border-radius:8px;margin-top:10px;">
                    <p style="font-size:13px;">✅ Active Plan: <strong>${currentPlan.toUpperCase()}</strong></p>
                    <button class="btn-small btn-outline" onclick="upgradeDropshipPlan()">Upgrade Plan</button>
                </div>
            </div>`;
    } else {
        // SHOW PLANS
        const plans = [
            { name: 'Starter', price: APP.dropshipStarter, products: 20, stores: 1, color: '#4CAF50' },
            { name: 'Growth', price: APP.dropshipGrowth, products: 100, stores: 1, color: '#2196F3' },
            { name: 'Professional', price: APP.dropshipPro, products: 500, stores: 3, color: '#9C27B0' },
            { name: 'Elite', price: APP.dropshipElite, products: 'Unlimited', stores: 'Unlimited', color: '#FF9800' }
        ];
        
        container.innerHTML = `
            <div style="padding:15px;">
                <h3>💰 Choose Your Plan</h3>
                <p style="color:#666;margin-bottom:15px;">Resell products without inventory</p>
                
                <div class="plan-cards">
                    ${plans.map(plan => `
                        <div class="plan-card" style="border-left:4px solid ${plan.color};">
                            <h4>${plan.name}</h4>
                            <div class="plan-price">$${plan.price}<span style="font-size:14px;">/mo</span></div>
                            <ul class="plan-features">
                                <li>📦 ${plan.products} Products</li>
                                <li>🏪 ${plan.stores} Store${plan.stores!==1?'s':''}</li>
                                <li>💰 Set your own prices</li>
                                <li>🔄 Auto order forwarding</li>
                            </ul>
                            <button class="btn-outline btn-full" onclick="subscribeDropship('${plan.name.toLowerCase()}',${plan.price})">Subscribe - $${plan.price}/mo</button>
                        </div>
                    `).join('')}
                </div>
            </div>`;
    }
}

function upgradeDropshipPlan() {
    const plans = [
        { name: 'Starter', price: APP.dropshipStarter, color: '#4CAF50' },
        { name: 'Growth', price: APP.dropshipGrowth, color: '#2196F3' },
        { name: 'Professional', price: APP.dropshipPro, color: '#9C27B0' },
        { name: 'Elite', price: APP.dropshipElite, color: '#FF9800' }
    ];
    
    const currentPlan = APP.userProfile.dropshipPlan || 'starter';
    
    showModal(`
        <div style="padding:10px;">
            <h3>⬆️ Upgrade Plan</h3>
            <p style="color:#666;">Current: <strong>${currentPlan.toUpperCase()}</strong></p>
            ${plans.filter(p => p.name.toLowerCase() !== currentPlan).map(plan => `
                <div class="plan-card" style="border-left:4px solid ${plan.color};margin:10px 0;">
                    <h4>${plan.name}</h4>
                    <div class="plan-price">$${plan.price}<span style="font-size:14px;">/mo</span></div>
                    <button class="btn-gold btn-full" onclick="subscribeDropship('${plan.name.toLowerCase()}',${plan.price});hideModal();">Upgrade - $${plan.price}/mo</button>
                </div>
            `).join('')}
        </div>
    `);
}

async function subscribeDropship(plan, price) {
    if((APP.userProfile?.walletBalance||0)<price){showToast(`Need $${price}`,'error');navigateTo('wallet');return;}
    showLoader();
    try {
        const d = new Date(Date.now()+30*24*60*60*1000);
        await db.collection('users').doc(APP.userProfile.uid).update({
            walletBalance:firebase.firestore.FieldValue.increment(-price),
            dropshipPlan:plan,isDropshipper:true,
            dropshipPlanExpiry:firebase.firestore.Timestamp.fromDate(d)
        });
        APP.userProfile.walletBalance-=price;
        APP.userProfile.dropshipPlan=plan;
        APP.userProfile.isDropshipper=true;
        APP.userProfile.dropshipPlanExpiry=d;
        await db.collection('transactions').add({userId:APP.userProfile.uid,type:'subscription',amount:price,currency:'USD',status:'completed',description:`Dropship ${plan}`,createdAt:firebase.firestore.FieldValue.serverTimestamp()});
        hideLoader();showToast(`Subscribed to ${plan}! 🎉`,'success');loadDropshipDashboard();
    } catch(e){hideLoader();showToast('Failed','error');}
}

// =====================
// STORE SETTINGS (Direct upload, no URLs)
// =====================
function dropshipStoreSettings() {
    const storeName = APP.userProfile?.storeName || APP.userProfile?.username+'\'s Store';
    const storeColor = APP.userProfile?.storeColor || '#667eea';
    const storeBio = APP.userProfile?.storeBio || '';
    const storeLogo = APP.userProfile?.storeLogo || '';
    const storeBanner = APP.userProfile?.storeBanner || '';
    
    showModal(`
        <div style="padding:10px;max-height:70vh;overflow-y:auto;">
            <h3>⚙️ Store Settings</h3>
            
            <div class="input-group" style="margin-top:15px;">
                <label>Store Name</label>
                <input type="text" id="settings-store-name" class="input-field" value="${storeName}">
            </div>
            
            <div class="input-group" style="margin-top:10px;">
                <label>Store Bio</label>
                <textarea id="settings-store-bio" class="input-field" rows="2">${storeBio}</textarea>
            </div>
            
            <div class="input-group" style="margin-top:10px;">
                <label>Store Theme Color</label>
                <input type="color" id="settings-store-color" class="input-field" value="${storeColor}" style="height:50px;padding:5px;">
                <small style="color:#666;">Light colors will use dark text automatically</small>
            </div>
            
            <div class="input-group" style="margin-top:10px;">
                <label>Store Logo (Upload)</label>
                ${storeLogo ? `<img src="${storeLogo}" style="width:60px;height:60px;border-radius:50%;margin-bottom:5px;display:block;">` : ''}
                <input type="file" id="settings-store-logo-upload" class="input-field" accept="image/*">
            </div>
            
            <div class="input-group" style="margin-top:10px;">
                <label>Store Banner (Upload)</label>
                ${storeBanner ? `<img src="${storeBanner}" style="width:100%;height:60px;object-fit:cover;border-radius:8px;margin-bottom:5px;display:block;">` : ''}
                <input type="file" id="settings-store-banner-upload" class="input-field" accept="image/*">
            </div>
            
            <div style="background:#f5f5f5;padding:15px;border-radius:8px;margin-top:15px;">
                <p style="font-weight:600;">Store URL:</p>
                <p style="font-family:monospace;font-size:13px;">${APP.baseUrl}/store/${APP.userProfile.username}</p>
            </div>
            
            <button class="btn-gold btn-full" style="margin-top:15px;" onclick="saveDropshipStoreSettings()">💾 Save Settings</button>
        </div>
    `);
}

async function saveDropshipStoreSettings() {
    const storeName = document.getElementById('settings-store-name')?.value?.trim();
    const storeBio = document.getElementById('settings-store-bio')?.value?.trim();
    const storeColor = document.getElementById('settings-store-color')?.value;
    
    if(!storeName){showToast('Enter store name','error');return;}
    
    hideModal(); showLoader();
    
    try {
        const updates = {
            storeName, storeBio, storeColor,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // Upload logo if selected
        const logoFile = document.getElementById('settings-store-logo-upload')?.files?.[0];
        if (logoFile) {
            try {
                updates.storeLogo = await uploadToCloudinary(logoFile);
            } catch(e) { console.warn('Logo upload failed:', e); }
        }
        
        // Upload banner if selected
        const bannerFile = document.getElementById('settings-store-banner-upload')?.files?.[0];
        if (bannerFile) {
            try {
                updates.storeBanner = await uploadToCloudinary(bannerFile);
            } catch(e) { console.warn('Banner upload failed:', e); }
        }
        
        await db.collection('users').doc(APP.userProfile.uid).update(updates);
        Object.assign(APP.userProfile, updates);
        hideLoader(); showToast('Store settings saved! ✅','success');
    } catch(e){hideLoader();showToast('Failed','error');}
}

// =====================
// PREVIEW STORE (Auto text color for light/dark backgrounds)
// =====================
async function previewDropshipStore() {
    const storeName = APP.userProfile?.storeName || APP.userProfile?.username+'\'s Store';
    const storeColor = APP.userProfile?.storeColor || '#667eea';
    const storeBio = APP.userProfile?.storeBio || 'Welcome to my store!';
    const storeLogo = APP.userProfile?.storeLogo || '';
    const storeBanner = APP.userProfile?.storeBanner || '';
    
    // Determine if color is light or dark for text color
    const isLightColor = isColorLight(storeColor);
    const textColor = isLightColor ? '#1a1a1a' : '#ffffff';
    const subtitleColor = isLightColor ? '#333333' : 'rgba(255,255,255,0.8)';
    
    showLoader();
    
    try {
        const snap = await db.collection('dropship_products')
            .where('dropshipperId','==',APP.userProfile.uid)
            .where('status','==','active')
            .get();
        
        const products = [];
        snap.forEach(doc => products.push({id:doc.id,...doc.data()}));
        
        hideLoader();
        
        showModal(`
            <div style="padding:10px;max-height:80vh;overflow-y:auto;">
                <div style="background:#1a1a2e;color:white;padding:8px 15px;border-radius:20px 20px 0 0;text-align:center;font-size:12px;">
                    📱 Customer Preview
                </div>
                
                <div style="border:2px solid #1a1a2e;border-top:none;border-radius:0 0 20px 20px;overflow:hidden;">
                    ${storeBanner ? `<img src="${storeBanner}" style="width:100%;height:120px;object-fit:cover;" onerror="this.style.display='none'">` : ''}
                    <div style="background:linear-gradient(135deg,${storeColor},${storeColor}dd);padding:20px;text-align:center;color:${textColor};">
                        ${storeLogo ? `<img src="${storeLogo}" style="width:60px;height:60px;border-radius:50%;border:3px solid ${textColor};margin-bottom:10px;" onerror="this.style.display='none'">` : ''}
                        <h2 style="margin:0;color:${textColor};">${storeName}</h2>
                        <p style="opacity:0.8;font-size:13px;margin:5px 0;color:${subtitleColor};">${storeBio}</p>
                        <p style="font-size:11px;opacity:0.6;color:${subtitleColor};">${products.length} Products</p>
                    </div>
                    
                    <div style="padding:10px;background:#f5f5f5;min-height:200px;">
                        ${products.length === 0 ? `
                            <div style="text-align:center;padding:40px;color:#999;">
                                <p style="font-size:40px;">📦</p><p>No products yet</p>
                            </div>
                        ` : `
                            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                                ${products.map(p => {
                                    const img = p.images?.[0]||'app-icon.png';
                                    return `
                                        <div style="background:white;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                                            <img src="${img}" style="width:100%;height:120px;object-fit:cover;" onerror="this.src='app-icon.png'">
                                            <div style="padding:8px;">
                                                <div style="font-weight:600;font-size:12px;">${p.name}</div>
                                                <div style="font-weight:700;font-size:14px;color:var(--gold-dark);">${formatCurrency(p.price)}</div>
                                                <button style="width:100%;padding:6px;background:#FFD700;color:#1a1a1a;border:none;border-radius:4px;font-size:10px;font-weight:700;margin-top:5px;">🛒 Add to Cart</button>
                                            </div>
                                        </div>`;
                                }).join('')}
                            </div>
                        `}
                    </div>
                    
                    <div style="background:white;padding:15px;text-align:center;border-top:1px solid #f0f0f0;">
                        <p style="font-size:11px;color:#999;">Powered by Shoplify</p>
                    </div>
                </div>
                
                <p style="text-align:center;margin-top:15px;font-size:13px;color:#666;">
                    This is how customers see your store
                </p>
                <button class="btn-gold btn-full" onclick="hideModal()">Close Preview</button>
            </div>
        `);
    } catch(e) { hideLoader(); showToast('Error','error'); }
}

// Helper: Check if color is light
function isColorLight(hex) {
    const color = hex.replace('#','');
    const r = parseInt(color.substring(0,2), 16);
    const g = parseInt(color.substring(2,4), 16);
    const b = parseInt(color.substring(4,6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 150;
}

// =====================
// STORE MANAGEMENT
// =====================
async function loadDropshipStore() {
    const container = document.getElementById('dropship-store-content');
    if (!container) return;
    
    const username = APP.userProfile?.username || '';
    const storeUrl = `${APP.baseUrl}/store/${username}`;
    const storeColor = APP.userProfile?.storeColor || '#667eea';
    const isLight = isColorLight(storeColor);
    const textColor = isLight ? '#1a1a1a' : '#ffffff';
    
    container.innerHTML = '<p style="text-align:center;padding:40px;">Loading store...</p>';
    
    try {
        const snap = await db.collection('dropship_products')
            .where('dropshipperId','==',APP.userProfile.uid)
            .where('status','==','active')
            .get();
        
        const products = [];
        snap.forEach(doc => products.push({id:doc.id,...doc.data()}));
        
        const totalProfit = products.reduce((sum,p) => sum + ((p.price||0)-(p.minPrice||0)), 0);
        
        container.innerHTML = `
            <div style="padding:15px;">
                <div style="text-align:center;padding:20px;background:linear-gradient(135deg,${storeColor},${storeColor}dd);border-radius:12px;color:${textColor};margin-bottom:15px;">
                    ${APP.userProfile.storeLogo?`<img src="${APP.userProfile.storeLogo}" style="width:50px;height:50px;border-radius:50%;border:2px solid ${textColor};margin-bottom:10px;">`:''}
                    <h2 style="color:${textColor};">${APP.userProfile.storeName||username+'\'s Store'}</h2>
                    <p style="opacity:0.8;color:${isLight?'#333':'rgba(255,255,255,0.8)'};">${APP.userProfile.storeBio||'Dropship Store'}</p>
                </div>
                
                <div style="display:flex;gap:10px;margin-bottom:15px;">
                    <div class="stat-card" style="flex:1;"><div class="stat-value">${products.length}</div><div class="stat-label">Products</div></div>
                    <div class="stat-card" style="flex:1;"><div class="stat-value">${formatCurrency(totalProfit)}</div><div class="stat-label">Potential Profit</div></div>
                </div>
                
                <div class="affiliate-link-box" style="margin-bottom:15px;">
                    <p style="font-size:12px;">Store URL:</p>
                    <div class="affiliate-link-display">${storeUrl}</div>
                    <button class="copy-btn" onclick="copyToClipboard('${storeUrl}')">📋 Copy</button>
                </div>
                
                <div style="display:flex;gap:10px;margin-bottom:15px;">
                    <button class="btn-outline" style="flex:1;" onclick="previewDropshipStore()">👁️ Preview</button>
                    <button class="btn-outline" style="flex:1;" onclick="dropshipStoreSettings()">⚙️ Settings</button>
                </div>
                
                <h4>My Products</h4>
                <div id="dropship-products">
                    ${products.length===0?'<p style="color:#999;text-align:center;padding:20px;">Import products from marketplace</p>':''}
                </div>
                
                <button class="btn-gold btn-full" style="margin-top:15px;" onclick="navigateTo('marketplace')">➕ Import Products</button>
            </div>`;
        
        if(products.length>0){
            const list = document.getElementById('dropship-products');
            products.forEach(p => {
                const profit = (p.price||0)-(p.minPrice||0);
                const link = p.storeLink || `${APP.baseUrl}/store/${username}/${p.originalProductId}`;
                list.innerHTML += `
                    <div style="display:flex;gap:10px;padding:12px;background:white;border-radius:12px;margin-bottom:8px;align-items:center;">
                        <img src="${p.images?.[0]||'app-icon.png'}" style="width:50px;height:50px;border-radius:8px;" onerror="this.src='app-icon.png'">
                        <div style="flex:1;">
                            <div style="font-weight:600;">${p.name}</div>
                            <div style="font-size:12px;color:#666;">Sell: ${formatCurrency(p.price)} | Cost: ${formatCurrency(p.minPrice)}</div>
                            <div style="font-size:12px;color:var(--green);">Profit: ${formatCurrency(profit)}</div>
                        </div>
                        <button class="copy-btn" onclick="copyToClipboard('${link}');showToast('Link copied!','success');">📋</button>
                    </div>`;
            });
        }
    } catch(e){
        container.innerHTML = '<p style="text-align:center;padding:40px;">Error loading store</p>';
    }
}

// =====================
// PUBLIC DROPSHIP STORE
// =====================
async function loadPublicDropshipStore(username) {
    const container = document.getElementById('dropship-store-content');
    if (!container) return;
    
    container.innerHTML = '<p style="text-align:center;padding:40px;">Loading store...</p>';
    
    try {
        const userSnap = await db.collection('users').where('username','==',username).limit(1).get();
        if(userSnap.empty){container.innerHTML='<p style="text-align:center;padding:40px;">Store not found</p>';return;}
        
        const dropshipper = userSnap.docs[0].data();
        const dropshipperId = userSnap.docs[0].id;
        
        const storeName = dropshipper.storeName || username+'\'s Store';
        const storeColor = dropshipper.storeColor || '#667eea';
        const storeBio = dropshipper.storeBio || 'Welcome!';
        const storeLogo = dropshipper.storeLogo || '';
        const storeBanner = dropshipper.storeBanner || '';
        
        const isLight = isColorLight(storeColor);
        const textColor = isLight ? '#1a1a1a' : '#ffffff';
        
        const snap = await db.collection('dropship_products')
            .where('dropshipperId','==',dropshipperId)
            .where('status','==','active')
            .get();
        
        const products = [];
        snap.forEach(doc => products.push({id:doc.id,...doc.data()}));
        
        container.innerHTML = `
            <div style="padding:0;">
                ${storeBanner ? `<img src="${storeBanner}" style="width:100%;height:120px;object-fit:cover;" onerror="this.style.display='none'">` : ''}
                <div style="background:linear-gradient(135deg,${storeColor},${storeColor}dd);padding:20px;text-align:center;color:${textColor};">
                    ${storeLogo ? `<img src="${storeLogo}" style="width:60px;height:60px;border-radius:50%;border:3px solid ${textColor};margin-bottom:10px;" onerror="this.style.display='none'">` : ''}
                    <h2 style="margin:0;color:${textColor};">${storeName}</h2>
                    <p style="font-size:13px;margin:5px 0;color:${isLight?'#333':'rgba(255,255,255,0.8)'};">${storeBio}</p>
                    <p style="font-size:11px;color:${isLight?'#555':'rgba(255,255,255,0.6)'};">${products.length} Products</p>
                </div>
                
                ${!APP.userProfile ? `<div style="text-align:center;padding:15px;background:#FFF8E1;margin:10px;border-radius:8px;"><p>Please login to purchase</p><button class="btn-gold" onclick="navigateTo('auth')">Login</button></div>` : ''}
                
                <div style="padding:10px;background:#f5f5f5;min-height:200px;">
                    ${products.length === 0 ? `<div style="text-align:center;padding:40px;color:#999;"><p style="font-size:40px;">📦</p><p>No products yet</p></div>` : `
                        <div class="products-grid-full">
                            ${products.map(p => {
                                const img = p.images?.[0]||'app-icon.png';
                                return `
                                    <div class="product-card" onclick="addStoreProductToCart('${p.id}','${p.name.replace(/'/g,"\\'")}','${p.price}','${p.minPrice}','${img}','${p.originalProductId}','${dropshipperId}')">
                                        <img src="${img}" class="product-card-image" onerror="this.src='app-icon.png'">
                                        <div class="product-card-info">
                                            <div class="product-card-name">${p.name}</div>
                                            <div class="product-card-price">${formatCurrency(p.price)}</div>
                                            <button class="btn-gold" style="width:100%;margin-top:6px;font-size:11px;padding:7px;" onclick="event.stopPropagation();addStoreProductToCart('${p.id}','${p.name.replace(/'/g,"\\'")}','${p.price}','${p.minPrice}','${img}','${p.originalProductId}','${dropshipperId}')">🛒 Add to Cart</button>
                                        </div>
                                    </div>`;
                            }).join('')}
                        </div>
                    `}
                </div>
                
                <div style="text-align:center;padding:15px;border-top:1px solid #f0f0f0;">
                    <p style="font-size:11px;color:#999;">Powered by Shoplify</p>
                </div>
            </div>`;
    } catch(e){
        container.innerHTML = '<p style="text-align:center;padding:40px;">Error loading store</p>';
    }
}

function addStoreProductToCart(productId, name, price, minPrice, image, originalProductId, dropshipperId) {
    if(!APP.userProfile){showToast('Please login','error');navigateTo('auth');return;}
    
    let cart = JSON.parse(sessionStorage.getItem('shoplify_cart')||'[]');
    cart.push({
        productId: originalProductId,
        dropshipProductId: productId,
        dropshipperId: dropshipperId,
        name, price: parseFloat(price), minPrice: parseFloat(minPrice),
        image, color: null, size: null, quantity: 1,
        merchantId: dropshipperId,
        isDropship: true,
        isDigital: false,
        discountCode: null,
        freeShipping: false
    });
    sessionStorage.setItem('shoplify_cart',JSON.stringify(cart));
    if(typeof updateCartBadge==='function') updateCartBadge();
    showToast('Added to cart! 🛒','success');
}