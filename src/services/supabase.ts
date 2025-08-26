import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { config } from './config';
import { User, ProteinEntry, DailySummary } from '../types';

const supabaseUrl = config.supabase.url;
const supabaseAnonKey = config.supabase.anonKey;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Auth functions
export const signUp = async (email: string, password: string, name: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        daily_protein_goal: 120,
      },
    },
  });
  
  if (error) throw error;
  return data;
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// User profile functions
export const getUserProfile = async (userId: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
  
  return data;
};

export const updateUserProfile = async (userId: string, updates: Partial<User>) => {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId);
  
  if (error) throw error;
  return data;
};

// Protein entry functions
export const addProteinEntry = async (entry: Omit<ProteinEntry, 'id' | 'createdAt'>) => {
  const { data, error } = await supabase
    .from('protein_entries')
    .insert([{
      user_id: entry.userId,
      date: entry.date,
      amount: entry.amount,
      description: entry.description,
      source: entry.source,
    }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const getProteinEntries = async (userId: string, date: Date): Promise<ProteinEntry[]> => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  const { data, error } = await supabase
    .from('protein_entries')
    .select('*')
    .eq('user_id', userId) // Fixed column name
    .gte('date', startOfDay.toISOString())
    .lte('date', endOfDay.toISOString())
    .order('created_at', { ascending: false }); // Fixed column name
  
  if (error) {
    console.error('Error fetching protein entries:', error);
    return [];
  }
  
  return data || [];
};

export const getDailySummary = async (userId: string, date: Date): Promise<DailySummary> => {
  const entries = await getProteinEntries(userId, date);
  const user = await getUserProfile(userId);
  
  const totalProtein = entries.reduce((sum, entry) => sum + entry.amount, 0);
  const goalProtein = user?.dailyProteinGoal || 120;
  
  return {
    date,
    totalProtein,
    goalProtein,
    entries,
    percentageComplete: (totalProtein / goalProtein) * 100,
    remainingProtein: Math.max(0, goalProtein - totalProtein),
  };
};

export const getMonthlyData = async (userId: string, year: number, month: number) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  
  const { data, error } = await supabase
    .from('daily_summaries')
    .select('*')
    .eq('user_id', userId) // Fixed column name
    .gte('date', startDate.toISOString())
    .lte('date', endDate.toISOString());
  
  if (error) {
    console.error('Error fetching monthly data:', error);
    return [];
  }
  
  return data || [];
};

// Initialize database tables (run once)
export const initializeTables = async () => {
  // This would typically be done via Supabase dashboard or migrations
  // Including here for reference
  const tables = `
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      daily_protein_goal INTEGER DEFAULT 120,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      subscription_status TEXT DEFAULT 'none',
      onboarding_completed BOOLEAN DEFAULT FALSE
    );
    
    -- Protein entries table
    CREATE TABLE IF NOT EXISTS protein_entries (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      date TIMESTAMP NOT NULL,
      amount DECIMAL(10, 2) NOT NULL,
      description TEXT,
      source TEXT DEFAULT 'manual',
      created_at TIMESTAMP DEFAULT NOW()
    );
    
    -- Daily summaries table (materialized view or calculated)
    CREATE TABLE IF NOT EXISTS daily_summaries (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      date DATE NOT NULL,
      total_protein DECIMAL(10, 2) NOT NULL,
      goal_protein INTEGER NOT NULL,
      goal_met BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_id, date)
    );
  `;
};