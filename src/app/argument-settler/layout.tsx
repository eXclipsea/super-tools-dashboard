import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Argument Settler — AI Fact-Checker & Debate Judge",
  description:
    "Two sides enter, one verdict leaves. Argument Settler uses GPT-4o to fact-check both claims, weigh the evidence, and deliver an impartial ruling with cited sources.",
  keywords: ["AI argument settler", "AI fact checker", "debate judge app", "AI verdict", "Argument Settler"],
  alternates: { canonical: "https://supertoolz.xyz/argument-settler" },
  openGraph: {
    title: "Argument Settler — AI Fact-Checker & Debate Judge",
    description:
      "Enter two competing claims. AI fact-checks both sides, weighs the evidence, and delivers an impartial verdict with sources — settle any debate in seconds.",
    url: "https://supertoolz.xyz/argument-settler",
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Argument Settler",
  applicationCategory: "UtilitiesApplication",
  url: "https://supertoolz.xyz/argument-settler",
  description:
    "AI-powered debate judge and fact-checker. Accepts two competing claims, analyzes evidence using GPT-4o, and delivers an impartial verdict with confidence level and cited sources. Supports roast mode for entertainment.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  featureList: [
    "Two-sided claim input with category selection",
    "AI fact-checking with source citations",
    "Confidence level for each verdict",
    "Argument history with leaderboard",
    "Screenshot-to-text claim parsing",
  ],
};

export default function ArgumentSettlerLayout({ children }: { children: React.ReactNode }) {
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
