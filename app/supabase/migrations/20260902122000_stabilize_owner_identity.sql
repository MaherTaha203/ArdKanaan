-- Stabilize the Owner identity instead of recalculating it from auth.users on every request.
-- The first-created Auth user remains the Owner even if another user is later created,
-- and deleting a later account can never transfer ownership.

create table if not exists public.owner_identity (
  id uuid primary key,
  singleton boolean not null default true,
  constraint owner_identity_singleton check (singleton = true)
);

revoke all on public.owner_identity from public, anon, authenticated;

insert into public.owner_identity (id)
select u.id
from auth.users as u
order by u.created_at asc, u.id asc
limit 1
on conflict (id) do nothing;

create or replace function public.is_owner()
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  owner_id uuid;
  first_user_id uuid;
begin
  select oi.id into owner_id
  from public.owner_identity oi
  limit 1;

  if owner_id is null then
    select u.id
      into first_user_id
    from auth.users u
    order by u.created_at asc, u.id asc
    limit 1;

    if first_user_id is not null then
      insert into public.owner_identity (id)
      values (first_user_id)
      on conflict (id) do nothing;

      select oi.id into owner_id
      from public.owner_identity oi
      limit 1;
    end if;
  end if;

  return auth.uid() is not null and auth.uid() = owner_id;
end;
$$;

revoke all on function public.is_owner() from public, anon;
grant execute on function public.is_owner() to authenticated;
