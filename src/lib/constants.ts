export const APP_CONFIG = {
  name: process.env.NEXT_PUBLIC_APP_NAME || "MyShop",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  description: "ร้านค้าออนไลน์ สินค้าคุณภาพ ราคาคุ้มค่า",
  currency: "THB",
  locale: "th-TH",
  defaultImage: "/images/placeholder-product.jpg",
  pagination: {
    default: 12,
    max: 50,
  },
  cart: {
    maxQuantity: 99,
    sessionExpiryDays: 30,
  },
  order: {
    prefix: "ORD",
    shippingCost: 0,
    freeShippingThreshold: 2000,
  },
  promptpay: {
    merchantId: process.env.PROMPTPAY_MERCHANT_ID || "",
    merchantName: process.env.PROMPTPAY_MERCHANT_NAME || "MyShop",
    city: "Bangkok",
    postalCode: "10110",
    countryCode: "TH",
    currencyCode: "764", // THB
  },
  storage: {
    bucket: "products",
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ["image/jpeg", "image/png", "image/webp"],
  },
} as const;

export const ORDER_STATUS = {
  pending: { label: "รอชำระเงิน", color: "yellow", icon: "clock" },
  paid: { label: "ชำระแล้ว", color: "blue", icon: "check-circle" },
  processing: { label: "กำลังเตรียม", color: "blue", icon: "loader" },
  shipped: { label: "จัดส่งแล้ว", color: "purple", icon: "truck" },
  delivered: { label: "สำเร็จ", color: "green", icon: "package-check" },
  cancelled: { label: "ยกเลิก", color: "red", icon: "x-circle" },
  refunded: { label: "คืนเงิน", color: "gray", icon: "rotate-ccw" },
} as const;

export const PAYMENT_STATUS = {
  pending: { label: "รอชำระ", color: "yellow" },
  paid: { label: "ชำระแล้ว", color: "green" },
  failed: { label: "ล้มเหลว", color: "red" },
  refunded: { label: "คืนเงิน", color: "gray" },
} as const;

export const PAYMENT_METHODS = {
  promptpay: { label: "PromptPay QR", icon: "qr-code" },
  cod: { label: "เก็บเงินปลายทาง (COD)", icon: "truck" },
} as const;

export const PRODUCT_SORT_OPTIONS = [
  { value: "newest", label: "ใหม่สุด" },
  { value: "oldest", label: "เก่าสุด" },
  { value: "price_asc", label: "ราคาต่ำไปสูง" },
  { value: "price_desc", label: "ราคาสูงไปต่ำ" },
  { value: "name_asc", label: "ชื่อ A-Z" },
  { value: "name_desc", label: "ชื่อ Z-A" },
  { value: "popular", label: "ขายดี" },
] as const;

export const ADMIN_ROUTES = [
  { path: "/admin", label: "ภาพรวม", icon: "layout-dashboard" },
  { path: "/admin/products", label: "สินค้า", icon: "package" },
  { path: "/admin/categories", label: "หมวดหมู่", icon: "folder" },
  { path: "/admin/orders", label: "คำสั่งซื้อ", icon: "shopping-bag" },
] as const;