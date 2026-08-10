drop table if exists qa_phase5c_security_results;

create temporary table qa_phase5c_security_results (
  key text primary key,
  value text not null
);

do $$
declare
  qa_suffix text := replace(gen_random_uuid()::text, '-', '');
  v_product_id uuid;
  v_no_stock_product_id uuid;
  order_result jsonb;
  v_order_id uuid;
  v_order_number text;
  v_lookup_token uuid;
  before_orders integer;
  after_orders integer;
begin
  insert into public.products (slug, sku, name, retail_price, cost, currency, stock_status, published, active)
  values ('qa-sec-price-' || qa_suffix, 'QA-SEC-PRICE-' || left(qa_suffix, 12), 'QA Security Price Product', 1300, 600, 'MXN', 'in_stock', true, true)
  returning id into v_product_id;

  insert into public.inventory (product_id, variant_id, quantity_on_hand, quantity_reserved, reorder_point)
  values (v_product_id, null, 3, 0, 1);

  order_result := public.create_order_transaction_v2(jsonb_build_object(
    'checkoutMode', 'demo',
    'isTest', true,
    'customer', jsonb_build_object('firstName', 'QA', 'lastName', 'Security', 'phone', '+529980000001', 'email', 'qa-security-' || qa_suffix || '@example.com'),
    'shippingAddress', jsonb_build_object('street', 'QA', 'exteriorNumber', '1', 'neighborhood', 'Centro', 'postalCode', '77500', 'city', 'Cancun', 'state', 'Quintana Roo'),
    'items', jsonb_build_array(jsonb_build_object('type', 'product', 'productId', v_product_id::text, 'quantity', 2, 'unitPrice', 1, 'price', 1, 'total', 2))
  ));

  v_order_id := (order_result ->> 'orderId')::uuid;
  v_order_number := order_result ->> 'orderNumber';
  v_lookup_token := (order_result ->> 'lookupToken')::uuid;

  insert into qa_phase5c_security_results (key, value)
  select 'price_manipulated_ignored_pass', (subtotal = 2600 and total >= subtotal)::text
  from public.orders
  where id = v_order_id;

  insert into qa_phase5c_security_results (key, value)
  values (
    'wrong_token_no_data_pass',
    (public.get_public_order(v_order_number, gen_random_uuid()) is null)::text
  );

  insert into public.products (slug, sku, name, retail_price, cost, currency, stock_status, published, active)
  values ('qa-sec-nostock-' || qa_suffix, 'QA-SEC-NOSTOCK-' || left(qa_suffix, 12), 'QA Security No Stock Product', 900, 300, 'MXN', 'in_stock', true, true)
  returning id into v_no_stock_product_id;

  insert into public.inventory (product_id, variant_id, quantity_on_hand, quantity_reserved, reorder_point)
  values (v_no_stock_product_id, null, 1, 0, 1);

  select count(*) into before_orders from public.orders;
  begin
    perform public.create_order_transaction_v2(jsonb_build_object(
      'checkoutMode', 'demo',
      'isTest', true,
      'customer', jsonb_build_object('firstName', 'QA', 'lastName', 'No Partial', 'phone', '+529980000002', 'email', 'qa-security-nostock-' || qa_suffix || '@example.com'),
      'shippingAddress', jsonb_build_object('street', 'QA', 'exteriorNumber', '2', 'neighborhood', 'Centro', 'postalCode', '77500', 'city', 'Cancun', 'state', 'Quintana Roo'),
      'items', jsonb_build_array(jsonb_build_object('type', 'product', 'productId', v_no_stock_product_id::text, 'quantity', 2))
    ));
    insert into qa_phase5c_security_results (key, value) values ('stock_insufficient_no_partial_pass', 'false');
  exception
    when others then
      select count(*) into after_orders from public.orders;
      insert into qa_phase5c_security_results (key, value)
      values ('stock_insufficient_no_partial_pass', (sqlerrm like '%insufficient_stock%' and after_orders = before_orders)::text);
  end;

  begin
    perform public.create_order_transaction_v2(jsonb_build_object(
      'checkoutMode', 'demo',
      'isTest', true,
      'customer', jsonb_build_object('firstName', 'QA', 'lastName', 'Bad Product', 'phone', '+529980000003', 'email', 'qa-security-badproduct-' || qa_suffix || '@example.com'),
      'shippingAddress', jsonb_build_object('street', 'QA', 'exteriorNumber', '3', 'neighborhood', 'Centro', 'postalCode', '77500', 'city', 'Cancun', 'state', 'Quintana Roo'),
      'items', jsonb_build_array(jsonb_build_object('type', 'product', 'productId', gen_random_uuid()::text, 'quantity', 1))
    ));
    insert into qa_phase5c_security_results (key, value) values ('unknown_product_no_order_pass', 'false');
  exception
    when others then
      insert into qa_phase5c_security_results (key, value)
      values ('unknown_product_no_order_pass', (sqlerrm like '%product_unavailable%')::text);
  end;

  update public.products
  set active = false,
      published = false,
      stock_status = 'out_of_stock'
  where id in (v_product_id, v_no_stock_product_id);
end;
$$;

do $$
begin
  execute 'set local role anon';
  perform public.transition_order_status(gen_random_uuid(), 'confirmed', null, null, null, 'anon attempt');
  insert into qa_phase5c_security_results (key, value) values ('anon_admin_rpc_denied_pass', 'false');
exception
  when insufficient_privilege then
    insert into qa_phase5c_security_results (key, value) values ('anon_admin_rpc_denied_pass', 'true');
  when others then
    insert into qa_phase5c_security_results (key, value) values ('anon_admin_rpc_denied_pass', (sqlstate = '42501')::text);
end;
$$;

select key, value
from qa_phase5c_security_results
order by key;
