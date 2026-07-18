"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { SavedAddress, Order, OrderItem } from "@/lib/types";

export interface AccountActionResult<T = unknown> {
  success: boolean;
  error?: string;
  data?: T;
}

// -------------------------------------------------------------
// PROFILE ACTIONS
// -------------------------------------------------------------

export async function getProfile(): Promise<AccountActionResult> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "ไม่ได้เข้าสู่ระบบ" };
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("getProfile error:", error);
      return { success: false, error: "ไม่สามารถดึงข้อมูลโปรไฟล์ได้" };
    }

    return { success: true, data: { ...profile, email: user.email } };
  } catch (err) {
    console.error("getProfile unexpected error:", err);
    return { success: false, error: "เกิดข้อผิดพลาดในการโหลดโปรไฟล์" };
  }
}

export async function updateProfile(formData: FormData): Promise<AccountActionResult> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "ไม่ได้เข้าสู่ระบบ" };
    }

    const fullName = formData.get("fullName") as string;
    const phone = formData.get("phone") as string;

    if (!fullName) {
      return { success: false, error: "กรุณากรอกชื่อ-นามสกุล" };
    }

    // Update in profiles table
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        phone: phone || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (profileError) {
      console.error("updateProfile error:", profileError);
      return { success: false, error: "ไม่สามารถบันทึกข้อมูลโปรไฟล์ได้" };
    }

    // Also update full_name in auth user_metadata
    await supabase.auth.updateUser({
      data: { full_name: fullName },
    });

    revalidatePath("/account");
    return { success: true, data: "บันทึกข้อมูลเรียบร้อยแล้ว" };
  } catch (err) {
    console.error("updateProfile unexpected error:", err);
    return { success: false, error: "เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์" };
  }
}

// -------------------------------------------------------------
// ORDER ACTIONS
// -------------------------------------------------------------

export async function getOrders(): Promise<AccountActionResult<Order[]>> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "ไม่ได้เข้าสู่ระบบ" };
    }

    const { data: orders, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("getOrders error:", error);
      return { success: false, error: "ไม่สามารถดึงข้อมูลประวัติการสั่งซื้อได้" };
    }

    return { success: true, data: orders as Order[] };
  } catch (err) {
    console.error("getOrders unexpected error:", err);
    return { success: false, error: "เกิดข้อผิดพลาดในการโหลดประวัติการสั่งซื้อ" };
  }
}

export async function getOrderDetail(orderNumber: string): Promise<AccountActionResult<{ order: Order; items: OrderItem[] }>> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "ไม่ได้เข้าสู่ระบบ" };
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("order_number", orderNumber)
      .eq("user_id", user.id)
      .single();

    if (orderError || !order) {
      console.error("getOrderDetail order error:", orderError);
      return { success: false, error: "ไม่พบข้อมูลคำสั่งซื้อนี้" };
    }

    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", order.id);

    if (itemsError) {
      console.error("getOrderDetail items error:", itemsError);
      return { success: false, error: "ไม่พบรายการสินค้าในคำสั่งซื้อนี้" };
    }

    return { success: true, data: { order: order as Order, items: items as OrderItem[] } };
  } catch (err) {
    console.error("getOrderDetail unexpected error:", err);
    return { success: false, error: "เกิดข้อผิดพลาดในการโหลดรายละเอียดการสั่งซื้อ" };
  }
}

// -------------------------------------------------------------
// ADDRESS ACTIONS
// -------------------------------------------------------------

export async function getAddresses(): Promise<AccountActionResult<SavedAddress[]>> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "ไม่ได้เข้าสู่ระบบ" };
    }

    const { data: addresses, error } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("getAddresses error:", error);
      return { success: false, error: "ไม่สามารถดึงข้อมูลที่อยู่ได้" };
    }

    return { success: true, data: addresses as SavedAddress[] };
  } catch (err) {
    console.error("getAddresses unexpected error:", err);
    return { success: false, error: "เกิดข้อผิดพลาดในการโหลดที่อยู่" };
  }
}

export async function createAddress(data: Omit<SavedAddress, "id" | "user_id" | "created_at" | "updated_at">): Promise<AccountActionResult<SavedAddress>> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "ไม่ได้เข้าสู่ระบบ" };
    }

    // Check limit (max 5 addresses)
    const { count, error: countError } = await supabase
      .from("addresses")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (countError) {
      return { success: false, error: "เกิดข้อผิดพลาดในการตรวจสอบจำนวนที่อยู่" };
    }

    if (count && count >= 5) {
      return { success: false, error: "คุณสามารถบันทึกที่อยู่ได้สูงสุด 5 ที่อยู่เท่านั้น" };
    }

    // If this is set to default, or if it is the first address, set others default to false
    const shouldBeDefault = data.is_default || !count || count === 0;

    if (shouldBeDefault) {
      await supabase
        .from("addresses")
        .update({ is_default: false })
        .eq("user_id", user.id);
    }

    const { data: newAddress, error } = await supabase
      .from("addresses")
      .insert({
        user_id: user.id,
        label: data.label.trim() || "บ้าน",
        first_name: data.first_name.trim(),
        last_name: data.last_name.trim(),
        phone: data.phone.trim(),
        address_line1: data.address_line1.trim(),
        address_line2: data.address_line2?.trim() || null,
        city: data.city.trim(),
        state: data.state.trim(),
        postal_code: data.postal_code.trim(),
        country: data.country || "Thailand",
        is_default: shouldBeDefault,
      })
      .select()
      .single();

    if (error || !newAddress) {
      console.error("createAddress error:", error);
      return { success: false, error: "ไม่สามารถเพิ่มที่อยู่ใหม่ได้" };
    }

    revalidatePath("/account/addresses");
    revalidatePath("/checkout");
    return { success: true, data: newAddress as SavedAddress };
  } catch (err) {
    console.error("createAddress unexpected error:", err);
    return { success: false, error: "เกิดข้อผิดพลาดในการบันทึกที่อยู่" };
  }
}

export async function updateAddress(
  id: string,
  data: Omit<SavedAddress, "id" | "user_id" | "created_at" | "updated_at">
): Promise<AccountActionResult<SavedAddress>> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "ไม่ได้เข้าสู่ระบบ" };
    }

    // If set to default, update all others to not default
    if (data.is_default) {
      await supabase
        .from("addresses")
        .update({ is_default: false })
        .eq("user_id", user.id)
        .neq("id", id);
    }

    const { data: updatedAddress, error } = await supabase
      .from("addresses")
      .update({
        label: data.label.trim() || "บ้าน",
        first_name: data.first_name.trim(),
        last_name: data.last_name.trim(),
        phone: data.phone.trim(),
        address_line1: data.address_line1.trim(),
        address_line2: data.address_line2?.trim() || null,
        city: data.city.trim(),
        state: data.state.trim(),
        postal_code: data.postal_code.trim(),
        country: data.country || "Thailand",
        is_default: data.is_default,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error || !updatedAddress) {
      console.error("updateAddress error:", error);
      return { success: false, error: "ไม่สามารถอัปเดตที่อยู่นี้ได้" };
    }

    revalidatePath("/account/addresses");
    revalidatePath("/checkout");
    return { success: true, data: updatedAddress as SavedAddress };
  } catch (err) {
    console.error("updateAddress unexpected error:", err);
    return { success: false, error: "เกิดข้อผิดพลาดในการอัปเดตที่อยู่" };
  }
}

export async function deleteAddress(id: string): Promise<AccountActionResult<string>> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "ไม่ได้เข้าสู่ระบบ" };
    }

    // Check if the address to delete is the default one
    const { data: targetAddress, error: getError } = await supabase
      .from("addresses")
      .select("is_default")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (getError || !targetAddress) {
      return { success: false, error: "ไม่พบข้อมูลที่อยู่นี้" };
    }

    const { error } = await supabase
      .from("addresses")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("deleteAddress error:", error);
      return { success: false, error: "ไม่สามารถลบที่อยู่นี้ได้" };
    }

    // If deleted the default one, set the next address as default
    if (targetAddress.is_default) {
      const { data: nextAddress } = await supabase
        .from("addresses")
        .select("id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (nextAddress) {
        await supabase
          .from("addresses")
          .update({ is_default: true })
          .eq("id", nextAddress.id);
      }
    }

    revalidatePath("/account/addresses");
    revalidatePath("/checkout");
    return { success: true, data: id };
  } catch (err) {
    console.error("deleteAddress unexpected error:", err);
    return { success: false, error: "เกิดข้อผิดพลาดในการลบที่อยู่" };
  }
}

export async function setDefaultAddress(id: string): Promise<AccountActionResult<string>> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "ไม่ได้เข้าสู่ระบบ" };
    }

    // Set all default to false
    await supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", user.id);

    // Set target to true
    const { error } = await supabase
      .from("addresses")
      .update({ is_default: true })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("setDefaultAddress error:", error);
      return { success: false, error: "ไม่สามารถตั้งเป็นที่อยู่หลักได้" };
    }

    revalidatePath("/account/addresses");
    revalidatePath("/checkout");
    return { success: true, data: id };
  } catch (err) {
    console.error("setDefaultAddress unexpected error:", err);
    return { success: false, error: "เกิดข้อผิดพลาดในการตั้งค่าที่อยู่หลัก" };
  }
}
