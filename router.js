// router.js - COMPLETE FIXED VERSION (All screens load properly)
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
    console.log('🧭 navigateTo:', screen);
    
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
        
        // LOAD SCREEN CONTENT
        handleScreenLoad(screen, data);
        
        const appEl = document.getElementById('app');
        if (appEl) appEl.scrollTop = 0;
        
        console.log('✅ Screen loaded:', screen);
    } else {
        console.error('❌ Screen element not found:', targetId);
        // Fallback to home
        hideAllScreens();
        const homeScreen = document.getElementById('screen-home');
        if (homeScreen) {
            homeScreen.classList.remove('hidden');
            currentScreen = 'home';
            window.location.hash = 'home';
        }
    }
}

// =====================
// HANDLE SCREEN LOAD
// =====================
function handleScreenLoad(screen, data) {
    console.log('📄 handleScreenLoad:', screen);
    
    switch(screen) {
        case 'home':
            if (typeof loadHomeScreen === 'function') loadHomeScreen();
            else console.error('❌ loadHomeScreen missing');
            break;
            
        case 'marketplace':
            if (typeof loadMarketplace === 'function') loadMarketplace();
            else console.error('❌ loadMarketplace missing');
            break;
            
        case 'product-detail':
            if (!data || !data.productId) {
                const pid = sessionStorage.getItem('deep_link_product');
                if (pid) data = { productId: pid };
            }
            if (typeof loadProductDetail === 'function') loadProductDetail(data);
            else console.error('❌ loadProductDetail missing');
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
            
        case 'dropship':
            console.log('📦 Loading dropship dashboard...');
            if (typeof loadDropshipDashboard === 'function') {
                loadDropshipDashboard();
            } else {
                console.error('❌ loadDropshipDashboard missing');
                const c = document.getElementById('dropship-content');
                if (c) c.innerHTML = '<p style="text-align:center;padding:40px;">Loading dropship dashboard...</p>';
            }
            break;
            
        case 'dropship-store':
            console.log('🏪 Loading dropship store...');
            if (data && data.isPublic && data.username) {
                if (typeof loadPublicDropshipStore === 'function') {
                    loadPublicDropshipStore(data.username);
                } else {
                    console.error('❌ loadPublicDropshipStore missing');
                }
            } else if (typeof loadDropshipStore === 'function') {
                loadDropshipStore(data);
            } else {
                console.error('❌ loadDropshipStore missing');
            }
            break;
            
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
            
        case 'profile':
            if (typeof loadProfileScreen === 'function') loadProfileScreen();
            break;
            
        case 'settings':
            if (typeof loadSettingsScreen === 'function') loadSettingsScreen();
            break;
            
        case 'notifications':
            if (typeof loadNotificationsScreen === 'function') loadNotificationsScreen();
            break;
            
        case 'customerservice':
            console.log('🎧 Loading customer service...');
            if (typeof loadCustomerServicePanel === 'function') {
                loadCustomerServicePanel();
            } else {
                console.error('❌ loadCustomerServicePanel missing');
                const c = document.getElementById('cs-content');
                if (c) c.innerHTML = '<p style="text-align:center;padding:40px;">Loading customer service...</p>';
            }
            break;
            
        case 'disputes-manage':
            if (typeof loadDisputesManagement === 'function') loadDisputesManagement();
            break;
            
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
// DEEP LINK DETECTION
// =====================
(function() {
    const path = window.location.pathname;
    console.log('🔍 Path:', path);
    
    if (path.match(/^\/store\/(.+)/)) {
        const username = path.match(/^\/store\/(.+)/)[1];
        console.log('🏪 STORE:', username);
        sessionStorage.setItem('store_view', username);
        sessionStorage.setItem('deep_link_type', 'store');
        sessionStorage.setItem('skip_onboarding', 'true');
    }
    
    if (path.match(/^\/p\/(.+)/)) {
        const productId = path.match(/^\/p\/(.+)/)[1];
        console.log('🛍️ PRODUCT:', productId);
        sessionStorage.setItem('deep_link_product', productId);
        sessionStorage.setItem('skip_onboarding', 'true');
    }
    
    if (path.match(/^\/r\/([^\/]+)\/([^\/]+)/)) {
        const match = path.match(/^\/r\/([^\/]+)\/([^\/]+)/);
        console.log('📢 AFFILIATE:', match[1], match[2]);
        sessionStorage.setItem('affiliate_click', JSON.stringify({ affiliateId: match[1], productId: match[2] }));
        sessionStorage.setItem('deep_link_product', match[2]);
        sessionStorage.setItem('skip_onboarding', 'true');
    }
    
    const refCode = new URLSearchParams(window.location.search).get('ref');
    if (refCode) sessionStorage.setItem('referralCode', refCode);
})();

// =====================
// START APP
// =====================
(function startApp() {
    const skipOnboarding = sessionStorage.getItem('skip_onboarding');
    const path = window.location.pathname;
    const storeUsername = sessionStorage.getItem('store_view');
    const productId = sessionStorage.getItem('deep_link_product');
    const pendingScreen = sessionStorage.getItem('pending_screen');
    
    console.log('🚀 Starting app...');
    console.log('   skip:', skipOnboarding, 'path:', path);
    
    if (skipOnboarding === 'true') {
        document.getElementById('screen-onboarding').classList.add('hidden');
    }
    
    // Direct deep link handling
    if (path.match(/^\/store\/(.+)/) && storeUsername) {
        hideAllScreens();
        showScreen('screen-dropship-store');
        currentScreen = 'dropship-store';
        window.location.hash = 'dropship-store';
        if (typeof loadPublicDropshipStore === 'function') {
            loadPublicDropshipStore(storeUsername);
        }
        return;
    }
    
    if ((path.match(/^\/p\/(.+)/) || path.match(/^\/r\/([^\/]+)\/([^\/]+)/)) && productId) {
        hideAllScreens();
        showScreen('screen-product-detail');
        currentScreen = 'product-detail';
        window.location.hash = 'product-detail';
        if (typeof loadProductDetail === 'function') {
            loadProductDetail({ productId: productId });
        }
        return;
    }
    
    // Normal flow
    if (isLoggedIn()) {
        hideAllScreens();
        
        if (pendingScreen) {
            sessionStorage.removeItem('pending_screen');
            const pendingData = sessionStorage.getItem('pending_data');
            sessionStorage.removeItem('pending_data');
            showScreen('screen-' + pendingScreen);
            currentScreen = pendingScreen;
            window.location.hash = pendingScreen;
            handleScreenLoad(pendingScreen, pendingData ? JSON.parse(pendingData) : null);
        } else {
            showScreen('screen-home');
            currentScreen = 'home';
            window.location.hash = 'home';
            if (typeof loadHomeScreen === 'function') loadHomeScreen();
        }
    }
})();

function isLoggedIn() {
    return localStorage.getItem('shoplify_auth') === 'true';
}

window.addEventListener('popstate', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash && hash !== currentScreen) navigateTo(hash);
});

window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash && hash !== currentScreen) navigateTo(hash);
});

console.log('✅ router.js loaded - All routes ready');
