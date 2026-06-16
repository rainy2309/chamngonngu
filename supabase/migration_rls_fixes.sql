-- ====================================================================
-- Migration: Fix word_contributions & word_comments RLS policies for Admins
-- Run this in your Supabase SQL Editor
-- ====================================================================

-- 1. Fix SELECT on word_contributions so admins can see pending/rejected submissions
-- We check role = 'admin' directly in the profiles table to avoid any function cache issues
DROP POLICY IF EXISTS "Anyone can view approved contributions" ON public.word_contributions;
CREATE POLICY "Anyone can view approved contributions" ON public.word_contributions
  FOR SELECT USING (
    status = 'approved' 
    OR auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 2. Fix DELETE on word_contributions so admins can delete any contribution
DROP POLICY IF EXISTS "Users can delete own contributions" ON public.word_contributions;
CREATE POLICY "Users can delete own contributions" ON public.word_contributions
  FOR DELETE USING (
    auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 3. Fix DELETE on word_comments so admins can delete any comment
DROP POLICY IF EXISTS "Users can delete own comments" ON public.word_comments;
CREATE POLICY "Users can delete own comments" ON public.word_comments
  FOR DELETE USING (
    auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 4. Fix storage upload policy for sign-videos bucket
-- Previously, only admins could upload. We need all authenticated users to be able to upload contributions.
DROP POLICY IF EXISTS "Admin upload to sign-videos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated upload to sign-videos" ON storage.objects;
CREATE POLICY "Allow authenticated upload to sign-videos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'sign-videos'
    AND auth.role() = 'authenticated'
  );
