import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useOnboarding } from '../../context/OnboardingContext';
import { Ionicons } from '@expo/vector-icons';
import { hapticFeedback } from '../../utils/haptics';

export default function OnboardingScreen10() {
  const navigation = useNavigation();
  const { state, setExerciseType } = useOnboarding();
  const [selectedType, setSelectedType] = useState<string>(() => {
    return (state?.data?.exerciseType) ? state.data.exerciseType : '';
  });

  const exerciseTypes = [
    {
      id: 'mostly-weightlifting',
      text: 'Strength Training & Weightlifting',
    },
    {
      id: 'mostly-cardio',
      text: 'Cardiovascular Training',
    },
    {
      id: 'mostly-sports',
      text: 'Sports & Athletic Training',
    },
    {
      id: 'high-intensity',
      text: 'HIIT/CrossFit Training',
    },
    {
      id: 'flexibility',
      text: 'Yoga, Pilates, Stretching',
    },
  ];

  useEffect(() => {
    const exerciseType = state?.data?.exerciseType;
    setSelectedType(exerciseType || '');
  }, [state?.data?.exerciseType]);

  const handleNext = () => {
    if (selectedType) {
      hapticFeedback.medium();
      setExerciseType(selectedType);
      navigation.navigate('ExerciseFrequency' as never);
    }
  };

  const handleBack = () => {
    hapticFeedback.light();
    navigation.goBack();
  };


  // Early return if state is not ready
  if (!state) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
          <View style={[styles.progressFill, { width: '35%' }]} />
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>What kind of workouts do you do?</Text>
        <Text style={styles.subtitle}>
          This helps us generate your plan
        </Text>

        <View style={styles.optionsContainer}>
          {exerciseTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.optionCard,
                  (selectedType && selectedType === type.text) && styles.optionCardSelected,
                ]}
                onPress={() => {
                  hapticFeedback.selection();
                  setSelectedType(type.text);
                }}
              >
                <View style={styles.optionContent}>
                  <Text
                    style={[
                      styles.optionText,
                      (selectedType && selectedType === type.text) && styles.optionTextSelected,
                    ]}
                  >
                    {type.text}
                  </Text>
                </View>
              </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Next Button */}
      <TouchableOpacity
        style={[styles.nextButton, (!selectedType || selectedType.length === 0) && styles.nextButtonDisabled]}
        onPress={handleNext}
        disabled={!selectedType || selectedType.length === 0}
      >
        <Text style={styles.nextButtonText}>Next</Text>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B6B6B',
    marginBottom: 40,
    lineHeight: 24,
  },
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 29,
    padding: 20,
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
    backgroundColor: '#000000',
  },
  optionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    flex: 1,
    textAlign: 'left',
  },
  optionTextSelected: {
    color: '#FFFFFF',
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