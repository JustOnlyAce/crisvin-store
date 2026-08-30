-- Crisvin Store database schema
-- Each feature lives in its own table on purpose: adding a new feature later
-- means adding a new table, not editing these. Run this once in Supabase's
-- SQL Editor (Project > SQL Editor > New query > paste > Run).

-- ---------- Products ----------
create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  price numeric(10,2) not null,
  stock integer not null default 0,
  barcode text unique,           -- for the scanner gun: scan fills this field
  image_url text,                -- product photo, auto-filled from barcode lookup or added manually
  is_active boolean not null default true, -- soft-delete: false = hidden from customers but order history stays intact
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------- Customers ----------
-- Kept separate from orders so a customer's history/name only needs updating once.
create table customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null unique,
  created_at timestamptz default now()
);

-- ---------- Orders ----------
create table orders (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,             -- short human-friendly code e.g. CS-4821
  customer_id uuid references customers(id),
  status text not null default 'Pending', -- Pending | Ready for Pickup | Completed
  payment_method text not null,           -- cash | gcash
  total numeric(10,2) not null,
  placed_at timestamptz default now()
);

-- Line items per order, so an order can hold any number of products.
create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id),
  product_name text not null,   -- snapshot of name/price at order time,
  unit_price numeric(10,2) not null,  -- so later price edits don't rewrite history
  quantity integer not null
);

-- ---------- Utang Book (credit / loans) ----------
create table debts (
  id uuid primary key default gen_random_uuid(),
  kind text not null,                     -- 'customer' (owes store) | 'loan' (store owes them)
  name text not null,
  principal numeric(10,2) not null,
  interest_type text not null default 'none',  -- none | flat | percent-once | percent-monthly
  interest_value numeric(10,2) not null default 0,
  date_borrowed date not null default current_date,
  notes text,
  created_at timestamptz default now()
);

create table debt_payments (
  id uuid primary key default gen_random_uuid(),
  debt_id uuid references debts(id) on delete cascade,
  amount numeric(10,2) not null,
  paid_at date not null default current_date
);

-- ---------- Row Level Security ----------
-- Off by default in new Supabase projects' public schema access via anon key,
-- but we enable it here and add simple open policies so the app works.
-- When you're ready to lock down who can edit what (e.g. only your mother's
-- device can mark orders complete), tighten these policies without touching
-- the tables themselves.
alter table products enable row level security;
alter table customers enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table debts enable row level security;
alter table debt_payments enable row level security;

-- ---------- Grants ----------
-- Needed because "Automatically expose new tables" is off in this project
-- (a safer default). Without this, PostgREST returns 401 even though RLS
-- policies below would otherwise allow access.
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to anon, authenticated;
grant all on all sequences in schema public to anon, authenticated;
alter default privileges in schema public grant select, insert, update, delete on tables to anon, authenticated;

create policy "public read products" on products for select using (true);
create policy "public write products" on products for all using (true) with check (true);
create policy "public read customers" on customers for select using (true);
create policy "public write customers" on customers for all using (true) with check (true);
create policy "public read orders" on orders for select using (true);
create policy "public write orders" on orders for all using (true) with check (true);
create policy "public read order_items" on order_items for select using (true);
create policy "public write order_items" on order_items for all using (true) with check (true);
create policy "public read debts" on debts for select using (true);
create policy "public write debts" on debts for all using (true) with check (true);
create policy "public read debt_payments" on debt_payments for select using (true);
create policy "public write debt_payments" on debt_payments for all using (true) with check (true);

-- Seed a few starter products so the app isn't empty on first load.
insert into products (name, category, price, stock) values
  ('Century Tuna Flakes 155g', 'Canned Goods', 38, 42),
  ('Argentina Corned Beef 150g', 'Canned Goods', 45, 6),
  ('Well-Milled Rice (1kg)', 'Rice & Grains', 58, 80),
  ('Coca-Cola 1.5L', 'Beverages', 72, 24),
  ('Piattos Cheese 85g', 'Snacks', 39, 30),
  ('Surf Powder Detergent 1kg', 'Household', 79, 11);
