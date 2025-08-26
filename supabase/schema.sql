/* ProteinTracker Database Schema */
/* Run this in your Supabase SQL Editor */

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  daily_protein_goal INTEGER DEFAULT 140,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  subscription_status TEXT DEFAULT 'none' CHECK (subscription_status IN ('none', 'trial', 'active', 'expired')),
  onboarding_completed BOOLEAN DEFAULT FALSE,
  
  -- Onboarding data
  fitness_goal TEXT,
  gender TEXT,
  activity_level TEXT,
  age INTEGER,
  height_ft INTEGER,
  height_in INTEGER,
  height_cm INTEGER,
  weight_lbs INTEGER,
  weight_kg INTEGER
);

-- Protein entries table
CREATE TABLE IF NOT EXISTS public.protein_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  description TEXT,
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'voice')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily summaries table (optional - can be calculated on-the-fly)
CREATE TABLE IF NOT EXISTS public.daily_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_protein DECIMAL(10, 2) NOT NULL DEFAULT 0,
  goal_protein INTEGER NOT NULL,
  goal_met BOOLEAN GENERATED ALWAYS AS (total_protein >= goal_protein) STORED,
  entries_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_protein_entries_user_date ON public.protein_entries(user_id, date);
CREATE INDEX IF NOT EXISTS idx_protein_entries_created_at ON public.protein_entries(created_at);
CREATE INDEX IF NOT EXISTS idx_daily_summaries_user_date ON public.daily_summaries(user_id, date);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.protein_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_summaries ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Protein entries policies
CREATE POLICY "Users can view their own protein entries" ON public.protein_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own protein entries" ON public.protein_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own protein entries" ON public.protein_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own protein entries" ON public.protein_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Daily summaries policies
CREATE POLICY "Users can view their own daily summaries" ON public.daily_summaries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily summaries" ON public.daily_summaries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily summaries" ON public.daily_summaries
  FOR UPDATE USING (auth.uid() = user_id);