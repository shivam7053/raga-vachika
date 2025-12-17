"use client";

import React from "react";
import { Box, Container, Typography, Link as MuiLink } from "@mui/material";

export default function TermsOfServicePage() {
  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Container maxWidth="md" sx={{ pt: 20, pb: 12 }}>
        <Typography variant="h3" sx={{ fontWeight: "bold", mb: 6, textAlign: "center" }}>
          Terms of Service
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Welcome to <strong>Raga Vachika</strong>. By accessing or using our website
          and services, you agree to these Terms of Service (“Terms”).
        </Typography>

        <Typography variant="h5" sx={{ fontWeight: "bold", mt: 6, mb: 2, color: "secondary.main" }}>
          1. Use of Services
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          You agree to use our services only for lawful purposes and in
          accordance with these Terms. Unauthorized access, copying, or resale
          of our materials is prohibited.
        </Typography>

        <Typography variant="h5" sx={{ fontWeight: "bold", mt: 6, mb: 2, color: "secondary.main" }}>
          2. Account Responsibilities
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          You are responsible for maintaining the confidentiality of your
          account credentials and for all activities under your account.
        </Typography>

        <Typography variant="h5" sx={{ fontWeight: "bold", mt: 6, mb: 2, color: "secondary.main" }}>
          3. Payments
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          All payments are processed through <strong>Razorpay</strong>. You
          agree to provide accurate billing information. We are not responsible
          for any payment processing errors made by Razorpay.
        </Typography>

        <Typography variant="h5" sx={{ fontWeight: "bold", mt: 6, mb: 2, color: "secondary.main" }}>
          4. Refund Policy
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Fees for courses or other paid services are non-refundable
          unless explicitly stated otherwise or required by law.
        </Typography>

        <Typography variant="h5" sx={{ fontWeight: "bold", mt: 6, mb: 2, color: "secondary.main" }}>
          5. Limitation of Liability
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Raga Vachika is not liable for indirect, incidental, or consequential
          damages arising from the use or inability to use our services.
        </Typography>

        <Typography variant="h5" sx={{ fontWeight: "bold", mt: 6, mb: 2, color: "secondary.main" }}>
          6. Contact Information
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          For any questions about these Terms, please contact us at{" "}
          <MuiLink
            href="mailto:india.growpro@gmail.com"
            color="secondary.main"
            sx={{ textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
          >
            india.growpro@gmail.com
          </MuiLink>{" "}
          or call{" "}
          <MuiLink
            href="tel:+919625003045"
            color="secondary.main"
            sx={{ textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
          >
            +91 9625003045
          </MuiLink>
          .
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 8 }}>
          <strong>Effective Date:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </Typography>
      </Container>
    </Box>
  );
}
