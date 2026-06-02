// ============ Firebase Configuration ============
const FIREBASE_CONFIG = {
    apiKey: "AIzaSyDRlGps4_dqRBJ2SYmbeXtdDRGTIvYQ510",
    authDomain: "serviconnect-446dd.firebaseapp.com",
    projectId: "serviconnect-446dd",
    storageBucket: "serviconnect-446dd.firebasestorage.app",
    messagingSenderId: "102078290806",
    appId: "1:102078290806:web:88a6e1f9908100a3253857"
};

// ============ Cloudinary Configuration ============
const CLOUDINARY_CONFIG = {
    cloudName: "serviconnect",
    uploadPreset: "connect",
    apiEndpoint: "https://api.cloudinary.com/v1_1/serviconnect/image/upload",
    videoEndpoint: "https://api.cloudinary.com/v1_1/serviconnect/video/upload"
};

// ============ Backend URL ============
const BACKEND_URL = "https://connect-backend--serviconnect9.replit.app";

// ============ Flutterwave Public Key ============
const FLUTTERWAVE_PUBLIC_KEY = "FLWPUBK-b5d5cb8f23411dc9c84afd34c839c15b-X";

// ============ Admin Email ============
const ADMIN_EMAIL = "ebubechichukwu8@gmail.com";

// ============ WhatsApp Community Link ============
const WHATSAPP_COMMUNITY_LINK = "https://whatsapp.com/channel/0029VbClcrq11ulFYHVcU63m";

// ============ Platform Constants ============
const PLATFORM_CONFIG = {
    merchantSubscriptionPrice: 2,
    affiliateSubscriptionPrice: 3,
    minDeposit: 5,
    maxDeposit: 10000,
    minWithdrawal: 5,
    maxWithdrawal: 10000,
    maxWithdrawalsPerDay: 2,
    currency: "USD",
    supportedCountries: 180,
    maxProductImages: 5,
    maxSuspensionsBeforeBan: 3,
    commissionHoldDays: 7,
    appName: "ServiConnect",
    appVersion: "1.0.0"
};

// ============ Product Categories ============
const CATEGORIES = [
    "Fashion", "Shoes", "Electronics", "Bags", "Beauty",
    "Watches", "Accessories", "Home & Garden", "Sports", "Toys"
];

// ============ Store Templates ============
const STORE_TEMPLATES = [
    { id: "classic", name: "Classic", color: "#1A1A2E", icon: "🏪", description: "Clean and professional layout" },
    { id: "modern", name: "Modern", color: "#FFFFFF", icon: "🛍️", description: "Sleek modern design" },
    { id: "premium", name: "Premium", color: "#FFD700", icon: "✨", description: "Luxury premium feel" },
    { id: "minimal", name: "Minimal", color: "#F5F5F5", icon: "📦", description: "Simple and elegant" }
];

// ============ Order Statuses ============
const ORDER_STATUSES = {
    PROCESSING: "processing",
    SHIPPED: "shipped",
    OUT_FOR_DELIVERY: "out_for_delivery",
    DELIVERED: "delivered",
    COMPLETED: "completed",
    DISPUTED: "disputed",
    CANCELLED: "cancelled"
};

// ============ App State (Global) ============
const APP_STATE = {
    currentUser: null,
    userProfile: null,
    currentScreen: 'onboarding',
    previousScreen: null,
    isAuthenticated: false,
    cart: [],
    selectedProduct: null,
    navigationHistory: [],
    selectedColor: null,
    selectedSize: null,
    productQuantity: 1
};