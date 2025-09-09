# Sandbox Purchase Testing Guide

## Overview
This app now supports sandbox purchase testing for development and TestFlight builds. Sandbox mode is automatically enabled for development/staging environments.

## Sandbox Testing Setup

### 1. App Store Sandbox Test Users
1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Navigate to **Users and Access** → **Sandbox Testers**  
3. Create sandbox test users with unique email addresses
4. Remember the credentials for testing

### 2. iOS Device Setup
1. **Sign out** of the App Store on your test device:
   - Go to **Settings** → **App Store** → **Sign Out**
2. **Do NOT sign back in** - sandbox prompt will appear during testing

### 3. TestFlight Setup
1. TestFlight builds automatically use sandbox environment
2. Sandbox test users work in TestFlight builds
3. No additional setup needed for TestFlight

## Testing Process

### iOS Simulator Testing
```bash
# Run in development mode (sandbox automatic)
npx expo start --ios
```
- Simulator automatically uses sandbox environment
- Purchase flows will use sandbox test data
- RevenueCat customer info updates trigger success callbacks

### TestFlight Testing
1. Install TestFlight build on device
2. Ensure signed out of App Store
3. Complete onboarding to reach paywall
4. Attempt purchase - sandbox login prompt appears
5. Use sandbox test user credentials
6. Purchase should complete and proceed to main app

## Debug Logging

The app includes comprehensive sandbox logging:

### RevenueCat Initialization
```
✅ RevenueCat initialized successfully
🏪 Environment: development  
📱 Sandbox mode: ENABLED (automatic in dev/TestFlight)
🧪 SANDBOX: Ready for sandbox purchase testing
🧪 SANDBOX: Use sandbox test users from App Store Connect
```

### Purchase Attempts
```
💳 Starting purchase for package: premium_monthly
🧪 SANDBOX: Attempting sandbox purchase
🧪 SANDBOX: Package details: { identifier: "premium_monthly", price: "$9.99", title: "Premium Monthly" }
```

### Purchase Success
```
🧪 SANDBOX: ✅ Active entitlements found - purchase successful!
🧪 SANDBOX: Entitlements: ["premium"]
```

### Purchase Errors
```
❌ Purchase error: <error details>
🧪 SANDBOX: Purchase failed with error: { code: 2, message: "..." }
🧪 SANDBOX: Check sandbox test user is signed in to App Store
```

## Troubleshooting

### Common Issues

**"Product not available"**
- Check RevenueCat dashboard product configuration
- Ensure App Store Connect products are created
- Verify bundle identifier matches

**"User not allowed to make purchases"**
- Sign out of App Store completely
- Use valid sandbox test user credentials
- Check sandbox user hasn't exceeded purchase limits

**"Purchase cancelled"**
- Normal behavior when user taps "Cancel"
- App shows fallback options ("Try Again", "Continue Without Purchase")

**No purchase prompt appears**
- Check if still signed into production App Store
- Verify app is running in development/TestFlight mode
- Check console logs for initialization errors

### Debug Steps

1. **Check Environment**:
   ```
   Console should show: 🏪 Environment: development
   ```

2. **Verify RevenueCat Setup**:
   ```
   Console should show: ✅ RevenueCat initialized successfully
   ```

3. **Monitor Purchase Flow**:
   ```
   Look for: 🧪 SANDBOX logs throughout purchase process
   ```

4. **Check Customer Info**:
   ```
   After purchase: 🧪 SANDBOX: Customer info details: {...}
   ```

## Required Configuration

### RevenueCat Dashboard
1. Create subscription products
2. Configure entitlements  
3. Set up offerings for Superwall integration

### App Store Connect
1. Create subscription products (optional for sandbox)
2. Set up sandbox test users
3. Configure app metadata

### Superwall Dashboard  
1. Configure paywall templates
2. Set up placement triggers
3. Connect RevenueCat integration

## Environment Variables
Ensure these are configured in `.env`:
```bash
SUPERWALL_API_KEY=pk_your_superwall_key
REVENUECAT_API_KEY_IOS=appl_your_revenuecat_key
```

## Build Commands

### Development Testing
```bash
npx expo start --ios  # Automatic sandbox mode
```

### TestFlight Build
```bash
eas build --platform ios --profile preview
```

### Production Build  
```bash
eas build --platform ios --profile production
```

## Notes
- Sandbox mode is automatic in development/TestFlight - no manual configuration needed
- Production builds automatically use live App Store environment  
- Sandbox purchases don't charge real money
- Sandbox subscriptions have shorter durations for testing (e.g., 1 week = 3 minutes)