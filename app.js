// app.js - FINAL VERSION (Backend-only balance updates, admin feed messages)
async function initializeApp() {
    console.log('🚀 Shoplify Enterprise v6.0 - Final Version initializing...');
    
    await fetchExchangeRates();
    initializeAuth();
    
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
                    await checkSubscriptionStatus(userData);
                    hideLoader();
                    navigateTo('home');
                    setTimeout(() => {
                        updateNotificationBadge();
                        startOrderNotifications();
                        startBalanceListener();
                    }, 2000);
                    return;
                }
            }
        } catch (error) { console.warn('Session restore error:', error); }
        hideLoader();
    }
    
    navigateTo('onboarding');
    handleDeepLinks();
    console.log('✅ App initialized');
}

// BALANCE LISTENER - Read-only from Firestore
function startBalanceListener() {
    const userId = APP.userProfile?.uid;
    if (!userId) return;
    
    db.collection('users').doc(userId).onSnapshot((doc) => {
        if (doc.exists) {
            const data = doc.data();
            // Only update balance fields - never write
            if (APP.userProfile) {
                APP.userProfile.walletBalance = data.walletBalance || 0;
                APP.userProfile.escrowBalance = data.escrowBalance || 0;
                APP.userProfile.pendingEarnings = data.pendingEarnings || 0;
                APP.userProfile.affiliateEarnings = data.affiliateEarnings || 0;
                APP.userProfile.withdrawnBalance = data.withdrawnBalance || 0;
                updateWalletDisplay();
            }
        }
    }, (error) => {
        console.warn('Balance listener error:', error);
    });
}

// ORDER NOTIFICATIONS
function startOrderNotifications() {
    const userId = APP.userProfile?.uid;
    if (!userId) return;
    
    if (APP.userProfile?.isMerchant) {
        db.collection('orders')
            .where('merchantId', '==', userId)
            .where('status', '==', 'pending')
            .onSnapshot(snapshot => {
                snapshot.docChanges().forEach(change => {
                    if (change.type === 'added') {
                        notifyNewOrder(change.doc.data());
                    }
                });
            });
    }
    
    db.collection('orders')
        .where('userId', '==', userId)
        .onSnapshot(snapshot => {
            snapshot.docChanges().forEach(change => {
                if (change.type === 'modified') {
                    const order = change.doc.data();
                    if (order.status === 'delivered' && !order.deliveryConfirmed) {
                        notifyDeliveryReady(order);
                    }
                }
            });
        });
}

function notifyNewOrder(order) {
    createNotification(APP.userProfile.uid, '🔔 New Order!',
        `Order #${order.orderId || ''}: ${order.items?.[0]?.name || 'Product'} - ${formatCurrency(order.total)}`,
        '🔔', 'orders');
    playNotificationSound();
    if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 200]);
    flashNotificationBadge();
}

function notifyDeliveryReady(order) {
    createNotification(APP.userProfile.uid, '✅ Delivery Confirmed!',
        'Please confirm delivery or open a dispute within 7 days.',
        '✅', 'orders');
    playNotificationSound();
    if (navigator.vibrate) navigator.vibrate(300);
}

function playNotificationSound() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = 800; osc.type = 'sine'; gain.gain.value = 0.3;
        osc.start();
        setTimeout(() => { osc.stop(); ctx.close(); }, 200);
    } catch(e) {}
}

function flashNotificationBadge() {
    const badge = document.getElementById('notification-badge');
    if (badge) {
        badge.style.background = '#FF0000';
        badge.style.animation = 'pulse 0.5s 3';
        setTimeout(() => { badge.style.background = 'var(--red)'; badge.style.animation = ''; }, 2000);
    }
}

// ADMIN FEED MESSAGE
async function sendAdminFeedMessage(message) {
    if (APP.userProfile?.accountType !== 'admin') return;
    
    try {
        await db.collection('admin_feed').add({
            message: message,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            createdBy: APP.userProfile.uid
        });
        console.log('✅ Admin feed message sent');
    } catch (error) {
        console.error('Feed message error:', error);
    }
}

function startLiveFeedUpdates() {
    updateLiveFeed();
    setInterval(updateLiveFeed, 30000);
}

async function updateLiveFeed() {
    const feed = document.getElementById('live-feed-content');
    if (!feed) return;
    
    try {
        // Get recent purchases
        const orderSnap = await db.collection('orders')
            .where('status', 'in', ['processing', 'shipped', 'delivered', 'completed'])
            .get();
        
        const orders = [];
        orderSnap.forEach(d => orders.push(d.data()));
        orders.sort((a, b) => (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0));
        
        // Get admin messages
        const adminSnap = await db.collection('admin_feed').get();
        const adminMsgs = [];
        adminSnap.forEach(d => adminMsgs.push(d.data()));
        adminMsgs.sort((a, b) => (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0));
        
        const messages = [];
        
        // Add admin messages
        adminMsgs.slice(0, 3).forEach(msg => {
            messages.push(`📢 ${msg.message}`);
        });
        
        // Add recent purchases
        orders.slice(0, 10).forEach(order => {
            const name = order.userName || order.userEmail?.split('@')[0] || 'Someone';
            const product = order.items?.[0]?.name || 'a product';
            messages.push(`🛒 ${name} purchased "${product}"`);
        });
        
        if (messages.length === 0) {
            feed.innerHTML = '<span class="live-dot"></span> Live: Marketplace active 🌍';
        } else {
            feed.innerHTML = '<span class="live-dot"></span> ' + messages.join(' • ');
        }
    } catch (e) {
        feed.innerHTML = '<span class="live-dot"></span> Live: Marketplace active 🌍';
    }
}

// =====================
// BACKEND-ONLY BALANCE OPERATIONS
// All balance writes go through backend API
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
// CHECK SUBSCRIPTION STATUS
// =====================
async function checkSubscriptionStatus(userData) {
    if (!userData) return;
    const now = new Date();
    const notifications = [];
    
    if (userData.isAffiliate && userData.affiliateSubscriptionExpiry) {
        const expiry = userData.affiliateSubscriptionExpiry.toDate();
        const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
        
        if (daysLeft <= 0) {
            await db.collection('users').doc(userData.uid).update({
                isAffiliate: false, affiliateSubscription: false
            });
            notifications.push({ title: 'Subscription Expired', message: 'Your affiliate subscription has expired.', icon: '⚠️' });
        } else if (daysLeft <= 5) {
            notifications.push({ title: 'Expiring Soon', message: `Affiliate subscription expires in ${daysLeft} days.`, icon: '⏰' });
        }
    }
    
    if (userData.isDropshipper && userData.dropshipPlanExpiry) {
        const expiry = userData.dropshipPlanExpiry.toDate();
        const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
        
        if (daysLeft <= 0) {
            await db.collection('users').doc(userData.uid).update({
                isDropshipper: false, dropshipPlan: 'none'
            });
            notifications.push({ title: 'Dropship Plan Expired', message: 'Your dropship plan has expired.', icon: '⚠️' });
        } else if (daysLeft <= 5) {
            notifications.push({ title: 'Plan Expiring', message: `Dropship plan expires in ${daysLeft} days.`, icon: '⏰' });
        }
    }
    
    for (const notif of notifications) {
        await createNotification(userData.uid, notif.title, notif.message, notif.icon, 'profile');
    }
}

function handleDeepLinks() {
    const productId = sessionStorage.getItem('deep_link_product');
    if (productId) {
        sessionStorage.removeItem('deep_link_product');
        setTimeout(() => { if (isLoggedIn()) navigateTo('product-detail', { productId }); }, 1500);
    }
    
    const affiliateClick = sessionStorage.getItem('affiliate_click');
    if (affiliateClick) {
        const { affiliateId, productId } = JSON.parse(affiliateClick);
        sessionStorage.removeItem('affiliate_click');
        trackAffiliateClick(affiliateId, productId);
        setTimeout(() => { if (isLoggedIn()) navigateTo('product-detail', { productId }); }, 1500);
    }
    
    const storeView = sessionStorage.getItem('store_view');
    if (storeView) {
        sessionStorage.removeItem('store_view');
        setTimeout(() => { navigateTo('dropship-store', { username: storeView }); }, 1500);
    }
}

async function trackAffiliateClick(affiliateId, productId) {
    try {
        const snapshot = await db.collection('affiliate_products')
            .where('affiliateId', '==', affiliateId)
            .where('productId', '==', productId)
            .limit(1).get();
        if (!snapshot.empty) {
            await snapshot.docs[0].ref.update({ clicks: firebase.firestore.FieldValue.increment(1) });
        }
    } catch (error) { console.warn('Click tracking error:', error); }
}

function startSubscriptionCheck() {
    setInterval(async () => {
        if (APP.userProfile) await checkSubscriptionStatus(APP.userProfile);
    }, 3600000);
}

document.addEventListener('DOMContentLoaded', initializeApp);