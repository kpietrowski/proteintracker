import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Keyboard, TouchableWithoutFeedback, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useOnboarding } from '../../context/OnboardingContext';

export default function OnboardingScreen6() {
  const navigation = useNavigation();
  const { state, setWeight: setWeightInContext } = useOnboarding();
  
  // Initialize from context
  const [weight, setWeight] = useState<string>(
    state.data.weightUnit === 'lbs' && state.data.weightLbs 
      ? state.data.weightLbs.toString()
      : state.data.weightUnit === 'kg' && state.data.weightKg
      ? state.data.weightKg.toString()
      : ''
  );
  const [unit, setUnit] = useState<'lbs' | 'kg'>(state.data.weightUnit || 'lbs');

  useEffect(() => {
    // Update local state when context changes
    if (state.data.weightUnit) {
      setUnit(state.data.weightUnit);
      if (state.data.weightUnit === 'lbs' && state.data.weightLbs) {
        setWeight(state.data.weightLbs.toString());
      } else if (state.data.weightUnit === 'kg' && state.data.weightKg) {
        setWeight(state.data.weightKg.toString());
      }
    }
  }, [state.data]);

  const handleNext = () => {
    if (isValidWeight) {
      // Save to context
      if (unit === 'lbs') {
        setWeightInContext(unit, parseInt(weight));
      } else {
        setWeightInContext(unit, undefined, parseInt(weight));
      }
      navigation.navigate('ActivityLevel' as never);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleDone = () => {
    Keyboard.dismiss();
  };

  const KeyboardToolbar = () => (
    <View style={styles.keyboardToolbar}>
      <View style={styles.toolbarSpacer} />
      <TouchableOpacity onPress={handleDone} style={styles.toolbarDoneButton}>
        <Text style={styles.toolbarDoneText}>Done</Text>
      </TouchableOpacity>
    </View>
  );

  const isValidWeight = weight && (
    unit === 'lbs' 
      ? parseInt(weight) >= 50 && parseInt(weight) <= 500
      : parseInt(weight) >= 20 && parseInt(weight) <= 250
  );

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '66%' }]} />
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>What's your weight?</Text>
        <Text style={styles.subtitle}>
          Current weight helps us personalize your protein targets.
        </Text>

        {/* Unit Selector */}
        <View style={styles.unitSelector}>
          <TouchableOpacity
            style={[styles.unitButton, unit === 'lbs' && styles.unitButtonSelected]}
            onPress={() => setUnit('lbs')}
          >
            <Text style={[styles.unitButtonText, unit === 'lbs' && styles.unitButtonTextSelected]}>
              LBS
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.unitButton, unit === 'kg' && styles.unitButtonSelected]}
            onPress={() => setUnit('kg')}
          >
            <Text style={[styles.unitButtonText, unit === 'kg' && styles.unitButtonTextSelected]}>
              KG
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={weight}
            onChangeText={setWeight}
            placeholder={unit === 'lbs' ? "150" : "70"}
            placeholderTextColor="#999"
            keyboardType="numeric"
            returnKeyType="done"
            onSubmitEditing={() => Keyboard.dismiss()}
            blurOnSubmit={true}
            {...(Platform.OS === 'ios' && { inputAccessoryView: <KeyboardToolbar /> })}
          />
          <Text style={styles.unitLabel}>
            {unit}
          </Text>
        </View>

        {weight && !isValidWeight && (
          <Text style={styles.errorText}>
            Please enter a valid weight {unit === 'lbs' ? '(50-500 lbs)' : '(20-250 kg)'}
          </Text>
        )}
          </View>

          {/* Next Button */}
          <TouchableOpacity
            style={[styles.nextButton, !isValidWeight && styles.nextButtonDisabled]}
            onPress={handleNext}
            disabled={!isValidWeight}
          >
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backArrow: {
    fontSize: 24,
    color: '#1A1A1A',
  },
  progressBar: {
    flex: 1,
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
  unitSelector: {
    flexDirection: 'row',
    backgroundColor: '#E5E5E5',
    borderRadius: 8,
    padding: 4,
    marginBottom: 20,
  },
  unitButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  unitButtonSelected: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  unitButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B6B6B',
  },
  unitButtonTextSelected: {
    color: '#1A1A1A',
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    fontSize: 24,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  unitLabel: {
    fontSize: 18,
    fontWeight: '500',
    color: '#6B6B6B',
    marginLeft: 10,
  },
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    textAlign: 'center',
    marginTop: 10,
  },
  keyboardToolbar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#CCCCCC',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  toolbarSpacer: {
    flex: 1,
  },
  toolbarDoneButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  toolbarDoneText: {
    fontSize: 17,
    color: '#007AFF',
    fontWeight: '600',
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