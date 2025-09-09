import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { purchaseService } from '../services/purchases';
import { useOnboarding } from '../context/OnboardingContext';
import { navigationEvents } from '../services/eventEmitter';
import { usePlacement } from 'expo-superwall';
import { localStorageService } from '../services/localStorage';

export default function PaywallScreen() {
  const navigation = useNavigation();
  const { saveProfileToLocalStorage } = useOnboarding();
  const [hasNavigated, setHasNavigated] = useState(false);

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
      
      if (!hasNavigated) {
        console.log(`🔄 [${getTimestamp()}] User dismissed paywall - navigating to main app`);
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
      
      console.log(`🎯 [${getTimestamp()}] NEW SDK: Presenting paywall with placement: onboarding_complete`);
      
      // Present the paywall using new SDK with registerPlacement
      if (registerPlacement) {
        await registerPlacement({
          placement: 'onboarding_complete',
          feature() {
            // This runs if user purchases or is already subscribed
            console.log(`✅ [${getTimestamp()}] NEW SDK: Feature callback - user has access`);
            handlePaywallComplete();
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

  // OLD SDK CODE - KEEPING FOR REFERENCE DURING MIGRATION
  const initializeAndPresentPaywall = async () => {
    try {
      console.log(`🔧 [${getTimestamp()}] PaywallScreen: Ensuring purchase service is initialized...`);
      console.log(`🔧 [${getTimestamp()}] PaywallScreen: purchaseService available:`, !!purchaseService);
      console.log(`🔧 [${getTimestamp()}] PaywallScreen: purchaseService.initialize function:`, typeof purchaseService?.initialize);
      
      await purchaseService.initialize();
      console.log(`✅ [${getTimestamp()}] PaywallScreen: Purchase service initialized, presenting paywall...`);
      
      await presentSuperwallPaywall();
    } catch (error) {
      console.error(`❌ [${getTimestamp()}] PaywallScreen: Failed to initialize purchase service:`, error);
      console.error(`❌ [${getTimestamp()}] PaywallScreen: Error details:`, {
        message: error?.message,
        name: error?.name,
        stack: error?.stack?.split('\n').slice(0, 3).join('\n')
      });
      logNavigationState('Error - Before GoBack');
      // Navigate back to congratulations screen if initialization fails
      navigation.goBack();
      logNavigationState('Error - After GoBack');
    }
  };

  const presentSuperwallPaywall = async () => {
    try {
      console.log(`🎬 [${getTimestamp()}] === PRESENTING SUPERWALL PAYWALL ===`);
      logNavigationState('Before Paywall Present');
      
      // Check Superwall availability
      console.log(`📱 [${getTimestamp()}] Superwall Check:`, {
        superwallImported: !!Superwall,
        superwallShared: !!Superwall?.shared,
        delegateSet: !!Superwall?.shared?.delegate,
        delegateType: typeof Superwall?.shared?.delegate
      });
      
      // Check if Superwall is initialized
      if (!Superwall || !Superwall.shared) {
        console.error(`❌ [${getTimestamp()}] CRITICAL: Superwall not available`);
        console.error(`❌ [${getTimestamp()}] Superwall module:`, !!Superwall);
        console.error(`❌ [${getTimestamp()}] Superwall.shared:`, !!Superwall?.shared);
        
        // Navigate anyway if Superwall is not available
        console.log(`⚠️ [${getTimestamp()}] Fallback: Navigating to app without paywall`);
        await handlePaywallComplete();
        return;
      }
      
      // Don't overwrite the delegate! Just add a listener for navigation
      // The delegate is already set up properly in purchases.ts
      
      // Store original callbacks to restore later
      const originalDismissCallback = (global as any).onPaywallDismiss;
      const originalSuccessCallback = (global as any).onPaywallPurchaseSuccess;
      console.log(`🔧 [${getTimestamp()}] Setting up global callbacks...`);
      console.log(`🔧 [${getTimestamp()}] Original callbacks exist:`, {
        dismiss: !!originalDismissCallback,
        success: !!originalSuccessCallback
      });
      
      // Set up our navigation callbacks with enhanced logging
      (global as any).onPaywallDismiss = async () => {
        console.log(`📱 [${getTimestamp()}] === PAYWALL DISMISS CALLBACK TRIGGERED ===`);
        console.log(`📱 [${getTimestamp()}] hasNavigated status:`, hasNavigated);
        logNavigationState('Dismiss Callback - Before Navigation');
        
        if (!hasNavigated) {
          console.log(`🔄 [${getTimestamp()}] Setting hasNavigated to true`);
          setHasNavigated(true);
          console.log(`🔄 [${getTimestamp()}] Calling handlePaywallComplete...`);
          await handlePaywallComplete();
          console.log(`✅ [${getTimestamp()}] handlePaywallComplete finished`);
        } else {
          console.log(`⚠️ [${getTimestamp()}] Already navigated, skipping`);
        }
      };
      
      (global as any).onPaywallPurchaseSuccess = async () => {
        console.log(`💰 [${getTimestamp()}] === PURCHASE SUCCESS CALLBACK TRIGGERED ===`);
        console.log(`💰 [${getTimestamp()}] hasNavigated status:`, hasNavigated);
        logNavigationState('Success Callback - Before Navigation');
        
        if (!hasNavigated) {
          console.log(`🔄 [${getTimestamp()}] Setting hasNavigated to true`);
          setHasNavigated(true);
          console.log(`🔄 [${getTimestamp()}] Calling handlePaywallComplete...`);
          await handlePaywallComplete();
          console.log(`✅ [${getTimestamp()}] handlePaywallComplete finished`);
        } else {
          console.log(`⚠️ [${getTimestamp()}] Already navigated, skipping`);
        }
      };
      
      // Mark that paywall was presented
      setPaywallPresented(true);
      
      // Present the paywall - let Superwall handle ALL gating logic
      console.log(`🎯 [${getTimestamp()}] Presenting Superwall paywall: onboarding_complete`);
      console.log(`📝 [${getTimestamp()}] Gating is controlled by Superwall dashboard settings`);
      console.log(`⏳ [${getTimestamp()}] Waiting for user action on paywall...`);
      
      console.log(`🔄 [${getTimestamp()}] Calling Superwall.shared.register()...`);
      console.log(`🔄 [${getTimestamp()}] Current delegate exists:`, !!Superwall.shared.delegate);
      
      await Superwall.shared.register({ 
        placement: 'onboarding_complete'
      });
      
      console.log(`✅ [${getTimestamp()}] Superwall.register() completed`);
      console.log(`✅ [${getTimestamp()}] Delegate after register:`, !!Superwall.shared.delegate);
      console.log(`⏳ [${getTimestamp()}] Waiting for user action on paywall...`);
      logNavigationState('After Superwall Register');
      
      // DO NOT navigate immediately - wait for Superwall events
      // The delegate will handle navigation when paywall is dismissed
      
    } catch (error) {
      console.error(`❌ [${getTimestamp()}] Error presenting Superwall paywall:`, error);
      
      // Check if it's a config issue
      if (error?.message?.includes('API key') || error?.message?.includes('configuration')) {
        console.error(`🔑 [${getTimestamp()}] Configuration error - check Superwall API key in environment variables`);
      }
      
      // If paywall fails, still navigate to app
      console.log(`❌ [${getTimestamp()}] Paywall failed to present - navigating to app anyway`);
      logNavigationState('Error - Before Fallback Navigation');
      await handlePaywallComplete();
    }
  };

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