-- Silent Bridge Supabase schema
-- Run this file in the Supabase SQL editor for your project.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'learner' check (role in ('learner', 'supporter', 'teacher')),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  word_id text not null,
  status text not null check (status in ('learned', 'review')),
  last_seen_at timestamptz not null default now(),
  unique (user_id, word_id)
);

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null,
  score integer not null check (score >= 0 and score <= 100),
  total_questions integer not null check (total_questions > 0),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.user_progress enable row level security;
alter table public.quiz_attempts enable row level security;

drop policy if exists "Users can select own profile" on public.profiles;
create policy "Anyone can select profiles"
on public.profiles for select
using (true);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
on public.profiles for insert
with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Users can delete own profile" on public.profiles;
create policy "Users can delete own profile"
on public.profiles for delete
using (auth.uid() = id);

drop policy if exists "Users can select own progress" on public.user_progress;
create policy "Users can select own progress"
on public.user_progress for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own progress" on public.user_progress;
create policy "Users can insert own progress"
on public.user_progress for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own progress" on public.user_progress;
create policy "Users can update own progress"
on public.user_progress for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own progress" on public.user_progress;
create policy "Users can delete own progress"
on public.user_progress for delete
using (auth.uid() = user_id);

drop policy if exists "Users can select own quiz attempts" on public.quiz_attempts;
create policy "Users can select own quiz attempts"
on public.quiz_attempts for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own quiz attempts" on public.quiz_attempts;
create policy "Users can insert own quiz attempts"
on public.quiz_attempts for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own quiz attempts" on public.quiz_attempts;
create policy "Users can update own quiz attempts"
on public.quiz_attempts for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own quiz attempts" on public.quiz_attempts;
create policy "Users can delete own quiz attempts"
on public.quiz_attempts for delete
using (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    coalesce(nullif(new.raw_user_meta_data ->> 'role', ''), 'learner'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do update
  set
    full_name = excluded.full_name,
    role = excluded.role,
    avatar_url = excluded.avatar_url,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Word Contributions table for community video uploads
create table if not exists public.word_contributions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  word_id text not null,
  word_text text not null,
  video_url text not null,
  description text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

-- Word Comments table for dictionary explanations
create table if not exists public.word_comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  word_id text not null,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS policies for word_contributions
alter table public.word_contributions enable row level security;

drop policy if exists "Anyone can view approved contributions" on public.word_contributions;
create policy "Anyone can view approved contributions"
on public.word_contributions for select
using (status = 'approved' or auth.uid() = user_id);

drop policy if exists "Authenticated users can insert contributions" on public.word_contributions;
create policy "Authenticated users can insert contributions"
on public.word_contributions for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own contributions" on public.word_contributions;
create policy "Users can delete own contributions"
on public.word_contributions for delete
using (auth.uid() = user_id);

drop policy if exists "Teachers can review contributions" on public.word_contributions;
create policy "Teachers can review contributions"
on public.word_contributions for update
using (
  auth.uid() = user_id
  or exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'teacher'
  )
);

-- RLS policies for word_comments
alter table public.word_comments enable row level security;

drop policy if exists "Anyone can view comments" on public.word_comments;
create policy "Anyone can view comments"
on public.word_comments for select
using (true);

drop policy if exists "Authenticated users can insert comments" on public.word_comments;
create policy "Authenticated users can insert comments"
on public.word_comments for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own comments" on public.word_comments;
create policy "Users can delete own comments"
on public.word_comments for delete
using (auth.uid() = user_id);

drop policy if exists "Users can update own comments" on public.word_comments;
create policy "Users can update own comments"
on public.word_comments for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Storage bucket configuration for video contributions
insert into storage.buckets (id, name, public)
values ('sign-videos', 'sign-videos', true)
on conflict (id) do nothing;

drop policy if exists "Public Access" on storage.objects;
create policy "Public Access"
on storage.objects for select
using (bucket_id = 'sign-videos');

drop policy if exists "Allow Authenticated Upload" on storage.objects;
create policy "Allow Authenticated Upload"
on storage.objects for insert
with check (
  bucket_id = 'sign-videos'
  and auth.role() = 'authenticated'
);


