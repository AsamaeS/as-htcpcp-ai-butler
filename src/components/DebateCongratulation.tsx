/**
 * Debate Congratulation Screen
 * Shows when player first accesses the debate after completing all 3 levels
 */

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Crown, Sparkles, Brain, Target, Zap } from 'lucide-react';
import { FogOverlay } from './FogOverlay';
import GradientText from './GradientText';

interface DebateCongratulationProps {
  onEnterDebate: () => void;
  completedLevels: number[];
}

export function DebateCongratulation({ onEnterDebate, completedLevels }: DebateCongratulationProps) {
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
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-4xl"
        >
          <Card className="bg-gray-900/90 border-purple-500/50 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              {/* Animated Crown */}
              <motion.div 
                className="flex justify-center mb-6"
                animate={{ 
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <div className="relative">
                  <Crown className="h-20 w-20 text-yellow-400" />
                  <motion.div
                    className="absolute -top-2 -right-2"
                    animate={{ 
                      rotate: [0, 360],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity
                    }}
                  >
                    <Sparkles className="h-8 w-8 text-purple-400" />
                  </motion.div>
                </div>
              </motion.div>

              <CardTitle className="text-4xl mb-4 font-cinzel">
                <GradientText
                  colors={['#FFD700', '#FFA500', '#FF6347', '#FF1493', '#8A2BE2']}
                  animationSpeed={4}
                >
                  Congratulations, Master Detective!
                </GradientText>
              </CardTitle>
              
              <p className="text-xl text-gray-300 font-crimson">
                You have solved all three murder mysteries and proven your deductive prowess
              </p>
            </CardHeader>
            
            <CardContent className="space-y-8">
              {/* Achievement Stats */}
              <div className="grid grid-cols-3 gap-6 text-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-2"
                >
                  <Trophy className="h-12 w-12 text-yellow-400 mx-auto" />
                  <div className="text-2xl font-bold text-white font-cinzel">{completedLevels.length}</div>
                  <div className="text-sm text-gray-400 font-crimson">Cases Solved</div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-2"
                >
                  <Target className="h-12 w-12 text-green-400 mx-auto" />
                  <div className="text-2xl font-bold text-white font-cinzel">100%</div>
                  <div className="text-sm text-gray-400 font-crimson">Completion Rate</div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="space-y-2"
                >
                  <Brain className="h-12 w-12 text-purple-400 mx-auto" />
                  <div className="text-2xl font-bold text-white font-cinzel">Expert</div>
                  <div className="text-sm text-gray-400 font-crimson">Detective Rank</div>
                </motion.div>
              </div>

              {/* Achievement Badges */}
              <div className="flex justify-center space-x-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 }}
                  className="px-4 py-2 bg-yellow-600/20 border border-yellow-500/30 rounded-full"
                >
                  <span className="text-yellow-400 font-cinzel text-sm">🏆 Master Detective</span>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.0 }}
                  className="px-4 py-2 bg-purple-600/20 border border-purple-500/30 rounded-full"
                >
                  <span className="text-purple-400 font-cinzel text-sm">🔍 Mystery Solver</span>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.2 }}
                  className="px-4 py-2 bg-green-600/20 border border-green-500/30 rounded-full"
                >
                  <span className="text-green-400 font-cinzel text-sm">⚡ Perfect Accuracy</span>
                </motion.div>
              </div>

              {/* New Challenge Unlocked */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4 }}
                className="bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border border-purple-500/30 rounded-lg p-6 text-center"
              >
                <div className="flex justify-center mb-4">
                  <motion.div
                    animate={{ 
                      rotate: [0, 360],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity
                    }}
                  >
                    <Brain className="h-12 w-12 text-purple-400" />
                  </motion.div>
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-2 font-cinzel">
                  🔓 New Challenge Unlocked
                </h3>
                <p className="text-gray-300 mb-4 font-crimson">
                  Your exceptional detective skills have earned you the right to face the ultimate challenge. 
                  The ancient ORACLE awaits to test your intellect in philosophical debate. Choose any 
                  topic and defend your position against this supremely intelligent entity.
                </p>
                
                <div className="bg-gray-800/50 p-4 rounded-lg mb-6">
                  <h4 className="text-white font-medium mb-2 font-cinzel">The Oracle's Challenge:</h4>
                  <ul className="text-sm text-gray-300 space-y-1 font-crimson">
                    <li>• Engage in voice or text debates on any topic</li>
                    <li>• Face an AI that challenges your every assertion</li>
                    <li>• Earn sophisticated scores on clarity, logic, evidence, and persuasiveness</li>
                    <li>• Prove your intellectual mastery against ancient wisdom</li>
                  </ul>
                </div>
              </motion.div>

              {/* Enter Debate Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.6 }}
                className="text-center"
              >
                <Button
                  onClick={onEnterDebate}
                  className="px-12 py-6 text-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 font-cinzel"
                  size="lg"
                >
                  <Brain className="mr-3 h-6 w-6" />
                  Enter the Debate with the ORACLE
                  <Sparkles className="ml-3 h-6 w-6" />
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}