import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../services/supabase';
import { useOnboarding } from '../../context/OnboardingContext';

export default function CodeVerificationScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { phoneNumber } = (route.params as any) || {};
  const { state, clearData } = useOnboarding();
  
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  
  const inputRefs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];

  useEffect(() => {
    // Start countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleCodeChange = (text: string, index: number) => {
    // Only allow numbers
    const numericText = text.replace(/[^0-9]/g, '');
    
    if (numericText.length <= 1) {
      const newCode = [...code];
      newCode[index] = numericText;
      setCode(newCode);

      // Auto-focus next input
      if (numericText && index < 5) {
        inputRefs[index + 1].current?.focus();
      }

      // Auto-verify when all digits are entered
      if (index === 5 && numericText && newCode.every(digit => digit !== '')) {
        handleVerifyCode(newCode.join(''));
      }
    }
  };

  const handleBackspace = (index: number) => {
    if (code[index] === '' && index > 0) {
      // Move to previous input if current is empty
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleVerifyCode = async (codeToVerify?: string) => {
    const verificationCode = codeToVerify || code.join('');
    
    if (verificationCode.length !== 6) {
      Alert.alert('Invalid Code', 'Please enter the complete 6-digit code');
      return;
    }

    setLoading(true);

    try {
      console.log('Verifying code:', verificationCode, 'for phone:', phoneNumber);
      
      // Development bypass for testing without Twilio
      if (__DEV__ && verificationCode === '123456') {
        console.log('Development bypass - creating mock user session');
        await createMockUserProfile();
        return;
      }
      
      const { data, error } = await supabase.auth.verifyOtp({
        phone: phoneNumber,
        token: verificationCode,
        type: 'sms',
      });

      if (error) {
        console.error('OTP verification error:', error);
        Alert.alert(
          'Invalid Code', 
          error.message || 'The code you entered is incorrect. Please try again.'
        );
        // Clear the code inputs
        setCode(['', '', '', '', '', '']);
        inputRefs[0].current?.focus();
        return;
      }

      if (data.user) {
        // Phone verification successful!
        console.log('Phone verified successfully:', data.user.id);
        
        // Now create the full user profile with onboarding data
        await createUserProfile(data.user.id);
        
        // Clear onboarding data from storage since it's now in the database
        clearData();
        
        // Navigate directly to Main tabs
        console.log('Phone verification complete - navigating to Main');
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' as never }],
        });
      }
      
    } catch (error) {
      console.error('Unexpected verification error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const createUserProfile = async (userId: string) => {
    try {
      // Call the Supabase function to complete user onboarding with all data
      const { error } = await supabase.rpc('complete_user_onboarding', {
        user_uuid: userId,
        user_name: 'User', // We could collect this later
        fitness_goal_val: state.data.fitnessGoal,
        gender_val: state.data.sex,
        activity_level_val: state.data.activityLevel,
        age_val: state.data.age,
        height_ft_val: state.data.heightFt,
        height_in_val: state.data.heightIn,
        height_cm_val: state.data.heightCm,
        weight_lbs_val: state.data.weightLbs,
        weight_kg_val: state.data.weightKg,
        protein_goal_val: state.data.proteinGoal,
      });

      if (error) {
        console.error('Error creating user profile:', error);
        throw error;
      }

      console.log('User profile created successfully');
    } catch (error) {
      console.error('Failed to create user profile:', error);
      // Still allow them through - profile can be completed later
    }
  };

  const createMockUserProfile = async () => {
    try {
      console.log('Creating mock user profile for development testing...');
      
      // Set a flag in AsyncStorage to simulate authentication
      await AsyncStorage.setItem('mockAuthenticated', 'true');
      
      // Clear onboarding data from storage
      clearData();
      
      // Navigate directly to Main tabs for development
      console.log('Mock authentication complete - navigating to Main');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' as never }],
      });
      
    } catch (error) {
      console.error('Failed to create mock user profile:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  const handleResendCode = async () => {
    if (countdown > 0) return;

    setResendLoading(true);
    setCountdown(60);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: phoneNumber,
      });

      if (error) {
        console.error('Resend OTP error:', error);
        Alert.alert('Error', 'Failed to resend code. Please try again.');
      } else {
        Alert.alert('Code Sent', 'A new verification code has been sent to your phone');
      }
    } catch (error) {
      console.error('Unexpected resend error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const formatPhoneNumber = (phone: string) => {
    // Format +1XXXXXXXXXX to (XXX) XXX-XXXX
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length >= 11 && cleaned.startsWith('1')) {
      const number = cleaned.slice(1);
      return `(${number.slice(0, 3)}) ${number.slice(3, 6)}-${number.slice(6)}`;
    }
    return phone;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verify Phone</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>💬</Text>
        </View>
        
        <Text style={styles.title}>Enter verification code</Text>
        <Text style={styles.subtitle}>
          We sent a 6-digit code to {formatPhoneNumber(phoneNumber)}
        </Text>
        {__DEV__ && (
          <Text style={styles.devHint}>
            Development: Use code "123456" to bypass SMS verification
          </Text>
        )}

        {/* Code Input */}
        <View style={styles.codeContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={inputRefs[index]}
              style={[styles.codeInput, digit && styles.codeInputFilled]}
              value={digit}
              onChangeText={(text) => handleCodeChange(text, index)}
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === 'Backspace') {
                  handleBackspace(index);
                }
              }}
              keyboardType="number-pad"
              returnKeyType="done"
              maxLength={1}
              selectTextOnFocus
              autoFocus={index === 0}
            />
          ))}
        </View>

        {/* Resend Code */}
        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't receive the code? </Text>
          {countdown > 0 ? (
            <Text style={styles.countdownText}>Resend in {countdown}s</Text>
          ) : (
            <TouchableOpacity onPress={handleResendCode} disabled={resendLoading}>
              {resendLoading ? (
                <ActivityIndicator size="small" color="#007AFF" />
              ) : (
                <Text style={styles.resendLink}>Resend Code</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Verify Button */}
      <TouchableOpacity
        style={[styles.verifyButton, loading && styles.verifyButtonLoading]}
        onPress={() => handleVerifyCode()}
        disabled={loading || code.some(digit => digit === '')}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.verifyButtonText}>Verify & Continue</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backArrow: {
    fontSize: 24,
    color: '#1A1A1A',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  icon: {
    fontSize: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B6B6B',
    marginBottom: 40,
    lineHeight: 24,
    textAlign: 'center',
  },
  devHint: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 20,
    textAlign: 'center',
    fontStyle: 'italic',
    backgroundColor: '#F0F8FF',
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 20,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  codeInput: {
    width: 45,
    height: 55,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  codeInputFilled: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
    color: '#6B6B6B',
  },
  resendLink: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  countdownText: {
    fontSize: 14,
    color: '#999',
  },
  verifyButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  verifyButtonLoading: {
    backgroundColor: '#4A90E2',
  },
  verifyButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});