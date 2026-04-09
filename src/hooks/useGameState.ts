/**
 * Game State Management Hook
 * Manages progression, suspect selection, and level unlocking
 */

import { useState, useCallback, useEffect } from 'react';
import { audioManager } from '@/services/audioManager';
import type { MurderCase } from '@/data/cases';

export interface GameProgress {
  unlockedLevels: number[];
  completedLevels: number[];
  currentLevel: number | null;
  allLevelsCompleted: boolean;
}

export interface GameSession {
  currentCase: MurderCase | null;
  selectedSuspect: string | null;
  questionsAsked: number;
  maxQuestions: number;
  cluesRevealed: string[];
  isCorrect: boolean | null;
  startTime: Date | null;
  endTime: Date | null;
}

export interface DebateState {
  isActive: boolean;
  topic: string;
  userArguments: string[];
  oracleResponses: string[];
  currentScore: number;
  maxScore: number;
}

const STORAGE_KEY = 'murder-mystery-progress';

export function useGameState() {
  // Load progress from localStorage - but reset session state
  const loadProgress = (): GameProgress => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          unlockedLevels: parsed.unlockedLevels || [1],
          completedLevels: parsed.completedLevels || [],
          currentLevel: null,
          allLevelsCompleted: (parsed.completedLevels || []).length >= 3
        };
      }
    } catch (error) {
      console.error('Failed to load game progress:', error);
    }
    
    return {
      unlockedLevels: [1],
      completedLevels: [],
      currentLevel: null,
      allLevelsCompleted: false
    };
  };

  // Initialize with fresh state on every page load
  const [progress, setProgress] = useState<GameProgress>(() => {
    // Clear saved progress on page refresh for fresh experience
    localStorage.removeItem(STORAGE_KEY);
    
    // Clean up any generated audio from previous session
    audioManager.cleanupAllGeneratedAudio();
    
    return {
      unlockedLevels: [1],
      completedLevels: [],
      currentLevel: null,
      allLevelsCompleted: false
    };
  });
  
  // Reset session state on page refresh
  const [session, setSession] = useState<GameSession>({
    currentCase: null,
    selectedSuspect: null,
    questionsAsked: 0,
    maxQuestions: 3,
    cluesRevealed: [],
    isCorrect: null,
    startTime: null,
    endTime: null
  });
  const [debate, setDebate] = useState<DebateState>({
    isActive: false,
    topic: '',
    userArguments: [],
    oracleResponses: [],
    currentScore: 0,
    maxScore: 100
  });

  // Save progress to localStorage
  const saveProgress = useCallback((newProgress: GameProgress) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        unlockedLevels: newProgress.unlockedLevels,
        completedLevels: newProgress.completedLevels
      }));
    } catch (error) {
      console.error('Failed to save game progress:', error);
    }
  }, []);

  // Start a new case
  const startCase = useCallback((murderCase: MurderCase) => {
    setSession({
      currentCase: murderCase,
      selectedSuspect: null,
      questionsAsked: 0,
      maxQuestions: 3,
      cluesRevealed: [],
      isCorrect: null,
      startTime: new Date(),
      endTime: null
    });
    
    setProgress(prev => ({
      ...prev,
      currentLevel: murderCase.level
    }));
  }, []);

  // Select a suspect
  const selectSuspect = useCallback((suspectId: string) => {
    setSession(prev => ({
      ...prev,
      selectedSuspect: suspectId
    }));
  }, []);

  // Add a question
  const addQuestion = useCallback(() => {
    setSession(prev => ({
      ...prev,
      questionsAsked: prev.questionsAsked + 1
    }));
  }, []);

  // Add a revealed clue
  const addClue = useCallback((clue: string) => {
    setSession(prev => ({
      ...prev,
      cluesRevealed: [...prev.cluesRevealed, clue]
    }));
  }, []);

  // Complete the case
  const completeCase = useCallback((isCorrect: boolean) => {
    const endTime = new Date();
    
    setSession(prev => ({
      ...prev,
      isCorrect,
      endTime
    }));

    if (isCorrect && session.currentCase) {
      const level = session.currentCase.level;
      
      setProgress(prev => {
        const newCompletedLevels = prev.completedLevels.includes(level) 
          ? prev.completedLevels 
          : [...prev.completedLevels, level];
        
        // Unlock next mystery level or debate level
        const newUnlockedLevels = [...prev.unlockedLevels];
        if (level < 3 && !prev.unlockedLevels.includes(level + 1)) {
          newUnlockedLevels.push(level + 1);
        } else if (level === 3 && !prev.unlockedLevels.includes(4)) {
          // Unlock debate level after completing Level 3
          newUnlockedLevels.push(4);
        }
        
        const newProgress = {
          ...prev,
          completedLevels: newCompletedLevels,
          unlockedLevels: newUnlockedLevels,
          allLevelsCompleted: newCompletedLevels.length >= 3 // All 3 mystery levels completed
        };
        
        saveProgress(newProgress);
        return newProgress;
      });
    }
  }, [session.currentCase, saveProgress]);

  // Reset current session
  const resetSession = useCallback(() => {
    setSession({
      currentCase: null,
      selectedSuspect: null,
      questionsAsked: 0,
      maxQuestions: 3,
      cluesRevealed: [],
      isCorrect: null,
      startTime: null,
      endTime: null
    });
    
    setProgress(prev => ({
      ...prev,
      currentLevel: null
    }));
  }, []);

  // Start debate mode
  const startDebate = useCallback((topic: string) => {
    setDebate({
      isActive: true,
      topic,
      userArguments: [],
      oracleResponses: [],
      currentScore: 0,
      maxScore: 100
    });
  }, []);

  // Add debate argument
  const addDebateArgument = useCallback((userArgument: string, oracleResponse: string, scoreChange: number) => {
    setDebate(prev => ({
      ...prev,
      userArguments: [...prev.userArguments, userArgument],
      oracleResponses: [...prev.oracleResponses, oracleResponse],
      currentScore: Math.max(0, Math.min(prev.maxScore, prev.currentScore + scoreChange))
    }));
  }, []);

  // End debate
  const endDebate = useCallback(() => {
    setDebate({
      isActive: false,
      topic: '',
      userArguments: [],
      oracleResponses: [],
      currentScore: 0,
      maxScore: 100
    });
  }, []);

  // Check if level is unlocked
  const isLevelUnlocked = useCallback((level: number) => {
    return progress.unlockedLevels.includes(level);
  }, [progress.unlockedLevels]);

  // Check if level is completed
  const isLevelCompleted = useCallback((level: number) => {
    return progress.completedLevels.includes(level);
  }, [progress.completedLevels]);

  // Get session statistics
  const getSessionStats = useCallback(() => {
    if (!session.startTime || !session.endTime) return null;
    
    const duration = session.endTime.getTime() - session.startTime.getTime();
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    
    return {
      duration: `${minutes}:${seconds.toString().padStart(2, '0')}`,
      questionsUsed: session.questionsAsked,
      questionsRemaining: session.maxQuestions - session.questionsAsked,
      cluesFound: session.cluesRevealed.length,
      accuracy: session.isCorrect ? 100 : 0,
      efficiency: Math.round((session.maxQuestions - session.questionsAsked) / session.maxQuestions * 100)
    };
  }, [session]);

  return {
    // State
    progress,
    session,
    debate,
    
    // Actions
    startCase,
    selectSuspect,
    addQuestion,
    addClue,
    completeCase,
    resetSession,
    startDebate,
    addDebateArgument,
    endDebate,
    
    // Utilities
    isLevelUnlocked,
    isLevelCompleted,
    getSessionStats
  };
}