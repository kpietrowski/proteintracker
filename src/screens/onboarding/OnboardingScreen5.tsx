import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Keyboard, TouchableWithoutFeedback, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useOnboarding } from '../../context/OnboardingContext';

export default function OnboardingScreen5() {
  const navigation = useNavigation();
  const { state, setHeight: setHeightInContext } = useOnboarding();
  
  // Initialize from context
  const [height, setHeight] = useState<string>(state.data.heightCm ? state.data.heightCm.toString() : '');
  const [feet, setFeet] = useState<string>(state.data.heightFt ? state.data.heightFt.toString() : '');
  const [inches, setInches] = useState<string>(state.data.heightIn !== undefined ? state.data.heightIn.toString() : '');
  const [unit, setUnit] = useState<'ft' | 'cm'>(state.data.heightUnit || 'ft');

  useEffect(() => {
    // Update local state when context changes
    if (state.data.heightUnit) {
      setUnit(state.data.heightUnit);
      if (state.data.heightUnit === 'cm' && state.data.heightCm) {
        setHeight(state.data.heightCm.toString());
      } else if (state.data.heightUnit === 'ft') {
        if (state.data.heightFt) setFeet(state.data.heightFt.toString());
        if (state.data.heightIn !== undefined) setInches(state.data.heightIn.toString());
      }
    }
  }, [state.data]);

  const handleNext = () => {
    if (isValidHeight) {
      // Save to context
      if (unit === 'ft') {
        setHeightInContext(unit, parseInt(feet), parseInt(inches));
      } else {
        setHeightInContext(unit, undefined, undefined, parseInt(height));
      }
      navigation.navigate('Weight' as never);
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

  const isValidHeight = unit === 'ft' 
    ? (feet && inches !== '' && 
       parseInt(feet) >= 3 && parseInt(feet) <= 8 && 
       parseInt(inches) >= 0 && parseInt(inches) <= 11)
    : (height && parseInt(height) >= 90 && parseInt(height) <= 250);

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
          <View style={[styles.progressFill, { width: '55%' }]} />
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>What's your height?</Text>
        <Text style={styles.subtitle}>
          Height helps us calculate your protein needs more accurately.
        </Text>

        {/* Unit Selector */}
        <View style={styles.unitSelector}>
          <TouchableOpacity
            style={[styles.unitButton, unit === 'ft' && styles.unitButtonSelected]}
            onPress={() => setUnit('ft')}
          >
            <Text style={[styles.unitButtonText, unit === 'ft' && styles.unitButtonTextSelected]}>
              Feet
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.unitButton, unit === 'cm' && styles.unitButtonSelected]}
            onPress={() => setUnit('cm')}
          >
            <Text style={[styles.unitButtonText, unit === 'cm' && styles.unitButtonTextSelected]}>
              CM
            </Text>
          </TouchableOpacity>
        </View>

        {unit === 'ft' ? (
          <View style={styles.feetInchesContainer}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={feet}
                onChangeText={setFeet}
                placeholder="5"
                placeholderTextColor="#999"
                keyboardType="numeric"
                maxLength={1}
                returnKeyType="next"
                blurOnSubmit={false}
                {...(Platform.OS === 'ios' && { inputAccessoryView: <KeyboardToolbar /> })}
              />
              <Text style={styles.unitLabel}>ft</Text>
            </View>
            
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={inches}
                onChangeText={setInches}
                placeholder="8"
                placeholderTextColor="#999"
                keyboardType="numeric"
                maxLength={2}
                returnKeyType="done"
                onSubmitEditing={() => Keyboard.dismiss()}
                blurOnSubmit={true}
                {...(Platform.OS === 'ios' && { inputAccessoryView: <KeyboardToolbar /> })}
              />
              <Text style={styles.unitLabel}>in</Text>
            </View>
          </View>
        ) : (
          <View style={[styles.inputContainer, styles.singleInputContainer]}>
            <TextInput
              style={styles.input}
              value={height}
              onChangeText={setHeight}
              placeholder="175"
              placeholderTextColor="#999"
              keyboardType="numeric"
              returnKeyType="done"
              onSubmitEditing={() => Keyboard.dismiss()}
              blurOnSubmit={true}
              {...(Platform.OS === 'ios' && { inputAccessoryView: <KeyboardToolbar /> })}
            />
            <Text style={styles.unitLabel}>cm</Text>
          </View>
        )}

        {((unit === 'ft' && feet && inches) || (unit === 'cm' && height)) && !isValidHeight && (
          <Text style={styles.errorText}>
            Please enter a valid height {unit === 'ft' ? '(3\'0" - 8\'11")' : '(90-250 cm)'}
          </Text>
        )}
          </View>

          {/* Next Button */}
          <TouchableOpacity
            style={[styles.nextButton, !isValidHeight && styles.nextButtonDisabled]}
            onPress={handleNext}
            disabled={!isValidHeight}
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
  feetInchesContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  inputContainer: {
    flex: 1,
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
  },
  singleInputContainer: {
    flex: 0,
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