// ============ Checkout Module ============

async function loadCheckout(data) {
    if (!requireAuth()) return;
    
    const container = document.getElementById('checkout-content');
    if (!container) return;
    
    if (APP_STATE.cart.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:60px 20px;">
                <i class="fas fa-shopping-cart" style="font-size:60px; color:#ddd; display:block; margin-bottom:16px;"></i>
                <h3>Your cart is empty</h3>
                <p style="color:#999;">Add products to your cart to checkout</p>
                <button class="btn-gold mt-20" onclick="navigateTo('marketplace')">Browse Products</button>
            </div>`;
        return;
    }
    
    const cartTotal = APP_STATE.cart.reduce((sum, item) => sum + item.total, 0);
    const profile = await refreshUserProfile();
    
    container.innerHTML = `
        <h3 style="margin-bottom:16px;">Checkout</h3>
        
        <!-- Shipping Information -->
        <div class="section">
            <h4 style="margin-bottom:12px;">📦 Shipping Information</h4>
            <form id="checkout-form" onsubmit="processCheckout(event)" style="display:flex; flex-direction:column; gap:10px;">
                <div class="form-group">
                    <label>Full Name *</label>
                    <input type="text" id="shipping-name" required value="${profile.displayName || ''}" placeholder="Enter full name">
                </div>
                <div class="form-group">
                    <label>Country *</label>
                    <select id="shipping-country" required>
                        <option value="">Select country</option>
                        <option value="US">United States</option>
                        <option value="NG">Nigeria</option>
                        <option value="GB">United Kingdom</option>
                        <option value="CA">Canada</option>
                        <option value="GH">Ghana</option>
                        <option value="KE">Kenya</option>
                        <option value="ZA">South Africa</option>
                        <option value="IN">India</option>
                        <option value="AE">UAE</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>State/Province *</label>
                    <input type="text" id="shipping-state" required placeholder="Enter state">
                </div>
                <div class="form-group">
                    <label>City *</label>
                    <input type="text" id="shipping-city" required placeholder="Enter city">
                </div>
                <div class="form-group">
                    <label>Address *</label>
                    <input type="text" id="shipping-address" required placeholder="Street address">
                </div>
                <div class="form-group">
                    <label>Postal Code *</label>
                    <input type="text" id="shipping-postal" required placeholder="Postal code">
                </div>
                <div class="form-group">
                    <label>Phone Number *</label>
                    <input type="tel" id="shipping-phone" required placeholder="Phone number">
                </div>
                <div class="form-group">
                    <label>Email *</label>
                    <input type="email" id="shipping-email" required value="${APP_STATE.currentUser.email}" placeholder="Email address">
                </div>
            </form>
        </div>
        
        <!-- Order Summary -->
        <div class="section" style="margin-top:16px;">
            <h4 style="margin-bottom:12px;">🛍️ Order Summary</h4>
            <div style="background:#f9f9f9; border-radius:12px; padding:16px;">
                ${APP_STATE.cart.map((item, index) => `
                    <div style="display:flex; gap:10px; padding:8px 0; border-bottom:1px solid #eee; align-items:center;">
                        <img src="${item.image || 'app-icon.png'}" 
                             style="width:50px; height:50px; border-radius:8px; object-fit:cover;">
                        <div style="flex:1;">
                            <p style="font-weight:600; font-size:13px;">${item.name}</p>
                            <p style="font-size:11px; color:#999;">
                                ${item.color ? item.color + ' | ' : ''}${item.size ? item.size + ' | ' : ''}Qty: ${item.quantity}
                            </p>
                        </div>
                        <p style="font-weight:700; color:#FFD700;">${formatCurrency(item.total)}</p>
                        <button style="background:none; border:none; color:#FF4444; cursor:pointer; font-size:16px;"
                                onclick="removeFromCart(${index})">×</button>
                    </div>
                `).join('')}
                
                <div style="display:flex; justify-content:space-between; padding:12px 0; font-size:13px; color:#666;">
                    <span>Subtotal</span>
                    <span>${formatCurrency(cartTotal)}</span>
                </div>
                <div style="display:flex; justify-content:space-between; padding:12px 0; font-size:13px; color:#666; border-top:1px solid #eee;">
                    <span>Shipping</span>
                    <span style="color:#00C851;">Free</span>
                </div>
                <div style="display:flex; justify-content:space-between; padding:12px 0; font-size:16px; font-weight:700; border-top:2px solid #FFD700;">
                    <span>Total</span>
                    <span style="color:#FFD700;">${formatCurrency(cartTotal)}</span>
                </div>
            </div>
        </div>
        
        <!-- Payment -->
        <div style="margin-top:16px;">
            <p style="margin-bottom:8px; font-weight:600;">💳 Payment Method</p>
            <p style="font-size:13px; color:#666; margin-bottom:12px;">
                Wallet Balance: ${formatCurrency(profile.walletBalance || 0)}
            </p>
            <button class="btn-gold" onclick="processCheckout(event)" style="width:100%;"
                    ${cartTotal > (profile.walletBalance || 0) ? 'disabled' : ''}>
                ${cartTotal > (profile.walletBalance || 0) ? 'Insufficient Balance' : `Pay ${formatCurrency(cartTotal)}`}
            </button>
            ${cartTotal > (profile.walletBalance || 0) ? `
                <button class="btn-gold mt-10" onclick="navigateTo('wallet')" style="width:100%;">
                    Deposit Funds
                </button>
            ` : ''}
        </div>
        
        <p style="font-size:11px; color:#999; text-align:center; margin-top:12px;">
            🔒 Funds held in escrow until delivery confirmed
        </p>
    `;
}

function removeFromCart(index) {
    APP_STATE.cart.splice(index, 1);
    localStorage.setItem('serviconnect_cart', JSON.stringify(APP_STATE.cart));
    loadCheckout();
    showToast('Item removed from cart', 'info');
}

async function processCheckout(event) {
    if (event) event.preventDefault();
    if (!requireAuth()) return;
    
    const name = document.getElementById('shipping-name')?.value?.trim();
    const country = document.getElementById('shipping-country')?.value;
    const state = document.getElementById('shipping-state')?.value?.trim();
    const city = document.getElementById('shipping-city')?.value?.trim();
    const address = document.getElementById('shipping-address')?.value?.trim();
    const postal = document.getElementById('shipping-postal')?.value?.trim();
    const phone = document.getElementById('shipping-phone')?.value?.trim();
    const email = document.getElementById('shipping-email')?.value?.trim();
    
    if (!name || !country || !state || !city || !address || !postal || !phone) {
        showToast('Please fill all shipping fields', 'error');
        return;
    }
    
    if (APP_STATE.cart.length === 0) {
        showToast('Cart is empty', 'error');
        return;
    }
    
    const cartTotal = APP_STATE.cart.reduce((sum, item) => sum + item.total, 0);
    const profile = await refreshUserProfile();
    
    if (cartTotal > (profile.walletBalance || 0)) {
        showToast('Insufficient balance. Please deposit funds.', 'error');
        navigateTo('wallet');
        return;
    }
    
    showLoader();
    
    try {
        // Create order for each product (grouped by merchant)
        const ordersByMerchant = {};
        
        for (const item of APP_STATE.cart) {
            const product = await getFromFirestore('products', item.productId);
            if (!product) continue;
            
            const merchantId = product.merchantId || 'unknown';
            if (!ordersByMerchant[merchantId]) {
                ordersByMerchant[merchantId] = {
                    merchantId,
                    items: [],
                    total: 0
                };
            }
            ordersByMerchant[merchantId].items.push(item);
            ordersByMerchant[merchantId].total += item.total;
        }
        
        const orderIds = [];
        
        for (const [merchantId, orderData] of Object.entries(ordersByMerchant)) {
            const orderId = generateId('ord');
            const escrowAmount = orderData.total;
            
            await saveToFirestore('orders', orderId, {
                userId: APP_STATE.currentUser.uid,
                userEmail: email,
                merchantId,
                items: orderData.items,
                total: orderData.total,
                escrowAmount,
                status: 'processing',
                shipping: { name, country, state, city, address, postal, phone, email },
                trackingNumber: '',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                deliveryConfirmed: false,
                disputed: false
            });
            
            // Update product stock
            for (const item of orderData.items) {
                const product = await getFromFirestore('products', item.productId);
                if (product) {
                    await saveToFirestore('products', item.productId, {
                        stock: Math.max(0, (product.stock || 0) - item.quantity),
                        totalSales: (product.totalSales || 0) + item.quantity
                    });
                }
            }
            
            // Deduct from wallet and move to escrow
            await saveToFirestore('users', APP_STATE.currentUser.uid, {
                walletBalance: (profile.walletBalance || 0) - escrowAmount,
                escrowBalance: (profile.escrowBalance || 0) + escrowAmount
            });
            
            // Record transaction
            await saveToFirestore('transactions', orderId, {
                userId: APP_STATE.currentUser.uid,
                type: 'purchase',
                amount: escrowAmount,
                reference: orderId,
                status: 'escrow',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Notify merchant
            await sendNotification(merchantId, 'New Order!', 
                `You have a new order worth ${formatCurrency(escrowAmount)}`, '📦');
            
            // Process affiliate commissions
            await processAffiliateCommissions(orderData.items);
            
            orderIds.push(orderId);
        }
        
        // Clear cart
        APP_STATE.cart = [];
        localStorage.removeItem('serviconnect_cart');
        
        hideLoader();
        showToast('✅ Order placed successfully! Funds held in escrow.', 'success');
        
        // Navigate to orders
        setTimeout(() => navigateTo('orders'), 500);
        
    } catch (error) {
        hideLoader();
        console.error('Checkout error:', error);
        showToast('Checkout failed. Please try again.', 'error');
    }
}

// ============ Process Affiliate Commissions ============
async function processAffiliateCommissions(items) {
    for (const item of items) {
        try {
            // Find affiliate who referred this product
            const affiliateSnapshot = await db.collection('affiliate_products')
                .where('productId', '==', item.productId)
                .where('status', '==', 'active')
                .limit(1)
                .get();
            
            if (!affiliateSnapshot.empty) {
                const affiliateDoc = affiliateSnapshot.docs[0];
                const affiliateData = affiliateDoc.data();
                const commissionAmount = calculateCommission(item.total, affiliateData.commissionPercentage);
                
                // Update affiliate earnings (pending until delivery confirmation)
                await db.collection('affiliate_products').doc(affiliateDoc.id).update({
                    conversions: firebase.firestore.FieldValue.increment(1),
                    totalCommission: firebase.firestore.FieldValue.increment(commissionAmount)
                });
                
                // Update affiliate user pending earnings
                const affiliate = await getFromFirestore('users', affiliateData.affiliateId);
                if (affiliate) {
                    await saveToFirestore('users', affiliateData.affiliateId, {
                        pendingEarnings: (affiliate.pendingEarnings || 0) + commissionAmount
                    });
                }
            }
        } catch (error) {
            console.error('Commission processing error:', error);
        }
    }
}