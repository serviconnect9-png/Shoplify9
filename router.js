// ============ Navigation Router ============

const ALL_SCREENS = [
    'onboarding', 'auth', 'home', 'marketplace', 'product-detail',
    'affiliate', 'affiliate-install', 'checkout', 'orders', 'wallet',
    'profile', 'store-setup', 'merchant', 'admin', 'settings',
    'add-product', 'notifications', 'transactions'
];

const BOTTOM_NAV_SCREENS = ['home', 'marketplace', 'orders', 'affiliate', 'profile'];
const NO_NAV_SCREENS = ['onboarding', 'auth', 'checkout', 'product-detail', 'affiliate-install'];

function navigateTo(screen, data = null) {
    if (!screen) return;
    
    // Store navigation history
    if (APP_STATE.currentScreen !== screen) {
        APP_STATE.previousScreen = APP_STATE.currentScreen;
        APP_STATE.navigationHistory.push(APP_STATE.currentScreen);
        // Keep history manageable
        if (APP_STATE.navigationHistory.length > 20) {
            APP_STATE.navigationHistory.shift();
        }
    }
    
    APP_STATE.currentScreen = screen;
    
    // Hide all screens
    ALL_SCREENS.forEach(s => {
        const el = document.getElementById(`screen-${s}`);
        if (el) el.style.display = 'none';
    });
    
    // Show target screen
    const targetScreen = document.getElementById(`screen-${screen}`);
    if (targetScreen) {
        targetScreen.style.display = 'block';
        
        // Scroll main content to top
        const mainContent = targetScreen.querySelector('.main-content');
        if (mainContent) {
            mainContent.scrollTop = 0;
        }
        
        // Update bottom navigation
        updateBottomNav(screen);
        
        // Handle bottom nav visibility
        handleBottomNavVisibility(screen);
        
        // Load screen data
        loadScreenData(screen, data);
        
        // Update document title
        document.title = `${capitalizeScreen(screen)} - ServiConnect`;
    } else {
        console.error(`Screen not found: screen-${screen}`);
        // Fallback to home
        navigateTo('home');
    }
}

function goBack() {
    if (APP_STATE.navigationHistory.length > 0) {
        const previousScreen = APP_STATE.navigationHistory.pop();
        navigateTo(previousScreen);
    } else {
        navigateTo('home');
        loadHomePage();
    }
}

function updateBottomNav(currentScreen) {
    const allNavs = document.querySelectorAll('.bottom-nav');
    
    allNavs.forEach(nav => {
        const items = nav.querySelectorAll('.nav-item');
        items.forEach(item => item.classList.remove('active'));
        
        const navMap = {
            'home': 0, 'marketplace': 1, 'orders': 2,
            'affiliate': 3, 'profile': 4
        };
        
        const index = navMap[currentScreen];
        if (index !== undefined && items[index]) {
            items[index].classList.add('active');
        }
    });
}

function handleBottomNavVisibility(screen) {
    const allNavs = document.querySelectorAll('.bottom-nav');
    
    allNavs.forEach(nav => {
        if (NO_NAV_SCREENS.includes(screen)) {
            nav.style.display = 'none';
        } else {
            nav.style.display = 'flex';
        }
    });
}

async function loadScreenData(screen, data) {
    switch (screen) {
        case 'home':
            await loadHomePage();
            break;
        case 'marketplace':
            await loadMarketplace();
            break;
        case 'product-detail':
            if (data) await loadProductDetail(data);
            break;
        case 'affiliate':
            await loadAffiliateDashboard();
            break;
        case 'affiliate-install':
            if (data) await startProductInstallation(data);
            break;
        case 'checkout':
            await loadCheckout(data);
            break;
        case 'orders':
            await loadOrders();
            break;
        case 'wallet':
            await loadWalletPage();
            break;
        case 'profile':
            await loadProfilePage();
            break;
        case 'store-setup':
            await loadStoreSetup();
            break;
        case 'merchant':
            await loadMerchantDashboard();
            break;
        case 'admin':
            await loadAdminPanel();
            break;
        case 'settings':
            await loadSettings();
            break;
        case 'add-product':
            await loadAddProduct();
            break;
        case 'notifications':
            await loadNotifications();
            break;
        case 'transactions':
            await loadTransactionsPage();
            break;
    }
}

function capitalizeScreen(screen) {
    return screen.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

// ============ Search Functions ============
function openSearch() {
    const searchInput = document.getElementById('marketplace-search');
    if (searchInput) {
        searchInput.focus();
        searchInput.scrollIntoView({ behavior: 'smooth' });
    }
}

function filterMarketplaceProducts() {
    const searchTerm = document.getElementById('marketplace-search')?.value?.toLowerCase() || '';
    const productCards = document.querySelectorAll('#marketplace-products .product-card');
    
    productCards.forEach(card => {
        const name = card.querySelector('.product-card-name')?.textContent?.toLowerCase() || '';
        if (name.includes(searchTerm)) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });
}

async function filterByCategory(category, chipElement) {
    // Update active chip
    const allChips = document.querySelectorAll('.category-chip');
    allChips.forEach(chip => chip.classList.remove('active'));
    if (chipElement) chipElement.classList.add('active');
    
    // Filter products
    showLoader();
    try {
        let products;
        if (category === 'all') {
            products = await db.collection('products')
                .where('status', '==', 'active')
                .limit(50)
                .get();
        } else {
            products = await db.collection('products')
                .where('status', '==', 'active')
                .where('category', '==', category)
                .limit(50)
                .get();
        }
        
        const productList = products.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderProductCards(productList, 'marketplace-products');
    } catch (error) {
        console.error('Filter error:', error);
        showToast('Error filtering products', 'error');
    }
    hideLoader();
}