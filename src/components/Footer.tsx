"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Box, Container, Grid, Typography, Link as MuiLink, IconButton, Divider, Stack, useTheme } from "@mui/material";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import InstagramIcon from "@mui/icons-material/Instagram";
import { palette } from "@mui/system";

export default function Footer() {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  return (
    <Box
      component={motion.footer}
      sx={{
        bgcolor: isDarkMode ? "#061321" : theme.palette.background.paper, // Darker blue for dark, paper for light
        color: isDarkMode ? "grey.400" : theme.palette.text.secondary, // Theme-aware text color
        py: 8,
        position: "relative",
        zIndex: 10,
      }}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
      variants={fadeInUp}
    >
      <Container maxWidth="lg">
        <Grid container spacing={5}>
          {/* Company Info */}
          <Grid item xs={12} md={4}>
            <Link href="/">
              <Box
                component="img"
                src="/logo.png" // Using the single logo
                alt="Raga Vachika"
                sx={{
                  height: 60,
                  width: "auto",
                  mb: 2,
                }}
              />
            </Link>

            <Typography variant="body2" sx={{ mb: 3 }}>
              Education Reimagined. We provide top-quality, engaging learning
              experiences for students in grades 5-12 to help them achieve
              academic excellence.
            </Typography>

            <Box>
              <IconButton
                component="a"
                href="https://www.linkedin.com/company/growproworld/"
                target="_blank"
                sx={{ color: isDarkMode ? "grey.500" : theme.palette.text.secondary, "&:hover": { color: theme.palette.secondary.main } }}
              >
                <LinkedInIcon />
              </IconButton>
              <IconButton
                component="a"
                href="https://www.instagram.com/growpro.world?igsh=MW5sNzNkcTBxcTZ3aQ=="
                target="_blank"
                sx={{ color: isDarkMode ? "grey.500" : theme.palette.text.secondary, "&:hover": { color: theme.palette.secondary.main } }}
              >
                <InstagramIcon />
              </IconButton>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={6} md={2}>
            <Typography variant="h6" sx={{ color: isDarkMode ? "white" : theme.palette.text.primary, fontWeight: "bold", mb: 2 }}>
              Platform
            </Typography>
            <Stack spacing={1.5}>
              <MuiLink component={Link} href="/" color="inherit" sx={{ textDecoration: "none", "&:hover": { color: isDarkMode ? "white" : theme.palette.primary.main } }}>Home</MuiLink>
              <MuiLink component={Link} href="/courses" color="inherit" sx={{ textDecoration: "none", "&:hover": { color: isDarkMode ? "white" : theme.palette.primary.main } }}>Courses</MuiLink>
              <MuiLink component={Link} href="/about" color="inherit" sx={{ textDecoration: "none", "&:hover": { color: isDarkMode ? "white" : theme.palette.primary.main } }}>About Us</MuiLink>
              <MuiLink component={Link} href="/contact" color="inherit" sx={{ textDecoration: "none", "&:hover": { color: isDarkMode ? "white" : theme.palette.primary.main } }}>Contact</MuiLink>
            </Stack>
          </Grid>

          {/* Legal */}
          <Grid item xs={6} md={2}>
            <Typography variant="h6" sx={{ color: isDarkMode ? "white" : theme.palette.text.primary, fontWeight: "bold", mb: 2 }}>
              Legal
            </Typography>
            <Stack spacing={1.5}>
              <MuiLink component={Link} href="/privacy-policy" color="inherit" sx={{ textDecoration: "none", "&:hover": { color: isDarkMode ? "white" : theme.palette.primary.main } }}>Privacy Policy</MuiLink>
              <MuiLink component={Link} href="/terms-of-service" color="inherit" sx={{ textDecoration: "none", "&:hover": { color: isDarkMode ? "white" : theme.palette.primary.main } }}>Terms of Service</MuiLink>
              <MuiLink component={Link} href="/cookie-policy" color="inherit" sx={{ textDecoration: "none", "&:hover": { color: isDarkMode ? "white" : theme.palette.primary.main } }}>Cookie Policy</MuiLink>
            </Stack>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" sx={{ color: isDarkMode ? "white" : theme.palette.text.primary, fontWeight: "bold", mb: 2 }}>
              Contact Us
            </Typography>
            <Stack spacing={2}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <MailOutlineIcon sx={{ color: theme.palette.secondary.main }} />
                <Typography variant="body2" color="inherit">India.growpro@gmail.com</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <PhoneIcon sx={{ color: theme.palette.secondary.main }} />
                <Typography variant="body2" color="inherit">+91 9625003045</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <LocationOnIcon sx={{ color: theme.palette.secondary.main }} />
                <Typography variant="body2" color="inherit">New Delhi, India</Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>

        {/* Bottom Section */}
        <Divider sx={{ my: 6, borderColor: theme.palette.divider }} />

        <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="body2" color="inherit" sx={{ mb: { xs: 2, sm: 0 } }}>
            © {new Date().getFullYear()} Raga Vachika. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
