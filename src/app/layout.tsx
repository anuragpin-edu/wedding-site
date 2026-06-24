import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Display serif for headings (as deployed on bunnymetanu.com).
const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  // Browser tab titles: "AT - Wedding", "AT - Events", etc. Pages set just the
  // short name; this template adds the "AT - " prefix. (Link-preview titles
  // below use the full names and are unaffected.)
  title: {
    default: "AT - Wedding",
    template: "AT - %s",
  },
  description:
    "Join us as Anurag & Thanmai celebrate their wedding. Haldi, Sangeeth & Mehendi, and the Wedding — August 21–22, 2026 in Georgia.",
  metadataBase: new URL("https://www.bunnymetanu.com"),
  openGraph: {
    title: "Anurag & Thanmai — August 22, 2026",
    description: "We're getting married! Join us for the celebrations.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Anurag & Thanmai — August 22, 2026",
    description: "We're getting married! Join us for the celebrations.",
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "A & T",
  },
  // Favicon + apple icon come from src/app/icon.png and src/app/apple-icon.png.
};

export const viewport: Viewport = {
  themeColor: "#8c2b2b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${display.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
