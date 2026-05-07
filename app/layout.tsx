import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthProvider";
import Navbar from "@/components/layout/Navbar";
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

export const metadata: Metadata = {
  title: "Bedouin – Authentic Saudi Experiences",
  description:
    "Discover authentic Saudi farm stays, camel herding, and Bedouin desert experiences. Connect with local hosts across Saudi Arabia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${playfairDisplay.variable} antialiased`}>
        <AuthProvider>
          <Navbar />
          {children}
          <AnnouncementPopup />
        </AuthProvider>
      </body>
    </html>
  );
}
