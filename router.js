// router.js - COMPLETE FIXED VERSION (All screens properly routed)

let currentScreen = 'onboarding';
let screenHistory = [];

function navigateTo(screen, data = null) {
    // Prevent navigating to same screen
    if (screen === currentScreen && screen !== 'product-detail') return;
    
    // Check authentication for protected screens
    const publicScreens = ['onboarding', 'auth', 'account-type', 'setup-credentials', 'dropship-store'];
    if (!publicScreens.includes(screen) && !isLoggedIn()) {
        screen = 'auth';
    }
    
    // Add current screen to history
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
        
        // Handle screen load
        handleScreenLoad(screen, data);
        
        // Scroll to top
        document.getElementById('app').scrollTop = 0;
        
        // Update cart badge on all screens
        if (typeof updateCartBadge === 'function') {
            setTimeout(updateCartBadge, 100);
        }
        
        console.log(`📍 Navigated to: ${screen}`);
    } else {
        console.error(`❌ Screen not found: ${screen}`);
        navigateTo('home');
    }
}

function goBack() {
    const previousScreen = screenHistory.pop() || 'home';
    navigateTo(previousScreen);
}

function handleScreenLoad(screen, data) {
    console.log(`🔄 Loading screen: ${screen}`);
    
    switch(screen) {
        // =====================
        // AUTH SCREENS
        // =====================
        case 'onboarding':
            // No special loading needed
            break;
            
        case 'auth':
            // Clear form fields
            setTimeout(() => {
                const usernameEl = document.getElementById('auth-username');
                const passwordEl = document.getElementById('auth-password');
                if (usernameEl) usernameEl.value = '';
                if (passwordEl) passwordEl.value = '';
            }, 100);
            break;
            
        case 'account-type':
            // Reset selection
            APP.selectedAccountType = null;
            document.querySelectorAll('.account-type-card').forEach(c => c.classList.remove('selected'));
            break;
            
        case 'setup-credentials':
            // Populate country dropdown
            setTimeout(() => {
                if (typeof populateCountryDropdown === 'function') {
                    populateCountryDropdown();
                }
            }, 200);
            break;
            
        // =====================
        // MAIN SCREENS
        // =====================
        case 'home':
            if (typeof loadHomeScreen === 'function') {
                loadHomeScreen();
            }
            break;
            
        case 'marketplace':
            if (typeof loadMarketplace === 'function') {
                loadMarketplace();
            }
            break;
            
        case 'product-detail':
            if (typeof loadProductDetail === 'function') {
                // Get data from parameter or session storage
                const detailData = data || JSON.parse(sessionStorage.getItem('screen_data_product-detail') || 'null');
                loadProductDetail(detailData);
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
            
        // =====================
        // WALLET
        // =====================
        case 'wallet':
            if (typeof loadWalletScreen === 'function') {
                loadWalletScreen();
            } else {
                console.error('❌ loadWalletScreen function not found');
            }
            break;
            
        case 'transactions':
            if (typeof loadStoreTransactions === 'function') {
                loadStoreTransactions();
            } else {
                // Fallback: show transactions from wallet
                const container = document.getElementById('transactions-full');
                if (container && typeof loadRecentTransactions === 'function') {
                    loadRecentTransactions();
                }
            }
            break;
            
        // =====================
        // AFFILIATE SCREENS
        // =====================
        case 'affiliate':
            if (typeof loadAffiliateDashboard === 'function') {
                loadAffiliateDashboard();
            } else {
                console.error('❌ loadAffiliateDashboard not found');
                const container = document.getElementById('affiliate-content');
                if (container) container.innerHTML = '<p style="text-align:center;padding:40px;">Loading affiliate dashboard...</p>';
            }
            break;
            
        case 'advertisers':
            if (typeof loadAdvertisers === 'function') {
                loadAdvertisers();
            } else {
                console.error('❌ loadAdvertisers not found');
                const container = document.getElementById('advertisers-list');
                if (container) container.innerHTML = '<p style="text-align:center;padding:40px;">Loading advertisers...</p>';
            }
            break;
            
        case 'affiliate-install':
            if (typeof loadAffiliateInstall === 'function') {
                loadAffiliateInstall();
            } else {
                console.error('❌ loadAffiliateInstall not found');
                const container = document.getElementById('install-products');
                if (container) container.innerHTML = '<p style="text-align:center;padding:40px;">Loading products...</p>';
            }
            break;
            
        // =====================
        // MERCHANT SCREENS
        // =====================
        case 'merchant':
            if (typeof loadMerchantDashboard === 'function') {
                loadMerchantDashboard();
            } else {
                console.error('❌ loadMerchantDashboard not found');
                const container = document.getElementById('merchant-content');
                if (container) container.innerHTML = '<p style="text-align:center;padding:40px;">Loading merchant dashboard...</p>';
            }
            break;
            
        case 'store-setup':
            if (typeof loadStoreSetup === 'function') {
                loadStoreSetup();
            } else {
                console.error('❌ loadStoreSetup not found');
            }
            break;
            
        case 'add-product':
            if (typeof loadAddProductForm === 'function') {
                loadAddProductForm();
            } else {
                console.error('❌ loadAddProductForm not found');
            }
            break;
            
        // =====================
        // DROPSHIP SCREENS
        // =====================
        case 'dropship':
            if (typeof loadDropshipDashboard === 'function') {
                loadDropshipDashboard();
            } else {
                console.error('❌ loadDropshipDashboard not found');
                const container = document.getElementById('dropship-content');
                if (container) container.innerHTML = '<p style="text-align:center;padding:40px;">Loading dropship dashboard...</p>';
            }
            break;
            
        case 'dropship-store':
            if (typeof loadDropshipStore === 'function') {
                // Check if viewing own store or public store
                const storeData = data || JSON.parse(sessionStorage.getItem('screen_data_dropship-store') || 'null');
                if (storeData && storeData.username) {
                    // Public store view
                    if (typeof loadPublicDropshipStore === 'function') {
                        loadPublicDropshipStore(storeData.username);
                    }
                } else {
                    // Own store
                    loadDropshipStore();
                }
            } else {
                console.error('❌ loadDropshipStore not found');
            }
            break;
            
        // =====================
        // PROFILE & SETTINGS
        // =====================
        case 'profile':
            if (typeof loadProfileScreen === 'function') {
                loadProfileScreen();
            } else {
                console.error('❌ loadProfileScreen not found');
            }
            break;
            
        case 'settings':
            if (typeof loadSettingsScreen === 'function') {
                loadSettingsScreen();
            } else {
                console.error('❌ loadSettingsScreen not found');
            }
            break;
            
        // =====================
        // NOTIFICATIONS
        // =====================
        case 'notifications':
            if (typeof loadNotificationsScreen === 'function') {
                loadNotificationsScreen();
            } else {
                console.error('❌ loadNotificationsScreen not found');
            }
            break;
            
        // =====================
        // ANALYTICS & RANKINGS
        // =====================
        case 'analytics':
            if (typeof loadAnalytics === 'function') {
                loadAnalytics();
            } else {
                console.error('❌ loadAnalytics not found');
                const container = document.getElementById('analytics-content');
                if (container) container.innerHTML = '<p style="text-align:center;padding:40px;">Loading analytics...</p>';
            }
            break;
            
        case 'leaderboard':
            if (typeof loadLeaderboard === 'function') {
                loadLeaderboard();
            } else {
                console.error('❌ loadLeaderboard not found');
                const container = document.getElementById('leaderboard-content');
                if (container) container.innerHTML = '<p style="text-align:center;padding:40px;">Loading leaderboard...</p>';
            }
            break;
            
        case 'hall-of-fame':
            if (typeof loadHallOfFame === 'function') {
                loadHallOfFame();
            } else {
                console.error('❌ loadHallOfFame not found');
                const container = document.getElementById('hall-fame-content');
                if (container) container.innerHTML = '<p style="text-align:center;padding:40px;">Loading hall of fame...</p>';
            }
            break;
            
        // =====================
        // CUSTOMER SERVICE
        // =====================
        case 'customerservice':
            if (typeof loadCustomerServicePanel === 'function') {
                loadCustomerServicePanel();
            } else {
                console.error('❌ loadCustomerServicePanel not found');
            }
            break;
            
        case 'disputes-manage':
            if (typeof loadDisputesManagement === 'function') {
                loadDisputesManagement();
            } else {
                console.error('❌ loadDisputesManagement not found');
            }
            break;
            
        // =====================
        // OTHER SCREENS
        // =====================
        case 'vip':
            if (typeof loadVIPPage === 'function') {
                loadVIPPage();
            } else {
                const container = document.getElementById('vip-content');
                if (container) container.innerHTML = '<p style="text-align:center;padding:40px;">VIP Program</p>';
            }
            break;
            
        case 'flash-campaigns':
            if (typeof loadFlashCampaigns === 'function') {
                loadFlashCampaigns();
            } else {
                const container = document.getElementById('flash-content');
                if (container) container.innerHTML = '<p style="text-align:center;padding:40px;">Flash Campaigns</p>';
            }
            break;
            
        default:
            console.warn(`⚠️ Unknown screen: ${screen}`);
            break;
    }
}

// =====================
// BROWSER BACK BUTTON
// =====================
window.addEventListener('popstate', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash && hash !== currentScreen) {
        navigateTo(hash);
    }
});

// =====================
// INITIAL LOAD
// =====================
window.addEventListener('load', () => {
    const hash = window.location.hash.replace('#', '');
    const path = window.location.pathname;
    
    let initialScreen = 'onboarding';
    
    // Check for deep links in URL path
    if (path.match(/\/p\/(.+)/)) {
        const productId = path.match(/\/p\/(.+)/)[1];
        sessionStorage.setItem('deep_link_product', productId);
        initialScreen = 'product-detail';
    } else if (path.match(/\/r\/([^\/]+)\/([^\/]+)/)) {
        const [, affiliateId, productId] = path.match(/\/r\/([^\/]+)\/([^\/]+)/);
        sessionStorage.setItem('affiliate_click', JSON.stringify({ affiliateId, productId }));
        initialScreen = 'product-detail';
    } else if (path.match(/\/store\/(.+)/)) {
        const username = path.match(/\/store\/(.+)/)[1];
        sessionStorage.setItem('store_view', username);
        initialScreen = 'dropship-store';
    } else if (window.location.search.includes('ref=')) {
        const refCode = new URLSearchParams(window.location.search).get('ref');
        sessionStorage.setItem('referralCode', refCode);
        initialScreen = 'onboarding';
    } else if (hash) {
        initialScreen = hash;
    }
    
    // If logged in and on auth/onboarding, go to home
    if (isLoggedIn() && ['onboarding', 'auth'].includes(initialScreen)) {
        initialScreen = 'home';
    }
    
    // Navigate to initial screen
    setTimeout(() => {
        navigateTo(initialScreen);
    }, 100);
});

// =====================
// CART BADGE UPDATE HELPER
// =====================
function updateCartBadgeOnAllScreens() {
    const cart = JSON.parse(sessionStorage.getItem('shoplify_cart') || '[]');
    const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    
    // Update all cart badges
    const badges = [
        'cart-count-badge',
        'cart-count-badge-mp',
        'cart-count-badge-pd'
    ];
    
    badges.forEach(id => {
        const badge = document.getElementById(id);
        if (badge) {
            badge.textContent = count > 99 ? '99+' : count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        }
    });
}

// Run cart badge update periodically
setInterval(updateCartBadgeOnAllScreens, 2000);

console.log('✅ Router.js loaded - All screens mapped');
