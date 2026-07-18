"use client";

import { useEffect, useState } from "react";
import { getOrders } from "@/app/actions/account";
import { useToast } from "@/hooks/use-toast";
import { formatTHB } from "@/lib/currency";
import { ShoppingBag, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";
import { ORDER_STATUSES, Order } from "@/lib/types";

export default function OrdersHistoryPage() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      const res = await getOrders();
      if (res.success) {
        setOrders(res.data || []);
      } else {
        toast({ type: "error", title: res.error || "เกิดข้อผิดพลาดในการโหลดประวัติการสั่งซื้อ" });
      }
      setLoading(false);
    }
    loadOrders();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
        <p className="text-gray-500 mt-4 text-sm">กำลังโหลดประวัติการสั่งซื้อ...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-gray-900">ประวัติการสั่งซื้อ</h1>
        <p className="text-gray-500 text-sm mt-1">ดูรายการคำสั่งซื้อทั้งหมดของคุณและการติดตามสถานะ</p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center">
          <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h2 className="font-semibold text-lg text-gray-900">ยังไม่มีประวัติการสั่งซื้อ</h2>
          <p className="text-gray-500 text-sm mt-1 max-w-sm mx-auto">
            คุณสามารถเริ่มสั่งซื้อสินค้าและเลือกช้อปสินค้าคุณภาพมากมายได้ที่หน้าร้านค้าของเรา
          </p>
          <Link href="/products" className="btn-primary mt-6 inline-flex">
            ไปที่ร้านค้า
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const statusInfo = ORDER_STATUSES.find((s) => s.value === order.status);
            const orderDate = new Date(order.created_at).toLocaleDateString("th-TH", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={order.id}
                className="border border-gray-200 rounded-2xl overflow-hidden hover:border-gray-300 transition-all bg-white"
              >
                {/* Order Top Bar */}
                <div className="bg-gray-50 border-b border-gray-150 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="space-y-1">
                    <span className="text-xs text-gray-500">หมายเลขคำสั่งซื้อ</span>
                    <h3 className="font-bold text-gray-900">#{order.order_number}</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        statusInfo?.color || "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {statusInfo?.label || order.status}
                    </span>
                  </div>
                </div>

                {/* Order Details Body */}
                <div className="px-6 py-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="space-y-4 flex-1">
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div className="space-y-1">
                        <span className="text-gray-400 text-xs block">วันที่สั่งซื้อ</span>
                        <span className="font-medium text-gray-800 flex items-center gap-1.5">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {orderDate}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-gray-400 text-xs block">ช่องทางการจ่ายเงิน</span>
                        <span className="font-medium text-gray-800">
                          {order.payment_method === "promptpay" ? "PromptPay QR" : "เก็บเงินปลายทาง (COD)"}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-gray-400 text-xs block">ยอดชำระเงิน</span>
                        <span className="font-bold text-red-600 text-lg">
                          {formatTHB(Number(order.total))}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="w-full md:w-auto shrink-0 flex gap-2">
                    <Link
                      href={`/account/orders/${order.order_number}`}
                      className="btn-primary w-full md:w-auto text-center flex items-center justify-center gap-1 py-2.5 px-4"
                    >
                      <span>รายละเอียด</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
