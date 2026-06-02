// ============ Wallet Module ============

async function loadWalletPage() {
    if (!requireAuth()) return;
    
    const profile = await refreshUserProfile();
    const walletContent = document.getElementById('wallet-content');
    
    walletContent.innerHTML = `
        <!-- Balance Card -->
        <div class="wallet-full-card">
            <div style="text-align:center; margin-bottom:20px;">
                <p style="color:rgba(255,255,255,0.7); font-size:12px; text-transform:uppercase; letter-spacing:1px;">
                    Available Balance
                </p>
                <h1 style="font-size:42px; font-weight:800; color:#FFD700; margin:4px 0;">
                    ${formatCurrency(profile.walletBalance || 0)}
                </h1>
            </div>
            <div class="wallet-balance-row">
                <span class="wallet-balance-label">Pending Balance</span>
                <span class="wallet-balance-value">${formatCurrency(profile.pendingBalance || 0)}</span>
            </div>
            <div class="wallet-balance-row">
                <span class="wallet-balance-label">Escrow Balance</span>
                <span class="wallet-balance-value">${formatCurrency(profile.escrowBalance || 0)}</span>
            </div>
            <div class="wallet-balance-row">
                <span class="wallet-balance-label">Affiliate Earnings</span>
                <span class="wallet-balance-value">${formatCurrency(profile.affiliateEarnings || 0)}</span>
            </div>
            <div class="wallet-balance-row">
                <span class="wallet-balance-label">Total Withdrawn</span>
                <span class="wallet-balance-value">${formatCurrency(profile.withdrawnBalance || 0)}</span>
            </div>
        </div>
        
        <!-- Action Buttons -->
        <div style="display:flex; gap:10px; margin-bottom:20px;">
            <button class="btn-gold" onclick="showDepositModal()" style="flex:1;">
                <i class="fas fa-arrow-down"></i> Deposit
            </button>
            <button class="btn-gold" onclick="showWithdrawModal()" style="flex:1;">
                <i class="fas fa-arrow-up"></i> Withdraw
            </button>
        </div>
        
        <!-- Bank Accounts Section -->
        <div class="section">
            <div class="section-header">
                <h3 class="section-title">Bank Accounts</h3>
                <button class="btn-text" onclick="showAddBankModal()">
                    <i class="fas fa-plus"></i> Add
                </button>
            </div>
            <div id="bank-accounts-list">
                ${renderBankAccounts(profile.bankAccounts || [])}
            </div>
        </div>
        
        <!-- Recent Transactions -->
        <div class="section">
            <div class="section-header">
                <h3 class="section-title">Recent Transactions</h3>
                <button class="btn-text" onclick="navigateTo('transactions')">View All</button>
            </div>
            <div id="recent-transactions">
                <p style="text-align:center; color:#999; padding:20px;">Loading...</p>
            </div>
        </div>
    `;
    
    loadRecentTransactions();
}

// ============ Render Bank Accounts ============
function renderBankAccounts(accounts) {
    if (!accounts || accounts.length === 0) {
        return `
            <div style="text-align:center; padding:30px; color:#999;">
                <i class="fas fa-university" style="font-size:40px; margin-bottom:10px; display:block;"></i>
                <p>No bank accounts added yet</p>
                <button class="btn-text mt-10" onclick="showAddBankModal()">Add Bank Account</button>
            </div>`;
    }
    
    return accounts.map(account => `
        <div class="bank-account-card">
            <div style="display:flex; align-items:center; gap:12px;">
                <div style="width:40px; height:40px; background:#FFD700; border-radius:10px; display:flex; align-items:center; justify-content:center; color:white; font-size:18px;">
                    <i class="fas fa-building-columns"></i>
                </div>
                <div>
                    <p style="font-weight:600; font-size:14px;">${account.bankName}</p>
                    <p style="font-size:12px; color:#666;">${account.accountName}</p>
                    <p style="font-size:12px; color:#999;">****${account.accountNumber.slice(-4)}</p>
                    ${account.isPrimary ? '<span style="background:#E8F5E9; color:#2E7D32; padding:2px 8px; border-radius:10px; font-size:10px; font-weight:600;">PRIMARY</span>' : ''}
                    ${account.disabled ? '<span style="background:#FFEBEE; color:#C62828; padding:2px 8px; border-radius:10px; font-size:10px; font-weight:600;">DISABLED</span>' : ''}
                </div>
            </div>
            <div style="display:flex; gap:8px;">
                ${!account.isPrimary && !account.disabled ? 
                    `<button class="btn-small-gold" onclick="setPrimaryAccount('${account.id}')">Set Primary</button>` : ''}
                ${!account.disabled ? 
                    `<button class="btn-text" style="color:#FF4444;" onclick="disableBankAccount('${account.id}')">
                        <i class="fas fa-ban"></i>
                    </button>` : ''}
            </div>
        </div>
    `).join('');
}

// ============ Deposit ============
function showDepositModal() {
    const modalContent = `
        <div style="text-align:center; margin-bottom:20px;">
            <img src="assets/app-icon.png" width="50" height="50" style="border-radius:12px;">
            <h3 style="margin-top:10px;">Deposit Funds</h3>
        </div>
        <p style="color:#666; margin-bottom:8px; text-align:center;">
            Minimum: ${formatCurrency(PLATFORM_CONFIG.minDeposit)} | 
            Maximum: ${formatCurrency(PLATFORM_CONFIG.maxDeposit)}
        </p>
        <div class="form-group">
            <label>Amount (USD)</label>
            <input type="number" id="deposit-amount" placeholder="Enter amount" 
                   min="${PLATFORM_CONFIG.minDeposit}" max="${PLATFORM_CONFIG.maxDeposit}" 
                   step="0.01" style="font-size:20px; font-weight:700; text-align:center;">
        </div>
        <p style="font-size:11px; color:#999; text-align:center; margin:8px 0;">
            You'll be charged in your local currency. Amount will be converted to USD.
        </p>
        <div style="display:flex; gap:10px; margin-top:16px;">
            <button class="btn-outline" style="flex:1; color:#333; border-color:#ccc;" onclick="closeModal()">Cancel</button>
            <button class="btn-gold" style="flex:1;" onclick="processDeposit()">Deposit Now</button>
        </div>
    `;
    openModal(modalContent);
}

async function processDeposit() {
    const amountInput = document.getElementById('deposit-amount');
    const amount = parseFloat(amountInput?.value);
    
    if (!amount || isNaN(amount)) {
        showToast('Please enter a valid amount', 'error');
        return;
    }
    if (amount < PLATFORM_CONFIG.minDeposit) {
        showToast(`Minimum deposit is ${formatCurrency(PLATFORM_CONFIG.minDeposit)}`, 'error');
        return;
    }
    if (amount > PLATFORM_CONFIG.maxDeposit) {
        showToast(`Maximum deposit is ${formatCurrency(PLATFORM_CONFIG.maxDeposit)}`, 'error');
        return;
    }
    
    closeModal();
    showLoader();
    
    const txRef = generateId('dep');
    
    try {
        // Initialize Flutterwave payment
        const paymentConfig = {
            public_key: FLUTTERWAVE_PUBLIC_KEY,
            tx_ref: txRef,
            amount: amount,
            currency: 'USD',
            payment_options: 'card,banktransfer,ussd,account',
            customer: {
                email: APP_STATE.currentUser.email,
                phonenumber: APP_STATE.userProfile?.phoneNumber || '',
                name: APP_STATE.userProfile?.displayName || APP_STATE.currentUser.email
            },
            customizations: {
                title: 'ServiConnect',
                description: 'Wallet Deposit',
                logo: 'https://serviconnect-446dd.firebaseapp.com/assets/app-icon.png'
            },
            callback: async function(response) {
                hideLoader();
                if (response.status === 'successful') {
                    const profile = await refreshUserProfile();
                    const newBalance = (profile.walletBalance || 0) + amount;
                    await updateUserProfile({ walletBalance: newBalance });
                    
                    await saveToFirestore('transactions', txRef, {
                        userId: APP_STATE.currentUser.uid,
                        type: 'deposit',
                        amount: amount,
                        reference: txRef,
                        status: 'completed',
                        flutterwaveRef: response.transaction_id,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    
                    showToast(`✅ $${amount} deposited successfully!`, 'success');
                    loadWalletPage();
                }
            },
            onclose: function() {
                hideLoader();
                showToast('Payment cancelled', 'warning');
            }
        };
        
        if (typeof FlutterwaveCheckout === 'function') {
            FlutterwaveCheckout(paymentConfig);
        } else {
            throw new Error('Flutterwave not loaded');
        }
    } catch (error) {
        hideLoader();
        console.error('Deposit error:', error);
        showToast('Payment failed. Please try again.', 'error');
    }
}

// ============ Withdrawal ============
function showWithdrawModal() {
    const profile = APP_STATE.userProfile;
    const activeAccounts = (profile.bankAccounts || []).filter(a => !a.disabled);
    const primaryAccount = activeAccounts.find(a => a.isPrimary) || activeAccounts[0];
    
    if (!primaryAccount) {
        showToast('Add a bank account first', 'warning');
        showAddBankModal();
        return;
    }
    
    const modalContent = `
        <div style="text-align:center; margin-bottom:20px;">
            <img src="assets/app-icon.png" width="50" height="50" style="border-radius:12px;">
            <h3 style="margin-top:10px;">Withdraw Funds</h3>
        </div>
        <p style="color:#666; text-align:center; margin-bottom:4px;">
            Available: ${formatCurrency(profile.walletBalance || 0)}
        </p>
        <p style="font-size:11px; color:#999; text-align:center; margin-bottom:16px;">
            Min: $5 | Max: $10,000 | 2 withdrawals/day
        </p>
        
        <div class="form-group">
            <label>Amount (USD)</label>
            <input type="number" id="withdraw-amount" placeholder="Enter amount" 
                   min="${PLATFORM_CONFIG.minWithdrawal}" 
                   max="${Math.min(profile.walletBalance || 0, PLATFORM_CONFIG.maxWithdrawal)}" 
                   step="0.01" style="font-size:20px; font-weight:700; text-align:center;">
        </div>
        
        <div class="form-group">
            <label>Bank Account</label>
            <select id="withdraw-bank" style="padding:12px; border-radius:8px;">
                ${activeAccounts.map(a => `
                    <option value="${a.id}" ${a.isPrimary ? 'selected' : ''}>
                        ${a.bankName} - ****${a.accountNumber.slice(-4)}
                    </option>
                `).join('')}
            </select>
        </div>
        
        <p style="font-size:11px; color:#999; text-align:center; margin:8px 0;">
            Amount will be converted to your local currency. Processing within 24 hours.
        </p>
        
        <div style="display:flex; gap:10px; margin-top:16px;">
            <button class="btn-outline" style="flex:1; color:#333; border-color:#ccc;" onclick="closeModal()">Cancel</button>
            <button class="btn-gold" style="flex:1;" onclick="processWithdrawal()">Withdraw</button>
        </div>
    `;
    openModal(modalContent);
}

async function processWithdrawal() {
    if (!requireAuth()) return;
    
    const amount = parseFloat(document.getElementById('withdraw-amount')?.value);
    const bankId = document.getElementById('withdraw-bank')?.value;
    
    if (!amount || isNaN(amount)) {
        showToast('Enter a valid amount', 'error');
        return;
    }
    if (amount < PLATFORM_CONFIG.minWithdrawal) {
        showToast(`Minimum withdrawal is ${formatCurrency(PLATFORM_CONFIG.minWithdrawal)}`, 'error');
        return;
    }
    if (amount > PLATFORM_CONFIG.maxWithdrawal) {
        showToast(`Maximum withdrawal is ${formatCurrency(PLATFORM_CONFIG.maxWithdrawal)}`, 'error');
        return;
    }
    
    const profile = await refreshUserProfile();
    
    if (amount > (profile.walletBalance || 0)) {
        showToast('Insufficient balance', 'error');
        return;
    }
    
    // Check daily limit
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayWithdrawals = await db.collection('transactions')
        .where('userId', '==', APP_STATE.currentUser.uid)
        .where('type', '==', 'withdrawal')
        .where('createdAt', '>=', firebase.firestore.Timestamp.fromDate(today))
        .get();
    
    if (todayWithdrawals.size >= PLATFORM_CONFIG.maxWithdrawalsPerDay) {
        showToast('Daily withdrawal limit reached (2/day)', 'error');
        return;
    }
    
    closeModal();
    showLoader();
    
    const withdrawalId = generateId('wdr');
    
    try {
        const newBalance = profile.walletBalance - amount;
        await updateUserProfile({
            walletBalance: newBalance,
            withdrawnBalance: (profile.withdrawnBalance || 0) + amount
        });
        
        const bankAccount = (profile.bankAccounts || []).find(a => a.id === bankId);
        
        await saveToFirestore('withdrawals', withdrawalId, {
            userId: APP_STATE.currentUser.uid,
            userEmail: APP_STATE.currentUser.email,
            amount: amount,
            bankAccount: bankAccount,
            bankAccountId: bankId,
            status: 'pending',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        await saveToFirestore('transactions', withdrawalId, {
            userId: APP_STATE.currentUser.uid,
            type: 'withdrawal',
            amount: amount,
            reference: withdrawalId,
            status: 'pending',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        hideLoader();
        showToast('✅ Withdrawal request submitted!', 'success');
        loadWalletPage();
    } catch (error) {
        hideLoader();
        console.error('Withdrawal error:', error);
        showToast('Withdrawal failed', 'error');
    }
}

// ============ Bank Account Management ============
function showAddBankModal() {
    const modalContent = `
        <h3 style="margin-bottom:16px;">Add Bank Account</h3>
        <div class="form-group">
            <label>Bank Name</label>
            <input type="text" id="bank-name" placeholder="e.g., Access Bank, Chase">
        </div>
        <div class="form-group">
            <label>Account Holder Name</label>
            <input type="text" id="account-name" placeholder="Full name on account">
        </div>
        <div class="form-group">
            <label>Account Number</label>
            <input type="text" id="account-number" placeholder="Enter account number">
        </div>
        <div class="form-group">
            <label>Account Type</label>
            <select id="account-type">
                <option value="primary">Primary Account</option>
                <option value="secondary">Secondary Account</option>
            </select>
        </div>
        <p style="font-size:11px; color:#FF4444; margin:8px 0;">⚠️ Accounts cannot be edited after saving. You can only disable them.</p>
        <div style="display:flex; gap:10px; margin-top:12px;">
            <button class="btn-outline" style="flex:1; color:#333; border-color:#ccc;" onclick="closeModal()">Cancel</button>
            <button class="btn-gold" style="flex:1;" onclick="addBankAccount()">Save Account</button>
        </div>
    `;
    openModal(modalContent);
}

async function addBankAccount() {
    const bankName = document.getElementById('bank-name')?.value?.trim();
    const accountName = document.getElementById('account-name')?.value?.trim();
    const accountNumber = document.getElementById('account-number')?.value?.trim();
    const accountType = document.getElementById('account-type')?.value;
    
    if (!bankName || !accountName || !accountNumber) {
        showToast('Please fill all fields', 'error');
        return;
    }
    if (accountNumber.length < 10) {
        showToast('Enter a valid account number', 'error');
        return;
    }
    
    const profile = await refreshUserProfile();
    const bankAccounts = profile.bankAccounts || [];
    
    // Check duplicate
    if (bankAccounts.some(a => a.accountNumber === accountNumber && !a.disabled)) {
        showToast('This account number already exists', 'warning');
        return;
    }
    
    const newAccount = {
        id: generateId('bank'),
        bankName,
        accountName,
        accountNumber,
        isPrimary: accountType === 'primary' || bankAccounts.length === 0,
        disabled: false,
        createdAt: new Date().toISOString()
    };
    
    if (newAccount.isPrimary) {
        bankAccounts.forEach(a => a.isPrimary = false);
    }
    
    bankAccounts.push(newAccount);
    await updateUserProfile({ bankAccounts });
    
    closeModal();
    showToast('✅ Bank account added!', 'success');
    loadWalletPage();
}

async function setPrimaryAccount(accountId) {
    const profile = await refreshUserProfile();
    const bankAccounts = profile.bankAccounts || [];
    
    bankAccounts.forEach(a => { a.isPrimary = (a.id === accountId); });
    await updateUserProfile({ bankAccounts });
    
    showToast('Primary account updated', 'success');
    loadWalletPage();
}

async function disableBankAccount(accountId) {
    const confirmed = confirm('Are you sure you want to disable this account? This cannot be undone.');
    if (!confirmed) return;
    
    const profile = await refreshUserProfile();
    const bankAccounts = profile.bankAccounts || [];
    
    const account = bankAccounts.find(a => a.id === accountId);
    if (account) {
        account.disabled = true;
        account.isPrimary = false;
        
        // Set another account as primary if exists
        const activeAccounts = bankAccounts.filter(a => !a.disabled);
        if (activeAccounts.length > 0) {
            activeAccounts[0].isPrimary = true;
        }
        
        await updateUserProfile({ bankAccounts });
        showToast('Bank account disabled', 'success');
        loadWalletPage();
    }
}

async function loadRecentTransactions() {
    const container = document.getElementById('recent-transactions');
    if (!container) return;
    
    try {
        const snapshot = await db.collection('transactions')
            .where('userId', '==', APP_STATE.currentUser.uid)
            .orderBy('createdAt', 'desc')
            .limit(10)
            .get();
        
        if (snapshot.empty) {
            container.innerHTML = '<p style="text-align:center; color:#999; padding:20px;">No transactions yet</p>';
            return;
        }
        
        container.innerHTML = snapshot.docs.map(doc => {
            const tx = doc.data();
            const isIncoming = tx.type === 'deposit' || tx.type === 'affiliate_earning';
            const statusColors = {
                'completed': '#00C851', 'pending': '#FFBB33', 'failed': '#FF4444'
            };
            
            return `
                <div style="display:flex; justify-content:space-between; align-items:center; 
                            padding:12px; border-bottom:1px solid #f5f5f5;">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <div style="width:36px; height:36px; border-radius:50%; 
                                    background:${isIncoming ? '#E8F5E9' : '#FFEBEE'}; 
                                    display:flex; align-items:center; justify-content:center;
                                    font-size:14px;">
                            ${isIncoming ? '↓' : '↑'}
                        </div>
                        <div>
                            <p style="font-weight:600; font-size:13px; text-transform:capitalize;">
                                ${tx.type.replace(/_/g, ' ')}
                            </p>
                            <p style="font-size:11px; color:#999;">${timeAgo(tx.createdAt)}</p>
                        </div>
                    </div>
                    <div style="text-align:right;">
                        <p style="font-weight:700; color:${isIncoming ? '#00C851' : '#FF4444'};">
                            ${isIncoming ? '+' : '-'}${formatCurrency(tx.amount)}
                        </p>
                        <span style="font-size:10px; padding:2px 6px; border-radius:8px; 
                                     background:${statusColors[tx.status] || '#eee'}20;
                                     color:${statusColors[tx.status] || '#999'};">
                            ${tx.status || 'completed'}
                        </span>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Load transactions error:', error);
        container.innerHTML = '<p style="text-align:center; color:#999; padding:20px;">Error loading transactions</p>';
    }
}

async function loadTransactionsPage() {
    if (!requireAuth()) return;
    
    const screen = document.getElementById('screen-transactions');
    if (!screen) return;
    
    // Find or create main content area
    let content = screen.querySelector('.main-content');
    if (!content) {
        content = document.createElement('div');
        content.className = 'main-content';
        screen.appendChild(content);
    }
    
    content.innerHTML = '<h3 style="margin-bottom:16px;">All Transactions</h3><div id="all-transactions"><p style="text-align:center;color:#999;">Loading...</p></div>';
    
    try {
        const snapshot = await db.collection('transactions')
            .where('userId', '==', APP_STATE.currentUser.uid)
            .orderBy('createdAt', 'desc')
            .limit(50)
            .get();
        
        const container = document.getElementById('all-transactions');
        
        if (snapshot.empty) {
            container.innerHTML = '<p style="text-align:center; color:#999; padding:40px;">No transactions found</p>';
            return;
        }
        
        container.innerHTML = snapshot.docs.map(doc => {
            const tx = doc.data();
            const isIncoming = tx.type === 'deposit' || tx.type === 'affiliate_earning';
            return `
                <div style="display:flex; justify-content:space-between; align-items:center; 
                            padding:14px; border-bottom:1px solid #f0f0f0;">
                    <div>
                        <p style="font-weight:600; font-size:14px; text-transform:capitalize;">
                            ${tx.type.replace(/_/g, ' ')}
                        </p>
                        <p style="font-size:12px; color:#999;">${formatDateTime(tx.createdAt)}</p>
                        <p style="font-size:10px; color:#ccc;">Ref: ${doc.id}</p>
                    </div>
                    <p style="font-weight:700; font-size:16px; color:${isIncoming ? '#00C851' : '#FF4444'};">
                        ${isIncoming ? '+' : '-'}${formatCurrency(tx.amount)}
                    </p>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Load all transactions error:', error);
    }
}