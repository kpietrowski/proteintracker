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
      // Request permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Audio recording permission not granted');
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Create and start recording
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();
      
      this.recording = recording;
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
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
      throw error;
    }
  }

  async transcribeAudio(audioUri: string): Promise<string> {
    try {
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
    } catch (error) {
      console.error('Transcription error:', error);
      throw error;
    }
  }

  async parseProteinAmount(transcript: string): Promise<VoiceInputResult> {
    try {
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
    } catch (error) {
      console.error('Error parsing protein amount:', error);
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

    const transcript = await this.transcribeAudio(this.recordingUri);
    const result = await this.parseProteinAmount(transcript);
    
    // Clean up the recording file
    await FileSystem.deleteAsync(this.recordingUri, { idempotent: true });
    this.recordingUri = null;
    
    return result;
  }
}

export const whisperService = new WhisperService();