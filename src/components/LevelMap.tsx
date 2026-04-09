import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { FogOverlay } from './FogOverlay';
import WebGLOrb from './WebGLOrb';
import GradientText from './GradientText';
import DecryptedText from './DecryptedText';
import { MURDER_CASES } from '@/data/cases';

interface LevelMapProps {
  unlockedLevels: number[];
  completedLevels: number[];
  onSelectLevel: (level: number) => void;
}

export function LevelMap({ unlockedLevels, completedLevels, onSelectLevel }: LevelMapProps) {
  const mysteryLevels = MURDER_CASES.map(c => ({
    level: c.level,
    title: c.title,
    subtitle: c.subtitle,
    type: 'mystery' as const
  }));

  // Add the debate level as the 4th and final level
  const allLevels = [
    ...mysteryLevels,
    { 
      level: 4, 
      title: 'DEBATE THE ORACLE', 
      subtitle: 'The ultimate intellectual challenge',
      type: 'debate' as const
    }
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      {/* Dark gradient background */}
      <div 
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 100%, 
            hsl(270 20% 10%) 0%, 
            hsl(240 10% 4%) 100%)`,
        }}
      />

      <FogOverlay intensity="heavy" />

      {/* Title */}
      <motion.div
        className="relative z-10 pt-16 pb-8 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <GradientText
          colors={['#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE', '#EDE9FE']}
          animationSpeed={5}
          className="font-cinzel text-4xl md:text-5xl tracking-wider"
        >
          The Path of Truth
        </GradientText>
        <div className="mt-4 font-crimson text-lg text-muted-foreground italic">
          <DecryptedText
            text="Each shadow hides a story. Each story hides a killer."
            animateOn="view"
            sequential={true}
            revealDirection="center"
            speed={100}
            characters="!@#$%^&*()_+-=[]{}|;:,.<>?"
            className="text-muted-foreground"
            encryptedClassName="text-muted-foreground/30"
          />
        </div>
      </motion.div>

      {/* Level nodes */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-4 py-12">
        {allLevels.map((level, index) => {
          const isUnlocked = unlockedLevels.includes(level.level);
          const isCompleted = completedLevels.includes(level.level);
          const isLeft = index % 2 === 0;

          return (
            <motion.div
              key={level.level}
              className={`flex items-center gap-6 ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'} flex-col md:w-[600px]`}
              initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
            >
              {/* Connecting line */}
              {index > 0 && (
                <div 
                  className="hidden md:block absolute h-16 w-px bg-gradient-to-b from-muted/50 to-transparent"
                  style={{ 
                    top: `${index * 140 + 60}px`,
                    left: '50%',
                  }}
                />
              )}

              {/* Level node */}
              <motion.button
                onClick={() => isUnlocked && onSelectLevel(level.level)}
                disabled={!isUnlocked}
                className={`
                  relative group flex items-center justify-center
                  w-20 h-20 rounded-full
                  transition-all duration-500
                  ${isUnlocked 
                    ? 'cursor-pointer' 
                    : 'cursor-not-allowed'}
                `}
                whileHover={isUnlocked ? { scale: 1.1 } : {}}
                whileTap={isUnlocked ? { scale: 0.95 } : {}}
              >
                {/* Glow effect for unlocked */}
                {isUnlocked && (
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: isCompleted
                        ? 'radial-gradient(circle, hsl(43 80% 55% / 0.4) 0%, transparent 70%)'
                        : level.type === 'debate'
                        ? 'radial-gradient(circle, hsl(280 80% 55% / 0.4) 0%, transparent 70%)'
                        : 'radial-gradient(circle, hsl(0 70% 32% / 0.4) 0%, transparent 70%)',
                      boxShadow: isCompleted
                        ? '0 0 40px hsl(43 80% 55% / 0.3)'
                        : level.type === 'debate'
                        ? '0 0 40px hsl(280 80% 55% / 0.3)'
                        : '0 0 40px hsl(0 70% 32% / 0.3)',
                    }}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                )}

                {/* Three crowns for debate level */}
                {level.type === 'debate' && isUnlocked && (
                  <div className="absolute -top-8 flex space-x-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="text-yellow-400"
                        animate={{
                          y: [0, -2, 0],
                          rotate: [0, 5, 0],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                      >
                        👑
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Node circle - WebGL Orb */}
                <div className="relative z-10 w-16 h-16">
                  {isUnlocked ? (
                    <WebGLOrb
                      hue={level.type === 'debate' ? 270 : isCompleted ? 45 : 200}
                      hoverIntensity={0.4}
                      rotateOnHover={true}
                      forceHoverState={false}
                      backgroundColor="rgba(0, 0, 0, 0)"
                      style={{
                        width: '100%',
                        height: '100%',
                      }}
                    />
                  ) : (
                    <div className="w-full h-full rounded-full border-2 border-muted/30 bg-muted/10 flex items-center justify-center">
                      <Lock className="w-6 h-6 text-muted-foreground/50" />
                    </div>
                  )}
                  
                  {/* Level number/icon overlay */}
                  {isUnlocked && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      {level.type === 'debate' ? (
                        <span className="text-2xl drop-shadow-lg">🧠</span>
                      ) : (
                        <span className={`font-cinzel text-xl font-bold drop-shadow-lg ${isCompleted ? 'text-yellow-300' : 'text-white'}`}>
                          {level.level}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </motion.button>

              {/* Level info */}
              <div className={`text-center md:text-left ${!isLeft && 'md:text-right'}`}>
                <h3 className={`font-cinzel text-lg ${isUnlocked ? 'text-foreground' : 'text-muted-foreground/50'}`}>
                  {level.title}
                </h3>
                <p className={`font-crimson text-sm italic ${isUnlocked ? 'text-muted-foreground' : 'text-muted-foreground/30'}`}>
                  {isUnlocked ? level.subtitle : 'This truth is not yet revealed...'}
                </p>
                {isCompleted && (
                  <span className="inline-block mt-1 px-2 py-0.5 text-xs font-cinzel bg-accent/20 text-accent rounded">
                    SOLVED
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
