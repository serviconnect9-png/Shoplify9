// storeowner.js - COMPLETE WORKING VERSION (No Queries, No Indexes, Client-Side Filtering)
console.log('✅ storeowner.js loaded - Working Version');

// =====================
// STORE CONFIG
// =====================
const STORE_CONFIG = {
    plans: {
        basic: { name: 'Basic', price: 5, products: 50, chats: 10, analytics: 'simple', support: 'email', verified: false, sponsoredAds: true, color: '#4CAF50' },
        pro: { name: 'Pro', price: 15, products: 501, chats: 100, analytics: 'full', support: 'ticket+email+line', verified: false, sponsoredAds: true, color: '#2196F3' },
        enterprise: { name: 'Enterprise', price: 45, products: Infinity, chats: Infinity, analytics: 'enterprise', support: 'ticket+email+line+bot', verified: true, sponsoredAds: false, autoReply: true, dailyReports: true, color: '#FF9800' }
    },
    followBadges: [
        { threshold: 1000, color: '#0095F6', bonus: 5, name: 'Blue' },
        { threshold: 25000, color: '#22C55E', bonus: 20, name: 'Green' },
        { threshold: 50000, color: '#7C3AED', bonus: 100, name: 'Purple' },
        { threshold: 100000, color: '#FFFFFF', bonus: 700, name: 'White' },
        { threshold: 1000000, color: '#00BCD4', bonus: 700, name: 'Sea Blue' }
    ]
};

// =====================
// STORE MARKET - Browse All Stores
// =====================
async function loadStoreMarket() {
    console.log('🏪 Loading Store Market...');
    
    const container = document.getElementById('storemarket-content');
    if (!container) return;
    
    container.innerHTML = '<div style="text-align:center;padding:60px;"><div class="loader-spinner"></div><p>Loading stores...</p></div>';
    
    try {
        // SIMPLE READ - Get all users, filter client-side
        const snapshot = await db.collection('users').get();
        
        if (snapshot.empty) {
            container.innerHTML = '<div style="text-align:center;padding:60px;"><p style="font-size:50px;">🏪</p><h3>No Stores Yet</h3></div>';
            return;
        }
        
        // Filter stores client-side (NO QUERY FILTERS)
        const stores = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.hasStore && data.storeActive) {
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
                    countryFlag: data.countryFlag || '🌍',
                    followers: data.followersCount || 0
                });
            }
        });
        
        if (stores.length === 0) {
            container.innerHTML = '<div style="text-align:center;padding:60px;"><p style="font-size:50px;">🏪</p><h3>No Stores Yet</h3><button class="btn-gold" onclick="startStoreSetup()">Open Your Store</button></div>';
            return;
        }
        
        // Sort by followers (popular first)
        stores.sort((a, b) => (b.followers || 0) - (a.followers || 0));
        
        container.innerHTML = `
            <div style="padding:15px;">
                <div style="margin-bottom:15px;">
                    <input type="text" id="store-search" class="input-field" placeholder="Search stores..." 
                           oninput="filterStoreCards()" style="background:#f5f5f5;border-radius:25px;padding:12px 20px;">
                </div>
                
                <div style="display:flex;gap:8px;overflow-x:auto;margin-bottom:15px;padding-bottom:5px;" id="store-categories">
                    <span class="category-chip active" onclick="filterStoreCards('all')">All</span>
                    <span class="category-chip" onclick="filterStoreCards('Fashion')">Fashion</span>
                    <span class="category-chip" onclick="filterStoreCards('Electronics')">Electronics</span>
                    <span class="category-chip" onclick="filterStoreCards('Tickets & Events')">Tickets</span>
                    <span class="category-chip" onclick="filterStoreCards('All Purpose')">General</span>
                </div>
                
                <div id="stores-grid">
                    ${stores.map(store => renderStoreCard(store)).join('')}
                </div>
            </div>`;
        
        // Store data for filtering
        window._allStores = stores;
        
    } catch (e) {
        console.error('Store market error:', e);
        container.innerHTML = '<div style="text-align:center;padding:60px;"><p>Error loading stores</p><button class="btn-outline" onclick="loadStoreMarket()">Retry</button></div>';
    }
}

function renderStoreCard(store) {
    return `
        <div class="store-card" data-category="${store.storeCategory}" data-name="${store.storeName.toLowerCase()} ${store.username.toLowerCase()}"
             onclick="openStoreShop('${store.username}')"
             style="background:white;border-radius:16px;overflow:hidden;margin-bottom:15px;box-shadow:0 2px 12px rgba(0,0,0,0.06);cursor:pointer;">
            
            ${store.storeBanner ? `
                <div style="height:120px;background-image:url(${store.storeBanner});background-size:cover;background-position:center;"></div>
            ` : `
                <div style="height:120px;background:linear-gradient(135deg,${store.storeColor || '#667eea'},#764ba2);"></div>
            `}
            
            <div style="padding:15px;display:flex;gap:12px;align-items:center;">
                <img src="${store.storeLogo}" style="width:55px;height:55px;border-radius:14px;object-fit:cover;margin-top:-40px;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.1);" onerror="this.src='/app-icon.png'">
                <div style="flex:1;">
                    <div style="display:flex;align-items:center;gap:5px;">
                        <h4 style="margin:0;font-size:15px;">${store.storeName}</h4>
                        ${store.storeVerified ? '<span style="color:#20D5EC;">✓</span>' : ''}
                    </div>
                    <p style="font-size:12px;color:#666;margin:2px 0;">${store.storeCategory} · ${store.countryFlag}</p>
                    <p style="font-size:11px;color:#999;">${store.totalProducts} products · ${store.followers || 0} followers</p>
                </div>
                <button class="btn-gold btn-small" style="padding:8px 14px;">Visit →</button>
            </div>
        </div>`;
}

function filterStoreCards(category) {
    // Update active chip
    document.querySelectorAll('#store-categories .category-chip').forEach(c => c.classList.remove('active'));
    if (event && event.target) event.target.classList.add('active');
    
    const searchQuery = document.getElementById('store-search')?.value?.toLowerCase() || '';
    
    const cards = document.querySelectorAll('.store-card');
    cards.forEach(card => {
        let show = true;
        
        if (category && category !== 'all') {
            show = card.dataset.category === category;
        }
        
        if (show && searchQuery) {
            const name = card.dataset.name || '';
            show = name.includes(searchQuery);
        }
        
        card.style.display = show ? '' : 'none';
    });
    
    // Also filter from stored data
    if (category && category !== 'all' && window._allStores) {
        const filtered = window._allStores.filter(s => s.storeCategory === category);
        const grid = document.getElementById('stores-grid');
        if (grid) grid.innerHTML = filtered.map(s => renderStoreCard(s)).join('');
    }
}

// =====================
// STORE SETUP - Simple Modal
// =====================
function startStoreSetup() {
    const plans = STORE_CONFIG.plans;
    
    showModal(`
        <div style="padding:20px;max-height:80vh;overflow-y:auto;">
            <h3 style="text-align:center;">🏪 Create Your Store</h3>
            <p style="text-align:center;color:#666;margin-bottom:20px;">Choose your plan to get started</p>
            
            ${Object.entries(plans).map(([key, plan]) => `
                <div onclick="selectStorePlan('${key}')" id="plan-card-${key}"
                     style="background:white;border:2px solid #e0e0e0;border-radius:16px;padding:20px;margin-bottom:12px;cursor:pointer;transition:all 0.2s;">
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <h4 style="margin:0;">${plan.name}</h4>
                        <span style="font-size:28px;font-weight:800;color:${plan.color};">$${plan.price}<span style="font-size:14px;color:#999;">/mo</span></span>
                    </div>
                    <ul style="list-style:none;padding:0;margin:10px 0;font-size:13px;color:#666;">
                        <li>✅ ${plan.products === Infinity ? 'Unlimited' : 'Up to '+plan.products} products</li>
                        <li>✅ ${plan.analytics} analytics</li>
                        <li>✅ ${plan.chats === Infinity ? 'Unlimited' : plan.chats} chats/day</li>
                        ${plan.verified ? '<li>✅ Verified badge included</li>' : ''}
                        ${plan.autoReply ? '<li>✅ Auto reply bot</li>' : ''}
                    </ul>
                    <button class="btn-gold btn-full" style="background:#6C3CF0;color:white;padding:12px;border-radius:10px;font-weight:600;"
                            onclick="payAndCreateStore('${key}',${plan.price})">
                        Select ${plan.name} - $${plan.price}/mo
                    </button>
                </div>
            `).join('')}
            
            <p style="text-align:center;font-size:11px;color:#999;">All plans auto-renew. Cancel anytime.</p>
        </div>
    `);
}

function selectStorePlan(plan) {
    document.querySelectorAll('[id^="plan-card-"]').forEach(el => el.style.border = '2px solid #e0e0e0');
    const card = document.getElementById('plan-card-' + plan);
    if (card) card.style.border = '2px solid #6C3CF0';
}

async function payAndCreateStore(planKey, price) {
    if ((APP.userProfile?.walletBalance || 0) < price) {
        showToast(`Insufficient balance. Need $${price}. Deposit first.`, 'error');
        navigateTo('wallet');
        return;
    }
    
    hideModal();
    showLoader();
    
    try {
        const userId = APP.userProfile.uid;
        const expiry = new Date();
        expiry.setMonth(expiry.getMonth() + 1);
        
        await db.collection('users').doc(userId).update({
            walletBalance: firebase.firestore.FieldValue.increment(-price),
            hasStore: true,
            storePlan: planKey,
            storeActive: true,
            storeExpiry: firebase.firestore.Timestamp.fromDate(expiry),
            storeName: APP.userProfile.storeName || APP.userProfile.username + "'s Store",
            storeColor: '#6C3CF0',
            storeCategory: 'All Purpose',
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        APP.userProfile.walletBalance -= price;
        APP.userProfile.hasStore = true;
        APP.userProfile.storePlan = planKey;
        APP.userProfile.storeActive = true;
        APP.userProfile.storeExpiry = { seconds: Math.floor(expiry.getTime()/1000) };
        APP.userProfile.storeName = APP.userProfile.storeName || APP.userProfile.username + "'s Store";
        APP.userProfile.storeColor = '#6C3CF0';
        APP.userProfile.storeCategory = 'All Purpose';
        
        await db.collection('transactions').add({
            userId, type: 'store_subscription', amount: price,
            currency: 'USD', status: 'completed',
            description: `Store ${planKey} plan`,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        hideLoader();
        
        const storeUrl = `${APP.baseUrl}/store/${APP.userProfile.username}`;
        showToast(`Store created! 🎉 ${storeUrl}`, 'success');
        
        // Show setup form
        showStoreSettingsForm();
        
    } catch (e) {
        hideLoader();
        console.error('Store creation error:', e);
        showToast('Failed to create store. Try again.', 'error');
    }
}

// =====================
// STORE SETTINGS FORM
// =====================
function showStoreSettingsForm() {
    showModal(`
        <div style="padding:20px;max-height:80vh;overflow-y:auto;">
            <h3>⚙️ Store Settings</h3>
            
            <div class="input-group" style="margin-top:15px;">
                <label>Store Name</label>
                <input type="text" id="ss-name" class="input-field" value="${APP.userProfile.storeName||''}" placeholder="My Store">
            </div>
            
            <div class="input-group" style="margin-top:10px;">
                <label>Store Description</label>
                <textarea id="ss-desc" class="input-field" rows="2" placeholder="Describe your store...">${APP.userProfile.storeDescription||''}</textarea>
            </div>
            
            <div class="input-group" style="margin-top:10px;">
                <label>Store Category</label>
                <select id="ss-category" class="input-field">
                    <option value="Fashion" ${APP.userProfile.storeCategory==='Fashion'?'selected':''}>👗 Fashion</option>
                    <option value="Electronics" ${APP.userProfile.storeCategory==='Electronics'?'selected':''}>🔌 Electronics</option>
                    <option value="Home & Garden" ${APP.userProfile.storeCategory==='Home & Garden'?'selected':''}>🏠 Home & Garden</option>
                    <option value="Sports" ${APP.userProfile.storeCategory==='Sports'?'selected':''}>⚽ Sports</option>
                    <option value="Beauty" ${APP.userProfile.storeCategory==='Beauty'?'selected':''}>💄 Beauty</option>
                    <option value="Tickets & Events" ${APP.userProfile.storeCategory==='Tickets & Events'?'selected':''}>🎫 Tickets & Events</option>
                    <option value="All Purpose" ${APP.userProfile.storeCategory==='All Purpose'?'selected':''}>🛍️ All Purpose</option>
                </select>
            </div>
            
            <div class="input-group" style="margin-top:10px;">
                <label>Theme Color</label>
                <input type="color" id="ss-color" class="input-field" value="${APP.userProfile.storeColor||'#6C3CF0'}" style="height:50px;padding:5px;">
            </div>
            
            <div class="input-group" style="margin-top:10px;">
                <label>Store Logo</label>
                <input type="file" id="ss-logo" class="input-field" accept="image/*">
            </div>
            
            <div class="input-group" style="margin-top:10px;">
                <label>Store Banner</label>
                <input type="file" id="ss-banner" class="input-field" accept="image/*">
            </div>
            
            <button class="btn-gold btn-full" style="background:#6C3CF0;color:white;padding:14px;border-radius:12px;font-weight:700;margin-top:15px;" 
                    onclick="saveStoreSettings()">
                💾 Save Settings
            </button>
        </div>
    `);
}

async function saveStoreSettings() {
    const name = document.getElementById('ss-name')?.value?.trim();
    const desc = document.getElementById('ss-desc')?.value?.trim();
    const category = document.getElementById('ss-category')?.value;
    const color = document.getElementById('ss-color')?.value;
    
    if (!name) { showToast('Enter store name','error'); return; }
    
    hideModal();
    showLoader();
    
    try {
        const updates = {
            storeName: name,
            storeDescription: desc,
            storeCategory: category,
            storeColor: color
        };
        
        const logoFile = document.getElementById('ss-logo')?.files?.[0];
        const bannerFile = document.getElementById('ss-banner')?.files?.[0];
        
        if (logoFile) { try { updates.storeLogo = await uploadToCloudinary(logoFile); } catch(e) {} }
        if (bannerFile) { try { updates.storeBanner = await uploadToCloudinary(bannerFile); } catch(e) {} }
        
        await db.collection('users').doc(APP.userProfile.uid).update(updates);
        Object.assign(APP.userProfile, updates);
        
        hideLoader();
        showToast('Store settings saved! ✅', 'success');
        
        if (typeof loadProfileScreen === 'function') loadProfileScreen();
        
    } catch (e) {
        hideLoader();
        showToast('Failed to save settings', 'error');
    }
}

// =====================
// STORE SHOP VIEW (Customer View)
// =====================
async function openStoreShop(username) {
    console.log('🏪 Opening shop:', username);
    
    navigateTo('store-shop');
    
    const container = document.getElementById('store-shop-content');
    if (!container) return;
    
    container.innerHTML = '<div style="text-align:center;padding:60px;"><div class="loader-spinner"></div><p>Loading shop...</p></div>';
    
    try {
        // Get all users, find the store owner
        const usersSnap = await db.collection('users').get();
        let store = null;
        let storeId = null;
        
        usersSnap.forEach(doc => {
            const data = doc.data();
            if (data.username === username && data.hasStore) {
                store = data;
                storeId = doc.id;
            }
        });
        
        if (!store) {
            container.innerHTML = '<p style="text-align:center;padding:60px;">Store not found</p>';
            return;
        }
        
        // Get all products, filter by store ID
        const productsSnap = await db.collection('products').get();
        const products = [];
        productsSnap.forEach(doc => {
            const p = doc.data();
            if (p.merchantId === storeId && p.status === 'active') {
                products.push({ id: doc.id, ...p });
            }
        });
        
        const isLight = isColorLight(store.storeColor || '#667eea');
        const textColor = isLight ? '#1a1a1a' : '#ffffff';
        const subColor = isLight ? '#444' : 'rgba(255,255,255,0.8)';
        
        // Get cart count
        const cart = JSON.parse(sessionStorage.getItem('shoplify_cart') || '[]');
        const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        
        container.innerHTML = `
            <div style="background:#f5f5f5;min-height:100vh;">
                
                <!-- Top Bar -->
                <div style="position:sticky;top:0;z-index:100;background:white;padding:10px 15px;display:flex;align-items:center;gap:10px;border-bottom:1px solid #f0f0f0;box-shadow:0 1px 3px rgba(0,0,0,0.04);">
                    <button onclick="navigateTo('storemarket')" style="background:none;border:none;font-size:20px;cursor:pointer;">←</button>
                    <img src="${store.storeLogo||'/app-icon.png'}" style="width:28px;height:28px;border-radius:6px;">
                    <span style="font-weight:700;font-size:15px;flex:1;">${store.storeName||'Store'}</span>
                    <button onclick="navigateTo('checkout')" style="background:none;border:none;font-size:22px;cursor:pointer;position:relative;">
                        🛒
                        ${cartCount > 0 ? `<span style="position:absolute;top:-3px;right:-3px;background:#FF4444;color:white;font-size:10px;min-width:18px;height:18px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;">${cartCount}</span>` : ''}
                    </button>
                    <button onclick="openShopProfile('${username}')" style="background:none;border:none;font-size:22px;cursor:pointer;">👤</button>
                </div>
                
                <!-- Store Header -->
                ${store.storeBanner ? `<img src="${store.storeBanner}" style="width:100%;height:150px;object-fit:cover;" onerror="this.style.display='none'">` : ''}
                <div style="background:linear-gradient(135deg,${store.storeColor||'#6C3CF0'},#764ba2);padding:20px;text-align:center;color:${textColor};">
                    <img src="${store.storeLogo||'/app-icon.png'}" style="width:60px;height:60px;border-radius:16px;border:3px solid white;margin-bottom:8px;box-shadow:0 4px 12px rgba(0,0,0,0.2);" onerror="this.src='/app-icon.png'">
                    <h2 style="margin:0;font-size:20px;">${store.storeName||'Store'}</h2>
                    ${store.isAppVerified ? '<span style="background:#20D5EC;color:white;padding:3px 10px;border-radius:10px;font-size:10px;margin-top:4px;display:inline-block;">✓ Verified</span>' : ''}
                    <p style="font-size:13px;margin:4px 0 0;color:${subColor};">${store.storeDescription||''}</p>
                    <p style="font-size:11px;color:${subColor};">${products.length} Products</p>
                </div>
                
                <!-- Products Grid -->
                <div style="padding:10px;">
                    ${products.length === 0 ? '<p style="text-align:center;padding:40px;color:#999;">No products yet</p>' : `
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                            ${products.map(p => {
                                const img = p.images?.[0] || '/app-icon.png';
                                const isTicket = p.isTicket || p.category === 'Tickets & Events';
                                
                                return `
                                    <div onclick="viewShopProductDetail('${p.id}','${storeId}')"
                                         style="background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.04);cursor:pointer;">
                                        <div style="position:relative;">
                                            <img src="${img}" style="width:100%;height:150px;object-fit:cover;" onerror="this.src='/app-icon.png'" loading="lazy">
                                            ${p.sponsored ? '<span style="position:absolute;top:6px;left:6px;background:#FFD700;color:#1a1a1a;padding:2px 6px;border-radius:6px;font-size:9px;">⭐</span>' : ''}
                                            ${isTicket ? '<span style="position:absolute;top:6px;right:6px;background:#9C27B0;color:white;padding:2px 6px;border-radius:6px;font-size:9px;">🎫</span>' : ''}
                                        </div>
                                        <div style="padding:10px;">
                                            <div style="font-weight:600;font-size:12px;margin-bottom:4px;">${p.name}</div>
                                            <div style="font-weight:800;font-size:16px;color:#e44;">${formatCurrency(p.price)}</div>
                                            <div style="font-size:10px;color:#999;">${p.totalSales||0} sold</div>
                                        </div>
                                    </div>`;
                            }).join('')}
                        </div>
                    `}
                </div>
                
                <!-- Footer -->
                <div style="text-align:center;padding:20px;">
                    <p style="font-size:10px;color:#999;">${username}.oneshoplify.com · Powered by ONESHOPLIFY</p>
                </div>
            </div>`;
        
    } catch (e) {
        console.error('Shop error:', e);
        container.innerHTML = '<div style="text-align:center;padding:60px;"><p>Error loading shop</p><button class="btn-outline" onclick="openStoreShop(\''+username+'\')">Retry</button></div>';
    }
}

// =====================
// VIEW SHOP PRODUCT DETAIL
// =====================
async function viewShopProductDetail(productId, storeId) {
    showLoader();
    try {
        const doc = await db.collection('products').doc(productId).get();
        if (!doc.exists) { hideLoader(); showToast('Product not found','error'); return; }
        
        const product = doc.data();
        
        // Get reviews - simple read
        const reviewsSnap = await db.collection('reviews').get();
        const reviews = [];
        reviewsSnap.forEach(d => {
            const r = d.data();
            if (r.productId === productId) reviews.push(r);
        });
        reviews.sort((a,b) => (b.createdAt?.toDate?.()||0) - (a.createdAt?.toDate?.()||0));
        
        hideLoader();
        
        showModal(`
            <div style="max-height:85vh;overflow-y:auto;padding:0;">
                <div style="position:relative;">
                    <img src="${product.images?.[0] || '/app-icon.png'}" style="width:100%;height:300px;object-fit:cover;">
                    <button onclick="hideModal()" style="position:absolute;top:10px;left:10px;width:32px;height:32px;background:rgba(0,0,0,0.5);color:white;border:none;border-radius:50%;font-size:18px;cursor:pointer;">✕</button>
                </div>
                
                <div style="padding:20px;">
                    <h2 style="font-size:20px;margin-bottom:5px;">${product.name}</h2>
                    <div style="font-size:28px;font-weight:800;color:#e44;margin-bottom:10px;">${formatCurrency(product.price)}</div>
                    
                    <div style="margin:10px 0;font-size:13px;color:#666;">
                        <span>📦 ${product.totalSales||0} sold</span>
                        <span style="margin-left:15px;">⭐ ${product.avgRating?.toFixed(1)||'0.0'} (${product.reviewCount||0})</span>
                    </div>
                    
                    ${product.colors?.length ? `<p><strong>Colors:</strong> ${product.colors.join(', ')}</p>` : ''}
                    ${product.sizes?.length ? `<p><strong>Sizes:</strong> ${product.sizes.join(', ')}</p>` : ''}
                    
                    <p style="color:#666;line-height:1.6;margin:10px 0;">${product.description || 'No description'}</p>
                    
                    <button class="btn-gold btn-full" style="padding:16px;font-size:16px;margin-top:15px;" 
                            onclick="addToCartFromShop('${product.id}','${product.name.replace(/'/g,"\\'")}','${product.price}','${product.images?.[0]||'/app-icon.png'}','${storeId}');hideModal();">
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

function addToCartFromShop(productId, name, price, image, storeId) {
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
// SHOP PROFILE
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
    const container = document.getElementById('storeowner-content');
    if (!container) return;
    
    if (!APP.userProfile?.hasStore) {
        container.innerHTML = `
            <div style="text-align:center;padding:60px;">
                <p style="font-size:50px;">🏪</p>
                <h3>No Store Found</h3>
                <p style="color:#666;">Create your store to get started</p>
                <button class="btn-gold" onclick="startStoreSetup()" style="background:#6C3CF0;color:white;padding:14px 28px;border-radius:12px;font-weight:700;margin-top:10px;">Create Store</button>
            </div>`;
        return;
    }
    
    const store = APP.userProfile;
    const plan = STORE_CONFIG.plans[store.storePlan] || STORE_CONFIG.plans.basic;
    const storeUrl = `${APP.baseUrl}/store/${store.username}`;
    
    // Get real stats
    let totalProducts = 0, totalOrders = 0, totalRevenue = 0;
    try {
        const prodSnap = await db.collection('products').get();
        prodSnap.forEach(doc => {
            if (doc.data().merchantId === APP.userProfile.uid) totalProducts++;
        });
        
        const orderSnap = await db.collection('orders').get();
        orderSnap.forEach(doc => {
            const o = doc.data();
            if (o.merchantId === APP.userProfile.uid && o.status === 'completed') {
                totalOrders++;
                totalRevenue += o.total || 0;
            }
        });
    } catch(e) {}
    
    container.innerHTML = `
        <div style="padding:15px;padding-bottom:30px;">
            
            <!-- Store Header -->
            <div style="text-align:center;padding:25px;background:linear-gradient(135deg,${store.storeColor||'#6C3CF0'},#764ba2);border-radius:16px;color:white;margin-bottom:15px;box-shadow:0 4px 16px rgba(0,0,0,0.15);">
                ${store.storeLogo ? `<img src="${store.storeLogo}" style="width:60px;height:60px;border-radius:16px;border:3px solid white;margin-bottom:10px;">` : ''}
                <h2 style="margin:0;">${store.storeName||'My Store'}</h2>
                <p style="opacity:0.8;margin:5px 0;">${plan.name} Plan · ${store.storeCategory||'Store'}</p>
            </div>
            
            <!-- Stats -->
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:15px;">
                <div class="stat-card" style="padding:14px;text-align:center;background:white;border-radius:10px;">
                    <div style="font-size:22px;font-weight:800;color:#6C3CF0;">${totalProducts}</div>
                    <div style="font-size:10px;color:#999;">Products</div>
                </div>
                <div class="stat-card" style="padding:14px;text-align:center;background:white;border-radius:10px;">
                    <div style="font-size:22px;font-weight:800;color:#22C55E;">${totalOrders}</div>
                    <div style="font-size:10px;color:#999;">Orders</div>
                </div>
                <div class="stat-card" style="padding:14px;text-align:center;background:white;border-radius:10px;">
                    <div style="font-size:22px;font-weight:800;color:#FF9800;">${formatCurrency(totalRevenue)}</div>
                    <div style="font-size:10px;color:#999;">Revenue</div>
                </div>
            </div>
            
            <!-- Actions -->
            <button class="btn-gold btn-full" style="background:#6C3CF0;color:white;margin-bottom:8px;padding:14px;font-weight:700;border-radius:12px;" onclick="navigateTo('add-product')">➕ Add Product</button>
            <button class="btn-outline btn-full" style="margin-bottom:8px;padding:12px;" onclick="addTicketProduct()">🎫 Add Ticket/Event</button>
            <button class="btn-outline btn-full" style="margin-bottom:8px;padding:12px;" onclick="openStoreShop('${store.username}')">👁️ View My Shop</button>
            <button class="btn-outline btn-full" style="margin-bottom:8px;padding:12px;" onclick="navigateTo('orders')">📦 Orders</button>
            <button class="btn-outline btn-full" style="margin-bottom:8px;padding:12px;" onclick="showStoreSettingsForm()">⚙️ Settings</button>
            <button class="btn-outline btn-full" style="margin-bottom:8px;padding:12px;" onclick="applyForAd()">📢 Advertise</button>
            <button class="btn-outline btn-full" style="margin-bottom:8px;padding:12px;" onclick="openStoreChat()">💬 Chat</button>
            <button class="btn-outline btn-full" style="margin-bottom:8px;padding:12px;" onclick="openStoreLobby()">📢 Lobby</button>
            
            <!-- Store URL -->
            <div style="background:white;padding:15px;border-radius:12px;margin:10px 0;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
                <p style="font-weight:600;font-size:13px;">🔗 Your Store URL:</p>
                <div style="font-family:monospace;font-size:12px;background:#f5f5f5;padding:10px;border-radius:6px;margin:8px 0;">${storeUrl}</div>
                <button class="copy-btn" onclick="copyToClipboard('${storeUrl}');showToast('Copied!','success');">📋 Copy</button>
            </div>
            
            <!-- Store Status -->
            <div style="background:#E8F5E9;padding:14px;border-radius:10px;text-align:center;">
                <p style="margin:0;font-weight:600;">✅ Store Active · ${plan.name} Plan</p>
                ${store.storeExpiry ? `<p style="font-size:11px;color:#666;margin:5px 0 0;">Expires: ${new Date(store.storeExpiry.seconds*1000).toLocaleDateString()}</p>` : ''}
                <button class="btn-small btn-outline" onclick="startStoreSetup()" style="margin-top:8px;">Renew/Upgrade</button>
            </div>
        </div>`;
}

// =====================
// AD APPLICATION
// =====================
async function applyForAd() {
    showModal(`
        <div style="padding:15px;">
            <h3>📢 Advertise Your Store</h3>
            <p style="color:#666;margin:10px 0;">Your ad will show randomly across ONESHOPLIFY</p>
            
            <div class="input-group"><label>Ad Title</label><input type="text" id="ad-title" class="input-field" placeholder="Summer Sale!"></div>
            <div class="input-group"><label>Description</label><textarea id="ad-desc" class="input-field" rows="2"></textarea></div>
            <div class="input-group"><label>Ad Image</label><input type="file" id="ad-media" class="input-field" accept="image/*"></div>
            <div class="input-group"><label>Daily Budget (Min $5)</label><input type="number" id="ad-budget" class="input-field" min="5" value="10"></div>
            <div class="input-group"><label>Duration (Days)</label><input type="number" id="ad-duration" class="input-field" min="1" max="30" value="7"></div>
            
            <p style="font-size:13px;">Total: <strong id="ad-total-display">$70</strong></p>
            <p style="font-size:12px;color:#666;">Balance: ${formatCurrency(APP.userProfile?.walletBalance||0)}</p>
            
            <button class="btn-gold btn-full" style="background:#6C3CF0;color:white;margin-top:15px;padding:14px;border-radius:12px;font-weight:700;" 
                    onclick="submitAdApplication()">Submit & Pay</button>
        </div>
    `);
    
    document.getElementById('ad-budget').addEventListener('input', function() {
        const b = parseFloat(this.value)||0;
        const d = parseInt(document.getElementById('ad-duration')?.value)||0;
        document.getElementById('ad-total-display').textContent = '$'+(b*d).toFixed(2);
    });
    document.getElementById('ad-duration').addEventListener('input', function() {
        const b = parseFloat(document.getElementById('ad-budget')?.value)||0;
        const d = parseInt(this.value)||0;
        document.getElementById('ad-total-display').textContent = '$'+(b*d).toFixed(2);
    });
}

async function submitAdApplication() {
    const title = document.getElementById('ad-title')?.value?.trim();
    const budget = parseFloat(document.getElementById('ad-budget')?.value)||0;
    const duration = parseInt(document.getElementById('ad-duration')?.value)||0;
    const total = budget * duration;
    
    if (!title) { showToast('Enter ad title','error'); return; }
    if (budget < 5) { showToast('Minimum $5/day','error'); return; }
    if (total > (APP.userProfile.walletBalance||0)) { showToast('Insufficient balance','error'); navigateTo('wallet'); return; }
    
    hideModal(); showLoader();
    
    try {
        const mediaFile = document.getElementById('ad-media')?.files?.[0];
        let mediaUrl = '';
        if (mediaFile) { try { mediaUrl = await uploadToCloudinary(mediaFile); } catch(e) {} }
        
        await db.collection('users').doc(APP.userProfile.uid).update({
            walletBalance: firebase.firestore.FieldValue.increment(-total)
        });
        
        await db.collection('ads').add({
            storeId: APP.userProfile.uid,
            storeName: APP.userProfile.storeName,
            title, budget, duration, total, mediaUrl,
            status: 'active', impressions: 0, clicks: 0,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            expiresAt: new Date(Date.now() + duration * 24 * 60 * 60 * 1000)
        });
        
        APP.userProfile.walletBalance -= total;
        hideLoader(); showToast('Ad submitted! Running now 📢','success');
    } catch(e) { hideLoader(); showToast('Failed','error'); }
}

// =====================
// CHAT SYSTEM
// =====================
function openStoreChat() {
    showModal(`
        <div style="height:85vh;display:flex;flex-direction:column;">
            <div style="padding:15px;background:#6C3CF0;color:white;display:flex;align-items:center;gap:10px;border-radius:16px 16px 0 0;">
                <span style="font-size:20px;">💬</span>
                <div style="flex:1;"><strong>Store Chat</strong></div>
                <button onclick="hideModal()" style="background:none;border:none;color:white;font-size:20px;cursor:pointer;">✕</button>
            </div>
            <div style="padding:10px;background:white;">
                <input type="text" id="chat-user-search" class="input-field" placeholder="Search user by username..." 
                       oninput="searchChatUsers()" style="background:#f5f5f5;border-radius:20px;padding:10px 16px;font-size:13px;">
            </div>
            <div id="chat-messages" style="flex:1;overflow-y:auto;padding:15px;background:#f5f5f5;">
                <p style="text-align:center;color:#999;">Search a user to start chatting</p>
            </div>
            <div style="padding:10px;background:white;display:flex;gap:8px;border-top:1px solid #f0f0f0;">
                <input type="text" id="chat-input" class="input-field" placeholder="Type message..." style="flex:1;border-radius:20px;">
                <button onclick="sendChatMsg()" style="background:#6C3CF0;color:white;border:none;width:44px;height:44px;border-radius:50%;font-size:18px;cursor:pointer;">➤</button>
            </div>
        </div>
    `);
}

async function searchChatUsers() {
    const query = document.getElementById('chat-user-search')?.value?.trim()?.toLowerCase();
    if (!query || query.length < 2) return;
    
    const messages = document.getElementById('chat-messages');
    messages.innerHTML = '<p style="text-align:center;color:#999;">Searching...</p>';
    
    try {
        const snap = await db.collection('users').get();
        const users = [];
        snap.forEach(doc => {
            const u = doc.data();
            if (u.username && u.username.includes(query)) {
                users.push({ id: doc.id, ...u });
            }
        });
        
        messages.innerHTML = users.slice(0, 10).map(u => `
            <div onclick="startChatWith('${u.id}','${u.username}','${u.displayName||u.username}')" 
                 style="padding:12px;background:white;border-radius:10px;margin-bottom:5px;cursor:pointer;display:flex;align-items:center;gap:10px;">
                <img src="${u.photoURL||'/app-icon.png'}" style="width:40px;height:40px;border-radius:50%;">
                <div><strong>${u.displayName||u.username}</strong><br><span style="font-size:11px;color:#999;">@${u.username}</span></div>
            </div>
        `).join('') || '<p style="text-align:center;color:#999;">No users found</p>';
    } catch(e) {
        messages.innerHTML = '<p style="text-align:center;color:#999;">Error searching</p>';
    }
}

function startChatWith(userId, username, displayName) {
    document.getElementById('chat-messages').innerHTML = `<p style="text-align:center;color:#666;">Chat with <strong>@${username}</strong></p>`;
    window._chatWith = { userId, username, displayName };
    loadChatHistory(userId);
}

async function loadChatHistory(otherUserId) {
    const myId = APP.userProfile.uid;
    const messages = document.getElementById('chat-messages');
    
    try {
        const chatId = [myId, otherUserId].sort().join('_');
        const doc = await db.collection('chats').doc(chatId).get();
        
        if (doc.exists) {
            const chatMessages = doc.data().messages || [];
            messages.innerHTML = chatMessages.map(msg => `
                <div style="display:flex;justify-content:${msg.senderId===myId?'flex-end':'flex-start'};margin-bottom:8px;">
                    <div style="max-width:70%;padding:10px 14px;border-radius:16px;background:${msg.senderId===myId?'#6C3CF0':'white'};color:${msg.senderId===myId?'white':'#333'};font-size:13px;">
                        ${msg.text}
                        <div style="font-size:9px;opacity:0.6;margin-top:3px;">${msg.timestamp?new Date(msg.timestamp.seconds*1000).toLocaleTimeString():''}</div>
                    </div>
                </div>
            `).join('');
        }
    } catch(e) {}
}

async function sendChatMsg() {
    const input = document.getElementById('chat-input');
    const text = input?.value?.trim();
    if (!text || !window._chatWith) return;
    input.value = '';
    
    const messages = document.getElementById('chat-messages');
    messages.innerHTML += `
        <div style="display:flex;justify-content:flex-end;margin-bottom:8px;">
            <div style="max-width:70%;padding:10px 14px;border-radius:16px;background:#6C3CF0;color:white;font-size:13px;">
                ${text}
                <div style="font-size:9px;opacity:0.6;">Just now</div>
            </div>
        </div>`;
    messages.scrollTop = messages.scrollHeight;
    
    try {
        const myId = APP.userProfile.uid;
        const otherId = window._chatWith.userId;
        const chatId = [myId, otherId].sort().join('_');
        
        await db.collection('chats').doc(chatId).set({
            participants: [myId, otherId],
            messages: firebase.firestore.FieldValue.arrayUnion({
                senderId: myId, text,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            })
        }, { merge: true });
        
        if (typeof createNotification === 'function') {
            await createNotification(otherId, '💬 New Message',
                `${APP.userProfile.storeName||APP.userProfile.username}: ${text.substring(0,50)}`,
                '💬', 'chat');
        }
    } catch(e) {}
}

// =====================
// STORE LOBBY
// =====================
function openStoreLobby() {
    showModal(`
        <div style="height:85vh;display:flex;flex-direction:column;">
            <div style="padding:15px;background:#6C3CF0;color:white;display:flex;align-items:center;gap:10px;border-radius:16px 16px 0 0;">
                <span style="font-size:20px;">📢</span>
                <div style="flex:1;"><strong>Store Lobby</strong><br><span style="font-size:11px;opacity:0.8;">Broadcast to your followers</span></div>
                <button onclick="hideModal()" style="background:none;border:none;color:white;font-size:20px;cursor:pointer;">✕</button>
            </div>
            <div id="lobby-messages" style="flex:1;overflow-y:auto;padding:15px;background:#f5f5f5;">
                <p style="text-align:center;color:#999;">Loading lobby...</p>
            </div>
            <div style="padding:10px;background:white;display:flex;gap:8px;align-items:center;border-top:1px solid #f0f0f0;">
                <input type="file" id="lobby-img" accept="image/*" style="display:none;" onchange="uploadLobbyImg()">
                <button onclick="document.getElementById('lobby-img').click()" style="background:none;border:none;font-size:22px;cursor:pointer;">🖼️</button>
                <input type="text" id="lobby-input" class="input-field" placeholder="Broadcast to followers..." style="flex:1;border-radius:20px;">
                <button onclick="sendLobbyMsg()" style="background:#6C3CF0;color:white;border:none;padding:10px 20px;border-radius:20px;font-weight:600;cursor:pointer;">Send</button>
            </div>
        </div>
    `);
    
    loadLobbyHistory();
}

async function loadLobbyHistory() {
    const container = document.getElementById('lobby-messages');
    if (!container) return;
    
    try {
        const snap = await db.collection('store_lobby').get();
        const messages = [];
        snap.forEach(doc => {
            const m = doc.data();
            if (m.storeId === APP.userProfile.uid) {
                messages.push({ id: doc.id, ...m });
            }
        });
        
        messages.sort((a,b) => (b.timestamp?.seconds||0) - (a.timestamp?.seconds||0));
        
        container.innerHTML = messages.length === 0 ? '<p style="text-align:center;color:#999;">No lobby posts yet</p>' :
            messages.map(msg => `
                <div style="background:white;padding:15px;border-radius:12px;margin-bottom:10px;box-shadow:0 2px 6px rgba(0,0,0,0.04);">
                    ${msg.image ? `<img src="${msg.image}" style="max-width:100%;border-radius:8px;margin-bottom:8px;">` : ''}
                    <p style="margin:0;font-size:14px;">${msg.text}</p>
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;">
                        <span style="font-size:11px;color:#999;">${msg.timestamp?new Date(msg.timestamp.seconds*1000).toLocaleString():''}</span>
                        <span style="font-size:13px;cursor:pointer;" onclick="reactToLobbyPost('${msg.id}')">❤️ ${msg.reactions||0}</span>
                    </div>
                </div>
            `).join('');
    } catch(e) {
        container.innerHTML = '<p style="text-align:center;color:#999;">Error loading lobby</p>';
    }
}

async function sendLobbyMsg() {
    const input = document.getElementById('lobby-input');
    const text = input?.value?.trim();
    if (!text) return;
    input.value = '';
    
    try {
        await db.collection('store_lobby').add({
            storeId: APP.userProfile.uid,
            storeName: APP.userProfile.storeName,
            text,
            image: window._lobbyImage || null,
            reactions: 0,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        window._lobbyImage = null;
        loadLobbyHistory();
        showToast('Posted to lobby! 📢','success');
    } catch(e) { showToast('Failed','error'); }
}

function uploadLobbyImg() {
    const file = document.getElementById('lobby-img')?.files?.[0];
    if (!file) return;
    uploadToCloudinary(file).then(url => {
        window._lobbyImage = url;
        showToast('Image ready! Add text and send.','success');
    }).catch(() => showToast('Upload failed','error'));
}

async function reactToLobbyPost(postId) {
    try {
        await db.collection('store_lobby').doc(postId).update({
            reactions: firebase.firestore.FieldValue.increment(1)
        });
        loadLobbyHistory();
    } catch(e) {}
}

// =====================
// ADD TICKET PRODUCT
// =====================
function addTicketProduct() {
    showModal(`
        <div style="padding:15px;max-height:80vh;overflow-y:auto;">
            <h3>🎫 Add Ticket/Event</h3>
            <div class="input-group"><label>Event Name *</label><input type="text" id="ticket-name" class="input-field"></div>
            <div class="input-group"><label>Description</label><textarea id="ticket-desc" class="input-field" rows="2"></textarea></div>
            <div style="display:flex;gap:10px;"><div class="input-group" style="flex:1;"><label>Date *</label><input type="date" id="ticket-date" class="input-field"></div><div class="input-group" style="flex:1;"><label>Time *</label><input type="time" id="ticket-time" class="input-field"></div></div>
            <div class="input-group"><label>Venue Address *</label><input type="text" id="ticket-address" class="input-field"></div>
            <div class="input-group"><label>Country</label><select id="ticket-country" class="input-field">${typeof COUNTRIES!=='undefined'?Object.entries(COUNTRIES).sort((a,b)=>a[1].name.localeCompare(b[1].name)).map(([c,d])=>`<option value="${c}" ${APP.userProfile.country===c?'selected':''}>${d.flag||''} ${d.name}</option>`).join(''):''}</select></div>
            <div class="input-group"><label>Quantity *</label><input type="number" id="ticket-qty" class="input-field" min="1" value="100"></div>
            <div class="input-group"><label>Price (USD) *</label><input type="number" id="ticket-price" class="input-field" step="0.01" min="0"></div>
            <div class="input-group"><label>Ticket Image</label><input type="file" id="ticket-img" class="input-field" accept="image/*"></div>
            <div class="input-group"><label>Delivery Method</label><select id="ticket-delivery" class="input-field"><option value="app">App Generated</option><option value="owner">Store Owner (WhatsApp)</option></select></div>
            <div class="input-group" id="ticket-wa-group" style="display:none;"><label>WhatsApp Number</label><input type="tel" id="ticket-wa" class="input-field"></div>
            <button class="btn-gold btn-full" style="background:#6C3CF0;color:white;margin-top:15px;padding:14px;border-radius:12px;font-weight:700;" onclick="createTicketProduct()">🎫 Create Ticket</button>
        </div>
    `);
    
    document.getElementById('ticket-delivery').addEventListener('change', function() {
        document.getElementById('ticket-wa-group').style.display = this.value === 'owner' ? '' : 'none';
    });
}

async function createTicketProduct() {
    const name = document.getElementById('ticket-name')?.value?.trim();
    const date = document.getElementById('ticket-date')?.value;
    const time = document.getElementById('ticket-time')?.value;
    const address = document.getElementById('ticket-address')?.value?.trim();
    const qty = parseInt(document.getElementById('ticket-qty')?.value) || 0;
    const price = parseFloat(document.getElementById('ticket-price')?.value) || 0;
    const delivery = document.getElementById('ticket-delivery')?.value;
    const wa = document.getElementById('ticket-wa')?.value?.trim();
    
    if (!name || !date || !time || !address || qty < 1) { showToast('Fill all required fields','error'); return; }
    
    hideModal(); showLoader();
    
    try {
        const imgFile = document.getElementById('ticket-img')?.files?.[0];
        let imgUrl = '';
        if (imgFile) { try { imgUrl = await uploadToCloudinary(imgFile); } catch(e) {} }
        
        // Generate ticket IDs
        const ticketIds = [];
        for (let i = 0; i < qty; i++) {
            ticketIds.push('TKT-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2,6).toUpperCase());
        }
        
        await db.collection('products').add({
            name, description: document.getElementById('ticket-desc')?.value?.trim() || '',
            price, category: 'Tickets & Events',
            images: imgUrl ? [imgUrl] : ['/app-icon.png'],
            stock: qty,
            isTicket: true,
            ticketData: {
                eventDate: date, eventTime: time, address,
                country: document.getElementById('ticket-country')?.value,
                totalQuantity: qty, remainingQuantity: qty,
                ticketIds, usedTicketIds: [],
                deliveryMethod: delivery,
                whatsappNumber: wa || ''
            },
            merchantId: APP.userProfile.uid,
            merchantName: APP.userProfile.storeName || APP.userProfile.username,
            status: 'active',
            totalSales: 0, avgRating: 0, reviewCount: 0,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        hideLoader();
        showToast(`${qty} tickets created! 🎫`,'success');
    } catch(e) { hideLoader(); showToast('Failed','error'); }
}

// =====================
// HELPER
// =====================
function isColorLight(hex) {
    if (!hex) return false;
    const c = hex.replace('#','');
    return (parseInt(c.substring(0,2),16)*299 + parseInt(c.substring(2,4),16)*587 + parseInt(c.substring(4,6),16)*114)/1000 > 150;
}

// Global access
window.loadStoreMarket = loadStoreMarket;
window.openStoreShop = openStoreShop;
window.viewShopProductDetail = viewShopProductDetail;
window.loadStoreOwnerDashboard = loadStoreOwnerDashboard;
window.startStoreSetup = startStoreSetup;
window.showStoreSettingsForm = showStoreSettingsForm;
window.applyForAd = applyForAd;
window.openStoreChat = openStoreChat;
window.openStoreLobby = openStoreLobby;
window.addTicketProduct = addTicketProduct;
window.payAndCreateStore = payAndCreateStore;

console.log('✅ storeowner.js fully loaded - All features working without indexes');
