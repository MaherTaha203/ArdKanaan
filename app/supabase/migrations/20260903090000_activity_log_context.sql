-- System activity view context.
-- Extends the existing append-only audit_log without changing financial truth.
-- The same audit stream now carries actor, device, network and timezone context,
-- and exposes a guarded RPC for authenticated lifecycle events such as login/logout.

alter table public.audit_log
  add column if not exists actor_email text,
  add column if not exists source text,
  add column if not exists description text,
  add column if not exists device_id text,
  add column if not exists device_user_agent text,
  add column if not exists ip_address text,
  add column if not exists timezone text,
  add column if not exists metadata jsonb not null default '{}'::jsonb;

-- Preserve existing rows with useful source/description values.
update public.audit_log
set
  source = coalesce(source,
    case entity
      when 'receipt_voucher' then 'سندات القبض'
      when 'payment_voucher' then 'سندات الصرف'
      when 'student' then 'الطلاب'
      when 'enrollment' then 'التسجيلات'
      when 'restore' then 'النسخ الاحتياطي'
      else 'النظام'
    end
  ),
  description = coalesce(description, label)
where source is null or description is null;

create or replace function public.log_activity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_entity text;
  v_action text;
  v_label text;
  v_id uuid;
  v_changed text[];
  v_headers jsonb := coalesce(nullif(current_setting('request.headers', true), ''), '{}')::jsonb;
  v_actor_email text := auth.jwt() ->> 'email';
  v_source text;
  v_description text;
  v_device_id text := left(v_headers ->> 'x-ardkanaan-device-id', 128);
  v_user_agent text := left(v_headers ->> 'user-agent', 512);
  v_ip text := left(coalesce(v_headers ->> 'x-forwarded-for', v_headers ->> 'x-real-ip'), 128);
  v_timezone text := left(v_headers ->> 'x-ardkanaan-timezone', 128);
begin
  if current_setting('app.restoring', true) = 'on' then
    return coalesce(new, old);
  end if;

  if tg_table_name = 'receipt_vouchers' then
    v_entity := 'receipt_voucher'; v_id := new.id;
    v_label := 'سند قبض رقم ' || new.voucher_number;
    v_source := 'سندات القبض';
  elsif tg_table_name = 'payment_vouchers' then
    v_entity := 'payment_voucher'; v_id := new.id;
    v_label := 'سند صرف رقم ' || new.voucher_number;
    v_source := 'سندات الصرف';
  elsif tg_table_name = 'students' then
    v_entity := 'student'; v_id := new.id; v_label := new.name;
    v_source := 'الطلاب';
  elsif tg_table_name = 'enrollments' then
    v_entity := 'enrollment'; v_id := new.id; v_label := new.course_name;
    v_source := 'التسجيلات';
  else
    v_entity := tg_table_name; v_id := new.id;
    v_source := 'النظام';
  end if;

  if tg_op = 'INSERT' then
    v_action := 'create';
    v_description := case v_entity
      when 'receipt_voucher' then 'إصدار سند قبض رقم ' || new.voucher_number
      when 'payment_voucher' then 'إصدار سند صرف رقم ' || new.voucher_number
      when 'student' then 'إضافة طالب: ' || new.name
      when 'enrollment' then 'إضافة تسجيل: ' || new.course_name
      else coalesce(v_label, 'إضافة سجل')
    end;
    insert into public.audit_log
      (entity, entity_id, action, label, changed_by, actor_email, source, description,
       device_id, device_user_agent, ip_address, timezone, metadata, new_data)
    values
      (v_entity, v_id, v_action, v_label, auth.uid(), v_actor_email, v_source, v_description,
       v_device_id, v_user_agent, v_ip, v_timezone, '{}'::jsonb, to_jsonb(new));
    return new;
  end if;

  v_action := 'edit';
  if v_entity in ('receipt_voucher', 'payment_voucher') then
    if old.cancelled_at is null and new.cancelled_at is not null then
      v_action := 'cancel';
    elsif old.cancelled_at is not null and new.cancelled_at is null then
      v_action := 'uncancel';
    end if;
  end if;

  v_description := case
    when v_entity = 'receipt_voucher' and v_action = 'cancel' then 'إلغاء سند قبض رقم ' || new.voucher_number
    when v_entity = 'payment_voucher' and v_action = 'cancel' then 'إلغاء سند صرف رقم ' || new.voucher_number
    when v_entity = 'receipt_voucher' and v_action = 'uncancel' then 'إعادة تفعيل سند قبض رقم ' || new.voucher_number
    when v_entity = 'payment_voucher' and v_action = 'uncancel' then 'إعادة تفعيل سند صرف رقم ' || new.voucher_number
    when v_entity = 'receipt_voucher' then 'تعديل سند قبض رقم ' || new.voucher_number
    when v_entity = 'payment_voucher' then 'تعديل سند صرف رقم ' || new.voucher_number
    when v_entity = 'student' then 'تعديل بيانات طالب: ' || new.name
    when v_entity = 'enrollment' then 'تعديل تسجيل: ' || new.course_name
    else coalesce(v_label, 'تعديل سجل')
  end;

  select array_agg(key order by key) into v_changed
  from jsonb_object_keys(to_jsonb(new)) as k(key)
  where to_jsonb(old)->key is distinct from to_jsonb(new)->key
    and key <> 'updated_at';

  insert into public.audit_log
    (entity, entity_id, action, label, changed_by, actor_email, source, description,
     device_id, device_user_agent, ip_address, timezone, metadata, changed_fields, old_data, new_data)
  values
    (v_entity, v_id, v_action, v_label, auth.uid(), v_actor_email, v_source, v_description,
     v_device_id, v_user_agent, v_ip, v_timezone, '{}'::jsonb, v_changed, to_jsonb(old), to_jsonb(new));
  return new;
end;
$$;

revoke all on function public.log_activity() from public, anon, authenticated;

-- Authenticated lifecycle events use this function because Supabase Auth is not a
-- public application table and browser login itself does not pass through our data triggers.
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
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED';
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
