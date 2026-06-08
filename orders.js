// orders.js - COMPLETE FINAL VERSION (Escrow counting, Merchant credit on delivery, Full flow)

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
                        <img src="${item.image||'app-icon.png'}" style="width:50px;height:50px;border-radius:8px;">
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
        if(snap.empty){msgEl.style.display='block';msgEl.style.color='red';msgEl.textContent='Invalid code';return;}
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
// PLACE ORDER - Funds go to ESCROW (Merchant escrow counts)
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
    
    if(!country||!name||!phone||!address){showToast('Fill all fields','error');return;}
    
    const data = window._checkoutData;
    const total = (data?.subtotal||0)-(data?.totalDiscount||0);
    
    if(total > (APP.userProfile.walletBalance||0)){showToast('Insufficient balance','error');navigateTo('wallet');return;}
    
    showLoader();
    try {
        const orderId = 'OSL-'+new Date().getFullYear()+'-'+String(Date.now()).slice(-6);
        
        // Deduct from customer wallet
        await db.collection('users').doc(APP.userProfile.uid).update({
            walletBalance: firebase.firestore.FieldValue.increment(-total)
        });
        APP.userProfile.walletBalance -= total;
        
        // Group by merchant
        const merchantOrders = {};
        cart.forEach(item => {
            if(!merchantOrders[item.merchantId]) merchantOrders[item.merchantId] = {merchantId:item.merchantId,items:[],total:0};
            merchantOrders[item.merchantId].items.push(item);
            merchantOrders[item.merchantId].total += item.price * item.quantity;
        });
        
        // Create orders and ADD TO MERCHANT ESCROW
        for(const [mid,order] of Object.entries(merchantOrders)){
            await db.collection('orders').add({
                orderId:orderId+'-'+mid.substring(0,4),userId:APP.userProfile.uid,
                userEmail:APP.userProfile.email||'',userName:name,userPhone:phone,
                merchantId:mid,items:order.items,total:order.total,escrowAmount:order.total,
                status:'pending',shipping:{country,city,address,phone,name},
                trackingNumber:null,courier:null,deliveryType:null,
                deliveryConfirmed:false,disputed:false,merchantAccepted:false,
                escrowReleased:false,
                createdAt:firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt:firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // ADD TO MERCHANT ESCROW BALANCE (this makes it count)
            await db.collection('users').doc(mid).update({
                escrowBalance: firebase.firestore.FieldValue.increment(order.total)
            });
            
            // Notify merchant with escrow info
            await createNotification(mid,'🔔 New Order!',
                `New order #${orderId} from ${name}. ${formatCurrency(order.total)} added to your escrow. Action required within 72 hours!`,'🔔','orders');
        }
        
        // Record transaction
        await db.collection('transactions').add({
            userId:APP.userProfile.uid,type:'purchase',amount:total,
            currency:'USD',status:'escrow',reference:orderId,
            createdAt:firebase.firestore.FieldValue.serverTimestamp()
        });
        
        sessionStorage.removeItem('shoplify_cart'); window._checkoutData = null;
        hideLoader(); if(typeof updateCartBadge==='function') updateCartBadge();
        showToast('Order placed! Funds in escrow. 🛡️','success'); navigateTo('orders');
    } catch(error){hideLoader();console.error('Order error:',error);showToast('Failed','error');}
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
                        <img src="${order.items?.[0]?.image||'app-icon.png'}" style="width:50px;height:50px;border-radius:8px;">
                        <div style="flex:1;">
                            <div style="font-weight:600;">${order.items?.[0]?.name||'Product'}</div>
                            ${order.role==='merchant'?`<div style="font-size:12px;color:#666;">👤 ${order.userName} | 📞 ${order.userPhone}</div><div style="font-size:12px;color:#666;">📍 ${order.shipping?.address}, ${order.shipping?.city}, ${order.shipping?.country}</div>`:''}
                            <div style="font-weight:700;">${formatCurrency(order.total)} ${order.escrowReleased?'✅ Paid':'(Escrow)'}</div>
                        </div>
                    </div>
                    
                    ${order.trackingNumber?`<div style="background:#E3F2FD;padding:8px;border-radius:6px;margin-top:8px;font-size:12px;">📦 ${order.courier||'Standard'}: <strong>${order.trackingNumber}</strong>${order.role==='customer'?` <button class="btn-small btn-outline" onclick="trackOrder('${order.id}')">📍 Track</button>`:''}</div>`:''}
                    
                    ${order.role==='merchant'&&order.status==='pending'?`<div style="display:flex;gap:8px;margin-top:10px;"><button class="btn-small btn-success" onclick="acceptOrder('${order.id}')">✅ Accept</button><button class="btn-small btn-danger" onclick="rejectOrder('${order.id}')">❌ Reject</button></div>`:''}
                    
                    ${order.role==='merchant'&&order.status==='processing'?`<button class="btn-gold btn-full" style="margin-top:8px;" onclick="shipOrder('${order.id}')">📦 Ship Order</button>`:''}
                    
                    ${order.role==='merchant'&&(order.status==='shipped'||order.status==='in_transit')?`
                        <div style="display:flex;gap:5px;margin-top:8px;flex-wrap:wrap;">
                            <button class="btn-small btn-outline" onclick="updateOrderStatus('${order.id}','in_transit')">🚚 In Transit</button>
                            <button class="btn-small btn-outline" onclick="updateOrderStatus('${order.id}','out_for_delivery')">📬 Out for Delivery</button>
                            <button class="btn-small btn-success" onclick="updateOrderStatus('${order.id}','delivered')">✅ Delivered</button>
                        </div>`:''}
                    
                    ${order.role==='merchant'&&order.status==='out_for_delivery'?`<button class="btn-gold btn-full" style="margin-top:8px;" onclick="updateOrderStatus('${order.id}','delivered')">✅ Mark as Delivered</button>`:''}
                    
                    ${order.status==='delivered'&&!order.deliveryConfirmed&&order.role==='customer'?`
                        <button class="btn-gold btn-full" style="margin-top:8px;" onclick="confirmDelivery('${order.id}')">✅ Confirm Delivery</button>
                        <button class="btn-outline btn-full" style="margin-top:5px;" onclick="disputeOrder('${order.id}')">⚠️ Open Dispute</button>`:''}
                    
                    ${order.rejectionReason?`<div style="background:#FFEBEE;padding:6px;border-radius:6px;margin-top:8px;font-size:12px;color:#C62828;">❌ ${order.rejectionReason}</div>`:''}
                    <div style="font-size:11px;color:#999;margin-top:5px;">${getTimeAgo(order.createdAt)}</div>
                </div>`;
        });
    } catch(error){container.innerHTML='<p style="text-align:center;padding:40px;">Error loading orders</p>';}
}

// =====================
// MERCHANT: ACCEPT / REJECT
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
        
        // REFUND: Remove from merchant escrow, credit customer
        await db.collection('users').doc(order.merchantId).update({
            escrowBalance: firebase.firestore.FieldValue.increment(-order.total)
        });
        await db.collection('users').doc(order.userId).update({
            walletBalance: firebase.firestore.FieldValue.increment(order.total)
        });
        
        await db.collection('orders').doc(orderId).update({
            status:'cancelled',merchantRejected:true,
            rejectionReason:reason+(details?': '+details:''),
            rejectedAt:firebase.firestore.FieldValue.serverTimestamp()
        });
        
        await db.collection('transactions').add({
            userId:order.userId,type:'refund',amount:order.total,
            currency:'USD',status:'completed',reference:order.orderId,
            description:'Rejected: '+reason,
            createdAt:firebase.firestore.FieldValue.serverTimestamp()
        });
        
        await createNotification(order.userId,'❌ Order Rejected',
            `Order rejected. Reason: ${reason}. ${formatCurrency(order.total)} refunded.`,'❌','orders');
        
        hideLoader(); showToast('Refunded ✅','success'); loadOrdersScreen();
    } catch(e){hideLoader();showToast('Failed','error');}
}

// =====================
// MERCHANT: SHIP & STATUS UPDATES
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
// CUSTOMER: CONFIRM DELIVERY - RELEASES ESCROW TO MERCHANT
// =====================
function confirmDelivery(orderId) {
    showModal(`
        <div style="padding:10px;">
            <h3>✅ Confirm Delivery</h3>
            <p style="color:#666;margin:10px 0;">Have you received this order?</p>
            <p style="color:#f44;font-size:13px;">⚠️ This will release payment to the seller.</p>
            <button class="btn-gold btn-full" onclick="processDeliveryConfirmation('${orderId}')">✅ Yes, Confirm Delivery</button>
            <button class="btn-outline btn-full" style="margin-top:5px;" onclick="hideModal()">Cancel</button>
        </div>`);
}

async function processDeliveryConfirmation(orderId) {
    hideModal(); showLoader();
    try {
        const doc = await db.collection('orders').doc(orderId).get();
        if(!doc.exists){hideLoader();showToast('Order not found','error');return;}
        const order = doc.data();
        
        if(order.escrowReleased){hideLoader();showToast('Already released','info');return;}
        
        // RELEASE ESCROW: Move from merchant escrow to merchant wallet
        await db.collection('users').doc(order.merchantId).update({
            escrowBalance: firebase.firestore.FieldValue.increment(-order.total),
            walletBalance: firebase.firestore.FieldValue.increment(order.total)
        });
        
        // Pay affiliate commission if applicable
        if(order.affiliateId){
            const commission = calculateCommission(order.total, APP.affiliateCommissionMin);
            await db.collection('users').doc(order.affiliateId).update({
                pendingEarnings: firebase.firestore.FieldValue.increment(commission)
            });
            await createNotification(order.affiliateId,'💰 Commission Earned!',
                `You earned ${formatCurrency(commission)} from order #${order.orderId}`,'💰','affiliate');
        }
        
        // Pay dropshipper profit if applicable
        if(order.items?.[0]?.isDropship && order.items?.[0]?.dropshipperId){
            const dropshipProfit = (order.items[0].price - order.items[0].minPrice) * order.items[0].quantity;
            if(dropshipProfit > 0){
                await db.collection('users').doc(order.items[0].dropshipperId).update({
                    walletBalance: firebase.firestore.FieldValue.increment(dropshipProfit)
                });
                await createNotification(order.items[0].dropshipperId,'💰 Dropship Profit!',
                    `You earned ${formatCurrency(dropshipProfit)} from order #${order.orderId}`,'💰','wallet');
            }
        }
        
        // Mark order as completed
        await db.collection('orders').doc(orderId).update({
            status:'completed',deliveryConfirmed:true,escrowReleased:true,
            confirmedAt:firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt:firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Record transactions
        await db.collection('transactions').add({
            userId:order.merchantId,type:'sale',amount:order.total,
            currency:'USD',status:'completed',reference:order.orderId,
            description:'Escrow released',
            createdAt:firebase.firestore.FieldValue.serverTimestamp()
        });
        
        await createNotification(order.merchantId,'✅ Payment Released!',
            `${formatCurrency(order.total)} released from escrow for order #${order.orderId}.`,'✅','wallet');
        
        await createNotification(order.userId,'✅ Order Completed!',
            `Payment released to seller for order #${order.orderId}. Thank you!`,'✅','orders');
        
        hideLoader(); showToast('Delivery confirmed! Payment released. ✅','success');
        
        // Reload user data
        if(typeof reloadUserData==='function') await reloadUserData();
        loadOrdersScreen();
        
    } catch(e){hideLoader();console.error('Confirmation error:',e);showToast('Failed','error');}
}

// =====================
// TRACK & DISPUTE
// =====================
async function trackOrder(orderId) {
    try {
        const doc = await db.collection('orders').doc(orderId).get();
        if(!doc.exists){showToast('Not found','error');return;}
        const o = doc.data();
        showModal(`<div style="padding:10px;"><h3>📍 Track Order</h3>
            <div style="background:#f5f5f5;padding:12px;border-radius:8px;">
                <p>Status: ${(o.status||'').replace(/_/g,' ').toUpperCase()}</p>
                <p>Courier: ${o.courier||'N/A'}</p>
                <p>Tracking: ${o.trackingNumber||'Pending'}</p>
                <p>Destination: ${o.shipping?.city}, ${o.shipping?.country}</p>
            </div><button class="btn-gold btn-full" onclick="hideModal()">Close</button></div>`);
    } catch(e){showToast('Error','error');}
}

function disputeOrder(orderId) {
    showModal(`<div style="padding:10px;"><h3>⚠️ Dispute</h3>
        <div class="input-group"><label>Reason</label><select id="dispute-reason" class="input-field"><option value="">Select...</option><option value="not_received">Not Received</option><option value="damaged">Damaged</option><option value="wrong_item">Wrong Item</option><option value="counterfeit">Counterfeit</option></select></div>
        <div class="input-group"><label>Description</label><textarea id="dispute-desc" class="input-field" rows="3"></textarea></div>
        <button class="btn-danger btn-full" onclick="submitDispute('${orderId}')">Submit</button></div>`);
}

async function submitDispute(orderId) {
    const reason = document.getElementById('dispute-reason')?.value;
    const desc = document.getElementById('dispute-desc')?.value?.trim();
    if(!reason){showToast('Select reason','error');return;}
    hideModal();
    try {
        await db.collection('orders').doc(orderId).update({disputed:true,status:'disputed',updatedAt:firebase.firestore.FieldValue.serverTimestamp()});
        await db.collection('disputes').add({orderId,userId:APP.userProfile.uid,userEmail:APP.userProfile.email,type:reason,description:desc,status:'open',createdAt:firebase.firestore.FieldValue.serverTimestamp()});
        showToast('Dispute submitted','success'); loadOrdersScreen();
    } catch(e){showToast('Failed','error');}
}