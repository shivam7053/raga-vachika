"use client";

import React from "react";
import { Box, Container, Typography, Link as MuiLink } from "@mui/material";

export default function CookiePolicyPage() {
  return (
    <Box sx={{ bgcolor: "#0A1929", color: "white", minHeight: "100vh" }}>
      <Container maxWidth="md" sx={{ pt: 20, pb: 12 }}>
        <Typography variant="h3" sx={{ fontWeight: "bold", mb: 6, textAlign: "center" }}>
          Cookie Policy
        </Typography>

        <Typography variant="body1" color="grey.300" sx={{ mb: 3 }}>
          This Cookie Policy explains how <strong>Raga Vachika</strong> uses cookies
          and similar technologies on our website.
        </Typography>

        <Typography variant="h5" sx={{ fontWeight: "bold", mt: 6, mb: 2, color: "#FF7A00" }}>
          1. What Are Cookies?
        </Typography>
        <Typography variant="body1" color="grey.300" sx={{ mb: 3 }}>
          Cookies are small text files stored on your device when you visit a
          website. They help us improve your browsing experience and analyze
          site usage.
        </Typography>

        <Typography variant="h5" sx={{ fontWeight: "bold", mt: 6, mb: 2, color: "#FF7A00" }}>
          2. Types of Cookies We Use
        </Typography>
        <Box component="ul" sx={{ listStyleType: "disc", pl: 4, mb: 3 }}>
          <Typography component="li" variant="body1" color="grey.300" sx={{ mb: 1 }}>
            <strong>Essential Cookies:</strong> Required for site functionality.
          </Typography>
          <Typography component="li" variant="body1" color="grey.300" sx={{ mb: 1 }}>
            <strong>Analytics Cookies:</strong> Help us understand usage
            patterns.
          </Typography>
          <Typography component="li" variant="body1" color="grey.300" sx={{ mb: 1 }}>
            <strong>Preference Cookies:</strong> Remember your settings and
            preferences.
          </Typography>
        </Box>

        <Typography variant="h5" sx={{ fontWeight: "bold", mt: 6, mb: 2, color: "#FF7A00" }}>
          3. Managing Cookies
        </Typography>
        <Typography variant="body1" color="grey.300" sx={{ mb: 3 }}>
          You can manage or disable cookies in your browser settings. However,
          some features may not function properly if cookies are disabled.
        </Typography>

        <Typography variant="h5" sx={{ fontWeight: "bold", mt: 6, mb: 2, color: "#FF7A00" }}>
          4. Third-Party Cookies
        </Typography>
        <Typography variant="body1" color="grey.300" sx={{ mb: 3 }}>
          We may use third-party tools such as Google Analytics and Razorpay
          that set their own cookies for analytics or payment processing.
        </Typography>

        <Typography variant="h5" sx={{ fontWeight: "bold", mt: 6, mb: 2, color: "#FF7A00" }}>
          5. Contact
        </Typography>
        <Typography variant="body1" color="grey.300" sx={{ mb: 3 }}>
          If you have any questions about this policy, contact us at{" "}
          <MuiLink
            href="mailto:india.growpro@gmail.com"
            color="#FF7A00"
            sx={{ textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
          >
            india.growpro@gmail.com
          </MuiLink>
          .
        </Typography>

        <Typography variant="body2" color="grey.500" sx={{ mt: 8 }}>
          <strong>Effective Date:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </Typography>
      </Container>
    </Box>
  );
}
