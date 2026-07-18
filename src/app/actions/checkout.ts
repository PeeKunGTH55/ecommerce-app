"use server";

import { createClient } from "@/lib/supabase/server";
import { generatePromptPayPayload } from "@/lib/promptpay";
import { generateOrderNumber } from "@/lib/utils";
import { APP_CONFIG } from "@/lib/constants";
import { getCart, clearCart } from "./cart";
import type { Address, PaymentMethod } from "@/lib/types";

export interface CheckoutData {
  email: string;
  phone: string;
  paymentMethod: PaymentMethod;
  shippingAddress: Address;
  notes?: string;
  promoCode?: string;
}

export interface CheckoutResult {
  success: boolean;
  error?: string;
  orderId?: string;
  orderNumber?: string;
  promptPayPayload?: string;
  total?: number;
}

export interface ClientCartItem {
  productId: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  stock: number;
  quantity: number;
}

interface OrderItemInsert {
  product_id: string;
  product_name: string;
  product_sku: string | null;
  price: number;
  quantity: number;
  total: number;
}

export async function createOrder(
  data: CheckoutData,
  clientItems?: ClientCartItem[]
): Promise<CheckoutResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let subtotal = 0;
  const orderItemsToInsert: OrderItemInsert[] = [];
  const productsToUpdate: { id: string; newStock: number }[] = [];

  // Check if we use client cart items (Zustand) or server cart items (DB)
  if (clientItems && clientItems.length > 0) {
    const productIds = clientItems.map((item) => item.productId);
    const { data: dbProducts, error: dbProductsError } = await supabase
      .from("products")
      .select("id, name, price, sku, stock_quantity")
      .in("id", productIds);

    if (dbProductsError || !dbProducts) {
      console.error("Fetch DB products error:", dbProductsError);
      return { success: false, error: "ไม่สามารถตรวจสอบข้อมูลสินค้าได้" };
    }

    const dbProductsMap = new Map(dbProducts.map((p) => [p.id, p]));

    for (const item of clientItems) {
      const dbProd = dbProductsMap.get(item.productId);
      if (!dbProd) {
        return { success: false, error: `ไม่พบสินค้า: ${item.name}` };
      }
      if (dbProd.stock_quantity < item.quantity) {
        return {
          success: false,
          error: `สินค้า ${item.name} มีสินค้าไม่พอ (เหลืออยู่ ${dbProd.stock_quantity} ชิ้น)`,
        };
      }

      const itemPrice = Number(dbProd.price);
      const itemSubtotal = itemPrice * item.quantity;
      subtotal += itemSubtotal;

      orderItemsToInsert.push({
        product_id: item.productId,
        product_name: dbProd.name,
        product_sku: dbProd.sku,
        price: itemPrice,
        quantity: item.quantity,
        total: itemSubtotal,
      });

      productsToUpdate.push({
        id: item.productId,
        newStock: Math.max(0, dbProd.stock_quantity - item.quantity),
      });
    }
  } else {
    const cart = await getCart();
    if (!cart?.items || cart.items.length === 0) {
      return { success: false, error: "ตะกร้าสินค้าว่างเปล่า" };
    }

    for (const item of cart.items) {
      if (!item.product) continue;
      const itemPrice = Number(item.product.price);
      const itemSubtotal = itemPrice * item.quantity;
      subtotal += itemSubtotal;

      orderItemsToInsert.push({
        product_id: item.product_id,
        product_name: item.product.name,
        product_sku: item.product.sku,
        price: itemPrice,
        quantity: item.quantity,
        total: itemSubtotal,
      });

      productsToUpdate.push({
        id: item.product_id,
        newStock: Math.max(0, item.product.stock_quantity - item.quantity),
      });
    }
  }

  // Calculate totals
  const isFreeShippingCode = data.promoCode?.toLowerCase().trim() === "testfree";
  const shippingCost = (subtotal >= APP_CONFIG.order.freeShippingThreshold || isFreeShippingCode) ? 0 : 60;
  const total = subtotal + shippingCost;
  const orderNumber = generateOrderNumber();

  // Generate PromptPay payload if selected
  let promptPayPayload: string | null = null;
  if (data.paymentMethod === "promptpay") {
    promptPayPayload = generatePromptPayPayload({
      merchantId: APP_CONFIG.promptpay.merchantId,
      merchantName: APP_CONFIG.promptpay.merchantName,
      amount: total,
      currency: APP_CONFIG.promptpay.currencyCode,
      countryCode: APP_CONFIG.promptpay.countryCode,
      referenceLabel: orderNumber,
      terminalLabel: "POS01",
      additionalData: "",
    });
  }

  // Create order in DB
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      user_id: user?.id ?? null,
      email: data.email,
      phone: data.phone,
      status: "pending",
      payment_method: data.paymentMethod,
      payment_status: "pending",
      promptpay_payload: promptPayPayload,
      subtotal,
      shipping_cost: shippingCost,
      discount: 0,
      total,
      shipping_address: data.shippingAddress,
      notes: data.notes ?? null,
    })
    .select("id")
    .single();

  if (orderError || !order) {
    console.error("createOrder error:", orderError);
    return { success: false, error: "ไม่สามารถสร้างคำสั่งซื้อได้" };
  }

  // Create order items in DB
  const orderItemsToInsertWithOrderId = orderItemsToInsert.map((item) => ({
    ...item,
    order_id: order.id,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItemsToInsertWithOrderId);

  if (itemsError) {
    console.error("Insert order items error:", itemsError);
    return { success: false, error: "ไม่สามารถบันทึกรายการสินค้าในคำสั่งซื้อได้" };
  }

  // Reduce stock in DB
  for (const update of productsToUpdate) {
    await supabase
      .from("products")
      .update({ stock_quantity: update.newStock })
      .eq("id", update.id);
  }

  // Clear server cart if exists
  await clearCart();

  return {
    success: true,
    orderId: order.id,
    orderNumber,
    promptPayPayload: promptPayPayload ?? undefined,
    total,
  };
}

export async function confirmPayment(orderId: string): Promise<CheckoutResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("orders")
    .update({
      payment_status: "paid",
      status: "paid",
      paid_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (error) {
    return { success: false, error: "ไม่สามารถยืนยันการชำระเงินได้" };
  }

  return { success: true, orderId };
}