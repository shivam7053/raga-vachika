"use client";

import { motion, Variants } from "framer-motion";
import { Avatar, Box, Chip, Container, Grid, Paper, Typography, useTheme } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";

const feedbacks = [
  {
    name: "Aisha Khan",
    role: "Grade 10 Student",
    image:
      "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=400",
    feedback:
      "The Physics classes on Raga Vachika are amazing! The concepts are explained so clearly with animations. My grades have improved from a B to an A+ in just one term.",
    rating: 5,
    course: "Physics Foundation",
  },
  {
    name: "Rohan Sharma's Parent",
    role: "Parent of a Grade 8 Student",
    image:
      "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400",
    feedback:
      "My son used to hate mathematics, but the interactive quizzes and live doubt-clearing sessions have made learning fun for him. I'm so grateful for this platform.",
    rating: 5,
    course: "Grade 8 Mathematics",
  },
  {
    name: "Priya Das",
    role: "Grade 12 Student",
    image:
      "https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=400",
    feedback:
      "Preparing for board exams was stressful, but the structured revision notes and mock tests on Raga Vachika gave me the confidence I needed to score 95% in Chemistry!",
    rating: 5,
    course: "Chemistry Boards Prep",
  },
  {
    name: "Arjun Kumar",
    role: "Grade 9 Student",
    image:
      "https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=400",
    feedback:
      "I love the coding classes! I've learned Python and built my own simple game. The teachers are really cool and make programming easy to understand.",
    rating: 5,
    course: "Introduction to Python",
  },
  {
    name: "Meera Iyer's Parent",
    role: "Parent of a Grade 6 Student",
    image:
      "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400",
    feedback:
      "The platform is very safe and easy for my daughter to use. The quality of teaching for subjects like History and Geography is top-notch. It's a great supplement to her school.",
    rating: 5,
    course: "Social Studies",
  },
  {
    name: "Sameer Ali",
    role: "Grade 11 Student",
    image:
      "https://images.pexels.com/photos/837358/pexels-photo-837358.jpeg?auto=compress&cs=tinysrgb&w=400",
    feedback:
      "The biology diagrams and explanations are the best I've seen. The detailed video lessons helped me visualize complex topics and score well in my exams.",
    rating: 5,
    course: "Biology Deep Dive",
  },
];

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
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function StudentFeedback() {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  return (
    <Box
      component={motion.section}
      initial="initial"
      whileInView="animate"
      viewport={{ once: false, amount: 0.1 }}
      variants={staggerChildren}
      sx={{
        py: 10,
        bgcolor: isDarkMode ? "#0A1929" : theme.palette.background.default,
        position: "relative",
      }}
    >
      <Container maxWidth="lg">
        <Box component={motion.div} variants={fadeInUp} sx={{ textAlign: "center", mb: 8 }}>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 64,
              height: 64,
              bgcolor: "rgba(255, 122, 0, 0.1)",
              borderRadius: "50%",
              mb: 2,
            }}
          >
            <StarIcon sx={{ fontSize: 32, color: "#FF7A00" }} />
          </Box>
          <Typography variant="h3" sx={{ fontWeight: "bold", mb: 1, color: isDarkMode ? "white" : "text.primary" }}>
            What Our Students & Parents Say
          </Typography>
          <Typography variant="h6" color={isDarkMode ? "grey.400" : "text.secondary"} sx={{ fontWeight: "normal" }}>
            Discover how Raga Vachika is making a difference.
          </Typography>
        </Box>

        <Grid container spacing={3} component={motion.div} variants={staggerChildren}>
          {feedbacks.map((feedback, index) => (
            <Grid item xs={12} sm={6} md={4} key={index} component={motion.div} variants={fadeInUp}>
              <Paper
                elevation={0}
                sx={{
                  bgcolor: isDarkMode ? "#102A43" : "background.paper",
                  p: 3,
                  borderRadius: 3,
                  height: "100%",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <FormatQuoteIcon
                  sx={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    fontSize: "4rem",
                    color: isDarkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
                  }}
                />
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Avatar
                    src={feedback.image}
                    alt={feedback.name}
                    sx={{ width: 56, height: 56, mr: 2, border: "2px solid #FF7A00" }}
                  />
                  <Box>
                    <Typography sx={{ fontWeight: "bold", color: "text.primary" }}>{feedback.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feedback.role}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", mb: 2 }}>
                  {Array.from({ length: feedback.rating }).map((_, i) => (
                    <StarIcon key={i} sx={{ color: "#FFC107", fontSize: "1.2rem" }} />
                  ))}
                </Box>
                <Typography variant="body1" color="text.secondary" sx={{ fontStyle: "italic", mb: 3 }}>
                  "{feedback.feedback}"
                </Typography>
                <Chip
                  label={feedback.course}
                  size="small"
                  sx={{
                    bgcolor: "rgba(255, 122, 0, 0.15)",
                    color: "#FFAC6B",
                    fontWeight: "medium",
                  }}
                />
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Box component={motion.div} variants={fadeInUp} sx={{ mt: 8 }}>
          <Grid container spacing={3}>
          {[
            { number: "5,000+", label: "Happy Students" },
            { number: "20+", label: "Courses Offered" },
            { number: "50+", label: "Expert Teachers" },
            { number: "4.9/5", label: "Average Rating" },
          ].map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Paper
                elevation={0}
                sx={{ bgcolor: isDarkMode ? "#102A43" : "background.paper", p: 3, textAlign: "center", borderRadius: 3 }}
              >
                <Typography
                  variant="h4"
                  sx={{ fontWeight: "bold", color: "#FF7A00", mb: 1 }}
                >
                  {stat.number}
                </Typography>
                <Typography color="text.secondary">{stat.label}</Typography>
              </Paper>
            </Grid>
          ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}
