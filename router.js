// router.js - COMPLETE FINAL VERSION (All Routes, Deep Links, Dropship Store, Affiliate Links)

let currentScreen = 'onboarding';
let screenHistory = [];

// =====================
// NAVIGATION
// =====================
function navigateTo(screen, data = null) {
    console.log('🧭 Navigating to:', screen, data ? JSON.stringify(data).substring(0, 100) : '');
    
    // Don't navigate to same screen (except product-detail and dropship-store which can reload)
    if (screen === currentScreen && screen !== 'product-detail' && screen !== 'dropship-store') return;
    
    // Public screens that don't require authentication
    const publicScreens = ['onboarding', 'auth', 'account-type', 'setup-credentials', 'dropship-store', 'product-detail', 'sponsored'];
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
        const appEl = document.getElementById('app');
        if (appEl) appEl.scrollTop = 0;
    } else {
        console.error('❌ Screen not found:', screen);
        // Try to go to home as fallback
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
// SCREEN LOAD HANDLER
// =====================
function handleScreenLoad(screen, data) {
    console.log('📄 Loading screen:', screen);
    
    switch(screen) {
        // ========== MAIN SCREENS ==========
        case 'home':
            if (typeof loadHomeScreen === 'function') loadHomeScreen();
            else document.getElementById('home-content') && (document.getElementById('home-content').innerHTML = '<p style="text-align:center;padding:40px;">Loading...</p>');
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
                }
            }
            if (typeof loadProductDetail === 'function') loadProductDetail(data);
            else console.error('❌ loadProductDetail not found');
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
            
        // ========== AFFILIATE SCREENS ==========
        case 'affiliate':
            if (typeof loadAffiliateDashboard === 'function') loadAffiliateDashboard();
            else { console.error('❌ loadAffiliateDashboard not found'); document.getElementById('affiliate-content').innerHTML = '<p style="text-align:center;padding:40px;">Loading...</p>'; }
            break;
            
        case 'advertisers':
            if (typeof loadAdvertisers === 'function') loadAdvertisers();
            break;
            
        case 'affiliate-install':
            if (typeof loadAffiliateInstall === 'function') loadAffiliateInstall();
            break;
            
        // ========== MERCHANT SCREENS ==========
        case 'merchant':
            if (typeof loadMerchantDashboard === 'function') loadMerchantDashboard();
            else { console.error('❌ loadMerchantDashboard not found'); document.getElementById('merchant-content').innerHTML = '<p style="text-align:center;padding:40px;">Loading...</p>'; }
            break;
            
        case 'store-setup':
            if (typeof loadStoreSetup === 'function') loadStoreSetup();
            break;
            
        case 'add-product':
            if (typeof loadAddProductForm === 'function') loadAddProductForm();
            break;
            
        // ========== DROPSHIP SCREENS ==========
        case 'dropship':
            if (typeof loadDropshipDashboard === 'function') loadDropshipDashboard();
            else { console.error('❌ loadDropshipDashboard not found'); document.getElementById('dropship-content').innerHTML = '<p style="text-align:center;padding:40px;">Loading...</p>'; }
            break;
            
        case 'dropship-store':
            console.log('🏪 Loading dropship store...');
            console.log('   Data:', data);
            console.log('   isPublic:', data?.isPublic);
            console.log('   username:', data?.username);
            
            // Check for public store view
            if (data && data.isPublic && data.username) {
                console.log('🏪 Loading PUBLIC store for:', data.username);
                if (typeof loadPublicDropshipStore === 'function') {
                    loadPublicDropshipStore(data.username);
                } else {
                    console.error('❌ loadPublicDropshipStore not found');
                    const container = document.getElementById('dropship-store-content');
                    if (container) container.innerHTML = '<p style="text-align:center;padding:40px;">Error loading public store</p>';
                }
            } else if (data && data.username) {
                // Store with username but maybe not marked as public
                console.log('🏪 Loading store for username:', data.username);
                if (typeof loadPublicDropshipStore === 'function') {
                    loadPublicDropshipStore(data.username);
                } else if (typeof loadDropshipStore === 'function') {
                    loadDropshipStore(data);
                }
            } else if (typeof loadDropshipStore === 'function') {
                // Owner viewing their own store
                loadDropshipStore(data);
            } else {
                console.error('❌ No dropship store function found');
                const container = document.getElementById('dropship-store-content');
                if (container) container.innerHTML = '<p style="text-align:center;padding:40px;">Store not available</p>';
            }
            break;
            
        case 'recruit-affiliates':
            if (typeof loadRecruitAffiliates === 'function') loadRecruitAffiliates();
            else { console.error('❌ loadRecruitAffiliates not found'); document.getElementById('recruit-affiliates-content').innerHTML = '<p style="text-align:center;padding:40px;">Loading...</p>'; }
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
            
        case 'transactions':
            if (typeof loadStoreTransactions === 'function') loadStoreTransactions();
            break;
            
        // ========== COMMUNITY SCREENS ==========
        case 'leaderboard':
            if (typeof loadLeaderboard === 'function') loadLeaderboard();
            else { console.error('❌ loadLeaderboard not found'); document.getElementById('leaderboard-content').innerHTML = '<p style="text-align:center;padding:40px;">Loading...</p>'; }
            break;
            
        case 'analytics':
            if (typeof loadAnalytics === 'function') loadAnalytics();
            break;
            
        case 'hall-of-fame':
            if (typeof loadHallOfFame === 'function') loadHallOfFame();
            else { console.error('❌ loadHallOfFame not found'); document.getElementById('hall-fame-content').innerHTML = '<p style="text-align:center;padding:40px;">Loading...</p>'; }
            break;
            
        // ========== ADMIN SCREENS ==========
        case 'customerservice':
            if (typeof loadCustomerServicePanel === 'function') loadCustomerServicePanel();
            break;
            
        case 'disputes-manage':
            if (typeof loadDisputesManagement === 'function') loadDisputesManagement();
            break;
            
        case 'vip':
            if (typeof loadVIPPage === 'function') loadVIPPage();
            break;
            
        case 'flash-campaigns':
            if (typeof loadFlashCampaigns === 'function') loadFlashCampaigns();
            break;
            
        // ========== INFLUENCER SCREENS ==========
        case 'influencer-apply':
            if (typeof loadInfluencerApplication === 'function') loadInfluencerApplication();
            break;
            
        default:
            console.warn('⚠️ Unknown screen:', screen);
            // Fallback to home
            if (typeof loadHomeScreen === 'function') loadHomeScreen();
            break;
    }
}

// =====================
// DEEP LINK DETECTION - Runs immediately on page load
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
        sessionStorage.setItem('affiliate_click', JSON.stringify({ affiliateId, productId }));
        sessionStorage.setItem('deep_link_product', productId);
        sessionStorage.setItem('deep_link_type', 'affiliate');
        sessionStorage.setItem('force_product_detail', 'true');
    }
    
    // Store URL: /store/:username
    const storeMatch = path.match(/^\/store\/(.+)/);
    if (storeMatch) {
        const username = storeMatch[1];
        console.log('🏪 STORE LINK DETECTED');
        console.log('   Username:', username);
        sessionStorage.setItem('store_view', username);
        sessionStorage.setItem('deep_link_type', 'store');
        sessionStorage.setItem('force_dropship_store', 'true');
    }
    
    // Product URL: /p/:productId
    const productMatch = path.match(/^\/p\/(.+)/);
    if (productMatch) {
        const productId = productMatch[1];
        console.log('🛍️ PRODUCT LINK DETECTED');
        console.log('   Product ID:', productId);
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
// INITIAL SCREEN DETERMINATION - Runs when page loads
// =====================
window.addEventListener('load', () => {
    console.log('📱 Window loaded, determining initial screen...');
    
    const path = window.location.pathname;
    const hash = window.location.hash.replace('#', '');
    const forceProduct = sessionStorage.getItem('force_product_detail');
    const forceStore = sessionStorage.getItem('force_dropship_store');
    const deepLinkType = sessionStorage.getItem('deep_link_type');
    const deepLinkProduct = sessionStorage.getItem('deep_link_product');
    const storeUsername = sessionStorage.getItem('store_view');
    
    let initialScreen = 'onboarding';
    
    // PRIORITY 1: Dropship Store deep link
    if (forceStore === 'true' && storeUsername) {
        console.log('🏪 Store deep link detected - going to dropship-store');
        initialScreen = 'dropship-store';
    }
    // PRIORITY 2: Affiliate deep link
    else if (deepLinkType === 'affiliate' && deepLinkProduct && forceProduct === 'true') {
        console.log('📢 Affiliate deep link - product-detail');
        initialScreen = 'product-detail';
    }
    // PRIORITY 3: Product deep link
    else if (deepLinkType === 'product' && deepLinkProduct && forceProduct === 'true') {
        console.log('🛍️ Product deep link - product-detail');
        initialScreen = 'product-detail';
    }
    // PRIORITY 4: Direct URL patterns
    else if (path.match(/^\/store\/(.+)/)) {
        console.log('🏪 Direct store URL match');
        initialScreen = 'dropship-store';
    }
    else if (path.match(/^\/r\/([^\/]+)\/([^\/]+)/)) {
        console.log('📢 Direct affiliate URL match');
        initialScreen = 'product-detail';
    }
    else if (path.match(/^\/p\/(.+)/)) {
        console.log('🛍️ Direct product URL match');
        initialScreen = 'product-detail';
    }
    // PRIORITY 5: Hash-based navigation
    else if (hash) {
        initialScreen = hash;
    }
    
    // Only redirect to home if no deep link and user is logged in
    if (!forceProduct && !forceStore && !deepLinkType && !path.match(/^\/(store|p|r)\//)) {
        if (isLoggedIn() && ['onboarding', 'auth'].includes(initialScreen)) {
            console.log('👤 User already logged in, going to home');
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
// HANDLE DEEP LINKS AFTER AUTHENTICATION
// =====================
function handleDeepLinksAfterAuth() {
    const linkType = sessionStorage.getItem('deep_link_type');
    const forceProduct = sessionStorage.getItem('force_product_detail');
    const forceStore = sessionStorage.getItem('force_dropship_store');
    const storeUsername = sessionStorage.getItem('store_view');
    
    console.log('🔗 Handling deep links after auth...');
    console.log('   Type:', linkType);
    console.log('   Store username:', storeUsername);
    console.log('   Force product:', forceProduct);
    console.log('   Force store:', forceStore);
    
    // PRIORITY 1: Store deep link
    if (forceStore === 'true' && storeUsername) {
        sessionStorage.removeItem('deep_link_type');
        sessionStorage.removeItem('force_dropship_store');
        sessionStorage.removeItem('store_view');
        console.log('🏪 Navigating to public store:', storeUsername);
        navigateTo('dropship-store', { username: storeUsername, isPublic: true });
        return;
    }
    
    // PRIORITY 2: Product/Affiliate deep link
    if ((linkType === 'affiliate' || linkType === 'product') && forceProduct === 'true') {
        const productId = sessionStorage.getItem('deep_link_product');
        if (productId) {
            // Track affiliate click if applicable
            if (linkType === 'affiliate') {
                const data = JSON.parse(sessionStorage.getItem('affiliate_click') || '{}');
                if (data.affiliateId && data.productId && typeof trackAffiliateClick === 'function') {
                    trackAffiliateClick(data.affiliateId, data.productId);
                }
                sessionStorage.removeItem('affiliate_click');
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
// BROWSER BACK/FORWARD HANDLER
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

console.log('✅ router.js fully loaded - ONESHOPLIFY Router Ready');
console.log('   Available screens: home, marketplace, product-detail, sponsored, checkout, orders, wallet, affiliate, advertisers, affiliate-install, merchant, store-setup, add-product, dropship, dropship-store, recruit-affiliates, profile, settings, notifications, transactions, leaderboard, analytics, hall-of-fame, customerservice, disputes-manage, vip, flash-campaigns, influencer-apply');
