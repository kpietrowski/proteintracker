# Revenue Cat Setup Guide

## ✅ Configuration Status

### Completed Setup:
1. **IAP Entitlements**: Configured in both `ios/ProteinTracker/ProteinTracker.entitlements` and `app.config.js`
2. **Revenue Cat SDK**: react-native-purchases v9.2.2 installed and linked
3. **StoreKit Framework**: Linked via pod install
4. **Environment Variables**: Placeholders added to `.env` file
5. **Purchase Service**: Implementation in `src/services/purchases.ts`
6. **Superwall Integration**: Working with expo-superwall SDK

### ⚠️ Required Actions:

## 1. Add Revenue Cat API Keys

Add your Revenue Cat public API keys to `.env` file:

```bash
# Get these from https://app.revenuecat.com
REVENUECAT_API_KEY_IOS=appl_xxxxxxxxxxxxxxxxxxxxx
REVENUECAT_API_KEY_ANDROID=goog_xxxxxxxxxxxxxxxxxxxxx
```

**Important**:
- Use PUBLIC keys (start with `appl_` or `goog_`)
- Never use SECRET keys (start with `sk_`)
- Keys can be found in Revenue Cat Dashboard → Project → API Keys

## 2. Configure Products in Revenue Cat

1. Go to Revenue Cat Dashboard → Products
2. Create your subscription products matching your App Store Connect products
3. Create an Offering and add your products
4. The default offering will be used by the app

## 3. Configure App Store Connect

1. Ensure your app has In-App Purchases capability in App Store Connect
2. Create subscription products in App Store Connect
3. Match product IDs with Revenue Cat products

## 4. Build and Test

### Local Development:
```bash
# Clean build
cd ios && rm -rf Pods build && pod install && cd ..

# Run on iOS
npx expo run:ios
```

### TestFlight Testing:
```bash
# Build for TestFlight
eas build --platform ios --profile preview
```

## 5. Testing Purchases

### Sandbox Testing:
1. Create sandbox test users in App Store Connect
2. Sign out of App Store on test device
3. When prompted during purchase, sign in with sandbox account
4. Purchases will use sandbox environment automatically in development/TestFlight

### Verification Checklist:
- [ ] Revenue Cat initializes successfully (check console logs)
- [ ] Offerings load from Revenue Cat
- [ ] Paywall displays with correct products
- [ ] Purchase flow completes successfully
- [ ] Subscription status updates after purchase

## Console Log Indicators

### Success:
```
✅ RevenueCat initialized successfully
✅ RevenueCat iOS key loaded: appl_xxxxx...
```

### Failure:
```
❌ REVENUECAT_API_KEY_IOS is empty or not set
⚠️ RevenueCat initialization failed
```

## Troubleshooting

### Revenue Cat not initializing:
- Check `.env` file has valid API keys
- Verify keys start with `appl_` or `goog_`
- Restart Metro bundler after adding keys

### Products not showing:
- Verify products are configured in Revenue Cat Dashboard
- Check product IDs match between App Store Connect and Revenue Cat
- Ensure offerings are set up with products

### Purchase failing:
- Check sandbox user is signed in (for TestFlight)
- Verify IAP capability in provisioning profile
- Check internet connectivity

## Architecture Overview

```
App.tsx
  ↓ (initializes)
purchaseService.initialize()
  ↓ (configures)
Purchases.configure({ apiKey })
  ↓ (presents)
PaywallScreen.tsx → Superwall SDK
  ↓ (handles)
Revenue Cat Purchase Flow
```

## Environment Variables Flow

```
.env → app.config.js → Constants.expoConfig → config.ts → purchases.ts
```

## Support Links

- [Revenue Cat Documentation](https://docs.revenuecat.com)
- [React Native Purchases SDK](https://github.com/RevenueCat/react-native-purchases)
- [Testing Sandbox Purchases](https://docs.revenuecat.com/docs/sandbox)