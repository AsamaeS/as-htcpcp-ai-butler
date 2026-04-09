/**
 * Game Engine - Production Grade
 * 
 * This service manages the complete game flow, state, and logic for the murder mystery.
 * It orchestrates AI responses, voice synthesis, and game progression.
 */

import { generateOrbResponse, generateRevealNarration, type CaseContext, type GameState, type QuestionResponse } from './gemini';
import { generateEmotionalSpeech, audioCache } from './elevenlabs';
import { voiceManager } from './voiceInteraction';
import type { MurderCase } from '@/data/cases';

export interface GameSession {
  currentCase: MurderCase | null;
  gameState: GameState;
  messages: GameMessage[];
  unlockedLevels: number[];
  completedLevels: number[];
  isProcessing: boolean;
}

export interface GameMessage {
  id: string;
  type: 'player' | 'orb' | 'system';
  text: string;
  timestamp: Date;
  emotion?: 'mysterious' | 'serious' | 'dramatic' | 'whispering';
  confidence?: number;
}

export class GameEngine {
  private session: GameSession = {
    currentCase: null,
    gameState: {
      questionsAsked: 0,
      maxQuestions: 3,
      previousQuestions: [],
      revealedClues: [],
    },
    messages: [],
    unlockedLevels: [1],
    completedLevels: [],
    isProcessing: false,
  };

  private listeners: Set<(session: GameSession) => void> = new Set();

  constructor() {
    // Initialize audio cache
    this.initializeAudioCache();
  }

  private async initializeAudioCache(): Promise<void> {
    try {
      await audioCache.preloadCommonPhrases();
      console.log('[GameEngine] Audio cache initialized');
    } catch (error) {
      console.error('[GameEngine] Failed to initialize audio cache:', error);
    }
  }

  /**
   * Start a new case
   */
  async startCase(murderCase: MurderCase): Promise<void> {
    console.log('[GameEngine] Starting case:', murderCase.title);
    
    this.session.currentCase = murderCase;
    this.session.gameState = {
      questionsAsked: 0,
      maxQuestions: 3,
      previousQuestions: [],
      revealedClues: [],
    };
    this.session.messages = [];
    this.session.isProcessing = false;

    // Add intro message
    this.addSystemMessage('Case started: ' + murderCase.title);
    
    // Preload case-specific audio
    await this.preloadCaseAudio(murderCase);
    
    this.notifyListeners();
  }

  /**
   * Process a player question
   */
  async askQuestion(question: string): Promise<QuestionResponse> {
    if (!this.session.currentCase) {
      throw new Error('No active case');
    }

    if (this.session.gameState.questionsAsked >= this.session.gameState.maxQuestions) {
      throw new Error('No questions remaining');
    }

    console.log('[GameEngine] Processing question:', question);
    
    this.session.isProcessing = true;
    this.notifyListeners();

    try {
      // Add player message
      this.addPlayerMessage(question);

      // Update game state
      this.session.gameState.questionsAsked++;
      this.session.gameState.previousQuestions.push(question);

      // Generate case context
      const caseContext = this.buildCaseContext();

      // Generate AI response
      const response = await generateOrbResponse(question, caseContext, this.session.gameState);

      // Add orb message
      this.addOrbMessage(response.text, response.emotion, response.confidence);

      // Update revealed clues
      if (response.revealedClue && !this.session.gameState.revealedClues.includes(response.revealedClue)) {
        this.session.gameState.revealedClues.push(response.revealedClue);
      }

      console.log('[GameEngine] Question processed successfully');
      return response;

    } catch (error) {
      console.error('[GameEngine] Failed to process question:', error);
      
      // Add fallback response
      const fallbackResponse: QuestionResponse = {
        text: "The shadows whisper of mysteries beyond mortal comprehension...",
        isAmbiguous: true,
        emotion: 'mysterious',
        confidence: 0.3,
      };
      
      this.addOrbMessage(fallbackResponse.text, fallbackResponse.emotion, fallbackResponse.confidence);
      return fallbackResponse;
      
    } finally {
      this.session.isProcessing = false;
      this.notifyListeners();
    }
  }

  /**
   * Make final accusation
   */
  async makeAccusation(suspectId: string): Promise<{ isCorrect: boolean; narration: string; emotion: string }> {
    if (!this.session.currentCase) {
      throw new Error('No active case');
    }

    console.log('[GameEngine] Making accusation:', suspectId);
    
    this.session.isProcessing = true;
    this.notifyListeners();

    try {
      const isCorrect = suspectId === this.session.currentCase.trueMurderer;
      const suspect = this.session.currentCase.suspects.find(s => s.id === suspectId);
      const suspectName = suspect?.name || 'Unknown';

      // Generate reveal narration
      const caseContext = this.buildCaseContext();
      const { text: narration, emotion } = await generateRevealNarration(caseContext, suspectName, isCorrect);

      // Add system message
      this.addSystemMessage(`Accused: ${suspectName} - ${isCorrect ? 'CORRECT' : 'INCORRECT'}`);
      this.addOrbMessage(narration, emotion, isCorrect ? 1.0 : 0.8);

      // Update game progress
      if (isCorrect) {
        this.session.completedLevels.push(this.session.currentCase.level);
        
        // Unlock next level
        const nextLevel = this.session.currentCase.level + 1;
        if (!this.session.unlockedLevels.includes(nextLevel)) {
          this.session.unlockedLevels.push(nextLevel);
        }
      }

      console.log('[GameEngine] Accusation processed:', { isCorrect, suspectName });
      
      return { isCorrect, narration, emotion };

    } catch (error) {
      console.error('[GameEngine] Failed to process accusation:', error);
      
      const fallbackNarration = "The truth remains shrouded in mystery...";
      this.addOrbMessage(fallbackNarration, 'mysterious', 0.3);
      
      return { isCorrect: false, narration: fallbackNarration, emotion: 'mysterious' };
      
    } finally {
      this.session.isProcessing = false;
      this.notifyListeners();
    }
  }

  /**
   * Get current game session
   */
  getSession(): GameSession {
    return { ...this.session };
  }

  /**
   * Check if player can ask more questions
   */
  canAskQuestion(): boolean {
    return this.session.gameState.questionsAsked < this.session.gameState.maxQuestions;
  }

  /**
   * Get questions remaining
   */
  getQuestionsRemaining(): number {
    return this.session.gameState.maxQuestions - this.session.gameState.questionsAsked;
  }

  /**
   * Subscribe to game state changes
   */
  subscribe(listener: (session: GameSession) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Play narration with voice synthesis
   */
  async playNarration(text: string, emotion: 'mysterious' | 'serious' | 'dramatic' | 'whispering' = 'mysterious'): Promise<void> {
    try {
      // Check cache first
      const cachedAudio = audioCache.getCachedAudio(text);
      if (cachedAudio && cachedAudio.byteLength > 0) {
        console.log('[GameEngine] Playing cached narration');
        // Play cached audio (would need audio context integration)
        return;
      }

      // Generate and play new audio
      console.log('[GameEngine] Generating narration with emotion:', emotion);
      await voiceManager.streamNarration(text, emotion);
      
    } catch (error) {
      console.error('[GameEngine] Failed to play narration:', error);
    }
  }

  private buildCaseContext(): CaseContext {
    if (!this.session.currentCase) {
      throw new Error('No active case');
    }

    return {
      caseId: this.session.currentCase.level.toString(),
      victim: this.session.currentCase.victim.name,
      location: this.session.currentCase.location,
      timeOfDeath: this.session.currentCase.timeOfDeath,
      suspects: this.session.currentCase.suspects.map(s => ({
        id: s.id,
        name: s.name,
        alibi: s.alibi,
        motive: s.motive,
        clues: s.clues || []
      })),
      trueMurderer: this.session.currentCase.trueMurderer,
      keyFacts: this.session.currentCase.keyFacts || []
    };
  }

  private addPlayerMessage(text: string): void {
    const message: GameMessage = {
      id: `player-${Date.now()}`,
      type: 'player',
      text,
      timestamp: new Date(),
    };
    this.session.messages.push(message);
  }

  private addOrbMessage(text: string, emotion: QuestionResponse['emotion'], confidence: number): void {
    const message: GameMessage = {
      id: `orb-${Date.now()}`,
      type: 'orb',
      text,
      timestamp: new Date(),
      emotion,
      confidence,
    };
    this.session.messages.push(message);
  }

  private addSystemMessage(text: string): void {
    const message: GameMessage = {
      id: `system-${Date.now()}`,
      type: 'system',
      text,
      timestamp: new Date(),
    };
    this.session.messages.push(message);
  }

  private async preloadCaseAudio(murderCase: MurderCase): Promise<void> {
    try {
      console.log('[GameEngine] Preloading case audio for:', murderCase.title);
      
      // Preload intro narration
      const introAudio = await generateEmotionalSpeech(murderCase.introNarration, 'mysterious', 0.8);
      audioCache.setCachedAudio(murderCase.introNarration, introAudio);
      
      // Preload reveal narration
      const revealAudio = await generateEmotionalSpeech(murderCase.revealNarration, 'dramatic', 0.9);
      audioCache.setCachedAudio(murderCase.revealNarration, revealAudio);
      
      console.log('[GameEngine] Case audio preloaded successfully');
      
    } catch (error) {
      console.error('[GameEngine] Failed to preload case audio:', error);
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.session);
      } catch (error) {
        console.error('[GameEngine] Listener error:', error);
      }
    });
  }
}

// Global game engine instance
export const gameEngine = new GameEngine();