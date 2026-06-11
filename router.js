// router.js - COMPLETE FINAL VERSION (Fixed Affiliate Deep Links, All Routes)

let currentScreen = 'onboarding';
let screenHistory = [];

// =====================
// NAVIGATION
// =====================
function navigateTo(screen, data = null) {
    console.log('🧭 Navigating to:', screen, data ? JSON.stringify(data).substring(0, 100) : '');
    
    // Don't navigate to same screen
    if (screen === currentScreen && screen !== 'product-detail') return;
    
    // Check auth for protected screens
    const publicScreens = ['onboarding', 'auth', 'account-type', 'setup-credentials', 'dropship-store'];
    if (!publicScreens.includes(screen) && !isLoggedIn()) {
        console.log('🔒 Not authenticated, redirecting to auth');
        screen = 'auth';
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
        
        // Update URL hash
        window.location.hash = screen;
        
        // Store data if provided
        if (data) {
            sessionStorage.setItem(`screen_data_${screen}`, JSON.stringify(data));
        }
        
        // Load screen content
        handleScreenLoad(screen, data);
        
        // Scroll to top
        document.getElementById('app').scrollTop = 0;
    } else {
        console.error('❌ Screen not found:', screen);
        navigateTo('home');
    }
}

function goBack() {
    const previousScreen = screenHistory.pop() || 'home';
    console.log('⬅️ Going back to:', previousScreen);
    navigateTo(previousScreen);
}

// =====================
// SCREEN LOAD HANDLER
// =====================
function handleScreenLoad(screen, data) {
    console.log('📄 Loading screen:', screen);
    
    switch(screen) {
        case 'home':
            if (typeof loadHomeScreen === 'function') loadHomeScreen();
            break;
            
        case 'marketplace':
            if (typeof loadMarketplace === 'function') loadMarketplace();
            break;
            
        case 'product-detail':
            // Check for deep link product first
            if (!data || !data.productId) {
                const deepLinkProductId = sessionStorage.getItem('deep_link_product');
                if (deepLinkProductId) {
                    console.log('🔗 Loading product from deep link:', deepLinkProductId);
                    data = { productId: deepLinkProductId };
                    // Don't clear it yet - product-detail might need it again
                }
            }
            if (typeof loadProductDetail === 'function') {
                loadProductDetail(data);
            } else {
                console.error('❌ loadProductDetail not found');
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
            else console.error('❌ loadAffiliateDashboard not found');
            break;
            
        case 'advertisers':
            if (typeof loadAdvertisers === 'function') loadAdvertisers();
            break;
            
        case 'affiliate-install':
            if (typeof loadAffiliateInstall === 'function') loadAffiliateInstall();
            break;
            
        case 'merchant':
            if (typeof loadMerchantDashboard === 'function') loadMerchantDashboard();
            else console.error('❌ loadMerchantDashboard not found');
            break;
            
        case 'store-setup':
            if (typeof loadStoreSetup === 'function') loadStoreSetup();
            break;
            
        case 'add-product':
            if (typeof loadAddProductForm === 'function') loadAddProductForm();
            break;
            
        case 'dropship':
            if (typeof loadDropshipDashboard === 'function') loadDropshipDashboard();
            else console.error('❌ loadDropshipDashboard not found');
            break;
            
        case 'dropship-store':
            // Check if this is a public store view
            if (data && data.isPublic && data.username) {
                console.log('🏪 Loading public store for:', data.username);
                if (typeof loadPublicDropshipStore === 'function') {
                    loadPublicDropshipStore(data.username);
                } else {
                    console.error('❌ loadPublicDropshipStore not found');
                }
            } else if (typeof loadDropshipStore === 'function') {
                loadDropshipStore(data);
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
            else console.error('❌ loadLeaderboard not found');
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
            else console.error('❌ loadHallOfFame not found');
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
// DEEP LINK DETECTION (Runs on page load)
// =====================
(function detectDeepLinks() {
    const path = window.location.pathname;
    console.log('🔍 Checking path:', path);
    
    // Affiliate URL: /r/:affiliateId/:productId
    const affiliateMatch = path.match(/^\/r\/([^\/]+)\/([^\/]+)/);
    if (affiliateMatch) {
        const affiliateId = affiliateMatch[1];
        const productId = affiliateMatch[2];
        console.log('📢 AFFILIATE LINK DETECTED');
        console.log('   Affiliate ID:', affiliateId);
        console.log('   Product ID:', productId);
        
        // Store in sessionStorage
        sessionStorage.setItem('affiliate_click', JSON.stringify({ affiliateId, productId }));
        sessionStorage.setItem('deep_link_product', productId);
        sessionStorage.setItem('deep_link_type', 'affiliate');
        sessionStorage.setItem('force_product_detail', 'true');
    }
    
    // Store URL: /store/:username
    const storeMatch = path.match(/^\/store\/(.+)/);
    if (storeMatch) {
        const username = storeMatch[1];
        console.log('🏪 STORE LINK DETECTED:', username);
        sessionStorage.setItem('store_view', username);
        sessionStorage.setItem('deep_link_type', 'store');
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
    
    // Referral URL: ?ref=code
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    if (refCode) {
        console.log('👥 REFERRAL CODE:', refCode);
        sessionStorage.setItem('referralCode', refCode);
    }
})();

// =====================
// INITIAL SCREEN DETERMINATION
// =====================
window.addEventListener('load', () => {
    console.log('📱 Window loaded, determining initial screen...');
    
    const path = window.location.pathname;
    const hash = window.location.hash.replace('#', '');
    const forceProduct = sessionStorage.getItem('force_product_detail');
    const deepLinkType = sessionStorage.getItem('deep_link_type');
    const deepLinkProduct = sessionStorage.getItem('deep_link_product');
    
    let initialScreen = 'onboarding';
    
    // CHECK DEEP LINKS FIRST - They take priority
    if (deepLinkType === 'affiliate' && deepLinkProduct && forceProduct === 'true') {
        console.log('📢 Affiliate deep link - forcing product-detail');
        initialScreen = 'product-detail';
        // Don't clear force_product_detail yet - product-detail handler needs it
    } else if (deepLinkType === 'product' && deepLinkProduct && forceProduct === 'true') {
        console.log('🛍️ Product deep link - forcing product-detail');
        initialScreen = 'product-detail';
    } else if (deepLinkType === 'store') {
        console.log('🏪 Store deep link - going to dropship-store');
        initialScreen = 'dropship-store';
    } else if (path.match(/^\/r\/([^\/]+)\/([^\/]+)/)) {
        // Direct affiliate link match
        console.log('📢 Direct affiliate URL match - forcing product-detail');
        initialScreen = 'product-detail';
    } else if (path.match(/^\/p\/(.+)/)) {
        // Direct product link match
        console.log('🛍️ Direct product URL match - forcing product-detail');
        initialScreen = 'product-detail';
    } else if (path.match(/^\/store\/(.+)/)) {
        console.log('🏪 Direct store URL match - going to dropship-store');
        initialScreen = 'dropship-store';
    } else if (hash) {
        initialScreen = hash;
    }
    
    // If user is logged in and on auth/onboarding, go to home
    // BUT NOT if there's a deep link
    if (!forceProduct && !deepLinkType) {
        if (isLoggedIn() && ['onboarding', 'auth'].includes(initialScreen)) {
            console.log('👤 User logged in, going to home');
            initialScreen = 'home';
        }
    }
    
    console.log('🎯 Initial screen:', initialScreen);
    navigateTo(initialScreen);
});

// =====================
// HANDLE DEEP LINKS AFTER AUTH
// =====================
function handleDeepLinksAfterAuth() {
    const linkType = sessionStorage.getItem('deep_link_type');
    const forceProduct = sessionStorage.getItem('force_product_detail');
    
    console.log('🔗 Handling deep links after auth...');
    console.log('   Type:', linkType);
    console.log('   Force Product:', forceProduct);
    
    if (linkType === 'store') {
        const username = sessionStorage.getItem('store_view');
        if (username) {
            sessionStorage.removeItem('deep_link_type');
            sessionStorage.removeItem('store_view');
            console.log('🏪 Navigating to public store:', username);
            navigateTo('dropship-store', { username, isPublic: true });
        }
    } else if ((linkType === 'affiliate' || linkType === 'product') && forceProduct === 'true') {
        const productId = sessionStorage.getItem('deep_link_product');
        if (productId) {
            // Track affiliate click if applicable
            if (linkType === 'affiliate') {
                const data = JSON.parse(sessionStorage.getItem('affiliate_click') || '{}');
                if (data.affiliateId && data.productId) {
                    if (typeof trackAffiliateClick === 'function') {
                        trackAffiliateClick(data.affiliateId, data.productId);
                    }
                    sessionStorage.removeItem('affiliate_click');
                }
            }
            
            sessionStorage.removeItem('deep_link_type');
            sessionStorage.removeItem('force_product_detail');
            // Keep deep_link_product for product-detail handler
            
            console.log('🛍️ Navigating to product:', productId);
            navigateTo('product-detail', { productId });
        }
    }
}

// =====================
// POPSTATE HANDLER (Browser back/forward)
// =====================
window.addEventListener('popstate', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash && hash !== currentScreen) {
        console.log('🔙 Popstate navigating to:', hash);
        navigateTo(hash);
    }
});

// =====================
// HASH CHANGE HANDLER
// =====================
window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash && hash !== currentScreen) {
        console.log('🔗 Hash changed to:', hash);
        navigateTo(hash);
    }
});

console.log('✅ router.js loaded - ONESHOPLIFY Router Ready');
