// router.js - FIXED: Saves deep link state before auth, restores after login
let currentScreen = 'onboarding';
let screenHistory = [];

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
    console.log('🧭 navigateTo:', screen, data);
    
    if (screen === currentScreen && screen !== 'product-detail' && screen !== 'dropship-store') return;
    
    const publicScreens = [
        'onboarding', 'auth', 'account-type', 'setup-credentials',
        'dropship-store', 'product-detail', 'sponsored', 'marketplace'
    ];
    
    // SAVE CURRENT STATE before redirecting to auth
    if (!publicScreens.includes(screen) && !isLoggedIn()) {
        console.log('🔒 Auth required, saving state before redirect');
        // Save what the user was trying to do
        sessionStorage.setItem('pending_screen', screen);
        if (data) sessionStorage.setItem('pending_data', JSON.stringify(data));
        screen = 'auth';
    }
    
    screenHistory.push(currentScreen);
    hideAllScreens();
    showScreen('screen-' + screen);
    currentScreen = screen;
    window.location.hash = screen;
    
    if (data) {
        sessionStorage.setItem('screen_data_' + screen, JSON.stringify(data));
    }
    
    handleScreenLoad(screen, data);
    
    const appEl = document.getElementById('app');
    if (appEl) appEl.scrollTop = 0;
}

function handleScreenLoad(screen, data) {
    switch(screen) {
        case 'home':
            if (typeof loadHomeScreen === 'function') loadHomeScreen();
            // Check if there's a pending screen to go to after login
            checkPendingScreen();
            break;
        case 'marketplace':
            if (typeof loadMarketplace === 'function') loadMarketplace();
            break;
        case 'product-detail':
            if (!data || !data.productId) {
                const pid = sessionStorage.getItem('deep_link_product');
                if (pid) data = { productId: pid };
            }
            if (typeof loadProductDetail === 'function') loadProductDetail(data);
            break;
        case 'dropship-store':
            if (data && data.isPublic && data.username) {
                if (typeof loadPublicDropshipStore === 'function') loadPublicDropshipStore(data.username);
            } else if (data && data.username) {
                if (typeof loadPublicDropshipStore === 'function') loadPublicDropshipStore(data.username);
            } else if (typeof loadDropshipStore === 'function') {
                loadDropshipStore(data);
            }
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
        case 'affiliate':
            if (typeof loadAffiliateDashboard === 'function') loadAffiliateDashboard();
            break;
        case 'merchant':
            if (typeof loadMerchantDashboard === 'function') loadMerchantDashboard();
            break;
        case 'dropship':
            if (typeof loadDropshipDashboard === 'function') loadDropshipDashboard();
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
        case 'affiliate-install':
            if (typeof loadAffiliateInstall === 'function') loadAffiliateInstall();
            break;
        case 'store-setup':
            if (typeof loadStoreSetup === 'function') loadStoreSetup();
            break;
        case 'add-product':
            if (typeof loadAddProductForm === 'function') loadAddProductForm();
            break;
        case 'recruit-affiliates':
            if (typeof loadRecruitAffiliates === 'function') loadRecruitAffiliates();
            break;
        case 'influencer-apply':
            if (typeof loadInfluencerApplication === 'function') loadInfluencerApplication();
            break;
        case 'transactions':
            if (typeof loadStoreTransactions === 'function') loadStoreTransactions();
            break;
        case 'sponsored':
            if (typeof loadSponsoredProductsPage === 'function') loadSponsoredProductsPage();
            break;
        default:
            console.log('⚠️ No handler for:', screen);
            break;
    }
}

// Check if user was trying to access something before being redirected to auth
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
(function() {
    const path = window.location.pathname;
    console.log('🔍 Path detected:', path);
    
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
        sessionStorage.setItem('deep_link_type', 'product');
        sessionStorage.setItem('skip_onboarding', 'true');
    }
    
    if (path.match(/^\/r\/([^\/]+)\/([^\/]+)/)) {
        const match = path.match(/^\/r\/([^\/]+)\/([^\/]+)/);
        console.log('📢 AFFILIATE:', match[1], match[2]);
        sessionStorage.setItem('affiliate_click', JSON.stringify({ affiliateId: match[1], productId: match[2] }));
        sessionStorage.setItem('deep_link_product', match[2]);
        sessionStorage.setItem('deep_link_type', 'affiliate');
        sessionStorage.setItem('skip_onboarding', 'true');
    }
    
    const refCode = new URLSearchParams(window.location.search).get('ref');
    if (refCode) sessionStorage.setItem('referralCode', refCode);
})();

// =====================
// START THE APP
// =====================
(function startApp() {
    const skipOnboarding = sessionStorage.getItem('skip_onboarding');
    const path = window.location.pathname;
    const storeUsername = sessionStorage.getItem('store_view');
    const productId = sessionStorage.getItem('deep_link_product');
    const pendingScreen = sessionStorage.getItem('pending_screen');
    
    console.log('🚀 Starting app...');
    
    // HIDE ONBOARDING if deep link
    if (skipOnboarding === 'true') {
        document.getElementById('screen-onboarding').classList.add('hidden');
    }
    
    // DIRECT DEEP LINK HANDLING
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
    
    // NORMAL FLOW
    if (isLoggedIn()) {
        hideAllScreens();
        
        // Check if there's a pending screen to return to
        if (pendingScreen) {
            const pendingData = sessionStorage.getItem('pending_data');
            sessionStorage.removeItem('pending_screen');
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
    // If not logged in, onboarding stays visible
})();

window.addEventListener('popstate', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash && hash !== currentScreen) navigateTo(hash);
});

function isLoggedIn() {
    return localStorage.getItem('shoplify_auth') === 'true';
}

console.log('✅ router.js loaded');
