// storeowner.js - COMPLETE STORE OWNER SYSTEM (Independent Shops, Alibaba-style)
console.log('✅ storeowner.js loaded - Store Market System');

// =====================
// STORE MARKET - Browse All Stores
// =====================
async function loadStoreMarket() {
    console.log('🏪 Loading Store Market...');
    
    const container = document.getElementById('storemarket-content');
    if (!container) return;
    
    container.innerHTML = '<div style="text-align:center;padding:60px;"><div class="loader-spinner"></div><p>Loading stores...</p></div>';
    
    try {
        const snapshot = await db.collection('users')
            .where('hasStore', '==', true)
            .where('storeActive', '==', true)
            .get();
        
        if (snapshot.empty) {
            container.innerHTML = `
                <div style="text-align:center;padding:60px;">
                    <p style="font-size:50px;">🏪</p>
                    <h3>No Stores Yet</h3>
                    <p style="color:#666;">Be the first to open a store!</p>
                    <button class="btn-gold" onclick="navigateTo('profile')">Open Your Store</button>
                </div>`;
            return;
        }
        
        const stores = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            stores.push({
                id: doc.id,
                username: data.username,
                storeName: data.storeName || data.username + "'s Store",
                storeLogo: data.storeLogo || '/app-icon.png',
                storeBanner: data.storeBanner || '',
                storeCategory: data.storeCategory || 'General',
                storeColor: data.storeColor || '#667eea',
                storeDescription: data.storeDescription || '',
                storeVerified: data.isAppVerified || false,
                totalProducts: data.totalProducts || 0,
                countryFlag: data.countryFlag || '🌍'
            });
        });
        
        container.innerHTML = `
            <div style="padding:15px;">
                <div style="margin-bottom:15px;">
                    <input type="text" id="store-search" class="input-field" placeholder="Search stores..." 
                           oninput="searchStores()" style="background:#f5f5f5;border-radius:25px;padding:12px 20px;">
                </div>
                
                <div style="display:flex;gap:8px;overflow-x:auto;margin-bottom:15px;padding-bottom:5px;" id="store-categories">
                    <span class="category-chip active" onclick="filterStores('all')">All</span>
                    <span class="category-chip" onclick="filterStores('Fashion')">Fashion</span>
                    <span class="category-chip" onclick="filterStores('Electronics')">Electronics</span>
                    <span class="category-chip" onclick="filterStores('Tickets & Events')">Tickets</span>
                    <span class="category-chip" onclick="filterStores('All Purpose')">General</span>
                </div>
                
                <div id="stores-grid">
                    ${stores.map(store => `
                        <div class="store-card" data-category="${store.storeCategory}" data-name="${store.storeName.toLowerCase()} ${store.username.toLowerCase()}"
                             onclick="openStoreShop('${store.username}')"
                             style="background:white;border-radius:16px;overflow:hidden;margin-bottom:15px;box-shadow:0 2px 12px rgba(0,0,0,0.06);cursor:pointer;transition:transform 0.2s;">
                            
                            ${store.storeBanner ? `
                                <div style="height:120px;background-image:url(${store.storeBanner});background-size:cover;background-position:center;"></div>
                            ` : `
                                <div style="height:120px;background:linear-gradient(135deg,${store.storeColor},#764ba2);"></div>
                            `}
                            
                            <div style="padding:15px;display:flex;gap:12px;align-items:center;">
                                <img src="${store.storeLogo}" style="width:55px;height:55px;border-radius:14px;object-fit:cover;margin-top:-40px;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.1);" onerror="this.src='/app-icon.png'">
                                <div style="flex:1;">
                                    <div style="display:flex;align-items:center;gap:5px;">
                                        <h4 style="margin:0;font-size:15px;">${store.storeName}</h4>
                                        ${store.storeVerified ? '<span style="color:#20D5EC;">✓</span>' : ''}
                                    </div>
                                    <p style="font-size:12px;color:#666;margin:2px 0;">${store.storeCategory} · ${store.countryFlag}</p>
                                    <p style="font-size:11px;color:#999;">${store.totalProducts} products</p>
                                </div>
                                <button class="btn-gold btn-small" style="padding:8px 14px;">Visit →</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>`;
        
    } catch (e) {
        console.error('Store market error:', e);
        container.innerHTML = '<p style="text-align:center;padding:60px;">Error loading stores</p>';
    }
}

function searchStores() {
    const query = document.getElementById('store-search')?.value?.toLowerCase() || '';
    const cards = document.querySelectorAll('.store-card');
    cards.forEach(card => {
        const name = card.dataset.name || '';
        card.style.display = name.includes(query) ? '' : 'none';
    });
}

function filterStores(category) {
    document.querySelectorAll('#store-categories .category-chip').forEach(c => c.classList.remove('active'));
    event.target.classList.add('active');
    
    const cards = document.querySelectorAll('.store-card');
    cards.forEach(card => {
        if (category === 'all') {
            card.style.display = '';
        } else {
            card.style.display = card.dataset.category === category ? '' : 'none';
        }
    });
}

// =====================
// STORE SHOP VIEW (Alibaba-style Customer View)
// =====================
async function openStoreShop(username) {
    console.log('🏪 Opening shop:', username);
    
    navigateTo('store-shop');
    
    const container = document.getElementById('store-shop-content');
    if (!container) return;
    
    container.innerHTML = '<div style="text-align:center;padding:60px;"><div class="loader-spinner"></div><p>Loading shop...</p></div>';
    
    try {
        const userSnap = await db.collection('users').where('username', '==', username).limit(1).get();
        if (userSnap.empty) {
            container.innerHTML = '<p style="text-align:center;padding:60px;">Store not found</p>';
            return;
        }
        
        const store = userSnap.docs[0].data();
        const storeId = userSnap.docs[0].id;
        
        // Get store products
        const productsSnap = await db.collection('products')
            .where('merchantId', '==', storeId)
            .where('status', '==', 'active')
            .get();
        
        const products = [];
        productsSnap.forEach(doc => products.push({ id: doc.id, ...doc.data() }));
        
        const cart = JSON.parse(sessionStorage.getItem('shoplify_cart') || '[]');
        const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        
        const isLight = isColorLight(store.storeColor || '#667eea');
        const textColor = isLight ? '#1a1a1a' : '#ffffff';
        const subColor = isLight ? '#444' : 'rgba(255,255,255,0.8)';
        
        container.innerHTML = `
            <div style="background:#f5f5f5;min-height:100vh;">
                
                <!-- ALIBABA-STYLE TOP BAR -->
                <div style="position:sticky;top:0;z-index:100;background:white;padding:8px 15px;display:flex;align-items:center;gap:10px;border-bottom:1px solid #f0f0f0;">
                    <button onclick="navigateTo('storemarket')" style="background:none;border:none;font-size:20px;cursor:pointer;">←</button>
                    <div style="flex:1;display:flex;align-items:center;gap:8px;">
                        <img src="${store.storeLogo || '/app-icon.png'}" style="width:28px;height:28px;border-radius:6px;">
                        <span style="font-weight:700;font-size:15px;">${store.storeName || 'Store'}</span>
                    </div>
                    <button onclick="navigateTo('checkout')" style="background:none;border:none;font-size:22px;cursor:pointer;position:relative;">
                        🛒
                        ${cartCount > 0 ? `<span style="position:absolute;top:-3px;right:-3px;background:#FF4444;color:white;font-size:10px;min-width:18px;height:18px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;">${cartCount}</span>` : ''}
                    </button>
                    <button onclick="openShopProfile('${username}')" style="background:none;border:none;font-size:22px;cursor:pointer;">👤</button>
                </div>
                
                <!-- STORE HEADER -->
                ${store.storeBanner ? `<img src="${store.storeBanner}" style="width:100%;height:150px;object-fit:cover;">` : ''}
                <div style="background:linear-gradient(135deg,${store.storeColor || '#667eea'},#764ba2);padding:20px;text-align:center;color:${textColor};">
                    <img src="${store.storeLogo || '/app-icon.png'}" style="width:60px;height:60px;border-radius:16px;border:3px solid white;margin-bottom:8px;box-shadow:0 4px 12px rgba(0,0,0,0.2);">
                    <h2 style="margin:0;font-size:20px;">${store.storeName || 'Store'}</h2>
                    ${store.storeVerified ? '<span style="background:#20D5EC;color:white;padding:3px 10px;border-radius:10px;font-size:10px;margin-top:4px;display:inline-block;">✓ Verified</span>' : ''}
                    <p style="font-size:13px;margin:4px 0 0;color:${subColor};">${store.storeDescription || ''}</p>
                    <p style="font-size:11px;color:${subColor};">${products.length} Products · ${store.storeCategory || 'Store'}</p>
                </div>
                
                <!-- SEARCH WITHIN STORE -->
                <div style="padding:10px 15px;background:white;">
                    <input type="text" id="shop-search" class="input-field" placeholder="Search in this store..." 
                           oninput="searchShopProducts()" style="background:#f5f5f5;border-radius:20px;padding:10px 16px;font-size:13px;">
                </div>
                
                <!-- PRODUCTS GRID - ALIBABA STYLE -->
                <div style="padding:10px;">
                    ${products.length === 0 ? '<p style="text-align:center;padding:40px;color:#999;">No products yet</p>' : `
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;" id="shop-products-grid">
                            ${products.map(p => {
                                const img = p.images?.[0] || '/app-icon.png';
                                const isTicket = p.isTicket || p.category === 'Tickets & Events';
                                const discount = p.discountCode ? 
                                    `<span style="background:#FF4444;color:white;padding:2px 6px;border-radius:8px;font-size:9px;">-${p.discountCode.value}${p.discountCode.type==='percentage'?'%':'$'}</span>` : '';
                                
                                return `
                                    <div class="shop-product-card" data-name="${p.name.toLowerCase()}"
                                         onclick="viewShopProduct('${p.id}','${storeId}')"
                                         style="background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.04);cursor:pointer;transition:transform 0.2s;">
                                        <div style="position:relative;">
                                            <img src="${img}" style="width:100%;height:160px;object-fit:cover;" onerror="this.src='/app-icon.png'" loading="lazy">
                                            ${discount ? `<span style="position:absolute;top:6px;left:6px;">${discount}</span>` : ''}
                                            ${isTicket ? '<span style="position:absolute;top:6px;right:6px;background:#9C27B0;color:white;padding:2px 6px;border-radius:6px;font-size:9px;">🎫</span>' : ''}
                                            ${p.sponsored ? '<span style="position:absolute;bottom:6px;left:6px;background:#FFD700;color:#1a1a1a;padding:2px 6px;border-radius:6px;font-size:9px;">⭐</span>' : ''}
                                        </div>
                                        <div style="padding:10px;">
                                            <div style="font-weight:600;font-size:12px;margin-bottom:4px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${p.name}</div>
                                            <div style="display:flex;justify-content:space-between;align-items:center;">
                                                <div style="font-weight:800;font-size:16px;color:#e44;">${formatCurrency(p.price)}</div>
                                                <div style="font-size:10px;color:#999;">${p.totalSales||0} sold</div>
                                            </div>
                                            ${p.stock > 0 ? `<div style="font-size:10px;color:#4CAF50;">${p.stock} available</div>` : ''}
                                        </div>
                                    </div>`;
                            }).join('')}
                        </div>
                    `}
                </div>
                
                <!-- FOOTER -->
                <div style="text-align:center;padding:20px;">
                    <p style="font-size:10px;color:#999;">${username}.oneshoplify.com · Powered by ONESHOPLIFY</p>
                </div>
            </div>`;
        
    } catch (e) {
        console.error('Shop error:', e);
        container.innerHTML = '<p style="text-align:center;padding:60px;">Error loading shop</p>';
    }
}

function searchShopProducts() {
    const query = document.getElementById('shop-search')?.value?.toLowerCase() || '';
    const cards = document.querySelectorAll('.shop-product-card');
    cards.forEach(card => {
        const name = card.dataset.name || '';
        card.style.display = name.includes(query) ? '' : 'none';
    });
}

// =====================
// VIEW SHOP PRODUCT DETAIL
// =====================
async function viewShopProduct(productId, storeId) {
    showLoader();
    try {
        const doc = await db.collection('products').doc(productId).get();
        if (!doc.exists) { hideLoader(); showToast('Product not found','error'); return; }
        
        const product = doc.data();
        const isTicket = product.isTicket || product.category === 'Tickets & Events';
        
        // Get reviews
        const reviewsSnap = await db.collection('reviews').where('productId','==',productId).get();
        const reviews = [];
        reviewsSnap.forEach(d => reviews.push(d.data()));
        reviews.sort((a,b) => (b.createdAt?.toDate?.()||0) - (a.createdAt?.toDate?.()||0));
        
        hideLoader();
        
        showModal(`
            <div style="max-height:85vh;overflow-y:auto;padding:0;">
                <div style="position:relative;">
                    <img src="${product.images?.[0] || '/app-icon.png'}" style="width:100%;height:320px;object-fit:cover;">
                    <button onclick="hideModal()" style="position:absolute;top:10px;left:10px;width:32px;height:32px;background:rgba(0,0,0,0.5);color:white;border:none;border-radius:50%;font-size:18px;cursor:pointer;">✕</button>
                </div>
                
                <div style="padding:20px;">
                    <h2 style="font-size:20px;margin-bottom:5px;">${product.name}</h2>
                    <div style="font-size:28px;font-weight:800;color:#e44;margin-bottom:10px;">${formatCurrency(product.price)}</div>
                    
                    ${product.discountCode ? `
                        <div style="background:#FFF8E1;padding:10px;border-radius:8px;margin:10px 0;text-align:center;">
                            🎫 Use code: <strong>${product.discountCode.code}</strong> (-${product.discountCode.value}${product.discountCode.type==='percentage'?'%':'$'})
                        </div>
                    ` : ''}
                    
                    <div style="margin:10px 0;font-size:13px;color:#666;">
                        <span>📦 ${product.totalSales||0} sold</span>
                        <span style="margin-left:15px;">⭐ ${product.avgRating?.toFixed(1)||'0.0'} (${product.reviewCount||0})</span>
                        ${product.stock > 0 ? `<span style="margin-left:15px;">📋 ${product.stock} in stock</span>` : ''}
                    </div>
                    
                    ${isTicket && product.ticketData ? `
                        <div style="background:#f0f0ff;padding:12px;border-radius:8px;margin:10px 0;">
                            <p><strong>🎫 Event Details:</strong></p>
                            <p style="font-size:12px;">📅 ${product.ticketData.eventDate} at ${product.ticketData.eventTime}</p>
                            <p style="font-size:12px;">📍 ${product.ticketData.address}, ${product.ticketData.country}</p>
                            <p style="font-size:12px;">🎟️ ${product.ticketData.remainingQuantity} tickets left</p>
                        </div>
                    ` : ''}
                    
                    ${product.colors?.length ? `<p><strong>Colors:</strong> ${product.colors.join(', ')}</p>` : ''}
                    ${product.sizes?.length ? `<p><strong>Sizes:</strong> ${product.sizes.join(', ')}</p>` : ''}
                    
                    <p style="color:#666;line-height:1.6;margin:10px 0;">${product.description || 'No description'}</p>
                    
                    <button class="btn-gold btn-full" style="padding:16px;font-size:16px;margin-top:15px;" 
                            onclick="addShopProductToCart('${product.id}','${product.name.replace(/'/g,"\\'")}','${product.price}','${product.images?.[0]||'/app-icon.png'}','${storeId}');hideModal();">
                        🛒 Add to Cart - ${formatCurrency(product.price)}
                    </button>
                    
                    ${reviews.length > 0 ? `
                        <div style="margin-top:20px;">
                            <h4>📝 Reviews (${reviews.length})</h4>
                            ${reviews.slice(0,5).map(r => `
                                <div style="padding:10px;background:#fafafa;border-radius:8px;margin-bottom:6px;">
                                    <div style="display:flex;justify-content:space-between;">
                                        <strong>${r.userName||'Customer'}</strong>
                                        <span style="color:#FFD700;">${'★'.repeat(r.rating||5)}</span>
                                    </div>
                                    <p style="font-size:12px;color:#666;">${r.comment||''}</p>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `);
    } catch(e) { hideLoader(); showToast('Error','error'); }
}

function addShopProductToCart(productId, name, price, image, storeId) {
    let cart = JSON.parse(sessionStorage.getItem('shoplify_cart') || '[]');
    const existing = cart.findIndex(i => i.productId === productId);
    if (existing >= 0) {
        cart[existing].quantity += 1;
    } else {
        cart.push({
            productId, name, price: parseFloat(price), image,
            merchantId: storeId, quantity: 1, isStoreProduct: true
        });
    }
    sessionStorage.setItem('shoplify_cart', JSON.stringify(cart));
    if (typeof updateCartBadge === 'function') updateCartBadge();
    showToast('Added to cart! 🛒', 'success');
}

// =====================
// SHOP PROFILE (Customer Dashboard in Shop)
// =====================
function openShopProfile(username) {
    if (!APP.userProfile) {
        showToast('Please sign in', 'info');
        signInWithGoogle();
        return;
    }
    
    showModal(`
        <div style="max-height:85vh;overflow-y:auto;padding:0;">
            <div style="background:linear-gradient(135deg,#667eea,#764ba2);padding:20px;text-align:center;color:white;">
                <img src="${APP.userProfile.photoURL||'/app-icon.png'}" style="width:50px;height:50px;border-radius:50%;border:2px solid white;margin-bottom:8px;">
                <h3>${APP.userProfile.displayName||APP.userProfile.username}</h3>
                <p style="opacity:0.8;">Shopping at ${username}'s store</p>
            </div>
            <div style="padding:15px;">
                <div style="background:#f5f5f5;padding:15px;border-radius:10px;margin-bottom:10px;text-align:center;">
                    <p style="font-size:12px;">Wallet Balance</p>
                    <p style="font-size:28px;font-weight:800;">${formatCurrency(APP.userProfile.walletBalance||0)}</p>
                    <button class="btn-gold btn-small" onclick="hideModal();navigateTo('wallet');">💰 Deposit</button>
                </div>
                <button class="menu-item" onclick="hideModal();navigateTo('orders');">📦 My Orders</button>
                <button class="menu-item" onclick="hideModal();navigateTo('settings');">⚙️ Settings</button>
                <button class="menu-item" onclick="hideModal();navigateTo('customerservice');">🎧 Support</button>
            </div>
        </div>
    `);
}

// =====================
// STORE OWNER DASHBOARD
// =====================
async function loadStoreOwnerDashboard() {
    console.log('📊 Loading store owner dashboard...');
    
    const container = document.getElementById('storeowner-content');
    if (!container) return;
    
    container.innerHTML = '<div style="text-align:center;padding:60px;"><div class="loader-spinner"></div><p>Loading...</p></div>';
    
    if (!APP.userProfile || !APP.userProfile.hasStore) {
        container.innerHTML = `
            <div style="text-align:center;padding:60px;">
                <p style="font-size:50px;">🏪</p>
                <h3>No Store Found</h3>
                <p style="color:#666;">Create your store first</p>
                <button class="btn-gold" onclick="showStorePlans()">Create Store</button>
            </div>`;
        return;
    }
    
    const storeName = APP.userProfile.storeName || 'My Store';
    const storeUrl = `https://${APP.userProfile.username}.oneshoplify.com`;
    const storeColor = APP.userProfile.storeColor || '#667eea';
    const isLight = isColorLight(storeColor);
    const textColor = isLight ? '#1a1a1a' : '#ffffff';
    
    // Get stats
    let totalProducts = 0, totalSales = 0, totalRevenue = 0;
    try {
        const prodSnap = await db.collection('products').where('merchantId','==',APP.userProfile.uid).get();
        totalProducts = prodSnap.size;
        
        const orderSnap = await db.collection('orders').where('merchantId','==',APP.userProfile.uid).get();
        orderSnap.forEach(doc => {
            const o = doc.data();
            if (o.status === 'completed') {
                totalSales++;
                totalRevenue += o.total || 0;
            }
        });
    } catch(e) {}
    
    container.innerHTML = `
        <div style="padding:15px;padding-bottom:30px;">
            
            <!-- Store Header -->
            <div style="text-align:center;padding:25px;background:linear-gradient(135deg,${storeColor},#764ba2);border-radius:16px;color:${textColor};margin-bottom:15px;box-shadow:0 4px 16px rgba(0,0,0,0.15);">
                ${APP.userProfile.storeLogo ? `<img src="${APP.userProfile.storeLogo}" style="width:60px;height:60px;border-radius:16px;border:3px solid white;margin-bottom:10px;">` : ''}
                <h2>${storeName}</h2>
                <p style="opacity:0.8;">${APP.userProfile.storeCategory || 'Store'}</p>
            </div>
            
            <!-- Stats -->
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:15px;">
                <div class="stat-card"><div class="stat-value">${totalProducts}</div><div class="stat-label">Products</div></div>
                <div class="stat-card"><div class="stat-value">${totalSales}</div><div class="stat-label">Sales</div></div>
                <div class="stat-card"><div class="stat-value">${formatCurrency(totalRevenue)}</div><div class="stat-label">Revenue</div></div>
            </div>
            
            <!-- Quick Actions -->
            <button class="btn-gold btn-full" style="margin-bottom:8px;" onclick="navigateTo('add-product')">➕ Add Product</button>
            <button class="btn-outline btn-full" style="margin-bottom:8px;" onclick="addTicketProduct()">🎫 Add Ticket/Event</button>
            <button class="btn-outline btn-full" style="margin-bottom:8px;" onclick="openStoreShop('${APP.userProfile.username}')">👁️ View My Shop</button>
            <button class="btn-outline btn-full" style="margin-bottom:8px;" onclick="navigateTo('orders')">📦 Orders</button>
            <button class="btn-outline btn-full" style="margin-bottom:8px;" onclick="storeOwnerSettings()">⚙️ Store Settings</button>
            <button class="btn-outline btn-full" style="margin-bottom:8px;" onclick="loadStoreAnalytics()">📊 Analytics</button>
            
            <!-- Store URL -->
            <div style="background:white;padding:15px;border-radius:12px;margin:10px 0;">
                <p style="font-weight:600;">🔗 Your Store URL:</p>
                <div style="font-family:monospace;font-size:12px;background:#f5f5f5;padding:10px;border-radius:6px;">${storeUrl}</div>
                <p style="font-size:11px;color:#999;">Also: ${APP.baseUrl}/store/${APP.userProfile.username}</p>
                <button class="copy-btn" onclick="copyToClipboard('${storeUrl}')">📋 Copy</button>
            </div>
            
            <!-- Sponsorship -->
            <div style="background:#FFF8E1;padding:14px;border-radius:10px;text-align:center;margin-bottom:10px;">
                <p style="font-weight:600;">⭐ Sponsor Products</p>
                <p style="font-size:12px;">$10/month per product - Featured on homepage</p>
                <button class="btn-small btn-outline" onclick="sponsorStoreProduct()">Promote</button>
            </div>
            
            <!-- Store Status -->
            <div style="background:#E8F5E9;padding:12px;border-radius:10px;text-align:center;">
                <p>✅ Store Active · ${APP.userProfile.storePlan || 'Active'} Plan</p>
                ${APP.userProfile.storeExpiry ? `<p style="font-size:11px;">Expires: ${new Date(APP.userProfile.storeExpiry.seconds*1000).toLocaleDateString()}</p>` : ''}
                <button class="btn-small btn-outline" onclick="showStorePlans()">Renew</button>
            </div>
        </div>`;
}

// =====================
// STORE ANALYTICS WITH DOUGHNUT CHART
// =====================
async function loadStoreAnalytics() {
    showModal(`
        <div style="padding:15px;max-height:80vh;overflow-y:auto;">
            <h3>📊 Store Analytics</h3>
            
            <div class="affiliate-stats">
                <div class="stat-card"><div class="stat-value" id="sa-total-sales">-</div><div class="stat-label">Total Sales</div></div>
                <div class="stat-card"><div class="stat-value" id="sa-revenue">-</div><div class="stat-label">Revenue</div></div>
                <div class="stat-card"><div class="stat-value" id="sa-visitors">-</div><div class="stat-label">Visitors</div></div>
                <div class="stat-card"><div class="stat-value" id="sa-conversion">-</div><div class="stat-label">Conversion</div></div>
            </div>
            
            <div style="background:white;border-radius:12px;padding:15px;margin:15px 0;">
                <h4>📈 Sales Overview</h4>
                <div style="height:200px;"><canvas id="salesChart"></canvas></div>
            </div>
            
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                <div style="background:white;border-radius:12px;padding:15px;">
                    <h4 style="font-size:13px;">🍩 Products</h4>
                    <div style="height:180px;"><canvas id="productDoughnut"></canvas></div>
                </div>
                <div style="background:white;border-radius:12px;padding:15px;">
                    <h4 style="font-size:13px;">🌍 Countries</h4>
                    <div style="height:180px;"><canvas id="countryDoughnut"></canvas></div>
                </div>
            </div>
            
            <button class="btn-gold btn-full" style="margin-top:15px;" onclick="hideModal()">Close</button>
        </div>
    `);
    
    setTimeout(() => loadAnalyticsCharts(), 500);
}

async function loadAnalyticsCharts() {
    if (typeof Chart === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
        script.onload = () => renderCharts();
        document.head.appendChild(script);
    } else {
        renderCharts();
    }
}

async function renderCharts() {
    try {
        const ordersSnap = await db.collection('orders').where('merchantId','==',APP.userProfile.uid).get();
        
        // Sales chart data
        const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
        const salesData = [0,0,0,0,0,0,0];
        const revenueData = [0,0,0,0,0,0,0];
        const productSales = {};
        const countrySales = {};
        let totalSales = 0, totalRevenue = 0;
        
        ordersSnap.forEach(doc => {
            const o = doc.data();
            if (o.status === 'completed') {
                totalSales++;
                totalRevenue += o.total || 0;
                const date = o.createdAt?.toDate?.() || new Date();
                const dayIdx = (date.getDay() + 6) % 7;
                salesData[dayIdx]++;
                revenueData[dayIdx] += o.total || 0;
                
                const pName = o.items?.[0]?.name || 'Unknown';
                productSales[pName] = (productSales[pName] || 0) + 1;
                
                const country = o.shipping?.country || 'Unknown';
                countrySales[country] = (countrySales[country] || 0) + (o.total || 0);
            }
        });
        
        document.getElementById('sa-total-sales').textContent = totalSales;
        document.getElementById('sa-revenue').textContent = formatCurrency(totalRevenue);
        
        // Sales Line Chart
        const ctx1 = document.getElementById('salesChart');
        if (ctx1 && typeof Chart !== 'undefined') {
            new Chart(ctx1, {
                type: 'line',
                data: {
                    labels: days,
                    datasets: [
                        { label: 'Sales', data: salesData, borderColor: '#FFD700', tension: 0.3, borderWidth: 2 },
                        { label: 'Revenue', data: revenueData, borderColor: '#00C851', tension: 0.3, borderWidth: 2 }
                    ]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        }
        
        // Product Doughnut Chart
        const ctx2 = document.getElementById('productDoughnut');
        if (ctx2 && typeof Chart !== 'undefined') {
            const pLabels = Object.keys(productSales).slice(0, 5);
            const pData = pLabels.map(l => productSales[l]);
            new Chart(ctx2, {
                type: 'doughnut',
                data: {
                    labels: pLabels.length > 0 ? pLabels : ['No sales'],
                    datasets: [{ data: pData.length > 0 ? pData : [1], backgroundColor: ['#FFD700','#00C851','#33B5E5','#FF8800','#7C3AED'] }]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { fontSize: 10 } } } }
            });
        }
        
        // Country Doughnut Chart
        const ctx3 = document.getElementById('countryDoughnut');
        if (ctx3 && typeof Chart !== 'undefined') {
            const cLabels = Object.keys(countrySales).slice(0, 5);
            const cData = cLabels.map(l => countrySales[l]);
            new Chart(ctx3, {
                type: 'doughnut',
                data: {
                    labels: cLabels.length > 0 ? cLabels : ['No sales'],
                    datasets: [{ data: cData.length > 0 ? cData : [1], backgroundColor: ['#FFD700','#00C851','#33B5E5','#FF8800','#7C3AED'] }]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { fontSize: 10 } } } }
            });
        }
        
    } catch(e) { console.error('Chart error:', e); }
}

function isColorLight(hex) {
    if (!hex) return false;
    const c = hex.replace('#','');
    const r = parseInt(c.substring(0,2),16), g = parseInt(c.substring(2,4),16), b = parseInt(c.substring(4,6),16);
    return (r*299+g*587+b*114)/1000 > 150;
}

// Global access
window.loadStoreMarket = loadStoreMarket;
window.openStoreShop = openStoreShop;
window.viewShopProduct = viewShopProduct;
window.loadStoreOwnerDashboard = loadStoreOwnerDashboard;

console.log('✅ storeowner.js fully loaded - Store Market System Ready');
