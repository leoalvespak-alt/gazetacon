-- Safe Migration Script for Gazeta dos Concursos (Run this!)

-- 1. Updates to Profiles Table (Lead Tracking)
-- Only adds columns if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'phone') THEN
        ALTER TABLE public.profiles ADD COLUMN phone text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'secondary_email') THEN
        ALTER TABLE public.profiles ADD COLUMN secondary_email text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_lead') THEN
        ALTER TABLE public.profiles ADD COLUMN is_lead boolean default false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'lead_source') THEN
        ALTER TABLE public.profiles ADD COLUMN lead_source text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'lead_score') THEN
        ALTER TABLE public.profiles ADD COLUMN lead_score int default 0;
    END IF;
END $$;

-- 2. Create Newsletter Consents Table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.newsletter_consents (
  id uuid default uuid_generate_v4() primary key,
  email text not null,
  ip_address text,
  consent_type text not null,
  accepted_terms_version text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  opt_out_at timestamp with time zone
);

-- Enable RLS
ALTER TABLE public.newsletter_consents ENABLE ROW LEVEL SECURITY;

-- Handle Policies (Drop first to ensure updates are applied)
DROP POLICY IF EXISTS "Anyone can sign up for newsletter" ON public.newsletter_consents;
DROP POLICY IF EXISTS "Only admins can view consents" ON public.newsletter_consents;

CREATE POLICY "Anyone can sign up for newsletter"
ON public.newsletter_consents FOR INSERT
WITH CHECK (true);

CREATE POLICY "Only admins can view consents"
ON public.newsletter_consents FOR SELECT
USING (auth.role() = 'authenticated');

-- 3. Storage Configuration (Bucket 'blog-images')
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for Storage (Drop to clean up)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update/delete" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;

-- Re-create Storage Policies
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'blog-images' );

CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'blog-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can update"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'blog-images' AND auth.role() = 'authenticated' );

CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
USING ( bucket_id = 'blog-images' AND auth.role() = 'authenticated' );
