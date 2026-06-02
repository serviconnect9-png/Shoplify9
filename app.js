// ============ ServiConnect App - Main Initialization (FIXED) ============

// ============ DOM Ready ============
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 ServiConnect App Starting...');
    console.log('📱 Version:', PLATFORM_CONFIG.appVersion);
    
    // Initialize the app immediately
    initApp();
});

// ============ App Initialization ============
async function initApp() {
    // Show loader with progress animation
    const loader = document.getElementById('app-loader');
    const appContainer = document.getElementById('app-container');
    
    if (!loader || !appContainer) {
        console.error('❌ Critical elements missing');
        return;
    }
    
    // Start progress animation (5 seconds)
    simulateLoading(5000);
    
    // Wait for Firebase to initialize
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Check if Firebase is ready
    if (!auth || !db) {
        console.error('❌ Firebase not initialized');
        loader.innerHTML = `
            <div class="loader-container">
                <div class="loader-icon">
                    <img src="app-icon.png" alt="ServiConnect" width="100" height="100" style="border-radius:20px;">
                </div>
                <p style="color:#FF4444; font-weight:600;">Failed to connect. Please refresh.</p>
                <button onclick="location.reload()" style="background:#FFD700; color:white; border:none; padding:12px 24px; border-radius:8px; margin-top:20px; cursor:pointer;">
                    Retry
                </button>
            </div>`;
        return;
    }
    
    // Set up auth state listener
    let authResolved = false;
    
    auth.onAuthStateChanged(async (user) => {
        if (authResolved) return; // Prevent multiple calls
        authResolved = true;
        
        console.log('🔐 Auth state resolved:', user ? user.email : 'No user');
        
        if (user) {
            // User is signed in
            APP_STATE.currentUser = user;
            APP_STATE.isAuthenticated = true;
            
            try {
                // Get or create user profile
                let profile = await getFromFirestore('users', user.uid);
                
                if (!profile) {
                    // Create new user profile
                    profile = {
                        uid: user.uid,
                        email: user.email,
                        displayName: user.displayName || user.email.split('@')[0],
                        photoURL: user.photoURL || '',
                        phoneNumber: user.phoneNumber || '',
                        walletBalance: 0,
                        affiliateEarnings: 0,
                        pendingEarnings: 0,
                        escrowBalance: 0,
                        withdrawnBalance: 0,
                        membership: 'free',
                        role: isAdmin(user.email) ? 'admin' : 'customer',
                        isMerchant: false,
                        isAffiliate: false,
                        merchantSubscription: null,
                        affiliateSubscription: null,
                        bankAccounts: [],
                        suspensionCount: 0,
                        isSuspended: false,
                        storeTemplate: null,
                        storeActive: false,
                        username: user.displayName || user.email.split('@')[0],
                        theme: 'light',
                        textSize: 'medium',
                        language: 'en',
                        notifications: true,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    };
                    await saveToFirestore('users', user.uid, profile);
                } else {
                    // Update last login
                    await saveToFirestore('users', user.uid, {
                        lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
                        photoURL: user.photoURL || profile.photoURL
                    }).catch(() => {}); // Silent catch - non-critical
                }
                
                APP_STATE.userProfile = profile;
                updateAllAvatars(user.photoURL || profile.photoURL);
                
                console.log('👤 Profile loaded:', profile.displayName);
                
                // Determine destination
                const destination = isAdmin(user.email) ? 'admin' : 'home';
                
                // Wait for loader animation to complete (at least 3 seconds total)
                const elapsedTime = 5000 - 1500; // Adjust timing
                await new Promise(resolve => setTimeout(resolve, Math.max(elapsedTime, 2000)));
                
                // Hide loader and show app
                hideLoaderAndShow(destination);
                
            } catch (error) {
                console.error('❌ Profile loading error:', error);
                // Still show app even if profile fails
                await new Promise(resolve => setTimeout(resolve, 3000));
                hideLoaderAndShow('home');
            }
            
        } else {
            // No user signed in
            APP_STATE.currentUser = null;
            APP_STATE.userProfile = null;
            APP_STATE.isAuthenticated = false;
            
            // Wait for animation
            await new Promise(resolve => setTimeout(resolve, 3500));
            hideLoaderAndShow('onboarding');
        }
    });
    
    // Fallback: If auth doesn't resolve within 8 seconds, show the app anyway
    setTimeout(() => {
        if (!authResolved) {
            console.warn('⚠️ Auth timeout - showing onboarding');
            authResolved = true;
            hideLoaderAndShow('onboarding');
        }
    }, 8000);
    
    // Setup global listeners
    setupGlobalListeners();
    
    // Handle deep links
    handleDeepLinks();
    
    // Restore cart
    restoreCart();
}

// ============ Hide Loader and Show App ============
function hideLoaderAndShow(destination) {
    const loader = document.getElementById('app-loader');
    const appContainer = document.getElementById('app-container');
    
    if (!loader || !appContainer) return;
    
    // Fade out loader
    loader.style.opacity = '0';
    loader.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        loader.style.display = 'none';
        appContainer.style.display = 'block';
        
        // Navigate to destination
        console.log('🎯 Navigating to:', destination);
        navigateTo(destination);
        
        // Load home data if going to home
        if (destination === 'home') {
            setTimeout(() => loadHomePage(), 300);
        }
        
        console.log('✅ App fully loaded');
    }, 500);
}

// ============ Simulate Loading Progress ============
function simulateLoading(duration = 5000) {
    const fill = document.querySelector('.loader-progress-fill');
    const percentText = document.querySelector('.loader-percent');
    
    if (!fill || !percentText) return;
    
    const startTime = Date.now();
    
    function update() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min((elapsed / duration) * 100, 100);
        
        fill.style.width = progress + '%';
        percentText.textContent = Math.round(progress) + '%';
        
        if (progress < 100) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

// ============ Restore Cart from localStorage ============
function restoreCart() {
    try {
        const savedCart = localStorage.getItem('serviconnect_cart');
        if (savedCart) {
            APP_STATE.cart = JSON.parse(savedCart);
            console.log('🛒 Cart restored:', APP_STATE.cart.length, 'items');
        }
    } catch (e) {
        console.log('No saved cart');
        APP_STATE.cart = [];
    }
}

// ============ Save Cart ============
function saveCart() {
    if (APP_STATE.cart && APP_STATE.cart.length > 0) {
        localStorage.setItem('serviconnect_cart', JSON.stringify(APP_STATE.cart));
    }
}

// Save cart periodically and on unload
setInterval(saveCart, 5000);
window.addEventListener('beforeunload', saveCart);

// ============ Setup Global Event Listeners ============
function setupGlobalListeners() {
    // Close modal on Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeModal();
    });
    
    // Handle back button
    window.addEventListener('popstate', function() {
        goBack();
    });
    
    // Handle app visibility
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'visible' && APP_STATE.isAuthenticated) {
            if (APP_STATE.currentScreen === 'home') {
                loadHomePage();
            }
            refreshUserProfile().catch(() => {});
        }
    });
    
    // Online/Offline handlers
    window.addEventListener('online', function() {
        showToast('Back online!', 'success');
        if (APP_STATE.isAuthenticated) {
            refreshUserProfile().catch(() => {});
            if (APP_STATE.currentScreen === 'home') loadHomePage();
        }
    });
    
    window.addEventListener('offline', function() {
        showToast('You are offline', 'warning');
    });
}

// ============ Handle Deep Links ============
function handleDeepLinks() {
    const path = window.location.pathname;
    const hash = window.location.hash;
    
    // Handle /r/affiliateId/productId
    const affiliateMatch = path.match(/\/r\/([^\/]+)\/([^\/]+)/);
    if (affiliateMatch) {
        const [, affiliateId, productId] = affiliateMatch;
        console.log('🔗 Affiliate link:', affiliateId, productId);
        
        if (typeof trackAffiliateClick === 'function') {
            trackAffiliateClick(affiliateId, productId);
        }
        
        // Store for navigation after load
        sessionStorage.setItem('deep_link_product', productId);
    }
    
    // Handle hash routes
    if (hash && ALL_SCREENS.includes(hash.replace('#', ''))) {
        sessionStorage.setItem('deep_link_screen', hash.replace('#', ''));
    }
}

// ============ Check for pending deep links after load ============
function checkPendingDeepLinks() {
    const productId = sessionStorage.getItem('deep_link_product');
    const screen = sessionStorage.getItem('deep_link_screen');
    
    if (productId) {
        sessionStorage.removeItem('deep_link_product');
        setTimeout(() => navigateTo('product-detail', productId), 500);
    } else if (screen) {
        sessionStorage.removeItem('deep_link_screen');
        setTimeout(() => navigateTo(screen), 500);
    }
}

// Run deep link check after app loads
setTimeout(checkPendingDeepLinks, 2000);

// ============ Global Error Handler ============
window.addEventListener('error', function(event) {
    console.error('🚨 Error:', event.error?.message || 'Unknown error');
    
    // Prevent app from completely breaking
    if (event.error && event.error.message.includes('Firebase')) {
        console.warn('Firebase error caught');
    }
});

// ============ Unhandled Promise Rejection ============
window.addEventListener('unhandledrejection', function(event) {
    console.error('🚨 Unhandled rejection:', event.reason);
    event.preventDefault();
});

// ============ Log App Ready ============
console.log('✅ ServiConnect App.js loaded and ready');
console.log('📋 Config:', {
    version: PLATFORM_CONFIG.appVersion,
    admin: ADMIN_EMAIL,
    screens: ALL_SCREENS?.length || 'loading...'
});