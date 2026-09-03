-- Activity-log integrity guard.
-- Client-authenticated lifecycle events are audit records and must follow the
-- same single-Owner boundary as the rest of ArdKanaan.

create or replace function public.record_activity_event(
  p_entity text,
  p_action text,
  p_label text default null,
  p_description text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_headers jsonb := coalesce(nullif(current_setting('request.headers', true), ''), '{}')::jsonb;
  v_id uuid;
begin
  if not public.is_owner() then
    raise exception 'OWNER_ONLY';
  end if;

  insert into public.audit_log
    (entity, action, label, changed_by, actor_email, changed_at, source, description,
     device_id, device_user_agent, ip_address, timezone, metadata)
  values
    (
      left(p_entity, 80),
      left(p_action, 80),
      left(p_label, 255),
      auth.uid(),
      auth.jwt() ->> 'email',
      timezone('utc', now()),
      left(coalesce(p_entity, 'النظام'), 120),
      left(coalesce(p_description, p_label, p_action), 500),
      left(v_headers ->> 'x-ardkanaan-device-id', 128),
      left(v_headers ->> 'user-agent', 512),
      left(coalesce(v_headers ->> 'x-forwarded-for', v_headers ->> 'x-real-ip'), 128),
      left(v_headers ->> 'x-ardkanaan-timezone', 128),
      coalesce(p_metadata, '{}'::jsonb)
    )
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.record_activity_event(text, text, text, text, jsonb) from public, anon;
grant execute on function public.record_activity_event(text, text, text, text, jsonb) to authenticated;
