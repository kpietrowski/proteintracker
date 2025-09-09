import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useOnboarding } from '../../context/OnboardingContext';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { hapticFeedback } from '../../utils/haptics';

export default function OnboardingScreen15() {
  const navigation = useNavigation();
  const { state } = useOnboarding();
  const [desiredWeight, setDesiredWeightLocal] = useState<number>(150);
  const [weightUnit, setWeightUnit] = useState<'lbs' | 'kg'>('lbs');
  const [lastHapticValue, setLastHapticValue] = useState<number>(150);

  useEffect(() => {
    // Initialize from context if available
    if (state?.data?.weightUnit) {
      setWeightUnit(state.data.weightUnit);
    }
  }, [state?.data]);

  const handleNext = () => {
    hapticFeedback.medium();
    // Store desired weight locally if needed
    navigation.navigate('ProteinProgressConcern' as never);
  };

  const handleBack = () => {
    hapticFeedback.light();
    navigation.goBack();
  };

  const minWeight = weightUnit === 'lbs' ? 50 : 23;
  const maxWeight = weightUnit === 'lbs' ? 400 : 181;

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
          <View style={[styles.progressFill, { width: '55%' }]} />
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>What is your desired weight?</Text>

        <View style={styles.weightDisplay}>
          <Text style={styles.weightValue}>
            {Math.round(desiredWeight)} {weightUnit}
          </Text>
        </View>

        <View style={styles.sliderContainer}>
          <Slider
            style={styles.slider}
            minimumValue={minWeight}
            maximumValue={maxWeight}
            value={desiredWeight}
            onValueChange={(value) => {
              setDesiredWeightLocal(value);
              // Trigger haptic every 5 units to avoid too many haptics
              const rounded = Math.round(value);
              if (Math.abs(rounded - lastHapticValue) >= 5) {
                hapticFeedback.selection();
                setLastHapticValue(rounded);
              }
            }}
            onSlidingStart={() => {
              hapticFeedback.light();
            }}
            onSlidingComplete={(value) => {
              hapticFeedback.medium();
              setDesiredWeightLocal(value);
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
              {maxWeight} {weightUnit}
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
    marginBottom: 80,
  },
  weightDisplay: {
    alignItems: 'center',
    marginBottom: 60,
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
  sliderThumb: {
    backgroundColor: '#000000',
    width: 24,
    height: 24,
    borderRadius: 29,
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