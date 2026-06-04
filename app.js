// ============ SHOPLIFY - COMPLETE APP ============
// Powered by Rev | Version 1.0.0

// ============ CONFIGURATION ============
const CONFIG = {
    appName: "Shoplify",
    version: "1.0.0",
    poweredBy: "Rev",
    adminEmail: "ebubechichukwu8@gmail.com",
    whatsappLink: "https://whatsapp.com/channel/0029VbClcrq11ulFYHVcU63m",
    flutterwaveKey: "FLWPUBK-b5d5cb8f23411dc9c84afd34c839c15b-X",
    cloudinaryCloud: "serviconnect",
    cloudinaryPreset: "connect",
    cloudinaryUrl: "https://api.cloudinary.com/v1_1/serviconnect/image/upload",
    minDeposit: 5,
    maxDeposit: 10000,
    minWithdraw: 5,
    maxWithdraw: 10000,
    maxWithdrawalsPerDay: 2,
    merchantPrice: 2,
    affiliatePrice: 3
};

const CATEGORIES = ["Fashion","Shoes","Electronics","Bags","Beauty","Watches","Accessories","Home & Garden","Sports","Toys"];

const STORE_TEMPLATES = [
    { id:"classic", name:"Classic", color:"#1A1A2E", icon:"🏪" },
    { id:"modern", name:"Modern", color:"#FFFFFF", icon:"🛍️" },
    { id:"premium", name:"Premium", color:"#FFD700", icon:"✨" },
    { id:"minimal", name:"Minimal", color:"#F5F5F5", icon:"📦" }
];

const APP = {
    user: null,
    profile: null,
    screen: 'loading',
    prevScreen: null,
    history: [],
    authenticated: false,
    cart: [],
    selectedProduct: null,
    selectedColor: null,
    selectedSize: null,
    quantity: 1,
    country: { code:"US", name:"United States", currency:"USD", flag:"🇺🇸", symbol:"$" },
    exchangeRate: 1
};

// ============ FIREBASE ============
let auth, db;

function initFirebase() {
    try {
        if (!firebase.apps.length) {
            firebase.initializeApp({
                apiKey: "AIzaSyDRlGps4_dqRBJ2SYmbeXtdDRGTIvYQ510",
                authDomain: "serviconnect-446dd.firebaseapp.com",
                projectId: "serviconnect-446dd",
                storageBucket: "serviconnect-446dd.firebasestorage.app",
                messagingSenderId: "102078290806",
                appId: "1:102078290806:web:88a6e1f9908100a3253857"
            });
        }
        auth = firebase.auth();
        db = firebase.firestore();
        console.log('✅ Firebase ready');
        return true;
    } catch(e) {
        console.error('Firebase error:', e);
        return false;
    }
}

// ============ LOADER ============
function startLoader() {
    const fill = document.querySelector('.loader-progress-fill');
    const text = document.querySelector('.loader-percent');
    if (!fill || !text) return;
    
    let p = 0;
    const timer = setInterval(() => {
        p += Math.floor(Math.random() * 8) + 3;
        if (p >= 90) { p = 90; clearInterval(timer); }
        fill.style.width = p + '%';
        text.textContent = p + '%';
    }, 250);
    
    return timer;
}

function finishLoader(timer) {
    if (timer) clearInterval(timer);
    const fill = document.querySelector('.loader-progress-fill');
    const text = document.querySelector('.loader-percent');
    if (fill) fill.style.width = '100%';
    if (text) text.textContent = '100%';
}

function hideLoader() {
    const loader = document.getElementById('app-loader');
    const app = document.getElementById('app-container');
    if (!loader || !app) return;
    
    setTimeout(() => {
        loader.style.opacity = '0';
        loader.style.transition = 'opacity 0.5s';
        setTimeout(() => {
            loader.style.display = 'none';
            app.style.display = 'block';
        }, 500);
    }, 300);
}

// ============ NAVIGATION ============
const ALL_SCREENS = ['onboarding','auth','home','marketplace','product-detail','affiliate','affiliate-install','checkout','orders','wallet','profile','store-setup','merchant','admin','settings','add-product'];

function goTo(screen, data) {
    if (!screen) return;
    if (APP.screen && APP.screen !== screen) {
        APP.prevScreen = APP.screen;
        APP.history.push(APP.screen);
        if (APP.history.length > 30) APP.history.shift();
    }
    APP.screen = screen;
    
    ALL_SCREENS.forEach(s => {
        const el = document.getElementById('screen-' + s);
        if (el) el.style.display = 'none';
    });
    
    const target = document.getElementById('screen-' + screen);
    if (target) {
        target.style.display = 'block';
        const mc = target.querySelector('.main-content');
        if (mc) mc.scrollTop = 0;
        updateNav(screen);
        loadScreen(screen, data);
    }
}

function goBack() {
    if (APP.history.length > 0) {
        goTo(APP.history.pop());
    } else {
        goTo('home');
        loadHome();
    }
}

function updateNav(screen) {
    document.querySelectorAll('.bottom-nav').forEach(nav => {
        nav.querySelectorAll('.nav-item').forEach((item, i) => {
            item.classList.remove('active');
            const map = { home:0, marketplace:1, orders:2, affiliate:3, profile:4 };
            if (map[screen] === i) item.classList.add('active');
        });
        const hide = ['onboarding','auth','checkout','product-detail','affiliate-install'];
        nav.style.display = hide.includes(screen) ? 'none' : 'flex';
    });
}

function loadScreen(screen, data) {
    setTimeout(() => {
        switch(screen) {
            case 'home': loadHome(); break;
            case 'marketplace': loadMarketplace(); break;
            case 'product-detail': if(data) loadProductDetail(data); break;
            case 'affiliate': loadAffiliate(); break;
            case 'affiliate-install': if(data) installProduct(data); break;
            case 'checkout': loadCheckout(); break;
            case 'orders': loadOrders(); break;
            case 'wallet': loadWallet(); break;
            case 'profile': loadProfile(); break;
            case 'store-setup': loadStoreSetup(); break;
            case 'merchant': loadMerchant(); break;
            case 'admin': loadAdmin(); break;
            case 'settings': loadSettings(); break;
            case 'add-product': loadAddProduct(); break;
        }
    }, 200);
}

// ============ AUTH ============
function signInWithGoogle() {
    const btn = document.querySelector('.btn-google');
    if (btn) { btn.disabled = true; btn.innerHTML = 'Connecting...'; }
    
    if (!auth) { toast('Please wait...', 'warning'); if(btn) resetBtn(btn); return; }
    
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    
    auth.signInWithPopup(provider).then(result => {
        APP.user = result.user;
        APP.authenticated = true;
        saveUser(result.user);
        if(btn) resetBtn(btn);
        toast('Welcome, ' + (result.user.displayName || 'User') + '!', 'success');
        goTo('home');
    }).catch(err => {
        console.error('Sign in error:', err.code);
        if(btn) resetBtn(btn);
        if (err.code === 'auth/popup-closed-by-user') toast('Cancelled', 'warning');
        else if (err.code === 'auth/popup-blocked') toast('Allow popups', 'error');
        else if (err.code === 'auth/operation-not-allowed') toast('Google sign-in not enabled in Firebase', 'error');
        else toast('Sign in failed', 'error');
    });
}

function resetBtn(btn) {
    btn.disabled = false;
    btn.innerHTML = '<i class="fab fa-google"></i> Continue with Google';
}

function saveUser(user) {
    if (!db) return;
    const data = {
        uid: user.uid, email: user.email,
        displayName: user.displayName || user.email.split('@')[0],
        photoURL: user.photoURL || '', walletBalance: 0,
        affiliateEarnings: 0, pendingEarnings: 0, escrowBalance: 0,
        withdrawnBalance: 0, membership: 'free',
        role: user.email === CONFIG.adminEmail ? 'admin' : 'customer',
        isMerchant: false, isAffiliate: false, bankAccounts: [],
        suspensionCount: 0, storeTemplate: null, storeActive: false,
        username: user.displayName || user.email.split('@')[0],
        theme: 'light', textSize: 'medium',
        country: APP.country.code, countryFlag: APP.country.flag,
        currency: APP.country.currency, exchangeRate: APP.exchangeRate,
        lastLogin: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    db.collection('users').doc(user.uid).get().then(doc => {
        if (!doc.exists) data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        return db.collection('users').doc(user.uid).set(data, { merge: true });
    }).then(() => {
        return db.collection('users').doc(user.uid).get();
    }).then(doc => {
        if (doc.exists) APP.profile = doc.data();
    }).catch(e => console.error('Save user error:', e));
}

function signOut() {
    if (!confirm('Sign out?')) return;
    if (auth) {
        auth.signOut().then(() => {
            APP.user = null; APP.profile = null; APP.authenticated = false; APP.cart = [];
            goTo('onboarding');
            toast('Signed out', 'success');
        });
    }
}

// ============ HOME ============
function loadHome() {
    if (!APP.authenticated) return;
    refreshProfile().then(() => {
        const bal = document.getElementById('home-balance');
        const aff = document.getElementById('home-affiliate-earnings');
        const pen = document.getElementById('home-pending-earnings');
        if (bal) bal.textContent = fmt(APP.profile?.walletBalance || 0);
        if (aff) aff.textContent = fmt(APP.profile?.affiliateEarnings || 0);
        if (pen) pen.textContent = fmt(APP.profile?.pendingEarnings || 0);
        
        const catC = document.getElementById('home-categories');
        if (catC) catC.innerHTML = CATEGORIES.map(c => `<button class="category-chip" onclick="goTo('marketplace');setTimeout(()=>filterCat('${c}'),300);">${c}</button>`).join('');
        
        loadFeatured();
    });
}

function loadFeatured() {
    const c = document.getElementById('home-featured-products');
    if (!c || !db) return;
    
    db.collection('products').where('status','==','active').orderBy('createdAt','desc').limit(10).get()
        .then(snap => {
            if (snap.empty) { c.innerHTML = '<p style="text-align:center;color:#999;padding:40px;">No products yet</p>'; return; }
            c.innerHTML = snap.docs.map(d => productCard({id:d.id,...d.data()})).join('');
            attachClicks(c);
        })
        .catch(() => { c.innerHTML = '<p style="text-align:center;color:#999;">Error loading</p>'; });
}

// ============ MARKETPLACE ============
function loadMarketplace() {
    const catC = document.getElementById('marketplace-categories');
    const prodC = document.getElementById('marketplace-products');
    
    if (catC) catC.innerHTML = '<button class="category-chip active" onclick="filterCat(\'all\',this)">All</button>' + CATEGORIES.map(c => `<button class="category-chip" onclick="filterCat('${c}',this)">${c}</button>`).join('');
    
    if (prodC && db) {
        db.collection('products').where('status','==','active').orderBy('createdAt','desc').limit(50).get()
            .then(snap => {
                if (snap.empty) { prodC.innerHTML = '<p style="text-align:center;color:#999;padding:40px;">No products</p>'; return; }
                renderCards(snap.docs.map(d => ({id:d.id,...d.data()})), 'marketplace-products');
            });
    }
}

function filterCat(cat, chip) {
    document.querySelectorAll('.category-chip').forEach(c => c.classList.remove('active'));
    if (chip) chip.classList.add('active');
    
    const ref = cat === 'all' ? db.collection('products').where('status','==','active') : db.collection('products').where('status','==','active').where('category','==',cat);
    ref.limit(50).get().then(snap => {
        renderCards(snap.docs.map(d => ({id:d.id,...d.data()})), 'marketplace-products');
    });
}

function productCard(p) {
    const img = p.images?.[0] || p.imageUrl || 'app-icon.png';
    return `<div class="product-card" data-id="${p.id}" style="cursor:pointer;">
        <div style="position:relative;"><img src="${img}" class="product-card-image" onerror="this.src='app-icon.png'">
        ${p.commissionPercentage ? '<span style="position:absolute;top:8px;right:8px;background:#00C851;color:#fff;padding:3px 8px;border-radius:10px;font-size:10px;">+'+p.commissionPercentage+'%</span>' : ''}</div>
        <div class="product-card-info"><p class="product-card-name">${p.name}</p><p class="product-card-price">${fmt(p.price)}</p>
        ${p.commissionPercentage ? '<p style="font-size:10px;color:#00C851;">Earn '+fmt(p.price*p.commissionPercentage/100)+'</p>' : ''}
        <p style="font-size:10px;color:#999;">Stock: ${p.stock||0}</p></div>
    </div>`;
}

function renderCards(products, containerId) {
    const c = document.getElementById(containerId);
    if (!c) return;
    if (!products.length) { c.innerHTML = '<p style="text-align:center;color:#999;padding:40px;">No products</p>'; return; }
    c.innerHTML = products.map(p => productCard(p)).join('');
    attachClicks(c);
}

function attachClicks(container) {
    container.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', function() {
            const id = this.dataset.id;
            if (id) goTo('product-detail', id);
        });
    });
}

// ============ PRODUCT DETAIL ============
function loadProductDetail(id) {
    if (!id || !db) return;
    
    db.collection('products').doc(id).get().then(doc => {
        if (!doc.exists) { toast('Not found','error'); goBack(); return; }
        const p = { id: doc.id, ...doc.data() };
        APP.selectedProduct = p;
        APP.quantity = 1;
        APP.selectedColor = p.colors?.[0] || null;
        APP.selectedSize = p.sizes?.[0] || null;
        
        const c = document.getElementById('product-detail-content');
        if (!c) return;
        
        const imgs = p.images || [];
        const main = imgs[0] || 'app-icon.png';
        
        c.innerHTML = `
            <div>
                ${p.videoUrl ? `<video src="${p.videoUrl}" controls style="width:100%;border-radius:12px;margin-bottom:12px;"></video>` : ''}
                <img src="${main}" id="main-image" style="width:100%;aspect-ratio:1;object-fit:cover;border-radius:12px;">
                ${imgs.length>1 ? `<div style="display:flex;gap:8px;margin-top:8px;overflow-x:auto;">${imgs.map((img,i) => `<img src="${img}" style="width:60px;height:60px;border-radius:8px;object-fit:cover;cursor:pointer;border:2px solid ${i===0?'#FFD700':'transparent'};" onclick="document.getElementById('main-image').src='${img}';this.parentElement.querySelectorAll('img').forEach(t=>t.style.borderColor='transparent');this.style.borderColor='#FFD700';">`).join('')}</div>` : ''}
                
                <h1 style="font-size:22px;margin:16px 0 8px;">${p.name}</h1>
                <p style="font-size:28px;font-weight:800;color:#FFD700;">${fmt(p.price)}</p>
                ${p.commissionPercentage ? `<span style="display:inline-block;background:#E8F5E9;color:#2E7D32;padding:4px 12px;border-radius:12px;font-size:13px;">💰 Earn ${p.commissionPercentage}%</span>` : ''}
                <p style="margin:8px 0;">📦 ${p.stock>0?p.stock+' in stock':'Out of stock'}</p>
                <p style="color:#666;">${p.description||''}</p>
                
                ${p.colors?.length ? `<div style="margin:12px 0;"><p style="font-weight:600;">Color: <span id="sel-color">${p.colors[0]}</span></p><div style="display:flex;gap:8px;">${p.colors.map((c,i) => `<div onclick="selectColor('${c}',this)" style="width:36px;height:36px;border-radius:50%;background:${c.toLowerCase()};border:3px solid ${i===0?'#FFD700':'#ddd'};cursor:pointer;"></div>`).join('')}</div></div>` : ''}
                
                ${p.sizes?.length ? `<div style="margin:12px 0;"><p style="font-weight:600;">Size: <span id="sel-size">${p.sizes[0]}</span></p><div style="display:flex;gap:8px;">${p.sizes.map((s,i) => `<button onclick="selectSize('${s}',this)" style="padding:8px 16px;border-radius:8px;cursor:pointer;background:${i===0?'#FFD700':'#f5f5f5'};color:${i===0?'#fff':'#333'};border:2px solid ${i===0?'#FFD700':'#ddd'};">${s}</button>`).join('')}</div></div>` : ''}
                
                <div style="display:flex;align-items:center;gap:12px;margin:16px 0;">
                    <button onclick="updateQty(-1)" style="width:40px;height:40px;border-radius:50%;border:2px solid #ddd;background:#fff;font-size:20px;cursor:pointer;">−</button>
                    <span id="qty" style="font-size:20px;font-weight:700;">1</span>
                    <button onclick="updateQty(1)" style="width:40px;height:40px;border-radius:50%;border:2px solid #ddd;background:#fff;font-size:20px;cursor:pointer;">+</button>
                </div>
                
                <div style="display:flex;gap:10px;">
                    <button class="btn-gold" onclick="addToCart('${p.id}')" style="flex:1;" ${p.stock<=0?'disabled':''}><i class="fas fa-cart-plus"></i> Add to Cart</button>
                    <button class="btn-gold" onclick="buyNow('${p.id}')" style="flex:1;" ${p.stock<=0?'disabled':''}><i class="fas fa-bolt"></i> Buy Now</button>
                </div>
            </div>`;
    });
}

function selectColor(color, el) {
    el.parentElement.querySelectorAll('div').forEach(d => { d.style.borderColor = '#ddd'; });
    el.style.borderColor = '#FFD700';
    const span = document.getElementById('sel-color');
    if (span) span.textContent = color;
    APP.selectedColor = color;
}

function selectSize(size, el) {
    el.parentElement.querySelectorAll('button').forEach(b => { b.style.background = '#f5f5f5'; b.style.color = '#333'; b.style.borderColor = '#ddd'; });
    el.style.background = '#FFD700'; el.style.color = '#fff'; el.style.borderColor = '#FFD700';
    const span = document.getElementById('sel-size');
    if (span) span.textContent = size;
    APP.selectedSize = size;
}

function updateQty(change) {
    const el = document.getElementById('qty');
    if (!el) return;
    let q = parseInt(el.textContent) + change;
    if (q < 1) q = 1; if (q > 99) q = 99;
    el.textContent = q;
    APP.quantity = q;
}

function addToCart(pid) {
    const p = APP.selectedProduct;
    if (!p) return;
    const item = {
        productId: pid, name: p.name, price: p.price,
        image: p.images?.[0]||'', color: APP.selectedColor,
        size: APP.selectedSize, quantity: APP.quantity,
        total: p.price * APP.quantity
    };
    const idx = APP.cart.findIndex(i => i.productId===pid && i.color===APP.selectedColor && i.size===APP.selectedSize);
    if (idx >= 0) { APP.cart[idx].quantity += APP.quantity; APP.cart[idx].total = APP.cart[idx].price * APP.cart[idx].quantity; }
    else APP.cart.push(item);
    localStorage.setItem('shoplify_cart', JSON.stringify(APP.cart));
    toast('Added to cart (' + APP.cart.length + ' items)', 'success');
}

function buyNow(pid) { addToCart(pid); goTo('checkout'); }

// ============ CHECKOUT ============
function loadCheckout() {
    if (!APP.authenticated) return;
    const c = document.getElementById('checkout-content');
    if (!c) return;
    
    if (!APP.cart.length) {
        c.innerHTML = '<div style="text-align:center;padding:60px;"><i class="fas fa-shopping-cart" style="font-size:60px;color:#ddd;"></i><h3>Cart Empty</h3><button class="btn-gold mt-20" onclick="goTo(\'marketplace\')">Shop</button></div>';
        return;
    }
    
    const total = APP.cart.reduce((s,i) => s + i.total, 0);
    
    c.innerHTML = `
        <h3>Checkout</h3>
        <div style="margin:16px 0;"><h4>📦 Shipping</h4>
            <div class="form-group"><label>Full Name *</label><input type="text" id="s-name" value="${APP.profile?.displayName||''}"></div>
            <div class="form-group"><label>Country *</label><select id="s-country">${COUNTRIES.map(c => `<option value="${c.code}" ${c.code===APP.country.code?'selected':''}>${c.flag} ${c.name}</option>`).join('')}</select></div>
            <div class="form-group"><label>State *</label><input type="text" id="s-state"></div>
            <div class="form-group"><label>City *</label><input type="text" id="s-city"></div>
            <div class="form-group"><label>Address *</label><input type="text" id="s-address"></div>
            <div class="form-group"><label>Postal Code *</label><input type="text" id="s-postal"></div>
            <div class="form-group"><label>Phone *</label><input type="tel" id="s-phone"></div>
        </div>
        <div style="background:#f9f9f9;border-radius:12px;padding:16px;margin:16px 0;">
            ${APP.cart.map((item,i) => `
                <div style="display:flex;gap:10px;padding:8px 0;border-bottom:1px solid #eee;align-items:center;">
                    <img src="${item.image||'app-icon.png'}" style="width:50px;height:50px;border-radius:8px;">
                    <div style="flex:1;"><p style="font-weight:600;">${item.name}</p><p style="font-size:11px;color:#999;">${item.color||''} ${item.size||''} ×${item.quantity}</p></div>
                    <p style="font-weight:700;color:#FFD700;">${fmt(item.total)}</p>
                    <button onclick="removeCartItem(${i})" style="background:none;border:none;color:#FF4444;cursor:pointer;">×</button>
                </div>
            `).join('')}
            <div style="display:flex;justify-content:space-between;padding:12px 0;font-size:16px;font-weight:700;border-top:2px solid #FFD700;"><span>Total</span><span style="color:#FFD700;">${fmt(total)}</span></div>
        </div>
        <p style="font-weight:600;">Balance: ${fmt(APP.profile?.walletBalance||0)}</p>
        <button class="btn-gold" onclick="processCheckout()" style="width:100%;" ${total>(APP.profile?.walletBalance||0)?'disabled':''}>${total>(APP.profile?.walletBalance||0)?'Insufficient Balance':'Pay '+fmt(total)}</button>
        <p style="font-size:11px;color:#999;text-align:center;margin-top:8px;">🔒 Funds held in escrow</p>
    `;
}

function removeCartItem(i) { APP.cart.splice(i,1); localStorage.setItem('shoplify_cart', JSON.stringify(APP.cart)); loadCheckout(); }

async function processCheckout() {
    const name = document.getElementById('s-name')?.value?.trim();
    const country = document.getElementById('s-country')?.value;
    const state = document.getElementById('s-state')?.value?.trim();
    const city = document.getElementById('s-city')?.value?.trim();
    const address = document.getElementById('s-address')?.value?.trim();
    const postal = document.getElementById('s-postal')?.value?.trim();
    const phone = document.getElementById('s-phone')?.value?.trim();
    
    if (!name||!country||!state||!city||!address||!postal||!phone) { toast('Fill all fields','error'); return; }
    if (!APP.cart.length) { toast('Cart empty','error'); return; }
    
    const total = APP.cart.reduce((s,i) => s + i.total, 0);
    await refreshProfile();
    if (total > (APP.profile?.walletBalance||0)) { toast('Insufficient balance','error'); return; }
    
    try {
        const orderId = 'ord_' + Date.now();
        const merchantIds = {};
        
        for (const item of APP.cart) {
            const pDoc = await db.collection('products').doc(item.productId).get();
            const p = pDoc.data();
            if (!p) continue;
            const mid = p.merchantId || 'unknown';
            if (!merchantIds[mid]) merchantIds[mid] = { merchantId: mid, items: [], total: 0 };
            merchantIds[mid].items.push(item);
            merchantIds[mid].total += item.total;
        }
        
        for (const [mid, od] of Object.entries(merchantIds)) {
            await db.collection('orders').doc(orderId + '_' + mid).set({
                userId: APP.user.uid, userEmail: APP.user.email, merchantId: mid,
                items: od.items, total: od.total, escrowAmount: od.total,
                status: 'processing', shipping: { name, country, state, city, address, postal, phone },
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            for (const item of od.items) {
                const pDoc = await db.collection('products').doc(item.productId).get();
                const p = pDoc.data();
                if (p) {
                    await db.collection('products').doc(item.productId).update({
                        stock: firebase.firestore.FieldValue.increment(-item.quantity),
                        totalSales: firebase.firestore.FieldValue.increment(item.quantity)
                    });
                }
            }
        }
        
        await db.collection('users').doc(APP.user.uid).update({
            walletBalance: firebase.firestore.FieldValue.increment(-total),
            escrowBalance: firebase.firestore.FieldValue.increment(total)
        });
        
        APP.cart = [];
        localStorage.removeItem('shoplify_cart');
        toast('✅ Order placed! Funds in escrow.', 'success');
        goTo('orders');
    } catch(e) {
        console.error('Checkout error:', e);
        toast('Error processing order', 'error');
    }
}

// ============ WALLET ============
function loadWallet() {
    if (!APP.authenticated) return;
    refreshProfile().then(() => {
        const c = document.getElementById('wallet-content');
        if (!c) return;
        
        c.innerHTML = `
            <div style="text-align:center;margin-bottom:16px;"><span style="font-size:40px;">${APP.country.flag}</span><p style="font-size:12px;color:#666;">${APP.country.name} · ${APP.country.currency}</p></div>
            <div class="wallet-full-card">
                <div style="text-align:center;margin-bottom:20px;"><p style="color:rgba(255,255,255,0.7);font-size:12px;">Available Balance</p><h1 style="font-size:42px;font-weight:800;color:#FFD700;">${fmt(APP.profile?.walletBalance||0)}</h1><p style="color:rgba(255,255,255,0.5);">≈ ${(APP.profile?.walletBalance||0)*APP.exchangeRate} ${APP.country.currency}</p></div>
                <div class="wallet-balance-row"><span>Pending</span><span>${fmt(APP.profile?.pendingBalance||0)}</span></div>
                <div class="wallet-balance-row"><span>Escrow</span><span>${fmt(APP.profile?.escrowBalance||0)}</span></div>
                <div class="wallet-balance-row"><span>Affiliate Earnings</span><span>${fmt(APP.profile?.affiliateEarnings||0)}</span></div>
                <div class="wallet-balance-row"><span>Withdrawn</span><span>${fmt(APP.profile?.withdrawnBalance||0)}</span></div>
            </div>
            <div style="display:flex;gap:10px;margin-bottom:20px;">
                <button class="btn-gold" onclick="showDeposit()" style="flex:1;">Deposit</button>
                <button class="btn-gold" onclick="showWithdraw()" style="flex:1;">Withdraw</button>
            </div>
            <div class="section"><div class="section-header"><h3>Bank Accounts</h3><button class="btn-text" onclick="showAddBank()">+ Add</button></div><div id="bank-list">${renderBanks(APP.profile?.bankAccounts||[])}</div></div>
        `;
    });
}

function renderBanks(accounts) {
    if (!accounts.length) return '<p style="text-align:center;color:#999;padding:20px;">No accounts</p>';
    return accounts.map(a => `
        <div class="bank-account-card">
            <div><p style="font-weight:600;">${a.bankName}</p><p style="font-size:12px;color:#666;">${a.accountName} · ****${a.accountNumber.slice(-4)}</p>${a.isPrimary?'<span style="background:#E8F5E9;color:#2E7D32;padding:2px 8px;border-radius:10px;font-size:10px;">PRIMARY</span>':''}</div>
            <div>${!a.isPrimary?`<button class="btn-small-gold" onclick="setPrimary('${a.id}')">Set Primary</button>`:''}<button onclick="disableBank('${a.id}')" style="background:none;border:none;color:#FF4444;cursor:pointer;"><i class="fas fa-ban"></i></button></div>
        </div>`).join('');
}

function showDeposit() {
    openModal(`
        <h3>Deposit ${APP.country.flag}</h3>
        <p style="color:#666;">Min: $5 | Max: $10,000 | Rate: 1 USD = ${APP.exchangeRate} ${APP.country.currency}</p>
        <div class="form-group"><label>Amount (${APP.country.currency})</label><input type="number" id="dep-local" oninput="document.getElementById('dep-usd').value=(this.value/${APP.exchangeRate}).toFixed(2)"></div>
        <div class="form-group"><label>Amount (USD)</label><input type="text" id="dep-usd" readonly style="background:#f5f5f5;"></div>
        <button class="btn-gold mt-10" onclick="processDeposit()" style="width:100%;">Pay with Flutterwave</button>
        <button class="btn-outline mt-10" onclick="closeModal()" style="width:100%;">Cancel</button>
    `);
}

function processDeposit() {
    const usd = parseFloat(document.getElementById('dep-usd')?.value);
    if (!usd || usd < 5) { toast('Minimum $5','error'); return; }
    if (usd > 10000) { toast('Maximum $10,000','error'); return; }
    closeModal();
    
    FlutterwaveCheckout({
        public_key: CONFIG.flutterwaveKey,
        tx_ref: 'dep_' + Date.now(),
        amount: usd,
        currency: 'USD',
        customer: { email: APP.user.email, name: APP.profile?.displayName },
        callback: function(res) {
            if (res.status === 'successful') {
                db.collection('users').doc(APP.user.uid).update({ walletBalance: firebase.firestore.FieldValue.increment(usd) });
                toast('✅ Deposited!', 'success');
                loadWallet();
            }
        },
        onclose: function() { toast('Cancelled', 'warning'); }
    });
}

function showWithdraw() {
    const accounts = (APP.profile?.bankAccounts||[]).filter(a => !a.disabled);
    const primary = accounts.find(a => a.isPrimary) || accounts[0];
    if (!primary) { toast('Add bank account first','warning'); showAddBank(); return; }
    
    openModal(`
        <h3>Withdraw ${APP.country.flag}</h3>
        <p style="color:#666;">Available: ${fmt(APP.profile?.walletBalance||0)} | Min: $5 | Max: $10,000</p>
        <div class="form-group"><label>Amount (USD)</label><input type="number" id="wd-usd" oninput="document.getElementById('wd-local').value=(this.value*${APP.exchangeRate}).toFixed(2)"></div>
        <div class="form-group"><label>You receive (${APP.country.currency})</label><input type="text" id="wd-local" readonly style="background:#f5f5f5;"></div>
        <div class="form-group"><label>Account</label><select id="wd-bank">${accounts.map(a => `<option value="${a.id}" ${a.isPrimary?'selected':''}>${a.bankName} - ****${a.accountNumber.slice(-4)}</option>`).join('')}</select></div>
        <button class="btn-gold mt-10" onclick="processWithdraw()" style="width:100%;">Withdraw</button>
        <button class="btn-outline mt-10" onclick="closeModal()" style="width:100%;">Cancel</button>
    `);
}

async function processWithdraw() {
    const usd = parseFloat(document.getElementById('wd-usd')?.value);
    const bankId = document.getElementById('wd-bank')?.value;
    if (!usd || usd < 5) { toast('Minimum $5','error'); return; }
    if (usd > (APP.profile?.walletBalance||0)) { toast('Insufficient balance','error'); return; }
    
    closeModal();
    const bank = APP.profile.bankAccounts.find(a => a.id === bankId);
    await db.collection('users').doc(APP.user.uid).update({
        walletBalance: firebase.firestore.FieldValue.increment(-usd),
        withdrawnBalance: firebase.firestore.FieldValue.increment(usd)
    });
    await db.collection('withdrawals').add({
        userId: APP.user.uid, amount: usd, bankAccount: bank, status: 'pending',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    toast('✅ Withdrawal submitted!','success');
    loadWallet();
}

function showAddBank() {
    const banks = getBanksForCountry(APP.country.code);
    openModal(`
        <h3>Add Bank ${APP.country.flag}</h3>
        <div class="form-group"><label>Bank</label><select id="bank-name">${banks.map(b => `<option>${b.name}</option>`).join('')}</select></div>
        <div class="form-group"><label>Account Name</label><input type="text" id="acct-name"></div>
        <div class="form-group"><label>Account Number</label><input type="text" id="acct-num"></div>
        <button class="btn-gold mt-10" onclick="addBank()" style="width:100%;">Save</button>
        <button class="btn-outline mt-10" onclick="closeModal()" style="width:100%;">Cancel</button>
    `);
}

async function addBank() {
    const name = document.getElementById('bank-name')?.value;
    const acctName = document.getElementById('acct-name')?.value?.trim();
    const acctNum = document.getElementById('acct-num')?.value?.trim();
    if (!name||!acctName||!acctNum) { toast('Fill all fields','error'); return; }
    
    const accounts = [...(APP.profile?.bankAccounts||[])];
    const isPrimary = accounts.length === 0;
    if (isPrimary) accounts.forEach(a => a.isPrimary = false);
    accounts.push({ id: 'bank_'+Date.now(), bankName: name, accountName: acctName, accountNumber: acctNum, isPrimary, disabled: false });
    await db.collection('users').doc(APP.user.uid).update({ bankAccounts: accounts });
    closeModal();
    toast('✅ Bank added!','success');
    loadWallet();
}

async function setPrimary(id) {
    const accounts = APP.profile.bankAccounts.map(a => ({...a, isPrimary: a.id===id}));
    await db.collection('users').doc(APP.user.uid).update({ bankAccounts: accounts });
    loadWallet();
}

async function disableBank(id) {
    if (!confirm('Disable account?')) return;
    const accounts = APP.profile.bankAccounts.map(a => a.id===id ? {...a, disabled:true, isPrimary:false} : a);
    const active = accounts.filter(a => !a.disabled);
    if (active.length && !active.find(a => a.isPrimary)) active[0].isPrimary = true;
    await db.collection('users').doc(APP.user.uid).update({ bankAccounts: accounts });
    loadWallet();
}

// ============ AFFILIATE ============
function loadAffiliate() {
    if (!APP.authenticated) return;
    refreshProfile().then(() => {
        const c = document.getElementById('affiliate-content');
        if (!c) return;
        
        if (!APP.profile?.isAffiliate) {
            c.innerHTML = `<div style="text-align:center;padding:20px;">
                <div class="subscription-banner"><i class="fas fa-link" style="font-size:48px;"></i><h3>Become an Affiliate</h3><p>Earn commissions promoting products.</p><p style="font-size:20px;font-weight:700;">$3/month</p>
                <button class="btn-gold" onclick="subscribeAffiliate()" style="width:100%;">Subscribe Now</button></div></div>`;
            return;
        }
        
        db.collection('affiliate_products').where('affiliateId','==',APP.user.uid).where('status','==','active').get().then(snap => {
            const products = snap.docs.map(d => ({id:d.id,...d.data()}));
            const clicks = products.reduce((s,p) => s + (p.clicks||0), 0);
            const conversions = products.reduce((s,p) => s + (p.conversions||0), 0);
            
            c.innerHTML = `
                <div class="affiliate-stats">
                    <div class="affiliate-stat-card"><p style="font-size:24px;font-weight:800;color:#FFD700;">${fmt(APP.profile?.affiliateEarnings||0)}</p><p style="font-size:11px;">Earnings</p></div>
                    <div class="affiliate-stat-card"><p style="font-size:24px;font-weight:800;color:#FFBB33;">${fmt(APP.profile?.pendingEarnings||0)}</p><p style="font-size:11px;">Pending</p></div>
                    <div class="affiliate-stat-card"><p style="font-size:24px;font-weight:800;color:#00C851;">${fmt((APP.profile?.affiliateEarnings||0)-(APP.profile?.pendingEarnings||0))}</p><p style="font-size:11px;">Available</p></div>
                </div>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:20px;">
                    <div style="background:#fff;padding:12px;border-radius:12px;text-align:center;"><p style="font-size:20px;font-weight:700;">${clicks}</p><p style="font-size:11px;color:#999;">Clicks</p></div>
                    <div style="background:#fff;padding:12px;border-radius:12px;text-align:center;"><p style="font-size:20px;font-weight:700;">${conversions}</p><p style="font-size:11px;color:#999;">Sales</p></div>
                    <div style="background:#fff;padding:12px;border-radius:12px;text-align:center;"><p style="font-size:20px;font-weight:700;">${clicks?((conversions/clicks)*100).toFixed(1):'0'}%</p><p style="font-size:11px;color:#999;">Rate</p></div>
                </div>
                <button class="btn-gold mb-20" onclick="goTo('marketplace')" style="width:100%;">Access Products</button>
                <h3>My Products (${products.length})</h3>
                ${products.map(p => `
                    <div class="affiliate-product-card">
                        <img src="${p.productImage||'app-icon.png'}" style="width:70px;height:70px;border-radius:10px;">
                        <div style="flex:1;"><p style="font-weight:600;">${p.productName}</p><p style="font-size:12px;color:#00C851;">${fmt(p.productPrice)} | +${p.commissionPercentage}%</p><p onclick="copyText('${p.affiliateLink}')" style="color:#33B5E5;font-size:11px;cursor:pointer;">📋 Copy Link</p></div>
                    </div>`).join('') || '<p style="text-align:center;color:#999;">No products installed</p>'}
            `;
        });
    });
}

function subscribeAffiliate() {
    FlutterwaveCheckout({
        public_key: CONFIG.flutterwaveKey,
        tx_ref: 'aff_' + Date.now(),
        amount: CONFIG.affiliatePrice,
        currency: 'USD',
        customer: { email: APP.user.email },
        callback: function(res) {
            if (res.status === 'successful') {
                db.collection('users').doc(APP.user.uid).update({ isAffiliate: true, affiliateSubscription: 'active' });
                toast('🎉 Welcome!', 'success');
                loadAffiliate();
            }
        }
    });
}

function installProduct(productId) {
    const c = document.getElementById('affiliate-install-content');
    if (!c) return;
    
    c.innerHTML = `<div style="text-align:center;padding:40px;"><img src="app-icon.png" width="100" style="border-radius:20px;animation:pulse 1.5s infinite;"><h3>Installing...</h3><div style="width:100%;height:6px;background:#eee;border-radius:3px;margin:20px 0;"><div id="inst-fill" style="height:100%;background:#FFD700;width:0%;"></div></div><p id="inst-status">Analyzing...</p></div>`;
    
    let prog = 0;
    const stages = [{p:25,t:'Checking...'},{p:50,t:'Generating link...'},{p:75,t:'Setting up...'},{p:100,t:'Complete!'}];
    let i = 0;
    
    const timer = setInterval(() => {
        if (i >= stages.length) { clearInterval(timer); finishInstall(productId, c); return; }
        const s = stages[i];
        document.getElementById('inst-fill').style.width = s.p + '%';
        document.getElementById('inst-status').textContent = s.t;
        prog = s.p;
        i++;
    }, 1200);
}

async function finishInstall(productId, c) {
    const pDoc = await db.collection('products').doc(productId).get();
    const p = pDoc.data();
    if (!p) { c.innerHTML = '<p style="text-align:center;color:red;">Error</p>'; return; }
    
    const link = 'https://thriving-fox-84eb56.netlify.app/r/' + APP.user.uid + '/' + productId;
    await db.collection('affiliate_products').add({
        affiliateId: APP.user.uid, productId, productName: p.name,
        productImage: p.images?.[0]||'', productPrice: p.price,
        commissionPercentage: p.commissionPercentage||0, affiliateLink: link,
        status: 'active', clicks: 0, conversions: 0, totalCommission: 0,
        installedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    c.innerHTML = `<div style="text-align:center;padding:40px;"><i class="fas fa-check-circle" style="font-size:60px;color:#00C851;"></i><h3>Installed!</h3><p>${p.name}</p><div style="background:#f5f5f5;padding:16px;border-radius:12px;margin:16px 0;word-break:break-all;"><p style="color:#33B5E5;">${link}</p><button class="btn-small-gold" onclick="copyText('${link}')">Copy Link</button></div><button class="btn-gold" onclick="goTo('affiliate')">Dashboard</button></div>`;
}

// ============ MERCHANT ============
function loadMerchant() {
    if (!APP.authenticated) return;
    refreshProfile().then(() => {
        const c = document.getElementById('merchant-content');
        if (!c) return;
        
        if (!APP.profile?.isMerchant) {
            c.innerHTML = `<div style="text-align:center;padding:20px;"><div class="subscription-banner"><i class="fas fa-store" style="font-size:48px;"></i><h3>Become a Merchant</h3><p>Sell products globally.</p><p style="font-size:20px;font-weight:700;">$2/month</p><button class="btn-gold" onclick="subscribeMerchant()" style="width:100%;">Subscribe Now</button></div></div>`;
            return;
        }
        
        if (!APP.profile?.storeActive) {
            c.innerHTML = `<div style="text-align:center;padding:40px;"><i class="fas fa-store" style="font-size:48px;color:#FFD700;"></i><h3>Set Up Store</h3><button class="btn-gold mt-20" onclick="goTo('store-setup')">Set Up</button></div>`;
            return;
        }
        
        db.collection('products').where('merchantId','==',APP.user.uid).get().then(snap => {
            const products = snap.docs.map(d => ({id:d.id,...d.data()}));
            c.innerHTML = `
                <div style="display:flex;gap:10px;margin-bottom:16px;">
                    <button class="btn-gold" onclick="goTo('add-product')" style="flex:1;">+ Add Product</button>
                    <button class="btn-gold" onclick="goTo('store-setup')" style="flex:1;">Edit Store</button>
                </div>
                <h3>My Products (${products.length})</h3>
                ${products.map(p => `<div style="display:flex;gap:10px;background:#fff;padding:10px;border-radius:10px;margin-bottom:8px;"><img src="${p.images?.[0]||'app-icon.png'}" style="width:50px;height:50px;border-radius:8px;"><div style="flex:1;"><p style="font-weight:600;">${p.name}</p><p style="color:#FFD700;">${fmt(p.price)}</p></div><button class="btn-small-gold" onclick="toggleProduct('${p.id}','${p.status}')">${p.status==='active'?'Disable':'Enable'}</button></div>`).join('') || '<p style="text-align:center;color:#999;">No products</p>'}
            `;
        });
    });
}

function subscribeMerchant() {
    FlutterwaveCheckout({
        public_key: CONFIG.flutterwaveKey,
        tx_ref: 'mer_' + Date.now(),
        amount: CONFIG.merchantPrice,
        currency: 'USD',
        customer: { email: APP.user.email },
        callback: function(res) {
            if (res.status === 'successful') {
                db.collection('users').doc(APP.user.uid).update({ isMerchant: true, merchantSubscription: 'active' });
                toast('🎉 Welcome!', 'success');
                goTo('store-setup');
            }
        }
    });
}

async function toggleProduct(id, status) {
    await db.collection('products').doc(id).update({ status: status === 'active' ? 'disabled' : 'active' });
    toast('Updated', 'success');
    loadMerchant();
}

// ============ STORE SETUP ============
function loadStoreSetup() {
    const c = document.getElementById('store-setup-content');
    if (!c) return;
    
    c.innerHTML = `
        <h3>🏪 Store Setup</h3>
        <p style="color:#666;">Choose a template</p>
        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin:16px 0;">
            ${STORE_TEMPLATES.map(t => `
                <div onclick="selectTemplate('${t.id}',this)" style="border:2px solid ${APP.profile?.storeTemplate===t.id?'#FFD700':'#ddd'};border-radius:12px;overflow:hidden;cursor:pointer;text-align:center;">
                    <div style="background:${t.color};padding:40px;font-size:48px;">${t.icon}</div>
                    <p style="padding:8px;font-weight:600;">${t.name}</p>
                </div>`).join('')}
        </div>
        <div class="form-group"><label>Store Name</label><input type="text" id="store-name" value="${APP.profile?.storeName||'My Store'}"></div>
        <button class="btn-gold mt-10" onclick="saveStore()" style="width:100%;">${APP.profile?.storeActive?'Update':'Launch'} Store</button>
    `;
}

let selectedTemplate = null;
function selectTemplate(id, el) {
    document.querySelectorAll('.store-template-card, [onclick*="selectTemplate"]').forEach(c => { c.style.border = '2px solid #ddd'; });
    el.style.border = '2px solid #FFD700';
    selectedTemplate = id;
}

async function saveStore() {
    const template = selectedTemplate || APP.profile?.storeTemplate;
    if (!template) { toast('Select template','warning'); return; }
    const name = document.getElementById('store-name')?.value?.trim() || 'My Store';
    await db.collection('users').doc(APP.user.uid).update({ storeTemplate: template, storeName: name, storeActive: true });
    toast('✅ Store launched!', 'success');
    goTo('merchant');
}

// ============ ADD PRODUCT ============
function loadAddProduct() {
    const c = document.getElementById('add-product-content');
    if (!c) return;
    c.innerHTML = `
        <h3>Add Product</h3>
        <div class="form-group"><label>Name *</label><input type="text" id="ap-name"></div>
        <div class="form-group"><label>Price (USD) *</label><input type="number" id="ap-price" step="0.01"></div>
        <div class="form-group"><label>Category *</label><select id="ap-cat"><option value="">Select</option>${CATEGORIES.map(c=>`<option>${c}</option>`).join('')}</select></div>
        <div class="form-group"><label>Stock *</label><input type="number" id="ap-stock"></div>
        <div class="form-group"><label>Commission (%)</label><input type="number" id="ap-comm" value="10" step="0.1"></div>
        <div class="form-group"><label>Colors</label><input type="text" id="ap-colors" placeholder="Black,White,Red"></div>
        <div class="form-group"><label>Sizes</label><input type="text" id="ap-sizes" placeholder="S,M,L,XL"></div>
        <div class="form-group"><label>Description</label><textarea id="ap-desc" rows="3"></textarea></div>
        <div class="form-group"><label>Images (up to 5)</label><input type="file" id="ap-images" accept="image/*" multiple onchange="previewImgs()"><div id="img-preview" style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;"></div></div>
        <div class="form-group"><label>Video (optional)</label><input type="file" id="ap-video" accept="video/*"><video id="vid-preview" controls style="width:100%;max-height:200px;display:none;"></video></div>
        <button class="btn-gold mt-10" onclick="submitProduct()" style="width:100%;">Publish</button>
    `;
}

function previewImgs() {
    const files = document.getElementById('ap-images')?.files;
    const p = document.getElementById('img-preview');
    if (!p) return;
    p.innerHTML = '';
    Array.from(files||[]).slice(0,5).forEach(f => {
        const r = new FileReader();
        r.onload = e => { p.innerHTML += `<img src="${e.target.result}" style="width:80px;height:80px;object-fit:cover;border-radius:8px;">`; };
        r.readAsDataURL(f);
    });
}

async function submitProduct() {
    const name = document.getElementById('ap-name')?.value?.trim();
    const price = parseFloat(document.getElementById('ap-price')?.value);
    const cat = document.getElementById('ap-cat')?.value;
    const stock = parseInt(document.getElementById('ap-stock')?.value);
    if (!name||!price||!cat||!stock) { toast('Fill required fields','error'); return; }
    
    const comm = parseFloat(document.getElementById('ap-comm')?.value)||0;
    const colors = document.getElementById('ap-colors')?.value?.split(',').map(s=>s.trim()).filter(Boolean)||[];
    const sizes = document.getElementById('ap-sizes')?.value?.split(',').map(s=>s.trim()).filter(Boolean)||[];
    const desc = document.getElementById('ap-desc')?.value?.trim()||'';
    
    // Upload images to Cloudinary
    const imgFiles = document.getElementById('ap-images')?.files || [];
    const imgUrls = [];
    for (let i = 0; i < Math.min(imgFiles.length, 5); i++) {
        const formData = new FormData();
        formData.append('file', imgFiles[i]);
        formData.append('upload_preset', CONFIG.cloudinaryPreset);
        const res = await fetch(CONFIG.cloudinaryUrl, { method: 'POST', body: formData });
        const data = await res.json();
        if (data.secure_url) imgUrls.push(data.secure_url);
    }
    
    await db.collection('products').add({
        name, price, category: cat, stock, commissionPercentage: comm,
        colors, sizes, description: desc, images: imgUrls,
        merchantId: APP.user.uid, merchantName: APP.profile?.displayName||'Unknown',
        status: 'active', avgRating: 0, reviewCount: 0, totalSales: 0,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    toast('✅ Product published!','success');
    goTo('merchant');
}

// ============ ORDERS ============
function loadOrders() {
    if (!APP.authenticated || !db) return;
    const c = document.getElementById('orders-content');
    if (!c) return;
    
    db.collection('orders').where('userId','==',APP.user.uid).orderBy('createdAt','desc').limit(30).get()
        .then(snap => {
            if (snap.empty) { c.innerHTML = '<p style="text-align:center;padding:60px;color:#999;">No orders</p>'; return; }
            c.innerHTML = snap.docs.map(doc => {
                const o = doc.data();
                const statuses = { processing:'⏳ Processing', shipped:'📦 Shipped', delivered:'📬 Delivered', completed:'✅ Completed', disputed:'🚨 Disputed' };
                return `<div style="background:#fff;border-radius:12px;padding:16px;margin-bottom:12px;">
                    <div style="display:flex;justify-content:space-between;"><p style="font-weight:600;">#${doc.id.slice(-8)}</p><span>${statuses[o.status]||o.status}</span></div>
                    <p style="color:#666;">${o.items?.[0]?.name||'Product'} ×${o.items?.[0]?.quantity||1}</p>
                    <p style="font-weight:700;color:#FFD700;">${fmt(o.total)}</p>
                    ${o.status==='delivered'?`<button class="btn-gold mt-10" onclick="confirmDelivery('${doc.id}')">✅ Confirm Delivery</button>`:''}
                    ${['processing','shipped'].includes(o.status)?`<button class="btn-outline mt-10" style="color:#FF4444;border-color:#FF4444;" onclick="openDispute('${doc.id}')">🚨 Report</button>`:''}
                </div>`;
            }).join('');
        });
}

async function confirmDelivery(orderId) {
    if (!confirm('Confirm delivery? Payment will be released.')) return;
    await db.collection('orders').doc(orderId).update({ status: 'completed', deliveryConfirmed: true });
    toast('✅ Confirmed!','success');
    loadOrders();
}

function openDispute(orderId) {
    openModal(`<h3>🚨 Report Problem</h3>
        <div class="form-group"><label>Issue</label><select id="disp-type"><option>Not Received</option><option>Wrong Item</option><option>Damaged</option></select></div>
        <div class="form-group"><label>Description</label><textarea id="disp-desc" rows="3"></textarea></div>
        <button class="btn-gold mt-10" onclick="submitDispute('${orderId}')" style="width:100%;">Submit</button>
        <button class="btn-outline mt-10" onclick="closeModal()" style="width:100%;">Cancel</button>`);
}

async function submitDispute(orderId) {
    const type = document.getElementById('disp-type')?.value;
    const desc = document.getElementById('disp-desc')?.value?.trim();
    if (!desc) { toast('Describe the issue','error'); return; }
    closeModal();
    await db.collection('disputes').add({ orderId, userId: APP.user.uid, type, description: desc, status: 'open', createdAt: firebase.firestore.FieldValue.serverTimestamp() });
    await db.collection('orders').doc(orderId).update({ disputed: true, status: 'disputed' });
    toast('✅ Dispute filed','success');
    loadOrders();
}

// ============ ADMIN ============
function loadAdmin() {
    if (APP.user?.email !== CONFIG.adminEmail) { toast('Access denied','error'); goTo('home'); return; }
    const c = document.getElementById('admin-content');
    if (!c) return;
    
    Promise.all([
        db.collection('users').get(),
        db.collection('products').get(),
        db.collection('disputes').where('status','==','open').get(),
        db.collection('withdrawals').where('status','==','pending').get()
    ]).then(([users, products, disputes, withdrawals]) => {
        c.innerHTML = `
            <h3>🔐 Admin Panel</h3>
            <div class="admin-stats-grid">
                <div class="admin-stat-card"><p style="font-size:28px;font-weight:800;color:#FFD700;">${users.size}</p><p>Users</p></div>
                <div class="admin-stat-card"><p style="font-size:28px;font-weight:800;color:#33B5E5;">${products.size}</p><p>Products</p></div>
                <div class="admin-stat-card"><p style="font-size:28px;font-weight:800;color:#FF4444;">${disputes.size}</p><p>Disputes</p></div>
                <div class="admin-stat-card"><p style="font-size:28px;font-weight:800;color:#FFBB33;">${withdrawals.size}</p><p>Withdrawals</p></div>
            </div>
            <h4 style="margin:16px 0;">🚨 Open Disputes</h4>
            ${disputes.docs.map(d => {
                const d2 = d.data();
                return `<div style="background:#fff;padding:12px;border-radius:10px;margin-bottom:8px;"><p>Order: ${d2.orderId?.slice(-8)}</p><p>${d2.type}: ${d2.description}</p>
                <div style="display:flex;gap:8px;margin-top:8px;">
                    <button class="btn-small-gold" onclick="resolveDisp('${d.id}','refund')">Refund</button>
                    <button class="btn-small-gold" onclick="resolveDisp('${d.id}','release')">Release</button>
                </div></div>`;
            }).join('') || '<p style="color:#999;">No open disputes</p>'}
            
            <h4 style="margin:16px 0;">💰 Pending Withdrawals</h4>
            ${withdrawals.docs.map(d => {
                const w = d.data();
                return `<div style="background:#fff;padding:12px;border-radius:10px;margin-bottom:8px;"><p>${fmt(w.amount)} - ${w.userId}</p>
                <button class="btn-small-gold" onclick="approveWD('${d.id}')">✅ Approve</button></div>`;
            }).join('') || '<p style="color:#999;">No pending withdrawals</p>'}
        `;
    });
}

async function resolveDisp(id, resolution) {
    const disp = await db.collection('disputes').doc(id).get();
    const d = disp.data();
    const order = await db.collection('orders').doc(d.orderId).get();
    const o = order.data();
    
    if (resolution === 'refund') {
        await db.collection('users').doc(o.userId).update({ walletBalance: firebase.firestore.FieldValue.increment(o.escrowAmount||o.total) });
    }
    await db.collection('disputes').doc(id).update({ status: 'resolved', resolution });
    await db.collection('orders').doc(d.orderId).update({ status: resolution==='refund'?'cancelled':'completed' });
    toast('Resolved','success');
    loadAdmin();
}

async function approveWD(id) {
    await db.collection('withdrawals').doc(id).update({ status: 'approved' });
    toast('Approved','success');
    loadAdmin();
}

// ============ PROFILE ============
function loadProfile() {
    if (!APP.authenticated) return;
    refreshProfile().then(() => {
        const c = document.getElementById('profile-content');
        if (!c) return;
        const p = APP.profile || {};
        
        c.innerHTML = `
            <div style="background:linear-gradient(135deg,#FFD700,#E6C200);border-radius:16px;padding:24px;text-align:center;color:#fff;margin-bottom:20px;">
                <img src="${p.photoURL||APP.user?.photoURL||'app-icon.png'}" style="width:80px;height:80px;border-radius:50%;border:4px solid #fff;">
                <h3>${p.displayName||p.username||'User'}</h3>
                <p>${p.email} ${APP.country.flag}</p>
                <p style="font-size:20px;font-weight:700;">${fmt(p.walletBalance||0)}</p>
                <span style="background:rgba(255,255,255,0.3);padding:4px 12px;border-radius:12px;font-size:11px;">${p.membership||'free'} Member</span>
            </div>
            
            ${!p.isMerchant ? `<div style="background:#fff;border-radius:12px;padding:16px;margin-bottom:16px;text-align:center;"><i class="fas fa-store" style="font-size:32px;color:#FFD700;"></i><h4>Start Selling</h4><p style="color:#666;">$2/month</p><button class="btn-gold mt-10" onclick="subscribeMerchant()">Create Store</button></div>` : ''}
            
            <div style="background:#25D366;border-radius:16px;padding:24px;text-align:center;color:#fff;margin-bottom:16px;">
                <i class="fab fa-whatsapp" style="font-size:48px;"></i>
                <h3>Join Our WhatsApp Community</h3>
                <p style="font-size:13px;">Updates on products, campaigns & support</p>
                <a href="${CONFIG.whatsappLink}" target="_blank" style="display:inline-block;background:#fff;color:#25D366;padding:12px 24px;border-radius:12px;text-decoration:none;font-weight:700;margin-top:8px;">Join Now</a>
            </div>
            
            <div style="background:#fff;border-radius:12px;overflow:hidden;">
                <div class="profile-menu-item" onclick="goTo('orders')"><i class="fas fa-box"></i> Orders</div>
                <div class="profile-menu-item" onclick="goTo('wallet')"><i class="fas fa-wallet"></i> Wallet</div>
                <div class="profile-menu-item" onclick="goTo('affiliate')"><i class="fas fa-link"></i> Affiliates</div>
                <div class="profile-menu-item" onclick="goTo('merchant')"><i class="fas fa-store"></i> Merchant</div>
                <div class="profile-menu-item" onclick="goTo('settings')"><i class="fas fa-cog"></i> Settings</div>
                <div class="profile-menu-item" style="color:#FF4444;" onclick="signOut()"><i class="fas fa-sign-out-alt" style="color:#FF4444;"></i> Logout</div>
            </div>
            <p style="text-align:center;font-size:11px;color:#ccc;margin-top:20px;">Shoplify v${CONFIG.version} · Powered by Rev</p>
        `;
    });
}

// ============ SETTINGS ============
function loadSettings() {
    const c = document.getElementById('settings-content');
    if (!c) return;
    c.innerHTML = `
        <h3>⚙️ Settings</h3>
        <div class="settings-section"><h4>Profile</h4><div class="settings-item" onclick="changeUname()"><span>Username</span><span>${APP.profile?.username||APP.user?.displayName||''} <i class="fas fa-chevron-right"></i></span></div></div>
        <div class="settings-section"><h4>Appearance</h4>
            <div class="settings-item"><span>Theme</span><select onchange="changeTheme(this.value)"><option>Light</option><option>Dark</option></select></div>
            <div class="settings-item"><span>Text Size</span><select onchange="changeTextSize(this.value)"><option>Small</option><option selected>Medium</option><option>Large</option></select></div>
        </div>
        <div class="settings-section"><h4>About</h4><div class="settings-item"><span>Version</span><span>${CONFIG.version}</span></div></div>
        <div class="settings-section"><h4>Account</h4><div class="settings-item" onclick="signOut()" style="color:#FF4444;"><span style="color:#FF4444;">Sign Out</span></div></div>
    `;
}

function changeUname() {
    openModal(`<h3>Change Username</h3><input type="text" id="new-uname" value="${APP.profile?.username||''}"><button class="btn-gold mt-10" onclick="saveUname()" style="width:100%;">Save</button>`);
}

async function saveUname() {
    const n = document.getElementById('new-uname')?.value?.trim();
    if (!n) { toast('Enter username','error'); return; }
    await db.collection('users').doc(APP.user.uid).update({ username: n });
    closeModal();
    toast('Updated','success');
}

function changeTheme(t) { document.body.style.background = t==='Dark'?'#1a1a1a':'#fff'; }

function changeTextSize(s) {
    const sizes = { Small:'14px', Medium:'16px', Large:'18px' };
    document.documentElement.style.fontSize = sizes[s] || '16px';
}

// ============ UTILITIES ============
function toast(msg, type) {
    const c = document.getElementById('toast-container');
    if (!c) return;
    const icons = { success:'✅', error:'❌', warning:'⚠️', info:'ℹ️' };
    const el = document.createElement('div');
    el.className = 'toast ' + (type||'info');
    el.textContent = (icons[type]||'') + ' ' + msg;
    c.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, 3000);
}

function fmt(amount) {
    if (!amount) return '$0.00';
    return '$' + parseFloat(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function openModal(content) {
    const mc = document.getElementById('modal-content');
    const m = document.getElementById('modal-container');
    if (mc && m) { mc.innerHTML = content; m.style.display = 'flex'; }
}

function closeModal() {
    const m = document.getElementById('modal-container');
    if (m) m.style.display = 'none';
}

function copyText(text) {
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => toast('Copied!','success'));
    else toast('Copy manually','warning');
}

async function refreshProfile() {
    if (!APP.user || !db) return;
    const doc = await db.collection('users').doc(APP.user.uid).get();
    if (doc.exists) APP.profile = doc.data();
}

async function detectCountry() {
    try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        const country = getCountryByCode(data.country_code);
        if (country) {
            APP.country = country;
            APP.exchangeRate = getExchangeRate(country.currency);
        }
    } catch(e) { console.log('Country detection skipped'); }
}

// ============ TRACK AFFILIATE CLICKS ============
(function() {
    const match = window.location.pathname.match(/\/r\/([^\/]+)\/([^\/]+)/);
    if (match && db) {
        db.collection('affiliate_products').where('affiliateId','==',match[1]).where('productId','==',match[2]).where('status','==','active').limit(1).get()
            .then(snap => {
                if (!snap.empty) {
                    db.collection('affiliate_products').doc(snap.docs[0].id).update({ clicks: firebase.firestore.FieldValue.increment(1) });
                }
            });
    }
})();

// ============ INITIALIZATION ============
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Shoplify starting...');
    
    const timer = startLoader();
    
    if (!initFirebase()) {
        finishLoader(timer);
        hideLoader();
        goTo('onboarding');
        return;
    }
    
    detectCountry().then(() => {
        auth.onAuthStateChanged(function(user) {
            finishLoader(timer);
            
            if (user) {
                APP.user = user;
                APP.authenticated = true;
                db.collection('users').doc(user.uid).get().then(doc => {
                    if (doc.exists) APP.profile = doc.data();
                });
                hideLoader();
                goTo(user.email === CONFIG.adminEmail ? 'admin' : 'home');
            } else {
                APP.user = null;
                APP.authenticated = false;
                hideLoader();
                goTo('onboarding');
            }
        });
    });
    
    // Restore cart
    try {
        const saved = localStorage.getItem('shoplify_cart');
        if (saved) APP.cart = JSON.parse(saved);
    } catch(e) {}
    
    // Save cart periodically
    setInterval(() => {
        if (APP.cart.length) localStorage.setItem('shoplify_cart', JSON.stringify(APP.cart));
    }, 5000);
});

// ============ EXPORT ============
window.goTo = goTo;
window.goBack = goBack;
window.signInWithGoogle = signInWithGoogle;
window.signOut = signOut;
window.loadHome = loadHome;
window.selectColor = selectColor;
window.selectSize = selectSize;
window.updateQty = updateQty;
window.addToCart = addToCart;
window.buyNow = buyNow;
window.processCheckout = processCheckout;
window.removeCartItem = removeCartItem;
window.showDeposit = showDeposit;
window.processDeposit = processDeposit;
window.showWithdraw = showWithdraw;
window.processWithdraw = processWithdraw;
window.showAddBank = showAddBank;
window.addBank = addBank;
window.setPrimary = setPrimary;
window.disableBank = disableBank;
window.subscribeAffiliate = subscribeAffiliate;
window.subscribeMerchant = subscribeMerchant;
window.saveStore = saveStore;
window.selectTemplate = selectTemplate;
window.submitProduct = submitProduct;
window.previewImgs = previewImgs;
window.toggleProduct = toggleProduct;
window.confirmDelivery = confirmDelivery;
window.openDispute = openDispute;
window.submitDispute = submitDispute;
window.resolveDisp = resolveDisp;
window.approveWD = approveWD;
window.changeUname = changeUname;
window.saveUname = saveUname;
window.changeTheme = changeTheme;
window.changeTextSize = changeTextSize;
window.filterCat = filterCat;
window.openModal = openModal;
window.closeModal = closeModal;
window.copyText = copyText;
window.toast = toast;
window.fmt = fmt;
window.installProduct = installProduct;

console.log('✅ Shoplify App Ready - All Features Active');