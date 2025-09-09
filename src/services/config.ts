import Constants from 'expo-constants';

/**
 * ⚠️ SECURITY WARNING: NEVER HARDCODE API KEYS IN THIS FILE
 * See /SECURITY_GUIDELINES.md for proper API key management
 * All API keys must come from environment variables only
 */
interface Config {
  openAI: {
    apiKey: string;
  };
  supabase: {
    url: string;
    anonKey: string;
  };
  revenueCat: {
    apiKeyIOS: string;
    apiKeyAndroid: string;
  };
  superwall: {
    apiKey: string;
  };
  environment: 'development' | 'staging' | 'production';
}

const getConfig = (): Config => {
  try {
    // Get extra from expo config - this is where app.config.js puts env vars
    const extra = Constants.expoConfig?.extra || Constants.manifest?.extra || {};
    
    // Simple direct access - app.config.js already loaded from .env
    const getEnvVar = (key: string, defaultValue: string = '') => {
      const value = extra[key] || defaultValue;
      
      // Debug logging for API keys
      if (key === 'SUPERWALL_API_KEY' && value) {
        console.log(`✅ Superwall API key loaded: ${value.substring(0, 10)}...`);
      }
      if (key === 'OPENAI_API_KEY') {
        if (value) {
          console.log(`✅ OpenAI API key loaded: ${value.substring(0, 10)}...`);
        } else {
          console.log(`❌ OpenAI API key NOT loaded - voice features will not work`);
        }
      }
      
      return value;
    };
    
    return {
      openAI: {
        apiKey: getEnvVar('OPENAI_API_KEY'),
      },
      supabase: {
        url: getEnvVar('SUPABASE_URL'),
        anonKey: getEnvVar('SUPABASE_ANON_KEY'),
      },
      revenueCat: {
        apiKeyIOS: getEnvVar('REVENUECAT_API_KEY_IOS'),
        apiKeyAndroid: getEnvVar('REVENUECAT_API_KEY_ANDROID'),
      },
      superwall: {
        apiKey: getEnvVar('SUPERWALL_API_KEY'),
      },
      environment: (getEnvVar('APP_ENV', 'development')) as Config['environment'],
    };
  } catch (error) {
    console.error('Config initialization error:', error);
    // Return safe defaults if config loading fails
    return {
      openAI: { apiKey: '' },
      supabase: { url: '', anonKey: '' },
      revenueCat: { apiKeyIOS: '', apiKeyAndroid: '' },
      superwall: { apiKey: '' },
      environment: 'development',
    };
  }
};

export const config = getConfig();