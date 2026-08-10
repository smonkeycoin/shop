revoke execute on function public.create_order_transaction(jsonb) from public, anon, authenticated;

revoke execute on function public.transition_order_status(uuid, text, text, text, text, text) from public, anon;
grant execute on function public.transition_order_status(uuid, text, text, text, text, text) to authenticated;
