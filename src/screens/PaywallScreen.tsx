import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { purchaseService } from '../services/purchases';
import { colors } from '../constants/colors';
import { useOnboarding } from '../context/OnboardingContext';

// Import Superwall properly
import Superwall from '@superwall/react-native-superwall';

export default function PaywallScreen() {
  const navigation = useNavigation();
  const { saveProfileToLocalStorage } = useOnboarding();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('🎯 PaywallScreen mounted - starting paywall flow');
    
    // No callback registration needed - paywall dismissal handled directly in delegate
    presentSuperwallPaywall();
  }, []);

  // Auto-navigate back if we're showing the fallback screen
  useEffect(() => {
    if (!isLoading) {
      console.log('🚫 PaywallScreen fallback displayed - auto-navigating back to congratulations');
      const timer = setTimeout(() => {
        handlePaywallDismissed();
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  const presentSuperwallPaywall = async () => {
    try {
      console.log('🎬 Presenting Superwall paywall...');
      
      // Check if Superwall is initialized
      if (!Superwall.shared) {
        console.error('❌ Superwall.shared not available');
        setIsLoading(false);
        handlePaywallDismissed();
        return;
      }
      
      // Note: Superwall delegate is now handled globally by purchaseService
      // PaywallScreen registers a callback for paywall dismiss events
      
      // Register and present the paywall
      console.log('🎯 Registering Superwall event: onboarding_complete');
      await Superwall.shared.register({ placement: 'onboarding_complete' });
      
      console.log('🎭 Presenting Superwall paywall...');
      // Note: register() typically triggers presentation automatically in Superwall
      
      setIsLoading(false);
      console.log('✅ Superwall paywall presented successfully');
      
    } catch (error) {
      console.error('❌ Error presenting Superwall paywall:', error);
      setIsLoading(false);
      
      // Check if it's a config issue
      if (error?.message?.includes('API key') || error?.message?.includes('configuration')) {
        console.error('🔑 Configuration error - check Superwall API key in environment variables');
      }
      
      // If paywall fails to present, immediately return to congratulations screen
      console.log('🚫 Paywall failed to present - returning to congratulations screen');
      handlePaywallDismissed();
    }
  };

  const handleSuccessfulPurchase = async () => {
    try {
      console.log('Subscription successful - completing onboarding locally');
      
      // Save profile to local storage instead of navigating to phone auth
      await saveProfileToLocalStorage();
      
      console.log('✅ Profile saved to local storage! Onboarding complete - RootNavigator will handle transition to main app...');
      
    } catch (error) {
      console.error('❌ Failed to save profile in PaywallScreen:', error);
      
      // Show user-friendly error
      if (error?.message?.includes('AsyncStorage') || error?.message?.includes('localStorage')) {
        alert('There was an issue saving your data locally. Your subscription is still active. Please restart the app.');
      } else {
        alert('There was an issue completing setup. Your subscription is active. Please try again or contact support.');
      }
      
      // Note: Cannot navigate to main app directly from here since subscription succeeded
      console.log('⚠️ Profile save failed but subscription succeeded - user may need to restart app');
    }
  };

  const handlePaywallDismissed = () => {
    console.log('👋 User dismissed paywall without subscribing - HARD PAYWALL');
    setIsLoading(false);
    
    // Hard paywall - return to Congratulations screen (Final)
    // Users cannot proceed without subscribing
    console.log('🚫 Returning to Congratulations screen - subscription required');
    
    // Navigate back to the Final/Congratulations screen
    navigation.navigate('Final' as never);
  };


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {isLoading ? (
          <>
            <ActivityIndicator size="large" color={colors.primary.teal} />
            <Text style={styles.text}>Loading Paywall...</Text>
          </>
        ) : (
          <>
            <Text style={styles.text}>Returning to congratulations screen...</Text>
            <Text style={styles.subtitle}>
              The paywall could not be displayed. Taking you back.
            </Text>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 10,
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  retryButton: {
    backgroundColor: '#000000',
    borderRadius: 29,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginTop: 20,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});