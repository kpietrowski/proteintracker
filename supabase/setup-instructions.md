# Supabase Setup Instructions for ProteinTracker

Follow these steps to set up your Supabase database:

## 1. Access Your Supabase Dashboard

1. Go to [supabase.com](https://supabase.com)
2. Sign in to your account
3. Navigate to your ProteinTracker project

## 2. Run the Database Schema

1. Go to the **SQL Editor** in your Supabase dashboard
2. Create a new query
3. Copy and paste the entire contents of `supabase/schema.sql`
4. Click **Run** to execute the schema

This will create:
- `users` table (extends auth.users)
- `protein_entries` table
- `daily_summaries` table
- Indexes for performance
- Row Level Security (RLS) policies

## 3. Set Up Database Functions

1. In the SQL Editor, create another new query
2. Copy and paste the entire contents of `supabase/functions.sql`
3. Click **Run** to execute the functions

This will create:
- Auto-profile creation trigger for new users
- Daily summary update functions
- Weekly progress function
- Monthly calendar data function

## 4. Enable Authentication

1. Go to **Authentication** → **Settings** in your Supabase dashboard
2. Make sure **Enable email confirmations** is set according to your preference
3. For development, you might want to disable email confirmations

## 5. Test Your Setup

### Test Database Connection
In your app, the connection should work with your existing config:
```typescript
const supabaseUrl = "https://ejwjwedljapgfcquudgq.supabase.co"
const supabaseAnonKey = "your-anon-key"
```

### Test User Creation
Try signing up a new user to test the auto-profile creation.

### Test Data Insertion
Try adding protein entries to verify the daily summary updates work.

## 6. Optional: Seed Data for Testing

If you want to add some test data, run this in the SQL Editor:

```sql
-- Insert a test user (replace with real auth user ID after signup)
-- This is just for reference - actual users are created via auth signup

-- Example protein entries (replace user_id with actual auth.users.id)
INSERT INTO public.protein_entries (user_id, date, amount, description, source) VALUES
  ('YOUR_USER_ID', NOW() - INTERVAL '2 hours', 35.0, 'Chicken breast', 'voice'),
  ('YOUR_USER_ID', NOW() - INTERVAL '5 hours', 25.0, 'Protein shake', 'voice'),
  ('YOUR_USER_ID', NOW() - INTERVAL '8 hours', 20.0, 'Greek yogurt', 'manual');
```

## 7. Security Notes

- RLS is enabled on all tables
- Users can only access their own data
- Auto-profile creation is secure
- All policies are restrictive by default

## 8. Next Steps

After setup:
1. Test user registration in your app
2. Test protein entry creation
3. Verify data appears in dashboard
4. Test the daily summary calculations

## Troubleshooting

### Common Issues:
- **"uuid-ossp extension not found"**: Make sure to run the schema with admin privileges
- **"Permission denied"**: Check that RLS policies are correct
- **"Function not found"**: Ensure functions.sql ran completely without errors

### Useful Queries for Debugging:
```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Check RLS status
SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- View policies
SELECT * FROM pg_policies WHERE schemaname = 'public';
```