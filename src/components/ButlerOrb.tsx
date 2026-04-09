import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, VolumeX } from 'lucide-react';
import WebGLOrb from './WebGLOrb';
import DecryptedText from './DecryptedText';
import { voiceManager } from '@/services/voiceInteraction';

interface ButlerOrbProps {
  emotion: string;
  onQuestionAsked: (question: string) => void;
}

export function ButlerOrb({ emotion, onQuestionAsked }: ButlerOrbProps) {
  const [session, setSession] = useState(voiceManager.getSession());
  const [inputText, setInputText] = useState('');
  
  // Natively handle moving button punishment
  const [btnOffset, setBtnOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    voiceManager.onSessionUpdate = setSession;
    
    // We already do processVoiceQuestion in Index.tsx, so here we just listen for the transcript 
    // and pass it up.
    voiceManager.onTranscriptReceived = (transcript) => {
      onQuestionAsked(transcript);
      // We will let the parent (Index.tsx) call voiceManager.processVoiceQuestion 
      // because we need chaos metrics there.
    };

    return () => {
      voiceManager.onSessionUpdate = undefined;
      voiceManager.onTranscriptReceived = undefined;
    };
  }, [onQuestionAsked]);

  const handleMicClick = () => {
    if (session.isListening) {
      voiceManager.stopListening();
    } else {
      voiceManager.startListening();
    }
  };

  const handleStopAudio = () => {
    voiceManager.stopAudio();
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      // Partial text deletion punishment chance (10% chance)
      let finalSubmission = inputText.trim();
      if (Math.random() > 0.9) {
        const words = finalSubmission.split(' ');
        if (words.length > 2) {
           words.pop();
           finalSubmission = words.join(' ');
        }
      }

      onQuestionAsked(finalSubmission);
      setInputText('');
    }
  };

  const randomPunishMove = () => {
    // 20% chance to move the button when hovered
    if (Math.random() > 0.8) {
      setBtnOffset({
        x: (Math.random() - 0.5) * 60,
        y: (Math.random() - 0.5) * 60
      });
    }
  };

  const getOrbHue = () => {
    if (session.isListening) return 120; // Green
    if (session.isProcessing) return 60; // Yellow
    if (session.isSpeaking) {
      switch (emotion) {
        case 'angry': return 0; // Red
        case 'laughing': return 45; // Orange
        case 'whispering': return 270; // Purple
        case 'dramatic': return 200; // Blue
        default: return 0; // Red default for Butler
      }
    }
    return 0; // Resting Red
  };

  return (
    <div className="flex flex-col items-center space-y-6 w-full relative">
      <motion.div 
        className="relative w-64 h-64 md:w-80 md:h-80" 
      >
        <WebGLOrb
          hue={getOrbHue()}
          hoverIntensity={session.isSpeaking ? 0.8 : 0.4}
          rotateOnHover={true}
          forceHoverState={session.isSpeaking || session.isListening}
          backgroundColor="rgba(0, 0, 0, 0)"
          onClick={() => {}}
          style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
        />
        
        {session.isListening && (
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-green-500 pointer-events-none"
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}

        {session.isProcessing && (
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-yellow-500 pointer-events-none border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        )}
      </motion.div>

      <div className="text-center h-8 font-mono text-xs uppercase tracking-widest text-red-500/80">
        <AnimatePresence mode="wait">
          {session.isListening && <motion.span key="listen" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>Microphone Active...</motion.span>}
          {session.isProcessing && <motion.span key="process" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="text-yellow-500">Evaluating Query...</motion.span>}
          {session.isSpeaking && <motion.span key="speak" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>Transmitting Reply...</motion.span>}
        </AnimatePresence>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-sm relative z-50">
        <div className="flex gap-2 justify-center shrink-0">
          <Button
            onClick={handleMicClick}
            variant="outline"
            className={`flex items-center gap-2 border-red-900/50 hover:bg-red-950/30 text-red-500 ${session.isListening ? 'bg-green-900/30 border-green-500/50 text-green-400' : 'bg-black'}`}
          >
            {session.isListening ? <MicOff size={16} /> : <Mic size={16} />}
            {session.isListening ? 'Stop' : 'Speak'}
          </Button>

          {session.isSpeaking && (
            <Button
              onClick={handleStopAudio}
              variant="outline"
              className="flex items-center gap-2 bg-black border-red-900/50 text-red-500"
            >
              <VolumeX size={16} />
              Silence
            </Button>
          )}
        </div>

        <form onSubmit={handleTextSubmit} className="flex gap-2">
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={session.isProcessing || session.isSpeaking}
            placeholder="Interrogate the Butler..."
            className="flex-1 bg-black border border-red-900/50 rounded px-3 py-2 text-red-400 focus:outline-none focus:border-red-500 disabled:opacity-50 text-sm font-mono"
          />
          <motion.div animate={{ x: btnOffset.x, y: btnOffset.y }}>
            <Button 
                type="submit" 
                disabled={!inputText.trim() || session.isProcessing || session.isSpeaking}
                onMouseEnter={randomPunishMove}
                className="bg-red-950 text-red-400 border border-red-900/50 hover:bg-red-900/80 font-mono text-sm tracking-wider uppercase"
            >
                Submit
            </Button>
          </motion.div>
        </form>
      </div>
    </div>
  );
}
