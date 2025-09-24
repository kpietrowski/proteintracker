// Load from .env file if it exists (for local development)
// In EAS Build, these will come from EAS environment variables
try {
  require('dotenv/config');
} catch (e) {
  // .env file doesn't exist in EAS Build, which is expected
}

export default {
  expo: {
    name: "ProteinTracker",
    slug: "ProteinTracker",
    version: "1.0.4",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: false,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    plugins: [
      "expo-dev-client",
      "expo-font",
      [
        "expo-build-properties",
        {
          android: {
            minSdkVersion: 26
          },
          ios: {
            deploymentTarget: "15.1"
          }
        }
      ]
    ],
    ios: {
      supportsTablet: false,
      buildNumber: "52",
      infoPlist: {
        NSMicrophoneUsageDescription: "Protein AI uses your microphone to allow voice input for quickly and easily logging your protein intake throughout the day.",
        NSCameraUsageDescription: "Protein AI uses your camera to scan food barcodes and labels, making it faster to log protein-rich foods and track your daily goals.",
        NSUserNotificationsUsageDescription: "Protein AI uses notifications to help you track your protein goals, celebrate milestones, and send helpful reminders throughout your fitness journey.",
        ITSAppUsesNonExemptEncryption: false
      },
      entitlements: {
        "com.apple.developer.in-app-payments": []
      },
      bundleIdentifier: "com.protein.proteintracker"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      permissions: [
        "android.permission.RECORD_AUDIO",
        "android.permission.CAMERA",
        "android.permission.MODIFY_AUDIO_SETTINGS",
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.WRITE_EXTERNAL_STORAGE",
        "android.permission.INTERNET"
      ],
      package: "com.protein.proteintracker"
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      eas: {
        projectId: "871bb8e5-36a8-48de-9d2f-e83e38077226"
      },
      // These will be loaded from .env file via dotenv/config import
      SUPERWALL_API_KEY: process.env.SUPERWALL_API_KEY || "",
      OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
      SUPABASE_URL: process.env.SUPABASE_URL || "",
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || "",
      REVENUECAT_API_KEY_IOS: process.env.REVENUECAT_API_KEY_IOS || "",
      REVENUECAT_API_KEY_ANDROID: process.env.REVENUECAT_API_KEY_ANDROID || "",
      APP_ENV: process.env.APP_ENV || "development"
    },
    owner: "katiepietrowski"
  }
};