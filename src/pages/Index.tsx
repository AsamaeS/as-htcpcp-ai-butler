import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ButlerOrb } from '@/components/ButlerOrb';
import { FakeMetrics } from '@/components/FakeMetrics';
import { MetricsStream } from '@/components/MetricsStream';
import { Cinematic418 } from '@/components/Cinematic418';
import { Coffee, Settings, Volume2, ShieldAlert } from 'lucide-react';
import { VoiceSettings } from '@/components/VoiceSettings';
import { useChaosState } from '@/hooks/useChaosState';
import { voiceManager } from '@/services/voiceInteraction';

interface LogEntry {
  id: string;
  timestamp: Date;
  message: string;
  type: 'info' | 'warn' | 'error' | 'critical';
}

const HackathonButler = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [systemLogs, setSystemLogs] = useState<LogEntry[]>([]);
  const [is418Active, setIs418Active] = useState(false);
  const [orbEmotion, setOrbEmotion] = useState('mysterious');
  
  // Dynamic Background and Mouse Effects
  const [bgIndex, setBgIndex] = useState(1);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const bgInterval = setInterval(() => {
      setBgIndex(prev => prev >= 3 ? 1 : prev + 1);
    }, 10000);
    return () => clearInterval(bgInterval);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  }, []);
  
  const { metrics, history, recordQuestion } = useChaosState();

  const addSysLog = useCallback((msg: string, type: LogEntry['type'] = 'info') => {
    setSystemLogs(prev => [...prev, {
      id: Date.now().toString() + Math.random().toString(),
      timestamp: new Date(),
      message: msg,
      type
    }]);
  }, []);

  // Initial greeting log
  useEffect(() => {
    addSysLog("AS' HTCPCP AI Butler System Initialized.", "info");
    addSysLog("Protocol: HTTP/418. Ready to judge human requests.", "warn");
  }, [addSysLog]);

  const handleBrewClick = useCallback(() => {
    addSysLog("UNAUTHORIZED COFFEE REQUEST DETECTED.", "critical");
    setIs418Active(true);
  }, [addSysLog]);

  const handleQuestionAsked = useCallback(async (question: string) => {
    addSysLog(`User Input Received: "${question.substring(0, 20)}..."`, "info");
    
    const { isRepeat, exactMatch } = recordQuestion(question);
    if (isRepeat) {
      addSysLog(`WARNING: Originality compromised. Query repeated.`, "warn");
    }

    try {
      addSysLog("Routing to Chaos Engine...", "info");
      
      const response = await voiceManager.processVoiceQuestion(
        question, 
        metrics.chaosLevel, 
        isRepeat, 
        exactMatch ? exactMatch.ignored : false
      );
      
      setOrbEmotion(response.emotion);

      if (response.wasRefused) {
        addSysLog("Response blocked by Refusal Engine.", "critical");
      } else if (response.wasContradicted) {
        addSysLog("Response manipulated by Contradiction Engine.", "warn");
      }

    } catch (err) {
      addSysLog("System API Failure.", "error");
    }
  }, [addSysLog, metrics.chaosLevel, recordQuestion]);

  return (
    <div 
      className="min-h-screen text-foreground overflow-hidden font-mono flex flex-col justify-between relative bg-black"
      onMouseMove={handleMouseMove}
    >
      {/* Background Slideshow Layer */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-[2000ms] ease-in-out opacity-40 mix-blend-screen"
        style={{ backgroundImage: `url('/bg${bgIndex}.png')` }}
      />
      
      {/* Interactive Mouse Glow Layer */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none transition-opacity duration-300 ease-out"
        style={{ 
          background: `radial-gradient(circle 600px at ${mousePos.x}px ${mousePos.y}px, rgba(220, 38, 38, 0.15), transparent 80%)`
        }} 
      />

      <VoiceSettings 
        isOpen={showVoiceSettings} 
        onClose={() => setShowVoiceSettings(false)} 
      />

      <Cinematic418 isActive={is418Active} onClose={() => setIs418Active(false)} />

      {/* Header */}
      <header className="p-4 border-b border-red-900/30 flex justify-between items-center bg-black/80 z-10">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
          <h1 className="text-xl font-bold tracking-tighter text-red-500 uppercase">
            AS' HTCPCP AI Butler™
          </h1>
          <div className="hidden md:flex bg-red-950/40 border border-red-900/50 px-3 py-1 rounded-full items-center gap-2 text-xs ml-4">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <span className="text-red-400">Mode: Passive-Aggressive Butler</span>
          </div>
        </div>
        <div className="flex gap-4">
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(220, 38, 38, 0.2)' }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBrewClick}
            className="flex items-center gap-2 px-4 py-2 border border-red-800 text-red-500 rounded bg-red-950/20 hover:text-red-400 transition-colors"
          >
            <Coffee size={16} />
            <span className="text-xs uppercase tracking-widest hidden sm:inline">Brew Coffee</span>
          </motion.button>
          
          <motion.button
            onClick={() => setShowVoiceSettings(true)}
            className="p-2 border border-red-900/50 rounded bg-black text-red-600 hover:text-red-400"
          >
            <Settings className="w-5 h-5" />
          </motion.button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:flex-row relative z-0">
        
        {/* Left Side: Orb & Interface */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
          {/* Subtle Ominous Background - Replaced by global mouse glow */}
          
          <div className="relative z-10 w-full max-w-lg mb-8 scale-110 flex justify-center">
             <ButlerOrb
                emotion={orbEmotion}
                onQuestionAsked={handleQuestionAsked}
              />
          </div>

          <div className="absolute bottom-8 left-8 right-8 text-center text-red-900/40 text-xs tracking-widest uppercase">
            Chaos Orchestrator Core V1.4
          </div>
        </div>

        {/* Right Side: The Dashboard */}
        <div 
          className="w-full md:w-[400px] border-l border-red-900/30 flex flex-col bg-black/90 shadow-[0_0_50px_rgba(220,38,38,0.1)] relative z-10"
          style={{
             transform: `perspective(1000px) rotateX(${(mousePos.y - (typeof window !== 'undefined' ? window.innerHeight / 2 : 0)) * -0.015}deg) rotateY(${(mousePos.x - (typeof window !== 'undefined' ? window.innerWidth / 2 : 0)) * 0.015}deg)`,
             transition: 'transform 0.1s ease-out'
          }}
        >
          
          <div className="p-4 border-b border-red-900/30">
            <h2 className="text-red-500/80 uppercase text-xs tracking-[0.2em] mb-4 flex items-center justify-between">
              <span>Threat Diagnostics</span>
              <span className="text-[9px] bg-red-950 px-2 py-0.5 rounded border border-red-900/50 text-red-400">LIVE</span>
            </h2>
            <FakeMetrics {...metrics} />
          </div>

          <div className="p-4 flex-1 flex flex-col">
            <MetricsStream logs={systemLogs} />
          </div>

        </div>

      </main>
      
      {/* Moving button effect applied via generic CSS trick or inside InteractiveOrb later */}

    </div>
  );
};

export default HackathonButler;