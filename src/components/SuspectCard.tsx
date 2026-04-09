import { motion } from 'framer-motion';
import type { Suspect } from '@/data/cases';

interface SuspectCardProps {
  suspect: Suspect;
  isSelected?: boolean;
  onClick?: () => void;
  revealed?: boolean;
  isMurderer?: boolean;
}

export function SuspectCard({ 
  suspect, 
  isSelected = false, 
  onClick, 
  revealed = false,
  isMurderer = false 
}: SuspectCardProps) {
  return (
    <motion.button
      onClick={onClick}
      className={`
        relative w-full max-w-[200px] overflow-hidden rounded-lg
        border-2 transition-all duration-300
        ${isSelected 
          ? 'border-primary shadow-[0_0_30px_hsl(var(--primary)/0.4)]' 
          : 'border-border/50 hover:border-border'}
        ${revealed && isMurderer 
          ? 'border-primary shadow-[0_0_40px_hsl(var(--primary)/0.5)]' 
          : ''}
        bg-card
      `}
      whileHover={{ scale: onClick ? 1.02 : 1 }}
      whileTap={{ scale: onClick ? 0.98 : 1 }}
    >
      {/* Silhouette / Portrait area */}
      <div 
        className="relative h-48 overflow-hidden"
        style={{
          background: `linear-gradient(180deg, 
            hsl(260 15% 12%) 0%, 
            hsl(260 15% 8%) 100%)`,
        }}
      >
        {/* Shadow silhouette */}
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={{
            background: `radial-gradient(ellipse 60% 80% at 50% 40%, 
              hsl(260 20% 18%) 0%, 
              transparent 70%)`,
          }}
        >
          <svg
            viewBox="0 0 100 120"
            className="w-32 h-40 opacity-40"
          >
            {/* Head */}
            <ellipse cx="50" cy="35" rx="25" ry="30" fill="currentColor" className="text-muted" />
            {/* Shoulders */}
            <path
              d="M10 120 Q25 80 50 75 Q75 80 90 120"
              fill="currentColor"
              className="text-muted"
            />
          </svg>
        </div>

        {/* Revealed overlay */}
        {revealed && isMurderer && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{
              background: 'radial-gradient(circle, hsl(0 70% 32% / 0.3) 0%, transparent 70%)',
            }}
          >
            <span className="font-cinzel text-2xl text-primary text-blood-glow">
              GUILTY
            </span>
          </motion.div>
        )}

        {/* Selection indicator */}
        {isSelected && !revealed && (
          <motion.div
            className="absolute inset-0 border-4 border-primary/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />
        )}
      </div>

      {/* Info section */}
      <div className="p-4 text-left">
        <h4 className="font-cinzel text-sm text-foreground leading-tight">
          {suspect.name}
        </h4>
        <p className="mt-1 font-crimson text-xs text-muted-foreground italic">
          {suspect.title}
        </p>
      </div>
    </motion.button>
  );
}
