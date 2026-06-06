-- ============================================
-- Migration: Admin Dashboard - Role Fix + New Tables
-- Run this in Supabase SQL Editor AFTER schema.sql and migration_dictionary.sql
-- ============================================

-- =====================
-- 1. FIX ROLE SYSTEM
-- =====================

-- Drop old constraint first so we can update role values
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Convert old roles to user/admin
UPDATE public.profiles SET role = 'user' WHERE role IN ('learner', 'supporter') OR role IS NULL OR role NOT IN ('admin');
UPDATE public.profiles SET role = 'admin' WHERE role = 'teacher';

-- Add new constraint
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('user', 'admin'));
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'user';

-- Fix RLS: User cannot change their own role (recursion-free policies)
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin full access profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Anyone can view profiles
CREATE POLICY "Anyone can view profiles" ON public.profiles
  FOR SELECT USING (true);

-- Users can update their own profile fields
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admins get full access using the SECURITY DEFINER function
CREATE POLICY "Admin full access profiles" ON public.profiles
  FOR ALL USING (public.is_admin());

-- Fix handle_new_user function to default role 'user'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    'user',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE
  SET
    full_name = excluded.full_name,
    avatar_url = excluded.avatar_url,
    updated_at = now();
  -- NOTE: role is NOT updated on conflict - prevents escalation
  RETURN new;
END;
$$;

-- Trigger to prevent non-admins from changing their role
CREATE OR REPLACE FUNCTION public.preserve_profile_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- If role is modified and the actor is not admin, revert role change
  IF NEW.role IS DISTINCT FROM OLD.role AND NOT public.is_admin() THEN
    NEW.role := OLD.role;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_preserve_profile_role ON public.profiles;
CREATE TRIGGER tr_preserve_profile_role
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.preserve_profile_role();

-- =====================
-- 2. ADD STATUS TO EXISTING TABLES
-- =====================

-- Add status to dictionary_words if not exists
DO $$ BEGIN
  ALTER TABLE public.dictionary_words ADD COLUMN status text NOT NULL DEFAULT 'published';
  ALTER TABLE public.dictionary_words ADD CONSTRAINT dict_words_status_check
    CHECK (status IN ('draft', 'published', 'archived'));
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Add status + sort_order to lessons if not exists
DO $$ BEGIN
  ALTER TABLE public.lessons ADD COLUMN status text NOT NULL DEFAULT 'published';
  ALTER TABLE public.lessons ADD CONSTRAINT lessons_status_check
    CHECK (status IN ('draft', 'published'));
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.lessons ADD COLUMN sort_order int NOT NULL DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Add status + display_order to alphabet_media if not exists
DO $$ BEGIN
  ALTER TABLE public.alphabet_media ADD COLUMN status text NOT NULL DEFAULT 'published';
  ALTER TABLE public.alphabet_media ADD CONSTRAINT alphabet_status_check
    CHECK (status IN ('draft', 'published'));
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.alphabet_media ADD COLUMN display_order int NOT NULL DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;


-- =====================
-- 3. NEW TABLES
-- =====================

-- Categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text,
  icon_name text,
  sort_order int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Site Content table (replaces hard-coded Home/About/FAQ)
CREATE TABLE IF NOT EXISTS public.site_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key text NOT NULL UNIQUE,
  title text,
  content jsonb NOT NULL DEFAULT '{}',
  status text DEFAULT 'published' CHECK (status IN ('draft', 'published')),
  updated_by uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Articles table (sign grammar, educational articles)
CREATE TABLE IF NOT EXISTS public.articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  content jsonb NOT NULL DEFAULT '[]',
  icon_name text,
  reading_time text,
  category text DEFAULT 'general',
  sort_order int DEFAULT 0,
  status text DEFAULT 'published' CHECK (status IN ('draft', 'published')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Sign Videos table (detailed video metadata)
CREATE TABLE IF NOT EXISTS public.sign_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  word_key text NOT NULL,
  video_url text NOT NULL,
  storage_path text,
  thumbnail_url text,
  file_size int,
  mime_type text,
  duration real,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  is_primary boolean DEFAULT false,
  uploaded_by uuid REFERENCES public.profiles(id),
  reviewed_by uuid REFERENCES public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sign_videos_word ON public.sign_videos(word_key);
CREATE INDEX IF NOT EXISTS idx_sign_videos_status ON public.sign_videos(status);

-- User Bookmarks table
CREATE TABLE IF NOT EXISTS public.user_bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  word_key text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, word_key)
);

-- =====================
-- 4. RLS POLICIES
-- =====================

-- Helper function: check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Categories RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read active categories" ON public.categories;
DROP POLICY IF EXISTS "Admin manage categories" ON public.categories;
CREATE POLICY "Anyone can read active categories" ON public.categories
  FOR SELECT USING (is_active = true);
CREATE POLICY "Admin manage categories" ON public.categories
  FOR ALL USING (public.is_admin());

-- Site Content RLS
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read published content" ON public.site_content;
DROP POLICY IF EXISTS "Admin manage content" ON public.site_content;
CREATE POLICY "Anyone can read published content" ON public.site_content
  FOR SELECT USING (status = 'published');
CREATE POLICY "Admin manage content" ON public.site_content
  FOR ALL USING (public.is_admin());

-- Articles RLS
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read published articles" ON public.articles;
DROP POLICY IF EXISTS "Admin manage articles" ON public.articles;
CREATE POLICY "Anyone can read published articles" ON public.articles
  FOR SELECT USING (status = 'published');
CREATE POLICY "Admin manage articles" ON public.articles
  FOR ALL USING (public.is_admin());

-- Sign Videos RLS
ALTER TABLE public.sign_videos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view approved videos" ON public.sign_videos;
DROP POLICY IF EXISTS "Auth users can upload videos" ON public.sign_videos;
DROP POLICY IF EXISTS "Admin manage videos" ON public.sign_videos;
CREATE POLICY "Anyone can view approved videos" ON public.sign_videos
  FOR SELECT USING (status = 'approved' OR uploaded_by = auth.uid());
CREATE POLICY "Auth users can upload videos" ON public.sign_videos
  FOR INSERT WITH CHECK (auth.uid() = uploaded_by);
CREATE POLICY "Admin manage videos" ON public.sign_videos
  FOR ALL USING (public.is_admin());

-- User Bookmarks RLS
ALTER TABLE public.user_bookmarks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own bookmarks" ON public.user_bookmarks;
DROP POLICY IF EXISTS "Admin read bookmarks" ON public.user_bookmarks;
CREATE POLICY "Users manage own bookmarks" ON public.user_bookmarks
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admin read bookmarks" ON public.user_bookmarks
  FOR SELECT USING (public.is_admin());

-- Fix dictionary_words RLS to use admin instead of teacher
DROP POLICY IF EXISTS "Teachers can insert words" ON public.dictionary_words;
DROP POLICY IF EXISTS "Teachers can update words" ON public.dictionary_words;
DROP POLICY IF EXISTS "Teachers can delete words" ON public.dictionary_words;
DROP POLICY IF EXISTS "Admin can insert words" ON public.dictionary_words;
DROP POLICY IF EXISTS "Admin can update words" ON public.dictionary_words;
DROP POLICY IF EXISTS "Admin can delete words" ON public.dictionary_words;

CREATE POLICY "Admin can insert words" ON public.dictionary_words
  FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admin can update words" ON public.dictionary_words
  FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admin can delete words" ON public.dictionary_words
  FOR DELETE USING (public.is_admin());

-- Fix alphabet_media RLS
DROP POLICY IF EXISTS "Teachers can manage alphabet" ON public.alphabet_media;
DROP POLICY IF EXISTS "Admin manage alphabet" ON public.alphabet_media;
CREATE POLICY "Admin manage alphabet" ON public.alphabet_media
  FOR ALL USING (public.is_admin());

-- Fix lessons RLS
DROP POLICY IF EXISTS "Teachers can manage lessons" ON public.lessons;
DROP POLICY IF EXISTS "Admin manage lessons" ON public.lessons;
CREATE POLICY "Admin manage lessons" ON public.lessons
  FOR ALL USING (public.is_admin());

-- Fix word_contributions RLS
DROP POLICY IF EXISTS "Teachers can review contributions" ON public.word_contributions;
DROP POLICY IF EXISTS "Admin can review contributions" ON public.word_contributions;
CREATE POLICY "Admin can review contributions" ON public.word_contributions
  FOR UPDATE USING (
    auth.uid() = user_id OR public.is_admin()
  );

-- =====================
-- 5. GRANTS
-- =====================
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_content TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.articles TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sign_videos TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_bookmarks TO anon, authenticated, service_role;

-- Triggers
DROP TRIGGER IF EXISTS site_content_set_updated_at ON public.site_content;
CREATE TRIGGER site_content_set_updated_at
  BEFORE UPDATE ON public.site_content
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS articles_set_updated_at ON public.articles;
CREATE TRIGGER articles_set_updated_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS sign_videos_set_updated_at ON public.sign_videos;
CREATE TRIGGER sign_videos_set_updated_at
  BEFORE UPDATE ON public.sign_videos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =====================
-- 6. STORAGE BUCKETS & POLICIES
-- =====================

-- Create bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('sign-videos', 'sign-videos', true)
ON CONFLICT (id) DO NOTHING;

-- RLS for storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Select policies
DROP POLICY IF EXISTS "Public access to sign-videos" ON storage.objects;
CREATE POLICY "Public access to sign-videos" ON storage.objects
  FOR SELECT USING (bucket_id = 'sign-videos');

-- Insert policies
DROP POLICY IF EXISTS "Admin upload to sign-videos" ON storage.objects;
CREATE POLICY "Admin upload to sign-videos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'sign-videos' AND public.is_admin()
  );

-- Delete policies
DROP POLICY IF EXISTS "Admin delete from sign-videos" ON storage.objects;
CREATE POLICY "Admin delete from sign-videos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'sign-videos' AND public.is_admin()
  );

-- Update policies (Required for upsert)
DROP POLICY IF EXISTS "Admin update sign-videos" ON storage.objects;
CREATE POLICY "Admin update sign-videos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'sign-videos' AND public.is_admin()
  );


