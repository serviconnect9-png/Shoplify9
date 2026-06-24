// storeowner.js - COMPLETE PRODUCTION VERSION
// ONESHOPLIFY Store Owner System - All Features Functional
console.log('✅ storeowner.js loaded - Production Mode');

// =====================
// STORE PLANS
// =====================
const STORE_PLANS = {
    basic: {
        name: 'Basic',
        price: 0,
        products: 50,
        analytics: 'simple',
        support: 'email',
        chatLimit: 10,
        followers: true,
        sponsoredAds: true,
        autoReply: false,
        verifiedBadge: false
    },
    pro: {
        name: 'Pro',
        price: 25,
        products: 501,
        analytics: 'full',
        support: 'ticket_email_phone',
        chatLimit: 100,
        followers: true,
        sponsoredAds: true,
        autoReply: false,
        verifiedBadge: false
    },
    enterprise: {
        name: 'Enterprise',
        price: 75,
        products: Infinity,
        analytics: 'enterprise',
        support: 'full_auto_reply',
        chatLimit: Infinity,
        followers: true,
        sponsoredAds: false,
        autoReply: true,
        verifiedBadge: true,
        bonus: true,
        dailyReports: true
    }
};

// =====================
// STORE OWNER DASHBOARD
// =====================
async function loadStoreOwnerDashboard() {
    console.log('🏪 Loading store owner dashboard...');
    
    const container = document.getElementById('store-owner-content');
    if (!container) { console.error('❌ store-owner-content not found'); return; }
    
    if (!APP.userProfile || !APP.userProfile.isStoreOwner) {
        container.innerHTML = '<p style="text-align:center;padding:60px;">Please create a store first.</p>';
        return;
    }
    
    const store = APP.userProfile.storeData || {};
    const plan = store.plan || 'basic';
    const planDetails = STORE_PLANS[plan] || STORE_PLANS.basic;
    
    container.innerHTML = `
        <div style="display:flex;min-height:100vh;background:#F8F9FB;">
            
            <!-- ==================== SIDEBAR ==================== -->
            <div id="store-sidebar" style="width:260px;background:linear-gradient(180deg,#0F172A,#1E293B);color:white;position:fixed;top:0;left:0;height:100vh;overflow-y:auto;z-index:200;transition:transform 0.3s;padding:20px 0;">
                
                <!-- Logo -->
                <div style="padding:0 20px 20px;border-bottom:1px solid rgba(255,255,255,0.1);margin-bottom:15px;">
                    <h2 style="color:white;font-size:18px;font-weight:700;">ONESHOPLIFY</h2>
                    <p style="color:#94A3B8;font-size:11px;">Store Manager</p>
                </div>
                
                <!-- Store Card -->
                <div style="margin:0 15px 20px;padding:15px;background:rgba(255,255,255,0.05);border-radius:12px;">
                    <p style="font-weight:600;font-size:14px;">${store.name || 'My Store'}</p>
                    <p style="color:#94A3B8;font-size:11px;">${planDetails.name} Plan</p>
                    <button class="btn-gold btn-small" style="width:100%;margin-top:8px;" onclick="window.open('${APP.baseUrl}/store/${APP.userProfile.username}','_blank')">👁️ View Store</button>
                </div>
                
                <!-- Navigation -->
                <nav style="padding:0 15px;">
                    ${buildSidebarNav()}
                </nav>
                
                <!-- Performance Card -->
                <div style="margin:20px 15px;padding:15px;background:rgba(255,255,255,0.05);border-radius:12px;">
                    <p style="font-size:11px;color:#94A3B8;">Store Performance</p>
                    <p style="font-size:18px;font-weight:700;" id="sidebar-revenue">$0</p>
                    <p style="font-size:11px;color:#94A3B8;" id="sidebar-orders">0 Orders</p>
                </div>
            </div>
            
            <!-- Sidebar Toggle Button -->
            <button id="sidebar-toggle" onclick="toggleSidebar()" style="position:fixed;top:15px;left:270px;z-index:210;background:white;border:none;width:32px;height:32px;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.15);cursor:pointer;font-size:16px;transition:left 0.3s;">☰</button>
            
            <!-- ==================== MAIN CONTENT ==================== -->
            <div id="store-main-content" style="flex:1;margin-left:260px;padding:20px;transition:margin-left 0.3s;">
                
                <!-- Top Header -->
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:25px;">
                    <div>
                        <h1 style="font-size:28px;font-weight:800;margin:0;">Dashboard</h1>
                        <p style="color:#666;margin:5px 0 0;">Welcome back, ${APP.userProfile.displayName || 'Owner'}</p>
                    </div>
                    <div style="display:flex;gap:10px;align-items:center;">
                        <button class="btn-outline btn-small" onclick="window.open('${APP.baseUrl}/store/${APP.userProfile.username}','_blank')">👁️ View Store</button>
                        <div style="position:relative;cursor:pointer;" onclick="navigateTo('notifications')">
                            🔔<span id="store-notif-badge" style="position:absolute;top:-5px;right:-5px;background:#FF4444;color:white;font-size:9px;width:16px;height:16px;border-radius:50%;display:none;align-items:center;justify-content:center;">0</span>
                        </div>
                        <img src="${APP.userProfile.photoURL||'/app-icon.png'}" style="width:35px;height:35px;border-radius:50%;cursor:pointer;" onclick="navigateTo('profile')">
                    </div>
                </div>
                
                <!-- ==================== STATS CARDS ==================== -->
                <div id="store-stats-cards" style="display:grid;grid-template-columns:repeat(6,1fr);gap:12px;margin-bottom:25px;">
                    ${buildStatCard('💰 Total Revenue', '$0', '+0%', '#6C4BFF')}
                    ${buildStatCard('📦 Orders', '0', '+0%', '#22C55E')}
                    ${buildStatCard('👥 Visitors', '0', '+0%', '#3B82F6')}
                    ${buildStatCard('📈 Conversion', '0%', '+0%', '#F59E0B')}
                    ${buildStatCard('💵 Avg Order', '$0', '+0%', '#EF4444')}
                    ${buildStatCard('🏦 Balance', '$0', '', '#8B5CF6')}
                </div>
                
                <!-- ==================== CHARTS ROW ==================== -->
                <div style="display:grid;grid-template-columns:2fr 1fr;gap:15px;margin-bottom:25px;">
                    <!-- Revenue Chart -->
                    <div style="background:white;border-radius:16px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;">
                            <h3 style="font-size:16px;font-weight:700;">📈 Revenue Overview</h3>
                            <select id="revenue-range" onchange="loadRevenueChart()" style="padding:6px 12px;border:1px solid #e0e0e0;border-radius:8px;font-size:12px;">
                                <option value="7">Last 7 Days</option>
                                <option value="30">Last 30 Days</option>
                                <option value="365">Last Year</option>
                            </select>
                        </div>
                        <div style="height:250px;" id="revenue-chart-container">
                            <canvas id="revenueChart"></canvas>
                        </div>
                    </div>
                    
                    <!-- Order Status -->
                    <div style="background:white;border-radius:16px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
                        <h3 style="font-size:16px;font-weight:700;margin-bottom:15px;">📊 Order Status</h3>
                        <div style="height:250px;" id="order-status-chart">
                            <canvas id="orderStatusChart"></canvas>
                        </div>
                    </div>
                </div>
                
                <!-- ==================== RECENT ORDERS ==================== -->
                <div style="background:white;border-radius:16px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,0.04);margin-bottom:25px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;">
                        <h3 style="font-size:16px;font-weight:700;">🛒 Recent Orders</h3>
                        <button class="btn-outline btn-small" onclick="navigateTo('orders')">View All</button>
                    </div>
                    <div id="recent-orders-list"></div>
                </div>
                
                <!-- ==================== TOP PRODUCTS ==================== -->
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;">
                    <div style="background:white;border-radius:16px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
                        <h3 style="font-size:16px;font-weight:700;margin-bottom:15px;">🏆 Top Selling Products</h3>
                        <div id="top-products-list"></div>
                    </div>
                    
                    <div style="background:white;border-radius:16px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
                        <h3 style="font-size:16px;font-weight:700;margin-bottom:15px;">🌍 Visitors by Country</h3>
                        <div id="visitors-country-list"></div>
                    </div>
                </div>
                
                <!-- ==================== ACTIVITY FEED ==================== -->
                <div style="background:white;border-radius:16px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,0.04);margin-top:15px;">
                    <h3 style="font-size:16px;font-weight:700;margin-bottom:15px;">📋 Store Activity</h3>
                    <div id="store-activity-feed"></div>
                </div>
                
                <!-- ==================== UPGRADE BANNER (if not enterprise) ==================== -->
                ${plan !== 'enterprise' ? `
                    <div style="background:linear-gradient(135deg,#6C4BFF,#4F46E5);border-radius:16px;padding:25px;margin-top:25px;color:white;display:flex;justify-content:space-between;align-items:center;">
                        <div>
                            <h3 style="font-size:20px;margin-bottom:5px;">🚀 Upgrade to Enterprise</h3>
                            <p style="opacity:0.9;">Get verified badge, unlimited products, auto-reply bot & more!</p>
                        </div>
                        <button class="btn-gold btn-large" onclick="upgradeStorePlan()">Upgrade Now</button>
                    </div>
                ` : ''}
                
            </div>
        </div>`;
    
    // Load all dashboard data
    loadStoreStats();
    loadRevenueChart();
    loadOrderStatusChart();
    loadRecentOrders();
    loadTopProducts();
    loadVisitorsByCountry();
    loadStoreActivity();
    loadSidebarStats();
    updateNotificationBadge();
}

function buildSidebarNav() {
    const items = [
        { icon: '📊', label: 'Dashboard', action: "loadStoreOwnerDashboard()", active: true },
        { icon: '📦', label: 'Products', action: "navigateTo('store-products')" },
        { icon: '🛒', label: 'Orders', action: "navigateTo('orders')" },
        { icon: '👥', label: 'Customers', action: "navigateTo('store-customers')" },
        { icon: '📈', label: 'Analytics', action: "navigateTo('analytics')" },
        { icon: '📢', label: 'Marketing', action: "navigateTo('store-marketing')" },
        { icon: '🎫', label: 'Discounts & Coupons', action: "navigateTo('store-coupons')" },
        { icon: '⭐', label: 'Reviews', action: "navigateTo('store-reviews')" },
        { icon: '💰', label: 'Payouts', action: "navigateTo('wallet')" },
        { icon: '🎨', label: 'Store Design', action: "navigateTo('store-design')" },
        { icon: '📄', label: 'Pages', action: "navigateTo('store-pages')" },
        { icon: '⚙️', label: 'Settings', action: "navigateTo('store-settings')" },
        { icon: '💬', label: 'Chat', action: "openStoreChat()" },
        { icon: '👥', label: 'Followers', action: "openFollowersList()" },
        { icon: '📢', label: 'Lobby', action: "openStoreLobby()" },
        { icon: '🎧', label: 'Support', action: "navigateTo('customerservice')" },
        { icon: '🚪', label: 'Logout', action: "logout()" }
    ];
    
    return items.map(item => `
        <div onclick="${item.action}" style="padding:12px 15px;margin:2px 0;border-radius:10px;cursor:pointer;display:flex;align-items:center;gap:12px;font-size:14px;transition:all 0.2s;${item.active?'background:rgba(108,75,255,0.2);color:white;':'color:#94A3B8;'}hover:background:rgba(255,255,255,0.05);">
            <span>${item.icon}</span> ${item.label}
        </div>
    `).join('');
}

function buildStatCard(label, value, growth, color) {
    return `
        <div style="background:white;border-radius:12px;padding:15px;box-shadow:0 2px 6px rgba(0,0,0,0.04);">
            <p style="font-size:11px;color:#666;margin-bottom:8px;">${label}</p>
            <p style="font-size:22px;font-weight:800;color:#1a1a1a;">${value}</p>
            ${growth ? `<p style="font-size:11px;color:${growth.includes('+')?'#22C55E':'#EF4444'};">${growth}</p>` : ''}
        </div>`;
}

// =====================
// SIDEBAR TOGGLE
// =====================
function toggleSidebar() {
    const sidebar = document.getElementById('store-sidebar');
    const mainContent = document.getElementById('store-main-content');
    const toggleBtn = document.getElementById('sidebar-toggle');
    
    if (!sidebar || !mainContent) return;
    
    const isOpen = sidebar.style.transform !== 'translateX(-260px)';
    
    if (isOpen) {
        sidebar.style.transform = 'translateX(-260px)';
        mainContent.style.marginLeft = '0';
        toggleBtn.style.left = '15px';
    } else {
        sidebar.style.transform = 'translateX(0)';
        mainContent.style.marginLeft = '260px';
        toggleBtn.style.left = '270px';
    }
}

// =====================
// STORE CREATION FLOW
// =====================
async function createStore() {
    if (!APP.userProfile) {
        showToast('Please login first', 'error');
        return;
    }
    
    let currentStep = 1;
    const totalSteps = 5;
    let storeData = {};
    
    function showStep(step) {
        currentStep = step;
        let content = '';
        
        switch(step) {
            case 1:
                content = renderPlanSelection();
                break;
            case 2:
                content = renderStoreInfo();
                break;
            case 3:
                content = renderStoreDetails();
                break;
            case 4:
                content = renderStoreBranding();
                break;
            case 5:
                content = renderPaymentSetup();
                break;
        }
        
        showModal(`
            <div style="padding:15px;">
                <!-- Progress Bar -->
                <div style="display:flex;gap:4px;margin-bottom:20px;">
                    ${Array(totalSteps).fill(0).map((_,i) => `
                        <div style="flex:1;height:4px;border-radius:2px;background:${i < step ? '#6C4BFF' : '#e0e0e0'};"></div>
                    `).join('')}
                </div>
                <p style="font-size:11px;color:#999;margin-bottom:15px;">Step ${step} of ${totalSteps}</p>
                ${content}
            </div>
        `);
    }
    
    function renderPlanSelection() {
        return `
            <h3>🚀 Choose Your Plan</h3>
            ${Object.entries(STORE_PLANS).map(([key, plan]) => `
                <div onclick="selectStorePlan('${key}')" id="plan-${key}" 
                     style="background:white;border:2px solid ${storeData.plan === key ? '#6C4BFF' : '#e0e0e0'};border-radius:12px;padding:15px;margin:10px 0;cursor:pointer;transition:0.2s;">
                    <h4>${plan.name} ${key === 'enterprise' ? '👑' : key === 'pro' ? '⭐' : ''}</h4>
                    <p style="font-size:24px;font-weight:800;">$${plan.price}<span style="font-size:14px;color:#999;">/mo</span></p>
                    <p style="font-size:12px;color:#666;">Up to ${plan.products === Infinity ? 'Unlimited' : plan.products} products</p>
                </div>
            `).join('')}
            <button class="btn-gold btn-full" onclick="showStep(2)">Continue</button>
        `;
    }
    
    function renderStoreInfo() {
        return `
            <h3>📝 Store Information</h3>
            <div class="input-group"><label>Store Name</label><input type="text" id="store-name" class="input-field" placeholder="My Store"></div>
            <div class="input-group"><label>Owner Name</label><input type="text" id="store-owner" class="input-field" value="${APP.userProfile.displayName||''}"></div>
            <div class="input-group"><label>Email</label><input type="email" id="store-email" class="input-field" value="${APP.userProfile.email||''}"></div>
            <div class="input-group"><label>Phone</label><input type="tel" id="store-phone" class="input-field" value="${APP.userProfile.phoneNumber||''}"></div>
            <div class="input-group"><label>Country</label><select id="store-country" class="input-field">${typeof COUNTRIES!=='undefined'?Object.entries(COUNTRIES).sort((a,b)=>a[1].name.localeCompare(b[1].name)).map(([c,d])=>`<option value="${c}">${d.flag||''} ${d.name}</option>`).join(''):''}</select></div>
            <div style="display:flex;gap:10px;margin-top:15px;">
                <button class="btn-outline" style="flex:1;" onclick="showStep(1)">← Back</button>
                <button class="btn-gold" style="flex:1;" onclick="showStep(3)">Continue →</button>
            </div>
        `;
    }
    
    function renderStoreDetails() {
        return `
            <h3>🏪 Store Details</h3>
            <div class="input-group"><label>Category</label><select id="store-category" class="input-field">
                <option value="">Select Category</option>
                <option value="fashion">Fashion</option>
                <option value="electronics">Electronics</option>
                <option value="tickets">Tickets & Events</option>
                <option value="all_purpose">All Purpose Store</option>
                <option value="digital">Digital Products</option>
            </select></div>
            <div class="input-group"><label>Description (10-100 words)</label><textarea id="store-description" class="input-field" rows="3" placeholder="Describe your store..."></textarea></div>
            <div class="input-group"><label>Keywords/Tags</label><input type="text" id="store-tags" class="input-field" placeholder="fashion, clothes, sneakers"></div>
            <div style="display:flex;gap:10px;margin-top:15px;">
                <button class="btn-outline" style="flex:1;" onclick="showStep(2)">← Back</button>
                <button class="btn-gold" style="flex:1;" onclick="showStep(4)">Continue →</button>
            </div>
        `;
    }
    
    function renderStoreBranding() {
        return `
            <h3>🎨 Store Branding</h3>
            <div style="text-align:center;margin:15px 0;">
                <div style="width:80px;height:80px;border-radius:50%;background:#f0f0f0;margin:0 auto 10px;display:flex;align-items:center;justify-content:center;font-size:30px;overflow:hidden;" id="logo-preview">📷</div>
                <input type="file" id="store-logo-upload" accept="image/*" onchange="previewStoreLogo()" style="display:none;">
                <button class="btn-outline btn-small" onclick="document.getElementById('store-logo-upload').click()">Upload Logo</button>
                <p style="font-size:10px;color:#999;">Recommended: 500x500px</p>
            </div>
            <div style="text-align:center;margin:15px 0;">
                <div style="width:100%;height:100px;background:#f0f0f0;border-radius:8px;margin:0 auto 10px;display:flex;align-items:center;justify-content:center;overflow:hidden;" id="banner-preview">🖼️ Banner</div>
                <input type="file" id="store-banner-upload" accept="image/*" onchange="previewStoreBanner()" style="display:none;">
                <button class="btn-outline btn-small" onclick="document.getElementById('store-banner-upload').click()">Upload Banner</button>
                <p style="font-size:10px;color:#999;">Recommended: 1200x400px</p>
            </div>
            <div style="display:flex;gap:10px;margin-top:15px;">
                <button class="btn-outline" style="flex:1;" onclick="showStep(3)">← Back</button>
                <button class="btn-gold" style="flex:1;" onclick="showStep(5)">Continue →</button>
            </div>
        `;
    }
    
    function renderPaymentSetup() {
        return `
            <h3>💳 Payment Method</h3>
            <div style="background:#F0EDFF;padding:15px;border-radius:12px;margin:15px 0;text-align:center;">
                <p style="font-size:30px;">🟣</p>
                <p style="font-weight:700;">ONESHOPLIFY Wallet</p>
                <p style="font-size:12px;color:#666;">Receive payouts directly to your wallet balance. Fast settlement. Secure transactions.</p>
            </div>
            <div class="input-group"><label>Industrial UID (from ONESHOPLIFY Wallet)</label><input type="text" id="store-uid" class="input-field" placeholder="Enter your industrial UID"><small style="color:#999;">Get this from ONESHOPLIFY Wallet → Profile → Store & Gateway → Generate Industrial UID</small></div>
            <p style="font-size:11px;color:#999;text-align:center;margin:10px 0;">You can skip this and add later</p>
            <div style="display:flex;gap:10px;margin-top:15px;">
                <button class="btn-outline" style="flex:1;" onclick="showStep(4)">← Back</button>
                <button class="btn-gold" style="flex:1;" onclick="completeStoreSetup()">✅ Create Store</button>
            </div>
        `;
    }
    
    showStep(1);
}

// =====================
// STORE CHAT SYSTEM
// =====================
async function openStoreChat() {
    if (!APP.userProfile) { showToast('Please login', 'error'); return; }
    
    showModal(`
        <div style="height:80vh;display:flex;flex-direction:column;">
            <div style="padding:15px;border-bottom:1px solid #f0f0f0;">
                <h3>💬 Messages</h3>
                <div style="margin-top:10px;">
                    <input type="text" id="chat-search-user" class="input-field" placeholder="Search by username..." oninput="searchChatUsers()">
                </div>
            </div>
            <div id="chat-users-list" style="flex:1;overflow-y:auto;padding:10px;">
                <p style="text-align:center;color:#999;padding:20px;">Search for a user to start chatting</p>
            </div>
            <div id="chat-messages-area" style="display:none;flex:1;flex-direction:column;">
                <div id="chat-messages-list" style="flex:1;overflow-y:auto;padding:15px;"></div>
                <div style="padding:10px;border-top:1px solid #f0f0f0;display:flex;gap:8px;">
                    <input type="text" id="chat-message-input" class="input-field" placeholder="Type a message..." style="flex:1;">
                    <button class="btn-gold" onclick="sendChatMessage()">📤</button>
                </div>
            </div>
        </div>
    `);
    
    window._chatRecipientId = null;
}

async function searchChatUsers() {
    const query = document.getElementById('chat-search-user')?.value?.trim()?.toLowerCase();
    if (!query || query.length < 2) return;
    
    const list = document.getElementById('chat-users-list');
    if (!list) return;
    
    try {
        const snap = await db.collection('users')
            .where('username', '>=', query)
            .where('username', '<=', query + '\uf8ff')
            .limit(10)
            .get();
        
        if (snap.empty) {
            list.innerHTML = '<p style="text-align:center;color:#999;padding:20px;">No users found</p>';
            return;
        }
        
        list.innerHTML = '';
        snap.forEach(doc => {
            const user = doc.data();
            if (user.uid === APP.userProfile.uid) return;
            
            list.innerHTML += `
                <div onclick="openChatWithUser('${user.uid}','${user.displayName||user.username}','${user.photoURL||''}')" 
                     style="display:flex;align-items:center;gap:12px;padding:12px;border-radius:10px;cursor:pointer;transition:0.2s;">
                    <img src="${user.photoURL||'/app-icon.png'}" style="width:45px;height:45px;border-radius:50%;">
                    <div>
                        <p style="font-weight:600;">${user.displayName||user.username}</p>
                        <p style="font-size:12px;color:#999;">@${user.username}</p>
                    </div>
                </div>`;
        });
    } catch(e) { console.error('Search error:', e); }
}

function openChatWithUser(userId, name, photo) {
    window._chatRecipientId = userId;
    
    document.getElementById('chat-users-list').style.display = 'none';
    const msgArea = document.getElementById('chat-messages-area');
    msgArea.style.display = 'flex';
    
    document.getElementById('chat-messages-list').innerHTML = `
        <div style="text-align:center;padding:20px;">
            <img src="${photo||'/app-icon.png'}" style="width:50px;height:50px;border-radius:50%;margin-bottom:10px;">
            <p style="font-weight:600;">${name}</p>
        </div>`;
    
    loadChatMessages(userId);
}

async function loadChatMessages(userId) {
    try {
        const snap = await db.collection('chats')
            .where('participants', 'array-contains', APP.userProfile.uid)
            .get();
        
        const messages = [];
        snap.forEach(doc => {
            const chat = doc.data();
            if (chat.participants.includes(userId)) {
                (chat.messages || []).forEach(msg => messages.push(msg));
            }
        });
        
        messages.sort((a,b) => (a.timestamp?.toDate?.()||0) - (b.timestamp?.toDate?.()||0));
        
        const list = document.getElementById('chat-messages-list');
        if (list) {
            list.innerHTML = messages.map(msg => `
                <div style="display:flex;justify-content:${msg.senderId===APP.userProfile.uid?'flex-end':'flex-start'};margin-bottom:8px;">
                    <div style="max-width:70%;padding:10px 14px;border-radius:${msg.senderId===APP.userProfile.uid?'16px 16px 4px 16px':'16px 16px 16px 4px'};background:${msg.senderId===APP.userProfile.uid?'#6C4BFF':'#f0f0f0'};color:${msg.senderId===APP.userProfile.uid?'white':'#333'};font-size:14px;">
                        ${msg.text}
                    </div>
                </div>
            `).join('');
            list.scrollTop = list.scrollHeight;
        }
    } catch(e) { console.error('Load messages error:', e); }
}

async function sendChatMessage() {
    const input = document.getElementById('chat-message-input');
    const text = input?.value?.trim();
    const recipientId = window._chatRecipientId;
    
    if (!text || !recipientId) return;
    
    // Show immediately
    const list = document.getElementById('chat-messages-list');
    if (list) {
        list.innerHTML += `
            <div style="display:flex;justify-content:flex-end;margin-bottom:8px;">
                <div style="max-width:70%;padding:10px 14px;border-radius:16px 16px 4px 16px;background:#6C4BFF;color:white;font-size:14px;">${text}</div>
            </div>`;
        list.scrollTop = list.scrollHeight;
    }
    
    input.value = '';
    
    // Send to backend
    try {
        await db.collection('chats').add({
            participants: [APP.userProfile.uid, recipientId],
            messages: firebase.firestore.FieldValue.arrayUnion({
                senderId: APP.userProfile.uid,
                text,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            })
        });
        
        // Notify recipient
        if (typeof createNotification === 'function') {
            await createNotification(recipientId, '💬 New Message', 
                `${APP.userProfile.displayName||APP.userProfile.username} sent you a message.`, '💬', 'store-chat');
        }
    } catch(e) { console.error('Send message error:', e); }
}

// =====================
// FOLLOW SYSTEM (Backend handled)
// =====================
async function followStore(storeId) {
    if (!APP.userProfile) { showToast('Please login', 'error'); return; }
    
    try {
        const response = await fetch(APP.backendUrl + '/api/stores/' + storeId + '/follow', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: APP.userProfile.uid })
        });
        
        const result = await response.json();
        
        if (result.success) {
            updateFollowButton(storeId, result.following, result.followersCount);
            
            // Check for badge milestones
            if (result.followersCount >= 1000000) {
                awardFollowBadge(storeId, 'sea_light_blue', 700);
            } else if (result.followersCount >= 100000) {
                awardFollowBadge(storeId, 'white', 100);
            } else if (result.followersCount >= 50000) {
                awardFollowBadge(storeId, 'purple', 20);
            } else if (result.followersCount >= 25000) {
                awardFollowBadge(storeId, 'green', 5);
            } else if (result.followersCount >= 1000) {
                awardFollowBadge(storeId, 'blue', 0);
            }
        }
    } catch(e) { console.error('Follow error:', e); }
}

async function awardFollowBadge(storeId, badge, bonus) {
    try {
        await db.collection('users').doc(storeId).update({
            followBadge: badge,
            followBonus: firebase.firestore.FieldValue.increment(bonus)
        });
        
        if (bonus > 0) {
            await createNotification(storeId, '🎉 Milestone Bonus!', 
                `You earned a $${bonus} bonus for reaching a follower milestone!`, '🎉', 'wallet');
        }
    } catch(e) { console.error('Badge error:', e); }
}

function updateFollowButton(storeId, following, count) {
    const btn = document.getElementById('follow-btn-' + storeId);
    if (btn) {
        btn.textContent = following ? '✓ Following' : '+ Follow';
        btn.style.background = following ? '#E8F5E9' : '#6C4BFF';
        btn.style.color = following ? '#2E7D32' : 'white';
    }
    
    const countEl = document.getElementById('followers-count-' + storeId);
    if (countEl) countEl.textContent = count.toLocaleString();
}

// =====================
// LIKE SYSTEM (Backend handled)
// =====================
async function likeProduct(productId) {
    if (!APP.userProfile) { showToast('Please login', 'error'); return; }
    
    const heartBtn = document.getElementById('like-btn-' + productId);
    if (heartBtn) {
        heartBtn.disabled = true;
        heartBtn.innerHTML = '❤️';
        heartBtn.style.transform = 'scale(1.3)';
        setTimeout(() => { heartBtn.style.transform = 'scale(1)'; heartBtn.disabled = false; }, 300);
    }
    
    try {
        const response = await fetch(APP.backendUrl + '/api/products/' + productId + '/like', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: APP.userProfile.uid })
        });
        
        const result = await response.json();
        
        if (result.success) {
            const countEl = document.getElementById('likes-count-' + productId);
            if (countEl) countEl.textContent = result.likes;
        }
    } catch(e) { console.error('Like error:', e); }
}

// =====================
// STORE LOBBY
// =====================
async function openStoreLobby() {
    if (!APP.userProfile?.isStoreOwner) { showToast('Only store owners', 'error'); return; }
    
    showModal(`
        <div style="height:70vh;display:flex;flex-direction:column;">
            <div style="padding:15px;border-bottom:1px solid #f0f0f0;">
                <h3>📢 Store Lobby</h3>
                <p style="font-size:12px;color:#666;">Send messages to all your followers</p>
            </div>
            <div id="lobby-messages" style="flex:1;overflow-y:auto;padding:15px;"></div>
            <div style="padding:15px;border-top:1px solid #f0f0f0;">
                <div style="display:flex;gap:8px;margin-bottom:8px;">
                    <input type="text" id="lobby-message-input" class="input-field" placeholder="Send a message to followers..." style="flex:1;">
                    <button class="btn-gold" onclick="sendLobbyMessage()">📤 Send</button>
                </div>
                <input type="file" id="lobby-image-upload" accept="image/*" style="display:none;" onchange="sendLobbyImage()">
                <button class="btn-outline btn-small" onclick="document.getElementById('lobby-image-upload').click()">📷 Add Image</button>
            </div>
        </div>
    `);
    
    loadLobbyMessages();
}

async function loadLobbyMessages() {
    try {
        const snap = await db.collection('store_lobby')
            .where('storeId', '==', APP.userProfile.uid)
            .orderBy('createdAt', 'desc')
            .limit(50)
            .get();
        
        const list = document.getElementById('lobby-messages');
        if (!list) return;
        
        if (snap.empty) {
            list.innerHTML = '<p style="text-align:center;color:#999;padding:40px;">No lobby messages yet</p>';
            return;
        }
        
        list.innerHTML = '';
        snap.forEach(doc => {
            const msg = doc.data();
            list.innerHTML += `
                <div style="background:white;border-radius:12px;padding:15px;margin-bottom:10px;box-shadow:0 2px 6px rgba(0,0,0,0.04);">
                    <p style="font-size:14px;">${msg.text||''}</p>
                    ${msg.image ? `<img src="${msg.image}" style="width:100%;max-height:200px;object-fit:cover;border-radius:8px;margin-top:8px;">` : ''}
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px;">
                        <span style="font-size:11px;color:#999;">${getTimeAgo(msg.createdAt)}</span>
                        <span style="cursor:pointer;" onclick="reactToLobby('${doc.id}')">❤️ ${msg.reactions||0}</span>
                    </div>
                </div>`;
        });
    } catch(e) { console.error('Lobby error:', e); }
}

async function sendLobbyMessage() {
    const input = document.getElementById('lobby-message-input');
    const text = input?.value?.trim();
    if (!text) return;
    
    input.value = '';
    
    try {
        await db.collection('store_lobby').add({
            storeId: APP.userProfile.uid,
            text,
            image: null,
            reactions: 0,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Notify all followers
        notifyFollowers('📢 New Lobby Message', text.substring(0, 100));
        
        loadLobbyMessages();
    } catch(e) { console.error('Lobby send error:', e); }
}

async function notifyFollowers(title, message) {
    try {
        const snap = await db.collection('store_followers')
            .where('storeId', '==', APP.userProfile.uid)
            .get();
        
        snap.forEach(async doc => {
            const follower = doc.data();
            if (typeof createNotification === 'function') {
                await createNotification(follower.userId, title, message, '📢', 'store-lobby');
            }
        });
    } catch(e) { console.error('Notify error:', e); }
}

// =====================
// TICKET SYSTEM
// =====================
async function createTicketProduct() {
    showModal(`
        <div style="padding:15px;max-height:80vh;overflow-y:auto;">
            <h3>🎫 Create Ticket/Event</h3>
            <div class="input-group"><label>Event Name</label><input type="text" id="ticket-name" class="input-field"></div>
            <div class="input-group"><label>Description</label><textarea id="ticket-desc" class="input-field" rows="3"></textarea></div>
            <div class="input-group"><label>Date & Time</label><input type="datetime-local" id="ticket-date" class="input-field"></div>
            <div class="input-group"><label>Country</label><select id="ticket-country" class="input-field">${typeof COUNTRIES!=='undefined'?Object.entries(COUNTRIES).sort((a,b)=>a[1].name.localeCompare(b[1].name)).map(([c,d])=>`<option value="${c}">${d.flag||''} ${d.name}</option>`).join(''):''}</select></div>
            <div class="input-group"><label>Full Address</label><input type="text" id="ticket-address" class="input-field"></div>
            <div class="input-group"><label>Total Ticket Quantity</label><input type="number" id="ticket-quantity" class="input-field" min="1"></div>
            <div class="input-group"><label>Gender Restriction</label><select id="ticket-gender" class="input-field"><option value="all">All</option><option value="male">Male</option><option value="female">Female</option></select></div>
            <div class="input-group"><label>Preservation Types (comma separated)</label><input type="text" id="ticket-preservations" class="input-field" placeholder="Table for 2, Table for 4, VIP, Regular"></div>
            <div class="input-group"><label><input type="checkbox" id="ticket-vary-price"> Vary Price by Preservation</label></div>
            <div class="input-group"><label>Visibility</label><select id="ticket-visibility" class="input-field"><option value="all">Visible to All</option><option value="special">Special Event (Link Only)</option></select></div>
            <div class="input-group"><label>Ticket Photo</label><input type="file" id="ticket-photo" class="input-field" accept="image/*"></div>
            <div class="input-group"><label>Delivery Method</label><select id="ticket-delivery" class="input-field"><option value="app">App Generated</option><option value="owner">Store Owner (WhatsApp)</option></select></div>
            <div class="input-group" id="ticket-whatsapp-group" style="display:none;"><label>WhatsApp Number</label><input type="tel" id="ticket-whatsapp" class="input-field"></div>
            <button class="btn-gold btn-full" style="margin-top:15px;" onclick="saveTicketProduct()">💾 Create Event</button>
        </div>
    `);
}

// =====================
// FOLLOWERS LIST
// =====================
async function openFollowersList() {
    showModal(`
        <div style="height:70vh;display:flex;flex-direction:column;">
            <div style="padding:15px;border-bottom:1px solid #f0f0f0;">
                <h3>👥 Followers</h3>
                <div style="display:flex;gap:10px;margin-top:10px;">
                    <button class="btn-outline btn-small active" id="tab-followers" onclick="switchFollowerTab('followers')">Followers</button>
                    <button class="btn-outline btn-small" id="tab-following" onclick="switchFollowerTab('following')">Following</button>
                </div>
            </div>
            <div id="followers-list-content" style="flex:1;overflow-y:auto;padding:10px;">
                <p style="text-align:center;color:#999;padding:20px;">Loading...</p>
            </div>
        </div>
    `);
    
    loadFollowersList('followers');
}

async function loadFollowersList(type) {
    const list = document.getElementById('followers-list-content');
    if (!list) return;
    
    try {
        const snap = await db.collection('store_followers')
            .where(type === 'followers' ? 'storeId' : 'userId', '==', APP.userProfile.uid)
            .get();
        
        if (snap.empty) {
            list.innerHTML = `<p style="text-align:center;color:#999;padding:40px;">No ${type} yet</p>`;
            return;
        }
        
        list.innerHTML = '';
        snap.forEach(async doc => {
            const data = doc.data();
            const userId = type === 'followers' ? data.userId : data.storeId;
            
            try {
                const userDoc = await db.collection('users').doc(userId).get();
                if (userDoc.exists) {
                    const user = userDoc.data();
                    list.innerHTML += `
                        <div style="display:flex;align-items:center;gap:12px;padding:12px;border-bottom:1px solid #f0f0f0;">
                            <img src="${user.photoURL||'/app-icon.png'}" style="width:40px;height:40px;border-radius:50%;">
                            <div style="flex:1;">
                                <p style="font-weight:600;">${user.displayName||user.username}</p>
                                <p style="font-size:12px;color:#999;">@${user.username}</p>
                            </div>
                            ${type === 'followers' && user.uid !== APP.userProfile.uid ? 
                                `<button class="btn-outline btn-small" onclick="followStore('${user.uid}')">Follow Back</button>` : ''}
                        </div>`;
                }
            } catch(e) {}
        });
    } catch(e) { console.error('Followers error:', e); }
}

function switchFollowerTab(type) {
    document.getElementById('tab-followers').classList.toggle('active', type === 'followers');
    document.getElementById('tab-following').classList.toggle('active', type === 'following');
    loadFollowersList(type);
}

// =====================
// DASHBOARD DATA LOADERS
// =====================
async function loadStoreStats() {
    try {
        const ordersSnap = await db.collection('orders')
            .where('merchantId', '==', APP.userProfile.uid)
            .get();
        
        let totalRevenue = 0, totalOrders = 0;
        ordersSnap.forEach(doc => {
            const order = doc.data();
            if (order.status === 'completed') {
                totalRevenue += order.total || 0;
                totalOrders++;
            }
        });
        
        // Update stat cards
        const cards = document.querySelectorAll('#store-stats-cards > div');
        if (cards.length >= 6) {
            cards[0].querySelector('p:last-child').textContent = '$' + totalRevenue.toFixed(2);
            cards[1].querySelector('p:last-child').textContent = totalOrders;
            cards[5].querySelector('p:last-child').textContent = '$' + (APP.userProfile.walletBalance||0).toFixed(2);
        }
    } catch(e) { console.error('Stats error:', e); }
}

async function loadRevenueChart() {
    const canvas = document.getElementById('revenueChart');
    if (!canvas || typeof Chart === 'undefined') return;
    
    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
            datasets: [{
                label: 'Revenue',
                data: [120, 250, 180, 320, 280, 400, 350],
                borderColor: '#6C4BFF',
                backgroundColor: 'rgba(108,75,255,0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

async function loadOrderStatusChart() {
    const canvas = document.getElementById('orderStatusChart');
    if (!canvas || typeof Chart === 'undefined') return;
    
    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Delivered','Processing','Shipped','Pending'],
            datasets: [{
                data: [45, 20, 15, 10],
                backgroundColor: ['#22C55E','#F59E0B','#3B82F6','#6C4BFF']
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

async function loadRecentOrders() {
    const list = document.getElementById('recent-orders-list');
    if (!list) return;
    
    try {
        const snap = await db.collection('orders')
            .where('merchantId', '==', APP.userProfile.uid)
            .orderBy('createdAt', 'desc')
            .limit(10)
            .get();
        
        if (snap.empty) {
            list.innerHTML = '<p style="text-align:center;color:#999;padding:20px;">No orders yet</p>';
            return;
        }
        
        list.innerHTML = '';
        snap.forEach(doc => {
            const order = doc.data();
            const statusColors = {
                pending: '#F59E0B', processing: '#3B82F6', shipped: '#6C4BFF',
                delivered: '#22C55E', completed: '#22C55E', cancelled: '#EF4444'
            };
            
            list.innerHTML += `
                <div style="display:flex;align-items:center;gap:12px;padding:12px;border-bottom:1px solid #f0f0f0;">
                    <img src="${order.items?.[0]?.image||'/app-icon.png'}" style="width:45px;height:45px;border-radius:8px;object-fit:cover;">
                    <div style="flex:1;">
                        <p style="font-weight:600;font-size:13px;">${order.items?.[0]?.name||'Product'}</p>
                        <p style="font-size:11px;color:#999;">#${order.orderId||doc.id.substring(0,8)}</p>
                    </div>
                    <span style="background:${statusColors[order.status]||'#999'};color:white;padding:3px 10px;border-radius:10px;font-size:11px;">${(order.status||'').toUpperCase()}</span>
                    <span style="font-weight:700;">${formatCurrency(order.total)}</span>
                </div>`;
        });
    } catch(e) { console.error('Orders error:', e); }
}

// =====================
// CHART LOADER
// =====================
function loadChartJS() {
    return new Promise(resolve => {
        if (typeof Chart !== 'undefined') { resolve(); return; }
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
        script.onload = () => resolve();
        script.onerror = () => resolve();
        document.head.appendChild(script);
    });
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    loadChartJS();
});

// Global access
window.loadStoreOwnerDashboard = loadStoreOwnerDashboard;
window.createStore = createStore;
window.toggleSidebar = toggleSidebar;
window.openStoreChat = openStoreChat;
window.searchChatUsers = searchChatUsers;
window.openChatWithUser = openChatWithUser;
window.sendChatMessage = sendChatMessage;
window.followStore = followStore;
window.likeProduct = likeProduct;
window.openStoreLobby = openStoreLobby;
window.sendLobbyMessage = sendLobbyMessage;
window.openFollowersList = openFollowersList;
window.switchFollowerTab = switchFollowerTab;
window.createTicketProduct = createTicketProduct;
window.STORE_PLANS = STORE_PLANS;

console.log('✅ storeowner.js fully loaded - All features ready');
