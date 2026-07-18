-- =============================================
-- MyShop E-commerce - Add Addresses Table
-- =============================================

create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  label text not null default 'บ้าน',
  first_name text not null,
  last_name text not null,
  phone text not null,
  address_line1 text not null,
  address_line2 text,
  city text not null,
  state text not null,
  postal_code text not null,
  country text not null default 'Thailand',
  is_default boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indices
create index if not exists idx_addresses_user on public.addresses(user_id);
create index if not exists idx_addresses_default on public.addresses(is_default);

-- Enable RLS
alter table public.addresses enable row level security;

-- Policies
create policy "Users can manage own addresses" on public.addresses
  for all using (auth.uid() = user_id);

-- Trigger for updating updated_at
create trigger trg_addresses_updated before update on public.addresses
  for each row execute procedure public.set_updated_at();
