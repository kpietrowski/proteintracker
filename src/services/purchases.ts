import Purchases, { 
  PurchasesOffering,
  PurchasesPackage,
  CustomerInfo,
  PurchasesError,
  PURCHASES_ERROR_CODE
} from 'react-native-purchases';
import { Platform } from 'react-native';
import { config } from './config';

// Conditional import for Superwall to prevent crashes in simulator
let Superwall: any = null;
try {
  Superwall = require('@superwall/react-native-superwall').default;
} catch (error) {
  console.warn('Superwall not available in simulator:', error);
}

class PurchaseService {
  private initialized = false;

  async initialize() {
    if (this.initialized) return;

    console.log('Initializing purchase services...');

    try {
      // Initialize RevenueCat
      const apiKey = Platform.OS === 'ios' 
        ? config.revenueCat.apiKeyIOS 
        : config.revenueCat.apiKeyAndroid;
      
      // Only initialize if we have public keys (start with appl_ or goog_)
      if (apiKey && (apiKey.startsWith('appl_') || apiKey.startsWith('goog_'))) {
        try {
          Purchases.configure({ apiKey });
          console.log('✅ RevenueCat initialized successfully');
        } catch (error) {
          console.warn('⚠️ RevenueCat initialization failed:', error);
        }
      } else if (apiKey) {
        console.warn('⚠️ RevenueCat key appears to be a secret key (starts with sk_). Please use public key (appl_ or goog_)');
      } else {
        console.log('ℹ️ RevenueCat: No API key configured, skipping initialization');
      }

      // Initialize Superwall
      if (config.superwall.apiKey && Superwall) {
        try {
          console.log('🔧 Attempting to initialize Superwall with key:', config.superwall.apiKey ? 'Key exists' : 'No key');
          console.log('🔧 Superwall.shared available?', !!Superwall.shared);
          
          // Use correct object syntax for Superwall.configure
          console.log('🔧 Configuring Superwall with API key');
          await Superwall.configure({
            apiKey: config.superwall.apiKey
          });
          console.log('✅ Superwall initialized successfully');

          // Set up Superwall delegate if available
          if (Superwall.shared && Superwall.shared.delegate !== undefined) {
            Superwall.shared.delegate = {
              handleSuperwallEvent: async (event: any) => {
                console.log('🔵 Global Superwall Event:', event);
                
                // Handle different Superwall events
                switch (event.type) {
                  case 'paywall_close':
                  case 'paywallClose':
                    console.log('👋 Paywall closed globally');
                    break;
                  case 'transaction_complete':
                  case 'transactionComplete':
                    console.log('💰 Purchase successful globally');
                    await this.handleSuccessfulPurchase();
                    
                    // Check if we need to navigate to PhoneAuth (for onboarding flow)
                    console.log('🔄 Checking if navigation to PhoneAuth is needed...');
                    console.log('🔍 Current screen:', global.currentScreen);
                    
                    if (global.currentScreen === 'OnboardingScreen7') {
                      console.log('🎯 OnboardingScreen7 detected - triggering navigation to PhoneAuth');
                      if (global.onboardingNavigateToPhoneAuth) {
                        console.log('✅ Calling global navigation callback');
                        global.onboardingNavigateToPhoneAuth();
                      } else {
                        console.log('❌ Global navigation callback not found');
                      }
                    } else {
                      console.log('ℹ️ Not on OnboardingScreen7, no navigation needed');
                    }
                    break;
                  case 'transaction_fail':
                  case 'transactionFail':
                    console.log('❌ Purchase failed globally');
                    break;
                }
              },
            };
            console.log('✅ Superwall delegate set up successfully');
          }
        } catch (error) {
          console.warn('⚠️ Superwall initialization failed:', error);
        }
      } else if (config.superwall.apiKey && !Superwall) {
        console.log('ℹ️ Superwall: Package not available (likely simulator), skipping initialization');
      } else {
        console.log('ℹ️ Superwall: No API key configured, skipping initialization');
      }

      this.initialized = true;
      console.log('✅ Purchase services initialization completed');
    } catch (error) {
      console.error('❌ Failed to initialize purchase services:', error);
      this.initialized = true; // Mark as initialized to prevent retries
    }
  }

  async showPaywall(placement: string = 'onboarding_complete'): Promise<void> {
    try {
      if (Superwall && Superwall.shared) {
        // Use the new Superwall v2+ API with object syntax
        await Superwall.shared.register({
          placement: placement,
          params: {} // Add any custom parameters here if needed
        });
      } else {
        console.warn('Superwall not available or shared instance not found - using fallback');
        // For simulator testing, just simulate successful subscription
        return;
      }
      
      // The paywall presentation and result handling is done
      // through Superwall's delegate callbacks
    } catch (error) {
      console.error('Error showing paywall:', error);
      // Don't throw error, just log it for now
      console.warn('Falling back to mock paywall behavior');
    }
  }

  private async showRevenueCatPaywall(): Promise<boolean> {
    try {
      const offerings = await Purchases.getOfferings();
      
      if (!offerings.current) {
        console.log('No current offering available');
        return false;
      }

      // This would typically trigger a custom paywall UI
      // For now, we'll just return the offerings
      console.log('Current offering:', offerings.current);
      return true;
    } catch (error) {
      console.error('Error getting offerings:', error);
      return false;
    }
  }

  async purchasePackage(packageToPurchase: PurchasesPackage): Promise<boolean> {
    try {
      const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
      return this.isSubscriptionActive(customerInfo);
    } catch (error) {
      const purchaseError = error as PurchasesError;
      
      if (purchaseError.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
        console.log('Purchase cancelled by user');
      } else {
        console.error('Purchase error:', purchaseError);
      }
      
      return false;
    }
  }

  async restorePurchases(): Promise<boolean> {
    try {
      const customerInfo = await Purchases.restorePurchases();
      return this.isSubscriptionActive(customerInfo);
    } catch (error) {
      console.error('Restore error:', error);
      return false;
    }
  }

  async checkSubscriptionStatus(): Promise<boolean> {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      return this.isSubscriptionActive(customerInfo);
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return false;
    }
  }

  private isSubscriptionActive(customerInfo: CustomerInfo): boolean {
    // Check if user has any active entitlements
    const entitlements = customerInfo.entitlements.active;
    return Object.keys(entitlements).length > 0;
  }

  private async handleSuccessfulPurchase() {
    // Update user's subscription status in database
    console.log('Purchase successful, updating user status...');
    // This would typically update the user's status in Supabase
  }

  async identifyUser(userId: string) {
    try {
      await Purchases.logIn(userId);
      if (Superwall) {
        await Superwall.identify(userId);
      }
    } catch (error) {
      console.error('Error identifying user:', error);
    }
  }

  async logOut() {
    try {
      await Purchases.logOut();
      if (Superwall) {
        await Superwall.reset();
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }
}

export const purchaseService = new PurchaseService();