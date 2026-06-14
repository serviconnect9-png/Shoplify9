// router.js - COMPLETE FINAL VERSION
// ONESHOPLIFY Enterprise Router
// Subdomain Stores | Deep Links | All Screens | Pending Screen Restore

let currentScreen = 'onboarding';
let screenHistory = [];

// =====================
// DIRECT NAVIGATION
// =====================
function goToAccountType() {
    console.log('📝 Create Account clicked - direct navigation');
    hideAllScreens();
    showScreen('screen-account-type');
    window.location.hash = 'account-type';
    currentScreen = 'account-type';
}

function hideAllScreens() {
    document.querySelectorAll('.screen').forEach(function(s) {
        s.classList.add('hidden');
    });
}

function showScreen(id) {
    var screen = document.getElementById(id);
    if (screen) {
        screen.classList.remove('hidden');
    }
}

function navigateTo(screen, data) {
    console.log('🧭 navigateTo:', screen, data ? JSON.stringify(data).substring(0, 100) : '');
    
    if (screen === currentScreen && screen !== 'product-detail' && screen !== 'dropship-store') {
        return;
    }
    
    var publicScreens = [
        'onboarding', 'auth', 'account-type', 'setup-credentials',
        'dropship-store', 'product-detail', 'sponsored', 'marketplace'
    ];
    
    if (publicScreens.indexOf(screen) === -1 && !isLoggedIn()) {
        console.log('🔒 Auth required, saving pending:', screen);
        sessionStorage.setItem('pending_screen', screen);
        if (data) {
            sessionStorage.setItem('pending_data', JSON.stringify(data));
        }
        screen = 'auth';
    }
    
    screenHistory.push(currentScreen);
    hideAllScreens();
    
    var targetId = 'screen-' + screen;
    var targetScreen = document.getElementById(targetId);
    
    if (targetScreen) {
        targetScreen.classList.remove('hidden');
        currentScreen = screen;
        window.location.hash = screen;
        
        if (data) {
            sessionStorage.setItem('screen_data_' + screen, JSON.stringify(data));
        }
        
        handleScreenLoad(screen, data);
        
        var appEl = document.getElementById('app');
        if (appEl) {
            appEl.scrollTop = 0;
        }
        
        console.log('✅ Screen loaded:', screen);
    } else {
        console.error('❌ Screen element not found:', targetId);
        hideAllScreens();
        var homeScreen = document.getElementById('screen-home');
        if (homeScreen) {
            homeScreen.classList.remove('hidden');
            currentScreen = 'home';
            window.location.hash = 'home';
            if (typeof loadHomeScreen === 'function') {
                loadHomeScreen();
            }
        }
    }
}

function goBack() {
    var previousScreen = screenHistory.pop() || 'home';
    console.log('⬅️ Going back to:', previousScreen);
    navigateTo(previousScreen);
}

// =====================
// HANDLE SCREEN LOAD
// =====================
function handleScreenLoad(screen, data) {
    console.log('📄 handleScreenLoad:', screen);
    
    switch(screen) {
        // ========== MAIN SCREENS ==========
        case 'home':
            if (typeof loadHomeScreen === 'function') {
                loadHomeScreen();
            } else {
                console.error('❌ loadHomeScreen missing');
            }
            checkPendingScreen();
            break;
            
        case 'marketplace':
            if (typeof loadMarketplace === 'function') {
                loadMarketplace();
            }
            break;
            
        case 'product-detail':
            if (!data || !data.productId) {
                var pid = sessionStorage.getItem('deep_link_product');
                if (pid) {
                    console.log('🔗 Loading product from deep link:', pid);
                    data = { productId: pid };
                }
            }
            if (typeof loadProductDetail === 'function') {
                loadProductDetail(data);
            } else {
                var pc = document.getElementById('product-detail-content');
                if (pc) {
                    pc.innerHTML = '<p style="text-align:center;padding:40px;">Loading product...</p>';
                }
            }
            break;
            
        case 'sponsored':
            if (typeof loadSponsoredProductsPage === 'function') {
                loadSponsoredProductsPage();
            }
            break;
            
        case 'checkout':
            if (typeof loadCheckout === 'function') {
                loadCheckout();
            }
            break;
            
        case 'orders':
            if (typeof loadOrdersScreen === 'function') {
                loadOrdersScreen();
            }
            break;
            
        case 'wallet':
            if (typeof loadWalletScreen === 'function') {
                loadWalletScreen();
            }
            break;
            
        // ========== DROPSHIP SCREENS ==========
        case 'dropship':
            console.log('📦 Loading dropship dashboard...');
            if (typeof loadDropshipDashboard === 'function') {
                loadDropshipDashboard();
            } else if (typeof window.loadDropshipDashboard === 'function') {
                window.loadDropshipDashboard();
            } else {
                var dc = document.getElementById('dropship-content');
                if (dc) {
                    dc.innerHTML = '<p style="text-align:center;padding:40px;">Loading dropship dashboard...</p>';
                }
                setTimeout(function() {
                    if (typeof loadDropshipDashboard === 'function') {
                        loadDropshipDashboard();
                    } else if (typeof window.loadDropshipDashboard === 'function') {
                        window.loadDropshipDashboard();
                    }
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
                } else {
                    var dsc = document.getElementById('dropship-store-content');
                    if (dsc) {
                        dsc.innerHTML = '<p style="text-align:center;padding:40px;">Loading store...</p>';
                    }
                }
            } else if (data && data.username) {
                if (typeof loadPublicDropshipStore === 'function') {
                    loadPublicDropshipStore(data.username);
                }
            } else if (typeof loadDropshipStore === 'function') {
                loadDropshipStore(data);
            } else {
                var dsc2 = document.getElementById('dropship-store-content');
                if (dsc2) {
                    dsc2.innerHTML = '<p style="text-align:center;padding:40px;">Loading store...</p>';
                }
            }
            break;
            
        // ========== MERCHANT SCREENS ==========
        case 'merchant':
            if (typeof loadMerchantDashboard === 'function') {
                loadMerchantDashboard();
            } else {
                console.error('❌ loadMerchantDashboard missing');
            }
            break;
            
        case 'store-setup':
            if (typeof loadStoreSetup === 'function') {
                loadStoreSetup();
            }
            break;
            
        case 'add-product':
            if (typeof loadAddProductForm === 'function') {
                loadAddProductForm();
            }
            break;
            
        // ========== USER SCREENS ==========
        case 'profile':
            if (typeof loadProfileScreen === 'function') {
                loadProfileScreen();
            }
            break;
            
        case 'settings':
            if (typeof loadSettingsScreen === 'function') {
                loadSettingsScreen();
            }
            break;
            
        case 'notifications':
            if (typeof loadNotificationsScreen === 'function') {
                loadNotificationsScreen();
            }
            break;
            
        // ========== SERVICE SCREENS ==========
        case 'customerservice':
            console.log('🎧 Loading customer service...');
            if (typeof loadCustomerServicePanel === 'function') {
                loadCustomerServicePanel();
            } else {
                var csc = document.getElementById('cs-content');
                if (csc) {
                    csc.innerHTML = '<p style="text-align:center;padding:40px;">Loading customer service...</p>';
                }
            }
            break;
            
        case 'disputes-manage':
            if (typeof loadDisputesManagement === 'function') {
                loadDisputesManagement();
            }
            break;
            
        // ========== COMMUNITY SCREENS ==========
        case 'leaderboard':
            if (typeof loadLeaderboard === 'function') {
                loadLeaderboard();
            }
            break;
            
        case 'analytics':
            if (typeof loadAnalytics === 'function') {
                loadAnalytics();
            }
            break;
            
        case 'hall-of-fame':
            if (typeof loadHallOfFame === 'function') {
                loadHallOfFame();
            }
            break;
            
        case 'advertisers':
            if (typeof loadAdvertisers === 'function') {
                loadAdvertisers();
            }
            break;
            
        // ========== INFLUENCER SCREENS ==========
        case 'influencer-dashboard':
            console.log('📊 Loading influencer dashboard...');
            if (typeof loadInfluencerDashboard === 'function') {
                loadInfluencerDashboard();
            } else {
                var idc = document.getElementById('influencer-dashboard-content');
                if (idc) {
                    idc.innerHTML = '<p style="text-align:center;padding:40px;">Loading...</p>';
                }
            }
            break;
            
        case 'influencer-apply':
            if (typeof loadInfluencerApplication === 'function') {
                loadInfluencerApplication();
            }
            break;
            
        case 'recruit-affiliates':
            if (typeof loadRecruitAffiliates === 'function') {
                loadRecruitAffiliates();
            }
            break;
            
        // ========== OTHER SCREENS ==========
        case 'transactions':
            if (typeof loadStoreTransactions === 'function') {
                loadStoreTransactions();
            }
            break;
            
        case 'vip':
            if (typeof loadVIPPage === 'function') {
                loadVIPPage();
            }
            break;
            
        case 'flash-campaigns':
            if (typeof loadFlashCampaigns === 'function') {
                loadFlashCampaigns();
            }
            break;
            
        default:
            console.warn('⚠️ Unknown screen:', screen);
            break;
    }
}

// =====================
// CHECK PENDING SCREEN
// =====================
function checkPendingScreen() {
    var pendingScreen = sessionStorage.getItem('pending_screen');
    if (pendingScreen) {
        console.log('🔙 Returning to pending screen:', pendingScreen);
        var pendingData = sessionStorage.getItem('pending_data');
        sessionStorage.removeItem('pending_screen');
        sessionStorage.removeItem('pending_data');
        
        setTimeout(function() {
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
    var hostname = window.location.hostname;
    var path = window.location.pathname;
    
    console.log('🔍 Hostname:', hostname, '| Path:', path);
    
    // =====================
    // SUBDOMAIN STORE DETECTION
    // =====================
    
    // Check for shoplify9.vercel.app subdomain
    if (hostname.indexOf('.shoplify9.vercel.app') > 0) {
        var subdomain = hostname.replace('.shoplify9.vercel.app', '');
        if (subdomain && subdomain !== 'www' && subdomain !== 'shoplify9') {
            console.log('🏪 SUBDOMAIN STORE DETECTED:', subdomain);
            sessionStorage.setItem('store_view', subdomain);
            sessionStorage.setItem('deep_link_type', 'store');
            sessionStorage.setItem('skip_onboarding', 'true');
            sessionStorage.setItem('force_dropship_store', 'true');
            return;
        }
    }
    
    // Check generic subdomain
    var parts = hostname.split('.');
    if (parts.length >= 3 && parts[0] !== 'www') {
        var knownSubdomains = ['api', 'app', 'admin', 'mail', 'cdn', 'static', 'assets', 'shoplify9'];
        if (knownSubdomains.indexOf(parts[0]) === -1) {
            console.log('🏪 GENERIC SUBDOMAIN STORE:', parts[0]);
            sessionStorage.setItem('store_view', parts[0]);
            sessionStorage.setItem('deep_link_type', 'store');
            sessionStorage.setItem('skip_onboarding', 'true');
            sessionStorage.setItem('force_dropship_store', 'true');
            return;
        }
    }
    
    // =====================
    // PATH DETECTION
    // =====================
    
    // Store: /store/:username
    var storeMatch = path.match(/^\/store\/(.+)/);
    if (storeMatch) {
        console.log('🏪 STORE PATH:', storeMatch[1]);
        sessionStorage.setItem('store_view', storeMatch[1]);
        sessionStorage.setItem('deep_link_type', 'store');
        sessionStorage.setItem('skip_onboarding', 'true');
        sessionStorage.setItem('force_dropship_store', 'true');
    }
    
    // Product: /p/:productId
    var productMatch = path.match(/^\/p\/(.+)/);
    if (productMatch) {
        console.log('🛍️ PRODUCT:', productMatch[1]);
        sessionStorage.setItem('deep_link_product', productMatch[1]);
        sessionStorage.setItem('deep_link_type', 'product');
        sessionStorage.setItem('skip_onboarding', 'true');
        sessionStorage.setItem('force_product_detail', 'true');
    }
    
    // Affiliate: /r/:affiliateId/:productId
    var affiliateMatch = path.match(/^\/r\/([^\/]+)\/([^\/]+)/);
    if (affiliateMatch) {
        console.log('📢 AFFILIATE:', affiliateMatch[1], affiliateMatch[2]);
        sessionStorage.setItem('affiliate_click', JSON.stringify({
            affiliateId: affiliateMatch[1],
            productId: affiliateMatch[2]
        }));
        sessionStorage.setItem('deep_link_product', affiliateMatch[2]);
        sessionStorage.setItem('deep_link_type', 'affiliate');
        sessionStorage.setItem('skip_onboarding', 'true');
        sessionStorage.setItem('force_product_detail', 'true');
    }
    
    // Referral: ?ref=code
    var urlParams = new URLSearchParams(window.location.search);
    var refCode = urlParams.get('ref');
    if (refCode) {
        console.log('👥 REFERRAL:', refCode);
        sessionStorage.setItem('referralCode', refCode);
    }
})();

// =====================
// START THE APP
// =====================
(function() {
    var hostname = window.location.hostname;
    var path = window.location.pathname;
    var forceStore = sessionStorage.getItem('force_dropship_store');
    var forceProduct = sessionStorage.getItem('force_product_detail');
    var storeUsername = sessionStorage.getItem('store_view');
    var productId = sessionStorage.getItem('deep_link_product');
    var pendingScreen = sessionStorage.getItem('pending_screen');
    
    console.log('🚀 Starting app...');
    console.log('   URL:', hostname + path);
    console.log('   Store:', storeUsername, '| Product:', productId);
    
    // Hide onboarding for deep links
    if (sessionStorage.getItem('skip_onboarding') === 'true') {
        var onboardingScreen = document.getElementById('screen-onboarding');
        if (onboardingScreen) {
            onboardingScreen.classList.add('hidden');
        }
    }
    
    // =====================
    // PRIORITY 1: SUBDOMAIN STORE
    // =====================
    
    // Check shoplify9.vercel.app subdomain
    if (hostname.indexOf('.shoplify9.vercel.app') > 0) {
        var subdomain = hostname.replace('.shoplify9.vercel.app', '');
        if (subdomain && subdomain !== 'www' && subdomain !== 'shoplify9') {
            console.log('🏪 SUBDOMAIN STORE - Loading:', subdomain);
            hideAllScreens();
            showScreen('screen-dropship-store');
            currentScreen = 'dropship-store';
            window.location.hash = 'dropship-store';
            
            if (typeof loadPublicDropshipStore === 'function') {
                loadPublicDropshipStore(subdomain);
            } else if (typeof window.loadPublicDropshipStore === 'function') {
                window.loadPublicDropshipStore(subdomain);
            }
            return;
        }
    }
    
    // Check generic subdomain
    var parts = hostname.split('.');
    if (parts.length >= 3 && parts[0] !== 'www') {
        var knownSubdomains = ['api', 'app', 'admin', 'mail', 'cdn', 'static', 'assets', 'shoplify9'];
        if (knownSubdomains.indexOf(parts[0]) === -1) {
            console.log('🏪 GENERIC SUBDOMAIN - Loading:', parts[0]);
            hideAllScreens();
            showScreen('screen-dropship-store');
            currentScreen = 'dropship-store';
            window.location.hash = 'dropship-store';
            
            if (typeof loadPublicDropshipStore === 'function') {
                loadPublicDropshipStore(parts[0]);
            } else if (typeof window.loadPublicDropshipStore === 'function') {
                window.loadPublicDropshipStore(parts[0]);
            }
            return;
        }
    }
    
    // =====================
    // PRIORITY 2: PATH STORE
    // =====================
    if ((forceStore === 'true' && storeUsername) || path.match(/^\/store\/(.+)/)) {
        var username = storeUsername;
        if (!username) {
            var sm = path.match(/^\/store\/(.+)/);
            if (sm) username = sm[1];
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
    // PRIORITY 3: PRODUCT
    // =====================
    if ((forceProduct === 'true' && productId) || path.match(/^\/p\/(.+)/) || path.match(/^\/r\/([^\/]+)\/([^\/]+)/)) {
        var pid = productId;
        if (!pid) {
            var pm = path.match(/^\/p\/(.+)/);
            if (pm) pid = pm[1];
        }
        if (!pid) {
            var am = path.match(/^\/r\/([^\/]+)\/([^\/]+)/);
            if (am) pid = am[2];
        }
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
    // PRIORITY 4: NORMAL FLOW
    // =====================
    if (isLoggedIn()) {
        hideAllScreens();
        
        if (pendingScreen) {
            sessionStorage.removeItem('pending_screen');
            var pendingData = sessionStorage.getItem('pending_data');
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
            if (typeof loadHomeScreen === 'function') {
                loadHomeScreen();
            }
        }
    }
})();

// =====================
// HANDLE DEEP LINKS AFTER AUTH
// =====================
function handleDeepLinksAfterAuth() {
    var linkType = sessionStorage.getItem('deep_link_type');
    var forceProduct = sessionStorage.getItem('force_product_detail');
    var forceStore = sessionStorage.getItem('force_dropship_store');
    var storeUsername = sessionStorage.getItem('store_view');
    
    console.log('🔗 Handling deep links after auth...');
    console.log('   Type:', linkType, '| Store:', storeUsername);
    
    if (forceStore === 'true' && storeUsername) {
        sessionStorage.removeItem('deep_link_type');
        sessionStorage.removeItem('force_dropship_store');
        sessionStorage.removeItem('store_view');
        console.log('🏪 Navigating to store:', storeUsername);
        navigateTo('dropship-store', { username: storeUsername, isPublic: true });
    } else if (forceProduct === 'true') {
        var productId = sessionStorage.getItem('deep_link_product');
        if (productId) {
            if (linkType === 'affiliate') {
                var ad = JSON.parse(sessionStorage.getItem('affiliate_click') || '{}');
                if (ad.affiliateId && ad.productId && typeof trackAffiliateClick === 'function') {
                    trackAffiliateClick(ad.affiliateId, ad.productId);
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
window.addEventListener('popstate', function() {
    var hash = window.location.hash.replace('#', '');
    if (hash && hash !== currentScreen) {
        navigateTo(hash);
    }
});

window.addEventListener('hashchange', function() {
    var hash = window.location.hash.replace('#', '');
    if (hash && hash !== currentScreen) {
        navigateTo(hash);
    }
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
