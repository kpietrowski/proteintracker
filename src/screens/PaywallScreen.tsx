import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { purchaseService } from '../services/purchases';
import { colors } from '../constants/colors';

// Conditional import for Superwall
let Superwall: any = null;
try {
  Superwall = require('@superwall/react-native-superwall').default;
} catch (error) {
  console.warn('Superwall not available:', error);
}

export default function PaywallScreen() {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    presentSuperwallPaywall();
  }, []);

  const presentSuperwallPaywall = async () => {
    try {
      // Initialize purchase services if not already done
      await purchaseService.initialize();
      
      // For now, since Superwall isn't working in simulator, 
      // we'll simulate the purchase flow
      console.log('Simulating paywall presentation...');
      
      // Simulate a 2-second paywall presentation
      setTimeout(() => {
        setIsLoading(false);
        // For demo purposes, automatically proceed as if user subscribed
        handleSuccessfulPurchase();
      }, 2000);
      
    } catch (error) {
      console.error('Error presenting paywall:', error);
      setIsLoading(false);
      // Fallback handling if paywall fails
      handlePaywallDismissed();
    }
  };

  const handleSuccessfulPurchase = () => {
    // For simulator/demo purposes, simulate successful subscription
    console.log('Subscription successful - proceeding to phone authentication');
    
    // Navigate to phone authentication to create account
    navigation.navigate('PhoneAuth' as never);
  };

  const handlePaywallDismissed = () => {
    // Handle what happens if user dismisses paywall without subscribing
    // You might want to:
    // 1. Go back to onboarding
    // 2. Show a limited version of the app
    // 3. Show an error message
    // For now, we'll go back to the previous screen
    
    // Optional: You could also try showing the paywall again
    // or navigate to a different screen explaining why subscription is needed
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {isLoading && (
          <>
            <ActivityIndicator size="large" color={colors.primary.teal} />
            <Text style={styles.text}>Loading...</Text>
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
    fontSize: 16,
    color: colors.text.secondary,
  },
});