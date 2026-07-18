import Link from "next/link";
import Image from "next/image";
import type { Category } from "@/lib/types";

interface CategoryGridProps {
  categories: Category[];
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/products?category=${category.slug}`}
          className="group relative aspect-square overflow-hidden rounded-xl bg-gray-100"
        >
          {category.image_url && (
            <Image
              src={category.image_url}
              alt={category.name}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-white font-semibold text-lg">{category.name}</h3>
            {category.description && (
              <p className="text-white/80 text-sm line-clamp-1">{category.description}</p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}