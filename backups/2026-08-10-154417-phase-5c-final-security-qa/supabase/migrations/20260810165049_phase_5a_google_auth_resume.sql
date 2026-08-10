revoke all on function public.claim_admin_profile() from public;
drop function if exists public.claim_admin_profile();

create policy "Allowlisted Google users can bootstrap own admin profile" on public.admin_profiles
  for insert to authenticated
  with check (
    id = (select auth.uid())
    and lower(email) = lower(coalesce((select auth.jwt() ->> 'email'), ''))
    and lower(email) in ('trinopc1@gmail.com', 'melissa.ig.mo@gmail.com', 'karina.iglesiaz@gmail.com')
    and role = case lower(email)
      when 'trinopc1@gmail.com' then 'owner'
      when 'melissa.ig.mo@gmail.com' then 'admin'
      when 'karina.iglesiaz@gmail.com' then 'admin'
      else '__blocked__'
    end
    and is_active = true
  );

comment on table public.admin_profiles is 'Back Office allowlist and role table. Google OAuth does not grant access unless a matching active row exists. Initial provisioning is performed server-side after OAuth with a real auth.users UUID.';
