// router.js - COMPLETELY FIXED: Deep links work without auth

let currentScreen = 'onboarding';
let screenHistory = [];

// SIMPLE NAVIGATION - works immediately
function goToAccountType() {
    console.log('📝 Create Account clicked');
    document.getElementById('screen-auth').classList.add('hidden');
    document.getElementById('screen-account-type').classList.remove('hidden');
    window.location.hash = 'account-type';
    currentScreen = 'account-type';
}

function navigateTo(screen, data) {
    console.log('🧭 Navigating to:', screen, data ? 'with data' : '');
    
    // Don't navigate to same screen unless it's product-detail or dropship-store
    if (screen === currentScreen && screen !== 'product-detail' && screen !== 'dropship-store') {
        console.log('   Already on this screen');
        return;
    }
    
    // These screens are PUBLIC - no auth required
    const publicScreens = [
        'onboarding', 'auth', 'account-type', 'setup-credentials',
        'dropship-store', 'product-detail', 'sponsored', 'marketplace',
        'hall-of-fame', 'leaderboard'
    ];
    
    // Only redirect to auth for NON-public screens when not logged in
    if (!publicScreens.includes(screen)) {
        if (!isLoggedIn()) {
            console.log('🔒 Auth required for:', screen);
            screen = 'auth';
        }
    }
    
    // Save history
    screenHistory.push(currentScreen);
    
    // Hide all screens
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    
    // Show target screen
    const targetScreen = document.getElementById(`screen-${screen}`);
    if (targetScreen) {
        targetScreen.classList.remove('hidden');
        currentScreen = screen;
        window.location.hash = screen;
        
        if (data) {
            sessionStorage.setItem(`screen_data_${screen}`, JSON.stringify(data));
        }
        
        // Load screen content
        handleScreenLoad(screen, data);
        
        // Scroll to top
        const appEl = document.getElementById('app');
        if (appEl) appEl.scrollTop = 0;
        
        console.log('✅ Navigated to:', screen);
    } else {
        console.error('❌ Screen element not found:', screen);
        // Fallback to onboarding if screen doesn't exist
        const onboardingScreen = document.getElementById('screen-onboarding');
        if (onboardingScreen) {
            onboardingScreen.classList.remove('hidden');
            currentScreen = 'onboarding';
            window.location.hash = 'onboarding';
        }
    }
}

function goBack() {
    const previousScreen = screenHistory.pop() || 'home';
    navigateTo(previousScreen);
}

function handleScreenLoad(screen, data) {
    console.log('📄 handleScreenLoad:', screen);
    
    switch(screen) {
        case 'home':
            if (typeof loadHomeScreen === 'function') loadHomeScreen();
            break;
            
        case 'marketplace':
            if (typeof loadMarketplace === 'function') loadMarketplace();
            break;
            
        case 'product-detail':
            // Get product ID from data or session storage
            let productId = data?.productId;
            if (!productId) {
                productId = sessionStorage.getItem('deep_link_product');
                console.log('🔗 Using deep link product:', productId);
            }
            if (productId && typeof loadProductDetail === 'function') {
                loadProductDetail({ productId });
            } else if (typeof loadProductDetail === 'function') {
                loadProductDetail(null);
            }
            break;
            
        case 'sponsored':
            if (typeof loadSponsoredProductsPage === 'function') loadSponsoredProductsPage();
            break;
            
        case 'checkout':
            if (!isLoggedIn()) { navigateTo('auth'); return; }
            if (typeof loadCheckout === 'function') loadCheckout();
            break;
            
        case 'orders':
            if (!isLoggedIn()) { navigateTo('auth'); return; }
            if (typeof loadOrdersScreen === 'function') loadOrdersScreen();
            break;
            
        case 'wallet':
            if (!isLoggedIn()) { navigateTo('auth'); return; }
            if (typeof loadWalletScreen === 'function') loadWalletScreen();
            break;
            
        case 'affiliate':
            if (!isLoggedIn()) { navigateTo('auth'); return; }
            if (typeof loadAffiliateDashboard === 'function') loadAffiliateDashboard();
            break;
            
        case 'advertisers':
            if (typeof loadAdvertisers === 'function') loadAdvertisers();
            break;
            
        case 'affiliate-install':
            if (!isLoggedIn()) { navigateTo('auth'); return; }
            if (typeof loadAffiliateInstall === 'function') loadAffiliateInstall();
            break;
            
        case 'merchant':
            if (!isLoggedIn()) { navigateTo('auth'); return; }
            if (typeof loadMerchantDashboard === 'function') loadMerchantDashboard();
            break;
            
        case 'store-setup':
            if (!isLoggedIn()) { navigateTo('auth'); return; }
            if (typeof loadStoreSetup === 'function') loadStoreSetup();
            break;
            
        case 'add-product':
            if (!isLoggedIn()) { navigateTo('auth'); return; }
            if (typeof loadAddProductForm === 'function') loadAddProductForm();
            break;
            
        case 'dropship':
            if (!isLoggedIn()) { navigateTo('auth'); return; }
            if (typeof loadDropshipDashboard === 'function') loadDropshipDashboard();
            break;
            
        case 'dropship-store':
            // PUBLIC - no auth required
            console.log('🏪 Dropship store - data:', data);
            if (data && data.isPublic && data.username) {
                // Public store view
                if (typeof loadPublicDropshipStore === 'function') {
                    loadPublicDropshipStore(data.username);
                } else {
                    console.error('❌ loadPublicDropshipStore not found');
                }
            } else if (data && data.username) {
                // Store with username
                if (typeof loadPublicDropshipStore === 'function') {
                    loadPublicDropshipStore(data.username);
                }
            } else {
                // Check session for store username
                const storeUser = sessionStorage.getItem('store_view');
                if (storeUser && typeof loadPublicDropshipStore === 'function') {
                    loadPublicDropshipStore(storeUser);
                } else if (typeof loadDropshipStore === 'function') {
                    loadDropshipStore(data);
                }
            }
            break;
            
        case 'profile':
            if (!isLoggedIn()) { navigateTo('auth'); return; }
            if (typeof loadProfileScreen === 'function') loadProfileScreen();
            break;
            
        case 'settings':
            if (!isLoggedIn()) { navigateTo('auth'); return; }
            if (typeof loadSettingsScreen === 'function') loadSettingsScreen();
            break;
            
        case 'notifications':
            if (!isLoggedIn()) { navigateTo('auth'); return; }
            if (typeof loadNotificationsScreen === 'function') loadNotificationsScreen();
            break;
            
        case 'transactions':
            if (!isLoggedIn()) { navigateTo('auth'); return; }
            if (typeof loadStoreTransactions === 'function') loadStoreTransactions();
            break;
            
        case 'leaderboard':
            if (typeof loadLeaderboard === 'function') loadLeaderboard();
            break;
            
        case 'analytics':
            if (!isLoggedIn()) { navigateTo('auth'); return; }
            if (typeof loadAnalytics === 'function') loadAnalytics();
            break;
            
        case 'customerservice':
            if (!isLoggedIn()) { navigateTo('auth'); return; }
            if (typeof loadCustomerServicePanel === 'function') loadCustomerServicePanel();
            break;
            
        case 'disputes-manage':
            if (!isLoggedIn()) { navigateTo('auth'); return; }
            if (typeof loadDisputesManagement === 'function') loadDisputesManagement();
            break;
            
        case 'vip':
            if (!isLoggedIn()) { navigateTo('auth'); return; }
            if (typeof loadVIPPage === 'function') loadVIPPage();
            break;
            
        case 'hall-of-fame':
            if (typeof loadHallOfFame === 'function') loadHallOfFame();
            break;
            
        case 'flash-campaigns':
            if (typeof loadFlashCampaigns === 'function') loadFlashCampaigns();
            break;
            
        case 'influencer-apply':
            if (!isLoggedIn()) { navigateTo('auth'); return; }
            if (typeof loadInfluencerApplication === 'function') loadInfluencerApplication();
            break;
            
        case 'recruit-affiliates':
            if (!isLoggedIn()) { navigateTo('auth'); return; }
            if (typeof loadRecruitAffiliates === 'function') loadRecruitAffiliates();
            break;
            
        default:
            console.warn('⚠️ Unknown screen:', screen);
            break;
    }
}

// =====================
// DEEP LINK DETECTION - Runs immediately
// =====================
(function detectDeepLinks() {
    const path = window.location.pathname;
    console.log('🔍 Detecting deep links for path:', path);
    
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
// INITIAL SCREEN - Runs when page loads
// =====================
window.addEventListener('load', () => {
    console.log('📱 Page loaded, determining initial screen...');
    
    const path = window.location.pathname;
    const hash = window.location.hash.replace('#', '');
    const forceStore = sessionStorage.getItem('force_dropship_store');
    const forceProduct = sessionStorage.getItem('force_product_detail');
    const storeUsername = sessionStorage.getItem('store_view');
    const deepLinkProduct = sessionStorage.getItem('deep_link_product');
    
    console.log('   Path:', path);
    console.log('   Force store:', forceStore);
    console.log('   Force product:', forceProduct);
    console.log('   Store username:', storeUsername);
    console.log('   Product ID:', deepLinkProduct);
    
    let initialScreen = 'onboarding';
    
    // PRIORITY: Deep links override everything
    if (forceStore === 'true' && storeUsername) {
        console.log('🏪 PRIORITY: Store deep link');
        initialScreen = 'dropship-store';
    } else if (forceProduct === 'true' && deepLinkProduct) {
        console.log('🛍️ PRIORITY: Product deep link');
        initialScreen = 'product-detail';
    } else if (hash) {
        initialScreen = hash;
    }
    
    // Only go to home if logged in AND no deep link
    const publicScreens = ['dropship-store', 'product-detail', 'marketplace', 'sponsored', 'hall-of-fame', 'leaderboard'];
    if (!publicScreens.includes(initialScreen) && !forceStore && !forceProduct) {
        if (isLoggedIn() && ['onboarding', 'auth'].includes(initialScreen)) {
            initialScreen = 'home';
        }
    }
    
    console.log('🎯 Final initial screen:', initialScreen);
    
    // Navigate with a small delay to ensure DOM is ready
    setTimeout(() => {
        navigateTo(initialScreen);
    }, 200);
});

// =====================
// HANDLE DEEP LINKS AFTER AUTH
// =====================
function handleDeepLinksAfterAuth() {
    const forceStore = sessionStorage.getItem('force_dropship_store');
    const forceProduct = sessionStorage.getItem('force_product_detail');
    const storeUsername = sessionStorage.getItem('store_view');
    const deepLinkProduct = sessionStorage.getItem('deep_link_product');
    
    console.log('🔗 Handling deep links after auth...');
    
    if (forceStore === 'true' && storeUsername) {
        sessionStorage.removeItem('force_dropship_store');
        sessionStorage.removeItem('store_view');
        navigateTo('dropship-store', { username: storeUsername, isPublic: true });
    } else if (forceProduct === 'true' && deepLinkProduct) {
        sessionStorage.removeItem('force_product_detail');
        navigateTo('product-detail', { productId: deepLinkProduct });
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

console.log('✅ router.js loaded - ONESHOPLIFY Router Ready');
