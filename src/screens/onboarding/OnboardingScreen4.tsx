import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useOnboarding } from '../../context/OnboardingContext';
import { hapticFeedback } from '../../utils/haptics';

export default function OnboardingScreen4() {
  const navigation = useNavigation();
  const { state, setAge: setAgeInContext } = useOnboarding();
  const [age, setAge] = useState<string>(state.data.age ? state.data.age.toString() : '35');
  const [isValid, setIsValid] = useState<boolean>(true);

  useEffect(() => {
    if (state.data.age) {
      setAge(state.data.age.toString());
    }
  }, [state.data.age]);

  const handleNext = () => {
    hapticFeedback.medium();
    const ageNumber = parseInt(age);
    if (isValidAge(ageNumber)) {
      setAgeInContext(ageNumber);
      navigation.navigate('Height' as never);
    }
  };

  const handleBack = () => {
    hapticFeedback.light();
    navigation.goBack();
  };

  const isValidAge = (ageValue: number): boolean => {
    return !isNaN(ageValue) && ageValue >= 13 && ageValue <= 120;
  };

  const handleAgeChange = (text: string) => {
    setAge(text);
    const ageNumber = parseInt(text);
    setIsValid(text === '' || isValidAge(ageNumber));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
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
              <View style={[styles.progressFill, { width: '10%' }]} />
            </View>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.title}>How old are you?</Text>
            <Text style={styles.subtitle}>
              Age helps us calculate your personalized protein needs.
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Enter your age:</Text>
              <TextInput
                style={[
                  styles.ageInput,
                  !isValid && styles.ageInputError
                ]}
                value={age}
                onChangeText={handleAgeChange}
                placeholder="35"
                placeholderTextColor="#999"
                keyboardType="numeric"
                maxLength={3}
                onSubmitEditing={Keyboard.dismiss}
                returnKeyType="done"
              />
              {!isValid && (
                <Text style={styles.errorText}>
                  Please enter a valid age (13-120)
                </Text>
              )}
            </View>
          </View>

          {/* Next Button */}
          <TouchableOpacity
            style={[
              styles.nextButton,
              (!age || !isValid) && styles.nextButtonDisabled
            ]}
            onPress={handleNext}
            disabled={!age || !isValid}
          >
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
      </View>
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
  progressText: {
    fontSize: 14,
    color: '#6B6B6B',
    textAlign: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
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
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 15,
    textAlign: 'center',
  },
  ageInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  ageInputError: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FFF5F5',
  },
  errorText: {
    fontSize: 14,
    color: '#FF6B6B',
    textAlign: 'center',
    marginTop: 8,
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
    opacity: 0.6,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});