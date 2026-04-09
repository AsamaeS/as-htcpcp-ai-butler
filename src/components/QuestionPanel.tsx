import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Message {
  id: string;
  type: 'player' | 'orb';
  text: string;
}

interface QuestionPanelProps {
  questionsRemaining: number;
  messages: Message[];
  onAskQuestion: (question: string) => void;
  isProcessing: boolean;
  onProceedToAccusation: () => void;
}

export function QuestionPanel({
  questionsRemaining,
  messages,
  onAskQuestion,
  isProcessing,
  onProceedToAccusation,
}: QuestionPanelProps) {
  const [question, setQuestion] = useState('');
  const [isMuted, setIsMuted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim() && questionsRemaining > 0 && !isProcessing) {
      onAskQuestion(question.trim());
      setQuestion('');
    }
  };

  const canAsk = questionsRemaining > 0 && !isProcessing;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
        <div>
          <h3 className="font-cinzel text-lg text-foreground">Interrogation</h3>
          <p className="font-crimson text-sm text-muted-foreground">
            {questionsRemaining > 0 
              ? `${questionsRemaining} question${questionsRemaining !== 1 ? 's' : ''} remaining`
              : 'No questions remain'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <div className="flex gap-1">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                  n <= questionsRemaining ? 'bg-accent' : 'bg-muted/30'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <AnimatePresence mode="popLayout">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className={`flex ${message.type === 'player' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`
                  max-w-[85%] rounded-lg px-4 py-3
                  ${message.type === 'player'
                    ? 'bg-secondary text-secondary-foreground'
                    : 'bg-card border border-accent/30 text-card-foreground'}
                `}
              >
                {message.type === 'orb' && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 rounded-full bg-gradient-radial from-orb-core to-orb-glow" />
                    <span className="font-cinzel text-xs text-accent">The Orb</span>
                  </div>
                )}
                <p className={`font-crimson ${message.type === 'orb' ? 'italic' : ''}`}>
                  {message.text}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-card border border-accent/30 rounded-lg px-4 py-3">
              <div className="flex items-center gap-2">
                <motion.div
                  className="w-4 h-4 rounded-full bg-gradient-radial from-orb-core to-orb-glow"
                  animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <span className="font-crimson text-sm text-muted-foreground italic">
                  The orb contemplates...
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input area */}
      <div className="p-6 border-t border-border/50">
        {questionsRemaining > 0 ? (
          <form onSubmit={handleSubmit} className="flex gap-3">
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask your question..."
              disabled={!canAsk}
              className="flex-1 bg-input border-border text-foreground placeholder:text-muted-foreground font-crimson"
            />
            <Button
              type="submit"
              disabled={!canAsk || !question.trim()}
              className="px-4"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        ) : (
          <div className="text-center">
            <p className="font-crimson text-muted-foreground mb-4">
              You have exhausted your questions. The time has come to name the guilty.
            </p>
            <Button onClick={onProceedToAccusation} variant="destructive" className="font-cinzel">
              Make Your Accusation
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
