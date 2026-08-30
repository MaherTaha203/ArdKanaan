-- Add an optional national/identity number to students.
--
-- Presentation/identity only — it is NOT a financial field and is NOT part of any
-- balance derivation. Nullable text so existing rows are untouched, and text (not
-- a numeric type) so leading zeros are preserved and the value is never treated as
-- an amount. Student identity is name + id_number + phone; there is no separate
-- invented "student number".

alter table public.students
  add column if not exists id_number text;
