# Protein Tracker App - Onboarding Documentation

## Overview
This document defines the exact onboarding flow, questions, and logic for the Protein Tracker React Native app. Use this as the authoritative reference for implementing all onboarding screens and user flows.

## Onboarding Goals
- Collect accurate data to calculate personalized daily protein recommendations
- Create a smooth, non-overwhelming user experience
- Build trust through transparency in calculations
- Set users up for success with realistic, evidence-based goals

## Complete Onboarding Flow

### Screen 1: Welcome & Primary Goal
**Screen ID:** `onboarding-goal`
**Question:** "What's your main goal with protein tracking?"

**Options:**
- 🏋️ **Build muscle & strength**
- ⚖️ **Lose weight (preserve muscle)**  
- 🏃 **Improve athletic performance**
- 💪 **General health & wellness**
- 🩺 **Medical recommendation**

**Data captured:** `primary_goal: string`
**Next screen:** Screen 2

---

### Screen 2: Current Tracking Method (New - Psychology)
**Screen ID:** `onboarding-current-tracking`
**Question:** "How do you usually track your progress?"

**Options:**
- 📝 **Pen and paper** (gets tedious)
- 📱 **Notes app on my phone** (disorganized)
- 🤳 **Progress photos** (but I lose track)
- 🧠 **Just try to remember** (often forget)
- 📊 **Fitness apps** (but they're confusing)
- ❌ **I don't track consistently** (that's the problem!)

**Data captured:** `current_tracking_method: string`
**Psychology:** Highlights pain points with current solutions, primes for "better way"
**Next screen:** Screen 3

---

### Screen 3: Nutrition Challenges (New - Psychology)
**Screen ID:** `onboarding-nutrition-challenges`
**Question:** "What's your biggest challenge with nutrition?" 
**Selection:** Multi-select allowed

**Options:**
- 😤 **I never know if I'm eating enough protein**
- 📱 **I forget to track my meals consistently**
- 🤔 **I'm confused about which foods have protein**
- ⏰ **I don't have time to plan protein-rich meals**
- 💸 **Healthy high-protein food is expensive**
- 🏠 **I eat out too much and can't control ingredients**
- 📊 **I track for a few days then give up**

**Data captured:** `nutrition_challenges: string[]`
**Psychology:** Pain point amplification - makes them aware of problems premium solves
**Next screen:** Screen 4

---

### Screen 4: Goal Importance (New - Psychology)
**Screen ID:** `onboarding-goal-importance`
**Question:** "How important is reaching your fitness goal?"

**Interface:** Slider from 1 to 10
- **1:** Nice to have
- **5:** Moderately important
- **10:** Life-changing priority

**Data captured:** `goal_importance: number`
**Psychology:** Higher importance = higher willingness to pay
**Next screen:** Screen 5

---

### Screen 5: Age
**Screen ID:** `onboarding-age`
**Question:** "How old are you?"

**Fields:**
- **Age:** Number input, placeholder: "25"
  - Validation: 13-120 years
  - Required: Yes

**Data captured:** `age: number`
**Next screen:** Screen 6

---

### Screen 6: Height
**Screen ID:** `onboarding-height`
**Question:** "What's your height?"

**Fields:**
- **Height:** 
  - Imperial: Feet (dropdown 3-8) + Inches (dropdown 0-11)
  - Metric: CM (number input 100-250)

**Data captured:** `height: object`
**Next screen:** Screen 7

---

### Screen 7: Weight
**Screen ID:** `onboarding-weight`
**Question:** "What's your current weight?"

**Fields:**
- **Weight:**
  - Imperial: lbs (number input 50-500)
  - Metric: kg (number input 25-250)

**Data captured:** `weight: object`
**Next screen:** Screen 8

---

### Screen 8: Biological Sex
**Screen ID:** `onboarding-sex`
**Question:** "Biological sex (for protein calculation accuracy)"

**Options:**
- Male
- Female  
- Prefer not to say

**Data captured:** `sex: string`
**Next screen:** Screen 9

---

### Screen 9: Exercise Frequency
**Screen ID:** `onboarding-frequency`
**Question:** "How often do you exercise?"

**Options:**
- 🛋️ **I don't exercise regularly**
- 🚶 **1-2 times per week**
- 🏃 **3-4 times per week**
- 💪 **5-6 times per week**
- 🏆 **Daily (7+ times per week)**

**Data captured:** `exercise_frequency: string`
**Logic:** 
- If "I don't exercise regularly" → Skip to Screen 11 (Dream Outcome)
- All other options → Continue to Screen 10

---

### Screen 10: Exercise Type
**Screen ID:** `onboarding-exercise-type`
**Question:** "What type of exercise do you do most?"
**Show only if:** User exercises (from Screen 9)

**Options:**
- 🏋️ **Strength training / Weightlifting**
- 🏃 **Cardio (running, cycling, swimming)**
- ⚽ **Sports (basketball, soccer, tennis, etc.)**
- 🤸 **Yoga / Pilates / Stretching**
- 🔥 **High-intensity workouts (CrossFit, HIIT)**
- 🚶 **Walking / Light activity**
- 🤹 **Mixed - I do different types**

**Data captured:** `exercise_type: string`
**Next screen:** Screen 11

---

### Screen 11: Dream Outcome (New - Psychology)
**Screen ID:** `onboarding-dream-outcome`
**Question:** "What's your dream outcome in 6 months?"

**Options:**
- 💪 **Visible muscle definition**
- ⚖️ **Hit my target weight while staying strong**
- 🏃 **Crush my fitness PRs**
- 😊 **Feel confident and energetic daily**
- 👗 **Fit into my favorite clothes again**
- 🏆 **Complete a fitness challenge/competition**

**Data captured:** `dream_outcome: string`
**Psychology:** Vivid future visualization increases motivation to invest
**Next screen:** Screen 12

---

### Screen 12: Goal Calculation & Confirmation
**Screen ID:** `onboarding-confirmation`
**Title:** "Your personalized protein goal"

**Content:**
```
Based on your answers, we recommend:
[X] GRAMS OF PROTEIN PER DAY

This equals about:
• [X] chicken breasts (6oz each)
• [X] protein shakes (25g each)  
• [X] eggs + [X] Greek yogurt cups
```

**Question:** "Does this goal feel right to you?"

**Options:**
- ✅ **Perfect, let's use this goal**
- ⬆️ **Seems too low, I want to aim higher**
- ⬇️ **Seems too high, I want to start lower**
- ✏️ **Let me set a custom amount**

**Logic:**
- Perfect → Continue to Screen 9
- Too low/high → Show adjustment slider (±25g range)
- Custom → Show number input field

**Data captured:** `calculated_goal: number, user_adjustment: number, final_goal: number`
**Next screen:** Screen 13

---

### Screen 13: Final Setup
**Screen ID:** `onboarding-final`
**Title:** "Let's finish setting up your profile"

**Fields:**
- **Daily protein goal:** [Editable number] grams
- **Enable notifications:** Toggle switch
- **Reminder time:** Time picker (only if notifications enabled)
- **Preferred units:** Grams / Ounces

**Action:** Large "Get Started" button

**Data captured:** `notifications_enabled: boolean, reminder_time: string, preferred_units: string`
**Next action:** Navigate to main app (Dashboard)

---

## Protein Calculation Algorithm

### Base Protein Needs (grams per kg body weight)
```typescript
const baseProtein = {
  sedentary: 0.8,
  lightActivity: 1.0,     // 1-2x per week
  moderateActivity: 1.4,  // 3-4x per week  
  highActivity: 1.8,      // 5-6x per week
  veryHighActivity: 2.2   // Daily
}
```

### Goal Multipliers
```typescript
const goalMultipliers = {
  'Build muscle & strength': 1.3,
  'Lose weight (preserve muscle)': 1.4,
  'Improve athletic performance': 1.2,
  'General health & wellness': 1.0,
  'Medical recommendation': 1.0
}
```

### Exercise Type Adjustments
```typescript
const exerciseAdjustments = {
  'Strength training / Weightlifting': +0.3,
  'High-intensity workouts (CrossFit, HIIT)': +0.2,
  'Sports (basketball, soccer, tennis, etc.)': +0.2,
  'Cardio (running, cycling, swimming)': +0.1,
  'Mixed - I do different types': +0.2,
  'Yoga / Pilates / Stretching': 0,
  'Walking / Light activity': 0
}
```

### Final Calculation
```typescript
function calculateProteinGoal(userData) {
  const weightInKg = convertToKg(userData.weight);
  const baseMultiplier = getBaseMultiplier(userData.exercise_frequency);
  const goalMultiplier = goalMultipliers[userData.primary_goal];
  const exerciseAdjustment = exerciseAdjustments[userData.exercise_type] || 0;
  
  let protein = weightInKg * (baseMultiplier + exerciseAdjustment) * goalMultiplier;
  
  // Round to nearest 5g
  return Math.round(protein / 5) * 5;
}
```

## UI/UX Guidelines

### Screen Transitions
- Use smooth slide transitions between screens
- Show progress indicator (e.g., "Step 3 of 9")
- Always include "Back" button (except on Screen 1)

### Validation Rules
- Don't allow progression until required fields completed
- Show inline validation errors
- Use helpful placeholder text

### Visual Design
- Use emojis to make options more engaging
- Keep text scannable with bullet points
- Highlight the calculated protein goal prominently
- Show calculation transparency to build trust

### Error Handling
- Graceful handling of edge cases (very high/low weights)
- Clear error messages
- Option to skip problematic questions with defaults

### Accessibility
- Proper labels for screen readers
- High contrast colors
- Large touch targets (minimum 44px)
- Support for dynamic text sizing

## Data Storage Schema

```typescript
interface OnboardingData {
  primary_goal: string;
  current_tracking_method: string;  // New
  nutrition_challenges: string[];   // New
  goal_importance: number;          // New
  age: number;
  height: { feet: number; inches: number; } | { cm: number; };
  weight: { lbs: number; } | { kg: number; };
  sex: 'male' | 'female' | 'prefer_not_to_say';
  exercise_frequency: string;
  exercise_type?: string;
  dream_outcome: string;           // New
  calculated_goal: number;
  user_adjustment: number;
  final_goal: number;
  notifications_enabled: boolean;
  reminder_time?: string;
  preferred_units: 'grams' | 'ounces';
  completed_at: Date;
}
```

## Testing Scenarios

### Happy Path
- Active user with strength training → Should get ~1.6-2.0g/kg recommendation
- Sedentary user for general health → Should get ~0.8-1.0g/kg recommendation

### Edge Cases
- Very young user (13 years) → Apply appropriate minimums
- Very heavy user (300+ lbs) → Ensure reasonable maximums
- User with kidney condition → Show medical disclaimer

### Skip Patterns
- Non-exercising user should skip exercise type/intensity
- User with no restrictions should skip follow-ups

---

*This document should be referenced for all onboarding-related development. Update this file when making changes to the onboarding flow.*