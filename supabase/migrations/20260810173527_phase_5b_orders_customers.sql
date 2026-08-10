create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  first_name text not null default '',
  last_name text not null default '',
  email text,
  phone text,
  whatsapp text,
  status text not null default 'active',
  tags jsonb not null default '[]'::jsonb,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_order_at timestamptz,
  constraint customers_status_check check (status in ('active', 'inactive', 'blocked'))
);

create unique index if not exists customers_email_uidx on public.customers(lower(email)) where email is not null;
create index if not exists customers_phone_idx on public.customers(phone);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_id uuid references public.customers(id),
  status text not null default 'new',
  payment_status text not null default 'pending',
  shipping_status text not null default 'pending',
  subtotal numeric(12,2) not null default 0,
  shipping numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  currency text not null default 'MXN',
  shipping_method text,
  carrier text,
  tracking_number text,
  tracking_url text,
  customer_notes text,
  internal_notes text,
  whatsapp_opt_in boolean not null default false,
  requires_invoice boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  confirmed_at timestamptz,
  shipped_at timestamptz,
  delivered_at timestamptz,
  cancelled_at timestamptz,
  constraint orders_status_check check (status in ('new', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled')),
  constraint orders_payment_status_check check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  constraint orders_shipping_status_check check (shipping_status in ('pending', 'preparing', 'shipped', 'delivered', 'cancelled'))
);

create index if not exists orders_customer_id_idx on public.orders(customer_id);
create index if not exists orders_status_idx on public.orders(status);
create index if not exists orders_created_at_idx on public.orders(created_at desc);

create table if not exists public.order_addresses (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  type text not null default 'shipping',
  first_name text,
  last_name text,
  phone text,
  street text,
  exterior_number text,
  interior_number text,
  neighborhood text,
  postal_code text,
  city text,
  state text,
  delivery_references text,
  created_at timestamptz not null default now(),
  constraint order_addresses_type_check check (type in ('shipping', 'billing'))
);

create index if not exists order_addresses_order_id_idx on public.order_addresses(order_id);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id),
  variant_id uuid references public.product_variants(id),
  bundle_id uuid references public.bundles(id),
  sku text not null,
  name text not null,
  variant_name text,
  image_path text,
  quantity int not null default 1,
  unit_price numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists order_items_order_id_idx on public.order_items(order_id);
create index if not exists order_items_product_id_idx on public.order_items(product_id);

create table if not exists public.order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  actor_id uuid references auth.users(id),
  event_type text not null,
  from_status text,
  to_status text,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists order_events_order_id_idx on public.order_events(order_id);
create index if not exists order_events_created_at_idx on public.order_events(created_at desc);

create trigger set_customers_updated_at before update on public.customers for each row execute function public.set_updated_at();
create trigger set_orders_updated_at before update on public.orders for each row execute function public.set_updated_at();

alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_addresses enable row level security;
alter table public.order_items enable row level security;
alter table public.order_events enable row level security;

revoke all on table
  public.customers,
  public.orders,
  public.order_addresses,
  public.order_items,
  public.order_events
from anon, authenticated;

grant select, insert, update, delete on table
  public.customers,
  public.orders,
  public.order_addresses,
  public.order_items,
  public.order_events
to authenticated;

create policy "Admins can read customers" on public.customers
  for select to authenticated
  using ((select private.has_admin_role(array['owner', 'admin', 'operations', 'readonly'])));

create policy "Operations manage customers" on public.customers
  for all to authenticated
  using ((select private.has_admin_role(array['owner', 'admin', 'operations'])))
  with check ((select private.has_admin_role(array['owner', 'admin', 'operations'])));

create policy "Admins can read orders" on public.orders
  for select to authenticated
  using ((select private.has_admin_role(array['owner', 'admin', 'operations', 'readonly'])));

create policy "Operations manage orders" on public.orders
  for all to authenticated
  using ((select private.has_admin_role(array['owner', 'admin', 'operations'])))
  with check ((select private.has_admin_role(array['owner', 'admin', 'operations'])));

create policy "Admins can read order addresses" on public.order_addresses
  for select to authenticated
  using ((select private.has_admin_role(array['owner', 'admin', 'operations', 'readonly'])));

create policy "Operations manage order addresses" on public.order_addresses
  for all to authenticated
  using ((select private.has_admin_role(array['owner', 'admin', 'operations'])))
  with check ((select private.has_admin_role(array['owner', 'admin', 'operations'])));

create policy "Admins can read order items" on public.order_items
  for select to authenticated
  using ((select private.has_admin_role(array['owner', 'admin', 'operations', 'readonly'])));

create policy "Operations manage order items" on public.order_items
  for all to authenticated
  using ((select private.has_admin_role(array['owner', 'admin', 'operations'])))
  with check ((select private.has_admin_role(array['owner', 'admin', 'operations'])));

create policy "Admins can read order events" on public.order_events
  for select to authenticated
  using ((select private.has_admin_role(array['owner', 'admin', 'operations', 'readonly'])));

create policy "Operations add order events" on public.order_events
  for insert to authenticated
  with check ((select private.has_admin_role(array['owner', 'admin', 'operations'])));
