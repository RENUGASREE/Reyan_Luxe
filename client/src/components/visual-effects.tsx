import { useEffect, useState } from 'react';
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";

// Floating particles effect component
export function FloatingParticles() {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; speed: number }>>([]);
  
  useEffect(() => {
    // Create random particles
    const particleCount = 15;
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 5 + 2,
      speed: Math.random() * 2 + 1
    }));
    
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className={`absolute rounded-full bg-primary/10`}
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, particle.id % 2 === 0 ? 15 : -15, 0],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 5 + particle.speed,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// Scroll reveal animation wrapper
export function ScrollReveal({ 
  children, 
  direction = "up", 
  delay = 0 
}: { 
  children: React.ReactNode; 
  direction?: "up" | "down" | "left" | "right"; 
  delay?: number;
}) {
  const getInitialPosition = () => {
    switch (direction) {
      case "up": return { y: 50, opacity: 0 };
      case "down": return { y: -50, opacity: 0 };
      case "left": return { x: 50, opacity: 0 };
      case "right": return { x: -50, opacity: 0 };
      default: return { y: 50, opacity: 0 };
    }
  };

  return (
    <motion.div
      initial={getInitialPosition()}
      whileInView={{ x: 0, y: 0, opacity: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

// Hover card effect
export function HoverCard({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  
  return (
    <motion.div
      className={`rounded-xl p-6 ${
        theme === 'dark' 
          ? 'bg-gray-800/50 shadow-lg shadow-primary/20' 
          : 'bg-white/90 shadow-lg shadow-gray-200/50'
      }`}
      whileHover={{ 
        scale: 1.02, 
        boxShadow: theme === 'dark' 
          ? '0 10px 30px -10px rgba(var(--primary), 0.3)' 
          : '0 10px 30px -10px rgba(0, 0, 0, 0.1)' 
      }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

// Gradient text effect
export function GradientText({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { theme } = useTheme();
  
  return (
    <span 
      className={`font-bold ${className} ${
        theme === 'dark'
          ? 'bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent'
          : 'bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent'
      }`}
    >
      {children}
    </span>
  );
}

// Page transition wrapper
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}