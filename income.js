// income.js - COMPLETE FINAL VERSION (Affiliate, Merchant, Dropship, Store Owner, Influencer, Analytics, Leaderboard, Hall of Fame, Tickets, Sponsorship)
console.log('✅ income.js loaded - ONESHOPLIFY Premium');

// =====================
// AFFILIATE DASHBOARD
// =====================
async function loadAffiliateDashboard() {
    console.log('📢 Loading affiliate dashboard...');
    if (!APP.userProfile?.isAffiliate) { showToast('Need affiliate subscription','error'); navigateTo('profile'); return; }
    const container = document.getElementById('affiliate-content');
    if (!container) return;
    container.innerHTML = '<p style="text-align:center;padding:40px;">Loading...</p>';
    try {
        const snap = await db.collection('affiliate_products').where('affiliateId','==',APP.userProfile.uid).get();
        let tc=0,tv=0,tm=0; const p=[];
        snap.forEach(d=>{const dd=d.data();tc+=dd.clicks||0;tv+=dd.conversions||0;tm+=dd.totalCommission||0;p.push({id:d.id,...dd});});
        const cr=tc>0?((tv/tc)*100).toFixed(1):'0.0';
        container.innerHTML = `
            <div style="padding:15px;">
                <div class="affiliate-stats">
                    <div class="stat-card"><div class="stat-value">${tc.toLocaleString()}</div><div class="stat-label">Clicks</div></div>
                    <div class="stat-card"><div class="stat-value">${tv}</div><div class="stat-label">Conversions</div></div>
                    <div class="stat-card"><div class="stat-value">${cr}%</div><div class="stat-label">Rate</div></div>
                    <div class="stat-card"><div class="stat-value">${formatCurrency(tm)}</div><div class="stat-label">Earned</div></div>
                </div>
                <div class="affiliate-link-box"><h4>🔗 Your Link</h4><div class="affiliate-link-display">${APP.baseUrl}/r/${APP.userProfile.uid}</div><button class="copy-btn" onclick="copyToClipboard('${APP.baseUrl}/r/${APP.userProfile.uid}')">📋 Copy</button></div>
                <div style="display:flex;gap:10px;margin:15px 0;"><button class="btn-gold" style="flex:1;" onclick="navigateTo('affiliate-install')">📢 Install</button><button class="btn-outline" style="flex:1;" onclick="navigateTo('advertisers')">🤝 Influencers</button></div>
                <button class="btn-outline btn-full" onclick="navigateTo('analytics')">📊 Analytics</button>
                <h4 style="margin-top:15px;">📦 Installed (${p.length})</h4>
                <div id="installed-list">${p.length===0?'<p style="color:#999;padding:20px;">None</p>':''}</div>
            </div>`;
        if(p.length>0){const l=document.getElementById('installed-list');p.forEach(pr=>{l.innerHTML+=`<div style="display:flex;gap:12px;padding:12px;background:white;border-radius:12px;margin-bottom:8px;align-items:center;box-shadow:var(--shadow);"><img src="${pr.productImage||'/app-icon.png'}" style="width:50px;height:50px;border-radius:8px;"><div style="flex:1;"><div style="font-weight:600;">${pr.productName}</div><div style="font-size:12px;color:#666;">👆${pr.clicks||0} | 💰${formatCurrency(pr.totalCommission||0)}</div></div><button class="copy-btn" onclick="copyToClipboard('${pr.affiliateLink}')">📋</button></div>`;});}
    } catch(e) { container.innerHTML = '<p style="text-align:center;padding:40px;">Error</p>'; }
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
        const allP = await db.collection('products').get(); const mp=[]; allP.forEach(d=>{const p=d.data();if(p.merchantId===APP.userProfile.uid)mp.push({id:d.id,...p});});
        const allO = await db.collection('orders').get(); let tr=0,to=0,po=0; allO.forEach(d=>{const o=d.data();if(o.merchantId===APP.userProfile.uid){tr+=o.total||0;to++;if(o.status==='pending'||o.status==='processing')po++;}});
        container.innerHTML = `
            <div style="padding:15px;">
                <div style="text-align:center;padding:20px;background:white;border-radius:12px;margin-bottom:15px;box-shadow:var(--shadow);">
                    <div style="width:100%;height:80px;background:linear-gradient(135deg,#FFD700,#FFA000);border-radius:12px;display:flex;align-items:center;justify-content:center;color:white;font-size:22px;font-weight:700;">${APP.userProfile.storeName||'Your Store'}</div>
                    <h3 style="margin-top:12px;">${APP.userProfile.storeName||'Unnamed'}</h3>
                    <button class="btn-outline" onclick="navigateTo('store-setup')">⚙️ Settings</button>
                </div>
                <div class="affiliate-stats">
                    <div class="stat-card"><div class="stat-value">${mp.length}</div><div class="stat-label">Products</div></div>
                    <div class="stat-card"><div class="stat-value">${to}</div><div class="stat-label">Orders</div></div>
                    <div class="stat-card"><div class="stat-value">${po}</div><div class="stat-label">Pending</div></div>
                    <div class="stat-card"><div class="stat-value">${formatCurrency(tr)}</div><div class="stat-label">Revenue</div></div>
                </div>
                <div style="display:flex;gap:10px;margin:15px 0;"><button class="btn-gold" style="flex:1;" onclick="navigateTo('add-product')">➕ Add</button><button class="btn-outline" style="flex:1;" onclick="navigateTo('analytics')">📊 Analytics</button></div>
                <h4>📦 My Products</h4>
                <div id="merchant-list">${mp.length===0?'<p style="color:#999;padding:20px;">None</p>':''}</div>
            </div>`;
        if(mp.length>0){const l=document.getElementById('merchant-list');mp.forEach(p=>{const hc=(p.totalSales||0)>50?'health-good':(p.totalSales||0)>10?'health-warning':'health-poor';const img=(p.images&&p.images[0])||'/app-icon.png';l.innerHTML+=`<div class="merchant-product-item"><img src="${img}" onerror="this.src='/app-icon.png'"><div style="flex:1;"><div style="font-weight:600;">${p.name}</div><div style="font-size:13px;">${formatCurrency(p.price)} | Stock:${p.stock||0}</div><div><span class="product-health ${hc}"></span> ${p.totalSales||0} sales ${p.sponsored?'⭐':''}</div></div><div><button class="btn-small btn-outline" onclick="toggleProductStatus('${p.id}','${p.status||'active'}')">${p.status==='active'?'Disable':'Enable'}</button>${(p.totalSales||0)>=APP.sponsorMinSales?`<button class="btn-small btn-gold" onclick="sponsorProduct('${p.id}')">⭐ Sponsor</button>`:''}</div></div>`;});}
    } catch(e) { container.innerHTML = '<p style="text-align:center;padding:40px;">Error</p>'; }
}

async function toggleProductStatus(pid,cs){const ns=cs==='active'?'disabled':'active';try{await db.collection('products').doc(pid).update({status:ns});showToast(`Product ${ns==='active'?'enabled':'disabled'}`,'success');loadMerchantDashboard();}catch(e){showToast('Failed','error');}}

function sponsorProduct(pid){if((APP.userProfile.walletBalance||0)<APP.sponsorshipFee){showToast(`Need $${APP.sponsorshipFee}`,'error');navigateTo('wallet');return;}showModal(`<h3>⭐ Sponsor</h3><p>$${APP.sponsorshipFee}/mo</p><button class="btn-gold btn-full" onclick="confirmSponsorship('${pid}')">Sponsor</button>`);}
async function confirmSponsorship(pid){hideModal();try{await db.collection('users').doc(APP.userProfile.uid).update({walletBalance:firebase.firestore.FieldValue.increment(-APP.sponsorshipFee)});await db.collection('products').doc(pid).update({sponsored:true,sponsoredUntil:firebase.firestore.Timestamp.fromDate(new Date(Date.now()+30*24*60*60*1000))});APP.userProfile.walletBalance-=APP.sponsorshipFee;await db.collection('transactions').add({userId:APP.userProfile.uid,type:'sponsorship',amount:APP.sponsorshipFee,currency:'USD',status:'completed',createdAt:firebase.firestore.FieldValue.serverTimestamp()});showToast('Sponsored!⭐','success');loadMerchantDashboard();}catch(e){showToast('Failed','error');}}

// =====================
// STORE OWNER DASHBOARD (NEW)
// =====================
async function loadStoreOwnerDashboard() {
    console.log('🏬 Loading store owner dashboard...');
    if (!APP.userProfile?.isStoreOwner) { showToast('You need a store subscription','error'); navigateTo('profile'); return; }
    const container = document.getElementById('store-owner-content');
    if (!container) return;
    container.innerHTML = '<p style="text-align:center;padding:40px;">Loading store...</p>';
    
    try {
        const storeDoc = await db.collection('stores').doc(APP.userProfile.uid).get();
        const store = storeDoc.exists ? storeDoc.data() : null;
        const productsSnap = await db.collection('store_products').where('storeId','==',APP.userProfile.uid).get();
        const storeProducts = []; productsSnap.forEach(d => storeProducts.push({id:d.id,...d.data()}));
        const ordersSnap = await db.collection('orders').where('merchantId','==',APP.userProfile.uid).get();
        let totalRevenue=0, totalOrders=0;
        ordersSnap.forEach(d => { const o=d.data(); totalRevenue+=o.total||0; totalOrders++; });
        
        const storeUrl = store?.storeUrl || `${APP.baseUrl}/store/${APP.userProfile.username}`;
        const expiry = APP.userProfile.storeOwnerExpiry;
        const daysLeft = expiry ? Math.ceil((expiry.toDate() - new Date())/(1000*60*60*24)) : 0;
        
        container.innerHTML = `
            <div style="padding:15px;">
                <div style="text-align:center;padding:25px;background:linear-gradient(135deg,#667eea,#764ba2);border-radius:16px;color:white;margin-bottom:15px;">
                    ${store?.logo ? `<img src="${store.logo}" style="width:60px;height:60px;border-radius:50%;border:3px solid white;margin-bottom:10px;">` : ''}
                    <h2>${store?.storeName || 'My Store'}</h2>
                    <p style="opacity:0.8;">${store?.storeType==='organization'?'Organization':'Individual'} Store</p>
                    <p style="font-size:12px;opacity:0.7;">${daysLeft} days remaining</p>
                </div>
                
                <div class="affiliate-stats">
                    <div class="stat-card"><div class="stat-value">${storeProducts.length}</div><div class="stat-label">Products</div></div>
                    <div class="stat-card"><div class="stat-value">${totalOrders}</div><div class="stat-label">Orders</div></div>
                    <div class="stat-card"><div class="stat-value">${formatCurrency(totalRevenue)}</div><div class="stat-label">Revenue</div></div>
                    <div class="stat-card"><div class="stat-value">${store?.category||'N/A'}</div><div class="stat-label">Category</div></div>
                </div>
                
                <div style="display:flex;gap:8px;margin-bottom:8px;">
                    <button class="btn-gold" style="flex:1;padding:12px;" onclick="addStoreProduct()">➕ Add Product</button>
                    <button class="btn-outline" style="flex:1;padding:12px;" onclick="addTicketProduct()">🎫 Add Ticket/Event</button>
                </div>
                
                <button class="btn-outline btn-full" style="margin-bottom:8px;padding:12px;" onclick="sponsorStoreProduct()">⭐ Sponsor Product ($10/mo)</button>
                <button class="btn-outline btn-full" style="margin-bottom:8px;padding:12px;" onclick="addStoreDiscount()">🎫 Add Discount Code</button>
                <button class="btn-outline btn-full" style="margin-bottom:8px;padding:12px;" onclick="navigateTo('advertisers')">🤝 Contract Influencers</button>
                
                <div style="background:white;padding:15px;border-radius:12px;margin-bottom:10px;">
                    <p style="font-weight:600;">🔗 Store URL:</p>
                    <div style="font-family:monospace;font-size:12px;background:#f5f5f5;padding:8px;border-radius:6px;word-break:break-all;">${storeUrl}</div>
                    <button class="copy-btn" onclick="copyToClipboard('${storeUrl}')">📋 Copy</button>
                </div>
                
                <h4>📦 My Products (${storeProducts.length})</h4>
                <div id="store-products-list">
                    ${storeProducts.length===0 ? '<p style="color:#999;padding:20px;text-align:center;">No products yet</p>' : ''}
                </div>
            </div>`;
        
        if (storeProducts.length > 0) {
            const list = document.getElementById('store-products-list');
            storeProducts.forEach(p => {
                const isTicket = p.isTicket || false;
                list.innerHTML += `
                    <div style="display:flex;gap:10px;padding:12px;background:white;border-radius:12px;margin-bottom:8px;align-items:center;box-shadow:var(--shadow);">
                        <img src="${p.images?.[0]||'/app-icon.png'}" style="width:50px;height:50px;border-radius:8px;object-fit:cover;" onerror="this.src='/app-icon.png'">
                        <div style="flex:1;">
                            <div style="font-weight:600;">${p.name} ${isTicket?'<span style="background:#7C3AED;color:white;padding:2px 6px;border-radius:8px;font-size:9px;">TICKET</span>':''}</div>
                            <div style="font-size:12px;color:#666;">${formatCurrency(p.price)} | ${isTicket ? p.ticketQuantity+' tickets' : 'Stock: '+(p.stock||0)}</div>
                            ${p.sponsored ? '<span style="color:#FFD700;">⭐ Sponsored</span>' : ''}
                        </div>
                        <button class="btn-small btn-outline" onclick="editStoreProduct('${p.id}')">✏️</button>
                    </div>`;
            });
        }
    } catch(e) { container.innerHTML = '<p style="text-align:center;padding:40px;">Error loading store</p>'; }
}

// =====================
// ADD TICKET/EVENT PRODUCT
// =====================
function addTicketProduct() {
    showModal(`
        <div style="padding:10px;max-height:75vh;overflow-y:auto;">
            <h3>🎫 Add Ticket/Event</h3>
            
            <div class="input-group"><label>Event Name *</label><input type="text" id="ticket-name" class="input-field" placeholder="Event name"></div>
            <div class="input-group"><label>Description</label><textarea id="ticket-description" class="input-field" rows="2"></textarea></div>
            <div class="input-group"><label>Event Date *</label><input type="date" id="ticket-date" class="input-field"></div>
            <div class="input-group"><label>Event Time *</label><input type="time" id="ticket-time" class="input-field"></div>
            <div class="input-group"><label>Country *</label><select id="ticket-country" class="input-field">${typeof COUNTRIES!=='undefined'?Object.entries(COUNTRIES).sort((a,b)=>a[1].name.localeCompare(b[1].name)).map(([c,d])=>`<option value="${c}">${d.flag||''} ${d.name}</option>`).join(''):''}</select></div>
            <div class="input-group"><label>Full Address *</label><input type="text" id="ticket-address" class="input-field" placeholder="Venue address"></div>
            <div class="input-group"><label>Total Tickets Available *</label><input type="number" id="ticket-quantity" class="input-field" placeholder="100" min="1"></div>
            <div class="input-group"><label>Visibility</label><select id="ticket-visibility" class="input-field"><option value="all">Visible to Everyone</option><option value="special">Special Event (Link Only)</option></select></div>
            <div class="input-group"><label>Gender Restriction</label><select id="ticket-gender" class="input-field"><option value="all">All Genders</option><option value="male">Male Only</option><option value="female">Female Only</option></select></div>
            
            <div class="input-group"><label>Preservation Options (comma separated)</label><input type="text" id="ticket-preservations" class="input-field" placeholder="Table for 2, Table for 4, VIP, General"></div>
            
            <div class="input-group"><label>Vary Price by Preservation?</label><select id="ticket-vary-price" class="input-field" onchange="toggleTicketPriceVariation()"><option value="no">No - Same Price</option><option value="yes">Yes - Different Prices</option></select></div>
            
            <div id="ticket-single-price"><div class="input-group"><label>Price (USD) *</label><input type="number" id="ticket-price" class="input-field" placeholder="50" step="0.01" min="0.01"></div></div>
            
            <div id="ticket-varied-prices" style="display:none;"><p style="font-size:12px;color:#666;">Enter prices after adding preservations</p></div>
            
            <div class="input-group"><label>Ticket Image (Upload)</label><input type="file" id="ticket-image" class="input-field" accept="image/*"></div>
            
            <div class="input-group"><label>Ticket Delivery Method</label><select id="ticket-delivery" class="input-field"><option value="app">App Generated</option><option value="owner">Store Owner (WhatsApp)</option></select></div>
            
            <div id="ticket-whatsapp-group" style="display:none;"><div class="input-group"><label>WhatsApp Number for Delivery</label><input type="tel" id="ticket-whatsapp" class="input-field" placeholder="+1234567890"></div></div>
            
            <button class="btn-gold btn-full" style="margin-top:15px;" onclick="saveTicketProduct()">🎫 Create Ticket</button>
        </div>
    `);
    
    document.getElementById('ticket-delivery').addEventListener('change', function(){
        document.getElementById('ticket-whatsapp-group').style.display = this.value === 'owner' ? 'block' : 'none';
    });
}

function toggleTicketPriceVariation() {
    const vary = document.getElementById('ticket-vary-price')?.value;
    document.getElementById('ticket-single-price').style.display = vary === 'yes' ? 'none' : 'block';
    document.getElementById('ticket-varied-prices').style.display = vary === 'yes' ? 'block' : 'none';
}

async function saveTicketProduct() {
    const name = document.getElementById('ticket-name')?.value?.trim();
    const description = document.getElementById('ticket-description')?.value?.trim();
    const date = document.getElementById('ticket-date')?.value;
    const time = document.getElementById('ticket-time')?.value;
    const country = document.getElementById('ticket-country')?.value;
    const address = document.getElementById('ticket-address')?.value?.trim();
    const quantity = parseInt(document.getElementById('ticket-quantity')?.value) || 0;
    const visibility = document.getElementById('ticket-visibility')?.value;
    const gender = document.getElementById('ticket-gender')?.value;
    const preservations = document.getElementById('ticket-preservations')?.value?.split(',').map(s=>s.trim()).filter(Boolean) || [];
    const varyPrice = document.getElementById('ticket-vary-price')?.value;
    const price = parseFloat(document.getElementById('ticket-price')?.value) || 0;
    const delivery = document.getElementById('ticket-delivery')?.value;
    const whatsapp = document.getElementById('ticket-whatsapp')?.value?.trim();
    
    if (!name || !date || !time || !country || !address || !quantity) {
        showToast('Fill all required fields', 'error'); return;
    }
    
    hideModal(); showLoader();
    
    try {
        const imageFile = document.getElementById('ticket-image')?.files?.[0];
        let imageUrl = '';
        if (imageFile) { try { imageUrl = await uploadToCloudinary(imageFile); } catch(e) {} }
        
        // Generate ticket IDs
        const ticketIds = [];
        for (let i = 0; i < quantity; i++) {
            ticketIds.push({
                id: 'TKT-' + Date.now().toString(36).toUpperCase() + '-' + (i+1).toString().padStart(3,'0'),
                used: false,
                usedBy: null,
                usedAt: null
            });
        }
        
        const eventDateTime = new Date(date + 'T' + time);
        const expirationDate = new Date(eventDateTime.getTime() + 4 * 60 * 60 * 1000); // 4 hours after event
        
        const productData = {
            storeId: APP.userProfile.uid,
            name, description, isTicket: true,
            eventDate: firebase.firestore.Timestamp.fromDate(eventDateTime),
            eventTime: time,
            expirationDate: firebase.firestore.Timestamp.fromDate(expirationDate),
            country, address, ticketQuantity: quantity,
            ticketsRemaining: quantity,
            visibility, gender,
            preservations, varyPrice: varyPrice === 'yes',
            price: varyPrice === 'yes' ? 0 : price,
            delivery, whatsappNumber: whatsapp || '',
            images: imageUrl ? [imageUrl] : ['/app-icon.png'],
            ticketIds,
            status: 'active',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection('store_products').add(productData);
        hideLoader(); showToast('Ticket created! 🎫', 'success');
        if (typeof loadStoreOwnerDashboard === 'function') loadStoreOwnerDashboard();
    } catch(e) { hideLoader(); showToast('Failed', 'error'); }
}

// =====================
// ADD STORE PRODUCT
// =====================
function addStoreProduct() {
    showModal(`
        <div style="padding:10px;max-height:75vh;overflow-y:auto;">
            <h3>➕ Add Product</h3>
            <div class="input-group"><label>Name *</label><input type="text" id="sp-name" class="input-field"></div>
            <div class="input-group"><label>Price (USD) *</label><input type="number" id="sp-price" class="input-field" step="0.01"></div>
            <div class="input-group"><label>Stock</label><input type="number" id="sp-stock" class="input-field" min="0"></div>
            <div class="input-group"><label>Description</label><textarea id="sp-desc" class="input-field" rows="2"></textarea></div>
            <div class="input-group"><label>Colors</label><input type="text" id="sp-colors" class="input-field" placeholder="Black,White"></div>
            <div class="input-group"><label>Sizes</label><input type="text" id="sp-sizes" class="input-field" placeholder="S,M,L"></div>
            <div class="input-group"><label>Images (Upload)</label><input type="file" id="sp-images" class="input-field" multiple accept="image/*"></div>
            <button class="btn-gold btn-full" style="margin-top:15px;" onclick="saveStoreProduct()">💾 Save Product</button>
        </div>`);
}

async function saveStoreProduct() {
    const name=document.getElementById('sp-name')?.value?.trim();
    const price=parseFloat(document.getElementById('sp-price')?.value)||0;
    const stock=parseInt(document.getElementById('sp-stock')?.value)||0;
    const desc=document.getElementById('sp-desc')?.value?.trim();
    const colors=document.getElementById('sp-colors')?.value?.split(',').map(s=>s.trim()).filter(Boolean)||[];
    const sizes=document.getElementById('sp-sizes')?.value?.split(',').map(s=>s.trim()).filter(Boolean)||[];
    if(!name||!price){showToast('Name and price required','error');return;}
    hideModal();showLoader();
    try{
        const files=document.getElementById('sp-images')?.files;let imgs=[];
        if(files){for(const f of Array.from(files).slice(0,5)){try{imgs.push(await uploadToCloudinary(f));}catch(e){}}}
        await db.collection('store_products').add({storeId:APP.userProfile.uid,name,price,stock,description:desc,colors,sizes,images:imgs.length>0?imgs:['/app-icon.png'],isTicket:false,status:'active',createdAt:firebase.firestore.FieldValue.serverTimestamp()});
        hideLoader();showToast('Product added!✅','success');loadStoreOwnerDashboard();
    }catch(e){hideLoader();showToast('Failed','error');}
}

// =====================
// SPONSOR STORE PRODUCT
// =====================
async function sponsorStoreProduct() {
    const snap = await db.collection('store_products').where('storeId','==',APP.userProfile.uid).where('status','==','active').get();
    const products = []; snap.forEach(d => products.push({id:d.id,...d.data()}));
    if (products.length===0) { showToast('Add products first','error'); return; }
    if ((APP.userProfile.walletBalance||0) < 10) { showToast('Need $10 for sponsorship','error'); navigateTo('wallet'); return; }
    
    showModal(`
        <div style="padding:10px;"><h3>⭐ Sponsor Product</h3><p style="color:#666;">$10/month - Appears on homepage</p>
        <div class="input-group"><label>Select Product</label><select id="sponsor-product" class="input-field">${products.map(p=>`<option value="${p.id}">${p.name} - ${formatCurrency(p.price)}</option>`).join('')}</select></div>
        <button class="btn-gold btn-full" onclick="confirmStoreSponsorship()">💳 Pay $10 & Sponsor</button></div>`);
}

async function confirmStoreSponsorship() {
    const pid = document.getElementById('sponsor-product')?.value;
    if (!pid) return;
    hideModal(); showLoader();
    try {
        await db.collection('users').doc(APP.userProfile.uid).update({walletBalance:firebase.firestore.FieldValue.increment(-10)});
        APP.userProfile.walletBalance -= 10;
        await db.collection('store_products').doc(pid).update({sponsored:true,sponsoredUntil:firebase.firestore.Timestamp.fromDate(new Date(Date.now()+30*24*60*60*1000))});
        // Also add to main products for homepage display
        const sp = await db.collection('store_products').doc(pid).get();
        if (sp.exists) {
            const d = sp.data();
            await db.collection('products').add({name:d.name,price:d.price,images:d.images,sponsored:true,sponsoredUntil:firebase.firestore.Timestamp.fromDate(new Date(Date.now()+30*24*60*60*1000)),merchantId:APP.userProfile.uid,merchantName:APP.userProfile.storeName||APP.userProfile.username,status:'active',category:'All Purpose',totalSales:0,avgRating:0,reviewCount:0,createdAt:firebase.firestore.FieldValue.serverTimestamp()});
        }
        await db.collection('transactions').add({userId:APP.userProfile.uid,type:'sponsorship',amount:10,currency:'USD',status:'completed',createdAt:firebase.firestore.FieldValue.serverTimestamp()});
        hideLoader(); showToast('Sponsored!⭐','success'); loadStoreOwnerDashboard();
    } catch(e) { hideLoader(); showToast('Failed','error'); }
}

// =====================
// ADD STORE DISCOUNT
// =====================
function addStoreDiscount() {
    showModal(`
        <div style="padding:10px;"><h3>🎫 Add Discount Code</h3>
        <div class="input-group"><label>Code</label><input type="text" id="disc-code" class="input-field" placeholder="SAVE20"></div>
        <div class="input-group"><label>Value</label><div style="display:flex;gap:8px;"><input type="number" id="disc-value" class="input-field" placeholder="20" style="flex:2;"><select id="disc-type" class="input-field" style="flex:1;"><option value="percentage">%</option><option value="fixed">$</option></select></div></div>
        <div class="input-group"><label>Duration (Days)</label><input type="number" id="disc-duration" class="input-field" value="30" min="1"></div>
        <p style="font-size:11px;color:#f44;">⚠️ Discount at your loss</p>
        <button class="btn-gold btn-full" onclick="saveStoreDiscount()">💾 Save</button></div>`);
}

async function saveStoreDiscount() {
    const code=document.getElementById('disc-code')?.value?.trim()?.toUpperCase();
    const value=parseFloat(document.getElementById('disc-value')?.value)||0;
    const type=document.getElementById('disc-type')?.value;
    const duration=parseInt(document.getElementById('disc-duration')?.value)||30;
    if(!code||!value){showToast('Fill fields','error');return;}
    hideModal();showLoader();
    try{
        await db.collection('store_discounts').add({storeId:APP.userProfile.uid,code,value,type,duration,active:true,createdAt:firebase.firestore.FieldValue.serverTimestamp(),expiresAt:new Date(Date.now()+duration*24*60*60*1000)});
        await db.collection('discount_codes').add({code,type,value,merchantId:APP.userProfile.uid,active:true,createdAt:firebase.firestore.FieldValue.serverTimestamp()});
        hideLoader();showToast('Discount code created!🎫','success');loadStoreOwnerDashboard();
    }catch(e){hideLoader();showToast('Failed','error');}
}

// =====================
// ADVERTISERS / INFLUENCERS
// =====================
async function loadAdvertisers() {
    const container = document.getElementById('advertisers-list');
    if (!container) return;
    container.innerHTML = '<p style="text-align:center;padding:40px;">Loading influencers...</p>';
    try {
        const snap = await db.collection('users').where('influencerStatus','==','approved').get();
        if (snap.empty) { container.innerHTML = '<p style="text-align:center;padding:40px;">No influencers yet</p>'; return; }
        const influencers = []; snap.forEach(d => influencers.push({id:d.id,...d.data()}));
        container.innerHTML = '';
        influencers.forEach(inf => {
            const platforms = (inf.influencerPlatforms||[]).map(p=>{const pf=APP.socialPlatforms?.find(sp=>sp.id===p);return pf?`<span style="font-size:18px;" title="${pf.name}">${pf.icon}</span>`:'';}).join('');
            container.innerHTML += `
                <div style="padding:15px;background:white;border-radius:12px;box-shadow:var(--shadow);margin-bottom:12px;">
                    <div style="display:flex;gap:12px;align-items:center;">
                        <img src="${inf.photoURL||'/app-icon.png'}" style="width:45px;height:45px;border-radius:50%;">
                        <div style="flex:1;"><div style="font-weight:600;">${inf.influencerName||inf.displayName||inf.username}</div><div style="font-size:12px;color:#666;">${inf.influencerNiche||'General'}</div><div>${platforms}</div></div>
                    </div>
                    <div style="display:flex;gap:8px;margin-top:10px;">
                        ${inf.influencerPhone?`<a href="https://wa.me/${inf.influencerPhone.replace(/\+/g,'')}" target="_blank" style="flex:1;text-align:center;padding:10px;background:#25D366;color:white;border-radius:8px;text-decoration:none;font-weight:600;font-size:12px;">💬 Contact</a>`:''}
                        ${APP.userProfile?.isDropshipper||APP.userProfile?.isStoreOwner?`
                            <button onclick="requestInfluencerContract('${inf.id}','${inf.influencerName||inf.displayName}')" style="flex:1;padding:10px;background:#FFD700;color:#1a1a1a;border:none;border-radius:8px;font-weight:600;font-size:12px;cursor:pointer;">🤝 Contract</button>
                            <button onclick="requestLongTermContract('${inf.id}','${inf.influencerName||inf.displayName}')" style="flex:1;padding:10px;background:#FF9800;color:white;border:none;border-radius:8px;font-weight:600;font-size:11px;cursor:pointer;">📋 Long-Term</button>
                        `:''}
                    </div>
                </div>`;
        });
    } catch(e) { container.innerHTML = '<p style="text-align:center;padding:40px;">Error</p>'; }
}

// =====================
// INFLUENCER DASHBOARD
// =====================
async function loadInfluencerDashboard() {
    const container = document.getElementById('influencer-dashboard-content');
    if (!container) return;
    if (!APP.userProfile || APP.userProfile.influencerStatus !== 'approved') {
        container.innerHTML = '<p style="text-align:center;padding:40px;">Access denied</p>'; return;
    }
    container.innerHTML = '<p style="text-align:center;padding:40px;">Loading...</p>';
    try {
        const contractsSnap = await db.collection('influencer_contracts').where('influencerId','==',APP.userProfile.uid).get();
        let totalCampaigns=0,activeCampaigns=0,totalEarnings=0; const campaigns=[];
        contractsSnap.forEach(d=>{const c=d.data();totalCampaigns++;if(c.status==='active')activeCampaigns++;totalEarnings+=c.totalEarnings||0;campaigns.push({id:d.id,...c});});
        campaigns.sort((a,b)=>(b.createdAt?.toDate?.()||0)-(a.createdAt?.toDate?.()||0));
        
        container.innerHTML = `
            <div style="padding:15px;">
                <div style="text-align:center;padding:20px;background:linear-gradient(135deg,#667eea,#764ba2);border-radius:12px;color:white;margin-bottom:15px;">
                    <h2>📊 Influencer Dashboard</h2>
                    <p>${APP.userProfile.influencerVerified?'✓ Verified':'Unverified'}</p>
                </div>
                <div class="affiliate-stats">
                    <div class="stat-card"><div class="stat-value">${totalCampaigns}</div><div class="stat-label">Contracts</div></div>
                    <div class="stat-card"><div class="stat-value">${activeCampaigns}</div><div class="stat-label">Active</div></div>
                    <div class="stat-card"><div class="stat-value">${formatCurrency(totalEarnings)}</div><div class="stat-label">Earned</div></div>
                    <div class="stat-card"><div class="stat-value">${formatCurrency(APP.userProfile.influencerEarnings||0)}</div><div class="stat-label">Total Earnings</div></div>
                </div>
                <h4>Your Contracts</h4>
                <div id="influencer-contracts">${campaigns.length===0?'<p style="color:#999;">No contracts yet</p>':''}</div>
            </div>`;
        
        if (campaigns.length > 0) {
            const list = document.getElementById('influencer-contracts');
            campaigns.forEach(c => {
                const sc = {active:'#4CAF50',completed:'#2196F3',cancelled:'#F44336',pending:'#FFA000'};
                list.innerHTML += `
                    <div style="padding:12px;background:white;border-radius:12px;margin-bottom:8px;box-shadow:var(--shadow);">
                        <div style="display:flex;justify-content:space-between;">
                            <strong>${c.productName||'Store Promotion'}</strong>
                            <span style="background:${sc[c.status]||'#999'};color:white;padding:2px 8px;border-radius:10px;font-size:10px;">${(c.status||'').toUpperCase()}</span>
                        </div>
                        <div style="font-size:12px;color:#666;">${c.dropshipperName||'Unknown'} | ${c.contractType==='longterm'?'Long-Term Store':'Product'} Contract</div>
                        <div style="font-size:12px;color:#666;">Commission: ${c.commission||c.weeklyShare||'N/A'}${c.commission?'%':c.weeklyShare?'% weekly':''} | Earned: ${formatCurrency(c.totalEarnings||0)}</div>
                        ${c.productLink?`<div style="font-size:10px;color:#999;">🔗 ${c.productLink}</div>`:''}
                        ${c.storeLink?`<div style="font-size:10px;color:#999;">🔗 ${c.storeLink}</div>`:''}
                    </div>`;
            });
        }
    } catch(e) { container.innerHTML = '<p style="text-align:center;padding:40px;">Error</p>'; }
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
function updateAIInsights(data){const el=document.getElementById('insightText');if(!el||!data)return;const r=data.revenue||[];if(r.length<2||r.every(v=>v===0)){el.textContent='📊 Start selling!';return;}const last=r.length-1;const insights=[];if(r[last]>r[last-1]&&r[last-1]>0){insights.push(`📈 Revenue grew ${((r[last]-r[last-1])/r[last-1]*100).toFixed(1)}%!`);}if(insights.length===0)insights.push('✅ Stable.');el.textContent=insights.join(' ');}
async function generateAnalyticsFromUserData(uid){try{const os=await db.collection('orders').where('userId','==',uid).get();const days=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];const r=[0,0,0,0,0,0,0],o=[0,0,0,0,0,0,0];os.forEach(doc=>{const order=doc.data();const date=order.createdAt?.toDate?.()||order.createdAt||new Date();const di=(date.getDay()+6)%7;r[di]+=order.total||0;o[di]+=1;});updateAllCharts({labels:days,revenue:r,orders:o});updateSummaryStats({revenue:r,orders:o});updateAIInsights({revenue:r});}catch(e){document.getElementById('insightText')&&(document.getElementById('insightText').textContent='Start selling!');}}
function switchAnalyticsRange(){const s=document.getElementById('analytics-range');if(s){currentAnalyticsRange=s.value;initializeCharts();if(APP.userProfile?.uid)generateAnalyticsFromUserData(APP.userProfile.uid);}}

// =====================
// LEADERBOARD
// =====================
async function loadLeaderboard(){
    const c=document.getElementById('leaderboard-content');if(!c)return;
    c.innerHTML='<p style="text-align:center;padding:40px;">Loading...</p>';
    try{const snap=await db.collection('users').get();const all=[];snap.forEach(d=>all.push(d.data()));
    const aff=all.filter(u=>u.isAffiliate).sort((a,b)=>(b.affiliateEarnings||0)-(a.affiliateEarnings||0)).slice(0,20);
    const mer=all.filter(u=>u.isMerchant).sort((a,b)=>(b.totalRevenue||0)-(a.totalRevenue||0)).slice(0,20);
    const drp=all.filter(u=>u.isDropshipper).sort((a,b)=>(b.totalRevenue||0)-(a.totalRevenue||0)).slice(0,20);
    c.innerHTML=`<div style="padding:15px;"><h3>🏆 Top Affiliates</h3>${aff.length===0?'<p style="color:#999;">None</p>':aff.map((u,i)=>{const m=['🥇','🥈','🥉'];return`<div class="earner-card" style="margin-bottom:6px;cursor:pointer;" onclick="showEarnerDetails('${u.username}','${u.displayName||u.username}','${u.totalSales||0}','${u.affiliateEarnings||0}','${u.totalRevenue||0}','affiliate','${i+1}',${u.isAppVerified||false},${u.isAmbassador||false})"><span style="font-size:22px;">${m[i]||'⭐'}</span><span><strong>${u.displayName||u.username}</strong></span><span style="margin-left:auto;">${formatCurrency(u.affiliateEarnings||0)}</span></div>`}).join('')}</div><div style="padding:15px;"><h3>🏪 Top Merchants</h3>${mer.length===0?'<p style="color:#999;">None</p>':mer.map((u,i)=>{const m=['🥇','🥈','🥉'];return`<div class="earner-card" style="margin-bottom:6px;cursor:pointer;" onclick="showEarnerDetails('${u.username}','${u.displayName||u.username}','${u.totalSales||0}','${u.affiliateEarnings||0}','${u.totalRevenue||0}','merchant','${i+1}',${u.isAppVerified||false},${u.isAmbassador||false})"><span style="font-size:22px;">${m[i]||'⭐'}</span><span><strong>${u.displayName||u.username}</strong></span><span style="margin-left:auto;">${formatCurrency(u.totalRevenue||0)}</span></div>`}).join('')}</div><div style="padding:15px;"><h3>📦 Top Dropshippers</h3>${drp.length===0?'<p style="color:#999;">None</p>':drp.map((u,i)=>{const m=['🥇','🥈','🥉'];return`<div class="earner-card" style="margin-bottom:6px;cursor:pointer;" onclick="showEarnerDetails('${u.username}','${u.displayName||u.username}','${u.totalSales||0}','${u.affiliateEarnings||0}','${u.totalRevenue||0}','dropshipper','${i+1}',${u.isAppVerified||false},${u.isAmbassador||false})"><span style="font-size:22px;">${m[i]||'⭐'}</span><span><strong>${u.displayName||u.username}</strong></span><span style="margin-left:auto;">${formatCurrency(u.totalRevenue||0)}</span></div>`}).join('')}</div>`;}catch(e){c.innerHTML='<p style="text-align:center;padding:40px;">Error</p>';}
}
function showEarnerDetails(un,dn,ts,ae,tr,type,rank,iv,ia){showModal(`<div style="text-align:center;padding:10px;"><div style="font-size:60px;">${rank==1?'👑':rank==2?'🥈':rank==3?'🥉':'⭐'}</div><h2>${dn}</h2><p>@${un}</p><p>${type.toUpperCase()} | #${rank}</p>${iv?'<span style="background:#20D5EC;color:white;padding:4px 12px;border-radius:12px;font-size:12px;">✓ Verified</span>':''}<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:20px 0;"><div class="stat-card"><div class="stat-value">${ts}</div><div class="stat-label">Sales</div></div><div class="stat-card"><div class="stat-value">${formatCurrency(ae)}</div><div class="stat-label">Earnings</div></div><div class="stat-card"><div class="stat-value">${formatCurrency(tr)}</div><div class="stat-label">Revenue</div></div><div class="stat-card"><div class="stat-value">#${rank}</div><div class="stat-label">Rank</div></div></div><button class="btn-gold btn-full" onclick="hideModal()">Close</button></div>`);}

// =====================
// HALL OF FAME
// =====================
async function loadHallOfFame(){
    const c=document.getElementById('hall-fame-content');if(!c)return;
    c.innerHTML='<p style="text-align:center;padding:40px;">Loading...</p>';
    try{const snap=await db.collection('users').get();const all=[];snap.forEach(d=>all.push(d.data()));const top=all.sort((a,b)=>(b.totalSales||0)-(a.totalSales||0)).slice(0,30);
    if(top.length===0){c.innerHTML='<div style="text-align:center;padding:60px;"><p style="font-size:50px;">🌟</p><h3>Hall of Fame</h3></div>';return;}
    c.innerHTML='<h3 style="padding:15px;">🌟 Hall of Fame</h3>';
    top.forEach((u,i)=>{const b=[];if(u.isAppVerified)b.push('✓');if(u.isAmbassador)b.push('👑');c.innerHTML+=`<div style="display:flex;align-items:center;gap:12px;padding:15px;border-bottom:1px solid #f0f0f0;"><span style="font-size:28px;min-width:40px;">${i===0?'👑':i===1?'🥈':i===2?'🥉':'#'+(i+1)}</span><img src="${u.photoURL||'/app-icon.png'}" style="width:40px;height:40px;border-radius:50%;"><div style="flex:1;"><div style="font-weight:600;">${u.displayName||u.username}</div><div style="font-size:12px;color:#666;">${u.totalSales||0} sales | ${formatCurrency(u.totalRevenue||0)}</div></div><div>${b.join(' ')}</div></div>`;});}catch(e){c.innerHTML='<p style="text-align:center;padding:40px;">Error</p>';}
}

// =====================
// TOP EARNERS
// =====================
async function loadTopEarners(){
    const c=document.getElementById('top-earners');if(!c)return;
    if(!APP.userProfile?.isAffiliate&&!APP.userProfile?.isMerchant&&!APP.userProfile?.isDropshipper){c.innerHTML='';return;}
    try{const snap=await db.collection('users').get();const all=[];snap.forEach(d=>all.push(d.data()));const top=all.filter(u=>u.isAffiliate).sort((a,b)=>(b.affiliateEarnings||0)-(a.affiliateEarnings||0)).slice(0,3);
    c.innerHTML='<h4>🏆 Top Affiliates</h4>';if(top.length===0)c.innerHTML+='<p style="color:#999;">None</p>';else top.forEach((u,i)=>{const m=['👑','🥈','🥉'];c.innerHTML+=`<div class="earner-card"><span>${m[i]}</span><span><strong>${u.displayName||u.username}</strong></span><span style="margin-left:auto;">${formatCurrency(u.affiliateEarnings||0)}</span></div>`;});}catch(e){}
}

// =====================
// STORE SETUP
// =====================
function loadStoreSetup(){const c=document.getElementById('store-setup-content');if(!c)return;const t=[{id:'classic',name:'Classic',icon:'🏪',color:'#FFD700'},{id:'modern',name:'Modern',icon:'🏢',color:'#2196F3'},{id:'premium',name:'Premium',icon:'✨',color:'#9C27B0'},{id:'minimal',name:'Minimal',icon:'🎯',color:'#607D8B'}];c.innerHTML=`<div style="padding:20px;"><h3>⚙️ Store Setup</h3><div class="input-group"><label>Store Name</label><input type="text" id="store-name" class="input-field" value="${APP.userProfile.storeName||''}"></div><h4 style="margin-top:20px;">Template</h4><div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:10px;">${t.map(tm=>`<div class="plan-card ${APP.userProfile.storeTemplate===tm.id?'active':''}" onclick="selectTemplate('${tm.id}')" style="text-align:center;cursor:pointer;"><div style="font-size:40px;">${tm.icon}</div><div style="font-weight:600;">${tm.name}</div></div>`).join('')}</div><button class="btn-gold btn-full" style="margin-top:20px;" onclick="saveStoreSetup()">💾 Save</button></div>`;}
function selectTemplate(id){document.querySelectorAll('.plan-card').forEach(c=>c.classList.remove('active'));event.target.closest('.plan-card').classList.add('active');APP._selectedTemplate=id;}
async function saveStoreSetup(){const n=document.getElementById('store-name')?.value?.trim();const t=APP._selectedTemplate||APP.userProfile.storeTemplate||'classic';if(!n){showToast('Enter name','error');return;}try{await db.collection('users').doc(APP.userProfile.uid).update({storeName:n,storeTemplate:t,storeActive:true});APP.userProfile.storeName=n;APP.userProfile.storeTemplate=t;showToast('Saved!','success');navigateTo('merchant');}catch(e){showToast('Failed','error');}}

// =====================
// ADD PRODUCT FORM
// =====================
async function loadAddProductForm(){const c=document.getElementById('add-product-form');if(!c)return;c.innerHTML=`<div style="padding:20px;"><div class="input-group"><label>Name *</label><input type="text" id="product-name" class="input-field"></div><div class="input-group"><label>Price *</label><input type="number" id="product-price" class="input-field" step="0.01"></div><div class="input-group"><label>Category *</label><select id="product-category" class="input-field">${APP.categories.filter(cat=>cat!=='All').map(cat=>`<option value="${cat}">${cat}</option>`).join('')}</select></div><div class="input-group"><label>Stock</label><input type="number" id="product-stock" class="input-field"></div><div class="input-group"><label>Commission (%)</label><input type="number" id="product-commission" class="input-field" value="4" min="1" max="100"></div><div class="input-group"><label>Colors</label><input type="text" id="product-colors" class="input-field" placeholder="Black,White"></div><div class="input-group"><label>Sizes</label><input type="text" id="product-sizes" class="input-field" placeholder="S,M,L"></div><div class="input-group"><label>Description</label><textarea id="product-description" class="input-field" rows="4"></textarea></div><div class="input-group"><label><input type="checkbox" id="product-digital" onchange="toggleDigitalFields()"> Digital</label></div><div class="input-group hidden" id="digital-link-group"><label>Link</label><input type="url" id="product-digital-link" class="input-field"></div><div class="input-group"><label>Images (5)</label><input type="file" id="product-images" class="input-field" multiple accept="image/*" onchange="previewProductImages()"><div id="image-preview-container" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;"></div></div><div class="input-group"><label>Discount Code</label><div style="display:flex;gap:8px;"><input type="text" id="discount-code" class="input-field" placeholder="SAVE20" style="flex:1;"><input type="number" id="discount-value" class="input-field" placeholder="20" style="flex:1;"><select id="discount-type" class="input-field" style="flex:1;"><option value="percentage">%</option><option value="fixed">$</option></select></div></div><div class="input-group"><label>Max Uses</label><input type="number" id="discount-max-uses" class="input-field"></div><div class="input-group"><label><input type="checkbox" id="product-free-shipping"> Free Shipping</label></div><button class="btn-gold btn-full" onclick="submitProduct()">📦 Publish</button></div>`;}
function toggleDigitalFields(){const dg=document.getElementById('digital-link-group');const isDigital=document.getElementById('product-digital')?.checked;if(dg)dg.classList.toggle('hidden',!isDigital);const sf=document.getElementById('product-stock');if(sf){sf.value=isDigital?'999999':'';sf.disabled=isDigital;}}
function previewProductImages(){const files=document.getElementById('product-images')?.files;const c=document.getElementById('image-preview-container');if(!c)return;c.innerHTML='';if(files)Array.from(files).slice(0,5).forEach(f=>{const r=new FileReader();r.onload=e=>c.innerHTML+=`<img src="${e.target.result}" style="width:70px;height:70px;object-fit:cover;border-radius:8px;">`;r.readAsDataURL(f);});}
async function submitProduct(){const name=document.getElementById('product-name')?.value?.trim();const price=parseFloat(document.getElementById('product-price')?.value);const category=document.getElementById('product-category')?.value;const isDigital=document.getElementById('product-digital')?.checked;if(!name||!price||!category){showToast('Fill required','error');return;}showLoader();try{const files=document.getElementById('product-images')?.files;let imgs=[];if(files?.length)for(const f of Array.from(files).slice(0,5)){try{imgs.push(await uploadToCloudinary(f));}catch(e){}}const pd={name,price,category,stock:isDigital?999999:(parseInt(document.getElementById('product-stock')?.value)||0),commissionPercentage:parseInt(document.getElementById('product-commission')?.value)||APP.affiliateCommissionMin,colors:document.getElementById('product-colors')?.value?.split(',').map(c=>c.trim()).filter(Boolean)||[],sizes:document.getElementById('product-sizes')?.value?.split(',').map(s=>s.trim()).filter(Boolean)||[],description:document.getElementById('product-description')?.value?.trim()||'',images:imgs.length>0?imgs:['/app-icon.png'],isDigital,digitalLink:isDigital?(document.getElementById('product-digital-link')?.value?.trim()||''):'',freeShipping:document.getElementById('product-free-shipping')?.checked||false,merchantId:APP.userProfile.uid,merchantName:APP.userProfile.displayName||APP.userProfile.username,status:'active',sponsored:false,totalSales:0,avgRating:0,reviewCount:0,totalAffiliates:0,createdAt:firebase.firestore.FieldValue.serverTimestamp()};const dc=document.getElementById('discount-code')?.value?.trim();const dv=parseFloat(document.getElementById('discount-value')?.value);const mu=parseInt(document.getElementById('discount-max-uses')?.value)||null;if(dc&&dv){pd.discountCode={code:dc.toUpperCase(),value:dv,type:document.getElementById('discount-type')?.value,maxUses:mu,usedCount:0,active:true};await db.collection('discount_codes').add({code:dc.toUpperCase(),type:document.getElementById('discount-type')?.value,value:dv,maxUses:mu,usedCount:0,merchantId:APP.userProfile.uid,active:true,createdAt:firebase.firestore.FieldValue.serverTimestamp()});}await db.collection('products').add(pd);hideLoader();showToast('Published!🎉','success');navigateTo('merchant');}catch(e){hideLoader();showToast('Failed','error');}}

// =====================
// GLOBAL ACCESS
// =====================
window.loadStoreOwnerDashboard = loadStoreOwnerDashboard;
window.addTicketProduct = addTicketProduct;
window.addStoreProduct = addStoreProduct;
window.sponsorStoreProduct = sponsorStoreProduct;
window.addStoreDiscount = addStoreDiscount;
window.loadInfluencerDashboard = loadInfluencerDashboard;
window.requestLongTermContract = requestLongTermContract;

console.log('✅ income.js fully loaded - All dashboards ready');
