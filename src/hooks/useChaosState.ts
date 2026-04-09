import { useState, useCallback, useEffect } from 'react';

export interface ChaosMetrics {
  disappointmentIndex: number; // 0 to 100
  originalityScore: number;    // 100 to 0
  engagementFailure: number;   // 0 to 100
  chaosLevel: number;          // 0.0 to 1.0, calculates the current mood
}

interface QuestionHistory {
  id: string;
  text: string;
  timestamp: Date;
  ignored: boolean;
}

export function useChaosState() {
  const [questionsTotal, setQuestionsTotal] = useState(0);
  const [repeatedQuestions, setRepeatedQuestions] = useState(0);
  const [engagementFailure, setEngagementFailure] = useState(0);
  const [history, setHistory] = useState<QuestionHistory[]>([]);
  const [lastInteractionTime, setLastInteractionTime] = useState<Date>(new Date());

  // Engagement Failure Timer (silence punisher)
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const secondsSinceLastInteraction = (now.getTime() - lastInteractionTime.getTime()) / 1000;
      
      if (secondsSinceLastInteraction > 15) { // Punish if idle for > 15s
        setEngagementFailure(prev => Math.min(100, prev + 2)); // Increment by 2 every 5s
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [lastInteractionTime]);

  const recordQuestion = useCallback((question: string): { isRepeat: boolean, exactMatch?: QuestionHistory } => {
    const normalizedQuestion = question.toLowerCase().trim();
    
    // Check for "Butler Remembers You" logic
    // We check if the exact or very similar question was asked before.
    const matchingQuery = history.find(h => {
      const hText = h.text.toLowerCase().trim();
      // Simple similarity or exact match
      return hText === normalizedQuestion || hText.includes(normalizedQuestion) && normalizedQuestion.length > 10;
    });

    const isRepeat = !!matchingQuery;

    if (isRepeat) {
      setRepeatedQuestions(prev => prev + 1);
    }

    setQuestionsTotal(prev => prev + 1);
    setLastInteractionTime(new Date());

    setHistory(prev => [...prev, {
      id: Date.now().toString(),
      text: question,
      timestamp: new Date(),
      ignored: false
    }]);

    return { isRepeat, exactMatch: matchingQuery };
  }, [history]);

  const markQuestionIgnored = useCallback((id: string) => {
    setHistory(prev => prev.map(h => h.id === id ? { ...h, ignored: true } : h));
  }, []);

  // Calculate metrics
  // Disappointment goes up the more you talk to it
  const disappointmentIndex = Math.min(100, questionsTotal * 10);
  
  // Originality goes down when you repeat things
  const maxRepeats = 5;
  const originalityScore = Math.max(0, 100 - (repeatedQuestions / maxRepeats) * 100);

  // Chaos level: 0.0 to 1.0. A weighted blend of all frustrations.
  const rawChaos = (disappointmentIndex * 0.4) + ((100 - originalityScore) * 0.4) + (engagementFailure * 0.2);
  const chaosLevel = Math.min(1.0, rawChaos / 100);

  const resetMetrics = useCallback(() => {
    setQuestionsTotal(0);
    setRepeatedQuestions(0);
    setEngagementFailure(0);
    setHistory([]);
    setLastInteractionTime(new Date());
  }, []);

  return {
    metrics: {
      disappointmentIndex,
      originalityScore,
      engagementFailure,
      chaosLevel
    },
    history,
    recordQuestion,
    markQuestionIgnored,
    resetMetrics
  };
}
