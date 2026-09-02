-- Enforce the one-row Owner identity invariant at the database level.
create unique index if not exists owner_identity_singleton_idx
  on public.owner_identity (singleton);
