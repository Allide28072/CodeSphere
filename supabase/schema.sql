-- Portfolio schema for Supabase.
-- Run this in the Supabase SQL editor (or with the Supabase CLI) before signing in.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.site_profile (
  id integer primary key default 1 check (id = 1),
  full_name text not null default '',
  professional_title text not null default '',
  headline text not null default '',
  intro text not null default '',
  biography text not null default '',
  approach text not null default '',
  goals text not null default '',
  email text not null default '',
  location text not null default '',
  github_url text not null default '',
  linkedin_url text not null default '',
  instagram_url text not null default '',
  avatar_url text not null default '',
  resume_url text not null default '',
  availability text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.site_profile (id)
values (1)
on conflict (id) do nothing;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (category, name)
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  summary text not null default '',
  description text not null default '',
  category text not null default '',
  technologies text[] not null default '{}',
  features text[] not null default '{}',
  status text not null default 'completed'
    check (status in ('completed', 'in-progress', 'planned')),
  published boolean not null default false,
  featured boolean not null default false,
  thumbnail_url text,
  live_url text,
  github_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_media (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  url text not null,
  storage_path text,
  media_type text not null default 'image'
    check (media_type in ('image', 'video')),
  alt_text text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists project_media_project_id_idx
  on public.project_media (project_id);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null default '',
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users where user_id = auth.uid()
  );
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists site_profile_set_updated_at on public.site_profile;
create trigger site_profile_set_updated_at
  before update on public.site_profile
  for each row execute function public.set_updated_at();

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------

alter table public.site_profile enable row level security;
alter table public.categories enable row level security;
alter table public.skills enable row level security;
alter table public.projects enable row level security;
alter table public.project_media enable row level security;
alter table public.contact_messages enable row level security;
alter table public.admin_users enable row level security;

drop policy if exists "Profile is publicly readable" on public.site_profile;
create policy "Profile is publicly readable"
  on public.site_profile for select
  using (true);

drop policy if exists "Admins manage the profile" on public.site_profile;
create policy "Admins manage the profile"
  on public.site_profile for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Categories are publicly readable" on public.categories;
create policy "Categories are publicly readable"
  on public.categories for select
  using (true);

drop policy if exists "Admins manage categories" on public.categories;
create policy "Admins manage categories"
  on public.categories for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Skills are publicly readable" on public.skills;
create policy "Skills are publicly readable"
  on public.skills for select
  using (true);

drop policy if exists "Admins manage skills" on public.skills;
create policy "Admins manage skills"
  on public.skills for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Published projects are publicly readable" on public.projects;
create policy "Published projects are publicly readable"
  on public.projects for select
  using (published = true);

drop policy if exists "Admins manage projects" on public.projects;
create policy "Admins manage projects"
  on public.projects for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Media for published projects is publicly readable" on public.project_media;
create policy "Media for published projects is publicly readable"
  on public.project_media for select
  using (
    exists (
      select 1 from public.projects
      where projects.id = project_media.project_id
        and projects.published = true
    )
  );

drop policy if exists "Admins manage project media" on public.project_media;
create policy "Admins manage project media"
  on public.project_media for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Anyone can send a contact message" on public.contact_messages;
create policy "Anyone can send a contact message"
  on public.contact_messages for insert
  with check (true);

drop policy if exists "Admins manage contact messages" on public.contact_messages;
create policy "Admins manage contact messages"
  on public.contact_messages for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can view admin users" on public.admin_users;
create policy "Admins can view admin users"
  on public.admin_users for select
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Grants (RLS still applies)
-- ---------------------------------------------------------------------------

grant usage on schema public to anon, authenticated;

grant select on public.site_profile, public.categories, public.skills,
  public.projects, public.project_media to anon, authenticated;

grant insert on public.contact_messages to anon, authenticated;

grant select, insert, update, delete on public.site_profile, public.categories,
  public.skills, public.projects, public.project_media, public.contact_messages,
  public.admin_users to authenticated;

grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Storage
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('project-media', 'project-media', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Project media is publicly readable" on storage.objects;
create policy "Project media is publicly readable"
  on storage.objects for select
  using (bucket_id = 'project-media');

drop policy if exists "Admins can upload project media" on storage.objects;
create policy "Admins can upload project media"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'project-media' and public.is_admin());

drop policy if exists "Admins can update project media" on storage.objects;
create policy "Admins can update project media"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'project-media' and public.is_admin())
  with check (bucket_id = 'project-media' and public.is_admin());

drop policy if exists "Admins can delete project media" on storage.objects;
create policy "Admins can delete project media"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'project-media' and public.is_admin());
