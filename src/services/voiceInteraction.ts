/**
 * Voice Interaction Service - Zero Cost Hackathon Edition
 * 
 * This service orchestrates voice-driven interactions using free browser APIs.
 * It combines SpeechRecognition, local mock AI processing, the Chaos Engine, and browser TTS.
 */

import { playEmotionalBrowserSpeech } from './browserTTS';
import { generateRawButlerResponse, type QuestionResponse } from './gemini';
import { evaluateChaos } from './chaosEngine';

export interface VoiceInteractionConfig {
  language: string;
  continuous: boolean;
  interimResults: boolean;
}

export interface VoiceSession {
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  transcript: string;
  confidence: number;
  currentEmotion?: string;
}

export class VoiceInteractionManager {
  private recognition: SpeechRecognition | null = null;
  private session: VoiceSession = {
    isListening: false,
    isProcessing: false,
    isSpeaking: false,
    transcript: '',
    confidence: 0,
  };

  constructor(private config: VoiceInteractionConfig = {
    language: 'en-US',
    continuous: false,
    interimResults: true,
  }) {
    this.initializeSpeechRecognition();
  }

  private initializeSpeechRecognition() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('[VoiceInteraction] Speech recognition not supported');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    
    this.recognition.lang = this.config.language;
    this.recognition.continuous = this.config.continuous;
    this.recognition.interimResults = this.config.interimResults;
    this.recognition.maxAlternatives = 1;

    this.recognition.onstart = () => {
      this.session.isListening = true;
      this.onSessionUpdate?.(this.session);
    };

    this.recognition.onend = () => {
      this.session.isListening = false;
      this.onSessionUpdate?.(this.session);
    };

    this.recognition.onresult = (event) => {
      const result = event.results[event.results.length - 1];
      if (result.isFinal) {
        this.session.transcript = result[0].transcript;
        this.session.confidence = result[0].confidence;
        this.onTranscriptReceived?.(this.session.transcript, this.session.confidence);
      }
    };

    this.recognition.onerror = (event) => {
      this.onError?.(event.error);
    };
  }

  startListening(): void {
    if (!this.recognition) return;
    if (this.session.isListening) return;

    try {
      this.recognition.start();
    } catch (error) {
      console.error('[VoiceInteraction] Failed to start listening:', error);
    }
  }

  stopListening(): void {
    if (this.recognition && this.session.isListening) {
      this.recognition.stop();
    }
  }

  async processVoiceQuestion(
    question: string,
    chaosLevel: number,
    isRepeat: boolean,
    ignoredPreviously: boolean
  ): Promise<{ text: string, wasRefused: boolean, wasContradicted: boolean, emotion: string }> {
    this.session.isProcessing = true;
    this.onSessionUpdate?.(this.session);

    try {
      // 1. Get raw mock AI response
      const rawResponse = await generateRawButlerResponse(question);
      
      // 2. Pass through Chaos Orchestrator
      const chaosResult = await evaluateChaos(question, rawResponse, chaosLevel, isRepeat, ignoredPreviously);
      
      // 3. Play browser TTS
      this.session.isSpeaking = true;
      this.session.currentEmotion = chaosResult.emotion;
      this.onSessionUpdate?.(this.session);

      playEmotionalBrowserSpeech(
        chaosResult.finalResponseText, 
        chaosResult.emotion as any
      ).then(() => {
        this.session.isSpeaking = false;
        this.onSessionUpdate?.(this.session);
      }).catch(err => {
        console.error('[VoiceInteraction] TTS playback failed:', err);
        this.session.isSpeaking = false;
        this.onSessionUpdate?.(this.session);
      });
      
      const finale = {
        text: chaosResult.finalResponseText,
        wasRefused: chaosResult.wasRefused,
        wasContradicted: chaosResult.wasContradicted,
        emotion: chaosResult.emotion
      };
      this.onResponseGenerated?.(finale);
      return finale;
      
    } catch (error: any) {
      this.onError?.(error.message);
      throw error;
    } finally {
      this.session.isProcessing = false;
      this.onSessionUpdate?.(this.session);
    }
  }

  stopAudio(): void {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.session.isSpeaking = false;
    this.onSessionUpdate?.(this.session);
  }

  getSession(): VoiceSession {
    return { ...this.session };
  }

  isSupported(): boolean {
    return !!this.recognition;
  }

  destroy(): void {
    this.stopListening();
    this.stopAudio();
  }

  onSessionUpdate?: (session: VoiceSession) => void;
  onTranscriptReceived?: (transcript: string, confidence: number) => void;
  onResponseGenerated?: (response: any) => void;
  onError?: (error: string) => void;
}

export const voiceManager = new VoiceInteractionManager();

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
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
  onresult: ((this: SpeechRecognition, ev: any) => any) | null;
  onerror: ((this: SpeechRecognition, ev: any) => any) | null;
}