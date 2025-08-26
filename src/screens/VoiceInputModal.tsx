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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { whisperService } from '../services/whisper';
import { supabase, addProteinEntry } from '../services/supabase';
import { colors } from '../constants/colors';
import { VoiceInputResult } from '../types';

export default function VoiceInputModal() {
  const navigation = useNavigation();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<VoiceInputResult | null>(null);
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
      await stopRecording();
    } else {
      await startRecording();
    }
  };

  const startRecording = async () => {
    try {
      setIsRecording(true);
      setResult(null);
      await whisperService.startRecording();
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording. Please check microphone permissions.');
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
      
    } catch (error) {
      console.error('Failed to process recording:', error);
      Alert.alert('Error', 'Failed to process your recording. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApprove = async () => {
    if (!result || !result.proteinAmount) return;

    try {
      setIsProcessing(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      // Handle demo mode - if no user, save to AsyncStorage for demo
      if (!user) {
        console.log('Demo mode - saving protein entry locally');
        
        // Import AsyncStorage at the top of the file
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        
        // Get current date key
        const dateKey = new Date().toISOString().split('T')[0];
        const storageKey = `demo_protein_${dateKey}`;
        
        // Get existing entries for today
        const existingData = await AsyncStorage.getItem(storageKey);
        const todayEntries = existingData ? JSON.parse(existingData) : [];
        
        // Add new entry
        todayEntries.push({
          amount: result.proteinAmount,
          description: result.foodItem || result.transcript,
          timestamp: new Date().toISOString(),
          source: 'voice'
        });
        
        // Save back to storage
        await AsyncStorage.setItem(storageKey, JSON.stringify(todayEntries));
        
        // Navigate back to home screen immediately
        navigation.goBack();
        return;
      }

      await addProteinEntry({
        userId: user.id,
        date: new Date(),
        amount: result.proteinAmount,
        description: result.foodItem || result.transcript,
        source: 'voice',
      });

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
    setResult(null);
  };

  const handleClose = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.backdrop} onPress={handleClose} />
      <View style={styles.modalContent}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Log Protein with Voice</Text>
        </View>

      <View style={styles.content}>
        {!result ? (
          <>
            <View style={styles.instructionContainer}>
              <Text style={styles.instruction}>
                Tap the microphone and say something like:
              </Text>
              <View style={styles.exampleContainer}>
                <Text style={styles.example}>"25 grams of protein"</Text>
                <Text style={styles.example}>"Half cup of Greek yogurt"</Text>
                <Text style={styles.example}>"Chicken breast"</Text>
                <Text style={styles.example}>"Two eggs"</Text>
              </View>
            </View>

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
                ) : (
                  <Text style={styles.micIcon}>🎤</Text>
                )}
              </Animated.View>
            </TouchableOpacity>

            <Text style={styles.statusText}>
              {isRecording ? 'Listening...' : isProcessing ? 'Processing...' : 'Tap to speak'}
            </Text>
          </>
        ) : (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>What I heard:</Text>
            <Text style={styles.transcript}>"{result.transcript}"</Text>

            {result.proteinAmount ? (
              <>
                <View style={styles.proteinResult}>
                  <Text style={styles.proteinAmount}>{result.proteinAmount}g</Text>
                  <Text style={styles.proteinLabel}>protein</Text>
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
                    style={styles.cancelButton}
                    onPress={handleCancel}
                  >
                    <Text style={styles.cancelButtonText}>Try Again</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={handleApprove}
                    disabled={isProcessing}
                  >
                    <LinearGradient
                      colors={colors.gradients.successButton}
                      style={styles.approveButton}
                    >
                      {isProcessing ? (
                        <ActivityIndicator color={colors.text.white} />
                      ) : (
                        <Text style={styles.approveButtonText}>Log It!</Text>
                      )}
                    </LinearGradient>
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
    maxHeight: '80%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.text.light,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  closeButton: {
    padding: 5,
  },
  closeText: {
    fontSize: 24,
    color: colors.text.secondary,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginLeft: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  instructionContainer: {
    marginBottom: 50,
  },
  instruction: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 20,
  },
  exampleContainer: {
    backgroundColor: colors.background.white,
    padding: 20,
    borderRadius: 15,
  },
  example: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    marginVertical: 5,
    fontStyle: 'italic',
  },
  micContainer: {
    marginVertical: 40,
  },
  micButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
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
    fontSize: 50,
  },
  statusText: {
    fontSize: 16,
    color: colors.text.secondary,
    marginTop: 20,
  },
  resultContainer: {
    width: '100%',
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 10,
  },
  transcript: {
    fontSize: 18,
    color: colors.text.primary,
    fontStyle: 'italic',
    marginBottom: 30,
    textAlign: 'center',
  },
  proteinResult: {
    alignItems: 'center',
    marginBottom: 20,
  },
  proteinAmount: {
    fontSize: 64,
    fontWeight: 'bold',
    color: colors.primary.teal,
  },
  proteinLabel: {
    fontSize: 24,
    color: colors.text.secondary,
  },
  foodItem: {
    fontSize: 18,
    color: colors.text.primary,
    marginBottom: 20,
  },
  confidenceContainer: {
    flexDirection: 'row',
    marginBottom: 30,
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
    flexDirection: 'row',
    gap: 20,
  },
  cancelButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: colors.text.secondary,
  },
  cancelButtonText: {
    fontSize: 16,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  approveButton: {
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  approveButtonText: {
    fontSize: 16,
    color: colors.text.white,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    color: colors.secondary.orange,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    backgroundColor: colors.primary.teal,
  },
  retryButtonText: {
    fontSize: 16,
    color: colors.text.white,
    fontWeight: '600',
  },
});