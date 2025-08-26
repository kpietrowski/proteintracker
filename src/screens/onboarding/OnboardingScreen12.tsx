import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useOnboarding } from '../../context/OnboardingContext';
import { Ionicons } from '@expo/vector-icons';

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
    // Simplified calculation - in real app this would use the full algorithm
    let baseGoal = 140; // Default
    
    // Adjust based on weight if available
    if (data.weightLbs) {
      baseGoal = Math.round(data.weightLbs * 0.8);
    } else if (data.weightKg) {
      baseGoal = Math.round(data.weightKg * 1.8);
    }
    
    // Adjust based on goal
    if (data.fitnessGoal?.includes('muscle')) {
      baseGoal = Math.round(baseGoal * 1.3);
    } else if (data.fitnessGoal?.includes('weight')) {
      baseGoal = Math.round(baseGoal * 1.4);
    }
    
    // Round to nearest 5
    return Math.round(baseGoal / 5) * 5;
  };

  const handleNext = () => {
    if (selectedAdjustment && onboardingContext?.setProteinGoals) {
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
    navigation.goBack();
  };

  const renderIcon = (option: any) => {
    if (!option || !option.icon) return null;
    
    const isSelected = selectedAdjustment && selectedAdjustment === option.text;
    
    return (
      <Ionicons 
        name={option.icon} 
        size={24} 
        color={isSelected ? '#007AFF' : '#6B6B6B'} 
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.progressText}>Step 12 of 13</Text>
          <View style={styles.backButton} />
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '92.3%' }]} />
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
                  onPress={() => setSelectedAdjustment(option.text)}
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
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    backgroundColor: '#007AFF',
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
    color: '#007AFF',
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
    borderRadius: 12,
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
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    flex: 1,
  },
  optionTextSelected: {
    color: '#007AFF',
  },
  nextButton: {
    backgroundColor: '#2D2D2D',
    borderRadius: 12,
    height: 50,
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