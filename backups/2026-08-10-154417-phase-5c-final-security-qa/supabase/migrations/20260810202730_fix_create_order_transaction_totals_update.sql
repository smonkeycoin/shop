do $$
declare
  function_sql text;
begin
  select pg_get_functiondef('public.create_order_transaction(jsonb)'::regprocedure)
    into function_sql;

  function_sql := replace(
    function_sql,
    'update public.orders
  set subtotal = create_order_transaction.subtotal,
      shipping = create_order_transaction.shipping,
      total = create_order_transaction.total
  where id = order_id;',
    'execute ''update public.orders set subtotal = $1, shipping = $2, total = $3 where id = $4''
    using subtotal, shipping, total, order_id;'
  );

  if position('create_order_transaction.subtotal' in function_sql) > 0 then
    raise exception 'create_order_transaction_totals_patch_failed';
  end if;

  execute function_sql;
end;
$$;
