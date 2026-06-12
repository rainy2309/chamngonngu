-- ============================================
-- Migration: Community Features
-- Adds parent_id to word_comments (for replies)
-- Creates comment_reactions table (for reactions)
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Add parent_id column to word_comments for reply support
DO $$ BEGIN
  ALTER TABLE public.word_comments 
    ADD COLUMN parent_id uuid REFERENCES public.word_comments(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_word_comments_parent ON public.word_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_word_comments_word ON public.word_comments(word_id);

-- 2. Create comment_reactions table
CREATE TABLE IF NOT EXISTS public.comment_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id uuid NOT NULL REFERENCES public.word_comments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reaction_type text NOT NULL CHECK (reaction_type IN ('like', 'heart', 'laugh')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(comment_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_comment_reactions_comment ON public.comment_reactions(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_reactions_user ON public.comment_reactions(user_id);

-- 3. RLS for comment_reactions
ALTER TABLE public.comment_reactions ENABLE ROW LEVEL SECURITY;

-- Anyone can view reactions
DROP POLICY IF EXISTS "Anyone can view reactions" ON public.comment_reactions;
CREATE POLICY "Anyone can view reactions" ON public.comment_reactions
  FOR SELECT USING (true);

-- Authenticated users can insert their own reactions
DROP POLICY IF EXISTS "Users can insert own reactions" ON public.comment_reactions;
CREATE POLICY "Users can insert own reactions" ON public.comment_reactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own reactions (change reaction type)
DROP POLICY IF EXISTS "Users can update own reactions" ON public.comment_reactions;
CREATE POLICY "Users can update own reactions" ON public.comment_reactions
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own reactions
DROP POLICY IF EXISTS "Users can delete own reactions" ON public.comment_reactions;
CREATE POLICY "Users can delete own reactions" ON public.comment_reactions
  FOR DELETE USING (auth.uid() = user_id);

-- Admins can manage all reactions
DROP POLICY IF EXISTS "Admin manage reactions" ON public.comment_reactions;
CREATE POLICY "Admin manage reactions" ON public.comment_reactions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 4. Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.comment_reactions TO anon, authenticated, service_role;
