import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { supabase } from '../services/supabase';
import { purchaseService } from '../services/purchases';
import OnboardingNavigator from './OnboardingNavigator';
import MainTabNavigator from './MainTabNavigator';
import VoiceInputModal from '../screens/VoiceInputModal';
import { RootStackParamList } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthAndSubscription();
    
    // Listen for auth changes
    const authListener = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
      setIsLoading(false);
    });

    return () => {
      authListener.data.subscription.unsubscribe();
    };
  }, []);

  const checkAuthAndSubscription = async () => {
    try {
      console.log('🔍 DEBUG: checkAuthAndSubscription called');
      const { data: { session } } = await supabase.auth.getSession();
      
      // Check for mock authentication in development
      const mockAuth = await AsyncStorage.getItem('mockAuthenticated');
      console.log('🔍 DEBUG: session exists:', !!session);
      console.log('🔍 DEBUG: mockAuth:', mockAuth);
      
      if (session) {
        console.log('🔍 DEBUG: User authenticated - showing main app');
        setIsAuthenticated(true);
      } else if (__DEV__ && mockAuth === 'true') {
        console.log('🔍 DEBUG: Mock authenticated - showing main app');
        setIsAuthenticated(true);
      } else {
        console.log('🔍 DEBUG: No session - showing onboarding');
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('🔍 DEBUG: Error checking auth:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };


  if (isLoading) {
    return null; // You could show a splash screen here
  }

  const onNavigationStateChange = () => {
    // Re-check subscription status when navigation state changes
    // This will trigger when CommonActions.reset is called
    checkAuthAndSubscription();
  };

  console.log('🔍 DEBUG: RootNavigator render - isAuthenticated:', isAuthenticated, 'isLoading:', isLoading);

  return (
    <NavigationContainer onStateChange={onNavigationStateChange}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
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