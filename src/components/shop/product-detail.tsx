"use client";

import { useState } from "react";
import Image from "next/image";
import { ShoppingCart, Heart, Minus, Plus, Truck, ShieldCheck, RotateCcw } from "lucide-react";
import { formatTHB, calculateDiscount } from "@/lib/currency";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/use-cart";
import type { Product } from "@/lib/types";

interface ProductDetailProps {
  product: Product;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const { toast } = useToast();
  const addItem = useCart((s) => s.addItem);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const images = product.images?.length
    ? product.images
    : ["/images/placeholder-product.svg"];
  const hasDiscount =
    product.compare_at_price != null && product.compare_at_price > product.price;
  const discount = hasDiscount
    ? calculateDiscount(product.compare_at_price!, product.price)
    : 0;
  const outOfStock = product.stock_quantity <= 0;

  const handleAddToCart = () => {
    addItem(product, quantity);
    toast({
      type: "success",
      title: "เพิ่มลงตะกร้าแล้ว",
      description: `${product.name} x ${quantity}`,
    });
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
      {/* Images */}
      <div className="space-y-4">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100">
          <Image
            src={images[selectedImage]}
            alt={product.name}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
            priority
          />
          {hasDiscount && (
            <Badge variant="success" className="absolute top-4 left-4">
              -{discount}%
            </Badge>
          )}
        </div>
        {images.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                className={`relative aspect-square overflow-hidden rounded-lg bg-gray-100 border-2 ${
                  selectedImage === i ? "border-red-600" : "border-transparent"
                }`}
              >
                <Image src={img} alt={`${product.name} ${i + 1}`} fill className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div>
        {product.category && (
          <span className="text-sm text-gray-500">{product.category.name}</span>
        )}
        <h1 className="mt-1 font-heading text-2xl lg:text-3xl font-bold text-gray-900">
          {product.name}
        </h1>

        <div className="mt-4 flex items-center gap-3">
          <span className="text-3xl font-bold text-red-600">{formatTHB(product.price)}</span>
          {hasDiscount && (
            <span className="text-lg text-gray-400 line-through">
              {formatTHB(product.compare_at_price!)}
            </span>
          )}
        </div>

        <div className="mt-4">
          {outOfStock ? (
            <Badge variant="default">สินค้าหมด</Badge>
          ) : (
            <Badge variant="success">มีสินค้า {product.stock_quantity} ชิ้น</Badge>
          )}
        </div>

        {product.description && (
          <p className="mt-6 text-gray-600 leading-relaxed">{product.description}</p>
        )}

        {/* Quantity + Add to cart */}
        <div className="mt-8 flex items-center gap-4">
          <div className="flex items-center border border-gray-300 rounded-lg">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="p-3 hover:bg-gray-50 disabled:opacity-50"
              aria-label="Decrease quantity"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-12 text-center font-medium">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => Math.min(product.stock_quantity, q + 1))}
              disabled={quantity >= product.stock_quantity}
              className="p-3 hover:bg-gray-50 disabled:opacity-50"
              aria-label="Increase quantity"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={outOfStock}
            className="btn-primary flex-1 disabled:opacity-50"
          >
            <ShoppingCart className="h-5 w-5" />
            {outOfStock ? "สินค้าหมด" : "เพิ่มลงตะกร้า"}
          </button>

          <button
            className="btn-secondary btn-icon"
            aria-label="Add to wishlist"
          >
            <Heart className="h-5 w-5" />
          </button>
        </div>

        {/* Guarantees */}
        <div className="mt-8 space-y-3 border-t border-gray-100 pt-6">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Truck className="h-5 w-5 text-red-600" />
            ส่งฟรีเมื่อซื้อครบ 2,000฿
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <ShieldCheck className="h-5 w-5 text-red-600" />
            รับประกันสินค้าของแท้ 100%
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <RotateCcw className="h-5 w-5 text-red-600" />
            คืนสินค้าได้ภายใน 7 วัน
          </div>
        </div>
      </div>
    </div>
  );
}