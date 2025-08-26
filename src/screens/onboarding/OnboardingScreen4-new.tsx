import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useOnboarding } from '../../context/OnboardingContext';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

export default function OnboardingScreen4New() {
  const navigation = useNavigation();
  const { state, setGoalImportance } = useOnboarding();
  const [importance, setImportance] = useState<number>(() => {
    return (state?.data?.goalImportance) ? state.data.goalImportance : 5;
  });

  useEffect(() => {
    const goalImportance = state?.data?.goalImportance;
    setImportance(goalImportance || 5);
  }, [state?.data?.goalImportance]);

  const handleNext = () => {
    setGoalImportance(importance);
    navigation.navigate('Age' as never);
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const getImportanceLabel = (value: number) => {
    if (value <= 3) return 'Nice to have';
    if (value <= 7) return 'Moderately important';
    return 'Life-changing priority';
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
          <Text style={styles.progressText}>Step 4 of 13</Text>
          <View style={styles.backButton} />
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '30.8%' }]} />
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>How important is reaching your fitness goal?</Text>
        <Text style={styles.subtitle}>
          This helps us understand your commitment level and tailor recommendations accordingly.
        </Text>

        <View style={styles.sliderContainer}>
          <View style={styles.valueDisplay}>
            <Text style={styles.valueNumber}>{importance}</Text>
            <Text style={styles.valueLabel}>{getImportanceLabel(importance)}</Text>
          </View>

          <View style={styles.sliderWrapper}>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={10}
              step={1}
              value={importance}
              onValueChange={setImportance}
              minimumTrackTintColor="#007AFF"
              maximumTrackTintColor="#E5E5E5"
              thumbStyle={styles.sliderThumb}
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>1</Text>
              <Text style={styles.sliderLabel}>5</Text>
              <Text style={styles.sliderLabel}>10</Text>
            </View>
          </View>

          <View style={styles.descriptionContainer}>
            <View style={styles.descriptionItem}>
              <Text style={styles.descriptionNumber}>1</Text>
              <Text style={styles.descriptionText}>Nice to have</Text>
            </View>
            <View style={styles.descriptionItem}>
              <Text style={styles.descriptionNumber}>5</Text>
              <Text style={styles.descriptionText}>Moderately important</Text>
            </View>
            <View style={styles.descriptionItem}>
              <Text style={styles.descriptionNumber}>10</Text>
              <Text style={styles.descriptionText}>Life-changing priority</Text>
            </View>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B6B6B',
    marginBottom: 40,
    lineHeight: 22,
  },
  sliderContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  valueDisplay: {
    alignItems: 'center',
    marginBottom: 30,
  },
  valueNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
  },
  valueLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  sliderWrapper: {
    marginBottom: 20,
  },
  slider: {
    width: '100%',
    height: 40,
    marginBottom: 10,
  },
  sliderThumb: {
    backgroundColor: '#007AFF',
    width: 24,
    height: 24,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  sliderLabel: {
    fontSize: 14,
    color: '#6B6B6B',
    fontWeight: '500',
  },
  descriptionContainer: {
    gap: 12,
  },
  descriptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  descriptionNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    width: 20,
  },
  descriptionText: {
    fontSize: 14,
    color: '#6B6B6B',
    flex: 1,
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
  nextButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});