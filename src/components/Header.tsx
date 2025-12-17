// components/Header.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation"; // Keep Next.js navigation
import { motion, AnimatePresence } from "framer-motion";
import {
  AppBar,
  Toolbar,
  IconButton,
  Badge,
  Box,
  Button,
  Typography,
} from "@mui/material"; // MUI components
import AccountCircleIcon from "@mui/icons-material/AccountCircle"; // User icon
import SettingsIcon from "@mui/icons-material/Settings"; // Settings icon
import LightModeIcon from "@mui/icons-material/LightMode"; // Sun icon
import DarkModeIcon from "@mui/icons-material/DarkMode"; // Moon icon
import NotificationsIcon from "@mui/icons-material/Notifications"; // Bell icon
import CloseIcon from "@mui/icons-material/Close"; // X icon
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, doc, updateDoc, limit } from "firebase/firestore";
import { useAuth } from "@/context/AuthContexts";
import { useTheme } from "next-themes";
import { AppNotification } from "@/types/masterclass";
import NotificationCard from "./NotificationCard"; // ⭐ Import NotificationCard

interface HeaderProps {
  transparent?: boolean;
}

export default function Header({ transparent = false }: HeaderProps) {
  const { user, userProfile, signOut, loading, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const muiTheme = useTheme(); // MUI theme for palette access
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isNotificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    setMounted(true);

    if (!user?.uid) {
      setNotifications([]);
      return;
    }

    // Listen for real-time notifications (only latest 5 for dropdown)
    const q = query(
      collection(db, `user_profiles/${user.uid}/notifications`), 
      orderBy("createdAt", "desc"),
      limit(5)
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const notifs = querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as AppNotification));
      setNotifications(notifs);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (id: string) => {
    if (!user?.uid) return;
    try {
      const notifRef = doc(db, `user_profiles/${user.uid}/notifications`, id);
      await updateDoc(notifRef, { read: true });
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const handleDismiss = async (id: string) => {
    if (!user?.uid) return;
    try {
      const notifRef = doc(db, `user_profiles/${user.uid}/notifications`, id);
      await updateDoc(notifRef, { dismissed: true });
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error("Error dismissing:", error);
    }
  };

  const handleNotificationClick = (notification: AppNotification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    setNotificationOpen(false);
    if (notification.ctaLink) {
      router.push(notification.ctaLink);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const isActive = (path: string) => pathname === path;

  return (
    <AppBar
      component={motion.header}
      position="fixed"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      elevation={transparent ? 0 : 1}
      sx={(theme) => ({
        bgcolor: transparent
          ? "transparent"
          : theme.palette.mode === 'dark'
          ? "rgba(10, 25, 41, 0.85)" // Dark Blue with transparency
          : "rgba(227, 242, 253, 0.85)", // Sky Blue with transparency
        backdropFilter: transparent ? "none" : "blur(8px)",
        color: theme.palette.mode === 'dark' ? "white" : "#0D47A1", // Dark blue text for light theme
        boxShadow: transparent ? 'none' : theme.shadows[1],
        transition: "background-color 0.5s ease, box-shadow 0.5s ease, color 0.5s ease",
        zIndex: 1000,
        // Ensure icons inherit the new color
        '.MuiIconButton-root': {
          color: 'inherit'
        }
      })}
    >
      <Toolbar sx={{ height: 96, justifyContent: "space-between" }}>
        {/* Logo */}
        <Link
            href="/"
            style={{ textDecoration: "none" }} // Remove underline from Link
          >
            <Box
              component="img"
              src="/logo.png" // Single logo for both themes
              alt="Raga Vachika"
              sx={{
                height: 72, // Increased logo height
                width: "auto",
                objectFit: "contain",
                transition: "transform 0.3s ease",
                "&:hover": {
                  transform: "scale(1.05)",
                },
              }}
            />
          </Link>

        {/* Navigation */}
        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            alignItems: "center",
            gap: 2, // Increased gap for more spacing
          }}
        >
          {[
            { path: "/", label: "Home" },
            { path: "/contact", label: "Contact Us" },
            { path: "/about", label: "About Us" },
            { path: "/courses", label: "Courses" }, // Changed from Master Classes
          ].map((link) => (
            <Button
              key={link.path}
              component={Link}
              href={link.path}
              sx={{
                px: 3,
                py: 1,
                borderRadius: "50px",
                fontSize: "1rem", // Slightly larger font
                fontWeight: "medium",
                color: "inherit",
                transition: "background-color 0.3s ease, color 0.3s ease",
                bgcolor: isActive(link.path) ? "#FF7A00" : "transparent",
                color: isActive(link.path) ? "white" : "inherit",
                "&:hover": {
                  bgcolor: isActive(link.path) ? "#FF9933" : (resolvedTheme === 'dark' ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.08)"),
                },
              }}
            >
              {link.label}
            </Button>
          ))}
        </Box>

        {/* Right Actions */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* Notification Bell */}
          {user && (
            <Box sx={{ position: "relative" }}>
              <IconButton
                onClick={() => setNotificationOpen((prev) => !prev)}
                color="inherit"
                sx={(theme) => ({
                  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(13, 71, 161, 0.3)'}`,
                  "&:hover": {
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(13, 71, 161, 0.1)',
                  },
                })}
                title="Notifications"
              >
                <Badge badgeContent={unreadCount > 9 ? "9+" : unreadCount} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>

              {/* Notification Dropdown Panel */}
              <AnimatePresence>
                {isNotificationOpen && (
                  <>
                    {/* Backdrop */}
                    <Box
                      sx={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 1040, // Below the panel, above other content
                      }}
                      onClick={() => setNotificationOpen(false)}
                    />

                    {/* Panel */}
                    <Box
                      component={motion.div}
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      sx={(theme) => ({
                        position: "absolute",
                        top: 72, // Adjusted for new toolbar height
                        right: 0,
                        width: 380, // Increased width for better readability
                        bgcolor: theme.palette.mode === 'dark' ? "#102A43" : "#FFFFFF",
                        color: theme.palette.text.primary,
                        borderRadius: 2,
                        boxShadow: "0px 8px 24px rgba(0,0,0,0.5)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        zIndex: 1050,
                        overflow: "hidden",
                      })}
                    >
                      {/* Header */}
                      <Box
                        sx={(theme) => ({
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          p: 2,
                          borderBottom: `1px solid ${theme.palette.divider}`,
                          bgcolor: "rgba(255, 122, 0, 0.1)", // Orange tint
                        })}
                      >
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                            Notifications
                          </Typography>
                          {unreadCount > 0 && (
                            <Typography variant="body2" color="grey.400">
                              {unreadCount} unread {/** This color will be inherited */}
                            </Typography>
                          )}
                        </Box>
                        <IconButton
                          onClick={() => setNotificationOpen(false)}
                          color="inherit"
                          size="small"
                        >
                          <CloseIcon />
                        </IconButton>
                      </Box>

                      {/* Notifications List */}
                      <Box sx={{ maxHeight: 400, overflowY: "auto" }}>
                        {notifications.length > 0 ? ( // The NotificationCard itself will need to be theme-aware
                          <Box sx={(theme) => ({
                              "& > div:not(:last-of-type)": {
                                borderBottom: `1px solid ${theme.palette.divider}`,
                              },
                            })}>
                            {notifications.map((notification) => (
                              <Box
                                key={notification.id}
                                sx={{
                                  "&:hover": {
                                    bgcolor: resolvedTheme === 'dark' ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.04)",
                                  },
                                }}
                              >
                                <NotificationCard
                                  notification={notification}
                                  onMarkAsRead={markAsRead}
                                  onDismiss={handleDismiss}
                                  onClick={() => handleNotificationClick(notification)}
                                />
                              </Box>
                            ))}
                          </Box>
                        ) : (
                          <Box sx={{ p: 3, textAlign: "center" }}>
                            <NotificationsIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
                            <Typography variant="body2" color="text.secondary">
                              No notifications yet
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      {/* Footer */}
                      <Box
                        sx={(theme) => ({
                          p: 1.5,
                          bgcolor: theme.palette.mode === 'dark' ? "rgba(0,0,0,0.2)" : "grey.100",
                          textAlign: "center",
                          borderTop: `1px solid ${theme.palette.divider}`,
                        })}
                      >
                        <Button
                          component={Link}
                          href="/notifications"
                          onClick={() => setNotificationOpen(false)}
                          sx={{
                            color: "#FF7A00",
                            textTransform: "none",
                            "&:hover": {
                              textDecoration: "underline",
                              bgcolor: "transparent",
                            },
                          }}
                        >
                          View all notifications
                        </Button>
                      </Box>
                    </Box>
                  </>
                )}
              </AnimatePresence>
            </Box>
          )}

          {/* Theme Toggle Button */}
          <IconButton
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            color="inherit"
            sx={(theme) => ({
              border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(13, 71, 161, 0.3)'}`,
              "&:hover": {
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(13, 71, 161, 0.1)',
              },
            })}
            title="Toggle Theme"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={theme}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {theme === "light" ? (
                  <DarkModeIcon /> // Show moon in light mode
                ) : (
                  <LightModeIcon sx={{ color: "#FFC107" }} /> // Show sun in dark mode
                )}
              </motion.div>
            </AnimatePresence>
          </IconButton>

          {loading ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{ bgcolor: "rgba(255,255,255,0.1)", height: 40, width: 80, borderRadius: "50px" }}
              />
              <Box
                sx={{ bgcolor: "rgba(255,255,255,0.1)", height: 40, width: 100, borderRadius: "50px" }}
              />
            </Box>
          ) : user ? (
            <>
              {isAdmin && (
                <Button
                  component={Link}
                  href="/admin"
                  variant="contained"
                  sx={{
                    bgcolor: "#FF7A00",
                    color: "white",
                    borderRadius: "50px",
                    px: 2,
                    py: 1,
                    fontSize: "0.875rem",
                    fontWeight: "bold",
                    "&:hover": { bgcolor: "#FF9933" },
                  }}
                >
                  Admin
                </Button>
              )}

              <Button
                component={Link}
                href="/profile"
                sx={(theme) => ({
                  alignItems: "center",
                  gap: 1,
                  color: "inherit",
                  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(13, 71, 161, 0.3)'}`,
                  borderRadius: "50px",
                  px: 2,
                  py: 1,
                  fontSize: "0.875rem",
                  fontWeight: "medium",
                  textTransform: "none",
                  "&:hover": {
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(13, 71, 161, 0.1)',
                    borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(13, 71, 161, 0.5)',
                  },
                })}
              >
                {userProfile?.avatar_url ? (
                  <Box
                    component="img"
                    src={userProfile.avatar_url}
                    alt="Profile"
                    sx={{ width: 24, height: 24, borderRadius: "50%", objectFit: "cover" }}
                  />
                ) : (
                  <AccountCircleIcon sx={{ fontSize: 20 }} />
                )}
                <Typography variant="body2">{userProfile?.full_name || "Profile"}</Typography>
                <SettingsIcon sx={{ fontSize: 16 }} />
              </Button>

              <Button
                onClick={handleSignOut}
                sx={(theme) => ({
                  color: "inherit",
                  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(13, 71, 161, 0.3)'}`,
                  borderRadius: "50px",
                  px: 2,
                  py: 1,
                  fontSize: "0.875rem",
                  fontWeight: "medium",
                  textTransform: "none",
                  "&:hover": {
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(13, 71, 161, 0.1)',
                  },
                })}
              >
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button
                component={Link}
                href="/signin"
                sx={(theme) => ({
                  color: "inherit",
                  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(13, 71, 161, 0.3)'}`,
                  borderRadius: "50px",
                  px: 2,
                  py: 1,
                  fontSize: "0.875rem",
                  fontWeight: "medium",
                  textTransform: "none",
                  "&:hover": {
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(13, 71, 161, 0.1)',
                  },
                })}
              >
                Sign In
              </Button>
              <Button
                component={Link}
                href="/signup"
                variant="contained"
                sx={{
                  bgcolor: "#FF7A00",
                  color: "white",
                  borderRadius: "50px",
                  px: 2,
                  py: 1,
                  fontSize: "0.875rem",
                  fontWeight: "bold",
                  "&:hover": { bgcolor: "#FF9933" },
                }}
              >
                Join Now
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}