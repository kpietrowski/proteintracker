import Purchases, { 
  PurchasesOffering,
  PurchasesPackage,
  CustomerInfo,
  PurchasesError,
  PURCHASES_ERROR_CODE
} from 'react-native-purchases';
import { Platform } from 'react-native';
import { config } from './config';

// Note: Superwall is now initialized via expo-superwall in App.tsx with SuperwallProvider

class PurchaseService {
  private initialized = false;
  private paywallDismissCallback: ((event: any) => void) | null = null;
  
  // Helper to get timestamp
  private getTimestamp = () => new Date().toISOString().split('T')[1].slice(0, 12);

  async initialize() {
    if (this.initialized) return;

    console.log('Initializing purchase services...');
    
    // Debug environment variables
    console.log('🔍 DEBUG: Environment variables check:');
    console.log('🔍 DEBUG: Superwall API key exists:', !!config.superwall.apiKey);
    console.log('🔍 DEBUG: Superwall API key preview:', config.superwall.apiKey ? config.superwall.apiKey.substring(0, 10) + '...' : 'NONE');
    console.log('🔍 DEBUG: RevenueCat iOS key exists:', !!config.revenueCat.apiKeyIOS);
    console.log('🔍 DEBUG: RevenueCat iOS key preview:', config.revenueCat.apiKeyIOS ? config.revenueCat.apiKeyIOS.substring(0, 10) + '...' : 'NONE');
    console.log('🔍 DEBUG: Full RevenueCat iOS key for debugging:', config.revenueCat.apiKeyIOS);

    try {
      // Initialize RevenueCat
      const apiKey = Platform.OS === 'ios' 
        ? config.revenueCat.apiKeyIOS 
        : config.revenueCat.apiKeyAndroid;
      
      // Only initialize if we have public keys (start with appl_ or goog_)
      if (apiKey && (apiKey.startsWith('appl_') || apiKey.startsWith('goog_'))) {
        try {
          // Configure RevenueCat with sandbox support for development/TestFlight
          const isDevelopment = config.environment === 'development' || config.environment === 'staging';
          
          Purchases.configure({ 
            apiKey,
            usesStoreKit2IfAvailable: true, // Enable StoreKit 2 for better sandbox support
            shouldShowInAppMessagesAutomatically: false, // Prevent automatic paywall interference
          });
          
          console.log('✅ RevenueCat initialized successfully');
          console.log('🏪 Environment:', config.environment);
          console.log('📱 Sandbox mode:', isDevelopment ? 'ENABLED (automatic in dev/TestFlight)' : 'DISABLED (production)');
          
          // Add sandbox-specific logging
          if (isDevelopment) {
            console.log('🧪 SANDBOX: Ready for sandbox purchase testing');
            console.log('🧪 SANDBOX: Use sandbox test users from App Store Connect');
          }
          
        } catch (error) {
          console.warn('⚠️ RevenueCat initialization failed:', error);
        }
      } else if (apiKey) {
        console.warn('⚠️ RevenueCat key appears to be a secret key (starts with sk_). Please use public key (appl_ or goog_)');
      } else {
        console.log('ℹ️ RevenueCat: No API key configured, skipping initialization');
      }

      // Superwall is now initialized via expo-superwall in App.tsx with SuperwallProvider
      // The new SDK handles all delegate callbacks automatically in PaywallScreen.tsx

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
      console.log('💳 Starting purchase for package:', packageToPurchase.identifier);
      
      // Enhanced sandbox logging
      if (config.environment === 'development' || config.environment === 'staging') {
        console.log('🧪 SANDBOX: Attempting sandbox purchase');
        console.log('🧪 SANDBOX: Package details:', {
          identifier: packageToPurchase.identifier,
          price: packageToPurchase.product.priceString,
          title: packageToPurchase.product.title,
        });
      }
      
      const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
      const isActive = this.isSubscriptionActive(customerInfo);
      
      console.log('✅ Purchase completed successfully, subscription active:', isActive);
      
      return isActive;
    } catch (error) {
      const purchaseError = error as PurchasesError;
      
      if (purchaseError.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
        console.log('👋 Purchase cancelled by user');
      } else {
        console.error('❌ Purchase error:', purchaseError);
        
        // Enhanced sandbox error debugging
        if (config.environment === 'development' || config.environment === 'staging') {
          console.log('🧪 SANDBOX: Purchase failed with error:', {
            code: purchaseError.code,
            message: purchaseError.message,
            underlyingError: purchaseError.underlyingErrorMessage,
          });
          
          // Common sandbox error guidance
          if (purchaseError.message?.includes('sandbox')) {
            console.log('🧪 SANDBOX: Sandbox-specific error detected');
          } else if (purchaseError.message?.includes('not available')) {
            console.log('🧪 SANDBOX: Product not available - check RevenueCat configuration');
          } else if (purchaseError.message?.includes('user not allowed')) {
            console.log('🧪 SANDBOX: Check sandbox test user is signed in to App Store');
          }
        }
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
      const isActive = this.isSubscriptionActive(customerInfo);
      
      // Enhanced sandbox logging
      if (config.environment === 'development' || config.environment === 'staging') {
        console.log('🧪 SANDBOX: Customer info check result:', {
          isActive,
          entitlements: Object.keys(customerInfo.entitlements.active),
          allEntitlements: Object.keys(customerInfo.entitlements.all),
          originalAppUserId: customerInfo.originalAppUserId,
        });
      }
      
      return isActive;
    } catch (error) {
      console.error('❌ Error checking subscription status:', error);
      
      // Enhanced sandbox error logging
      if (config.environment === 'development' || config.environment === 'staging') {
        console.log('🧪 SANDBOX: Subscription check failed - this is normal if no sandbox user is signed in');
        console.log('🧪 SANDBOX: To test purchases:');
        console.log('🧪 SANDBOX: 1. Sign out of App Store in iOS Settings');
        console.log('🧪 SANDBOX: 2. Use sandbox test user account when prompted');
      }
      
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

  // Paywall dismiss callback management
  // Removed paywall dismiss callback system - now handled directly in delegate
}

export const purchaseService = new PurchaseService();