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
  authenticated_email text;
  authenticated_name text;
  assigned_role text;
  existing_profile public.admin_profiles%rowtype;
begin
  if current_user_id is null then
    return;
  end if;

  select
    lower(trim(auth_user.email)),
    nullif(
      coalesce(
        auth_user.raw_user_meta_data ->> 'full_name',
        auth_user.raw_user_meta_data ->> 'name'
      ),
      ''
    )
  into authenticated_email, authenticated_name
  from auth.users auth_user
  where auth_user.id = current_user_id;

  if authenticated_email is null or authenticated_email = '' then
    return;
  end if;

  assigned_role := case authenticated_email
    when 'trinopc1@gmail.com' then 'owner'
    when 'melissa.ig.mo@gmail.com' then 'admin'
    when 'karina.iglesiaz@gmail.com' then 'admin'
    else null
  end;

  if assigned_role is null then
    return;
  end if;

  select *
  into existing_profile
  from public.admin_profiles profile
  where lower(profile.email) = authenticated_email;

  if found and existing_profile.id <> current_user_id then
    raise exception 'admin profile email belongs to another auth user'
      using errcode = '23505';
  end if;

  if not found then
    insert into public.admin_profiles (id, email, full_name, role, is_active, last_login_at)
    values (current_user_id, authenticated_email, authenticated_name, assigned_role, true, now());
  else
    update public.admin_profiles profile
    set
      full_name = coalesce(profile.full_name, authenticated_name),
      last_login_at = case when profile.is_active then now() else profile.last_login_at end,
      updated_at = now()
    where profile.id = current_user_id;
  end if;

  return query
  select
    profile.id,
    profile.email,
    profile.full_name,
    profile.role,
    profile.is_active,
    profile.last_login_at
  from public.admin_profiles profile
  where profile.id = current_user_id
    and lower(profile.email) = authenticated_email;
end;
$$;

revoke all on function public.claim_admin_profile() from public;
grant execute on function public.claim_admin_profile() to authenticated;

comment on function public.claim_admin_profile() is 'Safely bootstraps an admin profile after OAuth by matching auth.uid() to auth.users.email and deriving the role from the server-side allowlist.';
