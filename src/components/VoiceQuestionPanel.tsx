import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, MicOff, Volume2, VolumeX, Send } from 'lucide-react';
import { voiceManager, type VoiceSession } from '@/services/voiceInteraction';
import { type CaseContext } from '@/services/gemini';

interface Message {
  id: string;
  type: 'player' | 'orb';
  text: string;
  timestamp: Date;
  isVoice?: boolean;
}

interface VoiceQuestionPanelProps {
  questionsRemaining: number;
  messages: Message[];
  onAskQuestion: (question: string) => void;
  isProcessing: boolean;
  onProceedToAccusation: () => void;
  caseContext?: CaseContext;
}

export function VoiceQuestionPanel({
  questionsRemaining,
  messages,
  onAskQuestion,
  isProcessing,
  onProceedToAccusation,
  caseContext,
}: VoiceQuestionPanelProps) {
  const [session, setSession] = useState<VoiceSession>(voiceManager.getSession());
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [isSupported] = useState(voiceManager.isSupported());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Set up voice manager event handlers
    voiceManager.onSessionUpdate = setSession;
    
    voiceManager.onTranscriptReceived = async (transcript, confidence) => {
      if (confidence > 0.7 && questionsRemaining > 0 && caseContext) {
        const gameState = {
          questionsAsked: 3 - questionsRemaining,
          maxQuestions: 3,
          previousQuestions: messages
            .filter(m => m.type === 'player')
            .map(m => m.text),
          revealedClues: []
        };
        
        // Add player message
        onAskQuestion(transcript);
        
        // Process with voice interaction
        await voiceManager.processVoiceQuestion(transcript, caseContext, gameState);
      }
    };

    voiceManager.onError = (error) => {
      console.error('Voice interaction error:', error);
      // Could show user-friendly error message
    };

    return () => {
      voiceManager.onSessionUpdate = undefined;
      voiceManager.onTranscriptReceived = undefined;
      voiceManager.onError = undefined;
    };
  }, [questionsRemaining, messages, caseContext, onAskQuestion]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleVoiceToggle = () => {
    if (session.isListening) {
      voiceManager.stopListening();
    } else {
      voiceManager.startListening();
    }
  };

  const handleTextSubmit = () => {
    if (textInput.trim() && questionsRemaining > 0) {
      onAskQuestion(textInput.trim());
      setTextInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTextSubmit();
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border/30">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-cinzel text-lg text-foreground">Interrogation</h3>
            <p className="text-sm text-muted-foreground">
              {questionsRemaining} questions remaining
            </p>
          </div>
          
          {isSupported && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVoiceMode(!isVoiceMode)}
                className={isVoiceMode ? 'text-accent' : 'text-muted-foreground'}
              >
                {isVoiceMode ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${message.type === 'player' ? 'justify-end' : 'justify-start'}`}
            >
              <Card className={`max-w-[80%] p-3 ${
                message.type === 'player' 
                  ? 'bg-primary/10 border-primary/20' 
                  : 'bg-card/50 border-border/30'
              }`}>
                <div className="flex items-start gap-2">
                  {message.type === 'orb' && (
                    <div className="w-6 h-6 rounded-full bg-accent/20 flex-shrink-0 mt-1" />
                  )}
                  <div className="flex-1">
                    <p className={`font-crimson ${
                      message.type === 'player' ? 'text-foreground' : 'text-foreground/90'
                    }`}>
                      {message.text}
                    </p>
                    {message.isVoice && (
                      <div className="flex items-center gap-1 mt-1">
                        <Volume2 className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Voice</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {(isProcessing || session.isProcessing) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <Card className="bg-card/50 border-border/30 p-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-accent/20 flex-shrink-0" />
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                  <div className="w-2 h-2 bg-accent rounded-full animate-pulse delay-100" />
                  <div className="w-2 h-2 bg-accent rounded-full animate-pulse delay-200" />
                </div>
              </div>
            </Card>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border/30">
        {questionsRemaining > 0 ? (
          <div className="space-y-3">
            {/* Voice Mode */}
            {isVoiceMode && isSupported ? (
              <div className="text-center">
                <motion.div
                  animate={session.isListening ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ repeat: session.isListening ? Infinity : 0, duration: 1 }}
                >
                  <Button
                    onClick={handleVoiceToggle}
                    disabled={session.isProcessing || isProcessing}
                    size="lg"
                    variant={session.isListening ? "destructive" : "default"}
                    className="w-16 h-16 rounded-full"
                  >
                    {session.isListening ? (
                      <MicOff className="w-6 h-6" />
                    ) : (
                      <Mic className="w-6 h-6" />
                    )}
                  </Button>
                </motion.div>
                
                <p className="mt-2 text-sm text-muted-foreground">
                  {session.isListening 
                    ? 'Listening... Speak your question'
                    : session.isProcessing 
                    ? 'Processing your question...'
                    : 'Tap to ask your question by voice'
                  }
                </p>
                
                {session.transcript && (
                  <p className="mt-1 text-sm text-foreground/70 italic">
                    "{session.transcript}"
                  </p>
                )}
              </div>
            ) : (
              /* Text Mode */
              <div className="flex gap-2">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your question for the ORB..."
                  disabled={isProcessing}
                  className="flex-1 px-3 py-2 bg-background border border-border/50 rounded-md 
                           text-foreground placeholder-muted-foreground
                           focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
                <Button
                  onClick={handleTextSubmit}
                  disabled={!textInput.trim() || isProcessing}
                  size="sm"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            )}
            
            {/* Mode Toggle */}
            {isSupported && (
              <div className="flex justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsVoiceMode(!isVoiceMode)}
                  className="text-xs text-muted-foreground"
                >
                  Switch to {isVoiceMode ? 'Text' : 'Voice'} Mode
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              You have used all your questions. Time to make your accusation.
            </p>
            <Button
              onClick={onProceedToAccusation}
              size="lg"
              className="font-cinzel"
            >
              Proceed to Accusation
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}