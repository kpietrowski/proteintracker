// This file is deprecated - we now use local storage instead of Supabase
// Keeping this file to avoid breaking imports until fully migrated

console.warn('⚠️ supabase.ts is deprecated - use localStorage service instead');

// Stub exports to prevent build errors
export const supabase = null;
export const signUp = () => Promise.reject(new Error('Supabase is disabled'));
export const signIn = () => Promise.reject(new Error('Supabase is disabled'));
export const signOut = () => Promise.reject(new Error('Supabase is disabled'));
export const getUserProfile = () => Promise.reject(new Error('Supabase is disabled'));
export const updateUserProfile = () => Promise.reject(new Error('Supabase is disabled'));
export const addProteinEntry = () => Promise.reject(new Error('Supabase is disabled'));
export const getProteinEntries = () => Promise.reject(new Error('Supabase is disabled'));
export const getDailySummary = () => Promise.reject(new Error('Supabase is disabled'));
export const getMonthlyData = () => Promise.reject(new Error('Supabase is disabled'));
export const initializeTables = () => Promise.reject(new Error('Supabase is disabled'));