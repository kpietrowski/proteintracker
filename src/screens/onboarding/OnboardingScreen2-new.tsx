import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useOnboarding } from '../../context/OnboardingContext';
import { MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';

export default function OnboardingScreen2New() {
  const navigation = useNavigation();
  const onboardingContext = useOnboarding();
  const [selectedMethod, setSelectedMethod] = useState<string>('');

  const trackingMethods = [
    {
      id: 'pen-paper',
      text: 'Pen and paper',
      subtitle: '(gets tedious)',
      icon: 'edit',
      iconLib: 'MaterialIcons',
    },
    {
      id: 'notes-app',
      text: 'Notes app on my phone',
      subtitle: '(disorganized)',
      icon: 'phone',
      iconLib: 'MaterialIcons',
    },
    {
      id: 'progress-photos',
      text: 'Progress photos',
      subtitle: '(but I lose track)',
      icon: 'camera',
      iconLib: 'Ionicons',
    },
    {
      id: 'try-remember',
      text: 'Just try to remember',
      subtitle: '(often forget)',
      icon: 'bulb',
      iconLib: 'Ionicons',
    },
    {
      id: 'fitness-apps',
      text: 'Fitness apps',
      subtitle: '(but they\'re confusing)',
      icon: 'fitness',
      iconLib: 'Ionicons',
    },
    {
      id: 'dont-track',
      text: 'I don\'t track consistently',
      subtitle: '(that\'s the problem!)',
      icon: 'close',
      iconLib: 'Ionicons',
    },
  ];

  useEffect(() => {
    if (onboardingContext?.state?.data?.currentTrackingMethod) {
      setSelectedMethod(onboardingContext.state.data.currentTrackingMethod);
    }
  }, [onboardingContext?.state?.data?.currentTrackingMethod]);

  const handleNext = () => {
    if (selectedMethod && onboardingContext?.setCurrentTrackingMethod) {
      onboardingContext.setCurrentTrackingMethod(selectedMethod);
      navigation.navigate('NutritionChallenges' as never);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const renderIcon = (method: any) => {
    if (!method || !method.icon || !method.text) {
      return null;
    }
    
    const IconComponent = method.iconLib === 'MaterialIcons' ? MaterialIcons :
                         method.iconLib === 'FontAwesome5' ? FontAwesome5 : Ionicons;
    
    const isSelected = selectedMethod && method.text && selectedMethod === method.text;
    
    return (
      <IconComponent 
        name={method.icon} 
        size={24} 
        color={isSelected ? '#007AFF' : '#6B6B6B'} 
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.progressText}>Step 2 of 13</Text>
          <View style={styles.backButton} />
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '15.4%' }]} />
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>How do you usually track your progress?</Text>
          <Text style={styles.subtitle}>
            Understanding your current approach helps us design a better solution.
          </Text>

          <View style={styles.optionsContainer}>
            {trackingMethods.map((method) => {
              if (!method || !method.text || !method.id) return null;
              
              const isSelected = selectedMethod && selectedMethod === method.text;
              
              return (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    styles.optionCard,
                    isSelected && styles.optionCardSelected,
                  ]}
                  onPress={() => setSelectedMethod(method.text)}
                >
                  <View style={styles.optionContent}>
                    {renderIcon(method)}
                    <View style={styles.textContent}>
                      <Text
                        style={[
                          styles.optionText,
                          isSelected && styles.optionTextSelected,
                        ]}
                      >
                        {method.text}
                      </Text>
                      <Text style={styles.optionSubtitle}>
                        {method.subtitle || ''}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Next Button */}
      <TouchableOpacity
        style={[styles.nextButton, !selectedMethod && styles.nextButtonDisabled]}
        onPress={handleNext}
        disabled={!selectedMethod}
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
  optionSubtitle: {
    fontSize: 13,
    color: '#6B6B6B',
    marginTop: 1,
    fontStyle: 'italic',
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