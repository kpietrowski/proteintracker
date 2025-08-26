# Testing Your Protein Tracker App

## Quick Start Test
1. **Start the app**:
   ```bash
   npm start
   ```

2. **Run in simulator**:
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   ```

## Expected Flow in Simulator

### 1. App Startup
- App loads and shows loading screen briefly
- Automatically navigates to onboarding (no auth required)

### 2. Onboarding Flow
- **Screen 1**: "Welcome to Protein Tracker" → Tap Continue
- **Screen 2**: "Screen 2" → Tap Continue  
- **Screen 3**: "Screen 3" → Tap Continue
- **Screen 4**: "Screen 4" → Tap Continue
- **Screen 5**: "Screen 5" → Tap Continue
- **Screen 6**: "Screen 6" → Tap Continue
- **Screen 7**: "Screen 7" → Tap Continue

### 3. Paywall Screen
- Shows "Loading..." briefly
- In simulator (Superwall not available): Auto-navigates to main app after 2 seconds
- With real device + Superwall configured: Shows your paywall

### 4. Main App (3 Tabs)
- **Home Tab**: Shows daily protein progress with circular ring
- **Calendar Tab**: Shows monthly view with color-coded days
- **Profile Tab**: Shows user profile and weekly stats

### 5. Voice Input Test
- Tap "Log Protein" button on Home screen
- Opens voice input modal
- **Note**: Voice input may not work in simulator due to microphone restrictions

## Troubleshooting

### If app crashes on startup:
```bash
# Clear cache and restart
npm start --clear
```

### If navigation errors:
- Check console logs for specific error messages
- Ensure all screen components exist

### If build errors:
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

### If Superwall/RevenueCat errors:
- These are expected in simulator
- Real device testing required for full functionality

## Success Criteria
✅ App starts without crashing
✅ Can navigate through all 7 onboarding screens  
✅ Paywall screen appears (even if simulated)
✅ Main app loads with 3 working tabs
✅ Home screen shows protein tracking UI
✅ Calendar shows monthly view
✅ Profile shows user info

## Next Steps
Once basic navigation works:
1. Replace placeholder onboarding screens with real designs
2. Test on physical device for full functionality
3. Configure Superwall paywall in dashboard
4. Set up Supabase database tables
5. Test voice input on real device