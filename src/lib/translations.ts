export type Lang = 'en' | 'zh'

export const translations = {
  en: {
    // Navigation
    home: 'Home',
    shop: 'Shop',
    bulk: 'Wholesale',
    cart: 'Cart',
    categories: 'Categories',
    search: 'Search',
    searchPlaceholder: 'Search products...',

    // Product
    addToCart: 'Add to Cart',
    outOfStock: 'Out of Stock',
    onOrder: 'On Order',
    inStock: 'In Stock',
    retailPrice: 'Retail Price',
    bulkPrice: 'Bulk Price',
    bulkMinQty: 'Min. order',
    bulkSavings: 'Save',
    units: 'units',
    qty: 'Qty',
    viewDetails: 'View Details',
    bulkAvailable: 'Bulk Available',
    featured: 'Featured',

    // Categories
    chargers: 'Chargers',
    cables: 'Cables',
    cctv: 'CCTV',
    routers: 'Routers',
    smartwatches: 'Smartwatches',
    solar: 'Solar',
    powerBanks: 'Power Banks',
    accessories: 'Accessories',

    // Cart
    yourCart: 'Your Cart',
    emptyCart: 'Your cart is empty',
    continueShopping: 'Continue Shopping',
    subtotal: 'Subtotal',
    shipping: 'Shipping',
    total: 'Total',
    checkout: 'Checkout',
    remove: 'Remove',

    // Checkout
    shippingDetails: 'Shipping Details',
    fullName: 'Full Name',
    email: 'Email Address',
    phone: 'Phone Number',
    address: 'Street Address',
    address2: 'Apartment / Suite (optional)',
    city: 'City',
    province: 'Province',
    postalCode: 'Postal Code',
    orderSummary: 'Order Summary',
    placeOrder: 'Place Order & Pay',
    proceedToPayment: 'Proceed to Payment',

    // Bulk / Wholesale
    wholesaleTitle: 'Wholesale & Bulk Orders',
    wholesaleSubtitle: 'Buy in bulk and save more',
    enquireWhatsApp: 'Enquire on WhatsApp',
    bulkEnquiryMessage: 'Hi, I would like to enquire about bulk pricing for',

    // Home
    shopNow: 'Shop Now',
    viewAll: 'View All',
    featuredProducts: 'Featured Products',
    shopByCategory: 'Shop by Category',
    wholesaleBanner: 'Looking for wholesale prices?',
    wholesaleBannerSub: 'We supply retailers and traders across South Africa.',
    getQuote: 'Get a Quote',

    // Footer
    contactUs: 'Contact Us',
    address_store: 'Unit 303, China Cash and Carry, Cnr Discovery Drive & Renaissance Blvd, Crown Mines, Johannesburg, 2092',
    allRightsReserved: 'All rights reserved.',

    // Status
    pending: 'Pending',
    paid: 'Paid',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',

    // Admin
    dashboard: 'Dashboard',
    products: 'Products',
    orders: 'Orders',
    addProduct: 'Add Product',
    editProduct: 'Edit Product',
    productName: 'Product Name (EN)',
    productNameZh: '产品名称 (Chinese)',
    description: 'Description',
    descriptionZh: '描述 (Chinese)',
    category: 'Category',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    active: 'Active',
    inactive: 'Inactive',
    logout: 'Logout',
  },
  zh: {
    // Navigation
    home: '首页',
    shop: '商店',
    bulk: '批发',
    cart: '购物车',
    categories: '分类',
    search: '搜索',
    searchPlaceholder: '搜索产品...',

    // Product
    addToCart: '加入购物车',
    outOfStock: '缺货',
    onOrder: '预订中',
    inStock: '有货',
    retailPrice: '零售价',
    bulkPrice: '批发价',
    bulkMinQty: '最低订量',
    bulkSavings: '节省',
    units: '件',
    qty: '数量',
    viewDetails: '查看详情',
    bulkAvailable: '可批发',
    featured: '精选',

    // Categories
    chargers: '充电器',
    cables: '数据线',
    cctv: '监控摄像',
    routers: '路由器',
    smartwatches: '智能手表',
    solar: '太阳能',
    powerBanks: '充电宝',
    accessories: '配件',

    // Cart
    yourCart: '您的购物车',
    emptyCart: '购物车为空',
    continueShopping: '继续购物',
    subtotal: '小计',
    shipping: '运费',
    total: '总计',
    checkout: '结账',
    remove: '删除',

    // Checkout
    shippingDetails: '收货信息',
    fullName: '姓名',
    email: '电子邮箱',
    phone: '手机号码',
    address: '街道地址',
    address2: '公寓/套房（选填）',
    city: '城市',
    province: '省份',
    postalCode: '邮政编码',
    orderSummary: '订单摘要',
    placeOrder: '下单并支付',
    proceedToPayment: '前往支付',

    // Bulk / Wholesale
    wholesaleTitle: '批发订单',
    wholesaleSubtitle: '批量购买，节省更多',
    enquireWhatsApp: 'WhatsApp咨询',
    bulkEnquiryMessage: '您好，我想咨询以下产品的批发价格：',

    // Home
    shopNow: '立即购物',
    viewAll: '查看全部',
    featuredProducts: '精选产品',
    shopByCategory: '按分类购物',
    wholesaleBanner: '需要批发价格？',
    wholesaleBannerSub: '我们为南非各地零售商和贸易商供货。',
    getQuote: '获取报价',

    // Footer
    contactUs: '联系我们',
    address_store: '约翰内斯堡 Crown Mines, China Cash and Carry, 303号',
    allRightsReserved: '版权所有。',

    // Status
    pending: '待处理',
    paid: '已支付',
    processing: '处理中',
    shipped: '已发货',
    delivered: '已送达',
    cancelled: '已取消',

    // Admin (bilingual labels hardcoded in admin panel)
    dashboard: 'Dashboard 仪表盘',
    products: 'Products 产品',
    orders: 'Orders 订单',
    addProduct: 'Add Product 添加产品',
    editProduct: 'Edit Product 编辑产品',
    productName: 'Product Name (EN)',
    productNameZh: '产品名称 (Chinese)',
    description: 'Description 描述',
    descriptionZh: '描述 (Chinese)',
    category: 'Category 分类',
    save: 'Save 保存',
    cancel: 'Cancel 取消',
    delete: 'Delete 删除',
    active: 'Active 上架',
    inactive: 'Inactive 下架',
    logout: 'Logout 退出',
  },
} as const

export type TranslationKey = keyof typeof translations.en
