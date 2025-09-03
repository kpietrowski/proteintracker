import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { hapticFeedback } from '../../utils/haptics';
import * as Notifications from 'expo-notifications';
// IMPORTANT: No store review imports to prevent crashes

export default function OnboardingScreen20() {
  const navigation = useNavigation();
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const [permissionStatus, setPermissionStatus] = useState<string>('checking...');

  useEffect(() => {
    const bounce = () => {
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -10,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => bounce());
    };
    bounce();

    // Check permission status on mount
    checkPermissionStatus();
  }, [bounceAnim]);

  const checkPermissionStatus = async () => {
    try {
      const currentPermissions = await Notifications.getPermissionsAsync();
      setPermissionStatus(currentPermissions.status);
      console.log('🔔 Initial permission status:', currentPermissions.status);
    } catch (error) {
      console.log('🚨 Error checking permission status:', error);
      setPermissionStatus('error');
    }
  };

  const handleAllow = async () => {
    hapticFeedback.success();
    
    try {
      console.log('🔔 Checking current notification permissions...');
      
      // First, check the current permission status
      const currentPermissions = await Notifications.getPermissionsAsync();
      console.log('🔔 Current permission status:', currentPermissions.status);
      
      if (currentPermissions.status === 'undetermined') {
        // Only request if permissions haven't been asked before
        console.log('🔔 Permissions undetermined - requesting notification permissions...');
        const { status } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
            allowDisplayInCarPlay: true,
            allowCriticalAlerts: false,
            provideAppNotificationSettings: true,
            allowProvisional: false,
            allowAnnouncements: false,
          },
        });
        console.log('🔔 Notification permission result:', status);
      } else if (currentPermissions.status === 'denied') {
        console.log('🔔 Permissions previously denied - cannot show native popup again');
        console.log('🔔 User would need to go to Settings > Notifications to enable');
      } else if (currentPermissions.status === 'granted') {
        console.log('🔔 Permissions already granted');
      }
      
    } catch (error) {
      console.log('🚨 Notification permission error (non-blocking):', error);
      // Gracefully continue - don't let permission errors break the flow
    }
    
    // CRITICAL: No store review logic whatsoever to prevent crashes
    console.log('📝 Proceeding to final screen (store review handled elsewhere)');
    
    // Navigate to loading screen regardless of permission result
    navigation.navigate('Loading' as never);
  };

  const handleDontAllow = () => {
    hapticFeedback.light();
    navigation.navigate('Loading' as never);
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
          <View style={[styles.progressFill, { width: '80%' }]} />
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Hit your protein goal with notifications</Text>
        <Text style={styles.subtitle}>
          Get reminders to stay on track with your daily protein intake.
        </Text>

        <View style={styles.mockPhoneContainer}>
          <View style={styles.notificationCard}>
            <Text style={styles.notificationTitle}>
              "Protein AI" Would Like to Send You Notifications
            </Text>
            <Text style={styles.notificationSubtext}>
              Notifications may include alerts, sounds, and icon badges. These can be configured in Settings.
            </Text>
            
            <View style={styles.divider} />
            
            <View style={styles.notificationButtons}>
              <TouchableOpacity 
                style={styles.dontAllowButton}
                onPress={handleDontAllow}
              >
                <Text style={styles.dontAllowText}>Don't Allow</Text>
              </TouchableOpacity>
              
              <View style={styles.verticalDivider} />
              
              <TouchableOpacity 
                style={styles.allowButton}
                onPress={handleAllow}
              >
                <Text style={styles.allowText}>Allow</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Bouncing finger under Allow button */}
          <Animated.View style={[styles.fingerContainer, { transform: [{ translateY: bounceAnim }] }]}>
            <Text style={styles.fingerEmoji}>👆</Text>
          </Animated.View>
        </View>

        <View style={styles.statisticCard}>
          <View style={styles.bellIcon}>
            <Ionicons name="notifications" size={20} color="#6B6B6B" />
          </View>
          <Text style={styles.statisticText}>
            78% of successful protein goal achievers used notifications to maintain their progress
          </Text>
        </View>


      </View>

      {/* Next Button */}
      <TouchableOpacity
        style={styles.nextButton}
        onPress={handleAllow}
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
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 10,
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B6B6B',
    lineHeight: 24,
    marginBottom: 40,
  },
  mockPhoneContainer: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 40,
    height: 300,
    position: 'relative',
    justifyContent: 'center',
  },
  notificationCard: {
    backgroundColor: '#F2F2F7',
    borderRadius: 14,
    width: 270,
    alignSelf: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
    position: 'absolute',
    top: '35%',
    left: '50%',
    marginLeft: -135,
    marginTop: -80,
  },
  notificationTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 8,
    paddingHorizontal: 16,
    lineHeight: 22,
  },
  notificationSubtext: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  notificationButtons: {
    flexDirection: 'row',
    height: 44,
  },
  divider: {
    height: 0.5,
    backgroundColor: '#C7C7CC',
    marginHorizontal: 0,
  },
  verticalDivider: {
    width: 0.5,
    backgroundColor: '#C7C7CC',
  },
  dontAllowButton: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    height: 44,
  },
  dontAllowText: {
    fontSize: 17,
    fontWeight: '400',
    color: '#000000',
  },
  allowButton: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    height: 44,
  },
  allowText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#007AFF',
  },
  fingerContainer: {
    position: 'absolute',
    top: '44%',
    left: '65%',
    marginLeft: -16,
  },
  fingerEmoji: {
    fontSize: 32,
  },
  statisticCard: {
    backgroundColor: '#E8E8FF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginTop: -20,
    marginBottom: 380,
    marginHorizontal: 20,
  },
  bellIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statisticText: {
    flex: 1,
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '500',
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