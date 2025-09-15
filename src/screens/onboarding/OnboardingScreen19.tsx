import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
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

  // Photo sets based on gender - more casual, Instagram-style photos
  const femalePhotos = {
    profiles: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face', // Casual selfie style
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&h=150&fit=crop&crop=face', // Natural outdoor shot
      'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=150&h=150&fit=crop&crop=face'  // Candid smile
    ],
    testimonial: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=100&h=100&fit=crop&crop=face' // Casual friendly photo
  };

  const malePhotos = {
    profiles: [
      'https://images.unsplash.com/photo-1463453091185-61582044d556?w=150&h=150&fit=crop&crop=face', // Relaxed casual shot
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face', // Natural lighting
      'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop&crop=face'  // Friendly casual
    ],
    testimonial: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&h=100&fit=crop&crop=face' // Approachable smile
  };

  // Reviews data based on gender - including new reviews
  const maleReviews = [
    {
      name: 'Mike R.',
      text: '"Finally hitting my protein goal an i FEEL IT."',
      photo: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&h=100&fit=crop&crop=face'
    },
    {
      name: 'David L.',
      text: '"This is so freakin easy. Easiest way to log my 200 grams /day."',
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face'
    },
    {
      name: 'Alex K.',
      text: '"Great job with this app guys. I\'m hitting 185 grams a day now!"',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
    }
  ];

  const femaleReviews = [
    {
      name: 'Sarah M.',
      text: '"Finally hitting my protein goal an i FEEL IT."',
      photo: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=100&h=100&fit=crop&crop=face'
    },
    {
      name: 'Rachel T.',
      text: '"Finally seeing a difference in my body when hitting my protein goal most days."',
      photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face'
    },
    {
      name: 'Emily J.',
      text: '"So easy to use, no extra fluff… just focused on hitting my protein goal. Love it!"',
      photo: 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=100&h=100&fit=crop&crop=face'
    }
  ];

  // Default to male photos and reviews, use female if gender is Female
  const selectedPhotos = state?.data?.sex === 'Female' ? femalePhotos : malePhotos;
  const selectedReviews = state?.data?.sex === 'Female' ? femaleReviews : maleReviews;
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
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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

        <View style={styles.reviewsContainer}>
          {selectedReviews.map((review, index) => (
            <View key={index} style={styles.testimonialCard}>
              <View style={styles.testimonialHeader}>
                <View style={styles.profileCircle}>
                  <Image 
                    source={{ uri: review.photo }}
                    style={styles.testimonialPhoto}
                  />
                </View>
                <Text style={styles.reviewerName}>{review.name}</Text>
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
                {review.text}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
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
  reviewsContainer: {
    width: '100%',
    marginTop: 10,
  },
  testimonialCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
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