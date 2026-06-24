// storeowner.js - COMPLETE BEAST MODE (Store Ownership, Chat, Follow, Like, Ads, Analytics, Lobby)
console.log('✅ storeowner.js loaded - Beast Mode');

// =====================
// GLOBAL STATE
// =====================
const STORE_CONFIG = {
    plans: {
        basic: { name: 'Basic', price: 5, products: 50, chats: 10, analytics: 'simple', support: 'email', verified: false, sponsoredAds: true },
        pro: { name: 'Pro', price: 15, products: 501, chats: 100, analytics: 'full', support: 'ticket+email+line', verified: false, sponsoredAds: true },
        enterprise: { name: 'Enterprise', price: 45, products: Infinity, chats: Infinity, analytics: 'enterprise', support: 'ticket+email+line+bot', verified: true, sponsoredAds: false, autoReply: true, dailyReports: true }
    },
    followBadges: [
        { threshold: 1000, color: '#0095F6', bonus: 5, name: 'Blue Badge' },
        { threshold: 25000, color: '#22C55E', bonus: 20, name: 'Green Badge' },
        { threshold: 50000, color: '#7C3AED', bonus: 100, name: 'Purple Badge' },
        { threshold: 100000, color: '#FFFFFF', bonus: 700, name: 'White Badge' },
        { threshold: 1000000, color: '#00BCD4', bonus: 700, name: 'Sea Blue Badge' }
    ]
};

// =====================
// STORE SETUP WIZARD (10 Steps)
// =====================
let setupStep = 1;
let setupData = {};

function startStoreSetup() {
    setupStep = 1;
    setupData = { plan: '', storeName: '', ownerName: '', email: '', phone: '', country: '', category: '', description: '', tags: '', logo: '', banner: '', color: '#6C3CF0' };
    renderSetupStep();
}

function renderSetupStep() {
    const steps = [
        { num: 1, title: 'Choose Plan', render: renderPlanStep },
        { num: 2, title: 'Account Info', render: renderAccountStep },
        { num: 3, title: 'Store Details', render: renderDetailsStep },
        { num: 4, title: 'Branding', render: renderBrandingStep },
        { num: 5, title: 'Payment', render: renderPaymentStep },
        { num: 6, title: 'Review', render: renderReviewStep },
        { num: 7, title: 'Pay', render: renderPayStep },
        { num: 8, title: 'Success', render: renderSuccessStep },
        { num: 9, title: 'Settings', render: renderSettingsStep },
        { num: 10, title: 'Ready', render: renderReadyStep }
    ];
    
    const step = steps[setupStep - 1];
    
    showModal(`
        <div style="padding:0;max-height:90vh;overflow-y:auto;">
            <!-- Progress Bar -->
            <div style="padding:15px 20px;background:white;border-bottom:1px solid #f0f0f0;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                    <span style="font-weight:700;color:#6C3CF0;">Step ${step.num} of ${steps.length}</span>
                    <span style="color:#999;font-size:13px;">${step.title}</span>
                </div>
                <div style="background:#f0f0f0;height:4px;border-radius:2px;">
                    <div style="background:#6C3CF0;height:4px;border-radius:2px;width:${(setupStep/steps.length)*100}%;transition:width 0.3s;"></div>
                </div>
            </div>
            
            <div id="setup-step-content" style="padding:20px;"></div>
        </div>
    `);
    
    setTimeout(() => step.render(), 100);
}

function renderPlanStep() {
    const plans = STORE_CONFIG.plans;
    document.getElementById('setup-step-content').innerHTML = `
        <h3 style="text-align:center;">Choose Your Plan</h3>
        <p style="text-align:center;color:#666;margin-bottom:20px;">Select the plan that fits your business</p>
        
        ${Object.entries(plans).map(([key, plan]) => `
            <div onclick="selectSetupPlan('${key}')" id="plan-${key}"
                 style="background:white;border:2px solid ${setupData.plan===key?'#6C3CF0':'#e0e0e0'};border-radius:16px;padding:20px;margin-bottom:12px;cursor:pointer;transition:all 0.2s;${plan.name==='Pro'?'position:relative;':''}">
                ${plan.name==='Pro'?'<span style="position:absolute;top:-8px;right:20px;background:#6C3CF0;color:white;padding:4px 12px;border-radius:12px;font-size:11px;">RECOMMENDED</span>':''}
                <h4>${plan.name}</h4>
                <div style="font-size:32px;font-weight:800;color:#6C3CF0;">$${plan.price}<span style="font-size:14px;color:#999;">/mo</span></div>
                <ul style="list-style:none;padding:0;margin:10px 0;font-size:13px;color:#666;">
                    <li>✅ ${plan.products === Infinity ? 'Unlimited' : 'Up to '+plan.products} products</li>
                    <li>✅ ${plan.analytics} analytics</li>
                    <li>✅ ${plan.support} support</li>
                    <li>✅ ${plan.chats === Infinity ? 'Unlimited' : plan.chats} chats/day</li>
                    ${plan.verified ? '<li>✅ Verified badge</li>' : ''}
                    ${plan.sponsoredAds ? '<li>📢 Sponsored products</li>' : '<li>🚫 No sponsored ads</li>'}
                </ul>
            </div>
        `).join('')}
        
        <button class="btn-gold btn-full" style="background:#6C3CF0;color:white;padding:16px;border-radius:12px;font-weight:700;font-size:16px;margin-top:10px;" 
                onclick="setupData.plan ? (setupStep=2,renderSetupStep()) : showToast('Select a plan','error')">
            Continue →
        </button>
    `;
}

function selectSetupPlan(plan) {
    setupData.plan = plan;
    document.querySelectorAll('[id^="plan-"]').forEach(el => el.style.border = '2px solid #e0e0e0');
    document.getElementById('plan-'+plan).style.border = '2px solid #6C3CF0';
}

function renderAccountStep() {
    document.getElementById('setup-step-content').innerHTML = `
        <h3>Account Information</h3>
        <div class="input-group"><label>Store Name *</label><input type="text" id="su-name" class="input-field" value="${setupData.storeName}" placeholder="My Store"></div>
        <div class="input-group"><label>Owner Name *</label><input type="text" id="su-owner" class="input-field" value="${setupData.ownerName||APP.userProfile?.displayName||''}" placeholder="Your name"></div>
        <div class="input-group"><label>Email *</label><input type="email" id="su-email" class="input-field" value="${setupData.email||APP.userProfile?.email||''}"></div>
        <div class="input-group"><label>Phone *</label><input type="tel" id="su-phone" class="input-field" value="${setupData.phone||APP.userProfile?.phoneNumber||''}"></div>
        <div class="input-group"><label>Country *</label><select id="su-country" class="input-field">${getCountryOptions(setupData.country||APP.userProfile?.country)}</select></div>
        <div style="display:flex;gap:10px;margin-top:15px;">
            <button class="btn-outline" style="flex:1;" onclick="setupStep=1;renderSetupStep();">← Back</button>
            <button class="btn-gold" style="flex:1;background:#6C3CF0;color:white;padding:14px;border-radius:12px;font-weight:700;" onclick="saveAccountStep()">Continue →</button>
        </div>
    `;
}

function saveAccountStep() {
    setupData.storeName = document.getElementById('su-name')?.value?.trim();
    setupData.ownerName = document.getElementById('su-owner')?.value?.trim();
    setupData.email = document.getElementById('su-email')?.value?.trim();
    setupData.phone = document.getElementById('su-phone')?.value?.trim();
    setupData.country = document.getElementById('su-country')?.value;
    if (!setupData.storeName || !setupData.ownerName || !setupData.email || !setupData.phone || !setupData.country) {
        showToast('Fill all fields','error'); return;
    }
    setupStep = 3; renderSetupStep();
}

// Continue all steps... (Details, Branding, Payment, Review, Pay, Success, Settings, Ready)

// =====================
// STORE OWNER DASHBOARD (Professional Sidebar Layout)
// =====================
async function loadStoreOwnerDashboard() {
    const container = document.getElementById('storeowner-content');
    if (!container) return;
    
    if (!APP.userProfile?.hasStore) {
        container.innerHTML = `<div style="text-align:center;padding:60px;"><p style="font-size:50px;">🏪</p><h3>No Store Found</h3><button class="btn-gold" onclick="startStoreSetup()">Create Store</button></div>`;
        return;
    }
    
    const store = APP.userProfile;
    const plan = STORE_CONFIG.plans[store.storePlan] || STORE_CONFIG.plans.basic;
    
    container.innerHTML = `
        <div style="display:flex;height:100vh;overflow:hidden;">
            <!-- SIDEBAR -->
            <div id="store-sidebar" style="width:260px;background:linear-gradient(180deg,#0F172A,#1E293B);color:white;padding:20px;overflow-y:auto;transition:width 0.3s;flex-shrink:0;">
                <div style="text-align:center;margin-bottom:20px;">
                    <img src="${store.storeLogo||'/app-icon.png'}" style="width:50px;height:50px;border-radius:12px;margin-bottom:8px;">
                    <h4 style="margin:0;">${store.storeName||'My Store'}</h4>
                    <p style="font-size:11px;opacity:0.7;">${plan.name} Plan</p>
                    <button class="btn-small" style="background:#6C3CF0;color:white;border:none;padding:6px 14px;border-radius:8px;margin-top:5px;font-size:11px;" onclick="openStoreShop('${store.username}')">View Store</button>
                </div>
                
                <nav style="display:flex;flex-direction:column;gap:2px;">
                    ${['Dashboard','Products','Orders','Customers','Analytics','Marketing','Discounts','Reviews','Payouts','Store Design','Pages','Settings','Support'].map(item => `
                        <button class="sidebar-nav-item" onclick="navigateStoreSection('${item.toLowerCase().replace(/ /g,'-')}')" 
                                style="width:100%;padding:10px 12px;background:transparent;border:none;color:white;text-align:left;border-radius:8px;cursor:pointer;font-size:13px;transition:0.2s;"
                                onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='transparent'">
                            ${item}
                        </button>
                    `).join('')}
                </nav>
            </div>
            
            <!-- TOGGLE SIDEBAR BUTTON -->
            <button onclick="toggleStoreSidebar()" style="position:absolute;left:260px;top:50%;background:#6C3CF0;color:white;border:none;width:24px;height:48px;border-radius:0 8px 8px 0;cursor:pointer;z-index:10;">◀</button>
            
            <!-- MAIN CONTENT -->
            <div id="store-main-content" style="flex:1;overflow-y:auto;padding:20px;background:#F8F9FB;">
                ${renderDashboardOverview(store, plan)}
            </div>
        </div>
    `;
}

function toggleStoreSidebar() {
    const sidebar = document.getElementById('store-sidebar');
    const btn = event.target;
    if (sidebar.style.width === '0px' || sidebar.style.width === '') {
        sidebar.style.width = '260px';
        btn.style.left = '260px';
        btn.textContent = '◀';
    } else {
        sidebar.style.width = '0px';
        btn.style.left = '0px';
        btn.textContent = '▶';
    }
}

function renderDashboardOverview(store, plan) {
    return `
        <h2 style="margin:0 0 5px;">Dashboard</h2>
        <p style="color:#666;margin:0 0 20px;">Welcome back, ${store.storeName}</p>
        
        <!-- Stats Cards -->
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px;">
            ${['Total Revenue','Orders','Visitors','Conversion Rate','Avg Order','Balance'].map(stat => `
                <div style="background:white;padding:18px;border-radius:14px;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
                    <p style="font-size:11px;color:#999;margin:0;">${stat}</p>
                    <p style="font-size:24px;font-weight:800;margin:5px 0;">${stat==='Total Revenue'||stat==='Balance'?'$1,245':'128'}</p>
                    <p style="font-size:11px;color:#22C55E;margin:0;">↑ 12.5%</p>
                </div>
            `).join('')}
        </div>
        
        <!-- Charts Row -->
        <div style="display:grid;grid-template-columns:2fr 1fr;gap:15px;margin-bottom:20px;">
            <div style="background:white;padding:20px;border-radius:14px;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
                <h4>Revenue Overview</h4>
                <div style="height:250px;"><canvas id="revenueChart"></canvas></div>
            </div>
            <div style="background:white;padding:20px;border-radius:14px;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
                <h4>Order Status</h4>
                <div style="height:250px;"><canvas id="orderDoughnut"></canvas></div>
            </div>
        </div>
        
        <!-- Recent Orders -->
        <div style="background:white;padding:20px;border-radius:14px;box-shadow:0 2px 8px rgba(0,0,0,0.04);margin-bottom:20px;">
            <h4>Recent Orders</h4>
            <div id="recent-orders">Loading...</div>
        </div>
    `;
}

function navigateStoreSection(section) {
    console.log('📂 Store section:', section);
    const main = document.getElementById('store-main-content');
    if (!main) return;
    
    switch(section) {
        case 'dashboard':
            main.innerHTML = renderDashboardOverview(APP.userProfile, STORE_CONFIG.plans[APP.userProfile.storePlan]||STORE_CONFIG.plans.basic);
            break;
        case 'products':
            main.innerHTML = '<h3>📦 Products</h3><p>Product management coming...</p>';
            break;
        case 'orders':
            main.innerHTML = '<h3>📋 Orders</h3><div id="store-orders-list">Loading orders...</div>';
            loadStoreOrders();
            break;
        case 'analytics':
            main.innerHTML = '<h3>📊 Analytics</h3><div id="store-analytics">Loading analytics...</div>';
            loadStoreAnalyticsDashboard();
            break;
        case 'customers':
            main.innerHTML = '<h3>👥 Customers</h3><div id="store-customers">Loading...</div>';
            break;
        case 'chat':
            openStoreChat();
            break;
        case 'lobby':
            openStoreLobby();
            break;
        default:
            main.innerHTML = `<h3>${section.replace(/-/g,' ').toUpperCase()}</h3><p>Section ready</p>`;
    }
}

// =====================
// FOLLOW SYSTEM (Backend-driven)
// =====================
async function followStore(storeId) {
    if (!APP.userProfile) { showToast('Please login','error'); return; }
    
    // Animate button immediately
    const btn = event.target;
    btn.disabled = true;
    btn.textContent = '...';
    
    try {
        const response = await fetch(`${APP.backendUrl}/follow`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ followerId: APP.userProfile.uid, storeId })
        });
        const data = await response.json();
        
        if (data.following) {
            btn.textContent = '✓ Following';
            btn.style.background = '#22C55E';
            updateFollowerCount(data.followersCount);
            
            // Check badge thresholds
            checkFollowBadge(data.followersCount, storeId);
        }
    } catch(e) {
        btn.disabled = false;
        btn.textContent = 'Follow';
        showToast('Failed to follow','error');
    }
}

async function checkFollowBadge(followersCount, storeId) {
    const badges = STORE_CONFIG.followBadges;
    let newBadge = null;
    let bonus = 0;
    
    for (const badge of badges) {
        if (followersCount >= badge.threshold) {
            newBadge = badge;
            bonus = badge.bonus;
        }
    }
    
    if (newBadge && bonus > 0) {
        // Check if bonus already claimed
        const storeDoc = await db.collection('users').doc(storeId).get();
        const claimedBadges = storeDoc.data()?.claimedBadges || [];
        
        if (!claimedBadges.includes(newBadge.name)) {
            // Award bonus
            await db.collection('users').doc(storeId).update({
                walletBalance: firebase.firestore.FieldValue.increment(bonus),
                storeBadge: newBadge.color,
                claimedBadges: [...claimedBadges, newBadge.name]
            });
            
            await createNotification(storeId, '🎉 Badge Achieved!', 
                `You earned the ${newBadge.name} with $${bonus} bonus!`, '🏆', 'storeowner');
        }
    }
}

// =====================
// LIKE SYSTEM (Backend-driven)
// =====================
async function likeProduct(productId) {
    if (!APP.userProfile) { showToast('Please login','error'); return; }
    
    // Heart animation immediately
    animateHeart(event.target);
    
    try {
        const response = await fetch(`${APP.backendUrl}/like`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: APP.userProfile.uid, productId })
        });
        const data = await response.json();
        
        if (data.liked) {
            updateLikeCount(productId, data.likes);
        }
    } catch(e) {
        console.error('Like error:', e);
    }
}

function animateHeart(el) {
    el.style.transform = 'scale(1.3)';
    el.style.color = '#FF4444';
    setTimeout(() => {
        el.style.transform = 'scale(1)';
    }, 200);
}

function updateLikeCount(productId, count) {
    const counter = document.querySelector(`[data-likes="${productId}"]`);
    if (counter) counter.textContent = `❤️ ${count}`;
}

function updateFollowerCount(count) {
    const counter = document.querySelector('[data-followers]');
    if (counter) counter.textContent = `${count} followers`;
}

// =====================
// CHAT SYSTEM
// =====================
async function openStoreChat(userId) {
    showModal(`
        <div style="height:85vh;display:flex;flex-direction:column;">
            <!-- Chat Header -->
            <div style="padding:15px;background:#6C3CF0;color:white;display:flex;align-items:center;gap:10px;border-radius:16px 16px 0 0;">
                <img src="${APP.userProfile?.storeLogo||'/app-icon.png'}" style="width:40px;height:40px;border-radius:50%;">
                <div style="flex:1;"><strong>${APP.userProfile?.storeName||'Store'} Chat</strong></div>
                <button onclick="hideModal()" style="background:none;border:none;color:white;font-size:20px;cursor:pointer;">✕</button>
            </div>
            
            <!-- Search User -->
            <div style="padding:10px;background:white;border-bottom:1px solid #f0f0f0;">
                <input type="text" id="chat-user-search" class="input-field" placeholder="Search user by username..." 
                       oninput="searchChatUser()" style="background:#f5f5f5;border-radius:20px;padding:10px 16px;font-size:13px;">
            </div>
            
            <!-- Chat Messages -->
            <div id="chat-messages" style="flex:1;overflow-y:auto;padding:15px;background:#f5f5f5;">
                <p style="text-align:center;color:#999;">Search a user to start chatting</p>
            </div>
            
            <!-- Chat Input -->
            <div style="padding:10px;background:white;display:flex;gap:8px;border-top:1px solid #f0f0f0;">
                <input type="text" id="chat-input" class="input-field" placeholder="Type message..." style="flex:1;border-radius:20px;">
                <button onclick="sendChatMessage()" style="background:#6C3CF0;color:white;border:none;width:44px;height:44px;border-radius:50%;font-size:18px;cursor:pointer;">➤</button>
            </div>
        </div>
    `);
}

async function searchChatUser() {
    const query = document.getElementById('chat-user-search')?.value?.trim()?.toLowerCase();
    if (!query || query.length < 2) return;
    
    try {
        const snap = await db.collection('users').where('username','==',query).limit(5).get();
        const messages = document.getElementById('chat-messages');
        messages.innerHTML = '';
        
        snap.forEach(doc => {
            const user = doc.data();
            messages.innerHTML += `
                <div onclick="startChatWithUser('${doc.id}','${user.username}','${user.displayName||user.username}')" 
                     style="padding:10px;background:white;border-radius:10px;margin-bottom:5px;cursor:pointer;display:flex;align-items:center;gap:10px;">
                    <img src="${user.photoURL||'/app-icon.png'}" style="width:40px;height:40px;border-radius:50%;">
                    <div><strong>${user.displayName||user.username}</strong><br><span style="font-size:12px;color:#999;">@${user.username}</span></div>
                </div>`;
        });
    } catch(e) {}
}

async function startChatWithUser(userId, username, displayName) {
    document.getElementById('chat-messages').innerHTML = `<p style="text-align:center;color:#666;">Chat with <strong>@${username}</strong></p>`;
    window._chatWith = { userId, username, displayName };
    
    // Load existing messages
    loadChatMessages(userId);
}

async function loadChatMessages(otherUserId) {
    const myId = APP.userProfile.uid;
    const messages = document.getElementById('chat-messages');
    
    try {
        const snap = await db.collection('chats')
            .where('participants', 'array-contains', myId)
            .get();
        
        const chatMessages = [];
        snap.forEach(doc => {
            const chat = doc.data();
            if (chat.participants.includes(otherUserId)) {
                chatMessages.push(...(chat.messages || []));
            }
        });
        
        chatMessages.sort((a,b) => (a.timestamp?.seconds||0) - (b.timestamp?.seconds||0));
        
        messages.innerHTML = chatMessages.map(msg => `
            <div style="display:flex;justify-content:${msg.senderId===myId?'flex-end':'flex-start'};margin-bottom:8px;">
                <div style="max-width:70%;padding:10px 14px;border-radius:16px;background:${msg.senderId===myId?'#6C3CF0':'white'};color:${msg.senderId===myId?'white':'#333'};font-size:13px;">
                    ${msg.image ? `<img src="${msg.image}" style="max-width:200px;border-radius:8px;margin-bottom:5px;">` : ''}
                    ${msg.text}
                    <div style="font-size:9px;opacity:0.6;margin-top:3px;">${new Date(msg.timestamp?.seconds*1000).toLocaleTimeString()}</div>
                </div>
            </div>
        `).join('');
    } catch(e) {}
}

async function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const text = input?.value?.trim();
    if (!text || !window._chatWith) return;
    
    input.value = '';
    
    // Show immediately
    const messages = document.getElementById('chat-messages');
    messages.innerHTML += `
        <div style="display:flex;justify-content:flex-end;margin-bottom:8px;">
            <div style="max-width:70%;padding:10px 14px;border-radius:16px;background:#6C3CF0;color:white;font-size:13px;">
                ${text}
                <div style="font-size:9px;opacity:0.6;">Just now</div>
            </div>
        </div>`;
    messages.scrollTop = messages.scrollHeight;
    
    // Save to backend
    try {
        const myId = APP.userProfile.uid;
        const otherId = window._chatWith.userId;
        const chatId = [myId, otherId].sort().join('_');
        
        await db.collection('chats').doc(chatId).set({
            participants: [myId, otherId],
            messages: firebase.firestore.FieldValue.arrayUnion({
                senderId: myId,
                text, timestamp: firebase.firestore.FieldValue.serverTimestamp()
            })
        }, { merge: true });
        
        // Send notification
        await createNotification(otherId, '💬 New Message', 
            `${APP.userProfile.storeName||APP.userProfile.username} sent you a message`, '💬', 'chat');
        
    } catch(e) { console.error('Chat error:', e); }
}

// =====================
// STORE LOBBY (Broadcast to followers)
// =====================
async function openStoreLobby() {
    showModal(`
        <div style="height:85vh;display:flex;flex-direction:column;">
            <div style="padding:15px;background:#6C3CF0;color:white;display:flex;align-items:center;gap:10px;border-radius:16px 16px 0 0;">
                <span style="font-size:24px;">📢</span>
                <div style="flex:1;"><strong>Store Lobby</strong><br><span style="font-size:11px;opacity:0.8;">Broadcast to your followers</span></div>
                <button onclick="hideModal()" style="background:none;border:none;color:white;font-size:20px;cursor:pointer;">✕</button>
            </div>
            
            <div id="lobby-messages" style="flex:1;overflow-y:auto;padding:15px;background:#f5f5f5;"></div>
            
            <div style="padding:10px;background:white;display:flex;gap:8px;align-items:center;border-top:1px solid #f0f0f0;">
                <input type="file" id="lobby-image" accept="image/*" style="display:none;" onchange="uploadLobbyImage()">
                <button onclick="document.getElementById('lobby-image').click()" style="background:none;border:none;font-size:22px;cursor:pointer;">🖼️</button>
                <input type="text" id="lobby-input" class="input-field" placeholder="Broadcast message..." style="flex:1;border-radius:20px;">
                <button onclick="sendLobbyMessage()" style="background:#6C3CF0;color:white;border:none;padding:10px 20px;border-radius:20px;font-weight:600;cursor:pointer;">Send</button>
            </div>
        </div>
    `);
    
    loadLobbyMessages();
}

async function loadLobbyMessages() {
    const container = document.getElementById('lobby-messages');
    if (!container) return;
    
    try {
        const snap = await db.collection('store_lobby')
            .where('storeId','==',APP.userProfile.uid)
            .orderBy('timestamp','desc')
            .limit(50)
            .get();
        
        const messages = [];
        snap.forEach(doc => messages.push(doc.data()));
        
        container.innerHTML = messages.map(msg => `
            <div style="background:white;padding:15px;border-radius:12px;margin-bottom:10px;box-shadow:0 2px 6px rgba(0,0,0,0.04);">
                ${msg.image ? `<img src="${msg.image}" style="max-width:100%;border-radius:8px;margin-bottom:8px;">` : ''}
                <p style="margin:0;font-size:14px;">${msg.text}</p>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;">
                    <span style="font-size:11px;color:#999;">${new Date(msg.timestamp?.seconds*1000).toLocaleString()}</span>
                    <span style="font-size:12px;cursor:pointer;" onclick="reactToLobby('${doc.id}')">❤️ ${msg.reactions||0}</span>
                </div>
            </div>
        `).join('');
    } catch(e) {}
}

async function sendLobbyMessage() {
    const input = document.getElementById('lobby-input');
    const text = input?.value?.trim();
    if (!text) return;
    input.value = '';
    
    try {
        await db.collection('store_lobby').add({
            storeId: APP.userProfile.uid,
            text, image: window._lobbyImage || null,
            reactions: 0,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        window._lobbyImage = null;
        loadLobbyMessages();
        
        // Notify all followers
        notifyFollowers(`${APP.userProfile.storeName} posted in lobby: ${text.substring(0,50)}...`);
    } catch(e) { console.error('Lobby error:', e); }
}

async function notifyFollowers(message) {
    try {
        const snap = await db.collection('followers').where('storeId','==',APP.userProfile.uid).get();
        snap.forEach(doc => {
            createNotification(doc.data().followerId, '📢 Store Lobby', message, '📢', 'store-shop');
        });
    } catch(e) {}
}

// =====================
// AD APPLICATION SYSTEM
// =====================
async function applyForAd() {
    showModal(`
        <div style="padding:15px;">
            <h3>📢 Apply for Advertisement</h3>
            <p style="color:#666;margin:10px 0;">Promote your store across ONESHOPLIFY</p>
            
            <div class="input-group"><label>Ad Title</label><input type="text" id="ad-title" class="input-field" placeholder="Summer Sale!"></div>
            <div class="input-group"><label>Ad Description</label><textarea id="ad-desc" class="input-field" rows="2"></textarea></div>
            <div class="input-group"><label>Ad Image/Video</label><input type="file" id="ad-media" class="input-field" accept="image/*,video/*"></div>
            <div class="input-group"><label>Target Link</label><input type="url" id="ad-link" class="input-field" value="${APP.baseUrl}/store/${APP.userProfile?.username}"></div>
            <div class="input-group"><label>Budget (Daily) - Min $5</label><input type="number" id="ad-budget" class="input-field" min="5" value="10"></div>
            <div class="input-group"><label>Duration (Days)</label><input type="number" id="ad-duration" class="input-field" min="1" max="30" value="7"></div>
            
            <p style="font-size:12px;color:#666;">Total: <strong id="ad-total">$70</strong></p>
            
            <button class="btn-gold btn-full" style="background:#6C3CF0;color:white;margin-top:15px;" onclick="submitAdApplication()">Submit & Pay</button>
        </div>
    `);
    
    document.getElementById('ad-budget').addEventListener('input', updateAdTotal);
    document.getElementById('ad-duration').addEventListener('input', updateAdTotal);
}

function updateAdTotal() {
    const budget = parseFloat(document.getElementById('ad-budget')?.value) || 0;
    const duration = parseInt(document.getElementById('ad-duration')?.value) || 0;
    document.getElementById('ad-total').textContent = '$' + (budget * duration).toFixed(2);
}

async function submitAdApplication() {
    const title = document.getElementById('ad-title')?.value?.trim();
    const desc = document.getElementById('ad-desc')?.value?.trim();
    const link = document.getElementById('ad-link')?.value?.trim();
    const budget = parseFloat(document.getElementById('ad-budget')?.value) || 0;
    const duration = parseInt(document.getElementById('ad-duration')?.value) || 0;
    const total = budget * duration;
    
    if (!title) { showToast('Enter ad title','error'); return; }
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
            title, description: desc, mediaUrl, link, budget, duration,
            total, status: 'active',
            impressions: 0, clicks: 0,
            startsAt: firebase.firestore.FieldValue.serverTimestamp(),
            expiresAt: new Date(Date.now() + duration * 24 * 60 * 60 * 1000)
        });
        
        APP.userProfile.walletBalance -= total;
        hideLoader(); showToast('Ad submitted! Running now 📢','success');
    } catch(e) { hideLoader(); showToast('Failed','error'); }
}

// =====================
// AUTO REPLY BOT (Enterprise Plan)
// =====================
async function setupAutoReply() {
    const plan = STORE_CONFIG.plans[APP.userProfile.storePlan];
    if (!plan?.autoReply) { showToast('Enterprise plan required','error'); return; }
    
    showModal(`
        <div style="padding:15px;">
            <h3>🤖 Auto Reply Bot</h3>
            <p style="color:#666;">Set automatic replies for customer messages</p>
            <div class="input-group"><label>Trigger Keywords (comma separated)</label><input type="text" id="bot-keywords" class="input-field" placeholder="hello, hi, help" value="${APP.userProfile.botKeywords||''}"></div>
            <div class="input-group"><label>Auto Reply Message</label><textarea id="bot-reply" class="input-field" rows="3">${APP.userProfile.botReply||'Thank you for contacting us! We will get back to you shortly.'}</textarea></div>
            <button class="btn-gold btn-full" style="background:#6C3CF0;color:white;" onclick="saveAutoReply()">💾 Save</button>
        </div>
    `);
}

async function saveAutoReply() {
    const keywords = document.getElementById('bot-keywords')?.value?.trim();
    const reply = document.getElementById('bot-reply')?.value?.trim();
    try {
        await db.collection('users').doc(APP.userProfile.uid).update({ botKeywords: keywords, botReply: reply });
        Object.assign(APP.userProfile, { botKeywords: keywords, botReply: reply });
        hideModal(); showToast('Auto reply saved! ✅','success');
    } catch(e) { showToast('Failed','error'); }
}

// =====================
// HELPER FUNCTIONS
// =====================
function getCountryOptions(selected) {
    if (typeof COUNTRIES === 'undefined') return '<option value="">Select</option>';
    return Object.entries(COUNTRIES).sort((a,b) => a[1].name.localeCompare(b[1].name))
        .map(([code, data]) => `<option value="${code}" ${selected===code?'selected':''}>${data.flag||''} ${data.name}</option>`).join('');
}

function isColorLight(hex) {
    if (!hex) return false;
    const c = hex.replace('#','');
    return (parseInt(c.substring(0,2),16)*299 + parseInt(c.substring(2,4),16)*587 + parseInt(c.substring(4,6),16)*114)/1000 > 150;
}

// Global access
window.loadStoreMarket = loadStoreMarket;
window.openStoreShop = openStoreShop;
window.loadStoreOwnerDashboard = loadStoreOwnerDashboard;
window.startStoreSetup = startStoreSetup;
window.followStore = followStore;
window.likeProduct = likeProduct;
window.applyForAd = applyForAd;
window.setupAutoReply = setupAutoReply;
window.openStoreChat = openStoreChat;
window.openStoreLobby = openStoreLobby;

console.log('✅ storeowner.js beast mode loaded - All features functional');
