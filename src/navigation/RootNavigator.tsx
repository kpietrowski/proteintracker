import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { localStorageService } from '../services/localStorage';
import { purchaseService } from '../services/purchases';
import { navigationEvents } from '../services/eventEmitter';
import OnboardingNavigator from './OnboardingNavigator';
import MainTabNavigator from './MainTabNavigator';
import VoiceInputModal from '../screens/VoiceInputModal';
import { RootStackParamList } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkOnboardingStatus();
    
    // Listen for onboarding completion event
    const handleOnboardingComplete = async () => {
      console.log('📱 === ROOT NAVIGATOR: RECEIVED ONBOARDING-COMPLETE EVENT ===');
      console.log('📱 RootNavigator: Current hasCompletedOnboarding:', hasCompletedOnboarding);
      console.log('📱 RootNavigator: Rechecking onboarding status...');
      await checkOnboardingStatus();
      console.log('📱 RootNavigator: Recheck complete, new hasCompletedOnboarding:', hasCompletedOnboarding);
    };
    
    navigationEvents.on('onboarding-complete', handleOnboardingComplete);
    
    // Cleanup listener
    return () => {
      navigationEvents.off('onboarding-complete', handleOnboardingComplete);
    };
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      console.log('🔍 DEBUG: checkOnboardingStatus called');
      
      // Check if onboarding is complete using local storage
      const onboardingComplete = await localStorageService.isOnboardingComplete();
      console.log('📱 DEBUG: Onboarding complete from local storage:', onboardingComplete);
      
      if (onboardingComplete) {
        // Also verify that we have a user profile
        const userProfile = await localStorageService.getUserProfile();
        console.log('👤 DEBUG: User profile exists:', !!userProfile);
        
        if (userProfile) {
          console.log('✅ DEBUG: Onboarding complete and user profile exists - showing main app');
          setHasCompletedOnboarding(true);
        } else {
          console.log('⚠️ DEBUG: Onboarding marked complete but no user profile - showing onboarding');
          setHasCompletedOnboarding(false);
        }
      } else {
        console.log('🔄 DEBUG: Onboarding not complete - showing onboarding flow');
        setHasCompletedOnboarding(false);
      }
      
    } catch (error) {
      console.error('❌ DEBUG: Error checking onboarding status:', error);
      setHasCompletedOnboarding(false);
    } finally {
      setIsLoading(false);
    }
  };


  if (isLoading) {
    return null; // You could show a splash screen here
  }

  const onNavigationStateChange = () => {
    // Re-check onboarding status when navigation state changes
    console.log('🔄 Navigation state changed - re-checking onboarding status...');
    checkOnboardingStatus();
  };

  console.log('🔍 DEBUG: RootNavigator render - hasCompletedOnboarding:', hasCompletedOnboarding, 'isLoading:', isLoading);

  return (
    <NavigationContainer onStateChange={onNavigationStateChange}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!hasCompletedOnboarding ? (
          <Stack.Screen 
            name="Onboarding" 
            component={OnboardingNavigator}
          />
        ) : (
          <>
            <Stack.Screen name="MainApp" component={MainTabNavigator} />
            <Stack.Screen 
              name="VoiceInput" 
              component={VoiceInputModal}
              options={{
                presentation: 'transparentModal',
                headerShown: false,
                cardStyle: { backgroundColor: 'transparent' },
                cardOverlayEnabled: true,
                animation: 'slide_from_bottom',
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}