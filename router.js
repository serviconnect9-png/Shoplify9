// ============ Navigation Router ============
const ALL_SCREENS = [
    'onboarding', 'auth', 'home', 'marketplace', 'product-detail',
    'affiliate', 'affiliate-install', 'checkout', 'orders', 'wallet',
    'profile', 'store-setup', 'merchant', 'admin', 'settings',
    'add-product', 'notifications', 'transactions'
];

const BOTTOM_NAV_SCREENS = ['home', 'marketplace', 'orders', 'affiliate', 'profile'];
const NO_NAV_SCREENS = ['onboarding', 'auth', 'checkout', 'product-detail', 'affiliate-install'];

function navigateTo(screen, data) {
    console.log('🧭 Navigate to:', screen);
    if (!screen) return;
    
    if (APP_STATE.currentScreen && APP_STATE.currentScreen !== screen) {
        APP_STATE.previousScreen = APP_STATE.currentScreen;
        APP_STATE.navigationHistory.push(APP_STATE.currentScreen);
        if (APP_STATE.navigationHistory.length > 30) APP_STATE.navigationHistory.shift();
    }
    
    APP_STATE.currentScreen = screen;
    
    ALL_SCREENS.forEach(s => {
        const el = document.getElementById('screen-' + s);
        if (el) el.style.display = 'none';
    });
    
    const target = document.getElementById('screen-' + screen);
    if (target) {
        target.style.display = 'block';
        const mc = target.querySelector('.main-content');
        if (mc) mc.scrollTop = 0;
        updateBottomNav(screen);
        handleBottomNavVisibility(screen);
        loadScreenData(screen, data);
        document.title = capitalizeScreen(screen) + ' - Shoplify';
        sessionStorage.setItem('currentScreen', screen);
    } else {
        console.error('Screen not found: screen-' + screen);
        const homeScreen = document.getElementById('screen-home');
        if (homeScreen) { homeScreen.style.display = 'block'; APP_STATE.currentScreen = 'home'; }
    }
}

function goBack() {
    if (APP_STATE.navigationHistory.length > 0) {
        const prev = APP_STATE.navigationHistory.pop();
        navigateTo(prev);
    } else {
        navigateTo('home');
        if (typeof loadHomePage === 'function') setTimeout(loadHomePage, 300);
    }
}

function updateBottomNav(currentScreen) {
    document.querySelectorAll('.bottom-nav').forEach(nav => {
        const items = nav.querySelectorAll('.nav-item');
        items.forEach(item => item.classList.remove('active'));
        const navMap = { 'home': 0, 'marketplace': 1, 'orders': 2, 'affiliate': 3, 'profile': 4 };
        const index = navMap[currentScreen];
        if (index !== undefined && items[index]) items[index].classList.add('active');
    });
}

function handleBottomNavVisibility(screen) {
    document.querySelectorAll('.bottom-nav').forEach(nav => {
        nav.style.display = NO_NAV_SCREENS.includes(screen) ? 'none' : 'flex';
    });
}

async function loadScreenData(screen, data) {
    switch (screen) {
        case 'home': if (typeof loadHomePage === 'function') await loadHomePage(); break;
        case 'marketplace': if (typeof loadMarketplace === 'function') await loadMarketplace(); break;
        case 'product-detail': if (data && typeof loadProductDetail === 'function') await loadProductDetail(data); break;
        case 'affiliate': if (typeof loadAffiliateDashboard === 'function') await loadAffiliateDashboard(); break;
        case 'affiliate-install': if (data && typeof startProductInstallation === 'function') await startProductInstallation(data); break;
        case 'checkout': if (typeof loadCheckout === 'function') await loadCheckout(data); break;
        case 'orders': if (typeof loadOrders === 'function') await loadOrders(); break;
        case 'wallet': if (typeof loadWalletPage === 'function') await loadWalletPage(); break;
        case 'profile': if (typeof loadProfilePage === 'function') await loadProfilePage(); break;
        case 'store-setup': if (typeof loadStoreSetup === 'function') await loadStoreSetup(); break;
        case 'merchant': if (typeof loadMerchantDashboard === 'function') await loadMerchantDashboard(); break;
        case 'admin': if (typeof loadAdminPanel === 'function') await loadAdminPanel(); break;
        case 'settings': if (typeof loadSettings === 'function') await loadSettings(); break;
        case 'add-product': if (typeof loadAddProduct === 'function') await loadAddProduct(); break;
        case 'notifications': if (typeof loadNotifications === 'function') await loadNotifications(); break;
        case 'transactions': if (typeof loadTransactionsPage === 'function') await loadTransactionsPage(); break;
    }
}

function capitalizeScreen(screen) {
    return screen.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function filterMarketplaceProducts() {
    const term = (document.getElementById('marketplace-search')?.value || '').toLowerCase();
    document.querySelectorAll('#marketplace-products .product-card').forEach(card => {
        const name = (card.querySelector('.product-card-name')?.textContent || '').toLowerCase();
        card.style.display = name.includes(term) ? '' : 'none';
    });
}

async function filterByCategory(category, chip) {
    document.querySelectorAll('.category-chip').forEach(c => c.classList.remove('active'));
    if (chip) chip.classList.add('active');
    showLoader();
    try {
        let products;
        if (category === 'all') {
            products = await db.collection('products').where('status', '==', 'active').limit(50).get();
        } else {
            products = await db.collection('products').where('status', '==', 'active').where('category', '==', category).limit(50).get();
        }
        renderProductCards(products.docs.map(doc => ({ id: doc.id, ...doc.data() })), 'marketplace-products');
    } catch (e) { console.error('Filter error:', e); }
    hideLoader();
}

function shareProduct() {
    if (APP_STATE.selectedProduct) {
        const link = window.location.href;
        copyToClipboard(link);
        showToast('Product link copied!', 'success');
    }
}

window.navigateTo = navigateTo;
window.goBack = goBack;
window.filterByCategory = filterByCategory;
window.filterMarketplaceProducts = filterMarketplaceProducts;
window.shareProduct = shareProduct;

console.log('✅ Router ready');