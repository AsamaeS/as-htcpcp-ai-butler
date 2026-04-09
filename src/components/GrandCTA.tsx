/**
 * Grand CTA Component
 * Displays after all 3 levels are completed
 */

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Crown, 
  Sparkles, 
  MessageCircle, 
  Trophy,
  Star,
  Zap
} from 'lucide-react';

interface GrandCTAProps {
  onEnterDebate: () => void;
  completedLevels: number[];
  totalScore?: number;
}

export function GrandCTA({ onEnterDebate, completedLevels, totalScore }: GrandCTAProps) {
  const allLevelsCompleted = completedLevels.length >= 3;
  
  if (!allLevelsCompleted) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 z-50"
    >
      <motion.div
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="w-full max-w-2xl"
      >
        <Card className="bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 border-2 border-purple-400/50 shadow-2xl">
          <CardContent className="p-8 text-center">
            {/* Achievement Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-6"
            >
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <Crown className="h-16 w-16 text-yellow-400" />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-2 -right-2"
                  >
                    <Sparkles className="h-6 w-6 text-yellow-300" />
                  </motion.div>
                </div>
              </div>
              
              <h1 className="text-4xl font-bold text-white mb-2">
                Congratulations, Master Detective!
              </h1>
              
              <p className="text-xl text-purple-200">
                You have solved all three murder mysteries
              </p>
            </motion.div>

            {/* Achievement Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="grid grid-cols-3 gap-4 mb-8"
            >
              <div className="bg-black/30 rounded-lg p-4">
                <Trophy className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{completedLevels.length}</div>
                <div className="text-sm text-gray-300">Cases Solved</div>
              </div>
              
              <div className="bg-black/30 rounded-lg p-4">
                <Star className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">100%</div>
                <div className="text-sm text-gray-300">Completion</div>
              </div>
              
              <div className="bg-black/30 rounded-lg p-4">
                <Zap className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">Expert</div>
                <div className="text-sm text-gray-300">Detective Rank</div>
              </div>
            </motion.div>

            {/* Achievement Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="flex justify-center space-x-2 mb-8"
            >
              <Badge variant="secondary" className="bg-yellow-600 text-white">
                🕵️ Master Detective
              </Badge>
              <Badge variant="secondary" className="bg-purple-600 text-white">
                🧩 Mystery Solver
              </Badge>
              <Badge variant="secondary" className="bg-blue-600 text-white">
                🎯 Perfect Accuracy
              </Badge>
            </motion.div>

            {/* Unlock Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="bg-gradient-to-r from-purple-800/50 to-indigo-800/50 rounded-lg p-6 mb-8"
            >
              <h3 className="text-xl font-bold text-white mb-3">
                🔓 New Challenge Unlocked
              </h3>
              <p className="text-purple-200 leading-relaxed">
                Your exceptional detective skills have earned you the right to face the ultimate challenge. 
                The ancient ORACLE awaits to test your intellect in philosophical debate. 
                Choose any topic and defend your position against this supremely intelligent entity.
              </p>
            </motion.div>

            {/* Grand CTA Button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.3, duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={onEnterDebate}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-12 py-6 text-xl font-bold shadow-lg transform transition-all duration-300"
              >
                <MessageCircle className="mr-3 h-6 w-6" />
                Enter the Debate with the ORACLE
                <Sparkles className="ml-3 h-6 w-6" />
              </Button>
            </motion.div>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="text-sm text-gray-400 mt-4"
            >
              Prove your intellectual prowess in the ultimate challenge
            </motion.p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}