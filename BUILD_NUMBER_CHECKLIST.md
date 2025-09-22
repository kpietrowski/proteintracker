# Build Number Update Checklist

## CRITICAL: When updating build numbers, ALL of these files must be updated:

### 1. **app.config.js**
- Location: `/app.config.js`
- Update: `ios.buildNumber` field
- Example: `buildNumber: "50"`

### 2. **Info.plist**
- Location: `/ios/ProteinTracker/Info.plist`
- Update: `CFBundleVersion` value
- Example: `<string>50</string>`
- **⚠️ IMPORTANT**: EAS Build uses this file when native iOS directory exists, NOT app.config.js!

### 3. **project.pbxproj** (if needed)
- Location: `/ios/ProteinTracker.xcodeproj/project.pbxproj`
- Update: `CURRENT_PROJECT_VERSION` values
- Note: Usually auto-updated by Xcode

## Build Process Reminders:

1. **ALWAYS commit and push changes** - EAS Build uses the remote repository, not local files
2. **Check EAS Secrets** - Ensure all API keys are in EAS secrets, not just .env:
   - REVENUECAT_API_KEY_IOS
   - REVENUECAT_API_KEY_ANDROID
   - SUPERWALL_API_KEY
   - OPENAI_API_KEY
   - SUPABASE_URL
   - SUPABASE_ANON_KEY

3. **Verify before building**:
   ```bash
   # Check all build numbers match
   grep buildNumber app.config.js
   grep CFBundleVersion ios/ProteinTracker/Info.plist

   # Ensure changes are committed
   git status
   git push
   ```

## Common Pitfalls to Avoid:
- ❌ Updating only app.config.js when iOS directory exists
- ❌ Forgetting to commit/push before EAS build
- ❌ Having API keys only in local .env instead of EAS secrets
- ❌ Not checking that Info.plist and app.config.js build numbers match

## Quick Command Reference:
```bash
# Start production build
eas build --platform ios --profile production --non-interactive

# Check build status
eas build:list --platform ios --limit 5

# Cancel current build
eas build:cancel
```

Last updated: Build 50 (2025-09-22)