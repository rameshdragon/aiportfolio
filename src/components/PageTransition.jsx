import { motion, AnimatePresence } from 'framer-motion'

const variants = {
  initial: (dir) => ({ opacity: 0, x: dir > 0 ? 80 : -80, scale: 0.97 }),
  animate: { opacity: 1, x: 0, scale: 1 },
  exit: (dir) => ({ opacity: 0, x: dir > 0 ? -80 : 80, scale: 0.97 }),
}

export default function PageTransition({ pageKey, direction, children }) {
  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={pageKey}
        custom={direction}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
        style={{ position: 'absolute', inset: 0 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
