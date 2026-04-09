import { motion } from 'framer-motion';

interface FogOverlayProps {
  intensity?: 'light' | 'medium' | 'heavy';
  className?: string;
}

export function FogOverlay({ intensity = 'medium', className = '' }: FogOverlayProps) {
  const opacityMap = {
    light: 0.15,
    medium: 0.25,
    heavy: 0.4,
  };

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      {/* Bottom fog layer */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-1/3"
        style={{
          background: `linear-gradient(to top, 
            hsl(260 10% 20% / ${opacityMap[intensity]}) 0%, 
            transparent 100%)`,
        }}
        animate={{
          opacity: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Drifting fog 1 */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 80% 40% at 20% 80%, 
            hsl(260 10% 30% / ${opacityMap[intensity] * 0.6}) 0%, 
            transparent 70%)`,
        }}
        animate={{
          x: ['-10%', '10%', '-10%'],
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Drifting fog 2 */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 60% 30% at 80% 70%, 
            hsl(270 15% 25% / ${opacityMap[intensity] * 0.5}) 0%, 
            transparent 60%)`,
        }}
        animate={{
          x: ['5%', '-15%', '5%'],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
      />

      {/* Top vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 100% 100% at 50% 50%, 
            transparent 30%, 
            hsl(240 10% 4% / 0.6) 100%)`,
        }}
      />

      {/* Subtle particles */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-fog/30"
          style={{
            left: `${10 + (i * 7) % 80}%`,
            top: `${20 + (i * 11) % 60}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: 8 + (i % 4),
            repeat: Infinity,
            delay: i * 0.5,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
