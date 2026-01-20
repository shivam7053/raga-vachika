import { motion } from "framer-motion";

export default function BackgroundAnimation() {
  return (
    <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-orange-50 dark:from-blue-950 dark:via-gray-900 dark:to-black opacity-80" />

      {/* Animated Orbs */}
      <motion.div
        className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] bg-sky-300/40 dark:bg-blue-600/20 rounded-full blur-[100px]"
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute top-[20%] -right-[10%] w-[40vw] h-[40vw] bg-orange-300/40 dark:bg-indigo-600/20 rounded-full blur-[100px]"
        animate={{
          x: [0, -100, 0],
          y: [0, 100, 0],
          scale: [1, 1.1, 1],
          rotate: [0, -60, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute -bottom-[10%] left-[20%] w-[60vw] h-[60vw] bg-sky-200/40 dark:bg-blue-800/20 rounded-full blur-[120px]"
        animate={{
          x: [0, 50, 0],
          y: [0, -50, 0],
          scale: [1, 1.3, 1],
          rotate: [0, 45, 0],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}