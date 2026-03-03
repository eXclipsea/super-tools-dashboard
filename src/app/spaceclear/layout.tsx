import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SpaceClear — AI Room Clutter Analyzer & Decluttering Planner",
  description:
    "Take a photo of any messy room. SpaceClear uses GPT-4o vision to analyze the clutter level and generate a step-by-step, prioritized decluttering task list — with a built-in 10-minute timer.",
  keywords: ["AI decluttering app", "room clutter analyzer", "GPT-4o vision home", "decluttering task list AI", "SpaceClear"],
  alternates: { canonical: "https://supertoolz.xyz/spaceclear" },
  openGraph: {
    title: "SpaceClear — AI Decluttering Planner",
    description:
      "Photo your room. AI analyzes the clutter and generates a prioritized, step-by-step decluttering plan. Built-in timer keeps you on track.",
    url: "https://supertoolz.xyz/spaceclear",
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "SpaceClear",
  applicationCategory: "LifestyleApplication",
  url: "https://supertoolz.xyz/spaceclear",
  description:
    "AI room decluttering assistant. GPT-4o vision analyzes room photos to determine clutter level (light/moderate/heavy), then generates a prioritized task list with high/medium/low priority tasks and practical decluttering tips.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  featureList: [
    "Room photo analysis via GPT-4o vision",
    "Clutter level assessment (light, moderate, heavy)",
    "Prioritized decluttering task list",
    "Built-in 10-minute countdown timer",
    "Task completion tracking",
  ],
};

export default function SpaceClearLayout({ children }: { children: React.ReactNode }) {
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
