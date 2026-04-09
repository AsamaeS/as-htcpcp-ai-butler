/**
 * Browser Text-to-Speech Fallback Service
 * 
 * This service provides a fallback TTS solution using the browser's built-in
 * Speech Synthesis API when ElevenLabs fails or runs out of credits.
 */

export interface BrowserTTSConfig {
  voice?: SpeechSynthesisVoice;
  rate: number;
  pitch: number;
  volume: number;
}

export const DEFAULT_BROWSER_TTS_CONFIG: BrowserTTSConfig = {
  rate: 0.8, // Slower for mystical effect
  pitch: 0.9, // Slightly lower pitch
  volume: 0.8,
};

/**
 * Generate speech using browser's built-in TTS
 */
export async function generateBrowserSpeech(
  text: string,
  config: BrowserTTSConfig = DEFAULT_BROWSER_TTS_CONFIG
): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      reject(new Error('Browser TTS not supported'));
      return;
    }

    console.log('[Browser TTS] 🎵 Generating speech with browser TTS:', text.substring(0, 50) + '...');

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure voice settings
    utterance.rate = config.rate;
    utterance.pitch = config.pitch;
    utterance.volume = config.volume;
    
    // Try to find a suitable voice
    const voices = speechSynthesis.getVoices();
    if (config.voice) {
      utterance.voice = config.voice;
    } else {
      // Try to find a female voice for mystical effect
      const femaleVoice = voices.find(voice => 
        voice.name.toLowerCase().includes('female') ||
        voice.name.toLowerCase().includes('woman') ||
        voice.name.toLowerCase().includes('zira') ||
        voice.name.toLowerCase().includes('hazel')
      );
      
      if (femaleVoice) {
        utterance.voice = femaleVoice;
        console.log('[Browser TTS] 🎭 Using voice:', femaleVoice.name);
      } else if (voices.length > 0) {
        utterance.voice = voices[0];
        console.log('[Browser TTS] 🎭 Using default voice:', voices[0].name);
      }
    }

    // Create a MediaRecorder to capture the audio
    // Note: This is a simplified approach - browser TTS doesn't directly return ArrayBuffer
    // In practice, we'll just play the audio directly
    utterance.onend = () => {
      console.log('[Browser TTS] ✅ Speech completed');
      // Return empty buffer since browser TTS plays directly
      resolve(new ArrayBuffer(0));
    };

    utterance.onerror = (event) => {
      console.error('[Browser TTS] ❌ Speech error:', event.error);
      reject(new Error(`Browser TTS error: ${event.error}`));
    };

    // Speak the text
    speechSynthesis.speak(utterance);
  });
}

/**
 * Play text directly using browser TTS (no ArrayBuffer needed)
 */
export function playBrowserSpeech(
  text: string,
  config: BrowserTTSConfig = DEFAULT_BROWSER_TTS_CONFIG
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      reject(new Error('Browser TTS not supported'));
      return;
    }

    console.log('[Browser TTS] 🔊 Playing speech directly:', text.substring(0, 50) + '...');

    // Stop any current speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure voice settings
    utterance.rate = config.rate;
    utterance.pitch = config.pitch;
    utterance.volume = config.volume;
    
    // Try to find a suitable voice
    const voices = speechSynthesis.getVoices();
    if (config.voice) {
      utterance.voice = config.voice;
    } else {
      // Try to find a female voice for mystical effect
      const femaleVoice = voices.find(voice => 
        voice.name.toLowerCase().includes('female') ||
        voice.name.toLowerCase().includes('woman') ||
        voice.name.toLowerCase().includes('zira') ||
        voice.name.toLowerCase().includes('hazel') ||
        voice.name.toLowerCase().includes('samantha')
      );
      
      if (femaleVoice) {
        utterance.voice = femaleVoice;
        console.log('[Browser TTS] 🎭 Using voice:', femaleVoice.name);
      }
    }

    utterance.onend = () => {
      console.log('[Browser TTS] ✅ Speech playback completed');
      resolve();
    };

    utterance.onerror = (event) => {
      console.error('[Browser TTS] ❌ Speech playback error:', event.error);
      reject(new Error(`Browser TTS error: ${event.error}`));
    };

    // Speak the text
    speechSynthesis.speak(utterance);
  });
}

/**
 * Get available browser voices
 */
export function getBrowserVoices(): SpeechSynthesisVoice[] {
  if (!('speechSynthesis' in window)) {
    return [];
  }
  
  return speechSynthesis.getVoices();
}

/**
 * Test browser TTS capability
 */
export async function testBrowserTTS(): Promise<{ success: boolean; error?: string; voices?: SpeechSynthesisVoice[] }> {
  try {
    if (!('speechSynthesis' in window)) {
      return { success: false, error: 'Browser TTS not supported' };
    }

    const voices = getBrowserVoices();
    console.log('[Browser TTS Test] 🧪 Available voices:', voices.length);
    
    // Test with a simple phrase
    await playBrowserSpeech('Testing browser text to speech.', {
      rate: 1.0,
      pitch: 1.0,
      volume: 0.5,
    });
    
    return { success: true, voices };
    
  } catch (error) {
    console.error('[Browser TTS Test] ❌ Test failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Enhanced TTS with emotional effects using browser TTS
 */
export function playEmotionalBrowserSpeech(
  text: string,
  emotion: 'mysterious' | 'serious' | 'dramatic' | 'whispering' | 'laughing' | 'crying' | 'giggling' | 'sad' | 'excited' | 'angry' | 'surprised'
): Promise<void> {
  const emotionalConfigs: Record<string, BrowserTTSConfig> = {
    mysterious: { rate: 0.7, pitch: 0.8, volume: 0.7 },
    serious: { rate: 0.8, pitch: 0.9, volume: 0.8 },
    dramatic: { rate: 0.6, pitch: 0.7, volume: 0.9 },
    whispering: { rate: 0.6, pitch: 0.8, volume: 0.5 },
    laughing: { rate: 1.1, pitch: 1.2, volume: 0.8 },
    crying: { rate: 0.7, pitch: 0.7, volume: 0.6 },
    giggling: { rate: 1.2, pitch: 1.3, volume: 0.7 },
    sad: { rate: 0.7, pitch: 0.7, volume: 0.6 },
    excited: { rate: 1.1, pitch: 1.1, volume: 0.9 },
    angry: { rate: 0.9, pitch: 0.8, volume: 0.9 },
    surprised: { rate: 1.0, pitch: 1.2, volume: 0.8 },
  };

  const config = emotionalConfigs[emotion] || DEFAULT_BROWSER_TTS_CONFIG;
  return playBrowserSpeech(text, config);
}