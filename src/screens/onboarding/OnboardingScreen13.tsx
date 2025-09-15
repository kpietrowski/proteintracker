import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Circle } from 'react-native-svg';
import { hapticFeedback } from '../../utils/haptics';

export default function OnboardingScreen13() {
  const navigation = useNavigation();

  const handleNext = () => {
    hapticFeedback.medium();
    navigation.navigate('PrimaryGoal' as never);
  };

  const handleBack = () => {
    hapticFeedback.light();
    navigation.goBack();
  };

  const ResultsChart = () => (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Your results</Text>
      
      <View style={styles.chart}>
        <Svg width="100%" height="180" viewBox="0 0 300 180">
          {/* With plan line (fast) */}
          <Path
            d="M 20 140 Q 80 120 120 80 Q 160 40 200 30 Q 240 25 280 20"
            stroke="#000"
            strokeWidth="3"
            fill="none"
          />
          
          {/* Without plan line (slow) */}
          <Path
            d="M 20 140 Q 80 135 120 130 Q 160 125 200 115 Q 240 105 280 100"
            stroke="#999"
            strokeWidth="3"
            fill="none"
          />
          
          {/* Start point */}
          <Circle cx="20" cy="140" r="4" fill="#000" />
          
          {/* End points */}
          <Circle cx="280" cy="20" r="4" fill="#000" />
          <Circle cx="280" cy="100" r="4" fill="#999" />
          
          {/* Labels */}
          <View style={styles.chartLabel}>
            <Text style={styles.withPlanLabel}>With plan (fast)</Text>
          </View>
        </Svg>
        
        {/* Chart labels positioned absolutely */}
        <View style={styles.withPlanLabelContainer}>
          <View style={styles.withPlanBadge}>
            <Text style={styles.withPlanText}>With plan (fast)</Text>
          </View>
        </View>
        
        <View style={styles.withoutPlanLabelContainer}>
          <Text style={styles.withoutPlanText}>Without plan (slow)</Text>
        </View>
        
        <View style={styles.monthLabels}>
          <Text style={styles.monthLabel}>MONTH 1</Text>
          <Text style={styles.monthLabel}>MONTH 6</Text>
        </View>
      </View>
    </View>
  );

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
          <View style={[styles.progressFill, { width: '25%' }]} />
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Protein AI creates long-term results</Text>

        <ResultsChart />

        <View style={styles.statisticContainer}>
          <Text style={styles.statistic}>
            81% of Protein AI users hit their protein goal in the first week.
          </Text>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 30,
    lineHeight: 32,
  },
  chartContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    position: 'relative',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 20,
  },
  chart: {
    position: 'relative',
    height: 180,
  },
  withPlanLabelContainer: {
    position: 'absolute',
    top: 40,
    right: 40,
  },
  withPlanBadge: {
    backgroundColor: '#000',
    borderRadius: 29,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  withPlanText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '500',
  },
  withoutPlanLabelContainer: {
    position: 'absolute',
    bottom: 40,
    right: 40,
  },
  withoutPlanText: {
    color: '#999',
    fontSize: 12,
    fontWeight: '500',
    backgroundColor: '#E0E0E0',
    borderRadius: 29,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  monthLabels: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  monthLabel: {
    fontSize: 11,
    color: '#999',
    fontWeight: '500',
  },
  chartLabel: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  withPlanLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  statisticContainer: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statistic: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
    lineHeight: 24,
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