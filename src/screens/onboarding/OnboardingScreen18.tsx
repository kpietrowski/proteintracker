import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { hapticFeedback } from '../../utils/haptics';
import Svg, { Path, Circle } from 'react-native-svg';

export default function OnboardingScreen18() {
  const navigation = useNavigation();

  const handleNext = () => {
    hapticFeedback.medium();
    navigation.navigate('GiveUsRating' as never);
  };

  const handleBack = () => {
    hapticFeedback.light();
    navigation.goBack();
  };

  const ProteinProgressChart = () => (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Your protein journey</Text>
      
      <View style={styles.chart}>
        <Svg width="100%" height="180" viewBox="0 0 320 180">
          {/* Grid lines for better visualization */}
          <Path
            d="M 20 140 L 300 140"
            stroke="#E5E5E5"
            strokeWidth="1"
            strokeDasharray="5,5"
          />
          <Path
            d="M 20 100 L 300 100"
            stroke="#E5E5E5"
            strokeWidth="1"
            strokeDasharray="5,5"
          />
          <Path
            d="M 20 60 L 300 60"
            stroke="#E5E5E5"
            strokeWidth="1"
            strokeDasharray="5,5"
          />
          
          {/* Progress curve - smoother arc */}
          <Path
            d="M 40 130 Q 100 125 160 100 Q 220 70 280 50"
            stroke="#FF6B35"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          
          {/* Data points */}
          <Circle cx="40" cy="130" r="5" fill="#FFFFFF" stroke="#FF6B35" strokeWidth="2" />
          <Circle cx="160" cy="100" r="5" fill="#FFFFFF" stroke="#FF6B35" strokeWidth="2" />
          <Circle cx="280" cy="50" r="5" fill="#FFFFFF" stroke="#FF6B35" strokeWidth="2" />
          
          {/* Success indicator at the end */}
          <Circle cx="280" cy="50" r="10" fill="#FF6B35" opacity="0.2" />
        </Svg>
        
        {/* Time labels */}
        <View style={styles.timeLabels}>
          <Text style={styles.timeLabel}>Day 3</Text>
          <Text style={styles.timeLabel}>Day 7</Text>
          <Text style={styles.timeLabel}>Day 30</Text>
        </View>
        
        {/* Trophy icon */}
        <View style={styles.trophyContainer}>
          <Ionicons name="trophy" size={14} color="#FFFFFF" />
        </View>
      </View>
      
      <Text style={styles.chartDescription}>
        Based on Protein AI's historical data, protein goals are usually challenging at first, but after 7 days, you can hit them like crazy!
      </Text>
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
          <View style={[styles.progressFill, { width: '70%' }]} />
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>You have great potential to crush your goal</Text>

        <ProteinProgressChart />
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
    marginBottom: 40,
    lineHeight: 38,
  },
  chartContainer: {
    backgroundColor: '#000000',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
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
    marginBottom: 20,
  },
  timeLabels: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
  },
  timeLabel: {
    fontSize: 12,
    color: '#6B6B6B',
    fontWeight: '500',
  },
  trophyContainer: {
    position: 'absolute',
    top: 38,
    right: 30,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartDescription: {
    fontSize: 14,
    color: '#6B6B6B',
    textAlign: 'center',
    lineHeight: 20,
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