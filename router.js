// router.js - WITH goToAccountType FIX
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
    console.log('🧭 Navigating to:', screen);
    
    if (screen === currentScreen && screen !== 'product-detail' && screen !== 'dropship-store') return;
    
    const publicScreens = ['onboarding', 'auth', 'account-type', 'setup-credentials', 'dropship-store', 'product-detail', 'sponsored'];
    if (!publicScreens.includes(screen) && !isLoggedIn()) {
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
        document.getElementById('app').scrollTop = 0;
    } else {
        console.error('❌ Screen not found:', screen);
    }
}

function goBack() {
    const previousScreen = screenHistory.pop() || 'home';
    navigateTo(previousScreen);
}

function handleScreenLoad(screen, data) {
    switch(screen) {
        case 'home': if (typeof loadHomeScreen === 'function') loadHomeScreen(); break;
        case 'marketplace': if (typeof loadMarketplace === 'function') loadMarketplace(); break;
        case 'product-detail':
            if (!data || !data.productId) {
                const deepLinkProductId = sessionStorage.getItem('deep_link_product');
                if (deepLinkProductId) data = { productId: deepLinkProductId };
            }
            if (typeof loadProductDetail === 'function') loadProductDetail(data);
            break;
        case 'sponsored': if (typeof loadSponsoredProductsPage === 'function') loadSponsoredProductsPage(); break;
        case 'checkout': if (typeof loadCheckout === 'function') loadCheckout(); break;
        case 'orders': if (typeof loadOrdersScreen === 'function') loadOrdersScreen(); break;
        case 'wallet': if (typeof loadWalletScreen === 'function') loadWalletScreen(); break;
        case 'affiliate': if (typeof loadAffiliateDashboard === 'function') loadAffiliateDashboard(); break;
        case 'advertisers': if (typeof loadAdvertisers === 'function') loadAdvertisers(); break;
        case 'affiliate-install': if (typeof loadAffiliateInstall === 'function') loadAffiliateInstall(); break;
        case 'merchant': if (typeof loadMerchantDashboard === 'function') loadMerchantDashboard(); break;
        case 'store-setup': if (typeof loadStoreSetup === 'function') loadStoreSetup(); break;
        case 'add-product': if (typeof loadAddProductForm === 'function') loadAddProductForm(); break;
        case 'dropship': if (typeof loadDropshipDashboard === 'function') loadDropshipDashboard(); break;
        case 'dropship-store':
            if (data && data.isPublic && data.username) {
                if (typeof loadPublicDropshipStore === 'function') loadPublicDropshipStore(data.username);
            } else if (typeof loadDropshipStore === 'function') loadDropshipStore(data);
            break;
        case 'profile': if (typeof loadProfileScreen === 'function') loadProfileScreen(); break;
        case 'settings': if (typeof loadSettingsScreen === 'function') loadSettingsScreen(); break;
        case 'notifications': if (typeof loadNotificationsScreen === 'function') loadNotificationsScreen(); break;
        case 'transactions': if (typeof loadStoreTransactions === 'function') loadStoreTransactions(); break;
        case 'leaderboard': if (typeof loadLeaderboard === 'function') loadLeaderboard(); break;
        case 'analytics': if (typeof loadAnalytics === 'function') loadAnalytics(); break;
        case 'customerservice': if (typeof loadCustomerServicePanel === 'function') loadCustomerServicePanel(); break;
        case 'disputes-manage': if (typeof loadDisputesManagement === 'function') loadDisputesManagement(); break;
        case 'vip': if (typeof loadVIPPage === 'function') loadVIPPage(); break;
        case 'hall-of-fame': if (typeof loadHallOfFame === 'function') loadHallOfFame(); break;
        case 'flash-campaigns': if (typeof loadFlashCampaigns === 'function') loadFlashCampaigns(); break;
        case 'influencer-apply': if (typeof loadInfluencerApplication === 'function') loadInfluencerApplication(); break;
        case 'recruit-affiliates': if (typeof loadRecruitAffiliates === 'function') loadRecruitAffiliates(); break;
    }
}

// Deep link detection
(function() {
    const path = window.location.pathname;
    const storeMatch = path.match(/^\/store\/(.+)/);
    if (storeMatch) {
        sessionStorage.setItem('store_view', storeMatch[1]);
        sessionStorage.setItem('deep_link_type', 'store');
        sessionStorage.setItem('force_dropship_store', 'true');
    }
    const productMatch = path.match(/^\/p\/(.+)/);
    if (productMatch) {
        sessionStorage.setItem('deep_link_product', productMatch[1]);
        sessionStorage.setItem('deep_link_type', 'product');
        sessionStorage.setItem('force_product_detail', 'true');
    }
    const affiliateMatch = path.match(/^\/r\/([^\/]+)\/([^\/]+)/);
    if (affiliateMatch) {
        sessionStorage.setItem('affiliate_click', JSON.stringify({ affiliateId: affiliateMatch[1], productId: affiliateMatch[2] }));
        sessionStorage.setItem('deep_link_type', 'affiliate');
        sessionStorage.setItem('force_product_detail', 'true');
    }
    const refCode = new URLSearchParams(window.location.search).get('ref');
    if (refCode) sessionStorage.setItem('referralCode', refCode);
})();

window.addEventListener('load', () => {
    const hash = window.location.hash.replace('#', '');
    const forceStore = sessionStorage.getItem('force_dropship_store');
    const forceProduct = sessionStorage.getItem('force_product_detail');
    const storeUsername = sessionStorage.getItem('store_view');
    
    let initialScreen = 'onboarding';
    
    if (forceStore === 'true' && storeUsername) {
        initialScreen = 'dropship-store';
    } else if (forceProduct === 'true') {
        initialScreen = 'product-detail';
    } else if (hash) {
        initialScreen = hash;
    }
    
    if (isLoggedIn() && ['onboarding', 'auth'].includes(initialScreen)) {
        initialScreen = 'home';
    }
    
    navigateTo(initialScreen);
});

window.addEventListener('popstate', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash && hash !== currentScreen) navigateTo(hash);
});

window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash && hash !== currentScreen) navigateTo(hash);
});

console.log('✅ router.js loaded');
