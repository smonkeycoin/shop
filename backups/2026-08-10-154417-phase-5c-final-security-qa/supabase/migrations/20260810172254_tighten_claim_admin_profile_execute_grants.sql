revoke all on function public.claim_admin_profile() from public;
revoke all on function public.claim_admin_profile() from anon;
revoke all on function public.claim_admin_profile() from authenticated;
grant execute on function public.claim_admin_profile() to authenticated;
