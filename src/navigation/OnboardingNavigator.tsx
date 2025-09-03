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
import OnboardingScreen4 from '../screens/onboarding/OnboardingScreen4'; // Age (will become Screen 5)
import OnboardingScreen5 from '../screens/onboarding/OnboardingScreen5'; // Height (will become Screen 6)
import OnboardingScreen6 from '../screens/onboarding/OnboardingScreen6'; // Weight (will become Screen 7)
import OnboardingScreen7 from '../screens/onboarding/OnboardingScreen7-hybrid'; // HYBRID: Working logic + Beautiful UI with debug logging
import OnboardingScreen8 from '../screens/onboarding/OnboardingScreen8'; // Tracking Experience (Screen 4)
import OnboardingScreen13 from '../screens/onboarding/OnboardingScreen13'; // Protein AI Results (Screen 5)
import OnboardingScreen14 from '../screens/onboarding/OnboardingScreen14'; // Make gains 2X faster (Screen 10)
import OnboardingScreen15 from '../screens/onboarding/OnboardingScreen15'; // Desired weight (Screen 11)
import OnboardingScreen16 from '../screens/onboarding/OnboardingScreen16'; // Protein progress concern (Screen 12)
import OnboardingScreen17 from '../screens/onboarding/OnboardingScreen17'; // Ready for goal (Screen 13)
import OnboardingScreen18 from '../screens/onboarding/OnboardingScreen18'; // Potential to crush goal (Screen 14)
import OnboardingScreen19 from '../screens/onboarding/OnboardingScreen19'; // Give us rating (Screen 15)
import OnboardingScreen20 from '../screens/onboarding/OnboardingScreen20'; // Notification permission (Screen 16)
import OnboardingScreenLoading from '../screens/onboarding/OnboardingScreenLoading'; // Loading screen
import OnboardingScreenWelcome from '../screens/onboarding/OnboardingScreenWelcome'; // Welcome screen (First screen)
import OnboardingScreenGoal from '../screens/onboarding/OnboardingScreenGoal'; // Goal introduction (Second screen)

// Auth screens
import PaywallScreen from '../screens/PaywallScreen';
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
        {/* Updated onboarding flow - correct order */}
        <Stack.Screen name="Welcome" component={OnboardingScreenWelcome} />
        <Stack.Screen name="Goal" component={OnboardingScreenGoal} />
        <Stack.Screen name="Gender" component={OnboardingScreen2} />
        <Stack.Screen name="Age" component={OnboardingScreen4} />
        <Stack.Screen name="Height" component={OnboardingScreen5} />
        <Stack.Screen name="TrackingExperience" component={OnboardingScreen8} />
        <Stack.Screen name="ProteinAIResults" component={OnboardingScreen13} />
        <Stack.Screen name="PrimaryGoal" component={OnboardingScreen1} />
        <Stack.Screen name="ExerciseType" component={OnboardingScreen10} />
        <Stack.Screen name="Weight" component={OnboardingScreen6} />
        <Stack.Screen name="ExerciseFrequency" component={OnboardingScreen9} />
        <Stack.Screen name="ProteinAIComparison" component={OnboardingScreen14} />
        <Stack.Screen name="DesiredWeight" component={OnboardingScreen15} />
        <Stack.Screen name="ProteinProgressConcern" component={OnboardingScreen16} />
        <Stack.Screen name="ReadyForGoal" component={OnboardingScreen17} />
        <Stack.Screen name="PotentialToCrush" component={OnboardingScreen18} />
        <Stack.Screen name="GiveUsRating" component={OnboardingScreen19} />
        <Stack.Screen name="NotificationPermission" component={OnboardingScreen20} />
        <Stack.Screen name="Loading" component={OnboardingScreenLoading} />
        <Stack.Screen name="DreamOutcome" component={OnboardingScreen11} />
        <Stack.Screen name="Final" component={OnboardingScreen7} />
        
        {/* Temporary - keeping for backward compatibility */}
        <Stack.Screen name="ActivityLevel" component={OnboardingScreen9} />
        
        {/* Auth flow screens */}
        <Stack.Screen name="Paywall" component={PaywallScreen} />
      </Stack.Navigator>
    </OnboardingProvider>
  );
}