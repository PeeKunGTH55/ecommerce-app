"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import type { CartWithItems } from "@/lib/types";

const CART_COOKIE = "cart_session_id";

async function getSessionId(): Promise<string> {
  const cookieStore = await cookies();
  let sessionId = cookieStore.get(CART_COOKIE)?.value;
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    cookieStore.set(CART_COOKIE, sessionId, {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });
  }
  return sessionId;
}

async function getOrCreateCart(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: existing } = await supabase
      .from("carts")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (existing) return existing.id;

    const { data: created } = await supabase
      .from("carts")
      .insert({ user_id: user.id })
      .select("id")
      .single();
    return created!.id;
  }

  const sessionId = await getSessionId();
  const { data: existing } = await supabase
    .from("carts")
    .select("id")
    .eq("session_id", sessionId)
    .maybeSingle();
  if (existing) return existing.id;

  const { data: created } = await supabase
    .from("carts")
    .insert({ session_id: sessionId })
    .select("id")
    .single();
  return created!.id;
}

export async function getCart(): Promise<CartWithItems | null> {
  const supabase = await createClient();
  const cartId = await getOrCreateCart();

  const { data, error } = await supabase
    .from("carts")
    .select("*, items:cart_items(*, product:products(*))")
    .eq("id", cartId)
    .single();

  if (error) return null;
  return data as CartWithItems;
}

export async function addToCart(productId: string, quantity = 1) {
  const supabase = await createClient();
  const cartId = await getOrCreateCart();

  const { data: existing } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("cart_id", cartId)
    .eq("product_id", productId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("cart_items")
      .update({ quantity: existing.quantity + quantity })
      .eq("id", existing.id);
  } else {
    await supabase
      .from("cart_items")
      .insert({ cart_id: cartId, product_id: productId, quantity });
  }

  revalidatePath("/cart");
  return { success: true };
}

export async function updateCartItem(itemId: string, quantity: number) {
  const supabase = await createClient();

  if (quantity <= 0) {
    await supabase.from("cart_items").delete().eq("id", itemId);
  } else {
    await supabase.from("cart_items").update({ quantity }).eq("id", itemId);
  }

  revalidatePath("/cart");
  return { success: true };
}

export async function removeFromCart(itemId: string) {
  const supabase = await createClient();
  await supabase.from("cart_items").delete().eq("id", itemId);
  revalidatePath("/cart");
  return { success: true };
}

export async function clearCart() {
  const supabase = await createClient();
  const cartId = await getOrCreateCart();
  await supabase.from("cart_items").delete().eq("cart_id", cartId);
  revalidatePath("/cart");
  return { success: true };
}

export async function getCartCount(): Promise<number> {
  const cart = await getCart();
  if (!cart?.items) return 0;
  return cart.items.reduce((sum, item) => sum + item.quantity, 0);
}