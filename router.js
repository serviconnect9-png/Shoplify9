// router.js - FIXED DEEP LINKS (No auth required for viewing products/stores)
let currentScreen = 'onboarding';
let screenHistory = [];

// SIMPLE NAVIGATION - works immediately
function goToAccountType() {
    console.log('📝 Create Account clicked - direct navigation');
    document.getElementById('screen-auth').classList.add('hidden');
    document.getElementById('screen-account-type').classList.remove('hidden');
    window.location.hash = 'account-type';
    currentScreen = 'account-type';
}

function navigateTo(screen, data) {
    console.log('🧭 Navigating to:', screen, data ? JSON.stringify(data).substring(0, 100) : '');
    
    if (screen === currentScreen && screen !== 'product-detail' && screen !== 'dropship-store') return;
    
    // PUBLIC SCREENS - no auth required
    const publicScreens = [
        'onboarding', 'auth', 'account-type', 'setup-credentials', 
        'dropship-store', 'product-detail', 'sponsored', 'marketplace'
    ];
    
    // Only redirect to auth if screen requires login AND user is not logged in
    if (!publicScreens.includes(screen) && !isLoggedIn()) {
        console.log('🔒 Screen requires auth, redirecting to auth');
        screen = 'auth';
    }
    
    screenHistory.push(currentScreen);
    
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    
    const targetScreen = document.getElementById(`screen-${screen}`);
    if (targetScreen) {
        targetScreen.classList.remove('hidden');
        currentScreen = screen;
        window.location.hash = screen;
        if (data) sessionStorage.setItem(`screen_data_${screen}`, JSON.stringify(data));
        handleScreenLoad(screen, data);
        const appEl = document.getElementById('app');
        if (appEl) appEl.scrollTop = 0;
    } else {
        console.error('❌ Screen not found:', screen);
        // Fallback to home
        const homeScreen = document.getElementById('screen-home');
        if (homeScreen) {
            document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
            homeScreen.classList.remove('hidden');
            currentScreen = 'home';
            window.location.hash = 'home';
        }
    }
}

function goBack() {
    const previousScreen = screenHistory.pop() || 'home';
    navigateTo(previousScreen);
}

function handleScreenLoad(screen, data) {
    console.log('📄 Loading screen:', screen, data);
    
    switch(screen) {
        case 'home':
            if (typeof loadHomeScreen === 'function') loadHomeScreen();
            break;
        case 'marketplace':
            if (typeof loadMarketplace === 'function') loadMarketplace();
            break;
        case 'product-detail':
            // Check for deep link product
            if (!data || !data.productId) {
                const deepLinkProductId = sessionStorage.getItem('deep_link_product');
                if (deepLinkProductId) {
                    console.log('🔗 Loading product from deep link:', deepLinkProductId);
                    data = { productId: deepLinkProductId };
                }
            }
            if (typeof loadProductDetail === 'function') {
                loadProductDetail(data);
            } else {
                console.error('❌ loadProductDetail not found');
                document.getElementById('product-detail-content').innerHTML = 
                    '<p style="text-align:center;padding:40px;">Loading product...</p>';
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
        case 'affiliate':
            if (typeof loadAffiliateDashboard === 'function') loadAffiliateDashboard();
            break;
        case 'advertisers':
            if (typeof loadAdvertisers === 'function') loadAdvertisers();
            break;
        case 'affiliate-install':
            if (typeof loadAffiliateInstall === 'function') loadAffiliateInstall();
            break;
        case 'merchant':
            if (typeof loadMerchantDashboard === 'function') loadMerchantDashboard();
            break;
        case 'store-setup':
            if (typeof loadStoreSetup === 'function') loadStoreSetup();
            break;
        case 'add-product':
            if (typeof loadAddProductForm === 'function') loadAddProductForm();
            break;
        case 'dropship':
            if (typeof loadDropshipDashboard === 'function') loadDropshipDashboard();
            break;
        case 'dropship-store':
            console.log('🏪 Dropship store - data:', data);
            // Check for public store view
            if (data && data.isPublic && data.username) {
                console.log('🏪 Loading PUBLIC store for:', data.username);
                if (typeof loadPublicDropshipStore === 'function') {
                    loadPublicDropshipStore(data.username);
                } else {
                    document.getElementById('dropship-store-content').innerHTML = 
                        '<p style="text-align:center;padding:40px;">Loading store...</p>';
                }
            } else if (data && data.username) {
                console.log('🏪 Loading store for username:', data.username);
                if (typeof loadPublicDropshipStore === 'function') {
                    loadPublicDropshipStore(data.username);
                }
            } else if (typeof loadDropshipStore === 'function') {
                loadDropshipStore(data);
            } else {
                document.getElementById('dropship-store-content').innerHTML = 
                    '<p style="text-align:center;padding:40px;">Loading store...</p>';
            }
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
        case 'transactions':
            if (typeof loadStoreTransactions === 'function') loadStoreTransactions();
            break;
        case 'leaderboard':
            if (typeof loadLeaderboard === 'function') loadLeaderboard();
            break;
        case 'analytics':
            if (typeof loadAnalytics === 'function') loadAnalytics();
            break;
        case 'customerservice':
            if (typeof loadCustomerServicePanel === 'function') loadCustomerServicePanel();
            break;
        case 'disputes-manage':
            if (typeof loadDisputesManagement === 'function') loadDisputesManagement();
            break;
        case 'vip':
            if (typeof loadVIPPage === 'function') loadVIPPage();
            break;
        case 'hall-of-fame':
            if (typeof loadHallOfFame === 'function') loadHallOfFame();
            break;
        case 'flash-campaigns':
            if (typeof loadFlashCampaigns === 'function') loadFlashCampaigns();
            break;
        case 'influencer-apply':
            if (typeof loadInfluencerApplication === 'function') loadInfluencerApplication();
            break;
        case 'recruit-affiliates':
            if (typeof loadRecruitAffiliates === 'function') loadRecruitAffiliates();
            break;
        default:
            console.warn('⚠️ Unknown screen:', screen);
            break;
    }
}

// =====================
// DEEP LINK DETECTION - Runs on page load
// =====================
(function detectDeepLinks() {
    const path = window.location.pathname;
    console.log('🔍 Checking path:', path);
    
    // Store URL: /store/:username
    const storeMatch = path.match(/^\/store\/(.+)/);
    if (storeMatch) {
        const username = storeMatch[1];
        console.log('🏪 STORE LINK DETECTED:', username);
        sessionStorage.setItem('store_view', username);
        sessionStorage.setItem('deep_link_type', 'store');
        sessionStorage.setItem('force_dropship_store', 'true');
    }
    
    // Product URL: /p/:productId
    const productMatch = path.match(/^\/p\/(.+)/);
    if (productMatch) {
        const productId = productMatch[1];
        console.log('🛍️ PRODUCT LINK DETECTED:', productId);
        sessionStorage.setItem('deep_link_product', productId);
        sessionStorage.setItem('deep_link_type', 'product');
        sessionStorage.setItem('force_product_detail', 'true');
    }
    
    // Affiliate URL: /r/:affiliateId/:productId
    const affiliateMatch = path.match(/^\/r\/([^\/]+)\/([^\/]+)/);
    if (affiliateMatch) {
        const affiliateId = affiliateMatch[1];
        const productId = affiliateMatch[2];
        console.log('📢 AFFILIATE LINK DETECTED:', affiliateId, productId);
        sessionStorage.setItem('affiliate_click', JSON.stringify({ affiliateId, productId }));
        sessionStorage.setItem('deep_link_product', productId);
        sessionStorage.setItem('deep_link_type', 'affiliate');
        sessionStorage.setItem('force_product_detail', 'true');
    }
    
    // Referral URL: ?ref=code
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    if (refCode) {
        console.log('👥 REFERRAL CODE:', refCode);
        sessionStorage.setItem('referralCode', refCode);
    }
})();

// =====================
// INITIAL SCREEN - Runs on page load
// =====================
window.addEventListener('load', () => {
    console.log('📱 Window loaded, determining initial screen...');
    
    const path = window.location.pathname;
    const hash = window.location.hash.replace('#', '');
    const forceProduct = sessionStorage.getItem('force_product_detail');
    const forceStore = sessionStorage.getItem('force_dropship_store');
    const deepLinkProduct = sessionStorage.getItem('deep_link_product');
    const storeUsername = sessionStorage.getItem('store_view');
    
    let initialScreen = 'onboarding';
    
    // CHECK DEEP LINKS FIRST - these don't require auth
    if (forceStore === 'true' && storeUsername) {
        console.log('🏪 Store deep link - going to dropship-store:', storeUsername);
        initialScreen = 'dropship-store';
    } else if (forceProduct === 'true' && deepLinkProduct) {
        console.log('🛍️ Product deep link - going to product-detail:', deepLinkProduct);
        initialScreen = 'product-detail';
    } else if (path.match(/^\/store\/(.+)/)) {
        console.log('🏪 Direct store URL match');
        initialScreen = 'dropship-store';
    } else if (path.match(/^\/p\/(.+)/)) {
        console.log('🛍️ Direct product URL match');
        initialScreen = 'product-detail';
    } else if (path.match(/^\/r\/([^\/]+)\/([^\/]+)/)) {
        console.log('📢 Direct affiliate URL match');
        initialScreen = 'product-detail';
    } else if (hash) {
        initialScreen = hash;
    }
    
    // Only redirect to home if user is logged in AND on onboarding/auth
    // DO NOT redirect if there's a deep link
    if (!forceProduct && !forceStore && !path.match(/^\/(store|p|r)\//)) {
        if (isLoggedIn() && ['onboarding', 'auth'].includes(initialScreen)) {
            console.log('👤 User logged in, going to home');
            initialScreen = 'home';
        }
    }
    
    console.log('🎯 Final initial screen:', initialScreen);
    
    // Navigate to the determined screen
    setTimeout(() => {
        navigateTo(initialScreen);
    }, 100);
});

// =====================
// HANDLE DEEP LINKS AFTER AUTH
// =====================
function handleDeepLinksAfterAuth() {
    const linkType = sessionStorage.getItem('deep_link_type');
    const forceProduct = sessionStorage.getItem('force_product_detail');
    const forceStore = sessionStorage.getItem('force_dropship_store');
    const storeUsername = sessionStorage.getItem('store_view');
    
    console.log('🔗 Handling deep links after auth...');
    
    if (forceStore === 'true' && storeUsername) {
        sessionStorage.removeItem('deep_link_type');
        sessionStorage.removeItem('force_dropship_store');
        sessionStorage.removeItem('store_view');
        console.log('🏪 Navigating to public store:', storeUsername);
        navigateTo('dropship-store', { username: storeUsername, isPublic: true });
    } else if (forceProduct === 'true') {
        const productId = sessionStorage.getItem('deep_link_product');
        if (productId) {
            const linkType = sessionStorage.getItem('deep_link_type');
            if (linkType === 'affiliate') {
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

window.addEventListener('popstate', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash && hash !== currentScreen) navigateTo(hash);
});

window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash && hash !== currentScreen) navigateTo(hash);
});

console.log('✅ router.js loaded');
