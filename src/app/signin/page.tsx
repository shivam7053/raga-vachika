"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContexts";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Container,
  Divider,
  FormControlLabel,
  Grid,
  Link,
  Paper,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [keepLoggedIn, setKeepLoggedIn] = useState(true);
  const [loading, setLoading] = useState(false);
  const { signIn, signInWithGoogle } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      router.push("/");
    } catch (error: any) {
      console.error("Sign in failed:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
      router.push("/");
    } catch (error: any) {
      console.error("Google sign-in failed:", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh" }}>
      {/* Left side image */}
      <Grid container sx={{ minHeight: "100vh" }}>
        <Grid
          item
          xs={false}
          sm={4}
          md={6}
          component={motion.div}
          initial={{ opacity: 0, x: -50 }}
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
            src="/login.png"
            alt="Authentication Illustration"
            sx={{ maxWidth: 400, width: "100%", height: "auto" }}
          />
        </Grid>

        {/* Right side form */}
        <Grid
          item
          xs={12}
          sm={8}
          md={6}
          component={motion.div}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <Container maxWidth="xs">
            <Paper
              elevation={0}
              sx={{ bgcolor: "background.paper", p: 4, borderRadius: 3 }}
            >
              <Box sx={{ textAlign: "center", mb: 4 }}>
                <Box
                  component="img"
                  src="/logo.png"
                  alt="Raga Vachika"
                  sx={{ height: 80, width: "auto", mb: 2 }}
                />
                <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                  Sign In
                </Typography>
              </Box>

              <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Button
                      type="button"
                      onClick={handleGoogleLogin}
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

                  <Grid item xs={12}>
                    <Divider sx={{ color: "text.secondary", "&::before, &::after": { borderColor: "divider" } }}>
                      OR
                    </Divider>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      id="email"
                      type="email"
                      label="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      fullWidth
                      required
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
                    <TextField
                      id="password"
                      type="password"
                      label="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      fullWidth
                      required
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
                          checked={keepLoggedIn}
                          onChange={(e) => setKeepLoggedIn(e.target.checked)}
                          sx={{ color: "secondary.main", "&.Mui-checked": { color: "secondary.main" } }}
                        />
                      }
                      label="Keep me logged in"
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
                      {loading ? <CircularProgress size={24} color="inherit" /> : "Sign In"}
                    </Button>
                  </Grid>

                  <Grid item xs={12} sx={{ textAlign: "center" }}>
                    <Typography variant="body2" color="grey.400">
                      New to Raga Vachika?
                      <Link component={NextLink} href="/signup" sx={{ color: "secondary.main", textDecoration: "none", "&:hover": { textDecoration: "underline" }, ml: 0.5 }}>
                        Join now
                      </Link>
                    </Typography>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          </Container>
        </Grid>
      </Grid>
    </Box>
  );
}
