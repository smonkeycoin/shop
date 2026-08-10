drop table if exists qa_phase5c_results;

create temporary table qa_phase5c_results (
  key text primary key,
  value text not null
);

do $$
declare
  qa_suffix text := replace(gen_random_uuid()::text, '-', '');
  owner_id uuid;
  v_product_id uuid;
  v_no_stock_product_id uuid;
  v_kit_component_id uuid;
  v_bundle_id uuid;
  checkout_order jsonb;
  cancel_order jsonb;
  kit_order jsonb;
  v_order_id uuid;
  v_cancel_order_id uuid;
begin
  select id into owner_id
  from public.admin_profiles
  where role = 'owner' and is_active
  order by created_at
  limit 1;

  if owner_id is null then
    raise exception 'qa_owner_missing';
  end if;

  insert into public.products (slug, sku, name, retail_price, cost, currency, stock_status, published, active)
  values ('qa-phase-5c-product-' || qa_suffix, 'QA-5C-PRODUCT-' || left(qa_suffix, 12), 'QA Phase 5C Product', 1234, 700, 'MXN', 'in_stock', true, true)
  returning id into v_product_id;

  insert into public.products (slug, sku, name, retail_price, cost, currency, stock_status, published, active)
  values ('qa-phase-5c-nostock-' || qa_suffix, 'QA-5C-NOSTOCK-' || left(qa_suffix, 12), 'QA Phase 5C No Stock', 999, 500, 'MXN', 'out_of_stock', true, true)
  returning id into v_no_stock_product_id;

  insert into public.products (slug, sku, name, retail_price, cost, currency, stock_status, published, active)
  values ('qa-phase-5c-kit-component-' || qa_suffix, 'QA-5C-KIT-COMP-' || left(qa_suffix, 12), 'QA Phase 5C Kit Component', 250, 100, 'MXN', 'in_stock', true, true)
  returning id into v_kit_component_id;

  insert into public.inventory (product_id, variant_id, quantity_on_hand, quantity_reserved, reorder_point)
  values
    (v_product_id, null, 5, 0, 1),
    (v_no_stock_product_id, null, 0, 0, 1),
    (v_kit_component_id, null, 6, 0, 1);

  insert into public.bundles (slug, name, retail_price, currency, published, featured, active)
  values ('qa-phase-5c-kit-' || qa_suffix, 'QA Phase 5C Kit', 800, 'MXN', true, false, true)
  returning id into v_bundle_id;

  insert into public.bundle_items (bundle_id, product_id, quantity)
  values (v_bundle_id, v_kit_component_id, 2);

  checkout_order := public.create_order_transaction_v2(jsonb_build_object(
    'checkoutMode', 'demo',
    'isTest', true,
    'customer', jsonb_build_object(
      'firstName', 'QA',
      'lastName', 'Commerce',
      'phone', '+529981234567',
      'email', 'qa-phase-5c-' || qa_suffix || '@example.com'
    ),
    'shippingAddress', jsonb_build_object(
      'street', 'Calle QA',
      'exteriorNumber', '5',
      'neighborhood', 'Centro',
      'postalCode', '77500',
      'city', 'Cancun',
      'state', 'Quintana Roo',
      'references', 'QA'
    ),
    'whatsappOptIn', true,
    'requiresInvoice', false,
    'items', jsonb_build_array(jsonb_build_object(
      'type', 'product',
      'productId', v_product_id::text,
      'quantity', 2,
      'price', 1
    ))
  ));
  v_order_id := (checkout_order ->> 'orderId')::uuid;

  insert into qa_phase5c_results (key, value)
  select 'checkout_persistent_order_pass', (count(*) = 1)::text
  from public.orders
  where id = v_order_id
    and order_number like 'NP-%'
    and is_test = true
    and checkout_mode = 'demo';

  insert into qa_phase5c_results (key, value)
  select 'server_recalculated_price_pass', (subtotal = 2468 and total >= subtotal)::text
  from public.orders
  where id = v_order_id;

  insert into qa_phase5c_results (key, value)
  select 'reservation_created_pass', (quantity_reserved = 2 and quantity_on_hand = 5)::text
  from public.inventory
  where public.inventory.product_id = v_product_id and variant_id is null;

  insert into qa_phase5c_results (key, value)
  values (
    'public_lookup_pass',
    ((public.get_public_order(checkout_order ->> 'orderNumber', (checkout_order ->> 'lookupToken')::uuid) ->> 'orderNumber') = (checkout_order ->> 'orderNumber'))::text
  );

  begin
    perform public.create_order_transaction_v2(jsonb_build_object(
      'checkoutMode', 'demo',
      'isTest', true,
      'customer', jsonb_build_object('firstName', 'QA', 'lastName', 'No Stock', 'phone', '+529980000000', 'email', 'qa-phase-5c-nostock-' || qa_suffix || '@example.com'),
      'shippingAddress', jsonb_build_object('street', 'Calle QA', 'exteriorNumber', '0', 'neighborhood', 'Centro', 'postalCode', '77500', 'city', 'Cancun', 'state', 'Quintana Roo'),
      'items', jsonb_build_array(jsonb_build_object('type', 'product', 'productId', v_no_stock_product_id::text, 'quantity', 1))
    ));
    insert into qa_phase5c_results (key, value) values ('no_stock_reject_pass', 'false');
  exception
    when others then
      insert into qa_phase5c_results (key, value) values ('no_stock_reject_pass', (sqlerrm like '%insufficient_stock%')::text);
  end;

  perform set_config('request.jwt.claim.sub', owner_id::text, true);
  perform public.transition_order_status(v_order_id, 'confirmed', null, null, null, 'QA confirmed');
  perform public.transition_order_status(v_order_id, 'preparing', null, null, null, 'QA preparing');
  perform public.transition_order_status(v_order_id, 'shipped', 'QA Carrier', 'QA123', null, 'QA shipped');
  perform public.transition_order_status(v_order_id, 'shipped', 'QA Carrier', 'QA123', null, 'QA idempotent shipped');

  insert into qa_phase5c_results (key, value)
  select 'shipped_sale_idempotent_pass', (quantity_on_hand = 3 and quantity_reserved = 0)::text
  from public.inventory
  where public.inventory.product_id = v_product_id and variant_id is null;

  cancel_order := public.create_order_transaction_v2(jsonb_build_object(
    'checkoutMode', 'demo',
    'isTest', true,
    'customer', jsonb_build_object('firstName', 'QA', 'lastName', 'Cancel', 'phone', '+529981111111', 'email', 'qa-phase-5c-cancel-' || qa_suffix || '@example.com'),
    'shippingAddress', jsonb_build_object('street', 'Calle QA', 'exteriorNumber', '1', 'neighborhood', 'Centro', 'postalCode', '77500', 'city', 'Cancun', 'state', 'Quintana Roo'),
    'items', jsonb_build_array(jsonb_build_object('type', 'product', 'productId', v_product_id::text, 'quantity', 1))
  ));
  v_cancel_order_id := (cancel_order ->> 'orderId')::uuid;
  perform public.transition_order_status(v_cancel_order_id, 'cancelled', null, null, null, 'QA cancelled');

  insert into qa_phase5c_results (key, value)
  select 'cancel_release_pass', (quantity_on_hand = 3 and quantity_reserved = 0)::text
  from public.inventory
  where public.inventory.product_id = v_product_id and variant_id is null;

  kit_order := public.create_order_transaction_v2(jsonb_build_object(
    'checkoutMode', 'demo',
    'isTest', true,
    'customer', jsonb_build_object('firstName', 'QA', 'lastName', 'Kit', 'phone', '+529982222222', 'email', 'qa-phase-5c-kit-' || qa_suffix || '@example.com'),
    'shippingAddress', jsonb_build_object('street', 'Calle QA', 'exteriorNumber', '2', 'neighborhood', 'Centro', 'postalCode', '77500', 'city', 'Cancun', 'state', 'Quintana Roo'),
    'items', jsonb_build_array(jsonb_build_object('type', 'bundle', 'bundleId', v_bundle_id::text, 'quantity', 2))
  ));

  insert into qa_phase5c_results (key, value)
  select 'kit_component_reservation_pass', (quantity_on_hand = 6 and quantity_reserved = 4)::text
  from public.inventory
  where public.inventory.product_id = v_kit_component_id and variant_id is null;

  insert into qa_phase5c_results (key, value)
  select 'analytics_test_orders_created', count(*)::text
  from public.orders
  where id in (v_order_id, v_cancel_order_id, (kit_order ->> 'orderId')::uuid)
    and is_test = true;

  update public.products
  set active = false,
      published = false,
      stock_status = 'out_of_stock'
  where id in (v_product_id, v_no_stock_product_id, v_kit_component_id);

  update public.bundles
  set active = false,
      published = false
  where id = v_bundle_id;
end;
$$;

select key, value
from qa_phase5c_results
where key like '%pass' or key = 'analytics_test_orders_created'
order by key;
