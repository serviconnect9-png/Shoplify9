// home.js - COMPLETE FINAL VERSION (Dropshipper Top Earners Only, Store Market, All Features)
console.log('✅ home.js loaded');

// =====================
// LOAD HOME SCREEN
// =====================
async function loadHomeScreen() {
    if (!APP.userProfile) {
        navigateTo('auth');
        return;
    }
    
    updateHomeHeader();
    updateWalletBalance();
    updateCartBadge();
    
    // Everyone sees sponsored and trending products
    loadSponsoredProducts();
    loadTrendingProducts();
    
    // Show top dropshipper earners (NOT affiliates)
    loadTopDropshipperEarners();
    
    updateNotificationBadge();
    updateBottomNav();
    startLiveFeedUpdates();
    initializeAdBanner();
}

// =====================
// HOME HEADER
// =====================
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

// =====================
// CART BADGE
// =====================
function updateCartBadge() {
    const cart = JSON.parse(sessionStorage.getItem('shoplify_cart') || '[]');
    const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    
    // Update all cart badges
    const badges = ['cart-count-badge', 'cart-count-badge-mp', 'cart-count-badge-pd', 'cart-count-badge-sm'];
    badges.forEach(id => {
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
            .where('status', '==', 'active')
            .get();
        
        if (snapshot.empty) {
            container.innerHTML = '<p style="padding:20px;color:#999;text-align:center;">No sponsored products yet</p>';
            return;
        }
        
        const products = [];
        snapshot.forEach(doc => {
            products.push({ id: doc.id, ...doc.data() });
        });
        
        // Sort by newest sponsored
        products.sort((a, b) => {
            const timeA = a.sponsoredUntil?.toDate?.() || 0;
            const timeB = b.sponsoredUntil?.toDate?.() || 0;
            return timeB - timeA;
        });
        
        container.innerHTML = '';
        products.slice(0, 10).forEach(product => {
            container.innerHTML += createProductCard(product);
        });
        
    } catch (error) {
        console.error('Sponsored error:', error);
        container.innerHTML = '<p style="padding:20px;color:#999;">Unable to load</p>';
    }
}

// =====================
// TRENDING PRODUCTS
// =====================
async function loadTrendingProducts() {
    const container = document.getElementById('trending-products');
    if (!container) return;
    
    try {
        const snapshot = await db.collection('products')
            .where('status', '==', 'active')
            .get();
        
        if (snapshot.empty) {
            container.innerHTML = '<p style="padding:20px;color:#999;">No products available</p>';
            return;
        }
        
        const products = [];
        snapshot.forEach(doc => {
            products.push({ id: doc.id, ...doc.data() });
        });
        
        // Sort by total sales (trending)
        products.sort((a, b) => (b.totalSales || 0) - (a.totalSales || 0));
        
        container.innerHTML = '';
        products.slice(0, 6).forEach(product => {
            container.innerHTML += createProductCard(product);
        });
        
    } catch (error) {
        console.error('Trending error:', error);
        container.innerHTML = '<p style="padding:20px;color:#999;">Unable to load</p>';
    }
}

// =====================
// TOP DROPSHIPPER EARNERS (Only Dropshippers, No Affiliates)
// =====================
async function loadTopDropshipperEarners() {
    const container = document.getElementById('top-earners');
    const header = document.getElementById('top-earners-header');
    
    if (!container) return;
    
    // Always show top dropshippers
    if (header) header.style.display = '';
    
    try {
        const snapshot = await db.collection('users')
            .where('isDropshipper', '==', true)
            .get();
        
        if (snapshot.empty) {
            container.innerHTML = '<p style="color:#999;padding:10px;font-size:13px;">No dropshippers yet</p>';
            return;
        }
        
        const dropshippers = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            dropshippers.push({
                username: data.username,
                displayName: data.displayName || data.username,
                totalRevenue: data.totalRevenue || 0,
                totalSales: data.dropshipTotalSales || data.totalSales || 0,
                dropshipPlan: data.dropshipPlan || 'starter',
                dropshipVerified: data.dropshipVerified || false,
                photoURL: data.photoURL || '/app-icon.png'
            });
        });
        
        // Sort by total revenue (highest first)
        dropshippers.sort((a, b) => (b.totalRevenue || 0) - (a.totalRevenue || 0));
        
        // Take top 3
        const topThree = dropshippers.slice(0, 3);
        
        container.innerHTML = '<h4 style="padding:0 0 8px;">🏆 Top Dropshippers</h4>';
        
        if (topThree.length === 0) {
            container.innerHTML += '<p style="color:#999;padding:5px;font-size:13px;">No dropshippers yet</p>';
        } else {
            const medals = ['👑', '🥈', '🥉'];
            const planColors = {
                starter: '#4CAF50',
                professional: '#2196F3',
                enterprise: '#FF9800'
            };
            
            topThree.forEach((dropshipper, index) => {
                const planColor = planColors[dropshipper.dropshipPlan] || '#999';
                
                container.innerHTML += `
                    <div class="earner-card" style="cursor:pointer;" onclick="showDropshipperDetails('${dropshipper.username}')">
                        <span style="font-size:22px;">${medals[index] || '⭐'}</span>
                        <img src="${dropshipper.photoURL}" style="width:30px;height:30px;border-radius:50%;object-fit:cover;" onerror="this.src='/app-icon.png'">
                        <div style="flex:1;">
                            <div style="display:flex;align-items:center;gap:5px;">
                                <strong>${dropshipper.displayName}</strong>
                                ${dropshipper.dropshipVerified ? '<span style="color:#20D5EC;font-size:14px;">✓</span>' : ''}
                            </div>
                            <div style="font-size:11px;color:#666;">
                                <span style="color:${planColor};font-weight:600;">${dropshipper.dropshipPlan.toUpperCase()}</span>
                                · ${dropshipper.totalSales || 0} sales
                            </div>
                        </div>
                        <span style="font-weight:700;color:#B8860B;">${formatCurrency(dropshipper.totalRevenue || 0)}</span>
                    </div>`;
            });
        }
        
    } catch (error) {
        console.error('Top dropshippers error:', error);
        container.innerHTML = '<p style="color:#999;padding:10px;">Unable to load rankings</p>';
    }
}

// =====================
// SHOW DROPSHIPPER DETAILS
// =====================
async function showDropshipperDetails(username) {
    try {
        const snapshot = await db.collection('users').where('username', '==', username).limit(1).get();
        if (snapshot.empty) { showToast('User not found', 'error'); return; }
        
        const user = snapshot.docs[0].data();
        const planColors = { starter: '#4CAF50', professional: '#2196F3', enterprise: '#FF9800' };
        
        showModal(`
            <div style="text-align:center;padding:15px;">
                <img src="${user.photoURL || '/app-icon.png'}" style="width:70px;height:70px;border-radius:50%;margin-bottom:10px;border:3px solid ${planColors[user.dropshipPlan] || '#999'};" onerror="this.src='/app-icon.png'">
                <h3>${user.displayName || user.username}</h3>
                <p style="color:#666;">@${user.username}</p>
                ${user.dropshipVerified ? '<span style="background:#20D5EC;color:white;padding:4px 12px;border-radius:12px;font-size:11px;">✓ Verified Dropshipper</span>' : ''}
                
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:20px 0;">
                    <div class="stat-card">
                        <div class="stat-value">${user.dropshipTotalSales || user.totalSales || 0}</div>
                        <div class="stat-label">Total Sales</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${formatCurrency(user.totalRevenue || 0)}</div>
                        <div class="stat-label">Revenue</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" style="color:${planColors[user.dropshipPlan] || '#999'};">${(user.dropshipPlan || 'starter').toUpperCase()}</div>
                        <div class="stat-label">Plan</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${user.dropshipTotalSales || user.totalSales || 0}</div>
                        <div class="stat-label">Products Sold</div>
                    </div>
                </div>
                
                <button class="btn-gold btn-full" onclick="hideModal()">Close</button>
            </div>
        `);
    } catch (e) {
        showToast('Error loading details', 'error');
    }
}

// =====================
// PRODUCT CARD
// =====================
function createProductCard(product) {
    const imageUrl = (product.images && product.images.length > 0) ? product.images[0] : '/app-icon.png';
    const rating = product.avgRating || 0;
    const reviewCount = product.reviewCount || 0;
    const storeName = product.merchantName || 'Store';
    
    const discount = product.discountCode ? 
        `<span class="discount-badge">-${product.discountCode.value}${product.discountCode.type==='percentage'?'%':'$'}</span>` : '';
    
    const freeShip = product.freeShipping ? 
        '<div style="font-size:10px;color:var(--green);font-weight:600;">🚚 FREE SHIPPING</div>' : '';
    
    const isTicket = product.isTicket || product.category === 'Tickets & Events';
    
    return `
        <div class="product-card" data-product-id="${product.id}" onclick="openProductDetail('${product.id}')">
            <div style="position:relative;">
                <img src="${imageUrl}" class="product-card-image" onerror="this.src='/app-icon.png'" loading="lazy">
                ${product.sponsored ? '<span style="position:absolute;top:5px;left:5px;background:#FFD700;color:#1a1a1a;padding:2px 6px;border-radius:4px;font-size:9px;font-weight:700;">⭐ Sponsored</span>' : ''}
                ${isTicket ? '<span style="position:absolute;top:5px;right:5px;background:#9C27B0;color:white;padding:2px 6px;border-radius:4px;font-size:9px;">🎫 Ticket</span>' : ''}
            </div>
            <div class="product-card-info">
                <div style="font-size:10px;color:#999;margin-bottom:2px;">${storeName}</div>
                <div class="product-card-name">${product.name || 'Untitled'}</div>
                <div class="product-card-price">${formatCurrency(product.price)} ${discount}</div>
                ${freeShip}
                <div class="product-card-rating">⭐ ${rating.toFixed(1)} (${reviewCount})</div>
                <button class="btn-gold" style="width:100%;margin-top:6px;font-size:11px;padding:7px;" 
                        onclick="event.stopPropagation();addToCartFromCard('${product.id}')">🛒 Add to Cart</button>
            </div>
        </div>`;
}

// =====================
// QUICK ADD TO CART
// =====================
async function addToCartFromCard(productId) {
    try {
        const doc = await db.collection('products').doc(productId).get();
        if (!doc.exists) { showToast('Product not found','error'); return; }
        const p = doc.data();
        const img = (p.images&&p.images[0])||'/app-icon.png';
        let cart = JSON.parse(sessionStorage.getItem('shoplify_cart')||'[]');
        const idx = cart.findIndex(i=>i.productId===productId);
        if(idx>=0){ cart[idx].quantity+=1; }
        else{ cart.push({productId:p.id||productId,name:p.name,price:p.price,image:img,color:null,size:null,quantity:1,merchantId:p.merchantId,isDigital:p.isDigital||false,discountCode:p.discountCode||null,freeShipping:p.freeShipping||false}); }
        sessionStorage.setItem('shoplify_cart',JSON.stringify(cart));
        updateCartBadge();
        showToast('Added to cart! 🛒','success');
    } catch(e){ showToast('Failed','error'); }
}

// =====================
// OPEN PRODUCT DETAIL
// =====================
async function openProductDetail(productId) {
    try {
        const doc = await db.collection('products').doc(productId).get();
        if (doc.exists) navigateTo('product-detail',{productId,product:{id:doc.id,...doc.data()}});
        else showToast('Product not found','error');
    } catch(e){ showToast('Error','error'); }
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
        adminSnap.forEach(doc => {
            messages.push({ text: `📢 ${doc.data().message}`, time: doc.data().createdAt });
        });
        
        const orders = [];
        orderSnap.forEach(doc => orders.push(doc.data()));
        orders.sort((a,b) => (b.createdAt?.toDate?.()||0) - (a.createdAt?.toDate?.()||0));
        
        orders.slice(0, 10).forEach(order => {
            const name = order.userName || order.userEmail?.split('@')[0] || 'Someone';
            const product = order.items?.[0]?.name || 'a product';
            messages.push({ text: `🛒 ${name} purchased "${product}"`, time: order.createdAt });
        });
        
        messages.sort((a,b) => (b.time?.toDate?.()||0) - (a.time?.toDate?.()||0));
        
        if (messages.length === 0) {
            feed.innerHTML = '<span class="live-dot"></span> Live: Marketplace active 🌍';
        } else {
            feed.innerHTML = '<span class="live-dot"></span> ' + messages.slice(0, 15).map(m => m.text).join(' • ');
        }
    } catch (e) {
        feed.innerHTML = '<span class="live-dot"></span> Live: Marketplace active 🌍';
    }
}

// =====================
// AD BANNER
// =====================
async function initializeAdBanner() {
    try {
        const snap = await db.collection('admin_ads').where('active','==',true).get();
        if (!snap.empty) {
            const ad = snap.docs[0].data();
            const banner = document.getElementById('ad-banner');
            const content = document.getElementById('ad-content');
            if (banner && content) {
                content.innerHTML = ad.type === 'video' ? 
                    `<video src="${ad.url}" autoplay muted loop playsinline style="width:100%;max-height:200px;object-fit:cover;"></video>` : 
                    `<img src="${ad.url}" style="width:100%;max-height:200px;object-fit:cover;">`;
                banner.classList.add('active');
            }
        }
    } catch(e) {}
}

function closeAd() {
    const banner = document.getElementById('ad-banner');
    if (banner) banner.classList.remove('active');
}

// =====================
// NOTIFICATION BADGE
// =====================
async function updateNotificationBadge() {
    const badge = document.getElementById('notification-badge');
    if (!badge) return;
    
    const uid = APP.userProfile?.uid || APP.currentUser?.uid;
    if (!uid) { badge.style.display = 'none'; return; }
    
    try {
        const snap = await db.collection('notifications').where('userId','==',uid).get();
        let unread = 0;
        snap.forEach(doc => { if (!doc.data().read) unread++; });
        
        if (unread > 0) {
            badge.textContent = unread > 99 ? '99+' : unread;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    } catch(e) { badge.style.display = 'none'; }
}

// =====================
// BOTTOM NAVIGATION
// =====================
function updateBottomNav() {
    // Remove active from all
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    
    // Show/hide based on user type
    const storeMarketNav = document.getElementById('nav-storemarket');
    const dropshipNav = document.getElementById('nav-dropship');
    const merchantNav = document.getElementById('nav-merchant');
    
    // Store Market is ALWAYS visible
    if (storeMarketNav) storeMarketNav.style.display = 'flex';
    
    // Dropship - only for dropshippers
    if (dropshipNav) {
        dropshipNav.style.display = APP.userProfile?.isDropshipper ? 'flex' : 'none';
    }
    
    // Merchant - only for merchants
    if (merchantNav) {
        merchantNav.style.display = APP.userProfile?.isMerchant ? 'flex' : 'none';
    }
    
    // Highlight current screen
    const hash = window.location.hash.replace('#', '') || 'home';
    const screenMap = {
        'home': 0,
        'marketplace': 1,
        'storemarket': 2,
        'dropship': 3,
        'merchant': 4,
        'orders': 5
    };
    
    const idx = screenMap[hash];
    if (idx !== undefined) {
        const items = document.querySelectorAll('.nav-item');
        if (items[idx]) items[idx].classList.add('active');
    }
}

console.log('✅ home.js fully loaded - Dropshipper Top Earners Only');
