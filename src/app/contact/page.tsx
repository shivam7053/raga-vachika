"use client";

import React, { useState } from "react";
import { motion, Variants } from "framer-motion";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  Paper,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import SendIcon from "@mui/icons-material/Send";
import toast from "react-hot-toast";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function ContactUsPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [sending, setSending] = useState(false);
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    try {
      await addDoc(collection(db, "contacts"), {
        ...formData,
        createdAt: serverTimestamp(),
      });

      toast.success("Message sent successfully!");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      console.error("Error saving message:", error);
      toast.error("Failed to send message. Try again later!");
    } finally {
      setSending(false);
    }
  };

  // ✅ Fixed and typed fadeInUp variant
  const fadeInUp: Variants = {
    initial: { opacity: 0, y: 30 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
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

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Container maxWidth="lg" sx={{ pt: 20, pb: 12 }}>
          {/* Header */}
        <Box
          component={motion.div}
            initial="initial"
            animate="animate"
            variants={fadeInUp}
          sx={{ textAlign: "center", mb: 10 }}
          >
          <Typography
            variant="h2"
            component="h1"
            sx={{ fontWeight: "bold", mb: 2 }}
          >
              Get in Touch
          </Typography>
          <Typography
            variant="h5"
            color="text.secondary"
            sx={{ maxWidth: "750px", mx: "auto" }}
          >
            Have questions about our courses, the admission process, or anything
            else? We're here to help.
          </Typography>
        </Box>

        <Grid container spacing={6}>
            {/* Contact Form */}
          <Grid item xs={12} md={7}>
            <Paper
              component={motion.div}
              initial="initial"
              animate="animate"
              variants={fadeInUp}
              elevation={0}
              sx={{ bgcolor: "background.paper", p: 4, borderRadius: 3 }}
            >
              <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3 }}>
                Send us a Message
              </Typography>

              <form onSubmit={handleSubmit} className="space-y-6">
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="text"
                      label="Full Name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, name: e.target.value }))
                      }
                      placeholder="Enter your full name"
                      required
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "&.Mui-focused fieldset": {
                            borderColor: "secondary.main",
                          },
                        },
                        "& .MuiInputLabel-root.Mui-focused": {
                          color: "secondary.main",
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="email"
                      label="Email Address"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, email: e.target.value }))
                      }
                      placeholder="Enter your email"
                      required
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "&.Mui-focused fieldset": {
                            borderColor: "secondary.main",
                          },
                        },
                        "& .MuiInputLabel-root.Mui-focused": {
                          color: "secondary.main",
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                    type="text"
                      label="Subject"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, subject: e.target.value }))
                    }
                    placeholder="Enter subject"
                    required
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "&.Mui-focused fieldset": {
                          borderColor: "secondary.main",
                        },
                      },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: "secondary.main",
                      },
                    }}
                  />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={5}
                      label="Message"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, message: e.target.value }))
                    }
                    placeholder="Write your message here..."
                    required
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "&.Mui-focused fieldset": {
                          borderColor: "secondary.main",
                        },
                      },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: "secondary.main",
                      },
                    }}
                  />
                  </Grid>
                </Grid>

                <Button
                  type="submit"
                  disabled={sending}
                  variant="contained"
                  fullWidth
                  endIcon={!sending && <SendIcon />}
                  sx={{
                    py: 1.5,
                    fontSize: "1rem",
                    fontWeight: "bold",
                    bgcolor: "#FF7A00",
                    "&:hover": { bgcolor: "#FF9933" },
                  }}
                >
                  {sending ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Send Message"
                  )}
                </Button>
              </form>
            </Paper>
          </Grid>

            {/* Contact Information */}
          <Grid
            item
            xs={12}
            md={5}
            component={motion.div}
              initial="initial"
              animate="animate"
              variants={staggerChildren}
            >
            <Paper
              component={motion.div}
                variants={fadeInUp}
              elevation={0}
              sx={{
                bgcolor: "background.paper",
                p: 4,
                borderRadius: 3,
                height: "100%",
              }}
              >
              <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3 }}>
                  Contact Information
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: isDarkMode ? "rgba(255, 122, 0, 0.1)" : "secondary.light",
                    }}
                  >
                    <MailOutlineIcon color="secondary" />
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: "bold" }}>Email</Typography>
                    <Typography color="text.secondary">
                      India.growpro@gmail.com
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: isDarkMode ? "rgba(255, 122, 0, 0.1)" : "secondary.light",
                    }}
                  >
                    <PhoneIcon color="secondary" />
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: "bold" }}>Phone</Typography>
                    <Typography color="text.secondary">+91 9625003045</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: isDarkMode ? "rgba(255, 122, 0, 0.1)" : "secondary.light",
                    }}
                  >
                    <LocationOnIcon color="secondary" />
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: "bold" }}>Address</Typography>
                    <Typography color="text.secondary">New Delhi, India</Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
