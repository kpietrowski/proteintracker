import 'react-native-reanimated';
import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import RootNavigator from './src/navigation/RootNavigator';
import Superwall from '@superwall/react-native-superwall';
import { config } from './src/services/config';

export default function App() {
  useEffect(() => {
    // Initialize Superwall on app launch
    initializeSuperwall();
  }, []);

  const initializeSuperwall = async () => {
    try {
      console.log('🚀 Initializing Superwall on app launch...');
      
      if (config.superwall.apiKey) {
        // Use the correct object syntax for configure
        await Superwall.configure({
          apiKey: config.superwall.apiKey,
          completion: () => {
            console.log('✅ Superwall configuration completed');
          }
        });
        
        console.log('✅ Superwall initialized and ready for use');
      } else {
        console.warn('⚠️ No Superwall API key found');
      }
    } catch (error) {
      console.error('❌ Failed to initialize Superwall:', error);
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <RootNavigator />
      <StatusBar style="dark" />
    </GestureHandlerRootView>
  );
}
