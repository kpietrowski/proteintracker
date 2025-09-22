import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { purchaseService } from '../services/purchases';
import { useOnboarding } from '../context/OnboardingContext';
import { navigationEvents } from '../services/eventEmitter';
import { usePlacement, useSuperwall } from 'expo-superwall';
import { localStorageService } from '../services/localStorage';

export default function PaywallScreen() {
  const navigation = useNavigation();
  const { saveProfileToLocalStorage } = useOnboarding();
  const [hasNavigated, setHasNavigated] = useState(false);
  const [paywallPresented, setPaywallPresented] = useState(false);
  const { setSubscriptionStatus } = useSuperwall();

  // Helper to get timestamp
  const getTimestamp = () => new Date().toISOString().split('T')[1].slice(0, 12);

  // New Expo Superwall SDK implementation with correct API
  const { registerPlacement } = usePlacement({
    onPresent: (info) => {
      console.log(`🎬 [${getTimestamp()}] === NEW SDK: PAYWALL PRESENTED ===`);
      console.log(`🎬 [${getTimestamp()}] Paywall info:`, info);
    },
    onDismiss: async (info, result) => {
      console.log(`📱 [${getTimestamp()}] === NEW SDK: PAYWALL DISMISSED ===`);
      console.log(`📱 [${getTimestamp()}] Dismiss info:`, info);
      console.log(`📱 [${getTimestamp()}] Dismiss result:`, result);
      console.log(`📱 [${getTimestamp()}] hasNavigated status:`, hasNavigated);

      // Check if purchase was successful
      if (result === 'purchased' || result === 'restored') {
        console.log(`💰 [${getTimestamp()}] Purchase/Restore successful! Result: ${result}`);
        if (!hasNavigated) {
          console.log(`✅ [${getTimestamp()}] Navigating after successful purchase/restore`);
          setHasNavigated(true);
          await handlePaywallComplete();
        }
      } else if (!hasNavigated) {
        console.log(`🔄 [${getTimestamp()}] User dismissed paywall without purchase (result: ${result}) - navigating to main app`);
        setHasNavigated(true);
        await handlePaywallComplete();
        console.log(`✅ [${getTimestamp()}] Navigation to main app completed`);
      } else {
        console.log(`⚠️ [${getTimestamp()}] Already navigated, skipping`);
      }
    },
    onError: async (error) => {
      console.error(`❌ [${getTimestamp()}] NEW SDK: Paywall error:`, error);
      console.log(`❌ [${getTimestamp()}] NEW SDK: Paywall failed - navigating to app anyway`);
      if (!hasNavigated) {
        setHasNavigated(true);
        await handlePaywallComplete();
      }
    }
  });

  // Log navigation state
  const logNavigationState = (context: string) => {
    const state = navigation.getState();
    console.log(`📍 [${getTimestamp()}] NAVIGATION STATE (${context}):`, {
      index: state.index,
      routes: state.routes.map(r => r.name),
      currentRoute: state.routes[state.index]?.name,
      hasNavigated
    });
  };

  // Present paywall using new Expo SDK
  const presentPaywallWithNewSDK = async () => {
    try {
      console.log(`🎬 [${getTimestamp()}] === PRESENTING PAYWALL WITH NEW SDK ===`);
      logNavigationState('Before New SDK Present');

      // Ensure purchase service is initialized before presenting paywall
      console.log(`🔧 [${getTimestamp()}] NEW SDK: Ensuring purchase service is initialized...`);
      await purchaseService.initialize();
      console.log(`✅ [${getTimestamp()}] NEW SDK: Purchase service initialized`);

      // Check RevenueCat subscription status and sync with Superwall
      console.log(`🔄 [${getTimestamp()}] NEW SDK: Checking subscription status...`);
      const isSubscribed = await purchaseService.checkSubscriptionStatus();

      // Set Superwall subscription status based on RevenueCat
      const superwallStatus = isSubscribed ? 'ACTIVE' : 'INACTIVE';
      console.log(`📊 [${getTimestamp()}] NEW SDK: Setting Superwall subscription status to: ${superwallStatus}`);

      try {
        // Try different formats to see what works with expo-superwall
        // The error suggests it needs an object, not a string
        await setSubscriptionStatus({ status: superwallStatus });
      } catch (err) {
        console.log(`⚠️ [${getTimestamp()}] NEW SDK: Failed to set subscription status with {status: ...}, trying alternative format`);
        try {
          // Alternative format that might work
          await setSubscriptionStatus({ subscriptionStatus: superwallStatus });
        } catch (err2) {
          console.log(`⚠️ [${getTimestamp()}] NEW SDK: Failed to set subscription status with both formats`);
          console.log(`⚠️ [${getTimestamp()}] NEW SDK: Continuing without setting subscription status`);
        }
      }

      console.log(`🎯 [${getTimestamp()}] NEW SDK: Presenting paywall with placement: onboarding_complete`);

      // Mark that paywall was presented
      setPaywallPresented(true);

      // Present the paywall using new SDK with registerPlacement
      if (registerPlacement) {
        await registerPlacement({
          placement: 'onboarding_complete',
          async feature() {
            // This runs ONLY if user purchases or is already subscribed
            console.log(`✅ [${getTimestamp()}] NEW SDK: Feature callback triggered - user has access`);
            console.log(`💰 [${getTimestamp()}] NEW SDK: Purchase successful OR user already subscribed`);
            console.log(`📊 [${getTimestamp()}] NEW SDK: Current hasNavigated status in feature():`, hasNavigated);

            // Only navigate if we haven't already
            if (!hasNavigated) {
              console.log(`🚀 [${getTimestamp()}] NEW SDK: Navigating from feature callback after successful purchase`);
              setHasNavigated(true);
              await handlePaywallComplete();
              console.log(`✅ [${getTimestamp()}] NEW SDK: Navigation completed from feature callback`);
            } else {
              console.log(`⚠️ [${getTimestamp()}] NEW SDK: Already navigated, skipping navigation in feature callback`);
            }
          }
        });
        console.log(`✅ [${getTimestamp()}] NEW SDK: registerPlacement called successfully`);
      } else {
        console.error(`❌ [${getTimestamp()}] NEW SDK: registerPlacement is not available`);
        // Fallback - navigate anyway
        await handlePaywallComplete();
      }

      logNavigationState('After New SDK Present');

    } catch (error) {
      console.error(`❌ [${getTimestamp()}] NEW SDK: Error presenting paywall:`, error);

      // Navigate anyway if error occurs
      console.log(`⚠️ [${getTimestamp()}] NEW SDK: Error occurred - navigating to app`);
      await handlePaywallComplete();
    }
  };

  useEffect(() => {
    console.log(`🎯 [${getTimestamp()}] PaywallScreen MOUNTED - starting NEW SDK paywall flow`);
    logNavigationState('Component Mount');
    
    // Present paywall using new SDK
    presentPaywallWithNewSDK();
    
    // Cleanup on unmount - new SDK handles its own cleanup
    return () => {
      console.log(`🧹 [${getTimestamp()}] PaywallScreen UNMOUNTING - new SDK cleanup`);
      logNavigationState('Component Unmount');
    };
  }, []); // Run once on mount

  // Disabled auto-fallback - wait for Superwall delegate events
  // useEffect(() => {
  //   if (!isLoading) {
  //     console.log('🚫 PaywallScreen fallback - navigating back immediately');
  //     // Navigate immediately without delay
  //     handlePaywallDismissed();
  //   }
  // }, [isLoading]);

  // REMOVED OLD SDK CODE - No longer needed with expo-superwall

  const handlePaywallComplete = async () => {
    console.log(`✅ [${getTimestamp()}] === HANDLE PAYWALL COMPLETE START ===`);
    logNavigationState('handlePaywallComplete - Start');
    
    // Navigate immediately - Superwall handles its own cleanup
    console.log(`🚀 [${getTimestamp()}] Navigating immediately (no delay)...`);
    
    // NAVIGATION INTEGRITY CHECKS
    console.log(`🔍 [${getTimestamp()}] === NAVIGATION INTEGRITY CHECKS ===`);
    
    // 1. Check navigation object validity
    console.log(`🔍 [${getTimestamp()}] Navigation object exists:`, !!navigation);
    console.log(`🔍 [${getTimestamp()}] Navigation methods available:`, {
      reset: typeof navigation?.reset,
      replace: typeof navigation?.replace,
      navigate: typeof navigation?.navigate,
      goBack: typeof navigation?.goBack,
      getParent: typeof navigation?.getParent,
      getState: typeof navigation?.getState,
    });
    
    // 2. Check current route
    const currentState = navigation.getState();
    const currentRoute = currentState?.routes[currentState.index];
    console.log(`🔍 [${getTimestamp()}] Current route:`, {
      name: currentRoute?.name,
      key: currentRoute?.key,
      params: currentRoute?.params,
    });
    console.log(`🔍 [${getTimestamp()}] Full navigation stack:`, currentState?.routes?.map(r => r.name));
    
    // 3. Check parent navigator
    const parentNav = navigation.getParent();
    console.log(`🔍 [${getTimestamp()}] Parent navigator exists:`, !!parentNav);
    if (parentNav) {
      const parentState = parentNav.getState();
      console.log(`🔍 [${getTimestamp()}] Parent navigator routes:`, parentState?.routes?.map(r => r.name));
      console.log(`🔍 [${getTimestamp()}] Parent navigator current:`, parentState?.routes[parentState.index]?.name);
    }
    
    // 4. Check if we can navigate to MainApp
    console.log(`🔍 [${getTimestamp()}] Checking if MainApp route is accessible...`);
    const canNavigateToMainApp = navigation.canGoBack ? 'Maybe' : 'Unknown';
    console.log(`🔍 [${getTimestamp()}] Can navigate to MainApp:`, canNavigateToMainApp);
    
    try {
      // Save profile to local storage
      console.log(`💾 [${getTimestamp()}] Saving user profile...`);
      await saveProfileToLocalStorage();
      console.log(`✅ [${getTimestamp()}] Profile saved to local storage!`);
      
      // Mark onboarding as complete
      console.log(`🚀 [${getTimestamp()}] Marking onboarding as complete...`);
      await localStorageService.setOnboardingComplete(true);
      console.log(`✅ [${getTimestamp()}] Onboarding marked complete!`);
      
      // EMIT EVENT TO TRIGGER ROOT NAVIGATOR UPDATE
      console.log(`🔄 [${getTimestamp()}] Emitting onboarding-complete event to RootNavigator...`);
      navigationEvents.emitOnboardingComplete();
      console.log(`✅ [${getTimestamp()}] Event emitted`);
      
      // Log final state immediately - no delay needed
      logNavigationState('After emitting event');
      
      // Force UI update by triggering a re-render
      console.log(`🔄 [${getTimestamp()}] Forcing UI update...`);
      setHasNavigated(prev => !prev);
      setHasNavigated(true);
      
    } catch (error) {
      console.error(`❌ [${getTimestamp()}] Error completing onboarding:`, error);
      // Still try to emit event even if save fails
      console.log(`🔄 [${getTimestamp()}] Final fallback - emitting event anyway`);
      try {
        navigationEvents.emitOnboardingComplete();
      } catch (e) {
        console.error(`❌ [${getTimestamp()}] Failed to emit event:`, e);
      }
    }
  };

  // Return an empty white view to keep the screen mounted
  // Superwall handles all the UI
  return (
    <View style={styles.container}>
      {/* Empty container - Superwall shows its own UI */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent', // Transparent to prevent white flash
  },
});