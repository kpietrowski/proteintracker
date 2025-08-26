import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useOnboarding } from '../../context/OnboardingContext';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

export default function OnboardingScreen3() {
  const navigation = useNavigation();
  const { state, setNutritionChallenges } = useOnboarding();
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>(() => {
    return (state?.data?.nutritionChallenges) ? state.data.nutritionChallenges : [];
  });

  const challenges = [
    {
      id: 'not-enough-protein',
      text: 'I never know if I\'m eating enough protein',
      icon: 'help-outline',
      iconLib: 'Ionicons',
    },
    {
      id: 'forget-tracking',
      text: 'I forget to track my meals consistently',
      icon: 'phone-android',
      iconLib: 'MaterialIcons',
    },
    {
      id: 'confused-foods',
      text: 'I\'m confused about which foods have protein',
      icon: 'help-outline',
      iconLib: 'Ionicons',
    },
    {
      id: 'no-time-planning',
      text: 'I don\'t have time to plan protein-rich meals',
      icon: 'access-time',
      iconLib: 'MaterialIcons',
    },
    {
      id: 'expensive-food',
      text: 'Healthy high-protein food is expensive',
      icon: 'attach-money',
      iconLib: 'MaterialIcons',
    },
    {
      id: 'eat-out-much',
      text: 'I eat out too much and can\'t control ingredients',
      icon: 'restaurant',
      iconLib: 'MaterialIcons',
    },
    {
      id: 'give-up-tracking',
      text: 'I track for a few days then give up',
      icon: 'bar-chart',
      iconLib: 'Ionicons',
    },
  ];

  useEffect(() => {
    const challenges = state?.data?.nutritionChallenges;
    setSelectedChallenges(challenges || []);
  }, [state?.data?.nutritionChallenges]);

  const handleNext = () => {
    if (selectedChallenges.length > 0) {
      setNutritionChallenges(selectedChallenges);
      navigation.navigate('GoalImportance' as never);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const toggleChallenge = (challengeText: string) => {
    setSelectedChallenges(prev => {
      if (prev.includes(challengeText)) {
        return prev.filter(c => c !== challengeText);
      } else {
        return [...prev, challengeText];
      }
    });
  };

  const renderIcon = (challenge: any) => {
    const IconComponent = challenge.iconLib === 'MaterialIcons' ? MaterialIcons : Ionicons;
    
    return (
      <IconComponent 
        name={challenge.icon} 
        size={24} 
        color={(selectedChallenges && selectedChallenges.includes(challenge.text)) ? '#007AFF' : '#6B6B6B'} 
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
          <Text style={styles.progressText}>Step 3 of 13</Text>
          <View style={styles.backButton} />
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '23.1%' }]} />
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>What's your biggest challenge with nutrition?</Text>
          <Text style={styles.subtitle}>
            Select all that apply - understanding your challenges helps us personalize your experience.
          </Text>

          <View style={styles.optionsContainer}>
            {challenges.map((challenge) => (
              <TouchableOpacity
                key={challenge.id}
                style={[
                  styles.optionCard,
                  (selectedChallenges && selectedChallenges.includes(challenge.text)) && styles.optionCardSelected,
                ]}
                onPress={() => toggleChallenge(challenge.text)}
              >
                <View style={styles.optionContent}>
                  {renderIcon(challenge)}
                  <View style={styles.textContent}>
                    <Text
                      style={[
                        styles.optionText,
                        (selectedChallenges && selectedChallenges.includes(challenge.text)) && styles.optionTextSelected,
                      ]}
                    >
                      {challenge.text}
                    </Text>
                  </View>
                  {(selectedChallenges && selectedChallenges.includes(challenge.text)) && (
                    <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Next Button */}
      <TouchableOpacity
        style={[styles.nextButton, (!selectedChallenges || selectedChallenges.length === 0) && styles.nextButtonDisabled]}
        onPress={handleNext}
        disabled={!selectedChallenges || selectedChallenges.length === 0}
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
  scrollContent: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
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
    marginBottom: 20,
    lineHeight: 22,
  },
  optionsContainer: {
    gap: 8,
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
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
  textContent: {
    flex: 1,
  },
  optionCardSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  optionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
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