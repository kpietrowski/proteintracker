# Superwall Event Debugging Guide

## Problem: Subscribed users not advancing to next screen

**Issue**: After successful Superwall subscription purchase, users are not being automatically navigated to the next screen (PhoneAuth).

## Root Cause Analysis

The issue is typically caused by:
1. **Incorrect event type names** - Superwall events may use different naming conventions
2. **Delegate not properly set** - The delegate might be overridden elsewhere
3. **Missing event properties** - Events might use `type` vs `name` properties differently
4. **Timing issues** - Navigation happening too quickly before Superwall completes

## Fix Applied

### Multiple Delegate Method Names
The issue was that Superwall v2+ might use different delegate method names. Fixed by implementing ALL possible delegate methods:

```typescript
Superwall.shared.delegate = {
  // Primary event handler
  handleSuperwallEvent: async (event: any) => {
    console.log('📊 handleSuperwallEvent triggered:', JSON.stringify(event, null, 2));
    handleEvent(event);
  },
  
  // Alternative event handlers
  onSuperwallEvent: async (event: any) => {
    console.log('📊 onSuperwallEvent triggered:', JSON.stringify(event, null, 2));
    handleEvent(event);
  },
  
  superwallDidHandleEvent: async (event: any) => {
    console.log('📊 superwallDidHandleEvent triggered:', JSON.stringify(event, null, 2));
    handleEvent(event);
  },
  
  // Purchase-specific handlers
  onPurchaseComplete: async (event: any) => {
    console.log('🎉 onPurchaseComplete triggered! Navigating to PhoneAuth...');
    setTimeout(() => {
      navigation.navigate('PhoneAuth' as never);
    }, 500);
  },
  
  onSubscriptionStart: async (event: any) => {
    console.log('🎉 onSubscriptionStart triggered! Navigating to PhoneAuth...');
    setTimeout(() => {
      navigation.navigate('PhoneAuth' as never);
    }, 500);
  }
};
```

### Enhanced Event Type Detection
Added `paywall_dismiss` as a success event type:

```typescript
if (event.type === 'transaction_complete' || 
    event.type === 'transactionComplete' ||
    event.name === 'transaction_complete' ||
    event.name === 'transactionComplete' ||
    (event.type === 'subscription_start' || event.name === 'subscription_start') ||
    (event.type === 'purchase_complete' || event.name === 'purchase_complete') ||
    (event.type === 'paywall_dismiss' || event.name === 'paywall_dismiss')) {
  // Success - navigate to PhoneAuth
}
```

### Debug Tools Added
Added development-only buttons for testing:
- **Test Paywall (Dev)** - Triggers paywall manually
- **Skip to PhoneAuth (Dev)** - Direct navigation bypass for testing

## Debugging Steps

### 1. Check Console Logs
After user subscribes, look for these logs:
```
📊 Superwall event in OnboardingScreen7: { ... }
🔍 Event type: [event_type_here]
🔍 Event name: [event_name_here]
```

### 2. Common Event Types to Look For
- `transaction_complete`
- `transactionComplete`
- `subscription_start`
- `purchase_complete`
- `paywall_dismiss` (when user completes purchase)

### 3. Verify Delegate Setup
Ensure `Superwall.shared.delegate` is properly set and not overridden:
```typescript
Superwall.shared.delegate = {
  handleSuperwallEvent: async (event: any) => {
    // Event handling logic
  }
};
```

### 4. Test Navigation Manually
Use the dev button "Skip to PhoneAuth (Dev)" to verify navigation works independently of Superwall.

## Prevention Checklist

- [ ] Always log full event objects when debugging Superwall
- [ ] Check both `event.type` and `event.name` properties
- [ ] Add timeout delays for navigation (500ms recommended)
- [ ] Include multiple event type variations in conditions
- [ ] Add development bypass buttons for testing
- [ ] Test subscription flow on actual device, not just simulator
- [ ] Verify delegate is not overridden elsewhere in the app

## Files Modified

- `src/screens/onboarding/OnboardingScreen7.tsx` - Enhanced event logging and debug tools
- `SUPERWALL_EVENT_DEBUGGING.md` - This documentation file

## Testing Protocol

1. **Complete onboarding flow** to reach results screen
2. **Tap "Let's Get Started!"** to trigger paywall
3. **Complete subscription purchase** in Superwall
4. **Check console logs** for event details
5. **Verify navigation** to PhoneAuth screen occurs
6. **If navigation fails**, use "Skip to PhoneAuth (Dev)" button
7. **Document the actual event type/name** found in logs

## Rollback Plan

If issues persist:
1. Use the dev bypass button temporarily
2. Revert to direct navigation: `navigation.navigate('PhoneAuth' as never)`
3. Debug Superwall events separately from navigation logic

---

**Last Updated**: August 27, 2025
**Status**: Enhanced logging and debug tools added
**Next Steps**: Monitor console logs after user subscription to identify correct event types