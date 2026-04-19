create table if not exists public.recommendations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,
  organization text,
  recommendation text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists recommendations_sort_order_idx
on public.recommendations (sort_order, created_at);

alter table public.recommendations enable row level security;

create policy "recommendations_select_authenticated"
on public.recommendations
for select
to authenticated
using (true);

create policy "recommendations_insert_authenticated"
on public.recommendations
for insert
to authenticated
with check (true);

create policy "recommendations_update_authenticated"
on public.recommendations
for update
to authenticated
using (true)
with check (true);

create policy "recommendations_delete_authenticated"
on public.recommendations
for delete
to authenticated
using (true);
