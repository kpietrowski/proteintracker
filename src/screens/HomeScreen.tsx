import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Animated,
  Easing,
  Share,
  Alert,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { colors } from '../constants/colors';
import { DailySummary, WeeklyProgress, DayProgress } from '../types';
import { supabase, getDailySummary, getUserProfile } from '../services/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const navigation = useNavigation();
  const [dailySummary, setDailySummary] = useState<DailySummary | null>(null);
  const [weeklyProgress, setWeeklyProgress] = useState<WeeklyProgress | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Animation values
  const animatedPercentage = useRef(new Animated.Value(0)).current;
  const animatedProtein = useRef(new Animated.Value(0)).current;
  const animatedRemaining = useRef(new Animated.Value(140)).current;
  const [displayProtein, setDisplayProtein] = useState(0);
  const [displayRemaining, setDisplayRemaining] = useState(140);
  const previousProteinRef = useRef(0);
  const previousRemainingRef = useRef(140);
  const previousPercentageRef = useRef(0);
  const isFirstLoad = useRef(true);
  
  // Celebration animation values
  const numberScale = useRef(new Animated.Value(1)).current;
  const celebrationText = useRef(new Animated.Value(0)).current;
  
  // Star animation system
  const [backgroundStars, setBackgroundStars] = useState<Array<{
    id: number;
    x: Animated.Value;
    y: Animated.Value;
    opacity: Animated.Value;
    scale: Animated.Value;
    speed: number;
    size: number;
  }>>([]);
  const starIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Goal completion celebration - separated into notification and background animation
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [showBackgroundStars, setShowBackgroundStars] = useState(false);
  const [isGoalMet, setIsGoalMet] = useState(false);
  
  // Streak tracking
  const [currentStreak, setCurrentStreak] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  // Reload data when screen comes into focus (e.g., after adding protein)
  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  // Animate when protein value changes
  useEffect(() => {
    if (dailySummary) {
      const currentProtein = dailySummary.totalProtein || 0;
      const remainingProtein = dailySummary.remainingProtein !== undefined ? dailySummary.remainingProtein : 140;
      const percentageComplete = dailySummary.percentageComplete || 0;
      
      console.log('DEBUG: Data values:', {
        currentProtein,
        remainingProtein,
        percentageComplete,
        goalProtein: dailySummary.goalProtein
      });
      
      // For first load, set initial values without animation
      if (isFirstLoad.current) {
        animatedPercentage.setValue(percentageComplete);
        animatedProtein.setValue(currentProtein);
        animatedRemaining.setValue(remainingProtein);
        setDisplayProtein(currentProtein);
        setDisplayRemaining(remainingProtein);
        setIsGoalMet(percentageComplete >= 100);
        
        previousProteinRef.current = currentProtein;
        previousRemainingRef.current = remainingProtein;
        previousPercentageRef.current = percentageComplete;
        isFirstLoad.current = false;
        
        return;
      }
      
      // Check if goal was just completed
      const wasGoalMet = previousPercentageRef.current >= 100;
      const isGoalNowMet = percentageComplete >= 100;
      
      // Update goal met state
      setIsGoalMet(isGoalNowMet);
      
      if (!wasGoalMet && isGoalNowMet) {
        // GOAL COMPLETED! Trigger epic celebration
        setTimeout(() => {
          triggerGoalCompleteCelebration();
        }, 2000); // Start after circle animation
      } else if (wasGoalMet && !isGoalNowMet) {
        // GOAL NO LONGER MET! Remove celebration effects
        hideCelebration();
      }
      
      // Animate the progress ring from previous value
      console.log('Animating circle from', previousPercentageRef.current, 'to', percentageComplete);
      animatedPercentage.setValue(previousPercentageRef.current);
      Animated.timing(animatedPercentage, {
        toValue: percentageComplete,
        duration: 2000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start(() => {
        console.log('Circle animation completed');
      });
      
      // Animate the protein eaten number counting up
      animatedProtein.setValue(previousProteinRef.current);
      const proteinListener = animatedProtein.addListener(({ value }) => {
        setDisplayProtein(Math.round(value));
      });
      
      Animated.timing(animatedProtein, {
        toValue: currentProtein,
        duration: 2000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start(() => {
        animatedProtein.removeListener(proteinListener);
      });
      
      // Animate the remaining protein counting down
      animatedRemaining.setValue(previousRemainingRef.current);
      const remainingListener = animatedRemaining.addListener(({ value }) => {
        setDisplayRemaining(Math.round(value));
      });
      
      Animated.timing(animatedRemaining, {
        toValue: remainingProtein,
        duration: 2000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start(() => {
        animatedRemaining.removeListener(remainingListener);
      });
      
      previousProteinRef.current = currentProtein;
      previousRemainingRef.current = remainingProtein;
      previousPercentageRef.current = percentageComplete;
    }
  }, [dailySummary]);

  const calculateCurrentStreak = async (): Promise<number> => {
    try {
      // Get user's protein goal
      let userGoal = 140;
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          const profile = await getUserProfile(authUser.id);
          if (profile && profile.dailyProteinGoal) {
            userGoal = profile.dailyProteinGoal;
          }
        }
      } catch (profileError) {
        console.log('Using default goal for streak calculation');
      }

      // Check previous days starting from today
      let streak = 0;
      const today = new Date();
      
      for (let i = 0; i < 30; i++) { // Check up to 30 days back
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        const dateKey = checkDate.toISOString().split('T')[0];
        const storageKey = `demo_protein_${dateKey}`;
        
        try {
          const dayData = await AsyncStorage.getItem(storageKey);
          if (dayData) {
            const entries = JSON.parse(dayData);
            const totalProtein = entries.reduce((sum: number, entry: any) => sum + entry.amount, 0);
            
            if (totalProtein >= userGoal) {
              streak++;
            } else {
              // Streak broken, stop counting
              break;
            }
          } else if (i === 0) {
            // No data for today, streak is 0
            break;
          } else {
            // No data for this day, streak broken
            break;
          }
        } catch (error) {
          console.error(`Error checking streak for ${dateKey}:`, error);
          break;
        }
      }
      
      return streak;
    } catch (error) {
      console.error('Error calculating streak:', error);
      return 0;
    }
  };

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const summary = await getDailySummary(user.id, new Date());
        setDailySummary(summary);
        
        // Load weekly progress
        const weekData = await loadWeeklyProgress(user.id);
        setWeeklyProgress(weekData);
        
        // Load streak data
        const streak = await calculateCurrentStreak();
        setCurrentStreak(streak);
      } else {
        // Demo mode - load mock data
        console.log('Demo mode - loading mock data');
        const mockSummary = await loadMockDailySummary();
        setDailySummary(mockSummary);
        
        const weekData = await loadWeeklyProgress('demo-user');
        setWeeklyProgress(weekData);
        
        // Load streak data
        const streak = await calculateCurrentStreak();
        setCurrentStreak(streak);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      // Fallback to mock data on error
      const mockSummary = await loadMockDailySummary();
      setDailySummary(mockSummary);
      
      const weekData = await loadWeeklyProgress('demo-user');
      setWeeklyProgress(weekData);
      
      // Load streak data
      const streak = await calculateCurrentStreak();
      setCurrentStreak(streak);
    } finally {
      // Small delay to ensure animations are set up
      setTimeout(() => setLoading(false), 100);
    }
  };

  const loadMockDailySummary = async (): Promise<DailySummary> => {
    // Get stored protein entries from AsyncStorage for demo mode
    const dateKey = new Date().toISOString().split('T')[0];
    const storageKey = `demo_protein_${dateKey}`;
    
    try {
      // Get user's actual protein goal from their profile
      let userGoal = 140; // Default fallback
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          const profile = await getUserProfile(authUser.id);
          if (profile && profile.dailyProteinGoal) {
            userGoal = profile.dailyProteinGoal;
          }
        }
      } catch (profileError) {
        console.log('Could not load user profile, using default goal');
      }
      
      const existingData = await AsyncStorage.getItem(storageKey);
      const todayEntries = existingData ? JSON.parse(existingData) : [];
      
      // Calculate total protein from stored entries
      const totalProtein = todayEntries.reduce((sum: number, entry: any) => sum + entry.amount, 0);
      
      // Convert stored entries to the format expected by the app
      const entries = todayEntries.map((entry: any, index: number) => ({
        id: `demo-${index}`,
        userId: 'demo-user',
        date: new Date(entry.timestamp),
        amount: entry.amount,
        description: entry.description,
        source: entry.source || 'voice',
        createdAt: new Date(entry.timestamp),
      }));
      
      return {
        date: new Date(),
        totalProtein,
        goalProtein: userGoal,
        entries,
        percentageComplete: Math.min(100, Math.round((totalProtein / userGoal) * 100)),
        remainingProtein: Math.max(0, userGoal - totalProtein),
      };
    } catch (error) {
      console.error('Error loading demo data from storage:', error);
      // Return empty summary on error with default goal
      return {
        date: new Date(),
        totalProtein: 0,
        goalProtein: 140,
        entries: [],
        percentageComplete: 0,
        remainingProtein: 140,
      };
    }
  };

  const loadWeeklyProgress = async (userId: string): Promise<WeeklyProgress> => {
    // Get user's actual protein goal
    let userGoal = 140;
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const profile = await getUserProfile(authUser.id);
        if (profile && profile.dailyProteinGoal) {
          userGoal = profile.dailyProteinGoal;
        }
      }
    } catch (profileError) {
      console.log('Using default goal for weekly progress');
    }

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
    const today = new Date().getDay();
    
    // Get today's actual protein data from daily summary
    const todayProtein = dailySummary?.totalProtein || 0;
    const todayGoal = dailySummary?.goalProtein || userGoal;
    const todayGoalMet = (dailySummary?.percentageComplete || 0) >= 100;
    
    const weekDays: DayProgress[] = await Promise.all(days.map(async (dayName, index) => {
      if (index === today) {
        // Use today's real data
        return {
          date: new Date(),
          dayName,
          proteinAmount: todayProtein,
          goalAmount: todayGoal,
          goalMet: todayGoalMet,
          isToday: true,
          isFuture: false,
        };
      } else if (index > today) {
        // Future days - empty
        return {
          date: new Date(),
          dayName,
          proteinAmount: 0,
          goalAmount: userGoal,
          goalMet: false,
          isToday: false,
          isFuture: true,
        };
      } else {
        // Past days - check actual data from AsyncStorage
        const pastDate = new Date();
        const daysDiff = today - index;
        pastDate.setDate(pastDate.getDate() - daysDiff);
        const dateKey = pastDate.toISOString().split('T')[0];
        const storageKey = `demo_protein_${dateKey}`;
        
        try {
          const dayData = await AsyncStorage.getItem(storageKey);
          if (dayData) {
            const entries = JSON.parse(dayData);
            const totalProtein = entries.reduce((sum: number, entry: any) => sum + entry.amount, 0);
            
            return {
              date: pastDate,
              dayName,
              proteinAmount: totalProtein,
              goalAmount: userGoal,
              goalMet: totalProtein >= userGoal,
              isToday: false,
              isFuture: false,
            };
          } else {
            // No data for this past day
            return {
              date: pastDate,
              dayName,
              proteinAmount: 0,
              goalAmount: userGoal,
              goalMet: false,
              isToday: false,
              isFuture: false,
            };
          }
        } catch (error) {
          console.error(`Error loading data for ${dateKey}:`, error);
          return {
            date: pastDate,
            dayName,
            proteinAmount: 0,
            goalAmount: userGoal,
            goalMet: false,
            isToday: false,
            isFuture: false,
          };
        }
      }
    }));

    return {
      weekDays,
      goalsHit: weekDays.filter(d => d.goalMet).length,
      totalProtein: weekDays.reduce((sum, d) => sum + d.proteinAmount, 0),
      averageProtein: weekDays.reduce((sum, d) => sum + d.proteinAmount, 0) / 7,
    };
  };


  const handleLogProtein = () => {
    navigation.navigate('VoiceInput' as never);
  };

  const handleDeleteEntry = async (entryIndex: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // For real users, we would delete from database
        // For now, this will handle demo mode only
        console.log('Would delete entry for real user:', entryIndex);
      } else {
        // Demo mode - remove from AsyncStorage
        const dateKey = new Date().toISOString().split('T')[0];
        const storageKey = `demo_protein_${dateKey}`;
        
        const existingData = await AsyncStorage.getItem(storageKey);
        if (existingData) {
          const todayEntries = JSON.parse(existingData);
          
          // Remove the entry at the specified index
          todayEntries.splice(entryIndex, 1);
          
          // Save back to storage
          await AsyncStorage.setItem(storageKey, JSON.stringify(todayEntries));
          
          // Reload data to update the UI
          await loadData();
        }
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  const createContinuousStars = () => {
    // Clear any existing interval
    if (starIntervalRef.current) {
      clearInterval(starIntervalRef.current);
    }
    
    const createSingleStar = () => {
      const centerX = width * 0.5;
      const centerY = width * 0.425; // Center of circle
      
      // Random angle (360 degrees around circle)
      const angle = Math.random() * 2 * Math.PI;
      
      // Random size and speed variations - bigger stars
      const size = 0.6 + Math.random() * 0.8; // 0.6 to 1.4 (bigger and more visible)
      const speed = 1200 + Math.random() * 1800; // Slower: 1.2-3.0 seconds for elegance
      const distance = width * 1.2 + Math.random() * width * 0.4; // Extended distance
      
      // Calculate end position
      const endX = centerX + Math.cos(angle) * distance;
      const endY = centerY + Math.sin(angle) * distance;
      
      const star = {
        id: Date.now() + Math.random(),
        x: new Animated.Value(centerX),
        y: new Animated.Value(centerY),
        opacity: new Animated.Value(0.6), // Subtle opacity
        scale: new Animated.Value(size),
        speed,
        size,
      };
      
      // Animate star movement
      Animated.parallel([
        Animated.timing(star.x, {
          toValue: endX,
          duration: speed,
          useNativeDriver: true,
        }),
        Animated.timing(star.y, {
          toValue: endY,
          duration: speed,
          useNativeDriver: true,
        }),
        Animated.timing(star.opacity, {
          toValue: 0,
          duration: speed,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Add to stars array
      setBackgroundStars(currentStars => {
        const newStars = [...currentStars, star];
        
        // Keep only recent stars (max 50 for performance)
        if (newStars.length > 50) {
          return newStars.slice(-50);
        }
        return newStars;
      });
      
      // Remove star after animation
      setTimeout(() => {
        setBackgroundStars(currentStars => 
          currentStars.filter(s => s.id !== star.id)
        );
      }, speed + 100);
    };
    
    // Create stars continuously - elegant frequency
    starIntervalRef.current = setInterval(createSingleStar, 200); // New star every 200ms
    
    // Create initial burst of stars - more elegant
    for (let i = 0; i < 15; i++) {
      setTimeout(createSingleStar, i * 100);
    }
  };

  const triggerGoalCompleteCelebration = () => {
    // Show sophisticated success notification first
    setShowSuccessNotification(true);
    
    // Set static scale - no pulsing
    numberScale.setValue(1);
    
    // Start stars animation immediately
    setShowBackgroundStars(true);
    createContinuousStars();
  };
  
  const dismissSuccessNotification = () => {
    setShowSuccessNotification(false);
    
    // Start continuous background stars animation
    setShowBackgroundStars(true);
    createContinuousStars();
  };
  
  const hideCelebration = () => {
    setShowSuccessNotification(false);
    setShowBackgroundStars(false);
    
    // Stop star creation interval
    if (starIntervalRef.current) {
      clearInterval(starIntervalRef.current);
      starIntervalRef.current = null;
    }
    
    // Stop all celebration animations
    numberScale.stopAnimation();
    celebrationText.stopAnimation();
    
    // Clear stars
    setBackgroundStars([]);
    
    // Reset values
    numberScale.setValue(1);
    celebrationText.setValue(0);
  };

  const handleShare = async () => {
    try {
      const shareOptions = {
        message: '🎯 Just crushed my daily protein goal! 💪\n\nStaying consistent with my nutrition has never been easier. Who else is hitting their protein targets? 🥩🍳\n\n#ProteinGoals #FitnessMotivation #HealthyEating #NutritionWins',
      };

      await Share.share(shareOptions);
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Failed to share your achievement');
    }
  };



  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  const getTimeRemaining = () => {
    const now = new Date();
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    
    const diff = endOfDay.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours} hours, ${minutes} minutes left`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  const goalProtein = dailySummary?.goalProtein || 140;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Date Header */}
        <View style={styles.header}>
          <Text style={styles.dateText}>{formatDate(new Date())}</Text>
          
          {/* Streak Counter */}
          <View style={styles.streakContainer}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <Text style={styles.streakNumber}>{currentStreak}</Text>
          </View>
        </View>

        {/* Weekly Progress Rings */}
        <View style={styles.weeklySection}>
          <Text style={styles.sectionTitle}>Past 7 days</Text>
          <View style={styles.weeklyRings}>
            {weeklyProgress?.weekDays.map((day) => (
              <View key={day.dayName} style={styles.dayRing}>
                <View style={styles.dayRingContainer}>
                  <ProgressRing
                    percentage={day.isFuture ? 0 : (day.goalMet ? 100 : (day.proteinAmount / day.goalAmount) * 100)}
                    color={day.isFuture ? colors.status.neutral : (day.goalMet ? colors.primary.teal : colors.secondary.orange)}
                    size={40}
                    strokeWidth={3}
                  />
                  {day.goalMet && !day.isFuture && (
                    <View style={styles.checkmarkContainer}>
                      <Text style={styles.checkmark}>✓</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.dayLabel}>{day.dayName}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Daily Protein Goal */}
        <View style={styles.goalSection}>
          <Text style={styles.goalTitle}>Daily Protein Goal</Text>
          <Text style={styles.goalAmount}>{goalProtein} Grams</Text>
        </View>

        {/* Main Progress Ring */}
        <View style={styles.mainRingContainer}>


          {/* Background continuous stars - only when goal is met and background stars are active */}
          {showBackgroundStars && isGoalMet && (
            <View style={styles.starsContainer}>
              {backgroundStars.map((star) => (
                <Animated.View
                  key={star.id}
                  style={[
                    styles.star,
                    {
                      opacity: star.opacity,
                      transform: [
                        { translateX: star.x },
                        { translateY: star.y },
                        { scale: star.scale },
                      ],
                    },
                  ]}
                >
                  <Text style={[
                    styles.starEmoji,
                    { 
                      fontSize: star.size * 20, // Scale emoji size
                    }
                  ]}>⭐</Text>
                </Animated.View>
              ))}
            </View>
          )}

          <View style={[
            styles.mainRing,
            isGoalMet && styles.mainRingGlow
          ]}>
            <ProgressRing
              percentage={animatedPercentage}
              color={isGoalMet ? '#00b894' : colors.primary.teal}
              size={width * 0.82}
              strokeWidth={26}
              animated={true}
            />
            <View style={styles.ringContent}>
              {isGoalMet ? (
                <View style={styles.goalMetContent}>
                  <Text style={styles.goalMetTitle}>Protein Goal Hit!</Text>
                  <Text style={styles.goalMetStats}>{displayProtein}/{goalProtein} grams</Text>
                </View>
              ) : (
                <>
                  <Animated.Text style={[
                    styles.remainingNumber,
                    { transform: [{ scale: isGoalMet ? numberScale : 1 }] }
                  ]}>
                    {displayRemaining}
                  </Animated.Text>
                  <Text style={styles.remainingLabel}>grams of protein left</Text>
                </>
              )}
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.timeRemaining}>{getTimeRemaining()}</Text>
          <Text style={styles.proteinEaten}>
            <Text style={styles.proteinNumber}>{displayProtein}g</Text>
            <Text style={styles.proteinLabel}> eaten today out of {goalProtein}g</Text>
          </Text>
        </View>

        {/* Log Protein Button */}
        <TouchableOpacity onPress={handleLogProtein} activeOpacity={0.9}>
          <LinearGradient
            colors={colors.gradients.successButton}
            style={styles.logButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.logButtonText}>Log Protein</Text>
            <Text style={styles.logButtonPlus}>+</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Today's Protein Entries */}
        {dailySummary?.entries && dailySummary.entries.length > 0 && (
          <View style={styles.entriesSection}>
            <Text style={styles.entriesTitle}>Today's Entries</Text>
            {dailySummary.entries.map((entry, index) => (
              <View key={entry.id || index} style={styles.entryItem}>
                <View style={styles.entryContent}>
                  <Text style={styles.entryDescription}>{entry.description}</Text>
                  <Text style={styles.entryAmount}>{entry.amount}g</Text>
                </View>
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => handleDeleteEntry(index)}
                >
                  <Text style={styles.deleteIcon}>🗑️</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
      
      {/* Sophisticated Success Notification */}
      {showSuccessNotification && (
        <View style={styles.successModal}>
          <View style={styles.successModalBackdrop} />
          <View style={styles.successCard}>
            <View style={styles.successIconContainer}>
              <LinearGradient
                colors={['#4CAF50', '#45A049']}
                style={styles.successIconGradient}
              >
                <Text style={styles.successCheckmark}>✓</Text>
              </LinearGradient>
            </View>
            
            <Text style={styles.successTitle}>Goal Achieved</Text>
            <Text style={styles.successMessage}>
              Excellent work completing your daily protein target of {goalProtein}g.
            </Text>
            
            <View style={styles.successActions}>
              <TouchableOpacity 
                style={styles.shareAction}
                onPress={handleShare}
              >
                <Text style={styles.shareActionText}>Share Achievement</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.continueAction}
                onPress={dismissSuccessNotification}
              >
                <Text style={styles.continueActionText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

// Progress Ring Component
function ProgressRing({ percentage, color, size, strokeWidth, animated = false }: {
  percentage: number | Animated.Value;
  color: string;
  size: number;
  strokeWidth: number;
  animated?: boolean;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  if (animated && percentage instanceof Animated.Value) {
    // Create animated wrapper view that will update the percentage
    const [currentPercentage, setCurrentPercentage] = useState(0);
    
    React.useEffect(() => {
      const listener = percentage.addListener(({ value }) => {
        setCurrentPercentage(value);
      });
      
      return () => percentage.removeListener(listener);
    }, [percentage]);
    
    const strokeDashoffset = circumference - (currentPercentage / 100) * circumference;
    
    return (
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.status.neutral}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
    );
  } else {
    const percentageValue = typeof percentage === 'number' ? percentage : 0;
    const strokeDashoffset = circumference - (percentageValue / 100) * circumference;
    
    return (
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.status.neutral}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text.primary,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  streakEmoji: {
    fontSize: 16,
    marginRight: 5,
  },
  streakNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
    minWidth: 18,
    textAlign: 'center',
  },
  weeklySection: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 12,
  },
  weeklyRings: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayRing: {
    alignItems: 'center',
  },
  dayRingContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
  },
  checkmark: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary.teal,
  },
  dayLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 5,
  },
  goalSection: {
    paddingHorizontal: 20,
    paddingVertical: 3,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 5,
  },
  goalAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary.teal,
  },
  mainRingContainer: {
    alignItems: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  mainRing: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10, // Above the stars
  },
  mainRingGlow: {
    shadowColor: colors.primary.teal,
    shadowOpacity: 0.6,
    shadowRadius: 25,
    shadowOffset: { width: 0, height: 0 },
    elevation: 15,
  },
  ringContent: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 15, // Above everything else
  },
  remainingNumber: {
    fontSize: width * 0.23, // Slightly smaller to match reduced circle
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: 'center',
  },
  remainingLabel: {
    fontSize: 16,
    color: colors.text.secondary,
    marginTop: -10,
  },
  goalMetContent: {
    alignItems: 'center',
  },
  goalMetTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary.teal,
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.3,
    lineHeight: 32,
    paddingHorizontal: 20,
  },
  goalMetStats: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.text.primary,
    textAlign: 'center',
    opacity: 0.8,
    paddingHorizontal: 15,
  },
  statsContainer: {
    alignItems: 'center',
    paddingBottom: 5,
  },
  timeRemaining: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 10,
  },
  proteinEaten: {
    fontSize: 16,
  },
  proteinNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary.teal,
  },
  proteinLabel: {
    color: colors.text.secondary,
  },
  logButton: {
    marginHorizontal: 20,
    marginVertical: 10,
    paddingVertical: 16,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.white,
    marginRight: 10,
  },
  logButtonPlus: {
    fontSize: 24,
    fontWeight: '300',
    color: colors.text.white,
  },
  entriesSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  entriesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 15,
  },
  entryItem: {
    backgroundColor: colors.background.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  entryContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  entryDescription: {
    fontSize: 16,
    color: colors.text.primary,
    flex: 1,
  },
  entryAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary.teal,
    marginRight: 10,
  },
  deleteButton: {
    padding: 8,
  },
  deleteIcon: {
    fontSize: 18,
  },
  starsContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 1, // Behind the circle
  },
  star: {
    position: 'absolute',
    zIndex: 1, // Behind the circle and text
  },
  starEmoji: {
    textAlign: 'center',
    opacity: 0.9,
    textShadowColor: '#FFD700',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  // Sophisticated Success Modal
  successModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successModalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  successCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    marginHorizontal: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 25,
  },
  successIconContainer: {
    marginBottom: 24,
  },
  successIconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successCheckmark: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 12,
  },
  successMessage: {
    fontSize: 16,
    color: '#6B6B6B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  successActions: {
    flexDirection: 'row',
    gap: 12,
  },
  shareAction: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  shareActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  continueAction: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  continueActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
});