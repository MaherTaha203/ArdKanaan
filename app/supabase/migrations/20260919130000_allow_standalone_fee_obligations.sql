begin;

-- ADR-0077 — Student-anchored financial obligations.
--
-- Until now every fee obligation was forced through an ENROLLMENT in a specific
-- course: `fee_obligations.enrollment_id` was NOT NULL, `create_fee_obligations`
-- raised ENROLLMENT_REQUIRED_FOR_SELECTED_STUDENTS, and two triggers rejected any
-- obligation without a matching enrollment. That made exam / certificate / other
-- fees — and any fee for a student not enrolled in that course — impossible.
--
-- This migration re-anchors the obligation on the STUDENT. Course and enrollment
-- become OPTIONAL context: a fee may be tied to a course (and to an enrollment
-- when the student has one), or stand entirely alone. student_id remains the
-- required identity.
--
-- The financial firewall is preserved in full and NOT weakened:
--   * obligations are still owner-only (RLS + is_owner() in the RPC),
--   * still immutable after creation (financial-identity trigger, UPDATE branch),
--   * still non-deletable (prevent_financial_obligation_delete, unchanged),
--   * still create NO cash movement — only a receipt does.
-- Where context IS supplied it is still validated: a linked enrollment must
-- belong to the student and agree with any course; a named course must exist.
--
-- REPO ONLY — this migration must NOT be applied to Production without a separate
-- explicit Owner authorization.

-- 1. Course/enrollment context becomes optional. `course_id` is already nullable.
alter table public.fee_obligations alter column enrollment_id drop not null;
alter table public.fee_obligations alter column course_name drop not null;

-- 2. BEFORE INSERT: validate the optional context and link an EXISTING enrollment
--    when one is available. Never invent a missing enrollment; never require one.
create or replace function public.resolve_fee_obligation_enrollment()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_course_id uuid;
  v_course_name text;
begin
  -- Standalone obligation: anchored on the student alone. Always valid.
  if new.course_id is null and new.enrollment_id is null then
    return new;
  end if;

  if new.enrollment_id is not null then
    -- Enrollment context: it must belong to the student. Derive the course
    -- identity from it and require any supplied course_id to agree.
    select e.course_id, e.course_name
      into v_course_id, v_course_name
    from public.enrollments e
    where e.id = new.enrollment_id and e.student_id = new.student_id;
    if v_course_id is null then
      raise exception 'FEE_OBLIGATION_ENROLLMENT_MISMATCH';
    end if;
    if new.course_id is not null and new.course_id <> v_course_id then
      raise exception 'FEE_OBLIGATION_ENROLLMENT_MISMATCH';
    end if;
    new.course_id := v_course_id;
    new.course_name := coalesce(new.course_name, v_course_name);
    return new;
  end if;

  -- Course context without an explicit enrollment: the course must exist. Link
  -- the student's enrollment in that course WHEN one exists; otherwise leave
  -- enrollment_id null (a course fee for a not-yet-enrolled student stays valid).
  if not exists (select 1 from public.courses c where c.id = new.course_id) then
    raise exception 'FEE_OBLIGATION_COURSE_NOT_FOUND';
  end if;
  select e.id, e.course_name
    into new.enrollment_id, v_course_name
  from public.enrollments e
  where e.student_id = new.student_id and e.course_id = new.course_id;
  if new.course_name is null then
    new.course_name := coalesce(v_course_name, (select c.name from public.courses c where c.id = new.course_id));
  end if;
  return new;
end;
$$;

-- 3. BEFORE INSERT OR UPDATE: financial-identity firewall. Optional context must
--    be consistent when present; immutability after creation is unchanged.
create or replace function public.enforce_fee_obligation_financial_identity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if current_setting('app.restoring', true) = 'on' then
    return new;
  end if;

  -- Optional context integrity — the student is the anchor.
  if new.enrollment_id is not null then
    if not exists (
      select 1
      from public.enrollments e
      where e.id = new.enrollment_id
        and e.student_id = new.student_id
        and (new.course_id is null or e.course_id = new.course_id)
        and (new.course_name is null or e.course_name = new.course_name)
    ) then
      raise exception 'FEE_OBLIGATION_ENROLLMENT_MISMATCH';
    end if;
  elsif new.course_id is not null then
    if not exists (select 1 from public.courses c where c.id = new.course_id) then
      raise exception 'FEE_OBLIGATION_COURSE_NOT_FOUND';
    end if;
  end if;

  if tg_op = 'UPDATE' then
    if old.cancelled_at is not null then
      raise exception 'CANCELLED_FEE_OBLIGATION_IS_IMMUTABLE';
    end if;

    if new.id is distinct from old.id
       or new.student_id is distinct from old.student_id
       or new.enrollment_id is distinct from old.enrollment_id
       or new.course_id is distinct from old.course_id
       or new.course_name is distinct from old.course_name
       or new.description is distinct from old.description
       or new.amount is distinct from old.amount
       or new.fee_category is distinct from old.fee_category
       or new.external_share is distinct from old.external_share
       or new.created_at is distinct from old.created_at then
      raise exception 'FEE_OBLIGATION_FINANCIAL_FIELDS_IMMUTABLE';
    end if;

    if old.cancelled_at is null and new.cancelled_at is not null
       and nullif(btrim(new.cancel_reason), '') is null then
      raise exception 'FEE_CANCELLATION_REASON_REQUIRED';
    end if;

    if old.cancelled_at is not null and new.cancelled_at is distinct from old.cancelled_at then
      raise exception 'CANCELLED_FEE_OBLIGATION_IS_IMMUTABLE';
    end if;
  end if;

  return new;
end;
$$;

-- 4. create_fee_obligations — course_id and enrollment_id are now OPTIONAL.
--    * course_id given  -> the course must exist; each student's enrollment in it
--                          is linked when present (not required).
--    * enrollment_id given -> exactly one student; the course is taken from it.
--    * neither given    -> a standalone, student-only obligation.
--    All amount/category/external validation is unchanged.
create or replace function public.create_fee_obligations(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  p_course_id uuid;
  p_enrollment_id uuid;
  p_student_ids jsonb;
  p_description text;
  p_amount numeric;
  p_category text;
  p_external numeric;
  v_course_name text;
  v_student_id uuid;
  v_enrollment_id uuid;
  v_student_count int;
  v_count int := 0;
  item jsonb;
begin
  if not public.is_owner() then raise exception 'OWNER_ONLY'; end if;
  if payload is null or jsonb_typeof(payload) <> 'object' then raise exception 'INVALID_FEE_PAYLOAD'; end if;

  p_course_id := nullif(payload->>'course_id', '')::uuid;
  p_enrollment_id := nullif(payload->>'enrollment_id', '')::uuid;
  p_student_ids := payload->'student_ids';
  p_description := btrim(coalesce(payload->>'description', ''));
  p_amount := (payload->>'amount')::numeric;
  p_category := payload->>'fee_category';
  p_external := coalesce((payload->>'external_share')::numeric, 0);

  if jsonb_typeof(p_student_ids) <> 'array' or jsonb_array_length(p_student_ids) = 0
     or p_description = '' or p_amount is null or p_amount <= 0 or p_amount <> trunc(p_amount)
     or p_category not in ('institute','external','shared') or p_external < 0 or p_external > p_amount
     or (p_category = 'institute' and p_external <> 0)
     or (p_category = 'external' and p_external <> p_amount)
     or (p_category = 'shared' and (p_external <= 0 or p_external >= p_amount)) then
    raise exception 'INVALID_FEE_PAYLOAD';
  end if;

  select count(distinct value) into v_student_count
  from jsonb_array_elements_text(p_student_ids)
  where btrim(value) <> '';
  if v_student_count = 0 then raise exception 'INVALID_FEE_PAYLOAD'; end if;

  -- An explicit enrollment fixes a single student and its course.
  if p_enrollment_id is not null and v_student_count <> 1 then
    raise exception 'INVALID_FEE_PAYLOAD';
  end if;

  -- A named course must exist; capture its display name for the snapshot.
  if p_course_id is not null then
    select c.name into v_course_name from public.courses c where c.id = p_course_id;
    if v_course_name is null then raise exception 'COURSE_NOT_FOUND'; end if;
  end if;

  for item in
    select to_jsonb(s.student_id)
    from (
      select distinct value as student_id
      from jsonb_array_elements_text(p_student_ids)
      where btrim(value) <> ''
    ) s
  loop
    v_student_id := nullif(item #>> '{}', '')::uuid;
    if v_student_id is null then raise exception 'INVALID_FEE_PAYLOAD'; end if;

    -- Optional enrollment: explicit, else linked from (student, course) when a
    -- course is set and the student is enrolled in it (otherwise left null).
    v_enrollment_id := p_enrollment_id;
    if v_enrollment_id is null and p_course_id is not null then
      select e.id into v_enrollment_id
      from public.enrollments e
      where e.student_id = v_student_id and e.course_id = p_course_id;
    end if;

    insert into public.fee_obligations
      (student_id, enrollment_id, course_id, course_name, description, amount, fee_category, external_share)
    values
      (v_student_id, v_enrollment_id, p_course_id, v_course_name, p_description, p_amount, p_category, p_external);
    v_count := v_count + 1;
  end loop;

  return jsonb_build_object('created', v_count);
end;
$$;

revoke all on function public.create_fee_obligations(jsonb) from public, anon;
grant execute on function public.create_fee_obligations(jsonb) to authenticated;

commit;
