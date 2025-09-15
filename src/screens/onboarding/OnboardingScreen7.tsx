import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useOnboarding } from '../../context/OnboardingContext';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { hapticFeedback } from '../../utils/haptics';

const { width } = Dimensions.get('window');

interface ProteinCalculation {
  dailyProtein: number;
  perMeal: number;
  methodology: string;
}

export default function OnboardingScreen7() {
  const navigation = useNavigation();
  const { state, setProteinGoals } = useOnboarding();
  const [calculation, setCalculation] = useState<ProteinCalculation | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedProteinGoal, setEditedProteinGoal] = useState('');

  useEffect(() => {
    console.log('HYBRID: OnboardingScreen7 mounted');
    console.log('HYBRID: Current state data:', JSON.stringify(state.data, null, 2));
    
    // 🎉 TRIGGER EPIC CELEBRATION HAPTIC ON MOUNT!
    hapticFeedback.epicCelebration();
    console.log('🎉 EPIC CELEBRATION HAPTIC TRIGGERED FOR CONGRATULATIONS!');
    
    calculateProteinNeeds();
  }, []);

  const calculateProteinNeeds = () => {
    console.log('HYBRID: Starting protein calculation...');
    console.log('HYBRID: Weight data:', {
      weightLbs: state.data.weightLbs,
      weightKg: state.data.weightKg,
      weightUnit: state.data.weightUnit
    });
    
    let dailyProtein: number;
    
    if (state.data.weightUnit === 'lbs') {
      // For pounds: Use ~1g protein per lb body weight as base
      const weightLbs = state.data.weightLbs || 150;
      
      // Base protein multiplier for lbs (typically 0.8-1.2g per lb)
      let proteinMultiplier = 0.9; // Default for moderate activity
      
      if (state.data.exerciseFrequency?.includes('don\'t exercise')) proteinMultiplier = 0.7;
      else if (state.data.exerciseFrequency?.includes('1-2')) proteinMultiplier = 0.8;
      else if (state.data.exerciseFrequency?.includes('3-4')) proteinMultiplier = 1.0;
      else if (state.data.exerciseFrequency?.includes('5-6')) proteinMultiplier = 1.1;
      else if (state.data.exerciseFrequency?.includes('Daily')) proteinMultiplier = 1.2;
      
      // Adjust for goals
      if (state.data.primaryGoal?.includes('muscle')) proteinMultiplier += 0.1;
      else if (state.data.primaryGoal?.includes('weight')) proteinMultiplier += 0.05;
      
      dailyProtein = Math.round(weightLbs * proteinMultiplier);
      console.log('HYBRID: Calculated for lbs:', weightLbs, '×', proteinMultiplier, '=', dailyProtein);
    } else {
      // For kilograms: Use ~2.2g protein per kg body weight as base
      const weightKg = state.data.weightKg || 70;
      
      // Base protein multiplier for kg (typically 1.6-2.4g per kg)
      let proteinMultiplier = 1.8; // Default for moderate activity
      
      if (state.data.exerciseFrequency?.includes('don\'t exercise')) proteinMultiplier = 1.4;
      else if (state.data.exerciseFrequency?.includes('1-2')) proteinMultiplier = 1.6;
      else if (state.data.exerciseFrequency?.includes('3-4')) proteinMultiplier = 2.0;
      else if (state.data.exerciseFrequency?.includes('5-6')) proteinMultiplier = 2.2;
      else if (state.data.exerciseFrequency?.includes('Daily')) proteinMultiplier = 2.4;
      
      // Adjust for goals
      if (state.data.primaryGoal?.includes('muscle')) proteinMultiplier += 0.2;
      else if (state.data.primaryGoal?.includes('weight')) proteinMultiplier += 0.1;
      
      dailyProtein = Math.round(weightKg * proteinMultiplier);
      console.log('HYBRID: Calculated for kg:', weightKg, '×', proteinMultiplier, '=', dailyProtein);
    }
    
    const perMeal = Math.round(dailyProtein / 4);
    
    const calculatedResult: ProteinCalculation = {
      dailyProtein,
      perMeal,
      methodology: `Based on your ${state.data.exerciseFrequency?.toLowerCase() || 'moderate activity'} and goals`
    };
    
    setCalculation(calculatedResult);
    
    // Save to context
    try {
      setProteinGoals(dailyProtein, 'grams');
      console.log('HYBRID: Protein goals set:', dailyProtein, 'grams');
    } catch (error) {
      console.error('HYBRID: Error setting protein goals:', error);
    }
  };

  const handleNext = async () => {
    const timestamp = new Date().toISOString().split('T')[1].slice(0, 12);
    console.log(`[${timestamp}] HYBRID: User tapped Get started...`);
    hapticFeedback.success();
    
    // Log current navigation state
    const navState = navigation.getState();
    console.log(`[${timestamp}] HYBRID: Current navigation state:`, {
      index: navState.index,
      routes: navState.routes.map(r => r.name),
      currentRoute: navState.routes[navState.index]?.name
    });
    
    // Navigate to Paywall screen immediately
    console.log(`[${timestamp}] HYBRID: Navigating to Paywall immediately...`);
    navigation.navigate('Paywall' as never);
    console.log(`[${timestamp}] HYBRID: navigation.navigate('Paywall') completed`);
  };

  const handleEditProteinGoal = () => {
    hapticFeedback.light();
    setEditedProteinGoal(String(calculation?.dailyProtein || 145));
    setShowEditModal(true);
  };

  const handleSaveProteinGoal = () => {
    hapticFeedback.success();
    const newGoal = parseInt(editedProteinGoal);
    
    if (!isNaN(newGoal) && newGoal > 0 && newGoal <= 500) {
      // Update calculation
      const updatedCalculation = {
        ...calculation!,
        dailyProtein: newGoal,
        perMeal: Math.round(newGoal / 4)
      };
      setCalculation(updatedCalculation);
      
      // Save to context
      setProteinGoals(newGoal, 'grams');
      console.log('HYBRID: Updated protein goal to:', newGoal, 'grams');
      
      setShowEditModal(false);
    } else {
      alert('Please enter a valid protein goal between 1 and 500 grams');
    }
  };

  // Calculate date 14 days from now
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 14);
  const formattedDate = targetDate.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });

  const ProgressChart = () => (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Your results</Text>
      <View style={styles.chart}>
        <Svg width={width - 80} height={150} viewBox={`0 0 ${width - 80} 150`}>
          {/* Grid lines */}
          <Line x1="0" y1="120" x2={width - 80} y2="120" stroke="#F0F0F0" strokeWidth="1" />
          
          {/* Progress curve - with plan (steep upward) */}
          <Path
            d={`M 20 120 Q ${(width - 80) / 3} 60 ${(width - 80) / 2} 30 T ${width - 100} 10`}
            stroke="#000000"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          
          {/* Progress curve - without plan (gradual upward) */}
          <Path
            d={`M 20 120 Q ${(width - 80) / 3} 90 ${(width - 80) / 2} 70 T ${width - 100} 50`}
            stroke="#E0E0E0"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          
          {/* Start point */}
          <Circle cx="20" cy="120" r="6" fill="#FFFFFF" stroke="#000000" strokeWidth="2" />
          
          {/* End point - with plan */}
          <Circle cx={width - 100} cy="10" r="6" fill="#000000" />
          
          {/* End point - without plan */}
          <Circle cx={width - 100} cy="50" r="6" fill="#FFFFFF" stroke="#E0E0E0" strokeWidth="2" />
        </Svg>
        
        {/* Labels */}
        <View style={styles.chartLabels}>
          <View style={styles.labelWithPlan}>
            <Text style={styles.labelText}>With plan (fast)</Text>
          </View>
          <View style={styles.labelWithoutPlan}>
            <Text style={styles.labelTextGrey}>Without plan (slow)</Text>
          </View>
        </View>
        
        {/* X-axis labels */}
        <View style={styles.xAxisLabels}>
          <Text style={styles.xAxisLabel}>MONTH 1</Text>
          <Text style={styles.xAxisLabel}>MONTH 3</Text>
        </View>
      </View>
      
      <View style={styles.statContainer}>
        <Text style={styles.statText}>
          82% of users say this is easiest way{'\n'}to hit their protein goal
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with checkmark */}
        <View style={styles.header}>
          <View style={styles.checkmarkCircle}>
            <Ionicons name="checkmark" size={50} color="#FFFFFF" />
          </View>
          <Text style={styles.title}>
            Congratulations{'\n'}your custom plan is ready!
          </Text>
          <Text style={styles.subtitle}>
            You'll see visible physique changes in 14-21 days
          </Text>
        </View>

        {/* Date Section */}
        <View style={styles.dateSection}>
          <View style={styles.dateCard}>
            <Text style={styles.dateText}>By {formattedDate}</Text>
          </View>
        </View>

        {/* Protein Goal Section */}
        <View style={styles.goalSection}>
          <Text style={styles.goalLabel}>Your Daily Protein Goal</Text>
          <View style={styles.goalCard}>
            <TouchableOpacity 
              onPress={handleEditProteinGoal}
              style={styles.editButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="pencil" size={24} color="#666666" />
            </TouchableOpacity>
            <View style={styles.goalCardContent}>
              <View style={styles.goalTextContainer}>
                <Text style={styles.goalValue}>
                  {calculation?.dailyProtein || 145} grams
                </Text>
                <Text style={styles.goalSubtext}>of protein</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Benefits List */}
        <View style={styles.benefitsList}>
          <View style={styles.benefitItem}>
            <View style={styles.benefitCheckmark}>
              <Ionicons name="checkmark" size={16} color="#FFFFFF" />
            </View>
            <Text style={styles.benefitText}>Fast recovery and less soreness</Text>
          </View>
          <View style={styles.benefitItem}>
            <View style={styles.benefitCheckmark}>
              <Ionicons name="checkmark" size={16} color="#FFFFFF" />
            </View>
            <Text style={styles.benefitText}>Muscles look and feel fuller</Text>
          </View>
          <View style={styles.benefitItem}>
            <View style={styles.benefitCheckmark}>
              <Ionicons name="checkmark" size={16} color="#FFFFFF" />
            </View>
            <Text style={styles.benefitText}>Muscles grow 50% faster</Text>
          </View>
        </View>

        {/* Motivational Section */}
        <View style={styles.motivationalSection}>
          <Text style={styles.motivationalTitle}>
            Hit your protein goal and{'\n'}watch your progress soar{'\n'}finally.
          </Text>
        </View>

        {/* Timeline Section */}
        <View style={styles.timelineSection}>
          <Text style={styles.timelineTitle}>Hitting Your Protein Goal</Text>
          
          <View style={styles.timelineItem}>
            <Text style={styles.timelineDay}>Days 0-7:</Text>
            <Text style={styles.timelineDescription}>
              Muscles feel stronger, less tired. They feel "full" as protein storage improves. Recovery speeds up 50% after workouts and you feel less sore
            </Text>
          </View>
          
          <View style={styles.timelineItem}>
            <Text style={styles.timelineDay}>Days 7-14:</Text>
            <Text style={styles.timelineDescription}>
              Muscles grow 109% faster by day 7 of hitting your daily protein goal. Visible gains start showing by week 3 and the habit of hitting your daily protein goal is set.
            </Text>
          </View>
        </View>

        {/* Progress Chart */}
        <ProgressChart />
        
        {/* Bottom spacing for floating button */}
        <View style={{ height: 80 }} />
      </ScrollView>
      
      {/* Floating CTA Button */}
      <View style={styles.floatingButtonContainer}>
        <TouchableOpacity style={styles.ctaButton} onPress={handleNext}>
          <Text style={styles.ctaButtonText}>Get started</Text>
        </TouchableOpacity>
      </View>

      {/* Edit Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditModal(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <TouchableOpacity 
            style={styles.modalOverlay} 
            activeOpacity={1} 
            onPress={() => setShowEditModal(false)}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Edit Daily Protein Goal</Text>
              
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={editedProteinGoal}
                  onChangeText={setEditedProteinGoal}
                  keyboardType="numeric"
                  placeholder="Enter protein goal"
                  placeholderTextColor="#999"
                  autoFocus
                  selectTextOnFocus
                  maxLength={3}
                />
                <Text style={styles.inputSuffix}>grams</Text>
              </View>
              
              <Text style={styles.helperText}>
                Recommended: {calculation?.dailyProtein || 145}g based on your profile
              </Text>
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={styles.cancelButton} 
                  onPress={() => setShowEditModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.saveButton} 
                  onPress={handleSaveProteinGoal}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  checkmarkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  dateSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  dateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  goalSection: {
    marginBottom: 30,
  },
  goalLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
    textAlign: 'center',
  },
  goalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  goalValue: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 4,
  },
  goalSubtext: {
    fontSize: 18,
    color: '#1A1A1A',
    textAlign: 'center',
  },
  benefitsList: {
    gap: 16,
    marginBottom: 40,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitCheckmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  benefitText: {
    fontSize: 16,
    color: '#1A1A1A',
    flex: 1,
  },
  motivationalSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  motivationalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'center',
    lineHeight: 32,
  },
  timelineSection: {
    marginBottom: 40,
  },
  timelineTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 20,
    textAlign: 'center',
  },
  timelineItem: {
    marginBottom: 20,
  },
  timelineDay: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  timelineDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  flipNote: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  flipNoteText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  chartContainer: {
    marginBottom: 40,
  },
  chartTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 20,
    textAlign: 'center',
  },
  chart: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  chartLabels: {
    position: 'absolute',
    right: 20,
    top: 30,
  },
  labelWithPlan: {
    marginBottom: 20,
  },
  labelWithoutPlan: {
    marginTop: 10,
  },
  labelText: {
    fontSize: 12,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  labelTextGrey: {
    fontSize: 12,
    color: '#999999',
  },
  xAxisLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  xAxisLabel: {
    fontSize: 11,
    color: '#999999',
    fontWeight: '500',
  },
  statContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 20,
  },
  statText: {
    fontSize: 16,
    color: '#1A1A1A',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
  },
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  ctaButton: {
    backgroundColor: '#000000',
    borderRadius: 29,
    height: 58,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  goalCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalTextContainer: {
    alignItems: 'center',
  },
  editButton: {
    position: 'absolute',
    right: 15,
    top: 15,
    padding: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
  },
  modalContainer: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxWidth: 320,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'center',
    paddingVertical: 12,
  },
  inputSuffix: {
    fontSize: 18,
    color: '#666666',
    marginLeft: 8,
  },
  helperText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#000000',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});