import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Hero } from "@/components/shop/hero";
import { CategoryGrid } from "@/components/shop/category-grid";
import { FeaturedProducts } from "@/components/shop/featured-products";
import { getCategories, getFeaturedProducts } from "@/app/actions/products";

export default async function HomePage() {
  const categories = await getCategories();
  const featuredProducts = await getFeaturedProducts();

  return (
    <>
      <Hero />

      {/* Categories */}
      <section className="section">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-heading text-2xl lg:text-3xl font-bold text-gray-900">
                หมวดหมู่สินค้า
              </h2>
              <p className="mt-2 text-gray-600">เลือกช้อปตามหมวดหมู่ที่คุณสนใจ</p>
            </div>
            <Link
              href="/categories"
              className="hidden sm:inline-flex items-center gap-1 text-red-600 font-medium hover:gap-2 transition-all"
            >
              ดูทั้งหมด
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <CategoryGrid categories={categories} />
        </div>
      </section>

      {/* Featured Products */}
      <section className="section bg-gray-50">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-heading text-2xl lg:text-3xl font-bold text-gray-900">
                สินค้าแนะนำ
              </h2>
              <p className="mt-2 text-gray-600">สินค้ายอดนิยมที่ลูกค้าเลือกซื้อ</p>
            </div>
            <Link
              href="/products"
              className="hidden sm:inline-flex items-center gap-1 text-red-600 font-medium hover:gap-2 transition-all"
            >
              ดูทั้งหมด
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <FeaturedProducts products={featuredProducts} />
        </div>
      </section>

      {/* CTA Banner */}
      <section className="section">
        <div className="container">
          <div className="rounded-2xl bg-linear-to-r from-red-600 to-red-700 p-8 lg:p-12 text-center text-white">
            <h2 className="font-heading text-2xl lg:text-3xl font-bold">
              สมัครสมาชิกวันนี้ รับส่วนลด 10%
            </h2>
            <p className="mt-3 text-red-50 max-w-xl mx-auto">
              เป็นสมาชิกเพื่อรับสิทธิพิเศษ โปรโมชั่น และติดตามสถานะคำสั่งซื้อได้ง่ายๆ
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-medium text-red-600! hover:bg-red-50 transition-colors mt-6"
            >
              สมัครสมาชิกฟรี
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}