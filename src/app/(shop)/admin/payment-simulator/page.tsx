"use client";

import { useEffect, useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { formatTHB } from "@/lib/currency";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Check, QrCode, RefreshCw } from "lucide-react";
import type { Order } from "@/lib/types";

// Helper outside the component to avoid linter impure rendering warnings
function generateSimulatedTransactionId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  return `TXN_SIM_${timestamp}`;
}

export default function PaymentSimulatorPage() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [simulatingId, setSimulatingId] = useState<string | null>(null);

  const fetchPendingOrders = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    const supabase = createClient();
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("status", "pending")
      .eq("payment_method", "promptpay")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ type: "error", title: "ไม่สามารถดึงข้อมูลออเดอร์ได้" });
    } else {
      setOrders((data as Order[]) || []);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    // Call without changing loading state synchronously to avoid render warnings
    fetchPendingOrders(false);
  }, [fetchPendingOrders]);

  const handleSimulatePayment = async (order: Order) => {
    setSimulatingId(order.id);
    try {
      const transactionId = generateSimulatedTransactionId();

      const response = await fetch("/api/payment/webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderNumber: order.order_number,
          transactionId: transactionId,
          amount: Number(order.total),
          status: "paid",
          notes: "จำลองสแกนชำระเงินผ่านระบบ Admin Simulator",
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast({
          type: "success",
          title: "จำลองชำระเงินสำเร็จ!",
          description: `ออเดอร์ #${order.order_number} ถูกอัปเดตสถานะเป็นชำระเงินแล้ว`,
        });
        fetchPendingOrders(true);
      } else {
        toast({
          type: "error",
          title: "เกิดข้อผิดพลาดในการจำลอง",
          description: result.error || "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์ Webhook",
        });
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "ไม่สามารถเชื่อมต่อ Webhook API ได้";
      toast({
        type: "error",
        title: "เกิดข้อผิดพลาดทางเทคนิค",
        description: errorMsg,
      });
    } finally {
      setSimulatingId(null);
    }
  };

  return (
    <div className="section bg-gray-50 min-h-screen py-10">
      <div className="container max-w-4xl">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-6">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
            <div className="space-y-1">
              <span className="bg-red-50 text-red-600 text-xs px-2.5 py-1 rounded-full font-bold uppercase">
                Admin Tool
              </span>
              <h1 className="font-heading text-2xl font-bold text-gray-900 mt-1.5">
                เครื่องมือจำลองชำระเงิน (Payment Gateway Simulator)
              </h1>
              <p className="text-gray-500 text-sm">
                ใช้สำหรับทดสอบสแกนจ่ายเงินจำลอง เมื่อโอนเงิน ระบบจะยิง Webhook ไปอัปเดตออเดอร์อัตโนมัติ
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => fetchPendingOrders(true)}
              className="flex items-center gap-1.5 shrink-0"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              <span>ดึงข้อมูลล่าสุด</span>
            </Button>
          </div>

          {/* Table list */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
              <p className="text-gray-500 mt-4 text-sm">กำลังค้นหาคำสั่งซื้อที่รอชำระเงิน...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center bg-gray-50/50">
              <QrCode className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h2 className="font-semibold text-lg text-gray-900">ไม่พบออเดอร์รอชำระเงินผ่านพร้อมเพย์</h2>
              <p className="text-gray-500 text-sm mt-1 max-w-md mx-auto px-4">
                คำสั่งซื้อที่เลือกชำระแบบพร้อมเพย์และยังไม่จ่ายเงินจะแสดงที่นี่เพื่อกดทดสอบจำลองได้ทันที
              </p>
            </div>
          ) : (
            <div className="border border-gray-150 rounded-xl overflow-hidden divide-y divide-gray-150">
              {orders.map((order) => {
                const date = new Date(order.created_at).toLocaleDateString("th-TH", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });
                const isSimulating = simulatingId === order.id;

                return (
                  <div
                    key={order.id}
                    className="p-5 bg-white hover:bg-gray-50/50 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">#{order.order_number}</span>
                        <span className="text-xs bg-yellow-50 text-yellow-700 border border-yellow-100 px-2 py-0.5 rounded">
                          รอจ่ายเงิน
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-3">
                        <span>สั่งเมื่อ {date}</span>
                        <span>•</span>
                        <span>อีเมล: {order.email}</span>
                      </div>
                      <p className="text-sm font-semibold text-red-600 mt-1">
                        ยอดโอน: {formatTHB(Number(order.total))}
                      </p>
                    </div>

                    <Button
                      onClick={() => handleSimulatePayment(order)}
                      isLoading={isSimulating}
                      className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white flex items-center gap-1.5"
                    >
                      <Check className="h-4 w-4" />
                      <span>โอนสำเร็จ (Simulate Transfer)</span>
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
