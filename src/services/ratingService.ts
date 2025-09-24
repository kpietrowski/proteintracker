import * as StoreReview from 'expo-store-review';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  RATING_REQUEST_COUNT: 'rating_request_count',
  RATING_TRIGGERS_USED: 'rating_triggers_used',
};

type RatingTrigger = 'onboarding' | 'first_protein' | 'first_goal' | 'manual_request';

class RatingService {
  private readonly MAX_REQUESTS = 3;

  async getRequestCount(): Promise<number> {
    try {
      const count = await AsyncStorage.getItem(STORAGE_KEYS.RATING_REQUEST_COUNT);
      return count ? parseInt(count, 10) : 0;
    } catch (error) {
      console.error('Failed to get rating request count:', error);
      return 0;
    }
  }

  private async incrementRequestCount(): Promise<void> {
    try {
      const currentCount = await this.getRequestCount();
      await AsyncStorage.setItem(
        STORAGE_KEYS.RATING_REQUEST_COUNT,
        (currentCount + 1).toString()
      );
    } catch (error) {
      console.error('Failed to increment rating request count:', error);
    }
  }

  async getTriggersUsed(): Promise<RatingTrigger[]> {
    try {
      const triggers = await AsyncStorage.getItem(STORAGE_KEYS.RATING_TRIGGERS_USED);
      return triggers ? JSON.parse(triggers) : [];
    } catch (error) {
      console.error('Failed to get triggers used:', error);
      return [];
    }
  }

  private async markTriggerUsed(trigger: RatingTrigger): Promise<void> {
    try {
      const triggers = await this.getTriggersUsed();
      if (!triggers.includes(trigger)) {
        triggers.push(trigger);
        await AsyncStorage.setItem(
          STORAGE_KEYS.RATING_TRIGGERS_USED,
          JSON.stringify(triggers)
        );
      }
    } catch (error) {
      console.error('Failed to mark trigger as used:', error);
    }
  }

  async hasTriggerBeenUsed(trigger: RatingTrigger): Promise<boolean> {
    const triggers = await this.getTriggersUsed();
    return triggers.includes(trigger);
  }

  async requestRating(trigger: RatingTrigger): Promise<boolean> {
    try {
      console.log(`🌟 Rating request initiated from trigger: ${trigger}`);

      // Check if we've already used this trigger
      const triggerUsed = await this.hasTriggerBeenUsed(trigger);
      if (triggerUsed) {
        console.log(`🌟 Trigger "${trigger}" already used for rating request`);
        return false;
      }

      // Check if we've hit the iOS limit of 3 requests per year
      const count = await this.getRequestCount();
      if (count >= this.MAX_REQUESTS) {
        console.log(`🌟 Already requested ${this.MAX_REQUESTS} times - iOS yearly limit reached`);
        return false;
      }

      // Check if in-app rating is available (not in simulator)
      const isAvailable = await StoreReview.isAvailableAsync();
      console.log(`🌟 In-app rating available: ${isAvailable}`);

      if (!isAvailable) {
        console.log('🌟 In-app rating not available (likely in dev/simulator)');
        // In development, still mark as used for testing flow
        if (__DEV__) {
          await this.incrementRequestCount();
          await this.markTriggerUsed(trigger);
          console.log(`🌟 DEV MODE: Marked as requested. Count: ${count + 1}/${this.MAX_REQUESTS}`);
        }
        return false;
      }

      // Request the rating
      await StoreReview.requestReview();
      console.log(`🌟 Native iOS rating dialog shown!`);

      // Update count and mark trigger as used
      await this.incrementRequestCount();
      await this.markTriggerUsed(trigger);

      const newCount = count + 1;
      console.log(`🌟 Rating requested via "${trigger}". Total requests: ${newCount}/${this.MAX_REQUESTS}`);

      if (newCount === this.MAX_REQUESTS) {
        console.log(`🌟 All ${this.MAX_REQUESTS} rating requests used for the year!`);
      }

      return true;
    } catch (error) {
      console.error(`🌟 Error requesting rating from ${trigger}:`, error);
      return false;
    }
  }

  // Debug method to reset rating state (for development only)
  async resetRatingState(): Promise<void> {
    if (__DEV__) {
      try {
        await AsyncStorage.multiRemove([
          STORAGE_KEYS.RATING_REQUEST_COUNT,
          STORAGE_KEYS.RATING_TRIGGERS_USED
        ]);
        console.log('🌟 Rating state reset for development');
      } catch (error) {
        console.error('Failed to reset rating state:', error);
      }
    }
  }

  // Get current rating state (for debugging)
  async getRatingState(): Promise<{
    requestCount: number;
    triggersUsed: RatingTrigger[];
    remainingRequests: number;
  }> {
    const requestCount = await this.getRequestCount();
    const triggersUsed = await this.getTriggersUsed();
    return {
      requestCount,
      triggersUsed,
      remainingRequests: Math.max(0, this.MAX_REQUESTS - requestCount)
    };
  }
}

export const ratingService = new RatingService();