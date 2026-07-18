"use client";

import Link from "next/link";
import { useMounted } from "@/hooks/use-mounted";
import { Minus, Plus, Trash2, Package, ArrowRight } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { formatTHB } from "@/lib/currency";

export default function CartPage() {
  const mounted = useMounted();
  const items = useCart((s) => s.items);
  const updateQuantity = useCart((s) => s.updateQuantity);
  const removeItem = useCart((s) => s.removeItem);
  const subtotal = useCart((s) => s.subtotal());

  if (!mounted) return null;

  const shippingCost = subtotal >= 2000 ? 0 : subtotal > 0 ? 60 : 0;
  const total = subtotal + shippingCost;

  if (items.length === 0) {
    return (
      <div className="section">
        <div className="container">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="h-20 w-20 mb-4 text-gray-300" />
            <h1 className="text-2xl font-bold text-gray-900">ตะกร้าว่างเปล่า</h1>
            <p className="mt-2 text-gray-600">ยังไม่มีสินค้าในตะกร้าของคุณ</p>
            <Link href="/products" className="btn-primary mt-6">
              เริ่มช้อปปิ้ง
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="container">
        <h1 className="font-heading text-3xl font-bold text-gray-900 mb-8">ตะกร้าสินค้า</h1>

        <div className="grid lg:grid-cols-[1fr_360px] gap-8">
          {/* Items */}
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.productId}
                className="flex gap-4 p-4 bg-white rounded-xl border border-gray-200"
              >
                <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/products/${item.slug}`}
                    className="font-medium text-gray-900 hover:text-red-600"
                  >
                    {item.name}
                  </Link>
                  <p className="mt-1 text-red-600 font-semibold">{formatTHB(item.price)}</p>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="p-2 hover:bg-gray-50"
                        aria-label="Decrease"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="p-2 hover:bg-gray-50 disabled:opacity-50"
                        aria-label="Increase"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                      ลบ
                    </button>
                  </div>
                </div>
                <div className="text-right font-semibold text-gray-900">
                  {formatTHB(item.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:sticky lg:top-20 h-fit">
            <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
              <h2 className="font-semibold text-lg text-gray-900">สรุปคำสั่งซื้อ</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">ยอดรวมสินค้า</span>
                  <span className="font-medium">{formatTHB(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ค่าจัดส่ง</span>
                  <span className="font-medium">
                    {shippingCost === 0 ? "ฟรี" : formatTHB(shippingCost)}
                  </span>
                </div>
                {shippingCost > 0 && (
                  <p className="text-xs text-green-600">
                    ซื้อเพิ่ม {formatTHB(2000 - subtotal)} รับส่งฟรี
                  </p>
                )}
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-4 text-lg font-bold">
                <span>รวมทั้งหมด</span>
                <span className="text-red-600">{formatTHB(total)}</span>
              </div>
              <Link href="/checkout" className="btn-primary w-full">
                ดำเนินการสั่งซื้อ
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/products" className="btn-ghost w-full">
                ต่อการช้อปปิ้ง
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}