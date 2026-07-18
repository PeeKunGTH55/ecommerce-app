"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle, QrCode, Truck } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { formatTHB } from "@/lib/currency";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PromptPayQR } from "@/components/shop/promptpay-qr";
import { cn } from "@/lib/utils";
import { APP_CONFIG } from "@/lib/constants";
import type { PaymentMethod } from "@/lib/types";
import { useMounted } from "@/hooks/use-mounted";
import { createOrder } from "@/app/actions/checkout";
import { useToast } from "@/hooks/use-toast";

export default function CheckoutPage() {
  const mounted = useMounted();
  const { toast } = useToast();
  const items = useCart((s) => s.items);
  const subtotal = useCart((s) => s.subtotal());
  const clear = useCart((s) => s.clear);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("promptpay");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [placed, setPlaced] = useState<null | {
    orderNumber: string;
    payload?: string;
    total: number;
    method: PaymentMethod;
  }>(null);

  if (!mounted) return null;

  const shippingCost = (subtotal >= 2000 || promoApplied) ? 0 : subtotal > 0 ? 60 : 0;
  const total = subtotal + shippingCost;

  const handleApplyPromo = () => {
    setPromoError(null);
    if (promoCodeInput.toLowerCase().trim() === "testfree") {
      setPromoApplied(true);
      toast({
        type: "success",
        title: "ใช้โค้ดสำเร็จ",
        description: "ได้รับสิทธิ์จัดส่งฟรีแล้ว",
      });
    } else {
      setPromoError("รหัสโค้ดไม่ถูกต้อง");
    }
  };

  const handleRemovePromo = () => {
    setPromoApplied(false);
    setPromoCodeInput("");
    setPromoError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const addressLine1 = formData.get("addressLine1") as string;
    const state = formData.get("state") as string;
    const city = formData.get("city") as string;
    const postalCode = formData.get("postalCode") as string;
    const notes = formData.get("notes") as string || undefined;

    const shippingAddress = {
      first_name: firstName,
      last_name: lastName,
      phone: phone,
      address_line1: addressLine1,
      city: city,
      state: state,
      postal_code: postalCode,
      country: "Thailand",
    };

    const checkoutData = {
      email,
      phone,
      paymentMethod,
      shippingAddress,
      notes,
      promoCode: promoApplied ? "testfree" : undefined,
    };

    try {
      const res = await createOrder(checkoutData, items);
      if (res.success && res.orderNumber) {
        setPlaced({
          orderNumber: res.orderNumber,
          payload: res.promptPayPayload,
          total: res.total || total,
          method: paymentMethod,
        });
        clear();
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        const errMsg = res.error || "เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ";
        setError(errMsg);
        toast({
          type: "error",
          title: "เกิดข้อผิดพลาด",
          description: errMsg,
        });
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์";
      setError(errMsg);
      toast({
        type: "error",
        title: "เกิดข้อผิดพลาด",
        description: errMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  // Order confirmation screen
  if (placed) {
    return (
      <div className="section">
        <div className="container max-w-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="font-heading text-2xl font-bold text-gray-900">
              สั่งซื้อสำเร็จ!
            </h1>
            <p className="mt-2 text-gray-600">
              เลขที่คำสั่งซื้อ: <span className="font-medium">{placed.orderNumber}</span>
            </p>
          </div>

          {placed.method === "promptpay" && placed.payload ? (
            <PromptPayQR
              payload={placed.payload}
              amount={placed.total}
              orderNumber={placed.orderNumber}
              merchantName={APP_CONFIG.promptpay.merchantName}
            />
          ) : (
            <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
              <Truck className="h-12 w-12 text-red-600 mx-auto mb-3" />
              <h2 className="font-semibold text-lg text-gray-900">เก็บเงินปลายทาง (COD)</h2>
              <p className="mt-2 text-gray-600">
                กรุณาเตรียมเงินสด {formatTHB(placed.total)} เมื่อได้รับสินค้า
              </p>
            </div>
          )}

          <div className="mt-8 flex gap-3">
            <Link href="/products" className="btn-secondary flex-1">
              ช้อปต่อ
            </Link>
            <Link href="/" className="btn-primary flex-1">
              กลับหน้าแรก
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="section">
        <div className="container text-center py-16">
          <h1 className="text-2xl font-bold text-gray-900">ไม่มีสินค้าในตะกร้า</h1>
          <Link href="/products" className="btn-primary mt-6 inline-flex">
            เริ่มช้อปปิ้ง
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="container">
        <h1 className="font-heading text-3xl font-bold text-gray-900 mb-8">ชำระเงิน</h1>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-[1fr_380px] gap-8">
          {/* Left: form */}
          <div className="space-y-8">
            {/* Contact */}
            <section className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="font-semibold text-lg text-gray-900 mb-4">ข้อมูลติดต่อ</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="อีเมล" name="email" type="email" required placeholder="you@email.com" />
                <Input label="เบอร์โทรศัพท์" name="phone" type="tel" required placeholder="0812345678" />
              </div>
            </section>

            {/* Shipping */}
            <section className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="font-semibold text-lg text-gray-900 mb-4">ที่อยู่จัดส่ง</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="ชื่อ" name="firstName" required />
                <Input label="นามสกุล" name="lastName" required />
                <div className="sm:col-span-2">
                  <Input label="ที่อยู่" name="addressLine1" required placeholder="บ้านเลขที่ ถนน ตำบล" />
                </div>
                <Input label="อำเภอ/เขต" name="state" required />
                <Input label="จังหวัด" name="city" required />
                <Input label="รหัสไปรษณีย์" name="postalCode" required maxLength={5} />
              </div>
            </section>

            {/* Payment */}
            <section className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="font-semibold text-lg text-gray-900 mb-4">วิธีชำระเงิน</h2>
              <div className="space-y-3">
                <label
                  className={cn(
                    "flex items-center gap-3 rounded-lg border-2 p-4 cursor-pointer transition-colors",
                    paymentMethod === "promptpay" ? "border-red-600 bg-red-50" : "border-gray-200"
                  )}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "promptpay"}
                    onChange={() => setPaymentMethod("promptpay")}
                    className="sr-only"
                  />
                  <QrCode className="h-6 w-6 text-red-600" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">PromptPay QR Code</p>
                    <p className="text-sm text-gray-500">สแกนจ่ายผ่านแอปธนาคาร</p>
                  </div>
                  <div
                    className={cn(
                      "h-5 w-5 rounded-full border-2",
                      paymentMethod === "promptpay" ? "border-red-600 bg-red-600" : "border-gray-300"
                    )}
                  />
                </label>

                <label
                  className={cn(
                    "flex items-center gap-3 rounded-lg border-2 p-4 cursor-pointer transition-colors",
                    paymentMethod === "cod" ? "border-red-600 bg-red-50" : "border-gray-200"
                  )}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                    className="sr-only"
                  />
                  <Truck className="h-6 w-6 text-red-600" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">เก็บเงินปลายทาง (COD)</p>
                    <p className="text-sm text-gray-500">จ่ายเงินสดเมื่อได้รับสินค้า</p>
                  </div>
                  <div
                    className={cn(
                      "h-5 w-5 rounded-full border-2",
                      paymentMethod === "cod" ? "border-red-600 bg-red-600" : "border-gray-300"
                    )}
                  />
                </label>
              </div>
            </section>
          </div>

          {/* Right: summary */}
          <div className="lg:sticky lg:top-20 h-fit">
            <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
              <h2 className="font-semibold text-lg text-gray-900">สรุปคำสั่งซื้อ</h2>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-3 text-sm">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{item.name}</p>
                      <p className="text-gray-500">x{item.quantity}</p>
                    </div>
                    <span className="font-medium">{formatTHB(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* Promo Code Input */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="โค้ดส่งฟรี (เช่น testfree)"
                    value={promoCodeInput}
                    onChange={(e) => setPromoCodeInput(e.target.value)}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-red-500 focus:outline-none"
                    disabled={promoApplied}
                  />
                  <Button
                    type="button"
                    variant={promoApplied ? "secondary" : "primary"}
                    size="sm"
                    onClick={handleApplyPromo}
                    disabled={promoApplied || !promoCodeInput.trim()}
                  >
                    {promoApplied ? "ใช้แล้ว" : "ใช้โค้ด"}
                  </Button>
                </div>
                {promoError && (
                  <p className="text-xs text-red-600 mt-1">{promoError}</p>
                )}
                {promoApplied && (
                  <p className="text-xs text-green-600 mt-1 flex items-center justify-between">
                    <span>ใช้โค้ดส่งฟรีสำเร็จ!</span>
                    <button
                      type="button"
                      onClick={handleRemovePromo}
                      className="text-red-500 hover:underline text-xs"
                    >
                      ลบโค้ด
                    </button>
                  </p>
                )}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-2 text-sm">
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
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-4 text-lg font-bold">
                <span>รวมทั้งหมด</span>
                <span className="text-red-600">{formatTHB(total)}</span>
              </div>
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-red-700 text-xs">
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "กำลังดำเนินการ..." : "ยืนยันคำสั่งซื้อ"}
              </Button>
              <p className="text-xs text-gray-400 text-center">
                การสั่งซื้อถือว่ายอมรับเงื่อนไขการใช้งาน
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}