// ============ Products Module ============

async function loadHomePage() {
    if (!requireAuth()) return;
    
    const profile = await refreshUserProfile();
    
    // Update wallet summary
    const homeBalance = document.getElementById('home-balance');
    const homeAffiliateEarnings = document.getElementById('home-affiliate-earnings');
    const homePendingEarnings = document.getElementById('home-pending-earnings');
    
    if (homeBalance) homeBalance.textContent = formatCurrency(profile.walletBalance || 0);
    if (homeAffiliateEarnings) homeAffiliateEarnings.textContent = formatCurrency(profile.affiliateEarnings || 0);
    if (homePendingEarnings) homePendingEarnings.textContent = formatCurrency(profile.pendingEarnings || 0);
    
    // Load categories
    const homeCategories = document.getElementById('home-categories');
    if (homeCategories) {
        homeCategories.innerHTML = CATEGORIES.map(cat => `
            <button class="category-chip" onclick="navigateTo('marketplace'); setTimeout(() => filterByCategory('${cat}', document.querySelectorAll('.category-chip')[CATEGORIES.indexOf('${cat}')+1]), 300);">
                ${cat}
            </button>
        `).join('');
    }
    
    // Load featured products
    await loadFeaturedProducts();
    
    // Load notifications count
    await loadNotificationBadge();
}

async function loadFeaturedProducts() {
    const container = document.getElementById('home-featured-products');
    if (!container) return;
    
    try {
        const snapshot = await db.collection('products')
            .where('status', '==', 'active')
            .orderBy('createdAt', 'desc')
            .limit(10)
            .get();
        
        if (snapshot.empty) {
            container.innerHTML = `
                <div style="grid-column:1/-1; text-align:center; padding:40px; color:#999;">
                    <i class="fas fa-box-open" style="font-size:48px; display:block; margin-bottom:12px;"></i>
                    <p>No products yet</p>
                </div>`;
            return;
        }
        
        container.innerHTML = snapshot.docs.map(doc => 
            createProductCard({ id: doc.id, ...doc.data() })
        ).join('');
        
        attachProductCardClicks(container);
    } catch (error) {
        console.error('Load featured error:', error);
        container.innerHTML = '<p style="text-align:center;color:#999;grid-column:1/-1;">Error loading products</p>';
    }
}

async function loadMarketplace() {
    const catContainer = document.getElementById('marketplace-categories');
    const prodContainer = document.getElementById('marketplace-products');
    
    if (catContainer) {
        catContainer.innerHTML = `
            <button class="category-chip active" onclick="filterByCategory('all', this)">All</button>
            ${CATEGORIES.map(cat => `
                <button class="category-chip" onclick="filterByCategory('${cat}', this)">${cat}</button>
            `).join('')}
        `;
    }
    
    if (prodContainer) {
        try {
            const snapshot = await db.collection('products')
                .where('status', '==', 'active')
                .orderBy('createdAt', 'desc')
                .limit(50)
                .get();
            
            if (snapshot.empty) {
                prodContainer.innerHTML = `
                    <div style="grid-column:1/-1; text-align:center; padding:40px; color:#999;">
                        <i class="fas fa-store-slash" style="font-size:48px; display:block; margin-bottom:12px;"></i>
                        <p>Marketplace is empty</p>
                    </div>`;
                return;
            }
            
            renderProductCards(
                snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
                'marketplace-products'
            );
        } catch (error) {
            console.error('Load marketplace error:', error);
            if (prodContainer) prodContainer.innerHTML = '<p style="text-align:center;color:#999;grid-column:1/-1;">Error loading marketplace</p>';
        }
    }
}

function createProductCard(product) {
    const imageUrl = product.images?.[0] || product.imageUrl || '';
    const hasCommission = product.commissionPercentage && product.commissionPercentage > 0;
    
    return `
        <div class="product-card" data-product-id="${product.id}" style="cursor:pointer;">
            <div style="position:relative;">
                <img src="${imageUrl}" alt="${product.name}" class="product-card-image" 
                     onerror="this.src='app-icon.png'"
                     loading="lazy">
                ${hasCommission ? `
                    <span style="position:absolute; top:8px; right:8px; background:#00C851; color:white; 
                                 padding:3px 8px; border-radius:10px; font-size:10px; font-weight:700;">
                        +${product.commissionPercentage}%
                    </span>
                ` : ''}
            </div>
            <div class="product-card-info">
                <p class="product-card-name">${product.name}</p>
                <p class="product-card-price">${formatCurrency(product.price)}</p>
                ${hasCommission ? `<p class="product-card-commission">Earn ${formatCurrency(calculateCommission(product.price, product.commissionPercentage))}</p>` : ''}
                <p class="product-card-stock" style="color:${product.stock > 0 ? '#666' : '#FF4444'}">
                    ${product.stock > 0 ? `📦 ${product.stock} in stock` : '❌ Out of stock'}
                </p>
            </div>
        </div>
    `;
}

function renderProductCards(products, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (!products || products.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:#999;grid-column:1/-1;padding:40px;">No products found</p>';
        return;
    }
    
    container.innerHTML = products.map(p => createProductCard(p)).join('');
    attachProductCardClicks(container);
}

function attachProductCardClicks(container) {
    container.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', function() {
            const productId = this.dataset.productId;
            if (productId) navigateTo('product-detail', productId);
        });
    });
}

async function loadProductDetail(productId) {
    if (!productId) {
        showToast('Product not found', 'error');
        goBack();
        return;
    }
    
    showLoader();
    
    try {
        const product = await getFromFirestore('products', productId);
        if (!product) {
            hideLoader();
            showToast('Product not found', 'error');
            goBack();
            return;
        }
        
        APP_STATE.selectedProduct = { id: productId, ...product };
        APP_STATE.productQuantity = 1;
        APP_STATE.selectedColor = product.colors?.[0] || null;
        APP_STATE.selectedSize = product.sizes?.[0] || null;
        
        const container = document.getElementById('product-detail-content');
        if (!container) { hideLoader(); return; }
        
        const images = product.images || [];
        const mainImage = images[0] || 'app-icon.png';
        
        container.innerHTML = `
            <div class="product-detail-container">
                ${product.videoUrl ? `
                    <video class="product-detail-video" controls playsinline 
                           poster="${mainImage}" style="width:100%; border-radius:12px; margin-bottom:12px;">
                        <source src="${product.videoUrl}" type="video/mp4">
                    </video>
                ` : ''}
                
                <div class="product-detail-images">
                    <img src="${mainImage}" alt="${product.name}" 
                         class="product-detail-main-image" id="main-product-image"
                         style="width:100%; aspect-ratio:1; object-fit:cover; border-radius:12px;">
                    ${images.length > 1 ? `
                        <div class="product-detail-thumbnails" style="display:flex; gap:8px; margin-top:8px; overflow-x:auto;">
                            ${images.map((img, i) => `
                                <img src="${img}" class="product-detail-thumb ${i === 0 ? 'active' : ''}" 
                                     style="width:60px; height:60px; border-radius:8px; object-fit:cover; cursor:pointer;
                                            border:2px solid ${i === 0 ? '#FFD700' : 'transparent'};"
                                     onclick="document.getElementById('main-product-image').src='${img}';
                                             this.parentElement.querySelectorAll('.product-detail-thumb').forEach(t => t.style.borderColor='transparent');
                                             this.style.borderColor='#FFD700';">
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
                
                <div class="product-detail-info" style="padding:16px 0;">
                    <h1 style="font-size:22px; font-weight:700; margin-bottom:8px;">${product.name}</h1>
                    <p style="font-size:28px; font-weight:800; color:#FFD700;">${formatCurrency(product.price)}</p>
                    ${product.commissionPercentage ? `
                        <span style="display:inline-block; background:#E8F5E9; color:#2E7D32; 
                                     padding:4px 12px; border-radius:12px; font-size:13px; font-weight:600; margin:8px 0;">
                            💰 Earn ${product.commissionPercentage}% Commission
                        </span>
                    ` : ''}
                    <p style="margin:8px 0; color:${product.stock > 0 ? '#666' : '#FF4444'};">
                        📦 ${product.stock > 0 ? `${product.stock} units available` : 'Out of stock'}
                    </p>
                    <p style="color:#666; line-height:1.6; margin:12px 0;">${product.description || 'No description'}</p>
                </div>
                
                ${product.colors?.length ? `
                    <div class="selector-group">
                        <p class="selector-label">Color: <strong id="selected-color-text">${product.colors[0]}</strong></p>
                        <div class="color-options" style="display:flex; gap:10px;">
                            ${product.colors.map((color, i) => `
                                <div class="color-option ${i === 0 ? 'active' : ''}" 
                                     style="width:36px; height:36px; border-radius:50%; background:${color.toLowerCase()};
                                            border:3px solid ${i === 0 ? '#FFD700' : '#ddd'}; cursor:pointer;"
                                     onclick="selectColor('${color}', this);">
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                ${product.sizes?.length ? `
                    <div class="selector-group">
                        <p class="selector-label">Size: <strong id="selected-size-text">${product.sizes[0]}</strong></p>
                        <div style="display:flex; gap:8px; flex-wrap:wrap;">
                            ${product.sizes.map((size, i) => `
                                <button class="size-option ${i === 0 ? 'active' : ''}" 
                                        style="padding:8px 16px; border-radius:8px; cursor:pointer;
                                               background:${i === 0 ? '#FFD700' : '#f5f5f5'}; 
                                               color:${i === 0 ? 'white' : '#333'}; border:2px solid ${i === 0 ? '#FFD700' : '#ddd'};"
                                        onclick="selectSize('${size}', this);">
                                    ${size}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <div style="display:flex; align-items:center; gap:12px; margin:16px 0;">
                    <button class="quantity-btn" onclick="updateProductQuantity(-1)" 
                            style="width:40px; height:40px; border-radius:50%; border:2px solid #ddd; background:white; font-size:20px; cursor:pointer;">−</button>
                    <span id="product-quantity" style="font-size:20px; font-weight:700; min-width:40px; text-align:center;">1</span>
                    <button class="quantity-btn" onclick="updateProductQuantity(1)" 
                            style="width:40px; height:40px; border-radius:50%; border:2px solid #ddd; background:white; font-size:20px; cursor:pointer;">+</button>
                </div>
                
                <div style="display:flex; gap:10px; margin:16px 0;">
                    <button class="btn-gold" onclick="addToCart('${productId}')" style="flex:1;" 
                            ${product.stock <= 0 ? 'disabled' : ''}>
                        <i class="fas fa-cart-plus"></i> Add to Cart
                    </button>
                    <button class="btn-gold" onclick="buyNow('${productId}')" style="flex:1;"
                            ${product.stock <= 0 ? 'disabled' : ''}>
                        <i class="fas fa-bolt"></i> Buy Now
                    </button>
                </div>
                
                ${product.reviews?.length ? `
                    <div style="border-top:1px solid #eee; padding-top:16px; margin-top:16px;">
                        <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">
                            <span style="font-size:32px; font-weight:800; color:#FFD700;">${product.avgRating || '0.0'}</span>
                            <div>
                                <div>${generateStars(product.avgRating || 0)}</div>
                                <p style="font-size:12px; color:#999;">${product.reviewCount || 0} reviews</p>
                            </div>
                        </div>
                        ${product.reviews.slice(0, 5).map(r => `
                            <div style="padding:10px 0; border-bottom:1px solid #f5f5f5;">
                                <p style="font-weight:600; font-size:13px;">${r.userName || 'Anonymous'}</p>
                                <div style="font-size:12px;">${generateStars(r.rating)}</div>
                                <p style="color:#666; font-size:13px; margin-top:4px;">${r.text}</p>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
        
        hideLoader();
    } catch (error) {
        hideLoader();
        console.error('Product detail error:', error);
        showToast('Error loading product', 'error');
    }
}

function selectColor(color, element) {
    const parent = element.parentElement;
    parent.querySelectorAll('.color-option').forEach(el => {
        el.classList.remove('active');
        el.style.borderColor = '#ddd';
    });
    element.classList.add('active');
    element.style.borderColor = '#FFD700';
    
    const textEl = document.getElementById('selected-color-text');
    if (textEl) textEl.textContent = color;
    APP_STATE.selectedColor = color;
}

function selectSize(size, element) {
    const parent = element.parentElement;
    parent.querySelectorAll('.size-option').forEach(el => {
        el.classList.remove('active');
        el.style.background = '#f5f5f5';
        el.style.color = '#333';
        el.style.borderColor = '#ddd';
    });
    element.classList.add('active');
    element.style.background = '#FFD700';
    element.style.color = 'white';
    element.style.borderColor = '#FFD700';
    
    const textEl = document.getElementById('selected-size-text');
    if (textEl) textEl.textContent = size;
    APP_STATE.selectedSize = size;
}

function updateProductQuantity(change) {
    const qtyEl = document.getElementById('product-quantity');
    if (!qtyEl) return;
    
    let quantity = parseInt(qtyEl.textContent) + change;
    if (quantity < 1) quantity = 1;
    if (quantity > 99) quantity = 99;
    qtyEl.textContent = quantity;
    APP_STATE.productQuantity = quantity;
}

function addToCart(productId) {
    const product = APP_STATE.selectedProduct;
    if (!product || product.id !== productId) return;
    
    const quantity = APP_STATE.productQuantity || 1;
    const color = APP_STATE.selectedColor || product.colors?.[0];
    const size = APP_STATE.selectedSize || product.sizes?.[0];
    
    const cartItem = {
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || '',
        color: color,
        size: size,
        quantity: quantity,
        total: product.price * quantity
    };
    
    const existingIndex = APP_STATE.cart.findIndex(item =>
        item.productId === productId && item.color === color && item.size === size
    );
    
    if (existingIndex >= 0) {
        APP_STATE.cart[existingIndex].quantity += quantity;
        APP_STATE.cart[existingIndex].total = APP_STATE.cart[existingIndex].price * APP_STATE.cart[existingIndex].quantity;
    } else {
        APP_STATE.cart.push(cartItem);
    }
    
    showToast(`✅ Added to cart (${APP_STATE.cart.length} items)`, 'success');
}

function buyNow(productId) {
    addToCart(productId);
    navigateTo('checkout');
}

async function loadAddProduct() {
    if (!requireAuth()) return;
    
    const isMerchant = await checkSubscription('merchant');
    if (!isMerchant) {
        showToast('Subscribe as merchant first', 'warning');
        navigateTo('profile');
        return;
    }
    
    const container = document.getElementById('add-product-content');
    if (!container) return;
    
    container.innerHTML = `
        <h3 style="margin-bottom:16px;">Add New Product</h3>
        <form id="add-product-form" onsubmit="submitProduct(event)" style="display:flex; flex-direction:column; gap:12px;">
            <div class="form-group">
                <label>Product Name *</label>
                <input type="text" id="prod-name" required placeholder="Enter product name">
            </div>
            <div class="form-group">
                <label>Price (USD) *</label>
                <input type="number" id="prod-price" required min="1" step="0.01" placeholder="0.00">
            </div>
            <div class="form-group">
                <label>Category *</label>
                <select id="prod-category" required>
                    <option value="">Select category</option>
                    ${CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Stock Quantity *</label>
                <input type="number" id="prod-stock" required min="1" placeholder="Available quantity">
            </div>
            <div class="form-group">
                <label>Affiliate Commission (%)</label>
                <input type="number" id="prod-commission" min="0" max="100" step="0.1" placeholder="e.g., 10">
            </div>
            <div class="form-group">
                <label>Colors (comma separated)</label>
                <input type="text" id="prod-colors" placeholder="e.g., Black, White, Red">
            </div>
            <div class="form-group">
                <label>Sizes (comma separated)</label>
                <input type="text" id="prod-sizes" placeholder="e.g., S, M, L, XL">
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea id="prod-description" rows="4" placeholder="Describe your product"></textarea>
            </div>
            <div class="form-group">
                <label>Product Images (up to 5)</label>
                <input type="file" id="prod-images" accept="image/*" multiple onchange="previewProductImages()">
                <div id="image-previews" style="display:flex; flex-wrap:wrap; gap:8px; margin-top:8px;"></div>
            </div>
            <div class="form-group">
                <label>Product Video (optional)</label>
                <input type="file" id="prod-video" accept="video/*" onchange="previewProductVideo()">
                <video id="video-preview" controls style="width:100%; max-height:200px; margin-top:8px; display:none;"></video>
            </div>
            <button type="submit" class="btn-gold">Publish Product</button>
        </form>
    `;
}

function previewProductImages() {
    const files = document.getElementById('prod-images')?.files;
    const previewContainer = document.getElementById('image-previews');
    if (!previewContainer || !files) return;
    
    previewContainer.innerHTML = '';
    Array.from(files).slice(0, 5).forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            previewContainer.innerHTML += `
                <div style="position:relative;">
                    <img src="${e.target.result}" style="width:80px; height:80px; object-fit:cover; border-radius:8px;">
                    <span style="position:absolute; top:2px; right:2px; background:#FF4444; color:white; 
                                 width:18px; height:18px; border-radius:50%; font-size:10px; 
                                 display:flex; align-items:center; justify-content:center; cursor:pointer;"
                          onclick="this.parentElement.remove()">×</span>
                </div>`;
        };
        reader.readAsDataURL(file);
    });
}

function previewProductVideo() {
    const file = document.getElementById('prod-video')?.files[0];
    const preview = document.getElementById('video-preview');
    if (!preview || !file) return;
    
    const url = URL.createObjectURL(file);
    preview.src = url;
    preview.style.display = 'block';
}

async function submitProduct(event) {
    event.preventDefault();
    showLoader();
    
    try {
        const name = document.getElementById('prod-name')?.value?.trim();
        const price = parseFloat(document.getElementById('prod-price')?.value);
        const category = document.getElementById('prod-category')?.value;
        const stock = parseInt(document.getElementById('prod-stock')?.value);
        const commission = parseFloat(document.getElementById('prod-commission')?.value) || 0;
        const colors = document.getElementById('prod-colors')?.value?.split(',').map(c => c.trim()).filter(Boolean) || [];
        const sizes = document.getElementById('prod-sizes')?.value?.split(',').map(s => s.trim()).filter(Boolean) || [];
        const description = document.getElementById('prod-description')?.value?.trim() || '';
        
        if (!name || !price || !category || !stock) {
            hideLoader();
            showToast('Fill all required fields', 'error');
            return;
        }
        
        // Upload images
        const imageFiles = document.getElementById('prod-images')?.files || [];
        const imageUrls = [];
        for (let i = 0; i < Math.min(imageFiles.length, 5); i++) {
            const url = await uploadToCloudinary(imageFiles[i], 'image');
            imageUrls.push(url);
        }
        
        // Upload video
        const videoFile = document.getElementById('prod-video')?.files[0];
        let videoUrl = '';
        if (videoFile) {
            videoUrl = await uploadToCloudinary(videoFile, 'video');
        }
        
        const productId = generateId('prod');
        await saveToFirestore('products', productId, {
            name,
            price,
            category,
            stock,
            commissionPercentage: commission,
            colors,
            sizes,
            description,
            images: imageUrls,
            videoUrl,
            merchantId: APP_STATE.currentUser.uid,
            merchantName: APP_STATE.userProfile?.displayName || 'Unknown',
            status: 'active',
            avgRating: 0,
            reviewCount: 0,
            reviews: [],
            totalSales: 0,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        hideLoader();
        showToast('✅ Product published!', 'success');
        navigateTo('merchant');
    } catch (error) {
        hideLoader();
        console.error('Submit product error:', error);
        showToast('Error publishing product', 'error');
    }
}