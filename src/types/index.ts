// User & Auth Types
export interface User {
  id: string;
  email: string;
  name: string;
  dailyProteinGoal: number;
  createdAt: Date;
  updatedAt: Date;
  subscriptionStatus: 'active' | 'expired' | 'trial' | 'none';
  onboardingCompleted: boolean;
}

// Protein Entry Types
export interface ProteinEntry {
  id: string;
  userId: string;
  date: Date;
  amount: number;
  description?: string;
  source: 'voice' | 'manual';
  createdAt: Date;
}

// Daily Summary Types
export interface DailySummary {
  date: Date;
  totalProtein: number;
  goalProtein: number;
  entries: ProteinEntry[];
  percentageComplete: number;
  remainingProtein: number;
}

// Weekly Progress Types
export interface WeeklyProgress {
  weekDays: DayProgress[];
  goalsHit: number;
  totalProtein: number;
  averageProtein: number;
}

export interface DayProgress {
  date: Date;
  dayName: 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';
  proteinAmount: number;
  goalAmount: number;
  goalMet: boolean;
  isToday: boolean;
  isFuture: boolean;
}

// Calendar Types
export interface MonthlyCalendarData {
  month: string;
  year: number;
  days: CalendarDay[];
  stats: MonthlyStats;
}

export interface CalendarDay {
  date: number;
  fullDate: Date;
  proteinAmount?: number;
  goalAmount?: number;
  status: 'goal_met' | 'below_goal' | 'no_data';
  isSelected?: boolean;
  isCurrentMonth: boolean;
  isToday: boolean;
}

export interface MonthlyStats {
  successRate: number;
  goalsCrushed: number;
  dailyAverage: number;
  totalProtein: number;
  daysWithData: number;
  daysGoalMet: number;
  daysBelowGoal: number;
}

// Profile Stats Types
export interface ProfileStats {
  thisWeek: {
    goalsHit: number;
    totalProtein: number;
  };
}

// Voice Input Types
export interface VoiceInputResult {
  transcript: string;
  proteinAmount?: number;
  foodItem?: string;
  confidence: number;
}

// Navigation Types
export type RootStackParamList = {
  Onboarding: undefined;
  Paywall: undefined;
  MainApp: undefined;
  VoiceInput: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Calendar: undefined;
  Profile: undefined;
};

export type OnboardingStackParamList = {
  Welcome: undefined;
  Gender: undefined;
  Age: undefined;
  Height: undefined;
  Weight: undefined;
  ActivityLevel: undefined;
  Final: undefined;
  Paywall: undefined;
  PhoneAuth: undefined;
  CodeVerification: { phoneNumber: string };
};