"use client";

import { motion, Variants } from "framer-motion";
import NextLink from "next/link";
import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const fadeInLeft: Variants = {
  initial: { opacity: 0, x: -100 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

const fadeInRight: Variants = {
  initial: { opacity: 0, x: 100 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

const fadeInUp: Variants = {
  initial: { opacity: 0, y: 40 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" },
  },
};

const staggerChildren: Variants = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.15 },
  },
};

const learningSteps = [
  {
    title: "Interactive Video Lessons",
    desc: "Engaging content designed for deep understanding and retention, making learning fun and effective.",
  },
  {
    title: "Expert Teacher Support",
    desc: "Get your doubts cleared instantly by our team of experienced and dedicated educators.",
  },
  {
    title: "Practice Tests & Quizzes",
    desc: "Master concepts and prepare for exams with our extensive library of practice questions and mock tests.",
  },
];

export default function HeroSection() {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  return (
    <Box
      component={motion.section}
      initial="initial"
      animate="animate"
      variants={staggerChildren}
      sx={{
        pt: { xs: 12, md: 16 },
        pb: { xs: 10, md: 12 },
        bgcolor: isDarkMode ? "#0A1929" : "#E3F2FD",
        color: isDarkMode ? "white" : "#0D47A1",
        position: "relative",
        zIndex: 10,
        overflow: "hidden",
      }}
    >
      <Container maxWidth="lg">
        {/* MAIN GRID - TWO COLUMNS */}
        <Grid container spacing={6} alignItems="center">
          {/* LEFT COLUMN - Heading, Text, Button */}
          <Grid
            item
            xs={12}
            md={6}
            component={motion.div}
            variants={fadeInLeft}
          >
            <Box sx={{ textAlign: { xs: "center", md: "left" } }}>
              <Typography
                variant="h1"
                component="h1"
                sx={{
                  fontWeight: "bold",
                  mb: 3,
                  letterSpacing: "-1px",
                  fontSize: { xs: "2.5rem", md: "3.5rem" },
                }}
              >
                Your Path to <span style={{ color: "#FF7A00" }}>Academic Excellence</span>
              </Typography>

              <Typography
                variant="h6"
                sx={{
                  mb: 4,
                  color: isDarkMode ? "grey.300" : "text.secondary",
                  lineHeight: 1.6,
                  fontSize: { xs: "1rem", md: "1.15rem" },
                }}
              >
                Master your studies with personalized learning paths, interactive content, and expert guidance tailored to your success.
              </Typography>

              <motion.div variants={fadeInUp} whileHover={{ scale: 1.05 }}>
                <Button
                  component={NextLink}
                  href="/courses"
                  variant="contained"
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    bgcolor: "#FF7A00",
                    color: "white",
                    borderRadius: "50px",
                    px: 4,
                    py: 1.5,
                    fontSize: "1rem",
                    fontWeight: "bold",
                    "&:hover": {
                      bgcolor: "#FF9933",
                      boxShadow: "0px 8px 25px rgba(255, 122, 0, 0.5)",
                    },
                  }}
                >
                  Start Learning Today
                </Button>
              </motion.div>
            </Box>
          </Grid>

          {/* RIGHT COLUMN - Image */}
          <Grid
            item
            xs={12}
            md={6}
            component={motion.div}
            variants={fadeInRight}
          >
              <Box
                component="img"
                src="/heroicon.png"
                alt="Students learning with Raga Vachika"
                sx={{
                  width: "100%",
                  borderRadius: 4,
                  maxWidth: { xs: "100%", md: "500px" },
                  height: "auto",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
                  display: 'block',
                  mx: 'auto'
                }}
              />
          </Grid>

        </Grid>
      </Container>
    </Box>
  );
}