/**
 * Voice Pipeline Controller - Complete Audio Flow
 * 
 * This service manages the complete voice-first game pipeline:
 * User clicks Orb → Story narration → Voice questions → AI responses → Audio playback
 */

import { generateSpeech, generateEmotionalSpeech } from './elevenlabs';
import { playEmotionalBrowserSpeech } from './browserTTS';
import { generateOrbResponse, type CaseContext, type GameState } from './gemini';
import type { MurderCase } from '@/data/cases';

export type PipelineState = 
  | 'idle'
  | 'narrating'
  | 'listening'
  | 'processing'
  | 'speaking'
  | 'complete';

export interface PipelineStatus {
  state: PipelineState;
  message: string;
  questionsRemaining: number;
  isListening: boolean;
  isSpeaking: boolean;
  debugLog: string[];
}

export interface VoiceQuestion {
  text: string;
  confidence: number;
  timestamp: Date;
}

export class VoicePipelineController {
  private state: PipelineState = 'idle';
  private recognition: SpeechRecognition | null = null;
  private audioContext: AudioContext | null = null;
  private currentAudio: AudioBufferSourceNode | null = null;
  private questionsAsked = 0;
  private maxQuestions = 3;
  private debugLog: string[] = [];
  private currentCase: MurderCase | null = null;
  private listeningTimeout: NodeJS.Timeout | null = null;

  // Event handlers
  onStateChange?: (status: PipelineStatus) => void;
  onQuestionReceived?: (question: VoiceQuestion) => void;
  onResponseReceived?: (response: string, emotion: string) => void;

  constructor() {
    this.initializeSpeechRecognition();
    this.initializeAudioContext();
  }

  private log(message: string): void {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    console.log(`[VoicePipeline] ${message}`);
    this.debugLog.push(logEntry);
    if (this.debugLog.length > 20) {
      this.debugLog.shift(); // Keep only last 20 logs
    }
    this.notifyStateChange();
  }

  private initializeSpeechRecognition(): void {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      this.log('❌ Speech recognition not supported');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    
    this.recognition.lang = 'en-US';
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 3; // Get more alternatives for better accuracy

    this.recognition.onstart = () => {
      this.log('🎤 Mic started - Orb is listening...');
      this.setState('listening');
      
      // Set a timeout to provide feedback if no speech is detected
      this.listeningTimeout = setTimeout(() => {
        if (this.state === 'listening') {
          this.log('💡 Tip: Speak clearly and loudly. Click "Ask Question" to try again.');
        }
      }, 5000);
    };

    this.recognition.onend = () => {
      this.log('🎤 Mic stopped');
      if (this.listeningTimeout) {
        clearTimeout(this.listeningTimeout);
        this.listeningTimeout = null;
      }
      if (this.state === 'listening') {
        this.setState('idle');
      }
    };

    this.recognition.onresult = (event) => {
      const result = event.results[0];
      if (result.isFinal) {
        const transcript = result[0].transcript;
        const confidence = result[0].confidence;
        
        this.log(`📝 Speech captured: "${transcript}" (confidence: ${confidence.toFixed(2)})`);
        
        // Web Speech API often returns 0 confidence even for good speech
        // Accept any speech that has actual content
        if (transcript.trim().length > 2) {
          const question: VoiceQuestion = {
            text: transcript,
            confidence: confidence || 0.8, // Default to high confidence if API returns 0
            timestamp: new Date()
          };
          
          this.onQuestionReceived?.(question);
          this.processQuestion(question);
        } else {
          this.log('❌ Speech too short, please try again');
          this.setState('idle');
        }
      }
    };

    this.recognition.onerror = (event) => {
      if (this.listeningTimeout) {
        clearTimeout(this.listeningTimeout);
        this.listeningTimeout = null;
      }
      
      if (event.error === 'no-speech') {
        this.log('🔇 No speech detected - try speaking louder or closer to microphone');
      } else if (event.error === 'audio-capture') {
        this.log('❌ Microphone access denied or not available');
      } else if (event.error === 'not-allowed') {
        this.log('❌ Microphone permission denied - please allow microphone access');
      } else {
        this.log(`❌ Speech recognition error: ${event.error}`);
      }
      this.setState('idle');
    };
  }

  private async initializeAudioContext(): Promise<void> {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.log('🔊 Audio context initialized');
    } catch (error) {
      this.log(`❌ Audio context failed: ${error}`);
    }
  }

  /**
   * 1️⃣ START STORY NARRATION (Orb Click) - OPTIMIZED WITH PRE-RECORDED AUDIO
   */
  async startStoryNarration(murderCase: MurderCase): Promise<void> {
    this.log(`🎭 Starting story narration: ${murderCase.title}`);
    this.currentCase = murderCase;
    this.questionsAsked = 0;
    this.setState('narrating');

    try {
      // Use pre-recorded audio files instead of calling ElevenLabs
      const audioFileName = `ElevenLabs_Level${murderCase.level}.mp3`;
      const audioUrl = `/recordings/${audioFileName}`;
      
      this.log(`🎵 Loading pre-recorded story audio: ${audioFileName}`);
      
      // Fetch the pre-recorded audio file
      const response = await fetch(audioUrl);
      if (!response.ok) {
        throw new Error(`Failed to load audio file: ${response.status}`);
      }
      
      const storyAudio = await response.arrayBuffer();
      
      if (storyAudio.byteLength === 0) {
        throw new Error('Pre-recorded audio file is empty');
      }

      this.log(`🎵 Pre-recorded story audio loaded: ${storyAudio.byteLength} bytes`);

      // Play full story narration
      await this.playAudio(storyAudio, 'story');
      
      this.log('✅ Story narration complete - Interrogation phase enabled');
      this.setState('idle');

    } catch (error) {
      this.log(`❌ Story narration failed: ${error}`);
      this.log('🔄 Falling back to ElevenLabs generation...');
      
      // Fallback to ElevenLabs if pre-recorded file fails
      try {
        const storyAudio = await generateEmotionalSpeech(
          murderCase.introNarration, 
          'mysterious', 
          0.8
        );

        if (storyAudio.byteLength > 0) {
          await this.playAudio(storyAudio, 'story');
          this.log('✅ Fallback story narration complete');
          this.setState('idle');
        } else {
          throw new Error('Fallback audio generation failed');
        }
      } catch (fallbackError) {
        this.log(`❌ ElevenLabs fallback also failed: ${fallbackError}`);
        this.log('🔄 Using browser TTS for story...');
        
        try {
          // Use browser TTS as final fallback
          await playEmotionalBrowserSpeech(murderCase.introNarration, 'mysterious');
          this.log('✅ Browser TTS story narration complete');
          this.setState('idle');
        } catch (browserError) {
          this.log(`❌ All TTS methods failed: ${browserError}`);
          this.log('📝 Story text only: ' + murderCase.introNarration);
          this.setState('idle');
        }
      }
    }
  }

  /**
   * 2️⃣ START VOICE QUESTION CAPTURE
   */
  startVoiceCapture(): void {
    if (!this.recognition) {
      this.log('❌ Speech recognition not available');
      return;
    }

    if (this.questionsAsked >= this.maxQuestions) {
      this.log('❌ No questions remaining');
      this.setState('complete');
      return;
    }

    if (this.state !== 'idle') {
      this.log('❌ Cannot start capture - pipeline busy');
      return;
    }

    try {
      this.log('🎤 Starting voice capture...');
      this.recognition.start();
    } catch (error) {
      this.log(`❌ Failed to start voice capture: ${error}`);
    }
  }

  /**
   * 3️⃣ PROCESS QUESTION THROUGH PIPELINE
   */
  private async processQuestion(question: VoiceQuestion): Promise<void> {
    this.setState('processing');
    this.questionsAsked++;

    try {
      if (!this.currentCase) {
        throw new Error('No active case');
      }

      // Build comprehensive case context with ALL case information
      const caseContext: CaseContext = {
        caseId: this.currentCase.level.toString(),
        victim: this.currentCase.victim.name,
        location: this.currentCase.location,
        timeOfDeath: this.currentCase.timeOfDeath,
        suspects: this.currentCase.suspects.map(s => ({
          id: s.id,
          name: s.name,
          alibi: s.alibi,
          motive: s.motive,
          clues: s.clues || []
        })),
        trueMurderer: this.currentCase.trueMurderer,
        keyFacts: this.currentCase.keyFacts || []
      };

      const gameState: GameState = {
        questionsAsked: this.questionsAsked,
        maxQuestions: this.maxQuestions,
        previousQuestions: [], // Would track in real implementation
        revealedClues: []
      };

      this.log(`🧠 Sending to Gemini - Case: ${this.currentCase.title}, Question: "${question.text}"`);
      this.log(`🧠 Case context: ${this.currentCase.suspects.length} suspects, ${this.currentCase.keyFacts.length} key facts`);
      
      // Send to Gemini
      this.log('🧠 Sending question to Gemini...');
      const response = await generateOrbResponse(question.text, caseContext, gameState);
      
      this.log(`🧠 Gemini response received: "${response.text.substring(0, 50)}..."`);
      this.onResponseReceived?.(response.text, response.emotion);

      // Convert to speech
      this.log('🎵 Converting response to speech...');
      
      try {
        const responseAudio = await generateEmotionalSpeech(
          response.text,
          response.emotion,
          response.confidence
        );

        if (responseAudio.byteLength === 0) {
          throw new Error('No response audio generated');
        }

        this.log(`🎵 Response audio generated: ${responseAudio.byteLength} bytes`);

        // Play response
        await this.playAudio(responseAudio, 'response');
        
      } catch (ttsError) {
        this.log(`❌ ElevenLabs TTS failed: ${ttsError}`);
        this.log('🔄 Falling back to browser TTS...');
        
        try {
          // Use browser TTS as fallback
          await playEmotionalBrowserSpeech(response.text, response.emotion);
          this.log('✅ Browser TTS playback completed');
        } catch (browserTtsError) {
          this.log(`❌ Browser TTS also failed: ${browserTtsError}`);
          this.log('📝 Response text only: ' + response.text);
        }
      }

      // Check if questions exhausted
      if (this.questionsAsked >= this.maxQuestions) {
        this.log('🔒 All questions used - Orb falls silent');
        this.setState('complete');
      } else {
        this.log(`✅ Question processed - ${this.maxQuestions - this.questionsAsked} questions remaining`);
        this.setState('idle');
      }

    } catch (error) {
      this.log(`❌ Question processing failed: ${error}`);
      this.setState('idle');
    }
  }

  /**
   * 4️⃣ AUDIO PLAYBACK WITH PROPER SEQUENCING
   */
  private async playAudio(audioData: ArrayBuffer, type: 'story' | 'response'): Promise<void> {
    if (!this.audioContext || audioData.byteLength === 0) {
      throw new Error('No audio context or empty audio');
    }

    return new Promise(async (resolve, reject) => {
      try {
        // Resume audio context if suspended
        if (this.audioContext!.state === 'suspended') {
          await this.audioContext!.resume();
        }

        // Decode audio
        const audioBuffer = await this.audioContext!.decodeAudioData(audioData.slice(0));
        const source = this.audioContext!.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(this.audioContext!.destination);

        this.setState('speaking');
        this.log(`🔊 Audio playback started (${type}): ${audioBuffer.duration.toFixed(1)}s`);

        // Handle playback completion
        source.onended = () => {
          this.log(`🔊 Audio playback ended (${type})`);
          this.currentAudio = null;
          resolve();
        };

        // Start playback
        source.start();
        this.currentAudio = source;

      } catch (error) {
        this.log(`❌ Audio playback failed: ${error}`);
        reject(error);
      }
    });
  }

  /**
   * STOP ALL AUDIO
   */
  stopAudio(): void {
    if (this.currentAudio) {
      this.currentAudio.stop();
      this.currentAudio = null;
      this.log('🔇 Audio stopped');
    }
    if (this.state === 'speaking') {
      this.setState('idle');
    }
  }

  /**
   * STOP VOICE CAPTURE
   */
  stopVoiceCapture(): void {
    if (this.listeningTimeout) {
      clearTimeout(this.listeningTimeout);
      this.listeningTimeout = null;
    }
    if (this.recognition && this.state === 'listening') {
      this.recognition.stop();
      this.log('🔇 Voice capture stopped');
    }
  }

  /**
   * GET CURRENT STATUS
   */
  getStatus(): PipelineStatus {
    return {
      state: this.state,
      message: this.getStateMessage(),
      questionsRemaining: this.maxQuestions - this.questionsAsked,
      isListening: this.state === 'listening',
      isSpeaking: this.state === 'speaking' || this.state === 'narrating',
      debugLog: [...this.debugLog]
    };
  }

  /**
   * RESET PIPELINE
   */
  reset(): void {
    this.stopAudio();
    this.stopVoiceCapture();
    if (this.listeningTimeout) {
      clearTimeout(this.listeningTimeout);
      this.listeningTimeout = null;
    }
    this.questionsAsked = 0;
    this.currentCase = null;
    this.debugLog = [];
    this.setState('idle');
    this.log('🔄 Pipeline reset');
  }

  /**
   * CHECK IF VOICE IS SUPPORTED
   */
  isVoiceSupported(): boolean {
    return !!(this.recognition && this.audioContext);
  }

  private setState(newState: PipelineState): void {
    this.state = newState;
    this.notifyStateChange();
  }

  private getStateMessage(): string {
    switch (this.state) {
      case 'idle': return 'Click the Orb to begin...';
      case 'narrating': return 'Listening to the past...';
      case 'listening': return 'The Orb is listening...';
      case 'processing': return 'The Orb contemplates...';
      case 'speaking': return 'The Orb speaks...';
      case 'complete': return 'The Orb falls silent. Time to accuse.';
      default: return 'Unknown state';
    }
  }

  private notifyStateChange(): void {
    this.onStateChange?.(this.getStatus());
  }
}

// Global pipeline instance
export const voicePipeline = new VoicePipelineController();

// Type declarations
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
    AudioContext: any;
    webkitAudioContext: any;
  }
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}