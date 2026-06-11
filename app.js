// app.js - COMPLETE FINAL VERSION (ONESHOPLIFY, Voice, Push, Deep Links, Balance Listener, Order Notifications, Subscription Check)

// =====================
// INITIALIZE APP
// =====================
async function initializeApp() {
    console.log('🚀 ONESHOPLIFY Enterprise v6.0 initializing...');
    
    // Load exchange rates first
    await fetchExchangeRates();
    
    // Initialize auth listener
    initializeAuth();
    
    // Request push notification permission
    requestPushPermission();
    
    // Check for saved session
    const savedSession = localStorage.getItem('shoplify_auth');
    const savedUserId = localStorage.getItem('shoplify_uid');
    
    if (savedSession === 'true' && savedUserId) {
        showLoader();
        
        try {
            const userDoc = await db.collection('users').doc(savedUserId).get();
            
            if (userDoc.exists) {
                const userData = userDoc.data();
                
                if (!userData.isSuspended) {
                    APP.currentUser = { uid: savedUserId, email: userData.email };
                    APP.userProfile = userData;
                    APP.userProfile.uid = savedUserId;
                    
                    // Check subscription status
                    await checkSubscriptionStatus(userData);
                    
                    hideLoader();
                    navigateTo('home');
                    console.log('✅ Session restored successfully');
                    
                    // Handle deep links after auth
                    setTimeout(() => handleDeepLinksAfterAuth(), 1500);
                    
                    // Start background services
                    setTimeout(() => {
                        updateNotificationBadge();
                        startOrderNotifications();
                        startBalanceListener();
                        startLiveFeedUpdates();
                    }, 2000);
                    
                    return;
                }
            }
        } catch (error) {
            console.warn('Session restore error:', error);
        }
        
        hideLoader();
    }
    
    // No valid session - show onboarding
    navigateTo('onboarding');
    
    // Handle deep links on initial load
    handleDeepLinksOnLoad();
    
    console.log('✅ ONESHOPLIFY initialization complete');
}

// =====================
// PUSH NOTIFICATIONS
// =====================
function requestPushPermission() {
    if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                console.log('🔔 Push notifications enabled');
            }
        });
    }
    
    // Register service worker for push
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(() => {
            console.warn('Service worker registration failed');
        });
    }
}

function sendPushNotification(title, body, icon = '/app-icon.png') {
    if ('Notification' in window && Notification.permission === 'granted') {
        try {
            new Notification(title, { body, icon });
        } catch (e) {
            console.warn('Push notification failed:', e);
        }
    }
}

// =====================
// VOICE NOTIFICATIONS (Female voice)
// =====================
function speakNotification(text) {
    if ('speechSynthesis' in window) {
        // Cancel any ongoing speech
        speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Get voices
        const voices = speechSynthesis.getVoices();
        
        // Try to find a female voice
        const femaleVoice = voices.find(v => 
            v.name.includes('Female') || 
            v.name.includes('Samantha') || 
            v.name.includes('Victoria') ||
            v.name.includes('Karen') ||
            v.name.includes('Google UK English Female')
        );
        
        if (femaleVoice) {
            utterance.voice = femaleVoice;
        }
        
        utterance.pitch = 1.2;  // Higher pitch for female sound
        utterance.rate = 1.0;   // Normal speed
        utterance.volume = 0.8; // 80% volume
        
        speechSynthesis.speak(utterance);
    }
}

// Load voices when available
if ('speechSynthesis' in window) {
    speechSynthesis.onvoiceschanged = () => {
        const voices = speechSynthesis.getVoices();
        console.log('🗣️ Voices loaded:', voices.length);
    };
}

// =====================
// ORDER NOTIFICATIONS WITH VOICE & PUSH
// =====================
function startOrderNotifications() {
    const userId = APP.userProfile?.uid;
    if (!userId) return;
    
    // Listen for all order changes
    db.collection('orders').onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
            const order = change.doc.data();
            
            // New order placed (voice for purchase)
            if (change.type === 'added') {
                const productName = order.items?.[0]?.name || 'a product';
                const storeName = order.merchantName || 'store';
                const amount = formatCurrency(order.customerPaid || order.total);
                
                // Voice announcement
                speakNotification(`${productName} successfully purchased at ${amount} from ${storeName}`);
                
                // Push notification
                sendPushNotification('🛒 New Purchase!', `${productName} purchased at ${amount}`);
            }
            
            // Order status changed
            if (change.type === 'modified') {
                const oldData = change.doc._document?.data?.mapValue?.fields;
                
                // Order delivered - notify customer to confirm
                if (order.status === 'delivered' && !order.deliveryConfirmed && order.userId === userId) {
                    const productName = order.items?.[0]?.name || 'product';
                    speakNotification(`Your ${productName} has been delivered! Please confirm delivery to release payment.`);
                    sendPushNotification('📦 Order Delivered!', 'Please confirm delivery or open a dispute within 7 days.');
                }
                
                // Order delivered - notify merchant
                if (order.status === 'delivered' && order.merchantId === userId) {
                    const productName = order.items?.[0]?.name || 'product';
                    speakNotification(`Great news! ${productName} has been delivered to your customer. Payment will be released upon confirmation.`);
                }
                
                // Payment released
                if (order.escrowReleased && order.merchantId === userId) {
                    const amount = formatCurrency(order.sellerReceived || order.total);
                    speakNotification(`Payment of ${amount} has been released to your wallet.`);
                    sendPushNotification('💰 Payment Released!', `${amount} credited to your wallet.`);
                }
                
                // Order shipped
                if (order.status === 'shipped' && order.userId === userId) {
                    const courier = order.courier || 'carrier';
                    sendPushNotification('📦 Order Shipped!', `Your order is on the way via ${courier}.`);
                }
            }
        });
    });
    
    // Listen for new orders (merchant notifications)
    if (APP.userProfile?.isMerchant) {
        db.collection('orders')
            .where('merchantId', '==', userId)
            .where('status', '==', 'pending')
            .onSnapshot(snapshot => {
                snapshot.docChanges().forEach(change => {
                    if (change.type === 'added') {
                        const order = change.doc.data();
                        const productName = order.items?.[0]?.name || 'product';
                        const amount = formatCurrency(order.total);
                        
                        // Flash notification badge red
                        flashNotificationBadge();
                        
                        // Vibrate device
                        if (navigator.vibrate) {
                            navigator.vibrate([200, 100, 200, 100, 200]);
                        }
                        
                        // Voice
                        speakNotification(`New order received! ${productName} for ${amount}. Action required within 72 hours.`);
                        
                        // Push
                        sendPushNotification('🔔 New Order!', `New order: ${productName} - ${amount}`);
                    }
                });
            });
    }
}

function flashNotificationBadge() {
    const badge = document.getElementById('notification-badge');
    if (badge) {
        badge.style.background = '#FF0000';
        badge.style.animation = 'pulse 0.5s 3';
        setTimeout(() => {
            badge.style.background = 'var(--red)';
            badge.style.animation = '';
        }, 2000);
    }
}

// Add pulse animation
const pulseStyle = document.createElement('style');
pulseStyle.textContent = `
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.3); }
    }
`;
document.head.appendChild(pulseStyle);

// =====================
// BALANCE LISTENER (Read-only from Firestore)
// =====================
function startBalanceListener() {
    const userId = APP.userProfile?.uid;
    if (!userId) return;
    
    db.collection('users').doc(userId).onSnapshot((doc) => {
        if (doc.exists && APP.userProfile) {
            const data = doc.data();
            
            // Only update balance-related fields
            APP.userProfile.walletBalance = data.walletBalance || 0;
            APP.userProfile.escrowBalance = data.escrowBalance || 0;
            APP.userProfile.pendingEarnings = data.pendingEarnings || 0;
            APP.userProfile.affiliateEarnings = data.affiliateEarnings || 0;
            APP.userProfile.withdrawnBalance = data.withdrawnBalance || 0;
            APP.userProfile.totalSales = data.totalSales || 0;
            APP.userProfile.totalRevenue = data.totalRevenue || 0;
            APP.userProfile.totalReferrals = data.totalReferrals || 0;
            
            // Update UI if wallet display function exists
            if (typeof updateWalletDisplay === 'function') {
                updateWalletDisplay();
            }
        }
    }, (error) => {
        console.warn('Balance listener error:', error);
    });
}

// =====================
// DEEP LINK HANDLERS
// =====================
function handleDeepLinksOnLoad() {
    const path = window.location.pathname;
    
    // Store URL: /store/:username
    const storeMatch = path.match(/^\/store\/(.+)/);
    if (storeMatch) {
        const username = storeMatch[1];
        console.log('🏪 Deep link detected: Store -', username);
        sessionStorage.setItem('store_view', username);
        sessionStorage.setItem('deep_link_type', 'store');
    }
    
    // Product URL: /p/:productId
    const productMatch = path.match(/^\/p\/(.+)/);
    if (productMatch) {
        const productId = productMatch[1];
        console.log('🛍️ Deep link detected: Product -', productId);
        sessionStorage.setItem('deep_link_product', productId);
        sessionStorage.setItem('deep_link_type', 'product');
    }
    
    // Affiliate URL: /r/:affiliateId/:productId
    const affiliateMatch = path.match(/^\/r\/([^\/]+)\/([^\/]+)/);
    if (affiliateMatch) {
        const affiliateId = affiliateMatch[1];
        const productId = affiliateMatch[2];
        console.log('📢 Deep link detected: Affiliate -', affiliateId, productId);
        sessionStorage.setItem('affiliate_click', JSON.stringify({ affiliateId, productId }));
        sessionStorage.setItem('deep_link_type', 'affiliate');
    }
    
    // Referral URL: ?ref=code
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    if (refCode) {
        console.log('👥 Referral code detected:', refCode);
        sessionStorage.setItem('referralCode', refCode);
    }
}

function handleDeepLinksAfterAuth() {
    const linkType = sessionStorage.getItem('deep_link_type');
    
    if (linkType === 'store') {
        const username = sessionStorage.getItem('store_view');
        if (username) {
            sessionStorage.removeItem('deep_link_type');
            sessionStorage.removeItem('store_view');
            console.log('🏪 Navigating to public store:', username);
            navigateTo('dropship-store', { username, isPublic: true });
        }
    } else if (linkType === 'product') {
        const productId = sessionStorage.getItem('deep_link_product');
        if (productId) {
            sessionStorage.removeItem('deep_link_product');
            sessionStorage.removeItem('deep_link_type');
            console.log('🛍️ Navigating to product:', productId);
            navigateTo('product-detail', { productId });
        }
    } else if (linkType === 'affiliate') {
        const data = JSON.parse(sessionStorage.getItem('affiliate_click') || '{}');
        if (data.affiliateId && data.productId) {
            trackAffiliateClick(data.affiliateId, data.productId);
            sessionStorage.removeItem('affiliate_click');
            sessionStorage.removeItem('deep_link_type');
            console.log('📢 Tracking affiliate click, navigating to product:', data.productId);
            navigateTo('product-detail', { productId: data.productId });
        }
    }
}

async function trackAffiliateClick(affiliateId, productId) {
    try {
        const snapshot = await db.collection('affiliate_products')
            .where('affiliateId', '==', affiliateId)
            .where('productId', '==', productId)
            .limit(1)
            .get();
        
        if (!snapshot.empty) {
            await snapshot.docs[0].ref.update({
                clicks: firebase.firestore.FieldValue.increment(1)
            });
            console.log('✅ Affiliate click tracked');
        }
    } catch (error) {
        console.warn('Affiliate click tracking error:', error);
    }
}

// =====================
// LIVE FEED
// =====================
function startLiveFeedUpdates() {
    updateLiveFeed();
    setInterval(updateLiveFeed, 30000); // Every 30 seconds
}

async function updateLiveFeed() {
    const feed = document.getElementById('live-feed-content');
    if (!feed) return;
    
    try {
        // Get recent orders
        const orderSnap = await db.collection('orders')
            .where('status', 'in', ['processing', 'shipped', 'in_transit', 'out_for_delivery', 'delivered', 'completed'])
            .get();
        
        // Get admin messages
        const adminSnap = await db.collection('admin_feed').get();
        
        const messages = [];
        
        // Add admin messages first
        adminSnap.forEach(doc => {
            const msg = doc.data();
            messages.push({ text: `📢 ${msg.message}`, time: msg.createdAt });
        });
        
        // Add recent purchases
        orderSnap.forEach(doc => {
            const order = doc.data();
            const name = order.userName || order.userEmail?.split('@')[0] || 'Someone';
            const product = order.items?.[0]?.name || 'a product';
            const action = order.status === 'delivered' || order.status === 'completed' ? 'received' : 'purchased';
            messages.push({ text: `🛒 ${name} ${action} "${product}"`, time: order.createdAt });
        });
        
        // Sort by time
        messages.sort((a, b) => (b.time?.toDate?.() || 0) - (a.time?.toDate?.() || 0));
        
        if (messages.length === 0) {
            feed.innerHTML = '<span class="live-dot"></span> Live: Marketplace active 🌍';
        } else {
            feed.innerHTML = '<span class="live-dot"></span> ' + messages.slice(0, 15).map(m => m.text).join(' • ');
        }
    } catch (error) {
        feed.innerHTML = '<span class="live-dot"></span> Live: Marketplace active 🌍';
    }
}

// =====================
// SUBSCRIPTION CHECK
// =====================
async function checkSubscriptionStatus(userData) {
    if (!userData) return;
    
    const now = new Date();
    const notifications = [];
    
    // Check affiliate subscription
    if (userData.isAffiliate && userData.affiliateSubscriptionExpiry) {
        const expiry = userData.affiliateSubscriptionExpiry.toDate();
        const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
        
        if (daysLeft <= 0) {
            // Expired - deactivate
            await db.collection('users').doc(userData.uid).update({
                isAffiliate: false,
                affiliateSubscription: false
            }).catch(() => {});
            
            notifications.push({
                title: 'Subscription Expired',
                message: 'Your affiliate subscription has expired. Renew to continue earning.',
                icon: '⚠️'
            });
        } else if (daysLeft <= 5) {
            // Expiring soon
            notifications.push({
                title: 'Subscription Expiring Soon',
                message: `Your affiliate subscription expires in ${daysLeft} days. Renew now!`,
                icon: '⏰'
            });
        }
    }
    
    // Check dropship subscription
    if (userData.isDropshipper && userData.dropshipPlanExpiry) {
        const expiry = userData.dropshipPlanExpiry.toDate();
        const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
        
        if (daysLeft <= 0) {
            await db.collection('users').doc(userData.uid).update({
                isDropshipper: false,
                dropshipPlan: 'none'
            }).catch(() => {});
            
            notifications.push({
                title: 'Dropship Plan Expired',
                message: 'Your dropship plan has expired. Renew to continue.',
                icon: '⚠️'
            });
        } else if (daysLeft <= 5) {
            notifications.push({
                title: 'Dropship Plan Expiring',
                message: `Your dropship plan expires in ${daysLeft} days. Renew now!`,
                icon: '⏰'
            });
        }
    }
    
    // Check advertiser/influencer subscription
    if (userData.advertiserSubscription && userData.advertiserSubscriptionExpiry) {
        const expiry = userData.advertiserSubscriptionExpiry.toDate();
        const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
        
        if (daysLeft <= 0) {
            await db.collection('users').doc(userData.uid).update({
                advertiserSubscription: false
            }).catch(() => {});
        } else if (daysLeft <= 5) {
            notifications.push({
                title: 'Influencer Subscription Expiring',
                message: `Your influencer subscription expires in ${daysLeft} days.`,
                icon: '⏰'
            });
        }
    }
    
    // Send notifications
    for (const notif of notifications) {
        await createNotification(userData.uid, notif.title, notif.message, notif.icon, 'profile');
    }
}

// =====================
// PERIODIC SUBSCRIPTION CHECK
// =====================
function startSubscriptionCheck() {
    // Check every hour
    setInterval(async () => {
        if (APP.userProfile) {
            await checkSubscriptionStatus(APP.userProfile);
        }
    }, 3600000); // 1 hour
}

// =====================
// ADMIN FEED MESSAGE
// =====================
async function sendAdminFeedMessage(message) {
    if (APP.userProfile?.accountType !== 'admin') return;
    
    try {
        await db.collection('admin_feed').add({
            message: message,
            createdBy: APP.userProfile.uid,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('✅ Admin feed message sent');
    } catch (error) {
        console.error('Feed message error:', error);
    }
}

// =====================
// BACKEND BALANCE OPERATIONS
// =====================
async function creditBalanceViaBackend(userId, amount, type, description) {
    try {
        const response = await fetch(APP.backendUrl + '/balance/credit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, amount, type, description })
        });
        return await response.json();
    } catch (error) {
        console.error('Backend credit error:', error);
        throw error;
    }
}

async function debitBalanceViaBackend(userId, amount, type, description) {
    try {
        const response = await fetch(APP.backendUrl + '/balance/debit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, amount, type, description })
        });
        return await response.json();
    } catch (error) {
        console.error('Backend debit error:', error);
        throw error;
    }
}

async function releaseEscrowViaBackend(orderId) {
    try {
        const response = await fetch(APP.backendUrl + '/escrow/release', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId })
        });
        return await response.json();
    } catch (error) {
        console.error('Escrow release error:', error);
        throw error;
    }
}

// =====================
// INITIALIZE ON PAGE LOAD
// =====================
document.addEventListener('DOMContentLoaded', initializeApp);

console.log('✅ app.js loaded - ONESHOPLIFY Enterprise ready');
