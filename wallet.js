// ============ Wallet Module ============

async function loadWalletPage() {
    if (!requireAuth()) return;
    const profile = await refreshUserProfile();
    const walletContent = document.getElementById('wallet-content');
    const country = APP_STATE.userCountry || { flag: '🇺🇸', name: 'United States', currency: 'USD', symbol: '$' };
    
    walletContent.innerHTML = `
        <div style="text-align:center; margin-bottom:16px;">
            <span style="font-size:40px;">${country.flag}</span>
            <p style="font-size:12px; color:#666;">${country.name} · ${country.currency}</p>
        </div>
        <div class="wallet-full-card">
            <div style="text-align:center; margin-bottom:20px;">
                <p style="color:rgba(255,255,255,0.7); font-size:12px; text-transform:uppercase;">Available Balance</p>
                <h1 style="font-size:42px; font-weight:800; color:#FFD700;">${formatCurrency(profile.walletBalance || 0)}</h1>
                <p style="color:rgba(255,255,255,0.5); font-size:13px;">≈ ${formatLocalCurrency(profile.walletBalance || 0)}</p>
            </div>
            <div class="wallet-balance-row"><span class="wallet-balance-label">Pending</span><span class="wallet-balance-value">${formatCurrency(profile.pendingBalance || 0)}</span></div>
            <div class="wallet-balance-row"><span class="wallet-balance-label">Escrow</span><span class="wallet-balance-value">${formatCurrency(profile.escrowBalance || 0)}</span></div>
            <div class="wallet-balance-row"><span class="wallet-balance-label">Affiliate Earnings</span><span class="wallet-balance-value">${formatCurrency(profile.affiliateEarnings || 0)}</span></div>
            <div class="wallet-balance-row"><span class="wallet-balance-label">Total Withdrawn</span><span class="wallet-balance-value">${formatCurrency(profile.withdrawnBalance || 0)}</span></div>
        </div>
        
        <div style="display:flex; gap:10px; margin-bottom:20px;">
            <button class="btn-gold" onclick="showDepositModal()" style="flex:1;"><i class="fas fa-arrow-down"></i> Deposit</button>
            <button class="btn-gold" onclick="showWithdrawModal()" style="flex:1;"><i class="fas fa-arrow-up"></i> Withdraw</button>
        </div>
        
        <div class="section">
            <div class="section-header"><h3 class="section-title">Bank Accounts</h3><button class="btn-text" onclick="showAddBankModal()">+ Add</button></div>
            <div id="bank-accounts-list">${renderBankAccounts(profile.bankAccounts || [])}</div>
        </div>
        
        <div class="section"><h3 class="section-title">Recent Transactions</h3><div id="recent-transactions"><p style="text-align:center;color:#999;">Loading...</p></div></div>
    `;
    loadRecentTransactions();
}

function renderBankAccounts(accounts) {
    if (!accounts || accounts.length === 0) {
        return '<div style="text-align:center;padding:30px;color:#999;"><i class="fas fa-university" style="font-size:40px;display:block;margin-bottom:10px;"></i><p>No bank accounts</p><button class="btn-text" onclick="showAddBankModal()">Add Account</button></div>';
    }
    return accounts.map(a => `
        <div class="bank-account-card">
            <div style="display:flex;align-items:center;gap:12px;">
                <div style="width:40px;height:40px;background:#FFD700;border-radius:10px;display:flex;align-items:center;justify-content:center;color:white;">🏦</div>
                <div>
                    <p style="font-weight:600;">${a.bankName}</p>
                    <p style="font-size:12px;color:#666;">${a.accountName} · ****${a.accountNumber.slice(-4)}</p>
                    ${a.isPrimary ? '<span style="background:#E8F5E9;color:#2E7D32;padding:2px 8px;border-radius:10px;font-size:10px;">PRIMARY</span>' : ''}
                    ${a.disabled ? '<span style="background:#FFEBEE;color:#C62828;padding:2px 8px;border-radius:10px;font-size:10px;">DISABLED</span>' : ''}
                </div>
            </div>
            <div style="display:flex;gap:8px;">
                ${!a.isPrimary && !a.disabled ? `<button class="btn-small-gold" onclick="setPrimaryAccount('${a.id}')">Set Primary</button>` : ''}
                ${!a.disabled ? `<button style="background:none;border:none;color:#FF4444;cursor:pointer;" onclick="disableBankAccount('${a.id}')"><i class="fas fa-ban"></i></button>` : ''}
            </div>
        </div>
    `).join('');
}

function showDepositModal() {
    const country = APP_STATE.userCountry || { currency: 'USD', symbol: '$', flag: '🇺🇸' };
    const rate = APP_STATE.exchangeRate || 1;
    const modalContent = `
        <div style="text-align:center;margin-bottom:20px;">
            <img src="app-icon.png" width="50" height="50" style="border-radius:12px;">
            <h3 style="margin-top:10px;">Deposit Funds ${country.flag}</h3>
        </div>
        <p style="text-align:center;color:#666;">Min: $5 | Max: $10,000</p>
        <p style="text-align:center;font-size:12px;color:#999;">1 USD = ${rate} ${country.currency}</p>
        <div class="form-group">
            <label>Amount in ${country.currency} (${country.symbol})</label>
            <input type="number" id="deposit-local-amount" placeholder="Enter amount in ${country.currency}" 
                   min="${5 * rate}" step="0.01" style="font-size:20px;font-weight:700;text-align:center;"
                   oninput="document.getElementById('deposit-usd-amount').value = (this.value / ${rate}).toFixed(2)">
        </div>
        <div class="form-group">
            <label>Amount in USD ($)</label>
            <input type="text" id="deposit-usd-amount" placeholder="USD equivalent" readonly style="text-align:center;background:#f5f5f5;">
        </div>
        <div style="display:flex;gap:10px;margin-top:16px;">
            <button class="btn-outline" style="flex:1;color:#333;border-color:#ccc;" onclick="closeModal()">Cancel</button>
            <button class="btn-gold" style="flex:1;" onclick="processDeposit()">Pay with Flutterwave</button>
        </div>
    `;
    openModal(modalContent);
}

async function processDeposit() {
    const localAmount = parseFloat(document.getElementById('deposit-local-amount')?.value);
    const usdAmount = parseFloat(document.getElementById('deposit-usd-amount')?.value);
    
    if (!localAmount || !usdAmount || usdAmount < 5) { showToast('Minimum $5 deposit', 'error'); return; }
    if (usdAmount > 10000) { showToast('Maximum $10,000 deposit', 'error'); return; }
    
    closeModal();
    showLoader();
    
    const txRef = generateId('dep');
    try {
        FlutterwaveCheckout({
            public_key: FLUTTERWAVE_PUBLIC_KEY,
            tx_ref: txRef,
            amount: usdAmount,
            currency: 'USD',
            payment_options: 'card,banktransfer,ussd,account,mobilemoney',
            customer: { email: APP_STATE.currentUser.email, name: APP_STATE.userProfile?.displayName || 'User' },
            customizations: { title: 'Shoplify', description: 'Wallet Deposit', logo: 'app-icon.png' },
            callback: async function(response) {
                hideLoader();
                if (response.status === 'successful') {
                    const profile = await refreshUserProfile();
                    await updateUserProfile({ walletBalance: (profile.walletBalance || 0) + usdAmount });
                    await saveToFirestore('transactions', txRef, {
                        userId: APP_STATE.currentUser.uid, type: 'deposit', amount: usdAmount, localAmount: localAmount,
                        currency: APP_STATE.userCurrency, reference: txRef, status: 'completed',
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    showToast('✅ Deposited!', 'success');
                    loadWalletPage();
                }
            },
            onclose: function() { hideLoader(); showToast('Cancelled', 'warning'); }
        });
    } catch (e) { hideLoader(); showToast('Error', 'error'); }
}

function showWithdrawModal() {
    const profile = APP_STATE.userProfile;
    const activeAccounts = (profile.bankAccounts || []).filter(a => !a.disabled);
    const primary = activeAccounts.find(a => a.isPrimary) || activeAccounts[0];
    
    if (!primary) { showToast('Add a bank account first', 'warning'); showAddBankModal(); return; }
    
    const country = APP_STATE.userCountry || { currency: 'USD', symbol: '$', flag: '🇺🇸' };
    const rate = APP_STATE.exchangeRate || 1;
    const maxUSD = Math.min(profile.walletBalance || 0, 10000);
    
    const modalContent = `
        <div style="text-align:center;margin-bottom:20px;">
            <h3>Withdraw ${country.flag}</h3>
            <p style="color:#666;">Available: ${formatCurrency(profile.walletBalance || 0)}</p>
            <p style="font-size:11px;color:#999;">Min: $5 | Max: $10,000 | 2/day | Rate: 1 USD = ${rate} ${country.currency}</p>
        </div>
        <div class="form-group">
            <label>Amount in USD ($)</label>
            <input type="number" id="withdraw-usd" placeholder="USD amount" min="5" max="${maxUSD}" step="0.01"
                   style="font-size:20px;font-weight:700;text-align:center;"
                   oninput="document.getElementById('withdraw-local').value = (this.value * ${rate}).toFixed(2)">
        </div>
        <div class="form-group">
            <label>You'll receive (${country.currency})</label>
            <input type="text" id="withdraw-local" placeholder="${country.currency} equivalent" readonly style="text-align:center;background:#f5f5f5;">
        </div>
        <div class="form-group">
            <label>Bank Account</label>
            <select id="withdraw-bank">
                ${activeAccounts.map(a => `<option value="${a.id}" ${a.isPrimary ? 'selected' : ''}>${a.bankName} - ****${a.accountNumber.slice(-4)}</option>`).join('')}
            </select>
        </div>
        <div style="display:flex;gap:10px;margin-top:16px;">
            <button class="btn-outline" style="flex:1;color:#333;border-color:#ccc;" onclick="closeModal()">Cancel</button>
            <button class="btn-gold" style="flex:1;" onclick="processWithdrawal()">Withdraw</button>
        </div>
    `;
    openModal(modalContent);
}

async function processWithdrawal() {
    if (!requireAuth()) return;
    const usdAmount = parseFloat(document.getElementById('withdraw-usd')?.value);
    const localAmount = parseFloat(document.getElementById('withdraw-local')?.value);
    const bankId = document.getElementById('withdraw-bank')?.value;
    
    if (!usdAmount || usdAmount < 5) { showToast('Minimum $5', 'error'); return; }
    if (usdAmount > 10000) { showToast('Maximum $10,000', 'error'); return; }
    
    const profile = await refreshUserProfile();
    if (usdAmount > (profile.walletBalance || 0)) { showToast('Insufficient balance', 'error'); return; }
    
    const today = new Date(); today.setHours(0,0,0,0);
    const todayWds = await db.collection('transactions').where('userId','==',APP_STATE.currentUser.uid).where('type','==','withdrawal').where('createdAt','>=',firebase.firestore.Timestamp.fromDate(today)).get();
    if (todayWds.size >= 2) { showToast('Daily limit reached (2/day)', 'error'); return; }
    
    closeModal(); showLoader();
    
    const wId = generateId('wdr');
    try {
        await updateUserProfile({ walletBalance: profile.walletBalance - usdAmount, withdrawnBalance: (profile.withdrawnBalance||0) + usdAmount });
        const bank = (profile.bankAccounts||[]).find(a => a.id === bankId);
        await saveToFirestore('withdrawals', wId, {
            userId: APP_STATE.currentUser.uid, userEmail: APP_STATE.currentUser.email,
            amount: usdAmount, localAmount: localAmount, currency: APP_STATE.userCurrency,
            bankAccount: bank, bankAccountId: bankId, status: 'pending',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        await saveToFirestore('transactions', wId, {
            userId: APP_STATE.currentUser.uid, type: 'withdrawal', amount: usdAmount,
            reference: wId, status: 'pending', createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        hideLoader();
        showToast('✅ Withdrawal submitted!', 'success');
        loadWalletPage();
    } catch (e) { hideLoader(); showToast('Error', 'error'); }
}

function showAddBankModal() {
    const countryCode = (APP_STATE.userCountry || { code: 'US' }).code;
    const banks = getBanksForCountry(countryCode);
    
    const modalContent = `
        <h3 style="margin-bottom:16px;">Add Bank Account ${APP_STATE.userCountry?.flag || ''}</h3>
        <div class="form-group"><label>Bank Name</label>
            <select id="bank-name-select">
                ${banks.map(b => `<option value="${b.name}">${b.name}</option>`).join('')}
                <option value="other">Other Bank</option>
            </select>
        </div>
        <div class="form-group" id="other-bank-group" style="display:none;">
            <label>Enter Bank Name</label><input type="text" id="bank-name-other" placeholder="Bank name">
        </div>
        <div class="form-group"><label>Account Holder Name</label><input type="text" id="account-name" placeholder="Full name on account"></div>
        <div class="form-group"><label>Account Number</label><input type="text" id="account-number" placeholder="Account number"></div>
        <div class="form-group"><label>Type</label>
            <select id="account-type"><option value="primary">Primary</option><option value="secondary">Secondary</option></select>
        </div>
        <p style="font-size:10px;color:#FF4444;">⚠️ Cannot be edited after saving</p>
        <div style="display:flex;gap:10px;margin-top:12px;">
            <button class="btn-outline" style="flex:1;color:#333;border-color:#ccc;" onclick="closeModal()">Cancel</button>
            <button class="btn-gold" style="flex:1;" onclick="addBankAccount()">Save</button>
        </div>
    `;
    openModal(modalContent);
    
    setTimeout(() => {
        const select = document.getElementById('bank-name-select');
        const otherGroup = document.getElementById('other-bank-group');
        if (select && otherGroup) {
            select.onchange = function() { otherGroup.style.display = this.value === 'other' ? 'block' : 'none'; };
        }
    }, 200);
}

async function addBankAccount() {
    const selectEl = document.getElementById('bank-name-select');
    let bankName = selectEl?.value === 'other' ? document.getElementById('bank-name-other')?.value?.trim() : selectEl?.value;
    const accountName = document.getElementById('account-name')?.value?.trim();
    const accountNumber = document.getElementById('account-number')?.value?.trim();
    const accountType = document.getElementById('account-type')?.value;
    
    if (!bankName || !accountName || !accountNumber) { showToast('Fill all fields', 'error'); return; }
    if (accountNumber.length < 8) { showToast('Invalid account number', 'error'); return; }
    
    const profile = await refreshUserProfile();
    const bankAccounts = profile.bankAccounts || [];
    if (bankAccounts.some(a => a.accountNumber === accountNumber && !a.disabled)) { showToast('Account exists', 'warning'); return; }
    
    const newAccount = { id: generateId('bank'), bankName, accountName, accountNumber, isPrimary: accountType === 'primary' || bankAccounts.length === 0, disabled: false, createdAt: new Date().toISOString() };
    if (newAccount.isPrimary) bankAccounts.forEach(a => a.isPrimary = false);
    bankAccounts.push(newAccount);
    await updateUserProfile({ bankAccounts });
    closeModal();
    showToast('✅ Bank account added!', 'success');
    loadWalletPage();
}

async function setPrimaryAccount(accountId) {
    const profile = await refreshUserProfile();
    const accounts = profile.bankAccounts || [];
    accounts.forEach(a => a.isPrimary = (a.id === accountId));
    await updateUserProfile({ bankAccounts: accounts });
    showToast('Primary updated', 'success');
    loadWalletPage();
}

async function disableBankAccount(accountId) {
    if (!confirm('Disable this account?')) return;
    const profile = await refreshUserProfile();
    const accounts = profile.bankAccounts || [];
    const account = accounts.find(a => a.id === accountId);
    if (account) {
        account.disabled = true; account.isPrimary = false;
        const active = accounts.filter(a => !a.disabled);
        if (active.length > 0) active[0].isPrimary = true;
        await updateUserProfile({ bankAccounts: accounts });
        showToast('Account disabled', 'success');
        loadWalletPage();
    }
}

async function loadRecentTransactions() {
    const container = document.getElementById('recent-transactions');
    if (!container) return;
    try {
        const snapshot = await db.collection('transactions').where('userId','==',APP_STATE.currentUser.uid).orderBy('createdAt','desc').limit(10).get();
        if (snapshot.empty) { container.innerHTML = '<p style="text-align:center;color:#999;">No transactions</p>'; return; }
        container.innerHTML = snapshot.docs.map(doc => {
            const tx = doc.data();
            const isIn = tx.type === 'deposit' || tx.type === 'affiliate_earning';
            return `<div style="display:flex;justify-content:space-between;align-items:center;padding:12px;border-bottom:1px solid #f5f5f5;">
                <div style="display:flex;align-items:center;gap:10px;">
                    <div style="width:36px;height:36px;border-radius:50%;background:${isIn?'#E8F5E9':'#FFEBEE'};display:flex;align-items:center;justify-content:center;">${isIn?'↓':'↑'}</div>
                    <div><p style="font-weight:600;font-size:13px;text-transform:capitalize;">${tx.type.replace(/_/g,' ')}</p><p style="font-size:11px;color:#999;">${timeAgo(tx.createdAt)}</p></div>
                </div>
                <p style="font-weight:700;color:${isIn?'#00C851':'#FF4444'};">${isIn?'+':'-'}${formatCurrency(tx.amount)}</p>
            </div>`;
        }).join('');
    } catch (e) { container.innerHTML = '<p style="text-align:center;color:#999;">Error</p>'; }
}

async function loadTransactionsPage() {
    if (!requireAuth()) return;
    const screen = document.getElementById('screen-transactions');
    if (!screen) return;
    screen.innerHTML = '<div class="main-layout"><header class="app-header"><button class="icon-btn" onclick="goBack()"><i class="fas fa-arrow-left"></i></button><h2>All Transactions</h2></header><div class="main-content" id="all-transactions-container"><p style="text-align:center;color:#999;">Loading...</p></div></div>';
    screen.style.display = 'block';
    try {
        const snapshot = await db.collection('transactions').where('userId','==',APP_STATE.currentUser.uid).orderBy('createdAt','desc').limit(50).get();
        const container = document.getElementById('all-transactions-container');
        if (snapshot.empty) { container.innerHTML = '<p style="text-align:center;color:#999;padding:40px;">No transactions</p>'; return; }
        container.innerHTML = snapshot.docs.map(doc => {
            const tx = doc.data();
            const isIn = tx.type === 'deposit' || tx.type === 'affiliate_earning';
            return `<div style="display:flex;justify-content:space-between;padding:14px;border-bottom:1px solid #f0f0f0;">
                <div><p style="font-weight:600;">${tx.type.replace(/_/g,' ')}</p><p style="font-size:12px;color:#999;">${formatDateTime(tx.createdAt)}</p></div>
                <p style="font-weight:700;color:${isIn?'#00C851':'#FF4444'};">${isIn?'+':'-'}${formatCurrency(tx.amount)}</p>
            </div>`;
        }).join('');
    } catch (e) { console.error('Error:', e); }
}

window.showDepositModal = showDepositModal;
window.showWithdrawModal = showWithdrawModal;
window.showAddBankModal = showAddBankModal;
window.addBankAccount = addBankAccount;
window.setPrimaryAccount = setPrimaryAccount;
window.disableBankAccount = disableBankAccount;
window.processDeposit = processDeposit;
window.processWithdrawal = processWithdrawal;

console.log('✅ Wallet module ready - 180 countries, all banks including OPay & Moniepoint');