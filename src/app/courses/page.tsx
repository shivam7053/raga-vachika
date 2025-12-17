// masterclasses/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import NextLink from "next/link";
import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
  Skeleton,
  Pagination,
  Paper,
  useTheme,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContexts";
import CourseCard from "@/components/CourseCard";
import { Course, CourseContent } from "@/types/masterclass";

type FilterType = "all" | "free" | "paid" | "enrolled";

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const { user } = useAuth();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentCourses = filteredCourses.slice(startIndex, startIndex + itemsPerPage);

  // Fetch courses
  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "Courses"));

      if (querySnapshot.empty) {
        setCourses([]);
        return;
      }

      const courseList: Course[] = querySnapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          title: data.title || "",
          description: data.description || "",
          speaker_name: data.speaker_name || "",
          speaker_designation: data.speaker_designation || "",
          thumbnail_url: data.thumbnail_url || "",
          price: data.price || 0,
          type: data.type || 'free',
          created_at: data.created_at?.toDate()?.toISOString() || new Date().toISOString(),
          content: (data.content || []).sort((a: CourseContent, b: CourseContent) => a.order - b.order),
          purchased_by_users: data.purchased_by_users || [],
          demo_video_url: data.demo_video_url || '', // ✅ NEW: Fetch the demo video URL
        };
      });

      setCourses(courseList);
    } catch (error) {
      console.error("🔥 Error fetching courses:", error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Apply filters
  useEffect(() => {
    let filtered = courses;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.speaker_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.speaker_designation.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by type (free/paid/enrolled)
    if (filterType === "free") {
      filtered = filtered.filter(course => course.type === 'free');
    } else if (filterType === "paid") {
      filtered = filtered.filter(course => course.type === 'paid');
    } else if (filterType === "enrolled" && user?.uid) {
      // A user has a course if they bought the bundle OR if they bought any individual piece of content from it.
      filtered = filtered.filter(course => 
        course.purchased_by_users.includes(user.uid)
      );
    }

    setFilteredCourses(filtered);
    setCurrentPage(1);
  }, [courses, searchQuery, filterType, user]);

  const handleRefresh = () => fetchCourses();

  // Animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const SkeletonCard = () => (
    <Paper sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 3 }}>
      <Skeleton variant="rectangular" sx={{ borderRadius: 2, mb: 2 }} width="100%" height={180} />
      <Skeleton width="80%" />
      <Skeleton width="60%" />
    </Paper>
  );

  const filterButtons: { type: FilterType; label: string }[] = [
    { type: "all", label: "All" },
    { type: "free", label: "Free" },
    { type: "paid", label: "Paid" },
  ];

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Container maxWidth="lg" sx={{ pt: 16, pb: 12 }}>
          {/* Header */}
        <Box sx={{ mb: 6 }}>
          <Button
            component={NextLink}
              href="/"
            startIcon={<ArrowBackIcon />}
            sx={{ color: "text.secondary", mb: 4, "&:hover": { bgcolor: "action.hover" } }}
          >
              Back to Home
          </Button>

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: "bold" }}>
                All Courses
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Explore expert-led sessions and level up your skills.
              </Typography>
            </Box>
            <Button
              onClick={handleRefresh}
              disabled={loading}
              variant="contained"
              startIcon={<RefreshIcon sx={{ animation: loading ? "spin 1s linear infinite" : "none" }} />}
              sx={{
                bgcolor: isDarkMode ? "#102A43" : "background.paper",
                color: isDarkMode ? "white" : "text.primary", // Explicitly set text color
                "&:hover": { bgcolor: isDarkMode ? "#173A5E" : "grey.200" },
                "@keyframes spin": { from: { transform: "rotate(0deg)" }, to: { transform: "rotate(360deg)" } },
              }}
            >
                Refresh
            </Button>
          </Box>
        </Box>

          {/* Search + Filters */}
        <Box sx={{ mb: 6, display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 2 }}>
          <TextField
            fullWidth
            placeholder="Search by title, speaker, or designation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton onClick={() => setSearchQuery("")} edge="end" color="inherit">
                    <CloseIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              flex: 1,
              "& .MuiOutlinedInput-root": {
                bgcolor: "background.paper",
                "& fieldset": { borderColor: "divider" },
                "&:hover fieldset": { borderColor: "primary.main" },
              },
            }}
          />

          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {filterButtons.map(({ type, label }) => (
              <Button
                    key={type}
                    onClick={() => setFilterType(type)}
                variant={filterType === type ? "contained" : "outlined"}
                sx={{
                  bgcolor: filterType === type ? "#FF7A00" : "transparent",
                  borderColor: "rgba(255, 122, 0, 0.5)",
                  color: filterType === type ? "white" : "#FF7A00",
                  "&:hover": {
                    bgcolor: filterType === type ? "#FF9933" : "rgba(255, 122, 0, 0.1)",
                    borderColor: "#FF7A00",
                  },
                }}
                  >
                    {label}
              </Button>
                ))}
                {user && (
              <Button
                    onClick={() => setFilterType("enrolled")}
                variant={filterType === "enrolled" ? "contained" : "outlined"}
                sx={{
                  bgcolor: filterType === "enrolled" ? "#FF7A00" : "transparent",
                  borderColor: "rgba(255, 122, 0, 0.5)",
                  color: filterType === "enrolled" ? "white" : "#FF7A00",
                  "&:hover": {
                    bgcolor: filterType === "enrolled" ? "#FF9933" : "rgba(255, 122, 0, 0.1)",
                    borderColor: "#FF7A00",
                  },
                }}
                  >
                    My Courses
              </Button>
                )}
          </Box>
        </Box>

          {/* Results */}
          {loading ? (
            <Grid container spacing={3} sx={{ py: 8 }}>
              {[...Array(6)].map((_, i) => (
                <Grid item xs={12} sm={6} md={4} key={i}>
                  <SkeletonCard />
                </Grid>
              ))}
            </Grid>
          ) : filteredCourses.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 10 }}>
              <ReportProblemOutlinedIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1 }}>
                No Results Found
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                {searchQuery
                  ? `No courses found for "${searchQuery}".`
                  : filterType === "enrolled" && !user
                  ? "Login to view your enrolled courses."
                  : filterType === "enrolled"
                  ? "You haven't enrolled in any courses yet."
                  : "No courses available under this filter."}
              </Typography>
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setFilterType("all");
                }}
                variant="contained"
                sx={{ bgcolor: "#FF7A00", "&:hover": { bgcolor: "#FF9933" } }}
              >
                Clear Filters
              </Button>
            </Box>
          ) : (
            <>
              <Grid
                container
                spacing={3}
                component={motion.div}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {currentCourses.map((course) => (
                  <Grid item xs={12} sm={6} md={4} key={course.id} component={motion.div} variants={cardVariants}>
                    <CourseCard course={course} user={user} />
                  </Grid>
                ))}
              </Grid>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={(_, page) => setCurrentPage(page)}
                    color="primary"
                    sx={{
                      "& .Mui-selected": {
                        bgcolor: "secondary.main !important",
                      },
                    }}
                  />
                </Box>
              )}
            </>
          )}
      </Container>
    </Box>
  );
}
