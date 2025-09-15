import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useOnboarding } from '../../context/OnboardingContext';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { hapticFeedback } from '../../utils/haptics';

export default function OnboardingScreen6() {
  const navigation = useNavigation();
  const { state, setWeight: setWeightInContext } = useOnboarding();
  
  // Initialize with default 150 lbs
  const [weight, setWeight] = useState<number>(150);
  const [unit, setUnit] = useState<'lbs' | 'kg'>(state.data.weightUnit || 'lbs');
  const [lastHapticValue, setLastHapticValue] = useState<number>(150);

  useEffect(() => {
    // Initialize from context if available
    if (state.data.weightUnit) {
      setUnit(state.data.weightUnit);
      if (state.data.weightUnit === 'lbs' && state.data.weightLbs) {
        setWeight(state.data.weightLbs);
      } else if (state.data.weightUnit === 'kg' && state.data.weightKg) {
        setWeight(state.data.weightKg);
      } else {
        // Set default based on unit
        setWeight(unit === 'lbs' ? 150 : 68);
      }
    }
  }, [state.data, unit]);

  const handleNext = () => {
    hapticFeedback.medium();
    // Save to context
    if (unit === 'lbs') {
      setWeightInContext(unit, Math.round(weight));
    } else {
      setWeightInContext(unit, undefined, Math.round(weight));
    }
    navigation.navigate('ProteinAIComparison' as never);
  };

  const handleBack = () => {
    hapticFeedback.light();
    navigation.goBack();
  };

  // Slider ranges
  const minWeight = unit === 'lbs' ? 50 : 23;
  const maxWeight = unit === 'lbs' ? 400 : 181;

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
          <View style={[styles.progressFill, { width: '45%' }]} />
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>What's your weight?</Text>
        <Text style={styles.subtitle}>
          Current weight helps us personalize your protein targets.
        </Text>

        {/* Unit Selector */}
        <View style={styles.unitSelector}>
          <TouchableOpacity
            style={[styles.unitButton, unit === 'lbs' && styles.unitButtonSelected]}
            onPress={() => {
              hapticFeedback.selection();
              setUnit('lbs');
              // Convert weight when switching units
              if (unit === 'kg') {
                setWeight(Math.round(weight * 2.20462));
              }
            }}
          >
            <Text style={[styles.unitButtonText, unit === 'lbs' && styles.unitButtonTextSelected]}>
              LBS
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.unitButton, unit === 'kg' && styles.unitButtonSelected]}
            onPress={() => {
              hapticFeedback.selection();
              setUnit('kg');
              // Convert weight when switching units
              if (unit === 'lbs') {
                setWeight(Math.round(weight * 0.453592));
              }
            }}
          >
            <Text style={[styles.unitButtonText, unit === 'kg' && styles.unitButtonTextSelected]}>
              KG
            </Text>
          </TouchableOpacity>
        </View>

        {/* Weight Display */}
        <View style={styles.weightDisplay}>
          <Text style={styles.weightValue}>
            {Math.round(weight)} {unit}
          </Text>
        </View>

        {/* Weight Slider */}
        <View style={styles.sliderContainer}>
          <Slider
            style={styles.slider}
            minimumValue={minWeight}
            maximumValue={maxWeight}
            value={weight}
            step={1}
            onValueChange={(value) => {
              setWeight(value);
              // Trigger haptic every 5 units to avoid too many haptics
              if (Math.abs(value - lastHapticValue) >= 5) {
                hapticFeedback.selection();
                setLastHapticValue(value);
              }
            }}
            onSlidingStart={() => hapticFeedback.light()}
            onSlidingComplete={(value) => {
              hapticFeedback.medium();
              setWeight(value);
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
            <Text style={styles.maxWeightLabel}>
              {maxWeight} {unit}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Next Button */}
      <TouchableOpacity
        style={styles.nextButton}
        onPress={handleNext}
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
  weightDisplay: {
    alignItems: 'center',
    marginBottom: 60,
    marginTop: 40,
  },
  weightValue: {
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
  maxWeightLabel: {
    fontSize: 14,
    color: '#6B6B6B',
    textAlign: 'right',
    paddingRight: 10,
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
  nextButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});