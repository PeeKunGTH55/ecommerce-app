import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Supabase client creator for Route Handler
function createStaticClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use service role key to bypass RLS in webhook
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {
          // No-op for webhook route handlers
        },
      },
    }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Payment Webhook received payload:", body);

    // Parse parameters (supports standard gateway style payload)
    const { orderNumber, transactionId, amount, status } = body;

    if (!orderNumber) {
      return NextResponse.json({ error: "Missing orderNumber" }, { status: 400 });
    }

    if (status !== "successful" && status !== "paid") {
      return NextResponse.json({ message: "Transaction status is not paid, ignoring" }, { status: 200 });
    }

    const supabase = createStaticClient();

    // Fetch the order
    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("id, total, payment_status")
      .eq("order_number", orderNumber)
      .single();

    if (fetchError || !order) {
      console.error("Webhook order fetch error:", fetchError);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // If order is already paid, return early
    if (order.payment_status === "paid") {
      return NextResponse.json({ message: "Order already paid" }, { status: 200 });
    }

    // Update order status in Supabase
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        payment_status: "paid",
        status: "paid",
        paid_at: new Date().toISOString(),
        notes: body.notes ? `Gateway TransID: ${transactionId}. Notes: ${body.notes}` : `Gateway TransID: ${transactionId}`,
      })
      .eq("id", order.id);

    if (updateError) {
      console.error("Webhook order update error:", updateError);
      return NextResponse.json({ error: "Failed to update order status" }, { status: 500 });
    }

    console.log(`Order #${orderNumber} successfully paid via webhook (Amount: ${amount})`);
    return NextResponse.json({ success: true, message: "Order status updated successfully" }, { status: 200 });
  } catch (error) {
    const err = error as Error;
    console.error("Payment Webhook error:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
