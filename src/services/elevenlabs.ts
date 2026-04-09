/**
 * ElevenLabs Voice Service - Production Grade
 * 
 * This service handles text-to-speech narration for the murder mystery game.
 * The mystical ORB uses this to speak to players with an ethereal, wise voice.
 * 
 * Features:
 * - Emotional voice synthesis with SSML-like controls
 * - Streaming audio for real-time responses
 * - Voice caching for performance
 * - Error handling and fallbacks
 */

export interface VoiceConfig {
  voiceId: string;
  stability: number;
  similarityBoost: number;
  style: number;
  speed: number;
  useSpeakerBoost: boolean;
}

export interface EmotionalVoiceSettings {
  emotion: 'mysterious' | 'serious' | 'laughing' | 'crying' | 'dramatic' | 'whispering' | 'giggling' | 'sad' | 'excited' | 'angry' | 'surprised';
  intensity: number; // 0.0 to 1.0
}

// Production voice configuration for the mystical ORB
export const ORB_VOICE_CONFIG: VoiceConfig = {
  voiceId: 'JBFqnCBsd6RMkjVDRZzb', // Rachel voice - perfect for mystical orb
  stability: 0.7,
  similarityBoost: 0.8,
  style: 0.6,
  speed: 0.9, // Slightly slower for dramatic effect
  useSpeakerBoost: true,
};

// Fallback voice IDs in case the primary one doesn't work
export const FALLBACK_VOICE_IDS = [
  'JBFqnCBsd6RMkjVDRZzb', // Rachel (primary)
  '21m00Tcm4TlvDq8ikWAM', // Rachel (alternative)
  'AZnzlk1XvdvUeBnXmlld', // Domi
  'EXAVITQu4vr4xnSDxMaL', // Bella
  'MF3mGyEYCl7XYWbV9V6O', // Elli
];

// Emotional voice presets for different story moments
export const EMOTIONAL_PRESETS: Record<string, Partial<VoiceConfig>> = {
  mysterious: {
    stability: 0.7,
    style: 0.6,
    speed: 0.85,
  },
  serious: {
    stability: 0.9,
    style: 0.3,
    speed: 0.8,
  },
  laughing: {
    stability: 0.4,
    style: 0.8,
    speed: 1.1,
  },
  crying: {
    stability: 0.3,
    style: 0.9,
    speed: 0.7,
  },
  dramatic: {
    stability: 0.6,
    style: 0.9,
    speed: 0.75,
  },
  whispering: {
    stability: 0.8,
    style: 0.4,
    speed: 0.6,
  },
  giggling: {
    stability: 0.4,
    style: 0.8,
    speed: 1.2,
  },
  sad: {
    stability: 0.3,
    style: 0.7,
    speed: 0.7,
  },
  excited: {
    stability: 0.5,
    style: 0.9,
    speed: 1.1,
  },
  angry: {
    stability: 0.6,
    style: 0.8,
    speed: 0.9,
  },
  surprised: {
    stability: 0.5,
    style: 0.7,
    speed: 1.0,
  },
};

/**
 * Add emotional markup to text for enhanced voice synthesis
 * Using voice settings instead of text markup for better TTS compatibility
 */
function addEmotionalMarkup(text: string, emotion: EmotionalVoiceSettings): string {
  // Clean the text of any existing markup that might be read aloud
  let cleanText = text
    .replace(/\*whispers mysteriously\*/gi, '')
    .replace(/\*[^*]+\*/g, '') // Remove any *action* markup
    .replace(/\s+/g, ' ') // Clean up extra spaces
    .trim();

  // For ElevenLabs, we rely on voice settings rather than text markup
  // The emotion is handled by the voice configuration parameters
  return cleanText;
}

/**
 * Generate speech audio from text using ElevenLabs API with emotions
 */
export async function generateSpeech(
  text: string,
  config: VoiceConfig = ORB_VOICE_CONFIG,
  emotion?: EmotionalVoiceSettings
): Promise<ArrayBuffer> {
  const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
  
  console.log(`[ElevenLabs] 🎵 Starting speech generation for text: "${text.substring(0, 50)}..."`);
  console.log(`[ElevenLabs] 🎵 Emotion: ${emotion?.emotion || 'none'}, Intensity: ${emotion?.intensity || 0}`);
  
  // Try multiple voice IDs if the primary one fails
  const voiceIdsToTry = [config.voiceId, ...FALLBACK_VOICE_IDS.filter(id => id !== config.voiceId)];
  
  for (let i = 0; i < voiceIdsToTry.length; i++) {
    const voiceId = voiceIdsToTry[i];
    
    try {
      // Apply emotional settings if provided
      let finalConfig = { ...config, voiceId };
      if (emotion) {
        const emotionalPreset = EMOTIONAL_PRESETS[emotion.emotion];
        if (emotionalPreset) {
          finalConfig = { ...finalConfig, ...emotionalPreset };
          
          // Adjust intensity
          finalConfig.style = Math.min(1.0, finalConfig.style * (1 + emotion.intensity));
          finalConfig.stability = Math.max(0.1, finalConfig.stability * (1 - emotion.intensity * 0.3));
        }
      }

      // Add emotional markup to text
      const processedText = emotion ? addEmotionalMarkup(text, emotion) : text;

      console.log(`[ElevenLabs] 🎵 Attempt ${i + 1}/${voiceIdsToTry.length} - Generating speech with voice: ${voiceId}`);
      console.log(`[ElevenLabs] 📝 Processed text: "${processedText.substring(0, 100)}..."`);

      const requestBody = {
        text: processedText,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: finalConfig.stability,
          similarity_boost: finalConfig.similarityBoost,
          style: finalConfig.style,
          use_speaker_boost: finalConfig.useSpeakerBoost,
          speed: finalConfig.speed,
        },
      };

      console.log(`[ElevenLabs] 📤 Request config:`, {
        voiceId,
        model: requestBody.model_id,
        textLength: processedText.length,
        voiceSettings: requestBody.voice_settings
      });

      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_22050_32&optimize_streaming_latency=4`,
        {
          method: 'POST',
          headers: {
            'xi-api-key': apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      console.log(`[ElevenLabs] 📥 Response status for voice ${voiceId}: ${response.status} ${response.statusText}`);
      console.log(`[ElevenLabs] 📥 Response headers:`, Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[ElevenLabs] ❌ Voice ${voiceId} failed:`, {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        
        // Check if it's a quota exceeded error
        if (response.status === 401 && errorText.includes('quota_exceeded')) {
          console.error(`[ElevenLabs] 💳 QUOTA EXCEEDED! Your ElevenLabs account is out of credits.`);
          console.error(`[ElevenLabs] 💡 Visit https://elevenlabs.io/subscription to add credits.`);
          console.error(`[ElevenLabs] 📊 Error details:`, errorText);
        }
        
        // If this is not the last voice to try, continue to next voice
        if (i < voiceIdsToTry.length - 1) {
          console.log(`[ElevenLabs] 🔄 Trying next voice...`);
          continue;
        } else {
          throw new Error(`All voices failed. Last error: ${response.status} - ${errorText}`);
        }
      }

      const audioBuffer = await response.arrayBuffer();
      console.log(`[ElevenLabs] ✅ Speech generated successfully with voice ${voiceId}: ${audioBuffer.byteLength} bytes`);
      
      if (audioBuffer.byteLength === 0) {
        console.warn(`[ElevenLabs] ⚠️ Voice ${voiceId} returned empty buffer`);
        if (i < voiceIdsToTry.length - 1) {
          console.log(`[ElevenLabs] 🔄 Trying next voice due to empty buffer...`);
          continue;
        } else {
          throw new Error('All voices returned empty audio buffers');
        }
      }
      
      console.log(`[ElevenLabs] 🎉 SUCCESS! Returning audio buffer of ${audioBuffer.byteLength} bytes`);
      return audioBuffer;
      
    } catch (error) {
      console.error(`[ElevenLabs] 💥 Voice ${voiceId} failed with error:`, {
        name: error.name,
        message: error.message,
        stack: error.stack?.substring(0, 200)
      });
      
      // If this is not the last voice to try, continue to next voice
      if (i < voiceIdsToTry.length - 1) {
        console.log(`[ElevenLabs] 🔄 Trying next voice due to error...`);
        continue;
      } else {
        console.error('[ElevenLabs] 💥 All voices failed - ElevenLabs is out of credits');
        console.error('[ElevenLabs] 💳 You need to add credits at: https://elevenlabs.io/subscription');
        console.error('[ElevenLabs] 🔄 App will use browser TTS as fallback');
        console.error('[ElevenLabs] 🔍 Final error details:', error);
        return new ArrayBuffer(0);
      }
    }
  }
  
  // This should never be reached, but just in case
  console.error('[ElevenLabs] 💥 Unexpected code path - ElevenLabs is out of credits');
  console.error('[ElevenLabs] 💳 Add credits at: https://elevenlabs.io/subscription');
  return new ArrayBuffer(0);
}

/**
 * Generate speech with specific emotion for story moments
 */
export async function generateEmotionalSpeech(
  text: string,
  emotion: EmotionalVoiceSettings['emotion'],
  intensity: number = 0.7
): Promise<ArrayBuffer> {
  return generateSpeech(text, ORB_VOICE_CONFIG, { emotion, intensity });
}

/**
 * Stream speech audio in real-time using WebSocket
 */
export class ElevenLabsStreamer {
  private ws: WebSocket | null = null;
  private audioChunks: ArrayBuffer[] = [];
  private onAudioChunk?: (chunk: ArrayBuffer) => void;
  private onComplete?: () => void;

  constructor(
    private voiceId: string = ORB_VOICE_CONFIG.voiceId,
    private config: VoiceConfig = ORB_VOICE_CONFIG
  ) {}

  async startStream(
    onAudioChunk: (chunk: ArrayBuffer) => void,
    onComplete: () => void
  ): Promise<void> {
    this.onAudioChunk = onAudioChunk;
    this.onComplete = onComplete;
    const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
    const wsUrl = `wss://api.elevenlabs.io/v1/text-to-speech/${this.voiceId}/stream-input?model_id=eleven_multilingual_v2&optimize_streaming_latency=2`;

    this.ws = new WebSocket(wsUrl);
    
    this.ws.onopen = () => {
      console.log('[ElevenLabs] WebSocket connected');
      // Initialize connection
      this.ws?.send(JSON.stringify({
        text: ' ',
        voice_settings: {
          stability: this.config.stability,
          similarity_boost: this.config.similarityBoost,
          style: this.config.style,
          use_speaker_boost: this.config.useSpeakerBoost,
          speed: this.config.speed,
        },
        xi_api_key: apiKey,
      }));
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.audio) {
          // Convert base64 to ArrayBuffer
          const binaryString = atob(data.audio);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const audioChunk = bytes.buffer;
          this.onAudioChunk?.(audioChunk);
        }
        
        if (data.isFinal) {
          console.log('[ElevenLabs] Stream completed');
          this.onComplete?.();
        }
      } catch (error) {
        console.error('[ElevenLabs] Error processing stream data:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('[ElevenLabs] WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('[ElevenLabs] WebSocket closed');
      this.onComplete?.();
    };
  }

  sendText(text: string, emotion?: EmotionalVoiceSettings): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('[ElevenLabs] WebSocket not connected');
      return;
    }

    const processedText = emotion ? addEmotionalMarkup(text, emotion) : text;
    
    this.ws.send(JSON.stringify({
      text: processedText + ' ',
      try_trigger_generation: true,
    }));
  }

  flush(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    
    this.ws.send(JSON.stringify({
      text: '',
      flush: true,
    }));
  }

  close(): void {
    if (this.ws) {
      this.ws.send(JSON.stringify({ text: '' })); // Close connection
      this.ws.close();
      this.ws = null;
    }
  }
}

/**
 * Test ElevenLabs API connection and voice availability
 */
export async function testElevenLabsConnection(): Promise<{ success: boolean; error?: string; voices?: any[] }> {
  const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
  
  try {
    console.log('[ElevenLabs Test] 🧪 Testing API connection...');
    console.log('[ElevenLabs Test] API Key:', apiKey.substring(0, 20) + '...');
    
    // First test: Get available voices
    const voicesResponse = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': apiKey,
      },
    });

    console.log('[ElevenLabs Test] Voices response status:', voicesResponse.status);
    
    if (!voicesResponse.ok) {
      const errorText = await voicesResponse.text();
      console.error('[ElevenLabs Test] ❌ Voices API Error:', voicesResponse.status, errorText);
      return { success: false, error: `Voices API error: ${voicesResponse.status} - ${errorText}` };
    }

    const voicesData = await voicesResponse.json();
    console.log('[ElevenLabs Test] ✅ Voices retrieved:', voicesData.voices?.length || 0);
    
    // Check if our voice ID exists
    const ourVoice = voicesData.voices?.find((v: any) => v.voice_id === ORB_VOICE_CONFIG.voiceId);
    if (!ourVoice) {
      console.warn('[ElevenLabs Test] ⚠️ Our voice ID not found, using first available voice');
      if (voicesData.voices?.length > 0) {
        console.log('[ElevenLabs Test] Available voices:', voicesData.voices.map((v: any) => ({ id: v.voice_id, name: v.name })));
      }
    } else {
      console.log('[ElevenLabs Test] ✅ Our voice found:', ourVoice.name);
    }

    // Second test: Try to generate a simple audio
    const testText = "Hello, this is a test.";
    const testVoiceId = ourVoice?.voice_id || voicesData.voices?.[0]?.voice_id || ORB_VOICE_CONFIG.voiceId;
    
    console.log('[ElevenLabs Test] 🎵 Testing speech generation with voice:', testVoiceId);
    
    const speechResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${testVoiceId}?output_format=mp3_22050_32&optimize_streaming_latency=4`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: testText,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.7,
            similarity_boost: 0.8,
            style: 0.6,
            use_speaker_boost: true,
            speed: 0.9,
          },
        }),
      }
    );

    console.log('[ElevenLabs Test] Speech response status:', speechResponse.status);
    
    if (!speechResponse.ok) {
      const errorText = await speechResponse.text();
      console.error('[ElevenLabs Test] ❌ Speech API Error:', speechResponse.status, errorText);
      return { success: false, error: `Speech API error: ${speechResponse.status} - ${errorText}` };
    }

    const audioBuffer = await speechResponse.arrayBuffer();
    console.log('[ElevenLabs Test] ✅ Speech generated:', audioBuffer.byteLength, 'bytes');
    
    if (audioBuffer.byteLength === 0) {
      return { success: false, error: 'Received empty audio buffer' };
    }
    
    return { success: true, voices: voicesData.voices };
    
  } catch (error) {
    console.error('[ElevenLabs Test] ❌ Connection failed:', error);
    return { success: false, error: `${error.constructor.name}: ${error.message}` };
  }
}

/**
 * Preload audio for common phrases to reduce latency
 */
export class AudioCache {
  private cache = new Map<string, ArrayBuffer>();
  
  async preloadCommonPhrases(): Promise<void> {
    const commonPhrases = [
      'The shadows hold many secrets...',
      'Truth does not arrive screaming. It whispers...',
      'You may ask only three questions.',
      'The dead do not scream.',
      'Time itself seemed confused.',
    ];

    console.log('[ElevenLabs] Preloading common phrases...');
    
    for (const phrase of commonPhrases) {
      try {
        const audio = await generateSpeech(phrase, ORB_VOICE_CONFIG, { emotion: 'mysterious', intensity: 0.7 });
        this.cache.set(phrase, audio);
      } catch (error) {
        console.error('[ElevenLabs] Failed to preload phrase:', phrase, error);
      }
    }
    
    console.log('[ElevenLabs] Preloaded', this.cache.size, 'phrases');
  }
  
  getCachedAudio(text: string): ArrayBuffer | null {
    return this.cache.get(text) || null;
  }
  
  setCachedAudio(text: string, audio: ArrayBuffer): void {
    this.cache.set(text, audio);
  }
}

// Global audio cache instance
export const audioCache = new AudioCache();

/**
 * Get available voices for the voice settings UI
 */
export async function getAvailableVoices(): Promise<Array<{ id: string; name: string }>> {
  const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
  
  try {
    console.log('[ElevenLabs] 🎵 Fetching available voices...');
    
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': apiKey,
      },
    });

    if (!response.ok) {
      console.error('[ElevenLabs] ❌ Failed to fetch voices:', response.status);
      // Return fallback voices if API fails
      return [
        { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'Rachel (Mystical)' },
        { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel (Alternative)' },
        { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi' },
        { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella' },
        { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli' },
      ];
    }

    const data = await response.json();
    console.log('[ElevenLabs] ✅ Voices fetched successfully:', data.voices?.length || 0);
    
    return data.voices?.map((voice: any) => ({
      id: voice.voice_id,
      name: voice.name
    })) || [];
    
  } catch (error) {
    console.error('[ElevenLabs] ❌ Error fetching voices:', error);
    // Return fallback voices if there's an error
    return [
      { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'Rachel (Mystical)' },
      { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel (Alternative)' },
      { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi' },
      { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella' },
      { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli' },
    ];
  }
}
