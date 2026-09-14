-- Keep the catalog link unique per student. The financial identity remains
-- (student_id, course_name); this index only prevents two enrollments pointing at
-- the same catalog course for the same student.
create unique index if not exists enrollments_student_course_id_unique
  on public.enrollments (student_id, course_id)
  where course_id is not null;
