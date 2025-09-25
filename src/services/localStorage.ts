import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocalDateKey, getUTCDateKey } from '../utils/dateHelpers';

// Local storage keys
const STORAGE_KEYS = {
  USER_PROFILE: 'user_profile',
  PROTEIN_LOGS: 'protein_logs',
  APP_SETTINGS: 'app_settings',
  ONBOARDING_COMPLETE: 'onboarding_complete',
  FIRST_PROTEIN_ENTRY_COMPLETE: 'first_protein_entry_complete',
  FIRST_GOAL_ACHIEVED: 'first_goal_achieved'
};

// Type definitions for local data
export interface LocalUserProfile {
  id: string;
  name: string;
  fitnessGoal: string;
  sex: string;
  activityLevel: string;
  age: number;
  heightFt?: number;
  heightIn?: number;
  heightCm?: number;
  weightLbs?: number;
  weightKg?: number;
  proteinGoal: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProteinLogEntry {
  id: string;
  date: string; // YYYY-MM-DD format
  amount: number;
  description?: string;
  source: 'voice' | 'manual';
  createdAt: string;
}

export interface AppSettings {
  onboardingCompleted: boolean;
  subscriptionStatus: 'active' | 'expired' | 'trial' | 'none';
  lastOpenDate: string;
}

class LocalStorageService {
  
  // ============= USER PROFILE METHODS =============
  
  async saveUserProfile(profileData: any): Promise<void> {
    try {
      const profile: LocalUserProfile = {
        id: `local_user_${Date.now()}`,
        name: profileData.name || 'User',
        fitnessGoal: profileData.fitnessGoal || '',
        sex: profileData.sex || '',
        activityLevel: profileData.activityLevel || '',
        age: profileData.age || 0,
        heightFt: profileData.heightFt,
        heightIn: profileData.heightIn, 
        heightCm: profileData.heightCm,
        weightLbs: profileData.weightLbs,
        weightKg: profileData.weightKg,
        proteinGoal: profileData.proteinGoal || 150,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
      console.log('✅ User profile saved locally:', profile.id);
      
      // Mark onboarding as complete
      await this.setOnboardingComplete(true);
      
    } catch (error) {
      console.error('❌ Failed to save user profile:', error);
      throw error;
    }
  }

  async getUserProfile(): Promise<LocalUserProfile | null> {
    try {
      const profileJson = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      if (profileJson) {
        return JSON.parse(profileJson);
      }
      return null;
    } catch (error) {
      console.error('❌ Failed to get user profile:', error);
      return null;
    }
  }

  async updateUserProfile(updates: Partial<LocalUserProfile>): Promise<void> {
    try {
      const existingProfile = await this.getUserProfile();
      if (!existingProfile) {
        throw new Error('No user profile found to update');
      }
      
      const updatedProfile = {
        ...existingProfile,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(updatedProfile));
      console.log('✅ User profile updated locally');
    } catch (error) {
      console.error('❌ Failed to update user profile:', error);
      throw error;
    }
  }

  // ============= PROTEIN LOGGING METHODS =============

  async addProteinEntry(date: string, amount: number, description?: string, source: 'voice' | 'manual' = 'manual'): Promise<void> {
    try {
      const entry: ProteinLogEntry = {
        id: `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        date,
        amount,
        description,
        source,
        createdAt: new Date().toISOString()
      };

      // Get existing logs for the date
      const existingLogs = await this.getProteinLogsForDate(date);
      const updatedLogs = [...existingLogs, entry];

      // Get all protein logs
      const allLogsJson = await AsyncStorage.getItem(STORAGE_KEYS.PROTEIN_LOGS);
      const allLogs = allLogsJson ? JSON.parse(allLogsJson) : {};
      
      // Update logs for this date
      allLogs[date] = updatedLogs;
      
      await AsyncStorage.setItem(STORAGE_KEYS.PROTEIN_LOGS, JSON.stringify(allLogs));
      console.log('✅ Protein entry added:', entry.id, amount, 'g');
      
      // Note: Notification update moved to calling code to avoid circular dependency
      
    } catch (error) {
      console.error('❌ Failed to add protein entry:', error);
      throw error;
    }
  }

  async getProteinLogsForDate(date: string): Promise<ProteinLogEntry[]> {
    try {
      const allLogsJson = await AsyncStorage.getItem(STORAGE_KEYS.PROTEIN_LOGS);
      if (!allLogsJson) {
        return [];
      }

      const allLogs = JSON.parse(allLogsJson);

      // Try to get logs with the provided date key first (should be local date)
      let logs = allLogs[date] || [];

      // Migration support: If no logs found and date looks like a local date,
      // also check the UTC date key for backwards compatibility
      if (logs.length === 0 && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // Parse the date and check if there's data stored with UTC key
        const [year, month, day] = date.split('-').map(Number);
        const localDate = new Date(year, month - 1, day);
        const utcDateKey = getUTCDateKey(localDate);

        if (utcDateKey !== date && allLogs[utcDateKey]) {
          logs = allLogs[utcDateKey];

          // Migrate the data to use local date key
          allLogs[date] = logs;
          delete allLogs[utcDateKey];
          await AsyncStorage.setItem(STORAGE_KEYS.PROTEIN_LOGS, JSON.stringify(allLogs));

          console.log(`Migrated protein data from UTC key ${utcDateKey} to local key ${date}`);
        }
      }

      return logs;
      
    } catch (error) {
      console.error('❌ Failed to get protein logs for date:', error);
      return [];
    }
  }

  async getProteinLogsForDateRange(startDate: string, endDate: string): Promise<{ [date: string]: ProteinLogEntry[] }> {
    try {
      const allLogsJson = await AsyncStorage.getItem(STORAGE_KEYS.PROTEIN_LOGS);
      if (!allLogsJson) {
        return {};
      }
      
      const allLogs = JSON.parse(allLogsJson);
      const filteredLogs: { [date: string]: ProteinLogEntry[] } = {};
      
      // Filter logs within date range
      Object.keys(allLogs).forEach(date => {
        if (date >= startDate && date <= endDate) {
          filteredLogs[date] = allLogs[date];
        }
      });
      
      return filteredLogs;
      
    } catch (error) {
      console.error('❌ Failed to get protein logs for date range:', error);
      return {};
    }
  }

  async deleteProteinEntry(entryId: string, date: string): Promise<void> {
    try {
      const existingLogs = await this.getProteinLogsForDate(date);
      const updatedLogs = existingLogs.filter(log => log.id !== entryId);
      
      // Get all protein logs
      const allLogsJson = await AsyncStorage.getItem(STORAGE_KEYS.PROTEIN_LOGS);
      const allLogs = allLogsJson ? JSON.parse(allLogsJson) : {};
      
      // Update logs for this date
      allLogs[date] = updatedLogs;
      
      await AsyncStorage.setItem(STORAGE_KEYS.PROTEIN_LOGS, JSON.stringify(allLogs));
      console.log('✅ Protein entry deleted:', entryId);
      
    } catch (error) {
      console.error('❌ Failed to delete protein entry:', error);
      throw error;
    }
  }

  async clearProteinEntriesForDate(date: string): Promise<void> {
    try {
      // Get all protein logs
      const allLogsJson = await AsyncStorage.getItem(STORAGE_KEYS.PROTEIN_LOGS);
      const allLogs = allLogsJson ? JSON.parse(allLogsJson) : {};
      
      // Clear logs for this specific date
      allLogs[date] = [];
      
      await AsyncStorage.setItem(STORAGE_KEYS.PROTEIN_LOGS, JSON.stringify(allLogs));
      console.log(`✅ Protein entries cleared for date: ${date}`);
      
    } catch (error) {
      console.error('❌ Failed to clear protein entries for date:', error);
      throw error;
    }
  }

  // ============= APP SETTINGS METHODS =============

  async setOnboardingComplete(completed: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, completed.toString());
      
      // Also update app settings
      const settings = await this.getAppSettings();
      await AsyncStorage.setItem(STORAGE_KEYS.APP_SETTINGS, JSON.stringify({
        ...settings,
        onboardingCompleted: completed,
        lastOpenDate: new Date().toISOString()
      }));
      
      console.log('✅ Onboarding complete status:', completed);
    } catch (error) {
      console.error('❌ Failed to set onboarding complete:', error);
    }
  }

  async isOnboardingComplete(): Promise<boolean> {
    try {
      const completed = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE);
      return completed === 'true';
    } catch (error) {
      console.error('❌ Failed to check onboarding status:', error);
      return false;
    }
  }

  async getAppSettings(): Promise<AppSettings> {
    try {
      const settingsJson = await AsyncStorage.getItem(STORAGE_KEYS.APP_SETTINGS);
      if (settingsJson) {
        return JSON.parse(settingsJson);
      }
      
      // Default settings
      return {
        onboardingCompleted: false,
        subscriptionStatus: 'none',
        lastOpenDate: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Failed to get app settings:', error);
      return {
        onboardingCompleted: false,
        subscriptionStatus: 'none',
        lastOpenDate: new Date().toISOString()
      };
    }
  }

  // ============= UTILITY METHODS =============

  async calculateCurrentStreak(): Promise<number> {
    try {
      const profile = await this.getUserProfile();
      if (!profile) return 0;
      
      const proteinGoal = profile.proteinGoal || 150;
      let streak = 0;
      let checkDate = new Date();
      
      // First, check if today's goal has been met
      const todayKey = getLocalDateKey(checkDate);
      const todayEntries = await this.getProteinLogsForDate(todayKey);
      
      if (todayEntries.length > 0) {
        const todayTotal = todayEntries.reduce((sum: number, entry: any) => sum + entry.amount, 0);
        if (todayTotal >= proteinGoal) {
          streak = 1; // Start with 1 if today's goal is met
        } else {
          // Today's goal not met, streak is 0
          return 0;
        }
      } else {
        // No entries today, check if yesterday had entries (streak might be continuing)
        // Don't return 0 immediately
      }
      
      // Now check previous days
      checkDate.setDate(checkDate.getDate() - 1); // Start from yesterday
      
      // Check up to 365 days back
      for (let i = 0; i < 365; i++) {
        const dateKey = getLocalDateKey(checkDate);
        const entries = await this.getProteinLogsForDate(dateKey);
        
        if (entries.length === 0) {
          // No entries for this day, streak ends here
          break;
        }
        
        const totalProtein = entries.reduce((sum: number, entry: any) => sum + entry.amount, 0);
        
        if (totalProtein >= proteinGoal) {
          streak++;
          // Move to previous day
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          // Goal not met, streak ends here
          break;
        }
      }
      
      console.log(`📊 Current streak: ${streak} days`);
      return streak;
    } catch (error) {
      console.error('❌ Failed to calculate streak:', error);
      return 0;
    }
  }

  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER_PROFILE,
        STORAGE_KEYS.PROTEIN_LOGS,
        STORAGE_KEYS.APP_SETTINGS,
        STORAGE_KEYS.ONBOARDING_COMPLETE,
        STORAGE_KEYS.FIRST_PROTEIN_ENTRY_COMPLETE,
        STORAGE_KEYS.FIRST_GOAL_ACHIEVED
      ]);
      console.log('✅ All local data cleared');
    } catch (error) {
      console.error('❌ Failed to clear local data:', error);
    }
  }

  async exportData(): Promise<string> {
    try {
      const profile = await this.getUserProfile();
      const allLogsJson = await AsyncStorage.getItem(STORAGE_KEYS.PROTEIN_LOGS);
      const allLogs = allLogsJson ? JSON.parse(allLogsJson) : {};
      const settings = await this.getAppSettings();

      const exportData = {
        userProfile: profile,
        proteinLogs: allLogs,
        appSettings: settings,
        exportDate: new Date().toISOString()
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('❌ Failed to export data:', error);
      return '{}';
    }
  }

  // ============= RATING TRACKING METHODS =============

  async getFirstProteinEntryStatus(): Promise<boolean> {
    try {
      const status = await AsyncStorage.getItem(STORAGE_KEYS.FIRST_PROTEIN_ENTRY_COMPLETE);
      return status === 'true';
    } catch (error) {
      console.error('❌ Failed to get first protein entry status:', error);
      return false;
    }
  }

  async setFirstProteinEntryComplete(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.FIRST_PROTEIN_ENTRY_COMPLETE, 'true');
      console.log('✅ First protein entry marked as complete');
    } catch (error) {
      console.error('❌ Failed to set first protein entry complete:', error);
    }
  }

  async getFirstGoalAchievedStatus(): Promise<boolean> {
    try {
      const status = await AsyncStorage.getItem(STORAGE_KEYS.FIRST_GOAL_ACHIEVED);
      return status === 'true';
    } catch (error) {
      console.error('❌ Failed to get first goal achieved status:', error);
      return false;
    }
  }

  async setFirstGoalAchieved(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.FIRST_GOAL_ACHIEVED, 'true');
      console.log('✅ First goal achievement marked as complete');
    } catch (error) {
      console.error('❌ Failed to set first goal achieved:', error);
    }
  }
}

// Export singleton instance
export const localStorageService = new LocalStorageService();

// Export for easier imports
export default localStorageService;