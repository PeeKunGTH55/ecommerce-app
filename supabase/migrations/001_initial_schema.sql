-- =============================================
-- MyShop E-commerce - Initial Schema
-- Next.js + Supabase | PromptPay | Thai market
-- =============================================

-- Enable extensions
create extension if not exists "uuid-ossp";

-- =============================================
-- PROFILES (extends auth.users)
-- =============================================
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  phone text,
  address jsonb default '{}'::jsonb,
  is_admin boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =============================================
-- CATEGORIES
-- =============================================
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  image_url text,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- =============================================
-- PRODUCTS
-- =============================================
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references categories(id) on delete set null,
  name text not null,
  slug text unique not null,
  description text,
  price decimal(12,2) not null check (price >= 0),
  compare_at_price decimal(12,2) check (compare_at_price >= 0),
  sku text unique,
  stock_quantity int default 0 check (stock_quantity >= 0),
  images text[] default '{}',
  is_active boolean default true,
  is_featured boolean default false,
  meta_title text,
  meta_description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_products_category on products(category_id);
create index if not exists idx_products_active on products(is_active);
create index if not exists idx_products_featured on products(is_featured);
create index if not exists idx_products_slug on products(slug);

-- =============================================
-- CARTS
-- =============================================
create table if not exists carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  session_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid references carts(id) on delete cascade not null,
  product_id uuid references products(id) on delete cascade not null,
  quantity int not null default 1 check (quantity > 0),
  created_at timestamptz default now(),
  unique(cart_id, product_id)
);

-- =============================================
-- ORDERS
-- =============================================
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  user_id uuid references auth.users on delete set null,
  email text not null,
  phone text,
  status text default 'pending' check (status in ('pending','paid','processing','shipped','delivered','cancelled','refunded')),
  payment_method text check (payment_method in ('promptpay','cod')),
  payment_status text default 'pending' check (payment_status in ('pending','paid','failed','refunded')),
  promptpay_payload text,
  subtotal decimal(12,2) not null,
  shipping_cost decimal(12,2) default 0,
  discount decimal(12,2) default 0,
  total decimal(12,2) not null,
  shipping_address jsonb not null,
  billing_address jsonb,
  notes text,
  paid_at timestamptz,
  shipped_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_orders_user on orders(user_id);
create index if not exists idx_orders_status on orders(status);
create index if not exists idx_orders_number on orders(order_number);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade not null,
  product_id uuid references products(id) on delete set null,
  product_name text not null,
  product_sku text,
  price decimal(12,2) not null,
  quantity int not null check (quantity > 0),
  total decimal(12,2) not null
);

create index if not exists idx_order_items_order on order_items(order_id);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
alter table profiles enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table carts enable row level security;
alter table cart_items enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- Helper: is current user admin?
create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
as $$
  select coalesce((select is_admin from profiles where id = auth.uid()), false);
$$;

-- PROFILES policies
create policy "Users view own profile" on profiles
  for select using (auth.uid() = id or public.is_admin());
create policy "Users update own profile" on profiles
  for update using (auth.uid() = id);

-- CATEGORIES: public read, admin write
create policy "Categories are public" on categories
  for select using (true);
create policy "Admins manage categories" on categories
  for all using (public.is_admin());

-- PRODUCTS: public read active, admin write
create policy "Active products are public" on products
  for select using (is_active = true or public.is_admin());
create policy "Admins manage products" on products
  for all using (public.is_admin());

-- CARTS: owner or matching session
create policy "Users manage own cart" on carts
  for all using (
    auth.uid() = user_id
    or (user_id is null and session_id is not null)
  );

-- CART ITEMS: via cart ownership
create policy "Users manage own cart items" on cart_items
  for all using (
    exists (
      select 1 from carts
      where carts.id = cart_items.cart_id
      and (carts.user_id = auth.uid() or (carts.user_id is null and carts.session_id is not null))
    )
  );

-- ORDERS: owner read, admin all, anyone insert (guest checkout)
create policy "Users view own orders" on orders
  for select using (auth.uid() = user_id or public.is_admin());
create policy "Anyone can create orders" on orders
  for insert with check (true);
create policy "Admins update orders" on orders
  for update using (public.is_admin());

-- ORDER ITEMS: via order ownership
create policy "Users view own order items" on order_items
  for select using (
    exists (
      select 1 from orders
      where orders.id = order_items.order_id
      and (orders.user_id = auth.uid() or public.is_admin())
    )
  );
create policy "Anyone can create order items" on order_items
  for insert with check (true);

-- =============================================
-- UPDATED_AT TRIGGER
-- =============================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated before update on profiles
  for each row execute procedure public.set_updated_at();
create trigger trg_products_updated before update on products
  for each row execute procedure public.set_updated_at();
create trigger trg_carts_updated before update on carts
  for each row execute procedure public.set_updated_at();
create trigger trg_orders_updated before update on orders
  for each row execute procedure public.set_updated_at();