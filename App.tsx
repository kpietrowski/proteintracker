import 'react-native-reanimated';
import 'react-native-gesture-handler';
import React, { useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SuperwallProvider } from 'expo-superwall';
import RootNavigator from './src/navigation/RootNavigator';
import { config } from './src/services/config';
import { notificationService } from './src/services/notificationService';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 App Error Boundary caught error:', error);
    console.error('🚨 Error Info:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 18, marginBottom: 10 }}>Something went wrong</Text>
          <Text style={{ textAlign: 'center', color: '#666' }}>
            {this.state.error?.message || 'Unknown error occurred'}
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  useEffect(() => {
    // Initialize purchase services (including Superwall) on app launch
    initializePurchaseServices();
    
    // Initialize notifications on app launch
    initializeNotifications();
    
    console.log('🚀 App launched successfully!');
  }, []);

  const initializePurchaseServices = async () => {
    try {
      console.log('🚀 App.tsx: Initializing purchase services...');
      
      // Import and initialize purchase service - this handles both RevenueCat AND Superwall
      const { purchaseService } = await import('./src/services/purchases');
      await purchaseService.initialize();
      console.log('✅ App.tsx: Purchase services initialized successfully');
    } catch (error) {
      console.error('❌ App.tsx: Failed to initialize purchase services:', error);
    }
  };

  const initializeNotifications = async () => {
    try {
      console.log('📱 App.tsx: Setting up notification handlers...');
      
      // Initialize notification service WITHOUT requesting permissions
      // Permissions will be requested in OnboardingScreen20 when user explicitly allows
      const hasPermission = await notificationService.initializeWithoutPermission();
      
      if (hasPermission) {
        console.log('✅ App.tsx: Notifications already permitted, scheduled if needed');
      } else {
        console.log('ℹ️ App.tsx: Notification handlers set up (permission will be requested in onboarding)');
      }
    } catch (error) {
      console.error('❌ App.tsx: Failed to initialize notifications:', error);
      // Non-critical error, don't crash the app
    }
  };

  return (
    <ErrorBoundary>
      <SuperwallProvider apiKeys={{ ios: config.superwall.apiKey }}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <RootNavigator />
          <StatusBar style="dark" />
        </GestureHandlerRootView>
      </SuperwallProvider>
    </ErrorBoundary>
  );
}
