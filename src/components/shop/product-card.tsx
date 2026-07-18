"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Heart } from "lucide-react";
import { formatTHB } from "@/lib/currency";
import { calculateDiscount } from "@/lib/currency";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const image = product.images?.[0] || "/images/placeholder-product.jpg";
  const hasDiscount =
    product.compare_at_price != null && product.compare_at_price > product.price;
  const discount = hasDiscount
    ? calculateDiscount(product.compare_at_price!, product.price)
    : 0;
  const outOfStock = product.stock_quantity <= 0;

  return (
    <div className="group card-hover overflow-hidden flex flex-col">
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-square overflow-hidden bg-gray-100"
      >
        <Image
          src={image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.is_featured && <Badge variant="danger">ขายดี</Badge>}
          {hasDiscount && <Badge variant="success">-{discount}%</Badge>}
          {outOfStock && <Badge variant="default">สินค้าหมด</Badge>}
        </div>

        {/* Wishlist */}
        <button
          className="absolute top-2 right-2 p-2 rounded-full bg-white/90 text-gray-600 opacity-0 group-hover:opacity-100 hover:text-red-600 transition-all"
          aria-label="Add to wishlist"
          onClick={(e) => e.preventDefault()}
        >
          <Heart className="h-4 w-4" />
        </button>
      </Link>

      <div className="p-4 flex flex-col flex-1">
        {product.category && (
          <span className="text-xs text-gray-500 mb-1">{product.category.name}</span>
        )}
        <Link href={`/products/${product.slug}`} className="flex-1">
          <h3 className="font-medium text-gray-900 line-clamp-2 hover:text-red-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="mt-2 flex items-center gap-2">
          <span className="text-lg font-semibold text-red-600">
            {formatTHB(product.price)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-gray-400 line-through">
              {formatTHB(product.compare_at_price!)}
            </span>
          )}
        </div>

        <button
          onClick={() => onAddToCart?.(product)}
          disabled={outOfStock}
          className="btn-primary w-full mt-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ShoppingCart className="h-4 w-4" />
          {outOfStock ? "สินค้าหมด" : "เพิ่มลงตะกร้า"}
        </button>
      </div>
    </div>
  );
}