// dropship.js - COMPLETE FINAL VERSION (Customer View, No Auth Required for Browsing, Full Checkout Flow)

// =====================
// DROPSHIP DASHBOARD (Owner)
// =====================
async function loadDropshipDashboard() {
    console.log('📦 Loading dropship dashboard...');
    
    const container = document.getElementById('dropship-content');
    if (!container || !APP.userProfile) return;
    
    const currentPlan = APP.userProfile.dropshipPlan || 'none';
    const isSubscribed = APP.userProfile.isDropshipper && currentPlan !== 'none';
    
    if (isSubscribed) {
        const storeName = APP.userProfile?.storeName || APP.userProfile?.username + '\'s Store';
        const storeColor = APP.userProfile?.storeColor || '#667eea';
        const storeUrl = `${APP.baseUrl}/store/${APP.userProfile.username}`;
        const isLight = isColorLight(storeColor);
        const textColor = isLight ? '#1a1a1a' : '#ffffff';
        
        container.innerHTML = `
            <div style="padding:15px;">
                <div style="text-align:center;padding:20px;background:linear-gradient(135deg,${storeColor},${storeColor}dd);border-radius:12px;color:${textColor};margin-bottom:15px;">
                    ${APP.userProfile.storeLogo ? `<img src="${APP.userProfile.storeLogo}" style="width:50px;height:50px;border-radius:50%;border:2px solid ${textColor};margin-bottom:10px;" onerror="this.style.display='none'">` : ''}
                    <h2 style="color:${textColor};">${storeName}</h2>
                    <p style="opacity:0.8;color:${isLight?'#333':'rgba(255,255,255,0.8)'};">${currentPlan.toUpperCase()} Plan</p>
                </div>
                
                <div class="affiliate-stats" style="margin-bottom:15px;">
                    <div class="stat-card" onclick="navigateTo('dropship-store')" style="cursor:pointer;"><div class="stat-value" id="dropship-product-count">-</div><div class="stat-label">Products</div></div>
                    <div class="stat-card"><div class="stat-value" id="dropship-total-profit">$0</div><div class="stat-label">Potential Profit</div></div>
                </div>
                
                <div style="display:flex;gap:10px;margin-bottom:10px;">
                    <button class="btn-gold" style="flex:1;" onclick="navigateTo('dropship-store')">🏪 My Store</button>
                    <button class="btn-outline" style="flex:1;" onclick="previewDropshipStore()">👁️ Preview</button>
                </div>
                <button class="btn-outline btn-full" style="margin-bottom:10px;" onclick="dropshipStoreSettings()">⚙️ Store Settings</button>
                <button class="btn-outline btn-full" style="margin-bottom:10px;" onclick="navigateTo('recruit-affiliates')">📢 Recruit Affiliates</button>
                <button class="btn-outline btn-full" style="margin-bottom:10px;" onclick="navigateTo('advertisers')">🤝 Influencers</button>
                
                <div style="background:white;padding:15px;border-radius:12px;margin-top:10px;">
                    <p style="font-weight:600;font-size:13px;">🔗 Store URL:</p>
                    <div style="font-family:monospace;font-size:12px;word-break:break-all;background:#f5f5f5;padding:8px;border-radius:4px;margin:5px 0;">${storeUrl}</div>
                    <button class="copy-btn" onclick="copyToClipboard('${storeUrl}');showToast('Link copied!','success');">📋 Copy</button>
                </div>
                
                <div style="background:#E8F5E9;padding:12px;border-radius:8px;margin-top:10px;">
                    <p style="font-size:13px;">✅ Active: <strong>${currentPlan.toUpperCase()}</strong></p>
                    <button class="btn-small btn-outline" onclick="upgradeDropshipPlan()">⬆️ Upgrade</button>
                </div>
            </div>`;
        
        loadDropshipStats();
    } else {
        const plans = [
            { name: 'Starter', price: APP.dropshipStarter, products: 20, stores: 1, color: '#4CAF50' },
            { name: 'Growth', price: APP.dropshipGrowth, products: 100, stores: 1, color: '#2196F3' },
            { name: 'Professional', price: APP.dropshipPro, products: 500, stores: 3, color: '#9C27B0' },
            { name: 'Elite', price: APP.dropshipElite, products: 'Unlimited', stores: 'Unlimited', color: '#FF9800' }
        ];
        
        container.innerHTML = `
            <div style="padding:15px;"><h3>💰 Choose Your Plan</h3><p style="color:#666;margin-bottom:15px;">Resell products without inventory</p>
            <div class="plan-cards">${plans.map(plan => `
                <div class="plan-card" style="border-left:4px solid ${plan.color};"><h4>${plan.name}</h4><div class="plan-price">$${plan.price}<span style="font-size:14px;">/mo</span></div>
                <ul class="plan-features"><li>📦 ${plan.products} Products</li><li>🏪 ${plan.stores} Store${plan.stores!==1?'s':''}</li><li>💰 Set your prices</li><li>🔄 Auto forwarding</li></ul>
                <button class="btn-outline btn-full" onclick="subscribeDropship('${plan.name.toLowerCase()}',${plan.price})">Subscribe - $${plan.price}/mo</button></div>`).join('')}</div></div>`;
    }
}

async function loadDropshipStats() {
    try {
        const snap = await db.collection('dropship_products').where('dropshipperId','==',APP.userProfile.uid).where('status','==','active').get();
        const products = []; snap.forEach(doc => products.push(doc.data()));
        const totalProfit = products.reduce((sum,p) => sum + ((p.price||0)-(p.minPrice||0)), 0);
        document.getElementById('dropship-product-count') && (document.getElementById('dropship-product-count').textContent = products.length);
        document.getElementById('dropship-total-profit') && (document.getElementById('dropship-total-profit').textContent = formatCurrency(totalProfit));
    } catch(e) {}
}

function upgradeDropshipPlan() {
    const plans = [{ name:'Starter',price:APP.dropshipStarter,color:'#4CAF50'},{ name:'Growth',price:APP.dropshipGrowth,color:'#2196F3'},{ name:'Professional',price:APP.dropshipPro,color:'#9C27B0'},{ name:'Elite',price:APP.dropshipElite,color:'#FF9800'}];
    const current = APP.userProfile.dropshipPlan||'starter';
    showModal(`<div style="padding:10px;"><h3>⬆️ Upgrade</h3><p>Current: ${current.toUpperCase()}</p>${plans.filter(p=>p.name.toLowerCase()!==current).map(p=>`<div class="plan-card" style="border-left:4px solid ${p.color};margin:10px 0;"><h4>${p.name}</h4><div class="plan-price">$${p.price}/mo</div><button class="btn-gold btn-full" onclick="subscribeDropship('${p.name.toLowerCase()}',${p.price});hideModal();">Upgrade</button></div>`).join('')}</div>`);
}

async function subscribeDropship(plan, price) {
    if((APP.userProfile?.walletBalance||0)<price){showToast(`Need $${price}`,'error');navigateTo('wallet');return;}
    showLoader();
    try {
        const d = new Date(Date.now()+30*24*60*60*1000);
        await db.collection('users').doc(APP.userProfile.uid).update({walletBalance:firebase.firestore.FieldValue.increment(-price),dropshipPlan:plan,isDropshipper:true,dropshipPlanExpiry:firebase.firestore.Timestamp.fromDate(d)});
        APP.userProfile.walletBalance-=price; APP.userProfile.dropshipPlan=plan; APP.userProfile.isDropshipper=true; APP.userProfile.dropshipPlanExpiry=d;
        await db.collection('transactions').add({userId:APP.userProfile.uid,type:'subscription',amount:price,currency:'USD',status:'completed',description:`Dropship ${plan}`,createdAt:firebase.firestore.FieldValue.serverTimestamp()});
        hideLoader(); showToast(`Subscribed! 🎉`,'success'); loadDropshipDashboard();
    } catch(e){hideLoader();showToast('Failed','error');}
}

// =====================
// STORE SETTINGS
// =====================
function dropshipStoreSettings() {
    const storeName = APP.userProfile?.storeName || APP.userProfile?.username+'\'s Store';
    const storeColor = APP.userProfile?.storeColor || '#667eea';
    const storeBio = APP.userProfile?.storeBio || '';
    
    // Get shipping countries
    const shippingRates = APP.userProfile?.shippingRates || {};
    const excludedStates = APP.userProfile?.excludedStates || {};
    
    showModal(`
        <div style="padding:10px;max-height:70vh;overflow-y:auto;">
            <h3>⚙️ Store Settings</h3>
            <div class="input-group" style="margin-top:15px;"><label>Store Name</label><input type="text" id="settings-store-name" class="input-field" value="${storeName}"></div>
            <div class="input-group" style="margin-top:10px;"><label>Store Bio</label><textarea id="settings-store-bio" class="input-field" rows="2">${storeBio}</textarea></div>
            <div class="input-group" style="margin-top:10px;"><label>Theme Color</label><input type="color" id="settings-store-color" class="input-field" value="${storeColor}" style="height:50px;padding:5px;"><small>Light colors use dark text</small></div>
            <div class="input-group" style="margin-top:10px;"><label>Store Logo (Upload)</label>${APP.userProfile.storeLogo?`<img src="${APP.userProfile.storeLogo}" style="width:60px;height:60px;border-radius:50%;margin:5px 0;">`:''}<input type="file" id="settings-store-logo-upload" class="input-field" accept="image/*"></div>
            <div class="input-group" style="margin-top:10px;"><label>Store Banner (Upload)</label>${APP.userProfile.storeBanner?`<img src="${APP.userProfile.storeBanner}" style="width:100%;height:60px;object-fit:cover;border-radius:8px;margin:5px 0;">`:''}<input type="file" id="settings-store-banner-upload" class="input-field" accept="image/*"></div>
            
            <h4 style="margin-top:15px;">🌍 Shipping Countries & Rates</h4>
            <div id="shipping-countries-list" style="margin-top:10px;">
                ${Object.keys(shippingRates).length===0?'<p style="color:#999;font-size:13px;">No countries added</p>':Object.entries(shippingRates).map(([country,rate])=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:#f5f5f5;border-radius:8px;margin-bottom:6px;font-size:13px;"><span>${COUNTRIES?.[country]?.flag||''} ${COUNTRIES?.[country]?.name||country}</span><span>$${rate} <button onclick="removeShippingCountry('${country}')" style="background:none;border:none;color:red;cursor:pointer;">✕</button></span></div>`).join('')}
            </div>
            <button class="btn-outline btn-full" style="margin-top:8px;" onclick="addShippingCountry()">➕ Add Country</button>
            
            <h4 style="margin-top:15px;">🚫 Excluded States (per country)</h4>
            <div id="excluded-states-list" style="margin-top:10px;">
                ${Object.keys(excludedStates).length===0?'<p style="color:#999;font-size:13px;">No states excluded</p>':Object.entries(excludedStates).map(([country,states])=>`<div style="padding:8px 12px;background:#FFF3E0;border-radius:8px;margin-bottom:6px;font-size:13px;"><span>${COUNTRIES?.[country]?.flag||''} ${COUNTRIES?.[country]?.name||country}: ${states.join(', ')}</span> <button onclick="removeExcludedState('${country}')" style="background:none;border:none;color:red;cursor:pointer;">✕</button></div>`).join('')}
            </div>
            <button class="btn-outline btn-full" style="margin-top:8px;" onclick="addExcludedState()">➕ Exclude State</button>
            
            <button class="btn-gold btn-full" style="margin-top:15px;" onclick="saveDropshipStoreSettings()">💾 Save</button>
        </div>`);
}

async function saveDropshipStoreSettings() {
    const storeName = document.getElementById('settings-store-name')?.value?.trim();
    const storeBio = document.getElementById('settings-store-bio')?.value?.trim();
    const storeColor = document.getElementById('settings-store-color')?.value;
    if(!storeName){showToast('Enter store name','error');return;}
    hideModal(); showLoader();
    try {
        const updates = {storeName,storeBio,storeColor,updatedAt:firebase.firestore.FieldValue.serverTimestamp()};
        const logoFile = document.getElementById('settings-store-logo-upload')?.files?.[0];
        if(logoFile){try{updates.storeLogo = await uploadToCloudinary(logoFile);}catch(e){}}
        const bannerFile = document.getElementById('settings-store-banner-upload')?.files?.[0];
        if(bannerFile){try{updates.storeBanner = await uploadToCloudinary(bannerFile);}catch(e){}}
        await db.collection('users').doc(APP.userProfile.uid).update(updates);
        Object.assign(APP.userProfile, updates);
        hideLoader(); showToast('Saved! ✅','success');
    } catch(e){hideLoader();showToast('Failed','error');}
}

function addShippingCountry() {
    showModal(`<h3>🌍 Add Country</h3><div class="input-group"><label>Country</label><select id="new-shipping-country" class="input-field">${typeof COUNTRIES!=='undefined'?Object.entries(COUNTRIES).sort((a,b)=>a[1].name.localeCompare(b[1].name)).map(([c,d])=>`<option value="${c}">${d.flag||''} ${d.name}</option>`).join(''):''}</select></div><div class="input-group"><label>Rate (USD)</label><input type="number" id="new-shipping-rate" class="input-field" placeholder="0.00" step="0.01" min="0"></div><button class="btn-gold btn-full" onclick="saveShippingCountry()">Add</button>`);
}

async function saveShippingCountry() {
    const c = document.getElementById('new-shipping-country')?.value;
    const r = parseFloat(document.getElementById('new-shipping-rate')?.value)||0;
    if(!c) return;
    const rates = APP.userProfile?.shippingRates || {};
    rates[c] = r;
    await db.collection('users').doc(APP.userProfile.uid).update({shippingRates:rates});
    APP.userProfile.shippingRates = rates;
    hideModal(); dropshipStoreSettings(); showToast('Added!','success');
}

async function removeShippingCountry(country) {
    const rates = APP.userProfile?.shippingRates || {};
    delete rates[country];
    await db.collection('users').doc(APP.userProfile.uid).update({shippingRates:rates});
    APP.userProfile.shippingRates = rates;
    dropshipStoreSettings();
}

function addExcludedState() {
    const countries = APP.userProfile?.shippingRates || {};
    showModal(`<h3>🚫 Exclude State</h3><div class="input-group"><label>Country</label><select id="exclude-country" class="input-field">${Object.keys(countries).map(c=>`<option value="${c}">${COUNTRIES?.[c]?.flag||''} ${COUNTRIES?.[c]?.name||c}</option>`).join('')}</select></div><div class="input-group"><label>States (comma separated)</label><input type="text" id="exclude-states" class="input-field" placeholder="California, Texas"></div><button class="btn-gold btn-full" onclick="saveExcludedState()">Save</button>`);
}

async function saveExcludedState() {
    const country = document.getElementById('exclude-country')?.value;
    const states = document.getElementById('exclude-states')?.value?.split(',').map(s=>s.trim()).filter(Boolean);
    if(!country||states.length===0){showToast('Fill fields','error');return;}
    const excluded = APP.userProfile?.excludedStates || {};
    excluded[country] = [...new Set([...(excluded[country]||[]),...states])];
    await db.collection('users').doc(APP.userProfile.uid).update({excludedStates:excluded});
    APP.userProfile.excludedStates = excluded;
    hideModal(); dropshipStoreSettings(); showToast('Saved!','success');
}

async function removeExcludedState(country) {
    const excluded = APP.userProfile?.excludedStates || {};
    delete excluded[country];
    await db.collection('users').doc(APP.userProfile.uid).update({excludedStates:excluded});
    APP.userProfile.excludedStates = excluded;
    dropshipStoreSettings();
}

// =====================
// PREVIEW STORE
// =====================
async function previewDropshipStore() {
    const storeName = APP.userProfile?.storeName || APP.userProfile?.username+'\'s Store';
    const storeColor = APP.userProfile?.storeColor || '#667eea';
    const storeBio = APP.userProfile?.storeBio || 'Welcome!';
    const isLight = isColorLight(storeColor);
    const textColor = isLight?'#1a1a1a':'#ffffff';
    const subColor = isLight?'#333':'rgba(255,255,255,0.8)';
    showLoader();
    try {
        const snap = await db.collection('dropship_products').where('dropshipperId','==',APP.userProfile.uid).where('status','==','active').get();
        const products = []; snap.forEach(doc=>products.push({id:doc.id,...doc.data()}));
        hideLoader();
        showModal(`<div style="padding:10px;max-height:80vh;overflow-y:auto;"><div style="background:#1a1a2e;color:white;padding:8px 15px;border-radius:20px 20px 0 0;text-align:center;font-size:12px;">📱 Customer Preview</div><div style="border:2px solid #1a1a2e;border-top:none;border-radius:0 0 20px 20px;overflow:hidden;">${APP.userProfile.storeBanner?`<img src="${APP.userProfile.storeBanner}" style="width:100%;height:120px;object-fit:cover;">`:''}<div style="background:linear-gradient(135deg,${storeColor},${storeColor}dd);padding:20px;text-align:center;">${APP.userProfile.storeLogo?`<img src="${APP.userProfile.storeLogo}" style="width:60px;height:60px;border-radius:50%;border:3px solid ${textColor};margin-bottom:10px;">`:''}<h2 style="margin:0;color:${textColor};">${storeName}</h2><p style="font-size:13px;margin:5px 0;color:${subColor};">${storeBio}</p><p style="font-size:11px;color:${subColor};">${products.length} Products</p></div><div style="padding:10px;background:#f5f5f5;min-height:200px;">${products.length===0?`<div style="text-align:center;padding:40px;color:#999;"><p style="font-size:40px;">📦</p><p>No products</p></div>`:`<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">${products.map(p=>{const img=p.images?.[0]||'/app-icon.png';return`<div style="background:white;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);"><img src="${img}" style="width:100%;height:120px;object-fit:cover;" onerror="this.src='/app-icon.png'"><div style="padding:8px;"><div style="font-weight:600;font-size:12px;">${p.name}</div><div style="font-weight:700;font-size:14px;color:var(--gold-dark);">${formatCurrency(p.price)}</div><div style="font-size:10px;color:var(--green);">Profit: ${formatCurrency((p.price||0)-(p.minPrice||0))}</div><button style="width:100%;padding:6px;background:#FFD700;color:#1a1a1a;border:none;border-radius:4px;font-size:10px;font-weight:700;margin-top:5px;">🛒 Add to Cart</button></div></div>`}).join('')}</div>`}</div><div style="background:white;padding:15px;text-align:center;border-top:1px solid #f0f0f0;"><p style="font-size:11px;color:#999;">Powered by ONESHOPLIFY</p></div></div><button class="btn-gold btn-full" style="margin-top:10px;" onclick="hideModal()">Close</button></div>`);
    } catch(e){hideLoader();showToast('Error','error');}
}

// =====================
// OWNER STORE VIEW
// =====================
async function loadDropshipStore(data) {
    const container = document.getElementById('dropship-store-content');
    if(!container) return;
    if(data&&data.isPublic&&data.username){await loadPublicDropshipStore(data.username);return;}
    if(!APP.userProfile){container.innerHTML='<p style="text-align:center;padding:40px;">Login required</p>';return;}
    const username = APP.userProfile?.username||'';
    const storeUrl = `${APP.baseUrl}/store/${username}`;
    const storeColor = APP.userProfile?.storeColor||'#667eea';
    const isLight = isColorLight(storeColor);
    const textColor = isLight?'#1a1a1a':'#ffffff';
    container.innerHTML='<p style="text-align:center;padding:40px;">Loading...</p>';
    try {
        const snap = await db.collection('dropship_products').where('dropshipperId','==',APP.userProfile.uid).where('status','==','active').get();
        const products = []; snap.forEach(doc=>products.push({id:doc.id,...doc.data()}));
        const totalProfit = products.reduce((sum,p)=>sum+((p.price||0)-(p.minPrice||0)),0);
        container.innerHTML=`<div style="padding:15px;"><div style="text-align:center;padding:20px;background:linear-gradient(135deg,${storeColor},${storeColor}dd);border-radius:12px;color:${textColor};margin-bottom:15px;">${APP.userProfile.storeLogo?`<img src="${APP.userProfile.storeLogo}" style="width:50px;height:50px;border-radius:50%;border:2px solid ${textColor};margin-bottom:10px;">`:''}<h2 style="color:${textColor};">${APP.userProfile.storeName||username+'\'s Store'}</h2><p style="opacity:0.8;">${APP.userProfile.storeBio||'Dropship Store'}</p></div><div style="display:flex;gap:10px;margin-bottom:15px;"><div class="stat-card" style="flex:1;"><div class="stat-value">${products.length}</div><div class="stat-label">Products</div></div><div class="stat-card" style="flex:1;"><div class="stat-value">${formatCurrency(totalProfit)}</div><div class="stat-label">Potential Profit</div></div></div><div class="affiliate-link-box" style="margin-bottom:15px;"><p>Store URL:</p><div class="affiliate-link-display">${storeUrl}</div><button class="copy-btn" onclick="copyToClipboard('${storeUrl}')">📋 Copy</button></div><div style="display:flex;gap:10px;margin-bottom:15px;"><button class="btn-outline" style="flex:1;" onclick="previewDropshipStore()">👁️ Preview</button><button class="btn-outline" style="flex:1;" onclick="dropshipStoreSettings()">⚙️ Settings</button></div><h4>My Products</h4><div id="dropship-products">${products.length===0?'<p style="color:#999;text-align:center;padding:20px;">Import from marketplace</p>':''}</div><button class="btn-gold btn-full" style="margin-top:15px;" onclick="navigateTo('marketplace')">➕ Import Products</button></div>`;
        if(products.length>0){const list=document.getElementById('dropship-products');products.forEach(p=>{const profit=(p.price||0)-(p.minPrice||0);const link=p.storeLink||`${APP.baseUrl}/store/${username}/${p.originalProductId}`;list.innerHTML+=`<div style="display:flex;gap:10px;padding:12px;background:white;border-radius:12px;margin-bottom:8px;align-items:center;box-shadow:var(--shadow);"><img src="${p.images?.[0]||'/app-icon.png'}" style="width:50px;height:50px;border-radius:8px;object-fit:cover;" onerror="this.src='/app-icon.png'"><div style="flex:1;"><div style="font-weight:600;">${p.name}</div><div style="font-size:12px;color:#666;">Sell: ${formatCurrency(p.price)} | Cost: ${formatCurrency(p.minPrice)}</div><div style="font-size:12px;color:var(--green);">Profit: ${formatCurrency(profit)}</div></div><button class="copy-btn" onclick="copyToClipboard('${link}');showToast('Link copied!','success');">📋</button></div>`})}}
    } catch(e){container.innerHTML='<p style="text-align:center;padding:40px;">Error</p>';}
}

// =====================
// PUBLIC DROPSHIP STORE (CUSTOMER VIEW - NO AUTH REQUIRED)
// =====================
async function loadPublicDropshipStore(username) {
    const container = document.getElementById('dropship-store-content');
    if(!container) return;
    
    console.log('🏪 Loading public store:', username);
    container.innerHTML = '<p style="text-align:center;padding:40px;">Loading store...</p>';
    
    try {
        const userSnap = await db.collection('users').where('username','==',username).limit(1).get();
        if(userSnap.empty){container.innerHTML='<p style="text-align:center;padding:40px;">Store not found</p>';return;}
        
        const dropshipper = userSnap.docs[0].data();
        const dropshipperId = userSnap.docs[0].id;
        
        const storeName = dropshipper.storeName || username+'\'s Store';
        const storeColor = dropshipper.storeColor || '#667eea';
        const storeBio = dropshipper.storeBio || 'Welcome to my store!';
        const storeLogo = dropshipper.storeLogo || '';
        const storeBanner = dropshipper.storeBanner || '';
        const isVerified = dropshipper.isAppVerified || dropshipper.isVerifiedAffiliate || false;
        const shippingRates = dropshipper.shippingRates || {};
        const excludedStates = dropshipper.excludedStates || {};
        
        const isLight = isColorLight(storeColor);
        const textColor = isLight ? '#1a1a1a' : '#ffffff';
        const subColor = isLight ? '#333333' : 'rgba(255,255,255,0.8)';
        
        // Get products
        const snap = await db.collection('dropship_products')
            .where('dropshipperId','==',dropshipperId)
            .where('status','==','active')
            .get();
        
        const products = [];
        snap.forEach(doc => products.push({id:doc.id,...doc.data()}));
        
        // Get original product reviews
        const productIds = products.map(p => p.originalProductId).filter(Boolean);
        
        container.innerHTML = `
            <div style="padding:0;background:#f5f5f5;min-height:100vh;">
                <!-- Store Header -->
                ${storeBanner ? `<img src="${storeBanner}" style="width:100%;height:120px;object-fit:cover;" onerror="this.style.display='none'">` : ''}
                
                <div style="background:linear-gradient(135deg,${storeColor},${storeColor}dd);padding:20px;text-align:center;">
                    ${storeLogo ? `<img src="${storeLogo}" style="width:60px;height:60px;border-radius:50%;border:3px solid ${textColor};margin-bottom:10px;" onerror="this.style.display='none'">` : ''}
                    <h2 style="margin:0;color:${textColor};">${storeName}</h2>
                    ${isVerified ? '<span style="background:#20D5EC;color:white;padding:2px 10px;border-radius:10px;font-size:10px;margin-top:5px;display:inline-block;">✓ Verified Store</span>' : ''}
                    <p style="font-size:13px;margin:5px 0;color:${subColor};">${storeBio}</p>
                    <p style="font-size:11px;color:${subColor};">${products.length} Products | Ships to ${Object.keys(shippingRates).length} countries</p>
                </div>
                
                <!-- Cart & Orders Buttons -->
                <div style="display:flex;gap:8px;padding:10px 15px;background:white;border-bottom:1px solid #f0f0f0;position:sticky;top:0;z-index:10;">
                    <button class="btn-gold" style="flex:1;position:relative;" onclick="navigateTo('checkout')">
                        🛒 Cart <span id="public-cart-count" style="background:#FF4444;color:white;padding:2px 8px;border-radius:10px;font-size:11px;margin-left:5px;">0</span>
                    </button>
                    ${APP.userProfile ? `<button class="btn-outline" style="flex:1;" onclick="navigateTo('orders')">📦 Orders</button>` : ''}
                </div>
                
                <!-- Products Grid -->
                <div style="padding:10px;">
                    ${products.length === 0 ? `
                        <div style="text-align:center;padding:40px;color:#999;background:white;border-radius:12px;">
                            <p style="font-size:40px;">📦</p>
                            <p>No products available yet</p>
                        </div>
                    ` : `
                        <div class="products-grid-full">
                            ${products.map(p => {
                                const img = p.images?.[0] || '/app-icon.png';
                                const discount = p.discountCode ? `<span class="discount-badge">-${p.discountCode.value}${p.discountCode.type==='percentage'?'%':'$'}</span>` : '';
                                const inStock = p.stock > 0 ? `${p.stock} in stock` : 'In stock';
                                return `
                                    <div class="product-card" onclick="viewPublicProductDetail('${p.originalProductId}','${dropshipperId}','${p.id}','${p.name.replace(/'/g,"\\'")}','${p.price}','${p.minPrice}','${img}')">
                                        <div style="position:relative;">
                                            <img src="${img}" class="product-card-image" onerror="this.src='/app-icon.png'" loading="lazy">
                                            ${p.discountCode ? '<span style="position:absolute;top:5px;left:5px;background:#FF4444;color:white;padding:2px 6px;border-radius:4px;font-size:9px;">SALE</span>' : ''}
                                        </div>
                                        <div class="product-card-info">
                                            <div class="product-card-name">${p.name}</div>
                                            <div class="product-card-price">${formatCurrency(p.price)} ${discount}</div>
                                            <div style="font-size:10px;color:#666;">${inStock}</div>
                                            <div class="product-card-rating">⭐ ${p.avgRating?.toFixed(1)||'0.0'} (${p.reviewCount||0})</div>
                                            <button class="btn-gold" style="width:100%;margin-top:6px;font-size:11px;padding:7px;" 
                                                    onclick="event.stopPropagation();addPublicStoreToCart('${p.id}','${p.name.replace(/'/g,"\\'")}','${p.price}','${p.minPrice}','${img}','${p.originalProductId}','${dropshipperId}')">
                                                🛒 Add to Cart
                                            </button>
                                        </div>
                                    </div>`;
                            }).join('')}
                        </div>
                    `}
                </div>
                
                <!-- Shipping Info -->
                <div style="padding:15px;background:white;margin:10px;border-radius:12px;">
                    <h4>🚚 Shipping Information</h4>
                    <p style="font-size:12px;color:#666;">Available shipping countries:</p>
                    <div style="display:flex;flex-wrap:wrap;gap:5px;margin-top:5px;">
                        ${Object.keys(shippingRates).length === 0 ? '<span style="color:#999;font-size:12px;">Contact store for shipping</span>' : 
                            Object.entries(shippingRates).slice(0,10).map(([c,r]) => `<span style="background:#f0f0f0;padding:4px 8px;border-radius:12px;font-size:11px;">${COUNTRIES?.[c]?.flag||''} ${COUNTRIES?.[c]?.name||c}: $${r}</span>`).join('')}
                        ${Object.keys(shippingRates).length > 10 ? `<span style="font-size:11px;color:#999;">+${Object.keys(shippingRates).length-10} more</span>` : ''}
                    </div>
                </div>
                
                <!-- Footer -->
                <div style="text-align:center;padding:15px;">
                    <p style="font-size:11px;color:#999;">Powered by ONESHOPLIFY</p>
                </div>
            </div>`;
        
        // Update cart count
        updatePublicCartCount();
        
    } catch(e) {
        console.error('Public store error:', e);
        container.innerHTML = '<p style="text-align:center;padding:40px;">Error loading store</p>';
    }
}

// =====================
// VIEW PRODUCT DETAIL (Public)
// =====================
async function viewPublicProductDetail(originalProductId, dropshipperId, dropshipProductId, name, price, minPrice, image) {
    showLoader();
    try {
        // Get original product details
        const doc = await db.collection('products').doc(originalProductId).get();
        if(!doc.exists){hideLoader();showToast('Product not found','error');return;}
        const product = doc.data();
        
        // Get reviews
        const reviewsSnap = await db.collection('reviews').where('productId','==',originalProductId).get();
        const reviews = []; reviewsSnap.forEach(d=>reviews.push(d.data()));
        reviews.sort((a,b)=>(b.createdAt?.toDate?.()||0)-(a.createdAt?.toDate?.()||0));
        
        hideLoader();
        
        const discountedPrice = product.discountCode ? applyDiscount(product.price, product.discountCode) : product.price;
        const discount = product.discountCode ? `<span class="discount-badge">-${product.discountCode.value}${product.discountCode.type==='percentage'?'%':'$'}</span>` : '';
        
        showModal(`
            <div style="padding:10px;max-height:80vh;overflow-y:auto;">
                <img src="${image}" style="width:100%;max-height:300px;object-fit:cover;border-radius:12px;margin-bottom:10px;" onerror="this.src='/app-icon.png'">
                
                <h2>${product.name}</h2>
                <div style="font-size:20px;font-weight:800;color:var(--gold-dark);">${formatCurrency(price)} ${discount}</div>
                ${product.discountCode ? `<div style="font-size:12px;color:#999;text-decoration:line-through;">Original: ${formatCurrency(product.price)}</div>` : ''}
                
                <div style="margin:10px 0;font-size:13px;color:#666;">
                    <span>📦 ${product.totalSales||0} sold</span>
                    <span style="margin-left:15px;">⭐ ${product.avgRating?.toFixed(1)||'0.0'} (${product.reviewCount||0} reviews)</span>
                </div>
                
                ${product.colors?.length ? `<div style="margin:10px 0;"><strong>Colors:</strong> ${product.colors.join(', ')}</div>` : ''}
                ${product.sizes?.length ? `<div style="margin:10px 0;"><strong>Sizes:</strong> ${product.sizes.join(', ')}</div>` : ''}
                
                <p style="color:#666;line-height:1.6;margin:10px 0;">${product.description||'No description'}</p>
                
                <button class="btn-gold btn-full" onclick="addPublicStoreToCart('${dropshipProductId}','${name.replace(/'/g,"\\'")}','${price}','${minPrice}','${image}','${originalProductId}','${dropshipperId}');hideModal();">🛒 Add to Cart - ${formatCurrency(price)}</button>
                
                ${reviews.length > 0 ? `
                    <h4 style="margin-top:15px;">📝 Reviews (${reviews.length})</h4>
                    ${reviews.slice(0,5).map(r=>`<div style="padding:10px;background:#fafafa;border-radius:8px;margin-bottom:5px;"><div style="display:flex;justify-content:space-between;"><strong>${r.userName||'Customer'}</strong><span>${'★'.repeat(r.rating||5)}</span></div><p style="font-size:12px;color:#666;">${r.comment||''}</p></div>`).join('')}
                ` : ''}
            </div>
        `);
    } catch(e){hideLoader();showToast('Error','error');}
}

// =====================
// ADD TO CART (Public Store)
// =====================
function addPublicStoreToCart(productId, name, price, minPrice, image, originalProductId, dropshipperId) {
    let cart = JSON.parse(sessionStorage.getItem('shoplify_cart') || '[]');
    
    const existingIndex = cart.findIndex(item => item.dropshipProductId === productId);
    
    if(existingIndex >= 0){
        cart[existingIndex].quantity += 1;
    } else {
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
    }
    
    sessionStorage.setItem('shoplify_cart', JSON.stringify(cart));
    updatePublicCartCount();
    if(typeof updateCartBadge==='function') updateCartBadge();
    showToast('Added to cart! 🛒','success');
}

function updatePublicCartCount() {
    const cart = JSON.parse(sessionStorage.getItem('shoplify_cart') || '[]');
    const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const badge = document.getElementById('public-cart-count');
    if(badge) badge.textContent = count;
}

// =====================
// CHECKOUT FLOW (Google Auth → Deposit → Auto-pay)
// =====================
async function checkoutPublicStore() {
    if(!APP.userProfile){
        // Need to authenticate first
        showModal(`
            <div style="padding:10px;text-align:center;">
                <h3>🔐 Login to Continue</h3>
                <p style="color:#666;margin:15px 0;">Please authenticate to complete your purchase</p>
                <button class="btn-google" onclick="signInWithGoogleForCheckout()" style="width:100%;padding:12px;border:2px solid #e0e0e0;border-radius:8px;background:white;font-size:16px;cursor:pointer;">
                    <span style="font-weight:800;color:#4285F4;">G</span> Continue with Google
                </button>
                <p style="font-size:12px;color:#999;margin-top:10px;">We'll save your profile automatically</p>
            </div>
        `);
        return;
    }
    
    // User is authenticated - proceed to checkout
    navigateTo('checkout');
}

async function signInWithGoogleForCheckout() {
    hideModal();
    showLoader();
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({prompt:'select_account'});
        const result = await auth.signInWithPopup(provider);
        const user = result.user;
        
        // Check if user exists
        const userDoc = await db.collection('users').doc(user.uid).get();
        if(!userDoc.exists){
            // Auto-create account
            const username = (user.email?.split('@')[0] || 'user') + Math.random().toString(36).substr(2,4);
            await db.collection('users').doc(user.uid).set({
                uid:user.uid,email:user.email,displayName:user.displayName,photoURL:user.photoURL,
                username,password:'google',phoneNumber:'',country:'US',countryFlag:'🇺🇸',currency:'USD',
                accountType:'customer',walletBalance:0,isAffiliate:false,isMerchant:false,isDropshipper:false,
                createdAt:firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        
        APP.currentUser = user;
        APP.userProfile = (await db.collection('users').doc(user.uid).get()).data();
        APP.userProfile.uid = user.uid;
        
        localStorage.setItem('shoplify_auth','true');
        localStorage.setItem('shoplify_uid',user.uid);
        
        hideLoader();
        
        // Check if user has enough balance
        const cart = JSON.parse(sessionStorage.getItem('shoplify_cart')||'[]');
        const total = cart.reduce((sum,item)=>sum+(item.price*item.quantity),0);
        
        if((APP.userProfile.walletBalance||0) < total){
            showModal(`
                <div style="padding:10px;text-align:center;">
                    <h3>💰 Deposit Required</h3>
                    <p style="color:#666;margin:15px 0;">You need <strong>${formatCurrency(total)}</strong> to complete this purchase</p>
                    <p style="color:#666;">Current balance: <strong>${formatCurrency(APP.userProfile.walletBalance||0)}</strong></p>
                    <button class="btn-gold btn-full" onclick="hideModal();navigateTo('wallet');">💳 Deposit Now</button>
                </div>
            `);
        } else {
            showModal(`
                <div style="padding:10px;text-align:center;">
                    <h3>🛒 Continue to Purchase?</h3>
                    <p style="color:#666;margin:15px 0;">Your cart total: <strong>${formatCurrency(total)}</strong></p>
                    <button class="btn-gold btn-full" onclick="hideModal();navigateTo('checkout');">✅ Yes, Checkout</button>
                    <button class="btn-outline btn-full" style="margin-top:8px;" onclick="hideModal();">Not Now</button>
                </div>
            `);
        }
        
    } catch(e){hideLoader();showToast('Authentication failed','error');}
}

// =====================
// RECRUIT AFFILIATES
// =====================
function loadRecruitAffiliates() {
    const container = document.getElementById('recruit-affiliates-content');
    if(!container) return;
    if(!APP.userProfile?.isDropshipper){container.innerHTML='<p style="text-align:center;padding:40px;">Need dropship plan</p>';return;}
    container.innerHTML='<p style="text-align:center;padding:40px;">Loading verified affiliates...</p>';
    Promise.all([db.collection('dropship_products').where('dropshipperId','==',APP.userProfile.uid).where('status','==','active').get(),db.collection('users').get()]).then(([pSnap,uSnap])=>{
        const myProducts=[];pSnap.forEach(d=>{const p=d.data();myProducts.push({id:p.originalProductId,...p});});
        const allUsers=[];uSnap.forEach(d=>allUsers.push({id:d.id,...d.data()}));
        const verifiedAffiliates=allUsers.filter(u=>u.isAffiliate&&u.isVerifiedAffiliate);
        if(myProducts.length===0){container.innerHTML='<p style="text-align:center;padding:40px;">Import products first</p>';return;}
        if(verifiedAffiliates.length===0){container.innerHTML='<p style="text-align:center;padding:40px;">No verified affiliates</p>';return;}
        container.innerHTML=`<div style="padding:15px;"><h3>📢 Recruit Affiliates</h3><p style="color:#666;margin-bottom:15px;">Select product and affiliates</p><div class="input-group" style="margin-bottom:15px;"><label>Select Product</label><select id="recruit-product" class="input-field">${myProducts.map(p=>`<option value="${p.originalProductId}">${p.name} - ${formatCurrency(p.price)}</option>`).join('')}</select></div><div class="input-group" style="margin-bottom:15px;"><label>Commission (4-10%)</label><input type="number" id="recruit-commission" class="input-field" value="5" min="4" max="10"></div><h4>Verified Affiliates (${verifiedAffiliates.length})</h4><div id="affiliates-list" style="max-height:300px;overflow-y:auto;">${verifiedAffiliates.map(a=>`<div style="display:flex;align-items:center;gap:10px;padding:10px;border-bottom:1px solid #f0f0f0;"><input type="checkbox" id="aff-${a.id}" value="${a.id}" style="width:18px;height:18px;"><img src="${a.photoURL||'/app-icon.png'}" style="width:40px;height:40px;border-radius:50%;"><div style="flex:1;"><div style="font-weight:600;">${a.displayName||a.username}</div><div style="font-size:11px;color:#666;">${a.totalSales||0} sales</div></div>${a.isAppVerified?'<span style="color:#20D5EC;">✓</span>':''}</div>`).join('')}</div><button class="btn-gold btn-full" style="margin-top:15px;" onclick="sendRecruitRequests()">📤 Send Requests</button></div>`;
        window._recruitProductId=myProducts[0]?.originalProductId;window._recruitProduct=myProducts[0];
    });
}

async function sendRecruitRequests() {
    const productId=window._recruitProductId;
    const commission=parseInt(document.getElementById('recruit-commission')?.value)||5;
    const selectedAffiliates=[];
    document.querySelectorAll('#affiliates-list input:checked').forEach(cb=>selectedAffiliates.push(cb.value));
    if(!productId||selectedAffiliates.length===0){showToast('Select product and affiliates','error');return;}
    showLoader();
    try {
        const productDoc=await db.collection('products').doc(productId).get();
        const product=productDoc.data();
        for(const aid of selectedAffiliates){
            await db.collection('recruit_requests').add({dropshipperId:APP.userProfile.uid,dropshipperName:APP.userProfile.displayName||APP.userProfile.username,affiliateId:aid,productId,productName:product?.name||'Product',productPrice:product?.price||0,productImage:(product?.images&&product.images[0])||'',commission,status:'pending',createdAt:firebase.firestore.FieldValue.serverTimestamp()});
            await createNotification(aid,'📢 Recruitment!',`${APP.userProfile.displayName||APP.userProfile.username} wants you to promote "${product?.name||'a product'}" at ${commission}%`,'📢','notifications');
        }
        hideLoader();showToast(`Sent to ${selectedAffiliates.length} affiliate(s)!`,'success');navigateTo('dropship');
    } catch(e){hideLoader();showToast('Failed','error');}
}

// =====================
// HELPER FUNCTIONS
// =====================
function isColorLight(hex) {
    if(!hex) return false;
    const color = hex.replace('#','');
    const r=parseInt(color.substring(0,2),16),g=parseInt(color.substring(2,4),16),b=parseInt(color.substring(4,6),16);
    return (r*299+g*587+b*114)/1000 > 150;
}

function applyDiscount(price, discount) {
    if(!discount||!discount.value) return parseFloat(price);
    if(discount.type==='percentage') return parseFloat(price)-(parseFloat(price)*parseFloat(discount.value)/100);
    return Math.max(0,parseFloat(price)-parseFloat(discount.value));
}

console.log('✅ dropship.js loaded - ONESHOPLIFY Dropship System Ready');
