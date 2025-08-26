import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { OnboardingStackParamList } from '../types';

// New 13-screen onboarding flow
import OnboardingScreen1 from '../screens/onboarding/OnboardingScreen1'; // Primary Goal
import OnboardingScreen2New from '../screens/onboarding/OnboardingScreen2-new'; // Current Tracking Method
import OnboardingScreen3 from '../screens/onboarding/OnboardingScreen3'; // Nutrition Challenges
import OnboardingScreen4New from '../screens/onboarding/OnboardingScreen4-new'; // Goal Importance

// Existing screens (will be renamed/reordered)
import OnboardingScreen2 from '../screens/onboarding/OnboardingScreen2'; // Gender (will become Screen 8) 
import OnboardingScreen9 from '../screens/onboarding/OnboardingScreen9'; // Exercise Frequency (Screen 9)
import OnboardingScreen10 from '../screens/onboarding/OnboardingScreen10'; // Exercise Type (Screen 10)
import OnboardingScreen11 from '../screens/onboarding/OnboardingScreen11'; // Dream Outcome (Screen 11)
import OnboardingScreen12 from '../screens/onboarding/OnboardingScreen12'; // Goal Calculation (Screen 12)
import OnboardingScreen4 from '../screens/onboarding/OnboardingScreen4'; // Age (will become Screen 5)
import OnboardingScreen5 from '../screens/onboarding/OnboardingScreen5'; // Height (will become Screen 6)
import OnboardingScreen6 from '../screens/onboarding/OnboardingScreen6'; // Weight (will become Screen 7)
import OnboardingScreen7 from '../screens/onboarding/OnboardingScreen7'; // Final (will become Screen 12)

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
        {/* New onboarding flow */}
        <Stack.Screen name="Welcome" component={OnboardingScreen1} />
        <Stack.Screen name="CurrentTracking" component={OnboardingScreen2New} />
        <Stack.Screen name="NutritionChallenges" component={OnboardingScreen3} />
        <Stack.Screen name="GoalImportance" component={OnboardingScreen4New} />
        <Stack.Screen name="Age" component={OnboardingScreen4} />
        <Stack.Screen name="Height" component={OnboardingScreen5} />
        <Stack.Screen name="Weight" component={OnboardingScreen6} />
        <Stack.Screen name="Gender" component={OnboardingScreen2} />
        <Stack.Screen name="ExerciseFrequency" component={OnboardingScreen9} />
        <Stack.Screen name="ExerciseType" component={OnboardingScreen10} />
        <Stack.Screen name="DreamOutcome" component={OnboardingScreen11} />
        <Stack.Screen name="GoalCalculation" component={OnboardingScreen12} />
        <Stack.Screen name="Final" component={OnboardingScreen7} />
        
        {/* Temporary - keeping for backward compatibility */}
        <Stack.Screen name="ActivityLevel" component={OnboardingScreen9} />
        
        {/* Auth flow screens */}
        <Stack.Screen name="Paywall" component={PaywallScreen} />
        <Stack.Screen name="PhoneAuth" component={PhoneAuthScreen} />
        <Stack.Screen name="CodeVerification" component={CodeVerificationScreen} />
      </Stack.Navigator>
    </OnboardingProvider>
  );
}