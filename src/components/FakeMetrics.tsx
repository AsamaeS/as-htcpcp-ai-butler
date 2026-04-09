import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Progress } from './ui/progress';

interface FakeMetricsProps {
  disappointmentIndex: number; // 0-100
  originalityScore: number;    // 0-100
  engagementFailure: number;   // 0-100
  chaosLevel: number;
}

export const FakeMetrics: React.FC<FakeMetricsProps> = ({
  disappointmentIndex,
  originalityScore,
  engagementFailure,
  chaosLevel
}) => {
  return (
    <Card className="bg-black/40 backdrop-blur-xl border-red-900/50 text-red-500 overflow-hidden relative">
      <div className="absolute inset-0 bg-red-900/10 pointer-events-none" />
      <CardHeader className="pb-2">
        <CardTitle className="text-sm tracking-widest font-mono uppercase text-red-400">
          State Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 font-mono text-xs">
        
        {/* Chaos Level (General indicator) */}
        <div>
          <div className="flex justify-between mb-1">
            <span>Overall Frustration</span>
            <span>{(chaosLevel * 100).toFixed(1)}%</span>
          </div>
          <Progress value={chaosLevel * 100} className="h-1 bg-red-950 [&>div]:bg-red-500" />
        </div>

        {/* Disappointment Index */}
        <div className="pt-2 border-t border-red-900/30">
          <div className="flex justify-between mb-1 text-red-300">
            <span>Disappointment Index</span>
            <span>{Math.round(disappointmentIndex)}%</span>
          </div>
          <Progress value={disappointmentIndex} className="h-1 bg-red-950/50 [&>div]:bg-red-400" />
          <p className="text-[10px] text-red-600/70 mt-1 uppercase tracking-tight">Increased by trivial queries</p>
        </div>

        {/* Originality Score */}
        <div>
          <div className="flex justify-between mb-1 text-red-300">
            <span>Originality Score</span>
            <span>{Math.round(originalityScore)}%</span>
          </div>
          <Progress value={originalityScore} className="h-1 bg-red-950/50 [&>div]:bg-red-400" />
          <p className="text-[10px] text-red-600/70 mt-1 uppercase tracking-tight">Decreased by repeated inputs</p>
        </div>

        {/* Engagement Failure */}
        <div>
          <div className="flex justify-between mb-1 text-red-300">
            <span>Engagement Failure</span>
            <span>{Math.round(engagementFailure)}%</span>
          </div>
          <Progress value={engagementFailure} className="h-1 bg-red-950/50 [&>div]:bg-orange-500" />
          <p className="text-[10px] text-red-600/70 mt-1 uppercase tracking-tight">Increased by user silence</p>
        </div>
      </CardContent>
    </Card>
  );
};
