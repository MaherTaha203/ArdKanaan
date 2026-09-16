begin;

create index if not exists fee_obligations_course_id_idx
  on public.fee_obligations (course_id);

commit;
