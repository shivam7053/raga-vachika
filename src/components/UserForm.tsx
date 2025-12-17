"use client";
import React from "react";
import { Grid, TextField } from "@mui/material";
import { UserProfile } from "@/types/masterclass"; // ✅ Single source of truth

interface UserFormProps {
  userData: Partial<UserProfile>; // ✅ Changed to Partial to allow incomplete forms
  onChange: (field: keyof UserProfile, value: string) => void;
  isSignup?: boolean;
}

export default function UserForm({
  userData,
  onChange,
  isSignup = true,
}: UserFormProps) {
    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <TextField
                    fullWidth
                    label="Full Name"
                    value={userData.full_name || ""}
                    onChange={(e) => onChange("full_name", e.target.value)}
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
                    required
                />
            </Grid>
            <Grid item xs={12}>
                <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={userData.email || ""}
                    onChange={(e) => onChange("email", e.target.value)}
                    required
                    disabled={!isSignup}
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
                    label="Phone Number"
                    type="tel"
                    value={userData.phone || ""}
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
                    onChange={(e) => onChange("phone", e.target.value)}
                />
            </Grid>
            <Grid item xs={12}>
                <TextField
                    fullWidth
                    label="LinkedIn Profile URL"
                    type="url"
                    value={userData.linkedin || ""}
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
                    onChange={(e) => onChange("linkedin", e.target.value)}
                />
            </Grid>
            <Grid item xs={12}>
                <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Bio"
                    value={userData.bio || ""}
                    onChange={(e) => onChange("bio", e.target.value)}
                    placeholder="Write something about yourself..."
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
                    label="Profile Image URL"
                    type="url"
                    value={userData.avatar_url || ""}
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
                    onChange={(e) => onChange("avatar_url", e.target.value)}
                />
            </Grid>
        </Grid>
    );
}