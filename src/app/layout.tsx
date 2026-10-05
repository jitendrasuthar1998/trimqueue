import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "QueueEase — Smart Queue Management for Salons & Clinics",
  description:
    "Zero-install, QR-based live queue management. Beat the wait at your favourite salon or clinic with real-time token tracking.",
  keywords: "queue management, salon booking, clinic token, barber queue, India",
  openGraph: {
    title: "QueueEase",
    description: "Live queue tracking for salons, barbers & clinics",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#0f0f1a" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="bg-qe-bg text-qe-text antialiased">{children}</body>
    </html>
  );
}
