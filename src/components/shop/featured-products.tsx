"use client";

import { ProductGrid } from "./product-grid";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/use-cart";
import type { Product } from "@/lib/types";

interface FeaturedProductsProps {
  products: Product[];
}

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  const { toast } = useToast();
  const addItem = useCart((s) => s.addItem);

  const handleAddToCart = (product: Product) => {
    addItem(product, 1);
    toast({
      type: "success",
      title: "เพิ่มลงตะกร้าแล้ว",
      description: product.name,
    });
  };

  return <ProductGrid products={products} onAddToCart={handleAddToCart} />;
}