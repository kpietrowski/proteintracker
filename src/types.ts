export type OnboardingStackParamList = {
  // Welcome flow
  Welcome: undefined;
  Goal: undefined;
  
  // User info screens
  Gender: undefined;
  Age: undefined;
  Height: undefined;
  Weight: undefined;
  
  // Activity screens
  ExerciseFrequency: undefined;
  ExerciseType: undefined;
  ActivityLevel: undefined; // Legacy compatibility
  
  // Goal screens
  PrimaryGoal: undefined;
  DesiredWeight: undefined;
  DreamOutcome: undefined;
  
  // AI/Tracking screens
  TrackingExperience: undefined;
  ProteinAIResults: undefined;
  ProteinAIComparison: undefined;
  
  // Motivation screens
  ProteinProgressConcern: undefined;
  ReadyForGoal: undefined;
  PotentialToCrush: undefined;
  
  // Final screens
  PersonalizedProteinTarget: undefined;
  GiveUsRating: undefined;
  NotificationPermission: undefined;
  Loading: undefined;
  Final: undefined;
  
  // Auth/Paywall
  Paywall: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Calendar: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
};