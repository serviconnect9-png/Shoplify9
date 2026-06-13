// orders.js - COMPLETE FINAL VERSION (Fixed Discount in Escrow, Correct Seller Payment)

// =====================
// CHECKOUT
// =====================
async function loadCheckout() {
    const container = document.getElementById('checkout-content');
    if (!container) return;
    
    const cart = JSON.parse(sessionStorage.getItem('shoplify_cart') || '[]');
    
    if (cart.length === 0) {
        container.innerHTML = `<div style="text-align:center;padding:60px;"><p style="font-size:50px;">🛒</p><h3>Cart is empty</h3><button class="btn-gold" onclick="navigateTo('marketplace')">Shop Now</button></div>`;
        return;
    }
    
    let subtotal = 0, totalDiscount = 0;
    
    container.innerHTML = `
        <div style="padding:15px;">
            <h4>📦 Items (${cart.reduce((s,i)=>s+i.quantity,0)})</h4>
            ${cart.map((item, index) => {
                const disc = item.discountCode ? (item.discountCode.type==='percentage'?item.price*item.discountCode.value/100:item.discountCode.value) : 0;
                subtotal += item.price * item.quantity;
                totalDiscount += disc * item.quantity;
                return `
                    <div style="display:flex;gap:10px;padding:10px 0;border-bottom:1px solid #f0f0f0;align-items:center;">
                        <img src="${item.image||'/app-icon.png'}" style="width:50px;height:50px;border-radius:8px;">
                        <div style="flex:1;">
                            <div style="font-weight:600;font-size:14px;">${item.name}</div>
                            <div style="font-size:12px;color:#666;">${item.color?'Color:'+item.color+' ':''}${item.size?'Size:'+item.size+' ':''}Qty:${item.quantity}</div>
                            <div style="font-weight:700;">${formatCurrency((item.price-disc)*item.quantity)}</div>
                        </div>
                        <button onclick="removeCartItem(${index})" style="background:none;border:none;font-size:18px;color:#999;cursor:pointer;">✕</button>
                    </div>`;
            }).join('')}
            
            <div style="margin-top:15px;"><h4>🎫 Discount Code</h4><div style="display:flex;gap:8px;"><input type="text" id="checkout-discount-code" class="input-field" placeholder="Enter code" style="flex:1;"><button class="btn-outline" onclick="applyCheckoutDiscount()">Apply</button></div><small id="discount-message" style="display:none;"></small></div>
            
            <div style="margin-top:15px;"><h4>📍 Shipping Address</h4>
                <div class="input-group"><label>Country *</label><select id="shipping-country" class="input-field">${typeof COUNTRIES!=='undefined'?Object.entries(COUNTRIES).sort((a,b)=>a[1].name.localeCompare(b[1].name)).map(([c,d])=>`<option value="${c}" ${APP.userProfile?.country===c?'selected':''}>${d.flag||''} ${d.name}</option>`).join(''):''}</select></div>
                <div class="input-group"><label>Full Name *</label><input type="text" id="shipping-name" class="input-field" value="${APP.userProfile?.displayName||''}"></div>
                <div class="input-group"><label>Phone *</label><input type="tel" id="shipping-phone" class="input-field" value="${APP.userProfile?.phoneNumber||''}"></div>
                <div class="input-group"><label>City</label><input type="text" id="shipping-city" class="input-field"></div>
                <div class="input-group"><label>Address *</label><textarea id="shipping-address" class="input-field" rows="2"></textarea></div>
            </div>
            
            <div class="order-summary" style="margin-top:15px;">
                <div class="summary-row"><span>Subtotal</span><span>${formatCurrency(subtotal)}</span></div>
                <div class="summary-row" id="discount-row" style="display:${totalDiscount>0?'':'none'};color:var(--green);"><span>Discount</span><span>-${formatCurrency(totalDiscount)}</span></div>
                <div class="summary-row total"><span>Total</span><span id="checkout-total">${formatCurrency(subtotal-totalDiscount)}</span></div>
            </div>
            
            <button class="btn-gold btn-full" style="margin-top:15px;" onclick="placeOrder()">💳 Pay ${formatCurrency(subtotal-totalDiscount)} from Wallet</button>
        </div>`;
    
    window._checkoutData = { subtotal, totalDiscount, appliedDiscount: null };
}

function removeCartItem(index) {
    let cart = JSON.parse(sessionStorage.getItem('shoplify_cart')||'[]');
    cart.splice(index,1);
    sessionStorage.setItem('shoplify_cart',JSON.stringify(cart));
    if(typeof updateCartBadge==='function') updateCartBadge();
    loadCheckout();
}

async function applyCheckoutDiscount() {
    const code = document.getElementById('checkout-discount-code')?.value?.trim()?.toUpperCase();
    const msgEl = document.getElementById('discount-message');
    if(!code){msgEl.style.display='block';msgEl.style.color='red';msgEl.textContent='Enter a code';return;}
    try {
        const snap = await db.collection('discount_codes').where('code','==',code).where('active','==',true).get();
        if(snap.empty){msgEl.style.display='block';msgEl.style.color='red';msgEl.textContent='Invalid or expired code';return;}
        const discount = snap.docs[0].data();
        window._checkoutData.appliedDiscount = discount;
        let totalDisc = 0;
        JSON.parse(sessionStorage.getItem('shoplify_cart')||'[]').forEach(item => {
            if(discount.type==='percentage') totalDisc += (item.price*discount.value/100)*item.quantity;
            else totalDisc += Math.min(discount.value,item.price)*item.quantity;
        });
        window._checkoutData.totalDiscount = totalDisc;
        msgEl.style.display='block';msgEl.style.color='green';
        msgEl.textContent = `Applied! Saved ${discount.value}${discount.type==='percentage'?'%':' USD'}`;
        updateCheckoutTotals();
    } catch(e){msgEl.style.display='block';msgEl.style.color='red';msgEl.textContent='Error';}
}

function updateCheckoutTotals() {
    const data = window._checkoutData;
    if(!data) return;
    const total = data.subtotal - data.totalDiscount;
    document.getElementById('discount-row').style.display = data.totalDiscount>0?'':'none';
    document.getElementById('checkout-total').textContent = formatCurrency(total);
    document.querySelector('.btn-gold').textContent = `💳 Pay ${formatCurrency(total)} from Wallet`;
}

// =====================
// PLACE ORDER - FIXED: Discount deducted from escrow
// =====================
async function placeOrder() {
    if(!APP.userProfile){showToast('Please login','error');return;}
    const cart = JSON.parse(sessionStorage.getItem('shoplify_cart')||'[]');
    if(cart.length===0) return;
    
    const country = document.getElementById('shipping-country')?.value;
    const name = document.getElementById('shipping-name')?.value?.trim();
    const phone = document.getElementById('shipping-phone')?.value?.trim();
    const city = document.getElementById('shipping-city')?.value?.trim();
    const address = document.getElementById('shipping-address')?.value?.trim();
    
    if(!country||!name||!phone||!address){showToast('Fill all shipping fields','error');return;}
    
    const data = window._checkoutData;
    const originalTotal = data?.subtotal || 0;
    const discountAmount = data?.totalDiscount || 0;
    const finalTotal = originalTotal - discountAmount; // What customer pays
    
    if(finalTotal > (APP.userProfile.walletBalance||0)){showToast('Insufficient balance. Please deposit.','error');navigateTo('wallet');return;}
    
    showLoader();
    try {
        const orderId = 'OSL-'+new Date().getFullYear()+'-'+String(Date.now()).slice(-6);
        
        // Deduct from customer wallet (discounted price)
        await db.collection('users').doc(APP.userProfile.uid).update({
            walletBalance: firebase.firestore.FieldValue.increment(-finalTotal)
        });
        APP.userProfile.walletBalance -= finalTotal;
        
        // Group by merchant with DISCOUNT applied to seller's portion
        const merchantOrders = {};
        cart.forEach(item => {
            if(!merchantOrders[item.merchantId]) {
                merchantOrders[item.merchantId] = {
                    merchantId: item.merchantId,
                    items: [],
                    sellerTotal: 0,      // What seller receives (after discount)
                    discountTotal: 0,     // Total discount on this merchant's items
                    originalTotal: 0      // Full price before discount
                };
            }
            merchantOrders[item.merchantId].items.push(item);
            
            // Calculate per-item discount
            const itemDiscount = item.discountCode ? 
                (item.discountCode.type==='percentage' ? item.price*item.discountCode.value/100 : item.discountCode.value) : 0;
            const itemPriceAfterDiscount = item.price - itemDiscount;
            
            // Seller only gets the discounted price
            merchantOrders[item.merchantId].sellerTotal += itemPriceAfterDiscount * item.quantity;
            merchantOrders[item.merchantId].discountTotal += itemDiscount * item.quantity;
            merchantOrders[item.merchantId].originalTotal += item.price * item.quantity;
        });
        
        for(const [mid, order] of Object.entries(merchantOrders)){
            // Update discount code usage count
            if(data?.appliedDiscount){
                const discSnap = await db.collection('discount_codes')
                    .where('code','==',data.appliedDiscount.code).limit(1).get();
                if(!discSnap.empty){
                    const discDoc = discSnap.docs[0];
                    const disc = discDoc.data();
                    const usedCount = (disc.usedCount || 0) + 1;
                    const updates = { usedCount };
                    if(disc.maxUses && usedCount >= disc.maxUses) {
                        updates.active = false;
                    }
                    await discDoc.ref.update(updates);
                    
                    // Also update product's discount code usage
                    const prodSnap = await db.collection('products')
                        .where('discountCode.code','==',disc.code)
                        .where('merchantId','==',mid).limit(1).get();
                    if(!prodSnap.empty){
                        const prodUpdates = { 'discountCode.usedCount': usedCount };
                        if(disc.maxUses && usedCount >= disc.maxUses) {
                            prodUpdates['discountCode.active'] = false;
                        }
                        await prodSnap.docs[0].ref.update(prodUpdates);
                    }
                }
            }
            
            // CREATE ORDER - sellerTotal is what seller will receive (already discounted)
            const orderRef = await db.collection('orders').add({
                orderId: orderId+'-'+mid.substring(0,4),
                userId: APP.userProfile.uid,
                userEmail: APP.userProfile.email||'',
                userName: name,
                userPhone: phone,
                merchantId: mid,
                items: order.items,
                originalTotal: order.originalTotal,     // Full price before discount
                discountTotal: order.discountTotal,      // Total discount amount absorbed by seller
                total: order.sellerTotal,               // What seller receives (DISCOUNTED)
                customerPaid: finalTotal,               // What customer actually paid
                escrowAmount: order.sellerTotal,        // ESCROW = SELLER'S PORTION (after discount)
                status: 'pending',
                shipping: {country, city, address, phone, name},
                trackingNumber: null,
                courier: null,
                deliveryType: null,
                deliveryConfirmed: false,
                disputed: false,
                merchantAccepted: false,
                escrowReleased: false,
                discountApplied: data?.appliedDiscount || null,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // ADD TO MERCHANT ESCROW = SELLER'S PORTION ONLY (after discount)
            await db.collection('users').doc(mid).update({
                escrowBalance: firebase.firestore.FieldValue.increment(order.sellerTotal)
            });
            
            // Notify merchant with clear discount info
            const discountNote = order.discountTotal > 0 ? 
                ` ($${order.discountTotal.toFixed(2)} discount applied - you receive: ${formatCurrency(order.sellerTotal)})` : '';
            await createNotification(mid, '🔔 New Order!',
                `Order #${orderId} from ${name}. Amount: ${formatCurrency(order.sellerTotal)}${discountNote}. Action required within 72 hours!`,
                '🔔', 'orders');
        }
        
        // Record transaction for what customer paid
        await db.collection('transactions').add({
            userId: APP.userProfile.uid,
            type: 'purchase',
            amount: finalTotal,              // What customer paid
            originalAmount: originalTotal,   // Full price
            discountAmount: discountAmount,  // Discount saved
            currency: 'USD',
            status: 'escrow',
            reference: orderId,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        sessionStorage.removeItem('shoplify_cart');
        window._checkoutData = null;
        hideLoader();
        if(typeof updateCartBadge==='function') updateCartBadge();
        
        // Voice notification
        const productName = cart[0]?.name || 'product';
        if(typeof speakNotification==='function') speakNotification(`${productName} purchased at ${formatCurrency(finalTotal)}`);
        if(typeof sendPushNotification==='function') sendPushNotification('🛒 Purchase!', `${productName} - ${formatCurrency(finalTotal)}`);
        
        showToast('Order placed! Funds in escrow. 🛡️', 'success');
        navigateTo('orders');
    } catch(error) {
        hideLoader();
        console.error('Order error:', error);
        showToast('Failed to place order', 'error');
    }
}

// =====================
// LOAD ORDERS (Customer & Merchant)
// =====================
async function loadOrdersScreen() {
    const container = document.getElementById('orders-list');
    if(!container||!APP.userProfile) return;
    
    container.innerHTML = '<p style="text-align:center;padding:40px;">Loading orders...</p>';
    
    try {
        const customerSnap = await db.collection('orders').where('userId','==',APP.userProfile.uid).get();
        const merchantSnap = APP.userProfile.isMerchant ? await db.collection('orders').where('merchantId','==',APP.userProfile.uid).get() : {empty:true,docs:[]};
        
        const allOrders = [];
        customerSnap.forEach(doc => allOrders.push({id:doc.id,...doc.data(),role:'customer'}));
        if(!merchantSnap.empty) merchantSnap.forEach(doc => allOrders.push({id:doc.id,...doc.data(),role:'merchant'}));
        
        if(allOrders.length===0){
            container.innerHTML = `<div style="text-align:center;padding:60px;"><p style="font-size:50px;">📦</p><h3>No orders</h3><button class="btn-gold" onclick="navigateTo('marketplace')">Shop Now</button></div>`;
            return;
        }
        
        allOrders.sort((a,b)=>(b.createdAt?.toDate?.()||0)-(a.createdAt?.toDate?.()||0));
        
        container.innerHTML = '';
        allOrders.forEach(order => {
            const sc = {pending:'#FFA000',processing:'#2196F3',shipped:'#9C27B0',in_transit:'#FF9800',out_for_delivery:'#FF5722',delivered:'#4CAF50',completed:'#4CAF50',cancelled:'#F44336',rejected:'#F44336'};
            
            container.innerHTML += `
                <div class="order-card">
                    <div class="order-header">
                        <span><strong>#${order.orderId||order.id.substring(0,8)}</strong></span>
                        <span style="background:${sc[order.status]||'#999'};color:white;padding:3px 10px;border-radius:12px;font-size:11px;">${(order.status||'').replace(/_/g,' ').toUpperCase()} ${order.role==='merchant'?'(Seller)':''}</span>
                    </div>
                    <div style="display:flex;gap:10px;align-items:center;margin-top:8px;">
                        <img src="${order.items?.[0]?.image||'/app-icon.png'}" style="width:50px;height:50px;border-radius:8px;">
                        <div style="flex:1;">
                            <div style="font-weight:600;">${order.items?.[0]?.name||'Product'}</div>
                            ${order.role==='merchant'?`<div style="font-size:12px;color:#666;">👤 ${order.userName} | 📞 ${order.userPhone}</div><div style="font-size:12px;color:#666;">📍 ${order.shipping?.address}, ${order.shipping?.city}, ${order.shipping?.country}</div>`:''}
                            <div style="font-weight:700;">
                                ${formatCurrency(order.total)}
                                ${order.discountTotal > 0 ? `<span style="font-size:11px;color:#f44;">(-${formatCurrency(order.discountTotal)} discount)</span>` : ''}
                                ${order.escrowReleased ? ' ✅ Paid' : ' 🔒 Escrow'}
                            </div>
                        </div>
                    </div>
                    
                    ${order.trackingNumber?`<div style="background:#E3F2FD;padding:8px;border-radius:6px;margin-top:8px;font-size:12px;">📦 ${order.courier||'Standard'}: <strong>${order.trackingNumber}</strong>${order.role==='customer'?` <button class="btn-small btn-outline" onclick="trackOrder('${order.id}')">📍 Track</button>`:''}</div>`:''}
                    
                    ${order.role==='merchant'&&order.status==='pending'?`<div style="display:flex;gap:8px;margin-top:10px;"><button class="btn-small btn-success" onclick="acceptOrder('${order.id}')">✅ Accept</button><button class="btn-small btn-danger" onclick="rejectOrder('${order.id}')">❌ Reject</button></div>`:''}
                    
                    ${order.role==='merchant'&&order.status==='processing'?`<button class="btn-gold btn-full" style="margin-top:8px;" onclick="shipOrder('${order.id}')">📦 Ship Order</button>`:''}
                    
                    ${order.role==='merchant'&&(order.status==='shipped'||order.status==='in_transit')?`<div style="display:flex;gap:5px;margin-top:8px;flex-wrap:wrap;"><button class="btn-small btn-outline" onclick="updateOrderStatus('${order.id}','in_transit')">🚚 In Transit</button><button class="btn-small btn-outline" onclick="updateOrderStatus('${order.id}','out_for_delivery')">📬 Out for Delivery</button><button class="btn-small btn-success" onclick="updateOrderStatus('${order.id}','delivered')">✅ Delivered</button></div>`:''}
                    
                    ${order.role==='merchant'&&order.status==='out_for_delivery'?`<button class="btn-gold btn-full" style="margin-top:8px;" onclick="updateOrderStatus('${order.id}','delivered')">✅ Mark as Delivered</button>`:''}
                    
                    ${order.status==='delivered'&&!order.deliveryConfirmed&&order.role==='customer'?`<button class="btn-gold btn-full" style="margin-top:8px;" onclick="confirmDelivery('${order.id}')">✅ Confirm Delivery</button><button class="btn-outline btn-full" style="margin-top:5px;" onclick="disputeOrder('${order.id}')">⚠️ Open Dispute</button>`:''}
                    
                    ${order.rejectionReason?`<div style="background:#FFEBEE;padding:6px;border-radius:6px;margin-top:8px;font-size:12px;color:#C62828;">❌ ${order.rejectionReason}${order.refundAmount?` (Refunded: ${formatCurrency(order.refundAmount)})`:''}</div>`:''}
                    <div style="font-size:11px;color:#999;margin-top:5px;">${getTimeAgo(order.createdAt)}</div>
                </div>`;
        });
    } catch(error){container.innerHTML='<p style="text-align:center;padding:40px;">Error loading orders</p>';}
}

// =====================
// MERCHANT: ACCEPT ORDER
// =====================
async function acceptOrder(orderId) {
    try {
        const doc = await db.collection('orders').doc(orderId).get();
        if(!doc.exists){showToast('Not found','error');return;}
        const order = doc.data();
        showModal(`
            <div style="padding:10px;"><h3>✅ Accept Order</h3>
            <p>Order: <strong>#${order.orderId||orderId.substring(0,8)}</strong></p>
            <div style="background:#f5f5f5;padding:12px;border-radius:8px;margin:10px 0;">
                <p>👤 ${order.userName} | 📞 ${order.userPhone}</p>
                <p>📍 ${order.shipping?.address}, ${order.shipping?.city}, ${order.shipping?.country}</p>
                <p>📦 ${order.items?.[0]?.name} x${order.items?.[0]?.quantity||1}</p>
                ${order.items?.[0]?.color?`<p>🎨 Color: ${order.items[0].color}</p>`:''}
                ${order.items?.[0]?.size?`<p>📏 Size: ${order.items[0].size}</p>`:''}
                <p>💰 You'll receive: <strong>${formatCurrency(order.total)}</strong>${order.discountTotal>0?` <span style="color:#f44;">(After $${order.discountTotal.toFixed(2)} discount)</span>`:''}</p>
            </div>
            <button class="btn-gold btn-full" onclick="confirmAcceptOrder('${orderId}')">✅ Confirm Accept</button></div>`);
    } catch(e){showToast('Error','error');}
}

async function confirmAcceptOrder(orderId) {
    hideModal(); showLoader();
    try {
        await db.collection('orders').doc(orderId).update({
            status:'processing',merchantAccepted:true,
            merchantAcceptedAt:firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt:firebase.firestore.FieldValue.serverTimestamp()
        });
        const doc = await db.collection('orders').doc(orderId).get();
        await createNotification(doc.data().userId,'✅ Order Accepted!',
            'Your order has been accepted. Seller is preparing shipment.','✅','orders');
        hideLoader(); showToast('Accepted! ✅','success'); loadOrdersScreen();
    } catch(e){hideLoader();showToast('Failed','error');}
}

// =====================
// MERCHANT: REJECT ORDER - Refunds only what customer PAID
// =====================
function rejectOrder(orderId) {
    showModal(`
        <div style="padding:10px;"><h3>❌ Reject Order</h3>
        <div class="input-group"><label>Reason *</label><select id="rejection-reason" class="input-field"><option value="">Select...</option><option value="out_of_stock">Out of Stock</option><option value="cannot_ship">Cannot Ship</option><option value="price_error">Pricing Error</option><option value="other">Other</option></select></div>
        <div class="input-group"><label>Details</label><textarea id="rejection-details" class="input-field" rows="2"></textarea></div>
        <button class="btn-danger btn-full" onclick="confirmRejectOrder('${orderId}')">❌ Confirm & Refund</button></div>`);
}

async function confirmRejectOrder(orderId) {
    const reason = document.getElementById('rejection-reason')?.value;
    const details = document.getElementById('rejection-details')?.value?.trim();
    if(!reason){showToast('Select reason','error');return;}
    hideModal(); showLoader();
    try {
        const doc = await db.collection('orders').doc(orderId).get();
        const order = doc.data();
        
        // FIX: Refund only what customer actually PAID (customerPaid = after discount)
        const refundAmount = order.customerPaid || order.total || 0;
        
        // Remove from merchant escrow (seller's discounted portion)
        await db.collection('users').doc(order.merchantId).update({
            escrowBalance: firebase.firestore.FieldValue.increment(-(order.total || 0))
        });
        
        // REFUND CUSTOMER ONLY WHAT THEY PAID
        await db.collection('users').doc(order.userId).update({
            walletBalance: firebase.firestore.FieldValue.increment(refundAmount)
        });
        
        await db.collection('orders').doc(orderId).update({
            status:'cancelled',merchantRejected:true,
            rejectionReason:reason+(details?': '+details:''),
            refundAmount: refundAmount,
            rejectedAt:firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt:firebase.firestore.FieldValue.serverTimestamp()
        });
        
        await db.collection('transactions').add({
            userId:order.userId,type:'refund',amount:refundAmount,
            currency:'USD',status:'completed',reference:order.orderId,
            description:`Rejected: ${reason}. Refunded: ${formatCurrency(refundAmount)} (Customer paid: ${formatCurrency(order.customerPaid||order.total)})`,
            createdAt:firebase.firestore.FieldValue.serverTimestamp()
        });
        
        await createNotification(order.userId,'❌ Order Rejected',
            `Order rejected. Reason: ${reason}. ${formatCurrency(refundAmount)} refunded.`,'❌','orders');
        
        hideLoader(); showToast(`Refunded ${formatCurrency(refundAmount)} ✅`,'success'); loadOrdersScreen();
    } catch(e){hideLoader();showToast('Failed','error');}
}

// =====================
// MERCHANT: SHIP ORDER
// =====================
function shipOrder(orderId) {
    showModal(`
        <div style="padding:10px;"><h3>📦 Ship Order</h3>
        <div class="input-group"><label>Delivery Type *</label><select id="delivery-type" class="input-field"><option value="">Select...</option><option value="DHL">DHL</option><option value="FedEx">FedEx</option><option value="UPS">UPS</option><option value="EMS">EMS</option><option value="local_delivery">Local Delivery</option><option value="airport_pickup">Airport Pickup</option><option value="port_pickup">Port Pickup</option></select></div>
        <div class="input-group"><label>Courier</label><input type="text" id="courier-name" class="input-field" placeholder="e.g. DHL Express"></div>
        <div class="input-group"><label>Tracking Number *</label><input type="text" id="tracking-number" class="input-field"></div>
        <button class="btn-gold btn-full" onclick="confirmShipOrder('${orderId}')">✅ Ship</button></div>`);
}

async function confirmShipOrder(orderId) {
    const deliveryType = document.getElementById('delivery-type')?.value;
    const courier = document.getElementById('courier-name')?.value?.trim();
    const trackingNumber = document.getElementById('tracking-number')?.value?.trim();
    if(!deliveryType||!trackingNumber){showToast('Fill all fields','error');return;}
    hideModal(); showLoader();
    try {
        await db.collection('orders').doc(orderId).update({
            status:'shipped',deliveryType,courier:courier||deliveryType,trackingNumber,
            shippedAt:firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt:firebase.firestore.FieldValue.serverTimestamp()
        });
        const doc = await db.collection('orders').doc(orderId).get();
        await createNotification(doc.data().userId,'📦 Order Shipped!',
            `Shipped via ${courier||deliveryType}. Tracking: ${trackingNumber}`,'📦','orders');
        hideLoader(); showToast('Shipped! ✅','success'); loadOrdersScreen();
    } catch(e){hideLoader();showToast('Failed','error');}
}

async function updateOrderStatus(orderId, newStatus) {
    showLoader();
    try {
        const updates = {status:newStatus,updatedAt:firebase.firestore.FieldValue.serverTimestamp()};
        if(newStatus==='delivered') updates.deliveredAt = firebase.firestore.FieldValue.serverTimestamp();
        await db.collection('orders').doc(orderId).update(updates);
        
        const doc = await db.collection('orders').doc(orderId).get();
        const order = doc.data();
        const messages = {
            in_transit:'📦 Your order is in transit!',
            out_for_delivery:'📬 Your order is out for delivery today!',
            delivered:'✅ Your order has been delivered! Please confirm delivery to release payment.'
        };
        if(messages[newStatus]) await createNotification(order.userId,'Order Update',messages[newStatus],'📦','orders');
        
        hideLoader(); showToast(`Status: ${newStatus.replace(/_/g,' ')}`,'success'); loadOrdersScreen();
    } catch(e){hideLoader();showToast('Failed','error');}
}

// =====================
// CUSTOMER: CONFIRM DELIVERY - Releases escrow (discounted amount)
// =====================
function confirmDelivery(orderId) {
    showModal(`
        <div style="padding:10px;"><h3>✅ Confirm Delivery</h3>
        <p style="color:#666;margin:10px 0;">Have you received this order?</p>
        <p style="color:#f44;font-size:13px;">⚠️ This will release payment to the seller.</p>
        <button class="btn-gold btn-full" onclick="processDeliveryConfirmation('${orderId}')">✅ Yes, Confirm Delivery</button>
        <button class="btn-outline btn-full" style="margin-top:5px;" onclick="hideModal()">Cancel</button></div>`);
}

async function processDeliveryConfirmation(orderId) {
    hideModal(); showLoader();
    try {
        const doc = await db.collection('orders').doc(orderId).get();
        if(!doc.exists){hideLoader();showToast('Order not found','error');return;}
        const order = doc.data();
        
        if(order.escrowReleased){hideLoader();showToast('Already released','info');return;}
        
        // Seller receives what's in escrow (already discounted amount)
        let sellerAmount = order.total || 0;
        
        // Pay affiliate commission from seller's portion
        if(order.items?.[0]?.affiliateId){
            const affiliateCommission = calculateCommission(sellerAmount, APP.affiliateCommissionMin);
            await db.collection('users').doc(order.items[0].affiliateId).update({
                pendingEarnings: firebase.firestore.FieldValue.increment(affiliateCommission)
            });
            sellerAmount -= affiliateCommission;
            await createNotification(order.items[0].affiliateId,'💰 Commission!',
                `Earned ${formatCurrency(affiliateCommission)} from order #${order.orderId}`,'💰','affiliate');
        }
        
        // Pay dropshipper profit if applicable
        if(order.items?.[0]?.isDropship && order.items?.[0]?.dropshipperId){
            const dropshipProfit = (order.items[0].price - order.items[0].minPrice) * order.items[0].quantity;
            if(dropshipProfit > 0){
                await db.collection('users').doc(order.items[0].dropshipperId).update({
                    walletBalance: firebase.firestore.FieldValue.increment(dropshipProfit)
                });
                await createNotification(order.items[0].dropshipperId,'💰 Dropship Profit!',
                    `Earned ${formatCurrency(dropshipProfit)} from order #${order.orderId}`,'💰','wallet');
            }
        }
        
        // Release remaining to seller from escrow
        await db.collection('users').doc(order.merchantId).update({
            escrowBalance: firebase.firestore.FieldValue.increment(-(order.total || 0)),
            walletBalance: firebase.firestore.FieldValue.increment(sellerAmount)
        });
        
        await db.collection('orders').doc(orderId).update({
            status:'completed',deliveryConfirmed:true,escrowReleased:true,
            sellerReceived: sellerAmount,
            confirmedAt:firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt:firebase.firestore.FieldValue.serverTimestamp()
        });
        
        await db.collection('transactions').add({
            userId:order.merchantId,type:'sale',amount:sellerAmount,
            currency:'USD',status:'completed',reference:order.orderId,
            description:`Escrow released${order.discountTotal>0?` (after $${order.discountTotal.toFixed(2)} discount)`:''}`,
            createdAt:firebase.firestore.FieldValue.serverTimestamp()
        });
        
        await createNotification(order.merchantId,'✅ Payment Released!',
            `${formatCurrency(sellerAmount)} released for order #${order.orderId}.${order.discountTotal>0?` ($${order.discountTotal.toFixed(2)} discount was applied)`:''}`,'✅','wallet');
        await createNotification(order.userId,'✅ Order Completed!',
            `Payment released for order #${order.orderId}. Thank you!`,'✅','orders');
        
        if(typeof speakNotification==='function') speakNotification(`Payment of ${formatCurrency(sellerAmount)} has been released to the seller.`);
        if(typeof sendPushNotification==='function') sendPushNotification('💰 Payment Released!', `${formatCurrency(sellerAmount)} credited.`);
        
        hideLoader(); showToast('Delivery confirmed! ✅','success');
        if(typeof reloadUserData==='function') await reloadUserData();
        loadOrdersScreen();
    } catch(e){hideLoader();console.error('Confirmation error:',e);showToast('Failed','error');}
}

// =====================
// TRACK ORDER
// =====================
async function trackOrder(orderId) {
    try {
        const doc = await db.collection('orders').doc(orderId).get();
        if(!doc.exists){showToast('Not found','error');return;}
        const o = doc.data();
        showModal(`
            <div style="padding:10px;"><h3>📍 Track Order #${o.orderId||orderId.substring(0,8)}</h3>
            <div style="background:#f5f5f5;padding:12px;border-radius:8px;margin:10px 0;">
                <p><strong>Status:</strong> ${(o.status||'').replace(/_/g,' ').toUpperCase()}</p>
                <p><strong>Courier:</strong> ${o.courier||'N/A'}</p>
                <p><strong>Tracking:</strong> ${o.trackingNumber||'Pending'}</p>
                <p><strong>Destination:</strong> ${o.shipping?.city||''}, ${o.shipping?.country||''}</p>
            </div>
            <button class="btn-gold btn-full" onclick="hideModal()">Close</button></div>`);
    } catch(e){showToast('Error','error');}
}

// =====================
// DISPUTE ORDER
// =====================
function disputeOrder(orderId) {
    showModal(`
        <div style="padding:10px;"><h3>⚠️ Open Dispute</h3>
        <div class="input-group"><label>Reason</label><select id="dispute-reason" class="input-field"><option value="">Select...</option><option value="not_received">Not Received</option><option value="damaged">Damaged</option><option value="wrong_item">Wrong Item</option><option value="counterfeit">Counterfeit</option></select></div>
        <div class="input-group"><label>Description</label><textarea id="dispute-desc" class="input-field" rows="3"></textarea></div>
        <button class="btn-danger btn-full" onclick="submitDispute('${orderId}')">Submit Dispute</button></div>`);
}

async function submitDispute(orderId) {
    const reason = document.getElementById('dispute-reason')?.value;
    const desc = document.getElementById('dispute-desc')?.value?.trim();
    if(!reason){showToast('Select reason','error');return;}
    hideModal();
    try {
        await db.collection('orders').doc(orderId).update({disputed:true,status:'disputed',updatedAt:firebase.firestore.FieldValue.serverTimestamp()});
        await db.collection('disputes').add({orderId,userId:APP.userProfile.uid,userEmail:APP.userProfile.email,type:reason,description:desc,status:'open',createdAt:firebase.firestore.FieldValue.serverTimestamp()});
        showToast('Dispute submitted. Our team will review.','success'); loadOrdersScreen();
    } catch(e){showToast('Failed','error');}
}

// =====================
// STORE TRANSACTIONS
// =====================
async function loadStoreTransactions() {
    const container = document.getElementById('transactions-full');
    if(!container||!APP.userProfile?.isMerchant) return;
    try {
        const ordersSnap = await db.collection('orders').where('merchantId','==',APP.userProfile.uid).get();
        const txSnap = await db.collection('transactions').where('userId','==',APP.userProfile.uid).get();
        const allTx = [];
        ordersSnap.forEach(d=>{const o=d.data();allTx.push({id:d.id,type:'sale',amount:o.total,status:o.status,date:o.createdAt,orderId:o.orderId,customer:o.userName,customerPaid:o.customerPaid,discountTotal:o.discountTotal});});
        txSnap.forEach(d=>{const t=d.data();if(['commission','subscription','sponsorship','refund'].includes(t.type))allTx.push({id:d.id,type:t.type,amount:t.amount,status:t.status,date:t.createdAt,description:t.description});});
        allTx.sort((a,b)=>(b.date?.toDate?.()||0)-(a.date?.toDate?.()||0));
        
        container.innerHTML = '<h3 style="padding:15px;">💰 Store Transactions</h3>';
        if(allTx.length===0){container.innerHTML+='<p style="text-align:center;color:#999;padding:20px;">No transactions yet</p>';return;}
        
        allTx.forEach(tx=>{
            const icons={sale:'🛒',commission:'💰',subscription:'⭐',sponsorship:'📢',refund:'↩️'};
            container.innerHTML+=`
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:white;border-bottom:1px solid #f0f0f0;cursor:pointer;" onclick="showTransactionDetail('${tx.id}','${tx.type}')">
                    <span style="font-size:22px;">${icons[tx.type]||'💳'}</span>
                    <div style="flex:1;">
                        <div style="font-weight:600;">${tx.type.toUpperCase()} ${tx.orderId?'#'+tx.orderId:''}</div>
                        <div style="font-size:12px;color:#666;">${tx.customer||tx.description||''}</div>
                        ${tx.discountTotal>0?`<div style="font-size:11px;color:#f44;">Discount: -${formatCurrency(tx.discountTotal)}</div>`:''}
                        ${tx.customerPaid?`<div style="font-size:11px;color:#666;">Customer paid: ${formatCurrency(tx.customerPaid)}</div>`:''}
                        <div style="font-size:11px;color:#999;">${getTimeAgo(tx.date)}</div>
                    </div>
                    <div style="font-weight:700;color:${tx.type==='refund'?'var(--red)':'var(--green)'};">${tx.type==='refund'?'-':''}${formatCurrency(tx.amount)}</div>
                </div>`;
        });
    } catch(e){container.innerHTML='<p style="text-align:center;padding:40px;">Error loading transactions</p>';}
}

function showTransactionDetail(txId, txType) {
    showToast('Transaction ID: ' + txId.substring(0,12) + '...', 'info');
}

console.log('✅ orders.js fully loaded - ONESHOPLIFY Order System Ready');
