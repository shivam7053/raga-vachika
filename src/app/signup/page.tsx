"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import NextLink from "next/link";
import { useAuth } from "@/context/AuthContexts";
import UserForm from "@/components/UserForm";
import { UserProfile } from "@/types/masterclass";
import { toast } from "react-hot-toast";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Container,
  Divider,
  FormControlLabel,
  Grid,
  Paper,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";

export default function SignUpPage() {
  const router = useRouter();
  const { signUp, signInWithGoogle } = useAuth();
  const [userData, setUserData] = useState<UserProfile>({
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

  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const handleFieldChange = (field: keyof UserProfile, value: string) => {
    setUserData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!userData.email || !userData.full_name) {
        toast.error("Please fill out all required fields.");
        return;
      }

      await signUp(userData.email, password, userData.full_name);
      toast.success("Account created successfully!");
      router.push("/");
    } catch (error: any) {
      console.error("Sign-up error:", error.message);
      toast.error(error.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      toast.success("Signed in with Google!");
      router.push("/");
    } catch (error: any) {
      console.error("Google sign-in error:", error.message);
      toast.error(error.message || "Failed to sign in with Google");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh" }}>
      {/* Left Side (Form Section) */}
      <Grid container sx={{ minHeight: "100vh" }}>
        <Grid
          item
          xs={12}
          sm={8}
          md={6}
          component={motion.div}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: isDarkMode ? "#102A43" : "background.paper",
          }}
        >
          <Container maxWidth="xs">
            <Paper
              elevation={0}
              sx={{ bgcolor: "transparent", p: { xs: 2, sm: 4 }, color: "text.primary" }}
            >
              <Box sx={{ textAlign: "center", mb: 4 }}>
                <Box
                  component="img"
                  src="/logo.png"
                  alt="Raga Vachika"
                  sx={{ height: 80, width: "auto", mb: 2 }}
                />
                <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                  Create Your Account
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                  Join Raga Vachika and start your learning journey!
                </Typography>
              </Box>

              <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <UserForm
                      userData={userData}
                      onChange={handleFieldChange}
                      isSignup={true}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      type="password"
                      label="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      fullWidth
                      required
                      inputProps={{ minLength: 6 }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "&.Mui-focused fieldset": { borderColor: "secondary.main" },
                        },
                        "& .MuiInputLabel-root.Mui-focused": {
                          color: "secondary.main",
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          sx={{ color: "secondary.main", "&.Mui-checked": { color: "secondary.main" } }}
                        />
                      }
                      label="Remember me"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      disabled={loading}
                      fullWidth
                      variant="contained"
                      sx={{ py: 1.5, bgcolor: "secondary.main", "&:hover": { bgcolor: "secondary.dark" } }}
                    >
                      {loading ? <CircularProgress size={24} color="inherit" /> : "Agree & Join"}
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider sx={{ color: "text.secondary", "&::before, &::after": { borderColor: "divider" } }}>
                      OR
                    </Divider>
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={loading}
                      fullWidth
                      variant="outlined"
                      startIcon={
                        <svg width="20" height="20" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                      }
                      sx={{ color: "text.primary", borderColor: "divider", textTransform: "none", py: 1.5, "&:hover": { bgcolor: "action.hover" } }}
                    >
                      Continue with Google
                    </Button>
                  </Grid>
                  <Grid item xs={12} sx={{ textAlign: "center", mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Already on Raga Vachika?{" "}
                      <Link component={NextLink} href="/signin" sx={{ color: "secondary.main", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>
                        Sign in
                      </Link>
                    </Typography>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          </Container>
        </Grid>

        {/* Right Side (Image Section) */}
        <Grid
          item
          xs={false}
          sm={4}
          md={6}
          component={motion.div}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          sx={{
            display: { xs: "none", sm: "flex" },
            alignItems: "center",
            justifyContent: "center",
            bgcolor: isDarkMode ? 'transparent' : 'rgba(0,0,0,0.02)',
          }}
        >
          <Box
            component="img"
            src="/signup.png"
            alt="Professional working"
            sx={{ maxWidth: 500, width: "100%", height: "auto" }}
          />
        </Grid>
      </Grid>
    </Box>
  );
}