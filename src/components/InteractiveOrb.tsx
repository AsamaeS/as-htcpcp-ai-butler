import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Mic, MicOff, Volume2, VolumeX, Skull } from 'lucide-react';
import { voicePipeline, type PipelineStatus, type VoiceQuestion } from '@/services/voicePipeline';
import WebGLOrb from './WebGLOrb';
import DecryptedText from './DecryptedText';
import type { MurderCase } from '@/data/cases';

interface InteractiveOrbProps {
  murderCase: MurderCase | null;
  onQuestionAsked?: (question: string) => void;
  onResponseReceived?: (response: string) => void;
  onComplete?: () => void;
  size?: 'small' | 'medium' | 'large';
}

export function InteractiveOrb({ 
  murderCase, 
  onQuestionAsked, 
  onResponseReceived, 
  onComplete,
  size = 'large' 
}: InteractiveOrbProps) {
  const [status, setStatus] = useState<PipelineStatus>(voicePipeline.getStatus());
  const [storyStarted, setStoryStarted] = useState(false);
  const [showSkipDialog, setShowSkipDialog] = useState(false);

  useEffect(() => {
    // Subscribe to pipeline status changes
    voicePipeline.onStateChange = setStatus;
    
    voicePipeline.onQuestionReceived = (question: VoiceQuestion) => {
      onQuestionAsked?.(question.text);
    };
    
    voicePipeline.onResponseReceived = (response: string, emotion: string) => {
      onResponseReceived?.(response);
    };

    return () => {
      voicePipeline.onStateChange = undefined;
      voicePipeline.onQuestionReceived = undefined;
      voicePipeline.onResponseReceived = undefined;
    };
  }, [onQuestionAsked, onResponseReceived]);

  // Separate effect to handle completion - only trigger when state changes to complete
  useEffect(() => {
    if (status.state === 'complete' && status.questionsRemaining === 0) {
      // Only trigger completion if we've actually started the story in this session
      if (storyStarted) {
        onComplete?.();
      }
    }
  }, [status.state, status.questionsRemaining, storyStarted, onComplete]);

  // Reset when case changes
  useEffect(() => {
    if (murderCase) {
      voicePipeline.reset();
      setStoryStarted(false);
    }
  }, [murderCase]);

  const handleOrbClick = async () => {
    if (!murderCase) return;

    if (!storyStarted) {
      // Start story narration
      setStoryStarted(true);
      await voicePipeline.startStoryNarration(murderCase);
    } else if (status.state === 'idle' && status.questionsRemaining > 0) {
      // Start voice capture for question
      voicePipeline.startVoiceCapture();
    }
  };

  const handleStopAudio = () => {
    voicePipeline.stopAudio();
  };

  const handleStopListening = () => {
    voicePipeline.stopVoiceCapture();
  };

  const handleSkipToAccusation = () => {
    setShowSkipDialog(true);
  };

  const handleConfirmSkip = () => {
    setShowSkipDialog(false);
    onComplete?.();
  };

  const handleCancelSkip = () => {
    setShowSkipDialog(false);
  };

  const getOrbSize = () => {
    switch (size) {
      case 'small': return { width: '120px', height: '120px' };
      case 'medium': return { width: '200px', height: '200px' };
      case 'large': return { width: '300px', height: '300px' };
      default: return { width: '300px', height: '300px' };
    }
  };

  const getOrbHue = () => {
    switch (status.state) {
      case 'narrating': return 270; // Purple
      case 'listening': return 120; // Green
      case 'processing': return 60; // Yellow
      case 'speaking': return 240; // Blue-purple
      case 'complete': return 300; // Magenta
      default: return 270; // Default purple
    }
  };

  const getHoverIntensity = () => {
    return status.isSpeaking ? 0.6 : 0.3;
  };

  const isClickable = !storyStarted || (status.state === 'idle' && status.questionsRemaining > 0);
  const isVoiceSupported = voicePipeline.isVoiceSupported();

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Main WebGL Orb */}
      <motion.div 
        className="relative" 
        style={getOrbSize()}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          type: "spring", 
          stiffness: 100, 
          damping: 15,
          duration: 1.2 
        }}
      >
        <WebGLOrb
          hue={getOrbHue()}
          hoverIntensity={getHoverIntensity()}
          rotateOnHover={true}
          forceHoverState={status.isSpeaking || status.isListening}
          backgroundColor="rgba(0, 0, 0, 0)"
          onClick={handleOrbClick}
          style={{
            width: '100%',
            height: '100%',
            cursor: isClickable ? 'pointer' : 'default',
          }}
        />

        {/* Listening indicator overlay */}
        {status.isListening && (
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-green-400 pointer-events-none"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}

        {/* Processing indicator overlay */}
        {status.state === 'processing' && (
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-yellow-400 pointer-events-none"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        )}

        {/* Voice support indicator */}
        {!isVoiceSupported && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
            <VolumeX className="w-3 h-3 text-white" />
          </div>
        )}
      </motion.div>

      {/* Status Display */}
      <div className="text-center space-y-2">
        <motion.div
          key={status.message}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-cinzel text-lg text-foreground"
        >
          <DecryptedText
            text={status.message}
            animateOn="view"
            sequential={true}
            revealDirection="center"
            speed={60}
            characters="!@#$%^&*()_+-=[]{}|;:,.<>?"
            className="text-foreground"
            encryptedClassName="text-foreground/50"
          />
        </motion.div>

        {status.questionsRemaining > 0 && storyStarted && (
          <p className="font-crimson text-sm text-muted-foreground">
            {status.questionsRemaining} questions remaining
          </p>
        )}

        {!isVoiceSupported && (
          <p className="font-crimson text-xs text-red-400">
            Voice features not supported in this browser
          </p>
        )}

        {status.isListening && (
          <p className="font-crimson text-xs text-green-400 animate-pulse">
            🎤 Speak now... (speak clearly and loudly)
          </p>
        )}
      </div>

      {/* Control Buttons */}
      {storyStarted && (
        <div className="flex gap-4 flex-wrap justify-center">
          {status.state === 'listening' && (
            <Button
              onClick={handleStopListening}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <MicOff className="w-4 h-4" />
              Stop Listening
            </Button>
          )}

          {(status.state === 'speaking' || status.state === 'narrating') && (
            <Button
              onClick={handleStopAudio}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <VolumeX className="w-4 h-4" />
              Stop Audio
            </Button>
          )}

          {status.state === 'idle' && status.questionsRemaining > 0 && (
            <Button
              onClick={handleOrbClick}
              variant="default"
              size="sm"
              className="flex items-center gap-2"
            >
              <Mic className="w-4 h-4" />
              Ask Question
            </Button>
          )}

          {/* Skip to Accusation Button - Available anytime after story starts */}
          <Button
            onClick={handleSkipToAccusation}
            variant="secondary"
            size="sm"
            className={`flex items-center gap-2 transition-all duration-300 ${
              status.questionsRemaining < 3 
                ? 'bg-amber-600/30 hover:bg-amber-600/40 border-amber-500/50 text-amber-100 shadow-lg' 
                : 'bg-amber-600/20 hover:bg-amber-600/30 border-amber-500/30 text-amber-200'
            }`}
          >
            <Skull className="w-4 h-4" />
            {status.questionsRemaining < 3 ? 'Ready to Accuse?' : 'Skip to Accusation'}
          </Button>
        </div>
      )}

      {/* Skip Confirmation Dialog */}
      <Dialog open={showSkipDialog} onOpenChange={setShowSkipDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Skull className="w-5 h-5 text-amber-500" />
              Skip to Accusation?
            </DialogTitle>
            <DialogDescription>
              {status.questionsRemaining === 3 
                ? "Are you sure you want to skip all questions and go directly to making your accusation? You might miss important clues that could help solve the mystery."
                : status.questionsRemaining === 0
                ? "You've used all your questions! Time to make your accusation based on what you've learned."
                : `You've asked ${3 - status.questionsRemaining} question${3 - status.questionsRemaining > 1 ? 's' : ''} so far. Are you ready to make your accusation, or do you want to ask the remaining ${status.questionsRemaining} question${status.questionsRemaining > 1 ? 's' : ''}?`
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button
              onClick={handleCancelSkip}
              variant="outline"
              className="flex-1"
            >
              {status.questionsRemaining === 0 ? 'Cancel' : 'Ask More Questions'}
            </Button>
            <Button
              onClick={handleConfirmSkip}
              variant="secondary"
              className="flex-1 bg-amber-600/20 hover:bg-amber-600/30 border-amber-500/30 text-amber-200"
            >
              {status.questionsRemaining === 0 ? 'Make Accusation' : 'Skip to Accusation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}