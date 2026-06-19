// home.js - COMPLETE UPDATED (Ad Banner Clickable, All Features Preserved)
console.log('✅ home.js loaded');

// =====================
// HOME SCREEN
// =====================
async function loadHomeScreen() {
    if (!APP.userProfile) {
        navigateTo('auth');
        return;
    }
    
    updateHomeHeader();
    updateWalletBalance();
    updateCartBadge();
    
    // Everyone sees sponsored and trending
    loadSponsoredProducts();
    loadTrendingProducts();
    
    // Only non-customers see top earners
    if (APP.userProfile?.isAffiliate || APP.userProfile?.isMerchant || APP.userProfile?.isDropshipper) {
        document.getElementById('top-earners-header').style.display = '';
        loadTopEarners();
    } else {
        document.getElementById('top-earners-header').style.display = 'none';
        document.getElementById('top-earners').innerHTML = '';
    }
    
    updateNotificationBadge();
    updateBottomNav();
    startLiveFeedUpdates();
    
    // Initialize ad banner (only if not closed this session)
    if (sessionStorage.getItem('ad_closed') !== 'true') {
        setTimeout(() => initializeAdBanner(), 2000);
    }
}

function updateHomeHeader() {
    const avatar = document.getElementById('header-avatar');
    if (avatar && APP.userProfile?.photoURL) {
        avatar.src = APP.userProfile.photoURL;
    }
    updateCartBadge();
}

function updateWalletBalance() {
    const balanceEl = document.getElementById('home-balance');
    if (balanceEl) {
        balanceEl.textContent = formatCurrency(APP.userProfile?.walletBalance || 0);
    }
}

function updateCartBadge() {
    const cart = JSON.parse(sessionStorage.getItem('shoplify_cart') || '[]');
    const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    
    ['cart-count-badge', 'cart-count-badge-mp', 'cart-count-badge-pd'].forEach(id => {
        const badge = document.getElementById(id);
        if (badge) {
            badge.textContent = count > 99 ? '99+' : count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        }
    });
}

// =====================
// SPONSORED PRODUCTS
// =====================
async function loadSponsoredProducts() {
    const container = document.getElementById('sponsored-products');
    if (!container) return;
    
    try {
        const snapshot = await db.collection('products')
            .where('sponsored', '==', true)
            .get();
        
        if (snapshot.empty) {
            container.innerHTML = '<p style="padding:20px;color:#999;">No sponsored products</p>';
            return;
        }
        
        const products = [];
        snapshot.forEach(doc => {
            const p = doc.data();
            if (p.status === 'active') products.push({ id: doc.id, ...p });
        });
        
        container.innerHTML = '';
        products.slice(0, 10).forEach(product => {
            container.innerHTML += createProductCard(product);
        });
    } catch (error) {
        container.innerHTML = '<p style="padding:20px;color:#999;">Unable to load</p>';
    }
}

async function loadTrendingProducts() {
    const container = document.getElementById('trending-products');
    if (!container) return;
    
    try {
        const snapshot = await db.collection('products')
            .where('status', '==', 'active')
            .get();
        
        const products = [];
        snapshot.forEach(doc => products.push({ id: doc.id, ...doc.data() }));
        products.sort((a, b) => (b.totalSales || 0) - (a.totalSales || 0));
        
        container.innerHTML = '';
        products.slice(0, 6).forEach(product => {
            container.innerHTML += createProductCard(product);
        });
    } catch (error) {
        container.innerHTML = '<p style="padding:20px;color:#999;">Unable to load</p>';
    }
}

// =====================
// PRODUCT CARD
// =====================
function createProductCard(product) {
    const imageUrl = (product.images && product.images.length > 0) ? product.images[0] : '/app-icon.png';
    const rating = product.avgRating || 0;
    const storeName = product.merchantName || 'Store';
    const discount = product.discountCode ? 
        `<span class="discount-badge">-${product.discountCode.value}${product.discountCode.type==='percentage'?'%':'$'}</span>` : '';
    const freeShip = product.freeShipping ? 
        '<div style="font-size:10px;color:var(--green);">🚚 Free Shipping</div>' : '';
    
    return `
        <div class="product-card" data-product-id="${product.id}" onclick="openProductDetail('${product.id}')">
            <div style="position:relative;">
                <img src="${imageUrl}" class="product-card-image" onerror="this.src='/app-icon.png'" loading="lazy">
                ${product.sponsored ? '<span style="position:absolute;top:5px;left:5px;background:#FFD700;color:#1a1a1a;padding:2px 6px;border-radius:4px;font-size:9px;">⭐</span>' : ''}
            </div>
            <div class="product-card-info">
                <div style="font-size:10px;color:#999;">${storeName}</div>
                <div class="product-card-name">${product.name||'Product'}</div>
                <div class="product-card-price">${formatCurrency(product.price)} ${discount}</div>
                ${freeShip}
                <div class="product-card-rating">⭐ ${rating.toFixed(1)} (${product.reviewCount||0})</div>
                <button class="btn-gold" style="width:100%;margin-top:6px;font-size:11px;padding:7px;" 
                        onclick="event.stopPropagation();addToCartFromCard('${product.id}')">🛒 Add to Cart</button>
            </div>
        </div>`;
}

async function addToCartFromCard(productId) {
    try {
        const doc = await db.collection('products').doc(productId).get();
        if (!doc.exists) { showToast('Product not found','error'); return; }
        const p = doc.data();
        const img = (p.images&&p.images[0])||'/app-icon.png';
        let cart = JSON.parse(sessionStorage.getItem('shoplify_cart')||'[]');
        const idx = cart.findIndex(i=>i.productId===productId);
        if(idx>=0){ cart[idx].quantity+=1; }
        else{ cart.push({productId, name:p.name, price:p.price, image:img, color:null, size:null, quantity:1, merchantId:p.merchantId, isDigital:p.isDigital||false, discountCode:p.discountCode||null, freeShipping:p.freeShipping||false}); }
        sessionStorage.setItem('shoplify_cart',JSON.stringify(cart));
        updateCartBadge();
        showToast('Added to cart! 🛒','success');
    } catch(e){ showToast('Failed','error'); }
}

async function openProductDetail(productId) {
    try {
        const doc = await db.collection('products').doc(productId).get();
        if (doc.exists) navigateTo('product-detail',{productId,product:{id:doc.id,...doc.data()}});
        else showToast('Product not found','error');
    } catch(e){ showToast('Error','error'); }
}

// =====================
// TOP EARNERS
// =====================
async function loadTopEarners() {
    const container = document.getElementById('top-earners');
    if (!container) return;
    
    if (!APP.userProfile?.isAffiliate && !APP.userProfile?.isMerchant && !APP.userProfile?.isDropshipper) {
        container.innerHTML = '';
        return;
    }
    
    try {
        const snapshot = await db.collection('users').get();
        const all = [];
        snapshot.forEach(doc => all.push(doc.data()));
        
        const topAff = all.filter(u => u.isAffiliate).sort((a,b) => (b.affiliateEarnings||0)-(a.affiliateEarnings||0)).slice(0,3);
        
        container.innerHTML = '<h4 style="padding:0 0 8px;">🏆 Top Affiliates</h4>';
        if (topAff.length === 0) container.innerHTML += '<p style="color:#999;">None yet</p>';
        else topAff.forEach((u,i) => {
            const m = ['👑','🥈','🥉'];
            container.innerHTML += `<div class="earner-card"><span>${m[i]}</span><span><strong>${u.displayName||u.username}</strong></span><span style="margin-left:auto;">${formatCurrency(u.affiliateEarnings||0)}</span></div>`;
        });
    } catch (error) { console.error('Top earners error:', error); }
}

// =====================
// LIVE FEED
// =====================
function startLiveFeedUpdates() {
    updateLiveFeed();
    setInterval(updateLiveFeed, 30000);
}

async function updateLiveFeed() {
    const feed = document.getElementById('live-feed-content');
    if (!feed) return;
    
    try {
        const orderSnap = await db.collection('orders')
            .where('status', 'in', ['processing','shipped','delivered','completed'])
            .get();
        
        const adminSnap = await db.collection('admin_feed').get();
        const messages = [];
        
        adminSnap.forEach(doc => messages.push(`📢 ${doc.data().message}`));
        
        const orders = [];
        orderSnap.forEach(doc => orders.push(doc.data()));
        orders.sort((a,b) => (b.createdAt?.toDate?.()||0) - (a.createdAt?.toDate?.()||0));
        
        orders.slice(0,10).forEach(o => {
            const name = o.userName || o.userEmail?.split('@')[0] || 'Someone';
            messages.push(`🛒 ${name} purchased "${o.items?.[0]?.name||'product'}"`);
        });
        
        feed.innerHTML = messages.length > 0 ? 
            '<span class="live-dot"></span> ' + messages.join(' • ') : 
            '<span class="live-dot"></span> Live: Marketplace active 🌍';
    } catch(e) { 
        feed.innerHTML = '<span class="live-dot"></span> Live: Marketplace active 🌍'; 
    }
}

// =====================
// AD BANNER - FIXED (Clickable, Title, Visit Button)
// =====================
async function initializeAdBanner() {
    try {
        const snapshot = await db.collection('admin_ads')
            .where('active', '==', true)
            .get();
        
        if (snapshot.empty) return;
        
        const ads = [];
        snapshot.forEach(doc => {
            const ad = doc.data();
            if (ad.expiresAt && ad.expiresAt.toDate() < new Date()) {
                db.collection('admin_ads').doc(doc.id).update({ active: false }).catch(() => {});
                return;
            }
            ads.push({ id: doc.id, ...ad });
        });
        
        if (ads.length === 0) return;
        
        const ad = ads[0];
        const adBanner = document.getElementById('ad-banner');
        const adContent = document.getElementById('ad-content');
        
        if (adBanner && adContent) {
            let mediaHTML = '';
            if (ad.type === 'video') {
                mediaHTML = `<video src="${ad.url}" autoplay muted loop playsinline style="width:100%;max-height:180px;object-fit:cover;border-radius:8px 8px 0 0;cursor:pointer;" onclick="openAdLink('${ad.link || ''}')"></video>`;
            } else {
                mediaHTML = `<img src="${ad.url}" alt="${ad.title || 'Ad'}" style="width:100%;max-height:180px;object-fit:cover;border-radius:8px 8px 0 0;cursor:pointer;" onclick="openAdLink('${ad.link || ''}')" onerror="this.style.display='none'">`;
            }
            
            adContent.innerHTML = `
                <div style="cursor:pointer;" onclick="openAdLink('${ad.link || ''}')">
                    ${mediaHTML}
                    <div style="padding:10px 12px;display:flex;justify-content:space-between;align-items:center;background:linear-gradient(180deg, rgba(0,0,0,0.8), rgba(0,0,0,0.95));">
                        <div>
                            <div style="color:white;font-weight:700;font-size:13px;">${ad.title || 'Sponsored'}</div>
                            <div style="color:#FFD700;font-size:10px;">📢 Sponsored</div>
                        </div>
                        ${ad.link ? `
                            <a href="${ad.link}" target="_blank" onclick="event.stopPropagation();" 
                               style="padding:7px 14px;background:#FFD700;color:#1a1a1a;border-radius:20px;font-size:11px;font-weight:700;text-decoration:none;white-space:nowrap;">
                                Visit →
                            </a>
                        ` : ''}
                    </div>
                </div>
            `;
            
            adBanner.classList.add('active');
            console.log('📢 Ad displayed:', ad.title);
        }
    } catch (error) {
        console.warn('Ad banner error:', error);
    }
}

function openAdLink(link) {
    if (link && link.startsWith('http')) {
        window.open(link, '_blank');
    }
}

function closeAd() {
    const adBanner = document.getElementById('ad-banner');
    if (adBanner) {
        adBanner.classList.remove('active');
        sessionStorage.setItem('ad_closed', 'true');
    }
}

// =====================
// NOTIFICATION BADGE
// =====================
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

// =====================
// BOTTOM NAVIGATION
// =====================
function updateBottomNav() {
    document.querySelectorAll('.nav-item').forEach(i=>i.classList.remove('active'));
    
    const affNav = document.getElementById('nav-affiliate');
    const merchNav = document.getElementById('nav-merchant');
    const dropNav = document.getElementById('nav-dropship');
    
    if(APP.userProfile){
        if(affNav) affNav.style.display = APP.userProfile.isAffiliate?'flex':'none';
        if(merchNav) merchNav.style.display = APP.userProfile.isMerchant?'flex':'none';
        if(dropNav) dropNav.style.display = APP.userProfile.isDropshipper?'flex':'none';
    }
    
    const map = {home:0,marketplace:1,affiliate:2,dropship:2,merchant:3,orders:4};
    const hash = window.location.hash.replace('#','')||'home';
    const idx = map[hash]||0;
    const items = document.querySelectorAll('.nav-item');
    if(items[idx]) items[idx].classList.add('active');
}

console.log('✅ home.js fully loaded');
