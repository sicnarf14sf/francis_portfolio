alter table public.about_page_content
add column if not exists title text,
add column if not exists intro text,
add column if not exists updated_at timestamptz default now();

create table if not exists public.about_outputs (
  id text primary key,
  kind text not null check (kind in ('3d', 'image', 'app')),
  title text not null,
  description text,
  tags jsonb default '[]'::jsonb,
  image_path text,
  image_alt text,
  link_url text,
  model_key text,
  model_path text,
  model_bucket text default 'about',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.about_outputs
add column if not exists model_path text,
add column if not exists model_bucket text default 'about';

alter table public.about_outputs
alter column model_bucket set default 'about';

create index if not exists about_outputs_sort_order_idx
on public.about_outputs (sort_order, created_at);
