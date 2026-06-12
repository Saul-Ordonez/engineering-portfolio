create extension if not exists "pgcrypto";

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  course text not null,
  tools text[] not null default '{}',
  description text not null,
  notes text not null default '',
  image_urls text[] not null default '{}',
  video_urls text[] not null default '{}',
  cover_image_url text not null default '',
  featured boolean not null default false,
  display_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.projects
  add column if not exists notes text not null default '',
  add column if not exists image_urls text[] not null default '{}',
  add column if not exists video_urls text[] not null default '{}',
  add column if not exists cover_image_url text not null default '';

alter table public.projects enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.projects to anon;
grant select, insert, update, delete on public.projects to authenticated;

insert into storage.buckets (id, name, public)
values ('project-media', 'project-media', true)
on conflict (id) do update set public = true;

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists projects_set_updated_at on public.projects;

create trigger projects_set_updated_at
before update on public.projects
for each row
execute function public.set_updated_at();

drop policy if exists "Published projects are public" on public.projects;
drop policy if exists "Only admin can insert projects" on public.projects;
drop policy if exists "Only admin can update projects" on public.projects;
drop policy if exists "Only admin can delete projects" on public.projects;
drop policy if exists "Project media is public" on storage.objects;
drop policy if exists "Only admin can upload project media" on storage.objects;
drop policy if exists "Only admin can update project media" on storage.objects;
drop policy if exists "Only admin can delete project media" on storage.objects;

create policy "Published projects are public"
on public.projects
for select
using (is_published = true or auth.jwt() ->> 'email' = 'sauleordonez@gmail.com');

create policy "Only admin can insert projects"
on public.projects
for insert
with check (auth.jwt() ->> 'email' = 'sauleordonez@gmail.com');

create policy "Only admin can update projects"
on public.projects
for update
using (auth.jwt() ->> 'email' = 'sauleordonez@gmail.com')
with check (auth.jwt() ->> 'email' = 'sauleordonez@gmail.com');

create policy "Only admin can delete projects"
on public.projects
for delete
using (auth.jwt() ->> 'email' = 'sauleordonez@gmail.com');

create policy "Project media is public"
on storage.objects
for select
using (bucket_id = 'project-media');

create policy "Only admin can upload project media"
on storage.objects
for insert
with check (
  bucket_id = 'project-media'
  and auth.jwt() ->> 'email' = 'sauleordonez@gmail.com'
);

create policy "Only admin can update project media"
on storage.objects
for update
using (
  bucket_id = 'project-media'
  and auth.jwt() ->> 'email' = 'sauleordonez@gmail.com'
)
with check (
  bucket_id = 'project-media'
  and auth.jwt() ->> 'email' = 'sauleordonez@gmail.com'
);

create policy "Only admin can delete project media"
on storage.objects
for delete
using (
  bucket_id = 'project-media'
  and auth.jwt() ->> 'email' = 'sauleordonez@gmail.com'
);

insert into public.projects (
  slug,
  title,
  course,
  tools,
  description,
  featured,
  display_order,
  is_published
)
values
  (
    'rgb-led-system',
    'Microcontroller Lab: RGB LED System',
    'ENGR 151',
    array['Raspberry Pi Pico', 'MicroPython', 'PWM', 'VS Code'],
    'Built and programmed an RGB LED circuit using pulse-width modulation to control color and brightness through code.',
    true,
    1,
    true
  ),
  (
    'thermistor-temperature-monitor',
    'Thermistor Temperature Monitor',
    'ENGR 151',
    array['Voltage Divider', 'ADC', 'Python', 'Circuit Analysis'],
    'Used a thermistor and voltage divider circuit to read changing temperature values and trigger status LEDs based on set points.',
    true,
    2,
    true
  ),
  (
    'cad-design-practice',
    'CAD Design Practice',
    'Engineering Graphics / Personal Practice',
    array['CAD', '3D Modeling', 'Technical Drawings'],
    'Created mechanical-style models and drawings to practice dimensioning, visualization, and design communication.',
    true,
    3,
    true
  )
on conflict (slug) do nothing;
