import { motion } from 'framer-motion';

interface OrbProps {
  size?: 'small' | 'medium' | 'large';
  speaking?: boolean;
  dimmed?: boolean;
  className?: string;
}

const sizeClasses = {
  small: 'w-24 h-24',
  medium: 'w-40 h-40',
  large: 'w-64 h-64',
};

const glowSizes = {
  small: 'w-32 h-32',
  medium: 'w-56 h-56',
  large: 'w-80 h-80',
};

export function Orb({ size = 'large', speaking = false, dimmed = false, className = '' }: OrbProps) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Outer glow layer */}
      <motion.div
        className={`absolute ${glowSizes[size]} rounded-full bg-gradient-radial from-orb-glow/30 via-orb-glow/10 to-transparent`}
        animate={{
          scale: speaking ? [1, 1.15, 1] : [1, 1.08, 1],
          opacity: dimmed ? 0.3 : speaking ? [0.6, 1, 0.6] : [0.5, 0.7, 0.5],
        }}
        transition={{
          duration: speaking ? 1.5 : 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Middle glow ring */}
      <motion.div
        className={`absolute ${sizeClasses[size]} rounded-full`}
        style={{
          background: 'radial-gradient(circle, hsl(43 90% 70% / 0.4) 0%, hsl(43 80% 55% / 0.2) 50%, transparent 70%)',
          boxShadow: dimmed 
            ? '0 0 30px hsl(43 80% 55% / 0.2)' 
            : '0 0 60px hsl(43 80% 55% / 0.4), 0 0 120px hsl(43 80% 55% / 0.2)',
        }}
        animate={{
          scale: speaking ? [1, 1.1, 1] : [1, 1.05, 1],
        }}
        transition={{
          duration: speaking ? 1 : 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Core orb */}
      <motion.div
        className={`relative ${sizeClasses[size]} rounded-full overflow-hidden`}
        style={{
          background: `radial-gradient(circle at 30% 30%, 
            hsl(43 95% 85%) 0%, 
            hsl(43 90% 70%) 20%, 
            hsl(43 80% 55%) 50%, 
            hsl(35 70% 40%) 80%, 
            hsl(30 60% 30%) 100%)`,
          boxShadow: dimmed
            ? 'inset 0 0 40px hsl(43 90% 80% / 0.3)'
            : 'inset 0 0 60px hsl(43 90% 80% / 0.5), 0 0 40px hsl(43 80% 55% / 0.5)',
        }}
        animate={{
          scale: speaking ? [1, 1.03, 1] : 1,
          filter: dimmed 
            ? 'brightness(0.5)' 
            : speaking 
              ? ['brightness(1)', 'brightness(1.2)', 'brightness(1)']
              : 'brightness(1)',
        }}
        transition={{
          duration: speaking ? 0.8 : 2,
          repeat: speaking ? Infinity : 0,
          ease: 'easeInOut',
        }}
      >
        {/* Inner light refraction */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at 70% 70%, 
              transparent 0%, 
              hsl(43 90% 70% / 0.2) 50%, 
              transparent 70%)`,
          }}
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Mystical swirl effect */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: `conic-gradient(
              from 0deg,
              transparent 0%,
              hsl(43 80% 70% / 0.15) 25%,
              transparent 50%,
              hsl(43 80% 70% / 0.15) 75%,
              transparent 100%
            )`,
          }}
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </motion.div>

      {/* Particle effects when speaking */}
      {speaking && (
        <>
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-orb-core"
              initial={{
                opacity: 0,
                scale: 0,
                x: 0,
                y: 0,
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                x: [0, Math.cos((i * 60 * Math.PI) / 180) * 100],
                y: [0, Math.sin((i * 60 * Math.PI) / 180) * 100],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
                ease: 'easeOut',
              }}
            />
          ))}
        </>
      )}
    </div>
  );
}
