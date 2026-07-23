import WorkshopLauncher from "@/components/workshop/WorkshopLauncher";
import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic, Space_Grotesk } from "next/font/google";
import "./globals.css";

const arabicFont = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-arabic",
});

const englishFont = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-english",
});

export const metadata: Metadata = {
  title: "MSS | Mechanic Sector System",
  description: "Mechanic Sector Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body
        className={`${arabicFont.variable} ${englishFont.variable} bg-[#0B0B0B] text-white`}
      >
        {children}
              <WorkshopLauncher />
      </body>
    </html>
  );
}