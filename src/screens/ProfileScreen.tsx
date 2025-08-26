import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../constants/colors';
import { User, ProfileStats } from '../types';
import { supabase, getUserProfile, updateUserProfile, signOut } from '../services/supabase';
import { purchaseService } from '../services/purchases';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [weeklyStats, setWeeklyStats] = useState<ProfileStats['thisWeek'] | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempName, setTempName] = useState('');
  const [tempGoal, setTempGoal] = useState('');

  useEffect(() => {
    loadUserData();
    loadWeeklyStats();
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const profile = await getUserProfile(authUser.id);
        if (profile) {
          setUser(profile);
          setTempName(profile.name);
          setTempGoal(profile.dailyProteinGoal.toString());
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadWeeklyStats = async () => {
    // This would fetch from database, but for now using mock data
    setWeeklyStats({
      goalsHit: 5,
      totalProtein: 640,
    });
  };

  const handleEditName = () => {
    setIsEditingName(true);
  };

  const handleSaveName = async () => {
    if (!user) return;
    
    try {
      await updateUserProfile(user.id, { name: tempName });
      setUser({ ...user, name: tempName });
      setIsEditingName(false);
    } catch (error) {
      console.error('Error updating name:', error);
      Alert.alert('Error', 'Failed to update name');
    }
  };

  const handleEditGoal = () => {
    setIsEditingGoal(true);
  };

  const handleSaveGoal = async () => {
    if (!user) return;
    
    const goalNum = parseInt(tempGoal);
    if (isNaN(goalNum) || goalNum < 1 || goalNum > 500) {
      Alert.alert('Invalid Goal', 'Please enter a number between 1 and 500');
      return;
    }
    
    try {
      await updateUserProfile(user.id, { dailyProteinGoal: goalNum });
      setUser({ ...user, dailyProteinGoal: goalNum });
      setIsEditingGoal(false);
    } catch (error) {
      console.error('Error updating goal:', error);
      Alert.alert('Error', 'Failed to update goal');
    }
  };

  const handleCalculateGoal = () => {
    Alert.alert(
      'Protein Goal Calculator',
      'Based on your weight and activity level:\n\n' +
      'Sedentary: 0.8g per kg\n' +
      'Moderate: 1.2g per kg\n' +
      'Active: 1.6g per kg\n' +
      'Very Active: 2.0g per kg',
      [{ text: 'OK' }]
    );
  };

  const handleClearTestData = async () => {
    Alert.alert(
      'Clear Today\'s Protein',
      'This will reset your protein intake for today back to zero. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Today',
          style: 'destructive',
          onPress: async () => {
            try {
              // Get current date key for today's protein data
              const dateKey = new Date().toISOString().split('T')[0];
              const todayStorageKey = `demo_protein_${dateKey}`;
              
              // Only remove today's protein entries
              await AsyncStorage.removeItem(todayStorageKey);
              
              // Debug: Check if mockAuthenticated is still there
              const mockAuth = await AsyncStorage.getItem('mockAuthenticated');
              console.log('After reset - mockAuthenticated:', mockAuth);
              
              Alert.alert('Success', 'Today\'s protein data has been reset to zero!');
            } catch (error) {
              console.error('Error clearing today\'s data:', error);
              Alert.alert('Error', 'Failed to reset today\'s protein data.');
            }
          },
        },
      ]
    );
  };

  const handleFullReset = async () => {
    Alert.alert(
      'Full Reset',
      'This will clear ALL data and return you to onboarding. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Full Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear ALL AsyncStorage data
              await AsyncStorage.clear();
              
              // Sign out from Supabase
              await supabase.auth.signOut();
              
              Alert.alert('Success', 'Everything reset! The app will return to onboarding.');
            } catch (error) {
              console.error('Error resetting:', error);
              Alert.alert('Error', 'Failed to reset completely.');
            }
          },
        },
      ]
    );
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              await purchaseService.logOut();
            } catch (error) {
              console.error('Error signing out:', error);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarIcon}>👤</Text>
          </View>
          <Text style={styles.title}>Profile</Text>
        </View>

        {/* Profile Fields */}
        <View style={styles.section}>
          {/* Name Field */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Name</Text>
            <View style={styles.fieldContent}>
              {isEditingName ? (
                <TextInput
                  style={styles.input}
                  value={tempName}
                  onChangeText={setTempName}
                  autoFocus
                  onBlur={handleSaveName}
                  onSubmitEditing={handleSaveName}
                />
              ) : (
                <>
                  <Text style={styles.fieldValue}>{user?.name || 'Loading...'}</Text>
                  <TouchableOpacity onPress={handleEditName}>
                    <Text style={styles.editIcon}>✏️</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>

          {/* Daily Protein Goal Field */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Daily Protein Goal</Text>
            <View style={styles.fieldContent}>
              {isEditingGoal ? (
                <TextInput
                  style={styles.input}
                  value={tempGoal}
                  onChangeText={setTempGoal}
                  keyboardType="numeric"
                  autoFocus
                  onBlur={handleSaveGoal}
                  onSubmitEditing={handleSaveGoal}
                />
              ) : (
                <>
                  <View style={styles.goalValue}>
                    <Text style={styles.goalIcon}>🎯</Text>
                    <Text style={styles.goalText}>{user?.dailyProteinGoal || 120}g</Text>
                  </View>
                  <TouchableOpacity onPress={handleEditGoal}>
                    <Text style={styles.editIcon}>✏️</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>

          {/* Calculate Recommended Goal Button */}
          <TouchableOpacity 
            style={styles.calculateButton}
            onPress={handleCalculateGoal}
          >
            <Text style={styles.calculateButtonText}>Calculate Recommended Goal →</Text>
          </TouchableOpacity>
        </View>

        {/* Weekly Stats */}
        {weeklyStats && (
          <View style={styles.statsSection}>
            <Text style={styles.statsTitle}>This Week</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{weeklyStats.goalsHit}</Text>
                <Text style={styles.statLabel}>Goals Hit</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{weeklyStats.totalProtein}g</Text>
                <Text style={styles.statLabel}>Total Protein</Text>
              </View>
            </View>
          </View>
        )}

        {/* Settings */}
        <View style={styles.settingsSection}>
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>Notifications</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>Subscription</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>Privacy Policy</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>Terms of Service</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>Support</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem} onPress={handleClearTestData}>
            <Text style={[styles.settingText, { color: colors.secondary.orange }]}>Reset Today's Protein</Text>
            <Text style={styles.settingArrow}>🗑️</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem} onPress={handleFullReset}>
            <Text style={[styles.settingText, { color: '#FF0000' }]}>Full Reset to Onboarding</Text>
            <Text style={styles.settingArrow}>🔄</Text>
          </TouchableOpacity>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.secondary.coral,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarIcon: {
    fontSize: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text.primary,
  },
  section: {
    backgroundColor: colors.background.white,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    padding: 20,
  },
  field: {
    marginBottom: 25,
  },
  fieldLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  fieldContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fieldValue: {
    fontSize: 18,
    color: colors.text.primary,
  },
  input: {
    fontSize: 18,
    color: colors.text.primary,
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary.teal,
    paddingVertical: 5,
  },
  editIcon: {
    fontSize: 20,
  },
  goalValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  goalIcon: {
    fontSize: 24,
  },
  goalText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary.teal,
  },
  calculateButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.secondary.coral,
  },
  calculateButtonText: {
    fontSize: 16,
    color: colors.secondary.coral,
    textAlign: 'center',
    fontWeight: '600',
  },
  statsSection: {
    backgroundColor: colors.background.white,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    padding: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary.teal,
  },
  statLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 5,
  },
  settingsSection: {
    backgroundColor: colors.background.white,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.status.neutral,
  },
  settingText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  settingArrow: {
    fontSize: 20,
    color: colors.text.secondary,
  },
  signOutButton: {
    marginHorizontal: 20,
    marginBottom: 30,
    paddingVertical: 15,
    borderRadius: 10,
    backgroundColor: colors.secondary.orange,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.white,
    textAlign: 'center',
  },
});