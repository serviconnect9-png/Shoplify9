// dropship.js - PREMIUM STORE VIEW (Complete Shopping Experience)

async function loadPublicDropshipStore(username) {
    console.log('🏪 Loading PREMIUM store for:', username);
    
    const container = document.getElementById('dropship-store-content');
    if (!container) { console.error('❌ Container not found'); return; }
    
    container.innerHTML = `
        <div style="text-align:center;padding:60px;">
            <div class="loader-spinner" style="margin:0 auto 20px;"></div>
            <p style="color:#666;">Loading ${username}'s Store...</p>
        </div>`;
    
    try {
        const userSnap = await db.collection('users').where('username', '==', username).limit(1).get();
        if (userSnap.empty) { container.innerHTML = '<p style="text-align:center;padding:60px;">Store not found</p>'; return; }
        
        const dropshipper = userSnap.docs[0].data();
        const dropshipperId = userSnap.docs[0].id;
        
        const storeName = dropshipper.storeName || username + '\'s Store';
        const storeColor = dropshipper.storeColor || '#667eea';
        const storeBio = dropshipper.storeBio || 'Welcome!';
        const storeLogo = dropshipper.storeLogo || '';
        const storeBanner = dropshipper.storeBanner || '';
        const isVerified = dropshipper.isAppVerified || false;
        
        const isLight = isColorLight(storeColor);
        const textColor = isLight ? '#1a1a1a' : '#ffffff';
        const subColor = isLight ? '#444' : 'rgba(255,255,255,0.8)';
        
        const snap = await db.collection('dropship_products')
            .where('dropshipperId', '==', dropshipperId)
            .where('status', '==', 'active')
            .get();
        
        const products = [];
        snap.forEach(doc => products.push({ id: doc.id, ...doc.data() }));
        
        // Get original product details for colors/sizes
        const productDetails = {};
        for (const p of products) {
            if (p.originalProductId) {
                try {
                    const origDoc = await db.collection('products').doc(p.originalProductId).get();
                    if (origDoc.exists) {
                        productDetails[p.id] = origDoc.data();
                    }
                } catch(e) {}
            }
        }
        
        // Update cart count
        const cart = JSON.parse(sessionStorage.getItem('shoplify_cart') || '[]');
        const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        
        container.innerHTML = `
            <div style="background:#f5f5f5;min-height:100vh;">
                
                <!-- 🔝 TOP NAVIGATION BAR -->
                <div style="position:sticky;top:0;z-index:100;background:white;padding:12px 15px;display:flex;align-items:center;gap:15px;border-bottom:1px solid #f0f0f0;box-shadow:0 1px 3px rgba(0,0,0,0.05);">
                    <button onclick="window.history.back()" style="background:none;border:none;font-size:22px;cursor:pointer;padding:5px;">←</button>
                    <div style="flex:1;font-weight:700;font-size:17px;">${storeName}</div>
                    <button onclick="navigateTo('checkout')" style="background:none;border:none;font-size:22px;cursor:pointer;position:relative;padding:5px;">
                        🛒
                        ${cartCount > 0 ? `<span style="position:absolute;top:-2px;right:-2px;background:#FF4444;color:white;font-size:10px;min-width:18px;height:18px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;">${cartCount}</span>` : ''}
                    </button>
                    ${APP.userProfile ? `
                        <button onclick="navigateTo('profile')" style="background:none;border:none;font-size:22px;cursor:pointer;padding:5px;">👤</button>
                    ` : ''}
                </div>
                
                <!-- 🏪 STORE HEADER -->
                ${storeBanner ? `<img src="${storeBanner}" style="width:100%;height:160px;object-fit:cover;" onerror="this.style.display='none'">` : ''}
                <div style="background:linear-gradient(135deg,${storeColor},${storeColor}dd);padding:25px 20px;text-align:center;">
                    ${storeLogo ? `<img src="${storeLogo}" style="width:70px;height:70px;border-radius:50%;border:3px solid ${textColor};margin-bottom:10px;box-shadow:0 4px 12px rgba(0,0,0,0.2);" onerror="this.style.display='none'">` : ''}
                    <h2 style="margin:0;color:${textColor};font-size:22px;">${storeName}</h2>
                    ${isVerified ? '<span style="background:#20D5EC;color:white;padding:3px 12px;border-radius:12px;font-size:11px;margin-top:8px;display:inline-block;">✓ Verified</span>' : ''}
                    <p style="font-size:14px;margin:8px 0 0;color:${subColor};">${storeBio}</p>
                    <p style="font-size:12px;margin:5px 0 0;color:${subColor};">${products.length} Products</p>
                </div>
                
                <!-- 📱 PRODUCTS GRID -->
                <div style="padding:15px;">
                    ${products.length === 0 ? `
                        <div style="text-align:center;padding:40px;background:white;border-radius:16px;">
                            <p style="font-size:50px;">📦</p>
                            <p style="color:#999;">No products yet</p>
                        </div>
                    ` : `
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                            ${products.map(p => {
                                const img = p.images?.[0] || '/app-icon.png';
                                const details = productDetails[p.id] || {};
                                const hasVariants = (details.colors?.length > 0) || (details.sizes?.length > 0);
                                const profit = (p.price || 0) - (p.minPrice || 0);
                                
                                return `
                                    <div style="background:white;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);cursor:pointer;transition:transform 0.2s;" 
                                         onclick="viewPremiumProductDetail('${p.id}','${p.name.replace(/'/g,"\\'")}','${p.price}','${p.minPrice}','${img}','${p.originalProductId}','${dropshipperId}','${hasVariants}')"
                                         onmouseover="this.style.transform='translateY(-3px)'" 
                                         onmouseout="this.style.transform='translateY(0)'">
                                        
                                        <div style="position:relative;">
                                            <img src="${img}" style="width:100%;height:180px;object-fit:cover;" onerror="this.src='/app-icon.png'" loading="lazy">
                                            ${profit > 0 ? `<span style="position:absolute;top:8px;left:8px;background:#4CAF50;color:white;padding:3px 8px;border-radius:12px;font-size:10px;font-weight:600;">SALE</span>` : ''}
                                            <button onclick="event.stopPropagation();addStoreProductToCartQuick('${p.id}','${p.name.replace(/'/g,"\\'")}','${p.price}','${p.minPrice}','${img}','${p.originalProductId}','${dropshipperId}')" 
                                                    style="position:absolute;bottom:8px;right:8px;width:36px;height:36px;background:#FFD700;border:none;border-radius:50%;font-size:18px;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.2);display:flex;align-items:center;justify-content:center;">
                                                🛒
                                            </button>
                                        </div>
                                        
                                        <div style="padding:12px;">
                                            <div style="font-weight:600;font-size:13px;margin-bottom:4px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${p.name}</div>
                                            <div style="font-weight:800;font-size:18px;color:#1a1a1a;">${formatCurrency(p.price)}</div>
                                            ${p.stock > 0 ? `<div style="font-size:10px;color:#4CAF50;">${p.stock} in stock</div>` : '<div style="font-size:10px;color:#999;">In stock</div>'}
                                            ${hasVariants ? '<div style="font-size:10px;color:#666;margin-top:2px;">🎨 Multiple options</div>' : ''}
                                        </div>
                                    </div>`;
                            }).join('')}
                        </div>
                    `}
                </div>
                
                <!-- ℹ️ STORE INFO -->
                <div style="padding:15px;">
                    <div style="background:white;border-radius:16px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
                        <h4 style="margin-bottom:10px;">📋 Store Information</h4>
                        <p style="font-size:13px;color:#666;">🛡️ All purchases protected by escrow</p>
                        <p style="font-size:13px;color:#666;">🚚 Shipping available worldwide</p>
                        <p style="font-size:13px;color:#666;">💳 Pay securely with Shoplify Wallet</p>
                        ${isVerified ? '<p style="font-size:13px;color:#20D5EC;">✓ Verified Store</p>' : ''}
                    </div>
                </div>
                
                <!-- 📱 BOTTOM BAR -->
                <div style="position:sticky;bottom:0;background:white;padding:12px 15px;border-top:1px solid #f0f0f0;display:flex;gap:10px;box-shadow:0 -1px 3px rgba(0,0,0,0.05);">
                    <button onclick="navigateTo('checkout')" style="flex:1;padding:14px;background:#FFD700;color:#1a1a1a;border:none;border-radius:12px;font-weight:700;font-size:15px;cursor:pointer;">
                        🛒 View Cart (${cartCount})
                    </button>
                    ${APP.userProfile ? `
                        <button onclick="navigateTo('orders')" style="padding:14px 20px;background:white;border:2px solid #e0e0e0;border-radius:12px;font-weight:600;cursor:pointer;">
                            📦 Orders
                        </button>
                    ` : ''}
                </div>
                
                <!-- 🔗 FOOTER -->
                <div style="text-align:center;padding:20px;">
                    <p style="font-size:11px;color:#999;">Powered by ONESHOPLIFY</p>
                    <p style="font-size:10px;color:#ccc;">${window.location.href}</p>
                </div>
            </div>`;
        
    } catch(e) {
        console.error('❌ Store error:', e);
        container.innerHTML = '<p style="text-align:center;padding:60px;">Error loading store</p>';
    }
}

// =====================
// PREMIUM PRODUCT DETAIL MODAL (with size/color selection)
// =====================
async function viewPremiumProductDetail(dropshipProductId, name, price, minPrice, image, originalProductId, dropshipperId, hasVariants) {
    console.log('🔍 Premium product detail:', dropshipProductId);
    
    showLoader();
    
    try {
        // Get original product for variants
        const productDoc = await db.collection('products').doc(originalProductId).get();
        const product = productDoc.exists ? productDoc.data() : null;
        
        // Get reviews
        const reviewsSnap = await db.collection('reviews').where('productId', '==', originalProductId).get();
        const reviews = [];
        reviewsSnap.forEach(d => reviews.push(d.data()));
        reviews.sort((a, b) => (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0));
        
        hideLoader();
        
        // Store current selection
        window._premiumProductSelection = {
            dropshipProductId, name, price: parseFloat(price), minPrice: parseFloat(minPrice),
            image, originalProductId, dropshipperId,
            selectedColor: null,
            selectedSize: null,
            quantity: 1
        };
        
        showModal(`
            <div style="max-height:85vh;overflow-y:auto;padding:0;">
                
                <!-- Product Image -->
                <div style="position:relative;">
                    <img src="${image}" style="width:100%;height:320px;object-fit:cover;" onerror="this.src='/app-icon.png'">
                    <button onclick="hideModal()" style="position:absolute;top:10px;left:10px;width:32px;height:32px;background:rgba(0,0,0,0.5);color:white;border:none;border-radius:50%;font-size:18px;cursor:pointer;">✕</button>
                </div>
                
                <div style="padding:20px;">
                    <!-- Product Name & Price -->
                    <h2 style="font-size:20px;margin-bottom:5px;">${name}</h2>
                    <div style="font-size:26px;font-weight:800;color:#1a1a1a;margin-bottom:5px;">${formatCurrency(price)}</div>
                    ${product?.discountCode ? `
                        <div style="background:#FFF8E1;padding:10px;border-radius:8px;margin:10px 0;text-align:center;">
                            <span style="font-weight:600;">🎫 Use code: ${product.discountCode.code}</span>
                            <span style="color:#f44;"> (-${product.discountCode.value}${product.discountCode.type==='percentage'?'%':'$'})</span>
                        </div>
                    ` : ''}
                    
                    <!-- Color Selection -->
                    ${product?.colors?.length > 0 ? `
                        <div style="margin:15px 0;">
                            <h4 style="margin-bottom:8px;">🎨 Color: <span id="premium-selected-color" style="color:#666;">Select</span></h4>
                            <div style="display:flex;gap:10px;flex-wrap:wrap;">
                                ${product.colors.map(color => `
                                    <div onclick="selectPremiumColor('${color}')" 
                                         id="premium-color-${color}"
                                         style="width:40px;height:40px;border-radius:50%;background:${color.toLowerCase()};border:3px solid #ddd;cursor:pointer;transition:all 0.2s;"
                                         title="${color}"></div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    <!-- Size Selection -->
                    ${product?.sizes?.length > 0 ? `
                        <div style="margin:15px 0;">
                            <h4 style="margin-bottom:8px;">📏 Size: <span id="premium-selected-size" style="color:#666;">Select</span></h4>
                            <div style="display:flex;gap:8px;flex-wrap:wrap;">
                                ${product.sizes.map(size => `
                                    <button onclick="selectPremiumSize('${size}')" 
                                            id="premium-size-${size}"
                                            style="padding:10px 16px;border:2px solid #e0e0e0;border-radius:8px;background:white;cursor:pointer;font-weight:600;transition:all 0.2s;">
                                        ${size}
                                    </button>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    <!-- Quantity -->
                    <div style="margin:15px 0;">
                        <h4 style="margin-bottom:8px;">🔢 Quantity</h4>
                        <div style="display:flex;align-items:center;gap:15px;">
                            <button onclick="changePremiumQuantity(-1)" style="width:36px;height:36px;border:2px solid #e0e0e0;border-radius:50%;background:white;font-size:20px;cursor:pointer;">−</button>
                            <span id="premium-quantity" style="font-size:20px;font-weight:700;min-width:30px;text-align:center;">1</span>
                            <button onclick="changePremiumQuantity(1)" style="width:36px;height:36px;border:2px solid #e0e0e0;border-radius:50%;background:white;font-size:20px;cursor:pointer;">+</button>
                        </div>
                    </div>
                    
                    <!-- Description -->
                    ${product?.description ? `
                        <div style="margin:15px 0;">
                            <h4 style="margin-bottom:5px;">📝 Description</h4>
                            <p style="color:#666;line-height:1.6;font-size:14px;">${product.description}</p>
                        </div>
                    ` : ''}
                    
                    <!-- Add to Cart Button -->
                    <button onclick="addPremiumProductToCart();hideModal();" 
                            style="width:100%;padding:16px;background:linear-gradient(135deg,#FFD700,#FFA000);color:#1a1a1a;border:none;border-radius:12px;font-size:16px;font-weight:700;cursor:pointer;margin-top:15px;">
                        🛒 Add to Cart - ${formatCurrency(price)}
                    </button>
                    
                    <!-- Reviews -->
                    ${reviews.length > 0 ? `
                        <div style="margin-top:20px;">
                            <h4 style="margin-bottom:10px;">⭐ Reviews (${reviews.length})</h4>
                            ${reviews.slice(0,5).map(r => `
                                <div style="padding:12px;background:#fafafa;border-radius:8px;margin-bottom:8px;">
                                    <div style="display:flex;justify-content:space-between;">
                                        <strong style="font-size:13px;">${r.userName||'Customer'}</strong>
                                        <span style="color:#FFD700;">${'★'.repeat(r.rating||5)}</span>
                                    </div>
                                    <p style="font-size:12px;color:#666;margin-top:4px;">${r.comment||''}</p>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `);
        
    } catch(e) {
        hideLoader();
        console.error('Detail error:', e);
        showToast('Error loading details', 'error');
    }
}

function selectPremiumColor(color) {
    window._premiumProductSelection.selectedColor = color;
    document.querySelectorAll('[id^="premium-color-"]').forEach(el => {
        el.style.border = '3px solid #ddd';
    });
    const el = document.getElementById('premium-color-' + color);
    if (el) el.style.border = '3px solid #FFD700';
    const label = document.getElementById('premium-selected-color');
    if (label) label.textContent = color;
}

function selectPremiumSize(size) {
    window._premiumProductSelection.selectedSize = size;
    document.querySelectorAll('[id^="premium-size-"]').forEach(el => {
        el.style.border = '2px solid #e0e0e0';
        el.style.background = 'white';
    });
    const el = document.getElementById('premium-size-' + size);
    if (el) {
        el.style.border = '2px solid #FFD700';
        el.style.background = '#FFFDE7';
    }
    const label = document.getElementById('premium-selected-size');
    if (label) label.textContent = size;
}

function changePremiumQuantity(delta) {
    const sel = window._premiumProductSelection;
    if (!sel) return;
    sel.quantity = Math.max(1, Math.min(sel.quantity + delta, 99));
    const display = document.getElementById('premium-quantity');
    if (display) display.textContent = sel.quantity;
}

function addPremiumProductToCart() {
    const sel = window._premiumProductSelection;
    if (!sel) return;
    
    let cart = JSON.parse(sessionStorage.getItem('shoplify_cart') || '[]');
    
    cart.push({
        productId: sel.originalProductId,
        dropshipProductId: sel.dropshipProductId,
        dropshipperId: sel.dropshipperId,
        name: sel.name,
        price: sel.price,
        minPrice: sel.minPrice,
        image: sel.image,
        color: sel.selectedColor,
        size: sel.selectedSize,
        quantity: sel.quantity,
        merchantId: sel.dropshipperId,
        isDropship: true,
        isDigital: false,
        discountCode: null,
        freeShipping: false
    });
    
    sessionStorage.setItem('shoplify_cart', JSON.stringify(cart));
    if (typeof updateCartBadge === 'function') updateCartBadge();
    showToast('Added to cart! 🛒', 'success');
    
    // Reload store to update cart count
    setTimeout(() => {
        const username = sessionStorage.getItem('store_view');
        if (username) loadPublicDropshipStore(username);
    }, 300);
}

// Quick add to cart (no variants)
function addStoreProductToCartQuick(productId, name, price, minPrice, image, originalProductId, dropshipperId) {
    let cart = JSON.parse(sessionStorage.getItem('shoplify_cart') || '[]');
    
    const existingIndex = cart.findIndex(item => item.dropshipProductId === productId && !item.color && !item.size);
    
    if (existingIndex >= 0) {
        cart[existingIndex].quantity += 1;
    } else {
        cart.push({
            productId: originalProductId,
            dropshipProductId: productId,
            dropshipperId: dropshipperId,
            name, price: parseFloat(price), minPrice: parseFloat(minPrice),
            image, color: null, size: null, quantity: 1,
            merchantId: dropshipperId,
            isDropship: true, isDigital: false,
            discountCode: null, freeShipping: false
        });
    }
    
    sessionStorage.setItem('shoplify_cart', JSON.stringify(cart));
    if (typeof updateCartBadge === 'function') updateCartBadge();
    showToast('Added to cart! 🛒', 'success');
}

// Add this to the store HTML - Customer Profile/Wallet access
function addStoreWalletAccess() {
    if (!APP.userProfile) return;
    
    // Add wallet info bar at top of store for logged-in users
    const walletBar = document.createElement('div');
    walletBar.style.cssText = 'background:#FFF8E1;padding:8px 15px;display:flex;justify-content:space-between;align-items:center;font-size:13px;';
    walletBar.innerHTML = `
        <span>💰 Balance: <strong>${formatCurrency(APP.userProfile.walletBalance || 0)}</strong></span>
        <button onclick="navigateTo('wallet')" style="padding:6px 12px;background:#FFD700;border:none;border-radius:6px;font-weight:600;font-size:11px;cursor:pointer;">Deposit</button>
    `;
    
    const storeContent = document.querySelector('.dropship-store-content');
    if (storeContent && storeContent.firstChild) {
        storeContent.insertBefore(walletBar, storeContent.firstChild);
    }
}

console.log('✅ Premium dropship store loaded');
