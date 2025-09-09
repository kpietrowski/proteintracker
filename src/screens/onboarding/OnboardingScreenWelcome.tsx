import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { hapticFeedback } from '../../utils/haptics';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function OnboardingScreenWelcome() {
  const navigation = useNavigation();

  const handleGetStarted = () => {
    hapticFeedback.medium();
    navigation.navigate('Goal' as never);
  };


  return (
    <SafeAreaView style={styles.container}>
      {/* Image Section - 65% */}
      <View style={styles.imageSection}>
        <View style={styles.phoneContainer}>
          <Image 
            source={require('../../../assets/home-screenshot.png')}
            style={styles.phoneImage}
            resizeMode="contain"
          />
        </View>
      </View>
      
      {/* Text Section - 35% */}
      <View style={styles.textSection}>
        <Text style={styles.title}>Protein tracking{'\n'}made easy</Text>
        <Text style={styles.subtitle}>Use your voice to log your protein</Text>
        
        <TouchableOpacity style={styles.getStartedButton} onPress={handleGetStarted}>
          <Text style={styles.getStartedText}>Get Started</Text>
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
  imageSection: {
    flex: 0.65,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  phoneContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  phoneImage: {
    width: '90%',
    height: '90%',
    borderRadius: 30,
  },
  textSection: {
    flex: 0.35,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 16,
    marginTop: 20,
    lineHeight: 42,
  },
  subtitle: {
    fontSize: 18,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  getStartedButton: {
    backgroundColor: '#000000',
    borderRadius: 25,
    paddingVertical: 21,
    paddingHorizontal: 40,
    width: '100%',
    marginTop: 20,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  getStartedText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
});