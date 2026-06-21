import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Anurag & Thanmai — August 22, 2026",
  description:
    "Join us as Anurag & Thanmai celebrate their wedding. Haldi, Sangeeth & Mehendi, and the Wedding — August 21–22, 2026 in Georgia.",
  metadataBase: new URL("https://bunnymetanu.com"),
  openGraph: {
    title: "Anurag & Thanmai — August 22, 2026",
    description: "We're getting married! Join us for the celebrations.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
