// notifications.js - COMPLETE WORKING VERSION
async function loadNotificationsScreen() {
    const container = document.getElementById('notifications-list');
    if (!container) return;
    
    const userId = APP.userProfile?.uid || APP.currentUser?.uid;
    if (!userId) {
        container.innerHTML = '<p style="text-align:center;padding:40px;">Please login</p>';
        return;
    }
    
    container.innerHTML = '<p style="text-align:center;padding:40px;">Loading notifications...</p>';
    
    try {
        const snapshot = await db.collection('notifications')
            .where('userId', '==', userId)
            .get();
        
        if (snapshot.empty) {
            container.innerHTML = `
                <div style="text-align:center;padding:60px 20px;">
                    <p style="font-size:50px;">🔔</p>
                    <h3>No Notifications</h3>
                    <p style="color:#666;">We'll notify you when something happens</p>
                </div>`;
            return;
        }
        
        const notifications = [];
        snapshot.forEach(doc => {
            notifications.push({ id: doc.id, ...doc.data() });
        });
        
        // Sort by newest first
        notifications.sort((a, b) => {
            const timeA = a.createdAt?.toDate?.() || a.createdAt || 0;
            const timeB = b.createdAt?.toDate?.() || b.createdAt || 0;
            return timeB - timeA;
        });
        
        container.innerHTML = '';
        notifications.forEach(notif => {
            const time = getTimeAgo(notif.createdAt);
            container.innerHTML += `
                <div class="notification-item ${notif.read ? '' : 'unread'}" 
                     onclick="handleNotificationClick('${notif.id}', '${notif.link || ''}')"
                     style="cursor:pointer;padding:15px;border-bottom:1px solid #f0f0f0;">
                    <span style="font-size:30px;margin-right:12px;">${notif.icon || '📢'}</span>
                    <div style="flex:1;">
                        <div style="font-weight:600;margin-bottom:3px;">${notif.title || 'Notification'}</div>
                        <div style="font-size:14px;color:#666;">${notif.message || ''}</div>
                        <div style="font-size:11px;color:#999;margin-top:5px;">${time}</div>
                    </div>
                    ${!notif.read ? '<span style="color:var(--gold);font-size:20px;">●</span>' : ''}
                </div>`;
        });
        
        // Mark all as read in background
        markAllNotificationsRead(userId);
        
    } catch (error) {
        console.error('Notifications error:', error);
        container.innerHTML = `
            <div style="text-align:center;padding:40px;">
                <p>Unable to load notifications</p>
                <button class="btn-outline" onclick="loadNotificationsScreen()" style="margin-top:15px;">Retry</button>
            </div>`;
    }
}

async function handleNotificationClick(notificationId, link) {
    try {
        await db.collection('notifications').doc(notificationId).update({ read: true });
        
        // Remove unread styling
        const items = document.querySelectorAll('.notification-item');
        items.forEach(item => item.classList.remove('unread'));
        
        if (link && link !== 'none' && link !== '') {
            navigateTo(link);
        }
    } catch (error) {
        console.error('Notification click error:', error);
    }
}

async function markAllNotificationsRead(userId) {
    try {
        const snapshot = await db.collection('notifications')
            .where('userId', '==', userId)
            .get();
        
        const batch = db.batch();
        snapshot.forEach(doc => {
            if (!doc.data().read) {
                batch.update(doc.ref, { read: true });
            }
        });
        
        if (snapshot.size > 0) {
            await batch.commit().catch(() => {});
        }
    } catch (error) {
        console.warn('Mark read error:', error);
    }
}

async function updateNotificationBadge() {
    const badge = document.getElementById('notification-badge');
    if (!badge) return;
    
    const userId = APP.userProfile?.uid || APP.currentUser?.uid;
    if (!userId) {
        badge.style.display = 'none';
        return;
    }
    
    try {
        const snapshot = await db.collection('notifications')
            .where('userId', '==', userId)
            .get();
        
        let unread = 0;
        snapshot.forEach(doc => {
            if (!doc.data().read) unread++;
        });
        
        if (unread > 0) {
            badge.textContent = unread > 99 ? '99+' : unread;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    } catch (error) {
        badge.style.display = 'none';
    }
}

async function createNotification(userId, title, message, icon, link) {
    try {
        await db.collection('notifications').add({
            userId: userId,
            title: title,
            message: message,
            icon: icon || '📢',
            link: link || 'none',
            read: false,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('✅ Notification created for:', userId);
    } catch (error) {
        console.error('Create notification error:', error);
    }
}

// Check subscription expiry and send notifications
async function checkSubscriptionExpiry() {
    if (!APP.userProfile) return;
    
    const userId = APP.userProfile.uid;
    const now = new Date();
    
    // Check affiliate
    if (APP.userProfile.isAffiliate && APP.userProfile.affiliateSubscriptionExpiry) {
        const expiry = APP.userProfile.affiliateSubscriptionExpiry.toDate();
        const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
        
        if (daysLeft <= 3 && daysLeft > 0) {
            await createNotification(userId,
                '⏰ Subscription Expiring Soon',
                `Your affiliate subscription expires in ${daysLeft} day${daysLeft > 1 ? 's' : ''}. Renew now!`,
                '⏰',
                'profile'
            );
        } else if (daysLeft <= 0) {
            await db.collection('users').doc(userId).update({
                isAffiliate: false,
                affiliateSubscription: false
            });
            APP.userProfile.isAffiliate = false;
            APP.userProfile.affiliateSubscription = false;
            
            await createNotification(userId,
                '⚠️ Subscription Expired',
                'Your affiliate subscription has expired. Renew to continue earning.',
                '⚠️',
                'profile'
            );
        }
    }
    
    // Check dropship
    if (APP.userProfile.isDropshipper && APP.userProfile.dropshipPlanExpiry) {
        const expiry = APP.userProfile.dropshipPlanExpiry.toDate();
        const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
        
        if (daysLeft <= 3 && daysLeft > 0) {
            await createNotification(userId,
                '⏰ Dropship Plan Expiring',
                `Your ${APP.userProfile.dropshipPlan} plan expires in ${daysLeft} day${daysLeft > 1 ? 's' : ''}. Renew now!`,
                '⏰',
                'profile'
            );
        } else if (daysLeft <= 0) {
            await db.collection('users').doc(userId).update({
                isDropshipper: false,
                dropshipPlan: 'none'
            });
            APP.userProfile.isDropshipper = false;
            APP.userProfile.dropshipPlan = 'none';
            
            await createNotification(userId,
                '⚠️ Dropship Plan Expired',
                'Your dropship plan has expired. Renew to continue.',
                '⚠️',
                'profile'
            );
        }
    }
}

// Run expiry check periodically
setInterval(() => {
    if (APP.userProfile) checkSubscriptionExpiry();
}, 60000); // Every minute