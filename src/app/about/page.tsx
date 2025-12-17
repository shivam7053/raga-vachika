"use client";

import { motion } from "framer-motion";
import { Box, Container, Grid, Paper, Typography, useTheme } from "@mui/material";
import GroupsIcon from "@mui/icons-material/Groups";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import MenuBookIcon from "@mui/icons-material/MenuBook";

const features = [
  {
    icon: <MenuBookIcon sx={{ fontSize: 36, color: "#FF7A00" }} />,
    title: "Expert Educators",
    desc: "Learn from experienced teachers who are passionate about making complex subjects simple and engaging.",
  },
  {
    icon: <RocketLaunchIcon sx={{ fontSize: 36, color: "#FF7A00" }} />,
    title: "Interactive Learning",
    desc: "Go beyond textbooks with interactive video lessons, quizzes, and real-time doubt-clearing sessions.",
  },
  {
    icon: <WorkspacePremiumIcon sx={{ fontSize: 36, color: "#FF7A00" }} />,
    title: "Holistic Development",
    desc: "We focus on building a strong conceptual foundation to foster curiosity and a lifelong love for learning.",
  },
];

export default function AboutPage() {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  return (
    <Box sx={{ minHeight: "100vh" }}>
      {/* 🎬 Hero Section */}
      <Container maxWidth="lg" sx={{ pt: 20, pb: 12, textAlign: "center" }}>
        <Typography
          component={motion.h1}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          variant="h2"
          sx={{ fontWeight: "bold", mb: 2 }}
        >
          About <span style={{ color: "#FF7A00" }}>Raga Vachika</span>
        </Typography>
        <Typography
          component={motion.p}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          variant="h5"
          color="text.secondary"
          sx={{ maxWidth: "750px", mx: "auto" }}
        >
          We are dedicated to revolutionizing education for students in grades 5-12
          by making learning accessible, engaging, and effective.
        </Typography>
      </Container>

      {/* 🧭 Mission & Vision Section */}
      <Box sx={{ py: 12, bgcolor: isDarkMode ? "#061321" : "rgba(0,0,0,0.02)" }}>
        <Container maxWidth="md" sx={{ textAlign: "center" }}>
          <Typography variant="h3" sx={{ fontWeight: "bold", mb: 8 }}>
            Our Mission & Vision
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Paper
                component={motion.div}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                elevation={0}
                sx={{ p: 4, bgcolor: "background.paper", borderRadius: 3, height: "100%" }}
              >
                <TrackChangesIcon sx={{ fontSize: 48, color: "#FF7A00", mb: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1 }}>
                  Our Mission
                </Typography>
                <Typography color="text.secondary">
                  To make high-quality education accessible and enjoyable for every
                  student, empowering them to achieve academic excellence and unlock
                  their full potential.
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper
                component={motion.div}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                elevation={0}
                sx={{ p: 4, bgcolor: "background.paper", borderRadius: 3, height: "100%" }}
              >
                <GroupsIcon sx={{ fontSize: 48, color: "#FF7A00", mb: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1 }}>
                  Our Vision
                </Typography>
                <Typography color="text.secondary">
                  To become the most trusted online learning platform that fosters
                  a generation of curious minds, critical thinkers, and lifelong
                  learners.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* 👥 Team Section - This section remains commented out as in the original file */}
      {/* ... */}

      {/* 🚀 Why Choose Us */}
      <Box sx={{ py: 12 }}>
        <Container maxWidth="lg" sx={{ textAlign: "center" }}>
          <Typography variant="h3" sx={{ fontWeight: "bold", mb: 8 }}>
            Why Choose Raga Vachika?
          </Typography>
          <Grid container spacing={4}>
            {features.map((f, i) => (
              <Grid item xs={12} md={4} key={i}>
                <Paper
                  component={motion.div}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.2 }}
                  elevation={0}
                  sx={{
                    p: 4,
                    bgcolor: "background.paper",
                    borderRadius: 3,
                    height: "100%",
                  }}
                >
                  <Box sx={{ mb: 2 }}>{f.icon}</Box>
                  <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1 }}>
                    {f.title}
                  </Typography>
                  <Typography color="text.secondary">{f.desc}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}
