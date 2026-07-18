"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { X, Plus, Minus, Trash2, Package, CreditCard } from "lucide-react";
import { formatTHB } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { createPortal } from "react-dom";
import { useEffect } from "react";
import { useMounted } from "@/hooks/use-mounted";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const mounted = useMounted();
  const items = useCart((s) => s.items);
  const updateQuantity = useCart((s) => s.updateQuantity);
  const removeItem = useCart((s) => s.removeItem);
  const subtotal = useCart((s) => s.subtotal());

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  const shippingCost = subtotal >= 2000 ? 0 : subtotal > 0 ? 60 : 0;
  const total = subtotal + shippingCost;

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className="fixed right-0 top-0 z-50 h-full w-full max-w-sm bg-white shadow-xl flex flex-col animate-slide-in lg:max-w-md"
        role="dialog"
        aria-label="Shopping cart"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-900">ตะกร้าสินค้า</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center text-gray-500">
              <Package className="h-16 w-16 mb-4 text-gray-300" />
              <p className="text-lg font-medium">ตะกร้าว่างเปล่า</p>
              <p className="text-sm mt-1">เพิ่มสินค้าที่คุณชอบได้เลย</p>
              <Button onClick={onClose} className="mt-4">ต่อการช้อปปิ้ง</Button>
            </div>
          ) : (
            <>
              {items.map((item) => (
                <div key={item.productId} className="flex gap-3">
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
                    <p className="mt-1 text-sm text-red-600 font-medium">{formatTHB(item.price)}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="p-1 rounded border border-gray-300 hover:bg-gray-50"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="p-1 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors self-start"
                    aria-label={`Remove ${item.name}`}
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}

              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    สินค้า ({items.reduce((s, i) => s + i.quantity, 0)} ชิ้น)
                  </span>
                  <span className="font-medium text-gray-900">{formatTHB(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">ค่าจัดส่ง</span>
                  <span className="font-medium text-gray-900">
                    {shippingCost === 0 ? "ฟรี" : formatTHB(shippingCost)}
                  </span>
                </div>
                {shippingCost > 0 && (
                  <p className="text-xs text-green-600">
                    ซื้อเพิ่ม {formatTHB(2000 - subtotal)} รับส่งฟรี
                  </p>
                )}
                <div className="flex justify-between text-base font-semibold text-gray-900 pt-2 border-t border-gray-200">
                  <span>รวม</span>
                  <span>{formatTHB(total)}</span>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="border-t border-gray-200 p-4 space-y-3">
          <Link href="/cart" onClick={onClose} className="btn-secondary w-full">
            ดูตะกร้าสินค้า
          </Link>
          <Link
            href="/checkout"
            onClick={onClose}
            className={cn("btn-primary w-full", items.length === 0 && "pointer-events-none opacity-50")}
          >
            <CreditCard className="h-5 w-5" />
            สั่งซื้อ {formatTHB(total)}
          </Link>
        </div>
      </aside>
    </div>,
    document.body
  );
}