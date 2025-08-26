import Constants from 'expo-constants';

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
  const extra = Constants.expoConfig?.extra || {};
  
  return {
    openAI: {
      apiKey: extra.OPENAI_API_KEY || process.env.OPENAI_API_KEY || '',
    },
    supabase: {
      url: extra.SUPABASE_URL || process.env.SUPABASE_URL || '',
      anonKey: extra.SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '',
    },
    revenueCat: {
      apiKeyIOS: extra.REVENUECAT_API_KEY_IOS || process.env.REVENUECAT_API_KEY_IOS || '',
      apiKeyAndroid: extra.REVENUECAT_API_KEY_ANDROID || process.env.REVENUECAT_API_KEY_ANDROID || '',
    },
    superwall: {
      apiKey: extra.SUPERWALL_API_KEY || process.env.SUPERWALL_API_KEY || '',
    },
    environment: (extra.APP_ENV || process.env.APP_ENV || 'development') as Config['environment'],
  };
};

export const config = getConfig();