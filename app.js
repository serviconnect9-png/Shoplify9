// ============ SHOPLIFY APP - WORKING VERSION ============

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM Ready - Starting Shoplify...');
    bootApp();
});

function bootApp() {
    // Get elements
    var loader = document.getElementById('app-loader');
    var appContainer = document.getElementById('app-container');
    var progressFill = document.querySelector('.loader-progress-fill');
    var progressText = document.querySelector('.loader-percent');
    
    // Make sure loader is visible
    if (loader) {
        loader.style.display = 'flex';
        loader.style.opacity = '1';
    }
    if (appContainer) {
        appContainer.style.display = 'none';
    }
    
    // Run progress bar animation
    var progress = 0;
    var progressInterval = setInterval(function() {
        progress += Math.floor(Math.random() * 10) + 3;
        if (progress > 90) {
            progress = 90;
            clearInterval(progressInterval);
        }
        if (progressFill) progressFill.style.width = progress + '%';
        if (progressText) progressText.textContent = progress + '%';
    }, 300);
    
    // Check if Firebase is available
    var firebaseReady = false;
    var checkCount = 0;
    
    var firebaseCheck = setInterval(function() {
        checkCount++;
        
        if (typeof firebase !== 'undefined' && firebase.apps) {
            firebaseReady = true;
            clearInterval(firebaseCheck);
            clearInterval(progressInterval);
            
            // Complete progress
            if (progressFill) progressFill.style.width = '100%';
            if (progressText) progressText.textContent = '100%';
            
            // Initialize Firebase if needed
            if (firebase.apps.length === 0) {
                try {
                    firebase.initializeApp(FIREBASE_CONFIG);
                    console.log('✅ Firebase initialized');
                } catch(e) {
                    console.error('Firebase init error:', e);
                }
            }
            
            // Get auth and firestore
            var auth = firebase.auth();
            var db = firebase.firestore();
            
            // Make globally available
            window.auth = auth;
            window.db = db;
            
            // Wait a moment then check auth
            setTimeout(function() {
                checkAuthAndNavigate(auth, db, loader, appContainer);
            }, 1000);
        }
        
        if (checkCount > 30) {
            // Firebase not loaded after 15 seconds
            clearInterval(firebaseCheck);
            clearInterval(progressInterval);
            
            if (progressFill) progressFill.style.width = '100%';
            if (progressText) progressText.textContent = '100%';
            
            setTimeout(function() {
                if (loader) loader.style.display = 'none';
                if (appContainer) appContainer.style.display = 'block';
                showScreenOnly('onboarding');
            }, 500);
        }
    }, 500);
}

function checkAuthAndNavigate(auth, db, loader, appContainer) {
    console.log('🔐 Checking auth state...');
    
    // Set up auth state listener
    auth.onAuthStateChanged(function(user) {
        console.log('Auth state resolved:', user ? user.email : 'No user');
        
        // Fade out loader
        if (loader) {
            loader.style.opacity = '0';
            loader.style.transition = 'opacity 0.5s ease';
        }
        
        setTimeout(function() {
            // Hide loader
            if (loader) loader.style.display = 'none';
            
            // Show app
            if (appContainer) appContainer.style.display = 'block';
            
            if (user) {
                // User is signed in
                APP_STATE.currentUser = user;
                APP_STATE.isAuthenticated = true;
                
                console.log('✅ User signed in:', user.email);
                
                // Load user profile from Firestore
                db.collection('users').doc(user.uid).get()
                    .then(function(doc) {
                        if (doc.exists) {
                            APP_STATE.userProfile = doc.data();
                            console.log('✅ Profile loaded');
                        } else {
                            console.log('No profile found, creating...');
                            var newProfile = {
                                uid: user.uid,
                                email: user.email,
                                displayName: user.displayName || user.email.split('@')[0],
                                photoURL: user.photoURL || '',
                                walletBalance: 0,
                                affiliateEarnings: 0,
                                pendingEarnings: 0,
                                escrowBalance: 0,
                                withdrawnBalance: 0,
                                membership: 'free',
                                role: user.email === ADMIN_EMAIL ? 'admin' : 'customer',
                                isMerchant: false,
                                isAffiliate: false,
                                bankAccounts: [],
                                suspensionCount: 0,
                                storeTemplate: null,
                                storeActive: false,
                                username: user.displayName || user.email.split('@')[0],
                                theme: 'light',
                                textSize: 'medium',
                                createdAt: firebase.firestore.FieldValue.serverTimestamp()
                            };
                            APP_STATE.userProfile = newProfile;
                            db.collection('users').doc(user.uid).set(newProfile, { merge: true });
                        }
                    })
                    .catch(function(err) {
                        console.error('Profile error:', err);
                    })
                    .finally(function() {
                        // Navigate to home
                        if (user.email === ADMIN_EMAIL) {
                            showScreenOnly('admin');
                        } else {
                            showScreenOnly('home');
                        }
                    });
            } else {
                // No user signed in
                console.log('👤 No user - showing onboarding');
                APP_STATE.currentUser = null;
                APP_STATE.userProfile = null;
                APP_STATE.isAuthenticated = false;
                showScreenOnly('onboarding');
            }
        }, 600);
    });
}

function showScreenOnly(screenName) {
    console.log('📱 Showing screen:', screenName);
    
    // Hide ALL screens first
    var allScreens = document.querySelectorAll('[id^="screen-"]');
    allScreens.forEach(function(el) {
        el.style.display = 'none';
    });
    
    // Show target screen
    var target = document.getElementById('screen-' + screenName);
    if (target) {
        target.style.display = 'block';
        APP_STATE.currentScreen = screenName;
        console.log('✅ Screen shown:', screenName);
    } else {
        console.error('❌ Screen not found: screen-' + screenName);
    }
    
    // Handle bottom navigation visibility
    var bottomNavs = document.querySelectorAll('.bottom-nav');
    var hideNavFor = ['onboarding', 'auth', 'checkout', 'product-detail', 'affiliate-install'];
    
    bottomNavs.forEach(function(nav) {
        if (hideNavFor.indexOf(screenName) !== -1) {
            nav.style.display = 'none';
        } else {
            nav.style.display = 'flex';
        }
    });
    
    // Update active nav item
    var navItems = document.querySelectorAll('.nav-item');
    var navMap = { 'home': 0, 'marketplace': 1, 'orders': 2, 'affiliate': 3, 'profile': 4 };
    var activeIndex = navMap[screenName];
    
    navItems.forEach(function(item, index) {
        if (index === activeIndex) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// ============ NAVIGATION FUNCTION ============
function navigateTo(screen, data) {
    console.log('🧭 Navigate to:', screen, data || '');
    
    if (APP_STATE.currentScreen && APP_STATE.currentScreen !== screen) {
        APP_STATE.navigationHistory.push(APP_STATE.currentScreen);
    }
    
    showScreenOnly(screen);
    
    // Load screen-specific data
    setTimeout(function() {
        switch(screen) {
            case 'home':
                if (typeof loadHomePage === 'function') loadHomePage();
                break;
            case 'marketplace':
                if (typeof loadMarketplace === 'function') loadMarketplace();
                break;
            case 'product-detail':
                if (data && typeof loadProductDetail === 'function') loadProductDetail(data);
                break;
            case 'affiliate':
                if (typeof loadAffiliateDashboard === 'function') loadAffiliateDashboard();
                break;
            case 'orders':
                if (typeof loadOrders === 'function') loadOrders();
                break;
            case 'wallet':
                if (typeof loadWalletPage === 'function') loadWalletPage();
                break;
            case 'profile':
                if (typeof loadProfilePage === 'function') loadProfilePage();
                break;
            case 'checkout':
                if (typeof loadCheckout === 'function') loadCheckout(data);
                break;
            case 'merchant':
                if (typeof loadMerchantDashboard === 'function') loadMerchantDashboard();
                break;
            case 'admin':
                if (typeof loadAdminPanel === 'function') loadAdminPanel();
                break;
            case 'settings':
                if (typeof loadSettings === 'function') loadSettings();
                break;
            case 'store-setup':
                if (typeof loadStoreSetup === 'function') loadStoreSetup();
                break;
        }
    }, 300);
}

function goBack() {
    if (APP_STATE.navigationHistory.length > 0) {
        var prev = APP_STATE.navigationHistory.pop();
        navigateTo(prev);
    } else {
        navigateTo('home');
    }
}

// ============ MAKE FUNCTIONS GLOBAL ============
window.navigateTo = navigateTo;
window.goBack = goBack;
window.showScreenOnly = showScreenOnly;

console.log('✅ App.js fully loaded and ready');