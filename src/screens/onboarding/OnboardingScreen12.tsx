import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useOnboarding } from '../../context/OnboardingContext';
import { Ionicons } from '@expo/vector-icons';
import { hapticFeedback } from '../../utils/haptics';

export default function OnboardingScreen12() {
  const navigation = useNavigation();
  const onboardingContext = useOnboarding();
  const [calculatedGoal, setCalculatedGoal] = useState<number>(140);
  const [selectedAdjustment, setSelectedAdjustment] = useState<string>('');

  const adjustmentOptions = [
    {
      id: 'perfect',
      text: 'Perfect, let\'s use this goal',
      icon: 'checkmark-circle',
      adjustment: 0,
    },
    {
      id: 'too-low',
      text: 'Seems too low, I want to aim higher',
      icon: 'trending-up',
      adjustment: 25,
    },
    {
      id: 'too-high',
      text: 'Seems too high, I want to start lower',
      icon: 'trending-down',
      adjustment: -25,
    },
    {
      id: 'custom',
      text: 'Let me set a custom amount',
      icon: 'create',
      adjustment: 'custom',
    },
  ];

  useEffect(() => {
    // Calculate protein goal based on user data
    const data = onboardingContext?.state?.data;
    if (data) {
      const goal = calculateProteinGoal(data);
      setCalculatedGoal(goal);
    }
  }, [onboardingContext?.state?.data]);

  const calculateProteinGoal = (data: any) => {
    // Enhanced calculation using additive approach
    // Base recommendation: ~1g per pound for men, 0.9g for women
    
    // Get weight in pounds
    let weightLbs = data.weightLbs || (data.weightKg ? data.weightKg * 2.205 : 150); // Default 150 lbs
    
    // Start with base multiplier based on sex
    let baseMultiplier = (data.sex === 'male' || data.sex === 'Male') ? 1.0 : 0.9;
    
    // Add adjustments based on activity level (collected but not previously used!)
    const activityAdjustments: { [key: string]: number } = {
      'sedentary': -0.2,      // 0.8g/lb total
      'lightly_active': -0.1,  // 0.9g/lb total
      'moderately_active': 0.0, // 1.0g/lb total
      'very_active': 0.15,     // 1.15g/lb total
      'extremely_active': 0.3  // 1.3g/lb total
    };
    
    // Add adjustment for fitness goal
    const goalAdjustments: { [key: string]: number } = {
      'Hit Protein Goal - Lose weight': 0.1,  // +0.1g/lb (preserve muscle in deficit)
      'Hit Protein Goal - Maintain': 0.0,     // No change
      'Hit Protein Goal - Gain weight': 0.15  // +0.15g/lb (support muscle growth)
    };
    
    // Add adjustment for exercise type (if strength training)
    const exerciseTypeAdjustment = 
      (data.exerciseType === 'strength' || data.exerciseType === 'both') ? 0.1 : 0.0;
    
    // Add age adjustment (older adults need more protein)
    let ageAdjustment = 0;
    if (data.age >= 65) {
      ageAdjustment = 0.15; // +0.15g/lb for 65+
    } else if (data.age >= 50) {
      ageAdjustment = 0.1;  // +0.1g/lb for 50-64
    }
    
    // Calculate total multiplier (additive, not multiplicative!)
    let totalMultiplier = baseMultiplier + 
      (activityAdjustments[data.activityLevel] || 0) +
      (goalAdjustments[data.fitnessGoal] || 0) +
      exerciseTypeAdjustment +
      ageAdjustment;
    
    // Apply reasonable bounds (0.8 to 1.5 g/lb)
    totalMultiplier = Math.max(0.8, Math.min(1.5, totalMultiplier));
    
    // Calculate protein goal
    let proteinGoal = Math.round(weightLbs * totalMultiplier);
    
    // Round to nearest 5 for cleaner numbers
    proteinGoal = Math.round(proteinGoal / 5) * 5;
    
    // Apply reasonable min/max limits
    proteinGoal = Math.max(50, Math.min(300, proteinGoal)); // 50g min, 300g max
    
    console.log('Protein calculation:', {
      weight: weightLbs,
      baseMultiplier,
      activityLevel: data.activityLevel,
      fitnessGoal: data.fitnessGoal,
      totalMultiplier,
      finalGoal: proteinGoal
    });
    
    return proteinGoal;
  };

  const handleNext = () => {
    if (selectedAdjustment && onboardingContext?.setProteinGoals) {
      hapticFeedback.success();
      let finalGoal = calculatedGoal;
      
      const selectedOption = adjustmentOptions.find(opt => opt.text === selectedAdjustment);
      if (selectedOption && typeof selectedOption.adjustment === 'number') {
        finalGoal = calculatedGoal + selectedOption.adjustment;
      }
      
      onboardingContext.setProteinGoals(finalGoal, 'grams');
      navigation.navigate('Final' as never);
    }
  };

  const handleBack = () => {
    hapticFeedback.light();
    navigation.goBack();
  };

  const renderIcon = (option: any) => {
    if (!option || !option.icon) return null;
    
    const isSelected = selectedAdjustment && selectedAdjustment === option.text;
    
    return (
      <Ionicons 
        name={option.icon} 
        size={24} 
        color={isSelected ? '#000000' : '#6B6B6B'} 
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <View style={styles.backButton} />
          <View style={styles.backButton} />
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '90%' }]} />
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>Your personalized protein goal</Text>
          
          <View style={styles.goalContainer}>
            <Text style={styles.goalNumber}>{calculatedGoal}</Text>
            <Text style={styles.goalUnit}>GRAMS OF PROTEIN PER DAY</Text>
            
            <Text style={styles.goalDescription}>
              This equals about:
            </Text>
            
            <View style={styles.examplesContainer}>
              <Text style={styles.exampleText}>• {Math.round(calculatedGoal / 35)} chicken breasts (6oz each)</Text>
              <Text style={styles.exampleText}>• {Math.round(calculatedGoal / 25)} protein shakes (25g each)</Text>
              <Text style={styles.exampleText}>• {Math.round(calculatedGoal / 20)} eggs + {Math.round(calculatedGoal / 40)} Greek yogurt cups</Text>
            </View>
          </View>

          <Text style={styles.question}>Does this goal feel right to you?</Text>

          <View style={styles.optionsContainer}>
            {adjustmentOptions.map((option) => {
              if (!option || !option.text || !option.id) return null;
              
              const isSelected = selectedAdjustment && selectedAdjustment === option.text;
              
              return (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.optionCard,
                    isSelected && styles.optionCardSelected,
                  ]}
                  onPress={() => {
                  hapticFeedback.selection();
                  setSelectedAdjustment(option.text);
                }}
                >
                  <View style={styles.optionContent}>
                    {renderIcon(option)}
                    <Text
                      style={[
                        styles.optionText,
                        isSelected && styles.optionTextSelected,
                      ]}
                    >
                      {option.text}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Next Button */}
      <TouchableOpacity
        style={[styles.nextButton, !selectedAdjustment && styles.nextButtonDisabled]}
        onPress={handleNext}
        disabled={!selectedAdjustment}
      >
        <Text style={styles.nextButtonText}>Continue</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    color: '#6B6B6B',
    textAlign: 'center',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E5E5',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#000000',
    borderRadius: 2,
  },
  scrollContent: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 30,
    textAlign: 'center',
  },
  goalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  goalNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  goalUnit: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 20,
    textAlign: 'center',
  },
  goalDescription: {
    fontSize: 16,
    color: '#6B6B6B',
    marginBottom: 12,
  },
  examplesContainer: {
    alignSelf: 'stretch',
  },
  exampleText: {
    fontSize: 14,
    color: '#6B6B6B',
    marginBottom: 4,
  },
  question: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 20,
    textAlign: 'center',
  },
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 29,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionCardSelected: {
    borderColor: '#000000',
    backgroundColor: '#F5F5F5',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    flex: 1,
    textAlign: 'left',
  },
  optionTextSelected: {
    color: '#000000',
  },
  nextButton: {
    backgroundColor: '#2D2D2D',
    borderRadius: 29,
    height: 58,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  nextButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});