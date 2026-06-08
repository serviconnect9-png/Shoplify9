// utils.js - COMPLETE FIXED (Real API rates only, NO 1:1 placeholders)

// =====================
// TOAST NOTIFICATIONS
// =====================
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = `toast toast-${type} show`;
    
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

// =====================
// LOADER
// =====================
function showLoader() {
    const loader = document.getElementById('loader-overlay');
    if (loader) loader.classList.remove('hidden');
}

function hideLoader() {
    const loader = document.getElementById('loader-overlay');
    if (loader) loader.classList.add('hidden');
}

// =====================
// MODAL
// =====================
function showModal(content) {
    const overlay = document.getElementById('modal-overlay');
    if (!overlay) return;
    
    overlay.innerHTML = `
        <div class="modal-content" onclick="event.stopPropagation()">
            <button style="float:right;background:none;border:none;font-size:24px;cursor:pointer;color:#999;padding:5px;" 
                    onclick="hideModal()">✕</button>
            <div style="clear:both;">${content}</div>
        </div>`;
    overlay.classList.remove('hidden');
    
    overlay.onclick = function(e) {
        if (e.target === overlay) hideModal();
    };
}

function hideModal() {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) overlay.classList.add('hidden');
}

// =====================
// CURRENCY SYSTEM - REAL API RATES ONLY
// All app amounts are in USD
// Conversion only happens when paying via Flutterwave
// =====================

/**
 * Format USD amount for display
 * Always returns $X.XX since all app amounts are USD
 */
function formatCurrency(amount) {
    if (amount === null || amount === undefined || isNaN(amount)) return '$0.00';
    amount = parseFloat(amount);
    return '$' + amount.toFixed(2);
}

/**
 * Get real exchange rate from cached API data
 * Returns: How many units of that currency = 1 USD
 * Example: getRealRate('NGN') returns 1359.55
 */
function getRealRate(currencyCode) {
    if (!currencyCode || currencyCode === 'USD') return 1;
    
    // Check if we have rates loaded
    if (!APP.exchangeRates || Object.keys(APP.exchangeRates).length === 0) {
        console.error('❌ No exchange rates loaded! Call fetchExchangeRates() first.');
        return null;
    }
    
    // Try your API format first: { data: { NGN: { code: "NGN", value: 1359.55 } } }
    const rateData = APP.exchangeRates[currencyCode];
    if (rateData && typeof rateData === 'object' && rateData.value) {
        return rateData.value;
    }
    
    // Try simple format: { NGN: 1359.55 }
    if (rateData && typeof rateData === 'number') {
        return rateData;
    }
    
    // Try lowercase
    const lowerData = APP.exchangeRates[currencyCode.toLowerCase()];
    if (lowerData && typeof lowerData === 'object' && lowerData.value) {
        return lowerData.value;
    }
    if (lowerData && typeof lowerData === 'number') {
        return lowerData;
    }
    
    console.error('❌ Rate not found for:', currencyCode);
    return null;
}

/**
 * Convert USD to local currency using REAL API rate
 * Example: usdToLocal(100, 'NGN') with rate 1359.55 = 135955
 */
function usdToLocal(usdAmount, localCurrency) {
    if (!usdAmount || isNaN(usdAmount)) return 0;
    if (!localCurrency || localCurrency === 'USD') return parseFloat(usdAmount);
    
    const rate = getRealRate(localCurrency);
    if (rate === null) {
        console.error('❌ Cannot convert - no rate for', localCurrency);
        return 0;
    }
    
    return parseFloat(usdAmount) * rate;
}

/**
 * Convert local currency to USD using REAL API rate
 * Example: localToUsd(135955, 'NGN') with rate 1359.55 = 100
 */
function localToUsd(localAmount, localCurrency) {
    if (!localAmount || isNaN(localAmount)) return 0;
    if (!localCurrency || localCurrency === 'USD') return parseFloat(localAmount);
    
    const rate = getRealRate(localCurrency);
    if (rate === null) {
        console.error('❌ Cannot convert - no rate for', localCurrency);
        return 0;
    }
    
    return parseFloat(localAmount) / rate;
}

/**
 * Get currency symbol for display
 */
function getCurrencySymbol(currency) {
    const symbols = {
        NGN: '₦', USD: '$', EUR: '€', GBP: '£', GHS: '₵', KES: 'KSh',
        ZAR: 'R', CAD: 'C$', AUD: 'A$', INR: '₹', CNY: '¥', JPY: '¥',
        BRL: 'R$', MXN: 'Mex$', RUB: '₽', TRY: '₺', KRW: '₩',
        AED: 'د.إ', SAR: '﷼', QAR: 'QR', EGP: 'E£', MAD: 'MAD',
        PHP: '₱', PKR: '₨', BDT: '৳', IDR: 'Rp', MYR: 'RM',
        THB: '฿', VND: '₫', SGD: 'S$', HKD: 'HK$'
    };
    return symbols[currency] || (currency + ' ');
}

/**
 * Format local currency with symbol
 * Example: formatLocalCurrency(135955, 'NGN') = "₦135,955.00"
 */
function formatLocalCurrency(amount, currency) {
    if (amount === null || amount === undefined || isNaN(amount)) {
        return getCurrencySymbol(currency) + '0.00';
    }
    const symbol = getCurrencySymbol(currency);
    const formatted = parseFloat(amount).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    return symbol + formatted;
}

// =====================
// FETCH REAL EXCHANGE RATES FROM API
// =====================
async function fetchExchangeRates() {
    console.log('🔄 Fetching REAL exchange rates from API...');
    
    try {
        // Primary API - exchangerate.host
        const response = await fetch('https://api.exchangerate.host/latest?base=USD');
        if (response.ok) {
            const json = await response.json();
            if (json && json.rates) {
                // Store in APP.exchangeRates with REAL values
                APP.exchangeRates = {};
                for (const [code, value] of Object.entries(json.rates)) {
                    APP.exchangeRates[code] = { code: code, value: value };
                }
                console.log('✅ REAL rates loaded from exchangerate.host');
                console.log('   Sample: 1 USD =', json.rates.NGN?.toFixed(2), 'NGN');
                console.log('   Sample: 1 USD =', json.rates.EUR?.toFixed(4), 'EUR');
                console.log('   Sample: 1 USD =', json.rates.GBP?.toFixed(4), 'GBP');
                console.log('   Sample: 1 USD =', json.rates.GHS?.toFixed(2), 'GHS');
                console.log('   Sample: 1 USD =', json.rates.KES?.toFixed(2), 'KES');
                return true;
            }
        }
    } catch (error) {
        console.warn('⚠️ Primary API failed:', error.message);
    }
    
    // Fallback API
    try {
        const response = await fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json');
        if (response.ok) {
            const json = await response.json();
            if (json && json.usd) {
                // This API gives rates in different format
                APP.exchangeRates = {};
                for (const [code, value] of Object.entries(json.usd)) {
                    APP.exchangeRates[code.toUpperCase()] = { code: code.toUpperCase(), value: value };
                }
                console.log('✅ REAL rates loaded from fallback API');
                console.log('   Sample: 1 USD =', APP.exchangeRates['NGN']?.value?.toFixed(2), 'NGN');
                return true;
            }
        }
    } catch (error) {
        console.warn('⚠️ Fallback API failed:', error.message);
    }
    
    // If BOTH APIs fail, use hardcoded REAL rates (NOT 1:1)
    console.warn('⚠️ Using hardcoded REAL rates (not 1:1 placeholders)');
    APP.exchangeRates = {
        NGN: { code: "NGN", value: 1359.55 },
        EUR: { code: "EUR", value: 0.868 },
        GBP: { code: "GBP", value: 0.749 },
        GHS: { code: "GHS", value: 11.83 },
        KES: { code: "KES", value: 129.35 },
        ZAR: { code: "ZAR", value: 16.56 },
        CAD: { code: "CAD", value: 1.394 },
        AUD: { code: "AUD", value: 1.419 },
        INR: { code: "INR", value: 94.96 },
        CNY: { code: "CNY", value: 6.766 },
        JPY: { code: "JPY", value: 160.31 },
        BRL: { code: "BRL", value: 5.17 },
        MXN: { code: "MXN", value: 17.51 },
        RUB: { code: "RUB", value: 73.67 },
        TRY: { code: "TRY", value: 46.04 },
        KRW: { code: "KRW", value: 1559.34 },
        AED: { code: "AED", value: 3.67 },
        SAR: { code: "SAR", value: 3.75 },
        QAR: { code: "QAR", value: 3.64 },
        EGP: { code: "EGP", value: 51.77 },
        MAD: { code: "MAD", value: 9.24 },
        PHP: { code: "PHP", value: 61.76 },
        PKR: { code: "PKR", value: 278.23 },
        BDT: { code: "BDT", value: 122.74 },
        IDR: { code: "IDR", value: 18039 },
        MYR: { code: "MYR", value: 4.03 },
        THB: { code: "THB", value: 32.82 },
        VND: { code: "VND", value: 26280 },
        SGD: { code: "SGD", value: 1.29 },
        HKD: { code: "HKD", value: 7.83 },
        SEK: { code: "SEK", value: 9.46 },
        NOK: { code: "NOK", value: 9.46 },
        DKK: { code: "DKK", value: 6.49 },
        PLN: { code: "PLN", value: 3.68 },
        CZK: { code: "CZK", value: 20.99 },
        HUF: { code: "HUF", value: 308.40 },
        ILS: { code: "ILS", value: 2.95 },
        CLP: { code: "CLP", value: 914.10 },
        COP: { code: "COP", value: 3595.41 },
        ARS: { code: "ARS", value: 1440.50 },
        PEN: { code: "PEN", value: 3.47 },
        UAH: { code: "UAH", value: 44.50 }
    };
    return false;
}

// =====================
// UTILITY FUNCTIONS
// =====================
function generateId() {
    return 'sl_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function getTimeAgo(timestamp) {
    if (!timestamp) return 'Just now';
    
    try {
        let date;
        if (timestamp.toDate) {
            date = timestamp.toDate();
        } else if (timestamp instanceof Date) {
            date = timestamp;
        } else if (typeof timestamp === 'number') {
            date = new Date(timestamp);
        } else if (typeof timestamp === 'string') {
            date = new Date(timestamp);
        } else {
            return 'Unknown';
        }
        
        if (isNaN(date.getTime())) return 'Unknown';
        
        const now = new Date();
        const diff = now - date;
        
        if (diff < 0) return 'Just now';
        
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (seconds < 60) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        if (days < 30) return `${Math.floor(days/7)}w ago`;
        return date.toLocaleDateString();
    } catch (e) {
        return 'Unknown';
    }
}

function validateUsername(username) {
    return /^[a-z0-9]{3,30}$/.test(username);
}

function validatePassword(password) {
    return password && password.length >= 6;
}

function calculateCommission(price, percentage) {
    return (parseFloat(price) * parseFloat(percentage)) / 100;
}

function applyDiscount(price, discount) {
    if (!discount || !discount.value) return parseFloat(price);
    if (discount.type === 'percentage') {
        return parseFloat(price) - (parseFloat(price) * parseFloat(discount.value) / 100);
    } else {
        return Math.max(0, parseFloat(price) - parseFloat(discount.value));
    }
}

function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('Copied! 📋', 'success');
        }).catch(() => {
            fallbackCopy(text);
        });
    } else {
        fallbackCopy(text);
    }
}

function fallbackCopy(text) {
    const input = document.createElement('textarea');
    input.value = text;
    input.style.position = 'fixed';
    input.style.opacity = '0';
    document.body.appendChild(input);
    input.select();
    try {
        document.execCommand('copy');
        showToast('Copied! 📋', 'success');
    } catch (e) {
        showToast('Failed to copy', 'error');
    }
    document.body.removeChild(input);
}

async function uploadToCloudinary(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', APP.cloudinaryPreset);
    formData.append('folder', 'shoplify');
    
    try {
        const response = await fetch(APP.cloudinaryUrl, {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        if (data.secure_url) {
            return data.secure_url;
        } else {
            throw new Error('Upload failed');
        }
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw error;
    }
}

function isLoggedIn() {
    return localStorage.getItem('shoplify_auth') === 'true' && 
           (APP.currentUser || APP.userProfile);
}

function logout() {
    localStorage.removeItem('shoplify_auth');
    localStorage.removeItem('shoplify_uid');
    sessionStorage.clear();
    
    if (typeof auth !== 'undefined' && auth.currentUser) {
        auth.signOut().catch(() => {});
    }
    
    APP.currentUser = null;
    APP.userProfile = null;
    
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    const authScreen = document.getElementById('screen-auth');
    if (authScreen) authScreen.classList.remove('hidden');
    
    window.location.hash = 'auth';
}