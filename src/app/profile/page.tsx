// app/profile/page.tsx

"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import NextLink from "next/link";
import { motion, Variants } from "framer-motion";
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Avatar,
  IconButton,
  Button,
  CircularProgress,
  useTheme,
} from "@mui/material";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import PhoneIcon from "@mui/icons-material/Phone";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import SaveIcon from "@mui/icons-material/Save";
import ReceiptIcon from "@mui/icons-material/Receipt";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import { useAuth } from "@/context/AuthContexts";
import toast from "react-hot-toast";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import UserForm from "@/components/UserForm";
import { UserProfile } from "@/types/masterclass"; // ✅ Single source of truth

export default function ProfilePage() {
  const { user, userProfile, updateProfile, loading } = useAuth();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  // ✅ useState now strongly typed with imported UserProfile
  const [formData, setFormData] = useState<UserProfile>({
    id: "",
    full_name: "",
    email: "",
    avatar_url: "",
    phone: "",
    bio: "",
    linkedin: "",
    created_at: "",
    transactions: [],
  });

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setFormData({
        id: userProfile.id,
        full_name: userProfile.full_name || "",
        email: userProfile.email || "",
        avatar_url: userProfile.avatar_url || "",
        phone: userProfile.phone || "",
        bio: userProfile.bio || "",
        linkedin: userProfile.linkedin || "",
        created_at: userProfile.created_at || "",
        transactions: userProfile.transactions || [],
      });
    }
  }, [userProfile]);

  const handleFieldChange = (field: keyof UserProfile, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAvatarUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `avatars/${user.uid}/${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      setFormData((prev) => ({ ...prev, avatar_url: downloadURL }));
      toast.success("✅ Avatar uploaded successfully!");
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("❌ Failed to upload avatar");
    } finally {
      setUploading(false);
    }
  };

  const validateForm = () => {
    if (!formData.full_name.trim()) {
      toast.error("Please enter your full name");
      return false;
    }
    if (formData.bio && formData.bio.length < 20) {
      toast.error("Bio must be at least 20 characters");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSaving(true);
    try {
      await updateProfile(formData);
      toast.success("🎉 Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("❌ Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  // ✅ Type-safe Framer Motion variants
  const fadeInUp: Variants = {
    initial: { opacity: 0, y: 30 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  if (loading)
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress sx={{ color: "#FF7A00" }} />
      </Box>
    );

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Container maxWidth="lg" sx={{ pt: 16, pb: 12 }}>
          {/* ===== Header ===== */}
        <Box
          component={motion.div}
            initial="initial"
            animate="animate"
            variants={fadeInUp}
          sx={{ textAlign: "center", mb: 8 }}
          >
          <Typography variant="h3" sx={{ fontWeight: "bold", mb: 1 }}>Edit Profile</Typography>
          <Typography color="text.secondary">
              Update your information to personalize your experience.
          </Typography>
        </Box>

        <Grid container spacing={4}>
            {/* ===== Left Profile Card ===== */}
          <Grid
            item
            xs={12}
            md={4}
            component={motion.div}
              variants={fadeInUp}
              initial="initial"
              animate="animate"
            >
            <Paper
              elevation={0}
              sx={{ bgcolor: "background.paper", p: 3, textAlign: "center", borderRadius: 3 }}
              >
                {/* Avatar Upload */}
              <Box sx={{ position: "relative", display: "inline-block", mb: 2 }}>
                <Avatar
                  src={formData.avatar_url}
                  alt={formData.full_name}
                  sx={{ width: 120, height: 120, mx: "auto", border: `3px solid ${theme.palette.secondary.main}` }}
                />
                  <label
                    htmlFor="avatar-upload"
                  >
                  <IconButton
                    component="span"
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      bgcolor: "secondary.main",
                      color: theme.palette.getContrastText(theme.palette.secondary.main),
                      "&:hover": { bgcolor: "#FF9933" },
                    }}
                  >
                    <PhotoCameraIcon fontSize="small" />
                  </IconButton>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                    hidden
                    />
                  </label>
              </Box>

                {/* Basic Info */}
              <Typography variant="h5" sx={{ fontWeight: "bold", mb: 0.5 }}>
                  {formData.full_name || "Your Name"}
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 2, textTransform: "capitalize" }}>
                  {formData.linkedin ? "Professional" : "New User"}
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1, alignItems: "center", mb: 4 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <MailOutlineIcon sx={{ color: "text.secondary", fontSize: 16 }} />
                  <Typography variant="body2">{formData.email}</Typography>
                </Box>
                  {formData.phone && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <PhoneIcon sx={{ color: "text.secondary", fontSize: 16 }} />
                    <Typography variant="body2">{formData.phone}</Typography>
                  </Box>
                  )}
              </Box>

                {/* Navigation Buttons */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Button
                  component={NextLink}
                  href="/purchases"
                  variant="contained"
                  startIcon={<ShoppingBagIcon />}
                  sx={{ bgcolor: isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)", "&:hover": { bgcolor: isDarkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)" } }}
                >
                  View Purchased Courses
                </Button>
                <Button
                  component={NextLink}
                  href="/transactions"
                  variant="contained"
                  startIcon={<ReceiptIcon />}
                  sx={{ bgcolor: isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)", "&:hover": { bgcolor: isDarkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)" } }}
                >
                  View Transactions
                </Button>
              </Box>
            </Paper>
          </Grid>

            {/* ===== Right Form Section ===== */}
          <Grid
            item
            xs={12}
            md={8}
            component={motion.div}
              variants={fadeInUp}
              initial="initial"
              animate="animate"
            >
            <Paper
              elevation={0}
              sx={{ bgcolor: "background.paper", p: 4, borderRadius: 3 }}
              >
                <form onSubmit={handleSubmit} className="space-y-6">
                  <UserForm userData={formData} onChange={handleFieldChange} />
                <Button
                    type="submit"
                    disabled={saving || uploading}
                  variant="contained"
                  fullWidth
                  startIcon={!saving && !uploading && <SaveIcon />}
                  sx={{
                    py: 1.5,
                    fontSize: "1rem",
                    fontWeight: "bold",
                    bgcolor: "secondary.main",
                    "&:hover": { bgcolor: "#FF9933" },
                  }}
                  >
                  {uploading || saving ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Save Profile"
                  )}
                </Button>
                </form>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}