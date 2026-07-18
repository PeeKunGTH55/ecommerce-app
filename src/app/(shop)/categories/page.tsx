import { CategoryGrid } from "@/components/shop/category-grid";
import { getCategories } from "@/app/actions/products";

export const metadata = {
  title: "หมวดหมู่สินค้า",
  description: "เลือกช้อปตามหมวดหมู่ที่คุณสนใจ",
};

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="section">
      <div className="container">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-gray-900">หมวดหมู่สินค้า</h1>
          <p className="mt-2 text-gray-600">เลือกช้อปตามหมวดหมู่ที่คุณสนใจ</p>
        </div>
        <CategoryGrid categories={categories} />
      </div>
    </div>
  );
}