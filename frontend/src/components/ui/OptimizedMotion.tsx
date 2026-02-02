import { motion, type MotionProps } from 'framer-motion'

// Optimized motion components with reduced re-renders
export const OptimizedMotion = {
  // Fade in animation - lightweight
  FadeIn: ({ children, ...props }: MotionProps) => (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      {children}
    </motion.div>
  ),

  // Slide up animation - lightweight
  SlideUp: ({ children, ...props }: MotionProps) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      {...props}
    >
      {children}
    </motion.div>
  ),

  // Scale animation - lightweight
  Scale: ({ children, ...props }: MotionProps) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Simple animation variants for better performance
export const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
}

export const slideUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}
