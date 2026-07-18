"use client";

import { useEffect, useState, use } from "react";
import { getOrderDetail } from "@/app/actions/account";
import { useToast } from "@/hooks/use-toast";
import { formatTHB } from "@/lib/currency";
import { PromptPayQR } from "@/components/shop/promptpay-qr";
import { APP_CONFIG } from "@/lib/constants";
import { ORDER_STATUSES, Order, OrderItem } from "@/lib/types";
import { Calendar, ChevronLeft, CreditCard, MapPin, ShoppingBag, Truck } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ orderNumber: string }>;
}

export default function OrderDetailPage({ params }: PageProps) {
  const { orderNumber } = use(params);
  const { toast } = useToast();
  const [data, setData] = useState<{ order: Order; items: OrderItem[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDetail() {
      const res = await getOrderDetail(orderNumber);
      if (res.success && res.data) {
        setData(res.data);
      } else {
        toast({ type: "error", title: res.error || "เกิดข้อผิดพลาดในการโหลดรายละเอียดคำสั่งซื้อ" });
      }
      setLoading(false);
    }
    loadDetail();
  }, [orderNumber, toast]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
        <p className="text-gray-500 mt-4 text-sm">กำลังโหลดรายละเอียดคำสั่งซื้อ...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-16">
        <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h2 className="font-semibold text-lg text-gray-900">ไม่พบคำสั่งซื้อนี้</h2>
        <Link href="/account/orders" className="btn-primary mt-6 inline-flex">
          ย้อนกลับไปหน้าประวัติการสั่งซื้อ
        </Link>
      </div>
    );
  }

  const { order, items } = data;
  const statusInfo = ORDER_STATUSES.find((s) => s.value === order.status);
  const orderDate = new Date(order.created_at).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div className="space-y-1">
          <Link
            href="/account/orders"
            className="text-sm font-medium text-gray-500 hover:text-gray-900 flex items-center gap-1 mb-2"
          >
            <ChevronLeft className="h-4 w-4" />
            ย้อนกลับ
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-heading text-2xl font-bold text-gray-900">คำสั่งซื้อ #{order.order_number}</h1>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                statusInfo?.color || "bg-gray-100 text-gray-800"
              }`}
            >
              {statusInfo?.label || order.status}
            </span>
          </div>
          <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1">
            <Calendar className="h-4 w-4 text-gray-400" />
            สั่งเมื่อ {orderDate}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-8">
        {/* Left column */}
        <div className="space-y-6">
          {/* Order Items */}
          <section className="space-y-4">
            <h2 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-gray-400" />
              รายการสินค้า
            </h2>
            <div className="border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-150">
              {items.map((item) => (
                <div key={item.id} className="p-4 flex justify-between items-center gap-4 bg-white">
                  <div className="space-y-1 min-w-0">
                    <h4 className="font-medium text-gray-900 text-sm truncate">{item.product_name}</h4>
                    <p className="text-xs text-gray-500">
                      ราคาต่อชิ้น: {formatTHB(Number(item.price))} × จำนวน {item.quantity}
                    </p>
                  </div>
                  <span className="font-semibold text-gray-900 text-sm shrink-0">
                    {formatTHB(Number(item.total))}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Shipping & Payment summary */}
          <div className="grid sm:grid-cols-2 gap-6">
            {/* Delivery address */}
            <section className="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                ที่อยู่จัดส่ง
              </h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p className="font-medium text-gray-900">
                  {order.shipping_address.first_name} {order.shipping_address.last_name}
                </p>
                <p>โทร: {order.shipping_address.phone}</p>
                <p>{order.shipping_address.address_line1}</p>
                {order.shipping_address.address_line2 && <p>{order.shipping_address.address_line2}</p>}
                <p>
                  {order.shipping_address.state} {order.shipping_address.city} {order.shipping_address.postal_code}
                </p>
              </div>
            </section>

            {/* Payment method */}
            <section className="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-gray-500" />
                การชำระเงิน
              </h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  วิธีชำระเงิน:{" "}
                  <span className="font-medium text-gray-900">
                    {order.payment_method === "promptpay" ? "PromptPay QR" : "เก็บเงินปลายทาง (COD)"}
                  </span>
                </p>
                <p>
                  สถานะการชำระเงิน:{" "}
                  <span
                    className={`font-semibold ${
                      order.payment_status === "paid" ? "text-green-600" : "text-yellow-600"
                    }`}
                  >
                    {order.payment_status === "paid" ? "ชำระเงินแล้ว" : "รอชำระเงิน"}
                  </span>
                </p>
                {order.notes && (
                  <div className="pt-2 border-t border-gray-200 mt-2">
                    <p className="text-xs text-gray-400 block">หมายเหตุเพิ่มเติม:</p>
                    <p className="text-xs text-gray-600 italic">&ldquo;{order.notes}&rdquo;</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>

        {/* Right column (totals / QR Code if pending promptpay) */}
        <div className="space-y-6">
          {/* Totals Summary card */}
          <div className="border border-gray-200 rounded-2xl p-6 bg-white space-y-4">
            <h3 className="font-bold text-gray-900 text-lg">สรุปยอดชำระ</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>ยอดรวมสินค้า</span>
                <span>{formatTHB(Number(order.subtotal))}</span>
              </div>
              <div className="flex justify-between">
                <span>ค่าจัดส่ง</span>
                <span>{Number(order.shipping_cost) === 0 ? "ฟรี" : formatTHB(Number(order.shipping_cost))}</span>
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>ส่วนลด</span>
                  <span>-{formatTHB(Number(order.discount))}</span>
                </div>
              )}
              <div className="border-t border-gray-150 pt-3 flex justify-between font-bold text-gray-900 text-base">
                <span>ยอดรวมทั้งหมด</span>
                <span className="text-red-600 text-lg">{formatTHB(Number(order.total))}</span>
              </div>
            </div>
          </div>

          {/* PromptPay QR Section if unpaid & pending */}
          {order.payment_method === "promptpay" &&
            order.payment_status === "pending" &&
            order.status === "pending" &&
            order.promptpay_payload && (
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 flex items-center gap-1.5">
                  <Truck className="h-5 w-5 text-gray-500" />
                  สแกนจ่ายเพื่อชำระเงิน
                </h3>
                <PromptPayQR
                  payload={order.promptpay_payload}
                  amount={Number(order.total)}
                  orderNumber={order.order_number}
                  merchantName={APP_CONFIG.promptpay.merchantName}
                />
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
