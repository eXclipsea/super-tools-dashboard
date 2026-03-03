import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
});

const BASE_URL = "https://supertoolz.xyz";

export const metadata: Metadata = {
  title: {
    default: "Super Tools — 10 AI-Powered Productivity Apps",
    template: "%s | Super Tools",
  },
  description:
    "Super Tools is a free suite of 10 AI-powered productivity apps: receipt scanning, pantry management, writing style analysis, task planning, argument fact-checking, text formalization, restaurant comparison, habit building, travel packing, and room decluttering — all powered by GPT-4o.",
  keywords: [
    "AI productivity tools",
    "GPT-4o apps",
    "receipt scanner AI",
    "AI habit tracker",
    "restaurant comparison AI",
    "smart packing list",
    "voice to task AI",
    "AI writing assistant",
    "AI pantry manager",
    "Super Tools",
  ],
  authors: [{ name: "Landon Li", url: BASE_URL }],
  creator: "Landon Li",
  publisher: "Super Tools",
  metadataBase: new URL(BASE_URL),
  alternates: { canonical: BASE_URL },
  openGraph: {
    type: "website",
    url: BASE_URL,
    siteName: "Super Tools",
    title: "Super Tools — 10 AI-Powered Productivity Apps",
    description:
      "10 focused AI tools that handle receipts, cooking, writing, tasks, arguments, habits, dining, packing, decluttering, and more — so you can focus on what matters.",
    images: [
      {
        url: `${BASE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Super Tools — AI Productivity Suite powered by GPT-4o",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Super Tools — 10 AI-Powered Productivity Apps",
    description:
      "10 focused AI tools powered by GPT-4o. Receipts, cooking, writing, tasks, arguments, habits, dining, packing, and more.",
    images: [`${BASE_URL}/og-image.png`],
    creator: "@supertools",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "productivity",
};

const softwareAppSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Super Tools",
  applicationCategory: "ProductivityApplication",
  applicationSubCategory: "AI Tools Suite",
  operatingSystem: "Web, macOS, Windows",
  url: BASE_URL,
  description:
    "A suite of 10 AI-powered productivity tools: QuickReceipt, Kitchen Commander, PersonaSync, FlowMeet, Argument Settler, Formalize, DineDecide, HabitRise, PackLight, and SpaceClear.",
  creator: { "@type": "Person", name: "Landon Li" },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
    description: "Free desktop app and web access.",
  },
  featureList: [
    "AI receipt scanning and expense categorization",
    "Pantry photo scanning and recipe generation",
    "Visual calendar with AI-powered task suggestions",
    "Writing style analysis and AI message drafting",
    "AI-powered argument fact-checking with sources",
    "Text formalization into multiple literary styles",
    "Restaurant comparison with AI scoring",
    "Personalized AI habit plan generation",
    "Smart travel packing list with capsule wardrobe",
    "Room clutter analysis and decluttering task list",
  ],
  screenshot: `${BASE_URL}/og-image.png`,
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "124",
    bestRating: "5",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Super Tools",
  url: BASE_URL,
  logo: `${BASE_URL}/logo.png`,
  sameAs: ["https://github.com/eXclipsea"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#0a0a0a" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        {children}
        <script async src="https://js.stripe.com/v3/" />
      </body>
    </html>
  );
}
