import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useOnboarding } from '../../context/OnboardingContext';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

export default function OnboardingScreen10() {
  const navigation = useNavigation();
  const { state, setExerciseType } = useOnboarding();
  const [selectedType, setSelectedType] = useState<string>(() => {
    return (state?.data?.exerciseType) ? state.data.exerciseType : '';
  });

  const exerciseTypes = [
    {
      id: 'strength-training',
      text: 'Strength training / Weightlifting',
      icon: 'barbell',
      iconLib: 'Ionicons',
    },
    {
      id: 'cardio',
      text: 'Cardio (running, cycling, swimming)',
      icon: 'heart',
      iconLib: 'Ionicons',
    },
    {
      id: 'sports',
      text: 'Sports (basketball, soccer, tennis, etc.)',
      icon: 'basketball',
      iconLib: 'Ionicons',
    },
    {
      id: 'yoga-pilates',
      text: 'Yoga / Pilates / Stretching',
      icon: 'body',
      iconLib: 'Ionicons',
    },
    {
      id: 'hiit',
      text: 'High-intensity workouts (CrossFit, HIIT)',
      icon: 'flash',
      iconLib: 'Ionicons',
    },
    {
      id: 'walking',
      text: 'Walking / Light activity',
      icon: 'walk',
      iconLib: 'Ionicons',
    },
    {
      id: 'mixed',
      text: 'Mixed - I do different types',
      icon: 'shuffle',
      iconLib: 'Ionicons',
    },
  ];

  useEffect(() => {
    const exerciseType = state?.data?.exerciseType;
    setSelectedType(exerciseType || '');
  }, [state?.data?.exerciseType]);

  const handleNext = () => {
    if (selectedType) {
      setExerciseType(selectedType);
      navigation.navigate('DreamOutcome' as never);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const renderIcon = (type: any) => {
    const IconComponent = type.iconLib === 'MaterialIcons' ? MaterialIcons : Ionicons;
    
    return (
      <IconComponent 
        name={type.icon} 
        size={24} 
        color={(selectedType && selectedType === type.text) ? '#007AFF' : '#6B6B6B'} 
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
          <Text style={styles.progressText}>Step 10 of 13</Text>
          <View style={styles.backButton} />
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '76.9%' }]} />
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>What type of exercise do you do most?</Text>
        <Text style={styles.subtitle}>
          Understanding your exercise type helps us fine-tune your protein recommendations.
        </Text>

        <View style={styles.optionsContainer}>
          {exerciseTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.optionCard,
                (selectedType && selectedType === type.text) && styles.optionCardSelected,
              ]}
              onPress={() => setSelectedType(type.text)}
            >
              <View style={styles.optionContent}>
                {renderIcon(type)}
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
      </View>

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