import Link from "next/link";
import { ArrowRight, Truck, ShieldCheck, CreditCard } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-red-600 to-red-700 text-white">
      <div className="container py-16 lg:py-24">
        <div className="max-w-2xl">
          <span className="inline-block rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium backdrop-blur mb-6">
            🔥 ลดสูงสุด 50% วันนี้เท่านั้น
          </span>
          <h1 className="font-heading text-4xl lg:text-6xl font-bold leading-tight text-balance">
            ช้อปสินค้าคุณภาพ<br />ราคาที่คุณจ่ายได้
          </h1>
          <p className="mt-6 text-lg text-red-50 max-w-lg">
            สินค้าหลากหลาย ส่งไว จ่ายง่ายด้วย PromptPay QR Code
            รับประกันความพอใจทุกการสั่งซื้อ
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/products" className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-medium text-red-500! hover:bg-red-50 transition-colors">
              ช้อปเลย
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/categories" className="inline-flex items-center gap-2 rounded-lg border-2 border-white/40 px-6 py-3 font-medium text-white hover:bg-white/10 transition-colors">
              ดูหมวดหมู่
            </Link>
          </div>
        </div>
      </div>

      {/* Feature bar */}
      <div className="bg-white/10 backdrop-blur border-t border-white/20">
        <div className="container py-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-3">
              <Truck className="h-6 w-6 shrink-0" />
              <div>
                <p className="font-semibold">ส่งฟรี</p>
                <p className="text-red-50">เมื่อซื้อครบ 2,000฿</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 shrink-0" />
              <div>
                <p className="font-semibold">รับประกันของแท้</p>
                <p className="text-red-50">คืนเงินภายใน 7 วัน</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CreditCard className="h-6 w-6 shrink-0" />
              <div>
                <p className="font-semibold">จ่ายง่าย PromptPay</p>
                <p className="text-red-50">หรือเก็บเงินปลายทาง</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}