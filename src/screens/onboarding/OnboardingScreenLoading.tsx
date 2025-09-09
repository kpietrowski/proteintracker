import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { Ionicons } from '@expo/vector-icons';
export default function OnboardingScreenLoading() {
  const navigation = useNavigation();

  useEffect(() => {
    // Show loading for 3 seconds then navigate to final screen
    const timer = setTimeout(() => {
      navigation.navigate('Final' as never);
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000000" style={styles.spinner} />
          <Text style={styles.loadingText}>Calculating your personalized protein goal...</Text>
          <Text style={styles.subText}>
            Using your age, weight, goals, and activity level to create the perfect plan for you
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingContainer: {
    alignItems: 'center',
  },
  spinner: {
    marginBottom: 30,
  },
  loadingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 30,
  },
  subText: {
    fontSize: 16,
    color: '#6B6B6B',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
  },
});