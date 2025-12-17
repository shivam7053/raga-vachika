"use client";

import { motion } from "framer-motion";
import { Box, Button, Container, Typography, useTheme } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import NextLink from "next/link";

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7 },
  },
};

const staggerChildren = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

export default function CTAFooter() {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  return (
    <Box
      component={motion.section}
      initial="initial"
      whileInView="animate"
      viewport={{ once: false, amount: 0.3 }}
      variants={staggerChildren}
      sx={{
        py: 10,
        bgcolor: isDarkMode ? "#0A1929" : "#E3F2FD", // Theme-aware background
        color: isDarkMode ? "white" : "#0D47A1", // Theme-aware text color
        textAlign: "center",
        position: "relative",
        zIndex: 10,
        overflow: "hidden",
      }}
    >
      <Container maxWidth="md">
        <Typography
          component={motion.h2}
          variants={fadeInUp}
          variant="h3"
          sx={{ fontWeight: "bold", mb: 2 }}
        >
          Raga Vachika: Education Reimagined
        </Typography>

        <Typography
          component={motion.p}
          variants={fadeInUp}
          variant="h6"
          color={isDarkMode ? "grey.300" : "text.secondary"} // Theme-aware subtitle color
          sx={{ mb: 4, fontWeight: "normal" }}
        >
          The perfect learning platform for students in grades 5 to 12.
        </Typography>

        <motion.div
          variants={fadeInUp}
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <Button
            component={NextLink}
            href="/courses"
            variant="contained"
            endIcon={<ArrowForwardIcon />}
            sx={{
              bgcolor: "#FF7A00", // Orange
              color: "white",
              borderRadius: "50px",
              py: 1.5,
              px: 4,
              fontSize: "1rem",
              fontWeight: "bold",
              "&:hover": {
                bgcolor: "#FF9933", // Lighter orange on hover
                boxShadow: "0px 8px 25px rgba(255, 122, 0, 0.5)",
              },
            }}
          >
            Explore Courses
          </Button>
        </motion.div>
      </Container>
    </Box>
  );
}
