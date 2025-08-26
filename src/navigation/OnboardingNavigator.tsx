import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { OnboardingStackParamList } from '../types';

// Original 7-screen onboarding flow
import OnboardingScreen1 from '../screens/onboarding/OnboardingScreen1'; // Welcome
import OnboardingScreen2 from '../screens/onboarding/OnboardingScreen2'; // Gender  
import OnboardingScreen3 from '../screens/onboarding/OnboardingScreen3'; // ActivityLevel
import OnboardingScreen4 from '../screens/onboarding/OnboardingScreen4'; // Age
import OnboardingScreen5 from '../screens/onboarding/OnboardingScreen5'; // Height
import OnboardingScreen6 from '../screens/onboarding/OnboardingScreen6'; // Weight
import OnboardingScreen7 from '../screens/onboarding/OnboardingScreen7'; // Final

// Auth screens
import PaywallScreen from '../screens/PaywallScreen';
import PhoneAuthScreen from '../screens/auth/PhoneAuthScreen';
import CodeVerificationScreen from '../screens/auth/CodeVerificationScreen';
import { OnboardingProvider } from '../context/OnboardingContext';

const Stack = createStackNavigator<OnboardingStackParamList>();

export default function OnboardingNavigator() {
  console.log('🔍 DEBUG: OnboardingNavigator rendering');
  return (
    <OnboardingProvider>
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
          gestureEnabled: false,
        }}
      >
        <Stack.Screen name="Welcome" component={OnboardingScreen1} />
        <Stack.Screen name="Gender" component={OnboardingScreen2} />
        <Stack.Screen name="Age" component={OnboardingScreen4} />
        <Stack.Screen name="Height" component={OnboardingScreen5} />
        <Stack.Screen name="Weight" component={OnboardingScreen6} />
        <Stack.Screen name="ActivityLevel" component={OnboardingScreen3} />
        <Stack.Screen name="Final" component={OnboardingScreen7} />
        
        {/* Auth flow screens */}
        <Stack.Screen name="Paywall" component={PaywallScreen} />
        <Stack.Screen name="PhoneAuth" component={PhoneAuthScreen} />
        <Stack.Screen name="CodeVerification" component={CodeVerificationScreen} />
      </Stack.Navigator>
    </OnboardingProvider>
  );
}