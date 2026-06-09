import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type AdminLang = 'en' | 'zh'

const STORAGE_KEY = 'cw-admin-lang'

interface AdminLangContextValue {
  lang: AdminLang
  setLang: (lang: AdminLang) => void
  t: (key: AdminTranslationKey) => string
}

const AdminLangContext = createContext<AdminLangContextValue | null>(null)

// ─── Admin labels (full bilingual) ────────────────────────────────────────────

const ADMIN_TRANSLATIONS = {
  en: {
    // Sidebar
    dashboard: 'Dashboard',
    products: 'Products',
    orders: 'Orders',
    customers: 'Customers',
    messages: 'Messages',
    logout: 'Logout',
    adminPanel: 'Admin Panel',

    // Common
    add: 'Add',
    edit: 'Edit',
    save: 'Save',
    saving: 'Saving...',
    saveProduct: 'Save Product',
    cancel: 'Cancel',
    delete: 'Delete',
    deleting: 'Deleting...',
    apply: 'Apply',
    search: 'Search',
    clear: 'Clear',
    actions: 'Actions',
    loading: 'Loading...',
    selected: 'selected',
    total: 'total',
    backTo: 'Back to',

    // Status
    active: 'Active',
    inactive: 'Inactive',
    inStock: 'In Stock',
    outOfStock: 'Out of Stock',
    onOrder: 'On Order',
    featured: 'Featured',

    // Fields
    productName: 'Product Name',
    productNameZh: 'Product Name (Chinese)',
    description: 'Description',
    descriptionZh: 'Description (Chinese)',
    category: 'Category',
    brand: 'Brand',
    gtin: 'GTIN / Barcode',
    mpn: 'MPN / Model No.',
    retailPrice: 'Retail Price',
    bulkPrice: 'Wholesale Price',
    minQty: 'Min. Quantity',
    images: 'Images',
    image: 'Image',
    pricing: 'Pricing',
    basicInfo: 'Basic Info',
    variants: 'Variants',
    status: 'Status',
    stockStatus: 'Stock Status',

    // Bulk price changer
    setRetailPrice: 'Set retail price',
    setBulkPrice: 'Set wholesale price',
    adjustByPct: 'Adjust by %',
    setMinQty: 'Set min wholesale qty',
    setStockStatus: 'Set stock status',
    setActiveStatus: 'Set active',
    setFeatured: 'Set featured',
    bulkActions: 'Bulk actions',

    // Page titles
    addProduct: 'Add Product',
    editProduct: 'Edit Product',
    productsPage: 'Products',
    ordersPage: 'Orders',
    customersPage: 'Customers',
    messagesPage: 'Messages',
    dashboardPage: 'Analytics',

    // Misc
    enterEnglishFirst: 'Tip: Fill the English field first, then click translate or fill Chinese manually.',
    autoTranslate: 'Auto-translate',
    keepInSync: 'Match English',
    visibleInStore: 'Visible in store',
    showOnHome: 'Show on homepage',
  },
  zh: {
    // Sidebar
    dashboard: '仪表盘',
    products: '产品',
    orders: '订单',
    customers: '客户',
    messages: '留言',
    logout: '退出',
    adminPanel: '管理面板',

    // Common
    add: '添加',
    edit: '编辑',
    save: '保存',
    saving: '保存中...',
    saveProduct: '保存产品',
    cancel: '取消',
    delete: '删除',
    deleting: '删除中...',
    apply: '应用',
    search: '搜索',
    clear: '清除',
    actions: '操作',
    loading: '加载中...',
    selected: '已选',
    total: '总数',
    backTo: '返回',

    // Status
    active: '上架',
    inactive: '下架',
    inStock: '有货',
    outOfStock: '缺货',
    onOrder: '预订中',
    featured: '精选',

    // Fields
    productName: '产品名称',
    productNameZh: '产品名称(中文)',
    description: '产品描述',
    descriptionZh: '产品描述(中文)',
    category: '分类',
    brand: '品牌',
    gtin: 'GTIN / 条码',
    mpn: 'MPN / 型号',
    retailPrice: '零售价',
    bulkPrice: '批发价',
    minQty: '最低订量',
    images: '图片',
    image: '图片',
    pricing: '价格',
    basicInfo: '基本信息',
    variants: '规格',
    status: '状态',
    stockStatus: '库存状态',

    // Bulk price changer
    setRetailPrice: '设置零售价',
    setBulkPrice: '设置批发价',
    adjustByPct: '按百分比调整',
    setMinQty: '设置最低批发数量',
    setStockStatus: '设置库存状态',
    setActiveStatus: '设置上架',
    setFeatured: '设置精选',
    bulkActions: '批量操作',

    // Page titles
    addProduct: '添加产品',
    editProduct: '编辑产品',
    productsPage: '产品管理',
    ordersPage: '订单管理',
    customersPage: '客户管理',
    messagesPage: '客户留言',
    dashboardPage: '销售分析',

    // Misc
    enterEnglishFirst: '提示:先填写英文,然后点击翻译或手动填写中文。',
    autoTranslate: '自动翻译',
    keepInSync: '复制英文',
    visibleInStore: '前台显示',
    showOnHome: '显示在首页',
  },
} as const

export type AdminTranslationKey = keyof typeof ADMIN_TRANSLATIONS.en

function loadLang(): AdminLang {
  if (typeof window === 'undefined') return 'en'
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === 'zh' ? 'zh' : 'en'
}

export function AdminLangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<AdminLang>(loadLang)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang)
  }, [lang])

  function setLang(next: AdminLang) {
    setLangState(next)
  }

  function t(key: AdminTranslationKey): string {
    return ADMIN_TRANSLATIONS[lang][key] ?? key
  }

  return (
    <AdminLangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </AdminLangContext.Provider>
  )
}

export function useAdminLang(): AdminLangContextValue {
  const ctx = useContext(AdminLangContext)
  if (!ctx) throw new Error('useAdminLang must be used inside AdminLangProvider')
  return ctx
}
