create extension if not exists "pgcrypto";

create schema if not exists private;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.admin_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  role text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_login_at timestamptz,
  constraint admin_profiles_role_check check (role in ('owner', 'admin', 'operations', 'catalog', 'readonly'))
);

create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  manufacturer_name text,
  description text,
  logo_path text,
  website_url text,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.categories(id),
  slug text unique not null,
  name text not null,
  description text,
  image_path text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  sku text unique not null,
  name text not null,
  short_name text,
  brand_id uuid references public.brands(id),
  category_id uuid references public.categories(id),
  subcategory_id uuid references public.categories(id),
  short_description text,
  description text,
  retail_price numeric(12,2) not null default 0,
  compare_at_price numeric(12,2),
  cost numeric(12,2),
  currency text not null default 'MXN',
  stock_status text not null default 'in_stock',
  shipping_class text,
  weight_grams integer,
  length_cm numeric,
  width_cm numeric,
  height_cm numeric,
  featured boolean not null default false,
  is_new boolean not null default false,
  is_best_seller boolean not null default false,
  published boolean not null default false,
  active boolean not null default true,
  usage_notes text,
  age_group jsonb,
  tags jsonb,
  seo_title text,
  seo_description text,
  market_reference_price numeric(12,2),
  market_reference_source text,
  market_reference_updated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_currency_check check (currency in ('MXN')),
  constraint products_stock_status_check check (stock_status in ('in_stock', 'low_stock', 'out_of_stock', 'preorder')),
  constraint products_shipping_class_check check (shipping_class is null or shipping_class in ('small', 'standard', 'bulky', 'special'))
);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  sku text unique not null,
  name text not null,
  attributes jsonb not null default '{}'::jsonb,
  retail_price numeric(12,2),
  cost numeric(12,2),
  stock_quantity integer,
  reorder_point integer,
  available boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete set null,
  storage_path text not null,
  alt_text text,
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  source_type text,
  source_url text,
  production_approved boolean not null default false,
  width integer,
  height integer,
  created_at timestamptz not null default now()
);

create table if not exists public.bundles (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  short_description text,
  description text,
  retail_price numeric(12,2) not null default 0,
  compare_at_price numeric(12,2),
  currency text not null default 'MXN',
  published boolean not null default false,
  featured boolean not null default false,
  active boolean not null default true,
  image_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bundles_currency_check check (currency in ('MXN'))
);

create table if not exists public.bundle_items (
  id uuid primary key default gen_random_uuid(),
  bundle_id uuid not null references public.bundles(id) on delete cascade,
  product_id uuid not null references public.products(id),
  variant_id uuid references public.product_variants(id),
  quantity integer not null default 1,
  created_at timestamptz not null default now(),
  constraint bundle_items_quantity_check check (quantity > 0),
  unique (bundle_id, product_id, variant_id)
);

create table if not exists public.inventory (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete cascade,
  quantity_on_hand integer not null default 0,
  quantity_reserved integer not null default 0,
  reorder_point integer not null default 0,
  updated_at timestamptz not null default now(),
  unique (product_id, variant_id),
  constraint inventory_quantity_check check (quantity_on_hand >= 0 and quantity_reserved >= 0 and reorder_point >= 0)
);

create table if not exists public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id),
  variant_id uuid references public.product_variants(id),
  type text not null,
  quantity integer not null,
  previous_quantity integer,
  new_quantity integer,
  reason text,
  order_id uuid,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  constraint inventory_movements_type_check check (type in ('initial', 'adjustment', 'sale', 'return', 'reserve', 'release', 'correction'))
);

create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_name text,
  email text,
  phone text,
  whatsapp text,
  website text,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_suppliers (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  supplier_id uuid not null references public.suppliers(id) on delete cascade,
  supplier_sku text,
  supplier_cost numeric(12,2),
  minimum_order_quantity integer,
  lead_time_days integer,
  preferred boolean not null default false,
  last_cost_update_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, supplier_id)
);

create table if not exists public.supplier_cost_history (
  id uuid primary key default gen_random_uuid(),
  product_supplier_id uuid not null references public.product_suppliers(id) on delete cascade,
  cost numeric(12,2) not null,
  recorded_at timestamptz not null default now(),
  recorded_by uuid references auth.users(id)
);

create table if not exists public.shop_settings (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value jsonb not null,
  is_public boolean not null default false,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);

create or replace function private.is_admin_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_profiles profile
    where profile.id = (select auth.uid())
      and profile.is_active = true
  );
$$;

create or replace function private.has_admin_role(allowed_roles text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_profiles profile
    where profile.id = (select auth.uid())
      and profile.is_active = true
      and profile.role = any(allowed_roles)
  );
$$;

create or replace function public.claim_admin_profile()
returns table (
  id uuid,
  email text,
  full_name text,
  role text,
  is_active boolean,
  last_login_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := (select auth.uid());
  current_email text := lower(coalesce((select auth.jwt() ->> 'email'), ''));
  current_name text := nullif((select auth.jwt() ->> 'name'), '');
  assigned_role text;
begin
  if current_user_id is null or current_email = '' then
    return;
  end if;

  assigned_role := case current_email
    when 'trinopc1@gmail.com' then 'owner'
    when 'melissa.ig.mo@gmail.com' then 'admin'
    when 'karina.iglesiaz@gmail.com' then 'admin'
    else null
  end;

  if assigned_role is null then
    return;
  end if;

  insert into public.admin_profiles (id, email, full_name, role, is_active, last_login_at)
  values (current_user_id, current_email, current_name, assigned_role, true, now())
  on conflict (email) do update
  set
    id = excluded.id,
    full_name = coalesce(public.admin_profiles.full_name, excluded.full_name),
    role = public.admin_profiles.role,
    is_active = public.admin_profiles.is_active,
    last_login_at = case when public.admin_profiles.is_active then now() else public.admin_profiles.last_login_at end,
    updated_at = now()
  where public.admin_profiles.email = excluded.email;

  return query
  select profile.id, profile.email, profile.full_name, profile.role, profile.is_active, profile.last_login_at
  from public.admin_profiles profile
  where profile.email = current_email
    and profile.id = current_user_id;
end;
$$;

revoke all on function private.is_admin_user() from public;
revoke all on function private.has_admin_role(text[]) from public;
revoke all on function public.claim_admin_profile() from public;
grant usage on schema private to authenticated;
grant execute on function private.is_admin_user() to authenticated;
grant execute on function private.has_admin_role(text[]) to authenticated;
grant execute on function public.claim_admin_profile() to authenticated;

create trigger set_admin_profiles_updated_at before update on public.admin_profiles for each row execute function public.set_updated_at();
create trigger set_brands_updated_at before update on public.brands for each row execute function public.set_updated_at();
create trigger set_categories_updated_at before update on public.categories for each row execute function public.set_updated_at();
create trigger set_products_updated_at before update on public.products for each row execute function public.set_updated_at();
create trigger set_product_variants_updated_at before update on public.product_variants for each row execute function public.set_updated_at();
create trigger set_bundles_updated_at before update on public.bundles for each row execute function public.set_updated_at();
create trigger set_suppliers_updated_at before update on public.suppliers for each row execute function public.set_updated_at();
create trigger set_product_suppliers_updated_at before update on public.product_suppliers for each row execute function public.set_updated_at();

create index if not exists products_slug_idx on public.products(slug);
create index if not exists products_sku_idx on public.products(sku);
create index if not exists products_brand_id_idx on public.products(brand_id);
create index if not exists products_category_id_idx on public.products(category_id);
create index if not exists products_published_idx on public.products(published);
create index if not exists product_variants_product_id_idx on public.product_variants(product_id);
create index if not exists product_variants_sku_idx on public.product_variants(sku);
create index if not exists product_images_product_id_idx on public.product_images(product_id);
create unique index if not exists product_images_product_storage_path_uidx on public.product_images(product_id, storage_path);
create index if not exists inventory_product_id_idx on public.inventory(product_id);
create index if not exists inventory_variant_id_idx on public.inventory(variant_id);
create index if not exists brands_slug_idx on public.brands(slug);
create index if not exists categories_slug_idx on public.categories(slug);
create index if not exists bundles_slug_idx on public.bundles(slug);
create unique index if not exists bundle_items_bundle_product_variant_uidx on public.bundle_items(bundle_id, product_id, variant_id) nulls not distinct;
create index if not exists product_suppliers_product_id_idx on public.product_suppliers(product_id);
create index if not exists product_suppliers_supplier_id_idx on public.product_suppliers(supplier_id);

alter table public.admin_profiles enable row level security;
alter table public.brands enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;
alter table public.bundles enable row level security;
alter table public.bundle_items enable row level security;
alter table public.inventory enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.suppliers enable row level security;
alter table public.product_suppliers enable row level security;
alter table public.supplier_cost_history enable row level security;
alter table public.shop_settings enable row level security;
alter table public.admin_audit_log enable row level security;

revoke all on table
  public.admin_profiles,
  public.brands,
  public.categories,
  public.products,
  public.product_variants,
  public.product_images,
  public.bundles,
  public.bundle_items,
  public.inventory,
  public.inventory_movements,
  public.suppliers,
  public.product_suppliers,
  public.supplier_cost_history,
  public.shop_settings,
  public.admin_audit_log
from anon, authenticated;

grant select, insert, update, delete on table
  public.admin_profiles,
  public.brands,
  public.categories,
  public.products,
  public.product_variants,
  public.product_images,
  public.bundles,
  public.bundle_items,
  public.inventory,
  public.inventory_movements,
  public.suppliers,
  public.product_suppliers,
  public.supplier_cost_history,
  public.shop_settings,
  public.admin_audit_log
to authenticated;

create policy "Admins can read admin profiles" on public.admin_profiles
  for select to authenticated
  using ((select private.is_admin_user()));

create policy "Owners and admins manage admin profiles" on public.admin_profiles
  for all to authenticated
  using ((select private.has_admin_role(array['owner', 'admin'])))
  with check ((select private.has_admin_role(array['owner', 'admin'])));

create policy "Admins can read brands" on public.brands
  for select to authenticated
  using ((select private.is_admin_user()));

create policy "Catalog admins manage brands" on public.brands
  for all to authenticated
  using ((select private.has_admin_role(array['owner', 'admin', 'catalog'])))
  with check ((select private.has_admin_role(array['owner', 'admin', 'catalog'])));

create policy "Admins can read categories" on public.categories
  for select to authenticated
  using ((select private.is_admin_user()));

create policy "Catalog admins manage categories" on public.categories
  for all to authenticated
  using ((select private.has_admin_role(array['owner', 'admin', 'catalog'])))
  with check ((select private.has_admin_role(array['owner', 'admin', 'catalog'])));

create policy "Admins can read products" on public.products
  for select to authenticated
  using ((select private.is_admin_user()));

create policy "Catalog admins manage products" on public.products
  for all to authenticated
  using ((select private.has_admin_role(array['owner', 'admin', 'catalog'])))
  with check ((select private.has_admin_role(array['owner', 'admin', 'catalog'])));

create policy "Admins can read variants" on public.product_variants
  for select to authenticated
  using ((select private.is_admin_user()));

create policy "Catalog admins manage variants" on public.product_variants
  for all to authenticated
  using ((select private.has_admin_role(array['owner', 'admin', 'catalog'])))
  with check ((select private.has_admin_role(array['owner', 'admin', 'catalog'])));

create policy "Admins can read images" on public.product_images
  for select to authenticated
  using ((select private.is_admin_user()));

create policy "Catalog admins manage images" on public.product_images
  for all to authenticated
  using ((select private.has_admin_role(array['owner', 'admin', 'catalog'])))
  with check ((select private.has_admin_role(array['owner', 'admin', 'catalog'])));

create policy "Admins can read bundles" on public.bundles
  for select to authenticated
  using ((select private.is_admin_user()));

create policy "Catalog admins manage bundles" on public.bundles
  for all to authenticated
  using ((select private.has_admin_role(array['owner', 'admin', 'catalog'])))
  with check ((select private.has_admin_role(array['owner', 'admin', 'catalog'])));

create policy "Admins can read bundle items" on public.bundle_items
  for select to authenticated
  using ((select private.is_admin_user()));

create policy "Catalog admins manage bundle items" on public.bundle_items
  for all to authenticated
  using ((select private.has_admin_role(array['owner', 'admin', 'catalog'])))
  with check ((select private.has_admin_role(array['owner', 'admin', 'catalog'])));

create policy "Admins can read inventory" on public.inventory
  for select to authenticated
  using ((select private.is_admin_user()));

create policy "Inventory operators manage inventory" on public.inventory
  for all to authenticated
  using ((select private.has_admin_role(array['owner', 'admin', 'catalog', 'operations'])))
  with check ((select private.has_admin_role(array['owner', 'admin', 'catalog', 'operations'])));

create policy "Admins can read inventory movements" on public.inventory_movements
  for select to authenticated
  using ((select private.is_admin_user()));

create policy "Inventory operators add movements" on public.inventory_movements
  for insert to authenticated
  with check ((select private.has_admin_role(array['owner', 'admin', 'catalog', 'operations'])));

create policy "Admins can read suppliers" on public.suppliers
  for select to authenticated
  using ((select private.is_admin_user()));

create policy "Catalog admins manage suppliers" on public.suppliers
  for all to authenticated
  using ((select private.has_admin_role(array['owner', 'admin', 'catalog'])))
  with check ((select private.has_admin_role(array['owner', 'admin', 'catalog'])));

create policy "Admins can read product suppliers" on public.product_suppliers
  for select to authenticated
  using ((select private.has_admin_role(array['owner', 'admin', 'catalog', 'readonly'])));

create policy "Catalog admins manage product suppliers" on public.product_suppliers
  for all to authenticated
  using ((select private.has_admin_role(array['owner', 'admin', 'catalog'])))
  with check ((select private.has_admin_role(array['owner', 'admin', 'catalog'])));

create policy "Admins can read supplier cost history" on public.supplier_cost_history
  for select to authenticated
  using ((select private.has_admin_role(array['owner', 'admin', 'catalog', 'readonly'])));

create policy "Catalog admins manage supplier cost history" on public.supplier_cost_history
  for insert to authenticated
  with check ((select private.has_admin_role(array['owner', 'admin', 'catalog'])));

create policy "Admins can read settings" on public.shop_settings
  for select to authenticated
  using ((select private.is_admin_user()) or is_public = true);

create policy "Owners and admins manage settings" on public.shop_settings
  for all to authenticated
  using ((select private.has_admin_role(array['owner', 'admin'])))
  with check ((select private.has_admin_role(array['owner', 'admin'])));

create policy "Admins can read audit log" on public.admin_audit_log
  for select to authenticated
  using ((select private.has_admin_role(array['owner', 'admin', 'readonly'])));

create policy "Admins can insert audit log" on public.admin_audit_log
  for insert to authenticated
  with check ((select private.is_admin_user()));

create or replace view public.storefront_brands as
select
  id,
  slug,
  name,
  manufacturer_name,
  description,
  logo_path,
  is_active,
  is_featured,
  sort_order
from public.brands
where is_active = true;

create or replace view public.storefront_categories as
select
  id,
  parent_id,
  slug,
  name,
  description,
  image_path,
  is_active,
  sort_order
from public.categories
where is_active = true;

create or replace view public.storefront_products as
select
  products.id,
  products.slug,
  products.sku,
  products.name,
  products.short_name,
  brands.slug as brand_slug,
  brands.name as brand_name,
  categories.slug as category_slug,
  categories.name as category_name,
  subcategories.slug as subcategory_slug,
  subcategories.name as subcategory_name,
  products.short_description,
  products.description,
  products.retail_price,
  products.compare_at_price,
  products.currency,
  products.stock_status,
  products.shipping_class,
  products.weight_grams,
  products.length_cm,
  products.width_cm,
  products.height_cm,
  products.featured,
  products.is_new,
  products.is_best_seller,
  products.usage_notes,
  products.age_group,
  products.tags,
  products.seo_title,
  products.seo_description,
  products.created_at,
  products.updated_at
from public.products
left join public.brands on brands.id = products.brand_id
left join public.categories on categories.id = products.category_id
left join public.categories subcategories on subcategories.id = products.subcategory_id
where products.active = true
  and products.published = true
  and coalesce(brands.is_active, true) = true
  and coalesce(categories.is_active, true) = true;

create or replace view public.storefront_product_variants as
select
  product_variants.id,
  product_variants.product_id,
  product_variants.sku,
  product_variants.name,
  product_variants.attributes,
  product_variants.retail_price,
  product_variants.stock_quantity,
  product_variants.available,
  product_variants.sort_order
from public.product_variants
join public.products on products.id = product_variants.product_id
where product_variants.available = true
  and products.active = true
  and products.published = true;

create or replace view public.storefront_product_images as
select
  product_images.id,
  product_images.product_id,
  product_images.variant_id,
  product_images.storage_path,
  product_images.alt_text,
  product_images.sort_order,
  product_images.is_primary,
  product_images.source_type,
  product_images.production_approved,
  product_images.width,
  product_images.height
from public.product_images
join public.products on products.id = product_images.product_id
where products.active = true
  and products.published = true;

create or replace view public.storefront_bundles as
select
  id,
  slug,
  name,
  short_description,
  description,
  retail_price,
  compare_at_price,
  currency,
  featured,
  image_path,
  created_at,
  updated_at
from public.bundles
where active = true
  and published = true;

create or replace view public.storefront_bundle_items as
select
  bundle_items.id,
  bundle_items.bundle_id,
  bundle_items.product_id,
  bundle_items.variant_id,
  bundle_items.quantity
from public.bundle_items
join public.bundles on bundles.id = bundle_items.bundle_id
join public.products on products.id = bundle_items.product_id
where bundles.active = true
  and bundles.published = true
  and products.active = true
  and products.published = true;

revoke all on table
  public.storefront_brands,
  public.storefront_categories,
  public.storefront_products,
  public.storefront_product_variants,
  public.storefront_product_images,
  public.storefront_bundles,
  public.storefront_bundle_items
from public;

grant select on table
  public.storefront_brands,
  public.storefront_categories,
  public.storefront_products,
  public.storefront_product_variants,
  public.storefront_product_images,
  public.storefront_bundles,
  public.storefront_bundle_items
to anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  10485760,
  array['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Admins upload product images" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = 'products'
    and (select private.has_admin_role(array['owner', 'admin', 'catalog']))
  );

create policy "Admins update product images" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'product-images'
    and (select private.has_admin_role(array['owner', 'admin', 'catalog']))
  )
  with check (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = 'products'
    and (select private.has_admin_role(array['owner', 'admin', 'catalog']))
  );

create policy "Admins delete product images" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'product-images'
    and (select private.has_admin_role(array['owner', 'admin', 'catalog']))
  );

comment on view public.storefront_products is 'Public storefront-safe product projection. Internal cost, supplier, and market reference fields are intentionally omitted.';
comment on table public.admin_profiles is 'Back Office allowlist and role table. Google OAuth does not grant access unless a matching active row exists.';
