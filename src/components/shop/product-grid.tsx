"use client";

import { ProductCard } from "./product-card";
import { Package } from "lucide-react";
import type { Product } from "@/lib/types";

interface ProductGridProps {
  products: Product[];
  onAddToCart?: (product: Product) => void;
  emptyMessage?: string;
}

export function ProductGrid({ products, onAddToCart, emptyMessage }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500">
        <Package className="h-16 w-16 mb-4 text-gray-300" />
        <p className="text-lg font-medium">{emptyMessage || "ไม่พบสินค้า"}</p>
        <p className="text-sm mt-1">ลองค้นหาด้วยคำอื่น หรือดูหมวดหมู่อื่น</p>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
}