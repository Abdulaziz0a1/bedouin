import type { Metadata } from "next";
import { DM_Sans, Playfair_Display, Cairo } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthProvider";
import { LanguageProvider } from "@/context/LanguageProvider";
import Navbar from "@/components/layout/Navbar";
import PageTransition from "@/components/layout/PageTransition";
import AnnouncementPopup from "@/components/notifications/AnnouncementPopup";

const dmSans = DM_Sans({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "600", "800"],
  display: "swap",
});

const cairo = Cairo({
  variable: "--font-arabic",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bedouin – Authentic Saudi Experiences",
  description:
    "Discover authentic Saudi farm stays, camel herding, and Bedouin desert experiences. Connect with local hosts across Saudi Arabia.",
  icons: {
    icon: [
      { url: "/ultra-logo.png", type: "image/png" },
    ],
    shortcut: "/ultra-logo.png",
    apple: { url: "/ultra-logo.png", type: "image/png" },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${playfairDisplay.variable} ${cairo.variable} antialiased`}>
        <LanguageProvider>
          <AuthProvider>
            <Navbar />
            <PageTransition>
              {children}
            </PageTransition>
            <AnnouncementPopup />
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
