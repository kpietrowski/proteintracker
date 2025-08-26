-- Phone Authentication Setup for Supabase
-- Run this in your Supabase SQL Editor after the main schema

-- Update users table to support phone authentication
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone TEXT UNIQUE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE;

-- Update the handle_new_user function to support phone auth
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id, 
    email, 
    phone,
    name, 
    daily_protein_goal,
    phone_verified
  )
  VALUES (
    NEW.id, 
    COALESCE(NEW.email, ''), 
    COALESCE(NEW.phone, ''),
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    COALESCE((NEW.raw_user_meta_data->>'daily_protein_goal')::INTEGER, 140),
    COALESCE(NEW.phone_confirmed_at IS NOT NULL, FALSE)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user profile with onboarding data
CREATE OR REPLACE FUNCTION public.complete_user_onboarding(
  user_uuid UUID,
  user_name TEXT,
  fitness_goal_val TEXT,
  gender_val TEXT,
  activity_level_val TEXT,
  age_val INTEGER,
  height_ft_val INTEGER DEFAULT NULL,
  height_in_val INTEGER DEFAULT NULL,
  height_cm_val INTEGER DEFAULT NULL,
  weight_lbs_val INTEGER DEFAULT NULL,
  weight_kg_val INTEGER DEFAULT NULL,
  protein_goal_val INTEGER DEFAULT 140
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.users SET
    name = user_name,
    fitness_goal = fitness_goal_val,
    gender = gender_val,
    activity_level = activity_level_val,
    age = age_val,
    height_ft = height_ft_val,
    height_in = height_in_val,
    height_cm = height_cm_val,
    weight_lbs = weight_lbs_val,
    weight_kg = weight_kg_val,
    daily_protein_goal = protein_goal_val,
    onboarding_completed = TRUE,
    updated_at = NOW()
  WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.complete_user_onboarding TO authenticated;