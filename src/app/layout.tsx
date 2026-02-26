import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Super Tools - 5 AI-Powered Productivity Apps | Receipt Scanner, Voice Tasks & More",
  description: "Super Tools: 5 AI-powered apps in one dashboard. Scan receipts instantly, organize tasks with voice, settle arguments with facts, sync writing style, and manage your kitchen. Boost productivity today.",
  keywords: "AI tools, receipt scanner, voice to text, task organizer, fact checker, writing assistant, kitchen inventory, productivity apps, artificial intelligence, automation tools, expense tracking, voice memos, debate resolver, persona sync, recipe generator",
  authors: [{ name: "Landon Li" }],
  creator: "Landon Li",
  publisher: "Super Tools",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://supertoolz.xyz'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://supertoolz.xyz',
    title: 'Super Tools - 5 AI-Powered Productivity Apps',
    description: '5 AI apps in one: Scan receipts, organize tasks with voice, settle arguments with facts, sync writing style, and manage your kitchen.',
    siteName: 'Super Tools',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Super Tools - AI Productivity Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Super Tools - 5 AI-Powered Productivity Apps',
    description: 'Scan receipts, organize tasks with voice, settle arguments with facts, sync writing style, and manage your kitchen.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <script async src="https://js.stripe.com/v3/" />
      </body>
    </html>
  );
}
