/*
 * 🚨 CRITICAL DOCUMENTATION - READ BEFORE EDITING 🚨
 * 
 * THIS IS THE **FINAL** ONBOARDING SCREEN (Position #20 in the flow)
 * 
 * Despite being named "OnboardingScreen7", this screen is actually:
 * - The LAST screen in the 20-screen onboarding sequence
 * - Receives navigation from OnboardingScreen20 via navigate('Final')
 * - Responsible for:
 *   1. Calculating protein needs from ALL 20 screens of data
 *   2. Displaying final results with complete user profile
 *   3. Triggering Superwall paywall integration
 *   4. Saving complete profile to local storage
 *   5. Navigating to MainApp after completion
 * 
 * Data Dependencies: This screen expects data from:
 * - Gender (OnboardingScreen2)
 * - Age (OnboardingScreen4) 
 * - Height (OnboardingScreen5)
 * - Weight (OnboardingScreen6)
 * - Primary Goal (OnboardingScreen1)
 * - Exercise Type (OnboardingScreen10)
 * - Exercise Frequency (OnboardingScreen9)
 * - Dream Outcome (OnboardingScreen11)
 * - All psychology/motivation screens (OnboardingScreen14-20)
 * 
 * ⚠️ NEVER assume this is the 7th screen in sequence!
 * ⚠️ See /ONBOARDING_FLOW_DOCUMENTATION.md for complete flow
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator,
  Dimensions,
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useOnboarding } from '../../context/OnboardingContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Line, Text as SvgText } from 'react-native-svg';
import { hapticFeedback } from '../../utils/haptics';
import { config } from '../../services/config';
import Superwall from '@superwall/react-native-superwall';

const { width } = Dimensions.get('window');

export default function OnboardingScreen7() {
  const navigation = useNavigation();
  
  // Add error handling for useOnboarding hook
  let onboardingContext;
  try {
    onboardingContext = useOnboarding();
  } catch (error) {
    console.error('❌ CRITICAL: useOnboarding hook failed:', error);
    throw new Error(`useOnboarding failed: ${error.message}`);
  }
  
  // Validate that required functions exist
  if (!onboardingContext) {
    throw new Error('OnboardingContext is undefined');
  }
  
  const { state, saveProfileToLocalStorage, setProteinGoals } = onboardingContext;
  
  // Validate individual functions
  if (typeof saveProfileToLocalStorage !== 'function') {
    console.error('❌ saveProfileToLocalStorage is not a function:', typeof saveProfileToLocalStorage);
    throw new Error('saveProfileToLocalStorage is not available');
  }
  
  if (typeof setProteinGoals !== 'function') {
    console.error('❌ setProteinGoals is not a function:', typeof setProteinGoals);
    throw new Error('setProteinGoals is not available');
  }
  
  console.log('✅ OnboardingContext validation passed');
  
  // Validate hapticFeedback
  if (!hapticFeedback || typeof hapticFeedback.celebration !== 'function') {
    console.error('❌ hapticFeedback is not properly imported');
    throw new Error('hapticFeedback is not available');
  }
  
  const [loading, setLoading] = useState(true);
  const [calculation, setCalculation] = useState<any>(null);
  const [showDebugButtons, setShowDebugButtons] = useState(false);
  const [isEditingProtein, setIsEditingProtein] = useState(false);
  const [editedProteinGoal, setEditedProteinGoal] = useState<string>('');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [superwallReady, setSuperwallReady] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Calculate date 2-3 weeks from now
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 21);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];
  const formattedDate = `${monthNames[futureDate.getMonth()]} ${futureDate.getDate()}, ${futureDate.getFullYear()}`;
  
  // Centralized event handling function
  const handleEvent = (event: any) => {
    console.log('🔍 Event type:', event.type);
    console.log('🔍 Event name:', event.name);
    console.log('🔍 Full event object:', event);
    
    // Handle different event types - check all possible variations
    if (event.type === 'transaction_complete' || 
        event.type === 'transactionComplete' ||
        event.name === 'transaction_complete' ||
        event.name === 'transactionComplete' ||
        (event.type === 'subscription_start' || event.name === 'subscription_start') ||
        (event.type === 'purchase_complete' || event.name === 'purchase_complete') ||
        (event.type === 'paywall_dismiss' || event.name === 'paywall_dismiss')) {
      console.log('🎉 Purchase/Subscription successful! Completing onboarding locally...');
      // Complete onboarding locally after successful purchase
      setTimeout(() => {
        handleCompleteOnboardingLocally();
      }, 500);
    } else if (event.type === 'transaction_fail' || 
               event.type === 'transactionFail' ||
               event.name === 'transaction_fail' ||
               event.name === 'transactionFail') {
      console.log('❌ Purchase failed:', event);
      // Stay on current screen - user can try again
    } else if (event.type === 'paywall_close' || 
               event.type === 'paywallClose' ||
               event.name === 'paywall_close' ||
               event.name === 'paywallClose') {
      console.log('👋 Paywall closed');
      // User closed without purchasing - stay on results screen
    } else {
      console.log('🤔 Unknown Superwall event type:', event.type, 'name:', event.name);
    }
  };

  // Set up Superwall event listeners for purchase completion
  const setupSuperwallListeners = () => {
    console.log('🔧 Setting up Superwall delegate...');
    
    if (!Superwall.shared) {
      console.warn('⚠️ Superwall.shared not available for delegate setup - will retry after initialization');
      return;
    }
    
    // Note: There's a global delegate in purchases.ts that may override this
    // We'll also set up a global callback function that the global delegate can use
    
    // Try multiple delegate method names to ensure we catch events
    if (Superwall.shared && typeof Superwall.shared === 'object') {
      Superwall.shared.delegate = {
      // Primary event handler
      handleSuperwallEvent: async (event: any) => {
        console.log('📊 handleSuperwallEvent triggered:', JSON.stringify(event, null, 2));
        handleEvent(event);
      },
      
      // Alternative event handlers (in case handleSuperwallEvent doesn't work)
      onSuperwallEvent: async (event: any) => {
        console.log('📊 onSuperwallEvent triggered:', JSON.stringify(event, null, 2));
        handleEvent(event);
      },
      
      superwallDidHandleEvent: async (event: any) => {
        console.log('📊 superwallDidHandleEvent triggered:', JSON.stringify(event, null, 2));
        handleEvent(event);
      },
      
      // Purchase-specific handlers
      onPurchaseComplete: async (event: any) => {
        console.log('🎉 onPurchaseComplete triggered! Completing onboarding locally...');
        setTimeout(() => {
          handleCompleteOnboardingLocally();
        }, 500);
      },
      
      onSubscriptionStart: async (event: any) => {
        console.log('🎉 onSubscriptionStart triggered! Completing onboarding locally...');
        setTimeout(() => {
          handleCompleteOnboardingLocally();
        }, 500);
      }
    };
    
    console.log('✅ Superwall delegate set with multiple handlers');
    } else {
      console.warn('⚠️ Superwall.shared is not available for delegate setup');
    }
  };

  useEffect(() => {
    console.log('🚨 OnboardingScreen7 (FINAL SCREEN) mounted');
    
    // ===== CRITICAL: Check state.data exists FIRST =====
    if (!state?.data) {
      console.error('❌ CRITICAL: state.data is null/undefined in useEffect');
      return;
    }
    
    console.log('📊 Current state data:', JSON.stringify(state.data, null, 2));
    
    // ===== DATA VALIDATION =====
    const requiredFields = ['age', 'sex', 'weightKg', 'weightLbs', 'fitnessGoal'];
    const missingFields = requiredFields.filter(field => !state.data?.[field as keyof typeof state.data]);
    
    if (missingFields.length > 0) {
      console.warn('⚠️ MISSING REQUIRED DATA for protein calculation:', missingFields);
      console.warn('🔍 Available data keys:', Object.keys(state.data || {}));
    }
    
    // ===== OPTIONAL FIELDS CHECK =====
    const optionalFields = ['exerciseFrequency', 'exerciseType', 'dreamOutcome', 'heightFt', 'heightIn', 'heightCm'];
    const availableOptional = optionalFields.filter(field => state.data?.[field as keyof typeof state.data]);
    console.log('✅ Available optional data:', availableOptional);
    
    initializeSuperwall();
    calculateProteinNeeds();
    
    // Set global flag so other parts of app know we're on this screen
    global.currentScreen = 'OnboardingScreen7';
    global.onboardingCompleteLocally = () => {
      console.log('🎯 Global navigation callback triggered - completing onboarding locally');
      handleCompleteOnboardingLocally();
    };
    
    setupSuperwallListeners();
    
    // Cleanup listeners on unmount
    return () => {
      console.log('🧹 Cleaning up OnboardingScreen7...');
      global.currentScreen = null;
      global.onboardingCompleteLocally = null;
      if (Superwall.shared) {
        Superwall.shared.delegate = null;
      }
    };
  }, [state.data, navigation]);

  if (loading) {
    console.log('🔍 All onboarding data:', JSON.stringify(state?.data, null, 2));
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          {/* Loading Icon */}
          <View style={styles.loadingIconContainer}>
            <View style={styles.calculatorIcon}>
              <Text style={styles.calculatorText}>⚡</Text>
            </View>
          </View>
          
          {/* Loading Text */}
          <Text style={styles.loadingTitle}>Calculating your protein needs</Text>
          <Text style={styles.loadingSubtext}>
            Using advanced algorithms to personalize your plan
          </Text>
          
          {/* Debug: Log all available data */}
          
          {/* User Data Display */}
          <View style={styles.userDataContainer}>
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Gender:</Text>
              <Text style={styles.dataValue}>{state?.data?.sex || 'N/A'}</Text>
            </View>
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Age:</Text>
              <Text style={styles.dataValue}>{state?.data?.age || 'N/A'}</Text>
            </View>
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Height:</Text>
              <Text style={styles.dataValue}>
                {state?.data?.heightFt && state?.data?.heightIn !== undefined 
                  ? `${state?.data?.heightFt}'${state?.data?.heightIn}"` 
                  : state?.data?.heightCm ? `${state?.data?.heightCm} cm` 
                  : 'N/A'}
              </Text>
            </View>
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Weight:</Text>
              <Text style={styles.dataValue}>
                {state?.data?.weightUnit === 'lbs' && state?.data?.weightLbs 
                  ? `${state?.data?.weightLbs} lbs`
                  : state?.data?.weightUnit === 'kg' && state?.data?.weightKg 
                  ? `${state?.data?.weightKg} kg` 
                  : 'N/A'}
              </Text>
            </View>
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Goal:</Text>
              <Text style={styles.dataValue}>
                {state?.data?.fitnessGoal?.replace('Hit Protein Goal - ', '') || 'N/A'}
              </Text>
            </View>
          </View>
          
          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${loadingProgress}%` }
                ]} 
              />
            </View>
            <Text style={styles.percentageText}>{Math.round(loadingProgress)}%</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const initializeSuperwall = async () => {
    try {
      console.log('🚀 Checking Superwall readiness in OnboardingScreen7...');
      console.log('🔑 Superwall API key available:', !!config.superwall.apiKey);
      
      // Check if Superwall is already configured from App.tsx
      if (Superwall.shared) {
        console.log('✅ Superwall already initialized and available');
      } else if (config.superwall.apiKey) {
        console.log('🔧 Superwall not found, initializing in OnboardingScreen7...');
        await Superwall.configure({
          apiKey: config.superwall.apiKey
        });
        console.log('✅ Superwall initialized successfully in OnboardingScreen7');
      } else {
        console.error('❌ No Superwall API key found');
      }
      
      // Test if Superwall.shared is now available
      const isReady = !!Superwall.shared;
      console.log('🎯 Superwall.shared available:', isReady);
      setSuperwallReady(isReady);
      
      // Retry listener setup if initialization completed
      if (isReady) {
        setupSuperwallListeners();
      }
    } catch (error) {
      console.error('❌ Failed to initialize Superwall:', error);
      setSuperwallReady(false);
    }
  };

  const calculateProteinNeeds = () => {
    console.log('🧮 Starting comprehensive protein calculation with ALL onboarding data...');
    
    // ===== CRITICAL: Null safety check FIRST =====
    if (!state?.data) {
      console.error('❌ state.data is null/undefined');
      setLoading(false);
      return;
    }
    
    console.log('📊 Available data:', JSON.stringify(state.data, null, 2));
    
    // Animate progress from 0 to 100% over 3 seconds
    const progressInterval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2; // Increment by 2% every 60ms (3000ms total)
      });
    }, 60);

    setTimeout(() => {
      
      // ===== STEP 1: Create safe local copy to prevent race conditions =====
      if (!state?.data) {
        console.error('❌ state.data became null during calculation timeout');
        setLoading(false);
        return;
      }
      
      // Create immutable local copy to prevent race conditions during 3-second calculation
      const data = { ...state.data };
      console.log('📋 Using safe data copy for calculation');
      
      // ===== STEP 2: Get weight in kg =====
      const weightInKg = data.weightUnit === 'kg' 
        ? data.weightKg || 70
        : data.weightLbs ? data.weightLbs * 0.453592 : 70;
      
      console.log(`⚖️ Weight: ${weightInKg} kg`);
      
      // ===== STEP 3: Base protein calculation =====
      let baseMultiplier = 1.2; // Minimum healthy protein intake
      
      // ===== STEP 4: Adjust for fitness goals =====
      if (data.fitnessGoal?.toLowerCase().includes('build') || 
          data.fitnessGoal?.toLowerCase().includes('muscle') ||
          data.fitnessGoal?.toLowerCase().includes('gain')) {
        baseMultiplier = 2.0; // High protein for muscle building
        console.log('🏋️ Muscle building goal detected - high protein needed');
      } else if (data.fitnessGoal?.toLowerCase().includes('lose') ||
                 data.fitnessGoal?.toLowerCase().includes('weight') ||
                 data.fitnessGoal?.toLowerCase().includes('fat')) {
        baseMultiplier = 1.8; // High protein for weight loss (muscle retention)
        console.log('🔥 Weight loss goal detected - high protein for muscle retention');
      } else if (data.fitnessGoal?.toLowerCase().includes('tone') ||
                 data.fitnessGoal?.toLowerCase().includes('maintain')) {
        baseMultiplier = 1.6; // Moderate protein for toning/maintenance
        console.log('💪 Toning/maintenance goal detected - moderate protein');
      }
      
      // ===== STEP 5: Adjust for exercise frequency =====
      let exerciseMultiplier = 1.0;
      if (data.exerciseFrequency?.toLowerCase().includes('daily') ||
          data.exerciseFrequency?.toLowerCase().includes('6-7')) {
        exerciseMultiplier = 1.3; // Very active
        console.log('🏃‍♀️ High exercise frequency - increased protein needs');
      } else if (data.exerciseFrequency?.toLowerCase().includes('4-5') ||
                 data.exerciseFrequency?.toLowerCase().includes('most days')) {
        exerciseMultiplier = 1.2; // Active
        console.log('🚴‍♂️ Moderate exercise frequency - slightly increased protein');
      } else if (data.exerciseFrequency?.toLowerCase().includes('1-3') ||
                 data.exerciseFrequency?.toLowerCase().includes('few times')) {
        exerciseMultiplier = 1.1; // Lightly active
        console.log('🚶‍♂️ Light exercise frequency - baseline protein');
      }
      
      // ===== STEP 6: Adjust for exercise type =====
      let exerciseTypeMultiplier = 1.0;
      if (data.exerciseType?.toLowerCase().includes('weight') ||
          data.exerciseType?.toLowerCase().includes('strength') ||
          data.exerciseType?.toLowerCase().includes('resistance')) {
        exerciseTypeMultiplier = 1.2; // Strength training needs more protein
        console.log('💪 Strength training detected - increased protein for recovery');
      } else if (data.exerciseType?.toLowerCase().includes('cardio') ||
                 data.exerciseType?.toLowerCase().includes('running') ||
                 data.exerciseType?.toLowerCase().includes('cycling')) {
        exerciseTypeMultiplier = 1.1; // Cardio needs moderate protein
        console.log('🏃 Cardio training detected - moderate protein increase');
      }
      
      // ===== STEP 7: Adjust for age =====
      let ageMultiplier = 1.0;
      if (data.age && data.age >= 50) {
        ageMultiplier = 1.2; // Older adults need more protein
        console.log('👴 Age 50+ detected - increased protein for muscle maintenance');
      } else if (data.age && data.age <= 25) {
        ageMultiplier = 1.1; // Young adults building muscle
        console.log('👶 Young adult detected - slightly increased protein for growth');
      }
      
      // ===== STEP 8: Adjust for biological sex =====
      let sexMultiplier = 1.0;
      if (data.sex?.toLowerCase().includes('male') || 
          data.sex?.toLowerCase().includes('man')) {
        sexMultiplier = 1.1; // Males typically need slightly more protein
        console.log('♂️ Male detected - slightly increased protein needs');
      }
      
      // ===== STEP 9: Goal importance modifier (NEW) =====
      let goalCommitmentMultiplier = 1.0;
      if (data.goalImportance && data.goalImportance >= 8) {
        goalCommitmentMultiplier = 1.1; // High commitment = higher targets
        console.log('🎯 High goal importance (8-10) detected - increased protein targets');
      } else if (data.goalImportance && data.goalImportance >= 6) {
        goalCommitmentMultiplier = 1.05; // Moderate commitment
        console.log('📈 Moderate goal importance (6-7) detected - slight increase');
      }
      
      // ===== STEP 10: Nutrition challenges modifier (NEW) =====
      let nutritionChallengeMultiplier = 1.0;
      if (data.nutritionChallenges && Array.isArray(data.nutritionChallenges)) {
        const hasProteinChallenge = data.nutritionChallenges.some(challenge => 
          challenge.toLowerCase().includes('protein') || 
          challenge.toLowerCase().includes('enough')
        );
        const hasBusyLifestyle = data.nutritionChallenges.some(challenge => 
          challenge.toLowerCase().includes('busy') || 
          challenge.toLowerCase().includes('time')
        );
        
        if (hasProteinChallenge) {
          nutritionChallengeMultiplier = 1.15; // Hard to get protein = higher targets
          console.log('🥩 "Hard to get protein" challenge detected - increased targets');
        } else if (hasBusyLifestyle) {
          nutritionChallengeMultiplier = 1.05; // Busy lifestyle = slightly more accessible
          console.log('⏰ Busy lifestyle detected - realistic but slightly higher targets');
        }
      }
      
      // ===== STEP 11: Desired weight change factor (NEW) =====
      let weightChangeMultiplier = 1.0;
      if (data.desiredWeightLbs || data.desiredWeightKg) {
        const currentWeight = data.weightUnit === 'kg' ? 
          data.weightKg || 70 : (data.weightLbs || 154) * 0.453592;
        const desiredWeight = data.weightUnit === 'kg' ? 
          data.desiredWeightKg || currentWeight : 
          (data.desiredWeightLbs || currentWeight / 0.453592) * 0.453592;
        
        const weightDifference = Math.abs(currentWeight - desiredWeight);
        const percentageChange = weightDifference / currentWeight;
        
        if (desiredWeight < currentWeight && percentageChange > 0.1) {
          // Large weight loss goal (>10% body weight)
          weightChangeMultiplier = 1.2;
          console.log('📉 Large weight loss goal detected - high protein to preserve muscle');
        } else if (desiredWeight > currentWeight && percentageChange > 0.1) {
          // Large weight gain goal (>10% body weight)
          weightChangeMultiplier = 1.15;
          console.log('📈 Large weight gain goal detected - increased protein for muscle building');
        } else if (desiredWeight < currentWeight) {
          // Small weight loss
          weightChangeMultiplier = 1.05;
          console.log('📉 Moderate weight loss goal - slight protein increase');
        }
      }
      
      // ===== STEP 12: Enhanced exercise type categories (UPDATED) =====
      if (data.exerciseType?.toLowerCase().includes('mixed') ||
          (data.exerciseType?.toLowerCase().includes('strength') && 
           data.exerciseType?.toLowerCase().includes('cardio'))) {
        exerciseTypeMultiplier = 1.15; // Mixed training
        console.log('🏋️‍♀️ Mixed training detected - balanced protein increase');
      } else if (data.exerciseType?.toLowerCase().includes('sport') ||
                 data.exerciseType?.toLowerCase().includes('athletic') ||
                 data.exerciseType?.toLowerCase().includes('competitive')) {
        exerciseTypeMultiplier = 1.25; // Sports/Athletic
        console.log('🏆 Athletic/sports training detected - high protein for performance');
      } else if (data.exerciseType?.toLowerCase().includes('yoga') ||
                 data.exerciseType?.toLowerCase().includes('pilates') ||
                 data.exerciseType?.toLowerCase().includes('stretch')) {
        exerciseTypeMultiplier = 1.05; // Yoga/Pilates minimal increase
        console.log('🧘 Yoga/Pilates detected - minimal protein increase');
      }
      
      // ===== STEP 13: Activity intensity cross-reference (NEW) =====
      let intensityBonus = 1.0;
      const isHighFrequency = data.exerciseFrequency?.toLowerCase().includes('daily') ||
                              data.exerciseFrequency?.toLowerCase().includes('6-7');
      const isHighIntensity = data.exerciseType?.toLowerCase().includes('strength') ||
                              data.exerciseType?.toLowerCase().includes('sport') ||
                              exerciseTypeMultiplier >= 1.2;
      
      if (isHighFrequency && isHighIntensity) {
        intensityBonus = 1.1; // Additional 10% for high freq + high intensity
        console.log('🔥 High frequency + high intensity detected - additional protein boost');
      }
      
      // ===== STEP 14: Final calculation =====
      const finalMultiplier = baseMultiplier * exerciseMultiplier * exerciseTypeMultiplier * 
                             ageMultiplier * sexMultiplier * goalCommitmentMultiplier * 
                             nutritionChallengeMultiplier * weightChangeMultiplier * intensityBonus;
      const proteinGrams = Math.round(weightInKg * finalMultiplier);
      
      // Ensure reasonable bounds (minimum 80g, maximum 300g) - UPDATED RANGE
      const boundedProteinGrams = Math.max(80, Math.min(300, proteinGrams));
      
      console.log(`🧮 Enhanced calculation breakdown:`);
      console.log(`   Base multiplier: ${baseMultiplier}`);
      console.log(`   Exercise freq multiplier: ${exerciseMultiplier}`);
      console.log(`   Exercise type multiplier: ${exerciseTypeMultiplier}`);
      console.log(`   Age multiplier: ${ageMultiplier}`);
      console.log(`   Sex multiplier: ${sexMultiplier}`);
      console.log(`   Goal commitment multiplier: ${goalCommitmentMultiplier}`);
      console.log(`   Nutrition challenge multiplier: ${nutritionChallengeMultiplier}`);
      console.log(`   Weight change multiplier: ${weightChangeMultiplier}`);
      console.log(`   Intensity bonus: ${intensityBonus}`);
      console.log(`   Final multiplier: ${finalMultiplier.toFixed(2)}`);
      console.log(`   Raw calculation: ${proteinGrams}g`);
      console.log(`   Final bounded result: ${boundedProteinGrams}g (range: 80-300g)`);
      
      setCalculation({
        weightKg: weightInKg,
        multiplier: finalMultiplier,
        dailyProtein: boundedProteinGrams,
        weeklyProtein: boundedProteinGrams * 7,
        breakdown: {
          baseMultiplier,
          exerciseMultiplier,
          exerciseTypeMultiplier,
          ageMultiplier,
          sexMultiplier,
          goalCommitmentMultiplier,
          nutritionChallengeMultiplier,
          weightChangeMultiplier,
          intensityBonus,
          rawResult: proteinGrams,
          finalResult: boundedProteinGrams
        }
      });
      
      clearInterval(progressInterval);
      setLoading(false);
      
      // Long pulsating haptic for congratulations
      hapticFeedback.celebration();
    }, 3000); // 3 seconds total
  };

  const handleGetStarted = async () => {
    hapticFeedback.medium();
    console.log('🔓 User tapped "Let\'s Get Started!" - triggering paywall...');
    
    // Check if Superwall is ready
    if (!Superwall.shared) {
      console.error('❌ Superwall.shared not available - attempting to initialize first');
      
      try {
        if (config.superwall.apiKey) {
          console.log('🔧 Attempting emergency Superwall initialization...');
          await Superwall.configure({
            apiKey: config.superwall.apiKey
          });
          console.log('✅ Emergency initialization complete');
        } else {
          console.error('❌ No API key available for emergency initialization');
          // Fallback - complete onboarding locally anyway
          handleCompleteOnboardingLocally();
          return;
        }
      } catch (initError) {
        console.error('❌ Emergency initialization failed:', initError);
        // Fallback - complete onboarding locally anyway
        handleCompleteOnboardingLocally();
        return;
      }
    }
    
    try {
      console.log('🎯 Calling Superwall.shared.register with placement: onboarding_complete');
      console.log('🎯 Superwall API Key present:', !!config.superwall.apiKey);
      console.log('🎯 Protein goal:', calculation?.dailyProtein || 150);
      
      if (!Superwall.shared) {
        throw new Error('Superwall.shared is not available');
      }
      
      const registerResult = await Superwall.shared.register({
        placement: 'onboarding_complete',
        params: {
          protein_goal: calculation?.dailyProtein || 150,
          trigger_source: 'get_started_button',
          user_type: 'new_user',
          screen: 'results_screen'
        }
      });
      
      console.log('✅ Paywall register call completed - result:', registerResult);
      console.log('🕐 Waiting for paywall to appear or user action...');
      
      // Don't navigate away - let the paywall show or event handlers handle navigation
      
    } catch (error) {
      console.error('❌ Paywall register failed:', error);
      console.error('❌ Error type:', typeof error);
      console.error('❌ Error message:', error?.message || 'No message');
      console.error('❌ Error stack:', error?.stack || 'No stack');
      
      // Try alternative approach - show manual paywall 
      console.log('🔄 Attempting manual paywall trigger...');
      try {
        // Alternative approach - try without params
        if (Superwall.shared) {
          await Superwall.shared.register({
          placement: 'onboarding_complete'
        });
        console.log('✅ Manual paywall trigger succeeded');
        } else {
          console.warn('⚠️ Superwall.shared not available for manual trigger');
        }
      } catch (manualError) {
        console.error('❌ Manual paywall trigger also failed:', manualError);
        
        // Final fallback - complete onboarding anyway for testing
        console.log('⚠️ All paywall attempts failed - completing onboarding locally for testing');
        handleCompleteOnboardingLocally();
      }
    }
  };

  const handleShowPaywall = async () => {
    hapticFeedback.medium();
    console.log('🔓 User tapped "Unlock My Goal" - triggering paywall...');
    
    try {
      if (!Superwall.shared) {
        throw new Error('Superwall.shared is not available');
      }
      
      await Superwall.shared.register({
        placement: 'onboarding_complete',
        params: {
          protein_goal: calculation?.dailyProtein || 150,
          trigger_source: 'unlock_goal_button',
          user_type: 'new_user',
          goal_blurred: true
        }
      });
      
      console.log('✅ Paywall triggered - waiting for user action');
    } catch (error) {
      console.error('❌ Paywall failed to show:', error);
    }
  };

  // Calculate date 2-3 weeks from now
  const handleEditProtein = () => {
    setEditedProteinGoal((calculation?.dailyProtein || 145).toString());
    setIsEditingProtein(true);
    hapticFeedback.light();
    
    // Scroll to protein section after a small delay to ensure state has updated
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y: 400, // Approximate position of protein section
        animated: true,
      });
    }, 100);
  };

  const handleSaveProtein = () => {
    const newGoal = parseInt(editedProteinGoal);
    if (newGoal && newGoal > 0 && newGoal <= 500) {
      setCalculation(prev => ({ ...prev, dailyProtein: newGoal }));
      setIsEditingProtein(false);
      hapticFeedback.medium();
      
      // Scroll back to top after saving
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: 0,
          animated: true,
        });
      }, 100);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingProtein(false);
    setEditedProteinGoal('');
    hapticFeedback.light();
    
    // Scroll back to top after canceling
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y: 0,
        animated: true,
      });
    }, 100);
  };

  const handleCompleteOnboardingLocally = async () => {
    try {
      console.log('🎯 Starting local onboarding completion...');
      console.log('📊 Current protein goal:', calculation?.dailyProtein || 150);
      
      // Update onboarding data with final protein goal before saving
      const finalProteinGoal = calculation?.dailyProtein || 150;
      console.log('💾 Setting final protein goal in context:', finalProteinGoal);
      
      // Set the protein goal in the onboarding context first
      setProteinGoals(finalProteinGoal, 'grams');
      
      // Save the complete profile to local storage
      console.log('💾 Saving profile to local storage...');
      await saveProfileToLocalStorage();
      
      console.log('✅ Profile saved successfully! Onboarding complete - RootNavigator will handle transition to main app...');
      
    } catch (error) {
      console.error('❌ Failed to complete onboarding locally:', error);
      
      // Show user-friendly error
      alert('There was an issue saving your profile. Please try again or contact support if the problem persists.');
      
      console.log('⚠️ Profile save failed - user will need to complete onboarding again');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Debug Toggle Button */}
      <TouchableOpacity 
        style={styles.debugToggle}
        onPress={() => {
          hapticFeedback.light();
          setShowDebugButtons(!showDebugButtons);
        }}
      >
        <Text style={styles.debugToggleText}>🛠️</Text>
      </TouchableOpacity>
      
      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Congratulations Section - FIRST */}
        <View style={styles.congratsSection}>
          {/* Success Icon */}
          <View style={styles.successIcon}>
            <Text style={styles.checkmark}>✓</Text>
          </View>
          
          <Text style={styles.congratsTitle}>Congratulations{'\n'}your custom plan is ready!</Text>
          
          <Text style={styles.changeDate}>See visible physique changes in 14-21 days</Text>
          
          <View style={styles.targetDateCard}>
            <Ionicons name="calendar-outline" size={20} color="#1A1A1A" style={styles.calendarIcon} />
            <Text style={styles.targetDate}>By {formattedDate}</Text>
          </View>
        </View>

        {/* Protein Goal Section */}
        <View style={styles.proteinSection}>
          <Text style={styles.goalLabel}>Your Daily Protein Goal</Text>
          
          <TouchableOpacity 
            style={styles.proteinCard}
            onPress={handleEditProtein}
            disabled={isEditingProtein}
          >
            {isEditingProtein ? (
              <View style={styles.editingContainer}>
                <TextInput
                  style={styles.proteinInput}
                  value={editedProteinGoal}
                  onChangeText={setEditedProteinGoal}
                  keyboardType="numeric"
                  selectTextOnFocus
                  autoFocus
                  maxLength={3}
                />
                <View style={styles.editButtons}>
                  <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEdit}>
                    <Ionicons name="close" size={16} color="#666" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.saveButton} onPress={handleSaveProtein}>
                    <Ionicons name="checkmark" size={16} color="#FFF" />
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <>
                <Text style={styles.proteinAmount}>
                  {calculation?.dailyProtein || 145} grams{'\n'}of protein
                </Text>
                <Ionicons name="pencil" size={22} color="#000000" style={styles.editIcon} />
              </>
            )}
          </TouchableOpacity>
          
          {/* Benefits */}
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <View style={styles.benefitCheckCircle}>
                <Text style={styles.benefitCheck}>✓</Text>
              </View>
              <Text style={styles.benefitText}>Fast recovery and less soreness</Text>
            </View>
            <View style={styles.benefitItem}>
              <View style={styles.benefitCheckCircle}>
                <Text style={styles.benefitCheck}>✓</Text>
              </View>
              <Text style={styles.benefitText}>Muscles look and feel fuller</Text>
            </View>
            <View style={styles.benefitItem}>
              <View style={styles.benefitCheckCircle}>
                <Text style={styles.benefitCheck}>✓</Text>
              </View>
              <Text style={styles.benefitText}>Muscles grow 50% faster</Text>
            </View>
          </View>
          
          <Text style={styles.motivationalText}>
            Hit your protein goal and watch{'\n'}your progress soar finally.
          </Text>
        </View>

        {/* Timeline Section - SECOND */}
        <View style={styles.card}>
          <Text style={styles.timelineTitle}>Next 2 weeks</Text>
          
          {/* Day 0-7 */}
          <View style={styles.timelineItem}>
            <View style={styles.timelineNumber}>
              <Text style={styles.timelineNumberText}>1</Text>
            </View>
            <View style={styles.timelineContent}>
              <Text style={styles.timelineLabel}>Day 0-7</Text>
              <Text style={styles.timelineDescription}>
                First 7-10 days: faster recovery,{'\n'}
                less soreness, maybe a "fuller"{'\n'}
                look as glycogen/protein storage{'\n'}
                improves.
              </Text>
            </View>
          </View>
          
          {/* Day 7-14 */}
          <View style={styles.timelineItem}>
            <View style={[styles.timelineNumber, { backgroundColor: '#FF7043' }]}>
              <Text style={styles.timelineNumberText}>2</Text>
            </View>
            <View style={styles.timelineContent}>
              <Text style={styles.timelineLabel}>Day 7-14</Text>
              <Text style={styles.timelineDescription}>
                Day 7-14: Noticeable changes in{'\n'}
                muscle definition/size to you (and{'\n'}
                maybe others)
              </Text>
            </View>
          </View>
          
          <View style={styles.insightBox}>
            <Text style={styles.insightEmoji}>💡</Text>
            <Text style={styles.insightText}>
              <Text style={{ fontWeight: '600' }}>Think of it like flipping a switch:</Text>{'\n'}
              performance and recovery improve within days, visible{'\n'}
              physique changes show up in 2-3 weeks if training{'\n'}
              and sleep are excellent.
            </Text>
          </View>
        </View>

        {/* Your Results Section - THIRD */}
        <View style={styles.card}>
          <Text style={styles.resultsTitle}>
            <Text style={{ color: '#2E7D32' }}>📈</Text> Your results
          </Text>
          
          {/* Graph */}
          <View style={styles.graphContainer}>
            <Svg width={width - 80} height={180} viewBox={`0 0 ${width - 80} 180`}>
              {/* Grid lines */}
              <Line x1="40" y1="140" x2={width - 120} y2="140" stroke="#E0E0E0" strokeWidth="1" />
              
              {/* Without plan line (gray) */}
              <Path
                d={`M 40 120 Q ${(width - 80) / 2} 110 ${width - 120} 100`}
                stroke="#9E9E9E"
                strokeWidth="2"
                fill="none"
              />
              
              {/* With plan line (black) */}
              <Path
                d={`M 40 120 Q ${(width - 80) / 2} 60 ${width - 120} 20`}
                stroke="#000000"
                strokeWidth="3"
                fill="none"
              />
              
              {/* Labels */}
              <SvgText x="40" y="160" fontSize="12" fill="#666">MONTH 1</SvgText>
              <SvgText x={width - 160} y="160" fontSize="12" fill="#666">MONTH 3</SvgText>
              
              {/* Legend dots */}
              <Circle cx={width - 120} cy="20" r="4" fill="#000" />
              <Circle cx={width - 120} cy="100" r="4" fill="#9E9E9E" />
            </Svg>
            
            {/* Legend */}
            <View style={styles.legendContainer}>
              <View style={styles.legendItem}>
                <View style={[styles.legendBadge, { backgroundColor: '#000' }]}>
                  <Text style={styles.legendBadgeText}>With plan (fast)</Text>
                </View>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendBadge, { backgroundColor: '#E0E0E0' }]}>
                  <Text style={[styles.legendBadgeText, { color: '#666' }]}>Without plan (slow)</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Stats Card */}
        <View style={styles.card}>
          <Text style={styles.statsText}>
            📊 <Text style={{ fontWeight: '700' }}>82% of users</Text> say this is{'\n'}
            the easiest way to hit their{'\n'}
            protein goal
          </Text>
        </View>

        {/* What Happens Next */}
        <View style={styles.card}>
          <Text style={styles.nextTitle}>
            <Text style={{ color: '#DC143C' }}>🎯</Text> What happens next?
          </Text>
          
          <View style={styles.nextList}>
            <Text style={styles.nextItem}>
              • Track your daily protein with voice{'\n'}  logging
            </Text>
            <Text style={styles.nextItem}>
              • Get personalized meal suggestions
            </Text>
            <Text style={styles.nextItem}>
              • See your physique changes in real-time
            </Text>
            <Text style={styles.nextItem}>
              • Join thousands achieving their protein{'\n'}  goals
            </Text>
          </View>
        </View>

        {/* Spacing before button */}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Floating Button Container */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[
            styles.getStartedButton,
            !superwallReady && styles.getStartedButtonDisabled
          ]}
          onPress={handleGetStarted}
          disabled={!superwallReady}
          activeOpacity={0.9}
        >
          {!superwallReady ? (
            <View style={styles.buttonContent}>
              <ActivityIndicator color="#FFFFFF" size="small" style={{ marginRight: 10 }} />
              <Text style={styles.getStartedText}>Setting up paywall...</Text>
            </View>
          ) : (
            <Text style={styles.getStartedText}>Let's Get Started!</Text>
          )}
        </TouchableOpacity>
        
        {/* Debug buttons - only show when toggled */}
        {showDebugButtons && (
          <>
            <TouchableOpacity 
              style={[styles.getStartedButton, { backgroundColor: '#666', marginTop: 10 }]}
              onPress={handleShowPaywall}
            >
              <Text style={styles.getStartedText}>Test Paywall (Dev)</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.getStartedButton, { backgroundColor: '#4CAF50', marginTop: 10 }]}
              onPress={() => {
                console.log('🚀 BYPASS: Completing onboarding locally');
                handleCompleteOnboardingLocally();
              }}
            >
              <Text style={styles.getStartedText}>🚀 BYPASS - Enter App (TEMP)</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.getStartedButton, { backgroundColor: '#9C27B0', marginTop: 10 }]}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.getStartedText}>← Back to Previous Screen</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.getStartedButton, { backgroundColor: '#FF9500', marginTop: 10 }]}
              onPress={() => {
                setLoading(true);
                setLoadingProgress(0);
                calculateProteinNeeds();
              }}
            >
              <Text style={styles.getStartedText}>🔄 Test Loading Screen</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.getStartedButton, { backgroundColor: '#FF3B30', marginTop: 10 }]}
              onPress={async () => {
                try {
                  console.log('🔄 Resetting Superwall user data...');
                  if (Superwall.shared) {
                    await Superwall.shared.reset();
                    console.log('✅ Superwall user data reset complete');
                    hapticFeedback.success();
                    alert('Superwall user reset complete! Next paywall will show fresh configuration.');
                  } else {
                    console.log('❌ Superwall.shared not available');
                    alert('Superwall not available');
                  }
                } catch (error) {
                  console.error('❌ Failed to reset Superwall:', error);
                  alert('Failed to reset Superwall user data');
                }
              }}
            >
              <Text style={styles.getStartedText}>🔄 Reset Superwall User</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  debugToggle: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
    opacity: 0.8,
  },
  debugToggleText: {
    fontSize: 18,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 160, // Space for button
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingIconContainer: {
    marginBottom: 40,
  },
  calculatorIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  calculatorText: {
    fontSize: 40,
    color: '#FFFFFF',
  },
  loadingTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 12,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 40,
    textAlign: 'center',
    lineHeight: 22,
  },
  userDataContainer: {
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginBottom: 40,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dataLabel: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
  },
  dataValue: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 16,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#000000',
    borderRadius: 8,
  },
  percentageText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  
  // Card Styles
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
  },
  
  // Congratulations Section
  congratsSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '700',
  },
  congratsTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 8,
  },
  congratsSubtitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 16,
  },
  changeDate: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  targetDateCard: {
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  calendarIcon: {
    marginRight: 12,
  },
  targetDate: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  
  // Protein Goal Section
  proteinSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  goalLabel: {
    fontSize: 18,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  proteinCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 80,
    marginBottom: 32,
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  proteinAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  proteinDisplayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  editIcon: {
    position: 'absolute',
    top: 16,
    right: 16,
    opacity: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    padding: 4,
  },
  editingContainer: {
    alignItems: 'center',
  },
  proteinInput: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    lineHeight: 38,
    letterSpacing: -0.5,
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 100,
    marginBottom: 20,
  },
  gramsText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  editButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  benefitsList: {
    alignSelf: 'stretch',
    marginBottom: 32,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  benefitCheckCircle: {
    width: 24,
    height: 24,
    borderRadius: 29,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  benefitCheck: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  benefitText: {
    fontSize: 18,
    color: '#1A1A1A',
    flex: 1,
    fontWeight: '500',
  },
  motivationalText: {
    fontSize: 18,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 28,
  },
  
  // Results Section
  resultsTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 24,
  },
  graphContainer: {
    marginBottom: 20,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  legendBadgeText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Stats Card
  statsText: {
    fontSize: 20,
    lineHeight: 28,
    color: '#1A1A1A',
    textAlign: 'center',
  },
  
  // Timeline Section
  timelineTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 24,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  timelineNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4FC3F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  timelineNumberText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  timelineContent: {
    flex: 1,
  },
  timelineLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  timelineDescription: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  insightBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF9C4',
    borderRadius: 29,
    padding: 16,
    marginTop: 8,
  },
  insightEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  insightText: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
    lineHeight: 22,
  },
  
  // What Happens Next
  nextTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 20,
  },
  nextList: {
    gap: 12,
  },
  nextItem: {
    fontSize: 16,
    color: '#1A1A1A',
    lineHeight: 24,
  },
  
  // Button Container
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  getStartedButton: {
    backgroundColor: '#000000',
    paddingVertical: 20,
    borderRadius: 30,
    alignItems: 'center',
  },
  getStartedButtonDisabled: {
    backgroundColor: '#666666',
    opacity: 0.7,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  getStartedText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  swipeHint: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
    marginTop: 16,
  },
});