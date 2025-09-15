import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useOnboarding } from '../../context/OnboardingContext';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { hapticFeedback } from '../../utils/haptics';

export default function OnboardingScreen11() {
  const navigation = useNavigation();
  const onboardingContext = useOnboarding();
  const [selectedOutcome, setSelectedOutcome] = useState<string>('');

  const dreamOutcomes = [
    {
      id: 'visible-muscle',
      text: 'Visible muscle definition',
      icon: 'fitness',
      iconLib: 'Ionicons',
    },
    {
      id: 'target-weight',
      text: 'Hit my target weight while staying strong',
      icon: 'scale',
      iconLib: 'Ionicons',
    },
    {
      id: 'crush-prs',
      text: 'Crush my fitness PRs',
      icon: 'trophy',
      iconLib: 'Ionicons',
    },
    {
      id: 'confident-energetic',
      text: 'Feel confident and energetic daily',
      icon: 'happy',
      iconLib: 'Ionicons',
    },
    {
      id: 'favorite-clothes',
      text: 'Fit into my favorite clothes again',
      icon: 'shirt',
      iconLib: 'Ionicons',
    },
    {
      id: 'fitness-challenge',
      text: 'Complete a fitness challenge/competition',
      icon: 'medal',
      iconLib: 'Ionicons',
    },
  ];

  useEffect(() => {
    if (onboardingContext?.state?.data?.dreamOutcome) {
      setSelectedOutcome(onboardingContext.state.data.dreamOutcome);
    }
  }, [onboardingContext?.state?.data?.dreamOutcome]);

  const handleNext = () => {
    if (selectedOutcome && onboardingContext?.setDreamOutcome) {
      hapticFeedback.medium();
      onboardingContext.setDreamOutcome(selectedOutcome);
      navigation.navigate('Final' as never);
    }
  };

  const handleBack = () => {
    hapticFeedback.light();
    navigation.goBack();
  };

  const renderIcon = (outcome: any) => {
    if (!outcome || !outcome.icon || !outcome.text) {
      return null;
    }
    
    const IconComponent = outcome.iconLib === 'MaterialIcons' ? MaterialIcons : Ionicons;
    const isSelected = selectedOutcome && outcome.text && selectedOutcome === outcome.text;
    
    return (
      <IconComponent 
        name={outcome.icon} 
        size={24} 
        color={isSelected ? '#000000' : '#6B6B6B'} 
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
          <View style={[styles.progressFill, { width: '84.6%' }]} />
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>What's your dream outcome in 6 months?</Text>
        <Text style={styles.subtitle}>
          Visualizing your goal helps maintain motivation and commitment to your protein journey.
        </Text>

        <View style={styles.optionsContainer}>
          {dreamOutcomes.map((outcome) => {
            if (!outcome || !outcome.text || !outcome.id) return null;
            
            const isSelected = selectedOutcome && selectedOutcome === outcome.text;
            
            return (
              <TouchableOpacity
                key={outcome.id}
                style={[
                  styles.optionCard,
                  isSelected && styles.optionCardSelected,
                ]}
                onPress={() => {
                  hapticFeedback.selection();
                  setSelectedOutcome(outcome.text);
                }}
              >
                <View style={styles.optionContent}>
                  {renderIcon(outcome)}
                  <Text
                    style={[
                      styles.optionText,
                      isSelected && styles.optionTextSelected,
                    ]}
                  >
                    {outcome.text}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Next Button */}
      <TouchableOpacity
        style={[styles.nextButton, !selectedOutcome && styles.nextButtonDisabled]}
        onPress={handleNext}
        disabled={!selectedOutcome}
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
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 29,
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
    borderColor: '#000000',
    backgroundColor: '#000000',
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
});