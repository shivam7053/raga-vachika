"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Course } from "@/types/masterclass";
import { formatMasterclassDate } from "@/utils/masterclass"; // Corrected to use the existing function name
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
  Typography,
  useTheme,
} from "@mui/material";
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';

interface CourseCardProps {
  course: Course;
  user: any;
}

export default function CourseCard({
  course,
  user,
}: CourseCardProps) {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);
  const theme = useTheme();

  if (!course?.id) {
    return (
      <Card sx={{ bgcolor: 'background.paper', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="error">Invalid course data</Typography>
      </Card>
    );
  }

  // --- New logic based on the `content` array ---
  const isEnrolled = user?.uid && course.purchased_by_users?.includes(user.uid);
  const isFree = course.type === 'free';
  const hasLiveSessions = course.content.some((c) => c.source === "zoom");

  const handleViewDetails = () => router.push(`/courses/${course.id}`);

  return (
    <Card sx={{ bgcolor: 'background.paper', height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3, transition: 'box-shadow 0.3s', '&:hover': { boxShadow: 6 } }}>
      <CardActionArea onClick={handleViewDetails}>
        <Box sx={{ position: 'relative', aspectRatio: '16/9' }}>
          <CardMedia
            component="img"
            image={!imageError && course.thumbnail_url ? course.thumbnail_url : '/placeholder.png'}
            alt={course.title}
            onError={() => setImageError(true)}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.3s',
              '&:hover': { transform: 'scale(1.05)' },
            }}
          />
          <Box sx={{ position: 'absolute', top: 8, left: 8, display: 'flex', gap: 1 }}>
            {isEnrolled && (
              <Chip icon={<CheckCircleIcon />} label="Enrolled" color="success" size="small" />
            )}
            {hasLiveSessions && (
              <Chip icon={<OndemandVideoIcon />} label="Live" color="secondary" size="small" />
            )}
            {course.demo_video_url && !isEnrolled && (
              <Chip icon={<PlayCircleOutlineIcon />} label="Preview" color="warning" size="small" />
            )}
          </Box>

          <Chip
            label={isFree ? "FREE" : `₹${course.price}`}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: isFree ? 'success.main' : 'secondary.main',
              color: 'white',
              fontWeight: 'bold',
            }}
          />
        </Box>

        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 1, flexGrow: 1 }}>
            {course.title}
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, color: 'text.secondary', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon fontSize="small" />
              <Typography variant="body2">{course.speaker_name}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WorkIcon fontSize="small" />
              <Typography variant="body2">{course.speaker_designation}</Typography>
            </Box>
            {course.created_at && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarTodayIcon fontSize="small" />
                <Typography variant="body2">{formatMasterclassDate(course.created_at)}</Typography>
              </Box>
            )}
          </Box>

          <Button
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 'auto' }}
          >
            View Details
          </Button>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
