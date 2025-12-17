"use client";

import { motion, Variants } from "framer-motion";
import NextLink from "next/link";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  Typography,
  useTheme,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import CourseCard from "@/components/CourseCard";
import { Course } from "@/types/masterclass";

interface Props {
  courses: Course[];
  loading: boolean;
  user: any;
}

const fadeInUp: Variants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
};

const staggerChildren: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.08 } },
};

export default function CourseSection({
  courses,
  loading,
  user,
}: Props) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  // Sort by creation date to show the newest courses first.
  const displayedCourses = Array.isArray(courses) ? [...courses]
    .sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    })
    .slice(0, 4) : []; // Added the missing 'else' part of the ternary operator

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
        color: isDarkMode ? "white" : theme.palette.text.primary,
        position: "relative",
        zIndex: 10,
      }}
    >
      <Container maxWidth="lg">
        <Box
          component={motion.div}
          variants={fadeInUp}
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: "center",
            mb: 8,
            textAlign: { xs: "center", md: "left" },
          }}
        >
          <Box>
            <Typography variant="h3" sx={{ fontWeight: "bold", mb: 1 }}>
              Our Featured Courses
            </Typography>
            <Typography variant="h6" color={isDarkMode ? "grey.400" : "text.secondary"} sx={{ fontWeight: "normal" }}>
              Explore our most popular and highly-rated courses.
            </Typography>
          </Box>

          <Button
            component={NextLink}
            href="/courses"
            variant="outlined"
            endIcon={<ArrowForwardIcon />}
            sx={{
              mt: { xs: 3, md: 0 },
              color: "#FF7A00",
              borderColor: "rgba(255, 122, 0, 0.5)",
              borderRadius: "50px",
              py: 1,
              px: 4,
              fontWeight: "bold",
              "&:hover": {
                backgroundColor: "rgba(255, 122, 0, 0.1)",
                borderColor: "#FF7A00",
              },
            }}
          >
            View All
          </Button>
        </Box>

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
            <CircularProgress sx={{ color: "#FF7A00" }} size={50} />
          </Box>
        )}

        {!loading && displayedCourses.length === 0 && (
          <Box
            variants={fadeInUp}
            sx={{ textAlign: "center", py: 10, color: "grey.500" }}
          >
            <ReportProblemOutlinedIcon sx={{ fontSize: 48, mb: 2 }} />
            <Typography>No courses available at the moment.</Typography>
          </Box>
        )}

        {!loading && displayedCourses.length > 0 && (
          <Grid
            container
            spacing={3}
            component={motion.div}
            variants={staggerChildren}
          >
            {displayedCourses.map((course) => (
              <Grid item xs={12} sm={6} lg={3} key={course.id} component={motion.div} variants={fadeInUp}>
                <CourseCard course={course} user={user} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}
