import * as Notifications from 'expo-notifications';
import { localStorageService } from './localStorage';
import { getLocalDateKey } from '../utils/dateHelpers';

// Notification IDs for managing updates/cancellations
const NOTIFICATION_IDS = {
  DAILY_REMINDER: 'daily-reminder-10am',
  PROTEIN_LEFT: 'protein-left-7pm',
};

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  constructor() {
    this.setupNotificationListeners();
  }

  private setupNotificationListeners() {
    // Handle notification received while app is foregrounded
    Notifications.addNotificationReceivedListener(notification => {
      console.log('📱 Notification received:', notification);
    });

    // Handle notification response (user tapped on notification)
    Notifications.addNotificationResponseReceivedListener(response => {
      console.log('📱 Notification tapped:', response);
    });
  }

  // Request notification permissions
  async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('❌ Notification permission denied');
        return false;
      }
      
      console.log('✅ Notification permission granted');
      return true;
    } catch (error) {
      console.error('❌ Error requesting notification permissions:', error);
      return false;
    }
  }

  // Schedule the daily 10 AM reminder (repeats every day)
  async scheduleDailyReminder() {
    try {
      // Cancel any existing daily reminder
      await this.cancelNotification(NOTIFICATION_IDS.DAILY_REMINDER);

      // Get tomorrow at 10 AM as the first trigger
      const trigger = new Date();
      trigger.setDate(trigger.getDate() + 1);
      trigger.setHours(10, 0, 0, 0);

      // Schedule repeating daily notification
      const id = await Notifications.scheduleNotificationAsync({
        identifier: NOTIFICATION_IDS.DAILY_REMINDER,
        content: {
          title: 'Time to track your protein! 💪',
          body: 'Don\'t forget to log your protein intake today',
          sound: true,
          badge: 1,
        },
        trigger: {
          hour: 10,
          minute: 0,
          repeats: true,
        },
      });

      console.log('✅ Daily reminder scheduled for 10 AM, ID:', id);
      return id;
    } catch (error) {
      console.error('❌ Error scheduling daily reminder:', error);
      throw error;
    }
  }

  // Schedule or update the 7 PM protein left notification for today
  async scheduleProteinLeftNotification() {
    try {
      // Get user's protein goal and today's progress
      const profile = await localStorageService.getUserProfile();
      const proteinGoal = profile?.proteinGoal || 150;
      
      // Get today's protein logs
      const today = getLocalDateKey();
      const todayLogs = await localStorageService.getProteinLogsForDate(today);
      const totalProtein = todayLogs.reduce((sum, log) => sum + log.amount, 0);
      
      const proteinLeft = Math.max(0, proteinGoal - totalProtein);
      
      // Cancel existing 7 PM notification
      await this.cancelNotification(NOTIFICATION_IDS.PROTEIN_LEFT);
      
      // If goal is met, don't schedule notification
      if (proteinLeft === 0) {
        console.log('✅ Protein goal met! No 7 PM notification needed');
        return null;
      }
      
      // Schedule 7 PM notification for today
      const trigger = new Date();
      
      // If it's already past 7 PM today, schedule for tomorrow
      const currentHour = trigger.getHours();
      if (currentHour >= 19) {
        trigger.setDate(trigger.getDate() + 1);
      }
      
      trigger.setHours(19, 0, 0, 0); // 7 PM
      
      const id = await Notifications.scheduleNotificationAsync({
        identifier: NOTIFICATION_IDS.PROTEIN_LEFT,
        content: {
          title: 'Protein Check-In 🥩',
          body: `You have ${proteinLeft}g of protein left to hit your daily goal!`,
          sound: true,
          badge: 1,
          data: { proteinLeft, proteinGoal },
        },
        trigger,
      });
      
      console.log(`✅ 7 PM notification scheduled: ${proteinLeft}g left, ID:`, id);
      return id;
    } catch (error) {
      console.error('❌ Error scheduling protein left notification:', error);
      throw error;
    }
  }

  // Update protein left notification when user logs protein
  async updateProteinLeftNotification(newProteinAmount: number) {
    try {
      // Get user's protein goal
      const profile = await localStorageService.getUserProfile();
      const proteinGoal = profile?.proteinGoal || 150;
      
      // Get today's total protein (including the new entry)
      const today = getLocalDateKey();
      const todayLogs = await localStorageService.getProteinLogsForDate(today);
      const totalProtein = todayLogs.reduce((sum, log) => sum + log.amount, 0);
      
      const proteinLeft = Math.max(0, proteinGoal - totalProtein);
      
      // Cancel existing 7 PM notification
      await this.cancelNotification(NOTIFICATION_IDS.PROTEIN_LEFT);
      
      // If goal is met, don't reschedule
      if (proteinLeft === 0) {
        console.log('🎉 Protein goal met! Cancelled 7 PM notification');
        return null;
      }
      
      // Check if it's still before 7 PM today
      const now = new Date();
      if (now.getHours() < 19) {
        // Reschedule for today at 7 PM with updated amount
        const trigger = new Date();
        trigger.setHours(19, 0, 0, 0);
        
        const id = await Notifications.scheduleNotificationAsync({
          identifier: NOTIFICATION_IDS.PROTEIN_LEFT,
          content: {
            title: 'Protein Check-In 🥩',
            body: `You have ${proteinLeft}g of protein left to hit your daily goal!`,
            sound: true,
            badge: 1,
            data: { proteinLeft, proteinGoal },
          },
          trigger,
        });
        
        console.log(`✅ Updated 7 PM notification: ${proteinLeft}g left`);
        return id;
      } else {
        console.log('⏰ Past 7 PM, will schedule tomorrow\'s notification later');
        return null;
      }
    } catch (error) {
      console.error('❌ Error updating protein left notification:', error);
      throw error;
    }
  }

  // Cancel a specific notification
  async cancelNotification(identifier: string) {
    try {
      await Notifications.cancelScheduledNotificationAsync(identifier);
      console.log(`🗑️ Cancelled notification: ${identifier}`);
    } catch (error) {
      // Ignore errors if notification doesn't exist
      console.log(`ℹ️ Notification ${identifier} may not exist`);
    }
  }

  // Cancel all scheduled notifications
  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('🗑️ All notifications cancelled');
    } catch (error) {
      console.error('❌ Error cancelling all notifications:', error);
    }
  }

  // Get all scheduled notifications (for debugging)
  async getScheduledNotifications() {
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      console.log('📋 Scheduled notifications:', notifications);
      return notifications;
    } catch (error) {
      console.error('❌ Error getting scheduled notifications:', error);
      return [];
    }
  }

  // Initialize notifications on app launch WITHOUT requesting permissions
  // This is used in App.tsx to set up listeners only
  async initializeWithoutPermission() {
    try {
      console.log('📱 Setting up notification listeners (no permission request)...');
      
      // Check if we already have permission
      const { status } = await Notifications.getPermissionsAsync();
      
      if (status === 'granted') {
        console.log('✅ Notifications already permitted, scheduling if needed...');
        
        // Check if we need to schedule notifications
        const scheduled = await this.getScheduledNotifications();
        const hasDailyReminder = scheduled.some(n => n.identifier === NOTIFICATION_IDS.DAILY_REMINDER);
        
        if (!hasDailyReminder) {
          console.log('📅 Scheduling missing daily reminder...');
          await this.scheduleDailyReminder();
        }
        
        // Schedule today's 7 PM notification if needed
        await this.scheduleProteinLeftNotification();
        
        return true;
      }
      
      console.log('ℹ️ Notification permission not yet granted (will be requested in onboarding)');
      return false;
    } catch (error) {
      console.error('❌ Error initializing notifications:', error);
      return false;
    }
  }
  
  // Initialize notifications WITH permission request
  // This is used in OnboardingScreen20 when user explicitly allows notifications
  async initialize() {
    try {
      const hasPermission = await this.requestPermissions();
      
      if (hasPermission) {
        // Check if we need to schedule notifications
        const scheduled = await this.getScheduledNotifications();
        const hasDailyReminder = scheduled.some(n => n.identifier === NOTIFICATION_IDS.DAILY_REMINDER);
        
        if (!hasDailyReminder) {
          console.log('📅 Scheduling missing daily reminder...');
          await this.scheduleDailyReminder();
        }
        
        // Schedule today's 7 PM notification if needed
        await this.scheduleProteinLeftNotification();
      }
      
      return hasPermission;
    } catch (error) {
      console.error('❌ Error initializing notifications:', error);
      return false;
    }
  }
}

export const notificationService = new NotificationService();