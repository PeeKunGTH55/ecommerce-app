export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  address: Json | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  created_at: string;
}

export interface Product {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  sku: string | null;
  stock_quantity: number;
  images: string[];
  is_active: boolean;
  is_featured: boolean;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
  category?: Category | null;
}

export interface Cart {
  id: string;
  user_id: string | null;
  session_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  product?: Product | null;
}

export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type PaymentMethod = "promptpay" | "cod";

export interface Address {
  first_name: string;
  last_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string | null;
  email: string;
  phone: string | null;
  status: OrderStatus;
  payment_method: PaymentMethod | null;
  payment_status: PaymentStatus;
  promptpay_payload: string | null;
  subtotal: number;
  shipping_cost: number;
  discount: number;
  total: number;
  shipping_address: Address;
  billing_address: Address | null;
  notes: string | null;
  paid_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_sku: string | null;
  price: number;
  quantity: number;
  total: number;
}

export interface CartWithItems extends Cart {
  items: (CartItem & { product: Product })[];
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

export interface ProductWithCategory extends Product {
  category: Category | null;
}

export interface CategoryWithProducts extends Category {
  products: Product[];
}

export const ORDER_STATUSES: { value: OrderStatus; label: string; color: string }[] = [
  { value: "pending", label: "รอดำเนินการ", color: "bg-yellow-100 text-yellow-800" },
  { value: "paid", label: "ชำระเงินแล้ว", color: "bg-blue-100 text-blue-800" },
  { value: "processing", label: "กำลังเตรียมส่ง", color: "bg-purple-100 text-purple-800" },
  { value: "shipped", label: "ส่งแล้ว", color: "bg-indigo-100 text-indigo-800" },
  { value: "delivered", label: "ส่งสำเร็จ", color: "bg-green-100 text-green-800" },
  { value: "cancelled", label: "ยกเลิก", color: "bg-red-100 text-red-800" },
  { value: "refunded", label: "คืนเงิน", color: "bg-gray-100 text-gray-800" },
];

export const PAYMENT_STATUSES: { value: PaymentStatus; label: string; color: string }[] = [
  { value: "pending", label: "รอชำระ", color: "bg-yellow-100 text-yellow-800" },
  { value: "paid", label: "ชำระแล้ว", color: "bg-green-100 text-green-800" },
  { value: "failed", label: "ล้มเหลว", color: "bg-red-100 text-red-800" },
  { value: "refunded", label: "คืนเงิน", color: "bg-gray-100 text-gray-800" },
];

export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "promptpay", label: "PromptPay QR Code" },
  { value: "cod", label: "เก็บเงินปลายทาง (COD)" },
];

export interface SavedAddress {
  id: string;
  user_id: string;
  label: string;
  first_name: string;
  last_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}