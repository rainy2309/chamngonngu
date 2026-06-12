-- Create dictionary_word_suggestions table
CREATE TABLE IF NOT EXISTS public.dictionary_word_suggestions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  term TEXT NOT NULL,
  normalized_term TEXT NOT NULL,
  category TEXT NOT NULL,
  region TEXT NOT NULL DEFAULT 'Chưa xác định',
  difficulty TEXT NOT NULL DEFAULT 'easy',
  meaning TEXT,
  simple_explanation TEXT,
  example TEXT,
  learning_steps TEXT[] DEFAULT '{}'::TEXT[],
  note TEXT,
  video_url TEXT NOT NULL,
  video_path TEXT,
  submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  admin_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.dictionary_word_suggestions ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can insert suggestions
CREATE POLICY "Users can insert suggestions" 
  ON public.dictionary_word_suggestions 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = submitted_by);

-- Policy: Users can view their own suggestions
CREATE POLICY "Users can view own suggestions" 
  ON public.dictionary_word_suggestions 
  FOR SELECT 
  TO authenticated 
  USING (
    auth.uid() = submitted_by OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Admins can update suggestions
CREATE POLICY "Admins can update suggestions" 
  ON public.dictionary_word_suggestions 
  FOR UPDATE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Admins can delete suggestions
CREATE POLICY "Admins can delete suggestions" 
  ON public.dictionary_word_suggestions 
  FOR DELETE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
