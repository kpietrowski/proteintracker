import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { hapticFeedback } from '../../utils/haptics';

export default function OnboardingScreen14() {
  const navigation = useNavigation();
  const animatedBarHeight1 = useRef(new Animated.Value(0)).current;
  const animatedBarHeight2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate bars on mount
    const animateBar1 = Animated.timing(animatedBarHeight1, {
      toValue: 30,
      duration: 800,
      delay: 200,
      useNativeDriver: false,
    });
    
    const animateBar2 = Animated.timing(animatedBarHeight2, {
      toValue: 75,
      duration: 1000,
      delay: 600,
      useNativeDriver: false,
    });

    Animated.sequence([animateBar1, animateBar2]).start();
  }, []);

  const handleNext = () => {
    hapticFeedback.medium();
    navigation.navigate('DesiredWeight' as never);
  };

  const handleBack = () => {
    hapticFeedback.light();
    navigation.goBack();
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
          <View style={[styles.progressFill, { width: '50%' }]} />
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Make gains 2X faster with Protein AI vs on your own</Text>

        <View style={styles.chartContainer}>
          <View style={styles.chartHeader}>
            <Ionicons name="bar-chart" size={24} color="#4A90E2" style={styles.chartIcon} />
            <Text style={styles.chartTitle}>Success Rate Comparison</Text>
          </View>
          
          <View style={styles.comparisonContainer}>
            <View style={styles.comparisonItem}>
              <Text style={styles.comparisonLabel}>Without{'\n'}Protein AI</Text>
              <View style={styles.barContainer}>
                <View style={styles.barTrack} />
                <Animated.View style={[styles.barAnimated, { height: animatedBarHeight1 }]}>
                  <LinearGradient
                    colors={['#FF6B6B', '#FF8E8E']}
                    style={styles.barGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                  >
                    <Text style={styles.barTextSmall}>20%</Text>
                  </LinearGradient>
                </Animated.View>
              </View>
              <View style={styles.metricContainer}>
                <Ionicons name="trending-down" size={14} color="#FF6B6B" />
                <Text style={styles.metricText}>Low Success</Text>
              </View>
            </View>
            
            <View style={styles.comparisonItem}>
              <Text style={styles.comparisonLabel}>With{'\n'}Protein AI</Text>
              <View style={styles.barContainer}>
                <View style={styles.barTrack} />
                <Animated.View style={[styles.barAnimated, { height: animatedBarHeight2 }]}>
                  <LinearGradient
                    colors={['#4CAF50', '#66BB6A']}
                    style={styles.barGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                  >
                    <Text style={styles.barTextLarge}>2X</Text>
                    <View style={styles.sparkle}>
                      <Ionicons name="sparkles" size={12} color="#FFFFFF" />
                    </View>
                  </LinearGradient>
                </Animated.View>
              </View>
              <View style={styles.metricContainer}>
                <Ionicons name="trending-up" size={14} color="#4CAF50" />
                <Text style={styles.metricText}>High Success</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.insightContainer}>
            <View style={styles.insightBadge}>
              <Ionicons name="bulb" size={16} color="#FFA726" />
              <Text style={styles.insightText}>Key Insight</Text>
            </View>
            <Text style={styles.subtitle}>
              Hit your protein goal consistently and muscles grow 30-50% faster with the *same* workouts.
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
    paddingTop: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 32,
    lineHeight: 32,
    letterSpacing: -0.5,
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F5F5F5',
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  chartIcon: {
    marginRight: 8,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: -0.3,
  },
  comparisonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  comparisonItem: {
    alignItems: 'center',
    flex: 1,
  },
  comparisonLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B6B6B',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 16,
    letterSpacing: -0.2,
  },
  barContainer: {
    height: 90,
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: 60,
    position: 'relative',
    marginBottom: 8,
  },
  barTrack: {
    position: 'absolute',
    bottom: 0,
    width: 45,
    height: 90,
    backgroundColor: '#F5F5F5',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  barAnimated: {
    width: 45,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
  },
  barGradient: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    position: 'relative',
  },
  sparkle: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  metricContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
  },
  metricText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B6B6B',
    marginLeft: 3,
    letterSpacing: -0.1,
  },
  barTextSmall: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  barTextLarge: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  insightContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  insightBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  insightText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#F57C00',
    marginLeft: 4,
    letterSpacing: -0.1,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#48484A',
    textAlign: 'center',
    lineHeight: 18,
    letterSpacing: -0.2,
    maxWidth: '90%',
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