import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useOnboarding } from '../../context/OnboardingContext';
import { Ionicons } from '@expo/vector-icons';
import { hapticFeedback } from '../../utils/haptics';

export default function OnboardingScreen17() {
  const navigation = useNavigation();
  const { state } = useOnboarding();
  const [selectedOption, setSelectedOption] = useState<string>('');

  const options = [
    {
      id: 'no',
      text: 'No',
      icon: 'thumbs-down',
    },
    {
      id: 'yes',
      text: 'Yes',
      icon: 'thumbs-up',
    },
  ];

  useEffect(() => {
    // Initialize if needed
  }, [state?.data]);

  const handleNext = () => {
    hapticFeedback.medium();
    // Store selection locally if needed
    navigation.navigate('PotentialToCrush' as never);
  };

  const handleBack = () => {
    hapticFeedback.light();
    navigation.goBack();
  };

  const renderIcon = (option: any) => {
    return (
      <Ionicons 
        name={option.icon} 
        size={24} 
        color={selectedOption === option.text ? '#FFFFFF' : '#6B6B6B'} 
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
          <View style={[styles.progressFill, { width: '65%' }]} />
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>
          Are you ready to hit your daily protein goal
        </Text>

        <View style={styles.optionsContainer}>
          {options.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionCard,
                selectedOption === option.text && styles.optionCardSelected,
              ]}
              onPress={() => {
                hapticFeedback.selection();
                setSelectedOption(option.text);
              }}
            >
              <View style={styles.optionContent}>
                {renderIcon(option)}
                <Text
                  style={[
                    styles.optionText,
                    selectedOption === option.text && styles.optionTextSelected,
                  ]}
                >
                  {option.text}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Next Button */}
      <TouchableOpacity
        style={[styles.nextButton, selectedOption && styles.nextButtonEnabled]}
        onPress={handleNext}
        disabled={!selectedOption}
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 60,
    lineHeight: 40,
  },
  optionsContainer: {
    gap: 16,
  },
  optionCard: {
    backgroundColor: '#E5E5E5',
    borderRadius: 29,
    padding: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionCardSelected: {
    borderColor: '#000000',
    backgroundColor: '#000000',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
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
    backgroundColor: '#CCCCCC',
    borderRadius: 29,
    height: 58,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  nextButtonEnabled: {
    backgroundColor: '#2D2D2D',
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});