// notifications.js - COMPLETE UPDATED (Recruit requests, Influencer notifications)

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
        
        // Also get recruit requests
        const recruitSnap = await db.collection('recruit_requests')
            .where('affiliateId', '==', userId)
            .where('status', '==', 'pending')
            .get();
        
        if (snapshot.empty && recruitSnap.empty) {
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
            notifications.push({ id: doc.id, ...doc.data(), type: 'notification' });
        });
        
        recruitSnap.forEach(doc => {
            const data = doc.data();
            notifications.push({
                id: doc.id,
                title: '📢 Recruitment Request!',
                message: `${data.dropshipperName || 'A dropshipper'} wants you to promote "${data.productName || 'a product'}" at ${data.commission || 5}% commission.`,
                icon: '📢',
                link: 'recruit-request',
                read: false,
                type: 'recruit_request',
                recruitData: { id: doc.id, ...data },
                createdAt: data.createdAt
            });
        });
        
        // Sort by newest
        notifications.sort((a, b) => {
            const timeA = a.createdAt?.toDate?.() || a.createdAt || 0;
            const timeB = b.createdAt?.toDate?.() || b.createdAt || 0;
            return timeB - timeA;
        });
        
        container.innerHTML = '';
        notifications.forEach(notif => {
            const time = getTimeAgo(notif.createdAt);
            
            if (notif.type === 'recruit_request') {
                // Special recruit request notification with accept/reject buttons
                container.innerHTML += `
                    <div style="padding:15px;border-bottom:1px solid #f0f0f0;background:#FFFDE7;">
                        <div style="display:flex;gap:12px;">
                            <span style="font-size:30px;">${notif.icon || '📢'}</span>
                            <div style="flex:1;">
                                <div style="font-weight:600;margin-bottom:3px;">${notif.title}</div>
                                <div style="font-size:14px;color:#666;">${notif.message}</div>
                                <div style="font-size:11px;color:#999;margin-top:5px;">${time}</div>
                                <div style="display:flex;gap:8px;margin-top:10px;">
                                    <button class="btn-small btn-success" onclick="acceptRecruitRequest('${notif.recruitData.id}')">✅ Accept</button>
                                    <button class="btn-small btn-danger" onclick="rejectRecruitRequest('${notif.recruitData.id}')">❌ Reject</button>
                                    <button class="btn-small btn-outline" onclick="viewRecruitDetails('${notif.recruitData.id}')">👁️ Details</button>
                                </div>
                            </div>
                        </div>
                    </div>`;
            } else {
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
            }
        });
        
        // Mark regular notifications as read
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

// =====================
// RECRUIT REQUEST HANDLERS
// =====================
async function viewRecruitDetails(requestId) {
    try {
        const doc = await db.collection('recruit_requests').doc(requestId).get();
        if (!doc.exists) { showToast('Request not found', 'error'); return; }
        
        const req = doc.data();
        
        // Get product details
        const productDoc = await db.collection('products').doc(req.productId).get();
        const product = productDoc.exists ? productDoc.data() : null;
        
        showModal(`
            <div style="padding:10px;">
                <h3>📢 Recruitment Request Details</h3>
                <div style="background:#f5f5f5;padding:15px;border-radius:8px;margin:15px 0;">
                    <p><strong>From:</strong> ${req.dropshipperName || 'Dropshipper'}</p>
                    <p><strong>Product:</strong> ${req.productName || 'Product'}</p>
                    <p><strong>Price:</strong> ${formatCurrency(req.productPrice || 0)}</p>
                    <p><strong>Commission:</strong> ${req.commission || 5}%</p>
                    <p><strong>Your Earnings per Sale:</strong> ${formatCurrency((req.productPrice || 0) * (req.commission || 5) / 100)}</p>
                    ${product ? `
                        <p><strong>Stock:</strong> ${product.stock || 'N/A'}</p>
                        <p><strong>Sales:</strong> ${product.totalSales || 0}</p>
                        ${product.sponsored ? '<p>⭐ <strong>Sponsored Product</strong></p>' : ''}
                        ${product.discountCode ? '<p>🎫 <strong>Discount Available:</strong> ' + product.discountCode.code + '</p>' : ''}
                    ` : ''}
                </div>
                <div style="display:flex;gap:10px;">
                    <button class="btn-success" style="flex:1;" onclick="acceptRecruitRequest('${requestId}')">✅ Accept</button>
                    <button class="btn-danger" style="flex:1;" onclick="rejectRecruitRequest('${requestId}')">❌ Reject</button>
                </div>
            </div>
        `);
    } catch (error) {
        showToast('Error loading details', 'error');
    }
}

async function acceptRecruitRequest(requestId) {
    hideModal();
    showLoader();
    
    try {
        const doc = await db.collection('recruit_requests').doc(requestId).get();
        if (!doc.exists) { hideLoader(); showToast('Request not found', 'error'); return; }
        
        const req = doc.data();
        
        // Install the product for the affiliate
        const affiliateLink = `${APP.baseUrl}/r/${APP.userProfile.uid}/${req.productId}`;
        
        await db.collection('affiliate_products').add({
            affiliateId: APP.userProfile.uid,
            productId: req.productId,
            productName: req.productName,
            productImage: req.productImage || '',
            productPrice: req.productPrice,
            commissionPercentage: req.commission,
            affiliateLink: affiliateLink,
            status: 'active',
            isDropshipProduct: true,
            dropshipperId: req.dropshipperId,
            clicks: 0,
            conversions: 0,
            totalCommission: 0,
            installedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Update recruit request status
        await db.collection('recruit_requests').doc(requestId).update({
            status: 'accepted',
            acceptedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Update product total affiliates
        await db.collection('products').doc(req.productId).update({
            totalAffiliates: firebase.firestore.FieldValue.increment(1)
        });
        
        // Notify dropshipper
        await createNotification(req.dropshipperId,
            '✅ Recruit Accepted!',
            `${APP.userProfile.displayName || APP.userProfile.username} accepted your recruitment request for "${req.productName}".`,
            '✅', 'dropship');
        
        hideLoader();
        showToast('Recruitment accepted! Product installed. ✅', 'success');
        loadNotificationsScreen();
        
    } catch (error) {
        hideLoader();
        console.error('Accept error:', error);
        showToast('Failed to accept', 'error');
    }
}

async function rejectRecruitRequest(requestId) {
    hideModal();
    showLoader();
    
    try {
        const doc = await db.collection('recruit_requests').doc(requestId).get();
        if (!doc.exists) { hideLoader(); showToast('Request not found', 'error'); return; }
        
        const req = doc.data();
        
        await db.collection('recruit_requests').doc(requestId).update({
            status: 'rejected',
            rejectedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Notify dropshipper
        await createNotification(req.dropshipperId,
            '❌ Recruit Rejected',
            `${APP.userProfile.displayName || APP.userProfile.username} rejected your recruitment request for "${req.productName}".`,
            '❌', 'dropship');
        
        hideLoader();
        showToast('Request rejected', 'info');
        loadNotificationsScreen();
        
    } catch (error) {
        hideLoader();
        showToast('Failed to reject', 'error');
    }
}

// =====================
// INFLUENCER APPROVAL/REJECTION NOTIFICATION
// =====================
async function notifyInfluencerApproval(userId) {
    await db.collection('users').doc(userId).update({
        influencerStatus: 'approved',
        advertiserSubscription: true,
        influencerApprovedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    await createNotification(userId,
        '✅ Application Approved!',
        'Your influencer application has been approved! You are now listed in the marketplace.',
        '✅', 'advertisers');
    
    sendPushNotification('✅ Approved!', 'Your influencer application has been approved!');
}

async function notifyInfluencerRejection(userId) {
    await db.collection('users').doc(userId).update({
        influencerStatus: 'rejected',
        influencerRejectedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    await createNotification(userId,
        '❌ Application Rejected',
        'Your influencer application was not approved. You cannot reapply.',
        '❌', 'profile');
}

// =====================
// UPDATE ADVERTISERS LIST WITH INFLUENCER DETAILS
// =====================
async function loadAdvertisers() {
    const container = document.getElementById('advertisers-list');
    if (!container) return;
    
    container.innerHTML = '<p style="text-align:center;padding:40px;">Loading influencers...</p>';
    
    try {
        // Get approved influencers
        const snapshot = await db.collection('users')
            .where('influencerStatus', '==', 'approved')
            .get();
        
        if (snapshot.empty) {
            container.innerHTML = '<p style="text-align:center;padding:40px;">No verified influencers available yet</p>';
            return;
        }
        
        const influencers = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            influencers.push({ id: doc.id, ...data });
        });
        
        container.innerHTML = '';
        influencers.forEach(inf => {
            const platforms = (inf.influencerPlatforms || []).map(p => {
                const platform = APP.socialPlatforms.find(sp => sp.id === p);
                return platform ? `<span style="font-size:20px;" title="${platform.name}">${platform.icon}</span>` : '';
            }).join(' ');
            
            const creditScore = inf.influencerCreditScore || Math.floor(Math.random() * 5) + 1;
            
            container.innerHTML += `
                <div style="padding:15px;background:white;border-radius:12px;box-shadow:var(--shadow);margin-bottom:12px;">
                    <div style="display:flex;gap:12px;align-items:center;margin-bottom:10px;">
                        <img src="${inf.photoURL || '/app-icon.png'}" style="width:50px;height:50px;border-radius:50%;" onerror="this.src='/app-icon.png'">
                        <div style="flex:1;">
                            <div style="font-weight:600;">${inf.influencerName || inf.displayName || inf.username}</div>
                            <div style="font-size:12px;color:#666;">Credit Score: ${'⭐'.repeat(creditScore)}</div>
                            <div style="font-size:12px;margin-top:3px;">${platforms}</div>
                        </div>
                    </div>
                    ${inf.influencerPhone ? `
                        <a href="https://wa.me/${inf.influencerPhone.replace(/\+/g,'')}?text=Hi! I found you on ONESHOPLIFY and would like to discuss a promotion opportunity." 
                           target="_blank" 
                           style="display:block;text-align:center;padding:10px;background:#25D366;color:white;border-radius:8px;text-decoration:none;font-weight:600;margin-top:10px;">
                            💬 Contact on WhatsApp
                        </a>
                    ` : ''}
                </div>`;
        });
        
    } catch (error) {
        console.error('Advertisers error:', error);
        container.innerHTML = '<p style="text-align:center;padding:40px;">Unable to load influencers</p>';
    }
}

async function handleNotificationClick(notificationId, link) {
    try {
        await db.collection('notifications').doc(notificationId).update({ read: true });
        
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
            if (!doc.data().read) batch.update(doc.ref, { read: true });
        });
        
        if (snapshot.size > 0) await batch.commit().catch(() => {});
    } catch (error) {
        console.warn('Mark read error:', error);
    }
}

async function updateNotificationBadge() {
    const badge = document.getElementById('notification-badge');
    if (!badge) return;
    
    const userId = APP.userProfile?.uid || APP.currentUser?.uid;
    if (!userId) { badge.style.display = 'none'; return; }
    
    try {
        const notifSnap = await db.collection('notifications')
            .where('userId', '==', userId)
            .get();
        
        const recruitSnap = await db.collection('recruit_requests')
            .where('affiliateId', '==', userId)
            .where('status', '==', 'pending')
            .get();
        
        let unread = 0;
        notifSnap.forEach(doc => { if (!doc.data().read) unread++; });
        unread += recruitSnap.size;
        
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
            userId, title, message,
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
