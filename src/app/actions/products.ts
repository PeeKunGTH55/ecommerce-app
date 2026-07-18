"use server";

import { createClient } from "@/lib/supabase/server";
import type { Product, Category } from "@/lib/types";

export interface ProductQuery {
  category?: string;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
  featured?: boolean;
}

export async function getProducts(query: ProductQuery = {}): Promise<{
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const { category, search, sort = "newest", page = 1, limit = 12, featured } = query;
  const supabase = await createClient();

  let queryBuilder = supabase
    .from("products")
    .select("*, category:categories(*)", { count: "exact" })
    .eq("is_active", true);

  if (category) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", category)
      .single();
    if (cat) {
      queryBuilder = queryBuilder.eq("category_id", cat.id);
    }
  }

  if (search) {
    queryBuilder = queryBuilder.ilike("name", `%${search}%`);
  }

  if (featured) {
    queryBuilder = queryBuilder.eq("is_featured", true);
  }

  switch (sort) {
    case "price_asc":
      queryBuilder = queryBuilder.order("price", { ascending: true });
      break;
    case "price_desc":
      queryBuilder = queryBuilder.order("price", { ascending: false });
      break;
    case "name_asc":
      queryBuilder = queryBuilder.order("name", { ascending: true });
      break;
    case "oldest":
      queryBuilder = queryBuilder.order("created_at", { ascending: true });
      break;
    default:
      queryBuilder = queryBuilder.order("created_at", { ascending: false });
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  queryBuilder = queryBuilder.range(from, to);

  const { data, count, error } = await queryBuilder;

  if (error) {
    console.error("getProducts error:", error);
    return { products: [], total: 0, page, totalPages: 0 };
  }

  return {
    products: (data as Product[]) || [],
    total: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(*)")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error) return null;
  return data as Product;
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) return [];
  return (data as Category[]) || [];
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const { products } = await getProducts({ featured: true, limit });
  return products;
}