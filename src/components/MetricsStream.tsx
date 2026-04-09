import React, { useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Terminal } from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: Date;
  message: string;
  type: 'info' | 'warn' | 'error' | 'critical';
}

interface MetricsStreamProps {
  logs: LogEntry[];
}

export const MetricsStream: React.FC<MetricsStreamProps> = ({ logs }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  const getColor = (type: LogEntry['type']) => {
    switch(type) {
      case 'info': return 'text-green-500';
      case 'warn': return 'text-yellow-500';
      case 'error': return 'text-orange-500';
      case 'critical': return 'text-red-500 font-bold';
      default: return 'text-gray-500';
    }
  };

  return (
    <Card className="bg-black/60 backdrop-blur-md border-red-900/30 text-green-500 h-64 flex flex-col">
      <CardHeader className="py-2 px-3 border-b border-red-900/30 bg-black/40">
        <CardTitle className="text-[10px] tracking-widest font-mono uppercase text-red-500/70 flex items-center gap-2">
          <Terminal size={12} />
          System Log Stream
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0 relative">
        <div 
          ref={containerRef}
          className="absolute inset-0 p-3 overflow-y-auto font-mono text-[11px] leading-tight flex flex-col gap-1 scrollbar-none"
        >
          {logs.map((log) => (
            <div key={log.id} className="flex gap-2">
              <span className="text-gray-600 shrink-0">
                [{log.timestamp.toISOString().split('T')[1].substring(0,8)}]
              </span>
              <span className={getColor(log.type)}>
                {log.message}
              </span>
            </div>
          ))}
          {logs.length === 0 && (
            <div className="text-gray-600 italic">Listening for system events...</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
