import React from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// Curtain wipe & page scale transition variant
const pageVariants = {
  initial: {
    opacity: 0,
    scale: 0.96,
    y: 20,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
      delay: 0.2,
    },
  },
  exit: {
    opacity: 0,
    scale: 1.03,
    y: -20,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

// Top & bottom curtain slide animation
const curtainTopVariants = {
  initial: { scaleY: 1 },
  animate: {
    scaleY: 0,
    transition: { duration: 0.6, ease: [0.87, 0, 0.13, 1] },
  },
  exit: {
    scaleY: 1,
    transition: { duration: 0.5, ease: [0.87, 0, 0.13, 1] },
  },
};

const curtainBottomVariants = {
  initial: { scaleY: 1 },
  animate: {
    scaleY: 0,
    transition: { duration: 0.6, ease: [0.87, 0, 0.13, 1] },
  },
  exit: {
    scaleY: 1,
    transition: { duration: 0.5, ease: [0.87, 0, 0.13, 1] },
  },
};

const PageTransition = ({ children }) => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div key={location.pathname} className="relative w-full">
        {/* Animated Top Curtain Wipe */}
        <motion.div
          variants={curtainTopVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          style={{ originY: 0 }}
          className="fixed top-0 left-0 w-full h-1/2 bg-gradient-to-b from-yellow-600 via-yellow-700 to-black z-50 pointer-events-none"
        />

        {/* Animated Bottom Curtain Wipe */}
        <motion.div
          variants={curtainBottomVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          style={{ originY: 1 }}
          className="fixed bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-yellow-600 via-yellow-700 to-black z-50 pointer-events-none"
        />

        {/* Page Content Animation */}
        <motion.div
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition;
