// wallet.js - FINAL VERSION (Withdrawal to Shoplify Wallet with Connect Feature)

// =====================
// FETCH REAL RATES FROM API
// =====================
async function fetchLiveRates() {
    console.log('🔄 Fetching live rates from exchangerate.host...');
    
    try {
        const response = await fetch('https://api.exchangerate.host/latest?base=USD');
        if (!response.ok) throw new Error('API failed');
        const json = await response.json();
        
        if (json && json.rates) {
            APP.exchangeRates = {};
            for (const [code, value] of Object.entries(json.rates)) {
                APP.exchangeRates[code] = value;
            }
            console.log('✅ REAL RATES LOADED');
            return json.rates;
        }
    } catch (error) {
        console.warn('⚠️ Primary API failed:', error.message);
    }
    
    try {
        const response = await fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json');
        if (response.ok) {
            const json = await response.json();
            if (json && json.usd) {
                APP.exchangeRates = {};
                for (const [code, value] of Object.entries(json.usd)) {
                    APP.exchangeRates[code.toUpperCase()] = value;
                }
                console.log('✅ Fallback rates loaded');
                return APP.exchangeRates;
            }
        }
    } catch (error) {
        console.warn('⚠️ Fallback API failed:', error.message);
    }
    
    APP.exchangeRates = {
        NGN: 1359.55, EUR: 0.868, GBP: 0.749, GHS: 11.83, KES: 129.35,
        ZAR: 16.56, CAD: 1.394, AUD: 1.419, INR: 94.96, CNY: 6.766,
        JPY: 160.31, BRL: 5.17, MXN: 17.51, RUB: 73.67, TRY: 46.04,
        KRW: 1559.34, AED: 3.67, SAR: 3.75, QAR: 3.64, EGP: 51.77
    };
    return APP.exchangeRates;
}

function getRate(currencyCode) {
    if (!currencyCode || currencyCode === 'USD') return 1;
    if (APP.exchangeRates && APP.exchangeRates[currencyCode]) {
        const rate = APP.exchangeRates[currencyCode];
        if (typeof rate === 'object' && rate.value) return rate.value;
        if (typeof rate === 'number') return rate;
    }
    return null;
}

// =====================
// LOAD WALLET SCREEN
// =====================
async function loadWalletScreen() {
    console.log('💰 Loading wallet screen...');
    
    if (!APP.userProfile) {
        console.error('No user profile');
        return;
    }
    
    await fetchLiveRates();
    updateWalletDisplay();
    await loadRecentTransactions();
    
    if (typeof FlutterwaveCheckout === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://checkout.flutterwave.com/v3.js';
        document.head.appendChild(script);
    }
    
    console.log('✅ Wallet screen loaded');
}

function updateWalletDisplay() {
    const walletBalance = APP.userProfile?.walletBalance || 0;
    const affiliateEarnings = APP.userProfile?.affiliateEarnings || 0;
    const pendingEarnings = APP.userProfile?.pendingEarnings || 0;
    const escrowBalance = APP.userProfile?.escrowBalance || 0;
    
    const totalEl = document.getElementById('wallet-total-balance');
    const availEl = document.getElementById('wallet-available');
    const pendEl = document.getElementById('wallet-pending');
    const escrowEl = document.getElementById('wallet-escrow');
    
    if (totalEl) totalEl.textContent = '$' + (walletBalance + affiliateEarnings).toFixed(2);
    if (availEl) availEl.textContent = '$' + walletBalance.toFixed(2);
    if (pendEl) pendEl.textContent = '$' + pendingEarnings.toFixed(2);
    if (escrowEl) escrowEl.textContent = '$' + escrowBalance.toFixed(2);
    
    const homeBal = document.getElementById('home-balance');
    if (homeBal) homeBal.textContent = '$' + walletBalance.toFixed(2);
}

// =====================
// SHOW DEPOSIT MODAL
// =====================
function showDepositModal() {
    if (!APP.userProfile?.phoneNumber) {
        showToast('Set your phone number in Settings first', 'error');
        navigateTo('settings');
        return;
    }
    
    showModal(`
        <div style="padding:10px;">
            <h3 style="margin-bottom:15px;">💰 Deposit Funds</h3>
            <p style="color:#666;margin-bottom:20px;">Choose your deposit method</p>
            
            <button class="btn-gold btn-full" onclick="depositViaFlutterwave()" style="margin-bottom:12px;">
                💳 Pay with Card / Bank Transfer
            </button>
            
            <button class="btn-outline btn-full" onclick="depositViaShoplifyWallet()">
                🔗 Transfer via Shoplify Wallet
            </button>
        </div>
    `);
}

// =====================
// FLUTTERWAVE DEPOSIT
// =====================
async function depositViaFlutterwave() {
    hideModal();
    
    const currency = APP.userProfile?.currency || 'USD';
    
    showModal(`
        <div style="padding:30px;text-align:center;">
            <div style="width:40px;height:40px;border:4px solid #f0f0f0;border-top:4px solid #FFD700;border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto 15px;"></div>
            <p>Fetching live exchange rate for ${currency}...</p>
        </div>
    `);
    
    await fetchLiveRates();
    
    const rate = getRate(currency);
    
    if (rate === null && currency !== 'USD') {
        hideModal();
        showToast('Unable to get exchange rate for ' + currency + '. Please try again.', 'error');
        return;
    }
    
    const actualRate = currency === 'USD' ? 1 : rate;
    
    hideModal();
    
    window._realDepositRate = actualRate;
    
    showModal(`
        <div style="padding:10px;">
            <h3>💳 Deposit via Flutterwave</h3>
            <p style="color:#666;font-size:13px;margin-bottom:15px;">
                Enter amount in <strong>USD</strong>. You'll pay in <strong>${currency}</strong>.
            </p>
            
            <div class="input-group" style="margin-bottom:15px;">
                <label>Amount in USD (Min: $${APP.minDeposit})</label>
                <input type="number" id="deposit-usd-amount" class="input-field" 
                       placeholder="Enter USD amount" 
                       min="${APP.minDeposit}" 
                       max="${APP.maxDeposit}"
                       style="font-size:18px;font-weight:600;"
                       oninput="updateLocalAmountDisplay()">
            </div>
            
            <div style="text-align:center;padding:12px;background:#f5f5f5;border-radius:8px;margin-bottom:15px;">
                <span style="font-size:12px;color:#666;">You will pay in <strong>${currency}</strong>:</span>
                <div style="font-size:24px;font-weight:800;color:var(--gold-dark);" id="deposit-local-display">
                    ${getCurrencySymbol(currency)}0.00
                </div>
                <span style="font-size:12px;color:#4CAF50;display:block;margin-top:5px;">
                    ✅ REAL RATE: 1 USD = ${actualRate.toFixed(4)} ${currency}
                </span>
            </div>
            
            <button class="btn-gold btn-full" onclick="processFlutterwavePayment()">
                💳 Pay Now
            </button>
        </div>
    `);
}

function updateLocalAmountDisplay() {
    const usdAmount = parseFloat(document.getElementById('deposit-usd-amount')?.value) || 0;
    const currency = APP.userProfile?.currency || 'USD';
    const rate = window._realDepositRate || getRate(currency) || 1;
    const localAmount = usdAmount * rate;
    
    const display = document.getElementById('deposit-local-display');
    if (display) {
        const symbol = getCurrencySymbol(currency);
        display.textContent = symbol + localAmount.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }
}

function processFlutterwavePayment() {
    const usdAmount = parseFloat(document.getElementById('deposit-usd-amount')?.value) || 0;
    const currency = APP.userProfile?.currency || 'USD';
    const rate = window._realDepositRate || getRate(currency) || 1;
    const localAmount = Math.round(usdAmount * rate * 100) / 100;
    
    if (usdAmount < APP.minDeposit) {
        showToast('Minimum deposit: $' + APP.minDeposit + ' USD', 'error');
        return;
    }
    
    if (typeof FlutterwaveCheckout === 'undefined') {
        showToast('Payment system loading... Please wait.', 'warning');
        const script = document.createElement('script');
        script.src = 'https://checkout.flutterwave.com/v3.js';
        script.onload = () => showToast('Ready! Click Pay Now.', 'success');
        document.head.appendChild(script);
        return;
    }
    
    hideModal();
    
    const txRef = 'FW_' + Date.now() + '_' + Math.random().toString(36).substr(2, 8);
    const userId = APP.userProfile?.uid || APP.currentUser?.uid;
    
    window._pendingDeposit = { usdAmount, localAmount, currency, rate, txRef, userId };
    
    showToast('Opening secure payment... 🔒', 'info');
    
    FlutterwaveCheckout({
        public_key: APP.flutterwaveKey,
        tx_ref: txRef,
        amount: localAmount,
        currency: currency,
        payment_options: 'card,account,banktransfer,ussd',
        customer: {
            email: APP.userProfile?.email || 'customer@shoplify.com',
            phone_number: APP.userProfile?.phoneNumber || '',
            name: APP.userProfile?.displayName || APP.userProfile?.username || 'Shoplify User',
        },
        callback: async function(response) {
            console.log('📥 Flutterwave Callback:', response.status);
            
            const deposit = window._pendingDeposit;
            window._pendingDeposit = null;
            
            if (response.status === 'successful' || response.status === 'completed') {
                showToast('✅ Payment successful! Crediting your wallet...', 'success');
                if (deposit) await creditDeposit(deposit, response);
                else { await reloadUserData(); updateWalletDisplay(); loadRecentTransactions(); }
            } else if (response.status === 'cancelled' || response.status === 'closed') {
                showToast('❌ Payment cancelled. No charges were made.', 'error');
                if (deposit) recordTransaction(deposit, 'cancelled', 'User cancelled');
            } else if (response.status === 'failed' || response.status === 'error') {
                showToast('❌ Payment failed. ' + (response.message || 'Please try again.'), 'error');
                if (deposit) recordTransaction(deposit, 'failed', response.message || 'Failed');
            } else if (response.status === 'pending' || response.status === 'processing') {
                showToast('⏳ Payment is being processed...', 'warning');
                if (deposit) recordTransaction(deposit, 'pending', 'Processing');
            } else {
                showToast('⚠️ Payment status unknown. Contact support if balance doesn\'t update.', 'warning');
            }
        },
        onclose: function() {
            if (window._pendingDeposit) {
                showToast('❌ Payment window closed. No charges were made.', 'error');
                const deposit = window._pendingDeposit;
                window._pendingDeposit = null;
                if (deposit) recordTransaction(deposit, 'cancelled', 'Window closed');
            }
        },
        customizations: {
            title: 'Shoplify Deposit',
            description: 'Add funds to your wallet',
            logo: APP.baseUrl + '/app-icon.png',
        },
    });
}

async function recordTransaction(deposit, status, note) {
    try {
        await db.collection('transactions').add({
            userId: deposit.userId,
            type: 'deposit',
            amount: deposit.usdAmount,
            localAmount: deposit.localAmount,
            currency: deposit.currency,
            exchangeRate: deposit.rate,
            method: 'flutterwave',
            status: status,
            reference: deposit.txRef,
            note: note,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (e) {
        console.error('Failed to record transaction:', e);
    }
}

async function creditDeposit(deposit, response) {
    showLoader();
    try {
        const backendResponse = await fetch(APP.depositApiUrl, {
            method: 'POST',
            headers: { 
        'Content-Type': 'application/json',
        'x-api-key': APP.backendApiKey  // ADD THIS
      },
            body: JSON.stringify({
                userId: deposit.userId,
                usdAmount: deposit.usdAmount,
                localAmount: deposit.localAmount,
                currency: deposit.currency,
                exchangeRate: deposit.rate,
                reference: deposit.txRef,
                method: 'flutterwave',
                flutterwaveRef: response.transaction_id || response.flw_ref || '',
                userEmail: APP.userProfile?.email || '',
                userName: APP.userProfile?.displayName || APP.userProfile?.username || ''
            })
        });
        
        const result = await backendResponse.json();
        
        if (result.success) {
            await reloadUserData();
            await db.collection('transactions').add({
                userId: deposit.userId, type: 'deposit', amount: deposit.usdAmount,
                localAmount: deposit.localAmount, currency: deposit.currency,
                exchangeRate: deposit.rate, method: 'flutterwave', status: 'completed',
                reference: deposit.txRef, flutterwaveRef: response.transaction_id || '',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            await createNotification(deposit.userId, 'Deposit Successful! 💰',
                '$' + deposit.usdAmount.toFixed(2) + ' credited to your wallet.', '💰', 'wallet');
        }
        
        hideLoader();
        updateWalletDisplay();
        loadRecentTransactions();
        showToast('✅ Deposit successful! $' + deposit.usdAmount.toFixed(2) + ' credited.', 'success');
    } catch (error) {
        console.error('Credit error:', error);
        hideLoader();
        await reloadUserData();
        updateWalletDisplay();
        loadRecentTransactions();
        showToast('⚠️ Payment recorded. Balance updating...', 'warning');
    }
}

// =====================
// SHOPLIFY WALLET TRANSFER (DEPOSIT)
// =====================
function depositViaShoplifyWallet() {
    hideModal();
    
    const username = APP.userProfile?.username || '';
    const userId = APP.userProfile?.uid || '';
    
    showModal(`
        <div style="padding:10px;">
            <h3>🔗 Receive via Shoplify Wallet</h3>
            <p style="color:#666;margin:15px 0;">Share your details to receive funds.</p>
            
            <div style="background:#FFF8E1;padding:15px;border-radius:8px;margin-bottom:15px;">
                <div style="background:white;padding:12px;border-radius:8px;margin:10px 0;">
                    <small>Username for transfers:</small>
                    <div style="font-size:26px;font-weight:700;color:var(--gold-dark);">@${username}</div>
                </div>
                <div style="background:white;padding:12px;border-radius:8px;">
                    <small>User ID:</small>
                    <div style="font-family:monospace;font-size:13px;">${userId}</div>
                </div>
            </div>
            
            <button class="btn-gold btn-full" onclick="copyToClipboard('@${username}');showToast('Username copied!', 'success');">
                📋 Copy Username
            </button>
        </div>
    `);
}

// =====================
// WITHDRAW - CONNECT TO SHOPLIFY WALLET
// =====================
function showWithdrawInfo() {
    const userId = APP.userProfile?.uid || '';
    const username = APP.userProfile?.username || '';
    const isWalletConnected = APP.userProfile?.shoplifyWalletConnected || false;
    const walletDetails = APP.userProfile?.shoplifyWalletDetails || null;
    
    if (isWalletConnected && walletDetails) {
        // Show connected wallet details
        showModal(`
            <div style="padding:10px;">
                <h3>💸 Withdraw Funds</h3>
                <p style="color:#4CAF50;font-weight:600;margin:10px 0;">✅ Wallet Connected</p>
                
                <div style="background:#E8F5E9;padding:15px;border-radius:8px;margin-bottom:15px;">
                    <p><strong>Connected Wallet:</strong></p>
                    <p style="font-size:14px;">👤 Username: <strong>@${walletDetails.walletUsername || username}</strong></p>
                    <p style="font-size:13px;">🆔 Wallet ID: <strong>${walletDetails.walletUserId || userId}</strong></p>
                    <p style="font-size:12px;color:#666;">Connected: ${walletDetails.connectedAt ? new Date(walletDetails.connectedAt).toLocaleDateString() : 'Unknown'}</p>
                </div>
                
                <p style="font-size:13px;color:#666;margin-bottom:15px;">
                    Withdrawals are processed through your connected Shoplify Wallet.
                </p>
                
                <button class="btn-gold btn-full" onclick="window.open('${APP.withdrawApiUrl}', '_blank')">
                    🔗 Open Shoplify Wallet to Withdraw
                </button>
                
                <p style="text-align:center;margin-top:10px;font-size:11px;color:#999;">
                    Min: $${APP.minWithdraw} | Max: $${APP.maxWithdraw} | ${APP.maxWithdrawalsPerDay}/day
                </p>
            </div>
        `);
    } else {
        // Show connect wallet option
        showModal(`
            <div style="padding:10px;">
                <h3>💸 Withdraw to Shoplify Wallet</h3>
                <p style="color:#666;margin:15px 0;font-size:14px;">
                    Connect your Shoplify Wallet to withdraw funds securely.
                </p>
                
                <div style="background:#FFF8E1;padding:15px;border-radius:8px;margin-bottom:15px;">
                    <p style="font-weight:600;">📋 Your Account Details:</p>
                    <div style="background:white;padding:12px;border-radius:8px;margin:10px 0;">
                        <small>Username:</small>
                        <div style="font-size:22px;font-weight:700;color:var(--gold-dark);">@${username}</div>
                    </div>
                    <div style="background:white;padding:12px;border-radius:8px;">
                        <small>User ID (needed to connect):</small>
                        <div style="font-family:monospace;font-size:13px;word-break:break-all;">${userId}</div>
                    </div>
                </div>
                
                <div style="font-size:13px;color:#666;line-height:1.8;margin-bottom:15px;">
                    <p><strong>How to connect:</strong></p>
                    <p>1️⃣ Click <strong>"Connect Wallet"</strong> below</p>
                    <p>2️⃣ Copy your <strong>User ID</strong> when prompted</p>
                    <p>3️⃣ Open Shoplify Wallet and login with your User ID & password</p>
                    <p>4️⃣ Your wallet will be linked automatically</p>
                </div>
                
                <button class="btn-gold btn-full" onclick="connectToShoplifyWallet()">
                    🔗 Connect Wallet
                </button>
                
                <button class="btn-outline btn-full" style="margin-top:8px;" onclick="copyToClipboard('${userId}');showToast('User ID copied! Use it to login to Shoplify Wallet.', 'success');">
                    📋 Copy User ID
                </button>
            </div>
        `);
    }
}

// =====================
// CONNECT TO SHOPLIFY WALLET
// =====================
function connectToShoplifyWallet() {
    hideModal();
    
    const userId = APP.userProfile?.uid || '';
    const username = APP.userProfile?.username || '';
    
    showModal(`
        <div style="padding:10px;">
            <h3>🔗 Connect Shoplify Wallet</h3>
            <p style="color:#666;margin:15px 0;font-size:14px;">
                Follow these steps to connect your wallet.
            </p>
            
            <div style="background:#E3F2FD;padding:15px;border-radius:8px;margin-bottom:15px;">
                <p style="font-weight:600;">📋 Step 1: Copy your User ID</p>
                <div style="background:white;padding:10px;border-radius:6px;margin:8px 0;font-family:monospace;font-size:14px;word-break:break-all;">
                    ${userId}
                </div>
                <button class="btn-outline btn-full" onclick="copyToClipboard('${userId}');showToast('User ID copied! ✅', 'success');">
                    📋 Copy User ID
                </button>
            </div>
            
            <div style="background:#FFF8E1;padding:15px;border-radius:8px;margin-bottom:15px;">
                <p style="font-weight:600;">📋 Step 2: Login to Shoplify Wallet</p>
                <p style="font-size:13px;color:#666;margin:5px 0;">
                    Use these credentials:
                </p>
                <p style="font-size:13px;">👤 Username: <strong>@${username}</strong></p>
                <p style="font-size:13px;">🔑 Use your Shoplify password</p>
                <p style="font-size:13px;">🆔 User ID: <strong>${userId}</strong></p>
            </div>
            
            <p style="font-size:13px;color:#666;margin-bottom:15px;">
                After logging in, your wallet will be automatically connected.
            </p>
            
            <button class="btn-gold btn-full" onclick="proceedToShoplifyWallet('${userId}', '${username}')">
                ✅ I've Copied My ID - Proceed to Wallet
            </button>
        </div>
    `);
}

async function proceedToShoplifyWallet(userId, username) {
    hideModal();
    
    // Mark wallet as pending connection
    try {
        await db.collection('users').doc(APP.userProfile.uid).update({
            shoplifyWalletPending: true,
            shoplifyWalletPendingSince: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (e) {
        console.error('Failed to update wallet status:', e);
    }
    
    // Open Shoplify Wallet in new tab
    window.open(APP.withdrawApiUrl + '?userId=' + userId + '&username=' + username, '_blank');
    
    showToast('🔗 Opening Shoplify Wallet... Login with your credentials to connect.', 'success');
    
    // Check for wallet connection after 10 seconds
    setTimeout(async () => {
        await reloadUserData();
        if (APP.userProfile?.shoplifyWalletConnected) {
            showToast('✅ Wallet connected successfully!', 'success');
        }
    }, 10000);
}

// =====================
// RECENT TRANSACTIONS
// =====================
async function loadRecentTransactions() {
    const container = document.getElementById('transactions-history');
    if (!container) return;
    
    const userId = APP.userProfile?.uid || APP.currentUser?.uid;
    if (!userId) {
        container.innerHTML = '<p style="padding:15px;text-align:center;color:#999;">Login required</p>';
        return;
    }
    
    container.innerHTML = '<p style="padding:15px;text-align:center;">Loading...</p>';
    
    try {
        const snapshot = await db.collection('transactions')
            .where('userId', '==', userId)
            .get();
        
        if (snapshot.empty) {
            container.innerHTML = '<h4 style="padding:10px;">Recent Transactions</h4><p style="text-align:center;color:#999;">No transactions yet</p>';
            return;
        }
        
        const transactions = [];
        snapshot.forEach(doc => transactions.push({ id: doc.id, ...doc.data() }));
        transactions.sort((a, b) => (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0));
        
        container.innerHTML = '<h4 style="padding:10px;">Recent Transactions</h4>';
        
        transactions.slice(0, 20).forEach(tx => {
            const icons = { deposit: '📥', withdrawal: '📤', commission: '💰', subscription: '⭐', referral_bonus: '🎁', purchase: '🛒' };
            const icon = icons[tx.type] || '💳';
            const positive = ['deposit', 'commission', 'referral_bonus'].includes(tx.type);
            
            let statusBadge = '';
            if (tx.status === 'cancelled') statusBadge = ' ❌ Cancelled';
            if (tx.status === 'failed') statusBadge = ' ❌ Failed';
            if (tx.status === 'pending') statusBadge = ' ⏳ Pending';
            
            container.innerHTML += `
                <div style="display:flex;align-items:center;gap:10px;padding:10px;background:#fafafa;border-radius:8px;margin-bottom:5px;">
                    <span style="font-size:20px;">${icon}</span>
                    <div style="flex:1;">
                        <div style="font-weight:600;font-size:13px;">${(tx.type||'').replace(/_/g,' ').toUpperCase()}${statusBadge}</div>
                        <div style="font-size:11px;color:#999;">${getTimeAgo(tx.createdAt)}</div>
                    </div>
                    <div style="font-weight:700;color:${positive && tx.status==='completed'?'var(--green)':'var(--red)'};">
                        ${positive && tx.status==='completed'?'+':''}${tx.status==='cancelled'||tx.status==='failed'?'':'$'+(tx.amount||0).toFixed(2)}
                    </div>
                </div>`;
        });
    } catch (error) {
        container.innerHTML = '<p style="text-align:center;color:#999;">Unable to load</p>';
    }
}

async function reloadUserData() {
    const userId = APP.userProfile?.uid || APP.currentUser?.uid;
    if (!userId) return;
    try {
        const doc = await db.collection('users').doc(userId).get();
        if (doc.exists) {
            APP.userProfile = doc.data();
            APP.userProfile.uid = userId;
        }
    } catch (error) {
        console.error('Reload error:', error);
    }
}

function getCurrencySymbol(currency) {
    const symbols = {
        NGN: '₦', USD: '$', EUR: '€', GBP: '£', GHS: '₵', KES: 'KSh',
        ZAR: 'R', CAD: 'C$', AUD: 'A$', INR: '₹', CNY: '¥', JPY: '¥'
    };
    return symbols[currency] || (currency + ' ');
}

const spinStyle = document.createElement('style');
spinStyle.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
document.head.appendChild(spinStyle);

console.log('✅ wallet.js loaded - Complete with Wallet Connect');