import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContexts";
import { ThemeProvider } from "@/context/ThemeProvider";
import ToasterClient from "@/components/ToasterClient";
import ThemeRegistry from "@/context/ThemeRegistry";
import { CelebrationProvider } from "@/context/CelebrationContext";
import CelebrationClient from "@/components/CelebrationClient";

export const metadata: Metadata = {
  title: "Raga Vachika",
  description: "Education Platform for Kids of 5 to 12 class",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <ThemeRegistry>
            <CelebrationProvider>
              <AuthProvider>
                <ToasterClient />
                <CelebrationClient />
                <Header />
                <main>{children}</main>
                <Footer />
              </AuthProvider>
            </CelebrationProvider>
          </ThemeRegistry>
        </ThemeProvider>
      </body>
    </html>
  );
}
