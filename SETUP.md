# Protein Tracker Setup Guide

## Overview
Complete React Native protein tracking app with voice input (OpenAI Whisper), database (Supabase), subscriptions (RevenueCat), and paywall (Superwall).

## Prerequisites
- Node.js 18+
- Expo CLI
- iOS Simulator/Android Emulator or physical device
- API keys for all services

## Step 1: API Keys Setup

### 1.1 OpenAI API Key
1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Copy the key (starts with `sk-`)

### 1.2 Supabase Setup
1. Go to https://supabase.com
2. Create a new project
3. Go to Settings > API
4. Copy the URL and anon public key

### 1.3 RevenueCat Setup
1. Go to https://app.revenuecat.com
2. Create a new project
3. Go to API Keys section
4. Copy both iOS and Android keys

### 1.4 Superwall Setup
1. Go to https://superwall.com
2. Create account and project
3. Get your API key from the dashboard
4. Create paywall for "onboarding_complete" placement

## Step 2: Environment Configuration

Create `.env` file in the project root:

```bash
cp .env.example .env
```

Fill in your API keys:

```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-your_openai_api_key_here

# Supabase Configuration
SUPABASE_URL=https://your_project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here

# RevenueCat Configuration
REVENUECAT_API_KEY_IOS=your_ios_key_here
REVENUECAT_API_KEY_ANDROID=your_android_key_here

# Superwall Configuration
SUPERWALL_API_KEY=your_superwall_api_key_here

# App Configuration
APP_ENV=development
```

Also update `app.json` extra section with your keys:

```json
"extra": {
  "OPENAI_API_KEY": "sk-your_key_here",
  "SUPABASE_URL": "https://your_project.supabase.co",
  "SUPABASE_ANON_KEY": "your_key_here",
  "REVENUECAT_API_KEY_IOS": "your_ios_key_here",
  "REVENUECAT_API_KEY_ANDROID": "your_android_key_here",
  "SUPERWALL_API_KEY": "your_superwall_key_here",
  "APP_ENV": "development"
}
```

## Step 3: Database Setup (Supabase)

1. Go to your Supabase project dashboard
2. Go to SQL Editor
3. Run this SQL to create tables:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
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
CREATE TABLE protein_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date TIMESTAMP NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT,
  source TEXT DEFAULT 'manual',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Daily summaries table
CREATE TABLE daily_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_protein DECIMAL(10, 2) NOT NULL,
  goal_protein INTEGER NOT NULL,
  goal_met BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE protein_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_summaries ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can view own entries" ON protein_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own entries" ON protein_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own summaries" ON daily_summaries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own summaries" ON daily_summaries FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## Step 4: Superwall Dashboard Setup

1. Login to Superwall dashboard
2. Create a new paywall campaign
3. Set placement identifier as: `onboarding_complete`
4. Design your paywall UI in their visual editor
5. Connect to RevenueCat products
6. Publish the campaign

## Step 5: RevenueCat Products Setup

1. Login to RevenueCat dashboard
2. Create products/subscriptions:
   - Monthly subscription
   - Annual subscription (recommended)
3. Configure App Store Connect/Google Play Console
4. Link products in Superwall

## Step 6: Install Dependencies & Run

```bash
# Install dependencies (already done)
npm install

# Start the development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android
```

## Step 7: Testing Checklist

### Voice Input Testing
- [ ] Microphone permissions granted
- [ ] Record voice saying "25 grams of protein"
- [ ] Record voice saying "chicken breast"
- [ ] Record voice saying "half cup Greek yogurt"
- [ ] Verify protein amounts are correctly parsed
- [ ] Test approval/rejection flow

### Navigation Testing
- [ ] Onboarding flow (7 screens)
- [ ] Paywall presentation after onboarding
- [ ] Main tab navigation (Home, Calendar, Profile)
- [ ] Voice input modal presentation

### Database Testing
- [ ] User registration
- [ ] User login
- [ ] Protein entry creation
- [ ] Daily summary calculation
- [ ] Monthly calendar data loading

### Subscription Testing
- [ ] Paywall shows after onboarding
- [ ] Purchase flow works
- [ ] App unlocks after subscription
- [ ] Restore purchases works

## Common Issues & Solutions

### Issue: "No OpenAI API key"
- Verify API key in both `.env` and `app.json`
- Ensure key starts with `sk-`

### Issue: "Supabase connection failed"
- Check URL format: `https://yourproject.supabase.co`
- Verify anon key is public, not service role key

### Issue: "Microphone permission denied"
- Check iOS: Settings > ProteinTracker > Microphone
- Check Android: App Settings > Permissions

### Issue: "Paywall not showing"
- Verify Superwall API key
- Check placement ID: `onboarding_complete`
- Ensure campaign is published in Superwall dashboard

### Issue: "Purchase not working"
- Verify RevenueCat keys
- Check App Store Connect configuration
- Test with sandbox account

## App Flow Summary

1. **Onboarding**: 7 screens collecting user info
2. **Paywall**: Superwall presents subscription options
3. **Home Screen**: Daily protein tracking with circular progress
4. **Voice Input**: Tap button → record voice → AI processes → confirm protein amount
5. **Calendar**: Monthly view with color-coded days
6. **Profile**: User settings and weekly stats

## Development Commands

```bash
# Start development server
npm start

# Clear cache
npm start --clear

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

## Next Steps

1. Replace onboarding screens with your Figma designs
2. Customize paywall in Superwall dashboard
3. Test extensively with real devices
4. Configure app store listings
5. Submit for review

## Support

If you encounter issues:
1. Check console logs for error messages
2. Verify all API keys are correct
3. Test on physical device for full functionality
4. Check service dashboards for quota/usage issues