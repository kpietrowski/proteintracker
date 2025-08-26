import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface OnboardingData {
  // Primary goal (Screen 1)
  fitnessGoal: string;
  
  // Psychology screens (Screens 2-4)
  currentTrackingMethod?: string;
  nutritionChallenges?: string[];
  goalImportance?: number;
  
  // Basic user data for protein goal calculation (Screens 5-8)
  age: number;
  
  // Height
  heightUnit: 'ft' | 'cm';
  heightFt?: number;
  heightIn?: number;
  heightCm?: number;
  
  // Weight  
  weightUnit: 'lbs' | 'kg';
  weightLbs?: number;
  weightKg?: number;
  
  // Biological sex
  sex: string;
  
  // Activity and exercise (Screens 9-10)
  exerciseFrequency?: string;
  exerciseType?: string;
  activityLevel: string; // Keep for backward compatibility
  
  // Dream outcome (Screen 11)
  dreamOutcome?: string;
  
  // Final setup (Screens 12-13)
  proteinGoal: number;
  userAdjustment?: number;
  finalGoal?: number;
  notificationsEnabled?: boolean;
  reminderTime?: string;
  preferredUnits: 'grams' | 'ounces';
  completedAt: Date;
}

interface OnboardingState {
  data: Partial<OnboardingData>;
  isComplete: boolean;
}

type OnboardingAction =
  | { type: 'SET_FITNESS_GOAL'; payload: string }
  | { type: 'SET_CURRENT_TRACKING_METHOD'; payload: string }
  | { type: 'SET_NUTRITION_CHALLENGES'; payload: string[] }
  | { type: 'SET_GOAL_IMPORTANCE'; payload: number }
  | { type: 'SET_AGE'; payload: number }
  | { type: 'SET_HEIGHT'; payload: { unit: 'ft' | 'cm'; ft?: number; in?: number; cm?: number } }
  | { type: 'SET_WEIGHT'; payload: { unit: 'lbs' | 'kg'; lbs?: number; kg?: number } }
  | { type: 'SET_SEX'; payload: string }
  | { type: 'SET_EXERCISE_FREQUENCY'; payload: string }
  | { type: 'SET_EXERCISE_TYPE'; payload: string }
  | { type: 'SET_ACTIVITY_LEVEL'; payload: string }
  | { type: 'SET_DREAM_OUTCOME'; payload: string }
  | { type: 'SET_PROTEIN_GOALS'; payload: { goal: number; units: 'grams' | 'ounces' } }
  | { type: 'LOAD_DATA'; payload: Partial<OnboardingData> }
  | { type: 'CLEAR_DATA' };

const initialState: OnboardingState = {
  data: {},
  isComplete: false,
};

const STORAGE_KEY = 'onboarding_data';

function onboardingReducer(state: OnboardingState, action: OnboardingAction): OnboardingState {
  switch (action.type) {
    case 'SET_FITNESS_GOAL':
      return {
        ...state,
        data: { ...state.data, fitnessGoal: action.payload },
      };
    case 'SET_CURRENT_TRACKING_METHOD':
      return {
        ...state,
        data: { ...state.data, currentTrackingMethod: action.payload },
      };
    case 'SET_NUTRITION_CHALLENGES':
      return {
        ...state,
        data: { ...state.data, nutritionChallenges: action.payload },
      };
    case 'SET_GOAL_IMPORTANCE':
      return {
        ...state,
        data: { ...state.data, goalImportance: action.payload },
      };
    case 'SET_AGE':
      return {
        ...state,
        data: { ...state.data, age: action.payload },
      };
    case 'SET_HEIGHT':
      return {
        ...state,
        data: {
          ...state.data,
          heightUnit: action.payload.unit,
          heightFt: action.payload.ft,
          heightIn: action.payload.in,
          heightCm: action.payload.cm,
        },
      };
    case 'SET_WEIGHT':
      return {
        ...state,
        data: {
          ...state.data,
          weightUnit: action.payload.unit,
          weightLbs: action.payload.lbs,
          weightKg: action.payload.kg,
        },
      };
    case 'SET_SEX':
      return {
        ...state,
        data: { ...state.data, sex: action.payload },
      };
    case 'SET_EXERCISE_FREQUENCY':
      return {
        ...state,
        data: { ...state.data, exerciseFrequency: action.payload },
      };
    case 'SET_EXERCISE_TYPE':
      return {
        ...state,
        data: { ...state.data, exerciseType: action.payload },
      };
    case 'SET_ACTIVITY_LEVEL':
      return {
        ...state,
        data: { ...state.data, activityLevel: action.payload },
      };
    case 'SET_DREAM_OUTCOME':
      return {
        ...state,
        data: { ...state.data, dreamOutcome: action.payload },
      };
    case 'SET_PROTEIN_GOALS':
      return {
        ...state,
        data: {
          ...state.data,
          proteinGoal: action.payload.goal,
          preferredUnits: action.payload.units,
          completedAt: new Date(),
        },
        isComplete: true,
      };
    case 'LOAD_DATA':
      return {
        ...state,
        data: action.payload,
        isComplete: isOnboardingComplete(action.payload),
      };
    case 'CLEAR_DATA':
      return initialState;
    default:
      return state;
  }
}

function isOnboardingComplete(data: Partial<OnboardingData>): boolean {
  return !!(
    data.sex &&
    data.age &&
    ((data.heightUnit === 'ft' && data.heightFt && data.heightIn !== undefined) ||
     (data.heightUnit === 'cm' && data.heightCm)) &&
    ((data.weightUnit === 'lbs' && data.weightLbs) ||
     (data.weightUnit === 'kg' && data.weightKg)) &&
    data.activityLevel &&
    data.fitnessGoal &&
    data.proteinGoal &&
    data.preferredUnits
  );
}

interface OnboardingContextType {
  state: OnboardingState;
  // Screen 1
  setFitnessGoal: (goal: string) => void;
  // Screens 2-4 (Psychology)
  setCurrentTrackingMethod: (method: string) => void;
  setNutritionChallenges: (challenges: string[]) => void;
  setGoalImportance: (importance: number) => void;
  // Screens 5-8 (Basic data)
  setAge: (age: number) => void;
  setHeight: (unit: 'ft' | 'cm', ft?: number, inches?: number, cm?: number) => void;
  setWeight: (unit: 'lbs' | 'kg', lbs?: number, kg?: number) => void;
  setSex: (sex: string) => void;
  // Screens 9-10 (Activity)
  setExerciseFrequency: (frequency: string) => void;
  setExerciseType: (type: string) => void;
  setActivityLevel: (level: string) => void; // Keep for backward compatibility
  // Screen 11
  setDreamOutcome: (outcome: string) => void;
  // Screen 12-13
  setProteinGoals: (goal: number, units: 'grams' | 'ounces') => void;
  // Utility
  clearData: () => void;
  saveToStorage: () => Promise<void>;
  loadFromStorage: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(onboardingReducer, initialState);

  useEffect(() => {
    loadFromStorage();
  }, []);

  useEffect(() => {
    // Auto-save to storage whenever data changes
    if (Object.keys(state.data).length > 0) {
      saveToStorage();
    }
  }, [state.data]);

  const setSex = (sex: string) => {
    dispatch({ type: 'SET_SEX', payload: sex });
  };

  const setAge = (age: number) => {
    dispatch({ type: 'SET_AGE', payload: age });
  };

  const setHeight = (unit: 'ft' | 'cm', ft?: number, inches?: number, cm?: number) => {
    dispatch({
      type: 'SET_HEIGHT',
      payload: { unit, ft, in: inches, cm },
    });
  };

  const setWeight = (unit: 'lbs' | 'kg', lbs?: number, kg?: number) => {
    dispatch({
      type: 'SET_WEIGHT',
      payload: { unit, lbs, kg },
    });
  };

  const setActivityLevel = (level: string) => {
    dispatch({ type: 'SET_ACTIVITY_LEVEL', payload: level });
  };

  const setFitnessGoal = (goal: string) => {
    dispatch({ type: 'SET_FITNESS_GOAL', payload: goal });
  };

  const setCurrentTrackingMethod = (method: string) => {
    dispatch({ type: 'SET_CURRENT_TRACKING_METHOD', payload: method });
  };

  const setNutritionChallenges = (challenges: string[]) => {
    dispatch({ type: 'SET_NUTRITION_CHALLENGES', payload: challenges });
  };

  const setGoalImportance = (importance: number) => {
    dispatch({ type: 'SET_GOAL_IMPORTANCE', payload: importance });
  };

  const setExerciseFrequency = (frequency: string) => {
    dispatch({ type: 'SET_EXERCISE_FREQUENCY', payload: frequency });
  };

  const setExerciseType = (type: string) => {
    dispatch({ type: 'SET_EXERCISE_TYPE', payload: type });
  };

  const setDreamOutcome = (outcome: string) => {
    dispatch({ type: 'SET_DREAM_OUTCOME', payload: outcome });
  };

  const setProteinGoals = (goal: number, units: 'grams' | 'ounces') => {
    dispatch({ type: 'SET_PROTEIN_GOALS', payload: { goal, units } });
  };

  const clearData = () => {
    dispatch({ type: 'CLEAR_DATA' });
    AsyncStorage.removeItem(STORAGE_KEY);
  };

  const saveToStorage = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state.data));
    } catch (error) {
      console.error('Failed to save onboarding data:', error);
    }
  };

  const loadFromStorage = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        dispatch({ type: 'LOAD_DATA', payload: data });
      }
    } catch (error) {
      console.error('Failed to load onboarding data:', error);
    }
  };

  const value: OnboardingContextType = {
    state,
    // Screen 1
    setFitnessGoal,
    // Screens 2-4 (Psychology)
    setCurrentTrackingMethod,
    setNutritionChallenges,
    setGoalImportance,
    // Screens 5-8 (Basic data)
    setAge,
    setHeight,
    setWeight,
    setSex,
    // Screens 9-10 (Activity)
    setExerciseFrequency,
    setExerciseType,
    setActivityLevel,
    // Screen 11
    setDreamOutcome,
    // Screen 12-13
    setProteinGoals,
    // Utility
    clearData,
    saveToStorage,
    loadFromStorage,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}