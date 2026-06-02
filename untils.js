// ============ Toast Notifications ============
function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${icons[type] || ''}</span> ${message}`;
    container.appendChild(toast);
    
    // Auto remove
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// ============ Format Currency ============
function formatCurrency(amount) {
    if (amount === null || amount === undefined) return '$0.00';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

// ============ Format Date ============
function formatDate(timestamp) {
    if (!timestamp) return 'N/A';
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
    });
}

function formatDateTime(timestamp) {
    if (!timestamp) return 'N/A';
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

function timeAgo(timestamp) {
    if (!timestamp) return '';
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    const seconds = Math.floor((Date.now() - date) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return formatDate(timestamp);
}

// ============ Generate ID ============
function generateId(prefix = 'sc') {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 9)}`;
}

// ============ Generate Affiliate Link ============
function generateAffiliateLink(affiliateId, productId) {
    return `https://serviconnect.app/r/${affiliateId}/${productId}`;
}

// ============ Truncate Text ============
function truncateText(text, maxLength = 50) {
    if (!text || text.length <= maxLength) return text || '';
    return text.substring(0, maxLength) + '...';
}

// ============ Generate Stars ============
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);
    return '⭐'.repeat(fullStars) + (hasHalf ? '✨' : '') + '☆'.repeat(emptyStars);
}

// ============ Loader Functions ============
function showLoader() {
    const loader = document.getElementById('app-loader');
    if (loader) loader.style.display = 'flex';
}

function hideLoader() {
    const loader = document.getElementById('app-loader');
    const app = document.getElementById('app-container');
    if (loader) {
        loader.style.opacity = '0';
        loader.style.transition = 'opacity 0.5s ease';
        setTimeout(() => {
            loader.style.display = 'none';
            if (app) app.style.display = 'block';
        }, 500);
    }
}

function simulateLoading(duration = 5000) {
    const fill = document.querySelector('.loader-progress-fill');
    const percentText = document.querySelector('.loader-percent');
    if (!fill || !percentText) return;
    
    const startTime = Date.now();
    
    function update() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min((elapsed / duration) * 100, 100);
        fill.style.width = progress + '%';
        percentText.textContent = Math.round(progress) + '%';
        if (progress < 100) requestAnimationFrame(update);
    }
    
    requestAnimationFrame(update);
    return new Promise(resolve => setTimeout(resolve, duration));
}

// ============ Copy to Clipboard ============
function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('Copied to clipboard!', 'success');
        }).catch(() => {
            fallbackCopy(text);
        });
    } else {
        fallbackCopy(text);
    }
}

function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try { document.execCommand('copy'); showToast('Copied!', 'success'); }
    catch (e) { showToast('Failed to copy', 'error'); }
    document.body.removeChild(textarea);
}

// ============ Modal Functions ============
function openModal(content) {
    const modalContainer = document.getElementById('modal-container');
    const modalContent = document.getElementById('modal-content');
    if (modalContainer && modalContent) {
        modalContent.innerHTML = content;
        modalContainer.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeModal() {
    const modalContainer = document.getElementById('modal-container');
    if (modalContainer) {
        modalContainer.style.display = 'none';
        document.body.style.overflow = '';
    }
}

// ============ Upload to Cloudinary ============
async function uploadToCloudinary(file, type = 'image') {
    const endpoint = type === 'video' ? CLOUDINARY_CONFIG.videoEndpoint : CLOUDINARY_CONFIG.apiEndpoint;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
    formData.append('folder', 'serviconnect');
    
    try {
        const response = await fetch(endpoint, { method: 'POST', body: formData });
        if (!response.ok) throw new Error('Upload failed');
        const data = await response.json();
        return data.secure_url;
    } catch (error) {
        console.error('Upload error:', error);
        throw error;
    }
}

// ============ Firestore Helpers ============
async function saveToFirestore(collection, docId, data) {
    try {
        await db.collection(collection).doc(docId).set({
            ...data,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        return true;
    } catch (error) {
        console.error(`Firestore save error [${collection}/${docId}]:`, error);
        return false;
    }
}

async function getFromFirestore(collection, docId) {
    try {
        const doc = await db.collection(collection).doc(docId).get();
        return doc.exists ? { id: doc.id, ...doc.data() } : null;
    } catch (error) {
        console.error(`Firestore get error [${collection}/${docId}]:`, error);
        return null;
    }
}

async function queryFirestore(collection, field, operator, value, limit = 20) {
    try {
        const snapshot = await db.collection(collection)
            .where(field, operator, value)
            .limit(limit)
            .get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error(`Firestore query error [${collection}]:`, error);
        return [];
    }
}

async function getAllFromCollection(collection, limit = 50) {
    try {
        const snapshot = await db.collection(collection).limit(limit).get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error(`Firestore getAll error [${collection}]:`, error);
        return [];
    }
}

async function deleteFromFirestore(collection, docId) {
    try {
        await db.collection(collection).doc(docId).delete();
        return true;
    } catch (error) {
        console.error(`Firestore delete error [${collection}/${docId}]:`, error);
        return false;
    }
}

// ============ Suspenstion Check ============
async function checkSuspensionStatus(userId) {
    const userData = await getFromFirestore('users', userId);
    if (!userData) return { isBanned: false, suspensionCount: 0, canInstall: true };
    
    const suspensionCount = userData.suspensionCount || 0;
    const isBanned = suspensionCount >= PLATFORM_CONFIG.maxSuspensionsBeforeBan;
    
    return { isBanned, suspensionCount, canInstall: !isBanned };
}

// ============ Admin Check ============
function isAdmin(email) {
    return email === ADMIN_EMAIL;
}

// ============ Debounce ============
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => { clearTimeout(timeout); func(...args); };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ============ Validate Email ============
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ============ Get URL Parameter ============
function getUrlParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// ============ Scroll to Top ============
function scrollToTop(element) {
    if (element) {
        element.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// ============ Format Number ============
function formatNumber(num) {
    if (num === null || num === undefined) return '0';
    return new Intl.NumberFormat('en-US').format(num);
}

// ============ Calculate Commission ============
function calculateCommission(price, commissionPercentage) {
    return (price * commissionPercentage) / 100;
}

// ============ Random String ============
function randomString(length = 8) {
    return Math.random().toString(36).substring(2, 2 + length);
}