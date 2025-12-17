"use client";

import React, { useEffect, useState } from "react";
import NextLink from "next/link";
import { useAuth } from "@/context/AuthContexts";
import { motion } from "framer-motion";
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Grid,
  CircularProgress,
  useTheme,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LaunchIcon from "@mui/icons-material/Launch";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Course } from "@/types/masterclass"; // ✅ Single source of truth

export default function PurchasesPage() {
  const { user, loading: authLoading } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  useEffect(() => {
    const fetchPurchasedCourses = async () => {
      // Use the user's UID directly for the query
      if (!user?.uid) {
        setLoadingClasses(false);
        return;
      }

      setLoadingClasses(true);
      try {
        const coursesRef = collection(db, "Courses");
        // Query for courses where the user's ID is in the 'purchased_by_users' array.
        const q = query(
          coursesRef,
          where("purchased_by_users", "array-contains", user.uid)
        );
        const querySnapshot = await getDocs(q);
        
        const fetchedClasses: Course[] = [];
        querySnapshot.forEach((doc) => {
          // Reconstruct the object to ensure type safety
          const data = doc.data();
          fetchedClasses.push({ id: doc.id, ...data } as Course);
        });

        setCourses(fetchedClasses);
      } catch (error) {
        console.error("Error fetching purchased courses:", error);
      } finally {
        setLoadingClasses(false);
      }
    };

    fetchPurchasedCourses();
  }, [user]);

  if (authLoading || loadingClasses) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress sx={{ color: "#FF7A00" }} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Container maxWidth="lg" sx={{ pt: 16, pb: 12 }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: "32px" }}
        >
          <Button
            component={NextLink}
            href="/profile"
            startIcon={<ArrowBackIcon />}
            sx={{ color: "text.secondary", mb: 2, "&:hover": { bgcolor: "action.hover" } }}
          >
            Back to Profile
          </Button>
          <Typography variant="h3" sx={{ fontWeight: "bold", mb: 1 }}>Purchased Courses</Typography>
          <Typography color="text.secondary">
            Access all your enrolled courses here.
          </Typography>
        </motion.div>

        {/* Statistics */}
        <Paper
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          elevation={0}
          sx={{ bgcolor: "background.paper", p: 3, mb: 4, borderRadius: 3 }}
        >
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: "bold", color: "secondary.main" }}>
                {courses.length}
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                Total Courses Enrolled
              </Typography>
            </Box>
            <ShoppingBagIcon sx={{ fontSize: 48, color: theme.palette.secondary.main, opacity: 0.2 }} />
          </Box>
        </Paper>

        {/* Classes List */}
        {courses.length === 0 ? (
          <Paper
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            elevation={0}
            sx={{ bgcolor: "background.paper", textAlign: "center", p: 8, borderRadius: 3 }}
          >
            <ShoppingBagIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1 }}>
              No purchased courses yet
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Start learning by enrolling in a course.
            </Typography>
            <Button
              component={NextLink} // Changed from masterclasses
              href="/courses"
              variant="contained"
              sx={{ bgcolor: "#FF7A00", "&:hover": { bgcolor: "#FF9933" } }}
            >
              Browse Courses
            </Button>
          </Paper>
        ) : (
          <Box
            component={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            {/* If we have full course data */}
            {courses.map((course, i) => (
              <Paper
                component={motion.div}
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                elevation={0}
                sx={{ bgcolor: "background.paper", p: 2, borderRadius: 3 }}
              >
                <Grid container spacing={2} alignItems="center">
                  {/* Thumbnail */}
                  <Grid item xs={12} sm={3} md={2}>
                    <Box
                      component="img"
                      src={course.thumbnail_url || '/placeholder.png'}
                      alt={course.title}
                      sx={{ width: "100%", height: "auto", aspectRatio: "16/9", borderRadius: 2, objectFit: "cover" }}
                    />
                  </Grid>

                  {/* Content */}
                  <Grid item xs={12} sm={9} md={10}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2 }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 0.5 }}>
                          {course.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          By {course.speaker_name}
                        </Typography>
                      </Box>
                      <CheckCircleIcon sx={{ color: "success.main" }} />
                    </Box>
                    <Button
                      component={NextLink}
                      href={`/courses/${course.id}`} // Assuming this path is correct
                      variant="contained"
                      startIcon={<LaunchIcon />}
                      sx={{ mt: 2, bgcolor: "#FF7A00", "&:hover": { bgcolor: "#FF9933" } }}
                    >
                      Access Course
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            ))}
          </Box>
        )}

        {/* Additional Info */}
        <Paper
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          elevation={0}
          sx={{ bgcolor: "background.paper", mt: 4, p: 3, borderRadius: 3 }}
        >
          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>Need Help?</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Having trouble accessing your purchased courses? Contact our support team.
          </Typography>
          <Button
            component={NextLink}
            href="/contact"
            variant="outlined"
            sx={{ color: "secondary.main", borderColor: "secondary.main", "&:hover": { bgcolor: "rgba(255, 122, 0, 0.1)" } }}
          >
            Contact Support
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}