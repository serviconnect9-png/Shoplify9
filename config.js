// config.js - PRODUCTION CONFIGURATION (Real API Endpoints, No Placeholders)

const APP = {
    // =====================
    // APP IDENTITY
    // =====================
    appName: "Shoplify",
    version: "5.0.0",
    poweredBy: "Rev",
    baseUrl: "https://shoplify9.vercel.app",
    
    // =====================
    // ADMIN & SUPPORT
    // =====================
    adminEmail: "ebubechichukwu8@gmail.com",
    csEmail: "shoplify50@gmail.com",
    
    // =====================
    // WHATSAPP LINKS
    // =====================
    whatsappCommunity: "https://chat.whatsapp.com/DlMbMdASDl6LLnTNMi8T7r",
    whatsappAcademy: "https://chat.whatsapp.com/DlMbMdASDl6LLnTNMi8T7r",
    
    // =====================
    // PAYMENT GATEWAY
    // =====================
    flutterwaveKey: "FLWPUBK-b5d5cb8f23411dc9c84afd34c839c15b-X",
    
    // =====================
    // BACKEND API ENDPOINTS
    // =====================
    depositApiUrl: "https://connect-backend--serviconnect9.replit.app/deposit",
    withdrawApiUrl: "https://connect-backend--serviconnect9.replit.app/withdraw",
    backendUrl: "https://connect-backend--serviconnect9.replit.app",
    
    // =====================
    // EXCHANGE RATE API (Real API - exchangerate.host)
    // =====================
    exchangeRateApiUrl: "https://api.exchangerate.host/latest?base=USD",
    exchangeRateFallbackUrl: "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json",
    
    // =====================
    // CLOUDINARY MEDIA UPLOAD
    // =====================
    cloudinaryUrl: "https://api.cloudinary.com/v1_1/serviconnect/image/upload",
    cloudinaryPreset: "connect",
    
    // =====================
    // FINANCIAL LIMITS (USD)
    // =====================
    minDeposit: 5,           // Minimum $5 deposit
    maxDeposit: 10000,       // Maximum $10,000 deposit
    minWithdraw: 5,          // Minimum $5 withdrawal
    maxWithdraw: 10000,      // Maximum $10,000 withdrawal
    maxWithdrawalsPerDay: 2, // Max 2 withdrawals per day
    
    // =====================
    // SUBSCRIPTION PRICES (USD)
    // =====================
    merchantPrice: 2,        // $2 lifetime merchant access
    affiliatePrice: 3,       // $3/month affiliate access
    advertiserPrice: 1,      // $1/month advertiser access
    dropshipStarter: 5,      // $5/month starter plan
    dropshipGrowth: 15,      // $15/month growth plan
    dropshipPro: 30,         // $30/month professional plan
    dropshipElite: 50,       // $50/month elite plan
    sponsorshipFee: 100,     // $100/month product sponsorship
    
    // =====================
    // REWARDS (USD)
    // =====================
    ambassadorReward: 50,    // $50/month ambassador reward
    internshipReward: 30,    // $30 internship reward
    referralBonus: 0.10,     // $0.10 per successful referral
    
    // =====================
    // AFFILIATE COMMISSION
    // =====================
    affiliateCommissionMin: 4,  // 4% minimum commission
    affiliateCommissionMax: 5,  // 5% maximum commission
    
    // =====================
    // VERIFICATION REQUIREMENTS
    // =====================
    verifyMinSales: 500,        // Minimum 500 sales
    verifyMinReferrals: 10,     // Minimum 10 referrals
    verifyMinEarnings: 5000,    // Minimum $5,000 earned
    
    // =====================
    // PRODUCT RESERVATION
    // =====================
    reservationDays: 60,        // Reserve for 60 days
    reservationBonusDays: 8,    // 8 bonus days
    
    // =====================
    // AMBASSADOR PROGRAM
    // =====================
    ambassadorMinSales: 50,     // Minimum 50 sales
    ambassadorInterns: 30,      // 30 interns per cycle
    ambassadorWinners: 2,       // 2 winners per cycle
    
    // =====================
    // SPONSORED PRODUCTS
    // =====================
    sponsorMinSales: 100,       // Minimum 100 sales to sponsor
    sponsorMinPrice: 10,        // Minimum $10 product price
    sponsorMaxPrice: 5000,      // Maximum $5,000 product price
    sponsorMinStock: 50,        // Minimum 50 units in stock
    sponsorMaxStock: 5000,      // Maximum 5,000 units
    
    // =====================
    // DROPSHIP REQUIREMENTS
    // =====================
    dropshipMinSales: 50,           // Minimum 50 sales
    dropshipMinAccountDays: 30,     // Account must be 30 days old
    
    // =====================
    // OTHER
    // =====================
    mysteryMinHours: 200,       // 200 hours for mystery rewards
    vipMonthlySlots: 5,         // 5 VIP slots per month
    revenueSharePercent: 5,     // 5% platform revenue share
    
    // =====================
    // RUNTIME VARIABLES
    // =====================
    currentUser: null,          // Current Firebase user
    userProfile: null,          // Current user profile from Firestore
    exchangeRates: {},          // Live exchange rates cache
    selectedAccountType: null,  // Account type during registration
    
    // =====================
    // PRODUCT CATEGORIES
    // =====================
    categories: [
        "All",
        "Fashion",
        "Shoes",
        "Electronics",
        "Watches",
        "Beauty",
        "Accessories",
        "Home",
        "Sports",
        "Toys",
        "Bags",
        "Digital Products",
        "Software",
        "E-Books",
        "Courses"
    ]
};

console.log('⚙️ Shoplify Enterprise v' + APP.version + ' - Production Config Loaded');
console.log('📍 Base URL:', APP.baseUrl);
console.log('💱 Exchange API:', APP.exchangeRateApiUrl);
console.log('💳 Flutterwave Key:', APP.flutterwaveKey.substring(0, 15) + '...');
console.log('🔗 Backend:', APP.backendUrl);