// home.js - COMPLETE FINAL VERSION (Customer view - no leaderboard)

async function loadHomeScreen() {
    if (!APP.userProfile) { navigateTo('auth'); return; }
    
    updateHomeHeader();
    updateWalletBalance();
    updateCartBadge();
    
    loadSponsoredProducts();
    loadTrendingProducts();
    
    // ONLY show top earners for affiliates/merchants/dropshippers
    const topEarnersHeader = document.getElementById('top-earners-header');
    const topEarnersContainer = document.getElementById('top-earners');
    
    if (APP.userProfile?.isAffiliate || APP.userProfile?.isMerchant || APP.userProfile?.isDropshipper) {
        if (topEarnersHeader) topEarnersHeader.style.display = '';
        loadTopEarners();
    } else {
        if (topEarnersHeader) topEarnersHeader.style.display = 'none';
        if (topEarnersContainer) topEarnersContainer.innerHTML = '';
    }
    
    updateNotificationBadge();
    updateBottomNav();
    startLiveFeedUpdates();
    initializeAdBanner();
}

function updateHomeHeader() {
    const avatar = document.getElementById('header-avatar');
    if (avatar && APP.userProfile?.photoURL) avatar.src = APP.userProfile.photoURL;
    updateCartBadge();
}

function updateWalletBalance() {
    const el = document.getElementById('home-balance');
    if (el) el.textContent = formatCurrency(APP.userProfile?.walletBalance || 0);
}

function updateCartBadge() {
    const cart = JSON.parse(sessionStorage.getItem('shoplify_cart') || '[]');
    const count = cart.reduce((s, i) => s + (i.quantity || 1), 0);
    ['cart-count-badge', 'cart-count-badge-mp', 'cart-count-badge-pd'].forEach(id => {
        const badge = document.getElementById(id);
        if (badge) {
            badge.textContent = count > 99 ? '99+' : count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        }
    });
}

async function loadSponsoredProducts() {
    const container = document.getElementById('sponsored-products');
    if (!container) return;
    try {
        const snap = await db.collection('products').where('sponsored', '==', true).get();
        const products = [];
        snap.forEach(d => { const p = d.data(); if (p.status === 'active') products.push({ id: d.id, ...p }); });
        if (products.length === 0) { container.innerHTML = '<p style="padding:20px;color:#999;">No sponsored products</p>'; return; }
        container.innerHTML = '';
        products.slice(0, 10).forEach(p => container.innerHTML += createProductCard(p));
    } catch (e) { container.innerHTML = '<p style="padding:20px;color:#999;">Unable to load</p>'; }
}

async function loadTrendingProducts() {
    const container = document.getElementById('trending-products');
    if (!container) return;
    try {
        const snap = await db.collection('products').where('status', '==', 'active').get();
        const products = [];
        snap.forEach(d => products.push({ id: d.id, ...d.data() }));
        products.sort((a, b) => (b.totalSales || 0) - (a.totalSales || 0));
        container.innerHTML = '';
        products.slice(0, 6).forEach(p => container.innerHTML += createProductCard(p));
    } catch (e) { container.innerHTML = '<p style="padding:20px;color:#999;">Unable to load</p>'; }
}

async function loadTopEarners() {
    const container = document.getElementById('top-earners');
    if (!container) return;
    if (!APP.userProfile?.isAffiliate && !APP.userProfile?.isMerchant && !APP.userProfile?.isDropshipper) {
        container.innerHTML = ''; return;
    }
    try {
        const snap = await db.collection('users').get();
        const all = []; snap.forEach(d => all.push(d.data()));
        const topAff = all.filter(u => u.isAffiliate).sort((a, b) => (b.affiliateEarnings || 0) - (a.affiliateEarnings || 0)).slice(0, 3);
        container.innerHTML = '<h4 style="padding:0 0 8px;">🏆 Top Affiliates</h4>';
        if (topAff.length === 0) container.innerHTML += '<p style="color:#999;">None yet</p>';
        else topAff.forEach((u, i) => {
            const m = ['👑', '🥈', '🥉'];
            container.innerHTML += `<div class="earner-card"><span>${m[i]}</span><span><strong>${u.displayName||u.username}</strong></span><span style="margin-left:auto;">${formatCurrency(u.affiliateEarnings||0)}</span></div>`;
        });
    } catch (e) { console.error('Top earners error:', e); }
}

function createProductCard(product) {
    const img = (product.images && product.images.length > 0) ? product.images[0] : 'app-icon.png';
    const rating = product.avgRating || 0;
    const storeName = product.merchantName || 'Store';
    const discount = product.discountCode ? `<span class="discount-badge">-${product.discountCode.value}${product.discountCode.type==='percentage'?'%':'$'}</span>` : '';
    const freeShip = product.freeShipping ? '<div style="font-size:10px;color:var(--green);">🚚 Free Shipping</div>' : '';
    
    return `
        <div class="product-card" data-product-id="${product.id}" onclick="openProductDetail('${product.id}')">
            <div style="position:relative;">
                <img src="${img}" class="product-card-image" onerror="this.src='app-icon.png'" loading="lazy">
                ${product.sponsored?'<span style="position:absolute;top:5px;left:5px;background:#FFD700;color:#1a1a1a;padding:2px 6px;border-radius:4px;font-size:9px;">⭐</span>':''}
            </div>
            <div class="product-card-info">
                <div style="font-size:10px;color:#999;">${storeName}</div>
                <div class="product-card-name">${product.name||'Product'}</div>
                <div class="product-card-price">${formatCurrency(product.price)} ${discount}</div>
                ${freeShip}
                <div class="product-card-rating">⭐ ${rating.toFixed(1)} (${product.reviewCount||0})</div>
                <button class="btn-gold" style="width:100%;margin-top:6px;font-size:11px;padding:7px;" onclick="event.stopPropagation();addToCartFromCard('${product.id}')">🛒 Add to Cart</button>
            </div>
        </div>`;
}

async function addToCartFromCard(productId) {
    try {
        const doc = await db.collection('products').doc(productId).get();
        if (!doc.exists) { showToast('Not found','error'); return; }
        const p = doc.data();
        const img = (p.images&&p.images[0])||'app-icon.png';
        let cart = JSON.parse(sessionStorage.getItem('shoplify_cart')||'[]');
        const idx = cart.findIndex(i=>i.productId===productId);
        if(idx>=0){cart[idx].quantity+=1;}
        else{cart.push({productId:p.id||productId,name:p.name,price:p.price,image:img,color:null,size:null,quantity:1,merchantId:p.merchantId,isDigital:p.isDigital||false,discountCode:p.discountCode||null,freeShipping:p.freeShipping||false});}
        sessionStorage.setItem('shoplify_cart',JSON.stringify(cart));
        updateCartBadge();
        showToast('Added! 🛒','success');
    } catch(e){ showToast('Failed','error'); }
}

async function openProductDetail(productId) {
    try {
        const doc = await db.collection('products').doc(productId).get();
        if (doc.exists) navigateTo('product-detail',{productId,product:{id:doc.id,...doc.data()}});
        else showToast('Not found','error');
    } catch(e){ showToast('Error','error'); }
}

function startLiveFeedUpdates() { updateLiveFeed(); setInterval(updateLiveFeed, 30000); }

async function updateLiveFeed() {
    const feed = document.getElementById('live-feed-content');
    if (!feed) return;
    try {
        const orderSnap = await db.collection('orders').where('status','in',['processing','shipped','delivered','completed']).get();
        const adminSnap = await db.collection('admin_feed').get();
        const messages = [];
        adminSnap.forEach(d => messages.push(`📢 ${d.data().message}`));
        const orders = []; orderSnap.forEach(d => orders.push(d.data()));
        orders.sort((a,b)=>(b.createdAt?.toDate?.()||0)-(a.createdAt?.toDate?.()||0));
        orders.slice(0,10).forEach(o => messages.push(`🛒 ${o.userName||'Someone'} purchased "${o.items?.[0]?.name||'product'}"`));
        feed.innerHTML = messages.length>0 ? '<span class="live-dot"></span> '+messages.join(' • ') : '<span class="live-dot"></span> Live: Marketplace active 🌍';
    } catch(e) { feed.innerHTML='<span class="live-dot"></span> Live: Marketplace active 🌍'; }
}

async function initializeAdBanner() {
    try {
        const snap = await db.collection('admin_ads').where('active','==',true).get();
        if(!snap.empty){
            const ad = snap.docs[0].data();
            const banner = document.getElementById('ad-banner');
            const content = document.getElementById('ad-content');
            if(banner&&content){
                content.innerHTML = ad.type==='video'?`<video src="${ad.url}" autoplay muted loop playsinline style="width:100%;max-height:200px;object-fit:cover;"></video>`:`<img src="${ad.url}" style="width:100%;max-height:200px;object-fit:cover;">`;
                banner.classList.add('active');
            }
        }
    } catch(e){}
}

function closeAd() { document.getElementById('ad-banner')?.classList.remove('active'); }

async function updateNotificationBadge() {
    const badge = document.getElementById('notification-badge');
    if(!badge) return;
    const uid = APP.userProfile?.uid||APP.currentUser?.uid;
    if(!uid){badge.style.display='none';return;}
    try {
        const snap = await db.collection('notifications').where('userId','==',uid).get();
        let unread=0; snap.forEach(d=>{if(!d.data().read)unread++;});
        badge.textContent=unread>99?'99+':unread;
        badge.style.display=unread>0?'flex':'none';
    } catch(e){badge.style.display='none';}
}

function updateBottomNav() {
    document.querySelectorAll('.nav-item').forEach(i=>i.classList.remove('active'));
    const affNav = document.getElementById('nav-affiliate');
    const merchNav = document.getElementById('nav-merchant');
    if(APP.userProfile){
        if(affNav) affNav.style.display = APP.userProfile.isAffiliate?'flex':'none';
        if(merchNav) merchNav.style.display = APP.userProfile.isMerchant?'flex':'none';
    }
    const map = {home:0,marketplace:1,affiliate:2,merchant:3,orders:4};
    const hash = window.location.hash.replace('#','')||'home';
    const idx = map[hash]||0;
    const items = document.querySelectorAll('.nav-item');
    if(items[idx]) items[idx].classList.add('active');
}