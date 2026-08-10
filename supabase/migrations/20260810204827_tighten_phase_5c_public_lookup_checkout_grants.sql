revoke execute on function public.create_order_transaction_v2(jsonb) from authenticated;
revoke execute on function public.get_public_order(text, uuid) from authenticated;

grant execute on function public.create_order_transaction_v2(jsonb) to anon;
grant execute on function public.get_public_order(text, uuid) to anon;
