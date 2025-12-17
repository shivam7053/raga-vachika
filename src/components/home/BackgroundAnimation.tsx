"use client";

import { motion } from "framer-motion";
import { Box, useTheme } from "@mui/material";

export default function BackgroundAnimation() {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  // Define gradients for both light and dark themes
  const backgroundGradient = isDarkMode
    ? `linear-gradient(to right, #0A1929, #001E3C, #FF7A00)` // Dark Blue -> Deeper Blue -> Orange
    : `linear-gradient(to right, #E3F2FD, #BBDEFB, #FFB74D)`; // Sky Blue -> Lighter Blue -> Orange

  return (
    <Box
      component={motion.div}
      animate={{
        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"], // Animates the gradient position
      }}
      transition={{
        duration: 15,
        ease: "linear",
        repeat: Infinity,
      }}
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: backgroundGradient,
        backgroundSize: "400% 400%",
        opacity: isDarkMode ? 0.15 : 0.4, // Adjust opacity for each theme
        filter: "blur(80px)", // Large blur for a soft, diffused look
        zIndex: 0,
      }}
    />
  );
}