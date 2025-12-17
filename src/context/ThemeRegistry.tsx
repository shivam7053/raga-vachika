"use client";

import React from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useTheme } from 'next-themes';

// Define your light theme
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0D47A1', // Dark Blue
    },
    secondary: {
      main: '#FF7A00', // Orange
    },
    background: {
      default: '#E3F2FD', // Sky Blue
      paper: '#FFFFFF',
    },
    text: {
      primary: '#0D47A1', // Dark Blue text
      secondary: '#546E7A',
    },
  },
});

// Define your dark theme
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#FF7A00', // Orange
    },
    secondary: {
      main: '#90CAF9', // Light Blue for accents
    },
    background: {
      default: '#0A1929', // Dark Blue
      paper: '#102A43',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B0BEC5',
    },
  },
});

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme === 'dark' ? darkTheme : lightTheme;

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}

