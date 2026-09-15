create unique index if not exists enrollments_student_course_id_unique
  on public.enrollments (student_id, course_id)
  where course_id is not null;