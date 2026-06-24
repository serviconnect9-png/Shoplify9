// storeowner.js - COMPLETE STORE OWNER SYSTEM
// ONESHOPLIFY Enterprise - Store Creation, Management, Products, Tickets, Chat, Followers, Analytics
console.log('✅ storeowner.js loaded - Store Owner System');

// =====================
// STORE PLANS
// =====================
const STORE_PLANS = {
    basic: {
        name: 'Basic',
        price: 0, // Free or minimal
        maxProducts: 50,
        analytics: 'simple',
        support: 'email',
        chatLimit: 10,
        followers: true,
        sponsoredAds: true, // Can show sponsored products
        verifiedBadge: false,
        dailyReports: false,
        autoReply: false
    },
    pro: {
        name: 'Pro',
        price: 29, // $29/month
        maxProducts: 501,
        analytics: 'full',
        support: 'ticket+email+phone',
        chatLimit: 100,
        followers: true,
        sponsoredAds: true,
        verifiedBadge: false,
        dailyReports: false,
        autoReply: false
    },
    enterprise: {
        name: 'Enterprise',
        price: 99, // $99/month
        maxProducts: Infinity,
        analytics: 'enterprise',
        support: 'ticket+email+phone+bot',
        chatLimit: Infinity,
        followers: true,
        sponsoredAds: false, // No sponsored ads on store
        verifiedBadge: true,
        dailyReports: true,
        autoReply: true
    }
};

// =====================
// STORE CREATION FLOW
// =====================
async function startStoreCreation() {
    if (!APP.userProfile) {
        showToast('Please login first', 'error');
        navigateTo('auth');
        return;
    }
    
    // Check if user already has a store
    if (APP.userProfile.hasStore) {
        showToast('You already have a store!', 'info');
        navigateTo('store-dashboard');
        return;
    }
    
    showModal(`
        <div style="padding:20px;max-height:85vh;overflow-y:auto;">
            <div style="text-align:center;margin-bottom:20px;">
                <div style="font-size:50px;">🏪</div>
                <h2 style="color:#6C3CF0;">Create Your Store</h2>
                <p style="color:#666;">Start selling on ONESHOPLIFY</p>
            </div>
            
            <h4 style="margin-bottom:10px;">Choose Store Type</h4>
            
            <div onclick="selectStoreType('individual')" id="type-individual" 
                 style="padding:20px;border:2px solid #e0e0e0;border-radius:12px;margin-bottom:10px;cursor:pointer;transition:0.2s;">
                <div style="font-size:30px;">👤</div>
                <h4>Individual Store</h4>
                <p style="font-size:12px;color:#666;">Perfect for solo entrepreneurs and personal brands</p>
            </div>
            
            <div onclick="selectStoreType('organization')" id="type-organization"
                 style="padding:20px;border:2px solid #e0e0e0;border-radius:12px;margin-bottom:15px;cursor:pointer;transition:0.2s;">
                <div style="font-size:30px;">🏢</div>
                <h4>Organization Store</h4>
                <p style="font-size:12px;color:#666;">For registered businesses and companies</p>
            </div>
            
            <button class="btn-gold btn-full" onclick="proceedToStorePlan()" id="btn-store-type" disabled>
                Continue
            </button>
        </div>
    `);
    
    window._storeCreation = { step: 1 };
}

function selectStoreType(type) {
    window._storeCreation.storeType = type;
    document.querySelectorAll('#type-individual, #type-organization').forEach(el => {
        el.style.border = '2px solid #e0e0e0';
        el.style.background = 'white';
    });
    const el = document.getElementById('type-' + type);
    if (el) {
        el.style.border = '2px solid #6C3CF0';
        el.style.background = '#F5F0FF';
    }
    document.getElementById('btn-store-type').disabled = false;
}

function proceedToStorePlan() {
    hideModal();
    showStorePlans();
}

function showStorePlans() {
    showModal(`
        <div style="padding:20px;max-height:85vh;overflow-y:auto;">
            <div style="text-align:center;margin-bottom:20px;">
                <h2 style="color:#6C3CF0;">Choose a Plan</h2>
                <p style="color:#666;">Select the plan that fits your business</p>
            </div>
            
            ${Object.entries(STORE_PLANS).map(([key, plan]) => `
                <div onclick="selectStorePlan('${key}')" id="plan-${key}"
                     style="padding:20px;border:2px solid #e0e0e0;border-radius:12px;margin-bottom:10px;cursor:pointer;transition:0.2s;${key === 'pro' ? 'border-color:#6C3CF0;background:#F5F0FF;' : ''}">
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <h4>${plan.name}</h4>
                        <div style="font-size:24px;font-weight:800;color:#6C3CF0;">$${plan.price}<span style="font-size:14px;color:#999;">/mo</span></div>
                    </div>
                    <ul style="list-style:none;padding:0;font-size:12px;color:#666;line-height:2;margin-top:10px;">
                        <li>✅ ${plan.maxProducts === Infinity ? 'Unlimited' : 'Up to ' + plan.maxProducts} products</li>
                        <li>✅ ${plan.analytics} analytics</li>
                        <li>✅ ${plan.support} support</li>
                        ${plan.verifiedBadge ? '<li>✅ Verified badge on store</li>' : ''}
                        ${plan.dailyReports ? '<li>✅ Daily reports & notifications</li>' : ''}
                        ${plan.autoReply ? '<li>✅ Auto-reply bot</li>' : ''}
                        ${plan.sponsoredAds ? '<li>⚠️ Sponsored ads displayed</li>' : '<li>✅ No sponsored ads</li>'}
                    </ul>
                    ${key === 'pro' ? '<span style="background:#6C3CF0;color:white;padding:3px 10px;border-radius:10px;font-size:10px;">RECOMMENDED</span>' : ''}
                </div>
            `).join('')}
            
            <button class="btn-gold btn-full" onclick="proceedToStoreSetup()">Continue</button>
        </div>
    `);
    
    window._storeCreation.plan = 'pro'; // Default to pro
}

function selectStorePlan(plan) {
    window._storeCreation.plan = plan;
    document.querySelectorAll('[id^="plan-"]').forEach(el => {
        el.style.border = '2px solid #e0e0e0';
        el.style.background = 'white';
    });
    const el = document.getElementById('plan-' + plan);
    if (el) {
        el.style.border = '2px solid #6C3CF0';
        el.style.background = '#F5F0FF';
    }
}

// =====================
// STORE DASHBOARD (After store is created)
// =====================
async function loadStoreDashboard() {
    if (!APP.userProfile || !APP.userProfile.hasStore) {
        showToast('Create a store first', 'info');
        startStoreCreation();
        return;
    }
    
    const container = document.getElementById('store-dashboard-content');
    if (!container) return;
    
    const store = APP.userProfile.storeData || {};
    const plan = STORE_PLANS[store.plan] || STORE_PLANS.basic;
    const followers = store.followers || 0;
    
    // Determine badge based on followers
    let badge = null;
    let badgeColor = '';
    if (followers >= 1000000) { badge = '💎'; badgeColor = '#00BCD4'; }
    else if (followers >= 100000) { badge = '👑'; badgeColor = '#FFFFFF'; }
    else if (followers >= 50000) { badge = '💜'; badgeColor = '#9C27B0'; }
    else if (followers >= 25000) { badge = '💚'; badgeColor = '#4CAF50'; }
    else if (followers >= 1000) { badge = '💙'; badgeColor = '#2196F3'; }
    
    container.innerHTML = `
        <div style="background:#0F172A;min-height:100vh;color:white;">
            
            <!-- Sidebar Toggle -->
            <div style="padding:15px;display:flex;align-items:center;gap:10px;">
                <button onclick="toggleSidebar()" style="background:none;border:none;color:white;font-size:24px;cursor:pointer;">☰</button>
                <h3 style="margin:0;">ONESHOPLIFY</h3>
            </div>
            
            <!-- Store Card -->
            <div style="margin:15px;background:#1E293B;border-radius:12px;padding:15px;">
                <div style="display:flex;align-items:center;gap:10px;">
                    <img src="${store.logo || '/app-icon.png'}" style="width:40px;height:40px;border-radius:50%;">
                    <div>
                        <div style="font-weight:600;">${store.name || 'My Store'}</div>
                        <div style="font-size:11px;color:#94A3B8;">${plan.name} Plan</div>
                    </div>
                    ${badge ? `<span style="font-size:20px;">${badge}</span>` : ''}
                </div>
                <button class="btn-outline btn-full" style="margin-top:10px;color:white;border-color:#334155;" 
                        onclick="window.open('https://${APP.userProfile.username}.oneshoplify.com','_blank')">
                    👁️ View Store
                </button>
            </div>
            
            <!-- Stats Cards -->
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;padding:0 15px;margin-bottom:15px;">
                <div class="stat-card" style="background:#1E293B;padding:12px;border-radius:8px;text-align:center;">
                    <div style="font-size:20px;font-weight:800;color:#6C3CF0;" id="sd-revenue">$0</div>
                    <div style="font-size:10px;color:#94A3B8;">Revenue</div>
                </div>
                <div class="stat-card" style="background:#1E293B;padding:12px;border-radius:8px;text-align:center;">
                    <div style="font-size:20px;font-weight:800;color:#22C55E;" id="sd-orders">0</div>
                    <div style="font-size:10px;color:#94A3B8;">Orders</div>
                </div>
                <div class="stat-card" style="background:#1E293B;padding:12px;border-radius:8px;text-align:center;">
                    <div style="font-size:20px;font-weight:800;color:#F59E0B;">${followers}</div>
                    <div style="font-size:10px;color:#94A3B8;">Followers</div>
                </div>
            </div>
            
            <!-- Navigation Menu -->
            <div style="padding:0 15px;">
                ${[
                    { icon: '📊', label: 'Dashboard', screen: 'store-dashboard' },
                    { icon: '📦', label: 'Products', screen: 'store-products' },
                    { icon: '🛒', label: 'Orders', screen: 'orders' },
                    { icon: '👥', label: 'Customers', screen: 'store-customers' },
                    { icon: '📈', label: 'Analytics', screen: 'analytics' },
                    { icon: '🎫', label: 'Discounts & Coupons', screen: 'store-discounts' },
                    { icon: '⭐', label: 'Reviews', screen: 'store-reviews' },
                    { icon: '💰', label: 'Payouts', screen: 'wallet' },
                    { icon: '🎨', label: 'Store Design', screen: 'store-settings' },
                    { icon: '💬', label: 'Chat', screen: 'store-chat' },
                    { icon: '📢', label: 'Lobby', screen: 'store-lobby' },
                    { icon: '🔔', label: 'Notifications', screen: 'notifications' },
                    { icon: '⚙️', label: 'Settings', screen: 'settings' },
                    { icon: '🎧', label: 'Support', screen: 'customerservice' }
                ].map(item => `
                    <div onclick="navigateTo('${item.screen}')" 
                         style="padding:12px;display:flex;align-items:center;gap:10px;cursor:pointer;border-radius:8px;margin-bottom:2px;transition:0.2s;"
                         onmouseover="this.style.background='#1E293B'" onmouseout="this.style.background='transparent'">
                        <span style="font-size:18px;">${item.icon}</span>
                        <span style="font-size:14px;">${item.label}</span>
                        <span style="margin-left:auto;color:#94A3B8;">›</span>
                    </div>
                `).join('')}
            </div>
            
        </div>`;
    
    loadStoreStats();
}

async function loadStoreStats() {
    try {
        const storeId = APP.userProfile.storeData?.id;
        if (!storeId) return;
        
        // Get products count
        const productsSnap = await db.collection('products')
            .where('storeId', '==', storeId).get();
        
        // Get orders
        const ordersSnap = await db.collection('orders')
            .where('storeId', '==', storeId).get();
        
        let revenue = 0;
        ordersSnap.forEach(doc => {
            const o = doc.data();
            if (o.status === 'completed') revenue += o.total || 0;
        });
        
        document.getElementById('sd-revenue') && (document.getElementById('sd-revenue').textContent = formatCurrency(revenue));
        document.getElementById('sd-orders') && (document.getElementById('sd-orders').textContent = ordersSnap.size);
        
    } catch(e) { console.warn('Stats error:', e); }
}

// =====================
// FOLLOW SYSTEM (Backend handled)
// =====================
async function followStore(storeId) {
    if (!APP.userProfile) {
        showToast('Please login first', 'error');
        return;
    }
    
    const userId = APP.userProfile.uid;
    
    // Send to backend
    try {
        const response = await fetch(APP.backendUrl + '/stores/' + storeId + '/follow', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Update UI
            const btn = document.getElementById('follow-btn');
            if (btn) {
                btn.textContent = result.following ? '✓ Following' : 'Follow';
                btn.style.background = result.following ? '#22C55E' : '#FFC107';
                btn.style.color = result.following ? 'white' : '#1a1a1a';
            }
            
            // Update follower count from backend
            if (result.followerCount) {
                const countEl = document.getElementById('follower-count');
                if (countEl) countEl.textContent = result.followerCount;
            }
        }
    } catch(e) {
        console.error('Follow error:', e);
        showToast('Failed to follow', 'error');
    }
}

// =====================
// LIKE PRODUCT (Backend handled)
// =====================
async function likeProduct(productId) {
    if (!APP.userProfile) {
        showToast('Please login first', 'error');
        return;
    }
    
    const userId = APP.userProfile.uid;
    
    // Animate heart immediately
    const heartEl = document.getElementById('like-btn-' + productId);
    if (heartEl) {
        heartEl.style.transform = 'scale(1.3)';
        setTimeout(() => { heartEl.style.transform = 'scale(1)'; }, 200);
    }
    
    try {
        const response = await fetch(APP.backendUrl + '/products/' + productId + '/like', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
        });
        
        const result = await response.json();
        
        if (result.success) {
            const likeCount = document.getElementById('like-count-' + productId);
            if (likeCount) likeCount.textContent = result.likes;
            
            if (heartEl) {
                heartEl.textContent = result.liked ? '❤️' : '🤍';
            }
        }
    } catch(e) {
        console.error('Like error:', e);
    }
}

// =====================
// STORE LOBBY (Messages to all followers)
// =====================
async function createLobbyPost() {
    if (!APP.userProfile?.hasStore) {
        showToast('Only store owners can post', 'error');
        return;
    }
    
    showModal(`
        <div style="padding:15px;">
            <h3>📢 Create Lobby Post</h3>
            <p style="color:#666;font-size:13px;">This message will be sent to all your followers</p>
            
            <div class="input-group" style="margin-top:15px;">
                <label>Message</label>
                <textarea id="lobby-message" class="input-field" rows="3" placeholder="Share something with your followers..."></textarea>
            </div>
            
            <div class="input-group" style="margin-top:10px;">
                <label>Add Image (optional)</label>
                <input type="file" id="lobby-image" class="input-field" accept="image/*" onchange="previewLobbyImage()">
                <div id="lobby-image-preview" style="margin-top:8px;"></div>
            </div>
            
            <button class="btn-gold btn-full" style="margin-top:15px;" onclick="publishLobbyPost()">
                📤 Post to Followers
            </button>
        </div>
    `);
}

async function publishLobbyPost() {
    const message = document.getElementById('lobby-message')?.value?.trim();
    if (!message) { showToast('Enter a message', 'error'); return; }
    
    hideModal();
    showLoader();
    
    try {
        let imageUrl = '';
        const imageFile = document.getElementById('lobby-image')?.files?.[0];
        if (imageFile) {
            imageUrl = await uploadToCloudinary(imageFile);
        }
        
        // Send to backend
        const response = await fetch(APP.backendUrl + '/stores/lobby/post', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                storeId: APP.userProfile.storeData.id,
                message,
                imageUrl,
                userId: APP.userProfile.uid
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            hideLoader();
            showToast('Posted to all followers! 📢', 'success');
        }
    } catch(e) {
        hideLoader();
        showToast('Failed to post', 'error');
    }
}

// =====================
// CHAT SYSTEM
// =====================
async function openChatWithStore(storeId, storeName) {
    if (!APP.userProfile) {
        showToast('Please login first', 'error');
        return;
    }
    
    navigateTo('store-chat', { storeId, storeName });
}

function loadStoreChat(data) {
    const container = document.getElementById('store-chat-content');
    if (!container) return;
    
    const storeName = data?.storeName || 'Store';
    const storeId = data?.storeId;
    
    container.innerHTML = `
        <div style="display:flex;flex-direction:column;height:100vh;">
            <!-- Chat Header -->
            <div style="background:white;padding:12px 15px;display:flex;align-items:center;gap:10px;border-bottom:1px solid #f0f0f0;">
                <button onclick="navigateTo('store-dashboard')" style="background:none;border:none;font-size:20px;">←</button>
                <div style="font-weight:600;">${storeName}</div>
            </div>
            
            <!-- Messages Area -->
            <div id="chat-messages" style="flex:1;overflow-y:auto;padding:15px;background:#f5f5f5;">
                <p style="text-align:center;color:#999;padding:20px;">Start a conversation</p>
            </div>
            
            <!-- Message Input -->
            <div style="background:white;padding:10px;display:flex;gap:10px;border-top:1px solid #f0f0f0;">
                <input type="text" id="chat-input" class="input-field" placeholder="Type a message..." style="flex:1;border-radius:20px;">
                <button onclick="sendChatMessage('${storeId}')" style="background:#6C3CF0;color:white;border:none;border-radius:50%;width:40px;height:40px;font-size:18px;cursor:pointer;">➤</button>
            </div>
        </div>
    `;
    
    loadChatMessages(storeId);
}

async function loadChatMessages(storeId) {
    if (!APP.userProfile) return;
    
    try {
        const snap = await db.collection('chat_messages')
            .where('participants', 'array-contains', APP.userProfile.uid)
            .orderBy('createdAt')
            .get();
        
        const container = document.getElementById('chat-messages');
        if (!container) return;
        
        container.innerHTML = '';
        snap.forEach(doc => {
            const msg = doc.data();
            const isMine = msg.senderId === APP.userProfile.uid;
            
            container.innerHTML += `
                <div style="display:flex;justify-content:${isMine ? 'flex-end' : 'flex-start'};margin-bottom:8px;">
                    <div style="max-width:70%;padding:10px 14px;border-radius:${isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px'};background:${isMine ? '#6C3CF0' : 'white'};color:${isMine ? 'white' : '#333'};font-size:14px;">
                        ${msg.message}
                        <div style="font-size:10px;opacity:0.7;margin-top:4px;">${getTimeAgo(msg.createdAt)}</div>
                    </div>
                </div>`;
        });
        
        container.scrollTop = container.scrollHeight;
    } catch(e) {
        console.error('Chat error:', e);
    }
}

async function sendChatMessage(storeId) {
    const input = document.getElementById('chat-input');
    const message = input?.value?.trim();
    if (!message || !APP.userProfile) return;
    
    // Show message immediately
    const container = document.getElementById('chat-messages');
    if (container) {
        container.innerHTML += `
            <div style="display:flex;justify-content:flex-end;margin-bottom:8px;">
                <div style="max-width:70%;padding:10px 14px;border-radius:16px 16px 4px 16px;background:#6C3CF0;color:white;font-size:14px;">
                    ${message}
                    <div style="font-size:10px;opacity:0.7;margin-top:4px;">Just now</div>
                </div>
            </div>`;
        container.scrollTop = container.scrollHeight;
    }
    
    input.value = '';
    
    // Send to backend
    try {
        await db.collection('chat_messages').add({
            senderId: APP.userProfile.uid,
            receiverId: storeId,
            participants: [APP.userProfile.uid, storeId],
            message,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch(e) {
        console.error('Send error:', e);
    }
}

// =====================
// SEARCH USER FOR CHAT
// =====================
async function searchUserForChat() {
    showModal(`
        <div style="padding:15px;">
            <h3>💬 New Conversation</h3>
            <div class="input-group" style="margin-top:10px;">
                <label>Search by Username</label>
                <input type="text" id="chat-search-user" class="input-field" placeholder="Enter username..." oninput="performUserSearch()">
            </div>
            <div id="user-search-results" style="margin-top:10px;"></div>
        </div>
    `);
}

async function performUserSearch() {
    const query = document.getElementById('chat-search-user')?.value?.trim()?.toLowerCase();
    const container = document.getElementById('user-search-results');
    if (!container || !query) { container.innerHTML = ''; return; }
    
    if (query.length < 2) return;
    
    try {
        const snap = await db.collection('users')
            .where('username', '>=', query)
            .where('username', '<=', query + '\uf8ff')
            .limit(10)
            .get();
        
        container.innerHTML = '';
        snap.forEach(doc => {
            const user = doc.data();
            if (user.uid !== APP.userProfile.uid) {
                container.innerHTML += `
                    <div style="display:flex;align-items:center;gap:10px;padding:10px;cursor:pointer;border-bottom:1px solid #f0f0f0;"
                         onclick="openChatWithUser('${user.uid}','${user.displayName||user.username}')">
                        <img src="${user.photoURL||'/app-icon.png'}" style="width:40px;height:40px;border-radius:50%;">
                        <div>
                            <div style="font-weight:600;">${user.displayName||user.username}</div>
                            <div style="font-size:12px;color:#999;">@${user.username}</div>
                        </div>
                    </div>`;
            }
        });
    } catch(e) { console.error('Search error:', e); }
}

// Global access
window.startStoreCreation = startStoreCreation;
window.loadStoreDashboard = loadStoreDashboard;
window.followStore = followStore;
window.likeProduct = likeProduct;
window.createLobbyPost = createLobbyPost;
window.searchUserForChat = searchUserForChat;
window.STORE_PLANS = STORE_PLANS;

console.log('✅ All store owner functions globally accessible');
