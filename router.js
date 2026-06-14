// router.js - COMPLETE FINAL VERSION (Subdomain Stores, Deep Links, All Screens)
let currentScreen = 'onboarding';
let screenHistory = [];

// =====================
// DIRECT NAVIGATION
// =====================
function goToAccountType() {
    console.log('📝 Create Account clicked');
    hideAllScreens();
    showScreen('screen-account-type');
    window.location.hash = 'account-type';
    currentScreen = 'account-type';
}

function hideAllScreens() {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
}

function showScreen(id) {
    const screen = document.getElementById(id);
    if (screen) screen.classList.remove('hidden');
}

function navigateTo(screen, data) {
    console.log('🧭 navigateTo:', screen, data ? JSON.stringify(data).substring(0, 100) : '');
    
    if (screen === currentScreen && screen !== 'product-detail' && screen !== 'dropship-store') return;
    
    const publicScreens = [
        'onboarding', 'auth', 'account-type', 'setup-credentials',
        'dropship-store', 'product-detail', 'sponsored', 'marketplace'
    ];
    
    if (!publicScreens.includes(screen) && !isLoggedIn()) {
        console.log('🔒 Auth required, saving pending:', screen);
        sessionStorage.setItem('pending_screen', screen);
        if (data) sessionStorage.setItem('pending_data', JSON.stringify(data));
        screen = 'auth';
    }
    
    screenHistory.push(currentScreen);
    hideAllScreens();
    
    const targetId = 'screen-' + screen;
    const targetScreen = document.getElementById(targetId);
    
    if (targetScreen) {
        targetScreen.classList.remove('hidden');
        currentScreen = screen;
        window.location.hash = screen;
        
        if (data) {
            sessionStorage.setItem('screen_data_' + screen, JSON.stringify(data));
        }
        
        handleScreenLoad(screen, data);
        
        const appEl = document.getElementById('app');
        if (appEl) appEl.scrollTop = 0;
        
        console.log('✅ Screen loaded:', screen);
    } else {
        console.error('❌ Screen element not found:', targetId);
        hideAllScreens();
        const homeScreen = document.getElementById('screen-home');
        if (homeScreen) {
            homeScreen.classList.remove('hidden');
            currentScreen = 'home';
            window.location.hash = 'home';
        }
    }
}

function goBack() {
    const previousScreen = screenHistory.pop() || 'home';
    console.log('⬅️ Going back to:', previousScreen);
    navigateTo(previousScreen);
}

// =====================
// HANDLE SCREEN LOAD
// =====================
function handleScreenLoad(screen, data) {
    console.log('📄 handleScreenLoad:', screen, data);
    
    switch(screen) {
        // ========== MAIN SCREENS ==========
        case 'home':
            if (typeof loadHomeScreen === 'function') loadHomeScreen();
            else console.error('❌ loadHomeScreen missing');
            // Check for pending screen after login
            checkPendingScreen();
            break;
            
        case 'marketplace':
            if (typeof loadMarketplace === 'function') loadMarketplace();
            break;
            
        case 'product-detail':
            if (!data || !data.productId) {
                const pid = sessionStorage.getItem('deep_link_product');
                if (pid) {
                    console.log('🔗 Loading product from deep link:', pid);
                    data = { productId: pid };
                }
            }
            if (typeof loadProductDetail === 'function') loadProductDetail(data);
            else {
                const c = document.getElementById('product-detail-content');
                if (c) c.innerHTML = '<p style="text-align:center;padding:40px;">Loading product...</p>';
            }
            break;
            
        case 'sponsored':
            if (typeof loadSponsoredProductsPage === 'function') loadSponsoredProductsPage();
            break;
            
        case 'checkout':
            if (typeof loadCheckout === 'function') loadCheckout();
            break;
            
        case 'orders':
            if (typeof loadOrdersScreen === 'function') loadOrdersScreen();
            break;
            
        case 'wallet':
            if (typeof loadWalletScreen === 'function') loadWalletScreen();
            break;
            
        // ========== DROPSHIP SCREENS ==========
        case 'dropship':
            console.log('📦 Loading dropship dashboard...');
            if (typeof loadDropshipDashboard === 'function') {
                loadDropshipDashboard();
            } else if (typeof window.loadDropshipDashboard === 'function') {
                window.loadDropshipDashboard();
            } else {
                const c = document.getElementById('dropship-content');
                if (c) c.innerHTML = '<p style="text-align:center;padding:40px;">Loading dropship dashboard...</p>';
                setTimeout(() => {
                    if (typeof loadDropshipDashboard === 'function') loadDropshipDashboard();
                    else if (typeof window.loadDropshipDashboard === 'function') window.loadDropshipDashboard();
                }, 500);
            }
            break;
            
        case 'dropship-store':
            console.log('🏪 Loading dropship store...');
            if (data && data.isPublic && data.username) {
                if (typeof loadPublicDropshipStore === 'function') {
                    loadPublicDropshipStore(data.username);
                } else if (typeof window.loadPublicDropshipStore === 'function') {
                    window.loadPublicDropshipStore(data.username);
                }
            } else if (data && data.username) {
                if (typeof loadPublicDropshipStore === 'function') {
                    loadPublicDropshipStore(data.username);
                }
            } else if (typeof loadDropshipStore === 'function') {
                loadDropshipStore(data);
            } else {
                const c = document.getElementById('dropship-store-content');
                if (c) c.innerHTML = '<p style="text-align:center;padding:40px;">Loading store...</p>';
            }
            break;
            
        // ========== MERCHANT SCREENS ==========
        case 'merchant':
            if (typeof loadMerchantDashboard === 'function') loadMerchantDashboard();
            else console.error('❌ loadMerchantDashboard missing');
            break;
            
        case 'store-setup':
            if (typeof loadStoreSetup === 'function') loadStoreSetup();
            break;
            
        case 'add-product':
            if (typeof loadAddProductForm === 'function') loadAddProductForm();
            break;
            
        // ========== USER SCREENS ==========
        case 'profile':
            if (typeof loadProfileScreen === 'function') loadProfileScreen();
            break;
            
        case 'settings':
            if (typeof loadSettingsScreen === 'function') loadSettingsScreen();
            break;
            
        case 'notifications':
            if (typeof loadNotificationsScreen === 'function') loadNotificationsScreen();
            break;
            
        // ========== SERVICE SCREENS ==========
        case 'customerservice':
            console.log('🎧 Loading customer service...');
            if (typeof loadCustomerServicePanel === 'function') {
                loadCustomerServicePanel();
            } else {
                const c = document.getElementById('cs-content');
                if (c) c.innerHTML = '<p style="text-align:center;padding:40px;">Loading customer service...</p>';
            }
            break;
            
        case 'disputes-manage':
            if (typeof loadDisputesManagement === 'function') loadDisputesManagement();
            break;
            
        // ========== COMMUNITY SCREENS ==========
        case 'leaderboard':
            if (typeof loadLeaderboard === 'function') loadLeaderboard();
            break;
            
        case 'analytics':
            if (typeof loadAnalytics === 'function') loadAnalytics();
            break;
            
        case 'hall-of-fame':
            if (typeof loadHallOfFame === 'function') loadHallOfFame();
            break;
            
        case 'advertisers':
            if (typeof loadAdvertisers === 'function') loadAdvertisers();
            break;
            
        // ========== INFLUENCER SCREENS ==========
        case 'influencer-dashboard':
            console.log('📊 Loading influencer dashboard...');
            if (typeof loadInfluencerDashboard === 'function') loadInfluencerDashboard();
            else {
                const c = document.getElementById('influencer-dashboard-content');
                if (c) c.innerHTML = '<p style="text-align:center;padding:40px;">Loading...</p>';
            }
            break;
            
        case 'influencer-apply':
            if (typeof loadInfluencerApplication === 'function') loadInfluencerApplication();
            break;
            
        case 'recruit-affiliates':
            if (typeof loadRecruitAffiliates === 'function') loadRecruitAffiliates();
            break;
            
        // ========== OTHER SCREENS ==========
        case 'transactions':
            if (typeof loadStoreTransactions === 'function') loadStoreTransactions();
            break;
            
        case 'vip':
            if (typeof loadVIPPage === 'function') loadVIPPage();
            break;
            
        case 'flash-campaigns':
            if (typeof loadFlashCampaigns === 'function') loadFlashCampaigns();
            break;
            
        default:
            console.warn('⚠️ Unknown screen:', screen);
            break;
    }
}

// =====================
// CHECK PENDING SCREEN (After login)
// =====================
function checkPendingScreen() {
    const pendingScreen = sessionStorage.getItem('pending_screen');
    if (pendingScreen) {
        console.log('🔙 Returning to pending screen:', pendingScreen);
        const pendingData = sessionStorage.getItem('pending_data');
        sessionStorage.removeItem('pending_screen');
        sessionStorage.removeItem('pending_data');
        
        setTimeout(() => {
            if (pendingData) {
                navigateTo(pendingScreen, JSON.parse(pendingData));
            } else {
                navigateTo(pendingScreen);
            }
        }, 500);
    }
}

// =====================
// DEEP LINK DETECTION
// =====================
(function detectDeepLinks() {
    const hostname = window.location.hostname;
    const path = window.location.pathname;
    
    console.log('🔍 Hostname:', hostname, '| Path:', path);
    
    // =====================
    // SUBDOMAIN STORE DETECTION
    // Example: rev.shoplify9.vercel.app
    // =====================
    if (hostname.includes('.') && !hostname.startsWith('www') && hostname !== 'shoplify9.vercel.app' && hostname !== 'localhost') {
        const parts = hostname.split('.');
        if (parts.length >= 3) {
            const subdomain = parts[0];
            // Skip known subdomains
            if (subdomain !== 'shoplify9' && subdomain !== 'vercel' && subdomain !== 'app') {
                console.log('🏪 SUBDOMAIN STORE DETECTED:', subdomain);
                sessionStorage.setItem('store_view', subdomain);
                sessionStorage.setItem('deep_link_type', 'store');
                sessionStorage.setItem('skip_onboarding', 'true');
                sessionStorage.setItem('force_dropship_store', 'true');
            }
        }
    }
    
    // =====================
    // STANDARD PATH DETECTION
    // =====================
    
    // Store URL: /store/:username
    const storeMatch = path.match(/^\/store\/(.+)/);
    if (storeMatch) {
        const username = storeMatch[1];
        console.log('🏪 STORE LINK:', username);
        sessionStorage.setItem('store_view', username);
        sessionStorage.setItem('deep_link_type', 'store');
        sessionStorage.setItem('skip_onboarding', 'true');
        sessionStorage.setItem('force_dropship_store', 'true');
    }
    
    // Product URL: /p/:productId
    const productMatch = path.match(/^\/p\/(.+)/);
    if (productMatch) {
        const productId = productMatch[1];
        console.log('🛍️ PRODUCT LINK:', productId);
        sessionStorage.setItem('deep_link_product', productId);
        sessionStorage.setItem('deep_link_type', 'product');
        sessionStorage.setItem('skip_onboarding', 'true');
        sessionStorage.setItem('force_product_detail', 'true');
    }
    
    // Affiliate URL: /r/:affiliateId/:productId
    const affiliateMatch = path.match(/^\/r\/([^\/]+)\/([^\/]+)/);
    if (affiliateMatch) {
        const affiliateId = affiliateMatch[1];
        const productId = affiliateMatch[2];
        console.log('📢 AFFILIATE LINK:', affiliateId, productId);
        sessionStorage.setItem('affiliate_click', JSON.stringify({ affiliateId, productId }));
        sessionStorage.setItem('deep_link_product', productId);
        sessionStorage.setItem('deep_link_type', 'affiliate');
        sessionStorage.setItem('skip_onboarding', 'true');
        sessionStorage.setItem('force_product_detail', 'true');
    }
    
    // Referral URL: ?ref=code
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    if (refCode) {
        console.log('👥 REFERRAL:', refCode);
        sessionStorage.setItem('referralCode', refCode);
    }
})();

// =====================
// START THE APP
// =====================
(function startApp() {
    const skipOnboarding = sessionStorage.getItem('skip_onboarding');
    const forceProduct = sessionStorage.getItem('force_product_detail');
    const forceStore = sessionStorage.getItem('force_dropship_store');
    const path = window.location.pathname;
    const hostname = window.location.hostname;
    const storeUsername = sessionStorage.getItem('store_view');
    const productId = sessionStorage.getItem('deep_link_product');
    const pendingScreen = sessionStorage.getItem('pending_screen');
    
    console.log('🚀 Starting app...');
    console.log('   Hostname:', hostname);
    console.log('   Path:', path);
    console.log('   Store:', storeUsername);
    console.log('   Product:', productId);
    console.log('   Force Store:', forceStore);
    console.log('   Force Product:', forceProduct);
    console.log('   Pending:', pendingScreen);
    
    // Hide onboarding immediately for deep links
    if (skipOnboarding === 'true') {
        document.getElementById('screen-onboarding').classList.add('hidden');
    }
    
    // =====================
    // PRIORITY 1: Dropship Store (Subdomain or /store/)
    // =====================
    if ((forceStore === 'true' && storeUsername) || path.match(/^\/store\/(.+)/)) {
        const username = storeUsername || (path.match(/^\/store\/(.+)/) ? path.match(/^\/store\/(.+)/)[1] : null);
        
        // Check if subdomain store
        if (hostname.includes('.') && !hostname.startsWith('www')) {
            const parts = hostname.split('.');
            if (parts.length >= 3 && parts[0] !== 'shoplify9' && parts[0] !== 'vercel') {
                const subdomainUsername = parts[0];
                console.log('🏪 SUBDOMAIN STORE - Loading:', subdomainUsername);
                hideAllScreens();
                showScreen('screen-dropship-store');
                currentScreen = 'dropship-store';
                window.location.hash = 'dropship-store';
                
                if (typeof loadPublicDropshipStore === 'function') {
                    loadPublicDropshipStore(subdomainUsername);
                } else if (typeof window.loadPublicDropshipStore === 'function') {
                    window.loadPublicDropshipStore(subdomainUsername);
                }
                return;
            }
        }
        
        if (username) {
            console.log('🏪 PATH STORE - Loading:', username);
            hideAllScreens();
            showScreen('screen-dropship-store');
            currentScreen = 'dropship-store';
            window.location.hash = 'dropship-store';
            
            if (typeof loadPublicDropshipStore === 'function') {
                loadPublicDropshipStore(username);
            } else if (typeof window.loadPublicDropshipStore === 'function') {
                window.loadPublicDropshipStore(username);
            }
            return;
        }
    }
    
    // =====================
    // PRIORITY 2: Product Detail
    // =====================
    if ((forceProduct === 'true' && productId) || path.match(/^\/p\/(.+)/) || path.match(/^\/r\/([^\/]+)\/([^\/]+)/)) {
        const pid = productId || (path.match(/^\/p\/(.+)/) ? path.match(/^\/p\/(.+)/)[1] : null) || 
                    (path.match(/^\/r\/([^\/]+)\/([^\/]+)/) ? path.match(/^\/r\/([^\/]+)\/([^\/]+)/)[2] : null);
        
        if (pid) {
            console.log('🛍️ PRODUCT - Loading:', pid);
            hideAllScreens();
            showScreen('screen-product-detail');
            currentScreen = 'product-detail';
            window.location.hash = 'product-detail';
            
            if (typeof loadProductDetail === 'function') {
                loadProductDetail({ productId: pid });
            }
            return;
        }
    }
    
    // =====================
    // PRIORITY 3: Normal Flow
    // =====================
    if (isLoggedIn()) {
        hideAllScreens();
        
        // Check for pending screen
        if (pendingScreen) {
            sessionStorage.removeItem('pending_screen');
            const pendingData = sessionStorage.getItem('pending_data');
            sessionStorage.removeItem('pending_data');
            
            showScreen('screen-' + pendingScreen);
            currentScreen = pendingScreen;
            window.location.hash = pendingScreen;
            
            if (pendingData) {
                handleScreenLoad(pendingScreen, JSON.parse(pendingData));
            } else {
                handleScreenLoad(pendingScreen);
            }
        } else {
            showScreen('screen-home');
            currentScreen = 'home';
            window.location.hash = 'home';
            if (typeof loadHomeScreen === 'function') loadHomeScreen();
        }
    }
    // If not logged in, onboarding stays visible (it's the default)
})();

// =====================
// HANDLE DEEP LINKS AFTER AUTH
// =====================
function handleDeepLinksAfterAuth() {
    const linkType = sessionStorage.getItem('deep_link_type');
    const forceProduct = sessionStorage.getItem('force_product_detail');
    const forceStore = sessionStorage.getItem('force_dropship_store');
    const storeUsername = sessionStorage.getItem('store_view');
    
    console.log('🔗 Handling deep links after auth...');
    console.log('   Type:', linkType, 'Store:', storeUsername);
    
    if (forceStore === 'true' && storeUsername) {
        sessionStorage.removeItem('deep_link_type');
        sessionStorage.removeItem('force_dropship_store');
        sessionStorage.removeItem('store_view');
        console.log('🏪 Navigating to store:', storeUsername);
        navigateTo('dropship-store', { username: storeUsername, isPublic: true });
    } else if (forceProduct === 'true') {
        const productId = sessionStorage.getItem('deep_link_product');
        if (productId) {
            const lt = sessionStorage.getItem('deep_link_type');
            if (lt === 'affiliate') {
                const data = JSON.parse(sessionStorage.getItem('affiliate_click') || '{}');
                if (data.affiliateId && data.productId && typeof trackAffiliateClick === 'function') {
                    trackAffiliateClick(data.affiliateId, data.productId);
                }
                sessionStorage.removeItem('affiliate_click');
            }
            sessionStorage.removeItem('deep_link_type');
            sessionStorage.removeItem('force_product_detail');
            console.log('🛍️ Navigating to product:', productId);
            navigateTo('product-detail', { productId });
        }
    }
}

// =====================
// BROWSER NAVIGATION
// =====================
window.addEventListener('popstate', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash && hash !== currentScreen) navigateTo(hash);
});

window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash && hash !== currentScreen) navigateTo(hash);
});

// =====================
// UTILITY
// =====================
function isLoggedIn() {
    return localStorage.getItem('shoplify_auth') === 'true';
}

console.log('✅ router.js fully loaded - All routes ready');
console.log('   Subdomain stores: username.shoplify9.vercel.app');
console.log('   Path stores: /store/username');
console.log('   Products: /p/productId');
console.log('   Affiliate: /r/affiliateId/productId');
