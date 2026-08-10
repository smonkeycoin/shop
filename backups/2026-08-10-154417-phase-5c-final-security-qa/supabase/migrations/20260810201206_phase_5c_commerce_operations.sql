alter table public.orders
  add column if not exists is_test boolean not null default true,
  add column if not exists checkout_mode text not null default 'demo',
  add column if not exists inventory_sale_applied_at timestamptz,
  add column if not exists inventory_release_applied_at timestamptz;

alter table public.order_items
  add column if not exists cost_snapshot numeric(12,2);

create sequence if not exists public.order_number_seq start with 100001 increment by 1;

create table if not exists public.order_inventory_allocations (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  order_item_id uuid not null references public.order_items(id) on delete cascade,
  product_id uuid not null references public.products(id),
  variant_id uuid references public.product_variants(id),
  inventory_id uuid not null references public.inventory(id),
  quantity_reserved int not null,
  sale_applied_at timestamptz,
  release_applied_at timestamptz,
  created_at timestamptz not null default now(),
  constraint order_inventory_allocations_quantity_check check (quantity_reserved > 0)
);

create index if not exists order_inventory_allocations_order_id_idx on public.order_inventory_allocations(order_id);
create index if not exists order_inventory_allocations_order_item_id_idx on public.order_inventory_allocations(order_item_id);
create index if not exists order_inventory_allocations_inventory_id_idx on public.order_inventory_allocations(inventory_id);

create table if not exists public.customer_notes (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  author_id uuid references auth.users(id),
  note text not null,
  tags jsonb not null default '[]'::jsonb,
  activity_type text not null default 'note',
  created_at timestamptz not null default now(),
  constraint customer_notes_activity_type_check check (activity_type in ('note', 'whatsapp_opened', 'order', 'status_change', 'refund_placeholder'))
);

create index if not exists customer_notes_customer_id_idx on public.customer_notes(customer_id);
create index if not exists customer_notes_created_at_idx on public.customer_notes(created_at desc);

alter table public.order_inventory_allocations enable row level security;
alter table public.customer_notes enable row level security;

revoke all on table public.order_inventory_allocations, public.customer_notes from anon, authenticated;
grant select, insert, update, delete on table public.order_inventory_allocations, public.customer_notes to authenticated;

create policy "Admins can read order inventory allocations" on public.order_inventory_allocations
  for select to authenticated
  using ((select private.has_admin_role(array['owner', 'admin', 'operations', 'readonly'])));

create policy "Operations manage order inventory allocations" on public.order_inventory_allocations
  for all to authenticated
  using ((select private.has_admin_role(array['owner', 'admin', 'operations'])))
  with check ((select private.has_admin_role(array['owner', 'admin', 'operations'])));

create policy "Admins can read customer notes" on public.customer_notes
  for select to authenticated
  using ((select private.has_admin_role(array['owner', 'admin', 'operations', 'readonly'])));

create policy "Operations manage customer notes" on public.customer_notes
  for all to authenticated
  using ((select private.has_admin_role(array['owner', 'admin', 'operations'])))
  with check ((select private.has_admin_role(array['owner', 'admin', 'operations'])));

insert into public.shop_settings (key, value, is_public)
values
  ('checkout_enabled', 'true'::jsonb, true),
  ('checkout_mode', '"demo"'::jsonb, true),
  ('orders_enabled', 'true'::jsonb, true),
  ('free_shipping_threshold', '1500'::jsonb, true),
  ('default_shipping_cost', '150'::jsonb, true),
  ('support_whatsapp', '""'::jsonb, true),
  ('support_email', '"ventas@neumopractice.com"'::jsonb, false)
on conflict (key) do nothing;

create or replace function public.create_order_transaction(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  checkout_enabled boolean := coalesce((select (value #>> '{}')::boolean from public.shop_settings where key = 'checkout_enabled'), true);
  orders_enabled boolean := coalesce((select (value #>> '{}')::boolean from public.shop_settings where key = 'orders_enabled'), true);
  checkout_mode text := coalesce(nullif(payload ->> 'checkoutMode', ''), coalesce((select value #>> '{}' from public.shop_settings where key = 'checkout_mode'), 'demo'));
  default_shipping numeric := coalesce((select (value #>> '{}')::numeric from public.shop_settings where key = 'default_shipping_cost'), 150);
  free_threshold numeric := coalesce((select (value #>> '{}')::numeric from public.shop_settings where key = 'free_shipping_threshold'), 1500);
  customer_payload jsonb := payload -> 'customer';
  address_payload jsonb := payload -> 'shippingAddress';
  items_payload jsonb := coalesce(payload -> 'items', '[]'::jsonb);
  customer_email text := lower(trim(coalesce(customer_payload ->> 'email', '')));
  customer_phone text := trim(coalesce(customer_payload ->> 'phone', ''));
  order_customer_id uuid;
  order_id uuid;
  order_number text;
  subtotal numeric := 0;
  shipping numeric := 0;
  total numeric := 0;
  created_order_item_id uuid;
  item jsonb;
  item_type text;
  item_quantity int;
  product_uuid uuid;
  variant_uuid uuid;
  bundle_uuid uuid;
  product_row public.products%rowtype;
  variant_row public.product_variants%rowtype;
  bundle_row public.bundles%rowtype;
  bundle_component public.bundle_items%rowtype;
  inventory_row public.inventory%rowtype;
  unit_price numeric;
  unit_cost numeric;
  line_total numeric;
  cost_snapshot numeric;
  allocation_quantity int;
  sku_snapshot text;
  name_snapshot text;
  variant_snapshot text;
  is_test_order boolean := coalesce((payload ->> 'isTest')::boolean, true);
  uuid_pattern text := '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
begin
  if not checkout_enabled or not orders_enabled then
    raise exception 'checkout_disabled' using errcode = 'P0001';
  end if;

  if customer_email = '' then
    raise exception 'customer_email_required' using errcode = 'P0001';
  end if;

  if jsonb_array_length(items_payload) = 0 then
    raise exception 'cart_empty' using errcode = 'P0001';
  end if;

  select id into order_customer_id
  from public.customers
  where lower(email) = customer_email
  limit 1;

  if order_customer_id is null then
    insert into public.customers (first_name, last_name, email, phone, whatsapp, status, last_order_at)
    values (
      trim(coalesce(customer_payload ->> 'firstName', '')),
      trim(coalesce(customer_payload ->> 'lastName', '')),
      customer_email,
      customer_phone,
      case when coalesce((payload ->> 'whatsappOptIn')::boolean, true) then customer_phone else null end,
      'active',
      now()
    )
    returning id into order_customer_id;
  else
    update public.customers
    set
      first_name = coalesce(nullif(trim(coalesce(customer_payload ->> 'firstName', '')), ''), first_name),
      last_name = coalesce(nullif(trim(coalesce(customer_payload ->> 'lastName', '')), ''), last_name),
      phone = coalesce(nullif(customer_phone, ''), phone),
      whatsapp = case when coalesce((payload ->> 'whatsappOptIn')::boolean, true) then coalesce(nullif(customer_phone, ''), whatsapp) else whatsapp end,
      last_order_at = now()
    where id = order_customer_id;
  end if;

  order_number := 'NP-' || nextval('public.order_number_seq')::text;

  insert into public.orders (
    order_number,
    customer_id,
    status,
    payment_status,
    shipping_status,
    subtotal,
    shipping,
    total,
    currency,
    shipping_method,
    checkout_mode,
    is_test,
    whatsapp_opt_in,
    customer_notes,
    requires_invoice
  )
  values (
    order_number,
    order_customer_id,
    'new',
    'pending',
    'pending',
    0,
    0,
    0,
    'MXN',
    'Envio estandar',
    checkout_mode,
    is_test_order,
    coalesce((payload ->> 'whatsappOptIn')::boolean, true),
    nullif(trim(coalesce(payload ->> 'customerNotes', '')), ''),
    coalesce((payload ->> 'requiresInvoice')::boolean, false)
  )
  returning id into order_id;

  insert into public.order_addresses (
    order_id,
    type,
    first_name,
    last_name,
    phone,
    street,
    exterior_number,
    interior_number,
    neighborhood,
    postal_code,
    city,
    state,
    delivery_references
  )
  values (
    order_id,
    'shipping',
    trim(coalesce(customer_payload ->> 'firstName', '')),
    trim(coalesce(customer_payload ->> 'lastName', '')),
    customer_phone,
    trim(coalesce(address_payload ->> 'street', '')),
    trim(coalesce(address_payload ->> 'exteriorNumber', '')),
    nullif(trim(coalesce(address_payload ->> 'interiorNumber', '')), ''),
    trim(coalesce(address_payload ->> 'neighborhood', '')),
    trim(coalesce(address_payload ->> 'postalCode', '')),
    trim(coalesce(address_payload ->> 'city', '')),
    trim(coalesce(address_payload ->> 'state', '')),
    nullif(trim(coalesce(address_payload ->> 'references', '')), '')
  );

  for item in select * from jsonb_array_elements(items_payload)
  loop
    item_type := coalesce(item ->> 'type', 'product');
    item_quantity := greatest(1, coalesce((item ->> 'quantity')::int, 1));
    variant_uuid := null;

    if item_type = 'bundle' then
      if coalesce(item ->> 'bundleId', item ->> 'productId') !~* uuid_pattern then
        raise exception 'invalid_bundle_id' using errcode = 'P0001';
      end if;

      bundle_uuid := coalesce(item ->> 'bundleId', item ->> 'productId')::uuid;

      select * into bundle_row
      from public.bundles
      where id = bundle_uuid and published = true and active = true;

      if not found then
        raise exception 'bundle_unavailable' using errcode = 'P0001';
      end if;

      unit_price := bundle_row.retail_price;
      unit_cost := 0;
      line_total := unit_price * item_quantity;
      subtotal := subtotal + line_total;
      sku_snapshot := 'BUNDLE-' || bundle_row.id::text;
      name_snapshot := bundle_row.name;
      variant_snapshot := 'Kit';

      insert into public.order_items (order_id, bundle_id, sku, name, variant_name, image_path, quantity, unit_price, total, cost_snapshot)
      values (order_id, bundle_uuid, sku_snapshot, name_snapshot, variant_snapshot, bundle_row.image_path, item_quantity, unit_price, line_total, 0)
      returning id into created_order_item_id;

      for bundle_component in
        select * from public.bundle_items where bundle_id = bundle_uuid
      loop
        allocation_quantity := bundle_component.quantity * item_quantity;

        select * into product_row
        from public.products
        where id = bundle_component.product_id and active = true and published = true;

        if not found then
          raise exception 'bundle_component_unavailable' using errcode = 'P0001';
        end if;

        select * into inventory_row
        from public.inventory
        where product_id = bundle_component.product_id
          and (
            (bundle_component.variant_id is null and variant_id is null)
            or variant_id = bundle_component.variant_id
          )
        order by variant_id nulls last
        limit 1
        for update;

        if not found or (inventory_row.quantity_on_hand - inventory_row.quantity_reserved) < allocation_quantity then
          raise exception 'insufficient_stock' using errcode = 'P0001';
        end if;

        update public.inventory
        set quantity_reserved = quantity_reserved + allocation_quantity
        where id = inventory_row.id;

        insert into public.order_inventory_allocations (order_id, order_item_id, product_id, variant_id, inventory_id, quantity_reserved)
        values (order_id, created_order_item_id, bundle_component.product_id, bundle_component.variant_id, inventory_row.id, allocation_quantity);

        insert into public.inventory_movements (product_id, variant_id, order_id, quantity, previous_quantity, new_quantity, type, reason)
        values (bundle_component.product_id, bundle_component.variant_id, order_id, allocation_quantity, inventory_row.quantity_reserved, inventory_row.quantity_reserved + allocation_quantity, 'reserve', 'checkout reserve');

        unit_cost := unit_cost + (coalesce(product_row.cost, 0) * bundle_component.quantity);
      end loop;

      update public.order_items
      set cost_snapshot = unit_cost
      where id = created_order_item_id;
    else
      if coalesce(item ->> 'productId', '') !~* uuid_pattern then
        raise exception 'invalid_product_id' using errcode = 'P0001';
      end if;

      product_uuid := (item ->> 'productId')::uuid;

      if coalesce(item ->> 'variantId', '') ~* uuid_pattern then
        variant_uuid := (item ->> 'variantId')::uuid;
      end if;

      select * into product_row
      from public.products
      where id = product_uuid and published = true and active = true;

      if not found then
        raise exception 'product_unavailable' using errcode = 'P0001';
      end if;

      if variant_uuid is not null then
        select * into variant_row
        from public.product_variants
        where id = variant_uuid and product_id = product_uuid and available = true;
      end if;

      unit_price := coalesce(variant_row.retail_price, product_row.retail_price);
      cost_snapshot := coalesce(variant_row.cost, product_row.cost, 0);
      line_total := unit_price * item_quantity;
      subtotal := subtotal + line_total;
      sku_snapshot := coalesce(variant_row.sku, product_row.sku);
      name_snapshot := product_row.name;
      variant_snapshot := coalesce(variant_row.name, item ->> 'variantName', 'Opcion unica');

      select * into inventory_row
      from public.inventory
      where product_id = product_uuid
        and (
          (variant_uuid is null and variant_id is null)
          or variant_id = variant_uuid
        )
      order by variant_id nulls last
      limit 1
      for update;

      if not found or (inventory_row.quantity_on_hand - inventory_row.quantity_reserved) < item_quantity then
        raise exception 'insufficient_stock' using errcode = 'P0001';
      end if;

      insert into public.order_items (order_id, product_id, variant_id, sku, name, variant_name, quantity, unit_price, total, cost_snapshot)
      values (order_id, product_uuid, variant_uuid, sku_snapshot, name_snapshot, variant_snapshot, item_quantity, unit_price, line_total, cost_snapshot)
      returning id into created_order_item_id;

      update public.inventory
      set quantity_reserved = quantity_reserved + item_quantity
      where id = inventory_row.id;

      insert into public.order_inventory_allocations (order_id, order_item_id, product_id, variant_id, inventory_id, quantity_reserved)
      values (order_id, created_order_item_id, product_uuid, variant_uuid, inventory_row.id, item_quantity);

      insert into public.inventory_movements (product_id, variant_id, order_id, quantity, previous_quantity, new_quantity, type, reason)
      values (product_uuid, variant_uuid, order_id, item_quantity, inventory_row.quantity_reserved, inventory_row.quantity_reserved + item_quantity, 'reserve', 'checkout reserve');
    end if;
  end loop;

  shipping := case when subtotal >= free_threshold then 0 else default_shipping end;
  total := subtotal + shipping;

  update public.orders
  set subtotal = create_order_transaction.subtotal,
      shipping = create_order_transaction.shipping,
      total = create_order_transaction.total
  where id = order_id;

  insert into public.order_events (order_id, event_type, to_status, notes, metadata)
  values (order_id, 'checkout.order_created', 'new', 'Pedido creado en checkout demo', jsonb_build_object('is_test', is_test_order, 'checkout_mode', checkout_mode));

  insert into public.admin_audit_log (action, entity_type, entity_id, after_data)
  values ('checkout.order_created', 'order', order_id, jsonb_build_object('order_number', order_number, 'is_test', is_test_order, 'total', total));

  return jsonb_build_object('orderId', order_id, 'orderNumber', order_number, 'subtotal', subtotal, 'shipping', shipping, 'total', total, 'isTest', is_test_order);
end;
$$;

create or replace function public.transition_order_status(
  target_order_id uuid,
  target_status text,
  carrier_input text default null,
  tracking_number_input text default null,
  tracking_url_input text default null,
  notes_input text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := (select auth.uid());
  order_row public.orders%rowtype;
  allocation_row public.order_inventory_allocations%rowtype;
  inventory_row public.inventory%rowtype;
  valid_transition boolean := false;
begin
  if actor is null or not (select private.has_admin_role(array['owner', 'admin', 'operations'])) then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  select * into order_row
  from public.orders
  where id = target_order_id
  for update;

  if not found then
    raise exception 'order_not_found' using errcode = 'P0001';
  end if;

  valid_transition :=
    (order_row.status = target_status)
    or (order_row.status = 'new' and target_status = 'confirmed')
    or (order_row.status = 'confirmed' and target_status = 'preparing')
    or (order_row.status = 'preparing' and target_status = 'shipped')
    or (order_row.status = 'shipped' and target_status = 'delivered')
    or (order_row.status in ('new', 'confirmed', 'preparing') and target_status = 'cancelled');

  if not valid_transition then
    raise exception 'invalid_status_transition' using errcode = 'P0001';
  end if;

  if target_status = 'cancelled' and order_row.inventory_release_applied_at is null and order_row.inventory_sale_applied_at is null then
    for allocation_row in
      select * from public.order_inventory_allocations
      where order_id = target_order_id and release_applied_at is null and sale_applied_at is null
      for update
    loop
      select * into inventory_row from public.inventory where id = allocation_row.inventory_id for update;

      update public.inventory
      set quantity_reserved = greatest(0, quantity_reserved - allocation_row.quantity_reserved)
      where id = allocation_row.inventory_id;

      update public.order_inventory_allocations
      set release_applied_at = now()
      where id = allocation_row.id;

      insert into public.inventory_movements (product_id, variant_id, order_id, quantity, previous_quantity, new_quantity, type, reason, created_by)
      values (allocation_row.product_id, allocation_row.variant_id, target_order_id, -allocation_row.quantity_reserved, inventory_row.quantity_reserved, greatest(0, inventory_row.quantity_reserved - allocation_row.quantity_reserved), 'release', 'order cancelled', actor);
    end loop;

    update public.orders set inventory_release_applied_at = now() where id = target_order_id;
  end if;

  if target_status = 'shipped' and order_row.inventory_sale_applied_at is null then
    for allocation_row in
      select * from public.order_inventory_allocations
      where order_id = target_order_id and release_applied_at is null and sale_applied_at is null
      for update
    loop
      select * into inventory_row from public.inventory where id = allocation_row.inventory_id for update;

      update public.inventory
      set
        quantity_reserved = greatest(0, quantity_reserved - allocation_row.quantity_reserved),
        quantity_on_hand = greatest(0, quantity_on_hand - allocation_row.quantity_reserved)
      where id = allocation_row.inventory_id;

      update public.order_inventory_allocations
      set sale_applied_at = now()
      where id = allocation_row.id;

      insert into public.inventory_movements (product_id, variant_id, order_id, quantity, previous_quantity, new_quantity, type, reason, created_by)
      values (allocation_row.product_id, allocation_row.variant_id, target_order_id, -allocation_row.quantity_reserved, inventory_row.quantity_on_hand, greatest(0, inventory_row.quantity_on_hand - allocation_row.quantity_reserved), 'sale', 'order shipped', actor);
    end loop;

    update public.orders set inventory_sale_applied_at = now() where id = target_order_id;
  end if;

  update public.orders
  set
    status = target_status,
    shipping_status = case
      when target_status = 'preparing' then 'preparing'
      when target_status = 'shipped' then 'shipped'
      when target_status = 'delivered' then 'delivered'
      when target_status = 'cancelled' then 'cancelled'
      else shipping_status
    end,
    carrier = coalesce(nullif(carrier_input, ''), carrier),
    tracking_number = coalesce(nullif(tracking_number_input, ''), tracking_number),
    tracking_url = coalesce(nullif(tracking_url_input, ''), tracking_url),
    confirmed_at = case when target_status = 'confirmed' and confirmed_at is null then now() else confirmed_at end,
    shipped_at = case when target_status = 'shipped' and shipped_at is null then now() else shipped_at end,
    delivered_at = case when target_status = 'delivered' and delivered_at is null then now() else delivered_at end,
    cancelled_at = case when target_status = 'cancelled' and cancelled_at is null then now() else cancelled_at end
  where id = target_order_id;

  insert into public.order_events (order_id, actor_id, event_type, from_status, to_status, notes)
  values (
    target_order_id,
    actor,
    case when target_status = 'cancelled' then 'order.cancel' else 'order.status_change' end,
    order_row.status,
    target_status,
    nullif(notes_input, '')
  );

  insert into public.admin_audit_log (actor_id, action, entity_type, entity_id, before_data, after_data)
  values (
    actor,
    case when target_status = 'cancelled' then 'order.cancel' else 'order.status_change' end,
    'order',
    target_order_id,
    jsonb_build_object('status', order_row.status),
    jsonb_build_object('status', target_status)
  );

  return jsonb_build_object('orderId', target_order_id, 'fromStatus', order_row.status, 'toStatus', target_status);
end;
$$;

revoke all on function public.create_order_transaction(jsonb) from public;
revoke all on function public.transition_order_status(uuid, text, text, text, text, text) from public;
grant execute on function public.create_order_transaction(jsonb) to anon, authenticated;
grant execute on function public.transition_order_status(uuid, text, text, text, text, text) to authenticated;
