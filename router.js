// router.js - Navigation System
let currentScreen = 'onboarding';
let screenHistory = [];

function navigateTo(screen, data = null) {
    if (screen === currentScreen && screen !== 'product-detail') return;
    
    if (!isLoggedIn() && !['onboarding', 'auth', 'account-type', 'setup-credentials'].includes(screen)) {
        screen = 'auth';
    }
    
    screenHistory.push(currentScreen);
    
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    
    const targetScreen = document.getElementById(`screen-${screen}`);
    if (targetScreen) {
        targetScreen.classList.remove('hidden');
        currentScreen = screen;
        
        window.location.hash = screen;
        
        if (data) {
            sessionStorage.setItem(`screen_data_${screen}`, JSON.stringify(data));
        }
        
        handleScreenLoad(screen, data);
        
        document.getElementById('app').scrollTop = 0;
    } else {
        console.error(`Screen not found: ${screen}`);
        navigateTo('home');
    }
}

function goBack() {
    const previousScreen = screenHistory.pop() || 'home';
    navigateTo(previousScreen);
}

function handleScreenLoad(screen, data) {
    switch(screen) {
        case 'home':
            loadHomeScreen();
            break;
        case 'marketplace':
            loadMarketplace();
            break;
        case 'product-detail':
            loadProductDetail(data);
            break;
        case 'sponsored':
            loadSponsoredProducts();
            break;
        case 'affiliate':
            loadAffiliateDashboard();
            break;
        case 'merchant':
            loadMerchantDashboard();
            break;
        case 'wallet':
            loadWalletScreen();
            break;
        case 'orders':
            loadOrdersScreen();
            break;
        case 'profile':
            loadProfileScreen();
            break;
        case 'notifications':
            loadNotificationsScreen();
            break;
        case 'dropship':
            loadDropshipDashboard();
            break;
        case 'customerservice':
            loadCustomerServicePanel();
            break;
        case 'settings':
            loadSettingsScreen();
            break;
        case 'leaderboard':
            loadLeaderboard();
            break;
        case 'analytics':
            loadAnalytics();
            break;
        case 'advertisers':
            loadAdvertisers();
            break;
        case 'store-setup':
            loadStoreSetup();
            break;
        case 'add-product':
            loadAddProductForm();
            break;
        case 'checkout':
            loadCheckout(data);
            break;
        case 'transactions':
            loadTransactions();
            break;
        case 'disputes-manage':
            loadDisputesManagement();
            break;
        case 'vip':
            loadVIPPage();
            break;
        case 'hall-of-fame':
            loadHallOfFame();
            break;
        case 'flash-campaigns':
            loadFlashCampaigns();
            break;
        case 'dropship-store':
            loadDropshipStore();
            break;
        case 'affiliate-install':
            loadAffiliateInstall();
            break;
    }
}

window.addEventListener('popstate', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash && hash !== currentScreen) {
        navigateTo(hash);
    }
});

window.addEventListener('load', () => {
    const hash = window.location.hash.replace('#', '');
    const path = window.location.pathname;
    
    let initialScreen = 'onboarding';
    
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
    
    if (isLoggedIn() && ['onboarding', 'auth'].includes(initialScreen)) {
        initialScreen = 'home';
    }
    
    navigateTo(initialScreen);
});