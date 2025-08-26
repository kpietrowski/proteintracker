import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useOnboarding } from '../../context/OnboardingContext';
import { Ionicons } from '@expo/vector-icons';

export default function OnboardingScreen9() {
  const navigation = useNavigation();
  const { state, setExerciseFrequency } = useOnboarding();
  const [selectedFrequency, setSelectedFrequency] = useState<string>(() => {
    return (state?.data?.exerciseFrequency) ? state.data.exerciseFrequency : '';
  });

  const exerciseFrequencies = [
    {
      id: 'no-exercise',
      text: 'I don\'t exercise regularly',
      icon: 'bed-outline',
      iconLib: 'Ionicons',
    },
    {
      id: '1-2-times',
      text: '1-2 times per week',
      icon: 'walk',
      iconLib: 'Ionicons',
    },
    {
      id: '3-4-times',
      text: '3-4 times per week',
      icon: 'fitness',
      iconLib: 'Ionicons',
    },
    {
      id: '5-6-times',
      text: '5-6 times per week',
      icon: 'barbell',
      iconLib: 'Ionicons',
    },
    {
      id: 'daily',
      text: 'Daily (7+ times per week)',
      icon: 'trophy',
      iconLib: 'Ionicons',
    },
  ];

  useEffect(() => {
    const exerciseFrequency = state?.data?.exerciseFrequency;
    setSelectedFrequency(exerciseFrequency || '');
  }, [state?.data?.exerciseFrequency]);

  const handleNext = () => {
    if (selectedFrequency) {
      setExerciseFrequency(selectedFrequency);
      // If user doesn't exercise regularly, skip to Screen 11 (Dream Outcome)
      if (selectedFrequency === 'I don\'t exercise regularly') {
        navigation.navigate('DreamOutcome' as never);
      } else {
        navigation.navigate('ExerciseType' as never);
      }
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const renderIcon = (frequency: any) => {
    return (
      <Ionicons 
        name={frequency.icon} 
        size={24} 
        color={(selectedFrequency && selectedFrequency === frequency.text) ? '#007AFF' : '#6B6B6B'} 
      />
    );
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
            <Ionicons name="chevron-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.progressText}>Step 9 of 13</Text>
          <View style={styles.backButton} />
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '69.2%' }]} />
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>How often do you exercise?</Text>
        <Text style={styles.subtitle}>
          This helps us calculate your daily protein needs accurately.
        </Text>

        <View style={styles.optionsContainer}>
          {exerciseFrequencies.map((frequency) => (
            <TouchableOpacity
              key={frequency.id}
              style={[
                styles.optionCard,
                (selectedFrequency && selectedFrequency === frequency.text) && styles.optionCardSelected,
              ]}
              onPress={() => setSelectedFrequency(frequency.text)}
            >
              <View style={styles.optionContent}>
                {renderIcon(frequency)}
                <Text
                  style={[
                    styles.optionText,
                    (selectedFrequency && selectedFrequency === frequency.text) && styles.optionTextSelected,
                  ]}
                >
                  {frequency.text}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Next Button */}
      <TouchableOpacity
        style={[styles.nextButton, (!selectedFrequency || selectedFrequency.length === 0) && styles.nextButtonDisabled]}
        onPress={handleNext}
        disabled={!selectedFrequency || selectedFrequency.length === 0}
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
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
    borderRadius: 12,
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
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  optionText: {
    fontSize: 18,
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