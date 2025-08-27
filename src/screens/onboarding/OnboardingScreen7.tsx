import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useOnboarding } from '../../context/OnboardingContext';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Line, Text as SvgText } from 'react-native-svg';
import { hapticFeedback } from '../../utils/haptics';
import { config } from '../../services/config';
import Superwall from '@superwall/react-native-superwall';

const { width } = Dimensions.get('window');

export default function OnboardingScreen7() {
  const navigation = useNavigation();
  const { state } = useOnboarding();
  const [loading, setLoading] = useState(true);
  const [calculation, setCalculation] = useState<any>(null);
  
  useEffect(() => {
    console.log('OnboardingScreen7 - Current state data:', JSON.stringify(state.data, null, 2));
    initializeSuperwall();
    calculateProteinNeeds();
    
    // Set global flag so other parts of app know we're on this screen
    global.currentScreen = 'OnboardingScreen7';
    global.onboardingNavigateToPhoneAuth = () => {
      console.log('🎯 Global navigation callback triggered - going to PhoneAuth');
      navigation.navigate('PhoneAuth' as never);
    };
    
    // Set up Superwall event listeners for purchase completion
    const setupSuperwallListeners = () => {
      console.log('🔧 Setting up Superwall delegate...');
      
      // Note: There's a global delegate in purchases.ts that may override this
      // We'll also set up a global callback function that the global delegate can use
      
      // Try multiple delegate method names to ensure we catch events
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
          console.log('🎉 onPurchaseComplete triggered! Navigating to PhoneAuth...');
          setTimeout(() => {
            navigation.navigate('PhoneAuth' as never);
          }, 500);
        },
        
        onSubscriptionStart: async (event: any) => {
          console.log('🎉 onSubscriptionStart triggered! Navigating to PhoneAuth...');
          setTimeout(() => {
            navigation.navigate('PhoneAuth' as never);
          }, 500);
        }
      };
      
      console.log('✅ Superwall delegate set with multiple handlers');
    };
    
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
        console.log('🎉 Purchase/Subscription successful! Navigating to PhoneAuth...');
        // Navigate to phone auth after successful purchase
        setTimeout(() => {
          navigation.navigate('PhoneAuth' as never);
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
    
    setupSuperwallListeners();
    
    // Cleanup listeners on unmount
    return () => {
      console.log('🧹 Cleaning up OnboardingScreen7...');
      global.currentScreen = null;
      global.onboardingNavigateToPhoneAuth = null;
      Superwall.shared.delegate = null;
    };
  }, [state.data, navigation]);

  const initializeSuperwall = async () => {
    try {
      console.log('🚀 Initializing Superwall in OnboardingScreen7...');
      
      if (config.superwall.apiKey) {
        await Superwall.configure({
          apiKey: config.superwall.apiKey
        });
        console.log('✅ Superwall initialized successfully');
      }
    } catch (error) {
      console.error('❌ Failed to initialize Superwall:', error);
    }
  };

  const calculateProteinNeeds = () => {
    setTimeout(() => {
      const weightInKg = state.data.weightUnit === 'kg' 
        ? state.data.weightKg || 70
        : state.data.weightLbs ? state.data.weightLbs * 0.453592 : 70;
      
      let multiplier = 1.6; // Default multiplier
      
      if (state.data.fitnessGoal?.includes('Build muscle')) {
        multiplier = 2.0;
      } else if (state.data.fitnessGoal?.includes('Lose weight')) {
        multiplier = 1.8;
      }
      
      const proteinGrams = Math.round(weightInKg * multiplier);
      
      setCalculation({
        weightKg: weightInKg,
        multiplier,
        dailyProtein: proteinGrams,
        weeklyProtein: proteinGrams * 7,
      });
      
      setLoading(false);
    }, 1500);
  };

  const handleGetStarted = async () => {
    hapticFeedback.medium();
    console.log('🔓 User tapped "Let\'s Get Started!" - triggering paywall...');
    
    try {
      await Superwall.shared.register({
        placement: 'onboarding_complete',
        params: {
          protein_goal: calculation?.dailyProtein || 150,
          trigger_source: 'get_started_button',
          user_type: 'new_user',
          screen: 'results_screen'
        }
      });
      
      console.log('✅ Paywall triggered - waiting for user action');
    } catch (error) {
      console.error('❌ Paywall failed to show:', error);
      // Fallback to phone auth if paywall fails
      navigation.navigate('PhoneAuth' as never);
    }
  };

  const handleShowPaywall = async () => {
    hapticFeedback.medium();
    console.log('🔓 User tapped "Unlock My Goal" - triggering paywall...');
    
    try {
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
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 21);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];
  const formattedDate = `${monthNames[futureDate.getMonth()]} ${futureDate.getDate()}, ${futureDate.getFullYear()}`;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2E7D32" />
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
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Congratulations Section - FIRST */}
        <View style={styles.congratsSection}>
          {/* Success Icon */}
          <View style={styles.successIcon}>
            <Text style={styles.checkmark}>✓</Text>
          </View>
          
          <Text style={styles.congratsTitle}>Congratulations</Text>
          <Text style={styles.congratsSubtitle}>Your Custom Plan Is Ready!</Text>
          
          <Text style={styles.changeDate}>See visible physique changes in 14-21 days</Text>
          
          <View style={styles.targetDateCard}>
            <Text style={styles.targetDate}>By {formattedDate}</Text>
          </View>
        </View>

        {/* Protein Goal Section */}
        <View style={styles.proteinSection}>
          <Text style={styles.goalLabel}>Your Daily Protein Goal</Text>
          
          <View style={styles.proteinCard}>
            <Text style={styles.proteinAmount}>
              {calculation?.dailyProtein || 145} grams of{'\n'}protein
            </Text>
          </View>
          
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
            Hit your protein goal and watch your progress{'\n'}soar finally.
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
              performance and recovery improve{'\n'}
              within days, visible physique{'\n'}
              changes show up in 2-3 weeks if{'\n'}
              training and sleep are excellent.
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
          style={styles.getStartedButton}
          onPress={handleGetStarted}
          activeOpacity={0.9}
        >
          <Text style={styles.getStartedText}>Let's Get Started!</Text>
        </TouchableOpacity>
        
        {/* DEV ONLY: Show debug buttons for testing */}
        {__DEV__ && (
          <>
            <TouchableOpacity 
              style={[styles.getStartedButton, { backgroundColor: '#666', marginTop: 10 }]}
              onPress={handleShowPaywall}
            >
              <Text style={styles.getStartedText}>Test Paywall (Dev)</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.getStartedButton, { backgroundColor: '#FF6B35', marginTop: 10 }]}
              onPress={() => navigation.navigate('PhoneAuth' as never)}
            >
              <Text style={styles.getStartedText}>Skip to PhoneAuth (Dev)</Text>
            </TouchableOpacity>
          </>
        )}
        
        {/* TEMPORARY: Bypass button for testing */}
        <TouchableOpacity 
          style={[styles.getStartedButton, { backgroundColor: '#4CAF50', marginTop: 10 }]}
          onPress={() => {
            console.log('🚀 BYPASS: Navigating directly to PhoneAuth');
            navigation.navigate('PhoneAuth' as never);
          }}
        >
          <Text style={styles.getStartedText}>🚀 BYPASS - Enter App (TEMP)</Text>
        </TouchableOpacity>
        
        <Text style={styles.swipeHint}>
          ••• Hold and drag to read more •••
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  loadingText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginTop: 20,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
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
    marginBottom: 40,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2E7D32',
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
    fontSize: 36,
    fontWeight: '700',
    color: '#2E7D32',
    textAlign: 'center',
    marginBottom: 4,
  },
  congratsSubtitle: {
    fontSize: 36,
    fontWeight: '700',
    color: '#2E7D32',
    textAlign: 'center',
    marginBottom: 32,
  },
  changeDate: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
  },
  targetDateCard: {
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  targetDate: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2E7D32',
    textAlign: 'center',
  },
  
  // Protein Goal Section
  proteinSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  goalLabel: {
    fontSize: 20,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
  },
  proteinCard: {
    backgroundColor: '#F8F8F8',
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 40,
    marginBottom: 40,
  },
  proteinAmount: {
    fontSize: 38,
    fontWeight: '800',
    color: '#2E7D32',
    textAlign: 'center',
    lineHeight: 44,
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
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  benefitCheck: {
    color: '#FFFFFF',
    fontSize: 16,
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
    borderRadius: 12,
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
    backgroundColor: '#2E7D32',
    paddingVertical: 20,
    borderRadius: 30,
    alignItems: 'center',
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