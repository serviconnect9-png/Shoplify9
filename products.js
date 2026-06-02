// ============ Products Module ============

async function loadHomePage() {
    if (!requireAuth()) return;
    const profile = await refreshUserProfile();
    document.getElementById('home-balance').textContent = formatCurrency(profile.walletBalance || 0);
    document.getElementById('home-affiliate-earnings').textContent = formatCurrency(profile.affiliateEarnings || 0);
    document.getElementById('home-pending-earnings').textContent = formatCurrency(profile.pendingEarnings || 0);
    
    const catContainer = document.getElementById('home-categories');
    if (catContainer) {
        catContainer.innerHTML = CATEGORIES.map(cat => `<button class="category-chip" onclick="navigateTo('marketplace');setTimeout(()=>filterByCategory('${cat}',document.querySelectorAll('.category-chip')[CATEGORIES.indexOf('${cat}')+1]),300);">${cat}</button>`).join('');
    }
    
    await loadFeaturedProducts();
    loadNotificationBadge();
}

async function loadFeaturedProducts() {
    const container = document.getElementById('home-featured-products');
    if (!container) return;
    try {
        const snapshot = await db.collection('products').where('status','==','active').orderBy('createdAt','desc').limit(10).get();
        if (snapshot.empty) { container.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:#999;"><i class="fas fa-box-open" style="font-size:48px;display:block;margin-bottom:12px;"></i><p>No products yet</p></div>'; return; }
        container.innerHTML = snapshot.docs.map(doc => createProductCard({ id: doc.id, ...doc.data() })).join('');
        attachClicks(container);
    } catch (e) { container.innerHTML = '<p style="text-align:center;color:#999;">Error</p>'; }
}

async function loadMarketplace() {
    const catC = document.getElementById('marketplace-categories');
    const prodC = document.getElementById('marketplace-products');
    if (catC) { catC.innerHTML = '<button class="category-chip active" onclick="filterByCategory(\'all\',this)">All</button>' + CATEGORIES.map(c => `<button class="category-chip" onclick="filterByCategory('${c}',this)">${c}</button>`).join(''); }
    if (prodC) {
        try {
            const snapshot = await db.collection('products').where('status','==','active').orderBy('createdAt','desc').limit(50).get();
            if (snapshot.empty) { prodC.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:#999;"><i class="fas fa-store-slash" style="font-size:48px;"></i><p>Marketplace empty</p></div>'; return; }
            renderProductCards(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })), 'marketplace-products');
        } catch (e) { prodC.innerHTML = '<p style="text-align:center;color:#999;">Error</p>'; }
    }
}

function createProductCard(product) {
    const img = product.images?.[0] || product.imageUrl || 'app-icon.png';
    return `<div class="product-card" data-product-id="${product.id}" style="cursor:pointer;">
        <div style="position:relative;"><img src="${img}" alt="${product.name}" class="product-card-image" onerror="this.src='app-icon.png'" loading="lazy">
        ${product.commissionPercentage ? '<span style="position:absolute;top:8px;right:8px;background:#00C851;color:white;padding:3px 8px;border-radius:10px;font-size:10px;">+'+product.commissionPercentage+'%</span>' : ''}</div>
        <div class="product-card-info"><p class="product-card-name">${product.name}</p><p class="product-card-price">${formatCurrency(product.price)}</p>
        ${product.commissionPercentage ? '<p class="product-card-commission">Earn '+formatCurrency(calculateCommission(product.price,product.commissionPercentage))+'</p>' : ''}
        <p class="product-card-stock" style="color:${product.stock>0?'#666':'#FF4444'}">${product.stock>0?'📦 '+product.stock+' in stock':'❌ Out of stock'}</p></div>
    </div>`;
}

function renderProductCards(products, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    if (!products || products.length === 0) { container.innerHTML = '<p style="text-align:center;color:#999;grid-column:1/-1;padding:40px;">No products</p>'; return; }
    container.innerHTML = products.map(p => createProductCard(p)).join('');
    attachClicks(container);
}

function attachClicks(container) {
    container.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', function() { const pid = this.dataset.productId; if (pid) navigateTo('product-detail', pid); });
    });
}

async function loadProductDetail(productId) {
    if (!productId) { showToast('Not found','error'); goBack(); return; }
    showLoader();
    try {
        const product = await getFromFirestore('products', productId);
        if (!product) { hideLoader(); showToast('Not found','error'); goBack(); return; }
        APP_STATE.selectedProduct = { id: productId, ...product };
        APP_STATE.productQuantity = 1;
        APP_STATE.selectedColor = product.colors?.[0] || null;
        APP_STATE.selectedSize = product.sizes?.[0] || null;
        
        const container = document.getElementById('product-detail-content');
        if (!container) { hideLoader(); return; }
        const images = product.images || [];
        const mainImg = images[0] || 'app-icon.png';
        
        container.innerHTML = `<div class="product-detail-container">
            ${product.videoUrl ? `<video class="product-detail-video" controls playsinline poster="${mainImg}" style="width:100%;border-radius:12px;margin-bottom:12px;"><source src="${product.videoUrl}" type="video/mp4"></video>` : ''}
            <div class="product-detail-images"><img src="${mainImg}" alt="${product.name}" id="main-product-image" style="width:100%;aspect-ratio:1;object-fit:cover;border-radius:12px;">
            ${images.length>1 ? '<div style="display:flex;gap:8px;margin-top:8px;overflow-x:auto;">'+images.map((img,i) => `<img src="${img}" class="product-detail-thumb" style="width:60px;height:60px;border-radius:8px;object-fit:cover;cursor:pointer;border:2px solid ${i===0?'#FFD700':'transparent'};" onclick="document.getElementById('main-product-image').src='${img}';this.parentElement.querySelectorAll('.product-detail-thumb').forEach(t=>t.style.borderColor='transparent');this.style.borderColor='#FFD700';">`).join('')+'</div>' : ''}</div>
            <div style="padding:16px 0;"><h1 style="font-size:22px;font-weight:700;">${product.name}</h1><p style="font-size:28px;font-weight:800;color:#FFD700;">${formatCurrency(product.price)}</p>
            ${product.commissionPercentage ? '<span style="display:inline-block;background:#E8F5E9;color:#2E7D32;padding:4px 12px;border-radius:12px;font-size:13px;margin:8px 0;">💰 Earn '+product.commissionPercentage+'%</span>' : ''}
            <p style="color:${product.stock>0?'#666':'#FF4444'};">📦 ${product.stock>0?product.stock+' available':'Out of stock'}</p>
            <p style="color:#666;line-height:1.6;">${product.description||'No description'}</p></div>
            ${product.colors?.length ? `<div><p style="font-weight:600;">Color: <strong id="selected-color-text">${product.colors[0]}</strong></p><div style="display:flex;gap:10px;margin:8px 0;">${product.colors.map((c,i)=>`<div style="width:36px;height:36px;border-radius:50%;background:${c.toLowerCase()};border:3px solid ${i===0?'#FFD700':'#ddd'};cursor:pointer;" onclick="selectColor('${c}',this);"></div>`).join('')}</div></div>` : ''}
            ${product.sizes?.length ? `<div><p style="font-weight:600;">Size: <strong id="selected-size-text">${product.sizes[0]}</strong></p><div style="display:flex;gap:8px;margin:8px 0;">${product.sizes.map((s,i)=>`<button style="padding:8px 16px;border-radius:8px;cursor:pointer;background:${i===0?'#FFD700':'#f5f5f5'};color:${i===0?'white':'#333'};border:2px solid ${i===0?'#FFD700':'#ddd'};" onclick="selectSize('${s}',this);">${s}</button>`).join('')}</div></div>` : ''}
            <div style="display:flex;align-items:center;gap:12px;margin:16px 0;"><button onclick="updateProductQuantity(-1)" style="width:40px;height:40px;border-radius:50%;border:2px solid #ddd;background:white;font-size:20px;cursor:pointer;">−</button><span id="product-quantity" style="font-size:20px;font-weight:700;">1</span><button onclick="updateProductQuantity(1)" style="width:40px;height:40px;border-radius:50%;border:2px solid #ddd;background:white;font-size:20px;cursor:pointer;">+</button></div>
            <div style="display:flex;gap:10px;margin:16px 0;"><button class="btn-gold" onclick="addToCart('${productId}')" style="flex:1;" ${product.stock<=0?'disabled':''}><i class="fas fa-cart-plus"></i> Add to Cart</button><button class="btn-gold" onclick="buyNow('${productId}')" style="flex:1;" ${product.stock<=0?'disabled':''}><i class="fas fa-bolt"></i> Buy Now</button></div>
            ${product.reviews?.length ? `<div style="border-top:1px solid #eee;padding-top:16px;"><div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;"><span style="font-size:32px;font-weight:800;color:#FFD700;">${product.avgRating||'0.0'}</span><div><div>${generateStars(product.avgRating||0)}</div><p style="font-size:12px;color:#999;">${product.reviewCount||0} reviews</p></div></div>${product.reviews.slice(0,5).map(r=>`<div style="padding:10px 0;border-bottom:1px solid #f5f5f5;"><p style="font-weight:600;">${r.userName||'Anonymous'}</p><div>${generateStars(r.rating)}</div><p style="color:#666;">${r.text}</p></div>`).join('')}</div>` : ''}
        </div>`;
        hideLoader();
    } catch (e) { hideLoader(); showToast('Error','error'); }
}

function selectColor(color, el) {
    el.parentElement.querySelectorAll('div').forEach(d => { d.style.borderColor = '#ddd'; });
    el.style.borderColor = '#FFD700';
    document.getElementById('selected-color-text').textContent = color;
    APP_STATE.selectedColor = color;
}

function selectSize(size, el) {
    el.parentElement.querySelectorAll('button').forEach(b => { b.style.background = '#f5f5f5'; b.style.color = '#333'; b.style.borderColor = '#ddd'; });
    el.style.background = '#FFD700'; el.style.color = 'white'; el.style.borderColor = '#FFD700';
    document.getElementById('selected-size-text').textContent = size;
    APP_STATE.selectedSize = size;
}

function updateProductQuantity(change) {
    const el = document.getElementById('product-quantity');
    if (!el) return;
    let q = parseInt(el.textContent) + change;
    if (q < 1) q = 1; if (q > 99) q = 99;
    el.textContent = q;
    APP_STATE.productQuantity = q;
}

function addToCart(productId) {
    const product = APP_STATE.selectedProduct;
    if (!product) return;
    const qty = APP_STATE.productQuantity || 1;
    const item = { productId, name: product.name, price: product.price, image: product.images?.[0]||'', color: APP_STATE.selectedColor, size: APP_STATE.selectedSize, quantity: qty, total: product.price * qty };
    const existing = APP_STATE.cart.findIndex(i => i.productId === productId && i.color === APP_STATE.selectedColor && i.size === APP_STATE.selectedSize);
    if (existing >= 0) { APP_STATE.cart[existing].quantity += qty; APP_STATE.cart[existing].total = APP_STATE.cart[existing].price * APP_STATE.cart[existing].quantity; }
    else { APP_STATE.cart.push(item); }
    localStorage.setItem('shoplify_cart', JSON.stringify(APP_STATE.cart));
    showToast('✅ Added to cart (' + APP_STATE.cart.length + ' items)', 'success');
}

function buyNow(productId) { addToCart(productId); navigateTo('checkout'); }

async function loadAddProduct() {
    if (!requireAuth()) return;
    const isM = await checkSubscription('merchant');
    if (!isM) { showToast('Subscribe as merchant first','warning'); navigateTo('profile'); return; }
    const container = document.getElementById('add-product-content');
    if (!container) return;
    container.innerHTML = `<h3>Add Product</h3>
        <form id="add-product-form" onsubmit="submitProduct(event)" style="display:flex;flex-direction:column;gap:10px;">
            <div class="form-group"><label>Name *</label><input type="text" id="prod-name" required></div>
            <div class="form-group"><label>Price (USD) *</label><input type="number" id="prod-price" required min="1" step="0.01"></div>
            <div class="form-group"><label>Category *</label><select id="prod-category" required><option value="">Select</option>${CATEGORIES.map(c=>`<option>${c}</option>`).join('')}</select></div>
            <div class="form-group"><label>Stock *</label><input type="number" id="prod-stock" required min="1"></div>
            <div class="form-group"><label>Commission (%)</label><input type="number" id="prod-commission" min="0" max="100" step="0.1" placeholder="10"></div>
            <div class="form-group"><label>Colors (comma separated)</label><input type="text" id="prod-colors" placeholder="Black, White, Red"></div>
            <div class="form-group"><label>Sizes (comma separated)</label><input type="text" id="prod-sizes" placeholder="S, M, L, XL"></div>
            <div class="form-group"><label>Description</label><textarea id="prod-description" rows="4"></textarea></div>
            <div class="form-group"><label>Images (up to 5)</label><input type="file" id="prod-images" accept="image/*" multiple onchange="previewProductImages()"><div id="image-previews" style="display:flex;flex-wrap:wrap;gap:8px;"></div></div>
            <div class="form-group"><label>Video (optional)</label><input type="file" id="prod-video" accept="video/*" onchange="previewProductVideo()"><video id="video-preview" controls style="width:100%;max-height:200px;display:none;"></video></div>
            <button type="submit" class="btn-gold">Publish Product</button>
        </form>`;
}

function previewProductImages() {
    const files = document.getElementById('prod-images')?.files;
    const preview = document.getElementById('image-previews');
    if (!preview) return;
    preview.innerHTML = '';
    Array.from(files||[]).slice(0,5).forEach(f => {
        const r = new FileReader();
        r.onload = e => { preview.innerHTML += `<div style="position:relative;"><img src="${e.target.result}" style="width:80px;height:80px;object-fit:cover;border-radius:8px;"><span style="position:absolute;top:2px;right:2px;background:red;color:white;width:18px;height:18px;border-radius:50%;font-size:10px;display:flex;align-items:center;justify-content:center;cursor:pointer;" onclick="this.parentElement.remove()">×</span></div>`; };
        r.readAsDataURL(f);
    });
}

function previewProductVideo() {
    const file = document.getElementById('prod-video')?.files[0];
    const preview = document.getElementById('video-preview');
    if (preview && file) { preview.src = URL.createObjectURL(file); preview.style.display = 'block'; }
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
        const colors = document.getElementById('prod-colors')?.value?.split(',').map(c=>c.trim()).filter(Boolean) || [];
        const sizes = document.getElementById('prod-sizes')?.value?.split(',').map(s=>s.trim()).filter(Boolean) || [];
        const description = document.getElementById('prod-description')?.value?.trim() || '';
        if (!name||!price||!category||!stock) { hideLoader(); showToast('Fill required fields','error'); return; }
        
        const imgFiles = document.getElementById('prod-images')?.files || [];
        const imgUrls = [];
        for (let i = 0; i < Math.min(imgFiles.length, 5); i++) { imgUrls.push(await uploadToCloudinary(imgFiles[i], 'image')); }
        
        const vidFile = document.getElementById('prod-video')?.files[0];
        let vidUrl = '';
        if (vidFile) vidUrl = await uploadToCloudinary(vidFile, 'video');
        
        const pid = generateId('prod');
        await saveToFirestore('products', pid, {
            name, price, category, stock, commissionPercentage: commission, colors, sizes, description,
            images: imgUrls, videoUrl: vidUrl, merchantId: APP_STATE.currentUser.uid,
            merchantName: APP_STATE.userProfile?.displayName || 'Unknown', status: 'active',
            avgRating: 0, reviewCount: 0, reviews: [], totalSales: 0,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        hideLoader();
        showToast('✅ Product published!','success');
        navigateTo('merchant');
    } catch (e) { hideLoader(); showToast('Error','error'); }
}

async function loadNotificationBadge() {
    try {
        if (!APP_STATE.currentUser) return;
        const snap = await db.collection('notifications').where('userId','==',APP_STATE.currentUser.uid).where('read','==',false).limit(1).get();
        const badge = document.getElementById('notif-badge');
        if (badge) { badge.style.display = snap.empty ? 'none' : 'flex'; badge.textContent = snap.size; }
    } catch (e) {}
}

async function loadNotifications() {
    if (!requireAuth()) return;
    const screen = document.getElementById('screen-notifications');
    if (!screen) { const s = document.createElement('div'); s.id = 'screen-notifications'; s.className = 'screen'; s.style.display = 'block'; s.innerHTML = '<div class="main-layout"><header class="app-header"><button class="icon-btn" onclick="goBack()"><i class="fas fa-arrow-left"></i></button><h2>Notifications</h2></header><div class="main-content" id="notif-list-content"></div></div>'; document.getElementById('app-container').appendChild(s); }
    const container = document.getElementById('notif-list-content') || document.getElementById('screen-notifications')?.querySelector('.main-content');
    if (!container) return;
    container.innerHTML = '<p style="text-align:center;color:#999;">Loading...</p>';
    try {
        const snap = await db.collection('notifications').where('userId','==',APP_STATE.currentUser.uid).orderBy('createdAt','desc').limit(30).get();
        if (snap.empty) { container.innerHTML = '<p style="text-align:center;padding:40px;color:#999;">No notifications</p>'; return; }
        container.innerHTML = snap.docs.map(doc => {
            const n = doc.data();
            return `<div style="padding:14px;border-bottom:1px solid #f5f5f5;"><div style="display:flex;align-items:center;gap:10px;"><div style="width:36px;height:36px;border-radius:50%;background:#FFD700;display:flex;align-items:center;justify-content:center;">${n.icon||'🔔'}</div><div><p style="font-weight:600;">${n.title}</p><p style="font-size:12px;color:#666;">${n.message}</p><p style="font-size:10px;color:#999;">${timeAgo(n.createdAt)}</p></div></div></div>`;
        }).join('');
    } catch (e) { container.innerHTML = '<p style="text-align:center;color:#999;">Error</p>'; }
}

async function sendNotification(userId, title, message, icon) {
    try { await saveToFirestore('notifications', generateId('notif'), { userId, title, message, icon: icon||'🔔', read: false, createdAt: firebase.firestore.FieldValue.serverTimestamp() }); } catch (e) {}
}

window.selectColor = selectColor;
window.selectSize = selectSize;
window.updateProductQuantity = updateProductQuantity;
window.addToCart = addToCart;
window.buyNow = buyNow;
window.previewProductImages = previewProductImages;
window.previewProductVideo = previewProductVideo;
window.submitProduct = submitProduct;

console.log('✅ Products module ready');