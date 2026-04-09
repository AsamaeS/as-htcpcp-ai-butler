/**
 * Oracle Debate Mode Component
 * AI-powered voice debate system with mystical UI
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Send, 
  Trophy, 
  Brain, 
  Target, 
  Zap,
  ArrowLeft,
  Sparkles,
  Mic,
  MicOff,
  Volume2,
  VolumeX
} from 'lucide-react';
import { generateDebateResponse, scoreDebateArgument } from '@/services/debateEngine';
import { generateSpeech } from '@/services/elevenlabs';
import { audioManager } from '@/services/audioManager';
import { FogOverlay } from './FogOverlay';
import TextType from './TextType';

// Type declaration for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface DebateMessage {
  id: string;
  type: 'user' | 'oracle';
  content: string;
  timestamp: Date;
  score?: number;
  feedback?: string;
  categories?: {
    clarity: number;
    logic: number;
    evidence: number;
    persuasiveness: number;
  };
}

interface DebateStats {
  totalArguments: number;
  averageScore: number;
  bestArgument: number;
  categoryAverages: {
    clarity: number;
    logic: number;
    evidence: number;
    persuasiveness: number;
  };
  overallGrade: string;
}

interface DebateProps {
  onBack: () => void;
}

export function DebateMode({ onBack }: DebateProps) {
  const [topic, setTopic] = useState('');
  const [currentArgument, setCurrentArgument] = useState('');
  const [messages, setMessages] = useState<DebateMessage[]>([]);
  const [isDebateStarted, setIsDebateStarted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [turnCount, setTurnCount] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Clean up audio on component unmount
  useEffect(() => {
    return () => {
      audioManager.stopCurrentAudio();
    };
  }, []);

  // Calculate sophisticated debate statistics
  const calculateDebateStats = (): DebateStats => {
    const userMessages = messages.filter(msg => msg.type === 'user' && msg.score !== undefined);
    
    if (userMessages.length === 0) {
      return {
        totalArguments: 0,
        averageScore: 0,
        bestArgument: 0,
        categoryAverages: { clarity: 0, logic: 0, evidence: 0, persuasiveness: 0 },
        overallGrade: 'No arguments yet'
      };
    }

    const totalScore = userMessages.reduce((sum, msg) => sum + (msg.score || 0), 0);
    const averageScore = totalScore / userMessages.length;
    const bestArgument = Math.max(...userMessages.map(msg => msg.score || 0));

    // Calculate category averages
    const categoryTotals = { clarity: 0, logic: 0, evidence: 0, persuasiveness: 0 };
    let categoryCount = 0;

    userMessages.forEach(msg => {
      if (msg.categories) {
        categoryTotals.clarity += msg.categories.clarity;
        categoryTotals.logic += msg.categories.logic;
        categoryTotals.evidence += msg.categories.evidence;
        categoryTotals.persuasiveness += msg.categories.persuasiveness;
        categoryCount++;
      }
    });

    const categoryAverages = {
      clarity: categoryCount > 0 ? categoryTotals.clarity / categoryCount : 0,
      logic: categoryCount > 0 ? categoryTotals.logic / categoryCount : 0,
      evidence: categoryCount > 0 ? categoryTotals.evidence / categoryCount : 0,
      persuasiveness: categoryCount > 0 ? categoryTotals.persuasiveness / categoryCount : 0,
    };

    // Determine overall grade
    let overallGrade = 'Novice Debater';
    if (averageScore >= 16) overallGrade = 'Master Debater';
    else if (averageScore >= 13) overallGrade = 'Expert Debater';
    else if (averageScore >= 10) overallGrade = 'Skilled Debater';
    else if (averageScore >= 7) overallGrade = 'Developing Debater';

    return {
      totalArguments: userMessages.length,
      averageScore,
      bestArgument,
      categoryAverages,
      overallGrade
    };
  };

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';
      
      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setCurrentArgument(transcript);
        setIsListening(false);
      };
      
      recognitionInstance.onerror = () => {
        setIsListening(false);
      };
      
      recognitionInstance.onend = () => {
        setIsListening(false);
      };
      
      setRecognition(recognitionInstance);
    }
  }, []);

  // Add spacebar push-to-talk functionality
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space' && !event.repeat && !isProcessing && !isSpeaking) {
        // Only activate if not typing in textarea
        const activeElement = document.activeElement;
        if (activeElement?.tagName !== 'TEXTAREA' && activeElement?.tagName !== 'INPUT') {
          event.preventDefault();
          if (!isListening && recognition) {
            setIsListening(true);
            recognition.start();
          }
        }
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === 'Space' && isListening) {
        event.preventDefault();
        if (recognition) {
          recognition.stop();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [isListening, isProcessing, isSpeaking, recognition]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const startListening = () => {
    if (recognition && !isListening) {
      setIsListening(true);
      recognition.start();
    }
  };

  const stopListening = () => {
    if (recognition && isListening) {
      recognition.stop();
      setIsListening(false);
    }
  };

  const playOracleResponse = async (text: string) => {
    try {
      setIsSpeaking(true);
      console.log('[Debate] 🎵 Starting Oracle TTS for:', text.substring(0, 50) + '...');
      
      // Stop any currently playing audio
      audioManager.stopCurrentAudio();
      setCurrentAudio(null);
      
      const audioBuffer = await generateSpeech(text, undefined, { emotion: 'mysterious', intensity: 0.8 });
      console.log('[Debate] 🎵 Generated audio buffer:', audioBuffer.byteLength, 'bytes');
      
      if (audioBuffer.byteLength > 0) {
        const audioUrl = audioManager.createAudioUrl(audioBuffer);
        
        try {
          const audio = await audioManager.playAudio(audioUrl);
          setCurrentAudio(audio);
          
          audio.onended = () => {
            console.log('[Debate] 🎵 Audio playback ended');
            setIsSpeaking(false);
            audioManager.cleanupAudioUrl(audioUrl);
            setCurrentAudio(null);
          };
          
          audio.onerror = (error) => {
            console.error('[Debate] ❌ Audio playback error:', error);
            setIsSpeaking(false);
            audioManager.cleanupAudioUrl(audioUrl);
            setCurrentAudio(null);
          };
          
          console.log('[Debate] ✅ Audio playback started successfully');
        } catch (playError) {
          console.error('[Debate] ❌ Audio play failed:', playError);
          audioManager.cleanupAudioUrl(audioUrl);
          setIsSpeaking(false);
        }
      } else {
        console.warn('[Debate] ⚠️ Empty audio buffer received');
        setIsSpeaking(false);
      }
    } catch (error) {
      console.error('[Debate] ❌ Oracle speech failed:', error);
      setIsSpeaking(false);
    }
  };

  const stopAudio = () => {
    audioManager.stopCurrentAudio();
    setCurrentAudio(null);
    setIsSpeaking(false);
  };

  const startDebate = async () => {
    if (!topic.trim()) return;
    
    setIsDebateStarted(true);
    setMessages([]);
    setTurnCount(0);
    
    // Oracle's opening statement
    const openingMessage: DebateMessage = {
      id: `oracle-${Date.now()}`,
      type: 'oracle',
      content: `Welcome to the Debate Chamber. I am the ORACLE, and I shall challenge your every assertion about "${topic}". Present your opening argument, mortal, and prepare to defend your position with logic and evidence. I will not be easily convinced.`,
      timestamp: new Date()
    };
    
    setMessages([openingMessage]);
    
    // Speak the opening message
    await playOracleResponse(openingMessage.content);
  };

  const submitArgument = async () => {
    if (!currentArgument.trim() || isProcessing) return;
    
    setIsProcessing(true);
    
    // Add user message
    const userMessage: DebateMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: currentArgument,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    try {
      // Get Oracle response and score the user's argument
      const [oracleResponse, argumentScore] = await Promise.all([
        generateDebateResponse(topic, currentArgument, messages),
        scoreDebateArgument(currentArgument, topic, turnCount)
      ]);
      
      // Add Oracle response
      const oracleMessage: DebateMessage = {
        id: `oracle-${Date.now()}`,
        type: 'oracle',
        content: oracleResponse.content,
        timestamp: new Date()
      };
      
      // Update user message with detailed score
      const scoredUserMessage: DebateMessage = {
        ...userMessage,
        score: argumentScore.score,
        feedback: argumentScore.feedback,
        categories: argumentScore.categories
      };
      
      setMessages(prev => [
        ...prev.slice(0, -1), // Remove the unscored user message
        scoredUserMessage,
        oracleMessage
      ]);
      
      // Update turn count
      setTurnCount(prev => prev + 1);
      
      // Speak Oracle's response
      await playOracleResponse(oracleMessage.content);
      
    } catch (error) {
      console.error('Debate error:', error);
      
      // Fallback Oracle response
      const fallbackMessage: DebateMessage = {
        id: `oracle-${Date.now()}`,
        type: 'oracle',
        content: "Your argument is noted, but I require more substantial evidence to be swayed. The burden of proof remains upon you.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, fallbackMessage]);
      await playOracleResponse(fallbackMessage.content);
    }
    
    setCurrentArgument('');
    setIsProcessing(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Weak';
  };

  if (!isDebateStarted) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Dark gradient background matching the game */}
        <div 
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 80% 60% at 50% 100%, 
              hsl(270 20% 10%) 0%, 
              hsl(240 10% 4%) 100%)`,
          }}
        />
        
        <FogOverlay intensity="medium" />
        
        <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl"
          >
            {/* Back Button */}
            <motion.button
              onClick={onBack}
              className="absolute top-6 left-6 z-20 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              whileHover={{ x: -4 }}
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-crimson">Return</span>
            </motion.button>

            <Card className="bg-gray-900/80 border-purple-500/30 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <motion.div 
                    className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center"
                    animate={{
                      boxShadow: [
                        '0 0 20px rgba(139, 92, 246, 0.3)',
                        '0 0 40px rgba(139, 92, 246, 0.5)',
                        '0 0 20px rgba(139, 92, 246, 0.3)'
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Sparkles className="h-10 w-10 text-white" />
                  </motion.div>
                </div>
                <CardTitle className="text-3xl text-white mb-2 font-cinzel">
                  Enter the Debate with the ORACLE
                </CardTitle>
                <p className="text-gray-300 font-crimson">
                  Challenge the ancient AI in intellectual combat. Choose any topic and defend your position with voice or text.
                </p>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 font-crimson">
                    Choose Your Debate Topic
                  </label>
                  <Input
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., 'Should we be vegan?' or 'Is AI beneficial to humanity?'"
                    className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 font-crimson"
                    onKeyPress={(e) => e.key === 'Enter' && startDebate()}
                  />
                </div>
                
                <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700/50">
                  <h4 className="text-white font-medium mb-2 font-cinzel">The Oracle's Challenge:</h4>
                  <ul className="text-sm text-gray-300 space-y-1 font-crimson">
                    <li>• Speak your arguments aloud or type them</li>
                    <li>• The ORACLE will respond with mystical voice</li>
                    <li>• Your arguments are scored on logic and persuasiveness</li>
                    <li>• Defend your stance against the ancient wisdom</li>
                  </ul>
                </div>
                
                <Button
                  onClick={startDebate}
                  disabled={!topic.trim()}
                  className="w-full bg-purple-600 hover:bg-purple-700 font-cinzel text-lg py-6"
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Begin the Debate
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Dark gradient background matching the game */}
      <div 
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 100%, 
            hsl(270 20% 10%) 0%, 
            hsl(240 10% 4%) 100%)`,
        }}
      />
      
      <FogOverlay intensity="light" />
      
      <div className="relative z-10 min-h-screen flex flex-col p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <motion.button
            onClick={onBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            whileHover={{ x: -4 }}
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-crimson">Return to Map</span>
          </motion.button>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white font-cinzel">Debate: {topic}</h1>
            <p className="text-gray-300 font-crimson">Turn {turnCount} • Arguing against the ORACLE</p>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-400 font-crimson">Overall Grade</div>
            <div className="text-lg font-bold text-purple-400 font-cinzel">
              {calculateDebateStats().overallGrade}
            </div>
          </div>
        </div>

        {/* Main Content - Better Layout */}
        <div className="flex-1 flex gap-4 min-h-0">
          {/* Chat Area - Takes more space */}
          <div className="flex-1 flex flex-col min-h-0" style={{ flex: '1 1 70%' }}>
            <Card className="flex-1 bg-gray-900/80 border-purple-500/30 backdrop-blur-sm flex flex-col min-h-0">
              <CardHeader className="pb-3 flex-shrink-0">
                <CardTitle className="text-white flex items-center font-cinzel">
                  <Brain className="mr-2 h-5 w-5 text-purple-400" />
                  The Oracle's Chamber
                  {isSpeaking && (
                    <motion.div
                      className="ml-2 flex items-center text-purple-400"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <Volume2 className="h-4 w-4 mr-1" />
                      <span className="text-xs font-crimson">Oracle Speaking...</span>
                    </motion.div>
                  )}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col min-h-0 p-0">
                {/* Messages - Better height calculation */}
                <div 
                  ref={messagesContainerRef}
                  className="flex-1 overflow-y-auto px-6 py-4 space-y-4 min-h-0"
                  style={{ 
                    height: 'calc(100vh - 350px)',
                    scrollBehavior: 'smooth'
                  }}
                >
                  <AnimatePresence>
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[85%] ${
                          message.type === 'user' 
                            ? 'bg-purple-600/80 text-white border border-purple-500/50' 
                            : 'bg-gray-800/80 text-gray-100 border border-gray-700/50'
                        } rounded-lg p-4 backdrop-blur-sm`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm font-cinzel">
                              {message.type === 'user' ? 'You' : 'ORACLE'}
                            </span>
                            <span className="text-xs opacity-70 font-crimson">
                              {message.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          
                          {message.type === 'oracle' ? (
                            <TextType
                              text={message.content}
                              as="p"
                              typingSpeed={30}
                              className="text-sm leading-relaxed font-crimson"
                              showCursor={false}
                              loop={false}
                              startOnVisible={true}
                            />
                          ) : (
                            <p className="text-sm leading-relaxed font-crimson">{message.content}</p>
                          )}
                          
                          {message.score !== undefined && (
                            <div className="mt-3 pt-3 border-t border-purple-400/30">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-purple-200 font-crimson">Argument Score:</span>
                                <Badge 
                                  variant="secondary" 
                                  className={`${getScoreColor(message.score)} bg-transparent border font-crimson`}
                                >
                                  {message.score}/20 points
                                </Badge>
                              </div>
                              {message.categories && (
                                <div className="grid grid-cols-2 gap-1 text-xs text-purple-200 mb-2">
                                  <div>Clarity: {message.categories.clarity}/5</div>
                                  <div>Logic: {message.categories.logic}/5</div>
                                  <div>Evidence: {message.categories.evidence}/5</div>
                                  <div>Persuasion: {message.categories.persuasiveness}/5</div>
                                </div>
                              )}
                              {message.feedback && (
                                <p className="text-xs text-purple-200 font-crimson">{message.feedback}</p>
                              )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {/* Scroll anchor */}
                  <div ref={messagesEndRef} />
                </div>
                
                {/* Input Area */}
                <div className="flex-shrink-0 p-6 pt-4 border-t border-gray-700/50 bg-gray-900/50">
                  <div className="flex space-x-3 items-end">
                    <div className="flex-1">
                      <Textarea
                        value={currentArgument}
                        onChange={(e) => setCurrentArgument(e.target.value)}
                        placeholder="Present your argument... (or hold SPACEBAR to speak)"
                        className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 resize-none font-crimson"
                        rows={3}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            submitArgument();
                          }
                        }}
                      />
                    </div>
                    
                    {/* Voice Controls */}
                    <div className="flex flex-col space-y-2">
                      {recognition && (
                        <Button
                          onClick={isListening ? stopListening : startListening}
                          disabled={isProcessing || isSpeaking}
                          variant={isListening ? "destructive" : "outline"}
                          size="sm"
                          className={`${isListening ? 'bg-red-600 hover:bg-red-700' : 'border-gray-600 text-gray-300 hover:bg-gray-800'}`}
                        >
                          {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                        </Button>
                      )}
                      
                      {isSpeaking && (
                        <Button
                          onClick={stopAudio}
                          variant="outline"
                          size="sm"
                          className="border-gray-600 text-gray-300 hover:bg-gray-800"
                        >
                          <VolumeX className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <Button
                        onClick={submitArgument}
                        disabled={!currentArgument.trim() || isProcessing}
                        className="bg-purple-600 hover:bg-purple-700"
                        size="sm"
                      >
                        {isProcessing ? (
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Voice Status */}
                  {isListening && (
                    <motion.p 
                      className="text-green-400 text-sm mt-2 font-crimson animate-pulse"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      🎤 Listening... Speak your argument clearly (or release SPACEBAR)
                    </motion.p>
                  )}
                  
                  {/* Push-to-talk hint */}
                  {!isListening && !isProcessing && !isSpeaking && (
                    <p className="text-gray-400 text-xs mt-2 font-crimson">
                      💡 Hold SPACEBAR to speak, or click the microphone button
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats Panel - Smaller but still visible */}
          <div className="w-72 space-y-4" style={{ flex: '0 0 300px' }}>
            {(() => {
              const stats = calculateDebateStats();
              return (
                <>
                  {/* Performance Overview */}
                  <Card className="bg-gray-900/80 border-purple-500/30 backdrop-blur-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-white text-lg flex items-center font-cinzel">
                        <Target className="mr-2 h-4 w-4" />
                        Performance Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-400 font-cinzel">
                          {stats.overallGrade}
                        </div>
                        <div className="text-sm text-gray-400 font-crimson">Current Ranking</div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400 font-crimson">Arguments Made</span>
                          <span className="text-white font-cinzel">{stats.totalArguments}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400 font-crimson">Average Score</span>
                          <span className="text-white font-cinzel">
                            {stats.averageScore.toFixed(1)}/20
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400 font-crimson">Best Argument</span>
                          <span className="text-white font-cinzel">{stats.bestArgument}/20</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Category Breakdown */}
                  <Card className="bg-gray-900/80 border-purple-500/30 backdrop-blur-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-white text-lg flex items-center font-cinzel">
                        <Brain className="mr-2 h-4 w-4" />
                        Skill Breakdown
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {Object.entries(stats.categoryAverages).map(([category, score]) => (
                        <div key={category} className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-400 font-crimson capitalize">{category}</span>
                            <span className="text-white font-cinzel">{score.toFixed(1)}/5</span>
                          </div>
                          <Progress value={(score / 5) * 100} className="h-2" />
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Achievement */}
                  {stats.averageScore >= 16 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <Card className="bg-gradient-to-br from-yellow-600 to-orange-600 border-yellow-500">
                        <CardContent className="p-4 text-center">
                          <Trophy className="h-8 w-8 text-white mx-auto mb-2" />
                          <p className="text-white font-bold font-cinzel">Master Debater!</p>
                          <p className="text-yellow-100 text-xs font-crimson">
                            You have impressed the Oracle
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}

                  {/* Tips */}
                  <Card className="bg-gray-900/80 border-purple-500/30 backdrop-blur-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-white text-lg flex items-center font-cinzel">
                        <Zap className="mr-2 h-4 w-4" />
                        Debate Tips
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm text-gray-300 space-y-2 font-crimson">
                        <li>• Use specific examples and evidence</li>
                        <li>• Address counterarguments directly</li>
                        <li>• Structure your logic clearly</li>
                        <li>• Stay focused on the topic</li>
                        <li>• Be persuasive but respectful</li>
                      </ul>
                    </CardContent>
                  </Card>
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}