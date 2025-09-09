import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useOnboarding } from '../../context/OnboardingContext';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { hapticFeedback } from '../../utils/haptics';


export default function OnboardingScreen5() {
  const navigation = useNavigation();
  const { state, setHeight: setHeightInContext } = useOnboarding();
  
  // Initialize with default 5'6" (66 inches total)
  const [totalInches, setTotalInches] = useState<number>(66); // 5'6" = 66 inches
  const [unit, setUnit] = useState<'ft' | 'cm'>(state.data.heightUnit || 'ft');
  const [lastHapticValue, setLastHapticValue] = useState<number>(66);

  const handleNext = () => {
    hapticFeedback.medium();
    // Convert totalInches to feet/inches and cm for context
    const feet = Math.floor(totalInches / 12);
    const inches = totalInches % 12;
    const cm = Math.round(totalInches * 2.54);
    
    if (unit === 'ft') {
      setHeightInContext(unit, feet, inches);
    } else {
      setHeightInContext(unit, undefined, undefined, cm);
    }
    navigation.navigate('TrackingExperience' as never);
  };

  const handleBack = () => {
    hapticFeedback.light();
    navigation.goBack();
  };

  // Slider ranges in total inches
  const minTotalInches = 36; // 3'0"
  const maxTotalInches = 96; // 8'0"
  
  // Helper functions for display
  const formatHeight = () => {
    if (unit === 'ft') {
      const feet = Math.floor(totalInches / 12);
      const inches = totalInches % 12;
      return `${feet}' ${inches}"`;
    } else {
      const cm = Math.round(totalInches * 2.54);
      return `${cm} cm`;
    }
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
            <View style={[styles.progressFill, { width: '15%' }]} />
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
              onPress={() => {
                hapticFeedback.selection();
                setUnit('ft');
              }}
            >
              <Text style={[styles.unitButtonText, unit === 'ft' && styles.unitButtonTextSelected]}>
                Feet
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.unitButton, unit === 'cm' && styles.unitButtonSelected]}
              onPress={() => {
                hapticFeedback.selection();
                setUnit('cm');
              }}
            >
              <Text style={[styles.unitButtonText, unit === 'cm' && styles.unitButtonTextSelected]}>
                CM
              </Text>
            </TouchableOpacity>
          </View>

          {/* Height Display */}
          <View style={styles.heightDisplay}>
            <Text style={styles.heightValue}>
              {formatHeight()}
            </Text>
          </View>

          {/* Single Height Slider */}
          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              minimumValue={minTotalInches}
              maximumValue={maxTotalInches}
              value={totalInches}
              step={1}
              onValueChange={(value) => {
                setTotalInches(value);
                // Trigger haptic every 2 inches to avoid too many haptics
                if (Math.abs(value - lastHapticValue) >= 2) {
                  hapticFeedback.selection();
                  setLastHapticValue(value);
                }
              }}
              onSlidingStart={() => hapticFeedback.light()}
              onSlidingComplete={(value) => {
                hapticFeedback.medium();
                setTotalInches(value);
              }}
              minimumTrackTintColor="#000000"
              maximumTrackTintColor="#E5E5E5"
            />
            <View style={styles.sliderLabels}>
              <View style={styles.tickMarks}>
                {Array.from({ length: 21 }, (_, i) => (
                  <View key={i} style={styles.tickMark} />
                ))}
              </View>
              <Text style={styles.maxHeightLabel}>
                {unit === 'ft' ? "8' 0\"" : '244 cm'}
              </Text>
            </View>
          </View>
        </View>

        {/* Next Button */}
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
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
    marginRight: 15,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E5E5',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2D2D2D',
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
    borderRadius: 29,
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
    color: '#000000',
    fontWeight: '600',
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
  heightDisplay: {
    alignItems: 'center',
    marginBottom: 60,
    marginTop: 80,
  },
  heightValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  sliderContainer: {
    paddingHorizontal: 10,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    marginTop: 10,
    position: 'relative',
  },
  tickMarks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  tickMark: {
    width: 1,
    height: 8,
    backgroundColor: '#D1D1D1',
  },
  maxHeightLabel: {
    fontSize: 14,
    color: '#6B6B6B',
    textAlign: 'right',
    paddingRight: 10,
  },
  unitSelector: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
    borderRadius: 29,
    padding: 4,
    marginTop: 30,
    marginBottom: 10,
  },
  unitButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
  },
  unitButtonSelected: {
    backgroundColor: '#000000',
  },
  unitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
  },
  unitButtonTextSelected: {
    color: '#FFFFFF',
  },
});