import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import * as StoreReview from 'expo-store-review';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useOnboarding } from '../../context/OnboardingContext';
import { Ionicons } from '@expo/vector-icons';
import { hapticFeedback } from '../../utils/haptics';


export default function OnboardingScreen19() {
  const navigation = useNavigation();
  const { state } = useOnboarding();
  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [hasRequestedRating, setHasRequestedRating] = useState<boolean>(false);

  // Photo sets based on gender
  const femalePhotos = {
    profiles: [
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face'
    ],
    testimonial: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face'
  };

  const malePhotos = {
    profiles: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
    ],
    testimonial: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face'
  };

  // Reviews data based on gender
  const maleReviews = [
    {
      name: 'Mike R.',
      text: '"Finally hitting my protein goal an i FEEL IT."'
    },
    {
      name: 'Jake T.',
      text: '"This app changed my entire approach to nutrition. Gains are real!"'
    },
    {
      name: 'Carlos M.',
      text: '"Never thought tracking protein could be this simple. Strength up 20%!"'
    }
  ];

  const femaleReviews = [
    {
      name: 'Sarah M.',
      text: '"Finally hitting my protein goal an i FEEL IT."'
    },
    {
      name: 'Emma L.',
      text: '"Lost 15lbs while gaining muscle. This app is a game changer!"'
    },
    {
      name: 'Jessica K.',
      text: '"My energy levels are through the roof! Best protein tracking app ever."'
    }
  ];

  // Default to male photos and reviews, use female if gender is Female
  const selectedPhotos = state?.data?.sex === 'Female' ? femalePhotos : malePhotos;
  const selectedReviews = state?.data?.sex === 'Female' ? femaleReviews : maleReviews;
  const currentReview = selectedReviews[Math.floor(Date.now() / 86400000) % selectedReviews.length];
  const customersText = 'Thousands of happy users';

  const handleNext = async () => {
    hapticFeedback.medium();
    
    // If we haven't requested rating yet, show the native rating dialog first
    if (!hasRequestedRating) {
      try {
        console.log('🌟 First tap - requesting native in-app rating...');
        
        // Check if in-app rating is available
        const isAvailable = await StoreReview.isAvailableAsync();
        console.log('🌟 In-app rating available:', isAvailable);
        
        if (isAvailable) {
          // This shows the native iOS rating dialog with 5 stars
          // Users can rate without leaving the app
          await StoreReview.requestReview();
          console.log('🌟 Native in-app rating dialog shown!');
        } else {
          console.log('🌟 In-app rating not available (might be in dev/simulator)');
        }
      } catch (error) {
        console.log('🌟 Store review error:', error);
        // Don't block user flow if rating fails
      }
      
      // Mark that we've requested the rating
      setHasRequestedRating(true);
      console.log('🌟 Rating requested - next tap will proceed to next screen');
      
      // Don't navigate yet - let them tap next again
      return;
    }
    
    // Second tap or subsequent taps - proceed to next screen
    console.log('🌟 Subsequent tap - proceeding to next screen');
    navigation.navigate('NotificationPermission' as never);
  };


  const handleBack = () => {
    hapticFeedback.light();
    navigation.goBack();
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => {
              hapticFeedback.selection();
              setSelectedRating(star);
            }}
            style={styles.starButton}
          >
            <Ionicons
              name="star"
              size={32}
              color={star <= selectedRating ? '#FFD700' : '#E5E5E5'}
            />
          </TouchableOpacity>
        ))}
      </View>
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
          <View style={[styles.progressFill, { width: '75%' }]} />
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Give us a rating</Text>

        <View style={styles.ratingCard}>
          {renderStars()}
        </View>

        <Text style={styles.subtitle}>Protein AI was made for people like you</Text>

        <View style={styles.photosContainer}>
          <View style={[styles.photoCircle, { zIndex: 3 }]}>
            <Image 
              source={{ uri: selectedPhotos.profiles[0] }}
              style={styles.profilePhoto}
            />
          </View>
          <View style={[styles.photoCircle, { zIndex: 2 }]}>
            <Image 
              source={{ uri: selectedPhotos.profiles[1] }}
              style={styles.profilePhoto}
            />
          </View>
          <View style={[styles.photoCircle, { zIndex: 1 }]}>
            <Image 
              source={{ uri: selectedPhotos.profiles[2] }}
              style={styles.profilePhoto}
            />
          </View>
        </View>

        <Text style={styles.photosSubtext}>{customersText}</Text>

        <View style={styles.testimonialCard}>
          <View style={styles.testimonialHeader}>
            <View style={styles.profileCircle}>
              <Image 
                source={{ uri: selectedPhotos.testimonial }}
                style={styles.testimonialPhoto}
              />
            </View>
            <Text style={styles.reviewerName}>{currentReview.name}</Text>
            <View style={styles.reviewStars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name="star"
                  size={12}
                  color="#FFD700"
                />
              ))}
            </View>
          </View>
          <Text style={styles.testimonialText}>
            {currentReview.text}
          </Text>
        </View>
      </View>

      {/* Next Button */}
      <TouchableOpacity
        style={styles.nextButton}
        onPress={handleNext}
      >
        <Text style={styles.nextButtonText}>
          {hasRequestedRating ? 'Next' : 'Next'}
        </Text>
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
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 30,
  },
  ratingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '100%',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  starButton: {
    padding: 4,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 30,
  },
  photosContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    gap: -10,
  },
  photoCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePhoto: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  photosSubtext: {
    fontSize: 14,
    color: '#6B6B6B',
    marginBottom: 30,
  },
  testimonialCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  testimonialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  profileCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  testimonialPhoto: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    flex: 1,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
  },
  testimonialText: {
    fontSize: 16,
    color: '#1A1A1A',
    lineHeight: 22,
    fontStyle: 'italic',
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