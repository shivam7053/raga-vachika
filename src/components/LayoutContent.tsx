"use client";

import { MantineProvider, createTheme } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { useTheme } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/NavBar";
import Footer from "@/components/Footer";

export default function LayoutContent({ children }: { children: React.ReactNode }) {
  const { colorScheme } = useTheme();

  const theme = createTheme({
    primaryColor: "blue",
    fontFamily: "Inter, sans-serif",
  });

  return (
    <MantineProvider theme={theme} defaultColorScheme={colorScheme}>
      <Notifications position="top-right" />
      <AuthProvider>
        {/* top-level wrapper should NOT create a stacking context (no transform, no opacity) */}
        <div
          style={{
            display: "flex",
            minHeight: "100vh",
            overflow: "visible",
            position: "relative", // make layout relative but don't set transform
          }}
        >
          {/* Fixed Sidebar - keep it fixed but not creating transform */}
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              height: "100vh",
              width: "300px",
              zIndex: 2000, // sidebar layer
              pointerEvents: "auto",
            }}
          >
            <Navbar />
          </div>

          {/* Main content area (below portal z-index) */}
          <div
            style={{
              marginLeft: "300px",
              flex: 1,
              display: "flex",
              flexDirection: "column",
              minHeight: "100vh",
              backgroundColor: colorScheme === "dark" ? "#1a1b1e" : "#f8f9fa",
              transition: "background 0.3s ease",
              overflow: "visible",
              zIndex: 1,
            }}
          >
            <main style={{ flex: 1, padding: "2rem", boxSizing: "border-box" }}>
              {children}
            </main>

            <Footer />
          </div>
        </div>
      </AuthProvider>
    </MantineProvider>
  );
}
