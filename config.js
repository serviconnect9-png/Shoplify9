// config.js - UPDATED with real social media SVG icons

const APP = {
    // =====================
    // APP IDENTITY
    // =====================
    appName: "ONESHOPLIFY",
    version: "6.0.0",
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
    // EXCHANGE RATE API
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
    minDeposit: 5,
    maxDeposit: 10000,
    minWithdraw: 5,
    maxWithdraw: 10000,
    maxWithdrawalsPerDay: 2,
    
    // =====================
    // SUBSCRIPTION PRICES (USD)
    // =====================
    merchantPrice: 2,
    affiliatePrice: 3,
    advertiserPrice: 1,
    dropshipStarter: 5,
    dropshipGrowth: 15,
    dropshipPro: 30,
    dropshipElite: 50,
    sponsorshipFee: 100,
    
    // =====================
    // REWARDS (USD)
    // =====================
    ambassadorReward: 50,
    internshipReward: 30,
    referralBonus: 0.10,
    
    // =====================
    // AFFILIATE COMMISSION
    // =====================
    affiliateCommissionMin: 4,
    affiliateCommissionMax: 10,
    
    // =====================
    // VERIFICATION REQUIREMENTS
    // =====================
    verifyMinSales: 500,
    verifyMinReferrals: 10,
    verifyMinEarnings: 5000,
    
    // =====================
    // PRODUCT RESERVATION
    // =====================
    reservationDays: 60,
    reservationBonusDays: 8,
    
    // =====================
    // AMBASSADOR PROGRAM
    // =====================
    ambassadorMinSales: 50,
    ambassadorInterns: 30,
    ambassadorWinners: 2,
    
    // =====================
    // SPONSORED PRODUCTS
    // =====================
    sponsorMinSales: 100,
    sponsorMinPrice: 10,
    sponsorMaxPrice: 5000,
    sponsorMinStock: 50,
    sponsorMaxStock: 5000,
    
    // =====================
    // DROPSHIP REQUIREMENTS
    // =====================
    dropshipMinSales: 50,
    dropshipMinAccountDays: 30,
    
    // =====================
    // INFLUENCER VERIFICATION
    // =====================
    influencerVerification: {
        minCampaigns: 50,
        minSales: 100,
        minDaysActive: 30,
        noFraudReports: true
    },
    influencerPerSaleReward: 1,
    campaignMinBudget: 20,
    campaignMaxDuration: 30,
    
    // =====================
    // OTHER
    // =====================
    mysteryMinHours: 200,
    vipMonthlySlots: 5,
    revenueSharePercent: 5,
    
    // =====================
    // RUNTIME VARIABLES
    // =====================
    currentUser: null,
    userProfile: null,
    exchangeRates: {},
    selectedAccountType: null,
    
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
    ],
    
    // =====================
    // SOCIAL MEDIA PLATFORMS (Real SVG Icons)
    // =====================
    socialPlatforms: [
        {
            id: 'tiktok',
            name: 'TikTok',
            color: '#000000',
            icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>`
        },
        {
            id: 'instagram',
            name: 'Instagram',
            color: '#E4405F',
            icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>`
        },
        {
            id: 'telegram',
            name: 'Telegram',
            color: '#0088cc',
            icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.938z"/></svg>`
        },
        {
            id: 'whatsapp',
            name: 'WhatsApp',
            color: '#25D366',
            icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`
        },
        {
            id: 'linkedin',
            name: 'LinkedIn',
            color: '#0A66C2',
            icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`
        }
    ]
};

console.log('⚙️ ONESHOPLIFY Enterprise v' + APP.version + ' - Production Config Loaded');
console.log('📍 Base URL:', APP.baseUrl);
console.log('💱 Exchange API:', APP.exchangeRateApiUrl);
console.log('💳 Flutterwave Key:', APP.flutterwaveKey.substring(0, 15) + '...');
console.log('🔗 Backend:', APP.backendUrl);
