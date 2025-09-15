import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import FormData from 'form-data';
import axios from 'axios';
import { config } from './config';
import { VoiceInputResult } from '../types';

const OPENAI_API_KEY = config.openAI.apiKey;
const WHISPER_API_URL = 'https://api.openai.com/v1/audio/transcriptions';
const GPT_API_URL = 'https://api.openai.com/v1/chat/completions';

export class WhisperService {
  private recording: Audio.Recording | null = null;
  private recordingUri: string | null = null;

  async startRecording(): Promise<void> {
    try {
      console.log('WhisperService: Starting recording process...');
      
      // Clean up any existing recording first
      await this.cleanup();

      // Check current permission status first
      const { status: existingStatus } = await Audio.getPermissionsAsync();
      console.log('WhisperService: Current permission status:', existingStatus);
      
      let finalStatus = existingStatus;
      
      // Only request if not already granted
      if (existingStatus !== 'granted') {
        console.log('WhisperService: Requesting audio permissions...');
        const { status } = await Audio.requestPermissionsAsync();
        finalStatus = status;
        console.log('WhisperService: Permission request result:', status);
        
        // If permission was just granted, wait a moment for iOS to properly initialize
        if (status === 'granted') {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      if (finalStatus !== 'granted') {
        console.error('WhisperService: Audio permission denied');
        throw new Error('Microphone permission required. Please tap the microphone again after granting permission.');
      }

      console.log('WhisperService: Configuring audio mode...');
      // Configure audio mode with better iOS settings
      // Wrap in try-catch to handle background audio session errors gracefully
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: false,
          playThroughEarpieceAndroid: false,
        });
      } catch (audioModeError: any) {
        console.log('WhisperService: Audio mode configuration error (may be due to permission prompt):', audioModeError.message);
        // Continue anyway - this error often occurs during permission prompt
        // and the audio mode will be set correctly when the user taps again
      }

      // Create custom recording options for consistent quality
      // Using custom options instead of preset to ensure proper recording from built-in mic
      const recordingOptions = {
        android: {
          extension: '.m4a',
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
          sampleRate: 44100,
          numberOfChannels: 1, // Mono recording for better consistency
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC,
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
          sampleRate: 44100,
          numberOfChannels: 1, // Mono recording for better consistency
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        },
      };

      // Create and start recording with custom options
      console.log('WhisperService: Creating new recording instance...');
      const recording = new Audio.Recording();
      
      console.log('WhisperService: Preparing to record...');
      try {
        await recording.prepareToRecordAsync(recordingOptions);
      } catch (prepareError: any) {
        console.log('WhisperService: Prepare error (may be due to permission prompt):', prepareError.message);
        // If prepare fails due to background/permission issues, throw a silent error
        if (prepareError.message?.includes('background') || 
            prepareError.message?.includes('audio session') ||
            prepareError.code === 'EXModulesErrorDomain') {
          // This is expected during permission prompt - user should tap again
          throw new Error('permission_prompt_in_progress');
        }
        throw prepareError;
      }
      
      console.log('WhisperService: Starting recording...');
      await recording.startAsync();
      
      console.log('WhisperService: Recording started successfully');
      this.recording = recording;
    } catch (error: any) {
      console.error('WhisperService: Failed to start recording:', error);
      console.error('WhisperService: Error details:', {
        message: error.message,
        code: error.code,
        name: error.name,
      });
      
      // Clean up on error
      await this.cleanup();
      
      // Provide more specific error messages
      if (error.message?.includes('permission')) {
        throw new Error('Microphone permission denied. Please enable it in Settings > Privacy > Microphone.');
      } else if (error.message?.includes('audio mode')) {
        throw new Error('Failed to configure audio. Please try again.');
      } else {
        throw new Error(`Failed to start recording: ${error.message || 'Unknown error'}`);
      }
    }
  }

  async stopRecording(): Promise<string> {
    if (!this.recording) {
      throw new Error('No recording in progress');
    }

    try {
      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      
      if (!uri) {
        throw new Error('Failed to get recording URI');
      }
      
      this.recordingUri = uri;
      this.recording = null;
      
      return uri;
    } catch (error) {
      console.error('Failed to stop recording:', error);
      // Clean up on error
      await this.cleanup();
      throw error;
    }
  }

  private async cleanup(): Promise<void> {
    try {
      if (this.recording) {
        const status = await this.recording.getStatusAsync();
        if (status.isRecording) {
          await this.recording.stopAndUnloadAsync();
        } else if (status.canRecord) {
          await this.recording.stopAndUnloadAsync();
        }
        this.recording = null;
      }
      
      // Also clean up any leftover recording URI
      if (this.recordingUri) {
        await FileSystem.deleteAsync(this.recordingUri, { idempotent: true });
        this.recordingUri = null;
      }
    } catch (error) {
      console.warn('Error during cleanup:', error);
      // Force reset even if cleanup fails
      this.recording = null;
      this.recordingUri = null;
    }
  }

  async transcribeAudio(audioUri: string): Promise<string> {
    try {
      // Check if API key is available
      if (!OPENAI_API_KEY) {
        console.error('OpenAI API key is not configured');
        throw new Error('Voice transcription is not available. Please ensure the app is properly configured.');
      }

      // Read the audio file
      const audioFile = await FileSystem.readAsStringAsync(audioUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Create form data
      const formData = new FormData();
      formData.append('file', {
        uri: audioUri,
        type: 'audio/m4a',
        name: 'recording.m4a',
      } as any);
      formData.append('model', 'whisper-1');
      formData.append('language', 'en');

      // Send to Whisper API
      const response = await axios.post(WHISPER_API_URL, formData, {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.text;
    } catch (error: any) {
      console.error('Transcription error:', error);
      
      // Provide user-friendly error messages
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please check your OpenAI API key.');
      } else if (error.response?.status === 429) {
        throw new Error('Too many requests. Please try again in a moment.');
      } else if (error.response?.status === 400) {
        throw new Error('Invalid audio format. Please try recording again.');
      } else if (error.message?.includes('Network')) {
        throw new Error('Network error. Please check your internet connection.');
      }
      
      throw new Error('Failed to transcribe audio. Please try again.');
    }
  }

  async parseProteinAmount(transcript: string): Promise<VoiceInputResult> {
    try {
      // Check if API key is available
      if (!OPENAI_API_KEY) {
        console.error('OpenAI API key is not configured');
        throw new Error('AI parsing is not available. Please ensure the app is properly configured.');
      }

      // Use GPT to parse the transcript for protein information
      const response = await axios.post(
        GPT_API_URL,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are a nutrition assistant that extracts protein information from voice transcripts.
                       Parse the user's input and return a JSON response with the following structure:
                       {
                         "proteinAmount": <number in grams>,
                         "foodItem": "<food item name if mentioned>",
                         "confidence": <0-1 confidence score>
                       }
                       
                       Examples:
                       - "25 grams of protein" -> {"proteinAmount": 25, "foodItem": null, "confidence": 1.0}
                       - "half cup of Greek yogurt" -> {"proteinAmount": 12, "foodItem": "Greek yogurt (1/2 cup)", "confidence": 0.9}
                       - "chicken breast" -> {"proteinAmount": 26, "foodItem": "chicken breast (100g)", "confidence": 0.8}
                       - "two eggs" -> {"proteinAmount": 12, "foodItem": "2 eggs", "confidence": 0.95}
                       - "Big Mac" -> {"proteinAmount": 25, "foodItem": "Big Mac", "confidence": 0.95}
                       - "McDonald's Quarter Pounder" -> {"proteinAmount": 30, "foodItem": "Quarter Pounder", "confidence": 0.95}
                       - "Chipotle chicken bowl" -> {"proteinAmount": 45, "foodItem": "Chipotle chicken bowl", "confidence": 0.9}
                       - "Starbucks egg bites" -> {"proteinAmount": 19, "foodItem": "Starbucks egg bites", "confidence": 0.95}
                       - "Subway 6 inch turkey" -> {"proteinAmount": 18, "foodItem": "Subway 6\" turkey", "confidence": 0.9}
                       - "Chick-fil-A grilled chicken sandwich" -> {"proteinAmount": 28, "foodItem": "Chick-fil-A grilled chicken sandwich", "confidence": 0.95}
                       - "protein shake" -> {"proteinAmount": 25, "foodItem": "protein shake", "confidence": 0.8}
                       - "Whopper" -> {"proteinAmount": 28, "foodItem": "Whopper", "confidence": 0.95}
                       
                       For branded/restaurant items, use your knowledge of their standard nutritional values.
                       When unsure about portion size, assume standard serving sizes.
                       
                       If you cannot determine protein amount, return {"proteinAmount": null, "foodItem": null, "confidence": 0}`
            },
            {
              role: 'user',
              content: transcript
            }
          ],
          temperature: 0.3,
          response_format: { type: 'json_object' }
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const result = JSON.parse(response.data.choices[0].message.content);
      
      return {
        transcript,
        proteinAmount: result.proteinAmount,
        foodItem: result.foodItem,
        confidence: result.confidence || 0,
      };
    } catch (error: any) {
      console.error('Error parsing protein amount:', error);
      
      // Check for specific API errors
      if (error.response?.status === 401) {
        console.error('OpenAI API authentication failed');
      } else if (error.response?.status === 429) {
        console.error('OpenAI API rate limit exceeded');
      }
      
      // Return transcript only if parsing fails
      return {
        transcript,
        proteinAmount: undefined,
        foodItem: undefined,
        confidence: 0,
      };
    }
  }

  async processVoiceInput(): Promise<VoiceInputResult> {
    if (!this.recordingUri) {
      throw new Error('No recording available');
    }

    try {
      const transcript = await this.transcribeAudio(this.recordingUri);
      const result = await this.parseProteinAmount(transcript);
      
      // Clean up the recording file
      await FileSystem.deleteAsync(this.recordingUri, { idempotent: true });
      this.recordingUri = null;
      
      return result;
    } catch (error) {
      // Clean up on error
      await this.cleanup();
      throw error;
    }
  }
}

export const whisperService = new WhisperService();