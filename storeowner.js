// storeowner.js - COMPLETE FINAL PRODUCTION VERSION
// ONESHOPLIFY Store Ownership System - All Features Working
console.log('✅ storeowner.js loaded - Production Ready');

// =====================
// GLOBAL STATE
// =====================
const STORE_OWNER = {
    currentStore: null,
    sidebarOpen: false,
    chatListeners: {},
    lobbyListeners: {}
};

// =====================
// STORE PLANS CONFIGURATION
// =====================
const STORE_PLANS = {
    basic: {
        name: 'Basic',
        price: 9.99,
        color: '#6C4BFF',
        icon: '🌑',
        products: 50,
        analytics: 'simple',
        support: 'email',
        chatLimit: 10,
        followers: true,
        sponsored: true,
        features: ['50 Products', 'Simple Analytics', 'Email Support', '10 Chats/Day', 'Followers', 'Sponsored Products']
    },
    pro: {
        name: 'Pro',
        price: 29.99,
        color: '#4F46E5',
        icon: '⭐',
        products: 501,
        analytics: 'full',
        support: 'ticket+email+line',
        chatLimit: 100,
        followers: true,
        sponsored: true,
        features: ['501 Products', 'Full Analytics', 'Ticket & Email Support', '100 Chats/Day', 'Followers', 'Sponsored Products'],
        recommended: true
    },
    enterprise: {
        name: 'Enterprise',
        price: 99.99,
        color: '#7C3AED',
        icon: '👑',
        products: 'Unlimited',
        analytics: 'enterprise',
        support: 'full+bot',
        chatLimit: 'Unlimited',
        followers: true,
        sponsored: false,
        verified: true,
        features: ['Unlimited Products', 'Enterprise Analytics', 'Full Support + Auto Bot', 'Unlimited Chats', 'Daily Reports', 'Verified Badge', 'No Sponsored Ads'],
        bonus: true
    }
};

// =====================
// FOLLOW BADGES CONFIGURATION
// =====================
const FOLLOW_BADGES = {
    1000: { color: '#0095F6', bonus: 5, name: 'Blue Badge' },
    25000: { color: '#22C55E', bonus: 20, name: 'Green Badge' },
    50000: { color: '#7C3AED', bonus: 100, name: 'Purple Badge' },
    100000: { color: '#FFFFFF', bonus: 700, name: 'White Badge' },
    1000000: { color: '#00BCD4', bonus: 700, name: 'Diamond Badge' }
};

// =====================
// STORE MARKET - Browse All Stores
// =====================
async function loadStoreMarket() {
    console.log('🏪 Loading Store Market...');
    
    const container = document.getElementById('storemarket-content');
    if (!container) return;
    
    container.innerHTML = '<div style="text-align:center;padding:60px;"><div class="loader-spinner"></div><p>Discovering stores...</p></div>';
    
    try {
        const snapshot = await db.collection('users').where('hasStore','==',true).where('storeActive','==',true).get();
        
        if (snapshot.empty) {
            container.innerHTML = `<div style="text-align:center;padding:60px;"><p style="font-size:50px;">🏪</p><h3>No Stores Yet</h3><p style="color:#666;">Be the first!</p><button class="btn-gold" onclick="navigateTo('profile')">Open Your Store</button></div>`;
            return;
        }
        
        const stores = [];
        snapshot.forEach(doc => {
            const d = doc.data();
            stores.push({
                id: doc.id, username: d.username,
                storeName: d.storeName || d.username+"'s Store",
                storeLogo: d.storeLogo || '/app-icon.png',
                storeBanner: d.storeBanner || '',
                storeCategory: d.storeCategory || 'General',
                storeColor: d.storeColor || '#6C4BFF',
                storeDescription: d.storeDescription || '',
                storeVerified: d.storeVerified || d.isAppVerified || false,
                totalProducts: d.totalProducts || 0,
                followers: d.followers || 0,
                countryFlag: d.countryFlag || '🌍',
                storePlan: d.storePlan || 'basic'
            });
        });
        
        container.innerHTML = `
            <div style="padding:12px;">
                <div style="margin-bottom:12px;">
                    <input type="text" id="store-search" class="input-field" placeholder="🔍 Search stores..." 
                           oninput="searchStoreMarket()" style="background:#f5f5f5;border-radius:25px;padding:12px 18px;font-size:14px;border:none;">
                </div>
                <div style="display:flex;gap:6px;overflow-x:auto;margin-bottom:12px;padding-bottom:4px;" id="store-cats">
                    <span class="category-chip active" onclick="filterStoreMarket('all')" style="font-size:12px;">All</span>
                    <span class="category-chip" onclick="filterStoreMarket('Fashion')" style="font-size:12px;">Fashion</span>
                    <span class="category-chip" onclick="filterStoreMarket('Electronics')" style="font-size:12px;">Electronics</span>
                    <span class="category-chip" onclick="filterStoreMarket('Tickets & Events')" style="font-size:12px;">Tickets</span>
                    <span class="category-chip" onclick="filterStoreMarket('All Purpose')" style="font-size:12px;">General</span>
                </div>
                <div id="stores-grid">
                    ${stores.map(s => `
                        <div class="store-card" data-cat="${s.storeCategory}" data-name="${s.storeName.toLowerCase()} ${s.username.toLowerCase()}"
                             onclick="openStoreShop('${s.username}')"
                             style="background:white;border-radius:16px;overflow:hidden;margin-bottom:14px;box-shadow:0 2px 12px rgba(0,0,0,0.06);cursor:pointer;">
                            ${s.storeBanner ? `<div style="height:110px;background:url(${s.storeBanner}) center/cover;"></div>` : `<div style="height:110px;background:linear-gradient(135deg,${s.storeColor},#4F46E5);"></div>`}
                            <div style="padding:14px;display:flex;gap:10px;align-items:center;">
                                <img src="${s.storeLogo}" style="width:50px;height:50px;border-radius:14px;object-fit:cover;margin-top:-35px;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.1);" onerror="this.src='/app-icon.png'">
                                <div style="flex:1;">
                                    <div style="display:flex;align-items:center;gap:4px;"><h4 style="margin:0;font-size:14px;">${s.storeName}</h4>${s.storeVerified?'<span style="color:#20D5EC;font-size:14px;">✓</span>':''}</div>
                                    <p style="font-size:11px;color:#666;margin:2px 0;">${s.storeCategory} · ${s.countryFlag} · ${s.followers||0} followers</p>
                                    <p style="font-size:10px;color:#999;">${s.totalProducts} products · ${STORE_PLANS[s.storePlan]?.name||'Basic'} Plan</p>
                                </div>
                                <button class="btn-gold btn-small" style="padding:8px 12px;font-size:11px;">Visit</button>
                            </div>
                        </div>`).join('')}
                </div>
            </div>`;
    } catch(e) { container.innerHTML = '<p style="text-align:center;padding:60px;">Error loading stores</p>'; }
}

function searchStoreMarket() {
    const q = document.getElementById('store-search')?.value?.toLowerCase()||'';
    document.querySelectorAll('.store-card').forEach(c => { c.style.display = (c.dataset.name||'').includes(q) ? '' : 'none'; });
}
function filterStoreMarket(cat) {
    document.querySelectorAll('#store-cats .category-chip').forEach(c => c.classList.remove('active'));
    event.target.classList.add('active');
    document.querySelectorAll('.store-card').forEach(c => { c.style.display = cat==='all' ? '' : (c.dataset.cat===cat ? '' : 'none'); });
}

// =====================
// STORE SHOP VIEW (Customer Facing)
// =====================
async function openStoreShop(username) {
    console.log('🏪 Opening shop:', username);
    navigateTo('store-shop');
    const container = document.getElementById('store-shop-content');
    if (!container) return;
    container.innerHTML = '<div style="text-align:center;padding:60px;"><div class="loader-spinner"></div><p>Loading shop...</p></div>';
    
    try {
        const userSnap = await db.collection('users').where('username','==',username).limit(1).get();
        if (userSnap.empty) { container.innerHTML = '<p style="text-align:center;padding:60px;">Store not found</p>'; return; }
        
        const store = userSnap.docs[0].data();
        const storeId = userSnap.docs[0].id;
        const plan = STORE_PLANS[store.storePlan||'basic'] || STORE_PLANS.basic;
        
        const prodSnap = await db.collection('products').where('merchantId','==',storeId).where('status','==','active').get();
        const products = []; prodSnap.forEach(d => products.push({id:d.id,...d.data()}));
        
        const cart = JSON.parse(sessionStorage.getItem('shoplify_cart')||'[]');
        const cartCount = cart.reduce((s,i)=>s+(i.quantity||1),0);
        const isLight = isStoreColorLight(store.storeColor||'#6C4BFF');
        const tc = isLight?'#1a1a1a':'#ffffff';
        const sc = isLight?'#444':'rgba(255,255,255,0.8)';
        
        container.innerHTML = `
            <div style="background:#f8f9fb;min-height:100vh;font-family:-apple-system,BlinkMacSystemFont,sans-serif;">
                <!-- Top Bar -->
                <div style="position:sticky;top:0;z-index:100;background:white;padding:10px 14px;display:flex;align-items:center;gap:8px;border-bottom:1px solid #f0f0f0;box-shadow:0 1px 2px rgba(0,0,0,0.03);">
                    <button onclick="navigateTo('storemarket')" style="background:none;border:none;font-size:20px;cursor:pointer;padding:4px;">←</button>
                    <img src="${store.storeLogo||'/app-icon.png'}" style="width:26px;height:26px;border-radius:7px;object-fit:cover;">
                    <div style="flex:1;font-weight:700;font-size:15px;">${store.storeName||'Store'}</div>
                    <button onclick="navigateTo('checkout')" style="background:none;border:none;font-size:20px;cursor:pointer;position:relative;padding:4px;">🛒${cartCount>0?`<span style="position:absolute;top:-2px;right:-2px;background:#FF4444;color:white;font-size:9px;min-width:16px;height:16px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;">${cartCount}</span>`:''}</button>
                    <button onclick="openShopProfile('${username}')" style="background:none;border:none;font-size:20px;cursor:pointer;padding:4px;">👤</button>
                </div>
                
                <!-- Banner -->
                ${store.storeBanner?`<img src="${store.storeBanner}" style="width:100%;height:140px;object-fit:cover;">`:''}
                
                <!-- Store Header -->
                <div style="background:linear-gradient(135deg,${store.storeColor||'#6C4BFF'},#4F46E5);padding:20px;text-align:center;color:${tc};">
                    <img src="${store.storeLogo||'/app-icon.png'}" style="width:55px;height:55px;border-radius:14px;border:3px solid white;margin-bottom:6px;box-shadow:0 4px 12px rgba(0,0,0,0.2);">
                    <h2 style="margin:0;font-size:19px;">${store.storeName||'Store'}</h2>
                    ${store.storeVerified?`<span style="background:#20D5EC;color:white;padding:2px 10px;border-radius:10px;font-size:10px;margin-top:4px;display:inline-block;">✓ Verified</span>`:''}
                    <p style="font-size:12px;margin:4px 0 0;color:${sc};">${store.storeDescription||''}</p>
                    <div style="display:flex;justify-content:center;gap:15px;margin-top:8px;font-size:11px;">
                        <span>📦 ${products.length} products</span>
                        <span>👥 ${store.followers||0} followers</span>
                    </div>
                    <div style="margin-top:10px;display:flex;gap:8px;justify-content:center;">
                        <button onclick="followStore('${storeId}','${store.storeName}')" id="follow-btn-${storeId}" 
                                style="padding:8px 18px;border-radius:20px;font-weight:600;font-size:12px;cursor:pointer;
                                background:${store.followersList?.includes(APP.userProfile?.uid)?'white;color:#6C4BFF':'#6C4BFF;color:white'};border:2px solid white;">
                            ${store.followersList?.includes(APP.userProfile?.uid)?'✓ Following':'+ Follow'}
                        </button>
                        <button onclick="openChatWithStore('${storeId}','${store.storeName}')" style="padding:8px 18px;border-radius:20px;font-weight:600;font-size:12px;cursor:pointer;background:white;color:#6C4BFF;border:2px solid white;">💬 Chat</button>
                    </div>
                </div>
                
                <!-- Products Grid -->
                <div style="padding:10px;">
                    ${products.length===0?'<p style="text-align:center;padding:40px;color:#999;">No products yet</p>':`
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;" id="shop-products">
                            ${products.map(p=>{
                                const img=p.images?.[0]||'/app-icon.png';
                                const isTicket=p.isTicket||p.category==='Tickets & Events';
                                const disc=p.discountCode?`<span style="background:#FF4444;color:white;padding:1px 5px;border-radius:6px;font-size:9px;">-${p.discountCode.value}${p.discountCode.type==='percentage'?'%':'$'}</span>`:'';
                                return`<div class="shop-prod-card" data-name="${p.name.toLowerCase()}" onclick="viewStoreProduct('${p.id}','${storeId}')"
                                    style="background:white;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.04);cursor:pointer;">
                                    <div style="position:relative;">
                                        <img src="${img}" style="width:100%;height:150px;object-fit:cover;" onerror="this.src='/app-icon.png'" loading="lazy">
                                        ${disc?`<span style="position:absolute;top:4px;left:4px;">${disc}</span>`:''}
                                        ${isTicket?'<span style="position:absolute;top:4px;right:4px;background:#7C3AED;color:white;padding:1px 5px;border-radius:4px;font-size:8px;">🎫</span>':''}
                                        <button onclick="event.stopPropagation();quickAddToCart('${p.id}','${p.name.replace(/'/g,"\\'")}','${p.price}','${img}','${storeId}')"
                                            style="position:absolute;bottom:6px;right:6px;width:30px;height:30px;background:#6C4BFF;color:white;border:none;border-radius:50%;font-size:16px;cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,0.2);">+</button>
                                    </div>
                                    <div style="padding:8px 10px;">
                                        <div style="font-weight:600;font-size:11px;margin-bottom:2px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${p.name}</div>
                                        <div style="display:flex;justify-content:space-between;align-items:center;">
                                            <div style="font-weight:800;font-size:15px;color:#e44;">${formatCurrency(p.price)}</div>
                                            <div style="font-size:9px;color:#999;">${p.totalSales||0} sold</div>
                                        </div>
                                        <div style="display:flex;align-items:center;gap:4px;margin-top:2px;">
                                            <button onclick="event.stopPropagation();likeProduct('${p.id}')" style="background:none;border:none;cursor:pointer;font-size:12px;padding:0;">${p.likes?.includes(APP.userProfile?.uid)?'❤️':'🤍'}</button>
                                            <span style="font-size:10px;color:#999;">${p.likes?.length||0}</span>
                                            <img src="${store.storeLogo||'/app-icon.png'}" style="width:14px;height:14px;border-radius:3px;margin-left:auto;">
                                        </div>
                                    </div>
                                </div>`}).join('')}
                        </div>`}
                </div>
                
                <!-- Footer -->
                <div style="text-align:center;padding:16px;font-size:9px;color:#bbb;">${username}.oneshoplify.com · Powered by ONESHOPLIFY</div>
            </div>`;
    } catch(e) { container.innerHTML = '<p style="text-align:center;padding:60px;">Error</p>'; }
}

// =====================
// QUICK ADD TO CART
// =====================
function quickAddToCart(productId, name, price, image, storeId) {
    let cart = JSON.parse(sessionStorage.getItem('shoplify_cart')||'[]');
    const ex = cart.findIndex(i=>i.productId===productId);
    if(ex>=0) cart[ex].quantity+=1;
    else cart.push({productId,name,price:parseFloat(price),image,merchantId:storeId,quantity:1,isStoreProduct:true});
    sessionStorage.setItem('shoplify_cart',JSON.stringify(cart));
    if(typeof updateCartBadge==='function') updateCartBadge();
    showToast('Added! 🛒','success');
}

// =====================
// VIEW STORE PRODUCT DETAIL
// =====================
async function viewStoreProduct(productId, storeId) {
    showLoader();
    try {
        const doc = await db.collection('products').doc(productId).get();
        if(!doc.exists){hideLoader();showToast('Not found','error');return;}
        const p = doc.data();
        const isTicket = p.isTicket||p.category==='Tickets & Events';
        const isDigital = p.isDigital||false;
        const reviewsSnap = await db.collection('reviews').where('productId','==',productId).get();
        const reviews = []; reviewsSnap.forEach(d=>reviews.push(d.data()));
        reviews.sort((a,b)=>(b.createdAt?.toDate?.()||0)-(a.createdAt?.toDate?.()||0));
        hideLoader();
        
        showModal(`
            <div style="max-height:85vh;overflow-y:auto;padding:0;">
                <div style="position:relative;">
                    <img src="${p.images?.[0]||'/app-icon.png'}" style="width:100%;height:300px;object-fit:cover;">
                    <button onclick="hideModal()" style="position:absolute;top:8px;left:8px;width:30px;height:30px;background:rgba(0,0,0,0.5);color:white;border:none;border-radius:50%;font-size:16px;cursor:pointer;">✕</button>
                </div>
                <div style="padding:18px;">
                    <h2 style="font-size:18px;margin-bottom:4px;">${p.name}</h2>
                    <div style="font-size:24px;font-weight:800;color:#e44;margin-bottom:8px;">${formatCurrency(p.price)}</div>
                    ${p.discountCode?`<div style="background:#FFF8E1;padding:8px;border-radius:8px;margin:8px 0;text-align:center;font-size:12px;">🎫 Code: <strong>${p.discountCode.code}</strong> (-${p.discountCode.value}${p.discountCode.type==='percentage'?'%':'$'})</div>`:''}
                    <div style="font-size:12px;color:#666;margin:8px 0;"><span>📦 ${p.totalSales||0} sold</span><span style="margin-left:12px;">⭐ ${p.avgRating?.toFixed(1)||'0.0'} (${p.reviewCount||0})</span><span style="margin-left:12px;">❤️ ${p.likes?.length||0}</span></div>
                    ${isTicket&&p.ticketData?`<div style="background:#f0f0ff;padding:10px;border-radius:8px;margin:8px 0;font-size:11px;"><p>📅 ${p.ticketData.eventDate} at ${p.ticketData.eventTime}</p><p>📍 ${p.ticketData.address}</p><p>🎟️ ${p.ticketData.remainingQuantity} left</p></div>`:''}
                    ${p.colors?.length?`<p style="font-size:12px;"><strong>Colors:</strong> ${p.colors.join(', ')}</p>`:''}
                    ${p.sizes?.length?`<p style="font-size:12px;"><strong>Sizes:</strong> ${p.sizes.join(', ')}</p>`:''}
                    <p style="color:#666;line-height:1.5;font-size:13px;margin:8px 0;">${p.description||'No description'}</p>
                    <button class="btn-gold btn-full" style="padding:14px;font-size:15px;margin-top:12px;" onclick="quickAddToCart('${p.id}','${p.name.replace(/'/g,"\\'")}','${p.price}','${p.images?.[0]||'/app-icon.png'}','${storeId}');hideModal();">🛒 Add to Cart - ${formatCurrency(p.price)}</button>
                    ${reviews.length>0?`<div style="margin-top:16px;"><h4>Reviews (${reviews.length})</h4>${reviews.slice(0,5).map(r=>`<div style="padding:8px;background:#fafafa;border-radius:8px;margin-bottom:4px;"><div style="display:flex;justify-content:space-between;"><strong style="font-size:12px;">${r.userName||'Customer'}</strong><span style="color:#FFD700;font-size:11px;">${'★'.repeat(r.rating||5)}</span></div><p style="font-size:11px;color:#666;">${r.comment||''}</p></div>`).join('')}</div>`:''}
                </div>
            </div>`);
    } catch(e) { hideLoader(); showToast('Error','error'); }
}

// =====================
// FOLLOW SYSTEM (Backend-driven)
// =====================
async function followStore(storeId, storeName) {
    if (!APP.userProfile) { showToast('Please login','error'); signInWithGoogle(); return; }
    const btn = document.getElementById('follow-btn-'+storeId);
    if (btn) { btn.disabled = true; btn.textContent = '...'; }
    
    try {
        const userRef = db.collection('users').doc(storeId);
        const userDoc = await userRef.get();
        if (!userDoc.exists) { showToast('Store not found','error'); if(btn)btn.disabled=false; return; }
        
        const data = userDoc.data();
        const followers = data.followersList || [];
        const isFollowing = followers.includes(APP.userProfile.uid);
        
        if (isFollowing) {
            await userRef.update({
                followers: firebase.firestore.FieldValue.increment(-1),
                followersList: firebase.firestore.FieldValue.arrayRemove(APP.userProfile.uid)
            });
            if (btn) { btn.textContent = '+ Follow'; btn.style.background = '#6C4BFF'; btn.style.color = 'white'; }
        } else {
            await userRef.update({
                followers: firebase.firestore.FieldValue.increment(1),
                followersList: firebase.firestore.FieldValue.arrayUnion(APP.userProfile.uid)
            });
            if (btn) { btn.textContent = '✓ Following'; btn.style.background = 'white'; btn.style.color = '#6C4BFF'; }
            
            // Check badge milestones
            const newCount = (data.followers||0) + 1;
            await checkFollowBadge(storeId, newCount);
            
            // Notify store owner
            if (typeof createNotification === 'function') {
                await createNotification(storeId, '👥 New Follower!', `${APP.userProfile.displayName||APP.userProfile.username} followed your store.`, '👥', 'storeowner');
            }
        }
    } catch(e) { console.error('Follow error:',e); showToast('Failed','error'); }
    if (btn) btn.disabled = false;
}

async function checkFollowBadge(storeId, followerCount) {
    let badgeToAward = null;
    for (const [threshold, badge] of Object.entries(FOLLOW_BADGES)) {
        if (followerCount >= parseInt(threshold)) {
            badgeToAward = { threshold: parseInt(threshold), ...badge };
        }
    }
    
    if (badgeToAward) {
        const userRef = db.collection('users').doc(storeId);
        const userDoc = await userRef.get();
        const data = userDoc.data();
        const awardedBadges = data.awardedBadges || [];
        
        if (!awardedBadges.includes(badgeToAward.threshold)) {
            await userRef.update({
                followBadge: badgeToAward.color,
                followBadgeLevel: badgeToAward.threshold,
                awardedBadges: firebase.firestore.FieldValue.arrayUnion(badgeToAward.threshold),
                walletBalance: firebase.firestore.FieldValue.increment(badgeToAward.bonus)
            });
            
            await db.collection('transactions').add({
                userId: storeId, type: 'badge_bonus', amount: badgeToAward.bonus,
                currency: 'USD', status: 'completed',
                description: `${badgeToAward.name} milestone bonus`,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            if (typeof createNotification === 'function') {
                await createNotification(storeId, '🏆 Badge Unlocked!', 
                    `You earned the ${badgeToAward.name} at ${badgeToAward.threshold.toLocaleString()} followers! $${badgeToAward.bonus} bonus added.`, '🏆', 'storeowner');
            }
        }
    }
}

// =====================
// LIKE PRODUCT (Backend-driven)
// =====================
async function likeProduct(productId) {
    if (!APP.userProfile) { showToast('Please login','error'); return; }
    
    try {
        const ref = db.collection('products').doc(productId);
        const doc = await ref.get();
        if (!doc.exists) return;
        
        const likes = doc.data().likes || [];
        if (likes.includes(APP.userProfile.uid)) {
            await ref.update({ likes: firebase.firestore.FieldValue.arrayRemove(APP.userProfile.uid) });
        } else {
            await ref.update({ likes: firebase.firestore.FieldValue.arrayUnion(APP.userProfile.uid) });
        }
        // Refresh the shop view
        const currentShop = sessionStorage.getItem('current_shop_view');
        if (currentShop) openStoreShop(currentShop);
    } catch(e) { console.error('Like error:',e); }
}

// =====================
// CHAT SYSTEM
// =====================
async function openChatWithStore(storeId, storeName) {
    if (!APP.userProfile) { showToast('Please login','error'); signInWithGoogle(); return; }
    
    showModal(`
        <div style="height:85vh;display:flex;flex-direction:column;">
            <div style="background:#6C4BFF;color:white;padding:12px 15px;display:flex;align-items:center;gap:10px;">
                <button onclick="hideModal()" style="background:none;border:none;color:white;font-size:18px;cursor:pointer;">←</button>
                <img src="${APP.userProfile.storeLogo||'/app-icon.png'}" style="width:30px;height:30px;border-radius:50%;">
                <div style="flex:1;font-weight:600;">${storeName}</div>
            </div>
            <div id="chat-messages-${storeId}" style="flex:1;overflow-y:auto;padding:12px;background:#f5f5f5;"></div>
            <div style="display:flex;gap:8px;padding:10px;background:white;border-top:1px solid #e0e0e0;">
                <input type="text" id="chat-input-${storeId}" class="input-field" placeholder="Type a message..." style="flex:1;border-radius:20px;padding:10px 16px;font-size:13px;">
                <button onclick="sendChatMessage('${storeId}')" style="background:#6C4BFF;color:white;border:none;border-radius:50%;width:40px;height:40px;font-size:18px;cursor:pointer;">➤</button>
            </div>
        </div>
    `);
    
    loadChatMessages(storeId);
    listenForChatMessages(storeId);
}

async function loadChatMessages(storeId) {
    const container = document.getElementById('chat-messages-'+storeId);
    if (!container) return;
    container.innerHTML = '<p style="text-align:center;color:#999;padding:20px;">Loading messages...</p>';
    
    try {
        const chatId = [APP.userProfile.uid, storeId].sort().join('_');
        const snap = await db.collection('chats').doc(chatId).collection('messages').orderBy('createdAt','asc').get();
        container.innerHTML = '';
        snap.forEach(doc => {
            const m = doc.data();
            const isMe = m.senderId === APP.userProfile.uid;
            container.innerHTML += `
                <div style="display:flex;justify-content:${isMe?'flex-end':'flex-start'};margin-bottom:8px;">
                    <div style="max-width:75%;padding:10px 14px;border-radius:${isMe?'16px 16px 4px 16px':'16px 16px 16px 4px'};background:${isMe?'#6C4BFF':'white'};color:${isMe?'white':'#333'};font-size:13px;box-shadow:0 1px 2px rgba(0,0,0,0.05);">
                        ${m.text}
                        <div style="font-size:9px;opacity:0.6;margin-top:4px;">${getTimeAgo(m.createdAt)}</div>
                    </div>
                </div>`;
        });
        container.scrollTop = container.scrollHeight;
    } catch(e) { container.innerHTML = '<p style="text-align:center;color:#999;">Error loading messages</p>'; }
}

function listenForChatMessages(storeId) {
    const chatId = [APP.userProfile.uid, storeId].sort().join('_');
    if (STORE_OWNER.chatListeners[chatId]) return;
    
    STORE_OWNER.chatListeners[chatId] = db.collection('chats').doc(chatId).collection('messages')
        .orderBy('createdAt','asc').onSnapshot(snap => {
            const container = document.getElementById('chat-messages-'+storeId);
            if (!container) return;
            container.innerHTML = '';
            snap.forEach(doc => {
                const m = doc.data();
                const isMe = m.senderId === APP.userProfile.uid;
                container.innerHTML += `
                    <div style="display:flex;justify-content:${isMe?'flex-end':'flex-start'};margin-bottom:8px;">
                        <div style="max-width:75%;padding:10px 14px;border-radius:${isMe?'16px 16px 4px 16px':'16px 16px 16px 4px'};background:${isMe?'#6C4BFF':'white'};color:${isMe?'white':'#333'};font-size:13px;box-shadow:0 1px 2px rgba(0,0,0,0.05);">
                            ${m.text}
                            <div style="font-size:9px;opacity:0.6;margin-top:4px;">${getTimeAgo(m.createdAt)}</div>
                        </div>
                    </div>`;
            });
            container.scrollTop = container.scrollHeight;
        });
}

async function sendChatMessage(storeId) {
    const input = document.getElementById('chat-input-'+storeId);
    const text = input?.value?.trim();
    if (!text) return;
    input.value = '';
    
    const chatId = [APP.userProfile.uid, storeId].sort().join('_');
    try {
        await db.collection('chats').doc(chatId).collection('messages').add({
            senderId: APP.userProfile.uid,
            senderName: APP.userProfile.displayName||APP.userProfile.username,
            text, createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        await db.collection('chats').doc(chatId).set({
            participants: [APP.userProfile.uid, storeId],
            lastMessage: text,
            lastMessageAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        
        // Notify store owner
        if (typeof createNotification === 'function') {
            await createNotification(storeId, '💬 New Message', 
                `${APP.userProfile.displayName||APP.userProfile.username}: ${text.substring(0,50)}`, '💬', 'storeowner');
        }
    } catch(e) { console.error('Send error:',e); }
}

// =====================
// STORE LOBBY (Broadcast to followers)
// =====================
async function createStoreLobby() {
    if (!APP.userProfile?.hasStore) { showToast('You need a store','error'); return; }
    
    showModal(`
        <div style="padding:15px;">
            <h3>📢 Create Lobby Post</h3>
            <p style="color:#666;font-size:12px;">Send a message to all your followers</p>
            <textarea id="lobby-text" class="input-field" rows="4" placeholder="What's new?"></textarea>
            <div class="input-group" style="margin-top:10px;">
                <label>Add Image (optional)</label>
                <input type="file" id="lobby-image" class="input-field" accept="image/*">
            </div>
            <button class="btn-gold btn-full" style="margin-top:12px;" onclick="postStoreLobby()">📤 Post to Followers</button>
        </div>
    `);
}

async function postStoreLobby() {
    const text = document.getElementById('lobby-text')?.value?.trim();
    if (!text) { showToast('Enter a message','error'); return; }
    
    hideModal(); showLoader();
    try {
        let imageUrl = '';
        const imgFile = document.getElementById('lobby-image')?.files?.[0];
        if (imgFile) { try { imageUrl = await uploadToCloudinary(imgFile); } catch(e) {} }
        
        await db.collection('store_lobbies').add({
            storeId: APP.userProfile.uid,
            storeName: APP.userProfile.storeName,
            storeLogo: APP.userProfile.storeLogo||'/app-icon.png',
            text, imageUrl,
            reactions: [],
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Notify all followers
        const followers = APP.userProfile.followersList || [];
        for (const followerId of followers.slice(0, 100)) {
            if (typeof createNotification === 'function') {
                await createNotification(followerId, '📢 New Post', 
                    `${APP.userProfile.storeName}: ${text.substring(0,50)}`, '📢', 'store-shop');
            }
        }
        
        hideLoader(); showToast('Posted to followers! 📢','success');
    } catch(e) { hideLoader(); showToast('Failed','error'); }
}

// =====================
// STORE OWNER DASHBOARD (Full Featured)
// =====================
async function loadStoreOwnerDashboard() {
    console.log('📊 Loading store owner dashboard...');
    const container = document.getElementById('storeowner-content');
    if (!container) return;
    
    container.innerHTML = '<div style="text-align:center;padding:60px;"><div class="loader-spinner"></div><p>Loading dashboard...</p></div>';
    
    if (!APP.userProfile?.hasStore) {
        container.innerHTML = `<div style="text-align:center;padding:60px;"><p style="font-size:50px;">🏪</p><h3>No Store Yet</h3><button class="btn-gold" onclick="showStorePlans()">Create Store</button></div>`;
        return;
    }
    
    const plan = STORE_PLANS[APP.userProfile.storePlan||'basic']||STORE_PLANS.basic;
    const storeUrl = `${APP.baseUrl}/store/${APP.userProfile.username}`;
    const storeColor = APP.userProfile.storeColor||'#6C4BFF';
    const isLight = isStoreColorLight(storeColor);
    const tc = isLight?'#1a1a1a':'#ffffff';
    
    // Get stats
    let totalProducts=0, totalSales=0, totalRevenue=0, totalVisitors=0;
    try {
        const pSnap = await db.collection('products').where('merchantId','==',APP.userProfile.uid).get();
        totalProducts = pSnap.size;
        const oSnap = await db.collection('orders').where('merchantId','==',APP.userProfile.uid).get();
        oSnap.forEach(d=>{const o=d.data();if(o.status==='completed'){totalSales++;totalRevenue+=o.total||0;}});
    } catch(e) {}
    
    container.innerHTML = `
        <div style="padding:12px;padding-bottom:30px;font-family:-apple-system,BlinkMacSystemFont,sans-serif;">
            
            <!-- Header -->
            <div style="text-align:center;padding:22px 16px;background:linear-gradient(135deg,${storeColor},#4F46E5);border-radius:18px;color:${tc};margin-bottom:14px;box-shadow:0 4px 20px rgba(108,75,255,0.2);">
                ${APP.userProfile.storeLogo?`<img src="${APP.userProfile.storeLogo}" style="width:55px;height:55px;border-radius:14px;border:3px solid white;margin-bottom:8px;">`:''}
                <h2 style="margin:0;font-size:20px;">${APP.userProfile.storeName||'My Store'}</h2>
                <p style="opacity:0.85;font-size:13px;margin:4px 0;">${plan.name} Plan · ${APP.userProfile.storeCategory||'Store'}</p>
                ${APP.userProfile.storeVerified?`<span style="background:#20D5EC;color:white;padding:2px 10px;border-radius:10px;font-size:10px;margin-top:4px;display:inline-block;">✓ Verified</span>`:''}
            </div>
            
            <!-- Stats Grid -->
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:14px;">
                <div class="stat-card" style="padding:14px;text-align:center;background:white;border-radius:12px;box-shadow:0 2px 6px rgba(0,0,0,0.04);"><div style="font-size:20px;font-weight:800;color:#6C4BFF;">${totalProducts}</div><div style="font-size:10px;color:#999;">Products</div></div>
                <div class="stat-card" style="padding:14px;text-align:center;background:white;border-radius:12px;box-shadow:0 2px 6px rgba(0,0,0,0.04);"><div style="font-size:20px;font-weight:800;color:#22C55E;">${totalSales}</div><div style="font-size:10px;color:#999;">Sales</div></div>
                <div class="stat-card" style="padding:14px;text-align:center;background:white;border-radius:12px;box-shadow:0 2px 6px rgba(0,0,0,0.04);"><div style="font-size:20px;font-weight:800;color:#F59E0B;">${formatCurrency(totalRevenue)}</div><div style="font-size:10px;color:#999;">Revenue</div></div>
                <div class="stat-card" style="padding:14px;text-align:center;background:white;border-radius:12px;box-shadow:0 2px 6px rgba(0,0,0,0.04);"><div style="font-size:20px;font-weight:800;color:#3B82F6;">${APP.userProfile.followers||0}</div><div style="font-size:10px;color:#999;">Followers</div></div>
                <div class="stat-card" style="padding:14px;text-align:center;background:white;border-radius:12px;box-shadow:0 2px 6px rgba(0,0,0,0.04);"><div style="font-size:20px;font-weight:800;color:#EC4899;">${APP.userProfile.walletBalance?formatCurrency(APP.userProfile.walletBalance):'$0'}</div><div style="font-size:10px;color:#999;">Balance</div></div>
            </div>
            
            <!-- Quick Actions -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px;">
                <button class="btn-gold" style="padding:12px;font-weight:600;font-size:13px;" onclick="navigateTo('add-product')">➕ Add Product</button>
                <button class="btn-outline" style="padding:12px;font-weight:600;font-size:13px;" onclick="addTicketProduct()">🎫 Add Ticket</button>
                <button class="btn-outline" style="padding:12px;font-weight:600;font-size:13px;" onclick="openStoreShop('${APP.userProfile.username}')">👁️ View Shop</button>
                <button class="btn-outline" style="padding:12px;font-weight:600;font-size:13px;" onclick="navigateTo('orders')">📦 Orders</button>
                <button class="btn-outline" style="padding:12px;font-weight:600;font-size:13px;" onclick="createStoreLobby()">📢 Lobby</button>
                <button class="btn-outline" style="padding:12px;font-weight:600;font-size:13px;" onclick="viewFollowers()">👥 Followers</button>
                <button class="btn-outline" style="padding:12px;font-weight:600;font-size:13px;" onclick="storeOwnerSettings()">⚙️ Settings</button>
                <button class="btn-outline" style="padding:12px;font-weight:600;font-size:13px;" onclick="loadStoreAnalytics()">📊 Analytics</button>
                <button class="btn-outline" style="padding:12px;font-weight:600;font-size:13px;" onclick="applyForStoreAd()">📣 Advertise</button>
                ${plan.support==='full+bot'?`<button class="btn-outline" style="padding:12px;font-weight:600;font-size:13px;" onclick="setupAutoReply()">🤖 Auto Reply</button>`:''}
            </div>
            
            <!-- Store URL -->
            <div style="background:white;padding:14px;border-radius:12px;margin-bottom:10px;box-shadow:0 2px 6px rgba(0,0,0,0.04);">
                <p style="font-weight:600;font-size:12px;margin-bottom:6px;">🔗 Store URL:</p>
                <div style="font-family:monospace;font-size:11px;background:#f5f5f5;padding:8px;border-radius:6px;word-break:break-all;">${storeUrl}</div>
                <button class="copy-btn" onclick="copyToClipboard('${storeUrl}')" style="margin-top:6px;">📋 Copy</button>
            </div>
            
            <!-- Plan Status -->
            <div style="background:#E8F5E9;padding:12px;border-radius:12px;text-align:center;">
                <p style="font-size:12px;margin:0;">✅ ${plan.name} Plan Active${APP.userProfile.storeExpiry?` · Expires ${new Date(APP.userProfile.storeExpiry.seconds*1000).toLocaleDateString()}`:''}</p>
                <button class="btn-small btn-outline" onclick="showStorePlans()" style="margin-top:6px;">Upgrade Plan</button>
            </div>
        </div>`;
}

// =====================
// VIEW FOLLOWERS
// =====================
async function viewFollowers() {
    showLoader();
    try {
        const followers = APP.userProfile.followersList || [];
        const users = [];
        for (const uid of followers.slice(0, 50)) {
            const doc = await db.collection('users').doc(uid).get();
            if (doc.exists) users.push(doc.data());
        }
        hideLoader();
        
        showModal(`
            <div style="padding:12px;max-height:75vh;overflow-y:auto;">
                <h3>👥 Followers (${followers.length})</h3>
                ${users.length===0?'<p style="text-align:center;padding:20px;color:#999;">No followers yet</p>':users.map(u=>`
                    <div style="display:flex;align-items:center;gap:10px;padding:10px;border-bottom:1px solid #f0f0f0;">
                        <img src="${u.photoURL||'/app-icon.png'}" style="width:36px;height:36px;border-radius:50%;">
                        <div style="flex:1;"><div style="font-weight:600;font-size:13px;">${u.displayName||u.username}</div><div style="font-size:10px;color:#999;">@${u.username}</div></div>
                        <button class="btn-small btn-outline" onclick="openChatWithStore('${u.uid}','${u.displayName||u.username}')">💬</button>
                    </div>`).join('')}
                <button class="btn-gold btn-full" style="margin-top:10px;" onclick="hideModal()">Close</button>
            </div>`);
    } catch(e) { hideLoader(); showToast('Error','error'); }
}

// =====================
// STORE AD APPLICATION
// =====================
function applyForStoreAd() {
    showModal(`
        <div style="padding:12px;">
            <h3>📣 Advertise Your Store</h3>
            <p style="color:#666;font-size:12px;">Your ad will appear randomly across the platform</p>
            <div class="input-group"><label>Ad Title</label><input type="text" id="ad-title" class="input-field" placeholder="e.g. Summer Sale!"></div>
            <div class="input-group"><label>Ad Description</label><textarea id="ad-desc" class="input-field" rows="2" placeholder="Describe your promotion..."></textarea></div>
            <div class="input-group"><label>Ad Image</label><input type="file" id="ad-image" class="input-field" accept="image/*"></div>
            <div class="input-group"><label>Duration (Days)</label><input type="number" id="ad-duration" class="input-field" value="7" min="1" max="30"></div>
            <p style="font-size:11px;color:#666;">Cost: $5/day · Total: $<span id="ad-total">35</span></p>
            ${(APP.userProfile.walletBalance||0)>=35?`<button class="btn-gold btn-full" onclick="submitStoreAd()">🚀 Launch Ad</button>`:`<button class="btn-gold btn-full" onclick="hideModal();navigateTo('wallet');">💰 Deposit</button>`}
        </div>
    `);
    document.getElementById('ad-duration').addEventListener('input', function(){
        document.getElementById('ad-total').textContent = (parseInt(this.value)||0)*5;
    });
}

async function submitStoreAd() {
    const title = document.getElementById('ad-title')?.value?.trim();
    const desc = document.getElementById('ad-desc')?.value?.trim();
    const duration = parseInt(document.getElementById('ad-duration')?.value)||7;
    const price = duration * 5;
    if (!title) { showToast('Enter title','error'); return; }
    if ((APP.userProfile.walletBalance||0) < price) { showToast('Insufficient balance','error'); navigateTo('wallet'); return; }
    hideModal(); showLoader();
    try {
        let img = '';
        const f = document.getElementById('ad-image')?.files?.[0];
        if (f) { try { img = await uploadToCloudinary(f); } catch(e) {} }
        
        const expiry = new Date(Date.now()+duration*24*60*60*1000);
        await db.collection('users').doc(APP.userProfile.uid).update({ walletBalance: firebase.firestore.FieldValue.increment(-price) });
        await db.collection('store_ads').add({
            storeId: APP.userProfile.uid, storeName: APP.userProfile.storeName,
            storeLogo: APP.userProfile.storeLogo||'/app-icon.png',
            title, description: desc, image: img, duration,
            active: true, expiresAt: firebase.firestore.Timestamp.fromDate(expiry),
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        APP.userProfile.walletBalance -= price;
        hideLoader(); showToast('Ad launched! 🚀','success');
    } catch(e) { hideLoader(); showToast('Failed','error'); }
}

// =====================
// AUTO REPLY SETUP (Enterprise Plan)
// =====================
function setupAutoReply() {
    showModal(`
        <div style="padding:12px;">
            <h3>🤖 Auto Reply Bot</h3>
            <p style="color:#666;font-size:12px;">Automatically reply to customer messages</p>
            <div class="input-group"><label>Auto Reply Message</label><textarea id="auto-reply-msg" class="input-field" rows="3" placeholder="Thanks for reaching out! We'll get back to you soon.">${APP.userProfile.autoReplyMessage||''}</textarea></div>
            <label style="display:flex;align-items:center;gap:8px;margin:10px 0;"><input type="checkbox" id="auto-reply-enabled" ${APP.userProfile.autoReplyEnabled?'checked':''}> Enable auto reply</label>
            <button class="btn-gold btn-full" onclick="saveAutoReply()">💾 Save</button>
        </div>
    `);
}

async function saveAutoReply() {
    const msg = document.getElementById('auto-reply-msg')?.value?.trim();
    const enabled = document.getElementById('auto-reply-enabled')?.checked;
    hideModal(); showLoader();
    try {
        await db.collection('users').doc(APP.userProfile.uid).update({ autoReplyMessage: msg, autoReplyEnabled: enabled });
        APP.userProfile.autoReplyMessage = msg;
        APP.userProfile.autoReplyEnabled = enabled;
        hideLoader(); showToast('Saved! ✅','success');
    } catch(e) { hideLoader(); showToast('Failed','error'); }
}

// =====================
// STORE PLANS
// =====================
function showStorePlans() {
    const plans = [
        { key: 'basic', ...STORE_PLANS.basic },
        { key: 'pro', ...STORE_PLANS.pro },
        { key: 'enterprise', ...STORE_PLANS.enterprise }
    ];
    
    showModal(`
        <div style="padding:14px;max-height:80vh;overflow-y:auto;">
            <h3 style="text-align:center;">💰 Choose Your Plan</h3>
            <p style="text-align:center;color:#666;font-size:12px;">Balance: ${formatCurrency(APP.userProfile?.walletBalance||0)}</p>
            ${plans.map(p=>`
                <div style="background:white;border-radius:14px;padding:18px;margin:10px 0;box-shadow:0 2px 8px rgba(0,0,0,0.06);border:2px solid ${p.recommended?p.color:'#e0e0e0'};position:relative;">
                    ${p.recommended?'<span style="position:absolute;top:-8px;right:16px;background:#FFD700;color:#1a1a1a;padding:2px 10px;border-radius:10px;font-size:10px;font-weight:700;">RECOMMENDED</span>':''}
                    <h4>${p.icon} ${p.name}</h4>
                    <div style="font-size:28px;font-weight:800;color:${p.color};">$${p.price}<span style="font-size:13px;color:#999;">/mo</span></div>
                    <ul style="list-style:none;padding:0;font-size:11px;color:#666;line-height:2;">${p.features.map(f=>`<li>✅ ${f}</li>`).join('')}</ul>
                    ${(APP.userProfile?.walletBalance||0)>=p.price?`<button class="btn-gold btn-full" onclick="payForStorePlan('${p.key}',${p.price})">Select ${p.name}</button>`:`<button class="btn-outline btn-full" disabled>Need $${p.price}</button>`}
                </div>`).join('')}
        </div>`);
}

async function payForStorePlan(plan, price) {
    hideModal();
    if ((APP.userProfile?.walletBalance||0) < price) { showToast('Insufficient balance','error'); navigateTo('wallet'); return; }
    showLoader();
    try {
        const expiry = new Date(); expiry.setMonth(expiry.getMonth()+1);
        await db.collection('users').doc(APP.userProfile.uid).update({
            walletBalance: firebase.firestore.FieldValue.increment(-price),
            storePlan: plan, hasStore: true, storeActive: true,
            storeExpiry: firebase.firestore.Timestamp.fromDate(expiry),
            storeVerified: plan==='enterprise'?true:APP.userProfile.storeVerified||false
        });
        APP.userProfile.walletBalance -= price;
        APP.userProfile.storePlan = plan;
        APP.userProfile.hasStore = true;
        if (plan==='enterprise') APP.userProfile.storeVerified = true;
        await db.collection('transactions').add({userId:APP.userProfile.uid,type:'store_subscription',amount:price,currency:'USD',status:'completed',createdAt:firebase.firestore.FieldValue.serverTimestamp()});
        hideLoader(); showToast(`Subscribed to ${STORE_PLANS[plan].name}! 🎉`,'success');
        if (!APP.userProfile.storeName) startStoreSetup();
        else loadStoreOwnerDashboard();
    } catch(e) { hideLoader(); showToast('Failed','error'); }
}

// =====================
// STORE SETUP (Multi-step)
// =====================
let setupStep = 1;
function startStoreSetup() {
    setupStep = 1;
    renderSetupStep();
}

function renderSetupStep() {
    const steps = ['Plan','Account','Details','Branding','Payment','Review'];
    const progress = Math.round((setupStep/6)*100);
    
    let content = '';
    if (setupStep === 1) {
        content = `<h3>Step 1: Account Info</h3>
            <div class="input-group"><label>Store Name *</label><input type="text" id="ss-name" class="input-field" placeholder="My Store"></div>
            <div class="input-group"><label>Owner Name</label><input type="text" id="ss-owner" class="input-field" value="${APP.userProfile.displayName||''}"></div>
            <div class="input-group"><label>Email</label><input type="email" id="ss-email" class="input-field" value="${APP.userProfile.email||''}"></div>
            <div class="input-group"><label>Phone</label><input type="tel" id="ss-phone" class="input-field" value="${APP.userProfile.phoneNumber||''}"></div>
            <div class="input-group"><label>Country</label><select id="ss-country" class="input-field"><option value="">Select</option>${typeof COUNTRIES!=='undefined'?Object.entries(COUNTRIES).sort((a,b)=>a[1].name.localeCompare(b[1].name)).map(([c,d])=>`<option value="${c}" ${APP.userProfile.country===c?'selected':''}>${d.flag||''} ${d.name}</option>`).join(''):''}</select></div>`;
    } else if (setupStep === 2) {
        content = `<h3>Step 2: Store Details</h3>
            <div class="input-group"><label>Category</label><select id="ss-category" class="input-field"><option value="">Select</option><option value="Fashion">Fashion</option><option value="Electronics">Electronics</option><option value="Tickets & Events">Tickets & Events</option><option value="All Purpose">All Purpose Store</option><option value="Digital">Digital Products</option></select></div>
            <div class="input-group"><label>Description</label><textarea id="ss-desc" class="input-field" rows="3"></textarea></div>
            <div class="input-group"><label>Keywords/Tags</label><input type="text" id="ss-tags" class="input-field" placeholder="e.g. fashion, shoes, men"></div>`;
    } else if (setupStep === 3) {
        content = `<h3>Step 3: Branding</h3>
            <div class="input-group"><label>Store Logo</label><input type="file" id="ss-logo" class="input-field" accept="image/*"><small>Recommended: 500x500px</small></div>
            <div class="input-group"><label>Store Banner</label><input type="file" id="ss-banner" class="input-field" accept="image/*"><small>Recommended: 1200x400px</small></div>
            <div class="input-group"><label>Theme Color</label><input type="color" id="ss-color" class="input-field" value="#6C4BFF" style="height:45px;"></div>`;
    } else if (setupStep === 4) {
        content = `<h3>Step 4: Payment</h3><div style="background:#f5f5f5;padding:14px;border-radius:10px;text-align:center;"><p style="font-size:28px;">💰</p><p><strong>ONESHOPLIFY Wallet</strong></p><p style="font-size:12px;color:#666;">Receive payouts directly to your wallet</p></div>`;
    } else if (setupStep === 5) {
        const plan = STORE_PLANS[APP.userProfile.storePlan||'basic'];
        content = `<h3>Step 5: Review</h3><div style="background:white;padding:14px;border-radius:10px;"><p><strong>Plan:</strong> ${plan.name} - $${plan.price}/mo</p><p><strong>Features:</strong> ${plan.features.join(', ')}</p></div>`;
    } else if (setupStep === 6) {
        content = `<h3>Step 6: Payment</h3><p style="text-align:center;font-size:16px;">Total: <strong>$${STORE_PLANS[APP.userProfile.storePlan||'basic'].price}</strong></p><p style="text-align:center;color:#666;">Pay from your wallet balance</p><p style="text-align:center;">Balance: ${formatCurrency(APP.userProfile.walletBalance||0)}</p>`;
    }
    
    showModal(`
        <div style="padding:14px;max-height:80vh;overflow-y:auto;">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:12px;">
                ${steps.map((s,i)=>`<div style="flex:1;text-align:center;"><div style="height:4px;background:${i<setupStep?'#6C4BFF':'#e0e0e0'};border-radius:2px;margin-bottom:4px;"></div><span style="font-size:9px;color:${i<setupStep?'#6C4BFF':'#999'};">${s}</span></div>`).join('')}
            </div>
            ${content}
            <div style="display:flex;gap:8px;margin-top:14px;">
                ${setupStep>1?`<button class="btn-outline" style="flex:1;" onclick="setupStep--;renderSetupStep();">← Back</button>`:''}
                ${setupStep<6?`<button class="btn-gold" style="flex:1;" onclick="setupStep++;renderSetupStep();">Continue →</button>`:`<button class="btn-gold" style="flex:1;" onclick="completeFullStoreSetup()">🚀 Launch Store</button>`}
            </div>
        </div>`);
}

async function completeFullStoreSetup() {
    const name = document.getElementById('ss-name')?.value?.trim()||APP.userProfile.storeName||'My Store';
    const category = document.getElementById('ss-category')?.value||'All Purpose';
    const desc = document.getElementById('ss-desc')?.value?.trim()||'';
    const country = document.getElementById('ss-country')?.value||APP.userProfile.country||'US';
    const color = document.getElementById('ss-color')?.value||'#6C4BFF';
    const tags = document.getElementById('ss-tags')?.value?.trim()||'';
    
    hideModal(); showLoader();
    try {
        let logo = APP.userProfile.storeLogo||'', banner = APP.userProfile.storeBanner||'';
        const lf = document.getElementById('ss-logo')?.files?.[0];
        const bf = document.getElementById('ss-banner')?.files?.[0];
        if (lf) { try { logo = await uploadToCloudinary(lf); } catch(e) {} }
        if (bf) { try { banner = await uploadToCloudinary(bf); } catch(e) {} }
        
        await db.collection('users').doc(APP.userProfile.uid).update({
            storeName: name, storeCategory: category, storeDescription: desc,
            storeCountry: country, storeColor: color, storeLogo: logo, storeBanner: banner,
            storeTags: tags, storeActive: true, hasStore: true
        });
        Object.assign(APP.userProfile, { storeName: name, storeCategory: category, storeDescription: desc, storeCountry: country, storeColor: color, storeLogo: logo, storeBanner: banner, storeTags: tags, storeActive: true, hasStore: true });
        
        hideLoader();
        showToast('🎉 Store launched!','success');
        loadStoreOwnerDashboard();
    } catch(e) { hideLoader(); showToast('Failed','error'); }
}

// =====================
// HELPER
// =====================
function isStoreColorLight(hex) {
    if (!hex) return false;
    const c = hex.replace('#','');
    const r = parseInt(c.substring(0,2),16), g = parseInt(c.substring(2,4),16), b = parseInt(c.substring(4,6),16);
    return (r*299+g*587+b*114)/1000 > 150;
}

// Global access
window.loadStoreMarket = loadStoreMarket;
window.openStoreShop = openStoreShop;
window.viewStoreProduct = viewStoreProduct;
window.quickAddToCart = quickAddToCart;
window.followStore = followStore;
window.likeProduct = likeProduct;
window.openChatWithStore = openChatWithStore;
window.loadStoreOwnerDashboard = loadStoreOwnerDashboard;
window.createStoreLobby = createStoreLobby;
window.showStorePlans = showStorePlans;
window.startStoreSetup = startStoreSetup;
window.STORE_PLANS = STORE_PLANS;

console.log('✅ storeowner.js production ready - All features functional');
