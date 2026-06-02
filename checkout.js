// ============ Checkout Module ============

async function loadCheckout(data) {
    if (!requireAuth()) return;
    const container = document.getElementById('checkout-content');
    if (!container) return;
    
    if (APP_STATE.cart.length === 0) {
        container.innerHTML = `<div style="text-align:center;padding:60px;"><i class="fas fa-shopping-cart" style="font-size:60px;color:#ddd;"></i><h3>Cart Empty</h3><button class="btn-gold mt-20" onclick="navigateTo('marketplace')">Browse</button></div>`;
        return;
    }
    
    const total = APP_STATE.cart.reduce((s, i) => s + i.total, 0);
    const profile = await refreshUserProfile();
    
    container.innerHTML = `
        <h3>Checkout</h3>
        <div class="section"><h4>📦 Shipping</h4>
            <div style="display:flex;flex-direction:column;gap:10px;">
                <div class="form-group"><label>Full Name *</label><input type="text" id="ship-name" required value="${profile.displayName||''}"></div>
                <div class="form-group"><label>Country *</label><select id="ship-country" required>${COUNTRIES.map(c=>`<option value="${c.code}" ${c.code===profile.country?'selected':''}>${c.flag} ${c.name}</option>`).join('')}</select></div>
                <div class="form-group"><label>State *</label><input type="text" id="ship-state" required></div>
                <div class="form-group"><label>City *</label><input type="text" id="ship-city" required></div>
                <div class="form-group"><label>Address *</label><input type="text" id="ship-address" required></div>
                <div class="form-group"><label>Postal Code *</label><input type="text" id="ship-postal" required></div>
                <div class="form-group"><label>Phone *</label><input type="tel" id="ship-phone" required></div>
                <div class="form-group"><label>Email</label><input type="email" id="ship-email" value="${APP_STATE.currentUser.email}"></div>
            </div>
        </div>
        <div class="section">
            <h4>🛍️ Order Summary</h4>
            <div style="background:#f9f9f9;border-radius:12px;padding:16px;">
                ${APP_STATE.cart.map((item,i) => `
                    <div style="display:flex;gap:10px;padding:8px 0;border-bottom:1px solid #eee;align-items:center;">
                        <img src="${item.image||'app-icon.png'}" style="width:50px;height:50px;border-radius:8px;object-fit:cover;">
                        <div style="flex:1;"><p style="font-weight:600;">${item.name}</p><p style="font-size:11px;color:#999;">${item.color||''} ${item.size||''} ×${item.quantity}</p></div>
                        <p style="font-weight:700;color:#FFD700;">${formatCurrency(item.total)}</p>
                        <button style="background:none;border:none;color:#FF4444;cursor:pointer;" onclick="removeFromCart(${i})">×</button>
                    </div>
                `).join('')}
                <div style="display:flex;justify-content:space-between;padding:12px 0;font-size:16px;font-weight:700;border-top:2px solid #FFD700;"><span>Total</span><span style="color:#FFD700;">${formatCurrency(total)}</span></div>
            </div>
        </div>
        <div style="margin-top:16px;">
            <p style="font-weight:600;">💳 Wallet Balance: ${formatCurrency(profile.walletBalance||0)}</p>
            <button class="btn-gold" onclick="processCheckout()" style="width:100%;" ${total>(profile.walletBalance||0)?'disabled':''}>${total>(profile.walletBalance||0)?'Insufficient Balance':'Pay '+formatCurrency(total)}</button>
            ${total>(profile.walletBalance||0)?'<button class="btn-gold mt-10" onclick="navigateTo(\'wallet\')" style="width:100%;">Deposit Funds</button>':''}
        </div>
        <p style="font-size:11px;color:#999;text-align:center;margin-top:12px;">🔒 Funds held in escrow until delivery</p>
    `;
}

function removeFromCart(index) {
    APP_STATE.cart.splice(index, 1);
    localStorage.setItem('shoplify_cart', JSON.stringify(APP_STATE.cart));
    loadCheckout();
    showToast('Removed', 'info');
}

async function processCheckout() {
    if (!requireAuth()) return;
    const name = document.getElementById('ship-name')?.value?.trim();
    const country = document.getElementById('ship-country')?.value;
    const state = document.getElementById('ship-state')?.value?.trim();
    const city = document.getElementById('ship-city')?.value?.trim();
    const address = document.getElementById('ship-address')?.value?.trim();
    const postal = document.getElementById('ship-postal')?.value?.trim();
    const phone = document.getElementById('ship-phone')?.value?.trim();
    const email = document.getElementById('ship-email')?.value?.trim();
    
    if (!name||!country||!state||!city||!address||!postal||!phone) { showToast('Fill all fields','error'); return; }
    if (APP_STATE.cart.length===0) { showToast('Cart empty','error'); return; }
    
    const total = APP_STATE.cart.reduce((s,i)=>s+i.total,0);
    const profile = await refreshUserProfile();
    if (total>(profile.walletBalance||0)) { showToast('Insufficient balance','error'); return; }
    
    showLoader();
    try {
        const ordersByMerchant = {};
        for (const item of APP_STATE.cart) {
            const product = await getFromFirestore('products', item.productId);
            if (!product) continue;
            const mid = product.merchantId || 'unknown';
            if (!ordersByMerchant[mid]) ordersByMerchant[mid] = { merchantId: mid, items: [], total: 0 };
            ordersByMerchant[mid].items.push(item);
            ordersByMerchant[mid].total += item.total;
        }
        
        for (const [mid, od] of Object.entries(ordersByMerchant)) {
            const orderId = generateId('ord');
            await saveToFirestore('orders', orderId, {
                userId: APP_STATE.currentUser.uid, userEmail: email, merchantId: mid,
                items: od.items, total: od.total, escrowAmount: od.total, status: 'processing',
                shipping: { name, country, state, city, address, postal, phone, email },
                trackingNumber: '', createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                deliveryConfirmed: false, disputed: false
            });
            
            for (const item of od.items) {
                const product = await getFromFirestore('products', item.productId);
                if (product) {
                    await saveToFirestore('products', item.productId, { stock: Math.max(0,(product.stock||0)-item.quantity), totalSales: (product.totalSales||0)+item.quantity });
                }
            }
            
            await saveToFirestore('users', APP_STATE.currentUser.uid, { walletBalance: (profile.walletBalance||0)-od.total, escrowBalance: (profile.escrowBalance||0)+od.total });
            await saveToFirestore('transactions', orderId, { userId: APP_STATE.currentUser.uid, type: 'purchase', amount: od.total, reference: orderId, status: 'escrow', createdAt: firebase.firestore.FieldValue.serverTimestamp() });
            await sendNotification(mid, 'New Order!', `New order worth ${formatCurrency(od.total)}`, '📦');
            
            // Process affiliate commissions
            for (const item of od.items) {
                const affSnap = await db.collection('affiliate_products').where('productId','==',item.productId).where('status','==','active').limit(1).get();
                if (!affSnap.empty) {
                    const ad = affSnap.docs[0].data();
                    const comm = calculateCommission(item.total, ad.commissionPercentage);
                    await db.collection('affiliate_products').doc(affSnap.docs[0].id).update({ conversions: firebase.firestore.FieldValue.increment(1), totalCommission: firebase.firestore.FieldValue.increment(comm) });
                    const aff = await getFromFirestore('users', ad.affiliateId);
                    if (aff) await saveToFirestore('users', ad.affiliateId, { pendingEarnings: (aff.pendingEarnings||0)+comm });
                }
            }
        }
        
        APP_STATE.cart = [];
        localStorage.removeItem('shoplify_cart');
        hideLoader();
        showToast('✅ Order placed! Funds in escrow.','success');
        navigateTo('orders');
    } catch (e) { hideLoader(); showToast('Error','error'); }
}

window.removeFromCart = removeFromCart;
window.processCheckout = processCheckout;

console.log('✅ Checkout module ready');