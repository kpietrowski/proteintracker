import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
  Animated,
  Pressable,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { whisperService } from '../services/whisper';
import { localStorageService } from '../services/localStorage';
import { notificationService } from '../services/notificationService';
import { colors } from '../constants/colors';
import { VoiceInputResult } from '../types';
import { hapticFeedback } from '../utils/haptics';

export default function VoiceInputModal() {
  const navigation = useNavigation();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<VoiceInputResult | null>(null);
  const [adjustedProtein, setAdjustedProtein] = useState<number | null>(null);
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    if (isRecording) {
      startPulseAnimation();
    } else {
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isRecording]);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const handleMicPress = async () => {
    if (isRecording) {
      hapticFeedback.light();  // Light haptic when stopping
      await stopRecording();
    } else {
      hapticFeedback.medium();  // Medium haptic when starting
      await startRecording();
    }
  };

  const startRecording = async () => {
    try {
      setResult(null);
      // Start recording first, which will handle permissions
      await whisperService.startRecording();
      // Only set recording state if successful
      setIsRecording(true);
    } catch (error: any) {
      console.error('Failed to start recording:', error);
      // Don't show error for permission-related or background audio session errors
      // The user will tap again after granting permission
      const isPermissionError = error.message?.includes('permission') || 
                               error.message === 'permission_prompt_in_progress';
      const isBackgroundError = error.message?.includes('background') || 
                               error.message?.includes('audio session') ||
                               error.code === 'EXModulesErrorDomain';
      
      if (!isPermissionError && !isBackgroundError) {
        Alert.alert('Error', error.message || 'Failed to start recording. Please try again.');
      }
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    try {
      setIsRecording(false);
      setIsProcessing(true);
      
      // Stop recording and get the audio file
      const audioUri = await whisperService.stopRecording();
      
      // Process with Whisper and GPT
      const result = await whisperService.processVoiceInput();
      setResult(result);
      setAdjustedProtein(result?.proteinAmount || null);
      
    } catch (error: any) {
      console.error('Failed to process recording:', error);
      
      // Show more specific error message
      const errorMessage = error.message || 'Failed to process your recording. Please try again.';
      Alert.alert('Voice Input Error', errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const adjustProtein = (amount: number) => {
    if (!adjustedProtein) return;
    const newAmount = Math.max(1, adjustedProtein + amount);
    setAdjustedProtein(newAmount);
    hapticFeedback.selection();
  };

  const handleApprove = async () => {
    if (!result || !adjustedProtein) return;
    
    hapticFeedback.success();  // Success haptic when approving

    try {
      setIsProcessing(true);
      
      // Save protein entry to local storage
      console.log('Saving protein entry to local storage');
      
      const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
      await localStorageService.addProteinEntry(
        today,
        adjustedProtein,
        result.foodItem || result.transcript,
        'voice'
      );

      // Update the 7 PM notification if it's for today
      await notificationService.updateProteinLeftNotification(adjustedProtein);

      // Check if this is the user's first protein entry (but don't request rating here)
      const isFirstEntry = !(await localStorageService.getFirstProteinEntryStatus());
      if (isFirstEntry) {
        console.log('🌟 First protein entry detected!');
        await localStorageService.setFirstProteinEntryComplete();
      }

      // Navigate back to home screen immediately
      navigation.goBack();
    } catch (error) {
      console.error('Failed to save entry:', error);
      Alert.alert('Error', 'Failed to save protein entry. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    hapticFeedback.light();  // Light haptic when canceling
    setResult(null);
    setAdjustedProtein(null);
  };

  const handleClose = () => {
    hapticFeedback.selection();  // Selection haptic when closing
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.backdrop} onPress={handleClose} />
      <View style={styles.modalContent}>
        <View style={styles.header}>
          <View style={styles.brandContainer}>
            <View style={styles.logoRow}>
              <View style={styles.appIcon}>
                <View style={styles.appIconInner} />
              </View>
              <Text style={styles.title}>Protein AI</Text>
            </View>
            <Text style={styles.subtitle}>AI-powered protein tracking</Text>
          </View>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {!result ? (
          <>
            <View style={styles.instructionContainer}>
              <Text style={styles.instruction}>
                {isRecording ? 'Listening...' : 'Tap the microphone and say something like:'}
              </Text>
              <View style={styles.exampleContainer}>
                <Text style={styles.example}>"25 grams of protein"</Text>
                <Text style={styles.example}>"Half cup of Greek yogurt"</Text>
                <Text style={styles.example}>"Chicken breast"</Text>
                <Text style={styles.example}>"Two eggs"</Text>
              </View>
            </View>

            <View style={styles.micSection}>
              <TouchableOpacity
                onPress={handleMicPress}
                disabled={isProcessing}
                style={styles.micContainer}
              >
                <Animated.View
                  style={[
                    styles.micButton,
                    { transform: [{ scale: pulseAnim }] },
                    isRecording && styles.micButtonRecording,
                  ]}
                >
                  {isProcessing ? (
                    <ActivityIndicator size="large" color={colors.text.white} />
                  ) : isRecording ? (
                    <Text style={styles.doneText}>Done</Text>
                  ) : (
                    <Text style={styles.micIcon}>🎤</Text>
                  )}
                </Animated.View>
              </TouchableOpacity>

              <Text style={styles.statusText}>
                {isRecording ? '' : isProcessing ? 'Processing...' : 'Tap to speak'}
              </Text>
            </View>
          </>
        ) : (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>What I heard:</Text>
            <Text style={styles.transcript}>"{result.transcript}"</Text>

            {result.proteinAmount ? (
              <>
                <View style={styles.proteinAdjuster}>
                  <TouchableOpacity 
                    style={styles.adjustButton}
                    onPress={() => adjustProtein(-1)}
                  >
                    <Text style={styles.adjustButtonText}>−</Text>
                  </TouchableOpacity>
                  
                  <View style={styles.proteinResult}>
                    <Text style={styles.proteinAmount}>{adjustedProtein}</Text>
                    <Text style={styles.proteinLabel}>grams</Text>
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.adjustButton}
                    onPress={() => adjustProtein(1)}
                  >
                    <Text style={styles.adjustButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
                
                {result.foodItem && (
                  <Text style={styles.foodItem}>{result.foodItem}</Text>
                )}

                <View style={styles.confidenceContainer}>
                  <Text style={styles.confidenceLabel}>Confidence: </Text>
                  <Text style={styles.confidenceValue}>
                    {Math.round(result.confidence * 100)}%
                  </Text>
                </View>

                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    onPress={handleApprove}
                    disabled={isProcessing}
                    style={styles.approveButtonWrapper}
                  >
                    <LinearGradient
                      colors={colors.gradients.successButton}
                      style={styles.largeApproveButton}
                    >
                      {isProcessing ? (
                        <ActivityIndicator color={colors.text.white} size="large" />
                      ) : (
                        <Text style={styles.largeApproveButtonText}>Log It!</Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.tryAgainLink}
                    onPress={handleCancel}
                  >
                    <Text style={styles.tryAgainLinkText}>Try again</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.errorText}>
                  I couldn't determine the protein amount. Please try again.
                </Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={handleCancel}
                >
                  <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: colors.background.main,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 20,
    paddingTop: 0,
    height: '70%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.text.light,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  brandContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  appIcon: {
    width: 24,
    height: 24,
    backgroundColor: colors.secondary.orange,
    borderRadius: 6,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appIconInner: {
    width: 12,
    height: 12,
    backgroundColor: '#ffffff',
    borderRadius: 3,
    opacity: 0.9,
  },
  closeButton: {
    padding: 8,
    marginTop: -4,
  },
  closeText: {
    fontSize: 24,
    color: colors.text.secondary,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.secondary.orange,
  },
  subtitle: {
    fontSize: 15,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  instructionContainer: {
    alignItems: 'center',
    width: '100%',
    marginTop: 30,
    minHeight: 160, // Increased fixed height to accommodate all content
  },
  instruction: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 12,
    minHeight: 64, // Increased to handle both single line "Listening..." and multi-line instruction
    lineHeight: 32,
  },
  exampleContainer: {
    backgroundColor: '#FAFBFC',
    padding: 20,
    borderRadius: 16,
    marginTop: 12,
    width: '100%',
    borderWidth: 1,
    borderColor: '#F0F2F5',
    shadowColor: '#4A5568',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },
  example: {
    fontSize: 15,
    color: '#4A5568',
    textAlign: 'center',
    marginVertical: 6,
    fontWeight: '500',
    letterSpacing: 0.2,
    lineHeight: 20,
  },
  micSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30, // Fixed margin for consistent spacing
    minHeight: 140, // Fixed height to prevent shifting
  },
  micContainer: {
    marginBottom: 12, // Fixed margin
  },
  micButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary.teal,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  micButtonRecording: {
    backgroundColor: colors.secondary.orange,
  },
  micIcon: {
    fontSize: 40,
  },
  doneText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.white,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.secondary,
    textAlign: 'center',
    minHeight: 20, // Fixed height to prevent button position shifting
  },
  resultContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 30,
  },
  resultTitle: {
    fontSize: 15,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  transcript: {
    fontSize: 16,
    color: colors.text.primary,
    fontStyle: 'italic',
    marginBottom: 20,
    textAlign: 'center',
  },
  proteinAdjuster: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 10,
  },
  adjustButton: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.background.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E8F5E8',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  adjustButtonText: {
    fontSize: 28,
    fontWeight: '300',
    color: '#4CAF50',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  proteinResult: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 180,
  },
  proteinAmount: {
    fontSize: 92,
    fontWeight: 'bold',
    color: colors.primary.teal,
    lineHeight: 92,
    minWidth: 160,
    textAlign: 'center',
  },
  proteinLabel: {
    fontSize: 36,
    color: colors.text.secondary,
    marginTop: -12,
    fontWeight: '500',
  },
  foodItem: {
    fontSize: 16,
    color: colors.text.primary,
    marginBottom: 15,
  },
  confidenceContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  confidenceLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  confidenceValue: {
    fontSize: 14,
    color: colors.primary.teal,
    fontWeight: '600',
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 25,
    width: '100%',
    paddingHorizontal: 20,
  },
  approveButtonWrapper: {
    width: '80%',
    marginBottom: 15,
  },
  largeApproveButton: {
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  largeApproveButtonText: {
    fontSize: 22,
    color: colors.text.white,
    fontWeight: '700',
  },
  tryAgainLink: {
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  tryAgainLinkText: {
    fontSize: 16,
    color: colors.primary.teal,
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  errorText: {
    fontSize: 16,
    color: colors.secondary.orange,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 25,
    backgroundColor: colors.primary.teal,
  },
  retryButtonText: {
    fontSize: 16,
    color: colors.text.white,
    fontWeight: '600',
  },
});