-- ============================================
-- Migration: Dictionary Words & Alphabet Media
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Dictionary Words table
create table if not exists public.dictionary_words (
  id uuid primary key default gen_random_uuid(),
  word_key text not null unique,
  word text not null,
  normalized_word text not null,
  first_letter text not null,
  meaning text not null,
  simple_explanation text,
  category text not null,
  region text not null default 'Toàn quốc',
  difficulty text not null default 'easy' check (difficulty in ('easy', 'medium', 'hard')),
  example_sentence text not null,
  description text,
  sign_steps text[] not null default '{}',
  gif_url text,
  video_url text,
  thumbnail_url text,
  source_name text default 'CHẠM Dictionary',
  source_url text,
  related_words text[] not null default '{}',
  is_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_dict_words_category on public.dictionary_words(category);
create index if not exists idx_dict_words_first_letter on public.dictionary_words(first_letter);
create index if not exists idx_dict_words_difficulty on public.dictionary_words(difficulty);
create index if not exists idx_dict_words_normalized on public.dictionary_words(normalized_word);

-- 2. Alphabet Media table (for sign language alphabet videos)
create table if not exists public.alphabet_media (
  id uuid primary key default gen_random_uuid(),
  letter_key text not null unique,
  letter text not null,
  title text not null,
  description text,
  video_url text,
  gif_url text,
  thumbnail_url text,
  instructions text[] default '{}',
  tips text[] default '{}',
  is_verified boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. RLS for dictionary_words
alter table public.dictionary_words enable row level security;

drop policy if exists "Anyone can read dictionary" on public.dictionary_words;
create policy "Anyone can read dictionary"
on public.dictionary_words for select
using (true);

drop policy if exists "Teachers can insert words" on public.dictionary_words;
create policy "Teachers can insert words"
on public.dictionary_words for insert
with check (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('teacher', 'admin')
  )
);

drop policy if exists "Teachers can update words" on public.dictionary_words;
create policy "Teachers can update words"
on public.dictionary_words for update
using (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('teacher', 'admin')
  )
);

drop policy if exists "Teachers can delete words" on public.dictionary_words;
create policy "Teachers can delete words"
on public.dictionary_words for delete
using (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('teacher', 'admin')
  )
);

-- 4. RLS for alphabet_media
alter table public.alphabet_media enable row level security;

drop policy if exists "Anyone can read alphabet" on public.alphabet_media;
create policy "Anyone can read alphabet"
on public.alphabet_media for select
using (true);

drop policy if exists "Teachers can manage alphabet" on public.alphabet_media;
create policy "Teachers can manage alphabet"
on public.alphabet_media for all
using (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('teacher', 'admin')
  )
);

-- 5. Storage bucket for alphabet videos
insert into storage.buckets (id, name, public)
values ('alphabet-videos', 'alphabet-videos', true)
on conflict (id) do nothing;

drop policy if exists "Public read alphabet videos" on storage.objects;
create policy "Public read alphabet videos"
on storage.objects for select
using (bucket_id = 'alphabet-videos');

drop policy if exists "Auth upload alphabet videos" on storage.objects;
create policy "Auth upload alphabet videos"
on storage.objects for insert
with check (
  bucket_id = 'alphabet-videos'
  and auth.role() = 'authenticated'
);

-- 6. Updated_at trigger for dictionary_words
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists dictionary_words_set_updated_at on public.dictionary_words;
create trigger dictionary_words_set_updated_at
before update on public.dictionary_words
for each row execute function public.set_updated_at();

drop trigger if exists alphabet_media_set_updated_at on public.alphabet_media;
create trigger alphabet_media_set_updated_at
before update on public.alphabet_media
for each row execute function public.set_updated_at();

-- 7. Grant explicit permissions to prevent 'permission denied' errors
grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update, delete on public.profiles to anon, authenticated, service_role;
grant select, insert, update, delete on public.dictionary_words to anon, authenticated, service_role;
grant select, insert, update, delete on public.alphabet_media to anon, authenticated, service_role;
grant select, insert, update, delete on public.user_progress to anon, authenticated, service_role;
grant select, insert, update, delete on public.quiz_attempts to anon, authenticated, service_role;
grant select, insert, update, delete on public.word_contributions to anon, authenticated, service_role;
grant select, insert, update, delete on public.word_comments to anon, authenticated, service_role;

-- 8. Lessons table
create table if not exists public.lessons (
  id text primary key,
  topic text not null,
  description text,
  difficulty text not null check (difficulty in ('easy', 'medium', 'hard')),
  word_ids text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.lessons enable row level security;

drop policy if exists "Anyone can read lessons" on public.lessons;
create policy "Anyone can read lessons"
on public.lessons for select
using (true);

drop policy if exists "Teachers can manage lessons" on public.lessons;
create policy "Teachers can manage lessons"
on public.lessons for all
using (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('teacher', 'admin')
  )
);

grant select, insert, update, delete on public.lessons to anon, authenticated, service_role;

drop trigger if exists lessons_set_updated_at on public.lessons;
create trigger lessons_set_updated_at
before update on public.lessons
for each row execute function public.set_updated_at();


