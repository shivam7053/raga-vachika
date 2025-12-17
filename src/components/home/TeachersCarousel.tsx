"use client";

import { motion, Variants } from "framer-motion";
import { Box, Card, CardMedia, Container, Typography, useTheme } from "@mui/material";

const teachers = [
  {
    name: "Dr. Anjali Verma",
    designation: "PhD in Physics, 12+ Years Experience",
    image:
      "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
  {
    name: "Mr. Rajeev Singh",
    designation: "M.Sc. in Mathematics, IIT Bombay",
    image:
      "https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
  {
    name: "Mrs. Kavita Reddy",
    designation: "B.Ed, English Literature Expert",
    image:
      "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
  {
    name: "Mr. Sameer Khan",
    designation: "M.Tech in Computer Science",
    image:
      "https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
  {
    name: "Dr. Priya Sharma",
    designation: "PhD in Chemistry",
    image:
      "https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
  {
    name: "Mr. David Chen",
    designation: "Biology & Environmental Science Expert",
    image:
      "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
  {
    name: "Ms. Sunita Williams",
    designation: "Social Studies & History Specialist",
    image:
      "https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
];

const fadeInUp: Variants = {
  initial: { opacity: 0, y: 40 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7 },
  },
};

export default function TeachersCarousel() {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  // Double the array for seamless infinite scroll
  const doubledTeachers = [...teachers, ...teachers, ...teachers];

  return (
    <Box
      component={motion.section}
      initial="initial"
      whileInView="animate"
      viewport={{ once: false, amount: 0.1 }}
      sx={{
        py: 10,
        bgcolor: isDarkMode ? "#0A1929" : theme.palette.background.default,
        color: isDarkMode ? "white" : theme.palette.text.primary,
        position: "relative",
        zIndex: 10,
        overflow: "hidden",
      }}
    >
      <Container maxWidth="lg" sx={{ mb: 6 }}>
        <Box component={motion.div} variants={fadeInUp} sx={{ textAlign: "center" }}>
          <Typography variant="h3" sx={{ fontWeight: "bold", mb: 1 }}>
            Meet Our Expert Educators
          </Typography>
          <Typography variant="h6" color={isDarkMode ? "grey.400" : "text.secondary"} sx={{ fontWeight: "normal" }}>
            Learn from the best minds in academia, dedicated to your success.
          </Typography>
        </Box>
      </Container>

      <Box sx={{ display: "flex", overflow: "hidden", maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)" }}>
        <motion.div
          style={{ display: "flex", gap: "24px" }}
          animate={{ x: ["0%", "-100%"] }}
          transition={{
            ease: "linear",
            duration: 40,
            repeat: Infinity,
          }}
        >
          {doubledTeachers.map((teacher, index) => (
            <Card
              key={index}
              sx={{
                flexShrink: 0,
                width: 280,
                bgcolor: isDarkMode ? "#102A43" : "background.paper",
                color: isDarkMode ? "white" : "text.primary",
                borderRadius: 3,
                boxShadow: "none",
                position: "relative",
              }}
            >
              <CardMedia
                component="img"
                height="320"
                image={teacher.image}
                alt={teacher.name}
                sx={{ objectFit: "cover" }}
              />
              <Box
                sx={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: `linear-gradient(to top, ${theme.palette.background.paper} 20%, transparent)`,
                  p: 2,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  {teacher.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {teacher.designation}
                </Typography>
              </Box>
            </Card>
          ))}
        </motion.div>
      </Box>
    </Box>
  );
}
