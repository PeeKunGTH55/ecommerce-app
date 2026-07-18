import { Suspense } from "react";
import { FeaturedProducts } from "@/components/shop/featured-products";
import { ProductCardSkeleton } from "@/components/ui/loading";
import { getProducts, getCategories } from "@/app/actions/products";
import Link from "next/link";

export const metadata = {
  title: "สินค้าทั้งหมด",
  description: "เลือกซื้อสินค้าคุณภาพจากร้านของเรา",
};

interface ProductsPageProps {
  searchParams: Promise<{ category?: string; sort?: string; search?: string }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;

  // Fetch real data from Supabase
  const [{ products }, categories] = await Promise.all([
    getProducts({
      category: params.category,
      search: params.search,
      sort: params.sort,
    }),
    getCategories(),
  ]);

  return (
    <div className="section">
      <div className="container">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-gray-900">สินค้าทั้งหมด</h1>
          <p className="mt-2 text-gray-600">พบ {products.length} รายการ</p>
        </div>

        <div className="grid lg:grid-cols-[240px_1fr] gap-8">
          {/* Sidebar filters */}
          <aside className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">หมวดหมู่</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/products"
                    className={`block text-sm ${!params.category ? "text-red-600 font-medium" : "text-gray-600 hover:text-red-600"}`}
                  >
                    ทั้งหมด
                  </Link>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <Link
                      href={`/products?category=${cat.slug}`}
                      className={`block text-sm ${params.category === cat.slug ? "text-red-600 font-medium" : "text-gray-600 hover:text-red-600"}`}
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Products */}
          <div>
            <Suspense fallback={<ProductCardSkeleton count={8} />}>
              <FeaturedProducts products={products} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}