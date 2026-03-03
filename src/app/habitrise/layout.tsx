import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HabitRise — AI-Personalized 30-Day Habit Builder",
  description:
    "Tell HabitRise your goal, current level, obstacles, and motivation. GPT-4o generates a fully unique day-by-day habit plan customized to you — not a generic template. Free to use.",
  keywords: ["AI habit tracker", "habit builder app", "30 day habit plan AI", "personalized habit plan", "GPT-4o habit coach"],
  alternates: { canonical: "https://supertoolz.xyz/habitrise" },
  openGraph: {
    title: "HabitRise — AI-Personalized Habit Plan Generator",
    description:
      "Share your habit goal, current level, obstacles, and motivation. Get a fully unique AI-generated day-by-day plan built just for you.",
    url: "https://supertoolz.xyz/habitrise",
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "HabitRise",
  applicationCategory: "HealthApplication",
  url: "https://supertoolz.xyz/habitrise",
  description:
    "An AI-powered habit plan generator. Users describe their habit goal, starting point, target, preferred time of day, obstacles, and motivation. GPT-4o creates a truly unique daily plan with specific tasks for each day.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  featureList: [
    "Detailed habit goal input form",
    "AI-generated unique daily tasks (not templates)",
    "Adjustable plan length from 7 to 90 days",
    "Daily task completion tracking with progress bar",
    "Persistent plan storage across sessions",
  ],
};

export default function HabitRiseLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      {children}
    </>
  );
}
