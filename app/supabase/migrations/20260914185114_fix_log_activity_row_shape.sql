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
  v_new jsonb := to_jsonb(new);
  v_old jsonb := case when tg_op = 'UPDATE' then to_jsonb(old) else '{}'::jsonb end;
  v_device_id text := left(v_headers ->> 'x-ardkanaan-device-id', 128);
  v_user_agent text := left(v_headers ->> 'user-agent', 512);
  v_ip text := left(coalesce(v_headers ->> 'x-forwarded-for', v_headers ->> 'x-real-ip'), 128);
  v_timezone text := left(v_headers ->> 'x-ardkanaan-timezone', 128);
begin
  if current_setting('app.restoring', true) = 'on' then
    return coalesce(new, old);
  end if;

  v_id := nullif(v_new ->> 'id', '')::uuid;

  if tg_table_name = 'receipt_vouchers' then
    v_entity := 'receipt_voucher';
    v_label := 'سند قبض رقم ' || coalesce(v_new ->> 'voucher_number', '');
    v_source := 'سندات القبض';
  elsif tg_table_name = 'payment_vouchers' then
    v_entity := 'payment_voucher';
    v_label := 'سند صرف رقم ' || coalesce(v_new ->> 'voucher_number', '');
    v_source := 'سندات الصرف';
  elsif tg_table_name = 'students' then
    v_entity := 'student';
    v_label := coalesce(v_new ->> 'name', '');
    v_source := 'الطلاب';
  elsif tg_table_name = 'enrollments' then
    v_entity := 'enrollment';
    v_label := coalesce(v_new ->> 'course_name', '');
    v_source := 'التسجيلات';
  else
    v_entity := tg_table_name;
    v_source := 'النظام';
  end if;

  if tg_op = 'INSERT' then
    v_action := 'create';
    v_description := case v_entity
      when 'receipt_voucher' then 'إصدار سند قبض رقم ' || coalesce(v_new ->> 'voucher_number', '')
      when 'payment_voucher' then 'إصدار سند صرف رقم ' || coalesce(v_new ->> 'voucher_number', '')
      when 'student' then 'إضافة طالب: ' || coalesce(v_new ->> 'name', '')
      when 'enrollment' then 'إضافة تسجيل: ' || coalesce(v_new ->> 'course_name', '')
      else coalesce(v_label, 'إضافة سجل')
    end;

    insert into public.audit_log
      (entity, entity_id, action, label, changed_by, actor_email, source, description,
       device_id, device_user_agent, ip_address, timezone, metadata, new_data)
    values
      (v_entity, v_id, v_action, v_label, auth.uid(), v_actor_email, v_source, v_description,
       v_device_id, v_user_agent, v_ip, v_timezone, '{}'::jsonb, v_new);
    return new;
  end if;

  v_action := 'edit';
  if v_entity in ('receipt_voucher', 'payment_voucher') then
    if (v_old ->> 'cancelled_at') is null and (v_new ->> 'cancelled_at') is not null then
      v_action := 'cancel';
    elsif (v_old ->> 'cancelled_at') is not null and (v_new ->> 'cancelled_at') is null then
      v_action := 'uncancel';
    end if;
  end if;

  v_description := case
    when v_entity = 'receipt_voucher' and v_action = 'cancel' then 'إلغاء سند قبض رقم ' || coalesce(v_new ->> 'voucher_number', '')
    when v_entity = 'payment_voucher' and v_action = 'cancel' then 'إلغاء سند صرف رقم ' || coalesce(v_new ->> 'voucher_number', '')
    when v_entity = 'receipt_voucher' and v_action = 'uncancel' then 'إعادة تفعيل سند قبض رقم ' || coalesce(v_new ->> 'voucher_number', '')
    when v_entity = 'payment_voucher' and v_action = 'uncancel' then 'إعادة تفعيل سند صرف رقم ' || coalesce(v_new ->> 'voucher_number', '')
    when v_entity = 'receipt_voucher' then 'تعديل سند قبض رقم ' || coalesce(v_new ->> 'voucher_number', '')
    when v_entity = 'payment_voucher' then 'تعديل سند صرف رقم ' || coalesce(v_new ->> 'voucher_number', '')
    when v_entity = 'student' then 'تعديل بيانات طالب: ' || coalesce(v_new ->> 'name', '')
    when v_entity = 'enrollment' then 'تعديل تسجيل: ' || coalesce(v_new ->> 'course_name', '')
    else coalesce(v_label, 'تعديل سجل')
  end;

  select array_agg(key order by key) into v_changed
  from jsonb_object_keys(v_new) as k(key)
  where v_old -> key is distinct from v_new -> key
    and key <> 'updated_at';

  insert into public.audit_log
    (entity, entity_id, action, label, changed_by, actor_email, source, description,
     device_id, device_user_agent, ip_address, timezone, metadata, changed_fields, old_data, new_data)
  values
    (v_entity, v_id, v_action, v_label, auth.uid(), v_actor_email, v_source, v_description,
     v_device_id, v_user_agent, v_ip, v_timezone, '{}'::jsonb, v_changed, v_old, v_new);
  return new;
end;
$$;
revoke all on function public.log_activity() from public, anon, authenticated;