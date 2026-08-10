grant select (
  id,
  slug,
  name,
  manufacturer_name,
  description,
  logo_path,
  is_active,
  is_featured,
  sort_order
) on public.brands to anon, authenticated;

grant select (
  id,
  parent_id,
  slug,
  name,
  description,
  image_path,
  is_active,
  sort_order
) on public.categories to anon, authenticated;

grant select (
  id,
  slug,
  sku,
  name,
  short_name,
  brand_id,
  category_id,
  subcategory_id,
  short_description,
  description,
  retail_price,
  compare_at_price,
  currency,
  stock_status,
  shipping_class,
  weight_grams,
  length_cm,
  width_cm,
  height_cm,
  featured,
  is_new,
  is_best_seller,
  published,
  active,
  usage_notes,
  age_group,
  tags,
  seo_title,
  seo_description,
  created_at,
  updated_at
) on public.products to anon, authenticated;

grant select (
  id,
  product_id,
  sku,
  name,
  attributes,
  retail_price,
  stock_quantity,
  available,
  sort_order
) on public.product_variants to anon, authenticated;

grant select (
  id,
  product_id,
  variant_id,
  storage_path,
  alt_text,
  sort_order,
  is_primary,
  source_type,
  production_approved,
  width,
  height
) on public.product_images to anon, authenticated;

grant select (
  id,
  slug,
  name,
  short_description,
  description,
  retail_price,
  compare_at_price,
  currency,
  published,
  featured,
  active,
  image_path,
  created_at,
  updated_at
) on public.bundles to anon, authenticated;

grant select (
  id,
  bundle_id,
  product_id,
  variant_id,
  quantity
) on public.bundle_items to anon, authenticated;

create policy "Public can read active storefront brands" on public.brands
  for select to anon, authenticated
  using (is_active = true);

create policy "Public can read active storefront categories" on public.categories
  for select to anon, authenticated
  using (is_active = true);

create policy "Public can read published storefront products" on public.products
  for select to anon, authenticated
  using (
    active = true
    and published = true
    and (
      brand_id is null
      or exists (
        select 1
        from public.brands
        where brands.id = products.brand_id
          and brands.is_active = true
      )
    )
    and (
      category_id is null
      or exists (
        select 1
        from public.categories
        where categories.id = products.category_id
          and categories.is_active = true
      )
    )
  );

create policy "Public can read available storefront variants" on public.product_variants
  for select to anon, authenticated
  using (
    available = true
    and exists (
      select 1
      from public.products
      where products.id = product_variants.product_id
        and products.active = true
        and products.published = true
    )
  );

create policy "Public can read storefront product images" on public.product_images
  for select to anon, authenticated
  using (
    exists (
      select 1
      from public.products
      where products.id = product_images.product_id
        and products.active = true
        and products.published = true
    )
  );

create policy "Public can read published storefront bundles" on public.bundles
  for select to anon, authenticated
  using (active = true and published = true);

create policy "Public can read published storefront bundle items" on public.bundle_items
  for select to anon, authenticated
  using (
    exists (
      select 1
      from public.bundles
      where bundles.id = bundle_items.bundle_id
        and bundles.active = true
        and bundles.published = true
    )
    and exists (
      select 1
      from public.products
      where products.id = bundle_items.product_id
        and products.active = true
        and products.published = true
    )
  );
