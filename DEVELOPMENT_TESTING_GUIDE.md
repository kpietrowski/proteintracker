# Development Testing Guide for ProteinTracker

## Quick Reference: Testing with Live Updates

### 🎯 One-Time Setup (Development Build)

1. **Create Development Build** (only when native modules change)
   ```bash
   eas build --platform ios --profile development --clear-cache --non-interactive --no-wait
   ```
   - Takes 10-15 minutes
   - Get download link from: https://expo.dev/accounts/katiepietrowski/projects/ProteinTracker/builds

2. **Install on Device**
   - Download the .ipa file from EAS build page
   - Install using Apple Configurator or direct link
   - This is your "custom Expo Go" with native module support

---

## 🔄 Daily Development Process (Live Updates)

### Step 1: Start Development Server
```bash
npx expo start --dev-client
```
**NOT** `npx expo start` (that's for Expo Go)

### Step 2: Connect Device
1. Open the **ProteinTracker** app on your phone (NOT Expo Go)
2. App should auto-connect to development server
3. If not connected, shake device and tap "Reload"

### Step 3: Verify Live Updates Working
- Look for green banner at bottom saying "Connected"
- Any code changes will now update instantly
- No rebuilding needed!

---

## 📱 Build Types Explained

### Development Build (What You Want for Testing)
- **Profile:** `development`
- **Command:** `eas build --platform ios --profile development`
- **Features:** 
  - ✅ Live hot reload
  - ✅ Connects to Metro bundler
  - ✅ See changes instantly
  - ✅ Supports native modules (Superwall, etc.)
- **When to use:** Daily development with live updates

### Preview Build (Static Testing)
- **Profile:** `preview`
- **Command:** `eas build --platform ios --profile preview`
- **Features:**
  - ❌ No live updates
  - ❌ Doesn't connect to dev server
  - ✅ Good for sharing with testers
- **When to use:** Testing fixed version, sharing with others

### Expo Go (Limited Testing)
- **Command:** `npx expo start`
- **Features:**
  - ✅ Live updates
  - ❌ No native module support (Superwall breaks)
- **When to use:** Only for pure JavaScript features

---

## 🚨 Troubleshooting

### Changes Not Appearing?
1. **Check you're using dev client:**
   ```bash
   npx expo start --dev-client  # Correct
   npx expo start               # Wrong (opens in Expo Go)
   ```

2. **Verify connection:**
   - Green banner at bottom of app
   - Terminal shows device connected

3. **Force refresh:**
   - Shake device → "Reload"
   - Or restart: `r` in terminal

### "Module not found" Errors?
- You added/removed a native package
- Need new development build:
  ```bash
  eas build --platform ios --profile development --clear-cache --non-interactive --no-wait
  ```

### Can't Connect to Server?
1. Check same WiFi network
2. Check IP address: 
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```
3. Firewall blocking port 8081?

---

## 📋 When You Need a New Build

### ✅ Live Updates Work For:
- JavaScript/TypeScript changes
- Component changes
- Style updates
- Asset changes (images, fonts)
- Business logic
- API calls
- State management

### ❌ New Build Required For:
- Adding/removing npm packages with native code
- Changing app.json configuration
- Modifying iOS/Android folders
- Updating Expo SDK version
- Changing bundle identifier

---

## 🎯 Current Testing Checklist

- [ ] Install development build
- [ ] Run `npx expo start --dev-client`
- [ ] Open ProteinTracker app (not Expo Go)
- [ ] Verify green "Connected" banner
- [ ] Test bypass button on Congratulations screen
- [ ] Test voice recording modal layout
- [ ] Test haptic feedback
- [ ] Verify hot reload works (make small change)

---

## 📝 Notes

- **Development Server URL:** `exp://10.0.0.42:8081` (changes based on your IP)
- **EAS Builds Page:** https://expo.dev/accounts/katiepietrowski/projects/ProteinTracker/builds
- **Profile in use:** `development` (for live updates)
- **Bundle ID:** `com.protein.proteintracker`

---

## 💡 Pro Tips

1. **Always use `--dev-client` flag** when starting Expo for development builds
2. **Keep terminal visible** to see connection status and errors
3. **One development build can last weeks** unless you change native dependencies
4. **Use preview builds** for App Store or TestFlight distribution
5. **Clear caches if weird issues:** 
   ```bash
   npx expo start --clear
   rm -rf node_modules/.cache
   ```

---

Last Updated: August 27, 2025
Build System: EAS Build
Development Profile: Configured for hot reload with native modules