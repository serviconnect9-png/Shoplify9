// products.js - COMPLETE FINAL VERSION (Professional Grid, Category Toggle, Reviews, Dropship Import, Product Owner Tools, Discount Limits)

let currentProduct = null;
let selectedColor = null;
let selectedSize = null;
let productQuantity = 1;

// =====================
// MARKETPLACE - Category toggle always works
// =====================
async function loadMarketplace(category = null) {
    const container = document.getElementById('all-products');
    const filtersContainer = document.getElementById('category-filters');
    
    if (!container) return;
    
    container.innerHTML = '<p style="text-align:center;padding:40px;">Loading products...</p>';
    
    // Category filters - "All" clears the filter
    if (filtersContainer) {
        filtersContainer.innerHTML = APP.categories.map(cat => 
            `<span class="category-chip ${(category === cat || (!category && cat === 'All')) ? 'active' : ''}" 
                  onclick="loadMarketplace('${cat === 'All' ? null : cat}')">${cat}</span>`
        ).join('');
    }
    
    try {
        // Always fetch ALL active products
        const snapshot = await db.collection('products')
            .where('status', '==', 'active')
            .get();
        
        if (snapshot.empty) {
            container.innerHTML = `
                <div style="text-align:center;padding:60px 20px;">
                    <p style="font-size:50px;">🛍️</p>
                    <h3>No Products Yet</h3>
                    <p style="color:#666;">Check back soon!</p>
                </div>`;
            return;
        }
        
        // Filter by category client-side (or show all if no category)
        const products = [];
        snapshot.forEach(doc => {
            const product = { id: doc.id, ...doc.data() };
            // If no category selected OR category is 'All' OR product matches category
            if (!category || category === 'All' || product.category === category) {
                products.push(product);
            }
        });
        
        // Sort by newest
        products.sort((a, b) => {
            const timeA = a.createdAt?.toDate?.() || a.createdAt || 0;
            const timeB = b.createdAt?.toDate?.() || b.createdAt || 0;
            return timeB - timeA;
        });
        
        if (products.length === 0) {
            container.innerHTML = `
                <div style="text-align:center;padding:40px;">
                    <p style="color:#999;">No products in "${category}"</p>
                    <button class="btn-outline" onclick="loadMarketplace(null)" style="margin-top:10px;">Show All Products</button>
                </div>`;
            return;
        }
        
        // Professional grid
        container.innerHTML = '<div class="products-grid-full">';
        products.slice(0, 50).forEach(product => {
            container.innerHTML += createProductCard(product);
        });
        container.innerHTML += '</div>';
        
    } catch (error) {
        console.error('Products error:', error);
        container.innerHTML = `
            <div style="text-align:center;padding:40px;">
                <p>Unable to load products</p>
                <button class="btn-outline" onclick="loadMarketplace()" style="margin-top:15px;">Retry</button>
            </div>`;
    }
}

// =====================
// PROFESSIONAL PRODUCT CARD
// =====================
function createProductCard(product) {
    const imageUrl = (product.images && product.images.length > 0) ? product.images[0] : '/app-icon.png';
    const rating = product.avgRating || 0;
    const reviewCount = product.reviewCount || 0;
    const storeName = product.merchantName || 'Store';
    
    // Discount display with limit check
    let discountHTML = '';
    if (product.discountCode) {
        const isActive = product.discountCode.active !== false;
        const limitReached = product.discountCode.maxUses && (product.discountCode.usedCount || 0) >= product.discountCode.maxUses;
        if (isActive && !limitReached) {
            discountHTML = `<span class="discount-badge">-${product.discountCode.value}${product.discountCode.type==='percentage'?'%':'$'}</span>`;
        }
    }
    
    const freeShip = product.freeShipping ? 
        '<div style="font-size:10px;color:var(--green);font-weight:600;">🚚 FREE SHIPPING</div>' : '';
    
    // Free shipping countdown
    let freeShippingExpiryHTML = '';
    if (product.freeShippingUntil) {
        const expiry = product.freeShippingUntil.toDate ? product.freeShippingUntil.toDate() : new Date(product.freeShippingUntil);
        const daysLeft = Math.ceil((expiry - new Date()) / (1000 * 60 * 60 * 24));
        if (daysLeft > 0 && daysLeft <= 3) {
            freeShippingExpiryHTML = `<div style="font-size:9px;color:#f44;">⏰ Free shipping ends in ${daysLeft}d</div>`;
        }
    }
    
    return `
        <div class="product-card" data-product-id="${product.id}" onclick="openProductDetail('${product.id}')">
            <div style="position:relative;">
                <img src="${imageUrl}" class="product-card-image" onerror="this.src='/app-icon.png'" loading="lazy">
                ${product.sponsored ? '<span style="position:absolute;top:5px;left:5px;background:#FFD700;color:#1a1a1a;padding:2px 6px;border-radius:4px;font-size:9px;font-weight:700;">⭐ Sponsored</span>' : ''}
                ${product.videoUrl ? '<span style="position:absolute;top:5px;right:5px;background:rgba(0,0,0,0.6);color:white;padding:2px 6px;border-radius:4px;font-size:9px;">🎬 Video</span>' : ''}
            </div>
            <div class="product-card-info">
                <div style="font-size:10px;color:#999;margin-bottom:2px;">${storeName}</div>
                <div class="product-card-name">${product.name || 'Untitled'}</div>
                <div class="product-card-price">${formatCurrency(product.price)} ${discountHTML}</div>
                ${freeShip}
                ${freeShippingExpiryHTML}
                <div class="product-card-rating">⭐ ${rating.toFixed(1)} (${reviewCount})</div>
                <button class="btn-gold" style="width:100%;margin-top:6px;font-size:11px;padding:7px;" 
                        onclick="event.stopPropagation();addToCartFromCard('${product.id}')">🛒 Add to Cart</button>
            </div>
        </div>`;
}

// =====================
// QUICK ADD TO CART FROM CARD
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
        if(typeof updateCartBadge==='function') updateCartBadge();
        showToast('Added to cart! 🛒','success');
    } catch(e){ showToast('Failed','error'); }
}

// =====================
// OPEN PRODUCT DETAIL
// =====================
async function openProductDetail(productId) {
    navigateTo('product-detail', { productId });
}

// =====================
// LOAD PRODUCT DETAIL (Full featured)
// =====================
async function loadProductDetail(data) {
    const container = document.getElementById('product-detail-content');
    if (!container) return;
    
    let product = data?.product;
    
    if (!product && data?.productId) {
        container.innerHTML = '<p style="text-align:center;padding:60px;">Loading product...</p>';
        try {
            const doc = await db.collection('products').doc(data.productId).get();
            if (doc.exists) product = { id: doc.id, ...doc.data() };
        } catch (error) { console.error('Load error:', error); }
    }
    
    if (!product) {
        container.innerHTML = `<div style="text-align:center;padding:60px;"><p style="font-size:50px;">🔍</p><h3>Product Not Found</h3><button class="btn-gold" onclick="navigateTo('marketplace')">Browse Products</button></div>`;
        return;
    }
    
    currentProduct = product;
    selectedColor = null;
    selectedSize = null;
    productQuantity = 1;
    
    const imageUrl = (product.images&&product.images[0])||'/app-icon.png';
    const rating = product.avgRating||0;
    const reviewCount = product.reviewCount||0;
    const totalSales = product.totalSales||0;
    const totalAffiliates = product.totalAffiliates||0;
    const storeName = product.merchantName||'Store';
    
    // Discount display
    let discountHTML = '';
    let discountedPrice = product.price;
    if (product.discountCode) {
        const isActive = product.discountCode.active !== false;
        const limitReached = product.discountCode.maxUses && (product.discountCode.usedCount||0) >= product.discountCode.maxUses;
        if (isActive && !limitReached) {
            discountHTML = `<span class="discount-badge">-${product.discountCode.value}${product.discountCode.type==='percentage'?'%':'$'}</span>`;
            discountedPrice = applyDiscount(product.price, product.discountCode);
        }
    }
    
    const freeShip = product.freeShipping ? '<div style="color:var(--green);font-weight:600;margin:5px 0;">🚚 FREE SHIPPING</div>' : '';
    
    // Free shipping countdown
    let freeShippingExpiryHTML = '';
    if (product.freeShippingUntil) {
        const expiry = product.freeShippingUntil.toDate ? product.freeShippingUntil.toDate() : new Date(product.freeShippingUntil);
        const daysLeft = Math.ceil((expiry - new Date()) / (1000 * 60 * 60 * 24));
        if (daysLeft > 0 && daysLeft <= 3) {
            freeShippingExpiryHTML = `<div style="color:#f44;font-size:12px;margin:3px 0;">⏰ Free shipping ends in ${daysLeft} day${daysLeft>1?'s':''}</div>`;
        }
    }
    
    container.innerHTML = `
        <div class="product-gallery">
            ${product.videoUrl ? `
                <div style="margin-bottom:10px;">
                    <video src="${product.videoUrl}" controls style="width:100%;max-height:300px;border-radius:12px;background:#000;"></video>
                </div>
            ` : ''}
            <img src="${imageUrl}" alt="${product.name}" class="product-main-image" id="main-product-image" onerror="this.src='/app-icon.png'">
            ${product.images&&product.images.length>1 ? `
                <div class="product-thumbnails">
                    ${product.images.map((img,i) => `<img src="${img}" class="product-thumbnail ${i===0?'active':''}" onclick="document.getElementById('main-product-image').src='${img}';document.querySelectorAll('.product-thumbnail').forEach(t=>t.classList.remove('active'));this.classList.add('active');" onerror="this.style.display='none'">`).join('')}
                </div>` : ''}
        </div>
        
        <div class="product-info-section">
            <div style="font-size:11px;color:#999;margin-bottom:3px;">${storeName}</div>
            <h1 class="product-name-detail">${product.name}</h1>
            <div class="product-price-detail">
                ${formatCurrency(discountedPrice)} 
                ${product.discountCode && discountedPrice !== product.price ? `<span style="text-decoration:line-through;color:#999;font-size:16px;">${formatCurrency(product.price)}</span>` : ''}
                ${discountHTML}
            </div>
            ${freeShip}
            ${freeShippingExpiryHTML}
            <div class="product-meta">
                <span>⭐ ${rating.toFixed(1)} (${reviewCount} reviews)</span>
                <span>📦 ${totalSales} sold</span>
                <span>📢 ${totalAffiliates} affiliates</span>
            </div>
        </div>
        
        ${product.colors&&product.colors.length>0 ? `
            <div class="product-info-section">
                <h4>Color: <span id="selected-color-text">Select</span></h4>
                <div class="color-options">
                    ${product.colors.map(color => `
                        <div class="color-swatch" 
                             style="background:${color.toLowerCase()};border:2px solid #ddd;" 
                             title="${color}"
                             onclick="selectColor('${color}')"></div>
                    `).join('')}
                </div>
            </div>
        ` : ''}
        
        ${product.sizes&&product.sizes.length>0 ? `
            <div class="product-info-section">
                <h4>Size: <span id="selected-size-text">Select</span></h4>
                <div class="size-options">
                    ${product.sizes.map(size => `
                        <button class="size-btn" onclick="selectSize('${size}')">${size}</button>
                    `).join('')}
                </div>
            </div>
        ` : ''}
        
        <div class="product-info-section">
            <h4>Quantity</h4>
            <div class="quantity-selector">
                <button class="quantity-btn" onclick="changeQuantity(-1)">−</button>
                <span class="quantity-display">${productQuantity}</span>
                <button class="quantity-btn" onclick="changeQuantity(1)">+</button>
            </div>
            <small style="color:#666;">${product.stock>0?product.stock+' available':'In stock'}</small>
        </div>
        
        ${product.discountCode && discountedPrice !== product.price ? `
            <div style="background:#FFF8E1;padding:15px;border-radius:12px;margin:10px 0;border:1px solid #FFD700;">
                <p style="font-weight:600;">🎫 Discount Available!</p>
                <p>Use code: <strong style="font-size:18px;">${product.discountCode.code}</strong></p>
                <small>Save ${product.discountCode.value}${product.discountCode.type==='percentage'?'%':' USD'}</small>
                ${product.discountCode.maxUses ? `<br><small>Uses: ${product.discountCode.usedCount||0}/${product.discountCode.maxUses}</small>` : ''}
            </div>
        ` : ''}
        
        ${product.discountCode && (product.discountCode.active === false || (product.discountCode.maxUses && (product.discountCode.usedCount||0) >= product.discountCode.maxUses)) ? `
            <div style="background:#FFEBEE;padding:12px;border-radius:8px;margin:10px 0;text-align:center;">
                <p style="color:#C62828;font-size:13px;">🎫 Discount code limit reached - no longer available</p>
            </div>
        ` : ''}
        
        <div class="product-info-section">
            <h4>Description</h4>
            <p style="color:#666;line-height:1.6;">${product.description||'No description available'}</p>
        </div>
        
        <div style="display:flex;gap:10px;padding:10px 0;">
            <button class="btn-gold" style="flex:1;" onclick="addToCart()">🛒 Add to Cart</button>
            <button class="btn-outline" style="flex:1;" onclick="buyNow()">⚡ Buy Now</button>
        </div>
        
        ${APP.userProfile?.isDropshipper ? `
            <div style="padding:10px 0;border-top:1px solid #f0f0f0;">
                <button class="btn-outline btn-full" onclick="importToDropshipStore('${product.id}')">📦 Import to My Dropship Store</button>
            </div>
        ` : ''}
        
        ${APP.userProfile?.isAffiliate ? `
            <div style="padding:10px 0;border-top:1px solid #f0f0f0;">
                <button class="btn-outline btn-full" onclick="installAffiliateProduct('${product.id}')">📢 Install as Affiliate Product</button>
            </div>
        ` : ''}
        
        <!-- Product Owner Tools -->
        ${APP.userProfile?.uid === product.merchantId ? `
            <div style="background:#E3F2FD;padding:15px;border-radius:12px;margin:10px 0;border:1px solid #BBDEFB;">
                <p style="font-weight:600;font-size:14px;margin-bottom:10px;">🔧 Product Owner Tools</p>
                
                <div style="margin-bottom:8px;">
                    <p style="font-size:11px;color:#666;">Product ID:</p>
                    <div style="font-family:monospace;font-size:13px;background:white;padding:8px;border-radius:4px;word-break:break-all;">${product.id}</div>
                </div>
                
                <div style="margin-bottom:8px;">
                    <p style="font-size:11px;color:#666;">Product Link:</p>
                    <div style="font-family:monospace;font-size:12px;background:white;padding:8px;border-radius:4px;word-break:break-all;">${APP.baseUrl}/p/${product.id}</div>
                </div>
                
                <div style="display:flex;gap:8px;flex-wrap:wrap;">
                    <button class="copy-btn" onclick="copyToClipboard('${APP.baseUrl}/p/${product.id}');showToast('Link copied!','success');">📋 Copy Link</button>
                    <button class="copy-btn" onclick="copyToClipboard('${product.id}');showToast('ID copied!','success');">📋 Copy ID</button>
                    <button class="btn-small ${product.status==='active'?'btn-outline':'btn-gold'}" onclick="toggleProductStatus('${product.id}','${product.status||'active'}')">
                        ${product.status==='active'?'Disable':'Enable'}
                    </button>
                </div>
                
                ${product.discountCode ? `
                    <div style="margin-top:10px;background:#FFF8E1;padding:10px;border-radius:8px;">
                        <p style="font-size:12px;font-weight:600;">🎫 Discount Code: ${product.discountCode.code}</p>
                        <p style="font-size:11px;color:#666;">
                            Used: ${product.discountCode.usedCount||0}${product.discountCode.maxUses?'/'+product.discountCode.maxUses:''} times
                            ${product.discountCode.maxUses && (product.discountCode.usedCount||0) >= product.discountCode.maxUses ? 
                                '<span style="color:#F44336;"> (Limit reached - code disabled)</span>' : 
                                '<span style="color:#4CAF50;"> (Active)</span>'}
                        </p>
                    </div>
                ` : ''}
            </div>
        ` : ''}
        
        <div class="product-info-section" style="margin-top:20px;">
            <h4>📝 Customer Reviews</h4>
            <div id="product-reviews-container">
                <p style="color:#999;text-align:center;padding:15px;">Loading reviews...</p>
            </div>
            <button class="btn-outline btn-full" style="margin-top:10px;" onclick="writeReview('${product.id}')">✍️ Write a Review</button>
        </div>
    `;
    
    // Load reviews
    setTimeout(() => {
        if (product?.id) loadProductReviews(product.id, document.getElementById('product-reviews-container'));
    }, 300);
}

// =====================
// COLOR & SIZE SELECTION
// =====================
function selectColor(color) {
    selectedColor = color;
    document.querySelectorAll('.color-swatch').forEach(s => {
        s.style.border = s.title === color ? '3px solid var(--gold)' : '2px solid #ddd';
    });
    const text = document.getElementById('selected-color-text');
    if (text) text.textContent = color;
}

function selectSize(size) {
    selectedSize = size;
    document.querySelectorAll('.size-btn').forEach(b => {
        b.classList.toggle('selected', b.textContent === size);
    });
    const text = document.getElementById('selected-size-text');
    if (text) text.textContent = size;
}

function changeQuantity(delta) {
    productQuantity = Math.max(1, Math.min(productQuantity + delta, currentProduct?.stock || 99));
    const display = document.querySelector('.quantity-display');
    if (display) display.textContent = productQuantity;
}

function buyNow() {
    addToCart();
    setTimeout(() => navigateTo('checkout'), 300);
}

// =====================
// ADD TO CART (from detail page)
// =====================
async function addToCart() {
    if (!APP.userProfile) { showToast('Please login first','error'); navigateTo('auth'); return; }
    if (!currentProduct) return;
    if (currentProduct.colors?.length && !selectedColor) { showToast('Please select a color','error'); return; }
    if (currentProduct.sizes?.length && !selectedSize) { showToast('Please select a size','error'); return; }
    
    let cart = JSON.parse(sessionStorage.getItem('shoplify_cart')||'[]');
    const img = (currentProduct.images&&currentProduct.images[0])||'/app-icon.png';
    
    const existingIndex = cart.findIndex(item => 
        item.productId === currentProduct.id && 
        item.color === selectedColor && 
        item.size === selectedSize
    );
    
    if (existingIndex >= 0) {
        cart[existingIndex].quantity += productQuantity;
    } else {
        cart.push({
            productId: currentProduct.id,
            name: currentProduct.name,
            price: currentProduct.price,
            image: img,
            color: selectedColor,
            size: selectedSize,
            quantity: productQuantity,
            merchantId: currentProduct.merchantId,
            isDigital: currentProduct.isDigital || false,
            discountCode: currentProduct.discountCode || null,
            freeShipping: currentProduct.freeShipping || false
        });
    }
    
    sessionStorage.setItem('shoplify_cart', JSON.stringify(cart));
    if (typeof updateCartBadge === 'function') updateCartBadge();
    showToast('Added to cart! 🛒', 'success');
}

// =====================
// IMPORT TO DROPSHIP STORE
// =====================
async function importToDropshipStore(productId) {
    if (!APP.userProfile?.isDropshipper) { showToast('You need a dropship subscription', 'error'); return; }
    if (!currentProduct) return;
    
    showModal(`
        <div style="padding:10px;">
            <h3>📦 Import to Dropship Store</h3>
            <p style="color:#666;margin:10px 0;">Product: <strong>${currentProduct.name}</strong></p>
            <p style="color:#666;font-size:13px;">Merchant Price: <strong>${formatCurrency(currentProduct.price)}</strong></p>
            
            <div class="input-group" style="margin-top:15px;">
                <label>Your Selling Price (USD)</label>
                <input type="number" id="dropship-selling-price" class="input-field" 
                       value="${(currentProduct.price * 1.2).toFixed(2)}" 
                       min="${currentProduct.price}" step="0.01">
                <small style="color:#666;">Minimum: ${formatCurrency(currentProduct.price)}</small>
            </div>
            
            <p style="margin-top:10px;font-weight:600;color:var(--green);">
                Your Profit: <span id="dropship-profit">${formatCurrency(currentProduct.price * 0.2)}</span>
            </p>
            
            <button class="btn-gold btn-full" onclick="confirmImportToDropship('${productId}')">📦 Import Product</button>
        </div>
    `);
    
    document.getElementById('dropship-selling-price').addEventListener('input', function() {
        const sellPrice = parseFloat(this.value) || currentProduct.price;
        const profit = Math.max(0, sellPrice - currentProduct.price);
        document.getElementById('dropship-profit').textContent = formatCurrency(profit);
    });
}

async function confirmImportToDropship(productId) {
    const sellingPrice = parseFloat(document.getElementById('dropship-selling-price')?.value) || currentProduct.price;
    
    if (sellingPrice <= currentProduct.price) {
        showToast('Selling price must be higher than merchant price', 'error');
        return;
    }
    
    hideModal();
    showLoader();
    
    try {
        await db.collection('dropship_products').add({
            dropshipperId: APP.userProfile.uid,
            originalProductId: productId,
            storeId: APP.userProfile.uid,
            name: currentProduct.name,
            price: sellingPrice,
            minPrice: currentProduct.price,
            images: currentProduct.images || [],
            status: 'active',
            storeLink: `${APP.baseUrl}/store/${APP.userProfile.username}/${productId}`,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        hideLoader();
        showToast('Product imported to your store! 📦', 'success');
        navigateTo('dropship-store');
        
    } catch (error) {
        hideLoader();
        console.error('Import error:', error);
        showToast('Failed to import product', 'error');
    }
}

// =====================
// INSTALL AFFILIATE PRODUCT
// =====================
async function installAffiliateProduct(productId) {
    if (!APP.userProfile?.isAffiliate) { showToast('You need an affiliate subscription', 'error'); return; }
    
    showLoader();
    
    try {
        const productDoc = await db.collection('products').doc(productId).get();
        if (!productDoc.exists) { hideLoader(); showToast('Product not found', 'error'); return; }
        
        const product = productDoc.data();
        const affiliateLink = `${APP.baseUrl}/r/${APP.userProfile.uid}/${productId}`;
        
        await db.collection('affiliate_products').add({
            affiliateId: APP.userProfile.uid,
            productId: productId,
            productName: product.name,
            productImage: (product.images && product.images.length > 0) ? product.images[0] : '',
            productPrice: product.price,
            commissionPercentage: product.commissionPercentage || APP.affiliateCommissionMin,
            affiliateLink: affiliateLink,
            status: 'active',
            isDropshipProduct: false,
            clicks: 0,
            conversions: 0,
            totalCommission: 0,
            installedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        await db.collection('products').doc(productId).update({
            totalAffiliates: firebase.firestore.FieldValue.increment(1)
        });
        
        hideLoader();
        showToast('Product installed! 📢', 'success');
        
    } catch (error) {
        hideLoader();
        console.error('Install error:', error);
        showToast('Failed to install product', 'error');
    }
}

// =====================
// PRODUCT REVIEWS
// =====================
async function loadProductReviews(productId, container) {
    if (!container) return;
    
    try {
        const snapshot = await db.collection('reviews')
            .where('productId', '==', productId)
            .get();
        
        if (snapshot.empty) {
            container.innerHTML = '<p style="color:#999;text-align:center;padding:15px;">No reviews yet. Be the first to review!</p>';
            return;
        }
        
        const reviews = [];
        snapshot.forEach(doc => reviews.push(doc.data()));
        reviews.sort((a, b) => (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0));
        
        container.innerHTML = '';
        reviews.forEach(review => {
            container.innerHTML += `
                <div style="padding:12px;background:#fafafa;border-radius:8px;margin-bottom:8px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <strong style="font-size:14px;">${review.userName || 'Customer'}</strong>
                        <span style="color:#FFD700;">${'★'.repeat(review.rating || 5)}${'☆'.repeat(5 - (review.rating || 5))}</span>
                    </div>
                    <p style="font-size:13px;color:#666;margin-top:5px;">${review.comment || 'No comment'}</p>
                    ${review.images && review.images.length > 0 ? `
                        <div style="display:flex;gap:5px;margin-top:8px;flex-wrap:wrap;">
                            ${review.images.map(img => `<img src="${img}" style="width:60px;height:60px;object-fit:cover;border-radius:4px;">`).join('')}
                        </div>
                    ` : ''}
                    <small style="color:#999;font-size:11px;">${getTimeAgo(review.createdAt)}</small>
                </div>`;
        });
    } catch (error) {
        console.error('Reviews error:', error);
        container.innerHTML = '<p style="color:#999;text-align:center;">Unable to load reviews</p>';
    }
}

// =====================
// WRITE REVIEW
// =====================
function writeReview(productId) {
    if (!APP.userProfile) { showToast('Please login','error'); navigateTo('auth'); return; }
    
    showModal(`
        <div style="padding:10px;">
            <h3>✍️ Write a Review</h3>
            <p style="color:#666;margin:10px 0;">${currentProduct?.name || 'Product'}</p>
            
            <div class="input-group">
                <label>Rating</label>
                <div style="display:flex;gap:5px;font-size:30px;cursor:pointer;" id="review-stars">
                    <span onclick="setReviewRating(1)">☆</span>
                    <span onclick="setReviewRating(2)">☆</span>
                    <span onclick="setReviewRating(3)">☆</span>
                    <span onclick="setReviewRating(4)">☆</span>
                    <span onclick="setReviewRating(5)">☆</span>
                </div>
            </div>
            
            <div class="input-group" style="margin-top:10px;">
                <label>Your Review</label>
                <textarea id="review-comment" class="input-field" rows="4" placeholder="Share your experience..."></textarea>
            </div>
            
            <div class="input-group" style="margin-top:10px;">
                <label>Add Photos (optional)</label>
                <input type="file" id="review-images" class="input-field" multiple accept="image/*" onchange="previewReviewImages()">
                <div id="review-image-preview" style="display:flex;gap:5px;flex-wrap:wrap;margin-top:8px;"></div>
            </div>
            
            <button class="btn-gold btn-full" style="margin-top:15px;" onclick="submitReview('${productId}')">Submit Review</button>
        </div>
    `);
    
    window._reviewRating = 5;
    window._reviewImages = [];
}

function setReviewRating(rating) {
    window._reviewRating = rating;
    const stars = document.querySelectorAll('#review-stars span');
    stars.forEach((s, i) => {
        s.textContent = i < rating ? '★' : '☆';
        s.style.color = i < rating ? '#FFD700' : '#ccc';
    });
}

function previewReviewImages() {
    const files = document.getElementById('review-images')?.files;
    const container = document.getElementById('review-image-preview');
    if (!container) return;
    container.innerHTML = '';
    window._reviewImages = [];
    if (files) {
        Array.from(files).slice(0, 3).forEach(file => {
            window._reviewImages.push(file);
            const reader = new FileReader();
            reader.onload = e => {
                container.innerHTML += `<img src="${e.target.result}" style="width:60px;height:60px;object-fit:cover;border-radius:4px;">`;
            };
            reader.readAsDataURL(file);
        });
    }
}

async function submitReview(productId) {
    const rating = window._reviewRating || 5;
    const comment = document.getElementById('review-comment')?.value?.trim();
    
    if (!comment) { showToast('Please write a review', 'error'); return; }
    
    hideModal();
    showLoader();
    
    try {
        let imageUrls = [];
        for (const file of (window._reviewImages || [])) {
            try { imageUrls.push(await uploadToCloudinary(file)); } catch(e) {}
        }
        
        await db.collection('reviews').add({
            productId,
            userId: APP.userProfile.uid,
            userName: APP.userProfile.displayName || APP.userProfile.username,
            rating,
            comment,
            images: imageUrls,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Update product rating
        const reviewsSnap = await db.collection('reviews').where('productId', '==', productId).get();
        let totalRating = 0, count = 0;
        reviewsSnap.forEach(d => { totalRating += d.data().rating || 0; count++; });
        const avgRating = count > 0 ? totalRating / count : rating;
        
        await db.collection('products').doc(productId).update({
            avgRating,
            reviewCount: count
        });
        
        hideLoader();
        showToast('Review submitted! ✅', 'success');
        
        // Reload reviews
        const container = document.getElementById('product-reviews-container');
        if (container) loadProductReviews(productId, container);
        
    } catch (e) {
        hideLoader();
        showToast('Failed to submit review', 'error');
    }
}

// =====================
// SEARCH
// =====================
function searchProducts() {
    const query = document.getElementById('product-search')?.value?.toLowerCase() || '';
    const container = document.getElementById('all-products');
    if (!container) return;
    
    const cards = container.querySelectorAll('.product-card');
    let found = false;
    
    cards.forEach(card => {
        const name = card.querySelector('.product-card-name')?.textContent?.toLowerCase() || '';
        const store = card.querySelector('div')?.textContent?.toLowerCase() || '';
        const match = name.includes(query) || store.includes(query);
        card.style.display = match ? '' : 'none';
        if (match) found = true;
    });
    
    const oldMsg = container.querySelector('.no-results');
    if (oldMsg) oldMsg.remove();
    
    if (!found && query && cards.length > 0) {
        const msg = document.createElement('p');
        msg.className = 'no-results';
        msg.style.cssText = 'text-align:center;padding:40px;color:#999;grid-column:1/-1;';
        msg.textContent = 'No products match your search';
        container.appendChild(msg);
    }
}

// =====================
// SPONSORED PRODUCTS PAGE
// =====================
async function loadSponsoredProductsPage() {
    const container = document.getElementById('sponsored-grid');
    if (!container) return;
    
    container.innerHTML = '<p style="text-align:center;padding:40px;">Loading sponsored products...</p>';
    
    try {
        const snapshot = await db.collection('products')
            .where('sponsored', '==', true)
            .get();
        
        if (snapshot.empty) {
            container.innerHTML = '<p style="text-align:center;padding:40px;">No sponsored products available</p>';
            return;
        }
        
        const products = [];
        snapshot.forEach(doc => {
            const p = doc.data();
            if (p.status === 'active') products.push({ id: doc.id, ...p });
        });
        
        container.innerHTML = '<div class="products-grid-full">';
        products.forEach(product => {
            container.innerHTML += createProductCard(product);
        });
        container.innerHTML += '</div>';
        
    } catch (error) {
        console.error('Sponsored page error:', error);
        container.innerHTML = '<p style="text-align:center;padding:40px;">Error loading</p>';
    }
}

// =====================
// UTILITY FUNCTIONS
// =====================
function applyDiscount(price, discount) {
    if (!discount || !discount.value) return parseFloat(price);
    if (discount.type === 'percentage') {
        return parseFloat(price) - (parseFloat(price) * parseFloat(discount.value) / 100);
    } else {
        return Math.max(0, parseFloat(price) - parseFloat(discount.value));
    }
}

async function toggleProductStatus(productId, currentStatus) {
    const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
    try {
        await db.collection('products').doc(productId).update({ status: newStatus });
        showToast(`Product ${newStatus === 'active' ? 'enabled' : 'disabled'}`, 'success');
        // Reload product detail
        if (currentProduct?.id === productId) {
            loadProductDetail({ productId });
        }
    } catch (error) {
        showToast('Failed to update product', 'error');
    }
}
