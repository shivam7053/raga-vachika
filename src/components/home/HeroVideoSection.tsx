"use client";

import React from "react";
import { motion } from "framer-motion";
import { Box, Chip, Container, Typography, useTheme } from "@mui/material";

const subjects = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "History",
  "Geography",
  "Machine Learning",
  "Computer Science",
  "Civics",
  "Economics",
];

export default function HeroVideoSection() {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        height: "90vh",
        width: "100%",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        color: "white",
      }}
    >
      <video
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
        src="/hero-back.mp4"
        autoPlay
        muted
        loop
        playsInline
      ></video>

      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundColor: isDarkMode ? "rgba(10, 25, 41, 0.7)" : "rgba(13, 71, 161, 0.6)", // Darker overlay for light theme for contrast
        }}
      />

      <Container
        maxWidth="md"
        sx={{ position: "relative", zIndex: 10, color: "white" }}
      >
        <Typography
          component={motion.h1}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          variant="h2"
          sx={{ fontWeight: "bold", mb: 2, textShadow: "2px 2px 8px rgba(0,0,0,0.6)" }}
        >
          Welcome to <span style={{ color: "#FF7A00" }}>Raga Vachika</span>
        </Typography>

        <Typography
          component={motion.p}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          variant="h5"
          color={isDarkMode ? "grey.200" : "grey.100"}
        >
          Education Reimagined for Grades 5-12.
        </Typography>
      </Container>

      <Box sx={{ position: "absolute", bottom: 48, width: "100%", overflow: "hidden" }}>
        <motion.div
          style={{ display: "flex", gap: "24px", whiteSpace: "nowrap" }}
          animate={{ x: ["0%", "-100%"] }}
          transition={{
            repeat: Infinity,
            ease: "linear",
            duration: 30,
          }}
        >
          {[...subjects, ...subjects].map((subject, index) => (
            <Chip
              key={index}
              label={subject}
              sx={{
                color: "white",
                fontSize: "1rem",
                fontWeight: "medium",
                backgroundColor: "rgba(255, 122, 0, 0.2)",
                border: "1px solid rgba(255, 122, 0, 0.4)",
                py: 2.5,
                px: 1.5,
                backdropFilter: "blur(4px)",
              }}
            />
          ))}
        </motion.div>
      </Box>

      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          width: "100%",
          height: 80,
          background: `linear-gradient(to top, ${theme.palette.background.default}, transparent)`,
        }}
      />
    </Box>
  );
}
