// router.js - FIXED: Deep links work immediately, no onboarding block
let currentScreen = 'onboarding';
let screenHistory = [];

// =====================
// DIRECT NAVIGATION - Works immediately
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
        console.log('🔒 Auth required for:', screen);
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

// =====================
// DEEP LINK DETECTION - Runs IMMEDIATELY
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
// START THE APP - Skip onboarding for deep links
// =====================
(function startApp() {
    const skipOnboarding = sessionStorage.getItem('skip_onboarding');
    const path = window.location.pathname;
    const storeUsername = sessionStorage.getItem('store_view');
    const productId = sessionStorage.getItem('deep_link_product');
    
    console.log('🚀 Starting app...');
    console.log('   skipOnboarding:', skipOnboarding);
    console.log('   path:', path);
    console.log('   storeUsername:', storeUsername);
    console.log('   productId:', productId);
    
    // HIDE ONBOARDING IMMEDIATELY if deep link
    if (skipOnboarding === 'true') {
        document.getElementById('screen-onboarding').classList.add('hidden');
    }
    
    // Determine where to go
    if (path.match(/^\/store\/(.+)/) && storeUsername) {
        // Go directly to store
        hideAllScreens();
        showScreen('screen-dropship-store');
        currentScreen = 'dropship-store';
        window.location.hash = 'dropship-store';
        
        // Check if user is logged in for public/private view
        if (isLoggedIn()) {
            handleScreenLoad('dropship-store', { username: storeUsername, isPublic: true });
        } else {
            // Load public store without auth
            if (typeof loadPublicDropshipStore === 'function') {
                loadPublicDropshipStore(storeUsername);
            }
        }
        return;
    }
    
    if ((path.match(/^\/p\/(.+)/) || path.match(/^\/r\/([^\/]+)\/([^\/]+)/)) && productId) {
        // Go directly to product
        hideAllScreens();
        showScreen('screen-product-detail');
        currentScreen = 'product-detail';
        window.location.hash = 'product-detail';
        
        if (typeof loadProductDetail === 'function') {
            loadProductDetail({ productId: productId });
        }
        return;
    }
    
    // Normal flow - check if logged in
    if (isLoggedIn()) {
        hideAllScreens();
        showScreen('screen-home');
        currentScreen = 'home';
        window.location.hash = 'home';
        if (typeof loadHomeScreen === 'function') loadHomeScreen();
    }
    // If not logged in, onboarding stays visible (it's the default)
})();

window.addEventListener('popstate', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash && hash !== currentScreen) navigateTo(hash);
});

window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash && hash !== currentScreen) navigateTo(hash);
});

function isLoggedIn() {
    return localStorage.getItem('shoplify_auth') === 'true';
}

console.log('✅ router.js loaded');
