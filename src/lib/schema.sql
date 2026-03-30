-- StemmeBox Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Businesses
create table if not exists businesses (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  org_number text,
  created_at timestamptz default now()
);

-- Members (links users to businesses)
create table if not exists members (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  business_id uuid not null references businesses(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner', 'admin', 'member')),
  created_at timestamptz default now(),
  unique(user_id, business_id)
);

-- Locations
create table if not exists locations (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references businesses(id) on delete cascade,
  name text not null,
  address text,
  slug text unique not null,
  qr_code_url text,
  created_at timestamptz default now()
);

-- Recordings
create table if not exists recordings (
  id uuid primary key default uuid_generate_v4(),
  location_id uuid not null references locations(id) on delete cascade,
  audio_url text not null,
  transcript text,
  duration_seconds integer,
  language text default 'no',
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  created_at timestamptz default now()
);

-- Analyses
create table if not exists analyses (
  id uuid primary key default uuid_generate_v4(),
  recording_id uuid unique not null references recordings(id) on delete cascade,
  overall_sentiment text not null check (overall_sentiment in ('positive', 'neutral', 'negative')),
  sentiment_score real not null check (sentiment_score >= 0 and sentiment_score <= 1),
  summary text,
  created_at timestamptz default now()
);

-- Analysis Categories
create table if not exists analysis_categories (
  id uuid primary key default uuid_generate_v4(),
  analysis_id uuid not null references analyses(id) on delete cascade,
  category text not null check (category in ('food', 'service', 'atmosphere', 'price', 'other')),
  sentiment text not null check (sentiment in ('positive', 'neutral', 'negative')),
  excerpt text,
  created_at timestamptz default now()
);

-- Plans
create table if not exists plans (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid unique not null references businesses(id) on delete cascade,
  plan_type text not null default 'free' check (plan_type in ('free', 'pro', 'business')),
  status text not null default 'active' check (status in ('active', 'canceled', 'past_due')),
  stripe_subscription_id text,
  created_at timestamptz default now()
);

-- ============================================================
-- Row Level Security Policies
-- ============================================================

alter table businesses enable row level security;
alter table members enable row level security;
alter table locations enable row level security;
alter table recordings enable row level security;
alter table analyses enable row level security;
alter table analysis_categories enable row level security;
alter table plans enable row level security;

-- Businesses: members can read their own businesses
create policy "Members can read own business"
  on businesses for select
  using (id in (select business_id from members where user_id = auth.uid()));

create policy "Owners can update own business"
  on businesses for update
  using (id in (select business_id from members where user_id = auth.uid() and role = 'owner'));

create policy "Authenticated users can create businesses"
  on businesses for insert
  to authenticated
  with check (true);

-- Members: users can read their own memberships
create policy "Users can read own memberships"
  on members for select
  using (user_id = auth.uid());

create policy "Users can insert own membership"
  on members for insert
  to authenticated
  with check (user_id = auth.uid());

-- Locations: members can read locations for their businesses
create policy "Members can read locations"
  on locations for select
  using (business_id in (select business_id from members where user_id = auth.uid()));

create policy "Members can manage locations"
  on locations for insert
  to authenticated
  with check (business_id in (select business_id from members where user_id = auth.uid()));

-- Recordings: public insert (anonymous), members can read their business recordings
create policy "Anyone can insert recordings"
  on recordings for insert
  to anon, authenticated
  with check (true);

create policy "Members can read own business recordings"
  on recordings for select
  using (location_id in (
    select l.id from locations l
    join members m on m.business_id = l.business_id
    where m.user_id = auth.uid()
  ));

create policy "Members can delete own business recordings"
  on recordings for delete
  using (location_id in (
    select l.id from locations l
    join members m on m.business_id = l.business_id
    where m.user_id = auth.uid()
  ));

-- Analyses: members can read analyses for their recordings
create policy "Members can read own analyses"
  on analyses for select
  using (recording_id in (
    select r.id from recordings r
    join locations l on l.id = r.location_id
    join members m on m.business_id = l.business_id
    where m.user_id = auth.uid()
  ));

-- Analysis Categories: same as analyses
create policy "Members can read own categories"
  on analysis_categories for select
  using (analysis_id in (
    select a.id from analyses a
    join recordings r on r.id = a.recording_id
    join locations l on l.id = r.location_id
    join members m on m.business_id = l.business_id
    where m.user_id = auth.uid()
  ));

-- Plans: members can read their plan
create policy "Members can read own plan"
  on plans for select
  using (business_id in (select business_id from members where user_id = auth.uid()));

-- ============================================================
-- Storage Bucket for recordings
-- ============================================================

insert into storage.buckets (id, name, public)
values ('recordings', 'recordings', true)
on conflict (id) do nothing;

-- Allow anonymous uploads to recordings bucket
create policy "Anyone can upload recordings"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'recordings');

-- Allow public read of recordings
create policy "Public read recordings"
  on storage.objects for select
  using (bucket_id = 'recordings');

-- Allow authenticated users to delete their business recordings
create policy "Authenticated delete recordings"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'recordings');
