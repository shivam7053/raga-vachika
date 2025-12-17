

// app/masterclasses/[id]/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import NextLink from "next/link";
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Paper,
  CircularProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import LockIcon from "@mui/icons-material/Lock";
import PersonIcon from "@mui/icons-material/Person";
import WorkIcon from "@mui/icons-material/Work";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import GroupsIcon from "@mui/icons-material/Groups";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import OndemandVideoIcon from "@mui/icons-material/OndemandVideo";
import ViewListIcon from "@mui/icons-material/ViewList";
import DescriptionIcon from '@mui/icons-material/Description';
import QuizIcon from '@mui/icons-material/Quiz';
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContexts";
import toast from "react-hot-toast";
import {
  Course,
  CourseContent,
  YoutubeContent,
} from "@/types/masterclass";
import { formatCourseDate, getYouTubeVideoId } from "@/utils/masterclass"; // Corrected import path
import { addTransactionRecord } from "@/utils/userUtils";
import ZoomPanel from "@/components/ZoomPanel";
import PaymentModal from "@/components/PaymentModal";

export default function CourseDetailPage() {
  const params = useParams();
  const { user } = useAuth();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState<CourseContent | null>(null);
  const [showAllContent, setShowAllContent] = useState(false); // ✅ NEW: State for "All Content" view
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const courseId = params.id as string;

  useEffect(() => {
  const fetchCourse = async () => {
    if (!courseId) return;

    try {
      setLoading(true);
      const docRef = doc(db, "Courses", courseId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        setError("Course not found.");
        return;
      }

      const data = docSnap.data();

      // ✅ FIX: Generate unique IDs for each content item
      const fixedContent = (data.content || []).map(
        (c: CourseContent, index: number) => ({
          ...c,
          id:
            c.id && c.id.trim() !== ""
              ? c.id
              : `${docSnap.id}_content_${index}`, // generate unique id
          order: typeof c.order === "number" ? c.order : index,
        })
      );

      const courseData: Course = {
        id: docSnap.id,
        title: data.title || "",
        speaker_name: data.speaker_name || "",
        speaker_designation: data.speaker_designation || "",
        thumbnail_url: data.thumbnail_url || "",
        description: data.description || "",
        price: data.price || 0,
        type: data.type || "free",
        created_at: data.created_at
          ? new Date(data.created_at.seconds * 1000).toISOString()
          : new Date().toISOString(),
        content: fixedContent.sort(
          (a: CourseContent, b: CourseContent) =>
            a.order - b.order
        ),
        purchased_by_users: data.purchased_by_users || [],
        demo_video_url: data.demo_video_url || "",
      };

      setCourse(courseData);

      if (courseData.content.length > 0) {
        setSelectedContent(courseData.content[0]);
      }
    } catch (error) {
      console.error("Error fetching course:", error);
      setError("Failed to load course details.");
    } finally {
      setLoading(false);
    }
  };

  toast.loading("Loading course details...", { id: "loading-toast" });
  fetchCourse();
  toast.dismiss("loading-toast");
}, [courseId]);

  const userHasFullAccess = user?.uid && course?.purchased_by_users?.includes(user.uid);
  const isCourseFree = course?.type === 'free';

  // Refresh course data after purchase
  const refreshCourseData = useCallback(async () => {
    if (!courseId) return;
    
    try {
      const docRef = doc(db, "Courses", courseId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setCourse((prev) =>
          prev
            ? {
                ...prev,
                purchased_by_users: data.purchased_by_users || [],
              }
            : null
        );
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  }, [courseId]);

  // Handle enrollment for a FREE course
  const handleFreeEnrollment = async () => {
    if (!user?.uid) return toast.error("Please login to enroll.");
    if (userHasFullAccess) return toast("You are already enrolled.", { icon: "ℹ️" });
    if (!course) return;

    setProcessing(true);
    try {
      const courseRef = doc(db, "Courses", courseId);
      await updateDoc(courseRef, {
        purchased_by_users: arrayUnion(user.uid),
      });

      await addTransactionRecord(user.uid, {
        orderId: "free_enroll_" + Date.now(),
        courseId: courseId,
        courseTitle: course.title,
        amount: 0,
        status: "success",
        method: "free",
        type: "purchase",
        timestamp: new Date().toISOString(),
      });

      toast.success("Enrolled successfully!");
      await refreshCourseData();
    } catch (err) {
      console.error("Free enrollment error:", err);
      toast.error("Error processing enrollment.");
    } finally {
      setProcessing(false);
    }
  };

  // Handle enrollment for a PAID course
  const handlePaidEnrollment = () => {
    if (!user?.uid) return toast.error("Please login to enroll.");
    if (userHasFullAccess) return toast("You are already enrolled.", { icon: "ℹ️" });

    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async () => {
    toast.success("Purchase successful! Check your email for confirmation.");
    setShowPaymentModal(false);
    await refreshCourseData();
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress color="secondary" />
          <Typography color="text.secondary" sx={{ mt: 2 }}>Loading course...</Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Box sx={{ textAlign: "center", p: 4 }}>
          <ReportProblemOutlinedIcon sx={{ fontSize: 64, color: "error.main", mb: 2 }} />
          <Typography color="error" sx={{ mb: 3, fontWeight: "bold" }}>{error}</Typography>
          <Button component={NextLink} href="/courses" variant="outlined" color="secondary">
            Back to Courses
          </Button>
        </Box>
      </Box>
    );
  }

  if (!course) {
    return (
      <Box sx={{ minHeight: "100vh" }} />
    );
  }

  const isUpcomingContent = (content: CourseContent) =>
    content.source === 'zoom' && content.scheduled_date && new Date(content.scheduled_date) > new Date();

  const videoId = selectedContent?.source === "youtube" && selectedContent.youtube_url ? getYouTubeVideoId(selectedContent.youtube_url) : null;

  const renderAllContent = () => {
  const hasAccess = userHasFullAccess || isMasterclassFree;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {course.content.map((contentItem, index) => {
        const isActive = selectedContent?.id === contentItem.id;

        const contentVideoId =
          contentItem.source === "youtube" && contentItem.youtube_url
            ? getYouTubeVideoId(contentItem.youtube_url)
            : null;

        return (
          <Paper
            key={contentItem.id}
            onClick={() => setSelectedContent(contentItem)}
            elevation={0}
            sx={{
              cursor: "pointer",
              transition: "all 0.3s",
              bgcolor: isActive ? (isDarkMode ? "#173A5E" : "primary.light") : "background.paper",
              border: isActive ? `2px solid ${theme.palette.secondary.main}` : "2px solid transparent",
            }}
          >
            {/* Video / Zoom */}
            {contentItem.source === "youtube" && (
              <Box sx={{ position: "relative", aspectRatio: "16/9", bgcolor: "black" }}>
                {hasAccess && contentVideoId ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${contentVideoId}`}
                    title={contentItem.title} // Accessibility
                    style={{ border: 0, width: "100%", height: "100%" }}
                    allowFullScreen
                  />
                ) : (
                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%" }}>
                    <LockIcon sx={{ fontSize: 64, color: "grey.600", mb: 2 }} />
                    <Typography color="grey.500" variant="h6">
                      {isCourseFree ? "Loading..." : "Purchase to unlock"}
                    </Typography>
                  </Box>
                )}
              </Box>
            )}

            {contentItem.source === "zoom" && (
              <ZoomPanel
                content={contentItem}
                hasAccess={hasAccess}
                processing={processing}
              />
            )}

            {/* Content Info */}
            <Box sx={{ p: 3, bgcolor: isActive ? (isDarkMode ? "rgba(255, 122, 0, 0.1)" : "secondary.light") : "transparent" }}>
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                {index + 1}. {contentItem.title}
              </Typography>

              {contentItem.description && (
                <Typography color="text.secondary" variant="body2" sx={{ mb: 2 }}>
                  {contentItem.description}
                </Typography>
              )}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, color: "text.secondary" }}>
                {contentItem.duration && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <AccessTimeIcon sx={{ fontSize: 16 }} />
                    {contentItem.duration}
                  </Box>
                )}
                {contentItem.source === 'youtube' &&
                  (contentItem as YoutubeContent).scheduled_date && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <CalendarTodayIcon sx={{ fontSize: 16 }} />
                      <Typography variant="caption">
                        {formatCourseDate(
                          (contentItem as YoutubeContent).scheduled_date!
                        )}{' '}
                        {(contentItem as YoutubeContent).scheduled_time}
                      </Typography>
                    </Box>
                  )}
              </Box>
              {/* Notes and Tests */}
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                {contentItem.notes_url && (
                  <Button
                    component="a"
                    href={contentItem.notes_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="outlined"
                    size="small"
                    startIcon={<DescriptionIcon />}
                    sx={{ color: 'secondary.main', borderColor: 'secondary.main', '&:hover': { bgcolor: 'rgba(255, 122, 0, 0.1)' } }}
                  >
                    View Notes
                  </Button>
                )}
                {contentItem.tests && contentItem.tests.length > 0 && (
                  <Button variant="outlined" size="small" startIcon={<QuizIcon />} sx={{ color: 'secondary.main', borderColor: 'secondary.main', '&:hover': { bgcolor: 'rgba(255, 122, 0, 0.1)' } }}>Take Test</Button>
                )}
              </Box>
            </Box>
          </Paper>
        );
      })}
    </Box>
  );
};

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Container maxWidth="xl" sx={{ py: 4, pt: 12 }}>
        <Button
          component={NextLink}
          href="/courses"
          startIcon={<ArrowBackIcon />}
          sx={{ color: "text.secondary", mb: 4, "&:hover": { bgcolor: "action.hover" } }}
        >
          Back to Courses
        </Button>

        <Grid container spacing={4}>
          <Grid item xs={12} lg={8}>
            {/* ✅ IMPROVED: Conditional rendering based on view mode */}
            {!showAllContent ? (
              <>
                {/* Single Content Player */}
                {selectedContent?.source === "zoom" && (
                  <ZoomPanel
                    content={selectedContent}
                    hasAccess={!!(userHasFullAccess || isCourseFree)}
                    processing={processing}
                  />
                )}
                {selectedContent?.source === "youtube" && (
                  <Paper elevation={0} sx={{ bgcolor: "background.paper", borderRadius: 3, overflow: "hidden" }}>
                    <Box sx={{ position: "relative", aspectRatio: "16/9", bgcolor: "black" }}>
                      {(userHasFullAccess || isCourseFree) && videoId ? (
                        <iframe
                          src={`https://www.youtube.com/embed/${videoId}`}
                          title={selectedContent.title}
                          style={{ border: 0, width: "100%", height: "100%" }}
                          allowFullScreen
                        />
                      ) : (
                        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%" }}>
                          <LockIcon sx={{ fontSize: 64, color: "grey.600", mb: 2 }} />
                          <Typography color="grey.500" variant="h6">
                            {isCourseFree ? "Select a video" : "Purchase to unlock"}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {selectedContent && (
                      <Box sx={{ p: 3 }}>
                        <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1 }}>{selectedContent.title}</Typography>
                        {selectedContent.description && (
                          <Typography color="text.secondary" variant="body1" sx={{ mb: 2 }}>{selectedContent.description}</Typography>
                        )}

                        <Box sx={{ display: "flex", alignItems: "center", gap: 3, color: "text.secondary", fontSize: "0.875rem" }}>
                          {selectedContent.duration && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                              <AccessTimeIcon sx={{ fontSize: 16 }} />
                              {selectedContent.duration}
                            </Box>
                          )}
                          {selectedContent.source === 'youtube' &&
                            (selectedContent as YoutubeContent).scheduled_date && (
                              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                <CalendarTodayIcon sx={{ fontSize: 16 }} />
                                <Typography variant="caption">
                                  {formatCourseDate(
                                    (selectedContent as YoutubeContent).scheduled_date!
                                  )}{' '}
                                  {(selectedContent as YoutubeContent).scheduled_time}
                                </Typography>
                              </Box>
                          )}
                        </Box>
                        {/* Notes and Tests for single view */}
                        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                          {selectedContent.notes_url && (
                            <Button
                              component="a"
                              href={selectedContent.notes_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              variant="outlined"
                              size="small"
                              startIcon={<DescriptionIcon />}
                              sx={{ color: 'secondary.main', borderColor: 'secondary.main', '&:hover': { bgcolor: 'rgba(255, 122, 0, 0.1)' } }}
                            >
                              View Notes
                            </Button>
                          )}
                          {selectedContent.tests && selectedContent.tests.length > 0 && (
                            <Button variant="outlined" size="small" startIcon={<QuizIcon />} sx={{ color: 'secondary.main', borderColor: 'secondary.main', '&:hover': { bgcolor: 'rgba(255, 122, 0, 0.1)' } }}>Take Test</Button>
                          )}
                        </Box>
                      </Box>
                    )}
                  </Paper>
                )}
              </>
            ) : (
              /* ✅ NEW: All Content View */
              renderAllContent()
            )}

            {/* Demo Video Section */}
            {course.demo_video_url && !showAllContent && !userHasFullAccess && (
              <Paper elevation={0} sx={{ bgcolor: "background.paper", borderRadius: 3, p: 3, mt: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2, color: "secondary.main" }}>
                  <OndemandVideoIcon />
                  <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                    Watch the Welcome Video
                  </Typography>
                </Box>
                <Box sx={{ aspectRatio: "16/9", width: "100%", bgcolor: "black", borderRadius: 2, overflow: "hidden" }}>
                  <iframe
                    style={{ border: 0, width: "100%", height: "100%" }}
                    src={`https://www.youtube.com/embed/${getYouTubeVideoId(course.demo_video_url)}`}
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </Box>
              </Paper>
            )}

            {/* Details block */}
            {!showAllContent && (
              <Paper elevation={0} sx={{ bgcolor: "background.paper", borderRadius: 3, p: 3, mt: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3 }}>{course.title}</Typography>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <PersonIcon color="action" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">Instructor</Typography>
                        <Typography sx={{ fontWeight: "medium" }}>{course.speaker_name}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <WorkIcon color="action" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">Designation</Typography>
                        <Typography sx={{ fontWeight: "medium" }}>{course.speaker_designation}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <CalendarTodayIcon color="action" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">Published</Typography>
                        <Typography sx={{ fontWeight: "medium" }}>
                        {formatCourseDate(course.created_at)}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <GroupsIcon color="action" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">Total Enrollments</Typography>
                        <Typography sx={{ fontWeight: "medium" }}>{course.purchased_by_users?.length || 0}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>

                {course.description && (
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>About this Course</Typography>
                    <Typography color="text.secondary">{course.description}</Typography>
                  </Box>
                )}
              </Paper>
            )}
          </Grid>

          {/* Sidebar: course content */}
          <Grid item xs={12} lg={4}>
            <Paper elevation={0} sx={{ bgcolor: "background.paper", borderRadius: 3, p: 2, position: "sticky", top: 80 }}>
              <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2, px: 1 }}>Course Content</Typography>

              {/* ✅ NEW: View Toggle Button */}
              {(userHasFullAccess || isCourseFree) && (
                <Button
                  onClick={() => {
                    setShowAllContent(prev => !prev);
                  }}
                  variant="contained"
                  fullWidth
                  startIcon={<ViewListIcon />}
                  sx={{ mb: 2, bgcolor: isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)", "&:hover": { bgcolor: isDarkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)" } }}
                >
                  {showAllContent ? "Show Single Video" : "View All Content"}
                </Button>
              )}

              <List sx={{ maxHeight: "65vh", overflowY: "auto", p: 0 }}>
                {course.content.map((contentItem, index) => {
                  const hasAccess = userHasFullAccess || isCourseFree;
                  // ✅ FIXED: Check if THIS specific item is selected
                  const isSelected = !showAllContent && selectedContent?.id === contentItem.id;

                  return (
                    <ListItem key={contentItem.id} disablePadding>
                      <ListItemButton
                      key={contentItem.id}
                      onClick={() => {
                        if (hasAccess) {
                          setSelectedContent(contentItem);
                          setShowAllContent(false); // Switch back to single video view
                        }
                      }}
                      disabled={!hasAccess}
                      selected={isSelected}
                      sx={{
                        borderRadius: 2,
                        "&.Mui-selected": {
                          bgcolor: isDarkMode ? "rgba(255, 122, 0, 0.2)" : "secondary.light",
                          "&:hover": { bgcolor: isDarkMode ? "rgba(255, 122, 0, 0.3)" : "secondary.light" },
                        },
                        "&.Mui-disabled": { opacity: 0.6 },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 32 }}>
                          {isUpcomingContent(contentItem) ? (
                            <CalendarTodayIcon color="secondary" fontSize="small" />
                          ) : isSelected ? (
                            <CheckCircleIcon color="secondary" fontSize="small" />
                          ) : hasAccess ? (
                            <PlayArrowIcon color="success" fontSize="small" />
                          ) : (
                            <LockIcon color="action" fontSize="small" />
                          )}
                      </ListItemIcon>
                      <ListItemText
                        primary={`${index + 1}. ${contentItem.title}`}
                        secondary={contentItem.duration}
                        primaryTypographyProps={{ fontWeight: isSelected ? "bold" : "normal", color: "text.primary" }}
                        secondaryTypographyProps={{ color: "text.secondary" }}
                      />
                    </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>

              {/* ENROLL BUTTON */}
              {!userHasFullAccess && (
                <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                  {isCourseFree ? (
                    <Button
                      onClick={handleFreeEnrollment}
                      disabled={processing}
                      variant="contained"
                      fullWidth
                      sx={{ bgcolor: "success.main", "&:hover": { bgcolor: "success.dark" } }}
                    >
                      {processing ? "Processing..." : "Enroll for Free"}
                    </Button>
                  ) : (
                    <Button
                      onClick={handlePaidEnrollment}
                      variant="contained"
                      fullWidth
                      startIcon={<ShoppingCartIcon />}
                      sx={{ bgcolor: "secondary.main", "&:hover": { bgcolor: "secondary.dark" } }}
                    >
                      Enroll for ₹{course.price}
                    </Button>
                  )}
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* PAYMENT MODAL */}
      {showPaymentModal && course && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
          }}
          course={course}
          user={user}
          purchaseType={"purchase"}
          amount={course.price}
          onPurchaseSuccess={handlePaymentSuccess}
        />
      )}
    </Box>
  );
}