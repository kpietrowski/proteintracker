import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useOnboarding } from '../../context/OnboardingContext';
import { colors } from '../../constants/colors';
import Superwall from '@superwall/react-native-superwall';
import { purchaseService } from '../../services/purchases';
import { config } from '../../services/config';

interface ProteinCalculation {
  dailyProtein: number;
  perMeal: number;
  methodology: string;
}

export default function OnboardingScreen7() {
  const navigation = useNavigation();
  const { state, setProteinGoals } = useOnboarding();
  const [calculation, setCalculation] = useState<ProteinCalculation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('OnboardingScreen7 - Current state data:', JSON.stringify(state.data, null, 2));
    initializeSuperwall();
    calculateProteinNeeds();
    
    // Set up Superwall event listeners for purchase completion
    const setupSuperwallListeners = () => {
      // Listen for successful purchases
      Superwall.shared.delegate = {
        onPurchaseSuccessful: (purchaseInfo: any) => {
          console.log('🎉 Purchase successful!', purchaseInfo);
          // Navigate to phone auth on successful purchase
          navigation.navigate('PhoneAuth' as never);
        },
        onPurchaseFailed: (error: any) => {
          console.log('❌ Purchase failed:', error);
          // Stay on current screen
        },
        onSuperwallEvent: (event: any) => {
          console.log('📊 Superwall event:', event);
          if (event.type === 'transaction_complete' && event.result === 'purchased') {
            console.log('🎯 Transaction completed successfully');
            navigation.navigate('PhoneAuth' as never);
          }
        }
      };
    };
    
    setupSuperwallListeners();
    
    // Cleanup listeners on unmount
    return () => {
      Superwall.shared.delegate = null;
    };
  }, [state.data, navigation]);

  const initializeSuperwall = async () => {
    try {
      console.log('🚀 Initializing Superwall in OnboardingScreen7...');
      console.log('🔑 API Key available?', !!config.superwall.apiKey);
      console.log('🔑 API Key preview:', config.superwall.apiKey ? config.superwall.apiKey.substring(0, 15) + '...' : 'NO KEY');
      
      if (config.superwall.apiKey) {
        // Use correct object syntax for configure
        await Superwall.configure({
          apiKey: config.superwall.apiKey
        });
        console.log('✅ Superwall initialized successfully');
      } else {
        console.error('❌ No Superwall API key found in config');
      }
    } catch (error) {
      console.error('❌ Failed to initialize Superwall:', error);
    }
  };

  const calculateProteinNeeds = () => {
    try {
      setTimeout(() => {
        // Calculate based on actual user data
        const weightInKg = state.data.weightUnit === 'kg' 
          ? state.data.weightKg || 70
          : state.data.weightLbs ? state.data.weightLbs * 0.453592 : 70;
        
        // Base protein calculation (rough formula)
        let proteinMultiplier = 1.6; // Default for moderate activity
        
        if (state.data.activityLevel?.includes('Sedentary')) proteinMultiplier = 1.2;
        else if (state.data.activityLevel?.includes('Lightly')) proteinMultiplier = 1.4;
        else if (state.data.activityLevel?.includes('Very')) proteinMultiplier = 1.8;
        else if (state.data.activityLevel?.includes('Extremely')) proteinMultiplier = 2.0;
        
        // Adjust for goals
        if (state.data.fitnessGoal?.includes('Build muscle')) proteinMultiplier += 0.2;
        else if (state.data.fitnessGoal?.includes('Lose weight')) proteinMultiplier += 0.1;
        
        const dailyProtein = Math.round(weightInKg * proteinMultiplier);
        const perMeal = Math.round(dailyProtein / 4);
        
        const calculatedResult: ProteinCalculation = {
          dailyProtein,
          perMeal,
          methodology: `Based on your ${state.data.activityLevel?.toLowerCase() || 'moderate activity'}, ${state.data.weightUnit === 'lbs' ? state.data.weightLbs : state.data.weightKg}${state.data.weightUnit} body weight, and ${state.data.fitnessGoal?.toLowerCase() || 'general fitness'} goals`
        };
        
        setCalculation(calculatedResult);
        // Save to context
        try {
          setProteinGoals(dailyProtein, 'grams');
          console.log('Protein goals set successfully:', dailyProtein, 'grams');
        } catch (error) {
          console.error('Error setting protein goals:', error);
        }
        setLoading(false);
      }, 2000);
    } catch (error) {
      console.error('Error calculating protein needs:', error);
      setLoading(false);
    }
  };

  const handleNext = async () => {
    console.log('🔓 User tapped "Unlock My Goal" - triggering paywall...');
    console.log('🔓 Protein goal:', calculation?.dailyProtein || 150);
    
    try {
      // Simply trigger the paywall - navigation will be handled by delegate events
      await Superwall.register('onboarding_complete', {
        protein_goal: calculation?.dailyProtein || 150,
        trigger_source: 'unlock_goal_button',
        user_type: 'new_user',
        goal_blurred: true
      });
      
      console.log('✅ Paywall triggered - waiting for user action');
      // Navigation will be handled by the delegate callbacks based on user action
      
    } catch (error) {
      console.error('❌ Paywall failed to show:', error);
      console.error('Full error details:', JSON.stringify(error, null, 2));
      console.log('🚫 Staying on current screen - paywall could not be displayed');
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Calculating your protein needs...</Text>
          <Text style={styles.loadingSubtext}>
            Using advanced algorithms to personalize your plan
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Content */}
      <View style={styles.content}>
        {/* Target Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.targetIcon}>
            <View style={styles.targetRing1}>
              <View style={styles.targetRing2}>
                <View style={styles.targetCenter} />
              </View>
            </View>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Your Daily Protein Goal</Text>

        {/* Protein Amount */}
        <View style={styles.proteinContainer}>
          <Text style={styles.proteinAmount}>{calculation?.dailyProtein || '150'}</Text>
          <Text style={styles.gramsLabel}>grams</Text>
        </View>

        {/* Calculated For Section */}
        <View style={styles.calculatedSection}>
          <View style={styles.calculatedHeader}>
            <Text style={styles.calculatedTitle}>Calculated specifically for:</Text>
          </View>
          
          <View style={styles.bulletPoints}>
            <View style={styles.bulletPoint}>
              <View style={styles.bullet} />
              <Text style={styles.bulletText}>{state.data.fitnessGoal || 'Building muscle & strength'}</Text>
            </View>
            <View style={styles.bulletPoint}>
              <View style={styles.bullet} />
              <Text style={styles.bulletText}>{state.data.activityLevel || 'Moderately active (3-5 days/week)'}</Text>
            </View>
            <View style={styles.bulletPoint}>
              <View style={styles.bullet} />
              <Text style={styles.bulletText}>Your current weight & metrics</Text>
            </View>
          </View>
        </View>

        {/* Unlock Section */}
        <View style={styles.unlockSection}>
          <Text style={styles.unlockTitle}>Unlock your personalized goal</Text>
          <Text style={styles.unlockSubtitle}>
            Get your exact daily protein target and start tracking your progress
          </Text>
        </View>
      </View>

      {/* Unlock Button */}
      <TouchableOpacity style={styles.unlockButton} onPress={handleNext}>
        <Text style={styles.unlockButtonText}>Unlock My Goal</Text>
      </TouchableOpacity>

      {/* Powered by text */}
      <Text style={styles.poweredBy}>Powered by Protein Tracker AI</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginTop: 20,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 16,
    color: '#6B6B6B',
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 22,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 20,
  },
  targetIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.secondary.orange,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.secondary.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  targetRing1: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  targetRing2: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  targetCenter: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 30,
  },
  proteinContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  proteinAmount: {
    fontSize: 56,
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 10,
  },
  gramsLabel: {
    fontSize: 20,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  calculatedSection: {
    width: '100%',
    backgroundColor: colors.background.white,
    borderRadius: 16,
    padding: 18,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  calculatedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  calculatedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  bulletPoints: {
    gap: 10,
  },
  bulletPoint: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary.teal,
    marginRight: 12,
  },
  bulletText: {
    fontSize: 15,
    color: colors.text.secondary,
    flex: 1,
  },
  unlockSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  unlockTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  unlockSubtitle: {
    fontSize: 15,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  unlockButton: {
    backgroundColor: colors.secondary.orange,
    borderRadius: 12,
    height: 54,
    marginHorizontal: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.secondary.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  unlockButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text.white,
  },
  poweredBy: {
    fontSize: 13,
    color: colors.text.light,
    textAlign: 'center',
    marginBottom: 20,
  },
});