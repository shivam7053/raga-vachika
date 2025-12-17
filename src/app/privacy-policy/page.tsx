"use client";

import React from "react";
import { Box, Container, Typography, Link as MuiLink, useTheme } from "@mui/material";

export default function PrivacyPolicyPage() {
  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Container maxWidth="md" sx={{ pt: 20, pb: 12 }}>
        <Typography variant="h3" sx={{ fontWeight: "bold", mb: 6, textAlign: "center" }}>
          Privacy Policy
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          This Privacy Policy explains how <strong>Raga Vachika</strong> (“we”,
          “our”, “us”) collects, uses, and protects the personal information of
          users (“you”, “your”) who access our website and services.
        </Typography>

        <Typography variant="h5" sx={{ fontWeight: "bold", mt: 6, mb: 2, color: "secondary.main" }}>
          1. Information We Collect
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          We collect information you provide directly (such as name, email, and
          phone number), and automatically collected data (like IP address and
          usage details) to improve our services.
        </Typography>

        <Typography variant="h5" sx={{ fontWeight: "bold", mt: 6, mb: 2, color: "secondary.main" }}>
          2. How We Use Your Information
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          We use your data to process payments, provide courses, enhance
          user experience, send updates, and ensure compliance with legal
          requirements.
        </Typography>

        <Typography variant="h5" sx={{ fontWeight: "bold", mt: 6, mb: 2, color: "secondary.main" }}>
          3. Payment Information
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          All payment transactions are securely processed by{" "}
          <strong>Razorpay</strong>. We do not store your full card or payment
          details on our servers.
        </Typography>

        <Typography variant="h5" sx={{ fontWeight: "bold", mt: 6, mb: 2, color: "secondary.main" }}>
          4. Data Protection
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          We use industry-standard encryption and security measures to protect
          your data. However, no method of transmission is 100% secure, and we
          cannot guarantee absolute security.
        </Typography>

        <Typography variant="h5" sx={{ fontWeight: "bold", mt: 6, mb: 2, color: "secondary.main" }}>
          5. Your Rights
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          You can request access, correction, or deletion of your data by
          emailing us at{" "}
          <MuiLink
            href="mailto:india.growpro@gmail.com"
            color="secondary.main"
            sx={{ textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
          >
            india.growpro@gmail.com
          </MuiLink>
          .
        </Typography>

        <Typography variant="h5" sx={{ fontWeight: "bold", mt: 6, mb: 2, color: "secondary.main" }}>
          6. Updates
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          We may update this Privacy Policy occasionally. Updates will be posted
          on this page with a revised effective date.
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 8 }}>
          <strong>Effective Date:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </Typography>
      </Container>
    </Box>
  );
}
