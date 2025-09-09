# 🚨 CRITICAL: Complete Onboarding Flow Documentation

## ⚠️ IMPORTANT NOTES FOR FUTURE DEVELOPMENT:
1. **OnboardingScreen7 is NOT the 7th screen - it's the FINAL screen (after 20+ screens)**
2. **Screen numbers DO NOT match their position in the flow**
3. **Always check this documentation before making changes**

## Actual Onboarding Sequence (from OnboardingNavigator.tsx):

### Phase 1: Welcome & Setup (Screens 1-2)
1. **Welcome** → `OnboardingScreenWelcome` - Welcome screen
2. **Goal** → `OnboardingScreenGoal` - Goal introduction

### Phase 2: Basic Demographics (Screens 3-6) 
3. **Gender** → `OnboardingScreen2` - Gender selection
4. **Age** → `OnboardingScreen4` - Age input  
5. **Height** → `OnboardingScreen5` - Height input
6. **TrackingExperience** → `OnboardingScreen8` - Tracking experience

### Phase 3: AI Analysis (Screen 7)
7. **ProteinAIResults** → `OnboardingScreen13` - Protein AI Results

### Phase 4: Goals & Exercise (Screens 8-11)
8. **PrimaryGoal** → `OnboardingScreen1` - Primary fitness goal
9. **ExerciseType** → `OnboardingScreen10` - Exercise type selection
10. **Weight** → `OnboardingScreen6` - Weight input
11. **ExerciseFrequency** → `OnboardingScreen9` - Exercise frequency

### Phase 5: Progress & Motivation (Screens 12-19)
12. **ProteinAIComparison** → `OnboardingScreen14` - Make gains 2X faster
13. **DesiredWeight** → `OnboardingScreen15` - Desired weight
14. **ProteinProgressConcern** → `OnboardingScreen16` - Protein progress concern
15. **ReadyForGoal** → `OnboardingScreen17` - Ready for goal
16. **PotentialToCrush** → `OnboardingScreen18` - Potential to crush goal
17. **GiveUsRating** → `OnboardingScreen19` - Give us rating
18. **NotificationPermission** → `OnboardingScreen20` - Notification permission

### Phase 6: Final Calculation (Screens 19-20)
19. **DreamOutcome** → `OnboardingScreen11` - Dream outcome
20. **Final** → `OnboardingScreen7` - **PROTEIN CALCULATION & PAYWALL** ⚠️

## Data Flow Requirements:

### Data Collected BY OnboardingScreen7 (Final):
- All demographic data (age, gender, height, weight)
- Fitness goals and exercise habits
- All motivation/psychology data
- Dream outcome

### What OnboardingScreen7 Must Do:
1. **Calculate protein needs** based on ALL collected data
2. **Display results** with complete user profile
3. **Trigger Superwall paywall**
4. **Save complete profile to local storage**
5. **Navigate to MainApp** after paywall/completion

## 🚨 Critical Development Rules:

### Rule 1: Screen Name vs Position
```
WRONG: "OnboardingScreen7 is the 7th screen"
RIGHT: "OnboardingScreen7 is the FINAL screen (position 20)"
```

### Rule 2: Data Dependencies
```
OnboardingScreen7 DEPENDS ON:
- OnboardingScreen2 (gender)
- OnboardingScreen4 (age) 
- OnboardingScreen5 (height)
- OnboardingScreen6 (weight)
- OnboardingScreen1 (primary goal)
- OnboardingScreen9 (exercise frequency)
- OnboardingScreen10 (exercise type)
- OnboardingScreen11 (dream outcome)
- ALL other motivation screens
```

### Rule 3: Navigation Flow
```
OnboardingScreen20 → navigate('Final') → OnboardingScreen7
OnboardingScreen11 → navigate('Final') → OnboardingScreen7
OnboardingScreen7 → Superwall → MainApp
```

## Common Issues to Avoid:

1. **❌ Assuming screen number = position in flow**
2. **❌ Missing data validation in final screen**  
3. **❌ Hardcoded navigation to wrong screens**
4. **❌ Protein calculation with incomplete data**
5. **❌ Not handling missing data gracefully**

## Testing Checklist:

- [ ] All 20 screens load in correct order
- [ ] Data persists between screens
- [ ] Final calculation uses ALL collected data  
- [ ] Paywall triggers correctly
- [ ] Local storage saves complete profile
- [ ] Navigation to MainApp works
- [ ] Error handling for missing data

## Recent Fixes Applied (2025-08-29):

### ✅ Fixed OnboardingScreen7 Issues:
1. **Added comprehensive protein calculation** using ALL 20 screens of data
2. **Added Superwall null checks** to prevent "undefined is not a function" errors
3. **Added data validation** with detailed logging for missing fields
4. **Added clear documentation** at top of OnboardingScreen7.tsx file
5. **Improved error handling** for missing or incomplete onboarding data

### ✅ Enhanced Protein Calculation Algorithm:
- **Base multiplier** adjusted for fitness goals (muscle building vs weight loss vs maintenance)
- **Exercise frequency** multiplier (daily/high activity = more protein)
- **Exercise type** multiplier (strength training = more protein) 
- **Age adjustment** (50+ = more protein for muscle maintenance)
- **Sex adjustment** (males = slightly more protein)
- **Bounds checking** (minimum 80g, maximum 250g)
- **Detailed logging** of calculation breakdown

### ✅ Error Prevention:
- Null checks on all Superwall.shared calls
- Data validation for required fields
- Graceful fallbacks for missing data
- Clear console logging for debugging

## Last Updated: 2025-08-29 (Major fixes applied)
## Next Review: Before any onboarding changes

---

## 🚨 CRITICAL REMINDERS:
- OnboardingScreen7 = FINAL SCREEN (position #20)
- Screen names ≠ Screen positions in flow
- Always validate data completeness
- Always check Superwall initialization
- Always review this documentation before changes