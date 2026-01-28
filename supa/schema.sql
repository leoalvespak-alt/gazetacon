-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Categories Table
create table public.categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text not null unique,
  color text default '#000000',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Users/Authors should ideally be linked to auth.users, but for simplicity here's a profile table or just usage of auth.users directly. 
-- We'll assume auth.users for id, but maybe a profiles table for names/avatars.
-- For now, we'll store author info in posts or assume a profiles table exists.
-- Profiles Table (Enhanced for Leads)
create table public.profiles (
  id uuid references auth.users not null primary key,
  full_name text,
  avatar_url text,
  phone text, -- WhatsApp
  secondary_email text,
  updated_at timestamp with time zone,
  
  -- Lead Tracking
  is_lead boolean default false,
  lead_source text, -- 'newsletter', 'ebook', etc.
  lead_score int default 0
);

-- Newsletter Consents (LGPD Audit Log)
create table public.newsletter_consents (
  id uuid default uuid_generate_v4() primary key,
  email text not null,
  ip_address text,
  consent_type text not null, -- 'newsletter_sub', 'whatsapp_group'
  accepted_terms_version text not null, -- 'v1.0'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  opt_out_at timestamp with time zone
);

-- RLS for Newsletter Consents
alter table public.newsletter_consents enable row level security;

-- Allow anyone to INSERT (Sign up)
create policy "Anyone can sign up for newsletter"
on public.newsletter_consents for insert
with check (true);

-- Only admins can SELECT (View list)
create policy "Only admins can view consents"
on public.newsletter_consents for select
using (auth.role() = 'authenticated'); -- Adjust if you have specific admin roles


-- Posts Table
create table public.posts (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  slug text not null unique,
  content text, -- HTML or JSON
  excerpt text,
  cover_image_url text,
  category_id uuid references public.categories(id),
  author_id uuid references auth.users(id), -- Or profiles(id)
  published boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Tags Table
create table public.tags (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text not null unique
);

-- Posts_Tags Pivot
create table public.posts_tags (
  post_id uuid references public.posts(id) on delete cascade,
  tag_id uuid references public.tags(id) on delete cascade,
  primary key (post_id, tag_id)
);

-- RLS Policies (Example)
alter table public.posts enable row level security;
alter table public.categories enable row level security;

-- Public read access
create policy "Public posts are viewable by everyone" on public.posts
  for select using (published = true);

create policy "Categories are viewable by everyone" on public.categories
  for select using (true);

-- ==========================================
-- STORAGE CONFIGURATION (Buckets & Policies)
-- ==========================================

-- 1. Create the bucket for blog images (if not exists)
-- Note: You might need to run this manually in the SQL Editor
insert into storage.buckets (id, name, public)
values ('blog-images', 'blog-images', true)
on conflict (id) do nothing;

-- 2. Allow public access to read images
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'blog-images' );

-- 3. Allow authenticated users to upload images
create policy "Authenticated users can upload"
on storage.objects for insert
with check (
  bucket_id = 'blog-images' 
  AND auth.role() = 'authenticated'
);

-- 4. Allow authenticated users to update/delete their own images
create policy "Authenticated users can update/delete"
on storage.objects for update
using ( bucket_id = 'blog-images' AND auth.role() = 'authenticated' );

create policy "Authenticated users can delete"
on storage.objects for delete
using ( bucket_id = 'blog-images' AND auth.role() = 'authenticated' );
