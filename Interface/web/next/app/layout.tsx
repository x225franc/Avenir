import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../components/contexts/AuthContext";
import LayoutWrapper from "../components/LayoutWrapper";
import { UiShellProvider } from "../components/contexts/UiShellContext";
import { defaultMetadata } from "@/components/lib/seo";
import type { Viewport } from "next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = defaultMetadata;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <UiShellProvider initialVisibility={{ showHeader: true, showFooter: true }}>
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
          </UiShellProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
