//app/notifications/page.tsx

'use client';

import { useState, useEffect } from 'react';
import NextLink from 'next/link';
import { useAuth } from '@/context/AuthContexts'; // Assuming this is the correct path
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, writeBatch, updateDoc, where, getDocs } from 'firebase/firestore';
import { AppNotification } from '@/types/masterclass';
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  Typography,
  useTheme,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import NotificationCard from '@/components/NotificationCard'; // ⭐ Import the new component

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, `user_profiles/${user.uid}/notifications`), 
      // ✅ FIX: Use an equality '==' check instead of '!='. This is more efficient and allows ordering by other fields.
      where("dismissed", "==", false),
      orderBy('createdAt', 'desc') // Then you can order by other fields.
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as AppNotification));
      setNotifications(notifs);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching notifications:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const handleMarkAsRead = async (id: string) => {
    if (!user?.uid) return;
    
    try {
      const notifRef = doc(db, `user_profiles/${user.uid}/notifications`, id);
      await updateDoc(notifRef, { read: true });
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.uid) return;

    // ✅ FIX: Re-fetch the documents to ensure we operate on the current state, avoiding race conditions.
    const userNotificationsRef = collection(db, `user_profiles/${user.uid}/notifications`);
    const q = query(userNotificationsRef, where("read", "==", false), where("dismissed", "==", false));
    
    try {
      const unreadSnapshot = await getDocs(q);
      if (unreadSnapshot.empty) return;

      const batch = writeBatch(db);
      unreadSnapshot.forEach(doc => {
        batch.update(doc.ref, { read: true });
      });
      await batch.commit();
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const handleClearAll = async () => {
    if (!user?.uid || notifications.length === 0) return;

    if (!window.confirm("Are you sure you want to clear all your notifications? This action cannot be undone.")) {
      return;
    }

    // ✅ FIX: Re-fetch all non-dismissed notifications to ensure we delete only what currently exists.
    const userNotificationsRef = collection(db, `user_profiles/${user.uid}/notifications`);
    const q = query(userNotificationsRef, where("dismissed", "==", false));
    
    try {
      const snapshot = await getDocs(q);
      if (snapshot.empty) return;

      const batch = writeBatch(db);
      snapshot.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
    } catch (error) {
      console.error("Error clearing all notifications:", error);
      alert("Failed to clear notifications. Please try again.");
    }
  };

  const handleDismiss = async (id: string) => {
    if (!user?.uid) return;
    
    try {
      const notifRef = doc(db, `user_profiles/${user.uid}/notifications`, id);
      await updateDoc(notifRef, { dismissed: true });
    } catch (error) {
      console.error("Error dismissing notification:", error);
    }
  };

  const handleNotificationClick = (notification: AppNotification) => {
    // Mark as read when clicked
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
    
    // Navigate if there's a CTA link
    if (notification.ctaLink) {
      window.location.href = notification.ctaLink;
    }
  };

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress sx={{ color: "#FF7A00" }} />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", p: 3 }}>
        <NotificationsIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
        <Typography variant="h4" sx={{ fontWeight: "bold", color: "text.primary", mb: 1 }}>
          You need to be logged in
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Sign in to view your notifications.
        </Typography>
        <Button
          component={NextLink}
          href="/signin"
          variant="contained"
          sx={{ bgcolor: "#FF7A00", "&:hover": { bgcolor: "#FF9933" } }}
        >
          Sign In
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Container maxWidth="md" sx={{ pt: 16, pb: 12 }}>
        {/* Header */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h3" sx={{ fontWeight: "bold", color: "text.primary", mb: 1 }}>
            Notifications
          </Typography>
          <Typography color="text.secondary">
            {unreadCount > 0 
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
              : 'You\'re all caught up! 🎉'
            }
          </Typography>
        </Box>

        {/* Filter & Actions Bar */}
        <Paper
          elevation={0}
          sx={{ bgcolor: "background.paper", p: 2, mb: 4, borderRadius: 3 }}
        >
          <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
            {/* Filter Tabs */}
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                onClick={() => setFilter('all')}
                variant={filter === 'all' ? "contained" : "text"}
                sx={{
                  bgcolor: filter === 'all' ? "secondary.main" : "transparent",
                  color: filter === 'all' ? "white" : "text.primary",
                  "&:hover": { bgcolor: filter === 'all' ? "secondary.dark" : "action.hover" },
                }}
              >
                All ({notifications.length})
              </Button>
              <Button
                onClick={() => setFilter('unread')}
                variant={filter === 'unread' ? "contained" : "text"}
                sx={{
                  bgcolor: filter === 'unread' ? "secondary.main" : "transparent",
                  color: filter === 'unread' ? "white" : "text.primary",
                  "&:hover": { bgcolor: filter === 'unread' ? "secondary.dark" : "action.hover" },
                }}
              >
                Unread ({unreadCount})
              </Button>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {unreadCount > 0 && (
                <Button
                  onClick={handleMarkAllAsRead}
                  startIcon={<DoneAllIcon />}
                  size="small"
                  sx={{ color: "text.secondary", "&:hover": { color: "text.primary", bgcolor: "action.hover" } }}
                >
                  Mark all as read
                </Button>
              )}
              {notifications.length > 0 && (
                <Button
                  onClick={handleClearAll}
                  startIcon={<DeleteSweepIcon />}
                  size="small"
                  sx={{ color: "error.main", "&:hover": { bgcolor: "rgba(244, 67, 54, 0.1)" } }}
                >
                  Clear All
                </Button>
              )}
            </Box>
          </Box>
        </Paper>

        {/* Notifications List */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map(notification => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
                onDismiss={handleDismiss}
                onClick={() => handleNotificationClick(notification)}
              />
            ))
          ) : (
            <Paper elevation={0} sx={{ bgcolor: "background.paper", textAlign: "center", p: 8, borderRadius: 3 }}>
              <MailOutlineIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: "bold", color: "text.primary", mb: 1 }}>
                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </Typography>
              <Typography color="text.secondary">
                {filter === 'unread' 
                  ? 'You\'re all caught up! Check back later for updates.'
                  : 'You\'ll see notifications here when there are updates.'
                }
              </Typography>
            </Paper>
          )}
        </Box>
      </Container>
    </Box>
  );
}